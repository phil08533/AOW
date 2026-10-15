// =================== BUBBLE CITY, built out: three new domes joined by glass tunnels, with shops, homes, a kelp farm and people ===================
// Offsets are from the city's center (Z.bubble). The old four domes stay where they were.
const BC_DOMES = [[-21, -2, 6.5, '#ffd0a0', 'market'], [21, 0, 6.5, '#c8e0ff', 'homes'], [0, -17, 5.5, '#b8ffcf', 'garden']];
const BC_TUBES = [[-7, -1, -14.6, -2], [7, -0.5, 14.6, 0], [0, -7, 0, -11.6]]; // from the main dome's edge to each new dome's edge
const BC_TUBE_R = 1.5;
// you can breathe and walk in the tunnels and the new domes, same as the old ones
{ const _in = inDome; inDome = function (p) { if (_in(p)) return true; if (!LEVEL || !LEVEL.ocean || !Z.bubble) return false; p = p || player.pos;
  const bx = Z.bubble.x, bz = Z.bubble.z;
  for (const [ox, oz, r] of BC_DOMES) if (Math.hypot(p.x - bx - ox, p.z - bz - oz) < r - 0.4) return true;
  for (const [ax, az, cx, cz] of BC_TUBES) { const x1 = bx + ax, z1 = bz + az, x2 = bx + cx, z2 = bz + cz, dx = x2 - x1, dz = z2 - z1, L2 = dx * dx + dz * dz, t = clamp(((p.x - x1) * dx + (p.z - z1) * dz) / L2, 0, 1);
    if (Math.hypot(p.x - (x1 + dx * t), p.z - (z1 + dz * t)) < BC_TUBE_R - 0.3) return true; }
  return false; }; }
{ const orig = LEVELS.ocean.build; LEVELS.ocean.build = function () { orig.call(this);
  const bx = Z.bubble.x, bz = Z.bubble.z, gy = (x, z) => groundH(x, z);
  const glass = new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
  // domes and their floors
  for (const [ox, oz, r, col] of BC_DOMES) { const x = bx + ox, z = bz + oz, d = makeDome(r, col); at(d, x, z); levelAnims.push(t => { d.children[d.children.length - 1].rotation.y = t * 0.8; });
    let fy = -99; for (let a = 0; a < 6.3; a += 0.8) fy = Math.max(fy, gy(x + Math.cos(a) * r * 0.6, z + Math.sin(a) * r * 0.6)); fy = Math.max(fy, gy(x, z));
    const f = new THREE.Mesh(new THREE.CircleGeometry(r - 0.2, 22).rotateX(-Math.PI / 2), toon('#d8c890', 'stone')); f.position.set(x, fy + 0.06, z); props.add(f); }
  // glass tunnels with ribs and a lit walkway
  for (const [ax, az, cx, cz] of BC_TUBES) { const x1 = bx + ax, z1 = bz + az, x2 = bx + cx, z2 = bz + cz, L = Math.hypot(x2 - x1, z2 - z1), mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, ry = Math.atan2(x2 - x1, z2 - z1);
    const tube = new THREE.Group(); const y0 = Math.max(gy(x1, z1), gy(mx, mz), gy(x2, z2));
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(BC_TUBE_R, BC_TUBE_R, L, 14, 1, true), glass); shell.rotation.set(Math.PI / 2, 0, 0); shell.position.y = 0.2; tube.add(shell);
    for (let k = 0; k <= Math.floor(L / 2.2); k++) { const rib = part(tube, new THREE.TorusGeometry(BC_TUBE_R, 0.07, 5, 14, Math.PI), '#5d636c', 0, 0.2, -L / 2 + k * (L / Math.floor(L / 2.2))); rib.rotation.y = 0; }
    part(tube, B(1.6, 0.08, L), toon('#c8b880', 'stone'), 0, 0.04, 0);
    for (let k = 0; k < Math.floor(L / 3); k++) for (const s of [-1, 1]) part(tube, B(0.08, 0.05, 0.4), glow('#8fe3ff'), 0.75 * s, 0.1, -L / 2 + 1.5 + k * 3);
    tube.position.set(mx, y0, mz); tube.rotation.y = ry; props.add(tube); }
  // ---- main dome: the Pearl Fountain and benches ----
  { const f = new THREE.Group(); part(f, Cy(1.3, 1.5, 0.4, 14), toon('#c8b880', 'stone'), 0, 0.2, 0); part(f, Cy(1.1, 1.1, 0.06, 14), glow('#4fd8ff'), 0, 0.42, 0); part(f, Cy(0.18, 0.24, 1.2, 8), toon('#e8e0d0', 'stone'), 0, 0.9, 0);
    const pearl = part(f, new THREE.SphereGeometry(0.32, 12, 10), glow('#f4f0ff'), 0, 1.7, 0); at(f, bx, bz - 3); solid(bx, bz - 3, 1.5);
    levelAnims.push(t => { pearl.position.y = 1.7 + Math.sin(t * 1.5) * 0.08; pearl.rotation.y = t; });
    for (const s of [-1, 1]) { const bn = new THREE.Group(); part(bn, B(1.6, 0.1, 0.45), toon('#6a4f34', 'wood'), 0, 0.45, 0); for (const k of [-0.6, 0.6]) part(bn, B(0.1, 0.45, 0.4), '#5d636c', k, 0.22, 0); at(bn, bx + 3.4 * s, bz - 3, Math.PI / 2); } }
  // ---- market dome: stalls, crates of catch, a glowing sign ----
  { const [ox, oz] = BC_DOMES[0], cx = bx + ox, cz = bz + oz, awn = ['#ff6aa8', '#4fffe0', '#ffd36a', '#c86aff'];
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4, x = cx + Math.cos(a) * 3.6, z = cz + Math.sin(a) * 3.6, st = new THREE.Group();
      part(st, B(1.8, 0.9, 0.8), toon('#7a5a3a', 'wood'), 0, 0.45, 0); for (const s of [-1, 1]) part(st, B(0.08, 2, 0.08), '#5d636c', 0.85 * s, 1, -0.35);
      part(st, B(2, 0.08, 1.2), toon(awn[i]), 0, 2.05, 0.05, -0.25, 0, 0);
      for (let k = 0; k < 4; k++) E(st, toon(['#ff8a5a', '#e8e4dc', '#2a2a3a', '#9fe8ff'][(i + k) % 4]), -0.6 + k * 0.4, 0.98, 0.1, 0.14, 0.1, 0.14);
      at(st, x, z, -a - Math.PI / 2); solid(x, z, 0.9); }
    for (let i = 0; i < 5; i++) { const c = part(new THREE.Group(), B(0.5, 0.5, 0.5), toon('#8a6a42', 'wood'), 0, 0.25, 0).parent; at(c, cx + rand(-1.5, 1.5), cz + 4.6 + (i % 2) * 0.6, i); }
    const sign = new THREE.Group(); part(sign, B(2.6, 0.6, 0.08), '#1a2030', 0, 0, 0); part(sign, B(2.4, 0.12, 0.1), glow('#ffd36a'), 0, 0.14, 0); part(sign, B(2.4, 0.12, 0.1), glow('#ff6aa8'), 0, -0.14, 0);
    sign.position.set(cx, gy(cx, cz) + 4.6, cz); props.add(sign); levelAnims.push(t => { sign.rotation.y = t * 0.4; }); }
  // ---- homes dome: three round coral houses with lit windows ----
  { const [ox, oz] = BC_DOMES[1], cx = bx + ox, cz = bz + oz, cols = ['#ff9a8a', '#ffd0a0', '#c8a0ff'];
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5, x = cx + Math.cos(a) * 3.3, z = cz + Math.sin(a) * 3.3, h = new THREE.Group();
      part(h, Cy(1.2, 1.35, 2.2, 12), toon(cols[i], 'stone'), 0, 1.1, 0); E(h, toon(cols[i], 'stone'), 0, 2.2, 0, 1.25, 0.8, 1.25);
      for (let k = 0; k < 3; k++) { const w = part(h, new THREE.CircleGeometry(0.22, 10), glow('#ffe9a0'), Math.sin(k * 2.1) * 1.22, 1.4, Math.cos(k * 2.1) * 1.22); w.rotation.y = k * 2.1; }
      part(h, B(0.7, 1.2, 0.1), toon('#5a3e2a', 'wood'), 0, 0.6, 1.3); part(h, Cy(0.12, 0.12, 0.9, 6), toon('#e8e4dc', 'stone'), 0.6, 2.7, 0.3);
      at(h, x, z, Math.atan2(cx - x, cz - z)); solid(x, z, 1.35); }
    const mb = new THREE.Group(); part(mb, Cy(0.05, 0.05, 1, 5), '#5d636c', 0, 0.5, 0); part(mb, B(0.35, 0.25, 0.45), toon('#3f7dc4'), 0, 1.05, 0); at(mb, cx, cz + 1); }
  // ---- garden dome: kelp farm rows under grow lights ----
  { const [ox, oz] = BC_DOMES[2], cx = bx + ox, cz = bz + oz, kelps = [];
    for (let r = -1; r <= 1; r++) { part(at(new THREE.Group(), cx + r * 1.6, cz, 0, 0.05), B(0.9, 0.25, 6), toon('#5a3e2a', 'wood'), 0, 0.12, 0);
      for (let k = 0; k < 5; k++) { const kp = makeKelp(1.6 + (k % 3) * 0.4); kp.position.set(cx + r * 1.6, gy(cx, cz) + 0.25, cz - 2.4 + k * 1.2); levelGroup.add(kp); kelps.push([kp, k + r * 5]); } }
    for (const s of [-1, 1]) { const gl = new THREE.Group(); part(gl, Cy(0.05, 0.05, 3.2, 5), '#5d636c', 0, 1.6, 0); part(gl, B(4, 0.1, 0.3), glow('#d0a0ff'), 0, 3.2, 0); at(gl, cx + 2.8 * s, cz, Math.PI / 2); solid(cx + 2.8 * s, cz, 0.15); }
    levelAnims.push(t => { for (const [kp, i] of kelps) kp.userData.segs.forEach((sg, j) => { sg.rotation.z = Math.sin(t * 1.1 + i + j * 0.5) * 0.06; }); }); }
  // ---- outside: fish schools circling the city, a parked sub and buoy chains ----
  { const fishCols = ['#ffb347', '#4fffe0', '#ff6aa8', '#ffe9a0'];
    for (let s = 0; s < 4; s++) { const school = new THREE.Group(), n = 9; for (let i = 0; i < n; i++) { const f = new THREE.Group(); E(f, toon(fishCols[s]), 0, 0, 0, 0.12, 0.1, 0.26); part(f, new THREE.ConeGeometry(0.09, 0.16, 4), toon(fishCols[s]), 0, 0, -0.3, -Math.PI / 2); f.position.set(rand(-1.2, 1.2), rand(-0.6, 0.6), rand(-1.2, 1.2)); school.add(f); }
      levelGroup.add(school); const R = 16 + s * 5, h = 3 + s * 1.2, ph = s * 1.7, sp = 0.18 + s * 0.04;
      levelAnims.push(t => { const a = t * sp + ph; school.position.set(bx + Math.cos(a) * R, Math.min(WATER_Y - 1.5, gy(bx, bz) + h), bz + Math.sin(a) * R); school.rotation.y = -a; school.children.forEach((f, i) => { f.position.y += Math.sin(t * 3 + i) * 0.003; }); }); }
    const sub = new THREE.Group(); E(sub, toon('#ffd23a'), 0, 0, 0, 1.1, 0.8, 2.2); part(sub, Cy(0.35, 0.35, 0.6, 10), toon('#ffd23a'), 0, 0.85, 0.2); part(sub, new THREE.CircleGeometry(0.3, 10), glow('#8fe3ff'), 0, 0.1, 2.15);
    at(sub, bx - 10, bz + 12, 0.8, 1.2); solid(bx - 10, bz + 12, 1.4);
    for (let i = 0; i < 3; i++) { const x = bx + [-30, 30, 0][i], z = bz + [10, 12, -30][i], b = new THREE.Group(); const top = WATER_Y - gy(x, z);
      part(b, Cy(0.03, 0.03, top, 4), '#5d636c', 0, top / 2, 0); part(b, new THREE.SphereGeometry(0.4, 8, 6), toon('#ff6a5a'), 0, top, 0); at(b, x, z); } }
}; }
// ---- people of Bubble City (z is offset by the ocean's npcBase of -28, like Finn and Nurse Gill) ----
LEVELS.ocean.npcs.push(
  { id: 'pearlmkt', name: 'Auntie Nacre', role: 'Bubble Market · buys and sells', rig: 'civ', make: () => makeCivilian('#c86aff', '#2c2a38', '#e8c4a0', '#e8e4dc', '#ffd36a'), x: -21, z: 91, face: Math.PI, shop: 'store',
    idle: ["Fresh catch! Pearls! Things that were in a shipwreck and are now in my shop!", "Everything here was made, found, or bargained for under eight meters of water.", "Don't ask where the crates come from. The crates don't ask where you come from."] },
  { id: 'barnacle', name: 'Old Barnacle', role: 'Retired dome builder', rig: 'civ', make: () => makeCivilian('#3a5266', '#2c2a28', '#c8a07a', '#d8d8d8', null), x: 19.5, z: 92, face: -Math.PI / 2,
    idle: ["I built the first dome with my own two hands and a lot of glue. Mostly glue.", "Every crack in this city has a name. That one's Gerald.", "The Leviathan took Dome Six. We don't talk about Dome Six."] },
  { id: 'kelpa', name: 'Farmer Kelpa', role: 'Kelp farmer', rig: 'civ', make: () => makeCivilian('#4f6e2c', '#3a2a1a', '#a07850', '#2a1a10', '#8fae6a'), x: 0.8, z: 75.5, face: 0,
    idle: ["Grow lights, good water, and talking to them. Kelp loves gossip.", "This row is kelp. That row is also kelp. It's a kelp farm.", "Try the kelp chips at the market. Auntie Nacre stole my recipe, but she makes them well."] },
  { id: 'pip', name: 'Pip', role: 'Dome kid', rig: 'civ', make: () => { const g = makeCivilian('#ff6aa8', '#2c2a38', '#e8c4a0', '#4a2a1a', null); g.scale.setScalar(0.7); return g; }, x: 22, z: 87, face: Math.PI,
    idle: ["Have you ever been ABOVE the water? Is it true there's no ceiling?", "I'm gonna be a sub pilot. Or a fish. Whichever pays more.", "Mayor Blub is my uncle. He isn't. But he lets me say it."] }
);

