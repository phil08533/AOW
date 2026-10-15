// =================== SIDE HUSTLE: selling party favors, a partner in crime, and bail ===================
// Sell the drugs you carry (SUBS items) to the President and to ordinary NPCs from their talk menu ("Sell something…").
// Hand product to your partner at their home (Residential Ring apartment or your ship's quarters); they sell it over
// real play time, you collect the cash, every batch raises their heat, and sooner or later the Marshals pick them up.
// Bail them out at Marshal Rook on the Zeltac Plaza. Mail from the Marshals lands in the Residential Ring mailbox.
// Save field (optional, old saves start empty): S.deal = { rid, stash: {id: n}, cash, heat, sold, val, acc, arrested, arrT, bail, earned, busts, b: {npcId: [window, n]}, mail: [] }.
function dealS() {
  S.deal = S.deal || {}; const D = S.deal;
  D.stash = D.stash || {}; D.b = D.b || {}; D.mail = D.mail || [];
  for (const k of ['cash', 'heat', 'sold', 'val', 'acc', 'bail', 'earned', 'busts']) D[k] = D[k] || 0;
  return D;
}
const DEAL_PICK = a => a[Math.floor(Math.random() * a.length)];
const dealHash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; };
const dealWin = () => Math.floor(Date.now() / (30 * 60000)); // a buyer's mood and appetite reset every 30 minutes
const dealBase = k => { const D = SUBS[k]; return D ? (D.price || D.v * 2) : (ITEMS[k] ? ITEMS[k].v : 0); };
const dealIllegal = k => !(SUBS[k] && SUBS[k].legal);
const dealCarry = () => Object.keys(SUBS).filter(k => S.inv[k] > 0);
const dealStashN = () => Object.values(dealS().stash).reduce((a, n) => a + n, 0);
const dealFirst = rid => ROMANCE[rid] ? ROMANCE[rid].name.split(' ')[0] : 'Your partner';
const dealJailed = rid => { const D = S.deal; return !!(D && D.arrested && D.rid === rid); };
function dealLawless() {
  const id = LEVEL && LEVEL.id; if (id === 'underworld' || id === 'boarding') return true;
  return id === 'zfloor' && typeof ZF !== 'undefined' && ['under', 'aliens', 'engine'].includes(zTheme(ZF.floor));
}
const DEAL_LAW = /marshal|guard|secret service|police|enforcer|sheriff|warden|captain|sergeant|commander|general|lt\.|agent/i;
const DEAL_SHADY = /black market|fence|smuggl|outlaw|dealer|wanderer|scaveng|drifter|mole|bookie|gambl|poker|dice/i;
const dealQuesty = id => QORDER.some(q => QDEFS[q] && (QDEFS[q].giver === id || QDEFS[q].turnIn === id));
function dealBuyer(n) {
  if (!n || !n.id) return false; if (n.id === 'prez') return true;
  if (n.romId || n.marshal || /^(roomie|host_|rom_)/.test(n.id)) return false;
  if (DEAL_LAW.test(n.name + ' ' + (n.role || '')) || dealQuesty(n.id)) return false;
  return true;
}

