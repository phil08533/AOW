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
// ---------- the city's own textures: drawn once on canvases, tinted per use, tiled by world size ----------
const BCT = { c: {}, m: {} };
BC.lamps = [];
function bcCanvas(kind) { if (BCT.c[kind]) return BCT.c[kind]; const S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'), R = i => bcR(i * 7.3 + kind.length * 31);
  const fill = (c) => { x.fillStyle = c; x.fillRect(0, 0, S, S); }, speck = (n, cols, sz) => { for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; x.fillRect(R(i) * S, R(i + 500) * S, sz, sz); } };
  if (kind === 'tile') { fill('#ddd6c8'); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#e8e2d6' : '#d2cabb'; x.fillRect(i * 16 + 1, j * 16 + 1, 14, 14); } speck(40, ['#c8c0b0', '#f0ece4'], 1); }
  else if (kind === 'asphalt') { fill('#3a3640'); speck(260, ['#2a2830', '#4a4650', '#555060'], 1); x.strokeStyle = '#26242a'; x.beginPath(); x.moveTo(5, 40); x.lineTo(22, 33); x.lineTo(30, 45); x.stroke(); }
  else if (kind === 'brick') { fill('#5a3a3a'); for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) { x.fillStyle = ['#7a4a40', '#6a3e38', '#844e44', '#70443c'][(r + k) % 4]; x.fillRect(k * 16 + (r % 2 ? 8 : 0) - 8 + 1, r * 8 + 1, 14, 6); } }
  else if (kind === 'siding') { fill('#ffffff'); for (let r = 0; r < 8; r++) { x.fillStyle = '#e4e4e4'; x.fillRect(0, r * 8 + 6, S, 2); x.fillStyle = '#f6f6f6'; x.fillRect(0, r * 8, S, 1); } }
  else if (kind === 'shingle') { fill('#ffffff'); for (let r = 0; r < 8; r++) for (let k = 0; k < 6; k++) { x.fillStyle = ['#e6e6e6', '#d4d4d4', '#f0f0f0'][(r * 3 + k) % 3]; x.fillRect(k * 11 + (r % 2 ? 5 : 0) - 5, r * 8, 10, 7); } }
  else if (kind === 'grass') { fill('#5a9a40'); speck(300, ['#4a8a34', '#6aaa48', '#78b852', '#3f7a30'], 1); }
  else if (kind === 'soil') { fill('#4a3a28'); speck(240, ['#3a2c1e', '#5a4632', '#6a5238'], 1); }
  else if (kind === 'pavers') { fill('#b8a48c'); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { x.fillStyle = ['#c8b49c', '#bca890', '#d0bca4'][(r + k * 2) % 3]; x.fillRect(k * 16 + (r % 2 ? 8 : 0) - 8 + 1, r * 16 + 1, 14, 14); } }
  else if (kind === 'grate') { fill('#4a4f58'); for (let i = 0; i < S; i += 6) { x.fillStyle = '#3a3e46'; x.fillRect(i, 0, 2, S); x.fillRect(0, i, S, 2); } speck(20, ['#5d636c'], 2); }
  else if (kind === 'carpet') { fill('#6a2a3a'); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { x.fillStyle = '#7a3446'; x.fillRect(i * 8 + 2, j * 8 + 2, 4, 4); } speck(80, ['#5a2232', '#8a4050'], 1); }
  else if (kind === 'wallpaper') { fill('#c8b8c8'); for (let i = 0; i < 4; i++) { x.fillStyle = '#b8a4ba'; x.fillRect(i * 16, 0, 6, S); } for (let j = 0; j < 4; j++) { x.fillStyle = '#e0d0e0'; x.beginPath(); x.arc(11, j * 16 + 8, 2, 0, 7); x.fill(); } }
  else if (kind === 'wood') { fill('#8a6a4a'); for (let r = 0; r < 8; r++) { x.fillStyle = ['#7a5a3c', '#946f4e', '#84623f'][r % 3]; x.fillRect(0, r * 8, S, 7); x.fillStyle = '#5a4028'; x.fillRect((r * 23) % S, r * 8, 1, 7); } }
  else if (kind === 'concrete') { fill('#9a9aa2'); speck(200, ['#8a8a92', '#a8a8b0', '#7e7e86'], 1); x.fillStyle = '#86868e'; x.fillRect(0, 31, S, 1); x.fillRect(31, 0, 1, S); }
  else if (kind === 'panel') { fill('#5d636c'); x.fillStyle = '#4a4f58'; x.fillRect(0, 0, S, 2); x.fillRect(0, 0, 2, S); x.fillRect(0, 31, S, 2); speck(8, ['#8a8f99'], 2); }
  return (BCT.c[kind] = cv); }
function bcMat(kind, rx, ry, tint) { const k = kind + rx + ':' + ry + (tint || ''); if (BCT.m[k]) return BCT.m[k];
  const t = new THREE.CanvasTexture(bcCanvas(kind)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.magFilter = THREE.NearestFilter; t.encoding = THREE.sRGBEncoding;
  return (BCT.m[k] = new THREE.MeshLambertMaterial({ map: t, color: new THREE.Color(tint || '#ffffff').convertSRGBToLinear() })); }

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
  const fl = new THREE.Mesh(new THREE.CircleGeometry(R + 0.5, 48).rotateX(-Math.PI / 2), bcMat({hub:'tile',kelp:'soil',burbs:'grass',low:'asphalt',coral:'pavers'}[D.id], Math.round(D.r/2), Math.round(D.r/2), D.floor)); fl.position.y = 0.07; g.add(fl);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: D.glass, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
  g.add(glass);
  for (let i = 0; i < 10; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(R, 0.22, 5, 32, Math.PI), toonNS('#7a808a')); rib.rotation.y = (i + 0.5) / 10 * Math.PI; g.add(rib); }
  for (const h of [0.35, 0.7]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R * Math.cos(Math.asin(h)), 0.16, 5, 48), toonNS('#7a808a')); ring.rotation.x = Math.PI / 2; ring.position.y = R * h; g.add(ring); }
  // the base ring and glow strip leave gaps where the tunnels come in, so nothing crosses a walkway
  const gaps = BC.domes.filter(o => o !== D && (o.id === 'hub' || D.id === 'hub')).map(o => Math.atan2(o.z - D.z, o.x - D.x)).sort((a, b) => a - b), gw = Math.asin(Math.min(1, 3.4 / R));
  const arcs = gaps.length ? gaps.map((a, k) => { const b = k + 1 < gaps.length ? gaps[k + 1] : gaps[0] + Math.PI * 2; return [a + gw, b - gw - (a + gw)]; }) : [[0, Math.PI * 2]];
  for (const [a0, len] of arcs) if (len > 0.02) { for (const [rr, tr, m, y] of [[R, 0.5, toonNS('#4a4f58', 'panel'), 0.25], [R - 0.6, 0.07, glow(D.id === 'low' ? '#ff3bd2' : '#7fe8ff'), 0.1]]) { const geo = new THREE.TorusGeometry(rr, tr, 6, Math.max(4, Math.round(len * 8)), len); geo.rotateZ(a0); geo.rotateX(Math.PI / 2); const ms = new THREE.Mesh(geo, m); ms.position.y = y; g.add(ms); } }
  // a crown light at the top of every dome
  part(g, Cy(1.2, 1.6, 0.6, 12), toonNS('#4a4f58', 'panel'), 0, R - 0.2, 0); part(g, new THREE.SphereGeometry(0.5, 10, 8), glow('#ffe9a0'), 0, R + 0.4, 0);
  g.position.set(D.x, 0, D.z); levelGroup.add(g);
  const L = new THREE.PointLight(D.light, D.id === 'low' ? 1.3 : D.id === 'hub' ? 0.6 : 0.9, R * 2.2); L.position.set(D.x, R * 0.75, D.z); levelGroup.add(L);
  // a big name board where the tunnel from the hub arrives
  return g; }
