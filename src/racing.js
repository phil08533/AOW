// =================== VELOCITY: the racing planet ===================
function makeHoverCar(col, style) {
  if (style && style !== 'wedge') return makeCarStyle(col, style);
  const g = new THREE.Group(), c = col || '#ff3b2a', dk = '#2b2a2c';
  part(g, B(1.4, 0.35, 2.8), c, 0, 0.55, 0); part(g, B(1.1, 0.3, 1.0), dk, 0, 0.82, -0.1); part(g, B(1.0, 0.26, 0.9), glow('#8fd0ff'), 0, 0.84, 0.25, -0.35);
  part(g, B(1.6, 0.08, 0.5), c, 0, 0.5, 1.35); for (const s of [-1, 1]) { part(g, B(0.1, 0.5, 0.7), c, 0.6 * s, 0.85, -1.1, 0, 0, 0.2 * s); part(g, Cy(0.18, 0.18, 0.5, 8), dk, 0.55 * s, 0.5, -1.35, Math.PI / 2); part(g, Cy(0.14, 0.14, 0.06, 8), glow('#ff9a3c'), 0.55 * s, 0.5, -1.62, Math.PI / 2); }
  part(g, B(1.2, 0.04, 2.4), glow(c), 0, 0.34, 0);
  return g;
}
function makeCarStyle(col, style) {
  const g = new THREE.Group(), c = col || '#ff3b2a', dk = '#2b2a2c', gl = glow('#8fd0ff');
  if (style === 'muscle') { part(g, B(1.9, 0.5, 3.0), c, 0, 0.6, 0); part(g, B(1.5, 0.4, 1.2), dk, 0, 0.98, -0.3); part(g, B(1.3, 0.3, 0.9), gl, 0, 1.0, 0.35, -0.4); part(g, B(0.8, 0.25, 0.8), dk, 0, 0.95, 1.0); for (let k = 0; k < 3; k++) part(g, Cy(0.08, 0.08, 0.3, 6), '#9aa1aa', -0.3 + k * 0.3, 1.18, 1.0);
    for (const s of [-1, 1]) { part(g, Cy(0.32, 0.32, 0.7, 10), dk, 0.75 * s, 0.5, -1.3, Math.PI / 2); part(g, Cy(0.26, 0.26, 0.06, 10), glow('#ff6a1a'), 0.75 * s, 0.5, -1.66, Math.PI / 2); part(g, B(0.22, 0.12, 2.6), dk, 0.98 * s, 0.4, 0); } part(g, B(2.0, 0.08, 0.5), c, 0, 1.2, -1.45); }
  if (style === 'jet') { part(g, B(0.8, 0.35, 3.6), c, 0, 0.55, 0); part(g, new THREE.ConeGeometry(0.42, 1.4, 6), c, 0, 0.55, 2.4, Math.PI / 2); part(g, B(0.6, 0.3, 1.0), gl, 0, 0.82, 0.4, -0.25);
    for (const s of [-1, 1]) { part(g, B(1.6, 0.06, 1.2), c, 0.9 * s, 0.5, -0.6, 0, 0.3 * s, 0); part(g, B(0.08, 0.7, 0.8), dk, 1.6 * s, 0.75, -0.9); } part(g, Cy(0.3, 0.38, 0.9, 10), dk, 0, 0.55, -2.1, Math.PI / 2); part(g, Cy(0.28, 0.28, 0.05, 10), glow('#4fd2ff'), 0, 0.55, -2.56, Math.PI / 2); }
  if (style === 'phantom') { part(g, B(1.5, 0.3, 3.2), '#1e1c22', 0, 0.55, 0); part(g, B(1.2, 0.25, 1.4), '#2b2a2c', 0, 0.78, -0.1); part(g, B(1.0, 0.2, 1.0), glow('#c86aff'), 0, 0.84, 0.45, -0.3); for (const s of [-1, 1]) { part(g, B(0.04, 0.04, 3.0), glow('#c86aff'), 0.76 * s, 0.6, 0); part(g, B(0.8, 0.05, 1.4), '#1e1c22', 1.0 * s, 0.5, -0.8, 0, 0.4 * s, -0.2 * s); } part(g, B(1.3, 0.04, 2.8), glow('#c86aff'), 0, 0.35, 0); }
  if (style === 'buggy') { for (const s of [-1, 1]) for (const z of [-1, 1]) { part(g, new THREE.TorusGeometry(0.36, 0.1, 6, 12), dk, 0.9 * s, 0.45, z * 1.0, 0, Math.PI / 2, 0); part(g, Cy(0.2, 0.2, 0.04, 8), glow(c), 0.9 * s, 0.45, z * 1.0, 0, 0, Math.PI / 2); } part(g, B(1.2, 0.2, 2.2), c, 0, 0.6, 0); for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 1.0, 5), '#9aa1aa', 0.5 * s, 1.1, -0.2, 0.3, 0, 0); part(g, B(1.1, 0.06, 0.9), '#9aa1aa', 0, 1.55, -0.1); part(g, B(0.5, 0.4, 0.5), dk, 0, 0.9, -0.2); }
  if (style === 'hauler') { part(g, B(1.8, 1.0, 3.2), c, 0, 0.8, 0); part(g, B(1.7, 0.5, 0.9), gl, 0, 1.15, 1.2); part(g, B(1.9, 0.15, 3.3), dk, 0, 0.3, 0); for (const s of [-1, 1]) part(g, Cy(0.2, 0.2, 1.0, 6), '#9aa1aa', 0.7 * s, 1.5, -1.2); part(g, B(1.8, 0.1, 0.1), glow('#ffd36a'), 0, 0.6, 1.62); }
  if (style === 'manta') { part(g, B(2.6, 0.18, 2.4), c, 0, 0.5, 0, 0, 0, 0); for (const s of [-1, 1]) part(g, B(1.0, 0.12, 1.4), c, 1.6 * s, 0.45, -0.3, 0, 0.5 * s, 0.1 * s); part(g, new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), gl, 0, 0.58, 0.3); part(g, B(2.4, 0.04, 2.2), glow(c), 0, 0.38, 0); }
  if (style === 'bubble') { part(g, new THREE.SphereGeometry(0.9, 12, 8), c, 0, 0.8, 0); part(g, new THREE.SphereGeometry(0.62, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), gl, 0, 1.15, 0.3); part(g, new THREE.TorusGeometry(1.0, 0.1, 6, 18), dk, 0, 0.55, 0, Math.PI / 2); part(g, Cy(0.25, 0.25, 0.06, 10), glow('#ffd36a'), 0, 0.8, -0.9, Math.PI / 2); }
  return g;
}
const CAR_STYLES = ['wedge', 'muscle', 'jet', 'buggy', 'hauler', 'manta', 'bubble'];
const RTRACKS = {
  canyon: { name: 'Canyon Sprint', ai: [25,26,27,28], pay: 1, pts: [[0,20],[-60,40],[-130,10],[-200,-40],[-265,0],[-290,90],[-250,170],[-170,230],[-80,270],[0,300]] },
  spiral: { name: 'Mesa Run', ai: [29,30,31,32], pay: 1.6, pts: [[0,20],[60,40],[130,0],[200,-60],[270,-40],[290,50],[255,130],[275,200],[215,265],[130,290],[60,250]] },
  dune: { name: 'Dune Dash', ai: [32,33,34,36], pay: 2.4, pts: [[0,20],[10,80],[-40,140],[-20,210],[50,240],[110,190],[180,170],[230,230],[160,300],[60,320],[-40,320],[-130,300]] } };
