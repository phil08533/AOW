// =================== THE WAR FOR THE FRONT (2.23.85): both sides sortie, three sectors with a moving line, MG charges ===================
// Between the big events the Front is never quiet. Our squads muster in the Muster Hall, go out through the Sally Port, down the
// communication trench and over the top to shell holes near their sector's line; Drome squads do the same from their side.
// Each sector (south, centre, north) has a front line that numbers and kills push back and forth. The wounded fall back, patch up
// in their own trench and go out again. While you're on a heavy MG the Drome pick your nest and send runner squads straight at it.
ENEMY.dfield = Object.assign({}, ENEMY.dtrooper, { name: 'Drome Rifleman', hp: 45, xp: 30, cr: [2, 4] });
ENEMY.drunner = Object.assign({}, ENEMY.dtrooper, { name: 'Drome Runner', hp: 20, speed: 4.6, xp: 18, cr: [1, 3], drops: [],
  make: () => { const g = recolor(makeTrooper(), { '#6f7a3e': '#3a1416', '#4a5229': '#1e1c22', '#c9b27c': '#ff5a3a' }); part(g, B(0.42, 0.08, 0.42), '#ff2a3a', 0, 1.86, 0); return g; },
  ranged: Object.assign({}, ENEMY.dtrooper.ranged, { dmg: 6, rate: 1.6 }) });
ENEMY.dshield = Object.assign({}, ENEMY.dtrooper, { name: 'Drome Shield Runner', hp: 70, speed: 3.0, xp: 60, cr: [4, 8], drops: [['scrap', 0.3]],
  make: () => { const g = recolor(makeTrooper(), { '#6f7a3e': '#1e1c22', '#4a5229': '#2a1416', '#c9b27c': '#b3262c' }); part(g, B(0.9, 1.3, 0.08), '#3a3d44', 0, 1.05, 0.5); part(g, B(0.6, 0.12, 0.09), glow('#ff2a3a'), 0, 1.4, 0.53); return g; } });
const FW = { sec: [{ n: 'SOUTH', z0: -14, z1: 10, line: -81 }, { n: 'CENTRE', z0: 10, z1: 42, line: -81 }, { n: 'NORTH', z0: 42, z1: 72, line: -81 }], ourT: 2, theirT: 4, hud: null, mg: null, pruneT: 10, lt: 0 };
const fwSecOf = z => z < 10 ? 0 : z < 42 ? 1 : 2, fwBays = s => s === 0 ? [0, 1] : s === 1 ? [3, 4, 5, 6] : [8, 9]; // bays 2 and 7 hold the MG nests, so squads climb out elsewhere
const fwLive = (side, s) => side ? FRONT.men.filter(m => m.field && !m.dead && (s == null || m.field.sec === s)) : frAlive().filter(e => e.front.mode === 'field' && (s == null || e.front.sec === s));
const fwY = (x, z) => FRONT.inPatch(x, z) ? FRONT.h(x, z) : 0.1;
// a shell hole in the sector inside the band behind the line, or a spot in the open if none is free
function fwCover(s, ours) { const S = FW.sec[s], a = ours ? S.line + 3 : S.line - 15, b = ours ? S.line + 15 : S.line - 3;
  const c = FRONT.craters.filter(c => c[0] > a && c[0] < b && c[1] > S.z0 + 1 && c[1] < S.z1 - 1), k = c[Math.floor(Math.random() * c.length)];
  return k && Math.random() < 0.7 ? V(k[0] + (Math.random() - 0.5) * k[2], 0, k[1] + (Math.random() - 0.5) * k[2]) : V(a + Math.random() * (b - a), 0, S.z0 + 2 + Math.random() * (S.z1 - S.z0 - 4)); }
