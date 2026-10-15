// =================== CONTROLLER 2.0: a full layout on top of the basic gamepad support ===================
// LB is a modifier: tap LB = bag; hold LB + Y = gun/staff, LB + X = heal, LB + A = dance, LB + B = codex, LB + RB = melee
// R3 = heal · D-pad in menus · right stick scrolls lists · A/Start skip cutscenes · rumble when hit
const PAD2 = { lbCombo: false, lbDown: false, prev: [] };
function padNow() { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of pads) if (p && p.connected) return p; return null; }
const rumble = (s, w, ms) => { try { const gp = padNow(); if (gp && gp.vibrationActuator && PAD.active) gp.vibrationActuator.playEffect('dual-rumble', { duration: ms || 120, strongMagnitude: s, weakMagnitude: w }); } catch (_) {} };
function padFocusNav(scope, dir) {
  const btns = [...scope.querySelectorAll('button:not(:disabled), input, select')].filter(b => b.offsetParent !== null && !b.hidden);
  if (!btns.length) return; let i = btns.indexOf(document.activeElement); i = i < 0 ? 0 : (i + dir + btns.length) % btns.length; btns[i].focus(); btns[i].scrollIntoView && btns[i].scrollIntoView({ block: 'nearest' });
}
{ const _pp = pollPad; pollPad = function (dt) {
  const gp = padNow(); if (!gp) return _pp(dt);
  const b = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5)), hit = i => b(i) && !PAD2.prev[i];
  const ry = (Math.abs(gp.axes[3] || 0) > 0.25 ? gp.axes[3] : 0);
  // cutscenes: A or Start presses Skip once it's offered
  if (typeof CUT !== 'undefined' && CUT.on && (hit(0) || hit(9))) { const sk = [...document.querySelectorAll('button')].find(x => /Skip/.test(x.textContent) && x.offsetParent); if (sk) sk.click(); PAD2.prev = gp.buttons.map(x => x.pressed || x.value > 0.5); PAD.prev = PAD2.prev.slice(); return; }
  // menus and pause: D-pad moves between buttons, A presses the focused one
  if (state === 'menu' || state === 'pause') {
    const scope = $(state === 'menu' ? 'start' : 'pause') || document.body;
    if (hit(12) || hit(14)) padFocusNav(scope, -1); if (hit(13) || hit(15)) padFocusNav(scope, 1);
    if (hit(0) && document.activeElement && document.activeElement.tagName === 'BUTTON' && scope.contains(document.activeElement)) { document.activeElement.click(); PAD2.prev = gp.buttons.map(x => x.pressed || x.value > 0.5); PAD.prev = PAD2.prev.slice(); return; }
    if (hit(1) && state === 'pause') $('resumeBtn').click();
  }
  // dialogs: right stick scrolls long lists
  if (dlgOpen && ry) { const r = $('shopRows') || $('dlg'); if (r) r.scrollTop += ry * 900 * dt; }
  if (state === 'play' && !dlgOpen) {
    // LB modifier layer
    if (b(4)) { if (!PAD2.lbDown) { PAD2.lbDown = true; PAD2.lbCombo = false; }
      const combo = (i, fn) => { if (hit(i)) { PAD2.lbCombo = true; try { fn(); } catch (_) {} } };
      combo(3, () => typeof cycleWeapon === 'function' && cycleWeapon()); combo(2, () => quickHeal()); combo(1, () => openCodex && openCodex());
      combo(0, () => typeof toggleDance === 'function' && inLounge() ? toggleDance() : null); combo(5, () => swapHand());
    } else if (PAD2.lbDown) { PAD2.lbDown = false; if (!PAD2.lbCombo) openBag(); }
    if (hit(11)) quickHeal();
    // Y with nothing to reload swaps gun/staff instead
    if (hit(3) && !b(4) && (S.clip || (gun() && gun().mana)) && typeof cycleWeapon === 'function') cycleWeapon();
  }
  // hide from the base handler what this layer handles: LB taps, R3, and face buttons while LB is held
  const save = PAD.prev.slice(); const mask = [4, 11]; if (b(4)) mask.push(0, 1, 2, 3, 5);
  for (const i of mask) PAD.prev[i] = b(i);
  _pp(dt);
  PAD2.prev = gp.buttons.map(x => x.pressed || x.value > 0.5);
  void save;
}; }
{ const _h = hurt; hurt = function (dmg, src) { const hp0 = player.hp, r = _h.apply(this, arguments); if (player.hp < hp0) { const k = Math.min(1, (hp0 - player.hp) / Math.max(1, maxHp()) * 4); rumble(0.3 + 0.6 * k, 0.4, 90 + 160 * k); } return r; }; }
{ const _k = kill; kill = function (e) { const r = _k.apply(this, arguments); if (e && e.def && e.def.boss) rumble(1, 1, 600); return r; }; }
window.addEventListener('gamepadconnected', () => { setTimeout(() => toast('CONTROLLER', 'Tap LB for the bag · hold LB for more · F1 lists everything', 3.5), 3600); });
