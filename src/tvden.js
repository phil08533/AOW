// =================== THE DEN TV (2.17): a couch you can sit on, a TV playing Night of the Living Dead, and the rainbow Worm Hole ===================
// The TV remembers where you stopped (S.tv.t, in the save), pauses when you leave the room and turns the ship music down while it plays.
// The film is public domain (George A. Romero, 1968). It plays from local parts (video/notld/parts.json + mp4 parts, made by
// tools/fetch_movie.py) when they're there, and otherwise streams it from the Internet Archive.
// Angler's Den Lv 5 adds the Worm Hole: an ice-fishing hole that can bite with any fish in the game. You can fish it from the couch.
// tan wallpaper with little fish for the den (2.17.2)
TEX.fishpaper = canvasTex(64, (x, s) => { x.fillStyle = '#c4a274'; x.fillRect(0, 0, s, s); x.fillStyle = '#b59366'; for (let i = 0; i < s; i += 16) x.fillRect(i, 0, 1, s);
  const fish = (cx, cy, c, d) => { x.fillStyle = c; x.fillRect(cx - 4 * d, cy - 2, 7, 4); x.fillRect(cx - 3 * d, cy - 3, 4, 1); x.fillRect(cx - 3 * d, cy + 2, 4, 1); const tx = cx + (d > 0 ? -6 : 3); x.fillRect(tx, cy - 3, 2, 2); x.fillRect(tx, cy + 1, 2, 2); x.fillRect(tx + (d > 0 ? 1 : 0), cy - 1, 2, 2); x.fillStyle = '#2a2420'; x.fillRect(cx + (d > 0 ? 1 : -2), cy - 1, 1, 1); };
  fish(16, 14, '#4f8a96', 1); fish(48, 30, '#c8763a', -1); fish(20, 46, '#c8763a', 1); fish(50, 58, '#4f8a96', -1); x.fillStyle = '#a8c8d0'; for (const [a, b] of [[34, 10], [8, 30], [40, 48], [60, 18]]) x.fillRect(a, b, 1, 1); });
// Phil's wallpaper tile (64x64), drawn over the fallback above once it loads
{ const im = new Image(); im.onload = () => { const T = TEX.fishpaper, c = T.image, x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, c.width, c.height); T.needsUpdate = true; }; im.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kb9Lw0AcxV9Ti1IqKnYQcchQdbGLijjWKhShQqgVWnUwufQXNGlIUlwcBdeCgz8Wqw4uzro6uAqC4A8Q/wBxUnSREr+XFFrEenDch3f3HnfvAKFeZprVFQM03TZTibiYya6K3a8Ioh8DCGBcZpYxJ0lJdBxf9/Dx9S7Kszqf+3P0qjmLAT6ROMYM0ybeIJ7ZtA3O+8RhVpRV4nPiCZMuSPzIdcXjN84FlwWeGTbTqXniMLFYaGOljVnR1IiniSOqplO+kPFY5bzFWStXWfOe/IWhnL6yzHWaI0hgEUuQIEJBFSWUYSNKq06KhRTtxzv4h12/RC6FXCUwciygAg2y6wf/g9/dWvmpSS8pFAcCL47zMQp07wKNmuN8HztO4wTwPwNXestfqQOzn6TXWlrkCOjbBi6uW5qyB1zuAENPhmzKruSnKeTzwPsZfVMWGLwFgmteb819nD4AaeoqeQMcHAJjBcpe7/Dunvbe/j3T7O8HfDJyqghqD2cAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfqChARCxn72WU2AAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAQNJREFUeNrt2jsOwjAMgGETsSDEJbpzlCw9EAPchqFLTsAZ2HsJhBhh6sCjQ6Mo2M7vralayV8eSiKvLufTUwrH7f6Q3Xaj/p8iIkEaDwAAAAAAAAAAAAAAAAAAgCZjnfPRmIa35y72MqZButj7HwGfyc+1uQSYEj2m69c7i72/GGBK8hD3bkbB4inwq6et9n72IugJgX0AAAAAAAAAAAAAAPcBBqPEvUTwknzuiTRYTr7EvYRJgJL3EmanQKkjuelFsAQC+wAAAAAAAAAAAAAAAAAAAIAWo/pxWFt9Ufhn8nNtLgG01hdVA9BaX1R1Cmgsram+CGpDYB8AAAAAAABAw/ECYDlM/3fE2AsAAAAASUVORK5CYII='; }
const TV_REMOTE = ['https://archive.org/download/night_of_the_living_dead_dvd/Night.mp4'];
const TVD = { room: null, scr: null, led: null, vid: null, tex: null, idle: null, on: false, parts: null, part: 0, cand: 0, sinceSave: 0, musDown: false, hole: null };
const SEAT = { on: false, x: 0, z: 0, yaw: 0, out: null, y: 0.62 };
// ---- every fish in the game, for the Worm Hole ----
function wormTable() { const seen = new Map();
  for (const k in FISH_TABLES) { if (k === 'wormhole') continue; for (const e of FISH_TABLES[k]) { if (!ITEMS[e[0]] || (typeof fishJunk === 'function' && fishJunk(e[0]))) continue; const o = seen.get(e[0]); if (!o) seen.set(e[0], [e[0], e[1], e[2] || 0.3]); else o[1] = Math.max(o[1], e[1]); } }
  return [...seen.values()]; }
