// =================== WORLD RAIDS + COMMANDER MODE ===================
// Every 15 minutes (same clock for everyone) Drome's remnants raid one planet for 5 minutes.
// Anyone there fights the waves; one player can take the War Table and command extra squads against them.
const RAID_WORLDS = ['earth', 'mezar', 'capitone', 'robot', 'moon', 'fort', 'zarlich', 'vector'];
const RAID_PERIOD = 15 * 60 * 1000, RAID_LEN = 5 * 60 * 1000;
const RAID = { key: null, wave: 0, nextWave: 0, kills: 0, boss: false };
function raidNow() { const t = Date.now(), k = Math.floor(t / RAID_PERIOD), into = t - k * RAID_PERIOD; return { key: k, world: RAID_WORLDS[k % RAID_WORLDS.length], active: into < RAID_LEN, left: RAID_LEN - into, next: RAID_PERIOD - into }; }
let raidEl = null;
function raidHud() {
  if (!raidEl) { raidEl = document.createElement('button'); raidEl.id = 'raidBar'; raidEl.className = 'hbtn win'; $('hud').appendChild(raidEl); raidEl.addEventListener('click', () => { const R = raidNow(); if (R.active && LEVEL.id !== R.world && planetOpen(R.world) && shipUnlocked()) travel(R.world); }); }
  const R = raidNow(), name = LEVELS[R.world] ? LEVELS[R.world].name : R.world, mm = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  if (state !== 'play' || LEVEL.fly && !R.active) { raidEl.hidden = true; return; }
  raidEl.hidden = false;
  raidEl.textContent = R.active ? (LEVEL.id === R.world ? `⚔ RAID HERE · wave ${RAID.wave} · ${mm(R.left)} · ${RAID.kills} kills` : `⚔ RAID on ${name} · ${mm(R.left)}${planetOpen(R.world) && shipUnlocked() ? ' · tap to go' : ''}`) : `Next raid: ${LEVELS[RAID_WORLDS[(R.key + 1) % RAID_WORLDS.length]].name} in ${mm(R.next)}`;
  raidEl.style.borderColor = R.active ? '#ff6a5a' : '';
}
function raidTypes() { const ts = (LEVEL.spawns || []).filter(s => ENEMY[s.type] && !ENEMY[s.type].boss).map(s => s.type); return ts.length ? [...new Set(ts)] : ['xr17']; }
function raidBossType() { const b = (LEVEL.spawns || []).find(s => ENEMY[s.type] && ENEMY[s.type].boss); return b ? b.type : 'drome'; }
function raidAnchor() { const s = (LEVEL.safes || [])[0] || { x: 0, z: 0, r: 10 }, c = WORLD_C, dx = c.x - s.x, dz = c.z - s.z, d = Math.hypot(dx, dz) || 1; return { x: s.x + dx / d * (s.r + 16), z: s.z + dz / d * (s.r + 16) }; }
function raidZone() { return ZONES.find(z => !z.safe) || ZONES[0]; }
function raidSpawn(type, x, z, lv, tag) {
  const zn = raidZone(); if (!zn || !ENEMY[type]) return null;
  const e = makeEnemy({ zone: zn.id, type, n: 1, lv: [lv, lv], once: true, raid: true, cmd: tag || null });
  e.obj.position.set(x, groundH(x, z), z); e.aggro = true; e.raidT = gameTime; burst(e.obj.position.clone().add(V(0, 1, 0)), '#ff2a3a', 10, 4); return e;
}
function raidTick() {
  const R = raidNow();
  if (RAID.key !== R.key) { RAID.key = R.key; RAID.wave = 0; RAID.nextWave = 0; RAID.kills = 0; RAID.boss = false; if (R.active) { toast('RAID ALERT', `Drome's remnants are hitting ${LEVELS[R.world].name}!`, 4); SFX.horn(); } }
  if (!R.active || LEVEL.id !== R.world || state !== 'play' || LEVEL.fly) return;
  const lv = Math.max(S.lvl, 3);
  if (gameTime > RAID.nextWave) { RAID.wave++; RAID.nextWave = gameTime + 35; const A = raidAnchor(), ts = raidTypes(), n = Math.min(4 + RAID.wave, 9);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; raidSpawn(ts[i % ts.length], A.x + Math.cos(a) * 6, A.z + Math.sin(a) * 6, lv + (i % 3 === 0 ? 1 : 0)); }
    if (RAID.wave >= 6 && !RAID.boss) { RAID.boss = true; raidSpawn(raidBossType(), A.x, A.z, lv + 2); toast('RAID BOSS', `${ENEMY[raidBossType()].name} leads the raid!`, 3); }
    else toast(`RAID WAVE ${RAID.wave}`, `${n} raiders at the edge of town`, 2.2); SFX.horn(); }
  // clean up raiders that are too far gone (fell, left the map)
}
ITEMS.raidtoken = { name: 'Raid Token', v: 0, col: '#ff6a5a' };
{ const _k = kill; kill = function (e) { const r = _k(e); if (e.sp && e.sp.raid) { RAID.kills++; S.inv.raidtoken = (S.inv.raidtoken || 0) + (e.def.boss ? 10 : 1); S.cr += e.def.boss ? 800 : 25; if (e.def.boss) { toast('RAID BOSS DOWN', '+10 Raid Tokens · +800 cr', 3); SFX.level(); } markDirty(); } return r; }; }
// enemies spawned for a raid never respawn
{ const _re = resetEnemy; resetEnemy = function (e) { if (e.sp && e.sp.raid && e.dead) { e.gone = true; scene.remove(e.obj); return; } return _re(e); }; }
setInterval(() => { try { raidTick(); raidHud(); for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].gone) enemies.splice(i, 1); } catch (_) {} }, 500);
// raid token shop at the Fort quartermaster and the Mayor
const RAID_SHOP = [['Raid Cape', 25, () => { S.flags = S.flags || {}; S.flags.raidcape = true; }], ['5 Space Ore + 10 Scrap', 6, () => { S.inv.ore = (S.inv.ore || 0) + 5; S.inv.scrap = (S.inv.scrap || 0) + 10; }], ['3 Medkits', 3, () => { S.inv.medkit = (S.inv.medkit || 0) + 3; }], ['2,000 credits', 8, () => { S.cr += 2000; }], ['Commander Banner (cape)', 60, () => { S.flags = S.flags || {}; S.flags.cmdcape = true; }]];
CAPES.raidcape = { name: 'Raid Cape', lvl: 1, flag: 'raidcape', col: '#7a1e1e', trim: '#ff6a5a' };
CAPES.cmdcape = { name: 'Commander Banner', lvl: 1, flag: 'cmdcape', col: '#1e1c22', trim: '#ffd36a' };
function openRaidShop(n) {
  openDlg('Raid rewards', n ? n.name : 'Quartermaster'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; const R = raidNow(); $('dlgLine').textContent = `Raid Tokens: ${S.inv.raidtoken || 0}. Raids hit a different world every 15 minutes (${R.active ? 'one is ON right now on ' + LEVELS[R.world].name : 'next: ' + LEVELS[RAID_WORLDS[(R.key + 1) % RAID_WORLDS.length]].name}). Every raider is worth a token; bosses are worth ten.`;
    RAID_SHOP.forEach(([nm, cost, fn]) => { const r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.textContent = nm; const m = document.createElement('span'); m.className = 'meta'; m.textContent = `${cost} tokens`; const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Buy'; b.disabled = (S.inv.raidtoken || 0) < cost;
      b.addEventListener('click', () => { S.inv.raidtoken -= cost; fn(); SFX.coin(); log(`Bought: ${nm}`, 'loot'); markDirty(); render(); }); r.append(a, m, b); rows.appendChild(r); }); };
  $('dlgActs').before(rows); render(); acts([['War Table (Commander)', () => { closeDlg(); cmdStart(); }, true], ['Done', closeDlg]]);
}
{ const add = (lv, id) => { const n = (LEVELS[lv].npcs || []).find(q => q.id === id); if (n) n.custom = [...(n.custom || []), ['Raids', q => openRaidShop(q)]]; }; add('fort', 'brix'); add('fort', 'hale'); add('earth', 'mayor'); }
// ---------------- Commander mode: an isometric war table ----------------
const CMD = { on: false, pts: 0, sel: 0, cam: V(0, 0, 0), seq: 0, out: [], zoom: 46, earn: 0 };
const cmdSeen = new Map();
let cmdEl = null;
function cmdStart() {
  if (!LEVEL.terrain || LEVEL.fly || LEVEL.id === 'ship') { log('The War Table needs an open planet.'); return; }
  CMD.on = true; CMD.pts = 40; CMD.cam.set(player.pos.x, 0, player.pos.z); CMD.earn = gameTime;
  if (document.pointerLockElement) document.exitPointerLock();
  vm.visible = false; $('touch').hidden = true;
  if (!cmdEl) { cmdEl = document.createElement('div'); cmdEl.id = 'cmdBar'; cmdEl.className = 'win'; $('hud').appendChild(cmdEl); }
  cmdEl.hidden = false; cmdRender(); if (raidEl) raidEl.style.visibility = 'hidden';
  toast('WAR TABLE', 'Support: airstrikes, turrets, supplies and allies. Tap the map to call them in.', 4); SFX.horn();
}
function cmdStop() { CMD.on = false; if (cmdEl) cmdEl.hidden = true; if (raidEl) raidEl.style.visibility = ''; $('touch').hidden = !(TOUCH && state === 'play'); log('You leave the War Table.'); }
// Support mode (default): call in airstrikes, sentry turrets, supply drops and allied squads to help whoever is fighting here.
// Invade mode: drop hostile squads on the other players on this planet.
const CMD_SUPPORT = [
  { k: 'strike', name: 'Airstrike', cost: 25, desc: 'Bombs a spot 2s later' },
  { k: 'turret', name: 'Sentry turret', cost: 35, desc: 'Auto-fires for 45s' },
  { k: 'supply', name: 'Supply drop', cost: 15, desc: 'Heals whoever grabs it' },
  { k: 'allies', name: 'Allied squad', cost: 45, desc: '3 troopers fight for 60s' },
  { k: 'orbital', name: 'Orbital lance', cost: 90, desc: 'Huge blast' }
];
CMD.mode = 'support';
const CMD_FX = { turrets: [], allies: [], crates: [] };
function cmdUnits() { if (CMD.mode === 'support') return CMD_SUPPORT; const ts = raidTypes(); return [...ts.slice(0, 3).map(t => ({ t, n: 3, cost: 12, name: ENEMY[t].name + ' ×3' })), { t: raidBossType(), n: 1, cost: 70, boss: true, name: '★ ' + ENEMY[raidBossType()].name }]; }
function cmdRender() {
  if (!cmdEl) return; const U = cmdUnits(), troopers = [...remotes.values()].length, R = raidNow();
  const head = CMD.mode === 'support' ? `WAR TABLE · SUPPORT · ⚡ ${Math.floor(CMD.pts)}${R.active && R.world === LEVEL.id ? ' · RAID ON: support kills earn tokens' : ''}` : `WAR TABLE · INVADE · ⚡ ${Math.floor(CMD.pts)} · troopers here: ${troopers}`;
  cmdEl.innerHTML = `<div class="cmdh">${head}</div>` + U.map((u, i) => `<button class="pbtn${CMD.sel === i ? ' go' : ''}" data-i="${i}" title="${u.desc || ''}">${u.name} · ${u.cost}⚡</button>`).join('') + `<button class="pbtn" data-m="1">${CMD.mode === 'support' ? '⚔ Switch to Invade' : '🛡 Switch to Support'}</button><button class="pbtn" data-x="1">Leave table</button>`;
  cmdEl.querySelectorAll('button').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); if (b.dataset.x) return cmdStop(); if (b.dataset.m) { CMD.mode = CMD.mode === 'support' ? 'invade' : 'support'; CMD.sel = 0; SFX.ui(); return cmdRender(); } CMD.sel = +b.dataset.i; SFX.ui(); cmdRender(); }));
}
function supportKill(e, dmg) { if (!e || e.dead) return; e.hp -= dmg; e.aggro = true; e.hitT = 0.12; if (e.hp <= 0) { kill(e); gainXp(Math.round(e.def.xp * 0.6)); if (raidNow().active && raidNow().world === LEVEL.id && !(e.sp && e.sp.raid)) { S.inv.raidtoken = (S.inv.raidtoken || 0) + 1; } } else updatePlate(e); }
function cmdSupport(U, p) {
  const lv = Math.max(S.lvl, 3), boom = (pos, r, dmg, col) => { burst(pos.clone().add(V(0, 0.5, 0)), col, 30, 9); burst(pos.clone().add(V(0, 0.5, 0)), '#ffd36a', 12, 5); SFX.boom(); for (const e of enemies) { if (e.dead) continue; const d = e.obj.position.distanceTo(pos); if (d < r) supportKill(e, dmg * (1 - 0.5 * d / r)); } };
  if (U.k === 'strike') { const mk = new THREE.Mesh(new THREE.RingGeometry(3.5, 4, 24), new THREE.MeshBasicMaterial({ color: '#ff2a3a', transparent: true, opacity: 0.7, side: THREE.DoubleSide })); mk.rotation.x = -Math.PI / 2; mk.position.set(p.x, groundH(p.x, p.z) + 0.2, p.z); levelGroup.add(mk); setTimeout(() => { levelGroup.remove(mk); for (let k = 0; k < 4; k++) setTimeout(() => boom(V(p.x + (Math.random() - 0.5) * 5, groundH(p.x, p.z), p.z + (Math.random() - 0.5) * 5), 4.5, 260 * (1 + lv * 0.12), '#ff6a1a'), k * 180); }, 2000); }
  if (U.k === 'orbital') { const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 120, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#4fd2ff', transparent: true, opacity: 0.0, depthWrite: false })); beam.position.set(p.x, groundH(p.x, p.z) + 60, p.z); levelGroup.add(beam); let t0 = performance.now(); const tick = () => { const k = (performance.now() - t0) / 1500; beam.material.opacity = Math.min(0.8, k); beam.scale.set(1 + k * 3, 1, 1 + k * 3); if (k < 1) requestAnimationFrame(tick); else { levelGroup.remove(beam); boom(V(p.x, groundH(p.x, p.z), p.z), 9, 1200 * (1 + lv * 0.12), '#4fd2ff'); } }; tick(); }
  if (U.k === 'turret') { const g = new THREE.Group(); part(g, Cy(0.5, 0.6, 0.5, 8), '#5d636c', 0, 0.25, 0); const head = new THREE.Group(); head.position.y = 0.9; g.add(head); part(head, B(0.6, 0.4, 0.6), '#3b4f7a', 0, 0, 0); part(head, Cy(0.06, 0.06, 0.8, 6), '#2b2a2c', 0, 0, 0.5, Math.PI / 2); part(head, B(0.2, 0.1, 0.02), glow('#4fd2ff'), 0, 0.1, 0.31); g.position.set(p.x, groundH(p.x, p.z), p.z); levelGroup.add(g); burst(g.position.clone(), '#4fd2ff', 14, 4); CMD_FX.turrets.push({ g, head, life: 45, cd: 0, dmg: 40 * (1 + lv * 0.1) }); }
  if (U.k === 'supply') { const c = makeSalvageCrate ? makeSalvageCrate(false) : new THREE.Group(); c.position.set(p.x, groundH(p.x, p.z) + 8, p.z); levelGroup.add(c); CMD_FX.crates.push({ c, y: groundH(p.x, p.z), life: 60 }); }
  if (U.k === 'allies') for (let i = 0; i < 3; i++) { const o = buildChar(() => recolor(makeTrooper(), { '#6f7a3e': '#3b4f7a', '#c9b27c': '#e8eef2' }), 'trooper'); blob(o, 0.45); o.position.set(p.x + (i - 1) * 1.4, groundH(p.x, p.z), p.z + (i % 2)); levelGroup.add(o); CMD_FX.allies.push({ o, st: {}, life: 60, cd: Math.random(), dmg: 30 * (1 + lv * 0.1) }); }
}
function cmdFxTick(dt, t) {
  const near = (pos, r) => { let best = null, bd = r; for (const e of enemies) { if (e.dead) continue; const d = e.obj.position.distanceTo(pos); if (d < bd) { bd = d; best = e; } } return best; };
  for (let i = CMD_FX.turrets.length - 1; i >= 0; i--) { const T = CMD_FX.turrets[i]; T.life -= dt; if (T.life <= 0 || !T.g.parent) { levelGroup.remove(T.g); CMD_FX.turrets.splice(i, 1); continue; } const e = near(T.g.position, 18); if (!e) continue; T.head.rotation.y = Math.atan2(e.obj.position.x - T.g.position.x, e.obj.position.z - T.g.position.z); T.cd -= dt; if (T.cd <= 0) { T.cd = 0.5; tracer(T.g.position.clone().add(V(0, 0.95, 0)), e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), '#4fd2ff'); supportKill(e, T.dmg); } }
  for (let i = CMD_FX.allies.length - 1; i >= 0; i--) { const A = CMD_FX.allies[i], o = A.o; A.life -= dt; if (A.life <= 0 || !o.parent) { if (o.parent) { burst(o.position.clone().add(V(0, 1, 0)), '#4fd2ff', 10, 3); levelGroup.remove(o); } CMD_FX.allies.splice(i, 1); continue; } const e = near(o.position, 30); if (e) { const dx = e.obj.position.x - o.position.x, dz = e.obj.position.z - o.position.z, d = Math.hypot(dx, dz); o.rotation.y = Math.atan2(dx, dz); if (d > 9) { o.position.x += dx / d * 3.2 * dt; o.position.z += dz / d * 3.2 * dt; o.position.y = groundH(o.position.x, o.position.z); } A.cd -= dt; if (A.cd <= 0 && d < 16) { A.cd = 0.8; tracer(o.position.clone().add(V(0, 1.3, 0)), e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), '#ffd36a'); supportKill(e, A.dmg); } } animRig(o, A.st, dt, t); }
  for (let i = CMD_FX.crates.length - 1; i >= 0; i--) { const C = CMD_FX.crates[i]; C.life -= dt; if (C.c.position.y > C.y) C.c.position.y = Math.max(C.y, C.c.position.y - 6 * dt); const takers = [player.pos, ...[...remotes.values()].map(r => r.obj.position)]; if (C.life <= 0 || takers.some(q => Math.hypot(q.x - C.c.position.x, q.z - C.c.position.z) < 1.8)) { if (C.life > 0 && Math.hypot(player.pos.x - C.c.position.x, player.pos.z - C.c.position.z) < 1.8) { player.hp = maxHp(); toast('SUPPLY DROP', 'Fully healed', 1.5); SFX.item(); } levelGroup.remove(C.c); CMD_FX.crates.splice(i, 1); } }
}
{ const _ll2 = loadLevel; loadLevel = function (id, o) { CMD_FX.turrets.length = 0; CMD_FX.allies.length = 0; CMD_FX.crates.length = 0; return _ll2(id, o); }; }
{ const _s2 = step; let lt = 0; step = function (dt) { _s2(dt); try { if (CMD_FX.turrets.length || CMD_FX.allies.length || CMD_FX.crates.length) cmdFxTick(dt, gameTime); } catch (_) {} }; }
function cmdPlace(cx, cy) {
  const U = cmdUnits()[CMD.sel]; if (!U) return; if (CMD.pts < U.cost) { toast('NOT ENOUGH ⚡', 'Command points recharge over time', 1.2); return; }
  const r = renderer.domElement.getBoundingClientRect(), nd = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(nd, camera);
  const o = rc.ray.origin, d = rc.ray.direction; let t = 0, p = null; for (; t < 300; t += 0.5) { const q = o.clone().addScaledVector(d, t); if (q.y <= groundH(q.x, q.z)) { p = q; break; } } if (!p) return;
  if (CMD.mode === 'support') { if (U.k !== 'supply' && SAFES.some(s => s.r < 60 && Math.hypot(p.x - s.x, p.z - s.z) < s.r)) { toast('NOT IN TOWN', 'Support fire only outside safe zones', 1.2); return; } CMD.pts -= U.cost; cmdSupport(U, p); gainXp(Math.round(U.cost * 2)); SFX.zap && SFX.zap(); cmdRender(); return; }
  if (inSafe(p) || SAFES.some(s => Math.hypot(p.x - s.x, p.z - s.z) < s.r + 4)) { toast('NO DROPS IN TOWN', 'Safe zones are off limits', 1.2); return; }
  CMD.pts -= U.cost; const lv = Math.max(S.lvl, 3) + (U.boss ? 2 : 0), id = ++CMD.seq;
  CMD.out.push([id, U.t, +p.x.toFixed(1), +p.z.toFixed(1), lv, U.n]); while (CMD.out.length > 6) CMD.out.shift(); sendPresence(true);
  for (let i = 0; i < U.n; i++) raidSpawn(U.t, p.x + (i - 1) * 1.6, p.z + (i % 2) * 1.4, lv, 'me');
  gainXp(Math.round(U.cost * 3)); SFX.zap && SFX.zap(); cmdRender();
}
renderer.domElement.addEventListener('pointerdown', e => { if (CMD.on && state === 'play' && !dlgOpen) { CMD.drag = { x: e.clientX, y: e.clientY, cx: CMD.cam.x, cz: CMD.cam.z, moved: false }; } });
renderer.domElement.addEventListener('pointermove', e => { if (CMD.on && CMD.drag) { const dx = e.clientX - CMD.drag.x, dy = e.clientY - CMD.drag.y; if (Math.hypot(dx, dy) > 8) CMD.drag.moved = true; if (CMD.drag.moved) { const k = CMD.zoom / 400; CMD.cam.x = CMD.drag.cx - dx * k; CMD.cam.z = CMD.drag.cz - dy * k; } } });
renderer.domElement.addEventListener('pointerup', e => { if (CMD.on && CMD.drag) { if (!CMD.drag.moved) cmdPlace(e.clientX, e.clientY); CMD.drag = null; } });
{ const _s = step; step = function (dt) {
  _s(dt); if (!CMD.on) return;
  if (LEVEL.fly || !LEVEL.terrain || !player.alive) return cmdStop();
  const sp = 30 * dt; CMD.cam.x += ((keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0)) * sp; CMD.cam.z += ((keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0)) * sp;
  const dx = CMD.cam.x - WORLD_C.x, dz = CMD.cam.z - WORLD_C.z, dd = Math.hypot(dx, dz); if (dd > WORLD_R) { CMD.cam.x = WORLD_C.x + dx / dd * WORLD_R; CMD.cam.z = WORLD_C.z + dz / dd * WORLD_R; }
  const gy = groundH(CMD.cam.x, CMD.cam.z); camera.position.set(CMD.cam.x, gy + CMD.zoom, CMD.cam.z + CMD.zoom * 0.75); camera.lookAt(CMD.cam.x, gy, CMD.cam.z); vm.visible = false;
  CMD.pts = Math.min(150, CMD.pts + dt * (3 + remotes.size * 1.5 + (raidNow().active && raidNow().world === LEVEL.id ? 3 : 0)));
  if (gameTime - CMD.earn > 10) { CMD.earn = gameTime; if (remotes.size) { S.cr += 20 * remotes.size; markDirty(); } }
  if (Math.random() < dt * 2) cmdRender(); }; }
