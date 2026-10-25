// =================== THE MARSHALS: an alternative to the outlaw path (step 1: story, badge, rank, lockouts, badge flash) ===================
// Save: S.marshal = { on, xp, clout, busts, offered, t } (missing on old saves). Taking the badge zeroes outlaw rep and closes the
// outlaw side (Lab, substances, fences, black market, hits, the Don). Turning the badge back in is always the player's own choice.
const M_RANKS = [[0, 'Deputy'], [300, 'Marshal'], [900, 'Senior Marshal'], [2000, 'Chief Marshal'], [4000, 'Star Marshal']];
function mS() { S.marshal = S.marshal || { on: false, xp: 0, clout: 0, busts: 0 }; return S.marshal; }
const mOn = () => !!(S.marshal && S.marshal.on);
function mRank() { const x = mS().xp; let r = 0; M_RANKS.forEach((k, i) => { if (x >= k[0]) r = i; }); return r; }
const mRankName = () => M_RANKS[mRank()][1];
function mGain(n, why) { if (!mOn()) return; const M = mS(), r0 = mRank(); M.xp += n; if (why) log(`${why} (+${n} Marshal XP)`, 'loot');
  if (mRank() > r0) { toast('PROMOTED', `${mRankName()} · see your Marshal card`, 4); SFX.levelup && SFX.levelup(); } outHud(); markDirty(); }

// ---- story: the Marshals reach out between Chapter 4 and Kade ----
defQuest('law1', { ch: 'Interlude · The Law', title: 'The Long Arm', giver: 'ada', turnIn: 'rook', req: ['r5'], main: true,
  intro: ["The Galactic Marshals sent a message. Marshal Rook wants to see you on the Zeltac. In person."],
  obj: [],
  outro: ["So you're the one Robot City keeps talking about. Sit down.", "Out here there are two kinds of people with guns. The ones who take what they want, and the ones who stop them.", "Crime pays. I won't lie to you. Labs, fences, contraband. Plenty of captains get rich that way, until someone like me shows up.", "The badge pays too, and it lets you sleep. Ranks, gear, a ship of our own, and every crook in the galaxy afraid of your shadow.", "You don't have to pick today. But someone just bought a bounty on your head. When you've dealt with that, call me."],
  reward: { cr: 1500, xp: 6000 } });
if (QDEFS.bh1 && !QDEFS.bh1.req.includes('law1')) QDEFS.bh1.req.push('law1');

// ---- the badge offer: after Kade's ship (Rook asks you to give up his location), or from Rook any time after ----
function mExplain(after) {
  openDlg('Galactic Marshals', 'Become a Marshal?');
  $('dlgLine').innerHTML = '';
  const p = document.createElement('div'); p.style.cssText = 'line-height:1.5;font-size:14px';
  for (const t of ['⭐ You get a Marshal rank instead of an outlaw rating: Deputy, Marshal, Senior, Chief, then Star Marshal.', '🛡 Rank unlocks Marshal weapons, armor, a Marshal armory on your ship, and a Marshal ship.', '🪪 Flash your badge (N, or the BADGE button) to gain clout. Clout means discounts and respect.', '🚔 Bust crooks you find in the world, and take Marshal missions: hostage rescues, manhunts and fleet sweeps.', '🚫 No crime: no Lab, no substances, no fences, black market or hits, and no business with the Don. Civilians are off limits.', '↩ You can turn your badge back in from your Marshal card, but you lose your rank.']) { const d = document.createElement('div'); d.textContent = t; d.style.margin = '4px 0'; p.appendChild(d); }
  $('dlgLine').appendChild(p);
  acts([['Take the badge', () => { mTakeBadge(); if (after) after(true); }, true], ['Not yet', () => { closeDlg(); if (after) after(false); }]]);
}
function mTakeBadge() { const M = mS(), O = outS(); M.on = true; M.t = Date.now(); O.rep = 0; O.bounty = 0; O.obT = 0; O.lab = false; if (S.ship && S.ship.rooms && S.ship.rooms.includes('lab')) { S.ship.rooms = S.ship.rooms.filter(r => r !== 'lab'); if (S.ship.lvl) delete S.ship.lvl.lab; log('The Marshals dismantled your Lab.', 'loot'); }
  closeDlg(); toast('DEPUTY MARSHAL', 'Flash your badge with N or the BADGE button', 5); SFX.quest && SFX.quest(); log('You took the badge. Welcome to the Galactic Marshals, Deputy.', 'loot'); outHud(); mTouch(); markDirty(); try { outPush(); } catch (_) {} }
