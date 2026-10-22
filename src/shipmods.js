// =================== SHIP MODS: paint and parts for the Setting Sun, some scavenged in space and on planets ===================
const SHIP_PAINTS = [['Gunmetal', '#9aa1aa', 1], ['Arctic', '#e8eef2', 1], ['Olive Drab', '#6f7a3e', 1], ['Midnight', '#2a3756', 1], ['Crimson', '#8a1e1e', 0], ['Sunset Gold', '#c9a43a', 0], ['Void Black', '#1e1c22', 0], ['Nebula Violet', '#5a2a8a', 0], ['Coral', '#e86a5a', 0], ['Toxic Green', '#5aff6a', 0]];
const SHIP_ACCENTS = [['Team color', null, 1], ['Orange', '#ff8a2a', 1], ['Ice', '#4fd2ff', 1], ['Hazard', '#ffd36a', 0], ['Blood', '#ff2a3a', 0], ['Pink', '#ff6aa8', 0], ['Chrome', '#e8e4dc', 0]];
const SHIP_EXHAUST = [['Sunfire orange', '#ff9a3c', 1], ['Plasma blue', '#4fd2ff', 1], ['Toxic green', '#7fff6a', 1], ['Hot pink', '#ff6aa8', 1], ['Royal violet', '#c86aff', 1], ['White hot', '#f4f4ff', 1], ['Blood red', '#ff2a3a', 1], ['Gold', '#ffd36a', 1], ['Rainbow', 'rainbow', 1]];
const SHIP_PARTS = {
  wing: [['Standard wings', 1, {}], ['Swept wings', 1, { sp: 0.04 }], ['Delta wing', 0, { sp: 0.06 }], ['Biplane wings', 0, { hull: 0.08 }], ['Blade wings', 0, { sp: 0.05, laser: 0.05 }], ['Drome talons', 0, { laser: 0.1 }]],
  eng: [['Twin thrusters', 1, {}], ['Quad thrusters', 0, { sp: 0.08 }], ['Ion drive', 0, { sp: 0.12 }], ['Mega thruster', 0, { sp: 0.18, hull: -0.05 }]],
  nose: [['Cone nose', 1, {}], ['Ram spike', 0, { hull: 0.08 }], ['Hawk beak', 1, { sp: 0.02 }], ['Sensor dome', 0, { laser: 0.06 }]],
  fin: [['Twin fins', 1, {}], ['Single fin', 1, {}], ['Shark fin', 0, { sp: 0.03 }], ['No fins', 1, {}]],
  pod: [['No pods', 1, {}], ['Missile pods', 0, { laser: 0.12 }], ['Antenna array', 1, {}], ['Armor plating', 0, { hull: 0.15, sp: -0.04 }], ['Trophy spikes', 0, { hull: 0.05 }]]
};
const SM_SLOTS = [['wing', 'Wings'], ['eng', 'Engines'], ['nose', 'Nose'], ['fin', 'Fins'], ['pod', 'Extras']];
const smS = () => { S.sm = S.sm || { p: 0, a: 0, x: 0, wing: 0, eng: 0, nose: 0, fin: 0, pod: 0, own: {} }; S.sm.own = S.sm.own || {}; return S.sm; };
const smOwn = (k, i) => { const T = k === 'p' ? SHIP_PAINTS : k === 'a' ? SHIP_ACCENTS : k === 'x' ? SHIP_EXHAUST : SHIP_PARTS[k]; return !!(T[i] && (T[i][T === SHIP_PAINTS || T === SHIP_ACCENTS || T === SHIP_EXHAUST ? 2 : 1] || smS().own[k + i])); };
function shipMod(stat) { const M = smS(); let m = 1; for (const [k] of SM_SLOTS) { const P = SHIP_PARTS[k][M[k]]; if (P && P[2][stat]) m += P[2][stat]; } if (stat === 'laser' && typeof romPerk === 'function' && romPerk('laser')) m += 0.15; return m; }
const smCode = M => [M.p, M.a, M.wing, M.eng, M.nose, M.fin, M.pod].join('.');
const smParse = c => { const p = String(c || '').split('.').map(Number); return { p: p[0] || 0, a: p[1] || 0, wing: p[2] || 0, eng: p[3] || 0, nose: p[4] || 0, fin: p[5] || 0, pod: p[6] || 0 }; };
makeStarship = function (col, cfgIn) {
  const M = cfgIn || smS(), g = new THREE.Group(), hull = (SHIP_PAINTS[M.p] || SHIP_PAINTS[0])[1], dk = '#3a3d44', acc = (SHIP_ACCENTS[M.a] || SHIP_ACCENTS[0])[1] || col || C.gunAcc, eg = M.eng === 2 ? '#4fd2ff' : '#ff9a3c';
  part(g, B(1.6, 1.0, 6.0), hull, 0, 0, 0); part(g, B(1.2, 0.8, 1.6), hull, 0, 0, -3.6);
  part(g, B(1.0, 0.5, 1.4), glow('#8fd0ff'), 0, 0.6, -2.6, 0.25); part(g, B(1.7, 0.16, 4.2), acc, 0, 0.56, 0.4);
  // nose
  if (M.nose === 1) { part(g, new THREE.ConeGeometry(0.35, 2.6, 4), '#cfd3d8', 0, 0, -5.6, -Math.PI / 2); part(g, B(1.3, 0.9, 0.4), dk, 0, 0, -4.4); }
  else if (M.nose === 2) { part(g, new THREE.ConeGeometry(0.7, 1.6, 4), hull, 0, -0.1, -5.1, -Math.PI / 2 - 0.15, Math.PI / 4); part(g, B(0.9, 0.1, 0.8), acc, 0, 0.3, -4.6); }
  else if (M.nose === 3) { E(g, glow('#8fd0ff'), 0, 0.1, -4.6, 0.6, 0.5, 0.7); part(g, Cy(0.03, 0.03, 1, 4), dk, 0, 0.6, -4.6); }
  else part(g, new THREE.ConeGeometry(0.6, 1.4, 6), hull, 0, 0, -5.1, -Math.PI / 2);
  for (const s of [-1, 1]) {
    // wings
    if (M.wing === 1) { part(g, B(4.0, 0.18, 1.8), hull, 2.4 * s, -0.1, 1.4, 0, 0.45 * s, -0.08 * s); part(g, B(1.0, 0.2, 1.9), acc, 4.0 * s, -0.25, 2.5, 0, 0.45 * s, -0.08 * s); }
    else if (M.wing === 2) { const w = new THREE.Shape(); w.moveTo(0, -2); w.lineTo(4.6 * s, 2.4); w.lineTo(0, 2.4); w.lineTo(0, -2); const geo = new THREE.ExtrudeGeometry(w, { depth: 0.18, bevelEnabled: false }); geo.rotateX(Math.PI / 2); part(g, geo, hull, 0.6 * s, 0, 0.4); part(g, B(0.9, 0.2, 0.5), acc, 3.6 * s, -0.05, 2.4); }
    else if (M.wing === 3) { for (const y of [-0.45, 0.65]) part(g, B(3.8, 0.14, 1.8), hull, 2.4 * s, y, 0.6); part(g, B(0.1, 1.1, 0.1), dk, 3.6 * s, 0.1, 0.6); part(g, B(0.1, 1.1, 0.1), dk, 1.6 * s, 0.1, 0.6); part(g, B(0.9, 0.16, 1.9), acc, 4.2 * s, 0.65, 0.6); }
    else if (M.wing === 4) { part(g, B(5.0, 0.1, 1.0), hull, 3.0 * s, -0.05, 0.6, 0, -0.25 * s, -0.12 * s); part(g, B(5.0, 0.08, 0.2), glow(acc), 3.0 * s, -0.02, 0.15, 0, -0.25 * s, -0.12 * s); }
    else if (M.wing === 5) { part(g, B(3.8, 0.2, 1.6), '#1e1c22', 2.3 * s, -0.1, 0.8, 0, 0, -0.2 * s); for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.18, 1.4, 4), '#b3262c', (3.4 + k * 0.4) * s, -0.4, (-0.2 + k * 0.7), Math.PI / 2 + 0.3, 0, 0); }
    else { part(g, B(4.2, 0.18, 2.2), hull, 2.6 * s, -0.1, 0.8, 0, 0, -0.08 * s); part(g, B(1.0, 0.2, 2.3), acc, 4.3 * s, -0.25, 0.8, 0, 0, -0.08 * s); }
    // engines
    if (M.eng === 1) for (const y of [-0.55, 0.25]) { part(g, Cy(0.38, 0.45, 2.4, 8), dk, 1.3 * s, y, 2.6, Math.PI / 2); part(g, Cy(0.32, 0.32, 0.1, 8), glow(eg), 1.3 * s, y, 3.82, Math.PI / 2); }
    else if (M.eng === 3) { if (s > 0) { part(g, Cy(0.95, 1.1, 3.0, 10), dk, 0, -0.1, 2.9, Math.PI / 2); part(g, Cy(0.85, 0.85, 0.1, 10), glow(eg), 0, -0.1, 4.42, Math.PI / 2); } }
    else { part(g, Cy(0.55, 0.65, 2.6, 8), dk, 1.4 * s, -0.2, 2.6, Math.PI / 2); part(g, Cy(0.48, 0.48, 0.1, 8), glow(eg), 1.4 * s, -0.2, 3.92, Math.PI / 2); if (M.eng === 2) part(g, new THREE.TorusGeometry(0.55, 0.06, 4, 12), glow('#4fd2ff'), 1.4 * s, -0.2, 3.4); }
    // fins
    if (M.fin === 0) part(g, B(0.16, 1.4, 1.4), hull, 0.7 * s, 0.9, 2.2, 0, 0, 0.35 * s);
    else if (M.fin === 1 && s > 0) part(g, B(0.16, 1.8, 1.8), hull, 0, 1.2, 2.3);
    else if (M.fin === 2 && s > 0) { const f = part(g, new THREE.ConeGeometry(0.9, 2.2, 3), hull, 0, 1.4, 1.8, 0.5, 0, 0); f.scale.z = 0.15; }
    // extras
    if (M.pod === 1) { part(g, Cy(0.22, 0.22, 1.8, 6), dk, 2.8 * s, -0.55, 0.4, Math.PI / 2); for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.08, 0.3, 5), '#c8402f', (2.65 + k * 0.15) * s, -0.55, -0.6, -Math.PI / 2); }
    else if (M.pod === 2 && s > 0) { for (let k = 0; k < 3; k++) part(g, Cy(0.02, 0.02, 1.2 + k * 0.4, 4), dk, -0.3 + k * 0.3, 1.0 + k * 0.2, 1.0, 0.3); part(g, new THREE.SphereGeometry(0.1, 6, 4), glow('#6fdc5a'), 0.3, 1.9, 1.3); }
    else if (M.pod === 3) { part(g, B(0.3, 1.2, 5.0), dk, 0.95 * s, 0, -0.2); for (let k = 0; k < 4; k++) part(g, B(0.32, 0.1, 0.1), acc, 0.96 * s, 0.3, -2 + k * 1.2); }
    else if (M.pod === 4) for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.12, 0.7, 4), '#b3262c', 0.85 * s, 0.4, -1.6 + k * 1.3, 0, 0, -Math.PI / 2 * s);
  }
  g.userData.engines = g.children.filter(m => m.material === glow(eg));
  return g;
};
// ---------- the customizer ----------
function openShipMods() {
  const M = smS(); openDlg('Ship customizer', 'The Setting Sun');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; let tab = 'p';
  const pv = () => setPreview(() => { const g = makeStarship(S.col, Object.assign({}, M)); g.rotation.y = Math.PI * 0.8; return g; }, 'The Setting Sun');
  const statTxt = st => Object.entries(st).map(([k, v]) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}% ${k === 'sp' ? 'speed' : k}`).join(', ');
  const render = () => { rows.textContent = '';
    const total = ['sp', 'hull', 'laser'].map(k => `${k === 'sp' ? 'speed' : k} ${Math.round((shipMod(k) - 1) * 100) >= 0 ? '+' : ''}${Math.round((shipMod(k) - 1) * 100)}%`).join(' · ');
    $('dlgLine').textContent = `Locked parts and paints are scavenged: fly through salvage in space, or find salvage crates on planets. Bonuses: ${total}.`;
    const T = tab === 'p' ? SHIP_PAINTS : tab === 'a' ? SHIP_ACCENTS : tab === 'x' ? SHIP_EXHAUST : SHIP_PARTS[tab];
    T.forEach((it, i) => { const own = smOwn(tab, i), on = M[tab] === i, r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = tab === 'x' ? (it[1] === 'rainbow' ? 'linear-gradient(90deg,#ff2a3a,#ffd36a,#7fff6a,#4fd2ff,#c86aff)' : it[1]) : (tab === 'p' || tab === 'a') ? (it[1] || S.col) : '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = it[0] + (tab !== 'p' && tab !== 'a' && tab !== 'x' && Object.keys(it[2]).length ? ` · ${statTxt(it[2])}` : ''); const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; mt.textContent = own ? (on ? 'Fitted' : 'Owned') : 'Scavenge';
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = on ? '✓' : 'Fit'; b.disabled = !own || on;
      b.addEventListener('click', () => { M[tab] = i; markDirty(); sendPresence(true); SFX.item(); render(); pv(); if (LEVEL.fly && fly && fly.ship) { const old = fly.ship, nw = makeStarship(S.col); nw.position.copy(old.position); nw.quaternion.copy(old.quaternion); levelGroup.remove(old); levelGroup.add(nw); fly.ship = nw; } });
      r.style.cursor = 'pointer'; r.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') return; setPreview(() => { const g = makeStarship(S.col, Object.assign({}, M, { [tab]: i })); g.rotation.y = Math.PI * 0.8; return g; }, own ? it[0] : it[0] + ' (not found yet)'); });
      r.append(dot, nm, mt, b); rows.appendChild(r); }); };
  $('dlgActs').before(rows);
  acts([['Paint', () => { tab = 'p'; render(); }, true], ['Accent', () => { tab = 'a'; render(); }], ['Exhaust', () => { tab = 'x'; render(); }], ...SM_SLOTS.map(([k, n]) => [n, () => { tab = k; render(); }]), ['Done', closeDlg]]);
  render(); showPreviewIn(rows); pv();
}
// ---------- scavenging ----------
function scavenge(where) {
  const M = smS(), locked = [];
  SHIP_PAINTS.forEach((p, i) => { if (!smOwn('p', i)) locked.push(['p', i, p[0] + ' paint']); }); SHIP_ACCENTS.forEach((p, i) => { if (!smOwn('a', i)) locked.push(['a', i, p[0] + ' accent']); });
  for (const [k] of SM_SLOTS) SHIP_PARTS[k].forEach((p, i) => { if (!smOwn(k, i)) locked.push([k, i, p[0]]); });
  if (typeof FURN !== 'undefined') for (const id in FURN) if (!furnOwned(id)) locked.push(['f', id, FURN[id][0]]);
  if (!locked.length || Math.random() < 0.35) { const cr = 150 + randi(0, 250); S.cr += cr; S.inv.ore = (S.inv.ore || 0) + 2; S.inv.scrap = (S.inv.scrap || 0) + 3; toast('SALVAGE', `+${cr} cr, ore and scrap`, 2.5); SFX.coin(); markDirty(); return; }
  const [k, i, name] = locked[randi(0, locked.length - 1)];
  if (k === 'f') { S.furn = S.furn || {}; S.furn[i] = 1; markDirty(); toast('FURNITURE FOUND!', `${name} · place it from Decorate on your ship`, 4); SFX.level(); log(`Found ${name} ${where}. Place as many as you like from Decorate.`, 'loot'); return; }
  M.own[k + i] = 1; markDirty();
  toast('SCAVENGED!', `${name} for your ship · fit it at the Ship customizer`, 4); SFX.level(); log(`Scavenged ${where}: ${name}. Fit it from the Ship customizer on your ship.`, 'loot');
}
function makeSalvageCrate(big) {
  const g = new THREE.Group();
  const s = big ? 3 : 1;

  const hullGrey = '#5d636c';
  const cornerDk = '#383d44';
  const goldBand = '#d4a838';
  const lockDark = '#1d1f24';
  const panelGlow = glow('#4fd2ff');

  // 1. Main Crate Body (Flush on floor: y = 0.0 to 0.70 * s)
  part(g, B(1.0 * s, 0.7 * s, 0.7 * s), hullGrey, 0, 0.35 * s, 0);

  // Bottom skid runners (anchors crate cleanly at y = 0.0)
  for (const sz of [-1, 1]) {
    part(g, B(1.04 * s, 0.05 * s, 0.12 * s), lockDark, 0, 0.025 * s, sz * 0.28 * s);
  }

  // 2. Reinforced Corner Brackets (Stepped outward to eliminate co-planar tearing)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      part(
        g,
        B(0.10 * s, 0.71 * s, 0.10 * s),
        cornerDk,
        sx * 0.485 * s,
        0.355 * s,
        sz * 0.335 * s
      );
    }
  }

  // 3. Reinforced Retention Bands (Stepped out in X and Z: 1.04 * s x 0.74 * s)
  for (const y of [0.18, 0.52]) {
    part(g, B(1.04 * s, 0.06 * s, 0.74 * s), goldBand, 0, y * s, 0);

    // Lateral tension clamps on both short ends
    for (const sx of [-1, 1]) {
      part(g, B(0.04 * s, 0.08 * s, 0.14 * s), lockDark, sx * 0.525 * s, y * s, 0);
    }
  }

  // 4. Stepped Front Terminal & Cargo Lock Status
  // Recessed backplate mounted flush to front face (z = 0.35 * s)
  part(g, B(0.36 * s, 0.30 * s, 0.03 * s), lockDark, 0, 0.38 * s, 0.36 * s);

  // Glowing status display stepped cleanly forward (z = 0.38 * s)
  part(g, B(0.28 * s, 0.22 * s, 0.02 * s), panelGlow, 0, 0.38 * s, 0.38 * s);

  // Top magnetic lift latch
  part(g, B(0.24 * s, 0.04 * s, 0.24 * s), lockDark, 0, 0.72 * s, 0);
  part(g, new THREE.TorusGeometry(0.06 * s, 0.015 * s, 4, 10), goldBand, 0, 0.75 * s, 0, Math.PI / 2);

  // 5. Vertical Holo-Beacon Beam & Pulse Core
  const beaconCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.04 * s, 0),
    panelGlow
  );
  beaconCore.position.set(0, 0.74 * s, 0);
  g.add(beaconCore);

  const beamGeom = new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 6 * s, 8, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: '#4fd2ff',
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const beam = new THREE.Mesh(beamGeom, beamMat);
  beam.position.y = 3.7 * s;
  g.add(beam);

  // 6. Beacon Rotation & Ambient Holo-Pulse Loop
  g.userData.anim = (t) => {
    beam.rotation.y = t * 0.8;
    beamMat.opacity = 0.18 + Math.sin(t * 3.5) * 0.06;
    beaconCore.position.y = 0.74 * s + Math.sin(t * 3.0) * (0.015 * s);
  };

  g.userData.anim(0);
  return g;
}
// planets: a couple of salvage crates hidden in the wilds every visit
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o);
  if (LEVEL.terrain && !LEVEL.fly && !['ship', 'zeltac', 'zfloor', 'swift', 'arena'].includes(id)) {
    const wild = ZONES.filter(z => !z.safe); for (let i = 0; i < 3 && wild.length; i++) { const zn = wild[randi(0, wild.length - 1)], p = randomIn(zn, 0.8), c = makeSalvageCrate(false); c.position.set(p.x, groundH(p.x, p.z), p.z); levelGroup.add(c);
      levelAnims.push(t => { if (!c.parent) return; c.rotation.y = t * 0.6; if (Math.hypot(player.pos.x - c.position.x, player.pos.z - c.position.z) < 1.8 && player.alive) { levelGroup.remove(c); burst(c.position.clone().add(V(0, 0.6, 0)), '#4fd2ff', 16, 4); scavenge('on ' + LEVEL.name); } }); } }
  if (id === 'space') { for (let i = 0; i < 10; i++) { const P = Object.values(SPACE_BODIES)[i % Object.keys(SPACE_BODIES).length], a = Math.random() * 6.28, d = P.r + 80 + Math.random() * 260, c = makeSalvageCrate(true); c.position.copy(P.pos).add(V(Math.cos(a) * d, (Math.random() - 0.5) * 80, Math.sin(a) * d)); levelGroup.add(c);
      levelAnims.push(t => { if (!c.parent) return; c.rotation.y = t * 0.5; c.rotation.x = t * 0.3; if (player.pos.distanceTo(c.position) < 14) { levelGroup.remove(c); burst(c.position.clone(), '#4fd2ff', 30, 20); scavenge('drifting in space'); } }); } }
  return r; }; }
// customizer on the ship bridge and at the Zeltac shipwright
{ const ob = LEVELS.ship.build; LEVELS.ship.build = function () { ob.call(this); if (typeof bridgeConsole === 'function') { bridgeConsole(5, -7, 0, '#ff8a2a', 1.3, 0.95); bridgeConsole(3.7, -7.6, -0.35, '#4fd2ff', 0.9, 0.8); } solid(5, -7, 0.7); box(3.7, -7.6, 0.5, 0.45); INTERACTS.push({ x: 5, z: -6.4, r: 1.6, label: 'Shipyard: buy and tune ships', fn: openShipMods }); }; }
{ const z = (LEVELS.zeltac.npcs || []).find(n => n.id === 'brakka'); if (z) z.custom = [...(z.custom || []), ['Shipyard: buy and tune ships', () => openShipMods()]]; }
