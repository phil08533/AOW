// ---------- Toon materials ----------
const ramp = new THREE.DataTexture(new Uint8Array([85,85,85,255, 165,165,165,255, 255,255,255,255]), 3, 1, THREE.RGBAFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const matCache = {};
function toon(hex) {
  if (!matCache[hex]) matCache[hex] = new THREE.MeshToonMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), gradientMap: ramp });
  return matCache[hex];
}
const glowCache = {};
function glow(hex) { return glowCache[hex] || (glowCache[hex] = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear() })); }

const C = {
  olive: '#6f7a3e', oliveDk: '#4a5229', tan: '#c9b27c', dark: '#2b2a2c', visor: '#4fd2ff',
  steel: '#9aa1aa', steelDk: '#5d636c', red: '#c8402f', bone: '#e9e0c8', gunBody: '#3a3d44', gunAcc: '#e08a2e', eye: '#141216'
};

function part(group, geo, mat, x, y, z, rx, ry, rz) {
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? toon(mat) : mat);
  m.position.set(x || 0, y || 0, z || 0);
  m.rotation.set(rx || 0, ry || 0, rz || 0);
  m.castShadow = true; m.receiveShadow = true;
  group.add(m); return m;
}
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const Cy = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s || 8);
const SPH = new THREE.SphereGeometry(1, 12, 9);
// ellipsoid
function E(g, col, x, y, z, sx, sy, sz, rx, ry, rz) { const m = part(g, SPH, col, x, y, z, rx, ry, rz); m.scale.set(sx, sy, sz); return m; }
// limb segment from a to b; r = radius at a, r2 = radius at b
const UP = V(0, 1, 0);
function seg(g, a, b, r, col, r2) {
  const A = V(...a), Bv = V(...b), dir = Bv.clone().sub(A), len = dir.length();
  const m = part(g, Cy(r2 == null ? r : r2, r, len, 7), col);
  m.position.copy(A).add(Bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}
function chain(g, pts, r, col, rEnd, joints) {
  for (let i = 0; i < pts.length - 1; i++) {
    const ra = r + (rEnd - r) * i / (pts.length - 1), rb = r + (rEnd - r) * (i + 1) / (pts.length - 1);
    seg(g, pts[i], pts[i + 1], ra, col, rb);
    if (joints && i > 0) E(g, col, ...pts[i], ra, ra, ra);
  }
}
function eyes(g, x, y, z, spread, sx, sy, tilt) {
  for (const s of [-1, 1]) E(g, C.eye, x + spread * s, y, z, sx, sy, sx * 0.6, 0, 0.35 * s, -tilt * s);
}

// ---------- Lvl 1 Blaster ----------
function makeBlaster() {
  const g = new THREE.Group();
  part(g, B(0.07, 0.07, 0.46), C.gunBody, 0, 0.05, 0.02);
  part(g, B(0.075, 0.025, 0.30), C.gunAcc, 0, 0.095, 0.0);
  part(g, B(0.07, 0.05, 0.36), C.gunBody, 0, -0.005, -0.03);
  part(g, Cy(0.022, 0.022, 0.12, 8), C.dark, 0, 0.05, 0.3, Math.PI / 2);
  part(g, B(0.065, 0.17, 0.08), C.dark, 0, -0.1, -0.16, -0.35);
  part(g, B(0.065, 0.08, 0.075), C.dark, 0, -0.2, -0.205, -0.6);
  part(g, new THREE.TorusGeometry(0.035, 0.009, 6, 10), C.dark, 0, -0.06, -0.07, 0, Math.PI / 2);
  part(g, B(0.03, 0.03, 0.03), C.gunAcc, 0, 0.11, -0.17);
  return g;
}

// ---------- Trooper ----------
function makeTrooper() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    part(g, B(0.2, 0.16, 0.34), C.dark, 0.13 * s, 0.08, 0.04);
    part(g, B(0.22, 0.08, 0.2), C.tan, 0.13 * s, 0.2, 0.02);
    part(g, B(0.17, 0.38, 0.19), C.olive, 0.13 * s, 0.42, 0);
    part(g, new THREE.IcosahedronGeometry(0.1, 0), C.tan, 0.13 * s, 0.6, 0.07);
    part(g, B(0.2, 0.38, 0.22), C.olive, 0.13 * s, 0.8, 0);
  }
  part(g, B(0.44, 0.16, 0.26), C.dark, 0, 1.0, 0);
  part(g, B(0.46, 0.05, 0.28), C.tan, 0, 1.08, 0);
  part(g, B(0.5, 0.48, 0.3), C.olive, 0, 1.32, 0);
  part(g, B(0.42, 0.26, 0.06), C.tan, 0, 1.4, 0.16);
  part(g, B(0.3, 0.36, 0.14), C.oliveDk, 0, 1.34, -0.21);
  for (const s of [-1, 1]) {
    part(g, new THREE.SphereGeometry(0.15, 8, 6), C.tan, 0.33 * s, 1.52, 0);
    part(g, Cy(0.055, 0.055, 0.02, 10), C.dark, 0.46 * s, 1.53, 0.02, 0, 0, Math.PI / 2);
    part(g, Cy(0.018, 0.018, 0.025, 6), glow(C.gunAcc), 0.465 * s, 1.53, 0.02, 0, 0, Math.PI / 2);
    part(g, B(0.14, 0.28, 0.15), C.olive, 0.37 * s, 1.3, 0);
  }
  part(g, B(0.13, 0.13, 0.3), C.oliveDk, 0.31, 1.13, 0.13, 0, -0.25);
  part(g, B(0.1, 0.1, 0.1), C.dark, 0.24, 1.1, 0.29);
  part(g, B(0.13, 0.13, 0.32), C.oliveDk, -0.25, 1.17, 0.2, 0, 0.55);
  part(g, B(0.1, 0.1, 0.1), C.dark, -0.12, 1.16, 0.36);
  const gun = makeBlaster(); gun.position.set(0.13, 1.2, 0.36); gun.scale.setScalar(1.15); g.add(gun);
  part(g, Cy(0.08, 0.09, 0.08, 8), C.dark, 0, 1.6, 0);
  part(g, new THREE.SphereGeometry(0.17, 8, 6), C.olive, 0, 1.76, 0);
  part(g, B(0.3, 0.07, 0.08), glow(C.visor), 0, 1.79, 0.13);
  part(g, B(0.12, 0.06, 0.06), C.dark, 0, 1.68, 0.14);
  part(g, Cy(0.06, 0.06, 0.05, 10), C.dark, 0.17, 1.77, 0, 0, 0, Math.PI / 2);
  // detail pass: webbing, pouches, antenna, lamp, knee straps
  part(g, B(0.06, 0.56, 0.03), C.dark, 0.08, 1.33, 0.165, 0, 0, 0.5); part(g, B(0.06, 0.56, 0.03), C.dark, -0.08, 1.33, 0.165, 0, 0, -0.5);
  for (const x of [-0.16, -0.05, 0.06, 0.17]) part(g, B(0.09, 0.09, 0.06), C.oliveDk, x, 1.04, 0.15);
  part(g, B(0.12, 0.14, 0.08), C.oliveDk, 0.25, 0.98, 0.02); part(g, B(0.12, 0.14, 0.08), C.oliveDk, -0.25, 0.98, 0.02);
  part(g, Cy(0.006, 0.006, 0.34, 4), C.dark, -0.12, 2.0, -0.06); part(g, new THREE.SphereGeometry(0.018, 5, 4), glow('#ff3b2a'), -0.12, 2.17, -0.06);
  part(g, B(0.07, 0.05, 0.05), C.dark, -0.33, 1.6, 0.1); part(g, B(0.05, 0.035, 0.02), glow('#fff3c4'), -0.33, 1.6, 0.13);
  part(g, Cy(0.1, 0.1, 0.03, 8), C.tan, 0, 1.56, 0);
  for (const s of [-1, 1]) { part(g, B(0.19, 0.03, 0.2), C.dark, 0.13 * s, 0.5, 0); part(g, B(0.21, 0.03, 0.23), C.dark, 0.13 * s, 0.9, 0); part(g, B(0.16, 0.04, 0.08), C.tan, 0.13 * s, 0.14, 0.2); }
  part(g, B(0.22, 0.05, 0.1), C.tan, 0, 1.47, -0.29);
  return g;
}

