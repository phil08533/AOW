// =================== BOUTIQUE DRUGS (2.21): gather, refine, and design your own ===================
// Glowing ingredients grow out in the worlds (mushrooms, rocks, beetles, salt, moss, and rare Star Nectar). Harvest them,
// refine two raw into one extract at the Boutique Bench in your Lab, then design a drug: up to three extracts, five sliders
// (Heat, Stir, Pressure, Steep, Cut) plus a Kick, a name and a liquid colour. Each mix has hidden sweet spots, and the
// extracts set how strong a perfect cook can be, so the best grades need the rare stuff. Grade F won't sell; good grades build word of mouth and sell for more.
// The old Lab brews stay as the house brews. Save fields: S.chem { xp, rec: [recipe], sold: {id: n}, made }, S.gath { key: time }.
const BQ_ING = {
  glowcap: { name: 'Glowcap', col: '#7fffd0', worlds: ['earth', 'capitone', 'forestlife', 'mezar'], pot: 10, pur: 0, glow: 25, kick: 'xp', v: 18 },
  voidshard: { name: 'Void Shard', col: '#b86aff', worlds: ['moon', 'robot', 'mezar', 'zarlich'], pot: 30, pur: -10, glow: 5, kick: 'dmg', v: 24 },
  lumabug: { name: 'Luma Beetle', col: '#c8ff5a', worlds: ['ocean', 'earth', 'forestlife', 'capitone'], pot: 5, pur: 10, glow: 15, kick: 'spd', v: 20 },
  frostsalt: { name: 'Frost Salt', col: '#cfefff', worlds: ['zarlich', 'moon', 'ocean'], pot: 0, pur: 30, glow: 0, kick: 'def', v: 22 },
  nebmoss: { name: 'Nebula Moss', col: '#ff7ad8', worlds: ['capitone', 'zarlich', 'forestlife'], pot: 5, pur: 5, glow: 20, kick: 'cr', v: 22 },
  starnectar: { name: 'Star Nectar', col: '#ffd36a', worlds: [], pot: 35, pur: 30, glow: 20, kick: null, v: 90, rare: true },
  emberroot: { name: 'Ember Root', col: '#ff6a3a', worlds: ['fort', 'skycity', 'mezar', 'robot'], pot: 25, pur: -5, glow: 10, kick: 'dmg', v: 22 },
  skypollen: { name: 'Sky Pollen', col: '#9ad8ff', worlds: ['skycity', 'vector', 'earth', 'ocean'], pot: 5, pur: 15, glow: 15, kick: 'spd', v: 20, sh: 'moss' },
  rustlichen: { name: 'Rust Lichen', col: '#e09a4a', worlds: ['robot', 'fort', 'vector', 'moon'], pot: 10, pur: 15, glow: 5, kick: 'def', v: 20, sh: 'moss' },
  tidepearl: { name: 'Tide Pearl', col: '#a0fff0', worlds: ['ocean', 'capitone', 'skycity'], pot: 10, pur: 20, glow: 15, kick: 'cr', v: 26, sh: 'moss' },
  ghostorchid: { name: 'Ghost Orchid', col: '#e8e0ff', worlds: ['zarlich', 'forestlife', 'vector', 'fort'], pot: 15, pur: 10, glow: 25, kick: 'xp', v: 26 },
  quasarite: { name: 'Quasarite', col: '#4a7aff', worlds: ['moon', 'vector', 'skycity', 'mezar'], pot: 30, pur: 5, glow: 10, kick: 'dmg', v: 28, sh: 'shard' }
};
// the drug room box: materials dumped here stay out of your pack, and the bench uses them (box first, then pack)
function bqBox() { return S.drugBox = S.drugBox || {}; }
const bqHave = k => (S.inv[k] || 0) + (bqBox()[k] || 0);
function bqTake(k, n) { const b = bqBox(), a = Math.min(n, b[k] || 0); b[k] = (b[k] || 0) - a; if (!b[k]) delete b[k]; n -= a; if (n > 0) { S.inv[k] -= n; if (!S.inv[k]) delete S.inv[k]; } }
function bqDump() { const b = bqBox(); let n = 0; for (const k in BQ_ING) for (const id of [k, 'x_' + k]) if (S.inv[id] > 0) { b[id] = (b[id] || 0) + S.inv[id]; n += S.inv[id]; delete S.inv[id]; } markDirty(); return n; }
function openDrugBox() { const b = bqBox(); openDlg('Drug Room Box', 'Materials for the Boutique Bench'); const rows = document.createElement('div'); rows.className = 'rows'; rows.style.cssText = 'display:flex;flex-direction:column;gap:4px';
  const ks = Object.keys(b).filter(k => b[k] > 0); $('dlgLine').textContent = ks.length ? 'The bench pulls from this box first.' : 'Empty. Dump your gathered materials in here.';
  for (const k of ks) { const d = document.createElement('div'); d.className = 'rowi'; d.textContent = `${ITEMS[k] ? ITEMS[k].name : k}: ${b[k]}`; rows.appendChild(d); }
  $('dlgActs').before(rows); acts([['Dump materials', () => { const n = bqDump(); SFX.item(); toast('DRUG BOX', n ? `Stored ${n} materials` : 'Nothing to dump', 2); openDrugBox(); }, true], ['Close', closeDlg]]); }