function mTurnIn() { openDlg('Galactic Marshals', 'Turn in your badge?'); $('dlgLine').textContent = `You'll lose your rank (${mRankName()}, ${mS().xp} XP) and everything it unlocks. The outlaw side opens back up. This can't be undone.`;
  acts([['Turn it in', () => { const M = mS(); M.on = false; M.xp = 0; M.clout = 0; closeDlg(); toast('BADGE RETURNED', 'You are on your own again', 3.5); log('You turned in your Marshal badge.'); outHud(); mTouch(); markDirty(); }], ['Keep it', () => openOutlawCard(), true]]); }
function mOfferAfterKade() { const M = mS(); if (M.offered || mOn()) return; M.offered = 1; markDirty();
  openDlg('Incoming call', 'Marshal Rook'); $('dlgLine').textContent = "\"Captain. We tracked a ship called the Glass Wake to your position an hour ago. A bounty hunter named Kade. Wanted on nine worlds. Give me his location and I'll make it worth your while. More than worth it.\"";
  acts([['Turn him in', () => { $('dlgLine').textContent = '"Good. That\'s the call a Marshal makes. And I want you to be one."'; acts([['Hear him out', () => mExplain(took => { if (took) setTimeout(() => { openDlg('Marshal Rook', 'One more thing'); $('dlgLine').textContent = '"We hit the coordinates you gave us. The Glass Wake was already gone. Kade is good. You\'ll see him again, Deputy."'; acts([['Okay', closeDlg, true]]); }, 400); }), true]]); }, true],
    ['Keep quiet', () => { $('dlgLine').textContent = '"Your call, Captain. The offer stands. Come see me on the Zeltac if you change your mind."'; acts([['Done', closeDlg, true]]); }]]); }
// Kade's ship scene ends with the lab lesson; back on your ship, Rook calls
{ const _ss = bhShipScene; bhShipScene = function () { const r = _ss.apply(this, arguments); const wait = () => { if (BH.cut) return setTimeout(wait, 500); setTimeout(() => { loadLevel('ship'); setTimeout(() => { if (!dlgOpen) mOfferAfterKade(); }, 1500); }, 3000); }; setTimeout(wait, 500); return r; }; }
{ const _mf = menuFor; menuFor = function (n) { const l = _mf.apply(this, arguments); if (n && n.id === 'rook' && Array.isArray(l)) l.push([mOn() ? '⭐ Marshal card' : '⭐ The badge', () => mOn() ? openOutlawCard() : !qDone('law1') ? (openDlg('Marshal Rook', 'The badge'), $('dlgLine').textContent = '"Not yet. We need to talk first."', acts([['Okay', closeDlg, true]])) : mExplain()]); return l; }; }

