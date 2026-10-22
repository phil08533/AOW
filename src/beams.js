// =================== LASER BOLTS AND THE BLACK GALAXY BEAM (2.21.9) ===================
// Every shot used to be a one-pixel line. Now it's a glowing bolt: a white-hot core inside a coloured halo, with a short
// bright slug that races down it, all fading in a blink. And one gun, the Black Galaxy Beam, fires a steady beam of
// black starfield that throws off sparkles and hums low while you hold the trigger.
const BOLT = { list: [], unit: new THREE.CylinderGeometry(1, 1, 1, 8, 1, true).rotateX(Math.PI / 2), slug: new THREE.SphereGeometry(1, 8, 6) };
const boltMat = (col, op) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
function boltAlong(m, a, b, r) { const d = b.clone().sub(a), L = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(r, r, Math.max(0.01, L)); m.lookAt(b); }
{ const _t = tracer; tracer = function (a, b, col) {
  if (BEAM.capture) { BEAM.end = b.clone(); return; }
  try { const c = new THREE.Color(col || '#ffd36a'), g = new THREE.Group();
    const halo = new THREE.Mesh(BOLT.unit, boltMat(c.clone().multiplyScalar(1.3), 0.6)), core = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#ffffff').lerp(c, 0.6), 0.95)), slug = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: c.clone().multiplyScalar(1.5), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    boltAlong(halo, a, b, 0.022); boltAlong(core, a, b, 0.007); slug.scale.setScalar(0.12); slug.position.copy(a);
    g.add(halo, core, slug); scene.add(g); BOLT.list.push({ g, halo, core, slug, a: a.clone(), b: b.clone(), life: 0.11, max: 0.11 });
  } catch (e) { _t(a, b, col); } }; }
function boltStep(dt) {
  for (let i = BOLT.list.length - 1; i >= 0; i--) { const B = BOLT.list[i]; B.life -= dt; const k = Math.max(0, B.life / B.max);
    B.halo.material.opacity = 0.6 * k; B.core.material.opacity = 0.95 * k; B.slug.position.lerpVectors(B.a, B.b, Math.min(1, (1 - k) * 2.2)); B.slug.material.opacity = k;
    if (B.life <= 0) { scene.remove(B.g); [B.halo, B.core, B.slug].forEach(m => m.material.dispose()); BOLT.list.splice(i, 1); } } }

