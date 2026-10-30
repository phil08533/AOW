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
// five sectors across the line (2.23.92); the line itself is the x where the two sides meet, -122 = the middle of no-man's-land
const FW = { sec: [{ n: 'SOUTH', z0: -14, z1: 2 }, { n: 'SOUTH-CENTRE', z0: 2, z1: 18 }, { n: 'CENTRE', z0: 18, z1: 34 }, { n: 'NORTH-CENTRE', z0: 34, z1: 50 }, { n: 'NORTH', z0: 50, z1: 72 }].map(S => Object.assign(S, { line: -122 })), ourT: 2, theirT: 4, hud: null, mg: null, pruneT: 10, lt: 0 };
const fwSecOf = z => clamp(Math.floor((z + 14) / 16), 0, 4), fwBays = s => [[0, 1], [3], [4, 5], [6], [8, 9]][s]; // bays 2 and 7 hold the MG nests, so squads climb out elsewhere
const fwLive = (side, s) => side ? FRONT.men.filter(m => m.field && !m.dead && (s == null || m.field.sec === s)) : frAlive().filter(e => e.front.mode === 'field' && (s == null || e.front.sec === s));
const fwY = (x, z) => FRONT.inPatch(x, z) ? FRONT.h(x, z) : 0.1;
// ---------- cover (2.23.87): sandbag walls, concrete blocks, burnt-out tanks and log barricades across no-man's-land ----------
// Squads take the side of a piece that faces their own trench, sit with their backs to it, then stand to fire over the top.
function fwCoverBuild() {
  FW.cov = []; let sd = 31; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const g = new THREE.Group(), bag = toon('#8a7a58', 'cloth'), con = toon('#7a7c80', 'panel'), rust = toon('#3a2a22', 'hull'), dk = toon('#22201e'), lg = toon('#5a4430', 'wood'), reb = toon('#5a3a2a');
  for (let i = 0; i < 18; i++) { const x0 = -168 + i * 5.6;
    for (let s = 0; s < FW.sec.length; s++) { const S = FW.sec[s], n = 1;
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
  for (const e of FRONT.foes) if (!e.dead && (e.front.mode === 'field' || e.front.mode === 'runner')) { e.front.counted = 1; frKillQuiet(e); } for (const S of FW.sec) S.line = -122; FW.mg = null; for (const c of FW.cov || []) c.occ = [0, 0]; }
// ---------- the tug of war ----------
function fwTick(dt) {
  const near = player.pos.x < -12 || player.pos.y > 7;
  // deaths push the line: a dead Drome moves it west, a dead trooper (counted in fwManStep) moves it east
  for (const e of FRONT.foes) if (e.dead && !e.front.counted && (e.front.mode === 'field' || e.front.mode === 'runner')) { e.front.counted = 1; fwPose(e.obj, 0); fwFree(e.front, 0); e.front.duck = false;
    const s = e.front.mode === 'field' ? e.front.sec : fwSecOf(e.obj.position.z); FW.sec[s].line -= e.front.mode === 'field' ? 2 : 0.5; if (FW.mg && e.front.mode === 'runner' && !e.front.ai) fwMgKill(); }
  for (let s = 0; s < FW.sec.length; s++) { const S = FW.sec[s], us = fwLive(1, s).filter(m => m.field.st === 'cover').length, them = fwLive(0, s).filter(e => e.front.fst === 'cover').length;
    S.line = clamp(S.line + ((them - us) * 0.15 + (-122 - S.line) * 0.012) * dt, -172, -72);
    if (S.line <= -168 && !S.won) { S.won = 1; if (near) toast(`${S.n} SECTOR: AT THEIR WIRE`, 'Drome are throwing everything back at it', 2.6); for (let i = 0; i < 6; i++) fwFoe(s); }
    if (S.line > -152) S.won = 0;
    if (S.line >= -76 && !S.lost) { S.lost = 1; if (near) toast(`${S.n} SECTOR: DROME AT OUR WIRE`, 'The reserve is going out', 2.6); for (let i = 0; i < 5; i++) fwNewMan(s, i * 0.7); }
    if (S.line < -92) S.lost = 0; }
  // reinforcements stream in on both sides, each to the sector that needs them most
  const need = side => FW.sec.map((_, s) => s).map(s => [s, (side ? fwLive(1, s).length - fwLive(0, s).length : fwLive(0, s).length - fwLive(1, s).length) + Math.random()]).sort((a, b) => a[1] - b[1])[0][0];
  const c = FW.sec.reduce((a, S) => a + clamp((-72 - S.line) / 100, 0, 1), 0) / FW.sec.length; // how well we're doing overall: the side that's winning reinforces slower
  FW.ourT -= dt; if (FW.ourT <= 0) { FW.ourT = 3 + 9 * c + Math.random() * 2; if (fwLive(1).length < 22) { const s = need(1), n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) fwNewMan(s, i * 0.7); } }
  FW.theirT -= dt; if (FW.theirT <= 0) { FW.theirT = 3 + 9 * (1 - c) + Math.random() * 2; if (fwLive(0).length < 20) { const s = need(0), n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) fwFoe(s); } }
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
        const e = fwSpawn(type, -132 - Math.random() * 16, z, /* they break cover mid-field so a charge stays a charge on the longer field */ { mode: 'runner', goal: V(p.x - 2.5 - Math.random() * 2, 0, p.z + (Math.random() - 0.5) * 5) }, type === 'drunner' ? [10, 12] : [18, 20]); if (e) e.cd = 1 + Math.random() * 2; }
      if (M.n % 4 === 0) toast(M.n % 8 === 0 ? 'LIEUTENANT IN THE CHARGE' : 'SHIELD RUNNER', 'Focus it before it reaches the nest', 1.8); } }
}
// ---------- the sector strip on screen while you're at the Front or on the rampart ----------
function fwHud() {
  if (!FW.hud) { const d = document.createElement('div'); d.id = 'fwHud'; d.style.cssText = 'position:fixed;top:112px;left:50%;transform:translateX(-50%);background:rgba(16,18,22,.8);border:1px solid #3a4a3c;border-radius:6px;padding:5px 12px;color:#dfe6dc;font:600 11px/1.5 ui-monospace,monospace;letter-spacing:.06em;pointer-events:none;z-index:5;display:none;min-width:260px'; document.body.appendChild(d); FW.hud = d; }
  const show = LEVEL.id === 'fort' && state === 'play' && !FB.on && (PREFS.frontHud && (player.pos.x < -12 || player.pos.y > 7) || FW.mg); FW.hud.style.display = show ? 'block' : 'none'; if (!show) return;
  const bar = S => { const c = clamp((-72 - S.line) / 100, 0, 1), w = Math.round(c * 100); return `<div style="display:flex;align-items:center;gap:8px"><span style="width:96px">${S.n}</span><span style="flex:1;height:7px;background:#5a2024;border-radius:3px;overflow:hidden"><span style="display:block;height:100%;width:${w}%;background:#6fbc5a"></span></span><span style="width:34px;text-align:right">${w}%</span></div>`; };
  FW.hud.innerHTML = (FW.mg ? `<div style="text-align:center;color:#fff">MG NEST · KILLS ${FW.mg.kills}${FW.mg.streak > 1 ? ` · STREAK x${FW.mg.streak}` : ''}</div>` : '') + (PREFS.frontHud ? FW.sec.map(bar).join('') : '');
}
function fwStep(t) { const dt = Math.min(0.1, Math.max(0, t - FW.lt)); FW.lt = t; if (!dt || LEVEL.id !== 'fort') return;
  if (!FB.on) { fwTick(dt); fwMgStep(dt); } else if (FW.mg) FW.mg = null; fwHud(); }
{ const _fb = frontBuild; frontBuild = function () { const r = _fb.apply(this, arguments); for (const S of FW.sec) { S.line = -122; S.won = S.lost = 0; } FW.mg = null; fwCoverBuild(); fwHazeBuild(); FW.ourT = 1; FW.theirT = 3; levelAnims.push(fwStep); return r; }; }
setInterval(() => { if (FW.hud && (!LEVEL || LEVEL.id !== 'fort' || state !== 'play')) FW.hud.style.display = 'none'; }, 400);
// ---------- battlefield haze (2.23.87): dust and smoke thicken as you head out to the Front, thinner inside the walls ----------
{ const _ue = updateEnv; updateEnv = function (dt, t) { _ue(dt, t); if (!LEVEL || LEVEL.id !== 'fort') return;
  const out = player.pos.x < -14 && player.pos.y < 7, k = FW.fogK = (FW.fogK == null ? (out ? 1 : 0.45) : FW.fogK + ((out ? 1 : 0.45) - FW.fogK) * Math.min(1, (dt || 0.016) * 0.8));
  scene.fog.color.set('#3a332c').convertSRGBToLinear(); scene.fog.near = 22 - 16 * k; scene.fog.far = 140 - 72 * k; }; }
