// =================== EDITOR PLACE MODE (Phase 7): a see-through preview where you aim, grid, nudge, pick up, undo, NPCs, shops, spawns ===================
// Hanging decor: each model hangs DOWN from its origin (the ceiling point). Ship Decorate (furniture.js) reuses these.
const HANG_MODELS = {
  hanglamp: g => { part(g, Cy(0.015, 0.015, 0.9, 4), '#2b2a2c', 0, -0.45, 0); part(g, new THREE.ConeGeometry(0.38, 0.32, 12, 1, true), toon('#c9a43a', 'metal'), 0, -1.02, 0); part(g, new THREE.SphereGeometry(0.13, 8, 6), glow('#ffe0a0'), 0, -1.12, 0); const l = new THREE.PointLight(0xffd9a0, 0.9, 9, 1.6); l.position.y = -1.2; g.add(l); },
  chainlight: g => { for (let i = 0; i < 6; i++) part(g, new THREE.TorusGeometry(0.05, 0.012, 4, 8), '#8a8e96', 0, -0.08 - i * 0.1, 0).rotation.y = i % 2 ? Math.PI / 2 : 0; part(g, Cy(0.22, 0.22, 0.08, 10), '#2b2a2c', 0, -0.7, 0); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; part(g, new THREE.SphereGeometry(0.07, 6, 5), glow('#9fe8ff'), Math.cos(a) * 0.18, -0.78, Math.sin(a) * 0.18); } const l = new THREE.PointLight(0x9fe8ff, 0.8, 9, 1.6); l.position.y = -0.85; g.add(l); },
  hangplant: g => { for (const a of [0, 2.1, 4.2]) { const c = part(g, Cy(0.008, 0.008, 0.75, 3), '#c8b88a', Math.cos(a) * 0.12, -0.37, Math.sin(a) * 0.12); c.rotation.z = Math.cos(a) * 0.16; c.rotation.x = -Math.sin(a) * 0.16; } part(g, Cy(0.26, 0.18, 0.28, 10), toon('#a0603a', 'clay'), 0, -0.88, 0); for (let i = 0; i < 7; i++) { const a = i * 0.9; part(g, B(0.08, 0.5 + (i % 3) * 0.12, 0.03), toon('#3f8a3f', 'leaves'), Math.cos(a) * 0.24, -1.05 - (i % 3) * 0.06, Math.sin(a) * 0.24).rotation.y = a; } E(g, toon('#4f9a3f', 'leaves'), 0, -0.72, 0, 0.3, 0.16, 0.3); },
  hangbanner: g => { part(g, Cy(0.03, 0.03, 1.1, 6), '#c9a43a', 0, -0.05, 0).rotation.z = Math.PI / 2; for (const s of [-1, 1]) part(g, Cy(0.006, 0.006, 0.4, 3), '#2b2a2c', s * 0.4, 0.15, 0); part(g, B(0.95, 1.7, 0.03), toon('#8a2a2e', 'cloth'), 0, -0.92, 0); part(g, B(0.5, 0.5, 0.035), glow('#ffd36a'), 0, -0.7, 0); part(g, new THREE.ConeGeometry(0.48, 0.3, 3), toon('#8a2a2e', 'cloth'), 0, -1.9, 0).rotation.z = Math.PI; }
};
const HANG_NAMES = { hanglamp: 'Hanging lamp', chainlight: 'Chain light', hangplant: 'Hanging plant', hangbanner: 'Hanging banner' };
for (const k in HANG_MODELS) ED_KINDS[k] = [HANG_NAMES[k], HANG_MODELS[k], 0, true];
// extra override sections (edLoad used to drop anything but guns/enemies/places)
const ovx = (k, lv) => { const o = EDIT.ov[k] = EDIT.ov[k] || {}; if (lv == null) return o; return o[lv] = o[lv] || {}; };
edLoad = function (json) { try { const o = JSON.parse(json); EDIT.ov = Object.assign({ guns: {}, enemies: {}, places: {} }, o); for (const k of ['guns', 'enemies', 'places']) EDIT.ov[k] = EDIT.ov[k] || {}; edApply(); } catch (_) {} };
{ const BASE_V = {}; for (const k in ITEMS) BASE_V[k] = ITEMS[k].v;
  const _ap = edApply; edApply = function () { _ap(); const iv = EDIT.ov.items || {}; for (const k in BASE_V) if (ITEMS[k]) ITEMS[k].v = iv[k] != null ? iv[k] : BASE_V[k]; }; }
