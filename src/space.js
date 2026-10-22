// =================== SPACE: fly the Setting Sun, dogfight raiders, mine asteroids, dock at the Zeltac ===================
Object.assign(ITEMS, { ore: { name: 'Space Ore', v: 22, col: '#b8a07a' }, starcrystal: { name: 'Star Crystal', v: 140, col: '#ffe14a' }, raiderchip: { name: 'Raider Nav Chip', v: 60, col: '#ff3b2a' } });
function makeStarship(col) {
  const g = new THREE.Group(), hull = '#9aa1aa', dk = '#3a3d44', acc = col || C.gunAcc;
  part(g, B(1.6, 1.0, 6.0), hull, 0, 0, 0); part(g, B(1.2, 0.8, 1.6), hull, 0, 0, -3.6); part(g, new THREE.ConeGeometry(0.6, 1.4, 6), hull, 0, 0, -5.1, -Math.PI / 2);
  part(g, B(1.0, 0.5, 1.4), glow('#8fd0ff'), 0, 0.6, -2.6, 0.25); part(g, B(1.7, 0.16, 4.2), acc, 0, 0.56, 0.4);
  for (const s of [-1, 1]) {
    part(g, B(4.2, 0.18, 2.2), hull, 2.6 * s, -0.1, 0.8, 0, 0, -0.08 * s); part(g, B(1.0, 0.2, 2.3), acc, 4.3 * s, -0.25, 0.8, 0, 0, -0.08 * s);
    part(g, Cy(0.55, 0.65, 2.6, 8), dk, 1.4 * s, -0.2, 2.6, Math.PI / 2); part(g, Cy(0.48, 0.48, 0.1, 8), glow('#ff9a3c'), 1.4 * s, -0.2, 3.92, Math.PI / 2);
    part(g, Cy(0.08, 0.08, 1.6, 5), dk, 4.4 * s, -0.1, -0.6, Math.PI / 2);
    part(g, B(0.16, 1.4, 1.4), hull, 0.7 * s, 0.9, 2.2, 0, 0, 0.35 * s);
  }
  g.userData.engines = g.children.filter(m => m.material === glow('#ff9a3c'));
  return g;
}
function makeRaider() {
  const g = new THREE.Group();

  // High-contrast, Imperial-inspired palette
  const plateDark = '#3d414a';     // Mid/dark gunmetal (visible against black space)
  const plateLight = '#5b616d';    // Highlight grey for panel edges
  const frameBlack = '#1c1e24';    // Recessed machinery/pylon trim
  const crimson = '#d41b2c';       // Menacing empire red for borders & armor
  const glowRed = glow('#ff1e2d'); // Laser slits, thrusters, sensor lattices
  const glowCore = glow('#ffffff');// Hot center for twin engines

  // --- 1. CENTRAL COMMAND POD (Spherical/Cylindrical Core + Cockpit Eye) ---
  // Core viewport sphere / faceted hub
  part(g, Cy(0.68, 0.68, 0.72, 8), plateDark, 0, 0, -0.15, Math.PI / 2);
  part(g, B(0.92, 0.62, 0.95), frameBlack, 0, 0, 0.05);

  // Dorsal & ventral armored cowl
  part(g, B(0.82, 0.16, 1.25), plateLight, 0, 0.42, -0.05);
  part(g, B(0.72, 0.12, 1.05), plateDark, 0, -0.42, 0.05);

  // Vader-style faceted cockpit eye with glowing red crossbars
  part(g, Cy(0.48, 0.48, 0.15, 8), frameBlack, 0, 0.05, -0.58, Math.PI / 2);
  part(g, Cy(0.42, 0.42, 0.08, 8), glowRed, 0, 0.05, -0.63, Math.PI / 2);
  part(g, B(0.08, 0.86, 0.12), frameBlack, 0, 0.05, -0.64); // Vertical mullion
  part(g, B(0.86, 0.08, 0.12), frameBlack, 0, 0.05, -0.64); // Horizontal mullion
  part(g, Cy(0.12, 0.12, 0.14, 8), crimson, 0, 0.05, -0.65, Math.PI / 2); // Center hub

  // Chin heavy blaster cannons
  for (const s of [-1, 1]) {
    part(g, Cy(0.06, 0.06, 0.8, 6), frameBlack, 0.28 * s, -0.38, -0.65, Math.PI / 2);
    part(g, Cy(0.035, 0.035, 0.15, 6), glowRed, 0.28 * s, -0.38, -1.05, Math.PI / 2);
  }

  // --- 2. TRANSVERSE PYLONS & OUTWARD OUTRIGGERS ---
  for (const s of [-1, 1]) {
    // Massive horizontal structural wing spar
    part(g, B(1.15, 0.32, 0.65), plateDark, 0.95 * s, 0, 0.1);
    part(g, B(1.05, 0.18, 0.72), frameBlack, 0.95 * s, 0, 0.1);

    // Red running accent rib along the wing pylon
    part(g, B(1.18, 0.06, 0.06), crimson, 0.95 * s, 0.17, 0.1);

    // --- 3. BENT "VADER-STYLE" SOLAR PANELS (Inward-swept, angular brackets) ---
    // Horizontal center mid-fin panel
    part(g, B(0.12, 0.16, 2.7), plateDark, 1.55 * s, 0, 0.05);

    // UPPER BENT WING FLANGE (angled inward toward canopy)
    part(g, B(0.1, 1.45, 2.8), plateDark, 1.95 * s, 0.82, 0.15, 0, 0, -0.55 * s);
    // Upper glowing red perimeter strip (creates readable silhouette)
    part(g, B(0.08, 1.48, 0.08), glowRed, 2.28 * s, 0.82, -1.25, 0, 0, -0.55 * s); // Leading edge
    part(g, B(0.08, 1.48, 0.08), crimson, 1.62 * s, 0.82, 1.55, 0, 0, -0.55 * s);  // Trailing edge
    // Upper exterior armor spine
    part(g, B(0.12, 0.14, 2.9), plateLight, 2.32 * s, 1.42, 0.15, 0, 0, -0.55 * s);

    // LOWER BENT WING FLANGE (symmetrically angled down & inward)
    part(g, B(0.1, 1.45, 2.8), plateDark, 1.95 * s, -0.82, 0.15, 0, 0, 0.55 * s);
    // Lower glowing red perimeter strip
    part(g, B(0.08, 1.48, 0.08), glowRed, 2.28 * s, -0.82, -1.25, 0, 0, 0.55 * s); // Leading edge
    part(g, B(0.08, 1.48, 0.08), crimson, 1.62 * s, -0.82, 1.55, 0, 0, 0.55 * s);  // Trailing edge
    // Lower exterior armor spine
    part(g, B(0.12, 0.14, 2.9), plateLight, 2.32 * s, -1.42, 0.15, 0, 0, 0.55 * s);

    // Vertical radiator matrix slats (breaks up dark panels in game)
    for (let j = 0; j < 3; j++) {
      const zOffset = -0.6 + j * 0.65;
      part(g, B(0.14, 1.35, 0.06), frameBlack, 1.95 * s, 0.82, zOffset, 0, 0, -0.55 * s);
      part(g, B(0.14, 1.35, 0.06), frameBlack, 1.95 * s, -0.82, zOffset, 0, 0, 0.55 * s);
    }
  }

  // --- 4. TWIN ION ENGINE REAR BLOCK ---
  part(g, B(0.85, 0.55, 0.45), frameBlack, 0, 0, 0.7);
  part(g, B(0.75, 0.08, 0.46), crimson, 0, 0.28, 0.7); // Red deck trim

  // Twin glowing engine drives (high visual contrast from behind)
  for (const s of [-1, 1]) {
    part(g, Cy(0.24, 0.24, 0.12, 8), plateLight, 0.24 * s, 0, 0.94, Math.PI / 2);
    part(g, Cy(0.18, 0.18, 0.06, 8), glowRed, 0.24 * s, 0, 0.98, Math.PI / 2);
    part(g, Cy(0.08, 0.08, 0.08, 8), glowCore, 0.24 * s, 0, 1.01, Math.PI / 2);
  }

  return g;
}
function makeZeltac() {
  const g = new THREE.Group();
  const hull = '#7d8088', dk = '#4a4e56';
  const lt = '#a6aab1', black = '#292d34';
  const blue = '#8fe3ff', gold = '#ffd36a';

  // Main hull
  part(g, B(40, 18, 160), hull, 0, 0, 0);
  part(g, B(30, 12, 40), dk, 0, -12, 20);

  // Angular armored prow — replaces the cone
  part(g, B(34, 14, 24), hull, 0, 0, -80);
  part(g, B(28, 11, 18), dk, 0, 0, -96);
  part(g, B(24, 10, 12), hull, 0, 0, -108);
  part(g, B(17, 8, 10), lt, 0, 0, -117);
  part(g, B(10, 6, 8), dk, 0, 0, -125);
  part(g, B(5, 4, 5), hull, 0, 0, -131);

  // Angular side facets on the prow
  for (const s of [-1, 1]) {
    part(g, B(9, 8, 23), lt, s * 12, 1, -96);
    part(g, B(7, 6, 15), dk, s * 9, -1, -112);
    part(g, B(4, 3, 9), hull, s * 5, 0, -122);
  }

  // Reinforced central spine
  part(g, B(13, 3, 125), lt, 0, 10, -5);
  part(g, B(7, 2, 110), dk, 0, 12, -5);

  // Segmented dorsal armor and illuminated vents
  for (let i = 0; i < 10; i++) {
    const h = 14 + (i * 37) % 26;
    const x = (i % 2 ? 1 : -1) * (6 + (i % 3) * 5);
    const z = -60 + i * 13;

    part(g, B(8, h, 8), i % 3 ? dk : hull,
      x, 9 + h / 2, z);

    part(g, B(8.5, 2, 9), lt,
      x, 9 + h, z);

    for (let k = 0; k < Math.floor(h / 3); k++) {
      part(g, B(8.1, 0.5, 8.1),
        glow(k % 2 ? gold : blue),
        x, 10 + k * 3, z);
    }

    part(g, B(10, 2, 10), black, x, 10, z);
  }

  // Command sensor
  part(g, B(14, 8, 2), dk, 0, -4, 80.6);
  part(g, B(9, 3, 2.5), glow('#6fdc5a'), 0, -2, 82);

  // Side wings, engines, and navigation lights
  for (const s of [-1, 1]) {
    // Armored wings
    part(g, B(16, 4, 60), dk, 26 * s, 0, 30);
    part(g, B(13, 2, 48), hull, 26 * s, 3, 30);
    part(g, B(8, 1, 42), lt, 26 * s, 4.2, 30);

    // Wing panel markings
    for (let j = 0; j < 4; j++) {
      part(g, B(10, 0.5, 2), black,
        26 * s, 4.5, 12 + j * 12);
    }

    // Engine housings
    part(g, Cy(5, 6, 14, 10), dk,
      16 * s, -2, 86, Math.PI / 2);

    part(g, Cy(5.5, 5.5, 3, 10), black,
      16 * s, -2, 94, Math.PI / 2);

    // Glowing engine aperture
    part(g, Cy(4.4, 4.4, 0.5, 10), glow(blue),
      16 * s, -2, 93, Math.PI / 2);

    part(g, Cy(2.3, 2.3, 0.7, 10), glow('#e8fbff'),
      16 * s, -2, 93.5, Math.PI / 2);

    // Armored side ribs
    for (let j = 0; j < 3; j++) {
      part(g, B(2, 7, 15), lt,
        s * 20, -2, 12 + j * 17);
    }
  
    // Aft-facing thruster detail
    part(g, B(8, 8, 5), black, s * 9, -7, 68);
    part(g, B(4, 4, 2), glow('#ff9b52'),
      s * 9, -7, 71);

    // Tiny cyan navigation lights along each hull side
    for (let i = 0; i < 12; i++) {
      const z = -66 + i * 11;

      part(g, B(1.4, 2.2, 3.2), black,
        s * 20.4, 2, z);

      part(g, B(0.8, 1.2, 2.2), glow(blue),
        s * 21.1, 2, z);
    }

    // Amber upper-hull status lights
    for (let i = 0; i < 4; i++) {
      part(g, B(2, 1, 4), glow(gold),
        s * 16, 9.7, -35 + i * 20);
    }
  }

  // Underside armor
  part(g, B(26, 3, 72), dk, 0, -10, 5);
  part(g, B(18, 2, 50), hull, 0, -12, 8);

  // Hull seams
  for (let i = 0; i < 6; i++) {
    const z = -42 + i * 17;
    part(g, B(41, 1, 1.5), black, 0, 9.1, z);
  }

  return g;
}
// ---------------- the space level ----------------
const SPACE_BODIES = {
  earth: { pos: V(0, -40, -700), r: 160, col: '#3a6cb8', clouds: true },
  mezar: { pos: V(900, 60, -260), r: 180, col: "#d49a5a", ring: true, survey: "Mezar", note: "Arid canyon world with deep sandstone ravines, sand worms, and forgotten ruins." },
  capitone: { pos: V(-860, -60, -380), r: 170, col: '#9fe8ff', clouds: true },
  robot: { pos: V(160, -50, 900), r: 150, col: '#c8402f' },
  zeltac: { pos: V(260, 30, -220), r: 70, station: true },
  moon: { pos: V(330, 90, -980), r: 48, col: '#b0b0b4', survey: 'Earth\'s Moon', note: 'Mining area and dome city, from the sketches' },
  ocean: { pos: V(-520, 140, 1150), r: 200, col: '#2a8a9a', survey: 'Ocean World', note: 'Kelp city and bubble city wait under the waves', clouds: true },
  zarlich: { pos: V(1500, -220, 800), r: 150, col: '#c86aff', survey: 'Zarlich', note: 'Violet storms, unknown life', ring: true },
  vector: { pos: V(-1550, 260, 600), r: 170, col: '#5a2a6a', survey: 'Vector', note: 'The dark world. Something watches back.' }
};
const SPACE_SPREAD = 2.9; // worlds sit further apart
Object.values(SPACE_BODIES).forEach(b => b.pos.multiplyScalar(SPACE_SPREAD));
const SHIP_SYS = {
  laser: { name: 'Lasers', lv: [{ dmg: 30 }, { dmg: 48, cost: { cr: 800, ore: 10 } }, { dmg: 75, cost: { cr: 2200, ore: 20, starcrystal: 2 } }, { dmg: 115, cost: { cr: 6000, ore: 35, starcrystal: 6 } }] },
  hull: { name: 'Hull', lv: [{ hp: 260 }, { hp: 400, cost: { cr: 700, ore: 12 } }, { hp: 600, cost: { cr: 2000, ore: 24, scrap: 20 } }, { hp: 900, cost: { cr: 5500, ore: 40, starcrystal: 5 } }] },
  engine: { name: 'Engines', lv: [{ sp: 70 }, { sp: 90, cost: { cr: 600, ore: 8 } }, { sp: 115, cost: { cr: 1800, ore: 18, circuit: 6 } }, { sp: 145, cost: { cr: 5000, ore: 30, starcrystal: 4 } }] }
};
const sysLv = (k) => (S.ship.sys && S.ship.sys[k]) || 0;
const hullMax = () => Math.round(SHIP_SYS.hull.lv[sysLv('hull')].hp * (typeof shipMod === 'function' ? shipMod('hull') : 1));
let fly = null; // flight state while in space
const F_markers = [];
const bodyName = (id) => SPACE_BODIES[id].survey || (LEVELS[id] ? LEVELS[id].name : id === 'robot' ? 'Robot City' : id);
LEVELS.space = {
  id: 'space', name: 'Open space', tag: 'Fly the Setting Sun', size: 120, center: [0, 0], radius: 6000, water: -99, sky: 'space', weather: 'none', fly: true,
  terrain: null, palette: { grass: '#0a0f26' }, zones: [], paths: [], river: [], pools: [], lava: [], safes: [], npcs: [], spawns: [], npcBase: [0, 0],
  spawn: { x: 0, z: -680, yaw: 0 }, menu: { x: 0, z: -680, r: 30, h: 8 },
  build() {
    fly = { vel: V(0, 0, 0), roll: 0, cool: 0, raiders: [], bolts: [], drops: [], rocks: null, rockData: [], ship: null, shake: 0, prompt: null, hintT: 6 };
    // planets, rings, the sun
    for (const id in SPACE_BODIES) {
      const P = SPACE_BODIES[id];
      if (P.station) { const z = makeZeltac(); z.position.copy(P.pos); z.rotation.y = 0.6; levelGroup.add(z); const t0 = z; levelAnims.push(t => { t0.rotation.z = Math.sin(t * 0.1) * 0.02; }); continue; }
      const m = new THREE.Mesh(new THREE.SphereGeometry(P.r, 24, 16), psx(new THREE.MeshLambertMaterial({ map: planetTex(id) }))); m.position.copy(P.pos); levelGroup.add(m);
      levelAnims.push(t => { m.rotation.y = t * 0.01; });
      if (P.clouds) { const cl = new THREE.Mesh(new THREE.SphereGeometry(P.r * 1.02, 24, 16), new THREE.MeshLambertMaterial({ map: planetTex(id, 'clouds'), transparent: true, depthWrite: false })); cl.position.copy(P.pos); levelGroup.add(cl); levelAnims.push(t => { cl.rotation.y = t * 0.018; }); }
      const atm = new THREE.Mesh(new THREE.SphereGeometry(P.r * 1.04, 20, 12), new THREE.MeshBasicMaterial({ color: P.col, transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false })); atm.position.copy(P.pos); levelGroup.add(atm);
      if (P.ring) { const ring = new THREE.Mesh(new THREE.RingGeometry(P.r * 1.35, P.r * 2.1, 48), new THREE.MeshBasicMaterial({ color: '#f2d6a8', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); ring.position.copy(P.pos); ring.rotation.set(-1.2, 0.3, 0); levelGroup.add(ring); }
    }
    const sunM = new THREE.Mesh(new THREE.SphereGeometry(260, 20, 12), new THREE.MeshBasicMaterial({ color: '#ffd38a', fog: false })); sunM.position.set(-5200, 1400, 3600); levelGroup.add(sunM);
    const sunL = new THREE.DirectionalLight(0xfff0d8, 1.1); sunL.position.copy(sunM.position); levelGroup.add(sunL); levelGroup.add(sunL.target);
    // asteroid belt between the worlds
    const N = 420, geo = new THREE.IcosahedronGeometry(1, 0), rocks = new THREE.InstancedMesh(geo, psx(new THREE.MeshLambertMaterial({ map: TEX.stone, color: '#ffffff' })), N);
    const dm = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + Math.sin(i * 7.3) * 0.08, d = 1520 + Math.sin(i * 3.1) * 180 + (i % 5) * 28, s = 3 + (i * 37 % 11) * 1.4 + (i % 13 === 0 ? 10 : 0);
      const p = V(Math.cos(a) * d, Math.sin(i * 1.7) * 80, Math.sin(a) * d * 0.7 + 180), crystal = i % 9 === 0, drug = i % 9 === 4;
      fly.rockData.push({ p, s, hp: s * 12, max: s * 12, crystal, drug, dead: 0, spin: V(Math.sin(i), Math.cos(i * 2), Math.sin(i * 3)).multiplyScalar(0.2) });
      dm.position.copy(p); dm.scale.setScalar(s); dm.rotation.set(i, i * 2, i * 3); dm.updateMatrix(); rocks.setMatrixAt(i, dm.matrix);
      rocks.setColorAt(i, new THREE.Color(crystal ? '#ffe070' : drug ? '#6aff7a' : ['#ffffff', '#d8c8b8', '#b8b0a8'][i % 3]));
    }
    levelGroup.add(rocks); fly.rocks = rocks; fly.dm = dm;
    // drug rocks: a soft green glow around each one, so you can spot them across the belt
    for (const R of fly.rockData) if (R.drug) { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: '#3aff5a', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); gl.position.copy(R.p); gl.scale.setScalar(R.s * 3.2); levelGroup.add(gl); R.glow = gl; }
    // raider packs
    // raider packs scattered all over the map: tougher the further out you fly
    for (let i = 0; i < 18; i++) { const a = i * 2.39 + 0.5, d = 700 + (i * 977 % 3600), lv = Math.round(10 + d / 4300 * 30 + (i % 3) * 2), cx = Math.cos(a) * d, cz = Math.sin(a) * d, cy = Math.sin(i * 1.3) * 140;
      for (let k = 0, n = 3 + i % 3; k < n; k++) spawnRaider(V(cx + rand(-70, 70), cy + rand(-35, 35), cz + rand(-70, 70)), lv); }
    // name markers you can see from anywhere
    F_markers.length = 0;
    for (const id in SPACE_BODIES) { const P = SPACE_BODIES[id], sp = labelSprite(768, 72); levelGroup.add(sp); F_markers.push({ id, P, sp, t: 0 }); }
    // your ship (seen from behind)
    fly.ship = makeStarship(S.col); levelGroup.add(fly.ship);
    // exhaust trail
    fly.trail = []; for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(sparkGeo, glow('#ff9a3c')); m.scale.setScalar(6); levelGroup.add(m); fly.trail.push(m); }
  }
};
function spawnRaider(p, lv) {
  const obj = makeRaider(); obj.rotation.order = 'YXZ'; mergeChar(obj); levelGroup.add(obj);
  const plate = labelSprite(512, 72); plate.scale.set(14, 2, 1); plate.position.y = 4; obj.add(plate);
  const r = { obj, plate, home: p.clone(), lv, max: 60 + lv * 9, hp: 0, cd: rand(1, 3), dead: 0, vel: V(0, 0, 0), wander: p.clone(), aggro: false, def: { name: 'Drome Raider' } };
  r.hp = r.max; obj.position.copy(p); fly.raiders.push(r); drawPlate(plate, 'Drome Raider', 'Lv ' + lv, hpColor(lv), null); return r;
}
function enterSpace(near) {
  const P = SPACE_BODIES[near] || SPACE_BODIES.earth, out = P.pos.clone().add(V(0, 0, P.r + 90).applyAxisAngle(V(0, 1, 0), near === 'zeltac' ? 0.6 : 0.4));
  player.groundHp = player.groundHp != null ? player.groundHp : player.hp;
  travel('space', { at: { x: out.x, z: out.z, yaw: Math.atan2(out.x - P.pos.x, out.z - P.pos.z), y: out.y } });
}
function leaveSpace(to) { closeDlg(); travel(to || 'ship'); }
const shipFwd = V(0, 0, 0), shipUp = V(0, 0, 0), shipRight = V(0, 0, 0), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
function shipGrip() { return 1.6; }
function shipStrafe() { return 0.4; }
function shipLift() { return 0; }
function shipMineMul() { return 1; }
function shipOreMul() { return 1; }
function spaceStep(dt, t) {
  const F = fly; if (!F) return;
  const frozen = dlgOpen || chatOpen();
  _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e);
  shipFwd.set(0, 0, -1).applyQuaternion(_q); shipUp.set(0, 1, 0).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q);
  let nearSurf = 1e9; for (const id in SPACE_BODIES) nearSurf = Math.min(nearSurf, player.pos.distanceTo(SPACE_BODIES[id].pos) - SPACE_BODIES[id].r);
  const thIn = (keys.KeyW ? 1 : 0) + move.y;
  F.cruise = thIn > 0.9 && nearSurf > 260 && !frozen ? Math.min(5, (F.cruise || 1) + dt * 0.9) : Math.max(1, (F.cruise || 1) - dt * 3);
  const maxSp = SHIP_SYS.engine.lv[sysLv('engine')].sp * F.cruise * (typeof shipMod === 'function' ? shipMod('sp') : 1), boost = (keys.ShiftLeft || keys.ShiftRight) ? 1.8 : 1;
  const th = frozen ? 0 : clamp((keys.KeyW ? 1 : 0) - (keys.KeyS ? 0.6 : 0) + move.y, -0.6, 1), st = frozen ? 0 : clamp((keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x, -1, 1);
  const want = shipFwd.clone().multiplyScalar(th * maxSp * boost).addScaledVector(shipRight, st * maxSp * shipStrafe()).addScaledVector(shipUp, (frozen ? 0 : shipLift()) * maxSp * shipStrafe());
  F.vel.lerp(want, Math.min(1, dt * shipGrip() * (gameTime - (F.rockBumpT || -9) < 0.45 ? 0.15 : 1))); SFX.engine(0.4 + Math.abs(th) * 0.6, F.vel.length() / 200);
  player.pos.addScaledVector(F.vel, dt);
  // keep out of planets and rocks
  for (const id in SPACE_BODIES) { const P = SPACE_BODIES[id], d = player.pos.distanceTo(P.pos), m = P.r + (P.station ? 45 : 30);
    if (d < m) {
      const L = LEVELS[id], canLand = L && planetOpen(id) && !(P.survey && !L);
      if (canLand && !F.landing && player.alive) { F.landing = true; S.orbit = id; player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; toast(id === 'zeltac' ? 'DOCKING' : 'ENTERING ATMOSPHERE', L.name, 2); travel(id); return; }
      const out = player.pos.clone().sub(P.pos).normalize(); player.pos.copy(P.pos).addScaledVector(out, m + 6);
      const vn = F.vel.dot(out); if (vn < 0) F.vel.addScaledVector(out, -vn * 1.8); F.vel.multiplyScalar(0.5);
      if (!F.bumpT || gameTime - F.bumpT > 3) { F.bumpT = gameTime; SFX.block(); log(!L ? `${bodyName(id)} has no landing site yet. Scan it with E when you're close.` : `${L.name} is locked. Keep following the story to open it.`); }
    } }
  for (const R of F.rockData) { if (R.dead) continue; const d = player.pos.distanceTo(R.p), m = R.s + 3; if (d < m) { const out = d > 0.01 ? player.pos.clone().sub(R.p).normalize() : V(0, 1, 0); player.pos.copy(R.p).addScaledVector(out, m + 1.5); const vn = F.vel.dot(out); if (vn < 0) { if (-vn > 30 && (!F.rockHitT || gameTime - F.rockHitT > 1)) { F.rockHitT = gameTime; hurt(-vn * 0.15); F.shake = 0.4; } F.vel.addScaledVector(out, -vn * 1.6); } F.vel.addScaledVector(out, 12); F.rockBumpT = gameTime; } }
  if (player.pos.length() > 6400) player.pos.setLength(6400);
  F.mkT = (F.mkT || 0) - dt;
  for (const M of F_markers) { const d = player.pos.distanceTo(M.P.pos), surf = Math.max(0, d - M.P.r);
    M.sp.position.copy(M.P.pos).add(V(0, M.P.r * 1.08 + d * 0.06, 0)); M.sp.scale.set(d * 0.75, d * 0.07, 1); M.sp.visible = surf > 60 && !!PREFS.planetTags;
    if (F.mkT <= 0) { const L = LEVELS[M.id], locked = !M.P.survey && !(L && planetOpen(M.id)); drawPlate(M.sp, bodyName(M.id), (surf > 999 ? (surf / 1000).toFixed(1) + ' km' : Math.round(surf) + ' m') + (M.P.survey ? ((S.flags && S.flags['scan_' + M.id]) ? ' · scanned' : ' · uncharted') : locked ? ' · locked' : ''), M.P.survey ? '#c8a0ff' : locked ? '#9aa1aa' : '#8fe3ff', null); } }
  if (F.mkT <= 0) F.mkT = 0.5;
  F.roll += ((-st * 0.5 - (F.lastYaw != null ? (player.yaw - F.lastYaw) / Math.max(dt, 1e-3) * 0.08 : 0)) - F.roll) * Math.min(1, dt * 4); F.lastYaw = player.yaw;
  F.ship.position.copy(player.pos); F.ship.rotation.set(0, 0, 0); F.ship.quaternion.copy(_q); F.ship.rotateZ(clamp(F.roll, -0.8, 0.8));
  const eng = 0.6 + th * 0.6 * boost + Math.sin(t * 30) * 0.08; F.ship.userData.engines.forEach(m => m.scale.set(eng, 1, eng));
  // exhaust comes out of the BACK of the ship, in the color picked in the ship customizer
  if (F.sternD == null && F.ship) { const bx = new THREE.Box3().setFromObject(F.ship), c = F.ship.position; let mn = 0; for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) mn = Math.min(mn, (x - c.x) * shipFwd.x + (y - c.y) * shipFwd.y + (z - c.z) * shipFwd.z); F.sternD = Math.max(1.5, -mn + 0.4); }
  { const ex = (SHIP_EXHAUST[(smS().x | 0)] || SHIP_EXHAUST[0])[1]; F.trail.forEach((m, i) => { const want = ex === 'rainbow' ? '#' + new THREE.Color().setHSL(((t * 0.4 + i / 18) % 1), 1, 0.6).getHexString() : ex; if (m.userData.ex !== want) { m.material = glow(want); m.userData.ex = want; } }); }
  F.trail.forEach((m, i) => { if ((Math.floor(t * 60) + i) % 18 === 0) { m.position.copy(player.pos).addScaledVector(shipFwd, -F.sternD).addScaledVector(shipRight, i % 2 ? 1.4 : -1.4).addScaledVector(shipUp, -0.2); } m.scale.setScalar(Math.max(0.5, 5 * th * boost)); m.visible = th > 0.05; });
  // chase camera
  F.shake = Math.max(0, F.shake - dt);
  const camPos = player.pos.clone().addScaledVector(shipFwd, -15).addScaledVector(shipUp, 4.2);
  if (F.shake > 0) camPos.add(V(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)));
  for (const id in SPACE_BODIES) { const P = SPACE_BODIES[id], d = camPos.distanceTo(P.pos), m = P.r + 4; if (d < m) camPos.copy(P.pos).addScaledVector(camPos.clone().sub(P.pos).normalize(), m); }
  camera.position.copy(camPos); camera.quaternion.copy(_q); camera.rotateX(-0.12);
  // lasers
  F.cool -= dt;
  if (firing && !frozen && F.cool <= 0) shipFire();
  // raiders
  for (const r of F.raiders) {
    const o = r.obj;
    if (r.dead) { r.dead += dt; if (r.dead > 45) { r.dead = 0; r.hp = r.max; o.visible = true; o.position.copy(r.home); r.aggro = false; drawPlate(r.plate, 'Drome Raider', 'Lv ' + r.lv, hpColor(r.lv), null); } continue; }
    const to = player.pos.clone().sub(o.position), d = to.length();
    o.visible = d < 1400; if (d > 1500) continue;
    // raiders only fight back once you shoot them
    if (r.aggro && (d > 700 || !player.alive)) r.aggro = false;
    let goal;
    if (r.aggro) { goal = player.pos.clone().addScaledVector(F.vel, 0.6).add(V(Math.sin(t * 0.7 + r.lv) * 40, Math.cos(t * 0.9 + r.lv) * 20, Math.cos(t * 0.6 + r.lv) * 40)); }
    else { if (o.position.distanceTo(r.wander) < 20) r.wander = r.home.clone().add(V(rand(-80, 80), rand(-30, 30), rand(-80, 80))); goal = r.wander; }
    const dir = goal.clone().sub(o.position).normalize(), spd = r.aggro ? 62 + r.lv : 25;
    r.vel.lerp(dir.multiplyScalar(spd), Math.min(1, dt * 1.2)); o.position.addScaledVector(r.vel, dt);
    const look = o.position.clone().sub(r.vel); o.lookAt(look);
    r.cd -= dt;
    if (r.aggro && r.cd <= 0 && d < 260) { const aim = to.clone().normalize(), fw = V(0, 0, -1).applyQuaternion(o.quaternion);
      if (aim.dot(r.vel.clone().normalize()) > 0.7) { r.cd = rand(0.8, 1.6); const m = new THREE.Mesh(boltGeo, glow('#ff2a3a')); m.scale.setScalar(4); m.position.copy(o.position); levelGroup.add(m);
        const lead = player.pos.clone().addScaledVector(F.vel, d / 150); F.bolts.push({ m, v: lead.sub(o.position).normalize().multiplyScalar(150), life: 3, dmg: 6 + r.lv * 0.9 }); if (d < 200) SFX.zap(); } }
    o.children.forEach(c => { if (c.isSprite) c.visible = d < 500; });
  }
  for (let i = F.bolts.length - 1; i >= 0; i--) { const b = F.bolts[i]; b.m.position.addScaledVector(b.v, dt); b.life -= dt;
    let done = b.life <= 0; if (!done && b.m.position.distanceTo(player.pos) < 4.5) { hurt(b.dmg); F.shake = 0.25; burst(b.m.position, '#ff6040', 8, 10); done = true; }
    if (done) { levelGroup.remove(b.m); F.bolts.splice(i, 1); } }
  // asteroid respawn + spin
  let dirty = false;
  F.rockData.forEach((R, i) => { if (R.dead) { R.dead += dt; if (R.dead > 60) { R.dead = 0; R.hp = R.max; dirty = true; if (R.glow) R.glow.visible = true; F.dm.position.copy(R.p); F.dm.scale.setScalar(R.s); F.dm.rotation.set(i, i * 2, i * 3); F.dm.updateMatrix(); F.rocks.setMatrixAt(i, F.dm.matrix); } } });
  if (dirty) F.rocks.instanceMatrix.needsUpdate = true;
  // floating loot
  for (let i = F.drops.length - 1; i >= 0; i--) { const dr = F.drops[i]; dr.life -= dt; dr.m.rotation.y += dt * 2; const d = dr.m.position.distanceTo(player.pos);
    if (d < 40) dr.m.position.lerp(player.pos, Math.min(1, dt * 3)); if (d < 7) { if (dr.kind === 'cr') { S.cr += dr.n; log(`+${dr.n} cr`, 'loot'); SFX.coin(); } else if (!invAdd(dr.id, dr.n)) { dr.life = Math.max(dr.life, 30); continue; } else { log(`+${dr.n} ${ITEMS[dr.id].name}`, 'loot'); SFX.item(); } levelGroup.remove(dr.m); F.drops.splice(i, 1); markDirty(); checkReady(); continue; }
    if (dr.life <= 0) { levelGroup.remove(dr.m); F.drops.splice(i, 1); } }
  // landing / docking prompts
  F.prompt = null; let best = 1e9;
  for (const id in SPACE_BODIES) { const P = SPACE_BODIES[id], d = player.pos.distanceTo(P.pos) - P.r; if (d < (P.station ? 120 : 110) && d < best) { best = d; F.prompt = id; } }
  nearNpc = null; nearAct = null;
  if (F.prompt && SPACE_BODIES[F.prompt].survey && !(LEVELS[F.prompt] && planetOpen(F.prompt))) { const id = F.prompt, P = SPACE_BODIES[id], done = S.flags && S.flags['scan_' + id];
    nearAct = { label: done ? `${P.survey}: ${P.note}` : `Scan ${P.survey}`, fn: () => { if (done) { log(`${P.survey}: ${P.note}. Landing comes in a later update.`); return; } S.flags = S.flags || {}; S.flags['scan_' + id] = true; SFX.quest(); toast('WORLD SCANNED', P.survey, 3.5); log(`${P.survey} charted: ${P.note}.`, 'loot'); gainXp(400 + S.lvl * 20); S.inv.starcrystal = (S.inv.starcrystal || 0) + 1; questProgressKill('scan'); checkReady(); markDirty(); } }; }
  else if (F.prompt) { const id = F.prompt, L = LEVELS[id], open = planetOpen(id);
    nearAct = { label: !L ? 'Robot City · coming soon' : !open ? `${L.name} · locked` : id === 'zeltac' ? 'Dock at the Zeltac Ship' : `Land on ${L.name}`, fn: () => { if (L && open) { S.orbit = id; player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; travel(id); } else log(L ? 'That world is locked. Keep following the story.' : 'Robot City opens in a later update.'); } }; }
  else nearAct = { label: 'Leave the helm', fn: () => { player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; leaveSpace('ship'); }, quiet: true };
  const tb = $('talk'); if (!dlgOpen) { tb.hidden = false; tb.innerHTML = ''; tb.append(nearAct.label); if (!TOUCH) { const k = document.createElement('kbd'); k.textContent = 'E'; tb.append(k); } tb.style.opacity = nearAct.quiet ? 0.55 : 1; } else tb.hidden = true;
  F.hintT -= dt; if (F.hintT > 0 && F.hintT < 5.9 && !F.hinted) { F.hinted = true; log(TOUCH ? 'Stick to fly, drag to steer, hold BOOST to go fast, FIRE to shoot. Fly close to a world to land.' : 'W/S throttle · mouse steers · Shift boost · click to fire. Fly close to a world to land, or press E to walk your ship.', 'loot'); }
  if (!inSafe(player.pos) && t - player.lastHurt > 8) player.hp = Math.min(maxHp(), player.hp + 3 * dt);
}
function shipFire() {
  const F = fly; F.cool = 0.16; SFX.laser(); F.shake = Math.max(F.shake, 0.05);
  const dmg = SHIP_SYS.laser.lv[sysLv('laser')].dmg * (1 + (S.lvl - 1) * 0.03) * (typeof shipMod === 'function' ? shipMod('laser') : 1);
  _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q);
  let focus = player.pos.clone().addScaledVector(shipFwd, 160), bestA = 0.1;
  for (const r of F.raiders) { if (r.dead) continue; const to = r.obj.position.clone().sub(player.pos), d = to.length(); if (d > 420) continue; const a = to.normalize().angleTo(shipFwd); if (a < bestA) { bestA = a; focus = r.obj.position.clone(); } }
  for (const side of [-1, 1]) {
    const from = player.pos.clone().addScaledVector(shipRight, 4.4 * side).addScaledVector(shipFwd, -1), dir = focus.clone().sub(from).normalize();
    let hit = null, ht = 420, rock = -1;
    for (const r of F.raiders) { if (r.dead) continue; const tt = raySphere(from, dir, r.obj.position, 5); if (tt > 0 && tt < ht) { ht = tt; hit = r; rock = -1; } }
    F.rockData.forEach((R, i) => { if (R.dead) return; const tt = raySphere(from, dir, R.p, R.s); if (tt > 0 && tt < ht) { ht = tt; hit = null; rock = i; } });
    const end = from.clone().addScaledVector(dir, ht); tracer(from, end, '#6fdc5a');
    if (hit) { hit.hp -= dmg / 2; hit.aggro = true; burst(end, '#ffd36a', 6, 12); hitmark(false); if (hit.hp <= 0) killRaider(hit); else drawPlate(hit.plate, (hit.def && hit.def.name) || 'Drome Raider', 'Lv ' + hit.lv, hpColor(hit.lv), hit.hp / hit.max); }
    else if (rock >= 0) { const R = F.rockData[rock]; R.hp -= dmg / 2 * shipMineMul(); burst(end, '#b8a07a', 4, 10);
      if (R.hp <= 0) { R.dead = 0.001; F.dm.position.copy(R.p); F.dm.scale.setScalar(0.0001); F.dm.updateMatrix(); F.rocks.setMatrixAt(rock, F.dm.matrix); F.rocks.instanceMatrix.needsUpdate = true; burst(R.p, '#b8a07a', 24, 30); SFX.crack();
        const n = Math.max(1, Math.round(R.s / 4 * shipOreMul())); for (let k = 0; k < n; k++) spaceDrop(R.p, 'item', 'ore', 1); if (R.crystal || Math.random() < 0.1) spaceDrop(R.p, 'item', 'starcrystal', 1); if (R.drug) { if (R.glow) R.glow.visible = false; const ks = Object.keys(BQ_ING).filter(k => !BQ_ING[k].rare); for (let k = 0; k < 2 + randi(0, 2); k++) spaceDrop(R.p, 'item', ks[randi(0, ks.length - 1)], 1); if (Math.random() < 0.08) spaceDrop(R.p, 'item', 'starnectar', 1); } questProgressKill('asteroid'); } }
  }
}
function killRaider(r) {
  r.dead = 0.001; r.obj.visible = false; SFX.boom(); hitmark(true); burst(r.obj.position, '#ff9a3c', 30, 30); burst(r.obj.position, '#ff2a3a', 16, 20);
  spaceDrop(r.obj.position, 'cr', null, Math.round(rand(20, 40) * (1 + r.lv * 0.08)));
  if (Math.random() < 0.5) spaceDrop(r.obj.position, 'item', 'raiderchip', 1); if (Math.random() < 0.4) spaceDrop(r.obj.position, 'item', 'circuit', 1);
  gainXp(Math.round(30 + r.lv * 9)); questProgressKill('raider'); if (r.bounty) bountyDone(); checkReady(); markDirty();
}
function spaceDrop(p, kind, id, n) {
  const m = new THREE.Mesh(kind === 'cr' ? coinGeo : dropGeo, glow(kind === 'cr' ? '#ffd36a' : ITEMS[id].col)); m.scale.setScalar(6); m.position.copy(p).add(V(rand(-6, 6), rand(-6, 6), rand(-6, 6)));
  levelGroup.add(m); fly.drops.push({ m, kind, id, n, life: 90 });
}
const maxHpGround = () => Math.round((100 + (S.lvl - 1) * 12) * (hasGear('gaunt') ? 1.25 : 1));
function drawSpaceMap(mctx, S2) {
  const sc = 0.045, cx = S2 / 2, cy = S2 / 2;
  mctx.save(); mctx.translate(cx, cy);
  const w2m = (p) => [(p.x - player.pos.x) * sc, (p.z - player.pos.z) * sc];
  for (const id in SPACE_BODIES) { const P = SPACE_BODIES[id], [x, z] = w2m(P.pos); mctx.fillStyle = P.station ? '#8fe3ff' : P.col; mctx.beginPath(); mctx.arc(x, z, Math.max(3, P.r * sc), 0, 7); mctx.fill(); }
  mctx.fillStyle = 'rgba(184,160,122,.5)'; fly.rockData.forEach((R, i) => { if (i % 3 || R.dead) return; const [x, z] = w2m(R.p); mctx.fillRect(x, z, 1.5, 1.5); });
  mctx.fillStyle = '#ff2a3a'; fly.raiders.forEach(r => { if (r.dead) return; const [x, z] = w2m(r.obj.position); mctx.fillRect(x - 1.5, z - 1.5, 3, 3); });
  mctx.restore();
}
// ---------------- the Zeltac Ship: a city in space ----------------
LEVELS.zeltac = {
  id: 'zeltac', name: 'The Zeltac Ship', tag: 'A city that flies', lvls: 'Hub · all levels', size: 120, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#3a3d44' }, zones: [{ id: 'plaza', name: 'Zeltac Plaza', lvl: 'Safe · shops · missions', x: 0, z: 0, r: 24, col: '#3a3d44', safe: true, h: 0 }], paths: [], river: [], pools: [], lava: [],
  safes: [{ x: 0, z: 0, r: 400 }], spawn: { x: 0, z: 20, yaw: 0 }, pad: { x: 0, z: 24 }, menu: { x: 0, z: 10, r: 16, h: 6 }, npcBase: [0, 0],
  npcs: [
    { id: 'rell', name: 'Harbor Master Rell', role: 'Mission center', rig: 'elismas', make: () => recolor(makeElismas(), { '#9aa1aa': '#5d7f99' }), x: -9, z: -8, face: 0.5, idle: ["Twenty floors of trouble and it's all mine.", "The board always has work for a pilot."] },
    { id: 'ozzo', name: 'Ozzo', role: 'Zeltac Exchange · buys anything', rig: 'bughybrid', make: () => recolor(makeBugHybrid(), { '#5f8a3a': '#8a6fc4', '#3e5e26': '#5d4a8a' }), x: 9, z: -8, face: -0.5, shop: 'store', idle: ["Ore, chips, fish, fangs. Ozzo buys from every world."] },
    { id: 'brakka', name: 'Brakka', role: 'Shipwright', rig: 'chunk', make: () => makeChunkMonster('#c9a43a', '#8a6a2a', '#e8c890', '#5d636c', false), x: 20.2, z: 7.2, face: Math.PI / 2, shipwright: true, idle: ["Lasers, hull plates, engines. Bring ore, I make your ship sing."] },
    { id: 'tova', name: 'Dr. Tova', role: 'Hospital', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#3b4f7a', '#8fae6a', '#1e1a18', '#c8402f'), x: -12, z: 4, face: 1.3, heal: true, idle: ["Space sickness, raider burns, I've seen it all."] },
    { id: 'vault', name: 'Vault-9', role: 'Bank', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#c9a43a' }), x: 0, z: -14, face: 0, bank: true, idle: ["DEPOSITS. ARE. SAFE."] },
    { id: 'pell', name: 'Pell', role: 'Fish buyer', rig: 'civ', make: () => makeCivilian('#2a5a7a', '#2c2a28', '#c58a64', '#ffb347'), x: -5, z: 12, face: Math.PI * 0.8, shop: 'fish', rods: [1, 2, 3], idle: ["Space fish? No. But I'll buy yours."] }
  ],
  spawns: [],
  build() {
    const H = 9, W = 30, D = 34, wallC = '#5d636c';
    const fl = new THREE.PlaneGeometry(W * 2, D * 2); fl.rotateX(-Math.PI / 2); const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W, uv.getY(i) * D);
    const floor = new THREE.Mesh(fl, toon('#4f545c', 'panel')); props.add(floor);
    const ceil = new THREE.Mesh(fl.clone(), toon('#2c2f36', 'panel')); ceil.rotation.x = Math.PI; ceil.position.y = H; props.add(ceil);
    for (const [x, z, w, d] of [[0, -D, W * 2, 0.6], [-W, 0, 0.6, D * 2], [W, 0, 0.6, D * 2], [-W / 2 - 4, D, W - 8, 0.6], [W / 2 + 4, D, W - 8, 0.6]]) { part(props, B(w, H, d), wallC, x, H / 2, z); box(x, z, w / 2, d / 2); }
    // balconies (the 20 floors above) and neon trims
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { part(props, B(4, 0.3, D * 2 - 4), '#3a3d44', s * (W - 2), 3 + k * 2.2, 0); part(props, B(0.1, 0.12, D * 2 - 4), glow(k % 2 ? '#8fe3ff' : '#ff6aa8'), s * (W - 4), 3.2 + k * 2.2, 0); }
    for (let z = -D + 4; z < D; z += 8) part(props, B(W * 2 - 2, 0.1, 0.4), glow('#cfe6ff'), 0, H - 0.1, z);
    // central hologram of the galaxy
    part(props, Cy(3, 3.4, 0.6, 16), '#3a3d44', 0, 0.3, 0); part(props, Cy(2.8, 2.8, 0.05, 20), glow('#2a6aa8'), 0, 0.62, 0); solid(0, 0, 3.4);
    const holo = new THREE.Group(); holo.position.set(0, 3.2, 0); levelGroup.add(holo);
    for (const id of ['earth', 'mezar', 'capitone', 'robot']) { const P = SPACE_BODIES[id], m = new THREE.Mesh(new THREE.SphereGeometry(0.35 + P.r / 900, 10, 8), new THREE.MeshBasicMaterial({ map: planetTex(id) })); m.position.set(P.pos.x / 580, P.pos.y / 290, P.pos.z / 580); holo.add(m); }
    const zs = new THREE.Mesh(B(0.5, 0.2, 1.4), glow('#8fe3ff')); zs.position.set(SPACE_BODIES.zeltac.pos.x / 580, 0, SPACE_BODIES.zeltac.pos.z / 580); holo.add(zs);
    levelAnims.push(t => { holo.rotation.y = t * 0.15; });
    // shop fronts with signs
    const front = (x, z, ry, label, col) => { const g = new THREE.Group(); part(g, B(6, 4, 0.4), '#3a3d44', 0, 2, 0); part(g, B(5.6, 0.1, 1.4), toon(col), 0, 3.2, 0.7, 0.2);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.9), new THREE.MeshBasicMaterial({ map: signTex(label, '#0f1757', '#ffd75e') })); sg.position.set(0, 3.7, 0.22); g.add(sg); part(g, B(3, 1.0, 0.8), toon('#8a6a44', 'wood'), 0, 0.5, 1.0);
      g.position.set(x, 0, z); g.rotation.y = ry; props.add(g); };
    front(-9, -11.5, 0.5, 'MISSIONS', '#c8402f'); front(9, -11.5, -0.5, 'EXCHANGE', '#8a6fc4'); front(-15, 4, Math.PI / 2, 'HOSPITAL', '#e8e4dc'); front(0, -17.5, 0, 'VAULT', '#c9a43a');
    for (const [x, z] of [[-9, -11.5], [9, -11.5], [0, -17.5]]) box(x, z, 3, 0.6); box(-15, 4, 0.6, 3);
    // the alien barricade, from the sketch
    for (let i = 0; i < 7; i++) { part(props, B(2.2, 1.6, 1.2), toon(i % 2 ? '#a07a4a' : '#5d636c', i % 2 ? 'wood' : 'panel'), -18 + i * 2.6, 0.8, -26, 0, (i % 3) * 0.2); part(props, new THREE.ConeGeometry(0.2, 0.8, 4), C.red, -18 + i * 2.6, 2, -26); }
    box(-10.2, -26, 9.4, 1); { const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1), new THREE.MeshBasicMaterial({ map: signTex('ALIEN QUARTER · KEEP OUT', '#3a0e0e', '#ff6a5a') })); sg.position.set(-10, 3.2, -25.3); props.add(sg); }
    // airlock back to your ship
    part(props, B(8, 6, 0.4), '#3a3d44', 0, 3, D + 0.2); part(props, B(6, 5, 0.3), glow('#2a6aa8'), 0, 2.5, D - 0.1);
    INTERACTS.push({ x: 0, z: D - 3, r: 4, label: 'Airlock: back to your ship', fn: () => travel('ship') });
    // crowd: aliens walking the plaza
    const walkers = [() => recolor(makeSpearman(), { '#7fae63': '#c47a4a' }), () => makeCivilian('#8a3a2e', '#2c2a28', '#9fe8ff', '#1e1a18'), () => recolor(makeBugHybrid(), { '#5f8a3a': '#7a6a3a' }), () => makeCivilian('#3f7d7a', '#5a4030', '#e0b892', '#c9a43a'), () => recolor(makeSpearman(), { '#7fae63': '#5d7f99' })];
    const rigs = ['spearman', 'civ', 'bughybrid', 'civ', 'spearman'];
    for (let i = 0; i < 8; i++) { const w = buildChar(() => npcDisarm(walkers[i % 5]()), rigs[i % 5]); blob(w, 0.45); levelGroup.add(w); MOVERS.push([w, 0.45]); const st = {}, r0 = 8 + (i % 3) * 3.5, sp = (i % 2 ? 1 : -1) * (0.12 + (i % 4) * 0.03), ph = i * 0.8;
      levelAnims.push(t => { const a = ph + t * sp; w.position.set(Math.cos(a) * r0 * 1.3, 0, Math.sin(a) * r0); w.rotation.y = Math.atan2(-Math.sin(a) * r0 * 1.3 * sp, Math.cos(a) * r0 * sp); animRig(w, st, 1 / 60, t); }); }
    const lamp = new THREE.PointLight(0xcfe6ff, 0.8, 50, 1.5); lamp.position.set(0, 7, 0); levelGroup.add(lamp);
  }
};
// missions on the Zeltac board (repeatable)
defQuest('z1', { ch: 'Zeltac · Missions', title: 'New in Town', giver: 'rell', turnIn: 'rell', req: [],
  intro: ["A new pilot! Welcome to the Zeltac Ship. Twenty floors, a hundred species, one rule: pay your docking fees.", "Kidding. Mostly. Drome's raiders still hunt the lanes between worlds. Shoot down three and the first round is on me."],
  obj: [{ kind: 'kill', t: 'raider', n: 3, text: 'Shoot down Drome raiders in space', planet: 'space' }],
  outro: ["Three raiders! You're a natural. The board's yours from now on: bounties, ore runs, crystal contracts. They pay every time."], reward: { cr: 600, xp: 900, items: { ore: 6 } } });
