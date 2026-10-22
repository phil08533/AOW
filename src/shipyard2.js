// =================== SHIPYARD 2: detailed raid ships with turrets, Zeltac raid and rescue contracts, the mining cockpit ===================
// ---------- raid ships: much more hull detail, faction marks, gun turrets ----------
const HULK_MARK = {};
function hulkMark(type) {
  if (HULK_MARK[type]) return HULK_MARK[type]; const T = HULK_TYPES[type], c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = T.trim; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(64, 64, 50, 0, 7); x.fill(); x.fillStyle = T.light;
  if (type === 'drome' || type === 'flagship') { x.beginPath(); x.arc(64, 70, 26, Math.PI, 0); x.fill(); for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6; x.fillRect(64 + Math.cos(a) * 32 - 3, 70 + Math.sin(a) * 32 - 3, 6, 6); } x.fillRect(30, 72, 68, 5); }
  else if (type === 'raider') { x.beginPath(); x.arc(64, 56, 24, 0, 7); x.fill(); x.fillRect(48, 70, 32, 16); x.fillStyle = '#111'; x.beginPath(); x.arc(55, 56, 7, 0, 7); x.arc(73, 56, 7, 0, 7); x.fill(); x.strokeStyle = T.light; x.lineWidth = 6; x.beginPath(); x.moveTo(24, 24); x.lineTo(104, 104); x.moveTo(104, 24); x.lineTo(24, 104); x.stroke(); }
  else { x.font = 'bold 56px monospace'; x.textAlign = 'center'; x.fillText('☣', 64, 84); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return HULK_MARK[type] = new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false });
}
{ const _mh = makeHulk; makeHulk = function (type) {
  const g = _mh(type), T = HULK_TYPES[type], s = T.big ? 2.6 : 1, dk = '#26282e', turrets = [], blink = [];
  if (type === 'hive') { for (let i = 0; i < 14; i++) { const a = i * 0.9, sp = part(g, new THREE.ConeGeometry(0.5 * s, 3.2 * s, 5), T.hull, Math.cos(a) * 4.6 * s, Math.sin(a) * 3.6 * s, (i - 7) * 2.4 * s); sp.lookAt(sp.position.clone().multiply(V(2, 2, 1)).add(g.position)); sp.rotateX(Math.PI / 2); }
    for (let i = 0; i < 18; i++) blink.push(E(g, glow('#ffb347'), Math.cos(i * 2.1) * 4.9 * s, Math.sin(i * 1.3) * 3.9 * s, (i - 9) * 2 * s, 0.35 * s, 0.35 * s, 0.35 * s)); }
  else {
    // bridge tower with lit windows, masts and dishes
    part(g, B(4.4 * s, 3.2 * s, 4.6 * s), T.hull, 0, 7.6 * s, 10 * s); part(g, B(4.5 * s, 0.5 * s, 0.2 * s), glow('#ffe7a8'), 0, 8.2 * s, 7.65 * s); part(g, B(3.6 * s, 0.3 * s, 4 * s), dk, 0, 9.35 * s, 10 * s);
    for (const x of [-1.4, 1.4]) part(g, Cy(0.08 * s, 0.08 * s, 5 * s, 4), dk, x * s, 11.5 * s, 10.5 * s);
    const dish = part(g, new THREE.SphereGeometry(1.1 * s, 10, 6, 0, 6.28, 0, 1.2), dk, 1.8 * s, 9.9 * s, 12 * s, -0.6); dish.material = toon('#9aa1aa');
    // armor panels and greebles down both flanks
    for (const x of [-1, 1]) { for (let i = 0; i < 6; i++) { part(g, B(0.3 * s, 2.2 * s, 4.4 * s), i % 2 ? dk : T.hull, x * 4.65 * s, -0.8 * s, (-13 + i * 5.2) * s); part(g, B(0.4 * s, 0.4 * s, 0.4 * s), '#5d636c', x * 4.8 * s, 1.9 * s, (-12 + i * 5.2) * s); }
      for (let i = 0; i < 4; i++) part(g, Cy(0.18 * s, 0.18 * s, 30 * s, 6), '#5d636c', x * (2 + i * 0.5) * s, -3.1 * s, 0, Math.PI / 2);
      const mk = part(g, new THREE.CircleGeometry(2.2 * s, 24), hulkMark(type), x * 4.82 * s, 0.4 * s, -4 * s, 0, x * Math.PI / 2); mk.renderOrder = 2;
      // docking bay
      part(g, B(0.2 * s, 2.4 * s, 3.4 * s), glow(T.light), x * 4.56 * s, -0.6 * s, 6 * s); }
    // big engine block with three glowing bells
    part(g, B(8 * s, 5 * s, 3 * s), dk, 0, 0, 17.5 * s);
    for (const x of [-2.8, 0, 2.8]) { part(g, Cy(1.2 * s, 1.6 * s, 2.4 * s, 10), '#3a3d44', x * s, 0, 20 * s, Math.PI / 2); const b = part(g, Cy(1.05 * s, 1.05 * s, 0.2 * s, 10), glow(type === 'derelict' ? '#3a3d44' : '#ff9a3c'), x * s, 0, 21.25 * s, Math.PI / 2); if (type !== 'derelict') blink.push(b); }
    // prow: a hammer-head with a lit slit
    part(g, B(10 * s, 3 * s, 3 * s), T.hull, 0, 0.6 * s, -17.8 * s); part(g, B(8 * s, 0.4 * s, 0.2 * s), glow(T.light), 0, 1.2 * s, -19.35 * s);
    // running lights along the spine
    for (let i = 0; i < 10; i++) blink.push(part(g, B(0.35 * s, 0.35 * s, 0.35 * s), glow(i % 2 ? '#ff3a2a' : '#6fdc5a'), 0, 3.15 * s, (-16 + i * 3.4) * s));
    // turrets on the hostile ships
    if (['raider', 'drome', 'flagship'].includes(type)) for (const [x, y, z] of [[-3, 3.1, -9], [3, 3.1, -9], [-3, 3.1, 2], [3, 3.1, 2], ...(T.big ? [[0, 9.6, 6], [-3, -3.2, -4], [3, -3.2, -4]] : [])]) {
      const tg = new THREE.Group(); tg.position.set(x * s, y * s, z * s); g.add(tg); part(tg, Cy(0.9 * s, 1.1 * s, 0.6 * s, 10), dk, 0, y < 0 ? -0.3 * s : 0.3 * s, 0);
      const head = new THREE.Group(); head.position.y = (y < 0 ? -0.8 : 0.8) * s; tg.add(head); part(head, B(1.2 * s, 0.8 * s, 1.4 * s), T.hull, 0, 0, 0); for (const b of [-0.25, 0.25]) part(head, Cy(0.1 * s, 0.12 * s, 2.2 * s, 6), '#9aa1aa', b * s, 0.05 * s, 1.4 * s, Math.PI / 2);
      part(head, B(0.5 * s, 0.2 * s, 0.1 * s), glow('#ff2a3a'), 0, 0.2 * s, 0.71 * s); turrets.push({ head, cd: Math.random() * 2 }); }
  }
  g.userData.turrets = turrets; g.userData.blink = blink; return g;
}; }
// more ships around the bigger map
{ const _fw = freshWrecks; freshWrecks = function () { _fw(); const ids = Object.keys(SPACE_BODIES).filter(id => !SPACE_BODIES[id].station), types = ['derelict', 'raider', 'drome', 'hive', 'raider', 'drome'];
  for (let i = 0; i < 4; i++) { const P = SPACE_BODIES[ids[randi(0, ids.length - 1)]], a = Math.random() * 6.28, d = P.r + 200 + Math.random() * 500;
    BOARD.wrecks.push({ id: 'w' + Date.now() + 'x' + i, type: types[randi(0, types.length - 1)], pos: P.pos.clone().add(V(Math.cos(a) * d, (Math.random() - 0.5) * 140, Math.sin(a) * d)), ry: Math.random() * 6.28, lv: hulkLv() }); } }; }

