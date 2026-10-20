// =================== BOUTIQUE DRUGS (2.21): gather, refine, and design your own ===================
// Glowing ingredients grow out in the worlds (mushrooms, rocks, beetles, salt, moss, and rare Star Nectar). Harvest them,
// refine two raw into one extract at the Boutique Bench in your Lab, then design a drug: up to three extracts, five sliders
// (Potency, Purity, Kick, Glow, Cut), a name and a liquid colour. The extracts cap how far each slider can really go,
// so the best grades need the rare stuff. Grade F won't sell; good grades build word of mouth and sell for more.
// The old Lab brews stay as the house brews. Save fields: S.chem { xp, rec: [recipe], sold: {id: n}, made }, S.gath { key: time }.
const BQ_ING = {
  glowcap: { name: 'Glowcap', col: '#7fffd0', worlds: ['earth', 'capitone', 'forestlife', 'mezar'], pot: 10, pur: 0, glow: 25, kick: 'xp', v: 18 },
  voidshard: { name: 'Void Shard', col: '#b86aff', worlds: ['moon', 'robot', 'mezar', 'zarlich'], pot: 30, pur: -10, glow: 5, kick: 'dmg', v: 24 },
  lumabug: { name: 'Luma Beetle', col: '#c8ff5a', worlds: ['ocean', 'earth', 'forestlife', 'capitone'], pot: 5, pur: 10, glow: 15, kick: 'spd', v: 20 },
  frostsalt: { name: 'Frost Salt', col: '#cfefff', worlds: ['zarlich', 'moon', 'ocean'], pot: 0, pur: 30, glow: 0, kick: 'def', v: 22 },
  nebmoss: { name: 'Nebula Moss', col: '#ff7ad8', worlds: ['capitone', 'zarlich', 'forestlife'], pot: 5, pur: 5, glow: 20, kick: 'cr', v: 22 },
  starnectar: { name: 'Star Nectar', col: '#ffd36a', worlds: [], pot: 35, pur: 30, glow: 20, kick: null, v: 90, rare: true }
};
const BQ_KICK = { dmg: ['Damage', 'damage'], spd: ['Speed', 'move speed'], def: ['Defense', 'damage taken'], xp: ['XP', 'XP'], cr: ['Credits', 'credits from kills'] };
for (const k in BQ_ING) { const I = BQ_ING[k]; ITEMS[k] = Object.assign(ITEMS[k] || {}, { name: I.name, v: I.v, col: I.col, desc: `Raw ingredient. Refine it at the Boutique Bench in your Lab.` });
  ITEMS['x_' + k] = Object.assign(ITEMS['x_' + k] || {}, { name: I.name + ' Extract', v: I.v * 3, col: I.col, desc: `Refined ${I.name}. Goes into boutique drugs.` }); }
