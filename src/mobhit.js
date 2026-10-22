// Stardust Books sells Aranus Man comics. Don Klunkleone holds court in the McKlunkies booths in the mall: nobody fences contraband
// (drugs aside) on any world until you do his "little favour": a hit on Glorbo Fishwhistle, the gentle alien who keeps the hydroponics
// fish tank. The Don's secret sauce, poured on a drug you made, makes a dose Glorbo won't walk away from. After that the tank is yours.
ITEMS.mob_sauce = { name: "The Don's Secret Sauce", v: 0, col: '#c8402f', quest: true, use: true, note: 'Use it on a drug you made. "Trust me. It\'s the sauce."' };
ITEMS.mob_tainted = { name: 'Extra Saucy Special', v: 0, col: '#7fff6a', quest: true, note: 'A drug with the Don\'s sauce on it. Glowing slightly. Humming slightly. For Glorbo only.' };
function mobS() { S.mob = S.mob || { st: 0 }; S.tank2 = S.tank2 || []; return S.mob; }
const mobIn = () => mobS().st >= 4;
const MOB = { glorbo: null };
function mobSay(lines, done, i) { i = i || 0; if (i >= lines.length) { closeDlg(); if (done) done(); return; } const [who, t] = lines[i];
  openDlg(who === 'You' ? 'You' : who === 'Glorbo' ? 'Fish tank keeper · Hydroponics' : 'McKlunkies · booth 4', who === 'Don' ? 'Don Klunkleone' : who === 'Glorbo' ? 'Glorbo Fishwhistle' : who); $('dlgLine').textContent = t;
  try { SFX.babble && SFX.babble(voicePitch(who), Math.min(14, 4 + (t.length >> 4))); } catch (_) {}
  acts([[i === lines.length - 1 ? 'Okay' : 'Next ▸', () => mobSay(lines, done, i + 1), true]]); }

