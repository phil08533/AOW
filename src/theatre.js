// =================== THE ROXY CINEMA: New Jamestown Movie Theatre ===================
const THEATRE = {
  scr: null,
  glow: null,
  beam: null,
  sconces: [],
  popcorn: null,
  from: null
};

function enterCinema(fromX, fromZ) {
  THEATRE.from = {
    x: fromX != null ? fromX : (typeof TOWN !== 'undefined' ? TOWN.x - 28 : -28),
    z: fromZ != null ? fromZ : (typeof TOWN !== 'undefined' ? TOWN.z + 16.5 : 16.5)
  };
  if (typeof SFX !== 'undefined' && SFX.door) SFX.door();
  if (typeof loadLevel === 'function') {
    loadLevel('theatre');
    const mov = typeof tvCurMovie === 'function' ? tvCurMovie() : { short: 'Night of the Living Dead' };
    toast('THE ROXY CINEMA', `Now Showing: ${mov.short} · Press C to switch channels`, 3.5);
  }
}

function exitCinema() {
  if (typeof tvOff === 'function' && TVD && TVD.on) tvOff(true);
  if (typeof seatUp === 'function' && SEAT && SEAT.on) seatUp(true);
  if (typeof SFX !== 'undefined' && SFX.door) SFX.door();
  const dest = THEATRE.from || { x: (typeof TOWN !== 'undefined' ? TOWN.x - 28 : -28), z: (typeof TOWN !== 'undefined' ? TOWN.z + 16.5 : 16.5) };
  THEATRE.from = null;
  if (typeof loadLevel === 'function') {
    loadLevel('earth', { at: { x: dest.x, z: dest.z, yaw: 0 } });
  }
}

function grabPopcorn() {
  player.hp = maxHp();
  if (typeof SFX !== 'undefined' && SFX.item) SFX.item();
  toast('BUTTER POPCORN', 'Fresh, salty movie popcorn! (Full Heal)', 2.5);
  log('Grabbed a tub of hot butter popcorn from the Roxy concession counter. Health fully restored!', 'loot');
  closeDlg();
}

