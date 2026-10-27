// =================== OCEAN WORLD OVERHAUL ===================
// Port Kelp gets proper piers and a space kayak rental (the sub is retired). You can fish anywhere you face open water.
// Bubble City is now a sealed miniature city under one glass dome on the seabed: the Shrink-o-Matic outside shrinks you
// down and you walk into the full-size city, which is its own map.
const OC2 = { kayak: null, paddle: null, rentAt: null };
const OC_BUBBLE_NPCS = ['blub', 'pearlmkt', 'barnacle', 'kelpa', 'pip', 'finn', 'nurse'];

// ---- the sub is retired: X in the water now means the kayak ----
toggleSub = function () { return false; };
toggleBike = function () { if (LEVEL && LEVEL.ocean && kayakToggle()) return; _toggleBike(); };
{ const q = QDEFS.o1; if (q) { q.title = 'Salt and Paddles';
  q.intro = ["A new face! Welcome to Port Kelp. Population: me, a crab, and a guy who says he's a fish.", "Everything good on this world is underwater. Rent a kayak at the east pier, paddle out, and dive.", "Get yourself down to the Sunlit Reef, east of here. Come back and tell me what you saw."];
  q.obj[0].text = 'Swim or kayak out and dive to the Sunlit Reef'; } }
{ const b = LEVELS.ocean.npcs.find(n => n.id === 'brine'); if (b) b.idle = ["The sea gives, the sea takes. Mostly takes. Mostly my boots.", "Kayaks are at the east pier. Paddle out, fish from it, try not to fall in. You'll fall in."]; }
{ const b = LEVELS.ocean.npcs.find(n => n.id === 'brine'); if (b) b.x = 3; }

// ---- Bubble City's people move into the city map ----
const OC_MOVED = LEVELS.ocean.npcs.filter(n => OC_BUBBLE_NPCS.includes(n.id));
LEVELS.ocean.npcs = LEVELS.ocean.npcs.filter(n => !OC_BUBBLE_NPCS.includes(n.id));
{ const P = { finn: [-8, 72, 0], nurse: [-12, -6, Math.PI / 2], blub: [0, -7, 0], pearlmkt: [-27, -5, Math.PI / 2], barnacle: [24, 10, -Math.PI / 2], kelpa: [5, -30, Math.PI], pip: [30, -2, -Math.PI / 2] };
  for (const n of OC_MOVED) { const [x, z, f] = P[n.id]; Object.assign(n, { x, z, face: f }); } }
// the old domes let you breathe; the city is its own map now, so the seabed is just seabed
inDome = function () { return false; };
{ const _bf = buildFishSpots; buildFishSpots = function (id) { if (id === 'ocean') { FISH_SPOTS.length = 0; return; } return _bf(id); }; }

{ const orig = LEVELS.ocean.build; LEVELS.ocean.build = function () { orig.call(this); try { ocClear(); ocPiers(); ocMiniCity(); for (let i = INTERACTS.length - 1; i >= 0; i--) if (/call the sub/.test(INTERACTS[i].label || '')) INTERACTS.splice(i, 1); } catch (e) { console.warn('ocean2', e); } }; }

// remove the old docks, the sub dock and everything that made up the old Bubble City
function ocClear() {
  const [px, pz] = PORT, B = Z.bubble, bx = new THREE.Box3(), c = new THREE.Vector3(), sz = new THREE.Vector3();
  const near = (x, z) => Math.hypot(x - B.x, z - B.z) < 31;
  const oldDock = (x, z) => [[0, 14], [-14, 2], [14, 2]].some(([ox, oz]) => Math.abs(x - px - ox) < 0.2 && Math.abs(z - pz - oz) < 0.2);
  for (const root of [props, levelGroup]) for (const o of [...root.children]) {
    if (o.isGroup && oldDock(o.position.x, o.position.z)) { root.remove(o); continue; }
    if (o.isLight) continue; bx.setFromObject(o); if (bx.isEmpty()) continue; bx.getCenter(c); bx.getSize(sz);
    if (Math.max(sz.x, sz.z) < 70 && near(c.x, c.z) && c.y < WATER_Y) root.remove(o); }
  for (let i = SURFACES.length - 1; i >= 0; i--) { const s = SURFACES[i]; if (Math.hypot(s.x - px, s.z - pz) < 26 || near(s.x, s.z)) SURFACES.splice(i, 1); }
  for (const A of [BOXES, CIRCLES]) for (let i = A.length - 1; i >= 0; i--) if (near(A[i][0], A[i][1])) A.splice(i, 1);
  for (let i = INTERACTS.length - 1; i >= 0; i--) if (/^Sub dock/.test(INTERACTS[i].label || '')) INTERACTS.splice(i, 1);
}

