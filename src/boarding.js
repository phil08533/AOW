// =================== BOARDING: random ships drift through space; dock, board, clear the crew, loot the hold ===================
const HULK_TYPES = {
  derelict: { name: 'Infested Freighter', hull: '#5d636c', trim: '#c9a43a', light: '#ff3b2a', wall: '#3a3d44', floor: '#2c2f36', neon: '#ff3b2a', crew: lv => ['crolan', 'skyrene', 'bughybrid', ...(lv >= 10 ? ['gutworm'] : [])], boss: lv => lv >= 10 ? 'gutworm' : 'bughybrid', line: 'Lights flickering. Life signs everywhere. None of them human.' },
  raider: { name: 'Raider Corsair', hull: '#6a4a3a', trim: '#ff8a2a', light: '#ff8a2a', wall: '#4a3a30', floor: '#3a2e26', neon: '#ff8a2a', crew: lv => ['spearman', 'spearman', 'stagrone'], boss: () => 'chief', line: 'Pirate colors. Somebody on board is going to want a fight.' },
  drome: { name: 'Drome Cutter', hull: '#1e1c22', trim: '#b3262c', light: '#ff2a3a', wall: '#26232a', floor: '#1a181e', neon: '#ff2a3a', crew: lv => lv >= 28 ? ['eliteguard', 'droid', 'guard'] : lv >= 20 ? ['droid', 'guard', 'guard'] : ['guard', 'xr17'], boss: lv => lv >= 18 ? 'vask' : 'guard', line: "Drome's colors. A red sun painted on the hull." },
  hive: { name: 'Hive Ship', hull: '#7a5a2a', trim: '#ffd36a', light: '#ffd36a', wall: '#5a4a2a', floor: '#3a2e1a', neon: '#ffb347', crew: lv => ['ant', 'redant', 'bugbug'], boss: lv => lv >= 14 ? 'matriarch' : 'redant', line: 'It is not built. It is grown. And it is buzzing.' },
  flagship: { name: 'The Eclipse', hull: '#141218', trim: '#c9a43a', light: '#ff2a3a', wall: '#1e1a22', floor: '#141218', neon: '#ffd36a', crew: lv => ['eliteguard', 'droid', 'guard'], boss: () => 'admiral', line: "Drome's flagship. Every gun on it is pointed at you.", big: true },
};
Object.assign(ENEMY, {
  admiral: { rig: 'drome', name: 'Admiral Sable', make: () => recolor(makeDrome(), { '#b3262c': '#c9a43a', '#1e1c22': '#141218' }), scale: 1.25, hp: 3600, speed: 2.6, r: 0.6, hy: 1.4, xp: 9000, cr: [1800, 2400], boss: true,
    ranged: { dmg: 30, rate: 0.9, speed: 20, col: '#ffd36a', range: 24, keep: 8 }, melee: { dmg: 50, rate: 1.3, reach: 2.6 }, drops: [['eclipsecore', 1]] },
});
Object.assign(ITEMS, {
  fleetcode: { name: 'Fleet Code', v: 0, col: '#ff2a3a', quest: true },
  eclipsecore: { name: 'Eclipse Nav Core', v: 0, col: '#ffd36a', quest: true },
});
const BOARD = { wrecks: null, made: 0, cur: null };
function hulkLv() { return clamp(S.lvl + randi(-1, 2), 2, 52); }
function makeHulk(type) {
  const T = HULK_TYPES[type], g = new THREE.Group(), s = T.big ? 2.6 : 1;
  if (type === 'hive') {
    for (let i = 0; i < 7; i++) part(g, new THREE.SphereGeometry((5 - Math.abs(i - 3)) * s, 10, 8), T.hull, 0, Math.sin(i) * 1.5 * s, (i - 3) * 6 * s);
    for (let i = 0; i < 10; i++) part(g, new THREE.SphereGeometry(0.8 * s, 6, 4), glow(T.light), Math.cos(i) * 4.5 * s, Math.sin(i * 2) * 3 * s, (i - 5) * 3.4 * s);
  } else {
    part(g, B(9 * s, 6 * s, 34 * s), T.hull, 0, 0, 0); part(g, B(6 * s, 4 * s, 10 * s), T.hull, 0, 4.5 * s, 8 * s);
    part(g, B(2 * s, 1.2 * s, 6 * s), glow(T.light), 0, 6.8 * s, 6 * s);
    for (const x of [-1, 1]) { part(g, B(10 * s, 0.8 * s, 8 * s), T.trim, x * 9 * s, 0, 6 * s, 0, 0, x * 0.15); part(g, Cy(1.6 * s, 2 * s, 5 * s, 10), T.hull, x * 3 * s, 0, 18 * s, Math.PI / 2); part(g, Cy(1.2 * s, 1.2 * s, 0.4 * s, 10), glow(type === 'derelict' ? '#3a3d44' : '#4fd2ff'), x * 3 * s, 0, 20.6 * s, Math.PI / 2); }
    for (let i = 0; i < 8; i++) part(g, B(0.6 * s, 0.6 * s, 0.2), glow(i % 3 ? T.light : '#ffffff'), (i % 2 ? 4.6 : -4.6) * s, 1.4 * s, (-14 + i * 4) * s);
    part(g, B(9.4 * s, 0.6 * s, 2 * s), T.trim, 0, -1 * s, -14 * s);
    if (type === 'derelict') for (let i = 0; i < 6; i++) part(g, B(3 * s, 3 * s, 3 * s), '#3a3d44', (Math.random() - 0.5) * 30 * s, (Math.random() - 0.5) * 16 * s, (Math.random() - 0.5) * 40 * s, i, i * 2, i);
    if (type === 'flagship') { for (let i = 0; i < 6; i++) part(g, Cy(0.6 * s, 0.6 * s, 6 * s, 6), '#26232a', (i % 2 ? 4 : -4) * s, 3.4 * s, (-12 + i * 4) * s, Math.PI / 2); part(g, new THREE.CircleGeometry(4 * s, 20), glow('#b3262c'), 0, 0.4 * s, -17.1 * s, 0, Math.PI); }
  }
  const beacon = glowSprite(T.light, 18 * s); beacon.position.y = 9 * s; g.add(beacon); g.userData.beacon = beacon;
  return g;
}
function freshWrecks() {
  const ids = Object.keys(SPACE_BODIES).filter(id => !SPACE_BODIES[id].station), list = [], types = ['derelict', 'raider', 'drome', 'hive', 'derelict', 'raider'];
  for (let i = 0; i < 5; i++) { const P = SPACE_BODIES[ids[randi(0, ids.length - 1)]], a = Math.random() * 6.28, d = P.r + 140 + Math.random() * 280;
    list.push({ id: 'w' + Date.now() + i, type: types[randi(0, types.length - 1)], pos: P.pos.clone().add(V(Math.cos(a) * d, (Math.random() - 0.5) * 90, Math.sin(a) * d)), ry: Math.random() * 6.28, lv: hulkLv() }); }
  // Chapter 5 needs Drome cutters: make sure at least two are out there
  if (qState('d2') && qState('d2').st === 'active') for (let k = 0; k < 2; k++) list[k].type = 'drome';
  BOARD.wrecks = list; BOARD.made = Date.now();
}
function flagshipPos() { const R = SPACE_BODIES.robot || SPACE_BODIES.earth; return R.pos.clone().add(V(R.r + 420, 70, 120)); }
{ const _ll = loadLevel; loadLevel = function (id, o) {
  const r = _ll(id, o);
  if (id === 'space') {
    if (!BOARD.wrecks || Date.now() - BOARD.made > 12 * 60000 || !BOARD.wrecks.length) freshWrecks();
    const show = [...BOARD.wrecks]; if (qState('d3') && qState('d3').st === 'active') show.push({ id: 'eclipse', type: 'flagship', pos: flagshipPos(), ry: 1.2, lv: Math.max(36, S.lvl) });
    for (const W of show) {
      const m = makeHulk(W.type); m.position.copy(W.pos); m.rotation.y = W.ry; levelGroup.add(m); W.obj = m; W.prompted = false;
      levelAnims.push(t => { if (!m.parent) return; m.rotation.z = Math.sin(t * 0.2 + W.ry) * 0.05; m.userData.beacon.material.opacity = 0.5 + Math.sin(t * 4) * 0.4;
        const d = player.pos.distanceTo(m.position), near = (HULK_TYPES[W.type].big ? 110 : 55);
        if (d < near && !W.prompted && !dlgOpen && player.alive) { W.prompted = true; boardPrompt(W); }
        if (d > near * 2) W.prompted = false;
        if (d < (HULK_TYPES[W.type].big ? 40 : 18)) { player.pos.copy(m.position).addScaledVector(player.pos.clone().sub(m.position).normalize(), HULK_TYPES[W.type].big ? 40 : 18); if (fly) fly.vel.multiplyScalar(0.3); } });
    }
  }
  return r;
}; }
function boardPrompt(W) {
  const T = HULK_TYPES[W.type]; openDlg('Sensors', T.name);
  $('dlgLine').textContent = `${T.line} Threat level ${W.lv}. Dock and board? Clear the crew to loot the hold.`;
  acts([['Dock and board', () => { closeDlg(); boardShipW(W); }, true], ['Fly on', closeDlg]]);
}
function boardShipW(W) {
  BOARD.cur = { id: W.id, type: W.type, lv: W.lv, pos: W.pos.clone(), cleared: false, hull: player.hp };
  const L = LEVELS.boarding, T = HULK_TYPES[W.type]; L.name = T.name; L.tag = W.type === 'flagship' ? "Drome's flagship" : 'Boarding action';
  L.zones = [{ id: 'deck', name: T.name, lvl: `Lv ${W.lv} · hostile`, x: 0, z: 0, r: 34, col: T.floor, safe: false, h: 0 }];
  const lv = [W.lv, W.lv], crew = T.crew(W.lv).filter(t => ENEMY[t]), spots = [[-8.5, -25.5], [8.5, -25.5], [-8.5, -8.5], [8.5, -8.5], [-8.5, 8.5], [8.5, 8.5], [-8.5, 22], [8.5, 22], [0, -12], [0, 4], [-10, -20], [10, -2]];
  const n = W.type === 'flagship' ? 12 : 7 + Math.min(4, Math.floor(W.lv / 12));
  L.spawns = spots.slice(0, n).map((p, i) => ({ zone: 'deck', type: crew[i % crew.length], n: 1, lv, at: p, once: true, board: true }));
  const bt = T.boss(W.lv); if (ENEMY[bt]) L.spawns.push({ zone: 'deck', type: bt, n: 1, lv: [W.lv + (W.type === 'flagship' ? 0 : 1), W.lv + (W.type === 'flagship' ? 0 : 1)], at: [0, -28], once: true, board: true, captain: true });
  travel('boarding');
}
LEVELS.boarding = {
  id: 'boarding', name: 'Boarded ship', tag: 'Boarding action', lvls: 'Varies', size: 90, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#2c2f36' }, zones: [], paths: [], river: [], pools: [], lava: [],
  safes: [], spawn: { x: 0, z: 30, yaw: 0 }, pad: { x: 0, z: 32 }, menu: { x: 0, z: 10, r: 14, h: 4 }, npcBase: [0, 0], npcs: [], spawns: [],
  build() {
    const C = BOARD.cur || { type: 'derelict' }, T = HULK_TYPES[C.type], H = 5, W = 14, D = 34;
    const fl = new THREE.PlaneGeometry(W * 2, D * 2, 8, 16); fl.rotateX(-Math.PI / 2); const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W / 2, uv.getY(i) * D / 2);
    props.add(new THREE.Mesh(fl, toon(T.floor, 'panel'))); const ce = new THREE.Mesh(fl.clone(), toon('#1a1c22', 'panel')); ce.rotation.x = Math.PI; ce.position.y = H; props.add(ce);
    const wall = (x, z, w, d) => { part(props, B(w, H, d), toon(T.wall, 'panel'), x, H / 2, z); box(x, z, w / 2, d / 2); };
    wall(0, -D, W * 2, 0.6); wall(0, D, W * 2, 0.6); wall(-W, 0, 0.6, D * 2); wall(W, 0, 0.6, D * 2);
    // corridor walls with a door into every room; room dividers
    const roomZ = [-25.5, -8.5, 8.5, 25.5];
    for (const sx of [-1, 1]) {
      let z0 = -D; for (const rz of roomZ) { const a = rz - 1.8, len = a - z0; if (len > 0.2) wall(sx * 3, z0 + len / 2, 0.4, len); z0 = rz + 1.8; }
      wall(sx * 3, (z0 + D) / 2, 0.4, D - z0);
      for (const zd of [-17, 0, 17]) wall(sx * 8.5, zd, 11, 0.4);
      for (const rz of roomZ) part(props, B(0.1, 0.3, 3.4), glow(T.neon), sx * 2.78, H - 0.4, rz);
    }
    for (let z = -D + 3; z < D; z += 6) part(props, B(1.2, 0.08, 0.4), glow(T.neon), 0, H - 0.05, z);
    // room dressing: crates, consoles, pipes, pods
    const rnd = i => (Math.sin((C.id ? C.id.length : 3) * 17.3 + i * 12.9) + 1) / 2;
    roomZ.forEach((rz, ri) => [-1, 1].forEach(sx => { const cx = sx * 8.5, k = ri * 2 + (sx > 0 ? 1 : 0);
      for (let i = 0; i < 3; i++) { const x = cx + (rnd(k * 9 + i) - 0.5) * 7, z = rz + (rnd(k * 7 + i + 50) > 0.5 ? 1 : -1) * (5 + rnd(k + i) * 2); const s = 0.8 + rnd(k * 3 + i) * 0.6; part(props, B(s, s, s), toon(i % 2 ? '#5a4a3a' : T.trim, 'panel'), x, s / 2, z, 0, rnd(i + k)); box(x, z, s / 2, s / 2); }
      part(props, B(2.2, 1, 0.8), '#2a2c32', sx * 13, 0.5, rz); part(props, B(1.8, 0.05, 0.5), glow(k % 2 ? '#4fd2ff' : T.neon), sx * 12.9, 1.05, rz, sx * 0.3); box(sx * 13, rz, 1.1, 0.4);
      if (C.type === 'derelict' || C.type === 'hive') for (let i = 0; i < 2; i++) { const x = cx + (i ? 2.5 : -2.5), z = rz; part(props, new THREE.SphereGeometry(0.7, 8, 6), glow(C.type === 'hive' ? '#ffb347' : '#7fff6a'), x, 0.6, z); solid(x, z, 0.7); }
    }));
    for (const sx of [-1, 1]) part(props, Cy(0.15, 0.15, D * 2, 6), '#5d636c', sx * 2.2, H - 0.5, 0, Math.PI / 2);
    // emergency lights
    for (const z of [-24, 0, 24]) { const l = new THREE.PointLight(new THREE.Color(T.light), 1.2, 22); l.position.set(0, H - 1, z); levelGroup.add(l); if (C.type === 'derelict') levelAnims.push(t => { l.intensity = Math.sin(t * 9 + z) > 0.7 ? 0.2 : 1.2; }); }
    // the airlock home
    part(props, B(5, 4.4, 0.4), '#3a3d44', 0, 2.2, D - 0.4); part(props, B(3.4, 3.6, 0.2), glow('#4fd2ff'), 0, 1.9, D - 0.62);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.6), new THREE.MeshBasicMaterial({ map: signTex('AIRLOCK', '#0f1757', '#ffd75e') })); sg.position.set(0, 4.3, D - 0.7); sg.rotation.y = Math.PI; props.add(sg);
    INTERACTS.push({ x: 0, z: D - 2.5, r: 3.2, label: 'Airlock: back to your ship', fn: leaveBoarding });
    // captain's cabin at the far end
    part(props, B(4, 1.2, 1.4), toon(T.trim, 'panel'), 0, 0.6, -D + 1.6); box(0, -D + 1.6, 2, 0.7);
    if (C.type === 'flagship') { part(props, new THREE.CircleGeometry(2, 20), glow('#b3262c'), 0, 2.8, -D + 0.32); }
    levelAnims.push(t => boardTick(t));
  }
};
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'boarding') return false; return _po(id); }; }
function boardEnemies() { return enemies.filter(e => e.sp.board); }
function boardTick(t) {
  const C = BOARD.cur; if (!C || LEVEL.id !== 'boarding' || C.cleared) return;
  const left = boardEnemies().filter(e => !e.dead && !e.gone).length;
  if (left === 0 && enemies.some(e => e.sp.board)) { C.cleared = true; boardCleared(); }
}
function boardCleared() {
  const C = BOARD.cur, T = HULK_TYPES[C.type]; toast('SHIP CLEARED', `${T.name} is yours. Loot the hold at the bow.`, 3.5); SFX.level();
  questProgressKill('board'); questProgressKill('board_' + C.type); ST().boarded = (ST().boarded || 0) + 1;
  if (BOARD.wrecks) BOARD.wrecks = BOARD.wrecks.filter(w => w.id !== C.id);
  const chest = makeSalvageCrate(false); chest.scale.setScalar(1.4); chest.position.set(0, 0, -30); levelGroup.add(chest);
  levelAnims.push(t => { if (!chest.parent) return; chest.rotation.y = t * 0.8; if (Math.hypot(player.pos.x, player.pos.z + 30) < 2.2 && player.alive) { levelGroup.remove(chest); burst(V(0, 1, -30), '#ffd36a', 30, 6); boardLoot(C); } });
}
function boardLoot(C) {
  const cr = 300 + C.lv * 70 + (C.type === 'flagship' ? 5000 : 0); S.cr += cr; S.inv.scrap = (S.inv.scrap || 0) + 4 + randi(0, 4); S.inv.ore = (S.inv.ore || 0) + 2;
  const got = [`${cr.toLocaleString()} cr`, 'scrap', 'ore'];
  if (C.type === 'drome' && questWants('fleetcode')) { S.inv.fleetcode = (S.inv.fleetcode || 0) + 1; got.push('a Fleet Code'); }
  if (Math.random() < 0.3 && (S.inv.medkit || 0) < 9) { S.inv.medkit = (S.inv.medkit || 0) + 2; got.push('2 medkits'); }
  if (typeof droneS === 'function' && Math.random() < 0.5) { const D0 = droneS(); D0.parts = (D0.parts || 0) + 1 + (C.type === 'flagship' ? 4 : 0); got.push('drone parts'); }
  log(`Looted the hold: ${got.join(', ')}.`, 'loot'); SFX.coin(); markDirty(); checkReady();
  if (Math.random() < 0.45 || C.type === 'flagship') setTimeout(() => scavenge('in the hold'), 900);
}
function leaveBoarding() {
  const C = BOARD.cur; if (!C) { travel('ship'); return; }
  if (!C.cleared && boardEnemies().some(e => !e.dead)) { openDlg('Airlock', 'Leave now?'); $('dlgLine').textContent = "The crew isn't cleared. If you leave, this ship will slip away."; acts([['Leave', () => { closeDlg(); doLeave(); }], ['Stay and fight', closeDlg, true]]); return; }
  doLeave();
  function doLeave() { const out = C.pos.clone().add(V(0, 20, HULK_TYPES[C.type].big ? 140 : 70)); if (!C.cleared && BOARD.wrecks) BOARD.wrecks = BOARD.wrecks.filter(w => w.id !== C.id); BOARD.cur = null; travel('space', { at: { x: out.x, y: out.y, z: out.z, yaw: 0 } }); }
}
// guide the quest arrow to ships in space and to crew on board
{ const _qt = questTarget; questTarget = function () {
  const id = trackedQuest(), q = id && QDEFS[id], s = id && S.qst[id];
  if (q && s && s.st === 'active') { const k = q.obj.findIndex((o, i) => !objDone(o, s.p[i])), o = q.obj[Math.max(0, k)];
    if (o && o.board) {
      if (LEVEL.id === 'boarding') { let best = null, bd = 1e9; for (const e of enemies) if (!e.dead && e.sp.board) { const d = e.obj.position.distanceTo(player.pos); if (d < bd) { bd = d; best = e; } } return best ? { p: best.obj.position, label: 'Clear the crew' } : { p: V(0, 0, -30), label: 'Loot the hold' }; }
      if (LEVEL.id === 'space') { let best = null, bd = 1e9; const want = o.board === 'any' ? null : o.board; const list = [...(BOARD.wrecks || [])]; if (qState('d3') && qState('d3').st === 'active') list.push({ type: 'flagship', pos: flagshipPos() }); for (const W of list) { if (want && W.type !== want) continue; const d = W.pos.distanceTo(player.pos); if (d < bd) { bd = d; best = W; } } return best ? { p: best.pos, label: `Fly to the ${HULK_TYPES[best.type].name}` } : null; }
      return goto('space', null, '');
    }
  }
  return _qt();
}; }