// soft haze: camera-facing puffs with a feathered edge drift across no-man's-land on the wind and wrap round, fading near the camera
function fwPuffTex() { if (FW.puffTex) return FW.puffTex; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (let k = 0; k < 7; k++) { const cx = 40 + Math.random() * 48, cy = 44 + Math.random() * 40, r = 26 + Math.random() * 22, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  return (FW.puffTex = new THREE.CanvasTexture(c)); }
function fwHazeBuild() { FW.puffs = []; const tex = fwPuffTex();
  for (let i = 0; i < 130; i++) { const m = new THREE.SpriteMaterial({ map: tex, color: i % 3 ? '#8a8078' : '#6a625c', transparent: true, opacity: 0, depthWrite: false, fog: true }), s = new THREE.Sprite(m);
    const x = -236 + Math.random() * 200, z = -18 + Math.random() * 96, sc = 12 + Math.random() * 14; s.scale.set(sc, sc * 0.45, 1); s.position.set(x, FRONT.baseH(x, z) + 1.2 + Math.random() * (i % 4 ? 2.2 : 6), z); s.renderOrder = 2; levelGroup.add(s);
    FW.puffs.push({ s, a: 0.3 + Math.random() * 0.25, v: 0.5 + Math.random() * 0.6, ph: Math.random() * 6 }); } }
function fwHaze(dt) { if (!FW.puffs) return; const cam = camera.position, t = performance.now() / 1000;
  for (const P of FW.puffs) { const s = P.s; s.position.x += P.v * dt; s.position.z += Math.sin(t * 0.05 + P.ph) * 0.15 * dt; if (s.position.x > -34) { s.position.x = -236; s.position.y = FRONT.baseH(-236, s.position.z) + 1.2 + Math.random() * 2.2; }
    const edge = Math.min(1, (s.position.x + 236) / 12, (-34 - s.position.x) / 12), near = clamp((s.position.distanceTo(cam) - 5) / 14, 0, 1);
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
  const near = sky ? 1 : clamp(p.distanceTo(player.pos) / 12, 0.3, 1), crowd = sky ? 0 : FW.booms.filter(o => !o.sky && o.t < 0.6 && o.p.distanceTo(player.pos) < 14).length; B.nk = near * (crowd > 1 ? 0.4 : 1); B.core = mawFireSprite('#ffffff', 2.5 * sc * B.nk); B.core.position.copy(p).add(V(0, sky ? 0 : 0.8 * sc, 0));
  for (let i = 0; i < (sky ? 4 : 6); i++) { const s = mawFireSprite(['#ffb060', '#ff7a2a', '#ffd36a'][i % 3], 1.5 * sc * near); s.position.copy(p).add(V((Math.random() - 0.5) * 1.6 * sc, (sky ? 0 : 0.6 * sc) + Math.random() * sc, (Math.random() - 0.5) * 1.6 * sc)); B.fire.push({ s, vy: (0.8 + Math.random()) * sc, g: 2.5 + Math.random() * 2 }); }
  if (!sky) { const tex = fwPuffTex();
    for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: i % 2 ? '#3a3430' : '#24201e', transparent: true, opacity: 0, depthWrite: false })); s.position.copy(p).add(V((Math.random() - 0.5) * sc, 0.8 * sc, (Math.random() - 0.5) * sc)); s.scale.setScalar(2 * sc); levelGroup.add(s); B.smoke.push({ s, vy: 1 + Math.random() * 0.8, life: 4 + Math.random() * 2 }); }
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(B_DEB(), fwMat(0)); m.position.copy(p).add(V(0, 0.4, 0)); m.scale.setScalar(0.6 + Math.random() * sc * 0.8); levelGroup.add(m); const a = Math.random() * 6.28, v = (4 + Math.random() * 6) * Math.sqrt(sc); B.deb.push({ m, v: V(Math.cos(a) * v * 0.5, 5 + Math.random() * 6 * sc, Math.sin(a) * v * 0.5), r: V(Math.random() * 9, Math.random() * 9, 0) }); }
    B.ring = new THREE.Mesh(FW.ringGeo || (FW.ringGeo = new THREE.RingGeometry(0.8, 1.15, 28)), new THREE.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    B.ring.rotation.x = -Math.PI / 2; B.ring.position.set(p.x, groundH(p.x, p.z) + 0.25, p.z); levelGroup.add(B.ring); }
  const d = p.distanceTo(player.pos); if (!sky && d < 60) { fwClip('crunch' + Math.floor(Math.random() * 5), 0.25 + 0.75 * (1 - d / 60), 0, {}, () => SFX.boom()); if (d < 16) shake(Math.min(0.5, 0.35 * sc * (1 - d / 16) + 0.1)); }
  else { const v = Math.min(sky ? 0.3 : 0.6, (sky ? 7 : 40) * sc / Math.max(20, d)), dl = Math.min(1.6, d / 340); fwClip('low' + (Math.random() < 0.5 ? 0 : 1), v, dl, { lp: sky ? 500 : 900, rate: 0.85 + Math.random() * 0.3 }, () => fwRumble(v, dl)); }
  FW.booms.push(B); return B; }