const BQ_KICK = { dmg: ['Damage', 'damage'], spd: ['Speed', 'move speed'], def: ['Defense', 'damage taken'], xp: ['XP', 'XP'], cr: ['Credits', 'credits from kills'] };
for (const k in BQ_ING) { const I = BQ_ING[k]; ITEMS[k] = Object.assign(ITEMS[k] || {}, { name: I.name, v: I.v, col: I.col, desc: `Raw ingredient. Refine it at the Boutique Bench in your Lab.` });
  ITEMS['x_' + k] = Object.assign(ITEMS['x_' + k] || {}, { name: I.name + ' Extract', v: I.v * 3, col: I.col, desc: `Refined ${I.name}. Goes into boutique drugs.` }); }
function chemS() { S.chem = S.chem || { xp: 0, rec: [], sold: {}, made: 0 }; S.chem.rec = S.chem.rec || []; S.chem.sold = S.chem.sold || {}; return S.chem; }
const chemLvl = () => 1 + Math.floor(Math.sqrt((chemS().xp || 0) / 40));
const chemSlots = () => chemLvl() >= 6 ? 3 : chemLvl() >= 3 ? 2 : 1;
const chemCap = () => Math.min(100, 46 + chemLvl() * 6);
const BQ_GRADES = [[0.85, 'S'], [0.7, 'A'], [0.55, 'B'], [0.4, 'C'], [0.25, 'D'], [0, 'F']];
const BQ_GRADE_MULT = { S: 6, A: 3.2, B: 1.8, C: 1, D: 0.5, F: 0 };
// what a recipe actually does. The sliders are the cook (Heat, Stir, Pressure, Steep, Cut), not the result: every mix of
// extracts has its own hidden sweet spot for each one, so maxing everything burns the batch. You learn a mix by brewing it.
const BQ_SL = [['heat', 'Heat'], ['stir', 'Stir'], ['press', 'Pressure'], ['steep', 'Steep']];
function bqTarget(ing, key) { let h = 7; for (const c of ing.slice().sort().join() + key) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 18 + (h % 67); }
function bqFix(r) { for (const [k] of BQ_SL) if (r[k] == null) r[k] = 50; return r; }
function bqEval(r) {
  bqFix(r); const ing = (r.ing || []).filter(k => BQ_ING[k]), sum = s => ing.reduce((a, k) => a + BQ_ING[k][s], 0), C = r.cut;
  const fit = {}; for (const [k] of BQ_SL) { const d = r[k] - bqTarget(ing, k); fit[k] = { d, f: Math.max(0, 1 - Math.abs(d) / 45) }; }
  const baseP = ing.length ? 30 + sum('pot') : 8, baseU = ing.length ? 30 + sum('pur') : 8, baseG = ing.length ? 30 + sum('glow') : 8;
  const P = Math.min(chemCap(), baseP * (0.35 + 0.65 * (fit.heat.f + fit.press.f) / 2) * (1 + Math.max(0, fit.heat.d) / 200));
  const U = Math.min(chemCap(), baseU * (0.35 + 0.65 * (fit.stir.f + fit.steep.f) / 2));
  const G = Math.min(100, baseG * (0.35 + 0.65 * (fit.press.f + fit.steep.f) / 2));
  const burnt = Math.max(0, fit.heat.d - 15) / 100; // running hot gives a stronger, dirtier batch
  const kf = ing.filter(k => BQ_ING[k].kick === r.kick || BQ_ING[k].rare).length * 0.05;
  const q = Math.max(0, Math.min(1, ((P * 0.45 + U * 0.4 + G * 0.15) / 100 + kf - burnt * 0.5) * (1 - C / 150)));
  const grade = BQ_GRADES.find(g => q >= g[0])[1], capK = r.kick === 'xp' || r.kick === 'cr' ? 0.6 : 0.4;
  const str = Math.round(q * capK * 100) / 100, sec = Math.round(120 + U * 2.4), trip = Math.round(Math.min(0.6, P / 100 * (1 - U / 100) * 0.4 + burnt) * 100) / 100;
  const doses = Math.min(8, 2 + Math.floor(C / 25) + Math.floor(chemLvl() / 5));
  return { P, U, G, C, q, grade, str, sec, trip, doses, ing, fit };
}
// what the bench tells you about a slider: vague at first, sharper as your Chemist level climbs
function bqHint(e, k) { if (!e.ing.length) return 'needs an extract'; const d = e.fit[k].d, a = Math.abs(d), L = chemLvl();
  const W = { heat: ['scorched', 'runs hot', 'too cool', 'stone cold'], stir: ['frothing', 'overworked', 'lumpy', 'separating'], press: ['hissing', 'tight', 'loose', 'flat'], steep: ['stewed', 'bitter', 'thin', 'watery'] }[k];
  if (a < (L >= 4 ? 6 : 10)) return 'feels right'; if (L < 2) return a > 30 ? 'way off' : 'off'; return d > 0 ? (a > 25 ? W[0] : W[1]) : (a > 25 ? W[3] : W[2]); }
