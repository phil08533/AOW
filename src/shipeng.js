// =================== SHIP ENGINES (2.23.63): light-ribbon exhaust trails + engine voices ===================
// Trails: one glowing ribbon per thruster, starting right at the nozzle, taper and fade out over ~0.9 s.
// Engine: most ships run an "atomic jet" (sub throb, rumble, roaring wash, turbine whine); the miner runs a space diesel (chugging low saw + clatter).
const SENG = { rib: [], eng: null, tickT: 0, ship: null };
const RIB_N = 64, RIB_LIFE = 0.9;
function ribMake() { const g = new THREE.BufferGeometry(), pos = new Float32Array(RIB_N * 2 * 3), col = new Float32Array(RIB_N * 2 * 3), idx = [];
  for (let i = 0; i < RIB_N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.frustumCulled = false; m.renderOrder = 5; return { m, pts: [], head: new THREE.Vector3() }; }
// one trail per thruster: the glowing engine faces the ship was built with (ship.userData.engines), read in the ship's own space,
// so swapping parts in the shipbuilder changes how many trails there are and where they come from
function shipNozzles(ship) {
  if (ship.userData.nozz && ship.userData.nozzOf === ship.userData.engines) return ship.userData.nozz;
  const bb = new THREE.Box3(), out = [];
  for (const m of ship.userData.engines || []) { if (!m.geometry) continue; m.geometry.computeBoundingBox(); m.updateMatrix();
    // the matrix up to the ship (engines can sit inside sub-groups)
    const M = m.matrix.clone(); for (let p = m.parent; p && p !== ship; p = p.parent) { p.updateMatrix(); M.premultiply(p.matrix); }
    bb.copy(m.geometry.boundingBox).applyMatrix4(M); const c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
    out.push({ p: V(c.x, c.y, bb.max.z + 0.02), r: Math.max(0.12, Math.min(sz.x, sz.y) / 2) }); }   // the back face of the glow plate (ships fly toward -z)
  ship.userData.nozz = out; ship.userData.nozzOf = ship.userData.engines; return out; }
const _rA = new THREE.Vector3(), _rB = new THREE.Vector3(), _rC = new THREE.Vector3(), _rCol = new THREE.Color(), _rW = new THREE.Color(1, 1, 1);
// F = space flight state, power = throttle * boost (0..1.8), hex = exhaust color or 'rainbow'
function shipTrailTick(F, dt, power, hex, t) {
  const ship = F.ship; if (!ship) return; ship.updateMatrixWorld(true);
  const N = shipNozzles(ship), sc = ship.scale.x;
  if (SENG.ship !== ship || SENG.rib.length !== N.length || (SENG.rib[0] && SENG.rib[0].m.parent !== levelGroup)) {
    SENG.rib.forEach(R => { if (R.m.parent) R.m.parent.remove(R.m); R.m.geometry.dispose(); }); SENG.rib = N.map(() => ribMake()); SENG.rib.forEach(R => levelGroup.add(R.m)); SENG.ship = ship; }
  const on = power > 0.05;
  SENG.rib.forEach((R, s) => {
    const Nz = N[s], np = R.head.copy(Nz.p).applyMatrix4(ship.matrixWorld).clone(), w = Nz.r * sc * (0.75 + power * 0.35);
    for (const p of R.pts) p.a += dt;
    while (R.pts.length && R.pts[0].a > RIB_LIFE) R.pts.shift();
    if (on) { const c = hex === 'rainbow' ? new THREE.Color().setHSL((t * 0.4 + s / N.length) % 1, 1, 0.6) : new THREE.Color(hex); c.convertSRGBToLinear();
      const L = R.pts[R.pts.length - 1];
      // at low frame rates the ship jumps far between frames: fill the gap with in-between points so the trail stays smooth
      if (L) { const d = L.p.distanceTo(np), k = Math.min(12, Math.ceil(Math.min(d, 8) / 0.7)); for (let j = k - 1; j >= 1; j--) { const u = j / k * Math.min(d, 8) / Math.max(d, 1e-6); R.pts.push({ p: np.clone().lerp(L.p, u), a: L.a * u, c, w }); } }
      R.pts.push({ p: np, a: 0, c, w });
      while (R.pts.length > 1 && (R.pts.length > RIB_N || R.pts[0].p.distanceTo(np) > 8)) R.pts.shift(); }
    else if (R.pts.length) R.pts[R.pts.length - 1].p.copy(np);   // idling: the trail still starts at the nozzle
    const n = R.pts.length, pos = R.m.geometry.attributes.position.array, col = R.m.geometry.attributes.color.array;
    for (let i = 0; i < RIB_N; i++) {
      const P = R.pts[Math.min(i, n - 1)], o = i * 6;
      if (!P || i >= n) { for (let j = 0; j < 6; j++) { pos[o + j] = i ? pos[o - 6 + j] : 0; col[o + j] = 0; } continue; } // unused slots collapse onto the newest point
      // across-direction: perpendicular to the trail and to the camera, so the ribbon always faces you
      const Q = R.pts[Math.min(n - 1, i + 1)], Pp = R.pts[Math.max(0, i - 1)];
      _rA.subVectors(Q.p, Pp.p); if (_rA.lengthSq() < 1e-6) _rA.copy(shipFwd);
      _rB.subVectors(camera.position, P.p); _rC.crossVectors(_rA, _rB).normalize();
      const dc = _rB.length(), k = 1 - P.a / RIB_LIFE, ds = P.p.distanceTo(R.head), hw = P.w * (0.2 + 0.8 * k) * Math.min(1, dc / 22), f = 0.8 * k * k * Math.max(0, 1 - ds / 7) ** 1.3 * Math.min(1, Math.max(0, (dc - 5) / 5));
      pos[o] = P.p.x + _rC.x * hw; pos[o + 1] = P.p.y + _rC.y * hw; pos[o + 2] = P.p.z + _rC.z * hw;
      pos[o + 3] = P.p.x - _rC.x * hw; pos[o + 4] = P.p.y - _rC.y * hw; pos[o + 5] = P.p.z - _rC.z * hw;
      // hot white at the nozzle, the exhaust color as it cools
      _rCol.copy(P.c).lerp(_rW, 0.45 * k * k * k);
      col[o] = col[o + 3] = _rCol.r * f; col[o + 1] = col[o + 4] = _rCol.g * f; col[o + 2] = col[o + 5] = _rCol.b * f;
    }
    R.m.geometry.attributes.position.needsUpdate = true; R.m.geometry.attributes.color.needsUpdate = true; R.m.visible = n > 1;
  });
}

// ---- engine voices ----
function engBuild(c) {
  const ac = c.ac, out = ac.createGain(); out.gain.value = 0; out.connect(c.master);
  const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource(); noise.buffer = nb; noise.loop = true; noise.start();
  const G = v => { const g = ac.createGain(); g.gain.value = v; return g; }, BQ = (type, f, q) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; }, O = (type, f) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.start(); return o; };
  // atomic jet
  const jet = G(0); jet.connect(out);
  const rlp = BQ('lowpass', 110, 0.9), rg = G(0.9); noise.connect(rlp); rlp.connect(rg); rg.connect(jet);                  // reactor rumble
  const rbp = BQ('bandpass', 500, 0.7), roar = G(0.2); noise.connect(rbp); rbp.connect(roar); roar.connect(jet);           // jet roar
  const whine = O('sine', 900), wg = G(0.012); whine.connect(wg); wg.connect(jet);                                          // turbine whine
  const sub = O('sine', 38), sg = G(0.5), thr = O('sine', 6), tg = G(0.25); sub.connect(sg); sg.connect(jet); thr.connect(tg); tg.connect(sg.gain); // sub throb
  // space diesel (the miner)
  const dsl = G(0); dsl.connect(out);
  const d1 = O('sawtooth', 42), d2 = O('square', 21), dlp = BQ('lowpass', 260, 3), chug = G(0.5); d1.connect(dlp); d2.connect(dlp); dlp.connect(chug); chug.connect(dsl);
  const cl = O('square', 10), clg = G(0.45); cl.connect(clg); clg.connect(chug.gain);                                       // the chug
  const hp = BQ('bandpass', 2600, 1.4), clat = G(0), clatAmp = G(0.1); noise.connect(hp); hp.connect(clat); clat.connect(dsl); cl.connect(clatAmp); clatAmp.connect(clat.gain); // valve clatter
  return { ac, out, jet, dsl, rlp, rbp, roar, whine, wg, sub, thr, d1, d2, dlp, cl, clatAmp };
}
function shipEngTick(level, speed, miner) {
  const c = SFX._ctx && SFX._ctx(); if (!c) return;
  if (!SENG.eng || SENG.eng.ac !== c.ac) SENG.eng = engBuild(c);
  const E = SENG.eng, t = E.ac.currentTime, L = Math.max(0, Math.min(1.8, level)), sp = Math.max(0, Math.min(1.5, speed)), T = 0.12;
  SENG.tickT = performance.now();
  E.out.gain.setTargetAtTime(PREFS.sfx ? 0.55 : 0, t, 0.15);
  E.jet.gain.setTargetAtTime(miner ? 0 : 1, t, 0.3); E.dsl.gain.setTargetAtTime(miner ? 1 : 0, t, 0.3);
  if (!miner) {
    E.rlp.frequency.setTargetAtTime(90 + L * 70, t, T); E.rbp.frequency.setTargetAtTime(380 + L * 520 + sp * 300, t, T); E.roar.gain.setTargetAtTime(0.06 + L * 0.22, t, T);
    E.whine.frequency.setTargetAtTime(700 + L * 600 + sp * 900, t, 0.25); E.wg.gain.setTargetAtTime(0.004 + L * 0.01, t, T);
    E.sub.frequency.setTargetAtTime(34 + L * 8, t, T); E.thr.frequency.setTargetAtTime(4 + L * 4, t, 0.3);
  } else {
    const f = 36 + L * 14 + sp * 8; E.d1.frequency.setTargetAtTime(f, t, 0.2); E.d2.frequency.setTargetAtTime(f / 2, t, 0.2);
    E.dlp.frequency.setTargetAtTime(200 + L * 260, t, T); E.cl.frequency.setTargetAtTime(7 + L * 6 + sp * 2, t, 0.3); E.clatAmp.gain.setTargetAtTime(0.03 + L * 0.08, t, T);
  }
}
// fall silent when nothing is flying
setInterval(() => { const E = SENG.eng; if (E && performance.now() - SENG.tickT > 300) E.out.gain.setTargetAtTime(0, E.ac.currentTime, 0.15); }, 150);
