// =================== MYSTIC WEAPONS ===================
Object.assign(GUNS, {
  m_ember: { name: 'Ember Wand', dmg: 40, rate: 0.28, mag: 18, reload: 1.4, req: 10, price: 2200, col: '#ff6a1a', kind: 'mystic', elem: 'flame', mana: true },
  m_storm: { name: 'Storm Staff', dmg: 70, rate: 0.45, mag: 12, reload: 1.6, req: 16, price: 5200, col: '#8fe3ff', kind: 'mystic', elem: 'storm', mana: true },
  m_venom: { name: 'Venom Scepter', dmg: 110, rate: 0.4, mag: 14, reload: 1.5, req: 20, price: 7800, col: '#7fff6a', kind: 'mystic', elem: 'poison', mana: true },
  m_spirit: { name: 'Spirit Bow', dmg: 120, rate: 0.55, mag: 10, reload: 1.4, req: 22, price: 0, col: '#c8a0ff', kind: 'mystic', elem: 'spirit', mana: true },
  m_void: { name: 'Void Orb', dmg: 380, rate: 0.9, mag: 6, reload: 2.0, req: 26, price: 0, col: '#9b6bff', kind: 'mystic', elem: 'void', splash: 6, mana: true },
  m_sun: { name: 'Sunfire Codex', dmg: 520, rate: 1.1, mag: 5, reload: 2.2, req: 30, price: 0, col: '#ffd36a', kind: 'mystic', elem: 'sun', splash: 5, mana: true }
});
function makeMysticModel(id) {
  const G = GUNS[id], g = new THREE.Group(), col = G.col;
  if (id === 'm_ember' || id === 'm_venom') { part(g, Cy(0.018, 0.024, 0.42, 6), toon(id === 'm_venom' ? '#2a3a2a' : '#5a3020', 'wood'), 0, 0, 0.08, Math.PI / 2); part(g, new THREE.OctahedronGeometry(0.05, 0), glow(col), 0, 0, 0.32); part(g, new THREE.TorusGeometry(0.04, 0.008, 5, 10), '#c9a43a', 0, 0, 0.27); if (id === 'm_venom') for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.012, 0.08, 4), '#7fff6a', 0.03 * s, 0.03, 0.3, -0.6, 0, 0.5 * s); }
  if (id === 'm_storm') { part(g, Cy(0.02, 0.02, 0.7, 6), toon('#4a3a5a', 'wood'), 0, 0, 0.1, Math.PI / 2); for (let k = 0; k < 3; k++) part(g, new THREE.TorusGeometry(0.05 + k * 0.012, 0.007, 5, 10), glow(col), 0, 0, 0.4 + k * 0.03); part(g, new THREE.IcosahedronGeometry(0.05, 0), glow('#ffffff'), 0, 0, 0.45); }
  if (id === 'm_spirit') { part(g, new THREE.TorusGeometry(0.22, 0.012, 5, 16, Math.PI), glow(col), 0, 0, 0.1, 0, Math.PI / 2, Math.PI / 2); part(g, Cy(0.002, 0.002, 0.44, 3), glow('#ffffff'), 0, 0, 0.1); part(g, B(0.02, 0.06, 0.04), '#4a3a6a', 0, 0, 0.1); }
  if (id === 'm_void') { part(g, new THREE.SphereGeometry(0.08, 10, 8), glow('#0a0614'), 0, 0.02, 0.2); part(g, new THREE.TorusGeometry(0.11, 0.008, 5, 16), glow(col), 0, 0.02, 0.2, 1.2); part(g, new THREE.TorusGeometry(0.13, 0.006, 5, 16), glow('#ff6aa8'), 0, 0.02, 0.2, 0.3, 0.9); part(g, B(0.05, 0.1, 0.05), C.dark, 0, -0.06, 0.12); }
  if (id === 'm_sun') { part(g, B(0.2, 0.05, 0.26), toon('#8a3a2e', 'cloth'), 0, 0, 0.14); part(g, B(0.19, 0.055, 0.24), '#efe7d6', 0, 0.005, 0.14); part(g, new THREE.CircleGeometry(0.05, 10), glow(col), 0, 0.034, 0.14, -Math.PI / 2); part(g, new THREE.OctahedronGeometry(0.035, 0), glow(col), 0, 0.12, 0.14); }
  g.userData.orb = g.children[g.children.length - 1];
  return g;
}
// elemental effects applied on hit; enemies tick them in the enemy loop
function mysticHit(G, e, end, dmg0, hitOne) {
  if (G.elem === 'flame') { e.burn = { t: 3, dps: dmg0 * 0.35 }; burst(end, '#ff6a1a', 8, 4); }
  if (G.elem === 'storm') { let from = end.clone(), n = 0; for (const f of enemies) { if (n >= 3 || f.dead || f === e) continue; if (f.obj.position.distanceTo(e.obj.position) < 8) { const to = f.obj.position.clone().add(V(0, f.def.hy * f.sc, 0)); tracer(from, to, '#8fe3ff'); tracer(from, to.clone().add(V(0, 0.2, 0)), '#ffffff'); hitOne(f, dmg0 * 0.6); from = to; n++; } } burst(end, '#8fe3ff', 10, 6); }
  if (G.elem === 'poison') { for (const f of enemies) { if (f.dead) continue; if (f.obj.position.distanceTo(end) < 3.5) { f.slow = 2.5; f.burn = { t: 4, dps: dmg0 * 0.2, col: '#7fff6a' }; f.aggro = true; } } burst(end, '#7fff6a', 16, 3); }
}
function mysticArea(G, end, dmg0, hitOne) {
  if (G.elem === 'void') { burst(end, '#9b6bff', 26, 6); burst(end, '#0a0614', 14, 3); for (const f of enemies) { if (f.dead) continue; const d = f.obj.position.distanceTo(end); if (d < G.splash) { f.pull = { p: end.clone(), t: 1.2 }; hitOne(f, dmg0 * (1 - 0.5 * d / G.splash)); } } return true; }
  if (G.elem === 'sun') { burst(end, '#ffd36a', 30, 9); burst(end, '#ff6a1a', 20, 6); for (const f of enemies) { if (f.dead) continue; const d = f.obj.position.distanceTo(end); if (d < G.splash) { f.burn = { t: 4, dps: dmg0 * 0.15 }; hitOne(f, dmg0 * (1 - 0.5 * d / G.splash)); } } return true; }
  return false;
}
function tickMystic(e, dt) {
  if (e.burn && e.burn.t > 0) { e.burn.t -= dt; e.hp -= e.burn.dps * dt; e.fxT = (e.fxT || 0) - dt; if (e.fxT <= 0) { e.fxT = 0.2; burst(e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), e.burn.col || '#ff9a3c', 2, 2); updatePlate(e); } if (e.hp <= 0) { kill(e); return true; } }
  if (e.pull && e.pull.t > 0) { e.pull.t -= dt; const o = e.obj.position, d = Math.hypot(e.pull.p.x - o.x, e.pull.p.z - o.z); if (d > 0.6) { o.x += (e.pull.p.x - o.x) / d * 7 * dt; o.z += (e.pull.p.z - o.z) / d * 7 * dt; } }
  if (e.slow > 0) e.slow -= dt;
  return false;
}
// Seer Ixa sells mystic weapons on the Zeltac; the best ones are earned
LEVELS.zeltac.npcs.push({ id: 'ixa', name: 'Seer Ixa', role: 'Mystic shop', rig: 'elismas', make: () => recolor(makeElismas(), { '#9aa1aa': '#6a3a8a', '#5d636c': '#3a1e4a' }), x: -12, z: -6, face: 1.0, shop: 'guns', guns: ['m_ember', 'm_storm', 'm_venom'],
  idle: ["Not every weapon is made of metal, pilot.", "The Void Orb answers only to those who've seen the Forgotten Forest."] });