// ---- lines ----
const DL = {
  ok: ["\"Is this the good stuff? Don't answer. I don't want to know.\"", "\"My therapist said I need a hobby. This is a hobby now.\"", "They tuck it into a sock, then the other sock, then their hat. \"For safety.\"", "\"Pleasure doing business. We never met. Who are you? Exactly.\"", "\"Great. Now act natural.\" They start whistling at a wall.", "\"I'm buying this for a friend. The friend is me. I'm my own best friend.\""],
  legal: ["\"A Focus Fizz? From a stranger? In THIS economy? Sold.\"", "You sold a perfectly legal product. You are, technically, a vending machine with legs.", "\"Ooh, the fizzy one. My boss says I lack focus. My boss is right. What were we talking about?\""],
  shady: ["\"Wholesale price. Don't look at me like that, I've got overhead.\"", "\"Mm. Not cut with anything? Respect. Still paying you less.\"", "\"I'll move it. You didn't see me. I didn't see you. Nobody sees anything down here.\""],
  no: ["\"No thank you. I'm high on life. And coffee. Mostly coffee.\"", "\"I'm on a cleanse. No toxins. Only juice. Sad, sad juice.\"", "\"Do I LOOK like I party? ...Don't answer that.\"", "\"Absolutely not. I'm telling my book club about you.\"", "\"Last time I bought something from a stranger it was a timeshare on an asteroid. Never again.\"", "\"My mom works for the Marshals. And so do I. Part time. Kidding! ...Unless?\""],
  robot: ["\"I AM A ROBOT. I DO NOT HAVE A BLOODSTREAM. I HAVE A COOLANT LOOP. PLEASE DO NOT PUT DUST IN IT.\"", "\"ERROR: PARTY NOT FOUND. HAVE YOU TRIED TURNING YOURSELF OFF AND ON AGAIN.\""],
  full: ["\"I'm good. Like, REALLY good. Come back in a while.\"", "\"Any more of that and I'll be able to see sounds. Later, friend.\"", "\"My wallet says no. My heart says yes. My wallet is in charge.\""],
  empty: ["You pat your pockets. Lint, a receipt, and a single sad space mint. Nothing to sell.", "You open your coat like a sidewalk watch salesman. It's empty. You both stare at it."],
  report: ["Someone behind you gasps loudly and starts typing very fast on a wrist-comm.", "A nosy passer-by yells \"DEALER!\" and points with both hands.", "A kid filmed the whole thing. It's already trending in four systems.", "A lady with a stroller says \"I'm calling the Marshals\" and then actually does."],
  prez: ["\"Is this for ME? I LOVE gifts! I'm giving you a pardon. And money. Mostly money.\"", "\"Put it on the national debt! No, put it on MY debt! I'll pay triple! Quadruple! What comes after quadruple?\"", "\"Trooper, you are a national treasure. I'm declaring a holiday. Today. In your honor. Somebody tell the Senate.\"", "\"This is going straight into the Strategic Party Reserve.\"", "\"I'll take all of it. I'll take the bag. Is that your bag? I'll take the bag.\"", "\"Keep the change. Keep the wallet. That's a presidential wallet. It has my face on it. Twice.\""],
  brooks: ["Agent Brooks closes his eyes and counts to ten.", "Agent Brooks writes 'resign' on a napkin, then sadly crosses it out.", "Somewhere behind you, Agent Brooks whispers \"why\" to no one.", "Agent Brooks pretends to adjust his earpiece so he can pretend he didn't see that."],
  prezEmpty: "\"Empty-handed? That's fine, that's fine. Come back with party favors and I'll make you Secretary of Fun. It's a real job. I just made it real.\""
};

