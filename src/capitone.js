// ---------------- CAPITONE (the frozen forest world) ----------------
const TREE = [0, -34];
LEVELS.capitone = {
  id: 'capitone', name: 'Capitone', tag: 'The frozen forest world', lvls: 'Lv 18–30', size: 320, center: [0, 16], radius: 112, water: -0.45, sky: 'capitone', weather: 'snow', hourOffset: 4,
  terrain: { a1: 2.6, f1: 0.04, a2: 1.4, f2: 0.075, a3: 0.6, f3: 0.15, base: 1.6, min: 0.1, edge: 30, step: 1.8 },
  palette: { grass: '#3f7a52', patch: '#2f6a4a', dirt: '#6a5a44', sand: '#c8d0c0', wet: '#2a4a3a', rockA: '#6a7a80', rockB: '#4f5a62', snow: '#eef4f8', snowLine: 6.5, snowZ: 32 },
  zones: [
    { id: 'tree', name: 'Giant Tree Base', lvl: 'No fighting', x: TREE[0], z: TREE[1], r: 14, fr: 16, col: '#4f7a4a', safe: true, h: 0.2 },
    { id: 'fern', name: 'Fern Forest', lvl: 'Lv 18–20', x: 42, z: -4, r: 18, col: '#3f8a4a', h: 0.4 },
    { id: 'forgot', name: 'Forgotten Forest', lvl: 'Lv 20–23', x: -48, z: 8, r: 18, col: '#3a3a5a', h: 0.6 },
    { id: 'frozen', name: 'Frozen Plains', lvl: 'Lv 22–25', x: 8, z: 54, r: 22, fr: 18, col: '#dce8f0', h: 2.4 },
    { id: 'mount', name: 'Mountain of the Lost', lvl: 'Lv 25–28', x: 56, z: 64, r: 14, fr: 11, col: '#e8f0f4', h: 11 },
    { id: 'volcano', name: 'Volcano Base', lvl: 'Lv 26–30', x: -46, z: 66, r: 15, fr: 15, col: '#3a2a26', h: 3.2 }
  ],
  paths: [[[0, -20], [0, 8]], [[0, 8], [42, -4]], [[0, 8], [-48, 8]], [[0, 8], [8, 54]], [[8, 54], [56, 64]], [[8, 54], [-34, 64]]],
  river: [[-40, -60], [-26, -34], [-20, -10], [-24, 18], [-18, 40]], pools: [[50, 6, 4.3], [34, -14, 2.4]],
  lava: [[-52, 60, 1.8], [-40, 70, 1.6], [-56, 74, 2.0], [-36, 56, 1.4]],
  safes: [{ x: TREE[0], z: TREE[1], r: 12.6 }],
  spawn: { x: 0, z: -24, yaw: Math.PI }, pad: { x: 0, z: -14 },
  menu: { x: TREE[0], z: TREE[1], r: 34, h: 12 },
  npcBase: TREE,
  npcs: [
    { id: 'maxurge', name: 'Maxurge', role: 'Master of the Staff', rig: 'maxurge', make: makeMaxurge, x: 0, z: 7, face: Math.PI, idle: ["One eye sees farther than two, gunner.", "The Frost King was a guardian once. Now he wears the Setting Sun's mark."] },
    { id: 'elder', name: 'Elder Bark', role: 'Tree keeper · healer', rig: 'civ', make: () => makeCivilian('#5a4030', '#3a2a1e', '#8fae6a', '#3f7a3a', '#2f6a4a'), x: -6.5, z: 6, heal: true, idle: ["The tree has stood ten thousand winters.", "Rest under the leaves, child."] },
    { id: 'fenn', name: 'Fenn', role: 'Tree market · buys anything', rig: 'spearman', make: () => recolor(makeSpearman(), { '#7fae63': '#5fa8a0', '#4f7a3c': '#3a6a66' }), x: 6.5, z: 6, shop: 'store', idle: ["Furs, quills, ice cores. Fenn buys it all."] },
    { id: 'quill', name: 'Gunsmith Quill', role: 'Frost guns', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#5d7f99', '#4a5229': '#3a5266', '#c9b27c': '#dce8f0' }), x: 8, z: -2, face: -1.4, shop: 'guns', guns: ['s25', 'f30', 'p35'], idle: ["Cold metal hits harder. That's science. Probably."] },
    { id: 'lio', name: 'Scout Lio', role: 'Tree scout', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#c58a64', '#e8e4dc', '#c8402f'), x: -8, z: -2, face: 1.4, idle: ["I've mapped every trail on Capitone. Except the mountain. Nobody comes back from the mountain."] }
  ],
  spawns: [
    { zone: 'fern', type: 'porcupine', n: 6, lv: [18, 20] }, { zone: 'fern', type: 'jumper', n: 5, lv: [18, 20] },
    { zone: 'forgot', type: 'nomine', n: 6, lv: [20, 23] }, { zone: 'forgot', type: 'jumper', n: 3, lv: [21, 23] },
    { zone: 'frozen', type: 'icemonster', n: 5, lv: [22, 25] }, { zone: 'frozen', type: 'snofel', n: 6, lv: [22, 24] },
    { zone: 'mount', type: 'icemonster', n: 3, lv: [25, 27] }, { zone: 'mount', type: 'frostking', n: 1, lv: [28, 28], at: [0, 0] },
    { zone: 'volcano', type: 'guard', n: 4, lv: [26, 28] }, { zone: 'volcano', type: 'magmagopel', n: 3, lv: [26, 29] }, { zone: 'volcano', type: 'vask', n: 1, lv: [30, 30], at: [0, -3] }
  ],
  build() {
    const [tx, tz] = TREE;
    at(makeGiantTree(), tx, tz - 2); solid(tx, tz - 2, 4.4);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.2; solid(tx + Math.cos(a) * 6.2, tz - 2 + Math.sin(a) * 6.2, 0.8); }
    wallRing(tx, tz, 13.4, Math.PI / 2, 2.4, toon('#5a4030', 'wood'), toon('#4a3426', 'wood'), 2.2, 40);
    for (const [ox, oz, col] of [[6.5, 8.5, '#5fa8a0'], [-6.5, 8.5, '#8fae6a']]) { const st = new THREE.Group(); part(st, B(2.4, 0.1, 1.6), toon(col, 'cloth'), 0, 2.2, 0, 0.15); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(st, Cy(0.05, 0.05, 2.2, 4), '#6a4f34', sx * 1.1, 1.1, sz * 0.7); part(st, B(2, 0.8, 0.6), toon('#a07a4a', 'wood'), 0, 0.4, 0.4); at(st, tx + ox, tz + oz); box(tx + ox, tz + oz + 0.4, 1.1, 0.5); }
    dropshipPad(0, -14, 0, 'Return to your ship');
    bridgeOn(PATHS[2]);
    // wilds: pines everywhere, snowy in the north
    scatterNature(150, 21, (i, x, z, r) => { const sn = groundH(x, z) > 5 || z > 36; if (i % 6 === 0) rock(x, z, 0.8 + r() * 1.2, '#6a7a80'); else { const p = makePine(0.9 + r() * 0.7, sn); at(p, x, z, x); solid(x, z, 0.35); } });
    // fern forest
    for (let i = 0; i < 30; i++) { const a = i * 2.4, d = 3 + (i * 7) % 15, x = Z.fern.x + Math.cos(a) * d, z = Z.fern.z + Math.sin(a) * d; at(makeFern(0.9 + (i % 4) * 0.25, i % 3 ? '#3f8a4a' : '#5fa04a'), x, z, a); }
    for (let i = 0; i < 8; i++) { const a = i * 0.8, x = Z.fern.x + Math.cos(a) * 13, z = Z.fern.z + Math.sin(a) * 13; tree(x, z, 1.6, '#2f7a4a'); }
    // forgotten forest: dead grey trees, glowing mushrooms, fallen statues
    for (let i = 0; i < 14; i++) { const a = i * 0.45, d = 5 + (i % 4) * 3.5, x = Z.forgot.x + Math.cos(a) * d, z = Z.forgot.z + Math.sin(a) * d, g = new THREE.Group();
      chain(g, [[0, 0, 0], [0.2, 2, 0], [-0.1, 4, 0.2], [0.3, 5.5, 0]], 0.3, toon('#5a5560', 'wood'), 0.08);
      chain(g, [[0.1, 3, 0], [1.2, 4, 0.3], [1.8, 4.6, 0.2]], 0.1, toon('#5a5560', 'wood'), 0.04); chain(g, [[0, 3.6, 0], [-1, 4.6, -0.2]], 0.08, toon('#5a5560', 'wood'), 0.03);
      at(g, x, z, a); solid(x, z, 0.4); }
    for (let i = 0; i < 16; i++) { const m = new THREE.Group(); part(m, Cy(0.06, 0.08, 0.3, 5), '#e8e4dc', 0, 0.15, 0); part(m, new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), glow(i % 2 ? '#c8a0ff' : '#8fe3ff'), 0, 0.3, 0); at(m, Z.forgot.x + rand(-14, 14), Z.forgot.z + rand(-14, 14)); }
    for (let i = 0; i < 3; i++) { const st = new THREE.Group(); part(st, B(1, 2.6, 0.8), toon('#7a7a80', 'stone'), 0, 0.5, 0, 1.3, 0, 0.2); E(st, toon('#7a7a80', 'stone'), 0, 0.6, 1.6, 0.5, 0.5, 0.5); const x = Z.forgot.x - 6 + i * 6, z = Z.forgot.z - 8 + i * 3; at(st, x, z, i); solid(x, z, 1.3); }
    // frozen plains: ice spikes and frozen ponds
    for (let i = 0; i < 16; i++) { const a = i * 0.9, d = 6 + (i % 4) * 4, x = Z.frozen.x + Math.cos(a) * d, z = Z.frozen.z + Math.sin(a) * d; at(makeIceSpike(0.8 + (i % 3) * 0.4), x, z, a); solid(x, z, 0.6); }
    for (let i = 0; i < 3; i++) { const ice = new THREE.Mesh(new THREE.CircleGeometry(2.5 + i, 12).rotateX(-Math.PI / 2), toon('#bfe6f2')); at(ice, Z.frozen.x - 10 + i * 9, Z.frozen.z + 10 - i * 6, 0, 0.04); }
    // mountain of the lost: cairns of fallen climbers
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; at(makeCairn(), Z.mount.x + Math.cos(a) * 9, Z.mount.z + Math.sin(a) * 9, a); solid(Z.mount.x + Math.cos(a) * 9, Z.mount.z + Math.sin(a) * 9, 0.6); }
    { const x = Z.mount.x - 12, z = Z.mount.z - 14; const pack = new THREE.Group(); part(pack, B(0.6, 0.8, 0.4), toon('#8a3a2e', 'cloth'), 0, 0.4, 0); part(pack, B(1.6, 0.2, 0.5), toon('#3b4f7a', 'cloth'), 0.8, 0.1, 0.4, 0, 0.4, 0); at(pack, x, z, 0.6);
      INTERACTS.push({ x, z, r: 3, label: 'Search the frozen pack', fn: () => foundQuest('cf1') }); }
    // volcano base: Drome-style black walls
    { const cx = Z.volcano.x, cz = Z.volcano.z, R = 13, gate = Math.atan2(64 - cz, -34 - cx), g = new THREE.Group(); g.position.set(cx, groundH(cx, cz), cz); props.add(g);
      for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2, d = Math.atan2(Math.sin(a - gate), Math.cos(a - gate)); if (Math.abs(d) < 0.16) continue;
        const x = Math.cos(a) * R, z = Math.sin(a) * R, y = groundH(cx + x, cz + z) - g.position.y;
        part(g, B(2.7, 3.2, 0.7), i % 2 ? '#2b2528' : '#352d31', x, y + 1.6, z, 0, -a + Math.PI / 2);
        if (i % 3 === 0) part(g, B(0.9, 1.6, 0.05), C.red, x * 0.96, y + 2.0, z * 0.96, 0, -a + Math.PI / 2); }
      part(g, new THREE.ConeGeometry(7, 9, 9), toon('#3a2a26', 'stone'), -3, 4.5, -6); part(g, Cy(1.6, 2.4, 1, 9), glow('#ff6a1a'), -3, 8.6, -6);
      solid(cx - 3, cz - 6, 5.5); RINGS.push({ x: cx, z: cz, r: R, gate, half: 2.1 }); }
    tufts(700, null, (x, z) => groundH(x, z) > 4.5 || z > 34 || Math.hypot(x - Z.volcano.x, z - Z.volcano.z) < 20);
  }
};
