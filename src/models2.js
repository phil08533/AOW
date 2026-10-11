// =================== MORE MODELS (Mezar and beyond) ===================
// Black and red ants that attack in a swarm (enemies page)
function makeAnt(col) {
  const g = new THREE.Group(), body = col || '#24201e', leg = '#151210';
  E(g, body, 0, 0.32, 0.3, 0.13, 0.12, 0.14); E(g, body, 0, 0.34, 0.05, 0.1, 0.09, 0.14); E(g, body, 0, 0.38, -0.3, 0.17, 0.15, 0.24);
  for (const s of [-1, 1]) {
    part(g, new THREE.ConeGeometry(0.025, 0.14, 4), '#8a3a2e', 0.05 * s, 0.28, 0.44, 1.8, 0, -0.4 * s);
    chain(g, [[0.06 * s, 0.44, 0.38], [0.14 * s, 0.6, 0.48], [0.18 * s, 0.62, 0.62]], 0.012, leg, 0.008);
    E(g, glow('#ff3b2a'), 0.08 * s, 0.37, 0.4, 0.025, 0.025, 0.02);
  }
  const legs = [];
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const lg = new THREE.Group(); lg.position.set(0.08 * s, 0.32, 0.12 - k * 0.12); g.add(lg); legs.push(lg);
    chain(lg, [[0, 0, 0], [0.22 * s, 0.12, (1 - k) * 0.06], [0.34 * s, -0.32, (1 - k) * 0.12]], 0.018, leg, 0.012);
  }
  g.userData.anim = (t) => { legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 16 + i * 1.7) * 0.35; }); };
  return g;
}
// Bug-bug: little round flying beetle (enemies page)
function makeBugbug() {
  const g = new THREE.Group(), body = new THREE.Group(); body.position.y = 1.4; g.add(body);
  E(body, '#3a5a2a', 0, 0, 0, 0.28, 0.24, 0.32); E(body, '#c8b84a', 0, 0.06, 0.02, 0.22, 0.12, 0.26);
  E(body, '#22301a', 0, -0.02, 0.3, 0.14, 0.12, 0.12);
  for (const s of [-1, 1]) { E(body, glow('#ffe14a'), 0.07 * s, 0.02, 0.4, 0.04, 0.04, 0.03); part(body, new THREE.ConeGeometry(0.02, 0.18, 4), '#22301a', 0.05 * s, 0.12, 0.42, -0.6); }
  const wings = [];
  for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(0.12 * s, 0.18, 0); body.add(w); wings.push(w); const m = part(w, B(0.5, 0.02, 0.3), glow('#cfe8ff'), 0.25 * s, 0, 0); m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.6; }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) seg(body, [0.12 * s, -0.12, 0.1 - k * 0.12], [0.2 * s, -0.3, 0.12 - k * 0.12], 0.012, '#22301a', 0.008);
  g.userData.anim = (t) => { body.position.y = 1.4 + Math.sin(t * 3) * 0.15; wings[0].rotation.z = Math.sin(t * 40) * 0.6; wings[1].rotation.z = -Math.sin(t * 40) * 0.6; };
  return g;
}
// Snorfal: spiked croc from the pets sheet, here gone wild in the dunes
function makeSnorfal(col) {
  const g = new THREE.Group(), skin = col || '#5f8a3a', spike = '#3a5ea8', belly = '#d8c890';
  E(g, skin, 0, 0.42, 0, 0.32, 0.22, 0.75); E(g, belly, 0, 0.32, 0.05, 0.26, 0.12, 0.62);
  E(g, skin, 0, 0.4, 0.78, 0.18, 0.13, 0.26); E(g, skin, 0, 0.32, 0.92, 0.14, 0.07, 0.26);
  for (const s of [-1, 1]) { E(g, '#ffd23a', 0.1 * s, 0.52, 0.76, 0.035, 0.035, 0.03); for (let k = 0; k < 4; k++) part(g, new THREE.ConeGeometry(0.015, 0.06, 3), C.bone, 0.1 * s, 0.27, 0.8 + k * 0.08, Math.PI); }
  for (let k = 0; k < 6; k++) part(g, new THREE.ConeGeometry(0.07, 0.26, 4), spike, 0, 0.66, -0.45 + k * 0.17);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) chain(g, [[0.24 * sx, 0.36, 0.38 * sz], [0.38 * sx, 0.2, 0.42 * sz], [0.36 * sx, 0.0, 0.46 * sz]], 0.05, skin, 0.035);
  const tail = new THREE.Group(); tail.position.set(0, 0.4, -0.7); g.add(tail);
  chain(tail, [[0, 0, 0], [0, -0.05, -0.4], [0, -0.1, -0.75], [0, -0.12, -1.05]], 0.13, skin, 0.03);
  for (let k = 0; k < 3; k++) part(tail, new THREE.ConeGeometry(0.05, 0.18, 4), spike, 0, 0.1, -0.2 - k * 0.3);
  g.userData.anim = (t) => { tail.rotation.y = Math.sin(t * 3) * 0.3; };
  return g;
}
// Gut worm: segmented cave worm with a ring of teeth (grid page)
function makeGutworm(col) {
  const g = new THREE.Group(), skin = col || '#b86a6a', band = '#7a3a3a', segs = [];
  for (let k = 0; k < 9; k++) {
    const s = new THREE.Group(); g.add(segs[k] = s);
    const r = 0.42 - k * 0.025; E(s, k % 2 ? skin : band, 0, 0, 0, r, r, 0.3);
    for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + k; part(s, new THREE.ConeGeometry(0.05, 0.16, 4), '#e9e0c8', Math.cos(a) * r, Math.sin(a) * r, 0, 0, 0, a - Math.PI / 2); }
  }
  const mouth = segs[0];
  for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; part(mouth, new THREE.ConeGeometry(0.05, 0.22, 4), C.bone, Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0.3, Math.PI / 2, 0, 0); }
  E(mouth, '#2a0e0e', 0, 0, 0.26, 0.26, 0.26, 0.06);
  g.userData.anim = (t) => {
    for (let k = 0; k < segs.length; k++) { const ph = t * 2.2 - k * 0.55; segs[k].position.set(Math.sin(ph) * 0.35 * (k / 8), 0.3 + (segs.length - 1 - k) * 0.4 + Math.sin(ph * 0.7) * 0.08, Math.cos(ph) * 0.12 * (1 - k / 8)); }
    segs.forEach(s => s.rotation.set(0, 0, 0));
    mouth.position.z = 0.3;
  };
  g.userData.anim(0);
  return g;
}
// Bug City tower: stacked hive tiers with doorways (Mezar page)
function makeHive(s, col) {
  const g = new THREE.Group(), a = col || '#d8a85a', b = '#c4924a', dk = '#3a2c1c';
  for (let k = 0; k < 4; k++) {
    const r = (3.2 - k * 0.55) * s, y = (1.1 + k * 1.9) * s;
    E(g, k % 2 ? a : b, 0, y, 0, r, 1.0 * s, r);
    for (let d = 0; d < 6; d++) { const ang = d / 6 * Math.PI * 2 + k * 0.5; const dm = part(g, B(0.5 * s, 0.75 * s, 0.1), dk, Math.cos(ang) * r * 0.96, y - 0.1 * s, Math.sin(ang) * r * 0.96, 0, -ang + Math.PI / 2); dm.scale.z = 2; }
  }
  E(g, a, 0, 8.6 * s, 0, 0.9 * s, 0.7 * s, 0.9 * s);
  part(g, new THREE.OctahedronGeometry(0.4 * s, 0), glow('#ffd23a'), 0, 9.5 * s, 0);
  return g;
}
function makeWreck() {
  const g = new THREE.Group(), hull = '#8a8f96', dk = '#3a3d44';
  part(g, B(2.6, 1.4, 6), hull, 0, 0.5, 0, 0.12, 0.3, 0.25);
  part(g, B(2.2, 0.9, 1.8), dk, 0.4, 1.1, 2.4, 0.4, 0.3, 0.2);
  part(g, B(5, 0.18, 1.6), hull, -0.4, 0.9, -0.6, 0.1, 0.3, -0.45);
  for (let i = 0; i < 6; i++) part(g, new THREE.DodecahedronGeometry(rand(0.2, 0.5), 0), toon('#6a5a48', 'stone'), rand(-3, 3), 0.1, rand(-4, 4));
  const smoke = new THREE.Group(); g.add(smoke);
  for (let i = 0; i < 5; i++) { const m = part(smoke, new THREE.IcosahedronGeometry(0.4 + i * 0.12, 0), glow('#5a5a5a'), 0.3, 1.6 + i * 0.7, 0.4); m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.5 - i * 0.08; }
  g.userData.smoke = smoke;
  return g;
}
function makeBeacon() {
  const g = new THREE.Group();
  part(g, Cy(0.18, 0.3, 0.5, 6), '#5d636c', 0, 0.25, 0); part(g, Cy(0.04, 0.04, 1.4, 4), C.dark, 0, 1.1, 0);
  part(g, new THREE.SphereGeometry(0.14, 8, 6), glow('#ff3b2a'), 0, 1.85, 0);
  return g;
}

