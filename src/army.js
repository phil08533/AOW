// =================== FORT IRONROCK: the asteroid army base (vehicle training, research, army shop) ===================
function makeTrainingDrone() {
  const g = new THREE.Group();
  const b = new THREE.Group();
  b.position.y = 1.4;
  g.add(b);

  const hullDk = '#23262d';
  const targetRed = '#c83b2b';
  const targetWhite = '#f0f2f5';
  const steelCol = '#4e5564';
  const rotorGlow = glow('#5ce1e6');
  const eyeGlow = glow('#ffe066');

  // 1. Thick Layered Target Body Core (Faces forward +Z, no yellow barrel)
  // Outer red tier
  part(b, Cy(0.44, 0.44, 0.20, 14), targetRed, 0, 0, 0, Math.PI / 2);
  part(b, new THREE.TorusGeometry(0.44, 0.028, 4, 16), hullDk, 0, 0, 0); // Protective outer rim

  // Middle white tier
  part(b, Cy(0.31, 0.31, 0.24, 12), targetWhite, 0, 0, 0.02, Math.PI / 2);

  // Inner red bullseye tier
  part(b, Cy(0.18, 0.18, 0.28, 10), targetRed, 0, 0, 0.04, Math.PI / 2);

  // Center optical sensor lens
  part(b, new THREE.SphereGeometry(0.07, 8, 8), eyeGlow, 0, 0, 0.18);
  part(b, new THREE.TorusGeometry(0.075, 0.016, 4, 10), hullDk, 0, 0, 0.18);

  // Rear propulsion pack
  part(b, B(0.24, 0.20, 0.14), hullDk, 0, 0, -0.14);
  part(b, Cy(0.08, 0.05, 0.08, 8), steelCol, 0, 0, -0.22, Math.PI / 2);
  part(b, new THREE.OctahedronGeometry(0.04, 0), glow('#ff7a36'), 0, 0, -0.26);

  // 2. Outrigger Rotor Nacelles & High-Speed Blades
  const rotors = [];
  for (const s of [-1, 1]) {
    // Structural arm
    chain(b, [
      [0.22 * s, 0, 0],
      [0.46 * s, 0.08, 0],
      [0.70 * s, 0.10, 0]
    ], 0.038, hullDk, 0.026, true);

    // Motor pod
    part(b, Cy(0.07, 0.06, 0.14, 8), steelCol, 0.72 * s, 0.10, 0);
    part(b, new THREE.OctahedronGeometry(0.03, 0), rotorGlow, 0.72 * s, 0.02, 0);

    // Spinning rotor blade assembly
    const r = new THREE.Group();
    r.position.set(0.72 * s, 0.18, 0);
    b.add(r);
    rotors.push({ r, dir: s });

    part(r, B(0.38, 0.012, 0.04), '#2a2e36', 0, 0, 0);
    part(r, B(0.04, 0.012, 0.38), '#2a2e36', 0, 0, 0);
    part(r, Cy(0.025, 0.025, 0.03, 6), steelCol, 0, 0, 0);
  }

  // 3. Dual Antenna Aerials & Deflector Skids
  for (const s of [-1, 1]) {
    // Upper antenna
    chain(b, [
      [0.18 * s, 0.22, -0.04],
      [0.24 * s, 0.44, -0.10]
    ], 0.014, steelCol, 0.005);
    part(b, new THREE.OctahedronGeometry(0.018, 0), rotorGlow, 0.24 * s, 0.45, -0.10);

    // Lower landing skids
    chain(b, [
      [0.16 * s, -0.20, 0.06],
      [0.22 * s, -0.34, 0.04],
      [0.22 * s, -0.34, -0.10]
    ], 0.018, hullDk, 0.014);
  }

  // 4. Hover, Pitch & Spin Animation Loop
  g.userData.anim = (t) => {
    b.position.y = 1.4 + Math.sin(t * 3.2) * 0.14;
    b.rotation.x = Math.sin(t * 2.1) * 0.08 + 0.04;
    b.rotation.z = Math.cos(t * 2.8) * 0.07;
    b.rotation.y = Math.sin(t * 1.4) * 0.16;

    for (const item of rotors) {
      item.r.rotation.y += 0.45 * item.dir;
    }
  };

  g.userData.anim(0);
  return g;
}
function makeSiegeBot() {
  const g = new THREE.Group();
  const c = '#7a2a2a';        // Heavy maroon armor
  const cDark = '#521a1a';    // Armor shadow / bevels
  const dk = '#232226';       // Chassis / hydraulics
  const steel = '#4a4d55';    // Heavy weapon frame
  const hazard = '#d49b28';   // Industrial hazard accents
  const eyeGlow = glow('#ff2a3a');

  // Root torso container (for recoil and idle animations)
  const torso = new THREE.Group();
  torso.position.y = 1.05;
  g.add(torso);

  // 1. Lower Body: Wide Reverse-Joint / Bipedal Stance (Total ~10 draw calls)
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(0.48 * s, 0, 0);
    g.add(hip);
    legs.push({ hip, sign: s });

    // Armored 3-toed / split tread foot base
    part(hip, B(0.42, 0.14, 0.65), c, 0, 0.07, 0.05);
    part(hip, B(0.46, 0.06, 0.22), dk, 0, 0.03, 0.32); // Front claw grip

    // Ankle shock piston
    part(hip, Cy(0.06, 0.06, 0.22, 6), steel, 0, 0.22, -0.05);

    // Backward-canted lower leg
    part(hip, B(0.24, 0.44, 0.28), dk, 0, 0.42, -0.08, -0.25, 0, 0);

    // Front knee strike plate
    part(hip, B(0.28, 0.22, 0.12), c, 0, 0.62, 0.06, 0.3, 0, 0);

    // Upper thigh strut angling into hip socket
    part(hip, B(0.26, 0.42, 0.26), dk, 0, 0.82, 0.02, 0.3, 0, 0);
    part(hip, Cy(0.09, 0.09, 0.12, 6), steel, 0.12 * s, 0.98, 0, 0, 0, Math.PI / 2);
  }

  // 2. Chassis Pelvis & Sloped Core Hull
  part(torso, Cy(0.22, 0.26, 0.8, 8), dk, 0, 0, 0); // Pelvis ring gear

  // Angular, beveled front hull (Upper & lower glacis plates)
  part(torso, B(1.15, 0.65, 0.9), c, 0, 0.45, 0);
  part(torso, B(1.22, 0.22, 0.94), cDark, 0, 0.28, 0.01); // Belt skirt
  part(torso, B(0.95, 0.32, 0.28), c, 0, 0.62, 0.42, -0.4, 0, 0); // Sloped glacis

  // Visor eye slot & armored brow hood
  part(torso, B(0.72, 0.12, 0.06), eyeGlow, 0, 0.58, 0.54);
  part(torso, B(0.82, 0.08, 0.18), dk, 0, 0.66, 0.52);

  // Twin rear exhaust stacks
  for (const s of [-1, 1]) {
    part(torso, Cy(0.08, 0.08, 0.38, 6), steel, 0.32 * s, 0.88, -0.38);
    part(torso, Cy(0.09, 0.07, 0.08, 6), dk, 0.32 * s, 1.08, -0.38);
  }

  // 3. Right Arm: Heavy Siege Mortar / Recoil Cannon
  const cannonArm = new THREE.Group();
  cannonArm.position.set(0.85, 0.55, 0.05);
  torso.add(cannonArm);

  // Shoulder mount & housing
  part(cannonArm, Cy(0.16, 0.16, 0.24, 8), dk, 0, 0, 0, 0, 0, Math.PI / 2);
  part(cannonArm, B(0.48, 0.46, 0.95), steel, 0.06, 0.08, 0.12);
  part(cannonArm, B(0.52, 0.08, 0.35), hazard, 0.06, 0.33, 0.12); // Hazard stripe top

  // Recoil sliding barrel & muzzle brake
  const barrel = new THREE.Group();
  barrel.position.set(0.06, 0.08, 0.62);
  cannonArm.add(barrel);

  part(barrel, Cy(0.15, 0.15, 0.85, 8), dk, 0, 0, 0.42, Math.PI / 2, 0, 0);
  part(barrel, Cy(0.19, 0.19, 0.22, 8), steel, 0, 0, 0.86, Math.PI / 2, 0, 0); // Muzzle ring

  // 4. Left Arm: Reinforced Siege Breaching Ram / Hydraulic Claw
  const shieldArm = new THREE.Group();
  shieldArm.position.set(-0.85, 0.45, 0.05);
  torso.add(shieldArm);

  part(shieldArm, Cy(0.14, 0.14, 0.22, 8), dk, 0, 0, 0, 0, 0, Math.PI / 2);
  part(shieldArm, B(0.28, 0.55, 0.32), dk, -0.04, -0.28, 0.08); // Lower arm strut

  // Forward breaching shield plate
  part(shieldArm, B(0.42, 0.95, 0.12), c, -0.06, -0.28, 0.32, -0.15, 0, 0);
  part(shieldArm, B(0.32, 0.08, 0.14), hazard, -0.06, -0.12, 0.33);

  // Heavy claw spikes
  for (const s of [-1, 1]) {
    part(shieldArm, new THREE.ConeGeometry(0.05, 0.26, 4), steel, -0.06, -0.74, 0.25 + 0.12 * s, Math.PI / 2);
  }

  // 5. Cheap Mobile-Friendly Idle & Cannon Recoil Animation
  g.userData.anim = (t) => {
    // Heavy engine idle rumble
    torso.position.y = 1.05 + Math.sin(t * 2.5) * 0.015;
    torso.rotation.y = Math.sin(t * 1.2) * 0.03;

    // Cannon slow breathing aim + spring recoil cycle
    cannonArm.rotation.x = -0.08 + Math.sin(t * 1.5) * 0.04;
    const recoil = Math.max(0, Math.sin(t * 3.5));
    barrel.position.z = 0.62 - Math.pow(recoil, 8) * 0.14;

    // Subtle shield arm guard balance
    shieldArm.rotation.x = 0.05 + Math.cos(t * 1.5) * 0.03;
  };

  return g;
}
function makeKragMech() { const g = makeMechModel('#3a1416'); g.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) o.material = glow('#ff2a3a'); }); for (const s of [-1, 1]) chain(g, [[0.6 * s, 3.2, 0], [0.9 * s, 3.8, -0.1], [0.8 * s, 4.3, -0.3]], 0.1, '#b3262c', 0.02); return g; }
const FORT = [0, -10];
LEVELS.fort = {
  id: 'fort', name: 'Fort Ironrock', tag: 'Asteroid army base', lvls: 'Lv 12–30 · vehicles', size: 380, center: [0, 20], radius: 150, water: -99, sky: 'space', weather: 'none', gravity: 0.6, hourOffset: 0,
  terrain: { a1: 2.0, f1: 0.045, a2: 1.1, f2: 0.1, a3: 0.4, f3: 0.22, base: 1.0, min: -5, edge: 26, step: 2.4 },
  palette: { grass: '#7a6a5a', patch: '#6a5a4a', dirt: '#4a4440', sand: '#8a7a68', wet: '#3a3430', rockA: '#6a5a4a', rockB: '#4a4038' },
  carve: (x, z, h) => { const d = Math.hypot(x - FORT[0], z - FORT[1]); if (d < 30) h = h * smooth(d, 24, 30); const dr = Math.hypot(x - 50, z - 20); if (dr < 26) h *= 0.25 + 0.75 * smooth(dr, 18, 26); if (FRONT && !FRONT.raw && x > FRONT.x0 && x < FRONT.x1 && z > FRONT.z0 && z < FRONT.z1) h -= 8; return h; }, // the Front's own ground covers its patch
  zones: [
    { id: 'base', name: 'Fort Ironrock', lvl: 'Safe · army base', x: FORT[0], z: FORT[1], r: 24, fr: 25, col: '#5d636c', safe: true, h: 0.5 },
    { id: 'range', name: 'Vehicle Range', lvl: 'Lv 12–16 · training', x: 50, z: 20, r: 22, col: '#8a7a50', h: 0 },
    { id: 'siege', name: 'The Front', lvl: 'Lv 18–24 · war zone', x: -81, z: 26, r: 30, fr: 60, col: '#5a4a3c', h: 0 },
    { id: 'tankyard', name: 'Drome Tank Yard', lvl: 'Lv 22–28', x: 20, z: 72, r: 20, col: '#4a3030', h: -0.5 },
    { id: 'kragpit', name: "Krag's Crater", lvl: 'Lv 30 · boss', x: -30, z: 86, r: 16, fr: 12, col: '#3a1416', h: -2 }
  ],
  paths: [[[0, 12], [50, 20]], [[0, 12], [-15, 25]], [[0, 12], [20, 72]], [[-46, 34], [-30, 86]]], river: [], pools: [], lava: [],
  safes: [{ x: FORT[0], z: FORT[1], r: 23 }], spawn: { x: 0, z: -18, yaw: Math.PI }, pad: { x: -10, z: -20 }, menu: { x: 0, z: 0, r: 40, h: 14 }, npcBase: FORT,
  npcs: [
    { id: 'hale', name: 'General Hale', role: 'Fort commander', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#3a4a2a', '#c9b27c': '#ffd36a' }), x: 0, z: 2, face: Math.PI, idle: ["Fort Ironrock. Carved out of a rock, held together by spite and duct tape.", "Drome's tanks hit us every night. We hit back every morning. It's a schedule."] },
    { id: 'brix', name: 'Quartermaster Brix', role: 'Army shop · war vehicles', rig: 'civ', make: () => makeCivilian('#5a6a3a', '#2c2a28', '#c58a64', '#1e1a18', '#ffd36a'), x: 9, z: -2, face: -1.3, custom: [['Vehicles', n => openVehicleShop(n)], ['Vehicle bay', () => openVehicleBay()]], shop: 'guns', guns: ['g70', 'g80'], idle: ["Tank? Car with spikes? Two-story robot? I've got a guy. I am the guy."] },
    { id: 'volta', name: 'Dr. Volta', role: 'Military research', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#3b4f7a', '#e0b892', '#9aa1aa', '#4fd2ff'), x: -9, z: -2, face: 1.3, custom: [['Research', n => openResearch(n)]], idle: ["I made the tank 25% more tank. Peer review pending.", "Bring me scrap and ore. I turn rocks into armor. It's basically alchemy with a budget."] },
    { id: 'torque', name: 'Sgt. Torque', role: 'Vehicle training', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#8a6a3a', '#c9b27c': '#2b2a2c' }), x: 12, z: 10, face: -2.2, idle: ["Mirrors, signal, ram it. That's the whole driving course."] },
    { id: 'medic', name: 'Corporal Patch', role: 'Field medic · heals', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#2c2a28', '#8a5a3a', '#1e1a18', '#c8402f'), x: -12, z: 10, face: 2.2, heal: true, idle: ["Hold still. This is going to hurt me more than you. Not really."] }
  ],
  spawns: [
    { zone: 'range', type: 'tdrone', n: 8, lv: [12, 16] },
    { zone: 'siege', type: 'siegebot', n: 6, lv: [18, 24] },
    { zone: 'tankyard', type: 'dtank', n: 5, lv: [22, 28] }, { zone: 'tankyard', type: 'siegebot', n: 2, lv: [24, 26] },
    { zone: 'kragpit', type: 'krag', n: 1, lv: [30, 30], at: [0, 0] }
  ],
  build() {
    const [fx, fz] = FORT;
    // compound wall with a gate to the north
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.2) continue;
      const x = fx + Math.cos(a) * 23.5, z = fz + Math.sin(a) * 23.5;
      part(props, B(3.8, 3, 0.8), toon('#ffffff', 'ironwall'), x, groundH(x, z) + 1.5, z, 0, -a + Math.PI / 2, 0);
      part(props, B(3.85, 0.12, 0.9), '#3a3d44', x, groundH(x, z) + 3.06, z, 0, -a + Math.PI / 2, 0);
      if (i % 5 === 0) {
        part(props, B(1.4, 5, 1.4), '#3a3d44', x, groundH(x, z) + 2.5, z);
        part(props, B(0.6, 0.3, 0.6), glow('#ff8a2a'), x, groundH(x, z) + 5.2, z);
      }
    }
    RINGS.push({ x: fx, z: fz, r: 23.5, gate: Math.PI / 2, half: 3, safe: true });
    // hangar with the three vehicles on display
    const hg = new THREE.Group(); part(hg, B(18, 0.3, 9), '#3a3d44', 0, 0.15, 0); part(hg, new THREE.CylinderGeometry(4.6, 4.6, 18, 12, 1, true, 0, Math.PI), toon('#6a6a70', 'panel'), 0, 0.2, 0, 0, 0, Math.PI / 2); hg.children[1].material.side = THREE.DoubleSide;
    const s1 = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.2), new THREE.MeshBasicMaterial({ map: signTex('MOTOR POOL', '#1e1c22', '#ffd36a') })); s1.position.set(0, 5, 4.6); hg.add(s1); at(hg, fx, fz - 14);
    box(fx, fz - 18.4, 9, 0.4); box(fx - 9, fz - 14, 0.4, 4.6); box(fx + 9, fz - 14, 0.4, 4.6);
    [[makeBattleCar, -5.5, 0.6], [makeTankModel, 0, 0.7], [makeMechModel, 5.5, 0.55]].forEach(([mk, ox, sc]) => { const v = mk(); v.scale.setScalar(sc); at(v, fx + ox, fz - 14.5, 0.3); if (v.userData.anim) levelAnims.push(t => v.userData.anim(t * 0.2)); });
    // research lab dome, barracks, army shop, radar
    const lab = makeDome(5, '#cfe6ff'); at(lab, fx - 15, fz + 2); solid(fx - 15, fz + 2, 4.6);
    for (const [ox, oz, w, h, col] of [[15, 2, 7, 4, '#5a6a3a'], [-14, -14, 5, 3.6, '#5d636c'], [14, -14, 5, 3.6, '#5d636c']]) { const t = makeCityBlock(w, h, 4, col, '#ffd36a'); at(t, fx + ox, fz + oz); box(fx + ox, fz + oz, w / 2, 2); }
    const radar = new THREE.Group(); part(radar, Cy(0.2, 0.3, 6, 6), '#3a3d44', 0, 3, 0); const dish = new THREE.Group(); dish.position.y = 6.2; radar.add(dish); part(dish, new THREE.SphereGeometry(1.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 3), '#9aa1aa', 0, 0, 0, Math.PI / 2.6); at(radar, fx + 18, fz + 12); solid(fx + 18, fz + 12, 0.5); levelAnims.push(t => { dish.rotation.y = t * 0.8; });
    dropshipPad(-10, -20, 0, 'Return to your ship');
    // training range: target boards, cones, ramps
    for (let i = 0; i < 10; i++) { const a = i * 0.63, x = Z.range.x + Math.cos(a) * 15, z = Z.range.z + Math.sin(a) * 15, t = new THREE.Group(); part(t, B(0.15, 2, 0.15), '#3a3d44', 0, 1, 0); part(t, Cy(0.9, 0.9, 0.1, 12), '#ffffff', 0, 2.4, 0, Math.PI / 2); part(t, Cy(0.6, 0.6, 0.12, 12), '#c8402f', 0, 2.4, 0, Math.PI / 2); part(t, Cy(0.3, 0.3, 0.14, 12), '#ffffff', 0, 2.4, 0, Math.PI / 2); at(t, x, z, a); }
    for (let i = 0; i < 16; i++) part(props, new THREE.ConeGeometry(0.3, 0.8, 6), '#ff8a2a', Z.range.x - 12 + i * 1.6, groundH(Z.range.x - 12 + i * 1.6, Z.range.z - 6) + 0.4, Z.range.z - 6);
    // the Front (replaces the old Siege Lines)
    frontBuild(); // the Front: trenches, wire, our line and the Drome line (front.js)
    // tank yard: Drome banners and fuel tanks
    for (let i = 0; i < 6; i++) { const a = i * 1.05, x = Z.tankyard.x + Math.cos(a) * 16, z = Z.tankyard.z + Math.sin(a) * 16; part(props, Cy(1.2, 1.2, 3, 10), '#3a1416', x, groundH(x, z) + 1.5, z); part(props, B(1.6, 0.12, 0.12), glow('#ff2a3a'), x, groundH(x, z) + 2.4, z + 1.2); solid(x, z, 1.3); }
    // the sky: the asteroid belt all around you
    const N = 60, rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ map: TEX.stone, color: '#9a8a7a' }), N), dm = new THREE.Object3D();
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, r = 160 + (i % 7) * 25; dm.position.set(Math.cos(a) * r, 30 + (i % 5) * 18, Math.sin(a) * r + 20); dm.scale.setScalar(3 + (i % 4) * 4); dm.rotation.set(i, i * 2, i * 3); dm.updateMatrix(); rocks.setMatrixAt(i, dm.matrix); }
    levelGroup.add(rocks); levelAnims.push(t => { rocks.rotation.y = t * 0.004; });
    const sunL = new THREE.DirectionalLight(0xfff0d8, 0.9); sunL.position.set(-80, 120, 60); levelGroup.add(sunL);
    tufts(0);
  }
};
Object.assign(ENEMY, {
  tdrone: { name: 'Training Drone', make: makeTrainingDrone, fly: true, hp: 120, speed: 3.2, r: 0.6, hy: 1.4, xp: 45, cr: [6, 12], ranged: { dmg: 8, rate: 1.6, speed: 14, col: '#ffd36a', range: 18, keep: 10 }, drops: [['scrap', 0.4]] },
  siegebot: { name: 'Siege Bot', make: makeSiegeBot, scale: 1.3, hp: 450, speed: 1.8, r: 0.8, hy: 1.5, xp: 160, cr: [20, 36], lob: { dmg: 40, rate: 2.4, speed: 13, range: 26, keep: 10, col: '#ff6a1a' }, drops: [['scrap', 0.7], ['ore', 0.4]] },
  dtank: { name: 'Drome Tank', make: () => makeTankModel('#3a1416'), scale: 0.75, hp: 600, speed: 2.4, r: 1.6, hy: 1.0, xp: 240, cr: [30, 50], ranged: { dmg: 46, rate: 2.2, speed: 22, col: '#ff2a3a', range: 30, keep: 14 }, drops: [['scrap', 0.9], ['ore', 0.6], ['circuit', 0.3]] },
  krag: { name: 'Warlord Krag', make: makeKragMech, scale: 1.2, hp: 9000, speed: 2.0, r: 1.6, hy: 2.4, xp: 9000, cr: [1500, 2200], boss: true, melee: { dmg: 90, rate: 1.6, reach: 3.6 }, lob: { dmg: 60, rate: 1.8, speed: 15, range: 30, keep: 8, col: '#ff2a3a' }, drops: [['kragcore', 1]] }
});
ITEMS.kragcore = { name: "Krag's Reactor Core", v: 0, col: '#ff2a3a', quest: true };
SPACE_BODIES.fort = { pos: V(-560, 10, 449).multiplyScalar(SPACE_SPREAD), r: 55, col: '#8a7a6a' };
PLANET_LOOK.fort = { seed: 61, ramp: [[0, '#2a2420'], [0.45, '#5a4a3a'], [0.62, '#8a7a68'], [0.8, '#b0a090']], grid: '#ff8a2a' };
PLANET_ORDER.splice(PLANET_ORDER.indexOf('mezar'), 0, 'fort');
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'fort') return shipUnlocked(); return _po(id); }; }
defQuest('a1', { ch: 'Fort Ironrock', title: "Learner's Permit", giver: 'torque', turnIn: 'torque', req: [],
  intro: ["Fresh meat! Welcome to vehicle training. Rule one: the car is a weapon. Rule two: so is the parking brake.", "Brix will issue you a Battle Car on the house when you finish. First, prove you can shoot. Clear the training drones on the Vehicle Range, east of the gate."],
  obj: [{ kind: 'kill', t: 'tdrone', n: 6, text: 'Shoot down training drones on the Vehicle Range', zone: 'range' }],
  outro: ["Not bad. Here's your Battle Car. Press V on any open planet to drive it. Try not to run me over. Again."], reward: { cr: 1500, xp: 6000, fn: () => { const V0 = vehS(); if (!V0.owned.includes('battlecar')) { V0.owned.push('battlecar'); V0.sel = 'battlecar'; } log('New vehicle: Battle Car. Press V (or Menu → Vehicle) to drive it.', 'loot'); } } });
