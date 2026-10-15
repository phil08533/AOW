// =================== EARTH'S MOON: Luna Dome, low gravity, mines + the notebook's weapon and pet extras ===================
function makeDrillbot() {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Heavy Excavation Mining Rig Palette
  const hazardYel = '#c9a43a';
  const chassisDk = '#2e3036';
  const industrialSteel = '#8e95a0';
  const frameBlack = '#18191c';
  const visorGlow = glow('#ff9a3c');
  const beaconGlow = glow('#ff3b2a');

  // 1. Grounded Heavy Mining Treads / Boots (Grounded at y = 0.0)
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(0.20 * s, 0, 0);
    root.add(leg);
    legs.push({ leg, s });

    // Grounded base tread pad (y = 0.0 to 0.04)
    part(leg, B(0.28, 0.04, 0.40), frameBlack, 0, 0.02, 0.04);

    // Boot housing block (y = 0.04 to 0.12)
    part(leg, B(0.26, 0.08, 0.36), hazardYel, 0, 0.08, 0.04);
    part(leg, Cy(0.04, 0.04, 0.24, 6), industrialSteel, 0, 0.08, 0.18, 0, 0, Math.PI / 2); // Front roller

    // Piston leg column (y = 0.12 to 0.54)
    part(leg, B(0.20, 0.42, 0.24), chassisDk, 0, 0.33, 0);
    part(leg, Cy(0.035, 0.035, 0.36, 6), industrialSteel, 0.07 * s, 0.33, 0.06); // Reinforcing hydraulic strut
  }

  // 2. Heavy Torso Chassis & Swivel Cab
  // Pelvic turntable
  part(root, B(0.56, 0.14, 0.36), chassisDk, 0, 0.59, 0);
  part(root, Cy(0.12, 0.12, 0.16, 8), frameBlack, 0, 0.69, 0);

  const torso = new THREE.Group();
  torso.position.set(0, 0.95, 0);
  root.add(torso);

  // Main reinforced cab hull (depth 0.52 -> front at z = +0.26)
  part(torso, B(0.72, 0.58, 0.52), hazardYel, 0, 0, 0);
  part(torso, B(0.76, 0.10, 0.54), frameBlack, 0, -0.18, 0); // Bottom bumper
  part(torso, B(0.60, 0.46, 0.12), chassisDk, 0, 0.02, -0.30); // Rear engine radiator block

  // Heavy Mining Visor / Reinforced Cockpit Slit (Stepped cleanly off front z = 0.28 -> 0.30)
  part(torso, B(0.52, 0.28, 0.05), frameBlack, 0, 0.05, 0.28);
  part(torso, B(0.34, 0.07, 0.04), visorGlow, 0, 0.08, 0.31);
  part(torso, B(0.42, 0.025, 0.03), chassisDk, 0, -0.02, 0.31); // Lower visor grille slat

  // 3. Port Arm: Heavy Pincer Gripper
  const pincerArm = new THREE.Group();
  pincerArm.position.set(-0.46, 0.02, 0);
  torso.add(pincerArm);

  // Shoulder gimbal
  part(pincerArm, Cy(0.12, 0.12, 0.18, 8), chassisDk, 0, 0, 0, 0, 0, Math.PI / 2);
  part(pincerArm, B(0.16, 0.34, 0.18), hazardYel, -0.06, -0.16, 0);
  part(pincerArm, Cy(0.06, 0.06, 0.26, 6), industrialSteel, -0.06, -0.32, 0.08, Math.PI / 2);

  // Clamping vise blades
  part(pincerArm, new THREE.ConeGeometry(0.04, 0.16, 4), chassisDk, -0.09, -0.32, 0.22, Math.PI / 2, 0, 0.2);
  part(pincerArm, new THREE.ConeGeometry(0.04, 0.16, 4), chassisDk, -0.03, -0.32, 0.22, Math.PI / 2, 0, -0.2);

  // 4. Starboard Arm: High-Torque Rotary Drill
  const drillArm = new THREE.Group();
  drillArm.position.set(0.46, 0.02, 0);
  torso.add(drillArm);

  // Shoulder & hydraulic casing
  part(drillArm, Cy(0.12, 0.12, 0.18, 8), chassisDk, 0, 0, 0, 0, 0, Math.PI / 2);
  part(drillArm, B(0.18, 0.22, 0.26), hazardYel, 0.06, -0.02, 0.12);

  // Independent rotating drill head
  const drillHead = new THREE.Group();
  drillHead.position.set(0.06, -0.02, 0.30);
  drillArm.add(drillHead);

  // Hardened carbide auger cone
  part(drillHead, new THREE.ConeGeometry(0.18, 0.72, 8), industrialSteel, 0, 0, 0.36, Math.PI / 2);

  // Spiral cutting flutes / reamer rings
  for (let k = 0; k < 3; k++) {
    const r = 0.15 - k * 0.035;
    const ringZ = 0.12 + k * 0.18;
    part(drillHead, new THREE.TorusGeometry(r, 0.022, 4, 10), chassisDk, 0, 0, ringZ);
    // Spiral tooth spurs
    part(drillHead, new THREE.ConeGeometry(0.02, 0.06, 3), industrialSteel, r, 0, ringZ, 0, 0, -Math.PI / 2);
    part(drillHead, new THREE.ConeGeometry(0.02, 0.06, 3), industrialSteel, -r, 0, ringZ, 0, 0, Math.PI / 2);
  }

  // 5. Roof Siren Beacon & Sensor Mast
  chain(torso, [
    [0, 0.29, -0.04],
    [0, 0.48, -0.05],
    [0, 0.60, -0.06]
  ], 0.022, frameBlack, 0.010, true);

  part(torso, new THREE.SphereGeometry(0.055, 8, 6), beaconGlow, 0, 0.63, -0.06);

  // 6. Drill Torque & Heavy Suspension Animation Loop
  g.userData.anim = (t) => {
    // High-speed drill rotation along forward Z axis
    drillHead.rotation.z = t * 24.0;

    // Heavy engine vibration & suspension heave
    root.position.y = Math.sin(t * 8.0) * 0.005;

    // Torso hydraulic stabilization & surveillance sweep
    torso.rotation.y = Math.sin(t * 1.5) * 0.10;
    torso.rotation.x = Math.sin(t * 2.2) * 0.02;

    // Counter-balancing arm drift
    pincerArm.rotation.x = Math.sin(t * 1.8) * 0.08;
    drillArm.rotation.x = -Math.sin(t * 1.8) * 0.05;

    // Subtle leg suspension response
    for (const l of legs) {
      l.leg.rotation.x = Math.sin(t * 1.8 + l.s) * 0.015;
    }
  };

  g.userData.anim(0);
  return g;
}
function makeMoonmite() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);

  // Shell
  E(body, '#5d636c', 0, 0.25, 0, 0.3, 0.15, 0.25);

  // Clearish translucent crystal material
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: '#9fe8ff',
    roughness: 0.1,
    transmission: 0.4,
    transparent: true,
    opacity: 0.75,
    ior: 1.3,
    emissive: '#4bb8eb',
    emissiveIntensity: 0.6,
    flatShading: true
  });

  // Top crystals
  for (let i = 0; i < 4; i++) {
    const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), crystalMat);
    crys.position.set((i - 1.5) * 0.12, 0.42, Math.sin(i) * 0.08);
    body.add(crys);
  }

  // Eyes
  for (const s of [-1, 1]) {
    E(body, glow('#ffe14a'), 0.08 * s, 0.32, 0.24, 0.03, 0.03, 0.02);
  }

  // 6 Articulated legs anchored in groups for animation
  const legs = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const legGroup = new THREE.Group();
      legGroup.position.set(0.22 * s, 0.2, -0.1 + k * 0.1);
      g.add(legGroup);

      chain(legGroup, [
        [0, 0, 0],
        [0.16 * s, 0.02, 0],
        [0.22 * s, -0.2, -0.02]
      ], 0.02, '#3a3d44', 0.012);

      legs.push({ legGroup, s, k });
    }
  }

  // Animation: slight body bob + alternating tripod leg shuffle
  g.userData.anim = (t) => {
    body.position.y = Math.sin(t * 8) * 0.008;
    body.rotation.z = Math.sin(t * 4) * 0.02;

    legs.forEach(l => {
      const phase = (l.s > 0 ? 0 : Math.PI) + (l.k % 2 === 0 ? 0 : Math.PI);
      l.legGroup.rotation.y = Math.sin(t * 8 + phase) * 0.18 * l.s;
      l.legGroup.rotation.z = Math.sin(t * 8 + phase) * 0.08 * l.s;
    });
  };

  g.userData.anim(0);
  return g;
}
function makeWraith() {
  const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 1.2; g.add(b);
  const cl = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 7, 1, true), new THREE.MeshLambertMaterial({ color: '#14121e', transparent: true, opacity: 0.85, side: THREE.DoubleSide })); cl.rotation.x = Math.PI; b.add(cl);
  E(b, '#14121e', 0, 0.75, 0, 0.26, 0.3, 0.26); for (const s of [-1, 1]) E(b, glow('#ff2a3a'), 0.09 * s, 0.78, 0.22, 0.05, 0.03, 0.02);
  for (const s of [-1, 1]) chain(b, [[0.3 * s, 0.4, 0], [0.6 * s, 0.1, 0.25], [0.7 * s, -0.2, 0.35]], 0.04, '#14121e', 0.015);
  g.userData.anim = (t) => { b.position.y = 1.2 + Math.sin(t * 1.3) * 0.25; b.rotation.y = Math.sin(t * 0.7) * 0.3; };
  return g;
}
function makeExcavator() {
  const g = new THREE.Group(), m = '#c9a43a', dk = '#3a3d44';
  for (const s of [-1, 1]) { part(g, B(0.5, 0.3, 1.6), dk, 0.6 * s, 0.15, 0); for (let k = 0; k < 4; k++) part(g, Cy(0.14, 0.14, 0.52, 8), '#2b2a2c', 0.6 * s, 0.15, -0.6 + k * 0.4, 0, 0, Math.PI / 2); }
  part(g, B(1.4, 0.9, 1.4), m, 0, 0.8, 0); part(g, B(0.8, 0.5, 0.6), m, 0, 1.45, -0.2); part(g, B(0.6, 0.3, 0.05), glow('#ff3b2a'), 0, 1.5, 0.12);
  const arm = new THREE.Group(); arm.position.set(0, 1.0, 0.7); g.add(arm); part(arm, B(0.25, 0.25, 1.0), dk, 0, 0, 0.5); const drill = new THREE.Group(); drill.position.z = 1.1; arm.add(drill); part(drill, new THREE.ConeGeometry(0.4, 1.4, 8), '#9aa1aa', 0, 0, 0.7, Math.PI / 2);
  for (let k = 0; k < 3; k++) part(g, Cy(0.12, 0.15, 0.6, 6), '#2b2a2c', -0.4 + k * 0.4, 1.9, -0.5);
  g.userData.anim = (t) => { drill.rotation.z = t * 14; arm.rotation.x = Math.sin(t * 1.2) * 0.15; };
  return g;
}
// pets from the colored creature sheet
function makeTrex() {
  const g = new THREE.Group(), sk = '#5f8a3a', bel = '#c8c890';
  for (const s of [-1, 1]) chain(g, [[0.16 * s, 0.75, 0], [0.18 * s, 0.4, 0.15], [0.16 * s, 0.05, 0.05]], 0.1, sk, 0.06, true);
  E(g, sk, 0, 0.95, 0, 0.32, 0.36, 0.5, -0.3); E(g, bel, 0, 0.88, 0.12, 0.22, 0.26, 0.36, -0.3);
  E(g, sk, 0, 1.45, 0.45, 0.22, 0.2, 0.34); E(g, sk, 0, 1.35, 0.7, 0.16, 0.08, 0.2); for (let k = 0; k < 5; k++) part(g, new THREE.ConeGeometry(0.02, 0.06, 3), '#efe7d6', (k - 2) * 0.05, 1.31, 0.84, Math.PI);
  for (const s of [-1, 1]) { E(g, '#ffd23a', 0.14 * s, 1.52, 0.58, 0.035, 0.035, 0.03); chain(g, [[0.2 * s, 1.15, 0.3], [0.26 * s, 1.0, 0.42]], 0.035, sk, 0.02); }
  const tail = new THREE.Group(); tail.position.set(0, 0.95, -0.45); g.add(tail); chain(tail, [[0, 0, 0], [0, -0.05, -0.5], [0, 0.05, -0.95]], 0.18, sk, 0.04);
  g.userData.anim = (t) => { tail.rotation.y = Math.sin(t * 2) * 0.3; };
  return g;
}
function makeDevilRay() { const g = makeManta(); g.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.material = toon(o.material.color.getHexString() === 'e8e4dc' ? '#ff9a3c' : '#8a1e1e'); }); return g; }
function makeRoboTurtle() {
  const g = new THREE.Group();
  E(g, '#9aa1aa', 0, 0.35, 0, 0.45, 0.25, 0.55); for (let i = 0; i < 6; i++) part(g, new THREE.CylinderGeometry(0.12, 0.12, 0.04, 6), glow(i % 2 ? '#4fd2ff' : '#6fdc5a'), Math.cos(i) * 0.22, 0.58, Math.sin(i) * 0.28);
  E(g, '#5d636c', 0, 0.3, 0.58, 0.14, 0.12, 0.16); for (const s of [-1, 1]) { E(g, glow('#ff3b2a'), 0.06 * s, 0.34, 0.7, 0.025, 0.025, 0.02); for (const z of [-0.3, 0.3]) part(g, Cy(0.08, 0.08, 0.2, 6), '#5d636c', 0.38 * s, 0.12, z); }
  return g;
}
function makeNoptile() {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Alien reptile palette
  const sk = '#c86aff';
  const skDark = '#8e3eb5';
  const underBelly = '#e8b8ff';
  const spikeCol = '#ffd23a';
  const eyeSclera = '#ffffff';
  const eyePupil = (typeof C !== 'undefined' && C.eye) ? C.eye : '#200b33';

  // 1. Torso, Soft Underbelly & Dorsal Ridge
  // Main torso pod
  E(root, sk, 0, 0.25, 0, 0.18, 0.14, 0.36);
  // Pale ventral underbelly
  E(root, underBelly, 0, 0.18, 0.02, 0.14, 0.08, 0.30);

  // Dorsal spines (stepped heights along the back)
  for (let k = 0; k < 5; k++) {
    const spikeH = 0.14 + Math.sin(k * 0.7) * 0.04;
    part(
      root,
      new THREE.ConeGeometry(0.035, spikeH, 4),
      spikeCol,
      0,
      0.38 + spikeH * 0.45,
      -0.24 + k * 0.12,
      -0.1,
      0,
      0
    );
  }

  // 2. Articulated Head & Snout
  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.36);
  root.add(head);

  // Skull
  E(head, sk, 0, 0.02, 0.02, 0.12, 0.10, 0.14);
  // Snout tip
  E(head, skDark, 0, -0.01, 0.12, 0.08, 0.06, 0.08);

  // Defined glossy eyes with pupils (recessed, no sprite artifacts)
  for (const s of [-1, 1]) {
    E(head, eyeSclera, 0.065 * s, 0.06, 0.08, 0.032, 0.032, 0.024);
    part(head, B(0.018, 0.025, 0.012), eyePupil, 0.07 * s, 0.06, 0.10);

    // Brow ridge
    part(head, B(0.035, 0.012, 0.04), skDark, 0.068 * s, 0.09, 0.07, 0, 0, -0.2 * s);
  }

  // 3. Four Splayed Reptile Legs (Grounded at y = 0.0)
  const legs = [];
  const legPairs = [
    { z:  0.20, isFront: true },
    { z: -0.20, isFront: false }
  ];

  for (const s of [-1, 1]) {
    legPairs.forEach(pair => {
      const legGroup = new THREE.Group();
      legGroup.position.set(0.14 * s, 0.20, pair.z);
      root.add(legGroup);

      // Splayed crawling leg chain: Hip -> Knee -> Foot
      chain(legGroup, [
        [0, 0, 0],
        [0.08 * s, 0.02, 0.02 * (pair.isFront ? 1 : -1)],
        [0.10 * s, -0.19, 0.04 * (pair.isFront ? 1 : -1)]
      ], 0.032, sk, 0.02, true);

      // Foot pad flush with ground level
      const footZ = 0.04 * (pair.isFront ? 1 : -1);
      part(legGroup, B(0.05, 0.015, 0.06), skDark, 0.10 * s, -0.195, footZ);

      // Tiny claw toes
      for (let t = -1; t <= 1; t++) {
        part(
          legGroup,
          new THREE.ConeGeometry(0.008, 0.03, 3),
          spikeCol,
          (0.10 + t * 0.018) * s,
          -0.195,
          footZ + 0.03,
          Math.PI / 2.2,
          0,
          0.2 * t * s
        );
      }

      legs.push({ legGroup, s, isFront: pair.isFront });
    });
  }

  // 4. Undulating Reptile Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.24, -0.34);
  root.add(tail);

  chain(tail, [
    [0, 0, 0],
    [0, -0.03, -0.24],
    [0, 0.05, -0.46]
  ], 0.048, sk, 0.015, true);

  // Tail tip barb
  part(tail, new THREE.ConeGeometry(0.02, 0.08, 4), spikeCol, 0, 0.06, -0.50, -0.4, 0, 0);

  // 5. Scuttling Lizard Animation Loop
  g.userData.anim = (t) => {
    // Low crawler breathing heave
    root.position.y = Math.sin(t * 3.5) * 0.006;

    // Head tracking sway
    head.rotation.y = Math.sin(t * 1.8) * 0.14;
    head.rotation.x = Math.sin(t * 3.0) * 0.04;

    // Sinusoidal tail whip
    tail.rotation.y = Math.sin(t * 3.5) * 0.28;
    tail.rotation.x = Math.cos(t * 2.0) * 0.08;

    // Diagonal trot gait for all four legs
    legs.forEach(l => {
      const phase = (l.s > 0 ? 0 : Math.PI) + (l.isFront ? 0 : Math.PI);
      l.legGroup.rotation.y = Math.sin(t * 3.5 + phase) * 0.18 * l.s;
    });
  };

  g.userData.anim(0);
  return g;
}
function makeGosalem() {
  const g = new THREE.Group();

  // Soft glowing blue material
  const mat = new THREE.MeshLambertMaterial({
    color: '#4fa8ff',
    transparent: true,
    opacity: 0.62,
    emissive: new THREE.Color('#1a3a7a'),
    emissiveIntensity: 0.45
  });

  // Slightly brighter core
  const coreMat = new THREE.MeshLambertMaterial({
    color: '#7ec8ff',
    transparent: true,
    opacity: 0.75,
    emissive: new THREE.Color('#2a5a9a'),
    emissiveIntensity: 0.6
  });

  const blob = (x, y, z, r, material = mat) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), material);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  // ---- Body (taller, more elegant silhouette) ----
  blob(0, 0.55, 0, 0.38);          // main body
  blob(0, 0.95, 0.02, 0.28);       // upper torso / neck
  blob(0, 1.22, 0.06, 0.20);       // head

  // Soft shoulder blobs
  for (const s of [-1, 1]) {
    blob(0.32 * s, 0.78, 0.02, 0.15);
  }

  // Floating arm orbs (slightly forward)
  for (const s of [-1, 1]) {
    blob(0.48 * s, 0.68, 0.12, 0.13);
    blob(0.58 * s, 0.55, 0.18, 0.09); // small hand tip
  }

  // Soft lower “legs” / base
  for (const s of [-1, 1]) {
    blob(0.16 * s, 0.18, 0.02, 0.17);
  }

  // ---- Eyes (bright + soft glow) ----
  for (const s of [-1, 1]) {
    // outer soft glow
    E(g, glow('#aaddff'), 0.09 * s, 1.25, 0.22, 0.055, 0.055, 0.03);
    // bright core
    E(g, glow('#ffffff'), 0.09 * s, 1.25, 0.24, 0.032, 0.032, 0.018);
  }

  // Tiny soft core light in the chest
  blob(0, 0.72, 0.18, 0.08, coreMat);

  // ---- Gentle idle animation ----
  g.userData.anim = (t) => {
    // soft float
    g.position.y = Math.sin(t * 1.6) * 0.06;

    // subtle breathe / pulse
    const s = 1 + Math.sin(t * 2.2) * 0.025;
    g.scale.set(s, s, s);

    // slight side sway
    g.rotation.z = Math.sin(t * 0.9) * 0.04;
    g.rotation.y = Math.sin(t * 0.7) * 0.05;
  };

  return g;
}
Object.assign(PETS, {
  trex: { name: 'T-rex', make: makeTrex, rig: null, scale: 0.7, price: 9000, dmg: 34 },
  devilray: { name: 'Devil Light Ray', make: makeDevilRay, rig: null, scale: 0.8, price: 7000, dmg: 26, fly: true, ranged: true },
  roboturtle: { name: 'Robo-turtle', make: makeRoboTurtle, rig: null, scale: 0.9, price: 4000, dmg: 18, ranged: true },
  noptile: { name: 'Noptile', make: makeNoptile, rig: null, scale: 1.1, price: 2500, dmg: 15 },
  gosalem: { name: 'Gosa-lem (water spirit)', make: makeGosalem, rig: null, scale: 0.8, price: 6000, dmg: 24, ranged: true }
});
// weapons from the notebook pages
Object.assign(MELEE, {
  swordgun: { name: 'Sword-Gun', dmg: 300, rate: 0.55, reach: 2.9, req: 18, price: 9000, shoot: 180 },
  nunchucks: { name: 'Electric Nunchucks', dmg: 170, rate: 0.24, reach: 2.5, req: 20, price: 11000, chain: true },
  claws: { name: 'Poison Claws', dmg: 190, rate: 0.3, reach: 2.3, req: 16, price: 7500, poison: true },
  scythe: { name: 'Reaper Scythe', dmg: 420, rate: 0.75, reach: 3.6, req: 26, price: 16000, sweep: true },
  driller: { name: 'Driller Claws', dmg: 260, rate: 0.28, reach: 2.3, req: 30, price: 20000, poison: true },
  silent: { name: 'Lvl 70 Silent Sword', dmg: 700, rate: 0.5, reach: 3.0, req: 34, price: 30000 },
  twinmaster: { name: 'Lvl 100 Twin Master Swords', dmg: 1100, rate: 0.4, reach: 3.3, req: 40, price: 60000, twin: true }
});
Object.assign(GUNS, {
  xbow: { name: 'Lvl 30 Crossbow', dmg: 340, rate: 0.75, mag: 8, reload: 1.6, req: 18, price: 8000, col: '#8a6a44', kind: 'crossbow', pierce: 3 },
  g70: { name: 'Lvl 70 Storm Rifle', dmg: 125, rate: 0.08, mag: 50, reload: 1.4, req: 34, price: 38000, col: '#8fe3ff', kind: 'rifle' },
  g80: { name: 'Lvl 80 Nova Launcher', dmg: 620, splash: 5, rate: 0.9, mag: 6, reload: 2.0, req: 36, price: 48000, col: '#ff6aa8', kind: 'rocket' },
  g90: { name: 'Lvl 90 Phase Sniper', dmg: 1400, rate: 1.2, mag: 4, reload: 2.0, req: 38, price: 60000, col: '#c86aff', kind: 'long' },
  g100: { name: 'Lvl 100 Backpack Minigun', dmg: 90, rate: 0.05, mag: 240, reload: 3.0, req: 40, price: 90000, col: '#ffd36a', kind: 'carbine' }
});
GEAR.shockgloves = { name: 'Shock Gloves', desc: 'Lets you wield Electric Nunchucks', col: '#4fd2ff' };
{ const _mm = makeMeleeModel;
  makeMeleeModel = function (id) {
    const g = new THREE.Group();
    if (id === 'swordgun') { part(g, Cy(0.022, 0.024, 0.16, 6), C.dark, 0, 0, 0); part(g, B(0.05, 0.46, 0.02), '#cfd4dc', 0, 0.32, 0); part(g, B(0.06, 0.14, 0.12), C.gunBody, 0, 0.12, 0.04); part(g, Cy(0.015, 0.015, 0.36, 5), C.dark, 0.035, 0.32, 0.02); part(g, B(0.01, 0.4, 0.01), glow('#ff9a3c'), 0.028, 0.32, 0); return g; }
    if (id === 'nunchucks') { for (const s of [0, 1]) part(g, Cy(0.022, 0.022, 0.22, 6), '#2b2a2c', s * 0.06, 0.1 + s * 0.18, s * 0.05, 0, 0, s * 0.8); part(g, Cy(0.006, 0.006, 0.12, 4), glow('#4fd2ff'), 0.03, 0.22, 0.02, 0, 0, 0.4); part(g, B(0.05, 0.05, 0.05), glow('#4fd2ff'), 0.12, 0.38, 0.05); return g; }
    if (id === 'claws' || id === 'driller') { part(g, B(0.1, 0.08, 0.12), '#3a3d44', 0, 0, 0); for (let k = -1; k <= 1; k++) part(g, new THREE.ConeGeometry(0.014, 0.3, 4), id === 'driller' ? '#9aa1aa' : glow('#7fff6a'), k * 0.03, 0.18, 0.02); return g; }
    if (id === 'scythe') { part(g, Cy(0.018, 0.018, 0.9, 6), toon('#3a2a1e', 'wood'), 0, 0.3, 0); part(g, new THREE.TorusGeometry(0.22, 0.02, 4, 12, Math.PI * 0.8), '#cfd4dc', 0.18, 0.72, 0, 0, 0, Math.PI * 0.6); part(g, new THREE.SphereGeometry(0.04, 6, 4), glow('#c86aff'), 0, 0.76, 0); return g; }
    if (id === 'silent') { part(g, Cy(0.02, 0.02, 0.16, 6), '#1e1c22', 0, 0, 0); part(g, B(0.03, 0.6, 0.008), '#5d636c', 0, 0.38, 0); part(g, B(0.1, 0.02, 0.03), '#1e1c22', 0, 0.09, 0); return g; }
    if (id === 'twinmaster') { for (const [s, c] of [[-1, '#4fa8ff'], [1, '#ff3b2a']]) { part(g, Cy(0.02, 0.02, 0.16, 6), '#c9a43a', 0.07 * s, 0, 0, 0, 0, 0.15 * s); part(g, B(0.035, 0.62, 0.01), glow(c), 0.07 * s + 0.045 * s, 0.38, 0, 0, 0, 0.15 * s); } return g; }
    return _mm(id);
  };
}
{ const _gm = makeGunModel; makeGunModel = function (id) { const g = _gm(id); if (GUNS[id] && GUNS[id].kind === 'crossbow') { part(g, B(0.5, 0.02, 0.03), toon('#6a4f34', 'wood'), 0, 0.09, 0.22); part(g, Cy(0.002, 0.002, 0.5, 3), '#efe7d6', 0, 0.09, 0.18, 0, 0, Math.PI / 2); part(g, new THREE.ConeGeometry(0.012, 0.06, 4), '#cfd4dc', 0, 0.11, 0.44, Math.PI / 2); } if (id === 'g100') { part(g, Cy(0.05, 0.05, 0.3, 8), '#3a3d44', 0, 0.05, 0.36, Math.PI / 2); for (let k = 0; k < 6; k++) part(g, Cy(0.01, 0.01, 0.34, 4), C.dark, Math.cos(k) * 0.03, 0.05 + Math.sin(k) * 0.03, 0.4, Math.PI / 2); } return g; }; }
// extra melee behaviors: sword-gun fires a bolt, nunchucks chain, claws poison, scythe sweeps wide
function meleeExtras(M, hits) {
  if (M.shoot) { const o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); let best = null, bt = rayClear(o, d, 30); for (const e of enemies) { if (e.dead) continue; const t = raySphere(o, d, e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), e.def.r * 1.4 * e.sc); if (t > 0 && t < bt) { bt = t; best = e; } }
    tracer(o.clone().add(V(0, -0.2, 0)), o.clone().addScaledVector(d, bt), '#ff9a3c'); SFX.laser(); if (best) { best.hp -= M.shoot * (1 + S.lvl * 0.05); best.aggro = true; if (best.hp <= 0) kill(best); else updatePlate(best); } }
  if (M.chain) for (const { e } of hits.slice(0, 1)) { let n = 0; for (const f of enemies) { if (n >= 2 || f.dead || f === e || f.obj.position.distanceTo(e.obj.position) > 6) continue; tracer(e.obj.position.clone().add(V(0, 1, 0)), f.obj.position.clone().add(V(0, 1, 0)), '#4fd2ff'); f.hp -= M.dmg * 0.5; f.aggro = true; if (f.hp <= 0) kill(f); else updatePlate(f); n++; } }
  if (M.poison) for (const { e } of hits) { e.burn = { t: 4, dps: M.dmg * 0.18, col: '#7fff6a' }; e.slow = 1.5; }
}
// ---------------- the Moon ----------------
const DOME = [0, -26];
LEVELS.moon = {
  id: 'moon', name: "Earth's Moon", tag: 'Low gravity, big jumps', lvls: 'Lv 20–30', size: 280, center: [0, 16], radius: 100, water: -99, sky: 'space', weather: 'none', gravity: 0.32, hourOffset: 0,
  terrain: { a1: 1.8, f1: 0.05, a2: 1.0, f2: 0.11, a3: 0.4, f3: 0.2, base: 1.2, min: -6, edge: 24, step: 2.2 },
  palette: { grass: '#8a8a90', patch: '#6a6a70', dirt: '#5a5a60', sand: '#a0a0a6', wet: '#4a4a50', rockA: '#7a7a80', rockB: '#5a5a60' },
  carve: (x, z, h) => { for (const [cx, cz, r] of MOON_CRATERS) { const d = Math.hypot(x - cx, z - cz); if (d < r * 1.3) { const k = d / r; h += k < 1 ? -3.2 * (1 - k * k) : 1.2 * Math.sin((k - 1) / 0.3 * Math.PI); } } return h; },
  zones: [
    { id: 'dome', name: 'Luna Dome City', lvl: 'No fighting', x: DOME[0], z: DOME[1], r: 16, fr: 17, col: '#c8c8d0', safe: true, h: 0.6 },
    { id: 'mines', name: 'Helium Mines', lvl: 'Lv 20–24', x: 44, z: 6, r: 18, col: '#7a6a5a', h: -0.6 },
    { id: 'o2', name: 'Oxygen Gardens', lvl: 'Lv 22–25', x: -44, z: 10, r: 16, col: '#6a8a6a', h: 0.8 },
    { id: 'dark', name: 'The Dark Side', lvl: 'Lv 25–28', x: -30, z: 62, r: 20, col: '#2a2a32', h: -1 },
    { id: 'pit', name: 'Excavation Pit', lvl: 'Lv 28–30 · boss', x: 40, z: 60, r: 15, fr: 12, col: '#5a4a3a', h: -3.5 }
  ],
  paths: [[[0, -10], [0, 14]], [[0, 14], [44, 6]], [[0, 14], [-44, 10]], [[0, 14], [-30, 62]], [[0, 14], [40, 60]]],
  river: [], pools: [], lava: [],
  safes: [{ x: DOME[0], z: DOME[1], r: 14.5 }], spawn: { x: 0, z: -20, yaw: Math.PI }, pad: { x: 0, z: -6 }, menu: { x: 0, z: -10, r: 36, h: 10 }, npcBase: DOME,
  npcs: [
    { id: 'selene', name: 'Mayor Selene', role: 'Luna Dome mayor', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#3b4f7a', '#e0b892', '#f4f8ff', '#c9a43a'), x: 0, z: 8, face: Math.PI, idle: ["Welcome to the Moon! Mind your step. Actually, mind your ceiling. You jump high here.", "We make oxygen, mine helium, and complain about Earth. In that order."] },
    { id: 'rocco', name: 'Sergeant Rocco', role: 'Lunar Arsenal', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#5d636c', '#c9b27c': '#ffd36a' }), x: 7, z: 6, face: -1.2, shop: 'guns', guns: ['xbow', 'g70', 'g80', 'g90', 'g100'], melee: ['swordgun', 'nunchucks', 'claws', 'scythe', 'driller', 'silent', 'twinmaster'], idle: ["Low gravity, high caliber. That's the Lunar Arsenal promise.", "The Lvl 100 Minigun has a backpack. The backpack has a backpack."] },
    { id: 'dusty', name: 'Dusty', role: 'Moon trader · buys anything', rig: 'civ', make: () => makeCivilian('#8a6a44', '#3d3a36', '#d9a77a', '#5a5560', '#c9a43a'), x: -7, z: 6, face: 1.2, shop: 'store', idle: ["Moon rocks! Genuine! Mostly genuine. Some are Earth rocks I painted grey."] },
    { id: 'oxy', name: 'Oxy', role: 'O2 tech · heals', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#6fdc5a' }), x: -8, z: -2, face: 1.4, heal: true, idle: ["BREATHE IN. BREATHE OUT. YOU ARE DOING GREAT."] },
    { id: 'pip', name: 'Professor Pip', role: 'Exotic pets', rig: 'civ', make: () => makeCivilian('#c86aff', '#2c2a28', '#e0b892', '#e8e4dc', '#ffd23a'), x: 8, z: -2, face: -1.4, petshop: true, idle: ["I bred a T-rex. Small one. Medium one. It's getting bigger."] }
  ],
  spawns: [
    { zone: 'mines', type: 'drillbot', n: 7, lv: [20, 24] }, { zone: 'mines', type: 'moonmite', n: 5, lv: [20, 23] },
    { zone: 'o2', type: 'moonmite', n: 7, lv: [22, 25] },
    { zone: 'dark', type: 'wraith', n: 7, lv: [25, 28] },
    { zone: 'pit', type: 'drillbot', n: 3, lv: [27, 29] }, { zone: 'pit', type: 'excavator', n: 1, lv: [30, 30], at: [0, 0] }
  ],
  build() {
    const [dx, dz] = DOME;
    const dome = makeDome(16, '#cfe6ff'); at(dome, dx, dz);
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.18) continue; part(props, B(3.2, 1.2, 0.5), '#9aa1aa', dx + Math.cos(a) * 15.8, groundH(dx + Math.cos(a) * 15.8, dz + Math.sin(a) * 15.8) + 0.6, dz + Math.sin(a) * 15.8, 0, -a + Math.PI / 2); }
    RINGS.push({ x: dx, z: dz, r: 15.8, gate: Math.PI / 2, half: 2.6, safe: true });
    for (const [ox, oz, h, col] of [[-8, -8, 7, '#e8e4dc'], [8, -8, 9, '#cfe6ff'], [0, -11, 12, '#e8e4dc'], [-11, 1, 5, '#c8c8d0'], [11, 1, 5, '#c8c8d0']]) { const t = makeCityBlock(3.4, h, 3.4, col, '#4fd2ff'); at(t, dx + ox, dz + oz); box(dx + ox, dz + oz, 1.8, 1.8); }
    dropshipPad(0, -6, 0, 'Return to your ship');
    // earthrise
    const earth = new THREE.Mesh(new THREE.SphereGeometry(36, 24, 16), new THREE.MeshBasicMaterial({ map: planetTex('earth'), fog: false })); earth.position.set(-72, 84, -156); levelGroup.add(earth); levelAnims.push(t => { earth.rotation.y = t * 0.02; earth.position.set(player.pos.x - 72, player.pos.y + 84, player.pos.z - 156); cl.position.copy(earth.position); }) // sits inside the camera's far plane and rides along like the sky, so it never clips away;
    const cl = new THREE.Mesh(new THREE.SphereGeometry(36.6, 24, 16), new THREE.MeshBasicMaterial({ map: planetTex('earth', 'clouds'), transparent: true, fog: false, depthWrite: false })); cl.position.copy(earth.position); levelGroup.add(cl);
    const sunL = new THREE.DirectionalLight(0xffffff, 1.0); sunL.position.set(80, 120, 40); levelGroup.add(sunL);
    // helium mines: rigs, ore carts, glowing crystals
    for (let i = 0; i < 5; i++) { const a = i * 1.25, x = Z.mines.x + Math.cos(a) * 10, z = Z.mines.z + Math.sin(a) * 10, rig = new THREE.Group(); for (const s of [-1, 1]) part(rig, B(0.3, 6, 0.3), '#c9a43a', s * 1.2, 3, 0, 0, 0, -0.18 * s); part(rig, B(3, 0.4, 0.4), '#c9a43a', 0, 5.8, 0); part(rig, Cy(0.15, 0.15, 6, 6), '#5d636c', 0, 3, 0); at(rig, x, z, a); solid(x, z, 1.2); }
    for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.4 + (i % 3) * 0.2, 0), glow(i % 2 ? '#9fe8ff' : '#c86aff')); c.scale.y = 2; at(c, Z.mines.x + rand(-14, 14), Z.mines.z + rand(-14, 14), i, 0.4); }
    // oxygen gardens: glass greenhouses with plants
    for (let i = 0; i < 6; i++) { const a = i * 1.05, x = Z.o2.x + Math.cos(a) * 8, z = Z.o2.z + Math.sin(a) * 8, gh = new THREE.Group();
      const gl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 5, 10, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })); gl.rotation.z = Math.PI / 2; gl.position.y = 0; gh.add(gl);
      for (let k = 0; k < 4; k++) part(gh, new THREE.IcosahedronGeometry(0.4, 0), toon('#5fa04a', 'leaves'), -1.6 + k * 1.1, 0.5, 0); at(gh, x, z, a); box(x, z, 1.4, 1.4); }
    // the dark side: black monoliths
    for (let i = 0; i < 9; i++) { const a = i * 0.7, x = Z.dark.x + Math.cos(a) * 12, z = Z.dark.z + Math.sin(a) * 12; part(props, B(1, 5 + (i % 3) * 2, 0.4), '#0a0a10', x, groundH(x, z) + 2.5, z, 0, a, 0); solid(x, z, 0.6); }
    tufts(0);
  }
};
const MOON_CRATERS = [[20, 30, 9], [-14, 34, 7], [60, -20, 10], [-60, -24, 8], [10, 84, 12], [-70, 40, 6], [70, 36, 7]];
Object.assign(ENEMY, {
  drillbot: { rig: 'xr17', name: 'Drill Bot', make: makeDrillbot, scale: 1.2, hp: 360, speed: 2.4, r: 0.5, hy: 0.8, xp: 70, cr: [14, 24], melee: { dmg: 30, rate: 1.0, reach: 2.0 }, drops: [['scrap', 0.6], ['cell', 0.2]] },
  moonmite: { name: 'Moon Mite', make: makeMoonmite, scale: 1.4, hp: 180, speed: 4.6, r: 0.45, hy: 0.35, xp: 50, cr: [8, 16], melee: { dmg: 20, rate: 0.7, reach: 1.5 }, drops: [['crystal', 0.35]] },
  wraith: { name: 'Dark Wraith', make: makeWraith, fly: true, hp: 420, speed: 3.0, r: 0.5, hy: 1.3, xp: 90, cr: [18, 30], ranged: { dmg: 28, rate: 1.4, speed: 16, col: '#ff2a3a', range: 20, keep: 10 }, drops: [['essence', 0.4]] },
  excavator: { name: 'The Excavator', make: makeExcavator, scale: 2.4, hp: 9000, speed: 1.6, r: 1.2, hy: 1.2, xp: 5000, cr: [900, 1200], boss: true, melee: { dmg: 70, rate: 1.4, reach: 3.2 }, lob: { dmg: 45, rate: 2.2, speed: 13, range: 24, keep: 6, col: '#ffd36a' }, drops: [['moondrill', 1], ['cell', 1], ['crystal', 1]] }
});
ITEMS.moondrill = { name: "Excavator's Drill Bit", v: 0, col: '#ffd36a', quest: true };
ITEMS.o2filter = { name: 'O2 Filter', v: 0, col: '#6fdc5a', quest: true };
ENEMY.moonmite.drops.push(['o2filter', 0.5]);
SPACE_BODIES.moon.survey = "Earth's Moon";
PLANET_ORDER.splice(PLANET_ORDER.indexOf('mezar'), 0, 'moon');
defQuest('l1', { ch: "Earth's Moon", title: 'One Small Step', giver: 'selene', turnIn: 'selene', req: [],
  intro: ["A visitor! Welcome to Luna Dome. Population: four hundred, oxygen: just about enough.", "Something's wrong in the Helium Mines, east of the dome. The drill bots stopped drilling and started... drilling people.", "Go take a look. And try the jumping. Everybody loves the jumping."],
  obj: [{ kind: 'kill', t: 'drillbot', n: 5, text: 'Stop rogue drill bots in the Helium Mines', zone: 'mines' }],
  outro: ["They carry the red mark too. Even here. The Setting Sun reached the Moon."], reward: { cr: 2000, xp: 7000 } });
