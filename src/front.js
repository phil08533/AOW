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
  FB.on = false; FB.phase = 'idle'; FB.nades.length = 0; FB.smoke.length = 0; FB.ship = null;
  levelGroup.add(frGround()); frWalls(); frParapets(); frWire(); frDressing(); frMen(); frInteracts();
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
    else { m.dead += dt; if (m.dead > 16 && !(FB.on && FB.reserve <= 0)) { o.parent && o.parent.remove(o); disposeTree(o); FRONT.men.splice(FRONT.men.indexOf(m), 1); if (FB.on) FB.reserve--; frNewMan(s, true); } } return; }
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
    m.ncd = (m.ncd || Math.random() * 10) - dt;
    if (tg && m.ncd <= 0 && tg.obj.position.distanceTo(o.position) < 26 && tg.def !== ENEMY.dtank) { m.ncd = 16 + Math.random() * 10; o.updateMatrixWorld(); frThrow(o.localToWorld(V(0, 1.7, 0.2)), tg.obj.position.clone().add(V((Math.random() - 0.5) * 2, 0.1, (Math.random() - 0.5) * 2)), true); m.anim.atk = 0.42; }
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
  const o = e.obj, F = e.front; e.cd -= dt; F.tt -= dt; F.t -= dt; F.ncd = (F.ncd == null ? 6 + Math.random() * 8 : F.ncd) - dt; o.rotation.order = 'YXZ';
  const inOurs = () => { const r = FRONT.inTrench(o.position.x, o.position.z); return r && r.ours; };
  if (F.tt <= 0) { F.tt = 1 + Math.random(); F.tg = F.mode === 'assault' && inOurs() ? frNearMan(o.position, 9) || frPickTarget(o.position) : frPickTarget(o.position); }
  let vx = 0, vz = 0, sp = e.def.speed, prone = 0;
  if (F.mode === 'advance') { if (o.position.x < F.stopX) { vx = 1; vz = Math.sin(t * 0.6 + e.seed) * 0.25; } else if (F.aT != null && (F.aT -= dt) <= 0) F.mode = 'assault'; }
  else if (F.mode === 'crawl') { prone = 1; sp = 1.5;
    if (F.pause > 0) F.pause -= dt; else { const nx = (F.cr || []).find(c => c.x > o.position.x + 1.5 && c.x < -48); if (!nx) F.mode = 'assault'; else { const dx = nx.x - o.position.x, dz = nx.z - o.position.z, d = Math.hypot(dx, dz); if (d < 1) F.pause = 2 + Math.random() * 3; else { vx = dx / d; vz = dz / d; } } } }
  else if (F.mode === 'jump') { F.y -= dt * 5; o.position.y = F.y; if (Math.random() < 0.5) burst(o.position.clone().add(V(0, 0.3, 0)), '#ff6a1a', 1, 2); if (F.y <= groundH(o.position.x, o.position.z)) { F.mode = 'assault'; SFX.land && SFX.land(); } }
  else if (F.mode === 'assault') { if (!inOurs()) { vx = 1; vz = Math.sin(t * 0.8 + e.seed) * 0.2; sp *= 1.25; } }
  else if (F.mode === 'tank') { sp = 1.6; if (o.position.x < F.stopX) vx = 1; }
  else if (F.mode === 'hold') { const up = F.st === 'up', tx = F.home.x + (up ? 0 : -0.8); o.position.x += (tx - o.position.x) * Math.min(1, dt * 5); if (F.t <= 0) { F.st = up ? 'down' : 'up'; F.t = up ? 1.5 + Math.random() * 2 : 1.5 + Math.random() * 2.5; } }
  if (e.slow > 0) { e.slow -= dt; sp *= 0.45; }
  if (vx || vz) { const px = o.position.x, pz = o.position.z; o.position.x += vx * sp * dt; o.position.z += vz * sp * dt;
    if (F.mode !== 'assault' && inOurs()) { o.position.x = px; o.position.z = pz; F.stopX = px; } }
  if (F.mode !== 'jump') o.position.y = groundH(o.position.x, o.position.z) + prone * 0.25;
  const tp = F.tg === 'player' ? player.pos : F.tg && F.tg.o && !F.tg.dead ? F.tg.o.position : F.tg && F.tg.isVector3 ? F.tg : null;
  if (tp && !(vx && prone)) o.rotation.y = Math.atan2(tp.x - o.position.x, tp.z - o.position.z); else if (vx || vz) o.rotation.y = Math.atan2(vx, vz);
  o.rotation.x += ((prone && (vx || vz) ? 1.35 : prone ? 1.1 : 0) - o.rotation.x) * Math.min(1, dt * 6);
  if (F.mode === 'tank') { const tu = o.userData.turret; if (tu && tp) tu.rotation.y = Math.atan2(tp.x - o.position.x, tp.z - o.position.z) - o.rotation.y; }
  else if (o.position.distanceTo(player.pos) < 60) animRig(o, e.anim, dt, t + e.seed);
  o.scale.setScalar(e.sc * (1 + Math.max(0, e.hitT) * 0.6)); if (e.hitT > 0) e.hitT -= dt;
  // Drome grenades into our trench
  if (F.ncd <= 0 && F.mode !== 'tank' && F.mode !== 'jump' && o.position.x > -66 && !inOurs()) { F.ncd = 12 + Math.random() * 8;
    const m = frNearMan(o.position, 30), tgt = m ? m.o.position.clone() : player.pos.x > -44 && player.pos.x < -38 ? player.pos.clone() : null;
    if (tgt) { o.updateMatrixWorld(); frThrow(o.localToWorld(V(0, 1.7, 0.2)), tgt.add(V((Math.random() - 0.5) * 2.5, 0, (Math.random() - 0.5) * 2.5)), false); e.anim.atk = 0.42; } }
  if (!tp || e.cd > 0 || (F.mode === 'hold' && F.st !== 'up') || F.mode === 'jump' || dlgOpen) return;
  const moving = vx !== 0 || vz !== 0;
  if (F.mode === 'tank') { e.cd = 4 + Math.random() * 2; o.updateMatrixWorld(); const from = o.userData.turret ? o.userData.turret.localToWorld(V(0, 0.05, 3.3)) : o.position.clone().add(V(0, 1.5, 0)), aim = tp.clone().add(V((Math.random() - 0.5) * 3, 0.3, (Math.random() - 0.5) * 3));
    tracer(from, aim, '#ff2a3a'); burst(from, '#ffb060', 8, 4); if (from.distanceTo(player.pos) < 60) SFX.boom(); frBoom(aim, false); return; }
  e.cd = e.def.ranged.rate * (0.7 + Math.random() * 0.7) * (moving ? 1.6 : 1) * (prone ? 2 : 1);
  o.updateMatrixWorld(); const from = o.localToWorld(V(0.13, 1.25, 1.0)), close = inOurs();
  if (F.tg === 'player') { const aim = player.pos.clone().add(V(0, 1.3, 0)), see = lineOfSight(from, aim), hit = see && Math.random() < (close ? 0.45 : moving ? 0.18 : 0.3);
    tracer(from, hit ? aim : aim.clone().add(V((Math.random() - 0.5) * 2.5, (Math.random() - 0.3) * 1.5, (Math.random() - 0.5) * 2.5)), '#ff2a3a'); frShotSound(from);
    if (hit) hurt(e.def.ranged.dmg * (1 + 0.04 * (e.lv - 18)), o.position); }
  else if (F.tg && F.tg.o) { const m = F.tg, aim = m.o.position.clone().add(V(0, 1.4, 0)), hit = Math.random() < (close ? 0.5 : moving ? 0.1 : 0.2);
    tracer(from, hit ? aim : aim.clone().add(V((Math.random() - 0.5) * 2.5, Math.random() * 1.2, (Math.random() - 0.5) * 2.5)), '#ff2a3a'); frShotSound(from); if (hit) frHurtMan(m, close ? 30 : 12); }
}
function frNearMan(p, r) { let best = null, bd = r; for (const m of FRONT.men) { if (m.dead || m.path) continue; const d = m.o.position.distanceTo(p); if (d < bd) { bd = d; best = m; } } return best; }
let FR_LT = 0;
function frontStep(t) {
  const dt = Math.min(0.1, Math.max(0, t - FR_LT)); FR_LT = t; if (!dt || LEVEL.id !== 'fort') return; const F = FRONT; F.t += dt;
  for (const m of F.men.slice()) frManStep(m, dt, t);
  F.gT = (F.gT || 0) - dt; if (F.gT <= 0) { F.gT = 25; frGarrison(); }
  const near = player.pos.x < -8 && player.pos.x > -150 && player.pos.z > -40 && player.pos.z < 95;
  frBattleStep(dt); frHud();
  if (near && !FB.on) { F.waveT -= dt; if (F.waveT <= 0) { F.waveT = 55 + Math.random() * 20; if (frAlive().filter(e => e.front.mode === 'advance').length < 4) frSkirmish(); } }
  if (F.fires) { F.fireT = (F.fireT || 0) - dt; if (F.fireT <= 0) { F.fireT = 0.25; const p = F.fires[Math.floor(Math.random() * F.fires.length)]; if (p.distanceTo(player.pos) < 90) { burst(p, '#ff8a2a', 2, 1.2); burst(p.clone().add(V(0, 0.6, 0)), '#3a3530', 2, 1.5); } } }
}

