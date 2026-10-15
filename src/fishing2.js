// =================== FISHING UPDATE (Phase 8): rods you hold, a real cast, a bobber that bites, and the catch up close ===================
RODS[4] = { name: 'Abyss Rod', price: 6000, zone: 1.9, rare: 3.2 };
{ const m = (LEVELS.ocean && LEVELS.ocean.npcs || []).find(n => n.id === 'marlin'); if (m) { m.rods = (m.rods || [1]).filter(t => t !== 4).concat(4); } }
const ROD_LOOK = { 1: { pole: '#8a6a44', grip: '#3d2a1e', reel: '#8a8e96', tip: '#e8e4dc' }, 2: { pole: '#5f8a3a', grip: '#2a3a1e', reel: '#c8b84a', tip: '#c8ff6a' }, 3: { pole: '#bfe6ff', grip: '#3a5266', reel: '#e8f4ff', tip: '#9fe8ff', ice: true }, 4: { pole: '#2a2e4a', grip: '#14121e', reel: '#4fffe0', tip: '#4fffe0', glow: true } };
// a rod standing along +y, grip at the origin; userData.tip is the eyelet at the end
function makeRodModel(tier) {
  const L = ROD_LOOK[tier] || ROD_LOOK[1], g = new THREE.Group(), len = 1.5, mat = L.glow ? toon(L.pole, 'metal') : toon(L.pole, L.ice ? 'metal' : 'wood');
  part(g, Cy(0.022, 0.026, 0.32, 8), toon(L.grip, 'cloth'), 0, 0.12, 0);
  const segs = 3; for (let i = 0; i < segs; i++) { const r0 = 0.018 - i * 0.005, r1 = r0 - 0.005; part(g, Cy(Math.max(0.005, r1), r0, len / segs, 6), mat, 0, 0.28 + (i + 0.5) * len / segs, 0); }
  part(g, Cy(0.045, 0.045, 0.05, 10), L.reel, 0.045, 0.2, 0, 0, 0, Math.PI / 2); part(g, B(0.012, 0.06, 0.012), L.reel, 0.075, 0.2, 0.03);
  for (let i = 1; i <= 3; i++) part(g, new THREE.TorusGeometry(0.012, 0.003, 4, 8), L.reel, 0, 0.28 + i * len / 3.2, 0.02);
  if (L.ice) for (let i = 0; i < 5; i++) part(g, new THREE.OctahedronGeometry(0.018, 0), glow('#cff4ff'), 0.012 * (i % 2 ? 1 : -1), 0.5 + i * 0.22, 0);
  if (L.glow) for (let i = 0; i < 4; i++) part(g, B(0.03, 0.08, 0.03), glow('#4fffe0'), 0, 0.45 + i * 0.3, 0);
  const tip = new THREE.Object3D(); tip.position.y = 0.28 + len; g.add(tip); part(g, new THREE.SphereGeometry(0.012, 6, 4), glow(L.tip), 0, 0.28 + len, 0);
  g.userData.tip = tip; return g;
}
// fish models, built side-on along +x (head) so they read when spun
function makeFishModel(id) {
  const it = ITEMS[id] || { col: '#8a8e96' }, col = it.col, g = new THREE.Group(), m = /eel|glow/i.test(id) ? glow(col) : toon(col, 'skin'), belly = toon('#e8e4dc', 'skin'), fin = toon(col, 'cloth');
  if (id === 'boot') { part(g, B(0.16, 0.26, 0.12), toon('#5a4a3a', 'cloth'), -0.06, 0.04, 0); part(g, B(0.3, 0.1, 0.13), toon('#5a4a3a', 'cloth'), 0.04, -0.12, 0); part(g, B(0.32, 0.03, 0.14), toon('#2a1e18'), 0.04, -0.18, 0); return g; }
  if (id === 'rustcan') { part(g, Cy(0.09, 0.09, 0.24, 10), toon('#9a6a3a', 'metal'), 0, 0, 0); part(g, Cy(0.092, 0.092, 0.1, 10), toon('#c8402f'), 0, 0, 0); g.rotation.z = 0.4; return g; }
  const eye = (x, y, r) => { for (const s of [-1, 1]) { part(g, new THREE.SphereGeometry(r, 8, 6), '#f4f8ff', x, y, s * 0.05); part(g, new THREE.SphereGeometry(r * 0.55, 6, 4), '#15110e', x + r * 0.3, y, s * (0.05 + r * 0.5)); } };
  if (/eel/i.test(id)) { for (let i = 0; i < 9; i++) E(g, m, 0.28 - i * 0.07, Math.sin(i * 0.9) * 0.03, 0, 0.06 - i * 0.003, 0.05 - i * 0.003, 0.045 - i * 0.003); eye(0.31, 0.015, 0.014); return g; }
  const long = /pike|coel|trout|bass/.test(id), flat = /koi|ring|glass|pearl/.test(id), Lx = long ? 0.3 : 0.22, Hy = flat ? 0.15 : long ? 0.09 : 0.12, Wz = flat ? 0.05 : 0.07;
  E(g, m, 0, 0, 0, Lx, Hy, Wz); E(g, belly, 0.02, -Hy * 0.35, 0, Lx * 0.8, Hy * 0.55, Wz * 0.92);
  const tail = new THREE.Shape(); tail.moveTo(0, 0); tail.lineTo(-0.16, 0.12); tail.lineTo(-0.12, 0); tail.lineTo(-0.16, -0.12); tail.closePath();
  const tm = new THREE.Mesh(new THREE.ShapeGeometry(tail), fin); tm.material.side = THREE.DoubleSide; tm.position.x = -Lx + 0.03; g.add(tm); g.userData.tail = tm;
  const df = new THREE.Shape(); df.moveTo(-0.1, 0); df.lineTo(0.05, 0); df.lineTo(-0.06, 0.09); df.closePath(); const dm = new THREE.Mesh(new THREE.ShapeGeometry(df), fin); dm.position.y = Hy * 0.85; g.add(dm);
  for (const s of [-1, 1]) { const pf = E(g, fin, Lx * 0.35, -Hy * 0.3, s * Wz, 0.06, 0.02, 0.03); pf.rotation.y = s * 0.5; }
  if (id === 'coel') for (let i = 0; i < 6; i++) part(g, new THREE.SphereGeometry(0.012, 4, 3), '#cfe8ff', -0.15 + i * 0.06, 0.02 * (i % 2), Wz * 0.95);
  if (id === 'ringfish') for (const r of [0.06, 0.1]) { const t = part(g, new THREE.TorusGeometry(r, 0.008, 4, 16), glow('#ffd36a'), 0, 0, 0); t.rotation.y = Math.PI / 2; }
  eye(Lx * 0.68, Hy * 0.25, 0.022); return g;
}
// remember every fishing spot so the cast knows where the water is
const FISH_SPOTS = [];
{ const _bf = buildFishSpots; buildFishSpots = function (id) { FISH_SPOTS.length = 0; return _bf(id); }; }
{ const _fs = fishSpot; fishSpot = function (name, table, x, z, faceX, faceZ, ice) { const r = _fs(name, table, x, z, faceX, faceZ, ice); FISH_SPOTS.push({ x, z, y: Math.max(groundH(x, z), WATER_Y + 0.2), ry: Math.atan2(faceX - x, faceZ - z), ice: !!ice }); return r; }; }