// commanders' drops arrive through presence: every trooper on that planet gets the squad
{ const _sp = sendPresence; sendPresence = function (force) { if (CMD.on && room && state !== 'menu') { lastPresence = 0; } return _sp(force); }; }
{ const _sync = syncPeers; syncPeers = function (peers) { _sync(peers);
  for (const peer of peers) { if (peer.isMe || !peer.presence) continue; const pr = peer.presence; if (!Array.isArray(pr.cmd) || pr.lv !== (LEVEL && LEVEL.id)) continue;
    const seen = cmdSeen.get(peer.peer) || 0; let mx = seen;
    for (const o of pr.cmd) { if (!Array.isArray(o) || o.length < 6) continue; const [id, t, x, z, lv, n] = o; if (id <= seen || !ENEMY[t]) continue; mx = Math.max(mx, id);
      if (seen === 0 && Date.now() - (pr.cmt || 0) > 15000) continue;
      for (let i = 0; i < Math.min(3, n); i++) raidSpawn(t, x + (i - 1) * 1.6, z + (i % 2) * 1.4, Math.min(60, lv), 'remote');
      toast('ENEMY COMMANDER', `${String(pr.nick || 'A commander').slice(0, 16)} dropped ${ENEMY[t].name}${n > 1 ? ' ×' + n : ''}!`, 2); SFX.horn(); }
    cmdSeen.set(peer.peer, mx); } }; }
{ const _ue = updateEnv; updateEnv = function (a, b) { _ue(a, b); if (CMD.on) { scene.fog.near = 90; scene.fog.far = 360; clouds.visible = false; rain.visible = false; } }; }
window.__raid = { get CMD() { return CMD; }, cmdStart, cmdPlace, raidSpawn, raidNow, RAID };
