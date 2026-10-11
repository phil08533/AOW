// =================== EARTH: the Forest of Life and the Super Swift Arena ===================
function makeSnapvine() {
  const g = new THREE.Group(), st = '#3a6a2a', head = new THREE.Group();
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, B(0.5, 0.06, 0.2), toon('#5aa04a', 'leaves'), Math.cos(a) * 0.4, 0.05, Math.sin(a) * 0.4, 0, -a, 0); }
  chain(g, [[0, 0, 0], [0.1, 0.6, 0.05], [0, 1.2, 0.1]], 0.1, st, 0.07);
  head.position.set(0, 1.3, 0.15); g.add(head);
  E(head, '#c8402f', 0, 0.12, 0, 0.32, 0.16, 0.3); E(head, '#c8402f', 0, -0.1, 0, 0.32, 0.14, 0.3); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; part(head, new THREE.ConeGeometry(0.03, 0.12, 3), '#efe7d6', Math.cos(a) * 0.26, 0, Math.sin(a) * 0.24, Math.PI); }
  for (let k = 0; k < 6; k++) E(head, '#ffd23a', Math.cos(k) * 0.2, 0.22, Math.sin(k) * 0.2, 0.04, 0.04, 0.04);
  g.userData.anim = t => { head.rotation.x = Math.sin(t * 3) * 0.2; head.position.y = 1.3 + Math.sin(t * 1.5) * 0.08; };
  return g;
}
function makeSpriggan() {
  const g = new THREE.Group(), w = '#6a4a2e', lf = '#5aa04a';
  for (const s of [-1, 1]) { chain(g, [[0.15 * s, 0.9, 0], [0.18 * s, 0.45, 0.05], [0.14 * s, 0.02, 0.08]], 0.09, w, 0.06); chain(g, [[0.3 * s, 1.6, 0], [0.5 * s, 1.2, 0.1], [0.55 * s, 0.85, 0.2]], 0.07, w, 0.04); for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.03, 0.18, 3), w, 0.55 * s + k * 0.03 * s, 0.75, 0.2 + k * 0.03, Math.PI); }
  E(g, w, 0, 1.3, 0, 0.3, 0.45, 0.22); E(g, w, 0, 1.95, 0.02, 0.18, 0.22, 0.18); for (const s of [-1, 1]) E(g, glow('#7fff6a'), 0.07 * s, 2.0, 0.17, 0.035, 0.035, 0.02);
  for (let k = 0; k < 7; k++) E(g, toon(lf, 'leaves'), Math.cos(k * 0.9) * 0.2, 2.2 + Math.sin(k) * 0.08, Math.sin(k * 0.9) * 0.16, 0.14, 0.08, 0.14);
  return g;
}
function makeGlowmoth() {
  const g = new THREE.Group(), b = new THREE.Group(), wings = []; b.position.y = 1.7; g.add(b);
  E(b, '#3a2a1e', 0, 0, 0, 0.1, 0.1, 0.32); for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.x = 0.06 * s; b.add(w); wings.push(w); E(w, glow(s > 0 ? '#9fe8ff' : '#7fff6a'), 0.35 * s, 0, 0, 0.35, 0.02, 0.26); E(w, '#2a3a2a', 0.42 * s, 0.01, 0, 0.1, 0.02, 0.08); }
  g.userData.anim = t => { b.position.y = 1.7 + Math.sin(t * 2) * 0.3; wings[0].rotation.z = Math.sin(t * 14) * 0.6; wings[1].rotation.z = -Math.sin(t * 14) * 0.6; };
  return g;
}
const LIFE = [0, 30];
LEVELS.forestlife = {
  id: 'forestlife', name: 'Forest of Life', tag: "Earth's ancient forest", lvls: 'Lv 8–14', size: 260, center: [0, 30], radius: 100, water: -1.2, hourOffset: 0,
  terrain: { a1: 1.4, f1: 0.05, a2: 0.7, f2: 0.12, a3: 0.25, f3: 0.25, base: 1.0, min: -2, edge: 22, step: 1.8 },
  palette: { grass: '#3f8a2f', patch: '#2f7a26', dirt: '#5a4a32', sand: '#b8a878', wet: '#2a4a2a', rockA: '#6a7a5a', rockB: '#4a5a3a' },
  zones: [
    { id: 'grove', name: 'The Elder Grove', lvl: 'Safe · the Tree of Life', x: LIFE[0], z: LIFE[1] - 40, r: 14, fr: 15, col: '#5aa04a', safe: true, h: 0.4 },
    { id: 'thicket', name: 'Snapvine Thicket', lvl: 'Lv 8–10', x: -40, z: 30, r: 20, col: '#2f6a26', h: 0 },
    { id: 'hollow', name: 'Glowmoth Hollow', lvl: 'Lv 10–12', x: 40, z: 30, r: 20, col: '#2a5a4a', h: -0.5 },
    { id: 'heart', name: 'Heartwood', lvl: 'Lv 12–14 · boss', x: 0, z: 74, r: 18, fr: 14, col: '#4a3a1e', h: 0.5 }
  ],
  paths: [[[0, -2], [-40, 30]], [[0, -2], [40, 30]], [[0, -2], [0, 74]]], river: [[-90, 50], [-40, 52], [0, 46], [40, 52], [90, 48]], pools: [], lava: [],
  safes: [{ x: 0, z: -10, r: 13 }], spawn: { x: 0, z: -16, yaw: Math.PI }, pad: { x: 6, z: -20 }, menu: { x: 0, z: 20, r: 40, h: 12 }, npcBase: [0, -10],
  npcs: [
    { id: 'oaken', name: 'Elder Oaken', role: 'Voice of the forest', rig: null, make: () => { const g = makeSpriggan(); g.scale.setScalar(1.4); return g; }, x: 0, z: 6, face: Math.PI, idle: ["The forest remembers every footstep. Yours are loud.", "Drome's red mark has reached even the roots. Help us, and the forest helps you."] },
    { id: 'fern', name: 'Ranger Fern', role: 'Forest ranger · heals', rig: 'civ', make: () => makeCivilian('#3f6a2f', '#3d3a36', '#c58a64', '#8a5a2a', '#c9a43a'), x: 6, z: -6, face: -1.2, heal: true, shop: 'store', idle: ["Leave only footprints. Take only loot. That's the ranger motto. We rewrote it."] }
  ],
  spawns: [
    { zone: 'thicket', type: 'snapvine', n: 8, lv: [8, 10] },
    { zone: 'hollow', type: 'glowmoth', n: 6, lv: [10, 12] }, { zone: 'hollow', type: 'spriggan', n: 3, lv: [10, 12] },
    { zone: 'heart', type: 'spriggan', n: 3, lv: [12, 14] }, { zone: 'heart', type: 'rotking', n: 1, lv: [14, 14], at: [0, 4] }
  ],
  build() {
    // the Tree of Life
    const tree = new THREE.Group(); part(tree, Cy(2.2, 3.4, 16, 9), toon('#6a4a2e', 'wood'), 0, 8, 0);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; chain(tree, [[Math.cos(a) * 2.5, 0.5, Math.sin(a) * 2.5], [Math.cos(a) * 4.5, 0.2, Math.sin(a) * 4.5], [Math.cos(a) * 6, -0.3, Math.sin(a) * 6]], 0.6, toon('#5a3a22', 'wood'), 0.2); }
    for (let i = 0; i < 9; i++) { const a = i * 0.7; E(tree, toon(i % 2 ? '#4fae3a' : '#6fce4a', 'leaves'), Math.cos(a) * 5, 16 + (i % 3) * 2, Math.sin(a) * 5, 5, 3, 5); }
    for (let i = 0; i < 24; i++) { const a = i * 2.4; E(tree, glow(i % 2 ? '#ffd36a' : '#9fff6a'), Math.cos(a) * (3 + i % 5), 13 + (i % 7), Math.sin(a) * (3 + i % 5), 0.2, 0.2, 0.2); }
    at(tree, 0, -10); solid(0, -10, 3.2);
    INTERACTS.push({ x: 0, z: -6, r: 3, label: 'Rest at the Tree of Life', fn: () => { player.hp = maxHp(); SFX.quest(); log('The Tree of Life restores you.', 'loot'); burst(player.pos.clone().add(V(0, 1, 0)), '#9fff6a', 20, 3); } });
    INTERACTS.push({ x: 6, z: -20, r: 3, label: 'Trail back to Earth town', fn: () => loadLevel('earth') });
    const sign = new THREE.Group(); part(sign, B(0.2, 2.4, 0.2), toon('#6a4a2e', 'wood'), 0, 1.2, 0); const sp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signTex('TO EARTH TOWN', '#3a2a1e', '#ffd36a'), side: THREE.DoubleSide })); sp.position.y = 2.2; sign.add(sp); at(sign, 6, -21);
    // the forest
    for (let i = 0; i < 120; i++) { const a = i * 2.39996, d = 16 + Math.sqrt(i / 120) * 80, x = Math.cos(a) * d, z = 30 + Math.sin(a) * d; if (Math.hypot(x, z + 10) < 16) continue; const h = 7 + (i % 5) * 1.6, t = new THREE.Group(); part(t, Cy(0.35, 0.6, h, 6), toon('#5a3a22', 'wood'), 0, h / 2, 0); E(t, toon(i % 3 ? '#3f8a2f' : '#5aa04a', 'leaves'), 0, h + 0.6, 0, 2.4 + (i % 3) * 0.5, 1.8, 2.4 + (i % 3) * 0.5); if (i % 7 === 0) E(t, glow('#ffd36a'), 0.8, h - 1, 0.6, 0.15, 0.15, 0.15); at(t, x, z, i); solid(x, z, 0.6); }
    for (let i = 0; i < 30; i++) { const x = Z.hollow.x + Math.cos(i * 1.7) * (4 + i % 14), z = Z.hollow.z + Math.sin(i * 1.7) * (4 + i % 14); part(props, Cy(0.08, 0.12, 0.5, 5), '#e8e4dc', x, groundH(x, z) + 0.25, z); E(props, glow(i % 2 ? '#9fe8ff' : '#7fff6a'), x, groundH(x, z) + 0.6, z, 0.35, 0.15, 0.35); }
    tufts(260);
  }
};
// ---------------- Super Swift Arena: boss rush ----------------
const SWIFT_LADDER = ['chief', 'drome', 'matriarch', 'vask', 'frostking', 'overseer', 'excavator', 'krag', 'stormmother', 'dromeprime', 'watcher'];
const SW = { round: 0, t: 0 };
LEVELS.swift = {
  id: 'swift', name: 'Super Swift Arena', tag: "Earth's boss arena", lvls: 'Boss rush', size: 160, center: [0, 0], radius: 60, water: -99, weather: 'none', hourOffset: 8,
  terrain: { a1: 0.1, f1: 0.05, a2: 0, f2: 0.1, a3: 0, f3: 0.2, base: 0.4, min: 0.2, edge: 18, step: 2, noTerrace: true },
  palette: { grass: '#c8a070', patch: '#b89060', dirt: '#8a6a44', sand: '#d8b888', wet: '#6a4a2e', rockA: '#9a8a78', rockB: '#7a6a58' },
  zones: [{ id: 'lobby', name: 'Swift Lobby', lvl: 'Safe', x: 0, z: -40, r: 10, fr: 11, col: '#5d636c', safe: true, h: 0.4 }, { id: 'pit', name: 'The Swift Pit', lvl: 'Boss rush', x: 0, z: 0, r: 26, col: '#c8a070', h: 0 }],
  paths: [], river: [], pools: [], lava: [],
  safes: [{ x: 0, z: -40, r: 9 }], spawn: { x: 0, z: -42, yaw: 0 }, pad: { x: 6, z: -44 }, menu: { x: 0, z: 0, r: 34, h: 14 }, npcBase: [0, -40],
  npcs: [
    { id: 'swift', name: 'Promoter Swift', role: 'Boss rush', rig: 'civ', make: () => makeCivilian('#ffd36a', '#2c2a28', '#e0b892', '#1e1a18', '#ff2a3a'), x: 0, z: 4, face: Math.PI, custom: [['Boss rush', () => openSwift()]], idle: ["LADIES, GENTLEMEN AND ASSORTED ALIENS! Welcome to the SUPER! SWIFT! ARENA!", "Every boss in the galaxy, one after another, scaled to YOU. It's a terrible idea. Tickets are free."] }
  ],
  spawns: [],
  build() {
    // colosseum walls with stands and banners
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.15) continue; const x = Math.cos(a) * 28, z = Math.sin(a) * 28; part(props, B(5, 4, 1), '#8a7a68', x, 2, z, 0, -a + Math.PI / 2, 0); for (let k = 0; k < 3; k++) part(props, B(5, 0.6, 1.4), '#6a5a48', Math.cos(a) * (29.4 + k * 1.4), 4.3 + k * 1.2, Math.sin(a) * (29.4 + k * 1.4), 0, -a + Math.PI / 2, 0); if (i % 3 === 0) part(props, B(1.2, 3, 0.05), toon(i % 2 ? '#c8402f' : '#3b4f7a', 'cloth'), x * 0.97, 5.5, z * 0.97, 0, -a + Math.PI / 2, 0); }
    RINGS.push({ x: 0, z: 0, r: 28, gate: -Math.PI / 2, half: 2.6 });
    const fans = new THREE.Group(); levelGroup.add(fans); for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2, r = 30 + (i % 3) * 1.4, f = new THREE.Mesh(B(0.5, 0.9, 0.4), toon(['#c8402f', '#3b4f7a', '#ffd36a', '#6fdc5a'][i % 4])); f.position.set(Math.cos(a) * r, 5.2 + (i % 3) * 1.2, Math.sin(a) * r); f.userData.ph = i; fans.add(f); }
    levelAnims.push(t => { const hype = SW.round ? 2 : 0.6; fans.children.forEach(f => { f.scale.y = 1 + Math.max(0, Math.sin(t * 5 + f.userData.ph)) * 0.25 * hype; }); swiftTick(); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ map: signTex('SUPER SWIFT ARENA', '#1e1c22', '#ffd36a'), side: THREE.DoubleSide })); sg.position.set(0, 9, -29.6); sg.rotation.y = Math.PI; levelGroup.add(sg);
    for (const s of [-1, 1]) { part(props, B(1.4, 9, 1.4), '#3a3d44', 7.6 * s, 4.5, -29); }
    INTERACTS.push({ x: 6, z: -44, r: 3, label: 'Shuttle back to Earth town', fn: () => { SW.round = 0; loadLevel('earth'); } });
  }
};
function openSwift() {
  const A = S.swift || {}; openDlg('Super Swift Arena', 'Promoter Swift');
  $('dlgLine').textContent = `Boss rush: ${SWIFT_LADDER.length} bosses back to back, each scaled to your level. You heal halfway between rounds. Leave the pit or go down and it's over. Best: round ${A.best || 0}/${SWIFT_LADDER.length}.`;
  acts([[SW.round ? 'Rush in progress' : 'Start the boss rush', () => { closeDlg(); swiftStart(); }, true, !!SW.round], ['Bye', closeDlg]]);
}
function swiftStart() { SW.round = 1; SW.t = 4; player.pos.set(0, 0, -20); player.yaw = Math.PI; toast('BOSS RUSH', 'Round 1 in 4 seconds. Get in the pit!', 3); SFX.horn(); }
function swiftEnd(why) { for (const e of enemies) if (e.sp.swift) { e.gone = true; scene.remove(e.obj); } for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].gone) enemies.splice(i, 1); log(`${why} You reached round ${SW.round}.`, 'loot'); SW.round = 0; }
function swiftTick() {
  if (!SW.round || LEVEL.id !== 'swift') return; const dt = 1 / 60;
  const inPit = Math.hypot(player.pos.x, player.pos.z) < 27;
  if (!player.alive || (!inPit && SW.t <= 0)) return swiftEnd(player.alive ? 'You left the pit.' : 'You went down.');
  if (SW.t > 0) { SW.t -= dt; if (SW.t <= 0) { const id = SWIFT_LADDER[SW.round - 1], lv = Math.max(S.lvl, 5); const e = makeEnemy({ zone: 'pit', type: id, n: 1, lv: [lv, lv], swift: true, once: true }); e.obj.position.set(0, 0, 14); e.aggro = true; toast(`ROUND ${SW.round}`, ENEMY[id].name, 2.5); SFX.horn(); SFX.cheer && SFX.cheer(); } return; }
  if (!enemies.some(e => e.sp.swift && !e.dead)) {
    const n = SW.round, cr = 400 * n + 120 * n * n, xp = Math.round(600 * n * Math.max(1, S.lvl / 6)); S.cr += cr; gainXp(xp); S.swift = S.swift || {}; S.swift.best = Math.max(S.swift.best || 0, n); questProgressKill('swift' + n); markDirty(); checkReady();
    player.hp = Math.min(maxHp(), player.hp + maxHp() * 0.5);
    if (n >= SWIFT_LADDER.length) { S.flags = S.flags || {}; S.flags.swiftchamp = true; toast('SWIFT CHAMPION', `Every boss down! +${cr} cr · Swift Champion Cape unlocked`, 6); SFX.level(); SW.round = 0; return; }
    toast(`ROUND ${n} CLEARED`, `+${cr} cr · next boss in 6s`, 3); SFX.quest(); SW.round++; SW.t = 6;
  }
}
CAPES.swiftchamp = { name: 'Swift Champion Cape', lvl: 1, flag: 'swiftchamp', col: '#ffd36a', trim: '#c8402f' };
Object.assign(ENEMY, {
  snapvine: { name: 'Snapvine', make: makeSnapvine, scale: 1.3, hp: 70, speed: 0.6, r: 0.5, hy: 0.9, xp: 30, cr: [6, 12], melee: { dmg: 14, rate: 0.9, reach: 2.4 }, lob: { dmg: 10, rate: 2.4, speed: 12, range: 16, keep: 3, col: '#7fff6a' }, drops: [['lifeseed', 0.4]] },
  spriggan: { name: 'Spriggan', make: makeSpriggan, hp: 120, speed: 2.4, r: 0.45, hy: 1.1, xp: 44, cr: [10, 18], melee: { dmg: 16, rate: 1.0, reach: 2.0 }, drops: [['lifeseed', 0.4]] },
  glowmoth: { name: 'Glowmoth', make: makeGlowmoth, fly: true, hp: 60, speed: 3.8, r: 0.5, hy: 1.7, xp: 32, cr: [8, 14], ranged: { dmg: 9, rate: 1.4, speed: 14, col: '#9fe8ff', range: 18, keep: 8 }, drops: [['lifeseed', 0.3]] },
  rotking: { name: 'The Rot King', make: () => { const g = makeSpriggan(); recolor(g, { '#6a4a2e': '#3a1e2e', '#5aa04a': '#8a2a3a' }); return g; }, scale: 2.6, hp: 1800, speed: 1.8, r: 0.8, hy: 1.1, xp: 1800, cr: [300, 420], boss: true, melee: { dmg: 30, rate: 1.4, reach: 3 }, lob: { dmg: 22, rate: 2.0, speed: 13, range: 22, keep: 6, col: '#c8402f' }, drops: [['rotheart', 1]] }
});
ITEMS.lifeseed = { name: 'Seed of Life', v: 30, col: '#9fff6a' };
ITEMS.rotheart = { name: "Rot King's Heart", v: 0, col: '#c8402f', quest: true };
MELEE.thornblade = { name: 'Thornblade', dmg: 120, rate: 0.4, reach: 2.6, req: 12, price: 0, poison: true };
{ const _mm = makeMeleeModel; makeMeleeModel = function (id) { if (id === 'thornblade') { const g = new THREE.Group(); part(g, Cy(0.02, 0.025, 0.16, 6), toon('#5a3a22', 'wood'), 0, 0, 0); part(g, B(0.05, 0.55, 0.02), toon('#3f8a2f', 'leaves'), 0, 0.36, 0); for (let k = 0; k < 4; k++) part(g, new THREE.ConeGeometry(0.012, 0.06, 3), '#efe7d6', 0.03, 0.18 + k * 0.1, 0, 0, 0, -Math.PI / 2); return g; } return _mm(id); }; }
defQuest('fl1', { ch: 'Earth · Forest of Life', title: 'Roots and Rot', giver: 'oaken', turnIn: 'oaken', req: [],
  intro: ["Snapvines grow where Drome's red mark poisons the soil. West of here, in the Thicket.", "Cut them down and bring me Seeds of Life. The forest will grow back clean."],
  obj: [{ kind: 'item', t: 'lifeseed', n: 6, text: 'Gather Seeds of Life from the forest creatures' }],
  outro: ["Good seeds. Clean seeds. The Tree of Life thanks you. Rest under it any time."], reward: { cr: 600, xp: 2500, take: { lifeseed: 6 }, items: { medkit: 3 } } });
