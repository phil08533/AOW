// =================== THE OCEAN WORLD: Port Kelp, the sub, Kelp City, Bubble City, Ramick ===================
function makeJelly(col) {
  const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 0.4; g.add(b); col = col || '#c86aff';
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.55, emissive: new THREE.Color(col).multiplyScalar(0.4), side: THREE.DoubleSide, depthWrite: false })); b.add(dome);
  part(b, new THREE.SphereGeometry(0.2, 8, 6), glow('#ffffff'), 0, 0.18, 0);
  const tents = [];
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, t = new THREE.Group(); t.position.set(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35); b.add(t); tents.push(t); chain(t, [[0, 0, 0], [0.05, -0.5, 0], [-0.04, -1.0, 0.03], [0.03, -1.5, 0]], 0.025, glow(i % 2 ? col : '#4fffe0'), 0.008); }
  g.userData.anim = (tm) => { b.position.y = 0.4 + Math.sin(tm * 1.6) * 0.2; b.scale.y = 1 + Math.sin(tm * 3.2) * 0.12; tents.forEach((t, i) => { t.rotation.x = Math.sin(tm * 2 + i) * 0.25; t.rotation.z = Math.cos(tm * 1.7 + i) * 0.25; }); };
  return g;
}
function makeSnapjaw() {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  E(b, '#3a6a8a', 0, 0, 0, 0.32, 0.38, 0.7); E(b, '#d8d0b0', 0, -0.14, 0.05, 0.24, 0.2, 0.58);
  E(b, '#1a1a1e', 0, -0.02, 0.62, 0.26, 0.24, 0.12);
  for (let k = -2; k <= 2; k++) { part(b, new THREE.ConeGeometry(0.03, 0.12, 4), '#efe7d6', k * 0.08, 0.1, 0.68, Math.PI); part(b, new THREE.ConeGeometry(0.03, 0.12, 4), '#efe7d6', k * 0.08, -0.14, 0.68); }
  for (const s of [-1, 1]) { E(b, glow('#ffe14a'), 0.2 * s, 0.14, 0.42, 0.06, 0.06, 0.04); part(b, B(0.02, 0.3, 0.3), '#2a4a6a', 0.3 * s, -0.05, 0.05, 0, 0, 0.6 * s); }
  part(b, B(0.03, 0.4, 0.3), '#2a4a6a', 0, 0.4, -0.1, -0.3);
  const tail = new THREE.Group(); tail.position.z = -0.65; b.add(tail); part(tail, B(0.04, 0.6, 0.4), '#2a4a6a', 0, 0, -0.2);
  g.userData.anim = (t) => { tail.rotation.y = Math.sin(t * 8) * 0.5; b.position.y = Math.sin(t * 2) * 0.08; };
  return g;
}
function makeRamick() {
  const g = recolor(makeTrooper(), { '#6f7a3e': '#c8642a', '#4a5229': '#8a3a1e', '#c9b27c': '#2b2a2c' });
  part(g, B(0.3, 0.14, 0.06), '#1e1c22', 0, 1.77, 0.16); for (const s of [-1, 1]) part(g, B(0.08, 0.03, 0.02), glow('#ff6a1a'), 0.07 * s, 1.79, 0.19);
  part(g, B(0.08, 1.4, 0.03), '#cfd4dc', 0.1, 1.4, -0.3, 0, 0, 0.5); part(g, B(0.22, 0.06, 0.06), '#c9a43a', -0.13, 0.85, -0.3, 0, 0, 0.5);
  for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.06, 0.2, 4), '#2b2a2c', 0.35 * s, 1.72, 0, 0, 0, -0.5 * s);
  return g;
}
function makeKelp(h) {
  const g = new THREE.Group(), n = Math.ceil(h / 0.8), segs = [];
  let parent = g; for (let i = 0; i < n; i++) { const s = new THREE.Group(); s.position.y = i ? 0.8 : 0; parent.add(s); segs.push(s);
    part(s, Cy(0.05, 0.06, 0.8, 5), toon(i % 2 ? '#3f7a3a' : '#4f8a3a', 'leaves'), 0, 0.4, 0); part(s, B(0.3, 0.02, 0.12), toon('#5fa04a', 'leaves'), 0.15, 0.5, 0, 0, i, 0.4); parent = s; }
  g.userData.segs = segs; return g;
}
function makeDome(r, col) {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: col || '#9fe8ff', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })); g.add(dome);
  part(g, new THREE.TorusGeometry(r, 0.18, 6, 24), '#5d636c', 0, 0.1, 0, Math.PI / 2);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, Cy(0.08, 0.08, r * 1.2, 5), '#5d636c', Math.cos(a) * r * 0.7, r * 0.5, Math.sin(a) * r * 0.7, 0, 0, Math.cos(a) * 0.6); }
  part(g, new THREE.OctahedronGeometry(0.4, 0), glow('#ffe9a0'), 0, r * 0.95, 0);
  return g;
}
Object.assign(ITEMS, {
  pearl: { name: 'Black Pearl', v: 140, col: '#2a2a3a' }, jellygel: { name: 'Jelly Gel', v: 110, col: '#c86aff' }, swampmoss: { name: 'Swamp Moss', v: 90, col: '#4f6e2c' },
  shadowblade: { name: "Shadow's Blade", v: 0, col: '#ff6a1a', quest: true }, levieye: { name: "Leviathan's Eye", v: 0, col: '#4fffe0', quest: true },
  seabass: { name: 'Sea Bass', v: 80, col: '#5d7f99', fish: true }, glowEel: { name: 'Glow Eel', v: 170, col: '#4fffe0', fish: true }, pearlfish: { name: 'Pearlfish', v: 320, col: '#f4f8ff', fish: true }
});
FISH_TABLES.sea = [['boot', 6, 0], ['seabass', 55, 0.45], ['glowEel', 20, 0.7], ['pearlfish', 5, 0.88]];
MELEE.ramblade = { name: "Ramick's Greatsword", dmg: 560, rate: 0.65, reach: 3.4, req: 1, price: 0 };
GEAR.armblade = { name: 'Arm Sword', desc: '+30% melee damage', col: '#ff6a1a' };
Object.assign(ENEMY, {
  jelly: { name: 'Electric Jellyfish', make: () => makeJelly(), swim: true, hp: 300, speed: 1.6, r: 0.6, hy: 0.5, xp: 95, cr: [18, 30], melee: { dmg: 55, rate: 1.2, reach: 1.8 }, drops: [['jellygel', 0.55]] },
  snapjaw: { name: 'Snapjaw', make: makeSnapjaw, swim: true, scale: 1.3, hp: 380, speed: 4.6, r: 0.6, hy: 0.4, xp: 90, cr: [16, 28], melee: { dmg: 34, rate: 0.9, reach: 1.8 }, drops: [['pearl', 0.45]] },
  swampbrute: { rig: 'chunk', name: 'Swamp Brute', make: () => makeChunkMonster('#4f6e2c', '#2f4a26', '#7a8a4a', '#3a2a1e', false), scale: 1.3, hp: 620, speed: 2.0, r: 0.6, hy: 1.1, xp: 120, cr: [20, 36], melee: { dmg: 42, rate: 1.4, reach: 2.2 }, drops: [['swampmoss', 0.6]] },
  shadow: { rig: 'trooper', name: "Ramick's Shadow", make: () => { const g = makeRamick(); g.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.material = toon('#1e1c22'); }); return g; }, scale: 1.25, hp: 4200, speed: 3.2, r: 0.5, hy: 1.0, xp: 1800, cr: [300, 500], elite: true, melee: { dmg: 60, rate: 0.9, reach: 2.4 }, drops: [['shadowblade', 1]] },
  leviathan: { name: 'The Leviathan', make: () => { const g = makeGutworm('#2a5a8a'); g.rotation.x = 0; return g; }, swim: true, scale: 3.0, hp: 20000, speed: 2.2, r: 1.4, hy: 2.0, xp: 12000, cr: [2000, 2600], boss: true,
               lob: { dmg: 55, rate: 2.2, speed: 14, range: 26, keep: 9, col: '#4fffe0' }, melee: { dmg: 95, rate: 1.6, reach: 3.4 }, drops: [['levieye', 1], ['pearl', 1], ['jellygel', 1]] }
});
const PORT = [0, -28];
LEVELS.ocean = {
  id: 'ocean', name: 'Ocean World', tag: 'Kelp, bubbles, and something big below', lvls: 'Lv 24–34', size: 300, center: [0, 18], radius: 108, water: 0.5, sky: 'earth', weather: 'rain', hourOffset: 6, ocean: true,
  terrain: { a1: 3, f1: 0.04, a2: 2, f2: 0.08, a3: 1, f3: 0.16, base: -9, min: -18, edge: 14, step: 1.4 },
  palette: { grass: '#5fa04a', patch: '#4f8a3a', dirt: '#8a7a5a', sand: '#e8d8a8', wet: '#2a6a7a', rockA: '#6a7a80', rockB: '#4f5a62' },
  zones: [
    { id: 'port', name: 'Port Kelp', lvl: 'No fighting · docks', x: PORT[0], z: PORT[1], r: 14, fr: 15, col: '#d8c890', safe: true, h: 1.6 },
    { id: 'reef', name: 'Sunlit Reef', lvl: 'Lv 24–27 · underwater', x: 30, z: -4, r: 16, fr: 12, col: '#e0b080', h: -3.5 },
    { id: 'swamp', name: 'Swamp Jungle', lvl: 'Lv 26–30', x: -52, z: 24, r: 16, fr: 14, col: '#4f6e2c', h: 1.8 },
    { id: 'kelp', name: 'Kelp Forest', lvl: 'Lv 26–30 · underwater', x: 40, z: 44, r: 18, fr: 14, col: '#3f7a3a', h: -8 },
    { id: 'bubble', name: 'Bubble City', lvl: 'Safe · underwater', x: 0, z: 62, r: 14, fr: 13, col: '#c8b880', safe: true, h: -10 },
    { id: 'trench', name: 'The Trench', lvl: 'Lv 32–34 · boss', x: -34, z: 86, r: 14, fr: 12, col: '#1a2a3a', h: -16 }
  ],
  paths: [], river: [], pools: [], lava: [],
  safes: [{ x: PORT[0], z: PORT[1], r: 12 }, { x: 0, z: 62, r: 11 }], spawn: { x: 0, z: -21, yaw: 0 }, pad: { x: 0, z: -24 },
  menu: { x: 0, z: -10, r: 40, h: 12 }, npcBase: PORT,
  npcs: [
    { id: 'brine', name: 'Captain Brine', role: 'Harbor master', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#c58a64', '#e8e4dc', '#e8e4dc'), x: 4, z: 6, face: Math.PI, idle: ["The sea gives, the sea takes. Mostly takes. Mostly my boots.", "Subs are free for first-timers. The deep isn't."] },
    { id: 'shelly', name: 'Shelly', role: 'Dockside trader · buys anything', rig: null, make: () => { const g = makeCrab(); g.scale.setScalar(1.6); return g; }, x: -5, z: 6, shop: 'store', idle: ["Shelly buys! Shelly sells! Shelly pinches. Sorry. Reflex."] },
    { id: 'marlin', name: 'Old Marlin', role: 'Fish buyer', rig: 'civ', make: () => makeCivilian('#c8b884', '#3a5266', '#e0b892', '#cfcac0', '#3f7d7a'), x: 7, z: -2, face: -1.2, shop: 'fish', rods: [1, 2, 3], idle: ["Pearlfish only bite when it's raining. Which is always. Lucky you."] },
    { id: 'coral', name: 'Doc Coral', role: 'Healer', rig: 'civ', make: () => makeCivilian('#ff9a8a', '#3a5266', '#8fae6a', '#1e1a18', '#e8e4dc'), x: -7, z: -2, face: 1.2, heal: true, idle: ["Jellyfish stings? Saltwater. Snapjaw bite? Also saltwater. I just really like saltwater."] },
    { id: 'ramick', name: 'Ramick', role: 'Master of the Sword', rig: 'trooper', make: makeRamick, x: -48, z: 62, face: 0.6, idle: ["A sword doesn't need ammo. It needs a reason.", "I came to this ocean to be alone. Then everyone showed up. Fine. Train with me."] },
    { id: 'blub', name: 'Mayor Blub', role: 'Mayor of Bubble City', rig: null, make: () => { const g = makeJelly('#4fffe0'); g.scale.setScalar(1.4); g.position.y = 1.5; const w = new THREE.Group(); w.add(g); w.userData = g.userData; return w; }, x: 0, z: 90, idle: ["Welcome to Bubble City, where the air is fresh and the walls are see-through. Don't think about it.", "Please do not tap on the dome."] }
  ],
  spawns: [
    { zone: 'reef', type: 'snapjaw', n: 6, lv: [24, 27] },
    { zone: 'kelp', type: 'jelly', n: 8, lv: [26, 30] }, { zone: 'kelp', type: 'snapjaw', n: 3, lv: [27, 30] },
    { zone: 'swamp', type: 'swampbrute', n: 6, lv: [26, 30] }, { zone: 'swamp', type: 'shadow', n: 1, lv: [31, 31], at: [6, -6] },
    { zone: 'trench', type: 'jelly', n: 4, lv: [31, 33] }, { zone: 'trench', type: 'leviathan', n: 1, lv: [34, 34], at: [0, 0] }
  ],
  build() {
    const [px, pz] = PORT;
    // Port Kelp: plank docks, huts on stilts, a lighthouse (on solid ground at the back of the island)
    for (const [ox, oz, ry, col] of [[-8, -6, 0.3, '#3f7d7a'], [8, -6, -0.3, '#c8402f']]) { const h = new THREE.Group(); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(h, Cy(0.12, 0.12, 2.4, 5), toon('#6a4f34', 'wood'), sx * 1.2, 0.6, sz * 1.2); part(h, B(3, 2, 3), toon('#9a7650', 'wood'), 0, 2.4, 0); part(h, new THREE.ConeGeometry(2.4, 1.4, 4), toon(col), 0, 4.1, 0, 0, Math.PI / 4); part(h, B(0.8, 1.2, 0.05), '#2a1e14', 0, 2.2, 1.52); at(h, px + ox, pz + oz, ry); box(px + ox, pz + oz, 1.6, 1.6); }
    { const lh = new THREE.Group(); for (let k = 0; k < 5; k++) part(lh, Cy(1.0 - k * 0.1, 1.1 - k * 0.1, 2, 10), k % 2 ? '#c8402f' : '#efe7d6', 0, 1 + k * 2, 0); part(lh, Cy(0.7, 0.7, 1.2, 8), glow('#ffe9a0'), 0, 10.6, 0); part(lh, new THREE.ConeGeometry(0.9, 1, 8), '#2b2a2c', 0, 11.7, 0); at(lh, px + 2, pz - 12); solid(px + 2, pz - 12, 1.1);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(2, 18, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe9a0', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })); beam.position.set(px + 2, groundH(px + 2, pz - 12) + 10.6, pz - 12); levelGroup.add(beam); levelAnims.push(t => { beam.rotation.set(Math.PI / 2, 0, t * 0.8); beam.position.x = px + 2 + Math.sin(t * 0.8) * 9; beam.position.z = pz - 12 - Math.cos(t * 0.8) * 9; }); }
    for (const [ox, oz, ry, L] of [[0, 14, 0, 10], [-14, 2, -Math.PI / 2, 8], [14, 2, Math.PI / 2, 8]]) { const d = new THREE.Group(); for (let i = 0; i < L; i++) part(d, B(2.4, 0.14, 0.9), toon(i % 2 ? '#9a7650' : '#8a6a44', 'wood'), 0, 0, i * 0.95); for (let i = 0; i < L; i += 2) for (const s of [-1, 1]) part(d, Cy(0.1, 0.1, 3, 5), toon('#6a4f34', 'wood'), s * 1.1, -1.3, i * 0.95);
      const x = px + ox, z = pz + oz, y = Math.max(groundH(x, z), WATER_Y + 0.4); d.position.set(x, y, z); d.rotation.y = ry; props.add(d);
      const ux = Math.sin(ry), uz = Math.cos(ry); SURFACES.push({ x: x + ux * L * 0.475, z: z + uz * L * 0.475, ux, uz, hl: L * 0.5, hw: 1.2, y: y + 0.07 }); }
    INTERACTS.push({ x: px, z: pz + 18, r: 4, label: 'Sub dock: board the sub (X)', fn: () => toggleSub(true) });
    dropshipPad(0, -24, 0, 'Return to your ship');
    // islands: palms on the port, swamp trees on the jungle island
    for (let i = 0; i < 10; i += 2) { const a = i / 10 * Math.PI * 2, x = px + Math.cos(a) * 12.5, z = pz + Math.sin(a) * 12.5; if (groundH(x, z) > WATER_Y + 0.3 && Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) > 0.4) palm(x, z, 0.9 + (i % 3) * 0.15); }
    for (let i = 0; i < 26; i++) { const a = i * 2.4, d = 3 + (i * 5) % 14, x = Z.swamp.x + Math.cos(a) * d, z = Z.swamp.z + Math.sin(a) * d; if (groundH(x, z) < WATER_Y + 0.3) continue; if (i % 3) tree(x, z, 1.3 + (i % 4) * 0.2, '#2f4a26'); else cane(x, z, 3); }
    { const hut = new THREE.Group(); part(hut, B(3.6, 2.6, 3.6), toon('#6a4f34', 'wood'), 0, 1.3, 0); part(hut, new THREE.ConeGeometry(3, 1.8, 4), toon('#4f6e2c', 'leaves'), 0, 3.5, 0, 0, Math.PI / 4); for (let k = 0; k < 3; k++) part(hut, B(0.06, 1.4, 0.2), '#cfd4dc', -1.85, 1.5, -0.8 + k * 0.6, 0, 0, 0.2); at(hut, Z.swamp.x - 4, Z.swamp.z + 12, 0); box(Z.swamp.x - 4, Z.swamp.z + 12, 1.9, 1.9); }
    // underwater: reef corals, kelp forest, bubble city domes, the trench
    const corals = ['#ff6aa8', '#ffb347', '#c86aff', '#4fffe0', '#ff6a5a'];
    for (let i = 0; i < 30; i++) { const a = i * 2.1, d = 2 + (i * 7) % 15, x = Z.reef.x + Math.cos(a) * d, z = Z.reef.z + Math.sin(a) * d, c = new THREE.Group();
      for (let k = 0; k < 4; k++) part(c, Cy(0.08, 0.14, 0.8 + k * 0.3, 5), toon(corals[(i + k) % 5]), Math.sin(k * 2) * 0.3, 0.4 + k * 0.15, Math.cos(k * 2) * 0.3, Math.sin(k) * 0.4, 0, Math.cos(k) * 0.4);
      if (i % 4 === 0) E(c, toon(corals[i % 5]), 0, 0.3, 0, 0.6, 0.35, 0.6); at(c, x, z, a); }
    const kelps = [];
    for (let i = 0; i < 46; i++) { const a = i * 2.4, d = 2 + (i * 5) % 17, x = Z.kelp.x + Math.cos(a) * d, z = Z.kelp.z + Math.sin(a) * d, k = makeKelp(5 + (i % 4) * 1.4); k.position.set(x, groundH(x, z), z); levelGroup.add(k); kelps.push([k, i]); }
    levelAnims.push(t => { for (const [k, i] of kelps) k.userData.segs.forEach((s, j) => { s.rotation.z = Math.sin(t * 0.9 + i + j * 0.4) * 0.08; s.rotation.x = Math.cos(t * 0.7 + i * 0.5 + j * 0.3) * 0.06; }); });
    for (const [ox, oz, r, col] of [[0, 0, 7, '#9fe8ff'], [-9, 6, 4.5, '#c8f0ff'], [9, 6, 4.5, '#c8f0ff'], [0, 10, 3.5, '#ffe9a0']]) { const d = makeDome(r, col); at(d, Z.bubble.x + ox, Z.bubble.z + oz); levelAnims.push(t => { d.children[d.children.length - 1].rotation.y = t; }); }
    for (let i = 0; i < 20; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.06, 6, 4), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.5 })); const bx = Z.bubble.x + rand(-10, 10), bz = Z.bubble.z + rand(-10, 10), by0 = groundH(bx, bz); levelGroup.add(b); const ph = Math.random() * 20;
      levelAnims.push(t => { const y = ((t * 1.2 + ph) % 12); b.position.set(bx + Math.sin(t + ph) * 0.3, by0 + y, bz); b.visible = by0 + y < WATER_Y; }); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rock(Z.trench.x + Math.cos(a) * 12, Z.trench.z + Math.sin(a) * 12, 1.6 + (i % 3) * 0.8, '#1a2a3a'); }
    for (let i = 0; i < 8; i++) { const v = new THREE.Group(); part(v, new THREE.ConeGeometry(0.8, 1.6, 6), toon('#2b2a2c', 'stone'), 0, 0.8, 0); part(v, Cy(0.3, 0.3, 0.1, 6), glow('#4fffe0'), 0, 1.62, 0); at(v, Z.trench.x + rand(-8, 8), Z.trench.z + rand(-8, 8)); }
    tufts(260, null, (x, z) => groundH(x, z) < WATER_Y + 0.4);
  }
};
// ---------------- the sub ----------------
const vmSub = new THREE.Group(); camera.add(vmSub); vmSub.visible = false;
{ const ring = part(vmSub, new THREE.TorusGeometry(0.62, 0.06, 6, 24), '#c9a43a', 0, 0, -0.55); ring.scale.y = 0.62;
  for (const s of [-1, 1]) part(vmSub, B(0.06, 0.8, 0.06), '#5d636c', 0.55 * s, 0, -0.55); part(vmSub, B(1.3, 0.08, 0.3), '#3a3d44', 0, -0.4, -0.5);
  part(vmSub, B(0.2, 0.05, 0.03), glow('#6fdc5a'), -0.3, -0.36, -0.42); part(vmSub, B(0.2, 0.05, 0.03), glow('#ffd23a'), 0.3, -0.36, -0.42);
  vmSub.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); }
