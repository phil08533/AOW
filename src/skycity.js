// =================== EARTH SKY: floating islands, the Floating City, the Air Base and Drome's real base ===================
function makeDroid() {
  const g = new THREE.Group(), w = '#e8eef2', dk = '#2b2a2c';
  for (const s of [-1, 1]) { part(g, B(0.14, 0.7, 0.16), dk, 0.12 * s, 0.35, 0); part(g, B(0.16, 0.08, 0.26), w, 0.12 * s, 0.04, 0.04); part(g, B(0.12, 0.55, 0.12), w, 0.32 * s, 1.15, 0); }
  part(g, B(0.46, 0.6, 0.28), w, 0, 1.1, 0); part(g, B(0.3, 0.1, 0.02), glow('#4fd2ff'), 0, 1.2, 0.15);
  part(g, new THREE.SphereGeometry(0.16, 10, 8), w, 0, 1.6, 0); part(g, B(0.16, 0.05, 0.04), glow('#ff2a3a'), 0, 1.62, 0.14);
  part(g, B(0.08, 0.08, 0.4), dk, 0.32, 0.9, 0.2);
  return g;
}
function makeSkyDroid() {
  const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 1.6; g.add(b);
  part(b, new THREE.SphereGeometry(0.35, 10, 8), '#e8eef2', 0, 0, 0); part(b, Cy(0.12, 0.12, 0.06, 10), glow('#ff2a3a'), 0, 0, 0.33, Math.PI / 2);
  const ring = part(b, new THREE.TorusGeometry(0.52, 0.04, 4, 16), '#3a3d44', 0, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) part(b, B(0.08, 0.08, 0.5), '#3a3d44', 0.45 * s, -0.1, 0.1);
  g.userData.anim = t => { b.position.y = 1.6 + Math.sin(t * 2.4) * 0.25; ring.rotation.z = t * 3; };
  return g;
}
function makeEliteGuard() { const g = makeDroid(); recolor(g, { '#e8eef2': '#1e1c22', '#2b2a2c': '#b3262c' }); for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.05, 0.22, 4), '#b3262c', 0.24 * s, 1.5, 0); part(g, B(0.04, 0.8, 0.02), glow('#ff2a3a'), -0.36, 1.0, 0.25); return g; }
function makeDromePrime() { const g = makeDrome(); for (const s of [-1, 1]) chain(g, [[0.2 * s, 1.9, 0], [0.4 * s, 2.2, -0.1], [0.45 * s, 2.5, -0.25]], 0.06, '#b3262c', 0.015); part(g, new THREE.TorusGeometry(0.6, 0.05, 4, 20), glow('#ff6a1a'), 0, 1.6, -0.35); return g; }
const ISL = { airbase: [0, -20, 26], city: [66, 34, 30], forest: [-66, 34, 28], camp: [0, 62, 14], dbase: [0, 124, 30] };
const SKY_BRIDGES = [['airbase', 'city'], ['airbase', 'forest'], ['airbase', 'camp'], ['camp', 'dbase'], ['city', 'camp'], ['forest', 'camp']];
function islSeg(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], k = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1); return Math.hypot(x - a[0] - dx * k, z - a[1] - dz * k); }
LEVELS.skycity = {
  id: 'skycity', name: 'Earth Sky', tag: 'Floating islands above Earth', lvls: 'Lv 30–40', size: 340, center: [0, 52], radius: 150, water: -99, weather: 'none', hourOffset: 3,
  terrain: { a1: 1.0, f1: 0.06, a2: 0.5, f2: 0.13, a3: 0.2, f3: 0.25, base: 1.2, min: 0, edge: 10, step: 2, noTerrace: true },
  palette: { grass: '#6fae4a', patch: '#5a9a3a', dirt: '#8a7a5a', sand: '#d8c890', wet: '#4a6a3a', rockA: '#9a8a78', rockB: '#7a6a58' },
  carve: (x, z, h) => {
    let best = -42;
    for (const k in ISL) { const [ix, iz, r] = ISL[k], d = Math.hypot(x - ix, z - iz); if (d < r) best = Math.max(best, h * 0.6 + 2 - smooth(d, r - 4, r) * 3); else if (d < r + 7) best = Math.max(best, 2 - (d - r) * 6); }
    for (const [a, b] of SKY_BRIDGES) { const d = islSeg(x, z, ISL[a], ISL[b]); if (d < 3) best = Math.max(best, 2.1); else if (d < 5) best = Math.max(best, 2.1 - (d - 3) * 20); }
    if (Math.hypot(x - ISL.airbase[0], z - ISL.airbase[1]) < 20 || Math.hypot(x - ISL.dbase[0], z - ISL.dbase[1]) < 24) best = Math.min(best, 2.4);
    { const rz = z - ISL.airbase[1], rx = x - (ISL.airbase[0] - 12) - Math.sin(0.1) * rz; if (Math.abs(rz) < 18 && Math.abs(rx) < 6.5) best = 2.4; } // flat apron under the runway
    return best; },
  zones: [
    { id: 'airbase', name: 'Sky Air Base', lvl: 'Safe · Earth Defense Force', x: ISL.airbase[0], z: ISL.airbase[1], r: 22, fr: 23, col: '#9aa1aa', safe: true, h: 0 },
    { id: 'city', name: 'The Floating City', lvl: 'Lv 30–34 · droids', x: ISL.city[0], z: ISL.city[1], r: 26, col: '#cfe6ff', h: 0 },
    { id: 'forest', name: 'Deep Sky Forest', lvl: 'Lv 32–36 · bugs', x: ISL.forest[0], z: ISL.forest[1], r: 24, col: '#3a6a2a', h: 0 },
    { id: 'camp', name: 'Rebel Base Camp', lvl: 'Safe', x: ISL.camp[0], z: ISL.camp[1], r: 12, fr: 13, col: '#8a6a44', safe: true, h: 0 },
    { id: 'dbase', name: "Drome's Sky Fortress", lvl: 'Lv 36–40 · final boss', x: ISL.dbase[0], z: ISL.dbase[1], r: 26, fr: 20, col: '#2a1416', h: 0 }
  ],
  paths: [], river: [], pools: [], lava: [],
  safes: [{ x: ISL.airbase[0], z: ISL.airbase[1], r: 21 }, { x: ISL.camp[0], z: ISL.camp[1], r: 11 }], spawn: { x: 0, z: -30, yaw: Math.PI }, pad: { x: -13, z: -36 }, menu: { x: 0, z: 30, r: 70, h: 30 }, npcBase: [ISL.airbase[0], ISL.airbase[1]],
  npcs: [
    { id: 'skye', name: 'Captain Skye', role: 'Air Base commander', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#3b4f7a', '#c9b27c': '#e8eef2' }), x: 0, z: -8, face: Math.PI, idle: ["Welcome to the top of the world. Don't look down. Seriously, there's nothing down there but 40 kilometers of 'nope'.", "Drome built a city in the clouds while we were looking at the ground. Embarrassing for everyone."] },
    { id: 'aero', name: 'Aero Quartermaster', role: 'Sky arsenal', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#e0b892', '#e8e4dc', '#4fd2ff'), x: 8, z: -14, face: -1.2, shop: 'guns', guns: ['g90', 'g100'], melee: ['silent', 'twinmaster'], idle: ["Long guns for long falls."] },
    { id: 'gale', name: 'Medic Gale', role: 'Heals', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#2c2a28', '#8a5a3a', '#1e1a18', '#c8402f'), x: -8, z: -14, face: 1.2, heal: true, idle: ["Altitude sickness? Drome sickness? Same cure: lie down, stop being shot."] },
    { id: 'wren', name: 'Old Wren', role: 'Rebel leader', rig: 'civ', make: () => makeCivilian('#5a6a3a', '#3d3a36', '#c58a64', '#e8e4dc', '#c8402f'), x: 0, z: 78, face: Math.PI, idle: ["I was a cloud farmer. Then Drome came. Now I farm revenge. Better harvest."] }
  ],
  spawns: [
    { zone: 'city', type: 'droid', n: 7, lv: [30, 33] }, { zone: 'city', type: 'skydroid', n: 4, lv: [31, 34] },
    { zone: 'forest', type: 'bughybrid', n: 6, lv: [32, 35] }, { zone: 'forest', type: 'bugbug', n: 5, lv: [32, 34] }, { zone: 'forest', type: 'nomine', n: 3, lv: [34, 36] },
    { zone: 'dbase', type: 'eliteguard', n: 6, lv: [36, 39] }, { zone: 'dbase', type: 'skydroid', n: 3, lv: [37, 39] }, { zone: 'dbase', type: 'dromeprime', n: 1, lv: [40, 40], at: [0, 14] }
  ],
  build() {
    // a sea of clouds below the islands
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const cx = cv.getContext('2d'); cx.fillStyle = '#dfe9f5'; cx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 160; i++) { const x = Math.random() * 256, y = Math.random() * 256, r = 10 + Math.random() * 30, gr = cx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(x - r, y - r, r * 2, r * 2); }
    const ct = new THREE.CanvasTexture(cv); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(8, 8);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshBasicMaterial({ map: ct, fog: false })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -26, 50); levelGroup.add(sea); levelAnims.push(t => { ct.offset.set(t * 0.003, t * 0.002); });
    for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, r = 60 + Math.random() * 220, c = new THREE.Mesh(new THREE.SphereGeometry(4 + Math.random() * 6, 7, 5), new THREE.MeshLambertMaterial({ color: '#ffffff' })); c.scale.y = 0.4; c.position.set(Math.cos(a) * r, -12 - Math.random() * 10, 50 + Math.sin(a) * r); levelGroup.add(c); }
    // island undersides: rocky cones hanging below each island
    for (const k in ISL) { const [ix, iz, r] = ISL[k]; part(props, new THREE.ConeGeometry(r * 0.95, r * 1.3, 9), toon('#7a6a58', 'stone'), ix, -4 - r * 0.65, iz, Math.PI); for (let i = 0; i < 5; i++) { const a = i * 1.3; part(props, new THREE.ConeGeometry(r * 0.25, r * 0.7, 6), toon('#6a5a48', 'stone'), ix + Math.cos(a) * r * 0.6, -5 - r * 0.4, iz + Math.sin(a) * r * 0.6, Math.PI); } }
    // bridges: plank decks with glowing rails
    for (const [a, b] of SKY_BRIDGES) { const A = ISL[a], Bv = ISL[b], dx = Bv[0] - A[0], dz = Bv[1] - A[1], L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
      for (let s = A[2] - 2; s < L - Bv[2] + 2; s += 2) { const x = A[0] + dx * s / L, z = A[1] + dz * s / L; if (Math.max(groundH(x - 2, z), groundH(x + 2, z), groundH(x, z - 2), groundH(x, z + 2)) > 2.2) continue; part(props, B(5.6, 0.3, 1.8), toon('#8a6a44', 'wood'), x, Math.max(2.3, groundH(x, z) + 0.2), z, 0, ang, 0); if (Math.round(s) % 6 === 0) for (const sd of [-1, 1]) part(props, B(0.2, 1.1, 0.2), glow('#4fd2ff'), x + Math.cos(ang) * 2.8 * sd, Math.max(2.3, groundH(x, z) + 0.2) + 0.7, z - Math.sin(ang) * 2.8 * sd); } }
    // Air Base: runway, hangars, a parked jet, landing pad
    const [ax, az] = ISL.airbase; part(props, B(10, 0.1, 34), '#3a3d44', ax - 12, 2.47, az, 0, 0.1, 0); for (let i = 0; i < 8; i++) part(props, B(0.4, 0.12, 2), '#ffd36a', ax - 12 + Math.sin(0.1) * (i * 4 - 14), 2.5, az + i * 4 - 14, 0, 0.1, 0);
    for (const [ox, oz] of [[12, -6], [12, 6]]) { const t = makeCityBlock(6, 4.5, 6, '#9aa1aa', '#4fd2ff'); at(t, ax + ox, az + oz); box(ax + ox, az + oz, 3, 3); }
    const jet = new THREE.Group(); part(jet, B(1.2, 0.8, 7), '#9aa1aa', 0, 1, 0); part(jet, B(8, 0.15, 2.2), '#9aa1aa', 0, 1, -0.5); part(jet, B(0.15, 1.6, 1.6), '#9aa1aa', 0, 2, -3); part(jet, B(0.8, 0.4, 1.4), glow('#4fd2ff'), 0, 1.5, 1.8); at(jet, ax - 12, az + 8, 0.1); solid(ax - 12, az + 8, 2);
    const flag = new THREE.Group(); part(flag, Cy(0.08, 0.08, 7, 6), '#cfd3d8', 0, 3.5, 0); part(flag, B(2.2, 1.3, 0.05), toon('#3b4f7a', 'cloth'), 1.1, 6.2, 0); at(flag, ax + 6, az - 18);
    dropshipPad(-13, -36, 0, 'Return to your ship');
    // the Floating City: white towers, sky walkways, neon
    const [cx0, cz0] = ISL.city;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.2, d = 10 + (i % 3) * 5, x = cx0 + Math.cos(a) * d, z = cz0 + Math.sin(a) * d, h = 8 + (i * 7 % 13); const t = makeCityBlock(4, h, 4, i % 2 ? '#e8eef2' : '#cfe6ff', i % 3 ? '#4fd2ff' : '#ff2a3a'); at(t, x, z); box(x, z, 2, 2); }
    const spire = new THREE.Group(); part(spire, Cy(1.2, 2.4, 22, 8), '#e8eef2', 0, 11, 0); part(spire, new THREE.ConeGeometry(1.2, 6, 8), '#cfe6ff', 0, 25, 0); part(spire, new THREE.TorusGeometry(3, 0.25, 6, 20), glow('#4fd2ff'), 0, 16, 0, Math.PI / 2); at(spire, cx0, cz0); solid(cx0, cz0, 2.4);
    // the deep sky forest: giant mushroom-trees and hive pods
    const [fx0, fz0] = ISL.forest;
    for (let i = 0; i < 18; i++) { const a = i * 2.39, d = 4 + (i * 13 % 20), x = fx0 + Math.cos(a) * d, z = fz0 + Math.sin(a) * d, h = 6 + (i % 4) * 2, t = new THREE.Group(); part(t, Cy(0.5, 0.8, h, 7), toon('#5a4030', 'wood'), 0, h / 2, 0); E(t, toon(i % 3 ? '#3a7a2a' : '#5aa04a', 'leaves'), 0, h + 1, 0, 3.4, 1.6, 3.4); if (i % 4 === 0) E(t, '#c9a46a', 1.2, h - 1.5, 0, 0.7, 1.0, 0.7); at(t, x, z, a); solid(x, z, 0.8); }
    // rebel camp: tents and a campfire
    const [kx, kz] = ISL.camp;
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.6, x = kx + Math.cos(a) * 7, z = kz + Math.sin(a) * 7; part(props, new THREE.ConeGeometry(2, 2.4, 4), toon(i % 2 ? '#8a6a44' : '#5a6a3a', 'cloth'), x, groundH(x, z) + 1.2, z, 0, a, 0); solid(x, z, 1.6); }
    part(props, new THREE.ConeGeometry(0.5, 1, 5), glow('#ff9a3c'), kx + 3, groundH(kx + 3, kz) + 0.5, kz);
    // Drome's Sky Fortress: black walls, red light, the setting-sun gate
    const [dx0, dz0] = ISL.dbase;
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.22) continue; const x = dx0 + Math.cos(a) * 24, z = dz0 + Math.sin(a) * 24; part(props, B(5.6, 6, 1.2), '#1e1c22', x, groundH(x, z) + 3, z, 0, -a + Math.PI / 2, 0); if (i % 4 === 0) { part(props, B(2, 10, 2), '#2a1416', x, groundH(x, z) + 5, z); part(props, B(0.8, 0.4, 0.8), glow('#ff2a3a'), x, groundH(x, z) + 10.3, z); } }
    RINGS.push({ x: dx0, z: dz0, r: 24, gate: -Math.PI / 2, half: 3.2 });
    const sun = new THREE.Group(); part(sun, new THREE.TorusGeometry(6, 0.6, 6, 24, Math.PI), glow('#ff6a1a'), 0, 8, 0); part(sun, new THREE.CircleGeometry(5, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#b3262c', side: THREE.DoubleSide }), 0, 8, -0.1); for (const s of [-1, 1]) part(sun, B(1.4, 9, 1.4), '#1e1c22', 6.4 * s, 4.5, 0); at(sun, dx0, dz0 - 24); solid(dx0 - 6.4, dz0 - 24, 1); solid(dx0 + 6.4, dz0 - 24, 1);
    const keep = new THREE.Group(); part(keep, B(12, 9, 8), '#1e1c22', 0, 4.5, 0); part(keep, B(4, 16, 4), '#2a1416', 0, 8, 0); part(keep, new THREE.ConeGeometry(2.8, 5, 4), '#b3262c', 0, 18.5, 0, 0, Math.PI / 4, 0); at(keep, dx0, dz0 + 10); box(dx0, dz0 + 10, 6, 4);
    // falling off an island puts you back at the Air Base
    levelAnims.push(() => {
      if (LEVEL.id !== 'skycity' || state !== 'play') return;
      if (player.pos.y < -14 && player.alive) { const L = LEVEL.spawn; player.pos.set(L.x, groundH(L.x, L.z) + 0.5, L.z); player.vy = 0; if (typeof VH !== 'undefined' && VH.on) vehPark(true); player.hp = Math.max(1, player.hp - maxHp() * 0.2); toast('YOU FELL', 'The Air Base fished you out of the clouds', 2.5); SFX.hurt(); burp && burp('fall'); }
      for (const e of enemies) if (!e.dead && e.obj.position.y < -14) { e.dead = 0.001; e.obj.visible = false; e.respawn = 20; }
    });
  }
};
Object.assign(ENEMY, {
  droid: { name: 'Sentinel Droid', make: makeDroid, hp: 300, speed: 2.6, r: 0.45, hy: 0.9, xp: 120, cr: [20, 34], ranged: { dmg: 26, rate: 1.1, speed: 22, col: '#ff2a3a', range: 24, keep: 11 }, drops: [['circuit', 0.4], ['scrap', 0.5]] },
  skydroid: { name: 'Sky Droid', make: makeSkyDroid, fly: true, hp: 220, speed: 3.8, r: 0.5, hy: 1.6, xp: 120, cr: [18, 30], ranged: { dmg: 22, rate: 0.9, speed: 24, col: '#ff2a3a', range: 22, keep: 12 }, drops: [['circuit', 0.5]] },
  eliteguard: { name: 'Drome Elite', make: makeEliteGuard, scale: 1.15, hp: 380, speed: 3.0, r: 0.5, hy: 1.0, xp: 170, cr: [28, 44], melee: { dmg: 40, rate: 1.0, reach: 2.4 }, ranged: { dmg: 28, rate: 1.4, speed: 22, col: '#ff2a3a', range: 20, keep: 6 }, drops: [['circuit', 0.4], ['crystal', 0.4]] },
  dromeprime: { rig: 'drome', name: 'Drome, Lord of the Setting Sun', make: makeDromePrime, scale: 2.0, hp: 6000, speed: 2.6, r: 0.9, hy: 1.4, xp: 20000, cr: [3000, 4000], boss: true, ranged: { dmg: 44, rate: 1.0, speed: 22, col: '#ff2a3a', range: 26, keep: 8 }, melee: { dmg: 80, rate: 1.3, reach: 3.2 }, lob: { dmg: 60, rate: 2.6, speed: 15, range: 28, keep: 8, col: '#ff6a1a' }, drops: [['sunsigil', 1]] }
});
ITEMS.sunsigil = { name: 'Sigil of the Setting Sun', v: 0, col: '#ff6a1a', quest: true };
ITEMS.droidchip = { name: 'Droid Command Chip', v: 0, col: '#4fd2ff', quest: true };
ENEMY.droid.drops.push(['droidchip', 0.45]); ENEMY.skydroid.drops.push(['droidchip', 0.3]);
SPACE_BODIES.skycity = { pos: SPACE_BODIES.earth.pos.clone().add(V(60, 250, 160)), r: 30, col: '#e8f0ff', clouds: true };
PLANET_LOOK.skycity = { seed: 71, ramp: [[0, '#cfe6ff'], [0.5, '#e8f0ff'], [0.7, '#6fae4a'], [0.85, '#ffffff']], grid: '#ff2a3a' };
PLANET_ORDER.splice(PLANET_ORDER.indexOf('earth') + 1, 0, 'skycity');
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'skycity') return shipUnlocked() && (qDone('a4') || !!qState('k1') || S.lvl >= 32); return _po(id); }; }
defQuest('k1', { ch: 'Chapter 6 · Earth Sky', title: 'Above the Clouds', giver: 'skye', turnIn: 'skye', req: [], main: true,
  intro: ["You're the one who beat Krag? Good. We need people who don't panic.", "Drome's droids hold the Floating City east of here. Clear them out and bring me their command chips. Let's see who's giving the orders."],
  obj: [{ kind: 'item', t: 'droidchip', n: 5, text: 'Take Droid Command Chips in the Floating City', zone: 'city' }],
  outro: ["These chips all point one place: the fortress at the far end of the islands. Drome is HERE. Not on Earth. Above it. The whole time.", "Old Wren runs the rebels at the base camp on the middle island. Talk to her."], reward: { cr: 6000, xp: 24000, take: { droidchip: 5 } } });
