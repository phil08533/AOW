// =================== PC CONTROLS: the mouse goes straight back to aiming when a menu closes ===================
// Before: closing a menu left the mouse free, so your first click both grabbed the mouse AND fired a shot.
// Now: closing a menu takes the mouse back for aiming on its own (the click or key that closed it counts as the gesture the browser needs).
// If the browser still says no (it does for a moment after Esc), the cursor stays hidden and the next click only grabs the mouse, never fires.
let lockWorks = false, lockDrop = 0;
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement === stage) lockWorks = true; });
{ const _ex = document.exitPointerLock.bind(document); document.exitPointerLock = function () { lockDrop = performance.now(); return _ex(); }; }
const uiBusy = () => dlgOpen || chatOpen() || !$('menuDrop').hidden || !!document.getElementById('ending') || (typeof CUT !== 'undefined' && CUT.on) || (typeof PHOTO !== 'undefined' && PHOTO.on) || (typeof baseState !== 'undefined' && baseState.on);
function relock() { if (TOUCH || state !== 'play' || uiBusy() || document.pointerLockElement) return; lock(); }
// the first click after a menu only grabs the mouse; it doesn't shoot
stage.addEventListener('mousedown', e => { if (TOUCH || state !== 'play' || uiBusy() || document.pointerLockElement || !lockWorks) return; lock(); e.stopImmediatePropagation(); }, true);
// Esc while aiming: the browser frees the mouse and swallows the key, so open the pause menu right away instead of needing a second Esc
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement || TOUCH || state !== 'play' || uiBusy()) return;
  if (performance.now() - lockDrop < 400) return; // the game freed the mouse on purpose (menu, map, cutscene)
  setTimeout(() => { if (state === 'play' && !uiBusy() && !document.pointerLockElement) setState('pause'); }, 60);
});
// ---- number keys: 1 gun · 2 staff · 3 melee, and 1–9 pick options in any menu ----
function pickSlot(want) {
  if (state !== 'play' || dlgOpen || LEVEL.fly) return;
  if (want === 'melee') { if (!handMelee()) swapHand(); return; }
  if (handMelee()) swapHand();
  const isStaff = isStaffId(S.gun), o = otherSlot();
  if ((want === 'staff') === isStaff && !S.dual) return;
  if (S.dual) { S.dual = false; if ((want === 'staff') === isStaff) { SFX.ui(); markDirty(); return; } }
  if (!o) { log(want === 'staff' ? 'No staff equipped. Buy one from a mage or the armory.' : 'No gun equipped.'); return; }
  WMEM[S.gun] = { ammo: player.ammo, manaF: player.manaF, t: gameTime };
  S.gun = o; const m = WMEM[o], g = GUNS[o];
  if (m) { const regen = g.mana ? (gameTime - m.t) * g.mag / (g.reload * 2.2) : 0; player.ammo = Math.min(g.mag, Math.floor((m.manaF != null ? m.manaF : m.ammo) + regen)); player.manaF = g.mana ? player.ammo : null; }
  else { player.ammo = g.mag; player.manaF = null; }
  player.reloading = 0; player.cool = Math.max(player.cool, 0.15); firing = false; SFX.ui(); markDirty(); log(`${g.name} out.`);
}
window.addEventListener('keydown', e => {
  if (e.repeat || chatOpen() || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
  const n = /^Digit([1-9])$/.exec(e.code); if (!n || state !== 'play') return;
  if (!$('menuDrop').hidden) { if (typeof tabletNum === 'function') tabletNum(+n[1]); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if (dlgOpen) { const bs = [...$('dlgActs').querySelectorAll('button')].filter(b => !b.disabled); const b = bs[+n[1] - 1]; if (b) { b.click(); e.preventDefault(); e.stopImmediatePropagation(); } return; }
  if (n[1] === '1') pickSlot('gun'); else if (n[1] === '2') pickSlot('staff'); else if (n[1] === '3') pickSlot('melee');
}, true);
// show the number next to each menu option
{ const _a = acts; acts = function (list) { const r = _a(list); if (!TOUCH) { let k = 0; $('dlgActs').querySelectorAll('button').forEach(b => { if (!b.disabled && ++k <= 9) b.dataset.k = k; }); } return r; }; }
{ const st = document.createElement('style'); st.textContent = '#dlgActs .pbtn[data-k]::after{content:" " attr(data-k);font-size:11px;opacity:.6;margin-left:4px;padding:0 4px;border:1px solid currentColor;border-radius:3px}'; document.head.appendChild(st); }
// mouse wheel cycles weapons: gun → staff → melee (2.14.2)
{ let wheelT = 0; stage.addEventListener('wheel', e => { if (TOUCH || state !== 'play' || uiBusy() || LEVEL.fly) return; e.preventDefault(); const now = performance.now(); if (now - wheelT < 220) return; wheelT = now;
  cycleWeapon(); }, { passive: false }); }
// I opens the bag too, like most games
window.addEventListener('keydown', e => { if (e.code === 'KeyI' && !e.repeat && state === 'play' && !dlgOpen && !chatOpen()) openBag(); });
{ let pausedAt = 0; document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement) pausedAt = performance.now(); });
  window.addEventListener('keydown', e => { if (e.code === 'Escape' && state === 'pause' && performance.now() - pausedAt < 350) e.stopImmediatePropagation(); }, true); }
// aim comes back by itself the moment a menu closes
{ let wasBusy = true;
  setInterval(() => { const busy = state !== 'play' || uiBusy(); if (wasBusy && !busy) relock(); wasBusy = busy; document.body.classList.toggle('aimfree', !TOUCH && !busy && !document.pointerLockElement); }, 50);
  for (const ev of ['pointerup', 'keyup']) window.addEventListener(ev, () => setTimeout(relock, 0), true);
  const st = document.createElement('style'); st.textContent = 'body.aimfree #stage{cursor:none}'; document.head.appendChild(st); }
{ const _cd = closeDlg; closeDlg = function () { const r = _cd(); setTimeout(relock, 0); return r; }; }
