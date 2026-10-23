// Blork Server: a player-hosted Art of War server.
// Players connect over WebSocket. Public:  GET /info (name, rules, players, locked).
// Admin API for the server window: /admin/*, bound to 127.0.0.1 only and needs the admin token from config.
'use strict';
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const CFG_PATH = process.env.GD_CONFIG || path.join(__dirname, 'server-config.json');
const DEFAULTS = { name: 'My Art of War Server', desc: '', public: true, maxPlayers: 16, port: 7777, adminPort: 7778,
  pass: null, // { salt, hash } — never the plain password
  rules: { pvp: 'off', friendlyFire: false, difficulty: 1, xpMult: 1, lootMult: 1, paths: 'both', civilians: true, startWorld: 'earth', devGear: false, locks: {} },
  bans: [], adminToken: null,
  lookup: 'https://blork-lookup.philip08533gonzales.workers.dev', listKey: null, code: null };
const cfg = Object.assign({}, DEFAULTS, fs.existsSync(CFG_PATH) ? JSON.parse(fs.readFileSync(CFG_PATH, 'utf8')) : {});
cfg.rules = Object.assign({}, DEFAULTS.rules, cfg.rules);
if (!cfg.adminToken) cfg.adminToken = crypto.randomBytes(24).toString('hex');
const save = () => fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2));
if (/REPLACE/.test(cfg.lookup || '')) cfg.lookup = DEFAULTS.lookup;
save();

// ---------- names ----------
const BAD = ['fuck', 'shit', 'cunt', 'nigg', 'fag', 'retard', 'rape', 'nazi', 'hitler', 'whore', 'slut', 'bitch', 'dick', 'cock', 'pussy', 'porn', 'kkk', 'chink', 'spic', 'kike'];
const norm = s => String(s || '').toLowerCase().replace(/[0@]/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't').replace(/[^a-z]/g, '');
const badName = s => BAD.some(w => norm(s).includes(w));
const cleanNick = s => { s = String(s || '').replace(/[^\w \-.]/g, '').trim().slice(0, 16); return !s || badName(s) ? 'Trooper' : s; };

// ---------- passwords (scrypt, constant-time compare) ----------
function setPassword(pw) { if (!pw) { cfg.pass = null; return save(); } const salt = crypto.randomBytes(16).toString('hex'); cfg.pass = { salt, hash: crypto.scryptSync(String(pw), salt, 32).toString('hex') }; save(); }
function checkPassword(pw) { if (!cfg.pass) return true; if (typeof pw !== 'string' || pw.length > 128) return false;
  const h = crypto.scryptSync(pw, cfg.pass.salt, 32), want = Buffer.from(cfg.pass.hash, 'hex'); return crypto.timingSafeEqual(h, want); }

// ---------- players ----------
const players = new Map(); // ws -> { id, pid, nick, ip, presence, lv, bucket, joined }
const log = [], LOGN = 300; const say = s => { const l = `[${new Date().toISOString().slice(11, 19)}] ${s}`; log.push(l); if (log.length > LOGN) log.shift(); console.log(l); };
const MAX_MSG = 48 * 1024, RATE = 40; // bytes per message, messages per second
const failed = new Map(); // ip -> { n, until } — slows password guessing

function info() { return { name: cfg.name, desc: cfg.desc, public: cfg.public, locked: !!cfg.pass, players: [...players.values()].filter(p => p.ok).map(p => p.nick), count: [...players.values()].filter(p => p.ok).length, max: cfg.maxPlayers, rules: cfg.rules, version: 1 }; }