// ---------- Zeltac contracts: raid a marked ship (outlaws) or rescue its hostages (everyone else) ----------
{ const _qa = qAvailable; qAvailable = function (id) { const q = QDEFS[id]; if (q && q.when && !q.when()) return false; return _qa(id); }; }
const outlawNow = () => typeof isOutlaw === 'function' && isOutlaw();
defQuest('zr1', { ch: 'Zeltac · Contract', title: 'Raid Contract', giver: 'rell', turnIn: 'rell', req: ['z1'], repeat: true, when: () => outlawNow(),
  intro: ["You've got a reputation. Good. A fat ship is drifting out past the lanes, and its owner owes the wrong people.", "Board it, clear the crew, take what you like. I've put a marker on your nav."],
  obj: [{ kind: 'kill', t: 'board_mission', n: 1, text: 'Board and clear the marked ship', planet: 'space' }],
  outro: ["Clean work. Nobody saw a thing, right? Right."], reward: { cr: 3200, xp: 2800, items: { circuit: 3 } } });
defQuest('zh1', { ch: 'Zeltac · Rescue', title: 'Hostage Rescue', giver: 'rell', turnIn: 'rell', req: ['z1'], repeat: true, when: () => !outlawNow(),
  intro: ["Pirates grabbed a passenger shuttle. Three civilians are tied up on their ship.", "I've marked it on your nav. Clear the crew and cut those people loose. The Marshals will remember it."],
  obj: [{ kind: 'kill', t: 'hostage', n: 3, text: 'Free 3 hostages on the marked ship', planet: 'space' }],
  outro: ["All three home safe. You did a good thing out there, pilot."], reward: { cr: 2600, xp: 3400, items: { medkit: 2 } } });
