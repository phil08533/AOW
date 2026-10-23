// =================== SABLE: the bounty hunter between Chapter 4 and 5 ===================
// Arena Prime ring: a talk, a boss fight (blinks around the ring, throws a floor laser grid you jetpack over),
// then a scene aboard his ship that unlocks the Lab. Save: S.flags.bhMet, S.flags.bhLab, quest 'bh1'.
const BH_MATS = {};
function bhMat(k, mk) { return BH_MATS[k] || (BH_MATS[k] = mk()); }
function makeBountyHunter() {
  const g = new THREE.Group(), SC = 0.00072;
  for (const [name, col, pos, idx] of BH_MODEL) {
    const P = new Float32Array(pos.length); for (let i = 0; i < pos.length; i++) P[i] = pos[i] * SC;
    if (/crystal shard/.test(name)) for (let i = 1; i < P.length; i += 3) P[i] -= 0.1; // spikes sit lower on the skull
    let geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(idx); geo = geo.toNonIndexed(); geo.computeVertexNormals();
    let mat;
    if (name === 'crystal skull' || /crystal shard/.test(name)) mat = bhMat('glass', () => new THREE.MeshPhongMaterial({ color: '#d8f4ff', specular: '#ffffff', shininess: 160, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide }));
    else if (/^eye/.test(name)) {
      mat = bhMat('eye', () => new THREE.MeshBasicMaterial({ color: '#000000' }));
      // the black glow: a dark violet shell around each eye
      const h = geo.clone(); h.computeBoundingBox(); const c = h.boundingBox.getCenter(V(0, 0, 0)); h.translate(-c.x, -c.y, -c.z); h.scale(1.9, 1.9, 1.9); h.translate(c.x, c.y, c.z);
      g.add(new THREE.Mesh(h, bhMat('eyeglow', () => new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.55, depthWrite: false }))));
    }
    else if (col === '#4a1e64' || col === '#6c2d8b') mat = bhMat('cape' + col, () => toon(col === '#4a1e64' ? '#0c0a10' : '#17141c'));
    else if (/crystal/.test(name) || name === 'holo panel' || name === 'plasma core') mat = bhMat('g' + col, () => glow(name === 'plasma core' ? '#6a2aff' : col));
    else mat = bhMat('t' + col, () => toon(col));
    g.add(new THREE.Mesh(geo, mat));
  }
  return g;
}
RIGS.bh = { type: 'biped', hip: 0.86, neck: 1.42, armX: 0.27, ax: 0.36, sh: 1.33, legX: 0.15 };
ENEMY.sable = { rig: 'bh', name: 'Kade, the Glass Hunter', make: makeBountyHunter, hp: 2600, speed: 2.6, r: 0.5, hy: 1.0, xp: 2500, cr: [0, 0], boss: true, ranged: { dmg: 15, rate: 0.85, speed: 26, col: '#9a3aff', range: 44, keep: 12 }, drops: [] };

defQuest('bh1', { ch: 'Interlude · The Bounty', title: 'Price on Your Head', giver: 'ada', turnIn: 'ada', req: ['r5'], main: true,
  intro: ["Gunner, a message came through on every channel at once. Somebody put a bounty on you. A big one.", "The hunter who took it signs his name Kade. He says he'll be waiting in the ring at Arena Prime, and that he has never missed.", "Go deal with him before he comes to you."],
  obj: [{ kind: 'kill', t: 'sable', n: 1, text: 'Face the bounty hunter in the Arena Prime ring', zone: 'ring', planet: 'arena' }],
  outro: ["You beat Kade? And he let you walk onto his ship? Gunner, you collect the strangest friends.", "Rell's been asking for you. Something about a dead signal."], reward: { cr: 6000, xp: 20000 } });