defQuest('fl2', { ch: 'Earth · Forest of Life', title: 'The Rot King', giver: 'oaken', turnIn: 'oaken', req: ['fl1'], main: true,
  intro: ["The rot comes from one heart: the Rot King, in the Heartwood to the north. He was a spriggan once. Like me.", "Free him. Bring back his heart."],
  obj: [{ kind: 'item', t: 'rotheart', n: 1, text: 'Defeat the Rot King in the Heartwood', zone: 'heart' }],
  outro: ["He is at peace. Take this blade, grown from the Tree itself. It bites like a snapvine."], reward: { cr: 1500, xp: 5000, take: { rotheart: 1 }, melee: 'thornblade' } });
defQuest('ss1', { ch: 'Earth · Super Swift Arena', title: 'Swift Glory', giver: 'swift', turnIn: 'swift', req: [],
  intro: ["You want fame? You want fortune? You want to fight Drome AGAIN, but in front of a crowd?", "Clear round 3 of the boss rush and I'll make you a star."],
  obj: [{ kind: 'kill', t: 'swift3', n: 1, text: 'Clear round 3 of the boss rush' }],
  outro: ["A STAR IS BORN! Now go for all eleven. The cape is very shiny."], reward: { cr: 5000, xp: 12000 } });
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'forestlife' || id === 'swift') return true; return _po(id); }; }
// signposts in Earth town
{ const ob = LEVELS.earth.build; LEVELS.earth.build = function () { ob.call(this);
  const mk = (x, z, text, fn, label) => { const sg = new THREE.Group(); part(sg, B(0.2, 2.6, 0.2), toon('#6a4a2e', 'wood'), 0, 1.3, 0); const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6), new THREE.MeshBasicMaterial({ map: signTex(text, '#3a2a1e', '#ffd36a'), side: THREE.DoubleSide })); p.position.y = 2.3; sg.add(p); at(sg, x, z); solid(x, z, 0.3); INTERACTS.push({ x, z, r: 2.6, label, fn }); };
  mk(TOWN.x + 9, TOWN.z + 39, 'FOREST OF LIFE', () => loadLevel('forestlife'), 'Trail to the Forest of Life');
  mk(TOWN.x - 9, TOWN.z + 39, 'SUPER SWIFT ARENA', () => loadLevel('swift'), 'Shuttle to the Super Swift Arena'); }; }