function bcTube(a, b) { const A = bcD(a), Bd = bcD(b), dx = Bd.x - A.x, dz = Bd.z - A.z, dd = Math.hypot(dx, dz), ux = dx / dd, uz = dz / dd;
  const ax = A.x + ux * (A.r - 3), az = A.z + uz * (A.r - 3), len = dd - A.r - Bd.r + 6; BC.tubes.push({ ax, az, ux, uz, len });
  const g = new THREE.Group(), ry = Math.atan2(ux, uz);
  part(g, B(5, 0.18, len), bcMat('grate', 2, Math.round(len / 2), '#8a9098'), 0, 0.09, len / 2);
  // a moving walkway down the middle, with chevrons sliding along it
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#2a2e36'; c.fillRect(0, 0, 32, 64); c.strokeStyle = '#7fe8ff'; c.lineWidth = 4; c.beginPath(); c.moveTo(4, 40); c.lineTo(16, 24); c.lineTo(28, 40); c.stroke();
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, len / 2.5); const belt = new THREE.Mesh(new THREE.PlaneGeometry(1.6, len).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex }));
  belt.position.set(0, 0.2, len / 2); g.add(belt); levelAnims.push(t => { tex.offset.y = -t * 0.6; });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, len, 22, 1, true), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }));
  tube.rotation.x = Math.PI / 2; tube.position.set(0, 0.6, len / 2); g.add(tube);
  for (let s = 2; s < len; s += 4) { const rib = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.14, 5, 22, Math.PI), toonNS('#7a808a')); rib.position.set(0, 0.6, s); g.add(rib);
    for (const sx of [-1, 1]) part(g, B(0.12, 0.06, 1.2), glow(s % 8 < 4 ? '#7fe8ff' : '#ffd36a'), sx * 2.3, 0.2, s); }
  for (const sx of [-1, 1]) part(g, B(0.15, 0.9, len), toonNS('#3a3d44', 'panel'), sx * 2.55, 0.45, len / 2);
  g.position.set(ax, 0, az); g.rotation.y = ry; levelGroup.add(g);
  // tunnel mouth signs on both ends
  const sA = bubSign('→ ' + Bd.name, '#0c1a24', '#7fe8ff', 4, 0.6, ax + ux * 0.5, 3.95, az + uz * 0.5, ry + Math.PI);
  const sB = bubSign('→ ' + A.name, '#0c1a24', '#7fe8ff', 4, 0.6, ax + ux * (len - 0.5), 3.95, az + uz * (len - 0.5), ry);
  // sliding glass doors at each mouth, parting as you walk up
  for (const zz of [0.4, len - 0.4]) { const pan = []; for (const sx of [-1, 1]) { const d = new THREE.Group(); part(d, B(2.5, 3.4, 0.08), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.35, depthWrite: false }), 0, 1.8, 0); part(d, B(2.5, 0.12, 0.12), toonNS('#7a808a'), 0, 3.5, 0); part(d, B(2.5, 0.12, 0.12), toonNS('#7a808a'), 0, 0.12, 0); part(d, B(0.1, 3.4, 0.12), toonNS('#7a808a'), -sx * 1.2, 1.8, 0); part(d, B(0.4, 0.05, 0.1), glow('#7fe8ff'), 0, 2.2, 0.06);
      d.position.set(sx * 1.25, 0, zz); g.add(d); pan.push([d, sx]); }
    part(g, B(5.4, 0.3, 0.3), toonNS('#4a4f58', 'panel'), 0, 3.7, zz); const wx = ax + ux * zz, wz = az + uz * zz; let o = 0;
    levelAnims.push((t, dt) => { const near = Math.hypot(player.pos.x - wx, player.pos.z - wz) < 5.5; o += ((near ? 1 : 0) - o) * Math.min(1, (dt || 0.016) * 6); for (const [d, sx] of pan) d.position.x = sx * (1.25 + o * 2.3); }); }
  for (const [px, pz] of [[ax, az], [ax + ux * len, az + uz * len]]) for (const sx of [-1, 1]) part(levelGroup, B(0.5, 5, 0.5), toonNS('#4a4f58', 'panel'), px + uz * sx * 3, 2.5, pz - ux * sx * 3); }
function bcHouse(x, z, ry, c, opts) { const o = opts || {}, w = o.w || 6, d = o.d || 5, h = o.h || 3.4, g = new THREE.Group();
  const wall = bcMat('siding', Math.round(w / 2), Math.round(h / 2), c[0]), trim = toonNS('#f4f0e8');
  part(g, B(w, h, d), wall, 0, h / 2, 0);
  // pitched roof from two slabs, a chimney, a porch with steps, windows with shutters and window boxes
  // a proper gable roof: a triangular prism running the width of the house, shingled, with fascia boards along the eaves
  { const rr = (d + 0.8) / Math.sqrt(3), rg = new THREE.CylinderGeometry(rr, rr, w + 0.6, 3); rg.rotateZ(Math.PI / 2); rg.rotateX(-Math.PI / 2);
    const roof = new THREE.Mesh(rg, bcMat('shingle', Math.round(w / 1.5), 3, c[1])); roof.position.set(0, h + rr / 2, 0); g.add(roof);
    for (const s of [-1, 1]) part(g, B(w + 0.7, 0.12, 0.12), trim, 0, h + 0.02, s * (d / 2 + 0.4)); }
  part(g, B(0.6, 1.4, 0.6), toonNS('#8a5a4a'), w * 0.28, h + 1.2, -d * 0.15);
  part(g, B(1.2, 2.1, 0.1), toonNS(c[2] || '#3a5266'), 0, 1.05, d / 2 + 0.05); part(g, new THREE.SphereGeometry(0.06, 6, 4), toonNS('#c9a43a'), 0.42, 1.0, d / 2 + 0.12);
  part(g, B(2.4, 0.15, 1.2), toonNS('#8a6a44', 'wood'), 0, 0.2, d / 2 + 0.6); part(g, B(2.6, 0.12, 1.3), toonNS(c[1]), 0, 2.6, d / 2 + 0.55);
  for (const s of [-1, 1]) { part(g, Cy(0.07, 0.07, 2.4, 6), trim, s * 1.1, 1.4, d / 2 + 1.1);
    const wx = s * w * 0.32; part(g, B(1.1, 1.0, 0.06), new THREE.MeshBasicMaterial({ color: o.dark ? '#2a3040' : '#ffe9a0' }), wx, 1.7, d / 2 + 0.04);
    part(g, B(1.2, 0.08, 0.1), trim, wx, 2.24, d / 2 + 0.08); part(g, B(0.08, 1.0, 0.1), trim, wx, 1.7, d / 2 + 0.08);
    for (const k of [-1, 1]) part(g, B(0.3, 1.1, 0.05), toonNS(c[1]), wx + k * 0.72, 1.7, d / 2 + 0.06);
    part(g, B(1.1, 0.22, 0.3), toonNS('#6a4f34', 'wood'), wx, 1.12, d / 2 + 0.2); for (let f = 0; f < 4; f++) part(g, new THREE.SphereGeometry(0.1, 5, 4), toonNS(['#ff6aa8', '#ffd36a', '#c86aff', '#ff6a5a'][(f + (x | 0)) % 4]), wx - 0.4 + f * 0.27, 1.3, d / 2 + 0.22); }
  g.position.set(x, 0, z); g.rotation.y = ry; levelGroup.add(g);
  const c2 = Math.abs(Math.cos(ry)), s2 = Math.abs(Math.sin(ry)); box(x, z, (w * c2 + d * s2) / 2, (d * c2 + w * s2) / 2);
  return { door: [x + Math.sin(ry) * (d / 2 + 1.6), z + Math.cos(ry) * (d / 2 + 1.6)] }; }
function bcLamp(x, z, col) { const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col || '#ffe9a0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); pool.position.set(x + 0.5, 0.14, z); levelGroup.add(pool);
  let pl = null; if (BC.lamps.length < 10) { pl = new THREE.PointLight(new THREE.Color(col || '#ffe9a0'), 0, 9, 2); pl.position.set(x + 0.5, 3.1, z); levelGroup.add(pl); } BC.lamps.push({ pool, pl }); part(levelGroup, Cy(0.08, 0.12, 3.6, 6), toonNS('#2b2a2c'), x, 1.8, z); part(levelGroup, B(0.6, 0.08, 0.08), toonNS('#2b2a2c'), x + 0.25, 3.55, z);
  part(levelGroup, new THREE.SphereGeometry(0.22, 8, 6), glow(col || '#ffe9a0'), x + 0.5, 3.35, z); }