function B_DEB() { return FW.debGeo || (FW.debGeo = new THREE.BoxGeometry(0.22, 0.14, 0.18)); }
function fwBoomEnd(B) { for (const o of [B.core, B.ring, ...B.fire.map(f => f.s), ...B.smoke.map(f => f.s)]) if (o) { o.parent && o.parent.remove(o); o.material.dispose(); } for (const D of B.deb) D.m.parent && D.m.parent.remove(D.m); }
function fwBoomStep(dt) { for (let i = FW.booms.length - 1; i >= 0; i--) { const B = FW.booms[i], sc = B.sc; B.t += dt; const t = B.t;
    if (B.core.parent) { B.core.scale.setScalar((2.5 + t * 22) * sc * (B.nk || 1)); B.core.material.opacity = Math.max(0, 1 - t / 0.28); if (t > 0.3) { B.core.parent.remove(B.core); } }
    for (const f of B.fire) { const k = t / 1.1; f.s.position.y += f.vy * dt; f.s.scale.setScalar((1.5 + k * f.g) * sc * (B.nk || 1)); f.s.material.opacity = Math.max(0, 1 - k); }
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
// the sky battle flies the real fleets: Drome Cutters and The Eclipse against our cruisers, Raiders against Setting Sun fighters
function fwHulkCap(type, len) { const h = makeHulk(type); const bb = new THREE.Box3().setFromObject(h), L = bb.max.z - bb.min.z, s = len / Math.max(1, L), cz = (bb.max.z + bb.min.z) / 2;
  h.scale.setScalar(s); h.position.z = -cz * s; const w = new THREE.Group(); w.add(h); w.updateMatrixWorld(true); const fr = new THREE.Group(), bk = new THREE.Group();
  h.traverse(o => { if (!o.isMesh) return; const p = new THREE.Vector3(); o.getWorldPosition(p); const m = new THREE.Mesh(o.geometry, o.material); m.matrixAutoUpdate = false; m.matrix.copy(o.matrixWorld); m.matrixWorld.copy(o.matrixWorld); (p.z >= 0 ? fr : bk).add(m); });
  const g = new THREE.Group(), F = frMerge(fr), K = frMerge(bk); g.add(F); g.add(K); g.userData.back = K; return g; }
function fwFleetShip(ours) { const g = ours ? makeClassShip('fighter', { v: 2, p: 10, a: 6, st: 0, x: 0, own: {}, wing: 0, eng: 0, nose: 0, lc: 0, bolt: 0, wpn: 0, kit: 0 }) : makeRaider();
  g.traverse(o => { if (o.isSprite) o.visible = false; }); const bb = new THREE.Box3().setFromObject(g), L = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z), s = (ours ? 7 : 6.5) / Math.max(0.1, L);
  g.scale.setScalar(s); g.rotation.y = Math.PI; const w = new THREE.Group(); w.add(g); const out = frMerge(w); out.matrixAutoUpdate = false; fwNoFog(out); return out; }
{ const _sb = frSkyBuild; frSkyBuild = function () { const r = _sb.apply(this, arguments);
  let k = 0; for (const C of FS.caps) { if (C.ours) continue; const old = C.g, g = fwHulkCap(k++ % 2 ? 'flagship' : 'drome', k === 2 ? 150 : 115); g.position.copy(old.position); g.rotation.copy(old.rotation); levelGroup.remove(old); levelGroup.add(g); fwNoFog(g); C.g = g; }
  const F = FS.fighters; if (F) { F.models = { ours: [], them: [] }; for (const side of ['ours', 'them']) { F[side][0].visible = F[side][1].visible = false; for (let i = 0; i < F.N; i++) { const m = fwFleetShip(side === 'ours'); levelGroup.add(m); F.models[side].push(m); } } }
  return r; }; }
{ const _ss = frSkyStep; frSkyStep = function () { const r = _ss.apply(this, arguments); const F = FS.fighters; if (F && F.models) for (const side of ['ours', 'them']) { const I = F[side][0], L = F.models[side]; for (let i = 0; i < L.length; i++) { I.getMatrixAt(i, L[i].matrix); L[i].matrixWorldNeedsUpdate = true; } } return r; }; }
// flashes in the sky, and now and then a burning wreck comes down into the field
function fwSky(dt) { FW.skyT -= dt; if (FW.skyT <= 0) { FW.skyT = 0.6 + Math.random() * 1.8; fwBoom(V(-230 + Math.random() * 260, 70 + Math.random() * 90, -40 + Math.random() * 140), 4 + Math.random() * 5, true); }
  FW.wreckT -= dt; if (FW.wreckT <= 0 && FW.wrecks.length < 3) { FW.wreckT = 9 + Math.random() * 10;
    let tx = -190 + Math.random() * 140, tz = -10 + Math.random() * 80; if (Math.hypot(tx - player.pos.x, tz - player.pos.z) < 14) tx -= 20;
    const big = Math.random() < 0.3, g = new THREE.Group(); if (big) { for (let k = 0; k < 4; k++) part(g, B(2 + Math.random() * 3, 1.2 + Math.random() * 2, 3 + Math.random() * 5), fwMat(1), (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4, Math.random(), Math.random(), Math.random()); } else { const sh = fwFleetShip(Math.random() < 0.4); sh.matrixAutoUpdate = true; sh.rotation.z = Math.random() * 6; g.add(sh); } fwNoFog(g);
    const from = V(tx - 60 - Math.random() * 60, 140 + Math.random() * 40, tz + (Math.random() - 0.5) * 80); g.position.copy(from); levelGroup.add(g);
    FW.wrecks.push({ g, from, to: V(tx, groundH(tx, tz), tz), t: 0, T: big ? 9 : 5.5, big, trail: 0 }); }
  for (let i = FW.wrecks.length - 1; i >= 0; i--) { const W = FW.wrecks[i]; W.t += dt; const k = Math.min(1, W.t / W.T), e = k * k; W.g.position.lerpVectors(W.from, W.to, e); W.g.position.y = W.from.y + (W.to.y - W.from.y) * e;
    W.g.lookAt(W.to); W.g.rotateZ(W.t * (W.big ? 0.4 : 3)); W.trail -= dt; if (W.trail <= 0) { W.trail = 0.12; const f = mawFireSprite(Math.random() < 0.5 ? '#ff7a2a' : '#ffb060', W.big ? 6 : 3.5); f.position.copy(W.g.position); FW.booms.push({ t: 0.5, sc: W.big ? 2 : 1, sky: true, fire: [{ s: f, vy: 0, g: 3 }], smoke: [], deb: [], ring: null, core: { parent: null, scale: { setScalar() {} }, material: { dispose() {} } } }); }
    if (k >= 1) { levelGroup.remove(W.g); FW.wrecks.splice(i, 1); fwBoom(W.to, W.big ? 3 : 2); fwClip('metal', Math.min(0.7, 30 / Math.max(15, W.to.distanceTo(player.pos))), 0.15, { rate: W.big ? 0.6 : 0.85 }); FW.lastBoom = { p: W.to.clone(), t: performance.now() }; frScorch(W.to); } } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.bmLt || t))); FW.bmLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt) { fwBoomStep(dt); fwSky(dt); } }; }
