const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = '/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2';

async function getWsUrl(port) {
  for (let i = 0; i < 30; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/version`, res => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch (_) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error('Failed to connect to Chrome CDP');
}

async function run() {
  const port = 9568;
  console.log('Spawning headless Chrome on port', port);
  const chrome = spawn('google-chrome', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1280,720',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
      const payload = { id: msgId, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });

    const targets = await send('Target.getTargets');
    let pageTarget = targets.targetInfos.find(t => t.type === 'page');
    if (!pageTarget) {
      const newTarget = await send('Target.createTarget', { url: 'about:blank' });
      pageTarget = { targetId: newTarget.targetId };
    }
    const { sessionId } = await send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);

    console.log('Navigating to http://localhost:8080/ ...');
    await send('Page.navigate', { url: 'http://localhost:8080/' }, sessionId);
    await new Promise(r => setTimeout(r, 2000));

    const evalCode = async (expr) => {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      }, sessionId);
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result ? res.result.value : undefined;
    };

    const takeScreenshot = async (filename) => {
      await evalCode(`(() => {
        const p = document.getElementById('pause'); if (p) p.style.display = 'none';
        const s = document.getElementById('start'); if (s) s.style.display = 'none';
        const l = document.getElementById('lookPick'); if (l) l.remove();
        const d = document.getElementById('dlg'); if (d) d.hidden = true;
        const c = document.getElementById('cut'); if (c) c.hidden = true;
        const G = window.__game;
        if (window.CUT) window.CUT.on = false;
        if (G && G.S && G.S.flags) G.S.flags.fortIntro = 1;
        if (G && G.ENV) {
          G.ENV.forceHour = 12;
          G.ENV.forceWx = 'clear';
          G.ENV.flash = 0;
        }
        if (G && G.camera && G.player) {
          G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
          G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
        }
      })()`);
      await new Promise(r => setTimeout(r, 600));
      const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
      const buf = Buffer.from(shot.data, 'base64');
      const outPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(outPath, buf);
      console.log('Saved screenshot:', filename);
    };

    // 1. Enter Game and travel to Fort Ironrock
    console.log('Starting game and traveling to Fort Ironrock...');
    const initRes = await evalCode(`(async () => {
      window.cloudDone = true;
      try {
        const prefs = JSON.parse(localStorage.getItem('aow-prefs') || '{}');
        prefs.lookPicked = 1; prefs.subs = true; prefs.gfx = 2; prefs.pix = 2;
        localStorage.setItem('aow-prefs', JSON.stringify(prefs));
      } catch (_) {}
      const lookGo = document.getElementById('lookGo');
      if (lookGo) lookGo.click();
      const pick = document.getElementById('lookPick');
      if (pick) pick.remove();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.click();
      await new Promise(r => setTimeout(r, 1200));
      const G = window.__game;
      if (G && G.S) {
        G.S.flags = G.S.flags || {};
        G.S.flags.fortIntro = 1;
      }
      if (G && G.setState) G.setState('play');
      const startEl = document.getElementById('start');
      if (startEl) startEl.hidden = true;
      if (G && G.loadLevel) {
        G.loadLevel('fort');
        await new Promise(r => setTimeout(r, 1200));
      }
      if (window.CUT) window.CUT.on = false;
      const c = document.getElementById('cut'); if (c) c.hidden = true;
      if (G && G.ENV) {
        G.ENV.forceHour = 12;
        G.ENV.forceWx = 'clear';
        G.ENV.flash = 0;
      }
      return {
        level: G.LEVEL ? G.LEVEL.id : null,
        levelName: G.LEVEL ? G.LEVEL.name : null,
        playerPos: G.player ? [G.player.pos.x, G.player.pos.y, G.player.pos.z] : null
      };
    })()`);
    console.log('Fort Ironrock Initialized:', initRes);
    await new Promise(r => setTimeout(r, 1000));

    // 2. Position inside Fort Ironrock with wide view of the perimeter wall
    console.log('Capturing wide courtyard view of perimeter wall inside Fort Ironrock...');
    await evalCode(`(() => {
      const G = window.__game;
      if (window.CUT) window.CUT.on = false;
      const c = document.getElementById('cut'); if (c) c.hidden = true;
      // Stand inside base at [0, -10], looking West toward the perimeter wall at x: -23.5
      G.player.pos.set(-5, G.groundH(-5, -10), -10);
      G.player.yaw = Math.PI / 2; // Looking West
      G.player.pitch = 0.02;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
    })()`);
    await takeScreenshot('fort_ironrock_perimeter_wall_wide.png');

    // 3. Position close to the perimeter wall for clear view of bolted iron panels
    console.log('Capturing close-up view of perimeter wall panels...');
    await evalCode(`(() => {
      const G = window.__game;
      if (window.CUT) window.CUT.on = false;
      const c = document.getElementById('cut'); if (c) c.hidden = true;
      // Stand at x: -18.5, z: -10 (5 meters away from the perimeter wall at x: -23.5)
      G.player.pos.set(-18.5, G.groundH(-18.5, -10), -10);
      G.player.yaw = Math.PI / 2; // Looking West directly at wall face
      G.player.pitch = 0.0;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
    })()`);
    await takeScreenshot('fort_ironrock_perimeter_wall_closeup.png');

    // 4. View from South wall looking across base towards North gate
    console.log('Capturing view from perimeter wall perimeter...');
    await evalCode(`(() => {
      const G = window.__game;
      if (window.CUT) window.CUT.on = false;
      const c = document.getElementById('cut'); if (c) c.hidden = true;
      // Stand near South wall at [0, -28], looking North at [0, 10]
      G.player.pos.set(0, G.groundH(0, -28), -28);
      G.player.yaw = Math.PI; // Looking North toward base center
      G.player.pitch = 0.05;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
    })()`);
    await takeScreenshot('fort_ironrock_perimeter_wall_courtyard.png');

    console.log('All Fort Ironrock wall screenshots captured successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