// ---- Stardust Books ----
const STARDUST = [['aranus_comic', 120], ['aranus_gold', 600]];
function openStardust() {
  openDlg('Stardust Books', 'Clerk Pemberly'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `"Imported from Earth! The Astonishing Aranus Man. The tentacles are hand-inked." You have ${S.cr.toLocaleString()} cr.`;
    itemRows(rows, STARDUST.map(([k, p]) => [k, S.inv[k] || null, `${p} cr`, [['Buy', () => buy(k, p)]]])); };
  const buy = (k, p) => { if (S.cr < p) { SFX.hit(); log('Not enough credits.'); return; } if (invRoomFor(k) < 1) { invFullNote(k); return; } S.cr -= p; S.inv[k] = (S.inv[k] || 0) + 1; SFX.coin(); log(`+1 ${ITEMS[k].name}`, 'loot'); markDirty(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}

// ---- McKlunkies: a storefront with a giant Klunky on the mall's back wall; the door leads to the restaurant, built off to the side ----
const mckR = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5; return x - Math.floor(x); };
const MCKR = { x: 150, z: 0, fx: 16, fz: -33 }; // restaurant centre, storefront door
function mckOut() { SFX.door(); player.pos.set(MCKR.fx, 0, MCKR.fz + 2.2); player.yaw = Math.PI; }
function mckIn() { SFX.door(); player.pos.set(MCKR.x, 0, MCKR.z + 9.2); player.yaw = 0; }
function mobBooths() {
  const red = toon('#c8402f'), yel = toon('#ffd36a'), wht = toon('#f4f0e8'), dark = toon('#1a1418');
  const sign = (txt, bg, fg, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) })); m.position.set(x, y, z); m.rotation.y = ry || 0; levelGroup.add(m); return m; };
  // storefront on the back wall
  { const g = new THREE.Group(), { fx: X, fz: Z } = MCKR; part(g, B(11, 6.5, 0.8), red, X, 3.25, Z); part(g, B(11.2, 0.5, 1.0), yel, X, 6.5, Z + 0.1); part(g, B(11.2, 0.3, 1.0), yel, X, 0.15, Z + 0.1);
    part(g, B(2.6, 3.4, 0.1), toon('#3a2a1a'), X, 1.7, Z + 0.42); part(g, B(0.08, 3.2, 0.12), yel, X, 1.7, Z + 0.48); part(g, B(2.9, 0.2, 0.2), yel, X, 3.5, Z + 0.45);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(B(2.8, 2.2, 0.06), new THREE.MeshBasicMaterial({ color: '#ffc870' })); w.position.set(X + s * 3.3, 2.2, Z + 0.42); g.add(w); part(g, B(3.0, 0.15, 0.1), yel, X + s * 3.3, 3.35, Z + 0.45); }
    for (let i = 0; i < 6; i++) part(g, B(1.8, 0.1, 1.0), toon(i % 2 ? '#ffffff' : '#c8402f'), X - 4.5 + i * 1.8, 3.9, Z + 0.9, 0.35);
    levelGroup.add(g); sign('McKLUNKIES', MCK.col, MCK.yel, 7, 1.3, X, 5.1, Z + 0.45); box(X, Z, 5.6, 0.5);
    INTERACTS.push({ x: X, z: Z + 1.4, r: 2.2, label: '🍔 Enter McKlunkies', fn: mckIn });
    // Klunky: a giant grinning burger-headed mascot waving at the concourse
    const k = new THREE.Group(), kx = X + 7.6, kz = Z + 1.6;
    part(k, B(1.0, 3.0, 0.9), toon('#ffd36a'), -0.7, 1.5, 0); part(k, B(1.0, 3.0, 0.9), toon('#ffd36a'), 0.7, 1.5, 0); part(k, B(1.2, 0.5, 1.6), red, -0.7, 0.25, 0.3); part(k, B(1.2, 0.5, 1.6), red, 0.7, 0.25, 0.3);
    part(k, B(3.0, 3.4, 1.8), red, 0, 4.6, 0); part(k, B(3.05, 0.4, 1.85), yel, 0, 3.1, 0); part(k, Cy(0.5, 0.5, 0.1, 12), yel, 0, 5.0, 0.92, Math.PI / 2);
    const arm = new THREE.Group(), armR = new THREE.Group(); part(arm, B(0.8, 3.0, 0.8), red, 0, 1.5, 0); part(arm, new THREE.SphereGeometry(0.65, 10, 8), wht, 0, 3.3, 0); arm.position.set(-1.7, 5.9, 0); k.add(arm);
    part(armR, B(0.8, 2.6, 0.8), red, 0, -1.3, 0); part(armR, new THREE.SphereGeometry(0.65, 10, 8), wht, 0, -2.9, 0); armR.position.set(1.7, 6.0, 0); armR.rotation.z = 0.25; k.add(armR);
    const bun = new THREE.SphereGeometry(2.0, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2); part(k, bun, toon('#d89a40'), 0, 7.6, 0); part(k, Cy(2.1, 2.1, 0.5, 16), toon('#5a2a1a'), 0, 7.35, 0); part(k, Cy(2.2, 2.2, 0.15, 16), toon('#6fce4a'), 0, 7.6, 0);
    part(k, Cy(2.15, 2.15, 0.2, 16), toon('#ffd23a'), 0, 7.05, 0); part(k, Cy(2.0, 1.8, 0.9, 16), toon('#d89a40'), 0, 6.5, 0);
    for (const s of [-1, 1]) { part(k, new THREE.SphereGeometry(0.42, 10, 8), wht, s * 0.75, 8.5, 1.6); part(k, new THREE.SphereGeometry(0.2, 8, 6), dark, s * 0.75, 8.5, 1.98); }
    part(k, B(1.6, 0.3, 0.2), dark, 0, 6.5, 1.85); for (let i = 0; i < 8; i++) part(k, new THREE.SphereGeometry(0.07, 4, 4), wht, -0.9 + i * 0.26, 8.25 + Math.sin(i * 2.3) * 0.15, 1.9);
    k.position.set(kx, 0, kz); k.rotation.y = -0.35; levelGroup.add(k); box(kx, kz, 1.8, 1.2);
    levelAnims.push(t => { arm.rotation.z = 0.55 + Math.sin(t * 1.6) * 0.3; }); }
  mckRoom();
  INTERACTS.push({ x: -25.3, z: -4, r: 2.6, label: '📚 Stardust Books', fn: openStardust });
}
function mckRoom() {
  const { x: X, z: Z } = MCKR, W = 14, D = 11, H = 4.6, g = new THREE.Group(); g.userData.mck = 1; const SB = (w, h, d) => new THREE.BoxGeometry(w, h, d, Math.ceil(w / 1.2), Math.ceil(h / 1.2), Math.ceil(d / 1.2)), red = toon('#c8402f'), yel = toon('#ffd36a'), wht = toon('#f4f0e8');
  const sign = (txt, bg, fg, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) })); m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m; };
  // shell: checker floor, red and yellow walls, ceiling with light panels
  { const c = document.createElement('canvas'); c.width = c.height = 64; const x2 = c.getContext('2d'); x2.fillStyle = '#f4f0e8'; x2.fillRect(0, 0, 64, 64); x2.fillStyle = '#c8402f'; x2.fillRect(0, 0, 32, 32); x2.fillRect(32, 32, 32, 32);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 2, D / 2); t.magFilter = THREE.NearestFilter; const fl = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, D * 2, 14, 11), new THREE.MeshLambertMaterial({ map: t })); fl.rotation.x = -Math.PI / 2; fl.position.set(X, 0.02, Z); g.add(fl); }
  part(g, SB(W * 2, 0.2, D * 2), toon('#e8e0d0'), X, H, Z); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) part(g, B(2.4, 0.05, 1.2), glow('#fff4d8'), X - 10 + i * 6, H - 0.12, Z - 7 + j * 6);
  for (const [x, z, w, d] of [[X, Z - D, W * 2, 0.3], [X, Z + D, W * 2, 0.3], [X - W, Z, 0.3, D * 2], [X + W, Z, 0.3, D * 2]]) { part(g, SB(w, H, d), yel, x, H / 2, z); part(g, SB(w - 0.4, 1.1, d + 0.1), red, x, 0.55, z); box(x, z, w / 2, d / 2); }
  part(g, B(2.4, 3.2, 0.1), toon('#3a2a1a'), X, 1.6, Z + D - 0.2); sign('EXIT · ZELTAC MALL', '#0c0d14', '#7fff6a', 2.6, 0.4, X, 3.5, Z + D - 0.2, Math.PI);
  INTERACTS.push({ x: X, z: Z + D - 1.2, r: 2.0, label: 'Back to the mall', fn: mckOut });
  // counter, order-bot and the glowing menu board
  part(g, SB(13, 1.1, 1.2), red, X - 6, 0.55, Z - 7.5); part(g, B(13.2, 0.1, 1.4), yel, X - 6, 1.12, Z - 7.5); box(X - 6, Z - 7.5, 6.5, 0.6);
  part(g, SB(13, 2.4, 0.1), toon('#2a2a30'), X - 6, 3.1, Z - D + 0.2); sign('KLUNK BURGER 25 · KLUNK FRIES 12 · MEGA KLUNK 120', '#14100c', '#ffd36a', 12, 0.9, X - 6, 3.1, Z - D + 0.3);
  for (let i = 0; i < 3; i++) { const bot = new THREE.Group(); part(bot, B(0.8, 1.0, 0.6), toon('#b8bec8'), 0, 1.8, 0); part(bot, B(0.7, 0.4, 0.05), glow('#7fe8ff'), 0, 1.95, 0.31); part(bot, Cy(0.12, 0.12, 0.4), toon('#5d636c'), 0, 1.2, 0); part(bot, B(0.6, 0.15, 0.4), red, 0, 2.4, 0); bot.position.set(X - 10 + i * 4, 0, Z - 8.6); g.add(bot); levelAnims.push(t => { bot.position.y = Math.sin(t * 3 + i) * 0.05; }); }
  INTERACTS.push({ x: X - 6, z: Z - 6.4, r: 3.2, label: '🍔 Order at McKlunkies', fn: () => openMcK() });
  // dining tables with diners
  const sitAt = (make, x, z, ry) => { const o = buildChar(make, 'civ'), R = o.userData.rig; o.position.set(x, 0.45 - (R ? R.spec.hip : 0.95) + 0.07, z); sitChar(o, 0.45); o.rotation.y = ry; levelGroup.add(o); return o; };
  const looks = [['#3b4f7a', '#2c2a28', '#e0b892', '#1e1a18'], ['#5a6a3a', '#2c2a28', '#8a5a3a', '#3a2a1e'], ['#8a6fc4', '#1e1c22', '#9fe8ff', '#c86aff'], ['#c9a43a', '#3d3a36', '#c58a64', '#1e1a18'], ['#ff8a5a', '#2c2a28', '#7fdc6a', '#2a2a30']];
  let n = 0; for (const tx of [X - 11, X - 6.5, X - 2]) for (const tz of [Z - 2, Z + 3.5, Z + 8]) {
    part(g, Cy(0.15, 0.3, 0.75, 8), toon('#3a3d44'), tx, 0.37, tz); part(g, B(1.4, 0.08, 1.0), yel, tx, 0.78, tz); for (const s of [-1, 1]) part(g, B(1.4, 0.45, 0.5), red, tx, 0.22, tz + s * 0.95);
    part(g, Cy(0.2, 0.2, 0.15, 8), toon('#d89a40'), tx - 0.3, 0.9, tz); part(g, B(0.18, 0.25, 0.14), red, tx + 0.3, 0.92, tz); box(tx, tz, 0.8, 1.2);
    if ((n * 7) % 5 < 3) sitAt(() => makeCivilian(...looks[n % 5]), tx + (n % 2 ? 0.3 : -0.3), tz + (n % 2 ? 0.95 : -0.95), n % 2 ? Math.PI : 0); n++; }
  // the play place: tubes, a slide, a ball pit, kids and Lulu
  const P = { x: X + 8.5, z: Z + 6 };
  // ball pit (right) with a padded rim; climbing frame with a roof, ladder and a slide down into the pit (left)
  const pit = { x: P.x + 1.6, z: P.z, w: 5, d: 6 };
  part(g, SB(pit.w, 0.12, pit.d), toon('#4fa8ff'), pit.x, 0.07, pit.z);
  for (const [x, z, w, d] of [[pit.x, pit.z - pit.d / 2, pit.w + 0.4, 0.3], [pit.x, pit.z + pit.d / 2, pit.w + 0.4, 0.3], [pit.x - pit.w / 2, pit.z, 0.3, pit.d], [pit.x + pit.w / 2, pit.z, 0.3, pit.d]]) part(g, SB(w, 0.65, d), toon('#ff6aa8'), x, 0.33, z);
  box(pit.x, pit.z, pit.w / 2 + 0.2, pit.d / 2 + 0.2);
  const ball = ['#ff6aa8', '#ffd36a', '#4fd2ff', '#7fff6a', '#ff8a2a', '#c86aff']; for (let i = 0; i < 110; i++) part(g, new THREE.SphereGeometry(0.16, 6, 4), toon(ball[i % 6]), pit.x - pit.w / 2 + 0.35 + mckR(i) * (pit.w - 0.7), 0.25 + mckR(i + 3) * 0.25, pit.z - pit.d / 2 + 0.35 + mckR(i + 7) * (pit.d - 0.7));
  const fr = { x: P.x - 2.6, z: P.z - 1.2 }, py = 1.6;
  for (const [x, z] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) part(g, Cy(0.1, 0.1, 3.0, 8), toon('#ffd36a'), fr.x + x, 1.5, fr.z + z);
  part(g, B(2.7, 0.15, 2.7), toon('#c8402f'), fr.x, py, fr.z);
  // safety rails: a padded top bar and bars below it on three sides (the slide side stays open)
  for (const [x, z, w, d] of [[0, -1.3, 2.6, 0.1], [-1.3, 0, 0.1, 2.6], [0, 1.3, 2.6, 0.1]]) { part(g, B(w, 0.1, d), toon('#4fd2ff'), fr.x + x, py + 0.75, fr.z + z);
    const n2 = 7; for (let k = 0; k < n2; k++) { const f = -1.1 + k * 2.2 / (n2 - 1); part(g, B(0.05, 0.7, 0.05), toon('#ffd36a'), fr.x + (w > 1 ? f : x), py + 0.4, fr.z + (w > 1 ? z : f)); } }
  part(g, B(2.7, 0.3, 2.7), toon('#ffd36a'), fr.x, py - 0.2, fr.z);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.0, 4), toon('#ff6aa8')); roof.position.set(fr.x, 3.5, fr.z); roof.rotation.y = Math.PI / 4; g.add(roof);
  for (const s2 of [-1, 1]) part(g, B(0.08, py + 0.1, 0.08), toon('#ffd36a'), fr.x - 0.4 + s2 * 0.35, (py + 0.1) / 2, fr.z + 1.45); for (let r = 0; r < 4; r++) part(g, B(0.7, 0.06, 0.08), toon('#ffd36a'), fr.x - 0.4, 0.35 + r * 0.4, fr.z + 1.45);
  { const x0 = fr.x + 1.35, y0 = py, x1 = pit.x - 0.6, y1 = 0.45, len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    part(g, B(len, 0.08, 0.9), toon('#7fff6a'), cx, cy, fr.z, 0, 0, a); for (const s2 of [-1, 1]) part(g, B(len, 0.25, 0.06), toon('#3fbf4a'), cx, cy + 0.12, fr.z + s2 * 0.47, 0, 0, a);
    part(g, B(0.12, (y0 + y1) / 2, 0.12), toon('#ffd36a'), cx, (y0 + y1) / 4, fr.z); part(g, B(0.5, 0.08, 1.0), toon('#3fbf4a'), x1 + 0.1, y1 - 0.02, fr.z); }
  box(fr.x, fr.z, 1.45, 1.45);
  sign('KLUNKY\'S FUN ZONE', '#ff6aa8', '#ffffff', 4, 0.6, P.x, 3.9, P.z - 3.4); sign('NO ADULTS IN THE BALL PIT. WE MEAN IT, GARY.', '#ffffff', '#c8402f', 3.2, 0.35, P.x - 4.4, 1.5, P.z, Math.PI / 2);
  for (let i = 0; i < 4; i++) { const kid = buildChar(() => makeCivilian(ball[i], '#2c2a28', looks[i][2], '#1e1a18'), 'civ'); kid.scale.setScalar(0.55); levelGroup.add(kid); const st = {};
    levelAnims.push(t => { const a = t * (0.6 + i * 0.15) + i * 1.6; kid.position.set(P.x + 1.6 + Math.cos(a) * 1.5, 0.3 + Math.abs(Math.sin(t * 5 + i)) * 0.35, P.z + Math.sin(a) * 2.0); kid.rotation.y = Math.atan2(-Math.sin(a) * 1.5, Math.cos(a) * 2.0); animRig(kid, st, 1 / 60, t); }); }
  // Lulu stands at the pit gate by her little podium, watching the kids
  const LU = { x: pit.x - pit.w / 2 - 0.9, z: pit.z + pit.d / 2 - 0.6 };
  part(g, B(0.7, 1.0, 0.5), toon('#ff6aa8'), LU.x - 0.7, 0.5, LU.z + 0.6); part(g, B(0.75, 0.06, 0.55), toon('#ffd36a'), LU.x - 0.7, 1.03, LU.z + 0.6); part(g, B(0.3, 0.02, 0.2), wht, LU.x - 0.7, 1.07, LU.z + 0.6);
  const lulu = buildChar(ROMANCE.lulu.make, 'civ'); lulu.position.set(LU.x, 0, LU.z); lulu.rotation.y = -Math.PI / 2 - 0.5; levelGroup.add(lulu); solid(LU.x, LU.z, 0.4); box(LU.x - 0.7, LU.z + 0.6, 0.4, 0.3);
  INTERACTS.push({ x: LU.x, z: LU.z, r: 2.2, label: '💗 Talk to Lulu', fn: () => openRomance('lulu') });
  // the Don's corner: walled off at the back, dark wood, one low red lamp, smoke
  const C = { x: X + 9, z: Z - 6.5 };
  // walls of the den: solid, with a doorway near the front of the side wall; painted McKlunkies murals outside
  const dw = toon('#c8402f');
  part(g, SB(10.4, H, 0.3), dw, X + 8.8, H / 2, Z - 1.5); box(X + 8.8, Z - 1.5, 5.2, 0.2);
  part(g, SB(0.3, H, 7.6), dw, X + 3.6, H / 2, Z - 7.2); box(X + 3.6, Z - 7.2, 0.2, 3.8);
  part(g, SB(0.3, H, 0.5), dw, X + 3.6, H / 2, Z - 1.75); part(g, B(0.3, H - 2.5, 1.4), dw, X + 3.6, 2.5 + (H - 2.5) / 2, Z - 2.7);
  for (const z of [Z - 3.4, Z - 2.0]) part(g, B(0.4, 2.5, 0.12), toon('#c9a43a'), X + 3.6, 1.25, z); part(g, B(0.4, 0.12, 1.5), toon('#c9a43a'), X + 3.6, 2.5, Z - 2.7);
  { const dr = new THREE.Group(); part(dr, B(0.08, 2.4, 1.3), toon('#3a2014', 'wood'), 0, 1.2, -0.65); part(dr, new THREE.SphereGeometry(0.06, 6, 4), toon('#c9a43a'), 0.08, 1.1, -1.15); dr.position.set(X + 3.6, 0, Z - 2.05); dr.rotation.y = -1.3; g.add(dr); }
  const mural = (w, h, draw) => { const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w); const x2 = c.getContext('2d'); draw(x2, c.width, c.height); return new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) }); };
  const paint = (x2, w, h, n) => { x2.fillStyle = '#ffd36a'; x2.fillRect(0, 0, w, h); x2.fillStyle = '#c8402f'; x2.fillRect(0, h * 0.78, w, h * 0.22); x2.fillStyle = '#ffffff'; for (let i = 0; i < w; i += 16) x2.fillRect(i, h * 0.76, 8, 4);
    for (let i = 0; i < n; i++) { const cx = w * (i + 0.5) / n, cy = h * 0.42, r = Math.min(w / n, h) * 0.28; x2.fillStyle = '#d89a40'; x2.beginPath(); x2.arc(cx, cy - r * 0.2, r, Math.PI, 0); x2.fill(); x2.fillStyle = '#6fce4a'; x2.fillRect(cx - r, cy - r * 0.2, r * 2, r * 0.18); x2.fillStyle = '#5a2a1a'; x2.fillRect(cx - r, cy, r * 2, r * 0.3); x2.fillStyle = '#d89a40'; x2.fillRect(cx - r * 0.95, cy + r * 0.3, r * 1.9, r * 0.35);
      x2.fillStyle = '#fff'; x2.beginPath(); x2.arc(cx - r * 0.4, cy - r * 0.55, r * 0.2, 0, 7); x2.arc(cx + r * 0.4, cy - r * 0.55, r * 0.2, 0, 7); x2.fill(); x2.fillStyle = '#000'; x2.beginPath(); x2.arc(cx - r * 0.36, cy - r * 0.5, r * 0.09, 0, 7); x2.arc(cx + r * 0.44, cy - r * 0.5, r * 0.09, 0, 7); x2.fill(); }
    x2.fillStyle = '#c8402f'; x2.font = 'bold ' + Math.round(h * 0.12) + 'px monospace'; x2.textAlign = 'center'; x2.fillText('HOME OF THE KLUNK', w / 2, h * 0.14); };
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(9.8, H - 0.4), mural(9.8, H - 0.4, (x2, w, h) => paint(x2, w, h, 3))); m.position.set(X + 8.8, H / 2, Z - 1.5 + 0.17); g.add(m);
    const m2 = new THREE.Mesh(new THREE.PlaneGeometry(7.2, H - 0.4), mural(7.2, H - 0.4, (x2, w, h) => paint(x2, w, h, 2))); m2.position.set(X + 3.6 - 0.17, H / 2, Z - 7.2); m2.rotation.y = -Math.PI / 2; g.add(m2); }
  part(g, SB(10, 0.12, 9.6), toon('#4a2a1a', 'wood'), C.x, 0.06, C.z); part(g, SB(10, 0.1, 9.6), toon('#2a1814'), C.x, H - 0.15, C.z);
  // velvet walls over the yellow, wainscot, a rug, sconces, a painting of the Don, a bar cart and cigar smoke
  const vel = toon('#5a0e18', 'cloth'), wd = toon('#3a2014', 'wood');
  part(g, SB(10, H - 0.3, 0.08), vel, C.x, H / 2, Z - D + 0.2); part(g, SB(0.08, H - 0.3, 9.4), vel, X + W - 0.2, H / 2, C.z); part(g, SB(10, H - 0.3, 0.08), vel, C.x, H / 2, Z - 1.68); part(g, SB(0.08, H - 0.3, 7.4), vel, X + 3.78, H / 2, Z - 7.2);
  for (const [x, z, w, d] of [[C.x, Z - D + 0.26, 10, 0.08], [X + W - 0.26, C.z, 0.08, 9.4], [C.x, Z - 1.74, 10, 0.08], [X + 3.84, Z - 7.2, 0.08, 7.4]]) { part(g, SB(w, 1.1, d), wd, x, 0.6, z); part(g, B(w + (w > 1 ? 0 : 0.06), 0.08, d + (d > 1 ? 0 : 0.06)), toon('#c9a43a'), x, 1.18, z); }
  { const c = document.createElement('canvas'); c.width = 128; c.height = 104; const x2 = c.getContext('2d'); x2.fillStyle = '#7a1a1a'; x2.fillRect(0, 0, 128, 104); x2.fillStyle = '#c9a43a'; x2.fillRect(6, 6, 116, 92); x2.fillStyle = '#5a0e14'; x2.fillRect(10, 10, 108, 84); x2.strokeStyle = '#c9a43a'; x2.lineWidth = 2; x2.strokeRect(30, 26, 68, 52);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 4.5), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) })); rug.rotation.x = -Math.PI / 2; rug.position.set(C.x + 2.2, 0.16, C.z - 0.5); g.add(rug); }
  for (const [x, z, ry] of [[C.x - 2, Z - D + 0.3, 0], [C.x + 2, Z - D + 0.3, 0], [X + W - 0.3, C.z + 1.5, -Math.PI / 2]]) { const sc = new THREE.Group(); part(sc, B(0.12, 0.3, 0.1), toon('#c9a43a'), 0, 0, 0); part(sc, new THREE.ConeGeometry(0.18, 0.25, 8, 1, true), toon('#c8892a'), 0, 0.22, 0.12); part(sc, new THREE.SphereGeometry(0.06, 6, 4), glow('#ffb86a'), 0, 0.18, 0.12); sc.position.set(x, 2.7, z); sc.rotation.y = ry; g.add(sc);
    const L = new THREE.PointLight(0xffa04a, 0.7, 4.5, 2); L.position.set(x + (ry ? -0.5 : 0), 2.8, z + (ry ? 0 : 0.5)); g.add(L); }
  part(g, B(2.0, 1.5, 0.06), toon('#c9a43a'), C.x, 2.6, Z - D + 0.3); { const pc = document.createElement('canvas'); pc.width = 128; pc.height = 96; const x2 = pc.getContext('2d'); x2.fillStyle = '#2a1408'; x2.fillRect(0, 0, 128, 96); x2.fillStyle = '#d8a07a'; x2.beginPath(); x2.arc(64, 44, 22, 0, 7); x2.fill(); x2.fillStyle = '#1e1c22'; x2.fillRect(42, 18, 44, 12); x2.fillStyle = '#f4f0e8'; x2.fillRect(34, 66, 60, 30); x2.fillStyle = '#c8402f'; x2.fillRect(56, 66, 16, 30); x2.fillStyle = '#000'; x2.fillRect(54, 40, 5, 4); x2.fillRect(69, 40, 5, 4); x2.fillRect(56, 54, 16, 2);
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(pc) })); pm.position.set(C.x, 2.6, Z - D + 0.34); g.add(pm); }
  part(g, B(1.2, 0.9, 0.6), wd, X + W - 0.8, 0.45, C.z + 3.2); for (let i = 0; i < 5; i++) part(g, Cy(0.06, 0.08, 0.32, 6), toon(['#3a5a2a', '#7a3a1a', '#c9a43a', '#2a3a5a', '#5a2a1a'][i]), X + W - 1.25 + i * 0.22, 1.06, C.z + 3.2); box(X + W - 0.8, C.z + 3.2, 0.6, 0.3);
  for (let i = 0; i < 7; i++) { const sm = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#c8b8b0', transparent: true, opacity: 0.1, depthWrite: false })); sm.scale.setScalar(2 + (i % 3)); g.add(sm); levelAnims.push(t => { const a = t * 0.08 + i * 0.9; sm.position.set(C.x + 2 + Math.sin(a * 1.3) * 3, 2.3 + (i % 3) * 0.6 + Math.sin(a) * 0.3, C.z - 0.5 + Math.cos(a) * 2.6); }); }
  for (const [x, z] of [[C.x + 3, C.z - 2.5], [C.x + 3, C.z + 1.5]]) { part(g, B(1.6, 0.75, 1.0), toon('#2a1a14', 'wood'), x, 0.38, z); part(g, B(1.8, 0.08, 1.4), toon('#5a2a1a'), x, 0.78, z); for (const s of [-1, 1]) { part(g, B(1.8, 0.45, 0.6), toon('#5a0e14'), x, 0.22, z + s * 1.05); part(g, B(1.8, 1.0, 0.2), toon('#5a0e14'), x, 0.9, z + s * 1.35); } box(x, z, 0.95, 1.45); }
  const lampY = 2.6, lx = C.x + 3, lz = C.z - 2.5; part(g, Cy(0.01, 0.01, H - lampY, 4), toon('#111111'), lx, (H + lampY) / 2, lz); part(g, new THREE.ConeGeometry(0.45, 0.35, 12, 1, true), toon('#5a0e14'), lx, lampY, lz); part(g, new THREE.SphereGeometry(0.1, 8, 6), glow('#ff6a3a'), lx, lampY - 0.1, lz);
  const pl = new THREE.PointLight(0xff5a2a, 1.4, 6, 2); pl.position.set(lx, lampY - 0.3, lz); g.add(pl);
  part(g, Cy(0.28, 0.28, 0.22, 10), toon('#c8892a'), lx - 0.2, 0.92, lz); part(g, B(0.12, 0.3, 0.12), toon('#3a5a2a'), lx + 0.4, 0.97, lz); // Mega Klunk and a bottle
  sign('PRIVATE · FAMILY ONLY', '#1a0e0c', '#c9a43a', 1.4, 0.3, X + 3.4, 2.85, Z - 2.7, -Math.PI / 2);
  levelGroup.add(g);
  sitAt(() => makeCivilian('#f4f0e8', '#2a2a30', '#d8a07a', '#1e1c22', '#c8402f'), lx, lz - 0.95, 0);
  for (const [x, z, ry] of [[C.x - 0.4, C.z - 2.5, -1.2], [C.x + 0.2, C.z + 0.6, -2.2]]) { const o = buildChar(() => makeCivilian('#1e1c22', '#1e1c22', '#c58a64', '#1e1c22', '#3a3d44'), 'civ'); o.position.set(x, 0, z); o.rotation.y = ry; levelGroup.add(o); solid(x, z, 0.4); }
  INTERACTS.push({ x: lx - 1.6, z: lz, r: 2.4, label: '🍔 Talk to Don Klunkleone', fn: mobDon });
  // the corner is dim: the whole ship's lighting drops while you stand in it
  const inDen = () => player.pos.x > X + 3.6 && player.pos.z < Z - 1.5 && player.pos.x < X + W; MCKR.dim = MCKR.dim || 1;
  levelAnims.push(() => { const tgt = inDen() ? 0.45 : 1; if (Math.abs(MCKR.dim - tgt) < 0.01 && tgt === 1 && !MCKR.lit) return; MCKR.dim += (tgt - MCKR.dim) * 0.08; mckLight(MCKR.dim); });
}
function mckLight(k) { MCKR.lit = MCKR.lit || new Map(); scene.traverse(o => { if (!o.isLight || o.isPointLight || o.isSpotLight) return; if (!MCKR.lit.has(o)) MCKR.lit.set(o, o.intensity); o.intensity = MCKR.lit.get(o) * k; });
  if (k > 0.99) { MCKR.lit.forEach((v, o) => { o.intensity = v; }); MCKR.lit = null; MCKR.dim = 1; } }
{ const _ll = loadLevel; loadLevel = function () { if (MCKR.lit) mckLight(1); return _ll.apply(this, arguments); }; }
ROMANCE.lulu = { name: 'Lulu Sprinkles', role: 'McKlunkies play place attendant', away: 1, make: () => makeCivilian('#ff6aa8', '#f4f0e8', '#e0b892', '#ffd36a', '#c8402f'), x: 0, z: 0, face: 0,
  likes: ['klunkfries', 'klunkburger', 'megaklunk'], loves: 'megaklunk', perk: { txt: '+10% max HP', k: 'hp' },
  lines: { 0: ["Hi! Shoes off in the ball pit. Not you, you're too big. Gary, OFF.", "I've pulled forty-one socks out of that pit today. None of them match."], 1: ["Oh, it's you! The only grown-up here who doesn't try the slide.", "If a kid bites you, it's a compliment. Mostly."],
    2: ["I saved you a Klunk Fry. It fell on the floor but only for a second.", "Sometimes I hide in the tube on my break. It's very peaceful. It smells like feet."], 3: ["You're the best part of my shift. The second best is when they close the pit for cleaning.", "Wanna see the secret tube? There's no secret tube. I just wanted you to follow me."],
    4: ["I told the kids you're my boyfriend. Or girlfriend. They didn't care, they were eating crayons.", "When I'm with you I forget the ball pit exists. That's huge for me."], 5: ["My favourite person in the whole McKlunkies. Including Klunky. Don't tell Klunky.", "You're like a Mega Klunk. Too much, and exactly what I needed."] },
  flirtOk: ["Ooh. Say that again, but louder than the birthday party.", "Stop it. No, keep going. Gary, stop LOOKING."], flirtNo: ["Cute. I've heard better from a seven-year-old. Literally, an hour ago.", "That's a fries-level line. Bring me a Mega Klunk line."],
  dates: ["After closing she lets you into the ball pit. You both sink to the bottom and talk until the lights go off.", "She takes you to the Comet Cafe and orders for you. She's right about everything."] };
{ const _zb = LEVELS.zeltac.build; LEVELS.zeltac.build = function () { _zb.apply(this, arguments); try { mobBooths(); } catch (e) { console.warn('mob', e); } }; }