function bcKelpTree(x, z, s) { const g = new THREE.Group(); s = s || 1; for (let i = 0; i < 5; i++) { const k = new THREE.Mesh(B(0.25 * s, (3 + (i % 3)) * s, 0.08), toonNS(i % 2 ? '#3f7a3a' : '#5a9a3a', 'leaves')); k.position.set(Math.cos(i * 1.3) * 0.3, (1.5 + (i % 3) * 0.5) * s, Math.sin(i * 1.3) * 0.3); k.rotation.y = i; g.add(k); }
  for (let i = 0; i < 6; i++) part(g, new THREE.SphereGeometry(0.12 * s, 6, 4), glow('#b8ff6a'), Math.cos(i) * 0.4, (2 + i * 0.5) * s, Math.sin(i) * 0.4);
  g.position.set(x, 0, z); levelGroup.add(g); levelAnims.push(t => { g.rotation.z = Math.sin(t * 0.8 + x) * 0.05; g.rotation.x = Math.cos(t * 0.6 + z) * 0.05; }); solid(x, z, 0.4); }
function bcCoral(x, z, s, i) { const g = new THREE.Group(), cols = ['#ff6aa8', '#ffb347', '#c86aff', '#4fffe0', '#ff6a5a'];
  for (let k = 0; k < 5; k++) { const h = (0.6 + bcR(i + k) * 1.4) * s; const b = new THREE.Mesh(Cy(0.08 * s, 0.14 * s, h, 6), toonNS(cols[(i + k) % 5])); b.position.set(Math.cos(k * 1.7) * 0.3 * s, h / 2, Math.sin(k * 1.7) * 0.3 * s); b.rotation.set(Math.cos(k) * 0.4, 0, Math.sin(k) * 0.4); g.add(b);
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
  const sea = new THREE.Mesh(new THREE.CircleGeometry(230, 48).rotateX(-Math.PI / 2), toonNS('#1c3e4a')); sea.position.y = -0.15; levelGroup.add(sea);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(240, 24, 12), new THREE.MeshBasicMaterial({ color: '#0a2a3e', side: THREE.BackSide, fog: false })); levelGroup.add(sky);
  // light shafts coming down from the surface
  for (let i = 0; i < 9; i++) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(6 + bcR(i) * 6, 90), new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    sh.position.set(-110 + i * 27, 45, -60 + bcR(i + 3) * 120); sh.rotation.set(0, bcR(i + 6) * 3, 0.25); levelGroup.add(sh); levelAnims.push(t => { sh.material.opacity = 0.04 + Math.sin(t * 0.3 + i) * 0.025; }); }
  // rocks and kelp forest between the domes (never inside them)
  for (let i = 0; i < 70; i++) { const a = bcR(i) * Math.PI * 2, r = 40 + bcR(i + 99) * 80, x = Math.cos(a) * r, z = Math.sin(a) * r; if (BC.domes.some(d => Math.hypot(x - d.x, z - d.z) < d.r + 6) || BC.tubes.some(t => { const dx = x - t.ax, dz = z - t.az, a = dx * t.ux + dz * t.uz, c = -dx * t.uz + dz * t.ux; return a > -6 && a < t.len + 6 && Math.abs(c) < 9; })) continue;
    if (i % 3) { const kg = new THREE.Group(); for (let k = 0; k < 4; k++) { const h = 6 + bcR(i + k) * 10, m = new THREE.Mesh(B(0.5, h, 0.12), toonNS(k % 2 ? '#2f6a3a' : '#3f8a3a', 'leaves')); m.position.set(k * 0.6 - 0.9, h / 2, Math.sin(k) * 0.5); kg.add(m); }
      kg.position.set(x, 0, z); levelGroup.add(kg); levelAnims.push(t => { kg.rotation.z = Math.sin(t * 0.5 + i) * 0.08; }); }
    else { const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5 + bcR(i + 4) * 3, 0), toonNS('#3a4a52')); rk.position.set(x, 0.5, z); rk.scale.y = 0.6; rk.rotation.y = i; levelGroup.add(rk); } }
  // a whale drifting slowly over the whole city
  const wh = new THREE.Group(), wm = toonNS('#3a5a7a'), wb = toonNS('#c8d8e0');
  part(wh, B(5, 4, 16), wm, 0, 0, 0); part(wh, B(4.6, 1.2, 12), wb, 0, -2.2, 1); part(wh, B(3, 3, 5), wm, 0, -0.3, -9.5); part(wh, B(8, 0.4, 3), wm, 0, 0, -12.5);
  for (const s of [-1, 1]) { part(wh, B(4, 0.3, 2), wm, s * 4, -1.3, 3, 0, 0, s * 0.4); part(wh, new THREE.SphereGeometry(0.3, 6, 4), toonNS('#111'), s * 2.55, 0.6, 6.5); }
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
  const tile = new THREE.Mesh(new THREE.CircleGeometry(14, 40).rotateX(-Math.PI / 2), bcMat('tile', 8, 8, '#c8beb0')); tile.position.set(X, 0.1, Z); levelGroup.add(tile);
  const ring = new THREE.Mesh(new THREE.RingGeometry(14, 15, 40).rotateX(-Math.PI / 2), toonNS('#8fb8cc')); ring.position.set(X, 0.11, Z); levelGroup.add(ring);
  for (const [r, h, y] of [[5, 0.6, 0.3], [3.4, 0.5, 0.9], [1.8, 0.4, 1.5]]) { part(levelGroup, Cy(r, r + 0.3, h, 28), toonNS('#c8e0ff'), X, y, Z); part(levelGroup, Cy(r - 0.3, r - 0.3, 0.05, 28), new THREE.MeshLambertMaterial({ color: '#4fa8cc', transparent: true, opacity: 0.8 }), X, y + h / 2 + 0.01, Z); }
  solid(X, Z, 5.4);
  const fish = new THREE.Group(); part(fish, B(1.2, 1.6, 3), toonNS('#c9a43a'), 0, 0, 0); part(fish, B(0.2, 1.6, 1.2), toonNS('#c9a43a'), 0, 0.3, -1.9); part(fish, new THREE.SphereGeometry(0.15, 6, 4), toonNS('#111'), 0.62, 0.3, 1);
  fish.position.set(X, 3.4, Z); fish.rotation.x = -0.5; levelGroup.add(fish); levelAnims.push(t => { fish.rotation.y = t * 0.2; });
  bubSign('FOUNDER FISHWICK · HE SWAM SO WE COULD SIT', '#3a2a1a', '#ffd36a', 4.4, 0.45, X, 1.25, Z + 5.45);
  const fb = []; for (let i = 0; i < 20; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.05, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6 })); levelGroup.add(m); fb.push(m); }
  levelAnims.push(t => fb.forEach((m, i) => { const k = (t * 0.3 + i * 0.05) % 1; m.position.set(X + Math.sin(i * 2.4) * (0.3 + k * 1.6), 4.4 + k * 12, Z + Math.cos(i * 2.4) * (0.3 + k * 1.6)); m.material.opacity = 0.6 * (1 - k); }));
  // the transit board: a drawn map of the domes
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#0c1a24'; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = '#7fe8ff'; c.lineWidth = 6; for (const d of BC.domes) { if (d.id === 'hub') continue; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + d.x * 1.1, 128 + d.z * 1.1); c.stroke(); }
  c.font = 'bold 13px monospace'; c.textAlign = 'center'; for (const d of BC.domes) { c.fillStyle = d.glass; c.beginPath(); c.arc(128 + d.x * 1.1, 128 + d.z * 1.1, d.r * 0.7, 0, 7); c.fill(); c.fillStyle = '#0c1a24'; c.fillText(d.name.replace('THE ', ''), 128 + d.x * 1.1, 132 + d.z * 1.1); }
  c.fillStyle = '#ffd36a'; c.fillText('YOU ARE HERE', 128, 112);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); board.position.set(X + 9, 2.2, Z + 9); board.rotation.y = Math.PI * 1.25; board.position.set(X + 8.93, 2.2, Z + 8.93); levelGroup.add(board);
  part(levelGroup, B(2.9, 2.9, 0.2), toonNS('#3a3d44', 'panel'), X + 9.07, 2.2, Z + 9.07, 0, Math.PI * 0.25, 0); part(levelGroup, B(0.2, 0.8, 0.2), toonNS('#3a3d44'), X + 9.07, 0.4, Z + 9.07); box(X + 9.07, Z + 9.07, 1, 1);
  // food carts, kelp trees, benches, lamps, flags
  const cart = (x, z, ry, name, col) => { const g = new THREE.Group(); part(g, B(2.2, 1.0, 1.2), toonNS(col), 0, 0.7, 0); for (const [a, b] of [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]]) part(g, Cy(0.22, 0.22, 0.1, 10), toonNS('#2b2a2c'), a, 0.22, b, Math.PI / 2, 0, 0);
    for (let k = 0; k < 4; k++) part(g, B(0.6, 0.08, 1.6), toonNS(k % 2 ? '#ffffff' : col), -0.9 + k * 0.6, 2.4, 0, 0.2); for (const s of [-1, 1]) part(g, Cy(0.04, 0.04, 1.3, 4), toonNS('#2b2a2c'), s * 1.0, 1.85, 0.5);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.35), new THREE.MeshBasicMaterial({ map: signTex(name, '#1a1a1a', '#ffd36a') })); sg.position.set(0, 1.0, 0.61); g.add(sg); g.position.set(x, 0, z); g.rotation.y = ry; levelGroup.add(g); box(x, z, 1.2, 1.2); };
  cart(X - 11, Z + 6, Math.PI / 2 + 0.4, 'KELP DOGS', '#c8402f'); cart(X + 12, Z - 4, -Math.PI / 2, 'BUBBLE TEA', '#4fd2ff'); cart(X - 8, Z - 12, 0.6, 'PEARL POPS', '#ff6aa8');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.4; bcKelpTree(X + Math.cos(a) * 20, Z + Math.sin(a) * 20, 1.1); bcLamp(X + Math.cos(a + 0.3) * 16, Z + Math.sin(a + 0.3) * 16); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = X + Math.cos(a) * 9, z = Z + Math.sin(a) * 9, g = new THREE.Group();
    part(g, B(1.8, 0.08, 0.5), toonNS('#8a6a44', 'wood'), 0, 0.5, 0); part(g, B(1.8, 0.5, 0.08), toonNS('#8a6a44', 'wood'), 0, 0.8, -0.25); for (const s of [-1, 1]) part(g, B(0.08, 0.5, 0.5), toonNS('#2b2a2c'), s * 0.8, 0.25, 0);
    g.position.set(x, 0, z); g.rotation.y = -a - Math.PI / 2; levelGroup.add(g); box(x, z, 0.6, 0.6); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), toonNS(['#ff6aa8', '#ffd36a', '#4fd2ff', '#7fff6a'][i % 4])); f.position.set(X + Math.cos(a) * 12, 7, Z + Math.sin(a) * 12); f.lookAt(X, 7, Z); levelGroup.add(f); }
  // the Shrink-o-Matic out (grow back to normal size)
  const m = new THREE.Group(); part(m, Cy(2.2, 2.4, 0.4, 20), toonNS('#3a3d44', 'panel'), 0, 0.2, 0); part(m, Cy(1.6, 1.6, 0.05, 20), glow('#4fd2ff'), 0, 0.43, 0);
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.18, 8, 28), toonNS('#c9a43a')); ringM.position.y = 2.2; m.add(ringM); for (const s of [-1, 1]) part(m, B(0.3, 2.4, 0.3), toonNS('#5d636c'), s * 1.9, 1.2, 0);
  m.position.set(X + 15, 0, Z + 16); levelGroup.add(m); levelAnims.push(t => { ringM.rotation.x = t * 0.8; }); bubSign('GROW BACK · EXIT', '#0c1a24', '#7fe8ff', 2.4, 0.45, X + 15, 4.0, Z + 16, Math.PI * 0.75);
  INTERACTS.push({ x: X + 15, z: Z + 16, r: 2.6, label: '🫧 Grow back to normal size (exit)', fn: ocGrow });
  bubSign('WELCOME TO BUBBLE CITY · POP. 4,000 · PLEASE DO NOT TAP ON THE DOME', '#0c1a24', '#ffe9a0', 9, 0.7, X, 8.5, Z + 18, Math.PI);
  bcWalkers(D, 10, 'mix', 0); }
