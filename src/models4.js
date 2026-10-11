// =================== ROBOT CITY MODELS ===================
// ZR-306: hulking scrap-zombie robot with open chest and dangling wires
function makeZR306() {
  const g = new THREE.Group(), m = '#7a7f87', dk = '#4a4e56', rust = '#8a5a3c';
  for (const s of [-1, 1]) { part(g, B(0.22, 0.14, 0.34), dk, 0.16 * s, 0.07, 0.03); part(g, B(0.18, 0.42, 0.2), m, 0.16 * s, 0.35, 0); part(g, B(0.22, 0.36, 0.24), s > 0 ? rust : m, 0.16 * s, 0.75, 0); }
  part(g, B(0.6, 0.2, 0.34), dk, 0, 1.0, 0); part(g, B(0.74, 0.6, 0.44), m, 0, 1.38, 0, 0.1); part(g, B(0.4, 0.3, 0.06), '#1a1a1e', 0, 1.36, 0.23); part(g, new THREE.OctahedronGeometry(0.08, 0), glow('#ff6a1a'), 0, 1.36, 0.22);
  for (const s of [-1, 1]) { part(g, Cy(0.14, 0.14, 0.2, 8), dk, 0.47 * s, 1.58, 0, 0, 0, Math.PI / 2); part(g, B(0.18, 0.5, 0.2), s > 0 ? m : rust, 0.5 * s, 1.24, 0.05); part(g, B(0.22, 0.24, 0.26), dk, 0.5 * s, 0.9, 0.08); for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.03, 0.12, 4), C.dark, 0.5 * s + (k - 1) * 0.06, 0.74, 0.12, Math.PI); }
  for (let k = 0; k < 4; k++) chain(g, [[(k - 1.5) * 0.1, 1.2, 0.22], [(k - 1.5) * 0.12, 1.0, 0.3], [(k - 1.5) * 0.1, 0.85, 0.26]], 0.012, ['#c8402f', '#4fa8ff', '#ffd23a', '#6fdc5a'][k], 0.01);
  part(g, B(0.36, 0.3, 0.32), m, 0, 1.86, 0.02, 0.15, 0.1, 0.08); part(g, B(0.28, 0.06, 0.04), glow('#ff3b2a'), 0, 1.88, 0.19); part(g, B(0.16, 0.06, 0.04), '#1a1a1e', 0, 1.77, 0.19);
  return g;
}
// K8-72: robot hunting hound
function makeK872() {
  const g = new THREE.Group(), m = '#5d636c', dk = '#2b2a2c', acc = '#ffd23a';
  part(g, B(0.42, 0.34, 0.95), m, 0, 0.6, 0); part(g, B(0.44, 0.08, 0.9), acc, 0, 0.8, 0);
  part(g, B(0.32, 0.28, 0.4), m, 0, 0.78, 0.6); part(g, B(0.24, 0.14, 0.26), dk, 0, 0.68, 0.84); for (const s of [-1, 1]) { part(g, B(0.06, 0.04, 0.03), glow('#ff3b2a'), 0.1 * s, 0.84, 0.81); part(g, B(0.05, 0.18, 0.1), m, 0.13 * s, 1.0, 0.52, -0.3); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { seg(g, [0.18 * sx, 0.5, 0.32 * sz], [0.2 * sx, 0.22, 0.38 * sz], 0.05, dk, 0.04); seg(g, [0.2 * sx, 0.22, 0.38 * sz], [0.2 * sx, 0.02, 0.32 * sz], 0.04, m, 0.035); }
  part(g, Cy(0.02, 0.03, 0.5, 5), dk, 0, 0.85, -0.6, -0.9); part(g, B(0.1, 0.1, 0.1), glow(acc), 0, 1.05, -0.78);
  return g;
}
// Hover-bot "flower pot": floating pot with an antenna flower that zaps
function makeHoverBot() {
  const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 1.2; g.add(b);
  part(b, Cy(0.34, 0.22, 0.5, 10), '#b8562f', 0, 0, 0); part(b, Cy(0.37, 0.37, 0.08, 10), '#8a3a2e', 0, 0.26, 0); part(b, Cy(0.2, 0.2, 0.06, 10), glow('#4fd2ff'), 0, -0.27, 0);
  part(b, Cy(0.02, 0.02, 0.4, 4), '#3f7a3a', 0, 0.5, 0); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; E(b, '#ff6aa8', Math.cos(a) * 0.1, 0.72, Math.sin(a) * 0.1, 0.08, 0.03, 0.08, 0, -a, 0.3); } E(b, glow('#ffe14a'), 0, 0.73, 0, 0.05, 0.05, 0.05);
  for (const s of [-1, 1]) part(b, B(0.08, 0.05, 0.04), glow('#ff3b2a'), 0.12 * s, 0.1, 0.32);
  g.userData.anim = (t) => { b.position.y = 1.2 + Math.sin(t * 2.4) * 0.12; b.rotation.y = Math.sin(t * 0.8) * 0.4; };
  return g;
}
// F-162 "trashy": trash-can bot with lid jaw
function makeF162() {
  const g = new THREE.Group(), can = '#6a7a6a', dk = '#3a3d44';
  for (const s of [-1, 1]) { part(g, B(0.14, 0.3, 0.14), dk, 0.14 * s, 0.15, 0); part(g, B(0.2, 0.08, 0.26), dk, 0.14 * s, 0.03, 0.04); }
  part(g, Cy(0.32, 0.28, 0.8, 10), can, 0, 0.7, 0); for (let k = 0; k < 4; k++) part(g, Cy(0.325, 0.325, 0.03, 10), dk, 0, 0.4 + k * 0.18, 0);
  const lid = new THREE.Group(); lid.position.set(0, 1.1, -0.28); g.add(lid); part(lid, Cy(0.34, 0.34, 0.06, 10), can, 0, 0, 0.28); part(lid, B(0.12, 0.06, 0.06), dk, 0, 0.06, 0.28);
  for (const s of [-1, 1]) { part(g, B(0.08, 0.05, 0.03), glow('#7fff6a'), 0.1 * s, 0.98, 0.3); chain(g, [[0.32 * s, 0.85, 0], [0.45 * s, 0.6, 0.1], [0.42 * s, 0.4, 0.2]], 0.03, dk, 0.025); }
  part(g, B(0.1, 0.2, 0.06), '#c8b84a', 0.05, 1.18, 0.1, 0.3, 0, 0.4); part(g, B(0.12, 0.08, 0.1), '#8a6a44', -0.1, 1.16, 0.0, 0.2);
  g.userData.anim = (t) => { lid.rotation.x = -Math.abs(Math.sin(t * 3)) * 0.5; };
  return g;
}
// X-G Police: red riot robot with shield and baton gun
function makeXGPolice() {
  const g = makeXR17();
  part(g, B(0.08, 0.7, 0.5), '#c8402f', -0.42, 0.6, 0.25); part(g, B(0.09, 0.12, 0.4), glow('#4fa8ff'), -0.45, 0.85, 0.25);
  part(g, B(0.3, 0.05, 0.2), glow('#ff3b2a'), 0, 1.1, 0); part(g, B(0.3, 0.05, 0.2), glow('#4fa8ff'), 0, 1.1, 0.0).position.x = 0.12;
  return recolor(g, { '#9aa1aa': '#a8302a', '#5d636c': '#3a1e1e' });
}
const GHOST_MAT = new THREE.MeshLambertMaterial({ color: '#9fe8ff', emissive: '#2a6aa8', transparent: true, opacity: 0.45, depthWrite: false });
const GHOST_GLOW = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 });
function makeGhostBot() {
  const g = makeXR17();
  g.traverse(o => { if (o.isMesh) o.material = o.material.isMeshBasicMaterial ? GHOST_GLOW : GHOST_MAT; });
  return g;
}
// The Overseer: four-armed foundry giant with a single red eye
function makeOverseer() {
  const g = new THREE.Group(), m = '#3a3d44', acc = '#c8402f', gold = '#c9a43a';
  for (const s of [-1, 1]) { part(g, B(0.3, 0.5, 0.36), m, 0.22 * s, 0.25, 0); part(g, B(0.26, 0.4, 0.3), acc, 0.22 * s, 0.7, 0); }
  part(g, B(0.8, 0.3, 0.5), m, 0, 1.0, 0); part(g, B(1.0, 0.8, 0.6), m, 0, 1.5, 0); part(g, Cy(0.18, 0.18, 0.08, 12), glow('#ff6a1a'), 0, 1.5, 0.3, Math.PI / 2);
  for (const s of [-1, 1]) for (const y of [1.75, 1.35]) { part(g, Cy(0.12, 0.12, 0.24, 8), gold, 0.58 * s, y, 0, 0, 0, Math.PI / 2); chain(g, [[0.66 * s, y, 0], [0.85 * s, y - 0.25, 0.15], [0.9 * s, y - 0.55, 0.25]], 0.08, m, 0.06); part(g, B(0.16, 0.16, 0.16), acc, 0.9 * s, y - 0.62, 0.26); }
  part(g, B(0.5, 0.42, 0.44), m, 0, 2.14, 0); part(g, new THREE.SphereGeometry(0.11, 10, 8), glow('#ff2a3a'), 0, 2.16, 0.22); part(g, B(0.56, 0.06, 0.48), gold, 0, 2.38, 0);
  for (let i = 0; i < 5; i++) part(g, new THREE.ConeGeometry(0.04, 0.22, 4), gold, (i - 2) * 0.1, 2.5, 0);
  return g;
}
function makeCityBlock(w, h, d, col, neon) {
  const g = new THREE.Group();
  part(g, B(w, h, d), toon(col, 'panel'), 0, h / 2, 0);
  for (let y = 1.6; y < h - 0.5; y += 1.8) { part(g, B(w + 0.04, 0.22, d * 0.8), glow(neon), 0, y, 0); part(g, B(w * 0.8, 0.22, d + 0.04), glow(neon === '#ff3b6a' ? '#4fd2ff' : '#ff3b6a'), 0, y + 0.9, 0); }
  part(g, B(w + 0.3, 0.3, d + 0.3), '#2b2a2c', 0, h + 0.15, 0);
  return g;
}
function makeTower() {
  const g = new THREE.Group();
  for (let k = 0; k < 8; k++) part(g, B(9 - k * 0.8, 4, 9 - k * 0.8), toon(k % 2 ? '#2b2a2c' : '#3a3d44', 'panel'), 0, 2 + k * 4, 0);
  for (let k = 0; k < 8; k++) part(g, B(9.1 - k * 0.8, 0.3, 9.1 - k * 0.8), glow('#9fe8ff'), 0, 3.6 + k * 4, 0);
  part(g, Cy(0.2, 0.6, 8, 6), '#2b2a2c', 0, 36, 0); part(g, new THREE.SphereGeometry(0.8, 10, 8), glow('#ff2a3a'), 0, 40.5, 0);
  part(g, B(3, 4, 0.4), '#0a0a10', 0, 2, 4.5);
  return g;
}
