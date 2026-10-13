// =================== ZARLICH (violet storm world) and VECTOR (the dark world) ===================
// creatures from the colored creature sheet
function makeTubeShark(col) {
  const g = new THREE.Group(), b = new THREE.Group(), c = col || '#5a7a9a', bel = '#e8e4dc';
  b.position.y = 1.8; g.add(b);

  const segs = [];
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Group();
    s.position.z = 0.9 - i * 0.55;
    b.add(s); segs.push(s);
    const r = 0.36 - Math.abs(i - 1) * 0.06;
    part(s, Cy(r, r, 0.58, 10), c, 0, 0, 0, Math.PI / 2);
    part(s, Cy(r * 0.7, r * 0.7, 0.6, 10), bel, 0, -r * 0.35, 0, Math.PI / 2);
  }

  // Original mouth and teeth preserved
  part(segs[0], new THREE.TorusGeometry(0.3, 0.07, 5, 12), '#2b2a2c', 0, 0, 0.3);
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2;
    part(segs[0], new THREE.ConeGeometry(0.03, 0.12, 3), '#efe7d6',
      Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0.3, Math.PI / 2);
  }
  part(segs[0], Cy(0.22, 0.22, 0.02, 10), glow('#ff2a3a'), 0, 0, 0.29, Math.PI / 2);

  // More unsettling eyes: dark sockets, amber irises, tiny black pupils
  for (const s of [-1, 1]) {
    E(segs[0], '#100d12', 0.22 * s, 0.16, 0.1, 0.085, 0.075, 0.045);
    E(segs[0], '#b9a34a', 0.225 * s, 0.16, 0.14, 0.052, 0.058, 0.035);
    E(segs[0], '#080609', 0.23 * s, 0.16, 0.17, 0.018, 0.044, 0.018);
    E(segs[0], '#ff3a32', 0.24 * s, 0.18, 0.185, 0.009, 0.012, 0.008);

    // Original side fins
    part(segs[1], B(0.7, 0.04, 0.35), c,
      0.45 * s, -0.05, 0, 0, 0, -0.3 * s);

    // Additional rear side fins
    part(segs[2], B(0.42, 0.035, 0.24), c,
      0.29 * s, -0.13, 0.02, 0, 0, -0.38 * s);

    // Small lower gill fins
    part(segs[1], B(0.25, 0.035, 0.16), '#394b5c',
      0.2 * s, -0.3, 0.12, 0, 0, -0.25 * s);
  }

  // Original top fin
  part(segs[1], B(0.04, 0.5, 0.4), c, 0, 0.4, 0, -0.3);

  // Extra dorsal fin toward the rear
  part(segs[2], B(0.035, 0.32, 0.24), c, 0, 0.27, 0, -0.25);

  // Original tail fins
  part(segs[4], B(0.04, 0.7, 0.4), c, 0, 0.15, -0.3, 0.4);
  part(segs[4], B(0.04, 0.5, 0.35), c, 0, -0.25, -0.3, -0.4);

  // Extra lower rear fin
  part(segs[3], B(0.035, 0.28, 0.2), c, 0, -0.24, 0, 0.3);

  g.userData.anim = t => {
    b.position.y = 1.8 + Math.sin(t * 1.1) * 0.3;
    segs.forEach((s, i) => {
      s.rotation.y = Math.sin(t * 3 - i * 0.7) * 0.18;
    });
  };

  return g;
}
function makeFlaglem(col) {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Palettes (Sailback Amphibian / Crested Beast)
  const c = col || '#c86aff';
  const cDark = '#8a3fa8';
  const dk = '#4a2a6a';
  const bellyCol = '#e5aeff';
  const flagWarm = '#ff6a3a';
  const flagGold = '#ffd23a';
  const eyeColor = '#16141a';
  const eyeHighlight = '#ffffff';

  // 1. Splayed Grounded Crawler Legs (Flush at y = 0.0)
  const legs = [];
  const legPairs = [
    { z:  0.30, isFront: true },
    { z: -0.30, isFront: false }
  ];

  for (const s of [-1, 1]) {
    legPairs.forEach(pair => {
      const legGroup = new THREE.Group();
      legGroup.position.set(0.22 * s, 0.40, pair.z);
      root.add(legGroup);

      // Thigh -> Knee -> Tarsus
      chain(legGroup, [
        [0, 0, 0],
        [0.14 * s, -0.15, 0.05],
        [0.18 * s, -0.39, 0.08]
      ], 0.055, dk, 0.03, true);

      // Webbed foot pad touching ground
      part(legGroup, B(0.08, 0.02, 0.10), cDark, 0.18 * s, -0.395, 0.09);

      // Claws
      for (let k = -1; k <= 1; k++) {
        part(
          legGroup,
          new THREE.ConeGeometry(0.009, 0.035, 3),
          dk,
          (0.18 + k * 0.025) * s,
          -0.395,
          0.13,
          Math.PI / 2.2,
          0,
          k * 0.2 * s
        );
      }

      legs.push({ legGroup, s, isFront: pair.isFront });
    });
  }

  // 2. Torso, Soft Ventral Belly & Muscular Tail
  // Arched body hull
  E(root, c, 0, 0.50, 0, 0.30, 0.24, 0.55);
  // Ventral pale belly (stepped down to prevent z-fighting with the main hull)
  E(root, bellyCol, 0, 0.42, 0.02, 0.24, 0.14, 0.48);

  // Counterbalance tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.50, -0.48);
  root.add(tail);

  chain(tail, [
    [0, 0, 0],
    [0, -0.06, -0.40],
    [0, 0.04, -0.76]
  ], 0.09, c, 0.018, true);

  // 3. Head, Defined Eyes & Snout
  const head = new THREE.Group();
  head.position.set(0, 0.62, 0.58);
  root.add(head);

  // Cranium and jaw
  E(head, c, 0, 0, 0, 0.20, 0.17, 0.24);
  E(head, bellyCol, 0, -0.07, 0.04, 0.15, 0.08, 0.18); // Chin pad

  // Crisp eyes (recessed brow + beady pupil + glint, no blinding light flare)
  for (const s of [-1, 1]) {
    part(head, B(0.04, 0.015, 0.04), cDark, 0.10 * s, 0.10, 0.12, 0, 0, -0.2 * s);
    E(head, flagGold, 0.10 * s, 0.08, 0.13, 0.038, 0.038, 0.026);
    E(head, eyeColor, 0.105 * s, 0.08, 0.148, 0.018, 0.018, 0.012);
    E(head, eyeHighlight, 0.11 * s, 0.09, 0.155, 0.006, 0.006, 0.006);
  }

  // 4. Articulated Dorsal Flag / Fin Sails
  const sails = [];
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group();
    // Offset along dorsal ridge: i = 0 near neck, i = 3 near hip
    p.position.set(0, 0.72, 0.30 - i * 0.24);
    root.add(p);
    sails.push(p);

    const mastH = 1.15 - Math.abs(i - 1.5) * 0.22;
    const flagH = mastH * 0.58;

    // Spine mast quill
    part(p, Cy(0.016, 0.016, mastH, 4), dk, 0, mastH * 0.5, 0);

    // Double-sided fabric membrane fin (offset along -Z from the mast center to prevent co-planar overlap)
    const mat = (typeof toon === 'function')
      ? toon(i % 2 === 0 ? flagGold : flagWarm, 'cloth')
      : new THREE.MeshLambertMaterial({
          color: i % 2 === 0 ? flagGold : flagWarm,
          side: THREE.DoubleSide
        });

    part(p, B(0.018, flagH, 0.26), mat, 0, mastH * 0.65, -0.14);
  }

  // 5. Quad Gait & Rippling Dorsal Fin Wave Animation Loop
  g.userData.anim = (t) => {
    // Low crawler suspension sway
    root.position.y = Math.sin(t * 3.4) * 0.008;

    // Head searching motion
    head.rotation.y = Math.sin(t * 1.6) * 0.12;
    head.rotation.x = Math.sin(t * 2.8) * 0.03;

    // Sinusoidal tail whip
    tail.rotation.y = Math.sin(t * 3.4) * 0.24;

    // Rippling fin flutter down the spine
    sails.forEach((p, i) => {
      p.rotation.y = Math.sin(t * 4.5 - i * 0.75) * 0.32;
    });

    // Walking leg articulation
    legs.forEach(l => {
      const phase = (l.s > 0 ? 0 : Math.PI) + (l.isFront ? 0 : Math.PI);
      l.legGroup.rotation.y = Math.sin(t * 3.4 + phase) * 0.16 * l.s;
    });
  };

  g.userData.anim(0);
  return g;
}
function makeEyeWatcher(big) {
  const g = new THREE.Group();
  const b = new THREE.Group();
  const s = big ? 3 : 1;
  b.position.y = 1.7 * s;
  g.add(b);

  // Organic, bruised flesh palette (not pitch black)
  const fleshDk   = '#2a1a28';
  const fleshMid  = '#3d2a38';
  const fleshLight= '#4f3a48';
  const scleraCol = '#efe6d4';
  const veinCol   = '#5c2a38';
  const tentacleCol = '#2e1c2c';
  const tentacleTip = '#3a2436';
  const pupilCol  = '#0a0608';
  const irisGlow  = glow('#ff2a3a');
  const miniEyeGlow = glow('#ff5a20');

  // 1. Central Eyeball – layered flesh + sclera
  E(b, fleshDk, 0, 0, 0, 0.56 * s, 0.56 * s, 0.56 * s);
  // Softer orbital flesh
  E(b, fleshMid, 0, 0.06 * s, 0.16 * s, 0.49 * s, 0.44 * s, 0.40 * s);
  E(b, fleshLight, 0, -0.04 * s, 0.10 * s, 0.42 * s, 0.38 * s, 0.36 * s);
  // Sclera
  E(b, scleraCol, 0, 0, 0.34 * s, 0.38 * s, 0.38 * s, 0.25 * s);
  // Subtle vein streaks
  for (const a of [0.5, 1.4, 2.3, 3.7, 4.9]) {
    const vx = Math.cos(a) * 0.17 * s;
    const vy = Math.sin(a) * 0.17 * s;
    E(b, veinCol, vx, vy, 0.41 * s, 0.035 * s, 0.08 * s, 0.025 * s, 0, 0, a);
  }
  // Iris + pupil
  E(b, irisGlow, 0, 0, 0.52 * s, 0.18 * s, 0.18 * s, 0.10 * s);
  E(b, pupilCol, 0, 0, 0.58 * s, 0.08 * s, 0.08 * s, 0.05 * s);
  // Secondary slit
  E(b, pupilCol, 0, 0.025 * s, 0.59 * s, 0.022 * s, 0.045 * s, 0.018 * s);

  // 2. Dual-Ring Tentacle Skirt with slight color variation
  const tent = [];
  const ringCounts = big ? [10, 6] : [7, 5];
  ringCounts.forEach((count, rIdx) => {
    const ringRadius = (rIdx === 0 ? 0.38 : 0.22) * s;
    const yAnchor = (rIdx === 0 ? -0.28 : -0.36) * s;
    const baseThickness = (rIdx === 0 ? 0.075 : 0.06) * s;
    const tipThickness = (rIdx === 0 ? 0.02 : 0.015) * s;
    const reachMult = rIdx === 0 ? 1.0 : 0.85;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (rIdx * 0.3);
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const t = new THREE.Group();
      t.position.set(cosA * ringRadius, yAnchor, sinA * ringRadius - 0.08 * s);
      b.add(t);
      tent.push({ group: t, angle: a, idx: tent.length });
      const lenJitter = 0.92 + (i % 3) * 0.06;
      // Alternate base/tip tone slightly for organic variation
      const col = (i % 2 === 0) ? tentacleCol : tentacleTip;
      chain(
        t,
        [
          [0, 0, 0],
          [cosA * 0.18 * s, -0.55 * reachMult * s * lenJitter, sinA * 0.18 * s],
          [cosA * 0.32 * s, -1.15 * reachMult * s * lenJitter, sinA * 0.32 * s],
          [cosA * 0.42 * s, -1.65 * reachMult * s * lenJitter, sinA * 0.42 * s]
        ],
        baseThickness,
        col,
        tipThickness,
        true
      );
    }
  });

  // 3. Peripheral ocelli (big only)
  if (big) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      E(
        b,
        miniEyeGlow,
        Math.cos(a) * 0.64 * s,
        Math.sin(a) * 0.64 * s,
        0.12 * s,
        0.07 * s,
        0.07 * s,
        0.05 * s
      );
    }
  }

  // 4. Animation
  g.userData.anim = (t) => {
    b.position.y = 1.7 * s + Math.sin(t * 0.9) * 0.22 * s;
    b.rotation.y = Math.sin(t * 0.35) * 0.08;
    b.rotation.z = Math.sin(t * 0.55) * 0.04;

    tent.forEach(({ group, idx }) => {
      const phase = t * 2.4 + idx * 0.62;
      group.rotation.x = Math.sin(phase) * 0.38;
      group.rotation.z = Math.cos(phase * 0.9) * 0.34;
      group.rotation.y = Math.sin(phase * 0.7) * 0.12;
    });
  };
  g.userData.anim(0);
  return g;
}
function makeShade() { const g = makeWraith(); g.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) o.material = glow('#c86aff'); }); return g; }
function makeAlienFlora(g, x, z, kind, i) {
  const t = new THREE.Group();
  if (kind === 0) { const h = 3 + (i % 4); part(t, Cy(0.15, 0.3, h, 6), toon('#4a2a6a', 'wood'), 0, h / 2, 0); for (let k = 0; k < 3; k++) E(t, glow(k % 2 ? '#c86aff' : '#ff6aa8'), Math.cos(k * 2.1) * 0.6, h + k * 0.25, Math.sin(k * 2.1) * 0.6, 0.35, 0.35, 0.35); }
  else if (kind === 1) { for (let k = 0; k < 5; k++) part(t, new THREE.ConeGeometry(0.25, 2.2 + k * 0.3, 5), toon('#3a5a6a', 'leaves'), Math.cos(k * 1.3) * 0.6, 1.1 + k * 0.15, Math.sin(k * 1.3) * 0.6, Math.cos(k) * 0.2, 0, Math.sin(k) * 0.2); }
  else { E(t, toon('#6a3a8a', 'leaves'), 0, 2.8, 0, 2.2, 0.5, 2.2); part(t, Cy(0.25, 0.4, 2.8, 7), toon('#d8c8e8', 'wood'), 0, 1.4, 0); for (let k = 0; k < 6; k++) E(t, glow('#9fe8ff'), Math.cos(k) * 1.8, 2.6, Math.sin(k) * 1.8, 0.08, 0.18, 0.08); }
  at(t, x, z, i); solid(x, z, kind === 2 ? 0.5 : 0.4);
}
// ---------------- Zarlich ----------------
LEVELS.zarlich = {
  id: 'zarlich', name: 'Zarlich', tag: 'Violet storms, unknown life', lvls: 'Lv 40–46', size: 300, center: [0, 20], radius: 118, water: -1.2, weather: 'storm', hourOffset: 5,
  tint: { hor: '#c86aff', mid: '#5a2a8a', top: '#1a0a2a', k: 0.45 },
  terrain: { a1: 2.2, f1: 0.04, a2: 1.0, f2: 0.1, a3: 0.4, f3: 0.2, base: 1.4, min: -3, edge: 26, step: 2 },
  palette: { grass: '#5a3a7a', patch: '#7a4a9a', dirt: '#3a2a4a', sand: '#9a7ab0', wet: '#2a1a3a', rockA: '#6a5a7a', rockB: '#4a3a5a' },
  zones: [
    { id: 'rest', name: 'Violet Rest', lvl: 'Safe · research outpost', x: 0, z: -16, r: 16, fr: 17, col: '#9a7ab0', safe: true, h: 0.6 },
    { id: 'plains', name: 'Storm Plains', lvl: 'Lv 40–42', x: -46, z: 10, r: 22, col: '#7a4a9a', h: 0 },
    { id: 'rex', name: 'Rex Valley', lvl: 'Lv 42–44', x: 44, z: 14, r: 22, col: '#4a6a3a', h: -1 },
    { id: 'lake', name: 'Glowing Lake', lvl: 'Lv 42–45', x: -30, z: 62, r: 18, col: '#3a5a8a', h: -0.5 },
    { id: 'spires', name: 'Shark Spires', lvl: 'Lv 43–46 · boss', x: 34, z: 70, r: 22, fr: 16, col: '#3a3a5a', h: 1 }
  ],
  paths: [[[0, -2], [-46, 10]], [[0, -2], [44, 14]], [[0, -2], [-30, 62]], [[0, -2], [34, 70]]], river: [], pools: [[-30, 62, 11]], lava: [],
  safes: [{ x: 0, z: -16, r: 15 }], spawn: { x: 0, z: -22, yaw: Math.PI }, pad: { x: -8, z: -26 }, menu: { x: 0, z: 10, r: 50, h: 16 }, npcBase: [0, -16],
  npcs: [
    { id: 'drfenn', name: 'Dr. Fenn', role: 'Xeno-biologist', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#4a2a6a', '#e0b892', '#c86aff', '#9fe8ff'), x: 0, z: 6, face: Math.PI, idle: ["Everything here is new to science. Everything here also bites. Science is hard.", "The tube sharks swim through the AIR. I've written four papers about it. Nobody believes me."] },
    { id: 'zix', name: 'Zix', role: 'Exotic pets', rig: 'civ', make: () => makeCivilian('#c86aff', '#2c2a28', '#9fe8ff', '#5a3a7a', '#ffd23a'), x: 7, z: -12, face: -1.2, petshop: true, idle: ["Want a shark that flies? Everyone wants a shark that flies."] },
    { id: 'ozz', name: 'Ozz', role: 'Trader · heals', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#9a7ab0' }), x: -7, z: -12, face: 1.2, shop: 'store', heal: true, idle: ["ALIEN SAMPLES. I BUY. I DO NOT ASK WHERE THEY CAME FROM. THEY CAME FROM ALIENS."] }
  ],
  spawns: [
    { zone: 'plains', type: 'flaglem', n: 7, lv: [40, 42] }, { zone: 'plains', type: 'noptilew', n: 4, lv: [40, 41] },
    { zone: 'rex', type: 'rex', n: 5, lv: [42, 44] },
    { zone: 'lake', type: 'gosalemw', n: 4, lv: [42, 45] }, { zone: 'lake', type: 'devilray', n: 4, lv: [43, 45] },
    { zone: 'spires', type: 'tubeshark', n: 6, lv: [43, 46] }, { zone: 'spires', type: 'stormmother', n: 1, lv: [46, 46], at: [0, 4] }
  ],
  build() {
    // research outpost: glass pods and a lab mast
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.78, x = Math.cos(a) * 10, z = -16 + Math.sin(a) * 10; const d = makeDome(3.2, '#e8d8ff'); at(d, x, z); solid(x, z, 3); }
    const mast = new THREE.Group(); part(mast, Cy(0.2, 0.35, 12, 6), '#9aa1aa', 0, 6, 0); part(mast, new THREE.SphereGeometry(0.5, 8, 6), glow('#9fe8ff'), 0, 12.4, 0); at(mast, 0, -16); solid(0, -16, 0.5);
    dropshipPad(-8, -26, 0, 'Return to your ship');
    // alien flora everywhere
    for (let i = 0; i < 90; i++) { const a = i * 2.39996, d = 22 + Math.sqrt(i / 90) * 90, x = Math.cos(a) * d, z = 20 + Math.sin(a) * d; if (Math.hypot(x, z + 16) < 20) continue; makeAlienFlora(props, x, z, i % 3, i); }
    // shark spires: tall rock needles with glowing tips
    for (let i = 0; i < 10; i++) { const a = i * 0.63, x = Z.spires.x + Math.cos(a) * 15, z = Z.spires.z + Math.sin(a) * 15, h = 10 + (i % 4) * 4; part(props, new THREE.ConeGeometry(1.4, h, 6), toon('#3a3a5a', 'stone'), x, groundH(x, z) + h / 2, z); part(props, new THREE.OctahedronGeometry(0.6, 0), glow('#c86aff'), x, groundH(x, z) + h + 0.4, z); solid(x, z, 1.2); }
    // glowing lake lights
    for (let i = 0; i < 14; i++) { const a = i * 0.45, x = Z.lake.x + Math.cos(a) * 8, z = Z.lake.z + Math.sin(a) * 8; part(props, new THREE.SphereGeometry(0.25, 6, 4), glow('#4fffe0'), x, -0.9, z); }
    tufts(0);
  }
};
// ---------------- Vector ----------------
LEVELS.vector = {
  id: 'vector', name: 'Vector', tag: 'The dark world', lvls: 'Lv 46–50', size: 280, center: [0, 20], radius: 110, water: -99, sky: 'space', weather: 'none', hourOffset: 12,
  terrain: { a1: 2.6, f1: 0.05, a2: 1.2, f2: 0.12, a3: 0.5, f3: 0.25, base: 1.2, min: -4, edge: 24, step: 2.2 },
  palette: { grass: '#2a1e30', patch: '#3a2440', dirt: '#1a141e', sand: '#4a3a50', wet: '#140e18', rockA: '#2a2430', rockB: '#1a1620' },
  zones: [
    { id: 'lantern', name: 'Lantern Camp', lvl: 'Safe · the last light', x: 0, z: -14, r: 13, fr: 14, col: '#5a4a3a', safe: true, h: 0.4 },
    { id: 'whisper', name: 'Whisper Woods', lvl: 'Lv 46–48', x: -42, z: 22, r: 22, col: '#2a1e30', h: 0 },
    { id: 'eyes', name: 'Field of Eyes', lvl: 'Lv 47–49', x: 42, z: 22, r: 22, col: '#3a1a24', h: -0.5 },
    { id: 'maw', name: 'The Maw', lvl: 'Lv 50 · final boss', x: 0, z: 72, r: 20, fr: 14, col: '#140e18', h: -3 }
  ],
  paths: [[[0, -2], [-42, 22]], [[0, -2], [42, 22]], [[0, -2], [0, 72]]], river: [], pools: [], lava: [[0, 72, 5, 0.4]],
  safes: [{ x: 0, z: -14, r: 12 }], spawn: { x: 0, z: -20, yaw: Math.PI }, pad: { x: -7, z: -22 }, menu: { x: 0, z: 10, r: 46, h: 14 }, npcBase: [0, -14],
  npcs: [
    { id: 'lumen', name: 'Lumen', role: 'Keeper of the last light', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#3a2a4a', '#f4e8d8', '#ffffff', '#ffd36a'), x: 0, z: 6, face: Math.PI, heal: true, idle: ["Stay in the light. It's not a metaphor. Please stay in the actual light.", "Drome was a servant. Everything here serves the one in the Maw."] },
    { id: 'hollow', name: 'Hollow', role: 'Trader of strange things', rig: 'civ', make: () => makeCivilian('#1e1c22', '#1e1c22', '#9aa1aa', '#1e1c22', '#c86aff'), x: 7, z: -8, face: -1.2, shop: 'guns', guns: ['g90', 'g100'], melee: ['twinmaster', 'scythe'], idle: ["I sell to the living. Business is slow."] }
  ],
  spawns: [
    { zone: 'whisper', type: 'shade', n: 8, lv: [46, 48] },
    { zone: 'eyes', type: 'eyewatcher', n: 7, lv: [47, 49] }, { zone: 'eyes', type: 'shade', n: 2, lv: [47, 48] },
    { zone: 'maw', type: 'watcher', n: 1, lv: [50, 50], at: [0, 2] }
  ],
  build() {
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = Math.cos(a) * 10, z = -14 + Math.sin(a) * 10, l = new THREE.Group(); part(l, Cy(0.08, 0.1, 3, 6), '#3a3430', 0, 1.5, 0); part(l, B(0.4, 0.5, 0.4), glow('#ffd36a'), 0, 3.2, 0); at(l, x, z); solid(x, z, 0.3); }
    const fire = new THREE.PointLight(0xffb347, 1.4, 30); fire.position.set(0, 2, -14); levelGroup.add(fire); part(props, new THREE.ConeGeometry(0.7, 1.4, 6), glow('#ff9a3c'), 0, groundH(0, -14) + 0.7, -14);
    dropshipPad(-7, -22, 0, 'Return to your ship');
    for (let i = 0; i < 40; i++) { const a = i * 2.39996, d = 4 + Math.sqrt(i / 40) * 20, x = Z.whisper.x + Math.cos(a) * d, z = Z.whisper.z + Math.sin(a) * d, h = 6 + (i % 5) * 2, t = new THREE.Group(); part(t, Cy(0.15, 0.4, h, 5), '#0e0a12', 0, h / 2, 0, Math.sin(i) * 0.1, 0, Math.cos(i) * 0.1); for (let k = 0; k < 3; k++) part(t, Cy(0.05, 0.08, 2, 4), '#0e0a12', 0, h * 0.6 + k * 0.8, 0, 0, k * 2.1, 0.9); at(t, x, z, i); solid(x, z, 0.4); }
    for (let i = 0; i < 24; i++) { const a = i * 2.39996, d = 3 + Math.sqrt(i / 24) * 18, x = Z.eyes.x + Math.cos(a) * d, z = Z.eyes.z + Math.sin(a) * d; part(props, new THREE.SphereGeometry(0.22, 6, 4), glow('#ff2a3a'), x, groundH(x, z) + 0.15, z); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, x = Z.maw.x + Math.cos(a) * 17, z = Z.maw.z + Math.sin(a) * 17; part(props, new THREE.ConeGeometry(1.2, 9, 5), '#1a141e', x, groundH(x, z) + 4, z, 0, 0, Math.sin(a) * 0.3); solid(x, z, 1); }
    const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 16, 10), glow('#3a0a14')); sky.position.set(60, 120, 240); levelGroup.add(sky); const pup = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 8), glow('#000000')); pup.position.set(54, 118, 206); levelGroup.add(pup);
    tufts(0);
  }
};
Object.assign(ENEMY, {
  flaglem: { name: 'Flaglem-ti', make: () => makeFlaglem(), scale: 1.4, hp: 260, speed: 3.6, r: 0.6, hy: 0.6, xp: 160, cr: [30, 44], melee: { dmg: 36, rate: 0.9, reach: 2.0 }, drops: [['zsample', 0.5], ['crystal', 0.3]] },
  noptilew: { name: 'Wild Noptile', make: makeNoptile, scale: 2.2, hp: 220, speed: 4.2, r: 0.5, hy: 0.4, xp: 140, cr: [26, 40], melee: { dmg: 30, rate: 0.7, reach: 1.8 }, drops: [['zsample', 0.4]] },
  rex: { name: 'Zarlich T-rex', make: makeTrex, scale: 2.4, hp: 520, speed: 4.4, r: 1.0, hy: 1.2, xp: 220, cr: [40, 60], melee: { dmg: 60, rate: 1.2, reach: 2.8 }, drops: [['rextooth', 0.6], ['zsample', 0.3]] },
  gosalemw: { name: 'Gosa-lem', make: makeGosalem, scale: 1.6, hp: 340, speed: 2.2, r: 0.6, hy: 0.8, xp: 180, cr: [34, 50], lob: { dmg: 40, rate: 1.8, speed: 13, range: 22, keep: 9, col: '#4fa8ff' }, drops: [['zsample', 0.5]] },
  devilray: { name: 'Devil Light Ray', make: makeDevilRay, fly: true, scale: 1.3, hp: 240, speed: 4.0, r: 0.7, hy: 1.6, xp: 170, cr: [30, 46], ranged: { dmg: 32, rate: 1.1, speed: 20, col: '#ff9a3c', range: 22, keep: 10 }, drops: [['zsample', 0.4]] },
  tubeshark: { name: 'Tube Shark', make: () => makeTubeShark(), fly: true, scale: 1.3, hp: 360, speed: 5.2, r: 0.7, hy: 1.8, xp: 220, cr: [40, 60], melee: { dmg: 52, rate: 0.9, reach: 2.4 }, drops: [['sharktooth', 0.6]] },
  stormmother: { name: 'The Storm Mother', make: () => makeTubeShark('#4a2a7a'), fly: true, scale: 4, hp: 8000, speed: 3.4, r: 1.6, hy: 1.8, xp: 24000, cr: [3000, 4200], boss: true, melee: { dmg: 90, rate: 1.4, reach: 4 }, ranged: { dmg: 50, rate: 1.4, speed: 20, col: '#c86aff', range: 30, keep: 12 }, drops: [['stormheart', 1]] },
  shade: { name: 'Vector Shade', make: makeShade, fly: true, hp: 420, speed: 3.6, r: 0.5, hy: 1.3, xp: 260, cr: [44, 64], ranged: { dmg: 44, rate: 1.2, speed: 20, col: '#c86aff', range: 22, keep: 9 }, melee: { dmg: 50, rate: 1.0, reach: 2.2 }, drops: [['voidshard', 0.5]] },
  eyewatcher: { name: 'Watching Eye', make: () => makeEyeWatcher(false), fly: true, hp: 380, speed: 1.6, r: 0.6, hy: 1.7, xp: 280, cr: [48, 70], ranged: { dmg: 56, rate: 1.6, speed: 26, col: '#ff2a3a', range: 30, keep: 16 }, drops: [['voidshard', 0.6]] },
  watcher: { name: 'The Watcher in the Maw', make: () => makeEyeWatcher(true), fly: true, scale: 1.6, hp: 12000, speed: 1.2, r: 2.4, hy: 1.7, xp: 60000, cr: [8000, 10000], boss: true, ranged: { dmg: 70, rate: 0.9, speed: 26, col: '#ff2a3a', range: 34, keep: 12 }, lob: { dmg: 80, rate: 2.4, speed: 16, range: 34, keep: 10, col: '#c86aff' }, drops: [['watchereye', 1]] }
});
Object.assign(ITEMS, {
  zsample: { name: 'Zarlich Sample', v: 140, col: '#c86aff' }, rextooth: { name: 'T-rex Tooth', v: 220, col: '#efe7d6' }, sharktooth: { name: 'Tube Shark Tooth', v: 260, col: '#efe7d6' },
  stormheart: { name: 'Heart of the Storm', v: 0, col: '#c86aff', quest: true }, voidshard: { name: 'Void Shard', v: 320, col: '#c86aff' }, watchereye: { name: "The Watcher's Eye", v: 0, col: '#ff2a3a', quest: true }
});
Object.assign(PETS, {
  tubeshark: { name: 'Tube Shark', make: () => makeTubeShark(), rig: null, scale: 0.6, price: 14000, dmg: 40, fly: true },
  flaglem: { name: 'Flaglem-ti', make: () => makeFlaglem(), rig: null, scale: 0.8, price: 11000, dmg: 34 }
});
PLANET_LOOK.zarlich = PLANET_LOOK.zarlich || { seed: 81, ramp: [[0, '#2a1a3a'], [0.45, '#5a3a7a'], [0.62, '#9a7ab0'], [0.8, '#e8d8ff']], grid: null };
PLANET_LOOK.vector = PLANET_LOOK.vector || { seed: 91, ramp: [[0, '#0a0610'], [0.5, '#2a1e30'], [0.7, '#3a1a24'], [0.9, '#ff2a3a']], grid: null };
for (const id of ['zarlich', 'vector']) if (!PLANET_ORDER.includes(id)) PLANET_ORDER.push(id);
{ const _po = planetOpen; planetOpen = function (id) {
  if (id === 'zarlich') return shipUnlocked() && (qDone('k4') || !!qState('x1') || S.lvl >= 40);
  if (id === 'vector') return shipUnlocked() && (qDone('x3') || !!qState('w1') || S.lvl >= 46);
  return _po(id); }; }
