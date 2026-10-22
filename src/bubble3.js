// Bubble City, rebuilt as a real undersea city: five glass domes on the seabed joined by glass tunnels.
// Bubble Central (hub, plaza, the way out) sits in the middle; Kelp Gardens + Dome Control to the north, the Burbs to the east,
// the Low Tide to the west, and Coral Heights to the south. Interiors (the apartment hallway and flat 6B) stay at x=150 from dome2.js.
const BC = {
  domes: [
    { id: 'hub', name: 'BUBBLE CENTRAL', x: 0, z: 0, r: 28, glass: '#bfefff', floor: '#9a8c70', light: 0xfff0d0 },
    { id: 'kelp', name: 'KELP GARDENS', x: 0, z: -82, r: 27, glass: '#b8ffcf', floor: '#4a5a34', light: 0xc8ffb0 },
    { id: 'burbs', name: 'THE BURBS', x: 84, z: 0, r: 32, glass: '#d8f0ff', floor: '#6aa04a', light: 0xfff4e0 },
    { id: 'low', name: 'THE LOW TIDE', x: -82, z: 0, r: 26, glass: '#c86aff', floor: '#2c2834', light: 0xff6ad2 },
    { id: 'coral', name: 'CORAL HEIGHTS', x: 0, z: 84, r: 30, glass: '#ffd0e0', floor: '#c8b4a0', light: 0xffe0c8 },
  ],
  tubes: [], walk: [],
};
const bcD = id => BC.domes.find(d => d.id === id);
const bcR = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5; return x - Math.floor(x); };
// is a point somewhere you are allowed to stand (inside a dome, inside a tunnel, or in the apartment interiors)?
function bcInside(x, z) {
  if (x > 125) return true;
  for (const d of BC.domes) if (Math.hypot(x - d.x, z - d.z) < d.r - 1.4) return true;
  for (const t of BC.tubes) { const dx = x - t.ax, dz = z - t.az, a = dx * t.ux + dz * t.uz, c = -dx * t.uz + dz * t.ux; if (a > -2 && a < t.len + 2 && Math.abs(c) < 2.2) return true; }
  return false;
}

// ---------- building blocks ----------
function bcDome(D) { const g = new THREE.Group(), R = D.r;
  const fl = new THREE.Mesh(new THREE.CircleGeometry(R + 0.5, 48).rotateX(-Math.PI / 2), toon(D.floor)); fl.position.y = 0.07; g.add(fl);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: D.glass, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
  g.add(glass);
  for (let i = 0; i < 10; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(R, 0.22, 5, 32, Math.PI), toon('#7a808a')); rib.rotation.y = i / 10 * Math.PI; g.add(rib); }
  for (const h of [0.35, 0.7]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R * Math.cos(Math.asin(h)), 0.16, 5, 48), toon('#7a808a')); ring.rotation.x = Math.PI / 2; ring.position.y = R * h; g.add(ring); }
  const base = new THREE.Mesh(new THREE.TorusGeometry(R, 0.5, 6, 48), toon('#4a4f58', 'panel')); base.rotation.x = Math.PI / 2; base.position.y = 0.25; g.add(base);
  const strip = new THREE.Mesh(new THREE.TorusGeometry(R - 0.6, 0.07, 4, 48), glow(D.id === 'low' ? '#ff3bd2' : '#7fe8ff')); strip.rotation.x = Math.PI / 2; strip.position.y = 0.1; g.add(strip);
  // a crown light at the top of every dome
  part(g, Cy(1.2, 1.6, 0.6, 12), toon('#4a4f58', 'panel'), 0, R - 0.2, 0); part(g, new THREE.SphereGeometry(0.5, 10, 8), glow('#ffe9a0'), 0, R + 0.4, 0);
  g.position.set(D.x, 0, D.z); levelGroup.add(g);
  const L = new THREE.PointLight(D.light, D.id === 'low' ? 1.3 : D.id === 'hub' ? 0.6 : 0.9, R * 2.2); L.position.set(D.x, R * 0.75, D.z); levelGroup.add(L);
  // a big name board where the tunnel from the hub arrives
  return g; }
function bcTube(a, b) { const A = bcD(a), Bd = bcD(b), dx = Bd.x - A.x, dz = Bd.z - A.z, dd = Math.hypot(dx, dz), ux = dx / dd, uz = dz / dd;
  const ax = A.x + ux * (A.r - 3), az = A.z + uz * (A.r - 3), len = dd - A.r - Bd.r + 6; BC.tubes.push({ ax, az, ux, uz, len });
  const g = new THREE.Group(), ry = Math.atan2(ux, uz);
  part(g, B(5, 0.18, len), toon('#5d636c', 'panel'), 0, 0.09, len / 2);
  // a moving walkway down the middle, with chevrons sliding along it
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#2a2e36'; c.fillRect(0, 0, 32, 64); c.strokeStyle = '#7fe8ff'; c.lineWidth = 4; c.beginPath(); c.moveTo(4, 40); c.lineTo(16, 24); c.lineTo(28, 40); c.stroke();
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, len / 2.5); const belt = new THREE.Mesh(new THREE.PlaneGeometry(1.6, len).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex }));
  belt.position.set(0, 0.2, len / 2); g.add(belt); levelAnims.push(t => { tex.offset.y = -t * 0.6; });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, len, 22, 1, true), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }));
  tube.rotation.x = Math.PI / 2; tube.position.set(0, 0.6, len / 2); g.add(tube);
  for (let s = 2; s < len; s += 4) { const rib = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.14, 5, 22, Math.PI), toon('#7a808a')); rib.position.set(0, 0.6, s); g.add(rib);
    for (const sx of [-1, 1]) part(g, B(0.12, 0.06, 1.2), glow(s % 8 < 4 ? '#7fe8ff' : '#ffd36a'), sx * 2.3, 0.2, s); }
  for (const sx of [-1, 1]) part(g, B(0.15, 0.9, len), toon('#3a3d44', 'panel'), sx * 2.55, 0.45, len / 2);
  g.position.set(ax, 0, az); g.rotation.y = ry; levelGroup.add(g);
  // tunnel mouth signs on both ends
  const sA = bubSign('→ ' + Bd.name, '#0c1a24', '#7fe8ff', 4, 0.6, ax + ux * 0.5, 4.4, az + uz * 0.5, ry + Math.PI);
  const sB = bubSign('→ ' + A.name, '#0c1a24', '#7fe8ff', 4, 0.6, ax + ux * (len - 0.5), 4.4, az + uz * (len - 0.5), ry);
  for (const [px, pz] of [[ax, az], [ax + ux * len, az + uz * len]]) for (const sx of [-1, 1]) part(levelGroup, B(0.5, 5, 0.5), toon('#4a4f58', 'panel'), px + uz * sx * 3, 2.5, pz - ux * sx * 3); }