// ---- the Black Galaxy Beam ----
// the beam line: each one has its own beam texture, colours, sparkles, hum and a gun body you can tell apart at a glance
const BEAM_STYLES = {
  galaxy: { tex: 'galaxy', rim: '#6a2aff', rim2: '#ff4fd8', spark: ['#ffffff', '#cfa8ff', '#8a4aff', '#ff7ad8'], hum: 55 },
  solar: { tex: 'flow', a: '#fff2b0', b: '#ff8a1a', rim: '#ffb02a', rim2: '#ff3b1a', spark: ['#ffffff', '#ffd36a', '#ff8a1a'], hum: 82 },
  frost: { tex: 'flow', a: '#ffffff', b: '#4fd2ff', rim: '#7fe8ff', rim2: '#2a6aff', spark: ['#ffffff', '#cfefff', '#7fe8ff'], hum: 98 },
  venom: { tex: 'flow', a: '#eaffb0', b: '#3ad83a', rim: '#7fff6a', rim2: '#1a8a3a', spark: ['#eaffb0', '#7fff6a', '#2aff9a'], hum: 64 },
  crimson: { tex: 'flow', a: '#ffd0d0', b: '#e01a2a', rim: '#ff3b3b', rim2: '#8a0a1a', spark: ['#ffffff', '#ff6a6a', '#ff2a2a'], hum: 47 },
  dark: { tex: 'dark', rim: '#ffffff', rim2: '#b8c8ff', spark: ['#ffffff', '#dfe6ff', '#9aa8d8'], hum: 38 }
};
Object.assign(GUNS, {
  vb1: { name: 'Black Galaxy Beam', dmg: 22, rate: 0.07, mag: 140, reload: 2.4, req: 18, price: 12000, col: '#8a4aff', kind: 'carbine', beam: 'galaxy' },
  vb2: { name: 'Solar Lance', dmg: 34, rate: 0.07, mag: 150, reload: 2.4, req: 30, price: 26000, col: '#ffb02a', kind: 'carbine', beam: 'solar' },
  vb3: { name: 'Glacier Ray', dmg: 48, rate: 0.07, mag: 160, reload: 2.3, req: 45, price: 48000, col: '#7fe8ff', kind: 'carbine', beam: 'frost' },
  vb4: { name: 'Venom Stream', dmg: 66, rate: 0.07, mag: 170, reload: 2.3, req: 60, price: 80000, col: '#7fff6a', kind: 'carbine', beam: 'venom' },
  vb5: { name: 'Crimson Ray', dmg: 90, rate: 0.07, mag: 180, reload: 2.2, req: 80, price: 140000, col: '#ff3b3b', kind: 'carbine', beam: 'crimson' },
  vb6: { name: 'Lvl 100 Darkbeam', dmg: 140, rate: 0.07, mag: 200, reload: 2.0, req: 100, price: 300000, col: '#e8ecff', kind: 'carbine', beam: 'dark' }
});
try { const ixa = LEVELS.zeltac.npcs.find(n => n.id === 'ixa'); if (ixa && ixa.guns) for (const k of ['vb1', 'vb2', 'vb3', 'vb4', 'vb5', 'vb6']) if (!ixa.guns.includes(k)) ixa.guns.push(k); } catch (_) {}
const beamStyle = g => BEAM_STYLES[g && g.beam] || BEAM_STYLES.galaxy;
const BEAM = { on: 0, t: 0, end: null, capture: false, mesh: null, spark: [], hum: null };
const BEAM_TEXS = {};
function beamTex(st) { const key = st.tex + (st.b || ''); if (BEAM_TEXS[key]) return BEAM_TEXS[key]; const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d');
  if (st.tex === 'flow') { const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, st.b); g.addColorStop(0.5, st.a); g.addColorStop(1, st.b); x.fillStyle = g; x.fillRect(0, 0, 64, 256); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.35})`; x.fillRect(16 + Math.random() * 32, Math.random() * 256, 2 + Math.random() * 6, 8 + Math.random() * 30); } }
  else if (st.tex === 'dark') { x.fillStyle = '#000'; x.fillRect(0, 0, 64, 256); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`; const y = Math.random() * 256; x.fillRect(Math.random() < 0.5 ? 0 : 60, y, 4, 4 + Math.random() * 20); } x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(0, 0, 3, 256); x.fillRect(61, 0, 3, 256); }
  else return BEAM_TEXS[key] = BEAM_TEX;
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return BEAM_TEXS[key] = t; }
const BEAM_TEX = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 26; i++) { const g = x.createRadialGradient(Math.random() * 64, Math.random() * 256, 0, Math.random() * 64, Math.random() * 256, 14 + Math.random() * 20); g.addColorStop(0, ['rgba(120,60,220,.55)', 'rgba(40,20,120,.5)', 'rgba(200,60,180,.35)'][i % 3]); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); }
  for (let i = 0; i < 140; i++) { x.fillStyle = Math.random() < 0.2 ? '#cfa8ff' : '#ffffff'; const s = Math.random() < 0.15 ? 2 : 1; x.fillRect(Math.random() * 64 | 0, Math.random() * 256 | 0, s, s); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
function beamMesh(st) { if (BEAM.mesh && BEAM.mesh.userData.st === st) return BEAM.mesh; if (BEAM.mesh) scene.remove(BEAM.mesh); const g = new THREE.Group();
  const core = new THREE.Mesh(BOLT.unit, new THREE.MeshBasicMaterial({ map: beamTex(st), transparent: true, opacity: 0.97, depthWrite: false, fog: false, blending: st.tex === 'flow' ? THREE.AdditiveBlending : THREE.NormalBlending }));
  const rim = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color(st.rim), st.tex === 'dark' ? 0.16 : st.tex === 'galaxy' ? 0.22 : 0.35)), rim2 = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color(st.rim2), st.tex === 'dark' ? 0.06 : 0.12));
  g.add(rim2, rim, core); g.userData = { core, rim, rim2, st }; g.visible = false; scene.add(g); BEAM.mesh = g; return g; }
