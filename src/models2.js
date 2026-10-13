// =================== MORE MODELS (Mezar and beyond) ===================
// Black and red ants that attack in a swarm (enemies page)
function makeAnt(col) {
  const g = new THREE.Group();
  const body = col || '#24201e';
  const bodyDark = '#141211';
  const jawCol = '#8a3a2e';
  const leg = '#151210';
  const eyeCol = glow('#ff3b2a');

  // Root container for body pitch / crawl bob
  const root = new THREE.Group();
  g.add(root);

  // 1. Tagmata (Head, Thorax, Petiole Waist & Abdominal Gaster)
  // Head (wide, heart/triangle shaped)
  const head = E(root, body, 0, 0.33, 0.32, 0.14, 0.12, 0.14);

  // Mesosoma (Thorax / midsection)
  E(root, body, 0, 0.33, 0.06, 0.10, 0.09, 0.15);

  // Petiole (The critical thin double-node waist connector)
  part(root, Cy(0.03, 0.04, 0.09, 6), bodyDark, 0, 0.32, -0.10, Math.PI / 2);
  part(root, new THREE.SphereGeometry(0.045, 6, 6), body, 0, 0.36, -0.11); // Dorsal node

  // Gaster (Pointed rear bulb / abdomen)
  const gaster = E(root, body, 0, 0.36, -0.34, 0.16, 0.15, 0.25);
  // Stinger / acidopore tip
  part(root, new THREE.ConeGeometry(0.015, 0.08, 4), bodyDark, 0, 0.34, -0.58, -Math.PI / 2);

  // 2. Eyes, Elbowed Antennae & Sickle Mandibles
  const antennae = [];
  const mandibles = [];

  for (const s of [-1, 1]) {
    // Compound oval eye
    E(root, eyeCol, 0.11 * s, 0.38, 0.33, 0.035, 0.035, 0.025);

    // Sickle-shaped toothed mandible (angled forward and curved inward)
    const jaw = new THREE.Group();
    jaw.position.set(0.045 * s, 0.28, 0.44);
    root.add(jaw);
    mandibles.push({ jaw, sign: s });

    const m = part(jaw, new THREE.ConeGeometry(0.022, 0.14, 4), jawCol, 0, 0, 0.06, Math.PI / 2, 0, 0.35 * s);
    m.scale.set(1.4, 1.0, 0.4); // flatten into a blade

    // Elbowed geniculate antenna (scape -> bent funiculus)
    const antRoot = new THREE.Group();
    antRoot.position.set(0.04 * s, 0.38, 0.42);
    root.add(antRoot);
    antennae.push({ antRoot, sign: s });

    // Scape (base stalk angles up and out)
    chain(antRoot, [
      [0, 0, 0],
      [0.08 * s, 0.14, 0.06]
    ], 0.012, leg, 0.009);

    // Funiculus (bends sharply forward and taps the ground)
    chain(antRoot, [
      [0.08 * s, 0.14, 0.06],
      [0.12 * s, 0.10, 0.22],
      [0.14 * s, 0.02, 0.32]
    ], 0.009, leg, 0.005);
  }

  // 3. Six Articulated Legs (Leg groups with distinct knee peaks)
  const legs = [];
  // Offsets: front, middle, hind legs
  const legConfigs = [
    { z:  0.16, angleZ:  0.35, fwd:  0.10 }, // Front leg (reaches forward)
    { z:  0.06, angleZ:  0.00, fwd:  0.00 }, // Middle leg (lateral splay)
    { z: -0.04, angleZ: -0.35, fwd: -0.14 }  // Hind leg (trails back)
  ];

  for (const s of [-1, 1]) {
    legConfigs.forEach((cfg, idx) => {
      const lg = new THREE.Group();
      lg.position.set(0.08 * s, 0.32, cfg.z);
      root.add(lg);

      // Co-xa & Femur (peaks up high above body)
      const kneeX = 0.22 * s;
      const kneeY = 0.16;
      const kneeZ = cfg.fwd * 0.5;

      // Tibia & Tarsus (angles down to ground contact)
      const footX = 0.34 * s;
      const footY = -0.32;
      const footZ = cfg.fwd * 1.2;

      chain(lg, [
        [0, 0, 0],
        [kneeX, kneeY, kneeZ],
        [footX, footY, footZ]
      ], 0.018, leg, 0.010, true);

      // Index 0, 1, 2 on left (-1) vs right (+1)
      const legIndex = (s === -1 ? 0 : 3) + idx;
      legs.push({ group: lg, index: legIndex, sign: s, row: idx });
    });
  }

  // 4. Mobile Tripod Crawl & Antenna Sensory Animation Loop
  g.userData.anim = (t) => {
    // Subtle body pitch and lateral sway during crawl
    root.position.y = Math.sin(t * 24.0) * 0.012;
    root.rotation.y = Math.sin(t * 12.0) * 0.03;

    // True alternating tripod gait (Tripod A vs Tripod B)
    // Group A: Left Front (0), Left Hind (2), Right Mid (4)
    // Group B: Left Mid (1), Right Front (3), Right Hind (5)
    legs.forEach(l => {
      const isTripodA = (l.index === 0 || l.index === 2 || l.index === 4);
      const phase = isTripodA ? 0 : Math.PI;

      // Leg step cycle: lift up on forward swing, plant on backward drive
      const step = Math.sin(t * 12.0 + phase);
      l.group.rotation.y = step * 0.32 * l.sign;
      l.group.rotation.x = Math.max(0, -step) * 0.18; // foot lift off ground
    });

    // Antenna searching twitch (rapid, irregular feeler sweeps)
    antennae.forEach((a, i) => {
      a.antRoot.rotation.x = Math.sin(t * 6.0 + i) * 0.12;
      a.antRoot.rotation.y = Math.cos(t * 8.0 + i) * 0.15 * a.sign;
    });

    // Mandibles subtle idle click/threat flex
    const bite = Math.max(0, Math.sin(t * 3.0) * 0.14);
    mandibles.forEach(m => {
      m.jaw.rotation.y = -bite * m.sign;
    });
  };

  g.userData.anim(0);
  return g;
}
// Bug-bug: little round flying beetle (enemies page)
function makeBugbug() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = 1.4;
  g.add(body);

  const carapace = '#2d471e';
  const abdomenStripes = '#c4b33f';
  const headChitin = '#162211';
  const mandiblesCol = '#0f170c';
  const eyeGlow = glow('#ffe247');
  const wingCol = glow('#d4eeff');

  // 1. Segmented Body: Abdomen, Thorax & Head
  // Abdomen (rear segment with warning bands)
  E(body, carapace, 0, 0.02, -0.16, 0.24, 0.22, 0.30);
  E(body, abdomenStripes, 0, 0.05, -0.14, 0.22, 0.16, 0.24);
  part(body, new THREE.ConeGeometry(0.06, 0.14, 4), headChitin, 0, 0.02, -0.42, -Math.PI / 2); // Abdomen stinger

  // Thorax (central muscular segment)
  E(body, carapace, 0, 0.04, 0.10, 0.22, 0.20, 0.18);
  part(body, B(0.26, 0.08, 0.16), headChitin, 0, 0.12, 0.10); // Thoracic dorsal plate

  // Head capsule
  E(body, headChitin, 0, -0.01, 0.28, 0.15, 0.14, 0.14);

  // 2. Eyes, Antennae & Clamping Mandibles
  for (const s of [-1, 1]) {
    // Compound glowing eyes
    E(body, eyeGlow, 0.085 * s, 0.04, 0.36, 0.045, 0.05, 0.035);

    // Curved jointed antennae
    chain(body, [
      [0.05 * s, 0.08, 0.36],
      [0.10 * s, 0.22, 0.46],
      [0.15 * s, 0.32, 0.54]
    ], 0.014, headChitin, 0.005, true);

    // Predatory pincer mandibles
    part(body, new THREE.ConeGeometry(0.022, 0.14, 3), mandiblesCol, 0.045 * s, -0.09, 0.40, Math.PI / 1.15, 0, -0.4 * s);
  }

  // 3. Dual-Layer Translucent Insect Wings
  const wings = [];
  for (const s of [-1, 1]) {
    const wingRoot = new THREE.Group();
    wingRoot.position.set(0.12 * s, 0.16, 0.04);
    body.add(wingRoot);
    wings.push({ wingRoot, s });

    // Forewing (larger)
    const fore = part(wingRoot, B(0.55, 0.015, 0.22), wingCol, 0.28 * s, 0, -0.04);
    fore.material = fore.material.clone();
    fore.material.transparent = true;
    fore.material.opacity = 0.55;

    // Hindwing (smaller auxiliary wing)
    const hind = part(wingRoot, B(0.38, 0.015, 0.16), wingCol, 0.18 * s, -0.02, -0.16);
    hind.material = fore.material;
  }

  // 4. Jointed Tucked Insect Legs
  const legs = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const legGroup = new THREE.Group();
      const zOffset = 0.16 - k * 0.12;
      legGroup.position.set(0.12 * s, -0.06, zOffset);
      body.add(legGroup);
      legs.push({ legGroup, s, k });

      // Articulated leg: Coxa -> Femur -> Tibia hook
      chain(legGroup, [
        [0, 0, 0],
        [0.10 * s, -0.10, 0.04],
        [0.14 * s, -0.28, 0.02],
        [0.11 * s, -0.36, -0.02]
      ], 0.02, headChitin, 0.008, true);
    }
  }

  // 5. High-Frequency Flight & Hover Animation Loop
  g.userData.anim = (t) => {
    // Flight path bob, pitch, and yaw banking
    body.position.y = 1.4 + Math.sin(t * 3.5) * 0.14;
    body.rotation.x = 0.08 + Math.sin(t * 2.2) * 0.06;
    body.rotation.z = Math.sin(t * 2.8) * 0.05;

    // High-speed wing flutter
    const flutter = Math.sin(t * 48.0) * 0.65;
    for (const w of wings) {
      w.wingRoot.rotation.z = flutter * w.s;
      w.wingRoot.rotation.y = Math.cos(t * 48.0) * 0.18 * w.s;
    }

    // Dangling leg flight drag
    for (const l of legs) {
      l.legGroup.rotation.x = Math.sin(t * 3.5 + l.k * 0.6) * 0.08;
    }
  };

  g.userData.anim(0);
  return g;
}
// Snorfal: spiked croc from the pets sheet, here gone wild in the dunes
function makeSnorfal(col) {
  const g = new THREE.Group();
  const skin = col || '#5f8a3a';
  const skinDark = '#3d6124';
  const spike = '#3a5ea8';
  const belly = '#d8c890';
  const boneCol = (typeof C !== 'undefined' && C.bone) ? C.bone : '#ded7c1';
  const eyeGlow = glow('#ffd23a');

  const root = new THREE.Group();
  g.add(root);

  // 1. Four Splayed Reptilian Limbs & Claws (Grounded flush to y = 0.0)
  const legs = [];
  const legPairs = [
    { z:  0.34, isFront: true },
    { z: -0.32, isFront: false }
  ];

  for (const sx of [-1, 1]) {
    legPairs.forEach(pair => {
      const legGroup = new THREE.Group();
      legGroup.position.set(0.24 * sx, 0.36, pair.z);
      root.add(legGroup);

      // Low-slung arching lizard gait: shoulder/hip -> elbow/knee -> foot
      chain(legGroup, [
        [0, 0, 0],
        [0.14 * sx, 0.04, 0.04 * (pair.isFront ? 1 : -1)],
        [0.18 * sx, -0.16, 0.06 * (pair.isFront ? 1 : -1)],
        [0.14 * sx, -0.36, 0.08 * (pair.isFront ? 1 : -1)]
      ], 0.052, skin, 0.032, true);

      // Grounded foot pad & three-toed reptile talons
      const footZ = 0.08 * (pair.isFront ? 1 : -1);
      E(legGroup, skinDark, 0.14 * sx, -0.35, footZ + 0.02, 0.045, 0.015, 0.05);

      for (let t = -1; t <= 1; t++) {
        part(
          legGroup,
          new THREE.ConeGeometry(0.012, 0.05, 3),
          skinDark,
          (0.14 + t * 0.025) * sx,
          -0.35,
          footZ + 0.06,
          Math.PI / 2.2,
          0,
          0.2 * t * sx
        );
      }

      legs.push({ legGroup, sx, isFront: pair.isFront });
    });
  }

  // 2. Heavy Armored Body & Pale Belly
  // Main torso barrel
  E(root, skin, 0, 0.42, 0, 0.32, 0.22, 0.75);
  // Soft underbelly
  E(root, belly, 0, 0.32, 0.05, 0.26, 0.12, 0.62);

  // Dorsal armored ridge and crystalline back spikes
  for (let k = 0; k < 6; k++) {
    const spikeZ = -0.42 + k * 0.17;
    const spikeH = 0.22 + Math.sin(k * 0.6) * 0.08;
    part(root, new THREE.ConeGeometry(0.065, spikeH, 4), spike, 0, 0.64, spikeZ, -0.1, 0, 0);

    // Flank osteoderm studs
    for (const sx of [-1, 1]) {
      part(root, new THREE.ConeGeometry(0.03, 0.08, 4), skinDark, 0.24 * sx, 0.50, spikeZ, 0, 0, -0.6 * sx);
    }
  }

  // 3. Crocodile / Drake Head & Fanged Jaws
  const head = new THREE.Group();
  head.position.set(0, 0.40, 0.70);
  root.add(head);

  // Skull cranium
  E(head, skin, 0, 0.04, 0.08, 0.18, 0.13, 0.24);

  // Upper snout
  E(head, skin, 0, -0.02, 0.26, 0.14, 0.09, 0.24);

  // Lower jaw
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.10, 0.18);
  head.add(jaw);
  E(jaw, belly, 0, 0, 0.08, 0.12, 0.06, 0.22);

  // Glowing eyes with brow shields
  for (const s of [-1, 1]) {
    E(head, eyeGlow, 0.10 * s, 0.12, 0.06, 0.035, 0.035, 0.03);
    part(head, B(0.04, 0.02, 0.06), skinDark, 0.10 * s, 0.15, 0.06, 0, 0, -0.2 * s);

    // Serrated fangs along jawline
    for (let k = 0; k < 4; k++) {
      part(head, new THREE.ConeGeometry(0.014, 0.06, 3), boneCol, 0.09 * s, -0.07, 0.14 + k * 0.08, Math.PI);
      part(jaw, new THREE.ConeGeometry(0.012, 0.05, 3), boneCol, 0.08 * s, 0.04, 0.04 + k * 0.07, 0);
    }
  }

  // 4. Articulated Muscular Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.40, -0.70);
  root.add(tail);

  chain(tail, [
    [0, 0, 0],
    [0, -0.04, -0.38],
    [0, -0.08, -0.72],
    [0, -0.12, -1.02]
  ], 0.13, skin, 0.035, true);

  // Spikes trailing down tail spine
  for (let k = 0; k < 3; k++) {
    part(tail, new THREE.ConeGeometry(0.05, 0.18, 4), spike, 0, 0.09 - k * 0.02, -0.25 - k * 0.30, -0.2, 0, 0);
  }

  // 5. Heavy Crawling & Stalking Animation Loop
  g.userData.anim = (t) => {
    // Low belly crawling heave & breathing
    root.position.y = Math.sin(t * 3.0) * 0.008;

    // Head tracking sway & slight jaw chew
    head.rotation.y = Math.sin(t * 1.5) * 0.14;
    head.rotation.x = Math.sin(t * 2.5) * 0.04;
    jaw.rotation.x = Math.max(0, Math.sin(t * 2.0)) * 0.08;

    // Fluid reptile tail undulation
    tail.rotation.y = Math.sin(t * 3.0) * 0.32;
    tail.rotation.z = Math.cos(t * 1.5) * 0.05;

    // Diagonal trotting leg shuffle
    legs.forEach(l => {
      const phase = (l.sx > 0 ? 0 : Math.PI) + (l.isFront ? 0 : Math.PI);
      l.legGroup.rotation.y = Math.sin(t * 3.0 + phase) * 0.12 * l.sx;
    });
  };

  g.userData.anim(0);
  return g;
}
// Gut worm: segmented cave worm with a ring of teeth (grid page)
function makeGutworm(col) {
  const g = new THREE.Group();
  const skin = col || '#b86a6a';
  const band = '#7a3a3a';
  const darkMeat = '#2a0e0e';
  const boneCol = (typeof C !== 'undefined' && C.bone) ? C.bone : '#ded7c1';
  const segs = [];

  // 1. Segmented Annelid Body & Radial Spine Rings
  for (let k = 0; k < 9; k++) {
    const s = new THREE.Group();
    g.add(segs[k] = s);
    const r = 0.42 - k * 0.025;

    // Fleshy visceral segment
    E(s, k % 2 ? skin : band, 0, 0, 0, r, r, 0.3);

    // Lateral chitin spikes along body flanks
    for (let j = 0; j < 4; j++) {
      const a = j * (Math.PI / 2) + k;
      part(
        s,
        new THREE.ConeGeometry(0.045, 0.16, 4),
        boneCol,
        Math.cos(a) * r,
        Math.sin(a) * r,
        0,
        0,
        0,
        a - Math.PI / 2
      );
    }
  }

  const mouth = segs[0];

  // 2. Maw & Circular Hook Teeth
  E(mouth, darkMeat, 0, 0, 0.26, 0.26, 0.26, 0.06); // Gullet maw void
  for (let j = 0; j < 8; j++) {
    const a = (j / 8) * Math.PI * 2;
    const tooth = part(
      mouth,
      new THREE.ConeGeometry(0.045, 0.22, 4),
      boneCol,
      Math.cos(a) * 0.28,
      Math.sin(a) * 0.28,
      0.30,
      Math.PI / 2,
      0,
      a + Math.PI / 2
    );
    tooth.rotation.x += 0.25; // Inward curved lamprey-style bite
  }

  // 3. Squirming Tendrils / Tentacles Emanating Behind Head (Base of Segment 0/1)
  const tentacles = [];
  const tentacleCount = 6;
  const collarCol = band;

  for (let i = 0; i < tentacleCount; i++) {
    const tentRoot = new THREE.Group();
    const baseAngle = (i / tentacleCount) * Math.PI * 2;
    const spawnR = 0.36;

    // Mount to the rear collar of the head segment
    tentRoot.position.set(Math.cos(baseAngle) * spawnR, Math.sin(baseAngle) * spawnR, -0.14);
    tentRoot.rotation.z = baseAngle;
    mouth.add(tentRoot);

    // Multi-segment curling tentacle reaching forward past the maw
    chain(tentRoot, [
      [0, 0, 0],
      [0.08, 0, 0.22],
      [0.16, 0, 0.52],
      [0.10, 0, 0.82]
    ], 0.05, collarCol, 0.012, true);

    // Visceral bulb / suction barb at tip
    part(tentRoot, new THREE.ConeGeometry(0.016, 0.07, 3), darkMeat, 0.10, 0, 0.86, Math.PI / 2);

    tentacles.push({ tentRoot, baseAngle, phase: i * 1.05 });
  }

  // 4. Slithering Undulation & Grasping Tentacle Animation
  g.userData.anim = (t) => {
    // Body spine slither & sinusoidal rearing
    for (let k = 0; k < segs.length; k++) {
      const ph = t * 2.2 - k * 0.55;
      segs[k].position.set(
        Math.sin(ph) * 0.35 * (k / 8),
        0.3 + (segs.length - 1 - k) * 0.4 + Math.sin(ph * 0.7) * 0.08,
        Math.cos(ph) * 0.12 * (1 - k / 8)
      );
      segs[k].rotation.set(
        Math.cos(ph * 0.8) * 0.08,
        Math.sin(ph) * 0.12,
        0
      );
    }

    // Coiling, whipping tentacle motion
    tentacles.forEach(tn => {
      tn.tentRoot.rotation.x = Math.sin(t * 3.5 + tn.phase) * 0.35;
      tn.tentRoot.rotation.y = Math.cos(t * 3.0 + tn.phase) * 0.28;
    });
  };

  g.userData.anim(0);
  return g;
}
// Bug City tower: stacked hive tiers with doorways (Mezar page)
function makeHive(s, col) {
  const g = new THREE.Group(), a = col || '#d8a85a', b = '#c4924a', dk = '#3a2c1c';
  for (let k = 0; k < 4; k++) {
    const r = (3.2 - k * 0.55) * s, y = (1.1 + k * 1.9) * s;
    E(g, k % 2 ? a : b, 0, y, 0, r, 1.0 * s, r);
    for (let d = 0; d < 6; d++) { const ang = d / 6 * Math.PI * 2 + k * 0.5; const dm = part(g, B(0.5 * s, 0.75 * s, 0.1), dk, Math.cos(ang) * r * 0.96, y - 0.1 * s, Math.sin(ang) * r * 0.96, 0, -ang + Math.PI / 2); dm.scale.z = 2; }
  }
  E(g, a, 0, 8.6 * s, 0, 0.9 * s, 0.7 * s, 0.9 * s);
  part(g, new THREE.OctahedronGeometry(0.4 * s, 0), glow('#ffd23a'), 0, 9.5 * s, 0);
  return g;
}
function makeWreck() {
  const g = new THREE.Group(), hull = '#8a8f96', dk = '#3a3d44';
  part(g, B(2.6, 1.4, 6), hull, 0, 0.5, 0, 0.12, 0.3, 0.25);
  part(g, B(2.2, 0.9, 1.8), dk, 0.4, 1.1, 2.4, 0.4, 0.3, 0.2);
  part(g, B(5, 0.18, 1.6), hull, -0.4, 0.9, -0.6, 0.1, 0.3, -0.45);
  for (let i = 0; i < 6; i++) part(g, new THREE.DodecahedronGeometry(rand(0.2, 0.5), 0), toon('#6a5a48', 'stone'), rand(-3, 3), 0.1, rand(-4, 4));
  const smoke = new THREE.Group(); g.add(smoke);
  for (let i = 0; i < 5; i++) { const m = part(smoke, new THREE.IcosahedronGeometry(0.4 + i * 0.12, 0), glow('#5a5a5a'), 0.3, 1.6 + i * 0.7, 0.4); m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.5 - i * 0.08; }
  g.userData.smoke = smoke;
  return g;
}
function makeBeacon() {
  const g = new THREE.Group();
  part(g, Cy(0.18, 0.3, 0.5, 6), '#5d636c', 0, 0.25, 0); part(g, Cy(0.04, 0.04, 1.4, 4), C.dark, 0, 1.1, 0);
  part(g, new THREE.SphereGeometry(0.14, 8, 6), glow('#ff3b2a'), 0, 1.85, 0);
  return g;
}

