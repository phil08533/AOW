// =================== A TIGHTER UNDERWORLD (2.22.18): the basement den shrinks so it feels packed, not empty ===================
// Everything built in the den (walls, bar, booths, band, people, lights, colliders and things to press) is pulled in
// toward the middle by UW_K. Furniture keeps its size, so the room fills up; long walls just run on behind each other.
const UW_K = 1; // Phil wanted the den full size after all; the shrink machinery below is reused for the Undercroft
for (const n of LEVELS.underworld.npcs) { n.x *= UW_K; n.z *= UW_K; }
LEVELS.underworld.spawn.z *= UW_K;
{ const _b = LEVELS.underworld.build; LEVELS.underworld.build = function () {
  const n0 = [props.children.length, levelGroup.children.length, INTERACTS.length, BOXES.length, CIRCLES.length, levelAnims.length];
  _b.apply(this, arguments);
  try { const sc = o => { o.position.x *= UW_K; o.position.z *= UW_K; };
    props.children.slice(n0[0]).forEach(sc); levelGroup.children.slice(n0[1]).forEach(o => { if (o !== props) sc(o); });
    INTERACTS.slice(n0[2]).forEach(i => { i.x *= UW_K; i.z *= UW_K; });
    BOXES.slice(n0[3]).forEach(b => { b[0] *= UW_K; b[1] *= UW_K; }); CIRCLES.slice(n0[4]).forEach(c => { c[0] *= UW_K; c[1] *= UW_K; });
    if (window.UW_SPK) UW_SPK.forEach(p => { p[0] *= UW_K; p[1] *= UW_K; });
    uwBarDetail();
  } catch (e) { console.warn('uw shrink', e); } }; }
