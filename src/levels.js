// =================== LEVELS: Earth (tutorial island), your ship, and the planets ===================
let levelGroup = null, props = null;
const levelAnims = [];
function at(obj, x, z, ry, y) { obj.position.set(x, (y || 0) + groundH(x, z), z); obj.rotation.y = ry || 0; props.add(obj); return obj; }
function solid(x, z, r) { CIRCLES.push([x, z, r]); }
function box(x, z, hx, hz) { BOXES.push([x, z, hx, hz]); }
function rock(x, z, s, col) { const r = at(new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), toon(col || '#a39a88', 'stone')), x, z, x * 7, s * 0.25); r.scale.y = 0.65; r.rotation.x = z; solid(x, z, s * 0.9); }
function tree(x, z, s, leaf) {
  const g = new THREE.Group();
  part(g, Cy(0.13 * s, 0.2 * s, 1.8 * s, 6), '#6b4f36', 0, 0.9 * s, 0);
  part(g, new THREE.IcosahedronGeometry(1.1 * s, 0), toon(leaf || '#6f9a3e', 'leaves'), 0, 2.3 * s, 0);
  part(g, new THREE.IcosahedronGeometry(0.75 * s, 0), toon(leaf ? leaf : '#86ad4a', 'leaves'), 0.3 * s, 3.0 * s, 0.1 * s);
  at(g, x, z, x); solid(x, z, 0.3 * s);
}
function flatTree(x, z, s) { // savanna tree from the Mezar "plain" sketch
  const g = new THREE.Group();
  chain(g, [[0, 0, 0], [0.2 * s, 1.4 * s, 0], [0.1 * s, 2.6 * s, 0.1 * s]], 0.16 * s, '#6b4f36', 0.1 * s);
  const c = part(g, new THREE.CylinderGeometry(1.8 * s, 1.3 * s, 0.6 * s, 7), toon('#7a9a3a', 'leaves'), 0.1 * s, 2.9 * s, 0.1 * s); c.rotation.y = x;
  at(g, x, z, x); solid(x, z, 0.3 * s);
}
function palm(x, z, s) {
  const g = new THREE.Group();
  for (let k = 0; k < 6; k++) part(g, Cy(0.14 * s, 0.17 * s, 0.6 * s, 6), toon(k % 2 ? '#8a6a44' : '#7a5a3a', 'wood'), Math.sin(k * 0.3) * 0.25 * s, 0.3 * s + k * 0.58 * s, 0, 0, 0, -0.08);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const lf = part(g, B(0.4 * s, 0.05, 1.8 * s), toon('#5f8a2e', 'leaves'), Math.sin(0.3 * 6) * 0.25 * s + Math.cos(a) * 0.8 * s, 3.7 * s, Math.sin(a) * 0.8 * s, 0.35, -a + Math.PI / 2, 0); }
  at(g, x, z, x); solid(x, z, 0.3 * s);
}
function cane(x, z, n) {
  for (let k = 0; k < n; k++) {
    const ox = x + Math.sin(k * 2.1 + x) * 0.45, oz = z + Math.cos(k * 1.7 + z) * 0.45, h = 1.8 + (k % 4) * 0.4;
    const st = new THREE.Group(); st.rotation.z = Math.sin(k + x) * 0.1;
    for (let s = 0; s < 4; s++) {
      part(st, Cy(0.04, 0.05, h / 4 - 0.02, 5), s % 2 ? '#8fa04a' : '#a2b45a', 0, s * h / 4 + h / 8, 0);
      part(st, Cy(0.055, 0.055, 0.03, 5), '#5f6d2c', 0, (s + 1) * h / 4, 0);
      part(st, new THREE.ConeGeometry(0.06, 0.55, 3), '#7c8f3a', 0.12, (s + 0.8) * h / 4, 0, 0, s * 2.2, -0.9);
    }
    at(st, ox, oz);
  }
}
function tufts(n, tex, avoid) {
  const mat = psx(new THREE.MeshLambertMaterial({ map: tex || TEX.tuft, alphaTest: 0.5, side: THREE.DoubleSide }));
  const q1 = new THREE.PlaneGeometry(0.9, 0.75); q1.translate(0, 0.36, 0); const q2 = q1.clone(); q2.rotateY(Math.PI / 2);
  let seed = 99; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (WORLD_R - 4), x = WORLD_C.x + Math.cos(a) * d, z = WORLD_C.z + Math.sin(a) * d;
    if (roadDist(x, z) < 2.4 || inSafe({ x, z }) || groundH(x, z) < WATER_Y + 0.15 || (avoid && avoid(x, z))) continue;
    const s = 0.7 + r() * 0.8, ry = r() * 3;
    for (const q of [q1, q2]) { const m = new THREE.Mesh(q, mat); m.scale.setScalar(s); at(m, x, z, ry, -0.02); }
  }
}
function scatterNature(n, seed0, pick) {
  let seed = seed0; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = 14 + r() * (WORLD_R - 18), x = WORLD_C.x + Math.cos(a) * d, z = WORLD_C.z + Math.sin(a) * d;
    const zn = zoneAt(x, z);
    if (roadDist(x, z) < 4 || inSafe({ x, z }) || SAFES.some(s => Math.hypot(x - s.x, z - s.z) < s.r + 5) || (zn && Math.hypot(x - zn.x, z - zn.z) < zn.r * 0.75)) continue;
    if (groundH(x, z) < WATER_Y + 0.5 || polyDist(x, z, RIVER) < 5 || Math.abs(groundH(x + 1, z) - groundH(x - 1, z)) + Math.abs(groundH(x, z + 1) - groundH(x, z - 1)) > 1.2) continue;
    pick(i, x, z, r);
  }
}
function wallRing(cx, cz, R, gate, half, mat, mat2, hgt, n) {
  const g = new THREE.Group(); g.position.set(cx, groundH(cx, cz), cz); props.add(g);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, d = Math.atan2(Math.sin(a - gate), Math.cos(a - gate));
    if (Math.abs(d * R) < half + 0.6) continue;
    const x = Math.cos(a) * R, z = Math.sin(a) * R, y = groundH(cx + x, cz + z) - g.position.y;
    part(g, B(2 * Math.PI * R / n + 0.2, hgt, 0.7), i % 2 ? mat : mat2, x, y + hgt / 2, z, 0, -a + Math.PI / 2);
  }
  for (const s of [-1, 1]) { const a = gate + s * (half + 0.4) / R, x = Math.cos(a) * R, z = Math.sin(a) * R; part(g, B(0.9, hgt + 1.2, 0.9), mat2, x, groundH(cx + x, cz + z) - g.position.y + (hgt + 1.2) / 2, z); solid(cx + x, cz + z, 0.6); }
  RINGS.push({ x: cx, z: cz, r: R, gate, half, safe: true });
  return g;
}
function bridgeOn(path) {
  const a = path[0], b = path[1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  let best = 0, bd = 1e9; for (let t = 0; t <= 1; t += 0.005) { const d = polyDist(a[0] + dx * t, a[1] + dz * t, RIVER); if (d < bd) { bd = d; best = t; } }
  const cx = a[0] + dx * best, cz = a[1] + dz * best, W = WATER_Y > -50 ? WATER_Y : -1, dry = W + 0.35;
  // walk out from the river along the path to the first dry ground on each bank; the deck runs bank to bank and slopes to meet both,
  // so it never floats in the air or sinks into a hill (one high bank used to leave a 34 m deck hanging metres over the other side)
  const bank = s => { for (let d = 1; d < 30; d += 0.5) if (groundH(cx + ux * d * s, cz + uz * d * s) >= dry) return d; return 30; };
  const dA = Math.max(4.6, bank(1) + 1.4), dB = Math.max(4.6, bank(-1) + 1.4);
  const yA = Math.max(groundH(cx + ux * dA, cz + uz * dA), W + 0.5) + 0.1, yB = Math.max(groundH(cx - ux * dB, cz - uz * dB), W + 0.5) + 0.1;
  const span = dA + dB, hl = span / 2, mid = (dA - dB) / 2, mx = cx + ux * mid, mz = cz + uz * mid, ym = (yA + yB) / 2, slope = (yA - yB) / span;
  const outer = new THREE.Group(); outer.position.set(mx, ym, mz); outer.rotation.y = Math.atan2(ux, uz);
  const g = new THREE.Group(); g.rotation.x = -Math.atan(slope); outer.add(g); const hd = hl / Math.cos(Math.atan(slope)), n = Math.ceil(hd * 2 / 0.75);
  for (let i = 0; i < n; i++) part(g, B(2.8, 0.14, 0.7), toon(i % 2 ? '#9a7650' : '#8a6a44', 'wood'), 0, -0.07, -hd + 0.37 + i * 0.75);
  for (const s of [-1, 1]) { part(g, B(0.14, 0.14, hd * 2), toon('#6a4f34', 'wood'), 1.35 * s, 0.75, 0); for (let k = 0; k <= Math.floor((hd * 2 - 0.6) / 2.05); k++) part(g, B(0.14, 0.8, 0.14), toon('#6a4f34', 'wood'), 1.35 * s, 0.35, -hd + 0.3 + k * 2.05); }
  // posts straight down into the riverbed
  for (let k = -Math.floor(hl / 4); k <= Math.floor(hl / 4); k++) { const d = k * 4, px = mx + ux * d, pz = mz + uz * d, top = ym + d * slope, bot = Math.min(groundH(px, pz), W) - 0.6, h = top - bot; if (h < 0.3) continue;
    for (const s of [-1, 1]) part(outer, B(0.3, h, 0.3), toon('#6a4f34', 'wood'), 1.35 * s, d * slope - 0.1 - h / 2, d); }
  props.add(outer); SURFACES.push({ x: mx, z: mz, ux, uz, hl, hw: 1.4, y: ym, slope });
}
function dropshipPad(x, z, ry, label) {
  const pad = new THREE.Group();
  part(pad, Cy(3.0, 3.0, 0.12, 20), '#4f4c46', 0, 0.06, 0);
  const ring = part(pad, new THREE.RingGeometry(2.3, 2.6, 24), glow('#f6b56a'), 0, 0.14, 0, -Math.PI / 2);
  const ship = makeDropship(); ship.rotation.y = 0.6; pad.add(ship);
  at(pad, x, z, ry); solid(x, z, 2.4);
  INTERACTS.push({ x, z, r: 4.2, label: label || 'Board your ship', fn: () => boardShip() });
}
// Merge static scenery into one mesh per material: thousands of parts become a few dozen draw calls
function tessellate(pos, nor, uv, L) {
  const P = [], N = [], U = [], q = [];
  for (let i = 0; i < pos.length / 9; i++) q.push([[0, 1, 2].map(k => [pos[i * 9 + k * 3], pos[i * 9 + k * 3 + 1], pos[i * 9 + k * 3 + 2]]), [0, 1, 2].map(k => [nor[i * 9 + k * 3], nor[i * 9 + k * 3 + 1], nor[i * 9 + k * 3 + 2]]), [0, 1, 2].map(k => [uv[i * 6 + k * 2], uv[i * 6 + k * 2 + 1]])]);
  const mid = (a, b) => a.map((v, i) => (v + b[i]) / 2), d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  let guard = 0;
  while (q.length) { const [p, n, u] = q.pop();
    if (guard++ < 200000 && Math.max(d2(p[0], p[1]), d2(p[1], p[2]), d2(p[2], p[0])) > L * L) {
      const pm = [mid(p[0], p[1]), mid(p[1], p[2]), mid(p[2], p[0])], nm = [mid(n[0], n[1]), mid(n[1], n[2]), mid(n[2], n[0])], um = [mid(u[0], u[1]), mid(u[1], u[2]), mid(u[2], u[0])];
      q.push([[p[0], pm[0], pm[2]], [n[0], nm[0], nm[2]], [u[0], um[0], um[2]]], [[pm[0], p[1], pm[1]], [nm[0], n[1], nm[1]], [um[0], u[1], um[1]]], [[pm[2], pm[1], p[2]], [nm[2], nm[1], n[2]], [um[2], um[1], u[2]]], [pm, nm, um]); continue; }
    for (let k = 0; k < 3; k++) { P.push(...p[k]); N.push(...n[k]); U.push(...u[k]); } }
  return [new Float32Array(P), new Float32Array(N), new Float32Array(U)];
}
function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  root.traverse(o => {
    if (!o.isMesh) return;
    let b = buckets.get(o.material); if (!b) { b = { pos: [], nor: [], uv: [] }; buckets.set(o.material, b); }
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrixWorld);
    let pa = g.attributes.position.array, na = g.attributes.normal.array, ua = g.attributes.uv ? g.attributes.uv.array : new Float32Array(g.attributes.position.count * 2);
    g.computeBoundingSphere(); if (g.boundingSphere.radius > 2.2) [pa, na, ua] = tessellate(pa, na, ua, 2.4);
    b.pos.push(pa); b.nor.push(na); b.uv.push(ua); g.dispose();
  });
  const out = new THREE.Group();
  const cat = (list) => { let n = 0; list.forEach(a => n += a.length); const r = new Float32Array(n); let off = 0; list.forEach(a => { r.set(a, off); off += a.length; }); return r; };
  for (const [mat, b] of buckets) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(cat(b.pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(b.nor), 3)); g.setAttribute('uv', new THREE.BufferAttribute(cat(b.uv), 2));
    g.computeBoundingSphere(); out.add(new THREE.Mesh(g, mat));
  }
  if (root.parent) root.parent.remove(root);
  levelGroup.add(out); return out;
}

