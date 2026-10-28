// =================== THE VOLCANO FORGE (2.23.64): Capitone's volcano is a dungeon now ===================
// A Drome tunnel cuts into the cone. It opens on a cavern with a huge lava pit, and Commander Vask stands on a basalt island
// in the middle. Four magma lifters around him rip globs of lava out of the pit and hurl them at you. Every throw is called
// out first: a red circle on the ground fills up, and when it is full the lava lands. Keep moving.
const VC = { mouth: null, globs: [], puddles: [], thr: 3, chan: [] };
const VC_RP = 8.6, VC_RC = 21;   // pit radius, cavern radius

// Vask's pit version: he holds the island and fights with the lifters, so he never walks and his own bolts come slower
ENEMY.vaskpit = Object.assign({}, ENEMY.vask, { speed: 0.001, ranged: Object.assign({}, ENEMY.vask.ranged, { rate: 2.4, range: 26, keep: 1 }) });
if (typeof BOSS_INTRO !== 'undefined') BOSS_INTRO.vaskpit = BOSS_INTRO.vask;
AMB_PROFILES.volcave = { bed: [['lowpass', 150, 0.9, 0.07, 0.06, 0.5]], hum: [[31, 0.05], [46.5, 0.015]], ev: [['groan', 6, 13, 0.7], ['creak', 9, 18, 0.4]] };