defQuest('mq1', { ch: 'Zeltac · Mystic', title: "The Seer's Trial", giver: 'ixa', turnIn: 'ixa', req: ['c3'],
  intro: ["You carry the scent of the Forgotten Forest. The Nomines remember you.", "Bring me three Nomine Essence and a Star Crystal, and I will bind them into a Spirit Bow whose arrows find their mark."],
  obj: [{ kind: 'item', t: 'essence', n: 3, text: 'Bring 3 Nomine Essence', zone: 'forgot', planet: 'capitone' }, { kind: 'item', t: 'starcrystal', n: 1, text: 'Bring 1 Star Crystal (asteroids)', planet: 'space' }],
  outro: ["...It is done. The Spirit Bow. Its arrows seek the nearest foe."], reward: { xp: 5000, gun: 'm_spirit', take: { essence: 3, starcrystal: 1 } } });
defQuest('mq2', { ch: 'Zeltac · Mystic', title: 'Heart of the Void', giver: 'ixa', turnIn: 'ixa', req: ['mq1', 'c5'],
  intro: ["Vector, the dark world. Scan it, and bring me five Ice Cores from Capitone to hold what I pull out of it."],
  obj: [{ kind: 'item', t: 'icecore', n: 5, text: 'Bring 5 Ice Cores', zone: 'frozen', planet: 'capitone' }, { kind: 'kill', t: 'scan', n: 1, text: 'Scan any uncharted world', planet: 'space' }],
  outro: ["Hold out your hand. Do not look into it for too long.", "The Void Orb. It pulls enemies in and crushes them."], reward: { xp: 8000, gun: 'm_void', take: { icecore: 5 } } });
