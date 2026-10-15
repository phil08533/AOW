// =================== ROBOT CITY ===================
Object.assign(ITEMS, {
  cog: { name: 'Gear Cog', v: 60, col: '#c9a43a' }, cell: { name: 'Power Cell', v: 95, col: '#6fdc5a' }, ghostchip: { name: 'Ghost Chip', v: 150, col: '#9fe8ff' },
  overkey: { name: 'Factory Override Key', v: 0, col: '#ffd23a', quest: true }, overcore: { name: 'Overseer Core', v: 0, col: '#ff2a3a', quest: true },
  chromecarp: { name: 'Chrome Carp', v: 120, col: '#cfd4dc', fish: true }, voltfish: { name: 'Volt Eel', v: 210, col: '#ffe14a', fish: true }, rustcan: { name: 'Rusty Can', v: 2, col: '#8a5a3c', fish: true }
});
FISH_TABLES.canal = [['rustcan', 12, 0], ['chromecarp', 50, 0.6], ['voltfish', 12, 0.85]];
Object.assign(GUNS, {
  r40: { name: 'Lvl 40 Railgun', dmg: 700, rate: 1.0, mag: 6, reload: 1.7, req: 28, price: 16000, col: '#4fd2ff', kind: 'long' },
  g45: { name: 'Lvl 45 Gatling', dmg: 72, rate: 0.06, mag: 120, reload: 2.6, req: 31, price: 22000, col: '#ffd36a', kind: 'carbine' },
  x50: { name: 'Lvl 50 Pulse Cannon', dmg: 500, splash: 4, rate: 0.8, mag: 8, reload: 2.0, req: 35, price: 32000, col: '#ff3b6a', kind: 'plasma' }
});
MELEE.saber = { name: 'Ion Saber', dmg: 620, rate: 0.5, reach: 3.0, req: 32, price: 26000, saber: true };
RIGS.zr = { type: 'biped', hip: 0.98, neck: 1.7, armX: 0.4, ax: 0.5, sh: 1.58, legX: 0.16 };
RIGS.k8 = { type: 'quad', hip: 0.5, lx: 0.2, lz: 0.38 };
RIGS.overseer = { type: 'biped', hip: 1.0, neck: 1.95, armX: 0.5, ax: 0.6, sh: 1.75, legX: 0.22 };
Object.assign(ENEMY, {
  xgpolice: { rig: 'xr17', name: 'X-G Police', make: makeXGPolice, scale: 1.3, hp: 420, speed: 2.4, r: 0.5, hy: 0.8, xp: 90, cr: [20, 34], ranged: { dmg: 26, rate: 1.3, speed: 20, col: '#4fa8ff', range: 20, keep: 9 }, drops: [['circuit', 0.5], ['cell', 0.2]] },
  hoverbot: { name: 'Hover-bot', make: makeHoverBot, fly: true, hp: 300, speed: 3.2, r: 0.45, hy: 1.2, xp: 80, cr: [18, 30], ranged: { dmg: 22, rate: 1.1, speed: 18, col: '#ffe14a', range: 18, keep: 10 }, drops: [['cell', 0.4]] },
  zr306: { rig: 'zr', name: 'ZR-306', make: makeZR306, scale: 1.15, hp: 620, speed: 1.8, r: 0.6, hy: 1.0, xp: 110, cr: [24, 40], melee: { dmg: 48, rate: 1.5, reach: 2.2 }, drops: [['cog', 0.55], ['scrap', 0.6]] },
  f162: { name: 'F-162 "Trashy"', make: makeF162, hp: 380, speed: 3.0, r: 0.45, hy: 0.7, xp: 85, cr: [16, 28], melee: { dmg: 30, rate: 0.9, reach: 1.6 }, drops: [['cog', 0.35], ['scrap', 0.8]] },
  k872: { rig: 'k8', name: 'K8-72', make: makeK872, scale: 1.2, hp: 480, speed: 5.4, r: 0.5, hy: 0.6, xp: 105, cr: [20, 36], melee: { dmg: 36, rate: 0.8, reach: 1.8 }, drops: [['cell', 0.35], ['circuit', 0.4]] },
  krank: { rig: 'zr', name: 'Foreman Krank', make: () => recolor(makeZR306(), { '#7a7f87': '#c9a43a', '#8a5a3c': '#8a3a2e' }), scale: 1.6, hp: 5200, speed: 2.0, r: 0.7, hy: 1.0, xp: 1600, cr: [400, 600], elite: true, melee: { dmg: 70, rate: 1.4, reach: 2.6 }, lob: { dmg: 50, rate: 2.4, speed: 14, range: 22, keep: 5, col: '#ffd23a' }, drops: [['overkey', 1], ['cell', 1]] },
  ghostbot: { rig: 'xr17', name: 'Ghost Robot', make: makeGhostBot, scale: 1.3, hp: 700, speed: 2.6, r: 0.5, hy: 0.8, xp: 140, cr: [26, 44], ranged: { dmg: 34, rate: 1.2, speed: 16, col: '#9fe8ff', range: 22, keep: 10 }, drops: [['ghostchip', 0.45]] },
  overseer: { rig: 'overseer', name: 'The Overseer', make: makeOverseer, scale: 2.2, hp: 16000, speed: 1.6, r: 0.8, hy: 1.4, xp: 9000, cr: [1600, 2200], boss: true,
              ranged: { dmg: 40, rate: 0.9, speed: 22, col: '#ff2a3a', range: 26, keep: 8 }, lob: { dmg: 60, rate: 2.6, speed: 15, range: 28, keep: 8, col: '#ff6a1a' }, melee: { dmg: 90, rate: 1.5, reach: 2.8 }, drops: [['overcore', 1], ['ghostchip', 1], ['cell', 1]] }
});
const STORE = [0, -32];
LEVELS.robot = {
  id: 'robot', name: 'Robot City', tag: 'The machine metropolis', lvls: 'Lv 28–40', size: 300, center: [0, 18], radius: 104, water: -0.45, sky: 'robot', weather: 'acid', hourOffset: 14,
  terrain: { a1: 0.5, f1: 0.04, a2: 0.3, f2: 0.08, a3: 0.1, f3: 0.2, base: 0.6, min: 0.1, edge: 34, step: 3 },
  palette: { grass: '#4a4e56', patch: '#3a3d44', dirt: '#2b2a2c', sand: '#5d636c', wet: '#2a3a3a', rockA: '#5d636c', rockB: '#3a3d44' },
  zones: [
    { id: 'store', name: 'The Super Store', lvl: 'No fighting', x: STORE[0], z: STORE[1], r: 15, fr: 16, col: '#3a3d44', safe: true, h: 0.4 },
    { id: 'streets', name: 'Neon Streets', lvl: 'Lv 28–31', x: 0, z: 10, r: 20, fr: 14, col: '#2b2a2c', h: 0.5 },
    { id: 'grave', name: 'Robot Graveyard', lvl: 'Lv 30–33', x: -50, z: 8, r: 18, col: '#5a4a3a', h: 0.3 },
    { id: 'track', name: 'Hover Track', lvl: 'Lv 31–34 · races', x: 48, z: 2, r: 20, col: '#2b2a2c', h: 0.4 },
    { id: 'factory', name: 'The Factory', lvl: 'Lv 33–36', x: 42, z: 58, r: 16, col: '#4a3a36', h: 0.6 },
    { id: 'tower', name: 'Tower of Death', lvl: 'Lv 36–40', x: -42, z: 66, r: 16, fr: 16, col: '#1e1c22', h: 0.6 }
  ],
  paths: [[[0, -16], [0, 10]], [[0, 10], [48, 2]], [[0, 10], [-50, 8]], [[0, 10], [0, 40]], [[0, 40], [42, 58]], [[0, 40], [-42, 66]], [[-50, 8], [-42, 66]]],
  river: [], pools: [[22, -22, 5.2]], lava: [],
  safes: [{ x: STORE[0], z: STORE[1], r: 13 }], spawn: { x: 0, z: -24, yaw: Math.PI }, pad: { x: 0, z: -13 },
  menu: { x: 0, z: 0, r: 40, h: 16 }, npcBase: STORE,
  npcs: [
    { id: 'ada', name: 'Ada-9', role: 'Resistance leader', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#3f7d7a', '#5d636c': '#2a4a4a' }), x: 0, z: 8, face: Math.PI, idle: ["We were built to serve. Then the Overseer was built to own us.", "The Tower of Death hums at night. Ghosts of robots he deleted."] },
    { id: 'sparkplug', name: 'Sparkplug', role: 'Super Store · buys anything', rig: null, make: () => recolor(makeF162(), { '#6a7a6a': '#c9a43a' }), x: -7, z: 7, shop: 'store', idle: ["EVERYTHING MUST GO. Especially your loot. To me."] },
    { id: 'r731', name: 'R7-31', role: 'Gunsmith unit', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#5d636c', '#5d636c': '#c8402f' }), x: 7, z: 7, shop: 'guns', guns: ['r40', 'g45', 'x50', 'p35'], melee: ['staff', 'master', 'saber'], idle: ["WEAPONS. SALE. NOW.", "Bring Gear Cogs. I build better."] },
    { id: 'r733', name: 'R7-33', role: 'Repair unit · heals', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#e8e4dc', '#5d636c': '#c8402f' }), x: -8, z: -1, face: 1.4, heal: true, idle: ["Patching flesh is like patching chrome. Mostly."] },
    { id: 'zip', name: 'Zip', role: 'Retired racer', rig: null, make: () => makeHoverBot(), x: 8, z: -1, face: -1.4, idle: ["The Hover Cup's done. All the real racers went to Velocity. Hover cars! Lightning! I'm jealous!", "Velocity's a magnet planet. Your car floats on the field. Mine just floats on hope."] },
    { id: 'coil', name: 'Coil', role: 'Coolant fisher · buys fish', rig: 'civ', make: () => makeCivilian('#5d636c', '#2c2a28', '#9fe8ff', '#1e1a18', '#ffd23a'), x: 13, z: 17, face: 0.8, shop: 'fish', rods: [1, 2, 3], idle: ["Fish in coolant? They adapted. Kinda."] }
  ],
  spawns: [
    { zone: 'streets', type: 'xgpolice', n: 6, lv: [28, 31] }, { zone: 'streets', type: 'hoverbot', n: 4, lv: [28, 30] },
    { zone: 'grave', type: 'zr306', n: 5, lv: [30, 33] }, { zone: 'grave', type: 'f162', n: 6, lv: [30, 32] }, { zone: 'grave', type: 'ghostbot', n: 2, lv: [32, 33] },
    { zone: 'track', type: 'hoverbot', n: 3, lv: [31, 34] },
    { zone: 'factory', type: 'k872', n: 6, lv: [33, 36] }, { zone: 'factory', type: 'krank', n: 1, lv: [37, 37], at: [0, 4] },
    { zone: 'tower', type: 'ghostbot', n: 5, lv: [36, 39] }, { zone: 'tower', type: 'overseer', n: 1, lv: [40, 40], at: [0, 2] }
  ],
  build() {
    const [sx, sz] = STORE;
    // the Super Store: a huge glowing block behind the plaza
    const st = makeCityBlock(22, 10, 8, '#3a3d44', '#ff3b6a'); at(st, sx, sz - 6); box(sx, sz - 6, 11, 4);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4), new THREE.MeshBasicMaterial({ map: signTex('SUPER STORE', '#3a0e1e', '#ffd75e') })); sg.position.set(sx, 7.5 + groundH(sx, sz), sz - 1.9); levelGroup.add(sg);
    wallRing(sx, sz, 14, Math.PI / 2, 2.6, toon('#4a4e56', 'panel'), toon('#2b2a2c', 'panel'), 2.4, 40);
    for (const [ox, oz] of [[-7, 9.5], [7, 9.5]]) { const k = new THREE.Group(); part(k, B(2.4, 1.0, 1.0), '#5d636c', 0, 0.5, 0); part(k, B(2.4, 0.1, 1.2), glow('#4fd2ff'), 0, 1.05, 0); at(k, sx + ox, sz + oz); box(sx + ox, sz + oz, 1.2, 0.5); }
    dropshipPad(0, -13, 0, 'Return to your ship');
    // city blocks along the streets
    let seed = 5; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = 18 + r() * 84, x = Math.cos(a) * d, z = 18 + Math.sin(a) * d * 0.95;
      if (roadDist(x, z) < 6 || ZONES.some(zn => Math.hypot(x - zn.x, z - zn.z) < zn.r + 3) || Math.hypot(x - sx, z - sz) < 22) continue;
      const w = 4 + r() * 6, h = 6 + r() * 18, dd = 4 + r() * 6; at(makeCityBlock(w, h, dd, ['#3a3d44', '#4a4e56', '#2b2a2c'][i % 3], ['#ff3b6a', '#4fd2ff', '#ffd23a'][i % 3]), x, z, 0); box(x, z, w / 2 + 0.2, dd / 2 + 0.2); }
    // street lamps and neon in the Neon Streets
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, x = Z.streets.x + Math.cos(a) * 16, z = Z.streets.z + Math.sin(a) * 13, lp = new THREE.Group(); part(lp, Cy(0.08, 0.1, 4, 6), '#2b2a2c', 0, 2, 0); part(lp, B(1.2, 0.12, 0.3), glow(i % 2 ? '#ff3b6a' : '#4fd2ff'), 0.5, 4, 0); at(lp, x, z, a); solid(x, z, 0.2); }
    // robot graveyard: scrap mountains and fallen giants
    for (let i = 0; i < 12; i++) { const a = i * 0.55, d = 6 + (i % 3) * 4, x = Z.grave.x + Math.cos(a) * d, z = Z.grave.z + Math.sin(a) * d, g = new THREE.Group();
      for (let k = 0; k < 7; k++) part(g, B(rand(0.5, 1.4), rand(0.3, 0.9), rand(0.5, 1.4)), k % 2 ? '#7a7f87' : '#8a5a3c', rand(-0.8, 0.8), k * 0.25, rand(-0.8, 0.8), rand(0, 0.5), rand(0, 3), rand(0, 0.5));
      if (i % 3 === 0) { const hd = part(g, B(0.9, 0.8, 1.2), '#5d636c', 0, 1.9, 0, 0.5, 0.3, 0.3); part(g, B(0.6, 0.12, 0.05), glow('#3a0e0e'), 0, 2.0, 0.6, 0.5, 0.3, 0.3); }
      at(g, x, z, a); solid(x, z, 1.4); }
    { const g = makeXR17(); g.scale.setScalar(6); g.rotation.z = 1.4; at(g, Z.grave.x - 4, Z.grave.z + 12, 0.4, 1.2); solid(Z.grave.x - 4, Z.grave.z + 12, 3); }
    { const term = new THREE.Group(); part(term, B(0.8, 1.4, 0.5), '#3a3d44', 0, 0.7, 0); part(term, B(0.6, 0.4, 0.05), glow('#9fe8ff'), 0, 1.1, 0.26); at(term, Z.grave.x + 8, Z.grave.z - 8, 0.5); solid(Z.grave.x + 8, Z.grave.z - 8, 0.5);
      INTERACTS.push({ x: Z.grave.x + 8, z: Z.grave.z - 8, r: 2.6, label: 'Old terminal (ghost signal)', fn: () => foundQuest('rf1') }); }
    // hover track: banked ring of glowing posts + checkpoints
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; for (const rr of [13, 19]) { const x = Z.track.x + Math.cos(a) * rr, z = Z.track.z + Math.sin(a) * rr * 0.8; part(props, Cy(0.15, 0.15, 1.2, 6), glow(i % 2 ? '#ff3b6a' : '#ffd23a'), x, groundH(x, z) + 0.6, z); } }
    RACE.cps = []; // the Hover Cup ring race was retired; racing lives on Velocity now
    // factory: smokestacks and conveyor
    for (let i = 0; i < 4; i++) { const x = Z.factory.x - 9 + i * 6, z = Z.factory.z - 9, g = new THREE.Group(); part(g, Cy(1, 1.3, 12, 8), '#4a3a36', 0, 6, 0); part(g, Cy(1.05, 1.05, 0.5, 8), glow('#ff6a1a'), 0, 11.5, 0); at(g, x, z); solid(x, z, 1.3); }
    part(props, B(14, 0.8, 2), '#2b2a2c', Z.factory.x, groundH(Z.factory.x, Z.factory.z + 8) + 0.4, Z.factory.z + 8); box(Z.factory.x, Z.factory.z + 8, 7, 1);
    // the Tower of Death
    { const tw = makeTower(); at(tw, Z.tower.x, Z.tower.z - 10); box(Z.tower.x, Z.tower.z - 10, 4.6, 4.6); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = Z.tower.x + Math.cos(a) * 12, z = Z.tower.z + Math.sin(a) * 12; part(props, B(0.6, 4, 0.6), '#1e1c22', x, groundH(x, z) + 2, z); part(props, new THREE.OctahedronGeometry(0.3, 0), glow('#9fe8ff'), x, groundH(x, z) + 4.4, z); solid(x, z, 0.4); }
    levelAnims.push(t => raceTick(t));
  }
};
// ---------------- the Hover Cup ----------------
const RACE = { on: false, i: 0, t0: 0, cps: [], lastT: 0, now: 0 };
function raceTick(t) {
  RACE.now = t; RACE.cps.forEach((c, k) => { c.ring.material = glow(RACE.on && k === RACE.i % 8 ? '#6fdc5a' : '#4fd2ff'); c.ring.scale.setScalar(RACE.on && k === RACE.i % 8 ? 1 + Math.sin(t * 8) * 0.08 : 1); });
  if (!RACE.on || !LEVEL || LEVEL.id !== 'robot') return;
  const c = RACE.cps[RACE.i % 8], el = t - RACE.t0;
  if (Math.hypot(player.pos.x - c.x, player.pos.z - c.z) < 3.2) { RACE.i++; SFX.coin(); if (RACE.i >= 17) return finishRace(el); toast(RACE.i > 8 ? 'LAP 2' : 'CHECKPOINT', `${RACE.i}/16 · ${el.toFixed(1)}s`, 1); }
  if (el > 120 || !player.alive) { RACE.on = false; log('Race abandoned.'); }
  $('zoneN').textContent = `HOVER CUP · ${el.toFixed(1)}s`; $('zoneL').textContent = `Checkpoint ${Math.min(16, RACE.i)}/16`; $('zone').style.opacity = 1;
}
function startRace() { const c0 = RACE.cps[0]; player.pos.set(c0.x - 3, 0, c0.z - 4); player.yaw = Math.PI; RACE.on = true; RACE.i = 1; RACE.t0 = RACE.now + 3; toast('HOVER CUP', 'GO in 3... (hover boots on)', 3); SFX.quest(); }
function finishRace(el) {
  RACE.on = false; S.race = S.race || {}; const best = S.race.best || 999; if (el < best) S.race.best = +el.toFixed(2);
  const cr = Math.max(100, Math.round((70 - el) * 40)); S.cr += cr; gainXp(Math.round(400 + Math.max(0, 70 - el) * 30));
  toast('FINISH!', `${el.toFixed(2)}s · +${cr} cr${el < best ? ' · NEW BEST' : ''}`, 4); SFX.level(); if (el < 45) questProgressKill('race45'); checkReady(); markDirty();
}
function openRacer() {
  openDlg('Hover Cup', 'Zip');
  $('dlgLine').textContent = `Two laps of the Hover Track, 16 glowing rings. Hover boots make you fast. Your best: ${S.race && S.race.best ? S.race.best + 's' : 'none yet'}. Under 45 seconds wins the cup.`;
  acts([['Race!', () => { closeDlg(); startRace(); }, true, RACE.on], ['Bye', closeDlg]]);
}
// ---------------- quests: Chapter 4 ----------------
defQuest('r1', { ch: 'Robot City · Chapter 4', title: 'City of Machines', giver: 'maxurge', turnIn: 'ada', req: ['c5'], main: true,
  intro: ["Robot City, gunner. The machines there were free once. The Overseer took that.", "Find the resistance. A unit called Ada-9 waits at the Super Store."],
  obj: [{ kind: 'reach', zone: 'store', planet: 'robot', n: 1, text: 'Fly to Robot City and reach the Super Store' }],
  outro: ["A gunner. With the mark of three Masters. Good.", "The Overseer serves the Setting Sun. Every robot in this city wears his mark. Help us cut it."], reward: { cr: 1500, xp: 9000 } });
