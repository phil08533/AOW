// ---------------- armor styles: every set has its own silhouette ----------------
// Trooper body reference: torso y1.32 (0.5 wide), chest front z+0.16, back z-0.21, shoulders x±0.33 y1.52,
// upper arms x±0.37 y1.3, hands ~y1.12 forward, belt y1.04, thighs x±0.13 y0.8, knees y0.6, shins y0.42, boots y0.08, head y1.76 r0.17.
const CONE = (r, h, s) => new THREE.ConeGeometry(r, h, s || 4);
const AK = {
  recon(g, A) {
    part(g, B(0.36, 0.06, 0.32), A.trim, 0, 1.92, -0.02);
    part(g, B(0.56, 0.12, 0.34), toon('#3a4a3a', 'cloth'), 0, 1.58, -0.02, 0.1); // scarf
    part(g, B(0.08, 0.34, 0.03), toon('#3a4a3a', 'cloth'), 0.12, 1.36, -0.3, 0.25); part(g, B(0.08, 0.28, 0.03), toon('#3a4a3a', 'cloth'), 0.02, 1.38, -0.31, 0.3);
    for (const s of [-1, 1]) { part(g, B(0.12, 0.14, 0.08), A.trim, 0.2 * s, 0.82, 0.1); part(g, B(0.05, 0.05, 0.12), A.trim, 0.13 * s, 0.6, 0.11); }
    for (let i = 0; i < 6; i++) part(g, B(0.04, 0.4 + (i % 3) * 0.08, 0.02), toon(i % 2 ? '#4a5a2a' : '#5a6a3a', 'leaves'), -0.2 + i * 0.08, 1.2, -0.29, 0.2, 0, (i - 2.5) * 0.05); // ghillie strips
    chain(g, [[-0.14, 1.9, -0.06], [-0.18, 2.2, -0.1]], 0.008, '#2b2a2c', 0.006);
  },
  heavy(g, A) {
    for (const s of [-1, 1]) {
      part(g, B(0.3, 0.12, 0.34), A.trim, 0.36 * s, 1.64, 0, 0, 0, 0.3 * s); part(g, B(0.28, 0.1, 0.32), A.trim, 0.42 * s, 1.54, 0, 0, 0, 0.45 * s);
      part(g, B(0.2, 0.22, 0.22), A.trim, 0.38 * s, 1.16, 0.04); // gauntlets
      part(g, B(0.22, 0.14, 0.08), A.trim, 0.13 * s, 0.62, 0.13); part(g, B(0.22, 0.3, 0.06), A.trim, 0.13 * s, 0.36, 0.12); // knee + greave
      part(g, B(0.24, 0.12, 0.38), '#2b2a2c', 0.13 * s, 0.1, 0.05); }
    part(g, B(0.56, 0.34, 0.1), A.trim, 0, 1.38, 0.2); part(g, B(0.3, 0.06, 0.04), glow('#ffd36a'), 0, 1.3, 0.26);
    part(g, B(0.42, 0.44, 0.2), '#3a3d44', 0, 1.36, -0.32); for (const s of [-1, 1]) part(g, Cy(0.06, 0.06, 0.44, 8), glow('#ffd36a'), 0.16 * s, 1.36, -0.43);
  },
  hive(g, A) {
    for (let i = 0; i < 4; i++) E(g, i % 2 ? '#b8925a' : '#c9a46a', 0, 1.56 - i * 0.14, -0.24 - Math.sin(i) * 0.03, 0.27 - i * 0.02, 0.1, 0.12);
    for (const s of [-1, 1]) { E(g, '#b8925a', 0.35 * s, 1.58, 0, 0.17, 0.1, 0.19); chain(g, [[0.14 * s, 1.5, -0.28], [0.36 * s, 1.72, -0.4], [0.5 * s, 1.5, -0.5]], 0.02, '#3a2c1c', 0.008, true);
      part(g, CONE(0.04, 0.18), '#3a2c1c', 0.12 * s, 1.62, 0.14, 0.6, 0, 0.3 * s); E(g, '#c9a46a', 0.13 * s, 0.62, 0.12, 0.1, 0.08, 0.06); }
    for (const s of [-1, 1]) E(g, glow('#ffd23a'), 0.06 * s, 1.46, 0.17, 0.04, 0.04, 0.02);
  },
  frost(g, A) {
    part(g, new THREE.TorusGeometry(0.22, 0.07, 6, 12), toon('#e8eef2', 'fur'), 0, 1.6, 0, Math.PI / 2);
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) part(g, CONE(0.045, 0.26 - k * 0.04), glow('#9fe8ff'), (0.3 + k * 0.08) * s, 1.72, (k - 1) * 0.06, 0, 0, -0.35 * s);
    part(g, B(0.54, 0.62, 0.04), toon('#dce8f0', 'cloth'), 0, 0.82, -0.18, 0.1); for (const s of [-1, 1]) part(g, B(0.2, 0.5, 0.04), toon('#dce8f0', 'cloth'), 0.18 * s, 0.84, 0.13, -0.06);
    part(g, B(0.04, 0.5, 0.05), toon('#5d7f99'), 0, 0.84, 0.15);
  },
  spike(g, A) {
    for (const s of [-1, 1]) { part(g, B(0.26, 0.12, 0.3), A.trim, 0.36 * s, 1.62, 0, 0, 0, 0.3 * s);
      for (let k = 0; k < 3; k++) part(g, CONE(0.04, 0.22), '#b3262c', (0.3 + k * 0.06) * s, 1.74, -0.05 + k * 0.05, 0, 0, -0.4 * s);
      part(g, B(0.03, 0.06, 0.34), '#cfd3d8', 0.44 * s, 1.16, 0.2); // forearm blades
      part(g, CONE(0.04, 0.16), '#b3262c', 0.13 * s, 0.62, 0.18, Math.PI / 2); }
    for (let k = 0; k < 5; k++) part(g, CONE(0.03, 0.12 + (k === 2 ? 0.06 : 0)), '#b3262c', 0, 1.96, -0.1 + k * 0.05); // crest
    for (let k = 0; k < 3; k++) part(g, CONE(0.04, 0.16), '#b3262c', (k - 1) * 0.12, 1.48, -0.3, -Math.PI / 2);
  },
  marshal(g, A) {
    part(g, B(0.54, 0.72, 0.04), toon('#5a3a24', 'cloth'), 0, 0.86, -0.2, 0.12); for (const s of [-1, 1]) part(g, B(0.16, 0.66, 0.04), toon('#5a3a24', 'cloth'), 0.2 * s, 0.86, 0.12, -0.08);
    part(g, new THREE.CircleGeometry(0.06, 5), glow('#ffd36a'), -0.13, 1.44, 0.2); // badge star-ish
    chain(g, [[0.25, 1.56, 0.12], [0.12, 1.4, 0.18], [0.24, 1.26, 0.16]], 0.012, '#c9a43a', 0.012);
    for (const s of [-1, 1]) part(g, B(0.28, 0.06, 0.32), '#c9a43a', 0.35 * s, 1.66, 0, 0, 0, 0.25 * s);
  },
  gladiator(g, A) {
    part(g, B(0.32, 0.14, 0.34), A.trim, 0.38, 1.64, 0, 0, 0, -0.35); part(g, B(0.3, 0.12, 0.32), A.trim, 0.44, 1.54, 0, 0, 0, -0.5); part(g, B(0.28, 0.1, 0.3), A.trim, 0.47, 1.44, 0, 0, 0, -0.6);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; part(g, B(0.1, 0.28, 0.02), toon('#7a4a2a', 'cloth'), Math.sin(a) * 0.25, 0.86, Math.cos(a) * 0.17, 0, a, 0); }
    part(g, B(0.08, 0.62, 0.03), toon('#5a3a24', 'cloth'), 0, 1.32, 0.17, 0, 0, 0.7);
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) part(g, B(0.16, 0.03, 0.17), toon('#e0c890', 'cloth'), 0.37 * s, 1.18 + k * 0.06, 0);
  },
  diver(g, A) {
    E(g, toon('#c9a43a'), 0, 1.6, 0, 0.3, 0.08, 0.26); // brass collar
    const dome = part(g, new THREE.SphereGeometry(0.27, 10, 8), new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.35, depthWrite: false }), 0, 1.8, 0); dome.castShadow = false;
    for (const a of [0, Math.PI / 2, -Math.PI / 2]) part(g, Cy(0.07, 0.07, 0.03, 10), toon('#c9a43a'), Math.sin(a) * 0.26, 1.8, Math.cos(a) * 0.26, Math.PI / 2, 0, a);
    for (const s of [-1, 1]) { part(g, Cy(0.09, 0.09, 0.5, 10), toon('#ffd36a'), 0.11 * s, 1.34, -0.32); part(g, Cy(0.05, 0.09, 0.08, 10), '#5d636c', 0.11 * s, 1.63, -0.32);
      chain(g, [[0.11 * s, 1.66, -0.32], [0.2 * s, 1.78, -0.16], [0.18 * s, 1.7, 0.06]], 0.018, '#2b2a2c', 0.018);
      part(g, B(0.24, 0.14, 0.4), '#5d636c', 0.13 * s, 0.08, 0.06); }
  },
  eva(g, A) {
    for (const s of [-1, 1]) { E(g, toon('#e8eef2', 'cloth'), 0.33 * s, 1.52, 0, 0.18, 0.16, 0.18); E(g, toon('#e8eef2', 'cloth'), 0.13 * s, 0.6, 0.02, 0.13, 0.12, 0.13);
      part(g, B(0.26, 0.18, 0.42), toon('#e8eef2'), 0.13 * s, 0.1, 0.06); part(g, B(0.22, 0.04, 0.24), '#ff8a2a', 0.13 * s, 0.24, 0.02); part(g, B(0.2, 0.04, 0.23), '#ff8a2a', 0.37 * s, 1.24, 0); }
    part(g, B(0.52, 0.56, 0.26), toon('#dce4ea', 'panel'), 0, 1.36, -0.36); part(g, B(0.3, 0.08, 0.03), glow('#7fff6a'), 0, 1.5, -0.5);
    part(g, B(0.26, 0.16, 0.08), '#3a3d44', 0, 1.3, 0.21); for (let i = 0; i < 3; i++) part(g, B(0.04, 0.04, 0.02), glow(['#ff2a3a', '#ffd36a', '#4fd2ff'][i]), -0.08 + i * 0.08, 1.3, 0.25);
    part(g, Cy(0.2, 0.2, 0.05, 12), toon('#e8eef2'), 0, 1.62, 0);
  },
  tank(g, A) {
    for (const s of [-1, 1]) { part(g, B(0.36, 0.32, 0.4), A.trim, 0.42 * s, 1.56, 0); part(g, B(0.38, 0.06, 0.42), '#2b2a2c', 0.42 * s, 1.73, 0);
      part(g, B(0.24, 0.26, 0.24), A.trim, 0.15 * s, 0.4, 0.02); part(g, B(0.28, 0.16, 0.42), '#2b2a2c', 0.15 * s, 0.09, 0.05); part(g, B(0.24, 0.24, 0.24), A.trim, 0.14 * s, 0.82, 0.01); }
    part(g, B(0.62, 0.52, 0.42), A.trim, 0, 1.32, 0); for (let i = 0; i < 4; i++) part(g, B(0.4, 0.03, 0.02), '#2b2a2c', 0, 1.22 + i * 0.06, 0.22);
    part(g, Cy(0.07, 0.07, 0.48, 8), '#3a3d44', -0.4, 1.16, 0.18, Math.PI / 2); part(g, Cy(0.045, 0.045, 0.02, 8), glow('#ff8a2a'), -0.4, 1.16, 0.43, Math.PI / 2);
    part(g, B(0.46, 0.4, 0.22), '#3a3d44', 0, 1.4, -0.34); for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 0.22, 8), '#2b2a2c', 0.14 * s, 1.68, -0.36);
  },
  assassin(g, A) {
    part(g, new THREE.ConeGeometry(0.24, 0.42, 6, 1, true), toon('#1e1c22', 'cloth'), 0, 1.86, -0.04, -0.25); // hood
    part(g, B(0.4, 0.12, 0.12), toon('#2a1e2e', 'cloth'), 0, 1.66, 0.08);
    for (let i = 0; i < 2; i++) part(g, B(0.08, 0.7, 0.02), toon('#b3262c', 'cloth'), -0.08 + i * 0.14, 1.26, -0.28, 0.3, 0, (i - 0.5) * 0.2); // scarf tails
    for (const s of [-1, 1]) { part(g, B(0.02, 0.05, 0.44), '#cfd3d8', 0.43 * s, 1.14, 0.26); part(g, B(0.18, 0.2, 0.18), toon('#1e1c22', 'cloth'), 0.37 * s, 1.18, 0); }
    part(g, B(0.5, 0.06, 0.3), toon('#2a1e2e', 'cloth'), 0, 1.04, 0); for (let i = 0; i < 4; i++) part(g, CONE(0.02, 0.12), '#cfd3d8', -0.15 + i * 0.1, 1.04, 0.18, Math.PI);
  },
  mech(g, A) {
    for (const s of [-1, 1]) { part(g, B(0.04, 0.8, 0.04), '#5d636c', 0.24 * s, 0.5, -0.12); part(g, Cy(0.05, 0.05, 0.08, 8), glow('#4fd2ff'), 0.24 * s, 0.6, -0.12, 0, 0, Math.PI / 2);
      part(g, B(0.04, 0.5, 0.04), '#5d636c', 0.46 * s, 1.3, -0.08); part(g, B(0.3, 0.1, 0.34), '#5d636c', 0.38 * s, 1.68, 0); }
    part(g, B(0.3, 0.26, 0.3), '#3a3d44', -0.4, 1.86, -0.12); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) part(g, Cy(0.03, 0.03, 0.02, 6), glow('#ff8a2a'), -0.48 + c * 0.08, 1.8 + r * 0.1, 0.04, Math.PI / 2);
    part(g, B(0.4, 0.5, 0.24), '#3a3d44', 0, 1.36, -0.36); part(g, Cy(0.12, 0.12, 0.05, 12), glow('#4fd2ff'), 0, 1.38, -0.49, Math.PI / 2);
    part(g, B(0.04, 0.04, 0.9), '#5d636c', 0, 1.0, -0.26, Math.PI / 2);
  },
  robo(g, A) {
    part(g, B(0.38, 0.32, 0.36), toon('#9aa1aa', 'panel'), 0, 1.78, 0); part(g, B(0.3, 0.06, 0.04), glow('#ff2a3a'), 0, 1.8, 0.19);
    part(g, Cy(0.01, 0.01, 0.26, 4), '#2b2a2c', 0.12, 2.04, 0); E(g, glow('#ff2a3a'), 0.12, 2.18, 0, 0.03, 0.03, 0.03);
    part(g, Cy(0.09, 0.09, 0.05, 10), glow('#4fd2ff'), 0, 1.36, 0.17, Math.PI / 2); part(g, Cy(0.13, 0.13, 0.03, 10), '#5d636c', 0, 1.36, 0.16, Math.PI / 2);
    for (const s of [-1, 1]) { part(g, B(0.22, 0.22, 0.26), toon('#9aa1aa', 'panel'), 0.36 * s, 1.55, 0); part(g, B(0.2, 0.18, 0.22), '#5d636c', 0.13 * s, 0.62, 0.02); for (let k = 0; k < 3; k++) part(g, B(0.02, 0.02, 0.2), '#2b2a2c', 0.13 * s, 0.32 + k * 0.08, 0.1); }
  },
  mystic(g, A) {
    const robe = part(g, Cy(0.24, 0.42, 0.95, 8, 1, true), toon('#3a2a6a', 'cloth'), 0, 0.55, 0); robe.material.side = THREE.DoubleSide;
    part(g, Cy(0.43, 0.43, 0.05, 8), toon('#ffd36a'), 0, 0.1, 0);
    part(g, Cy(0.2, 0.26, 0.22, 8), toon('#3a2a6a', 'cloth'), 0, 1.66, -0.04); // high collar
    for (const s of [-1, 1]) { E(g, glow('#c86aff'), 0.48 * s, 1.74, -0.06, 0.06, 0.06, 0.06); part(g, B(0.2, 0.3, 0.2), toon('#3a2a6a', 'cloth'), 0.38 * s, 1.18, 0); }
    for (let i = 0; i < 3; i++) part(g, B(0.04, 0.04, 0.02), glow('#c86aff'), 0, 1.24 + i * 0.1, 0.17, 0, 0, Math.PI / 4);
  },
  drome(g, A) {
    for (const s of [-1, 1]) { part(g, B(0.32, 0.14, 0.36), '#1e1c22', 0.38 * s, 1.64, 0, 0, 0, 0.3 * s);
      chain(g, [[0.42 * s, 1.7, 0], [0.56 * s, 1.92, -0.04], [0.52 * s, 2.1, -0.12]], 0.05, '#b3262c', 0.01);
      part(g, B(0.22, 0.24, 0.24), '#1e1c22', 0.38 * s, 1.16, 0.02); part(g, CONE(0.035, 0.14), '#b3262c', 0.46 * s, 1.18, 0.02, 0, 0, -Math.PI / 2 * s);
      part(g, B(0.22, 0.32, 0.08), '#1e1c22', 0.13 * s, 0.4, 0.12); }
    part(g, B(0.5, 0.36, 0.08), '#1e1c22', 0, 1.38, 0.19); part(g, new THREE.CircleGeometry(0.08, 3), glow('#ff2a3a'), 0, 1.4, 0.235);
    for (let i = 0; i < 5; i++) part(g, B(0.11, 0.7 - Math.abs(i - 2) * 0.12, 0.02), toon('#2a1416', 'cloth'), -0.24 + i * 0.12, 1.0, -0.3, 0.15, 0, (i - 2) * 0.06);
  }
};
// new sets, unlocked by level and bought in the Wardrobe
Object.assign(ARMORS, {
  gladiator: { name: 'Gladiator Kit', lvl: 3, cost: 400, def: 0.03, trim: '#a8743a', visor: '#ffb347', note: 'From the starter-outfit sketch' },
  diver: { name: 'Deep Diver Suit', lvl: 8, cost: 1400, def: 0.07, trim: '#c9a43a', visor: '#9fe8ff', note: 'Brass dome helmet and air tanks' },
  eva: { name: 'Lunar EVA Suit', lvl: 12, cost: 2200, def: 0.1, body: '#e8eef2', trim: '#ff8a2a', visor: '#ffd36a', note: 'Moon-base spacesuit' },
  assassin: { name: 'Shadow Wraps', lvl: 18, cost: 3500, def: 0.14, body: '#2a2830', trim: '#1e1c22', visor: '#ff2a3a', note: 'Assassin set: hood, scarf, wrist blades' },
  robo: { name: 'Robo Chassis', lvl: 20, cost: 4000, def: 0.16, trim: '#5d636c', visor: '#ff2a3a', note: 'Robot City plating with a core light' },
  mystic: { name: 'Seer Robes', lvl: 24, cost: 4500, def: 0.17, trim: '#ffd36a', visor: '#c86aff', note: "Ixa's order: robes and floating orbs" },
  tank: { name: 'Tank Suit', lvl: 27, cost: 6500, def: 0.24, trim: '#5d636c', visor: '#ff8a2a', note: 'The heavy plated suit from the soldier page, arm cannon included' },
  mech: { name: 'Mech Frame', lvl: 34, cost: 9000, def: 0.27, trim: '#3a3d44', visor: '#4fd2ff', note: 'Exo-frame with a missile pod, from the battle-suit sketches' },
  drome: { name: 'Drome Warplate', lvl: 40, cost: 15000, def: 0.3, body: '#1e1c22', trim: '#2a1416', visor: '#ff2a3a', note: "The villain's own armor. Horns optional (not really)." }
});
Object.assign(ARMOR_KITS, AK);
window.__armor = { ARMORS, get makePlayerChar() { return makePlayerChar; }, get levelGroup() { return levelGroup; }, get player() { return player; } };