function chemS() { S.chem = S.chem || { xp: 0, rec: [], sold: {}, made: 0 }; S.chem.rec = S.chem.rec || []; S.chem.sold = S.chem.sold || {}; return S.chem; }
const chemLvl = () => 1 + Math.floor(Math.sqrt((chemS().xp || 0) / 40));
const chemSlots = () => chemLvl() >= 6 ? 3 : chemLvl() >= 3 ? 2 : 1;
const chemCap = () => Math.min(100, 46 + chemLvl() * 6);
const BQ_GRADES = [[0.85, 'S'], [0.7, 'A'], [0.55, 'B'], [0.4, 'C'], [0.25, 'D'], [0, 'F']];
const BQ_GRADE_MULT = { S: 6, A: 3.2, B: 1.8, C: 1, D: 0.5, F: 0 };
// what a recipe actually does, from its sliders and the extracts that back them up
function bqEval(r) {
  const ing = (r.ing || []).filter(k => BQ_ING[k]), sum = s => ing.reduce((a, k) => a + BQ_ING[k][s], 0);
  const maxP = Math.min(chemCap(), 10 + sum('pot')), maxU = Math.min(chemCap(), 10 + sum('pur')), maxG = Math.min(100, 15 + sum('glow'));
  const P = Math.max(0, Math.min(r.pot, maxP)), U = Math.max(0, Math.min(r.pur, maxU)), G = Math.max(0, Math.min(r.glow, maxG)), C = r.cut;
  const fit = ing.filter(k => BQ_ING[k].kick === r.kick || BQ_ING[k].rare).length * 0.05;
  const q = Math.max(0, Math.min(1, ((P * 0.45 + U * 0.4 + G * 0.15) / 100 + fit) * (1 - C / 150)));
  const grade = BQ_GRADES.find(g => q >= g[0])[1], capK = r.kick === 'xp' || r.kick === 'cr' ? 0.6 : 0.4;
  const str = Math.round(q * capK * 100) / 100, sec = Math.round(120 + U * 2.4), trip = Math.round(P / 100 * (1 - U / 100) * 0.4 * 100) / 100;
  const doses = Math.min(8, 2 + Math.floor(C / 25) + Math.floor(chemLvl() / 5));
  return { P, U, G, C, maxP, maxU, maxG, q, grade, str, sec, trip, doses, ing };
}
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
  setInterval(() => { try { const C = chemS(); for (const r of C.rec) { const n = S.inv[r.id] || 0, was = last[r.id]; if (was != null && n < was) { const gone = was - n - (used === r.id ? 1 : 0); if (gone > 0) { C.sold[r.id] = (C.sold[r.id] || 0) + gone; C.xp += gone * (2 + ['F', 'D', 'C', 'B', 'A', 'S'].indexOf(bqEval(r).grade)); SUBS[r.id].price = bqPrice(r.id); markDirty(); } } last[r.id] = n; } used = 0; } catch (_) {} }, 1500); }