// ---------- our side ----------
function fwNewMan(s, delay) {
  const k = fwBays(s)[Math.floor(Math.random() * fwBays(s).length)], b = FRONT.bays[k], zc = (b.z0 + b.z1) / 2 + (Math.random() - 0.5) * 2;
  const o = buildChar(makeTrooper, 'trooper'); o.traverse(c => { if (c.isMesh) c.frustumCulled = false; }); levelGroup.add(o);
  const path = [V(-8, 0, 25 + (Math.random() - 0.5) * 3), V(-15, 0, 25), ...frRoute(k), V(b.cx + 0.4, 0, zc), V(b.x0 - 1.6, 0, zc)];
  o.position.set(-4 - Math.random() * 3, 0.1, 22 + Math.random() * 6); o.rotation.y = -Math.PI / 2; o.visible = false;
  const m = { o, slot: { k, i: 0, x: b.x0 - 1.6, z: zc, dx: b.x0 - 1.6 }, anim: {}, hp: 100, dead: 0, st: 'in', t: 0, cd: 0, burst: 0, seed: Math.random() * 9,
    field: { sec: s, k, path, pi: 0, st: 'go', wait: delay || 0, chk: 2, rx: 0 } };
  FRONT.men.push(m); return m;
}
function fwManStep(m, dt, t) {
  const o = m.o, F = m.field;
  if (m.dead) { if (!F.counted) { F.counted = 1; const S = FW.sec[F.sec]; S.line += 2; }
    m.dead += dt; o.rotation.x = 0; o.rotation.z = Math.min(1, m.dead * 2.5) * (Math.PI / 2 - 0.1); o.position.y = Math.max(fwY(o.position.x, o.position.z), o.position.y - dt * 3);
    if (m.dead > 12) { o.parent && o.parent.remove(o); disposeTree(o); FRONT.men.splice(FRONT.men.indexOf(m), 1); } return; }
  if (F.wait > 0) { F.wait -= dt; return; } o.visible = true;
  m.st = F.st === 'rest' || (F.st === 'go' && F.path) ? 'in' : 'up'; // only troopers out in the open draw Drome fire
  const S = FW.sec[F.sec];
  if (F.path) { const tg = F.path[F.pi], dx = tg.x - o.position.x, dz = tg.z - o.position.z, d = Math.hypot(dx, dz);
    if (d < 0.35) { F.pi++; if (F.pi >= F.path.length) { F.path = null;
      if (F.st === 'back') { F.st = 'rest'; m.st = 'in'; F.t = 6 + Math.random() * 4; } else if (F.st !== 'go') { F.st = 'cover'; F.t = 0.5; F.chk = 3; } } }
    else { const sp = (F.st === 'back' ? 3.0 : 3.8) * dt / d; o.position.x += dx * sp; o.position.z += dz * sp; o.rotation.y = Math.atan2(dx, dz); }
    F.rx += (0 - F.rx) * Math.min(1, dt * 8); o.rotation.order = 'YXZ'; o.rotation.x = F.rx; o.position.y = fwY(o.position.x, o.position.z);
    if (o.position.distanceTo(player.pos) < 70) animRig(o, m.anim, dt, t + m.seed); return; }
  if (F.st === 'go') { F.path = [fwCover(F.sec, 1)]; F.pi = 0; F.st = 'move'; m.st = 'up'; return; }
  if (F.st === 'rest') { F.t -= dt; m.hp = Math.min(100, m.hp + dt * 12); if (F.t <= 0) { F.path = [V(FRONT.bays[F.k].x0 - 1.6, 0, o.position.z), fwCover(F.sec, 1)]; F.pi = 0; F.st = 'move'; m.st = 'up'; } return; }
  // in cover: prone in a shell hole, firing at the nearest Drome; move up or fall back as the line shifts
  F.chk -= dt;
  if (F.chk <= 0) { F.chk = 2 + Math.random() * 2;
    if (m.hp < 30 && Math.random() < 0.6) { const b = FRONT.bays[F.k]; F.path = [V(b.x0 - 1.6, 0, (b.z0 + b.z1) / 2), V(b.cx + 0.4, 0, (b.z0 + b.z1) / 2)]; F.pi = 0; F.st = 'back'; return; }
    if (o.position.x < S.line + 1 || o.position.x > S.line + 18) { F.path = [fwCover(F.sec, 1)]; F.pi = 0; F.st = 'move'; return; } }
  F.rx += (1.15 - F.rx) * Math.min(1, dt * 6); o.rotation.order = 'YXZ'; o.rotation.x = F.rx; o.position.y = fwY(o.position.x, o.position.z) + 0.22;
  m.cd -= dt; const tg = m.tg && !m.tg.dead ? m.tg : (m.tg = frPickFoe(o.position, 1));
  if (tg && tg.obj.position.distanceTo(o.position) < 60) { const q = tg.obj.position; o.rotation.y = Math.atan2(q.x - o.position.x, q.z - o.position.z);
    if (m.cd <= 0) { if (m.burst <= 0) m.burst = 3; m.burst--; m.cd = m.burst > 0 ? 0.14 : 0.9 + Math.random() * 0.8;
      o.updateMatrixWorld(); const from = o.localToWorld(V(0.13, 0.45, 1.1)), aim = q.clone().add(V(0, 1.0, 0)), hit = Math.random() < 0.07;
      tracer(from, hit ? aim : aim.clone().add(V((Math.random() - 0.5) * 3, (Math.random() - 0.4) * 1.5, (Math.random() - 0.5) * 3)), '#ffd36a'); frShotSound(from);
      if (hit) { tg.hp -= tg.max * 0.16; tg.hitT = 0.1; if (tg.hp <= 0) frKillQuiet(tg); else updatePlate(tg); } } }
  else o.rotation.y = -Math.PI / 2;
}
// ---------- the Drome side ----------
function fwSpawn(type, x, z, fr, lv) { if (frAlive().length >= 40) return null;
  const e = makeEnemy({ zone: 'siege', type, n: 1, lv: lv || [14, 16], once: true }); e.obj.position.set(x, FRONT.h(x, z), z); e.obj.rotation.y = Math.PI / 2;
  e.front = Object.assign({ home: V(x, 0, z), tt: 0, tg: null, st: 'up', t: 0 }, fr); e.aggro = true; FRONT.foes.push(e); return e; }