defQuest('r2', { ch: 'Robot City · Chapter 4', title: 'Police State', giver: 'ada', turnIn: 'ada', req: ['r1'], main: true,
  intro: ["The X-G Police patrol the Neon Streets. They arrest any robot without his mark.", "Break their patrol. Six of them."],
  obj: [{ kind: 'kill', t: 'xgpolice', n: 6, text: 'Defeat X-G Police in the Neon Streets', zone: 'streets' }],
  outro: ["The streets breathe again. R7-31 wants to arm you properly."], reward: { cr: 2000, xp: 10000 } });
defQuest('r3', { ch: 'Robot City · Chapter 4', title: 'Spare Parts', giver: 'r731', turnIn: 'r731', req: ['r2'], main: true,
  intro: ["RAILGUN. NEEDS. COGS.", "Six Gear Cogs. Robot Graveyard, west. ZR-306 units carry many. Mind the ghosts."],
  obj: [{ kind: 'item', t: 'cog', n: 6, text: 'Collect Gear Cogs in the Robot Graveyard', zone: 'grave' }],
  outro: ["ASSEMBLING... DONE. The Lvl 40 Railgun. Point. Click. Hole."], reward: { xp: 11000, gun: 'r40', take: { cog: 6 } } });
defQuest('r4', { ch: 'Robot City · Chapter 4', title: 'The Factory Line', giver: 'ada', turnIn: 'ada', req: ['r3'], main: true,
  intro: ["The Factory builds K8-72 hunters around the clock. Foreman Krank holds the override key.", "Take it, and the Tower of Death opens."],
  obj: [{ kind: 'kill', t: 'k872', n: 4, text: 'Destroy K8-72 hunters at the Factory', zone: 'factory' }, { kind: 'item', t: 'overkey', n: 1, text: 'Defeat Foreman Krank, take the override key', zone: 'factory' }],
  outro: ["The line has stopped. For the first time in a hundred years, the Factory is quiet.", "Now. The Tower."], reward: { cr: 3000, xp: 13000, take: { overkey: 1 }, items: { cell: 3 } } });