function bcLow() { const D = bcD('low'), X = D.x, Z = D.z;
  // wet asphalt street running east-west, kerbs, puddles reflecting neon
  part(levelGroup, B(44, 0.04, 7), toonNS('#1e1c24'), X, 0.1, Z); for (let i = 0; i < 10; i++) part(levelGroup, B(1.6, 0.05, 0.15), toonNS('#ffd36a'), X - 20 + i * 4.4, 0.13, Z);
  for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.5 + bcR(i) * 0.9, 12), new THREE.MeshBasicMaterial({ color: ['#ff3bd2', '#4fffe0', '#2a2a44'][i % 3], transparent: true, opacity: 0.35, depthWrite: false })); p.rotation.x = -Math.PI / 2; p.position.set(X - 18 + bcR(i + 9) * 36, 0.14, Z - 3 + bcR(i + 3) * 6); levelGroup.add(p); }
  // storefronts: tall narrow buildings with neon, fire escapes and roof junk, on both sides of the street
  const fronts = [['CRABBY\'S PAWN', '#ffd36a', 'pawn'], ['THE BARNACLE BAR', '#4fffe0', 'bar'], ['INK SQUID TATTOO', '#ff3bd2', 'ink'], ['FISH FRY ARCADE', '#7fff6a', 'arc'], ['24/7 SHELLMART', '#ff6a3a', 'mart'], ['KARAOKE CLAM', '#c86aff', 'kar']];
  BC.low = {};
  fronts.forEach(([name, col, id], i) => { const side = i % 2 ? 1 : -1, x = X - 14 + Math.floor(i / 2) * 14, z = Z + side * 9.5, h = 7 + (i % 3) * 2.5, g = new THREE.Group(), ry = side > 0 ? Math.PI : 0;
    part(g, B(10, h, 6), bcMat('brick', 5, Math.round(h / 1.5), ['#7a6488', '#5a7a88', '#886070'][i % 3]), 0, h / 2, 0);
    for (const sx of [-1, 1]) { const wx = sx * 2.25; part(g, B(2.3, 1.9, 0.06), new THREE.MeshBasicMaterial({ color: ['#3a2a44', '#2a3a4a', '#4a2a3a'][i % 3] }), wx, 1.55, 3.02); part(g, B(2.3, 1.9, 0.04), new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.25 }), wx, 1.55, 3.08);
      for (const fy of [0.55, 2.55]) part(g, B(2.5, 0.12, 0.16), toonNS('#2b2a2c'), wx, fy, 3.1); for (const fx of [-1.2, 0, 1.2]) part(g, B(0.1, 2.0, 0.14), toonNS('#2b2a2c'), wx + fx, 1.55, 3.1); part(g, B(2.5, 0.5, 0.3), bcMat('brick', 2, 1, '#6a5a6a'), wx, 0.25, 3.12);
      for (let k = 0; k < 3; k++) part(g, B(0.35, 0.3 + (k % 2) * 0.25, 0.3), glow([col, '#ffd36a', '#f4f0e8'][k]), wx - 0.6 + k * 0.6, 0.85 + (k % 2) * 0.12, 2.9); } part(g, B(6.2, 0.12, 0.2), glow(col), 0, 2.7, 3.05);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1), new THREE.MeshBasicMaterial({ map: bubSignTex(name, '#120818', col, 6, 1) })); sg.position.set(0, 3.4, 3.12); g.add(sg);
    // awning, AC units, cables, posters and a bit of trash on every front
    for (let k = 0; k < 6; k++) part(g, B(1.05, 0.06, 1.3), toonNS(k % 2 ? col : '#f4f0e8'), -2.6 + k * 1.04, 2.95, 3.6, 0.35, 0, 0);
    for (let f = 1; f < h / 2.6; f++) if ((f + i) % 2) { part(g, B(0.9, 0.6, 0.5), toonNS('#a8acb4', 'panel'), -1.2, 2.2 + f * 2.6 - 0.9, 3.3); part(g, Cy(0.22, 0.22, 0.05, 10), toonNS('#3a3d44'), -1.2, 2.2 + f * 2.6 - 0.9, 3.56, Math.PI / 2, 0, 0); }
    part(g, Cy(0.03, 0.03, 10, 4), toonNS('#111'), 0, h - 0.6, 3.1, 0, 0, Math.PI / 2 + 0.06); part(g, Cy(0.03, 0.03, 4, 4), toonNS('#111'), -4.9, h / 2, 3.08);
    for (let k = 0; k < 3; k++) { const pc = document.createElement('canvas'); pc.width = 32; pc.height = 48; const c = pc.getContext('2d'); c.fillStyle = ['#ffd36a', '#ff6ad2', '#7fe8ff', '#7fff6a'][(i + k) % 4]; c.fillRect(0, 0, 32, 48); c.fillStyle = '#120818'; c.fillRect(4, 6, 24, 18); c.font = 'bold 8px monospace'; c.fillText(['GIG', 'LOST', 'SALE', 'WANTED'][(i + k) % 4], 3, 36); c.fillRect(4, 40, 24, 2);
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.75), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc) })); pm.position.set(3.4 + k * 0.55, 1.2 + (k % 2) * 0.2, 3.07); pm.rotation.z = (k - 1) * 0.08; g.add(pm); }
    for (let k = 0; k < 3; k++) part(g, k === 2 ? Cy(0.25, 0.25, 0.6, 8) : B(0.5, 0.4, 0.4), toonNS(k === 2 ? '#3a5a3a' : '#2b2a2c'), -4.2 + k * 0.6, k === 2 ? 0.3 : 0.2, 3.6);
    for (let f = 1; f < h / 2.6; f++) for (const s of [-1, 1]) part(g, B(1.4, 1.2, 0.06), (f + i + s) % 3 ? new THREE.MeshBasicMaterial({ color: ['#ffd0a0', '#ff6ad2', '#7fe8ff'][(f + i) % 3] }) : toonNS('#1a1a22'), s * 2.8, 2.2 + f * 2.6, 3.04);
    for (let f = 1; f < h / 2.6; f++) { part(g, B(2.4, 0.08, 1), toonNS('#2b2a2c'), 3.6, 1.6 + f * 2.6, 3.5); part(g, B(2.4, 0.6, 0.04), toonNS('#2b2a2c'), 3.6, 1.9 + f * 2.6, 4.0); }
    part(g, Cy(0.5, 0.5, 1.4, 8), toonNS('#5d636c'), -3, h + 0.7, -1); part(g, B(1.4, 0.8, 1.4), toonNS('#5d636c', 'panel'), 2.5, h + 0.4, 0);
    g.position.set(x, 0, z); g.rotation.y = ry; levelGroup.add(g); box(x, z, 5, 3); BC.low[id] = [x, z - side * 4.2];
    const L = new THREE.PointLight(new THREE.Color(col), 0.8, 9); L.position.set(x, 2.5, z - side * 4.5); levelGroup.add(L); levelAnims.push(t => { L.intensity = (Math.sin(t * 9 + i * 7) > 0.93 ? 0.15 : 0.8); }); });
  // alley props: dumpsters, a burning barrel, steam vents, a van full of TVs, a broken payphone
  for (const [x, z] of [[X - 21, Z - 4.6], [X + 19, Z + 4.6]]) { const dg = new THREE.Group(); part(dg, B(2, 1.3, 1.1), toonNS('#2f5a3a'), 0, 0.75, 0); part(dg, B(2.1, 0.12, 1.2), toonNS('#1e3a26'), 0, 1.45, -0.1, -0.3, 0, 0); dg.position.set(x, 0, z); levelGroup.add(dg); box(x, z, 1.1, 0.6); }
  const bar = new THREE.Group(); part(bar, Cy(0.4, 0.38, 1, 10), toonNS('#5a3a2a'), 0, 0.5, 0); bar.position.set(X + 4, 0, Z - 4.2); levelGroup.add(bar); solid(X + 4, Z - 4.2, 0.5);
  const fire = []; for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ff8a2a' : '#ffd36a', transparent: true, opacity: 0.85 })); levelGroup.add(f); fire.push(f); }
  const fl = new THREE.PointLight(0xff8a2a, 1.2, 7); fl.position.set(X + 4, 1.6, Z - 4.2); levelGroup.add(fl);
  levelAnims.push(t => { fire.forEach((f, i) => { const k = (t * 1.2 + i / 6) % 1; f.position.set(X + 4 + Math.sin(i * 2 + t * 3) * 0.15, 1.05 + k * 1.1, Z - 4.2 + Math.cos(i * 2) * 0.15); f.scale.setScalar(1 - k); }); fl.intensity = 1 + Math.sin(t * 13) * 0.3; });
  for (const [x, z] of [[X - 8, Z + 1.5], [X + 10, Z - 1.8]]) { const st = []; part(levelGroup, B(1, 0.06, 1), toonNS('#5d636c'), x, 0.08, z); for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), new THREE.MeshBasicMaterial({ color: '#d8d8e8', transparent: true, opacity: 0.25, depthWrite: false })); levelGroup.add(m); st.push(m); }
    levelAnims.push(t => st.forEach((m, i) => { const k = (t * 0.4 + i / 6) % 1; m.position.set(x + Math.sin(i + t) * 0.3, 0.2 + k * 3, z); m.scale.setScalar(0.6 + k * 2); m.material.opacity = 0.25 * (1 - k); })); }
  // Rizzo's van: a proper box van, cab at the front, TVs racked on the street side
  const van = new THREE.Group(), body = toonNS('#d8d0c0'), dark = toonNS('#1e1a18'), chrome = toonNS('#c8ccd4');
  part(van, B(2.2, 2.1, 3.4), body, 0, 1.45, -0.6); part(van, B(2.2, 1.4, 1.5), body, 0, 1.1, 1.85); part(van, B(2.1, 0.75, 0.9), body, 0, 2.05, 1.55);
  part(van, B(1.9, 0.6, 0.05), new THREE.MeshBasicMaterial({ color: '#5a7a9a' }), 0, 2.05, 2.03, -0.35, 0, 0); for (const sx of [-1, 1]) part(van, B(0.05, 0.5, 0.7), new THREE.MeshBasicMaterial({ color: '#4a6a8a' }), sx * 1.11, 2.0, 1.5);
  part(van, B(2.25, 0.35, 0.15), chrome, 0, 0.55, 2.62); part(van, B(1.4, 0.4, 0.05), dark, 0, 0.95, 2.61); for (let k = 0; k < 4; k++) part(van, B(1.3, 0.04, 0.06), chrome, 0, 0.8 + k * 0.1, 2.63);
  for (const sx of [-1, 1]) { part(van, B(0.35, 0.22, 0.05), glow('#fff6d0'), sx * 0.85, 1.05, 2.62); part(van, B(0.25, 0.3, 0.05), glow('#ff3b2a'), sx * 0.9, 1.2, -2.32); part(van, B(0.08, 0.25, 0.25), dark, sx * 1.2, 1.9, 2.1); }
  part(van, B(2.25, 0.4, 0.15), chrome, 0, 0.55, -2.35); part(van, B(0.04, 1.8, 0.04), dark, 0, 1.45, -2.31); part(van, B(0.7, 0.35, 0.02), new THREE.MeshBasicMaterial({ color: '#f4f0e8' }), 0.5, 0.75, -2.32);
  for (const [a, b] of [[-1.1, -1.5], [1.1, -1.5], [-1.1, 1.6], [1.1, 1.6]]) { part(van, Cy(0.42, 0.42, 0.3, 12), dark, a, 0.42, b, 0, 0, Math.PI / 2); part(van, Cy(0.2, 0.2, 0.32, 8), chrome, a, 0.42, b, 0, 0, Math.PI / 2); }
  for (const sx of [-1, 1]) part(van, B(0.05, 0.5, 1.2), dark, sx * 1.12, 0.65, 0.05);
  part(van, B(2.0, 0.1, 3.0), dark, 0, 2.55, -0.6); for (const z of [-1.6, 0.4]) part(van, B(2.1, 0.06, 0.06), chrome, 0, 2.62, z); part(van, B(1.2, 0.5, 0.8), toonNS('#5d636c', 'panel'), 0, 2.85, -0.9);
  { const lg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.55), new THREE.MeshBasicMaterial({ map: bubSignTex("RIZZO'S · TVs · RADIOS · NO REFUNDS", '#1a1426', '#ffd36a', 2.6, 0.55) })); lg.position.set(1.13, 2.25, -0.6); lg.rotation.y = Math.PI / 2; van.add(lg); const l2 = lg.clone(); l2.position.x = -1.13; l2.rotation.y = -Math.PI / 2; van.add(l2); }
  for (let i = 0; i < 6; i++) { const tv = bubTV(0.75, 0.48); tv.position.set(1.16, 0.95 + (i % 2) * 0.65, -1.7 + Math.floor(i / 2) * 0.95); tv.rotation.y = Math.PI / 2; van.add(tv); }
  part(van, B(0.1, 1.5, 3.0), dark, 1.13, 1.3, -0.75); part(van, B(0.9, 0.06, 3.0), toonNS('#5a3a2a', 'wood'), 1.55, 0.6, -0.75); for (const z of [-2.1, 0.6]) part(van, B(0.06, 0.6, 0.06), dark, 1.95, 0.3, z);
  van.position.set(X + 13, 0, Z + 4.6); van.rotation.y = Math.PI / 2; levelGroup.add(van); box(X + 13, Z + 4.6, 2.4, 1.2);
  // the people of the strip
  bubNpc(X - 2, Z + 2.3, Math.PI, ['#2b2a2c', '#1e1a18', '#c58a64', '#111'], '💊 Dregs (dealer)', () => openSubShop('Low Tide dealer', 'Dregs', BUB_STREET));
  bubNpc(X + 11, Z + 2.4, Math.PI, ['#6a3a8a', '#2c2a38', '#8a5a3a', '#1e1a18'], '📺 Talk to Rizzo', bubRizzo);
  bubNeon('THE LOW TIDE', '#ff3bd2', X + D.r - 2.5, 5.2, Z, -Math.PI / 2, 4);
  bcLamp(X - 2, Z + 3.2, '#ff6ad2'); bcLamp(X + 8, Z - 3.2, '#4fffe0');
  bcWalkers(D, 6, 'civ', 40); }