function toggleSub(fromDock) {
  if (!LEVEL.ocean || state !== 'play' || dlgOpen) return false;
  if (!S.inSub) { if (!fromDock && !player.wet && Math.hypot(player.pos.x - PORT[0], player.pos.z - (PORT[1] + 18)) > 6) { log('Board the sub at the Port Kelp sub dock, or call it from the water.'); return true; } S.inSub = true; SFX.door(); log('Sub engaged. W moves where you look · Space rises · C dives · X surfaces and exits.', 'loot'); burp('land'); return true; }
  if (player.pos.y < WATER_Y - 1.7) { log('Surface first to leave the sub (hold Space).'); return true; }
  S.inSub = false; SFX.door(); return true;
}
const _toggleBike = toggleBike;
toggleBike = function () { if (LEVEL.ocean && toggleSub(false)) return; _toggleBike(); };
const _dir = V(0, 0, 0), _eu = new THREE.Euler(0, 0, 0, 'YXZ');
function subStep(dt, mx, mz, sprint) {
  _eu.set(player.pitch, player.yaw, 0); _dir.set(0, 0, -1).applyEuler(_eu);
  const sp = 7 * (sprint ? 1.7 : 1), rgt = V(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  player.pos.addScaledVector(_dir, mz * sp * dt).addScaledVector(rgt, mx * sp * dt);
  if (keys.Space || jetHeld) player.pos.y += 4 * dt; if (keys.KeyC || keys.ControlLeft) player.pos.y -= 4 * dt;
  collide(player.pos, 0.9, false);
  const fl = groundH(player.pos.x, player.pos.z) + 0.4, top = WATER_Y - 1.45; player.pos.y = clamp(player.pos.y, Math.min(fl, top), top);
  if (fl > top + 0.2) { S.inSub = false; log('You beached the sub. It swims back to the dock on its own.'); }
  player.vy = 0; player.onGround = true; player.wet = false;
  SFX.engine(0.25 + Math.min(1, Math.hypot(mx, mz)) * 0.5, 0.2 + Math.hypot(mx, mz) * 0.4);
}
// underwater look
const UW_COL = new THREE.Color('#0a3a5a');
function underwaterEnv() {
  if (!LEVEL || !LEVEL.ocean || camera.position.y >= WATER_Y) return;
  const depth = clamp((WATER_Y - camera.position.y) / 18, 0, 1);
  HORIZON.copy(UW_COL).multiplyScalar(1 - depth * 0.6); scene.fog.color.copy(HORIZON);
  // the retro low-res pass shows the fog colour as-is, so converting it to linear there turned the deep water near-black and
  // left a black band at the horizon; the HD styles do need the linear colour
  if (RSTYLE !== 'retro') scene.fog.color.convertSRGBToLinear();
  scene.fog.near = 1; scene.fog.far = 42 - depth * 14;
  hemi.intensity = 0.7 - depth * 0.3; hemi.color.set('#8fe3ff'); rain.visible = false; fireflies.visible = false;
  // below the surface there is no sky: no stars, clouds, sun or moon, and the sky dome takes the water's colour (it ignores fog)
  stars.material.opacity = 0; clouds.visible = false; sunDisc.visible = false; moonDisc.visible = false; skyRing.visible = false;
  skyMat.uniforms.hor.value.copy(HORIZON); skyMat.uniforms.mid.value.copy(HORIZON); skyMat.uniforms.top.value.copy(UW_TOP).multiplyScalar(1 - depth * 0.6);
}
const UW_TOP = new THREE.Color('#1f6a8a');
// The ocean gets its own water. It is seen from both sides (from below when you swim). It is more opaque, and it writes
// depth: the shared water doesn't, so Bubble City's glass domes, jellyfish and other see-through things far below were
// drawn on top of the surface whenever they sorted after it, and showed through it as pale shapes. It also skips the
// retro affine/vertex-snap shader, which tore the big 4 m water quads into jagged dark triangles.
// Other worlds keep the shared one-sided WATER_MAT.
const OCEAN_WATER_MAT = new THREE.MeshLambertMaterial({ map: TEX.water, color: new THREE.Color('#5aa6cc').convertSRGBToLinear(), transparent: true, opacity: 0.9, depthWrite: true, side: THREE.DoubleSide });
{ const _mw = makeWater; makeWater = function () { const g = _mw.apply(this, arguments); if (LEVEL && LEVEL.ocean) g.children.forEach(m => { if (m.material === WATER_MAT) m.material = OCEAN_WATER_MAT; }); return g; }; }
SPACE_BODIES.ocean.survey = 'Ocean World';
PLANET_ORDER.splice(PLANET_ORDER.indexOf('robot'), 0, 'ocean');
// ---------------- quests: the Ocean World ----------------
defQuest('o1', { ch: 'Ocean World', title: 'Salt and Subs', giver: 'brine', turnIn: 'brine', req: [],
  intro: ["A new face! Welcome to Port Kelp. Population: me, a crab, and a guy who says he's a fish.", "Everything good on this world is underwater. So: free sub, first ride. It's at the end of the north dock.", "Take her down to the Sunlit Reef, east of here. Look around. Try not to get eaten."],
  obj: [{ kind: 'reach', zone: 'reef', planet: 'ocean', n: 1, text: 'Take the sub down to the Sunlit Reef' }],
  outro: ["You came back! With all your limbs! Most first-timers come back with fewer limbs.", "There's a city down there, you know. Bubble City. And a sword master on the jungle island who won't stop yelling at trees."], reward: { cr: 1200, xp: 6000 } });
defQuest('o2', { ch: 'Ocean World', title: 'Jelly Jam', giver: 'brine', turnIn: 'brine', req: ['o1'],
  intro: ["The Kelp Forest is full of electric jellyfish. One touch and you're a lightbulb.", "Clear out six. Shoot them from a distance. Seriously. Distance."],
  obj: [{ kind: 'kill', t: 'jelly', n: 6, text: 'Destroy electric jellyfish in the Kelp Forest', zone: 'kelp' }],
  outro: ["Six! And you're not glowing! Here, take this. You earned it, sparky."], reward: { cr: 2200, xp: 8000, items: { jellygel: 2 } } });
defQuest('o3', { ch: 'Ocean World', title: 'Pearls for the Mayor', giver: 'blub', turnIn: 'blub', req: ['o1'],
  intro: ["Welcome to Bubble City! I'm Mayor Blub. Yes, I'm a jellyfish. No, I won't sting you. Probably.", "The snapjaws on the reef swallowed our city's pearls. All of them. Bring me five and the city will love you forever. Or for a week."],
  obj: [{ kind: 'item', t: 'pearl', n: 5, text: 'Take back Black Pearls from snapjaws', zone: 'reef' }],
  outro: ["Our pearls! The city is saved! Mostly the decorative part of the city, but still."], reward: { cr: 3000, xp: 9000, take: { pearl: 5 } } });
defQuest('o4', { ch: 'Ocean World', title: 'The Sword Master', giver: 'ramick', turnIn: 'ramick', req: ['o1'], main: true,
  intro: ["You want to learn the sword? Then fight what I couldn't. My shadow walks this jungle. Every bad thing I ever did, wearing my face.", "Beat it. Bring me its blade. Then I'll teach you."],
  obj: [{ kind: 'item', t: 'shadowblade', n: 1, text: "Defeat Ramick's Shadow in the Swamp Jungle", zone: 'swamp' }],
  outro: ["...You did it. Huh. I've been trying for nine years.", "Take my greatsword, and the Arm Sword. Your melee will hit like a falling moon."], reward: { cr: 2500, xp: 11000, take: { shadowblade: 1 }, gear: 'armblade', melee: 'ramblade' } });
defQuest('o5', { ch: 'Ocean World', title: 'The Deep', giver: 'blub', turnIn: 'blub', req: ['o3', 'o4'], main: true,
  intro: ["Something big lives in the Trench, far northwest. The Leviathan. It wears the Setting Sun's red mark, and it's been eating our domes.", "We need a hero. Or a very brave snack. Ideally a hero."],
  obj: [{ kind: 'item', t: 'levieye', n: 1, text: 'Defeat the Leviathan in the Trench', zone: 'trench' }],
  outro: ["The Leviathan is gone! Bubble City is safe! Free bubbles for everyone!", "You've freed four worlds from that red mark now. The Setting Sun must be very, very annoyed with you."], reward: { cr: 7000, xp: 18000, take: { levieye: 1 } } });
// ---------------- swimming, air, and the walkable domes of Bubble City ----------------
const DOMES = () => [[0, 0, 7], [-9, 6, 4.5], [9, 6, 4.5], [0, 10, 3.5]].map(([ox, oz, r]) => [Z.bubble.x + ox, Z.bubble.z + oz, r]);
function inDome(p) { if (!LEVEL || !LEVEL.ocean || !Z.bubble) return false; p = p || player.pos; for (const [x, z, r] of DOMES()) if (Math.hypot(p.x - x, p.z - z) < r - 0.4) return true; return false; }
function swimStep(dt, mx, mz, sprint) {
  _eu.set(player.pitch, player.yaw, 0); _dir.set(0, 0, -1).applyEuler(_eu);
  const sp = 3.8 * (sprint ? 1.5 : 1), rgt = V(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  player.pos.addScaledVector(_dir, mz * sp * dt).addScaledVector(rgt, mx * sp * dt);
  if (keys.Space || jetHeld) player.pos.y += 3 * dt; if (keys.KeyC || keys.ControlLeft) player.pos.y -= 3 * dt;
  collide(player.pos, 0.35, false);
  const fl = groundH(player.pos.x, player.pos.z), top = WATER_Y - 1.15; player.pos.y = clamp(player.pos.y, Math.min(fl, top), top);
  player.vy = 0; player.onGround = true; player.wet = true;
}
const swimHere = () => LEVEL && LEVEL.ocean && !S.inSub && player.pos.y < WATER_Y + 0.1 && groundH(player.pos.x, player.pos.z) < WATER_Y - 2.2 && !inDome() && !(floorAt(player.pos.x, player.pos.z) > WATER_Y && player.pos.y > WATER_Y - 1.6);
let airEl = null;
function updateAir(dt) {
  if (!airEl) { airEl = document.createElement('div'); airEl.className = 'win'; airEl.id = 'air'; $('hud').appendChild(airEl); }
  const under = LEVEL && LEVEL.ocean && camera.position.y < WATER_Y - 0.1 && !S.inSub && !inDome();
  if (player.air == null) player.air = 45;
  if (under) { player.air -= dt; if (player.air <= 0) { player.air = 0; hurt(12 * dt, false); } } else player.air = Math.min(45, player.air + dt * 20);
  airEl.hidden = !(LEVEL && LEVEL.ocean) || player.air >= 45 && !under;
  if (!airEl.hidden) airEl.innerHTML = `<b>AIR</b> <span class="bar"><i style="transform:scaleX(${player.air / 45});background:${player.air < 10 ? '#ff3b2a' : '#8fe3ff'}"></i></span>${inDome() ? ' dome air' : ''}`;
}
LEVELS.ocean.npcs.push(
  { id: 'finn', name: 'Finn', role: 'Pearl Exchange · buys anything', rig: 'civ', make: () => makeCivilian('#3f7d7a', '#2c2a28', '#9fe8ff', '#1e1a18', '#4fffe0'), x: 3, z: 92, face: Math.PI, shop: 'store', idle: ["Welcome to the Pearl Exchange! Everything's wet but the prices are dry."] },
  { id: 'nurse', name: 'Nurse Gill', role: 'Dome clinic · heals', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#3a5266', '#8fae6a', '#1e1a18', '#c8402f'), x: -3, z: 92, face: Math.PI, heal: true, idle: ["Breathe! The dome makes air. Out there it doesn't. Keep that in mind."] });
// dome floors so the city feels like a place
{ const orig = LEVELS.ocean.build; LEVELS.ocean.build = function () { orig.call(this); for (const [x, z, r] of DOMES()) { const f = new THREE.Mesh(new THREE.CircleGeometry(r - 0.2, 20).rotateX(-Math.PI / 2), toon('#d8c890', 'stone')); f.position.set(x, groundH(x, z) + 0.06, z); props.add(f); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = Z.bubble.x + Math.cos(a) * 5, z = Z.bubble.z + Math.sin(a) * 5; const lamp = new THREE.Group(); part(lamp, Cy(0.06, 0.08, 2, 5), '#5d636c', 0, 1, 0); part(lamp, new THREE.SphereGeometry(0.22, 8, 6), glow('#ffe9a0'), 0, 2.1, 0); at(lamp, x, z); solid(x, z, 0.2); }
 }; }
