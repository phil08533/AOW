// =================== PHASE 5: THE OUTLAW UNDERWORLD ===================
// Outlaw rep, contraband, underworld basements and McKlunkies on every planet, Marshal bounties and outlaw hits
// on players (shared through everyone's leaders/<id> record), NPC hunter squads, merchant raids in space, wanderers.
// New, optional save field (old saves start Clean): S.out.
const OUT_TIERS = [[0, 'Clean', '#8fd0a0'], [10, 'Shady', '#c9b27c'], [40, 'Outlaw', '#e0a040'], [80, 'Wanted', '#e0603a'], [150, 'Most Wanted', '#ff2a3a']];
const OUT_WORLDS = ['earth', 'mezar', 'capitone', 'robot', 'ocean', 'moon', 'fort', 'skycity', 'zarlich', 'vector', 'forestlife'];
function outS() { S.out = S.out || {}; const O = S.out; O.rep = O.rep || 0; O.bounty = O.bounty || 0; O.oh = O.oh || []; O.oc = O.oc || []; return O; }
function outTier() { const r = outS().rep; let t = 0; OUT_TIERS.forEach((x, i) => { if (r >= x[0]) t = i; }); return t; }
const outTierName = () => OUT_TIERS[outTier()][1];
const isOutlaw = () => outTier() >= 2;
const isWanted = () => outTier() >= 3 || !!outS().lab;
function crime(n, why) {
  const O = outS(), before = outTier(), wasWanted = isWanted();
  O.rep = Math.min(400, O.rep + n); O.crimeT = Date.now();
  if (isWanted()) { if (!wasWanted || !O.bounty) { O.bounty = 300 + O.rep * 10; O.growT = O.obT = Date.now(); toast('WANTED', `The Marshals put a ${O.bounty.toLocaleString()} cr bounty on you`, 4); SFX.hit(); log(`You're Wanted. Marshal hunters will come for you, and other players can take your bounty.`, 'loot'); O.huntT = Date.now() + 60000; }
    else O.bounty += n * 25; }
  else if (outTier() > before) toast(OUT_TIERS[outTier()][1].toUpperCase(), why || 'Your outlaw rep went up', 2.5);
  if (why) log(`${why} (+${n} outlaw rep)`, 'loot'); outHud(); markDirty(); outPush();
}
function goodDeed(n, why) {
  const O = outS(); if (!O.rep) return; O.rep = Math.max(0, O.rep - n); if (why) log(`${why} (−${n} outlaw rep)`); clearIfClean(); outHud(); markDirty();
}
function clearIfClean() { const O = outS(); if (!isWanted() && O.bounty) { O.bounty = 0; log('The Marshals dropped your bounty. Your name is clear for now.', 'loot'); toast('BOUNTY DROPPED', 'You lay low long enough', 3); outPush(); } }
// rep cools off, bounty grows, hunters come
setInterval(() => { try {
  if (state !== 'play' || !S.out) return; const O = outS(), now = Date.now();
  if (O.rep > 0 && now - (O.crimeT || 0) > 5 * 60000 && now - (O.decT || 0) > 3 * 60000) { O.decT = now; O.rep = Math.max(0, O.rep - 1); clearIfClean(); markDirty(); }
  if (isWanted() && O.bounty && now - (O.growT || now) > 3 * 60000) { O.growT = now; O.bounty = Math.round(O.bounty * (hasGear('ghostid') ? 1.025 : 1.05)); markDirty(); outPush(); }
  if (isWanted() && now > (O.huntT || 0)) huntersCome();
  outHud();
} catch (err) { console.warn('outlaw tick', err); } }, 5000);