// ---- selling to an NPC ----
function dealOffer(n, k) {
  const h = dealHash(n.id + ':' + k + ':' + dealWin()), base = dealBase(k) * (dealIllegal(k) ? 1 : 0.6);
  if (n.id === 'prez') return Math.round(base * (2.5 + (h % 150) / 100));
  const shady = dealLawless() || DEAL_SHADY.test(n.name + ' ' + (n.role || ''));
  return Math.max(5, Math.round(base * (shady ? 0.55 + (h % 20) / 100 : 0.85 + (h % 55) / 100)));
}
function dealMood(n) { // 'buy' | 'no' | 'robot'
  if (n.id === 'prez') return 'buy';
  if (['xr17', 'zr', 'overseer', 'drome'].includes(n.rig) && dealHash(n.id) % 3) return 'robot';
  const shady = dealLawless() || DEAL_SHADY.test(n.name + ' ' + (n.role || ''));
  return dealHash(n.id + ':' + dealWin()) % 100 < (shady ? 8 : 32) ? 'no' : 'buy';
}
function dealWant(n) { if (n.id === 'prez') return 999; const D = dealS(), w = dealWin(), r = D.b[n.id]; const cap = 1 + dealHash(n.id + 'w') % 4; return Math.max(0, cap - (r && r[0] === w ? r[1] : 0)); }
function dealLawNear() {
  for (const id in npcObjs) { const N = npcObjs[id], d = N.def; if (!N.obj.visible || id === 'vipguard') continue; if ((d.marshal || DEAL_LAW.test(d.name + ' ' + (d.role || ''))) && N.obj.position.distanceTo(player.pos) < 16) return d.name; }
  return null;
}
function dealReport(chance, extra) {
  if (dealLawless() || Math.random() >= chance) return false;
  const cop = dealLawNear(); crime(extra, cop ? `${cop} saw you dealing` : 'Someone reported you for dealing');
  toast('REPORTED', cop ? `${cop} was standing RIGHT there` : DEAL_PICK(['Snitches get... a reward, actually', 'The Marshals have been notified', 'Smile, you are on camera']), 3); SFX.hit();
  return true;
}
function openDealSell(n) {
  const prez = n.id === 'prez'; openDlg(prez ? 'Private sale · Commander in Chief' : `${n.role || 'Local'} · private sale`, n.name);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const mood = dealMood(n);
  if (!dealCarry().length) { $('dlgLine').textContent = prez ? DL.prezEmpty : DEAL_PICK(DL.empty); acts([['Back', () => talk(n.id), true], ['Bye', closeDlg]]); return; }
  if (mood !== 'buy') {
    $('dlgLine').textContent = DEAL_PICK(mood === 'robot' ? DL.robot : DL.no); SFX.talk && SFX.talk();
    if (mood === 'no' && dealCarry().some(dealIllegal) && dealReport(0.25, 5)) $('dlgLine').textContent += ' ' + DEAL_PICK(DL.report);
    acts([['Back', () => talk(n.id), true], ['Bye', closeDlg]]); return;
  }
  let line = prez ? "\"Whatcha got? Show me. Show the President. The PRESIDENT wants to see.\"" : DEAL_PICK(["\"Psst. Whatcha got?\" they whisper, very loudly.", "They glance left. Then right. Then left again, for luck. \"Okay. Show me.\"", "\"I don't usually do this. I do this a normal amount. Let's see it.\""]);
  const render = () => {
    const want = dealWant(n), have = dealCarry();
    $('dlgLine').textContent = line + (want <= 0 ? '' : prez ? '' : ` (Wants up to ${want} more. You have ${S.cr.toLocaleString()} cr.)`);
    if (!have.length) { rows.textContent = ''; const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Sold out. Your pockets are clean. Suspiciously clean.'; rows.appendChild(e); return; }
    itemRows(rows, have.map(k => [k, S.inv[k], `${dealOffer(n, k).toLocaleString()} cr each${dealIllegal(k) ? '' : ' · legal'}`, [['Sell 1', () => sell(k, 1), want <= 0], ['Sell all', () => sell(k, Math.min(S.inv[k], want)), want <= 0]]]));
  };
  const sell = (k, q) => {
    const want = dealWant(n); q = Math.min(q, S.inv[k] || 0, want); if (q <= 0) { line = DEAL_PICK(DL.full); render(); return; }
    const each = dealOffer(n, k), tot = each * q, D = dealS(), w = dealWin();
    S.inv[k] -= q; if (!S.inv[k]) delete S.inv[k]; S.cr += tot;
    if (!prez) { const r = D.b[n.id]; D.b[n.id] = [w, (r && r[0] === w ? r[1] : 0) + q]; for (const id in D.b) if (D.b[id][0] !== w) delete D.b[id]; }
    D.earned += tot; markDirty(); SFX.coin(); log(`Sold ${q} ${SUBS[k].name} to ${n.name} for ${tot.toLocaleString()} cr.`, 'loot');
    try { burst(npcObjs[n.id].obj.position.clone().add(V(0, 1.6, 0)), '#ffd36a', 10, 2); } catch (_) {}
    if (prez) { line = DEAL_PICK(DL.prez) + ' ' + DEAL_PICK(DL.brooks); toast('PRESIDENTIAL PURCHASE', `+${tot.toLocaleString()} cr · he overpaid. A lot.`, 2.6); }
    else {
      const shady = dealLawless() || DEAL_SHADY.test(n.name + ' ' + (n.role || ''));
      line = !dealIllegal(k) ? DEAL_PICK(DL.legal) : shady ? DEAL_PICK(DL.shady) : DEAL_PICK(DL.ok);
      if (dealIllegal(k) && dealReport(0.12 + 0.03 * (q - 1) + (dealLawNear() ? 0.25 : 0), 4 + q * 2)) line += ' ' + DEAL_PICK(DL.report);
    }
    try { invQuickRender(); } catch (_) {}
    render();
  };
  $('dlgActs').before(rows); acts([['Done', () => talk(n.id), true], ['Bye', closeDlg]]); render();
}

// ---- the talk menu gets a "Sell something…" button (and Marshal Rook a bail desk) ----
{ const _mf = menuFor; menuFor = function (n) {
  const r = _mf.apply(this, arguments);
  try {
    const extra = [];
    if (dealBuyer(n) && (n.id === 'prez' || dealCarry().length)) extra.push([n.id === 'prez' ? '💸 Sell the President something…' : 'Sell something…', () => openDealSell(n)]);
    if (n.id === 'rook' && dealS().arrested) extra.push([`⚖ Post bail for ${dealFirst(dealS().rid)}`, () => openBail()]);
    if (extra.length) { const box = $('dlgActs'), bye = [...box.querySelectorAll('button')].pop(); extra.forEach(([label, fn]) => { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = label; b.addEventListener('click', () => { SFX.ui(); fn(); }); box.insertBefore(b, bye); }); }
  } catch (e) { console.warn('deal menu', e); }
  return r;
}; }

// ---- your partner, the small-business owner ----
const DEAL_HEAT = [[0, 'cool'], [20, 'warm'], [45, 'hot'], [70, 'on fire']];
const dealHeatName = h => { let s = DEAL_HEAT[0][1]; for (const [v, n] of DEAL_HEAT) if (h >= v) s = n; return s; };
const DP = {
  give: ["\"Oh, we're doing this? We're doing this. I've always wanted a side hustle.\"", "\"Got it. I know a guy. I know several guys. One of them is a hat.\"", "\"I'll have this moved by dinner. Or by breakfast. Business hours are flexible.\"", "\"Leave it with me. I'll be discreet.\" They put it in a jar labeled DEFINITELY NOT DRUGS."],
  hot: ["\"Uh, small thing: there's a Marshal who waves at me every morning now. Waves. With his whole arm.\"", "\"I'm seeing the same guy in a trench coat everywhere. In the market. In the elevator. In my dreams.\""],
  collect: ["\"Here's your cut. I kept a little for 'business expenses.' The business is snacks.\"", "\"Sold one to a guy in a full mascot suit. He paid in quarters. Space quarters.\"", "\"Business is booming. One customer literally boomed. He's fine. Mostly fine.\"", "\"Your money. Counted twice. Smelled once. Don't ask why.\""],
  none: ["\"Nothing yet, boss. The market's slow. The market is asleep. The market is one guy and he's broke.\"", "\"Patience! Commerce takes time. Also legs. I've been walking a LOT.\""],
  chatter: ["just sold a {d} to a lady walking six robot dogs. Business!", "moved a {d} to a guy who asked if it came in decaf.", "sold a {d} to a mime. The mime paid in an invisible wallet. Real money though.", "sold a {d}. The buyer said 'you didn't see me' and then stood there for a full minute.", "sold a {d} to someone in the Market Deck. They tipped. Who tips?!"]
};
function dealGive(rid) {
  const M = romOf(rid), name = dealFirst(rid), D = dealS();
  openDlg(`${ROMANCE[rid].role} · your partner in crime`, ROMANCE[rid].name);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  let line = D.rid && D.rid !== rid && dealStashN() ? `"Wait, ${dealFirst(D.rid)} is still holding your stuff? Awkward. I'll take it from here."` : `"What've you got for me?" ${name} cracks their knuckles. Business mode.`;
  let given = 0;
  const render = () => {
    const have = dealCarry(), n = dealStashN();
    $('dlgLine').textContent = `${line} (Holding ${n}/20 · heat ${dealHeatName(D.heat)})`;
    if (!have.length) { rows.textContent = ''; const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'You have nothing to hand over. Buy party favors from Madame Vex in the underworld, or brew them in a Lab.'; rows.appendChild(e); return; }
    itemRows(rows, have.map(k => [k, S.inv[k], dealIllegal(k) ? 'illegal' : 'legal', [['Give 1', () => give(k, 1), n >= 20], ['Give all', () => give(k, S.inv[k]), n >= 20]]]));
  };
  const give = (k, q) => {
    q = Math.min(q, S.inv[k] || 0, 20 - dealStashN()); if (q <= 0) { line = `"My jar is full. My other jar is full. Sell some first."`; render(); return; }
    if (D.arrested) { line = `"Not while ${dealFirst(D.rid)} is still in a cell. Bail them out first. That's just good business."`; render(); return; }
    D.rid = rid; // a new partner takes over whatever the last one was holding
    S.inv[k] -= q; if (!S.inv[k]) delete S.inv[k]; D.stash[k] = (D.stash[k] || 0) + q;
    if (!given) D.heat = Math.min(100, D.heat + 6); // every batch handed over draws a little more attention
    given += q; D.heat = Math.min(100, D.heat + q * (dealIllegal(k) ? 1 : 0.3));
    line = D.heat >= 45 ? DEAL_PICK(DP.hot) : DEAL_PICK(DP.give); markDirty(); SFX.item ? SFX.item() : SFX.ui(); try { invQuickRender(); } catch (_) {} render();
  };
  $('dlgActs').before(rows); acts([['Done', () => openRomance(rid, true), true]]); render();
}
function dealCollect(rid) {
  const D = dealS(), name = dealFirst(rid); openDlg(`${ROMANCE[rid].role} · your partner in crime`, ROMANCE[rid].name);
  if (!D.cash) { $('dlgLine').textContent = DEAL_PICK(DP.none); acts([['Okay', () => openRomance(rid, true), true]]); return; }
  const c = Math.round(D.cash); S.cr += c; D.cash = 0; markDirty(); SFX.coin(); toast('CASH COLLECTED', `+${c.toLocaleString()} cr from ${name}`, 2.6); log(`${name} handed over ${c.toLocaleString()} cr in very small bills.`, 'loot');
  $('dlgLine').textContent = DEAL_PICK(DP.collect); acts([['Nice', () => openRomance(rid, true), true]]);
}
// home-only actions on the romance menu (apartment and ship quarters both pass home = true)
{ const _or = openRomance; openRomance = function (id, home) {
  const r = _or.apply(this, arguments);
  try {
    if (!home) return r; const M = romOf(id), D = dealS(); const extra = [];
    if (M.partner) extra.push([`💸 Give them product to sell${dealStashN() && D.rid === id ? ` (${dealStashN()} held)` : ''}`, () => dealGive(id)]);
    if (D.rid === id && (D.cash > 0 || M.partner)) extra.push([`💰 Collect earnings${D.cash ? ` (${Math.round(D.cash).toLocaleString()} cr)` : ''}`, () => dealCollect(id)]);
    if (D.rid === id && (dealStashN() || D.heat >= 20)) $('dlgLine').textContent += ` [Side hustle: ${dealStashN()} left to sell · heat ${dealHeatName(D.heat)}]`;
    if (extra.length) { const box = $('dlgActs'), bye = [...box.querySelectorAll('button')].pop(); extra.forEach(([label, fn]) => { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = label; b.addEventListener('click', () => { SFX.ui(); fn(); }); box.insertBefore(b, bye); }); }
  } catch (e) { console.warn('deal home', e); }
  return r;
}; }

// ---- selling over real play time ----
function dealSellOne() {
  const D = dealS(), ks = Object.keys(D.stash).filter(k => D.stash[k] > 0); if (!ks.length) return;
  const k = DEAL_PICK(ks), price = Math.round(dealBase(k) * (dealIllegal(k) ? 1 : 0.6) * (0.9 + Math.random() * 0.4) * 0.85); // they keep 15% for "business expenses"
  D.stash[k]--; if (!D.stash[k]) delete D.stash[k];
  D.cash += price; D.sold++; D.val += price; D.heat = Math.min(100, D.heat + (dealIllegal(k) ? 3 : 0.5)); markDirty();
  if (Math.random() < 0.3 && ROMANCE[D.rid]) log(`${ROMANCE[D.rid].name}: "${DEAL_PICK(DP.chatter).replace('{d}', SUBS[k] ? SUBS[k].name : k)}"`, 'chat');
  if (!dealStashN()) log(`${dealFirst(D.rid)} sold out. ${Math.round(D.cash).toLocaleString()} cr is waiting for you at their place.`, 'loot');
  if (Math.random() < Math.max(0, Math.min(0.2, (D.heat - 25) / 500))) dealArrest();
}
function dealArrest() {
  const D = dealS(), rid = D.rid; if (!rid || D.arrested || !ROMANCE[rid]) return;
  const R = ROMANCE[rid], name = dealFirst(rid);
  D.arrested = true; D.arrT = Date.now(); D.busts++; D.bail = Math.round((400 + D.val * 0.6 + D.sold * 40) * (1 + 0.25 * (D.busts - 1)) / 10) * 10;
  const seized = dealStashN(); D.stash = {};
  D.mail.push(`OFFICIAL NOTICE · Galactic Marshals: ${R.name} has been detained for "aggressive entrepreneurship" (${D.sold} sales${seized ? `, ${seized} more seized` : ''}). Bail: ${D.bail.toLocaleString()} cr, payable to Marshal Rook, Zeltac Plaza. Please stop sending them snacks.`);
  markDirty(); SFX.hit(); toast(`${name.toUpperCase()} ARRESTED`, `Bail: ${D.bail.toLocaleString()} cr at Marshal Rook, Zeltac Plaza`, 5);
  log(`The Marshals picked up ${R.name} for dealing. Bail is ${D.bail.toLocaleString()} cr at Marshal Rook on the Zeltac Plaza. (You've got space mail.)`, 'loot');
}
setInterval(() => { try {
  if (state !== 'play' || !S.deal || document.hidden) return; const D = dealS(), now = Date.now();
  if (D.arrested) return;
  if (!dealStashN() || !D.rid || !romOf(D.rid).partner) { if (D.heat > 0 && now - (D.coolT || 0) > 180000) { D.coolT = now; D.heat = Math.max(0, D.heat - 1); markDirty(); } return; }
  D.acc += 5; if (D.acc >= (D.next || 50)) { D.acc = 0; D.next = 40 + randi(0, 35); dealSellOne(); }
} catch (e) { console.warn('deal tick', e); } }, 5000);

// ---- behind bars: gone from home, the lounge, and your ship ----
{ const _mn = makeNpc; makeNpc = function (n, base) {
  if (n && n.romId && !n._dealHide) { n._dealHide = 1; const s0 = n.showIf; n.showIf = () => !dealJailed(n.romId) && (!s0 || s0()); }
  return _mn.apply(this, arguments);
}; }
{ const _rd = resDoor; resDoor = function (i, rid) {
  if (rid && dealJailed(rid)) { const D = dealS(); openDlg(`#${i + 1} · Sealed by the Marshals`, `${ROMANCE[rid].name}'s place`);
    $('dlgLine').textContent = `Marshal tape across the door in a big yellow X. A notice: "OCCUPANT DETAINED. BAIL ${D.bail.toLocaleString()} CR, PAY MARSHAL ROOK, ZELTAC PLAZA." Someone has drawn a sad face on it. It might be ${dealFirst(rid)}'s handwriting.`;
    acts([['Ugh. Fine.', closeDlg, true]]); SFX.ui(); return; }
  return _rd.apply(this, arguments);
}; }
{ const _sr = spawnRoommate; spawnRoommate = function () {
  const rid = Object.keys(romS()).find(id => romOf(id).ship);
  if (rid && dealJailed(rid)) { setTimeout(() => log(`${dealFirst(rid)}'s bunk is empty. There's a note: "In the clink. Bring bail. And socks." Pay Marshal Rook on the Zeltac Plaza.`, 'loot'), 1500); return; }
  return _sr.apply(this, arguments);
}; }
{ const _rm = resMail; resMail = function () {
  const D = S.deal; if (D && D.mail && D.mail.length) { openDlg('Mailbox', 'Space Mail'); $('dlgLine').textContent = D.mail.shift(); markDirty(); SFX.ui(); acts([[D.mail.length ? 'Next letter' : 'Close', () => D.mail.length ? resMail() : closeDlg(), true]]); return; }
  return _rm.apply(this, arguments);
}; }

// ---- bail at Marshal Rook ----
function openBail() {
  const D = dealS(), rid = D.rid, name = dealFirst(rid); openDlg('Galactic Marshals · booking desk', 'Marshal Rook');
  if (!D.arrested) { $('dlgLine').textContent = "Nobody of yours in holding. Let's keep it that way."; acts([['Done', closeDlg, true]]); return; }
  const wantedToo = isWanted();
  $('dlgLine').textContent = `${name}? Caught moving ${D.sold} units to an off-duty mall cop. Bail is ${D.bail.toLocaleString()} cr. They've been singing in the cell. Badly. For hours. Please.${wantedToo ? " Also, you have a bounty yourself, so this is bold. I'll allow it. Today." : ''}`;
  acts([[`Pay ${D.bail.toLocaleString()} cr`, () => {
    if (S.cr < D.bail) { SFX.hit(); $('dlgLine').textContent = `"${D.bail.toLocaleString()} cr. You've got ${S.cr.toLocaleString()}. The cell has a nice view of a wall. They'll be fine."`; return; }
    S.cr -= D.bail; const paid = D.bail; D.arrested = false; D.bail = 0; D.heat = 0; D.sold = 0; D.val = 0; D.acc = 0; D.mail = D.mail.filter(m => !/OFFICIAL NOTICE/.test(m));
    const M = romOf(rid); M.aff = clamp((M.aff || 0) + 5, 0, 100); markDirty(); SFX.level();
    toast('BAILED OUT', `${name} is back home. Heat reset.`, 4); log(`You paid ${paid.toLocaleString()} cr bail. ${name} is back home, and the Marshals have stopped watching. For now.`, 'loot');
    $('dlgLine').textContent = `"Paperwork's done. ${name} walks. Tell them next time it's a real cell, not the one with the beanbag."`;
    acts([['Thanks, Marshal', closeDlg, true]]);
  }, true, S.cr < D.bail], ['Not now', closeDlg]]);
}