defQuest('z2', { ch: 'Zeltac · Missions', title: 'Star Charts', giver: 'rell', turnIn: 'rell', req: ['z1'],
  intro: ["Our charts are a joke. Out past the lanes there are worlds nobody's mapped: a moon by Earth, an ocean world, violet Zarlich, and Vector, the dark one.", "Fly close and scan three of them. The names float over every world, you can't miss them."],
  obj: [{ kind: 'kill', t: 'scan', n: 3, text: 'Scan 3 uncharted worlds', planet: 'space' }],
  outro: ["Beautiful readings. The Ocean World especially... there's a city under that water.", "The cartographers will want more. So will I."], reward: { cr: 1500, xp: 2500, items: { starcrystal: 2 } } });
defQuest('zb1', { ch: 'Zeltac · Bounty', title: 'Raider Bounty', giver: 'rell', turnIn: 'rell', req: ['z1'], repeat: true,
  intro: ["Fresh bounty. Six raider kills, standard rate."], obj: [{ kind: 'kill', t: 'raider', n: 6, text: 'Shoot down 6 Drome raiders', planet: 'space' }],
  outro: ["Bounty paid. Come back any time, there's always more."], reward: { cr: 900, xp: 1400 } });
defQuest('zb2', { ch: 'Zeltac · Contract', title: 'Ore Run', giver: 'rell', turnIn: 'rell', req: ['z1'], repeat: true,
  intro: ["The foundries need ore. Break asteroids in the belt and bring me twelve."], obj: [{ kind: 'item', t: 'ore', n: 12, text: 'Mine 12 Space Ore from asteroids', planet: 'space' }],
  outro: ["Good ore. The foundries thank you."], reward: { cr: 700, xp: 900, take: { ore: 12 } } });
