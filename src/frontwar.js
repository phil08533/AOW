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
// ---------- cover (2.23.87): sandbag walls, concrete blocks, burnt-out tanks and log barricades across no-man's-land ----------
// Squads take the side of a piece that faces their own trench, sit with their backs to it, then stand to fire over the top.
function fwCoverBuild() {
  FW.cov = []; let sd = 31; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const g = new THREE.Group(), bag = toon('#8a7a58', 'cloth'), con = toon('#7a7c80', 'panel'), rust = toon('#3a2a22', 'hull'), dk = toon('#22201e'), lg = toon('#5a4430', 'wood'), reb = toon('#5a3a2a');
  for (let i = 0; i < 10; i++) { const x0 = -104 + i * 5.6;
    for (let s = 0; s < 3; s++) { const S = FW.sec[s], n = s === 1 ? 2 : 1;
      for (let j = 0; j < n; j++) { const z = S.z0 + 3 + (S.z1 - S.z0 - 6) * ((j + rnd()) / n), x = x0 + (rnd() - 0.5) * 2.4, type = Math.floor(rnd() * 4), ry = (rnd() - 0.5) * 0.25;
        if (FRONT.craters.some(c => Math.hypot(c[0] - x, c[1] - z) < c[2] + 1.6)) continue;
        const p = new THREE.Group(); p.position.set(x, FRONT.baseH(x, z), z); p.rotation.y = ry; g.add(p); const L = type === 2 ? 2.8 : 2.4;
        if (type === 0) { for (let l = 0; l < 4; l++) for (let k = 0; k < 5 - (l % 2); k++) part(p, frBagGeo(), bag, 0, 0.1 + l * 0.2, (k - 2) * 0.52 + (l % 2) * 0.26, 0, Math.PI / 2 + Math.sin(k * 7 + l) * 0.06, 0); }
        else if (type === 1) { part(p, B(0.5, 1.0, 2.2), con, 0, 0.5, 0); part(p, B(0.7, 0.12, 2.3), con, 0, 0.06, 0); part(p, B(0.52, 0.3, 0.5), con, 0.03, 1.05, -0.85, 0, 0, 0.3); part(p, Cy(0.02, 0.02, 0.5, 4), reb, 0, 1.15, 0.5, 0.3); part(p, Cy(0.02, 0.02, 0.4, 4), reb, 0.05, 1.1, 0.1, -0.4); }
        else if (type === 2) { part(p, B(1.6, 0.8, 2.8), rust, 0, 0.5, 0, 0, 0, 0.06); for (const sx of [-1, 1]) part(p, B(0.35, 0.55, 3.0), dk, sx * 0.95, 0.3, 0); part(p, B(1.0, 0.45, 1.1), rust, 0.15, 1.05, -0.3, 0.15, 0.6, 0.25); part(p, Cy(0.07, 0.07, 1.6, 6), dk, 0.5, 1.15, 0.5, 1.3, 0, 0.3); }
        else { for (let k = 0; k < 3; k++) part(p, Cy(0.17, 0.17, 2.5, 8), lg, 0, 0.2 + k * 0.32, (k - 1) * 0.06, Math.PI / 2); for (const sz of [-1.05, 1.05]) for (const r of [-0.45, 0.45]) part(p, B(0.1, 1.3, 0.1), lg, 0, 0.55, sz, r, 0, 0); }
        box(x, z, type === 2 ? 0.95 : 0.35, L / 2); FW.cov.push({ x, z, L, occ: [0, 0] });
      } } }
  levelGroup.add(frMerge(g));
}
const fwFree = (F, side) => { if (F && F.cov) { F.cov.occ[side] = Math.max(0, F.cov.occ[side] - 1); F.cov = null; } };
function fwCover(s, ours, F) { const S = FW.sec[s], a = ours ? S.line + 3 : S.line - 15, b = ours ? S.line + 15 : S.line - 3, side = ours ? 1 : 0; fwFree(F, side);
  const list = (FW.cov || []).filter(c => c.x > a && c.x < b && c.z > S.z0 && c.z < S.z1 && c.occ[side] < 2), cv = list[Math.floor(Math.random() * list.length)];
  if (cv && F) { cv.occ[side]++; F.cov = cv; F.slot = cv.occ[side] === 1 ? -1 : 1; return V(cv.x + (ours ? 0.7 : -0.7) + (cv.L > 2.6 ? (ours ? 0.6 : -0.6) : 0), 0, cv.z + F.slot * cv.L * 0.25); }
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
  if (m.dead) { if (!F.counted) { F.counted = 1; const S = FW.sec[F.sec]; S.line += 2; fwPose(o, 0); fwFree(F, 1); }
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
  if (F.st === 'go') { F.path = [fwCover(F.sec, 1, F)]; F.pi = 0; F.st = 'move'; m.st = 'up'; return; }
  if (F.st === 'rest') { F.t -= dt; m.hp = Math.min(100, m.hp + dt * 12); if (F.t <= 0) { F.path = [V(FRONT.bays[F.k].x0 - 1.6, 0, o.position.z), fwCover(F.sec, 1, F)]; F.pi = 0; F.st = 'move'; m.st = 'up'; } return; }
  // in cover: prone in a shell hole, firing at the nearest Drome; move up or fall back as the line shifts
  F.chk -= dt;
  if (F.chk <= 0) { F.chk = 2 + Math.random() * 2;
    if (m.hp < 30 && Math.random() < 0.6) { fwPose(o, 0); fwFree(F, 1); const b = FRONT.bays[F.k]; F.path = [V(b.x0 - 1.6, 0, (b.z0 + b.z1) / 2), V(b.cx + 0.4, 0, (b.z0 + b.z1) / 2)]; F.pi = 0; F.st = 'back'; return; }
    if (o.position.x < S.line + 1 || o.position.x > S.line + 18) { fwPose(o, 0); F.path = [fwCover(F.sec, 1, F)]; F.pi = 0; F.st = 'move'; return; } }
  // behind cover: sit with your back to it, then stand and fire a few bursts over the top
  F.pt = (F.pt == null ? Math.random() * 2 : F.pt) - dt; if (F.pt <= 0) { F.up = !F.up; F.pt = F.up ? 1.8 + Math.random() * 1.8 : 1.4 + Math.random() * 2.2; }
  o.rotation.order = 'YXZ'; o.rotation.x = 0;
  if (F.cov && !F.up) { m.st = 'in'; fwPose(o, 1); o.rotation.y = Math.PI / 2; o.position.y = fwY(o.position.x, o.position.z) - fwHip(o) + 0.12; return; }
  fwPose(o, 0); o.position.y = fwY(o.position.x, o.position.z); if (o.position.distanceTo(player.pos) < 70) animRig(o, m.anim, dt, t + m.seed);
  m.cd -= dt; const tg = m.tg && !m.tg.dead ? m.tg : (m.tg = frPickFoe(o.position, 1));
  if (tg && tg.obj.position.distanceTo(o.position) < 60) { const q = tg.obj.position; o.rotation.y = Math.atan2(q.x - o.position.x, q.z - o.position.z);
    if (m.cd <= 0) { if (m.burst <= 0) m.burst = 3; m.burst--; m.cd = m.burst > 0 ? 0.14 : 0.9 + Math.random() * 0.8;
      o.updateMatrixWorld(); const from = o.localToWorld(V(0.13, 1.25, 1.0)), aim = q.clone().add(V(0, 1.0, 0)), hit = !tg.front.duck && Math.random() < 0.09;
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
  else if (F.fst === 'go') { F.goal = fwCover(F.sec, 0, F); F.fst = 'move'; }
  else if (F.fst === 'move' || F.fst === 'back') { const g = F.goal, dx = g.x - o.position.x, dz = g.z - o.position.z, d = Math.hypot(dx, dz);
    if (d < 0.5) { if (F.fst === 'back') { F.fst = 'rest'; F.t = 7 + Math.random() * 5; } else { F.fst = 'cover'; F.chk = 3; } } else { F.vx = dx / d; F.vz = dz / d; e.cd = Math.max(e.cd, 0.35); } }
  else if (F.fst === 'cover') { F.chk -= dt; F.pt = (F.pt == null ? Math.random() * 2 : F.pt) - dt; if (F.pt <= 0) { F.up = !F.up; F.pt = F.up ? 1.8 + Math.random() * 1.8 : 1.4 + Math.random() * 2.2; }
    F.duck = !!(F.cov && !F.up); if (F.duck) e.cd = Math.max(e.cd, 0.3);
    if (F.chk <= 0) { F.chk = 2 + Math.random() * 2;
      if (e.hp < e.max * 0.35) { fwFree(F, 0); const b = FRONT.ebays[F.k]; F.goal = V(b.x1 - 0.8, 0, (b.z0 + b.z1) / 2); F.fst = 'back'; }
      else if (o.position.x > S.line - 1 || o.position.x < S.line - 18) F.fst = 'go'; } }
  if (F.vx || F.vz) { const sp = e.def.speed * (F.mode === 'runner' ? 1 : 1.25) * (e.slow > 0 ? 0.45 : 1) * dt; o.position.x += F.vx * sp; o.position.z += F.vz * sp; }
}
{ const _fes = frontEnemyStep; frontEnemyStep = function (e, dt, t) { const F = e.front; if (F.mode !== 'field' && F.mode !== 'runner') return _fes(e, dt, t);
  if (!e.dead) fwFoeMove(e, dt); _fes(e, dt, t); const o = e.obj;
  if (F.fst !== 'cover') F.duck = false;
  if (F.vx || F.vz) o.rotation.y = Math.atan2(F.vx, F.vz);
  if (F.duck) { o.userData.sitting = 0; fwPose(o, 1); /* the walk cycle ran this frame, so set the legs again */ o.rotation.x = 0; o.rotation.y = -Math.PI / 2; o.position.y = groundH(o.position.x, o.position.z) - fwHip(o) + 0.12; } else fwPose(o, 0); }; }
// sitting against cover: both legs straight out in front, hips on the ground
const fwHip = o => (o.userData.rig && o.userData.rig.spec.hip || 0.9) * (o.scale.y || 1);
function fwPose(o, sit) { const R = o.userData.rig; if (!R || !R.legL || !!o.userData.sitting === !!sit) return; o.userData.sitting = sit ? 1 : 0; R.legL.rotation.x = R.legR.rotation.x = sit ? -Math.PI / 2 : 0; if (R.torso) { R.torso.position.y = R.spec.hip; R.torso.rotation.x = sit ? -0.08 : 0; } }
// the fire step only reaches the near half of no-man's-land; the far half is the field squads' fight
{ const _pf = frPickFoe; frPickFoe = function (p, field) { if (field) return _pf(p); let best = null, bd = 95; for (const e of FRONT.foes) { if (e.dead) continue; const q = e.obj.position; if (q.x > p.x - 2) continue; const d = q.distanceTo(p); if (d < bd && (e.front.mode === 'field' ? d < 40 : e.front.mode === 'runner' ? d < 18 : 1)) { bd = d; best = e; } } return best; }; }
{ const _kq = frKillQuiet; frKillQuiet = function (e) { if (e.front) e.front.ai = 1; return _kq(e); }; } // AI kills don't count toward your MG tally
{ const _fms = frManStep; frManStep = function (m, dt, t) { return m.field ? fwManStep(m, dt, t) : _fms(m, dt, t); }; }
// a big event clears the field: our squads go home, the Drome go back to their trench
{ const _fs = frontStart; frontStart = function () { fwClear(); return _fs.apply(this, arguments); }; }
function fwClear() { for (const m of FRONT.men.filter(m => m.field)) { m.o.parent && m.o.parent.remove(m.o); disposeTree(m.o); FRONT.men.splice(FRONT.men.indexOf(m), 1); }
  for (const e of FRONT.foes) if (!e.dead && (e.front.mode === 'field' || e.front.mode === 'runner')) { e.front.counted = 1; frKillQuiet(e); } for (const S of FW.sec) S.line = -81; FW.mg = null; for (const c of FW.cov || []) c.occ = [0, 0]; }
// ---------- the tug of war ----------
function fwTick(dt) {
  const near = player.pos.x < -12 || player.pos.y > 7;
  // deaths push the line: a dead Drome moves it west, a dead trooper (counted in fwManStep) moves it east
  for (const e of FRONT.foes) if (e.dead && !e.front.counted && (e.front.mode === 'field' || e.front.mode === 'runner')) { e.front.counted = 1; fwPose(e.obj, 0); fwFree(e.front, 0); e.front.duck = false;
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
{ const _fb = frontBuild; frontBuild = function () { const r = _fb.apply(this, arguments); for (const S of FW.sec) { S.line = -81; S.won = S.lost = 0; } FW.mg = null; fwCoverBuild(); fwHazeBuild(); FW.ourT = 1; FW.theirT = 3; levelAnims.push(fwStep); return r; }; }
setInterval(() => { if (FW.hud && (!LEVEL || LEVEL.id !== 'fort' || state !== 'play')) FW.hud.style.display = 'none'; }, 400);
// ---------- battlefield haze (2.23.87): dust and smoke thicken as you head out to the Front, thinner inside the walls ----------
{ const _ue = updateEnv; updateEnv = function (dt, t) { _ue(dt, t); if (!LEVEL || LEVEL.id !== 'fort') return;
  const out = player.pos.x < -14 && player.pos.y < 7, k = FW.fogK = (FW.fogK == null ? (out ? 1 : 0.45) : FW.fogK + ((out ? 1 : 0.45) - FW.fogK) * Math.min(1, (dt || 0.016) * 0.8));
  scene.fog.color.set('#2c2824').convertSRGBToLinear(); scene.fog.near = 30 - 18 * k; scene.fog.far = 170 - 70 * k; }; }
// soft haze: camera-facing puffs with a feathered edge drift across no-man's-land on the wind and wrap round, fading near the camera
function fwPuffTex() { if (FW.puffTex) return FW.puffTex; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (let k = 0; k < 7; k++) { const cx = 40 + Math.random() * 48, cy = 44 + Math.random() * 40, r = 26 + Math.random() * 22, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  return (FW.puffTex = new THREE.CanvasTexture(c)); }
function fwHazeBuild() { FW.puffs = []; const tex = fwPuffTex();
  for (let i = 0; i < 46; i++) { const m = new THREE.SpriteMaterial({ map: tex, color: i % 3 ? '#8a8078' : '#6a625c', transparent: true, opacity: 0, depthWrite: false, fog: true }), s = new THREE.Sprite(m);
    const x = -128 + Math.random() * 92, z = -18 + Math.random() * 96, sc = 12 + Math.random() * 14; s.scale.set(sc, sc * 0.45, 1); s.position.set(x, FRONT.baseH(x, z) + 1.2 + Math.random() * 2.2, z); s.renderOrder = 2; levelGroup.add(s);
    FW.puffs.push({ s, a: 0.22 + Math.random() * 0.2, v: 0.5 + Math.random() * 0.6, ph: Math.random() * 6 }); } }
function fwHaze(dt) { if (!FW.puffs) return; const cam = camera.position, t = performance.now() / 1000;
  for (const P of FW.puffs) { const s = P.s; s.position.x += P.v * dt; s.position.z += Math.sin(t * 0.05 + P.ph) * 0.15 * dt; if (s.position.x > -34) { s.position.x = -128; s.position.y = FRONT.baseH(-128, s.position.z) + 1.2 + Math.random() * 2.2; }
    const edge = Math.min(1, (s.position.x + 128) / 12, (-34 - s.position.x) / 12), near = clamp((s.position.distanceTo(cam) - 5) / 14, 0, 1);
    s.material.opacity = P.a * edge * near * (0.85 + Math.sin(t * 0.3 + P.ph) * 0.15); } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.hzLt || t))); FW.hzLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort') fwHaze(dt); }; }
// ---------- big explosions (2.23.91): a Maw-style fireball, smoke, debris and a shock ring; a sky battle you can see and hear ----------
FW.booms = []; FW.wrecks = []; FW.skyT = 2; FW.wreckT = 6;
const fwMat = k => FW['m' + k] || (FW['m' + k] = toon(k ? '#3a3634' : '#2a2622'));
function fwRumble(vol, delay) { try { const ac = SFX.ctx && SFX.ctx(); if (!ac || !SFX.voiceOut || vol < 0.01) return; const t = ac.currentTime + (delay || 0), n = Math.floor(ac.sampleRate * 2.2);
  if (!FW.noise) { const b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { l = l * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = l * 6; } FW.noise = b; }
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = FW.noise; f.type = 'lowpass'; f.frequency.value = 140 + Math.random() * 120;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + 1.6 + Math.random() * 0.6); s.connect(f); f.connect(g); g.connect(SFX.voiceOut()); s.start(t); s.stop(t + 2.3); } catch (_) {} }
// sc scales the blast; sky = a flash in the air (no ground ring, smoke or debris)
function fwBoom(p, sc, sky) { if (!LEVEL || LEVEL.id !== 'fort') return; sc = sc || 1; while (FW.booms.length > 16) fwBoomEnd(FW.booms.shift());
  const B = { t: 0, sc, sky, fire: [], smoke: [], deb: [], ring: null, p: p.clone() };
  B.core = mawFireSprite('#ffffff', 2.5 * sc); B.core.position.copy(p).add(V(0, sky ? 0 : 0.8 * sc, 0));
  for (let i = 0; i < (sky ? 4 : 6); i++) { const s = mawFireSprite(['#ffb060', '#ff7a2a', '#ffd36a'][i % 3], 1.5 * sc); s.position.copy(p).add(V((Math.random() - 0.5) * 1.6 * sc, (sky ? 0 : 0.6 * sc) + Math.random() * sc, (Math.random() - 0.5) * 1.6 * sc)); B.fire.push({ s, vy: (0.8 + Math.random()) * sc, g: 2.5 + Math.random() * 2 }); }
  if (!sky) { const tex = fwPuffTex();
    for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: i % 2 ? '#3a3430' : '#24201e', transparent: true, opacity: 0, depthWrite: false })); s.position.copy(p).add(V((Math.random() - 0.5) * sc, 0.8 * sc, (Math.random() - 0.5) * sc)); s.scale.setScalar(2 * sc); levelGroup.add(s); B.smoke.push({ s, vy: 1 + Math.random() * 0.8, life: 4 + Math.random() * 2 }); }
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(B_DEB(), fwMat(0)); m.position.copy(p).add(V(0, 0.4, 0)); m.scale.setScalar(0.6 + Math.random() * sc * 0.8); levelGroup.add(m); const a = Math.random() * 6.28, v = (4 + Math.random() * 6) * Math.sqrt(sc); B.deb.push({ m, v: V(Math.cos(a) * v * 0.5, 5 + Math.random() * 6 * sc, Math.sin(a) * v * 0.5), r: V(Math.random() * 9, Math.random() * 9, 0) }); }
    B.ring = new THREE.Mesh(FW.ringGeo || (FW.ringGeo = new THREE.RingGeometry(0.8, 1.15, 28)), new THREE.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    B.ring.rotation.x = -Math.PI / 2; B.ring.position.set(p.x, groundH(p.x, p.z) + 0.25, p.z); levelGroup.add(B.ring); }
  const d = p.distanceTo(player.pos); if (!sky && d < 60) { SFX.boom(); if (d < 16) VH.shk = Math.max(VH.shk || 0, 0.35 * sc * (1 - d / 16) + 0.1); } else fwRumble(Math.min(0.4, (sky ? 6 : 40) * sc / Math.max(20, d)), Math.min(1.6, d / 340));
  FW.booms.push(B); return B; }
