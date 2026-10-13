// =================== 1.9 FIXES: arena popup, lounge, other players' weapons and dancing, Zeltac floors, mouse, ceilings ===================

// ---- arena: the betting card shows while bets are open, then shrinks to a small chip at the edge once the fight starts ----
{ const st = document.createElement('style'); st.textContent = `
body #hud #bout.compact { left: 12px !important; right: auto !important; transform: none !important; top: auto !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 156px) !important; width: 210px !important; padding: 3px 8px 5px !important; opacity: .9; }
body #hud #bout.compact .brow { font-size: 11px; margin-top: 1px; } body #hud #bout.compact .bar { height: 5px; } body #hud #bout.compact .bsub { font-size: 11px; margin-top: 2px; }
@media (pointer: coarse) { body #hud #bout.compact { bottom: auto !important; top: calc(env(safe-area-inset-top, 0px) + 96px) !important; width: 180px !important; } }
`; document.head.appendChild(st); }
{ const _bh = boutHud; boutHud = function () { const r = _bh.apply(this, arguments); if (boutEl) { const B = ARENA.bout; boutEl.classList.toggle('compact', !B || !(B.open > 0)); } return r; }; }

// ---- what other players see: your weapon, your dancing and which Zeltac floor you're on ----
const myWeaponCode = () => (typeof inLounge === 'function' && inLounge()) ? '' : handMelee() ? 'm:' + (S.melee || 'knife') : String(S.gun || 'b1');
{ const _pw = pvpWrite; pvpWrite = function (p) { _pw(p); p.gn = myWeaponCode(); if (typeof DANCE !== 'undefined' && DANCE.on) p.dn = 1; if (LEVEL && LEVEL.id === 'zfloor' && typeof ZF !== 'undefined') p.zf = ZF.floor; }; }
let lastWeaponSent = '';
{ const _st = step; step = function (dt) { _st(dt); const w = myWeaponCode() + (typeof DANCE !== 'undefined' && DANCE.on ? '+d' : ''); if (w !== lastWeaponSent) { lastWeaponSent = w; try { sendPresence(true); } catch (_) {} } }; }
function remoteWeapon(r, code) {
  if (r.gnCode === code) return; r.gnCode = code;
  let std = null; r.obj.traverse(c => { if (c.userData && c.userData.stdGun) std = c; });
  if (!std) return;
  if (r.gnObj) { r.gnObj.parent && r.gnObj.parent.remove(r.gnObj); r.gnObj = null; }
  std.visible = false;
  if (!code) return; // hands empty (lounge)
  let m = null;
  try { if (code.startsWith('m:')) { const id = code.slice(2); if (MELEE[id]) { m = makeMeleeModel(id); m.scale.setScalar(0.85); m.rotation.set(0.5, 0, 0); } }
    else if (GUNS[code]) { m = makeGunModel(code); m.scale.setScalar(std.scale.x * 1.4); } } catch (_) { m = null; }
  if (!m) { std.visible = true; return; }
  m.position.copy(std.position); if (!code.startsWith('m:')) m.quaternion.copy(std.quaternion);
  m.traverse(o => { if (o.isMesh) o.castShadow = false; }); std.parent.add(m); r.gnObj = m;
}
{ const _sp = syncPeers; syncPeers = function (peers) { _sp(peers);
  for (const peer of peers || []) { if (peer.isMe) continue; const r = remotes.get(peer.peer); if (!r) continue; const pr = peer.presence || {};
    remoteWeapon(r, typeof pr.gn === 'string' ? pr.gn.slice(0, 24) : 'b1');
    r.dance = !!pr.dn;
    r.otherFloor = !!(LEVEL && LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' && typeof pr.zf === 'number' && pr.zf !== ZF.floor); } }; }
{ const _st = step; step = function (dt) { _st(dt);
  for (const r of remotes.values()) {
    if (r.otherFloor) { r.obj.visible = false; continue; } if (!r.obj.visible) r.obj.visible = true;
    if (r.dance) { r.danceT = (r.danceT || 0) + dt; const b = Math.abs(Math.sin(r.danceT * 4.2)); r.obj.position.y = r.target.y + b * 0.22; r.obj.rotation.z = Math.sin(r.danceT * 2.1) * 0.12; r.obj.rotation.y += Math.sin(r.danceT * 1.3) * dt * 3; }
    else if (r.obj.rotation.z) r.obj.rotation.z = 0;
  }
  // lounge: no weapon of any kind in your hands
  if (typeof inLounge === 'function' && inLounge()) { vm.visible = false; vmMelee.visible = false; if (typeof vmOff !== 'undefined' && vmOff) vmOff.visible = false; }
}; }

// ---- the President's party button only shows when you're right next to him ----
{ const _st = step; step = function (dt) { _st(dt);
  if (nearNpc === 'prez' && npcObjs.prez && npcObjs.prez.obj.position.distanceTo(player.pos) > 1.9) { nearNpc = null; if (!nearAct) $('talk').hidden = true; } }; }

// ---- mouse: ignore the huge jumps some browsers send while the mouse is captured (the "mouse spazzes out" bug) ----
window.addEventListener('mousemove', e => { if (document.pointerLockElement && (Math.abs(e.movementX) > 220 || Math.abs(e.movementY) > 220)) e.stopImmediatePropagation(); }, true);

// ---- indoors (ship, Zeltac, apartments): your head stops at the ceiling instead of poking through the roof ----
{ const rc = new THREE.Raycaster(), up = V(0, 1, 0);
  const _st = step; step = function (dt) { _st(dt);
    if (!LEVEL || LEVEL.terrain || LEVEL.fly || player.onGround || player.vy <= 0 || state !== 'play') return;
    rc.set(V(player.pos.x, player.pos.y + 1.2, player.pos.z), up); rc.far = 0.75; rc.camera = camera;
    let hit = null; try { hit = rc.intersectObject(levelGroup, true).find(h => h.object.isMesh && h.object.visible && !(h.object.material && h.object.material.transparent)); } catch (_) {}
    if (hit) { player.pos.y = Math.min(player.pos.y, hit.point.y - 1.95); player.vy = Math.min(player.vy, 0); player.jet = 0; } }; }