// the Drome never reach the walls: field units stop at the edge of no-man's-land, roamers from the tank yard turn back short of the fort
function fwKeepOut() { for (const e of enemies) { if (e.dead || e.gone || !e.obj) continue; const p = e.obj.position;
  if (e.front) { if (p.x > -34) p.x = -34; continue; }
  if (irInFort(p.x, p.z, 10)) { const dx = Math.min(p.x - (IR.X0 - 10), IR.X1 + 10 - p.x), dz = Math.min(p.z - (IR.Z0 - 10), IR.Z1 + 10 - p.z);
    if (dx < dz) p.x = p.x - (IR.X0 - 10) < IR.X1 + 10 - p.x ? IR.X0 - 10 : IR.X1 + 10; else p.z = p.z - (IR.Z0 - 10) < IR.Z1 + 10 - p.z ? IR.Z0 - 10 : IR.Z1 + 10; e.aggro = false; e.wander = V(e.zone.x, 0, e.zone.z); } } }
{ const _st = fwStep; fwStep = function (t) { _st(t); if (LEVEL && LEVEL.id === 'fort') fwKeepOut(); }; }
// ---------- gunners on the west rampart (2.23.92): mounted MGs in the merlon gaps rake the field, a flak gun answers the sky ----------
function fwGunnersBuild() { FW.guns = []; const y0 = IR.WH + 0.12, dk = toon('#2b2a2c'), st = toon('#5d636c', 'hull');
  for (const z of [-11.8, -3.6, 4.6, 12.8, 32.7, 36.3]) {
    const mg = new THREE.Group(); mg.position.set(-13.55, y0, z); levelGroup.add(mg);
    part(mg, Cy(0.04, 0.04, 1.0, 6), dk, 0, 0.5, 0); for (const a of [0, 2.1, 4.2]) part(mg, Cy(0.025, 0.025, 1.05, 5), dk, Math.cos(a) * 0.22, 0.45, Math.sin(a) * 0.22, Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
    const head = new THREE.Group(); head.position.y = 1.02; mg.add(head); part(head, B(0.55, 0.16, 0.16), st, 0.05, 0, 0); part(head, Cy(0.035, 0.035, 0.9, 6), dk, -0.6, 0.02, 0, 0, 0, Math.PI / 2); part(head, B(0.12, 0.1, 0.2), dk, 0.15, -0.12, 0.12);
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), glow('#ffd36a')); flash.position.set(-1.07, 0.02, 0); flash.visible = false; head.add(flash);
    const o = buildChar(() => recolor(makeTrooper({ noGun: true }), { '#6f7a3e': '#4a5a32' }), 'trooper'); o.position.set(-12.55, y0, z); o.rotation.y = -Math.PI / 2; levelGroup.add(o);
    const R = o.userData.rig; if (R) { R.armR.rotation.x = R.armL.rotation.x = -1.35; R.armL.rotation.z = 0.25; R.armR.rotation.z = -0.25; R.torso && (R.torso.rotation.x = 0.12); }
    FW.guns.push({ head, flash, z, cd: Math.random() * 2, burst: 0, tg: null, ft: 0 }); }
  // a twin flak gun on the south-west tower, tracking the fighters overhead
  const fk = new THREE.Group(); fk.position.set(-12.2, y0, -18.4); levelGroup.add(fk); part(fk, Cy(0.5, 0.6, 0.5, 10), st, 0, 0.25, 0); const turret = new THREE.Group(); turret.position.y = 0.7; fk.add(turret);
  part(turret, B(0.9, 0.5, 0.8), st, 0, 0, 0); for (const s of [-1, 1]) part(turret, Cy(0.06, 0.06, 1.8, 6), dk, s * 0.2, 0.2, 0.9, Math.PI / 2, 0, 0); FW.flak = { turret, cd: 2 }; }
{ const _fb = frontBuild; frontBuild = function () { const r = _fb.apply(this, arguments); try { fwGunnersBuild(); } catch (err) { console.warn(err); } return r; }; }
function fwGunners(dt) { if (!FW.guns) return; const foes = FRONT.foes.filter(e => !e.dead && !e.gone && e.obj.position.x < -14);
  for (const G of FW.guns) { G.cd -= dt; G.ft -= dt; if (G.ft <= 0) G.flash.visible = false;
    if (!G.tg || G.tg.dead || G.tg.gone) { G.tg = null; if (foes.length && Math.random() < dt * 2) { let best = null, bd = 1e9; for (const e of foes) { const d = Math.abs(e.obj.position.z - G.z) + Math.random() * 30 + Math.max(0, -60 - e.obj.position.x) * 0.6; if (d < bd) { bd = d; best = e; } } G.tg = best; } }
    const T = G.tg; if (!T) continue; const hw = G.head.getWorldPosition(V(0, 0, 0)), tp = T.obj.position.clone().add(V(0, 1, 0));
    const yaw = Math.atan2(tp.z - hw.z, -(tp.x - hw.x)), pit = Math.atan2(tp.y - hw.y, Math.hypot(tp.x - hw.x, tp.z - hw.z)); G.head.rotation.set(0, yaw, -pit);
    if (G.cd <= 0) { if (G.burst <= 0) { G.burst = 5 + Math.floor(Math.random() * 6); G.cd = 0.08; } else { G.burst--; G.cd = G.burst ? 0.11 : 1.4 + Math.random() * 1.6;
      const mz = G.flash.getWorldPosition(V(0, 0, 0)), miss = V((Math.random() - 0.5) * 3, Math.random() * 1.5, (Math.random() - 0.5) * 3); tracer(mz, tp.clone().add(miss), '#ffd36a'); G.flash.visible = true; G.ft = 0.05;
      if (Math.random() < 0.25) { burst(tp.clone().add(miss).setY(groundH(tp.x, tp.z) + 0.1), '#8a7a60', 2, 2); }
      if (Math.random() < (T.obj.position.x > -70 ? 0.45 : 0.18)) { T.hp -= 18; T.hitT = 0.1; if (T.hp <= 0) frKillQuiet(T); else updatePlate(T); }
      if (hw.distanceTo(player.pos) < 22 && Math.random() < 0.5) frTone('square', 160, 60, 0.05, 0.03); } } }
  const F = FW.flak; if (F && FS.fighters) { F.cd -= dt; const L = FS.fighters.list, f = L[Math.floor((performance.now() / 4000) % L.length)], t = performance.now() / 1000;
    const a = t * f.sp + f.ph, tp = V(f.cx + Math.cos(a) * f.r, f.h + Math.sin(a * 2) * 12, f.cz + Math.sin(a) * f.r * 0.7), hw = F.turret.getWorldPosition(V(0, 0, 0));
    F.turret.rotation.set(0, 0, 0); F.turret.lookAt(tp); if (F.cd <= 0) { F.cd = 0.9 + Math.random() * 0.8; for (const s of [-1, 1]) tracer(F.turret.localToWorld(V(s * 0.2, 0.2, 1.8)), tp.clone().add(V((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 14)), '#ffb060');
      setTimeout(() => { if (LEVEL && LEVEL.id === 'fort') fwBoom(tp.clone().add(V((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 16)), 2.2, true); }, 500); if (hw.distanceTo(player.pos) < 30) frTone('sawtooth', 90, 40, 0.18, 0.05); } } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.gnLt || t))); FW.gnLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt) fwGunners(dt); }; }