// ---------------- EARTH (tutorial island) ----------------
const EARTH_NPCS = [
  { id: 'vega', name: 'Captain Vega', role: 'Safe Zone garrison', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#3b4f7a', '#4a5229': '#2a3756', '#c9b27c': '#d9c48a' }), x: 4.8, z: 8.2, face: Math.PI,
    idle: ["Keep your blaster charged out there.", "Every night the sun sets a little redder."] },
  { id: 'tully', name: 'Tully', role: 'Gunsmith', rig: 'civ', make: () => makeCivilian('#7a5a3c', '#3d3a36', '#d9a77a', '#3a2a1e', '#4a3a2c'), x: -5.6, z: 5.6, shop: 'guns', guns: ['b1', 'b5', 'c10', 'r15'],
    idle: ["If it shoots, I can make it shoot better.", "Scrap builds walls too. Press Build out past the gate."] },
  { id: 'zib', name: 'Zib', role: 'General store · buys anything', rig: 'spearman', make: () => recolor(makeSpearman(), { '#7fae63': '#8a6fc4', '#4f7a3c': '#5d4a8a' }), x: 5.4, z: 5.8, shop: 'store',
    idle: ["Zib buys! Zib sells! Pelts, shells, crystals, all good.", "Rock cores from the mesa fetch a fine price."] },
  { id: 'mira', name: 'Doc Mira', role: 'Clinic', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#5a6a7a', '#c58a64', '#1e1a18', '#c8402f'), x: 2.0, z: 6.6, heal: true,
    idle: ["Hold still. There, good as new.", "Come back in one piece, please."] },
  { id: 'nash', name: 'Old Nash', role: 'Bank', rig: 'civ', make: () => makeCivilian('#2e5a3a', '#2c2a28', '#e0b892', '#cfcac0'), x: -1.9, z: 6.6, bank: true,
    idle: ["Credits in the bank don't get dropped when you go down.", "Safest vault on Earth. Probably."] },
  { id: 'elismas', name: 'Elismas', role: 'Master of the Gun', rig: 'elismas', make: makeElismas, x: -6.0, z: -6.0, face: 0.8, showIf: () => qDone('q3') || qState('q4'),
    idle: ["A true gunner never wastes a shot.", "The galaxy is wide. Your ship will carry you to the other Masters."] }
];
const LEVELS = {};
LEVELS.earth = {
  id: 'earth', name: 'Earth', tag: 'Tutorial island', lvls: 'Lv 1–12', size: 280, center: [0, 14], radius: 92, water: -0.45, sky: 'earth', weather: 'rain',
  terrain: { a1: 2.3, f1: 0.045, a2: 1.2, f2: 0.08, a3: 0.45, f3: 0.15, base: 1.4, min: 0.1, edge: 26, step: 1.6 },
  palette: { grass: '#86a04a', dirt: '#ad9260', sand: '#dcc48c', wet: '#5e6e4e', rockA: '#9c8668', rockB: '#7c6850', snow: '#e8e4dc', snowLine: 14 },
  zones: [
    { id: 'town', name: 'Safe Zone', lvl: 'No fighting', x: TOWN.x, z: TOWN.z, r: 11, fr: 13.5, col: '#b3a27c', safe: true, h: 0 },
    { id: 'out', name: 'Earth Outskirts', lvl: 'Lv 1–2', x: 2, z: 6, r: 16, fr: 9, col: '#8fa84b', h: 0.2 },
    { id: 'scrap', name: 'Robot Scrapyard', lvl: 'Lv 2–5', x: 44, z: 4, r: 18, col: '#8f8676', h: 0.3 },
    { id: 'bug', name: 'Bug Grounds', lvl: 'Lv 3–6', x: -46, z: 8, r: 18, col: '#4f6e2c', h: -0.1 },
    { id: 'lake', name: 'Crystal Lake', lvl: 'Lv 3–6', x: -17, z: 33, r: 12, fr: 7, col: '#d8c38a', h: -2.6 },
    { id: 'camp', name: 'Alien Camp', lvl: 'Lv 5–8', x: 4, z: 52, r: 17, col: '#d8bd7c', h: 1.6, dunes: true },
    { id: 'rock', name: 'Rock Mesa', lvl: 'Lv 7–10', x: 47, z: 55, r: 16, fr: 12.5, col: '#b8a07a', h: 6.4 },
    { id: 'drome', name: "Drome's Outpost", lvl: 'Lv 10–12', x: -46, z: 62, r: 14, fr: 15, col: '#4e3d3a', h: 3.2 },
    { id: 'north', name: 'Northfall', lvl: 'Peaceful', x: -24, z: -64, r: 11, fr: 9, col: '#7fa04a', h: 5.6 }
  ],
  paths: [[[0, -13], [0, 4]], [[0, 4], [44, 4]], [[0, 4], [-46, 8]], [[0, 4], [4, 52]], [[4, 52], [47, 55]], [[4, 52], [-34, 60]]],
  river: [[-22, -55], [-19, -32], [-16, -8], [-19, 12], [-17, 30]],
  pools: [[-52, 2, 3.2], [-40, 18, 2.6], [-55, 16, 2.2], [-38, 0, 2]],
  lava: [[-52, 58, 1.8], [-40, 66, 1.6], [-58, 74, 2.2], [-33, 52, 1.8]],
  carve: (x, z, h) => { const nd = Math.hypot(x + 24, z + 62); return nd < 4 ? Math.min(h, 4.9 + (h - 4.9) * smooth(nd, 2, 3.8)) : h; },
  safes: [{ x: TOWN.x, z: TOWN.z, r: 10.2 }],
  spawn: { x: TOWN.x + 1.2, z: TOWN.z + 7.6, yaw: Math.PI - 0.5 }, pad: { x: TOWN.x - 1.2, z: TOWN.z - 5.4 },
  menu: { x: TOWN.x, z: TOWN.z, r: 26, h: 9 },
  npcs: EARTH_NPCS, npcBase: [TOWN.x, TOWN.z],
  spawns: [
    { zone: 'out', type: 'dog', n: 7, lv: [1, 2] }, { zone: 'scrap', type: 'xr17', n: 8, lv: [2, 5] },
    { zone: 'bug', type: 'crolan', n: 5, lv: [3, 5] }, { zone: 'bug', type: 'bughybrid', n: 3, lv: [4, 6] }, { zone: 'lake', type: 'skyrene', n: 4, lv: [3, 6] },
    { zone: 'camp', type: 'spearman', n: 6, lv: [5, 8] }, { zone: 'camp', type: 'stagrone', n: 3, lv: [5, 7] }, { zone: 'camp', type: 'chief', n: 1, lv: [8, 8], at: [0, 2] },
    { zone: 'rock', type: 'rockmonster', n: 4, lv: [7, 10] }, { zone: 'rock', type: 'gopel', n: 3, lv: [7, 9] },
    { zone: 'drome', type: 'guard', n: 4, lv: [10, 11] }, { zone: 'drome', type: 'drome', n: 1, lv: [12, 12], at: [0, -4] }
  ],
  build() {
    buildJamestown();
    scatterNature(320, 7, (i, x, z, r) => { if (i % 6 === 0) cane(x, z, 3); else if (i % 7 === 0) rock(x, z, 0.8 + r() * 1.2); else tree(x, z, 0.8 + r() * 0.6); });
    bridgeOn(PATHS[2]);
    // scrapyard
    { const zx = Z.scrap.x, zz = Z.scrap.z;
      for (let i = 0; i < 10; i++) { const a = i * 0.63, d = 6 + (i % 3) * 3.5, x = zx + Math.cos(a) * d, z = zz + Math.sin(a) * d, g = new THREE.Group();
        for (let k = 0; k < 6; k++) part(g, B(rand(0.5, 1.3), rand(0.3, 0.8), rand(0.5, 1.2)), k % 2 ? '#7a7f87' : '#8a5a3c', rand(-0.7, 0.7), k * 0.25, rand(-0.7, 0.7), rand(0, 0.5), rand(0, 3), rand(0, 0.5));
        if (i % 2) part(g, B(0.42, 0.5, 0.86), C.red, 0, 1.5, 0, 0.4, 0.3, 0.2); at(g, x, z, a); solid(x, z, 1.4); }
      for (let i = 0; i < 6; i++) { const x = zx + rand(-12, 12), z = zz + rand(-12, 12), b = new THREE.Group(); part(b, Cy(0.3, 0.3, 0.8, 10), i % 2 ? '#b8562f' : '#5d636c', 0, 0.4, 0); at(b, x, z); solid(x, z, 0.4); }
      const crane = new THREE.Group(); part(crane, B(0.5, 7, 0.5), '#c9a43a', 0, 3.5, 0); part(crane, B(6, 0.4, 0.4), '#c9a43a', 2.5, 6.8, 0); part(crane, Cy(0.03, 0.03, 3, 4), C.dark, 5, 5.2, 0); at(crane, zx + 13, zz - 10); solid(zx + 13, zz - 10, 0.6); }
    // bug grounds
    for (const [ox, oz, s] of [[0, 0, 1.3], [-9, 6, 1], [8, -7, 0.9], [7, 8, 0.8]]) { const g = new THREE.Group(), x = Z.bug.x + ox, z = Z.bug.z + oz;
      for (let k = 0; k < 4; k++) E(g, k % 2 ? '#c9a46a' : '#b8925a', 0, (0.6 + k * 1.0) * s, 0, (1.9 - k * 0.38) * s, 0.65 * s, (1.9 - k * 0.38) * s);
      for (let k = 0; k < 7; k++) { const a = k * 0.9; E(g, '#3a2c1c', Math.cos(a) * 1.6 * s * (1 - (k % 3) * 0.2), (0.7 + (k % 3)) * s, Math.sin(a) * 1.6 * s * (1 - (k % 3) * 0.2), 0.18 * s, 0.22 * s, 0.18 * s); }
      at(g, x, z); solid(x, z, 1.9 * s); }
    for (let i = 0; i < 4; i++) cane(Z.bug.x + rand(-15, 15), Z.bug.z + rand(-15, 15), 3);
    // alien camp
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, x = Z.camp.x + Math.cos(a) * 9, z = Z.camp.z + Math.sin(a) * 9, g = new THREE.Group();
      part(g, new THREE.ConeGeometry(1.7, 2.6, 6), i % 2 ? '#6c4f8a' : '#3f7d7a', 0, 1.3, 0); part(g, B(0.7, 1.1, 0.05), C.dark, 0, 0.55, 1.42, -0.55);
      part(g, Cy(0.03, 0.03, 1, 4), '#4a3a2c', 0, 2.9, 0); part(g, B(0.02, 0.35, 0.5), glow('#f2c23a'), 0, 3.2, 0.25); at(g, x, z, -a + Math.PI / 2); solid(x, z, 1.6); }
    { const fire = new THREE.Group(); for (let k = 0; k < 4; k++) part(fire, Cy(0.08, 0.08, 1.0, 5), '#5a4532', 0, 0.1, 0, Math.PI / 2, k * 0.8, 0);
      const fl = part(fire, new THREE.OctahedronGeometry(0.35, 0), glow('#ffb347'), 0, 0.45, 0); fl.scale.y = 1.6;
      fire.position.set(Z.camp.x, groundH(Z.camp.x, Z.camp.z), Z.camp.z); levelGroup.add(fire); solid(Z.camp.x, Z.camp.z, 0.8);
      levelAnims.push(t => fl.scale.set(1 + Math.sin(t * 9) * 0.1, 1.6 + Math.sin(t * 13) * 0.25, 1)); }
    for (let i = 0; i < 14; i++) { const a = i * 0.45, d = 5 + (i % 4) * 3.2; rock(Z.rock.x + Math.cos(a) * d, Z.rock.z + Math.sin(a) * d, 1 + (i % 3) * 0.8, i % 2 ? '#a08c6e' : '#b8a382'); }
    // Drome's outpost
    { const cx = Z.drome.x, cz = Z.drome.z, R = 12, gate = Math.atan2(ET(-34, 60)[1] - cz, ET(-34, 60)[0] - cx);
      const g = new THREE.Group(); g.position.set(cx, groundH(cx, cz), cz); props.add(g);
      for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2, d = Math.atan2(Math.sin(a - gate), Math.cos(a - gate)); if (Math.abs(d) < 0.16) continue;
        const x = Math.cos(a) * R, z = Math.sin(a) * R, y = groundH(cx + x, cz + z) - g.position.y;
        part(g, B(2.7, 3.2, 0.7), i % 2 ? '#2b2528' : '#352d31', x, y + 1.6, z, 0, -a + Math.PI / 2);
        if (i % 3 === 0) part(g, B(0.9, 1.6, 0.05), C.red, x * 0.96, y + 2.0, z * 0.96, 0, -a + Math.PI / 2);
        if (i % 2) part(g, new THREE.ConeGeometry(0.25, 0.7, 4), C.red, x, y + 3.5, z); }
      part(g, Cy(1.2, 1.6, 8, 8), '#2b2528', 0, 4, 0); part(g, Cy(1.5, 1.2, 1, 8), '#1e1c22', 0, 8.4, 0); part(g, new THREE.OctahedronGeometry(0.6, 0), glow('#ff2a3a'), 0, 9.6, 0);
      for (const s of [-1, 1]) { const x = Math.cos(gate + 0.2 * s) * R, z = Math.sin(gate + 0.2 * s) * R; part(g, B(0.9, 5, 0.9), '#1e1c22', x, 2.5 + groundH(cx + x, cz + z) - g.position.y, z); }
      solid(cx, cz, 1.8); RINGS.push({ x: cx, z: cz, r: R, gate, half: 2.1 }); }
    // Northfall waterfall
    { const pool = new THREE.CircleGeometry(3.6, 14); pool.rotateX(-Math.PI / 2); const pm = new THREE.Mesh(pool, WATER_MAT); pm.position.set(ET(-24, -62)[0], 5.3, ET(-24, -62)[1]); levelGroup.add(pm);
      const fm = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 6.4, 2, 6), psx(new THREE.MeshBasicMaterial({ map: TEX.fall, transparent: true, opacity: 0.9, color: '#d8f0ff', side: THREE.DoubleSide })));
      fm.position.set(ET(-22.6, -56.4)[0], 2.2, ET(-22.6, -56.4)[1]); fm.rotation.y = 0.15; levelGroup.add(fm);
      const fo = new THREE.Mesh(new THREE.CircleGeometry(2.2, 10).rotateX(-Math.PI / 2), psx(new THREE.MeshBasicMaterial({ map: TEX.fall, transparent: true, opacity: 0.7 }))); fo.position.set(ET(-22.3, -55)[0], WATER_Y + 0.05, ET(-22.3, -55)[1]); levelGroup.add(fo); }
    tufts(2600, null, (x, z) => Math.hypot(x - Z.drome.x, z - Z.drome.z) < 18 || Math.hypot(x - Z.scrap.x, z - Z.scrap.z) < 10);
  }
};

