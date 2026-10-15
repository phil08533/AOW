// =================== FORT IRONROCK RAIDS: the Crucible, with deadliness you choose; healing spells for friends ===================
// world raids now happen only at Fort Ironrock
RAID_WORLDS.length = 0; RAID_WORLDS.push('fort');
// Fort Ironrock only ever plays its own music
{ const _mc = musContext; musContext = function (dt) { const c = _mc(dt); if (c === 'cutscene' || c === null) return c; if (LEVEL && (LEVEL.id === 'fort' || LEVEL.id === 'crucible')) return 'fort'; return c; }; }
// ---- deadliness tiers: tougher enemies, bigger paydays ----
const DEADLY = [
  { name: 'Recruit', hp: 1, dmg: 1, pay: 1, col: '#6fdc5a' },
  { name: 'Soldier', hp: 1.7, dmg: 1.3, pay: 2.2, col: '#ffd36a' },
  { name: 'Veteran', hp: 2.6, dmg: 1.7, pay: 4, col: '#ff9a3c' },
  { name: 'Elite', hp: 4, dmg: 2.2, pay: 7, col: '#ff3b2a' },
  { name: 'Apocalypse', hp: 6, dmg: 3, pay: 12, col: '#c86aff' },
];
const CRU = { tier: 0, wave: 0, waveT: 0, boss: null, done: false, dealt: 0, sendT: 0, key: 0, start: 0 };
const cruPay = t => ({ cr: Math.round((2500 + S.lvl * 120) * DEADLY[t].pay), tok: 4 + t * 4, xp: Math.round((4000 + S.lvl * 400) * DEADLY[t].pay) });
function openRaidCommand() {
  openDlg('Fort Ironrock', 'Raid Command'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  $('dlgLine').textContent = 'The Crucible: a live-fire raid arena. Three waves of elite troops, then the Iron Tyrant. Pick how deadly. The deadlier it is, the more it pays. Die and the raid is over. Anyone else in the Crucible on the same setting fights the same Tyrant.';
  DEADLY.forEach((D, t) => { const p = cruPay(t), r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.innerHTML = `<b style="color:${D.col}">${'☠'.repeat(t + 1)} ${D.name}</b><br><small style="color:var(--dim)">Enemies ×${D.hp} health, ×${D.dmg} damage</small>`; const b = document.createElement('span'); b.className = 'meta'; b.style.fontSize = '13px'; b.textContent = `${p.cr.toLocaleString()} cr · ${p.tok} tokens`; const c = document.createElement('span'); const bt = document.createElement('button'); bt.className = 'pbtn go'; bt.textContent = 'Deploy'; bt.addEventListener('click', () => { SFX.ui(); closeDlg(); enterCrucible(t); }); c.appendChild(bt); r.append(a, b, c); rows.appendChild(r); });
  $('dlgActs').before(rows); acts([['Not yet', closeDlg, true]]);
}
function enterCrucible(t) { CRU.tier = t; CRU.wave = 0; CRU.waveT = 5; CRU.boss = null; CRU.done = false; CRU.dealt = 0; CRU.key = Math.floor(Date.now() / 600000); CRU.start = Date.now(); travel('crucible'); }
LEVELS.crucible = {
  id: 'crucible', name: 'The Crucible', tag: 'Fort Ironrock raid arena', lvls: 'Raid', size: 120, center: [0, 0], radius: 60, water: -99, sky: 'space', weather: 'none', hourOffset: 20,
  terrain: { a1: 0.3, f1: 0.05, a2: 0.1, f2: 0.12, a3: 0.05, f3: 0.25, base: 0.2, min: -1, edge: 10, step: 0 },
  palette: { grass: '#3a3430', patch: '#4a3a30', dirt: '#2a2420', sand: '#5a4a3a', wet: '#2a2420', rockA: '#3a3430', rockB: '#2a2420' },
  zones: [{ id: 'pit', name: 'The Crucible', lvl: 'Raid · hardcore', x: 0, z: 0, r: 30, fr: 30, col: '#5a2a24', h: 0 }],
  paths: [], river: [], pools: [], lava: [[0, 0, 3.2, 0.2]], safes: [], spawn: { x: 0, z: 24, yaw: 0 }, menu: { x: 0, z: 0, r: 30, h: 12 }, npcBase: [0, 0], npcs: [], spawns: [],
  build() {
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, x = Math.cos(a) * 32, z = Math.sin(a) * 32; part(props, B(6.6, 5 + (i % 3), 1.4), toon('#4a4440', 'stone'), x, 2.5, z, 0, -a + Math.PI / 2, 0); box(x, z, 1.6, 1.6); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, x = Math.cos(a) * 18, z = Math.sin(a) * 18; part(props, B(2, 3, 2), toon('#5a5e66', 'panel'), x, 1.5, z, 0, a, 0); part(props, B(2.1, 0.3, 2.1), glow('#ff3b2a'), x, 3.1, z, 0, a, 0); box(x, z, 1.1, 1.1); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.78, x = Math.cos(a) * 29, z = Math.sin(a) * 29; part(props, Cy(0.4, 0.6, 12, 6), '#2a2c32', x, 6, z); const l = new THREE.PointLight(0xff3b2a, 1.2, 40, 1.4); l.position.set(x, 11, z); levelGroup.add(l); part(props, B(1.4, 0.6, 1.4), glow('#ff3b2a'), x, 12, z); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.6), new THREE.MeshBasicMaterial({ map: signTex('THE CRUCIBLE', '#1e1c22', '#ff3b2a'), side: THREE.DoubleSide })); sg.position.set(0, 8, -31); levelGroup.add(sg);
    INTERACTS.push({ x: 0, z: 28, r: 2.5, label: 'Leave the Crucible', fn: () => leaveCrucible(false) });
    part(props, B(4, 4, 0.4), '#3a3d44', 0, 2, 30.8); part(props, B(3, 3.4, 0.2), glow('#4fd2ff'), 0, 1.8, 30.6);
    levelAnims.push(t => cruTick());
  }
};
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'crucible') return false; return _po(id); }; }
const CRU_TYPES = ['eliteguard', 'droid', 'spearman', 'bughybrid', 'guard', 'stagrone'];
let cruLast = 0;
function cruSpawn(type, n, lvBoost, boss) {
  const D = DEADLY[CRU.tier], lv = Math.min(60, S.lvl + CRU.tier * 2 + (lvBoost || 0)), out = [];
  for (let i = 0; i < n; i++) { if (!ENEMY[type]) break; const e = makeEnemy({ zone: 'pit', type, n: 1, lv: [lv, lv], once: true, crucible: true, at: boss ? [0, -16] : null });
    if (!boss) { const a = Math.random() * 6.28, r = 22 + Math.random() * 6; e.obj.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); }
    e.max *= D.hp * (boss ? 0.6 : 1); e.hp = e.max; e.aggro = true; updatePlate(e); out.push(e); }
  return out;
}
function cruTick() {
  if (LEVEL.id !== 'crucible' || CRU.done || state !== 'play') return; const now = performance.now(), dt = Math.min(0.1, (now - cruLast) / 1000 || 0.016); cruLast = now;
  const alive = enemies.filter(e => e.sp.crucible && !e.dead && !e.gone);
  if (CRU.wave < 3) { if (!alive.length) { CRU.waveT -= dt; if (CRU.waveT <= 0) { CRU.wave++; const n = 5 + CRU.tier * 2 + CRU.wave * 2; for (let i = 0; i < n; i++) cruSpawn(CRU_TYPES[(i + CRU.wave) % CRU_TYPES.length], 1, CRU.wave); toast(`WAVE ${CRU.wave} / 3`, `${DEADLY[CRU.tier].name} · ${n} enemies`, 2); SFX.horn && SFX.horn(); CRU.waveT = 4; } } }
  else if (!CRU.boss) { CRU.boss = cruSpawn('krag', 1, 4, true)[0]; if (CRU.boss) { CRU.boss.def = Object.assign({}, CRU.boss.def, { name: 'The Iron Tyrant' }); CRU.bossHp = CRU.boss.hp; toast('THE IRON TYRANT', 'Everyone in the Crucible on this setting is fighting it', 3); } }
  else if (CRU.boss.dead || CRU.boss.hp <= 0) cruWin();
  else {
    // shared health: send what I dealt, a few times a second
    const d = CRU.bossHp - CRU.boss.hp; if (d > 0) { CRU.dealt += d; CRU.bossHp = CRU.boss.hp; }
    CRU.sendT -= dt; if (CRU.sendT <= 0 && CRU.dealt > 0 && room) { CRU.sendT = 0.4; room.emit('rdmg', { t: CRU.tier, k: CRU.key, d: Math.round(CRU.dealt) }).catch(() => {}); CRU.dealt = 0; }
    // shockwave every 9 s: stand far away or be in the air
    CRU.shockT = (CRU.shockT || 6) - dt; if (CRU.shockT <= 0) { CRU.shockT = Math.max(4, 9 - CRU.tier); const bp = CRU.boss.obj.position; burst(bp.clone().add(V(0, 0.5, 0)), '#ff3b2a', 40, 14); if (SFX.boom) SFX.boom(); if (player.onGround && player.pos.distanceTo(bp) < 10) hurt(40 + S.lvl * 3, CRU.boss); }
    if (alive.length < 3 + CRU.tier && Math.random() < dt * 0.25) cruSpawn(CRU_TYPES[Math.floor(Math.random() * CRU_TYPES.length)], 1, 2);
  }
}
function cruWin() {
  CRU.done = true; const p = cruPay(CRU.tier); S.cr += p.cr; gainXp(p.xp); S.raid = S.raid || {}; S.raid.tokens = (S.raid.tokens || 0) + p.tok; if (typeof droneS === 'function') droneS().parts += 2 + CRU.tier;
  S.cruBest = Math.max(S.cruBest || -1, CRU.tier); markDirty(); SFX.level(); for (const e of enemies) if (e.sp.crucible && !e.dead) { e.gone = true; scene.remove(e.obj); }
  openDlg('The Crucible', `${DEADLY[CRU.tier].name} raid cleared!`); $('dlgLine').textContent = `The Iron Tyrant is scrap. You earned ${p.cr.toLocaleString()} credits, ${p.tok} Raid Tokens, ${p.xp.toLocaleString()} XP and drone parts. Time: ${Math.round((Date.now() - CRU.start) / 1000)}s.`;
  acts([['Back to the Fort', () => { closeDlg(); leaveCrucible(true); }, true], ['Stay a moment', closeDlg]]);
}
function leaveCrucible(won) { for (const e of enemies) if (e.sp.crucible && !e.dead) { e.gone = true; scene.remove(e.obj); } CRU.boss = null; travel('fort'); if (!won && !CRU.done) toast('RAID ABANDONED', 'No payout', 2); }
// hardcore: enemies hit harder, and dying ends the raid
{ const _h = hurt; hurt = function (dmg, src) { return _h(LEVEL && LEVEL.id === 'crucible' ? dmg * DEADLY[CRU.tier].dmg : dmg, src); }; }
{ const _rs = respawn; respawn = function () { if (LEVEL && LEVEL.id === 'crucible') { player.alive = true; player.hp = maxHp(); CRU.done = true; toast('RAID FAILED', 'You were carried out of the Crucible', 3); loadLevel('fort'); return; } return _rs(); }; }
// ---- entrances: Hale and Torque, and a Raid Command terminal by the landing pad ----
for (const id of ['hale', 'torque']) { const n = (LEVELS.fort.npcs || []).find(n => n.id === id); if (n) n.custom = [...(n.custom || []), ['⚔ Raid Command', () => openRaidCommand()]]; }
{ const ob = LEVELS.fort.build; LEVELS.fort.build = function () { ob.call(this); const P = LEVELS.fort.pad || LEVELS.fort.spawn, x = P.x + 7, z = P.z + 2; const t = new THREE.Group(); part(t, B(1.4, 1.6, 0.8), '#2a2c32', 0, 0.8, 0); part(t, B(1.2, 0.8, 0.05), glow('#ff3b2a'), 0, 1.7, 0.42, -0.3); const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 14, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#ff3b2a', transparent: true, opacity: 0.3, depthWrite: false })); beam.position.y = 8; t.add(beam); at(t, x, z, Math.PI); solid(x, z, 0.8); INTERACTS.push({ x, z: z - 1.4, r: 2, label: '⚔ Raid Command (the Crucible)', fn: openRaidCommand }); }; }
// ---- shared boss health across everyone in the Crucible on the same setting ----
// ---- and healing spells you can cast on friends ----
let roomHooked = false;
setInterval(() => { if (roomHooked || !room || !room.on) return; roomHooked = true;
  try {
    room.on('rdmg', msg => { if (msg.isMe) return; const d = msg.data || {}; if (LEVEL.id !== 'crucible' || !CRU.boss || CRU.boss.dead || d.t !== CRU.tier || d.k !== CRU.key) return; const dmg = Math.max(0, Math.min(CRU.boss.max * 0.2, Number(d.d) || 0)); CRU.boss.hp -= dmg; CRU.bossHp = CRU.boss.hp; if (CRU.boss.hp <= 0) kill(CRU.boss); else updatePlate(CRU.boss); });
    room.on('heal', msg => { if (msg.isMe) return; const d = msg.data || {}; if (d.to !== myPeer || !player.alive) return; const amt = Math.max(0, Math.min(maxHp() * 0.4, Number(d.a) || 0)); player.hp = Math.min(maxHp(), player.hp + amt); burst(player.pos.clone().add(V(0, 1.2, 0)), '#6fdc5a', 20, 3); toast('HEALED', `+${Math.round(amt)} from ${String(d.n || 'a friend').slice(0, 16)}`, 1.6); SFX.ui(); });
  } catch (_) { roomHooked = false; }
}, 1000);
Object.assign(GUNS, {
  w_25: { name: 'Lvl 25 Mending Staff', dmg: 40, rate: 0.6, mag: 12, reload: 1.4, req: 10, price: 3500, col: '#6fdc5a', kind: 'mystic', elem: 'mend', mana: true, staff: 'crystal' },
  w_75: { name: 'Lvl 75 Lifebloom Staff', dmg: 120, rate: 0.7, mag: 12, reload: 1.5, req: 30, price: 38000, col: '#7fffb0', kind: 'mystic', elem: 'mend', mana: true, staff: 'orb', bloom: true },
});
SPELLS.mend = ['✚', 'Mending Light'];
for (const id of ['w_25', 'w_75']) GUNS[id].name = `${GUNS[id].name} · ${GUNS[id].bloom ? 'Lifebloom' : 'Mending Light'}`;
{ const m = LEVELS.earth.npcs.find(n => n.id === 'merla'); if (m) m.guns = [...m.guns, 'w_25']; const ix = LEVELS.zeltac.npcs.find(n => n.id === 'ixa'); if (ix) ix.guns = [...ix.guns, 'w_75']; }
// casting a mending spell at a friend heals them; with nobody under the crosshair it mends you a little
{ const _f = fire; fire = function () { const g = gun(); if (!g || g.elem !== 'mend' || handMelee() || LEVEL.fly) return _f();
  if (player.cool > 0 || player.ammo <= 0) return _f();
  const o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); let best = null, bt = 45;
  for (const r of remotes.values()) { const c = r.obj.position.clone().add(V(0, 1.1, 0)), t = raySphere(o, d, c, 0.9); if (t > 0 && t < bt) { bt = t; best = r; } }
  const amt = g.dmg * (1 + (S.lvl - 1) * 0.045) * 1.4;
  if (best) { player.ammo--; player.cool = g.rate; tracer(o.clone().add(d.clone().multiplyScalar(0.5)), best.obj.position.clone().add(V(0, 1.1, 0)), '#6fdc5a'); burst(best.obj.position.clone().add(V(0, 1.2, 0)), '#6fdc5a', 16, 3); SFX.ui();
    const targets = [best]; if (g.bloom) for (const r of remotes.values()) if (r !== best && r.obj.position.distanceTo(best.obj.position) < 6) targets.push(r);
    for (const r of targets) if (room && r.peerId) room.emit('heal', { to: r.peerId, a: Math.round(amt), n: S.nick }).catch(() => {});
    if (g.bloom) player.hp = Math.min(maxHp(), player.hp + amt * 0.3);
    log(`Mending Light → ${targets.length} friend${targets.length > 1 ? 's' : ''}`, 'loot'); return; }
  const r = _f(); if (player.hp < maxHp()) player.hp = Math.min(maxHp(), player.hp + amt * 0.15); return r; }; }
// ---- Fort Ironrock's introduction, the first time you land ----
function fortIntro(replay) {
  const P = LEVELS.fort.spawn;
  runCutscene({ title: 'FORT IRONROCK', music: 'fort', lock: 6, shots: [
    { text: 'Fort Ironrock. An army base carved into a drifting asteroid, the last line between the Fleet and Earth.', dur: 7, cam: (t, k) => { camera.position.set(P.x - 40 + k * 20, 30 - k * 8, P.z + 40 - k * 10); camera.lookAt(P.x, 2, P.z - 10); } },
    { text: 'Tanks, battle cars, mechs. If it rolls and shoots, they build it here.', dur: 6, cam: (t, k) => { const a = t * 0.2; camera.position.set(P.x + Math.cos(a) * 18, 6, P.z - 8 + Math.sin(a) * 18); camera.lookAt(P.x, 1.5, P.z - 8); } },
    { text: "And at the heart of the rock: the Crucible. A live-fire raid arena where troopers prove they're the deadliest in the galaxy.", dur: 7, cam: (t, k) => { camera.position.set(P.x + 12, 4 + k * 3, P.z + 6); camera.lookAt(P.x + 7, 2, P.z + 2); } },
    { text: 'Set the danger yourself. The deadlier the raid, the bigger the payday. See Raid Command.', dur: 6, cam: (t, k) => { camera.position.set(P.x + 4 - k * 2, 2.2, P.z + 8); camera.lookAt(P.x + 7, 1.6, P.z + 2); } },
  ], onEnd: () => { if (!replay) { S.flags = S.flags || {}; S.flags.fortIntro = 1; markDirty(); } } });
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'fort' && state === 'play' && !(S.flags && S.flags.fortIntro)) setTimeout(() => { if (LEVEL.id === 'fort' && state === 'play' && !CUT.on) fortIntro(); }, 900); return r; }; }
SCENES.splice(2, 0, ['fort', '🪖 Fort Ironrock', () => !!(S.flags && S.flags.fortIntro) || DEV_ALL, () => { if (LEVEL.id !== 'fort') loadLevel('fort'); setTimeout(() => fortIntro(true), 600); }]);