// ---- the screen before the film starts, and when there's no signal ----
function tvIdleTex() { const c = document.createElement('canvas'); c.width = 256; c.height = 192; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.userData = { c, x: c.getContext('2d') }; return t; }
function tvDrawIdle(mode, time) { const T = TVD.idle; if (!T) return; const { c, x } = T.userData;
  if (mode === 'static') { const id = x.createImageData(c.width, c.height); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 200; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } x.putImageData(id, 0, 0);
    x.fillStyle = 'rgba(0,0,0,.65)'; x.fillRect(48, 78, 160, 36); x.fillStyle = '#e8f4ff'; x.font = 'bold 18px monospace'; x.textAlign = 'center'; x.fillText('NO SIGNAL', 128, 102); }
  else if (mode === 'load') { x.fillStyle = '#05060a'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#cfd6e0'; x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.fillText('NIGHT OF THE LIVING DEAD', 128, 88); x.fillStyle = '#8a8e96'; x.font = '12px monospace'; x.fillText('loading' + '.'.repeat(1 + Math.floor(time * 2) % 3), 128, 112); }
  else { x.fillStyle = '#07080c'; x.fillRect(0, 0, c.width, c.height); const g = x.createLinearGradient(0, 0, c.width, c.height); g.addColorStop(0, 'rgba(120,150,190,.12)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); }
  T.needsUpdate = true; }
// ---- the film: local parts first, then the Internet Archive ----
async function tvLoadParts() {
  if (TVD.parts) return TVD.parts; TVD.partsDone = false; try { return await tvFetchParts(); } finally { TVD.partsDone = true; } }
async function tvFetchParts() {
  try { const r = await fetch('video/notld/parts.json', { cache: 'no-cache' }); if (r.ok) { const j = await r.json(); if (j && j.parts && j.parts.length) return (TVD.parts = j.parts.map(p => ({ u: 'video/notld/' + p.f, d: +p.d || 0 }))); } } catch (_) {}
  return (TVD.parts = null);
}
const tvSave = () => { if (!S.tv) S.tv = { t: 0 }; return S.tv; };
function tvNow() { const v = TVD.vid; if (!v) return tvSave().t; if (!TVD.parts) return v.currentTime || 0; let t = 0; for (let i = 0; i < TVD.part; i++) t += TVD.parts[i].d; return t + (v.currentTime || 0); }
function tvVideo() {
  if (TVD.vid) return TVD.vid; const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.volume = 0;
  v.addEventListener('ended', () => { if (TVD.parts && TVD.part < TVD.parts.length - 1) { let at = 0; for (let i = 0; i <= TVD.part; i++) at += TVD.parts[i].d; tvSrc(at + 0.05); v.play().catch(() => {}); } else { tvSave().t = 0; tvOff(true); toast('THE END', 'Night of the Living Dead · 1968', 3); } });
  v.addEventListener('error', () => { if (!TVD.on) return; if (!TVD.parts && TVD.cand < TV_REMOTE.length - 1) { TVD.cand++; tvSrc(tvSave().t); v.play().catch(() => {}); return; } TVD.err = true; });
  v.addEventListener('playing', () => { TVD.err = false; TVD.played = true; if (TVD.scr) TVD.scr.material.map = TVD.tex; TVD.scr.material.needsUpdate = true; });
  TVD.tex = new THREE.VideoTexture(v); TVD.tex.encoding = THREE.sRGBEncoding; TVD.tex.minFilter = THREE.LinearFilter; TVD.tex.magFilter = THREE.LinearFilter;
  return (TVD.vid = v);
}
function tvSrc(at) { const v = TVD.vid;
  if (TVD.parts) { let i = 0, t = at; while (i < TVD.parts.length - 1 && t >= TVD.parts[i].d) { t -= TVD.parts[i].d; i++; } if (TVD.part !== i || !v.src.endsWith(TVD.parts[i].u)) { TVD.part = i; v.src = TVD.parts[i].u; } const go = () => { try { v.currentTime = t; } catch (_) {} }; if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true }); }
  else { const u = TV_REMOTE[TVD.cand]; if (v.src !== u) v.src = u; const go = () => { try { v.currentTime = at; } catch (_) {} }; if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true }); } }