function bqGuess(e) { const L = chemLvl(), i = ['F', 'D', 'C', 'B', 'A', 'S'].indexOf(e.grade); if (L >= 5) return e.grade; const G = 'FDCBAS'; return `${G[Math.max(0, i - 1)]}–${G[Math.min(5, i + 1)]}`; }
function bqPrice(id) { const r = chemS().rec.find(x => x.id === id); if (!r) return 0; const e = bqEval(r), rep = chemS().sold[id] || 0;
  const wom = e.grade === 'S' ? Math.min(3, rep * 0.06) : e.grade === 'A' ? Math.min(1.5, rep * 0.03) : 0;
  return Math.round((60 + e.q * e.q * 700) * BQ_GRADE_MULT[e.grade] * (1 + wom)); }
// each saved recipe becomes a real drug the bag, the inhaler, the screen effects and the buyers already understand
function bqRegister(r) {
  const e = bqEval(r), hsl = {}; new THREE.Color(r.col || '#c86aff').getHSL(hsl); const id = r.id;
  const fx = { hue: (hsl.h - 0.5) * 2 * (e.G / 100), ghost: e.G / 160, sat: e.G / 300 }; if (e.G > 75) fx.cycle = (e.G - 75) / 25;
  SUBS[id] = { name: `${r.name} (${e.grade})`, price: bqPrice(id), v: e.grade === 'F' ? 0 : Math.round(bqPrice(id) / 3), col: r.col, sec: e.sec, trip: e.trip, fx, boutique: 1,
    desc: `${e.grade}-grade boutique drug. +${Math.round(e.str * 100)}% ${BQ_KICK[r.kick][1]}${r.kick === 'def' ? ' reduction' : ''} for ${Math.round(e.sec / 60)} min.${e.trip ? ` ${Math.round(e.trip * 100)}% bad trip chance.` : ''}` };
  SUBS[id][r.kick] = e.str; ITEMS[id] = Object.assign(ITEMS[id] || {}, { name: SUBS[id].name, v: SUBS[id].v, col: r.col, drug: true, illegal: true, desc: SUBS[id].desc });
}
function bqRegisterAll() { try { chemS().rec.forEach(bqRegister); } catch (e) { console.warn('boutique', e); } }
// tint the screen with the drug's liquid colour while it's active
{ const _f = subFxStep; subFxStep = function (dt) { _f(dt); try { const act = subActive().filter(id => SUBS[id] && SUBS[id].boutique); if (!act.length) return; const D = SUBS[act[0]], U = postMat.uniforms;
  if (U.tintA.value < 0.05) { U.tint.value.set(D.col); U.tintA.value = Math.max(U.tintA.value, (D.fx.ghost || 0) * 0.35); } } catch (_) {} }; }
