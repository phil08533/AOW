// =================== FORT IRONROCK: the asteroid army base (vehicle training, research, army shop) ===================
function makeTrainingDrone() {
  const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 1.4; g.add(b);
  part(b, Cy(0.5, 0.5, 0.18, 10), '#ffd36a', 0, 0, 0); for (let k = 0; k < 3; k++) part(b, Cy(0.5 - k * 0.15, 0.5 - k * 0.15, 0.2, 10), k % 2 ? '#ffffff' : '#c8402f', 0, 0, 0.1 + k * 0.02, Math.PI / 2);
  for (const s of [-1, 1]) { part(b, B(0.6, 0.04, 0.08), '#3a3d44', 0.5 * s, 0.1, 0); part(b, Cy(0.18, 0.18, 0.02, 8), '#9aa1aa', 0.8 * s, 0.14, 0); }
  g.userData.anim = t => { b.position.y = 1.4 + Math.sin(t * 2) * 0.2; };
  return g;
}
function makeSiegeBot() {
  const g = new THREE.Group(), c = '#7a2a2a', dk = '#2b2a2c';
  for (const s of [-1, 1]) { part(g, B(0.4, 1.0, 0.5), dk, 0.4 * s, 0.5, 0); part(g, B(0.5, 0.2, 0.7), c, 0.4 * s, 0.1, 0.08); }
  part(g, B(1.3, 1.0, 0.9), c, 0, 1.5, 0); part(g, B(0.8, 0.2, 0.05), glow('#ff2a3a'), 0, 1.7, 0.46);
  part(g, B(0.5, 0.5, 1.4), '#3a3d44', 0.85, 2.05, 0.2); part(g, Cy(0.12, 0.12, 0.6, 8), dk, 0.85, 2.05, 1.1, Math.PI / 2);
  for (const s of [-1, 1]) part(g, B(0.3, 0.8, 0.3), dk, -0.8, 1.4, 0.1);
  part(g, new THREE.CircleGeometry(0.16, 3), glow('#ff2a3a'), -0.2, 1.4, 0.46);
  return g;
}
function makeKragMech() { const g = makeMechModel('#3a1416'); g.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) o.material = glow('#ff2a3a'); }); for (const s of [-1, 1]) chain(g, [[0.6 * s, 3.2, 0], [0.9 * s, 3.8, -0.1], [0.8 * s, 4.3, -0.3]], 0.1, '#b3262c', 0.02); return g; }
const FORT = [0, -10];
LEVELS.fort = {
  id: 'fort', name: 'Fort Ironrock', tag: 'Asteroid army base', lvls: 'Lv 12–30 · vehicles', size: 300, center: [0, 20], radius: 115, water: -99, sky: 'space', weather: 'none', gravity: 0.6, hourOffset: 0,
  terrain: { a1: 2.0, f1: 0.045, a2: 1.1, f2: 0.1, a3: 0.4, f3: 0.22, base: 1.0, min: -5, edge: 26, step: 2.4 },
  palette: { grass: '#7a6a5a', patch: '#6a5a4a', dirt: '#4a4440', sand: '#8a7a68', wet: '#3a3430', rockA: '#6a5a4a', rockB: '#4a4038' },
  carve: (x, z, h) => { const d = Math.hypot(x - FORT[0], z - FORT[1]); if (d < 30) h = h * smooth(d, 24, 30); const dr = Math.hypot(x - 50, z - 20); if (dr < 26) h *= 0.25 + 0.75 * smooth(dr, 18, 26); return h; },
  zones: [
    { id: 'base', name: 'Fort Ironrock', lvl: 'Safe · army base', x: FORT[0], z: FORT[1], r: 24, fr: 25, col: '#5d636c', safe: true, h: 0.5 },
    { id: 'range', name: 'Vehicle Range', lvl: 'Lv 12–16 · training', x: 50, z: 20, r: 22, col: '#8a7a50', h: 0 },
    { id: 'siege', name: 'Siege Lines', lvl: 'Lv 18–24', x: -46, z: 34, r: 22, col: '#6a3a30', h: 0 },
    { id: 'tankyard', name: 'Drome Tank Yard', lvl: 'Lv 22–28', x: 20, z: 72, r: 20, col: '#4a3030', h: -0.5 },
    { id: 'kragpit', name: "Krag's Crater", lvl: 'Lv 30 · boss', x: -30, z: 86, r: 16, fr: 12, col: '#3a1416', h: -2 }
  ],
  paths: [[[0, 12], [50, 20]], [[0, 12], [-46, 34]], [[0, 12], [20, 72]], [[-46, 34], [-30, 86]]], river: [], pools: [], lava: [],
  safes: [{ x: FORT[0], z: FORT[1], r: 23 }], spawn: { x: 0, z: -18, yaw: Math.PI }, pad: { x: -10, z: -20 }, menu: { x: 0, z: 0, r: 40, h: 14 }, npcBase: FORT,
  npcs: [
    { id: 'hale', name: 'General Hale', role: 'Fort commander', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#3a4a2a', '#c9b27c': '#ffd36a' }), x: 0, z: 2, face: Math.PI, idle: ["Fort Ironrock. Carved out of a rock, held together by spite and duct tape.", "Drome's tanks hit us every night. We hit back every morning. It's a schedule."] },
    { id: 'brix', name: 'Quartermaster Brix', role: 'Army shop · war vehicles', rig: 'civ', make: () => makeCivilian('#5a6a3a', '#2c2a28', '#c58a64', '#1e1a18', '#ffd36a'), x: 9, z: -2, face: -1.3, custom: [['Vehicles', n => openVehicleShop(n)], ['Vehicle bay', () => openVehicleBay()]], shop: 'guns', guns: ['g70', 'g80'], idle: ["Tank? Car with spikes? Two-story robot? I've got a guy. I am the guy."] },
    { id: 'volta', name: 'Dr. Volta', role: 'Military research', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#3b4f7a', '#e0b892', '#9aa1aa', '#4fd2ff'), x: -9, z: -2, face: 1.3, custom: [['Research', n => openResearch(n)]], idle: ["I made the tank 25% more tank. Peer review pending.", "Bring me scrap and ore. I turn rocks into armor. It's basically alchemy with a budget."] },
    { id: 'torque', name: 'Sgt. Torque', role: 'Vehicle training', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#8a6a3a', '#c9b27c': '#2b2a2c' }), x: 12, z: 10, face: -2.2, idle: ["Mirrors, signal, ram it. That's the whole driving course."] },
    { id: 'medic', name: 'Corporal Patch', role: 'Field medic · heals', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#2c2a28', '#8a5a3a', '#1e1a18', '#c8402f'), x: -12, z: 10, face: 2.2, heal: true, idle: ["Hold still. This is going to hurt me more than you. Not really."] }
  ],
  spawns: [
    { zone: 'range', type: 'tdrone', n: 8, lv: [12, 16] },
    { zone: 'siege', type: 'siegebot', n: 6, lv: [18, 24] },
    { zone: 'tankyard', type: 'dtank', n: 5, lv: [22, 28] }, { zone: 'tankyard', type: 'siegebot', n: 2, lv: [24, 26] },
    { zone: 'kragpit', type: 'krag', n: 1, lv: [30, 30], at: [0, 0] }
  ],
  build() {
    const [fx, fz] = FORT;
    // compound wall with a gate to the north
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.2) continue; const x = fx + Math.cos(a) * 23.5, z = fz + Math.sin(a) * 23.5; part(props, B(3.8, 3, 0.8), '#5d636c', x, groundH(x, z) + 1.5, z, 0, -a + Math.PI / 2, 0); if (i % 5 === 0) { part(props, B(1.4, 5, 1.4), '#3a3d44', x, groundH(x, z) + 2.5, z); part(props, B(0.6, 0.3, 0.6), glow('#ff8a2a'), x, groundH(x, z) + 5.2, z); } }
    RINGS.push({ x: fx, z: fz, r: 23.5, gate: Math.PI / 2, half: 3, safe: true });
    // hangar with the three vehicles on display
    const hg = new THREE.Group(); part(hg, B(18, 0.3, 9), '#3a3d44', 0, 0.15, 0); part(hg, new THREE.CylinderGeometry(4.6, 4.6, 18, 12, 1, true, 0, Math.PI), toon('#6a6a70', 'panel'), 0, 0.2, 0, 0, 0, Math.PI / 2); hg.children[1].material.side = THREE.DoubleSide;
    const s1 = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.2), new THREE.MeshBasicMaterial({ map: signTex('MOTOR POOL', '#1e1c22', '#ffd36a') })); s1.position.set(0, 5, 4.6); hg.add(s1); at(hg, fx, fz - 14);
    box(fx, fz - 18.4, 9, 0.4); box(fx - 9, fz - 14, 0.4, 4.6); box(fx + 9, fz - 14, 0.4, 4.6);
    [[makeBattleCar, -5.5, 0.6], [makeTankModel, 0, 0.7], [makeMechModel, 5.5, 0.55]].forEach(([mk, ox, sc]) => { const v = mk(); v.scale.setScalar(sc); at(v, fx + ox, fz - 14.5, 0.3); if (v.userData.anim) levelAnims.push(t => v.userData.anim(t * 0.2)); });
    // research lab dome, barracks, army shop, radar
    const lab = makeDome(5, '#cfe6ff'); at(lab, fx - 15, fz + 2); solid(fx - 15, fz + 2, 4.6);
    for (const [ox, oz, w, h, col] of [[15, 2, 7, 4, '#5a6a3a'], [-14, -14, 5, 3.6, '#5d636c'], [14, -14, 5, 3.6, '#5d636c']]) { const t = makeCityBlock(w, h, 4, col, '#ffd36a'); at(t, fx + ox, fz + oz); box(fx + ox, fz + oz, w / 2, 2); }
    const radar = new THREE.Group(); part(radar, Cy(0.2, 0.3, 6, 6), '#3a3d44', 0, 3, 0); const dish = new THREE.Group(); dish.position.y = 6.2; radar.add(dish); part(dish, new THREE.SphereGeometry(1.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 3), '#9aa1aa', 0, 0, 0, Math.PI / 2.6); at(radar, fx + 18, fz + 12); solid(fx + 18, fz + 12, 0.5); levelAnims.push(t => { dish.rotation.y = t * 0.8; });
    dropshipPad(-10, -20, 0, 'Return to your ship');
    // training range: target boards, cones, ramps
    for (let i = 0; i < 10; i++) { const a = i * 0.63, x = Z.range.x + Math.cos(a) * 15, z = Z.range.z + Math.sin(a) * 15, t = new THREE.Group(); part(t, B(0.15, 2, 0.15), '#3a3d44', 0, 1, 0); part(t, Cy(0.9, 0.9, 0.1, 12), '#ffffff', 0, 2.4, 0, Math.PI / 2); part(t, Cy(0.6, 0.6, 0.12, 12), '#c8402f', 0, 2.4, 0, Math.PI / 2); part(t, Cy(0.3, 0.3, 0.14, 12), '#ffffff', 0, 2.4, 0, Math.PI / 2); at(t, x, z, a); }
    for (let i = 0; i < 16; i++) part(props, new THREE.ConeGeometry(0.3, 0.8, 6), '#ff8a2a', Z.range.x - 12 + i * 1.6, groundH(Z.range.x - 12 + i * 1.6, Z.range.z - 6) + 0.4, Z.range.z - 6);
    // siege lines: trenches, sandbags and wrecks
    for (let i = 0; i < 14; i++) { const x = Z.siege.x - 18 + i * 2.8, z = Z.siege.z + Math.sin(i) * 4; part(props, B(2.4, 0.9, 1), toon('#8a7a58', 'cloth'), x, groundH(x, z) + 0.45, z, 0, Math.sin(i) * 0.3, 0); box(x, z, 1.2, 0.5); }
    for (let i = 0; i < 4; i++) { const w = makeTankModel('#3a3430'); w.scale.setScalar(0.7); at(w, Z.siege.x + Math.cos(i * 1.6) * 12, Z.siege.z + Math.sin(i * 1.6) * 12, i, -0.3); w.rotation.z = 0.25; solid(Z.siege.x + Math.cos(i * 1.6) * 12, Z.siege.z + Math.sin(i * 1.6) * 12, 1.6); }
    // tank yard: Drome banners and fuel tanks
    for (let i = 0; i < 6; i++) { const a = i * 1.05, x = Z.tankyard.x + Math.cos(a) * 16, z = Z.tankyard.z + Math.sin(a) * 16; part(props, Cy(1.2, 1.2, 3, 10), '#3a1416', x, groundH(x, z) + 1.5, z); part(props, B(1.6, 0.12, 0.12), glow('#ff2a3a'), x, groundH(x, z) + 2.4, z + 1.2); solid(x, z, 1.3); }
    // the sky: the asteroid belt all around you
    const N = 60, rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ map: TEX.stone, color: '#9a8a7a' }), N), dm = new THREE.Object3D();
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, r = 160 + (i % 7) * 25; dm.position.set(Math.cos(a) * r, 30 + (i % 5) * 18, Math.sin(a) * r + 20); dm.scale.setScalar(3 + (i % 4) * 4); dm.rotation.set(i, i * 2, i * 3); dm.updateMatrix(); rocks.setMatrixAt(i, dm.matrix); }
    levelGroup.add(rocks); levelAnims.push(t => { rocks.rotation.y = t * 0.004; });
    const sunL = new THREE.DirectionalLight(0xfff0d8, 0.9); sunL.position.set(-80, 120, 60); levelGroup.add(sunL);
    tufts(0);
  }
};
Object.assign(ENEMY, {
  tdrone: { name: 'Training Drone', make: makeTrainingDrone, fly: true, hp: 120, speed: 3.2, r: 0.6, hy: 1.4, xp: 45, cr: [6, 12], ranged: { dmg: 8, rate: 1.6, speed: 14, col: '#ffd36a', range: 18, keep: 10 }, drops: [['scrap', 0.4]] },
  siegebot: { rig: 'xr17', name: 'Siege Bot', make: makeSiegeBot, scale: 1.3, hp: 450, speed: 1.8, r: 0.8, hy: 1.5, xp: 160, cr: [20, 36], lob: { dmg: 40, rate: 2.4, speed: 13, range: 26, keep: 10, col: '#ff6a1a' }, drops: [['scrap', 0.7], ['ore', 0.4]] },
  dtank: { name: 'Drome Tank', make: () => makeTankModel('#3a1416'), scale: 0.75, hp: 600, speed: 2.4, r: 1.6, hy: 1.0, xp: 240, cr: [30, 50], ranged: { dmg: 46, rate: 2.2, speed: 22, col: '#ff2a3a', range: 30, keep: 14 }, drops: [['scrap', 0.9], ['ore', 0.6], ['circuit', 0.3]] },
  krag: { name: 'Warlord Krag', make: makeKragMech, scale: 1.2, hp: 9000, speed: 2.0, r: 1.6, hy: 2.4, xp: 9000, cr: [1500, 2200], boss: true, melee: { dmg: 90, rate: 1.6, reach: 3.6 }, lob: { dmg: 60, rate: 1.8, speed: 15, range: 30, keep: 8, col: '#ff2a3a' }, drops: [['kragcore', 1]] }
});
ITEMS.kragcore = { name: "Krag's Reactor Core", v: 0, col: '#ff2a3a', quest: true };
SPACE_BODIES.fort = { pos: V(-560, 10, 449).multiplyScalar(SPACE_SPREAD), r: 55, col: '#8a7a6a' };
PLANET_LOOK.fort = { seed: 61, ramp: [[0, '#2a2420'], [0.45, '#5a4a3a'], [0.62, '#8a7a68'], [0.8, '#b0a090']], grid: '#ff8a2a' };
PLANET_ORDER.splice(PLANET_ORDER.indexOf('mezar'), 0, 'fort');
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'fort') return shipUnlocked(); return _po(id); }; }
defQuest('a1', { ch: 'Fort Ironrock', title: "Learner's Permit", giver: 'torque', turnIn: 'torque', req: [],
  intro: ["Fresh meat! Welcome to vehicle training. Rule one: the car is a weapon. Rule two: so is the parking brake.", "Brix will issue you a Battle Car on the house when you finish. First, prove you can shoot. Clear the training drones on the Vehicle Range, east of the gate."],
  obj: [{ kind: 'kill', t: 'tdrone', n: 6, text: 'Shoot down training drones on the Vehicle Range', zone: 'range' }],
  outro: ["Not bad. Here's your Battle Car. Press V on any open planet to drive it. Try not to run me over. Again."], reward: { cr: 1500, xp: 6000, fn: () => { const V0 = vehS(); if (!V0.owned.includes('battlecar')) { V0.owned.push('battlecar'); V0.sel = 'battlecar'; } log('New vehicle: Battle Car. Press V (or Menu → Vehicle) to drive it.', 'loot'); } } });
