#!/usr/bin/env python3
import asyncio
import base64
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "recordings")
os.makedirs(OUT_DIR, exist_ok=True)

CUTSCENES = [
    {
        "id": "prologue",
        "name": "Prologue",
        "url": "http://localhost:8080/?cutscene=prologue",
        "music": os.path.join(ROOT, "dist", "music", "hymn.mp3"),
        "max_duration": 95,
        "output": os.path.join(OUT_DIR, "Art_of_War_Prologue.mp4"),
    },
    {
        "id": "lounge",
        "name": "Starlight Lounge",
        "url": "http://localhost:8080/?cutscene=lounge",
        "music": os.path.join(ROOT, "dist", "music", "nebula.mp3"),
        "max_duration": 34,
        "output": os.path.join(OUT_DIR, "Art_of_War_Starlight_Lounge.mp4"),
    },
    {
        "id": "ending",
        "name": "The Ending & Credits",
        "url": "http://localhost:8080/?cutscene=ending",
        "music": os.path.join(ROOT, "dist", "music", "hymn.mp3"),
        "max_duration": 36,
        "output": os.path.join(OUT_DIR, "Art_of_War_The_Ending.mp4"),
    },
]


async def record_scene(scene):
    print(f"\n==========================================")
    print(f"🎬 Starting recording: {scene['name']}")
    print(f"==========================================")
    
    user_data = f"/tmp/chrome_rec_{scene['id']}"
    if os.path.exists(user_data):
        shutil.rmtree(user_data, ignore_errors=True)

    chrome_cmd = [
        "google-chrome",
        "--headless=new",
        "--remote-debugging-port=9222",
        "--window-size=1280,720",
        f"--user-data-dir={user_data}",
        "--no-first-run",
        "--autoplay-policy=no-user-gesture-required",
        scene["url"]
    ]

    chrome_proc = subprocess.Popen(chrome_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    raw_video = f"/tmp/raw_{scene['id']}.mp4"
    
    try:
        # Wait for debugging port
        ws_url = None
        for _ in range(40):
            try:
                res = urllib.request.urlopen("http://localhost:9222/json", timeout=1)
                targets = json.loads(res.read().decode())
                for t in targets:
                    if t.get("type") == "page" and "webSocketDebuggerUrl" in t:
                        ws_url = t["webSocketDebuggerUrl"]
                        break
                if ws_url:
                    break
            except Exception:
                pass
            time.sleep(0.2)

        if not ws_url:
            raise RuntimeError("Could not connect to Chrome DevTools port 9222")

        import websockets
        async with websockets.connect(ws_url, max_size=10**8) as ws:
            # Configure viewport
            await ws.send(json.dumps({
                "id": 1,
                "method": "Emulation.setDeviceMetricsOverride",
                "params": {"width": 1280, "height": 720, "deviceScaleFactor": 1, "mobile": False}
            }))
            await ws.send(json.dumps({"id": 2, "method": "Page.enable"}))
            await ws.send(json.dumps({"id": 3, "method": "Runtime.enable"}))
            
            # Start screencast at 30 fps
            await ws.send(json.dumps({
                "id": 4,
                "method": "Page.startScreencast",
                "params": {"format": "jpeg", "quality": 85, "maxWidth": 1280, "maxHeight": 720, "everyNthFrame": 1}
            }))

            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-framerate", "30",
                "-f", "image2pipe",
                "-vcodec", "mjpeg",
                "-i", "-",
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-pix_fmt", "yuv420p",
                raw_video
            ]
            ffmpeg_proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            frame_count = 0
            t_start = time.time()
            msg_id = 100
            
            print(f"Recording video frames...")
            while True:
                elapsed = time.time() - t_start
                if elapsed > scene["max_duration"]:
                    print(f"Reached max duration ({scene['max_duration']}s). Finishing.")
                    break

                try:
                    raw_msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    data = json.loads(raw_msg)
                    if data.get("method") == "Page.screencastFrame":
                        sess_id = data["params"]["sessionId"]
                        msg_id += 1
                        await ws.send(json.dumps({
                            "id": msg_id,
                            "method": "Page.screencastFrameAck",
                            "params": {"sessionId": sess_id}
                        }))
                        img_bytes = base64.b64decode(data["params"]["data"])
                        ffmpeg_proc.stdin.write(img_bytes)
                        frame_count += 1
                        if frame_count % 90 == 0:
                            print(f"  [{scene['name']}] Captured {frame_count} frames ({elapsed:.1f}s)...")
                except asyncio.TimeoutError:
                    if frame_count > 30:
                        break

            ffmpeg_proc.stdin.close()
            ffmpeg_proc.wait()
            print(f"Video capture complete: {frame_count} frames.")

            # Mux music soundtrack
            print(f"Muxing music track ({os.path.basename(scene['music'])})...")
            duration = frame_count / 30.0
            mux_cmd = [
                "ffmpeg", "-y",
                "-i", raw_video,
                "-ss", "0",
                "-t", f"{duration:.2f}",
                "-i", scene["music"],
                "-c:v", "copy",
                "-c:a", "aac",
                "-b:a", "192k",
                "-shortest",
                scene["output"]
            ]
            subprocess.run(mux_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"✅ Saved final video: {scene['output']} ({duration:.1f}s)")
            
    finally:
        try:
            chrome_proc.terminate()
            chrome_proc.wait(timeout=3)
        except Exception:
            chrome_proc.kill()
        if os.path.exists(raw_video):
            os.remove(raw_video)
        shutil.rmtree(user_data, ignore_errors=True)


async def main():
    print(f"Recording destination directory: {OUT_DIR}")
    for sc in CUTSCENES:
        await record_scene(sc)
        await asyncio.sleep(2)
    print("\n🎉 ALL CUTSCENES SUCCESSFULLY RECORDED!")
    print(f"Check your files in: {OUT_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