// hanging things outdoors get a post
{ const _pa = edPlaceAll; edPlaceAll = function () { const L = EDIT.ov.places[LEVEL.id] || []; for (const p of L) if (emHang(p.k) && p.y == null) { p.y = 6; p.post = 1; } _pa();
  for (const o of ED_OBJ) { const p = L[o.i]; if (!o.g || !p || !p.post) continue; const s = p.s || 1, h = (p.y || 6) / s;
    part(o.g, Cy(0.06, 0.08, h + 0.25, 6), '#2b2a2c', 0.7, -h / 2 + 0.12, 0); part(o.g, B(0.8, 0.06, 0.06), '#2b2a2c', 0.35, 0.22, 0); part(o.g, Cy(0.006, 0.006, 0.22, 3), '#2b2a2c', 0, 0.11, 0); } }; }
// NPC overrides (position, facing, lines, guns sold) apply as each NPC is made
{ const _mn = makeNpc; makeNpc = function (n, base) {
  const o = EDIT.ov.npcs && LEVEL && EDIT.ov.npcs[LEVEL.id] && EDIT.ov.npcs[LEVEL.id][n.id];
  if (o) { n = Object.assign({}, n); if (o.x != null) { n.x = o.x - base[0]; n.z = o.z - base[1]; } if (o.face != null) n.face = o.face; if (o.idle && o.idle.length) n.idle = o.idle.slice(); if (o.guns) n.guns = o.guns.slice(); }
  return _mn(n, base); }; }
// spawn levels/counts and zone spots apply before the world loads
function emApplyLevel(L, id) {
  if (!L) return; const so = (EDIT.ov.spawns || {})[id] || {}, zo = (EDIT.ov.zones || {})[id] || {};
  (L.spawns || []).forEach((sp, i) => { if (!sp._b) sp._b = { lv: sp.lv.slice(), n: sp.n }; const o = so[i]; sp.lv = o && o.lv ? o.lv.slice() : sp._b.lv.slice(); sp.n = o && o.n != null ? o.n : sp._b.n; });
  (L.zones || []).forEach(z => { if (!z._b) z._b = { x: z.x, z: z.z }; const o = zo[z.id]; z.x = o ? o.x : z._b.x; z.z = o ? o.z : z._b.z; });
}
{ const _ll = loadLevel; loadLevel = function (id, o) { try { emApplyLevel(LEVELS[id] || LEVELS.earth, id); } catch (e) { console.warn('editmode', e); } if (EM.on) emStop(); return _ll(id, o); }; }