function bcHouse(x, z, ry, c, opts) { const o = opts || {}, w = o.w || 6, d = o.d || 5, h = o.h || 3.4, g = new THREE.Group();
  const wall = toon(c[0]), trim = toon('#f4f0e8');
  part(g, B(w, h, d), wall, 0, h / 2, 0);
  // pitched roof from two slabs, a chimney, a porch with steps, windows with shutters and window boxes
  for (const s of [-1, 1]) part(g, B(w + 0.6, 0.18, d / 2 + 0.7), toon(c[1]), 0, h + d * 0.22, s * d / 4, s * 0.62, 0, 0);
  part(g, B(w + 0.2, d * 0.45, 0.12), wall, 0, h + d * 0.2, d / 2 - 0.05); part(g, B(w + 0.2, d * 0.45, 0.12), wall, 0, h + d * 0.2, -d / 2 + 0.05);
  part(g, B(0.6, 1.4, 0.6), toon('#8a5a4a'), w * 0.28, h + 1.2, -d * 0.15);
  part(g, B(1.2, 2.1, 0.1), toon(c[2] || '#3a5266'), 0, 1.05, d / 2 + 0.05); part(g, new THREE.SphereGeometry(0.06, 6, 4), toon('#c9a43a'), 0.42, 1.0, d / 2 + 0.12);
  part(g, B(2.4, 0.15, 1.2), toon('#8a6a44', 'wood'), 0, 0.2, d / 2 + 0.6); part(g, B(2.6, 0.12, 1.3), toon(c[1]), 0, 2.6, d / 2 + 0.55);
  for (const s of [-1, 1]) { part(g, Cy(0.07, 0.07, 2.4, 6), trim, s * 1.1, 1.4, d / 2 + 1.1);
    const wx = s * w * 0.32; part(g, B(1.1, 1.0, 0.06), new THREE.MeshBasicMaterial({ color: o.dark ? '#2a3040' : '#ffe9a0' }), wx, 1.7, d / 2 + 0.04);
    part(g, B(1.2, 0.08, 0.1), trim, wx, 2.24, d / 2 + 0.08); part(g, B(0.08, 1.0, 0.1), trim, wx, 1.7, d / 2 + 0.08);
    for (const k of [-1, 1]) part(g, B(0.3, 1.1, 0.05), toon(c[1]), wx + k * 0.72, 1.7, d / 2 + 0.06);
    part(g, B(1.1, 0.22, 0.3), toon('#6a4f34', 'wood'), wx, 1.12, d / 2 + 0.2); for (let f = 0; f < 4; f++) part(g, new THREE.SphereGeometry(0.1, 5, 4), toon(['#ff6aa8', '#ffd36a', '#c86aff', '#ff6a5a'][(f + (x | 0)) % 4]), wx - 0.4 + f * 0.27, 1.3, d / 2 + 0.22); }
  g.position.set(x, 0, z); g.rotation.y = ry; levelGroup.add(g);
  const c2 = Math.abs(Math.cos(ry)), s2 = Math.abs(Math.sin(ry)); box(x, z, (w * c2 + d * s2) / 2, (d * c2 + w * s2) / 2);
  return { door: [x + Math.sin(ry) * (d / 2 + 1.6), z + Math.cos(ry) * (d / 2 + 1.6)] }; }
function bcLamp(x, z, col) { part(levelGroup, Cy(0.08, 0.12, 3.6, 6), toon('#2b2a2c'), x, 1.8, z); part(levelGroup, B(0.6, 0.08, 0.08), toon('#2b2a2c'), x + 0.25, 3.55, z);
  part(levelGroup, new THREE.SphereGeometry(0.22, 8, 6), glow(col || '#ffe9a0'), x + 0.5, 3.35, z); }
function bcKelpTree(x, z, s) { const g = new THREE.Group(); s = s || 1; for (let i = 0; i < 5; i++) { const k = new THREE.Mesh(B(0.25 * s, (3 + (i % 3)) * s, 0.08), toon(i % 2 ? '#3f7a3a' : '#5a9a3a', 'leaves')); k.position.set(Math.cos(i * 1.3) * 0.3, (1.5 + (i % 3) * 0.5) * s, Math.sin(i * 1.3) * 0.3); k.rotation.y = i; g.add(k); }
  for (let i = 0; i < 6; i++) part(g, new THREE.SphereGeometry(0.12 * s, 6, 4), glow('#b8ff6a'), Math.cos(i) * 0.4, (2 + i * 0.5) * s, Math.sin(i) * 0.4);
  g.position.set(x, 0, z); levelGroup.add(g); levelAnims.push(t => { g.rotation.z = Math.sin(t * 0.8 + x) * 0.05; g.rotation.x = Math.cos(t * 0.6 + z) * 0.05; }); solid(x, z, 0.4); }
function bcCoral(x, z, s, i) { const g = new THREE.Group(), cols = ['#ff6aa8', '#ffb347', '#c86aff', '#4fffe0', '#ff6a5a'];
  for (let k = 0; k < 5; k++) { const h = (0.6 + bcR(i + k) * 1.4) * s; const b = new THREE.Mesh(Cy(0.08 * s, 0.14 * s, h, 6), toon(cols[(i + k) % 5])); b.position.set(Math.cos(k * 1.7) * 0.3 * s, h / 2, Math.sin(k * 1.7) * 0.3 * s); b.rotation.set(Math.cos(k) * 0.4, 0, Math.sin(k) * 0.4); g.add(b);
    part(g, new THREE.SphereGeometry(0.12 * s, 6, 4), glow(cols[(i + k + 2) % 5]), b.position.x * 1.6, h, b.position.z * 1.6); }
  g.position.set(x, 0, z); levelGroup.add(g); }
// people walking set routes and facing the way they walk
function bcWalkers(D, n, kind, seed) { for (let i = 0; i < n; i++) { const k = seed + i, jelly = kind === 'mix' && i % 4 === 3;
    const o = buildChar(() => jelly ? makeJelly(['#4fffe0', '#ff6aa8', '#c86aff'][k % 3]) : makeCivilian(['#ffd0a0', '#c8e0ff', '#b8ffcf', '#ffb8d8', '#fff0a0', '#d8c8ff', '#3a3d44', '#6a3a8a'][k % 8], ['#2c2a38', '#3a5266', '#5a4a3a'][k % 3], ['#e0b892', '#8a5a3a', '#9fe8ff', '#c58a64', '#7fe0a0'][k % 5], ['#1e1a18', '#c8402f', '#ffd36a', '#e8e4dc'][k % 4]), jelly ? null : 'civ');
    levelGroup.add(o); const r = D.r * (0.45 + bcR(k) * 0.35), sp = (0.12 + bcR(k + 5) * 0.1) * (k % 2 ? 1 : -1) * 6 / r, a0 = bcR(k + 9) * 7, st = {};
    BC.walk.push(o); let last = performance.now() / 1000;
    levelAnims.push(t => { const a = a0 + t * sp, x = D.x + Math.cos(a) * r, z = D.z + Math.sin(a) * r * 0.85, vx = -Math.sin(a) * sp, vz = Math.cos(a) * sp * 0.85;
      o.position.set(x, jelly ? 0.3 + Math.sin(t * 2 + k) * 0.15 : 0, z); o.rotation.y = Math.atan2(vx, vz); if (o.userData.rig) { animRig(o, st, Math.max(0.005, t - last), t); } last = t; }); } }