defQuest('l2', { ch: "Earth's Moon", title: 'Breathing Room', giver: 'oxy', turnIn: 'oxy', req: ['l1'],
  intro: ["MOON MITES ATE OUR O2 FILTERS. THIS IS BAD. PLEASE RETRIEVE FOUR. I WILL BE BREATHING. CAREFULLY."],
  obj: [{ kind: 'item', t: 'o2filter', n: 4, text: 'Take back O2 Filters from moon mites', zone: 'o2' }],
  outro: ["AIR LEVELS: EXCELLENT. YOU ARE A GOOD HUMAN. HERE IS A REWARD."], reward: { cr: 2500, xp: 8000, take: { o2filter: 4 }, items: { cell: 2 } } });
defQuest('l3', { ch: "Earth's Moon", title: 'The Excavator', giver: 'selene', turnIn: 'selene', req: ['l1'], main: true,
  intro: ["The mines' biggest machine, the Excavator, is the one giving orders. It's in the Excavation Pit, northeast.", "Shut it down. Bring back its drill bit so we know it's really over."],
  obj: [{ kind: 'item', t: 'moondrill', n: 1, text: 'Defeat the Excavator and take its drill bit', zone: 'pit' }],
  outro: ["It's over. The Moon is quiet again. Well, it was always quiet. Now it's peacefully quiet.", "Rocco says the Arsenal's open to you. And Pip has... something with teeth. You've earned it."], reward: { cr: 5000, xp: 14000, take: { moondrill: 1 } } });