// count doses that leave the bag other than by using them as sold: that is what spreads word of mouth
{ let last = {}, used = 0; const _u = useSub; useSub = function (id) { if (SUBS[id] && SUBS[id].boutique) used = id; return _u.apply(this, arguments); }; window.useSub = useSub;
  setInterval(() => { try { const C = chemS(); for (const r of C.rec) { const n = S.inv[r.id] || 0, was = last[r.id]; if (was != null && n < was) { const gone = was - n - (used === r.id ? 1 : 0); if (gone > 0) { C.sold[r.id] = (C.sold[r.id] || 0) + gone; C.earn = C.earn || {}; C.earn[r.id] = (C.earn[r.id] || 0) + gone * bqPrice(r.id); C.xp += gone * (2 + ['F', 'D', 'C', 'B', 'A', 'S'].indexOf(bqEval(r).grade)); SUBS[r.id].price = bqPrice(r.id); markDirty(); } } last[r.id] = n; } used = 0; } catch (_) {} }, 1500); }

// ---- gathering: glowing nodes out in the worlds, back after 20 minutes ----
function bqNodeModel(k) { const g = new THREE.Group(), I = BQ_ING[k], gl = glow(I.col);
  if (k === 'glowcap') for (let i = 0; i < 4; i++) { const a = i * 1.7, r = i ? 0.25 : 0, h = 0.25 + (i % 2) * 0.15; part(g, Cy(0.04, 0.05, h, 6), '#e8e0c8', Math.cos(a) * r, h / 2, Math.sin(a) * r); part(g, new THREE.SphereGeometry(0.14 - i * 0.015, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), gl, Math.cos(a) * r, h, Math.sin(a) * r); }
  else if (k === 'voidshard' || k === 'frostsalt' || I.sh === 'shard') for (let i = 0; i < 5; i++) { const a = i * 1.26, h = 0.3 + (i % 3) * 0.18; part(g, Cy(0.0, 0.09, h, 5), gl, Math.cos(a) * 0.16, h / 2, Math.sin(a) * 0.16, Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3); }
  else if (k === 'lumabug') { for (let i = 0; i < 3; i++) { const b = new THREE.Group(); part(b, B(0.12, 0.06, 0.16), toon('#2a2c20'), 0, 0, 0); part(b, B(0.1, 0.04, 0.06), gl, 0, 0, -0.08); b.position.set((i - 1) * 0.3, 0.35 + i * 0.1, 0); g.add(b); } part(g, Cy(0.05, 0.08, 0.3, 6), toon('#4a3a2a', 'bark'), 0, 0.15, 0); }
  else if (k === 'nebmoss' || I.sh === 'moss') for (let i = 0; i < 6; i++) part(g, new THREE.SphereGeometry(0.12, 6, 4), gl, Math.cos(i) * 0.25, 0.06, Math.sin(i * 1.3) * 0.25);
  else { part(g, Cy(0.02, 0.03, 0.5, 5), '#4a8a3a', 0, 0.25, 0); for (let i = 0; i < 6; i++) part(g, B(0.1, 0.02, 0.18), gl, Math.cos(i) * 0.1, 0.5, Math.sin(i) * 0.1, 0, i, 0.4); }
  const l = new THREE.PointLight(new THREE.Color(I.col).getHex(), 0.5, 3, 2); l.position.y = 0.6; g.add(l); return g; }
function bqPlaceNodes() {
  if (!LEVEL || !LEVEL.terrain || LEVEL.fly) return; const id = LEVEL.id, here = Object.keys(BQ_ING).filter(k => BQ_ING[k].worlds.includes(id)); if (!here.length) return;
  S.gath = S.gath || {}; const now = Date.now();
  for (let i = 0; i < 12; i++) { const key = id + ':' + i; if (now - (S.gath[key] || 0) < 20 * 60000) continue;
    const p = typeof outSpot === 'function' ? outSpot(900 + i * 7.3 + id.length, 0.12, 0.6) : null; if (!p) continue;
    const k = (i * 7 + id.length) % 23 === 0 ? 'starnectar' : here[i % here.length], o = bqNodeModel(k), y = floorAt(p.x, p.z);
    o.position.set(p.x, y, p.z); levelGroup.add(o); const ph = i;
    levelAnims.push(t => { if (o.parent) o.children.forEach((c, j) => { if (c.isGroup) c.position.y = 0.35 + j * 0.1 + Math.sin(t * 3 + j + ph) * 0.06; }); });
    const it = { x: p.x, z: p.z, r: 1.8, label: 'Harvest ' + BQ_ING[k].name, fn: () => { const n = 1 + (Math.random() < 0.4 ? 1 : 0); invAdd(k, n); S.gath[key] = Date.now(); levelGroup.remove(o); const j = INTERACTS.indexOf(it); if (j >= 0) INTERACTS.splice(j, 1); SFX.item(); toast('HARVESTED', `${n} ${BQ_ING[k].name}${k === 'starnectar' ? ' (rare!)' : ''}`, 2); markDirty(); } };
    INTERACTS.push(it); }
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); setTimeout(() => { try { bqRegisterAll(); bqPlaceNodes(); } catch (e) { console.warn('bq nodes', e); } }, 150); return r; }; }