function B_DEB() { return FW.debGeo || (FW.debGeo = new THREE.BoxGeometry(0.22, 0.14, 0.18)); }
function fwBoomEnd(B) { for (const o of [B.core, B.ring, ...B.fire.map(f => f.s), ...B.smoke.map(f => f.s)]) if (o) { o.parent && o.parent.remove(o); o.material.dispose(); } for (const D of B.deb) D.m.parent && D.m.parent.remove(D.m); }
function fwBoomStep(dt) { for (let i = FW.booms.length - 1; i >= 0; i--) { const B = FW.booms[i], sc = B.sc; B.t += dt; const t = B.t;
    if (B.core.parent) { B.core.scale.setScalar((2.5 + t * 22) * sc); B.core.material.opacity = Math.max(0, 1 - t / 0.28); if (t > 0.3) { B.core.parent.remove(B.core); } }
    for (const f of B.fire) { const k = t / 1.1; f.s.position.y += f.vy * dt; f.s.scale.setScalar((1.5 + k * f.g) * sc); f.s.material.opacity = Math.max(0, 1 - k); }
    for (const s of B.smoke) { s.s.position.y += s.vy * dt; s.s.position.x += 0.6 * dt; s.s.scale.setScalar((2 + t * 1.6) * sc); s.s.material.opacity = Math.min(0.6, t * 1.5) * Math.max(0, 1 - t / s.life); }
    for (const D of B.deb) { if (!D.m.parent) continue; D.v.y -= 18 * dt; D.m.position.addScaledVector(D.v, dt); D.m.rotation.x += D.r.x * dt; D.m.rotation.y += D.r.y * dt; const g = groundH(D.m.position.x, D.m.position.z) + 0.07; if (D.m.position.y < g) { D.m.position.y = g; D.v.set(0, 0, 0); D.r.set(0, 0, 0); } if (t > 2.5) D.m.parent.remove(D.m); }
    if (B.ring) { const k = Math.min(1, t / 0.55); B.ring.scale.setScalar(1 + k * 4.5 * sc); B.ring.material.opacity = 0.45 * (1 - k); }
    if (t > (B.sky ? 1.3 : 6.5)) { fwBoomEnd(B); FW.booms.splice(i, 1); } } }