// ---- Port Kelp piers: one straight deck each, pilings to the seabed, cross-bracing, rope rails, lamps ----
const ocDeck = () => WATER_Y + 1.15;
function ocPiers() {
  const [px, pz] = PORT, wood = toon('#9a7650', 'wood'), dark = toon('#6a4f34', 'wood'), rope = toon('#d8c890');
  const piers = [[0, 1, 14], [-1, 0, 10], [1, 0, 11]];
  OC2.piers = [];
  for (const [dx, dz, L] of piers) {
    let r0 = 5; while (r0 < 30 && groundH(px + dx * r0, pz + dz * r0) > WATER_Y + 0.55) r0 += 0.25;
    const a = r0 - 2, b = r0 + L, len = b - a, cx = px + dx * (a + b) / 2, cz = pz + dz * (a + b) / 2, ry = Math.atan2(dx, dz), g = new THREE.Group(), y = ocDeck(), W = 2.8;
    // the deck: planks across the pier, two stringers under them
    for (let s = 0; s < len; s += 0.5) part(g, B(W, 0.22, 0.44), toon(((s * 2) | 0) % 3 ? '#9a7650' : '#8a6a44', 'wood'), 0, y, -len / 2 + s + 0.25);
    for (const sx of [-1, 1]) part(g, B(0.2, 0.25, len), dark, sx * (W / 2 - 0.25), y - 0.17, 0);
    // pilings every two meters on both sides, down into the sand, with diagonal braces
    for (let s = 1; s < len; s += 2) for (const sx of [-1, 1]) { const wx = cx + Math.cos(ry) * sx * (W / 2) + Math.sin(ry) * (-len / 2 + s), wz = cz - Math.sin(ry) * sx * (W / 2) + Math.cos(ry) * (-len / 2 + s);
      const gy = Math.min(groundH(wx, wz), y - 0.5), h = y + 0.5 - gy; part(g, Cy(0.14, 0.16, h, 7), dark, sx * (W / 2), gy + h / 2, -len / 2 + s);
      if (h > 1.6) part(g, B(0.08, 0.08, Math.hypot(2, h - 0.8) * 0.98), dark, sx * (W / 2 + 0.05), (y - 0.3 + gy + 0.5) / 2, -len / 2 + s + 1, Math.atan2(h - 0.8, 2), 0, 0); }
    // rope rail along one side, bollards and a lamp at the far end
    for (let s = 1; s < len; s += 2) part(g, Cy(0.05, 0.05, 0.6, 5), dark, W / 2 - 0.1, y + 0.55, -len / 2 + s);
    part(g, Cy(0.03, 0.03, len - 1.5, 4), rope, W / 2 - 0.1, y + 0.75, 0.25, Math.PI / 2, 0, 0);
    for (const sx of [-1, 1]) part(g, Cy(0.16, 0.2, 0.45, 8), toon('#2b2a2c'), sx * 0.9, y + 0.28, len / 2 - 0.5);
    part(g, Cy(0.06, 0.06, 2.6, 6), toon('#2b2a2c'), -W / 2 + 0.2, y + 1.3, len / 2 - 0.4); part(g, new THREE.SphereGeometry(0.2, 8, 6), glow('#ffe9a0'), -W / 2 + 0.2, y + 2.7, len / 2 - 0.4);
    g.position.set(cx, 0, cz); g.rotation.y = ry; levelGroup.add(g);
    SURFACES.push({ x: cx, z: cz, ux: Math.sin(ry), uz: Math.cos(ry), hl: len / 2, hw: W / 2, y: y + 0.05 });
    OC2.piers.push({ cx, cz, ry, len, end: [px + dx * (b - 0.6), pz + dz * (b - 0.6)], dx, dz });
  }
  // the kayak rental: a little shack and a rack at the root of the east pier
  const E = OC2.piers[2], sx = px + E.dx * (E.len / 2 - 4) + 0, sz = pz + 3.2; const shack = new THREE.Group();
  part(shack, B(2.4, 2.2, 1.8), toon('#3f7d7a', 'wood'), 0, 1.1, 0); part(shack, B(2.8, 0.15, 2.3), toon('#ffd36a'), 0, 2.3, 0.15, 0.12); part(shack, B(1.6, 0.9, 0.05), toon('#1e1c22'), 0, 1.4, 0.92);
  const kc = ['#ff6aa8', '#4fd2ff', '#7fff6a']; for (let i = 0; i < 3; i++) { const k = makeKayak(kc[i]); k.scale.setScalar(0.8); k.position.set(2.2, 0.45 + i * 0.55, 0); shack.add(k); }
  for (const zz of [-1.1, 1.1]) { part(shack, B(0.1, 1.9, 0.1), toon('#6a4f34', 'wood'), 2.6, 0.95, zz); part(shack, B(0.1, 1.9, 0.1), toon('#6a4f34', 'wood'), 1.8, 0.95, zz); for (let i = 0; i < 3; i++) part(shack, B(0.9, 0.06, 0.08), toon('#6a4f34', 'wood'), 2.2, 0.35 + i * 0.55, zz); }
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.45), new THREE.MeshBasicMaterial({ map: signTex('SPACE KAYAKS · 40 cr', '#0c1a24', '#7fe8ff') })); sg.position.set(0, 2.6, 1.0); shack.add(sg);
  const P0 = OC2.piers[0], sxx = P0.cx - 4.2, szz = P0.cz - P0.len / 2 - 4.5; shack.position.set(sxx, groundH(sxx, szz) - 0.05, szz); shack.rotation.y = Math.PI; levelGroup.add(shack); box(sxx, szz, 1.3, 1.0); box(sxx - 2.2, szz, 0.5, 1.2);
  OC2.rentAt = [sxx, szz - 1.6];
  // (no sign mast: the island is busy enough; the shack's own sign does the job)
  INTERACTS.push({ x: sxx, z: szz - 1.4, r: 2.4, label: '🛶 Rent a space kayak (40 cr)', fn: kayakRent });
  INTERACTS.push(OC_KAYAK_OUT);
}

// ---- the space kayak ----
function makeKayak(col) {
  const g = new THREE.Group(), hull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), toon(col || '#4fd2ff')); hull.scale.set(0.42, 0.22, 1.9); hull.position.y = 0.1; g.add(hull);
  part(g, B(0.06, 0.03, 3.4), glow('#e8f8ff'), 0, 0.31, 0); const ck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.14, 14), toon('#1e1c22')); ck.position.set(0, 0.28, 0.15); ck.scale.z = 1.4; g.add(ck);
  for (const s of [-1, 1]) part(g, B(0.3, 0.03, 0.4), toon('#2b2a2c'), s * 0.35, 0.12, 1.5, 0, 0, s * 0.3);
  return g;
}
function kayakRent() {
  if (S.inSub) return; if (S.cr < 40) { SFX.hit(); log("Kayak rental is 40 cr. You're short."); return; }
  S.cr -= 40; SFX.coin(); markDirty();
  // launch from the nearest open water beside the shack
  const [ox, oz] = OC2.rentAt; let best = null; for (let r = 3; r < 20 && !best; r += 0.5) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, x = ox + Math.cos(a) * r, z = oz + Math.sin(a) * r; if (groundH(x, z) < WATER_Y - 0.6 && floorAt(x, z) < WATER_Y) { best = [x, z]; break; } }
  const P = OC2.piers[0]; kayakOn(...(best || [P.cx + 4, P.cz]));
}
function kayakOn(x, z) {
  S.inSub = true; S.kayak = true; player.pos.set(x, WATER_Y - 0.75, z); player.vy = 0;
  if (!OC2.kayak) { OC2.kayak = makeKayak('#ff8a2a'); } scene.add(OC2.kayak);
  if (!OC2.paddle) { const p = new THREE.Group(); part(p, Cy(0.02, 0.02, 1.6, 6), toon('#2b2a2c'), 0, 0, 0, 0, 0, Math.PI / 2); for (const s of [-1, 1]) part(p, B(0.22, 0.02, 0.1), toon('#ffd36a'), s * 0.8, 0, 0); p.position.set(0, -0.42, -0.55); camera.add(p); OC2.paddle = p; }
  OC2.paddle.visible = true; vmSub.scale.setScalar(0.0001);
  log('Space kayak. Paddle where you look · face open water to fish · tap Use near a pier or the shore to climb out.', 'loot');
}
function kayakOff() { S.inSub = false; S.kayak = false; if (OC2.kayak) scene.remove(OC2.kayak); if (OC2.paddle) OC2.paddle.visible = false; vmSub.scale.setScalar(1); }
function kayakToggle() {
  if (!S.kayak) return false; if (dlgOpen) return true;
  // climb out onto the nearest pier, or onto dry land close by
  for (const s of SURFACES) { const dx = player.pos.x - s.x, dz = player.pos.z - s.z, al = dx * s.ux + dz * s.uz, ac = dx * s.uz - dz * s.ux;
    if (Math.abs(al) < s.hl + 0.5 && Math.abs(ac) < s.hw + 3) { const a2 = clamp(al, -s.hl + 0.5, s.hl - 0.5); kayakOff(); player.pos.set(s.x + s.ux * a2, s.y, s.z + s.uz * a2); SFX.door(); return true; } }
  for (let r = 1; r <= 4; r += 0.5) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, x = player.pos.x + Math.cos(a) * r, z = player.pos.z + Math.sin(a) * r;
    if (groundH(x, z) > WATER_Y + 0.1) { kayakOff(); player.pos.set(x, groundH(x, z), z); SFX.door(); return true; } }
  log('Paddle up to a pier or the shore to climb out.'); return true;
}
{ const _ss = subStep; subStep = function (dt, mx, mz, sprint) {
  if (!S.kayak) return _ss.apply(this, arguments);
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw), sp = 4.6 * (sprint ? 1.5 : 1);
  OC2.v = OC2.v || { x: 0, z: 0 }; const V2 = OC2.v; V2.x += (fx * mz + rx * mx * 0.4) * sp * dt * 2.2; V2.z += (fz * mz + rz * mx * 0.4) * sp * dt * 2.2; const dr = Math.pow(0.35, dt); V2.x *= dr; V2.z *= dr;
  const nx = player.pos.x + V2.x * dt, nz = player.pos.z + V2.z * dt;
  if (groundH(nx, nz) < WATER_Y - 0.45) { player.pos.x = nx; player.pos.z = nz; } else { V2.x *= -0.3; V2.z *= -0.3; }
  collide(player.pos, 0.7, false);
  const t = performance.now() / 1000; player.pos.y = WATER_Y - 0.75 + Math.sin(t * 1.7) * 0.04; player.vy = 0; player.onGround = false; player.wet = false;
  const K = OC2.kayak; if (K) { K.position.set(player.pos.x, WATER_Y - 0.12 + Math.sin(t * 1.7) * 0.04, player.pos.z); K.rotation.set(Math.sin(t * 1.3) * 0.03, player.yaw + Math.PI, Math.sin(t * 1.1) * 0.04); }
  const P = OC2.paddle; if (P) { const m = Math.hypot(V2.x, V2.z); P.rotation.z = Math.sin(t * 5) * 0.5 * Math.min(1, m / 2); P.rotation.y = Math.cos(t * 5) * 0.25 * Math.min(1, m / 2); }
}; }
{ const _ll = loadLevel; loadLevel = function () { if (S.kayak) kayakOff(); return _ll.apply(this, arguments); }; }

