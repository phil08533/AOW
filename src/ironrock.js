// =================== FORT IRONROCK, THE FORTRESS (2.23.83) ===================
// Ironrock is one walled citadel now: a 60 x 60 m curtain wall with bastions, a gatehouse on the south side, roofed wings round an open courtyard.
// West wing: Barracks & Med Bay, Mess Hall, Muster Hall with the Sally Port out to the Front. North: Command Hall. East wing: Armory, Lab, Motor Pool hangar.
// The wall top is a rampart you reach by the lifts in the gatehouse towers. Outer walls block by height (you can walk the top), inner walls are plain boxes.
const IR = { X0: -14, X1: 46, Z0: -20, Z1: 40, T: 3, WH: 9, RH: 6.5, CH: 8, walls: [], ramp: [], lifts: [] };
// a box whose texture tiles at real size (one tile per `tile` metres) on every face
function irBox(par, w, h, d, mat, x, y, z, tile) { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, t = tile || 3, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } uv.needsUpdate = true; return part(par, g, mat, x, y, z); }
const irInFort = (x, z, m) => x > IR.X0 - (m || 0) && x < IR.X1 + (m || 0) && z > IR.Z0 - (m || 0) && z < IR.Z1 + (m || 0);
// outer walls block anyone below the rampart; up on the rampart you stay on the walk
function irBlock(p, r, isPlayer) { if (!LEVEL || LEVEL.id !== 'fort' || !irInFort(p.x, p.z, 4)) return;
  if (isPlayer && player.pos.y > IR.WH - 2) { let best = null, bd = 1e9; for (const R of IR.ramp) { const cx = clamp(p.x, R[0] + r, R[1] - r), cz = clamp(p.z, R[2] + r, R[3] - r), d = (cx - p.x) ** 2 + (cz - p.z) ** 2; if (d < bd) { bd = d; best = [cx, cz]; } } if (best) { p.x = best[0]; p.z = best[1]; } return; }
  for (const [x0, x1, z0, z1] of IR.walls) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2, dx = p.x - cx, dz = p.z - cz, ox = hx + r - Math.abs(dx), oz = hz + r - Math.abs(dz);
    if (ox > 0 && oz > 0) { if (ox < oz) p.x += Math.sign(dx) * ox; else p.z += Math.sign(dz) * oz; } } }
{ const _c = collide; collide = function (p, r) { const out = _c.apply(this, arguments); try { irBlock(p, r, p === player.pos); } catch (_) {} return out; }; }