// ---------- the seabed outside ----------
function bcSeabed() {
  const sea = new THREE.Mesh(new THREE.CircleGeometry(230, 48).rotateX(-Math.PI / 2), toon('#1c3e4a')); sea.position.y = -0.15; levelGroup.add(sea);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(240, 24, 12), new THREE.MeshBasicMaterial({ color: '#0a2a3e', side: THREE.BackSide, fog: false })); levelGroup.add(sky);
  // light shafts coming down from the surface
  for (let i = 0; i < 9; i++) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(6 + bcR(i) * 6, 90), new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    sh.position.set(-110 + i * 27, 45, -60 + bcR(i + 3) * 120); sh.rotation.set(0, bcR(i + 6) * 3, 0.25); levelGroup.add(sh); levelAnims.push(t => { sh.material.opacity = 0.04 + Math.sin(t * 0.3 + i) * 0.025; }); }
  // rocks and kelp forest between the domes (never inside them)
  for (let i = 0; i < 70; i++) { const a = bcR(i) * Math.PI * 2, r = 40 + bcR(i + 99) * 80, x = Math.cos(a) * r, z = Math.sin(a) * r; if (BC.domes.some(d => Math.hypot(x - d.x, z - d.z) < d.r + 6) || BC.tubes.some(t => { const dx = x - t.ax, dz = z - t.az, a = dx * t.ux + dz * t.uz, c = -dx * t.uz + dz * t.ux; return a > -6 && a < t.len + 6 && Math.abs(c) < 9; })) continue;
    if (i % 3) { const kg = new THREE.Group(); for (let k = 0; k < 4; k++) { const h = 6 + bcR(i + k) * 10, m = new THREE.Mesh(B(0.5, h, 0.12), toon(k % 2 ? '#2f6a3a' : '#3f8a3a', 'leaves')); m.position.set(k * 0.6 - 0.9, h / 2, Math.sin(k) * 0.5); kg.add(m); }
      kg.position.set(x, 0, z); levelGroup.add(kg); levelAnims.push(t => { kg.rotation.z = Math.sin(t * 0.5 + i) * 0.08; }); }
    else { const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5 + bcR(i + 4) * 3, 0), toon('#3a4a52')); rk.position.set(x, 0.5, z); rk.scale.y = 0.6; rk.rotation.y = i; levelGroup.add(rk); } }
  // a whale drifting slowly over the whole city
  const wh = new THREE.Group(), wm = toon('#3a5a7a'), wb = toon('#c8d8e0');
  part(wh, B(5, 4, 16), wm, 0, 0, 0); part(wh, B(4.6, 1.2, 12), wb, 0, -2.2, 1); part(wh, B(3, 3, 5), wm, 0, -0.3, -9.5); part(wh, B(8, 0.4, 3), wm, 0, 0, -12.5);
  for (const s of [-1, 1]) { part(wh, B(4, 0.3, 2), wm, s * 4, -1.3, 3, 0, 0, s * 0.4); part(wh, new THREE.SphereGeometry(0.3, 6, 4), toon('#111'), s * 2.55, 0.6, 6.5); }
  levelGroup.add(wh); levelAnims.push(t => { const a = t * 0.02; wh.position.set(Math.cos(a) * 90, 60 + Math.sin(t * 0.2) * 3, Math.sin(a) * 90); wh.rotation.y = -a; wh.rotation.z = Math.sin(t * 0.3) * 0.05; });
  // fish schools circling each dome
  const fc = ['#ffb347', '#4fd2ff', '#ff6aa8', '#ffd36a', '#b8ff6a'];
  BC.domes.forEach((D, di) => { const sch = []; for (let i = 0; i < 12; i++) { const f = new THREE.Mesh(B(0.9, 0.4, 0.2), new THREE.MeshBasicMaterial({ color: fc[(i + di) % 5], fog: false })); levelGroup.add(f); sch.push(f); }
    levelAnims.push(t => sch.forEach((f, i) => { const a = t * (0.1 + (i % 3) * 0.02) * (di % 2 ? 1 : -1) + i * 0.25 + di, rr = D.r + 4 + (i % 4) * 1.2; f.position.set(D.x + Math.cos(a) * rr, D.r * 0.5 + (i % 5) * 1.3 + Math.sin(t + i) * 0.4, D.z + Math.sin(a) * rr); f.rotation.y = -a + (di % 2 ? 0 : Math.PI); })); });
  // rising bubble columns from vents on the seabed
  for (let v = 0; v < 6; v++) { const vx = -100 + v * 40, vz = (v % 2 ? 1 : -1) * 45; if (bcInside(vx, vz)) continue; const bb = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.5, fog: false })); levelGroup.add(m); bb.push(m); }
    levelAnims.push(t => bb.forEach((m, i) => { const k = (t * 0.15 + i / 8) % 1; m.position.set(vx + Math.sin(i * 3 + t) * 0.6, k * 70, vz); })); }
}