function bcBurbs() { const D = bcD('burbs'), X = D.x, Z = D.z;
  // a cul-de-sac: a loop road round a green island with a tree, houses all round facing in, picket fences and mailboxes
  const road = new THREE.Mesh(new THREE.RingGeometry(8, 13, 40).rotateX(-Math.PI / 2), toonNS('#5a5a62')); road.position.set(X, 0.1, Z); levelGroup.add(road);
  const kerb = new THREE.Mesh(new THREE.RingGeometry(13, 13.4, 40).rotateX(-Math.PI / 2), toonNS('#d8d0c0')); kerb.position.set(X, 0.11, Z); levelGroup.add(kerb);
  bcKelpTree(X, Z, 1.6); for (let i = 0; i < 6; i++) bcCoral(X + Math.cos(i) * 4.5, Z + Math.sin(i) * 4.5, 0.8, i);
  const cols = [['#ffd0a0', '#8a3a2e'], ['#c8e0ff', '#3a5266'], ['#b8ffcf', '#3f7a3a'], ['#ffb8d8', '#8a3a5a'], ['#fff0a0', '#8a6a2a'], ['#d8c8ff', '#4a3a7a'], ['#f4f0e8', '#5d636c']];
  BC.burbs = [];
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + Math.PI / 4 + i * (Math.PI * 2 - Math.PI / 2) / 6.5, r = 22, x = X + Math.cos(a) * r, z = Z + Math.sin(a) * r, ry = Math.atan2(X - x, Z - z);
    const h = bcHouse(x, z, ry, cols[i], { w: 6.5, d: 5.5, h: 3.4, dark: i === 3 }); BC.burbs.push(h.door);
    const tx = Math.sin(ry), tz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
    for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) part(levelGroup, B(0.08, 0.8, 0.08), toonNS('#f4f0e8'), x + tx * 5.2 + rx * s * (1.8 + k * 0.45), 0.4, z + tz * 5.2 + rz * s * (1.8 + k * 0.45));
      part(levelGroup, B(0.06, 0.08, 2.5), toonNS('#f4f0e8'), x + tx * 5.2 + rx * s * 2.9, 0.65, z + tz * 5.2 + rz * s * 2.9, 0, ry + Math.PI / 2, 0); }
    const mb = new THREE.Group(); part(mb, Cy(0.04, 0.04, 1, 4), toonNS('#5d636c'), 0, 0.5, 0); part(mb, B(0.25, 0.25, 0.45), toonNS(cols[i][1]), 0, 1.1, 0); part(mb, B(0.03, 0.18, 0.08), toonNS('#c8402f'), 0.14, 1.25, 0.1);
    mb.position.set(x + tx * 5.6 + rx * 1.4, 0, z + tz * 5.6 + rz * 1.4); mb.rotation.y = ry; levelGroup.add(mb);
    part(levelGroup, B(1.6, 0.03, 3.4), toonNS('#d8d0c0'), x + tx * 4.4, 0.06, z + tz * 4.4, 0, ry, 0);
    if (i % 2) { const car = new THREE.Group(); part(car, B(1.8, 0.8, 3.6), toonNS(['#c8402f', '#3a5266', '#ffd36a'][i % 3]), 0, 0.6, 0); part(car, B(1.6, 0.7, 1.8), new THREE.MeshLambertMaterial({ color: '#8fb8cc' }), 0, 1.3, -0.2);
      for (const [a, b] of [[-0.9, -1.2], [0.9, -1.2], [-0.9, 1.2], [0.9, 1.2]]) part(car, Cy(0.35, 0.35, 0.25, 10), toonNS('#1e1a18'), a, 0.35, b, 0, 0, Math.PI / 2);
      car.position.set(x + tx * 4.6 - rx * 3.6, 0, z + tz * 4.6 - rz * 3.6); car.rotation.y = ry; levelGroup.add(car); box(car.position.x, car.position.z, 1.4, 1.4); } }
  // a playground: swings and a slide on the north-east lawn
  const pg = new THREE.Group(); for (const s of [-1, 1]) part(pg, B(0.12, 2.6, 0.12), toonNS('#c8402f'), s * 1.6, 1.3, 0); part(pg, B(3.4, 0.12, 0.12), toonNS('#c8402f'), 0, 2.6, 0);
  const sw = []; for (const s of [-0.7, 0.7]) { const p = new THREE.Group(); part(p, B(0.03, 1.8, 0.03), toonNS('#5d636c'), 0, -0.9, 0); part(p, B(0.5, 0.06, 0.25), toonNS('#2b2a2c'), 0, -1.8, 0); p.position.set(s, 2.6, 0); pg.add(p); sw.push(p); }
  levelAnims.push(t => sw.forEach((p, i) => { p.rotation.x = Math.sin(t * 1.6 + i) * 0.35; }));
  part(pg, B(0.8, 0.08, 3.2), toonNS('#ffd36a'), 3.4, 1.0, 0, 0.6, 0, 0); part(pg, B(0.8, 2.2, 0.8), toonNS('#4fd2ff'), 3.4, 1.1, -1.6);
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
  for (let r = 0; r < 7; r++) { const z = Z + 2 + r * 2.8; part(levelGroup, B(18, 0.5, 1.4), toonNS('#6a4f34', 'wood'), X - 4, 0.25, z); box(X - 4, z, 9, 0.7);
    for (let k = 0; k < 12; k++) { const h = 1 + ((k + r) % 3) * 0.5, m = new THREE.Mesh(B(0.3, h, 0.3), toonNS(k % 2 ? '#3f7a3a' : '#6fce4a', 'leaves')); m.position.set(X - 12.5 + k * 1.5, 0.5 + h / 2, z); levelGroup.add(m); levelAnims.push(t => { m.rotation.z = Math.sin(t + k + r) * 0.08; }); }
    part(levelGroup, B(18, 0.04, 0.05), glow('#c86aff'), X - 4, 4.4, z); }
  for (let i = 0; i < 4; i++) { part(levelGroup, Cy(0.15, 0.15, 3.4, 6), toonNS('#5d636c'), X - 13 + i * 6, 1.7, Z + 1); }
  // Dome Control: a round tower with a glass top, a spinning radar dish and a beacon
  const T = new THREE.Group(), cx = X + 12, cz = Z - 8; part(T, Cy(5, 5.4, 6, 20), toonNS('#3a3d44', 'panel'), 0, 3, 0); part(T, Cy(5.4, 5, 3, 20, 1, true), new THREE.MeshLambertMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide }), 0, 7.5, 0);
  part(T, Cy(5.6, 5.6, 0.4, 20), toonNS('#4a4f58', 'panel'), 0, 9.2, 0); part(T, Cy(5.5, 5.5, 0.15, 20), glow('#4fd2ff'), 0, 6.05, 0);
  const dish = new THREE.Group(); part(dish, Cy(0.15, 0.15, 2, 6), toonNS('#5d636c'), 0, 1, 0); const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), toonNS('#d8d0c0')); bowl.rotation.x = Math.PI / 2 + 0.4; bowl.position.y = 2; dish.add(bowl); dish.position.y = 9.4; T.add(dish);
  const bea = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), glow('#ff3b2a')); bea.position.set(2.5, 10.2, 0); T.add(bea);
  for (let i = 0; i < 8; i++) { const s = bubTV(1.2, 0.75); const a = i / 8 * Math.PI * 2; s.position.set(Math.cos(a) * 5.45, 7.2, Math.sin(a) * 5.45); s.lookAt(Math.cos(a) * 20, 7.2, Math.sin(a) * 20); T.add(s); }
  part(T, B(2, 2.6, 0.2), toonNS('#2a3040'), 0, 1.3, 5.25); T.position.set(cx, 0, cz); levelGroup.add(T); solid(cx, cz, 5.5);
  levelAnims.push(t => { dish.rotation.y = t * 0.6; bea.visible = Math.sin(t * 4) > 0; });
  bubSign('DOME CONTROL · AUTHORISED FISH ONLY', '#0c1a24', '#7fe8ff', 4.6, 0.6, cx, 3.4, cz + 5.45);
  bubNpc(cx, cz + 7, Math.PI, ['#4fd2ff', '#2c2a38', '#9fe8ff', '#3a2a1a'], '🖥 Talk to Dot (Dome Control)', bubDot);
  // pipes snaking to big pump tanks
  for (const [x, z] of [[X - 16, Z - 10], [X - 10, Z - 15]]) { part(levelGroup, Cy(1.6, 1.6, 4, 14), toonNS('#5d636c', 'panel'), x, 2, z); part(levelGroup, Cy(1.65, 1.65, 0.2, 14), glow('#7fff6a'), x, 2.8, z); solid(x, z, 1.7); }
  part(levelGroup, Cy(0.3, 0.3, 14, 8), toonNS('#8a8f99'), X - 3, 0.35, Z - 12, 0, 0, Math.PI / 2);
  bubSign('KELP GARDENS · PICK ONLY WHAT YOU PAY FOR', '#0c240c', '#b8ffcf', 4.4, 0.6, X - 4, 4.4, Z + 0.4);
  bcWalkers(D, 5, 'mix', 100); }