// ---------- Drome bunkers and armour (2.23.92): pillboxes in front of their trench, and a tank now and then grinding up to shell from range ----------
function fwBunkersBuild() { FW.bunk = []; const con = toon('#3a3638', 'panel'), dk = toon('#1e1c22'), red = glow('#ff2a3a');
  for (const [x, z] of [[-192, 2], [-193, 26], [-192, 50], [-193, 66]]) { const g = new THREE.Group(), y = FRONT.baseH(x, z); g.position.set(x, y, z); levelGroup.add(g);
    part(g, B(3.4, 1.9, 4.2), con, 0, 0.95, 0); part(g, B(3.8, 0.35, 4.6), con, 0, 2.05, 0); part(g, B(0.1, 0.22, 2.6), dk, 1.72, 1.3, 0); part(g, B(0.04, 0.12, 2.4), red, 1.76, 1.3, 0);
    for (const sz of [-1, 1]) part(g, B(1.2, 1.2, 0.5), con, 1.4, 0.6, sz * 2.4, 0, sz * 0.4, 0); for (let k = 0; k < 6; k++) part(g, frBagGeo(), toon('#3a3034', 'cloth'), 2.1, 0.12 + (k % 2) * 0.2, -1.3 + Math.floor(k / 2) * 1.3, 0, Math.PI / 2, 0);
    box(x, z, 1.8, 2.3); FW.bunk.push({ x: x + 1.8, y: y + 1.3, z, cd: Math.random() * 3, burst: 0 }); }
  FW.tankT = 30; }
{ const _fb = frontBuild; frontBuild = function () { const r = _fb.apply(this, arguments); try { fwBunkersBuild(); } catch (err) { console.warn(err); } return r; }; }
function fwBunkers(dt) { if (!FW.bunk) return; const men = FRONT.men.filter(m => m.field && !m.dead && m.o.visible && m.o.position.x < -60);
  for (const K of FW.bunk) { K.cd -= dt; if (K.cd > 0) continue; if (K.burst <= 0) { K.burst = 4 + Math.floor(Math.random() * 5); K.tg = men.length ? men[Math.floor(Math.random() * men.length)] : null; K.cd = 0.1; continue; }
    K.burst--; K.cd = K.burst ? 0.13 : 2 + Math.random() * 3; const from = V(K.x, K.y, K.z + (Math.random() - 0.5) * 2), to = K.tg ? K.tg.o.position.clone().add(V((Math.random() - 0.5) * 2, 1, (Math.random() - 0.5) * 2)) : V(-80 - Math.random() * 60, 1, K.z + (Math.random() - 0.5) * 30);
    tracer(from, to, '#ff4a3a'); if (K.tg && Math.random() < 0.1 && !K.tg.dead) frHurtMan(K.tg, 14); }
  if (!FB.on) { FW.tankT -= dt; if (FW.tankT <= 0) { FW.tankT = 45 + Math.random() * 40; if (frAlive().filter(e => e.front.mode === 'tank').length < 2) { const e = frSpawnKind('tank'); if (e) e.front.stopX = -150 - Math.random() * 20; } } } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.bkLt || t))); FW.bkLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt) fwBunkers(dt); }; }
