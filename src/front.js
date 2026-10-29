// =================== THE FRONT (2.23.73): the trench battlefield west of Fort Ironrock ===================
// Owns the trench layout, its fine ground mesh (groundH reads FRONT.h inside the patch), wall blocking, ladders,
// the dressing, our troopers on the fire step, the Drome garrison and the skirmish waves that test the line.
// Our trench runs north-south at x = -40 and faces west; theirs is at x = -121 and faces east.
FRONT = { on: false, raw: false, x0: -140, x1: -14, z0: -30, z1: 84, D: 1.9, STEP: 0.95, rects: [], ladders: [], craters: [], men: [], bays: [], ebays: [], base: null, bw: 0, last: null, foes: [], waveT: 20, t: 0 };
(function frontLayout() {
  const R = FRONT.rects, add = (x0, x1, z0, z1, o) => { const r = Object.assign({ x0, x1, z0, z1 }, o || {}); R.push(r); return r; };
  for (const side of [1, -1]) { // 1 = ours (east), -1 = Drome (west)
    const bays = side > 0 ? FRONT.bays : FRONT.ebays;
    for (let k = 0; k < 10; k++) {
      const cx = side > 0 ? (k % 2 ? -42.5 : -40) : (k % 2 ? -119.5 : -122), z0 = -14 + k * 8;
      bays.push(add(cx - 1, cx + 1, z0, z0 + 6, { step: -side, bay: k, ours: side > 0, cx }));
      if (k < 9) { const nx = side > 0 ? (k % 2 ? -40 : -42.5) : (k % 2 ? -122 : -119.5); add(Math.min(cx, nx) - 1, Math.max(cx, nx) + 1, z0 + 6, z0 + 8, { ours: side > 0 }); }
    }
  }
  // communication trench from bay 4 back toward the fort, ending in a ramp
  add(-39, -31, 20, 22, { ours: true, comm: true }); add(-33, -31, 20, 26, { ours: true, comm: true }); add(-33, -25, 24, 26, { ours: true, comm: true });
  add(-25, -17, 24, 26, { ours: true, comm: true, ramp: 1 });
  // the Drome supply trench out the back of their bay 5
  add(-131, -123, 27, 29, { ours: false, ramp: -1 });
  // shell craters in no-man's-land (seeded so every visit matches)
  let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 24; i++) FRONT.craters.push([-108 + rnd() * 54, -12 + rnd() * 76, 1.8 + rnd() * 2.6, 0.5 + rnd() * 0.8]);
  for (const b of FRONT.bays) FRONT.ladders.push([b.x0 + 0.2, (b.z0 + b.z1) / 2]);
  for (const b of FRONT.ebays) FRONT.ladders.push([b.x1 - 0.2, (b.z0 + b.z1) / 2]);
})();
FRONT.inPatch = (x, z) => x > FRONT.x0 && x < FRONT.x1 && z > FRONT.z0 && z < FRONT.z1;
// how deep the ground is cut at a point (negative = raised crater rim)
FRONT.carve = function (x, z) {
  let c = 0;
  for (const r of this.rects) { if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
    let d = this.D; if (r.ramp) d *= clamp(r.ramp > 0 ? (r.x1 - x) / (r.x1 - r.x0) : (x - r.x0) / (r.x1 - r.x0), 0, 1);
    else if (r.step) { const sd = r.step < 0 ? x - r.x0 : r.x1 - x; if (sd < 0.7) d -= this.STEP; }
    if (d > c) c = d; }
  if (c) return c;
  for (const [cx, cz, cr, dep] of this.craters) { const dx = x - cx, dz = z - cz; if (Math.abs(dx) > cr * 1.35 || Math.abs(dz) > cr * 1.35) continue; const q = Math.hypot(dx, dz) / cr;
    if (q < 1) c = Math.max(c, dep * (1 - q * q)); else if (q < 1.35) c = Math.min(c, -0.22 * Math.sin((q - 1) / 0.35 * Math.PI)); }
  return c;
};
FRONT.baseH = function (x, z) { const B = this.base, n = this.bw, fx = clamp(x - this.x0, 0, n - 1.001), fz = clamp(z - this.z0, 0, this.bd - 1.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  return (B[j * n + i] * (1 - u) + B[j * n + i + 1] * u) * (1 - v) + (B[(j + 1) * n + i] * (1 - u) + B[(j + 1) * n + i + 1] * u) * v; };
FRONT.h = function (x, z) { return this.baseH(x, z) - this.carve(x, z); };
FRONT.inTrench = function (x, z) { for (const r of this.rects) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return r; return null; };
// trench walls block walking and driving; ladders let you climb out
FRONT.block = function (p) {
  const L = this.last; if (!L || L.lv !== LEVEL) { this.last = { x: p.x, z: p.z, lv: LEVEL }; return; }
  if (!this.inPatch(p.x, p.z)) { L.x = p.x; L.z = p.z; return; }
  const veh = VH.on, y = player.pos.y, lim = veh ? 0.9 : 1.0;
  const bad = h => h - y > lim || (veh && y - h > 0.9);
  if (bad(groundH(p.x, p.z))) {
    let lad = false; if (!veh) for (const [lx, lz] of this.ladders) if (Math.abs(p.x - lx) < 0.9 && Math.abs(p.z - lz) < 0.7) { lad = true; break; }
    if (lad) { player.vy = Math.max(player.vy, 4.2); p.x = L.x; p.z = L.z; }
    else if (!bad(groundH(p.x, L.z))) p.z = L.z; else if (!bad(groundH(L.x, p.z))) p.x = L.x; else { p.x = L.x; p.z = L.z; }
  }
  L.x = p.x; L.z = p.z;
};

// ---------- building ----------
let FR_BAG = null;
function frBagGeo() { if (FR_BAG) return FR_BAG; const g = new THREE.BoxGeometry(0.56, 0.22, 0.34, 3, 2, 3), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / 0.28, z = p.getZ(i) / 0.17, k = 1 - 0.32 * Math.min(1, x * x) - 0.12 * Math.min(1, z * z); p.setY(i, p.getY(i) * k); p.setX(i, p.getX(i) * (1 - 0.1 * Math.abs(p.getY(i)) / 0.11)); }
  g.computeVertexNormals(); return (FR_BAG = g); }