// ---- fish anywhere: face open water from the shore, a pier or the kayak ----
const OC_TABLES = { ocean: 'sea', earth: 'lake', capitone: 'frost', mezar: 'oasis', robot: 'canal' };
const OC_FISH_ANY = { r: 4.8, label: '🎣 Fish here', fn: () => startFishing(LEVEL.name, OC_TABLES[LEVEL.id] || 'sea'),
  get x() { return ocFishAt() ? player.pos.x - Math.sin(player.yaw) * 4.5 : 1e9; }, get z() { return ocFishAt() ? player.pos.z - Math.cos(player.yaw) * 4.5 : 1e9; } };
let ocFishT = 0, ocFishOk = false;
function ocFishAt() { const t = performance.now(); if (t - ocFishT < 150) return ocFishOk; ocFishT = t;
  ocFishOk = false; if (!LEVEL || !OC_TABLES[LEVEL.id] || fishing || dlgOpen || !LEVEL.terrain) return false;
  if (!S.kayak && (player.pos.y < WATER_Y - 0.5 || (typeof swimHere === 'function' && swimHere()))) return false;
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw); let wet = 0; for (const d of [3, 4.5, 6]) if (groundH(player.pos.x + fx * d, player.pos.z + fz * d) < WATER_Y - 0.4) wet++;
  ocFishOk = wet >= 2; return ocFishOk; }
{ const _ll = loadLevel; loadLevel = function () { const r = _ll.apply(this, arguments); if (!INTERACTS.includes(OC_FISH_ANY)) INTERACTS.push(OC_FISH_ANY); return r; }; }

