// =================== WORLD CORE ===================
// Every planet (and the ship) is a LEVEL config. The terrain generator is shared: rolling noise,
// terraced cliffs, zones flattened to their own heights, roads that ramp through the terraces,
// rivers, pools and lava. Containers below are refilled in place when a level loads.
let WATER_Y = -0.45;
let LEVEL = null;
const ZONES = [], Z = {}, PATHS = [], RIVER = [], POOLS = [], LAVA = [];
const MOVERS = [], SURFACES = [], BASE_BOXES = [], CIRCLES = [], BOXES = [], RINGS = [], SAFES = [], INTERACTS = [];
const WORLD_C = V(0, 0, 14); let WORLD_R = 92;
function segDist(px, pz, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1);
  return Math.hypot(px - a[0] - dx * t, pz - a[1] - dz * t);
}
const polyDist = (x, z, pts) => { let d = 1e9; for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, segDist(x, z, pts[i], pts[i + 1])); return d; };
const roadDist = (x, z) => { let d = 1e9; for (const [a, b] of PATHS) d = Math.min(d, segDist(x, z, a, b)); return d; };
function terrace(h, step) { const t = Math.floor(h / step), f = h / step - t; return (t + smooth(f, 0.38, 0.62)) * step; }
function heightExact(x, z) {
  const T = LEVEL.terrain; if (!T) return 0;
  let h = T.a1 * Math.sin(x * T.f1 + 1.2) * Math.cos(z * T.f1 * 0.85 + 0.4) + T.a2 * Math.sin(x * T.f2 - z * T.f2 * 0.75 + 2.1) + T.a3 * Math.sin(x * T.f3 + z * T.f3 * 0.8) + T.base;
  h = Math.max(h, T.min != null ? T.min : 0.1);
  const e = smooth(Math.hypot(x - WORLD_C.x, z - WORLD_C.z), WORLD_R - 6, WORLD_R + 20); h += e * e * (T.edge || 26);
  let interior = 0;
  for (const zn of ZONES) {
    const d = Math.hypot(x - zn.x, z - zn.z), fr = zn.fr || zn.r * 0.75;
    const w = 1 - smooth(d, fr, fr + 9); if (w <= 0) continue;
    let zh = zn.h;
    if (zn.dunes) zh += 0.5 * Math.sin(x * 0.35 + z * 0.12) * Math.sin(z * 0.27);
    h = h * (1 - w) + zh * w; interior = Math.max(interior, smooth(1 - d / fr, 0, 0.25));
  }
  if (!T.noTerrace) { const k = Math.min(smooth(roadDist(x, z), 2.6, 6.5), 1 - interior); h = h * (1 - k) + terrace(h, T.step || 1.6) * k; }
  // rivers and pools always dig below this world's water line, so they hold water (a high water line left Zarlich's lake dry)
  const wl = WATER_Y > -50 ? WATER_Y : 0, rb = Math.min(-1.5, wl - 0.7), pb = Math.min(-1.0, wl - 0.6);
  const rv = polyDist(x, z, RIVER); if (rv < 6) h = Math.min(h, rb + (h - rb) * smooth(rv, 1.8, 4.6));
  for (const [px, pz, pr] of POOLS) { const d = Math.hypot(x - px, z - pz); if (d < pr + 2) h = Math.min(h, pb + (h - pb) * smooth(d, pr * 0.6, pr + 1.5)); }
  for (const [px, pz, pr, ly] of LAVA) { const base = (ly != null ? ly : 2.55) - 0.35; const d = Math.hypot(x - px, z - pz); if (d < pr + 1.5) h = Math.min(h, base + (h - base) * smooth(d, pr * 0.7, pr + 1.2)); }
  if (LEVEL.carve) h = LEVEL.carve(x, z, h);
  return h;
}
const HG = { x0: 0, z0: 0, n: 2, a: new Float32Array(4) };
let FRONT = null; // the Fort Ironrock trench field (front.js) takes over the ground inside its patch
function buildHeightGrid() {
  const size = LEVEL.size || 280; HG.n = size + 1; HG.x0 = WORLD_C.x - size / 2; HG.z0 = WORLD_C.z - size / 2;
  // the ground never changes for a given world, so the grid is computed once per visit and reused after that
  const key = LEVEL.id + ':' + size + ':' + HG.x0 + ':' + HG.z0 + ':' + ZONES.length; HG.cache = HG.cache || {};
  if (HG.cache[key]) { HG.a = HG.cache[key]; return; }
  HG.a = new Float32Array(HG.n * HG.n);
  for (let j = 0; j < HG.n; j++) for (let i = 0; i < HG.n; i++) HG.a[j * HG.n + i] = heightExact(HG.x0 + i, HG.z0 + j);
  HG.cache[key] = HG.a;
}
function groundH(x, z) {
  if (FRONT && FRONT.on && x > FRONT.x0 && x < FRONT.x1 && z > FRONT.z0 && z < FRONT.z1) return FRONT.h(x, z);
  const fx = clamp(x - HG.x0, 0, HG.n - 1.001), fz = clamp(z - HG.z0, 0, HG.n - 1.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, n = HG.n, a = HG.a;
  return (a[j * n + i] * (1 - u) + a[j * n + i + 1] * u) * (1 - v) + (a[(j + 1) * n + i] * (1 - u) + a[(j + 1) * n + i + 1] * u) * v;
}
function floorAt(x, z) {
  let h = groundH(x, z);
  for (const s of SURFACES) {
    const dx = x - s.x, dz = z - s.z, a = dx * s.ux + dz * s.uz, b = -dx * s.uz + dz * s.ux;
    if (s.minY != null && player.pos.y < s.minY) continue; // raised walkways only catch you once you're up there
    if (Math.abs(a) <= s.hl && Math.abs(b) <= s.hw) h = Math.max(h, s.y + a * (s.slope || 0));
  }
  return h;
}
function zoneAt(x, z) { for (const zn of ZONES) if (Math.hypot(x - zn.x, z - zn.z) < zn.r) return zn; return null; }
const inSafe = (p) => { for (const s of SAFES) if (Math.hypot(p.x - s.x, p.z - s.z) < s.r) return true; return false; };

function makeGround() {
  const size = LEVEL.size || 280, segs = size / 2;
  const geo = new THREE.PlaneGeometry(size, size, segs, segs); geo.rotateX(-Math.PI / 2); geo.translate(WORLD_C.x, 0, WORLD_C.z);
  const p = geo.attributes.position, cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal, P = LEVEL.palette;
  const grass = new THREE.Color(P.grass), dirt = new THREE.Color(P.dirt), sand = new THREE.Color(P.sand), wet = new THREE.Color(P.wet),
    rockA = new THREE.Color(P.rockA), rockB = new THREE.Color(P.rockB), snow = new THREE.Color(P.snow || '#e8e4dc'), ash = new THREE.Color('#2e2422'), patch = new THREE.Color(P.patch || P.grass), c = new THREE.Color();
  const zc = ZONES.map(z => new THREE.Color(z.col));
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), h = p.getY(i), ny = nrm.getY(i);
    c.copy(grass);
    if (P.patch) c.lerp(patch, smooth(Math.sin(x * 0.07) * Math.cos(z * 0.06), 0.2, 0.7) * 0.6);
    if (P.snowZ != null) c.lerp(snow, smooth(z + Math.sin(x * 0.2) * 3, P.snowZ, P.snowZ + 10));
    ZONES.forEach((zn, k) => { const w = 1 - smooth(Math.hypot(x - zn.x, z - zn.z), zn.r * 0.55, zn.r * 1.2); if (w > 0) c.lerp(zc[k], w); });
    c.lerp(dirt, 1 - smooth(roadDist(x, z), 1.2, 2.6));
    if (WATER_Y > -50 && h < WATER_Y + 0.55) c.lerp(sand, 1 - smooth(h, WATER_Y + 0.25, WATER_Y + 0.55));
    if (WATER_Y > -50 && h < WATER_Y - 0.2) c.lerp(wet, 0.7);
    for (const [px, pz, pr] of LAVA) { const d = Math.hypot(x - px, z - pz); if (d < pr + 1.6) c.lerp(ash, 1 - smooth(d, pr, pr + 1.6)); }
    const steep = smooth(1 - ny, 0.18, 0.32);
    if (steep > 0) c.lerp(Math.floor(h / 0.55) % 2 ? rockA : rockB, steep);
    if (P.snowLine != null && h > P.snowLine) c.lerp(snow, smooth(h, P.snowLine, P.snowLine + 4));
    c.offsetHSL(0, 0, (Math.sin(x * 0.7) * Math.cos(z * 0.6)) * 0.02);
    const lc = c.clone().convertSRGBToLinear(); cols[i * 3] = lc.r; cols[i * 3 + 1] = lc.g; cols[i * 3 + 2] = lc.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * size / 4, uv.getY(i) * size / 4);
  return new THREE.Mesh(geo, psx(new THREE.MeshLambertMaterial({ vertexColors: true, map: TEX.grass })));
}
const WATER_MAT = psx(new THREE.MeshLambertMaterial({ map: TEX.water, color: new THREE.Color('#6fb7da').convertSRGBToLinear(), transparent: true, opacity: 0.8, depthWrite: false }));
const LAVA_MAT = psx(new THREE.MeshBasicMaterial({ map: TEX.lava }));
function makeWater() {
  const g = new THREE.Group(), size = LEVEL.size || 280;
  if (WATER_Y > -50) {
    const geo = new THREE.PlaneGeometry(size, size, size / 4, size / 4); geo.rotateX(-Math.PI / 2); geo.translate(WORLD_C.x, WATER_Y, WORLD_C.z);
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * size / 4.6, uv.getY(i) * size / 4.6);
    g.add(new THREE.Mesh(geo, WATER_MAT));
  }
  for (const [px, pz, pr, ly] of LAVA) { const lg = new THREE.CircleGeometry(pr + 0.6, 14); lg.rotateX(-Math.PI / 2); const m = new THREE.Mesh(lg, LAVA_MAT); m.position.set(px, ly != null ? ly : 2.55, pz); g.add(m); }
  return g;
}