// ---- the show: rod in your hands, cast, bobber, line, catch ----
const FSH = { F: null, st: null, hits: 0, t: 0, rod: null, tier: 0, bob: null, line: null, rings: [], spot: null, from: null, to: null, pos: V(0, 0, 0), fly: 0, shore: null, catch: null, card: null };
const fshBobber = (() => { const b = new THREE.Group(); part(b, new THREE.SphereGeometry(0.07, 8, 6), glow('#ff3b2a'), 0, 0.03, 0); part(b, new THREE.SphereGeometry(0.065, 8, 6), '#f4f8ff', 0, -0.03, 0); part(b, Cy(0.006, 0.006, 0.08, 4), '#2b2a2c', 0, 0.12, 0); b.visible = false; scene.add(b); return b; })();
const fshLine = (() => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 3), 3)); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.8 })); l.frustumCulled = false; l.visible = false; scene.add(l); return l; })();
function fshRing(x, y, z, big) { const m = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.8, depthWrite: false })); m.position.set(x, y + 0.02, z); scene.add(m); FSH.rings.push({ m, t: 0, s: big ? 2.2 : 1.3 }); }
function fshRodSet(tier) {
  if (FSH.tier === tier && FSH.rod) return; if (FSH.rod) camera.remove(FSH.rod.parent || FSH.rod);
  const holder = new THREE.Group(), r = makeRodModel(tier); r.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); holder.add(r); holder.scale.setScalar(0.6); holder.position.set(0.24, -0.27, -0.5); camera.add(holder); FSH.rod = r; FSH.tier = tier; FSH.holder = holder;
}
function fshSpotNear() { let best = null, bd = 5; for (const s of FISH_SPOTS) { const d = Math.hypot(s.x - player.pos.x, s.z - player.pos.z); if (d < bd) { bd = d; best = s; } } return best; }
function fshStart(F) {
  FSH.F = F; FSH.st = F.st; FSH.hits = 0; FSH.t = 0; FSH.fly = -1; fshCatchHide(); fshRodSet(S.rod || 1); FSH.holder.visible = true;
  const s = fshSpotNear(); FSH.spot = s;
  if (s) { player.yaw = s.ice ? player.yaw : s.ry + Math.PI; player.pitch = s.ice ? -0.7 : -0.22;
    if (s.ice) FSH.to = V(s.x, s.y + 0.1, s.z); else { const ux = Math.sin(s.ry), uz = Math.cos(s.ry);
      // walk out from the dock and find where the water really is, so the bobber never lands in the grass (2.14.5)
      const wet = (x, z) => groundH(x, z) < WATER_Y - 0.05; let a = -1, b = -1; for (let d = 1.2; d < 10; d += 0.2) { if (wet(s.x + ux * d, s.z + uz * d)) { if (a < 0) a = d; b = d; } else if (a >= 0) break; }
      let d = a < 0 ? 2.8 + rand(3, 4.5) : a + (b - a) * rand(0.45, 0.7); if (a >= 0) d = Math.min(d, a + 4.5);
      let side = rand(-1, 1); if (a >= 0) for (let k = 0; k < 4 && !wet(s.x + ux * d + side * uz, s.z + uz * d - side * ux); k++) side *= 0.5;
      FSH.to = V(s.x + ux * d + side * uz, WATER_Y + 0.03, s.z + uz * d - side * ux); const sh = a < 0 ? 2.4 : Math.max(1.2, a + 0.2); FSH.shore = V(s.x + ux * sh, WATER_Y + 0.03, s.z + uz * sh); } }
  else { const ux = -Math.sin(player.yaw), uz = -Math.cos(player.yaw); FSH.to = V(player.pos.x + ux * 6, Math.max(WATER_Y, floorAt(player.pos.x + ux * 6, player.pos.z + uz * 6)) + 0.03, player.pos.z + uz * 6); FSH.shore = V(player.pos.x + ux * 1.5, FSH.to.y, player.pos.z + uz * 1.5); }
  if (!FSH.shore) FSH.shore = FSH.to.clone();
}
function fshStop() { FSH.F = null; if (FSH.holder) FSH.holder.visible = false; fshBobber.visible = false; fshLine.visible = false; }
const fshTip = () => { const v = V(0, 0, 0); FSH.rod.userData.tip.getWorldPosition(v); return v; };
function fshStep(dt) {
  for (let i = FSH.rings.length - 1; i >= 0; i--) { const R = FSH.rings[i]; R.t += dt; R.m.scale.setScalar(1 + R.t * 4 * R.s); R.m.material.opacity = Math.max(0, 0.8 - R.t * 0.9); if (R.t > 0.9) { scene.remove(R.m); R.m.geometry.dispose(); R.m.material.dispose(); FSH.rings.splice(i, 1); } }
  fshCatchStep(dt);
  const F = fishing;
  if (!F) { if (FSH.F) fshStop(); return; }
  if (F !== FSH.F) fshStart(F);
  FSH.t += dt; const t = FSH.t, H = FSH.holder, rod = FSH.rod;
  // the swing: back, then forward; the bobber leaves the tip on the way forward
  let tilt = -0.95, bend = 0;
  if (t < 0.3) tilt = -0.95 + (t / 0.3) * 1.25; else if (t < 0.55) tilt = 0.3 - ((t - 0.3) / 0.25) * 1.6; else if (t < 0.9) tilt = -1.3 + ((t - 0.55) / 0.35) * 0.35;
  if (t >= 0.45 && FSH.fly < 0) { FSH.fly = 0; FSH.from = fshTip(); }
  if (F.st !== FSH.st) { const was = FSH.st; FSH.st = F.st;
    if (F.st === 'bite') { fshRing(FSH.pos.x, FSH.pos.y, FSH.pos.z, true); FSH.dip = 0.35; }
    if (F.st === 'gone') { FSH.slack = 0; }
    if (F.st === 'done') { FSH.back = 0; FSH.from = FSH.pos.clone(); fshCatchShow(F); } }
  if (F.hits > FSH.hits) { FSH.hits = F.hits; const k = F.hits / ((F.need || 1) + 1); FSH.to = FSH.to.clone().lerp(FSH.shore, k * 0.6); FSH.pull = 0.4; fshRing(FSH.pos.x, FSH.pos.y, FSH.pos.z); }
  if (FSH.pull > 0) { FSH.pull -= dt; bend = Math.sin(FSH.pull * 30) * 0.06 + 0.25; }
  if (F.st === 'bite') bend = Math.max(bend, 0.12 + Math.sin(t * 25) * 0.04);
  H.rotation.x = tilt + bend * 0.6; H.rotation.z = -0.15; rod.rotation.x = -bend;
  // where the bobber is
  if (FSH.fly >= 0 && FSH.fly < 1) { FSH.fly = Math.min(1, FSH.fly + dt / 0.7); const k = FSH.fly; FSH.pos.lerpVectors(FSH.from, FSH.to, k); FSH.pos.y += Math.sin(k * Math.PI) * (FSH.spot && FSH.spot.ice ? 0.4 : 2.2); if (k >= 1) fshRing(FSH.to.x, FSH.to.y, FSH.to.z); }
  else if (FSH.fly >= 1) {
    if (F.st === 'done') { FSH.back = Math.min(1, (FSH.back || 0) + dt / 0.45); const tip = fshTip(); FSH.pos.lerpVectors(FSH.from, tip, FSH.back); FSH.pos.y += Math.sin(FSH.back * Math.PI) * 1.2; }
    else { FSH.pos.lerp(FSH.to, Math.min(1, dt * 6)); let y = FSH.to.y + Math.sin(t * 2.4) * 0.025;
      if (F.st === 'bite') { FSH.dip = Math.max(0, (FSH.dip || 0) - dt); y -= 0.1 + Math.abs(Math.sin(t * 18)) * 0.05 + FSH.dip * 0.2; }
      if (F.st === 'gone') { FSH.slack = Math.min(1, (FSH.slack || 0) + dt * 0.5); FSH.to.y = WATER_Y + 0.03; }
      FSH.pos.y = y; } }
  const show = FSH.fly >= 0 && !(F.st === 'done' && FSH.back >= 1);
  fshBobber.visible = show; if (show) { fshBobber.position.copy(FSH.pos); fshBobber.rotation.z = F.st === 'bite' ? Math.sin(t * 20) * 0.4 : 0; }
  // the line: tip to bobber, sagging more when slack
  fshLine.visible = show || t < 0.6; if (fshLine.visible) { const a = fshTip(), b = show ? FSH.pos : a, P = fshLine.geometry.attributes.position, sag = F.st === 'gone' ? 0.9 : F.st === 'bite' || FSH.pull > 0 ? 0.05 : 0.35;
    for (let i = 0; i < 16; i++) { const k = i / 15; P.setXYZ(i, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * sag * Math.min(1, a.distanceTo(b) / 4), a.z + (b.z - a.z) * k); } P.needsUpdate = true; }
}
// ---- the catch: model up close, name, size, rarity, records ----
const FISH_RARITY = [['Common', '#cfd6e0'], ['Uncommon', '#7fff6a'], ['Rare', '#4fd2ff'], ['Legendary', '#ffb347']];
function fishSize(id) {
  const it = ITEMS[id] || { v: 1 }, base = 18 + Math.sqrt(it.v) * 5.5, r = Math.random(), f = 0.72 + r * 0.45 + (r > 0.93 ? (r - 0.93) * 6 : 0);
  const cm = Math.round(base * f), kg = +(Math.pow(cm / 100, 3) * (/eel/i.test(id) ? 4 : 11)).toFixed(cm > 60 ? 1 : 2); return { cm, kg };
}
function fishRarity(id, table) { const e = (FISH_TABLES[table] || []).find(x => x[0] === id), d = e ? e[2] : 0.3; return d >= 0.85 ? 3 : d >= 0.6 ? 2 : d >= 0.3 ? 1 : 0; }
const fishJunk = id => id === 'boot' || id === 'rustcan' || (ITEMS[id] && ITEMS[id].v <= 2);
function fshCatchShow(F) {
  fshCatchHide(); const id = F.fish, it = ITEMS[id]; if (!it) return; const junk = fishJunk(id);
  const holder = new THREE.Group(), m = makeFishModel(id); m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 3; } }); holder.add(m); holder.position.set(0, -0.6, -0.95); holder.rotation.x = 0.25; camera.add(holder);
  const sz = junk ? null : fishSize(id), rar = junk ? null : fishRarity(id, F.table); let rec = false;
  if (sz) { S.fishBest = S.fishBest || {}; if (!S.fishBest[id] || sz.cm > S.fishBest[id]) { rec = !!S.fishBest[id]; S.fishBest[id] = sz.cm; markDirty(); } }
  let card = $('catchCard'); if (!card) { card = document.createElement('div'); card.id = 'catchCard'; document.body.appendChild(card); }
  card.innerHTML = ''; const el = (t, c, s) => { const e = document.createElement(t); if (c) e.className = c; e.textContent = s; card.appendChild(e); return e; };
  el('div', 'cn', it.name); if (junk) el('div', 'cr', 'Junk').style.color = '#9fb0a0'; else { el('div', 'cr', FISH_RARITY[rar][0]).style.color = FISH_RARITY[rar][1]; el('div', 'cs', `${sz.cm} cm · ${sz.kg} kg`); if (rec) el('div', 'cb', 'New record!'); else if (S.fishLog && S.fishLog[id] === 1) el('div', 'cb', 'New species!'); }
  card.className = 'show'; FSH.catch = { holder, m, t: 0, rar: rar || 0 };
  if (rar >= 2) fshCatchBurst(holder, FISH_RARITY[rar][1]);
}
function fshCatchBurst(holder, col) { for (let i = 0; i < 14; i++) { const s = part(holder, new THREE.OctahedronGeometry(0.012, 0), glow(col), 0, 0, 0); const a = i / 14 * Math.PI * 2; s.userData.v = V(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0); } }
function fshCatchStep(dt) {
  const C = FSH.catch; if (!C) return; C.t += dt; const k = Math.min(1, C.t / 0.45), e = 1 - Math.pow(1 - k, 3);
  C.holder.position.y = -0.6 + e * 0.62; C.m.rotation.y = C.t * 1.4; C.m.rotation.z = Math.sin(C.t * 6) * 0.12 * Math.max(0, 1 - C.t / 1.5); if (C.m.userData.tail) C.m.userData.tail.rotation.y = Math.sin(C.t * 14) * 0.4;
  C.holder.children.forEach(o => { if (o.userData.v) { o.position.addScaledVector(o.userData.v, dt); o.userData.v.multiplyScalar(0.96); o.rotation.x += dt * 5; } });
  if (!dlgOpen || (fishing && fishing.st !== 'done')) fshCatchHide(); // stays up until you tap Continue (2.14.4)
}
function fshCatchHide() { const C = FSH.catch; if (C) { camera.remove(C.holder); disposeTree(C.holder); FSH.catch = null; } const c = $('catchCard'); if (c) c.className = ''; }
{ const st = document.createElement('style'); st.textContent = `
#catchCard { position: fixed; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 12%); transform: translate(-50%, -8px); text-align: center; pointer-events: none; z-index: 7; opacity: 0; transition: opacity .25s, transform .25s; font-family: var(--hud, inherit); text-shadow: 0 2px 6px rgba(0,0,0,.8); }
#catchCard.show { opacity: 1; transform: translate(-50%, 0); }
#catchCard .cn { font-size: clamp(20px, 3.4vw, 30px); color: #fff; font-weight: 700; } #catchCard .cr { font-size: 13px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
#catchCard .cs { font-size: 15px; color: #e8f4ff; margin-top: 2px; } #catchCard .cb { display: inline-block; margin-top: 6px; padding: 2px 10px; font-size: 12px; font-weight: 700; color: #15110e; background: #ffd36a; border-radius: 10px; }
.dlg.fishing { width: min(calc(100% - 24px), 440px); padding: 8px 12px 10px; background: rgba(8,14,26,.72); } .dlg.fishing .line { font-size: 14px; min-height: 0; } .dlg.fishing h3 { font-size: 17px; margin: 0 0 3px; } .dlg.fishing .acts { margin-top: 6px; }
@media (max-height: 520px) { .dlg.fishing { left: auto; right: 12px; transform: none; bottom: calc(env(safe-area-inset-bottom, 0px) + 74px); width: 300px; padding: 6px 10px 8px; } .dlg.fishing .who { display: none; } .dlg.fishing h3 { font-size: 14px; } .dlg.fishing .line { font-size: 12px; line-height: 1.25; } .dlg.fishing .fishbar { height: 18px; margin: 5px 0 2px; } .dlg.fishing .acts .pbtn { padding: 4px 10px; font-size: 12px; } }`; document.head.appendChild(st); }
// hold the rod instead of the gun, keep the box small, reel by tapping or clicking the screen
{ const _st = step; step = function (dt) { _st(dt); try { fshStep(dt); const on = !!fishing && !!FSH.F; $('dlg').classList.toggle('fishing', on); if (on) { vm.visible = false; if (typeof vmMelee !== 'undefined') vmMelee.visible = false; } } catch (e) { console.warn('fishing', e); } }; }
{ const reelTap = e => { if (!fishing || !dlgOpen || !fishing.reel) return; if ($('dlg').contains(e.target)) return; if (e.target.closest && e.target.closest('button, .win, #menuDrop')) return; fishing.reel(); e.preventDefault(); };
  window.addEventListener('pointerdown', reelTap, true); }
{ const _pw = pvpWrite; pvpWrite = function (p) { _pw(p); if (fishing && S.rod) p.gn = 'rod:' + S.rod; }; }
{ const _rw = remoteWeapon; remoteWeapon = function (r, code) {
  if (!code || !code.startsWith('rod:')) { if (r.rodObj) { r.rodObj.parent && r.rodObj.parent.remove(r.rodObj); r.rodObj = null; } return _rw(r, code); }
  if (r.gnCode === code) return; r.gnCode = code; let std = null; r.obj.traverse(c => { if (c.userData && c.userData.stdGun) std = c; }); if (!std) return;
  if (r.gnObj) { r.gnObj.parent && r.gnObj.parent.remove(r.gnObj); r.gnObj = null; } if (r.rodObj) { r.rodObj.parent && r.rodObj.parent.remove(r.rodObj); r.rodObj = null; }
  std.visible = false; const h = new THREE.Group(), m = makeRodModel(+code.slice(4) || 1); m.rotation.x = 1.0; h.add(m); h.position.copy(std.position); h.quaternion.copy(std.quaternion);
  const ws = V(1, 1, 1); std.parent.getWorldScale(ws); const rs = V(1, 1, 1); r.obj.getWorldScale(rs); h.scale.setScalar(rs.x / (ws.x || 1)); std.parent.add(h); r.rodObj = h; }; }