// =================== HOLD THE LINE (2.23.74): six waves, grenades both ways, the reserve, MG nests, the field phone ===================
const FR_WAVES = [
  { name: 'Riflemen in a line', tip: 'Get on the fire step. The MG nests and grenade crates are yours to use.', spawn: [['line', 12]] },
  { name: 'Rush under smoke', tip: 'They crawl crater to crater in the smoke. Grenades into the craters.', smoke: true, spawn: [['crawl', 16]] },
  { name: 'Jump troops', tip: 'A dropship is dropping troops behind no-man\'s-land. Turn the MG on the drop zone.', spawn: [['drop', 12], ['line', 6]] },
  { name: 'Tanks', tip: 'Two Drome tanks. Rifles won\'t stop them: use the field phone in the HQ dugout to call the guns.', spawn: [['tank', 2], ['behind', 10]] },
  { name: 'The big push', tip: 'A huge infantry wave. Hold the step.', spawn: [['line', 14], ['crawl', 12]] },
  { name: 'Everything at once', tip: 'Krag\'s lieutenants lead the last wave. Hold until the whistle.', smoke: true, spawn: [['lt', 2], ['tank', 1], ['drop', 8], ['line', 12], ['crawl', 8]] }
];
ENEMY.dlt = { name: "Krag's Lieutenant", rig: 'trooper', make: () => { const g = recolor(makeTrooper(), { '#6f7a3e': '#3a1416', '#4a5229': '#1e1c22', '#c9b27c': '#ff2a3a' }); for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.05, 0.24, 4), '#b3262c', 0.12 * s, 1.98, 0); return g; }, scale: 1.2, hp: 1400, speed: 2.2, r: 0.55, hy: 1.1, xp: 600, cr: [120, 180], elite: true, ranged: { dmg: 16, rate: 0.6, speed: 30, col: '#ff2a3a', range: 50, keep: 0 }, drops: [['circuit', 0.6]] };
const FB = { on: false, wave: 0, phase: 'idle', t: 0, reserve: 40, inTrench: 0, queue: [], mark: 0, phoneCd: 0, nades: [], smoke: [], ship: null, hud: null, aid: V(-38.5, 0, 11), won: 0 };
function frHud() {
  if (!FB.hud) { const d = document.createElement('div'); d.id = 'frontHud'; d.style.cssText = 'position:fixed;top:112px;left:50%;transform:translateX(-50%);background:rgba(16,18,22,.82);border:1px solid #5a4a3c;border-radius:6px;padding:6px 14px;color:#e8dcc0;font:600 13px/1.35 ui-monospace,monospace;letter-spacing:.06em;text-align:center;pointer-events:none;z-index:5;display:none;min-width:280px'; document.body.appendChild(d); FB.hud = d; }
  const show = FB.on && LEVEL.id === 'fort' && state === 'play'; FB.hud.style.display = show ? 'block' : 'none'; if (!show) return;
  const left = frAlive().filter(e => e.front.wave).length, W = FR_WAVES[FB.wave - 1];
  FB.hud.innerHTML = `HOLD THE LINE · WAVE ${Math.max(1, FB.wave)}/6<br><span style="color:#c9b28a;font-weight:500">${FB.phase === 'lull' ? (FB.wave ? `Next wave in ${Math.ceil(FB.t)}s · restock at the crates` : `First wave in ${Math.ceil(FB.t)}s`) : FB.phase === 'whistle' ? 'Hold until the whistle!' : (W ? W.name : '') + ` · Drome left ${left + FB.queue.length}`} · Reserve ${FB.reserve}${FB.mark > 0 ? ' · AIM AND FIRE TO MARK THE BARRAGE' : FB.phoneCd > 0 ? ` · Guns ready in ${Math.ceil(FB.phoneCd)}s` : ' · Guns ready'}</span>`;
}
function frontStart() {
  if (FB.on) return; Object.assign(FB, { on: true, wave: 0, phase: 'lull', t: 15, reserve: 40, queue: [], mark: 0, phoneCd: 0, won: 0 });
  for (const e of FRONT.foes) if (!e.dead && e.front.mode !== 'hold') frKillQuiet(e);
  toast('HOLD THE LINE', 'Six waves. Keep the reserve alive.', 3); SFX.horn && SFX.horn(); log('Hold the Line: get on the fire step. Grenade crates and an aid post are in the trench, the MG nests are in bays 3 and 8, and the field phone in the HQ dugout calls the guns.', 'loot');
}
function frontEnd(won) {
  FB.on = false; FB.phase = 'idle'; frHud(); FB.queue.length = 0;
  if (won) { FB.won++; SFX.level(); toast('THE LINE HELD', 'Six waves beaten', 4); const cr = 4000, xp = 15000; S.cr += cr; gainXp(xp); log(`The line held! +${cr} cr, +${xp} XP.`, 'loot'); S.flags = S.flags || {}; S.flags.frontHeld = (S.flags.frontHeld || 0) + 1; markDirty(); }
  else { SFX.hurt(); toast('THE LINE BROKE', FB.reserve <= 0 ? 'The reserve ran out' : 'Drome overran the trench', 4); log('The line broke. Talk to the field phone in the HQ dugout to try again.'); }
  for (const e of FRONT.foes) if (!e.dead && e.front.mode !== 'hold') frKillQuiet(e);
}
function frWaveSpawn(w) {
  const W = FR_WAVES[w - 1]; FB.queue.length = 0;
  for (const [kind, n] of W.spawn) for (let i = 0; i < n; i++) FB.queue.push(kind);
  if (W.smoke) frSmoke(); if (W.spawn.some(s => s[0] === 'drop')) frDropship();
  toast(`WAVE ${w}: ${W.name.toUpperCase()}`, W.tip, 4); log(`Wave ${w}: ${W.tip}`); SFX.horn && SFX.horn();
}
function frSpawnKind(kind) {
  const b = FRONT.ebays[Math.floor(Math.random() * 10)], z = b.z0 + 1 + Math.random() * 4, x = b.x1 + 0.6; let e;
  if (kind === 'line') e = frSpawnFoe(x, z, 'advance', -84 + Math.random() * 18);
  else if (kind === 'crawl') { e = frSpawnFoe(x, z, 'crawl'); if (e) e.front.cr = FRONT.craters.filter(c => Math.abs(c[1] - z) < 26).sort((a, b) => a[0] - b[0]).map(c => V(c[0], 0, c[1])); }
  else if (kind === 'behind') e = frSpawnFoe(x - 4, z, 'advance', -80 + Math.random() * 10);
  else if (kind === 'drop') { const p = FB.ship ? FB.ship.position : V(-96, 0, 26); e = frSpawnFoe(p.x + (Math.random() - 0.5) * 10, p.z + (Math.random() - 0.5) * 14, 'jump'); if (e) { e.front.y = 26 + Math.random() * 6; e.obj.position.y = e.front.y; } }
  else if (kind === 'tank') { e = makeEnemy({ zone: 'siege', type: 'dtank', n: 1, lv: [24, 26], once: true }); e.obj.position.set(x, groundH(x, z), z); e.front = { mode: 'tank', stopX: -66 + Math.random() * 6, home: V(x, 0, z), tt: 0, tg: null, st: 'up', t: 0 }; e.aggro = true; e.max *= 1.4; e.hp = e.max; FRONT.foes.push(e); }
  else if (kind === 'lt') { e = makeEnemy({ zone: 'siege', type: 'dlt', n: 1, lv: [26, 28], once: true }); e.obj.position.set(x, groundH(x, z), z); e.front = { mode: 'advance', stopX: -72, home: V(x, 0, z), tt: 0, tg: null, st: 'up', t: 0, lt: 1 }; e.aggro = true; FRONT.foes.push(e); }
  if (e) { e.front.wave = FB.wave; if (e.front.mode !== 'tank') e.front.aT = 18 + Math.random() * 14; }
  return e;
}
// smoke banks drifting across no-man's-land
function frSmoke() { const m = new THREE.MeshLambertMaterial({ color: '#8a847c', transparent: true, opacity: 0.55, depthWrite: false });
  for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), m); const x = -110 + Math.random() * 50, z = -10 + Math.random() * 72; s.position.set(x, FRONT.baseH(x, z) + 1.2, z); s.scale.set(5 + Math.random() * 4, 2.2 + Math.random(), 5 + Math.random() * 4); levelGroup.add(s); FB.smoke.push({ s, t: 50 + Math.random() * 20 }); } }