// ---- place mode ----
const EM = { on: false, kind: 'crate', grid: true, rot: 0, dy: 0, lock: null, aim: null, hover: null, carry: null, undo: [], g: null, gk: null, ceilT: 0, ceil: null, box: null };
const emOk = new THREE.MeshBasicMaterial({ color: '#8affb0', transparent: true, opacity: 0.5, depthWrite: false });
const emMark = new THREE.MeshBasicMaterial({ color: '#ff6a5a', transparent: true, opacity: 0.5, depthWrite: false });
const emArrowM = new THREE.MeshBasicMaterial({ color: '#ffd36a', side: THREE.DoubleSide, depthWrite: false, depthTest: false, transparent: true, opacity: 0.95 });
const emSnap = () => { EM.undo.push(JSON.stringify(EDIT.ov)); if (EM.undo.length > 20) EM.undo.shift(); };
const emHang = k => !!(ED_KINDS[k] && ED_KINDS[k][3]);
function emGhost(kind) {
  if (EM.g) scene.remove(EM.g); const g = new THREE.Group(), m = new THREE.Group(); g.add(m);
  if (kind === 'enemy') { part(m, Cy(0.45, 0.45, 1.8, 10), emMark, 0, 0.9, 0); }
  else { ED_KINDS[kind][1](m); m.traverse(o => { if (o.isMesh) o.material = emOk; if (o.isLight) o.intensity = 0; }); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 24).rotateX(-Math.PI / 2), emArrowM); ring.position.y = 0.05; g.add(ring);
  const sh = new THREE.Shape(); sh.moveTo(-0.4, 0); sh.lineTo(0.4, 0); sh.lineTo(0, 0.55); sh.closePath();
  const ar = new THREE.Group(); const tip = new THREE.Mesh(new THREE.ShapeGeometry(sh).rotateX(Math.PI / 2), emArrowM); tip.position.z = 0.95; ar.add(tip);
  const stem = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.5).rotateX(-Math.PI / 2), emArrowM); stem.position.z = 0.7; ar.add(stem); ar.position.y = 0.06; ar.renderOrder = ring.renderOrder = 5; g.add(ar);
    g.userData = { m, ar, ring }; scene.add(g); EM.g = g; EM.gk = kind;
}
const emRay = () => { const o = new THREE.Vector3(), d = new THREE.Vector3(); camera.getWorldPosition(o); camera.getWorldDirection(d); return new THREE.Ray(o, d); };
function emAimPoint(ray) {
  const o = ray.origin, d = ray.direction;
  for (let t = 0.6; t <= 15; t += 0.15) { const x = o.x + d.x * t, z = o.z + d.z * t; if (o.y + d.y * t <= floorAt(x, z) + 0.02) return { x, z, t }; }
  const h = Math.hypot(d.x, d.z) || 1; return { x: o.x + d.x / h * 6, z: o.z + d.z / h * 6, t: 15 };
}
const emRc = new THREE.Raycaster();
function emCeil(x, z) {
  const y0 = floorAt(x, z) + 0.3; emRc.set(new THREE.Vector3(x, y0, z), new THREE.Vector3(0, 1, 0)); emRc.far = 14;
  const hit = emRc.intersectObject(levelGroup, true).find(h => !(h.object.material && h.object.material.transparent && h.object.material.opacity < 0.3));
  return hit ? hit.point.y : null;
}
const emSnapXZ = v => EM.grid ? Math.round(v * 2) / 2 : +v.toFixed(2);
const emStep = () => EM.grid ? Math.PI / 4 : Math.PI / 12;
// the spot the next thing goes: where you aim, or where you nudged it to
function emSpot() {
  const a = EM.lock || EM.aim; if (!a) return null; const x = EM.lock ? a.x : emSnapXZ(a.x), z = EM.lock ? a.z : emSnapXZ(a.z), gy = floorAt(x, z);
  let y = gy + EM.dy, post = false, kind = EM.carry && EM.carry.npc ? null : EM.kind;
  if (kind && emHang(kind)) { if (!EM.ceil || Math.hypot(EM.ceil.x - x, EM.ceil.z - z) > 0.3 || performance.now() - EM.ceilT > 400) { EM.ceil = { x, z, y: emCeil(x, z) }; EM.ceilT = performance.now(); } if (EM.ceil.y != null) y = EM.ceil.y + EM.dy; else { y = gy + 6 + EM.dy; post = true; } }
  return { x, z, y, gy, post };
}
// what the crosshair is on: something you placed, or an NPC
function emPick(ray, maxT) {
  let best = null; const bx = new THREE.Box3(), v = new THREE.Vector3(), L = EDIT.ov.places[LEVEL.id] || [];
  const test = (b, hit) => { const p = ray.intersectBox(b, v); if (!p) return; const t = p.distanceTo(ray.origin); if (t < maxT + 0.8 && (!best || t < best.t)) best = Object.assign(hit, { t }); };
  for (const o of ED_OBJ) { const p = L[o.i]; if (!p) continue; if (o.g) { bx.setFromObject(o.g); if (bx.isEmpty()) continue; bx.expandByScalar(0.08); test(bx.clone(), { i: o.i, p, g: o.g }); } else { const y = groundH(p.x, p.z); test(new THREE.Box3(new THREE.Vector3(p.x - 0.5, y, p.z - 0.5), new THREE.Vector3(p.x + 0.5, y + 2, p.z + 0.5)), { i: o.i, p }); } }
  for (const id in npcObjs) { const N = npcObjs[id]; if (!N.obj.visible || !N.obj.parent) continue; const q = N.obj.position; test(new THREE.Box3(new THREE.Vector3(q.x - 0.45, q.y, q.z - 0.45), new THREE.Vector3(q.x + 0.45, q.y + 2.1, q.z + 0.45)), { npc: id, g: N.obj }); }
  return best;
}
function emStep2() {
  if (!EM.on) return;
  if (state !== 'play' || dlgOpen) { if (EM.g) EM.g.visible = false; return; }
  const ray = emRay(); EM.aim = emAimPoint(ray);
  // carrying an NPC: it walks with your aim
  if (EM.carry && EM.carry.npc) { const N = npcObjs[EM.carry.npc], s = emSpot(); if (N && s) { N.obj.position.set(s.x, floorAt(s.x, s.z), s.z); N.obj.rotation.y = EM.carry.face; } if (EM.g) EM.g.visible = false; EM.hover = null; emHover(null); emMsg(); return; }
  EM.hover = EM.lock ? null : emPick(ray, EM.aim.t); emHover(EM.hover);
  if (EM.gk !== EM.kind || !EM.g) emGhost(EM.kind);
  const s = emSpot(); if (!s) return; const g = EM.g, U = g.userData, sc = EM.carry ? EM.carry.s || 1 : 1;
  g.visible = !EM.hover; g.position.set(s.x, s.y, s.z); g.rotation.y = EM.rot; U.m.scale.setScalar(sc);
  const hang = emHang(EM.kind); U.ar.position.y = hang ? -(s.y - s.gy) + 0.06 : 0.06; U.ring.position.y = U.ar.position.y;
  const t = performance.now() / 1000; emOk.opacity = 0.42 + Math.sin(t * 4) * 0.12; emArrowM.opacity = 0.75 + Math.sin(t * 6) * 0.2;
  emMsg(s);
}
function emHover(h) {
  const tg = h && h.g; if (EM.box && EM.box.userData.t !== tg) { scene.remove(EM.box); EM.box.geometry.dispose(); EM.box = null; }
  if (tg) { if (!EM.box) { EM.box = new THREE.BoxHelper(tg, 0xffd36a); EM.box.userData.t = tg; scene.add(EM.box); } else EM.box.update(); }
  const row = $('emHov'); if (!row) return; row.hidden = !h; if (!h) return;
  const nm = h.npc ? npcObjs[h.npc].def.name : h.p.k === 'enemy' ? `${(ENEMY[h.p.type] || {}).name || h.p.type} spawn (Lv ${h.p.lv})` : ED_KINDS[h.p.k][0];
  const key = (h.npc || 'p') + (h.i == null ? '' : h.i); if (row.dataset.k === key) return; row.dataset.k = key; row.textContent = '';
  const lb = document.createElement('span'); lb.className = 'bmsg'; lb.textContent = `Aiming at ${nm}`; row.appendChild(lb);
  const b = (t, fn) => { const x = document.createElement('button'); x.className = 'pbtn'; x.textContent = t; x.addEventListener('click', e => { e.stopPropagation(); SFX.ui(); fn(); }); row.appendChild(x); };
  if (h.npc) { b('✥ Move', emMove); b('↻ Turn', emTurnNpc); b('💬 Lines', () => emLines(h.npc)); }
  else { b('✥ Move', emMove); b('⧉ Copy', emCopy); b('🗑 Delete', emDelete); }
}
function emMsg(s) {
  const m = $('emMsg'); if (!m) return; let t;
  if (EM.carry && EM.carry.npc) t = `Moving ${npcObjs[EM.carry.npc].def.name} · Place to drop · ↻ turns`;
  else if (EM.hover) t = TOUCH ? 'Use the buttons below, or aim away to place' : 'M move · C copy · Del delete';
  else { const nm = EM.kind === 'enemy' ? `${(ENEMY[EM.etype] || {}).name} spawn` : ED_KINDS[EM.kind][0];
    t = `${EM.carry ? 'Moving ' : ''}${nm}${s && s.post ? ' · no ceiling here, it gets a post' : emHang(EM.kind) ? ' · hangs from the ceiling' : ''}${EM.lock ? ' · nudged' : ''}${TOUCH ? '' : ' · arrows nudge · Q/E turn · PgUp/PgDn height'}`; }
  if (m.textContent !== t) m.textContent = t;
}
function emStart() {
  if (!EDIT.owner) return; if (baseState.on) setBuild(false); closeDlg(); if (typeof closeTablet === 'function') closeTablet();
  EM.on = true; EM.lock = null; EM.dy = 0; EM.carry = null; EM.rot = Math.round(player.yaw / emStep()) * emStep(); emBar(); $('emBar').hidden = false; $('ammo').hidden = true; firing = false; document.body.classList.add('decor');
  log('Place mode: aim at the ground and fire (or press Place). The yellow arrow is the front.');
}
function emStop() {
  if (EM.carry && !EM.carry.npc && EM.carry.orig && !EM.carry.copy) { const L = EDIT.ov.places[LEVEL.id] = EDIT.ov.places[LEVEL.id] || []; L.splice(EM.carry.oi, 0, EM.carry.orig); edSave(); edPlaceAll(); }
  if (EM.carry && EM.carry.npc) emNpcReset(EM.carry.npc);
  EM.on = false; EM.carry = null; EM.lock = null; if (EM.g) EM.g.visible = false; emHover(null); if ($('emBar')) $('emBar').hidden = true; $('ammo').hidden = false; document.body.classList.remove('decor');
}
function emPlace() {
  const s = emSpot(); if (!s) return; const L = EDIT.ov.places[LEVEL.id] = EDIT.ov.places[LEVEL.id] || [];
  if (EM.carry && EM.carry.npc) { emSnap(); const id = EM.carry.npc, o = ovx('npcs', LEVEL.id)[id] = ovx('npcs', LEVEL.id)[id] || {}; o.x = +s.x.toFixed(2); o.z = +s.z.toFixed(2); o.face = +EM.carry.face.toFixed(3); emNpcCollider(id, EM.carry.from, s); EM.carry = null; EM.lock = null; edSave(); SFX.item(); return; }
  if (EM.hover) return;
  emSnap(); const base = EM.carry ? EM.carry.orig : {};
  const p = EM.kind === 'enemy' ? { k: 'enemy', type: EM.etype, x: +s.x.toFixed(2), z: +s.z.toFixed(2), lv: base.lv || Math.max(1, S.lvl) }
    : Object.assign({}, base, { k: EM.kind, x: +s.x.toFixed(2), z: +s.z.toFixed(2), ry: +EM.rot.toFixed(3), s: base.s || 1 });
  if (p.k !== 'enemy') { const dy = +(s.y - s.gy).toFixed(2); if (dy) p.y = dy; else delete p.y; if (s.post) p.post = 1; else delete p.post; }
  if (EM.carry) L.splice(EM.carry.oi, 0, p); else L.push(p);
  const was = !!EM.carry; EM.carry = null; EM.lock = null; edSave(); edPlaceAll(); SFX.item(); if (was) emBar();
}
function emMove() {
  const h = EM.hover; if (!h) return; emSnap();
  if (h.npc) { const N = npcObjs[h.npc]; EM.carry = { npc: h.npc, face: N.obj.rotation.y, from: { x: N.obj.position.x, z: N.obj.position.z } }; EM.lock = null; return; }
  const L = EDIT.ov.places[LEVEL.id]; const p = L[h.i]; L.splice(h.i, 1); EM.carry = { orig: p, oi: h.i, s: p.s }; EM.kind = p.k; if (p.k === 'enemy') EM.etype = p.type; EM.rot = p.ry || 0; EM.dy = emHang(p.k) ? 0 : (p.y || 0); EM.lock = null; edPlaceAll(); emBar();
}
function emCopy() { const h = EM.hover; if (!h || h.npc) return; const p = h.p; EM.carry = { orig: Object.assign({}, p), oi: (EDIT.ov.places[LEVEL.id] || []).length, s: p.s, copy: true }; EM.carry.orig.post = undefined; EM.kind = p.k; if (p.k === 'enemy') EM.etype = p.type; EM.rot = p.ry || 0; EM.dy = emHang(p.k) ? 0 : (p.y || 0); emBar(); }
function emDelete() { const h = EM.hover; if (!h || h.npc) return; emSnap(); EDIT.ov.places[LEVEL.id].splice(h.i, 1); edSave(); edPlaceAll(); SFX.ui(); EM.hover = null; emHover(null); }
function emTurn(dir) { if (EM.carry && EM.carry.npc) EM.carry.face += dir * emStep(); else EM.rot += dir * emStep(); }
function emTurnNpc() { const h = EM.hover; if (!h || !h.npc) return; emSnap(); const N = npcObjs[h.npc]; N.obj.rotation.y += emStep(); const o = ovx('npcs', LEVEL.id)[h.npc] = ovx('npcs', LEVEL.id)[h.npc] || {}; o.face = +N.obj.rotation.y.toFixed(3); edSave(); }
function emNudge(fx, fz) {
  const s = emSpot(); if (!s) return; const st = (keys.ShiftLeft || keys.ShiftRight) ? 0.5 : 0.1, f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), r = V(-f.z, 0, f.x);
  EM.lock = { x: +(s.x + (f.x * fz + r.x * fx) * st).toFixed(2), z: +(s.z + (f.z * fz + r.z * fx) * st).toFixed(2) };
}
// an NPC's blocker circle follows it
function emNpcCollider(id, from, to) { if (!from) return; for (const c of CIRCLES) if (Math.abs(c[0] - from.x) < 0.05 && Math.abs(c[1] - from.z) < 0.05) { c[0] = to.x; c[1] = to.z; break; } }
function emNpcReset(id) { const N = npcObjs[id]; if (!N) return; const L = LEVEL, d = (L.npcs || []).find(n => n.id === id), o = ((EDIT.ov.npcs || {})[L.id] || {})[id] || {}; if (!d) return; const base = L.npcBase || [0, 0];
  const x = o.x != null ? o.x : base[0] + d.x, z = o.z != null ? o.z : base[1] + d.z; const from = { x: N.obj.position.x, z: N.obj.position.z }; N.obj.position.set(x, floorAt(x, z), z); N.obj.rotation.y = o.face != null ? o.face : (d.face || 0); emNpcCollider(id, from, { x, z }); }