// ---- the miniature Bubble City: a sealed glass dome on the seabed with a tiny city inside, and the Shrink-o-Matic ----
function ocMiniCity() {
  // a scale model of the real Bubble City: the same five domes and four tunnels, one tenth size, sealed (nobody small enough lives out here)
  const ZB = Z.bubble, y0 = groundH(ZB.x, ZB.z), g = new THREE.Group(), K = 0.11, R = 12.5;
  part(g, Cy(R, R + 0.4, 0.5, 40), toon('#4a4f58', 'panel'), 0, 0.25, 0); part(g, Cy(R + 0.05, R + 0.05, 0.06, 40), glow('#4fd2ff'), 0, 0.5, 0);
  const pc = { hub: '#e8e0d0', kelp: '#4a7a34', burbs: '#7ac05a', low: '#3a2a48', coral: '#e8c8b0' };
  for (const D of BC.domes) { const x = D.x * K, z = D.z * K, r = D.r * K, d = new THREE.Group();
    part(d, Cy(r, r, 0.08, 24), toon(pc[D.id]), 0, 0.54, 0);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: D.glass, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })); gl.position.y = 0.55; d.add(gl);
    for (let i = 0; i < 6; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 4, 16, Math.PI), toon('#8a8f99')); rib.rotation.y = i / 6 * Math.PI; rib.position.y = 0.55; d.add(rib); }
    part(d, new THREE.SphereGeometry(0.08, 6, 4), glow('#ffe9a0'), 0, 0.55 + r, 0);
    // a few tiny landmarks so each dome reads from outside
    if (D.id === 'coral') { for (const [ox, oz, h] of [[-1.5, 0.7, 2.6], [0, 1.5, 2.9], [1.6, 0.9, 2.0]]) part(d, B(0.9, h, 0.9), toon('#8a7f9a'), ox, 0.55 + h / 2, oz); for (let i = 0; i < 8; i++) part(d, B(0.12, 0.3, 0.12), toon(['#ff6aa8', '#ffb347', '#4fffe0'][i % 3]), -1.3 + (i % 4) * 0.3, 0.7, -1 - Math.floor(i / 4) * 0.4); }
    if (D.id === 'burbs') for (let i = 0; i < 7; i++) { const a = -Math.PI / 4 + i * 0.85, hx = Math.cos(a) * 2.4, hz = Math.sin(a) * 2.4; part(d, B(0.6, 0.4, 0.5), toon(['#ffd0a0', '#c8e0ff', '#b8ffcf', '#ffb8d8'][i % 4]), hx, 0.75, hz); part(d, new THREE.ConeGeometry(0.45, 0.3, 4), toon('#8a3a2e'), hx, 1.1, hz, 0, Math.PI / 4, 0); }
    if (D.id === 'low') for (let i = 0; i < 6; i++) { const h = 0.7 + (i % 3) * 0.3; part(d, B(1.0, h, 0.6), toon('#3a3048'), -1.4 + Math.floor(i / 2) * 1.4, 0.55 + h / 2, (i % 2 ? 1 : -1) * 1.0); part(d, B(0.6, 0.08, 0.02), glow(['#ff3bd2', '#4fffe0', '#ffd36a'][i % 3]), -1.4 + Math.floor(i / 2) * 1.4, 0.85, (i % 2 ? 1 : -1) * 0.69); }
    if (D.id === 'kelp') { part(d, Cy(0.55, 0.6, 1.0, 12), toon('#3a3d44'), 1.3, 1.05, -0.9); for (let r2 = 0; r2 < 5; r2++) part(d, B(2, 0.15, 0.15), toon('#6fce4a'), -0.4, 0.65, 0.2 + r2 * 0.3); }
    if (D.id === 'hub') { part(d, Cy(0.6, 0.65, 0.15, 14), toon('#c8e0ff'), 0, 0.62, 0); part(d, Cy(0.08, 0.08, 0.5, 6), toon('#c9a43a'), 0, 0.85, 0); }
    d.position.set(x, 0, z); g.add(d); }
  for (const id of ['kelp', 'burbs', 'low', 'coral']) { const D = BC.domes.find(d => d.id === id), dx = D.x * K, dz = D.z * K, dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl, a0 = 28 * K, len = dl - a0 - D.r * K;
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, len, 10, 1, true), new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
    tb.rotation.x = Math.PI / 2; const tg = new THREE.Group(); tg.add(tb); tb.position.z = len / 2; tg.position.set(ux * a0, 0.62, uz * a0); tg.rotation.y = Math.atan2(ux, uz); g.add(tg);
    part(tg, B(0.4, 0.04, len), toon('#5d636c'), 0, -0.05, len / 2); }
  g.position.set(ZB.x, y0, ZB.z); levelGroup.add(g); solid(ZB.x, ZB.z, R + 0.4);
  const bub = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6 })); levelGroup.add(m); bub.push(m); }
  levelAnims.push(t => bub.forEach((m, i) => { const k = (t * 0.6 + i * 0.37) % 1; m.position.set(ZB.x + Math.sin(i * 2.1) * 0.3, y0 + 1 + k * 8, ZB.z + Math.cos(i * 2.1) * 0.3); }));
  // the Shrink-o-Matic: a ringed machine and platform on the south side, with a buoy above it so you can find it from the surface
  const sx = ZB.x, sz = ZB.z - R - 4, sy = groundH(sx, sz), m = new THREE.Group();
  part(m, Cy(2.2, 2.4, 0.4, 20), toon('#3a3d44', 'panel'), 0, 0.2, 0); part(m, Cy(1.6, 1.6, 0.05, 20), glow('#4fd2ff'), 0, 0.43, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.18, 8, 28), toon('#c9a43a')); ring.position.y = 2.2; m.add(ring); const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 6, 28), glow('#7fe8ff')); ring2.position.y = 2.2; m.add(ring2);
  for (const s of [-1, 1]) part(m, B(0.3, 2.4, 0.3), toon('#5d636c'), s * 1.9, 1.2, 0);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.55), new THREE.MeshBasicMaterial({ map: signTex('SHRINK-O-MATIC · BUBBLE CITY', '#0c1a24', '#7fe8ff') })); sg.position.set(0, 4.2, 0); sg.rotation.y = Math.PI; m.add(sg);
  m.position.set(sx, sy, sz); levelGroup.add(m); levelAnims.push(t => { ring.rotation.x = t * 0.8; ring2.rotation.y = t * 1.3; });
  INTERACTS.push({ x: sx, z: sz, r: 2.8, label: '🫧 Shrink down into Bubble City', fn: ocShrink });
  const buoy = new THREE.Group(); part(buoy, Cy(0.5, 0.7, 1.2, 10), toon('#ff6a3a'), 0, 0, 0); part(buoy, Cy(0.08, 0.08, 1.4, 6), toon('#2b2a2c'), 0, 1.2, 0); part(buoy, new THREE.SphereGeometry(0.18, 8, 6), glow('#7fe8ff'), 0, 1.95, 0);
  buoy.position.set(sx, WATER_Y, sz); levelGroup.add(buoy); levelAnims.push(t => { buoy.position.y = WATER_Y - 0.1 + Math.sin(t * 1.4) * 0.12; buoy.rotation.z = Math.sin(t) * 0.08; });
  const line = new THREE.Mesh(Cy(0.02, 0.02, WATER_Y - sy - 4.4, 4), toon('#d8c890')); line.position.set(sx + 0.3, (WATER_Y + sy + 4.4) / 2, sz); levelGroup.add(line);
}
function ocShrink() {
  let el = $('ocShrink'); if (!el) { el = document.createElement('div'); el.id = 'ocShrink'; el.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;background:radial-gradient(circle,rgba(127,232,255,0) 0%,rgba(127,232,255,.9) 60%,#0a3a5a 100%);opacity:0;transform:scale(3);transition:opacity .9s,transform 1.1s'; document.body.appendChild(el); }
  SFX.door(); try { SFX.whoosh && SFX.whoosh(); } catch (_) {} el.style.opacity = '1'; el.style.transform = 'scale(1)';
  setTimeout(() => { travel('bubblecity'); setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'scale(3)'; toast('BUBBLE CITY', 'You are about two centimeters tall', 3); }, 400); }, 1100);
}
function ocGrow() {
  const el = $('ocShrink'); if (el) { el.style.opacity = '1'; el.style.transform = 'scale(1)'; } SFX.door();
  const B = Z.bubble || { x: 0, z: 62 }; setTimeout(() => { travel('ocean', { at: { x: 0, z: 62 - 12.5 - 6.5, yaw: Math.PI } }); setTimeout(() => { const e2 = $('ocShrink'); if (e2) { e2.style.opacity = '0'; e2.style.transform = 'scale(3)'; } }, 400); }, 1000);
}

