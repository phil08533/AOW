// ---------------- The Low Tide, open for business: every storefront has a real door and a room behind it ----------------
// Rooms sit out at x=150 with the apartment interiors. Each one has its own keeper and something to buy or play.
const LT = { rooms: {} };
const LT_SHOPS = [
  { id: 'pawn', name: "CRABBY'S PAWN", col: '#ffd36a', wall: '#8a6a4a', floor: '#6a5a44' },
  { id: 'bar', name: 'THE BARNACLE BAR', col: '#4fffe0', wall: '#6a4a3a', floor: '#4a3a2a' },
  { id: 'ink', name: 'INK SQUID TATTOO', col: '#ff3bd2', wall: '#4a2a4a', floor: '#3a3a3a' },
  { id: 'arc', name: 'FISH FRY ARCADE', col: '#7fff6a', wall: '#2a2a50', floor: '#2a2a44' },
  { id: 'mart', name: '24/7 SHELLMART', col: '#ff6a3a', wall: '#e8e4dc', floor: '#c8c4bc' },
  { id: 'kar', name: 'KARAOKE CLAM', col: '#c86aff', wall: '#4a2a6a', floor: '#3a2448' }
];
const ltCr = n => { if (S.cr < n) { $('dlgLine').textContent = `"That's ${n} cr. You've got ${S.cr}. Maths is hard down here, but not that hard."`; SFX.ui(); return false; } S.cr -= n; SFX.coin(); markDirty(); return true; };
const ltHeal = k => { const mh = typeof maxHp === 'function' ? maxHp() : player.hp; player.hp = Math.min(mh, player.hp + mh * k); };
function ltRows() { clearRows(); const r = document.createElement('div'); r.className = 'rows'; r.id = 'shopRows'; $('dlgActs').before(r); return r; }