// ---------- districts ----------
function bcHub() { const D = bcD('hub'), X = D.x, Z = D.z;
  // tiled plaza with rings of pale stone, a three-tier bubble fountain and the founder's statue
  const tile = new THREE.Mesh(new THREE.CircleGeometry(14, 40).rotateX(-Math.PI / 2), toon('#a89e8e')); tile.position.set(X, 0.1, Z); levelGroup.add(tile);
  const ring = new THREE.Mesh(new THREE.RingGeometry(14, 15, 40).rotateX(-Math.PI / 2), toon('#8fb8cc')); ring.position.set(X, 0.11, Z); levelGroup.add(ring);
  for (const [r, h, y] of [[5, 0.6, 0.3], [3.4, 0.5, 0.9], [1.8, 0.4, 1.5]]) { part(levelGroup, Cy(r, r + 0.3, h, 28), toon('#c8e0ff'), X, y, Z); part(levelGroup, Cy(r - 0.3, r - 0.3, 0.05, 28), new THREE.MeshLambertMaterial({ color: '#4fa8cc', transparent: true, opacity: 0.8 }), X, y + h / 2 + 0.01, Z); }
  solid(X, Z, 5.4);
  const fish = new THREE.Group(); part(fish, B(1.2, 1.6, 3), toon('#c9a43a'), 0, 0, 0); part(fish, B(0.2, 1.6, 1.2), toon('#c9a43a'), 0, 0.3, -1.9); part(fish, new THREE.SphereGeometry(0.15, 6, 4), toon('#111'), 0.62, 0.3, 1);
  fish.position.set(X, 3.4, Z); fish.rotation.x = -0.5; levelGroup.add(fish); levelAnims.push(t => { fish.rotation.y = t * 0.2; });
  bubSign('FOUNDER FISHWICK · HE SWAM SO WE COULD SIT', '#3a2a1a', '#ffd36a', 4.4, 0.45, X, 1.25, Z + 5.45);
  const fb = []; for (let i = 0; i < 20; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.05, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6 })); levelGroup.add(m); fb.push(m); }
  levelAnims.push(t => fb.forEach((m, i) => { const k = (t * 0.3 + i * 0.05) % 1; m.position.set(X + Math.sin(i * 2.4) * (0.3 + k * 1.6), 4.4 + k * 12, Z + Math.cos(i * 2.4) * (0.3 + k * 1.6)); m.material.opacity = 0.6 * (1 - k); }));
  // the transit board: a drawn map of the domes
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#0c1a24'; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = '#7fe8ff'; c.lineWidth = 6; for (const d of BC.domes) { if (d.id === 'hub') continue; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + d.x * 1.1, 128 + d.z * 1.1); c.stroke(); }
  c.font = 'bold 13px monospace'; c.textAlign = 'center'; for (const d of BC.domes) { c.fillStyle = d.glass; c.beginPath(); c.arc(128 + d.x * 1.1, 128 + d.z * 1.1, d.r * 0.7, 0, 7); c.fill(); c.fillStyle = '#0c1a24'; c.fillText(d.name.replace('THE ', ''), 128 + d.x * 1.1, 132 + d.z * 1.1); }
  c.fillStyle = '#ffd36a'; c.fillText('YOU ARE HERE', 128, 112);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); board.position.set(X + 9, 2.2, Z + 9); board.rotation.y = Math.PI * 0.25; board.position.set(X + 8.95, 2.2, Z + 8.95); levelGroup.add(board);
  part(levelGroup, B(2.9, 2.9, 0.2), toon('#3a3d44', 'panel'), X + 9.07, 2.2, Z + 9.07, 0, Math.PI * 0.75, 0); part(levelGroup, B(0.2, 0.8, 0.2), toon('#3a3d44'), X + 9.07, 0.4, Z + 9.07); box(X + 9.07, Z + 9.07, 1, 1);
  // food carts, kelp trees, benches, lamps, flags
  const cart = (x, z, ry, name, col) => { const g = new THREE.Group(); part(g, B(2.2, 1.0, 1.2), toon(col), 0, 0.7, 0); for (const [a, b] of [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]]) part(g, Cy(0.22, 0.22, 0.1, 10), toon('#2b2a2c'), a, 0.22, b, Math.PI / 2, 0, 0);
    for (let k = 0; k < 4; k++) part(g, B(0.6, 0.08, 1.6), toon(k % 2 ? '#ffffff' : col), -0.9 + k * 0.6, 2.4, 0, 0.2); for (const s of [-1, 1]) part(g, Cy(0.04, 0.04, 1.3, 4), toon('#2b2a2c'), s * 1.0, 1.85, 0.5);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.35), new THREE.MeshBasicMaterial({ map: signTex(name, '#1a1a1a', '#ffd36a') })); sg.position.set(0, 1.0, 0.61); g.add(sg); g.position.set(x, 0, z); g.rotation.y = ry; levelGroup.add(g); box(x, z, 1.2, 1.2); };
  cart(X - 11, Z + 6, Math.PI / 2 + 0.4, 'KELP DOGS', '#c8402f'); cart(X + 12, Z - 4, -Math.PI / 2, 'BUBBLE TEA', '#4fd2ff'); cart(X - 8, Z - 12, 0.6, 'PEARL POPS', '#ff6aa8');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.4; bcKelpTree(X + Math.cos(a) * 20, Z + Math.sin(a) * 20, 1.1); bcLamp(X + Math.cos(a + 0.3) * 16, Z + Math.sin(a + 0.3) * 16); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = X + Math.cos(a) * 9, z = Z + Math.sin(a) * 9, g = new THREE.Group();
    part(g, B(1.8, 0.08, 0.5), toon('#8a6a44', 'wood'), 0, 0.5, 0); part(g, B(1.8, 0.5, 0.08), toon('#8a6a44', 'wood'), 0, 0.8, -0.25); for (const s of [-1, 1]) part(g, B(0.08, 0.5, 0.5), toon('#2b2a2c'), s * 0.8, 0.25, 0);
    g.position.set(x, 0, z); g.rotation.y = -a - Math.PI / 2; levelGroup.add(g); box(x, z, 0.6, 0.6); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), toon(['#ff6aa8', '#ffd36a', '#4fd2ff', '#7fff6a'][i % 4])); f.position.set(X + Math.cos(a) * 12, 7, Z + Math.sin(a) * 12); f.lookAt(X, 7, Z); levelGroup.add(f); }
  // the Shrink-o-Matic out (grow back to normal size)
  const m = new THREE.Group(); part(m, Cy(2.2, 2.4, 0.4, 20), toon('#3a3d44', 'panel'), 0, 0.2, 0); part(m, Cy(1.6, 1.6, 0.05, 20), glow('#4fd2ff'), 0, 0.43, 0);
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.18, 8, 28), toon('#c9a43a')); ringM.position.y = 2.2; m.add(ringM); for (const s of [-1, 1]) part(m, B(0.3, 2.4, 0.3), toon('#5d636c'), s * 1.9, 1.2, 0);
  m.position.set(X + 15, 0, Z + 16); levelGroup.add(m); levelAnims.push(t => { ringM.rotation.x = t * 0.8; }); bubSign('GROW BACK · EXIT', '#0c1a24', '#7fe8ff', 2.4, 0.45, X + 15, 4.0, Z + 16, Math.PI * 0.75);
  INTERACTS.push({ x: X + 15, z: Z + 16, r: 2.6, label: '🫧 Grow back to normal size (exit)', fn: ocGrow });
  bubSign('WELCOME TO BUBBLE CITY · POP. 4,000 · PLEASE DO NOT TAP ON THE DOME', '#0c1a24', '#ffe9a0', 9, 0.7, X, 8.5, Z + 18, Math.PI);
  bcWalkers(D, 10, 'mix', 0); }