// ---- Bubble City, full size ----
LEVELS.bubblecity = {
  id: 'bubblecity', name: 'Bubble City', tag: 'Under the glass, two centimeters tall', lvls: 'Safe', size: 140, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#d8c8a0' }, zones: [{ id: 'bcity', name: 'Bubble City', lvl: 'Safe · under the dome', x: 0, z: 0, r: 50, col: '#c8b880', safe: true, h: 0 }], paths: [], river: [], pools: [], lava: [],
  safes: [{ x: 0, z: 0, r: 300 }], spawn: { x: 0, z: 40, yaw: 0 }, menu: { x: 0, z: 0, r: 10, h: 3 }, npcBase: [0, 0], spawns: [],
  npcs: OC_MOVED,
  build() {
    const Rd = 54, sand = toon('#a8946c'), path = toon('#a9a399'), pastel = ['#ffd0a0', '#c8e0ff', '#b8ffcf', '#ffb8d8', '#fff0a0', '#d8c8ff'];
    const fl = new THREE.Mesh(new THREE.CircleGeometry(Rd + 2, 48).rotateX(-Math.PI / 2), sand); props.add(fl);
    // the dome overhead, water beyond it, light coming down through it
    const dome = new THREE.Mesh(new THREE.SphereGeometry(Rd, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#0c3448', side: THREE.BackSide, fog: false })); levelGroup.add(dome);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(Rd - 0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#bfefff', transparent: true, opacity: 0.08, side: THREE.BackSide, depthWrite: false, fog: false })); levelGroup.add(glass);
    for (let i = 0; i < 12; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(Rd - 0.6, 0.35, 5, 40, Math.PI), new THREE.MeshLambertMaterial({ color: '#8a8f99' })); rib.rotation.y = i / 12 * Math.PI; levelGroup.add(rib); }
    for (const ry of [0, 1, 2, 3]) { const L = new THREE.DirectionalLight(0xbfefff, 0.1); L.position.set(Math.cos(ry * 1.6) * 30, 60, Math.sin(ry * 1.6) * 30); levelGroup.add(L); }
    levelGroup.add(new THREE.HemisphereLight(0x9fd8ef, 0x4a3a2a, 0.3));
    const fish = []; for (let i = 0; i < 14; i++) { const f = new THREE.Mesh(B(1.4, 0.6, 0.3), new THREE.MeshBasicMaterial({ color: ['#ffb347', '#4fd2ff', '#ff6aa8', '#ffd36a'][i % 4], fog: false })); levelGroup.add(f); fish.push(f); }
    levelAnims.push(t => fish.forEach((f, i) => { const a = t * (0.04 + (i % 5) * 0.012) * (i % 2 ? 1 : -1) + i, r = Rd + 4 + (i % 3) * 3, e = 0.35 + (i % 4) * 0.12; f.position.set(Math.cos(a) * r * Math.cos(e), Math.sin(e) * r, Math.sin(a) * r * Math.cos(e)); f.rotation.y = -a + (i % 2 ? 0 : Math.PI); }));
    // keep everyone inside the glass
    levelAnims.push(() => { if (player.pos.x > 100) return; const d = Math.hypot(player.pos.x, player.pos.z); if (d > Rd - 3) { player.pos.x *= (Rd - 3) / d; player.pos.z *= (Rd - 3) / d; } });
    // streets: a ring road and four avenues
    const ring = new THREE.Mesh(new THREE.RingGeometry(14, 18, 48).rotateX(-Math.PI / 2), path); ring.position.y = 0.02; props.add(ring);
    for (const ry of [0, Math.PI / 2]) { const av = new THREE.Mesh(new THREE.PlaneGeometry(4, Rd * 2 - 8).rotateX(-Math.PI / 2), path); av.rotation.y = ry; av.position.y = 0.015; props.add(av); }
    // the plaza: the Mayor's bubble fountain
    part(props, Cy(5, 5.4, 0.6, 24), toon('#c8e0ff'), 0, 0.3, 0); part(props, Cy(4.4, 4.4, 0.05, 24), new THREE.MeshLambertMaterial({ color: '#4fa8cc', transparent: true, opacity: 0.8 }), 0, 0.58, 0); part(props, Cy(0.5, 0.7, 2.4, 10), toon('#e8e4dc'), 0, 1.2, 0); solid(0, 0, 5.2);
    const fb = []; for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.15 + (i % 3) * 0.06, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6 })); levelGroup.add(m); fb.push(m); }
    levelAnims.push(t => fb.forEach((m, i) => { const k = (t * 0.35 + i * 0.13) % 1; m.position.set(Math.sin(i * 2.4) * (0.4 + k * 1.2), 2.4 + k * 9, Math.cos(i * 2.4) * (0.4 + k * 1.2)); m.material.opacity = 0.6 * (1 - k); }));
    const sign = (txt, bg, fg, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) })); m.position.set(x, y, z); m.rotation.y = ry || 0; props.add(m); return m; };
    // a house: pastel walls, porthole windows, a round roof and a door
    const house = (x, z, w, d, h, ry, c) => { const g = new THREE.Group(); part(g, B(w, h, d), toon(pastel[c % 6]), 0, h / 2, 0);
      const roof = new THREE.Mesh(new THREE.SphereGeometry(Math.max(w, d) * 0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(pastel[(c + 3) % 6])); roof.scale.set(w / Math.max(w, d), 0.6, d / Math.max(w, d)); roof.position.y = h; g.add(roof);
      part(g, B(1.1, 2.0, 0.08), toon('#3a5266'), 0, 1.0, d / 2 + 0.03); for (const s of [-1, 1]) { const pw = new THREE.Mesh(new THREE.CircleGeometry(0.4, 14), new THREE.MeshBasicMaterial({ color: '#ffe9a0' })); pw.position.set(s * w * 0.3, h * 0.6, d / 2 + 0.05); g.add(pw); }
      g.position.set(x, 0, z); g.rotation.y = ry; props.add(g); const c2 = Math.abs(Math.cos(ry)), s2 = Math.abs(Math.sin(ry)); box(x, z, (w * c2 + d * s2) / 2, (d * c2 + w * s2) / 2); };
    // homes in the east: two rows facing a lane
    let hc = 0; for (const z of [-26, -18, -10, 10, 18, 26]) { house(24, z, 5, 4.5, 3.4 + (hc % 3) * 0.6, -Math.PI / 2, hc++); house(38, z, 5, 4.5, 3.2 + (hc % 3) * 0.7, Math.PI / 2, hc++); }
    sign('THE HOMES', '#0c1a24', '#c8e0ff', 3, 0.5, 31, 3.6, -34);
    // the market in the west: striped stalls along the avenue
    for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, z = -24 + Math.floor(i / 2) * 10, x = -28 + side * 4.5, g = new THREE.Group();
      part(g, B(3, 1, 1.6), toon('#8a6a44', 'wood'), 0, 0.5, 0); for (let k = 0; k < 4; k++) part(g, B(0.75, 0.08, 2), toon(k % 2 ? '#ffffff' : pastel[i % 6]), -1.1 + k * 0.75, 2.4, 0.2, 0.25);
      for (const s of [-1, 1]) part(g, Cy(0.06, 0.06, 2.4, 5), toon('#6a4f34', 'wood'), s * 1.4, 1.2, 0.9); for (let k = 0; k < 5; k++) part(g, new THREE.SphereGeometry(0.16, 6, 4), toon(['#ffb347', '#ff6aa8', '#7fff6a', '#4fd2ff', '#ffd36a'][(k + i) % 5]), -1 + k * 0.5, 1.12, 0);
      g.position.set(x, 0, z); g.rotation.y = -side * Math.PI / 2; props.add(g); box(x, z, 0.9, 1.6); }
    sign('BUBBLE MARKET', '#3a1a2a', '#ffd0a0', 3.4, 0.6, -28, 4, -32);
    house(-40, -16, 6, 5, 4.2, Math.PI / 2, 2); house(-40, 6, 6, 5, 4.6, Math.PI / 2, 4); house(-16, 30, 5, 5, 3.6, Math.PI, 1);
    // the kelp farm in the north: glowing grow rows
    for (let r = 0; r < 6; r++) { part(props, B(16, 0.4, 1.2), toon('#6a4f34', 'wood'), 0, 0.2, -36 + r * 2.6); for (let k = 0; k < 10; k++) part(props, B(0.3, 1.1 + ((k + r) % 3) * 0.4, 0.3), toon(k % 2 ? '#3f7a3a' : '#6fce4a', 'leaves'), -7 + k * 1.55, 0.9, -36 + r * 2.6); box(0, -36 + r * 2.6, 8, 0.6);
      part(props, B(16, 0.08, 0.1), glow('#c86aff'), 0, 3.2, -36 + r * 2.6); }
    sign('KELP FARM', '#0c240c', '#b8ffcf', 3, 0.5, 0, 4, -22.8);
    // a coral park in the south-east, lamps all round the ring
    const cor = ['#ff6aa8', '#ffb347', '#c86aff', '#4fffe0', '#ff6a5a'];
    for (let i = 0; i < 22; i++) { const a = i * 2.3, d = 3 + (i * 5) % 9, x = 26 + Math.cos(a) * d, z = 36 + Math.sin(a) * d * 0.6; if (Math.hypot(x, z) > Rd - 6) continue; const c = new THREE.Group(); for (let k = 0; k < 4; k++) part(c, Cy(0.12, 0.2, 1 + k * 0.4, 5), toon(cor[(i + k) % 5]), Math.sin(k * 2) * 0.4, 0.5 + k * 0.2, Math.cos(k * 2) * 0.4, Math.sin(k) * 0.4, 0, Math.cos(k) * 0.4); c.position.set(x, 0, z); props.add(c); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, x = Math.cos(a) * 19, z = Math.sin(a) * 19; part(props, Cy(0.08, 0.1, 3.4, 6), toon('#2b2a2c'), x, 1.7, z); part(props, new THREE.SphereGeometry(0.3, 8, 6), glow('#ffe9a0'), x, 3.5, z); }
    // townsfolk out walking
    const walk = []; for (let i = 0; i < 14; i++) { const o = buildChar(() => i % 4 === 3 ? makeJelly(['#4fffe0', '#ff6aa8', '#c86aff'][i % 3]) : makeCivilian(pastel[i % 6], '#2c2a38', ['#e0b892', '#8a5a3a', '#9fe8ff', '#c58a64'][i % 4], '#1e1a18'), i % 4 === 3 ? null : 'civ'); levelGroup.add(o); walk.push([o, {}, i]); }
    levelAnims.push(t => walk.forEach(([o, st, i]) => { const r = 16 + (i % 3) * 0.8, a = t * (0.05 + (i % 4) * 0.01) * (i % 2 ? 1 : -1) + i * 0.45; o.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); o.rotation.y = -a + (i % 2 ? Math.PI : 0); if (o.userData.rig) animRig(o, st, 1 / 60, t); }));
    // the way back: a Shrink-o-Matic that grows you back to normal size
    const m = new THREE.Group(); part(m, Cy(2.2, 2.4, 0.4, 20), toon('#3a3d44', 'panel'), 0, 0.2, 0); part(m, Cy(1.6, 1.6, 0.05, 20), glow('#4fd2ff'), 0, 0.43, 0);
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.18, 8, 28), toon('#c9a43a')); ringM.position.y = 2.2; m.add(ringM); for (const s of [-1, 1]) part(m, B(0.3, 2.4, 0.3), toon('#5d636c'), s * 1.9, 1.2, 0);
    m.position.set(0, 0, 46); props.add(m); levelAnims.push(t => { ringM.rotation.x = t * 0.8; }); sign('GROW BACK · EXIT', '#0c1a24', '#7fe8ff', 2.4, 0.45, 0, 4.0, 46);
    INTERACTS.push({ x: 0, z: 46, r: 2.6, label: '🫧 Grow back to normal size (exit)', fn: ocGrow });
    sign('WELCOME TO BUBBLE CITY · POP. 4,000 · PLEASE DO NOT TAP ON THE DOME', '#0c1a24', '#ffe9a0', 9, 0.7, 0, 5.5, 30, Math.PI);
  }
};
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'bubblecity') return false; return _po(id); }; }