defQuest('x1', { ch: 'Chapter 7 · Zarlich', title: 'Field Work', giver: 'drfenn', turnIn: 'drfenn', req: [],
  intro: ["You're the one who beat Drome? Great, you can carry samples.", "Bring me eight Zarlich Samples from anything out there. Flaglem-ti, Noptiles, the Gosa-lem in the lake. I'm not picky. I'm desperate."],
  obj: [{ kind: 'item', t: 'zsample', n: 8, text: 'Collect Zarlich Samples from the wildlife' }],
  outro: ["Incredible! This one's still moving. That's fine. That's probably fine."], reward: { cr: 9000, xp: 40000, take: { zsample: 8 } } });
defQuest('x2', { ch: 'Chapter 7 · Zarlich', title: 'Big Teeth', giver: 'drfenn', turnIn: 'drfenn', req: ['x1'],
  intro: ["The T-rexes of Rex Valley are... not native. Someone put them here. Bring me three teeth so I can find out who."],
  obj: [{ kind: 'item', t: 'rextooth', n: 3, text: 'Take T-rex Teeth in Rex Valley', zone: 'rex' }],
  outro: ["Engineered. These are engineered. The same red mark as Drome's machines, but older. Much older."], reward: { cr: 10000, xp: 44000, take: { rextooth: 3 } } });
