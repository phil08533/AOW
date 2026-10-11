// =================== CAPITONE MODELS (the frozen forest world) ===================
function makeGiantTree() {
  const g = new THREE.Group(), bark = toon('#5a4030', 'wood'), bark2 = toon('#4a3426', 'wood'), leaf = toon('#2f7a5a', 'leaves'), leaf2 = toon('#3f8a62', 'leaves');
  for (let k = 0; k < 6; k++) part(g, Cy(3.6 - k * 0.32, 4.2 - k * 0.32, 4.6, 10), k % 2 ? bark : bark2, 0, 2.3 + k * 4.4, 0, 0, k * 0.4, 0);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.2; chain(g, [[Math.cos(a) * 3, 2.4, Math.sin(a) * 3], [Math.cos(a) * 5.4, 0.9, Math.sin(a) * 5.4], [Math.cos(a) * 7.2, -0.2, Math.sin(a) * 7.2]], 0.9, bark2, 0.3); }
  // living platform with lanterns
  part(g, Cy(7.2, 7.2, 0.5, 18), toon('#7a5a3a', 'wood'), 0, 9.5, 0);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; part(g, Cy(0.08, 0.08, 1.1, 4), bark2, Math.cos(a) * 7, 10.2, Math.sin(a) * 7); part(g, new THREE.OctahedronGeometry(0.22, 0), glow('#ffd36a'), Math.cos(a) * 7, 10.9, Math.sin(a) * 7); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.5; for (let k = 0; k < 6; k++) part(g, B(0.08, 0.6, 0.08), toon('#3f7a3a', 'leaves'), Math.cos(a) * 6.4, 8.8 - k * 0.55, Math.sin(a) * 6.4, 0.1 * k, 0, 0); }
  // big doorway and windows
  part(g, B(2.2, 3.4, 0.6), '#1a120c', 0, 1.7, 3.95); part(g, B(2.6, 0.3, 0.7), toon('#c9a43a'), 0, 3.5, 3.9);
  for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.8, y = 13 + k * 3; part(g, B(0.8, 1.0, 0.3), glow('#ffd36a'), Math.cos(a) * (3.3 - k * 0.25), y, Math.sin(a) * (3.3 - k * 0.25), 0, -a + Math.PI / 2, 0); }
  // canopy
  for (const [x, y, z, r, m] of [[0, 30, 0, 9, leaf], [6, 26, 2, 6.5, leaf2], [-6, 26.5, -2, 6.5, leaf2], [2, 27, -6, 6, leaf], [-3, 27, 6, 6, leaf], [0, 35, 0, 6, leaf2]]) part(g, new THREE.IcosahedronGeometry(r, 1), m, x, y, z);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; chain(g, [[Math.cos(a) * 2, 22, Math.sin(a) * 2], [Math.cos(a) * 6, 24.5, Math.sin(a) * 6], [Math.cos(a) * 9, 25, Math.sin(a) * 9]], 0.6, bark, 0.25); }
  return g;
}
function makeFern(s, col) {
  const g = new THREE.Group(), m = toon(col || '#3f8a4a', 'leaves');
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const f = part(g, B(0.22 * s, 0.03, 1.3 * s), m, Math.cos(a) * 0.55 * s, 0.45 * s, Math.sin(a) * 0.55 * s, -0.7, -a + Math.PI / 2, 0); f.castShadow = false; }
  part(g, B(0.2 * s, 0.03, 1.1 * s), m, 0, 0.75 * s, 0, -1.2, 0.3, 0);
  return g;
}
function makePine(s, snow) {
  const g = new THREE.Group();
  part(g, Cy(0.14 * s, 0.22 * s, 1.4 * s, 6), toon('#5a4030', 'wood'), 0, 0.7 * s, 0);
  for (let k = 0; k < 3; k++) { part(g, new THREE.ConeGeometry((1.5 - k * 0.38) * s, 1.7 * s, 7), toon(snow && k === 2 ? '#e8f0f4' : '#2a5a46', 'leaves'), 0, (1.6 + k * 1.05) * s, 0); if (snow) part(g, new THREE.ConeGeometry((1.0 - k * 0.3) * s, 0.5 * s, 7), toon('#eef4f8'), 0, (2.25 + k * 1.05) * s, 0); }
  return g;
}
function makeIceSpike(s) {
  const g = new THREE.Group(), m = toon('#bfe6f2'), m2 = toon('#8fc4dc');
  for (let k = 0; k < 4; k++) part(g, new THREE.ConeGeometry((0.4 - k * 0.06) * s, (2.4 - k * 0.4) * s, 5), k % 2 ? m2 : m, (k - 1.5) * 0.3 * s, (1.2 - k * 0.2) * s, Math.sin(k * 2) * 0.3 * s, Math.sin(k) * 0.3, 0, (k - 1.5) * 0.18);
  return g;
}
// Porcupine thing: round spiny beast that fires quills (creatures page)
function makePorcupine() {
  const g = new THREE.Group(), fur = '#6a5038', dk = '#3a2a1e', q = '#e8dcc0';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) seg(g, [0.2 * sx, 0.35, 0.24 * sz], [0.22 * sx, 0.02, 0.26 * sz], 0.07, dk, 0.05);
  E(g, fur, 0, 0.5, 0, 0.38, 0.32, 0.48);
  E(g, fur, 0, 0.48, 0.5, 0.18, 0.16, 0.2); E(g, dk, 0, 0.44, 0.68, 0.07, 0.06, 0.07);
  for (const s of [-1, 1]) E(g, glow('#ffd23a'), 0.09 * s, 0.56, 0.62, 0.03, 0.03, 0.02);
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2 * 3.1, rr = 0.15 + (i % 5) * 0.05, x = Math.cos(a) * rr, z = -0.35 + (i / 26) * 0.75;
    part(g, new THREE.ConeGeometry(0.025, 0.42, 4), i % 3 ? q : '#3a2a1e', x, 0.72 + Math.sin(a) * 0.05, z - 0.05, -0.6, 0, x * 1.8); }
  return g;
}
// Ambush tree-jumper: long-armed forest climber that drops on you
function makeJumper() {
  const g = new THREE.Group(), fur = '#4a6a3a', dk = '#2f4a26', skin = '#a8c47a';
  for (const s of [-1, 1]) { chain(g, [[0.1 * s, 0.48, 0], [0.13 * s, 0.26, 0.08], [0.11 * s, 0.03, 0]], 0.06, fur, 0.04, true); part(g, B(0.1, 0.04, 0.16), dk, 0.11 * s, 0.02, 0.04); }
  E(g, fur, 0, 0.66, 0, 0.2, 0.24, 0.17, 0.2);
  E(g, skin, 0, 0.66, 0.1, 0.12, 0.16, 0.08);
  for (const s of [-1, 1]) { chain(g, [[0.2 * s, 0.82, 0], [0.34 * s, 0.6, 0.08], [0.36 * s, 0.3, 0.1]], 0.045, fur, 0.03, true); for (let k = -1; k <= 1; k++) seg(g, [0.36 * s, 0.3, 0.1], [0.38 * s + k * 0.03, 0.2, 0.14], 0.012, dk, 0.006); }
  E(g, fur, 0, 0.98, 0.02, 0.15, 0.14, 0.14);
  for (const s of [-1, 1]) { E(g, '#ffe14a', 0.06 * s, 1.0, 0.12, 0.045, 0.05, 0.03); E(g, C.eye, 0.065 * s, 1.0, 0.145, 0.02, 0.025, 0.01); part(g, new THREE.ConeGeometry(0.04, 0.12, 4), fur, 0.13 * s, 1.08, 0, 0, 0, -0.8 * s); }
  const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.15); g.add(tail);
  chain(tail, [[0, 0, 0], [0, 0.2, -0.3], [0, 0.55, -0.4], [0, 0.75, -0.25]], 0.035, fur, 0.015);
  g.userData.anim = (t) => { tail.rotation.x = Math.sin(t * 3) * 0.2; };
  return g;
}
// Nomine: hooded wisp of the Forgotten Forest
function makeNomine() {
  const g = new THREE.Group(), body = new THREE.Group(); body.position.y = 0.9; g.add(body);
  const robe = toon('#4a3a6a', 'cloth'), dk = '#2a1e3e';
  part(body, new THREE.ConeGeometry(0.42, 1.3, 7, 1, true), robe, 0, 0, 0).material.side = THREE.DoubleSide;
  E(body, '#4a3a6a', 0, 0.68, 0, 0.22, 0.24, 0.22);
  E(body, dk, 0, 0.66, 0.08, 0.16, 0.18, 0.15);
  for (const s of [-1, 1]) { E(body, glow('#c8a0ff'), 0.06 * s, 0.68, 0.2, 0.035, 0.025, 0.02); seg(body, [0.22 * s, 0.3, 0.05], [0.45 * s, 0.05, 0.22], 0.05, robe, 0.03); E(body, glow('#c8a0ff'), 0.47 * s, 0.03, 0.24, 0.05, 0.05, 0.05); }
  const wisps = [];
  for (let i = 0; i < 4; i++) { const w = part(body, new THREE.OctahedronGeometry(0.06, 0), glow('#a080ff'), 0, 0, 0); wisps.push(w); }
  g.userData.anim = (t) => { body.position.y = 0.9 + Math.sin(t * 1.5) * 0.15; wisps.forEach((w, i) => { const a = t * 1.3 + i * 1.57; w.position.set(Math.cos(a) * 0.6, -0.3 + Math.sin(t * 2 + i) * 0.2, Math.sin(a) * 0.6); }); };
  return g;
}
// Snofel: snow fluff that grows as it fights
function makeSnofel() {
  const g = new THREE.Group(), fur = toon('#eef4f8', 'fur'), dk = '#8fb0c8';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) seg(g, [0.18 * sx, 0.3, 0.16 * sz], [0.2 * sx, 0.02, 0.18 * sz], 0.07, dk, 0.06);
  E(g, fur, 0, 0.55, 0, 0.42, 0.4, 0.42);
  for (let i = 0; i < 10; i++) { const a = i * 0.63; E(g, fur, Math.cos(a) * 0.32, 0.55 + Math.sin(i * 1.7) * 0.25, Math.sin(a) * 0.32, 0.16, 0.16, 0.16); }
  E(g, '#2a3a4a', 0, 0.48, 0.38, 0.18, 0.08, 0.06);
  for (let k = -2; k <= 2; k++) part(g, new THREE.ConeGeometry(0.025, 0.07, 4), C.bone, k * 0.06, 0.53, 0.42, Math.PI);
  for (const s of [-1, 1]) { E(g, C.eye, 0.13 * s, 0.68, 0.36, 0.04, 0.05, 0.03); part(g, new THREE.ConeGeometry(0.06, 0.3, 5), glow('#9fe8ff'), 0.2 * s, 0.98, 0.05, 0, 0, -0.5 * s); }
  return g;
}
function makeFrostKing() {
  const g = makeChunkMonster('#bfe6f2', '#8fc4dc', '#e8f6fb', '#5d7f99', true);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.05, 0.28, 4), glow('#9fe8ff'), Math.cos(a) * 0.2, 2.02, Math.sin(a) * 0.2, Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
  part(g, Cy(0.24, 0.24, 0.08, 10), toon('#c9a43a'), 0, 1.92, 0.02);
  return g;
}
function makeCairn() {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) part(g, new THREE.DodecahedronGeometry(0.45 - k * 0.08, 0), toon('#6a7a80', 'stone'), Math.sin(k) * 0.1, 0.3 + k * 0.55, 0);
  part(g, B(0.7, 0.5, 0.1), toon('#3b4f7a', 'cloth'), 0.4, 0.4, 0.3, 0.4, 0.6, 0.2);
  return g;
}