// ---- lockouts ----
{ const _c = crime; crime = function (n, why) { if (!mOn()) return _c.apply(this, arguments); const M = mS(); M.xp = Math.max(0, M.xp - n * 5); toast('MARSHAL CONDUCT', (why || 'That was a crime') + `. −${n * 5} Marshal XP`, 3); outHud(); markDirty(); }; }
{ const _g = goodDeed; goodDeed = function (n, why) { if (mOn()) { mGain(n * 6, why); return; } return _g.apply(this, arguments); }; }
{ let subs = PREFS.subs; Object.defineProperty(PREFS, 'subs', { get: () => subs && !mOn(), set: v => { subs = v; }, enumerable: true, configurable: true }); }
{ const h0 = ROOMS.lab.hide; ROOMS.lab.hide = () => mOn() || (h0 && h0()); }
const mNo = (role, name, line) => { openDlg(role, name); $('dlgLine').textContent = line; acts([['🪪 Flash your badge', () => { mFlash(); closeDlg(); }], ['Leave', closeDlg, true]]); };
if (typeof openFence === 'function') { const f0 = openFence; openFence = function () { if (mOn()) return mNo("Fence", "Fence", "\"A Marshal? I sell... socks. Nice socks. Have a good day, officer.\""); return f0.apply(this, arguments); }; }
if (typeof openBlackMarket === 'function') { const f0 = openBlackMarket; openBlackMarket = function () { if (mOn()) return mNo("Black market", "Black market", "The stall is suddenly empty. Somebody yells \"BADGE!\" and everyone scatters."); return f0.apply(this, arguments); }; }
if (typeof openPostHit === 'function') { const f0 = openPostHit; openPostHit = function () { if (mOn()) return mNo("Contracts", "Contracts", "Marshals don't post hits. You put the pen down."); return f0.apply(this, arguments); }; }
if (typeof openMcKBack === 'function') { const f0 = openMcKBack; openMcKBack = function () { if (mOn()) return mNo("McKlunkies", "McKlunkies", "ORDER-BOT: BACK COUNTER? WHAT BACK COUNTER? :) HAVE A KLUNK FRY, OFFICER. ON THE HOUSE."); return f0.apply(this, arguments); }; }
if (typeof mobDon === 'function') { const f0 = mobDon; mobDon = function () { if (mOn()) return mNo("Don Klunkleone", "Don Klunkleone", "\"A badge. In my booth. Get out of here before your fries get cold, Marshal.\""); return f0.apply(this, arguments); }; }
if (typeof openStreetDealers === 'function') { const f0 = openStreetDealers; openStreetDealers = function () { if (mOn()) return mNo("Street dealers", "Street dealers", "Your old contacts won't pick up. Word travels fast when you wear a badge."); return f0.apply(this, arguments); }; }
if (typeof openLab === 'function') { const f0 = openLab; openLab = function () { if (mOn()) return mNo("Lab", "Lab", "The Marshals took the Lab apart."); return f0.apply(this, arguments); }; }
{ const f0 = openDealSell; openDealSell = function (n) { if (!mOn()) return f0.apply(this, arguments); closeDlg(); mFlash(n); }; }
// Marshals don't shoot civilians: peaceful wanderers just shrug off your rounds
{ const _k = kill; kill = function (e) { if (mOn() && e && e.def && e.def.wanderer === 'scav') { e.hp = Math.max(1, e.max * 0.6); e.aggro = false; if (!e.mWarn || gameTime - e.mWarn > 5) { e.mWarn = gameTime; toast('HOLD FIRE', "Marshals don't shoot civilians", 2.2); } return; } return _k.apply(this, arguments); }; }
// rename the drug-selling buttons wherever they show up
new MutationObserver(() => { if (!mOn()) return; for (const b of $('dlgActs').querySelectorAll('button')) if (/^(💸 )?Sell (something|the President)/.test(b.textContent)) b.textContent = '🪪 Flash your badge'; }).observe($('dlgActs'), { childList: true });

// ---- the badge flash ----
const M_FLASH = ['"Whoa. Is that real? Can I touch it? I won\'t touch it."', '"Yes, Marshal. Absolutely, Marshal. Lovely weather, Marshal."', '"My cousin\'s a Marshal! Well, he got arrested BY a Marshal. Same thing."', 'They straighten up and salute. Badly, but with feeling.', '"Ooh, shiny. You must be important."', '"I didn\'t do it. Whatever it was. Good badge though."', 'A kid nearby gasps loudly and points.', '"Finally, somebody around here who isn\'t a crook."'];
function mFlash(n) {
  if (!mOn()) return; const M = mS(), now = Date.now(), cool = now - (M.flT || 0) < 20000; M.flT = now; if (!cool) { M.clout = Math.min(999, (M.clout || 0) + 3); mGain(2); }
  let near = n; if (!near) { let best = 6; for (const id in npcObjs) { const N = npcObjs[id]; if (!N.obj.visible) continue; const d = N.obj.position.distanceTo(player.pos); if (d < best) { best = d; near = N.def; } } }
  mBadgePop(); SFX.ui && SFX.ui();
  if (near) { openDlg(near.role || 'Local', near.name); $('dlgLine').textContent = M_FLASH[Math.floor(Math.random() * M_FLASH.length)] + (cool ? '' : `  (+3 clout · ${M.clout})`); acts([['Carry on', closeDlg, true]]); }
  else toast('🪪 ' + mRankName().toUpperCase(), cool ? 'Nobody around to impress' : `+3 clout · ${M.clout}`, 2);
  markDirty();
}
function mBadgePop() { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:50%;top:44%;z-index:30;pointer-events:none;transform:translate(-50%,-50%) scale(.3) rotateY(80deg);transition:transform .35s cubic-bezier(.2,1.6,.4,1),opacity .4s;opacity:0';
  d.innerHTML = mBadgeArt(mRank(), 170);
  document.body.appendChild(d); requestAnimationFrame(() => { d.style.opacity = 1; d.style.transform = 'translate(-50%,-50%) scale(1) rotateY(0)'; }); setTimeout(() => { d.style.opacity = 0; }, 1300); setTimeout(() => d.remove(), 1800); }