// ---- the rooms ----
function ltRoom(S0, k) { const X = 150, Zc = -32 - k * 14, W = 9, L = 10, wall = toonNS(S0.wall), g = levelGroup;
  part(g, B(W, 0.1, L), bcMat(S0.id === 'mart' ? 'tile' : S0.id === 'bar' || S0.id === 'pawn' ? 'wood' : 'carpet', 4, 5, S0.floor), X, 0.05, Zc); part(g, B(W, 0.1, L), toonNS('#4a4450'), X, 3.4, Zc);
  for (const s of [-1, 1]) { part(g, B(0.2, 3.4, L), S0.id === 'bar' || S0.id === 'pawn' ? bcMat('brick', 4, 2, S0.wall) : wall, X + s * (W / 2 + 0.1), 1.7, Zc); box(X + s * (W / 2 + 0.3), Zc, 0.3, L / 2);
    part(g, B(W, 3.4, 0.2), S0.id === 'bar' || S0.id === 'pawn' ? bcMat('brick', 4, 2, S0.wall) : wall, X, 1.7, Zc + s * (L / 2 + 0.1)); box(X, Zc + s * (L / 2 + 0.3), W / 2, 0.3); }
  for (let i = 0; i < 3; i++) { const pl = new THREE.PointLight(new THREE.Color(i === 1 ? S0.col : '#ffe0c0'), i === 1 ? 1.2 : 1.6, 12); pl.position.set(X + [-1.5, 2.5, 0][i], 3, Zc + [1, -2, 3.5][i]); g.add(pl); }
  for (const zz of [-2.5, 1.5]) part(g, B(1.6, 0.06, 0.5), glow('#fff4e0'), X, 3.33, Zc + zz);
  part(g, B(W - 0.4, 0.1, 0.1), glow(S0.col), X, 3.3, Zc - L / 2 + 0.06); part(g, B(W - 0.4, 0.1, 0.1), glow(S0.col), X, 3.3, Zc + L / 2 - 0.06);
  // the door back out, with an exit sign
  part(g, B(1.5, 2.4, 0.08), new THREE.MeshLambertMaterial({ color: '#9fd8ea', transparent: true, opacity: 0.5 }), X, 1.2, Zc + L / 2 - 0.02); part(g, B(1.7, 0.12, 0.12), toonNS('#2b2a2c'), X, 2.45, Zc + L / 2 - 0.05);
  bubSign('EXIT · BACK TO THE STRIP', '#1a3a1a', '#7fff6a', 1.4, 0.3, X, 2.75, Zc + L / 2 - 0.12, Math.PI);
  bubNeon(S0.name, S0.col, X, 2.7, Zc - L / 2 + 0.15, 0, 4.2);
  // a counter across the back with the keeper behind it
  part(g, B(4.4, 1.05, 0.8), toonNS('#3a2a20', 'wood'), X, 0.53, Zc - L / 2 + 1.9); part(g, B(4.6, 0.08, 0.95), toonNS(S0.id === 'mart' ? '#d8d0c0' : '#8a6a44', 'wood'), X, 1.08, Zc - L / 2 + 1.9); box(X, Zc - L / 2 + 1.9, 2.2, 0.45);
  // lived-in dressing: rug, wainscot, posters, corner plants, a ceiling fan, a stool and a regular
  part(g, B(3.6, 0.03, 2.6), toonNS(S0.col), X, 0.11, Zc + 1.2); part(g, B(3.2, 0.035, 2.2), toonNS('#2a2430'), X, 0.12, Zc + 1.2);
  for (const s of [-1, 1]) { part(g, B(0.06, 0.9, L - 0.4), toonNS('#3a2a20', 'wood'), X + s * (W / 2 - 0.03), 0.45, Zc); part(g, B(0.08, 0.06, L - 0.4), toonNS('#c9a43a'), X + s * (W / 2 - 0.05), 0.92, Zc);
    for (const zz of [1.2, 3.4]) { const pp = part(g, B(0.04, 0.9, 0.65), toonNS(['#c8402f', '#3a6ad0', '#e8c040', '#7a3ac0'][(k + zz + s + 3) % 4 | 0]), X + s * (W / 2 - 0.08), 2.05, Zc + zz); part(g, B(0.05, 0.98, 0.73), toonNS('#1a1418'), X + s * (W / 2 - 0.06), 2.05, Zc + zz); }
    const px = X + s * (W / 2 - 0.55), pz = Zc + L / 2 - 0.6; part(g, Cy(0.28, 0.22, 0.5, 10), toonNS('#8a4a2a'), px, 0.35, pz); for (let j = 0; j < 6; j++) part(g, new THREE.SphereGeometry(0.22, 7, 5), toonNS(j % 2 ? '#3f8a3a' : '#2e6a2e'), px + Math.cos(j) * 0.18, 0.75 + (j % 3) * 0.2, pz + Math.sin(j) * 0.18); solid(px, pz, 0.35); }
  { const fan = new THREE.Group(); fan.position.set(X, 3.15, Zc + 1.2); g.add(fan); part(fan, Cy(0.15, 0.15, 0.2, 10), toonNS('#2b2a2c'), 0, 0, 0); for (let j = 0; j < 4; j++) { const bl = part(fan, B(1.1, 0.03, 0.22), toonNS('#6a4f34', 'wood'), 0, -0.08, 0); bl.geometry.translate(0.6, 0, 0); bl.rotation.y = j * Math.PI / 2; } levelAnims.push(t => { fan.rotation.y = t * 2.4; }); }
  if (S0.id !== 'kar') { const sx = X + 2.6, sz = Zc - L / 2 + 2.9; part(g, Cy(0.25, 0.25, 0.08, 12), toonNS('#c8402f'), sx, 0.75, sz); part(g, Cy(0.05, 0.05, 0.7, 6), toonNS('#888'), sx, 0.38, sz); solid(sx, sz, 0.3);
    bubNpc(X - 2.9, Zc + 0.4, Math.PI * 0.6, [['#4a6a8a', '#8a4a6a', '#5a8a4a'][k % 3], '#3a3440', ['#c99a6e', '#8a5a3a', '#e8c09a'][k % 3], '#2a1a10'], null); }
  LT.rooms[S0.id] = { x: X, z: Zc, W, L };
  INTERACTS.push({ x: X, z: Zc + L / 2 - 1.1, r: 1.6, label: '🚪 Back out to the Low Tide', fn: () => ltLeave(S0.id) });
  return { X, Zc, W, L }; }
function ltEnter(id) { const R = LT.rooms[id], S0 = LT_SHOPS.find(s => s.id === id); if (!R) return; bubFade(S0.name, () => { player.pos.set(R.x, 0, R.z + R.L / 2 - 1.6); player.yaw = 0; player.vy = 0; }, null, 300); }
function ltLeave(id) { const o = LT.out[id]; bubFade('The Low Tide', () => { player.pos.set(o[0], 0, o[1]); player.yaw = o[2]; player.vy = 0; }, null, 300); }