function buildTheatreLevel() {
  const W = 11, D = 14, H = 8.2;
  THEATRE.sconces = [];

  // 1. Auditorium Structure & Sloped Tiers
  // Floor tiers rising toward the back
  const carpetMat = toon('#6a1824', 'cloth');
  const woodMat = toon('#241914', 'wood');
  const wallMat = toon('#1a1218');
  const trimMat = toon('#9a7830', 'stone');

  // Stage Platform at front (z: -12.5)
  part(props, B(18, 0.9, 5), woodMat, 0, 0.45, -12);
  part(props, B(18.4, 0.12, 5.2), trimMat, 0, 0.92, -12);

  // Sloped stadium seating tiers (each one is also a walkable floor)
  for (const [z, top, d] of [[-12, 0.98, 2.5], [-5, 0.4, 2.25], [0, 0.8, 2.25], [5, 1.1, 2.25], [10.5, 1.4, 2.5]]) SURFACES.push({ x: 0, z, ux: 1, uz: 0, hl: 9.8, hw: d, y: top, slope: 0 });
  part(props, B(19.6, 0.4, 4.5), carpetMat, 0, 0.2, -5);     // Tier 1 (front)
  part(props, B(19.6, 0.6, 4.5), carpetMat, 0, 0.5, 0);      // Tier 2 (center)
  part(props, B(19.6, 0.6, 4.5), carpetMat, 0, 0.8, 5);      // Tier 3 (back)
  part(props, B(19.6, 0.6, 5.0), carpetMat, 0, 1.1, 10.5);   // Tier 4 (lobby/exit)

  // Outer Auditorium Walls
  const wall = (x, z, w, d) => {
    part(props, B(w, H, d), wallMat, x, H / 2, z);
    box(x, z, w / 2, d / 2);
  };
  wall(0, -D - 0.25, W * 2, 0.5);  // Front screen wall
  wall(0, D + 0.25, W * 2, 0.5);   // Back exit wall
  wall(-W - 0.25, 0, 0.5, D * 2);  // West wall
  wall(W + 0.25, 0, 0.5, D * 2);   // East wall

  // Ceiling
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, D * 2).rotateX(Math.PI / 2), toon('#100a12'));
  ce.position.y = H;
  props.add(ce);

  // Gold pilasters along the side walls
  for (const z of [-10, -5, 0, 5, 10]) {
    for (const sx of [-W + 0.15, W - 0.15]) {
      part(props, B(0.3, H, 0.6), trimMat, sx, H / 2, z);
      // Wall sconce torch on each pilaster
      const sc = new THREE.PointLight(0xffb86a, 0.85, 12, 1.8);
      sc.position.set(sx > 0 ? sx - 0.4 : sx + 0.4, 3.8, z);
      props.add(sc);
      THEATRE.sconces.push(sc);

      // Sconce fixture model
      part(props, Cy(0.08, 0.16, 0.35, 6), glow('#ffd880'), sx > 0 ? sx - 0.25 : sx + 0.25, 3.8, z);
      part(props, B(0.12, 0.28, 0.18), trimMat, sx > 0 ? sx - 0.1 : sx + 0.1, 3.7, z);
    }
  }

  // Illuminated golden aisle floor strips along the central aisle (x = +/- 1.4)
  for (let z = -7; z <= 12; z += 1.6) {
    for (const s of [-1, 1]) {
      const y = z < -2.5 ? 0.42 : z < 2.5 ? 0.82 : z < 7.5 ? 1.12 : 1.42;
      part(props, B(0.1, 0.04, 1.2), glow('#ffd36a'), 1.4 * s, y, z);
    }
  }

  // 2. The Giant Silver Screen
  const scrW = 14.4, scrH = 8.1;
  const scrG = new THREE.PlaneGeometry(scrW, scrH);
  THEATRE.idle = tvIdleTex();
  tvDrawIdle('off');

  const scr = new THREE.Mesh(scrG, new THREE.MeshBasicMaterial({ map: (TVD.on && TVD.tex) ? TVD.tex : THEATRE.idle, toneMapped: false }));
  scr.position.set(0, 4.8, -12.4);
  props.add(scr);
  THEATRE.scr = scr;

  // Velvet Black Framing Border
  part(props, B(scrW + 0.4, 0.3, 0.15), '#0c0a0e', 0, 4.8 + scrH / 2 + 0.15, -12.35);
  part(props, B(scrW + 0.4, 0.3, 0.15), '#0c0a0e', 0, 4.8 - scrH / 2 - 0.15, -12.35);
  part(props, B(0.3, scrH + 0.6, 0.15), '#0c0a0e', -scrW / 2 - 0.15, 4.8, -12.35);
  part(props, B(0.3, scrH + 0.6, 0.15), '#0c0a0e', scrW / 2 + 0.15, 4.8, -12.35);

  // Red Velvet Proscenium Curtains
  for (const s of [-1, 1]) {
    for (let c = 0; c < 4; c++) {
      part(props, Cy(0.55, 0.55, H - 0.8, 10), toon('#8a1524', 'cloth'), (scrW / 2 + 0.6 + c * 0.45) * s, (H - 0.8) / 2, -12.1);
    }
  }
  // Overhead ruffled valance drape
  part(props, B(scrW + 3.2, 1.1, 0.3), toon('#8a1524', 'cloth'), 0, H - 0.55, -12.0);
  part(props, B(scrW + 3.4, 0.12, 0.35), trimMat, 0, H - 1.12, -11.95);

  // Ambient Stage Light from Screen
  const sp = new THREE.PointLight(0xa0c8f8, TVD.on ? 1.4 : 0, 28, 1.4);
  sp.position.set(0, 4.5, -9.5);
  props.add(sp);
  THEATRE.glow = sp;

  // 3. Volumetric Projection Booth & Light Beam
  // Projection booth window on rear wall
  part(props, B(2.2, 1.4, 0.2), '#15121a', 0, 6.2, D - 0.1);
  part(props, B(1.6, 0.8, 0.05), glow('#ffffff'), 0, 6.2, D - 0.16);

  // Volumetric projector cone shining from booth to screen
  const beamG = new THREE.ConeGeometry(7.5, 25, 16, 1, true);
  beamG.rotateX(Math.PI / 2);
  const beamMat = psx(new THREE.MeshBasicMaterial({
    color: 0x9fb8e8,
    transparent: true,
    opacity: TVD.on ? 0.08 : 0.0,
    depthWrite: false,
    side: THREE.DoubleSide
  }));
  const beam = new THREE.Mesh(beamG, beamMat);
  beam.position.set(0, 5.5, 0.5);
  props.add(beam);
  THEATRE.beam = beam;

  // 4. Velvet Cinema Seats
  const makeSeat = (x, y, z, facing) => {
    const sg = new THREE.Group();
    sg.position.set(x, y, z);
    sg.rotation.y = facing;
    // Pedestal
    part(sg, Cy(0.06, 0.08, 0.35, 6), '#221f24', 0, 0.18, 0);
    // Velvet seat pan
    part(sg, B(0.68, 0.14, 0.62), toon('#8e1a2c', 'cloth'), 0, 0.42, 0.05);
    // Cushioned high backrest
    part(sg, B(0.68, 0.72, 0.16), toon('#8e1a2c', 'cloth'), 0, 0.8, -0.22, 0.12);
    // Armrests with cup holders
    for (const s of [-0.38, 0.38]) {
      part(sg, B(0.08, 0.35, 0.55), '#2a2228', s, 0.56, 0.02);
      part(sg, Cy(0.05, 0.04, 0.08, 8), '#ffd36a', s, 0.75, 0.22); // Brass cup holder
    }
    props.add(sg);
    box(x, z, 0.38, 0.38);
    SEATS.push([x, y, z]);
  };
  const SEATS = [];

  // Build 3 rows of seats on left and right sides of central aisle
  const rows = [
    { z: -5, y: 0.4, label: 'Front Row' },
    { z: 0,  y: 0.8, label: 'Center Row (Best View)' },
    { z: 5,  y: 1.1, label: 'Back Row' }
  ];

  rows.forEach((r, rowIdx) => {
    // Left side (x = -5.6 to -2.0)
    for (let x = -5.6; x <= -2.0; x += 0.9) makeSeat(x, r.y, r.z, Math.PI);
    // Right side (x = 2.0 to 5.6)
    for (let x = 2.0; x <= 5.6; x += 0.9) makeSeat(x, r.y, r.z, Math.PI);

    // Row sitting interactions (Center aisle seats)
    INTERACTS.push({
      x: 0, z: r.z, r: 2.2,
      label: `Sit in ${r.label}`,
      seat: true,
      seatLabel: `Sit in ${r.label}`,
      fn: () => seatDown(0, r.z + 0.1, 0, `${r.label.toUpperCase()} · THE ROXY`)
    });
  });

  // 5. Projector & Channel Podium Controls (in central aisle)
  {
    const pod = new THREE.Group();
    pod.position.set(-2.2, 0.7, 1.8);
    part(pod, Cy(0.25, 0.3, 0.9, 8), toon('#3a2820', 'wood'), 0, 0.45, 0);
    part(pod, B(0.65, 0.08, 0.55), trimMat, 0, 0.92, 0, 0.2);
    // Screen preview monitor on podium
    part(pod, B(0.35, 0.25, 0.05), glow('#4fd2ff'), 0, 1.1, 0, 0.2);
    props.add(pod);
    solid(-2.2, 1.8, 0.4);

    INTERACTS.push({
      x: -2.2, z: 1.8, r: 2.0,
      label: 'Turn on the Movie', tv: true,
      fn: () => (TVD.on ? tvOff() : tvOn())
    });
    INTERACTS.push({
      x: -2.2, z: 2.8, r: 2.0,
      label: 'Change Movie Channel (C)', tvChan: true,
      fn: () => tvChangeChannel(1)
    });
  }

  // 6. Concession Counter / Hot Popcorn Stand (in rear lobby area)
  {
    const pop = new THREE.Group();
    pop.position.set(7.5, 1.4, 11);
    part(pop, B(3.4, 0.9, 1.4), toon('#2a1a1e'), 0, 0.45, 0);
    part(pop, B(3.6, 0.08, 1.6), trimMat, 0, 0.92, 0);
    // Popcorn glass kettle machine
    part(pop, B(1.1, 1.1, 1.1), toon('#d82a3a'), -0.8, 1.5, 0);
    part(pop, B(0.9, 0.9, 0.9), glow('#ffd860'), -0.8, 1.5, 0.05); // Glowing hot popcorn
    // Marquee sign above concessions
    const popSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), psx(new THREE.MeshBasicMaterial({ map: signTex('POPCORN & DRINKS', '#2a0a12', '#ffd36a') })));
    popSign.position.set(0, 2.2, 0.1);
    pop.add(popSign);
    props.add(pop);
    box(7.5, 11, 1.8, 0.8);

    INTERACTS.push({
      x: 7.5, z: 9.8, r: 2.2,
      label: '🍿 Grab Fresh Butter Popcorn',
      fn: grabPopcorn
    });
  }

  // 7. Back Double Exit Doors & Illuminated "EXIT" Sign
  {
    const ed = new THREE.Group();
    ed.position.set(0, 1.4, D - 0.2);
    // Double door frames
    for (const s of [-1, 1]) {
      part(ed, B(1.4, 3.2, 0.15), toon('#3a2418', 'wood'), 0.75 * s, 1.6, 0);
      part(ed, B(0.8, 0.08, 0.18), trimMat, 0.75 * s, 1.6, 0.1); // Brass push bars
    }
    // Illuminated green EXIT sign
    const exSign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), psx(new THREE.MeshBasicMaterial({ map: signTex('EXIT', '#082a12', '#40ff70'), side: THREE.DoubleSide })));
    exSign.position.set(0, 3.65, -0.15);
    ed.add(exSign);
    const exLight = new THREE.PointLight(0x40ff70, 0.6, 6);
    exLight.position.set(0, 3.6, -0.3);
    ed.add(exLight);
    props.add(ed);

    INTERACTS.push({
      x: 0, z: D - 1.2, r: 2.4,
      label: 'Exit to New Jamestown',
      fn: exitCinema
    });
  }

  // Moviegoers: a scattering of townsfolk sitting in the seats, legs bent forward
  { const cols = [['#c8402f', '#e0b892'], ['#3b4f7a', '#8a5a3a'], ['#5a6a3a', '#c58a64'], ['#8a6fc4', '#e0b892'], ['#c9a43a', '#5a3a24'], ['#2a5a7a', '#d9a77a'], ['#e8e4dc', '#8a5a3a'], ['#ff9a3c', '#c58a64']];
    SEATS.filter((_, i) => (i * 7) % 3 === 0).slice(0, 10).forEach(([x, y, z], i) => {
      const [sh, sk] = cols[i % cols.length], o = buildChar(() => makeCivilian(sh, '#2c2a28', sk, ['#1e1a18', '#5a3a22', '#c9a43a', '#cfcac0'][i % 4]), 'civ'), R = o.userData.rig;
      if (R && R.legL) { R.legL.rotation.x = R.legR.rotation.x = -Math.PI / 2; }
      o.position.set(x, y + 0.5 - 0.95, z + 0.05); o.rotation.y = Math.PI; levelGroup.add(o);
      if (R && R.head) levelAnims.push(t => { R.head.rotation.y = Math.sin(t * 0.3 + i * 2) * 0.12; });
    }); }

  // Dynamic animation loop for projector light & house light dimming
  levelAnims.push((t) => {
    const isPlaying = TVD.on && TVD.vid && !TVD.vid.paused;

    // Smoothly dim wall sconces when movie is on
    const targetIntensity = isPlaying ? 0.12 : 0.85;
    for (const sc of THEATRE.sconces) {
      sc.intensity += (targetIntensity - sc.intensity) * 0.08;
    }

    // Volumetric projector cone animation
    if (THEATRE.beam) {
      const targetBeamOp = isPlaying ? 0.09 + Math.sin(t * 12) * 0.02 + Math.random() * 0.02 : 0.0;
      THEATRE.beam.material.opacity += (targetBeamOp - THEATRE.beam.material.opacity) * 0.15;
    }
  });
}

LEVELS.theatre = {
  id: 'theatre',
  name: 'Jamestown Cinema',
  tag: 'The Roxy · Est. 2104',
  lvls: 'Screen 1 & 2',
  size: 40,
  center: [0, 0],
  radius: 60,
  water: -99,
  sky: 'black',
  weather: 'none',
  indoor: true,
  terrain: null,
  palette: { grass: '#140c16' },
  zones: [{ id: 'theatre', name: 'The Roxy Cinema', lvl: 'Feature Presentation', x: 0, z: 0, r: 30, col: '#140c16', safe: true, h: 0 }],
  paths: [],
  river: [],
  pools: [],
  lava: [],
  safes: [{ x: 0, z: 0, r: 100 }],
  spawn: { x: 0, z: 11.5, yaw: 0 },
  menu: { x: 0, z: 0, r: 10, h: 3 },
  npcBase: [0, 0],
  spawns: [],
  npcs: [],
  build: buildTheatreLevel
};

window.enterCinema = enterCinema;
window.exitCinema = exitCinema;
window.THEATRE = THEATRE;