function irBuild() {
  const { X0, X1, Z0, Z1, T, WH, RH, CH } = IR; IR.walls = []; IR.ramp = []; IR.lifts = [];
  const iron = toon('#ffffff', 'ironwall'), trim = toon('#3a3d44'), dark = toon('#2a2c32', 'panel'), steel = toon('#5d636c', 'hull'), haz = toon('#ffffff', 'hazard');
  const wallMat = toon('#c8ccd2', 'ironwall'), inner = toon('#b8bcc4', 'panel');
  // ---- the curtain wall: four sides with three openings (gate south, Sally Port west, hangar door east) ----
  const seg = (x0, x1, z0, z1, walk) => { const w = x1 - x0, d = z1 - z0; if (w <= 0 || d <= 0) return; irBox(props, w, WH, d, wallMat, (x0 + x1) / 2, WH / 2, (z0 + z1) / 2, 4); IR.walls.push([x0, x1, z0, z1]);
    // walk on top, parapets with merlons on the outer edge and a low rail on the inner edge
    irBox(props, w, 0.12, d, toon('#6a6e76', 'grate'), (x0 + x1) / 2, WH + 0.06, (z0 + z1) / 2, 2);
    if (walk) { IR.ramp.push([x0 + 0.35, x1 - 0.35, z0 + 0.35, z1 - 0.35]); SURFACES.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, ux: 1, uz: 0, hl: w / 2, hw: d / 2, y: WH + 0.12 }); } };
  const S1 = [X0, 11, Z0, Z0 + T], S2 = [19, X1, Z0, Z0 + T], N = [X0, X1, Z1 - T, Z1], W1 = [X0, X0 + T, Z0 + T, 21], W2 = [X0, X0 + T, 29, Z1 - T], E1 = [X1 - T, X1, Z0 + T, 21], E2 = [X1 - T, X1, 31, Z1 - T];
  for (const [s, walk] of [[S1, 1], [S2, 1], [N, 0], [W1, 1], [W2, 0], [E1, 1], [E2, 0]]) seg(...s, walk);
  // parapets: merlons along every outer edge, a rail along the inner edge, end rails where a walk stops at an opening
  const merl = (ax, az, bx, bz, ox, oz) => { const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 1.6); for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, x = ax + (bx - ax) * u + ox, z = az + (bz - az) * u + oz; irBox(props, Math.abs(bx - ax) > 0.1 ? 0.9 : 0.4, 1.1, Math.abs(bx - ax) > 0.1 ? 0.4 : 0.9, wallMat, x, WH + 0.67, z, 2); }
    irBox(props, Math.abs(bx - ax) > 0.1 ? L : 0.4, 0.4, Math.abs(bx - ax) > 0.1 ? 0.4 : L, wallMat, (ax + bx) / 2 + ox, WH + 0.32, (az + bz) / 2 + oz, 2); };
  merl(X0, Z0, X1, Z0, 0, 0.2);
  // the walk carries on over the gate lintel, so the south rampart is one run between the bastions
  IR.ramp.push([10.5, 19.5, Z0 + 0.35, Z0 + T - 0.35]); SURFACES.push({ x: 15, z: Z0 + T / 2, ux: 1, uz: 0, hl: 4.2, hw: T / 2, y: WH + 0.12 }); merl(X0, Z1, X1, Z1, 0, -0.2); merl(X0, Z0, X0, 21, 0.2, 0); merl(X0, 29, X0, Z1, 0.2, 0); merl(X1, Z0, X1, 21, -0.2, 0); merl(X1, 31, X1, Z1, -0.2, 0);
  const rail = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), along = Math.abs(bx - ax) > 0.1; part(props, B(along ? L : 0.06, 0.06, along ? 0.06 : L), steel, (ax + bx) / 2, WH + 1.1, (az + bz) / 2); part(props, B(along ? L : 0.05, 0.05, along ? 0.05 : L), steel, (ax + bx) / 2, WH + 0.6, (az + bz) / 2);
    const n = Math.max(1, Math.floor(L / 2)); for (let k = 0; k <= n; k++) { const u = k / n; part(props, B(0.07, 1.1, 0.07), steel, ax + (bx - ax) * u, WH + 0.55, az + (bz - az) * u); } };
  rail(X0 + T - 0.1, Z0 + T - 0.1, X1 - T + 0.1, Z0 + T - 0.1); rail(X0 + T - 0.1, Z0 + T, X0 + T - 0.1, 21); rail(X1 - T + 0.1, Z0 + T, X1 - T + 0.1, 21);
  rail(X0 + 0.3, 21 - 0.1, X0 + T - 0.1, 21 - 0.1); rail(X1 - T + 0.1, 21 - 0.1, X1 - 0.3, 21 - 0.1);
  // buttress ribs and a lit band on the outer faces
  for (let x = X0 + 4; x < X1 - 2; x += 6) if (x < 10 || x > 20) irBox(props, 0.8, WH - 1, 0.6, trim, x, (WH - 1) / 2, Z0 - 0.3, 3);
  for (let z = Z0 + 5; z < Z1 - 2; z += 6) { if (z < 20 || z > 30) irBox(props, 0.6, WH - 1, 0.8, trim, X0 - 0.3, (WH - 1) / 2, z, 3); if (z < 20 || z > 32) irBox(props, 0.6, WH - 1, 0.8, trim, X1 + 0.3, (WH - 1) / 2, z, 3); }
  for (let x = X0 + 4; x < X1 - 2; x += 6) irBox(props, 0.8, WH - 1, 0.6, trim, x, (WH - 1) / 2, Z1 + 0.3, 3);
  for (const [x, z, w, d] of [[(X0 + 11) / 2, Z0 - 0.05, 25, 0.06], [(19 + X1) / 2, Z0 - 0.05, 27, 0.06], [(X0 + X1) / 2, Z1 + 0.05, 60, 0.06], [X0 - 0.05, (Z0 + 21) / 2, 0.06, 41], [X0 - 0.05, (29 + Z1) / 2, 0.06, 11], [X1 + 0.05, (Z0 + 21) / 2, 0.06, 41], [X1 + 0.05, (31 + Z1) / 2, 0.06, 9]]) part(props, B(w, 0.1, d), glow('#ff8a2a'), x, 6.2, z);
  // bastions at the corners: wider, taller blocks with a turret cap and a beacon
  for (const [cx, cz] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) { const sx = Math.sign(cx - 16), sz = Math.sign(cz - 10); irBox(props, 6, WH, 6, wallMat, cx + sx, WH / 2, cz + sz, 4); IR.walls.push([cx + sx - 3, cx + sx + 3, cz + sz - 3, cz + sz + 3]);
    irBox(props, 6.4, 0.3, 6.4, trim, cx + sx, WH + 0.15, cz + sz, 2); const tur = new THREE.Group(); tur.position.set(cx + sx * 2.6, WH + 0.3, cz + sz * 2.6); props.add(tur); part(tur, Cy(1.3, 1.5, 2.4, 10), steel, 0, 1.2, 0); part(tur, Cy(1.5, 1.5, 0.3, 10), trim, 0, 2.5, 0); for (let k = 0; k < 4; k++) part(tur, B(0.3, 0.6, 0.12), glow('#ffd36a'), Math.cos(k * 1.57) * 1.3, 1.4, Math.sin(k * 1.57) * 1.3, 0, -k * 1.57 + 1.57, 0);
    part(tur, Cy(0.18, 0.18, 0.4, 8), glow('#ff3a2a'), 0, 2.9, 0); }
  // ---- the gatehouse: two towers outside the south wall, a lintel with the FORT IRONROCK lightbox, blast doors parked open ----
  for (const gx of [9, 21]) { irBox(props, 4, WH + 3, 5, wallMat, gx, (WH + 3) / 2, Z0 - 1.5, 4); IR.walls.push([gx - 2, gx + 2, Z0 - 4, Z0 + 1]); irBox(props, 4.4, 0.4, 5.4, trim, gx, WH + 3.2, Z0 - 1.5, 2); for (let k = -1; k <= 1; k++) irBox(props, 0.9, 1, 0.4, wallMat, gx + k * 1.4, WH + 3.9, Z0 - 4, 2);
    part(props, B(0.5, 1.6, 0.1), glow('#ffd36a'), gx, 6.5, Z0 - 4.05); }
  irBox(props, 8, WH - 5.5, T, wallMat, 15, 5.5 + (WH - 5.5) / 2, Z0 + T / 2, 4); irBox(props, 8.4, 0.5, 0.5, haz, 15, 5.3, Z0 - 0.1, 1);
  for (const s of [-1, 1]) irBox(props, 0.5, 5.5, 0.6, haz, 15 + s * 4.15, 2.75, Z0 - 0.1, 1);
  for (let k = 0; k < 9; k++) part(props, B(0.12, 0.7, 0.12), steel, 11.4 + k * 0.9, 5.1, Z0 + 1.5); part(props, B(8, 0.14, 0.14), steel, 15, 4.75, Z0 + 1.5); // the portcullis, raised
  { const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#1e2128'); gr.addColorStop(1, '#0e1014'); x.fillStyle = gr; x.fillRect(0, 0, 1024, 160); x.strokeStyle = '#ff8a2a'; x.lineWidth = 6; x.strokeRect(8, 8, 1008, 144);
    x.font = 'bold 92px Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#ff8a2a'; x.shadowBlur = 18; x.fillStyle = '#ffe2c0'; x.fillText('FORT IRONROCK', 512, 84); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const lb = new THREE.Group(); lb.position.set(15, 7.3, Z0 - 0.45); props.add(lb); part(lb, B(7.4, 1.3, 0.3), trim, 0, 0, 0); const f = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 1.1), new THREE.MeshBasicMaterial({ map: t })); f.position.z = -0.16; f.rotation.y = Math.PI; lb.add(f); for (const s of [-1, 1]) part(lb, B(0.12, 0.12, 0.5), steel, s * 3.2, 0.7, 0.2); }
  // ---- the Sally Port: a tunnel through the west wall to the Front, with a hazard frame and a lit plaque inside ----
  irBox(props, T, WH - 4.5, 8, wallMat, X0 + T / 2, 4.5 + (WH - 4.5) / 2, 25, 4); for (const s of [-1, 1]) irBox(props, T + 0.2, 4.5, 0.5, haz, X0 + T / 2, 2.25, 25 + s * 4.1, 1); irBox(props, T + 0.2, 0.5, 8.6, haz, X0 + T / 2, 4.35, 25, 1);
  for (let k = 0; k < 3; k++) part(props, B(T, 0.1, 0.25), glow('#fff1c8'), X0 + T / 2, 4.05, 22.5 + k * 2.5);
  irPlaque(X0 + T + 0.05, 5.6, 25, Math.PI / 2, 'SALLY PORT', 'TO THE FRONT', '#ff8a2a');
  // ---- the hangar door: a tall opening in the east wall with a raised roller door ----
  irBox(props, T, WH - 7, 10, wallMat, X1 - T / 2, 7 + (WH - 7) / 2, 26, 4); irBox(props, T - 0.4, 0.9, 10, toon('#6a6e76', 'ribbed'), X1 - T / 2, 6.5, 26, 1); for (const s of [-1, 1]) irBox(props, T + 0.2, 7, 0.5, haz, X1 - T / 2, 3.5, 26 + s * 5.1, 1);
  // ---- floors: paving in the courtyard, a different floor in every room ----
  const floor = (x0, x1, z0, z1, mat, tile) => irBox(props, x1 - x0, 0.1, z1 - z0, mat, (x0 + x1) / 2, 0.05, (z0 + z1) / 2, tile || 2);
  SURFACES.push({ x: (X0 + X1) / 2 + 4, z: (Z0 + Z1) / 2 - 4, ux: 1, uz: 0, hl: (X1 - X0) / 2 + 4, hw: (Z1 - Z0) / 2 + 4, y: 0.1 }); // one level floor across the fort and its aprons
  const I0 = X0 + T, I1 = X1 - T, J0 = Z0 + T, J1 = Z1 - T;
  floor(5, 25, J0, 15, toon('#8a8478', 'hexplate'), 3); floor(I0, 5, J0, 3, toon('#6e7a84', 'tile'), 1.5); floor(I0, 5, 3, 17, toon('#8a6a4a', 'planks'), 2); floor(I0, 5, 17, J1, toon('#5a5e66', 'grate'), 1.5);
  floor(5, 25, 15, J1, toon('#3a3d44', 'carpet'), 2); floor(25, I1, J0, 1, toon('#6a6e76', 'tread'), 1.5); floor(25, I1, 1, 15, toon('#767c86', 'tile'), 1.2); floor(25, I1, 15, J1, toon('#6a6a62', 'hexplate'), 3);
  floor(X0, X1 + 8, Z0 - 8, Z0, toon('#6a6458', 'hexplate'), 3); floor(X1, X1 + 8, 20, 32, toon('#6a6458', 'hexplate'), 3); // aprons outside the gate and the hangar door
  // ---- inner walls with doorways (h RH; the Command Hall is taller) ----
  const iw = (x0, x1, z0, z1, h, gaps) => { const along = x1 - x0 > z1 - z0, a0 = along ? x0 : z0, a1 = along ? x1 : z1, cuts = [[a0, a0]].concat((gaps || []).sort((p, q) => p[0] - q[0])).concat([[a1, a1]]);
    for (let k = 0; k < cuts.length - 1; k++) { const s0 = cuts[k][1], s1 = cuts[k + 1][0]; if (s1 - s0 < 0.05) continue; const m = (s0 + s1) / 2, L = s1 - s0;
      if (along) { irBox(props, L, h, 0.5, inner, m, h / 2, (z0 + z1) / 2, 3); box(m, (z0 + z1) / 2, L / 2, 0.25); } else { irBox(props, 0.5, h, L, inner, (x0 + x1) / 2, h / 2, m, 3); box((x0 + x1) / 2, m, 0.25, L / 2); } }
    for (const [g0, g1] of gaps || []) { const m = (g0 + g1) / 2, L = g1 - g0; if (along) { irBox(props, L, h - 3.4, 0.5, inner, m, 3.4 + (h - 3.4) / 2, (z0 + z1) / 2, 3); part(props, B(L + 0.3, 0.2, 0.6), trim, m, 3.4, (z0 + z1) / 2); }
      else { irBox(props, 0.5, h - 3.4, L, inner, (x0 + x1) / 2, 3.4 + (h - 3.4) / 2, m, 3); part(props, B(0.6, 0.2, L + 0.3), trim, (x0 + x1) / 2, 3.4, m); } } };
  iw(5, 5.5, J0, 15, RH, [[-9, -6], [7, 10]]); iw(5, 5.5, 15, J1, CH, [[24, 28]]); iw(24.5, 25, J0, 15, RH, [[-9, -6], [6, 9]]); iw(24.5, 25, 15, J1, CH, [[23, 29]]);
  iw(5.5, 24.5, 14.75, 15.25, CH, [[11, 19]]); iw(I0, 5, 2.75, 3.25, RH, [[-6, -3]]); iw(I0, 5, 16.75, 17.25, RH, [[-6, -3]]); iw(25, I1, 0.75, 1.25, RH, [[32, 35]]); iw(25, I1, 14.75, 15.25, RH, [[32, 35]]);
  // ---- roofs over the wings and the Command Hall, with light panels underneath and vents on top ----
  const roof = (x0, x1, z0, z1, h) => { irBox(props, x1 - x0, 0.35, z1 - z0, toon('#4a4e56', 'hexplate'), (x0 + x1) / 2, h + 0.175, (z0 + z1) / 2, 3); irBox(props, x1 - x0, 0.05, z1 - z0, toon('#9aa0aa', 'ceilgrid'), (x0 + x1) / 2, h - 0.03, (z0 + z1) / 2, 2);
    for (let x = x0 + 3; x < x1 - 1; x += 5) for (let z = z0 + 3; z < z1 - 1; z += 5) { part(props, B(1.6, 0.06, 0.7), trim, x, h - 0.08, z); part(props, B(1.4, 0.03, 0.5), glow('#eaf4ff'), x, h - 0.11, z); }
    for (let x = x0 + 4; x < x1 - 2; x += 8) part(props, B(1.2, 0.8, 1.2), steel, x, h + 0.75, (z0 + z1) / 2); };
  roof(I0, 5.5, J0, J1, RH); roof(24.5, I1, J0, J1, RH); roof(5.5, 24.5, 15, J1, CH);
  // ---- the gatehouse lift towers inside the courtyard: ride up to the rampart ----
  for (const [lx, side] of [[9, -1], [21, 1]]) { irBox(props, 3.6, WH + 0.2, 3.4, wallMat, lx, (WH + 0.2) / 2, J0 + 1.7, 3); box(lx, J0 + 1.7, 1.8, 1.7); irBox(props, 2.0, 2.8, 0.1, toon('#2a2c32', 'ribbed'), lx, 1.4, J0 + 3.42, 1);
    for (const s of [-1, 1]) part(props, B(0.2, 3.0, 0.2), haz, lx + s * 1.1, 1.5, J0 + 3.45); part(props, B(2.4, 0.2, 0.2), haz, lx, 3.0, J0 + 3.45); part(props, B(0.3, 0.3, 0.05), glow('#6fdc5a'), lx + 1.4, 1.5, J0 + 3.46);
    IR.lifts.push({ x: lx, zb: J0 + 4.2, zt: Z0 + 1.5 });
    INTERACTS.push({ x: lx, z: J0 + 4.2, r: 1.4, get label() { return player.pos.y < 4 ? '🛗 Lift up to the rampart' : ''; }, fn: () => { if (player.pos.y < 4) irLift(lx, Z0 + 1.5, WH + 0.12, 0); } });
    INTERACTS.push({ x: lx, z: Z0 + 1.5, r: 1.3, get label() { return player.pos.y > 4 ? '🛗 Lift down to the courtyard' : ''; }, fn: () => { if (player.pos.y > 4) irLift(lx, J0 + 4.4, 0, Math.PI); } }); }
  irDress();
}
// a mounted wall plaque: a framed box with lit lettering, fixed flat to a wall face
function irPlaque(x, y, z, ry, title, sub, col) { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#14161c'; g.fillRect(0, 0, 512, 160); g.strokeStyle = col; g.lineWidth = 6; g.strokeRect(6, 6, 500, 148);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.shadowColor = col; g.shadowBlur = 14; g.font = 'bold 64px Impact, sans-serif'; g.fillText(title, 256, sub ? 66 : 82); if (sub) { g.shadowBlur = 0; g.fillStyle = col; g.font = 'bold 28px monospace'; g.fillText(sub, 256, 124); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = ry; props.add(p); part(p, B(2.5, 0.8, 0.1), toon('#3a3d44'), 0, 0, 0.05);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.75), new THREE.MeshBasicMaterial({ map: t })); f.position.z = 0.105; p.add(f); for (const s of [-1, 1]) for (const v of [-1, 1]) part(p, Cy(0.03, 0.03, 0.03, 6), toon('#a8aeb8'), s * 1.15, v * 0.33, 0.115, Math.PI / 2); return p; }
function irLift(x, z, y, yaw) { SFX.ui && SFX.ui(); const f = document.createElement('div'); f.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;transition:opacity .25s;z-index:60;pointer-events:none'; document.body.appendChild(f);
  requestAnimationFrame(() => { f.style.opacity = '1'; }); setTimeout(() => { player.pos.set(x, y, z); player.vy = 0; player.yaw = yaw; f.style.opacity = '0'; setTimeout(() => f.remove(), 300); }, 280); }

// =================== the rooms: every space reads by its furniture; plaques over the courtyard doors ===================
function irMan(x, z, face, opt) { const o = opt || {}, m = buildChar(() => o.civ ? makeCivilian(...o.civ) : recolor(makeTrooper({ noGun: !o.gun }), { '#6f7a3e': o.col || '#5a6a3a' }), o.civ ? 'civ' : 'trooper');
  m.position.set(x, 0.1, z); m.rotation.y = face; levelGroup.add(m); blob(m, 0.4);
  if (o.sit) { const R = m.userData.rig; m.position.y = o.sit + 0.1 - (R ? R.spec.hip : 0.95) + 0.05; sitChar(m, o.sit); if (R) R.torso.rotation.x = -0.05; } else solid(x, z, 0.35);
  const st = {}, ph = x * 1.7 + z; levelAnims.push(t => { if (!m.parent) return; try { animRig(m, st, 1 / 60, t); } catch (_) {} if (o.sway) m.rotation.y = face + Math.sin(t * 0.4 + ph) * o.sway; if (o.eat && m.userData.rig) m.userData.rig.armR.rotation.x = -0.9 - Math.max(0, Math.sin(t * 1.3 + ph)) * 0.6; }); return m; }
function irDress() {
  // every room gets its own wall lining on its outer walls, so neighbouring rooms never share a look
  const { X0, X1, Z0, Z1, T } = IR, I0 = X0 + T, I1 = X1 - T, J0 = Z0 + T, J1 = Z1 - T;
  const line = (x0, x1, z0, z1, col, tex, h) => { const along = x1 - x0 > z1 - z0, L = along ? x1 - x0 : z1 - z0, hh = h || 2.6; irBox(props, along ? L : 0.1, hh, along ? 0.1 : L, toon(col, tex), (x0 + x1) / 2, 0.1 + hh / 2, (z0 + z1) / 2, 1.5); part(props, B(along ? L : 0.18, 0.08, along ? 0.18 : L), toon('#3a3d44'), (x0 + x1) / 2, 0.1 + hh + 0.04, (z0 + z1) / 2); };
  line(I0, I0 + 0.1, J0, -7, '#a8b4bc', 'tile'); line(I0, 5, J0, J0 + 0.1, '#a8b4bc', 'tile'); line(I0, I0 + 0.1, -7, 2.75, '#6a7a52', 'panel'); line(I0, I0 + 0.1, 3.25, 16.75, '#8a6a4a', 'woodwall');
  line(I0, I0 + 0.1, 17.25, 21, '#8a8e94', 'stucco'); line(I0, I0 + 0.1, 29, J1, '#8a8e94', 'stucco'); line(I0, 5, J1 - 0.1, J1, '#8a8e94', 'stucco');
  line(5.5, 24.5, J1 - 0.1, J1, '#5a3a28', 'woodwall', 3.2); line(25, I1, J0, J0 + 0.1, '#6a6e76', 'ribbed'); line(I1 - 0.1, I1, J0, 0.75, '#6a6e76', 'ribbed'); line(I1 - 0.1, I1, 1.25, 14.75, '#aab4bc', 'panel');
  line(I1 - 0.1, I1, 15.25, 21, '#8a8a70', 'ribbed', 3.5); line(I1 - 0.1, I1, 31, J1, '#8a8a70', 'ribbed', 3.5); line(25, I1, J1 - 0.1, J1, '#8a8a70', 'ribbed', 3.5);
  const trim = toon('#3a3d44'), steel = toon('#5d636c', 'hull'), dk = toon('#22252c'), wood = toon('#6a4a30', 'wood'), olive = toon('#4a5a32', 'cloth'), white = toon('#e8e4dc'), chrome = toon('#a8aeb8');
  // ---- courtyard: facades with framed doors, lit windows and plaques; a flag, lamps, painted parade lines, crates, a jeep and gate guards ----
  const win = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 2.1, z); g.rotation.y = ry; props.add(g); part(g, B(2.0, 1.3, 0.12), trim, 0, 0, 0); part(g, B(1.8, 1.1, 0.02), glow('#a8c8e8'), 0, 0, 0.07); part(g, B(0.08, 1.1, 0.06), trim, 0, 0, 0.09); part(g, B(2.1, 0.1, 0.25), trim, 0, -0.68, 0.1); };
  for (const z of [-14, -2, 2, 12]) { win(5.56, z, Math.PI / 2); win(24.44, z, -Math.PI / 2); } for (const x of [7.5, 22.5]) win(x, 14.69, Math.PI);
  const door = (x, z, ry, w, title, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; props.add(g); for (const s of [-1, 1]) part(g, B(0.3, 3.5, 0.3), trim, s * (w / 2 + 0.1), 1.75, 0.2); part(g, B(w + 0.5, 0.35, 0.3), trim, 0, 3.55, 0.2);
    part(g, B(0.3, 0.3, 0.12), glow('#fff1c8'), w / 2 + 0.6, 2.6, 0.12); irPlaque(x + Math.sin(ry) * 0.02, 4.4, z + Math.cos(ry) * 0.02, ry, title, '', col); };
  door(5.5, -7.5, Math.PI / 2, 3, 'MED BAY', '#c8402f'); door(5.5, 8.5, Math.PI / 2, 3, 'MESS HALL', '#ffd36a'); door(24.5, -7.5, -Math.PI / 2, 3, 'ARMORY', '#ff8a2a'); door(24.5, 7.5, -Math.PI / 2, 3, 'RESEARCH', '#4fd2ff'); door(15, 14.75, Math.PI, 8, 'COMMAND', '#6fdc5a');
  for (const [x0, z0, x1, z1] of [[7, -11, 23, -11], [7, -1, 23, -1], [7, -11, 7, -1], [23, -11, 23, -1]]) part(props, B(Math.abs(x1 - x0) || 0.12, 0.012, Math.abs(z1 - z0) || 0.12), toon('#e8e2c8'), (x0 + x1) / 2, 0.106, (z0 + z1) / 2);
  { const f = new THREE.Group(); f.position.set(15, 0.1, -6); props.add(f); part(f, Cy(0.6, 0.8, 0.4, 10), trim, 0, 0.2, 0); part(f, Cy(0.07, 0.09, 11, 8), chrome, 0, 5.9, 0); part(f, new THREE.SphereGeometry(0.16, 8, 6), toon('#ffd36a'), 0, 11.5, 0); solid(15, -6, 0.6);
    const c = document.createElement('canvas'); c.width = 128; c.height = 80; const x = c.getContext('2d'); x.fillStyle = '#3a4a2a'; x.fillRect(0, 0, 128, 80); x.fillStyle = '#ff8a2a'; x.fillRect(0, 34, 128, 12); x.fillStyle = '#e8e2c8'; x.beginPath(); x.moveTo(20, 40); x.lineTo(40, 14); x.lineTo(60, 40); x.lineTo(40, 66); x.fill();
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5, 8, 1), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c), side: THREE.DoubleSide })); fl.position.set(1.25, 10.6, 0); const fg = new THREE.Group(); fg.position.copy(f.position); levelGroup.add(fg); fg.add(fl);
    const P = fl.geometry.attributes.position, X0 = Float32Array.from(P.array); levelAnims.push(t => { for (let i = 0; i < P.count; i++) { const u = (X0[i * 3] + 1.2) / 2.4; P.setZ(i, Math.sin(t * 3 + u * 5) * 0.18 * u); } P.needsUpdate = true; }); }
  for (const [x, z] of [[6.5, -15.5], [23.5, -15.5], [6.5, 13], [23.5, 13]]) { part(props, Cy(0.08, 0.12, 4.2, 6), trim, x, 2.2, z); part(props, B(0.6, 0.18, 0.4), trim, x, 4.3, z); part(props, B(0.5, 0.05, 0.3), glow('#fff1c8'), x, 4.2, z); solid(x, z, 0.2); }
  const crate = (x, z, s, c) => { irBox(props, s, s, s, toon(c || '#6a5a3a', 'planks'), x, 0.1 + s / 2, z, 1); part(props, B(s + 0.02, 0.06, s + 0.02), trim, x, 0.1 + s * 0.2, z); part(props, B(s + 0.02, 0.06, s + 0.02), trim, x, 0.1 + s * 0.8, z); };
  for (const [x, z, n] of [[7, 3, 3], [23, -3, 2], [7, -15, 2]]) { for (let k = 0; k < n; k++) crate(x, z + k * 1.1, 1); crate(x + 0.05, z + 0.5, 0.9); box(x, z + n * 0.55 - 0.5, 0.6, n * 0.55 + 0.1); }
  for (const s of [-1, 1]) { for (let k = 0; k < 4; k++) part(props, B(0.9, 0.35, 0.45), toon('#8a7a58', 'cloth'), 15 + s * 3.2, 0.3 + (k % 2) * 0.33, -15.8 + Math.floor(k / 2) * 0.01 - (k > 1 ? 0 : 0), 0, (k % 2) * 0.1, 0); irMan(15 + s * 3.2, -14.6, 0, { gun: 1, col: '#3a4a2a' }); }
  { const j = makeBattleCar(); j.scale.setScalar(0.6); j.position.set(20.5, 0.1, 4); j.rotation.y = -0.5; props.add(j); box(20.5, 4, 1.4, 1.4); }
  // ---- Med Bay (south half of the west wing): beds with curtains, a cabinet, a scanner arch ----
  for (let k = 0; k < 3; k++) { const z = -15 + k * 3; irBox(props, 2.0, 0.5, 0.9, white, -8.5, 0.35, z, 1); part(props, B(0.6, 0.15, 0.85), toon('#c8d8e8', 'cloth'), -9.2, 0.65, z); part(props, B(0.06, 1.0, 0.9), chrome, -9.55, 0.6, z); for (const s of [-1, 1]) part(props, B(2.0, 0.04, 0.04), chrome, -8.5, 2.2, z + s * 0.75); part(props, B(1.8, 1.6, 0.02), toon('#8ab8d8', 'cloth'), -8.5, 1.4, z + 0.76); box(-8.5, z, 1.0, 0.45); part(props, B(0.4, 0.6, 0.06), glow('#6fdc5a'), -10.4, 1.6, z); }
  irBox(props, 0.6, 2.0, 2.4, white, 4.5, 1.1, -14, 1); part(props, B(0.02, 0.5, 0.5), toon('#c8402f'), 4.18, 1.6, -14); part(props, B(0.02, 0.16, 0.5), white, 4.17, 1.6, -14); box(4.5, -14, 0.3, 1.2);
  irMan(-8.6, -12, Math.PI / 2, { sit: 0.6, col: '#6f7a3e' });
  // ---- Barracks (north half of the west wing): bunks and lockers ----
  for (let k = 0; k < 4; k++) { const z = -5 + k * 2.2; irBox(props, 2.0, 0.08, 0.9, wood, -9.6, 0.5, z, 1); irBox(props, 2.0, 0.08, 0.9, wood, -9.6, 1.6, z, 1); part(props, B(1.9, 0.14, 0.85), olive, -9.6, 0.62, z); part(props, B(1.9, 0.14, 0.85), olive, -9.6, 1.72, z); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(props, B(0.06, 1.9, 0.06), steel, -9.6 + sx * 0.97, 1.0, z + sz * 0.42); box(-9.6, z, 1.0, 0.45); }
  for (let k = 0; k < 6; k++) { const z = -5.5 + k * 1.3; irBox(props, 0.55, 1.9, 0.6, toon('#5a6a4a', 'panel'), 4.4, 1.05, z, 1); part(props, B(0.02, 0.3, 0.06), chrome, 4.1, 1.2, z + 0.2); } box(4.4, -2.25, 0.3, 3.9);
  // ---- Mess Hall: long tables and benches, a serving line, soldiers eating ----
  for (let r = 0; r < 3; r++) { const z = 6 + r * 3.6; irBox(props, 7, 0.1, 1.1, wood, -3.5, 0.85, z, 1.5); for (const sx of [-2.8, 0, 2.8]) part(props, B(0.12, 0.75, 0.9), trim, -3.5 + sx, 0.45, z); for (const s of [-1, 1]) { irBox(props, 7, 0.08, 0.35, wood, -3.5, 0.5, z + s * 0.85, 1.5); part(props, B(6.6, 0.4, 0.08), trim, -3.5, 0.3, z + s * 0.85); }
    for (let k = 0; k < 5; k++) { part(props, B(0.35, 0.03, 0.25), toon('#9aa1aa'), -6.3 + k * 1.4, 0.92, z - 0.25); part(props, Cy(0.05, 0.05, 0.12, 8), white, -6.0 + k * 1.4, 0.97, z + 0.25); } box(-3.5, z, 3.6, 1.1); }
  irBox(props, 1.0, 1.0, 9, steel, -9.0, 0.6, 10, 2); irBox(props, 1.1, 0.06, 9.2, chrome, -9.0, 1.12, 10, 1); for (let k = 0; k < 5; k++) { part(props, B(0.7, 0.12, 1.2), chrome, -9.0, 1.18, 6.5 + k * 1.8); part(props, B(0.6, 0.06, 1.0), toon(['#c86a2a', '#6fdc5a', '#e8d8a0', '#8a4a2a', '#c8402f'][k]), -9.0, 1.24, 6.5 + k * 1.8); } box(-9.0, 10, 0.5, 4.5);
  irMan(-10.3, 12, Math.PI / 2, { civ: ['#e8e4dc', '#2c2a28', '#c58a64', '#1e1a18', '#e8e4dc'] });
  for (const [x, z, f] of [[-5.6, 5.15, 0], [-2, 5.15, 0], [-4.2, 6.85, Math.PI], [-0.6, 12.35, 0], [-6.5, 10.45, Math.PI], [-3, 8.75, 0]]) irMan(x, z, f, { sit: 0.54, eat: 1, col: ['#5a6a3a', '#3a4a2a', '#6f7a3e'][Math.floor(x * 7) & 1 ? 1 : 0] });
  irPlaque(-10.85, 2.8, 14.5, Math.PI / 2, "TODAY: SLOP", 'SAME AS YESTERDAY', '#ffd36a');
  // ---- Muster Hall by the Sally Port: weapon racks, ammo, a briefing board, troopers waiting to go ----
  for (let k = 0; k < 3; k++) { const z = 31 + k * 2; irBox(props, 0.4, 1.8, 1.6, trim, 4.4, 1.0, z, 1); for (let g = 0; g < 4; g++) part(props, B(0.1, 1.1, 0.06), dk, 4.15, 1.2, z - 0.6 + g * 0.4); } box(4.4, 33, 0.3, 2.9);
  for (const [x, z] of [[-9.5, 34.5], [-8.3, 34.5], [-9.5, 35.6], [0.5, 19], [1.6, 19]]) crate(x, z, 0.9, '#4a5a32');
  { const g = new THREE.Group(); g.position.set(-1, 0, 36.7); props.add(g); part(g, B(4, 2.2, 0.1), trim, 0, 2.0, 0); const c = document.createElement('canvas'); c.width = 512; c.height = 280; const x = c.getContext('2d'); x.fillStyle = '#1a2a1a'; x.fillRect(0, 0, 512, 280); x.strokeStyle = '#6fdc5a'; x.lineWidth = 3;
    for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(60 + k * 6, 30); for (let y = 30; y < 260; y += 20) x.lineTo(60 + k * 6 + Math.sin(y * 0.05 + k) * 10, y); x.stroke(); } x.strokeStyle = '#ff4a3a'; x.beginPath(); x.moveTo(420, 30); for (let y = 30; y < 260; y += 20) x.lineTo(420 + Math.sin(y * 0.04) * 12, y); x.stroke();
    x.fillStyle = '#e8e2c8'; x.font = 'bold 26px Impact'; x.fillText('THE FRONT', 200, 40); x.font = '18px monospace'; x.fillText('HOLD. THE. LINE.', 180, 260); x.fillStyle = '#ffd36a'; for (const [a, b] of [[230, 120], [260, 170], [300, 90]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(a + 40, b - 10); x.lineTo(a + 34, b + 2); x.fill(); }
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.0), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) })); bd.position.set(0, 2.0, -0.06); bd.rotation.y = Math.PI; g.add(bd); }
  for (const [x, z] of [[-3, 35.2], [-1, 35.4], [1, 35.1]]) for (let k = 0; k < 1; k++) irMan(x, z, Math.PI, { gun: 1, sway: 0.15 });
  for (let k = 0; k < 5; k++) part(props, B(1.2, 0.012, 0.25), toon('#ffd36a'), -9.6 + k * 2.2, 0.107, 25, 0, 0, 0);
  for (let k = 0; k < 6; k++) part(props, B(0.9, 0.35, 0.45), toon('#8a7a58', 'cloth'), -10.4 + (k % 3) * 0.95, 0.3 + Math.floor(k / 3) * 0.34, 21.3); for (let k = 0; k < 6; k++) part(props, B(0.9, 0.35, 0.45), toon('#8a7a58', 'cloth'), -10.4 + (k % 3) * 0.95, 0.3 + Math.floor(k / 3) * 0.34, 28.7); box(-9.45, 21.3, 1.45, 0.3); box(-9.45, 28.7, 1.45, 0.3);
  // ---- Command Hall: a holo war table of the Front, consoles, a big wall screen, banners and two officers ----
  { const X = 15, Z = 26; irBox(props, 6, 0.9, 3.4, trim, X, 0.55, Z, 2); irBox(props, 6.2, 0.08, 3.6, chrome, X, 1.04, Z, 1); part(props, B(5.8, 0.02, 3.2), toon('#0a1624'), X, 1.09, Z); for (let k = 0; k < 8; k++) part(props, B(0.03, 0.01, 3.0), glow('#2a6a3a'), X - 2.6 + k * 0.75, 1.105, Z); box(X, Z, 3.1, 1.8);
    const holo = new THREE.Group(); holo.position.set(X, 1.12, Z); levelGroup.add(holo); for (let k = 0; k < 6; k++) part(holo, B(0.08, 0.25, 2.8), glow('#4fd2ff'), -2.0 + k * 0.18, 0.13, Math.sin(k) * 0.05); part(holo, B(0.1, 0.25, 2.8), glow('#ff4a3a'), 2.2, 0.13, 0);
    const blips = []; for (let k = 0; k < 10; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), glow(k < 5 ? '#6fdc5a' : '#ff4a3a')); holo.add(b); blips.push(b); } levelAnims.push(t => blips.forEach((b, k) => { const ours = k < 5, u = (Math.sin(t * 0.3 + k * 1.7) + 1) / 2; b.position.set(ours ? -1.6 + u * 1.6 : 2.0 - u * 1.6, 0.2, -1.2 + (k % 5) * 0.6); }));
    const cone = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.8, 3.0), new THREE.MeshBasicMaterial({ color: '#4fd2ff', transparent: true, opacity: 0.06, depthWrite: false })); cone.position.set(X, 1.5, Z); levelGroup.add(cone); }
  for (let k = 0; k < 5; k++) { const x = 8 + k * 3.5, g = new THREE.Group(); g.position.set(x, 0.1, 36.2); props.add(g); part(g, B(2.6, 1.0, 0.7), trim, 0, 0.5, 0); part(g, B(2.4, 0.06, 0.5), dk, 0, 1.05, 0.05, -0.3); part(g, B(2.2, 0.02, 0.4), glow(['#4fd2ff', '#6fdc5a', '#ffd36a'][k % 3]), 0, 1.09, 0.06, -0.3); part(g, B(2.4, 1.0, 0.08), dk, 0, 1.9, -0.25); part(g, B(2.2, 0.85, 0.02), glow('#0e2a3a'), 0, 1.9, -0.2); box(x, 36.2, 1.3, 0.4); }
  { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const x = c.getContext('2d'); x.fillStyle = '#06121c'; x.fillRect(0, 0, 512, 160); x.strokeStyle = '#4fd2ff'; x.lineWidth = 2; for (let k = 0; k < 20; k++) { x.beginPath(); x.moveTo(k * 26, 0); x.lineTo(k * 26, 160); x.globalAlpha = 0.25; x.stroke(); } x.globalAlpha = 1;
    x.fillStyle = '#6fdc5a'; x.fillRect(150, 30, 6, 100); x.fillStyle = '#ff4a3a'; x.fillRect(360, 30, 6, 100); x.fillStyle = '#e8f4ff'; x.font = 'bold 28px Impact'; x.textAlign = 'center'; x.fillText('SECTOR STATUS · THE FRONT', 256, 152);
    const g = new THREE.Group(); g.position.set(15, 4.9, 36.85); props.add(g); part(g, B(9.4, 2.9, 0.2), trim, 0, 0, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); sc.position.z = -0.11; sc.rotation.y = Math.PI; g.add(sc); }
  for (const [x, ry] of [[5.8, Math.PI / 2], [24.2, -Math.PI / 2]]) for (const z of [20, 32]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; props.add(g); part(g, B(0.1, 0.1, 1.8), chrome, 0.15, 7.3, 0); part(g, B(0.04, 4.2, 1.6), toon('#3a4a2a', 'cloth'), 0.12, 5.1, 0); part(g, B(0.05, 0.5, 1.6), toon('#ff8a2a', 'cloth'), 0.13, 5.3, 0); }
  for (let z = 15.5; z < 25; z += 1) part(props, B(2.4, 0.01, 0.98), toon('#6a1a20', 'carpet'), 15, 0.106, z + 0.5);
  irMan(10.5, 35.2, 0, { sway: 0.2 }); irMan(20, 35.2, 0, { sway: 0.2 });
  // ---- Armory: Brix's counter, gun racks, armour stands and ammo ----
  irBox(props, 1.0, 1.05, 12, toon('#4a3a2a', 'wood'), 36.5, 0.62, -8, 2); irBox(props, 1.2, 0.06, 12.2, steel, 36.5, 1.16, -8, 1); box(36.5, -8, 0.5, 6);
  for (let k = 0; k < 4; k++) { const z = -14 + k * 3.5; irBox(props, 0.4, 2.4, 2.6, trim, 42.6, 1.3, z, 1); for (let g = 0; g < 5; g++) { const gm = makeGunModel(['g70', 'g80', 'r15', 'b5', 'p35'][(g + k) % 5] || 'b1'); gm.scale.setScalar(1.2); gm.rotation.set(0, Math.PI / 2, Math.PI / 2); gm.position.set(42.25, 1.4, z - 1 + g * 0.5); props.add(gm); } }
  for (const [x, z] of [[28, -15], [31, -15], [34, -15]]) { const m = makeTrooper({ noGun: true }); m.position.set(x, 0.3, z); props.add(m); irBox(props, 0.9, 0.2, 0.9, trim, x, 0.2, z, 1); solid(x, z, 0.5); }
  for (const [x, z] of [[27, -1.5], [28.2, -1.5], [30.5, -1.5]]) crate(x, z, 0.8, '#4a5a32');
  // ---- Research Lab: benches with screens, a containment tube, server racks ----
  for (const [x, z] of [[29, 4], [29, 10.5]]) { irBox(props, 3.2, 0.08, 1.2, white, x, 0.95, z, 1); for (const s of [-1, 1]) part(props, B(0.08, 0.85, 1.1), chrome, x + s * 1.5, 0.5, z); part(props, B(0.8, 0.5, 0.05), dk, x - 0.6, 1.3, z - 0.4, -0.2); part(props, B(0.7, 0.4, 0.02), glow('#4fd2ff'), x - 0.6, 1.3, z - 0.37, -0.2); for (let k = 0; k < 3; k++) part(props, Cy(0.05, 0.05, 0.2, 8), glow(['#6fdc5a', '#c86aff', '#ffd36a'][k]), x + 0.4 + k * 0.25, 1.09, z + 0.1); box(x, z, 1.6, 0.6); }
  { const X = 33, Z = 12.5; part(props, Cy(1.0, 1.1, 0.3, 16), trim, X, 0.25, Z); part(props, Cy(1.0, 1.0, 0.3, 16), trim, X, 3.0, Z); const gl = new THREE.Mesh(Cy(0.9, 0.9, 2.5, 20, 1, true), new THREE.MeshPhongMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); gl.position.set(X, 1.65, Z); levelGroup.add(gl);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), glow('#9fff6a')); core.position.set(X, 1.65, Z); levelGroup.add(core); levelAnims.push(t => { core.rotation.y = t; core.rotation.x = t * 0.7; core.position.y = 1.65 + Math.sin(t * 2) * 0.1; }); solid(X, Z, 1.1); }
  for (let k = 0; k < 4; k++) { const z = 3 + k * 1.1; irBox(props, 0.8, 2.2, 1.0, dk, 42.4, 1.2, z, 1); for (let r = 0; r < 6; r++) part(props, B(0.02, 0.05, 0.6), glow(r % 2 ? '#6fdc5a' : '#4fd2ff'), 41.99, 0.5 + r * 0.3, z); } box(42.4, 4.65, 0.4, 2.2);
  // ---- Motor Pool hangar: the tank, a battle car and a mech on lifts, tool carts and an overhead crane ----
  [[makeTankModel, 30, 31, 0.9, 0], [makeBattleCar, 36.5, 31, 0.7, 0], [makeMechModel, 40, 19, 0.6, -Math.PI / 2]].forEach(([mk, x, z, sc, ry]) => { const v = mk(); v.scale.setScalar(sc); v.position.set(x, 0.3, z); v.rotation.y = ry; props.add(v); irBox(props, 4.4, 0.2, 5.4, toon('#ffffff', 'hazard'), x, 0.2, z, 1); box(x, z, 2.0, 2.5); if (v.userData.anim) levelAnims.push(t => v.userData.anim(t * 0.2)); });
  for (const z of [17, 35.5]) irBox(props, 18, 0.4, 0.4, toon('#c8a020'), 34, 6.0, z, 2); const crane = new THREE.Group(); levelGroup.add(crane); part(crane, B(0.5, 0.5, 18.9), toon('#c8a020'), 0, 0, 0); part(crane, Cy(0.02, 0.02, 3, 4), steel, 0, -1.5, 0); part(crane, B(0.5, 0.3, 0.3), dk, 0, -3.1, 0); levelAnims.push(t => crane.position.set(34 + Math.sin(t * 0.1) * 6, 5.75, 26.25));
  for (const [x, z] of [[27, 19], [27, 21.5]]) { irBox(props, 1.2, 0.9, 0.6, toon('#c8402f', 'hull'), x, 0.6, z, 1); for (let k = 0; k < 3; k++) part(props, B(1.1, 0.04, 0.5), dk, x, 0.5 + k * 0.25, z); box(x, z, 0.6, 0.3); }
  irMan(34, 34, Math.PI / 2, { civ: ['#3a4a5a', '#2c2a28', '#8a5a3a', '#1e1a18', '#ffd36a'] });
  irDecor();
}
// 2.23.87: a second dressing pass so every room reads lived-in: hanging lamps, wall pipes, furniture and clutter that fits each room's job
function irDecor() {
  const { RH } = IR, trim = toon('#3a3d44'), steel = toon('#5d636c', 'hull'), dk = toon('#22252c'), wood = toon('#6a4a30', 'wood'), white = toon('#e8e4dc'), chrome = toon('#a8aeb8'), olive = toon('#4a5a32', 'cloth');
  const lamp = (x, z, h, col) => { part(props, Cy(0.015, 0.015, 1.1, 4), dk, x, h - 0.55, z); part(props, Cy(0.08, 0.38, 0.28, 10, 1, true), trim, x, h - 1.2, z); part(props, Cy(0.3, 0.3, 0.02, 10), glow(col || '#fff1c8'), x, h - 1.33, z); };
  const pipe = (x0, x1, z0, z1, y, col) => { const along = Math.abs(x1 - x0) > Math.abs(z1 - z0), L = along ? x1 - x0 : z1 - z0; part(props, Cy(0.09, 0.09, L, 8), toon(col || '#6a6e76', 'hull'), (x0 + x1) / 2, y, (z0 + z1) / 2, along ? 0 : Math.PI / 2, 0, along ? Math.PI / 2 : 0);
    for (let k = 1; k < L / 2; k++) part(props, B(along ? 0.06 : 0.3, 0.24, along ? 0.3 : 0.06), dk, along ? x0 + k * 2 : (x0 + x1) / 2, y, along ? (z0 + z1) / 2 : z0 + k * 2); };
  const chair = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0.1, z); g.rotation.y = ry; props.add(g); part(g, B(0.45, 0.06, 0.45), dk, 0, 0.45, 0); part(g, B(0.45, 0.5, 0.06), dk, 0, 0.72, -0.2); part(g, Cy(0.03, 0.03, 0.42, 6), chrome, 0, 0.22, 0); part(g, B(0.4, 0.03, 0.4), chrome, 0, 0.03, 0); };
  const drum = (x, z, c) => { part(props, Cy(0.3, 0.3, 0.9, 12), toon(c || '#4a5a32', 'hull'), x, 0.55, z); for (const y of [0.3, 0.8]) part(props, Cy(0.31, 0.31, 0.04, 12), dk, x, 0.1 + y, z); solid(x, z, 0.32); };
  // hanging lamps in every roofed room, warm in the living rooms and cold white in the work rooms
  for (const z of [-14, -9, -4, 0]) for (const x of [-7, -1]) lamp(x, z, RH, '#e8f4ff');
  for (const z of [6, 9.6, 13.2]) for (const x of [-5.5, -1.5]) lamp(x, z, RH, '#ffd9a0');
  for (const z of [21, 26, 31]) for (const x of [-6, 0]) lamp(x, z, RH, '#fff1c8');
  for (const z of [-13, -7, -2]) for (const x of [30, 38]) lamp(x, z, RH, '#fff1c8');
  for (const z of [4, 10]) for (const x of [31, 38]) lamp(x, z, RH, '#dff4ff');
  // service pipes along the outer walls, one run per room so nothing passes through a wall
  for (const [z0, z1] of [[-16.6, 2.4], [3.6, 16.4], [17.6, 36.6]]) { pipe(-10.6, -10.6, z0, z1, RH - 0.5); pipe(-10.6, -10.6, z0, z1, RH - 0.85, '#7a3a2a'); }
  for (const [z0, z1] of [[-16.6, 0.4], [1.6, 14.4]]) { pipe(42.6, 42.6, z0, z1, RH - 0.5); pipe(42.6, 42.6, z0, z1, RH - 0.85, '#2a5a7a'); }
  // Med Bay: drip stands by the beds, a supply shelf, the doctor's desk and a lit red-cross plaque
  for (let k = 0; k < 3; k++) { const z = -15 + k * 3 + 0.55; part(props, Cy(0.02, 0.02, 1.8, 6), chrome, -7.2, 1.0, z); part(props, B(0.25, 0.03, 0.03), chrome, -7.2, 1.85, z); part(props, B(0.12, 0.2, 0.05), toon('#cfe8ff'), -7.12, 1.7, z); part(props, Cy(0.18, 0.2, 0.04, 8), dk, -7.2, 0.12, z); }
  irBox(props, 2.6, 2.0, 0.5, white, -2, 1.1, -16.6, 1); for (let r = 0; r < 3; r++) { part(props, B(2.5, 0.04, 0.45), chrome, -2, 0.6 + r * 0.6, -16.55); for (let k = 0; k < 5; k++) part(props, B(0.3, 0.25, 0.3), toon(['#e8e4dc', '#c8402f', '#8ab8d8'][(k + r) % 3]), -3 + k * 0.5, 0.75 + r * 0.6, -16.5); } box(-2, -16.6, 1.3, 0.3);
  irBox(props, 1.8, 0.08, 0.9, wood, 1.5, 0.85, -15.9, 1); for (const s of [-1, 1]) part(props, B(0.06, 0.75, 0.8), trim, 1.5 + s * 0.85, 0.45, -15.9); part(props, B(0.6, 0.4, 0.05), dk, 1.5, 1.15, -16.2); part(props, B(0.55, 0.34, 0.02), glow('#6fdc5a'), 1.5, 1.15, -16.17); chair(1.5, -15.1, Math.PI); box(1.5, -15.9, 0.9, 0.45);
  irPlaque(-6, 3.2, -16.84, 0, 'MED BAY', 'CPL. PATCH ON DUTY', '#c8402f');
  // Barracks: footlockers at the bunks, a card table with two chairs, a rug
  for (let k = 0; k < 4; k++) { const z = -5 + k * 2.2; irBox(props, 0.5, 0.4, 0.8, olive, -8.2, 0.3, z, 1); part(props, B(0.1, 0.06, 0.04), chrome, -7.94, 0.42, z); } box(-8.2, -1.7, 0.25, 3.7);
  part(props, B(3, 0.012, 2.2), toon('#6a2a20', 'carpet'), -1.5, 0.106, -1.5); irBox(props, 1.0, 0.06, 1.0, wood, -1.5, 0.8, -1.5, 1); part(props, Cy(0.06, 0.06, 0.7, 6), trim, -1.5, 0.45, -1.5); for (let k = 0; k < 6; k++) part(props, B(0.09, 0.005, 0.13), white, -1.75 + k * 0.1, 0.835, -1.5 + (k % 2) * 0.1, 0, k * 0.4, 0);
  chair(-1.5, -0.7, Math.PI); chair(-1.5, -2.3, 0); box(-1.5, -1.5, 0.5, 1.1);
  // Mess Hall: a drinks cooler, a water cooler, a wall TV and bins
  irBox(props, 1.1, 2.0, 0.7, toon('#c8402f', 'panel'), 3.4, 1.1, 16.2, 1); part(props, B(0.8, 1.2, 0.02), glow('#dff4ff'), 3.4, 1.3, 15.84); box(3.4, 16.2, 0.55, 0.35);
  part(props, B(0.4, 0.9, 0.4), white, 4.4, 0.55, 4.2); part(props, Cy(0.16, 0.16, 0.45, 10), toon('#8ab8e8'), 4.4, 1.25, 4.2); solid(4.4, 4.2, 0.25);
  { const g = new THREE.Group(); g.position.set(4.68, 3.0, 10); g.rotation.y = -Math.PI / 2; props.add(g); part(g, B(2.0, 1.15, 0.1), dk, 0, 0, 0); part(g, B(1.85, 1.0, 0.02), glow('#3a6aa8'), 0, 0, 0.06); part(g, B(0.15, 0.6, 0.15), dk, 0, 0.8, -0.05); }
  for (const z of [5, 15.5]) { part(props, Cy(0.25, 0.22, 0.7, 10), steel, 2.6, 0.45, z); solid(2.6, z, 0.26); }
  // Muster Hall: ready benches either side of the walkway, a row of kit lockers, ammo boxes
  for (const z of [19.6, 30.4]) for (const x0 of [-5, 0]) { irBox(props, 3.2, 0.08, 0.45, wood, x0, 0.5, z, 1); for (const s of [-1, 1]) part(props, B(0.08, 0.4, 0.4), trim, x0 + s * 1.5, 0.3, z); box(x0, z, 1.6, 0.25); }
  for (let k = 0; k < 6; k++) { const z = 19.2 + k * 0.7; irBox(props, 0.6, 2.0, 0.65, toon('#4a5a3a', 'panel'), 4.4, 1.1, z, 1); part(props, B(0.02, 0.25, 0.05), chrome, 4.08, 1.25, z + 0.2); } box(4.4, 20.95, 0.3, 2.1);
  for (const [x, z] of [[2.2, 33.5], [2.2, 34.2], [-6, 33.8]]) { irBox(props, 0.6, 0.35, 0.4, olive, x, 0.28, z, 1); part(props, B(0.5, 0.06, 0.06), chrome, x, 0.47, z); }
  // Command Hall: chairs at the consoles
  for (let k = 0; k < 5; k++) chair(8 + k * 3.5, 35.3, Math.PI);
  // Armory: a gunsmith's workbench, a training dummy, an ammo stack and a QUARTERMASTER plaque
  irBox(props, 2.4, 0.08, 1.0, wood, 29, 0.95, -8, 1); for (const s of [-1, 1]) part(props, B(0.08, 0.85, 0.9), trim, 29 + s * 1.1, 0.5, -8); part(props, B(0.25, 0.2, 0.2), steel, 28.2, 1.1, -8.2); { const gm = makeGunModel('g70'); gm.position.set(29.3, 1.05, -7.9); gm.rotation.set(0, 0.4, Math.PI / 2); props.add(gm); } box(29, -8, 1.2, 0.5);
  { const d = makeTrooper({ noGun: true }); d.traverse(c => { if (c.isMesh) c.material = toon('#a88a5a', 'cloth'); }); d.position.set(32, 0.1, -5); d.rotation.y = Math.PI; props.add(d); part(props, Cy(0.05, 0.05, 0.8, 6), wood, 32, 0.4, -5); solid(32, -5, 0.4); }
  for (let k = 0; k < 6; k++) irBox(props, 0.6, 0.35, 0.4, olive, 26.4 + (k % 2) * 0.65, 0.28 + Math.floor(k / 2) * 0.36, -11, 1); box(26.7, -11, 0.65, 0.25);
  irPlaque(39.5, 3.0, -16.84, 0, 'QUARTERMASTER', 'SGT. BRIX', '#ff8a2a');
  // Research Lab: a specimen tank with a Drome bug, a robot arm, chairs, a wall display, cable runs
  { const X = 38, Z = 12.8; part(props, B(1.6, 0.3, 1.2), trim, X, 0.25, Z); part(props, B(1.6, 0.15, 1.2), trim, X, 2.1, Z); const gl = new THREE.Mesh(B(1.5, 1.6, 1.1), new THREE.MeshPhongMaterial({ color: '#9fff6a', transparent: true, opacity: 0.16, depthWrite: false })); gl.position.set(X, 1.2, Z); levelGroup.add(gl);
    const bug = new THREE.Group(); bug.position.set(X, 1.1, Z); levelGroup.add(bug); part(bug, new THREE.SphereGeometry(0.28, 10, 8), toon('#3a1416'), 0, 0, 0); part(bug, new THREE.SphereGeometry(0.18, 8, 6), toon('#5a2024'), 0.3, 0.05, 0); for (let k = 0; k < 6; k++) part(bug, B(0.03, 0.03, 0.4), dk, -0.1 + (k % 3) * 0.15, -0.15, (k < 3 ? 1 : -1) * 0.25, 0.5 * (k < 3 ? 1 : -1), 0, 0);
    levelAnims.push(t => { bug.rotation.y = Math.sin(t * 0.3) * 0.8; bug.position.y = 1.1 + Math.sin(t * 0.9) * 0.08; }); box(X, Z, 0.8, 0.6); }
  { const X = 38.5, Z = 6.5, base = new THREE.Group(); base.position.set(X, 0.1, Z); props.add(base); part(base, Cy(0.4, 0.5, 0.3, 12), toon('#ff8a2a', 'hull'), 0, 0.15, 0); const arm = new THREE.Group(); arm.position.y = 0.3; base.add(arm); part(arm, B(0.2, 1.2, 0.2), toon('#ff8a2a', 'hull'), 0, 0.6, 0); const fore = new THREE.Group(); fore.position.y = 1.2; arm.add(fore); part(fore, B(0.16, 0.16, 0.9), toon('#ff8a2a', 'hull'), 0, 0, 0.45); part(fore, B(0.24, 0.12, 0.12), dk, 0, 0, 0.92);
    levelAnims.push(t => { arm.rotation.y = Math.sin(t * 0.4) * 0.9; fore.rotation.x = 0.4 + Math.sin(t * 0.7) * 0.25; }); solid(X, Z, 0.5); }
  for (const [x, z] of [[29, 5], [29, 9.7]]) chair(x - 0.6, z, z < 7 ? Math.PI : 0);
  { const g = new THREE.Group(); g.position.set(34, 3.0, 14.7); g.rotation.y = Math.PI; props.add(g); part(g, B(4.0, 1.6, 0.1), dk, 0, 0, 0); part(g, B(3.8, 1.45, 0.02), glow('#0e2a3a'), 0, 0, 0.06); for (let k = 0; k < 6; k++) part(g, B(0.4, 0.1 + (k % 3) * 0.25, 0.01), glow('#4fd2ff'), -1.5 + k * 0.6, -0.5 + (0.1 + (k % 3) * 0.25) / 2, 0.075); }
  for (const z of [3.4, 4.6]) part(props, B(10, 0.04, 0.08), dk, 36.5, 0.12, z);
  // courtyard: benches, fuel drums by the jeep, planters by the Command doors
  for (const x of [9, 21]) { irBox(props, 2.4, 0.08, 0.5, wood, x, 0.55, 13.4, 1); for (const s of [-1, 1]) part(props, B(0.08, 0.45, 0.45), trim, x + s * 1.1, 0.32, 13.4); box(x, 13.4, 1.2, 0.25); }
  for (const [x, z] of [[22.6, 6.6], [23.3, 6.9], [22.9, 7.6]]) drum(x, z, '#5a3a2a');
  for (const x of [10.2, 19.8]) { irBox(props, 1.0, 0.7, 1.0, trim, x, 0.45, 14.0, 1); part(props, new THREE.IcosahedronGeometry(0.5, 0), toon('#3a5a2a'), x, 1.1, 14.0); solid(x, 14.0, 0.55); }
}