function bcLow() { const D = bcD('low'), X = D.x, Z = D.z;
  // wet asphalt street running east-west, kerbs, puddles reflecting neon
  part(levelGroup, B(44, 0.04, 7), toon('#1e1c24'), X, 0.1, Z); for (let i = 0; i < 10; i++) part(levelGroup, B(1.6, 0.05, 0.15), toon('#ffd36a'), X - 20 + i * 4.4, 0.13, Z);
  for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.5 + bcR(i) * 0.9, 12), new THREE.MeshBasicMaterial({ color: ['#ff3bd2', '#4fffe0', '#2a2a44'][i % 3], transparent: true, opacity: 0.35, depthWrite: false })); p.rotation.x = -Math.PI / 2; p.position.set(X - 18 + bcR(i + 9) * 36, 0.14, Z - 3 + bcR(i + 3) * 6); levelGroup.add(p); }
  // storefronts: tall narrow buildings with neon, fire escapes and roof junk, on both sides of the street
  const fronts = [['CRABBY\'S PAWN', '#ffd36a', 'pawn'], ['THE BARNACLE BAR', '#4fffe0', 'bar'], ['INK SQUID TATTOO', '#ff3bd2', 'ink'], ['FISH FRY ARCADE', '#7fff6a', 'arc'], ['24/7 SHELLMART', '#ff6a3a', 'mart'], ['KARAOKE CLAM', '#c86aff', 'kar']];
  BC.low = {};
  fronts.forEach(([name, col, id], i) => { const side = i % 2 ? 1 : -1, x = X - 14 + Math.floor(i / 2) * 14, z = Z + side * 9.5, h = 7 + (i % 3) * 2.5, g = new THREE.Group(), ry = side > 0 ? Math.PI : 0;
    part(g, B(10, h, 6), toon(['#3a3048', '#2a3a44', '#44303a'][i % 3], 'panel'), 0, h / 2, 0);
    part(g, B(6, 2.4, 0.1), new THREE.MeshBasicMaterial({ color: '#1a1020' }), 0, 1.4, 3.03); part(g, B(6.2, 0.12, 0.2), glow(col), 0, 2.7, 3.05);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1), new THREE.MeshBasicMaterial({ map: signTex(name, '#120818', col) })); sg.position.set(0, 3.4, 3.12); g.add(sg);
    for (let f = 1; f < h / 2.6; f++) for (const s of [-1, 1]) part(g, B(1.4, 1.2, 0.06), (f + i + s) % 3 ? new THREE.MeshBasicMaterial({ color: ['#ffd0a0', '#ff6ad2', '#7fe8ff'][(f + i) % 3] }) : toon('#1a1a22'), s * 2.8, 2.2 + f * 2.6, 3.04);
    for (let f = 1; f < h / 2.6; f++) { part(g, B(2.4, 0.08, 1), toon('#2b2a2c'), 3.6, 1.6 + f * 2.6, 3.5); part(g, B(2.4, 0.6, 0.04), toon('#2b2a2c'), 3.6, 1.9 + f * 2.6, 4.0); }
    part(g, Cy(0.5, 0.5, 1.4, 8), toon('#5d636c'), -3, h + 0.7, -1); part(g, B(1.4, 0.8, 1.4), toon('#5d636c', 'panel'), 2.5, h + 0.4, 0);
    g.position.set(x, 0, z); g.rotation.y = ry; levelGroup.add(g); box(x, z, 5, 3); BC.low[id] = [x, z - side * 4.2];
    const L = new THREE.PointLight(new THREE.Color(col), 0.8, 9); L.position.set(x, 2.5, z - side * 4.5); levelGroup.add(L); levelAnims.push(t => { L.intensity = (Math.sin(t * 9 + i * 7) > 0.93 ? 0.15 : 0.8); }); });
  // alley props: dumpsters, a burning barrel, steam vents, a van full of TVs, a broken payphone
  for (const [x, z] of [[X - 21, Z - 4.6], [X + 19, Z + 4.6]]) { const dg = new THREE.Group(); part(dg, B(2, 1.3, 1.1), toon('#2f5a3a'), 0, 0.75, 0); part(dg, B(2.1, 0.12, 1.2), toon('#1e3a26'), 0, 1.45, -0.1, -0.3, 0, 0); dg.position.set(x, 0, z); levelGroup.add(dg); box(x, z, 1.1, 0.6); }
  const bar = new THREE.Group(); part(bar, Cy(0.4, 0.38, 1, 10), toon('#5a3a2a'), 0, 0.5, 0); bar.position.set(X + 4, 0, Z - 4.2); levelGroup.add(bar); solid(X + 4, Z - 4.2, 0.5);
  const fire = []; for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ff8a2a' : '#ffd36a', transparent: true, opacity: 0.85 })); levelGroup.add(f); fire.push(f); }
  const fl = new THREE.PointLight(0xff8a2a, 1.2, 7); fl.position.set(X + 4, 1.6, Z - 4.2); levelGroup.add(fl);
  levelAnims.push(t => { fire.forEach((f, i) => { const k = (t * 1.2 + i / 6) % 1; f.position.set(X + 4 + Math.sin(i * 2 + t * 3) * 0.15, 1.05 + k * 1.1, Z - 4.2 + Math.cos(i * 2) * 0.15); f.scale.setScalar(1 - k); }); fl.intensity = 1 + Math.sin(t * 13) * 0.3; });
  for (const [x, z] of [[X - 8, Z + 1.5], [X + 10, Z - 1.8]]) { const st = []; part(levelGroup, B(1, 0.06, 1), toon('#5d636c'), x, 0.08, z); for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), new THREE.MeshBasicMaterial({ color: '#d8d8e8', transparent: true, opacity: 0.25, depthWrite: false })); levelGroup.add(m); st.push(m); }
    levelAnims.push(t => st.forEach((m, i) => { const k = (t * 0.4 + i / 6) % 1; m.position.set(x + Math.sin(i + t) * 0.3, 0.2 + k * 3, z); m.scale.setScalar(0.6 + k * 2); m.material.opacity = 0.25 * (1 - k); })); }
  const van = new THREE.Group(); part(van, B(2.2, 2, 4.6), toon('#d8d0c0'), 0, 1.3, 0); part(van, B(2.1, 0.9, 1.2), new THREE.MeshBasicMaterial({ color: '#2a3040' }), 0, 1.8, 2.2); for (const [a, b] of [[-1.1, -1.4], [1.1, -1.4], [-1.1, 1.4], [1.1, 1.4]]) part(van, Cy(0.4, 0.4, 0.3, 10), toon('#1e1a18'), a, 0.4, b, 0, 0, Math.PI / 2);
  for (let i = 0; i < 4; i++) { const tv = bubTV(0.8, 0.5); tv.position.set(-1.12, 1.1 + (i % 2) * 0.7, -1.3 + Math.floor(i / 2) * 1.0); tv.rotation.y = -Math.PI / 2; van.add(tv); }
  van.position.set(X + 13, 0, Z + 4.6); van.rotation.y = Math.PI / 2; levelGroup.add(van); box(X + 13, Z + 4.6, 2.4, 1.2);
  // the people of the strip
  bubNpc(BC.low.pawn[0], BC.low.pawn[1], BC.low.pawn[1] > Z ? 0 : Math.PI, ['#c8402f', '#3a3d44', '#ff8a6a', '#e8e4dc'], '🦀 Crabby\'s Pawn', bubPawn);
  bubNpc(X - 2, Z + 2.3, Math.PI, ['#2b2a2c', '#1e1a18', '#c58a64', '#111'], '💊 Dregs (dealer)', () => openSubShop('Low Tide dealer', 'Dregs', BUB_STREET));
  bubNpc(X + 11, Z + 2.4, Math.PI, ['#6a3a8a', '#2c2a38', '#8a5a3a', '#1e1a18'], '📺 Talk to Rizzo', bubRizzo);
  bubNpc(BC.low.bar[0], BC.low.bar[1], BC.low.bar[1] > Z ? 0 : Math.PI, ['#4fffe0', '#2c2a38', '#9fe8ff', '#3a2a1a'], '🍺 The Barnacle Bar', () => bubTalk('The Barnacle Bar', 'Shelly the bartender', ['We serve two drinks: Salt and Saltier. Both are water.', 'If you\'re looking for trouble, Dregs is under the lamp. If you\'re looking for more trouble, Rizzo\'s by the van.']));
  bubNpc(BC.low.ink[0], BC.low.ink[1], BC.low.ink[1] > Z ? 0 : Math.PI, ['#1e1a18', '#3a3d44', '#e0b892', '#ff3bd2'], '🦑 Ink Squid Tattoo', () => bubTalk('Ink Squid Tattoo', 'Inky', ['Eight arms, eight needles, zero waiting. Today\'s special: your mum\'s name, spelled almost right.', 'Come back when you\'ve got skin and a bad idea. You\'ve got skin.']));
  bubNpc(BC.low.arc[0], BC.low.arc[1], BC.low.arc[1] > Z ? 0 : Math.PI, ['#7fff6a', '#2c2a38', '#c58a64', '#1e1a18'], '🕹 Fish Fry Arcade', () => bubTalk('Fish Fry Arcade', 'Token Tony', ['High score on Fish Fry is held by "AAA". Nobody knows who AAA is. AAA haunts us.', 'The claw machine has a real crab in it. He wins every time.']));
  bubNeon('THE LOW TIDE', '#ff3bd2', X + D.r - 2.5, 5.2, Z, -Math.PI / 2, 4);
  bcLamp(X - 2, Z + 3.2, '#ff6ad2'); bcLamp(X + 8, Z - 3.2, '#4fffe0');
  bcWalkers(D, 6, 'civ', 40); }