// only send each player the peers on their own world; batch at 20 Hz
let dirty = false;
setInterval(() => { if (!dirty) return; dirty = false; const byLv = new Map();
  for (const p of players.values()) if (p.ok && p.presence) { const k = p.presence.lv || ''; if (!byLv.has(k)) byLv.set(k, []); byLv.get(k).push({ peer: p.id, kind: 'viewer', presence: p.presence }); }
  for (const [ws, p] of players) if (p.ok && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'peers', peers: byLv.get((p.presence && p.presence.lv) || '') || [] })); }, 50);

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-private-network': 'true', 'access-control-allow-headers': '*' }); return res.end(); }
  if (req.method === 'GET' && req.url === '/info') { res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-private-network': 'true' }); return res.end(JSON.stringify(info())); }
  res.writeHead(404); res.end();
});
const wss = new WebSocketServer({ server, maxPayload: MAX_MSG });
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress, p = { id: 'p_' + crypto.randomBytes(5).toString('hex'), ip, ok: false, bucket: RATE, last: Date.now() };
  players.set(ws, p);
  const f = failed.get(ip); if (f && f.until > Date.now()) { ws.close(4003, 'Too many wrong passwords. Try again later.'); return; }
  const authT = setTimeout(() => { if (!p.ok) ws.close(4000, 'No join'); }, 30000);
  ws.on('message', raw => { if (process.env.GD_DEBUG) say('msg ' + String(raw).slice(0, 80));
    const now = Date.now(); p.bucket = Math.min(RATE, p.bucket + (now - p.last) / 1000 * RATE); p.last = now;
    if ((p.bucket -= 1) < 0) { if (p.bucket < -RATE) ws.close(4008, 'Flooding'); return; }
    let m; try { m = JSON.parse(raw.toString()); } catch (_) { return; } if (!m || typeof m !== 'object') return;
    if (!p.ok) { if (m.type === 'info') return ws.send(JSON.stringify({ type: 'info', server: info() })); if (m.type !== 'join') return;
      const pid = String(m.pid || '').slice(0, 64);
      if (cfg.bans.includes(pid) || cfg.bans.includes(ip)) return ws.close(4001, 'You are banned from this server.');
      if (!checkPassword(m.pass)) { const c = failed.get(ip) || { n: 0 }; c.n++; if (c.n >= 5) { c.until = now + 60000; c.n = 0; } failed.set(ip, c); return ws.close(4002, 'Wrong password.'); }
      if ([...players.values()].filter(q => q.ok).length >= cfg.maxPlayers) return ws.close(4004, 'Server is full.');
      clearTimeout(authT); p.ok = true; p.pid = pid; p.nick = cleanNick(m.nick); p.joined = now;
      ws.send(JSON.stringify({ type: 'welcome', peerId: p.id, server: info() })); say(`${p.nick} joined`); dirty = true; return; }
    if (m.type === 'presence' && m.presence && typeof m.presence === 'object') { { const n = cleanNick(m.presence.nick); if (n !== p.nick) { say(`${p.nick} is now ${n}`); p.nick = n; } m.presence.nick = p.nick; } if (typeof m.presence.msg === 'string' && badName(m.presence.msg)) m.presence.msg = '***'; p.presence = m.presence; dirty = true; }
  });
  ws.on('close', (code) => { clearTimeout(authT); if (p.ok) say(`${p.nick} left`); else say(`connection from ${ip} closed before joining (${code})`); players.delete(ws); dirty = true; });
  ws.on('error', () => {});
});
setInterval(() => { for (const ws of players.keys()) if (ws.readyState === WebSocket.OPEN) ws.ping(); }, 30000);

