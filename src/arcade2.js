// =================== THE NEON ARCADE, BIGGER (2.23.63): skee-ball, claw machines, hoop shot, whack-a-blork, tickets and a real prize counter ===================
// Every new game costs 25 cr and pays out tickets. The prize counter trades tickets for plushies and ship furniture.
// The new attractions line the east wall (x 17..25), clear of the dance floor, the walking crowd and the casino side.
ITEMS.plush_klunky = { name: 'Klunky plush', v: 40, col: '#c8402f', note: 'A squishy McKlunkies mascot. The burger head squeaks.' };
ITEMS.plush_blork = { name: 'Blork plush', v: 60, col: '#6fdc5a', note: 'A green Blork with felt teeth. Won at the Neon Arcade.' };
ITEMS.plush_frog = { name: 'Frog E plush', v: 90, col: '#7fae63', note: 'He looks like he has something to say. He does not.' };
ITEMS.plush_maw = { name: 'Tiny Maw plush', v: 150, col: '#8a3a8a', note: 'One big stitched eye. Somehow still staring at you.' };
const ARC_PRIZES = [['plush_klunky', 'item', 60], ['plush_blork', 'item', 90], ['plush_frog', 'item', 140], ['plush_maw', 'item', 220],
  ['lavalamp', 'furn', 180], ['beanbag', 'furn', 260], ['neon', 'furn', 480], ['disco', 'furn', 650], ['arcade', 'furn', 900], ['jukebox', 'furn', 1100]];
const tix = () => (S.tix | 0);
function arcTix(n) { if (n <= 0) return; S.tix = tix() + n; markDirty(); SFX.coin && SFX.coin(); }
function openPrizes() { openDlg('Prize counter', `🎟 ${tix()} tickets`); $('dlgLine').textContent = 'Win tickets on the games along the east wall, then spend them here. Furniture prizes go to your ship decorator.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  for (const [id, kind, cost] of ARC_PRIZES) { const r = document.createElement('div'), nm = document.createElement('span'); r.className = 'rowi';
    const owned = kind === 'furn' && typeof furnOwned === 'function' && furnOwned(id), name = kind === 'item' ? ITEMS[id].name : (FURN[id] ? FURN[id][0] : id);
    nm.innerHTML = `<b>${name}</b><br><small style="opacity:.8">${kind === 'item' ? 'Plush · goes in your bag' : owned ? 'Ship furniture · you already have it' : 'Ship furniture · unlocks in the decorator'}</small>`;
    const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = `${cost} 🎟`; b.disabled = tix() < cost || owned;
    b.addEventListener('click', () => { if (tix() < cost) return; if (kind === 'item') { if (!invAdd(id, 1)) return; } else { S.furn = S.furn || {}; S.furn[id] = 1; }
      S.tix = tix() - cost; markDirty(); SFX.item(); toast('PRIZE', name, 2.2); log(`Traded ${cost} tickets for ${name}.`, 'loot'); openPrizes(); });
    r.append(nm, b); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); }