defQuest('a2', { ch: 'Fort Ironrock', title: 'Heavy Metal', giver: 'hale', turnIn: 'hale', req: ['a1'],
  intro: ["Drome's Siege Bots are shelling our west wall. Every night. It's rude.", "They hide behind the Drome trench at the Front, west of the gate. Go break them. Vehicles strongly recommended."],
  obj: [{ kind: 'kill', t: 'siegebot', n: 5, text: 'Destroy Siege Bots at the Front', zone: 'siege' }],
  outro: ["The wall's quiet. I almost miss it. No I don't. Volta wants to talk to you about upgrades."], reward: { cr: 3500, xp: 11000, items: { scrap: 15, ore: 8 } } });
defQuest('a3', { ch: 'Fort Ironrock', title: 'Tank Buster', giver: 'hale', turnIn: 'hale', req: ['a2'],
  intro: ["Drome has a whole tank yard to the north. Tanks. Plural. Somebody gave that man a budget.", "Bust five of them. If you don't have a tank yet, Brix sells them. Fight fire with fire. Or tank with tank."],
  obj: [{ kind: 'kill', t: 'dtank', n: 5, text: 'Destroy Drome Tanks in the tank yard', zone: 'tankyard' }],
  outro: ["Five tanks! The yard's a scrap yard now. Volta is weeping with joy. That's what that sound is."], reward: { cr: 6000, xp: 16000, items: { scrap: 25, ore: 12 } } });
defQuest('a4', { ch: 'Fort Ironrock', title: "Krag's Last Stand", giver: 'hale', turnIn: 'hale', req: ['a3'], main: true,
  intro: ["Warlord Krag. Drome's tank general. Rides a mech the size of a building. In a crater to the north-west.", "Bring me his reactor core and this rock is ours. Bring a big vehicle. Bring two."],
  obj: [{ kind: 'item', t: 'kragcore', n: 1, text: "Defeat Warlord Krag and take his reactor core", zone: 'kragpit' }],
  outro: ["Krag's core. Still warm. Fort Ironrock stands!", "His orders say Drome is building something in the sky above Earth. A floating city. We'll need eyes up there."], reward: { cr: 12000, xp: 30000, take: { kragcore: 1 }, cape: 'ironrock' } });
CAPES.ironrock = { name: 'Ironrock Cape', lvl: 1, flag: 'ironrock', col: '#3a4a2a', trim: '#ff8a2a' };