// ---------- XR-17 ----------
function makeXR17() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    part(g, B(0.16, 0.06, 0.22), C.steelDk, 0.13 * s, 0.03, 0.03);
    for (let i = 0; i < 3; i++) part(g, Cy(0.045, 0.045, 0.08, 6), i % 2 ? C.steel : C.steelDk, 0.13 * s, 0.11 + i * 0.09, 0);
  }
  part(g, B(0.56, 0.3, 0.34), C.steel, 0, 0.62, 0);
  part(g, new THREE.CylinderGeometry(0.28, 0.28, 0.34, 10, 1, false, -Math.PI / 2, Math.PI), C.steel, 0, 0.47, 0, Math.PI / 2);
  part(g, B(0.36, 0.08, 0.04), C.dark, 0, 0.66, 0.18);
  part(g, new THREE.SphereGeometry(0.035, 8, 6), glow('#ff3b2a'), 0, 0.66, 0.2);
  part(g, B(0.03, 0.08, 0.02), C.dark, -0.03, 0.52, 0.18); part(g, B(0.03, 0.08, 0.02), C.dark, 0.03, 0.52, 0.18);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++)
    part(g, B(0.08, 0.06, 0.06), i % 2 ? C.steelDk : C.steel, (0.33 + i * 0.07) * s, 0.6 - i * 0.05, 0.02);
  part(g, B(0.05, 0.12, 0.05), C.red, 0.55, 0.53, 0.04, 0, 0, 0.5); part(g, B(0.05, 0.12, 0.05), C.red, 0.55, 0.53, -0.03, 0, 0, -0.3);
  part(g, B(0.1, 0.1, 0.1), C.red, -0.52, 0.5, 0.02);
  for (let i = 0; i < 5; i++) part(g, new THREE.TorusGeometry(0.04, 0.012, 5, 8), C.dark, 0, 0.8 + i * 0.045, 0, Math.PI / 2);
  const head = new THREE.Group(); head.position.set(0, 1.06, 0.02); g.add(head);
  part(head, B(0.2, 0.24, 0.42), C.red, 0, 0, 0);
  part(head, B(0.22, 0.05, 0.3), C.dark, 0, 0.0, -0.02);
  for (let i = 0; i < 4; i++) part(head, B(0.24, 0.26, 0.025), i % 2 ? C.dark : C.bone, 0, 0, 0.22 + i * 0.03);
  part(head, Cy(0.05, 0.05, 0.1, 8), C.dark, 0, 0, 0.36, Math.PI / 2);
  part(head, B(0.05, 0.12, 0.14), C.dark, 0, -0.16, -0.12, 0.3);
  part(head, Cy(0.008, 0.008, 0.2, 4), C.dark, 0.06, 0.2, -0.12);
  part(head, new THREE.SphereGeometry(0.02, 6, 4), glow('#ff3b2a'), 0.06, 0.3, -0.12);
  g.userData.anim = (t) => { head.rotation.y = Math.sin(t * 0.8) * 0.5; head.rotation.x = Math.sin(t * 1.3) * 0.08; };
  return g;
}