function frBags(x, z, ry, n, layers, col, gaps) { // a row of sandbags along local x, stacked brick-fashion
  const m = toon(col || '#9a8a64', 'cloth'), c = Math.cos(ry), s = Math.sin(ry), y0 = FRONT.baseH(x, z);
  for (let L = 0; L < layers; L++) for (let i = 0; i < n - (L % 2); i++) { if (gaps && L === layers - 1 && gaps.includes(i)) continue; const lx = (i - (n - 1) / 2) * 0.54 + (L % 2) * 0.27;
    const b = part(props, frBagGeo(), m, x + c * lx, y0 + 0.1 + L * 0.19, z - s * lx, 0, ry + (Math.sin(i * 7 + L) * 0.06), 0); b.scale.setScalar(0.96 + (Math.sin(i * 3.1 + L * 1.7) * 0.04)); }
}
function frBoardSign(text, x, z, ry, bg, fg) { // a painted board on two posts, single-sided text
  const g = new THREE.Group(), wood = toon('#5a4430', 'wood');
  for (const s of [-1, 1]) part(g, B(0.09, 1.7, 0.09), wood, 0.62 * s, 0.85, 0);
  part(g, B(1.5, 0.48, 0.05), wood, 0, 1.45, 0); part(g, B(1.56, 0.06, 0.07), toon('#3a2c20', 'wood'), 0, 1.71, 0); part(g, B(1.56, 0.06, 0.07), toon('#3a2c20', 'wood'), 0, 1.19, 0);
  const t = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.4), new THREE.MeshLambertMaterial({ map: signTex(text, bg || '#e8dcc0', fg || '#2a221c'), polygonOffset: true, polygonOffsetFactor: -1 })); t.position.set(0, 1.45, 0.03); g.add(t);
  g.position.set(x, FRONT.baseH(x, z), z); g.rotation.y = ry; props.add(g); return g;
}
function frWalls() {
  const wood = toon('#6e5236', 'wood'), post = toon('#4a3828', 'wood'), red = toon('#3a1c20', 'hull'), redPost = toon('#1e1c22', 'panel'), D = FRONT.D;
  const deep = (x, z) => FRONT.carve(x, z) > 0.4;
  for (const r of FRONT.rects) {
    const ours = r.ours, wm = ours ? wood : red, pm = ours ? post : redPost;
    // four sides: walk each, and panel the stretches where outside is solid ground
    const sides = [[r.x0, r.z0, r.x1, r.z0, 0, -1], [r.x0, r.z1, r.x1, r.z1, 0, 1], [r.x0, r.z0, r.x0, r.z1, -1, 0], [r.x1, r.z0, r.x1, r.z1, 1, 0]];
    for (const [ax, az, bx, bz, nx, nz] of sides) {
      const len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 0.5); let run = null; const runs = [];
      for (let i = 0; i <= n; i++) { const t = Math.min(len, i * 0.5 + 0.25), x = ax + (bx - ax) * t / len, z = az + (bz - az) * t / len, solidOut = !deep(x + nx * 0.3, z + nz * 0.3) && i < n;
        if (solidOut) { if (!run) run = [i * 0.5, 0]; run[1] = Math.min(len, (i + 1) * 0.5); } else if (run) { runs.push(run); run = null; } }
      if (run) runs.push(run);
      const ry = nx ? Math.PI / 2 : 0;
      for (const [s0, s1] of runs) {
        const segs = Math.max(1, Math.round((s1 - s0) / 1.5)), sl = (s1 - s0) / segs;
        for (let k = 0; k < segs; k++) { const tm = s0 + (k + 0.5) * sl, x = ax + (bx - ax) * tm / len + nx * 0.04, z = az + (bz - az) * tm / len + nz * 0.04, top = FRONT.baseH(x, z), dep = r.ramp ? D * clamp(r.ramp > 0 ? (r.x1 - x) / (r.x1 - r.x0) : (x - r.x0) / (r.x1 - r.x0), 0, 1) : D;
          if (dep < 0.15) continue;
          const h = dep + 0.12; part(props, B(sl, h, 0.08), wm, x, top - dep + h / 2 - 0.06, z, 0, ry, 0);
          const px = ax + (bx - ax) * (s0 + k * sl) / len, pz = az + (bz - az) * (s0 + k * sl) / len; part(props, B(0.12, h + 0.25, 0.12), pm, px - nx * 0.04, top - dep + (h + 0.25) / 2 - 0.06, pz - nz * 0.04);
          part(props, B(sl, 0.05, 0.55), wm, x + nx * 0.3, top + 0.02, z + nz * 0.3, 0, ry, 0); // capping board over the cut
        }
      }
    }
    if (r.ramp) continue;
    // duckboards on the floor
    const along = r.z1 - r.z0 > r.x1 - r.x0, L0 = along ? r.z0 : r.x0, L1 = along ? r.z1 : r.x1, fx0 = r.step ? (r.step < 0 ? r.x0 + 0.72 : r.x0 + 0.05) : r.x0 + 0.05, fx1 = r.step ? (r.step < 0 ? r.x1 - 0.05 : r.x1 - 0.72) : r.x1 - 0.05;
    const bm = ours ? toon('#7a6040', 'wood') : toon('#2a2428', 'panel');
    for (let s = L0 + 0.2; s < L1 - 0.1; s += 0.32) { const x = along ? (fx0 + fx1) / 2 : s, z = along ? s : (r.z0 + r.z1) / 2; part(props, B(along ? fx1 - fx0 - 0.2 : 0.14, 0.05, along ? 0.14 : r.z1 - r.z0 - 0.3), bm, x, FRONT.h(x, z) + 0.05, z); }
    // fire step facing (planks on the step's front) and ladders
    if (r.step) { const sx = r.step < 0 ? r.x0 + 0.72 : r.x1 - 0.72, cz = (r.z0 + r.z1) / 2, fl = FRONT.baseH(sx, cz) - D;
      part(props, B(0.06, FRONT.STEP, r.z1 - r.z0), wm, sx, fl + FRONT.STEP / 2, cz);
      const lx = r.step < 0 ? r.x0 + 0.18 : r.x1 - 0.18, g = new THREE.Group(), lw = ours ? post : redPost;
      for (const s of [-1, 1]) part(g, B(0.07, 2.05, 0.07), lw, 0, 1.02, 0.24 * s); for (let k = 0; k < 6; k++) part(g, B(0.05, 0.05, 0.48), lw, 0, 0.25 + k * 0.32, 0);
      g.position.set(lx + (r.step < 0 ? 0.25 : -0.25), fl + FRONT.STEP, cz); g.rotation.z = r.step < 0 ? 0.22 : -0.22; props.add(g);
    }
  }
}
function frParapets() {
  for (const b of FRONT.bays) { // ours: sandbag parapet in front, parados behind, firing gaps where the men stand
    frBags(b.x0 - 0.3, (b.z0 + b.z1) / 2, Math.PI / 2, 12, 2, '#9a8a64', [2, 3, 8, 9]); frBags(b.x0 - 0.65, (b.z0 + b.z1) / 2, Math.PI / 2, 12, 1, '#8a7a58');
    frBags(b.x1 + 0.35, (b.z0 + b.z1) / 2, Math.PI / 2, 11, 1, '#8a7a58'); }
  for (const b of FRONT.ebays) { const m = toon('#2a2024', 'panel'), t = toon('#b3262c'); // Drome: steel plate parapet with red stripes and slits
    const x = b.x1 + 0.3, cz = (b.z0 + b.z1) / 2, y = FRONT.baseH(x, cz);
    for (let k = 0; k < 4; k++) { const z = b.z0 + 0.75 + k * 1.5; part(props, B(0.12, 0.62, 1.4), m, x, y + 0.31, z, 0, 0, -0.18); part(props, B(0.13, 0.06, 1.42), t, x + 0.05, y + 0.5, z, 0, 0, -0.18); }
    frBags(b.x0 - 0.35, cz, Math.PI / 2, 11, 1, '#3a3034'); }
}
function frWire() { // barbed-wire belts on X-frame pickets, with gaps to get through
  const post = toon('#4a3a2c', 'wood'), wire = toon('#7a7a78'), wm = new THREE.Group();
  const strand = (a, b) => { const d = b.clone().sub(a), L = d.length(), m = part(wm, Cy(0.012, 0.012, L, 3), wire, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); };
  for (const bx of [-50, -112]) {
    let prev = null;
    for (let z = -16; z <= 68; z += 3) {
      if (((z + 16) % 24) >= 18) { prev = null; continue; } // a gap every 24 m
      const x = bx + Math.sin(z * 0.7) * 0.5, y = FRONT.baseH(x, z);
      for (const s of [-1, 1]) part(props, B(0.07, 1.6, 0.07), post, x, y + 0.65, z, 0, 0, 0.45 * s);
      const tops = [V(x - 0.36, y + 1.25, z), V(x + 0.36, y + 1.25, z), V(x, y + 0.75, z), V(x - 0.5, y + 0.3, z), V(x + 0.5, y + 0.3, z)];
      if (prev) { for (let i = 0; i < 5; i++) strand(prev[i], tops[i]); strand(prev[0], tops[2]); strand(prev[2], tops[1]); strand(prev[3], tops[2]); strand(prev[2], tops[4]); }
      prev = tops;
    }
  }
  props.add(wm);
}
function frDressing() {
  const Z0 = FRONT;
  // tank traps (hedgehogs) and shattered trees in no-man's-land
  const steel = toon('#4a4440', 'panel');
  for (const [x, z] of [[-58, -6], [-60, 14], [-57, 40], [-61, 58], [-104, 0], [-102, 22], [-105, 46], [-101, 62]]) { const g = new THREE.Group(); for (const [rx, rz] of [[0.6, 0], [-0.6, 0], [0, 0.6]]) part(g, B(0.16, 0.16, 1.9), steel, 0, 0.55, 0, rx, rz ? 0 : 0.8, rz); at(g, x, z, x); solid(x, z, 0.9); }
  const bark = toon('#3a2c22', 'wood');
  for (const [x, z, h, lean] of [[-70, -10, 4.5, 0.2], [-88, 6, 3.2, -0.35], [-66, 33, 5.2, 0.1], [-94, 47, 2.6, 0.5], [-78, 62, 3.8, -0.15], [-99, 24, 4.1, 0.25]]) {
    const g = new THREE.Group(); part(g, Cy(0.16, 0.26, h, 7), bark, 0, h / 2, 0, lean, 0, lean * 0.5); part(g, Cy(0.05, 0.09, 1.3, 5), bark, 0.2, h * 0.7, 0, 0, 0, -0.9); part(g, Cy(0.04, 0.07, 0.9, 5), bark, -0.15, h * 0.55, 0.1, 0.4, 0, 0.8);
    for (let k = 0; k < 4; k++) part(g, B(0.08, 0.3, 0.06), toon('#c9b28a', 'wood'), Math.sin(k) * 0.1, h + 0.05, Math.cos(k) * 0.1, 0.3 * k, k, 0.2); // splintered top
    at(g, x, z, x); solid(x, z, 0.35); }
  // burning Drome wrecks
  FRONT.fires = [];
  for (const [x, z, r] of [[-82, -2, 0.6], [-74, 22, 2.2], [-90, 38, 4.0], [-68, 52, 1.2]]) { const w = makeTankModel('#2a2220'); at(w, x, z, r, -0.35); w.rotation.z = 0.18; w.rotation.x = -0.08; w.userData.turret.rotation.set(0.2, 1.1, 0.3); solid(x, z, 2.0); FRONT.fires.push(V(x, FRONT.baseH(x, z) + 1.6, z)); }
  // signs: painted boards on posts
  frBoardSign('AID POST', -36.5, 17.2, -Math.PI / 2); frBoardSign('HQ', -36.2, 49, -Math.PI / 2); frBoardSign('KEEP YOUR HEAD DOWN', -45.6, 10.5, -Math.PI / 2, '#d8c8a0', '#6a1a14'); frBoardSign('TO THE FORT', -15.4, 27.4, Math.PI / 2);
  // dugouts in the back wall: aid post (bay 3) and HQ (bay 6)
  for (const [b, lab] of [[FRONT.bays[3], 'aid'], [FRONT.bays[6], 'hq']]) { const x = b.x1, cz = (b.z0 + b.z1) / 2, fl = FRONT.baseH(x, cz) - FRONT.D, g = new THREE.Group(), w = toon('#4a3828', 'wood');
    part(g, B(0.1, 1.85, 1.3), toon('#0c0a08'), 0.02, 0.93, 0); for (const s of [-1, 1]) part(g, B(0.16, 1.95, 0.16), w, -0.04, 0.98, 0.72 * s); part(g, B(0.2, 0.16, 1.6), w, -0.04, 1.98, 0);
    if (lab === 'aid') { part(g, B(0.04, 0.32, 0.32), toon('#e8e4dc'), -0.08, 2.2, 0); part(g, B(0.05, 0.22, 0.07), toon('#c8402f'), -0.1, 2.2, 0); part(g, B(0.05, 0.07, 0.22), toon('#c8402f'), -0.1, 2.2, 0);
      const lamp = part(g, new THREE.SphereGeometry(0.07, 8, 6), glow('#ffcf8a'), -0.15, 1.75, 0.55); }
    else { part(g, B(0.3, 0.22, 0.2), toon('#3a3d44'), -0.15, 1.2, 0.95); part(g, Cy(0.008, 0.008, 2.4, 3), toon('#1a1a1a'), 0.2, 2.4, 0.95, 0, 0, 0.2); }
    g.position.set(x, fl, cz); props.add(g); frBags(x + 1.2, cz, Math.PI / 2, 6, 3, '#8a7a58'); }
  // two MG nests on the parapet (bays 2 and 7): sandbag horseshoe, timber roof, MG on a tripod
  FRONT.mgs = [];
  for (const b of [FRONT.bays[2], FRONT.bays[7]]) { const x = b.x0 - 1.4, cz = (b.z0 + b.z1) / 2, y = FRONT.baseH(x, cz), g = new THREE.Group(), w = toon('#5a4430', 'wood');
    for (let a = -1.2; a <= 1.21; a += 0.3) frBags(x - Math.cos(a) * 1.5, cz + Math.sin(a) * 1.5, a - Math.PI / 2, 1, 3, '#9a8a64');
    for (const [px, pz] of [[0.9, 1.1], [0.9, -1.1], [-0.6, 1.1], [-0.6, -1.1]]) part(g, B(0.12, 1.6, 0.12), w, px, 0.8, pz); part(g, B(2.0, 0.1, 2.6), w, 0.15, 1.62, 0);
    const mg = new THREE.Group(); mg.position.set(-0.6, 0.85, 0); g.add(mg); part(mg, B(0.55, 0.16, 0.14), toon('#2b2a2c'), 0, 0, 0); part(mg, Cy(0.04, 0.04, 0.9, 6), toon('#3a3d44'), -0.65, 0.02, 0, 0, 0, Math.PI / 2); part(mg, Cy(0.07, 0.07, 0.5, 8), toon('#3a3d44'), -0.4, 0.02, 0, 0, 0, Math.PI / 2); part(mg, B(0.12, 0.14, 0.2), toon('#6a5a2a'), 0.1, -0.12, 0.1);
    for (const [rx, rz] of [[0.5, 0], [-0.4, 0.4], [-0.4, -0.4]]) part(mg, Cy(0.02, 0.02, 0.9, 4), toon('#2b2a2c'), rx * 0.3, -0.42, rz * 0.3, rz, 0, -rx);
    g.position.set(x, y, cz); props.add(g); FRONT.mgs.push(V(x - 1.2, y + 0.9, cz)); box(x - 0.2, cz, 0.3, 1.5); }
  // our rear: artillery line, ammo dump, the motor pool tank
  const gun = (x, z, ry, col) => { const g = new THREE.Group(); for (const s of [-1, 1]) { part(g, Cy(0.55, 0.55, 0.16, 12), toon('#2b2a2c'), 0.75 * s, 0.55, 0, 0, 0, Math.PI / 2); part(g, B(0.12, 0.12, 2.4), toon(col), 0.35 * s, 0.25, -1.3, 0, 0.18 * s, 0); }
    part(g, B(1.4, 1.0, 0.08), toon(col), 0, 1.0, 0.25, -0.15); part(g, B(0.5, 0.45, 0.9), toon(col), 0, 0.85, 0); const br = part(g, Cy(0.09, 0.12, 3.2, 8), toon('#3a3d44'), 0, 1.45, 1.4, Math.PI / 2 - 0.45); at(g, x, z, ry); solid(x, z, 1.3); return g; };
  FRONT.guns = [gun(-24, 40, -Math.PI / 2, '#5a6a3a'), gun(-24, 47, -Math.PI / 2, '#5a6a3a'), gun(-24, 54, -Math.PI / 2, '#5a6a3a')];
  FRONT.eguns = [gun(-136, 18, Math.PI / 2, '#3a1416'), gun(-136, 30, Math.PI / 2, '#3a1416'), gun(-136, 42, Math.PI / 2, '#3a1416')];
  for (let i = 0; i < 9; i++) { const x = -21 + (i % 3) * 0.9, z = 60 + Math.floor(i / 3) * 0.6; part(props, B(0.8, 0.45, 0.5), toon('#4a5229', 'wood'), x, FRONT.baseH(x, z) + 0.23 + (i % 2) * 0.0, z); }
  for (let i = 0; i < 4; i++) part(props, B(0.8, 0.45, 0.5), toon('#4a5229', 'wood'), -20.5 + i * 0.4, FRONT.baseH(-20.5, 61) + 0.68, 60.6 + (i % 2) * 0.3);
  box(-20, 60.6, 1.6, 1.0);
  const tk = makeTankModel(); at(tk, -24, 4, -Math.PI / 2); solid(-24, 4, 2.2); frBoardSign('MOTOR POOL', -21, 0.5, Math.PI);
  // Drome drop zone behind their trench: a lit landing ring
  const dz = new THREE.Group(); part(dz, Cy(5, 5, 0.12, 24), toon('#1e1c22', 'panel'), 0, 0.06, 0); const ring = part(dz, new THREE.TorusGeometry(4.6, 0.08, 4, 32), glow('#ff2a3a'), 0, 0.14, 0, Math.PI / 2);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; part(dz, B(0.25, 0.25, 0.25), glow('#ff6a1a'), Math.cos(a) * 5.3, 0.15, Math.sin(a) * 5.3); }
  at(dz, -134, 60, 0);
}
function frGround() {
  const F = FRONT, W = F.x1 - F.x0, Dd = F.z1 - F.z0, geo = new THREE.PlaneGeometry(W, Dd, W * 2, Dd * 2); geo.rotateX(-Math.PI / 2); geo.translate((F.x0 + F.x1) / 2, 0, (F.z0 + F.z1) / 2);
  const p = geo.attributes.position, cols = new Float32Array(p.count * 3), P = LEVEL.palette, c = new THREE.Color(), mud = new THREE.Color('#5a4a3c'), dirt = new THREE.Color(P.dirt), dark = new THREE.Color('#2e2622'), base = new THREE.Color(P.grass), wet = new THREE.Color(P.wet);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), cv = F.carve(x, z); p.setY(i, F.baseH(x, z) - cv);
    c.copy(base); const nml = 1 - smooth(Math.abs(x + 81), 30, 42); c.lerp(mud, nml * 0.75 * (0.6 + 0.4 * Math.sin(x * 0.31) * Math.cos(z * 0.27)));
    if (cv > 0.4) c.lerp(wet, 0.85); else if (cv > 0.05) c.lerp(dark, Math.min(1, cv * 1.4)); else if (cv < -0.02) c.lerp(dirt, 0.6);
    for (const r of F.rects) { const ex = Math.max(r.x0 - x, x - r.x1, 0), ez = Math.max(r.z0 - z, z - r.z1, 0); if (ex < 1.6 && ez < 1.6 && Math.max(ex, ez) > 0.01) { c.lerp(dirt, 0.5); break; } } // spoil along the edges
    c.offsetHSL(0, 0, (Math.sin(x * 0.9) * Math.cos(z * 0.8)) * 0.025);
    const lc = c.clone().convertSRGBToLinear(); cols[i * 3] = lc.r; cols[i * 3 + 1] = lc.g; cols[i * 3 + 2] = lc.b; }
  geo.computeVertexNormals(); geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W / 4, uv.getY(i) * Dd / 4);
  return new THREE.Mesh(geo, psx(new THREE.MeshLambertMaterial({ vertexColors: true, map: TEX.grass })));
}
function frontBuild() {
  const F = FRONT; F.on = false; F.raw = true; F.bw = F.x1 - F.x0 + 1; F.bd = F.z1 - F.z0 + 1; F.base = new Float32Array(F.bw * F.bd);
  for (let j = 0; j < F.bd; j++) for (let i = 0; i < F.bw; i++) F.base[j * F.bw + i] = heightExact(F.x0 + i, F.z0 + j);
  F.raw = false; F.on = true; F.last = null; F.men.length = 0; F.foes.length = 0; F.waveT = 12; F.t = 0;
  levelGroup.add(frGround()); frWalls(); frParapets(); frWire(); frDressing(); frMen();
  levelAnims.push(frontStep);
}

