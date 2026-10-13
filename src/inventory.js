// =================== INVENTORY 2: a proper backpack screen ===================
// Same save data as before: S.inv (item → count), S.guns / S.slots / S.melee / S.melees (weapons), S.look.a (armor), S.ord (ordnance).
// New, optional save fields (old saves just start empty): S.invOrder (your grid layout), S.invT (when each item was picked up), S.quick (4 quick-slot references).
const INV_CFG = { cap: 60, quick: 4, quickKeys: ['Digit4', 'Digit5', 'Digit6', 'Digit7'] };
const INVUI = { open: false, el: null, cat: 'all', sub: null, sort: 'manual', q: '', sel: null, move: null, drag: null, busy: 0, tab: 'bag', raf: 0, full: 0 };
const RARITY = { common: ['Common', '#8a9099'], uncommon: ['Uncommon', '#6f9a5a'], rare: ['Rare', '#4f8ad0'], epic: ['Epic', '#9a6ad0'], legendary: ['Legendary', '#d8a040'], quest: ['Quest', '#e08a2e'] };
const RAR_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'quest'];
const INV_CATS = [['all', 'All'], ['wpn', 'Weapons'], ['med', 'Medical & Consumables'], ['mat', 'Materials & Crafting'], ['quest', 'Quest Items'], ['val', 'Valuables & Contraband'], ['misc', 'Miscellaneous']];
const INV_SUBS = { wpn: [['melee', 'Melee'], ['staff', 'Staffs'], ['pistol', 'Pistols'], ['rifle', 'Rifles'], ['heavy', 'Heavy'], ['ord', 'Ordnance']],
  med: [['medkit', 'Medkits'], ['bandage', 'Bandages'], ['stim', 'Stimulants'], ['drug', 'Drugs'], ['food', 'Food & buffs']],
  mat: [['build', 'Building'], ['upgrade', 'Upgrade'], ['salvage', 'Salvage']],
  val: [['loot', 'High value'], ['restricted', 'Restricted'], ['faction', 'Faction goods']],
  misc: [['fish', 'Fish'], ['junk', 'Junk'], ['token', 'Tokens']], quest: [] };
const INV_SORTS = [['manual', 'My layout'], ['type', 'Type'], ['rarity', 'Rarity'], ['weight', 'Weight'], ['value', 'Value'], ['recent', 'Recent']];

// ---- what each thing is: category, rarity, weight, icon (derived from the real item and weapon tables) ----
const BUILD_MATS = new Set(), UPG_MATS = new Set();
function invMatSets() { if (BUILD_MATS.size) return; try { for (const p of Object.values(PIECES)) for (const k in p.cost || {}) BUILD_MATS.add(k); } catch (_) {} try { MOD_COST.forEach(c => { for (const k in c) if (k !== 'cr') UPG_MATS.add(k); }); } catch (_) {} }
const rarByLvl = l => l < 10 ? 'common' : l < 25 ? 'uncommon' : l < 45 ? 'rare' : l < 75 ? 'epic' : 'legendary';
const rarByVal = v => v < 20 ? 'common' : v < 60 ? 'uncommon' : v < 150 ? 'rare' : v < 400 ? 'epic' : 'legendary';
function gunKind(id) { const g = GUNS[id]; if (!g) return 'rifle'; if (g.mana) return 'staff'; const n = g.name.toLowerCase();
  if (/minigun|gatling|launcher|cannon|rocket|nova/.test(n)) return 'heavy'; if (/blaster|pistol|revolver|wand|scatter/.test(n) && !/rifle/.test(n)) return 'pistol'; if (/bow/.test(n)) return 'rifle'; return 'rifle'; }
function itemIcon(id) { const k = id.toLowerCase(), I = ITEMS[id] || {};
  if (id === 'medkit' || I.use) return 'medkit'; if (I.drug || I.stim) return 'vial'; if (I.fish) return /boot|can/.test(k) ? 'junk' : 'fish';
  if (/journal|recorder|blackbox|code|book/.test(k)) return 'scroll'; if (/key|card|chip|circuit|cell/.test(k)) return 'chip'; if (/pelt|hide|fluff|wing|scale|moss|gel/.test(k)) return 'hide';
  if (/fang|horn|tooth|mandible|quill|spear|shell|chitin|blade|drill/.test(k)) return 'fang'; if (/crystal|pearl|shard|gem|crown|essence|ice/.test(k)) return 'gem';
  if (/heart|eye|sigil|seed|core|token/.test(k)) return 'relic'; if (/scrap|cog|ore|rock|magma|filter/.test(k)) return 'ore'; return 'box'; }
function invMeta(key) {
  invMatSets(); const [t, id] = key.split(':');
  if (t === 'g') { const g = GUNS[id], kind = gunKind(id), tier = gunTier(id); return { kind: 'gun', id, name: g.name + (tier ? ' ' + '★'.repeat(tier) : ''), cat: 'wpn', sub: kind, rar: rarByLvl(g.req || 1), w: kind === 'heavy' ? 9 : kind === 'staff' ? 2.5 : kind === 'pistol' ? 1.4 : 4, v: g.price || 0, icon: kind === 'staff' ? 'staff' : kind, span: kind === 'pistol' ? 1 : 2, col: g.col || '#e08a2e', n: 1 }; }
  if (t === 'm') { const M = MELEE[id]; return { kind: 'melee', id, name: M.name, cat: 'wpn', sub: 'melee', rar: id === 'knife' ? 'common' : rarByLvl(M.req || 1), w: M.reach > 3 ? 4 : 1.6, v: M.price || 0, icon: /claw|nunchuck/.test(id) ? 'fang' : 'sword', span: M.reach > 3 ? 2 : 1, col: M.col || '#cfd4dc', n: 1 }; }
  if (t === 'o') { const O = ORD[id]; return { kind: 'ord', id, name: O.name, cat: 'wpn', sub: 'ord', rar: rarByLvl(O.lvl), w: 0.5, v: 0, icon: 'grenade', span: 1, col: O.col, n: 1 }; }
  const I = ITEMS[id] || { name: id, v: 0, col: '#9aa1aa' }, n = S.inv[id] || 0;
  let cat = 'misc', sub = 'junk';
  if (I.quest) { cat = 'quest'; sub = null; }
  else if (id === 'medkit' || I.use) { cat = 'med'; sub = I.sub || 'medkit'; }
  else if (I.drug) { cat = 'med'; sub = 'drug'; } else if (I.stim) { cat = 'med'; sub = 'stim'; } else if (I.food) { cat = 'med'; sub = 'food'; }
  else if (I.illegal) { cat = 'val'; sub = 'restricted'; } else if (I.faction) { cat = 'val'; sub = 'faction'; }
  else if (I.fish) { cat = 'misc'; sub = (I.v || 0) <= 2 ? 'junk' : 'fish'; }
  else if (/token/.test(id)) { cat = 'misc'; sub = 'token'; }
  else if (BUILD_MATS.has(id)) { cat = 'mat'; sub = 'build'; } else if (UPG_MATS.has(id)) { cat = 'mat'; sub = 'upgrade'; }
  else if ((I.v || 0) >= 150) { cat = 'val'; sub = 'loot'; } else { cat = 'mat'; sub = 'salvage'; }
  return { kind: 'item', id, name: I.name, cat, sub, rar: I.quest ? 'quest' : rarByVal(I.v || 0), w: I.quest ? 0.1 : I.fish ? 0.8 : id === 'medkit' ? 0.4 : /gem/.test(itemIcon(id)) ? 0.2 : 0.3, v: I.quest ? 0 : sellPrice(id), icon: itemIcon(id), span: 1, col: I.col || '#9aa1aa', n, illegal: !!I.illegal };
}
// ---- icons: one silhouette per kind of thing, tinted with the item's own color ----
const INV_SVG = {
  sword: '<path d="M19 3l2 2-10 10-2-2z"/><path d="M7 13l4 4-2 2-1.5-1.5L5 20l-1-1 2.5-2.5L5 15z" opacity=".8"/>',
  staff: '<rect x="11" y="7" width="2" height="15" rx="1" transform="rotate(30 12 14)"/><circle cx="16.5" cy="5.5" r="3.2"/>',
  pistol: '<path d="M3 8h15v4h-6l-1 2H8l-1 5H4l1-6H3z"/><rect x="18" y="9" width="3" height="2"/>',
  rifle: '<path d="M1 10h17v3h-5l-1 2H9l-2 4H4l2-4V13H1z"/><rect x="18" y="10.5" width="5" height="1.5"/><rect x="8" y="8" width="5" height="2"/>',
  heavy: '<rect x="2" y="8" width="15" height="7" rx="2"/><rect x="17" y="9" width="6" height="1.6"/><rect x="17" y="12" width="6" height="1.6"/><path d="M6 15h4l-1 5H6z"/>',
  grenade: '<circle cx="12" cy="14" r="7"/><rect x="10" y="3" width="4" height="4"/><path d="M14 5h4v2h-4z"/>',
  medkit: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 4h6v2H9z"/><path d="M11 9h2v3h3v2h-3v3h-2v-3H8v-2h3z" fill="#15171b"/>',
  vial: '<path d="M9 2h6v2h-1v5l5 9a3 3 0 0 1-3 4H8a3 3 0 0 1-3-4l5-9V4H9z"/>',
  fish: '<path d="M2 12c4-6 11-6 15 0-4 6-11 6-15 0z"/><path d="M17 12l5-4v8z"/><circle cx="7" cy="11" r="1" fill="#15171b"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20" stroke="#15171b" stroke-width=".8" fill="none"/>',
  chip: '<rect x="5" y="5" width="14" height="14" rx="1.5"/><path d="M8 2v3M12 2v3M16 2v3M8 19v3M12 19v3M16 19v3M2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="6" height="6" fill="#15171b"/>',
  hide: '<path d="M5 4c3 2 11 2 14 0l2 7-3 2 1 7c-4-2-10-2-14 0l1-7-3-2z"/>',
  fang: '<path d="M8 2c6 2 9 8 8 20-3-6-8-11-11-14z"/>',
  ore: '<path d="M4 15l3-8 7-3 6 5 1 8-7 4-8-1z"/><path d="M9 9l4 2 3-2" stroke="#15171b" stroke-width=".9" fill="none"/>',
  scroll: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 8h8M8 11h8M8 14h5" stroke="#15171b" stroke-width="1.2"/>',
  relic: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5" fill="#15171b"/><circle cx="12" cy="12" r="1.6"/>',
  junk: '<path d="M6 4h8v7l5 3v5H5l1-8z"/>', box: '<rect x="4" y="6" width="16" height="13" rx="1.5"/><path d="M4 10h16" stroke="#15171b" stroke-width="1.2"/>'
};
const invIconHtml = (icon, col) => `<svg viewBox="0 0 24 24" class="ii" style="color:${col}" fill="currentColor" aria-hidden="true">${INV_SVG[icon] || INV_SVG.box}</svg>`;