// ---- a shared overlay for the little games: canvas, a score line, close, and one big action (tap, click, Space) ----
function arcMini(title, cost, game) {
  if (ARC.on) return; if (S.cr < cost) { toast('ARCADE', `${cost} cr to play.`, 2); SFX.ui(); return; } S.cr -= cost; markDirty();
  ARC.on = true; dlgOpen = true; firing = false; if (document.pointerLockElement) document.exitPointerLock(); $('touch').hidden = true;
  const ov = document.createElement('div'); ov.id = 'arcOv'; ov.innerHTML = `<div class="arcBox"><div class="arcTop"><b>${title}</b><span id="arcScore"></span><button class="pbtn" id="arcX">✕</button></div><canvas width="480" height="360"></canvas><div style="color:#cfd8ff;font:13px var(--mono,monospace);text-align:center;margin-top:6px" id="arcHint"></div></div>`;
  document.body.appendChild(ov); const cv = ov.querySelector('canvas'), x = cv.getContext('2d'); let raf = 0, last = performance.now(), done = false;
  const G = { x, cv, hint: s => (ov.querySelector('#arcHint').textContent = s), score: s => (ov.querySelector('#arcScore').textContent = s), mx: 240, my: 180 };
  const close = () => { cancelAnimationFrame(raf); ov.remove(); ARC.on = false; removeEventListener('keydown', kd, true); closeDlg(); };
  G.end = (tickets, line) => { if (done) return; done = true; arcTix(tickets); x.fillStyle = 'rgba(0,0,0,.62)'; x.fillRect(0, 0, 480, 360); x.textAlign = 'center'; x.fillStyle = '#ffd36a'; x.font = 'bold 32px monospace'; x.fillText(line || 'GAME OVER', 240, 150);
    x.fillStyle = '#fff'; x.font = '18px monospace'; x.fillText(tickets ? `+${tickets} tickets  (🎟 ${tix()})` : 'No tickets this time', 240, 192); x.fillText(`Again? ${cost} cr · tap or Enter`, 240, 250); };
  const again = () => { close(); setTimeout(() => arcMini(title, cost, game), 30); };
  const act = () => { if (done) return again(); G.act && G.act(); };
  const kd = e => { e.stopPropagation(); if (e.code === 'Escape') { e.preventDefault(); return close(); } if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); act(); } if (G.key) G.key(e.code); };
  addEventListener('keydown', kd, true); ov.querySelector('#arcX').addEventListener('click', close);
  cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); G.mx = (e.clientX - r.left) / r.width * 480; G.my = (e.clientY - r.top) / r.height * 360; e.preventDefault(); act(); });
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); G.mx = (e.clientX - r.left) / r.width * 480; G.my = (e.clientY - r.top) / r.height * 360; });
  game(G); const loop = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!done) G.tick(dt, now / 1000); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); }
const arcBg = (x, c1, c2) => { const g = x.createLinearGradient(0, 0, 0, 360); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 480, 360); };

