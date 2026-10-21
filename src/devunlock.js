// =================== DEV UNLOCK: tap the version line on the title screen 7 times to unlock everything (for testing) ===================
function devUnlockAll() {
  S.lvl = Math.max(S.lvl, 100); S.xp = 0; S.cr += 10000000;
  S.guns = [...new Set([...(S.guns || []), ...Object.keys(GUNS)])];
  S.melees = [...new Set([...(S.melees || []), ...Object.keys(MELEE)])];
  S.gear = [...new Set([...(S.gear || []), ...Object.keys(GEAR)])];
  S.ship = S.ship || {}; S.ship.unlocked = true;
  const T = (f) => { try { f(); } catch (e) { console.warn('unlock', e); } };
  T(() => { S.ship.rooms = [...new Set([...(S.ship.rooms || []), ...Object.keys(ROOMS)])]; S.ship.lvl = S.ship.lvl || {}; for (const k in ROOMS) S.ship.lvl[k] = ROOM_MAX; });
  T(() => { S.ownA = S.ownA || {}; for (const k in ARMORS) S.ownA[k] = 1; });
  T(() => { S.furn = S.furn || {}; for (const k in FURN) S.furn[k] = 1; });
  T(() => { S.pets = [...new Set([...(S.pets || []), ...Object.keys(PETS)])]; });
  T(() => { S.saberMods = S.saberMods || {}; for (const k in SABER_MODS) S.saberMods[k] = SABER_MODS[k].cost.length; });
  T(() => { const M = smS(); for (const [k, L] of [['p', SHIP_PAINTS], ['a', SHIP_ACCENTS], ['x', SHIP_EXHAUST], ...Object.entries(SHIP_PARTS)]) for (let i = 0; i < L.length; i++) M.own[k + i] = 1; });
  T(() => { S.drone = Object.assign(S.drone || {}, { own: true }); for (const k in DRONE_UP) S.drone[k] = DRONE_UP[k].max; });
  T(() => { const R = rs(); R.owned = [...new Set([...R.owned, ...Object.keys(RCARS)])]; });
  T(() => { const V = vehS(); V.owned = [...new Set([...V.owned, ...Object.keys(VEH)])]; if (!V.sel) V.sel = V.owned[0]; for (const k in V.res) V.res[k] = Math.max(V.res[k], 5); });
  T(() => { for (const k in ITEMS) if (!ITEMS[k].quest && !ITEMS[k].key) S.inv[k] = Math.max(S.inv[k] || 0, 50); });
  if (typeof chemS === 'function') { chemS().xp = Math.max(chemS().xp, 4000); const b = bqBox(); for (const k in BQ_ING) { b[k] = (b[k] || 0) + 20; b['x_' + k] = (b['x_' + k] || 0) + 10; } }
  markDirty(); try { updateHud(); } catch (_) {} toast('DEV UNLOCK', 'Everything unlocked, rooms maxed, 50 of every item and material', 4);
}
{ const el = document.querySelector('.credit'); let n = 0, t = 0; if (el) el.addEventListener('click', () => { const now = Date.now(); n = now - t < 600 ? n + 1 : 1; t = now; if (n >= 7) { n = 0; devUnlockAll(); } }); }