function mobDon() { const M = mobS();
  if (M.st === 0) return mobSay([
    ['Don', "Siddown. Not there, that's Sal's seat. Sal stands. Sal always stands."],
    ['Don', "You wanna move product. Hot stuff, stuff with serial numbers filed off. I respect that. But on every world, every McKlunkies back counter, every fence? Those are MY people."],
    ['You', "So how do I get in good with you?"],
    ['Don', "A little favour. There's a guy. Glorbo Fishwhistle. Hydroponics deck. Takes care of the fish tank."],
    ['Don', "Three weeks ago I ask him, polite, 'Glorbo, what's the fish's name?' And he says 'They don't have names, they're fish.' In front of my mother."],
    ['You', "That's... it?"],
    ['Don', "He also said the Klunk sauce tastes like a boot. My family's sauce. Four generations of sauce."],
    ['Don', "Here's the thing. Glorbo don't fight. No guns, no nothing. Never touched anything stronger than kelp tea. So you're gonna cook him something special."],
    ['Don', "Take the sauce. Pour it on a batch you made yourself, then let him try it. He takes one hit of that, he's swimming with the fishes. Get it? The fish? 'Cause he likes fish."],
    ['Big Sal', "Heh. Fishes."],
  ], () => { if (M.st >= 1) return; M.st = 1; S.inv.mob_sauce = 1; log("+1 The Don's Secret Sauce", 'loot'); toast('A LITTLE FAVOUR', 'Bring the sauce and any drug to Glorbo in Hydroponics', 3.5); markDirty(); });
  if (M.st < 3) return mobSay([['Don', M.st === 2 ? "You got the special? Good. Hydroponics deck. Take the tube up. Be friendly. He likes people who ask about the fish." : "Sauce goes on the product. Product goes in Glorbo. It ain't complicated. Bring a drug to Glorbo with the sauce in your pocket and pour it on when he's not looking."], ['Big Sal', "Heh. Fishes."]]);
  if (M.st === 3) return mobSay([
    ['Don', "I heard. Hydroponics guy says Glorbo did one bump, said 'oh, the fish are SINGING,' and went straight down like a dropped tray."],
    ['Don', "Beautiful. Tasteful. My mother cried. Happy tears, mostly."],
    ['Don', "You're family now. Any fence, any back counter, any world: tell 'em the Don sent you. And keep the tank. Somebody's gotta feed those things."],
    ['Big Sal', "Welcome to the family. We got jackets. We don't got jackets, I'm lying, but welcome."],
  ], () => { if (M.st >= 4) return; M.st = 4; toast('YOU\'RE IN', 'Contraband can be sold to fences and McKlunkies on every world', 4); SFX.levelup && SFX.levelup(); crime(10, 'Did a favour for the Don'); markDirty(); });
  mobSay([['Don', ["Siddown, eat something. You look thin.", "Glorbo's tank looks better than ever. You got an eye.", "If anybody gives you trouble at a back counter, you tell me. I'll have Sal stand near them."][Math.floor(Math.random() * 3)]]]);
}

