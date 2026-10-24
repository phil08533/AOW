// mawbeams.js: in the Greater Maw's last, morphed phase its eye fires a barrage of purple beams (the mining-beam look):
// thin lines flicker in first to show where they'll land, then a fan of thick beams burns for a few seconds. Fly out of the lines.
BEAM_STYLES.maw = { tex: 'flow', a: '#ffe6ff', b: '#b02aff', rim: '#d05aff', rim2: '#6a1aff', spark: ['#ffffff', '#e8a8ff', '#b02aff'], hum: 42 };
const MAWB = { list: [], t: 0, next: 10, on: 0 };
const MAWB_N = 14, MAWB_WARN = 1.6, MAWB_BURN = 3.2, MAWB_R = 9;
function mawbMake() { const st = BEAM_STYLES.maw, tx = beamTex(st).clone(); tx.needsUpdate = true; tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  const g = new THREE.Group(), core = new THREE.Mesh(BOLT.unit, new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0.97, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })),
    rim = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color(st.rim), 0.32)), rim2 = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color(st.rim2), 0.14)), warn = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#d05aff'), 0.5));
  g.add(rim2, rim, core, warn); g.visible = false; levelGroup.add(g); return { g, core, rim, rim2, warn, dir: V(0, 0, 1), spin: 0 }; }
function mawbClear() { for (const b of MAWB.list) if (b.g.parent) b.g.parent.remove(b.g); MAWB.list = []; MAWB.on = 0; MAWB.next = 10; }
// aim a fan at you: one line through where you are now, the rest scattered around it with gaps big enough to slip through
function mawbStart(eye) { if (!MAWB.list.length || !MAWB.list[0].g.parent) MAWB.list = Array.from({ length: MAWB_N }, mawbMake);
  const to = player.pos.clone().sub(eye), d = to.length(), fwd = to.clone().normalize(), side = V(0, 1, 0).cross(fwd).normalize(), up = fwd.clone().cross(side).normalize();
  MAWB.list.forEach((b, i) => { const a = i * 2.39996, r = i === 0 ? 0 : 16 + Math.sqrt(i) * 17, p = player.pos.clone().addScaledVector(side, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r);
    b.dir.copy(p.sub(eye).normalize()); b.spin = (i % 2 ? 1 : -1) * 0.05; b.g.visible = true; b.core.visible = b.rim.visible = b.rim2.visible = false; b.warn.visible = true; });
  MAWB.on = 1; MAWB.t = 0; MAWB.axis = fwd; toast('THE MAW IS CHARGING', 'Fly out of the purple lines!', 1.6); try { SFX.ui(); } catch (_) {} }
{ const _mf = mawFinalStep; mawFinalStep = function (dt, t) { _mf(dt, t);
  if (MAW.dead || !MAW.obj || !player.alive || CUT.on) { if (MAWB.on) { MAWB.list.forEach(b => { b.g.visible = false; }); MAWB.on = 0; try { beamHum(false); } catch (_) {} } return; }
  const eye = MAW.obj.userData.eye.getWorldPosition(V(0, 0, 0)), F = fly;
  if (!MAWB.on) { MAWB.next -= dt; if (MAWB.next <= 0) mawbStart(eye); return; }
  MAWB.t += dt; const burn = MAWB.t > MAWB_WARN, q = new THREE.Quaternion();
  if (burn && MAWB.on === 1) { MAWB.on = 2; SFX.boom(); if (F) F.shake = Math.max(F.shake, 0.5); try { beamHum(true, BEAM_STYLES.maw); } catch (_) {} MAWB.list.forEach(b => { b.warn.visible = false; b.core.visible = b.rim.visible = b.rim2.visible = true; }); }
  let hit = false;
  for (const b of MAWB.list) { if (burn) { q.setFromAxisAngle(MAWB.axis, b.spin * dt); b.dir.applyQuaternion(q).normalize(); }
    const e = eye.clone().addScaledVector(b.dir, 1600);
    if (!burn) boltAlong(b.warn, eye, e, 0.5 + Math.abs(Math.sin(MAWB.t * 14)) * 0.6);
    else { const w = Math.min(1, (MAWB.t - MAWB_WARN) / 0.25); boltAlong(b.core, eye, e, (3.4 + Math.sin(t * 40 + b.spin * 99) * 0.4) * w); boltAlong(b.rim, eye, e, 5.4 * w); boltAlong(b.rim2, eye, e, 8.2 * w);
      const tx = b.core.material.map; tx.repeat.set(1, 60); tx.offset.y -= dt * 6;
      const rel = player.pos.clone().sub(eye), al = rel.dot(b.dir); if (al > 0 && rel.addScaledVector(b.dir, -al).length() < MAWB_R) hit = true; } }
  if (hit) { MAW.hurtAcc += 80 * dt; if (F) F.shake = Math.max(F.shake, 0.35); if (Math.random() < 0.5) burst(player.pos, BEAM_STYLES.maw.spark[(Math.random() * 3) | 0], 3, 6); }
  if (MAWB.t > MAWB_WARN + MAWB_BURN) { MAWB.list.forEach(b => { b.g.visible = false; }); MAWB.on = 0; MAWB.next = 11 + Math.random() * 4; try { beamHum(false); } catch (_) {} } }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { if (MAWB.on) { try { beamHum(false); } catch (_) {} } MAWB.list = []; MAWB.on = 0; MAWB.next = 10; return _ll(id, o); }; }