// ---------------- MEZAR (the ringed world) ----------------
const HIVE = [0, -30];
LEVELS.mezar = {
  id: 'mezar', name: 'Mezar', tag: 'The ringed desert world', lvls: 'Lv 10–20', size: 300, center: [0, 18], radius: 102, water: -0.3, sky: 'mezar', weather: 'sand', hourOffset: 9,
  terrain: { a1: 2.8, f1: 0.035, a2: 1.6, f2: 0.07, a3: 0.7, f3: 0.16, base: 1.6, min: 0.2, edge: 30, step: 2.4 },
  palette: { grass: '#d4a96a', patch: '#c4945a', dirt: '#a87a4a', sand: '#e8cf98', wet: '#7a5a36', rockA: '#c47a4a', rockB: '#9e5a36' },
  zones: [
    { id: 'hive', name: 'Bug City', lvl: 'No fighting', x: HIVE[0], z: HIVE[1], r: 13, fr: 15, col: '#c9a46a', safe: true, h: 0 },
    { id: 'plains', name: 'Mezar Plains', lvl: 'Lv 10–12', x: 0, z: 8, r: 18, fr: 10, col: '#a8a45a', h: 0.6 },
    { id: 'ants', name: 'Ant Hills', lvl: 'Lv 11–14', x: 46, z: 0, r: 18, col: '#b48a5a', h: 1 },
    { id: 'oasis', name: 'Glass Oasis', lvl: 'Lv 12–14', x: -44, z: 20, r: 13, fr: 8, col: '#8fae5a', h: 0.2 },
    { id: 'mesa', name: 'Red Mesas', lvl: 'Lv 13–15', x: -50, z: -24, r: 14, fr: 11, col: '#c47a4a', h: 6.4 },
    { id: 'dunes', name: 'Sand Dome Desert', lvl: 'Lv 14–18', x: 14, z: 64, r: 26, col: '#e3c487', h: 2, dunes: true },
    { id: 'pit', name: 'The Gut Pit', lvl: 'Lv 18–20', x: -36, z: 78, r: 14, fr: 10, col: '#8a6a4a', h: 0.5 }
  ],
  paths: [[[0, -17], [0, 8]], [[0, 8], [46, 0]], [[0, 8], [-44, 20]], [[0, 8], [14, 64]], [[14, 64], [-36, 78]], [[-44, 20], [-50, -24]]],
  river: [], pools: [[-44, 20, 5], [-37, 26, 2.6]], lava: [],
  safes: [{ x: HIVE[0], z: HIVE[1], r: 11.6 }],
  spawn: { x: 0, z: -22, yaw: Math.PI }, pad: { x: 0, z: -11 },
  menu: { x: HIVE[0], z: HIVE[1], r: 28, h: 10 },
  npcBase: HIVE,
  npcs: [
    { id: 'bugmaster', name: 'The Bug Master', role: 'Master of the Swarm', rig: null, make: makeBugMaster, x: 0, z: 5.5, face: Math.PI, idle: ["The hive hears everything, little gunner.", "Capitone's trees remember the Masters. So do I."] },
    { id: 'kix', name: 'Kix', role: 'Hive trader · buys anything', rig: 'bughybrid', make: () => recolor(makeBugHybrid(), { '#5f8a3a': '#c4924a', '#3e5e26': '#8a5a2a' }), x: -6, z: 6, shop: 'store', idle: ["Kix trades. Shells, scales, mandibles. Kix pays fair. Mostly."] },
    { id: 'thrax', name: 'Armorer Thrax', role: 'Hive guns', rig: 'bughybrid', make: () => recolor(makeBugHybrid(), { '#5f8a3a': '#a8402e', '#3e5e26': '#6a2a1e', '#e2dfb2': '#e8c890' }), x: 6, z: 6, shop: 'guns', guns: ['h20', 's25', 'r15'], idle: ["Hive steel. Lighter than yours, and it stings."] },
    { id: 'sela', name: 'Lt. Sela', role: 'Stranded radio officer', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#7a6a3a', '#4a5229': '#5a4a2a' }), x: -7, z: -3, face: 1.2, idle: ["My ship went down somewhere in the dunes. I still hear the beacon at night."] },
    { id: 'vexa', name: 'Healer Vexa', role: 'Hive healer', rig: 'spearman', make: () => recolor(makeSpearman(), { '#7fae63': '#c9a46a', '#4f7a3c': '#8a6a3a' }), x: 7, z: -3, face: -1.2, heal: true, idle: ["Honey and venom. The right dose of each, and you live."] }
  ],
  spawns: [
    { zone: 'plains', type: 'sandhound', n: 7, lv: [10, 12] },
    { zone: 'ants', type: 'ant', n: 10, lv: [11, 13] }, { zone: 'ants', type: 'redant', n: 6, lv: [12, 14] }, { zone: 'ants', type: 'bugbug', n: 3, lv: [12, 14] },
    { zone: 'oasis', type: 'skyrene', n: 4, lv: [12, 14] }, { zone: 'oasis', type: 'crolan', n: 3, lv: [12, 13] },
    { zone: 'mesa', type: 'bughybrid', n: 5, lv: [13, 15] }, { zone: 'mesa', type: 'bugbug', n: 2, lv: [13, 15] },
    { zone: 'dunes', type: 'snorfal', n: 5, lv: [14, 17] }, { zone: 'dunes', type: 'stagrone', n: 3, lv: [14, 16] }, { zone: 'dunes', type: 'gopel', n: 2, lv: [15, 17] },
    { zone: 'pit', type: 'gutworm', n: 3, lv: [17, 19] }, { zone: 'pit', type: 'matriarch', n: 1, lv: [20, 20], at: [0, 0] }
  ],
  build() {
    const [hx, hz] = HIVE;
    at(makeHive(1.35), hx, hz - 1); solid(hx, hz - 1, 4.4);
    for (const [ox, oz, s] of [[-7, -6, 0.6], [7, -6, 0.6], [-8.5, 1, 0.45], [8.5, 1, 0.45]]) { at(makeHive(s, '#e0b46a'), hx + ox, hz + oz); solid(hx + ox, hz + oz, 3.2 * s); }
    for (const [ox, oz, col] of [[-6, 8.5, '#8a3a2e'], [6, 8.5, '#3b4f7a']]) { const st = new THREE.Group(); part(st, B(2.4, 0.1, 1.6), col, 0, 2.2, 0, 0.15); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(st, Cy(0.05, 0.05, 2.2, 4), '#6a4f34', sx * 1.1, 1.1, sz * 0.7); part(st, B(2, 0.8, 0.6), toon('#a07a4a', 'wood'), 0, 0.4, 0.4); at(st, hx + ox, hz + oz); box(hx + ox, hz + oz + 0.4, 1.1, 0.5); }
    wallRing(hx, hz, 12.2, Math.PI / 2, 2.2, toon('#c9a46a', 'stone'), toon('#b08a52', 'stone'), 2.8, 34);
    dropshipPad(0, -11, 0, 'Return to your ship');
    // the plains: flat-top trees and grass
    scatterNature(110, 13, (i, x, z, r) => { const zn = zoneAt(x, z); if (i % 5 === 0) rock(x, z, 0.8 + r() * 1.6, i % 2 ? '#c47a4a' : '#b8865a'); else if (i % 3 === 0 && (!zn || zn.id !== 'dunes')) flatTree(x, z, 0.9 + r() * 0.5); else if (i % 4 === 0) rock(x, z, 0.5 + r(), '#d0a070'); });
    for (let i = 0; i < 9; i++) flatTree(Z.plains.x + rand(-15, 15), Z.plains.z + rand(-15, 15), 0.9 + Math.random() * 0.5);
    // ant hills
    for (let i = 0; i < 7; i++) { const a = i * 0.9, d = 4 + (i % 3) * 4, x = Z.ants.x + Math.cos(a) * d, z = Z.ants.z + Math.sin(a) * d, g = new THREE.Group();
      part(g, new THREE.ConeGeometry(1.8, 2.2, 7), toon('#9a6a3a', 'stone'), 0, 1.1, 0); E(g, '#2a1a10', 0, 1.9, 0.5, 0.3, 0.3, 0.2); at(g, x, z, a); solid(x, z, 1.5); }
    // glass oasis palms
    for (let i = 0; i < 10; i++) { const a = i * 0.63, x = Z.oasis.x + Math.cos(a) * 8.5, z = Z.oasis.z + Math.sin(a) * 8.5; if (groundH(x, z) > WATER_Y + 0.3) palm(x, z, 0.9 + (i % 3) * 0.15); }
    for (let i = 0; i < 6; i++) { const c = part(props, new THREE.OctahedronGeometry(0.4, 0), glow('#9fe8ff'), 0, 0, 0); const a = i * 1.05; at(c, Z.oasis.x + Math.cos(a) * 10.5, Z.oasis.z + Math.sin(a) * 10.5, a, 0.4); c.scale.y = 2; }
    // red mesas: hoodoos
    for (let i = 0; i < 8; i++) { const a = i * 0.8, x = Z.mesa.x + Math.cos(a) * 9, z = Z.mesa.z + Math.sin(a) * 9, g = new THREE.Group();
      for (let k = 0; k < 4; k++) part(g, new THREE.CylinderGeometry(0.9 - k * 0.12, 1.0 - k * 0.12, 1.1, 7), toon(k % 2 ? '#c47a4a' : '#9e5a36', 'stone'), 0, 0.55 + k * 1.1, 0);
      part(g, new THREE.CylinderGeometry(1.2, 0.6, 0.5, 7), toon('#b06a3a', 'stone'), 0, 4.7, 0); at(g, x, z, a); solid(x, z, 1.0); }
    // the desert: giant bones and the crashed ship
    for (let i = 0; i < 8; i++) { const x = Z.dunes.x - 10 + i * 1.6, z = Z.dunes.z - 6, g = new THREE.Group(); part(g, new THREE.TorusGeometry(2.4 - Math.abs(i - 3.5) * 0.18, 0.18, 5, 10, Math.PI), toon('#efe7d6', 'stone'), 0, 0, 0, 0, Math.PI / 2, 0); at(g, x, z, 0, -0.3); solid(x, z - 2.2, 0.25); solid(x, z + 2.2, 0.25); }
    { const sk = new THREE.Group(); E(sk, toon('#efe7d6', 'stone'), 0, 0.8, 0, 1.4, 1.0, 1.8); E(sk, '#2a2018', 0.5, 1.0, 1.5, 0.3, 0.3, 0.2); E(sk, '#2a2018', -0.5, 1.0, 1.5, 0.3, 0.3, 0.2); at(sk, Z.dunes.x + 4, Z.dunes.z - 6.5, 0.4); solid(Z.dunes.x + 4, Z.dunes.z - 6.5, 1.6); }
    { const w = makeWreck(); at(w, 34, 76, 0.7); solid(34, 76, 3.2); const sm = w.userData.smoke; props.remove(w); levelGroup.add(w); w.position.y = groundH(34, 76);
      levelAnims.push(t => { sm.children.forEach((c, i) => { c.position.y = 1.6 + ((t * 0.4 + i * 0.7) % 3.5); c.position.x = 0.3 + Math.sin(t + i) * 0.3; }); });
      INTERACTS.push({ x: 34, z: 76, r: 4.5, label: 'Search the wreck', fn: searchWreck }); }
    { const b = makeBeacon(); at(b, 10, 40, 0); const bl = b.children[b.children.length - 1]; props.remove(b); levelGroup.add(b); b.position.y = groundH(10, 40);
      levelAnims.push(t => { bl.visible = Math.sin(t * 6) > 0; });
      INTERACTS.push({ x: 10, z: 40, r: 3, label: 'Inspect the beacon', fn: () => foundQuest('m4') }); }
    // the gut pit: rim stones and worm holes
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; rock(Z.pit.x + Math.cos(a) * 11, Z.pit.z + Math.sin(a) * 11, 0.9 + (i % 3) * 0.5, '#8a6a4a'); }
    for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.9, 10).rotateX(-Math.PI / 2), glow('#1a0e08')); at(h, Z.pit.x + rand(-6, 6), Z.pit.z + rand(-6, 6), 0, 0.05); }
    tufts(500, TEX.tuftDry, (x, z) => { const zn = zoneAt(x, z); return zn && (zn.id === 'dunes' || zn.id === 'pit'); });
  }
};