function fwFoe(s) { const k = fwBays(s)[Math.floor(Math.random() * fwBays(s).length)], b = FRONT.ebays[k], z = b.z0 + 1 + Math.random() * 4;
  return fwSpawn('dfield', b.x1 + 0.6, z, { mode: 'field', sec: s, k, fst: 'go', chk: 2 }); }
function fwFoeMove(e, dt) {
  const o = e.obj, F = e.front, S = FW.sec[F.sec || 0]; F.vx = F.vz = 0;
  if (F.mode === 'runner') { const g = F.goal, dx = g.x - o.position.x, dz = g.z - o.position.z, d = Math.hypot(dx, dz);
    if (d > 1.2) { const w = Math.sin(o.position.x * 0.35 + e.seed) * 0.35; F.vx = dx / d; F.vz = dz / d + w; e.cd = Math.max(e.cd, 0.5); } F.tg = 'player'; F.tt = 1; }
  else if (F.fst === 'rest') { F.t -= dt; e.hp = Math.min(e.max, e.hp + e.max * 0.08 * dt); if (F.t <= 0) { F.fst = 'go'; } }
  else if (F.fst === 'go') { F.goal = fwCover(F.sec, 0); F.fst = 'move'; }
  else if (F.fst === 'move' || F.fst === 'back') { const g = F.goal, dx = g.x - o.position.x, dz = g.z - o.position.z, d = Math.hypot(dx, dz);
    if (d < 0.5) { if (F.fst === 'back') { F.fst = 'rest'; F.t = 7 + Math.random() * 5; } else { F.fst = 'cover'; F.chk = 3; } } else { F.vx = dx / d; F.vz = dz / d; e.cd = Math.max(e.cd, 0.35); } }
  else if (F.fst === 'cover') { F.chk -= dt;
    if (F.chk <= 0) { F.chk = 2 + Math.random() * 2;
      if (e.hp < e.max * 0.35) { const b = FRONT.ebays[F.k]; F.goal = V(b.x1 - 0.8, 0, (b.z0 + b.z1) / 2); F.fst = 'back'; }
      else if (o.position.x > S.line - 1 || o.position.x < S.line - 18) F.fst = 'go'; } }
  if (F.vx || F.vz) { const sp = e.def.speed * (F.mode === 'runner' ? 1 : 1.25) * (e.slow > 0 ? 0.45 : 1) * dt; o.position.x += F.vx * sp; o.position.z += F.vz * sp; }
}
{ const _fes = frontEnemyStep; frontEnemyStep = function (e, dt, t) { const F = e.front; if (F.mode !== 'field' && F.mode !== 'runner') return _fes(e, dt, t);
  if (!e.dead) fwFoeMove(e, dt); _fes(e, dt, t); const o = e.obj;
  if (F.vx || F.vz) { o.rotation.y = Math.atan2(F.vx, F.vz); F.rx = 0; } else if (F.fst === 'cover' && F.mode === 'field') { F.rx = (F.rx || 0) + (1.1 - (F.rx || 0)) * Math.min(1, dt * 6); o.rotation.x = F.rx; o.position.y += 0.25; } }; }
