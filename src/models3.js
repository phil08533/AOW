// =================== CAPITONE MODELS (the frozen forest world) ===================
function makeGiantTree() {
  const g = new THREE.Group();
  const bark = toon('#5a4030', 'wood');
  const bark2 = toon('#4a3426', 'wood');
  const leaf = toon('#2f7a5a', 'leaves');
  const leaf2 = toon('#3f8a62', 'leaves');
  const lightAmber = glow('#ffd36a');
  const lightCyan = glow('#5affea');

  // 1. Main Trunk Stack
  for (let k = 0; k < 6; k++) {
    part(g, Cy(3.6 - k * 0.32, 4.2 - k * 0.32, 4.6, 10), k % 2 ? bark : bark2, 0, 2.3 + k * 4.4, 0, 0, k * 0.4, 0);
  }

  // 2. Base Roots (Door is at +Z (~angle ~Math.PI/2); roots skip the entrance area)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    // Skip roots in front of the door (angles facing ~Math.PI/2 / +Z)
    if (a > 1.0 && a < 2.1) continue;

    chain(g, [
      [Math.cos(a) * 3.0, 2.4, Math.sin(a) * 3.0],
      [Math.cos(a) * 5.4, 0.9, Math.sin(a) * 5.4],
      [Math.cos(a) * 7.2, -0.2, Math.sin(a) * 7.2]
    ], 0.9, bark2, 0.3);
  }

  // 3. Living Platform with Guard Rail & Hanging Fairy Lanterns
  part(g, Cy(7.2, 7.2, 0.5, 18), toon('#7a5a3a', 'wood'), 0, 9.5, 0);

  // Deck lanterns & under-deck glowing drops
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const px = Math.cos(a) * 7.0;
    const pz = Math.sin(a) * 7.0;

    // Platform post & glowing lantern
    part(g, Cy(0.08, 0.08, 1.1, 4), bark2, px, 10.2, pz);
    part(g, new THREE.OctahedronGeometry(0.24, 0), i % 3 === 0 ? lightCyan : lightAmber, px, 10.9, pz);

    // Hanging under-deck lanterns suspended beneath the rim
    if (i % 2 === 0) {
      part(g, Cy(0.02, 0.02, 0.8, 3), '#22160d', px * 0.92, 9.0, pz * 0.92);
      part(g, new THREE.OctahedronGeometry(0.18, 0), lightAmber, px * 0.92, 8.5, pz * 0.92);
    }
  }

  // Hanging Ivy & Bioluminescent Moss Pods
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    for (let k = 0; k < 6; k++) {
      part(g, B(0.08, 0.6, 0.08), toon('#3f7a3a', 'leaves'), Math.cos(a) * 6.4, 8.8 - k * 0.55, Math.sin(a) * 6.4, 0.1 * k, 0, 0);
    }
    // Glowing spore node at bottom of vine
    part(g, new THREE.SphereGeometry(0.16, 6, 6), lightCyan, Math.cos(a) * 6.4, 5.3, Math.sin(a) * 6.4);
  }

  // 4. Clear Doorway & Porch Lamps (Free of roots)
  part(g, B(2.2, 3.4, 0.6), '#1a120c', 0, 1.7, 3.95); // Entrance interior
  part(g, B(2.6, 0.3, 0.7), toon('#c9a43a'), 0, 3.5, 3.9); // Lintel
  part(g, B(2.8, 0.15, 1.2), toon('#5a3a22', 'wood'), 0, 0.08, 4.2); // Clean stone/wood threshold step

  // Twin entrance lanterns
  for (const s of [-1, 1]) {
    part(g, Cy(0.04, 0.04, 0.4, 4), '#22160d', 1.4 * s, 2.6, 4.1, 0, 0, 0.4 * s);
    part(g, new THREE.OctahedronGeometry(0.2, 0), lightAmber, 1.55 * s, 2.4, 4.15);
  }

  // 5. Trunk Windows & Bioluminescent Fungi Shelf Lights
  for (let k = 0; k < 4; k++) {
    const a = k * 1.6 + 0.8;
    const y = 13 + k * 3;
    const wx = Math.cos(a) * (3.3 - k * 0.25);
    const wz = Math.sin(a) * (3.3 - k * 0.25);
    part(g, B(0.8, 1.0, 0.3), lightAmber, wx, y, wz, 0, -a + Math.PI / 2, 0);

    // Glowing bracket mushroom steps climbing the trunk
    const mAngle = a + 0.6;
    const mx = Math.cos(mAngle) * (3.4 - k * 0.25);
    const mz = Math.sin(mAngle) * (3.4 - k * 0.25);
    part(g, Cy(0.4, 0.2, 0.08, 6), lightCyan, mx, y - 0.8, mz, 0.2, -mAngle, 0);
  }

  // 6. Canopy, Great Boughs & Floating Spore Lights
  const canopyNodes = [
    [0, 30, 0, 9, leaf],
    [6, 26, 2, 6.5, leaf2],
    [-6, 26.5, -2, 6.5, leaf2],
    [2, 27, -6, 6, leaf],
    [-3, 27, 6, 6, leaf],
    [0, 35, 0, 6, leaf2]
  ];
  for (const [x, y, z, r, m] of canopyNodes) {
    part(g, new THREE.IcosahedronGeometry(r, 1), m, x, y, z);
  }

  // Canopy Branches
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    chain(g, [
      [Math.cos(a) * 2, 22, Math.sin(a) * 2],
      [Math.cos(a) * 6, 24.5, Math.sin(a) * 6],
      [Math.cos(a) * 9, 25, Math.sin(a) * 9]
    ], 0.6, bark, 0.25);
  }

  // Fairy will-o'-the-wisp light orbs nestled in the canopy
  const canopyLights = [];
  const lightOffsets = [
    [2.5, 23.5, 2.5, lightAmber],
    [-3.2, 24.0, 1.8, lightCyan],
    [0.0, 25.5, -3.5, lightCyan],
    [4.2, 22.8, -2.0, lightAmber],
    [-2.0, 23.0, -2.8, lightAmber],
    [1.0, 32.0, 1.0, lightCyan]
  ];
  for (const [lx, ly, lz, col] of lightOffsets) {
    const orb = part(g, new THREE.OctahedronGeometry(0.35, 0), col, lx, ly, lz);
    canopyLights.push(orb);
  }

  // 7. Subtle Night Firefly / Canopy Pulse Animation
  g.userData.anim = (t) => {
    for (let i = 0; i < canopyLights.length; i++) {
      const pulse = 0.85 + Math.sin(t * 2.5 + i * 1.2) * 0.25;
      canopyLights[i].scale.set(pulse, pulse, pulse);
    }
  };

  return g;
}
function makeFern(s, col) {
  const g = new THREE.Group(), m = toon(col || '#3f8a4a', 'leaves');
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const f = part(g, B(0.22 * s, 0.03, 1.3 * s), m, Math.cos(a) * 0.55 * s, 0.45 * s, Math.sin(a) * 0.55 * s, -0.7, -a + Math.PI / 2, 0); f.castShadow = false; }
  part(g, B(0.2 * s, 0.03, 1.1 * s), m, 0, 0.75 * s, 0, -1.2, 0.3, 0);
  return g;
}
function makePine(s, snow) {
  const g = new THREE.Group();
  part(g, Cy(0.14 * s, 0.22 * s, 1.4 * s, 6), toon('#5a4030', 'wood'), 0, 0.7 * s, 0);
  for (let k = 0; k < 3; k++) { part(g, new THREE.ConeGeometry((1.5 - k * 0.38) * s, 1.7 * s, 7), toon(snow && k === 2 ? '#e8f0f4' : '#2a5a46', 'leaves'), 0, (1.6 + k * 1.05) * s, 0); if (snow) part(g, new THREE.ConeGeometry((1.0 - k * 0.3) * s, 0.5 * s, 7), toon('#eef4f8'), 0, (2.25 + k * 1.05) * s, 0); }
  return g;
}
function makeIceSpike(s) {
  const g = new THREE.Group(), m = toon('#bfe6f2'), m2 = toon('#8fc4dc');
  for (let k = 0; k < 4; k++) part(g, new THREE.ConeGeometry((0.4 - k * 0.06) * s, (2.4 - k * 0.4) * s, 5), k % 2 ? m2 : m, (k - 1.5) * 0.3 * s, (1.2 - k * 0.2) * s, Math.sin(k * 2) * 0.3 * s, Math.sin(k) * 0.3, 0, (k - 1.5) * 0.18);
  return g;
}
// Porcupine thing: round spiny beast that fires quills (creatures page)
function makePorcupine() {
  const g = new THREE.Group(), fur = '#6a5038', dk = '#3a2a1e', q = '#e8dcc0';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) seg(g, [0.2 * sx, 0.35, 0.24 * sz], [0.22 * sx, 0.02, 0.26 * sz], 0.07, dk, 0.05);
  E(g, fur, 0, 0.5, 0, 0.38, 0.32, 0.48);
  E(g, fur, 0, 0.48, 0.5, 0.18, 0.16, 0.2); E(g, dk, 0, 0.44, 0.68, 0.07, 0.06, 0.07);
  for (const s of [-1, 1]) E(g, glow('#ffd23a'), 0.09 * s, 0.56, 0.62, 0.03, 0.03, 0.02);
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2 * 3.1, rr = 0.15 + (i % 5) * 0.05, x = Math.cos(a) * rr, z = -0.35 + (i / 26) * 0.75;
    part(g, new THREE.ConeGeometry(0.025, 0.42, 4), i % 3 ? q : '#3a2a1e', x, 0.72 + Math.sin(a) * 0.05, z - 0.05, -0.6, 0, x * 1.8); }
  return g;
}
// Ambush tree-jumper: long-armed forest climber that drops on you
function makeJumper() {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Clean swamp monster palette (solid colors, no texture canvas, no hanging strands)
  const fur = '#3f592d';
  const dk = '#23381a';
  const mouthCavity = '#182412';
  const toothCol = '#e6ebd1';
  const hornCol = '#1a1f16';
  const bile = '#627d3c';
  const eyeColor = '#121214';
  const eyeHighlight = '#ffffff';

  // 1. Massive Z-Fold Spring Legs (Grounded at y = 0.0)
  for (const s of [-1, 1]) {
    chain(root, [
      [0.11 * s, 0.52, -0.06],
      [0.17 * s, 0.40,  0.16],
      [0.14 * s, 0.16, -0.08],
      [0.12 * s, 0.02,  0.06]
    ], 0.068, fur, 0.038, true);

    // Subtle wart spots on outer thigh
    E(root, bile, 0.17 * s, 0.40, 0.17, 0.022, 0.02, 0.02);

    // Broad grounded frog foot
    part(root, B(0.12, 0.035, 0.18), dk, 0.12 * s, 0.018, 0.06);

    for (let k = -1; k <= 1; k++) {
      part(
        root,
        new THREE.ConeGeometry(0.012, 0.06, 3),
        dk,
        (0.12 + k * 0.035) * s,
        0.018,
        0.15,
        Math.PI / 2.2,
        0,
        k * 0.2 * s
      );
    }
  }

  // 2. Clean Hunched Torso
  E(root, fur, 0, 0.62, -0.02, 0.20, 0.24, 0.20, 0.35); // Arched back
  E(root, dk, 0, 0.60, -0.06, 0.18, 0.18, 0.16, 0.35);  // Dorsal hump

  // Flat dorsal nodules (kept close to skin, no hanging danglers)
  E(root, bile,  0.07, 0.70, -0.08, 0.025, 0.02, 0.02);
  E(root, bile, -0.08, 0.64, -0.09, 0.030, 0.02, 0.02);

  // 3. Knuckle-Walking Forearms (Grounded)
  for (const s of [-1, 1]) {
    chain(root, [
      [0.18 * s, 0.78, 0.04],
      [0.28 * s, 0.50, 0.14],
      [0.26 * s, 0.22, 0.20],
      [0.22 * s, 0.03, 0.22]
    ], 0.045, fur, 0.028, true);

    for (let k = -1; k <= 1; k++) {
      seg(
        root,
        [0.22 * s, 0.03, 0.22],
        [(0.22 + k * 0.03) * s, 0.015, 0.28],
        0.012,
        dk,
        0.007
      );
    }
  }

  // 4. Head, Horns, Small Snout & Proportionate Mouth
  const head = new THREE.Group();
  head.position.set(0, 0.92, 0.06);
  root.add(head);

  // Cranium
  E(head, fur, 0, 0.02, 0, 0.15, 0.13, 0.15);

  // Upward Curved Horns
  for (const s of [-1, 1]) {
    // Horn base curving out and back
    chain(head, [
      [0.08 * s, 0.11, 0.02],
      [0.14 * s, 0.22, -0.02],
      [0.16 * s, 0.32, -0.08]
    ], 0.032, hornCol, 0.010, true);

    // Sharp horn tip
    part(head, new THREE.ConeGeometry(0.012, 0.06, 4), hornCol, 0.16 * s, 0.34, -0.10, -0.5, 0, 0.2 * s);
  }

  // Small, narrow predator mouth slit
  part(head, B(0.12, 0.025, 0.06), mouthCavity, 0, -0.05, 0.11);
  part(head, B(0.13, 0.016, 0.06), dk, 0, -0.065, 0.11); // Clean lower lip edge

  // Four small pointed fangs
  for (let t = -1; t <= 1; t += 2) {
    part(head, new THREE.ConeGeometry(0.007, 0.024, 3), toothCol, t * 0.035, -0.045, 0.13, Math.PI);
    part(head, new THREE.ConeGeometry(0.006, 0.020, 3), toothCol, t * 0.025, -0.058, 0.12, 0);
  }

  // Beady dark eyes
  for (const s of [-1, 1]) {
    part(head, B(0.035, 0.016, 0.04), dk, 0.075 * s, 0.05, 0.10, 0.2, 0, -0.2 * s);
    E(head, eyeColor, 0.07 * s, 0.035, 0.11, 0.024, 0.024, 0.02);
    E(head, eyeHighlight, 0.074 * s, 0.042, 0.122, 0.006, 0.006, 0.006);
  }

  // 5. Arched Counterbalance Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.52, -0.18);
  root.add(tail);

  chain(tail, [
    [0, 0, 0],
    [0, 0.16, -0.24],
    [0, 0.44, -0.34],
    [0, 0.62, -0.20]
  ], 0.035, fur, 0.014, true);

  // 6. Idle Animation Loop
  g.userData.anim = (t) => {
    root.position.y = Math.sin(t * 3.2) * 0.01;

    head.rotation.y = Math.sin(t * 1.4) * 0.12;
    head.rotation.x = Math.sin(t * 2.8) * 0.04;

    tail.rotation.x = Math.sin(t * 3.0) * 0.16;
    tail.rotation.y = Math.cos(t * 2.0) * 0.12;
  };

  g.userData.anim(0);
  return g;
}
// Nomine: hooded wisp of the Forgotten Forest
function makeNomine() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = 0.9;
  g.add(body);

  // --- Procedural Woven Fabric & Runes Cloth Texture ---
  function getClothTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Base robe purple
    ctx.fillStyle = '#4a3a6a';
    ctx.fillRect(0, 0, 64, 64);

    // Subtle cross-weave threads
    ctx.fillStyle = '#3c2e56';
    for (let x = 0; x < 64; x += 4) {
      ctx.fillRect(x, 0, 1.5, 64);
    }
    for (let y = 0; y < 64; y += 4) {
      ctx.fillRect(0, y, 64, 1.5);
    }

    // Faded arcane stitching pattern
    ctx.fillStyle = '#65508a';
    for (let i = 0; i < 64; i += 8) {
      ctx.fillRect(i, (i * 2) % 64, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  const clothMap = getClothTexture();
  const robeCol = '#4a3a6a';
  const robeTrim = '#2a1e3e';
  const mantleCol = '#5d4785';
  const eyeGlow = glow('#c8a0ff');
  const orbGlow = glow('#a080ff');

  const applyCloth = (mesh) => {
    if (mesh && mesh.material) {
      mesh.material = mesh.material.clone();
      mesh.material.map = clothMap;
      mesh.material.roughness = 0.9; // Matte cloth finish
      mesh.material.metalness = 0.05;
      mesh.material.needsUpdate = true;
    }
    return mesh;
  };

  // 1. Tapered Robe Skirt (Hem hovers slightly above ground)
  const skirt = part(body, new THREE.ConeGeometry(0.44, 1.35, 8, 1, true), robeCol, 0, 0, 0);
  skirt.material.side = THREE.DoubleSide;
  applyCloth(skirt);

  // Dark embroidered hem trim
  part(body, new THREE.TorusGeometry(0.43, 0.022, 4, 14), robeTrim, 0, -0.66, 0, Math.PI / 2);

  // 2. Cowled Hood & Shaded Visage
  // Hood outer dome
  const hood = E(body, robeCol, 0, 0.68, 0, 0.22, 0.24, 0.22);
  applyCloth(hood);

  // Layered shoulder mantle / cowl drape
  const mantle = part(body, new THREE.ConeGeometry(0.36, 0.32, 7, 1, true), mantleCol, 0, 0.52, 0);
  mantle.material.side = THREE.DoubleSide;
  applyCloth(mantle);

  // Recessed dark void under hood
  E(body, robeTrim, 0, 0.66, 0.08, 0.16, 0.18, 0.15);

  // Twin occult glowing eyes inside the shadow
  for (const s of [-1, 1]) {
    E(body, eyeGlow, 0.06 * s, 0.68, 0.20, 0.035, 0.025, 0.02);
  }

  // 3. Wide Bell Sleeves & Floating Ghostly Hands
  for (const s of [-1, 1]) {
    // Upper draped sleeve
    const sleeve = seg(body, [0.20 * s, 0.42, 0.04], [0.42 * s, 0.14, 0.20], 0.065, robeCol, 0.045);
    applyCloth(sleeve);

    // Flared sleeve cuff
    part(body, new THREE.TorusGeometry(0.065, 0.016, 4, 10), robeTrim, 0.42 * s, 0.14, 0.20, 0.4, 0.3 * s, 0);

    // Floating arcane spirit orb / palm beacon
    E(body, eyeGlow, 0.46 * s, 0.08, 0.26, 0.045, 0.045, 0.045);
  }

  // 4. Orbiting Soul Wisps
  const wisps = [];
  for (let i = 0; i < 4; i++) {
    const w = part(body, new THREE.OctahedronGeometry(0.06, 0), orbGlow, 0, 0, 0);
    wisps.push(w);
  }

  // 5. Floating Levitating Animation Loop
  g.userData.anim = (t) => {
    // Spectral hover & drift
    body.position.y = 0.9 + Math.sin(t * 1.5) * 0.14;
    body.rotation.y = Math.sin(t * 0.8) * 0.08;
    body.rotation.z = Math.cos(t * 1.2) * 0.04;

    // Orbiting wisps
    wisps.forEach((w, i) => {
      const a = t * 1.4 + i * (Math.PI / 2);
      w.position.set(
        Math.cos(a) * 0.62,
        -0.25 + Math.sin(t * 2.2 + i) * 0.18,
        Math.sin(a) * 0.62
      );
      w.rotation.y += 0.05;
    });
  };

  g.userData.anim(0);
  return g;
}
// Snofel: snow fluff that grows as it fights
function makeSnofel() {
  const g = new THREE.Group();
  const fur = toon('#eef4f8', 'fur');
  const furShade = toon('#d3e3f0', 'fur');
  const iceDk = '#8fb0c8';
  const iceFoot = '#6a8fae';
  const mouthCol = '#2a3a4a';
  const boneCol = (typeof C !== 'undefined' && C.bone) ? C.bone : '#ded7c1';
  const eyeCol = (typeof C !== 'undefined' && C.eye) ? C.eye : '#1a222a';
  const hornGlow = glow('#9fe8ff');
  const eyeGlow = glow('#5ce1e6');

  // Root creature group for bouncing respiration and heavy walk cycle
  const root = new THREE.Group();
  g.add(root);

  // 1. Chunky Stumpy Snow-Paws
  const legs = [];
  const legOffsets = [
    { z:  0.18, signZ:  1 },
    { z: -0.16, signZ: -1 }
  ];

  for (const sx of [-1, 1]) {
    legOffsets.forEach(pos => {
      const legGroup = new THREE.Group();
      legGroup.position.set(0.20 * sx, 0.28, pos.z);
      root.add(legGroup);

      // Fluffy leg sleeve into ice paw
      seg(legGroup, [0, 0, 0], [0.03 * sx, -0.24, 0.02 * pos.signZ], 0.08, furShade, 0.065);
      E(legGroup, iceFoot, 0.03 * sx, -0.25, 0.03 * pos.signZ + 0.02, 0.065, 0.03, 0.08);

      // Blunt snow claws
      for (let c = -1; c <= 1; c++) {
        part(
          legGroup,
          new THREE.ConeGeometry(0.015, 0.06, 3),
          iceDk,
          0.03 * sx + c * 0.022,
          -0.25,
          0.03 * pos.signZ + 0.08,
          Math.PI / 2.2,
          0,
          c * 0.2
        );
      }

      legs.push({ legGroup, sx, signZ: pos.signZ });
    });
  }

  // 2. Round Fuzzy Snowball Body & Sculpted Fur Clumps
  // Central spherical body core
  E(root, fur, 0, 0.56, 0, 0.44, 0.42, 0.44);

  // Surface fur tufts (placed to break the smooth sphere into a puffy coat)
  const furTufts = [
    [0.28, 0.72, 0.16, 0.14],
    [-0.28, 0.72, 0.16, 0.14],
    [0.34, 0.48, -0.12, 0.16],
    [-0.34, 0.48, -0.12, 0.16],
    [0, 0.78, -0.14, 0.18],
    [0.18, 0.36, 0.32, 0.14],
    [-0.18, 0.36, 0.32, 0.14],
    [0, 0.35, -0.36, 0.16],
    [0.26, 0.65, -0.24, 0.15],
    [-0.26, 0.65, -0.24, 0.15]
  ];

  furTufts.forEach(([tx, ty, tz, tr], i) => {
    E(root, i % 3 === 0 ? furShade : fur, tx, ty, tz, tr, tr * 0.9, tr);
  });

  // 3. Wide Grinning Mouth & Underhung Ice Tusks
  const jaw = new THREE.Group();
  jaw.position.set(0, 0.48, 0.38);
  root.add(jaw);

  // Recessed dark mouth cavity
  E(jaw, mouthCol, 0, 0, 0, 0.20, 0.09, 0.08);

  // Pointed underbite tusks / teeth
  for (let k = -2; k <= 2; k++) {
    const isMajorTusk = Math.abs(k) === 2;
    const tuskHeight = isMajorTusk ? 0.11 : 0.065;
    const tuskRad = isMajorTusk ? 0.028 : 0.02;
    part(
      jaw,
      new THREE.ConeGeometry(tuskRad, tuskHeight, 4),
      boneCol,
      k * 0.065,
      0.03 + (isMajorTusk ? 0.02 : 0),
      0.04,
      Math.PI - 0.2,
      0,
      k * 0.1
    );
  }

  // 4. Face: Glowing Ice Horns, Beady Eyes & Muzzle Puff
  // Forehead fluff shelf
  E(root, fur, 0, 0.72, 0.28, 0.26, 0.11, 0.16);

  const horns = [];
  for (const s of [-1, 1]) {
    // Beady cold eyes with center glow spark
    E(root, eyeCol, 0.14 * s, 0.68, 0.36, 0.045, 0.055, 0.035);
    E(root, eyeGlow, 0.14 * s, 0.69, 0.38, 0.02, 0.02, 0.015);

    // Brow tuft
    E(root, furShade, 0.15 * s, 0.75, 0.34, 0.06, 0.04, 0.06, 0, 0, 0.2 * s);

    // Glowing crystalline ram horn (swept backward and out)
    const hornGroup = new THREE.Group();
    hornGroup.position.set(0.22 * s, 0.88, 0.08);
    root.add(hornGroup);
    horns.push({ hornGroup, sign: s });

    // Base horn socket
    part(hornGroup, new THREE.TorusGeometry(0.065, 0.018, 5, 8), iceDk, 0, 0, 0, Math.PI / 2);

    // Curved crystalline spike
    const h = part(
      hornGroup,
      new THREE.ConeGeometry(0.065, 0.34, 5),
      hornGlow,
      0.04 * s,
      0.14,
      -0.04,
      -0.3,
      0,
      -0.45 * s
    );
    h.scale.set(1.1, 1.0, 0.75); // Faceted crystal taper
  }

  // 5. Tiny Snow-Puff Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.52, -0.42);
  root.add(tail);
  E(tail, fur, 0, 0, 0, 0.12, 0.12, 0.14);

  // 6. Plump Arctic Waddling & Respiration Animation
  g.userData.anim = (t) => {
    // Heavy bouncy snow waddle
    root.position.y = Math.sin(t * 4.5) * 0.025;
    root.rotation.z = Math.sin(t * 2.25) * 0.04;

    // Jaw chattering / panting breathing bob
    jaw.position.y = 0.48 + Math.sin(t * 6.0) * 0.01;

    // Tail gentle wag
    tail.rotation.y = Math.sin(t * 4.0) * 0.25;

    // Horns subtle crystal pulse
    const pulse = 1.0 + Math.sin(t * 3.0) * 0.05;
    for (const h of horns) {
      h.hornGroup.scale.set(pulse, pulse, pulse);
    }

    // Foot waddle cycle
    legs.forEach(l => {
      l.legGroup.rotation.x = Math.sin(t * 4.5 + l.signZ * 1.4) * 0.14;
    });
  };

  g.userData.anim(0);
  return g;
}
function makeFrostKing() {
  const g = makeChunkMonster('#bfe6f2', '#8fc4dc', '#e8f6fb', '#5d7f99', true);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.05, 0.28, 4), glow('#9fe8ff'), Math.cos(a) * 0.2, 2.02, Math.sin(a) * 0.2, Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
  part(g, Cy(0.24, 0.24, 0.08, 10), toon('#c9a43a'), 0, 1.92, 0.02);
  return g;
}
function makeCairn() {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) part(g, new THREE.DodecahedronGeometry(0.45 - k * 0.08, 0), toon('#6a7a80', 'stone'), Math.sin(k) * 0.1, 0.3 + k * 0.55, 0);
  part(g, B(0.7, 0.5, 0.1), toon('#3b4f7a', 'cloth'), 0.4, 0.4, 0.3, 0.4, 0.6, 0.2);
  return g;
}
