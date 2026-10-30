// =================== VELOCITY 3: the storm gets real ===================
// Heavy fog and a dark sky, rainbow lightning, a cockpit view with rainbow rain on the windshield and wipers,
// a bit more speed, traffic on the flats, rainbow spray off the car, and the car stays where you park it.
{
  const on = () => LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly;
  Object.assign(VEL, { traffic: [], spray: null, cock: null, wind: null, parked: null, rbCol: new THREE.Color('#ffffff'), rbT: 0, nextRb: 3, hemi0: null, callT: 0 });
  VEL_CAMS[0] = 'Cockpit';
  try { if (PREFS.velCam2 !== 1) { PREFS.velCam2 = 1; VEL.cam = 0; PREFS.velCam = 0; savePrefs(); } } catch (_) {}

  // ---- a tad faster; gold times move with it so medals stay fair ----
  { const _vs = velStats; velStats = function () { const k = _vs(); k.top *= 1.12; k.acc *= 1.12; return k; }; }
  for (const k in RTRACKS) RTRACKS[k].gold = (RTRACKS[k].gold || 31) * 1.1;

  // ---- the floor that "moved": PS1 vertex snapping on huge flat pieces swims as you drive. Big pieces skip it. ----
  const calm = (root) => root.traverse(o => {
    if (!o.isMesh || !o.material || Array.isArray(o.material) || !o.material.onBeforeCompile) return;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const s = o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.z); if (s < 18) return;
    const m = o.material.clone(); m.onBeforeCompile = () => {}; m.customProgramCacheKey = () => 'calm'; if (m.isMeshPhongMaterial) { m.shininess = 28; m.specular = new THREE.Color('#2a3240'); } o.material = m; });

  // ---- traffic ----
  function velTraffic() {
    VEL.traffic = []; const styles = ['wedge', 'muscle', 'jet', 'manta', 'wedge', 'muscle', 'jet', 'manta', 'wedge'];
    for (let i = 0; i < 9; i++) {
      const c = mergeChar(velCar(styles[i], RPAINTS[(i * 3 + 1) % RPAINTS.length], VEL_STRIPES[(i * 5) % VEL_STRIPES.length], i % 4));
      for (const s of [-1, 1]) { part(c, B(0.32, 0.12, 0.06), glow('#fff4d0'), s * 0.55, 0.45, 1.75); part(c, B(0.34, 0.1, 0.06), glow('#ff2a3a'), s * 0.55, 0.5, -1.75); }
      { const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 9, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); cone.rotation.x = Math.PI / 2; cone.position.set(0, 0.45, 6.2); c.add(cone); }
      levelGroup.add(c);
      const T = { obj: c, a: 70 + (i % 5) * 42 + Math.random() * 20, b: 60 + ((i * 7) % 5) * 38, cx: (i % 3 - 1) * 30, cz: 60 + (i % 2) * 30, th: Math.random() * Math.PI * 2, dir: i % 2 ? 1 : -1, sp: 20 + Math.random() * 9, wob: 10 + Math.random() * 16, push: V(0, 0, 0), x: 0, z: 0 };
      VEL.traffic.push(T);
    }
  }
  function trafficStep(dt) {
    const p = player.pos;
    for (const T of VEL.traffic) {
      const circ = Math.max(1, Math.PI * (T.a + T.b)); T.th += T.dir * T.sp / circ * Math.PI * 2 * dt;
      const x = T.cx + Math.cos(T.th) * T.a + T.push.x, z = T.cz + Math.sin(T.th) * T.b + Math.sin(T.th * 3) * T.wob + T.push.z;
      const dx = x - T.x, dz = z - T.z; T.x = x; T.z = z; T.push.multiplyScalar(Math.exp(-dt * 1.2));
      const g = groundH(x, z); T.obj.position.set(x, g + VEL_HOVER + 0.1 + Math.sin(gameTime * 4 + T.th) * 0.07, z); T.g = g;
      if (Math.hypot(dx, dz) > 1e-4) T.obj.rotation.y = Math.atan2(dx, dz);
      // bump into you
      if (Math.abs(p.y - g) > 2.5) continue;
      const ox = p.x - x, oz = p.z - z, d = Math.hypot(ox, oz), R = RC.on ? 2.6 : 1.9;
      if (d < R && d > 1e-3) {
        const nx = ox / d, nz = oz / d; p.x = x + nx * R; p.z = z + nz * R;
        const vx = dx / Math.max(dt, 1e-3), vz = dz / Math.max(dt, 1e-3);
        if (RC.on) { const rel = (RC.vx - vx) * nx + (RC.vz - vz) * nz; if (rel < 0) { RC.vx -= nx * rel * 1.5; RC.vz -= nz * rel * 1.5; T.push.x -= nx * Math.min(8, -rel * 0.4); T.push.z -= nz * Math.min(8, -rel * 0.4);
          if (!T.hitT || gameTime - T.hitT > 0.5) { T.hitT = gameTime; SFX.hit(); FX.shake = Math.min(1, (FX.shake || 0) + Math.min(0.8, -rel * 0.04)); burst(V(x + nx * 1.2, g + 0.8, z + nz * 1.2), '#ffd36a', 14, 6); if (-rel > 18) toast('CRASH!', 'Traffic does not brake on Velocity', 1); } } }
        else if (!T.hitT || gameTime - T.hitT > 0.8) { T.hitT = gameTime; SFX.hit(); log('A hover car clips you. Watch the traffic out here!'); }
      }
    }
  }

  // ---- rainbow spray off the car ----
  let dotTex = null; const velDot = () => dotTex || (dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })());
  function velSprayMake() {
    const N = 220, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.16, map: velDot(), alphaTest: 0.05, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }));
    pts.frustumCulled = false; levelGroup.add(pts); for (let i = 0; i < N; i++) pos[i * 3 + 1] = -999;
    VEL.spray = { pts, N, v: Array.from({ length: N }, () => [0, 0, 0, 0]), i: 0, acc: 0 };
  }
  function sprayStep(dt, car, sp) {
    const S2 = VEL.spray; if (!S2) return; const pos = S2.pts.geometry.attributes.position.array, col = S2.pts.geometry.attributes.color.array, c = new THREE.Color();
    if (car && sp > 5 && player.onGround) {
      S2.acc += dt * Math.min(160, sp * 4.5); const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), r = V(-f.z, 0, f.x);
      while (S2.acc >= 1) { S2.acc -= 1; const i = S2.i = (S2.i + 1) % S2.N, side = Math.random() < 0.5 ? -1 : 1, back = Math.random() < 0.7 ? -1.3 : 1.2;
        const o = player.pos.clone().addScaledVector(r, side * 0.85).addScaledVector(f, back); pos.set([o.x, o.y + 0.15, o.z], i * 3);
        const k = sp * 0.12; S2.v[i] = [-f.x * k * 0.5 + r.x * side * (1.5 + Math.random() * 2.5) + (RC.vx || 0) * 0.35, 1.6 + Math.random() * 2.8, -f.z * k * 0.5 + r.z * side * (1.5 + Math.random() * 2.5) + (RC.vz || 0) * 0.35, 0.55 + Math.random() * 0.3];
        c.setHSL((gameTime * 0.3 + i * 0.037) % 1, 0.9, 0.72); col.set([c.r, c.g, c.b], i * 3); }
    }
    for (let i = 0; i < S2.N; i++) { const v = S2.v[i]; if (v[3] <= 0) { if (pos[i * 3 + 1] > -900) pos[i * 3 + 1] = -999; continue; } v[3] -= dt; v[1] -= 14 * dt; pos[i * 3] += v[0] * dt; pos[i * 3 + 1] += v[1] * dt; pos[i * 3 + 2] += v[2] * dt; }
    S2.pts.geometry.attributes.position.needsUpdate = true; S2.pts.geometry.attributes.color.needsUpdate = true;
  }

  // ---- the cockpit: dash, wheel, pillars and a hood in your paint ----
  function velCockpit() {
    if (VEL.cock) return VEL.cock; const g = new THREE.Group(), M = (hex) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), fog: false });
    const dash = M('#1a1d24'), trim = M('#2b303a'), gl = (h) => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).convertSRGBToLinear(), fog: false });
    part(g, B(1.9, 0.22, 0.55), dash, 0, -0.43, -0.62); part(g, B(1.9, 0.03, 0.5), trim, 0, -0.31, -0.6);
    part(g, B(0.52, 0.12, 0.05), gl('#0c2430'), 0, -0.31, -0.36, -0.5); // gauge cluster
    const dial = part(g, new THREE.RingGeometry(0.035, 0.05, 20, 1, 0, Math.PI * 1.5), gl('#4fd2ff'), -0.12, -0.3, -0.34, -0.5); const dial2 = part(g, new THREE.RingGeometry(0.035, 0.05, 20, 1, 0, Math.PI * 1.5), gl('#ff9a3c'), 0.12, -0.3, -0.34, -0.5);
    const wheel = new THREE.Group(); wheel.position.set(0, -0.43, -0.42); wheel.rotation.x = -0.45; g.add(wheel);
    part(wheel, new THREE.TorusGeometry(0.15, 0.02, 8, 24), M('#111318'), 0, 0, 0); part(wheel, B(0.3, 0.03, 0.02), M('#22262e'), 0, 0, 0); part(wheel, B(0.05, 0.05, 0.03), gl('#ffd36a'), 0, 0, 0.01);
    for (const s of [-1, 1]) { const pl = part(g, B(0.11, 1.05, 0.08), trim, s * 0.9, 0.12, -0.62); pl.rotation.z = s * 0.38; pl.rotation.x = -0.3; }
    part(g, B(2.3, 0.07, 0.3), trim, 0, 0.62, -0.4); part(g, B(0.25, 0.08, 0.04), M('#22262e'), 0, 0.53, -0.52); // roof and mirror
    const hood = part(g, B(1.7, 0.08, 1.1), M('#ff3b2a'), 0, -0.58, -1.25); hood.rotation.x = 0.1;
    for (const s of [-1, 1]) part(g, B(0.3, 0.02, 0.02), gl('#4fd2ff'), s * 0.55, -0.52, -1.75);
    g.userData = { wheel, hood, dial, dial2 }; g.visible = false; g.traverse(o => { o.renderOrder = 5; }); camera.add(g); VEL.cock = g; return g;
  }

  // ---- rainbow rain on the windshield, and wipers ----
  function velWind() {
    if (VEL.wind) return VEL.wind; const c = document.createElement('canvas'); c.id = 'velWind';
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;display:none';
    (stage.parentNode || document.body).insertBefore(c, stage.nextSibling); const W = { c, x: c.getContext('2d'), drops: [], wipe: 0, t: 0, acc: 0 }; VEL.wind = W; return W;
  }
  function windStep(dt, show, sp) {
    const W = velWind(); if (!show) { if (W.c.style.display !== 'none') W.c.style.display = 'none'; W.drops.length = 0; return; }
    if (W.c.style.display === 'none') W.c.style.display = 'block';
    const w = Math.round(innerWidth / 2), h = Math.round(innerHeight / 2); if (W.c.width !== w || W.c.height !== h) { W.c.width = w; W.c.height = h; }
    W.t += dt; if (W.t < 1 / 30) return; const T = W.t; W.t = 0; const x = W.x, top = h * 0.03, bot = h * 0.62;
    W.acc += T * (16 + sp * 0.5); while (W.acc >= 1 && W.drops.length < 70) { W.acc -= 1; W.drops.push({ x: Math.random() * w, y: top + Math.random() * (bot - top), r: 1.2 + Math.pow(Math.random(), 2) * 4.5, hue: (gameTime * 40 + Math.random() * 360) % 360, vy: 0, life: 4 + Math.random() * 4 }); }
    // the wipers sweep every 1.4s
    const ph = (gameTime % 1.4) / 1.4, ang = Math.PI * (0.06 + 0.84 * (ph < 0.5 ? ph * 2 : 2 - ph * 2)), piv = [[w * 0.3, bot + h * 0.06], [w * 0.72, bot + h * 0.06]], L = Math.min(w * 0.46, h * 0.95);
    x.clearRect(0, 0, w, h);
    for (let i = W.drops.length - 1; i >= 0; i--) { const d = W.drops[i]; d.life -= T;
      d.vy += (sp > 8 ? -sp * 0.5 : 10 + d.r * 4) * T; d.y += d.vy * T; d.x += (d.x - w / 2) * sp * 0.0018 * T * 30;
      let wiped = false; for (const [px, py] of piv) { const a = Math.atan2(py - d.y, d.x - px), r2 = Math.hypot(d.x - px, py - d.y); if (r2 < L && Math.abs(a - (Math.PI - ang)) < 0.09) wiped = true; }
      if (wiped || d.life <= 0 || d.y < top - 4 || d.y > bot + 6 || d.x < -4 || d.x > w + 4) { W.drops.splice(i, 1); continue; }
      // a drop is clear water: dark rim on the bottom, bright glint on top, a faint rainbow tint, and a wet trail when it runs
      const rr = d.r, run = Math.abs(d.vy) > 6;
      if (run) { d.trail = d.trail || []; d.trail.push(d.x, d.y); if (d.trail.length > 24) d.trail.splice(0, 2); x.strokeStyle = 'rgba(200,220,255,0.10)'; x.lineWidth = rr * 0.9; x.beginPath(); for (let k = 0; k < d.trail.length; k += 2) (k ? x.lineTo : x.moveTo).call(x, d.trail[k], d.trail[k + 1]); x.stroke(); }
      const sx = rr * (run ? 0.8 : 1), sy = rr * (run ? 1.35 : 1);
      x.save(); x.translate(d.x, d.y); x.scale(sx, sy);
      const gd = x.createRadialGradient(-0.25, -0.3, 0.05, 0, 0, 1); gd.addColorStop(0, 'rgba(255,255,255,0.08)'); gd.addColorStop(0.55, `hsla(${d.hue},70%,80%,0.10)`); gd.addColorStop(0.85, 'rgba(10,14,22,0.35)'); gd.addColorStop(1, 'rgba(10,14,22,0)');
      x.fillStyle = gd; x.beginPath(); x.arc(0, 0, 1, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.75)'; x.beginPath(); x.arc(-0.35, -0.4, 0.22, 0, Math.PI * 2); x.fill();
      x.fillStyle = `hsla(${d.hue},90%,75%,0.35)`; x.beginPath(); x.arc(0.25, 0.45, 0.18, 0, Math.PI * 2); x.fill(); x.restore(); }
    // a fine mist of tiny droplets everywhere
    if (!W.mist || W.mist.w !== w) { W.mist = { w, p: Array.from({ length: 90 }, () => [Math.random(), Math.random(), 0.4 + Math.random() * 0.9]) }; }
    for (let k = 0; k < 5; k++) { const q = W.mist.p[(Math.random() * W.mist.p.length) | 0]; q[0] = Math.random(); q[1] = Math.random(); }
    x.fillStyle = 'rgba(220,235,255,0.12)'; for (const [mx, my, mr] of W.mist.p) { const yy = top + my * (bot - top); x.beginPath(); x.arc(mx * w, yy, mr, 0, Math.PI * 2); x.fill(); }
    x.lineCap = 'round'; for (const [px, py] of piv) { const ex = px + Math.cos(Math.PI - ang) * L, ey = py - Math.sin(Math.PI - ang) * L;
      x.strokeStyle = 'rgba(8,10,14,0.92)'; x.lineWidth = Math.max(3, h * 0.012); x.beginPath(); x.moveTo(px, py); x.lineTo(ex, ey); x.stroke();
      x.strokeStyle = 'rgba(40,44,52,0.95)'; x.lineWidth = Math.max(2, h * 0.006); x.beginPath(); x.moveTo(px + (ex - px) * 0.25, py + (ey - py) * 0.25); x.lineTo(ex, ey); x.stroke(); }
  }

  // ---- rainbow lightning ----
  velBolt = function (near) {
    if (!levelGroup) return; const a = Math.random() * Math.PI * 2, d = near ? 28 + Math.random() * 45 : 45 + Math.random() * 110, x = player.pos.x + Math.cos(a) * d, z = player.pos.z + Math.sin(a) * d;
    const hue = Math.random(), mk = (x0, y0, z0, y1, spread, w) => { const pts = [], cols = []; let px = x0, pz = z0, k = 0; const c = new THREE.Color();
      for (let y = y0; y > y1; y -= 4 + Math.random() * 5, k++) { pts.push(px, y, pz); c.setHSL((hue + k * 0.07) % 1, 1, 0.62); cols.push(c.r, c.g, c.b); px += (Math.random() - 0.5) * spread; pz += (Math.random() - 0.5) * spread; }
      const gy = y1 <= 0 ? groundH(px, pz) : y1; pts.push(px, gy, pz); c.setHSL((hue + k * 0.07) % 1, 1, 0.62); cols.push(c.r, c.g, c.b);
      // thick glowing segments, each its own color of the rainbow
      const l = new THREE.Group(), th = w > 1 ? 0.55 : 0.28; l.material = { opacity: 1 }; l.geometry = { dispose() { l.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); }); } };
      for (let i = 0; i + 5 < pts.length; i += 3) { const a = new THREE.Vector3(pts[i], pts[i + 1], pts[i + 2]), b2 = new THREE.Vector3(pts[i + 3], pts[i + 4], pts[i + 5]), len = a.distanceTo(b2);
        const m = new THREE.Mesh(new THREE.BoxGeometry(th, len, th), new THREE.MeshBasicMaterial({ color: new THREE.Color(cols[i], cols[i + 1], cols[i + 2]), transparent: true, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
        m.position.copy(a).add(b2).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), b2.clone().sub(a).normalize()); l.add(m); }
      levelGroup.add(l); const B2 = { l, life: 0.5 }; Object.defineProperty(l.material, 'opacity', { set(v) { l.children.forEach(m => { m.material.opacity = v; }); }, get() { return 1; } }); VEL.bolts.push(B2); return [px, gy, pz, pts]; };
    const [px, gy, pz, pts] = mk(x, 110, z, 0, 9, 2);
    for (const o of [0.35, -0.35]) mk(x + o, 110, z + o, 0, 9, 1); // doubled up so it reads thick
    for (let b = 0; b < 3; b++) { const j = 3 * (2 + Math.floor(Math.random() * Math.max(1, pts.length / 3 - 4))); if (pts[j + 1] != null) mk(pts[j], pts[j + 1], pts[j + 2], pts[j + 1] - 18 - Math.random() * 20, 12, 1); }
    const c = new THREE.Color().setHSL(hue, 1, 0.6); VEL.rbCol.copy(c); VEL.rbT = 1;
    burst(new THREE.Vector3(px, gy + 0.3, pz), '#' + c.getHexString(), 22, 8); burst(new THREE.Vector3(px, gy + 0.3, pz), '#ffffff', 10, 5);
  };

  // ---- fog, the dark sky, and the rainbow flash ----
  { const _ue = updateEnv; updateEnv = function (dt, t) { _ue(dt, t); if (!on() || state === 'menu') { if (VEL.hemi0) { hemi.color.copy(VEL.hemi0); VEL.hemi0 = null; } return; }
    if (!VEL.hemi0) VEL.hemi0 = hemi.color.clone();
    VEL.nextRb -= dt; if (VEL.nextRb <= 0) { VEL.nextRb = 2 + Math.random() * 4; ENV.flash = Math.max(ENV.flash, 0.9); VEL.lastFlash = ENV.flash; velBolt(Math.random() < 0.4); SFX.thunder && SFX.thunder(0.15 + Math.random() * 0.9); }
    VEL.rbT = Math.max(0, VEL.rbT - dt * 2.4); const fk = Math.max(VEL.rbT, ENV.flash * 0.6);
    const fogBase = new THREE.Color('#151920'), sk = skyMat.uniforms;
    scene.fog.near = 7; scene.fog.far = 58; scene.fog.color.copy(fogBase).lerp(VEL.rbCol, fk * 0.3);
    const fogLin = scene.fog.color; sk.hor.value.copy(fogLin); sk.mid.value.copy(fogLin).multiplyScalar(0.8); sk.top.value.multiplyScalar(0.35).lerp(VEL.rbCol, fk * 0.5); sk.mid.value.lerp(VEL.rbCol, fk * 0.35);
    sun.intensity *= 0.3; hemi.intensity *= 0.55; clouds.visible = false; rain.visible = false; skyRing.visible = false; stars.visible = false; hemi.color.copy(VEL.hemi0).lerp(VEL.rbCol, fk * 0.5);
    if (renderer && renderer.setClearColor) { /* the HD pass clears to HORIZON; keep it stormy */ HORIZON.copy(fogBase); } }; }

  // ---- park the car and get out; it stays there ----
  function parkCar() {
    if (VEL.parked && VEL.parked.parent) VEL.parked.parent.remove(VEL.parked);
    const car = mergeChar(velMyCar()); car.position.copy(player.pos); car.position.y += VEL_HOVER; car.rotation.y = player.yaw + Math.PI; levelGroup.add(car);
    VEL.parked = car; VEL.parkYaw = player.yaw;
    const r = V(Math.cos(player.yaw), 0, -Math.sin(player.yaw)); player.pos.addScaledVector(r, 2.4); collide(player.pos, 0.4, false); velClamp(player.pos); player.pos.y = floorAt(player.pos.x, player.pos.z);
    const it = { x: car.position.x, z: car.position.z, r: 3.4, label: '🚗 Get in your car', fn: () => enterParked() }; VEL.parkIt = it; INTERACTS.push(it);
  }
  function dropParked() { if (VEL.parked && VEL.parked.parent) VEL.parked.parent.remove(VEL.parked); VEL.parked = null; const i = INTERACTS.indexOf(VEL.parkIt); if (i >= 0) INTERACTS.splice(i, 1); VEL.parkIt = null; }
  function enterParked() { if (!VEL.parked || RC.on) return; const c = VEL.parked; player.pos.set(c.position.x, c.position.y - VEL_HOVER, c.position.z); player.yaw = VEL.parkYaw; dropParked(); VEL.entering = true; try { toggleFreeDrive(); } finally { VEL.entering = false; } }
  { const _tf = toggleFreeDrive; toggleFreeDrive = function () {
    if (!on()) return _tf();
    const wasFree = RC.on && RC.free; if (wasFree && Math.hypot(RC.vx || 0, RC.vz || 0) < 12) { RC.v = 0; RC.vx = 0; RC.vz = 0; }
    if (!RC.on && VEL.parked && !VEL.entering) {
      const d = Math.hypot(player.pos.x - VEL.parked.position.x, player.pos.z - VEL.parked.position.z);
      if (d < 7 && Math.abs(player.pos.y - VEL.parked.position.y) < 3) { enterParked(); return true; }
      const now = performance.now() / 1000; if (now - VEL.callT > 4) { VEL.callT = now; toast('YOUR CAR', `Parked ${Math.round(d)} m away. Walk back to it, or press again to call it here.`, 3); return true; }
      dropParked();
    }
    const r = _tf();
    if (wasFree && !RC.on) parkCar();
    return r; }; }
  { const _sr = startRace2; startRace2 = function (tid) { dropParked(); return _sr(tid); }; }

  // ---- build hooks ----
  { const _b = LEVELS.speedway.build; LEVELS.speedway.build = function () { const r = _b.apply(this, arguments);
    VEL.parked = null; VEL.parkIt = null; VEL.nextRb = 2; try { calm(levelGroup); } catch (e) { console.warn('calm', e); } velTraffic(); velSprayMake(); return r; }; }

  // ---- every frame ----
  { const _st = step; step = function (dt) { _st(dt);
    const here = on(), cockOn = here && RC.on && VEL.cam === 0 && state === 'play';
    const ck = velCockpit(); ck.visible = cockOn;
    if (!here) { windStep(dt, false, 0); return; }
    const sp = Math.hypot(RC.vx || 0, RC.vz || 0);
    if (cockOn) { if (VEL.carObj) VEL.carObj.visible = false; const u = ck.userData, st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (move.x || 0);
      u.wheel.rotation.z += (-st * 1.2 - u.wheel.rotation.z) * Math.min(1, dt * 10); const R = velR(); u.hood.material.color.set(RPAINTS[R.paint || 0]).convertSRGBToLinear();
      const K = velStats(), f = Math.min(1, sp / K.top); u.dial.scale.setScalar(0.5 + f * 0.6); u.dial2.scale.setScalar(0.5 + (VEL.bm / K.bcap) * 0.6);
      camera.position.y += Math.sin(gameTime * 23) * Math.min(0.012, sp * 0.0004); }
    windStep(dt, cockOn && !VEL.hyper, sp);
    trafficStep(dt); sprayStep(dt, RC.on, sp);
    if (VEL.parked && VEL.parked.parent) VEL.parked.position.y = floorAt(VEL.parked.position.x, VEL.parked.position.z) + VEL_HOVER + Math.sin(gameTime * 3) * 0.05;
  }; }

  // ---- round 2: heavy rain, a storm-cloud ceiling, brighter headlights, your car waiting, shady locals, quick car swap ----
  // two layers: near streaks you can pick out, and a faint far sheet for depth. Drops land (with a splash) and slide around the cars' magnet field.
  function velRainLayer(N, op, R, lenK) {
    const pos = new Float32Array(N * 6), col = new Float32Array(N * 6), g = new THREE.BufferGeometry(), c = new THREE.Color();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    for (let i = 0; i < N; i++) { c.setHSL(Math.random(), 0.35, 0.82); col.set([c.r * 0.35, c.g * 0.35, c.b * 0.4, c.r, c.g, c.b], i * 6); }
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: op, depthWrite: false })); l.frustumCulled = false; levelGroup.add(l);
    return { l, N, R, lenK, p: Array.from({ length: N }, () => [0, -999, 0, 0, -999]) };
  }
  function velRainMake() { VEL.hrain = [velRainLayer(360, 0.24, 16, 0.035), velRainLayer(520, 0.1, 42, 0.07)]; VEL.shields = VEL.shields || []; }
  function velRainStep(dt) {
    const L = VEL.hrain; if (!L) return; const cp = camera.position, wx = 4, wz = 1.6, vx = -(RC.vx || 0) * 0.12, vz = -(RC.vz || 0) * 0.12, SH = VEL.shields || [];
    for (const H of L) { const a = H.l.geometry.attributes.position.array, near = H.R < 20, R = H.R;
      for (let i = 0; i < H.N; i++) { const q = H.p[i];
        if (q[1] < q[4] || Math.abs(q[0] - cp.x) > R || Math.abs(q[2] - cp.z) > R) {
          if (near && q[1] > -900 && q[1] < q[4] + 0.3 && typeof velSplash === 'function') velSplash(q[0], q[4], q[2]);
          q[0] = cp.x + (Math.random() - 0.5) * R * 2; q[2] = cp.z + (Math.random() - 0.5) * R * 2; q[1] = cp.y + 3 + Math.random() * 20; q[3] = 30 + Math.random() * 12; q[4] = near ? floorAt(q[0], q[2]) : cp.y - 8; }
        q[1] -= q[3] * dt; q[0] += wx * dt; q[2] += wz * dt;
        if (near) for (const s of SH) { const dx = q[0] - s[0], dz = q[2] - s[2]; if (dx > 2.6 || dx < -2.6 || dz > 2.6 || dz < -2.6 || q[1] > s[1] + 2.4 || q[1] < s[1] - 0.8) continue;
          const d = Math.hypot(dx, dz) || 0.01; if (d < 2.3) { q[0] = s[0] + dx / d * 2.3; q[2] = s[2] + dz / d * 2.3; q[3] = Math.max(q[3] * 0.7, 9); } }
        const len = H.lenK; a.set([q[0], q[1], q[2], q[0] - (wx + vx) * len, q[1] + q[3] * len, q[2] - (wz + vz) * len], i * 6); }
      H.l.geometry.attributes.position.needsUpdate = true; }
  }
  let cloudTex = null;
  const velCloudTex = () => cloudTex || (cloudTex = (() => { const S2 = 128, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d');
    for (let i = 0; i < 46; i++) { const px = 20 + Math.random() * 88, py = 20 + Math.random() * 88, r = 14 + Math.random() * 30, g = x.createRadialGradient(px, py, 0, px, py, r); const v = 30 + Math.random() * 40; g.addColorStop(0, `rgba(${v},${v + 4},${v + 12},0.55)`); g.addColorStop(1, `rgba(${v},${v},${v},0)`); x.fillStyle = g; x.fillRect(0, 0, S2, S2); }
    const t = new THREE.CanvasTexture(c); return t; })());
  function velCloudsMake() {
    const g = new THREE.Group(); levelGroup.add(g); VEL.cdeck = g; VEL.cdeckM = [];
    for (let i = 0; i < 34; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: velCloudTex(), color: '#3a404c', transparent: true, opacity: 0.95, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      const sz = 60 + Math.random() * 70; m.scale.set(sz, sz, 1); m.rotation.x = Math.PI / 2; m.rotation.z = Math.random() * 6.28; m.position.set((Math.random() - 0.5) * 300, 34 + Math.random() * 18, (Math.random() - 0.5) * 300); m.renderOrder = -1; g.add(m); VEL.cdeckM.push(m); }
  }
  function velCloudsStep(dt) {
    if (!VEL.cdeck) return; const cp = camera.position, fk = Math.max(VEL.rbT, ENV.flash * 0.6), c = new THREE.Color('#2e333d').lerp(VEL.rbCol, fk * 0.8).lerp(new THREE.Color('#ffffff'), fk * 0.15);
    for (const m of VEL.cdeckM) { m.position.x += 3 * dt; m.position.z += 1.2 * dt; m.rotation.z += dt * 0.01;
      if (m.position.x - cp.x > 150) m.position.x -= 300; if (m.position.x - cp.x < -150) m.position.x += 300; if (m.position.z - cp.z > 150) m.position.z -= 300; if (m.position.z - cp.z < -150) m.position.z += 300; m.material.color.copy(c); }
  }
  function velBeam() { const cone = new THREE.Mesh(new THREE.ConeGeometry(3.4, 16, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4dc', transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); cone.geometry.translate(0, -8, 0); cone.rotation.x = -Math.PI / 2; levelGroup.add(cone); VEL.beam = cone; }
  // your car waits right in front of you when you arrive
  function velArrivalCar() {
    if (VEL.parked) return; const R = velR(); const car = mergeChar(velMyCar()); const x = -4, z = -2, yaw = Math.PI;
    car.position.set(x, VCITY.y + VEL_HOVER, z); car.rotation.y = yaw + Math.PI; levelGroup.add(car); VEL.parked = car; VEL.parkYaw = yaw;
    const it = { x, z, r: 3.4, label: '🚗 Get in your car', fn: () => enterParked() }; VEL.parkIt = it; INTERACTS.push(it);
  }
  // shady locals in Pit Row
  const SHADY = [
    { id: 'vshade1', name: 'Slick Dez', role: 'Sells "spare parts"', rig: 'civ', make: () => makeCivilian('#1e1c22', '#2c2a28', '#c58a64', '#111', '#c86aff'), x: -19, z: -6, face: 1.6, idle: ["Need a magnet coil? Fell off a truck. A hover truck. It hovered off.", "Don't ask where the stripes came from. Stripes are stripes.", "I didn't see you. You didn't see me. We're both very bad at seeing."] },
    { id: 'vshade2', name: 'Shil', role: 'Takes bets', rig: 'civ', make: () => makeCivilian('#3a2a1e', '#1e1c22', '#8a5a3c', '#2a1e18', '#ffd36a'), x: 20, z: -8, face: -1.6, idle: ["Five hundred says you clip a traffic car on the first turn. Easy money.", "The house always wins. I am the house. The house is soaking wet."] },
    { id: 'vshade3', name: 'The Hood', role: '...', rig: 'civ', make: () => makeCivilian('#2b2a2c', '#1e1c22', '#e0b892', '#1e1c22', '#ff3b2a'), x: -12, z: -34, face: 0.4, idle: ["...", "The lightning here isn't natural. Somebody's charging something under the flats.", "Keep your engine running. Things go missing in Pit Row."] },
    { id: 'vshade4', name: 'Rusty', role: 'Junk racer', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#6a5a4a', '#5d636c': '#3a2e26' }), x: 14, z: -30, face: -0.5, idle: ["I RACED ONCE. I LOST ONCE. I AM STILL LOSING. PLEASE DO NOT LOOK AT MY TIRES.", "SPARE CHANGE FOR A BROKEN DRIVE BELT?"] }
  ];
  for (const n of SHADY) if (!LEVELS.speedway.npcs.some(m => m.id === n.id)) LEVELS.speedway.npcs.push(n);
  // Menu → Vehicle: pick which of your cars to drive
  function openCarSwap() {
    const R = velR(); openDlg('Your cars', 'Pick one to drive'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
    const go = k => { R.car = k; markDirty(); closeDlg(); SFX.ui(); if (RC.on) return; dropParked(); VEL.entering = true; try { toggleFreeDrive(); } finally { VEL.entering = false; } };
    for (const k of R.owned) { const C2 = RCARS[k]; if (!C2) continue; const r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${C2.name}${R.car === k ? ' · driving' : ''}`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = R.car === k && RC.on ? '✓ In use' : 'Drive'; b.disabled = R.car === k && RC.on; b.addEventListener('click', () => go(k)); r.append(nm, b); rows.appendChild(r); }
    $('dlgActs').before(rows); $('dlgLine').textContent = R.owned.length > 1 ? 'Swap cars any time. Gus in Pit Row sells more.' : 'You only own one car so far. Garage Gus in Pit Row sells more.';
    acts([['Garage', () => { closeDlg(); openGarage(); }], ['Close', closeDlg]]);
  }
  function openVehSwap() {
    const V0 = vehS(); if (V0.owned.length < 2) { toggleVehicle(); return; }
    openDlg('Vehicles', 'Pick one to drive'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
    for (const id of V0.owned) { const D = VEH[id]; if (!D) continue; const r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${D.name}${V0.sel === id ? ' · selected' : ''}`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Drive'; b.addEventListener('click', () => { V0.sel = id; markDirty(); closeDlg(); toggleVehicle(); }); r.append(nm, b); rows.appendChild(r); }
    $('dlgActs').before(rows); $('dlgLine').textContent = 'Pick a vehicle and it rolls up next to you.'; acts([['Vehicle bay', () => { closeDlg(); openVehicleBay(); }], ['Close', closeDlg]]);
  }
  setTimeout(() => { const old = $('vehBtn'); if (old) { const nb = old.cloneNode(true); old.replaceWith(nb); // after the base game wires its own click
    nb.addEventListener('click', () => { $('menuDrop').hidden = true;
      if (on()) { if (RC.on && RC.free) { toggleFreeDrive(); return; } openCarSwap(); return; }
      if (VH.on) { toggleVehicle(); return; } const V0 = vehS(); if (V0.owned.length && vehOK()) openVehSwap(); else openVehicleBay(); }); } }, 0);
  { const _b2 = LEVELS.speedway.build; LEVELS.speedway.build = function () { const r = _b2.apply(this, arguments); velRainMake(); velCloudsMake(); velBeam(); velArrivalCar(); return r; }; }
  { const _st2 = step; step = function (dt) { _st2(dt); if (!on()) return; velRainStep(dt); velCloudsStep(dt);
    if (VEL.lamp) { if (RC.on) { VEL.lamp.intensity = 6; VEL.lamp.distance = 120; VEL.lamp.angle = 0.62; } }
    if (VEL.beam) { VEL.beam.visible = !!RC.on && VEL.cam !== 0; if (RC.on) { const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)); VEL.beam.position.copy(player.pos).addScaledVector(f, 1.9).add(V(0, 0.75, 0)); VEL.beam.rotation.set(0, player.yaw, 0); VEL.beam.rotateX(Math.PI / 2 - 0.06); } } }; }
}