if (QDEFS.d1 && !QDEFS.d1.req.includes('bh1')) QDEFS.d1.req.push('bh1');
// the Lab can only be bought once Sable has shown you how (anyone who already owns one keeps it)
{ const h0 = ROOMS.lab.hide; ROOMS.lab.hide = () => (h0 && h0()) || !(S.flags && S.flags.bhLab) && !roomLvl('lab'); }

// ---------- cutscenes ----------
const BH = { cut: false, fight: null };
function bhCut(lines, setup, done) {
  if (BH.cut) return; BH.cut = true; const prev = state === 'cut' ? 'play' : state; setState('cut'); $('hud').hidden = true; $('touch').hidden = true; vm.visible = false; try { exitPointer && exitPointer(); } catch (_) {}
  const ov = document.createElement('div'); ov.id = 'bhcut'; ov.style.cssText = 'position:fixed;inset:0;z-index:40;cursor:pointer';
  ov.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:11vh;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:11vh;background:#000"></div><div id="bhcap" style="position:absolute;left:8%;right:8%;bottom:13vh;text-align:center;color:#fff;font:600 clamp(15px,3.4vw,23px) var(--hud,sans-serif);line-height:1.35;text-shadow:0 2px 8px #000,0 0 2px #000"></div><div style="position:absolute;left:0;right:0;bottom:3.5vh;text-align:center;color:#aaa;font:12px var(--hud,sans-serif)">tap to continue</div>';
  const skip = document.createElement('button'); skip.className = 'pbtn'; skip.textContent = 'Skip ▸'; skip.style.cssText = 'position:fixed;right:16px;top:calc(11vh + 14px);z-index:41;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.5);color:#fff';
  document.body.append(ov, skip);
  const A = setup(); let i = -1, lt0 = 0, fin = false; const cap = ov.querySelector('#bhcap');
  const show = k => { i = k; lt0 = performance.now(); const L = lines[i]; cap.innerHTML = ''; const w = document.createElement('div'); w.style.cssText = 'color:' + (L[0] === 'You' ? '#7fd8ff' : '#c89aff') + ';font-size:.75em;letter-spacing:.12em;margin-bottom:4px'; w.textContent = L[0].toUpperCase(); const tx = document.createElement('div'); tx.textContent = L[1]; cap.append(w, tx); SFX.talk && SFX.talk(); };
  const end = () => { if (fin) return; fin = true; ov.remove(); skip.remove(); window.removeEventListener('keydown', key); (A.objs || []).forEach(o => o.parent && o.parent.remove(o)); if (A.restore) A.restore(); BH.cut = false; setState(prev); $('hud').hidden = false; vm.visible = true; if (done) done(); };
  const next = () => { if (i + 1 < lines.length) show(i + 1); else end(); };
  const key = ev => { if (['Space', 'Enter', 'KeyE'].includes(ev.code)) { ev.preventDefault(); next(); } };
  ov.addEventListener('click', next); skip.addEventListener('click', end); window.addEventListener('keydown', key);
  show(0);
  const tick = () => { if (fin) return; const L = lines[i], t = (performance.now() - lt0) / 1000; if (t > Math.max(5, L[1].length / 14)) next(); if (fin) return; A.shot(L[2], Math.min(1, t / 6), t); requestAnimationFrame(tick); };
  tick();
}
function bhActors(at) {
  const me = buildChar(() => makePlayerChar(myLook(), S.col), 'trooper'), sb = buildChar(makeBountyHunter, 'bh');
  me.position.set(at.x, 0, at.z + 7); me.rotation.y = Math.PI; sb.position.set(at.x, 0, at.z - 6); levelGroup.add(me, sb); return { me, sb };
}
function bhArenaShot(c) { return (s, k, t) => {
  const sz = c.sb.position, mz = c.me.position, look = (x, y, z) => camera.lookAt(x, y, z);
  if (s === 'wide') { const a = 0.7 + t * 0.06; camera.position.set(Math.sin(a) * 16, 6 - k, (sz.z + mz.z) / 2 + Math.cos(a) * 16); look(0, 1.4, (sz.z + mz.z) / 2); }
  if (s === 'over') { camera.position.set(mz.x + 0.9, 2.1, mz.z + 2.6); look(sz.x, 1.6, sz.z); }
  if (s === 'me') { camera.position.set(sz.x - 0.8, 2.3, sz.z - 2.4); look(mz.x, 1.5, mz.z); }
  if (s === 'close') { camera.position.set(sz.x + 0.3, 1.75, sz.z + 3.2 - k * 1.2); look(sz.x, 1.6, sz.z); }
  if (s === 'low') { camera.position.set(sz.x + 2.4, 0.5, sz.z + 3.4); look(sz.x, 1.5, sz.z); }
}; }
const BH_PRE = [['Kade', "So you're the one the Drome keeps losing ships to. Smaller than the poster.", 'close'], ['You', "Who's asking?", 'me'], ['Kade', "Kade. I collect. Somebody paid a planet's worth of credits for your head, and I always collect.", 'over'], ['You', 'You picked a public place for a murder.', 'me'], ['Kade', 'I picked a stage. Every bounty I take gets a crowd. It makes the ending cleaner.', 'wide'], ['Kade', 'Nothing personal, Captain. Try to make it interesting.', 'low']];
const BH_POST = [['Kade', "Hah... well. That's new.", 'close'], ['Kade', "Forty-one contracts, and nobody ever put me on the floor. Congratulations, Captain. Truly.", 'over'], ['You', 'So what now? You try again tomorrow?', 'me'], ['Kade', "Now I tear up the contract. A hunter who loses and doesn't keep his word is just a thug with a gun.", 'wide'], ['Kade', "I'll be around. Someone like you is going to need someone like me sooner or later.", 'close'], ['Kade', "Come aboard my ship, the Glass Wake. I'll show you how I really pay for all this.", 'low']];
const BH_SHIP = [['Kade', "That's her, the Glass Wake. She used to fly for the Drome, until I borrowed her. Permanently.", 'outside'], ['Kade', 'New paint, new engines, and a little crystal where their red sun used to be.', 'outside2'], ['Kade', "Welcome aboard the Glass Wake. Don't touch anything that glows.", 'room'], ['Kade', 'Bounties pay late. Chemistry pays every day. Crystal, a few cave mushrooms, and the right heat.', 'bench'], ['You', 'You cook?', 'me'], ['Kade', "I cook the cleanest Blackout in four systems. Watch the temperature. Too hot and it's poison, too cold and it's soap.", 'bench'], ['Kade', "There. Now you know. Put a Lab on your ship and nobody at the shipyard will ask questions.", 'close'], ['Kade', 'One more thing, Captain. The Marshals will notice. They always notice. Try not to get caught.', 'room']];
function bhShipScene() {
  bhCut(BH_SHIP, () => {
    const R = new THREE.Group(), Y = -400; R.position.set(0, Y, 0); levelGroup.add(R);
    const wall = toon('#1c1824'); wall.side = THREE.BackSide; part(R, B(12, 4.2, 9), wall, 0, 2.1, 0);
    part(R, B(12, 0.05, 9), toon('#2a2632'), 0, 0.02, 0);
    for (const x of [-4, 0, 4]) part(R, B(0.2, 0.08, 9), glow('#9a3aff'), x, 4.1, 0);
    part(R, B(4.2, 0.9, 1), toon('#3a3e48'), 0, 0.45, -2.8); part(R, B(4.3, 0.06, 1.1), toon('#9aa1aa'), 0, 0.92, -2.8);
    const fl = []; for (let k = 0; k < 6; k++) { const f = part(R, Cy(0.08, 0.12, 0.34, 8), glow(['#6a4aa8', '#9a3aff', '#4fd2ff'][k % 3]), -1.6 + k * 0.62, 1.12, -2.8); fl.push(f); }
    part(R, Cy(0.5, 0.6, 1.6, 10), toon('#4a4e58'), 3.6, 0.8, -3); part(R, Cy(0.35, 0.35, 0.4, 10), glow('#ff6a2a'), 3.6, 1.7, -3);
    for (let k = 0; k < 7; k++) part(R, new THREE.OctahedronGeometry(0.25 + Math.random() * 0.3, 0), glow('#57dcff'), -5.4 + Math.random() * 1.2, 0.3 + Math.random() * 0.8, -3.8 + k * 1.1, Math.random(), Math.random());
    part(R, B(3, 1.6, 0.05), glow('#1a2a44'), -2, 2.6, 4.45);
    for (const z of [-4.4, 4.4]) for (const x of [-5.5, -2.75, 0, 2.75, 5.5]) part(R, B(0.3, 4.2, 0.12), toon('#2a2630'), x, 2.1, z);
    for (const y of [0.3, 3.9]) for (const z of [-4.4, 4.4]) part(R, B(12, 0.12, 0.14), toon('#5a1a26'), 0, y, z);
    part(R, new THREE.CircleGeometry(1.1, 20), toon('#7a1a22'), 2.4, 2.6, -4.42); part(R, B(2.6, 0.32, 0.03), toon('#0c0a10'), 2.4, 2.6, -4.4, 0, 0, 0.6);
    for (let k = 0; k < 5; k++) part(R, new THREE.OctahedronGeometry(0.2 + Math.random() * 0.25, 0), glow('#57dcff'), 2.4 + (Math.random() - 0.5) * 1.6, 2.6 + (Math.random() - 0.5) * 1.6, -4.3);
    part(R, B(0.9, 2, 0.6), toon('#3a363c'), 5.4, 1, 2.6); part(R, B(0.7, 0.12, 0.05), glow('#ff2a3a'), 5.4, 1.7, 2.29);
    const me = buildChar(() => makePlayerChar(myLook(), S.col), 'trooper'), sb = buildChar(makeBountyHunter, 'bh'); me.position.set(-0.9, 0, 0.6); me.rotation.y = Math.PI * 0.85; sb.position.set(1.4, 0, -1.7); sb.rotation.y = -0.5; R.add(me, sb);
    // the Glass Wake outside: a stolen Drome cutter, painted black, crystal grown over the red sun
    const O = new THREE.Group(); O.position.set(300, 0, 0); R.add(O);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 16, 10), new THREE.MeshBasicMaterial({ color: '#04030a', side: THREE.BackSide, fog: false })); O.add(sky);
    const sp = []; for (let k = 0; k < 400; k++) { const v = V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(85); sp.push(v.x, v.y, v.z); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); O.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 0.5, fog: false })));
    const hk = makeHulk('drome'); hk.traverse(m => { if (!m.material) return; m.material = m.material.clone(); const c = m.material.color; if (!c) return; const hsl = {}; c.getHSL(hsl);
      if (hsl.s > 0.4 && (hsl.h < 0.06 || hsl.h > 0.94)) c.set('#9a3aff'); else c.multiplyScalar(0.7); });
    const bb = new THREE.Box3().setFromObject(hk), hs = bb.getSize(V(0, 0, 0)), hc = bb.getCenter(V(0, 0, 0)); hk.position.sub(hc); O.add(hk);
    for (let k = 0; k < 9; k++) part(O, new THREE.OctahedronGeometry(0.6 + Math.random() * 1.2, 0), glow(k % 2 ? '#57dcff' : '#eefaff'), (Math.random() - 0.5) * hs.x * 0.8, hs.y * 0.35 + Math.random() * 1.5, (Math.random() - 0.5) * hs.z * 0.7, Math.random(), Math.random(), Math.random());
    O.add(new THREE.AmbientLight('#6a5a8a', 0.8)); const sun = new THREE.DirectionalLight('#d8c8ff', 1.6); sun.position.set(30, 40, 20); O.add(sun); const ext = Math.max(hs.x, hs.z);
    const lamp = new THREE.PointLight('#b07aff', 1.4, 14); lamp.position.set(0, 3.4, -1); R.add(lamp);
    const far0 = camera.far; return { objs: [R], restore: () => { camera.far = far0; }, shot: (s, k, t) => {
      fl.forEach((f, n) => f.scale.y = 1 + Math.sin(t * 3 + n) * 0.15);
      if (s === 'outside' || s === 'outside2') { const a = (s === 'outside' ? 0.6 : 2.4) + t * 0.05, d = ext * 1.15; camera.position.set(300 + Math.sin(a) * d, Y + ext * 0.35, Math.cos(a) * d); camera.lookAt(300, Y, 0); return; }
      if (s === 'room') camera.position.set(4.2 - k, Y + 2.6, 3.8); if (s === 'bench') camera.position.set(1.8, Y + 1.7, -0.6 + k * 0.4); if (s === 'me') camera.position.set(2.9, Y + 2.1, -3.6); if (s === 'close') camera.position.set(0.4, Y + 1.8, 0.8 - k * 0.6);
      if (s === 'me') camera.lookAt(-0.9, Y + 1.5, 0.6); else if (s === 'bench') camera.lookAt(0, Y + 1, -2.8); else camera.lookAt(1.4, Y + 1.6, -1.7); } };
  }, () => { S.flags.bhLab = 1; if (S.qst.bh1 && S.qst.bh1.st !== 'done') { S.qst.bh1.st = 'ready'; completeQuest('bh1'); } toast('LAB UNLOCKED', 'Build one from the room menu on your ship', 5); log('Kade taught you to cook. You can now build a Lab on your ship.', 'loot'); markDirty(); });
}
function bhPost() { const at = { x: 0, z: 0 }; let c; bhCut(BH_POST, () => { c = bhActors(at); return { objs: [c.me, c.sb], shot: bhArenaShot(c) }; }, bhShipScene); }