function beamHum(on, st) { if (st && BEAM.oscs) { const k = st.hum / 55; BEAM.oscs.forEach(([o, f]) => o.frequency.setTargetAtTime(f * k, BEAM.ac.currentTime, 0.05)); } try { if (!BEAM.ac) { BEAM.ac = new (window.AudioContext || window.webkitAudioContext)(); const ac = BEAM.ac, gn = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 340; gn.gain.value = 0; lp.connect(gn); gn.connect(ac.destination);
      for (const [type, f, v] of [['sawtooth', 55, 0.5], ['sawtooth', 55.6, 0.5], ['sine', 41, 0.9], ['triangle', 110.4, 0.18]]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(lp); o.start(); (BEAM.oscs = BEAM.oscs || []).push([o, f]); }
      const wob = ac.createOscillator(), wg = ac.createGain(); wob.frequency.value = 5.5; wg.gain.value = 60; wob.connect(wg); wg.connect(lp.frequency); wob.start(); BEAM.gn = gn; }
    if (BEAM.ac.state !== 'running') BEAM.ac.resume(); const vol = on && PREFS.sfx !== false ? 0.16 : 0; BEAM.gn.gain.setTargetAtTime(vol, BEAM.ac.currentTime, on ? 0.04 : 0.12); } catch (_) {} }
// the Solar Lance sings the Staff of the Setting Sun's chord, held and stretched out for as long as the trigger is down
{ const _h = beamHum; beamHum = function (on, st) { const sun = st === BEAM_STYLES.solar || (!st && BEAM.sunOn);
    if (!sun) { if (BEAM.sunOn) sunHum(false); return _h(on, st); } _h(false, null); sunHum(on); }; }
function sunHum(on) { BEAM.sunOn = on; try { if (!BEAM.ac) BEAM.ac = new (window.AudioContext || window.webkitAudioContext)(); const ac = BEAM.ac, t = ac.currentTime;
    if (!BEAM.sg) { const gn = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.7; gn.gain.value = 0; lp.connect(gn); gn.connect(ac.destination);
      for (const [f, v, ty] of [[131, 0.5, 'sine'], [262, 0.28, 'sawtooth'], [392, 0.22, 'sawtooth'], [523, 0.2, 'sawtooth'], [659, 0.14, 'sawtooth'], [784, 0.12, 'sawtooth'], [1568, 0.06, 'sine']]) for (const dt of [-0.6, 0.6]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = ty; o.frequency.value = f; o.detune.value = dt * 7; g.gain.value = v / 2; o.connect(g); g.connect(lp); o.start(); }
      const sw = ac.createOscillator(), sg = ac.createGain(); sw.frequency.value = 0.35; sg.gain.value = 900; sw.connect(sg); sg.connect(lp.frequency); sw.start();
      const tr = ac.createOscillator(), tg = ac.createGain(); tr.frequency.value = 6; tg.gain.value = 0.012; tr.connect(tg); tg.connect(gn.gain); tr.start(); BEAM.sg = gn; BEAM.slp = lp; }
    if (ac.state !== 'running') ac.resume(); const vol = on && PREFS.sfx !== false ? 0.07 : 0; BEAM.sg.gain.cancelScheduledValues(t);
    if (on) { BEAM.sg.gain.setTargetAtTime(vol, t, 0.06); BEAM.slp.frequency.setValueAtTime(900, t); BEAM.slp.frequency.linearRampToValueAtTime(2600, t + 0.6); try { SFX.shot(GUNS.w_100); } catch (_) {} }
    else BEAM.sg.gain.setTargetAtTime(0, t, 0.35); } catch (_) {} }
{ const _f = fire; fire = function () { const g = gun(); if (!g || !g.beam || handMelee()) return _f.apply(this, arguments);
  const before = player.ammo, c0 = player.cool; BEAM.capture = true; BEAM.end = null; let r; const _s = SFX.shot; SFX.shot = () => {}; try { r = _f.apply(this, arguments); } finally { BEAM.capture = false; SFX.shot = _s; try { flash.visible = false; flashLight.intensity = 0; } catch (_) {} }
  if (player.ammo !== before || player.cool > c0) { BEAM.t = performance.now();
    if (!BEAM.end) { const o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); let ht = 70; try { if (!LEVEL.fly) ht = rayClear(o, d, ht); } catch (_) {}
      for (const e of enemies) { if (e.dead) continue; const c = e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), t = raySphere(o, d, c, e.def.r * 1.4 * e.sc); if (t > 0 && t < ht) ht = t; } BEAM.end = o.addScaledVector(d, ht); }
    BEAM.last = BEAM.end; } return r; }; }