// grenades, tank shells and barrage rounds all go up as real explosions
{ const _b = frBoom; frBoom = function (p, ours) { _b.apply(this, arguments); FW.lastBoom = { p: p.clone(), t: performance.now() }; fwBoom(p, 1); }; }
{ const _s = frScorch; frScorch = function (p) { _s.apply(this, arguments); const L = FW.lastBoom; if (!(L && performance.now() - L.t < 300 && L.p.distanceTo(p) < 2)) fwBoom(p, 1.4); }; }
// the fleet fight overhead shows through the battlefield haze
function fwNoFog(o) { o.traverse(c => { if (!c.material) return; const ms = Array.isArray(c.material) ? c.material : [c.material]; const nm = ms.map(m => { if (m.fog === false) return m; FW.nf = FW.nf || new Map(); let n = FW.nf.get(m); if (!n) { n = m.clone(); n.fog = false; FW.nf.set(m, n); } return n; }); c.material = Array.isArray(c.material) ? nm : nm[0]; }); }
{ const _sb = frSkyBuild; frSkyBuild = function () { const r = _sb.apply(this, arguments); for (const C of FS.caps) fwNoFog(C.g); if (FS.fighters) for (const k of ['ours', 'them']) FS.fighters[k].forEach(fwNoFog); for (const f of FS.flak) f.s.material.fog = false; FW.wrecks.length = 0; FW.booms.length = 0; return r; }; }
{ const _fb = frBeam; frBeam = function (a, b, col) { const r = _fb.apply(this, arguments); const B0 = FS.beams[FS.beams.length - 1]; if (B0) B0.m.material.fog = false; return r; }; }
// flashes in the sky, and now and then a burning wreck comes down into the field
function fwSky(dt) { FW.skyT -= dt; if (FW.skyT <= 0) { FW.skyT = 0.6 + Math.random() * 1.8; fwBoom(V(-150 + Math.random() * 210, 70 + Math.random() * 90, -40 + Math.random() * 140), 4 + Math.random() * 5, true); }
  FW.wreckT -= dt; if (FW.wreckT <= 0 && FW.wrecks.length < 3) { FW.wreckT = 9 + Math.random() * 10;
    let tx = -115 + Math.random() * 70, tz = -10 + Math.random() * 80; if (Math.hypot(tx - player.pos.x, tz - player.pos.z) < 14) tx -= 20;
    const big = Math.random() < 0.3, g = new THREE.Group(); if (big) { for (let k = 0; k < 4; k++) part(g, B(2 + Math.random() * 3, 1.2 + Math.random() * 2, 3 + Math.random() * 5), fwMat(1), (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4, Math.random(), Math.random(), Math.random()); } else g.add(new THREE.Mesh(frFighterGeo(), fwMat(1))); fwNoFog(g);
    const from = V(tx - 60 - Math.random() * 60, 140 + Math.random() * 40, tz + (Math.random() - 0.5) * 80); g.position.copy(from); levelGroup.add(g);
    FW.wrecks.push({ g, from, to: V(tx, groundH(tx, tz), tz), t: 0, T: big ? 9 : 5.5, big, trail: 0 }); }
  for (let i = FW.wrecks.length - 1; i >= 0; i--) { const W = FW.wrecks[i]; W.t += dt; const k = Math.min(1, W.t / W.T), e = k * k; W.g.position.lerpVectors(W.from, W.to, e); W.g.position.y = W.from.y + (W.to.y - W.from.y) * e;
    W.g.lookAt(W.to); W.g.rotateZ(W.t * (W.big ? 0.4 : 3)); W.trail -= dt; if (W.trail <= 0) { W.trail = 0.12; const f = mawFireSprite(Math.random() < 0.5 ? '#ff7a2a' : '#ffb060', W.big ? 6 : 3.5); f.position.copy(W.g.position); FW.booms.push({ t: 0.5, sc: W.big ? 2 : 1, sky: true, fire: [{ s: f, vy: 0, g: 3 }], smoke: [], deb: [], ring: null, core: { parent: null, scale: { setScalar() {} }, material: { dispose() {} } } }); }
    if (k >= 1) { levelGroup.remove(W.g); FW.wrecks.splice(i, 1); fwBoom(W.to, W.big ? 3 : 2); FW.lastBoom = { p: W.to.clone(), t: performance.now() }; frScorch(W.to); } } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.bmLt || t))); FW.bmLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt) { fwBoomStep(dt); fwSky(dt); } }; }
// the Drome never reach the walls: field units stop at the edge of no-man's-land, roamers from the tank yard turn back short of the fort
function fwKeepOut() { for (const e of enemies) { if (e.dead || e.gone || !e.obj) continue; const p = e.obj.position;
  if (e.front) { if (p.x > -34) p.x = -34; continue; }
  if (irInFort(p.x, p.z, 10)) { const dx = Math.min(p.x - (IR.X0 - 10), IR.X1 + 10 - p.x), dz = Math.min(p.z - (IR.Z0 - 10), IR.Z1 + 10 - p.z);
    if (dx < dz) p.x = p.x - (IR.X0 - 10) < IR.X1 + 10 - p.x ? IR.X0 - 10 : IR.X1 + 10; else p.z = p.z - (IR.Z0 - 10) < IR.Z1 + 10 - p.z ? IR.Z0 - 10 : IR.Z1 + 10; e.aggro = false; e.wander = V(e.zone.x, 0, e.zone.z); } } }
{ const _st = fwStep; fwStep = function (t) { _st(t); if (LEVEL && LEVEL.id === 'fort') fwKeepOut(); }; }