// the sauce: used from the bag, it turns one drug into the special
{ const _iu = invUse; invUse = function (key) { const [t, id] = String(key).split(':');
  if (t === 'i' && id === 'mob_sauce') { const k = Object.keys(S.inv).find(x => ITEMS[x] && ITEMS[x].drug && S.inv[x] > 0);
    if (!k) { log("You need a drug to pour it on. Brew a batch at your lab first.", 'warn'); SFX.hit(); return; }
    S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; delete S.inv.mob_sauce; S.inv.mob_tainted = 1; mobS().st = 2; SFX.ui(); log(`You drown a dose of ${ITEMS[k].name} in the Don's sauce. It starts humming. +1 Extra Saucy Special`, 'loot'); toast('EXTRA SAUCY', 'Give it to Glorbo in Hydroponics', 3); markDirty(); try { invRender && invRender(); } catch (_) {} return; }
  return _iu.apply(this, arguments); }; }

// ---- Glorbo and the hydroponics tank ----
function mobHydro() { const M = mobS(); MOB.glorbo = null;
  // the old fish: hide them when the tank is yours and stocked
  const mine = M.st >= 3 && S.tank2.length; if (mine) levelGroup.children.forEach(o => { const p = o.geometry && o.geometry.parameters; if (p && p.width === 0.5 && p.height === 0.25 && p.depth === 0.12) o.visible = false; });
  MOB.live = new THREE.Group(); MOB.live.position.set(22, 0, -14); levelGroup.add(MOB.live); mobTankFill();
  if (M.st < 3) { const o = buildChar(() => recolor(makeElismas(), { '#9aa1aa': '#7fdc6a', '#5d636c': '#3a6a8a' }), 'elismas'); o.position.set(22, 0, -9.6); o.rotation.y = Math.PI; levelGroup.add(o); solid(22, -9.6, 0.45); MOB.glorbo = o;
    part(o, B(0.5, 0.5, 0.06), toon('#4fa8ff'), 0, 0.85, -0.28); // apron, worn (and falls with him)
    INTERACTS.push({ x: 22, z: -9.6, r: 2.4, label: '🐟 Talk to Glorbo', fn: mobGlorbo }); }
  mobTankDress(M.st >= 3);
}
// the tank itself: a pedestal with a trim light, a lid with lamps, gravel, plants, a little castle, rising bubbles, and a terminal to stock it
function mobTankDress(open) { const X = 22, Z = -14, g = new THREE.Group();
  part(g, Cy(3.3, 3.5, 0.6, 20), toonNS('#3a3d44', 'panel'), 0, 0.3, 0); part(g, Cy(3.36, 3.36, 0.08, 20), glow('#4fd2ff'), 0, 0.55, 0);
  part(g, Cy(3.3, 3.3, 0.5, 20), toonNS('#3a3d44', 'panel'), 0, 5.2, 0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, Cy(0.18, 0.25, 0.25, 8), glow('#fff4d8'), Math.cos(a) * 2.2, 4.85, Math.sin(a) * 2.2); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; part(g, B(0.25, 4.6, 0.25), toonNS('#5d636c', 'panel'), Math.cos(a) * 3.05, 2.9, Math.sin(a) * 3.05); }
  part(g, Cy(2.9, 2.9, 0.25, 20), toonNS('#c8b490'), 0, 0.72, 0); for (let i = 0; i < 30; i++) { const a = mckR(i + 400) * 7, r = mckR(i + 450) * 2.6; part(g, new THREE.DodecahedronGeometry(0.1, 0), toonNS(['#8a8f99', '#c8402f', '#ffd36a', '#4fd2ff'][i % 4]), Math.cos(a) * r, 0.88, Math.sin(a) * r); }
  for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 1.6 + (i % 3) * 0.4, h = 1.2 + (i % 3) * 0.6, pl = new THREE.Mesh(B(0.12, h, 0.04), toonNS(i % 2 ? '#3f7a3a' : '#6fce4a', 'leaves')); pl.position.set(Math.cos(a) * r, 0.85 + h / 2, Math.sin(a) * r); g.add(pl); levelAnims.push(t => { pl.rotation.z = Math.sin(t * 1.3 + i) * 0.15; }); }
  const ca = new THREE.Group(); part(ca, B(0.9, 0.8, 0.9), toonNS('#b8a888', 'stone'), 0, 0.4, 0); for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) part(ca, Cy(0.15, 0.15, 1.1, 6), toonNS('#b8a888', 'stone'), x, 0.55, z); part(ca, B(0.3, 0.4, 0.06), toonNS('#1e1a18'), 0, 0.2, 0.46); ca.position.set(-1, 0.85, 1); g.add(ca);
  const bb = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6 })); g.add(m); bb.push(m); }
  levelAnims.push(t => bb.forEach((m, i) => { const k = (t * 0.4 + i / 10) % 1; m.position.set(-1 + Math.sin(i * 2 + t) * 0.15, 1.8 + k * 3, 1 + Math.cos(i) * 0.15); }));
  g.position.set(X, 0, Z); levelGroup.add(g);
  // the terminal: a console on a stand, screen facing the walkway
  const T = new THREE.Group(); part(T, B(0.5, 1.0, 0.4), toonNS('#3a3d44', 'panel'), 0, 0.5, 0); part(T, B(1.0, 0.7, 0.12), toonNS('#2a2e36', 'panel'), 0, 1.3, 0, -0.35, 0, 0);
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 80; const c = cv.getContext('2d'); c.fillStyle = '#04141c'; c.fillRect(0, 0, 128, 80); c.fillStyle = open ? '#7fe8ff' : '#ff6a5a'; c.font = 'bold 12px monospace';
  c.fillText(open ? 'TANK CONTROL' : 'TANK CONTROL', 8, 18); c.fillText(open ? 'FISH: ' + (S.tank2 || []).length + '/10' : 'LOCKED', 8, 38); c.fillText(open ? 'TEMP 22C  OK' : 'KEEPER: GLORBO', 8, 58);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.56), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); scr.position.set(0, 1.32, 0.07); scr.rotation.x = -0.35; T.add(scr);
  T.position.set(X - 3.6, 0, Z + 3.6); T.rotation.y = -0.75; levelGroup.add(T); box(X - 3.6, Z + 3.6, 0.4, 0.4);
  INTERACTS.push({ x: X - 3.2, z: Z + 4.2, r: 2.0, label: open ? '🖥 Tank terminal: stock your fish' : '🖥 Tank terminal (locked)', fn: () => { if (open) openMobTank(); else { openDlg('Tank terminal', 'Hydroponics'); $('dlgLine').textContent = 'ACCESS DENIED. Keeper on duty: Glorbo Fishwhistle. "Don\'t touch my tank."'; acts([['Close', closeDlg, true]]); } } });
}
{ const _fb = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _fb.apply(this, arguments); try { if (zTheme(ZF.floor) === 'hydro') mobHydro(); } catch (e) { console.warn('mob hydro', e); } }; }