// the fire step only reaches the near half of no-man's-land; the far half is the field squads' fight
{ const _pf = frPickFoe; frPickFoe = function (p, field) { if (field) return _pf(p); let best = null, bd = 95; for (const e of FRONT.foes) { if (e.dead) continue; const q = e.obj.position; if (q.x > p.x - 2) continue; const d = q.distanceTo(p); if (d < bd && (e.front.mode === 'field' ? d < 40 : e.front.mode === 'runner' ? d < 18 : 1)) { bd = d; best = e; } } return best; }; }
{ const _kq = frKillQuiet; frKillQuiet = function (e) { if (e.front) e.front.ai = 1; return _kq(e); }; } // AI kills don't count toward your MG tally
{ const _fms = frManStep; frManStep = function (m, dt, t) { return m.field ? fwManStep(m, dt, t) : _fms(m, dt, t); }; }
// a big event clears the field: our squads go home, the Drome go back to their trench
{ const _fs = frontStart; frontStart = function () { fwClear(); return _fs.apply(this, arguments); }; }
function fwClear() { for (const m of FRONT.men.filter(m => m.field)) { m.o.parent && m.o.parent.remove(m.o); disposeTree(m.o); FRONT.men.splice(FRONT.men.indexOf(m), 1); }
  for (const e of FRONT.foes) if (!e.dead && (e.front.mode === 'field' || e.front.mode === 'runner')) { e.front.counted = 1; frKillQuiet(e); } for (const S of FW.sec) S.line = -81; FW.mg = null; }
// ---------- the tug of war ----------
function fwTick(dt) {
  const near = player.pos.x < -12 || player.pos.y > 7;
  // deaths push the line: a dead Drome moves it west, a dead trooper (counted in fwManStep) moves it east
  for (const e of FRONT.foes) if (e.dead && !e.front.counted && (e.front.mode === 'field' || e.front.mode === 'runner')) { e.front.counted = 1;
    const s = e.front.mode === 'field' ? e.front.sec : fwSecOf(e.obj.position.z); FW.sec[s].line -= e.front.mode === 'field' ? 2 : 0.5; if (FW.mg && e.front.mode === 'runner' && !e.front.ai) fwMgKill(); }
  for (let s = 0; s < 3; s++) { const S = FW.sec[s], us = fwLive(1, s).filter(m => m.field.st === 'cover').length, them = fwLive(0, s).filter(e => e.front.fst === 'cover').length;
    S.line = clamp(S.line + ((them - us) * 0.12 + (-81 - S.line) * 0.01) * dt, -106, -56);
    if (S.line <= -104 && !S.won) { S.won = 1; if (near) toast(`${S.n} SECTOR: AT THEIR WIRE`, 'Drome are throwing everything back at it', 2.6); for (let i = 0; i < 6; i++) fwFoe(s); }
    if (S.line > -96) S.won = 0;
    if (S.line >= -58 && !S.lost) { S.lost = 1; if (near) toast(`${S.n} SECTOR: DROME AT OUR WIRE`, 'The reserve is going out', 2.6); for (let i = 0; i < 5; i++) fwNewMan(s, i * 0.7); }
    if (S.line < -66) S.lost = 0; }
  // reinforcements stream in on both sides, each to the sector that needs them most
  const need = side => [0, 1, 2].map(s => [s, (side ? fwLive(1, s).length - fwLive(0, s).length : fwLive(0, s).length - fwLive(1, s).length) + Math.random()]).sort((a, b) => a[1] - b[1])[0][0];
  const c = FW.sec.reduce((a, S) => a + clamp((-56 - S.line) / 50, 0, 1), 0) / 3; // how well we're doing overall: the side that's winning reinforces slower
  FW.ourT -= dt; if (FW.ourT <= 0) { FW.ourT = 3 + 9 * c + Math.random() * 2; if (fwLive(1).length < 12) { const s = need(1), n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) fwNewMan(s, i * 0.7); } }
  FW.theirT -= dt; if (FW.theirT <= 0) { FW.theirT = 3 + 9 * (1 - c) + Math.random() * 2; if (fwLive(0).length < 14) { const s = need(0), n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) fwFoe(s); } }
  FW.pruneT -= dt; if (FW.pruneT <= 0) { FW.pruneT = 10; for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].gone && enemies[i].front) enemies.splice(i, 1); FRONT.foes = FRONT.foes.filter(e => !e.gone); }
}
// ---------- MG charges: while you're on a heavy MG, runner squads come straight at your nest ----------
function fwMgKill() { const M = FW.mg; M.kills++; M.streak = M.st > 0 ? M.streak + 1 : 1; M.st = 3.5;
  if (M.streak % 5 === 0) { const xp = 60 * M.streak; gainXp(xp); toast(`STREAK x${M.streak}`, `+${xp} XP`, 1.2); SFX.item ? SFX.item() : SFX.ui(); } }