// =================== ALIENS ===================
// Elismas, gun master: grey alien, tilted egg head, big black eyes, strapped brown armor, jetpack
function makeElismas() {
  const g = new THREE.Group(), skin = '#9aa58e', armor = '#6b5038', strap = '#3d2c20';
  for (const s of [-1, 1]) {
    part(g, B(0.13, 0.12, 0.26), strap, 0.12 * s, 0.06, 0.04);
    seg(g, [0.12 * s, 0.1, 0], [0.12 * s, 0.55, 0], 0.06, strap, 0.055);   // boots/shins
    E(g, armor, 0.12 * s, 0.56, 0.02, 0.07, 0.06, 0.07);
    seg(g, [0.12 * s, 0.56, 0], [0.1 * s, 0.98, 0], 0.06, armor, 0.07);
  }
  E(g, armor, 0, 1.02, 0, 0.17, 0.09, 0.11);
  part(g, B(0.08, 0.13, 0.08), strap, 0.2, 0.95, 0.02);                         // holster
  part(g, B(0.03, 0.12, 0.04), C.gunBody, 0.2, 0.89, 0.06);
  seg(g, [0, 1.05, 0], [0, 1.42, 0], 0.11, armor, 0.15);                         // slim torso, wider chest
  part(g, B(0.04, 0.46, 0.03), strap, 0, 1.25, 0.13, 0, 0, 0.55);               // bandolier
  part(g, B(0.04, 0.46, 0.03), strap, 0, 1.25, 0.13, 0, 0, -0.55);
  for (const s of [-1, 1]) {
    E(g, armor, 0.18 * s, 1.43, 0, 0.07, 0.06, 0.07);
    chain(g, [[0.18 * s, 1.43, 0], [0.27 * s, 1.15, 0.02], [0.33 * s, 0.92, 0.08]], 0.045, skin, 0.035, true);
    part(g, B(0.05, 0.03, 0.06), strap, 0.24 * s, 1.24, 0.02);
    E(g, skin, 0.34 * s, 0.87, 0.1, 0.04, 0.06, 0.03);
  }
  part(g, Cy(0.05, 0.05, 0.3, 8), C.steelDk, -0.07, 1.33, -0.17); part(g, Cy(0.05, 0.05, 0.3, 8), C.steelDk, 0.07, 1.33, -0.17); // jetpack
  part(g, Cy(0.035, 0.05, 0.05, 8), glow('#ffb347'), -0.07, 1.16, -0.17); part(g, Cy(0.035, 0.05, 0.05, 8), glow('#ffb347'), 0.07, 1.16, -0.17);
  seg(g, [0, 1.45, 0], [0, 1.58, 0.02], 0.045, skin);
  const head = new THREE.Group(); head.position.set(0, 1.74, 0.02); head.rotation.x = -0.35; g.add(head);
  E(head, skin, 0, 0.04, 0, 0.17, 0.25, 0.18);
  E(head, skin, 0, -0.14, 0.06, 0.08, 0.08, 0.08);
  eyes(head, 0, -0.02, 0.15, 0.075, 0.06, 0.035, 0.45);
  g.userData.anim = (t) => { head.rotation.z = Math.sin(t * 0.7) * 0.08; };
  return g;
}

// Maxurge, staff master: grey armor, blue plates, crested cyclops helmet, scythe staff
function makeMaxurge() {
  const g = new THREE.Group(), grey = '#7e848d', dk = '#3a3d44', blue = '#4f78c4';
  for (const s of [-1, 1]) {
    part(g, B(0.17, 0.12, 0.28), dk, 0.13 * s, 0.06, 0.03);
    part(g, B(0.15, 0.36, 0.16), grey, 0.13 * s, 0.32, 0);
    part(g, new THREE.IcosahedronGeometry(0.09, 0), dk, 0.13 * s, 0.53, 0.05);
    part(g, B(0.18, 0.36, 0.19), blue, 0.13 * s, 0.75, 0);
  }
  part(g, B(0.4, 0.15, 0.24), dk, 0, 0.98, 0);
  part(g, B(0.46, 0.44, 0.28), grey, 0, 1.27, 0);
  for (let i = 0; i < 3; i++) part(g, B(0.3 - i * 0.04, 0.05, 0.04), dk, 0, 1.12 + i * 0.09, 0.14);   // ab lines
  part(g, B(0.08, 0.62, 0.04), '#2c2a3a', 0, 1.27, 0.15, 0, 0, 0.62);                                 // sash
  for (const s of [-1, 1]) {
    E(g, blue, 0.31 * s, 1.47, 0, 0.14, 0.12, 0.15);
    part(g, Cy(0.04, 0.04, 0.02, 10), glow('#9fd0ff'), 0.31 * s, 1.5, 0.15, Math.PI / 2);
    part(g, B(0.13, 0.26, 0.14), grey, 0.33 * s, 1.24, 0);
    part(g, B(0.14, 0.24, 0.15), blue, 0.35 * s, 1.0, 0.04);
    part(g, B(0.11, 0.1, 0.11), dk, 0.35 * s, 0.85, 0.06);
  }
  // scythe staff in right hand
  const staff = new THREE.Group(); staff.position.set(0.38, 0.85, 0.12); staff.rotation.z = -0.08; g.add(staff);
  part(staff, Cy(0.022, 0.022, 2.1, 6), '#4a3a2c', 0, 0.35, 0);
  for (let i = 0; i < 5; i++) part(staff, Cy(0.03, 0.03, 0.03, 6), C.steelDk, 0, -0.3 + i * 0.25, 0);
  part(staff, new THREE.ConeGeometry(0.035, 0.18, 4), C.steel, 0, 1.48, 0);
  const blade = part(staff, new THREE.TorusGeometry(0.34, 0.025, 4, 14, Math.PI * 0.75), '#c8ccd2', -0.3, 1.25, 0, 0, 0, 0.35);
  blade.scale.set(1, 0.8, 0.5);
  // helmet: dome, visor, horns, crest, single blue eye
  part(g, Cy(0.07, 0.08, 0.08, 8), dk, 0, 1.53, 0);
  E(g, grey, 0, 1.68, 0, 0.16, 0.17, 0.17);
  part(g, B(0.26, 0.06, 0.06), C.eye, 0, 1.66, 0.13);
  part(g, B(0.1, 0.06, 0.05), dk, 0, 1.58, 0.14);
  part(g, new THREE.ConeGeometry(0.05, 0.22, 4), dk, 0, 1.9, -0.02);
  for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.035, 0.16, 5), dk, 0.13 * s, 1.83, 0, 0, 0, -0.6 * s);
  part(g, new THREE.OctahedronGeometry(0.045, 0), glow('#5fb4ff'), 0, 1.76, 0.15);
  return g;
}