// ---------------- YOUR SHIP ----------------
const ROOMS = {
  bridge: { name: 'Bridge', fixed: true },
  quarters: { name: 'Crew Quarters', cost: {}, desc: 'Sleep for a full heal and Well Rested (bonus XP for a while). Wardrobe and personal log.' },
  armory: { name: 'Armory', cost: { cr: 400, circuit: 6 }, desc: 'Gun rack, upgrade workbench and an ordnance rack that refills your charges.' },
  cargo: { name: 'Cargo Bay', cost: { cr: 300, scrap: 10 }, desc: 'Ship storage: beam loot up from your backpack (100 slots, upgrades to a Black Hole Box). Cargo manifest to sell loot.' },
  med: { name: 'Med Bay', cost: { cr: 350, crystal: 3 }, desc: 'Healing pod and a stim station (take 25% less damage for 10 min).' },
  trophy: { name: 'Trophy Hall', cost: { cr: 600 }, desc: 'Shows off every boss you beat, plus the Hall of Records leaderboards.' },
  garden: { name: 'Hydro Garden', cost: { cr: 450, shell: 6 }, desc: 'Grows medkits over time. Fish tank included.' },
  hangar: { name: 'Hangar', cost: { cr: 900, circuit: 10 }, desc: 'Vehicle bay, your speed bike, and a launch pad.' }
};
const SHIP_ROOMS = [];
function roomSlot(k) { const side = k % 2 === 0 ? 1 : -1, row = Math.floor(k / 2), zc = 4 + row * 11; return { side, zc, x0: side > 0 ? 2 : -12, x1: side > 0 ? 12 : -2, z0: zc - 5, z1: zc + 5 }; }
LEVELS.ship = {
  id: 'ship', name: 'The Setting Sun', tag: 'Your ship', size: 120, center: [0, 10], radius: 200, water: -99, sky: 'space', weather: 'none',
  terrain: null, palette: {}, zones: [], paths: [], river: [], pools: [], lava: [],
  safes: [{ x: 0, z: 10, r: 300 }], spawn: { x: 0, z: -4, yaw: 0 }, menu: { x: 0, z: -6, r: 6, h: 2 }, npcs: [], spawns: [], npcBase: [0, 0],
  build() {
    SHIP_ROOMS.length = 0;
    const H = 3.2;
    // every surface is UV-tiled by real size, so panels and plates stay the right scale on any wall or floor
    const tiled = (w, h, d, mat, x, y, z, tu, tv) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv; tu = tu || 2; tv = tv || H;
      const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) { const [a, b] = dims[f], sa = f === 2 || f === 3 ? a / 2 : a / tu, sb = f === 2 || f === 3 ? b / 2 : b / tv; for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sa, uv.getY(i) * sb); } }
      const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; props.add(m); return m; };
    const HULL = toonNS('#9aa0aa', 'hull'), TRIM = toonNS('#3a3d44', 'deck');
    const wall = (x1, z1, x2, z2, mat) => { const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, lx = Math.max(Math.abs(x2 - x1), 0.3), lz = Math.max(Math.abs(z2 - z1), 0.3);
      tiled(lx, H, lz, mat || HULL, cx, H / 2, cz); part(props, B(lx + 0.04, 0.16, lz + 0.04), '#2a2c32', cx, 0.08, cz); part(props, B(lx + 0.04, 0.12, lz + 0.04), '#2a2c32', cx, H - 0.06, cz);
      box(cx, cz, lx / 2, lz / 2); };
    // a thin facing on the inside of a room wall so each room has its own look
    const veneer = (x1, z1, x2, z2, nx, nz, mat) => { const lx = Math.abs(x2 - x1), lz = Math.abs(z2 - z1); if (lx < 0.2 && lz < 0.2) return; tiled(Math.max(lx, 0.04), H - 0.3, Math.max(lz, 0.04), mat, (x1 + x2) / 2 + nx * 0.17, H / 2, (z1 + z2) / 2 + nz * 0.17); };
    const floorQuad = (x0, x1, z0, z1, fmat, cmat, lights) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 2.4), Math.ceil((z1 - z0) / 2.4)); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 2, uv.getY(i) * (z1 - z0) / 2);
      const m = new THREE.Mesh(g, fmat); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.receiveShadow = true; props.add(m);
      const c = new THREE.Mesh(g.clone(), cmat || toonNS('#6a6e78', 'ceil')); c.rotation.x = Math.PI; c.position.set((x0 + x1) / 2, H, (z0 + z1) / 2); props.add(c);
      if (lights !== false) for (let z = z0 + 2; z < z1; z += 4) part(props, B(Math.min(3, x1 - x0 - 1), 0.05, 0.25), glow(lights || '#cfe6ff'), (x0 + x1) / 2, H - 0.04, z); };
    const rooms = S.ship.rooms.filter(r => r !== 'bridge');
    const rows = Math.max(1, Math.ceil(rooms.length / 2)), Lz = 4 + (rows - 1) * 11 + 7;
    // ---- the bridge: dark navy deck, curved console row, the big window ----
    floorQuad(-7, 7, -15, -2, toonNS('#3a4a6a', 'deck'), toonNS('#4a5060', 'ceil'), '#8fd0ff');
    wall(-7, -15, -7, -2); wall(7, -15, 7, -2); wall(-7, -15, -4, -15); wall(4, -15, 7, -15); wall(-7, -2, -2, -2); wall(2, -2, 7, -2);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(8, H), new THREE.MeshBasicMaterial({ color: '#8fd0ff', transparent: true, opacity: 0.12, depthWrite: false })); glass.position.set(0, H / 2, -15); levelGroup.add(glass); box(0, -15, 4, 0.2);
    part(props, B(8.2, 0.3, 0.5), '#2a2c32', 0, 0.15, -15); part(props, B(8.2, 0.3, 0.5), '#2a2c32', 0, H - 0.15, -15);
    for (let i = -3; i <= 3; i++) { const x = i * 1.15, z = -13.6 + Math.abs(i) * 0.25; part(props, B(1.05, 0.9, 0.6), '#2a2c32', x, 0.45, z, 0, -i * 0.12, 0); part(props, B(0.95, 0.04, 0.45), glow(i % 2 ? '#4fd2ff' : '#6fdc5a'), x, 0.93, z + 0.02, -0.35, -i * 0.12, 0); } box(0, -13.4, 4.2, 0.4);
    part(props, Cy(0.9, 1.1, 0.9, 8), '#2a2c32', 0, 0.45, -11); part(props, Cy(0.95, 0.95, 0.05, 16), glow('#2a6aa8'), 0, 0.92, -11); solid(0, -11, 1.1);
    const holo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), glow('#8fe3ff')); holo.position.set(0, 1.6, -11); levelGroup.add(holo);
    levelAnims.push(t => { holo.rotation.y = t * 0.6; holo.position.y = 1.6 + Math.sin(t * 1.5) * 0.06; });
    INTERACTS.push({ x: 0, z: -11, r: 2.4, label: 'Galaxy map', fn: openGalaxy });
    part(props, B(1.4, 1.1, 0.6), '#2a2c32', -5, 0.55, -7); part(props, B(1.2, 0.6, 0.05), glow('#6fdc5a'), -5, 1.3, -6.68, -0.3); box(-5, -7, 0.7, 0.3);
    INTERACTS.push({ x: -5, z: -6.4, r: 2, label: 'Ship upgrades', fn: openShipTerminal });
    INTERACTS.push({ x: 0, z: -6.6, r: 1.6, label: 'Take the helm (fly)', fn: () => enterSpace(S.orbit || 'earth') });
    { const ch = new THREE.Group(); part(ch, B(0.8, 0.5, 0.8), '#2a2c32', 0, 0.25, 0); part(ch, B(0.8, 1.0, 0.15), toon('#8a3a2e', 'cloth'), 0, 1.0, 0.36); part(ch, B(0.8, 0.12, 0.8), toon('#8a3a2e', 'cloth'), 0, 0.55, 0); for (const s of [-1, 1]) part(ch, B(0.1, 0.25, 0.7), '#2a2c32', 0.42 * s, 0.75, 0); ch.position.set(0, 0, -7.5); props.add(ch); solid(0, -7.5, 0.5); }
    // ---- the corridor: plated deck with a yellow guide line, ribbed hull walls ----
    floorQuad(-2, 2, -2, Lz, toonNS('#8a8e96', 'deck'));
    part(props, B(0.12, 0.01, Lz + 1.8), glow('#c9a43a'), 0, 0.012, (Lz - 2) / 2);
    wall(-2, Lz, 2, Lz);
    const doors = rooms.map((r, k) => roomSlot(k));
    for (const side of [1, -1]) {
      const gaps = doors.filter(d => d.side === side).map(d => d.zc).sort((a, b) => a - b);
      let z = -2; for (const g of gaps) { if (g - 1.3 > z) wall(2 * side, z, 2 * side, g - 1.3); z = g + 1.3; } if (Lz > z) wall(2 * side, z, 2 * side, Lz);
      for (const g of gaps) { for (const dz of [-1.35, 1.35]) part(props, B(0.32, H, 0.12), '#2a2c32', 2 * side, H / 2, g + dz); part(props, B(0.32, 0.3, 2.8), '#2a2c32', 2 * side, H - 0.15, g); }
    }
    for (let z = 0; z < Lz; z += 3) for (const s of [-1, 1]) part(props, B(0.08, H, 0.18), '#5d636c', 1.84 * s, H / 2, z);
    // ---- rooms: each with its own floor, walls, ceiling, light colour and a job ----
    const LOOK = {
      quarters: { floor: toonNS('#7a4a3a', 'carpet'), wall: toonNS('#a08060', 'woodwall'), ceil: toonNS('#5a4a40', 'ceil'), light: '#ffd8a0' },
      armory: { floor: toonNS('#6a6e76', 'tread'), wall: toonNS('#5a5e66', 'hull'), ceil: toonNS('#3a3d44', 'ceil'), light: '#ff8a6a' },
      cargo: { floor: toonNS('#8a7a5a', 'grate'), wall: toonNS('#8a6a4a', 'hull'), ceil: toonNS('#4a4038', 'ceil'), light: '#ffd36a' },
      lab: { floor: toonNS('#2a2c32', 'tile'), wall: toonNS('#3a2e44', 'tile'), ceil: toonNS('#2a2a36', 'ceil'), light: '#c8a8ff' },
      med: { floor: toonNS('#e8eef2', 'tile'), wall: toonNS('#d8e8ec', 'tile'), ceil: toonNS('#e8eef2', 'ceil'), light: '#e8ffff' },
      trophy: { floor: toonNS('#d8d2c8', 'marble'), wall: toonNS('#6a1e24', 'woodwall'), ceil: toonNS('#3a1e22', 'ceil'), light: '#ffd36a' },
      garden: { floor: toonNS('#4a6a3a', 'grass'), wall: toonNS('#8ab8a0', 'tile'), ceil: toonNS('#cfe8d8', 'ceil'), light: '#e8ffd8' },
      hangar: { floor: toonNS('#6a6a6a', 'grate'), wall: toonNS('#7a7e86', 'hull'), ceil: toonNS('#3a3d44', 'ceil'), light: '#ffffff' },
      range: { floor: toonNS('#4a4e56', 'tread'), wall: toonNS('#3a3438', 'hull'), ceil: toonNS('#2a2c32', 'ceil'), light: '#ffe8c8' }
    };
    rooms.forEach((id, k) => {
      const s = roomSlot(k); SHIP_ROOMS.push(Object.assign({ id }, s));
      const outer = s.side > 0 ? s.x1 : s.x0, inner = s.side > 0 ? s.x0 : s.x1, Lk = LOOK[id] || LOOK.cargo;
      floorQuad(s.x0, s.x1, s.z0, s.z1, Lk.floor, Lk.ceil, Lk.light);
      wall(outer, s.z0, outer, s.z1, Lk.wall); wall(s.x0, s.z0, s.x1, s.z0, Lk.wall); wall(s.x0, s.z1, s.x1, s.z1, Lk.wall);
      veneer(inner, s.z0, inner, s.zc - 1.3, s.side, 0, Lk.wall); veneer(inner, s.zc + 1.3, inner, s.z1, s.side, 0, Lk.wall);
      const cx = (s.x0 + s.x1) / 2, cz = s.zc, far = outer - s.side * 1.6;
      const rl = new THREE.PointLight(new THREE.Color(Lk.light), 0.55, 12, 1.6); rl.position.set(cx, H - 0.6, cz); levelGroup.add(rl);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signTex(ROOMS[id].name.toUpperCase(), '#0f1757', '#ffd75e') })); sign.position.set(s.side * 1.84, 2.75, cz); sign.rotation.y = s.side > 0 ? -Math.PI / 2 : Math.PI / 2; props.add(sign);
      const term = (x, z, col, label, fn, ry) => { const t = new THREE.Group(); part(t, B(0.9, 1.1, 0.45), '#2a2c32', 0, 0.55, 0); part(t, B(0.75, 0.5, 0.04), glow(col), 0, 1.25, 0.18, -0.3); t.position.set(x, 0, z); t.rotation.y = ry || 0; props.add(t); solid(x, z, 0.5); INTERACTS.push({ x: x + Math.sin(ry || 0) * 1.1, z: z + Math.cos(ry || 0) * 1.1, r: 1.8, label, fn }); };
      const faceIn = s.side > 0 ? -Math.PI / 2 : Math.PI / 2;
      if (id === 'quarters') {
        const bed = new THREE.Group(); part(bed, B(1.5, 0.45, 2.4), '#3a3d44', 0, 0.22, 0); part(bed, B(1.4, 0.2, 2.2), toon('#3b4f7a', 'cloth'), 0, 0.55, 0); part(bed, B(1.2, 0.18, 0.5), toon('#e8e4dc', 'cloth'), 0, 0.72, -0.8); part(bed, B(1.5, 1.1, 0.12), toon('#6a4a3a', 'wood'), 0, 0.75, -1.2); bed.position.set(far, 0, cz - 2.6); props.add(bed); box(far, cz - 2.6, 0.75, 1.25);
        part(props, B(0.7, 0.6, 0.6), toon('#6a4a3a', 'wood'), far, 0.3, cz - 0.8); part(props, Cy(0.08, 0.12, 0.3, 8), glow('#ffd8a0'), far, 0.75, cz - 0.8); box(far, cz - 0.8, 0.35, 0.3);
        part(props, B(2.6, 0.04, 1.8), toonNS('#8a3a2e', 'carpet'), cx, 0.02, cz - 2.6);
        INTERACTS.push({ x: far - s.side * 1.1, z: cz - 2.6, r: 2.0, label: 'Sleep (full heal + Well Rested)', fn: sleepInBunk });
        term(cx + s.side * 0.5, s.z0 + 0.6, '#ffd8a0', 'Personal log (Codex)', () => openCodex('ach'), 0);
      }
      if (id === 'armory') {
        const wx = outer - s.side * 0.15; part(props, B(0.05, 1.9, 5.2), toonNS('#2a2c32', 'deck'), wx - s.side * 0.03, 1.55, cz - 1.0); part(props, B(0.06, 0.08, 5.2), glow('#ff8a6a'), wx - s.side * 0.05, 2.52, cz - 1.0);
        const ids = Object.keys(GUNS).filter(g => GUNS[g].kind !== 'mystic').filter((g, i, a) => i % Math.max(1, Math.floor(a.length / 6)) === 0).slice(0, 6);
        for (let i = 0; i < 6; i++) { const gn = typeof makeGunModel === 'function' && ids[i] ? makeGunModel(ids[i]) : makeBlaster(); gn.scale.setScalar(1.7); gn.position.set(wx - s.side * 0.16, 1.15 + Math.floor(i / 3) * 0.75, cz - 2.8 + (i % 3) * 1.8); props.add(gn); for (const dz of [-0.25, 0.2]) part(props, B(0.16, 0.04, 0.04), '#9aa1aa', wx - s.side * 0.09, gn.position.y - 0.09, gn.position.z + dz); }
        part(props, B(2.2, 1.0, 1.0), toonNS('#5a5e66', 'tread'), cx, 0.5, cz + 2.5); part(props, B(0.6, 0.3, 0.4), '#2a2c32', cx - 0.5, 1.15, cz + 2.5); part(props, B(2.2, 0.04, 1.0), glow('#ff8a6a'), cx, 1.02, cz + 2.5); box(cx, cz + 2.5, 1.1, 0.5);
        INTERACTS.push({ x: cx, z: cz + 1.4, r: 2.0, label: 'Gun workbench', fn: openWorkbench });
        { const rk = new THREE.Group(); part(rk, B(0.8, 1.4, 0.5), '#3a3d44', 0, 0.7, 0); for (let i = 0; i < 3; i++) part(rk, new THREE.SphereGeometry(0.12, 8, 6), '#4a5a3a', -0.22 + i * 0.22, 1.0, 0.18); part(rk, B(0.7, 0.05, 0.05), glow('#ffd36a'), 0, 1.35, 0.26); rk.position.set(cx, 0, s.z1 - 0.6); rk.rotation.y = Math.PI; props.add(rk); solid(cx, s.z1 - 0.6, 0.5);
          INTERACTS.push({ x: cx, z: s.z1 - 1.7, r: 1.8, label: 'Ordnance rack (refill)', fn: refillOrdnance }); }
      }
      if (id === 'cargo') {
        for (let i = 0; i < 7; i++) { const x = far + (i % 2 ? -s.side * 1.0 : 0), z = cz - 4 + i * 1.2, h = 0.8 + (i % 3) * 0.2; part(props, B(0.9, h, 0.9), toon(i % 3 ? '#a07a4a' : '#5d7f99', i % 3 ? 'wood' : 'hull'), x, h / 2, z, 0, i * 0.3); if (i % 2 === 0) part(props, B(0.9, 0.8, 0.9), toon('#a07a4a', 'wood'), x, h + 0.4, z, 0, i * 0.5); }
        box(far - s.side * 0.5, cz - 0.4, 1.0, 4.2);
        for (const z of [s.z0 + 0.3, s.z1 - 0.3]) part(props, B(Math.abs(s.x1 - s.x0) - 0.6, 0.012, 0.3), toon('#ffd36a', 'hazard'), cx, 0.014, z);
        term(cx - s.side * 1.0, s.z1 - 0.6, '#ffd36a', 'Cargo manifest (sell loot)', () => openStore('sell', 'Cargo manifest'), Math.PI);
        cargoStorage(s, cx, cz, far, term);
      }
      if (id === 'med') {
        const pod = new THREE.Group(); part(pod, Cy(0.7, 0.7, 0.3, 10), '#d8e8ec', 0, 0.15, 0); const gl = part(pod, Cy(0.6, 0.6, 2.0, 10), glow('#6fdc5a'), 0, 1.2, 0); gl.material = gl.material.clone(); gl.material.transparent = true; gl.material.opacity = 0.35; part(pod, Cy(0.7, 0.7, 0.3, 10), '#d8e8ec', 0, 2.3, 0); pod.position.set(far, 0, cz - 2); props.add(pod); solid(far, cz - 2, 0.7);
        INTERACTS.push({ x: far - s.side * 1.1, z: cz - 2, r: 2.0, label: 'Healing pod', fn: () => { player.hp = maxHp(); toast('HEALED', 'Good as new'); SFX.quest(); } });
        { const cr = new THREE.Group(); part(cr, B(0.9, 0.25, 0.05), glow('#ff3b2a'), 0, 0, 0); part(cr, B(0.25, 0.9, 0.05), glow('#ff3b2a'), 0, 0, 0); cr.position.set(outer - s.side * 0.2, 2.2, cz); cr.rotation.y = faceIn; props.add(cr); }
        part(props, B(0.8, 0.5, 2.0), '#d8e8ec', cx, 0.5, cz + 2.8); part(props, B(0.75, 0.1, 1.9), toon('#e8e4dc', 'cloth'), cx, 0.8, cz + 2.8); box(cx, cz + 2.8, 0.4, 1.0);
        term(far, cz + 1.2, '#4fffe0', 'Stim station (armor stim)', useStim, faceIn);
      }
      if (id === 'trophy') {
        const tro = trophyList(); tro.forEach((tr, i) => { const z = cz - 3.5 + i * 1.4; part(props, Cy(0.35, 0.45, 1.0, 8), toonNS('#d8d2c8', 'marble'), far, 0.5, z); part(props, Cy(0.38, 0.38, 0.05, 8), toon('#c9a43a'), far, 1.02, z); const m = part(props, new THREE.OctahedronGeometry(0.28, 0), glow(tr.col), far, 1.4, z); levelAnims.push(t => { m.rotation.y = t + i; }); solid(far, z, 0.45); });
        part(props, B(1.6, 0.04, 8.4), toonNS('#8a1e24', 'carpet'), cx, 0.02, cz);
        INTERACTS.push({ x: far - s.side * 1.2, z: cz, r: 2.4, label: 'Trophies', fn: () => { openDlg('Trophy Hall', 'Your victories'); $('dlgLine').textContent = trophyList().map(t => t.name).join(' · ') || 'Beat bosses to fill the hall.'; acts([['Close', closeDlg]]); } });
        term(cx, s.z0 + 0.6, '#ffd36a', 'Hall of Records (leaderboards)', () => openLeaders(0), 0);
      }
      if (id === 'garden') {
        for (let i = 0; i < 6; i++) { const z = cz - 3.5 + i * 1.4; part(props, B(1.2, 0.5, 1.0), toon('#6a4f34', 'wood'), far, 0.25, z); part(props, B(1.1, 0.05, 0.9), toon('#3a2a1e', 'grime'), far, 0.51, z); part(props, new THREE.IcosahedronGeometry(0.42, 0), toon(i % 2 ? '#6f9a3e' : '#4f8a3a', 'leaves'), far, 0.88, z); if (i % 2) part(props, new THREE.SphereGeometry(0.07, 6, 4), toon('#ff6a3a'), far + 0.15, 1.05, z + 0.1); }
        box(far, cz, 0.6, 4.2); INTERACTS.push({ x: far - s.side * 1.2, z: cz, r: 2.4, label: 'Harvest garden', fn: harvestGarden });
        { const tank = new THREE.Group(); part(tank, B(1.6, 0.4, 0.8), '#3a3d44', 0, 0.2, 0); const w = part(tank, B(1.5, 1.0, 0.7), new THREE.MeshBasicMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.9, 0); for (let f = 0; f < 3; f++) { const fish = part(tank, B(0.12, 0.06, 0.03), glow(['#ff9a3c', '#ffd36a', '#ff6aa8'][f]), 0, 0.9, 0); levelAnims.push(t => { fish.position.x = Math.sin(t * 0.8 + f * 2) * 0.6; fish.position.y = 0.75 + f * 0.15 + Math.sin(t * 1.3 + f) * 0.05; fish.rotation.y = Math.cos(t * 0.8 + f * 2) > 0 ? 0 : Math.PI; }); } tank.position.set(cx, 0, s.z1 - 0.6); props.add(tank); box(cx, s.z1 - 0.6, 0.8, 0.4); }
      }
      if (id === 'lab') labRoom(s, cx, cz, far, outer, faceIn, term, props);
      if (id === 'range' && typeof rangeRoom === 'function') rangeRoom(s, cx, cz, outer, term, props);
      if (id === 'hangar') {
        part(props, B(0.2, 2.8, 6), toon('#c9a43a', 'hazard'), outer - s.side * 0.12, 1.4, cz);
        // the pad sits clearly above the deck so the stripes never flicker into the floor (2.14.4)
        part(props, B(5, 0.04, 5), toon('#ffd36a', 'hazard'), cx, 0.02, cz); part(props, B(4.4, 0.04, 4.4), toonNS('#4a4e56', 'tread'), cx, 0.05, cz);
        if (typeof hangarDress === 'function') hangarDress(s, cx, cz, outer, props);
        if (typeof bikeOwned === 'function' && bikeOwned()) { const bike = new THREE.Group(); part(bike, B(0.6, 0.4, 2), '#8a3a2e', 0, 0.7, 0); part(bike, Cy(0.35, 0.35, 0.2, 10), C.dark, 0, 0.35, 0.8, 0, 0, Math.PI / 2); part(bike, Cy(0.35, 0.35, 0.2, 10), C.dark, 0, 0.35, -0.8, 0, 0, Math.PI / 2); part(bike, B(0.5, 0.3, 0.6), '#3a3d44', 0, 1.0, -0.4); bike.position.set(cx - s.side * 3.6, 0, cz - 3.3); props.add(bike); box(cx - s.side * 3.6, cz - 3.3, 0.4, 1.1); }
        term(cx, s.z0 + 0.6, '#4fd2ff', 'Vehicle bay', () => openVehicleBay(), 0);
        term(cx, s.z1 - 0.6, '#ffd36a', 'Launch from the hangar', () => enterSpace(S.orbit || 'earth'), Math.PI);
      }
    });
    // planet outside the window
    const pl = new THREE.Mesh(new THREE.SphereGeometry(40, 20, 14), new THREE.MeshBasicMaterial({ map: planetTex(S.orbit || 'earth'), fog: false }));
    pl.position.set(-10, -14, -95); levelGroup.add(pl); levelAnims.push(t => { pl.rotation.y = t * 0.02; });
    const lamp = new THREE.PointLight(0xcfe6ff, 0.8, 30, 1.5); lamp.position.set(0, 2.8, 4); levelGroup.add(lamp);
    const lamp2 = new THREE.PointLight(0x8fb8ff, 0.7, 24, 1.5); lamp2.position.set(0, 2.8, -9); levelGroup.add(lamp2);
  }
};
const planetTexCache = {};
// equirectangular planet maps from wrapped fractal noise, with a palette ramp per world
const PLANET_LOOK = {
  earth: { seed: 3, ramp: [[0, '#1a3a7a'], [0.47, '#2a5aa8'], [0.52, '#d8c890'], [0.55, '#4f8a3a'], [0.68, '#3a6a2e'], [0.78, '#8a7a5a'], [0.88, '#e8e4dc']], caps: 0.86, clouds: '#ffffff' },
  mezar: { seed: 7, ramp: [[0,"#8a5a36"],[0.4,"#c48a52"],[0.55,"#e0b070"],[0.7,"#f0d0a0"],[0.85,"#b8703a"]], bands: 0.6 },
  capitone: { seed: 11, ramp: [[0, '#1a4a5a'], [0.44, '#2a6a7a'], [0.5, '#2f6a4a'], [0.62, '#3f8a52'], [0.72, '#dce8f0'], [0.9, '#ffffff']], caps: 0.7, clouds: '#eef4f8', lava: '#ff6a1a' },
  robot: { seed: 17, ramp: [[0, '#2b2a2c'], [0.5, '#4a4e56'], [0.7, '#5d636c'], [0.9, '#8a8f96']], grid: '#ff3b2a' },
  moon: { seed: 23, ramp: [[0, '#5a5a60'], [0.5, '#8a8a90'], [0.7, '#b0b0b4'], [1, '#d0d0d4']], craters: true },
  ocean: { seed: 29, ramp: [[0, '#0a3a5a'], [0.6, '#1a6a8a'], [0.72, '#2a8a9a'], [0.76, '#3f8a52'], [0.85, '#5fa04a']], clouds: '#ffffff', glowDots: '#4fffe0' },
  zarlich: { seed: 31, ramp: [[0, '#3a1e4a'], [0.45, '#6a3a8a'], [0.6, '#c86aff'], [0.8, '#f0c0ff']], bands: 0.8 },
  vector: { seed: 37, ramp: [[0, '#05050a'], [0.55, '#14121e'], [0.7, '#2a1e3a'], [0.9, '#5a2a6a']], grid: '#c86aff' }
};
function pnoise(seed) {
  const h = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453; return n - Math.floor(n); };
  const v = (x, y, W) => { const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), wx = (k) => ((k % W) + W) % W;
    const a = h(wx(x0), y0), b = h(wx(x0 + 1), y0), c = h(wx(x0), y0 + 1), d = h(wx(x0 + 1), y0 + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  return (x, y) => { let s = 0, amp = 0.5, f = 1; for (let o = 0; o < 5; o++) { s += v(x * f * 8, y * f * 8, 8 * f) * amp; amp *= 0.5; f *= 2; } return s / 0.97; };
}
function planetTex(id, kind) {
  const key = id + (kind || ''); if (planetTexCache[key]) return planetTexCache[key];
  const L = PLANET_LOOK[id] || PLANET_LOOK.moon, W = 256, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), img = x.createImageData(W, H), n = pnoise(L.seed), n2 = pnoise(L.seed + 5);
  const ramp = L.ramp.map(([t, c]) => [t, new THREE.Color(c)]), col = new THREE.Color(), cc = new THREE.Color();
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const u = i / W, v = j / H, lat = Math.abs(v - 0.5) * 2; let e = n(u, v * 0.5);
    if (kind === 'clouds') { const c = n2(u * 1.3, v * 0.6); const a = clamp((c - 0.52) * 4, 0, 1) * 0.85; const k = (j * W + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = a * 255; continue; }
    if (L.bands) e = e * (1 - L.bands) + (0.5 + 0.5 * Math.sin(v * 22 + n2(u, v) * 6)) * L.bands;
    let k0 = 0; while (k0 < ramp.length - 1 && e > ramp[k0 + 1][0]) k0++;
    const a = ramp[k0], b = ramp[Math.min(k0 + 1, ramp.length - 1)], t = b === a ? 0 : clamp((e - a[0]) / (b[0] - a[0]), 0, 1); col.copy(a[1]).lerp(b[1], t * t);
    if (L.caps && lat > L.caps - n2(u, v) * 0.1) col.set('#f4f8ff');
    if (L.lava && e > 0.66 && n2(u * 2, v) > 0.72) col.set(L.lava);
    if (L.grid && (i % 16 === 0 || j % 12 === 0) && n2(u, v) > 0.45) col.lerp(cc.set(L.grid), 0.8);
    if (L.glowDots && e > 0.75 && (i * 7 + j * 13) % 23 === 0) col.set(L.glowDots);
    if (L.craters) { const c = n2(u * 3, v * 1.5); if (c > 0.68) col.multiplyScalar(0.7 + (c - 0.68)); }
    col.offsetHSL(0, 0, (n2(u * 4, v * 2) - 0.5) * 0.06);
    const k = (j * W + i) * 4; img.data[k] = col.r * 255; img.data[k + 1] = col.g * 255; img.data[k + 2] = col.b * 255; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.minFilter = THREE.NearestFilter; tx.magFilter = THREE.NearestFilter; tx.wrapS = THREE.RepeatWrapping;
  planetTexCache[key] = tx; return tx;
}
function trophyList() {
  const out = [];
  if (qDone('q4')) out.push({ name: "Gor-Tak's spear tip", col: '#ff8a3a' });
  if (qDone('q5')) out.push({ name: "Drome's sigil", col: '#ff2a3a' });
  if (qDone('m5')) out.push({ name: "Matriarch's heart", col: '#c86aff' });
  if (qDone('c5')) out.push({ name: "Frost King's crown", col: '#9fe8ff' });
  if (qDone('r5')) out.push({ name: 'Overseer core', col: '#ffd23a' });
  if (qDone('o5')) out.push({ name: "Leviathan's eye", col: '#4fffe0' });
  return out;
}
function harvestGarden() {
  const now = Date.now(), last = S.ship.garden || 0, ready = Math.floor((now - last) / gardenEvery()), most = gardenMax();
  openDlg('Hydro Garden', 'Harvest');
  if (!last) { S.ship.garden = now; $('dlgLine').textContent = `Seeds planted. A medkit grows every ${Math.round(gardenEvery() / 60000)} minutes, up to ${most} at a time.`; markDirty(); }
  else if (ready > 0) { const n = Math.min(most, ready); S.inv.medkit = (S.inv.medkit || 0) + n; S.ship.garden = now; $('dlgLine').textContent = `You harvested ${n} medkit${n > 1 ? 's' : ''}.`; SFX.item(); markDirty(); }
  else $('dlgLine').textContent = 'Nothing ripe yet. Check back in a few minutes.';
  acts([['Close', closeDlg]]);
}

