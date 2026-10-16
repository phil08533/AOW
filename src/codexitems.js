// =================== CODEX: ITEMS — every item in the game, and who to kill (or pay) to get it ===================
// A Codex tab listing everything you can own: loot (ITEMS), guns and staffs (GUNS), melee (MELEE), ordnance (ORD), armor, helmets
// and capes (ARMORS / HELMS / CAPES), master gear (GEAR) and fishing rods (RODS). Where each one comes from is worked out at runtime
// from the real tables: enemy drops (ENEMY[t].drops) and where those enemies spawn (LEVELS spawns, boarding hulks, Zeltac floors),
// vendors (NPC shop lists, RAID_SHOP, BM_STOCK, MCK_MENU, SUBS), quest rewards (QDEFS reward / onStart / grant), Hunter ranks
// (BH_RANKS), fishing tables (FISH_TABLES + the spot names in the source) and wardrobe unlock rules. A few sources that only exist as
// code (space mining, raid tokens, ship garden...) are listed in CXI_HINTS below, each checked against the code it names.
// Discovery: S.seen = { 'i:pelt': 1, 'g:b5': 1, ... } (created on first use, so old saves load). Undiscovered entries show "???" but
// still say where to get them. S.inv is wrapped so every write that raises a count marks the item seen, from any source;
// a once-a-second sweep also marks guns, melee, gear, rods, wardrobe unlocks, the stash and the fish log.
const CXI = { q: '', cat: 'all', live: false, src: null, srcT: 0, spots: null };
const CXI_CATS = [['gun', 'Guns'], ['staff', 'Staffs & magic'], ['melee', 'Melee'], ['ord', 'Ordnance'], ['armor', 'Armor'], ['helm', 'Helmets'], ['cape', 'Capes'], ['gear', 'Master gear'],
  ['rod', 'Fishing rods'], ['fish', 'Fish'], ['med', 'Medical, food & substances'], ['mat', 'Materials & salvage'], ['val', 'Valuables & contraband'], ['quest', 'Quest items'], ['misc', 'Tokens & junk']];
const CXI_SVG = {
  armor: '<path d="M7 3l5 2 5-2 4 3-2 5h-2v10H7V11H5L3 6z"/>',
  helm: '<path d="M4 14a8 8 0 0 1 16 0v4H4z"/><rect x="7" y="12" width="10" height="3" rx="1" fill="#0b0d10"/>',
  cape: '<path d="M8 3h8l1 3 3 15-8-3-8 3 3-15z"/>',
  gear: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="12" cy="5" r="2.5"/>',
  rod: '<path d="M3 21L19 3l1.5 1.5L4.5 22z"/><path d="M19 4v10a2 2 0 1 1-2 0" fill="none" stroke="currentColor" stroke-width="1.5"/>'
};
const cxiIcon = (icon, col) => `<svg viewBox="0 0 24 24" class="ii cxiI" style="color:${col}" fill="currentColor" aria-hidden="true">${CXI_SVG[icon] || INV_SVG[icon] || INV_SVG.box}</svg>`;
const cxiEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---- sources that exist only as code, not as a table (each one checked against the file it names) ----
const CXI_HINTS = {
  'i:medkit': [['drop', 'Any enemy (8% chance)'], ['other', 'Ship garden harvest'], ['other', 'Boarding: ship holds (30% chance)']], // game.src.html kill(), levels.js garden, boarding.js boardLoot
  'i:ore': [['other', 'Space: shoot asteroids'], ['other', 'Boarding: every ship hold'], ['other', 'Ship salvage']], // space.js rocks, boarding.js, shipmods.js
  'i:scrap': [['other', 'Boarding: every ship hold'], ['other', 'Ship salvage']],
  'i:starcrystal': [['other', 'Space: golden asteroids (and 1 in 10 of the rest)']], // space.js
  'i:raiderchip': [['drop', 'Space raider ships (50%)']], 'i:circuit': [['drop', 'Space raider ships (40%)']], // space.js killRaider
  'i:raidtoken': [['other', 'Raids: 1 per raider, 10 per raid boss'], ['other', 'Daily challenges: 3 each']], // raids.js, progress.js dailyTick
  'i:fleetcode': [['other', 'Boarding: Drome Cutter holds, while a quest needs it']], // boarding.js
  'i:voidshard': [['drop', 'The Greater Maw, through the wormhole (10 first time, then 4)']], // finale.js
  'x:shockgloves': [['buy', 'Comes with the Electric Nunchucks']], // openGuns in game.src.html
  'f:racerCape': [['other', 'Gold on every race course (Speedway)']], 'f:swiftchamp': [['other', "Clear Promoter Swift's boss rush"]], 'f:ascendCape': [['other', 'Ascend to New Game+']]
};
// enemies spawned by code instead of a spawn table
const CXI_ENEMY_WHERE = { scavenger: 'wanders outside the cities', drifter: 'wanders outside the cities', mhunter: 'Marshal hunters, when you have a bounty' }; // outlaw.js