// Bug Master: four-eyed insect, antennae, mandibles, wide crouch, yellow crystal staff
function makeBugMaster() {
  const g = new THREE.Group(), br = '#86664a', dk = '#5a4231', lt = '#a78563';
  E(g, br, 0, 0.62, -0.08, 0.2, 0.24, 0.17, 0.25);                         // abdomen
  part(g, new THREE.ConeGeometry(0.1, 0.22, 7), dk, 0, 0.36, -0.13, Math.PI + 0.25);
  E(g, lt, 0, 0.98, 0.0, 0.14, 0.17, 0.13);                                // thorax
  for (const s of [-1, 1]) {                                                // crouched legs with spines
    chain(g, [[0.1 * s, 0.82, 0], [0.42 * s, 0.62, 0.08], [0.5 * s, 0.05, 0.12]], 0.05, br, 0.03, true);
    for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.018, 0.08, 4), dk, (0.45 + k * 0.012) * s, 0.45 - k * 0.12, 0.13, 0, 0, -1.2 * s);
    part(g, B(0.16, 0.03, 0.12), dk, 0.53 * s, 0.02, 0.16);
  }
  chain(g, [[0.12, 1.06, 0], [0.32, 0.92, 0.12], [0.22, 0.82, 0.3]], 0.04, br, 0.03, true);           // right arm forward
  chain(g, [[-0.12, 1.06, 0], [-0.3, 1.22, 0.1], [-0.12, 1.32, 0.22]], 0.04, br, 0.03, true);         // left arm up on staff
  const staff = new THREE.Group(); staff.position.set(0.02, 1.0, 0.25); staff.rotation.set(0.1, 0, -0.55); g.add(staff);
  part(staff, Cy(0.02, 0.02, 1.5, 6), '#6b4a2a', 0, 0, 0);
  part(staff, new THREE.OctahedronGeometry(0.09, 0), glow('#ffd23a'), 0, 0.85, 0).scale.set(0.7, 1.4, 0.7);
  // head
  const head = new THREE.Group(); head.position.set(0, 1.28, 0.06); g.add(head);
  E(head, lt, 0, 0, 0, 0.14, 0.13, 0.13);
  for (const s of [-1, 1]) {
    E(head, C.eye, 0.07 * s, 0.01, 0.1, 0.05, 0.055, 0.04);
    E(head, C.eye, 0.04 * s, 0.09, 0.09, 0.022, 0.022, 0.02);
    chain(head, [[0.04 * s, 0.1, 0], [0.12 * s, 0.32, -0.05], [0.2 * s, 0.4, -0.02]], 0.012, dk, 0.008);
    part(head, new THREE.ConeGeometry(0.02, 0.09, 4), dk, 0.035 * s, -0.12, 0.08, 0.2, 0, 0.5 * s);
  }
  g.userData.anim = (t) => { head.rotation.z = Math.sin(t * 1.4) * 0.12; };
  return g;
}

// Bug Hybrid Warrior: tall green beetle soldier, pale shell belly, banner staff
function makeBugHybrid() {
  const g = new THREE.Group(), gr = '#5f8a3a', pale = '#e2dfb2', dk = '#3e5e26';
  for (const s of [-1, 1]) {
    chain(g, [[0.12 * s, 0.85, 0], [0.16 * s, 0.45, 0.05], [0.14 * s, 0.04, 0]], 0.04, gr, 0.03, true);
    part(g, B(0.1, 0.03, 0.16), dk, 0.14 * s, 0.015, 0.04);
  }
  E(g, gr, 0, 1.3, -0.02, 0.26, 0.56, 0.2);        // green shell rim
  E(g, pale, 0, 1.3, 0.04, 0.22, 0.52, 0.17);      // pale belly
  for (let i = 0; i < 4; i++) part(g, B(0.3, 0.012, 0.02), '#b9b58a', 0, 1.05 + i * 0.16, 0.2);
  for (const s of [-1, 1]) chain(g, [[0.2 * s, 1.62, 0], [0.36 * s, 1.35, 0.06], [0.34 * s, 1.05, 0.14]], 0.035, gr, 0.025, true);
  const staff = new THREE.Group(); staff.position.set(0.34, 1.05, 0.15); g.add(staff);
  part(staff, Cy(0.018, 0.018, 2.0, 6), '#4a3a2c', 0, 0.05, 0);
  part(staff, B(0.02, 0.22, 0.2), glow('#f2c23a'), 0, 0.85, 0.11);
  part(staff, new THREE.ConeGeometry(0.03, 0.14, 4), C.steel, 0, 1.12, 0);
  const head = new THREE.Group(); head.position.set(0, 1.92, 0.02); g.add(head);
  E(head, gr, 0, 0, 0, 0.1, 0.13, 0.1);
  eyes(head, 0, 0.02, 0.08, 0.045, 0.035, 0.02, 0.5);
  for (const s of [-1, 1]) chain(head, [[0.03 * s, 0.1, 0], [0.08 * s, 0.24, 0.02], [0.12 * s, 0.28, 0.06]], 0.01, dk, 0.007);
  return g;
}

// Alien Spearman: green big-eyed alien with spear and oval shield
function makeSpearman() {
  const g = new THREE.Group(), gr = '#7fae63', dk = '#4f7a3c';
  for (const s of [-1, 1]) {
    chain(g, [[0.08 * s, 0.6, 0], [0.09 * s, 0.3, 0.02], [0.09 * s, 0.04, 0]], 0.035, gr, 0.028, true);
    E(g, dk, 0.09 * s, 0.03, 0.04, 0.05, 0.03, 0.08);
  }
  E(g, gr, 0, 0.85, 0, 0.16, 0.3, 0.13);
  chain(g, [[0.14, 1.05, 0], [0.26, 0.88, 0.1], [0.24, 0.72, 0.18]], 0.03, gr, 0.025, true);
  chain(g, [[-0.14, 1.05, 0], [-0.25, 0.92, 0.1], [-0.22, 0.8, 0.2]], 0.03, gr, 0.025, true);
  part(g, Cy(0.015, 0.015, 1.9, 6), '#5a4532', 0.25, 0.85, 0.18);           // spear
  part(g, new THREE.ConeGeometry(0.04, 0.16, 4), C.steel, 0.25, 1.88, 0.18);
  const shield = E(g, '#3d3b3f', -0.26, 0.85, 0.28, 0.24, 0.33, 0.03, 0, -0.35);  // big oval shield
  E(g, '#5c5960', -0.25, 0.85, 0.3, 0.06, 0.08, 0.02, 0, -0.35);
  seg(g, [0, 1.1, 0], [0, 1.22, 0], 0.035, gr);
  const head = new THREE.Group(); head.position.set(0, 1.42, 0.02); g.add(head);
  E(head, gr, 0, 0.03, 0, 0.17, 0.21, 0.16);
  E(head, gr, 0, -0.12, 0.04, 0.07, 0.07, 0.07);
  eyes(head, 0, -0.01, 0.13, 0.075, 0.06, 0.035, 0.5);
  return g;
}