function mobGlorbo() { const M = mobS();
  if (!S.inv.mob_tainted && S.inv.mob_sauce) { const k = Object.keys(S.inv).find(x => ITEMS[x] && ITEMS[x].drug && S.inv[x] > 0); if (k) { S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; delete S.inv.mob_sauce; S.inv.mob_tainted = 1; M.st = 2; log(`You pour the Don's sauce on a dose of ${ITEMS[k].name} behind your back. It starts humming.`, 'loot'); }
    else { mobSay([['Glorbo', "Oh! Hello! Are you here about the fish? Nobody's ever here about the fish."], ['You', '(The sauce needs something to go on. Bring a drug, any drug, and pour it on right here.)']]); return; } }
  if (!S.inv.mob_tainted) return mobSay([['Glorbo', ["Oh! Hello! This is Bubbles. And that's Bubbles. And that one's also Bubbles. Easier that way.", "I feed them at nine, noon and whenever they look sad. They look sad a lot. I think it's the lighting.", "Have you tried kelp tea? It's very calming. I had two cups once and saw a colour."][Math.floor(Math.random() * 3)]]]);
  mobSay([
    ['Glorbo', "Oh! A visitor! Are you here about the fish? Nobody's ever here about the fish."],
    ['You', "Sure. Love fish. Hey, I made something. Homemade. Wanna try it?"],
    ['Glorbo', "Ooh, a snack? Is it kelp? It's glowing. Is it supposed to be humming?"],
    ['You', "That's how you know it's fresh."],
    ['Glorbo', "Well, I don't usually... but you came all the way up here about the fish..."],
    ['Glorbo', "*sniff* ...Oh. OH. Oh my. The fish. The fish are SINGING. Bubbles, you never told me you could SING."],
    ['Glorbo', "Tell Bubbles... tell all the Bubbles... feed at nine..."],
  ], mobOD);
}
function mobOD() { const M = mobS(), o = MOB.glorbo; if (M.st >= 3) return; delete S.inv.mob_tainted; M.st = 3; markDirty();
  if (o) { let t0 = performance.now(); const fall = () => { const k = Math.min(1, (performance.now() - t0) / 900); o.rotation.z = k * Math.PI / 2; o.position.y = k * 0.3; if (k < 1) requestAnimationFrame(fall); }; fall(); }
  SFX.hit && SFX.hit(); crime(15, 'Glorbo Fishwhistle'); toast('GLORBO IS SLEEPING WITH THE FISHES', 'Go tell the Don. The tank is yours now', 4);
  for (let i = INTERACTS.length - 1; i >= 0; i--) if (INTERACTS[i].fn === mobGlorbo) INTERACTS.splice(i, 1);
  for (const it of INTERACTS) if (/^🖥 Tank terminal/.test(it.label || '')) { it.label = '🖥 Tank terminal: stock your fish'; it.fn = openMobTank; } }

