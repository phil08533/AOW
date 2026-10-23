// =================== SHIP GUNS: travelling laser bolts for the Setting Sun, a held mining beam for the Miner ===================
const laserCol = () => { const C = scS().cfg[shipCls()]; return LASER_COLS[(C && C.lc) | 0] || LASER_COLS[0]; };
const boltSpeed = () => [260, 380, 560][(scS().cfg.fighter.bolt) | 0] || 260;
// aim assist: lock onto whatever is near your crosshair. Settings can turn it off
function shipAimFocus(F) {
  let focus = player.pos.clone().addScaledVector(shipFwd, 160), mn = shipCls() === 'miner', bestA = PREFS.shipAim === false ? -1 : mn ? 0.32 : 0.1;
  for (const r of F.raiders) { if (r.dead) continue; const to = r.obj.position.clone().sub(player.pos), d = to.length(); if (d > 420) continue; const a = to.normalize().angleTo(shipFwd); if (a < bestA) { bestA = a; focus = r.obj.position.clone(); } }
  for (const X of F.extra || []) { if (X.dead) continue; const p = X.pos(), to = p.clone().sub(player.pos), d = to.length(); if (d > 420) continue; const a = to.normalize().angleTo(shipFwd); if (a < bestA) { bestA = a; focus = p; } }
  // the miner also locks onto asteroids, so the beams stay on the rock you're carving
  if (mn && bestA > 0) for (const R of F.rockData) { if (R.dead) continue; const to = R.p.clone().sub(player.pos), d = to.length() - R.s; if (d > 300) continue; const a = to.normalize().angleTo(shipFwd) - Math.min(0.2, R.s / Math.max(30, d) * 0.5); if (a < bestA) { bestA = a; focus = R.p.clone(); } }
  return focus;
}
function shipMuzzle(side) { const go = shipGunOff(side); return player.pos.clone().addScaledVector(shipRight, go.x).addScaledVector(V(0, 1, 0).applyQuaternion(_q), go.y).addScaledVector(shipFwd, -go.z); }
// the first thing a ray from `from` along `dir` hits within `max`
function shipRayHit(F, from, dir, max) {
  let ht = max, o = { hit: null, rock: -1, ext: null };
  for (const X of F.extra || []) { if (X.dead) continue; const t = raySphere(from, dir, X.pos(), X.r); if (t > 0 && t < ht) { ht = t; o = { hit: null, rock: -1, ext: X }; } }
  for (const r of F.raiders) { if (r.dead) continue; const t = raySphere(from, dir, r.obj.position, 5); if (t > 0 && t < ht) { ht = t; o = { hit: r, rock: -1, ext: null }; } }
  F.rockData.forEach((R, i) => { if (R.dead) return; const t = raySphere(from, dir, R.p, R.s); if (t > 0 && t < ht) { ht = t; o = { hit: null, rock: i, ext: null }; } });
  o.t = ht; o.any = !!(o.hit || o.ext || o.rock >= 0); return o;
}
const shipDmg = () => SHIP_SYS.laser.lv[sysLv('laser')].dmg * (1 + (S.lvl - 1) * 0.03) * shipMod('laser');
shipFire = function () {
  const F = fly; _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q);
  if (shipCls() === 'miner') { F.beamT = gameTime; F.cool = 0.02; return; }
  F.cool = 0.16; SFX.laser(); F.shake = Math.max(F.shake, 0.05);
  const focus = shipAimFocus(F), dmg = shipDmg(), col = new THREE.Color(laserCol()[1]), spd = boltSpeed();
  for (const side of [-1, 1]) { const from = shipMuzzle(side), dir = focus.clone().sub(from).normalize(), g = new THREE.Group();
    const halo = new THREE.Mesh(BOLT.unit, boltMat(col.clone().multiplyScalar(1.3), 0.55)), core = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#ffffff').lerp(col, 0.45), 0.95));
    halo.scale.set(0.34, 0.34, 7); core.scale.set(0.12, 0.12, 6.4); g.add(halo, core); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); fl.scale.setScalar(2.2); fl.position.z = 3.2; g.add(fl);
    g.position.copy(from); g.lookAt(from.clone().add(dir)); levelGroup.add(g);
    (F.sbolts = F.sbolts || []).push({ g, v: dir.multiplyScalar(spd).add(F.vel.clone().multiplyScalar(0.9)), life: 420 / spd + 0.3, dmg: dmg / 2 }); }
};
// the miner's beam: two textured streams out of the arm emitters, re-aimed every frame, with the beam guns' hum
function minerBeams(F) { if (F.mb && F.mb[0].parent) return F.mb; F.mb = [0, 1].map(() => { const g = new THREE.Group(), core = new THREE.Mesh(BOLT.unit, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.97, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })), rim = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#ffffff'), 0.3)), rim2 = new THREE.Mesh(BOLT.unit, boltMat(new THREE.Color('#ffffff'), 0.12)); g.add(rim2, rim, core); g.visible = false; levelGroup.add(g); return { g, core, rim, rim2, acc: 0, st: null }; }); return F.mb; }
{ const _ss = spaceStep; spaceStep = function (dt, t) { _ss(dt, t); const F = fly; if (!F) return;
  // bolts fly, and hit the first thing along their path this frame
  for (let i = (F.sbolts || []).length - 1; i >= 0; i--) { const B = F.sbolts[i], step = B.v.length() * dt, dir = B.v.clone().normalize(), from = B.g.position.clone(), o = shipRayHit(F, from, dir, step);
    B.life -= dt; if (o.any) { const end = from.addScaledVector(dir, o.t); burst(end, laserCol()[1], 6, 10); shipHitApply(o, B.dmg, end); B.life = 0; } else B.g.position.addScaledVector(B.v, dt);
    if (B.life <= 0) { levelGroup.remove(B.g); B.g.traverse(m => m.material && m.material.dispose()); F.sbolts.splice(i, 1); } }
  // mining beams
  const on = shipCls() === 'miner' && gameTime - (F.beamT || -9) < 0.12 && player.alive && !dlgOpen, M = minerBeams(F), st = BEAM_STYLES[laserCol()[2]] || BEAM_STYLES.frost;
  if (on !== !!F.beamOn) { F.beamOn = on; try { beamHum(on, st); } catch (_) {} }
  M.forEach((b, k) => { b.g.visible = on; if (!on) return;
    if (b.st !== st) { b.st = st; b.core.material.map = beamTex(st).clone(); b.core.material.map.needsUpdate = true; b.core.material.map.wrapS = b.core.material.map.wrapT = THREE.RepeatWrapping; b.core.material.needsUpdate = true; b.rim.material.color.set(st.rim); b.rim2.material.color.set(st.rim2); }
    _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q);
    const a = shipMuzzle(k ? 1 : -1), dir = shipAimFocus(F).sub(a).normalize(), o = shipRayHit(F, a, dir, 300), e = a.clone().addScaledVector(dir, o.t), L = a.distanceTo(e);
    boltAlong(b.core, a, e, 0.38 + Math.sin(t * 40 + k) * 0.05); boltAlong(b.rim, a, e, 0.6); boltAlong(b.rim2, a, e, 0.95 + Math.sin(t * 25) * 0.12);
    const tx = b.core.material.map; tx.repeat.set(1, Math.max(1, L / 12)); tx.offset.y -= dt * 6;
    if (Math.random() < 0.6) burst(e, st.spark[Math.random() * st.spark.length | 0], 2, 4);
    // damage ticks ten times a second: the same damage per second as the guns, split across both beams
    b.acc += dt; if (b.acc >= 0.1 && o.any) { shipHitApply(o, shipDmg() / 0.16 * b.acc / 2, e); b.acc = 0; } else if (b.acc >= 0.1) b.acc = 0; });
}; }
// drop the hum when you leave space
{ const _ll = loadLevel; loadLevel = function (id, o) { if (fly && fly.beamOn) { fly.beamOn = false; try { beamHum(false); } catch (_) {} } return _ll(id, o); }; }
// ---- Settings → Game: ship auto aim (on by default) ----
{ const anchor = $('setMusic').previousElementSibling, l = document.createElement('span'); l.textContent = 'Ship auto aim'; const b = document.createElement('button'); b.className = 'pbtn'; b.id = 'setShipAim';
  b.addEventListener('click', () => { PREFS.shipAim = PREFS.shipAim === false; savePrefs(); renderSettings(); SFX.ui(); }); anchor.before(l, b); SET_OF.setShipAim = 'game'; }
{ const _rs = renderSettings; renderSettings = function () { _rs(); const b = $('setShipAim'); if (b) b.textContent = PREFS.shipAim === false ? 'Off' : 'On'; }; }