function bcCoralHeights() { const D = bcD('coral'), X = D.x, Z = D.z;
  // three towers: Coral Heights (the one you can enter) and two neighbours, with lit windows and roof beacons
  const tower = (tx, tz, tw, th, col, enter) => { const g = new THREE.Group();
    part(g, B(tw, th, tw), bcMat('concrete', Math.round(tw / 2), Math.round(th / 2), col), 0, th / 2, 0);
    for (let f = 0; f < Math.floor(th / 3) - 1; f++) for (let k = 0; k < 3; k++) for (let side = 0; side < 4; side++) { const lit = ((f * 7 + k * 3 + side) % 5) > 1, w = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), lit ? new THREE.MeshBasicMaterial({ color: ['#ffe9a0', '#ffd0a0', '#c8e0ff'][(f + k) % 3] }) : toonNS('#2a3040'));
      const a = side * Math.PI / 2, o = (k - 1) * (tw / 3.2); w.position.set(Math.sin(a) * (tw / 2 + 0.03) + Math.cos(a) * o, 3.5 + f * 3, Math.cos(a) * (tw / 2 + 0.03) - Math.sin(a) * o); w.rotation.y = a; g.add(w); }
    for (let f = 1; f < th / 3; f++) part(g, B(tw + 0.3, 0.15, tw + 0.3), toonNS('#d8d0c0'), 0, f * 3, 0);
    part(g, B(tw + 0.6, 0.5, tw + 0.6), toonNS('#5d636c'), 0, th, 0); part(g, Cy(0.1, 0.1, 4, 5), toonNS('#2b2a2c'), tw / 4, th + 2, tw / 4); const bc2 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), glow('#ff3b2a')); bc2.position.set(tw / 4, th + 4, tw / 4); g.add(bc2);
    g.position.set(tx, 0, tz); levelGroup.add(g); box(tx, tz, tw / 2, tw / 2); return g; };
  tower(X - 14, Z + 6, 9, 24, '#7a6f8a'); tower(X + 15, Z + 8, 8, 18, '#8a7a6a');
  const ex = X, ez = Z + 14, ew = 10, main = tower(ex, ez, ew, 26, '#8a7f9a');
  part(main, B(4, 3, 0.2), toonNS('#3a5266'), 0, 1.5, -ew / 2 - 0.05); part(main, B(5.4, 0.3, 2), toonNS('#c9a43a'), 0, 3.3, -ew / 2 - 1); for (const s of [-1, 1]) part(main, Cy(0.1, 0.1, 3.3, 6), toonNS('#c9a43a'), s * 2.5, 1.65, -ew / 2 - 1.9);
  bubSign('CORAL HEIGHTS', '#1a1426', '#ffd0a0', 4, 0.6, ex, 3.9, ez - ew / 2 - 1.05, Math.PI);
  INTERACTS.push({ x: ex, z: ez - ew / 2 - 1.4, r: 2.4, label: '🏢 Enter Coral Heights', fn: () => bubGoFloor(1, true) }); BUB.towerExit = [ex, ez - ew / 2 - 2.4, Math.PI];
  // Reel Deal Tackle: a little shopfront with a giant fish on the roof
  const sx = X + 14, sz = Z - 8, sh = new THREE.Group(); part(sh, B(8, 4, 6), toonNS('#3f7d7a', 'wood'), 0, 2, 0); part(sh, B(8.6, 0.3, 6.6), toonNS('#ffd36a'), 0, 4.15, 0);
  const bf = new THREE.Group(); part(bf, B(1.4, 1.8, 4.5), toonNS('#4fa8cc'), 0, 0, 0); part(bf, B(0.3, 1.8, 1.4), toonNS('#4fa8cc'), 0, 0.2, -2.8); part(bf, new THREE.SphereGeometry(0.2, 6, 4), toonNS('#111'), 0.72, 0.3, 1.6); part(bf, B(0.1, 0.1, 2.5), toonNS('#c9a43a'), 0, 1.4, 2.6, -0.6, 0, 0);
  bf.position.set(0, 5.6, 0); bf.rotation.y = Math.PI / 2; sh.add(bf); levelAnims.push(t => { bf.rotation.z = Math.sin(t) * 0.1; });
  part(sh, B(4, 2.2, 0.1), new THREE.MeshBasicMaterial({ color: '#2a4a5a' }), 0, 1.3, -3.03); const tsg = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.8), new THREE.MeshBasicMaterial({ map: signTex('REEL DEAL TACKLE', '#0c2a3a', '#7fe8ff') })); tsg.position.set(0, 3.2, -3.06); tsg.rotation.y = Math.PI; sh.add(tsg);
  for (let i = 0; i < 4; i++) part(sh, Cy(0.03, 0.05, 2.6, 5), toonNS('#c9a43a'), -3.4 + i * 0.25, 1.3, -3.3, 0.2, 0, 0);
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
  const npcPos = { finn: [-8, 72, 0], nurse: [-12, -6, Math.PI / 2], blub: [0, -9, 0], pearlmkt: [-10, 9, Math.PI * 0.75], barnacle: [84 - 6, -14, Math.PI], kelpa: [-6, -76, Math.PI], pip: [6, 76, 0] };
  for (const n of L.npcs) if (npcPos[n.id]) { const [x, z, f] = npcPos[n.id]; Object.assign(n, { x, z, face: f }); }
  L.build = function () { BC.tubes.length = 0; BC.walk.length = 0; BC.lamps.length = 0;
    levelGroup.add(new THREE.HemisphereLight(0x9fd8ef, 0x4a3a2a, 0.45)); const sunL = new THREE.DirectionalLight(0xbfefff, 0.25); sunL.position.set(30, 80, 20); levelGroup.add(sunL);
    for (const D of BC.domes) bcDome(D);
    bcTube('hub', 'kelp'); bcTube('hub', 'burbs'); bcTube('hub', 'low'); bcTube('hub', 'coral');
    const parts = [bcLife, bcSeabed, bcHub, bcLow, bcBurbs, bcKelp, bcCoralHeights, bubTower, bubFlat, bubFlatDetails, bubHallDetails];
    for (const f of parts) { try { f(); } catch (e) { console.warn('bubble3 ' + f.name, e); } }
    // keep the player inside the glass: if a step would leave every dome and tunnel, undo it
    let ok = new THREE.Vector3(L.spawn.x, 0, L.spawn.z);
    levelAnims.push(() => { if (bcInside(player.pos.x, player.pos.z)) ok.set(player.pos.x, player.pos.y, player.pos.z); else { player.pos.x = ok.x; player.pos.z = ok.z; } });
    // each dome announces itself when you walk in
    let cur = null; levelAnims.push(() => { const d = BC.domes.find(d => Math.hypot(player.pos.x - d.x, player.pos.z - d.z) < d.r - 2); const id = d ? d.id : null; if (id && id !== cur) { cur = id; toast(d.name, { hub: 'Plaza · transit · the way out', kelp: 'Farms · Dome Control', burbs: 'Lawns, fences, a murder', low: 'Neon, deals, bad ideas', coral: 'Apartments · tackle · the coral park' }[id], 1.8); } else if (!id && d === undefined) {} });
  };
}
// coming back up from the city drops you beside the miniature dome; coming down lands you at the hub's exit machine
// the city keeps real time: lamps come on at dusk, the domes go dark and blue at night, and the lamp posts light the paths
function bcNightK() { if (typeof BUB !== 'undefined' && BUB.night) return 1; const d = new Date(), h = d.getHours() + d.getMinutes() / 60; return h >= 20 || h < 5 ? 1 : h >= 18 ? (h - 18) / 2 : h < 7 ? (7 - h) / 2 : 0; }
{ const _u = updateEnv; updateEnv = function () { const r = _u.apply(this, arguments); if (!LEVEL || LEVEL.id !== 'bubblecity') return r;
  const k = bcNightK(), inside = Math.abs(player.pos.x - 150) < 20; if (inside) return r;
  hemi.intensity *= 1 - 0.72 * k; sun.intensity *= 1 - 0.85 * k; fill.intensity *= 1 - 0.6 * k; if (k > 0) { hemi.color.lerp(new THREE.Color('#3a4a8a'), k * 0.6); scene.fog.color.lerp(new THREE.Color('#02060e'), k * 0.8); }
  if (!BC.dl || BC.dlG !== levelGroup.children.length) { BC.dl = []; BC.dlG = levelGroup.children.length; levelGroup.traverse(o => { if (o.isHemisphereLight || o.isDirectionalLight || o.isAmbientLight) BC.dl.push([o, o.userData.bcI ?? (o.userData.bcI = o.intensity)]); }); }
  for (const [o, i0] of BC.dl) o.intensity = i0 * (1 - 0.75 * k);
  for (const l of BC.lamps) { l.pool.material.opacity = 0.05 + 0.3 * k; if (l.pl) l.pl.intensity = 2.2 * k; } return r; }; }
