// =================== PETS AND THE SPEED BIKE ===================
function makeCrab() {
  const g = new THREE.Group(), sh = '#c8402f', dk = '#8a2a1e';
  E(g, sh, 0, 0.3, 0, 0.32, 0.16, 0.26); for (const s of [-1, 1]) { E(g, C.eye, 0.08 * s, 0.5, 0.16, 0.03, 0.05, 0.03); seg(g, [0.08 * s, 0.38, 0.14], [0.08 * s, 0.48, 0.16], 0.012, dk, 0.01);
    chain(g, [[0.28 * s, 0.32, 0.12], [0.42 * s, 0.38, 0.3], [0.38 * s, 0.4, 0.42]], 0.035, sh, 0.025); E(g, sh, 0.38 * s, 0.42, 0.46, 0.08, 0.06, 0.1);
    for (let k = 0; k < 3; k++) chain(g, [[0.26 * s, 0.26, -0.1 + k * 0.1], [0.42 * s, 0.22, -0.12 + k * 0.1], [0.48 * s, 0.02, -0.14 + k * 0.1]], 0.02, dk, 0.012); }
  return g;
}
function makeManta() {
  const g = new THREE.Group();
  const b = new THREE.Group();
  b.position.y = 1.6;
  g.add(b);

  // Original palette with high-tech space accents
  const hullBlue = '#3a5ea8';
  const hullDk = '#243b6e';
  const bellyWhite = '#e8e4dc';
  const tailCol = '#2a3a7a';
  const cyanPlasma = glow('#4fffe0');

  // 1. Chiseled Aerodynamic Space Hull & Reactor Core
  E(b, hullBlue, 0, 0, 0, 0.6, 0.08, 0.42);
  E(b, bellyWhite, 0, -0.04, 0.04, 0.42, 0.04, 0.32);

  // Dorsal reactor spine / energy conduits
  for (let k = 0; k < 3; k++) {
    const zPos = 0.14 - k * 0.12;
    part(b, B(0.18 - k * 0.03, 0.02, 0.07), hullDk, 0, 0.065, zPos);
    part(b, B(0.08 - k * 0.02, 0.015, 0.035), cyanPlasma, 0, 0.075, zPos);
  }

  // Ventral retro-thruster exhaust slots
  for (let k = 0; k < 2; k++) {
    part(b, B(0.24, 0.01, 0.03), cyanPlasma, 0, -0.065, 0.08 - k * 0.14);
  }

  // 2. Cephalic Sensor Fins & Optical Clusters
  for (const s of [-1, 1]) {
    // Sensor eye optics
    E(b, cyanPlasma, 0.12 * s, 0.05, 0.32, 0.03, 0.03, 0.02);

    // Forward swept sensor horn / ram-scoop
    part(b, Cy(0.024, 0.008, 0.22, 5), hullDk, 0.14 * s, -0.01, 0.38, Math.PI / 2.3, 0, 0.25 * s);
    part(b, new THREE.OctahedronGeometry(0.02, 0), cyanPlasma, 0.17 * s, -0.01, 0.46);
  }

  // 3. Multi-Segment Spacecraft Foil Wings (Inner Root + Outer Warp Wingtip)
  const wings = [];
  for (const s of [-1, 1]) {
    const w1 = new THREE.Group();
    w1.position.set(0.38 * s, 0, 0);
    b.add(w1);

    // Main wing plate
    E(w1, hullBlue, 0.18 * s, 0, 0, 0.26, 0.038, 0.30);
    E(w1, bellyWhite, 0.18 * s, -0.02, 0.02, 0.22, 0.024, 0.24);

    // Trailing edge ion trail emitter strip
    part(w1, B(0.24, 0.01, 0.03), cyanPlasma, 0.18 * s, 0, -0.16, 0, 0.15 * s, 0);

    // Outer tapered warp winglet
    const w2 = new THREE.Group();
    w2.position.set(0.32 * s, 0, -0.04);
    w1.add(w2);

    E(w2, hullDk, 0.16 * s, 0, -0.02, 0.20, 0.025, 0.20);
    part(w2, new THREE.ConeGeometry(0.018, 0.18, 4), cyanPlasma, 0.26 * s, 0, -0.04, Math.PI / 2, 0, 0.4 * s); // Glowing wingtip needle

    wings.push({ w1, w2, sign: s });
  }

  // 4. Kinetic Whip Tail & Rear Sub-Light Engine Pod
  const tailRoot = new THREE.Group();
  tailRoot.position.set(0, 0.01, -0.35);
  b.add(tailRoot);

  // Ion thruster bell at tail base
  part(tailRoot, Cy(0.06, 0.035, 0.14, 8), hullDk, 0, 0.01, 0.04, Math.PI / 2, 0, 0);
  part(tailRoot, new THREE.OctahedronGeometry(0.04, 0), cyanPlasma, 0, 0.01, -0.04);

  // Articulated tail spine
  chain(tailRoot, [
    [0, 0, 0],
    [0, 0.02, -0.45]
  ], 0.03, tailCol, 0.016);

  const tailTip = new THREE.Group();
  tailTip.position.set(0, 0.02, -0.45);
  tailRoot.add(tailTip);

  chain(tailTip, [
    [0, 0, 0],
    [0, 0.04, -0.35]
  ], 0.016, tailCol, 0.006);

  // Stabilizer fin + plasma node on tail tip
  part(tailTip, B(0.01, 0.08, 0.12), hullBlue, 0, 0.06, -0.18, 0.3, 0, 0);
  part(tailTip, new THREE.OctahedronGeometry(0.025, 0), cyanPlasma, 0, 0.04, -0.36);

  // 5. Zero-G Gliding & Wave-Flap Flight Animation
  g.userData.anim = (t) => {
    // Zero-g heaving hover with pitch/roll balance
    b.position.y = 1.6 + Math.sin(t * 1.5) * 0.14;
    b.rotation.x = Math.sin(t * 1.5 - 0.5) * 0.06;
    b.rotation.z = Math.cos(t * 0.9) * 0.04;

    // 2-Stage solar-sail wing wave with lagging outer wingtips
    const wave1 = Math.sin(t * 3.0);
    const wave2 = Math.sin(t * 3.0 - 0.7);

    for (const w of wings) {
      w.w1.rotation.z = wave1 * 0.32 * w.sign;
      w.w1.rotation.y = -Math.cos(t * 3.0) * 0.12 * w.sign; // Aerodynamic sweep
      w.w2.rotation.z = wave2 * 0.26 * w.sign;
    }

    // Trailing inertial tail inertia
    tailRoot.rotation.y = Math.sin(t * 2.0) * 0.16;
    tailRoot.rotation.x = -Math.sin(t * 1.5 - 0.6) * 0.10;
    tailTip.rotation.y = Math.sin(t * 2.0 - 0.6) * 0.25;
    tailTip.rotation.x = -Math.sin(t * 1.5 - 1.1) * 0.14;
  };

  g.userData.anim(0);
  return g;
}
const PETS = {
  swampfox: { name: 'Swamp Fox', make: () => recolor(makeDog(), { '#7a6a58': '#4f7a3c', '#4a3f35': '#2f4a26' }), rig: null, scale: 0.75, price: 800, dmg: 10 },
  fertlie: { name: 'Fert-lie (crab)', make: makeCrab, rig: null, scale: 0.9, price: 1200, dmg: 12 },
  robotron: { name: 'Robotron', make: () => recolor(makeXR17(), { '#9aa1aa': '#c9a43a' }), rig: 'xr17', scale: 0.55, price: 2500, dmg: 16, ranged: true },
  rockling: { name: 'Small Rock Monster', make: () => makeChunkMonster('#b39a78', '#8c7658', '#c4ab86', '#3d3530', false), rig: 'chunk', scale: 0.42, price: 3000, dmg: 20, grows: true },
  flys: { name: 'Flys (manta)', make: makeManta, rig: null, scale: 0.8, price: 5000, dmg: 18, fly: true, ranged: true },
  snorfal: { name: 'Snorfal', make: () => makeSnorfal(), rig: null, scale: 0.55, price: 0, dmg: 24, quest: 'm5' }
};
const petOwned = (id) => (S.pets || []).includes(id) || (PETS[id].quest && qDone(PETS[id].quest));
let petObj = null, petSt = {}, petCd = 0, petId = null;
function spawnPet() {
  if (petObj) { scene.remove(petObj); disposeTree(petObj); petObj = null; } petId = null;
  if (!S.pet || !PETS[S.pet] || !petOwned(S.pet) || !LEVEL || LEVEL.fly) return;
  const P = PETS[S.pet]; let sc = P.scale; if (P.grows) sc *= 1 + Math.min(1, ((S.petXp || 0) / 2000)) * 0.8;
  petObj = buildChar(P.make, P.rig); petObj.scale.setScalar(sc); blob(petObj, 0.35); petObj.position.copy(player.pos).add(V(1.2, 0, 1.2)); scene.add(petObj); petSt = {}; petId = S.pet;
}
function updatePet(dt, t) {
  if ((S.pet || null) !== petId) spawnPet(); if (!petObj) return;
  const P = PETS[petId], o = petObj.position, behind = V(Math.sin(player.yaw) * 1.6 + Math.cos(player.yaw) * 0.9, 0, Math.cos(player.yaw) * 1.6 - Math.sin(player.yaw) * 0.9), goal = player.pos.clone().add(behind);
  let target = null, td = 11; petCd -= dt;
  for (const e of enemies) { if (e.dead || !e.aggro) continue; const d = e.obj.position.distanceTo(player.pos); if (d < td) { td = d; target = e; } }
  if (target && !P.ranged) goal.copy(target.obj.position);
  const d = Math.hypot(goal.x - o.x, goal.z - o.z), sp = d > 12 ? 14 : 6.5;
  if (d > 30) o.copy(goal);
  else if (d > (target && !P.ranged ? 1.4 : 0.6)) { o.x += (goal.x - o.x) / d * Math.min(d, sp * dt); o.z += (goal.z - o.z) / d * Math.min(d, sp * dt); petObj.rotation.y = Math.atan2(goal.x - o.x, goal.z - o.z); }
  o.y = floorAt(o.x, o.z);
  if (target && petCd <= 0 && target.obj.position.distanceTo(o) < (P.ranged ? 12 : 2.2)) {
    petCd = 1.4; petSt.atk = 0.42; if (Math.random() < 0.5) SFX.yip(); const dmg = P.dmg * (1 + S.lvl * 0.12);
    if (P.ranged) tracer(o.clone().add(V(0, P.fly ? 1.6 : 0.8, 0)), target.obj.position.clone().add(V(0, target.def.hy * target.sc, 0)), '#ffd36a');
    target.hp -= dmg; target.hitT = 0.1; target.lastHit = gameTime; burst(target.obj.position.clone().add(V(0, target.def.hy, 0)), '#ffd36a', 4, 3);
    if (target.hp <= 0) { kill(target); S.petXp = (S.petXp || 0) + 50; if (P.grows && S.petXp % 500 < 50) { log(`${P.name} grew bigger!`, 'loot'); spawnPet(); } } else updatePlate(target);
  }
  if (petObj.userData.anim) petObj.userData.anim(t); animRig(petObj, petSt, dt, t);
}
function openPets(shopName) {
  openDlg(shopName ? 'Pet shop' : 'Companions', shopName || 'Your pets');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = `Pets follow you and fight beside you. ${S.cr} cr.`;
    for (const id in PETS) { const P = PETS[id], own = petOwned(id), on = S.pet === id, r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = own ? '#6fdc5a' : '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = `${P.name}${P.ranged ? ' · shoots' : ' · bites'}${P.grows ? ' · grows' : ''}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = own ? (on ? 'With you' : 'Owned') : P.quest ? `Finish “${QDEFS[P.quest].title}”` : `${P.price} cr`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px';
      if (own) { b.textContent = on ? 'Send home' : 'Bring'; b.addEventListener('click', () => { S.pet = on ? null : id; markDirty(); SFX.ui(); render(); }); }
      else { b.textContent = 'Adopt'; b.disabled = !!P.quest || !shopName || S.cr < P.price; b.addEventListener('click', () => { S.cr -= P.price; S.pets = (S.pets || []).concat(id); S.pet = id; SFX.item(); log(`${P.name} joined you!`, 'loot'); markDirty(); render(); }); }
      r.append(dot, nm, mt, b); rows.appendChild(r); } };
  $('dlgActs').before(rows); acts([['Done', closeDlg]]); render();
  showPreviewIn(rows); const first = S.pet || Object.keys(PETS)[0]; setPreview(() => buildChar(PETS[first].make, null), PETS[first].name + ' · tap a pet to preview');
  rows.querySelectorAll('.rowi').forEach((r, i) => { const id = Object.keys(PETS)[i]; r.style.cursor = 'pointer'; const pv = () => setPreview(() => PETS[id].make(), PETS[id].name); r.addEventListener('pointerenter', pv); r.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') pv(); }); });
}
LEVELS.zeltac.npcs.push({ id: 'nox', name: 'Mama Nox', role: 'Pet shop', rig: 'bughybrid', make: () => recolor(makeBugHybrid(), { '#5f8a3a': '#c86aff', '#3e5e26': '#6a3a8a' }), x: 12, z: -6, face: -1.0, petshop: true,
  idle: ["Every pilot needs a friend. Most of mine bite.", "The rock ones grow if you feed them fights."] });
// ---------------- speed bike ----------------
const bikeOwned = () => shipUnlocked() && S.ship.rooms.includes('hangar');
const vmBike = new THREE.Group(); camera.add(vmBike); vmBike.visible = false;
{ part(vmBike, B(0.5, 0.06, 0.06), C.dark, 0, -0.32, -0.55); for (const s of [-1, 1]) part(vmBike, Cy(0.03, 0.03, 0.12, 6), '#3a3d44', 0.25 * s, -0.32, -0.55, 0, 0, Math.PI / 2);
  part(vmBike, B(0.36, 0.14, 0.6), '#8a3a2e', 0, -0.48, -0.75); part(vmBike, B(0.2, 0.08, 0.04), glow('#4fd2ff'), 0, -0.36, -0.62, -0.6); vmBike.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); }
function toggleBike() {
  if (state !== 'play' || dlgOpen || LEVEL.fly) return;
  if (!bikeOwned()) { log('Build the Hangar on your ship to unlock the speed bike.'); return; }
  if (!LEVEL.terrain && !S.riding) { log('No room to ride in here.'); return; }
  S.riding = !S.riding; SFX.ui(); log(S.riding ? 'Riding the speed bike (X to hop off, no shooting while riding).' : 'You hop off the bike.');
  if (S.riding && typeof burp === 'function') burp('veh');
}
function updateBike() { if (S.riding && (!LEVEL.terrain || LEVEL.fly)) S.riding = false; vmBike.visible = !!S.riding && !LEVEL.fly; if (S.riding) vm.visible = false; }