LEVELS.volcave = {
  id: 'volcave', name: 'The Volcano Forge', tag: 'Inside the Volcano Base, Capitone', lvls: 'Lv 26–30', size: 70, center: [0, 6], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#1c1416' }, paths: [], river: [], pools: [], lava: [],
  zones: [{ id: 'forge', name: 'The Forge', lvl: 'Lv 26–30', x: 0, z: 0, r: VC_RC, col: '#2a1612', h: 0 }, { id: 'vtunnel', name: 'Drome Tunnel', lvl: 'Lv 26', x: 0, z: 27, r: 6, col: '#1c1416', h: 0 }],
  safes: [{ x: 0, z: 33, r: 2.2 }], spawn: { x: 0, z: 33, yaw: 0 }, menu: { x: 0, z: 33, r: 2, h: 2.6 }, npcBase: [0, 33], npcs: [],
  spawns: [{ zone: 'forge', type: 'vaskpit', n: 1, lv: [30, 30], at: [0, 0] }, { zone: 'vtunnel', type: 'guard', n: 2, lv: [26, 27], at: [0, -1] }, { zone: 'forge', type: 'magmagopel', n: 2, lv: [27, 28], at: [-14, 6] }],
  build() {
    VC.globs.length = 0; VC.puddles.length = 0; VC.thr = 3; VC.px = null; VC.vx = VC.vz = 0; VC.fx = new THREE.Group(); levelGroup.add(VC.fx);
    const basalt = toon('#2a2326', 'stone'), basalt2 = toon('#1e191b', 'stone'), crust = toon('#3a2a26', 'stone'), metal = toon('#26232a', 'panel'), red = glow('#ff2a3a'),
      lavaM = new THREE.MeshBasicMaterial({ map: TEX.lava, color: new THREE.Color('#ffffff') }), hot = glow('#ff6a1a'), amber = glow('#ffb347');
    // ---- the cavern floor, the pit and the island ----
    { const fl = new THREE.Mesh(new THREE.RingGeometry(VC_RP + 0.3, VC_RC + 2, 64, 1), basalt); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; props.add(fl);
      const lv = new THREE.Mesh(new THREE.CircleGeometry(VC_RP + 0.4, 64), lavaM); lv.rotation.x = -Math.PI / 2; lv.position.y = -0.35; levelGroup.add(lv); VC.lava = lv;
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(VC_RP + 0.3, VC_RP + 0.3, 0.4, 64, 1, true), basalt2); wall.material = basalt2; wall.position.y = -0.18; props.add(wall);
      // a cooled crust rim with glowing cracks
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2 + Math.sin(i * 7.1) * 0.04, r = VC_RP + 0.15 + Math.sin(i * 3.3) * 0.12;
        part(props, B(1.5, 0.28 + (i % 3) * 0.08, 0.7), i % 2 ? crust : basalt, Math.cos(a) * r, 0.1, Math.sin(a) * r, 0, -a + Math.PI / 2);
        if (i % 4 === 1) part(props, B(0.5, 0.04, 0.08), hot, Math.cos(a) * (r + 0.3), 0.27, Math.sin(a) * (r + 0.3), 0, -a + 0.3); }
      // the island, and the four Drome magma lifters Vask uses to throw the lava
      part(props, Cy(3.0, 3.5, 0.7, 12), basalt2, 0, -0.25, 0); part(props, Cy(2.7, 3.0, 0.1, 12), crust, 0, 0.12, 0);
      VC.pyl = [];
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4, x = Math.cos(a) * 2.35, z = Math.sin(a) * 2.35;
        part(props, B(0.6, 0.4, 0.6), metal, x, 0.3, z, 0, -a); part(props, Cy(0.14, 0.2, 2.4, 8), metal, x, 1.6, z); part(props, B(0.05, 1.8, 0.2), red, x * 1.06, 1.4, z * 1.06, 0, -a);
        const coil = part(levelGroup, new THREE.TorusGeometry(0.28, 0.07, 6, 14), hot, x, 2.85, z, Math.PI / 2); VC.pyl.push(coil); }
    }
    // ---- the cave: leaning basalt walls, hex columns, a dome of rock, stalactites ----
    for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2, d = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)); if (Math.abs(d) < 0.15) continue;   // leave the tunnel mouth open
      const r = VC_RC + 1.2 + Math.sin(i * 2.7) * 0.6, h = 12 + Math.sin(i * 1.9) * 3;
      part(props, B(3.4, h, 2.2), i % 2 ? basalt : basalt2, Math.cos(a) * r, h / 2 - 0.5, Math.sin(a) * r, 0.12 * Math.sin(i), -a + Math.PI / 2, -0.14); }
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + 0.11, d = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)); if (Math.abs(d) < 0.3) continue;
      const r = VC_RC - 0.6 - (i % 3) * 0.5, h = 1.2 + ((i * 37) % 7) * 0.7; part(props, Cy(0.7, 0.75, h, 6), i % 3 ? basalt2 : crust, Math.cos(a) * r, h / 2, Math.sin(a) * r); solid(Math.cos(a) * r, Math.sin(a) * r, 0.75); }
    { const dome = new THREE.Mesh(new THREE.SphereGeometry(VC_RC + 3, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), basalt2.clone()); dome.material.side = THREE.BackSide; dome.scale.y = 0.62; dome.position.y = 6; props.add(dome); }
    for (let i = 0; i < 34; i++) { const a = i * 2.39996, r = 3 + Math.sqrt(i / 34) * (VC_RC - 4), l = 1.2 + ((i * 53) % 9) * 0.35, y = 6 + (VC_RC + 3) * 0.62 * Math.sqrt(Math.max(0, 1 - (r / (VC_RC + 3)) ** 2)) - 0.3;
      part(props, new THREE.ConeGeometry(0.35 + l * 0.12, l, 6), basalt, Math.cos(a) * r, y - l / 2, Math.sin(a) * r, Math.PI); }
    // ---- a lava fall at the back wall, feeding a channel into the pit (cross it on the grate) ----
    { const fallTex = TEX.lava.clone(); fallTex.wrapS = fallTex.wrapT = THREE.RepeatWrapping; fallTex.repeat.set(1, 3); fallTex.needsUpdate = true; VC.fallTex = fallTex;
      const fall = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 13), new THREE.MeshBasicMaterial({ map: fallTex })); fall.position.set(0, 6, -VC_RC + 0.4); levelGroup.add(fall);
      part(props, B(4.4, 0.6, 2.4), crust, 0, 0.3, -VC_RC + 1.2);
      const ch = new THREE.Mesh(new THREE.PlaneGeometry(2, VC_RC - VC_RP - 0.6), lavaM); ch.rotation.x = -Math.PI / 2; ch.position.set(0, 0.03, -(VC_RC + VC_RP) / 2 - 0.1); levelGroup.add(ch);
      for (const s of [-1, 1]) part(props, B(0.5, 0.35, VC_RC - VC_RP - 0.6), crust, s * 1.25, 0.17, -(VC_RC + VC_RP) / 2 - 0.1);
      const gz = -15; part(props, B(2.8, 0.12, 2.2), metal, 0, 0.42, gz); for (let k = 0; k < 5; k++) part(props, B(2.8, 0.06, 0.12), toon('#5a5560', 'panel'), 0, 0.5, gz - 0.9 + k * 0.45); for (const s of [-1, 1]) part(props, B(0.1, 0.9, 2.2), red, s * 1.4, 0.9, gz);
      VC.chan = [[0, -VC_RP - 1.6], [0, -12.4], [0, -17.6], [0, -19.6]]; }
    // ---- Drome kit: the tunnel, a gantry over the pit, crates, consoles, warning lights ----
    { const T0 = VC_RC - 0.5, T1 = 35;
      const tf = new THREE.Mesh(new THREE.PlaneGeometry(5.6, T1 - T0 + 1), toon('#1a1719', 'panel')); tf.rotation.x = -Math.PI / 2; tf.position.set(0, 0.02, (T0 + T1) / 2); props.add(tf);
      for (const s of [-1, 1]) { part(props, B(0.6, 4.4, T1 - T0 + 1), metal, s * 3.1, 2.2, (T0 + T1) / 2); box(s * 3.1, (T0 + T1) / 2, 0.3, (T1 - T0) / 2 + 0.5);
        for (let z = T0 + 1; z < T1; z += 3.2) { part(props, B(0.1, 0.12, 1.6), red, s * 2.78, 3.6, z); part(props, B(0.25, 4.4, 0.3), basalt2, s * 2.8, 2.2, z + 1.6); } }
      part(props, B(6.8, 0.6, T1 - T0 + 1), metal, 0, 4.6, (T0 + T1) / 2);
      part(props, B(6.8, 4.6, 0.5), metal, 0, 2.3, T1 + 0.3); box(0, T1 + 0.3, 3.4, 0.3);
      // the way out
      part(props, B(2.4, 3, 0.1), toon('#3a3640', 'panel'), 0, 1.5, T1); part(props, B(2.6, 0.18, 0.12), red, 0, 3.1, T1 - 0.05);
      INTERACTS.push({ x: 0, z: T1 - 1.3, r: 2.2, label: 'Leave the volcano', fn: () => leaveVolcano() });
      // hazard frame where the tunnel meets the cave
      for (const s of [-1, 1]) part(props, B(0.7, 5.2, 0.7), metal, s * 3.2, 2.6, T0); part(props, B(7.1, 0.7, 0.7), metal, 0, 5.1, T0);
      for (let k = 0; k < 6; k++) part(props, B(1.1, 0.16, 0.05), k % 2 ? toon('#f0c020', 'panel') : toon('#141214', 'panel'), -2.75 + k * 1.1, 4.85, T0 - 0.37, 0, 0, 0.6);
      // gantry crane across the pit, with a hook hanging over Vask
      for (const s of [-1, 1]) { part(props, B(0.5, 9, 0.5), metal, s * (VC_RC - 2.4), 4.5, -3); part(props, B(0.12, 0.6, 0.12), red, s * (VC_RC - 2.4), 8.4, -2.7); solid(s * (VC_RC - 2.4), -3, 0.4); }
      part(props, B(2 * (VC_RC - 2.4) + 0.5, 0.6, 0.8), metal, 0, 9.1, -3); part(props, B(1.2, 0.5, 1.2), metal, 0.8, 8.6, -3); part(props, Cy(0.03, 0.03, 4, 4), toon('#7a7680', 'panel'), 0.8, 6.4, -3); part(props, new THREE.TorusGeometry(0.3, 0.07, 5, 10, Math.PI * 1.4), toon('#7a7680', 'panel'), 0.8, 4.2, -3);
      // supply crates and a console by the tunnel
      for (const [x, z, s] of [[-9, 15, 1.2], [-10.4, 13.8, 0.9], [-8.6, 13.4, 0.8], [10.5, 14, 1.1], [11.6, 12.6, 0.8]]) { part(props, B(s, s, s), toon('#3a3238', 'panel'), x, s / 2, z, 0, x * 0.3); part(props, B(s * 1.01, s * 0.12, s * 1.01), red, x, s * 0.7, z, 0, x * 0.3); box(x, z, s / 2, s / 2); }
      part(props, B(1.6, 1.1, 0.7), metal, 6.5, 0.55, 17.3, 0, -0.5); part(props, B(1.3, 0.5, 0.05), glow('#ff6a3a'), 6.5, 1.25, 17.0, -0.4, -0.5); box(6.5, 17.3, 0.8, 0.4);
      for (const [x, z] of [[-14, -11], [14, -11], [-17, 4], [17, 4]]) { part(props, Cy(0.35, 0.4, 1.0, 10), toon('#4a2a22', 'panel'), x, 0.5, z); part(props, Cy(0.36, 0.36, 0.08, 10), hot, x, 0.85, z); solid(x, z, 0.45); }
    }
    // ---- light: the pit glows up into everything, and a red alarm by the door ----
    { const pl = new THREE.PointLight(0xff6a1a, 2.2, 46, 1.4); pl.position.set(0, 3.5, 0); levelGroup.add(pl); VC.pitL = pl;
      const fl = new THREE.PointLight(0xff4a10, 1.4, 22, 1.6); fl.position.set(0, 3, -VC_RC + 3); levelGroup.add(fl);
      const dl = new THREE.PointLight(0xff2a3a, 0.8, 16, 1.6); dl.position.set(0, 3.6, VC_RC + 3); levelGroup.add(dl); }
    // ---- embers drifting up out of the pit ----
    { const n = 160, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), sd = []; for (let i = 0; i < n; i++) { sd.push([Math.random() * 6.28, Math.sqrt(Math.random()) * (VC_RP + 4), Math.random() * 14, 0.6 + Math.random()]); }
      g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      const em = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffa040, size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); em.frustumCulled = false; levelGroup.add(em);
      levelAnims.push(t => { for (let i = 0; i < n; i++) { const s = sd[i], y = (s[2] + t * s[3]) % 14, a = s[0] + t * 0.1; p[i * 3] = Math.cos(a) * s[1] + Math.sin(t + i) * 0.3; p[i * 3 + 1] = y; p[i * 3 + 2] = Math.sin(a) * s[1]; } g.attributes.position.needsUpdate = true; }); }
    let last = 0; levelAnims.push(t => { if (LEVEL.id !== 'volcave') return; const dt = Math.min(0.1, t - last || 0.016); last = t; vcTick(t, dt); });
  }
};