defQuest('k2', { ch: 'Chapter 6 · Earth Sky', title: 'Bug Problem, Sky Edition', giver: 'wren', turnIn: 'wren', req: ['k1'],
  intro: ["Drome seeded the Deep Sky Forest with his marked bugs. They raid our camp every night.", "Thin them out, west island. Then we talk about his fortress."],
  obj: [{ kind: 'kill', t: 'bughybrid', n: 6, text: 'Thin out the marked bugs in the Deep Sky Forest', zone: 'forest' }],
  outro: ["Quiet nights. I'd forgotten what those sound like. Mostly crickets. Normal crickets."], reward: { cr: 6000, xp: 26000 } });
defQuest('k3', { ch: 'Chapter 6 · Earth Sky', title: 'Through the Gate', giver: 'wren', turnIn: 'wren', req: ['k2'], main: true,
  intro: ["His fortress has a gate shaped like a setting sun. Subtle man.", "Break his elite guard. Then we'll know if the big man himself is home."],
  obj: [{ kind: 'kill', t: 'eliteguard', n: 6, text: "Defeat Drome's elites at the Sky Fortress", zone: 'dbase' }],
  outro: ["He's home. I can feel it in my teeth. Go finish this, kid."], reward: { cr: 8000, xp: 30000 } });