// Crolan: fanged egg critter on a disc of spindly legs, two forked arms
function makeCrolan() {
  const g = new THREE.Group(), or = '#d9893a', dk = '#9b5a22';
  const legs = new THREE.Group(); g.add(legs);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2, x = Math.cos(a), z = Math.sin(a);
    chain(legs, [[x * 0.28, 0.32, z * 0.18], [x * 0.42, 0.18, z * 0.3], [x * 0.38, 0.0, z * 0.28]], 0.02, dk, 0.012);
  }
  E(g, or, 0, 0.34, 0, 0.42, 0.06, 0.26);                                    // disc
  E(g, or, 0, 0.62, 0, 0.18, 0.26, 0.17);                                    // egg body
  eyes(g, 0, 0.72, 0.13, 0.06, 0.035, 0.025, 0.3);
  E(g, '#5a2c12', 0, 0.58, 0.155, 0.07, 0.025, 0.02);                         // mouth
  for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.018, 0.08, 4), C.bone, 0.03 * s, 0.53, 0.16, Math.PI);
  for (const s of [-1, 1]) {
    chain(g, [[0.15 * s, 0.6, 0], [0.38 * s, 0.68, 0], [0.45 * s, 0.9, 0]], 0.025, dk, 0.018);
    for (let k = -1; k <= 1; k++) seg(g, [0.45 * s, 0.9, 0], [(0.45 + 0.07 * k) * s, 1.04, 0.03 * k], 0.014, dk, 0.008);
  }
  g.userData.anim = (t) => { legs.rotation.y = Math.sin(t * 3) * 0.06; };
  return g;
}

// Stagrone: long-necked runner, curled ram horn, tiny arms, whip tail with tuft
function makeStagrone() {
  const g = new THREE.Group(), br = '#9a7650', dk = '#6a4f34';
  for (const s of [-1, 1]) {
    chain(g, [[0.1 * s, 0.82, 0], [0.12 * s, 0.5, 0.12], [0.1 * s, 0.22, -0.05], [0.11 * s, 0.02, 0.05]], 0.06, br, 0.025, true);
    part(g, B(0.08, 0.03, 0.14), dk, 0.11 * s, 0.015, 0.09);
  }
  E(g, br, 0, 0.95, -0.05, 0.22, 0.24, 0.3, -0.3);
  const neck = [[0, 1.05, 0.15], [0, 1.4, 0.22], [0, 1.75, 0.18], [0, 2.0, 0.24]];
  chain(g, neck, 0.08, br, 0.05, true);
  for (const s of [-1, 1]) chain(g, [[0.08 * s, 1.15, 0.2], [0.14 * s, 1.08, 0.36], [0.1 * s, 1.18, 0.44]], 0.022, br, 0.015, true);
  const head = new THREE.Group(); head.position.set(0, 2.05, 0.3); g.add(head);
  E(head, br, 0, 0, 0.05, 0.08, 0.08, 0.16);
  E(head, dk, 0, -0.02, 0.2, 0.05, 0.045, 0.04);
  E(head, C.eye, 0.06, 0.03, 0.08, 0.018, 0.018, 0.018); E(head, C.eye, -0.06, 0.03, 0.08, 0.018, 0.018, 0.018);
  for (const s of [-1, 1]) { const horn = part(head, new THREE.TorusGeometry(0.08, 0.02, 5, 10, Math.PI * 1.4), '#d8cbb0', 0.07 * s, 0.07, -0.04, 0, Math.PI / 2, 0.6); }
  const tail = new THREE.Group(); g.add(tail);
  chain(tail, [[0, 0.92, -0.32], [0, 0.85, -0.7], [0, 0.95, -1.05], [0, 1.1, -1.3]], 0.04, br, 0.012);
  E(tail, dk, 0, 1.13, -1.34, 0.04, 0.06, 0.04);
  g.userData.anim = (t) => { tail.rotation.y = Math.sin(t * 2) * 0.18; head.rotation.x = Math.sin(t * 1.1) * 0.1; };
  return g;
}

// Skyrene ("vamps"): floating double-lobed vampire with trailing tentacles and claws
function makeSkyrene() {
  const g = new THREE.Group(), yo = '#e2a24a', dk = '#a8672a';
  const body = new THREE.Group(); body.position.y = 1.35; g.add(body);
  E(body, yo, 0, 0.12, 0.08, 0.32, 0.22, 0.26);
  E(body, yo, 0, -0.14, 0.08, 0.3, 0.2, 0.24);
  E(body, dk, 0, 0, 0.0, 0.08, 0.1, 0.08);
  eyes(body, 0, 0.05, 0.31, 0.12, 0.04, 0.025, 0.2);
  for (const s of [-1, 1]) {
    seg(body, [0.28 * s, 0.05, 0.12], [0.42 * s, 0.1, 0.22], 0.02, dk, 0.015);
    for (let k = -1; k <= 1; k += 2) seg(body, [0.42 * s, 0.1, 0.22], [0.48 * s, 0.1 + 0.05 * k, 0.3], 0.012, dk, 0.006);
  }
  const tents = [];
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Group(); t.position.set((i - 1.5) * 0.08, -0.02 + (i % 2) * 0.05, -0.12); body.add(t); tents.push(t);
    chain(t, [[0, 0, 0], [0.04, -0.06, -0.35], [-0.03, -0.12, -0.7], [0.05, -0.2, -1.05]], 0.03, yo, 0.008);
  }
  g.userData.anim = (time) => {
    body.position.y = 1.35 + Math.sin(time * 1.8) * 0.12;
    tents.forEach((t, i) => { t.rotation.x = Math.sin(time * 2.5 + i) * 0.2; t.rotation.y = Math.sin(time * 1.7 + i * 1.3) * 0.25; });
  };
  return g;
}

