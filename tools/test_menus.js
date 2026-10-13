const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
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
  const port = 9334;
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

    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:8080/' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const sendSession = (method, params = {}) => send(method, params, sessionId);

    await sendSession('Page.enable');
    await sendSession('Runtime.enable');

    for (let i = 0; i < 50; i++) {
      const check = await sendSession('Runtime.evaluate', {
        expression: `!!(document.getElementById('charBtn') && typeof window.parseCharData === 'function')`,
        returnByValue: true
      });
      if (check.result && check.result.value) break;
      await new Promise(r => setTimeout(r, 300));
    }

    // Start game
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        cloudDone = true;
        $('playBtn').click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Open HUD menu dropdown
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const toggle = document.getElementById('menuToggle');
        if (toggle) toggle.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const shotHud = await sendSession('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2/hud_menu_logout.png', Buffer.from(shotHud.data, 'base64'));
    console.log('Saved hud_menu_logout.png');

    // Open pause screen and scroll to bottom so Resume and Logout button are visible
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        window.setState('pause');
        const sheet = document.querySelector('#pause .sheet');
        if (sheet) sheet.scrollTop = sheet.scrollHeight;
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const shotPause = await sendSession('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2/pause_sheet_logout.png', Buffer.from(shotPause.data, 'base64'));
    console.log('Saved pause_sheet_logout.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