function bcBurbs() { const D = bcD('burbs'), X = D.x, Z = D.z;
  // a cul-de-sac: a loop road round a green island with a tree, houses all round facing in, picket fences and mailboxes
  const road = new THREE.Mesh(new THREE.RingGeometry(8, 13, 40).rotateX(-Math.PI / 2), toon('#5a5a62')); road.position.set(X, 0.1, Z); levelGroup.add(road);
  const kerb = new THREE.Mesh(new THREE.RingGeometry(13, 13.4, 40).rotateX(-Math.PI / 2), toon('#d8d0c0')); kerb.position.set(X, 0.11, Z); levelGroup.add(kerb);
  bcKelpTree(X, Z, 1.6); for (let i = 0; i < 6; i++) bcCoral(X + Math.cos(i) * 4.5, Z + Math.sin(i) * 4.5, 0.8, i);
  const cols = [['#ffd0a0', '#8a3a2e'], ['#c8e0ff', '#3a5266'], ['#b8ffcf', '#3f7a3a'], ['#ffb8d8', '#8a3a5a'], ['#fff0a0', '#8a6a2a'], ['#d8c8ff', '#4a3a7a'], ['#f4f0e8', '#5d636c']];
  BC.burbs = [];
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + Math.PI / 4 + i * (Math.PI * 2 - Math.PI / 2) / 6.5, r = 22, x = X + Math.cos(a) * r, z = Z + Math.sin(a) * r, ry = Math.atan2(X - x, Z - z);
    const h = bcHouse(x, z, ry, cols[i], { w: 6.5, d: 5.5, h: 3.4, dark: i === 3 }); BC.burbs.push(h.door);
    const tx = Math.sin(ry), tz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
    for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) part(levelGroup, B(0.08, 0.8, 0.08), toon('#f4f0e8'), x + tx * 5.2 + rx * s * (1.8 + k * 0.45), 0.4, z + tz * 5.2 + rz * s * (1.8 + k * 0.45));
      part(levelGroup, B(0.06, 0.08, 2.5), toon('#f4f0e8'), x + tx * 5.2 + rx * s * 2.9, 0.65, z + tz * 5.2 + rz * s * 2.9, 0, ry + Math.PI / 2, 0); }
    const mb = new THREE.Group(); part(mb, Cy(0.04, 0.04, 1, 4), toon('#5d636c'), 0, 0.5, 0); part(mb, B(0.25, 0.25, 0.45), toon(cols[i][1]), 0, 1.1, 0); part(mb, B(0.03, 0.18, 0.08), toon('#c8402f'), 0.14, 1.25, 0.1);
    mb.position.set(x + tx * 5.6 + rx * 1.4, 0, z + tz * 5.6 + rz * 1.4); mb.rotation.y = ry; levelGroup.add(mb);
    part(levelGroup, B(1.6, 0.03, 3.4), toon('#d8d0c0'), x + tx * 4.4, 0.06, z + tz * 4.4, 0, ry, 0);
    if (i % 2) { const car = new THREE.Group(); part(car, B(1.8, 0.8, 3.6), toon(['#c8402f', '#3a5266', '#ffd36a'][i % 3]), 0, 0.6, 0); part(car, B(1.6, 0.7, 1.8), new THREE.MeshLambertMaterial({ color: '#8fb8cc' }), 0, 1.3, -0.2);
      for (const [a, b] of [[-0.9, -1.2], [0.9, -1.2], [-0.9, 1.2], [0.9, 1.2]]) part(car, Cy(0.35, 0.35, 0.25, 10), toon('#1e1a18'), a, 0.35, b, 0, 0, Math.PI / 2);
      car.position.set(x + tx * 4.6 - rx * 3.6, 0, z + tz * 4.6 - rz * 3.6); car.rotation.y = ry; levelGroup.add(car); box(car.position.x, car.position.z, 1.4, 1.4); } }
  // a playground: swings and a slide on the north-east lawn
  const pg = new THREE.Group(); for (const s of [-1, 1]) part(pg, B(0.12, 2.6, 0.12), toon('#c8402f'), s * 1.6, 1.3, 0); part(pg, B(3.4, 0.12, 0.12), toon('#c8402f'), 0, 2.6, 0);
  const sw = []; for (const s of [-0.7, 0.7]) { const p = new THREE.Group(); part(p, B(0.03, 1.8, 0.03), toon('#5d636c'), 0, -0.9, 0); part(p, B(0.5, 0.06, 0.25), toon('#2b2a2c'), 0, -1.8, 0); p.position.set(s, 2.6, 0); pg.add(p); sw.push(p); }
  levelAnims.push(t => sw.forEach((p, i) => { p.rotation.x = Math.sin(t * 1.6 + i) * 0.35; }));
  part(pg, B(0.8, 0.08, 3.2), toon('#ffd36a'), 3.4, 1.0, 0, 0.6, 0, 0); part(pg, B(0.8, 2.2, 0.8), toon('#4fd2ff'), 3.4, 1.1, -1.6);
  pg.position.set(X + 15, 0, Z + 3); pg.rotation.y = -0.4; levelGroup.add(pg); box(X + 15, Z + 3, 2, 1);
  // sprinklers on the lawns
  for (let i = 0; i < 4; i++) { const sx = X + Math.cos(i * 1.6) * 17, sz = Z + Math.sin(i * 1.6) * 17, dr = []; for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 3), new THREE.MeshBasicMaterial({ color: '#bfefff' })); levelGroup.add(m); dr.push(m); }
    levelAnims.push(t => dr.forEach((m, k) => { const a = t * 1.5 + k * 0.79, q = (t * 1.2 + k / 8) % 1; m.position.set(sx + Math.cos(a) * q * 2.5, 0.2 + Math.sin(q * Math.PI) * 0.9, sz + Math.sin(a) * q * 2.5); })); }
  bubSign('WELCOME TO THE BURBS · NICE LAWNS ONLY · HOA', '#1a3a1a', '#b8ffcf', 5, 0.6, X - D.r + 3, 3.8, Z, Math.PI / 2);
  // the murder: Gerald's kiddie pool sits in the yard of the dark house
  const gd = BC.burbs[3], dx = gd[0] - X, dz = gd[1] - Z, dl = Math.hypot(dx, dz);
  bubMurderScene(X + dx / dl * 16, Z + dz / dl * 16 + 0.1, [BC.burbs[2], BC.burbs[4], BC.burbs[5]]);
  bcWalkers(D, 6, 'civ', 70); }
