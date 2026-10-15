// =================== FISHING 3: the catch card (type, weight, value) and alien fish that look alien ===================
// ---- new species: alien worlds get fish that are clearly not from Earth ----
Object.assign(ITEMS, {
  hivefin: { name: 'Hive Skimmer', v: 70, col: '#7fff6a', fish: true, alien: 'bug' },
  tripleye: { name: 'Three-Eyed Gawker', v: 165, col: '#c86aff', fish: true, alien: 'tentacle' },
  shardray: { name: 'Shard Ray', v: 120, col: '#9fe8ff', fish: true, alien: 'spiky' },
  lanternjaw: { name: 'Lanternjaw', v: 150, col: '#2a3a4a', fish: true, alien: 'angler' },
  tentafish: { name: 'Tentafish', v: 95, col: '#ff6aa8', fish: true, alien: 'tentacle' },
  gearfish: { name: 'Gearfish', v: 90, col: '#b8bcc4', fish: true, alien: 'gear' },
  voidgulper: { name: 'Void Gulper', v: 420, col: '#3a1a5a', fish: true, alien: 'angler' },
  spinefish: { name: 'Violet Spinefish', v: 140, col: '#c86aff', fish: true, alien: 'spiky' },
  jellopod: { name: 'Jellopod', v: 210, col: '#4fffe0', fish: true, alien: 'jelly' },
  starjelly: { name: 'Star Jelly', v: 300, col: '#ffd36a', fish: true, alien: 'jelly' }
});
FISH_TABLES.oasis.push(['hivefin', 26, 0.5], ['tripleye', 7, 0.74]);
FISH_TABLES.frost.push(['shardray', 18, 0.6]); FISH_TABLES.icehole.push(['shardray', 16, 0.6]);
if (FISH_TABLES.sea) FISH_TABLES.sea.push(['lanternjaw', 12, 0.66], ['tentafish', 22, 0.5], ['starjelly', 4, 0.86]);
if (FISH_TABLES.canal) FISH_TABLES.canal.push(['gearfish', 30, 0.5]);
FISH_TABLES.zlake = [['spinefish', 40, 0.5], ['jellopod', 24, 0.66], ['tripleye', 14, 0.72], ['voidgulper', 5, 0.9]];
// Zarlich's Glowing Lake holds water now, so it gets a fishing spot
{ const _bf = buildFishSpots; buildFishSpots = function (id) { const r = _bf(id); if (id === 'zarlich' && Z.lake) { for (const a of [0.6, 3.4]) { const [x, z] = shoreSpot(Z.lake.x, Z.lake.z, a, 9); fishSpot('Glowing Lake', 'zlake', x, z, Z.lake.x, Z.lake.z); } } return r; }; }
const FISH_WATER = { lake: 'Freshwater · Earth', pond: 'Freshwater · Earth', river: 'Freshwater · Earth', sea: 'Saltwater · Ocean World', oasis: 'Alien · Mezar', frost: 'Alien · Capitone', icehole: 'Alien · Capitone ice', canal: 'Machine · Robot City', zlake: 'Alien · Zarlich' };