// fishing from the kayak: the sun slides down to a golden sunset and lays a glittering path on the water toward it
const KSUN = { k: 0, path: null };
setInterval(() => { try {
  const fishing = state === 'play' && S.kayak && dlgOpen && /^Fishing/.test($('dlgRole').textContent || '');
  const real = (((Date.now() / 1000 + DAY_LEN * 0.74) % DAY_LEN) / DAY_LEN * 24 + ((LEVEL && LEVEL.hourOffset) || 0)) % 24;
  KSUN.k = Math.max(0, Math.min(1, KSUN.k + (fishing ? 0.012 : -0.02)));
  if (KSUN.lvl !== LEVEL) { KSUN.lvl = LEVEL; KSUN.wm = []; scene.traverse(o => { const m = o.material; if (m && !Array.isArray(m) && m.map === TEX.water && m.color && o.geometry && o.geometry.boundingSphere !== undefined) KSUN.wm.push([m, m.color.clone()]); }); }
  const tint = e => { for (const [m, c] of KSUN.wm) m.color.copy(c).lerp(KSUN.dusk || (KSUN.dusk = new THREE.Color('#6a4a62').convertSRGBToLinear()), e * 0.65); };
  if (KSUN.k <= 0) { if (KSUN.on) { ENV.forceHour = null; KSUN.on = false; tint(0); } if (KSUN.path) KSUN.path.visible = false; return; }
  KSUN.on = true; let d = 18.35 - real; if (d > 12) d -= 24; if (d < -12) d += 24; const e = KSUN.k * KSUN.k * (3 - 2 * KSUN.k); ENV.forceHour = (real + d * e - ((LEVEL && LEVEL.hourOffset) || 0) + 48) % 24;
  if (!KSUN.path) { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255,200,120,0)'); g.addColorStop(0.3, 'rgba(255,170,90,0.55)'); g.addColorStop(1, 'rgba(255,220,150,0.9)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256);
    c.globalCompositeOperation = 'destination-in'; for (let y = 0; y < 256; y += 3) { c.fillStyle = `rgba(0,0,0,${0.4 + Math.random() * 0.6})`; c.fillRect(Math.random() * 20, y, 24 + Math.random() * 30, 2); }
    KSUN.path = new THREE.Mesh(new THREE.PlaneGeometry(14, 70), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    KSUN.path.rotation.x = -Math.PI / 2; KSUN.path.renderOrder = 3; }
  if (KSUN.path.parent !== scene) scene.add(KSUN.path);
  const sd = sunDir.clone(); sd.y = 0; if (sd.lengthSq() < 1e-4) sd.set(1, 0, 0); sd.normalize();
  tint(e); KSUN.path.visible = true; KSUN.path.material.opacity = e * (0.75 + Math.sin(performance.now() / 300) * 0.1);
  KSUN.path.position.set(player.pos.x + sd.x * 37, WATER_Y + 0.3, player.pos.z + sd.z * 37); KSUN.path.rotation.z = Math.atan2(-sd.x, -sd.z);
} catch (_) {} }, 50);

