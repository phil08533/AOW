#!/usr/bin/env python3
"""Fetch Night of the Living Dead (1968, public domain) for the Angler's Den TV and cut it into small parts.

  python3 tools/fetch_movie.py                 # download from the Internet Archive, then encode
  python3 tools/fetch_movie.py some/file.mp4   # encode a copy you already have

Writes dist/video/notld/pNN.mp4 (H.264 + AAC, 480x360, keyframe every 2 s, about 5 minutes each so every
part stays under the 15 MB per-file limit for published artifacts) and dist/video/notld/parts.json, which the
game reads (src/tvden.js). Needs ffmpeg and ffprobe.
"""
import json, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'dist', 'video', 'notld')
SOURCES = [
    'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
    'https://archive.org/download/night_of_the_living_dead_dvd/Night.mp4',
]
PART_SECONDS = 300


def download(dst):
    for url in SOURCES:
        try:
            print('downloading', url)
            urllib.request.urlretrieve(url, dst)
            if os.path.getsize(dst) > 50_000_000:
                return dst
        except Exception as e:
            print('  failed:', e)
    sys.exit('could not download the film; pass a local copy instead')


def main():
    os.makedirs(OUT, exist_ok=True)
    src = sys.argv[1] if len(sys.argv) > 1 else download(os.path.join(OUT, 'source.mp4'))
    for f in os.listdir(OUT):
        if f.startswith('p') and f.endswith('.mp4'):
            os.remove(os.path.join(OUT, f))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src,
                    '-vf', 'scale=480:360:force_original_aspect_ratio=decrease,pad=480:360:(ow-iw)/2:(oh-ih)/2',
                    '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', '28', '-maxrate', '300k', '-bufsize', '600k',
                    '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
                    '-c:a', 'aac', '-b:a', '48k', '-ac', '1',
                    '-f', 'segment', '-segment_time', str(PART_SECONDS), '-reset_timestamps', '1',
                    '-segment_format_options', 'movflags=+faststart',
                    os.path.join(OUT, 'p%02d.mp4')], check=True)
    parts = []
    for f in sorted(x for x in os.listdir(OUT) if x.startswith('p') and x.endswith('.mp4')):
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(OUT, f)],
                           capture_output=True, text=True, check=True).stdout.strip()
        parts.append({'f': f, 'd': round(float(d), 3)})
        print(f, parts[-1]['d'], 's', os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
    with open(os.path.join(OUT, 'parts.json'), 'w') as fh:
        json.dump({'title': 'Night of the Living Dead (1968)', 'parts': parts}, fh)
    if src.endswith('source.mp4'):
        os.remove(src)
    print('wrote', len(parts), 'parts to', OUT)


if __name__ == '__main__':
    main()