const RCARS = { mk1: { name: 'Wedge Mk I', style: 'wedge', top: 27, acc: 16, price: 0 }, buggy: { name: 'Dune Buggy', style: 'buggy', top: 29, acc: 20, price: 3000 }, mk2: { name: 'Muscle Mk II', style: 'muscle', top: 32, acc: 19, price: 6000 }, manta: { name: 'Manta Glider', style: 'manta', top: 34, acc: 21, price: 10000 }, mk3: { name: 'Needle Jet Mk III', style: 'jet', top: 37, acc: 23, price: 18000 }, hauler: { name: 'Big Hauler', style: 'hauler', top: 30, acc: 15, price: 4000 }, bubble: { name: 'Bubble Pod', style: 'bubble', top: 31, acc: 22, price: 5000 }, phantom: { name: 'The Phantom', style: 'phantom', top: 41, acc: 26, price: 0, prize: true } };
const RPAINTS = ['#ff3b2a', '#4fa8ff', '#ffd36a', '#6fdc5a', '#c86aff', '#ff6aa8', '#f4f8ff', '#1e1c22'];
const RNAMES = ['Zippy Zarr', 'Turbo Tess', 'Nitro Gnorb', 'Captain Skid', 'Lady Drift', 'Vroomba', 'Slick Rick-7', 'Mad Maxwell'];
const rs = () => { S.racing = S.racing || { owned: ['mk1'], car: 'mk1', paint: 0, best: {}, wins: {} }; return S.racing; };
let RC = { on: false };
function trackLen(T) { let L = 0; T.seg = []; for (let i = 0; i < T.pts.length - 1; i++) { const a = T.pts[i], b = T.pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); T.seg.push([a, b, l, L]); L += l; } T.len = L; T.gates = []; for (let g = 80; g < L - 30; g += 80) T.gates.push(g); T.gates.push(L); T.ramps = [0.14, 0.3, 0.46, 0.62, 0.78, 0.92].map(f => f * L); T.rampP = T.ramps.map(r => { const [x, z, a] = trackAt(T, r); return [x, z, Math.sin(a), Math.cos(a)]; }); }
function trackAt(T, s) { s = clamp(s, 0, T.len - 0.01); for (const [a, b, l, L0] of T.seg) if (s <= L0 + l) { const k = (s - L0) / l; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[0] - a[0], b[1] - a[1])]; } return [T.pts[0][0], T.pts[0][1], 0]; }
LEVELS.speedway = {
  id: 'speedway', name: 'Velocity', tag: 'The racing planet', lvls: 'All levels · races', size: 720, center: [0, 34], radius: 320,
  carve: (x, z, h) => { h = rampCarve(x, z, h); const r = Math.hypot(x, z - 34); if (r < 100) return h; let k = 0; const a = Math.atan2(z - 34, x); const ring = 135 + Math.sin(a * 3) * 14, d = Math.abs(r - ring); if (d < 12) k = (1 - d / 12); h = h + (r > 100 ? 4 + 3 * Math.sin(x * 0.05) * Math.cos(z * 0.06) + 2.4 * Math.sin(x * 0.11 + z * 0.07) : 0) * smooth(r, 100, 112); h -= k * k * 9; const dn = Math.sin(x * 0.09) * Math.cos(z * 0.08) * 2.2 * smooth(r, 150, 160); const ring2 = 245 + Math.sin(a * 4 + 1) * 20, d2 = Math.abs(r - ring2), k2 = d2 < 14 ? 1 - d2 / 14 : 0; return h + dn - k2 * k2 * 8 + 2 * smooth(r, 200, 260) * Math.sin(x * 0.03 + z * 0.02); }, water: -99, sky: 'mezar', weather: 'none', hourOffset: 7,
  terrain: { a1: 1.4, f1: 0.035, a2: 0.6, f2: 0.08, a3: 0.2, f3: 0.2, base: 0.8, min: 0.1, edge: 30, step: 3, noTerrace: true },
  palette: { grass: '#c87a4a', patch: '#a85a3a', dirt: '#2b2a2c', sand: '#e0a070', wet: '#5a3a2a', rockA: '#8a4a3a', rockB: '#6a3a2a' },
  zones: [{ id: 'pits', name: 'Pit Row', lvl: 'Safe · garages', x: 0, z: -14, r: 14, fr: 15, col: '#3a3d44', safe: true, h: 0.6 },
    { id: 'badlands', name: 'The Badlands', lvl: 'Free drive · canyons and jumps', x: 0, z: 34, r: 330, fr: 1, col: '#c87a4a', h: 0 }],
  paths: [], river: [], pools: [], lava: [], safes: [{ x: 0, z: -14, r: 13 }], spawn: { x: 0, z: -10, yaw: Math.PI }, pad: { x: 10, z: -24 }, menu: { x: 0, z: 40, r: 60, h: 24 }, npcBase: [0, -14],
  npcs: [
    { id: 'vroom', name: 'Race Marshal Vroom', role: 'Starts races', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#ffd36a', '#5d636c': '#2b2a2c' }), x: 0, z: 8, face: Math.PI, racemaster: true, idle: ["Three tracks. Fast cars. Bad decisions. Welcome to Velocity!", "Rule one: go fast. There is no rule two. Rule two was 'don't crash.' Nobody followed it."] },
    { id: 'gus', name: 'Garage Gus', role: 'Cars and paint', rig: 'civ', make: () => makeCivilian('#3a3d44', '#2c2a28', '#c58a64', '#1e1a18', '#ff9a3c'), x: 7, z: 4, face: -1.2, garage: true, idle: ["I can make it faster. I can't make it safer. Pick one. Actually you can't pick safer."] },
    { id: 'pita', name: 'Pit Crew Pita', role: 'Repairs · heals', rig: 'civ', make: () => makeCivilian('#ff6aa8', '#2c2a28', '#e0b892', '#ffd36a'), x: -7, z: 4, face: 1.2, heal: true, idle: ["Patched your car AND your face. Two-for-one Tuesday."] }
  ],
  spawns: [],
  build() {
    for (const k in RTRACKS) trackLen(RTRACKS[k]);
    // sprint routes: one continuous road ribbon per course, gates every 60 m, and ramps
    const cols = { canyon: '#ff9a3c', spiral: '#4fd2ff', dune: '#c86aff' };
    for (const [k, T] of Object.entries(RTRACKS)) {
      const posA = [], uvA = [], idx = [], edge = []; let n = 0;
      for (let s2 = 0; s2 <= T.len; s2 += 2) { const [x, z, a] = trackAt(T, s2), cx = Math.cos(a), cz = -Math.sin(a);
        for (const sd of [-1, 1]) { const px = x + cx * 6 * sd, pz = z + cz * 6 * sd; posA.push(px, groundH(px, pz) + 0.12, pz); uvA.push(sd > 0 ? 1 : 0, s2 / 6); }
        if (n) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n); n++;
        if (Math.floor(s2 / 2) % 4 === 0) for (const sd of [-1, 1]) { const px = x + cx * 6.3 * sd, pz = z + cz * 6.3 * sd; part(props, B(0.25, 0.3, 1.2), glow(cols[k]), px, groundH(px, pz) + 0.25, pz, 0, a, 0); } }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(posA, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvA, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      const road = new THREE.Mesh(geo, psx(new THREE.MeshLambertMaterial({ map: TEX.panel, color: new THREE.Color(k === 'canyon' ? '#3a3d44' : k === 'spiral' ? '#2e3a48' : '#3a2e48').convertSRGBToLinear() }))); levelGroup.add(road);
      T.gates.forEach((gs, gi) => { const [x, z, a] = trackAt(T, gs), last = gi === T.gates.length - 1, gate = new THREE.Group(); const c2 = last ? '#ffd36a' : cols[k];
        for (const sd of [-1, 1]) part(gate, B(0.5, 5, 0.5), '#2b2a2c', 6.5 * sd, 2.5, 0); part(gate, B(13.5, 0.6, 0.5), glow(c2), 0, 5, 0);
        if (last) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.2), new THREE.MeshBasicMaterial({ map: signTex('FINISH · ' + T.name.toUpperCase(), '#1e1c22', '#ffd36a'), side: THREE.DoubleSide })); sg.position.set(0, 6, 0); gate.add(sg); }
        gate.position.set(x, groundH(x, z), z); gate.rotation.y = a; levelGroup.add(gate); });
      T.ramps.forEach(rs2 => { const [x, z, a] = trackAt(T, rs2); for (const sd of [-1, 1]) part(props, new THREE.ConeGeometry(0.4, 1.2, 4), glow('#ffd36a'), x + Math.cos(a) * 6.6 * sd, groundH(x, z) + 3.2, z - Math.sin(a) * 6.6 * sd); });
    }
    // canyon walls along every sprint, with gaps where routes cross and every 200 m so free-drivers can get in and out
    // start/finish gantry + pit garages
    const gan = new THREE.Group(); for (const s of [-1, 1]) part(gan, B(0.6, 6, 0.6), '#2b2a2c', 6.5 * s, 3, 0); part(gan, B(14, 1, 0.6), '#2b2a2c', 0, 6, 0);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.9), new THREE.MeshBasicMaterial({ map: signTex('START · FINISH', '#1e1c22', '#ffd36a'), side: THREE.DoubleSide })); sg.position.set(0, 6, 0.32); gan.add(sg); at(gan, 0, 20, 0); solid(-6.5, 20, 0.5); solid(6.5, 20, 0.5);
    for (let i = 0; i < 5; i++) { const x = -16 + i * 8, gr = makeCityBlock(6, 4, 5, '#3a3d44', i % 2 ? '#ff9a3c' : '#4fd2ff'); at(gr, x, -26); box(x, -26, 3.1, 2.6); }
    for (let i = 0; i < 4; i++) { const c = makeHoverCar(RPAINTS[i + 1], CAR_STYLES[i + 1]); at(c, -12 + i * 8, -20, 0.3, 0.2); box(-12 + i * 8, -20, 0.8, 1.5); }
    dropshipPad(10, -24, 0, 'Return to your ship');
    // mesas and grandstands
    const nearRoute = (x, z) => Object.values(RTRACKS).some(T => { for (let q = 0; q < T.len; q += 4) { const [rx, rz] = trackAt(T, q); if (Math.hypot(rx - x, rz - z) < 16) return true; } return false; });
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, x = Math.cos(a) * 95, z = 34 + Math.sin(a) * 95; if (nearRoute(x, z)) continue; const g = new THREE.Group(); for (let k = 0; k < 3; k++) part(g, new THREE.CylinderGeometry(5 - k, 6 - k, 4, 7), toon(k % 2 ? '#a85a3a' : '#8a4a3a', 'stone'), 0, 2 + k * 4, 0); at(g, x, z, a); solid(x, z, 6); }
    for (const s of [-1, 1]) { const gs = new THREE.Group(); for (let k = 0; k < 4; k++) part(gs, B(16, 0.8, 2), '#5d636c', 0, 0.4 + k * 0.8, -k * 2); at(gs, 20 * s, 10, s > 0 ? -0.3 : 0.3); box(20 * s, 7, 8, 4); }
    levelAnims.push(t => raceTick(t));
  }
};
SPACE_BODIES.speedway = { pos: V(760, 180, 520).multiplyScalar(SPACE_SPREAD), r: 140, col: '#ff6a1a', ring: true };
PLANET_LOOK.speedway = { seed: 47, ramp: [[0, '#5a2a1e'], [0.5, '#c87a4a'], [0.7, '#e0a070'], [0.85, '#ffd36a']], grid: '#4fd2ff' };
PLANET_ORDER.splice(PLANET_ORDER.indexOf('arena'), 0, 'speedway');
// the race itself
const vmCar = new THREE.Group(); camera.add(vmCar); vmCar.visible = false;
{ part(vmCar, B(1.4, 0.18, 0.5), '#2b2a2c', 0, -0.42, -0.7); part(vmCar, new THREE.TorusGeometry(0.16, 0.02, 5, 14), '#3a3d44', 0, -0.26, -0.55, 0.4); part(vmCar, B(0.3, 0.06, 0.04), glow('#ffd36a'), -0.4, -0.33, -0.48); part(vmCar, B(0.3, 0.06, 0.04), glow('#4fd2ff'), 0.4, -0.33, -0.48); vmCar.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); }
function startRace2(tid) {
  const T = RTRACKS[tid], R = rs(); if (!T.len) trackLen(T);
  const [x, z, a] = trackAt(T, 0);
  RC = { on: true, tid, T, v: 0, vy: 0, gate: 0, t0: 0, count: 3.5, done: false, ai: [] };
  player.pos.set(x, groundH(x, z), z); player.yaw = a + Math.PI; player.pitch = -0.08;
  const names = RNAMES.slice().sort(() => Math.random() - 0.5);
  [].forEach((sp, i) => { const obj = makeHoverCar(RPAINTS[(i + 2) % RPAINTS.length], CAR_STYLES[(i * 3 + 1 + Object.keys(RTRACKS).indexOf(tid)) % CAR_STYLES.length]); mergeChar(obj); levelGroup.add(obj); const plate = labelSprite(512, 72); plate.scale.set(3, 0.42, 1); plate.position.y = 2.2; obj.add(plate); drawPlate(plate, names[i], null, '#ffd36a', null);
    RC.ai.push({ obj, name: names[i], top: sp * (0.95 + Math.random() * 0.1), s: 1.5 + (i >> 1) * 4, lane: [-3.5, 3.5, -1.8, 1.8][i], fin: 0 }); });
  closeDlg(); SFX.horn(); toast(T.name.toUpperCase(), `Sprint · ${Math.round(T.len)} m · ${T.gates.length} gates · watch for jumps`, 2.5);
}
function raceProgress(s, T) { return s / T.len; }
function playerProg() { const T = RC.T; let best = 0, bd = 1e9; for (let s = Math.max(0, (RC.lastS || 0) - 40); s < Math.min(T.len, (RC.lastS || 0) + 80); s += 2) { const [x, z] = trackAt(T, s), d = (x - player.pos.x) ** 2 + (z - player.pos.z) ** 2; if (d < bd) { bd = d; best = s; } } RC.lastS = best; return { s: best, off: Math.sqrt(bd) }; }
function raceDrive(dt) {
  const R = rs(), car = RCARS[R.car] || RCARS.mk1, T = RC.T;
  if (RC.free) return freeDrive(dt, car);
  if (RC.count > 0) { const c0 = Math.ceil(RC.count); RC.count -= dt; const c1 = Math.ceil(RC.count); if (c1 !== c0) { toast(c1 > 0 ? String(c1) : 'GO!', T.name, 0.8); if (c1 > 0) SFX.ui(); else SFX.horn(); } if (RC.count <= 0) RC.t0 = gameTime; return; }
  const th = (keys.KeyW ? 1 : 0) + Math.max(0, move.y), br = (keys.KeyS ? 1 : 0) + Math.max(0, -move.y), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x;
  const pp = playerProg(), offTrack = pp.off > 7.5;
  carPhysics(dt, car, 1);
  // gates in order; the last one is the finish
  const gs = T.gates[RC.gate], [gx, gz] = trackAt(T, gs); if (Math.hypot(player.pos.x - gx, player.pos.z - gz) < 14) { RC.gate++; SFX.coin(); if (RC.gate >= T.gates.length) return finishRace2(); toast(`GATE ${RC.gate}/${T.gates.length}`, '', 0.8); }
  // AI cars ride the racing line with a little rubber band
  const me = pp.s;
  for (const A of RC.ai) { if (A.fin) continue; const gap = A.s - me, band = gap > 30 ? 0.9 : gap < -30 ? 1.12 : 1; A.s += A.top * band * dt * (0.97 + Math.sin(gameTime * 0.7 + A.lane) * 0.03); if (A.s >= T.len) { A.s = T.len; A.fin = gameTime; }
    const [x, z, a] = trackAt(T, A.s); A.obj.position.set(x + Math.cos(a) * A.lane, groundH(x, z) + 0.25 + Math.sin(gameTime * 6 + A.lane) * 0.05, z - Math.sin(a) * A.lane); A.obj.rotation.y = a; }
  $('zoneN').textContent = `${T.name} · time trial`; if (!RC.beacon) { RC.beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 40, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd36a', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); levelGroup.add(RC.beacon); } { const g2 = T.gates[Math.min(RC.gate, T.gates.length - 1)], [bx, bz] = trackAt(T, g2); RC.beacon.position.set(bx, groundH(bx, bz) + 20, bz); } $('zoneL').textContent = `Gate ${RC.gate + 1}/${T.gates.length} · ${Math.max(0, Math.round(T.len - me))} m to go · ${(gameTime - RC.t0).toFixed(1)}s · ${Math.round(Math.abs(RC.v) * 3.6)} km/h${offTrack ? ' · OFF TRACK' : ''}`; $('zone').style.opacity = 1; zoneT = 1;
}
function finishRace2() {
  const T = RC.T, R = rs(), el = gameTime - RC.t0, par = T.len / 30, medal = el <= par ? 0 : el <= par * 1.25 ? 1 : el <= par * 1.6 ? 2 : 3;
  RC.on = false; RC.ai = []; if (RC.beacon) levelGroup.remove(RC.beacon); SFX.engine(0, 0);
  const pay = Math.round([1600, 900, 500, 150][medal] * T.pay), best = R.best[RC.tid];
  S.cr += pay; gainXp(Math.round([600, 420, 300, 120][medal] * T.pay));
  if (!best || el < best) R.best[RC.tid] = +el.toFixed(2); if (medal === 0) { R.wins[RC.tid] = (R.wins[RC.tid] || 0) + 1; questProgressKill('racewin_' + RC.tid); }
  toast(['🥇 GOLD!', '🥈 SILVER', '🥉 BRONZE', 'FINISHED'][medal], `${el.toFixed(1)}s (gold under ${par.toFixed(0)}s) · +${pay} cr${!best || el < best ? ' · NEW BEST' : ''}`, 5); medal === 0 ? (SFX.level(), SFX.cheer()) : SFX.quest();
  log(`${T.name}: ${el.toFixed(1)}s, ${['gold', 'silver', 'bronze', 'no'][medal]} medal (+${pay} cr).`, 'loot');
  const allWon = Object.keys(RTRACKS).every(k => (R.wins[k] || 0) > 0); if (allWon && !R.owned.includes('phantom')) { R.owned.push('phantom'); S.flags = S.flags || {}; S.flags.racerCape = true; toast('GRAND CHAMPION', 'Gold on every course: The Phantom car + Checkered Cape!', 6); }
  checkReady(); markDirty();
}
function carPhysics(dt, car, offMul) {
  const th = (keys.KeyW ? 1 : 0) + Math.max(0, move.y), br = (keys.KeyS ? 1 : 0) + Math.max(0, -move.y), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x;
  const air = player.pos.y > groundH(player.pos.x, player.pos.z) + 0.15;
  if (!air) { RC.v += (th * car.acc - br * 30 - (th ? 0 : 6)) * dt; RC.v = clamp(RC.v, -8, car.top * offMul * ((keys.ShiftLeft || keys.ShiftRight) ? 1.15 : 1)); }
  player.yaw -= st * dt * (air ? 0.6 : 1.4 + Math.min(1, Math.abs(RC.v) / 20) * 0.6);
  const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), h0 = groundH(player.pos.x, player.pos.z);
  player.pos.addScaledVector(f, RC.v * dt); collide(player.pos, 0.9, false);
  const h1 = groundH(player.pos.x, player.pos.z);
  RC.vy = (RC.vy || 0) - 22 * dt; player.pos.y += RC.vy * dt;
  if (player.pos.y <= h1) { if (air && RC.vy < -9) { SFX.land(); burst(player.pos.clone(), '#e0a070', 10, 4); } player.pos.y = h1; RC.vy = Math.max(0, (h1 - h0) / Math.max(dt, 1e-3)) * 0.85; }
  else if (!air && h1 < player.pos.y - 0.1) { /* crested a hill: keep momentum, we are airborne */ }
  player.onGround = !air; player.vy = 0;
  SFX.engine(0.3 + Math.abs(RC.v) / car.top * 0.7, Math.abs(RC.v) / 30);
  return { air };
}
function freeDrive(dt, car) {
  const { air } = carPhysics(dt, car, 1);
  $('zoneN').textContent = 'FREE DRIVE'; $('zoneL').textContent = `${Math.round(Math.abs(RC.v) * 3.6)} km/h${air ? ' · AIRTIME!' : ''} · X to park`; $('zone').style.opacity = 1; zoneT = 1;
  if (air) { RC.airT = (RC.airT || 0) + dt; } else if (RC.airT) { if (RC.airT > 1.2) { const cr = Math.round(RC.airT * 25); S.cr += cr; log(`Sick jump! ${RC.airT.toFixed(1)}s airtime (+${cr} cr)`, 'loot'); SFX.coin(); } RC.airT = 0; }
}
function toggleFreeDrive() {
  if (LEVEL.id !== 'speedway' || state !== 'play' || dlgOpen) return false;
  if (RC.on && !RC.free) return true;
  if (RC.free) { if (Math.abs(RC.v) > 6) { log('Slow down to park.'); return true; } RC = { on: false }; S.riding = false; log('Parked. Press X to drive again.'); SFX.door(); return true; }
  RC = { on: true, free: true, v: 0, vy: 0 }; SFX.door(); toast('FREE DRIVE', `${RCARS[rs().car].name} · canyons and dunes are yours`, 3); log('Free drive: W/S gas and brake, A/D or mouse steers, Shift boosts. Hit the canyon crests for airtime cash. X to park.', 'loot'); return true;
}
{ const _tb = toggleBike; toggleBike = function () { if (LEVEL && LEVEL.id === 'speedway' && toggleFreeDrive()) return; _tb(); }; }
function raceTick() { /* AI and HUD run inside raceDrive while a race is on */ }
function openRaceMenu() {
  openDlg('Race control', 'Race Marshal Vroom'); const R = rs();
  $('dlgLine').textContent = `Time trials: drive through the glowing gates in order, start to finish, and beat the clock. Gold, silver or bronze. No walls, no traffic, just you and the jumps. W/S (or the stick) gas and brake, steer with A/D or the stick, Shift boosts. Gold on all three for the Grand Championship. Your car: ${RCARS[R.car].name}.`;
  acts([...Object.entries(RTRACKS).map(([k, T]) => [`${T.name}${R.best[k] ? ' · best ' + R.best[k] + 's' : ''}${R.wins[k] ? ' · 🏆' : ''}`, () => startRace2(k), k === 'canyon']), ['Bye', closeDlg]]);
}
function openGarage() {
  openDlg('Garage', 'Garage Gus'); const R = rs();
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = `${S.cr} cr. Faster cars, plus paint. Your car: ${RCARS[R.car].name}.`;
    for (const [k, C2] of Object.entries(RCARS)) { const own = R.owned.includes(k), r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = own ? '#6fdc5a' : '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = `${C2.name} · top ${Math.round(C2.top * 3.6)} km/h`; const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = own ? (R.car === k ? 'Driving' : 'Owned') : C2.prize ? 'Win all 3 tracks' : C2.price + ' cr';
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px';
      if (own) { b.textContent = 'Drive'; b.disabled = R.car === k; b.addEventListener('click', () => { R.car = k; markDirty(); render(); setPreview(() => makeHoverCar(RPAINTS[R.paint || 0], C2.style), C2.name); }); } else { b.textContent = 'Buy'; b.disabled = C2.prize || S.cr < C2.price; b.addEventListener('click', () => { S.cr -= C2.price; R.owned.push(k); R.car = k; SFX.item(); markDirty(); render(); }); }
      r.append(dot, nm, mt, b); rows.appendChild(r); r.addEventListener('pointerenter', () => setPreview(() => makeHoverCar(RPAINTS[R.paint || 0], C2.style), C2.name)); }
    const pr = document.createElement('div'); pr.style.display = 'flex'; pr.style.gap = '6px'; pr.style.flexWrap = 'wrap'; pr.style.margin = '6px 0';
    RPAINTS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'pbtn' + ((R.paint || 0) === i ? ' go' : ''); b.style.padding = '5px 12px'; b.style.background = c; b.textContent = ' '; b.setAttribute('aria-label', 'Paint ' + (i + 1)); b.addEventListener('click', () => { R.paint = i; markDirty(); render(); setPreview(() => makeHoverCar(RPAINTS[i], RCARS[R.car].style), 'Your paint'); }); pr.appendChild(b); });
    rows.appendChild(pr); };
  $('dlgActs').before(rows); acts([['Free drive', () => { closeDlg(); toggleFreeDrive(); }, true], ['Done', closeDlg]]); render(); showPreviewIn(rows); setPreview(() => makeHoverCar(RPAINTS[R.paint || 0], RCARS[R.car].style), RCARS[R.car].name);
}
CAPES.checkered = { name: 'Checkered Cape', lvl: 1, flag: 'racerCape', col: '#f4f8ff', trim: '#1e1c22' };
defQuest('v1', { ch: 'Velocity', title: 'First Lap', giver: 'vroom', turnIn: 'vroom', req: [],
  intro: ["New driver! Welcome to Velocity. Everything here is a race. Lunch is a race. Napping is a race.", "Take the Canyon Sprint and get under the gold time. Then I'll know you're real."],
  obj: [{ kind: 'kill', t: 'racewin_canyon', n: 1, text: 'Get gold on the Canyon Sprint' }],
  outro: ["A winner! Gus has faster cars when you're ready. Mesa Run and Dune Dash are waiting."], reward: { cr: 2000, xp: 4000 } });