// ---------- the siege walker's rocket pods (2.23.92): the shoulder pods tilt up, rockets climb, red circles mark where they land; step out of the circle and you're safe ----------
FW.rk = { t: 6, list: [], pods: null, tilt: 0 };
function fwRocketStep(dt) { const R = FW.rk, e = FB.boss;
  if (!e || e.dead || !e.obj.parent) { for (const r of R.list) fwRocketEnd(r); R.list.length = 0; R.pods = null; return; }
  if (!R.pods || R.e !== e) { R.e = e; R.pods = []; /* rocket pods ride on top of the shoulder armour: stowed flat, they swing up to fire */
    const sc = e.obj.scale.x || 1, pm = toon('#2a2024', 'panel'), tip = glow('#ff6a1a'); for (const sd of [-1, 1]) { const pod = new THREE.Group(); pod.position.set(1.4 * sd, 3.75, 0.5); e.obj.add(pod); const body = new THREE.Group(); body.position.z = -0.5; pod.add(body);
      part(body, B(0.62, 0.42, 1.1), pm, 0, 0, 0); for (let i = 0; i < 6; i++) part(body, Cy(0.07, 0.07, 0.04, 8), tip, -0.18 + (i % 3) * 0.18, -0.09 + Math.floor(i / 3) * 0.18, 0.56, Math.PI / 2, 0, 0); R.pods.push(pod); } }
  const d = e.obj.position.distanceTo(player.pos); R.t -= dt; const want = R.t < 1.2 || R.fire > 0 ? 1 : 0; R.tilt += (want - R.tilt) * Math.min(1, dt * 4); for (const o of R.pods) o.rotation.x = -1.0 * R.tilt;
  if (R.t <= 0 && d < 95) { R.t = 8 + Math.random() * 4; R.fire = 7; R.ft = 0; toast('ROCKETS INCOMING', 'Get out of the red circles', 1.6); }
  if (R.fire > 0) { R.ft -= dt; if (R.ft <= 0) { R.ft = 0.22; R.fire--; const first = R.fire === 6, a = Math.random() * 6.28, off = first ? 0 : 2 + Math.random() * 7;
      const tg = V(player.pos.x + Math.cos(a) * off + (first ? 0 : player.vx || 0), 0, player.pos.z + Math.sin(a) * off); tg.y = groundH(tg.x, tg.z);
      const pod = R.pods[R.fire % Math.max(1, R.pods.length)], from = pod ? pod.getWorldPosition(V(0, 0, 0)) : e.obj.position.clone().add(V(0, 4, 0));
      const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.0, 32), new THREE.MeshBasicMaterial({ color: '#ff2a3a', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      const disc = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ color: '#ff2a3a', transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      for (const m of [ring, disc]) { m.rotation.x = -Math.PI / 2; m.position.set(tg.x, tg.y + 0.12, tg.z); m.renderOrder = 3; levelGroup.add(m); }
      const rk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 6), glow('#ffb060')); rk.position.copy(from); levelGroup.add(rk);
      R.list.push({ ring, disc, rk, from, tg, t: 0, T: 2.0 + Math.random() * 0.3, trail: 0 }); SFX.shot ? SFX.shot() : 0; } }
  for (let i = R.list.length - 1; i >= 0; i--) { const r = R.list[i]; r.t += dt; const k = r.t / r.T;
    r.disc.material.opacity = 0.12 + 0.2 * k * (0.6 + 0.4 * Math.sin(r.t * 18)); r.ring.scale.setScalar(1 + 0.08 * Math.sin(r.t * 10));
    let p; if (k < 0.4) { const u = k / 0.4; p = r.from.clone().add(V((r.tg.x - r.from.x) * 0.15 * u, 40 * u * (2 - u), (r.tg.z - r.from.z) * 0.15 * u)); } else { const u = (k - 0.4) / 0.6, top = r.from.clone().add(V((r.tg.x - r.from.x) * 0.15, 40, (r.tg.z - r.from.z) * 0.15)); p = top.lerp(r.tg, u * u); }
    const prev = r.rk.position.clone(); r.rk.position.copy(p); r.rk.quaternion.setFromUnitVectors(V(0, 1, 0), p.clone().sub(prev).normalize()); r.trail -= dt;
    if (r.trail <= 0) { r.trail = 0.06; const f = mawFireSprite('#ff9a3a', 1.6); f.position.copy(p); FW.booms.push({ t: 0.6, sc: 0.6, sky: true, fire: [{ s: f, vy: 0, g: 2 }], smoke: [], deb: [], ring: null, core: { parent: null, scale: { setScalar() {} }, material: { dispose() {} } } }); }
    if (k >= 1) { fwBoom(r.tg, 1.3); const dp = Math.hypot(player.pos.x - r.tg.x, player.pos.z - r.tg.z); if (dp < 3.0 && player.pos.y - r.tg.y < 3) hurt(48, r.tg);
      for (const m of FRONT.men) if (!m.dead && m.o.position.distanceTo(r.tg) < 3) frHurtMan(m, 120); fwRocketEnd(r); R.list.splice(i, 1); } } }
