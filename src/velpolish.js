// =================== VELOCITY 4: wet ground and magnet cars ===================
// The flats are soaked: darker glossy ground, puddles with rain rings, little splashes where drops land,
// and headlights that smear across the wet road. Velocity is a magnet planet, so every car floats on a
// glowing field, and the rain slides off that field and runs off the bodywork.
let velSplash = null; // set below; the rain in velstorm.js calls it where a drop lands
{
  const on = () => LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly;
  let gradTex = null;
  const velGrad = () => gradTex || (gradTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })());
  const addMat = (col, op) => new THREE.MeshBasicMaterial({ map: velGrad(), color: new THREE.Color(col), transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const flat = (w, h, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.x = -Math.PI / 2; return m; };
  const W = { puddles: [], rings: [], ri: 0, splash: null, glows: new Map(), shed: null, wet: false };

  // ---- the soaked ground ----
  function wetGround() {
    levelGroup.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && o.material.isMeshPhongMaterial && o.material.vertexColors) {
      o.material.color.set('#666d79'); o.material.shininess = 140; o.material.specular.set('#8a9ab4'); o.material.needsUpdate = true; } });
    W.puddles = []; const S = (LEVEL.size || 400) * 0.45, pm = new THREE.MeshPhongMaterial({ color: '#0a0d14', shininess: 160, specular: new THREE.Color('#a8b8d8'), transparent: true, opacity: 0.82, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (let i = 0; i < 140; i++) { const x = WORLD_C.x + (Math.random() - 0.5) * 2 * S, z = WORLD_C.z + (Math.random() - 0.5) * 2 * S; if (Math.abs(x - VCITY.x) < VCITY.hx + 3 && Math.abs(z - VCITY.z) < VCITY.hz + 3) continue;
      const r = 1.2 + Math.random() * 3.2, m = new THREE.Mesh(new THREE.CircleGeometry(1, 14), pm); m.rotation.x = -Math.PI / 2; m.scale.set(r * (0.6 + Math.random() * 0.8), r * (0.6 + Math.random() * 0.8), 1); m.rotation.z = Math.random() * 6.28;
      m.position.set(x, groundH(x, z) + 0.025, z); levelGroup.add(m); W.puddles.push([x, z, r * 0.6, m.position.y, m, r]); }
    W.pudT = 0;
    // rain rings in the puddles
    W.rings = []; for (let i = 0; i < 70; i++) { const m = flat(1, 1, new THREE.MeshBasicMaterial({ color: '#c8d8f0', transparent: true, opacity: 0, depthWrite: false })); m.geometry = new THREE.RingGeometry(0.82, 1, 16); m.geometry.rotateX(-Math.PI / 2); m.rotation.x = 0; m.visible = false; levelGroup.add(m); W.rings.push({ m, t: 1 }); }
    // splashes where drops land
    const N = 260, pos = new Float32Array(N * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); for (let i = 0; i < N; i++) pos[i * 3 + 1] = -999;
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, map: velGrad(), color: '#dbe6ff', transparent: true, opacity: 0.7, depthWrite: false })); pts.frustumCulled = false; levelGroup.add(pts);
    W.splash = { pts, N, i: 0, v: Array.from({ length: N }, () => [0, 0, 0, 0]) };
    // water running off the cars
    const M = 320, sp = new Float32Array(M * 3), sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); for (let i = 0; i < M; i++) sp[i * 3 + 1] = -999;
    const sh = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.07, map: velGrad(), color: '#cfe0ff', transparent: true, opacity: 0.8, depthWrite: false })); sh.frustumCulled = false; levelGroup.add(sh);
    W.shed = { pts: sh, N: M, i: 0, v: Array.from({ length: M }, () => [0, 0, 0, 0]), acc: new Map() };
    W.glows = new Map(); W.wet = true;
  }
  velSplash = function (x, y, z) { const S2 = W.splash; if (!S2 || Math.random() < 0.55) return; const pos = S2.pts.geometry.attributes.position.array;
    for (let k = 0; k < 2; k++) { const i = S2.i = (S2.i + 1) % S2.N; pos.set([x, y + 0.03, z], i * 3); const a = Math.random() * 6.28, s = 0.6 + Math.random() * 0.9; S2.v[i] = [Math.cos(a) * s, 1.2 + Math.random() * 1.3, Math.sin(a) * s, 0.22]; }
    // a ring if it landed in a puddle
    for (const p of W.puddles) { if (Math.abs(x - p[0]) < p[2] && Math.abs(z - p[1]) < p[2]) { const R = W.rings[W.ri = (W.ri + 1) % W.rings.length]; R.m.position.set(x, p[3] + 0.01, z); R.t = 0; R.m.visible = true; break; } } };
  function stepParticles(S2, dt, grav) { if (!S2) return; const pos = S2.pts.geometry.attributes.position.array; for (let i = 0; i < S2.N; i++) { const v = S2.v[i]; if (v[3] <= 0) { if (pos[i * 3 + 1] > -900) pos[i * 3 + 1] = -999; continue; } v[3] -= dt; v[1] -= grav * dt; pos[i * 3] += v[0] * dt; pos[i * 3 + 1] += v[1] * dt; pos[i * 3 + 2] += v[2] * dt; } S2.pts.geometry.attributes.position.needsUpdate = true; }

  // ---- each car: a magnet glow on the ground under it, a pulsing field ring, and wet-road light smears ----
  function carGlow(key) { let G = W.glows.get(key); if (G) return G; G = new THREE.Group();
    const pad = flat(3.4, 5.2, addMat('#4fb8ff', 0.55)); G.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.03, 4, 28), new THREE.MeshBasicMaterial({ color: '#8fd8ff', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.6, 1); G.add(ring);
    const head = flat(3.2, 13, addMat('#fff0d0', 0.22)); head.position.z = 8.2; G.add(head); // headlights smeared down the wet road
    const tail = flat(2.2, 5, addMat('#ff3040', 0.2)); tail.position.z = -4.4; G.add(tail);
    levelGroup.add(G); G.userData = { pad, ring, head, tail }; W.glows.set(key, G); return G; }
  function placeGlow(key, obj, yaw, sp, t) { const G = carGlow(key), p = obj.position, g = floorAt(p.x, p.z), u = G.userData;
    G.visible = obj.visible !== false && !!obj.parent; if (!G.visible) return; G.position.set(p.x, g + 0.04, p.z); G.rotation.y = yaw;
    const k = 0.75 + Math.sin(t * 7 + p.x) * 0.25; u.pad.material.opacity = 0.42 * k; const h = (p.y - g); u.ring.position.y = (h * ((t * 1.6 + p.z * 0.1) % 1)); u.ring.material.opacity = 0.45 * (1 - u.ring.position.y / Math.max(0.1, h));
    u.head.material.opacity = 0.18 + Math.min(0.12, sp * 0.004); }
  function shedFrom(key, obj, vx, vz, rate, dt) { const S2 = W.shed; if (!S2 || !obj || !obj.parent || obj.visible === false) return; let a = (S2.acc.get(key) || 0) + rate * dt;
    const pos = S2.pts.geometry.attributes.position.array, ry = obj.rotation.y, c = Math.cos(ry), s = Math.sin(ry);
    while (a >= 1) { a -= 1; const i = S2.i = (S2.i + 1) % S2.N, side = Math.random() < 0.5 ? -1 : 1, lz = (Math.random() - 0.5) * 3.6, lx = side * (0.85 + Math.random() * 0.1);
      const wx = obj.position.x + lx * c + lz * s, wz = obj.position.z - lx * s + lz * c; pos.set([wx, obj.position.y + 0.45 + Math.random() * 0.25, wz], i * 3);
      const ox = side * c, oz = -side * s; S2.v[i] = [vx * 0.85 + ox * (0.8 + Math.random()), 0.2, vz * 0.85 + oz * (0.8 + Math.random()), 0.5]; }
    S2.acc.set(key, a); }

  { const _b = LEVELS.speedway.build; LEVELS.speedway.build = function () { const r = _b.apply(this, arguments); W.wet = false; try { wetGround(); } catch (e) { console.warn('wet', e); } return r; }; }
  { const _st = step; step = function (dt) { _st(dt); if (!on() || !W.wet) return; const t = gameTime, sh = VEL.shields || (VEL.shields = []); sh.length = 0;
    // your car (driving or parked)
    const mine = VEL.hyper ? null : RC.on ? VEL.carObj : VEL.parked;
    if (mine && mine.parent && mine.visible !== false) { const sp = RC.on ? Math.hypot(RC.vx || 0, RC.vz || 0) : 0; placeGlow('me', mine, RC.on ? player.yaw + Math.PI : mine.rotation.y, sp, t); sh.push([mine.position.x, mine.position.y, mine.position.z]);
      shedFrom('me', mine, RC.on ? RC.vx || 0 : 0, RC.on ? RC.vz || 0 : 0, 26 + sp * 1.4, dt); } else { const G = W.glows.get('me'); if (G) G.visible = false; }
    // traffic
    VEL.traffic.forEach((T, i) => { const o = T.obj, near = Math.hypot(o.position.x - player.pos.x, o.position.z - player.pos.z) < 70; placeGlow('t' + i, o, o.rotation.y, T.sp, t);
      if (near) { sh.push([o.position.x, o.position.y, o.position.z]); const f = T.dir; shedFrom('t' + i, o, Math.sin(o.rotation.y) * T.sp * 0.6, Math.cos(o.rotation.y) * T.sp * 0.6, 14, dt); } });
    stepParticles(W.splash, dt, 9); stepParticles(W.shed, dt, 7);
    for (const R of W.rings) { if (!R.m.visible) continue; R.t += dt * 1.8; const k = 0.08 + R.t * 0.55; R.m.scale.set(k, 1, k); R.m.material.opacity = Math.max(0, 0.55 * (1 - R.t)); if (R.t >= 1) R.m.visible = false; }
    // a light patter: random rings in nearby puddles even when no streak lands there
    if ((W.pudT -= dt) < 0) { W.pudT = 0.25; const px = player.pos.x, pz = player.pos.z, fy = player.yaw || 0;
      for (let k = 0; k < 4; k++) { const p = W.puddles[(Math.random() * W.puddles.length) | 0]; if (!p || Math.hypot(p[0] - px, p[1] - pz) < 90) continue;
        const a = fy + (Math.random() - 0.5) * 2.6, d = 25 + Math.random() * 55, x = px - Math.sin(a) * d, z = pz - Math.cos(a) * d; if (Math.abs(x - VCITY.x) < VCITY.hx + 3 && Math.abs(z - VCITY.z) < VCITY.hz + 3) continue;
        const y = groundH(x, z); if (Math.abs(floorAt(x, z) - y) > 0.2) continue; p[0] = x; p[1] = z; p[3] = y + 0.025; p[4].position.set(x, p[3], z); } }
    for (let k = 0; k < 3; k++) { const p = W.puddles[(Math.random() * W.puddles.length) | 0]; if (!p || Math.hypot(p[0] - player.pos.x, p[1] - player.pos.z) > 45) continue; const R = W.rings[W.ri = (W.ri + 1) % W.rings.length]; R.m.position.set(p[0] + (Math.random() - 0.5) * p[2] * 1.4, p[3] + 0.01, p[1] + (Math.random() - 0.5) * p[2] * 1.4); R.t = 0; R.m.visible = true; }
  }; }
}