// ramps: the ground rises along the course and drops off sharply, so cars launch
function rampCarve(x, z, h) {
  for (const k in RTRACKS) { const T = RTRACKS[k]; if (!T.len) trackLen(T);
    for (const [rx, rz, fx, fz] of T.rampP) { const dx = x - rx, dz = z - rz; if (dx * dx + dz * dz > 260) continue; const along = dx * fx + dz * fz, lat = Math.abs(-dx * fz + dz * fx);
      if (lat < 7 && along > -14 && along < 1.5) h += along < 0 ? 3.4 * (1 + along / 14) : 3.4 * (1 - along / 1.5); } }
  return h;
}
window.__race = { get RC() { return RC; }, trackAt, RTRACKS, startRace2 };

// ---- canyon walls ----
const WALL_W = 9.6, WALL_CLAMP = 8.7;
function nearOnTrack(T, x, z) { let best = null; for (const [a, b, l, L0] of T.seg) { const dx = b[0] - a[0], dz = b[1] - a[1]; let k = ((x - a[0]) * dx + (z - a[1]) * dz) / (l * l); k = clamp(k, 0, 1); const px = a[0] + dx * k, pz = a[1] + dz * k, d = Math.hypot(x - px, z - pz); if (!best || d < best.d) { const fx = dx / l, fz = dz / l; best = { d, s: L0 + l * k, px, pz, fx, fz, lat: (x - px) * fz - (z - pz) * fx }; } } return best; }
function wallAt(T, s) { if (s < 34 || s > T.len - 6) return false; return !(T.gaps || []).some(([a, b]) => s > a && s < b); }
function buildRaceWalls() {
  const mat = psx(new THREE.MeshLambertMaterial({ map: TEX.stone, color: new THREE.Color('#b0603e').convertSRGBToLinear() })), others = k => Object.entries(RTRACKS).filter(([j]) => j !== k).map(([, T]) => T);
  for (const [k, T] of Object.entries(RTRACKS)) {
    // gaps: route crossings + an exit every 200 m
    T.gaps = []; for (let s = 200; s < T.len - 40; s += 200) T.gaps.push([s - 10, s + 10]);
    for (let s = 0; s <= T.len; s += 3) { const [x, z] = trackAt(T, s); if (others(k).some(O => nearOnTrack(O, x, z).d < 16)) T.gaps.push([s - 3, s + 3]); }
    const pos = [], uv = [], idx = []; let n = 0;
    for (const sd of [-1, 1]) { let prev = false;
      for (let s = 0; s <= T.len; s += 3) { const on = wallAt(T, s), [x, z, a] = trackAt(T, s), cx = Math.cos(a), cz = -Math.sin(a), px = x + cx * WALL_W * sd, pz = z + cz * WALL_W * sd, g = groundH(px, pz), hh = 3.6 + Math.sin(s * 0.21 + sd) * 1.1 + Math.sin(s * 0.05) * 1.4;
        pos.push(px, g - 1.5, pz, px + cx * 1.4 * sd, g + hh, pz + cz * 1.4 * sd); uv.push(s / 4, 0, s / 4, hh / 4);
        if (on && prev) { const i = n * 2; sd > 0 ? idx.push(i - 2, i, i - 1, i - 1, i, i + 1) : idx.push(i - 2, i - 1, i, i - 1, i + 1, i); }
        prev = on; n++; } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); m.material.side = THREE.DoubleSide; levelGroup.add(m);
  }
}
// keep cars inside the walls: slide along them, lose some speed
function raceWalls(onlyT) {
  const list = onlyT ? [onlyT] : Object.values(RTRACKS);
  for (const T of list) { if (!T.seg) continue; const N = nearOnTrack(T, player.pos.x, player.pos.z); if (!N || N.d > WALL_W + 3 || !wallAt(T, N.s)) continue;
    const lat = N.lat, side = Math.sign(lat), inside = Math.abs(lat) < WALL_W;
    // only walls between the car and the road matter: inside cars are clamped in, outside cars are kept out
    let tgt = null; if (inside && Math.abs(lat) > WALL_CLAMP) tgt = WALL_CLAMP; else if (!inside && !onlyT && Math.abs(lat) < WALL_W + 2.2) tgt = WALL_W + 2.2;
    if (tgt == null) continue;
    const rx = N.fz, rz = -N.fx; player.pos.x = N.px + rx * tgt * side; player.pos.z = N.pz + rz * tgt * side;
    const sp = Math.abs(RC.v); if (sp > 8) { RC.v *= 0.82; if (!RC.wallT || gameTime - RC.wallT > 0.35) { RC.wallT = gameTime; SFX.hit(); } }
    // nudge the nose back along the canyon
    const fwd = Math.atan2(-N.fx, -N.fz), back = Math.atan2(N.fx, N.fz), y = player.yaw, d1 = Math.atan2(Math.sin(fwd - y), Math.cos(fwd - y)), d2 = Math.atan2(Math.sin(back - y), Math.cos(back - y));
    const d = Math.abs(d1) < Math.abs(d2) ? d1 : d2; player.yaw += d * 0.25;
  }
}