// pier dressing: crates, nets, buckets, a fish-gutting table, gulls on the pilings, lanterns that come on at dusk
function ocPierDetails() { const y = ocDeck() + 0.11;
  OC2.piers.forEach((P, i) => { const g = new THREE.Group(); g.position.set(P.cx, 0, P.cz); g.rotation.y = P.ry; levelGroup.add(g); const L = P.len;
    part(g, B(0.7, 0.6, 0.7), toon('#8a6a44', 'wood'), 0.6, y + 0.3, -L / 2 + 3); part(g, B(0.6, 0.5, 0.6), toon('#7a5a3a', 'wood'), 0.7, y + 0.85, -L / 2 + 3.1, 0, 0.4, 0);
    part(g, Cy(0.2, 0.16, 0.4, 8), toon(['#4fd2ff', '#c8402f', '#ffd36a'][i]), -0.8, y + 0.2, -L / 2 + 5);
    if (i === 0) { part(g, B(1.2, 0.08, 0.6), toon('#9a7650', 'wood'), -0.7, y + 0.8, 1); for (const s of [-1, 1]) part(g, B(0.06, 0.8, 0.06), toon('#6a4f34', 'wood'), -0.7 + s * 0.5, y + 0.4, 1); part(g, B(0.4, 0.08, 0.15), toon('#ffb347'), -0.7, y + 0.88, 1); }
    // gulls perched on piling tops: a body, white head, grey folded wings, a yellow beak, legs; only the head looks around
    for (let k = 0; k < 2; k++) { const gull = new THREE.Group(), wh = toon('#f4f0e8'), gr = toon('#9aa1aa');
      part(gull, B(0.22, 0.2, 0.42), wh, 0, 0.22, 0); part(gull, B(0.08, 0.12, 0.18), gr, 0, 0.26, 0.26, -0.3, 0, 0);
      for (const s of [-1, 1]) { part(gull, B(0.04, 0.15, 0.36), gr, s * 0.12, 0.25, 0.02); part(gull, B(0.03, 0.12, 0.03), toon('#ffb347'), s * 0.06, 0.06, 0); }
      const head = new THREE.Group(); part(head, B(0.16, 0.16, 0.18), wh, 0, 0, 0); part(head, B(0.05, 0.05, 0.14), toon('#ffd36a'), 0, -0.02, -0.15); for (const s of [-1, 1]) part(head, B(0.02, 0.03, 0.03), toon('#111'), s * 0.085, 0.03, -0.04);
      head.position.set(0, 0.4, -0.2); gull.add(head);
      if (k === 0) gull.position.set(0.7, y + 1.1, -L / 2 + 3.1); else gull.position.set(-0.3, y, L / 2 - 1.2); gull.rotation.y = k ? 0.6 : 2.4; g.add(gull);
      levelAnims.push(t => { const s = Math.sin(t * 0.7 + k * 3 + i); head.rotation.y = Math.abs(s) > 0.7 ? Math.sign(s) * 0.8 : 0; head.position.y = 0.4 + Math.max(0, Math.sin(t * 2.3 + k)) * 0.02; }); } });
  // drifting space-lily pads and a few floating buoys around the harbour
  for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 14 + (i * 7) % 18, x = PORT[0] + Math.cos(a) * r, z = PORT[1] + 26 + Math.sin(a) * r * 0.6; if (groundH(x, z) > WATER_Y - 0.3) continue;
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.6 + (i % 3) * 0.2, 10), toon('#4f9a4a')); pad.rotation.x = -Math.PI / 2; pad.position.set(x, WATER_Y + 0.04, z); levelGroup.add(pad);
    if (i % 4 === 0) { const b = new THREE.Group(); part(b, Cy(0.25, 0.35, 0.7, 8), toon(i % 8 ? '#ff6a3a' : '#f4f0e8'), 0, 0, 0); b.position.set(x + 1.5, WATER_Y, z); levelGroup.add(b); levelAnims.push(t => { b.position.y = WATER_Y + Math.sin(t * 1.3 + i) * 0.1; b.rotation.z = Math.sin(t + i) * 0.12; }); } } }
{ const orig = LEVELS.ocean.build; LEVELS.ocean.build = function () { orig.call(this); try { ocPierDetails(); } catch (e) { console.warn('ocean2 details', e); } }; }

// while you sit in the kayak there is always a Use prompt: climb out when a pier or the shore is close, otherwise a hint
function kayakCanExit() { for (const s of SURFACES) { const dx = player.pos.x - s.x, dz = player.pos.z - s.z, al = dx * s.ux + dz * s.uz, ac = dx * s.uz - dz * s.ux; if (Math.abs(al) < s.hl + 0.5 && Math.abs(ac) < s.hw + 3) return true; }
  for (let r = 1; r <= 4; r += 0.5) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; if (groundH(player.pos.x + Math.cos(a) * r, player.pos.z + Math.sin(a) * r) > WATER_Y + 0.1) return true; } return false; }
const OC_KAYAK_OUT = { r: 3, get x() { return S.kayak ? player.pos.x : 1e9; }, get z() { return player.pos.z; }, get label() { return kayakCanExit() ? '🛶 Climb out of the kayak' : '🛶 Paddle to a pier or shore to climb out'; }, fn: () => kayakToggle() };
// little fishing boats bobbing out on the water, each with a fisher who casts, waits, and now and then hauls a fish into the boat
function ocHullGeo(w, L, h, inset) { const sh = new THREE.Shape(), pt = (k) => { const hw = w / 2 - k, l = L / 2 - k; return [[-hw * 0.85, -l], [hw * 0.85, -l], [hw, l * 0.25], [hw * 0.55, l * 0.75], [0, l], [-hw * 0.55, l * 0.75], [-hw, l * 0.25]]; };
  const o = pt(0); sh.moveTo(o[0][0], o[0][1]); for (const [x, z] of o.slice(1)) sh.lineTo(x, z); sh.closePath();
  if (inset) { const hp = new THREE.Path(), q = pt(inset); hp.moveTo(q[0][0], q[0][1]); for (const [x, z] of q.slice(1)) hp.lineTo(x, z); hp.closePath(); sh.holes.push(hp); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); g.rotateX(Math.PI / 2); g.translate(0, h, 0); return g; }
const OCB = [], OCSIT = { g: null };
// sitting in a boat: you ride on the front bench facing the fisher, free to look around; Use again to hop back in the water
function ocSit(g) { if (OCSIT.g) { const o = OCSIT.g; OCSIT.g = null; const w = new THREE.Vector3(1.8, 0, 0.7); o.localToWorld(w); player.pos.set(w.x, WATER_Y - 1.15, w.z); try { SFX.splash(); } catch (_) {} return; }
  OCSIT.g = g; player.vy = 0; player.yaw = g.rotation.y + Math.PI; OCSIT.t = performance.now(); toast('IN THE BOAT', 'Press E to fish. Move or jump to hop out.', 2.2); }
