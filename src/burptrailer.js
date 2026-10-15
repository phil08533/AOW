// =================== THE B.U.R.P. TRAILER: a 60 second tour of the real game, narrated by the ship's AI ===================
// Codex → Cinema → B.U.R.P. Trailer. It visits the real levels, so it is also the thing to screen-record for ads.
// Nothing sticks: the save is snapshotted before and put back after, and you land where you started.
const BTR = { on: false };
const btrV = (x, y, z) => new THREE.Vector3(x, y, z);
function btrOrbit(A, r, h, ang, lookH) { camera.position.set(A.x + Math.sin(ang) * r, A.y + h, A.z + Math.cos(ang) * r); camera.lookAt(A.x, A.y + (lookH == null ? 1.2 : lookH), A.z); }
function btrFace() { const e = btrNearest(e => true, player.pos); if (!e) return; const t = e.obj.position, d = player.pos.distanceTo(t); if (d > 16) { const k = (d - 14) / d; player.pos.x += (t.x - player.pos.x) * k; player.pos.z += (t.z - player.pos.z) * k; player.pos.y = floorAt(player.pos.x, player.pos.z); } BTR.faceYaw = Math.atan2(-(t.x - player.pos.x), -(t.z - player.pos.z)); }
function btrNearest(pred, from) { let best = null, bd = 1e9; for (const e of enemies) { if (e.dead || !pred(e)) continue; const d = e.obj.position.distanceTo(from); if (d < bd) { bd = d; best = e; } } return best; }
// each shot: the level it needs, how long it runs, and either a camera move or a first-person beat
const BTR_SHOTS = [
  { lvl: 'ship', dur: 5, boot: true, cam: (k, t, A) => btrOrbit(A, 4.6 - k * 1.6, 1.5 + k * 0.3, 2.4 + k * 0.5, 1.3) },
  { lvl: 'earth', dur: 5.2, setup: () => { const e = btrNearest(e => /dog/i.test(e.sp && e.sp.type || ''), player.pos); return e ? e.obj.position : null; },
    cam: (k, t, A) => btrOrbit(A, 7 - k * 2.5, 0.7, 0.6 - k * 0.5, 0.6) },
  { lvl: 'earth', dur: 6, fp: ['b5', 'sg8', 'l28', 'lsaber', 'master'], setup: () => { SAFES.length = 0; btrFace(); return null; }, yaw: 0.05 },
  { lvl: 'earth', dur: 5, fp: ['m_ember', 'm_storm', 'm_void', 'w_20'], setup: () => { SAFES.length = 0; btrFace(); return null; }, yaw: -0.2 },
  { lvl: 'ship', dur: 6, setup: () => V(0, 0, -8.5), cam: (k, t, A) => btrOrbit(A, 4.6, 2.6 - k * 0.9, 0.3 + k * 1.4, 1.2) },
  { lvl: 'space', dur: 6, cam: (k, t, A) => btrOrbit(A, 16 - k * 5, 4 + k * 2, 3.6 - k * 1.1, 0) },
  { lvl: 'speedway', dur: 6, setup: () => { if (VEL.parked) { const c = VEL.parked.position; player.pos.set(c.x + 1, c.y, c.z); } toggleFreeDrive(); player.pos.set(30, 0.3, 150); player.pos.y = floorAt(30, 150); player.yaw = 0.3; VEL.cam = 1; VEL.cp = null; return null; },
    tick: (k, t) => { keys.KeyW = true; keys.ShiftLeft = t > 1.2; keys.KeyD = Math.sin(t * 1.3) > 0.55; keys.KeyA = Math.sin(t * 1.3) < -0.55; if (t > 3.6) VEL.cam = 0; } },
  { lvl: 'earth', dur: 5, fp: [], noGun: true, pitch: -0.12, yaw: 0, setup: () => { player.pos.set(-52, 0, 8.5); player.pos.y = floorAt(-52, 8.5); BTR.fish0 = S.fishBest ? Object.assign({}, S.fishBest) : null; setTimeout(() => { if (BTR.on) try { fshCatchShow({ fish: 'voidgulper', table: 'void' }); } catch (_) {} }, 900); return null; }, tick: () => { if (typeof FSH !== 'undefined' && FSH.catch) FSH.catch.holder.position.y += 0.22; } },
  { lvl: 'vector', dur: 7, setup: () => { let e = btrNearest(e => e.sp && e.sp.type === 'watcher', player.pos); if (!e && Z.maw) { try { makeEnemy({ zone: 'maw', type: 'watcher', n: 1, lv: [50, 50], at: [0, 2] }); } catch (_) {} e = btrNearest(e => e.sp && e.sp.type === 'watcher', player.pos); } BTR.boss = e; return e ? e.obj.position : null; },
    tick: () => { const e = BTR.boss; if (e && e.obj) { e.obj.visible = true; const f = floorAt(e.obj.position.x, e.obj.position.z) + 6; if (e.obj.position.y < f) e.obj.position.y += (f - e.obj.position.y) * 0.08; } },
    cam: (k, t, A) => btrOrbit(A, 26 - k * 12, 3 + k * 2, Math.PI - 0.35 + k * 0.3, 1) },
  { lvl: 'capitone', dur: 4.5, cam: (k, t, A) => btrOrbit(A, 26 - k * 6, 12 - k * 5, 1.8 + k * 0.7, 1.5) },
  { title: true, dur: 5.5 },
];
function btrStart() {
  if (BTR.on || state !== 'play') return;
  const lines = (typeof BURP_MORE !== 'undefined' && BURP_MORE.trailer) || [];
  BTR.on = true; BTR.i = -1; BTR.snap = JSON.stringify(S); BTR.home = { lvl: LEVEL.id, at: { x: player.pos.x, z: player.pos.z, yaw: player.yaw }, hp: player.hp, gun: S.gun, ammo: player.ammo }; BTR.lines = lines;
  const ov = document.createElement('div'); ov.id = 'btrOv'; ov.style.cssText = 'position:fixed;inset:0;z-index:45;pointer-events:none;font-family:system-ui,sans-serif';
  ov.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:10vh;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:10vh;background:#000"></div>'
    + '<div class="bk" style="position:absolute;inset:0;background:#000;opacity:1;transition:opacity .35s"></div>'
    + '<div class="cc" style="position:absolute;left:7%;right:7%;bottom:12vh;text-align:center;color:#fff;font-weight:600;font-size:clamp(15px,3.4vw,24px);text-shadow:0 2px 6px #000,0 0 2px #000;opacity:0;transition:opacity .3s"><span style="color:#6fdc5a;letter-spacing:2px;font-size:.7em;display:block;margin-bottom:4px">B.U.R.P.</span><span class="tx"></span></div>'
    + '<div class="tt" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .8s;color:#ffd75e;text-align:center"><div style="font-size:clamp(13px,2.4vw,18px);letter-spacing:6px;color:#9fe8ff">ART OF WAR</div><div style="font-size:clamp(34px,8vw,76px);font-weight:900;letter-spacing:3px;text-shadow:0 0 24px #ff6a3a">SETTING SUN</div><div style="margin-top:14px;font-size:clamp(14px,2.6vw,20px);color:#fff;letter-spacing:2px">Free · Play in your browser</div></div>';
  const skip = document.createElement('button'); skip.className = 'pbtn'; skip.textContent = 'Skip ▸'; skip.style.cssText = 'position:fixed;right:16px;bottom:calc(10vh + 14px);z-index:46;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.5);color:#fff';
  skip.addEventListener('click', () => btrEnd()); document.body.append(ov, skip); BTR.ov = ov; BTR.skip = skip;
  if (document.pointerLockElement) document.exitPointerLock();
  btrNext();
}
function btrNext() {
  if (!BTR.on) return; BTR.i++; const sh = BTR_SHOTS[BTR.i]; if (!sh) return btrEnd();
  const ov = BTR.ov, bk = ov.querySelector('.bk'), cc = ov.querySelector('.cc'); cc.style.opacity = 0; BTR.sh = null;
  const go = () => {
    if (!BTR.on) return; let A = null;
    try { if (sh.lvl && LEVEL.id !== sh.lvl) loadLevel(sh.lvl); } catch (e) { console.warn('trailer load', e); }
    BTR.prev = sh.lvl || BTR.prev;
    try { A = sh.setup ? sh.setup() : null; } catch (e) { console.warn('trailer setup', e); }
    BTR.A = A || player.pos.clone(); BTR.t = 0; BTR.sh = sh; BTR.gi = 0;
    if (sh.fp) { player.yaw = (BTR.faceYaw || 0) + (sh.yaw || 0); BTR.faceYaw = 0; player.pitch = sh.pitch || 0.02; }
    $('hud').hidden = true; $('touch').hidden = true;
    const line = BTR.lines[BTR.i]; if (line) setTimeout(() => { if (!BTR.on) return; ov.querySelector('.tx').textContent = line; cc.style.opacity = 1; try { burpSay(line); } catch (_) {} }, sh.title ? 400 : 250);
    if (sh.title) { ov.querySelector('.tt').style.opacity = 1; } else setTimeout(() => { bk.style.opacity = 0; }, 80);
  };
  // dip to black while a level loads, so the cut is clean
  if (sh.title) { bk.style.opacity = 1; setTimeout(go, 400); } else if (BTR.i === 0 || sh.lvl !== BTR.prev || sh.setup) { bk.style.opacity = 1; setTimeout(go, 380); } else go();
}
function btrEnd() {
  if (!BTR.on) return; BTR.on = false; BTR.sh = null;
  try { if (typeof fshCatchHide === 'function') fshCatchHide(); } catch (_) {}
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (_) {}
  for (const k of ['KeyW', 'KeyA', 'KeyD', 'ShiftLeft']) keys[k] = false;
  // put the save back exactly as it was, then go home
  try { const snap = JSON.parse(BTR.snap); for (const k of Object.keys(S)) delete S[k]; Object.assign(S, snap); } catch (e) { console.warn('trailer restore', e); }
  const H = BTR.home; try { loadLevel(H.lvl, { at: H.at }); } catch (e) { loadLevel('earth'); }
  player.hp = H.hp; player.ammo = H.ammo; S.gun = H.gun; player.cool = 0; player.reloading = 0;
  if (BTR.hid) { for (const b of BTR.hid) b.style.visibility = ''; BTR.hid = null; }
  if (BTR.ov) BTR.ov.remove(); if (BTR.skip) BTR.skip.remove(); BTR.ov = BTR.skip = null;
  setState('play'); vm.visible = true; markDirty();
}
// no pausing on set: Esc skips instead
{ const _ss = setState; setState = function (st) { if (BTR.on && st === 'pause') return; return _ss.apply(this, arguments); }; }
addEventListener('keydown', e => { if (BTR.on && e.code === 'Escape') btrEnd(); });
// nothing hurts you on set, and the random lines hush while B.U.R.P. is narrating
{ const _h = hurt; hurt = function () { if (BTR.on) return; return _h.apply(this, arguments); }; }
{ const _b = burp; burp = function () { if (BTR.on) return; return _b.apply(this, arguments); }; }
{ const _st = step; step = function (dt) {
  _st(dt);
  if (!BTR.on || !BTR.sh) return; const sh = BTR.sh; BTR.t += dt; const k = Math.min(1, BTR.t / sh.dur);
  player.hp = maxHp(); $('hud').hidden = true; for (const id of ['velSpd', 'zone']) { const el = $(id); if (el) { const box = id === 'velSpd' ? el.parentElement : el; if (box && box.style.visibility !== 'hidden') { box.style.visibility = 'hidden'; (BTR.hid = BTR.hid || new Set()).add(box); } } } const tst = $('toast'); if (tst) tst.style.opacity = 0;
  if (sh.tick) sh.tick(k, BTR.t);
  if (sh.fp) { vm.visible = !sh.noGun; player.ammo = 99; player.reloading = 0; if (player.mana != null) player.mana = 999;
    if (sh.fp.length) { const gi = Math.min(sh.fp.length - 1, Math.floor(BTR.t / (sh.dur / sh.fp.length))); if (GUNS[sh.fp[gi]] && S.gun !== sh.fp[gi]) { S.gun = sh.fp[gi]; player.cool = 0; } player.yaw += Math.sin(BTR.t * 0.9) * dt * 0.25; try { fire(); } catch (_) {} } }
  else vm.visible = false;
  if (sh.cam) sh.cam(k, BTR.t, BTR.A);
  if (BTR.t > sh.dur) { BTR.sh = null; btrNext(); }
}; }
// the catch card normally closes with its dialog; on set there is no dialog, so hold it for the shot
{ const _fc = fshCatchStep; fshCatchStep = function (dt) { if (!BTR.on) return _fc(dt); const d = dlgOpen; dlgOpen = true; try { return _fc(dt); } finally { dlgOpen = d; } }; }
if (typeof SCENES !== 'undefined') SCENES.push(['burptrailer', '🤖 B.U.R.P. Trailer', () => true, () => setTimeout(btrStart, 200)]);