// ---- skee-ball: stop the aim, then the power; nine balls up the lane into the rings ----
function gameSkee(G) { const { x } = G; let ball = 0, sc = 0, ph = 0, aim = 0, pow = 0, t = 0, roll = null; const rings = [[240, 92, 18, 100], [240, 130, 26, 50], [240, 168, 34, 40], [240, 206, 42, 30], [240, 244, 50, 20], [240, 282, 60, 10]];
  G.hint('Tap to set your aim, tap again to set the power. Nine balls.'); G.score('0 · ball 1/9');
  G.act = () => { if (roll) return; if (ph === 0) ph = 1; else { ph = 0; roll = { a: aim, p: pow, k: 0 }; SFX.ui(); } };
  G.tick = (dt, tt) => { t += dt; if (!roll) { if (ph === 0) aim = Math.sin(t * 2.6) * 0.9; else pow = 0.5 + Math.sin(t * 3.4) * 0.5; }
    arcBg(x, '#1a0e24', '#05060f'); // lane in perspective
    x.fillStyle = '#5a3a24'; x.beginPath(); x.moveTo(150, 360); x.lineTo(330, 360); x.lineTo(300, 60); x.lineTo(180, 60); x.fill(); x.fillStyle = '#7a5434'; for (let i = 0; i < 9; i++) { const y = 360 - i * 34; x.fillRect(150 + i * 3, y, 180 - i * 6, 2); }
    x.fillStyle = '#2a1e30'; x.fillRect(150, 50, 180, 270); for (const [cx, cy, r, v] of rings.slice().reverse()) { x.fillStyle = v >= 100 ? '#ff6aa8' : v >= 40 ? '#ffd36a' : v >= 20 ? '#4fd2ff' : '#6fdc5a'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.fillStyle = '#05060f'; x.beginPath(); x.arc(cx, cy, r - 6, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '11px monospace'; x.textAlign = 'center'; x.fillText(v, cx, cy - r + 14); }
    for (const sx of [168, 312]) { x.fillStyle = '#ff6aa8'; x.beginPath(); x.arc(sx, 76, 13, 0, 7); x.fill(); x.fillStyle = '#05060f'; x.beginPath(); x.arc(sx, 76, 8, 0, 7); x.fill(); }
    if (!roll) { x.strokeStyle = '#fff'; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(240, 340); x.lineTo(240 + aim * 80, 120); x.stroke(); x.setLineDash([]); x.fillStyle = '#222'; x.fillRect(420, 80, 22, 220); x.fillStyle = ph ? '#ffd36a' : '#555'; x.fillRect(420, 80 + 220 * (1 - pow), 22, 220 * pow); x.fillStyle = '#fff'; x.font = '12px monospace'; x.fillText('POWER', 431, 316);
      x.fillStyle = '#e8e4dc'; x.beginPath(); x.arc(240, 336, 12, 0, 7); x.fill(); }
    else { roll.k += dt * 1.3; const k = Math.min(1, roll.k), dist = 60 + roll.p * 250, ty = 340 - dist * k, tx = 240 + roll.a * 80 * (dist * k / 220); x.fillStyle = '#e8e4dc'; x.beginPath(); x.arc(tx, ty, 12 - k * 4, 0, 7); x.fill();
      if (k >= 1) { let v = 0; if (Math.abs(tx - 168) < 13 && Math.abs(ty - 76) < 13 || Math.abs(tx - 312) < 13 && Math.abs(ty - 76) < 13) v = 100; else for (const [cx, cy, r, val] of rings) if (Math.hypot(tx - cx, ty - cy) < r) { v = val; break; }
        sc += v; ball++; roll = null; if (v) { SFX.coin && SFX.coin(); } G.score(`${sc} · ball ${Math.min(9, ball + 1)}/9`); if (ball >= 9) G.end(Math.round(sc / 9), sc >= 400 ? 'SKEE MASTER!' : 'NICE ROLLING'); } } }; }

// ---- the claw: it slides back and forth; drop it over a plush and hope the grip holds ----
function gameClaw(G) { const { x } = G; let cx = 60, dir = 1, st = 'move', cy = 70, grab = null, t = 0, tries = 3; const kinds = [['plush_klunky', '#c8402f'], ['plush_blork', '#6fdc5a'], ['plush_frog', '#7fae63'], ['plush_maw', '#8a3a8a']];
  const toys = Array.from({ length: 9 }, (_, i) => { const k = i === 4 ? 3 : i % 3; return { x: 66 + i * 33 + Math.random() * 8, y: 300 - (i % 2) * 14, k, r: 15 }; });
  G.hint('Tap to drop the claw. Three tries. Land it dead centre on a plush.'); G.score('3 tries');
  G.act = () => { if (st === 'move') { st = 'drop'; SFX.ui(); } };
  G.tick = (dt, tt) => { t += dt; arcBg(x, '#2a0e2a', '#0a0610'); x.fillStyle = 'rgba(160,220,255,.08)'; x.fillRect(30, 40, 420, 300); x.strokeStyle = '#c86aff'; x.lineWidth = 3; x.strokeRect(30, 40, 420, 300); x.fillStyle = '#3a3d44'; x.fillRect(30, 40, 420, 10); x.fillStyle = '#111'; x.fillRect(370, 250, 80, 90); x.fillStyle = '#ffd36a'; x.font = '12px monospace'; x.textAlign = 'center'; x.fillText('PRIZE', 410, 270);
    for (const T of toys) { if (T === grab) continue; const col = kinds[T.k][1]; x.fillStyle = col; x.beginPath(); x.arc(T.x, T.y, T.r, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(T.x - 5, T.y - 4, 3, 0, 7); x.arc(T.x + 5, T.y - 4, 3, 0, 7); x.fill(); }
    if (st === 'move') { cx += dir * 150 * dt; if (cx > 340) { cx = 340; dir = -1; } if (cx < 50) { cx = 50; dir = 1; } }
    else if (st === 'drop') { cy += 170 * dt; const hit = toys.find(T => T !== grab && Math.abs(T.x - cx) < 22 && cy > T.y - 26); if (hit || cy > 300) { st = 'up'; if (hit) { const off = Math.abs(hit.x - cx); grab = Math.random() < (off < 7 ? 0.85 : off < 14 ? 0.45 : 0.15) ? hit : null; if (!grab) G.hint('It slipped! The claw is weak on the edges.'); } } }
    else if (st === 'up') { cy -= 140 * dt; if (grab) { grab.x = cx; grab.y = cy + 26; } if (cy <= 70) { cy = 70; st = grab ? 'home' : 'next'; } }
    else if (st === 'home') { cx += 160 * dt; grab.x = cx; if (cx >= 410) { st = 'won'; const [id] = kinds[grab.k]; if (invAdd(id, 1)) { toast('YOU WON', ITEMS[id].name, 2.4); } G.end(grab.k === 3 ? 30 : 10, 'GOT ONE!'); return; } }
    if (st === 'next') { tries--; G.score(`${tries} tries`); if (tries <= 0) return G.end(2, 'SO CLOSE'); st = 'move'; G.hint('Tap to drop the claw.'); }
    x.strokeStyle = '#cfd3d8'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, 50); x.lineTo(cx, cy); x.stroke(); x.fillStyle = '#a8aeb8'; x.fillRect(cx - 14, cy - 6, 28, 10); const o = st === 'drop' ? 12 : 6;
    x.strokeStyle = '#a8aeb8'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 10, cy + 4); x.lineTo(cx - 10 - o, cy + 20); x.moveTo(cx + 10, cy + 4); x.lineTo(cx + 10 + o, cy + 20); x.stroke(); }; }