function fwMgStep(dt) {
  const on = VH.on && VH.id === 'mgnest' && !FB.on;
  if (!on) { if (FW.mg) { const M = FW.mg; FW.mg = null; if (M.kills) log(`MG nest: ${M.kills} Drome runners cut down, best streak ${M.best}.`, 'loot');
      for (const e of FRONT.foes) if (!e.dead && e.front.mode === 'runner') { e.front.mode = 'field'; e.front.sec = fwSecOf(e.obj.position.z); e.front.k = fwBays(e.front.sec)[0]; e.front.fst = 'go'; } } return; }
  if (!FW.mg) { FW.mg = { i: VH.mg, kills: 0, streak: 0, best: 0, st: 0, t: 2.5, n: 0 }; toast('THEY\'VE SEEN YOUR NEST', 'Runners incoming. Mow them down.', 2.2); }
  const M = FW.mg, p = FRONT.mgs[M.i]; M.t -= dt; M.st -= dt; if (M.st <= 0) M.streak = 0; M.best = Math.max(M.best, M.streak);
  if (M.t <= 0) { M.t = 4.5 + Math.random() * 2; M.n++;
    if (frAlive().filter(e => e.front.mode === 'runner').length < 18) { const n = 4 + Math.floor(Math.random() * 3) + Math.min(4, Math.floor(M.n / 4));
      const near = FRONT.ebays.filter(b => Math.abs((b.z0 + b.z1) / 2 - p.z) < 18);
      for (let i = 0; i < n; i++) { const b = near[Math.floor(Math.random() * near.length)], z = b.z0 + 1 + Math.random() * 4, type = i === 0 && M.n % 4 === 0 ? (M.n % 8 === 0 ? 'dlt' : 'dshield') : 'drunner';
        const e = fwSpawn(type, b.x1 + 0.6 - Math.random() * 2, z, { mode: 'runner', goal: V(p.x - 2.5 - Math.random() * 2, 0, p.z + (Math.random() - 0.5) * 5) }, type === 'drunner' ? [10, 12] : [18, 20]); if (e) e.cd = 1 + Math.random() * 2; }
      if (M.n % 4 === 0) toast(M.n % 8 === 0 ? 'LIEUTENANT IN THE CHARGE' : 'SHIELD RUNNER', 'Focus it before it reaches the nest', 1.8); } }
}
// ---------- the sector strip on screen while you're at the Front or on the rampart ----------
function fwHud() {
  if (!FW.hud) { const d = document.createElement('div'); d.id = 'fwHud'; d.style.cssText = 'position:fixed;top:112px;left:50%;transform:translateX(-50%);background:rgba(16,18,22,.8);border:1px solid #3a4a3c;border-radius:6px;padding:5px 12px;color:#dfe6dc;font:600 11px/1.5 ui-monospace,monospace;letter-spacing:.06em;pointer-events:none;z-index:5;display:none;min-width:260px'; document.body.appendChild(d); FW.hud = d; }
  const show = LEVEL.id === 'fort' && state === 'play' && !FB.on && (player.pos.x < -12 || player.pos.y > 7 || FW.mg); FW.hud.style.display = show ? 'block' : 'none'; if (!show) return;
  const bar = S => { const c = clamp((-56 - S.line) / 50, 0, 1), w = Math.round(c * 100); return `<div style="display:flex;align-items:center;gap:8px"><span style="width:58px">${S.n}</span><span style="flex:1;height:7px;background:#5a2024;border-radius:3px;overflow:hidden"><span style="display:block;height:100%;width:${w}%;background:#6fbc5a"></span></span><span style="width:34px;text-align:right">${w}%</span></div>`; };
  FW.hud.innerHTML = (FW.mg ? `<div style="text-align:center;color:#fff">MG NEST · KILLS ${FW.mg.kills}${FW.mg.streak > 1 ? ` · STREAK x${FW.mg.streak}` : ''}</div>` : '') + FW.sec.map(bar).join('');
}
function fwStep(t) { const dt = Math.min(0.1, Math.max(0, t - FW.lt)); FW.lt = t; if (!dt || LEVEL.id !== 'fort') return;
  if (!FB.on) { fwTick(dt); fwMgStep(dt); } else if (FW.mg) FW.mg = null; fwHud(); }
{ const _fb = frontBuild; frontBuild = function () { const r = _fb.apply(this, arguments); for (const S of FW.sec) { S.line = -81; S.won = S.lost = 0; } FW.mg = null; FW.ourT = 1; FW.theirT = 3; levelAnims.push(fwStep); return r; }; }
setInterval(() => { if (FW.hud && (!LEVEL || LEVEL.id !== 'fort' || state !== 'play')) FW.hud.style.display = 'none'; }, 400);
