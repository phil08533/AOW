// =================== SHIP ROOMS: what each room is for ===================
const buffs = () => { S.buffs = S.buffs || {}; return S.buffs; };
const buffOn = k => (buffs()[k] || 0) > Date.now();
function sleepInBunk() {
  player.hp = maxHp(); buffs().rest = Date.now() + 15 * 60000; markDirty(); SFX.quest();
  const f = $('fade'); f.hidden = false; f.style.opacity = 1; $('fadeTxt').textContent = 'Zzz…';
  setTimeout(() => { f.style.opacity = 0; setTimeout(() => { f.hidden = true; }, 400); toast('WELL RESTED', 'Full health · +15% XP for 15 minutes', 3); }, 900);
}
function refillOrdnance() {
  if (ordCharges >= ORD_MAX) { toast('ORDNANCE', 'Already full', 1.2); return; }
  ordCharges = ORD_MAX; SFX.item ? SFX.item() : SFX.ui(); toast('ORDNANCE', `Refilled to ${ORD_MAX}`, 1.5);
}
function useStim() {
  const B0 = buffs(), now = Date.now();
  openDlg('Med Bay', 'Stim station');
  if (B0.stimCd && B0.stimCd > now) { $('dlgLine').textContent = `The stim synthesizer is still cooling down. Ready in ${Math.ceil((B0.stimCd - now) / 60000)} min.`; acts([['Close', closeDlg, true]]); return; }
  $('dlgLine').textContent = 'An armor stim hardens your skin for 10 minutes: you take 25% less damage. One dose every 30 minutes.';
  acts([['Inject', () => { B0.stim = now + 10 * 60000; B0.stimCd = now + 30 * 60000; markDirty(); closeDlg(); SFX.quest(); toast('ARMOR STIM', '-25% damage taken for 10 minutes', 3); }, true], ['Not now', closeDlg]]);
}
{ const _g = gainXp; gainXp = function (n) { return _g(buffOn('rest') ? Math.round(n * 1.15) : n); }; }
{ const _h = hurt; hurt = function (dmg, src) { return _h(buffOn('stim') ? dmg * 0.75 : dmg, src); }; }
// show active buffs on the HUD next to the medkit and drone chips
{ const chip = document.createElement('span'); chip.className = 'vchip'; chip.style.cursor = 'default'; chip.hidden = true; const host = document.getElementById('vchips'); if (host) host.appendChild(chip);
  setInterval(() => { const t = []; const now = Date.now(); if (buffOn('rest')) t.push(`💤 ${Math.ceil((buffs().rest - now) / 60000)}m`); if (buffOn('stim')) t.push(`🛡 ${Math.ceil((buffs().stim - now) / 60000)}m`); chip.hidden = !t.length; chip.textContent = t.join(' '); }, 1000); }
