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
    const halo = new THREE.Mesh(BOLT.unit, boltMat(c, 0.45)), core = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#ffffff').lerp(c, 0.25), 0.95)), slug = new THREE.Mesh(BOLT.slug, boltMat(new THREE.Color('#ffffff').lerp(c, 0.4), 1));
    boltAlong(halo, a, b, 0.022); boltAlong(core, a, b, 0.007); slug.scale.set(0.028, 0.028, 0.35); slug.lookAt(b.clone().sub(a).add(a)); slug.position.copy(a);
    g.add(halo, core, slug); scene.add(g); BOLT.list.push({ g, halo, core, slug, a: a.clone(), b: b.clone(), life: 0.11, max: 0.11 });
  } catch (e) { _t(a, b, col); } }; }
function boltStep(dt) {
  for (let i = BOLT.list.length - 1; i >= 0; i--) { const B = BOLT.list[i]; B.life -= dt; const k = Math.max(0, B.life / B.max);
    B.halo.material.opacity = 0.45 * k; B.core.material.opacity = 0.95 * k; B.slug.position.lerpVectors(B.a, B.b, Math.min(1, (1 - k) * 2.2)); B.slug.lookAt(B.b); B.slug.material.opacity = k;
    if (B.life <= 0) { scene.remove(B.g); [B.halo, B.core, B.slug].forEach(m => m.material.dispose()); BOLT.list.splice(i, 1); } } }

// ---- the Black Galaxy Beam ----
GUNS.vb1 = { name: 'Black Galaxy Beam', dmg: 22, rate: 0.07, mag: 140, reload: 2.4, req: 18, price: 12000, col: '#8a4aff', kind: 'carbine', beam: 1 };
try { const ixa = LEVELS.zeltac.npcs.find(n => n.id === 'ixa'); if (ixa && ixa.guns && !ixa.guns.includes('vb1')) ixa.guns.push('vb1'); } catch (_) {}
const BEAM = { on: 0, t: 0, end: null, capture: false, mesh: null, spark: [], hum: null };
const BEAM_TEX = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 26; i++) { const g = x.createRadialGradient(Math.random() * 64, Math.random() * 256, 0, Math.random() * 64, Math.random() * 256, 14 + Math.random() * 20); g.addColorStop(0, ['rgba(120,60,220,.55)', 'rgba(40,20,120,.5)', 'rgba(200,60,180,.35)'][i % 3]); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); }
  for (let i = 0; i < 140; i++) { x.fillStyle = Math.random() < 0.2 ? '#cfa8ff' : '#ffffff'; const s = Math.random() < 0.15 ? 2 : 1; x.fillRect(Math.random() * 64 | 0, Math.random() * 256 | 0, s, s); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
function beamMesh() { if (BEAM.mesh) return BEAM.mesh; const g = new THREE.Group();
  const core = new THREE.Mesh(BOLT.unit, new THREE.MeshBasicMaterial({ map: BEAM_TEX, transparent: true, opacity: 0.97, depthWrite: false, fog: false }));
  const rim = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#6a2aff'), 0.35)), rim2 = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#ff4fd8'), 0.12));
  g.add(rim2, rim, core); g.userData = { core, rim, rim2 }; g.visible = false; scene.add(g); BEAM.mesh = g; return g; }
function beamHum(on) { try { if (!BEAM.ac) { BEAM.ac = new (window.AudioContext || window.webkitAudioContext)(); const ac = BEAM.ac, gn = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 340; gn.gain.value = 0; lp.connect(gn); gn.connect(ac.destination);
      for (const [type, f, v] of [['sawtooth', 55, 0.5], ['sawtooth', 55.6, 0.5], ['sine', 41, 0.9], ['triangle', 110.4, 0.18]]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(lp); o.start(); }
      const wob = ac.createOscillator(), wg = ac.createGain(); wob.frequency.value = 5.5; wg.gain.value = 60; wob.connect(wg); wg.connect(lp.frequency); wob.start(); BEAM.gn = gn; }
    if (BEAM.ac.state !== 'running') BEAM.ac.resume(); const vol = on && PREFS.sfx !== false ? 0.16 : 0; BEAM.gn.gain.setTargetAtTime(vol, BEAM.ac.currentTime, on ? 0.04 : 0.12); } catch (_) {} }
{ const _f = fire; fire = function () { const g = gun(); if (!g || !g.beam || handMelee()) return _f.apply(this, arguments);
  const before = player.ammo, c0 = player.cool; BEAM.capture = true; BEAM.end = null; let r; const _s = SFX.shot; SFX.shot = () => {}; try { r = _f.apply(this, arguments); } finally { BEAM.capture = false; SFX.shot = _s; try { flash.visible = false; flashLight.intensity = 0; } catch (_) {} }
  if (player.ammo !== before || player.cool > c0) { BEAM.t = performance.now();
    if (!BEAM.end) { const o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); let ht = 70; try { if (!LEVEL.fly) ht = rayClear(o, d, ht); } catch (_) {}
      for (const e of enemies) { if (e.dead) continue; const c = e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), t = raySphere(o, d, c, e.def.r * 1.4 * e.sc); if (t > 0 && t < ht) ht = t; } BEAM.end = o.addScaledVector(d, ht); }
    BEAM.last = BEAM.end; } return r; }; }