const missionKind = () => qState('zr1') && qState('zr1').st === 'active' ? 'raid' : qState('zh1') && qState('zh1').st === 'active' ? 'hostage' : null;
const MISSION_DONE = {};
function ensureMissionWreck() {
  const k = missionKind(); if (!k) return; const qid = k === 'raid' ? 'zr1' : 'zh1', s = qState(qid); if (s.p && s.p[0] >= QDEFS[qid].obj[0].n) return;
  if (!BOARD.wrecks || Date.now() - BOARD.made > 12 * 60000 || !BOARD.wrecks.length) freshWrecks();
  if (BOARD.wrecks.some(w => w.mission === k)) return;
  const ids = Object.keys(SPACE_BODIES).filter(id => !SPACE_BODIES[id].station), P = SPACE_BODIES[ids[randi(0, ids.length - 1)]], a = Math.random() * 6.28, d = P.r + 350 + Math.random() * 400;
  BOARD.wrecks.push({ id: 'm' + Date.now(), type: k === 'raid' ? (Math.random() < 0.5 ? 'drome' : 'raider') : 'raider', mission: k, pos: P.pos.clone().add(V(Math.cos(a) * d, (Math.random() - 0.5) * 120, Math.sin(a) * d)), ry: Math.random() * 6.28, lv: Math.max(8, S.lvl) });
}
{ const _ll = loadLevel; loadLevel = function (id, o) {
  if (id === 'space') ensureMissionWreck();
  const r = _ll(id, o);
  if (id === 'space' && BOARD.wrecks) for (const W of BOARD.wrecks) { const m = W.obj; if (!m || !m.parent) continue; const U = m.userData;
    if (W.mission) { const sp = labelSprite(768, 72); levelGroup.add(sp); const bc = glowSprite('#ffd36a', 16); m.add(bc); bc.position.y = 16; W.mk = sp; }
    if (fly) { fly.extra = fly.extra || []; for (const T of U.turrets) { T.hp = T.max = 140 + W.lv * 14; T.dead = false;
      fly.extra.push({ r: 2.4 * (HULK_TYPES[W.type].big ? 2.6 : 1), get dead() { return T.dead || !m.parent; }, pos: () => T.head.getWorldPosition(V(0, 0, 0)), hit: (dmg, at) => { if (T.dead) return; T.hp -= dmg; burst(at, '#ffd36a', 6, 10); hitmark(false); T.flash = 0.12;
        if (T.hp <= 0) { T.dead = true; const p = T.head.getWorldPosition(V(0, 0, 0)); T.head.visible = false; burst(p, '#ff9a3c', 30, 25); burst(p, '#3a3d44', 20, 12); SFX.boom(); hitmark(true); spaceDrop(p, 'cr', null, Math.round(30 + W.lv * 6)); if (Math.random() < 0.5) spaceDrop(p, 'item', 'circuit', 1); gainXp(Math.round(40 + W.lv * 8)); questProgressKill('turret');
          const sm = glowSprite('rgba(60,60,60,0.8)', 6 * (HULK_TYPES[W.type].big ? 2.6 : 1)); sm.position.copy(T.head.parent.position); m.add(sm); } } }); } }
    levelAnims.push(t => { if (!m.parent) return; const d = player.pos.distanceTo(m.position);
      U.blink.forEach((b, i) => { b.visible = Math.sin(t * 3 + i * 0.7) > -0.4; });
      if (W.mk) { W.mk.position.copy(m.position).add(V(0, 20 + d * 0.06, 0)); W.mk.scale.set(d * 0.75, d * 0.07, 1); W.mk.visible = d > 90; if (((t * 2) | 0) !== W.mkT) { W.mkT = (t * 2) | 0; drawPlate(W.mk, W.mission === 'raid' ? 'CONTRACT: raid this ship' : 'RESCUE: hostages aboard', (d > 999 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m'), '#ffd36a', null); } }
      // turrets track you and open fire when you get close
      if (!fly || !player.alive || d > 420 || dlgOpen) return;
      const tdt = Math.min(0.1, t - (U.lt || t)); U.lt = t; for (const T of U.turrets) { if (T.dead) continue; const wp = T.head.getWorldPosition(V(0, 0, 0)); T.head.lookAt(player.pos); T.cd -= tdt;
        if (d < 320 && T.cd <= 0) { T.cd = 1.2 + Math.random() * 1.2; const b = new THREE.Mesh(boltGeo, glow('#ff2a3a')); b.scale.setScalar(4); b.position.copy(wp); levelGroup.add(b);
          const lead = player.pos.clone().addScaledVector(fly.vel, wp.distanceTo(player.pos) / 160); fly.bolts.push({ m: b, v: lead.sub(wp).normalize().multiplyScalar(160), life: 3, dmg: 4 + W.lv * 0.5 }); if (d < 200) SFX.zap(); } } }); }
  return r;
}; }
{ const _bs = boardShipW; boardShipW = function (W) { _bs(W); if (BOARD.cur) BOARD.cur.mission = W.mission || null; }; }
{ const _bc = boardCleared; boardCleared = function () { _bc(); const C = BOARD.cur; if (C && C.mission === 'raid') { questProgressKill('board_mission'); toast('CONTRACT DONE', 'Head back to Rell on the Zeltac', 3); } if (C && C.mission === 'hostage') toast('CREW DOWN', 'Now cut the hostages loose', 3); }; }
// hostages kneel in the side rooms with their hands tied
{ const ob = LEVELS.boarding.build; LEVELS.boarding.build = function () { ob.call(this); const C = BOARD.cur; if (!C || C.mission !== 'hostage') return;
  const spots = [[-8.5, -8.5], [8.5, 8.5], [-8.5, 22]], looks = [['#3a6cb8', '#2a2c32', '#c68a5a', '#2a1a10'], ['#c8402f', '#3a3d44', '#f0c8a0', '#d8b060'], ['#6f7a3e', '#2a2c32', '#8a5a3a', '#111111']];
  spots.forEach(([x, z], i) => { const h = mergeChar(makeCivilian(...looks[i])); h.position.set(x, 0, z); h.scale.set(1, 0.72, 1); h.rotation.y = Math.PI * (i % 2 ? 0.5 : -0.5); levelGroup.add(h);
    const rope = part(levelGroup, new THREE.TorusGeometry(0.28, 0.05, 4, 10), '#c9a46a', x, 0.85, z, Math.PI / 2); let freed = false;
    INTERACTS.push({ x, z, r: 2.2, get label() { return freed ? '' : '🔓 Cut the hostage loose'; }, fn: () => { if (freed) return;
      if (boardEnemies().some(e => !e.dead && e.obj.position.distanceTo(h.position) < 14)) { toast('NOT YET', 'Clear the guards around them first', 1.6); return; }
      freed = true; levelGroup.remove(rope); h.scale.set(1, 1, 1); burst(h.position.clone().add(V(0, 1, 0)), '#6fdc5a', 16, 4); SFX.quest(); questProgressKill('hostage'); if (typeof goodDeed === 'function') goodDeed(3, 'freed a hostage');
      toast('HOSTAGE FREED', ['"Thank the stars!"', '"I thought we were done for."', '"Get me off this rust bucket!"'][i], 2); const t0 = gameTime;
      levelAnims.push(() => { if (!h.parent) return; const k = gameTime - t0; if (k > 1.2 && k < 6) { h.position.z += 0.06; h.rotation.y = 0; } if (k > 6) { levelGroup.remove(h); } }); } }); });
}; }

// ---------- the mining cockpit: grilles, hazard trim, a drill screen and a spinning beacon ----------
{ const base = scockBuild; scockBuild = function () { base();
  const g = SCOCK.g, s0 = g.scale.x; g.scale.setScalar(1); const mg = new THREE.Group(); g.add(mg); SCOCK.mine = mg;
  const M = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).convertSRGBToLinear(), fog: false }), L = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h), fog: false, toneMapped: false });
  const hz = document.createElement('canvas'); hz.width = 256; hz.height = 16; const hx = hz.getContext('2d'); hx.fillStyle = '#ffd36a'; hx.fillRect(0, 0, 256, 16); hx.fillStyle = '#16181c'; for (let i = -16; i < 256; i += 16) { hx.beginPath(); hx.moveTo(i, 16); hx.lineTo(i + 8, 16); hx.lineTo(i + 16, 0); hx.lineTo(i + 8, 0); hx.fill(); }
  const ht = new THREE.CanvasTexture(hz); ht.magFilter = THREE.NearestFilter; ht.wrapS = THREE.RepeatWrapping; ht.repeat.x = 3; const haz = new THREE.MeshBasicMaterial({ map: ht, fog: false });
  const bar = M('#3a3d44');
  part(mg, B(1.5, 0.012, 0.012), bar, 0, -0.1, -0.64);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) part(mg, B(0.012, 0.07, 0.012), bar, x, -0.135, -0.64);
  const band = part(mg, B(1.62, 0.03, 0.01), haz, 0, -0.205, -0.625); band.rotation.x = 0.15; part(mg, B(1.7, 0.035, 0.012), haz, 0, 0.415, -0.6);
  // drill and hopper screen on the left pillar
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 112; const cx = cv.getContext('2d'), tt = new THREE.CanvasTexture(cv); tt.magFilter = THREE.NearestFilter;
  part(mg, B(0.15, 0.11, 0.01), M('#111'), -0.6, 0.12, -0.67, 0, 0.45); const scr = part(mg, new THREE.PlaneGeometry(0.135, 0.095), new THREE.MeshBasicMaterial({ map: tt, fog: false, toneMapped: false }), -0.598, 0.12, -0.663, 0, 0.45);
  SCOCK.mineDraw = t => { cx.fillStyle = '#140e04'; cx.fillRect(0, 0, 160, 112); cx.fillStyle = '#ffb347'; cx.font = 'bold 15px monospace'; cx.fillText('DRILL', 8, 18); cx.fillText('HOPPER', 8, 72);
    const rpm = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.7)); cx.fillStyle = '#3a2a10'; cx.fillRect(8, 24, 144, 12); cx.fillStyle = rpm > 0.9 ? '#ff5a3a' : '#ffd36a'; cx.fillRect(8, 24, 144 * rpm, 12); cx.fillStyle = '#ffb347'; cx.fillText(Math.round(rpm * 4800) + ' RPM', 8, 52);
    const ore = Math.min(1, (S.inv.ore || 0) / 60); cx.fillStyle = '#3a2a10'; cx.fillRect(8, 78, 144, 12); cx.fillStyle = '#6fdc5a'; cx.fillRect(8, 78, 144 * ore, 12); cx.fillStyle = '#ffb347'; cx.fillText((S.inv.ore || 0) + ' ORE', 8, 106); tt.needsUpdate = true; };
  // spinning amber beacon
  part(mg, Cy(0.03, 0.035, 0.02, 10), M('#2a2d33'), 0.6, 0.31, -0.6); const bk = part(mg, new THREE.SphereGeometry(0.026, 10, 8), L('#ffb347'), 0.6, 0.335, -0.6);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.02), new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); beam.position.set(0.6, 0.335, -0.6); mg.add(beam); SCOCK.beam = beam;
  mg.traverse(c => { c.renderOrder = 6; }); g.scale.setScalar(s0); mg.visible = false; }; }
{ const _ss = spaceStep; spaceStep = function (dt, t) { _ss(dt, t); if (!SCOCK.g || !SCOCK.mine) return; const on = shipCls() === 'miner'; SCOCK.mine.visible = on; if (!on || !SCOCK.g.visible) return;
  SCOCK.beam.rotation.y = t * 5; if (((t * 6) | 0) !== SCOCK.mT) { SCOCK.mT = (t * 6) | 0; SCOCK.mineDraw(t); } }; }