// ---------------- loading, travel ----------------
function disposeTree(o) { o.traverse(c => { if (c.geometry && c.geometry !== BLOB_GEO) c.geometry.dispose(); if (c.isSprite && c.material.map) { c.material.map.dispose(); c.material.dispose(); } }); }
let DEV_ALL = false; // tester unlock, read from the player's private data/users/<id>/dev doc
function shipUnlocked() { return DEV_ALL || !!(S.ship && S.ship.unlocked); }
function loadLevel(id, opts) {
  opts = opts || {};
  const L = LEVELS[id] || LEVELS.earth; LEVEL = L;
  if (levelGroup) { scene.remove(levelGroup); disposeTree(levelGroup); }
  levelGroup = new THREE.Group(); scene.add(levelGroup); levelAnims.length = 0;
  for (const e of enemies) { scene.remove(e.obj); disposeTree(e.obj); } enemies.length = 0;
  for (const d of drops) scene.remove(d.g); drops.length = 0; for (const s of shots) scene.remove(s.m); shots.length = 0;
  for (const k in npcObjs) { scene.remove(npcObjs[k].obj); delete npcObjs[k]; }
  for (const g of baseState.groups.values()) { scene.remove(g); disposeTree(g); } baseState.groups.clear(); baseState.data.clear();
  for (const r of remotes.values()) { scene.remove(r.obj); disposeTree(r.obj); } remotes.clear();
  [CIRCLES, BOXES, RINGS, SAFES, INTERACTS, SURFACES, BASE_BOXES, MOVERS].forEach(a => { a.length = 0; });
  ZONES.length = 0; L.zones.forEach(z => ZONES.push(Object.assign({}, z))); for (const k in Z) delete Z[k]; ZONES.forEach(z => { Z[z.id] = z; });
  PATHS.length = 0; L.paths.forEach(p => PATHS.push(p)); RIVER.length = 0; L.river.forEach(p => RIVER.push(p));
  POOLS.length = 0; L.pools.forEach(p => POOLS.push(p)); LAVA.length = 0; L.lava.forEach(p => LAVA.push(p));
  WATER_Y = L.water; WORLD_C.set(L.center[0], 0, L.center[1]); WORLD_R = L.radius;
  L.safes.forEach(s => SAFES.push(s));
  // lava sits on the ground: if the land under a lava pool is lower than the usual lava level, drop the pool to it (no more floating lava)
  if (L.terrain) for (const l of LAVA) if (l[3] == null) { const keep = LAVA.splice(0); const nat = heightExact(l[0], l[1]); keep.forEach(k => LAVA.push(k)); if (nat < 2.2) l[3] = nat + 0.3; }
  buildHeightGrid();
  if (L.terrain) levelGroup.add(makeGround());
  levelGroup.add(makeWater());
  props = new THREE.Group(); levelGroup.add(props);
  L.build();
  if (typeof detailLevel === 'function') { try { detailLevel(L, id); } catch (err) { console.warn('detail', err); } }
  buildFishSpots(id);
  mergeStatic(props);
  for (const n of L.npcs) makeNpc(n, L.npcBase);
  for (const sp of L.spawns) for (let i = 0; i < sp.n; i++) makeEnemy(sp);
  if (!L.ocean) S.inSub = false; if (typeof RC !== 'undefined') { if (RC.ai) RC.ai.forEach(A => A.obj.parent && A.obj.parent.remove(A.obj)); RC = { on: false }; }
  camera.near = L.fly ? 0.5 : 0.03; camera.far = L.fly ? 7000 : 300; camera.updateProjectionMatrix(); if (!L.fly) fly = null;
  if (L.fly) { if (player.groundHp == null) player.groundHp = player.hp; } else if (player.groundHp != null) { player.hp = player.groundHp; player.groundHp = null; }
  if (['earth', 'mezar', 'capitone', 'zeltac', 'arena', 'robot', 'ocean', 'moon', 'speedway'].includes(id)) S.orbit = id;
  const sp = opts.at || L.spawn; player.pos.set(sp.x, sp.y != null ? sp.y : floorAt(sp.x, sp.z), sp.z); player.yaw = sp.yaw != null ? sp.yaw : player.yaw; player.pitch = 0; player.vy = 0;
  if (id === 'earth') { S.base = cleanPieces(S.base); renderBase('me', S.base, S.col, true); for (const [k, v] of baseCache) renderBase(k, v.pieces, v.col, false); }
  if (id === 'ship') { S.shipBase = cleanPieces(S.shipBase || []); renderBase('ship', S.shipBase, S.col, true); }
  if (L.fly) player.hp = Math.min(player.hp > 0 && player.groundHp != null && opts.keepHull ? player.hp : hullMax(), hullMax());
  $('buildBtn').hidden = !(id === 'earth' || id === 'ship');
  S.where = L.fly ? 'ship' : id; zoneShown = null; zoneT = 0; $('zone').style.opacity = 0; setBuild(false);
  refreshNpcs(); renderQuest();
  if (typeof sendPresence === 'function') sendPresence(true);
  if (typeof spawnPet === 'function') spawnPet();
  if (typeof bountyOnLoad === 'function') bountyOnLoad();
  const bb = document.getElementById('bikeBtn'); if (bb) bb.hidden = !(bikeOwned() && L.terrain);
}
const resumeWhere = () => S.where && planetOpen(S.where) ? S.where : shipUnlocked() ? 'ship' : 'earth';
function travel(id, opts) {
  SFX.warp();
  const fade = $('fade'); fade.hidden = false; fade.style.opacity = 1; $('fadeTxt').textContent = id === 'ship' ? 'Boarding the Setting Sun…' : id === 'space' ? 'Taking the helm…' : id === 'zeltac' ? 'Docking at the Zeltac Ship…' : id === 'maw' ? 'Entering the wormhole…' : `Landing on ${LEVELS[id].name}…`;
  SFX.ui();
  setTimeout(() => { loadLevel(id, opts); markDirty(); setTimeout(() => { fade.style.opacity = 0; setTimeout(() => { fade.hidden = true; }, 400); toast(LEVELS[id].name.toUpperCase(), LEVELS[id].tag, 3); burp(id === 'ship' ? 'ship' : id === 'space' ? 'space' : 'land'); }, 150); }, 450);
}
function boardShip() { if (!shipUnlocked()) { log('Your ship is not ready yet.'); return; } closeDlg(); travel('ship'); }
const PLANET_ORDER = ['earth', 'zeltac', 'mezar', 'capitone', 'robot'];
function planetOpen(id) {
  if (id === 'earth') return true;
  if (!LEVELS[id]) return false;
  if (DEV_ALL) return true;
  if (id === 'mezar' || id === 'zeltac' || id === 'space' || id === 'ship' || id === 'arena') return shipUnlocked();
  if (id === 'capitone') return qDone('m5') || qState('c1');
  if (id === 'robot') return qDone('c5') || qState('r1');
  if (id === 'moon' || id === 'speedway') return shipUnlocked();
  if (id === 'ocean') return shipUnlocked() && !!((S.flags && S.flags.scan_ocean) || qDone('c5') || qState('o1'));
  return false;
}
function openGalaxy() {
  openDlg('Navigation', 'Galaxy map');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  $('dlgLine').textContent = 'Autopilot: pick a world and the ship flies you there. Or take the helm and fly yourself.';
  PLANET_ORDER.forEach(id => {
    const L = LEVELS[id], r = document.createElement('div'); r.className = 'rowi';
    const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = { earth: '#4f8a3a', zeltac: '#8fe3ff', mezar: '#d49a5a', capitone: '#9fe8ff', robot: '#c8402f' }[id];
    const nm = document.createElement('span'); nm.textContent = L ? `${L.name} · ${L.tag}` : { capitone: 'Capitone · coming soon', robot: 'Robot City · coming soon' }[id];
    const mt = document.createElement('span'); mt.className = 'meta'; mt.textContent = L ? L.lvls : '';
    const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px';
    const open = planetOpen(id); b.textContent = open ? 'Go' : 'Locked'; b.disabled = !open;
    b.addEventListener('click', () => { S.orbit = id; closeDlg(); travel(id); });
    r.append(dot, nm, mt, b); rows.appendChild(r);
  });
  $('dlgActs').before(rows); acts([['Take the helm', () => { closeDlg(); enterSpace(S.orbit || 'earth'); }, true], ['Close', closeDlg]]);
}
function costOk(c) { return Object.entries(c).every(([k, n]) => k === 'cr' ? S.cr >= n : (S.inv[k] || 0) >= n); }
function costPay(c) { for (const [k, n] of Object.entries(c)) { if (k === 'cr') S.cr -= n; else { S.inv[k] -= n; if (!S.inv[k]) delete S.inv[k]; } } }
const costLabel = (c) => Object.entries(c).map(([k, n]) => k === 'cr' ? `${n} cr` : `${n} ${(ITEMS[k] && ITEMS[k].name) || k}`).join(' + ') || 'Free';
function openShipTerminal() {
  openDlg('Engineering', 'Ship upgrades');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    rows.textContent = '';
    $('dlgLine').textContent = `Add rooms to grow your ship. ${S.cr} cr on hand.`;
    Object.entries(ROOMS).forEach(([id, R]) => {
      if (R.fixed || (R.hide && R.hide() && !S.ship.rooms.includes(id))) return;
      const own = S.ship.rooms.includes(id), r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = own ? '#6fdc5a' : '#8fe3ff';
      const nm = document.createElement('span'); nm.textContent = `${R.name} — ${R.desc}`;
      const lv = roomLvl(id), nc = own && lv < 5 ? roomUpCost(id, lv + 1) : null; if (own) nm.textContent = `${R.name} · Level ${lv}${lv < 5 ? ` → ${lv + 1}: ${roomUpText(id, lv + 1)}` : ' (max): ' + roomUpText(id, 5)}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.textContent = own ? (nc ? costLabel(nc) : 'Maxed') : costLabel(R.cost);
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = own ? (nc ? 'Upgrade' : '✓') : 'Build'; b.disabled = own ? !nc || !costOk(nc) : !costOk(R.cost);
      if (own) { if (nc) b.addEventListener('click', () => roomUpgrade(id)); r.append(dot, nm, mt, b); rows.appendChild(r); return; }
      b.addEventListener('click', () => { costPay(R.cost); S.ship.rooms.push(id); markDirty(); SFX.level(); closeDlg(); loadLevel('ship', { at: { x: player.pos.x, z: player.pos.z, yaw: player.yaw } }); toast('ROOM ADDED', R.name); if (typeof burp === 'function') burp('room'); });
      r.append(dot, nm, mt, b); rows.appendChild(r);
    });
  };
  $('dlgActs').before(rows); acts([['Ship systems', () => openShipSystems(), true], ['Close', closeDlg]]); render();
}
function searchWreck() {
  if (qState('m4') && qState('m4').st === 'active' && !(S.inv.blackbox > 0)) { S.inv.blackbox = 1; log('+1 Flight Recorder', 'loot'); SFX.item(); toast('FOUND', 'Flight Recorder'); checkReady(); markDirty(); return; }
  openDlg('Crashed ship', 'Wreck'); $('dlgLine').textContent = qDone('m4') ? 'Lt. Sela\'s ship. Nothing left but sand and scorched panels.' : 'A downed Earth transport. The cockpit is sealed shut. Maybe someone knows about this ship.'; acts([['Leave', closeDlg]]);
}