// ---- hoop shot: 30 seconds; the hoop drifts, tap when the meter is in the green ----
function gameHoop(G) { const { x } = G; let t = 0, left = 30, sc = 0, m = 0, md = 1, shots = [], hx = 240; G.hint('Tap when the meter is in the green. The hoop moves. 30 seconds.');
  G.act = () => { const good = Math.abs(m - 0.5) < 0.09, ok = Math.abs(m - 0.5) < 0.18; shots.push({ k: 0, in: good || (ok && Math.random() < 0.5), dx: (m - 0.5) * 140 }); };
  G.tick = (dt, tt) => { t += dt; left -= dt; m += md * dt * 1.5; if (m > 1) { m = 1; md = -1; } if (m < 0) { m = 0; md = 1; } hx = 240 + Math.sin(t * 0.9) * (t > 15 ? 110 : 60);
    arcBg(x, '#0e1a2e', '#05060f'); x.strokeStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(i * 40, 0); x.lineTo(i * 40 + 60, 360); x.stroke(); }
    x.fillStyle = '#f4f8ff'; x.fillRect(hx - 50, 40, 100, 70); x.strokeStyle = '#c8402f'; x.lineWidth = 3; x.strokeRect(hx - 22, 70, 44, 32); x.strokeStyle = '#ff7a2a'; x.lineWidth = 4; x.beginPath(); x.ellipse(hx, 118, 26, 7, 0, 0, 7); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(hx + i * 10, 120); x.lineTo(hx + i * 7, 150); x.stroke(); }
    for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i]; s.k += dt * 1.6; const k = Math.min(1, s.k), tx = s.in ? hx : hx + s.dx + (s.dx > 0 ? 30 : -30), bx = 240 + (tx - 240) * k, by = 330 - 210 * k + Math.sin(k * Math.PI) * -90;
      x.fillStyle = '#e8762a'; x.beginPath(); x.arc(bx, by, 14 - k * 5, 0, 7); x.fill(); if (s.k >= 1) { if (s.in) { sc += 2; SFX.coin && SFX.coin(); } shots.splice(i, 1); } }
    x.fillStyle = '#222'; x.fillRect(90, 330, 300, 16); x.fillStyle = '#2a8a3a'; x.fillRect(90 + 300 * 0.32, 330, 300 * 0.36, 16); x.fillStyle = '#6fdc5a'; x.fillRect(90 + 300 * 0.41, 330, 300 * 0.18, 16); x.fillStyle = '#fff'; x.fillRect(90 + 300 * m - 2, 326, 4, 24);
    G.score(`${sc} pts · ${Math.max(0, Math.ceil(left))} s`); if (left <= 0) G.end(Math.round(sc * 0.8), sc >= 30 ? 'ON FIRE!' : 'TIME!'); }; }