defQuest('a2', { ch: 'Fort Ironrock', title: 'Heavy Metal', giver: 'hale', turnIn: 'hale', req: ['a1'],
  intro: ["Drome's Siege Bots are shelling our west wall. Every night. It's rude.", "Go to the Siege Lines and break them. Vehicles strongly recommended."],
  obj: [{ kind: 'kill', t: 'siegebot', n: 5, text: 'Destroy Siege Bots at the Siege Lines', zone: 'siege' }],
  outro: ["The wall's quiet. I almost miss it. No I don't. Volta wants to talk to you about upgrades."], reward: { cr: 3500, xp: 11000, items: { scrap: 15, ore: 8 } } });
defQuest('a3', { ch: 'Fort Ironrock', title: 'Tank Buster', giver: 'hale', turnIn: 'hale', req: ['a2'],
  intro: ["Drome has a whole tank yard to the north. Tanks. Plural. Somebody gave that man a budget.", "Bust five of them. If you don't have a tank yet, Brix sells them. Fight fire with fire. Or tank with tank."],
  obj: [{ kind: 'kill', t: 'dtank', n: 5, text: 'Destroy Drome Tanks in the tank yard', zone: 'tankyard' }],
  outro: ["Five tanks! The yard's a scrap yard now. Volta is weeping with joy. That's what that sound is."], reward: { cr: 6000, xp: 16000, items: { scrap: 25, ore: 12 } } });
defQuest('a4', { ch: 'Fort Ironrock', title: "Krag's Last Stand", giver: 'hale', turnIn: 'hale', req: ['a3'], main: true,
  intro: ["Warlord Krag. Drome's tank general. Rides a mech the size of a building. In a crater to the north-west.", "Bring me his reactor core and this rock is ours. Bring a big vehicle. Bring two."],
  obj: [{ kind: 'item', t: 'kragcore', n: 1, text: "Defeat Warlord Krag and take his reactor core", zone: 'kragpit' }],
  outro: ["Krag's core. Still warm. Fort Ironrock stands!", "His orders say Drome is building something in the sky above Earth. A floating city. We'll need eyes up there."], reward: { cr: 12000, xp: 30000, take: { kragcore: 1 }, cape: 'ironrock' } });
CAPES.ironrock = { name: 'Ironrock Cape', lvl: 1, flag: 'ironrock', col: '#3a4a2a', trim: '#ff8a2a' };