function frDropship() { if (FB.ship && FB.ship.parent) return; const g = makeDropship(); recolor(g, { '#7b8457': '#2a1416', '#3e4330': '#1e1c22' }); g.scale.setScalar(3); g.position.set(-150, 40, 26); levelGroup.add(g); FB.ship = g; g.userData.t = 0; }
// grenades thrown by troopers (at Drome) and by Drome (into our trench)
function frThrow(from, to, ours) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), toon(ours ? '#4a5229' : '#3a1416')); m.position.copy(from); levelGroup.add(m); FB.nades.push({ m, a: from.clone(), b: to.clone(), t: 0, T: 1.1 + from.distanceTo(to) * 0.02, ours }); }
function frBoom(p, ours) {
  burst(p, '#ffb060', 14, 7); burst(p, '#6a5a4a', 12, 4); if (p.distanceTo(player.pos) < 45) SFX.boom(); if (p.distanceTo(player.pos) < 14) VH.shk = Math.max(VH.shk || 0, 0.2);
  if (ours) { for (const e of FRONT.foes) { if (e.dead) continue; const d = e.obj.position.distanceTo(p); if (d < 4.5) { e.hp -= 300 * (1 - d / 6); e.hitT = 0.15; if (e.hp <= 0) frKillQuiet(e); else updatePlate(e); } } }
  else { for (const m of FRONT.men) { if (m.dead || m.path) continue; const d = m.o.position.distanceTo(p); if (d < 2.6) frHurtMan(m, 200); else if (d < 4) frHurtMan(m, 50); }
    const dp = Math.hypot(player.pos.x - p.x, player.pos.z - p.z); if (dp < 4 && Math.abs(player.pos.y - p.y) < 2.5) hurt(55 * (1 - dp / 5), p); }
}
// the field phone: mark a spot, our three guns answer
function frPhone() {
  if (FB.phoneCd > 0) { log(`The guns are reloading. Ready in ${Math.ceil(FB.phoneCd)}s.`); return; }
  closeDlg && dlgOpen && closeDlg(); FB.mark = 25; toast('GUNS STANDING BY', 'Aim at a spot in no-man\'s-land and fire to mark it', 3); log('Battery standing by. Aim where you want the shells and pull the trigger.', 'loot');
}
function frBarrage(p) {
  FB.mark = 0; FB.phoneCd = 40; toast('ON THE WAY', 'Three guns, five seconds', 2); SFX.ui && SFX.ui();
  const flare = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), glow('#ff3b2a')); flare.position.copy(p).add(V(0, 0.3, 0)); levelGroup.add(flare);
  FRONT.guns.forEach((g, i) => setTimeout(() => { if (!g.parent) return; const m = g.localToWorld(V(0, 1.5, 3)); burst(m, '#ffd36a', 12, 6); burst(m, '#8a8680', 10, 3); SFX.boom(); g.position.x += 0.4; setTimeout(() => { g.position.x -= 0.4; }, 250); }, i * 350));
  for (let k = 0; k < 9; k++) setTimeout(() => { if (LEVEL.id !== 'fort') return; const q = p.clone().add(V((Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12)); q.y = groundH(q.x, q.z); burst(q, '#ffb060', 22, 10); burst(q, '#5a4a3c', 18, 6); SFX.boom(); if (q.distanceTo(player.pos) < 30) VH.shk = Math.max(VH.shk || 0, 0.3);
    for (const e of FRONT.foes.concat(enemies.filter(x => x.def === ENEMY.siegebot))) { if (e.dead) continue; const d = e.obj.position.distanceTo(q); if (d < 7) { e.hp -= 1500 * (1 - d / 9); e.hitT = 0.2; if (e.hp <= 0) { if (e.front) frKillQuiet(e); else kill(e); } else updatePlate(e); } }
    if (k === 8 && flare.parent) flare.parent.remove(flare); }, 5000 + k * 260);
}
function frMarkAim() { const o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); for (let t = 2; t < 160; t += 0.5) { const q = o.clone().addScaledVector(d, t); if (q.y < groundH(q.x, q.z)) return q; } return null; }
// interactions in the trench: field phone, aid post, crates, MG nests
function frInteracts() {
  const hq = FRONT.bays[6], aid = FRONT.bays[3]; FB.aid.set(aid.x1 - 0.7, 0, (aid.z0 + aid.z1) / 2 + 1.5);
  INTERACTS.push({ x: hq.x1 - 0.6, z: (hq.z0 + hq.z1) / 2, r: 1.8, get label() { return FB.on ? '📞 Field phone: call the guns' : '📞 Field phone: start Hold the Line'; }, fn: () => { if (FB.on) frPhone(); else frontStart(); } });
  INTERACTS.push({ x: aid.x1 - 0.6, z: (aid.z0 + aid.z1) / 2, r: 1.8, label: '🩹 Aid post: get patched up', fn: () => { if ((FB.healT || 0) > gameTime) { log('The medic is busy. Try again in a moment.'); return; } FB.healT = gameTime + 25; player.hp = maxHp(); SFX.item ? SFX.item() : SFX.ui(); toast('PATCHED UP', 'Full health', 1.5); } });
  for (const k of [1, 4, 8]) { const b = FRONT.bays[k], x = b.x1 - 0.45, z = b.z0 + 0.8; const g = new THREE.Group(); part(g, B(0.8, 0.45, 0.5), toon('#4a5229', 'wood'), 0, 0.23, 0); part(g, B(0.82, 0.06, 0.52), toon('#3a4020', 'wood'), 0, 0.47, 0); part(g, B(0.3, 0.08, 0.02), toon('#e8dcc0'), 0, 0.3, 0.26);
    g.position.set(x, FRONT.h(x, z), z); g.rotation.y = Math.PI / 2; levelGroup.add(g);
    INTERACTS.push({ x, z, r: 1.6, label: '📦 Grenades and ammo: restock', fn: () => { ordCharges = ORD_MAX; player.ammo = gun().mag; player.reloading = 0; SFX.item ? SFX.item() : SFX.ui(); toast('RESTOCKED', `${ORD_MAX} grenades, full magazine`, 1.5); } }); }
  FRONT.mgs.forEach((p, i) => { const b = FRONT.bays[i ? 7 : 2]; INTERACTS.push({ x: b.x0 + 1.0, z: (b.z0 + b.z1) / 2, r: 1.6, label: '🔫 Man the MG nest', fn: () => frMountMG(i) }); });
}
function frMountMG(i) { if (VH.on) return; const p = FRONT.mgs[i]; player.pos.set(p.x + 1.55, groundH(p.x + 1.55, p.z), p.z); player.yaw = Math.PI / 2; player.pitch = -0.05;
  VH = { on: true, id: 'mgnest', v: 0, vy: 0, hp: vehMaxHp('mgnest'), cd: 0, fuel: 0, mg: i }; SFX.door(); toast('HEAVY MG', 'FIRE shoots · V to leave', 2); }