defQuest('mq3', { ch: 'Zeltac · Mystic', title: 'The Sunfire Codex', giver: 'ixa', turnIn: 'ixa', req: ['mq2'],
  intro: ["Three Masters fell to the Setting Sun's mark and rose again by your hand. One spell remains.", "Win the Grand Bout in the arena, then return. The Codex only opens for a champion."],
  obj: [{ kind: 'kill', t: 'wave10', n: 1, text: 'Clear wave 10 in the Arena' }],
  outro: ["Champion. Take the Sunfire Codex. Call the sun down on your enemies."], reward: { xp: 12000, gun: 'm_sun' } });

// =================== THE ARENA PLANET: duels, waves, and betting ===================
LEVELS.arena = {
  id: 'arena', name: 'Arena Prime', tag: 'Fight, bet, and climb the ladder', lvls: 'All levels · PvP', size: 160, center: [0, 0], radius: 70, water: -99, sky: 'arena', weather: 'none', hourOffset: 2,
  terrain: null, palette: { grass: '#b8865a' },
  zones: [{ id: 'ring', name: 'The Ring', lvl: 'PvP and waves · no safety', x: 0, z: 0, r: 22, fr: 22, col: '#c49a5a', h: 0 }, { id: 'lobby', name: 'Arena Lobby', lvl: 'Safe · betting', x: 0, z: 40, r: 13, col: '#8a6a4a', safe: true, h: 0 }],
  paths: [], river: [], pools: [], lava: [], safes: [{ x: 0, z: 40, r: 13 }], spawn: { x: 0, z: 44, yaw: 0 }, pad: { x: 0, z: 50 }, menu: { x: 0, z: 0, r: 34, h: 14 }, npcBase: [0, 40],
  npcs: [
    { id: 'vix', name: 'Lucky Vix', role: 'Bookie · place your bets', rig: 'spearman', make: () => recolor(makeSpearman(), { '#7fae63': '#c9a43a', '#4f7a3c': '#8a6a2a' }), x: -5, z: -4, face: 0.6, bookie: true, idle: ["Red or blue, friend? Money never sleeps."] },
    { id: 'gorr', name: 'Arena Master Gorr', role: 'Waves · duels', rig: 'chunk', make: () => makeChunkMonster('#8a3a2e', '#5a2a1e', '#c47a4a', '#3a3d44', false), x: 5, z: -4, face: -0.6, arenaMaster: true, idle: ["Step into the ring. Survive, and the crowd pays you.", "Inside the ring, other players can shoot you. Outside, no one can."] },
    { id: 'medic', name: 'Ringside Medic', role: 'Heals fighters', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#8a3a2e', '#c58a64', '#1e1a18', '#c8402f'), x: 0, z: 5, face: Math.PI, heal: true, idle: ["Patch up, then go get hit again."] }
  ],
  spawns: [],
  build() {
    // sand floor everywhere, the ring floor marked
    const fl = new THREE.PlaneGeometry(160, 160); fl.rotateX(-Math.PI / 2); const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 40, uv.getY(i) * 40);
    props.add(new THREE.Mesh(fl, toon('#c49a6a', 'stone')));
    const rf = new THREE.Mesh(new THREE.CircleGeometry(22, 32).rotateX(-Math.PI / 2), toon('#d8b07a', 'stone')); rf.position.y = 0.02; props.add(rf);
    const ringLine = new THREE.Mesh(new THREE.RingGeometry(21.6, 22, 40).rotateX(-Math.PI / 2), glow('#ff3b2a')); ringLine.position.y = 0.04; props.add(ringLine);
    part(props, Cy(1.5, 1.5, 0.1, 16), glow('#ffd36a'), 0, 0.05, 0);
    // coliseum walls with two gates, then stands
    const R = 24, gates = [Math.PI / 2];
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; if (gates.some(gt => Math.abs(Math.atan2(Math.sin(a - gt), Math.cos(a - gt))) < 0.12)) continue; part(props, B(3.9, 3.6, 0.8), i % 2 ? '#8a5a3c' : '#a06a44', Math.cos(a) * R, 1.8, Math.sin(a) * R, 0, -a + Math.PI / 2); if (i % 4 === 0) part(props, B(1, 2, 0.06), toon(i % 8 ? '#c8402f' : '#3b4f7a', 'cloth'), Math.cos(a) * (R - 0.45), 2.4, Math.sin(a) * (R - 0.45), 0, -a + Math.PI / 2); }
    RINGS.push({ x: 0, z: 0, r: R, gate: Math.PI / 2, half: 2.4 });
    for (let tier = 0; tier < 4; tier++) { const r = R + 3 + tier * 2.6, y = 1.2 + tier * 1.6; for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.35) continue; part(props, B(2.8, y * 2, 2.4), '#7a5038', Math.cos(a) * r, y, Math.sin(a) * r, 0, -a + Math.PI / 2); } }
    // the crowd: little colored fans who cheer
    const fans = new THREE.Group(); levelGroup.add(fans); const fcols = ['#c8402f', '#3b4f7a', '#ffd36a', '#6fdc5a', '#c86aff', '#efe7d6'];
    for (let tier = 0; tier < 4; tier++) for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2 + tier * 0.05; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.38) continue; const r = R + 3 + tier * 2.6, y = 2.4 + tier * 3.2;
      const f = new THREE.Mesh(B(0.5, 0.8, 0.4), toon(fcols[(i + tier) % 6])); f.position.set(Math.cos(a) * r, y + 0.4, Math.sin(a) * r); f.userData.ph = Math.random() * 6; fans.add(f); }
    levelAnims.push(t => { const hype = 1 + (ARENA.bout ? 2 : 0) + (ARENA.wave ? 1.5 : 0); fans.children.forEach(f => { f.position.y += (Math.max(0, Math.sin(t * 6 * hype * 0.4 + f.userData.ph)) * 0.3 * hype - (f.position.y - Math.floor(f.position.y * 10) / 10)) * 0; f.scale.y = 1 + Math.max(0, Math.sin(t * 5 + f.userData.ph)) * 0.25 * hype; }); });
    // lobby: banners, betting board, pad
    for (const s of [-1, 1]) { part(props, Cy(0.2, 0.2, 5, 6), '#3a3d44', 6 * s, 2.5, 30); part(props, B(1.6, 2.6, 0.06), toon(s > 0 ? '#3b4f7a' : '#c8402f', 'cloth'), 6 * s, 3.3, 30.1); }
    const board = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), new THREE.MeshBasicMaterial({ map: signTex('ARENA PRIME · BETS · WAVES · DUELS', '#3a0e0e', '#ffd36a') })); board.position.set(0, 4.2, 31); props.add(board);
    dropshipPad(0, 50, 0, 'Return to your ship');
    // fighters for bouts
    ARENA.reset();
    levelAnims.push(t => arenaTick(t));
    const sunL = new THREE.PointLight(0xffd6a0, 0.6, 80, 1.2); sunL.position.set(0, 20, 0); levelGroup.add(sunL);
  }
};
SPACE_BODIES.arena = { pos: V(-260, -160, -1350).multiplyScalar(SPACE_SPREAD), r: 130, col: '#c49a5a', ring: true };
PLANET_LOOK.arena = { seed: 41, ramp: [[0, '#5a2a1e'], [0.45, '#a0603a'], [0.6, '#d8a060'], [0.8, '#f0d090']], grid: '#ffd36a' };
PLANET_ORDER.splice(PLANET_ORDER.indexOf('robot'), 0, 'arena');
const ARENA = {
  bout: null, wave: 0, waveT: 0, lastT: 0, bets: [],
  reset() { this.bout = null; this.wave = 0; this.waveT = 0; this.bets = []; this.lastT = 0; }
};
const FIGHTERS = [
  ['Gor-Tak', () => recolor(makeSpearman(), { '#7fae63': '#b5653f', '#4f7a3c': '#7a3a26' }), 'spearman', 1.35],
  ['The Rock Brute', () => makeChunkMonster('#b39a78', '#8c7658', '#c4ab86', '#3d3530', false), 'chunk', 1.2],
  ['Hive Champion', () => recolor(makeBugHybrid(), { '#5f8a3a': '#c4924a' }), 'bughybrid', 1.15],
  ['Iron Duke XR', () => recolor(makeXR17(), { '#9aa1aa': '#c9a43a' }), 'xr17', 1.4],
  ['Frost Hulk', () => makeChunkMonster('#bfe6f2', '#8fc4dc', '#e8f6fb', '#5d7f99', true), 'chunk', 1.2],
  ['Red Fang', () => recolor(makeStagrone(), { '#9a7650': '#8a2a1e' }), 'stagrone', 1.2]
];
function arenaTick(t) {
  const dt = ARENA.lastT ? Math.min(0.1, t - ARENA.lastT) : 0; ARENA.lastT = t; if (!LEVEL || LEVEL.id !== 'arena') return;
  const B = ARENA.bout; boutHud();
  if (!B) { ARENA.idle = (ARENA.idle || 0) + dt; if (ARENA.idle > 25 && Math.hypot(player.pos.x - PIT[0], player.pos.z - PIT[1]) < 40) { ARENA.idle = 0; startBout(); } }
  if (B) {
    B.t += dt; B.open = Math.max(0, 10 - B.t);
    for (const [i, F] of B.f.entries()) { const O = B.f[1 - i], dx = O.obj.position.x - F.obj.position.x, dz = O.obj.position.z - F.obj.position.z, d = Math.hypot(dx, dz);
      F.obj.rotation.y = Math.atan2(dx, dz); if (F.hp > 0 && d > 2.2) { F.obj.position.x += dx / d * 2.2 * dt; F.obj.position.z += dz / d * 2.2 * dt; }
      if (F.hp > 0 && O.hp > 0 && d <= 2.6) { F.cd -= dt; if (F.cd <= 0) { F.cd = rand(0.7, 1.3) / F.spd; F.st.atk = 0.42; const dmg = rand(4, 11) * F.pow; O.hp = Math.max(0, O.hp - dmg); O.st.hit = 0.15; burst(O.obj.position.clone().add(V(0, 1.4, 0)), i ? '#4fa8ff' : '#ff6a5a', 6, 4); SFX.hit(); drawPlate(O.plate, O.name, i ? 'RED' : 'BLUE', i ? '#ff8a80' : '#8fc4ff', O.hp / 100); } }
      animRig(F.obj, F.st, dt, t);
      if (F.hp <= 0 && !F.down) { F.down = true; F.obj.rotation.x = -Math.PI / 2; F.obj.position.y = 0.3; }
    }
    const loser = B.f.findIndex(F => F.hp <= 0);
    if (loser >= 0 && !B.over) { B.over = true; B.endT = B.t; const win = 1 - loser; toast(B.f[win].name.toUpperCase() + ' WINS', win ? 'Blue corner' : 'Red corner', 4); SFX.quest(); SFX.cheer(); settleBets(win); }
    if (B.over && B.t - B.endT > 5) { B.f.forEach(F => levelGroup.remove(F.obj)); ARENA.bout = null; }
  }
  if (ARENA.wave) {
    const alive = enemies.filter(e => e.sp.arena && !e.dead).length, inRing = Math.hypot(player.pos.x, player.pos.z) < 22;
    if (!player.alive || (!inRing && ARENA.waveT <= 0)) { endWaves(player.alive ? 'You left the ring.' : 'You went down.'); return; }
    if (ARENA.waveT > 0) { ARENA.waveT -= dt; if (ARENA.waveT <= 0) spawnWave(ARENA.wave); }
    else if (alive === 0) { const n = ARENA.wave, cr = 60 * n + 15 * n * n, xp = 80 * n * Math.max(1, S.lvl / 4);
      S.cr += cr; gainXp(Math.round(xp)); toast(`WAVE ${n} CLEARED`, `+${cr} cr · next wave in 5s`, 3); SFX.quest(); S.arena = S.arena || {}; S.arena.best = Math.max(S.arena.best || 0, n); if (n >= 10) questProgressKill('wave10'); markDirty(); checkReady();
      ARENA.wave++; ARENA.waveT = 5; }
  }
}
function startBout() {
  if (ARENA.bout) return; ARENA.result = null;
  const a = randi(0, FIGHTERS.length - 1); let b = randi(0, FIGHTERS.length - 2); if (b >= a) b++;
  const mk = (k, i) => { const [name, make, rigN, sc] = FIGHTERS[k], obj = buildChar(make, rigN); obj.scale.setScalar(sc); blob(obj, 0.6); obj.position.set(PIT[0] + (i ? 4 : -4), 0, PIT[1]); levelGroup.add(obj);
    MOVERS.push([obj, 0.6 * sc]); const plate = labelSprite(512, 72); plate.scale.set(2.4 / sc, 0.34 / sc, 1); plate.position.y = 2.6; obj.add(plate); const F = { name, obj, plate, hp: 100, cd: 1.5, st: {}, pow: rand(0.85, 1.2), spd: rand(0.85, 1.2) };
    drawPlate(plate, name, i ? 'BLUE' : 'RED', i ? '#8fc4ff' : '#ff8a80', 1); return F; };
  const f = [mk(a, 0), mk(b, 1)], sR = f[0].pow * f[0].spd, sB = f[1].pow * f[1].spd;
  ARENA.bout = { f, t: 0, odds: [+(1 + sB / sR).toFixed(2), +(1 + sR / sB).toFixed(2)], over: false };
  log(`Next bout: ${f[0].name} (red, ${ARENA.bout.odds[0]}x) vs ${f[1].name} (blue, ${ARENA.bout.odds[1]}x). Bet with Lucky Vix!`, 'loot');
  ARENA.bout.f.forEach(F => { F.cd = 10; }); ARENA.bout.open = 10; // ten seconds to place bets
  toast('BETS OPEN', `${f[0].name} vs ${f[1].name} · talk to Lucky Vix`, 3);
}
function settleBets(win) {
  let net = 0, any = ARENA.bets.length;
  for (const b of ARENA.bets) { if (b.side === win) { const pay = Math.round(b.amt * ARENA.bout.odds[win]); S.cr += pay; net += pay; S.arena = S.arena || {}; S.arena.betsWon = (S.arena.betsWon || 0) + 1; } }
  ARENA.result = any ? (net ? `YOU WON ${net} cr!` : 'Your fighter lost. No payout.') : 'No bet placed this round.';
  if (any) { if (net) { toast('YOU WON!', `+${net} cr from Lucky Vix`, 5); SFX.level(); log(`Bet won: +${net} cr`, 'loot'); } else { toast('BET LOST', 'Better luck next bout', 4); SFX.hurt(); } }
  ARENA.bets = []; markDirty();
}
function openBookie() {
  openDlg('Bookie', 'Lucky Vix');
  const B = ARENA.bout, open = B && !B.over && B.t < 10;
  if (!B || B.over) { $('dlgLine').textContent = 'How it works: two fighters, RED and BLUE. Bet on one. If yours wins, you get your bet times the odds. Bouts run in the Betting Pit next to the lobby, and the pit balcony is safe. Want me to call one now?'; acts([['Call a bout', () => { closeDlg(); startBout(); setTimeout(() => { if (state === 'play' && !dlgOpen) openBookie(); }, 300); }, true], ['Bye', closeDlg]]); return; }
  $('dlgLine').textContent = open ? `RED: ${B.f[0].name}, pays ${B.odds[0]}x your bet. BLUE: ${B.f[1].name}, pays ${B.odds[1]}x. The underdog pays more. ${Math.ceil(B.open)}s left to bet. You have ${S.cr} cr.` : 'Betting is closed for this bout. Watch it from the pit balcony!';
  if (!open) { acts([['Bye', closeDlg]]); return; }
  const bet = (side, amt) => { if (S.cr < amt) return; S.cr -= amt; ARENA.bets.push({ side, amt }); SFX.coin(); toast('BET PLACED', `${amt} cr on ${B.f[side].name} · pays ${Math.round(amt * B.odds[side])} if they win`, 4); log(`Bet ${amt} cr on ${B.f[side].name} (${side ? 'blue' : 'red'}). If they win you get ${Math.round(amt * B.odds[side])} cr.`, 'loot'); markDirty(); closeDlg(); };
  acts([['50 on Red', () => bet(0, 50), true, S.cr < 50], ['50 on Blue', () => bet(1, 50), false, S.cr < 50], ['500 on Red', () => bet(0, 500), false, S.cr < 500], ['500 on Blue', () => bet(1, 500), false, S.cr < 500], ['Bye', closeDlg]]);
}
const WAVE_TYPES = [['dog', 'crolan'], ['xr17', 'stagrone'], ['spearman', 'bughybrid'], ['ant', 'redant'], ['snorfal', 'guard'], ['porcupine', 'jumper'], ['icemonster', 'snofel'], ['magmagopel', 'nomine'], ['rockmonster', 'gopel']];
function spawnWave(n) {
  const types = WAVE_TYPES[(n - 1) % WAVE_TYPES.length], lv = Math.max(1, S.lvl - 2 + Math.floor(n / 2)), count = Math.min(3 + n, 10);
  for (let i = 0; i < count; i++) { const e = makeEnemy({ zone: 'ring', type: types[i % 2], n: 1, lv: [lv, lv + 1], arena: true, once: true }); const a = i / count * Math.PI * 2; e.obj.position.set(Math.cos(a) * 17, 0, Math.sin(a) * 17); e.aggro = true; }
  if (n % 5 === 0) { const e = makeEnemy({ zone: 'ring', type: n >= 10 ? 'vask' : 'chief', n: 1, lv: [lv + 3, lv + 3], arena: true, once: true }); e.obj.position.set(0, 0, -15); e.aggro = true; }
  toast(`WAVE ${n}`, n % 5 === 0 ? 'A champion enters!' : `${count} enemies`, 2.5); SFX.horn(); SFX.cheer();
}
function startWaves() { if (ARENA.wave) return; ARENA.wave = 1; ARENA.waveT = 4; player.pos.set(0, 0, 14); player.yaw = 0; log('Waves start in 4 seconds. Stay inside the ring!', 'loot'); }
function endWaves(why) { const best = ARENA.wave - 1; ARENA.wave = 0; ARENA.waveT = 0; for (const e of enemies) if (e.sp.arena) { e.gone = true; scene.remove(e.obj); } for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].gone) enemies.splice(i, 1); log(`${why} Waves cleared: ${Math.max(0, best)}. Best ever: ${(S.arena && S.arena.best) || 0}.`, 'loot'); }
function openArenaMaster() {
  openDlg('Arena', 'Arena Master Gorr');
  const A = S.arena || {};
  $('dlgLine').textContent = `Waves pay more every round, champions every 5th. Your best: wave ${A.best || 0} · player KOs: ${A.kos || 0} · bets won: ${A.betsWon || 0}. Inside the ring, other players can fight you too.`;
  acts([[ARENA.wave ? 'Waves running' : 'Start waves', () => { closeDlg(); startWaves(); }, true, !!ARENA.wave], ['Bye', closeDlg]]);
}
// ---------------- player vs player, inside the ring only ----------------
let myPeer = null, pvpSeq = 0; const pvpOut = [], pvpSeen = new Map(), koOut = [];
const inRing = (p) => LEVEL && LEVEL.id === 'arena' && Math.hypot(p.x, p.z) < 22;
function pvpShoot(o, dir, dmg, maxT) {
  if (!inRing(player.pos)) return null; let best = null, bt = maxT;
  for (const r of remotes.values()) { if (!r.peerId || !inRing(r.obj.position)) continue; const b = r.obj.position; for (const f of [0.6, 1.2, 1.7]) { const t = raySphere(o, dir, tmp.set(b.x, b.y + f, b.z), 0.45); if (t > 0 && t < bt) { bt = t; best = r; } } }
  if (best) { pvpOut.push([best.peerId, Math.round(dmg * 0.5), ++pvpSeq]); while (pvpOut.length > 8) pvpOut.shift(); burst(best.obj.position.clone().add(V(0, 1.3, 0)), '#ff3b2a', 8, 4); hitmark(false); SFX.hit(); sendPresence(true); }
  return best ? bt : null;
}
function pvpWrite(p) { if (LEVEL && LEVEL.id === 'arena') { if (pvpOut.length) p.hx = pvpOut.slice(); if (koOut.length) p.ko = koOut.slice(); } }
function pvpRead(peerId, pr, r) {
  if (!LEVEL || LEVEL.id !== 'arena' || !myPeer) return;
  const seen = pvpSeen.get(peerId) || { hit: 0, ko: 0 };
  if (Array.isArray(pr.hx)) for (const h of pr.hx) { if (!Array.isArray(h) || h[0] !== myPeer || !(h[2] > seen.hit)) continue; seen.hit = h[2]; const d = clamp(Number(h[1]) || 0, 0, 200); if (inRing(player.pos) && player.alive) { player.pvpBy = r.nick; hurt(d); } }
  if (Array.isArray(pr.ko)) for (const k of pr.ko) { if (!Array.isArray(k) || k[0] !== myPeer || !(k[1] > seen.ko)) continue; seen.ko = k[1]; S.arena = S.arena || {}; S.arena.kos = (S.arena.kos || 0) + 1; toast('KNOCKOUT', `You beat ${r.nick}`, 3); SFX.quest(); gainXp(200 + S.lvl * 10); S.cr += 100; markDirty(); }
  pvpSeen.set(peerId, seen);
}
function arenaOnDeath() {
  if (!player.pvpBy) return; for (const r of remotes.values()) if (r.nick === player.pvpBy && r.peerId) { koOut.push([r.peerId, ++pvpSeq]); while (koOut.length > 4) koOut.shift(); sendPresence(true); }
  player.pvpBy = null;
}