let beamPrev = performance.now();
function beamStep() { const now = performance.now(), dt = Math.min(0.05, (now - beamPrev) / 1000); beamPrev = now; boltStep(dt);
  const firing = now - BEAM.t < 140 && BEAM.last && typeof vmGun !== 'undefined' && gun() && gun().beam, m = beamMesh();
  if (firing !== !!BEAM.on) { BEAM.on = firing ? 1 : 0; beamHum(firing); }
  m.visible = firing;
  if (firing) { const a = vmGun.localToWorld(V(0, 0.05, 0.38)), b = BEAM.last, U = m.userData, L = a.distanceTo(b);
    boltAlong(U.core, a, b, 0.03 + Math.sin(now / 60) * 0.004); boltAlong(U.rim, a, b, 0.048); boltAlong(U.rim2, a, b, 0.075 + Math.sin(now / 90) * 0.012);
    BEAM_TEX.repeat.set(1, Math.max(1, L / 2)); BEAM_TEX.offset.y -= dt * 3.5; BEAM_TEX.offset.x += dt * 0.4;
    // sparkles fly off the beam and drift away
    for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: typeof FLASH_TEX !== 'undefined' ? FLASH_TEX : null, color: ['#ffffff', '#cfa8ff', '#8a4aff', '#ff7ad8'][Math.random() * 4 | 0], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      s.position.lerpVectors(a, b, Math.random()); s.scale.setScalar(0.05 + Math.random() * 0.07); scene.add(s); BEAM.spark.push({ s, v: V((Math.random() - 0.5) * 2.4, (Math.random() - 0.2) * 2, (Math.random() - 0.5) * 2.4), life: 0.5 + Math.random() * 0.4 }); }
    if (Math.random() < 0.5 && typeof burst === 'function') burst(b, Math.random() < 0.5 ? '#8a4aff' : '#ffffff', 2, 1.5); }
  for (let i = BEAM.spark.length - 1; i >= 0; i--) { const p = BEAM.spark[i]; p.life -= dt; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life * 1.6); if (p.life <= 0) { scene.remove(p.s); p.s.material.dispose(); BEAM.spark.splice(i, 1); } }
  requestAnimationFrame(beamStep); }
requestAnimationFrame(beamStep);
// no brass casings or muzzle rings off a beam
{ const _g = gunShotFx; gunShotFx = function () { const g = gun(); if (g && g.beam) return; return _g.apply(this, arguments); }; }
{ const _m = muzzleFlash; muzzleFlash = function () { const g = gun(); if (g && g.beam) return; return _m.apply(this, arguments); }; }