function frBattleStep(dt) {
  FB.phoneCd = Math.max(0, FB.phoneCd - dt);
  if (FB.mark > 0) { FB.mark -= dt; if (firing && !dlgOpen) { firing = false; const q = frMarkAim(); if (q) frBarrage(q); else log('Aim at the ground to mark a spot.'); } }
  // grenades in flight
  for (let i = FB.nades.length - 1; i >= 0; i--) { const n = FB.nades[i]; n.t += dt; const k = Math.min(1, n.t / n.T); n.m.position.lerpVectors(n.a, n.b, k); n.m.position.y += Math.sin(k * Math.PI) * (2 + n.a.distanceTo(n.b) * 0.15); n.m.rotation.x += dt * 9;
    if (k >= 1) { n.m.parent && n.m.parent.remove(n.m); FB.nades.splice(i, 1); frBoom(n.b, n.ours); } }
  for (let i = FB.smoke.length - 1; i >= 0; i--) { const s = FB.smoke[i]; s.t -= dt; s.s.position.x += dt * 0.6; if (s.t < 6) s.s.material.opacity = Math.max(0, 0.55 * s.t / 6); if (s.t <= 0) { s.s.parent && s.s.parent.remove(s.s); FB.smoke.splice(i, 1); } }
  if (FB.ship && FB.ship.parent) { const g = FB.ship, u = g.userData; u.t += dt; const x = u.t < 8 ? -150 + u.t * 7 : u.t < 22 ? -94 : -94 - (u.t - 22) * 9; g.position.set(x, 26 + Math.sin(u.t) * 0.6 + (u.t > 22 ? (u.t - 22) * 2 : 0), 26); g.rotation.y = Math.PI / 2; if (u.t > 40) { g.parent.remove(g); FB.ship = null; } }
  if (!FB.on) return;
  FB.t -= dt;
  if (FB.phase === 'lull' && FB.t <= 0) { FB.wave++; FB.phase = 'wave'; frWaveSpawn(FB.wave); }
  if (FB.phase === 'wave') { FB.spT = (FB.spT || 0) - dt;
    if (FB.queue.length && FB.spT <= 0) { const kind = FB.queue[0]; if ((kind !== 'drop' || (FB.ship && FB.ship.userData.t > 9)) && frAlive().filter(e => e.front.wave).length < 30) { FB.queue.shift(); frSpawnKind(kind); } FB.spT = kind === 'drop' ? 0.6 : 0.35; }
    if (!FB.queue.length && !frAlive().some(e => e.front.wave)) { if (FB.wave >= 6) { FB.phase = 'whistle'; FB.t = 4; } else { FB.phase = 'lull'; FB.t = 20; toast(`WAVE ${FB.wave} BEATEN`, 'Restock at the crates', 2.5); SFX.level(); } } }
  if (FB.phase === 'whistle' && FB.t <= 0) { SFX.horn && SFX.horn(); frontEnd(true); return; }
  // losing: the reserve is gone and the step is nearly empty, or they're in the trench in numbers
  const onLine = FRONT.men.filter(m => !m.dead).length; FB.inTrench = frAlive().filter(e => { const r = FRONT.inTrench(e.obj.position.x, e.obj.position.z); return r && r.ours; }).length;
  if ((FB.reserve <= 0 && onLine < 5) || FB.inTrench >= 7) frontEnd(false);
}
