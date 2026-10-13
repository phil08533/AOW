// Live Multiplayer Companion Bot for Art of War: Setting Sun
// Signs into the WebSocket server so live player tracking, Codex "Who's online", and 3D player presence are always active!
const { WebSocket } = require('ws');

const SERVER_URL = process.env.WS_URL || 'ws://localhost:8080/ws';
const BOT_NICK = process.env.BOT_NAME || 'Echo-7';
const BOT_LEVEL = 25;
const BOT_COLOR = '#4fd2ff';
// Heavy armor, master cape, spiked helm
const BOT_LOOK = 'heavy,master,spike,0.0.0.0.0.m,';

let ws = null;
let running = true;
let x = 2.5, y = 0.1, z = -7.0, yaw = 0;
let phase = 0;

function connect() {
  if (!running) return;
  console.log(`[Bot] Connecting to ${SERVER_URL} as ${BOT_NICK}...`);
  ws = new WebSocket(SERVER_URL);

  ws.on('open', () => {
    console.log(`[Bot] Connected! Signed into live player tracking.`);
    sendPresence();
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'peers' && Array.isArray(msg.peers)) {
        for (const p of msg.peers) {
          const pr = p.presence;
          if (pr && pr.msg && pr.nick !== BOT_NICK && (!pr.lastReplied || Date.now() - pr.lastReplied > 5000)) {
            const txt = pr.msg.toLowerCase();
            if (txt.includes('hi') || txt.includes('hello') || txt.includes('hey') || txt.includes('bot')) {
              pr.lastReplied = Date.now();
              setTimeout(() => {
                sendChat(`Hey ${pr.nick}! Standing by for orders.`);
              }, 1200);
            }
          }
        }
      }
    } catch (_) {}
  });

  ws.on('close', () => {
    console.log('[Bot] Disconnected. Reconnecting in 3s...');
    if (running) setTimeout(connect, 3000);
  });

  ws.on('error', (err) => {
    console.warn('[Bot] Connection error:', err.message);
    try { ws.close(); } catch (_) {}
  });
}

function sendPresence(chatText) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  phase += 0.05;
  const curX = x + Math.sin(phase * 0.3) * 0.6;
  const curZ = z + Math.cos(phase * 0.3) * 0.4;
  const curYaw = yaw + Math.sin(phase * 0.2) * 0.4;

  const payload = {
    type: 'presence',
    presence: {
      nick: BOT_NICK,
      col: BOT_COLOR,
      lvl: BOT_LEVEL,
      rd: 0,
      lv: 'earth',
      lk: BOT_LOOK,
      x: +curX.toFixed(2),
      y: +y.toFixed(2),
      z: +curZ.toFixed(2),
      yaw: +curYaw.toFixed(3),
      pt: 0,
      msg: chatText || undefined,
      mt: chatText ? Date.now() : undefined,
      sh: chatText ? 1 : 0
    }
  };
  ws.send(JSON.stringify(payload));
}

function sendChat(text) {
  sendPresence(text);
}

// Heartbeat loop every 200ms
setInterval(() => {
  sendPresence();
}, 200);

connect();

process.on('SIGINT', () => { running = false; if (ws) ws.close(); process.exit(0); });
process.on('SIGTERM', () => { running = false; if (ws) ws.close(); process.exit(0); });