function mobTankFill() { const L = MOB.live; if (!L) return; for (const c of [...L.children]) { L.remove(c); disposeTree(c); }
  S.tank2.slice(0, 10).forEach((id, i) => { if (!ITEMS[id]) return; let f; try { f = makeFishModel(id); } catch (_) { return; }
    const b = new THREE.Box3().setFromObject(f), sz = b.getSize(new THREE.Vector3()), k = 0.7 / Math.max(sz.x, sz.z, 0.05), c = b.getCenter(new THREE.Vector3()).multiplyScalar(k);
    f.scale.setScalar(k); f.position.sub(c); const w = new THREE.Group(), turn = new THREE.Group(); turn.add(f); w.add(turn); L.add(w); w.userData = { sp: (0.08 + (i * 0.618 % 1) * 0.08) * (i % 3 === 1 ? -1 : 1), ph: i * 2.1, y0: 1.0 + (i % 5) * 0.7, r: 1.2 + (i % 3) * 0.5, sx: sz.x >= sz.z, turn }; });
}
setInterval(() => { try { const L = MOB.live; if (!L || !L.parent || !L.parent.parent) return; const t = performance.now() / 1000;
  for (const w of L.children) { const { sp, ph, y0, r, sx, turn } = w.userData, a = t * sp + ph; w.position.set(Math.cos(a) * r, y0 + Math.sin(t * 0.7 + ph) * 0.15, Math.sin(a) * r); turn.rotation.y = -a + (sp < 0 ? 0 : Math.PI) + (sx ? 0 : Math.PI / 2); } } catch (_) {} }, 33);
function openMobTank() { mobS();
  openDlg('Hydroponics', 'The big fish tank'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `Glorbo's old tank. Your fish replace the house fish. ${S.tank2.length}/10 in the tank.`;
    const have = [...angFish()].filter(k => S.inv[k] > 0);
    itemRows(rows, [...have.map(k => [k, S.inv[k], 'in your bag', [['Drop in', () => { if (S.tank2.length >= 10) { log('The tank is full.'); return; } S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; S.tank2.push(k); done(); }]]]),
      ...S.tank2.map((k, i) => [k, null, 'swimming', [['Take out', () => { if (invRoomFor(k) < 1) { invFullNote(k); return; } S.tank2.splice(i, 1); S.inv[k] = (S.inv[k] || 0) + 1; done(); }]]])]); };
  const done = () => { SFX.ui(); markDirty(); mobTankFill(); levelGroup.children.forEach(o => { const p = o.geometry && o.geometry.parameters; if (p && p.width === 0.5 && p.height === 0.25 && p.depth === 0.12) o.visible = !S.tank2.length; }); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