// ---- line tension (2.12): hold to reel, ease off when the line strains; big fish fight back in surges ----
function fshLose(F, msg) {
  F.st = 'gone'; F.hold = false; SFX.hurt(); $('dlgLine').textContent = `${msg} (${ITEMS[F.fish].name})`; F.bar.style.opacity = 0.35;
  acts([['Cast again', () => { closeDlg(); startFishing(F.name, F.table); }, true], ['Stop', closeDlg]]);
}
function fshLand(F) {
  F.st = 'done'; F.hold = false; S.inv[F.fish] = (S.inv[F.fish] || 0) + 1; S.fishLog = S.fishLog || {}; const first = !S.fishLog[F.fish]; S.fishLog[F.fish] = (S.fishLog[F.fish] || 0) + 1;
  const it = ITEMS[F.fish]; $('dlgLine').textContent = `You caught a ${it.name}! (${it.v} cr)${first ? ' New species for your log!' : ''}`;
  SFX.splash(); SFX.item(); if (it.v >= 100) { SFX.quest(); toast('RARE CATCH', it.name); burp('rare'); }
  log(`Caught ${it.name}`, 'loot'); questProgressFish(); gainXp(Math.max(4, Math.round(it.v * 0.9))); markDirty(); checkReady();
  F.bar.style.opacity = 0.35; acts([['Cast again', () => { closeDlg(); startFishing(F.name, F.table); }, true], ['Stop', closeDlg]]);
}
function fshFightStart(F) {
  const e = (FISH_TABLES[F.table] || []).find(x => x[0] === F.fish), d = e ? e[2] : 0.3, rod = RODS[S.rod] || RODS[1];
  F.fight = { d, tol: rod.zone, ten: 0, prog: 0.15, slackT: 0, surge: 0, surgeT: rand(1.2, 2.4), tick: 0 }; F.need = 4; F.hits = 0;
  F.bar.innerHTML = '<i class="ft"></i><s class="fdz"></s>'; F.bar.classList.add('tension');
  const pr = document.createElement('div'); pr.className = 'fprog'; pr.innerHTML = '<i></i><b></b>'; F.bar.after(pr); F.prog = pr;
  $('dlgLine').textContent = d > 0.55 ? 'Something BIG is on! Hold to reel, ease off when the line goes red.' : 'Hooked! Hold to reel. Ease off when the line goes red.';
}
function fshFight(F, dt) {
  const G = F.fight, d = G.d;
  G.surgeT -= dt; if (G.surgeT <= 0) {
    if (G.surge) { G.surge = 0; G.surgeT = rand(1.4, 3.2) * (1.25 - d * 0.6); if (F.st === 'bite') $('dlgLine').textContent = 'It tired out. Reel!'; }
    else if (d > 0.15) { G.surge = 1; G.surgeT = rand(0.5, 0.8 + d); $('dlgLine').textContent = d > 0.55 ? "It's running hard! Ease off!" : "It's pulling! Ease off!"; SFX.bite(); } else G.surgeT = 2; }
  if (F.hold) { G.ten += dt * (0.1 + d * 0.5 + G.surge * (0.7 + d)) / G.tol; G.prog += dt * (0.3 - d * 0.14) * (0.85 + 0.15 * G.tol) * (G.surge ? 0.3 : 1); G.slackT = 0;
    G.tick -= dt; if (G.tick <= 0) { G.tick = 0.28; SFX.reel(); } }
  else { G.ten = Math.max(0, G.ten - dt * 0.75); G.prog -= dt * (0.015 + d * 0.04) * (G.surge ? 2.2 : 1); G.slackT += dt; }
  G.ten = Math.min(1, G.ten); G.prog = Math.min(1, G.prog);
  F.hits = Math.max(F.hits, Math.min(3, Math.floor(G.prog * 4)));
  const t = F.bar.firstChild; t.style.width = (G.ten * 100) + '%'; t.style.background = G.ten < 0.6 ? '#6fdc5a' : G.ten < 0.85 ? '#ffd36a' : '#ff4a3a';
  F.bar.classList.toggle('strain', G.ten > 0.85 || !!G.surge); F.prog.firstChild.style.width = (G.prog * 100) + '%';
  if (G.ten >= 1) return fshLose(F, 'Snap! The line broke.');
  if (G.prog <= 0 || G.slackT > 3.2) return fshLose(F, 'Too much slack. It slipped the hook.');
  if (G.prog >= 1) fshLand(F);
}
{ const _sf = startFishing; startFishing = function (name, table) {
  _sf(name, table); const F = fishing; if (!F || !F.bar) return;
  const early = F.reel; F.reel = () => { if (F.st === 'wait') early(); else if (F.st === 'bite') F.hold = true; };
  const b = $('dlgActs').querySelector('.go'); if (b) { const nb = b.cloneNode(true); nb.textContent = 'Hold to reel'; b.replaceWith(nb);
    nb.addEventListener('pointerdown', e => { e.preventDefault(); F.reel(); }); nb.addEventListener('contextmenu', e => e.preventDefault()); }
}; }
{ const _uf = updateFishing; updateFishing = function (dt) {
  const F = fishing, was = F && F.st; _uf(dt); if (!F || fishing !== F) return;
  if (was === 'wait' && F.st === 'bite') fshFightStart(F);
  if (F.st === 'bite' && F.fight) fshFight(F, dt);
}; }
{ const up = () => { if (fishing) fishing.hold = false; };
  window.addEventListener('pointerup', up, true); window.addEventListener('pointercancel', up, true); window.addEventListener('blur', up);
  window.addEventListener('keydown', e => { if (!fishing || !dlgOpen || !fishing.fight || fishing.st !== 'bite' || (e.code !== 'Space' && e.code !== 'KeyE')) return; e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) fishing.reel(); }, true);
  window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'KeyE') up(); }, true);
  const st = document.createElement('style'); st.textContent = `
.fishbar.tension { height: 16px; border-radius: 9px; overflow: hidden; }
.fishbar.tension .ft { position: absolute; left: 0; top: 0; bottom: 0; width: 0; transition: background .15s; }
.fishbar.tension .fdz { position: absolute; right: 0; top: 0; bottom: 0; width: 15%; background: repeating-linear-gradient(135deg, rgba(255,74,58,.35) 0 6px, transparent 6px 12px); }
.fishbar.tension.strain { animation: fshShake .12s linear infinite; }
@keyframes fshShake { 0% { transform: translateX(0) } 25% { transform: translateX(-2px) } 75% { transform: translateX(2px) } }
.fprog { position: relative; height: 7px; margin: 4px 0 0; border-radius: 4px; background: rgba(255,255,255,.14); }
.fprog i { position: absolute; left: 0; top: 0; bottom: 0; width: 15%; border-radius: 4px; background: #4fd2ff; }
.fprog b { position: absolute; right: -2px; top: -4px; width: 14px; height: 14px; border-radius: 50%; background: #e8f4ff; box-shadow: 0 0 6px #4fd2ff; }
@media (max-height: 520px) { .dlg.fishing .fishbar.tension { height: 14px; } }`; document.head.appendChild(st); }