// ---- gathering: glowing nodes out in the worlds, back after 20 minutes ----
function bqNodeModel(k) { const g = new THREE.Group(), I = BQ_ING[k], gl = glow(I.col);
  if (k === 'glowcap') for (let i = 0; i < 4; i++) { const a = i * 1.7, r = i ? 0.25 : 0, h = 0.25 + (i % 2) * 0.15; part(g, Cy(0.04, 0.05, h, 6), '#e8e0c8', Math.cos(a) * r, h / 2, Math.sin(a) * r); part(g, new THREE.SphereGeometry(0.14 - i * 0.015, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), gl, Math.cos(a) * r, h, Math.sin(a) * r); }
  else if (k === 'voidshard' || k === 'frostsalt') for (let i = 0; i < 5; i++) { const a = i * 1.26, h = 0.3 + (i % 3) * 0.18; part(g, Cy(0.0, 0.09, h, 5), gl, Math.cos(a) * 0.16, h / 2, Math.sin(a) * 0.16, Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3); }
  else if (k === 'lumabug') { for (let i = 0; i < 3; i++) { const b = new THREE.Group(); part(b, B(0.12, 0.06, 0.16), toon('#2a2c20'), 0, 0, 0); part(b, B(0.1, 0.04, 0.06), gl, 0, 0, -0.08); b.position.set((i - 1) * 0.3, 0.35 + i * 0.1, 0); g.add(b); } part(g, Cy(0.05, 0.08, 0.3, 6), toon('#4a3a2a', 'bark'), 0, 0.15, 0); }
  else if (k === 'nebmoss') for (let i = 0; i < 6; i++) part(g, new THREE.SphereGeometry(0.12, 6, 4), gl, Math.cos(i) * 0.25, 0.06, Math.sin(i * 1.3) * 0.25);
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
function bqNew() { return { id: 'bq_' + Date.now().toString(36), name: 'House Special', col: '#c86aff', ing: [], pot: 40, pur: 40, glow: 30, cut: 20, kick: 'dmg' }; }
function openBoutique(tab) {
  const C = chemS(); BQ.r = BQ.r || bqNew(); const r = BQ.r; tab = tab || 'design';
  openDlg('Boutique Bench', `Chemist level ${chemLvl()}`); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.cssText = 'display:flex;flex-direction:column;gap:6px';
  const row = (lbl, el, note) => { const d = document.createElement('div'); d.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap'; const s = document.createElement('span'); s.textContent = lbl; s.style.cssText = 'flex:0 0 92px'; d.append(s, el); if (note) { const n = document.createElement('span'); n.className = 'meta'; n.textContent = note; d.appendChild(n); } rows.appendChild(d); return d; };
  const btn = (t, fn, on, dis) => { const b = document.createElement('button'); b.className = 'pbtn' + (on ? ' go' : ''); b.textContent = t; b.disabled = !!dis; b.addEventListener('click', fn); return b; };
  if (tab === 'design') {
    const e = bqEval(r), line = $('dlgLine');
    line.textContent = `Grade ${e.grade} · +${Math.round(e.str * 100)}% ${BQ_KICK[r.kick][1]} for ${Math.round(e.sec / 60)} min · ${Math.round(e.trip * 100)}% bad trip · ${e.doses} doses a batch · sells ~${bqPriceOf(r)} CR each`;
    const nm = document.createElement('input'); nm.value = r.name; nm.maxLength = 22; nm.style.cssText = 'flex:1 1 140px;font:inherit;padding:4px 6px;background:#0c0d10;color:#f2e8d0;border:2px solid #4a5058'; nm.addEventListener('input', () => { r.name = nm.value || 'Unnamed'; });
    const cl = document.createElement('input'); cl.type = 'color'; cl.value = r.col; cl.style.cssText = 'width:40px;height:30px;border:2px solid #07060a;padding:0;background:none'; cl.addEventListener('input', () => { r.col = cl.value; });
    const nr = row('Name', nm); nr.appendChild(cl);
    // ingredient slots: tap to cycle through the extracts you own
    const sl = document.createElement('div'); sl.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
    for (let i = 0; i < 3; i++) { const lock = i >= chemSlots(), k = r.ing[i];
      sl.appendChild(btn(lock ? `Locked (Chemist ${i === 1 ? 3 : 6})` : k ? `${BQ_ING[k].name} (${S.inv['x_' + k] || 0})` : 'Empty slot', () => {
        const own = [null, ...Object.keys(BQ_ING).filter(x => (S.inv['x_' + x] || 0) > 0)], at = own.indexOf(r.ing[i] || null); r.ing[i] = own[(at + 1) % own.length]; r.ing = r.ing.filter((x, j) => x || j > i).slice(0, 3); openBoutique(); }, false, lock)); }
    row('Extracts', sl);
    const slider = (lbl, key, max, cap) => { const s = document.createElement('input'); s.type = 'range'; s.min = 0; s.max = 100; s.value = r[key]; s.style.flex = '1 1 140px';
      const d = row(lbl, s, cap != null ? `real ${Math.round(Math.min(r[key], cap))} / cap ${Math.round(cap)}` : `${r[key]}`); s.addEventListener('change', () => { r[key] = +s.value; openBoutique(); }); return d; };
    slider('Potency', 'pot', 100, e.maxP); slider('Purity', 'pur', 100, e.maxU); slider('Glow', 'glow', 100, e.maxG); slider('Cut', 'cut', 100, null);
    const kk = document.createElement('div'); kk.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'; for (const k in BQ_KICK) kk.appendChild(btn(BQ_KICK[k][0], () => { r.kick = k; openBoutique(); }, r.kick === k)); row('Kick', kk);
    $('dlgActs').before(rows);
    const need = r.ing.filter(Boolean), canBrew = need.length && need.every(k => (S.inv['x_' + k] || 0) >= 1) && e.grade !== 'F';
    acts([[`Brew ${e.doses}`, () => bqBrew(), true, !canBrew], ['Refine', () => openBoutique('refine')], ['Recipes', () => openBoutique('book')], ['Stats', () => openBoutique('stats')], ['Close', closeDlg]]);
  } else if (tab === 'refine') {
    $('dlgLine').textContent = 'Two raw ingredients refine into one extract. Find raw ones glowing out in the worlds.';
    for (const k in BQ_ING) { const have = S.inv[k] || 0, d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:flex;align-items:center;gap:8px';
      const s = document.createElement('span'); s.style.flex = '1'; s.textContent = `${BQ_ING[k].name}: ${have} raw · ${S.inv['x_' + k] || 0} extract`; d.append(s, btn('Refine', () => { S.inv[k] -= 2; if (!S.inv[k]) delete S.inv[k]; invAdd('x_' + k, 1); chemS().xp += 1; SFX.coin(); markDirty(); openBoutique('refine'); }, false, have < 2)); rows.appendChild(d); }
    $('dlgActs').before(rows); acts([['Back', () => openBoutique()], ['Close', closeDlg]]);
  } else if (tab === 'book') {
    $('dlgLine').textContent = C.rec.length ? 'Your recipes. Load one to brew it again or tweak it.' : 'No saved recipes yet. Brew one and it lands here.';
    C.rec.forEach(x => { const e = bqEval(x), d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:flex;align-items:center;gap:8px';
      const sw = document.createElement('i'); sw.style.cssText = `width:14px;height:14px;background:${x.col};border:2px solid #07060a;flex:none`; const s = document.createElement('span'); s.style.flex = '1'; s.textContent = `${x.name} · ${e.grade} · sold ${C.sold[x.id] || 0} · ${bqPrice(x.id)} CR`;
      d.append(sw, s, btn('Load', () => { BQ.r = JSON.parse(JSON.stringify(x)); openBoutique(); }), btn('Forget', () => { C.rec = C.rec.filter(y => y !== x); markDirty(); openBoutique('book'); })); rows.appendChild(d); });
    $('dlgActs').before(rows); acts([['New recipe', () => { BQ.r = bqNew(); openBoutique(); }], ['Back', () => openBoutique()], ['Close', closeDlg]]);
  } else {
    const best = C.rec.map(x => [x, bqEval(x).grade, C.sold[x.id] || 0]).sort((a, b) => b[2] - a[2]), tot = Object.values(C.sold).reduce((a, n) => a + n, 0);
    $('dlgLine').textContent = `Chemist level ${chemLvl()} · ${C.xp} xp (next level at ${Math.pow(chemLvl(), 2) * 40}) · ${C.made || 0} batches brewed · ${tot} doses sold. Level 3 opens a second extract slot, level 6 a third, and every level raises how far Potency and Purity can go.`;
    best.forEach(([x, g, n]) => { const d = document.createElement('div'); d.className = 'rowi'; d.textContent = `${x.name} · grade ${g} · ${n} sold · now ${bqPrice(x.id)} CR a dose${g === 'S' && n ? ' · word is spreading' : ''}`; rows.appendChild(d); });
    $('dlgActs').before(rows); acts([['Back', () => openBoutique()], ['Close', closeDlg]]);
  }
}
const bqPriceOf = r => { const had = chemS().rec.find(x => x.id === r.id); if (had) return bqPrice(r.id); chemS().rec.push(r); const p = bqPrice(r.id); chemS().rec.pop(); return p; };
function bqBrew() {
  const r = BQ.r, C = chemS(), e = bqEval(r); if (e.grade === 'F') return;
  for (const k of r.ing.filter(Boolean)) { S.inv['x_' + k]--; if (!S.inv['x_' + k]) delete S.inv['x_' + k]; }
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
    INTERACTS.push({ x, z: z + 0.9, r: 1.3, label: 'Boutique Bench (design drugs)', fn: () => openBoutique() }); } catch (e) { console.warn('bench', e); } }; }
bqRegisterAll();