// ---- the list of everything you carry ----
function invKeys() {
  const ks = []; for (const id of S.guns || []) if (GUNS[id]) ks.push('g:' + id);
  for (const id of S.melees || ['knife']) if (MELEE[id]) ks.push('m:' + id);
  for (const id in ORD) if (S.lvl >= ORD[id].lvl) ks.push('o:' + id);
  for (const id in S.inv) if (ITEMS[id] && S.inv[id] > 0) ks.push('i:' + id);
  return ks;
}
function invSync() { // keep the saved layout in step with what you actually own, never touching the items themselves
  const have = invKeys(), set = new Set(have); S.invOrder = (S.invOrder || []).filter(k => set.has(k)); const placed = new Set(S.invOrder); for (const k of have) if (!placed.has(k)) S.invOrder.push(k);
  S.invT = S.invT || {}; S.quick = S.quick || []; while (S.quick.length < INV_CFG.quick) S.quick.push(null); return S.invOrder;
}
const invSlotsUsed = () => Object.keys(S.inv).filter(k => ITEMS[k] && S.inv[k] > 0 && !ITEMS[k].quest).length;
const invWeight = () => invKeys().reduce((a, k) => { const m = invMeta(k); return a + m.w * (m.kind === 'item' ? m.n : 1); }, 0);
function invAdd(id, n, quiet) { // the one safe way to put loot in the bag: stacks, respects the slot limit, never drops anything silently
  if (!ITEMS[id] || !(n > 0)) return false;
  if (!S.inv[id] && !ITEMS[id].quest && invSlotsUsed() >= INV_CFG.cap) { invFullNote(id); return false; }
  S.inv[id] = (S.inv[id] || 0) + n; S.invT = S.invT || {}; S.invT['i:' + id] = Date.now(); if (!quiet) invPickupNote(id, n); markDirty(); return true;
}
function invFullNote(id) { const now = performance.now(); if (now - INVUI.full < 3000) return; INVUI.full = now; SFX.hit(); invChip(invIconHtml(itemIcon(id), ITEMS[id].col), `Bag full · ${ITEMS[id].name} left on the ground`, true); log(`Your bag is full (${INV_CFG.cap} slots). ${ITEMS[id].name} stays on the ground: sell or drop something to make room.`); }
function invPickupNote(id, n) { invChip(invIconHtml(itemIcon(id), ITEMS[id].col), `+${n} ${ITEMS[id].name}`); }
function invChip(icon, text, bad) {
  let box = document.getElementById('invPick'); if (!box) { box = document.createElement('div'); box.id = 'invPick'; document.body.appendChild(box); }
  const c = document.createElement('div'); c.className = 'ipc' + (bad ? ' bad' : ''); c.innerHTML = icon; const s = document.createElement('span'); s.textContent = text; c.appendChild(s); box.appendChild(c);
  while (box.children.length > 4) box.firstChild.remove(); setTimeout(() => { c.classList.add('out'); setTimeout(() => c.remove(), 400); }, 2600);
}

