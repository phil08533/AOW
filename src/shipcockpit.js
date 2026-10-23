// =================== SHIP COCKPIT: fly your ship from the pilot's seat ===================
// C in space (or the 🎥 button) swaps the chase camera for a full cockpit: canopy struts, a radar, hull and weapons
// screens, a stick and throttle that move with you, switch panels, and your bobblehead on the dash.
const SCOCK = { g: null, on: false };
function scockTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, x: c.getContext('2d'), t: new THREE.CanvasTexture(c) }; }
function scockBuild() {
  const g = new THREE.Group(), M = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).convertSRGBToLinear(), fog: false }), L = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h), fog: false });
  const hull = M('#2a2f3a'), dark = M('#14171d'), panel = M('#1d2129'), metal = M('#5a6070'), trim = M('#3a404c');
  // canopy: a heavy frame with a center spine and angled struts
  SCOCK.struts = [part(g, B(1.7, 0.03, 0.06), hull, 0, 0.44, -0.62)];
  for (const s of [-1, 1]) { const a = part(g, B(0.036, 0.9, 0.045), hull, s * 0.8, 0.05, -0.62); SCOCK.struts.push(a); a.rotation.z = s * 0.5; a.rotation.x = -0.2; const b = part(g, B(0.022, 0.6, 0.03), trim, s * 0.42, 0.42, -0.9); SCOCK.struts.push(b); b.rotation.z = s * 1.05; b.rotation.x = -0.5;
    }
  // the dash: a wide console, three screens and switch rows
  const top = part(g, B(1.6, 0.04, 0.14), dark, 0, -0.205, -0.7); top.rotation.x = 0.15;
  part(g, B(1.6, 0.3, 0.05), panel, 0, -0.36, -0.645);
  part(g, B(1.6, 0.008, 0.008), L('#4fd2ff'), 0, -0.222, -0.618);
  const scr = [];
  for (const [sx, w, ry] of [[-0.42, 0.26, 0.28], [0, 0.22, 0], [0.42, 0.26, -0.28]]) { const T = scockTex(320, 220); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.69), new THREE.MeshBasicMaterial({ map: T.t, fog: false, toneMapped: false })); m.position.set(sx, -0.315, -0.61 + Math.abs(sx) * 0.12); m.rotation.y = ry; m.rotation.x = -0.12; g.add(m); const fr = part(g, B(w + 0.02, w * 0.69 + 0.02, 0.01), M('#0a0b0e'), sx, -0.315, -0.616 + Math.abs(sx) * 0.12); fr.rotation.y = ry; fr.rotation.x = -0.12; scr.push(T); }
  SCOCK.btn = []; for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { const b = part(g, B(0.03, 0.012, 0.03), L(['#ff6a3a', '#6fdc5a', '#4fd2ff', '#ffd36a'][(r + k) % 4]), s * (0.78 - k * 0.045), -0.06 - r * 0.05 - 0.02, -0.38 - r * 0.02); b.rotation.x = 0.4; SCOCK.btn.push(b); }
  // stick and throttle
  const stick = new THREE.Group(); stick.position.set(0, -0.5, -0.42); g.add(stick); part(stick, new THREE.CylinderGeometry(0.012, 0.016, 0.16, 10), metal, 0, 0.08, 0); part(stick, B(0.04, 0.06, 0.04), M('#22262e'), 0, 0.18, 0); part(stick, B(0.012, 0.008, 0.012), L('#ff3a2a'), 0, 0.215, 0.012);
  const thr = new THREE.Group(); thr.position.set(-0.36, -0.46, -0.44); g.add(thr); part(thr, B(0.012, 0.12, 0.012), metal, 0, 0.06, 0); part(thr, B(0.05, 0.03, 0.04), M('#22262e'), 0, 0.12, 0); part(g, B(0.08, 0.02, 0.14), dark, -0.36, -0.46, -0.44);
  // a holographic aiming ring floating out in front
  const holo = part(g, new THREE.RingGeometry(0.035, 0.04, 32), new THREE.MeshBasicMaterial({ color: '#6fdc5a', transparent: true, opacity: 0.55, fog: false, depthWrite: false }), 0, 0.0, -1.2);
  // the bobblehead spot
  const bob = new THREE.Group(); bob.position.set(0.36, -0.185, -0.7); g.add(bob);
  g.traverse(o => { o.renderOrder = 5; }); g.scale.setScalar(2.2); g.visible = false; camera.add(g);
  SCOCK.g = g; SCOCK.scr = scr; SCOCK.stick = stick; SCOCK.thr = thr; SCOCK.holo = holo; SCOCK.bob = bob;
}
function scockDraw() {
  const F = fly; if (!F) return; const [A, R, W] = SCOCK.scr;
  // left: hull, speed, cruise
  { const x = A.x, w = A.c.width, h = A.c.height; x.fillStyle = '#05080e'; x.fillRect(0, 0, w, h); const hp = Math.max(0, player.hp / hullMax());
    x.fillStyle = '#7f9ab8'; x.font = '600 16px system-ui,sans-serif'; x.fillText('HULL', 16, 30); x.fillStyle = '#162232'; x.fillRect(16, 40, 288, 22); x.fillStyle = hp > 0.5 ? '#6fdc5a' : hp > 0.25 ? '#ffd36a' : '#ff3a2a'; x.fillRect(16, 40, 288 * hp, 22);
    x.fillStyle = '#fff'; x.font = '700 44px system-ui,sans-serif'; x.fillText(Math.round(F.vel.length()) + '', 16, 128); x.fillStyle = '#7f9ab8'; x.font = '600 15px system-ui,sans-serif'; x.fillText('m/s' + ((F.cruise || 1) > 1.2 ? `  ·  CRUISE ×${F.cruise.toFixed(1)}` : ''), 16, 150);
    x.fillText(`${S.orbit ? 'NEAR ' + String((LEVELS[S.orbit] && LEVELS[S.orbit].name) || S.orbit).toUpperCase() : 'DEEP SPACE'}`, 16, 190); A.t.needsUpdate = true; }
  // center: radar (raiders red, other pilots cyan)
  { const x = R.x, w = R.c.width, h = R.c.height, cx = w / 2, cy = h / 2 + 6, rad = 96; x.fillStyle = '#04070c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#163024'; x.lineWidth = 1.5; for (const r of [rad, rad * 0.66, rad * 0.33]) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke(); }
    x.beginPath(); x.moveTo(cx - rad, cy); x.lineTo(cx + rad, cy); x.moveTo(cx, cy - rad); x.lineTo(cx, cy + rad); x.stroke();
    const sw = (performance.now() / 1000 * 2) % (Math.PI * 2); x.strokeStyle = 'rgba(111,220,90,.5)'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(sw) * rad, cy + Math.sin(sw) * rad); x.stroke();
    const inv = _q.clone().invert(), dot = (p, col, s) => { const v = p.clone().sub(player.pos).applyQuaternion(inv), d = Math.hypot(v.x, v.z); if (d > 800) return; const k = rad / 800; x.fillStyle = col; x.fillRect(cx + v.x * k - s / 2, cy + v.z * k - s / 2, s, s); };
    for (const r of F.raiders) if (!r.dead) dot(r.obj.position, r.stunT > gameTime ? '#4fd2ff' : '#ff3a2a', 5);
    for (const r of remotes.values()) dot(r.obj.position, '#7fe8ff', 6);
    x.fillStyle = '#6fdc5a'; x.beginPath(); x.moveTo(cx, cy - 6); x.lineTo(cx - 5, cy + 5); x.lineTo(cx + 5, cy + 5); x.fill();
    x.fillStyle = '#6fdc5a'; x.font = '600 13px system-ui,sans-serif'; x.fillText('RADAR 800 m', 10, 20); R.t.needsUpdate = true; }
  // right: weapons and radio
  { const x = W.x, w = W.c.width, h = W.c.height; x.fillStyle = '#05080e'; x.fillRect(0, 0, w, h); const a = typeof sammoCur === 'function' ? sammoCur() : { name: 'Lasers', col: '#6fdc5a', id: 'laser' };
    x.fillStyle = '#7f9ab8'; x.font = '600 16px system-ui,sans-serif'; x.fillText('WEAPONS', 16, 30); x.fillStyle = a.col; x.font = '800 36px system-ui,sans-serif'; x.fillText(a.name.toUpperCase(), 16, 74);
    x.font = '600 15px system-ui,sans-serif'; x.fillStyle = '#9fb4cc'; if (typeof SAMMO !== 'undefined') x.fillText(`Missiles ${SAMMO.rack}/6 · EMP ${SAMMO.empT > gameTime ? Math.ceil(SAMMO.empT - gameTime) + 's' : 'ready'}`, 16, 102);
    const st = typeof radioNow === 'function' ? radioNow() : null; x.fillStyle = '#4fd2ff'; x.font = '700 17px system-ui,sans-serif'; x.fillText(st ? '📻 ' + st.name : '📻 Radio off (R)', 16, 160); x.fillStyle = '#9fb4cc'; x.font = '500 14px system-ui,sans-serif'; x.fillText(st ? '♪ ' + st.track : '', 16, 184); W.t.needsUpdate = true; }
}
function scockToggle() { if (!LEVEL || !LEVEL.fly) return; S.shipCam = S.shipCam ? 0 : 1; markDirty(); SFX.ui(); toast('CAMERA', S.shipCam ? 'Cockpit' : 'Chase', 0.8); }
window.addEventListener('keydown', e => { if (e.code !== 'KeyC' || e.repeat || !LEVEL || !LEVEL.fly || state !== 'play' || dlgOpen || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; e.stopImmediatePropagation(); e.preventDefault(); scockToggle(); }, true);
{ const _st = step; step = function (dt) { _st(dt);
  const on = !!(LEVEL && LEVEL.fly && fly && fly.ship && S.shipCam && player.alive !== false);
  if (!SCOCK.g && on) scockBuild(); if (SCOCK.g) SCOCK.g.visible = on;
  if (SCOCK.vb) SCOCK.vb.hidden = !(LEVEL && LEVEL.fly && state === 'play' && !dlgOpen);
  if (!on) { if (SCOCK.was && fly && fly.ship) fly.ship.visible = true; SCOCK.was = false; return; } SCOCK.was = true;
  const F = fly; F.ship.visible = false;
  _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipUp.set(0, 1, 0).applyQuaternion(_q);
  camera.position.copy(player.pos).addScaledVector(shipUp, 0.9).addScaledVector(shipFwd, 1.5); if (F.shake > 0) camera.position.add(V(rand(-0.08, 0.08), rand(-0.08, 0.08), rand(-0.08, 0.08)));
  camera.quaternion.copy(_q); camera.rotateZ(clamp(F.roll, -0.8, 0.8) * 0.35);
  const st = clamp((keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x, -1, 1), th = clamp((keys.KeyW ? 1 : 0) - (keys.KeyS ? 0.6 : 0) + move.y, -0.6, 1);
  SCOCK.stick.rotation.z += (-st * 0.35 - SCOCK.stick.rotation.z) * Math.min(1, dt * 10); SCOCK.stick.rotation.x += (-(F.lastPitchV || 0) * 0.1 - SCOCK.stick.rotation.x) * Math.min(1, dt * 10);
  SCOCK.thr.rotation.x += (-th * 0.5 - SCOCK.thr.rotation.x) * Math.min(1, dt * 8);
  SCOCK.holo.material.color.set(typeof sammoCur === 'function' ? sammoCur().col : '#6fdc5a');
  if ((SCOCK.blinkT = (SCOCK.blinkT || 0) - dt) <= 0) { SCOCK.blinkT = 0.4; for (const b of SCOCK.btn) b.visible = Math.random() > 0.12; }
  if ((SCOCK.drawT = (SCOCK.drawT || 0) - dt) <= 0) { SCOCK.drawT = 0.1; scockDraw(); }
  if (typeof bobbleMount === 'function') { const m = bobbleMount(SCOCK.bob, 0.75); const sp = F.vel.length(); SCOCK.lsp = SCOCK.lsp == null ? sp : SCOCK.lsp; const acc = (sp - SCOCK.lsp) / Math.max(dt, 1e-3); SCOCK.lsp = sp; bobbleStep(m, dt, st, clamp(acc / 30, -1.5, 1.5)); if (F.shake > 0.1) bobbleKick(m, 4); }
}; }
// a camera button for touch and mouse
setInterval(() => { if (SCOCK.vb) return; const b = SCOCK.vb = document.createElement('button'); b.textContent = '🎥'; b.title = 'Cockpit / chase (C)'; b.hidden = true;
  b.style.cssText = 'position:fixed;right:calc(env(safe-area-inset-right,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 236px);z-index:22;width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(10,14,30,.7);font-size:20px;cursor:pointer';
  b.addEventListener('click', e => { e.stopPropagation(); scockToggle(); }); b.addEventListener('touchstart', e => { e.stopPropagation(); e.preventDefault(); scockToggle(); }, { passive: false }); document.body.appendChild(b); }, 1000);