// ---- what's inside each one ----
function ltDress() {
  const R = id => LT.rooms[id], keeper = (id, c, label, fn) => { const r = R(id); const n = bubNpc(r.x, r.z - r.L / 2 + 1.0, 0, c, null); INTERACTS.push({ x: r.x, z: r.z - r.L / 2 + 2.7, r: 1.8, label, fn }); return n; };
  // Crabby's Pawn: shelves of junk, a wall of TVs, a glass case
  { const r = R('pawn'); for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) { part(levelGroup, B(0.5, 0.06, 3.6), toonNS('#6a4f34', 'wood'), r.x + s * 4.1, 0.6 + k * 0.8, r.z); for (let j = 0; j < 4; j++) part(levelGroup, [B(0.3, 0.3, 0.3), Cy(0.12, 0.15, 0.4, 8), new THREE.SphereGeometry(0.17, 8, 6)][(j + k) % 3], toonNS(['#c9a43a', '#7fe8ff', '#c8402f', '#e8e4dc', '#4f9a4a'][(j + k + (s > 0 ? 2 : 0)) % 5]), r.x + s * 4.1, 0.82 + k * 0.8, r.z - 1.3 + j * 0.85); } box(r.x + s * 4.1, r.z, 0.3, 1.8); }
    for (let i = 0; i < 6; i++) { const tv = bubTV(0.8, 0.55); tv.position.set(r.x - 1.6 + (i % 3) * 1.6, 1.8 + Math.floor(i / 3) * 0.75, r.z - r.L / 2 + 0.25); levelGroup.add(tv); }
    part(levelGroup, B(2, 0.9, 0.8), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.4 }), r.x + 2, 0.45, r.z + 1); for (let j = 0; j < 4; j++) part(levelGroup, B(0.15, 0.08, 0.15), toonNS(j % 2 ? '#ffd36a' : '#c8d8e0'), r.x + 1.4 + j * 0.4, 0.6, r.z + 1); box(r.x + 2, r.z + 1, 1, 0.4);
    keeper('pawn', ['#c8402f', '#3a3d44', '#ff8a6a', '#e8e4dc'], '🦀 Crabby\'s Pawn', bubPawn); }
  // The Barnacle Bar: stools, bottles glowing on the back shelf, a booth, a dartboard
  { const r = R('bar'); for (let j = 0; j < 9; j++) part(levelGroup, Cy(0.06, 0.08, 0.32, 6), glow(['#4fffe0', '#ffd36a', '#ff6aa8', '#7fff6a'][j % 4]), r.x - 2 + j * 0.5, 1.75, r.z - r.L / 2 + 0.3); part(levelGroup, B(4.4, 0.06, 0.3), toonNS('#6a4f34', 'wood'), r.x, 1.57, r.z - r.L / 2 + 0.3);
    for (let j = 0; j < 4; j++) { part(levelGroup, Cy(0.22, 0.22, 0.08, 10), toonNS('#c8402f'), r.x - 1.5 + j, 0.75, r.z - r.L / 2 + 2.7); part(levelGroup, Cy(0.04, 0.04, 0.7, 5), toonNS('#2b2a2c'), r.x - 1.5 + j, 0.37, r.z - r.L / 2 + 2.7); }
    part(levelGroup, B(1.6, 0.9, 2.4), toonNS('#5a2a3a'), r.x + 3.4, 0.45, r.z + 1.2); part(levelGroup, B(0.9, 0.06, 1.6), toonNS('#6a4f34', 'wood'), r.x + 2.4, 0.78, r.z + 1.2); box(r.x + 3.2, r.z + 1.2, 1, 1.2);
    const db = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), new THREE.MeshBasicMaterial({ map: (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); for (let i = 8; i > 0; i--) { c.fillStyle = i % 2 ? '#1a1a1a' : '#e8e4dc'; if (i === 1) c.fillStyle = '#c8402f'; c.beginPath(); c.arc(32, 32, i * 4, 0, 7); c.fill(); } return new THREE.CanvasTexture(cv); })() }));
    db.position.set(r.x - r.W / 2 + 0.03, 1.7, r.z + 1.5); db.rotation.y = Math.PI / 2; levelGroup.add(db); INTERACTS.push({ x: r.x - r.W / 2 + 1.6, z: r.z + 1.5, r: 1.8, label: '🎯 Throw darts (50 cr)', fn: ltDarts });
    keeper('bar', ['#4fffe0', '#2c2a38', '#9fe8ff', '#3a2a1a'], '🍺 Order a drink', ltBar); }
  // Ink Squid: a tattoo chair, flash sheets all over the walls, a lamp
  { const r = R('ink'); const ch = new THREE.Group(); part(ch, B(0.8, 0.5, 1.8), toonNS('#1e1a18'), 0, 0.6, 0); part(ch, B(0.8, 0.9, 0.2), toonNS('#1e1a18'), 0, 1.1, -0.85, -0.3, 0, 0); part(ch, Cy(0.15, 0.25, 0.4, 8), toonNS('#c8ccd4'), 0, 0.2, 0); ch.position.set(r.x + 2.6, 0, r.z + 0.5); levelGroup.add(ch); box(r.x + 2.6, r.z + 0.5, 0.4, 0.9);
    part(levelGroup, Cy(0.03, 0.03, 1.8, 4), toonNS('#2b2a2c'), r.x + 3.6, 0.9, r.z - 0.6); part(levelGroup, new THREE.ConeGeometry(0.25, 0.3, 10, 1, true), toonNS('#ff3bd2'), r.x + 3.4, 1.85, r.z - 0.4, Math.PI, 0, 0);
    const designs = ['⚓', '🦑', '🐟', '💀', '❤', '🌊', '🦀', '⭐', '🐙', '🔱', '🍺', '☠'];
    for (let i = 0; i < 12; i++) { const cv = document.createElement('canvas'); cv.width = 48; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#f4f0e8'; c.fillRect(0, 0, 48, 64); c.strokeStyle = '#1e1a18'; c.lineWidth = 2; c.strokeRect(3, 3, 42, 58); c.font = '28px serif'; c.textAlign = 'center'; c.fillText(designs[i], 24, 42);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); const left = i < 6; m.position.set(left ? r.x - r.W / 2 + 0.03 : r.x + r.W / 2 - 0.03, 1.4 + (i % 2) * 0.75, r.z - 2 + Math.floor((i % 6) / 2) * 1.4); m.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; levelGroup.add(m); }
    keeper('ink', ['#1e1a18', '#3a3d44', '#e0b892', '#ff3bd2'], '🦑 Get some ink', ltInk); }
  // Fish Fry Arcade: rows of cabinets with live screens, a claw machine with a crab in it
  { const r = R('arc'), screens = []; for (let i = 0; i < 6; i++) { const left = i < 3, cab = new THREE.Group(); part(cab, B(0.9, 1.8, 0.8), toonNS(['#c8402f', '#3a5266', '#7a3a8a'][i % 3]), 0, 0.9, 0); part(cab, B(0.9, 0.1, 0.5), toonNS('#2b2a2c'), 0, 1.05, 0.4, -0.3, 0, 0); part(cab, B(0.95, 0.25, 0.85), glow(['#7fff6a', '#ffd36a', '#4fd2ff'][i % 3]), 0, 1.92, 0);
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; const tx = new THREE.CanvasTexture(cv), sc = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.52), new THREE.MeshBasicMaterial({ map: tx })); sc.position.set(0, 1.45, 0.41); cab.add(sc); screens.push([cv, tx, i]);
      cab.position.set(left ? r.x - 3.6 : r.x + 3.6, 0, r.z - 1.8 + (i % 3) * 1.6); cab.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; levelGroup.add(cab); box(cab.position.x, cab.position.z, 0.5, 0.5); if (i === 1) INTERACTS.push({ x: r.x - 2.6, z: r.z - 0.2, r: 1.4, label: '🐟 Play Fish Fry (20 cr)', fn: ltFishFry }); }
    let f = 0; levelAnims.push(t => { if ((f++ & 7) || Math.abs(player.pos.x - 150) > 12) return; for (const [cv, tx, i] of screens) { const c = cv.getContext('2d'); c.fillStyle = '#0a0a18'; c.fillRect(0, 0, 64, 48); c.fillStyle = ['#7fff6a', '#ffd36a', '#4fd2ff'][i % 3]; for (let k = 0; k < 4; k++) c.fillRect(((t * 30 + k * 17 + i * 9) % 70) - 6, 8 + k * 9, 6, 4); c.fillStyle = '#ff3bd2'; c.fillRect(28 + Math.sin(t * 3 + i) * 20, 40, 8, 4); c.fillStyle = '#fff'; c.font = '7px monospace'; c.fillText('HI ' + (S.flags.ffHi || 0), 3, 7); tx.needsUpdate = true; } });
    const claw = new THREE.Group(); part(claw, B(1.2, 0.9, 1.2), toonNS('#ff6aa8'), 0, 0.45, 0); part(claw, B(1.2, 1.4, 1.2), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.3 }), 0, 1.6, 0); part(claw, B(1.25, 0.2, 1.25), glow('#ffd36a'), 0, 2.4, 0);
    const crab = new THREE.Group(); part(crab, new THREE.SphereGeometry(0.18, 8, 6), toonNS('#ff3b2a'), 0, 0, 0); for (const s of [-1, 1]) part(crab, B(0.12, 0.08, 0.08), toonNS('#ff3b2a'), s * 0.24, 0.02, 0.1); crab.position.y = 1.05; claw.add(crab); claw.position.set(r.x, 0, r.z + 1.8); levelGroup.add(claw); box(r.x, r.z + 1.8, 0.65, 0.65);
    levelAnims.push(t => { crab.position.x = Math.sin(t * 0.8) * 0.35; crab.rotation.y = Math.sin(t * 1.3) * 0.8; });
    keeper('arc', ['#7fff6a', '#2c2a38', '#c58a64', '#1e1a18'], '🎟 Talk to Token Tony', () => bubTalk('Fish Fry Arcade', 'Token Tony', [`High score on Fish Fry: ${S.flags.ffHi || 0}. ${S.flags.ffHi > 40 ? 'That one\'s yours. AAA is furious.' : 'Nobody beats AAA. Prove me wrong.'}`, 'The claw machine has a real crab in it. He wins every time. Fish Fry is the cabinet on the left.'])); }
  // 24/7 Shellmart: aisles, a fridge wall, a slushie machine
  { const r = R('mart'); for (const xo of [-2.2, 2.2]) { part(levelGroup, B(0.9, 1.5, 4.5), toonNS('#c8ccd4'), r.x + xo, 0.75, r.z + 0.8); for (let k = 0; k < 3; k++) for (let j = 0; j < 8; j++) for (const s of [-1, 1]) part(levelGroup, B(0.12, 0.28, 0.35), toonNS(['#ff6a3a', '#ffd36a', '#4fd2ff', '#7fff6a', '#ff6aa8'][(j + k + (xo > 0 ? 2 : 0)) % 5]), r.x + xo + s * 0.5, 0.45 + k * 0.45, r.z - 1.1 + j * 0.52); box(r.x + xo, r.z + 0.8, 0.5, 2.3); }
    for (let j = 0; j < 4; j++) { part(levelGroup, B(0.9, 2.2, 0.1), new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.45 }), r.x - r.W / 2 + 0.4, 1.1, r.z - 3 + j * 1.0, 0, Math.PI / 2, 0); part(levelGroup, B(0.05, 2.1, 0.9), glow('#e8f8ff'), r.x - r.W / 2 + 0.25, 1.1, r.z - 3 + j * 1.0); }
    part(levelGroup, B(0.7, 1.6, 0.6), toonNS('#3a3d44'), r.x + 3.6, 0.8, r.z - 3); for (const s of [-1, 1]) { const sl = part(levelGroup, Cy(0.18, 0.18, 0.4, 10), new THREE.MeshLambertMaterial({ color: s > 0 ? '#4fd2ff' : '#ff3b6a', transparent: true, opacity: 0.8 }), r.x + 3.6 + s * 0.17, 1.4, r.z - 2.85); }
    keeper('mart', ['#ff6a3a', '#2c2a38', '#e0b892', '#3a2a1a'], '🛒 Buy snacks and supplies', ltMart); }
  // Karaoke Clam: a stage, a mic stand, a spinning disco ball, booths
  { const r = R('kar'); part(levelGroup, B(4, 0.3, 2.4), toonNS('#3a2448'), r.x, 0.15, r.z - r.L / 2 + 1.4); box(r.x, r.z - r.L / 2 + 1.4, 2, 1.2);
    part(levelGroup, Cy(0.03, 0.03, 1.4, 5), toonNS('#c8ccd4'), r.x, 1.0, r.z - r.L / 2 + 2.2); part(levelGroup, new THREE.SphereGeometry(0.07, 8, 6), toonNS('#2b2a2c'), r.x, 1.72, r.z - r.L / 2 + 2.2);
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), new THREE.MeshLambertMaterial({ color: '#e8e8f0', flatShading: true, emissive: '#3a3a4a' })); ball.position.set(r.x, 2.9, r.z); levelGroup.add(ball);
    const spots = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.25, 8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: ['#ff3bd2', '#4fd2ff', '#ffd36a'][i % 3], transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); levelGroup.add(m); spots.push(m); }
    levelAnims.push(t => { ball.rotation.y = t * 0.8; spots.forEach((m, i) => { const a = t * 0.8 + i * 1.05; m.position.set(r.x + Math.cos(a) * (2 + (i % 2)), 0.12, r.z + Math.sin(a) * (2 + (i % 2)) * 0.8); }); });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.MeshBasicMaterial({ map: bubSignTex('♪ NOW SINGING · YOU, PROBABLY', '#14081e', '#c86aff', 2.6, 1.2) })); scr.position.set(r.x, 2.1, r.z - r.L / 2 + 0.13); levelGroup.add(scr);
    for (const s of [-1, 1]) { part(levelGroup, B(1.4, 0.8, 1.8), toonNS('#6a2a5a'), r.x + s * 3.5, 0.4, r.z + 2); box(r.x + s * 3.5, r.z + 2, 0.7, 0.9); }
    const mc = bubNpc(r.x + 2.6, r.z - r.L / 2 + 1.4, 0, ['#c86aff', '#2c2a38', '#8a5a3a', '#ffd36a'], null);
    INTERACTS.push({ x: r.x, z: r.z - r.L / 2 + 3.2, r: 1.8, label: '🎤 Sing a song (free)', fn: ltKaraoke }); }
}