// ---------- the fight ----------
function bhGridMesh() {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: '#ff2030', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let z = -21; z <= 21; z += 1.5) { const L = 2 * Math.sqrt(22 * 22 - z * z); const a = new THREE.Mesh(new THREE.BoxGeometry(L, 0.05, 0.07), m); a.position.set(0, 0.12, z); g.add(a); const b = a.clone(); b.rotation.y = Math.PI / 2; b.position.set(z, 0.12, 0); g.add(b); }
  g.userData.m = m; g.visible = false; return g;
}
function bhStartFight() {
  const lv = Math.max(S.lvl, 18), e = makeEnemy({ type: 'sable', zone: 'ring', lv: [lv, lv], at: [0, -10], once: true }); e.max = e.hp = ENEMY.sable.hp * (1 + 0.1 * (lv - 1)); e.plateHp = -1; updatePlate(e); e.aggro = true;
  const grid = bhGridMesh(); levelGroup.add(grid);
  const disc = part(levelGroup, Cy(0.35, 0.35, 0.12, 10), glow('#ff2030'), 0, -9, 0); disc.visible = false;
  BH.fight = { e, grid, disc, tp: 3, dev: 6, ph: null, pt: 0, acc: 0, warned: false };
  toast('KADE', 'The Glass Hunter · he never misses', 3); SFX.quest && SFX.quest();
}
function bhEndFight() { const F = BH.fight; if (!F) return; BH.fight = null; F.grid.parent && F.grid.parent.remove(F.grid); F.disc.parent && F.disc.parent.remove(F.disc); if (!F.e.dead) { F.e.dead = 3; F.e.gone = true; scene.remove(F.e.obj); } const k = enemies.indexOf(F.e); if (k >= 0) enemies.splice(k, 1); }
function bhBlink(e) {
  const o = e.obj, from = o.position.clone().add(V(0, 1, 0)); let x, z;
  for (let n = 0; n < 12; n++) { const a = Math.random() * 6.283, r = 8 + Math.random() * 11; x = Math.sin(a) * r; z = Math.cos(a) * r; if (Math.hypot(x - player.pos.x, z - player.pos.z) > 8) break; }
  burst(from, '#9a3aff', 14, 5); burst(from, '#0a0614', 10, 3); o.position.set(x, floorAt(x, z), z); burst(o.position.clone().add(V(0, 1, 0)), '#eefaff', 14, 5); SFX.zap && SFX.zap();
}
function bhStep(dt) {
  if (!LEVEL || LEVEL.id !== 'arena') { BH.fight = null; return; }
  const q = S.qst.bh1, F = BH.fight;
  if (!F) {
    if (BH.cut || !player.alive || dlgOpen || state !== 'play') return;
    if (q && q.st === 'ready' && !S.flags.bhLab) return bhPost();
    if (q && q.st === 'active' && Math.hypot(player.pos.x, player.pos.z) < 19) {
      if (S.flags.bhMet) { bhStartFight(); toast('KADE', '"Round two, Captain."', 3); return; }
      S.flags.bhMet = 1; markDirty(); let c; bhCut(BH_PRE, () => { c = bhActors({ x: 0, z: 0 }); return { objs: [c.me, c.sb], shot: bhArenaShot(c) }; }, () => { player.pos.set(0, floorAt(0, 8), 8); player.yaw = 0; bhStartFight(); });
    }
    return;
  }
  const e = F.e;
  if (e.dead) { bhEndFight(); setTimeout(bhPost, 3500); return; }
  if (!player.alive) { bhEndFight(); return; }
  if (state !== 'play') return;
  e.aggro = true;
  if ((F.tp -= dt) <= 0) { F.tp = 3 + Math.random() * 2.2 * (e.hp / e.max); bhBlink(e); }
  // the floor laser device: throw, warn, fire
  if (!F.ph && (F.dev -= dt) <= 0) { F.ph = 'throw'; F.pt = 0; F.from = e.obj.position.clone().add(V(0, 1.4, 0)); F.disc.visible = true; }
  if (F.ph) { F.pt += dt; const m = F.grid.userData.m;
    if (F.ph === 'throw') { const k = Math.min(1, F.pt / 0.7); F.disc.position.lerpVectors(F.from, V(0, 0.1, 0), k).y += Math.sin(k * Math.PI) * 3; F.disc.rotation.y += dt * 12; if (k >= 1) { F.ph = 'warn'; F.pt = 0; F.grid.visible = true; if (!F.warned) { F.warned = true; toast('LASER GRID', 'Get off the floor! Jetpack up', 2.5); } } }
    else if (F.ph === 'warn') { m.opacity = 0.12 + 0.25 * (Math.sin(F.pt * 22) > 0 ? 1 : 0); if (F.pt > 1.5) { F.ph = 'fire'; F.pt = 0; SFX.laser && SFX.laser(); } }
    else if (F.ph === 'fire') { m.opacity = 0.75 + Math.sin(F.pt * 40) * 0.2; F.grid.position.x = Math.sin(F.pt * 3) * 0.75; F.grid.position.z = Math.cos(F.pt * 3) * 0.75;
      const grounded = player.pos.y - floorAt(player.pos.x, player.pos.z) < 0.45;
      if (grounded && Math.hypot(player.pos.x, player.pos.z) < 22) { F.acc += dt; if (F.acc >= 0.25) { F.acc = 0; hurt(10 + e.lv * 0.7); burst(player.pos.clone().add(V(0, 0.2, 0)), '#ff2030', 6, 3); } }
      if (F.pt > 2.4) { F.ph = null; F.grid.visible = false; F.disc.visible = false; m.opacity = 0; F.dev = 8 + Math.random() * 4; } }
  }
}
{ const _b = LEVELS.arena.build; LEVELS.arena.build = function () { const r = _b.apply(this, arguments); BH.fight = null; let last = null; levelAnims.push(t => { const dt = last == null ? 0 : Math.min(0.1, t - last); last = t; try { bhStep(dt); } catch (err) { console.warn('sable', err); } }); return r; }; }