function fwRocketEnd(r) { for (const m of [r.ring, r.disc, r.rk]) { m.parent && m.parent.remove(m); m.geometry.dispose(); if (m !== r.rk) m.material.dispose(); } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.rkLt || t))); FW.rkLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt) fwRocketStep(dt); }; }
// ---------- recorded battle sounds (2.23.92): crunching blasts close by, low booms far off, fighter flybys, cruiser lasers, metal debris ----------
function fwClip(name, vol, delay, o, fallback) { if (!PREFS.sfx || vol < 0.01) return; const c = clipCtx(); if (!c) { fallback && fallback(); return; } const f = 'war/' + name;
  if (!CLIP.buf[f]) { clipLoad(f); fallback && fallback(); return; } const ac = c.ac, t = ac.currentTime + 0.01 + (delay || 0), src = ac.createBufferSource(), g = ac.createGain(); src.buffer = CLIP.buf[f]; src.playbackRate.value = o.rate || 1; let tail = g;
  if (o.lp) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; src.connect(lp); lp.connect(g); } else src.connect(g);
  const len = o.len || CLIP.buf[f].duration / (o.rate || 1); if (o.swell) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + len * 0.45); g.gain.linearRampToValueAtTime(0, t + len); } else g.gain.value = vol;
  tail.connect(c.master); src.start(t); src.stop(t + len + 0.05); }