// Grub's bar gets the dressing it deserves: a back bar of bottles, taps, stools, neon, a dartboard and pipes
function uwBarDetail() {
  const z0 = -8.6 * UW_K, wz = -11 * UW_K + 0.3; // counter line and the back wall
  // back bar: three lit shelves of bottles under a mirror strip
  part(props, B(6.4, 2.2, 0.3), toon('#2a1e18', 'wood'), 0, 1.5, wz + 0.15); part(props, B(6.2, 0.6, 0.05), glow('#3a6a7a'), 0, 2.45, wz + 0.32);
  for (let k = 0; k < 3; k++) { part(props, B(6.2, 0.05, 0.35), toon('#5a3a24', 'wood'), 0, 0.75 + k * 0.5, wz + 0.4); part(props, B(6.2, 0.03, 0.03), glow(['#ffb347', '#c86aff', '#7fe8ff'][k]), 0, 0.78 + k * 0.5, wz + 0.58);
    for (let i = 0; i < 16; i++) { const h = 0.22 + ((i * 7 + k) % 4) * 0.05; part(props, Cy(0.045, 0.05, h, 6), glow(['#6fdc5a', '#c8402f', '#ffd36a', '#8a4a2a', '#4fa8ff', '#c86aff'][(i + k * 3) % 6]), -2.9 + i * 0.39, 0.78 + k * 0.5 + h / 2, wz + 0.42); } }
  // beer taps and glasses on the counter
  for (let i = 0; i < 4; i++) { const x = -1.2 + i * 0.8; part(props, Cy(0.03, 0.03, 0.35, 6), '#c9a43a', x, 1.35, z0 - 0.35); part(props, B(0.06, 0.16, 0.06), toon(['#c8402f', '#4fa8ff', '#6fdc5a', '#ffd36a'][i]), x, 1.6, z0 - 0.35); }
  for (let i = 0; i < 5; i++) part(props, Cy(0.05, 0.04, 0.14, 8), new THREE.MeshLambertMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.5 }), -2.4 + i * 1.2, 1.25, z0 + 0.25);
  // stools along the front of the counter
  for (let i = 0; i < 6; i++) { const x = -2.6 + i * 1.05, z = z0 + 0.95; part(props, Cy(0.04, 0.05, 0.75, 6), '#5d636c', x, 0.38, z); part(props, Cy(0.22, 0.22, 0.08, 10), toon('#7a2a2a'), x, 0.8, z); part(props, Cy(0.18, 0.22, 0.04, 10), '#3a3d44', x, 0.02, z); }
  // neon signs on the walls
  const neon = (txt, fg, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.45), new THREE.MeshBasicMaterial({ map: signTex(txt, '#0a0610', fg) })); m.position.set(x, 2.3, z); m.rotation.y = ry; props.add(m); };
  const sx = 12 * UW_K - 0.27; neon('ROT-GUT', '#6fdc5a', -sx, -4, Math.PI / 2); neon('NO MARSHALS', '#ff3b2a', sx, -4, -Math.PI / 2); neon('OPEN LATE', '#ff6aa8', -sx, 4.2, Math.PI / 2);
  // dartboard and a scatter of darts
  part(props, Cy(0.32, 0.32, 0.05, 16), toon('#1e1c22'), sx - 0.03, 1.7, 1.4, 0, 0, Math.PI / 2); part(props, Cy(0.2, 0.2, 0.06, 16), toon('#c8402f'), sx - 0.04, 1.7, 1.4, 0, 0, Math.PI / 2); part(props, Cy(0.06, 0.06, 0.07, 10), toon('#6fdc5a'), sx - 0.05, 1.7, 1.4, 0, 0, Math.PI / 2);
  // pipes along the ceiling that leak a little steam
  for (const x of [-5.6, 5.6]) { part(props, Cy(0.09, 0.09, 15, 6), toon('#5a4a3a'), x, 3.05, 0, Math.PI / 2); }
  levelAnims.push(() => { if (Math.random() < 0.04) burst(V(5.6, 3.0, Math.random() * 10 - 5), '#b8b8c0', 1, 0.3); });
  // crates of product and a sticky floor rug by the bar
  part(props, B(5.5, 0.02, 1.6), toon('#4a1e1e'), 0, 0.01, z0 + 1.1);
  for (const [x, z, s] of [[-7.6, 5.2, 0.7], [-7.0, 5.6, 0.5], [7.4, -6.6, 0.6]]) { part(props, B(s, s, s), toon('#6a4a30', 'wood'), x, s / 2, z, 0, x); box(x, z, s / 2, s / 2); }
}
// the same trick for the Undercroft deck, which was the one that felt empty
const UC_K = 0.7;
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th === 'under') for (const c of L) { c.x *= UC_K; c.z *= UC_K; } return L; }; }
{ const _gf = goFloor, sp0 = Object.assign({}, LEVELS.zfloor.spawn); goFloor = function (n) { LEVELS.zfloor.spawn = zTheme(n) === 'under' ? { x: 22 * UC_K, z: 20 * UC_K, yaw: sp0.yaw } : Object.assign({}, sp0); return _gf.apply(this, arguments); }; }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () {
  const under = zTheme(ZF.floor) === 'under', n0 = [props.children.length, levelGroup.children.length, INTERACTS.length, BOXES.length, CIRCLES.length];
  _b.apply(this, arguments); if (!under) return;
  try { const sc = o => { o.position.x *= UC_K; o.position.z *= UC_K; };
    props.children.slice(n0[0]).forEach(sc); levelGroup.children.slice(n0[1]).forEach(o => { if (o !== props) sc(o); });
    INTERACTS.slice(n0[2]).forEach(i => { i.x *= UC_K; i.z *= UC_K; });
    BOXES.slice(n0[3]).forEach(b => { b[0] *= UC_K; b[1] *= UC_K; }); CIRCLES.slice(n0[4]).forEach(c => { c[0] *= UC_K; c[1] *= UC_K; });
  } catch (e) { console.warn('uc shrink', e); } }; }