// ---- what gives what: read reward / buy functions without running them ----
function cxiGives(fn) {
  const s = typeof fn === 'function' ? String(fn) : '', out = []; if (!s) return out; let m;
  const rx = [[/S\.inv\.(\w+)\s*=/g, 'i'], [/S\.inv\[['"](\w+)['"]\]\s*=/g, 'i'], [/giveGun\(['"](\w+)['"]/g, 'g'], [/S\.guns\.push\(['"](\w+)['"]/g, 'g'], [/S\.gear\.push\(['"](\w+)['"]/g, 'x'],
    [/flags\.(\w+)\s*=\s*true/g, 'f'], [/flags\[['"](\w+)['"]\]\s*=\s*true/g, 'f'], [/S\.rod\s*=\s*(\d)/g, 'r']];
  for (const [r, k] of rx) while ((m = r.exec(s))) out.push(k + ':' + m[1]);
  return [...new Set(out)];
}
const cxiFlagKeys = f => { const o = []; for (const [T, p] of [[ARMORS, 'a'], [CAPES, 'c'], [HELMS, 'h']]) for (const id in T) if (T[id].flag === f) o.push(p + ':' + id); return o; };
const cxiLv = id => (LEVELS[id] && LEVELS[id].name) || id;
function cxiSpots() { // fishing spot names, read from the game's own source: fishSpot('North Dock', 'sea', ...) and add('Crystal Lake', 'lake', ...)
  if (CXI.spots) return CXI.spots; const o = {};
  try { const txt = [...document.scripts].map(s => s.textContent).join('\n'), rx = /(?:\badd|\bfishSpot)\('([^']+)', '([a-z]+)'/g; let m; while ((m = rx.exec(txt))) { (o[m[2]] = o[m[2]] || new Set()).add(m[1]); } } catch (_) {}
  return (CXI.spots = o);
}

// ---- every entry: key, category, name, color, icon, value and a short description ----
function cxiEntries() {
  const E = [], add = (key, cat, name, col, icon, v, desc) => E.push({ key, cat, name, col: col || '#9aa1aa', icon, v, desc });
  for (const id in GUNS) { const g = GUNS[id], m = invMeta('g:' + id); add('g:' + id, g.mana ? 'staff' : 'gun', g.name, g.col || '#e08a2e', m.icon, g.price || 0, `${g.dmg} damage${g.splash ? ' · splash' : ''}${g.pellets ? ' · ' + g.pellets + ' pellets' : ''}${g.mana ? ' · ' + (g.elem || 'magic') + ' · uses mana' : ` · ${g.mag}-round mag`} · needs Lv ${g.req || 1}`); }
  for (const id in MELEE) { const M = MELEE[id], m = invMeta('m:' + id); add('m:' + id, 'melee', M.name, M.col || '#cfd4dc', m.icon, M.price || 0, `${M.dmg} damage melee · reach ${M.reach}${M.saber ? ' · saber' : ''}${M.poison ? ' · poison' : ''} · needs Lv ${M.req || 1}`); }
  for (const id in ORD) { const O = ORD[id]; add('o:' + id, 'ord', O.name, O.col, 'grenade', 0, `${O.desc}. ${O.dmg} damage, recharges on its own.`); }
  for (const id in ARMORS) { const A = ARMORS[id]; add('a:' + id, 'armor', A.name, A.visor || A.trim, 'armor', A.cost || 0, `${A.def ? `Take ${Math.round(A.def * 100)}% less damage` : 'Standard issue'}${A.note ? ' · ' + A.note : ''}`); }
  for (const id in HELMS) { if (id === 'face') continue; add('h:' + id, 'helm', HELMS[id].name, HELMS[id].col || '#c9d0da', 'helm', 0, 'Helmet, worn from the Wardrobe'); }
  for (const id in CAPES) { if (id === 'none') continue; const C = CAPES[id]; add('c:' + id, 'cape', C.name, C.col || '#b3262c', 'cape', 0, 'Cape, worn from the Wardrobe'); }
  for (const id in GEAR) { const G = GEAR[id]; add('x:' + id, 'gear', G.name, G.col, 'gear', 0, G.desc); }
  for (const t in RODS) { const R = RODS[t]; add('r:' + t, 'rod', R.name, '#c9a43a', 'rod', R.price || 0, `Catch window ×${R.zone}, rare fish ×${R.rare}`); }
  for (const id in ITEMS) { if (id.startsWith('__')) continue; const I = ITEMS[id], m = invMeta('i:' + id);
    const cat = I.fish ? 'fish' : I.quest ? 'quest' : m.cat === 'wpn' ? 'misc' : m.cat; let desc = I.desc || '';
    if (!desc) desc = I.quest ? 'Quest item' : I.fish ? ((I.v || 0) <= 2 ? 'Junk from the water' : `Fish · fish buyers pay ${I.v} cr`) : I.use && I.heal ? `Heals ${I.heal >= 9999 ? 'fully' : I.heal}` : id === 'medkit' ? 'Heals 50' : ({ build: 'Building material', upgrade: 'Upgrade material', salvage: 'Salvage to sell or craft with', loot: 'High-value loot', token: 'Token', junk: 'Junk' })[m.sub] || 'Loot';
    add('i:' + id, cat, I.name, I.col, m.icon, I.quest ? 0 : sellPrice(id), desc); }
  return E;
}

// ---- where everything comes from ----
function cxiSources() {
  if (CXI.src && performance.now() - CXI.srcT < 5000) return CXI.src;
  const src = {}, flagSrc = {}, put = (key, kind, text) => { const a = src[key] = src[key] || []; if (!a.some(x => x[0] === kind && x[1] === text)) a.push([kind, text]); };
  const give = (keys, kind, text) => keys.forEach(k => { if (k.startsWith('f:')) (flagSrc[k] = flagSrc[k] || []).push([kind, text]); else put(k, kind, text); });
  // where each enemy lives
  const where = {}, at = (t, w) => { if (t && ENEMY[t]) (where[t] = where[t] || new Set()).add(w); };
  for (const id in LEVELS) for (const sp of LEVELS[id].spawns || []) at(sp.type, cxiLv(id));
  try { for (const k in HULK_TYPES) { const H = HULK_TYPES[k]; for (const lv of [1, 10, 14, 18, 20, 28, 40]) { (H.crew(lv) || []).forEach(t => at(t, 'boarding a ' + H.name)); at(H.boss(lv), 'boarding a ' + H.name); } } } catch (_) {}
  try { for (let n = 1; n <= ZTOP; n++) { const th = typeof zTheme === 'function' ? zTheme(n) : ZLIST[n]; (zSpawns(n, th) || []).forEach(sp => at(sp.type, 'Zeltac ' + zFloorName(n))); } } catch (_) {}
  for (const t in CXI_ENEMY_WHERE) at(t, CXI_ENEMY_WHERE[t]);
  for (const id in QDEFS) for (const o of QDEFS[id].obj || []) if (o.kind === 'kill' && ENEMY[o.t] && !where[o.t]) at(o.t, (o.planet ? cxiLv(o.planet) + ', ' : '') + 'quest ' + QDEFS[id].title);
  const placeOf = t => { const w = [...(where[t] || [])]; return w.length ? ` (${w.slice(0, 3).join(', ')}${w.length > 3 ? ` +${w.length - 3} more` : ''})` : ''; };
  // enemy drops, best chance first
  const drops = {}; for (const t in ENEMY) { const d = ENEMY[t]; for (const [id, ch] of d.drops || []) (drops[id] = drops[id] || []).push([ch, `${d.name}${d.boss ? ' ★' : ''}${placeOf(t)} ${Math.round(ch * 100)}%`]); }
  for (const id in drops) drops[id].sort((a, b) => b[0] - a[0]).forEach(([, txt]) => put('i:' + id, 'drop', txt));
  // quests
  for (const id in QDEFS) { const q = QDEFS[id], r = q.reward || {}, who = npcName(q.giver || q.turnIn || ''), txt = `${q.title}${who && who !== q.giver && who !== q.turnIn ? ' · ' + who : ''}`;
    for (const k in r.items || {}) put('i:' + k, 'quest', txt); if (r.gun) put('g:' + r.gun, 'quest', txt); if (r.melee) put('m:' + r.melee, 'quest', txt); if (r.gear) put('x:' + r.gear, 'quest', txt);
    if (r.cape) give(['f:' + r.cape], 'quest', txt); give(cxiGives(r.fn).concat(cxiGives(q.onStart)), 'quest', txt);
    if (q.grant) put('i:' + q.grant, 'other', `Found: starts the quest ${q.title}`); }
  // vendors on every world
  const raidNpcs = [], bmNpcs = [], tailors = [];
  for (const L in LEVELS) for (const n of LEVELS[L].npcs || []) { const here = `${n.name}, ${cxiLv(L)}`;
    if (n.shop === 'guns') { (n.guns || []).forEach(g => GUNS[g] && put('g:' + g, 'buy', `${here} · ${GUNS[g].price ? GUNS[g].price.toLocaleString() + ' cr' : 'free'}`)); (n.melee || []).forEach(m => MELEE[m] && put('m:' + m, 'buy', `${here} · ${MELEE[m].price ? MELEE[m].price.toLocaleString() + ' cr' : 'free'}`)); }
    if (n.shop === 'store') { put('i:medkit', 'buy', `${here} · 25 cr`); try { for (const s in SUBS) if (SUBS[s].legal) put('i:' + s, 'buy', `${here} · ${SUBS[s].price} cr (Substances on)`); } catch (_) {} }
    if (n.shop === 'fish') (n.rods || []).forEach(t => RODS[t] && put('r:' + t, 'buy', `${here} · ${RODS[t].price.toLocaleString()} cr`));
    for (const [label] of n.custom || []) { if (/^Raids$/.test(label)) raidNpcs.push(here); if (/black market/i.test(label)) bmNpcs.push(here); if (/wardrobe/i.test(label)) tailors.push(n.name); } }
  try { for (const [label, cost, fn] of RAID_SHOP) give(cxiGives(fn), 'buy', `Raid token shop${raidNpcs.length ? ' (' + raidNpcs.join(', ') + ')' : ''} · ${cost} Raid Tokens`); } catch (_) {}
  try { for (const it of BM_STOCK) { const g = cxiGives(it.buy); if (!g.length && it.id) g.push(ITEMS[it.id] ? 'i:' + it.id : GEAR[it.id] ? 'x:' + it.id : 'f:' + it.id); give(g, 'buy', `Black market${bmNpcs.length ? ' · ' + bmNpcs.join(', ') : ''} · ${it.price.toLocaleString()} cr`); } } catch (_) {}
  try { const ow = typeof OUT_WORLDS !== 'undefined' ? OUT_WORLDS.length : 0; for (const [k, p] of MCK_MENU) put('i:' + k, 'buy', `McKlunkies${ow ? ` (on ${ow} worlds)` : ''} · ${p} cr`); for (const k of MCK_SUBS) put('i:' + k, 'buy', `McKlunkies back counter · ${SUBS[k].price} cr (Substances on)`); } catch (_) {}
  try { for (const s in SUBS) if (SUBS[s].lab) put('i:' + s, 'craft', 'Brewed in the Lab (ship room)'); } catch (_) {}
  try { if (typeof CONTRA !== 'undefined' && HULK_TYPES.trader) CONTRA.forEach(k => put('i:' + k, 'other', `Boarding: ${HULK_TYPES.trader.name} holds`)); } catch (_) {}
  // Hunter ranks
  try { BH_RANKS.forEach((R, i) => { const g = R.gift; if (!g) return; const k = GEAR[g] ? 'x:' + g : GUNS[g] ? 'g:' + g : MELEE[g] ? 'm:' + g : 'f:' + g; give([k], 'quest', `Bounty Hunter rank ${i + 1} · ${R.name}`); }); } catch (_) {}
  // fishing
  const spots = cxiSpots();
  const fishAt = {}; // fish id → "world · rarity" → spot names, so one world reads as one line
  for (const t in FISH_TABLES) { if (t === 'wormhole') continue; const world = (typeof FISH_WATER !== 'undefined' && FISH_WATER[t] || '').split(' · ')[1] || '', names = spots[t] ? [...spots[t]] : [t];
    for (const [id] of FISH_TABLES[t]) { let rar = ''; try { rar = FISH_RARITY[fishRarity(id, t)][0]; } catch (_) {} const g = (fishAt[id] = fishAt[id] || {}), k = [world, rar].filter(Boolean).join(' · '); (g[k] = g[k] || new Set()); names.forEach(n => g[k].add(n)); } }
  for (const id in fishAt) for (const k in fishAt[id]) put('i:' + id, 'fish', `${[...fishAt[id][k]].join(' / ')}${k ? ' (' + k + ')' : ''}`);
  // the wardrobe and ordnance unlock rules
  for (const [T, p] of [[ARMORS, 'a'], [CAPES, 'c'], [HELMS, 'h']]) for (const id in T) { const it = T[id], k = p + ':' + id;
    if (it.cost) put(k, 'buy', `Wardrobe${tailors.length ? ' (' + tailors.join(', ') + ', or from your bag)' : ''} · ${it.cost.toLocaleString()} cr, Lv ${it.lvl}+`);
    if (it.q && QDEFS[it.q]) put(k, 'quest', `Finish ${QDEFS[it.q].title}`);
    if (it.gear && GEAR[it.gear]) put(k, 'other', `Comes with ${GEAR[it.gear].name}`);
    if (it.flag) (flagSrc['f:' + it.flag] || CXI_HINTS['f:' + it.flag] || []).forEach(([kind, txt]) => put(k, kind, txt));
    if (!it.cost && !it.q && !it.gear && !it.flag) put(k, 'unlock', it.lvl > 1 ? `Unlocks at Level ${it.lvl}` : 'You start with it');
    else if (it.lvl > 1 && !it.cost) put(k, 'unlock', `Needs Level ${it.lvl}`); }
  for (const id in ORD) put('o:' + id, 'unlock', ORD[id].lvl > 1 ? `Unlocks at Level ${ORD[id].lvl}` : 'You start with it');
  for (const k of ['g:' + (fresh().guns || [])[0], 'm:knife']) put(k, 'unlock', 'You start with it');
  for (const k in CXI_HINTS) if (!k.startsWith('f:')) CXI_HINTS[k].forEach(([kind, txt]) => put(k, kind, txt));
  // quest items you pick up in the world
  for (const id in QDEFS) for (const o of QDEFS[id].obj || []) if (o.kind === 'item' && ITEMS[o.t] && !src['i:' + o.t]) put('i:' + o.t, 'other', `Found during ${QDEFS[id].title}: ${o.text}`);
  CXI.srcT = performance.now(); return (CXI.src = src);
}
const CXI_KIND = { drop: 'Dropped by', buy: 'Sold by', quest: 'Reward', fish: 'Fished at', craft: 'Made', unlock: 'Unlock', other: 'Found' };

// ---- discovery ----
function cxiSeen() { if (!S.seen || typeof S.seen !== 'object') S.seen = {}; return S.seen; }
function cxiMark(key) { const s = cxiSeen(); if (s[key]) return false; s[key] = Date.now(); return true; }
function cxiWrapInv() { // every write that raises an item count marks it seen, whatever code did it
  if (!S.inv || S.inv.__cxi) return; const raw = S.inv;
  try { S.inv = new Proxy(raw, { get: (t, k) => k === '__cxi' ? true : t[k], set: (t, k, v) => { try { if (typeof k === 'string' && typeof v === 'number' && v > (t[k] || 0) && ITEMS[k]) cxiMark('i:' + k); } catch (_) {} t[k] = v; return true; } }); } catch (_) {}
}
function cxiSweep() {
  try { cxiWrapInv(); let n = 0; const m = k => { if (cxiMark(k)) n++; };
    for (const k in S.inv) if (S.inv[k] > 0 && ITEMS[k]) m('i:' + k); for (const k in S.stash || {}) if (S.stash[k] > 0 && ITEMS[k]) m('i:' + k); for (const k in S.fishLog || {}) if (ITEMS[k]) m('i:' + k);
    (S.guns || []).forEach(g => GUNS[g] && m('g:' + g)); (S.melees || ['knife']).forEach(k => MELEE[k] && m('m:' + k)); (S.gear || []).forEach(k => GEAR[k] && m('x:' + k));
    for (let t = 1; t <= (S.rod || 0); t++) if (RODS[t]) m('r:' + t); for (const id in ORD) if (S.lvl >= ORD[id].lvl) m('o:' + id);
    for (const [T, p] of [[ARMORS, 'a'], [CAPES, 'c'], [HELMS, 'h']]) for (const id in T) if (lookUnlocked(T, id)) m(p + ':' + id);
    if (n) markDirty(); return n; } catch (_) { return 0; }
}
{ const _ad = adopt; adopt = function () { const r = _ad.apply(this, arguments); cxiWrapInv(); cxiSweep(); return r; }; }
setInterval(() => { if (typeof state !== 'undefined' && state === 'play') cxiSweep(); }, 1000);

// ---- the tab ----
function cxiCss() { if ($('cxiCss')) return; const st = document.createElement('style'); st.id = 'cxiCss'; st.textContent = `
#cxiBar{display:flex;gap:6px;margin:6px 0 2px;flex-wrap:wrap}#cxiBar input,#cxiBar select{flex:1 1 140px;min-width:0;font:inherit;font-size:15px;padding:6px 8px;background:rgba(6,10,46,.55);color:var(--text);border:1px solid rgba(232,236,248,.45);border-radius:3px}
#cxiBar select{flex:0 1 210px}#cxiBar option{background:#0b0e2a;color:#e8ecf8}
.cxiR{display:grid!important;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;padding:5px 2px;border-bottom:1px solid rgba(232,236,248,.15);min-height:44px;flex-shrink:0}
.cxiR .ii{width:30px;height:30px;display:block}.cxiR.lock .ii{color:#2c313a!important;filter:drop-shadow(0 0 1px rgba(232,236,248,.35))}
.cxiR b{font-size:15px}.cxiR.lock b{color:var(--dim);letter-spacing:.12em}.cxiR small{display:block;color:var(--dim);font-size:12.5px;line-height:1.35}.cxiR .src{display:block;color:#cfe6ff}.cxiR .src i{font-style:normal;color:#ffd36a}
.cxiR .v{font-family:var(--num);font-size:15px;color:var(--dim);white-space:nowrap;text-align:right}
.cxiH{margin:10px 0 2px;color:#ffd36a;font-weight:bold;display:flex;justify-content:space-between;gap:8px;flex-shrink:0}.cxiH span{color:var(--dim);font-weight:normal;font-family:var(--num)}
.cxiN{color:var(--dim);padding:10px 2px;flex-shrink:0}
`; document.head.appendChild(st); }
function cxiSrcHtml(list) {
  if (!list || !list.length) return '<span class="src"><i>Found:</i> unknown yet</span>';
  const by = {}; for (const [k, t] of list) (by[k] = by[k] || []).push(t);
  return Object.keys(CXI_KIND).filter(k => by[k]).map(k => { const a = by[k], more = a.length > 4 ? ` +${a.length - 4} more` : ''; return `<span class="src"><i>${CXI_KIND[k]}:</i> ${cxiEsc(a.slice(0, 4).join(', ') + more)}</span>`; }).join('');
}
function openCodexItems() {
  cxiCss(); cxiSweep(); openDlg('Codex', 'Items');
  const E = cxiEntries(), SRC = cxiSources(), seen = cxiSeen(), got = e => !!seen[e.key];
  const total = E.length, found = E.filter(got).length, known = E.filter(e => (SRC[e.key] || []).length).length;
  $('dlgLine').textContent = `Items found: ${found} / ${total}. Locked ones still say where to get them.`;
  const bar = document.createElement('div'); bar.id = 'cxiBar'; bar.className = 'prevWrap'; // prevWrap: the sheet removes it when it closes or switches
  const inp = document.createElement('input'); inp.type = 'search'; inp.placeholder = 'Search items, enemies, worlds'; inp.value = CXI.q; inp.setAttribute('aria-label', 'Search items');
  const sel = document.createElement('select'); sel.setAttribute('aria-label', 'Category');
  const cnt = c => { const L = E.filter(e => e.cat === c); return [L.filter(got).length, L.length]; };
  sel.innerHTML = `<option value="all">All · ${found} / ${total}</option>` + CXI_CATS.filter(([c]) => E.some(e => e.cat === c)).map(([c, l]) => { const [a, b] = cnt(c); return `<option value="${c}">${l} · ${a} / ${b}</option>`; }).join('');
  sel.value = CXI_CATS.some(([c]) => c === CXI.cat) ? CXI.cat : 'all';
  bar.append(inp, sel);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '52vh'; rows.style.overflowY = 'auto';
  const render = () => {
    const q = CXI.q.trim().toLowerCase(); rows.textContent = ''; let shown = 0;
    for (const [c, label] of CXI_CATS) { if (CXI.cat !== 'all' && CXI.cat !== c) continue;
      const L = E.filter(e => e.cat === c && (!q || (got(e) ? e.name + ' ' + e.desc : '').toLowerCase().includes(q) || (SRC[e.key] || []).some(s => s[1].toLowerCase().includes(q))));
      if (!L.length) continue; const [a, b] = cnt(c);
      const h = document.createElement('div'); h.className = 'cxiH'; h.innerHTML = `${cxiEsc(label)}<span>${a} / ${b}</span>`; rows.appendChild(h);
      L.sort((x, y) => (got(y) - got(x)) || 0);
      for (const e of L) { const d = got(e), r = document.createElement('div'); r.className = 'cxiR' + (d ? '' : ' lock'); r.dataset.k = e.key;
        r.innerHTML = `${cxiIcon(e.icon, e.col)}<span><b>${d ? cxiEsc(e.name) : '???'}</b>${d ? `<small>${cxiEsc(e.desc)}</small>` : ''}<small>${cxiSrcHtml(SRC[e.key])}</small></span><span class="v">${d && e.v ? e.v.toLocaleString() + ' cr' : ''}</span>`;
        rows.appendChild(r); shown++; } }
    if (!shown) { const n = document.createElement('div'); n.className = 'cxiN'; n.textContent = 'Nothing matches that search.'; rows.appendChild(n); }
    try { PG.page = 0; } catch (_) {}
  };
  inp.addEventListener('input', () => { CXI.q = inp.value; render(); }); inp.addEventListener('keydown', e => e.stopPropagation());
  sel.addEventListener('change', () => { CXI.cat = sel.value; SFX.ui(); render(); });
  $('dlgActs').before(bar); $('dlgActs').before(rows); render();
  acts([['Back to Codex', () => openCodex('ach'), true], ['Close', closeDlg]]);
  CXI.stats = { total, found, known };
}
{ const _oc = openCodex; openCodex = function (tab) {
  if (tab === 'items') return openCodexItems();
  const r = _oc.apply(this, arguments);
  try { const a = $('dlgActs'), kids = [...a.children], best = kids.find(b => b.textContent === 'Bestiary'); const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Items';
    b.addEventListener('click', () => { SFX.ui(); openCodex('items'); }); a.insertBefore(b, best ? best.nextSibling : a.firstChild); } catch (_) {}
  return r; }; }