defQuest('x3', { ch: 'Chapter 7 · Zarlich', title: 'The Storm Mother', giver: 'drfenn', turnIn: 'drfenn', req: ['x2'], main: true,
  intro: ["The storms are coming from the Shark Spires. From the biggest tube shark anyone's ever seen. The Storm Mother.", "Stop her and the sky clears. And I get to write paper number five."],
  obj: [{ kind: 'item', t: 'stormheart', n: 1, text: 'Defeat the Storm Mother at the Shark Spires', zone: 'spires' }],
  outro: ["The Heart of the Storm. It's humming. It's humming toward Vector.", "Whatever made Drome, made these. And it lives on the dark world. Good luck. Bring a light."], reward: { cr: 16000, xp: 70000, take: { stormheart: 1 } } });
defQuest('w1', { ch: 'Chapter 8 · Vector', title: 'The Last Light', giver: 'lumen', turnIn: 'lumen', req: [], main: true,
  intro: ["You came with the storm's heart. Then you know. Drome was a servant.", "The shades in the Whisper Woods guard the path. Break them, and the dark gets thinner."],
  obj: [{ kind: 'kill', t: 'shade', n: 8, text: 'Banish shades in the Whisper Woods', zone: 'whisper' }],
  outro: ["The woods are quieter. Something in the Maw noticed. Good. Let it be afraid for once."], reward: { cr: 14000, xp: 70000 } });