// ---- the Boutique Bench ----
const BQ = { r: null };
function bqNew() { return { id: 'bq_' + Date.now().toString(36), name: 'House Special', col: '#c86aff', ing: [], heat: 50, stir: 50, press: 50, steep: 50, cut: 20, kick: 'dmg' }; }
function openBoutique(tab) {
  const keep = [...document.querySelectorAll('#dlg, #dlg *')].filter(el => el.scrollTop > 0).map(el => [el.id ? '#' + el.id : null, el.className, el.scrollTop]); const sameTab = (tab || 'design') === BQ.tab; BQ.tab = tab || 'design';
  setTimeout(() => { if (!sameTab) return; for (const [id, cls, top] of keep) { const el = id ? document.querySelector(id) : [...document.querySelectorAll('#dlg *')].find(x => x.className === cls && x.scrollHeight > x.clientHeight); if (el) el.scrollTop = top; } }, 0);
  const C = chemS(); BQ.r = BQ.r || bqNew(); const r = BQ.r; tab = tab || 'design';
  openDlg('Boutique Bench', `Chemist level ${chemLvl()}`); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.cssText = 'display:flex;flex-direction:column;gap:6px';
  const row = (lbl, el, note) => { const d = document.createElement('div'); d.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap'; const s = document.createElement('span'); s.textContent = lbl; s.style.cssText = 'flex:0 0 92px'; d.append(s, el); if (note) { const n = document.createElement('span'); n.className = 'meta'; n.textContent = note; d.appendChild(n); } rows.appendChild(d); return d; };
  const btn = (t, fn, on, dis) => { const b = document.createElement('button'); b.className = 'pbtn' + (on ? ' go' : ''); b.textContent = t; b.disabled = !!dis; b.addEventListener('click', fn); return b; };
  if (tab === 'design') {
    const e = bqEval(r), line = $('dlgLine');
    line.textContent = `Looks like grade ${bqGuess(e)} · +${Math.round(e.str * 100)}% ${BQ_KICK[r.kick][1]} for ${Math.round(e.sec / 60)} min · ${Math.round(e.trip * 100)}% bad trip · ${e.doses} doses a batch · sells ~${bqPriceOf(r)} CR each`;
    const nm = document.createElement('input'); nm.value = r.name; nm.maxLength = 22; nm.style.cssText = 'flex:1 1 140px;font:inherit;padding:4px 6px;background:#0c0d10;color:#f2e8d0;border:2px solid #4a5058'; nm.addEventListener('input', () => { r.name = nm.value || 'Unnamed'; });
    const cl = document.createElement('input'); cl.type = 'color'; cl.value = r.col; cl.style.cssText = 'width:40px;height:30px;border:2px solid #07060a;padding:0;background:none'; cl.addEventListener('input', () => { r.col = cl.value; bqPreview(r); });
    const nr = row('Name', nm); nr.appendChild(cl); rows.appendChild(bqPreviewEl()); bqPreview(r);
    // ingredient slots: tap to cycle through the extracts you own
    const sl = document.createElement('div'); sl.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
    for (let i = 0; i < 3; i++) { const lock = i >= chemSlots(), k = r.ing[i];
      sl.appendChild(btn(lock ? `Locked (Chemist ${i === 1 ? 3 : 6})` : k ? `${BQ_ING[k].name} (${bqHave('x_' + k)})` : 'Empty slot', () => {
        const own = [null, ...Object.keys(BQ_ING).filter(x => bqHave('x_' + x) > 0)], at = own.indexOf(r.ing[i] || null); r.ing[i] = own[(at + 1) % own.length]; r.ing = r.ing.filter((x, j) => x || j > i).slice(0, 3); openBoutique(); }, false, lock)); }
    row('Extracts', sl);
    const slider = (lbl, key) => { const s = document.createElement('input'); s.type = 'range'; s.min = 0; s.max = 100; s.value = r[key]; s.style.flex = '1 1 140px';
      const d = row(lbl, s, key === 'cut' ? `${r[key]}% filler` : bqHint(e, key)); s.addEventListener('input', () => { r[key] = +s.value; bqPreview(r); }); s.addEventListener('change', () => { openBoutique(); }); return d; };
    for (const [k, l] of BQ_SL) slider(l, k); slider('Cut', 'cut');
    const kk = document.createElement('div'); kk.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'; for (const k in BQ_KICK) kk.appendChild(btn(BQ_KICK[k][0], () => { r.kick = k; openBoutique(); }, r.kick === k)); row('Kick', kk);
    if (!r.ing.filter(Boolean).length) line.textContent = 'Put an extract in a slot first. Refine raw ingredients into extracts on the Refine tab.';
    $('dlgActs').before(rows);
    const need = r.ing.filter(Boolean), canBrew = need.length && need.every(k => bqHave('x_' + k) >= 1) && e.grade !== 'F';
    acts([[`Brew ${e.doses}`, () => bqBrew(), true, !canBrew], ['Refine', () => openBoutique('refine')], ['Recipes', () => openBoutique('book')], ['Stats', () => openBoutique('stats')], ['Close', closeDlg]]);
  } else if (tab === 'refine') {
    $('dlgLine').textContent = 'Two raw ingredients refine into one extract. Find raw ones glowing out in the worlds.';
    for (const k in BQ_ING) { const have = bqHave(k), d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:flex;align-items:center;gap:8px';
      const s = document.createElement('span'); s.style.flex = '1'; s.textContent = `${BQ_ING[k].name}: ${have} raw · ${bqHave('x_' + k)} extract`; d.append(s, btn('Refine', () => { bqTake(k, 2); bqBox()['x_' + k] = (bqBox()['x_' + k] || 0) + 1; chemS().xp += 1; SFX.coin(); markDirty(); openBoutique('refine'); }, false, have < 2)); rows.appendChild(d); }
    $('dlgActs').before(rows); acts([['Back', () => openBoutique()], ['Close', closeDlg]]);
  } else if (tab === 'book') {
    $('dlgLine').textContent = C.rec.length ? 'Your recipes. Load one to brew it again or tweak it.' : 'No saved recipes yet. Brew one and it lands here.';
    C.rec.forEach(x => { const e = bqEval(x), d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:flex;align-items:center;gap:8px';
      const sw = document.createElement('i'); sw.style.cssText = `width:14px;height:14px;background:${x.col};border:2px solid #07060a;flex:none`; const s = document.createElement('span'); s.style.flex = '1'; s.textContent = `${x.name} · ${e.grade} · sold ${C.sold[x.id] || 0} · ${bqPrice(x.id)} CR`;
      d.append(sw, s, btn('Load', () => { BQ.r = JSON.parse(JSON.stringify(x)); openBoutique(); }), btn('Forget', () => { C.rec = C.rec.filter(y => y !== x); markDirty(); openBoutique('book'); })); rows.appendChild(d); });
    $('dlgActs').before(rows); acts([['New recipe', () => { BQ.r = bqNew(); openBoutique(); }], ['Back', () => openBoutique()], ['Close', closeDlg]]);
  } else {
    const best = C.rec.map(x => [x, bqEval(x).grade, C.sold[x.id] || 0]).sort((a, b) => b[2] - a[2]), tot = Object.values(C.sold).reduce((a, n) => a + n, 0);
    $('dlgLine').textContent = `Chemist level ${chemLvl()} · ${C.xp} xp (next level at ${Math.pow(chemLvl(), 2) * 40}) · ${C.made || 0} batches brewed · ${tot} doses sold. Level 3 opens a second extract slot, level 6 a third, and every level sharpens your slider hints and raises how strong a perfect cook can get.`;
    C.earn = C.earn || {}; const tierAt = [0, 5, 20, 50, 120, 300], stars = n => { let k = 0; tierAt.forEach((t, j) => { if (n >= t && j) k = j; }); return k; };
    if (!best.length) { const d = document.createElement('div'); d.className = 'rowi'; d.textContent = 'No recipes yet. Brew one on the Design tab.'; rows.appendChild(d); }
    best.forEach(([x, g, n], rank) => { const d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:block;padding:8px 6px;line-height:1.5';
      const k = stars(n), nxt = tierAt[k + 1], e = bqEval(x);
      const top = document.createElement('div'); top.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:nowrap';
      const sw = document.createElement('i'); sw.style.cssText = `display:inline-block;width:14px;height:14px;background:${x.col};border:2px solid #07060a;flex:none`;
      const nm = document.createElement('b'); nm.style.cssText = 'flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'; nm.textContent = `${rank + 1}. ${x.name}`;
      const gr = document.createElement('b'); gr.style.cssText = `flex:none;color:${{ S: '#ffd36a', A: '#7fff6a', B: '#4fe0ff', C: '#e8e4dc', D: '#c8a080', F: '#ff5a4a' }[g]}`; gr.textContent = `Grade ${g}`;
      top.append(sw, nm, gr);
      const st = document.createElement('div'); st.style.cssText = 'color:#ffd36a;letter-spacing:2px'; st.textContent = '★'.repeat(k) + '☆'.repeat(5 - k) + `  street rep`;
      const info = document.createElement('div'); info.className = 'meta'; info.style.cssText = 'white-space:normal;text-align:left';
      info.textContent = `${n} sold · ${(C.earn[x.id] || 0).toLocaleString()} CR earned · ${bqPrice(x.id)} CR a dose now · +${Math.round(e.str * 100)}% ${BQ_KICK[x.kick][1]}${nxt ? ` · next star at ${nxt} sold` : ' · legendary'}${g === 'S' && n ? ' · word is spreading' : ''}`;
      d.append(top, st, info); rows.appendChild(d); });
    $('dlgActs').before(rows); acts([['Back', () => openBoutique()], ['Close', closeDlg]]);
  }
}
// a spinning inhaler at the bench: the liquid takes your colour, glows with the Glow it'll really have, bubbles with Potency, and clouds up when Purity is low
const BQV = {};
function bqPreviewEl() { if (!BQV.r) { const c = document.createElement('canvas'); c.width = 200; c.height = 110; c.style.cssText = 'display:block;margin:0 auto;width:200px;height:110px;image-rendering:pixelated;background:#08090c;border:2px solid #4a5058';
    BQV.r = new THREE.WebGLRenderer({ canvas: c, antialias: false }); BQV.r.setPixelRatio(1); BQV.sc = new THREE.Scene(); BQV.cam = new THREE.PerspectiveCamera(30, 200 / 110, 0.01, 5); BQV.cam.position.set(0, 0.05, 0.3); BQV.cam.lookAt(0, 0.05, 0);
    BQV.sc.add(new THREE.AmbientLight(0xffffff, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(1, 2, 2); BQV.sc.add(dl);
    const g = BQV.g = new THREE.Group(); part(g, Cy(0.018, 0.019, 0.09, 12), '#6a7078', 0, 0, 0); for (let i = 0; i < 3; i++) part(g, Cy(0.0195, 0.0195, 0.008, 12), '#3a3e46', 0, -0.02 + i * 0.016, 0);
    part(g, Cy(0.013, 0.014, 0.045, 10), '#32353c', 0, -0.018, 0.035, Math.PI / 3, 0, 0); part(g, Cy(0.023, 0.023, 0.016, 12), '#454850', 0, 0.104, 0);
    BQV.liq = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.046, 12), new THREE.MeshBasicMaterial({ color: '#c86aff', transparent: true })); BQV.liq.position.y = 0.072; g.add(BQV.liq);
    BQV.glass = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.056, 14), new THREE.MeshBasicMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.3, depthWrite: false })); BQV.glass.position.y = 0.072; g.add(BQV.glass);
    BQV.bub = []; for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 5, 4), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 })); g.add(b); BQV.bub.push(b); }
    BQV.halo = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending })); BQV.halo.position.y = 0.072; g.add(BQV.halo);
    BQV.sc.add(g); BQV.c = c; const loop = t => { if (!BQV.c.isConnected) { BQV.on = 0; return; } BQV.on = 1; const s = t / 1000, e = BQV.e || { P: 0, G: 0 };
      g.rotation.y = s * 1.2; g.rotation.z = 0.25; BQV.bub.forEach((b, i) => { const sp = 0.2 + e.P / 60, y = ((s * sp + i / 6) % 1); b.visible = i < 1 + e.P / 18; b.position.set(Math.sin(i * 2.3 + s) * 0.009, 0.05 + y * 0.044, Math.cos(i * 1.7) * 0.009); });
      BQV.halo.scale.setScalar(1 + Math.sin(s * (2 + e.G / 20)) * 0.08 * e.G / 50); BQV.r.render(BQV.sc, BQV.cam); requestAnimationFrame(loop); }; BQV.loop = loop; }
  if (!BQV.on) requestAnimationFrame(BQV.loop); return BQV.c; }