// ---- the bar ----
function ltBar() { openDlg('The Barnacle Bar', 'Shelly'); $('dlgLine').textContent = '"We serve two drinks: Salt and Saltier. Then there\'s the Kelp Fizz, which we don\'t talk about."';
  const buy = (n, cr, k, line) => () => { if (!ltCr(cr)) return; ltHeal(k); $('dlgLine').textContent = line; toast(n, `Healed ${Math.round(k * 100)}%`, 1.6); };
  acts([['Salt · 10 cr', buy('SALT', 10, 0.1, '"Salt. Bold choice. Tastes like the ocean, because it is."')], ['Saltier · 25 cr', buy('SALTIER', 25, 0.25, '"Saltier. You feel your eyebrows tighten."')], ['Kelp Fizz · 60 cr', buy('KELP FIZZ', 60, 1, '"It glows. You glow. Everything is fine."'), true], ['Done', closeDlg]]); }
function ltDarts() { openDlg('The Barnacle Bar', 'Darts'); $('dlgLine').textContent = 'Three darts. Score 100 or more and the bar pays out 300 cr. 50 cr a round.';
  let n = 0, tot = 0; const throwOne = () => { const r = Math.random(), sc = r < 0.06 ? 50 : r < 0.2 ? 25 : r < 0.45 ? 20 : r < 0.7 ? 15 : r < 0.9 ? 5 : 0; n++; tot += sc; SFX.hit && SFX.hit();
      $('dlgLine').textContent = `Dart ${n}: ${sc === 50 ? 'BULLSEYE! 50' : sc === 0 ? 'Missed the board. The wall felt that. 0' : sc}. Total ${tot}.`;
      if (n < 3) acts([['Throw ▸', throwOne, true]]); else { const win = tot >= 100; if (win) { S.cr += 300; markDirty(); SFX.quest(); toast('DARTS', '+300 cr', 2); } $('dlgLine').textContent += win ? ' The bar groans and pays out 300 cr.' : ' Not quite. Shelly pretends not to have watched.'; acts([['Again · 50 cr', ltDarts], ['Done', closeDlg, true]]); } };
  acts([['Pay 50 cr and throw', () => { if (ltCr(50)) { tot = 0; n = 0; throwOne(); } }, true], ['Not now', closeDlg]]); }