// walls, buildings, rocks and terrain block shots and attacks
function blockedAt(x, y, z) {
  const g = groundH(x, z); if (y < g - 0.05) return true;
  if (y > g + 3.4) return false;
  for (const [cx, cz, hx, hz] of BOXES) if (Math.abs(x - cx) < hx && Math.abs(z - cz) < hz) return true;
  for (const [cx, cz, hx, hz] of BASE_BOXES) if (Math.abs(x - cx) < hx && Math.abs(z - cz) < hz && y < g + 2.4) return true;
  if (y < g + 2.2) for (const [cx, cz, cr] of CIRCLES) if (cr > 0.25 && (x - cx) * (x - cx) + (z - cz) * (z - cz) < cr * cr * 0.8) return true;
  for (const R of RINGS) { const tx = x - R.x, tz = z - R.z, tr = Math.hypot(tx, tz); if (Math.abs(tr - R.r) < 0.45) { const a = Math.atan2(tz, tx), d = Math.atan2(Math.sin(a - R.gate), Math.cos(a - R.gate)); if (Math.abs(d * R.r) > R.half) return true; } }
  return false;
}
// distance along a ray before something solid gets in the way (or max)
function rayClear(o, dir, max) {
  for (let t = 0.6; t < max; t += 0.4) { if (blockedAt(o.x + dir.x * t, o.y + dir.y * t, o.z + dir.z * t)) return t; }
  return max;
}
function lineOfSight(a, b) { const d = b.clone().sub(a), L = d.length(); if (L < 1.2) return true; d.divideScalar(L); return rayClear(a, d, L - 0.6) >= L - 0.6; }
