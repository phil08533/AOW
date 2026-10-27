// =================== the stolen TV as a Marshal: play along, collect evidence, then arrest Rizzo, Dot and Crabby together ===================
// Save adds S.bub.mlt = { ev: { tv, alibi, bribe, sale }, done }. Off-badge, the quest plays exactly as before.
const LT2_EV = [['tv', 'Rizzo handed you a stolen TV'], ['alibi', 'Rizzo\'s alibi fell apart'], ['bribe', 'Dot took a bribe to kill the tracker'], ['sale', 'Crabby bought it, no questions asked']];
const lt2 = () => { const s = bubS(); s.mlt = s.mlt || { ev: {} }; return s.mlt; };
const lt2Ready = () => { const e = lt2().ev; return e.tv && e.bribe && e.sale; };
function lt2Got(k) { const m = lt2(); if (m.ev[k] || m.done) return; m.ev[k] = 1; markDirty(); SFX.quest && SFX.quest();
  const n = LT2_EV.filter(([q]) => m.ev[q]).length; toast('🗂 EVIDENCE ' + n + '/4', LT2_EV.find(([q]) => q === k)[1] + (lt2Ready() ? '. Enough to arrest all three. Go see Crabby.' : ''), 3); log('Evidence: ' + LT2_EV.find(([q]) => q === k)[1], 'quest'); }
function lt2Bust() { const m = lt2(), s = bubS(), M = mS(); if (m.done) return; m.done = 1; s.tv = 3; delete S.inv.bub_tv;
  mBadgePop(); SFX.coin && SFX.coin();
  const bonus = m.ev.alibi ? 500 : 0, pay = 1500 + bonus; S.cr += pay; M.busts = (M.busts || 0) + 3; M.medals = M.medals || []; if (!M.medals.includes('lowtide')) M.medals.push('lowtide');
  mGain(250 + (m.ev.alibi ? 80 : 0), 'Low Tide sweep: Rizzo, Dot and Crabby arrested'); markDirty();
  setTimeout(() => bubTalk('Galactic Marshals', 'Dispatch', ['Three in cuffs. Rizzo for the theft, Dot for taking a bribe on the dome network, Crabby for fencing.', m.ev.alibi ? 'And Rizzo\'s karaoke alibi is on the record as a lie. The judge is going to love that.' : 'Rizzo says he was at karaoke all day. Nobody checked. Doesn\'t matter, the TV is in his handwriting.', `Reward's in your account: ${pay} CR. The commander sends a medal.`],
    () => toast('🏅 MEDAL · LOW TIDE SWEEP', 'Three arrests in one go. +' + pay + ' CR', 4)), 1600); }
// Rizzo: as a Marshal, he hands over the TV the same way, and volunteers a bad alibi
{ const f0 = bubRizzo; bubRizzo = function () { const s = bubS(), m = lt2(); if (!mOn()) return f0.apply(this, arguments);
  if (m.done) return bubTalk('The Low Tide', 'Rizzo', ['(Rizzo is gone. There\'s a Marshal seal on the lamppost where he used to lean.)']);
  if (!s.tv) return bubTalk('The Low Tide', 'Rizzo', ['Psst. You. Big-eyes. You want a TV? Fifty-inch. Well, fifty millimetre.', 'Nice jacket. Is that a... no, never mind, nobody wears a badge to the Low Tide.', 'You sell it to Crabby, we split it. And if anyone asks, I was at the Karaoke Clam all day.'], () => {
    s.tv = 1; S.inv.bub_tv = 1; markDirty(); toast('STOLEN TV', 'Play along. Sell it at Crabby\'s Pawn.', 2.4); log('+1 Suspiciously Cheap TV', 'loot'); lt2Got('tv'); });
  return f0.apply(this, arguments); }; }