// ---- whack-a-blork: blorks pop out of nine holes; bonk them before they duck (don't bonk the bunny) ----
function gameWhack(G) { const { x } = G; let t = 0, left = 30, sc = 0, nextT = 0.5; const holes = Array.from({ length: 9 }, (_, i) => ({ x: 120 + (i % 3) * 120, y: 110 + Math.floor(i / 3) * 95, up: 0, life: 0, bun: false, hit: 0 }));
  G.hint('Tap the Blorks. Not the bunny. 30 seconds. (Keys 1-9 work too.)');
  const bonk = H => { if (H.life <= 0 || H.hit) return; H.hit = 0.3; if (H.bun) { sc = Math.max(0, sc - 3); SFX.hurt && SFX.hurt(); } else { sc++; SFX.coin && SFX.coin(); } H.life = Math.min(H.life, 0.25); };
  G.act = () => { const H = holes.find(h => Math.hypot(G.mx - h.x, G.my - h.y + 10) < 42); if (H) bonk(H); };
  G.key = c => { const n = /^Digit([1-9])$/.exec(c); if (n) bonk(holes[+n[1] - 1]); };
  G.tick = (dt, tt) => { t += dt; left -= dt; nextT -= dt; if (nextT <= 0) { nextT = Math.max(0.28, 0.85 - t * 0.02); const free = holes.filter(h => h.life <= 0); if (free.length) { const H = free[(Math.random() * free.length) | 0]; H.life = Math.max(0.55, 1.3 - t * 0.025); H.bun = Math.random() < 0.15; H.hit = 0; } }
    arcBg(x, '#1e2a14', '#0a0e06');
    for (const H of holes) { H.life -= dt; if (H.hit > 0) H.hit -= dt; H.up += ((H.life > 0 ? 1 : 0) - H.up) * Math.min(1, dt * 14);
      x.fillStyle = '#05060a'; x.beginPath(); x.ellipse(H.x, H.y + 22, 42, 14, 0, 0, 7); x.fill(); if (H.up > 0.05) { x.save(); x.beginPath(); x.rect(H.x - 50, H.y - 80, 100, 102); x.clip(); const y = H.y + 22 - H.up * 48;
        x.fillStyle = H.bun ? '#f4f0e8' : H.hit > 0 ? '#ffd36a' : '#6fdc5a'; x.beginPath(); x.arc(H.x, y, 26, Math.PI, 0); x.fillRect(H.x - 26, y, 52, 40); x.fill(); if (H.bun) { x.fillRect(H.x - 14, y - 44, 8, 22); x.fillRect(H.x + 6, y - 44, 8, 22); }
        x.fillStyle = '#05060a'; x.beginPath(); x.arc(H.x - 9, y - 6, 4, 0, 7); x.arc(H.x + 9, y - 6, 4, 0, 7); x.fill(); if (!H.bun) { x.fillStyle = '#fff'; for (let k = 0; k < 4; k++) x.fillRect(H.x - 12 + k * 7, y + 8, 4, 6); } x.restore(); }
      x.fillStyle = '#3a5a2a'; x.beginPath(); x.ellipse(H.x, H.y + 26, 46, 10, 0, 0, Math.PI); x.fill(); }
    G.score(`${sc} bonks · ${Math.max(0, Math.ceil(left))} s`); if (left <= 0) G.end(Math.round(sc * 1.2), sc >= 30 ? 'BLORK BUSTER!' : 'TIME!'); }; }