function bcKelp() { const D = bcD('kelp'), X = D.x, Z = D.z;
  // grow beds in rows under purple lamps
  for (let r = 0; r < 7; r++) { const z = Z + 2 + r * 2.8; part(levelGroup, B(18, 0.5, 1.4), toon('#6a4f34', 'wood'), X - 4, 0.25, z); box(X - 4, z, 9, 0.7);
    for (let k = 0; k < 12; k++) { const h = 1 + ((k + r) % 3) * 0.5, m = new THREE.Mesh(B(0.3, h, 0.3), toon(k % 2 ? '#3f7a3a' : '#6fce4a', 'leaves')); m.position.set(X - 12.5 + k * 1.5, 0.5 + h / 2, z); levelGroup.add(m); levelAnims.push(t => { m.rotation.z = Math.sin(t + k + r) * 0.08; }); }
    part(levelGroup, B(18, 0.04, 0.05), glow('#c86aff'), X - 4, 4.4, z); }
  for (let i = 0; i < 4; i++) { part(levelGroup, Cy(0.15, 0.15, 3.4, 6), toon('#5d636c'), X - 13 + i * 6, 1.7, Z + 1); }
  // Dome Control: a round tower with a glass top, a spinning radar dish and a beacon
  const T = new THREE.Group(), cx = X + 12, cz = Z - 8; part(T, Cy(5, 5.4, 6, 20), toon('#3a3d44', 'panel'), 0, 3, 0); part(T, Cy(5.4, 5, 3, 20, 1, true), new THREE.MeshLambertMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide }), 0, 7.5, 0);
  part(T, Cy(5.6, 5.6, 0.4, 20), toon('#4a4f58', 'panel'), 0, 9.2, 0); part(T, Cy(5.5, 5.5, 0.15, 20), glow('#4fd2ff'), 0, 6.05, 0);
  const dish = new THREE.Group(); part(dish, Cy(0.15, 0.15, 2, 6), toon('#5d636c'), 0, 1, 0); const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), toon('#d8d0c0')); bowl.rotation.x = Math.PI / 2 + 0.4; bowl.position.y = 2; dish.add(bowl); dish.position.y = 9.4; T.add(dish);
  const bea = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), glow('#ff3b2a')); bea.position.set(2.5, 10.2, 0); T.add(bea);
  for (let i = 0; i < 8; i++) { const s = bubTV(1.2, 0.75); const a = i / 8 * Math.PI * 2; s.position.set(Math.cos(a) * 5.45, 7.2, Math.sin(a) * 5.45); s.lookAt(Math.cos(a) * 20, 7.2, Math.sin(a) * 20); T.add(s); }
  part(T, B(2, 2.6, 0.2), toon('#2a3040'), 0, 1.3, 5.25); T.position.set(cx, 0, cz); levelGroup.add(T); solid(cx, cz, 5.5);
  levelAnims.push(t => { dish.rotation.y = t * 0.6; bea.visible = Math.sin(t * 4) > 0; });
  bubSign('DOME CONTROL · AUTHORISED FISH ONLY', '#0c1a24', '#7fe8ff', 4.6, 0.6, cx, 3.4, cz + 5.45);
  bubNpc(cx, cz + 7, Math.PI, ['#4fd2ff', '#2c2a38', '#9fe8ff', '#3a2a1a'], '🖥 Talk to Dot (Dome Control)', bubDot);
  // pipes snaking to big pump tanks
  for (const [x, z] of [[X - 16, Z - 10], [X - 10, Z - 15]]) { part(levelGroup, Cy(1.6, 1.6, 4, 14), toon('#5d636c', 'panel'), x, 2, z); part(levelGroup, Cy(1.65, 1.65, 0.2, 14), glow('#7fff6a'), x, 2.8, z); solid(x, z, 1.7); }
  part(levelGroup, Cy(0.3, 0.3, 14, 8), toon('#8a8f99'), X - 3, 0.35, Z - 12, 0, 0, Math.PI / 2);
  bubSign('KELP GARDENS · PICK ONLY WHAT YOU PAY FOR', '#0c240c', '#b8ffcf', 4.4, 0.6, X - 4, 4.4, Z + 0.4);
  bcWalkers(D, 5, 'mix', 100); }
