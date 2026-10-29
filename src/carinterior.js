// =================== VELOCITY CAR INTERIOR: a real cabin for the cockpit camera ===================
// Replaces the old flat dash with a full cabin: padded dash, a gauge cluster with a live speedometer, a three-spoke wheel
// with paddles, a center screen (speed, now playing, mini radar), vents, door panels, a rear-view mirror, mood lighting that
// follows the storm's rainbow, and a spot on the dash for your bobblehead.
const CABIN = { built: false };
function cabinTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); return { c, x: c.getContext('2d'), t }; }
// ---- 2.23.71: real surfaces. Quilted leather, suede, carbon weave and brushed aluminium, with the shading painted in
// (the cabin is unlit so it reads the same in a storm, at night and in a tunnel) ----
const CABIN_TEX = {};
function cabinSurf(k) { if (CABIN_TEX[k]) return CABIN_TEX[k]; const { c, x, t } = cabinTex(128, 128);
  if (k === 'carbon') { x.fillStyle = '#0c0d10'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const g = x.createLinearGradient(i * 8, j * 8, i * 8 + 8, j * 8 + 8), a = (i + j) % 2; g.addColorStop(0, a ? '#2a2d34' : '#16181d'); g.addColorStop(1, a ? '#121418' : '#24272e'); x.fillStyle = g; x.fillRect(i * 8 + 0.5, j * 8 + 0.5, 7, 7); } }
  if (k === 'quilt') { x.fillStyle = '#1a1c22'; x.fillRect(0, 0, 128, 128); for (let i = -1; i < 4; i++) for (let j = -1; j < 4; j++) { const cx = i * 32 + (j % 2 ? 16 : 0) + 16, cy = j * 32 + 16, g = x.createRadialGradient(cx - 4, cy - 6, 2, cx, cy, 20); g.addColorStop(0, '#3a3e48'); g.addColorStop(1, '#16181e'); x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy - 16); x.lineTo(cx + 16, cy); x.lineTo(cx, cy + 16); x.lineTo(cx - 16, cy); x.closePath(); x.fill(); }
    x.strokeStyle = '#c8582a'; x.lineWidth = 1; x.setLineDash([3, 2]); for (let i = -128; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke(); } }
  if (k === 'suede') { x.fillStyle = '#22252c'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 1800; i++) { const v = 26 + Math.random() * 22; x.fillStyle = `rgb(${v},${v + 2},${v + 8})`; x.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5); } }
  if (k === 'brushed') { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#9aa2b0'); g.addColorStop(0.5, '#5a6070'); g.addColorStop(1, '#8a92a0'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`; x.fillRect(0, Math.random() * 128, 128, 0.7); } }
  if (k === 'grille') { x.fillStyle = '#0a0b0e'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#2a2e38'; for (let j = 0; j < 14; j++) for (let i = 0; i < 14; i++) { const cx = i * 9.5 + (j % 2 ? 4.7 : 0), cy = j * 9.5; x.beginPath(); for (let a = 0; a < 6; a++) x.lineTo(cx + Math.cos(a * Math.PI / 3) * 3.6, cy + Math.sin(a * Math.PI / 3) * 3.6); x.fill(); } }
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return (CABIN_TEX[k] = t); }
function cabinMat(k, rep) { const t = cabinSurf(k).clone(); t.needsUpdate = true; t.repeat.set(rep, rep); return new THREE.MeshBasicMaterial({ map: t, fog: false }); }
// the extra hardware: a holo HUD over the dash, LED shift lights on the wheel, a centre console with a rotary knob and
// guarded toggles, an overhead switch panel, speaker grilles, lit A-pillars and quilted seat bolsters at the edges of view
function cabinPlus(C, m) { const { leather, soft, carbon, metal, black, M, L } = m;
  // dash trim: a brushed inlay and a light pipe along the face
  part(C, B(1.86, 0.012, 0.012), metal, 0, -0.18, -0.616); CABIN.amb.push(part(C, B(1.6, 0.006, 0.006), L('#4fd2ff'), 0, -0.392, -0.612));
  // holo HUD: a projector slot in the dash throws speed and a heading chevron onto a pane above it
  part(C, B(0.3, 0.012, 0.05), black, 0, -0.128, -0.7); CABIN.amb.push(part(C, B(0.26, 0.004, 0.02), L('#4fd2ff'), 0, -0.121, -0.7));
  const hud = cabinTex(256, 96); CABIN.hud = hud; const hm = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.13), new THREE.MeshBasicMaterial({ map: hud.t, fog: false, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  hm.position.set(0, -0.02, -0.9); hm.rotation.x = 0.12; C.add(hm);
  // LED shift lights across the top of the wheel: green to amber to red with speed
  CABIN.leds = []; for (let k = 0; k < 7; k++) { const a = Math.PI / 2 + (k - 3) * 0.13, b = part(CABIN.wheel, B(0.012, 0.008, 0.01), L('#1a1c22'), Math.cos(a) * 0.12, Math.sin(a) * 0.12 - 0.03, 0.016); b.rotation.z = a - Math.PI / 2; CABIN.leds.push(b); }
  part(CABIN.wheel, B(0.16, 0.025, 0.012), carbon, 0, 0.09, 0.008);
  // centre console: an angled brushed bezel, a rotary drive knob with a lit ring, guarded toggles and a start button
  const cc = new THREE.Group(); cc.position.set(0.3, -0.5, -0.42); cc.rotation.x = -0.5; C.add(cc);
  part(cc, B(0.24, 0.02, 0.28), carbon, 0, 0, 0); part(cc, B(0.25, 0.012, 0.29), metal, 0, -0.012, 0);
  const knob = part(cc, new THREE.CylinderGeometry(0.035, 0.038, 0.03, 20), metal, -0.05, 0.022, 0.03); CABIN.knob = knob; CABIN.amb.push(part(cc, new THREE.TorusGeometry(0.041, 0.004, 6, 24), L('#4fd2ff'), -0.05, 0.012, 0.03, Math.PI / 2));
  for (let k = 0; k < 8; k++) part(knob, B(0.004, 0.032, 0.004), black, Math.cos(k * Math.PI / 4) * 0.036, 0, Math.sin(k * Math.PI / 4) * 0.036);
  for (let k = 0; k < 3; k++) { const x = 0.03 + k * 0.03; part(cc, B(0.022, 0.012, 0.03), black, x, 0.008, -0.08); part(cc, B(0.006, 0.026, 0.006), metal, x, 0.024, -0.08, 0.4); for (const s of [-1, 1]) part(cc, B(0.003, 0.02, 0.03), M('#c8402f'), x + s * 0.012, 0.018, -0.08); }
  part(cc, new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16), M('#2a0a0a'), 0.07, 0.01, 0.06); CABIN.start = part(cc, new THREE.TorusGeometry(0.022, 0.003, 6, 20), L('#ff4a3a'), 0.07, 0.017, 0.06, Math.PI / 2);
  // overhead panel: four toggles and a dome strip
  const oh = new THREE.Group(); oh.position.set(0, 0.42, -0.42); oh.rotation.x = 0.35; C.add(oh); part(oh, B(0.3, 0.03, 0.12), carbon, 0, 0, 0); part(oh, B(0.31, 0.006, 0.125), metal, 0, -0.016, 0);
  for (let k = 0; k < 4; k++) { part(oh, B(0.006, 0.02, 0.006), metal, -0.09 + k * 0.06, -0.026, 0.02, 0.3); part(oh, B(0.02, 0.004, 0.012), L(k === 3 ? '#ff6a3a' : '#6fdc5a'), -0.09 + k * 0.06, -0.019, -0.03); }
  CABIN.amb.push(part(oh, B(0.24, 0.004, 0.02), L('#cfe6ff'), 0, -0.02, 0.045));
  // lit A-pillars and speaker grilles low on the doors
  for (const s of [-1, 1]) { const pl = part(C, B(0.012, 0.8, 0.012), L('#4fd2ff'), s * 0.78, 0.1, -0.58); pl.rotation.z = s * 0.42; pl.rotation.x = -0.25; CABIN.amb.push(pl);
    const gr = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), cabinMat('grille', 1)); gr.position.set(s * 0.83, -0.5, -0.45); gr.rotation.y = -s * 1.35; C.add(gr); const rr = part(C, new THREE.TorusGeometry(0.072, 0.006, 6, 24), metal, s * 0.832, -0.5, -0.45); rr.rotation.y = -s * 1.35;
    // seat bolsters just in the corners of view
    const bo = part(C, B(0.16, 0.34, 0.5), leather, s * 0.56, -0.66, -0.05); bo.rotation.z = s * 0.25; part(C, B(0.165, 0.012, 0.5), M('#c8582a'), s * 0.56 - s * 0.04, -0.5, -0.05).rotation.z = s * 0.25; }
}
function cabinHud(sp, K) { const H = CABIN.hud; if (!H) return; const { x, c, t } = H; x.clearRect(0, 0, c.width, c.height); const col = RC.drift ? '#c86aff' : RC.boost ? '#ffd36a' : '#7fe8ff';
  x.fillStyle = col; x.textAlign = 'center'; x.font = '800 44px system-ui,sans-serif'; x.fillText(velMph(sp), 128, 52); x.font = '600 13px system-ui,sans-serif'; x.fillText('MPH', 128, 70);
  x.strokeStyle = col; x.lineWidth = 3; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(128 + s * 50, 30); x.lineTo(128 + s * 62, 40); x.lineTo(128 + s * 50, 50); x.stroke(); }
  x.globalAlpha = 0.6; x.fillRect(60, 84, 136 * Math.min(1, sp / K.top), 4); x.globalAlpha = 1; t.needsUpdate = true; }
