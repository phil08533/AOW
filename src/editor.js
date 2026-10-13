// =================== GAME EDITOR (owner only): tune weapons and enemies, place things in worlds, live for everyone ===================
// Changes are stored in one shared document (world/overrides) that every player loads, plus a local copy.
const EDIT = { owner: false, ov: { guns: {}, enemies: {}, places: {} }, dirty: false, tab: 'place', sel: 0, kind: 'crate', etype: 'xr17' };
const BASE_STATS = { guns: {}, enemies: {} };
for (const id in GUNS) BASE_STATS.guns[id] = { dmg: GUNS[id].dmg, rate: GUNS[id].rate, mag: GUNS[id].mag, price: GUNS[id].price, req: GUNS[id].req };
for (const id in ENEMY) BASE_STATS.enemies[id] = { hp: ENEMY[id].hp, speed: ENEMY[id].speed, xp: ENEMY[id].xp };
function edApply() {
  for (const id in BASE_STATS.guns) if (GUNS[id]) Object.assign(GUNS[id], BASE_STATS.guns[id], EDIT.ov.guns[id] || {});
  for (const id in BASE_STATS.enemies) if (ENEMY[id]) Object.assign(ENEMY[id], BASE_STATS.enemies[id], EDIT.ov.enemies[id] || {});
}
function edSave() { EDIT.dirty = true; try { localStorage.setItem('aow-editor', JSON.stringify(EDIT.ov)); } catch (_) {} clearTimeout(EDIT.t); EDIT.t = setTimeout(async () => { if (db && EDIT.owner) { try { await db.doc('world/overrides').set({ v: 1, t: Date.now(), data: JSON.stringify(EDIT.ov) }); EDIT.dirty = false; toast('EDITOR', 'Saved · live for everyone', 1.2); } catch (e) { toast('EDITOR', 'Saved on this device only', 1.5); } } }, 800); }
function edLoad(json) { try { const o = JSON.parse(json); EDIT.ov = { guns: o.guns || {}, enemies: o.enemies || {}, places: o.places || {} }; edApply(); } catch (_) {} }
// load the shared overrides once the cloud is ready (or the local copy when offline)
if (!window.claude) EDIT.owner = true;
(async () => { try { const u = window.claude && await window.claude.use('user'); if (u && u.isOwner && u.isOwner()) { EDIT.owner = true; if ($('editorBtn')) $('editorBtn').hidden = false; } } catch (_) {} })();
{ let tries = 0; const iv = setInterval(async () => { tries++; if (!db && tries < 20) return; clearInterval(iv);
  if (db) { try { const s = await db.doc('world/overrides').get(); if (s.exists && s.data() && s.data().data) { edLoad(s.data().data); if (LEVEL) edPlaceAll(); } } catch (_) {} }
  else { try { const l = localStorage.getItem('aow-editor'); if (l) { edLoad(l); if (LEVEL) edPlaceAll(); } } catch (_) {} }
  try { const u = window.claude && await window.claude.use('user'); EDIT.owner = !!(u && u.isOwner && u.isOwner()) || DEV_ALL; } catch (_) { EDIT.owner = DEV_ALL; }
  if (!window.claude) EDIT.owner = true;
  if ($('editorBtn')) $('editorBtn').hidden = !EDIT.owner; }, 500); }
