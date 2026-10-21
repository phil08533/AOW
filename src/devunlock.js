// =================== DEV UNLOCK: tap the version line on the title screen 7 times to unlock everything (for testing) ===================
function devUnlockAll() {
  S.lvl = Math.max(S.lvl, 100); S.xp = 0; S.cr += 10000000;
  S.guns = [...new Set([...(S.guns || []), ...Object.keys(GUNS)])];
  S.melees = [...new Set([...(S.melees || []), ...Object.keys(MELEE)])];
  S.gear = [...new Set([...(S.gear || []), ...Object.keys(GEAR)])];
  S.ship = S.ship || {}; S.ship.unlocked = true;
  if (typeof chemS === 'function') { chemS().xp = Math.max(chemS().xp, 4000); const b = bqBox(); for (const k in BQ_ING) { b[k] = (b[k] || 0) + 20; b['x_' + k] = (b['x_' + k] || 0) + 10; } }
  markDirty(); try { updateHud(); } catch (_) {} toast('DEV UNLOCK', 'Level 100, every gun, melee and gear piece, ship, 10M credits and a full drug box', 4);
}
{ const el = document.querySelector('.credit'); let n = 0, t = 0; if (el) el.addEventListener('click', () => { const now = Date.now(); n = now - t < 600 ? n + 1 : 1; t = now; if (n >= 7) { n = 0; devUnlockAll(); } }); }