defQuest('k4', { ch: 'Chapter 6 · Earth Sky', title: 'The Setting Sun', giver: 'skye', turnIn: 'skye', req: ['k3'], main: true,
  intro: ["This is it. Drome, in his own house. Bring back his sigil and it's over.", "Earth Defense Force is behind you. Well. Below you. Way below. Good luck."],
  obj: [{ kind: 'item', t: 'sunsigil', n: 1, text: 'Defeat Drome, Lord of the Setting Sun', zone: 'dbase' }],
  outro: ["The Sigil of the Setting Sun. You did it. Drome is finished.", "...but this sigil is a map too. It points past Zarlich, into the dark. Into Vector.", "Rest up. Whatever Drome was working FOR is still out there."], reward: { cr: 20000, xp: 60000, take: { sunsigil: 1 }, cape: 'sunslayer' } });
CAPES.sunslayer = { name: 'Sunslayer Cape', lvl: 1, flag: 'sunslayer', col: '#1e1c22', trim: '#ff6a1a' };

// ---- Earth Sky atmosphere: cloud banks drifting past the islands, a high-altitude haze, softer light, and torches for the night ----
const SKYFX = { torches: [], lights: [], clouds: [], seas: [], puffs: [] };
{ const _b = LEVELS.skycity.build; LEVELS.skycity.build = function () { const r = _b.apply(this, arguments);
  SKYFX.torches = []; SKYFX.lights = []; SKYFX.clouds = []; SKYFX.seas = []; SKYFX.puffs = [];
  // tone down the blinding white cloud sea and the puffy cloud balls
  levelGroup.traverse(o => { if (!o.isMesh || !o.material || !o.material.color) return; if (o.geometry && o.geometry.type === 'PlaneGeometry' && o.position.y < -20) { SKYFX.seas.push(o); } else if (o.geometry && o.geometry.type === 'SphereGeometry' && o.position.y < -8 && o.material.color.getHex() === 0xffffff) { o.material = new THREE.MeshBasicMaterial({ color: '#d4dce6' }); SKYFX.puffs.push(o); } });
  // soft cloud sprites at and below island level so you look down through cloud
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); for (let i = 0; i < 7; i++) { const x = 30 + Math.random() * 68, y = 44 + Math.random() * 40, rr = 22 + Math.random() * 20, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const tex = new THREE.CanvasTexture(cv);
  for (let i = 0; i < 150; i++) { const m = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.6, depthWrite: false, color: '#e6ecf4' }), s = new THREE.Sprite(m), low = i < 70, high = i >= 120;
    const a = Math.random() * 6.28, rad = low ? 30 + Math.random() * 170 : 40 + Math.random() * 150; s.position.set(Math.cos(a) * rad, low ? -18 + Math.random() * 14 : high ? 22 + Math.random() * 30 : -2 + Math.random() * 12, 50 + Math.sin(a) * rad);
    // keep the island-level banks off the islands themselves
    if (!low && !high) { let on = false; for (const k in ISL) if (Math.hypot(s.position.x - ISL[k][0], s.position.z - ISL[k][1]) < ISL[k][2] + 8) on = true; if (on) { s.position.y = -14; } }
    const sz = low ? 50 + Math.random() * 50 : high ? 45 + Math.random() * 45 : 24 + Math.random() * 24; s.scale.set(sz, sz * 0.45, 1); s.userData.v = 0.6 + Math.random() * 1.2; s.userData.base = m.opacity; levelGroup.add(s); SKYFX.clouds.push(s); }
  // torches: bridge ends and island rims
  const spots = []; for (const [a, b] of SKY_BRIDGES) { const A = ISL[a], Bv = ISL[b], dx = Bv[0] - A[0], dz = Bv[1] - A[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L; for (const [P, s] of [[A, A[2] - 1], [Bv, -(Bv[2] - 1)]]) { const base = s > 0 ? A : Bv, d = Math.abs(s), sg = s > 0 ? 1 : -1; for (const sd of [-1, 1]) spots.push([base[0] + ux * d * sg + uz * 3.6 * sd, base[1] + uz * d * sg - ux * 3.6 * sd]); } }
  for (const k in ISL) { const [ix, iz, rr] = ISL[k]; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + 0.3; spots.push([ix + Math.cos(a) * (rr - 3), iz + Math.sin(a) * (rr - 3)]); } }
  const flameM = () => new THREE.MeshBasicMaterial({ color: '#ffb040', transparent: true, opacity: 0.95 });
  spots.forEach(([x, z], i) => { const y = groundH(x, z); if (y < 0) return; const t = new THREE.Group(); part(t, Cy(0.07, 0.1, 1.6, 6), toon('#4a3a2a', 'wood'), 0, 0.8, 0); part(t, Cy(0.16, 0.1, 0.22, 6), '#2a2622', 0, 1.65, 0);
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 6), flameM()); f.position.y = 1.95; t.add(f); t.position.set(x, y, z); levelGroup.add(t); solid(x, z, 0.2); SKYFX.torches.push(f);
    if (i % 3 === 0 && SKYFX.lights.length < 10) { const L = new THREE.PointLight('#ff9a3a', 0, 9, 1.6); L.position.set(x, y + 2.1, z); levelGroup.add(L); SKYFX.lights.push(L); } });
  levelAnims.push(t => { const n = ENV.night || 0;
    SKYFX.torches.forEach((f, i) => { const k = 0.8 + Math.sin(t * 13 + i * 2.1) * 0.12 + Math.sin(t * 29 + i) * 0.08; f.scale.set(1, k * (0.6 + n * 0.6), 1); f.material.opacity = 0.35 + n * 0.6; });
    SKYFX.lights.forEach((L, i) => { L.intensity = n * (1.2 + Math.sin(t * 11 + i * 1.7) * 0.25 + Math.sin(t * 23 + i) * 0.15); });
    for (const c of SKYFX.clouds) { c.position.x += c.userData.v * 0.02; if (c.position.x > 230) c.position.x = -230; c.material.opacity = c.userData.base * (1 - n * 0.45); c.material.color.setRGB(0.84 - n * 0.62, 0.87 - n * 0.62, 0.92 - n * 0.56); }
    for (const o of SKYFX.seas) o.material.color.setRGB(0.66 - n * 0.62, 0.71 - n * 0.65, 0.78 - n * 0.68); for (const o of SKYFX.puffs) o.material.color.setRGB(0.8 - n * 0.64, 0.83 - n * 0.66, 0.88 - n * 0.66); });
  return r; }; }
// haze and softer light up here (the global HD pass pushes fog far away and boosts the sun, which made Earth Sky glaring)
{ const _ue = updateEnv; updateEnv = function (a, b) { _ue(a, b); if (!LEVEL || LEVEL.id !== 'skycity') return; scene.fog.near = 26; scene.fog.far = 165 - (ENV.night || 0) * 40; scene.fog.color.lerp(new THREE.Color('#c8d4e2').convertSRGBToLinear(), 0.35 * (1 - (ENV.night || 0))); sun.intensity *= 0.72; hemi.intensity *= 0.85; }; }