// ---- Ink Squid: tattoos you collect (they stay on your record) ----
const LT_INK = [['anchor', '⚓ Anchor', 200, 'Classic. Never drifts.'], ['squid', '🦑 Ink Squid', 350, 'The house special. Eight arms of commitment.'], ['skull', '💀 Deep Skull', 500, 'Says "I have seen the trench."'], ['heart', '❤ MUM (almost)', 150, 'Spelled MOM. Close enough.'], ['trident', '🔱 Trident', 800, 'For people who rule the seas, or think they do.']];
function ltInk() { openDlg('Ink Squid Tattoo', 'Inky'); const has = S.flags.ink || {}, own = LT_INK.filter(t => has[t[0]]).map(t => t[1]);
  $('dlgLine').textContent = own.length ? `"Your ink so far: ${own.join(', ')}. There's always room on the other arm."` : '"Eight arms, eight needles, zero waiting. Pick a design."';
  const rows = ltRows(); LT_INK.forEach(([id, nm, cr, d]) => { const row = document.createElement('div'); row.className = 'rowi'; row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 0'; row.innerHTML = `<span style="flex:1"><b>${nm}</b><br><small style="opacity:.7">${d}</small></span>`; const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = has[id] ? 'Inked ✓' : cr + ' cr'; b.disabled = !!has[id];
    b.addEventListener('click', () => { if (!ltCr(cr)) return; S.flags.ink = S.flags.ink || {}; S.flags.ink[id] = 1; markDirty(); toast('NEW INK', nm, 2.2); SFX.quest(); ltInk(); $('dlgLine').textContent = `"Hold still... done. ${nm}. Looks great. Don't get it wet. ...You live underwater. Never mind."`; }); row.appendChild(b); rows.appendChild(row); });
  acts([['Done', closeDlg, true]]); }