// Gopel (rock thrower): heavy grey beast holding a boulder on its upturned trunk
function makeGopel() {
  const g = new THREE.Group(), gr = '#8e8f8c', dk = '#5f605d';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    seg(g, [0.24 * sx, 0.55, 0.3 * sz], [0.24 * sx, 0.05, 0.32 * sz], 0.1, gr, 0.08);
    part(g, Cy(0.09, 0.1, 0.06, 8), dk, 0.24 * sx, 0.03, 0.32 * sz);
  }
  E(g, gr, 0, 0.78, 0, 0.42, 0.36, 0.56);
  E(g, gr, 0, 0.82, 0.55, 0.24, 0.24, 0.22);                                  // head
  E(g, C.eye, 0.15, 0.92, 0.66, 0.025, 0.025, 0.02); E(g, C.eye, -0.15, 0.92, 0.66, 0.025, 0.025, 0.02);
  E(g, '#3d3e3b', 0, 0.68, 0.72, 0.1, 0.04, 0.04);
  for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.02, 0.07, 4), C.bone, 0.06 * s, 0.64, 0.73, Math.PI);
  const trunk = new THREE.Group(); g.add(trunk);
  chain(trunk, [[0, 0.9, 0.7], [0, 1.2, 0.82], [0, 1.5, 0.78], [0, 1.65, 0.7]], 0.07, gr, 0.055, true);
  const rock = part(trunk, new THREE.DodecahedronGeometry(0.2, 0), '#3f3a36', 0, 1.82, 0.7);
  part(g, new THREE.ConeGeometry(0.06, 0.25, 5), dk, 0, 0.92, -0.6, -1.9);       // stubby tail
  g.userData.anim = (t) => { trunk.rotation.x = Math.sin(t * 1.2) * 0.05; rock.rotation.y = t * 0.6; };
  return g;
}

// Rock / Ice monster: stacked chunks with a fanged face and a club
function makeChunkMonster(rock, rockDk, headCol, club, ice) {
  const g = new THREE.Group();
  const chunk = (r) => ice ? new THREE.IcosahedronGeometry(r, 0) : new THREE.DodecahedronGeometry(r, 0);
  const at = (r, col, x, y, z, sx, sy, sz, ry) => { const m = part(g, chunk(r), col, x, y, z, 0.3, ry || 0, 0.1); m.scale.set(sx || 1, sy || 1, sz || 1); return m; };
  for (const s of [-1, 1]) {
    at(0.11, rockDk, 0.16 * s, 0.07, 0.05, 1.3, 0.6, 1.4, s);
    at(0.1, rock, 0.16 * s, 0.3, 0, 0.9, 1.5, 0.9, s * 2);
    at(0.12, rock, 0.15 * s, 0.6, 0, 0.9, 1.3, 0.9, s * 3);
  }
  at(0.2, rockDk, 0, 0.88, 0, 1.3, 0.8, 1);
  at(0.24, rock, 0, 1.18, 0, 1.2, 1, 0.95);
  at(0.2, rock, 0, 1.45, 0, 1.4, 0.8, 1);
  for (const s of [-1, 1]) {
    at(0.11, rockDk, 0.4 * s, 1.45, 0, 1, 1, 1, s);
    at(0.09, rock, 0.48 * s, 1.22, 0.05, 1, 1.4, 1, s * 2);
    at(0.09, rockDk, 0.5 * s, 1.0, 0.1, 1, 1, 1, s * 3);
  }
  const head = new THREE.Group(); head.position.set(0, 1.75, 0.02); g.add(head);
  const hm = part(head, chunk(0.2), headCol, 0, 0, 0, 0.2, 0.4, 0); hm.scale.set(1.25, 0.9, 1);
  E(head, C.eye, 0, 0.06, 0.17, 0.05, 0.035, 0.02);
  E(head, '#2b1d16', 0, -0.06, 0.17, 0.12, 0.04, 0.03);
  for (let k = -1; k <= 1; k++) part(head, new THREE.ConeGeometry(0.022, 0.07, 4), C.bone, k * 0.05, -0.04, 0.19, Math.PI);
  const clubG = new THREE.Group(); clubG.position.set(-0.52, 1.0, 0.14); clubG.rotation.set(0.3, 0, 0.9); g.add(clubG);
  part(clubG, Cy(0.11, 0.05, 0.8, 7), club, 0, 0.4, 0);
  g.userData.anim = (t) => { clubG.rotation.z = 0.9 + Math.sin(t * 1.5) * 0.12; head.rotation.y = Math.sin(t * 0.6) * 0.2; };
  return g;
}

// Drome: black/red warlord with spiked shoulders, horned helmet, sword and gun (enemies page 19)
function makeDrome() {
  const g = new THREE.Group(), blk = '#1e1c22', red = '#b3262c', gry = '#45434a';
  for (const s of [-1, 1]) {
    part(g, B(0.2, 0.14, 0.34), blk, 0.15 * s, 0.07, 0.04);
    part(g, B(0.18, 0.46, 0.2), blk, 0.15 * s, 0.38, 0);
    part(g, B(0.12, 0.34, 0.05), red, 0.15 * s, 0.38, 0.11);
    part(g, new THREE.ConeGeometry(0.06, 0.16, 4), red, 0.15 * s, 0.64, 0.12, 1.3);
    part(g, B(0.22, 0.44, 0.24), blk, 0.15 * s, 0.86, 0);
    part(g, B(0.1, 0.3, 0.05), red, 0.15 * s, 0.86, 0.13);
  }
  part(g, B(0.5, 0.18, 0.3), gry, 0, 1.12, 0);
  part(g, B(0.6, 0.6, 0.36), blk, 0, 1.5, 0);
  part(g, B(0.22, 0.5, 0.05), red, -0.1, 1.5, 0.19, 0, 0, -0.45);
  part(g, B(0.22, 0.5, 0.05), red, 0.1, 1.5, 0.19, 0, 0, 0.45);
  for (let i = 0; i < 3; i++) part(g, B(0.36, 0.04, 0.04), gry, 0, 1.28 + i * 0.08, 0.19);
  for (const s of [-1, 1]) {
    E(g, blk, 0.42 * s, 1.76, 0, 0.17, 0.14, 0.2);
    for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.04, 0.2, 4), red, (0.42 + k * 0.06) * s, 1.9 - k * 0.04, -0.08 + k * 0.08, 0, 0, -0.5 * s);
    part(g, B(0.15, 0.3, 0.16), blk, 0.45 * s, 1.5, 0);
    part(g, B(0.17, 0.28, 0.18), red, 0.47 * s, 1.22, 0.03);
    part(g, B(0.13, 0.12, 0.13), gry, 0.47 * s, 1.04, 0.06);
  }
  const sword = new THREE.Group(); sword.position.set(0.48, 1.02, 0.12); sword.rotation.set(-0.5, 0, -0.15); g.add(sword);
  part(sword, B(0.05, 0.2, 0.05), gry, 0, -0.05, 0);
  part(sword, B(0.26, 0.04, 0.07), red, 0, 0.06, 0);
  part(sword, B(0.04, 1.1, 0.12), '#c9ccd2', 0, 0.63, 0);
  part(sword, B(0.042, 1.0, 0.025), red, 0, 0.6, 0.07);
  part(sword, new THREE.ConeGeometry(0.06, 0.18, 4), '#c9ccd2', 0, 1.27, 0);
  const gun = makeBlaster(); gun.scale.setScalar(1.5); gun.position.set(-0.47, 1.02, 0.2); g.add(gun);
  part(g, Cy(0.09, 0.1, 0.1, 8), gry, 0, 1.84, 0);
  E(g, blk, 0, 2.02, 0, 0.17, 0.2, 0.18);
  part(g, B(0.24, 0.045, 0.05), glow('#ff2a3a'), 0, 2.04, 0.15);
  part(g, new THREE.ConeGeometry(0.07, 0.18, 4), blk, 0, 1.9, 0.15, 2.6);
  for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.05, 0.28, 4), blk, 0.12 * s, 2.24, -0.02, 0, 0, -0.35 * s);
  g.userData.sword = sword;
  return g;
}

