// =================== LOADOUT: carry a gun AND a staff; New Game+ lets you wield both at once ===================
const isStaffId = id => !!(GUNS[id] && GUNS[id].mana);
const WMEM = {}; // remembered ammo/mana per weapon, so swapping doesn't refill for free
const OFF = { id: null, ammo: 0, manaF: null, cool: 0, reloading: 0 };
let vmOff = null, vmOffId = null;
function loadoutSlots() { S.slots = S.slots || {}; const g = S.gun; if (GUNS[g] && S.guns.includes(g)) S.slots[isStaffId(g) ? 'staff' : 'gun'] = g;
  for (const k of ['gun', 'staff']) if (S.slots[k] && !S.guns.includes(S.slots[k])) delete S.slots[k]; return S.slots; }
const otherSlot = () => { const s = loadoutSlots(); return isStaffId(S.gun) ? s.gun : s.staff; };
const canDual = () => (S.asc || 0) >= 1;
const dualOn = () => !!S.dual && canDual() && !!otherSlot() && !LEVEL.fly && !handMelee() && !(typeof inLounge === 'function' && inLounge());
function swapWeapon() {
  if (state !== 'play' || dlgOpen || LEVEL.fly) return;
  const o = otherSlot();
  if (!o) { log('Carry a gun and a staff: equip one of each (shop or armory) and swap with Y, or tap the ammo box.'); return; }
  if (handMelee()) swapHand();
  // New Game+: Gun → Staff → BOTH → Gun …
  if (canDual() && !S.dual && isStaffId(S.gun)) { S.dual = true; OFF.id = null; SFX.ui(); toast('DUAL WIELD', `${GUNS[S.gun].name} + ${GUNS[o].name}`, 1.4); markDirty(); return; }
  if (S.dual) { S.dual = false; }
  WMEM[S.gun] = { ammo: player.ammo, manaF: player.manaF, t: gameTime };
  S.gun = o; const m = WMEM[o], g = GUNS[o];
  if (m) { const regen = g.mana ? (gameTime - m.t) * g.mag / (g.reload * 2.2) : 0; player.ammo = Math.min(g.mag, Math.floor((m.manaF != null ? m.manaF : m.ammo) + regen)); player.manaF = g.mana ? player.ammo : null; }
  else { player.ammo = g.mag; player.manaF = null; }
  player.reloading = 0; player.cool = Math.max(player.cool, 0.15); firing = false; SFX.ui(); markDirty();
  log(`${g.name} out.${canDual() ? ' Press Y again for the next mode.' : ''}`);
}
window.addEventListener('keydown', e => { if (e.code === 'KeyY' && state === 'play' && !dlgOpen && !chatOpen() && !e.repeat) swapWeapon(); });
$('ammo').addEventListener('click', e => { if (state === 'play' && !dlgOpen && otherSlot()) { e.stopImmediatePropagation(); swapWeapon(); } }, true);
// ---- the offhand: its own ammo, mana and cooldown; fires alongside the main hand ----
function offSync() { const o = otherSlot(); if (OFF.id === o) return; OFF.id = o; const g = GUNS[o]; if (!g) return; const m = WMEM[o]; OFF.ammo = m ? Math.min(g.mag, m.ammo) : g.mag; OFF.manaF = g.mana ? OFF.ammo : null; OFF.cool = 0; OFF.reloading = 0; }
{ const _f = fire; fire = function () {
  _f.apply(this, arguments);
  if (!dualOn()) return; offSync(); if (OFF.cool > 0 || OFF.reloading > 0 || !OFF.id) return;
  const keep = { gun: S.gun, ammo: player.ammo, manaF: player.manaF, cool: player.cool, reloading: player.reloading, vg: vmGun };
  S.gun = OFF.id; player.ammo = OFF.ammo; player.manaF = OFF.manaF; player.cool = 0; player.reloading = 0; if (vmOff) vmGun = vmOff;
  try { _f.apply(this, arguments); } finally {
    OFF.ammo = player.ammo; OFF.cool = player.cool; OFF.reloading = player.reloading; if (OFF.manaF != null) { const fl = Math.floor(OFF.manaF); if (OFF.ammo < fl) OFF.manaF -= fl - OFF.ammo; }
    S.gun = keep.gun; player.ammo = keep.ammo; player.manaF = keep.manaF; player.cool = keep.cool; player.reloading = keep.reloading; vmGun = keep.vg; }
}; }
{ const _s = step; step = function (dt) { _s(dt); try {
  const on = state === 'play' && dualOn();
  if (on) { offSync(); const g = GUNS[OFF.id]; OFF.cool -= dt;
    if (OFF.reloading > 0) { OFF.reloading -= dt; if (OFF.reloading <= 0) OFF.ammo = g.mag; }
    else if (!S.clip && !g.mana && OFF.ammo <= 0) OFF.reloading = g.reload;
    if (g.mana) { if (OFF.manaF == null) OFF.manaF = OFF.ammo; OFF.manaF = Math.min(g.mag, OFF.manaF + dt * g.mag / (g.reload * 2.2)); OFF.ammo = Math.floor(OFF.manaF); }
    if (vmOffId !== OFF.id) { if (vmOff) camera.remove(vmOff); vmOff = makeGunModel(OFF.id); vmOff.rotation.y = Math.PI; vmOff.scale.setScalar(0.36); vmOff.traverse(o => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 2; } }); camera.add(vmOff); vmOffId = OFF.id; }
    vmOff.visible = player.alive; vmOff.position.set(-vm.position.x - 0.02, vm.position.y - (OFF.reloading > 0 ? 0.1 : 0), vm.position.z); vmOff.rotation.z = 0.08;
  } else if (vmOff) vmOff.visible = false;
  offHud(on);
} catch (e) { } }; }
// ---- HUD: a second readout under the ammo counter ----
const offEl = document.createElement('div'); offEl.id = 'offAmmo'; $('ammo').appendChild(offEl);
{ const st = document.createElement('style'); st.textContent = '#offAmmo { font: 700 11px var(--mono); color: #c9b8ff; letter-spacing: .04em; margin-top: 2px; } #offAmmo:empty { display: none; } #offAmmo .k { opacity: .7; }'; document.body.appendChild(st); }
let offTxt = '';
function offHud(on) { let t = ''; const o = otherSlot();
  if (on && GUNS[OFF.id]) { const g = GUNS[OFF.id]; t = `+ ${g.mana ? '✦' : '◈'} ${OFF.reloading > 0 ? '…' : S.clip && !g.mana ? '∞' : OFF.ammo + '/' + g.mag}`; }
  else if (o && state === 'play' && !LEVEL.fly) t = `<span class="k">${TOUCH ? 'tap' : 'Y'} ⇄</span> ${isStaffId(o) ? '✦ staff' : '◈ gun'}${canDual() && isStaffId(S.gun) ? ' · both' : ''}`;
  if (t !== offTxt) { offTxt = t; offEl.innerHTML = t; } }
// keep the offhand fresh when you level up or change weapons in a shop
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); OFF.id = null; return r; }; }