defQuest('zb3', { ch: 'Zeltac · Contract', title: 'Crystal Contract', giver: 'rell', turnIn: 'rell', req: ['z1'], repeat: true,
  intro: ["A collector wants Star Crystals. The pale golden asteroids carry them."], obj: [{ kind: 'item', t: 'starcrystal', n: 3, text: 'Mine 3 Star Crystals', planet: 'space' }],
  outro: ["Gorgeous. The collector pays well."], reward: { cr: 1300, xp: 1600, take: { starcrystal: 3 } } });
defQuest('zb4', { ch: 'Zeltac · Bounty', title: 'Nav Chips', giver: 'brakka', turnIn: 'brakka', req: ['z1'], repeat: true,
  intro: ["Raider nav chips. I take them apart, I learn their tricks. Four of them."], obj: [{ kind: 'item', t: 'raiderchip', n: 4, text: 'Collect Raider Nav Chips', planet: 'space' }],
  outro: ["Hah! These will teach me plenty."], reward: { cr: 800, xp: 1100, take: { raiderchip: 4 }, items: { ore: 8 } } });
function openShipSystems(who) {
  openDlg(who || 'Engineering', 'Ship systems');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = `Upgrade the Setting Sun for space. ${S.cr} cr · ${S.inv.ore || 0} ore · ${S.inv.starcrystal || 0} star crystals.`;
    for (const k in SHIP_SYS) { const sys = SHIP_SYS[k], l = sysLv(k), nx = sys.lv[l + 1], r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = ['#9aa1aa', '#6fdc5a', '#4fa8ff', '#c86aff', '#ffd36a'][l] || '#ffd36a';
      const cur = sys.lv[l], nm = document.createElement('span'); nm.textContent = `${sys.name} ${'★'.repeat(l)} · ${cur.dmg ? cur.dmg + ' dmg' : cur.hp ? cur.hp + ' hull' : cur.grip ? sys.lbl[l] : cur.sp + ' speed'}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = nx ? costLabel(nx.cost) : 'Maxed';
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Upgrade'; b.disabled = !nx || !costOk(nx.cost);
      b.addEventListener('click', () => { costPay(nx.cost); S.ship.sys = S.ship.sys || {}; S.ship.sys[k] = l + 1; SFX.level(); log(`${sys.name} upgraded`, 'loot'); markDirty(); render(); });
      r.append(dot, nm, mt, b); rows.appendChild(r); } };
  $('dlgActs').before(rows); acts([['Done', closeDlg]]); render();
}