function bqPreview(r) { if (!BQV.r) return; const e = BQV.e = bqEval(r), col = new THREE.Color(r.col || '#c86aff'), hsl = {}; col.getHSL(hsl);
  BQV.liq.material.color.setHSL(hsl.h, hsl.s * (0.4 + e.U / 160), Math.min(0.85, hsl.l * (0.55 + e.G / 110))); BQV.liq.material.opacity = 0.55 + e.U / 220;
  BQV.glass.material.color.set(e.U < 30 ? '#8a8a80' : '#d8f4ff'); BQV.glass.material.opacity = e.U < 30 ? 0.55 : 0.25; BQV.halo.material.color.copy(col); BQV.halo.material.opacity = e.G / 260; }
const bqPriceOf = r => { const had = chemS().rec.find(x => x.id === r.id); if (had) return bqPrice(r.id); chemS().rec.push(r); const p = bqPrice(r.id); chemS().rec.pop(); return p; };
function bqBrew() {
  const r = BQ.r, C = chemS(), e = bqEval(r); if (e.grade === 'F') return;
  for (const k of r.ing.filter(Boolean)) { bqTake('x_' + k, 1); }
  let saved = C.rec.find(x => x.id === r.id); const same = saved && JSON.stringify(saved) === JSON.stringify(r);
  if (saved && !same) { r.id = 'bq_' + Date.now().toString(36); saved = null; } // changed settings make a new drug with its own name and reputation
  if (!saved) { C.rec.unshift(JSON.parse(JSON.stringify(r))); if (C.rec.length > 8) C.rec.length = 8; }
  bqRegister(C.rec.find(x => x.id === r.id)); invAdd(r.id, e.doses); C.made = (C.made || 0) + 1; C.xp += 5 + ['F', 'D', 'C', 'B', 'A', 'S'].indexOf(e.grade) * 3;
  SFX.level(); toast('BREWED', `${e.doses} × ${r.name} (${e.grade})`, 2.5); markDirty(); openBoutique();
}
// the bench sits in the Lab next to the house-brew console
{ const _lr = labRoom; labRoom = function (s, cx, cz, far, outer, faceIn, term, props) { _lr.apply(this, arguments);
  try { const x = cx - s.side * 0.9, z = s.z0 + 0.6; part(props, B(1.1, 0.85, 0.7), '#2a2c32', x, 0.42, z); part(props, B(1.15, 0.05, 0.75), toon('#5a5e66'), x, 0.87, z);
    for (let i = 0; i < 4; i++) part(props, Cy(0.05, 0.06, 0.2, 6), glow(['#7fffd0', '#b86aff', '#ffd36a', '#ff7ad8'][i]), x - 0.36 + i * 0.24, 1.0, z); solid(x, z, 0.55);
    INTERACTS.push({ x, z: z + 0.9, r: 1.3, label: 'Boutique Bench (design drugs)', fn: () => openBoutique() });
    const bx = x - s.side * 1.25; part(props, B(0.6, 0.5, 0.6), toon('#4a3a2a', 'bark'), bx, 0.25, z); part(props, B(0.64, 0.06, 0.64), toon('#2a2c32'), bx, 0.52, z); part(props, B(0.5, 0.03, 0.04), glow('#b86aff'), bx, 0.45, z + 0.31); solid(bx, z, 0.35);
    INTERACTS.push({ x: bx, z: z + 0.8, r: 1.0, label: 'Drug Room Box (store materials)', fn: () => openDrugBox() }); } catch (e) { console.warn('bench', e); } }; }
bqRegisterAll();