function bcCoralHeights() { const D = bcD('coral'), X = D.x, Z = D.z;
  // three towers: Coral Heights (the one you can enter) and two neighbours, with lit windows and roof beacons
  const tower = (tx, tz, tw, th, col, enter) => { const g = new THREE.Group();
    part(g, B(tw, th, tw), toon(col, 'panel'), 0, th / 2, 0);
    for (let f = 0; f < Math.floor(th / 3) - 1; f++) for (let k = 0; k < 3; k++) for (let side = 0; side < 4; side++) { const lit = ((f * 7 + k * 3 + side) % 5) > 1, w = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), lit ? new THREE.MeshBasicMaterial({ color: ['#ffe9a0', '#ffd0a0', '#c8e0ff'][(f + k) % 3] }) : toon('#2a3040'));
      const a = side * Math.PI / 2, o = (k - 1) * (tw / 3.2); w.position.set(Math.sin(a) * (tw / 2 + 0.03) + Math.cos(a) * o, 3.5 + f * 3, Math.cos(a) * (tw / 2 + 0.03) - Math.sin(a) * o); w.rotation.y = a; g.add(w); }
    for (let f = 1; f < th / 3; f++) part(g, B(tw + 0.3, 0.15, tw + 0.3), toon('#d8d0c0'), 0, f * 3, 0);
    part(g, B(tw + 0.6, 0.5, tw + 0.6), toon('#5d636c'), 0, th, 0); part(g, Cy(0.1, 0.1, 4, 5), toon('#2b2a2c'), tw / 4, th + 2, tw / 4); const bc2 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), glow('#ff3b2a')); bc2.position.set(tw / 4, th + 4, tw / 4); g.add(bc2);
    g.position.set(tx, 0, tz); levelGroup.add(g); box(tx, tz, tw / 2, tw / 2); return g; };
  tower(X - 14, Z + 6, 9, 24, '#7a6f8a'); tower(X + 15, Z + 8, 8, 18, '#8a7a6a');
  const ex = X, ez = Z + 14, ew = 10, main = tower(ex, ez, ew, 26, '#8a7f9a');
  part(main, B(4, 3, 0.2), toon('#3a5266'), 0, 1.5, -ew / 2 - 0.05); part(main, B(5.4, 0.3, 2), toon('#c9a43a'), 0, 3.3, -ew / 2 - 1); for (const s of [-1, 1]) part(main, Cy(0.1, 0.1, 3.3, 6), toon('#c9a43a'), s * 2.5, 1.65, -ew / 2 - 1.9);
  bubSign('CORAL HEIGHTS', '#1a1426', '#ffd0a0', 4, 0.6, ex, 3.9, ez - ew / 2 - 1.05, Math.PI);
  INTERACTS.push({ x: ex, z: ez - ew / 2 - 1.4, r: 2.4, label: '🏢 Enter Coral Heights', fn: () => bubGoFloor(1, true) }); BUB.towerExit = [ex, ez - ew / 2 - 2.4, Math.PI];
  // Reel Deal Tackle: a little shopfront with a giant fish on the roof
  const sx = X + 14, sz = Z - 8, sh = new THREE.Group(); part(sh, B(8, 4, 6), toon('#3f7d7a', 'wood'), 0, 2, 0); part(sh, B(8.6, 0.3, 6.6), toon('#ffd36a'), 0, 4.15, 0);
  const bf = new THREE.Group(); part(bf, B(1.4, 1.8, 4.5), toon('#4fa8cc'), 0, 0, 0); part(bf, B(0.3, 1.8, 1.4), toon('#4fa8cc'), 0, 0.2, -2.8); part(bf, new THREE.SphereGeometry(0.2, 6, 4), toon('#111'), 0.72, 0.3, 1.6); part(bf, B(0.1, 0.1, 2.5), toon('#c9a43a'), 0, 1.4, 2.6, -0.6, 0, 0);
  bf.position.set(0, 5.6, 0); bf.rotation.y = Math.PI / 2; sh.add(bf); levelAnims.push(t => { bf.rotation.z = Math.sin(t) * 0.1; });
  part(sh, B(4, 2.2, 0.1), new THREE.MeshBasicMaterial({ color: '#2a4a5a' }), 0, 1.3, -3.03); const tsg = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.8), new THREE.MeshBasicMaterial({ map: signTex('REEL DEAL TACKLE', '#0c2a3a', '#7fe8ff') })); tsg.position.set(0, 3.2, -3.06); tsg.rotation.y = Math.PI; sh.add(tsg);
  for (let i = 0; i < 4; i++) part(sh, Cy(0.03, 0.05, 2.6, 5), toon('#c9a43a'), -3.4 + i * 0.25, 1.3, -3.3, 0.2, 0, 0);
  sh.position.set(sx, 0, sz); levelGroup.add(sh); box(sx, sz, 4, 3);
  bubNpc(sx, sz - 4.4, Math.PI, ['#3a7a5a', '#5a4a3a', '#e0b892', '#c8c0b0'], '🎣 Reel Deal Tackle', bubTackle);
  // the coral park: winding path, coral, a pond, the loose hamster
  const pond = new THREE.Mesh(new THREE.CircleGeometry(3.6, 24).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#4fa8cc' })); pond.position.set(X - 12, 0.12, Z - 10); levelGroup.add(pond); solid(X - 12, Z - 10, 3.6);
  for (let i = 0; i < 28; i++) { const a = bcR(i + 200) * Math.PI * 2, r = 5 + bcR(i + 300) * 8, x = X - 12 + Math.cos(a) * r, z = Z - 8 + Math.sin(a) * r * 0.8; if (Math.hypot(x - (X - 12), z - (Z - 10)) < 4.4 || Math.hypot(x - X, z - Z) > D.r - 3) continue; bcCoral(x, z, 0.9 + bcR(i) * 0.6, i); }
  for (let i = 0; i < 5; i++) bcLamp(X - 6 + i * 3, Z - 2 + Math.sin(i) * 2, '#ffd0a0');
  if (!bubS().ham) { const h = bubHamster(); levelGroup.add(h); BUB.ham = h; const hx = X - 7, hz = Z - 14;
    levelAnims.push(t => { if (bubS().ham) return; h.position.set(hx + Math.cos(t * 1.7) * 1.2, 0, hz + Math.sin(t * 1.7) * 1.2); h.rotation.y = -t * 1.7; });
    INTERACTS.push({ get x() { return bubS().ham ? 1e9 : h.position.x; }, get z() { return h.position.z; }, r: 1.8, label: '🐹 Pick up the tiny hamster', fn: bubPickHam }); }
  if (bubS().ham === 1) bubFollower();
  bcWalkers(D, 7, 'mix', 130); }

// ---------- the level ----------
{ const L = LEVELS.bubblecity; L.size = 260; L.spawn = { x: 15, z: 12, yaw: Math.PI * 0.25 };
  const npcPos = { blub: [0, -9, 0], pearlmkt: [-10, 9, Math.PI * 0.75], barnacle: [84 - 6, -14, Math.PI], kelpa: [-6, -76, Math.PI], pip: [6, 76, 0] };
  for (const n of L.npcs) if (npcPos[n.id]) { const [x, z, f] = npcPos[n.id]; Object.assign(n, { x, z, face: f }); }
  L.build = function () { BC.tubes.length = 0; BC.walk.length = 0;
    levelGroup.add(new THREE.HemisphereLight(0x9fd8ef, 0x4a3a2a, 0.45)); const sunL = new THREE.DirectionalLight(0xbfefff, 0.25); sunL.position.set(30, 80, 20); levelGroup.add(sunL);
    for (const D of BC.domes) bcDome(D);
    bcTube('hub', 'kelp'); bcTube('hub', 'burbs'); bcTube('hub', 'low'); bcTube('hub', 'coral');
    const parts = [bcSeabed, bcHub, bcLow, bcBurbs, bcKelp, bcCoralHeights, bubTower, bubFlat, bubFlatDetails, bubHallDetails];
    for (const f of parts) { try { f(); } catch (e) { console.warn('bubble3 ' + f.name, e); } }
    // keep the player inside the glass: if a step would leave every dome and tunnel, undo it
    let ok = new THREE.Vector3(L.spawn.x, 0, L.spawn.z);
    levelAnims.push(() => { if (bcInside(player.pos.x, player.pos.z)) ok.set(player.pos.x, player.pos.y, player.pos.z); else { player.pos.x = ok.x; player.pos.z = ok.z; } });
    // each dome announces itself when you walk in
    let cur = null; levelAnims.push(() => { const d = BC.domes.find(d => Math.hypot(player.pos.x - d.x, player.pos.z - d.z) < d.r - 2); const id = d ? d.id : null; if (id && id !== cur) { cur = id; toast(d.name, { hub: 'Plaza · transit · the way out', kelp: 'Farms · Dome Control', burbs: 'Lawns, fences, a murder', low: 'Neon, deals, bad ideas', coral: 'Apartments · tackle · the coral park' }[id], 1.8); } else if (!id && d === undefined) {} });
  };
}
// coming back up from the city drops you beside the miniature dome; coming down lands you at the hub's exit machine