// ---- styles ----
{ const st = document.createElement('style'); st.textContent = `
#inv{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(6,7,9,.62);font-family:system-ui,"Segoe UI",Roboto,sans-serif;color:#d9dce1;opacity:0;transition:opacity .16s}
#inv.on{opacity:1}#inv *{box-sizing:border-box}
#inv .frame{width:min(1180px,96vw);height:min(720px,94vh);display:grid;grid-template-columns:250px 1fr 290px;grid-template-rows:auto 1fr auto;grid-template-areas:"hd hd hd" "eq bag det" "ft ft ft";background:linear-gradient(#1b1d21,#141619);border:1px solid #3c4149;box-shadow:0 0 0 1px #0a0b0d,0 18px 60px rgba(0,0,0,.6),inset 0 1px 0 #4a5058;border-radius:6px;overflow:hidden;transform:scale(.97);transition:transform .18s}
#inv.on .frame{transform:none}
#inv .hd{grid-area:hd;display:flex;align-items:center;gap:14px;padding:10px 14px;border-bottom:1px solid #2c3036;background:linear-gradient(#22252a,#1a1c20)}
#inv .hd h2{margin:0;font:700 15px/1 system-ui,sans-serif;letter-spacing:.22em;color:#e0a040}
#inv .stat{font:13px var(--num);color:#9aa1aa;letter-spacing:.04em}#inv .stat b{color:#e8e9eb;font-weight:400}#inv .stat.full b{color:#e0603a}
#inv .x{margin-left:auto;background:#24272c;border:1px solid #3c4149;color:#c9ccd1;width:34px;height:34px;border-radius:4px;font-size:18px;cursor:pointer}
#inv .x:hover{border-color:#e0a040;color:#fff}
#inv .pan{background:#17191c;overflow:hidden;display:flex;flex-direction:column;min-height:0}
#inv .eq{grid-area:eq;border-right:1px solid #2c3036;padding:10px;gap:6px;overflow-y:auto}
#inv .det{grid-area:det;border-left:1px solid #2c3036;padding:12px;overflow-y:auto}
#inv .bag{grid-area:bag;padding:10px;gap:8px}
#inv .ft{grid-area:ft;display:flex;gap:6px;padding:8px 12px;border-top:1px solid #2c3036;flex-wrap:wrap;background:#16181b}
#inv .lbl{font:600 10px/1 system-ui,sans-serif;letter-spacing:.2em;color:#7d838c;text-transform:uppercase;margin:6px 2px 2px}
#inv .slot{display:flex;align-items:center;gap:8px;padding:6px;border:1px solid #2f343b;border-radius:4px;background:#1d2024;min-height:50px;cursor:pointer;transition:border-color .12s,background .12s}
#inv .slot:hover,#inv .slot.sel{border-color:#e0a040}#inv .slot .ic{width:38px;height:38px;flex:none;display:grid;place-items:center;background:#121417;border:1px solid #2a2e34;border-radius:3px}
#inv .slot .tx{min-width:0;flex:1}#inv .slot .t1{font:600 10px system-ui;letter-spacing:.14em;color:#7d838c;text-transform:uppercase}#inv .slot .t2{font-size:13px;color:#e4e6e9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#inv .slot .t3{font:12px var(--num);color:#9aa1aa}
#inv .slot.empty .t2{color:#5d636c;font-style:italic}#inv .slot.ok{border-color:#6f9a5a;background:#1f2a1f}#inv .slot.bad{border-color:#a04030;background:#2a1c1a}#inv .slot.flash{animation:invFlash .5s}
@keyframes invFlash{0%{box-shadow:0 0 0 0 rgba(224,160,64,.8)}100%{box-shadow:0 0 0 10px rgba(224,160,64,0)}}
#inv .qrow{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#inv .q{position:relative;aspect-ratio:1;border:1px solid #2f343b;border-radius:4px;background:#1d2024;display:grid;place-items:center;cursor:pointer}
#inv .q .k{position:absolute;left:3px;top:2px;font:11px var(--num);color:#7d838c}#inv .q .n{position:absolute;right:3px;bottom:1px;font:13px var(--num);color:#e8e9eb}#inv .q.ok{border-color:#6f9a5a}#inv .q.bad{border-color:#a04030}#inv .q.sel{border-color:#e0a040}
#inv .gear{display:flex;flex-wrap:wrap;gap:4px}#inv .gear span{font-size:11px;padding:3px 6px;border:1px solid #2f343b;border-radius:3px;color:#b9bec5;background:#1d2024}
#inv .cats{display:flex;gap:4px;flex-wrap:wrap}#inv .cat{background:#1d2024;border:1px solid #2f343b;color:#b9bec5;border-radius:3px;padding:6px 9px;font-size:12px;cursor:pointer;white-space:nowrap}
#inv .cat.on{border-color:#e0a040;color:#f4d9a8;background:#2a2318}#inv .cat:disabled{opacity:.35;cursor:default}#inv .cat small{color:#7d838c;margin-left:4px;font-family:var(--num)}
#inv .tools{display:flex;gap:6px;align-items:center}#inv .tools input,#inv .tools select{background:#121417;border:1px solid #2f343b;color:#e4e6e9;border-radius:3px;padding:6px 8px;font-size:13px;min-width:0}#inv .tools input{flex:1}
#inv .grid{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(66px,1fr));grid-auto-rows:66px;grid-auto-flow:dense;gap:5px;align-content:start;padding:2px}
#inv .cell{position:relative;border:1px solid #2c3036;border-radius:4px;background:linear-gradient(#1f2226,#1a1c20);display:grid;place-items:center;cursor:pointer;transition:transform .1s,border-color .12s;user-select:none;-webkit-user-select:none}
#inv .cell.w2{grid-column:span 2}#inv .cell:hover{border-color:#5a6068}#inv .cell.sel{border-color:#e0a040;transform:scale(1.03);z-index:1}
#inv .cell .rb{position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:4px 0 0 4px}#inv .cell .n{position:absolute;right:4px;bottom:2px;font:14px var(--num);color:#e8e9eb;text-shadow:0 1px 2px #000}
#inv .cell .nm{position:absolute;left:6px;right:4px;top:3px;font-size:10px;color:#9aa1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#inv .cell .ii{width:34px;height:34px;margin-top:8px}#inv .cell.w2 .ii{width:44px;height:44px}
#inv .cell .eqd{position:absolute;right:4px;top:3px;font:10px var(--num);color:#e0a040}#inv .cell .tri{position:absolute;left:6px;bottom:3px;color:#e0402a;font-size:12px}
#inv .cell.ok{border-color:#6f9a5a}#inv .cell.bad{border-color:#a04030}#inv .cell.drag{opacity:.35}#inv .cell.moving{outline:2px dashed #e0a040}
#inv button,#inv input,#inv select{font-family:system-ui,"Segoe UI",Roboto,sans-serif;word-spacing:normal;letter-spacing:normal;text-transform:none}#inv .cell.vac{border-style:dashed;border-color:#23262b;background:#15171a;cursor:default}
#inv .empty{grid-column:1/-1;color:#6a7078;text-align:center;padding:30px 10px;font-size:13px}
#inv .det h3{margin:2px 0 2px;font-size:17px;color:#f0f1f3}#inv .det .big{height:120px;display:grid;place-items:center;background:#121417;border:1px solid #2a2e34;border-radius:4px;margin-bottom:8px;overflow:hidden}#inv .det .big .ii{width:72px;height:72px}
#inv .det .big canvas{width:100%!important;height:100%!important;object-fit:contain}#inv .det .prevLbl{display:none}#inv .det .prevWrap{width:100%;height:100%;margin:0;border:0}
#inv .det .tag{display:inline-block;font:600 10px system-ui;letter-spacing:.14em;text-transform:uppercase;padding:3px 6px;border-radius:3px;border:1px solid;margin:0 4px 6px 0}
#inv .det p{font-size:13px;line-height:1.45;color:#b9bec5;margin:6px 0}#inv .det table{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0}#inv .det td{padding:3px 0;border-bottom:1px solid #23262b}#inv .det td:last-child{text-align:right;font-family:var(--num);font-size:15px;color:#e8e9eb}
#inv .det .up{color:#7fc06a}#inv .det .dn{color:#d06a50}#inv .acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#inv .btn{background:#24272c;border:1px solid #3c4149;color:#e4e6e9;border-radius:4px;padding:8px 12px;font-size:13px;cursor:pointer;min-height:36px}#inv .btn:hover:not(:disabled){border-color:#e0a040}#inv .btn.pri{background:#3a2c14;border-color:#a8782c;color:#ffe2a8}#inv .btn:disabled{opacity:.4;cursor:default}
#inv .hint{font-size:12px;color:#7d838c;margin-top:6px}#inv .tabs{display:none}#inv .det .close{display:none}
#inv .warn{color:#e0603a;font-size:12px;margin-top:6px}
@media (max-width:899px),(max-height:560px){
 #inv .frame{width:100vw;height:100vh;border-radius:0;grid-template-columns:1fr;grid-template-rows:auto 1fr auto;grid-template-areas:"hd" "bag" "ft"}
 #inv .eq{grid-area:bag;display:none;border-right:0}#inv.tab-eq .eq{display:flex}#inv.tab-eq .bag{display:none}
 #inv .tabs{display:flex;gap:4px}#inv .tabs button{background:#1d2024;border:1px solid #2f343b;color:#b9bec5;border-radius:3px;padding:7px 12px;font-size:13px}#inv .tabs button.on{border-color:#e0a040;color:#f4d9a8}
 #inv .det{position:absolute;right:0;top:0;bottom:0;width:min(360px,92vw);z-index:3;transform:translateX(105%);transition:transform .18s;box-shadow:-10px 0 30px rgba(0,0,0,.6);border-left:1px solid #3c4149}#inv.showdet .det{transform:none}
 #inv .det .close{display:block;position:absolute;right:8px;top:8px}#inv .hd{padding:6px 10px;gap:8px;flex-wrap:wrap}#inv .hd h2{font-size:13px}
 #inv .grid{grid-template-columns:repeat(auto-fill,minmax(58px,1fr));grid-auto-rows:58px}#inv .cats{flex-wrap:nowrap;overflow-x:auto}#inv .ft{padding:5px 8px}
 #inv .frame{position:relative}}
@media (max-height:560px) and (min-width:600px){#inv .eq{flex-direction:row;flex-wrap:wrap;align-content:flex-start}#inv .eq .slot{width:calc(50% - 4px)}#inv .eq .lbl,#inv .eq .qrow,#inv .eq .gear{width:100%}#inv .eq .qrow{grid-template-columns:repeat(4,64px)}}
@media (max-width:599px){#inv .det{width:100vw;top:auto;height:62%;transform:translateY(105%);border-left:0;border-top:1px solid #3c4149}}
#invPick{position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);z-index:20;display:flex;flex-direction:column;gap:4px;align-items:flex-end;pointer-events:none}
#invPick .ipc{display:flex;align-items:center;gap:8px;background:rgba(20,22,25,.88);border:1px solid #3c4149;border-left:3px solid #e0a040;color:#e4e6e9;padding:5px 10px 5px 6px;border-radius:4px;font:13px system-ui,sans-serif;animation:ipIn .22s ease-out;transition:opacity .4s,transform .4s}
#invPick .ipc.bad{border-left-color:#e0402a}#invPick .ipc .ii{width:22px;height:22px}#invPick .ipc.out{opacity:0;transform:translateX(20px)}@keyframes ipIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
#qbar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 44px);z-index:7;display:flex;gap:5px}
#qbar button{position:relative;width:46px;height:46px;background:rgba(20,22,25,.82);border:1px solid #3c4149;border-radius:5px;display:grid;place-items:center;padding:0;cursor:pointer}#qbar button .ii{width:26px;height:26px}
#qbar .k{position:absolute;left:3px;top:1px;font:11px var(--num);color:#9aa1aa}#qbar .n{position:absolute;right:3px;bottom:0;font:13px var(--num);color:#fff}#qbar button.zero{opacity:.45}#qbar button.hit{animation:invFlash .4s}
body.velocity #qbar,body.flying #qbar,body.menuopen #qbar{display:none}
`; document.head.appendChild(st); }