// more helmets from the 2×3 head-design sheet
Object.assign(HELMS, { horns: { name: 'Horned Helm', lvl: 8 }, skull: { name: 'Skull Mask', lvl: 18 }, bubble: { name: 'Bubble Helmet', lvl: 1, q: 'l1' }, crest: { name: 'Gladiator Crest', lvl: 12 }, antenna: { name: 'Antenna Visor', lvl: 5 }, goggles: { name: 'Goggle Cap', lvl: 3 } });
Object.assign(HELM_KITS, {
  horns(g) { for (const s of [-1, 1]) chain(g, [[0.14 * s, 1.85, 0], [0.26 * s, 1.95, 0.02], [0.3 * s, 2.12, 0.08]], 0.04, '#efe7d6', 0.012); },
  skull(g) { E(g, '#efe7d6', 0, 1.76, 0.1, 0.15, 0.16, 0.09); for (const s of [-1, 1]) E(g, '#1a1a1e', 0.055 * s, 1.79, 0.18, 0.035, 0.04, 0.02); part(g, B(0.1, 0.03, 0.02), '#1a1a1e', 0, 1.69, 0.18); },
  bubble(g) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 8), new THREE.MeshLambertMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.3, depthWrite: false })); b.position.set(0, 1.76, 0); g.add(b); },
  crest(g) { for (let k = 0; k < 7; k++) part(g, B(0.04, 0.16, 0.06), '#c8402f', 0, 1.95 + Math.sin(k / 6 * Math.PI) * 0.06, -0.18 + k * 0.06); },
  antenna(g) { for (const s of [-1, 1]) { part(g, Cy(0.006, 0.006, 0.3, 4), C.dark, 0.1 * s, 2.05, -0.02, 0, 0, -0.3 * s); part(g, new THREE.SphereGeometry(0.03, 6, 4), glow('#6fdc5a'), 0.15 * s, 2.19, -0.02); } },
  goggles(g) { for (const s of [-1, 1]) { part(g, Cy(0.05, 0.05, 0.05, 10), '#c9a43a', 0.06 * s, 1.88, 0.11, Math.PI / 2 - 0.4); part(g, Cy(0.038, 0.038, 0.052, 10), glow('#ffb347'), 0.06 * s, 1.88, 0.115, Math.PI / 2 - 0.4); } }
});
{ const _mp = makePlayerChar;
  makePlayerChar = function (look, col) {
    const g = _mp(look, col), h = look && look.h;
    if (h && HELM_KITS[h] && !g.userData._helmCustom) { g.userData._helmCustom = true; HELM_KITS[h](g, look); }
    return g;
  };
}