window.addEventListener('keydown', e => { if (e.code === 'KeyN' && state === 'play' && !dlgOpen && mOn() && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) mFlash(); });
const tBadge = document.createElement('button'); tBadge.className = 'tbtn tq'; tBadge.id = 'tBadge'; tBadge.innerHTML = '<i>★</i><small>BADGE</small>'; tBadge.hidden = true; { const t = document.getElementById('touch'); if (t) t.appendChild(tBadge); }
tBadge.addEventListener('touchstart', e => { mFlash(); e.preventDefault(); }, { passive: false }); tBadge.addEventListener('click', () => mFlash());
{ const st = document.createElement('style'); st.textContent = 'body #tBadge[hidden] { display: none !important; } body #tBadge { right: 70px !important; } @media (pointer: coarse) and (max-height: 520px) { body #tBadge { right: 62px !important; } }'; document.head.appendChild(st); }
function mTouch() { tBadge.hidden = !mOn(); try { if (mOn()) tSub.hidden = true; } catch (_) {} }
setInterval(mTouch, 2000);

// ---- the HUD chip and the card ----
{ const _h = outHud; outHud = function () { _h.apply(this, arguments); if (!mOn() || typeof outChip === 'undefined' || !outChip) return; outChip.hidden = false; outChip.style.color = '#ffd36a'; outChip.style.borderColor = '#ffd36a'; outChip.textContent = `★ ${mRankName()} ${mS().xp}`; }; }
{ const _o = openOutlawCard; openOutlawCard = function () { if (!mOn()) { _o.apply(this, arguments); if (qDone('law1') && qDone('bh1')) { const box = $('dlgActs'), b = document.createElement('button'); b.className = 'pbtn'; b.textContent = '⭐ Become a Marshal'; b.addEventListener('click', () => { SFX.ui(); mExplain(); }); box.insertBefore(b, box.firstChild); } return; }
  const M = mS(), r = mRank(), nx = M_RANKS[r + 1]; openDlg('Galactic Marshals', mRankName());
  $('dlgLine').textContent = `Marshal XP ${M.xp}${nx ? ` (${nx[1]} at ${nx[0]})` : ' · top rank'}. Clout ${M.clout || 0}. Busts ${M.busts || 0}. Earn XP by taking down drifters and outlaws, collecting bounties and flashing your badge. Marshal missions, busts, the armory and the Marshal ship are on the way.`;
  acts([['🪪 Flash badge', () => { closeDlg(); mFlash(); }, true], ['Turn in badge', mTurnIn], ['Close', closeDlg]]); }; }
setTimeout(() => { try { outHud(); mTouch(); } catch (_) {} }, 3000);
// The Long Arm starts on its own when Robot City is freed, so the tracker points straight at Rook instead of back at Ada-9
{ const _cq = completeQuest; completeQuest = function (id) { const r = _cq.apply(this, arguments); if (id === 'r5' && !S.qst.law1) setTimeout(() => { if (!S.qst.law1) startQuest('law1', true); }, 400); return r; }; }
setTimeout(() => { try { if (S.qst && S.qst.r5 && S.qst.r5.st === 'done' && !S.qst.law1) startQuest('law1', true); } catch (_) {} }, 3000);
// Marshals don't rob merchant haulers
{ const _bp = boardPrompt; boardPrompt = function (W) { if (W && W.type === 'trader' && mOn()) { openDlg('Sensors', 'Merchant Hauler'); $('dlgLine').textContent = 'A merchant guild hauler on a peaceful run. Marshals protect these, they don\'t rob them.'; acts([['Fly on', closeDlg, true]]); return; } return _bp.apply(this, arguments); }; }