// ---- opening and closing (rides on the game's dialog state, so pausing, aiming and Esc all behave) ----
openBag = function () {
  openDlg('Inventory', 'Bag'); acts([]); $('dlg').hidden = true; invSync();
  let el = document.getElementById('inv'); if (!el) { el = document.createElement('div'); el.id = 'inv'; document.body.appendChild(el); }
  INVUI.el = el; INVUI.open = true; INVUI.move = null; el.hidden = false; el.className = 'tab-' + INVUI.tab; invRender(); requestAnimationFrame(() => el.classList.add('on')); SFX.ui();
  cancelAnimationFrame(INVUI.raf); const loop = () => { if (!INVUI.open) return; if (PREV.r && PREV.obj && PREV.wrap && PREV.wrap.isConnected) { PREV.spin += 0.012; PREV.obj.rotation.y = PREV.spin; PREV.r.render(PREV.scene, PREV.cam); } INVUI.raf = requestAnimationFrame(loop); }; loop();
};
function invHide() { if (!INVUI.open) return; INVUI.open = false; cancelAnimationFrame(INVUI.raf); const el = INVUI.el; if (el) { el.classList.remove('on'); setTimeout(() => { if (!INVUI.open) { el.hidden = true; el.textContent = ''; } }, 160); } }
{ const _cd = closeDlg; closeDlg = function () { invHide(); return _cd(); }; }
{ const _od = openDlg; openDlg = function (...a) { if (INVUI.open) invHide(); return _od(...a); }; }
const invClose = () => { if (INVUI.open) closeDlg(); };
window.addEventListener('keydown', e => { if (!INVUI.open) return; if (e.code === 'KeyI' && !(e.target && /INPUT|SELECT/.test(e.target.tagName))) { e.preventDefault(); e.stopImmediatePropagation(); invClose(); } }, true);