// =================== EARTH SAFE ZONE TOWN ===================
const TOWN = V(0, 0, -24);
function signTex(text, bg, fg) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 512, 128);
  x.strokeStyle = fg; x.lineWidth = 8; x.strokeRect(10, 10, 492, 108);
  x.fillStyle = fg; x.font = 'bold 72px Impact, "Arial Narrow", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
function sign(g, text, bg, fg, x, y, z, w, ry) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: signTex(text, bg, fg) }));
  m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m;
}
function dome(g, r, col, x, z) {
  part(g, new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), col, x, 0, z);
  part(g, Cy(r * 1.02, r * 1.02, 0.25, 12), '#6c6656', x, 0.12, z);
}
function makeDropship() {
  const g = new THREE.Group(), hull = '#7b8457', dk = '#3e4330';
  part(g, B(1.4, 0.8, 3.2), hull, 0, 1.0, 0);
  part(g, B(1.2, 0.5, 1.0), hull, 0, 1.15, 2.0, 0.25);
  part(g, B(1.0, 0.25, 0.6), glow('#6fd0ff'), 0, 1.35, 2.25, 0.4);
  part(g, B(4.2, 0.12, 1.0), hull, 0, 1.15, -0.3);
  for (const s of [-1, 1]) {
    part(g, Cy(0.32, 0.32, 1.4, 10), dk, 1.9 * s, 1.15, -0.3, Math.PI / 2);
    part(g, Cy(0.24, 0.24, 0.05, 10), glow('#ffb347'), 1.9 * s, 1.15, -1.01, Math.PI / 2);
    part(g, B(0.12, 0.6, 0.12), dk, 0.5 * s, 0.35, 0.8); part(g, B(0.12, 0.6, 0.12), dk, 0.5 * s, 0.35, -1);
  }
  part(g, B(0.12, 0.9, 0.8), hull, 0, 1.75, -1.4, -0.3);
  part(g, B(1.2, 0.6, 0.05), dk, 0, 0.8, -1.62);
  return g;
}
function makeTown() {
  const g = new THREE.Group(); g.position.copy(TOWN);
  // plaza
  const plaza = new THREE.CircleGeometry(10.5, 24); plaza.rotateX(-Math.PI / 2);
  part(g, plaza, '#b3a27c', 0, 0.02, 0).castShadow = false;
  // wall ring with a gate facing the clearing (+z)
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.24) continue;
    const w = part(g, B(2.3, 1.6, 0.5), i % 2 ? '#8d8a80' : '#9c988c', Math.cos(a) * 10.5, 0.8, Math.sin(a) * 10.5, 0, -a + Math.PI / 2);
    if (i % 2) part(g, B(0.6, 0.4, 0.6), '#77736a', Math.cos(a) * 10.5, 1.8, Math.sin(a) * 10.5, 0, -a);
  }
  for (const s of [-1, 1]) { part(g, B(0.7, 3.2, 0.7), '#6c6862', 1.8 * s, 1.6, 10.5); part(g, Cy(0.18, 0.18, 0.3, 8), glow('#ffb347'), 1.8 * s, 3.35, 10.5); }
  part(g, B(4.3, 0.5, 0.4), '#3a3833', 0, 3.0, 10.5);
  sign(g, 'SAFE ZONE', '#2a2724', '#f6b56a', 0, 3.0, 10.72, 3.6);
  // buildings along the front street, as in the Earth map sketch
  const shop = (label, col, x, z, w, h, d, signBg) => {
    part(g, B(w, h, d), col, x, h / 2, z);
    part(g, B(w + 0.3, 0.2, d + 0.3), '#4b463f', x, h + 0.1, z);
    part(g, B(0.9, 1.4, 0.05), '#2c2925', x, 0.7, z + d / 2 + 0.03);
    sign(g, label, signBg, '#efe7d6', x, h - 0.45, z + d / 2 + 0.04, Math.min(w - 0.3, 2.6));
  };
  shop('GUN SHOP', '#8a6d4c', -5.6, 3.2, 3, 2.4, 2.6, '#7a2d22');
  shop('BANK  $', '#c9c0a8', -1.9, 4.2, 2.8, 2.8, 2.6, '#2e5a3a');
  shop('STORE', '#a88c62', 5.4, 3.4, 3, 2.2, 2.6, '#33507a');
  for (const s of [-1, 1]) part(g, Cy(0.14, 0.14, 2.6, 8), '#e3dccb', -1.9 + s * 1.0, 1.3, 5.6);
  // clinic + armory domes (dome-and-box style from the base sketches)
  dome(g, 1.9, '#e3dccb', 2.0, 4.0);
  part(g, B(1.2, 0.36, 0.06), glow('#e04a3a'), 2.0, 1.2, 5.92); part(g, B(0.36, 1.2, 0.06), glow('#e04a3a'), 2.0, 1.2, 5.92);
  sign(g, 'CLINIC', '#9b2a22', '#efe7d6', 2.0, 2.15, 5.0, 1.8, 0);
  dome(g, 2.2, '#7e8459', 4.5, -2.6);
  part(g, B(2.2, 1.6, 1.8), '#6b7049', 4.5, 0.8, -0.6);
  sign(g, 'ARMORY', '#3e4330', '#f6b56a', 4.5, 1.4, 0.32, 1.8);
  // airport: control tower, landing pad, parked dropship
  part(g, Cy(0.5, 0.7, 4.6, 8), '#9c988c', -5.2, 2.3, -3.4);
  part(g, Cy(1.1, 0.8, 1.0, 8), '#4b463f', -5.2, 5.0, -3.4);
  part(g, Cy(1.0, 1.0, 0.6, 8), glow('#7fd6ff'), -5.2, 5.1, -3.4);
  part(g, Cy(0.03, 0.03, 1.2, 4), C.dark, -5.2, 6.1, -3.4);
  const pad = part(g, Cy(3.0, 3.0, 0.1, 20), '#4f4c46', -1.2, 0.07, -5.4); pad.castShadow = false;
  const padRing = new THREE.Mesh(new THREE.RingGeometry(2.3, 2.6, 24), glow('#f6b56a')); padRing.rotation.x = -Math.PI / 2; padRing.position.set(-1.2, 0.13, -5.4); g.add(padRing);
  const ship = makeDropship(); ship.position.set(-1.2, 0.1, -5.4); ship.rotation.y = 0.9; g.add(ship);
  sign(g, 'AIRPORT', '#2a2724', '#7fd6ff', -5.2, 1.4, -2.85, 1.8);
  // street lamps
  for (const [x, z] of [[-3.6, 6.4], [0, 7.4], [3.6, 6.4], [-7, 0], [7, 0.4]]) {
    part(g, Cy(0.06, 0.06, 2.4, 6), C.dark, x, 1.2, z);
    part(g, new THREE.SphereGeometry(0.16, 8, 6), glow('#ffd28a'), x, 2.45, z);
  }
  return g;
}