defQuest('w2', { ch: 'Chapter 8 · Vector', title: 'Blind It', giver: 'lumen', turnIn: 'lumen', req: ['w1'],
  intro: ["The Field of Eyes is how it sees the galaxy. Every eye you close is a world it can't watch."],
  obj: [{ kind: 'kill', t: 'eyewatcher', n: 7, text: 'Close the Watching Eyes', zone: 'eyes' }],
  outro: ["Half-blind. It's shaking the ground. That means it's scared. Or hungry. Hopefully scared."], reward: { cr: 16000, xp: 80000 } });
defQuest('w3', { ch: 'Chapter 8 · Vector', title: 'The Watcher in the Maw', giver: 'lumen', turnIn: 'lumen', req: ['w2'], main: true,
  intro: ["This is the end of the road. The thing in the Maw has watched every war in this galaxy and called it a sunset.", "Go put out its eye."],
  obj: [{ kind: 'item', t: 'watchereye', n: 1, text: 'Defeat the Watcher in the Maw', zone: 'maw' }],
  outro: ["...it's quiet. The whole sky is quiet.", "You did what Drome, the Overseer, the Frost King and all the rest were built to stop. The sun isn't setting anymore, trooper. It's rising."], reward: { cr: 50000, xp: 200000, take: { watchereye: 1 }, cape: 'dawn' } });
CAPES.dawn = { name: 'Cape of the Rising Sun', lvl: 1, flag: 'dawn', col: '#ffd36a', trim: '#ff6a1a' };