// Dot: the bribe goes on the record
{ const f0 = bubDot; bubDot = function () { const s = bubS(), t0 = s.tv, r = f0.apply(this, arguments);
  if (mOn() && lt2().done) $('dlgLine').textContent = '"Out on bail. I still run the lights. Don\'t look at me like that."';
  if (mOn() && t0 === 1) { const id = setInterval(() => { if (bubS().tv === 2) { clearInterval(id); lt2Got('bribe'); } else if (!dlgOpen) clearInterval(id); }, 300); }
  return r; }; }
// Crabby: the sale is evidence; once all of it is in, the badge comes out
{ const f0 = bubPawn; bubPawn = function () { const s = bubS(), m = lt2(); if (!mOn()) return f0.apply(this, arguments);
  if (m.done) return bubTalk('Crabby\'s Pawn', 'Crabby', ['(The shop is empty. CLOSED BY ORDER OF THE GALACTIC MARSHALS is taped across the register.)']);
  if (s.tv === 2 && S.inv.bub_tv) return bubTalk('Crabby\'s Pawn', 'Crabby', ['No blinking light. Beautiful. I don\'t ask, you don\'t tell. 900 for it.', 'Rizzo\'s cut? Rizzo owes me 600. Everyone\'s happy except Rizzo.'], () => {
    delete S.inv.bub_tv; s.tv = 3; markDirty(); SFX.coin(); toast('MARKED BILLS', 'Crabby paid in cash. That cash is evidence.', 2.6); lt2Got('sale'); });
  if (s.tv === 3 && lt2Ready()) { openDlg('Crabby\'s Pawn', 'Crabby'); $('dlgLine').textContent = '"Back already? I\'m out of TVs. I\'m out of everything. Why are you smiling like that?"';
    return acts([['🪪 Flash your badge: all three are under arrest', () => { closeDlg(); lt2Bust(); }, true], ['Not yet', closeDlg]]); }
  if (!s.tv || s.tv === 3) return bubTalk('Crabby\'s Pawn', 'Crabby', ['"A Marshal? I sell... socks. Nice socks. Have a good day, officer."']);
  return f0.apply(this, arguments); }; }
// the badge stays in your pocket until the case is made: flashing it near any of the three would blow it
{ const f0 = mFlash; mFlash = function () { const s = bubS(); if (mOn() && LEVEL.id === 'bubblecity' && s.tv >= 1 && !lt2().done && !(s.tv === 3 && lt2Ready())) {
    const near = INTERACTS.some(i => [bubRizzo, bubDot, bubPawn].some(f => i.fn === f || (i.fn && i.fn.name === f.name)) && Math.hypot(i.x - player.pos.x, i.z - player.pos.z) < 9);
    if (near) { toast('NOT YET', 'Flash the badge now and they all clam up. Get the evidence first.', 2.6); return; } }
  return f0.apply(this, arguments); }; }
// the Karaoke Clam KJ, who can blow Rizzo's alibi
function lt2KJ() { const s = bubS(); openDlg('Karaoke Clam', 'The KJ');
  $('dlgLine').textContent = '"Sign-up sheet\'s by the mic. Tonight\'s theme is sea shanties. Every night\'s theme is sea shanties."';
  const L = []; if (s.tv >= 1 && mOn() && !lt2().done) L.push(['Was Rizzo in here today?', () => { $('dlgLine').textContent = '"idk, no one has been coming in today. Just you."'; lt2Got('alibi'); acts([['Thanks', closeDlg, true]]); }, true]);
  else if (s.tv >= 1) L.push(['Seen Rizzo today?', () => { $('dlgLine').textContent = '"idk, no one has been coming in today. Just you."'; acts([['Thanks', closeDlg, true]]); }]);
  L.push(['Bye', closeDlg]); acts(L); }
{ const f0 = ltDress; ltDress = function () { const r = f0.apply(this, arguments); try { const R = LT.rooms.kar; if (R) INTERACTS.push({ x: R.x + 2.6, z: R.z - R.L / 2 + 2.8, r: 1.5, label: '🎤 Talk to the KJ', fn: lt2KJ }); } catch (e) { console.warn('lt2', e); } return r; }; }