// warm the cache when you arrive so the first blast isn't the synth one
{ const _fb = frontBuild; frontBuild = function () { const r = _fb.apply(this, arguments); try { for (const n of ['crunch0', 'crunch1', 'crunch2', 'crunch3', 'crunch4', 'low0', 'low1', 'engine0', 'engine1', 'engine2', 'engine4', 'laser0', 'laser1', 'laser4', 'metal']) clipLoad('war/' + n); } catch (_) {} return r; }; }
{ const _fb = frBeam; frBeam = function (a, b, col) { const r = _fb.apply(this, arguments); if (Math.random() < 0.5) fwClip('laser' + [0, 1, 4][Math.floor(Math.random() * 3)], Math.min(0.22, 30 / Math.max(60, a.distanceTo(player.pos))), 0, { lp: 2400, rate: 0.7 + Math.random() * 0.3 }); return r; }; }
function fwFlyby(dt) { FW.flyT = (FW.flyT == null ? 3 : FW.flyT) - dt; if (FW.flyT > 0) return; FW.flyT = 2.5 + Math.random() * 4.5;
  fwClip('engine' + [0, 1, 2, 4][Math.floor(Math.random() * 4)], 0.18 + Math.random() * 0.2, 0, { swell: 1, rate: 0.8 + Math.random() * 0.6, len: 2.6 + Math.random() * 1.6, lp: 3000 }); }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.fyLt || t))); FW.fyLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt && player.pos.y < 30) fwFlyby(dt); }; }

// ---------- the assault (2.23.96): Drome squads cross the whole field toward the gate; the rampart gunners cut them down, and you can help ----------
FW.asT = 12;
function fwAssault(dt) { if (FB.on || !FRONT.on) return; FW.asT -= dt; if (FW.asT > 0) return; FW.asT = 14 + Math.random() * 10;
  if (FRONT.foes.filter(e => !e.dead && !e.gone && e.front && e.front.assault).length >= 8) return;
  const z = -8 + Math.random() * 72, n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) { const x = -228 + Math.random() * 6, zz = clamp(z + (Math.random() - 0.5) * 8, -12, 70), e = makeEnemy({ zone: 'siege', type: 'dtrooper', n: 1, lv: [18, 22], once: true }); e.obj.position.set(x, FRONT.h(x, zz), zz); e.obj.rotation.y = Math.PI / 2; e.front = { mode: 'advance', stopX: -36 - Math.random() * 6, home: V(x, 0, zz), tt: 0, tg: null, st: 'up', t: Math.random() * 2, assault: 1 }; e.aggro = true; FRONT.foes.push(e); } }
{ const _st = fwStep; fwStep = function (t) { const dt = Math.min(0.1, Math.max(0, t - (FW.asLt || t))); FW.asLt = t; _st(t); if (LEVEL && LEVEL.id === 'fort' && dt) { fwAssault(dt); if (!VH.body && VH.shk) VH.shk = Math.max(0, VH.shk - dt * 2.5); } }; }
