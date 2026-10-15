// =================== SHIP AMMO: five ways to shoot in space ===================
// 1 Lasers (the classic twin beams) · 2 Plasma (slow, heavy, purple) · 3 Flak (a spread that shreds swarms and rocks)
// 4 Missiles (lock on and chase, 6 in the rack, they reload over time) · 5 EMP (a pulse that freezes raiders around you)
const SHIP_AMMO = [
  { id: 'laser', name: 'Lasers', key: '1', col: '#6fdc5a', cool: 0.16, mult: 1 },
  { id: 'plasma', name: 'Plasma', key: '2', col: '#c86aff', cool: 0.42, mult: 2.6 },
  { id: 'flak', name: 'Flak', key: '3', col: '#ffb03b', cool: 0.55, mult: 0.42, pellets: 5 },
  { id: 'missile', name: 'Missiles', key: '4', col: '#ff5a3a', cool: 0.6, mult: 5 },
  { id: 'emp', name: 'EMP', key: '5', col: '#4fd2ff', cool: 6, mult: 0.8 },
];
const SAMMO = { i: 0, rack: 6, rackT: 0, missiles: [], rings: [], hud: null };
const sammoCur = () => SHIP_AMMO[SAMMO.i] || SHIP_AMMO[0];
function sammoBaseDmg() { return SHIP_SYS.laser.lv[sysLv('laser')].dmg * (1 + (S.lvl - 1) * 0.03) * (typeof shipMod === 'function' ? shipMod('laser') : 1); }
function sammoPick(i) { if (!LEVEL || !LEVEL.fly || i === SAMMO.i || !SHIP_AMMO[i]) return; SAMMO.i = i; S.shipAmmo = SHIP_AMMO[i].id; markDirty(); SFX.ui(); toast('AMMO', SHIP_AMMO[i].name, 0.7); sammoHud(); }
function sammoHud() {
  let h = SAMMO.hud; if (!h) { h = SAMMO.hud = document.createElement('div'); h.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 112px);transform:translateX(-50%);z-index:22;display:flex;gap:4px;pointer-events:auto;font:700 11px system-ui,sans-serif'; document.body.appendChild(h);
    SHIP_AMMO.forEach((a, i) => { const b = document.createElement('button'); b.style.cssText = 'border:1px solid rgba(255,255,255,.25);border-radius:7px;padding:4px 7px;background:rgba(10,14,30,.7);color:#cfe0ff;font:inherit;cursor:pointer'; b.addEventListener('click', e => { e.stopPropagation(); sammoPick(i); }); b.addEventListener('touchstart', e => { e.stopPropagation(); e.preventDefault(); sammoPick(i); }, { passive: false }); h.appendChild(b); }); }
  const show = LEVEL && LEVEL.fly && state === 'play' && !dlgOpen; h.hidden = !show; if (!show) return;
  [...h.children].forEach((b, i) => { const a = SHIP_AMMO[i], on = i === SAMMO.i; b.textContent = (TOUCH ? '' : a.key + ' ') + a.name + (a.id === 'missile' ? ` ${SAMMO.rack}` : a.id === 'emp' && SAMMO.empT > gameTime ? ` ${Math.ceil(SAMMO.empT - gameTime)}s` : '');
    b.style.borderColor = on ? a.col : 'rgba(255,255,255,.2)'; b.style.color = on ? a.col : '#9fb0c8'; b.style.background = on ? 'rgba(20,28,60,.9)' : 'rgba(10,14,30,.6)'; });
}
addEventListener('keydown', e => { if (!LEVEL || !LEVEL.fly || state !== 'play' || dlgOpen || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; const m = /^Digit([1-5])$/.exec(e.code); if (m) { sammoPick(+m[1] - 1); e.preventDefault(); } }, true);
function sammoAim() { _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q); shipUp.set(0, 1, 0).applyQuaternion(_q); }
function sammoTarget(maxA, maxD) { let best = null, bA = maxA; for (const r of fly.raiders) { if (r.dead) continue; const to = r.obj.position.clone().sub(player.pos), d = to.length(); if (d > maxD) continue; const a = to.normalize().angleTo(shipFwd); if (a < bA) { bA = a; best = r; } } return best; }
function sammoHit(r, dmg, at, col) { if (!r || r.dead) return; r.hp -= dmg; r.aggro = true; burst(at || r.obj.position, col, 10, 16); hitmark(r.hp <= 0); if (r.hp <= 0) killRaider(r); else drawPlate(r.plate, (r.def && r.def.name) || 'Drome Raider', 'Lv ' + r.lv, hpColor(r.lv), r.hp / r.max); }
{ const _sf = shipFire; shipFire = function () {
  const A = sammoCur(), F = fly; if (!F) return _sf.apply(this, arguments);
  if (A.id === 'laser') return _sf.apply(this, arguments);
  const L = SHIP_SYS.laser.lv[sysLv('laser')], d0 = L.dmg;
  if (A.id === 'plasma' || A.id === 'flak') {
    const _tr = tracer; tracer = (a, b) => _tr(a, b, A.col); L.dmg = d0 * A.mult;
    const y0 = player.yaw, p0 = player.pitch;
    try { for (let k = 0; k < (A.pellets || 1); k++) { if (A.pellets) { player.yaw = y0 + rand(-0.07, 0.07); player.pitch = p0 + rand(-0.05, 0.05); } _sf.apply(this, arguments); } }
    finally { L.dmg = d0; tracer = _tr; player.yaw = y0; player.pitch = p0; }
    F.cool = A.cool; F.shake = Math.max(F.shake, A.id === 'plasma' ? 0.12 : 0.08); if (A.id === 'plasma') { SFX.boom && SFX.boom(); }
    return;
  }
  sammoAim();
  if (A.id === 'missile') {
    if (SAMMO.rack <= 0) { F.cool = 0.4; SFX.dry && SFX.dry(); toast('MISSILES', 'Rack empty, reloading', 0.8); return; }
    SAMMO.rack--; F.cool = A.cool; const tgt = sammoTarget(0.6, 900);
    const m = new THREE.Group(); part(m, B(0.5, 0.5, 2.2), '#d8dce4', 0, 0, 0); part(m, B(0.6, 0.6, 0.4), glow('#ff5a3a'), 0, 0, 1.2); m.position.copy(player.pos).addScaledVector(shipUp, -1.6); levelGroup.add(m);
    SAMMO.missiles.push({ m, v: shipFwd.clone().multiplyScalar(Math.max(90, F.vel.length() + 60)), tgt, life: 6, dmg: sammoBaseDmg() * A.mult });
    SFX.zap && SFX.zap(); F.shake = Math.max(F.shake, 0.1); sammoHud(); return;
  }
  if (A.id === 'emp') {
    if ((SAMMO.empT || 0) > gameTime) { F.cool = 0.3; return; }
    SAMMO.empT = gameTime + A.cool; F.cool = 0.5; SFX.boom && SFX.boom(); F.shake = Math.max(F.shake, 0.4);
    const ring = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: '#4fd2ff', transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); ring.position.copy(player.pos); levelGroup.add(ring); SAMMO.rings.push({ m: ring, t: 0 });
    let n = 0; for (const r of F.raiders) { if (r.dead || r.obj.position.distanceTo(player.pos) > 170) continue; r.stunT = gameTime + 3.5; r.stunAt = r.obj.position.clone(); n++; sammoHit(r, sammoBaseDmg() * A.mult, null, '#4fd2ff'); }
    toast('EMP', n ? `${n} raider${n > 1 ? 's' : ''} frozen` : 'Nothing in range', 1); sammoHud(); return;
  }
}; }
{ const _st = step; step = function (dt) { _st(dt);
  if (!LEVEL || !LEVEL.fly || !fly) { if (SAMMO.hud) SAMMO.hud.hidden = true; if (SAMMO.missiles.length) { SAMMO.missiles.length = 0; } SAMMO.rings.length = 0; return; }
  if (S.shipAmmo && sammoCur().id !== S.shipAmmo) { const i = SHIP_AMMO.findIndex(a => a.id === S.shipAmmo); if (i >= 0) SAMMO.i = i; }
  if (SAMMO.rack < 6 && (SAMMO.rackT += dt) > 8) { SAMMO.rackT = 0; SAMMO.rack++; }
  // missiles: turn toward the target, then hit it
  for (let i = SAMMO.missiles.length - 1; i >= 0; i--) { const M = SAMMO.missiles[i]; M.life -= dt; let done = M.life <= 0;
    if (M.tgt && !M.tgt.dead) { const want = M.tgt.obj.position.clone().sub(M.m.position), d = want.length(); want.normalize().multiplyScalar(Math.max(140, M.v.length())); M.v.lerp(want, Math.min(1, dt * 3)); if (d < 6) { sammoHit(M.tgt, M.dmg, M.m.position, '#ff9a3c'); burst(M.m.position, '#ffd36a', 20, 22); SFX.boom && SFX.boom(); done = true; } }
    else M.v.multiplyScalar(1 + dt * 0.5);
    M.m.position.addScaledVector(M.v, dt); M.m.lookAt(M.m.position.clone().sub(M.v)); if (Math.random() < 0.6) burst(M.m.position, '#ff9a3c', 1, 3);
    if (done) { levelGroup.remove(M.m); SAMMO.missiles.splice(i, 1); } }
  for (let i = SAMMO.rings.length - 1; i >= 0; i--) { const R = SAMMO.rings[i]; R.t += dt; R.m.position.copy(player.pos); R.m.scale.setScalar(5 + R.t * 340); R.m.material.opacity = Math.max(0, 0.5 - R.t); if (R.t > 0.5) { levelGroup.remove(R.m); SAMMO.rings.splice(i, 1); } }
  // frozen raiders hang in place and can't shoot
  for (const r of fly.raiders) if (r.stunT && r.stunT > gameTime && !r.dead) { r.obj.position.copy(r.stunAt); r.vel.set(0, 0, 0); r.cd = Math.max(r.cd, 0.5); if (Math.random() < dt * 6) burst(r.obj.position, '#4fd2ff', 2, 6); }
  if ((SAMMO.hudT = (SAMMO.hudT || 0) - dt) <= 0) { SAMMO.hudT = 0.25; sammoHud(); }
}; }
