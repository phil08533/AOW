// =================== VELOCITY CAR INTERIOR: a real cabin for the cockpit camera ===================
// Replaces the old flat dash with a full cabin: padded dash, a gauge cluster with a live speedometer, a three-spoke wheel
// with paddles, a center screen (speed, radio, mini radar), vents, door panels, a rear-view mirror, mood lighting that
// follows the storm's rainbow, and a spot on the dash for your bobblehead.
const CABIN = { built: false };
function cabinTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); return { c, x: c.getContext('2d'), t }; }
function cabinBuild(g) {
  const M = hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), fog: false });
  const L = hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), fog: false });
  for (const ch of g.children) ch.visible = false; // the old dash stays in the group but hidden
  const C = new THREE.Group(); g.add(C); CABIN.g = C;
  const leather = M('#1c1f26'), soft = M('#23272f'), carbon = M('#121318'), metal = M('#4a505c'), stitch = M('#8a3a22'), black = M('#0a0b0e');
  // dash: top pad, face, the stitched seam, and a lip
  const top = part(C, B(1.9, 0.05, 0.4), leather, 0, -0.155, -0.82); top.rotation.x = 0.08;
  part(C, B(1.9, 0.24, 0.05), carbon, 0, -0.29, -0.64);
  part(C, B(1.9, 0.006, 0.006), stitch, 0, -0.132, -0.63);
  for (const sx of [-1, 1]) part(C, B(0.68, 0.03, 0.06), soft, sx * 0.61, -0.165, -0.62);
  // the gauge binnacle and its screen
  const hood = part(C, B(0.5, 0.03, 0.1), leather, 0, -0.106, -0.62); hood.rotation.x = -0.15; part(C, B(0.44, 0.15, 0.01), black, 0, -0.178, -0.604);
  const cl = cabinTex(512, 160); CABIN.cl = cl;
  const clm = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.125), new THREE.MeshBasicMaterial({ map: cl.t, fog: false, toneMapped: false })); clm.position.set(0, -0.178, -0.598); C.add(clm);
  // center screen, angled toward you
  const cs = cabinTex(320, 200); CABIN.cs = cs;
  const csm = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.12), new THREE.MeshBasicMaterial({ map: cs.t, fog: false, toneMapped: false })); csm.position.set(0.47, -0.245, -0.575); csm.rotation.y = -0.38; C.add(csm);
  part(C, B(0.21, 0.14, 0.01), black, 0.47, -0.245, -0.581).rotation.y = -0.38;
  // vents with slats
  for (const [vx, vw] of [[-0.66, 0.16], [0.2, 0.12], [0.74, 0.14]]) { part(C, B(vw, 0.07, 0.02), black, vx, -0.2, -0.614); for (let k = 0; k < 4; k++) part(C, B(vw * 0.9, 0.006, 0.025), metal, vx, -0.225 + k * 0.016, -0.61); }
  // console stack, hover lever and buttons
  part(C, B(0.22, 0.2, 0.3), carbon, 0.3, -0.42, -0.5);
  const lever = new THREE.Group(); lever.position.set(0.28, -0.36, -0.53); C.add(lever); part(lever, B(0.015, 0.08, 0.015), metal, 0, 0.04, 0); part(lever, new THREE.SphereGeometry(0.014, 10, 8), M('#2a2e38'), 0, 0.085, 0); CABIN.lever = lever;
  CABIN.btns = []; for (let k = 0; k < 6; k++) { const b = part(C, B(0.018, 0.008, 0.006), L(k % 3 === 0 ? '#ff6a3a' : '#4fd2ff'), 0.4 + (k % 3) * 0.04, -0.33 - Math.floor(k / 3) * 0.022, -0.604); b.rotation.y = -0.38; CABIN.btns.push(b); }
  // the wheel: thick rim with grips, three spokes, hub, buttons and paddle shifters
  const wh = new THREE.Group(); wh.position.set(0, -0.405, -0.5); wh.rotation.x = -0.32; C.add(wh); CABIN.wheel = wh;
  part(wh, new THREE.TorusGeometry(0.165, 0.022, 10, 36), leather, 0, 0, 0);
  for (const s of [-1, 1]) { const gp = part(wh, new THREE.TorusGeometry(0.165, 0.026, 10, 8, 0.7), soft, 0, 0, 0); gp.rotation.z = s > 0 ? -0.35 : Math.PI - 0.35; }
  part(wh, B(0.03, 0.006, 0.03), stitch, 0, 0.163, 0.02); // the top marker
  part(wh, B(0.13, 0.028, 0.012), carbon, -0.085, 0, 0); part(wh, B(0.13, 0.028, 0.012), carbon, 0.085, 0, 0); part(wh, B(0.028, 0.12, 0.012), carbon, 0, -0.09, 0);
  part(wh, new THREE.CylinderGeometry(0.05, 0.055, 0.03, 16), carbon, 0, 0, 0.005).rotation.x = Math.PI / 2;
  part(wh, new THREE.CircleGeometry(0.026, 16), L('#ffd36a'), 0, 0, 0.022);
  for (const s of [-1, 1]) { part(wh, B(0.016, 0.012, 0.008), L(s > 0 ? '#6fdc5a' : '#ff4a3a'), s * 0.085, 0.012, 0.012); part(wh, B(0.016, 0.012, 0.008), L('#4fd2ff'), s * 0.085, -0.008, 0.012); part(wh, B(0.03, 0.08, 0.006), metal, s * 0.12, 0.01, -0.03); }
  part(C, new THREE.CylinderGeometry(0.03, 0.04, 0.2, 10), carbon, 0, -0.45, -0.58).rotation.x = Math.PI / 2 - 0.32;
  // pillars, roof header, sun visors and the rear-view mirror
  for (const s of [-1, 1]) { const pl = part(C, B(0.09, 0.85, 0.07), soft, s * 0.82, 0.12, -0.62); pl.rotation.z = s * 0.42; pl.rotation.x = -0.25; const v = part(C, B(0.5, 0.025, 0.2), soft, s * 0.42, 0.405, -0.48); v.rotation.x = -0.25; }
  part(C, B(2.2, 0.08, 0.3), leather, 0, 0.46, -0.48);
  part(C, B(0.012, 0.06, 0.012), metal, 0.1, 0.4, -0.55);
  part(C, B(0.19, 0.06, 0.025), black, 0.1, 0.37, -0.55);
  const mir = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.045), new THREE.MeshBasicMaterial({ color: '#2a3446', fog: false })); mir.position.set(0.1, 0.37, -0.536); C.add(mir); CABIN.mir = mir;
  // door panels with armrests and glowing handles
  CABIN.amb = [];
  for (const s of [-1, 1]) { const d = part(C, B(0.06, 0.5, 0.9), soft, s * 0.86, -0.35, -0.25); d.rotation.z = s * 0.1;
    part(C, B(0.12, 0.04, 0.4), leather, s * 0.8, -0.28, -0.25); CABIN.amb.push(part(C, B(0.012, 0.012, 0.6), L('#4fd2ff'), s * 0.82, -0.2, -0.3)); part(C, B(0.03, 0.02, 0.08), metal, s * 0.81, -0.24, -0.5); }
  // mood light along the bottom of the dash
  CABIN.amb.push(part(C, B(1.7, 0.008, 0.008), L('#4fd2ff'), 0, -0.41, -0.61));
  // the bobblehead spot (left side of the dash, in view)
  CABIN.bob = new THREE.Group(); CABIN.bob.position.set(-0.38, -0.13, -0.78); C.add(CABIN.bob);
  C.traverse(o => { o.renderOrder = 5; });
  CABIN.built = true;
}
function cabinDraw(sp, K) {
  const { x, c, t } = CABIN.cl, w = c.width, h = c.height, f = Math.min(1, sp / K.top), kmh = Math.round(sp * 3.6), boost = VEL.bm / K.bcap;
  x.fillStyle = '#05080e'; x.fillRect(0, 0, w, h);
  // speed arc
  x.lineWidth = 12; x.strokeStyle = '#162232'; x.beginPath(); x.arc(110, 108, 70, Math.PI * 0.8, Math.PI * 2.2); x.stroke();
  const g = x.createLinearGradient(40, 0, 180, 0); g.addColorStop(0, '#4fd2ff'); g.addColorStop(0.7, '#c86aff'); g.addColorStop(1, '#ff3b5a'); x.strokeStyle = g; x.beginPath(); x.arc(110, 108, 70, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * f)); x.stroke();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.8 + 0.14 * i); x.strokeStyle = '#3a4a60'; x.lineWidth = 2; x.beginPath(); x.moveTo(110 + Math.cos(a) * 52, 108 + Math.sin(a) * 52); x.lineTo(110 + Math.cos(a) * 58, 108 + Math.sin(a) * 58); x.stroke(); }
  const na = Math.PI * (0.8 + 1.4 * f); x.strokeStyle = '#ff6a3a'; x.lineWidth = 4; x.beginPath(); x.moveTo(110, 108); x.lineTo(110 + Math.cos(na) * 62, 108 + Math.sin(na) * 62); x.stroke();
  x.fillStyle = '#fff'; x.font = '700 30px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(kmh, 110, 120); x.font = '600 13px system-ui,sans-serif'; x.fillStyle = '#7f9ab8'; x.fillText('KM/H', 110, 140);
  // middle: drive state
  x.fillStyle = RC.drift ? '#c86aff' : RC.boost ? '#ffd36a' : '#4fd2ff'; x.font = '800 44px system-ui,sans-serif'; x.fillText(RC.drift ? 'DRIFT' : RC.boost ? 'BOOST' : 'HOVER', 290, 78);
  x.font = '600 14px system-ui,sans-serif'; x.fillStyle = '#7f9ab8'; x.fillText(`MAG FIELD ${VEL_HOVER.toFixed(2)} m · ${(typeof VEL.rbT === 'number' && VEL.rbT > 0) ? 'LIGHTNING' : 'STORM'}`, 290, 104);
  x.fillText(new Date().toTimeString().slice(0, 5), 290, 130);
  // right: boost and drift meters
  x.fillStyle = '#162232'; x.fillRect(420, 30, 26, 100); x.fillRect(458, 30, 26, 100);
  x.fillStyle = '#ffd36a'; x.fillRect(420, 30 + 100 * (1 - boost), 26, 100 * boost); x.fillStyle = '#c86aff'; const dm = Math.min(1, (VEL.dm || 0) / 2.5); x.fillRect(458, 30 + 100 * (1 - dm), 26, 100 * dm);
  x.fillStyle = '#7f9ab8'; x.font = '600 11px system-ui,sans-serif'; x.fillText('BST', 433, 146); x.fillText('DRF', 471, 146);
  t.needsUpdate = true;
  // center screen: radio and a little radar
  const S2 = CABIN.cs, y = S2.x, W2 = S2.c.width, H2 = S2.c.height; y.fillStyle = '#060a12'; y.fillRect(0, 0, W2, H2);
  const st = typeof radioNow === 'function' ? radioNow() : null;
  y.fillStyle = '#4fd2ff'; y.font = '700 18px system-ui,sans-serif'; y.textAlign = 'left'; y.fillText(st ? '📻 ' + st.name : '📻 Radio off', 12, 28);
  y.fillStyle = '#9fb4cc'; y.font = '500 13px system-ui,sans-serif'; y.fillText(st ? st.track : 'R to tune', 12, 48);
  y.strokeStyle = '#1c2a3c'; y.lineWidth = 1; const cx = 230, cy = 125, R = 62; for (const r of [R, R * 0.6, R * 0.3]) { y.beginPath(); y.arc(cx, cy, r, 0, Math.PI * 2); y.stroke(); }
  y.fillStyle = '#6fdc5a'; y.beginPath(); y.moveTo(cx, cy - 6); y.lineTo(cx - 4, cy + 4); y.lineTo(cx + 4, cy + 4); y.fill();
  const fy = player.yaw; for (const T of VEL.traffic || []) { const dx = T.x - player.pos.x, dz = T.z - player.pos.z, rx = dx * Math.cos(fy) - dz * Math.sin(fy), rz = dx * Math.sin(fy) + dz * Math.cos(fy), d = Math.hypot(rx, rz); if (d > 120) continue; y.fillStyle = '#ff9a3c'; y.fillRect(cx + rx / 120 * R - 2, cy + rz / 120 * R - 2, 4, 4); }
  y.fillStyle = '#9fb4cc'; y.font = '600 12px system-ui,sans-serif'; y.fillText('TRAFFIC', 196, 196); y.fillText(`${Math.round(sp * 3.6)} km/h`, 12, 100);
  y.fillStyle = '#5a6a80'; y.fillText(LEVEL && LEVEL.name || '', 12, 120); S2.t.needsUpdate = true;
}
{ const _st = step; step = function (dt) { _st(dt);
  const ck = VEL && VEL.cock; if (!ck || !ck.visible) return; if (!CABIN.built) cabinBuild(ck);
  const sp = Math.hypot(RC.vx || 0, RC.vz || 0), K = velStats(), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (move.x || 0);
  CABIN.wheel.rotation.z += (-st * 1.5 - CABIN.wheel.rotation.z) * Math.min(1, dt * 9);
  const thr = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0); CABIN.lever.rotation.x += (thr * 0.4 - CABIN.lever.rotation.x) * Math.min(1, dt * 8);
  const col = VEL.rbCol || new THREE.Color('#4fd2ff'); for (const a of CABIN.amb) a.material.color.copy(col).lerp(new THREE.Color('#2a9ac8'), 0.8).convertSRGBToLinear();
  CABIN.mir.material.color.setRGB(0.02 + col.r * 0.03, 0.025 + col.g * 0.03, 0.04 + col.b * 0.04);
  // the cabin leans and shakes a little with the car
  CABIN.g.rotation.z += (st * 0.012 * Math.min(1, sp / 20) - CABIN.g.rotation.z) * Math.min(1, dt * 6);
  CABIN.g.position.y = Math.sin(gameTime * 19) * Math.min(0.003, sp * 0.0001);
  if ((CABIN.drawT = (CABIN.drawT || 0) - dt) <= 0) { CABIN.drawT = 0.1; cabinDraw(sp, K); }
}; }