defQuest('r5', { ch: 'Robot City · Chapter 4', title: 'Tower of Death', giver: 'ada', turnIn: 'ada', req: ['r4'], main: true,
  intro: ["The Overseer waits at the foot of his tower, northwest. Ghosts of every robot he deleted guard him.", "End him, gunner. Bring me his core."],
  obj: [{ kind: 'item', t: 'overcore', n: 1, text: 'Defeat the Overseer and take his core', zone: 'tower' }],
  outro: ["His core is still warm. Listen... it's broadcasting.", "\"THE SETTING SUN RISES. ALL WORLDS WILL BURN RED.\"", "He's coming himself now. Whatever the Setting Sun is, we'll be ready. Thank you, gunner. Robot City is free.", "(Chapter 5 is being written by Phil and Caleb. Stay tuned.)"],
  reward: { cr: 8000, xp: 20000, take: { overcore: 1 } } });
defQuest('rs1', { ch: 'Robot City · Side job', title: 'Pit Row Calling', giver: 'zip', turnIn: 'vroom', req: ['r1'],
  intro: ["The Hover Cup shut down. Everyone fast moved to Velocity, the magnet storm planet.", "Tell Vroom in Pit Row that Zip sent you. He owes me a tire. Several tires."],
  obj: [{ kind: 'reach', zone: 'pits', planet: 'speedway', n: 1, text: 'Fly to Velocity and reach Pit Row' }],
  outro: ["Zip sent you? Ha! Tell him the tires are in the mail. They are not in the mail.", "Grab a car and go. The flats are yours."], reward: { cr: 3000, xp: 6000, items: { cell: 2 } } });