// ---- getting in and out ----
function enterVolcano() { SFX.door(); travel('volcave'); }
function leaveVolcano() { SFX.door(); const m = VC.mouth; travel('capitone', m ? { at: { x: m.ox, z: m.oz, yaw: m.oyaw } } : undefined); }

// ---- the fight ----
const _vcGeo = { disc: new THREE.CircleGeometry(1, 40), ring: new THREE.RingGeometry(0.93, 1, 48), glob: new THREE.IcosahedronGeometry(0.55, 1) };
function vcBoss() { return enemies.find(e => e.sp.type === 'vaskpit'); }
function vcThrow(B) {
  const f = B.hp / B.max, n = f > 0.6 ? 1 : f > 0.3 ? 2 : 3;
  for (let i = 0; i < n + 1; i++) {
    // the first one leads you, the rest land around you
    let tx = player.pos.x, tz = player.pos.z; if (i === 0) { tx += VC.vx * 1.4; tz += VC.vz * 1.4; } else { const a = Math.random() * 6.28, r = 2.8 + Math.random() * 3.2; tx += Math.cos(a) * r; tz += Math.sin(a) * r; }
    const d = Math.hypot(tx, tz) || 1, cd = clamp(d, VC_RP + 1.4, VC_RC - 1.5); tx = tx / d * cd; tz = tz / d * cd;
    const R = 2.2 + (n - 1) * 0.15, delay = i * 0.35;
    // the warning circle: a faint red disc, a hard red edge, and a fill that grows to the edge as the lava comes down
    const w = new THREE.Group(); w.position.set(tx, 0.05, tz); w.rotation.x = -Math.PI / 2; w.scale.setScalar(R);
    const mk = (geo, op) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); w.add(m); return m; };
    const base = mk(_vcGeo.disc, 0.22), edge = mk(_vcGeo.ring, 0.9), fill = mk(_vcGeo.disc, 0.34); fill.scale.setScalar(0.01);
    VC.fx.add(w);
    // the glob comes up out of the pit next to the island
    const a0 = Math.atan2(tz, tx) + (Math.random() - 0.5) * 0.8, src = V(Math.cos(a0) * 4.6, -0.3, Math.sin(a0) * 4.6);
    const g = new THREE.Mesh(_vcGeo.glob, glow('#ff7a1a')); const core = new THREE.Mesh(_vcGeo.glob, glow('#ffe08a')); core.scale.setScalar(0.6); g.add(core);
    const halo = glowSprite('#ff6a1a', 3.2); g.add(halo); g.position.copy(src); VC.fx.add(g);
    const beams = VC.pyl.map(c => { const geo = new THREE.BufferGeometry().setFromPoints([c.position.clone(), src.clone()]); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })); VC.fx.add(l); return l; });
    VC.globs.push({ w, edge, fill, base, g, beams, src, hov: V(src.x * 0.85, 3.4 + i * 0.4, src.z * 0.85), tgt: V(tx, 0, tz), R, t: -delay, up: 1.0, fly: 1.05 });
  }
}
function vcTick(t, dt) {
  // the pit and channels: you can't walk into them, and standing in the channel burns
  // your running speed, smoothed, so the first glob can lead you
  if (VC.px != null && dt > 0) { VC.vx += ((player.pos.x - VC.px) / dt - VC.vx) * Math.min(1, dt * 4); VC.vz += ((player.pos.z - VC.pz) / dt - VC.vz) * Math.min(1, dt * 4); } VC.px = player.pos.x; VC.pz = player.pos.z;
  const pd = Math.hypot(player.pos.x, player.pos.z);
  if (pd < VC_RP + 0.45) { const k = (VC_RP + 0.45) / (pd || 1); player.pos.x *= k; player.pos.z *= k; }
  if (Math.abs(player.pos.x) < 1.05 && player.pos.z < -VC_RP - 0.6 && player.pos.z > -VC_RC + 0.5 && Math.abs(player.pos.z + 15) > 1.15) hurt(22 * dt, false);
  for (const e of enemies) if (!e.dead && e.sp.type !== 'vaskpit') { const o = e.obj.position, d = Math.hypot(o.x, o.z); if (d < VC_RP + 0.6) { const k = (VC_RP + 0.6) / (d || 1); o.x *= k; o.z *= k; } }
  if (VC.fallTex) VC.fallTex.offset.y = (t * 0.6) % 1;
  if (VC.pitL) VC.pitL.intensity = 2.0 + Math.sin(t * 2.3) * 0.25 + Math.sin(t * 5.7) * 0.12;
  const B = vcBoss();
  if (B && !B.dead) {
    B.obj.position.set(0, 0.17, 0);
    const inCave = pd < VC_RC + 1 && player.alive;
    if (inCave && !B.aggro) B.aggro = true;
    const lift = VC.globs.some(G => G.t < G.up);
    const R = B.obj.userData.rig; if (R && R.armL && lift) { R.armL.rotation.x = -2.6; R.armR.rotation.x = -2.6; }
    if (inCave && B.aggro && !dlgOpen && state === 'play') { VC.thr -= dt; if (VC.thr <= 0) { const f = B.hp / B.max; VC.thr = f > 0.6 ? 4.2 : f > 0.3 ? 3.4 : 2.7; vcThrow(B); } }
    VC.pyl.forEach((c, i) => { c.rotation.z = t * (lift ? 9 : 2) + i; c.scale.setScalar(lift ? 1.25 + Math.sin(t * 20 + i) * 0.1 : 1); });
  }
  // the globs: rise out of the pit, hang, then arc down onto their circle
  for (let i = VC.globs.length - 1; i >= 0; i--) { const G = VC.globs[i]; G.t += dt;
    const total = G.up + G.fly, k = clamp(G.t / total, 0, 1); G.fill.scale.setScalar(Math.max(0.01, k)); G.edge.material.opacity = 0.6 + 0.35 * Math.abs(Math.sin(t * (6 + k * 10)));
    if (G.t < 0) { G.g.visible = false; G.beams.forEach(l => l.visible = false); continue; }
    G.g.visible = true; G.g.rotation.set(t * 3, t * 2, 0);
    if (G.t < G.up) { const u = G.t / G.up, e = 1 - (1 - u) ** 3; G.g.position.lerpVectors(G.src, G.hov, e); G.g.position.y += Math.sin(t * 9) * 0.08 * u; G.g.scale.setScalar(0.4 + 0.6 * e);
      G.beams.forEach((l, j) => { l.visible = true; const a = l.geometry.attributes.position.array; a[3] = G.g.position.x; a[4] = G.g.position.y; a[5] = G.g.position.z; l.geometry.attributes.position.needsUpdate = true; l.material.opacity = 0.5 + 0.4 * Math.random(); }); }
    else { G.beams.forEach(l => l.visible = false); const u = clamp((G.t - G.up) / G.fly, 0, 1); G.g.position.lerpVectors(G.hov, G.tgt, u); G.g.position.y += Math.sin(u * Math.PI) * 5.5 - u * 0; G.g.scale.setScalar(1 + u * 0.3); }
    if (G.t >= total) { vcLand(G); VC.fx.remove(G.w, G.g, ...G.beams); VC.globs.splice(i, 1); } }
  // puddles cool and fade, and burn while they're hot
  for (let i = VC.puddles.length - 1; i >= 0; i--) { const P = VC.puddles[i]; P.t += dt; const k = 1 - P.t / 3.2;
    P.m.material.opacity = Math.max(0, k); if (k > 0.25 && Math.hypot(player.pos.x - P.x, player.pos.z - P.z) < P.r * 0.85 && player.pos.y < 0.6) hurt(14 * dt, false);
    if (k <= 0) { VC.fx.remove(P.m); P.m.material.dispose(); VC.puddles.splice(i, 1); } }
}
function vcLand(G) {
  const p = G.tgt; burst(V(p.x, 0.4, p.z), '#ff6a1a', 26, 8); burst(V(p.x, 0.4, p.z), '#ffd36a', 10, 5);
  if (SFX.boom) SFX.boom(); const d = Math.hypot(player.pos.x - p.x, player.pos.z - p.z); if (d < 9 && typeof shake === 'function') shake(0.45 * (1 - d / 9) + 0.1);
  if (d < G.R && player.pos.y < 1.6) { hurt(36, false); toast('🔥', 'Burned by lava', 1.2); }
  const m = new THREE.Mesh(_vcGeo.disc, new THREE.MeshBasicMaterial({ map: TEX.lava, transparent: true, opacity: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.06, p.z); m.scale.setScalar(G.R * 0.75); VC.fx.add(m); VC.puddles.push({ m, x: p.x, z: p.z, r: G.R * 0.75, t: 0 });
}

// ---- the volcano itself on Capitone: a Drome blast door in the cone, and the trees kept clear of it ----
{ const L = LEVELS.capitone; L.spawns = L.spawns.filter(s => s.type !== 'vask');
  const _b = L.build; L.build = function () { _b.call(this);
    const cx = Z.volcano.x, cz = Z.volcano.z, gy = groundH(cx, cz), ox = cx - 3, oz = cz - 6, gate = Math.atan2(64 - cz, -34 - cx);
    const gx = cx + Math.cos(gate) * 13, gz = cz + Math.sin(gate) * 13, dl = Math.hypot(gx - ox, gz - oz), dx = (gx - ox) / dl, dz = (gz - oz) / dl, ry = Math.atan2(dx, dz);
    const g = new THREE.Group(); g.position.set(ox + dx * 5.9, gy, oz + dz * 5.9); g.rotation.y = ry; props.add(g);
    const metal = toon('#26232a', 'panel'), red = glow('#ff2a3a');
    part(g, B(4.6, 4.2, 3.4), metal, 0, 2.1, -0.6); part(g, B(3.0, 3.0, 0.2), toon('#0a0808', 'panel'), 0, 1.5, 1.12);
    part(g, B(2.9, 0.5, 0.1), glow('#ff6a1a'), 0, 0.25, 1.0); part(g, B(4.7, 0.25, 0.1), red, 0, 3.75, 1.16);
    for (const s of [-1, 1]) { part(g, B(0.2, 3.2, 0.12), red, s * 1.75, 1.6, 1.16); part(g, B(0.7, 4.6, 0.7), toon('#1e1b20', 'panel'), s * 2.45, 2.3, 0.9); }
    for (let k = 0; k < 5; k++) part(g, B(0.9, 0.16, 0.05), k % 2 ? toon('#f0c020', 'panel') : toon('#141214', 'panel'), -1.8 + k * 0.9, 4.0, 1.18, 0, 0, 0.6);
    const sp = glowSprite('#ff6a1a', 4); sp.position.set(0, 1.0, 0.9); g.add(sp);
    const ix = ox + dx * 8, iz = oz + dz * 8; INTERACTS.push({ x: ix, z: iz, r: 2.6, label: '🌋 Enter the volcano', fn: () => enterVolcano() });
    VC.mouth = { ox: ox + dx * 10, oz: oz + dz * 10, oyaw: Math.atan2(-dx, -dz) };
  };
}

// ---- the cave's light: a dark red cave, not starlit space ----
{ const _ue = updateEnv; updateEnv = function (dt, t) { _ue(dt, t); if (!LEVEL || LEVEL.id !== 'volcave') { if (VC.starsOff) { VC.starsOff = 0; stars.visible = true; } return; }
  hemi.color.set('#ff7a4a'); hemi.intensity = 0.42; sun.color.set('#ff8a50'); sun.intensity = 0.25; fill.intensity = 0.12;
  scene.fog.color.set('#1e0a06'); scene.fog.near = 22; scene.fog.far = 80; stars.visible = false; VC.starsOff = 1; }; }