// ---------- our troopers on the fire step ----------
// the walk route from the rear ramp up the communication trench and along the line to a bay
function frRoute(k) {
  const B = FRONT.bays, pts = [V(-17, 0, 25), V(-28, 0, 25), V(-32, 0, 25), V(-32, 0, 21), V(-38, 0, 21), V(B[4].cx + 0.4, 0, 21)];
  const step = k >= 4 ? 1 : -1;
  for (let j = 4; j !== k; j += step) { const a = B[j], b = B[j + step], zc = step > 0 ? a.z1 + 1 : a.z0 - 1; pts.push(V(a.cx + 0.4, 0, zc), V(b.cx + 0.4, 0, zc)); }
  return pts;
}
function frSlot(k, i) { const b = FRONT.bays[k], z = b.z0 + 1.6 + i * 2.8, x = b.x0 + 0.38; return { k, i, x, z, y: FRONT.h(x, z), dx: x + 0.9 }; }
function frNewMan(slot, walkIn) {
  const o = buildChar(makeTrooper, 'trooper'); o.traverse(c => { if (c.isMesh) c.frustumCulled = false; }); levelGroup.add(o);
  const m = { o, slot, anim: {}, hp: 100, dead: 0, st: 'down', t: Math.random() * 2, cd: 0, burst: 0, tg: null, path: walkIn ? frRoute(slot.k) : null, pi: 0, seed: Math.random() * 9 };
  if (walkIn) { o.position.set(-17, FRONT.h(-17, 25), 25); m.path.push(V(slot.dx, 0, slot.z)); } else o.position.set(slot.dx, FRONT.h(slot.dx, slot.z), slot.z);
  o.rotation.y = -Math.PI / 2; FRONT.men.push(m); return m;
}
function frMen() { for (let k = 0; k < 10; k++) for (let i = 0; i < 2; i++) frNewMan(frSlot(k, i), false); }
const frAlive = () => FRONT.foes.filter(e => !e.dead);
function frPickFoe(p) { let best = null, bd = 95; for (const e of FRONT.foes) { if (e.dead) continue; const q = e.obj.position; if (q.x > p.x - 2) continue; const d = q.distanceTo(p); if (d < bd) { bd = d; best = e; } } return best; }
function frShotSound(p) { if (p.distanceTo(player.pos) < 28 && Math.random() < 0.35) SFX.laser(); }
function frKillQuiet(e) { e.dead = 0.001; e.plate.material.opacity = 0; burst(e.obj.position.clone().add(V(0, 1, 0)), '#ff6a5a', 8, 4); }
function frManStep(m, dt, t) {
  const o = m.o, s = m.slot;
  if (m.dead) { if (m.dead < 1) { m.dead += dt; o.rotation.z = Math.min(1, m.dead * 2.5) * (Math.PI / 2 - 0.1); o.position.x = s.x + Math.min(1, m.dead * 2) * 1.0; o.position.y = Math.max(FRONT.h(o.position.x, o.position.z), o.position.y - dt * 3); }
    else { m.dead += dt; if (m.dead > 16) { o.parent && o.parent.remove(o); disposeTree(o); FRONT.men.splice(FRONT.men.indexOf(m), 1); frNewMan(s, true); } } return; }
  if (m.path) { const tg = m.path[m.pi], dx = tg.x - o.position.x, dz = tg.z - o.position.z, d = Math.hypot(dx, dz);
    if (d < 0.3) { m.pi++; if (m.pi >= m.path.length) { m.path = null; o.rotation.y = -Math.PI / 2; } }
    else { const sp = 3.4 * dt / d; o.position.x += dx * sp; o.position.z += dz * sp; o.rotation.y = Math.atan2(dx, dz); }
    o.position.y = FRONT.h(o.position.x, o.position.z); animRig(o, m.anim, dt, t + m.seed); return; }
  m.t -= dt; m.cd -= dt;
  if (m.st === 'down') { // crouched on the duckboards, reloading
    o.position.x += (s.dx - o.position.x) * Math.min(1, dt * 6); o.position.y = FRONT.h(o.position.x, s.z);
    if (m.t <= 0) { m.tg = frPickFoe(V(s.x, s.y, s.z)); if (m.tg || Math.random() < 0.3) { m.st = 'up'; m.t = 1.6 + Math.random() * 2.2; } else m.t = 0.8 + Math.random(); }
  } else { // up on the fire step, shooting over the parapet
    o.position.x += (s.x - o.position.x) * Math.min(1, dt * 6); o.position.y = FRONT.h(o.position.x, s.z);
    const tg = m.tg && !m.tg.dead ? m.tg : (m.tg = frPickFoe(V(s.x, s.y, s.z)));
    if (tg) { const q = tg.obj.position; o.rotation.y = Math.atan2(q.x - o.position.x, q.z - o.position.z);
      if (m.cd <= 0) { if (m.burst <= 0) m.burst = 3; m.burst--; m.cd = m.burst > 0 ? 0.12 : 0.7 + Math.random() * 0.5;
        o.updateMatrixWorld(); const from = o.localToWorld(V(0.13, 1.25, 1.0)), aim = q.clone().add(V(0, 1.1, 0)), hit = Math.random() < 0.16;
        const end = hit ? aim : aim.add(V((Math.random() - 0.5) * 3, (Math.random() - 0.4) * 1.5, (Math.random() - 0.5) * 3));
        tracer(from, end, '#ffd36a'); burst(from, '#ffd36a', 1, 1); frShotSound(from);
        if (hit) { tg.hp -= 34; tg.hitT = 0.1; if (tg.hp <= 0) frKillQuiet(tg); else updatePlate(tg); } else if (Math.random() < 0.3) burst(end, '#8a7a68', 3, 2); }
    } else o.rotation.y = -Math.PI / 2;
    if (m.t <= 0) { m.st = 'down'; m.t = 1.2 + Math.random() * 1.8; m.burst = 0; }
  }
  if (o.position.distanceTo(player.pos) < 60) animRig(o, m.anim, dt, t + m.seed);
}
function frHurtMan(m, dmg) { if (m.dead || m.path) return; m.hp -= dmg; if (m.hp <= 0) { m.dead = 0.001; burst(m.o.position.clone().add(V(0, 1.2, 0)), '#c8402f', 8, 3); } }

