const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

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
  const port = 9333;
  const chrome = spawn('google-chrome', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1280,800',
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

    // Create target page
    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:8080/' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    const sendSession = (method, params = {}) => send(method, params, sessionId);

    await sendSession('Page.enable');
    await sendSession('Runtime.enable');

    console.log('Waiting for game page to load...');
    for (let i = 0; i < 50; i++) {
      const check = await sendSession('Runtime.evaluate', {
        expression: `!!(document.getElementById('charBtn') && typeof window.parseCharData === 'function')`,
        returnByValue: true
      });
      if (check.result && check.result.value) {
        console.log('Game page and scripts ready!');
        break;
      }
      await new Promise(r => setTimeout(r, 300));
    }

    // Test 1: Open characters panel
    console.log('Opening Characters panel...');
    const res1 = await sendSession('Runtime.evaluate', {
      expression: `(async () => {
        const btn = document.getElementById('charBtn');
        if (!btn) return { ok: false, err: 'charBtn not found' };
        btn.click();
        await new Promise(r => setTimeout(r, 600));
        const box = document.getElementById('charBox');
        const filter = document.getElementById('charFilter');
        return {
          ok: true,
          boxVisible: !box.hidden,
          hasFilter: !!filter,
          filterPlaceholder: filter ? filter.placeholder : null,
          boxText: box.textContent,
          hasClaude: /claude/i.test(box.textContent),
          hasDownloadBtn: !!Array.from(box.querySelectorAll('button')).find(b => b.textContent.includes('Download file')),
          hasUploadBtn: !!Array.from(box.querySelectorAll('button')).find(b => b.textContent.includes('Upload file'))
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Characters panel check:', res1.result.value);

    // Test 2: Import Sirorgfalcon save code
    const code = fs.readFileSync(path.join(__dirname, '..', 'sirorgfalcon_code.txt'), 'utf8').trim();
    console.log('Importing Sirorgfalcon save code...');
    const res2 = await sendSession('Runtime.evaluate', {
      expression: `(async () => {
        try {
          const code = ${JSON.stringify(code)};
          const c = parseCharData(code);
          c.t = Date.now();
          playChar(c);
          await new Promise(r => setTimeout(r, 400));
          const gs = window.getGameState();
          const S = gs.S;
          return {
            nick: S.nick,
            lvl: S.lvl,
            cr: S.cr,
            bank: S.bank,
            rooms: S.ship.rooms,
            gunsCount: S.guns.length,
            meleesCount: S.melees.length,
            rod: S.rod,
            clip: S.clip,
            activeTrack: S.track
          };
        } catch (e) {
          return { err: e.message, stack: e.stack };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Character import result:', res2.result ? res2.result.value : res2);

    // Take screenshot of start screen with Sirorgfalcon loaded
    const shot1 = await sendSession('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2/char_select_screen.png', Buffer.from(shot1.data, 'base64'));
    console.log('Saved char_select_screen.png');

    // Test 3: Start game and check pause menu
    console.log('Entering game...');
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        cloudDone = true;
        $('playBtn').click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Open pause screen
    console.log('Opening pause menu...');
    const res3 = await sendSession('Runtime.evaluate', {
      expression: `(async () => {
        try {
          window.setState('pause');
          await new Promise(r => setTimeout(r, 300));
          const logoutBtn = document.getElementById('logoutBtn');
          const logoutHudBtn = document.getElementById('logoutHudBtn');
          const gs = window.getGameState();
          return {
            state: gs.state,
            hasLogoutBtn: !!logoutBtn,
            logoutBtnText: logoutBtn ? logoutBtn.textContent : null,
            hasLogoutHudBtn: !!logoutHudBtn
          };
        } catch (e) {
          return { err: e.message };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Pause screen check:', res3.result ? res3.result.value : res3);

    // Screenshot pause screen
    const shot2 = await sendSession('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2/pause_logout_screen.png', Buffer.from(shot2.data, 'base64'));
    console.log('Saved pause_logout_screen.png');

    // Test 4: Click Logout
    console.log('Clicking Logout...');
    const res4 = await sendSession('Runtime.evaluate', {
      expression: `(async () => {
        try {
          document.getElementById('logoutBtn').click();
          await new Promise(r => setTimeout(r, 400));
          const gs = window.getGameState();
          return {
            state: gs.state,
            startHidden: document.getElementById('start').hidden,
            charBoxHidden: document.getElementById('charBox').hidden,
            saveNote: document.getElementById('saveNote').textContent
          };
        } catch (e) {
          return { err: e.message };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Logout result:', res4.result ? res4.result.value : res4);

    // Screenshot after logout
    const shot3 = await sendSession('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2/logged_out_screen.png', Buffer.from(shot3.data, 'base64'));
    console.log('Saved logged_out_screen.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