// ---- Shellmart ----
function ltMart() { openDlg('24/7 Shellmart', 'Clerk'); $('dlgLine').textContent = '"Welcome to Shellmart. We\'re open all night because nobody knows what time it is down here."';
  const item = (lbl, cr, fn) => [lbl + ' · ' + cr + ' cr', () => { if (ltCr(cr)) fn(); }];
  acts([item('Kelp Chips', 15, () => { ltHeal(0.15); $('dlgLine').textContent = '"Kelp chips. Crunchy, green, legally food."'; }), item('Slushie', 30, () => { ltHeal(0.3); $('dlgLine').textContent = '"Blue raspberry. Raspberries are not blue. Neither is this, by the end."'; }),
    item('Medkit', 400, () => { S.inv.medkit = (S.inv.medkit || 0) + 1; markDirty(); toast('MEDKIT', '+1 Medkit', 1.6); $('dlgLine').textContent = '"One medkit. Expiry date is a suggestion."'; }), ['Done', closeDlg, true]]); }

// ---- Fish Fry: tap the fish before it dives ----
function ltFishFry() { if (S.cr < 20) { openDlg('Fish Fry Arcade', 'Fish Fry'); ltCr(20); acts([['Okay', closeDlg, true]]); return; } ltCr(20); openDlg('Fish Fry Arcade', 'Fish Fry'); const rows = ltRows(); rows.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0';
  const cells = []; for (let i = 0; i < 12; i++) { const b = document.createElement('button'); b.className = 'pbtn'; b.style.cssText = 'height:52px;font-size:26px'; b.textContent = '·'; rows.appendChild(b); cells.push(b); }
  let score = 0, left = 30, cur = -1, run = true; const hi = S.flags.ffHi || 0;
  const draw = () => { $('dlgLine').textContent = `Tap the fish! Score ${score} · ${left} fish to go · High score ${hi}`; };
  cells.forEach((b, i) => b.addEventListener('click', () => { if (!run) return; if (i === cur) { score += 2; SFX.coin(); b.textContent = '✨'; cur = -1; } else { score = Math.max(0, score - 1); SFX.ui(); } draw(); }));
  const step = () => { if (!run || !dlgOpen || $('dlgName').textContent !== 'Fish Fry') { run = false; return; } cells.forEach(c => c.textContent = '·'); if (left <= 0) return end(); cur = Math.floor(Math.random() * 12); cells[cur].textContent = Math.random() < 0.15 ? '🐡' : '🐟'; left--; draw(); setTimeout(step, Math.max(380, 820 - (30 - left) * 15)); };
  const end = () => { run = false; const prize = score * 15; if (prize) { S.cr += prize; markDirty(); } if (score > hi) { S.flags.ffHi = score; markDirty(); toast('NEW HIGH SCORE', `${score} on Fish Fry`, 2.4); SFX.quest(); }
    clearRows(); $('dlgLine').textContent = `GAME OVER. Score ${score}. Tickets cashed in for ${prize} cr.${score > hi ? ' New high score! AAA has been dethroned.' : ''}`; acts([['Play again · 20 cr', ltFishFry, true], ['Done', closeDlg]]); };
  acts([['Quit', () => { run = false; closeDlg(); }]]); draw(); setTimeout(step, 700); }