let beamPrev = performance.now();
function beamStep() { const now = performance.now(), dt = Math.min(0.05, (now - beamPrev) / 1000); beamPrev = now; boltStep(dt);
  const G = typeof gun === 'function' ? gun() : null, firing = now - BEAM.t < 140 && BEAM.last && typeof vmGun !== 'undefined' && G && G.beam, st = beamStyle(G), m = beamMesh(st);
  if (firing !== !!BEAM.on) { BEAM.on = firing ? 1 : 0; beamHum(firing, st); }
  m.visible = firing;
  if (firing) { // re-aim every frame from the barrel along where you're looking now, so the beam swings with you
    const a = vmGun.localToWorld(V(0, 0.05, G.beamZ || 0.5)), o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); let ht = 70;
    try { if (!LEVEL.fly) ht = rayClear(o, d, ht); for (const e of enemies) { if (e.dead) continue; const t = raySphere(o, d, e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), e.def.r * 1.4 * e.sc); if (t > 0 && t < ht) ht = t; } } catch (_) {}
    const b = o.addScaledVector(d, ht), U = m.userData, L = a.distanceTo(b), tex = U.core.material.map;
    boltAlong(U.core, a, b, 0.015 + Math.sin(now / 60) * 0.002); boltAlong(U.rim, a, b, 0.024); boltAlong(U.rim2, a, b, 0.038 + Math.sin(now / 90) * 0.006);
    tex.repeat.set(1, Math.max(1, L / 2)); tex.offset.y -= dt * (st.tex === 'flow' ? 6 : 3.5); tex.offset.x += dt * 0.4;
    // sparkles fly off the beam and drift away
    for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: typeof FLASH_TEX !== 'undefined' ? FLASH_TEX : null, color: st.spark[Math.random() * st.spark.length | 0], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      s.position.lerpVectors(a, b, Math.random()); s.scale.setScalar(0.05 + Math.random() * 0.07); scene.add(s); BEAM.spark.push({ s, v: V((Math.random() - 0.5) * 2.4, (Math.random() - 0.2) * 2, (Math.random() - 0.5) * 2.4), life: 0.5 + Math.random() * 0.4 }); }
    if (Math.random() < 0.5 && typeof burst === 'function') burst(b, st.spark[Math.random() * st.spark.length | 0], 2, 1.5); }
  for (let i = BEAM.spark.length - 1; i >= 0; i--) { const p = BEAM.spark[i]; p.life -= dt; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life * 1.6); if (p.life <= 0) { scene.remove(p.s); p.s.material.dispose(); BEAM.spark.splice(i, 1); } }
  requestAnimationFrame(beamStep); }