// small bits of life: a backyard BBQ with smoke, a dog trotting round the Burbs loop, a busker's open guitar case in the plaza
function bcLife() { const Bd = bcD('burbs'), H = bcD('hub');
  const gx = Bd.x - 6, gz = Bd.z + 18, gr = new THREE.Group(); part(gr, Cy(0.5, 0.35, 0.5, 12), toonNS('#2b2a2c'), 0, 0.95, 0); part(gr, Cy(0.52, 0.52, 0.04, 12), toonNS('#5d636c'), 0, 1.2, 0); for (let k = 0; k < 3; k++) part(gr, Cy(0.03, 0.03, 0.95, 4), toonNS('#2b2a2c'), Math.cos(k * 2.1) * 0.3, 0.47, Math.sin(k * 2.1) * 0.3);
  for (let k = 0; k < 3; k++) part(gr, Cy(0.06, 0.06, 0.3, 6), toonNS('#8a3a2a'), -0.2 + k * 0.2, 1.25, 0, 0, 0, Math.PI / 2); gr.position.set(gx, 0, gz); levelGroup.add(gr); solid(gx, gz, 0.6);
  const sm = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 4), new THREE.MeshBasicMaterial({ color: '#d8d8d8', transparent: true, opacity: 0.3, depthWrite: false })); levelGroup.add(m); sm.push(m); }
  levelAnims.push(t => sm.forEach((m, i) => { const k = (t * 0.4 + i / 6) % 1; m.position.set(gx + Math.sin(t + i) * 0.2, 1.4 + k * 3, gz); m.scale.setScalar(0.6 + k * 2); m.material.opacity = 0.35 * (1 - k); }));
  const dog = new THREE.Group(), fur = toonNS('#a8743a'); part(dog, B(0.3, 0.3, 0.7), fur, 0, 0.45, 0); part(dog, B(0.25, 0.25, 0.3), fur, 0, 0.65, 0.42); part(dog, B(0.1, 0.1, 0.15), toonNS('#2b2a2c'), 0, 0.62, 0.6); part(dog, B(0.05, 0.2, 0.05), fur, 0, 0.65, -0.4, -0.6, 0, 0);
  const legs = []; for (const [a, b] of [[-0.1, 0.25], [0.1, 0.25], [-0.1, -0.25], [0.1, -0.25]]) { const l = new THREE.Group(); part(l, B(0.07, 0.3, 0.07), fur, 0, -0.15, 0); l.position.set(a, 0.3, b); dog.add(l); legs.push(l); }
  levelGroup.add(dog); levelAnims.push(t => { const a = t * 0.18, r = 10.5; dog.position.set(Bd.x + Math.cos(a) * r, 0, Bd.z + Math.sin(a) * r); dog.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a)); legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 12 + (i % 3 ? 0 : Math.PI)) * 0.6; }); });
  const cs = new THREE.Group(); part(cs, B(1.1, 0.12, 0.45), toonNS('#2b2a2c'), 0, 0.1, 0); part(cs, B(1.0, 0.04, 0.38), toonNS('#8a2a4a'), 0, 0.17, 0); for (let k = 0; k < 5; k++) part(cs, Cy(0.05, 0.05, 0.02, 8), toonNS('#c9a43a'), -0.3 + k * 0.14, 0.2, (k % 2) * 0.1 - 0.05);
  cs.position.set(H.x - 8, 0, H.z + 15); levelGroup.add(cs); }