// ---- HUD chip: tier, bounty, and a hit on you ----
let outChip = null;
function outHud() {
  if (!outChip) { outChip = document.createElement('span'); outChip.className = 'vchip'; outChip.style.cursor = 'pointer'; outChip.hidden = true; outChip.addEventListener('click', () => openOutlawCard()); const host = document.getElementById('vchips'); if (host) host.appendChild(outChip); else return; }
  const O = outS(), t = outTier(), hitOnMe = (OUTB.board || []).some(h => h.kind === 'hit' && h.to === LBU());
  outChip.hidden = !O.rep && !hitOnMe && !O.hunt; if (outChip.hidden) return;
  outChip.style.color = OUT_TIERS[t][2]; outChip.style.borderColor = OUT_TIERS[t][2];
  outChip.textContent = (isWanted() && O.bounty ? `⚠ WANTED ${O.bounty.toLocaleString()} cr` : `☠ ${OUT_TIERS[t][1]} ${O.rep}`) + (hitOnMe ? ' · HIT ON YOU' : '') + (O.hunt ? ` · hunting ${O.hunt.nick}` : '');
}
function openOutlawCard() {
  const O = outS(), t = outTier(), next = OUT_TIERS[t + 1];
  openDlg('Outlaw record', OUT_TIERS[t][1]);
  $('dlgLine').textContent = `Outlaw rep ${O.rep}${next ? ` (${next[1]} at ${next[0]})` : ''}. ${isWanted() ? `Marshal bounty: ${O.bounty.toLocaleString()} cr, growing while you're Wanted. Hunters will come. Marshal Rook on the Zeltac can clear it for ${payoffCost().toLocaleString()} cr.` : O.rep ? 'Lie low: rep cools off a little every few minutes once you stop committing crimes.' : 'Clean as a whistle.'}${O.lab ? ' Your drug lab keeps you on the Marshals\' list.' : ''}${O.hunt ? ` You're hunting ${O.hunt.nick} for ${O.hunt.amt.toLocaleString()} cr.` : ''}`;
  acts([...(O.hunt ? [['Drop contract', () => { O.hunt = null; markDirty(); outPush(); outHud(); closeDlg(); log('Contract dropped.'); }]] : []), ['Close', closeDlg, true]]);
}

// ---- contraband: ordinary inventory items with the illegal tag ----
Object.assign(ITEMS, {
  voidspice: { name: 'Void Spice', v: 45, col: '#c86aff', illegal: true },
  gunparts: { name: 'Unregistered Gun Parts', v: 70, col: '#8a8f99', illegal: true },
  forgedid: { name: 'Forged ID Chips', v: 60, col: '#4fd2ff', illegal: true },
  credsticks: { name: 'Counterfeit Credsticks', v: 90, col: '#6fdc5a', illegal: true },
  stolencargo: { name: 'Stolen Cargo Crate', v: 120, col: '#c9a43a', illegal: true },
  lootedrelic: { name: 'Looted Relic', v: 180, col: '#ffb347', illegal: true },
  klunkburger: { name: 'Klunk Burger', v: 6, col: '#e0a040', use: true, food: true, sub: 'food', heal: 60 },
  klunkfries: { name: 'Klunk Fries', v: 3, col: '#ffd36a', use: true, food: true, sub: 'food', heal: 25 },
  megaklunk: { name: 'Mega Klunk', v: 20, col: '#c8402f', use: true, food: true, sub: 'food', heal: 9999 },
  forgedpapers: { name: 'Forged Papers', v: 400, col: '#d8cbb0', illegal: true, papers: true },
  treasuryledger: { name: 'Treasury Ledger', v: 0, col: '#ffd36a', quest: true },
});
const CONTRA = ['voidspice', 'gunparts', 'forgedid', 'credsticks', 'stolencargo', 'lootedrelic'];
const ITEM_DESC = { voidspice: 'Glittering purple dust from the void lanes. Very illegal, very popular.', gunparts: 'Gun parts with the serial numbers ground off.', forgedid: 'Blank identity chips, ready to become anyone.', credsticks: 'Fake credits good enough to fool a vending machine.', stolencargo: 'A sealed cargo crate with a merchant guild stamp. Not yours.', lootedrelic: 'An ancient relic someone was supposed to leave in a tomb.',
  klunkburger: 'A McKlunkies classic. Heals 60.', klunkfries: 'Hot, salty, heals 25.', megaklunk: 'Three patties of questionable origin. Full heal.', forgedpapers: 'Use to wipe 30 outlaw rep off your record.' };
for (const k in ITEM_DESC) if (ITEMS[k]) ITEMS[k].desc = ITEM_DESC[k];
const contraOnly = k => ITEMS[k] && ITEMS[k].illegal;
GEAR.ghostid = { name: 'Ghost Transponder', desc: 'Your bounty grows half as fast and hunters show up less often', col: '#c86aff' };
ARMORS.outlaw = { name: 'Outlaw Leathers', lvl: 1, flag: 'outlawArmor', def: 0.15, trim: '#8a3a2e', visor: '#ff8a2a' };
CAPES.outlaw = { name: 'Outlaw Duster', lvl: 1, flag: 'outlawArmor', col: '#3a2a20', trim: '#c9a43a' };
// eating and forged papers work from the bag and quick slots
function outUseItem(id) {
  const I = ITEMS[id]; if (!I || !(S.inv[id] > 0)) return false;
  if (I.heal) { if (player.hp >= maxHp()) { log('Already at full health.'); return true; } S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; player.hp = Math.min(maxHp(), player.hp + I.heal); log(`Ate a ${I.name}${I.heal < 9999 ? ` (+${I.heal} health)` : ' (full heal)'}. Mmm.`); burst(player.pos.clone().add(V(0, 1.2, 0)), '#ffd36a', 14, 3); SFX.ui(); markDirty(); return true; }
  if (I.papers) { const O = outS(); if (!O.rep) { log('Your record is already clean.'); return true; } S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; goodDeed(30, 'Forged Papers filed'); SFX.ui(); return true; }
  return false;
}
const OUTB = { board: [], boardT: 0, noContra: false };

// ---- finding a quiet spot on the outskirts of a world ----
function outSpot(seed, lo, hi) {
  // first pass: the quiet outskirts; second pass (small or watery worlds): anywhere dry that isn't a safe town
  for (let i = 0; i < 180; i++) {
    const wide = i >= 90; if (wide) { lo = 0.15; hi = 0.92; }
    const a = seed * 2.39 + i * 0.73, d = WORLD_R * (lo + ((i * 7) % 10) / 10 * (hi - lo)), x = WORLD_C.x + Math.cos(a) * d, z = WORLD_C.z + Math.sin(a) * d;
    if (!LEVEL.terrain) return { x, z }; const h = groundH(x, z); if (h < WATER_Y + 0.3) continue;
    let ok = true; for (const [dx, dz] of [[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2], [-2, -2]]) { const g = groundH(x + dx, z + dz); if (Math.abs(g - h) > 0.7 || g < WATER_Y + 0.25) { ok = false; break; } } if (!ok) continue;
    if (LAVA.some(l => Math.hypot(x - l[0], z - l[1]) < l[2] + 6)) continue;
    if (ZONES.some(zn => (!wide || zn.safe) && Math.hypot(x - zn.x, z - zn.z) < zn.r + 5)) continue;
    if (SAFES.some(s => s.r < 100 && Math.hypot(x - s.x, z - s.z) < s.r + 6)) continue;
    if (CIRCLES.some(c => Math.hypot(x - c[0], z - c[1]) < c[2] + 4) || BOXES.some(b => Math.abs(x - b[0]) < b[2] + 4 && Math.abs(z - b[1]) < b[3] + 4)) continue;
    if (OUTB.taken && OUTB.taken.some(p => Math.hypot(x - p.x, z - p.z) < 18)) continue;
    return { x, z };
  }
  return null;
}
const outSeed = id => { let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973; return h; };

// ---- the hatch, McKlunkies and a scavenger trader on every world ----
const MCK = { col: '#c8402f', yel: '#ffd36a' };
function buildHatch(x, z) {
  const y = groundH(x, z), g = new THREE.Group(); g.position.set(x, y, z); levelGroup.add(g);
  part(g, Cy(1.25, 1.35, 0.25, 12), toon('#3a3d44'), 0, 0.12, 0); part(g, Cy(1.0, 1.0, 0.06, 12), toon('#26232a'), 0, 0.27, 0);
  for (let i = 0; i < 4; i++) part(g, B(1.9, 0.05, 0.12), toon('#5d636c'), 0, 0.31, -0.6 + i * 0.4);
  const lamp = part(g, new THREE.SphereGeometry(0.12, 8, 6), glow('#c86aff'), 0.9, 0.4, 0.6);
  const crate = part(g, B(0.9, 0.7, 0.9), toon('#5a4a3a'), -2.0, 0.35, 0.6, 0, 0.4); part(g, B(0.7, 0.5, 0.7), toon('#3a2e26'), -2.1, 0.95, 0.5, 0, 0.9);
  const pl = new THREE.PointLight(0xa070ff, 0.6, 8); pl.position.set(0.9, 1, 0.6); g.add(pl);
  levelAnims.push(t => { lamp.material = glow(Math.sin(t * 2) > 0 ? '#c86aff' : '#5a2a7a'); });
  box(x - 2.0, z + 0.6, 0.6, 0.6); solid(x, z, 1.1);
  INTERACTS.push({ x, z: z + 1.8, r: 2.4, label: 'Climb down the hatch (underworld basement)', fn: () => enterUnderworld(x, z) });
}
function buildMcK(x, z, face) {
  const y = groundH(x, z), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = face; levelGroup.add(g);
  part(g, B(4.6, 2.4, 2.6), toon('#e8e4dc'), 0, 1.2, -0.4); part(g, B(4.8, 0.3, 3.2), toon(MCK.col), 0, 2.55, -0.2);
  for (let i = 0; i < 6; i++) part(g, B(0.8, 0.12, 0.6), toon(i % 2 ? MCK.col : '#ffffff'), -2 + i * 0.8, 2.3, 1.25, 0.5);
  part(g, B(3.8, 1.0, 0.1), toon('#1e1c22'), 0, 1.6, 0.92); part(g, B(4.4, 1.0, 0.5), toon(MCK.col), 0, 0.5, 1.15);
  part(g, B(4.4, 0.06, 0.6), toon('#c9c4bc'), 0, 1.02, 1.15);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.9), new THREE.MeshBasicMaterial({ map: signTex("McKLUNKIES", MCK.col, MCK.yel) })); sign.position.set(0, 3.3, 1.0); g.add(sign);
  const pole = part(g, Cy(0.1, 0.12, 4.5, 6), toon('#5d636c'), 2.9, 2.25, 1.3);
  const bun = new THREE.Group(); bun.position.set(2.9, 4.9, 1.3); g.add(bun);
  part(bun, new THREE.SphereGeometry(0.62, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d8903a'), 0, 0.12, 0); part(bun, Cy(0.66, 0.66, 0.14, 12), toon('#5a3020'), 0, 0.02, 0); part(bun, Cy(0.7, 0.7, 0.05, 12), toon('#6fdc5a'), 0, 0.11, 0); part(bun, Cy(0.6, 0.6, 0.18, 12), toon('#d8903a'), 0, -0.14, 0);
  levelAnims.push(t => { bun.rotation.y = t * 0.9; });
  for (const s of [-1, 1]) { const tb = new THREE.Group(); tb.position.set(s * 2.0, 0, 3.4); g.add(tb); part(tb, Cy(0.6, 0.6, 0.06, 10), toon('#ffffff'), 0, 0.75, 0); part(tb, Cy(0.06, 0.06, 0.75, 6), toon('#5d636c'), 0, 0.37, 0); }
  const pl = new THREE.PointLight(0xffd36a, 0.8, 10); pl.position.set(0, 2, 2); g.add(pl);
  // the order bot: a big smiling robot face on a screen in the wall (2.13)
  part(g, B(1.7, 1.35, 0.16), toon('#5d636c'), 0, 1.72, 0.96); part(g, B(0.5, 0.18, 0.1), toon('#3a3d44'), 0, 0.98, 1.0);
  const fc = document.createElement('canvas'); fc.width = 256; fc.height = 200; const ft = new THREE.CanvasTexture(fc); ft.encoding = THREE.sRGBEncoding;
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.17), new THREE.MeshBasicMaterial({ map: ft })); fm.position.set(0, 1.72, 1.05); g.add(fm);
  const F = { talk: 0, blink: 0, look: 0, last: -1 };
  const drawFace = (t) => { const x = fc.getContext('2d'); x.fillStyle = '#1e1c22'; x.fillRect(0, 0, 256, 200);
    const gr = x.createRadialGradient(128, 96, 10, 128, 100, 110); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(1, '#ffc93a'); x.fillStyle = gr; x.beginPath(); x.ellipse(128, 100, 104, 90, 0, 0, Math.PI * 2); x.fill();
    x.lineWidth = 6; x.strokeStyle = '#c8402f'; x.stroke();
    const bl = F.blink > 0, lx = F.look * 6; x.fillStyle = '#1e1c22';
    for (const ex of [88, 168]) { if (bl) { x.fillRect(ex - 16, 70, 32, 6); } else { x.beginPath(); x.ellipse(ex, 72, 17, 21, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(ex - 5 + lx, 64, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#1e1c22'; } }
    x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(66, 46); x.lineTo(104, 38 - (F.talk > 0 ? 6 : 0)); x.moveTo(152, 38 - (F.talk > 0 ? 6 : 0)); x.lineTo(190, 46); x.stroke();
    // the grin: huge, toothy, and very, very happy to take your order
    const open = F.talk > 0 ? 10 + Math.abs(Math.sin(t * 14)) * 22 : 6;
    x.fillStyle = '#5a1e2a'; x.beginPath(); x.moveTo(52, 112); x.quadraticCurveTo(128, 150 + open, 204, 112); x.quadraticCurveTo(128, 128 + open * 0.3, 52, 112); x.fill();
    x.fillStyle = '#ffffff'; for (let i = 0; i < 8; i++) { const tx = 66 + i * 17.5, ty = 114 + Math.sin((i + 0.5) / 8 * Math.PI) * 10; x.fillRect(tx, ty, 14, 9); }
    x.strokeStyle = '#1e1c22'; x.lineWidth = 5; x.beginPath(); x.moveTo(52, 112); x.quadraticCurveTo(128, 150 + open, 204, 112); x.stroke(); x.beginPath(); x.arc(48, 110, 7, 0, Math.PI * 2); x.arc(208, 110, 7, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#ff8a7a'; x.globalAlpha = 0.5; x.beginPath(); x.arc(58, 92, 13, 0, Math.PI * 2); x.arc(198, 92, 13, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    ft.needsUpdate = true; };
  drawFace(0); let say = 0;
  levelAnims.push(t => { if (!fm.parent) return; const wp = fm.getWorldPosition(new THREE.Vector3()), d = wp.distanceTo(player.pos); if (d > 30) return;
    if (d < 5 && !say) { say = 1; F.talk = 2.2; SFX.ui(); log(['ORDER-BOT: WELCOME TO McKLUNKIES! HOME OF THE KLUNK! WOULD YOU LIKE TO KLUNK IT UP?', 'ORDER-BOT: HELLO, VALUED CUSTOMER! I AM SMILING! I AM ALWAYS SMILING!', 'ORDER-BOT: EVERYTHING IS MADE FRESH. FRESH FROM WHERE IS A TRADE SECRET.'][Math.floor(Math.random() * 3)]); }
    if (d > 9) say = 0;
    const dt = F.last < 0 ? 0 : Math.min(0.1, t - F.last); F.last = t; F.talk -= dt; F.blink -= dt; if (Math.random() < dt * 0.4) F.blink = 0.14;
    F.look = Math.max(-1, Math.min(1, (player.pos.x - wp.x) * 0.15));
    if (((t * 12) | 0) !== F.fr) { F.fr = (t * 12) | 0; drawFace(t); } });
  const c = Math.cos(face), s = Math.sin(face), wx = (lx, lz) => x + lx * c + lz * s, wz = (lx, lz) => z - lx * s + lz * c;
  box(wx(0, -0.2), wz(0, -0.2), 2.4, 1.6); for (const k of [-1, 1]) solid(wx(k * 2, 3.4), wz(k * 2, 3.4), 0.6);
  return { x: wx(0, 2.3), z: wz(0, 2.3) };
}
// worlds with too little dry land for the search get hand-picked spots
const OUT_FIX = { ocean: { h: { x: -62, z: 18 }, m: { x: -44, z: 28 } } };
function outlawWorldDressing(id) {
  OUTB.taken = []; const sd = outSeed(id), fx = OUT_FIX[id];
  const h = fx ? fx.h : outSpot(sd, 0.55, 0.8); if (h) { OUTB.taken.push(h); buildHatch(h.x, h.z); OUTB.hatch = h;
    const tx = h.x + 3.2, tz = h.z - 1.5; makeNpc({ id: 'scav_' + id, name: 'Scavenger Pike', role: 'Wanderer · trades anything', rig: 'civ', make: () => makeCivilian('#6a5a3a', '#3a3430', '#c58a64', '#8a8f99', '#c9a43a'), x: tx, z: tz, face: -1.2, shop: 'store',
      idle: ["Don't mind me. Just a humble scavenger. Humbly scavenging.", "The hatch? Never seen it. What hatch. Go on down if you want, tell 'em Pike sent you.", "I buy, I sell, I don't ask where it came from."] }, [0, 0]); }
  const m = fx ? fx.m : outSpot(sd + 41, 0.5, 0.82); if (m) { OUTB.taken.push(m); const face = Math.atan2(WORLD_C.x - m.x, WORLD_C.z - m.z); const at = buildMcK(m.x, m.z, face);
    INTERACTS.push({ x: at.x, z: at.z, r: 2.6, label: '🍔 Order at McKlunkies', fn: () => openMcK() }); }
  spawnWanderers(sd);
}
for (const id of OUT_WORLDS) { const L = LEVELS[id]; if (!L) continue; const orig = L.build; L.build = function () { orig.call(this); try { outlawWorldDressing(id); } catch (err) { console.warn('outlaw dressing', id, err); } }; }

// ---- McKlunkies counters ----
const MCK_MENU = [['klunkfries', 12], ['klunkburger', 25], ['megaklunk', 120]];
function openMcK() {
  openDlg('McKlunkies', 'Order-Bot'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `ORDER-BOT: WHAT WILL IT BE, FRIEND? :) You have ${S.cr.toLocaleString()} cr. Food goes in your bag: eat it from there, or put it in a quick slot.`;
    itemRows(rows, MCK_MENU.map(([k, p]) => [k, null, `${p} cr · ${ITEMS[k].heal >= 9999 ? 'full heal' : '+' + ITEMS[k].heal + ' health'}`, [['Buy', () => buy(k, p, 1)], ['Buy 5', () => buy(k, p, 5)]]])); };
  const buy = (k, p, n) => { if (S.cr < p * n) { SFX.hit(); log("Not enough credits."); return; } if (invRoomFor(k) < n) { invFullNote(k); return; } S.cr -= p * n; S.inv[k] = (S.inv[k] || 0) + n; S.invT = S.invT || {}; S.invT['i:' + k] = Date.now(); SFX.coin(); log(`+${n} ${ITEMS[k].name}`, 'loot'); markDirty(); render(); };
  $('dlgActs').before(rows); acts([['Back counter', () => openMcKBack()], ['Done', closeDlg, true]]); render();
}
function openMcKBack() {
  openDlg('McKlunkies', 'The back counter');
  if (outTier() < 1) { $('dlgLine').textContent = "ORDER-BOT: BACK COUNTER? THERE IS NO BACK COUNTER. THIS IS A FAMILY RESTAURANT. :) (Come back when you've got a bit of a reputation.)"; acts([['Order food', () => openMcK()], ['Done', closeDlg, true]]); return; }
  openFence('McKlunkies', 'The back counter', subsOn() ? "ORDER-BOT (whispering, still smiling): WE BUY WHAT THE SHOPS WON'T. AND WE SELL A LITTLE SOMETHING TOO." : "ORDER-BOT (whispering, still smiling): WE BUY WHAT THE SHOPS WON'T.", 1.0);
  if (subsOn()) acts([['Buy substances', () => openSubShop('McKlunkies', 'The back counter', MCK_SUBS)], ['Done', closeDlg, true]]);
}
// ---- the Fence: buys contraband (and regular loot for 20% more) ----
function openFence(role, name, line, contraMult) {
  openDlg(role, name); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `${line} You have ${S.cr.toLocaleString()} cr.`;
    const list = Object.entries(S.inv).filter(([k, n]) => ITEMS[k] && n > 0 && !ITEMS[k].quest && k !== 'medkit' && !ITEMS[k].food).sort((a, b) => (ITEMS[b[0]].illegal ? 1 : 0) - (ITEMS[a[0]].illegal ? 1 : 0));
    itemRows(rows, list.map(([k, n]) => [k, n, `${fencePrice(k, contraMult)} cr each${ITEMS[k].illegal ? ' ▲' : ''}`, [['Sell 1', () => sell(k, 1)], ['Sell all', () => sell(k, S.inv[k] || 0)]]])); };
  const sell = (k, n) => { n = Math.min(n, S.inv[k] || 0); if (n < 1) return; const p = fencePrice(k, contraMult) * n; S.cr += p; S.inv[k] -= n; if (!S.inv[k]) delete S.inv[k]; SFX.coin(); log(`Sold ${n} ${ITEMS[k].name} for ${p} cr`, 'loot'); if (ITEMS[k].illegal) crime(Math.min(10, n), 'Fenced contraband'); markDirty(); renderQuest(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
const fencePrice = (k, m) => ITEMS[k].illegal ? Math.round(ITEMS[k].v * (m || 1)) : Math.ceil(sellPrice(k) * 1.2);
// ---- the black-market dealer ----
const BM_STOCK = [
  { id: 'forgedpapers', name: 'Forged Papers', price: 2500, desc: 'Wipes 30 outlaw rep. One use.', buy: () => { S.inv.forgedpapers = (S.inv.forgedpapers || 0) + 1; } },
  { id: 'ghostid', name: 'Ghost Transponder', price: 6000, desc: 'Gear: bounty grows half as fast, hunters come less often.', own: () => hasGear('ghostid'), buy: () => S.gear.push('ghostid') },
  { id: 'outlawArmor', name: 'Outlaw Leathers + Duster', price: 8000, desc: 'Armor (−15% damage) and a long coat. Wardrobe.', own: () => !!(S.flags && S.flags.outlawArmor), buy: () => { S.flags = S.flags || {}; S.flags.outlawArmor = true; } },
  { id: 'voidspice', name: 'Void Spice (to resell)', price: 30, desc: 'Buy low, fence high. Still contraband.', buy: () => { S.inv.voidspice = (S.inv.voidspice || 0) + 1; } },
];
function openBlackMarket(who) {
  openDlg('Black market', who); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = `${isOutlaw() ? "For you? Anything." : "I only sell to people with a reputation. Outlaws only, sweetheart."} You have ${S.cr.toLocaleString()} cr.`;
    for (const it of BM_STOCK) { if (it.show && !it.show()) continue; const r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = '#c86aff';
      const nm = document.createElement('span'); nm.textContent = `${it.name} · ${it.desc}`; const mt = document.createElement('span'); mt.className = 'meta'; const own = it.own && it.own(); mt.textContent = own ? 'Owned' : it.price.toLocaleString() + ' cr';
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = own ? '✓' : 'Buy'; b.disabled = own || !isOutlaw() || S.cr < it.price;
      b.addEventListener('click', () => { if (S.cr < it.price || !isOutlaw()) return; if (ITEMS[it.id] && invRoomFor(it.id) < 1) { invFullNote(it.id); return; } S.cr -= it.price; it.buy(); SFX.coin(); log(`Bought ${it.name}.`, 'loot'); markDirty(); render(); });
      r.append(dot, nm, mt, b); rows.appendChild(r); } };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}

// ---- the underworld basement (one shared den, you climb out where you came in) ----
const UW = { from: null };
function enterUnderworld(x, z) { UW.from = { lv: LEVEL.id, x, z: z + 2.5 }; SFX.door(); travel('underworld'); }
function leaveUnderworld() { const f = UW.from || { lv: 'earth' }; UW.from = null; SFX.door(); travel(f.lv, f.x != null ? { at: { x: f.x, z: f.z, yaw: 0 } } : undefined); }
LEVELS.underworld = {
  id: 'underworld', name: 'The Underworld', tag: 'A basement that isn\'t on any map', lvls: 'No law', size: 60, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#1a141e' }, zones: [{ id: 'den', name: 'The Underworld', lvl: 'No law · no fighting', x: 0, z: 0, r: 16, col: '#1a141e', safe: true, h: 0 }], paths: [], river: [], pools: [], lava: [],
  safes: [{ x: 0, z: 0, r: 300 }], spawn: { x: 0, z: 9, yaw: 0 }, menu: { x: 0, z: 0, r: 10, h: 3 }, npcBase: [0, 0], spawns: [],
  npcs: [
    { id: 'fence', name: 'Sly Marlo', role: 'The Fence · buys anything', rig: 'civ', make: () => makeCivilian('#3a2a4a', '#1e1c22', '#c58a64', '#1e1c22', '#c86aff'), x: -7, z: -6, face: 0.6, custom: [['Sell', () => openFence('The Fence', 'Sly Marlo', "Contraband at full price, everything else at 20% over the shops. No questions.", 1.0)]],
      idle: ["Shops won't touch it? I'll touch it. I'll touch anything.", "Every basement on every world connects to this one. Don't ask how. Plumbing.", "Keep your voice down. The Marshals have ears. Mostly they have Rook."] },
    { id: 'vexdeal', name: 'Madame Vex', role: 'Black market', rig: 'civ', make: () => makeCivilian('#5a1e2a', '#1e1c22', '#e8b896', '#c8c8d0', '#ffd36a'), x: 7, z: -6, face: -0.6, custom: [['Black market', () => openBlackMarket('Madame Vex')]],
      idle: ["Papers, transponders, leathers. Everything a growing outlaw needs.", "Clean folk don't shop here. Come back with a reputation."] },
  ],
  build() {
    const W = 12, D = 11, H = 3.4, wallM = toon('#2a2430'), floorM = toon('#1e1a22');
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, D * 2).rotateX(-Math.PI / 2), floorM); props.add(fl); const ce = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, D * 2).rotateX(Math.PI / 2), toon('#141018')); ce.position.y = H; props.add(ce);
    const wall = (x, z, w, d) => { part(props, B(w, H, d), wallM, x, H / 2, z); box(x, z, w / 2, d / 2); };
    wall(0, -D, W * 2, 0.5); wall(0, D, W * 2, 0.5); wall(-W, 0, 0.5, D * 2); wall(W, 0, 0.5, D * 2);
    for (let x = -W + 2; x < W; x += 4) part(props, Cy(0.1, 0.1, D * 2, 6), toon('#3a3430'), x, H - 0.3, 0, Math.PI / 2);
    // bar counter, neon, crates, a pool table
    part(props, B(8, 1.1, 1.2), toon('#3a2a20'), 0, 0.55, -8.6); part(props, B(8.2, 0.08, 1.4), toon('#5a4a3a'), 0, 1.14, -8.6); box(0, -8.6, 4, 0.6);
    for (let i = 0; i < 7; i++) part(props, Cy(0.08, 0.1, 0.4, 6), glow(['#c86aff', '#6fdc5a', '#ffd36a', '#ff6aa8'][i % 4]), -3 + i, 1.4, -10.4);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1), new THREE.MeshBasicMaterial({ map: signTex('THE UNDERWORLD', '#1a0a20', '#c86aff') })); sign.position.set(0, 2.6, -10.7); props.add(sign);
    for (const [x, z, s] of [[-10, 6, 1], [-9, 8, 0.8], [10, 7, 1.1], [9.6, 4.6, 0.7], [-10.4, -2, 0.9]]) { part(props, B(s, s, s), toon('#5a4a3a'), x, s / 2, z, 0, x); box(x, z, s / 2, s / 2); }
    part(props, B(3, 0.8, 1.6), toon('#1e4a2a'), 0, 0.4, 2); part(props, B(3.2, 0.1, 1.8), toon('#3a2a20'), 0, 0.82, 2); box(0, 2, 1.6, 0.9);
    // the Hit board
    part(props, B(3, 1.8, 0.1), toon('#1e1c22'), -11.7 + 0.1, 1.6, -2, 0, Math.PI / 2); const hb = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6), new THREE.MeshBasicMaterial({ map: signTex('HIT BOARD', '#3a0a0a', '#ff3b2a') })); hb.position.set(-11.6, 2.3, -2); hb.rotation.y = Math.PI / 2; props.add(hb);
    INTERACTS.push({ x: -10, z: -2, r: 2.2, label: 'Hit board (contracts on players)', fn: () => openHitBoard() });
    // the way out
    part(props, B(1.4, H, 0.2), toon('#3a3d44'), 0, H / 2, 10.7); for (let i = 0; i < 8; i++) part(props, B(1.2, 0.06, 0.08), toon('#8a8f99'), 0, 0.3 + i * 0.4, 10.55);
    INTERACTS.push({ x: 0, z: 9.4, r: 2.0, label: 'Climb the ladder back up', fn: leaveUnderworld });
    for (const [x, z, c] of [[-6, -6, 0xc86aff], [6, -6, 0xff6aa8], [0, 4, 0xffd36a]]) { const l = new THREE.PointLight(c, 0.9, 16); l.position.set(x, H - 0.6, z); levelGroup.add(l); }
    LEVEL.name = 'The Underworld' + (UW.from && LEVELS[UW.from.lv] ? ' · under ' + LEVELS[UW.from.lv].name : '');
  }
};
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'underworld') return false; return _po(id); }; }

// ---- wanderers: scavengers and drifters outside the cities, peaceful unless you start it ----
Object.assign(ENEMY, {
  scavenger: { rig: 'civ', name: 'Scavenger', passive: true, wanderer: 'scav', make: () => makeCivilian('#6a5a3a', '#3a3430', '#c58a64', '#5d636c', '#8a8f99'), hp: 120, speed: 2.2, r: 0.45, hy: 0.95, xp: 30, cr: [10, 30], melee: { dmg: 10, rate: 1.2, reach: 1.8 }, drops: [['scrap', 0.6], ['gunparts', 0.12]] },
  drifter: { rig: 'trooper', name: 'Drifter', passive: true, wanderer: 'outlaw', make: () => recolor(makeTrooper(), { '#6f7a3e': '#5a3a2a', '#4a5229': '#3a2a20', '#c9b27c': '#8a6a4a' }), hp: 180, speed: 2.4, r: 0.45, hy: 0.95, xp: 45, cr: [20, 50], ranged: { dmg: 9, rate: 1.4, speed: 15, col: '#ff8a2a', range: 18, keep: 9 }, drops: [['voidspice', 0.25], ['credsticks', 0.12], ['forgedid', 0.12]] },
  mhunter: { rig: 'trooper', name: 'Marshal Hunter', make: () => recolor(makeTrooper(), { '#6f7a3e': '#2a3a7a', '#4a5229': '#1e2a5a', '#c9b27c': '#ffd36a' }), hp: 160, speed: 3.0, r: 0.45, hy: 0.95, xp: 70, cr: [30, 70], ranged: { dmg: 11, rate: 1.1, speed: 18, col: '#4fa8ff', range: 22, keep: 9 }, drops: [['circuit', 0.3]] },
  secguard: { rig: 'trooper', name: 'Hauler Security', make: () => recolor(makeTrooper(), { '#6f7a3e': '#5d636c', '#4a5229': '#3a3d44', '#c9b27c': '#4fd2ff' }), hp: 150, speed: 2.4, r: 0.45, hy: 0.95, xp: 50, cr: [20, 40], ranged: { dmg: 10, rate: 1.3, speed: 16, col: '#4fd2ff', range: 18, keep: 8 }, drops: [['stolencargo', 0.2]] },
});
function spawnWanderers(sd) {
  const lv0 = (LEVEL.zones.map(z => +(String(z.lvl).match(/Lv (\d+)/) || [])[1]).filter(Boolean).sort((a, b) => a - b)[0]) || Math.max(1, S.lvl - 2), lv = [Math.max(1, lv0), Math.max(1, lv0) + 2];
  for (let k = 0; k < 2; k++) { const p = outSpot(sd + 97 + k * 13, 0.45, 0.8); if (!p) continue; OUTB.taken.push(p);
    const zid = 'wild' + k; Z[zid] = { id: zid, name: 'The wilds', x: p.x, z: p.z, r: 14 };
    for (let i = 0; i < 2; i++) makeEnemy({ zone: zid, type: k ? 'drifter' : 'scavenger', n: 1, lv, wander: true }); }
}
// rep from who you kill
{ const _k = kill; kill = function (e) { const r = _k(e); try { const d = e.def;
  if (d.wanderer === 'scav') crime(8, 'Killed a peaceful scavenger');
  else if (d.wanderer === 'outlaw') goodDeed(3, 'Took down a drifter');
  else if (d === ENEMY.mhunter) { crime(10, 'Killed a Marshal hunter'); }
  if (e.sp && e.sp.huntSquad && !enemies.some(f => f.sp && f.sp.huntSquad && !f.dead)) { toast('HUNTERS DOWN', 'More will come while you\'re Wanted', 3); outS().huntT = Date.now() + (hasGear('ghostid') ? 7 : 4) * 60000; }
} catch (_) {} return r; }; }

// ---- NPC hunter squads ----
function huntersCome() {
  const O = outS(); O.huntT = Date.now() + (hasGear('ghostid') ? 7 : 4) * 60000;
  if (!LEVEL || !LEVEL.terrain || LEVEL.fly || !OUT_WORLDS.concat(['speedway']).includes(LEVEL.id) || LEVEL.id === 'speedway' || dlgOpen || !player.alive) { O.huntT = Date.now() + 30000; return; }
  if (SAFES.some(s => s.r < 100 && Math.hypot(player.pos.x - s.x, player.pos.z - s.z) < s.r + 8)) { O.huntT = Date.now() + 30000; return; }
  let p = null; for (let i = 0; i < 12 && !p; i++) { const a = Math.random() * 6.28, x = player.pos.x + Math.cos(a) * 26, z = player.pos.z + Math.sin(a) * 26; if (groundH(x, z) > WATER_Y + 0.4 && Math.hypot(x - WORLD_C.x, z - WORLD_C.z) < WORLD_R - 4) p = { x, z }; }
  if (!p) { O.huntT = Date.now() + 30000; return; }
  const zid = 'hunt' + Date.now(); Z[zid] = { id: zid, name: 'Marshal hunters', x: p.x, z: p.z, r: 6 };
  const n = Math.min(6, 2 + Math.floor(O.bounty / 1500)), lv = [Math.max(1, S.lvl), S.lvl + 2];
  for (let i = 0; i < n; i++) { const e = makeEnemy({ zone: zid, type: 'mhunter', n: 1, lv, once: true, huntSquad: true }); e.aggro = true; }
  toast('MARSHAL HUNTERS', `${n} hunters are after your ${O.bounty.toLocaleString()} cr bounty`, 3.5); SFX.hit(); log('Marshal hunters found you. Fight, or run for a city.', 'loot');
}

// ---- clearing your name with Marshal Rook ----
const payoffCost = () => Math.round(outS().bounty * 1.5);
{ const n = LEVELS.zeltac.npcs.find(k => k.id === 'rook'); if (n) n.custom = [...(n.custom || []), ['Clear my bounty', () => {
  const O = outS(); openDlg('Galactic Marshals', 'Marshal Rook');
  if (!isWanted() || !O.bounty) { $('dlgLine').textContent = O.lab ? "You run a drug lab. Your name stays on my list as long as it's running." : "Your record's clean. Keep it that way."; acts([['Done', closeDlg, true]]); return; }
  const c = payoffCost(); $('dlgLine').textContent = `${O.bounty.toLocaleString()} cr on your head. Pay ${c.toLocaleString()} and I'll lose the paperwork. Your rep drops to Outlaw.${O.lab ? ' The lab keeps you on the list, so it will come back.' : ''}`;
  acts([['Pay ' + c.toLocaleString() + ' cr', () => { if (S.cr < c) { SFX.hit(); log('Not enough credits on hand.'); return; } S.cr -= c; O.bounty = 0; O.rep = Math.min(O.rep, 60); O.crimeT = Date.now(); SFX.coin(); toast('BOUNTY CLEARED', 'The Marshals lost your paperwork', 3); markDirty(); outPush(); outHud(); closeDlg(); }, true, S.cr < c], ['Not now', closeDlg]]);
}]]; }
// closing Marshal contracts and story quests is honest work
{ const _bd = bountyDone; bountyDone = function () { const r = _bd.apply(this, arguments); goodDeed(15, 'Closed a Marshal contract'); return r; }; }
{ const _cq = completeQuest; completeQuest = function (id) { const r = _cq(id); try { if (QDEFS[id] && QDEFS[id].main) goodDeed(5); } catch (_) {} return r; }; }