// anyone outside the domes and below the surface wears a glass dive dome over their head (other players swimming, any stray NPC)
const DIVE_HELM_GEO = new THREE.SphereGeometry(0.34, 14, 10), DIVE_HELM_MAT = new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.32, emissive: new THREE.Color('#2a6a7a'), depthWrite: false });
function diveHelm(o, on) {
  let h = o.userData.diveHelm; if (!on) { if (h) h.visible = false; return; }
  if (!h) { h = new THREE.Group(); const g = new THREE.Mesh(DIVE_HELM_GEO, DIVE_HELM_MAT); h.add(g); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 18), toon('#c9a43a')); ring.rotation.x = Math.PI / 2; ring.position.y = -0.24; h.add(ring); h.position.y = 1.62; o.add(h); o.userData.diveHelm = h; }
  h.visible = true;
}
let diveT = 0;
{ const _st = step; step = function (dt) { const r = _st.apply(this, arguments);
  if (LEVEL && LEVEL.ocean && (diveT -= dt) <= 0) { diveT = 0.3; const wet = o => o.parent && o.position.y + 1.5 < WATER_Y && !inDome(o.position);
    for (const id in npcObjs) { const N = npcObjs[id]; if (N.def.rig === 'civ' || N.def.rig === 'trooper') diveHelm(N.obj, wet(N.obj)); }
    for (const R of remotes.values()) if (R.obj) diveHelm(R.obj, wet(R.obj)); }
  return r; }; }