function emUndo() {
  if (!EM.undo.length) { toast('EDITOR', 'Nothing to undo', 1); return; }
  if (EM.carry && EM.carry.npc) emNpcReset(EM.carry.npc); EM.carry = null; EM.lock = null;
  EDIT.ov = JSON.parse(EM.undo.pop()); edApply(); edSave(); edPlaceAll(); for (const id in npcObjs) emNpcReset(id); emBar(); SFX.ui();
}
function emLines(id) {
  const N = npcObjs[id]; if (!N) return; const was = EM.on; if (was) emStop(); openDlg('NPC lines', N.def.name);
  $('dlgLine').textContent = 'What they say when you walk up. One line per row. Leave it empty to go back to their original lines.';
  const ta = document.createElement('textarea'); ta.value = (N.def.idle || []).join('\n'); ta.style.cssText = 'width:100%;height:150px;font:14px var(--ui,inherit);background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35);padding:6px'; ta.addEventListener('keydown', e => e.stopPropagation());
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.appendChild(ta); $('dlgActs').before(rows);
  acts([['Save', () => { emSnap(); const ls = ta.value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12), o = ovx('npcs', LEVEL.id)[id] = ovx('npcs', LEVEL.id)[id] || {}; const d = (LEVEL.npcs || []).find(n => n.id === id);
    if (ls.length) { o.idle = ls; N.def = Object.assign({}, N.def, { idle: ls }); } else { delete o.idle; if (d) N.def = Object.assign({}, N.def, { idle: d.idle }); } edSave(); closeDlg(); if (was) emStart(); }, true], ['Cancel', () => { closeDlg(); if (was) emStart(); }]]);
}
// ---- the bar ----
function emBar() {
  let bar = $('emBar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'emBar'; bar.className = 'win'; bar.hidden = true; $('buildBar').after(bar); bar.addEventListener('mousedown', e => e.stopPropagation()); bar.addEventListener('touchstart', e => e.stopPropagation()); }
  bar.textContent = ''; const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
  const b = (row, t, fn, go, id) => { const x = el('button', 'pbtn' + (go ? ' go' : ''), t); if (id) x.id = id; x.addEventListener('click', e => { e.stopPropagation(); SFX.ui(); fn(); }); row.appendChild(x); return x; };
  const head = el('div', 'bhead'); head.append(el('b', '', `Place mode · ${LEVEL.name}`), el('span', '', `${(EDIT.ov.places[LEVEL.id] || []).length} placed`)); bar.appendChild(head);
  const kinds = el('div', 'bpieces'); Object.entries(ED_KINDS).forEach(([k, v]) => b(kinds, v[0], () => { if (EM.carry) return; EM.kind = k; EM.dy = 0; emBar(); }, EM.kind === k)); bar.appendChild(kinds);
  if (EM.kind === 'enemy') { const r = el('div', 'bpieces'); const s = el('select'); s.style.cssText = 'font:inherit;padding:3px;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35)';
    for (const k of Object.keys(ENEMY).sort()) { const o = el('option', '', ENEMY[k].name + (ENEMY[k].boss ? ' ★' : '')); o.value = k; o.selected = k === EM.etype; s.appendChild(o); } s.addEventListener('change', () => { EM.etype = s.value; }); s.addEventListener('keydown', e => e.stopPropagation()); r.appendChild(s); bar.appendChild(r); }
  const act = el('div', 'bacts'); const m = el('span', 'bmsg'); m.id = 'emMsg'; act.appendChild(m);
  b(act, 'Place', emPlace, true); b(act, '↻', () => emTurn(1)); b(act, '▲', () => { EM.dy = +(EM.dy + 0.25).toFixed(2); }); b(act, '▼', () => { EM.dy = +(EM.dy - 0.25).toFixed(2); });
  b(act, `Grid ${EM.grid ? 'on' : 'off'}`, () => { EM.grid = !EM.grid; emBar(); }, false, 'emGrid'); b(act, '↶ Undo', emUndo); b(act, 'Done', emStop); bar.appendChild(act);
  const hov = el('div', 'bacts'); hov.id = 'emHov'; hov.hidden = true; bar.appendChild(hov);
  if (TOUCH) { const pad = el('div', 'bacts'); pad.appendChild(el('span', 'bmsg', 'Nudge')); b(pad, '←', () => emNudge(-1, 0)); b(pad, '↑', () => emNudge(0, 1)); b(pad, '↓', () => emNudge(0, -1)); b(pad, '→', () => emNudge(1, 0)); b(pad, '◎ Aim', () => { EM.lock = null; }); bar.appendChild(pad); }
}
{ const st = document.createElement('style'); st.textContent = `
#emBar { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(env(safe-area-inset-bottom, 0px) + 12px); width: min(calc(100% - 24px), 640px); padding: 6px 8px 7px; pointer-events: auto; display: flex; flex-direction: column; gap: 5px; z-index: 2; background: rgba(8,14,26,.78); }
#emBar .bhead { display: flex; justify-content: space-between; font-size: 12px; color: var(--gold); } #emBar .bhead span { color: var(--dim); }
#emBar .bpieces { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; } #emBar .bpieces .pbtn { flex: 0 0 auto; padding: 3px 8px; font-size: 11px; min-height: 0; }
#emBar .bacts { display: flex; gap: 5px; align-items: center; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; } #emBar .bacts .pbtn { padding: 5px 10px; font-size: 12px; flex: 0 0 auto; min-height: 0; }
#emBar .bmsg { flex: 1; font-size: 12px; min-width: 120px; color: var(--dim); }
#emBar #emHov { border-top: 1px solid rgba(255,211,106,.35); padding-top: 4px; } #emBar #emHov .bmsg { color: #ffd36a; }
@media (pointer: coarse) { #emBar { top: calc(env(safe-area-inset-top, 0px) + 6px); bottom: auto; } }`; document.head.appendChild(st); }
// fire = place (one per press) while in place mode
{ const _f = fire; fire = function () { if (EM.on) { firing = false; if (!dlgOpen) emPlace(); return; } return _f.apply(this, arguments); }; }
window.addEventListener('keydown', e => {
  if (!EM.on || state !== 'play' || dlgOpen || chatOpen()) return; const c = e.code; let h = true;
  if (c === 'ArrowUp') emNudge(0, 1); else if (c === 'ArrowDown') emNudge(0, -1); else if (c === 'ArrowLeft') emNudge(-1, 0); else if (c === 'ArrowRight') emNudge(1, 0);
  else if (c === 'KeyQ') emTurn(-1); else if (c === 'KeyE' || c === 'KeyR') emTurn(1);
  else if (c === 'PageUp') EM.dy = +(EM.dy + 0.25).toFixed(2); else if (c === 'PageDown') EM.dy = +(EM.dy - 0.25).toFixed(2);
  else if (c === 'KeyG') { EM.grid = !EM.grid; emBar(); } else if (c === 'KeyZ') emUndo(); else if (c === 'KeyF') EM.lock = null;
  else if (c === 'KeyM') emMove(); else if (c === 'KeyC') emCopy(); else if (c === 'Delete' || c === 'Backspace' || c === 'KeyX') emDelete(); else if (c === 'KeyT') emTurnNpc();
  else if (c === 'Enter') emPlace(); else if (c === 'Escape') emStop(); else h = false;
  if (h) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
{ const loop = () => { try { emStep2(); } catch (e) { console.warn('editmode', e); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

// ---- editor menu: a Place mode button, a Shops tab, and spawns for this world ----
{ const _oe = openEditor; openEditor = function (tab) {
  if (!EDIT.owner) return; EDIT.tab = tab || EDIT.tab;
  if (EDIT.tab !== 'shops') _oe(EDIT.tab); else { openDlg('Game editor', 'Shops'); }
  const rows = $('shopRows') || (() => { const r = document.createElement('div'); r.className = 'rows'; r.id = 'shopRows'; r.style.maxHeight = '50vh'; r.style.overflowY = 'auto'; $('dlgActs').before(r); return r; })();
  const row = (label, ctrl, meta) => { const r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.innerHTML = label; const b = document.createElement('span'); b.className = 'meta'; b.style.fontSize = '12px'; b.textContent = meta || ''; const c = document.createElement('span'); c.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end'; ctrl.filter(Boolean).forEach(x => c.appendChild(x)); r.append(a, b, c); rows.appendChild(r); return r; };
  const btn = (t, fn, go) => { const b = document.createElement('button'); b.className = 'pbtn' + (go ? ' go' : ''); b.style.cssText = 'padding:4px 9px;min-width:0'; b.textContent = t; b.addEventListener('click', () => { SFX.ui(); fn(); }); return b; };
  const num = (v, fn, step) => { const i = document.createElement('input'); i.type = 'number'; i.value = v; i.step = step || 'any'; i.style.cssText = 'width:64px;font:inherit;padding:3px 5px;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35)'; i.addEventListener('keydown', e => e.stopPropagation()); i.addEventListener('change', () => { const n = parseFloat(i.value); if (isFinite(n)) fn(n); }); return i; };
  const head = t => { const h = document.createElement('div'); h.style.cssText = 'margin:8px 0 2px;color:#ffd36a;font-weight:bold'; h.textContent = t; rows.appendChild(h); };
  if (EDIT.tab === 'place') { const first = rows.firstChild; const r = row('<b>🎯 Place mode</b>', [btn('Start', emStart, true)], 'aim, see it, place it'); if (first) rows.insertBefore(r, first); }
  if (EDIT.tab === 'enemies') {
    const sp = LEVEL.spawns || [], so = ovx('spawns', LEVEL.id), zo = ovx('zones', LEVEL.id);
    if (sp.length) { const keep = [...rows.children]; keep.forEach(k => k.remove()); head(`Spawns in ${LEVEL.name}`);
      sp.forEach((s, i) => { if (!ENEMY[s.type]) return; const b0 = s._b || { lv: s.lv, n: s.n }, o = so[i] || {}, cur = { lv: (o.lv || b0.lv).slice(), n: o.n != null ? o.n : b0.n }, set = () => { emSnap(); so[i] = { lv: cur.lv.slice(), n: cur.n }; edSave(); };
        row(`<b>${ENEMY[s.type].name}</b> · ${(Z[s.zone] || {}).name || s.zone}`, [num(cur.lv[0], v => { cur.lv[0] = Math.max(1, Math.round(v)); set(); }, 1), num(cur.lv[1], v => { cur.lv[1] = Math.max(cur.lv[0], Math.round(v)); set(); }, 1), num(cur.n, v => { cur.n = Math.max(0, Math.min(30, Math.round(v))); set(); }, 1)], 'min lv · max lv · how many'); });
      const zs = [...new Set(sp.map(s => s.zone))].filter(z => Z[z]); head('Spawn areas');
      zs.forEach(z => row(`<b>${Z[z].name || z}</b>`, [btn('Move here', () => { emSnap(); zo[z] = { x: +player.pos.x.toFixed(1), z: +player.pos.z.toFixed(1) }; edSave(); toast('EDITOR', 'Area moved · reload to see it', 1.2); }), zo[z] && btn('Reset', () => { emSnap(); delete zo[z]; edSave(); openEditor(); })], `${Math.round(Math.hypot(player.pos.x - Z[z].x, player.pos.z - Z[z].z))} m away`));
      row('', [btn('Reload world to see changes', () => { closeDlg(); loadLevel(LEVEL.id, { at: { x: player.pos.x, z: player.pos.z, yaw: player.yaw } }); }, true)]);
      head('Enemy types'); keep.forEach(k => rows.appendChild(k)); } }
  if (EDIT.tab === 'shops') {
    $('dlgLine').textContent = 'What stores pay for loot, and which guns each gunsmith in this world sells. Saved for everyone.';
    const iv = ovx('items'); const here = Object.values(npcObjs).filter(N => N.def.shop === 'guns' || N.def.guns);
    if (here.length) { head(`Gunsmiths in ${LEVEL.name}`); here.forEach(N => { const id = N.def.id, d = (LEVEL.npcs || []).find(n => n.id === id) || N.def, o = ovx('npcs', LEVEL.id)[id] = ovx('npcs', LEVEL.id)[id] || {}, cur = (o.guns || d.guns || Object.keys(GUNS)).slice();
      const tg = document.createElement('div'); tg.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin:2px 0 6px';
      Object.keys(GUNS).forEach(g => { const has = cur.includes(g); const b = btn((has ? '✓ ' : '') + GUNS[g].name, () => { emSnap(); const L = has ? cur.filter(x => x !== g) : cur.concat(g); o.guns = L; N.def = Object.assign({}, N.def, { guns: L }); edSave(); openEditor(); }, has); tg.appendChild(b); });
      row(`<b>${N.def.name}</b>`, [o.guns && btn('Reset', () => { emSnap(); delete o.guns; N.def = Object.assign({}, N.def, { guns: d.guns }); edSave(); openEditor(); })], `${cur.length} guns`); rows.appendChild(tg); }); }
    head('What stores pay');
    Object.keys(ITEMS).filter(k => !ITEMS[k].quest).forEach(k => row(`<b>${ITEMS[k].name}</b>`, [num(ITEMS[k].v, v => { emSnap(); iv[k] = Math.max(0, Math.round(v)); edApply(); edSave(); }, 1)], 'cr'));
  }
  acts([['📍 Place', () => openEditor('place'), EDIT.tab === 'place'], ['🔫 Weapons', () => openEditor('guns'), EDIT.tab === 'guns'], ['👾 Enemies', () => openEditor('enemies'), EDIT.tab === 'enemies'], ['🛒 Shops', () => openEditor('shops'), EDIT.tab === 'shops'], ['🎭 Wardrobe / Face', () => { closeDlg(); openWardrobe(); }], ['💾 Save & share', () => openEditor('share'), EDIT.tab === 'share'], ['Close', closeDlg]]);
}; }