function ocBoats() { OCB.length = 0; OCSIT.g = null; const spots = []; for (let i = 0; i < 40 && spots.length < 5; i++) { const a = i * 1.37, r = 34 + (i * 11) % 40, x = PORT[0] + Math.cos(a) * r, z = PORT[1] + Math.sin(a) * r;
    if (groundH(x, z) > WATER_Y - 2.5 || spots.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 18)) continue; if (Z.bubble && Math.hypot(x - Z.bubble.x, z - Z.bubble.z) < 30) continue; spots.push([x, z, a]); }
  const shirts = ['#c8402f', '#ffd36a', '#3a5266', '#4f9a4a', '#ff9a8a'], fishC = ['#ffb347', '#7fe8ff', '#c8d8e0', '#ff6aa8', '#9aff7a'];
  spots.forEach(([x, z, a], i) => { const g = new THREE.Group(), hullC = ['#f4f0e8', '#3a6a8a', '#c8402f', '#4f7a5a', '#e8c86a'][i], wood = toon('#8a6a44', 'wood');
    const hull = new THREE.Mesh(ocHullGeo(1.7, 4, 0.6, 0.12), toon(hullC, 'wood')); g.add(hull);
    const bottom = new THREE.Mesh(ocHullGeo(1.6, 3.9, 0.1, 0), toon('#5a4030', 'wood')); bottom.position.y = -0.02; g.add(bottom);
    const stripe = new THREE.Mesh(ocHullGeo(1.74, 4.04, 0.1, 0.03), toon('#c9a43a')); stripe.position.y = 0.28; g.add(stripe);
    const rim = new THREE.Mesh(ocHullGeo(1.78, 4.08, 0.07, 0.16), wood); rim.position.y = 0.58; g.add(rim);
    const deck = new THREE.Mesh(ocHullGeo(1.5, 3.8, 0.04, 0), toon('#7a5a3a', 'wood')); deck.position.y = 0.2; g.add(deck); for (let k = -3; k <= 3; k++) part(g, B(0.03, 0.01, 3.4), toon('#5a4030'), k * 0.2, 0.245, -0.1);
    for (const zz of [-1.0, 0.7]) part(g, B(1.45, 0.07, 0.32), wood, 0, 0.5, zz); part(g, B(0.3, 0.35, 0.4), toon('#3a3d44'), 0, 0.4, -2.0); part(g, Cy(0.03, 0.03, 0.5, 4), toon('#2b2a2c'), 0, 0.1, -2.15);
    part(g, B(0.5, 0.3, 0.4), toon('#4fd2ff'), -0.35, 0.25, -1.4); part(g, Cy(0.22, 0.2, 0.3, 8), wood, 0.4, 0.25, 1.3);
    const lan = part(g, new THREE.SphereGeometry(0.09, 6, 4), glow('#ffd36a'), -0.55, 1.0, -1.7); part(g, Cy(0.02, 0.02, 0.6, 4), toon('#2b2a2c'), -0.55, 0.7, -1.7);
    // the fisher sits on the back bench facing over the side, rod gripped in both hands
    const npc = buildChar(() => makeCivilian(shirts[i], '#2c2a28', ['#c58a64', '#8a5a3a', '#e0b892', '#6a4a2a', '#f0c8a8'][i], '#1e1a18', i % 2 ? '#e8e4dc' : null), 'civ'), NR = npc.userData.rig, nh = NR ? NR.spec.hip : 0.95;
    npc.scale.setScalar(0.9); npc.position.set(0, 0.6 - nh * 0.9, -1.0); npc.rotation.y = Math.PI / 2; sitChar(npc, 0.38 / 0.9); g.add(npc);
    // 2.23.49: he really sits on the bench now, and the rod is in his own hands (the old extra arm boxes stuck out of his lap)
    const rod = new THREE.Group(); part(rod, Cy(0.012, 0.03, 2.6, 5), toon('#2b2a2c'), 0, 0.85, 0); part(rod, Cy(0.05, 0.05, 0.08, 8), toon('#c9a43a'), 0.05, -0.12, 0, 0, 0, Math.PI / 2);
    if (NR && NR.armR) { for (const [arm, z] of [[NR.armL, 0.22], [NR.armR, -0.22]]) { arm.rotation.x = -1.1; arm.rotation.z = z; } rod.position.set(0, -(NR.spec.sh - NR.spec.hip) * 0.95, 0.04); rod.rotation.x = 1.71; NR.armR.add(rod); }
    else { rod.position.set(0.05, 1.22, 0.42); rod.rotation.x = 0.95; npc.add(rod); }
    const tip = new THREE.Object3D(); tip.position.set(0, 2.15, 0); rod.add(tip);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#e8e4dc' })); levelGroup.add(line);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), toon('#ff3b2a')); levelGroup.add(bob);
    const fish = new THREE.Group(); part(fish, B(0.12, 0.2, 0.42), toon(fishC[i]), 0, 0, 0); part(fish, B(0.04, 0.2, 0.14), toon(fishC[i]), 0, 0, -0.26); fish.visible = false; levelGroup.add(fish);
    const ry = a + Math.PI / 2 + i; g.position.set(x, WATER_Y - 0.06, z); g.rotation.y = ry; g.userData.boat = 1; levelGroup.add(g); solid(x, z, 2);
    const V = new THREE.Vector3(), W = new THREE.Vector3(); let next = 6 + i * 3, catchT = -1;
    OCB.push(g); INTERACTS.push({ x, z, r: 3.2, get label() { return OCSIT.g === g ? '🎣 Fish off the side' : '🪑 Sit in the boat'; }, fn: () => OCSIT.g === g ? startFishing('Out on the boat', 'sea') : ocSit(g) });
    levelAnims.push(t => { g.position.y = WATER_Y - 0.06 + Math.sin(t * 1.1 + i) * 0.05; g.rotation.z = Math.sin(t * 0.9 + i * 2) * 0.04; g.rotation.x = Math.sin(t * 0.7 + i) * 0.025; g.rotation.y = ry + Math.sin(t * 0.05 + i) * 0.4; lan.visible = ENV.night > 0.3;
      if (t > next && catchT < 0) catchT = t; let k = catchT < 0 ? -1 : t - catchT;
      rod.rotation.x = k < 0 ? 0.95 + Math.sin(t * 0.6 + i) * 0.04 + (Math.sin(t * 3 + i) > 0.97 ? 0.08 : 0) : k < 0.6 ? 0.95 + Math.sin(t * 30) * 0.06 : k < 1.0 ? 0.95 - (k - 0.6) * 1.8 : k < 2.2 ? 0.23 : 0.23 + Math.min(1, (k - 2.2) * 1.2) * 0.72;
      g.updateMatrixWorld(); tip.getWorldPosition(V); npc.localToWorld(W.set(0.05, 0, 2.4)); W.y = WATER_Y + 0.02 + Math.sin(t * 2 + i) * 0.03;
      if (k >= 0.6 && k < 2.2) { const u = Math.min(1, (k - 0.6) / 1.0); npc.localToWorld(W.set(0, 1.2, 0.8)); fish.visible = true; fish.position.copy(V).lerp(W, u * 0.6); fish.position.y -= 0.6 - u * 0.2; fish.rotation.z = Math.sin(t * 25) * 0.6; fish.rotation.y = t * 3; bob.visible = false;
        if (k > 0.6 && k < 0.66 && typeof rfxSplash === 'function') { const w = new THREE.Vector3(); npc.localToWorld(w.set(0.05, 0, 2.4)); rfxSplash(w.x, w.z, 0.4); } }
      else { fish.visible = false; bob.visible = k < 0 || k > 2.6; bob.position.copy(W); }
      if (k > 3.2) { catchT = -1; next = t + 14 + ((i * 7 + Math.floor(t)) % 11); }
      const P = line.geometry.attributes.position; P.setXYZ(0, V.x, V.y, V.z); const e = fish.visible ? fish.position : bob.position; P.setXYZ(1, e.x, e.y, e.z); P.needsUpdate = true; }); }); }
{ const orig = LEVELS.ocean.build; LEVELS.ocean.build = function () { orig.call(this); try { ocBoats(); } catch (e) { console.warn('ocean2 boats', e); } }; }
{ const _rk = respawn; respawn = function () { if (S.kayak) kayakOff(); return _rk.apply(this, arguments); }; }