// ---- placeable things ----
const ED_KINDS = {
  crate: ['Crate', g => { part(g, B(1, 1, 1), toon('#a07a4a', 'wood'), 0, 0.5, 0); }, 0.6],
  barrel: ['Barrel', g => { part(g, Cy(0.4, 0.4, 1.1, 10), '#5d636c', 0, 0.55, 0); part(g, Cy(0.42, 0.42, 0.08, 10), '#c8402f', 0, 0.8, 0); }, 0.45],
  wall: ['Wall block', g => { part(g, B(4, 3, 0.5), toon('#8a8e96', 'hull'), 0, 1.5, 0); }, 0],
  rock: ['Rock', g => { part(g, new THREE.DodecahedronGeometry(1, 0), toon('#7a7068', 'stone'), 0, 0.6, 0); }, 0.9],
  tree: ['Tree', g => { part(g, Cy(0.25, 0.35, 3, 6), toon('#5a3a22', 'wood'), 0, 1.5, 0); part(g, new THREE.ConeGeometry(1.6, 3.2, 7), toon('#3f7a2f', 'leaves'), 0, 4, 0); }, 0.4],
  lamp: ['Street lamp', g => { part(g, Cy(0.07, 0.09, 3.4, 6), '#2b2a2c', 0, 1.7, 0); part(g, B(0.4, 0.3, 0.4), glow('#ffe0a0'), 0, 3.5, 0); }, 0.15],
  light: ['Coloured light', g => { part(g, new THREE.SphereGeometry(0.25, 8, 6), glow('#4fd2ff'), 0, 2.5, 0); const l = new THREE.PointLight(0x4fd2ff, 1, 14, 1.6); l.position.y = 2.5; g.add(l); }, 0],
  sign: ['Neon sign', g => { part(g, B(3, 0.9, 0.12), '#1e1c22', 0, 2.6, 0); part(g, B(2.7, 0.6, 0.02), glow('#ff6aa8'), 0, 2.6, 0.07); for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 2.2, 5), '#2b2a2c', s * 1.3, 1.1, 0); }, 0.1],
  platform: ['Platform', g => { part(g, B(4, 0.4, 4), toon('#5d636c', 'deck'), 0, 0.2, 0); }, 0],
  enemy: ['Enemy spawn', null, 0],
};
const ED_OBJ = [];
function edPlaceAll() {
  for (const o of ED_OBJ) { if (o.g) levelGroup.remove(o.g); if (o.e) { o.e.gone = true; scene.remove(o.e.obj); const i = enemies.indexOf(o.e); if (i >= 0) enemies.splice(i, 1); } } ED_OBJ.length = 0;
  const list = (EDIT.ov.places[LEVEL.id] || []);
  list.forEach((p, i) => {
    if (p.k === 'enemy') { if (!ENEMY[p.type]) return; let zn = ZONES.find(z => Math.hypot(p.x - z.x, p.z - z.z) < z.r); if (!zn) { zn = { id: 'ed' + i, name: LEVEL.name, x: p.x, z: p.z, r: 8 }; ZONES.push(zn); Z[zn.id] = zn; } const e = makeEnemy({ zone: zn.id, type: p.type, n: 1, lv: [p.lv || 5, p.lv || 5], at: [p.x - zn.x, p.z - zn.z] }); ED_OBJ.push({ i, e }); return; }
    const K = ED_KINDS[p.k]; if (!K) return; const g = new THREE.Group(); K[1](g); g.scale.setScalar(p.s || 1); g.position.set(p.x, (LEVEL.terrain ? groundH(p.x, p.z) : 0) + (p.y || 0), p.z); g.rotation.y = p.ry || 0; levelGroup.add(g);
    if (p.k === 'wall') box(p.x, p.z, Math.abs(Math.cos(p.ry || 0)) * 2 * (p.s || 1) + 0.25, Math.abs(Math.sin(p.ry || 0)) * 2 * (p.s || 1) + 0.25); else if (p.k === 'platform') SURFACES.push && SURFACES.push([p.x, p.z, 2 * (p.s || 1), 0.4 * (p.s || 1)]); else if (K[2]) solid(p.x, p.z, K[2] * (p.s || 1));
    ED_OBJ.push({ i, g }); });
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); try { edPlaceAll(); } catch (e) { console.warn('editor', e); } return r; }; }
edApply();
// ---- the editor panel ----
function openEditor(tab) {
  if (!EDIT.owner) return; EDIT.tab = tab || EDIT.tab; openDlg('Game editor', { place: `Place · ${LEVEL.name}`, guns: 'Weapons', enemies: 'Enemies', share: 'Save & share' }[EDIT.tab]);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '50vh'; rows.style.overflowY = 'auto';
  const row = (label, ctrl, meta) => { const r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.innerHTML = label; const b = document.createElement('span'); b.className = 'meta'; b.style.fontSize = '12px'; b.textContent = meta || ''; const c = document.createElement('span'); c.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end'; [].concat(ctrl).forEach(x => x && c.appendChild(x)); r.append(a, b, c); rows.appendChild(r); };
  const btn = (t, fn, go) => { const b = document.createElement('button'); b.className = 'pbtn' + (go ? ' go' : ''); b.style.cssText = 'padding:4px 9px;min-width:0'; b.textContent = t; b.addEventListener('click', () => { SFX.ui(); fn(); }); return b; };
  const num = (v, fn, step) => { const i = document.createElement('input'); i.type = 'number'; i.value = v; i.step = step || 'any'; i.style.cssText = 'width:74px;font:inherit;padding:3px 5px;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35)'; i.addEventListener('keydown', e => e.stopPropagation()); i.addEventListener('change', () => { const n = parseFloat(i.value); if (isFinite(n)) fn(n); }); return i; };
  const sel = (opts, cur, fn) => { const s = document.createElement('select'); s.style.cssText = 'font:inherit;padding:3px;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35);max-width:170px'; for (const [v, t] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = t; o.selected = v === cur; s.appendChild(o); } s.addEventListener('change', () => fn(s.value)); return s; };
  if (EDIT.tab === 'place') {
    $('dlgLine').textContent = 'Stand where you want it, pick a thing, and press Place. Everything you place here is saved for this world.';
    row('<b>Thing</b>', [sel(Object.entries(ED_KINDS).map(([k, v]) => [k, v[0]]), EDIT.kind, v => { EDIT.kind = v; openEditor(); })]);
    if (EDIT.kind === 'enemy') row('<b>Enemy type</b>', [sel(Object.keys(ENEMY).sort().map(k => [k, ENEMY[k].name + (ENEMY[k].boss ? ' ★' : '')]), EDIT.etype, v => { EDIT.etype = v; })]);
    row('', [btn('＋ Place in front of me', () => { const L = EDIT.ov.places[LEVEL.id] = EDIT.ov.places[LEVEL.id] || []; const d = 3.5, x = player.pos.x - Math.sin(player.yaw) * d, z = player.pos.z - Math.cos(player.yaw) * d; L.push(EDIT.kind === 'enemy' ? { k: 'enemy', type: EDIT.etype, x: +x.toFixed(2), z: +z.toFixed(2), lv: Math.max(1, S.lvl) } : { k: EDIT.kind, x: +x.toFixed(2), z: +z.toFixed(2), ry: +(player.yaw).toFixed(2), s: 1 }); edSave(); edPlaceAll(); openEditor(); }, true)]);
    const L = EDIT.ov.places[LEVEL.id] || [];
    const h = document.createElement('div'); h.style.cssText = 'margin:8px 0 2px;color:#ffd36a;font-weight:bold'; h.textContent = `Placed here (${L.length})`; rows.appendChild(h);
    L.forEach((p, i) => { const nm = p.k === 'enemy' ? `${(ENEMY[p.type] || {}).name || p.type} (Lv ${p.lv})` : ED_KINDS[p.k][0], dist = Math.round(Math.hypot(player.pos.x - p.x, player.pos.z - p.z));
      const upd = () => { edSave(); edPlaceAll(); openEditor(); };
      row(`<b>${i + 1}. ${nm}</b>`, [p.k !== 'enemy' && btn('⟲', () => { p.ry = +((p.ry || 0) + Math.PI / 4).toFixed(2); upd(); }), p.k !== 'enemy' && btn('－', () => { p.s = Math.max(0.25, +((p.s || 1) - 0.25).toFixed(2)); upd(); }), p.k !== 'enemy' && btn('＋', () => { p.s = Math.min(6, +((p.s || 1) + 0.25).toFixed(2)); upd(); }), p.k === 'enemy' && num(p.lv, n => { p.lv = Math.max(1, Math.round(n)); upd(); }, 1), btn('Move here', () => { p.x = +(player.pos.x - Math.sin(player.yaw) * 3.5).toFixed(2); p.z = +(player.pos.z - Math.cos(player.yaw) * 3.5).toFixed(2); upd(); }), btn('Go to', () => { player.pos.set(p.x + 2, player.pos.y, p.z + 2); closeDlg(); }), btn('🗑', () => { L.splice(i, 1); upd(); })], `${dist} m away · size ${p.s || 1}`); });
  }
  if (EDIT.tab === 'guns') { $('dlgLine').textContent = 'Damage, fire delay (seconds between shots), magazine, price and level needed. Changes apply right away, for everyone.';
    for (const id of Object.keys(GUNS)) { const G = GUNS[id], o = EDIT.ov.guns[id] = EDIT.ov.guns[id] || {}, set = (k, v) => { o[k] = v; edApply(); edSave(); };
      row(`<b>${G.name}</b>`, [num(G.dmg, v => set('dmg', v)), num(G.rate, v => set('rate', v), 0.01), num(G.mag, v => set('mag', Math.round(v)), 1), num(G.price, v => set('price', Math.round(v)), 1), num(G.req, v => set('req', Math.round(v)), 1)], 'dmg · delay · mag · price · lvl'); } }
  if (EDIT.tab === 'enemies') { $('dlgLine').textContent = 'Base health, speed and XP (health still grows with enemy level). Changes apply as enemies respawn.';
    for (const id of Object.keys(ENEMY).sort()) { const E0 = ENEMY[id], o = EDIT.ov.enemies[id] = EDIT.ov.enemies[id] || {}, set = (k, v) => { o[k] = v; edApply(); edSave(); };
      row(`<b>${E0.name}</b>${E0.boss ? ' ★' : ''}`, [num(E0.hp, v => set('hp', v), 1), num(E0.speed, v => set('speed', v), 0.1), num(E0.xp, v => set('xp', Math.round(v)), 1)], 'hp · speed · xp'); } }
  if (EDIT.tab === 'share') { $('dlgLine').textContent = 'Your edits save automatically to the shared world file, so every player gets them. Copy them out to send to Claude to make them permanent, or paste a set in.';
    const ta = document.createElement('textarea'); ta.value = JSON.stringify(EDIT.ov); ta.style.cssText = 'width:100%;height:140px;font:12px monospace;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35)'; ta.addEventListener('keydown', e => e.stopPropagation()); rows.appendChild(ta);
    row('', [btn('Copy', () => { ta.select(); try { navigator.clipboard.writeText(ta.value); toast('EDITOR', 'Copied', 1); } catch (_) { document.execCommand('copy'); } }), btn('Load pasted', () => { edLoad(ta.value); edSave(); edPlaceAll(); toast('EDITOR', 'Loaded', 1); }), btn('Reset everything', () => { if (!confirm || confirm('Undo every edit for everyone?')) { EDIT.ov = { guns: {}, enemies: {}, places: {} }; edApply(); edSave(); edPlaceAll(); openEditor(); } })]); }
  $('dlgActs').before(rows);
  acts([['📍 Place', () => openEditor('place'), EDIT.tab === 'place'], ['🔫 Weapons', () => openEditor('guns'), EDIT.tab === 'guns'], ['👾 Enemies', () => openEditor('enemies'), EDIT.tab === 'enemies'], ['🎭 Wardrobe / Face', () => { closeDlg(); openWardrobe(); }], ['💾 Save & share', () => openEditor('share'), EDIT.tab === 'share'], ['Close', closeDlg]]);
}