// ---- Karaoke: hit the notes as the marker crosses the glowing zone ----
const LT_SONGS = [['Under the Sea Floor', 1.0], ['Total Eclipse of the Trench', 1.25], ['Shell Yeah', 1.5]];
function ltKaraoke() { openDlg('Karaoke Clam', 'Pick a song'); $('dlgLine').textContent = 'The crowd is ready. Mostly. One of them is asleep. Pick a song.';
  acts(LT_SONGS.map(([nm, sp], i) => [`${nm} ${'★'.repeat(i + 1)}`, () => ltSing(nm, sp, i)]).concat([['Not tonight', closeDlg]])); }
function ltSing(nm, sp, lvl) { openDlg('Karaoke Clam', '♪ ' + nm); const rows = ltRows(); rows.innerHTML = '<div style="position:relative;height:26px;background:#14081e;border:1px solid #c86aff;margin:8px 0"><i id="ltZone" style="position:absolute;top:0;bottom:0;background:rgba(200,106,255,.45)"></i><b id="ltMark" style="position:absolute;top:-3px;bottom:-3px;width:5px;background:#fff;box-shadow:0 0 8px #fff"></b></div>';
  let hits = 0, n = 0, ph = 0, z0 = 0.4, zw = 0.22 - lvl * 0.04, run = true, last = performance.now(); const notes = 8;
  const newZone = () => { z0 = 0.1 + Math.random() * (0.8 - zw); const z = $('ltZone'); if (z) { z.style.left = z0 * 100 + '%'; z.style.width = zw * 100 + '%'; } }; newZone();
  const tick = () => { if (!run || !dlgOpen || !$('ltMark')) { run = false; return; } const now = performance.now(); ph += (now - last) / 1000 * sp * 1.4; last = now; const p = 0.5 + 0.5 * Math.sin(ph * 2.4); const m = $('ltMark'); if (m) m.style.left = p * 100 + '%'; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  const sing = () => { if (!run) return; const p = 0.5 + 0.5 * Math.sin(ph * 2.4), ok = p >= z0 && p <= z0 + zw; n++; if (ok) { hits++; SFX.coin(); } else SFX.ui();
    $('dlgLine').textContent = ok ? ['♪ Nailed it!', '♪ The crowd sways.', '♪ Someone lights a glowstick.', '♪ A fish cries. Good tears.'][n % 4] : ['♪ ...that was a note. Technically.', '♪ The asleep one wakes up. Unhappily.', '♪ Off-key, but with feeling.'][n % 3];
    if (n >= notes) { run = false; const stars = hits >= 7 ? 3 : hits >= 5 ? 2 : hits >= 3 ? 1 : 0, prize = [0, 50, 150, 400][stars] * (lvl + 1); if (prize) { S.cr += prize; markDirty(); } if (stars === 3) { SFX.quest(); toast('STANDING OVATION', `+${prize} cr`, 2.4); }
      clearRows(); $('dlgLine').textContent = `${hits}/${notes} notes. ${'★'.repeat(stars) || 'No stars'}. ${['The crowd throws a shoe. It\'s fine.', 'Polite clapping.', 'The crowd goes wild. Tips: ' + prize + ' cr.', 'STANDING OVATION. The clam MC weeps. Tips: ' + prize + ' cr.'][stars]}${stars === 1 ? ' Tips: ' + prize + ' cr.' : ''}`;
      acts([['Another song', ltKaraoke, true], ['Done', closeDlg]]); return; } newZone(); };
  $('dlgLine').textContent = `♪ ${nm}. Hit SING when the marker is in the purple. ${notes} notes.`; acts([['🎤 SING', sing, true], ['Stop', () => { run = false; closeDlg(); }]]); }

// ---- wire it into the Low Tide: doors on every front, rooms out back, domes over the far-off interiors ----
function ltDoors() { LT.out = {}; const D = bcD('low');
  LT_SHOPS.forEach((S0, i) => { const p = BC.low[S0.id]; if (!p) return; const side = p[1] > D.z ? 1 : -1, fx = p[0], fz = p[1] + side * 1.2; // front face of the shop
    // a proper shop door: painted panels, a round porthole glowing from inside, brass handle and kick plate, a frame, a step, a lamp and an OPEN sign
    const dc = ['#7a3a2a', '#2a5a5a', '#4a2a5a', '#2a4a2a', '#8a4a1a', '#3a2a6a'][i], dr = new THREE.Group(), dm = toonNS(dc, 'wood');
    part(dr, B(1.1, 2.15, 0.08), dm, 0, 1.12, 0); for (const py of [0.55, 1.15]) for (const px of [-0.25, 0.25]) part(dr, B(0.38, 0.45, 0.03), toonNS(dc), px, py, 0.05);
    part(dr, new THREE.TorusGeometry(0.2, 0.04, 6, 16), toonNS('#c9a43a'), 0, 1.7, 0.05); part(dr, new THREE.CircleGeometry(0.18, 16), glow(S0.col), 0, 1.7, 0.045); part(dr, Cy(0.03, 0.03, 0.18, 6), toonNS('#c9a43a'), 0.42, 1.05, 0.08, 0, 0, Math.PI / 2); part(dr, B(1.0, 0.15, 0.02), toonNS('#c9a43a'), 0, 0.12, 0.05);
    part(dr, B(1.4, 0.14, 0.16), toonNS('#2b2a2c'), 0, 2.27, 0.02); for (const s of [-1, 1]) part(dr, B(0.12, 2.3, 0.16), toonNS('#2b2a2c'), s * 0.61, 1.15, 0.02); part(dr, B(1.5, 0.12, 0.5), toonNS('#5d636c', 'panel'), 0, 0.06, 0.25);
    part(dr, B(0.12, 0.12, 0.25), toonNS('#2b2a2c'), 0.9, 2.2, 0.12); part(dr, new THREE.SphereGeometry(0.1, 8, 6), glow('#ffe9a0'), 0.9, 2.08, 0.25);
    { const op = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.24), new THREE.MeshBasicMaterial({ map: bubSignTex('OPEN', '#120818', S0.col, 0.62, 0.24) })); op.position.set(-0.95, 1.6, 0.04); dr.add(op); } dr.position.set(fx, 0, fz); dr.rotation.y = side > 0 ? Math.PI : 0; levelGroup.add(dr);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6).rotateX(-Math.PI / 2), toonNS(S0.col)); mat.position.set(fx, 0.14, fz - side * 0.75); levelGroup.add(mat);
    LT.out[S0.id] = [fx, fz - side * 1.8, side > 0 ? 0 : Math.PI];
    INTERACTS.push({ x: fx, z: fz - side * 0.8, r: 1.6, label: `🚪 Go into ${S0.name.toLowerCase().replace(/(^|[\s\/])\w/g, c => c.toUpperCase())}`, fn: () => ltEnter(S0.id) }); });
  LT_SHOPS.forEach((S0, k) => ltRoom(S0, k)); ltDress();
  // the interiors sit out on the sea floor; give them glass domes so they read as part of the city from a distance
  for (const [x, z, r] of [[150, 0, 16], [150, 60, 7], [150, -67, 44]]) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })));
    for (let i = 0; i < 8; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.25, 5, 28, Math.PI), toonNS('#7a808a')); rib.rotation.y = (i + 0.5) / 8 * Math.PI; g.add(rib); }
    const base = new THREE.Mesh(new THREE.TorusGeometry(r, 0.5, 6, 40), toonNS('#4a4f58', 'panel')); base.rotation.x = Math.PI / 2; base.position.y = 0.25; g.add(base); g.position.set(x, 0, z); levelGroup.add(g); } }
{ const L = LEVELS.bubblecity, _b = L.build; L.build = function () { const r = _b.apply(this, arguments); try { ltDoors(); } catch (e) { console.warn('lowtide', e); } return r; }; }