requestAnimationFrame(beamStep);
// no brass casings or muzzle rings off a beam
{ const _g = gunShotFx; gunShotFx = function () { const g = gun(); if (g && g.beam) return; return _g.apply(this, arguments); }; }
{ const _m = muzzleFlash; muzzleFlash = function () { const g = gun(); if (g && g.beam) return; return _m.apply(this, arguments); }; }
// ---- beam gun bodies: same grip, very different business ends ----
{ const _mg = makeGunModel; makeGunModel = function (id) { const G = GUNS[id]; if (!G || !G.beam) return _mg.apply(this, arguments);
  const g = _mg.apply(this, arguments), c = G.col, dk = '#14141a', mt = '#3a3e46', z0 = 0.3; G.beamZ = 0.56;
  if (G.beam === 'galaxy') { part(g, Cy(0.03, 0.035, 0.22, 10), dk, 0, 0.05, z0 + 0.08, Math.PI / 2); const orb = part(g, new THREE.SphereGeometry(0.045, 12, 10), glow('#0a0614'), 0, 0.05, z0 + 0.24);
    for (let k = 0; k < 2; k++) part(g, new THREE.TorusGeometry(0.065 + k * 0.016, 0.006, 5, 18), glow(k ? '#ff4fd8' : c), 0, 0.05, z0 + 0.24, 1.2 + k * 0.6, k * 0.8, 0);
    for (let k = 0; k < 5; k++) part(g, new THREE.SphereGeometry(0.006, 4, 3), glow('#ffffff'), Math.cos(k * 1.3) * 0.03, 0.05 + Math.sin(k * 1.3) * 0.03, z0 + 0.02 + k * 0.04); G.beamZ = 0.55; }
  if (G.beam === 'solar') { part(g, Cy(0.032, 0.026, 0.2, 8), toon('#c88a2a'), 0, 0.05, z0 + 0.08, Math.PI / 2); part(g, new THREE.CircleGeometry(0.035, 12), glow('#fff2b0'), 0, 0.05, z0 + 0.19);
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; part(g, B(0.012, 0.012, 0.16), toon('#e8b040'), Math.cos(a) * 0.05, 0.05 + Math.sin(a) * 0.05, z0 + 0.22, -Math.sin(a) * 0.25, Math.cos(a) * 0.25, 0); }
    for (const s of [-1, 1]) part(g, B(0.005, 0.06, 0.1), toon('#ff8a1a'), s * 0.04, 0.09, z0 - 0.05, 0, 0, s * 0.4); G.beamZ = 0.52; }
  if (G.beam === 'frost') { part(g, B(0.05, 0.05, 0.24), toon('#cfe8f4'), 0, 0.05, z0 + 0.06); for (let k = 0; k < 4; k++) part(g, new THREE.OctahedronGeometry(0.025 + (k % 2) * 0.01, 0), glow('#7fe8ff'), (k % 2 ? 0.03 : -0.03), 0.09 + (k % 2) * 0.02, z0 + k * 0.06, 0.3, k, 0.2);
    part(g, new THREE.ConeGeometry(0.03, 0.12, 6), glow('#cfefff'), 0, 0.05, z0 + 0.24, Math.PI / 2); G.beamZ = 0.6; }
  if (G.beam === 'venom') { part(g, Cy(0.028, 0.028, 0.24, 8), dk, 0, 0.05, z0 + 0.08, Math.PI / 2); part(g, Cy(0.035, 0.035, 0.14, 10), new THREE.MeshBasicMaterial({ color: '#cfe8d0', transparent: true, opacity: 0.4 }), 0, 0.13, z0 - 0.04, Math.PI / 2);
    part(g, Cy(0.028, 0.028, 0.12, 10), glow('#3ad83a'), 0, 0.13, z0 - 0.04, Math.PI / 2); for (let k = 0; k < 6; k++) part(g, new THREE.ConeGeometry(0.008, 0.035, 4), toon('#7fff6a'), Math.cos(k) * 0.03, 0.05 + Math.sin(k) * 0.03, z0 + 0.04 + k * 0.03, Math.cos(k) * 1.2, 0, -Math.sin(k) * 1.2); G.beamZ = 0.55; }
  if (G.beam === 'crimson') { for (const s of [-1, 1]) part(g, B(0.012, 0.02, 0.34), mt, s * 0.028, 0.05, z0 + 0.1); for (let k = 0; k < 4; k++) part(g, new THREE.TorusGeometry(0.04, 0.007, 5, 12), glow('#ff3b3b'), 0, 0.05, z0 + k * 0.08);
    part(g, B(0.03, 0.03, 0.06), glow('#ffd0d0'), 0, 0.05, z0 + 0.27); G.beamZ = 0.6; }
  if (G.beam === 'dark') { swapMats(g, new Map([[toon(C.gunBody), toon('#0c0c10')]])); part(g, Cy(0.024, 0.026, 0.3, 12), '#0c0c10', 0, 0.05, z0 + 0.1, Math.PI / 2);
    for (let k = 0; k < 4; k++) part(g, Cy(0.027, 0.027, 0.012, 12), '#cfd3d8', 0, 0.05, z0 - 0.02 + k * 0.08, Math.PI / 2); part(g, B(0.004, 0.004, 0.36), glow('#ffffff'), 0.026, 0.05, z0 + 0.06); part(g, B(0.004, 0.004, 0.36), glow('#ffffff'), -0.026, 0.05, z0 + 0.06);
    part(g, Cy(0.02, 0.028, 0.03, 12), '#cfd3d8', 0, 0.05, z0 + 0.26, Math.PI / 2); G.beamZ = 0.58; }
  return g; }; }
