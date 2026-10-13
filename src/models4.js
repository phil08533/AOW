// =================== ROBOT CITY MODELS ===================
// ZR-306: hulking scrap-zombie robot with open chest and dangling wires
function makeZR306() {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Industrial / Scavenged Mech Palette
  const plateGrey = '#737880';
  const frameDk = '#383c44';
  const rustPlate = '#8c5234';
  const hazardYel = '#d49b28';
  const hydraulicSteel = '#9ca3af';
  const darkCore = '#16171a';
  const darkSpike = (typeof C !== 'undefined' && C.dark) ? C.dark : '#1a1b1f';
  const visorGlow = glow('#ff3b2a');
  const reactorGlow = glow('#ff6a1a');

  // 1. Hydraulic Piston Legs & Grounded Treads (y = 0.0 to clear z-fighting)
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(0.18 * s, 0, 0);
    root.add(leg);
    legs.push({ leg, s });

    // Sole rubber grip (y = 0.0 to 0.03)
    part(leg, B(0.24, 0.03, 0.38), '#1e2024', 0, 0.015, 0.02);
    // Lower foot housing (y = 0.03 to 0.13)
    part(leg, B(0.22, 0.10, 0.34), frameDk, 0, 0.08, 0.02);
    part(leg, Cy(0.05, 0.05, 0.20, 6), hydraulicSteel, 0, 0.08, 0.16, 0, 0, Math.PI / 2);

    // Shin strut & armored greave (y = 0.14 to 0.50)
    part(leg, B(0.19, 0.36, 0.21), s > 0 ? rustPlate : plateGrey, 0, 0.32, 0.02);
    part(leg, Cy(0.035, 0.035, 0.32, 6), hydraulicSteel, -0.06 * s, 0.32, -0.06);

    // Knee cap joint (y = 0.51 to 0.60)
    part(leg, Cy(0.075, 0.075, 0.21, 8), frameDk, 0, 0.55, 0.02, 0, 0, Math.PI / 2);
    part(leg, B(0.15, 0.10, 0.05), hazardYel, 0, 0.55, 0.14);

    // Thigh armor (y = 0.61 to 0.92)
    part(leg, B(0.21, 0.31, 0.23), s > 0 ? plateGrey : rustPlate, 0, 0.76, 0);
    part(leg, Cy(0.03, 0.03, 0.28, 6), hydraulicSteel, 0.06 * s, 0.76, 0.04);
  }

  // 2. Pelvis & Torso Chassis (Stepped z-offsets prevent surface flickering)
  part(root, B(0.56, 0.16, 0.30), frameDk, 0, 0.98, 0);
  part(root, Cy(0.11, 0.11, 0.18, 8), frameDk, 0, 1.08, 0);

  const torso = new THREE.Group();
  torso.position.set(0, 1.34, 0);
  root.add(torso);

  // Main chassis block
  part(torso, B(0.70, 0.52, 0.44), plateGrey, 0, 0, 0, 0.12, 0, 0);
  // Rear plate placed cleanly back
  part(torso, B(0.62, 0.44, 0.10), rustPlate, 0, 0.04, -0.26, -0.1, 0, 0);
  // Bottom hazard trim
  part(torso, B(0.72, 0.05, 0.46), hazardYel, 0, -0.22, 0);

  // Stepped Core Vent (Offset from chest face z=0.22 -> 0.25 -> 0.28)
  part(torso, B(0.36, 0.26, 0.06), darkCore, 0, 0.02, 0.24);
  part(torso, new THREE.OctahedronGeometry(0.065, 0), reactorGlow, 0, 0.02, 0.28);
  // Protective grille bars sitting well in front of reactor
  part(torso, B(0.38, 0.025, 0.025), frameDk, 0, 0.08, 0.31);
  part(torso, B(0.38, 0.025, 0.025), frameDk, 0, -0.04, 0.31);

  // Wiring loom looping forward
  const wireCols = ['#c8402f', '#4fa8ff', '#ffd23a', '#6fdc5a'];
  for (let k = 0; k < 4; k++) {
    const xOff = (k - 1.5) * 0.08;
    chain(torso, [
      [xOff, -0.08, 0.24],
      [xOff * 1.25, -0.24, 0.33],
      [xOff * 0.9, -0.38, 0.27]
    ], 0.012, wireCols[k], 0.009, true);
  }

  // 3. Heavy Armored Arms
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(0.48 * s, 1.48, 0);
    root.add(arm);
    arms.push({ arm, s });

    part(arm, Cy(0.14, 0.14, 0.20, 8), frameDk, 0, 0, 0, 0, 0, Math.PI / 2);
    part(arm, B(0.22, 0.16, 0.26), s > 0 ? plateGrey : rustPlate, 0.04 * s, 0.08, 0);

    part(arm, B(0.17, 0.40, 0.19), s > 0 ? rustPlate : plateGrey, 0.04 * s, -0.24, 0.02);
    part(arm, Cy(0.03, 0.03, 0.34, 6), hydraulicSteel, 0, -0.24, -0.06);

    part(arm, B(0.23, 0.24, 0.26), frameDk, 0.04 * s, -0.52, 0.06);

    for (let k = 0; k < 3; k++) {
      const clawX = (0.04 + (k - 1) * 0.06) * s;
      part(
        arm,
        new THREE.ConeGeometry(0.026, 0.13, 4),
        darkSpike,
        clawX,
        -0.70,
        0.10,
        Math.PI,
        0,
        (k - 1) * 0.15 * s
      );
    }
  }

  // 4. Head Assembly (No internal orange box; stepped visor and clean antenna)
  const head = new THREE.Group();
  head.position.set(0, 1.78, 0.04);
  root.add(head);

  // Skull casting (width 0.34, height 0.26, depth 0.30 -> front face at z = +0.15)
  part(head, B(0.34, 0.26, 0.30), plateGrey, 0, 0, 0);
  part(head, B(0.16, 0.22, 0.04), rustPlate, 0.10, 0.04, -0.16); // Reinforcement plate on the rear

  // Visor placed forward of front skull face (z = 0.17)
  part(head, B(0.26, 0.06, 0.03), visorGlow, 0, 0.04, 0.17);
  // Lower intake vent sitting forward at z = 0.165 without overlapping visor
  part(head, B(0.16, 0.04, 0.025), darkCore, 0, -0.06, 0.165);

  // Antenna placed on top outside the skull
  chain(head, [
    [-0.12, 0.13, -0.06],
    [-0.14, 0.32, -0.08],
    [-0.14, 0.44, -0.10]
  ], 0.016, hydraulicSteel, 0.005, true);

  // Small antenna tip light (positioned above the pole at y = 0.47, outside skull)
  part(head, new THREE.OctahedronGeometry(0.02, 0), glow('#ff3b2a'), -0.14, 0.47, -0.10);

  // 5. Animation Loop
  g.userData.anim = (t) => {
    root.position.y = Math.sin(t * 7.5) * 0.006;

    torso.rotation.y = Math.sin(t * 1.2) * 0.08;
    head.rotation.y = Math.sin(t * 1.2 + 0.3) * 0.14;
    head.rotation.x = Math.sin(t * 2.4) * 0.03;

    for (const a of arms) {
      a.arm.rotation.x = Math.sin(t * 1.8 + a.s * 0.6) * 0.06;
      a.arm.rotation.z = Math.cos(t * 1.2) * 0.04 * a.s;
    }

    for (const l of legs) {
      l.leg.rotation.x = Math.sin(t * 1.8 + l.s) * 0.02;
    }
  };

  g.userData.anim(0);
  return g;
}
// K8-72: robot hunting hound
function makeK872() {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Palettes (heavy combat quadruped / cyber-hound)
  const armorGrey = '#5d636c';
  const chassisDk = '#232226';
  const platingSteel = '#3d4147';
  const acc = '#ffd23a';
  const sensorRed = glow('#ff3b2a');
  const beaconYellow = glow('#ffd23a');

  // 1. Articulated Grounded Quadruped Limbs (Flush at y = 0.0)
  const legs = [];
  const legPairs = [
    { z:  0.32, isFront: true },
    { z: -0.32, isFront: false }
  ];

  for (const sx of [-1, 1]) {
    legPairs.forEach(pair => {
      const legGroup = new THREE.Group();
      legGroup.position.set(0.20 * sx, 0.52, pair.z);
      root.add(legGroup);

      if (pair.isFront) {
        // Reinforced foreleg with shock absorber
        chain(legGroup, [
          [0, 0, 0],
          [0.02 * sx, -0.24, 0.04],
          [0.01 * sx, -0.49, 0.02]
        ], 0.052, chassisDk, 0.034, true);

        // Shoulder shield cap
        part(legGroup, B(0.08, 0.16, 0.14), platingSteel, 0.03 * sx, -0.06, 0.02);
      } else {
        // Digitigrade robotic hindleg with raised knee joint
        chain(legGroup, [
          [0, 0, 0],
          [0.03 * sx, -0.22, -0.08],
          [0.02 * sx, -0.36, -0.02],
          [0.01 * sx, -0.49, 0.02]
        ], 0.058, chassisDk, 0.034, true);

        // Haunch armor cowling
        part(legGroup, B(0.10, 0.20, 0.18), platingSteel, 0.03 * sx, -0.08, -0.02);
      }

      // Hardened carbon-rubber foot pad (lands flush on y = 0.0)
      part(legGroup, B(0.10, 0.03, 0.14), '#141417', 0.01 * sx, -0.505, 0.03);
      part(legGroup, Cy(0.02, 0.02, 0.08, 6), armorGrey, 0.01 * sx, -0.47, 0.08, 0, 0, Math.PI / 2);

      legs.push({ legGroup, sx, isFront: pair.isFront });
    });
  }

  // 2. Reinforced Heavy Torso Chassis (No z-fighting overlap)
  // Internal mechanical frame
  part(root, B(0.38, 0.32, 0.92), chassisDk, 0, 0.58, 0);

  // Exterior armored shell (stepped up and outward to avoid coplanar clipping)
  part(root, B(0.44, 0.28, 0.96), armorGrey, 0, 0.62, 0);

  // Dorsal yellow warning runner plate
  part(root, B(0.46, 0.06, 0.88), acc, 0, 0.79, 0);

  // Flank exhaust / radiator vents
  for (const s of [-1, 1]) {
    for (let k = -1; k <= 1; k++) {
      part(root, B(0.02, 0.04, 0.12), chassisDk, 0.235 * s, 0.64, k * 0.22);
    }
  }

  // 3. Sensor Head Capsule & Forward Optical Array
  const head = new THREE.Group();
  head.position.set(0, 0.74, 0.56);
  root.add(head);

  // Armored cranial module
  part(head, B(0.32, 0.24, 0.38), armorGrey, 0, 0, 0);

  // Chiseled jaw / sensor chin
  part(head, B(0.24, 0.12, 0.26), chassisDk, 0, -0.12, 0.18);

  // Dual sensor optic slits (stepped well clear of front face at z = 0.21)
  for (const s of [-1, 1]) {
    part(head, B(0.06, 0.035, 0.03), sensorRed, 0.09 * s, 0.06, 0.205);
    part(head, B(0.08, 0.055, 0.02), chassisDk, 0.09 * s, 0.06, 0.195); // Recessed eye cowl

    // Retractable sensor ears / audio fin pylons
    part(head, B(0.04, 0.18, 0.10), platingSteel, 0.14 * s, 0.18, -0.06, -0.35, 0, -0.2 * s);
  }

  // 4. Heavy Tail Whip Aerial & Warning Relay
  const tail = new THREE.Group();
  tail.position.set(0, 0.76, -0.48);
  root.add(tail);

  // Articulated tail antenna mast
  chain(tail, [
    [0, 0, 0],
    [0, 0.12, -0.18],
    [0, 0.24, -0.36]
  ], 0.028, chassisDk, 0.014, true);

  // Warning beacon pod on tail tip
  part(tail, B(0.09, 0.09, 0.09), beaconYellow, 0, 0.26, -0.39);
  part(tail, new THREE.OctahedronGeometry(0.035, 0), glow('#ffffff'), 0, 0.26, -0.39);

  // 5. Stalking Ground Patrol Animation Loop
  g.userData.anim = (t) => {
    // Low suspension patrol breathing
    root.position.y = Math.sin(t * 3.2) * 0.008;

    // Head target scanning
    head.rotation.y = Math.sin(t * 1.4) * 0.14;
    head.rotation.x = Math.sin(t * 2.8) * 0.03;

    // Tail antenna vibration & whip
    tail.rotation.y = Math.sin(t * 4.0) * 0.18;
    tail.rotation.x = Math.cos(t * 2.2) * 0.08;

    // Ground patrol limb weight shifting
    legs.forEach(l => {
      const phase = (l.sx > 0 ? 0 : Math.PI) + (l.isFront ? 0 : Math.PI);
      l.legGroup.rotation.x = Math.sin(t * 3.2 + phase) * 0.04;
    });
  };

  g.userData.anim(0);
  return g;
}
// Hover-bot "flower pot": floating pot with an antenna flower that zaps
function makeHoverBot() {
  const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 1.2; g.add(b);
  part(b, Cy(0.34, 0.22, 0.5, 10), '#b8562f', 0, 0, 0); part(b, Cy(0.37, 0.37, 0.08, 10), '#8a3a2e', 0, 0.26, 0); part(b, Cy(0.2, 0.2, 0.06, 10), glow('#4fd2ff'), 0, -0.27, 0);
  part(b, Cy(0.02, 0.02, 0.4, 4), '#3f7a3a', 0, 0.5, 0); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; E(b, '#ff6aa8', Math.cos(a) * 0.1, 0.72, Math.sin(a) * 0.1, 0.08, 0.03, 0.08, 0, -a, 0.3); } E(b, glow('#ffe14a'), 0, 0.73, 0, 0.05, 0.05, 0.05);
  for (const s of [-1, 1]) part(b, B(0.08, 0.05, 0.04), glow('#ff3b2a'), 0.12 * s, 0.1, 0.32);
  g.userData.anim = (t) => { b.position.y = 1.2 + Math.sin(t * 2.4) * 0.12; b.rotation.y = Math.sin(t * 0.8) * 0.4; };
  return g;
}
// F-162 "trashy": trash-can bot with lid jaw
function makeF162() {
  const g = new THREE.Group(), can = '#6a7a6a', dk = '#3a3d44';
  for (const s of [-1, 1]) { part(g, B(0.14, 0.3, 0.14), dk, 0.14 * s, 0.15, 0); part(g, B(0.2, 0.08, 0.26), dk, 0.14 * s, 0.03, 0.04); }
  part(g, Cy(0.32, 0.28, 0.8, 10), can, 0, 0.7, 0); for (let k = 0; k < 4; k++) part(g, Cy(0.325, 0.325, 0.03, 10), dk, 0, 0.4 + k * 0.18, 0);
  const lid = new THREE.Group(); lid.position.set(0, 1.1, -0.28); g.add(lid); part(lid, Cy(0.34, 0.34, 0.06, 10), can, 0, 0, 0.28); part(lid, B(0.12, 0.06, 0.06), dk, 0, 0.06, 0.28);
  for (const s of [-1, 1]) { part(g, B(0.08, 0.05, 0.03), glow('#7fff6a'), 0.1 * s, 0.98, 0.3); chain(g, [[0.32 * s, 0.85, 0], [0.45 * s, 0.6, 0.1], [0.42 * s, 0.4, 0.2]], 0.03, dk, 0.025); }
  part(g, B(0.1, 0.2, 0.06), '#c8b84a', 0.05, 1.18, 0.1, 0.3, 0, 0.4); part(g, B(0.12, 0.08, 0.1), '#8a6a44', -0.1, 1.16, 0.0, 0.2);
  g.userData.anim = (t) => { lid.rotation.x = -Math.abs(Math.sin(t * 3)) * 0.5; };
  return g;
}
// X-G Police: red riot robot with shield and baton gun
function makeXGPolice() {
  const g = makeXR17();
  part(g, B(0.08, 0.7, 0.5), '#c8402f', -0.42, 0.6, 0.25); part(g, B(0.09, 0.12, 0.4), glow('#4fa8ff'), -0.45, 0.85, 0.25);
  part(g, B(0.3, 0.05, 0.2), glow('#ff3b2a'), 0, 1.1, 0); part(g, B(0.3, 0.05, 0.2), glow('#4fa8ff'), 0, 1.1, 0.0).position.x = 0.12;
  return recolor(g, { '#9aa1aa': '#a8302a', '#5d636c': '#3a1e1e' });
}
const GHOST_MAT = new THREE.MeshLambertMaterial({ color: '#9fe8ff', emissive: '#2a6aa8', transparent: true, opacity: 0.45, depthWrite: false });
const GHOST_GLOW = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 });
function makeGhostBot() {
  const g = makeXR17();
  g.traverse(o => { if (o.isMesh) o.material = o.material.isMeshBasicMaterial ? GHOST_GLOW : GHOST_MAT; });
  return g;
}
// The Overseer: four-armed foundry giant with a single red eye
function makeOverseer() {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Palettes (Regal / Brutalist Heavy Enforcer)
  const armorDk = '#2c2e35';
  const frameSteel = '#1e2025';
  const accRed = '#b83226';
  const goldTrim = '#c9a43a';
  const coreOrange = glow('#ff6a1a');
  const eyeRed = glow('#ff2a3a');

  // 1. Heavy Grounded Bipedal Legs (Grounded at y = 0.0, no coplanar clipping)
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(0.24 * s, 0, 0);
    root.add(leg);
    legs.push({ leg, s });

    // Armored tread foot (y = 0.0 to 0.12)
    part(leg, B(0.32, 0.12, 0.44), frameSteel, 0, 0.06, 0.04);
    part(leg, B(0.34, 0.04, 0.46), '#131418', 0, 0.02, 0.04); // Base sole trim

    // Lower shin column (y = 0.12 to 0.52)
    part(leg, B(0.28, 0.38, 0.34), armorDk, 0, 0.31, 0.02);
    part(leg, B(0.18, 0.32, 0.04), goldTrim, 0, 0.32, 0.20); // Front greave stripe

    // Knee cap joint block (y = 0.52 to 0.64)
    part(leg, Cy(0.09, 0.09, 0.28, 8), frameSteel, 0, 0.58, 0.02, 0, 0, Math.PI / 2);
    part(leg, B(0.22, 0.10, 0.08), accRed, 0, 0.58, 0.19); // Knee bumper

    // Upper armored thigh (y = 0.64 to 0.98)
    part(leg, B(0.26, 0.34, 0.30), accRed, 0, 0.81, 0);
    part(leg, B(0.28, 0.28, 0.04), armorDk, 0, 0.81, 0.16); // Outer thigh plate
  }

  // 2. Heavy Pelvis & Massive Torso Block
  part(root, B(0.76, 0.22, 0.46), frameSteel, 0, 1.04, 0);
  part(root, B(0.80, 0.06, 0.48), goldTrim, 0, 1.14, 0); // Waist filigree band

  const torso = new THREE.Group();
  torso.position.set(0, 1.54, 0);
  root.add(torso);

  // Main fortress chest hull (depth 0.62 -> front face at z = +0.31)
  part(torso, B(0.96, 0.74, 0.62), armorDk, 0, 0, 0);
  part(torso, B(1.02, 0.12, 0.64), accRed, 0, 0.12, 0); // Lateral chest band
  part(torso, B(0.86, 0.60, 0.12), frameSteel, 0, 0, -0.32); // Rear heat-sink block

  // Heavy Central Reactor Core (Stepped cleanly off chest face z = 0.33)
  part(torso, Cy(0.22, 0.22, 0.06, 12), goldTrim, 0, 0, 0.32, Math.PI / 2);
  part(torso, Cy(0.16, 0.16, 0.08, 12), coreOrange, 0, 0, 0.34, Math.PI / 2);
  part(torso, new THREE.TorusGeometry(0.18, 0.02, 4, 12), frameSteel, 0, 0, 0.35);

  // 3. Quad Sub-Arms (Two pairs: upper command claws & lower hydraulic smashers)
  const arms = [];
  const armConfigs = [
    { y:  0.24, prefix: 'upper', spanZ: 0.10 },
    { y: -0.16, prefix: 'lower', spanZ: 0.22 }
  ];

  for (const s of [-1, 1]) {
    armConfigs.forEach((cfg, idx) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(0.54 * s, cfg.y, 0);
      torso.add(armGroup);
      arms.push({ armGroup, s, idx });

      // Gold shoulder gimbal hub
      part(armGroup, Cy(0.11, 0.11, 0.22, 8), goldTrim, 0, 0, 0, 0, 0, Math.PI / 2);

      // Industrial bicep-to-wrist limb chain
      chain(armGroup, [
        [0.08 * s, 0, 0],
        [0.26 * s, -0.22, cfg.spanZ * 0.7],
        [0.32 * s, -0.48, cfg.spanZ * 1.4]
      ], 0.075, frameSteel, 0.048, true);

      // Forearm striker casing
      part(armGroup, B(0.16, 0.18, 0.16), accRed, 0.32 * s, -0.52, cfg.spanZ * 1.45);

      // Golden hydraulic vise talons
      for (let k = -1; k <= 1; k += 2) {
        part(
          armGroup,
          new THREE.ConeGeometry(0.025, 0.12, 4),
          goldTrim,
          (0.32 + k * 0.05) * s,
          -0.64,
          cfg.spanZ * 1.45,
          Math.PI,
          0,
          k * 0.25 * s
        );
      }
    });
  }

  // 4. Crowned Head Module & Central All-Seeing Optic
  const head = new THREE.Group();
  head.position.set(0, 0.58, 0.02);
  torso.add(head);

  // Skull casing (depth 0.44 -> front face at z = +0.22)
  part(head, B(0.48, 0.38, 0.44), armorDk, 0, 0, 0);
  part(head, B(0.40, 0.16, 0.06), frameSteel, 0, -0.12, 0.23); // Lower armored visor chin

  // Cyclopean Sensor Eye (Set cleanly forward at z = 0.24)
  part(head, new THREE.TorusGeometry(0.12, 0.024, 4, 12), goldTrim, 0, 0.04, 0.23);
  part(head, new THREE.SphereGeometry(0.10, 8, 8), eyeRed, 0, 0.04, 0.24);

  // Regal Golden Battle-Crown / Crest Spire Array
  part(head, B(0.52, 0.06, 0.46), goldTrim, 0, 0.21, 0); // Crown base rail
  for (let i = 0; i < 5; i++) {
    const spikeH = 0.22 - Math.abs(i - 2) * 0.04;
    part(
      head,
      new THREE.ConeGeometry(0.038, spikeH, 4),
      goldTrim,
      (i - 2) * 0.10,
      0.24 + spikeH * 0.5,
      0
    );
  }

  // 5. Authoritarian Idle Scan & Mechanical Sway Loop
  g.userData.anim = (t) => {
    // Heavy chassis suspension idle
    root.position.y = Math.sin(t * 2.8) * 0.008;

    // Torso surveillance sweep
    torso.rotation.y = Math.sin(t * 1.2) * 0.14;
    torso.rotation.x = Math.sin(t * 2.0) * 0.025;

    // Head target acquisition tracking
    head.rotation.y = Math.sin(t * 1.2 + 0.4) * 0.12;

    // Multi-arm rhythmic stabilization
    arms.forEach(a => {
      const phase = a.idx * 0.8 + (a.s > 0 ? 0 : Math.PI * 0.4);
      a.armGroup.rotation.x = Math.sin(t * 2.0 + phase) * 0.08;
      a.armGroup.rotation.z = Math.cos(t * 1.5 + phase) * 0.04 * a.s;
    });

    // Leg suspension micro-shifts
    legs.forEach(l => {
      l.leg.rotation.x = Math.sin(t * 2.0 + l.s) * 0.015;
    });
  };

  g.userData.anim(0);
  return g;
}
function makeCityBlock(w, h, d, col, neon) {
  const g = new THREE.Group();
  part(g, B(w, h, d), toon(col, 'panel'), 0, h / 2, 0);
  for (let y = 1.6; y < h - 0.5; y += 1.8) { part(g, B(w + 0.04, 0.22, d * 0.8), glow(neon), 0, y, 0); part(g, B(w * 0.8, 0.22, d + 0.04), glow(neon === '#ff3b6a' ? '#4fd2ff' : '#ff3b6a'), 0, y + 0.9, 0); }
  part(g, B(w + 0.3, 0.3, d + 0.3), '#2b2a2c', 0, h + 0.15, 0);
  return g;
}
function makeTower() {
  const g = new THREE.Group();

  const wallDark = '#25272c';
  const wallMid = '#383b42';
  const panelTrim = '#18191c';
  const gateCol = '#0c0d12';
  const ringCyan = glow('#9fe8ff');
  const beaconEye = glow('#ff2a3a');

  // 1. Terraced Fortress Tiers (Stepped cleanly from y = 0 upwards)
  const tierCount = 8;
  const tierH = 4.0;

  for (let k = 0; k < tierCount; k++) {
    const yCenter = tierH * 0.5 + k * tierH; // y = 2, 6, 10, ... 30
    const w = 9.0 - k * 0.8;
    const col = k % 2 === 0 ? wallDark : wallMid;

    // Main tier body block
    part(g, B(w, tierH - 0.2, w), typeof toon === 'function' ? toon(col, 'panel') : col, 0, yCenter, 0);

    // Dark inset base rim (breaks up seams and eliminates co-planar plane sharing)
    part(g, B(w + 0.1, 0.2, w + 0.1), panelTrim, 0, k * tierH + 0.1, 0);

    // Glowing Conduit Ring: recessed band protruding slightly (+0.08)
    // Placed at y = (k * 4) + 3.4 so it won't clip into the tier above
    part(g, B(w + 0.16, 0.25, w + 0.16), ringCyan, 0, k * tierH + 3.4, 0);

    // Corner buttress pylons on alternate tiers
    if (k < 5) {
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const cornerOffset = (w * 0.5) + 0.05;
          part(
            g,
            B(0.35, tierH - 0.4, 0.35),
            panelTrim,
            cornerOffset * sx,
            yCenter,
            cornerOffset * sz
          );
        }
      }
    }
  }

  // 2. Monolithic Entrance Archway (Pinned flush to ground y = 0, offset from front face z = 4.5)
  // Outer frame arch
  part(g, B(3.6, 4.4, 0.6), panelTrim, 0, 2.2, 4.6);
  // Recessed void gate
  part(g, B(2.6, 3.8, 0.2), gateCol, 0, 1.9, 4.8);
  // Gate frame warning lights
  for (const s of [-1, 1]) {
    part(g, B(0.12, 3.2, 0.06), ringCyan, 1.4 * s, 1.9, 4.9);
  }

  // 3. Spire Crown, Observation Deck & All-Seeing Beacon
  const topY = tierCount * tierH; // 32.0

  // Observation parapet platform
  part(g, B(3.2, 0.6, 3.2), panelTrim, 0, topY + 0.3, 0);
  part(g, B(3.4, 0.3, 3.4), wallDark, 0, topY + 0.7, 0);

  // Spire spire mast
  part(g, Cy(0.24, 0.65, 8.0, 8), panelTrim, 0, topY + 4.8, 0);

  // Stabilizer struts around base of needle
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    part(
      g,
      new THREE.ConeGeometry(0.12, 2.5, 4),
      panelTrim,
      Math.cos(a) * 0.7,
      topY + 1.8,
      Math.sin(a) * 0.7,
      0,
      -a,
      0.15
    );
  }

  // Floating Surveillance Orb / Beacon Core
  const beacon = part(g, new THREE.SphereGeometry(0.85, 12, 10), beaconEye, 0, topY + 9.2, 0);
  const ringA = part(g, new THREE.TorusGeometry(1.25, 0.04, 4, 16), panelTrim, 0, topY + 9.2, 0);
  const ringB = part(g, new THREE.TorusGeometry(1.5, 0.035, 4, 16), ringCyan, 0, topY + 9.2, 0);

  // 4. Idle Surveillance Scan Animation
  g.userData.anim = (t) => {
    // Gyroscopic gyroscope rings around beacon
    ringA.rotation.x = t * 0.9;
    ringA.rotation.y = t * 0.4;

    ringB.rotation.z = -t * 0.7;
    ringB.rotation.x = Math.sin(t * 0.5) * 0.3;

    // Beacon levitation pulse
    beacon.position.y = topY + 9.2 + Math.sin(t * 1.8) * 0.15;
  };

  g.userData.anim(0);
  return g;
}