// ---- alien models ----
{ const _mf = makeFishModel; makeFishModel = function (id) {
  const it = ITEMS[id]; if (!it || !it.alien) return _mf(id);
  const g = new THREE.Group(), col = it.col, body = toon(col, 'skin'), gl = (h) => glow(h), dark = toon('#15110e');
  const eye = (x, y, z, r, iris) => { part(g, new THREE.SphereGeometry(r, 10, 8), gl('#f4f8ff'), x, y, z); part(g, new THREE.SphereGeometry(r * 0.55, 8, 6), gl(iris || '#ff3b2a'), x + r * 0.45, y, z); part(g, new THREE.SphereGeometry(r * 0.25, 6, 4), dark, x + r * 0.8, y, z); };
  const tentacles = (n, y, len, c) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, t = new THREE.Group(); t.position.set(-0.02 + Math.cos(a) * 0.05, y, Math.sin(a) * 0.07); g.add(t); let par = t;
      for (let k = 0; k < 5; k++) { const s = new THREE.Group(); s.position.y = k ? -len / 5 : 0; par.add(s); part(s, new THREE.SphereGeometry(0.018 - k * 0.0025, 6, 4), k === 4 ? gl(c) : body, 0, 0, 0); s.rotation.z = 0.2; s.rotation.x = Math.sin(a) * 0.2; par = s; }
      (g.userData.tents = g.userData.tents || []).push(t); } };
  const tailFin = (L, c) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-0.15, 0.13); sh.lineTo(-0.1, 0); sh.lineTo(-0.15, -0.13); sh.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).convertSRGBToLinear(), transparent: true, opacity: 0.75, side: THREE.DoubleSide })); m.position.x = -L + 0.02; g.add(m); g.userData.tail = m; };
  switch (it.alien) {
    case 'angler': { // big dark head, a jaw full of teeth, a glowing lure on a stalk
      E(g, body, 0, 0, 0, 0.24, 0.17, 0.13); E(g, toon('#0c0a10'), 0.12, -0.06, 0, 0.13, 0.08, 0.11);
      for (let i = 0; i < 9; i++) { const x = 0.06 + i * 0.022; for (const s of [1, -1]) part(g, new THREE.ConeGeometry(0.008, 0.045, 4), gl('#f4f8ff'), x, s > 0 ? -0.02 : -0.1, 0.0 + (i % 2 ? 0.05 : -0.05), s > 0 ? Math.PI : 0, 0, 0); }
      const st = new THREE.Group(); st.position.set(0.1, 0.15, 0); g.add(st); part(st, Cy(0.006, 0.008, 0.16, 5), body, 0.04, 0.06, 0, 0, 0, -0.6); const lure = part(st, new THREE.SphereGeometry(0.03, 10, 8), gl(id === 'voidgulper' ? '#c86aff' : '#4fffe0'), 0.11, 0.12, 0); g.userData.lure = lure;
      eye(0.15, 0.06, 0.08, 0.025, '#ffd36a'); eye(0.15, 0.06, -0.08, 0.025, '#ffd36a'); if (id === 'voidgulper') { eye(0.05, 0.12, 0.07, 0.018, '#c86aff'); eye(0.05, 0.12, -0.07, 0.018, '#c86aff'); eye(-0.05, 0.1, 0, 0.02, '#c86aff'); }
      for (let i = 0; i < 7; i++) part(g, new THREE.SphereGeometry(0.01, 5, 4), gl('#4fd2ff'), -0.15 + i * 0.045, -0.02 + Math.sin(i) * 0.03, 0.12);
      tailFin(0.24, '#4fd2ff'); break; }
    case 'tentacle': { // a round body, too many eyes, glowing tentacles underneath
      E(g, body, 0, 0.02, 0, 0.17, 0.15, 0.15); E(g, toon('#e8e4dc', 'skin'), 0.02, -0.06, 0, 0.13, 0.07, 0.12);
      if (id === 'tripleye') { eye(0.14, 0.07, 0, 0.032, '#7fff6a'); eye(0.12, 0.02, 0.07, 0.026, '#7fff6a'); eye(0.12, 0.02, -0.07, 0.026, '#7fff6a'); }
      else { eye(0.13, 0.05, 0.06, 0.024, '#4fd2ff'); eye(0.13, 0.05, -0.06, 0.024, '#4fd2ff'); }
      for (let i = 0; i < 10; i++) { const a = i * 0.63; part(g, new THREE.SphereGeometry(0.011, 5, 4), gl(i % 2 ? '#ffd36a' : '#4fffe0'), Math.cos(a) * 0.1 - 0.03, 0.08 + Math.sin(i) * 0.04, Math.sin(a) * 0.13); }
      tentacles(6, -0.1, 0.22, '#ff6aa8'); tailFin(0.16, col); break; }
    case 'spiky': { // a flat body covered in glowing crystal spines
      E(g, body, 0, 0, 0, 0.24, 0.1, it.name.includes('Ray') ? 0.18 : 0.08);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI, x = -0.18 + i * 0.028; const c = part(g, new THREE.ConeGeometry(0.014, 0.08 + (i % 3) * 0.03, 5), gl(i % 2 ? '#9fe8ff' : '#c86aff'), x, 0.08 + Math.sin(a) * 0.04, 0, 0, 0, -0.3); }
      for (const s of [-1, 1]) for (let i = 0; i < 5; i++) part(g, new THREE.ConeGeometry(0.01, 0.06, 4), gl('#9fe8ff'), -0.1 + i * 0.05, 0, s * (it.name.includes('Ray') ? 0.17 : 0.08), s * Math.PI / 2, 0, 0);
      eye(0.18, 0.03, 0.05, 0.02, '#ffd36a'); eye(0.18, 0.03, -0.05, 0.02, '#ffd36a'); tailFin(0.24, '#9fe8ff'); break; }
    case 'jelly': { // a see-through bell with a glowing heart and trailing threads
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).convertSRGBToLinear(), transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); bell.rotation.z = -Math.PI / 2; g.add(bell); g.userData.bell = bell;
      part(g, new THREE.SphereGeometry(0.05, 10, 8), gl(id === 'starjelly' ? '#ffd36a' : '#4fffe0'), 0.04, 0, 0);
      if (id === 'starjelly') for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.02, 0.07, 4), gl('#ffd36a'), 0.06, Math.cos(a) * 0.08, Math.sin(a) * 0.08, a, 0, Math.PI / 2); }
      const th = new THREE.Group(); th.rotation.z = Math.PI / 2; th.position.x = 0.02; g.add(th);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; part(th, Cy(0.004, 0.002, 0.3, 4), gl(i % 2 ? col : '#ff6aa8'), Math.cos(a) * 0.08, -0.17, Math.sin(a) * 0.08); }
      g.userData.thr = th; break; }
    case 'bug': { // a fish with a beetle's shell, three eyes and buzzing wing-fins
      for (let i = 0; i < 4; i++) E(g, i % 2 ? toon('#3a6a2a') : body, 0.12 - i * 0.08, 0.01, 0, 0.07, 0.08 - i * 0.008, 0.075 - i * 0.008);
      eye(0.18, 0.04, 0.035, 0.018, '#ffd36a'); eye(0.18, 0.04, -0.035, 0.018, '#ffd36a'); eye(0.17, 0.08, 0, 0.016, '#ff3b2a');
      for (const s of [-1, 1]) { part(g, Cy(0.003, 0.003, 0.12, 4), dark, 0.22, 0.1, s * 0.03, s * 0.3, 0, -0.8); part(g, new THREE.SphereGeometry(0.008, 4, 3), gl('#7fff6a'), 0.26, 0.15, s * 0.05);
        const w = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.06), new THREE.MeshBasicMaterial({ color: '#cfffe0', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); w.position.set(0.02, 0.07, s * 0.07); w.rotation.x = s * 0.6; g.add(w); (g.userData.wings = g.userData.wings || []).push(w); }
      tailFin(0.2, '#7fff6a'); break; }
    case 'gear': { // a chrome fish with gear fins and one red camera eye
      E(g, toon(col, 'metal'), 0, 0, 0, 0.22, 0.11, 0.07); part(g, B(0.28, 0.02, 0.145), toon('#5a5e66', 'metal'), 0, 0, 0);
      for (const s of [-1, 1]) { const gr = part(g, new THREE.TorusGeometry(0.04, 0.012, 4, 8), toon('#ffd36a', 'metal'), 0.02, -0.03, s * 0.075); (g.userData.gears = g.userData.gears || []).push(gr); }
      const top = part(g, new THREE.TorusGeometry(0.05, 0.014, 4, 8), toon('#ffd36a', 'metal'), -0.02, 0.1, 0); top.rotation.x = Math.PI / 2; (g.userData.gears = g.userData.gears || []).push(top);
      part(g, Cy(0.03, 0.03, 0.02, 10), dark, 0.17, 0.03, 0, Math.PI / 2, 0, 0); part(g, new THREE.SphereGeometry(0.018, 8, 6), gl('#ff2a3a'), 0.18, 0.03, 0);
      tailFin(0.22, '#ffe14a'); break; }
  }
  g.userData.alien = it.alien; return g; }; }