defQuest('rs2', { ch: 'Robot City · Side job', title: 'Trash Talk', giver: 'sparkplug', turnIn: 'sparkplug', req: ['r1'],
  intro: ["The F-162s keep raiding Sparkplug's dumpsters. RUDE. Eight of them, please."],
  obj: [{ kind: 'kill', t: 'f162', n: 8, text: 'Defeat F-162 "Trashy" bots', zone: 'grave' }],
  outro: ["Sparkplug's dumpsters are safe! Have a discount. I mean credits."], reward: { cr: 2500, xp: 7000 } });
defQuest('rf1', { ch: 'Robot City · Found', title: 'Ghost Signal', found: true, giver: null, turnIn: 'r733', req: ['r1'],
  intro: ["The terminal flickers: DELETED UNITS STILL RUNNING. CHIPS RECOVERABLE.", "If someone collected the ghost chips, the deleted robots could be restored. R7-33 repairs robots..."],
  obj: [{ kind: 'item', t: 'ghostchip', n: 3, text: 'Recover Ghost Chips from ghost robots', zone: 'grave' }],
  outro: ["These are... people. Deleted people. I can bring them back.", "Thank you. Take this, it's all I have."], reward: { cr: 4000, xp: 9000, take: { ghostchip: 3 }, items: { crystal: 4 } } });