// ---------- the Drome side ----------
ENEMY.dtrooper = { name: 'Drome Rifleman', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#1e1c22', '#4a5229': '#2a1416', '#c9b27c': '#b3262c' }), hp: 140, speed: 2.6, r: 0.45, hy: 1.0, xp: 40, cr: [3, 6], ranged: { dmg: 9, rate: 1.1, speed: 30, col: '#ff2a3a', range: 45, keep: 0 }, drops: [['scrap', 0.15]] };
function frSpawnFoe(x, z, mode, stopX) {
  if (frAlive().length >= 24) return null;
  const e = makeEnemy({ zone: 'siege', type: 'dtrooper', n: 1, lv: [18, 22], once: true }); e.obj.position.set(x, FRONT.h(x, z), z); e.obj.rotation.y = Math.PI / 2;
  e.front = { mode, stopX: stopX || x, home: V(x, 0, z), tt: 0, tg: null, st: 'up', t: Math.random() * 2 }; e.aggro = true; FRONT.foes.push(e); return e;
}
function frGarrison() { FRONT.foes = FRONT.foes.filter(e => !e.dead || e.dead < 2); for (const b of FRONT.ebays) { const x = b.x1 - 0.38, z = (b.z0 + b.z1) / 2; if (!FRONT.foes.some(e => !e.dead && e.front.mode === 'hold' && Math.abs(e.front.home.z - z) < 1)) frSpawnFoe(x, z, 'hold'); } }
function frSkirmish() { // a test wave: riflemen climb out of their trench and advance
  const n = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) { const b = FRONT.ebays[Math.floor(Math.random() * 10)], z = b.z0 + 1 + Math.random() * 4; frSpawnFoe(b.x1 + 0.6, z, 'advance', -82 + Math.random() * 26); }
  if (player.pos.x < -10 && player.pos.x > -150) toast('THEY\'RE COMING OVER', 'Drome riflemen in no-man\'s-land', 2.4);
}
function frPickTarget(p) {
  const pd = player.pos.distanceTo(p); if (player.alive && pd < 60 && !inSafe(player.pos) && Math.random() < 0.5) return 'player';
  let best = null, bd = 95; for (const m of FRONT.men) { if (m.dead || m.path || m.st !== 'up') continue; const d = m.o.position.distanceTo(p); if (d < bd) { bd = d; best = m; } }
  return best || (player.alive && pd < 60 && !inSafe(player.pos) ? 'player' : null);
}
function frontEnemyStep(e, dt, t) {
  const o = e.obj, F = e.front; e.cd -= dt; F.tt -= dt; F.t -= dt;
  if (F.tt <= 0) { F.tt = 1 + Math.random(); F.tg = frPickTarget(o.position); }
  let vx = 0, vz = 0;
  if (F.mode === 'advance' && o.position.x < F.stopX) { vx = 1; vz = Math.sin(t * 0.6 + e.seed) * 0.25; }
  if (F.mode === 'hold') { const up = F.st === 'up', tx = F.home.x + (up ? 0 : -0.8); o.position.x += (tx - o.position.x) * Math.min(1, dt * 5); if (F.t <= 0) { F.st = up ? 'down' : 'up'; F.t = up ? 1.5 + Math.random() * 2 : 1.5 + Math.random() * 2.5; } }
  if (vx || vz) { const px = o.position.x, pz = o.position.z; o.position.x += vx * e.def.speed * dt; o.position.z += vz * e.def.speed * dt;
    const r = FRONT.inTrench(o.position.x, o.position.z); if (r && r.ours) { o.position.x = px; o.position.z = pz; F.stopX = px; } } // they stop at our trench lip for now
  o.position.y = groundH(o.position.x, o.position.z);
  const tp = F.tg === 'player' ? player.pos : F.tg && !F.tg.dead ? F.tg.o.position : null;
  if (tp) o.rotation.y = Math.atan2(tp.x - o.position.x, tp.z - o.position.z); else if (vx) o.rotation.y = Math.PI / 2;
  if (o.position.distanceTo(player.pos) < 60) animRig(o, e.anim, dt, t + e.seed);
  o.scale.setScalar(e.sc * (1 + Math.max(0, e.hitT) * 0.6)); if (e.hitT > 0) e.hitT -= dt;
  if (!tp || e.cd > 0 || (F.mode === 'hold' && F.st !== 'up') || dlgOpen) return;
  const moving = vx !== 0; e.cd = e.def.ranged.rate * (0.7 + Math.random() * 0.7) * (moving ? 1.6 : 1);
  o.updateMatrixWorld(); const from = o.localToWorld(V(0.13, 1.25, 1.0));
  if (F.tg === 'player') { const aim = player.pos.clone().add(V(0, 1.3, 0)), see = lineOfSight(from, aim), hit = see && Math.random() < (moving ? 0.18 : 0.3);
    tracer(from, hit ? aim : aim.clone().add(V((Math.random() - 0.5) * 2.5, (Math.random() - 0.3) * 1.5, (Math.random() - 0.5) * 2.5)), '#ff2a3a'); frShotSound(from);
    if (hit) hurt(e.def.ranged.dmg * (1 + 0.04 * (e.lv - 18)), o.position); }
  else { const m = F.tg, aim = m.o.position.clone().add(V(0, 1.4, 0)), hit = Math.random() < (moving ? 0.1 : 0.2);
    tracer(from, hit ? aim : aim.clone().add(V((Math.random() - 0.5) * 2.5, Math.random() * 1.2, (Math.random() - 0.5) * 2.5)), '#ff2a3a'); frShotSound(from); if (hit) frHurtMan(m, 12); }
}
let FR_LT = 0;
function frontStep(t) {
  const dt = Math.min(0.1, Math.max(0, t - FR_LT)); FR_LT = t; if (!dt || LEVEL.id !== 'fort') return; const F = FRONT; F.t += dt;
  for (const m of F.men.slice()) frManStep(m, dt, t);
  F.gT = (F.gT || 0) - dt; if (F.gT <= 0) { F.gT = 25; frGarrison(); }
  const near = player.pos.x < -8 && player.pos.x > -150 && player.pos.z > -40 && player.pos.z < 95;
  if (near) { F.waveT -= dt; if (F.waveT <= 0) { F.waveT = 55 + Math.random() * 20; if (frAlive().filter(e => e.front.mode === 'advance').length < 4) frSkirmish(); } }
  if (F.fires) { F.fireT = (F.fireT || 0) - dt; if (F.fireT <= 0) { F.fireT = 0.25; const p = F.fires[Math.floor(Math.random() * F.fires.length)]; if (p.distanceTo(player.pos) < 90) { burst(p, '#ff8a2a', 2, 1.2); burst(p.clone().add(V(0, 0.6, 0)), '#3a3530', 2, 1.5); } } }
}