// ---------- admin API for the server window (localhost + token) ----------
const admin = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); return res.end(fs.readFileSync(path.join(__dirname, 'panel.html'), 'utf8').replace('__TOKEN__', cfg.adminToken)); }
  const ok = req.headers['x-admin-token'] && crypto.timingSafeEqual(Buffer.from(String(req.headers['x-admin-token']).padEnd(48).slice(0, 48)), Buffer.from(cfg.adminToken));
  if (!ok) { res.writeHead(403); return res.end(); }
  let body = ''; req.on('data', d => { body += d; if (body.length > 1e5) req.destroy(); });
  req.on('end', () => { let b = {}; try { b = body ? JSON.parse(body) : {}; } catch (_) {}
    const send = o => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
    const find = id => [...players].find(([, p]) => p.id === id);
    const mem = process.memoryUsage().rss;
    switch (req.url) {
      case '/admin/status': return send({ ...info(), port: cfg.port, code: cfg.code, lan: lanIps(), publicIp, listed: !!cfg.code && !/REPLACE/.test(cfg.lookup || ''), log: log.slice(-100), mem, uptime: process.uptime(), list: [...players.values()].filter(p => p.ok).map(p => ({ id: p.id, nick: p.nick, lv: p.presence && p.presence.lv, since: p.joined })) });
      case '/admin/settings': for (const k of ['name', 'desc']) if (typeof b[k] === 'string') { const v = b[k].slice(0, k === 'name' ? 40 : 300); if (!badName(v)) cfg[k] = v; }
        if (typeof b.public === 'boolean') cfg.public = b.public; if (Number.isInteger(b.maxPlayers)) cfg.maxPlayers = Math.max(1, Math.min(64, b.maxPlayers));
        if (b.rules && typeof b.rules === 'object') { for (const k in DEFAULTS.rules) if (k !== 'locks' && k in b.rules && typeof b.rules[k] === typeof DEFAULTS.rules[k]) cfg.rules[k] = b.rules[k];
          if (b.rules.locks && typeof b.rules.locks === 'object') { const L = {}; for (const k of ['subs', 'cuts']) if (['on', 'off'].includes(b.rules.locks[k])) L[k] = b.rules.locks[k]; cfg.rules.locks = L; } }
        announce();
        if ('password' in b) setPassword(b.password); save(); return send(info());
      case '/admin/kick': case '/admin/ban': { const e = find(b.id); if (!e) return send({ ok: false }); const [ws, p] = e;
        if (req.url === '/admin/ban') { cfg.bans.push(...[p.pid, p.ip].filter(Boolean)); save(); } ws.close(4005, req.url === '/admin/ban' ? 'Banned by host.' : 'Kicked by host.'); say(`${p.nick} ${req.url === '/admin/ban' ? 'banned' : 'kicked'}`); return send({ ok: true }); }
      case '/admin/stop': send({ ok: true }); say('Server stopping'); for (const ws of players.keys()) ws.close(1001, 'Server shutting down.'); return setTimeout(() => process.emit('SIGINT'), 300);
      default: res.writeHead(404); res.end(); } });
});
// ---------- list this server on the Blork lookup service (heartbeat every 2 minutes) ----------
let publicIp = null;
const lanIps = () => Object.values(require('os').networkInterfaces()).flat().filter(a => a && a.family === 'IPv4' && !a.internal).map(a => a.address);
async function announce() { if (!cfg.lookup || /REPLACE/.test(cfg.lookup)) return; try {
  const r = await fetch(cfg.lookup + '/announce', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: cfg.listKey, name: cfg.name, desc: cfg.desc, port: cfg.port, public: cfg.public, locked: !!cfg.pass, count: info().count, max: cfg.maxPlayers, rules: cfg.rules }) });
  const j = await r.json(); if (j.error) return say('Server list: ' + j.error); if (j.code !== cfg.code) say(`Join code: ${j.code}`); cfg.listKey = j.key; cfg.code = j.code; if (j.ip) publicIp = j.ip; save(); } catch (e) { say('Server list unreachable'); } }
setInterval(announce, 120000); setTimeout(announce, 1000);
process.on('SIGINT', async () => { if (cfg.listKey && !/REPLACE/.test(cfg.lookup)) await fetch(cfg.lookup + '/remove', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: cfg.listKey }) }).catch(() => {}); process.exit(0); });
server.listen(cfg.port, () => say(`Blork Server "${cfg.name}" on port ${cfg.port}`));
admin.listen(cfg.adminPort, '127.0.0.1', () => { const u = `http://127.0.0.1:${cfg.adminPort}/`; say(`Server panel: ${u}`); if (process.env.GD_OPEN !== '0' && !process.env.GD_CONFIG) { const c = process.platform === 'win32' ? `start "" "${u}"` : process.platform === 'darwin' ? `open ${u}` : `xdg-open ${u}`; require('child_process').exec(c, () => {}); } });
module.exports = { cfg, setPassword };