// ---- actions (each one re-checks what you actually have right then, so double-taps can't copy or lose things) ----
function invLock() { const now = performance.now(); if (now - INVUI.busy < 140) return false; INVUI.busy = now; return true; }
function invEquip(key) {
  if (!invLock()) return; const [t, id] = key.split(':');
  if (t === 'g' && S.guns.includes(id)) { bagEquipGun(id); invFlash(isStaffId(id) ? 'staff' : 'gun'); }
  else if (t === 'm' && (S.melees || ['knife']).includes(id)) { S.melee = id; try { if (typeof refreshMeleeModel === 'function') refreshMeleeModel(); } catch (_) {} log(`${MELEE[id].name} equipped (F or right click to swing).`); invFlash('melee'); }
  else if (t === 'o' && ORD[id] && S.lvl >= ORD[id].lvl) { S.ord = id; log(`${ORD[id].name} ready.`); invFlash('ord'); }
  else return; SFX.item(); markDirty(); invRender();
}
function invUnequip(slot) {
  if (!invLock()) return; const sl = loadoutSlots();
  if (slot === 'melee') { if ((S.melee || 'knife') === 'knife') return; S.melee = 'knife'; try { if (typeof refreshMeleeModel === 'function') refreshMeleeModel(); } catch (_) {} log('Back to the Combat Knife.'); }
  else if (slot === 'gun' || slot === 'staff') { const other = slot === 'gun' ? sl.staff : sl.gun; if (!other) { log('You need a gun or a staff in hand. Equip the other one first.'); SFX.hit(); return; }
    if (S.gun === sl[slot]) bagEquipGun(other); delete S.slots[slot]; S.dual = false; log(`${slot === 'gun' ? 'Gun' : 'Staff'} put away.`); }
  else if (slot === 'armor') { S.look = Object.assign({}, myLook(), { a: 'std' }); sendPresence(true); if (LEVEL.id === 'ship' && typeof placeMannequin === 'function') placeMannequin(); log('Back to standard Trooper Armor.'); }
  SFX.ui(); markDirty(); invRender();
}
function invWear(id) { if (!invLock() || !ARMORS[id] || !lookUnlocked(ARMORS, id)) return; S.look = Object.assign({}, myLook(), { a: id }); sendPresence(true); if (LEVEL.id === 'ship' && typeof placeMannequin === 'function') placeMannequin(); SFX.item(); markDirty(); invFlash('armor'); log(`Wearing ${ARMORS[id].name}.`); invRender(); }
function invUse(key) {
  if (!invLock()) return; const [t, id] = key.split(':');
  if (t === 'i' && id === 'medkit') { if (!(S.inv.medkit > 0)) return; if (player.hp >= maxHp()) { log('Already at full health.'); return; } useMedkit(); burst(player.pos.clone().add(V(0, 1.2, 0)), '#5dff9a', 18, 3); SFX.ui(); }
  invRender(); invQuickRender();
}
function invDrop(id, n) {
  if (!invLock()) return; const I = ITEMS[id]; if (!I || I.quest) return; n = Math.min(Math.floor(n), S.inv[id] || 0); if (n < 1) return;
  if (LEVEL.fly) { log("You can't drop things in space."); return; }
  S.inv[id] -= n; if (!S.inv[id]) delete S.inv[id];
  const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)); spawnDrop(player.pos.clone().addScaledVector(f, 2.2), 'item', id, n); const d = drops[drops.length - 1]; if (d) { d.life = 300; d.noPick = gameTime + 2.5; }
  log(`Dropped ${n} ${I.name}.`); SFX.ui(); markDirty(); renderQuest(); if (!S.inv[id]) INVUI.sel = null; invRender(); invQuickRender();
}
function invAssignQuick(i, key) {
  if (!invLock() || i < 0 || i >= INV_CFG.quick) return; if (key && !invQuickOk(key)) { SFX.hit(); return; }
  invSync(); for (let j = 0; j < S.quick.length; j++) if (S.quick[j] === key) S.quick[j] = null; S.quick[i] = key; SFX.ui(); markDirty(); invRender(); invQuickRender();
}
const invQuickOk = key => { const [t, id] = key.split(':'); return t === 'g' || t === 'm' || t === 'o' || (t === 'i' && (id === 'medkit' || (ITEMS[id] && (ITEMS[id].use || ITEMS[id].drug || ITEMS[id].stim || ITEMS[id].food)))); };
function invMoveTo(key, beforeKey) { // rearrange your layout: moves a reference, never the item count
  const o = invSync(), i = o.indexOf(key); if (i < 0 || key === beforeKey) return; o.splice(i, 1); const j = beforeKey ? o.indexOf(beforeKey) : -1; if (j < 0) o.push(key); else o.splice(j, 0, key); INVUI.sort = 'manual'; markDirty(); invRender();
}
function invFlash(slot) { setTimeout(() => { const s = INVUI.el && INVUI.el.querySelector(`[data-slot="${slot}"]`); if (s) { s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash'); } }, 0); }
const slotFor = key => { const [t, id] = key.split(':'); return t === 'g' ? (isStaffId(id) ? 'staff' : 'gun') : t === 'm' ? 'melee' : t === 'o' ? 'ord' : null; };

// ---- quick slots (keys 4–7, or tap them on the HUD) ----
function invQuickUse(i) {
  invSync(); const key = S.quick[i]; if (!key) return; const [t, id] = key.split(':');
  if (t === 'i') { if (!(S.inv[id] > 0)) { log(`No ${ITEMS[id] ? ITEMS[id].name : id} left.`); SFX.hit(); return; } if (id === 'medkit') { if (player.hp >= maxHp()) { log('Already at full health.'); return; } useMedkit(); burst(player.pos.clone().add(V(0, 1.2, 0)), '#5dff9a', 18, 3); SFX.ui(); } }
  else if (t === 'g') { if (!S.guns.includes(id)) return; if (S.gun !== id || handMelee()) bagEquipGun(id); }
  else if (t === 'm') { if (!(S.melees || ['knife']).includes(id)) return; S.melee = id; try { if (typeof refreshMeleeModel === 'function') refreshMeleeModel(); } catch (_) {} if (!handMelee()) swapHand(); markDirty(); }
  else if (t === 'o') { if (!ORD[id] || S.lvl < ORD[id].lvl) return; S.ord = id; throwOrd(); }
  const b = document.querySelector(`#qbar button[data-i="${i}"]`); if (b) { b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); } invQuickRender();
}
window.addEventListener('keydown', e => { if (e.repeat || state !== 'play' || dlgOpen || chatOpen() || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return; const i = INV_CFG.quickKeys.indexOf(e.code); if (i >= 0 && !(typeof RC !== 'undefined' && RC.on)) { e.preventDefault(); invQuickUse(i); } });
function invQuickRender() {
  let bar = document.getElementById('qbar'); invSync(); const any = S.quick.some(Boolean);
  if (!bar) { bar = document.createElement('div'); bar.id = 'qbar'; document.body.appendChild(bar); }
  bar.hidden = !any || state !== 'play'; if (bar.hidden) return; bar.textContent = '';
  S.quick.forEach((key, i) => { if (!key) return; const m = invMetaSafe(key); if (!m) return; const b = document.createElement('button'); b.dataset.i = i; b.setAttribute('aria-label', `Quick slot ${i + 1}: ${m.name}`); b.title = `${m.name} (${i + 4})`;
    b.innerHTML = invIconHtml(m.icon, m.col) + (TOUCH ? '' : `<span class="k">${i + 4}</span>`) + (m.kind === 'item' ? `<span class="n">${m.n}</span>` : ''); if (m.kind === 'item' && !m.n) b.classList.add('zero');
    b.addEventListener('click', e => { e.stopPropagation(); invQuickUse(i); }); bar.appendChild(b); });
}
function invMetaSafe(key) { try { const [t, id] = key.split(':'); if (t === 'g' && !GUNS[id]) return null; if (t === 'm' && !MELEE[id]) return null; if (t === 'o' && !ORD[id]) return null; if (t === 'i' && !ITEMS[id]) return null; return invMeta(key); } catch (_) { return null; } }
setInterval(() => { try { const bar = document.getElementById('qbar'); const want = state === 'play' && S.quick && S.quick.some(Boolean); if (!bar || bar.hidden === want || want) invQuickRender(); } catch (_) {} }, 500);

// ---- drawing the screen ----
function invRender() {
  const el = INVUI.el; if (!el || !INVUI.open) return; const order = invSync(); el.textContent = '';
  const mk = (tag, cls, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; };
  const frame = mk('div', 'frame'); el.appendChild(frame);
  // header
  const used = invSlotsUsed(), hd = mk('div', 'hd'); hd.appendChild(mk('h2', '', 'BACKPACK'));
  const tabs = mk('div', 'tabs'); for (const [k, l] of [['bag', 'Backpack'], ['eq', 'Equipment']]) { const b = mk('button', INVUI.tab === k ? 'on' : ''); b.textContent = l; b.addEventListener('click', () => { INVUI.tab = k; el.className = 'on tab-' + k; invRender(); }); tabs.appendChild(b); } hd.appendChild(tabs);
  const s1 = mk('span', 'stat' + (used >= INV_CFG.cap ? ' full' : ''), `Slots <b>${used}/${INV_CFG.cap}</b>`); s1.title = 'Loot stacks. Weapons and quest items don\'t use slots.'; hd.appendChild(s1);
  hd.appendChild(mk('span', 'stat', `Weight <b>${invWeight().toFixed(1)} kg</b>`)); hd.appendChild(mk('span', 'stat', `<b>${S.cr.toLocaleString()}</b> cr`));
  const x = mk('button', 'x', '✕'); x.setAttribute('aria-label', 'Close inventory'); x.addEventListener('click', invClose); hd.appendChild(x); frame.appendChild(hd);
  frame.appendChild(invEquipPanel()); frame.appendChild(invBagPanel(order)); frame.appendChild(invDetailPanel());
  // footer: the other gear screens
  const ft = mk('div', 'ft'); const link = (l, fn) => { const b = mk('button', 'btn'); b.textContent = l; b.addEventListener('click', fn); ft.appendChild(b); };
  link('Wardrobe', () => openWardrobe()); link('Gun mods', () => openGunMods()); link('Pets', () => openPets());
  if (Object.keys(MELEE).some(k => MELEE[k].saber && (S.melees || []).includes(k))) link('Saber forge', () => openSaberForge()); link('Quests', () => openQuestLog());
  if (!TOUCH) ft.appendChild(mk('span', 'hint', 'Drag items onto slots · I or Esc closes')); frame.appendChild(ft);
  if (INVUI.sel) el.classList.add('showdet');
}
function invEquipPanel() {
  const P = document.createElement('div'); P.className = 'pan eq'; const sl = loadoutSlots(), L = myLook();
  const lbl = t => { const d = document.createElement('div'); d.className = 'lbl'; d.textContent = t; P.appendChild(d); };
  const slot = (slotId, title, key, name, sub, icon, col) => { const d = document.createElement('div'); d.className = 'slot' + (name ? '' : ' empty') + (INVUI.sel === key && key ? ' sel' : ''); d.dataset.slot = slotId;
    d.innerHTML = `<div class="ic">${name ? invIconHtml(icon, col) : ''}</div><div class="tx"><div class="t1"></div><div class="t2"></div><div class="t3"></div></div>`;
    d.querySelector('.t1').textContent = title; d.querySelector('.t2').textContent = name || 'Empty'; d.querySelector('.t3').textContent = sub || '';
    d.addEventListener('click', () => { if (INVUI.move) { invDropOnSlot(INVUI.move, slotId); INVUI.move = null; return; } INVUI.sel = key || ('slot:' + slotId); invRender(); });
    invDropTarget(d, k => slotFor(k) === slotId, k => invDropOnSlot(k, slotId)); P.appendChild(d); };
  lbl('Equipped');
  const M = MELEE[S.melee || 'knife'] || MELEE.knife; slot('melee', 'Melee', 'm:' + (S.melee || 'knife'), M.name, `${M.dmg} dmg · ${M.reach} m reach`, invMeta('m:' + (S.melee || 'knife')).icon, M.col || '#cfd4dc');
  for (const [k, t] of [['gun', 'Firearm'], ['staff', 'Staff']]) { const id = sl[k], g = GUNS[id]; if (g) { const m = invMeta('g:' + id); slot(k, t + (S.gun === id && !handMelee() ? ' · in hand' : ''), 'g:' + id, m.name, `${Math.round(g.dmg * (1 + 0.08 * gunTier(id)))} dmg · ${g.mag} ${g.mana ? 'mana' : 'rounds'}`, m.icon, m.col); } else slot(k, t, null, null, k === 'gun' ? 'Buy one at a gunsmith' : 'Buy one from a mage'); }
  const A = ARMORS[L.a] || ARMORS.std; slot('armor', 'Armor', 'slot:armor', A.name, A.def ? `−${Math.round(A.def * 100)}% damage taken` : 'No damage reduction', 'hide', A.trim || '#c9b27c');
  const O = ORD[ordSel()]; slot('ord', 'Ordnance', 'o:' + ordSel(), O.name, `${O.dmg} dmg · ${typeof ordCharges === 'number' ? Math.floor(ordCharges) : 3}/3 ready`, 'grenade', O.col);
  if (S.rod && RODS[S.rod]) { const d = document.createElement('div'); d.className = 'slot'; d.innerHTML = `<div class="ic">${invIconHtml('staff', '#c9a43a')}</div><div class="tx"><div class="t1">Fishing rod</div><div class="t2"></div><div class="t3">Used at fishing spots</div></div>`; d.querySelector('.t2').textContent = RODS[S.rod].name; P.appendChild(d); }
  lbl(`Quick slots · keys 4–${3 + INV_CFG.quick}`); const qr = document.createElement('div'); qr.className = 'qrow'; P.appendChild(qr);
  S.quick.forEach((key, i) => { const q = document.createElement('div'); q.className = 'q' + (INVUI.sel === 'q:' + i ? ' sel' : ''); const m = key && invMetaSafe(key);
    q.innerHTML = (m ? invIconHtml(m.icon, m.col) : '') + `<span class="k">${i + 4}</span>` + (m && m.kind === 'item' ? `<span class="n">${m.n}</span>` : ''); q.title = m ? m.name : 'Empty quick slot';
    q.addEventListener('click', () => { if (INVUI.move) { invAssignQuick(i, INVUI.move); INVUI.move = null; return; } INVUI.sel = key || ('q:' + i); invRender(); });
    invDropTarget(q, invQuickOk, k => invAssignQuick(i, k)); qr.appendChild(q); });
  if ((S.gear || []).length) { lbl('Gear (always on)'); const g = document.createElement('div'); g.className = 'gear'; for (const id of S.gear) if (GEAR[id]) { const s = document.createElement('span'); s.textContent = GEAR[id].name; s.title = GEAR[id].desc; g.appendChild(s); } P.appendChild(g); }
  return P;
}
function invDropOnSlot(key, slotId) { if (slotFor(key) !== slotId) { SFX.hit(); log("That doesn't fit there."); return; } invEquip(key); }
function invDropTarget(el, ok, fn) { if (TOUCH) return;
  el.addEventListener('dragover', e => { const k = INVUI.drag; if (!k) return; e.preventDefault(); el.classList.toggle('ok', ok(k)); el.classList.toggle('bad', !ok(k)); });
  el.addEventListener('dragleave', () => el.classList.remove('ok', 'bad'));
  el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('ok', 'bad'); const k = INVUI.drag; INVUI.drag = null; if (k && ok(k)) fn(k); else if (k) SFX.hit(); }); }
function invFiltered(order) {
  let list = order.map(k => [k, invMetaSafe(k)]).filter(([, m]) => m);
  if (INVUI.cat !== 'all') list = list.filter(([, m]) => m.cat === INVUI.cat); if (INVUI.sub) list = list.filter(([, m]) => m.sub === INVUI.sub);
  const q = INVUI.q.trim().toLowerCase(); if (q) list = list.filter(([, m]) => m.name.toLowerCase().includes(q));
  const catI = c => INV_CATS.findIndex(x => x[0] === c), by = { type: (a, b) => catI(a[1].cat) - catI(b[1].cat) || String(a[1].sub).localeCompare(String(b[1].sub)) || a[1].name.localeCompare(b[1].name),
    rarity: (a, b) => RAR_ORDER.indexOf(b[1].rar) - RAR_ORDER.indexOf(a[1].rar), weight: (a, b) => b[1].w * (b[1].n || 1) - a[1].w * (a[1].n || 1), value: (a, b) => b[1].v * (b[1].n || 1) - a[1].v * (a[1].n || 1),
    recent: (a, b) => ((S.invT || {})[b[0]] || 0) - ((S.invT || {})[a[0]] || 0) };
  if (by[INVUI.sort]) list = list.slice().sort(by[INVUI.sort]); return list;
}
function invBagPanel(order) {
  const P = document.createElement('div'); P.className = 'pan bag'; const all = order.map(k => invMetaSafe(k)).filter(Boolean);
  const cats = document.createElement('div'); cats.className = 'cats'; P.appendChild(cats);
  for (const [k, l] of INV_CATS) { const n = k === 'all' ? all.length : all.filter(m => m.cat === k).length, b = document.createElement('button'); b.className = 'cat' + (INVUI.cat === k ? ' on' : ''); b.innerHTML = `${l}<small>${n}</small>`; b.addEventListener('click', () => { INVUI.cat = k; INVUI.sub = null; invRender(); }); cats.appendChild(b); }
  if (INV_SUBS[INVUI.cat] && INV_SUBS[INVUI.cat].length) { const subs = document.createElement('div'); subs.className = 'cats'; P.appendChild(subs);
    for (const [k, l] of [[null, 'All'], ...INV_SUBS[INVUI.cat]]) { const n = all.filter(m => m.cat === INVUI.cat && (k == null || m.sub === k)).length, b = document.createElement('button'); b.className = 'cat' + (INVUI.sub === k ? ' on' : ''); b.innerHTML = `${l}<small>${n}</small>`; b.disabled = !n && k != null; b.addEventListener('click', () => { INVUI.sub = k; invRender(); }); subs.appendChild(b); } }
  const tools = document.createElement('div'); tools.className = 'tools'; P.appendChild(tools);
  const q = document.createElement('input'); q.type = 'search'; q.placeholder = 'Search items'; q.value = INVUI.q; q.setAttribute('aria-label', 'Search items');
  q.addEventListener('keydown', e => { if (e.code === 'Escape') { q.blur(); return; } e.stopPropagation(); }); q.addEventListener('input', () => { INVUI.q = q.value; const g = P.querySelector('.grid'); if (g) g.replaceWith(invGrid(order)); }); tools.appendChild(q);
  const so = document.createElement('select'); so.setAttribute('aria-label', 'Sort'); for (const [k, l] of INV_SORTS) { const o = document.createElement('option'); o.value = k; o.textContent = 'Sort: ' + l; o.selected = INVUI.sort === k; so.appendChild(o); } so.addEventListener('change', () => { INVUI.sort = so.value; invRender(); }); tools.appendChild(so);
  P.appendChild(invGrid(order));
  if (INVUI.move) { const h = document.createElement('div'); h.className = 'hint'; h.textContent = 'Moving: tap a spot in the grid, an equipment slot or a quick slot. Tap the item again to cancel.'; P.appendChild(h); }
  return P;
}
function invGrid(order) {
  const G = document.createElement('div'); G.className = 'grid'; const list = invFiltered(order), sl = loadoutSlots();
  if (!list.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = INVUI.q ? 'Nothing matches that search.' : 'Nothing here yet. Defeat creatures in the wilds to collect loot.'; G.appendChild(e); return G; }
  for (const [key, m] of list) {
    const c = document.createElement('div'); c.className = 'cell' + (m.span > 1 ? ' w2' : '') + (INVUI.sel === key ? ' sel' : '') + (INVUI.move === key ? ' moving' : ''); c.dataset.key = key; c.tabIndex = 0; c.setAttribute('role', 'button');
    const eqd = (m.kind === 'gun' && (sl.gun === m.id || sl.staff === m.id)) || (m.kind === 'melee' && (S.melee || 'knife') === m.id) || (m.kind === 'ord' && ordSel() === m.id);
    c.innerHTML = `<span class="rb" style="background:${RARITY[m.rar][1]}"></span><span class="nm"></span>${invIconHtml(m.icon, m.col)}${m.kind === 'item' && m.n > 1 ? `<span class="n">${m.n}</span>` : ''}${eqd ? '<span class="eqd">E</span>' : ''}${m.illegal ? '<span class="tri" title="Illegal">▲</span>' : ''}`;
    c.querySelector('.nm').textContent = m.name; c.title = `${m.name}${m.kind === 'item' ? ' ×' + m.n : ''} · ${RARITY[m.rar][0]}`; c.setAttribute('aria-label', c.title);
    c.addEventListener('click', () => { if (INVUI.move) { const k = INVUI.move; INVUI.move = null; if (k !== key) invMoveTo(k, key); else invRender(); return; } INVUI.sel = key; invRender(); });
    c.addEventListener('dblclick', () => { if (m.kind !== 'item') invEquip(key); else if (m.id === 'medkit') invUse(key); });
    c.addEventListener('keydown', e => { if (e.code === 'Enter') { INVUI.sel = key; invRender(); } });
    if (!TOUCH) { c.draggable = true; c.addEventListener('dragstart', e => { INVUI.drag = key; c.classList.add('drag'); try { e.dataTransfer.setData('text/plain', key); e.dataTransfer.effectAllowed = 'move'; } catch (_) {} });
      c.addEventListener('dragend', () => { c.classList.remove('drag'); INVUI.drag = null; INVUI.el && INVUI.el.querySelectorAll('.ok,.bad').forEach(x => x.classList.remove('ok', 'bad')); });
      invDropTarget(c, k => INVUI.sort === 'manual' && k !== key, k => invMoveTo(k, key)); }
    G.appendChild(c);
  }
  if (INVUI.cat === 'all' && !INVUI.sub && !INVUI.q.trim()) for (let i = Math.max(0, INV_CFG.cap - invSlotsUsed()); i > 0; i--) { const v = document.createElement('div'); v.className = 'cell vac'; v.setAttribute('aria-hidden', 'true'); G.appendChild(v); }
  if (!TOUCH) { G.addEventListener('dragover', e => { if (INVUI.drag && (e.target === G || e.target.classList.contains('vac'))) e.preventDefault(); }); G.addEventListener('drop', e => { if ((e.target !== G && !e.target.classList.contains('vac')) || !INVUI.drag) return; e.preventDefault(); const k = INVUI.drag; INVUI.drag = null; if (INVUI.sort === 'manual') invMoveTo(k, null); }); }
  return G;
}
function invDetailPanel() {
  const P = document.createElement('div'); P.className = 'pan det'; const key = INVUI.sel;
  const close = document.createElement('button'); close.className = 'btn close'; close.textContent = '✕'; close.setAttribute('aria-label', 'Close details'); close.addEventListener('click', () => { INVUI.sel = null; INVUI.el.classList.remove('showdet'); invRender(); }); P.appendChild(close);
  if (!key) { const p = document.createElement('p'); p.textContent = TOUCH ? 'Tap an item to see what it does. Tap Move, then tap a slot, to put it somewhere.' : 'Select an item to see its details. Drag items onto equipment or quick slots, or drag them around the grid to arrange your bag (with Sort set to My layout).'; P.appendChild(p); return P; }
  if (key === 'slot:armor') return invArmorDetail(P);
  if (/^slot:|^q:/.test(key)) { const p = document.createElement('p'); p.textContent = /^q:/.test(key) ? 'Empty quick slot. Select a weapon, medkit or ordnance in your bag and choose a quick slot for it.' : 'Empty slot. Pick a matching item from your bag to equip it.'; P.appendChild(p); return P; }
  const m = invMetaSafe(key); if (!m) { INVUI.sel = null; return P; }
  const big = document.createElement('div'); big.className = 'big'; P.appendChild(big);
  if ((m.kind === 'gun' || m.kind === 'melee') && prevInit()) { try { setPreview(m.kind === 'gun' ? gunPreview(m.id) : meleePreview(m.id), m.name); big.appendChild(PREV.wrap); } catch (_) { big.innerHTML = invIconHtml(m.icon, m.col); } } else big.innerHTML = invIconHtml(m.icon, m.col);
  const h = document.createElement('h3'); h.textContent = m.name; P.appendChild(h);
  const tags = document.createElement('div'); const tag = (t, col) => { const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; s.style.color = col; s.style.borderColor = col; tags.appendChild(s); };
  const catName = (INV_CATS.find(c => c[0] === m.cat) || [0, ''])[1], subName = ((INV_SUBS[m.cat] || []).find(s => s[0] === m.sub) || [0, ''])[1];
  tag(RARITY[m.rar][0], RARITY[m.rar][1]); tag(subName || catName, '#9aa1aa'); if (m.illegal) tag('▲ Illegal', '#e0402a'); P.appendChild(tags);
  const rows = []; const row = (a, b, cls) => rows.push([a, b, cls]);
  const desc = document.createElement('p'); let dtext = '';
  if (m.kind === 'gun') { const g = GUNS[m.id], t = gunTier(m.id), dmg = g.dmg * (1 + 0.08 * t), sl = loadoutSlots(), cur = GUNS[sl[g.mana ? 'staff' : 'gun']];
    const cmp = (v, cv, inv) => cur && cur !== g ? ` <small class="${(inv ? v < cv : v > cv) ? 'up' : 'dn'}">${(v - cv) > 0 ? '+' : ''}${Math.round((v - cv) * 10) / 10}</small>` : '';
    const cd = cur ? cur.dmg * (1 + 0.08 * gunTier(sl[g.mana ? 'staff' : 'gun'])) : 0;
    row('Damage per hit', Math.round(dmg) + cmp(dmg, cd)); row('Fire rate', (1 / g.rate).toFixed(1) + '/s' + cmp(1 / g.rate, cur ? 1 / cur.rate : 0)); row('Damage per second', Math.round(dmg / g.rate) + cmp(dmg / g.rate, cur ? cd / cur.rate : 0));
    row(g.mana ? 'Mana charges' : 'Magazine', g.mag + cmp(g.mag, cur ? cur.mag : 0)); row(g.mana ? 'Recharge' : 'Reload', g.reload + 's' + cmp(g.reload, cur ? cur.reload : 0, true)); row('Ammunition', g.mana ? 'Mana, refills by itself' : 'Unlimited reserve'); row('Upgrade tier', t ? '★'.repeat(t) : 'None'); row('Needs level', g.req || 1);
    dtext = (g.mana ? 'A staff. It draws on mana instead of ammo and recharges between casts. ' : `A ${gunKind(m.id)}. `) + (cur && cur !== g ? `Green and red numbers compare it with your ${cur.name}.` : 'This is the one you carry in that slot.'); }
  else if (m.kind === 'melee') { const M = MELEE[m.id], cur = MELEE[S.melee || 'knife']; const cmp = (v, cv, inv) => cur !== M ? ` <small class="${(inv ? v < cv : v > cv) ? 'up' : 'dn'}">${(v - cv) > 0 ? '+' : ''}${Math.round((v - cv) * 100) / 100}</small>` : '';
    row('Damage per swing', M.dmg + cmp(M.dmg, cur.dmg)); row('Swing time', M.rate + 's' + cmp(M.rate, cur.rate, true)); row('Reach', M.reach + ' m' + cmp(M.reach, cur.reach)); row('Durability', 'Never breaks'); row('Needs level', M.req || 1);
    dtext = 'Melee weapon. Swing with F or right click.' + (cur !== M ? ` Numbers compare it with your ${cur.name}.` : ''); }
  else if (m.kind === 'ord') { const O = ORD[m.id]; row('Damage', O.dmg); row('Blast radius', O.r + ' m'); row('Charges', '3, recharging every 9s'); row('Unlocks at level', O.lvl); dtext = O.desc + '. Throw with the NADE button or your ordnance key.'; }
  else { const I = ITEMS[m.id]; row('Quantity', m.n); row('Weight', (m.w * m.n).toFixed(1) + ' kg' + (m.n > 1 ? ` (${m.w} each)` : '')); if (!I.quest) row('Sells for', `${sellPrice(m.id)} cr each`);
    const uses = []; try { for (const p of Object.values(PIECES)) if (p.cost && p.cost[m.id]) uses.push(p.name); } catch (_) {}
    if (m.id === 'medkit') { row('Effect', '+50 health'); row('Duration', 'Instant'); dtext = 'Patches you up in a hurry. Press H, tap the ✚ button, or put it in a quick slot.'; }
    else if (I.quest) { const q = Object.values(QDEFS).find(Q => (Q.obj || []).some(o => o.t === m.id)); dtext = 'Quest item. It can\'t be sold or dropped.' + (q ? ` Needed for “${q.title}”.` : ''); }
    else if (I.fish) dtext = m.sub === 'junk' ? 'Something that came up on your fishing line. Worth almost nothing.' : 'A fish you caught. Fish buyers pay double.';
    else dtext = I.desc || (m.cat === 'val' ? 'Valuable loot. Sell it at a store for a good price.' : 'Loot from the wilds. Sell it at a store.');
    if (uses.length) dtext += ` Used to build: ${[...new Set(uses)].slice(0, 4).join(', ')}.`; if (UPG_MATS.has(m.id)) dtext += ' Used for gun upgrades at the armory workbench.'; if (questWants(m.id)) dtext += ' A quest you are on needs this.'; }
  desc.textContent = dtext; P.appendChild(desc);
  const tb = document.createElement('table'); for (const [a, b] of rows) { const tr = document.createElement('tr'); const td1 = document.createElement('td'); td1.textContent = a; const td2 = document.createElement('td'); td2.innerHTML = String(b); tr.append(td1, td2); tb.appendChild(tr); } P.appendChild(tb);
  // actions that make sense for this item
  const A = document.createElement('div'); A.className = 'acts'; P.appendChild(A); const act = (l, fn, pri, dis) => { const b = document.createElement('button'); b.className = 'btn' + (pri ? ' pri' : ''); b.textContent = l; b.disabled = !!dis; b.addEventListener('click', fn); A.appendChild(b); };
  const sl = loadoutSlots(), equipped = (m.kind === 'gun' && (sl.gun === m.id || sl.staff === m.id)) || (m.kind === 'melee' && (S.melee || 'knife') === m.id) || (m.kind === 'ord' && ordSel() === m.id);
  if (m.kind === 'gun') { if (!equipped || S.gun !== m.id || handMelee()) act(equipped ? 'Hold' : 'Equip', () => invEquip(key), true); if (equipped) act('Unequip', () => invUnequip(isStaffId(m.id) ? 'staff' : 'gun')); }
  if (m.kind === 'melee') { if (!equipped) act('Equip', () => invEquip(key), true); else if (m.id !== 'knife') act('Unequip', () => invUnequip('melee')); }
  if (m.kind === 'ord' && !equipped) act('Select', () => invEquip(key), true);
  if (m.id === 'medkit' && m.kind === 'item') act('Use', () => invUse(key), true, player.hp >= maxHp());
  if (m.kind === 'item' && !ITEMS[m.id].quest) { act('Drop 1', () => invDrop(m.id, 1)); if (m.n > 2) act(`Drop ${Math.floor(m.n / 2)}`, () => invDrop(m.id, Math.floor(m.n / 2))); if (m.n > 1) act(`Drop all ${m.n}`, () => invDrop(m.id, m.n)); }
  if (invQuickOk(key)) { const qi = S.quick.indexOf(key); if (qi >= 0) act(`Remove from quick ${qi + 4}`, () => invAssignQuick(qi, null)); else act('Add to quick slot', () => { const free = S.quick.indexOf(null); invAssignQuick(free >= 0 ? free : INV_CFG.quick - 1, key); }); }
  act(INVUI.move === key ? 'Cancel move' : 'Move', () => { INVUI.move = INVUI.move === key ? null : key; if (INVUI.move && window.innerWidth < 900) INVUI.el.classList.remove('showdet'); invRender(); if (INVUI.move) INVUI.el.classList.remove('showdet'); });
  if (m.kind === 'item' && ITEMS[m.id].quest) { const n = document.createElement('div'); n.className = 'hint'; n.textContent = 'Quest items stay in your bag until the quest takes them.'; P.appendChild(n); }
  return P;
}
function invArmorDetail(P) {
  const L = myLook(), A = ARMORS[L.a] || ARMORS.std, h = document.createElement('h3'); h.textContent = A.name; P.appendChild(h);
  const p = document.createElement('p'); p.textContent = `Armor reduces the damage you take. Wearing it: −${Math.round((A.def || 0) * 100)}% damage. Other players see your armor.`; P.appendChild(p);
  const acts = document.createElement('div'); acts.className = 'acts'; P.appendChild(acts);
  for (const [id, it] of Object.entries(ARMORS)) { if (!lookUnlocked(ARMORS, id)) continue; const b = document.createElement('button'); b.className = 'btn' + (L.a === id ? ' pri' : ''); b.textContent = `${it.name}${it.def ? ' · −' + Math.round(it.def * 100) + '%' : ''}`; b.disabled = L.a === id; b.addEventListener('click', () => invWear(id)); acts.appendChild(b); }
  if (L.a !== 'std') { const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Unequip'; b.addEventListener('click', () => invUnequip('armor')); acts.appendChild(b); }
  const n = document.createElement('div'); n.className = 'hint'; n.textContent = 'Buy more sets, capes and helmets in the Wardrobe.'; P.appendChild(n); return P;
}