// ---- the catch card: a pop-up panel with the type, weight, length and what it is worth ----
{ const _cs = fshCatchStep; fshCatchStep = function (dt) { const C = FSH.catch; if (C && C.m) { const u = C.m.userData, t = C.t;
    if (u.tents) u.tents.forEach((tn, i) => { let s = tn, k = 0; while (s) { s.rotation.z = Math.sin(t * 5 + i + k) * 0.35; s = s.children.find(o => o.isGroup); k++; } });
    if (u.lure) u.lure.scale.setScalar(1 + Math.sin(t * 8) * 0.25); if (u.bell) u.bell.scale.set(1, 1 + Math.sin(t * 6) * 0.1, 1 + Math.sin(t * 6) * 0.1); if (u.thr) u.thr.rotation.x = Math.sin(t * 3) * 0.3;
    if (u.wings) u.wings.forEach((w, i) => { w.rotation.x = (i ? 1 : -1) * (0.4 + Math.sin(t * 40) * 0.5); }); if (u.gears) u.gears.forEach(gr => { gr.rotation.z += dt * 6; }); }
  return _cs(dt * 0.62); }; } // the card stays up about 5.5 s instead of 3.4
fshCatchShow = function (F) {
  fshCatchHide(); const id = F.fish, it = ITEMS[id]; if (!it) return; const junk = fishJunk(id);
  const holder = new THREE.Group(), m = makeFishModel(id); m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 3; } }); holder.add(m); holder.position.set(0, -0.6, -0.95); holder.rotation.x = 0.25; camera.add(holder);
  const sz = junk ? null : fishSize(id), rar = junk ? null : fishRarity(id, F.table); let rec = false, bonus = 0;
  if (sz) { S.fishBest = S.fishBest || {}; if (!S.fishBest[id] || sz.cm > S.fishBest[id]) { rec = !!S.fishBest[id]; S.fishBest[id] = sz.cm; markDirty(); }
    // bigger than average pays a size bonus on the spot (you still sell the fish for its normal price)
    const avg = 18 + Math.sqrt(it.v) * 5.5; bonus = Math.max(0, Math.round(it.v * (sz.cm / avg - 1) * 1.5)); if (bonus) { S.cr += bonus; markDirty(); } }
  let card = $('catchCard'); if (!card) { card = document.createElement('div'); card.id = 'catchCard'; document.body.appendChild(card); }
  card.innerHTML = ''; const el = (p, t, c, s) => { const e = document.createElement(t); if (c) e.className = c; e.textContent = s; p.appendChild(e); return e; };
  const box = el(card, 'div', 'cbox', ''); el(box, 'div', 'cn', it.name);
  const rarName = junk ? 'Junk' : FISH_RARITY[rar][0], rarCol = junk ? '#9fb0a0' : FISH_RARITY[rar][1]; el(box, 'div', 'cr', rarName).style.color = rarCol; box.style.borderColor = rarCol;
  const rows = el(box, 'div', 'crows', ''), row = (k, v) => { const r = el(rows, 'div', 'crow', ''); el(r, 'span', 'ck', k); el(r, 'span', 'cv', v); };
  const wt = FISH_WATER[F.table] || 'Fish', where = wt.split(' · ')[1] || ''; row('Type', junk ? 'Junk' : it.alien ? 'Alien species' + (where ? ' · ' + where : '') : wt);
  if (sz) { row('Weight', `${sz.kg} kg (${(sz.kg * 2.2046).toFixed(sz.kg < 10 ? 1 : 0)} lb)`); row('Length', `${sz.cm} cm`); }
  row('Value', `${it.v} cr${bonus ? ` + ${bonus} cr size bonus` : ''}`);
  if (rec) el(box, 'div', 'cb', 'New record!'); else if (S.fishLog && S.fishLog[id] === 1 && !junk) el(box, 'div', 'cb', 'New species!');
  card.className = 'show'; FSH.catch = { holder, m, t: 0, rar: rar || 0 };
  if (rar >= 2 || it.alien) fshCatchBurst(holder, it.alien ? '#4fffe0' : FISH_RARITY[rar][1]);
  if (bonus) log(`Size bonus: +${bonus} cr for a ${sz.cm} cm ${it.name}.`, 'loot');
};
{ const st = document.createElement('style'); st.textContent = `
#catchCard .cbox { display: inline-block; min-width: 230px; padding: 10px 16px 12px; background: rgba(10,14,24,.86); border: 2px solid #cfd6e0; border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,.5); }
#catchCard .crows { margin-top: 8px; display: grid; gap: 3px; text-align: left; }
#catchCard .crow { display: flex; justify-content: space-between; gap: 18px; font-size: 14px; } #catchCard .ck { color: #8fa0b8; text-transform: uppercase; letter-spacing: .1em; font-size: 11px; font-weight: 700; align-self: center; } #catchCard .cv { color: #fff; font-weight: 600; }`; document.head.appendChild(st); }