async function tvOn() {
  if (TVD.on) return; TVD.on = true; TVD.err = false; TVD.played = false; SFX.ui && SFX.ui(); TVD.scr.material.map = TVD.idle; tvDrawIdle('load', 0);
  const v = tvVideo(); if (!TVD.partsDone) { await tvLoadParts(); if (!TVD.on) return; } tvSrc(tvSave().t); // play() straight from the button press when we can, so phones allow the sound
  v.play().catch(() => { TVD.err = true; });
  const t = tvSave().t; if (t > 30) log(`TV: picking up Night of the Living Dead at ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}.`);
}
function tvOff(quiet) {
  if (!TVD.on) return; TVD.on = false; const v = TVD.vid; if (v) { if (TVD.played) { tvSave().t = tvNow(); markDirty(); } v.pause(); }
  if (TVD.scr) { TVD.scr.material.map = TVD.idle; TVD.scr.material.needsUpdate = true; } tvDrawIdle('off'); if (!quiet) SFX.ui && SFX.ui(); tvMusic(false);
}
function tvMusic(down) { if (down === TVD.musDown) return; TVD.musDown = down; try { musTick(); } catch (_) {} }
// the music system asks what should play; while the film is on in the den, the answer is nothing (it comes back when the TV goes off or you leave)
{ const _mc = musContext; musContext = function (dt) { if (TVD.on && TVD.musDown && tvInRoom()) return null; return _mc.apply(this, arguments); }; }
const tvInRoom = () => { const r = TVD.room; return !!r && LEVEL.id === 'ship' && player.pos.x > r.x0 && player.pos.x < r.x1 && player.pos.z > r.z0 && player.pos.z < r.z1; };
// ---- the den: couch, side table, TV, and at Lv 5 the Worm Hole ----
function tvDen(s, cx, cz, props) {
  const sd = s.side; TVD.room = { x0: Math.min(s.x0, s.x1), x1: Math.max(s.x0, s.x1), z0: s.z0, z1: s.z1 }; TVD.on = false; TVD.musDown = false; if (TVD.vid) TVD.vid.pause();
  const mx = cx + sd * 0.8; // the TV, couch and hole line up on this
  tvLoadParts();
  // couch facing the TV on the front wall
  { const g = new THREE.Group(), lea = toon('#7a3a22', 'cloth'), cush = toon('#8e4a2c', 'cloth');
    part(g, B(2.3, 0.4, 0.95), lea, 0, 0.28, 0); for (const x of [-0.55, 0.55]) part(g, B(1.08, 0.14, 0.82), cush, x, 0.55, -0.04); part(g, B(2.3, 0.75, 0.24), lea, 0, 0.75, 0.38);
    for (const x of [-1.08, 1.08]) part(g, B(0.2, 0.62, 0.95), lea, x, 0.42, 0); for (const x of [-1.05, 1.05]) for (const z of [-0.38, 0.38]) part(g, Cy(0.04, 0.03, 0.1, 6), '#2a2c32', x, 0.05, z);
    g.position.set(mx, 0, cz + 1.2); props.add(g); box(mx, cz + 1.2, 1.15, 0.45); }
  // side table with the lamp and a bowl of bait
  part(props, Cy(0.3, 0.3, 0.6, 12), toon('#5a3e2a', 'wood'), mx - sd * 1.6, 0.3, cz + 1.3); part(props, Cy(0.03, 0.03, 0.4, 5), '#2a2c32', mx - sd * 1.6, 0.8, cz + 1.3); part(props, Cy(0.12, 0.2, 0.22, 10), glow('#ffd8a0'), mx - sd * 1.6, 1.08, cz + 1.3); solid(mx - sd * 1.6, cz + 1.3, 0.35);
  // the TV on the front wall
  { const g = new THREE.Group(), W = 2.2, H = 1.65; part(g, B(W + 0.16, H + 0.16, 0.1), '#15161a', 0, 0, 0); part(g, B(0.5, 0.06, 0.12), '#2a2c32', 0, -H / 2 - 0.1, 0); part(g, B(0.3, 0.3, 0.12), '#2a2c32', 0, 0, -0.08);
    TVD.idle = tvIdleTex(); tvDrawIdle('off');
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: TVD.idle, toneMapped: false })); scr.position.z = 0.056; g.add(scr); TVD.scr = scr;
    const led = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: '#ff3a2a' })); led.position.set(W / 2 - 0.05, -H / 2 - 0.045, 0.056); g.add(led); TVD.led = led;
    const sp = new THREE.PointLight(0x9fb4d8, 0, 6, 2); sp.position.set(0, 0, 1.2); g.add(sp); TVD.glow = sp;
    g.position.set(mx, 1.85, s.z0 + 0.12); levelGroup.add(g); TVD.g = g; }
  INTERACTS.push({ x: mx, z: s.z0 + 1.1, r: 2.0, label: 'Turn on the TV', tv: true, /* only right by the TV, so the prompt stays out of the way while you watch */ fn: () => (TVD.on ? tvOff() : tvOn()) });
  INTERACTS.push({ x: mx, z: cz + 1.2, r: 1.7, label: 'Sit on the couch', seat: true, fn: () => seatDown(mx, cz + 1.05, Math.PI * 0) });
  // ---- the Worm Hole (Lv 5) ----
  TVD.hole = null;
  if (typeof roomLvl === 'function' && roomLvl('angler') >= 5) {
    FISH_TABLES.wormhole = wormTable(); const hx = mx, hz = cz - 1.5, g = new THREE.Group(); g.position.set(hx, 0, hz); levelGroup.add(g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 8, 36), new THREE.MeshBasicMaterial({ vertexColors: true })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08;
    { const p = ring.geometry.attributes.position, cl = new Float32Array(p.count * 3), c = new THREE.Color(); for (let i = 0; i < p.count; i++) { c.setHSL((Math.atan2(p.getY(i), p.getX(i)) / (Math.PI * 2) + 1) % 1, 0.95, 0.6); cl.set([c.r, c.g, c.b], i * 3); } ring.geometry.setAttribute('color', new THREE.BufferAttribute(cl, 3)); } g.add(ring);
    const wc = document.createElement('canvas'); wc.width = wc.height = 128; const wx = wc.getContext('2d'), wt = new THREE.CanvasTexture(wc); wt.encoding = THREE.sRGBEncoding;
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), new THREE.MeshBasicMaterial({ map: wt })); water.rotation.x = -Math.PI / 2; water.position.y = 0.06; g.add(water);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.24), new THREE.MeshBasicMaterial({ map: signTex('WORM HOLE', '#14081e', '#ff6aff') })); sign.position.set(1.05, 0.36, 0.1); g.add(sign); part(g, Cy(0.03, 0.03, 0.3, 5), '#2a2c32', 1.05, 0.12, 0.1); // off to the side so it never blocks the TV from the couch
    const L = new THREE.PointLight(0xff6aff, 0.6, 4, 2); L.position.y = 0.5; g.add(L);
    let lastDraw = 0; levelAnims.push(t => { if (!g.parent) return; ring.rotation.z = t * 0.6; L.color.setHSL((t * 0.08) % 1, 0.9, 0.6);
      if (t - lastDraw > 0.05) { lastDraw = t; const gr = wx.createRadialGradient(64, 64, 4, 64, 64, 64); for (let k = 0; k <= 6; k++) gr.addColorStop(k / 6, `hsl(${(t * 60 + k * 55) % 360},90%,${k === 0 ? 85 : 55 - k * 4}%)`); wx.fillStyle = gr; wx.fillRect(0, 0, 128, 128);
        wx.strokeStyle = 'rgba(255,255,255,.35)'; wx.lineWidth = 3; for (let k = 0; k < 3; k++) { wx.beginPath(); for (let a = 0; a < 7; a += 0.2) { const r = 6 + a * 7.5, q = a + t * 1.6 + k * 2.09; wx.lineTo(64 + Math.cos(q) * r, 64 + Math.sin(q) * r); } wx.stroke(); } wt.needsUpdate = true; } });
    box(hx, hz, 0.6, 0.6);
    TVD.hole = { x: hx, z: hz, y: 0.06, ry: 0, ice: true, worm: true };
    INTERACTS.push({ x: hx, z: hz, r: 3.4, label: 'Fish: Worm Hole', fn: () => startFishing('Worm Hole', 'wormhole') });
  }
}
{ const _ar = anglerRoom; anglerRoom = function (s, cx, cz, outer, term, props) { _ar.apply(this, arguments); try { tvDen(s, cx, cz, props); } catch (e) { console.warn('tv den', e); } }; }
{ const _ll = loadLevel; loadLevel = function () { if (TVD.on) tvOff(true); TVD.room = null; seatUp(true); const r = _ll.apply(this, arguments); if (TVD.hole && LEVEL.id === 'ship' && !FISH_SPOTS.includes(TVD.hole)) FISH_SPOTS.push(TVD.hole); return r; }; }
// ---- sitting ----
function seatDown(x, z, yaw) { if (SEAT.on) return; SEAT.on = true; SEAT.x = x; SEAT.z = z; SEAT.out = V(player.pos.x, player.pos.y, player.pos.z); player.yaw = yaw; player.pitch = -0.05; SFX.ui && SFX.ui(); toast('ON THE COUCH', TOUCH ? 'Move the stick to get up' : 'Move to get up', 1.8); }
function seatUp(quiet) { if (!SEAT.on) return; SEAT.on = false; const r = TVD.room; if (SEAT.out) { player.pos.x = SEAT.x; player.pos.z = SEAT.z - 0.9; } if (!quiet) SFX.ui && SFX.ui(); }
{ const _st = step; step = function (dt) {
  if (SEAT.on && state === 'play' && !dlgOpen && (keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.Space || Math.hypot(move.x, move.y) > 0.3)) seatUp();
  _st(dt);
  if (SEAT.on) { player.pos.x = SEAT.x; player.pos.z = SEAT.z; player.vy = 0; camera.position.set(SEAT.x, player.pos.y + 1.05, SEAT.z); }
  // the TV: label, power light, sound by distance, auto-pause, music down, keep the save current
  const tvI = INTERACTS.find(a => a.tv); if (tvI) tvI.label = TVD.on ? 'Turn off the TV' : 'Turn on the TV';
  for (const a of INTERACTS) if (a.seat) a.label = SEAT.on ? 'Get up' : 'Sit on the couch';
  if (TVD.on) { const v = TVD.vid, inR = tvInRoom();
    if (!inR) { tvOff(true); log('TV paused. It will pick up where you left off.'); }
    else if (v) { const d = Math.hypot(player.pos.x - TVD.g.position.x, player.pos.z - TVD.g.position.z); v.volume = Math.max(0, Math.min(1, (PREFS.sfx === false ? 0 : 1) * (1.15 - d / 11))); tvMusic(true);
      TVD.sinceSave += dt; if (TVD.sinceSave > 10 && !v.paused && TVD.played) { TVD.sinceSave = 0; tvSave().t = tvNow(); markDirty(); }
      if (TVD.err || (v.readyState < 2 && v.paused)) { TVD.errT = (TVD.errT || 0) + dt; if (TVD.err || TVD.errT > 12) { tvDrawIdle('static'); TVD.scr.material.map = TVD.idle; } else tvDrawIdle('load', gameTime); } else TVD.errT = 0;
      if (TVD.glow) TVD.glow.intensity = v.paused ? 0 : 0.5 + Math.random() * 0.15; } }
  else if (TVD.glow) TVD.glow.intensity = 0;
  if (TVD.led) TVD.led.material.color.set(TVD.on ? '#4fff7a' : '#ff3a2a');
}; }
// the couch's own "Get up" works too
{ const _sd = seatDown; seatDown = function () { if (SEAT.on) { seatUp(); return; } return _sd.apply(this, arguments); }; }
document.addEventListener('visibilitychange', () => { if (document.hidden && TVD.on && TVD.vid && TVD.played) { tvSave().t = tvNow(); markDirty(); } });
// ---- ice-fishing look for holes: a short jigging rod held low over the hole ----
{ const _fs = fshStart; fshStart = function (F) { _fs(F); const s = FSH.spot; if (s && s.worm) { const dx = s.x - player.pos.x, dz = s.z - player.pos.z, d = Math.hypot(dx, dz) || 1, eye = SEAT.on ? 1.05 : 1.6; player.yaw = Math.atan2(-dx, -dz); player.pitch = -Math.atan2(eye - 0.1, d) * 0.5; /* tilted up so the top of the TV stays in view */ } }; }
{ const _fst = fshStep; fshStep = function (dt) { _fst(dt); const F = fishing, H = FSH.holder, s = FSH.spot; if (!F || !H || !FSH.rod) return;
  const ice = !!(s && s.ice); FSH.rod.scale.set(1, ice ? 0.42 : 1, 1); if (!ice) { H.position.set(0.24, -0.27, -0.5); return; }
  const t = FSH.t; let jig = 0; if (F.st === 'wait') jig = Math.max(0, Math.sin(t * 2.6)) * 0.16 * (Math.sin(t * 0.7) > -0.2 ? 1 : 0.2); else if (F.st === 'bite') jig = 0.18 + Math.sin(t * 24) * 0.05 + (FSH.pull > 0 ? 0.15 : 0); else if (F.st === 'done') jig = 0.35;
  H.position.set(0.12, -0.26, -0.4); H.rotation.set(-1.05 + jig, 0, -0.2); FSH.rod.rotation.x = -jig * 0.4;
  FSH.iceLine = true; }; }
// the camera moves again after the fishing step, so a line drawn there trails behind the short rod: redraw it from the real tip right before each render
{ const _br = scene.onBeforeRender; scene.onBeforeRender = function () { if (_br) _br.apply(this, arguments); const F = fishing; if (!F || !FSH.F || !FSH.iceLine || !(FSH.spot && FSH.spot.ice) || !fshLine.visible) return;
  camera.updateMatrixWorld(true); const a = fshTip(), b = fshBobber.visible ? FSH.pos : a, P = fshLine.geometry.attributes.position, sag = F.st === 'bite' || FSH.pull > 0 ? 0.02 : 0.12;
    for (let i = 0; i < 16; i++) { const k = i / 15; P.setXYZ(i, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * sag * Math.min(1, a.distanceTo(b) / 4), a.z + (b.z - a.z) * k); } P.needsUpdate = true; }; }