// =================== TERRAIN ===================
function noise(x, z) { return Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.9 + Math.sin(x * 0.9 + z * 0.6) * 0.25 + Math.cos(z * 1.3 - x * 0.4) * 0.15; }
function hillK(x, z) {
  const r = Math.hypot(x, z), rt = Math.hypot(x - TOWN.x, z - TOWN.z);
  const pathD = Math.abs(x) < 2.6 && z < 0 && z > TOWN.z ? 0 : 1;   // flat road from clearing to the gate
  return Math.min(THREE.MathUtils.smoothstep(r, 8.5, 15), THREE.MathUtils.smoothstep(rt, 11.5, 17), pathD ? 1 : THREE.MathUtils.smoothstep(Math.abs(x), 2.6, 6));
}
function heightAt(x, z) { const k = hillK(x, z); return noise(x, z) * 0.1 * (1 - k) + (noise(x, z) * 1.6 + 0.4) * k * 1.4; }
function makeLand() {
  const g = new THREE.Group();
  let geo = new THREE.PlaneGeometry(130, 130, 72, 72); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    p.setY(i, heightAt(x, z) + Math.max(0, r - 40) * 0.18);
  }
  geo = geo.toNonIndexed(); geo.computeVertexNormals();
  part(g, geo, '#7d8a45').castShadow = false;
  const dirt = new THREE.CircleGeometry(8.6, 20); dirt.rotateX(-Math.PI / 2);
  part(g, dirt, '#a48a5c', 0, 0.04, 0).castShadow = false;
  const road = new THREE.PlaneGeometry(3.6, 8.5); road.rotateX(-Math.PI / 2);
  part(g, road, '#a48a5c', 0, 0.045, -10.6).castShadow = false;
  const rocks = [[-10.5, -3, 1.1], [11, -6, 1.4], [-12, 5, 1.8], [12.5, 4, 0.9], [-8, -12, 1.2], [9, -13, 1.6], [16, -2, 2.2], [-16, -8, 2]];
  rocks.forEach(([x, z, s], i) => { const r = part(g, new THREE.DodecahedronGeometry(s, 0), i % 2 ? '#8f8778' : '#a39a88', x, heightAt(x, z) + s * 0.3, z, i, i * 1.7, 0); r.scale.y = 0.6; });
  const caneSpots = [[-9.6, 1.5], [9.8, -1.5], [-11, -8], [11.5, -9], [-7, 10], [7.5, 9.5], [-14, 1], [14, 0.5], [-5, -15], [5.5, -15.5]];
  caneSpots.forEach(([cx, cz], j) => {
    for (let n = 0; n < 4; n++) {
      const ox = cx + Math.sin(j * 7 + n * 2.1) * 0.4, oz = cz + Math.cos(j * 5 + n * 1.7) * 0.4;
      const h = 1.7 + ((j * 3 + n) % 4) * 0.4;
      const stalk = new THREE.Group(); stalk.position.set(ox, heightAt(ox, oz), oz); stalk.rotation.z = Math.sin(j + n) * 0.12; g.add(stalk);
      for (let s = 0; s < 4; s++) {
        part(stalk, Cy(0.04, 0.05, h / 4 - 0.02, 5), s % 2 ? '#8fa04a' : '#a2b45a', 0, s * h / 4 + h / 8, 0);
        part(stalk, Cy(0.055, 0.055, 0.03, 5), '#5f6d2c', 0, (s + 1) * h / 4, 0);
        part(stalk, new THREE.ConeGeometry(0.06, 0.55, 3), '#7c8f3a', 0.12, (s + 0.8) * h / 4, 0, 0, s * 2.2, -0.9).castShadow = false;
      }
    }
  });
  for (let i = 0; i < 120; i++) {
    const a = i * 2.39996, r = 8.8 + (i * 37 % 100) / 100 * 16;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x - TOWN.x, z - TOWN.z) < 11.5) continue;
    part(g, new THREE.ConeGeometry(0.09, 0.32, 3), '#93a352', x, heightAt(x, z) + 0.12, z, 0, a, 0).castShadow = false;
  }
  return g;
}