// the Betting Pit: a small sunken ring beside the lobby with a safe balcony around it
const PIT = [-30, 44];
{ const orig = LEVELS.arena.build;
  LEVELS.arena.build = function () { orig.call(this);
    const [x, z] = PIT;
    const fl = new THREE.Mesh(new THREE.CircleGeometry(7.5, 24).rotateX(-Math.PI / 2), toon('#d8b07a', 'stone')); fl.position.set(x, 0.03, z); props.add(fl);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; part(props, B(2.1, 1.1, 0.3), i % 2 ? '#c8402f' : '#3b4f7a', x + Math.cos(a) * 8, 0.55, z + Math.sin(a) * 8, 0, -a + Math.PI / 2); }
    RINGS.push({ x, z, r: 8, gate: 0, half: 0 });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: signTex('BETTING PIT · SAFE BALCONY', '#3a0e0e', '#ffd36a') })); sg.position.set(x, 3.6, z - 9.5); props.add(sg);
    SAFES.push({ x, z, r: 15 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(14.5, 15, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#8fe3ff', transparent: true, opacity: 0.3 })); ring.position.set(x, 0.06, z); levelGroup.add(ring);
    ARENA.idle = 18;
  };
}
LEVELS.arena.npcs.find(n => n.id === 'vix').x = -22; LEVELS.arena.npcs.find(n => n.id === 'vix').z = 0;
LEVELS.arena.zones.push({ id: 'pit', name: 'Betting Pit', lvl: 'Safe balcony · bets', x: PIT[0], z: PIT[1], r: 15, col: '#8a6a4a', h: 0 });
let boutEl = null;
function boutHud() {
  if (!boutEl) { boutEl = document.createElement('div'); boutEl.className = 'win'; boutEl.id = 'bout'; $('hud').appendChild(boutEl); }
  const B = ARENA.bout, show = LEVEL && LEVEL.id === 'arena' && (B || ARENA.result) && Math.hypot(player.pos.x - PIT[0], player.pos.z - PIT[1]) < 16;
  boutEl.hidden = !show; if (!show) return;
  if (!B) { boutEl.innerHTML = `<div class="bres">${ARENA.result}</div><div class="bsub">Next bout soon</div>`; return; }
  const mine = ARENA.bets.reduce((s, b) => (s[b.side] += b.amt, s), [0, 0]);
  const bar = (F, i) => `<div class="brow"><b style="color:${i ? '#8fc4ff' : '#ff8a80'}">${i ? 'BLUE' : 'RED'} · ${F.name}</b><span>${B.odds[i]}x${mine[i] ? ' · your bet ' + mine[i] : ''}</span></div><div class="bar"><i style="transform:scaleX(${Math.max(0, F.hp / 100)});background:${i ? '#4fa8ff' : '#ff3b2a'}"></i></div>`;
  boutEl.innerHTML = bar(B.f[0], 0) + bar(B.f[1], 1) + `<div class="bsub">${B.over ? (ARENA.result || '') : B.open > 0 ? `Bets open: ${Math.ceil(B.open)}s · talk to Lucky Vix` : 'FIGHT!'}</div>`;
}
{ const _ll = loadLevel; loadLevel = function (id, o) { if (boutEl) boutEl.hidden = true; return _ll(id, o); }; }
// the crowd roars while a fight is on in the big ring (Kade, ladder waves, PvP)
{ let cheerT = 0; levelAnims.push && 0; const tick = () => { if (!LEVEL || LEVEL.id !== 'arena' || state !== 'play') return; if (Math.hypot(player.pos.x, player.pos.z) > 32) return;
  const fight = (typeof enemies !== 'undefined' && enemies.some(e => e.alive !== false && e.hp > 0 && e.obj && e.obj.position.distanceTo(player.pos) < 30)) || (typeof peers !== 'undefined' && Object.keys(peers || {}).length);
  if (fight && performance.now() > cheerT) { cheerT = performance.now() + 4000 + Math.random() * 5000; try { SFX.cheer(); } catch (_) {} } };
  setInterval(tick, 1000); }