function cabinBuild(g) {
  const M = hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), fog: false });
  const L = hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), fog: false });
  for (const ch of g.children) ch.visible = false; // the old dash stays in the group but hidden
  const C = new THREE.Group(); g.add(C); CABIN.g = C;
  const leather = cabinMat('quilt', 3), soft = cabinMat('suede', 2), carbon = cabinMat('carbon', 4), metal = cabinMat('brushed', 1), stitch = M('#c8582a'), black = M('#0a0b0e');
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
  try { cabinPlus(C, { leather, soft, carbon, metal, black, M, L }); } catch (e) { console.warn('cabinPlus', e); }
  C.traverse(o => { o.renderOrder = 5; });
  CABIN.built = true;
}
function cabinDraw(sp, K) {
  const { x, c, t } = CABIN.cl, w = c.width, h = c.height, f = Math.min(1, sp / K.top), kmh = velMph(sp), boost = VEL.bm / K.bcap;
  x.fillStyle = '#05080e'; x.fillRect(0, 0, w, h);
  // speed arc
  x.lineWidth = 12; x.strokeStyle = '#162232'; x.beginPath(); x.arc(110, 108, 70, Math.PI * 0.8, Math.PI * 2.2); x.stroke();
  const g = x.createLinearGradient(40, 0, 180, 0); g.addColorStop(0, '#4fd2ff'); g.addColorStop(0.7, '#c86aff'); g.addColorStop(1, '#ff3b5a'); x.strokeStyle = g; x.beginPath(); x.arc(110, 108, 70, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * f)); x.stroke();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.8 + 0.14 * i); x.strokeStyle = '#3a4a60'; x.lineWidth = 2; x.beginPath(); x.moveTo(110 + Math.cos(a) * 52, 108 + Math.sin(a) * 52); x.lineTo(110 + Math.cos(a) * 58, 108 + Math.sin(a) * 58); x.stroke(); }
  const na = Math.PI * (0.8 + 1.4 * f); x.strokeStyle = '#ff6a3a'; x.lineWidth = 4; x.beginPath(); x.moveTo(110, 108); x.lineTo(110 + Math.cos(na) * 62, 108 + Math.sin(na) * 62); x.stroke();
  x.fillStyle = '#fff'; x.font = '700 30px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(kmh, 110, 120); x.font = '600 13px system-ui,sans-serif'; x.fillStyle = '#7f9ab8'; x.fillText('MPH', 110, 140);
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
  // now playing: the planet's soundtrack (the radio lives in your ship)
  const tid = MUS.list && PLAYLISTS[MUS.list] ? PLAYLISTS[MUS.list][MUS.idx] : null, ttl = tid ? ((typeof RADIO_TITLES !== 'undefined' && RADIO_TITLES[tid]) || tid) : '';
  y.fillStyle = '#4fd2ff'; y.font = '700 18px system-ui,sans-serif'; y.textAlign = 'left'; y.fillText('♪ Now playing', 12, 28);
  y.fillStyle = '#9fb4cc'; y.font = '500 13px system-ui,sans-serif'; y.fillText(ttl || (PREFS.music ? 'Velocity' : 'Music off'), 12, 48);
  y.strokeStyle = '#1c2a3c'; y.lineWidth = 1; const cx = 230, cy = 125, R = 62; for (const r of [R, R * 0.6, R * 0.3]) { y.beginPath(); y.arc(cx, cy, r, 0, Math.PI * 2); y.stroke(); }
  y.fillStyle = '#6fdc5a'; y.beginPath(); y.moveTo(cx, cy - 6); y.lineTo(cx - 4, cy + 4); y.lineTo(cx + 4, cy + 4); y.fill();
  const fy = player.yaw; for (const T of VEL.traffic || []) { const dx = T.x - player.pos.x, dz = T.z - player.pos.z, rx = dx * Math.cos(fy) - dz * Math.sin(fy), rz = dx * Math.sin(fy) + dz * Math.cos(fy), d = Math.hypot(rx, rz); if (d > 120) continue; y.fillStyle = '#ff9a3c'; y.fillRect(cx + rx / 120 * R - 2, cy + rz / 120 * R - 2, 4, 4); }
  y.fillStyle = '#9fb4cc'; y.font = '600 12px system-ui,sans-serif'; y.fillText('TRAFFIC', 196, 196); y.fillText(`${velMph(sp)} mph`, 12, 100);
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
  if ((CABIN.drawT = (CABIN.drawT || 0) - dt) <= 0) { CABIN.drawT = 0.1; cabinDraw(sp, K); cabinHud(sp, K); }
  if (CABIN.leds) { const f = Math.min(1, sp / K.top); CABIN.leds.forEach((b, k) => b.material.color.set(f * 7 > k + 0.5 ? (k < 3 ? '#4aff6a' : k < 5 ? '#ffd23a' : '#ff3a3a') : '#1a1c22')); }
  if (CABIN.knob) CABIN.knob.rotation.y += (RC.boost ? 0.6 : RC.drift ? -0.6 : 0) * dt; if (CABIN.start) CABIN.start.material.color.set(Math.sin(gameTime * 3) > 0 ? '#ff4a3a' : '#7a1a14');
}; }