// ---- the 3D side: four new attractions on the east wall, a stocked prize counter, and ticket payouts from the old cabinets too ----
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.call(this); if (zTheme(ZF.floor) !== 'arcade') return;
  try { const dark = toon('#1e1c22'), chrome = toon('#a8aeb8'), wood = toon('#6a4a30', 'wood');
    const mq = (txt, fg, w, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.22), new THREE.MeshBasicMaterial({ map: signTex(txt, '#05060f', fg) })); m.position.set(x, y, z); m.rotation.y = ry; props.add(m); };
    // skee-ball: three lanes rolling toward the east wall, ring boards at the far end, a scoreboard over them
    for (let i = 0; i < 3; i++) { const z = -13.2 + i * 1.5, g = new THREE.Group(); g.position.set(17.6, 0, z); props.add(g);
      part(g, B(6, 0.7, 1.2), wood, 3, 0.35, 0); const ramp = part(g, B(5.4, 0.06, 0.9), toon('#a07a4a', 'wood'), 3.1, 0.95, 0, 0, 0, 0.12); for (const s of [-1, 1]) part(g, B(6, 0.25, 0.08), dark, 3, 0.8, s * 0.6);
      part(g, B(0.3, 2.2, 1.2), dark, 6.1, 1.1, 0); for (const [r, c, y] of [[0.45, '#6fdc5a', 1.25], [0.34, '#4fd2ff', 1.35], [0.24, '#ffd36a', 1.48], [0.13, '#ff6aa8', 1.62]]) part(g, Cy(r, r, 0.03, 20), glow(c), 5.93, y, 0, 0, 0, Math.PI / 2 - 0.4);
      part(g, B(0.05, 0.5, 1.0), glow(['#ff6aa8', '#4fd2ff', '#ffd36a'][i]), 6.0, 2.45, 0); for (let k = 0; k < 3; k++) part(g, new THREE.SphereGeometry(0.1, 8, 6), toon('#e8e4dc'), 0.4 + k * 0.22, 0.78, -0.3);
      box(20.6, z, 3, 0.6); }
    mq('SKEE-BALL', '#ffd36a', 3.6, 23.5, 3.4, -11.7, -Math.PI / 2);
    INTERACTS.push({ x: 17.2, z: -11.7, r: 2.4, label: '🎳 Skee-ball (25 cr)', fn: () => arcMini('SKEE-BALL', 25, gameSkee) });
    // two claw machines: a glass case full of plushies and a claw that never stops swaying
    const claws = []; for (const z of [-5.2, -2.8]) { const g = new THREE.Group(); g.position.set(24.4, 0, z); g.rotation.y = -Math.PI / 2; props.add(g);
      part(g, B(1.5, 1.0, 1.4), toon('#7a2a6a'), 0, 0.5, 0); part(g, B(1.52, 0.08, 1.42), glow('#ff6aa8'), 0, 1.02, 0);
      const gl = new THREE.Mesh(B(1.44, 1.3, 1.34), new THREE.MeshLambertMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.18, depthWrite: false })); gl.position.set(0, 1.71, 0); g.add(gl);
      part(g, B(1.5, 0.25, 1.4), toon('#7a2a6a'), 0, 2.48, 0); part(g, B(1.3, 0.04, 0.05), chrome, 0, 2.33, 0);
      for (let k = 0; k < 9; k++) part(g, new THREE.SphereGeometry(0.14, 8, 6), toon(['#c8402f', '#6fdc5a', '#7fae63', '#ffd36a', '#4fd2ff'][k % 5]), -0.5 + (k % 3) * 0.36 + (k > 5 ? 0.1 : 0), 1.16 + (k > 5 ? 0.12 : 0), -0.4 + Math.floor(k / 3) * 0.32);
      const cl = new THREE.Group(); part(cl, Cy(0.008, 0.008, 0.6, 4), chrome, 0, -0.3, 0); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; part(cl, B(0.03, 0.18, 0.03), chrome, Math.cos(a) * 0.07, -0.66, Math.sin(a) * 0.07, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); }
      cl.position.set(0, 2.33, 0); g.add(cl); claws.push(cl); part(g, B(0.4, 0.3, 0.12), glow('#ffd36a'), 0, 0.75, 0.71);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32), new THREE.MeshBasicMaterial({ map: signTex('CLAW-O-MATIC', '#2a0a2a', '#ff6aa8') })); m.position.set(0, 2.48, 0.71); g.add(m); box(24.4, z, 0.7, 0.75); }
    levelAnims.push(t => claws.forEach((c, i) => { c.position.x = Math.sin(t * 0.7 + i * 2) * 0.45; c.position.z = Math.cos(t * 0.5 + i) * 0.35; }));
    INTERACTS.push({ x: 23.0, z: -4, r: 2.2, label: '🧸 Claw machine (25 cr)', fn: () => arcMini('CLAW-O-MATIC', 25, gameClaw) });
    // hoop shot: two netted cages with a backboard and a hoop that slides side to side
    const hoops = []; for (const z of [2.2, 4.8]) { const g = new THREE.Group(); g.position.set(21.4, 0, z); g.rotation.y = -Math.PI / 2; props.add(g);
      part(g, B(2.2, 0.5, 4.2), toon('#2a3a6a'), 0, 0.25, -0.6); part(g, B(2.2, 0.06, 3.6), toon('#c86a2a', 'wood'), 0, 0.62, -0.9, -0.12);
      for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshBasicMaterial({ color: '#cfd8ff', transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })); n.position.set(s * 1.1, 1.9, -0.6); n.rotation.y = Math.PI / 2; g.add(n); part(g, B(0.06, 2.9, 0.06), chrome, s * 1.1, 1.75, 1.45); part(g, B(0.06, 2.9, 0.06), chrome, s * 1.1, 1.75, -2.65); }
      part(g, B(2.2, 0.06, 4.2), chrome, 0, 3.25, -0.6); const bb = new THREE.Group(); bb.position.set(0, 2.4, -2.5); g.add(bb); part(bb, B(1.2, 0.8, 0.06), toon('#f4f8ff'), 0, 0.3, 0); part(bb, B(0.5, 0.36, 0.07), glow('#c8402f'), 0, 0.15, 0.01);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 6, 20), toon('#ff7a2a')); rim.rotation.x = Math.PI / 2; rim.position.set(0, -0.08, 0.3); bb.add(rim); hoops.push(bb);
      for (let k = 0; k < 4; k++) part(g, new THREE.SphereGeometry(0.13, 10, 8), toon('#e8762a'), -0.6 + k * 0.4, 0.82, 0.9);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: signTex('HOOP SHOT', '#05060f', '#ff7a2a') })); m.position.set(0, 3.45, -2.5); g.add(m); box(21.4 + 0.6, z, 2.1, 1.1); }
    levelAnims.push(t => hoops.forEach((h, i) => { h.position.x = Math.sin(t * 0.9 + i * 1.7) * 0.4; }));
    INTERACTS.push({ x: 18.8, z: 3.5, r: 2.4, label: '🏀 Hoop shot (25 cr)', fn: () => arcMini('HOOP SHOT', 25, gameHoop) });
    // whack-a-blork: a waist-high table with nine holes and little green heads bobbing up
    { const g = new THREE.Group(); g.position.set(23.6, 0, 9.6); g.rotation.y = -Math.PI / 2; props.add(g); part(g, B(2.0, 0.9, 1.4), toon('#3a5a2a'), 0, 0.45, 0); part(g, B(2.1, 0.08, 1.5), glow('#6fdc5a'), 0, 0.92, 0);
      const heads = []; for (let k = 0; k < 9; k++) { const hx = -0.6 + (k % 3) * 0.6, hz = -0.4 + Math.floor(k / 3) * 0.4; part(g, Cy(0.15, 0.15, 0.02, 14), dark, hx, 0.965, hz); const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), toon('#6fdc5a')); h.position.set(hx, 0.9, hz); g.add(h); heads.push(h); }
      part(g, B(2.0, 1.2, 0.12), toon('#3a5a2a'), 0, 1.5, -0.7); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.42), new THREE.MeshBasicMaterial({ map: signTex('WHACK-A-BLORK', '#0a1206', '#9fff6a') })); m.position.set(0, 1.7, -0.63); g.add(m);
      part(g, Cy(0.03, 0.03, 0.5, 6), toon('#5a3a24', 'wood'), 0.85, 1.05, 0.55, 0, 0, 1.2); part(g, Cy(0.09, 0.09, 0.2, 10), toon('#c8402f'), 1.05, 1.15, 0.55, 0, 0, Math.PI / 2);
      levelAnims.push(t => heads.forEach((h, k) => { h.position.y = 0.86 + Math.max(0, Math.sin(t * 3 + k * 2.3)) * 0.16; })); box(23.6, 9.6, 0.75, 1.05);
      INTERACTS.push({ x: 21.8, z: 9.6, r: 2.0, label: '🔨 Whack-a-Blork (25 cr)', fn: () => arcMini('WHACK-A-BLORK', 25, gameWhack) }); }
    // the prize counter: shelves of plushies behind the old counter, a big Klunky plush on top and a ticket sign
    { const X = -14, Z = 8; part(props, B(6.4, 2.6, 0.4), toon('#2c2f36'), X, 1.3, Z + 1.6); for (let r = 0; r < 3; r++) { part(props, B(6.2, 0.06, 0.45), toon('#5a3a24', 'wood'), X, 0.6 + r * 0.7, Z + 1.3); part(props, B(6.2, 0.03, 0.03), glow(['#ff6aa8', '#4fd2ff', '#ffd36a'][r]), X, 0.62 + r * 0.7, Z + 1.07);
        for (let k = 0; k < 9; k++) { const px = X - 2.8 + k * 0.7, col = ['#c8402f', '#6fdc5a', '#7fae63', '#8a3a8a', '#ffd36a', '#4fd2ff'][(k + r * 2) % 6], py = 0.63 + r * 0.7; part(props, new THREE.SphereGeometry(0.17, 8, 6), toon(col), px, py + 0.17, Z + 1.3); part(props, new THREE.SphereGeometry(0.12, 8, 6), toon(col), px, py + 0.42, Z + 1.3);
          part(props, new THREE.SphereGeometry(0.025, 5, 4), dark, px - 0.045, py + 0.45, Z + 1.19); part(props, new THREE.SphereGeometry(0.025, 5, 4), dark, px + 0.045, py + 0.45, Z + 1.19); } }
      part(props, B(0.6, 0.9, 0.5), toon('#c8402f'), X + 2.4, 3.05, Z + 1.6); part(props, new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d89a40'), X + 2.4, 3.6, Z + 1.6); part(props, Cy(0.44, 0.44, 0.12, 12), toon('#6fce4a'), X + 2.4, 3.58, Z + 1.6);
      const tk = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshBasicMaterial({ map: signTex('🎟 TICKETS', '#0c0d14', '#ffd36a') })); tk.position.set(X - 1.4, 2.9, Z + 1.36); tk.rotation.y = Math.PI; props.add(tk);
      INTERACTS.push({ x: X, z: Z - 1.4, r: 2.2, label: '🎟 Prize counter', fn: openPrizes }); }
  } catch (e) { console.warn('arcade2', e); } }; }
// the old cabinets (Space Snake, Space Rocks) pay a few tickets too: one per 40 credits they pay out
{ const _c = arcOpen; arcOpen = window.arcOpen = window.openArcade = function (g) { const c0 = S.cr; _c(g); const iv = setInterval(() => { if (ARC.on) { if (S.cr > c0 + 0) { arcTix(Math.floor((S.cr - c0) / 40)); clearInterval(iv); } return; } clearInterval(iv); }, 300); }; }
