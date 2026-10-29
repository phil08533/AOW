// =================== VEHICLES: battle car, tank, battle mech (from the notebook's vehicle pages) ===================
// Drive them on any open planet: V deploys / parks. FIRE shoots the vehicle's gun. They have their own armor.
function makeBattleCar(col) {
  const g = new THREE.Group(), dk = '#2b2a2c', c = col || '#8a3a2e';
  part(g, B(1.7, 0.45, 3.2), c, 0, 0.6, 0); part(g, B(1.4, 0.4, 1.3), c, 0, 1.02, -0.3); part(g, B(1.3, 0.3, 0.05), glow('#4fd2ff'), 0, 1.05, 0.36, -0.4);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = part(g, Cy(0.42, 0.42, 0.4, 10), dk, 0.95 * sx, 0.42, 1.05 * sz, 0, 0, Math.PI / 2); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.06, 0.22, 4), '#cfd3d8', 1.18 * sx, 0.42 + Math.cos(a) * 0.36, 1.05 * sz + Math.sin(a) * 0.36, 0, 0, -Math.PI / 2 * sx); } }
  for (let k = 0; k < 5; k++) part(g, new THREE.ConeGeometry(0.07, 0.4, 4), '#cfd3d8', -0.6 + k * 0.3, 0.6, 1.75, Math.PI / 2); // ram spikes
  for (const s of [-1, 1]) { part(g, B(0.16, 0.16, 0.8), '#3a3d44', 0.45 * s, 1.32, 0.2); part(g, Cy(0.04, 0.04, 0.5, 6), dk, 0.45 * s, 1.32, 0.8, Math.PI / 2); }
  part(g, B(1.5, 0.08, 0.4), dk, 0, 1.25, -1.5); for (const s of [-1, 1]) part(g, B(0.08, 0.4, 0.08), dk, 0.6 * s, 1.05, -1.5);
  for (const s of [-1, 1]) part(g, Cy(0.1, 0.12, 0.3, 8), '#5d636c', 0.5 * s, 0.7, -1.7, Math.PI / 2);
  return g;
}
function makeTankModel(col) {
  const g = new THREE.Group(), dk = '#2b2a2c', c = col || '#5a6a3a';
  for (const s of [-1, 1]) { part(g, B(0.7, 0.8, 4.2), dk, 1.25 * s, 0.4, 0); for (let k = 0; k < 6; k++) part(g, Cy(0.32, 0.32, 0.72, 10), '#3a3d44', 1.25 * s, 0.38, -1.7 + k * 0.68, 0, 0, Math.PI / 2); part(g, B(0.8, 0.12, 4.3), c, 1.25 * s, 0.86, 0); }
  part(g, B(1.9, 0.7, 3.8), c, 0, 0.95, 0); part(g, B(1.7, 0.2, 1.2), c, 0, 1.2, 1.7, -0.35);
  const tur = new THREE.Group(); tur.position.set(0, 1.5, -0.2); g.add(tur);
  part(tur, Cy(0.95, 1.1, 0.6, 8), c, 0, 0, 0); part(tur, Cy(0.13, 0.15, 2.8, 8), '#3a3d44', 0, 0.05, 1.9, Math.PI / 2); part(tur, Cy(0.2, 0.2, 0.4, 8), dk, 0, 0.05, 3.2, Math.PI / 2);
  part(tur, Cy(0.35, 0.35, 0.18, 8), '#3a3d44', 0.3, 0.38, -0.2); part(tur, B(0.5, 0.3, 0.06), glow('#ff8a2a'), 0, 0.12, 0.92);
  part(tur, Cy(0.02, 0.02, 1.4, 4), dk, -0.6, 0.9, -0.5); part(tur, B(0.3, 0.2, 0.02), toon('#b3262c', 'cloth'), -0.45, 1.5, -0.5);
  // detail pass (2.23.72): skirts with bolts, track links, exhausts, tools, mantlet, muzzle brake, hatch, cupola MG, smoke launchers, lights
  const st = '#3a3d44', bolt = '#22242a';
  for (const s of [-1, 1]) { part(g, B(0.08, 0.42, 3.9), c, 1.62 * s, 0.62, 0); for (let k = 0; k < 7; k++) part(g, Cy(0.045, 0.045, 0.03, 6), bolt, 1.67 * s, 0.78, -1.7 + k * 0.57, 0, 0, Math.PI / 2);
    for (let k = 0; k < 14; k++) part(g, B(0.72, 0.06, 0.16), bolt, 1.25 * s, 0.82, -2.05 + k * 0.315); part(g, B(0.72, 0.06, 4.1), bolt, 1.25 * s, 0.03, 0);
    part(g, Cy(0.11, 0.13, 0.32, 8), '#26282c', 0.6 * s, 1.2, -1.95, Math.PI / 2); part(g, B(0.42, 0.06, 0.5), '#1a1b1e', 0.6 * s, 1.31, -1.55);
    part(g, Cy(0.09, 0.09, 0.06, 8), glow('#fff1c8'), 0.75 * s, 1.08, 1.92, Math.PI / 2); part(g, B(0.22, 0.2, 0.08), st, 0.75 * s, 1.08, 1.86);
    part(g, B(0.14, 0.1, 0.22), bolt, 0.55 * s, 0.7, 1.95); }
  for (let k = 0; k < 4; k++) part(g, B(1.8, 0.03, 0.04), bolt, 0, 1.31, -1.1 + k * 0.9);
  part(g, Cy(0.05, 0.05, 1.6, 6), '#6a5a40', -0.5, 1.33, 0.2, Math.PI / 2); part(g, B(0.28, 0.06, 0.4), '#8a8e94', -0.5, 1.33, 1.05); // shovel
  part(g, B(1.2, 0.3, 0.5), '#4a4038', 0, 1.42, -1.75); for (let k = 0; k < 3; k++) part(g, B(0.38, 0.16, 0.08), bolt, -0.42 + k * 0.42, 1.2, -1.97); // stowage box, spare links
  part(tur, B(1.1, 0.5, 0.35), c, 0, 0.05, 0.98); 
  part(tur, Cy(0.17, 0.17, 0.7, 8), st, 0, 0.05, 1.6, Math.PI / 2); part(tur, B(0.36, 0.28, 0.28), st, 0, 0.05, 3.45); for (const s of [-1, 1]) part(tur, B(0.04, 0.2, 0.18), bolt, 0.19 * s, 0.05, 3.45);
  part(tur, B(0.6, 0.06, 0.6), st, -0.35, 0.33, -0.25); part(tur, Cy(0.28, 0.28, 0.06, 10), c, -0.35, 0.37, -0.25);
  part(tur, Cy(0.03, 0.03, 0.8, 6), '#1a1b1e', 0.3, 0.62, 0.15, Math.PI / 2); part(tur, B(0.1, 0.14, 0.3), '#1a1b1e', 0.3, 0.6, -0.25);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) part(tur, Cy(0.05, 0.05, 0.22, 6), '#1a1b1e', 0.82 * s, 0.12 + k * 0.1, 0.45, 0.6, 0, -0.4 * s);
  for (const s of [-1, 1]) part(tur, B(0.04, 0.2, 0.08), '#1a1b1e', 0.5 * s, 0.34, 0.6);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; part(tur, Cy(0.035, 0.035, 0.03, 6), bolt, Math.cos(a) * 0.98, 0.31, Math.sin(a) * 0.98); }
  g.userData.turret = tur;
  return g;
}
function makeMechModel(col) {
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // Palettes (Heavy Assault Mech)
  const c = col || '#5d636c';
  const chassisDk = '#25262a';
  const jointDk = '#1a1b1e';
  const armorSteel = '#3a3d44';
  const visorGlow = glow('#4fd2ff');
  const missileGlow = glow('#ff8a2a');
  const cannonSteel = '#141518';

  // 1. Articulated Legs & Hydraulic Foot Pads (Grounded at y = 0.0)
  // Leg group origin set at hip height (y = 1.91)
  const legs = [];
  for (const s of [-1, 1]) {
    const L = new THREE.Group();
    L.position.set(0.58 * s, 1.91, 0);
    root.add(L);
    legs.push(L);

    // Upper thigh armor (y: -0.05 to -0.95 relative to hip)
    part(L, B(0.44, 0.90, 0.48), c, 0, -0.50, 0);
    part(L, B(0.46, 0.40, 0.10), armorSteel, 0, -0.45, 0.25); // Front thigh plate

    // Knee actuator hub (y: -0.95 to -1.15)
    part(L, Cy(0.19, 0.19, 0.48, 8), jointDk, 0, -1.02, 0, 0, 0, Math.PI / 2);
    part(L, B(0.24, 0.16, 0.08), chassisDk, 0, -1.02, 0.24); // Knee cap armor

    // Lower shin & reinforced greave (y: -1.15 to -1.75)
    part(L, B(0.38, 0.65, 0.42), c, 0, -1.45, 0.04);
    part(L, Cy(0.04, 0.04, 0.55, 6), armorSteel, -0.12 * s, -1.45, -0.16); // Rear hydraulic strut

    // Ankle joint hub (y: -1.78)
    part(L, Cy(0.12, 0.12, 0.36, 6), jointDk, 0, -1.78, 0.08, 0, 0, Math.PI / 2);

    // Grounded tread boot (y: -1.82 to -1.91 -> absolute y = 0.0 to 0.09)
    part(L, B(0.58, 0.11, 0.92), chassisDk, 0, -1.855, 0.15);
    part(L, B(0.60, 0.035, 0.94), jointDk, 0, -1.892, 0.15); // Sole rubber grip pad
  }

  // 2. Pelvis & Heavy Torso Chassis
  part(root, B(0.82, 0.32, 0.60), jointDk, 0, 1.95, 0); // Pelvic girdle
  part(root, Cy(0.26, 0.26, 0.18, 8), chassisDk, 0, 2.12, 0); // Torso pivot ring

  const torso = new THREE.Group();
  torso.position.set(0, 2.65, 0);
  root.add(torso);

  // Main chassis hull (depth 1.40 -> front at z = +0.70)
  part(torso, B(1.68, 1.18, 1.38), c, 0, 0, 0);

  // Rear reactor/radiator hump (stepped backward to z = -0.92)
  part(torso, B(1.10, 0.55, 0.88), armorSteel, 0, -0.05, -0.92);
  part(torso, B(0.85, 0.12, 0.70), chassisDk, 0, 0.28, -0.92); // Radiator top cowl

  // Sloped command visor (stepped forward: base frame at z = 0.71, lens at z = 0.73)
  part(torso, B(1.28, 0.42, 0.06), jointDk, 0, 0.25, 0.71);
  part(torso, B(1.18, 0.32, 0.05), visorGlow, 0, 0.25, 0.74);
  part(torso, B(1.22, 0.03, 0.06), armorSteel, 0, 0.35, 0.76); // Top visor visor-brow slat

  // 3. Shoulder Missile Pods & Arm-Mounted Heavy Cannons
  for (const s of [-1, 1]) {
    // Shoulder missile pod (offset in X and Z so it doesn't touch the torso box)
    const pod = new THREE.Group();
    pod.position.set(1.22 * s, 0.52, 0.05);
    torso.add(pod);

    part(pod, B(0.68, 0.68, 0.88), armorSteel, 0, 0, 0);
    part(pod, B(0.72, 0.08, 0.90), chassisDk, 0, -0.32, 0); // Under-pod mount bracket

    // 2x2 Missile warhead array (stepped forward at z = 0.46)
    for (let r = 0; r < 2; r++) {
      for (let k = 0; k < 2; k++) {
        const mx = (-0.14 + k * 0.28) * s;
        const my = -0.13 + r * 0.26;
        part(pod, Cy(0.09, 0.09, 0.04, 8), jointDk, mx, my, 0.44, Math.PI / 2);
        part(pod, Cy(0.065, 0.065, 0.06, 8), missileGlow, mx, my, 0.47, Math.PI / 2);
      }
    }

    // Arm weapon assembly: underslung autocannon
    const arm = new THREE.Group();
    arm.position.set(1.02 * s, -0.42, 0.35);
    torso.add(arm);

    // Weapon mount receiver
    part(arm, B(0.34, 0.34, 1.25), c, 0, 0, 0);
    part(arm, B(0.38, 0.16, 0.60), chassisDk, 0, 0.12, -0.15); // Ammo feed hopper

    // Gun barrel & muzzle shroud (stepped cleanly along +Z)
    part(arm, Cy(0.075, 0.075, 0.65, 6), cannonSteel, 0, 0, 0.95, Math.PI / 2);
    part(arm, Cy(0.10, 0.10, 0.12, 8), armorSteel, 0, 0, 1.25, Math.PI / 2); // Muzzle brake
  }

  // 4. Stomping Walk Cycle & Heavy Recoil Animation Loop
  g.userData.anim = (t) => {
    // Heavy chassis step bounce
    root.position.y = Math.abs(Math.sin(t * 3.0)) * 0.035;

    // Torso counter-twist
    torso.rotation.y = Math.sin(t * 3.0) * 0.06;
    torso.rotation.z = Math.cos(t * 3.0) * 0.02;

    // Alternating leg striding
    legs.forEach((L, i) => {
      const phase = i * Math.PI;
      L.rotation.x = Math.sin(t * 3.0 + phase) * 0.25;
    });
  };

  g.userData.anim(0);
  return g;
}
const VEH = {
  battlecar: { name: 'Battle Car', price: 6000, lvl: 10, top: 32, acc: 20, hp: 900, eye: 1.5, gun: { name: 'Twin MGs', dmg: 55, rate: 0.09, range: 70, col: '#ffd36a' }, ram: true, make: makeBattleCar, desc: 'Fast, spiked wheels, ram damage, twin machine guns.' },
  tank: { name: 'Battle Tank', price: 15000, lvl: 18, top: 7, acc: 2.5, tracked: true, turn: 0.61, trs: 0.7, hp: 3200, eye: 2.4, gun: { name: 'Main cannon', dmg: 950, rate: 1.3, range: 95, splash: 6, col: '#ff8a2a' }, make: makeTankModel, desc: 'Heavy and slow. Pivot steers, the turret follows your aim, and the cannon has a big blast.' },
  mech: { name: 'Battle Mech', price: 26000, lvl: 26, top: 8.5, hp: 4600, eye: 3.2, walk: true, gun: { name: 'Missile pods', dmg: 380, rate: 1.1, range: 85, splash: 4.5, salvo: 4, col: '#ff6a1a' }, make: makeMechModel, desc: 'Walks, strafes and jump-jets. Fires 4-missile salvos.' }
};
let VH = { on: false };
const vehS = () => { S.veh = S.veh || { owned: [], sel: null, res: { arm: 0, wpn: 0, eng: 0 } }; S.veh.res = S.veh.res || { arm: 0, wpn: 0, eng: 0 }; return S.veh; };
const vehMaxHp = id => Math.round(VEH[id].hp * (1 + vehS().res.arm * 0.25));
const vehDmg = id => VEH[id].gun.dmg * (1 + vehS().res.wpn * 0.25) * (1 + S.lvl * 0.02);
const vehTop = id => VEH[id].top * (1 + vehS().res.eng * 0.12) * (1 + 0.04 * Math.max(0, roomLvl('hangar') - 1));
// cockpit view models
const vmVeh = {}; for (const id in VEH) { const g = new THREE.Group(); camera.add(g); g.visible = false; vmVeh[id] = g; }
{ const g = vmVeh.battlecar; part(g, B(1.6, 0.1, 1.0), '#8a3a2e', 0, -0.75, -1.3); for (const s of [-1, 1]) { part(g, B(0.1, 0.1, 0.7), '#3a3d44', 0.55 * s, -0.55, -1.0); part(g, Cy(0.025, 0.025, 0.4, 6), '#2b2a2c', 0.55 * s, -0.55, -1.5, Math.PI / 2); }
  for (let k = 0; k < 5; k++) part(g, new THREE.ConeGeometry(0.03, 0.18, 4), '#cfd3d8', -0.5 + k * 0.25, -0.72, -1.85, -Math.PI / 2);
  g.userData.muz = [V(0.55, -0.55, -1.72), V(-0.55, -0.55, -1.72)]; }
{ const g = vmVeh.tank; part(g, Cy(0.09, 0.11, 2.2, 8), '#3a3d44', 0, -0.55, -1.6, Math.PI / 2); part(g, Cy(0.14, 0.14, 0.3, 8), '#2b2a2c', 0, -0.55, -2.7, Math.PI / 2);
  part(g, new THREE.TorusGeometry(0.9, 0.08, 4, 16, Math.PI), '#5a6a3a', 0, -0.95, -0.6, -Math.PI / 2.4); part(g, B(2.4, 0.2, 1.4), '#5a6a3a', 0, -1.15, -1.0);
  g.userData.muz = [V(0, -0.55, -2.85)]; }
{ const g = vmVeh.mech; for (const s of [-1, 1]) { part(g, B(0.08, 1.4, 0.08), '#3a3d44', 0.95 * s, 0, -0.9); part(g, B(0.4, 0.3, 0.6), '#5d636c', 0.75 * s, -0.6, -1.1); for (let k = 0; k < 2; k++) part(g, Cy(0.05, 0.05, 0.04, 8), glow('#ff8a2a'), (0.68 + k * 0.14) * s, -0.55, -1.42, Math.PI / 2); }
  part(g, B(2.0, 0.08, 0.08), '#3a3d44', 0, 0.62, -0.9); part(g, B(2.0, 0.1, 0.4), '#3a3d44', 0, -0.88, -1.0); part(g, B(0.5, 0.04, 0.02), glow('#4fd2ff'), 0, -0.8, -0.8);
  g.userData.muz = [V(0.68, -0.55, -1.45), V(-0.68, -0.55, -1.45), V(0.82, -0.55, -1.45), V(-0.82, -0.55, -1.45)]; }
function vehOK() { return LEVEL && LEVEL.terrain && !LEVEL.fly && !['ship', 'zeltac', 'speedway', 'arena'].includes(LEVEL.id) && !S.inSub; }
function toggleVehicle() {
  if (state !== 'play' || dlgOpen) return;
  if (VH.on) return vehPark();
  const V0 = vehS(); if (!V0.owned.length) { log('You have no war vehicles yet. Fort Ironrock (the asteroid army base) sells them.'); return; }
  if (!vehOK()) { log("No room for a war vehicle here. Try an open planet."); return; }
  const id = V0.sel && V0.owned.includes(V0.sel) ? V0.sel : V0.owned[0];
  const w = (V0.wreck || {})[id]; if (w && Date.now() - w < 45000) { log(`${VEH[id].name} is still being repaired (${Math.ceil(45 - (Date.now() - w) / 1000)}s).`); return; }
  if (RC.on) return; if (S.riding) S.riding = false;
  VH = { on: true, id, v: 0, vy: 0, hp: vehMaxHp(id), cd: 0, fuel: 2 };
  if (VEH[id].tracked) tankMount();
  SFX.door(); SFX.horn && SFX.horn(); toast(VEH[id].name.toUpperCase(), `${VEH[id].gun.name} · V to park`, 2.2);
  log(`${VEH[id].name}: ${VEH[id].walk ? 'WASD walks, Space jump-jets' : VEH[id].tracked ? 'W/S drive, A/D turn the hull, the turret follows your aim (green ring = on target)' : 'W/S drive, A/D steer'}, FIRE shoots, V parks.`, 'loot');
  if (typeof burp === 'function') burp('veh');
}
function vehPark(force) {
  if (!VH.on) return; if (!force && Math.abs(VH.v) > 3 && !VEH[VH.id].walk) { if (!VH.parkReq) log('Braking to park…'); VH.parkReq = true; return; }
  VH.on = false; tankDrop(); for (const id in vmVeh) vmVeh[id].visible = false; SFX.door(); SFX.engine && SFX.engine(0, 0); if (!force) log('Parked.');
}
function vehWreck() {
  const id = VH.id; vehS().wreck = vehS().wreck || {}; vehS().wreck[id] = Date.now();
  burst(player.pos.clone().add(V(0, 1, 0)), '#ff6a1a', 30, 8); burst(player.pos.clone().add(V(0, 1, 0)), '#2b2a2c', 16, 5); SFX.boom();
  vehPark(true); toast('VEHICLE DESTROYED', `${VEH[id].name} needs 45s of repairs`, 3); player.vy = 6; markDirty();
}
function vehStep(dt, mx, mz) {
  const D = VEH[VH.id], top = vehTop(VH.id) * ((keys.ShiftLeft || keys.ShiftRight) ? 1.25 : 1);
  for (const id in vmVeh) vmVeh[id].visible = id === VH.id && !D.tracked;
  const g0 = floorAt(player.pos.x, player.pos.z), air = player.pos.y > g0 + 0.15;
  if (VH.parkReq) { VH.v *= Math.max(0, 1 - dt * 4); if (Math.abs(VH.v) < 2) { VH.parkReq = false; VH.v = 0; return vehPark(); } }
  if (D.walk) {
    const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), r = V(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    player.pos.addScaledVector(f, mz * top * dt).addScaledVector(r, mx * top * 0.7 * dt); VH.v = Math.hypot(mx, mz) * top;
    if ((keys.Space || jetHeld) && VH.fuel > 0) { VH.vy = Math.min(VH.vy + 30 * dt, 7); VH.fuel -= dt; if (Math.random() < 0.5) burst(player.pos.clone(), '#ff9a3c', 2, 2); } else if (!air) VH.fuel = Math.min(2, VH.fuel + dt * 0.6);
    VH.step = (VH.step || 0) + dt * VH.v * 0.35; if (!air && VH.v > 1 && Math.floor(VH.step) !== Math.floor(VH.step - dt * VH.v * 0.35)) { SFX.land(); }
  } else if (D.tracked) { tankDrive(dt, D, top, air);
  } else {
    const dz = v => Math.max(0, (v - 0.15) / 0.85), th = (keys.KeyW ? 1 : 0) + dz(move.y), br = (keys.KeyS ? 1 : 0) + dz(-move.y), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x;
    if (!air && !VH.parkReq) { const v0 = VH.v; VH.v += (th * D.acc - br * 24) * dt; if (!th && !br) VH.v = Math.sign(v0) * Math.max(0, Math.abs(v0) - 5 * dt); else if (br && !th && v0 > 0 && VH.v < 0) VH.v = 0; VH.v = clamp(VH.v, -6, top); } // coasting rolls to a stop instead of creeping into reverse; brake stops first, S brakes, then backs up
    player.yaw -= st * dt * (air ? 0.5 : 1.2 + Math.min(1, Math.abs(VH.v) / 20) * 0.5);
    const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)); player.pos.addScaledVector(f, VH.v * dt);
    SFX.engine && SFX.engine(0.25 + Math.abs(VH.v) / top * 0.6, Math.abs(VH.v) / 30);
  }
  const before = player.pos.clone(); collide(player.pos, D.walk ? 1.0 : 1.3, false); if (!D.walk && before.distanceTo(player.pos) > 0.05 && Math.abs(VH.v) > 6) { VH.v *= 0.5; SFX.hit(); }
  const g1 = floorAt(player.pos.x, player.pos.z);
  VH.vy -= 20 * (LEVEL.gravity || 1) * dt; player.pos.y += VH.vy * dt;
  if (player.pos.y <= g1) { if (air && VH.vy < -9) { SFX.land(); burst(player.pos.clone(), '#a08a70', 10, 4); } player.pos.y = g1; VH.vy = D.walk ? 0 : Math.max(0, (g1 - g0) / Math.max(dt, 1e-3)) * 0.6; }
  player.onGround = player.pos.y <= g1 + 0.05; player.vy = 0;
  // ramming with the battle car
  if (D.ram && Math.abs(VH.v) > 10) for (const e of enemies) { if (e.dead) continue; const d = e.obj.position.distanceTo(player.pos); if (d < 2.2 + e.def.r * e.sc && (!e.ramT || gameTime - e.ramT > 0.6)) { e.ramT = gameTime; vehHit(e, Math.abs(VH.v) * 22); VH.v *= 0.7; burst(e.obj.position.clone().add(V(0, 1, 0)), '#cfd3d8', 10, 5); SFX.hit(); } }
  VH.cd -= dt; if (firing && VH.cd <= 0 && !inSafe(player.pos)) vehFire();
  if (D.tracked) tankPose(dt);
  const hpk = VH.hp / vehMaxHp(VH.id);
  $('zoneN').textContent = D.name.toUpperCase(); $('zoneL').textContent = `Armor ${Math.round(hpk * 100)}% · ${Math.round(Math.abs(VH.v) * 3.6)} km/h${D.walk ? ` · jets ${Math.round(VH.fuel / 2 * 100)}%` : ''} · V to park`; $('zone').style.opacity = 1; zoneT = 1;
}
function vehHit(e, dmg) { e.hp -= dmg; e.hitT = 0.12; e.aggro = true; e.lastHit = gameTime; if (e.anim) e.anim.hit = 0.14; if (e.hp <= 0) kill(e); else updatePlate(e); }
function vehFire() {
  const D = VEH[VH.id], G = D.gun; VH.cd = G.rate; const o = camera.getWorldPosition(V(0, 0, 0)), d0 = V(0, 0, 0); camera.getWorldDirection(d0);
  if (D.tracked && VH.body) { tankAimRay(o, d0); tankRecoil(); }
  const muz = vmVeh[VH.id].userData.muz, shots = G.salvo || 1; let any = false;
  for (let n = 0; n < shots; n++) {
    const d = d0.clone(); if (shots > 1 || !G.splash) d.add(V((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03)).normalize();
    let ht = rayClear(o, d, G.range), hit = null;
    for (const e of enemies) { if (e.dead) continue; const bp = e.obj.position; if (bp.distanceToSquared(o) > G.range * G.range) continue; for (const f of [0.55, 1.15, 1.75]) { const t = raySphere(o, d, V(bp.x, bp.y + e.def.hy * e.sc * f, bp.z), e.def.r * 1.4 * e.sc); if (t > 0 && t < ht) { ht = t; hit = e; } } }
    if (G.splash && !hit) for (let t = 1; t < ht; t += 0.6) { const q = o.clone().addScaledVector(d, t); if (q.y < groundH(q.x, q.z)) { ht = t; break; } }
    const end = o.clone().addScaledVector(d, ht), from = D.tracked && VH.body ? o.clone() : vmVeh[VH.id].localToWorld(muz[n % muz.length].clone());
    tracer(from, end, G.col);
    if (G.splash) { burst(end, G.col, 18, 7); burst(end, '#ffd36a', 8, 4);
      for (const e of enemies) { if (e.dead) continue; const dd = e.obj.position.distanceTo(end); if (dd < G.splash + e.def.r * e.sc) { vehHit(e, vehDmg(VH.id) * (1 - 0.5 * dd / (G.splash + 1))); any = true; } }
    } else if (hit) { burst(end, '#ffd36a', 5, 3); vehHit(hit, vehDmg(VH.id)); any = true; }
  }
  G.splash ? SFX.boom() : SFX.laser(); if (any) { hitmark(false); }
}
// armor absorbs hits while you're inside
{ const _h = hurt; hurt = function (dmg, src) { if (VH.on && player.alive && !dlgOpen && !inSafe(player.pos)) { VH.hp -= dmg * 0.8; player.lastHurt = gameTime; SFX.hit(); if (VH.hp <= 0) vehWreck(); return; } return _h(dmg, src); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { if (VH.on) vehPark(true); return _ll(id, o); }; }
document.addEventListener('keydown', e => { if (e.code === 'KeyV' && !e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) toggleVehicle(); });
function openVehicleBay(title) {
  const V0 = vehS(); openDlg(title || 'Vehicle bay', 'Your war vehicles');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = '';
    $('dlgLine').textContent = V0.owned.length ? `Pick a vehicle, then press V (or Menu → Vehicle) on an open planet to deploy it. Research: armor ${V0.res.arm}, weapons ${V0.res.wpn}, engines ${V0.res.eng}.` : 'No vehicles yet. Buy one from Quartermaster Brix at Fort Ironrock, the asteroid army base.';
    V0.owned.forEach(id => { const D = VEH[id], r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${D.name} · ${vehMaxHp(id)} armor · ${D.gun.name}`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = V0.sel === id ? '✓ Selected' : 'Select'; b.disabled = V0.sel === id; b.addEventListener('click', () => { V0.sel = id; markDirty(); SFX.ui(); render(); setPreview(() => D.make(), D.name); });
      r.style.cursor = 'pointer'; r.addEventListener('click', () => setPreview(() => D.make(), D.name)); r.append(nm, b); rows.appendChild(r); }); };
  $('dlgActs').before(rows); render();
  acts([['Deploy now', () => { closeDlg(); toggleVehicle(); }, true, !V0.owned.length], ['Done', closeDlg]]);
  if (V0.owned.length) { showPreviewIn(rows); setPreview(() => VEH[V0.sel || V0.owned[0]].make(), VEH[V0.sel || V0.owned[0]].name); }
}
function openVehicleShop(n) {
  const V0 = vehS(); openDlg('Army Shop', n.name);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = 'War vehicles, fresh off the line. Tap one to inspect it. Credits only, no refunds, no test drives. OK, one test drive.';
    Object.entries(VEH).forEach(([id, D]) => { const own = V0.owned.includes(id), r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${D.name} · ${D.desc}`; const mt = document.createElement('span'); mt.className = 'meta'; mt.textContent = own ? 'Owned' : S.lvl < D.lvl ? `Lv ${D.lvl}` : `${D.price} cr`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = own ? '✓' : 'Buy'; b.disabled = own || S.lvl < D.lvl || S.cr < D.price;
      b.addEventListener('click', () => { if (S.cr < D.price) return; S.cr -= D.price; V0.owned.push(id); V0.sel = id; SFX.coin(); log(`Bought the ${D.name}! Press V (or Menu → Vehicle) on any open planet to drive it.`, 'loot'); questProgressKill('buyveh_' + id); markDirty(); render(); });
      r.style.cursor = 'pointer'; r.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') setPreview(() => D.make(), D.name); }); r.append(nm, mt, b); rows.appendChild(r); }); };
  $('dlgActs').before(rows); render(); acts([['Repair all (free)', () => { V0.wreck = {}; log('All vehicles repaired.'); SFX.item(); markDirty(); }, true], ['Done', closeDlg]]);
  showPreviewIn(rows); setPreview(() => VEH.battlecar.make(), 'Battle Car');
}
const VRES = { arm: { name: 'Composite armor', desc: '+25% vehicle armor per level' }, wpn: { name: 'Weapons research', desc: '+25% vehicle damage per level' }, eng: { name: 'Engine tuning', desc: '+12% top speed per level' } };
function openResearch(n) {
  const V0 = vehS(); openDlg('Military Research', n.name);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const cost = lv => ({ cr: 2500 * (lv + 1) * (lv + 1), scrap: 10 * (lv + 1), ore: 5 * (lv + 1) });
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = 'Science! Mostly explosions, but measured ones. Upgrades apply to every vehicle you own.';
    for (const [k, R] of Object.entries(VRES)) { const lv = V0.res[k], c = cost(lv), r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${R.name} ${lv}/5 · ${R.desc}`; const mt = document.createElement('span'); mt.className = 'meta';
      mt.textContent = lv >= 5 ? 'Maxed' : `${c.cr} cr · ${c.scrap} scrap · ${c.ore} ore`; const ok = lv < 5 && S.cr >= c.cr && (S.inv.scrap || 0) >= c.scrap && (S.inv.ore || 0) >= c.ore;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Research'; b.disabled = !ok;
      b.addEventListener('click', () => { S.cr -= c.cr; S.inv.scrap -= c.scrap; S.inv.ore -= c.ore; V0.res[k]++; SFX.level(); log(`Research complete: ${R.name} ${V0.res[k]}`, 'loot'); markDirty(); render(); });
      r.append(nm, mt, b); rows.appendChild(r); } };
  $('dlgActs').before(rows); render(); acts([['Done', closeDlg]]);
}
// ---- Battle Tank handling (2.23.72): a real hull under you that pivot steers, a turret that swings after your aim, recoil, track marks ----
const TK = { marks: null, mi: 0, dist: 0, aim: null };
const angTo = (a, b, mx) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + clamp(d, -mx, mx); };
function tankMount() {
  VH.hy = VH.ty = player.yaw; VH.rk = 0; VH.shk = 0; VH.body = makeTankModel(); VH.body.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  levelGroup.add(VH.body); VH.tur = VH.body.userData.turret; VH.tur0 = VH.tur.position.clone();
  VH.muz = new THREE.Object3D(); VH.muz.position.set(0, 0.05, 3.3); VH.tur.add(VH.muz);
  if (!TK.aim) { const a = document.createElement('div'); a.id = 'tankAim'; a.style.cssText = 'position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border:2px solid rgba(255,90,60,.9);border-radius:50%;pointer-events:none;z-index:6;display:none;box-shadow:0 0 6px rgba(255,90,60,.6)'; a.innerHTML = '<div style="position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;background:#ff5a3c;border-radius:50%"></div>'; document.body.appendChild(a); TK.aim = a; }
  tankPose(0);
}
function tankDrop() { VH.shk = 0; if (VH.body) { if (VH.body.parent) VH.body.parent.remove(VH.body); disposeTree(VH.body); VH.body = null; } if (TK.aim) TK.aim.style.display = 'none'; }
function tankDrive(dt, D, top, air) {
  const dz = v => Math.max(0, (v - 0.15) / 0.85), th = (keys.KeyW ? 1 : 0) + dz(move.y), br = (keys.KeyS ? 1 : 0) + dz(-move.y), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x;
  if (!air && !VH.parkReq) { const v0 = VH.v; // heavy: slow to get going, slow to stop
    if (th) VH.v += D.acc * th * dt; else if (br) VH.v += (v0 > 0.2 ? -4.5 : -D.acc) * br * dt; else VH.v = Math.sign(v0) * Math.max(0, Math.abs(v0) - 1.6 * dt);
    if (br && !th && v0 > 0 && VH.v < 0) VH.v = 0; VH.v = clamp(VH.v, -3, top); }
  VH.hy -= st * D.turn * dt * (VH.v < -0.2 ? -1 : 1); // pivot steer, works standing still
  VH.ty = angTo(VH.ty, player.yaw, D.trs * dt);
  const f = V(-Math.sin(VH.hy), 0, -Math.cos(VH.hy)); player.pos.addScaledVector(f, VH.v * dt);
  const work = Math.min(1, Math.abs(VH.v) / top + Math.abs(st) * 0.4);
  SFX.engine && SFX.engine(0.55 + work * 0.45, -0.2 + work * 0.25);
  // run over anything small
  if (Math.abs(VH.v) > 1.5) for (const e of enemies) { if (e.dead || e.def.r * (e.sc || 1) > 1.0) continue; if (e.obj.position.distanceTo(player.pos) < 2.6 && (!e.ramT || gameTime - e.ramT > 0.6)) { e.ramT = gameTime; vehHit(e, 260); burst(e.obj.position.clone().add(V(0, 0.6, 0)), '#a08a70', 10, 4); SFX.hit(); } }
  // track marks
  TK.dist += Math.abs(VH.v) * dt; if (!air && TK.dist > 0.7) { TK.dist = 0; tankMark(f); }
}
function tankMark(f) {
  if (!TK.marks || !TK.marks.parent) { const m = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    TK.marks = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.62, 0.55).rotateX(-Math.PI / 2), m, 240); TK.marks.count = 0; TK.marks.frustumCulled = false; levelGroup.add(TK.marks); TK.mi = 0; }
  const r = V(f.z, 0, -f.x), M = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), VH.hy);
  for (const s of [-1, 1]) { const x = player.pos.x + r.x * 1.25 * s, z = player.pos.z + r.z * 1.25 * s; M.compose(V(x, floorAt(x, z) + 0.03, z), q, V(1, 1, 1)); TK.marks.setMatrixAt(TK.mi, M); TK.mi = (TK.mi + 1) % 240; TK.marks.count = Math.max(TK.marks.count, TK.mi || 240); }
  TK.marks.instanceMatrix.needsUpdate = true;
}
function tankPose(dt) {
  const B = VH.body; if (!B) return; if (!B.parent) levelGroup.add(B);
  const p = player.pos, f = V(-Math.sin(VH.hy), 0, -Math.cos(VH.hy)), gF = floorAt(p.x + f.x * 1.8, p.z + f.z * 1.8), gB = floorAt(p.x - f.x * 1.8, p.z - f.z * 1.8);
  VH.rk = Math.max(0, VH.rk - dt * 2.2); VH.shk = Math.max(0, VH.shk - dt * 2.5);
  B.position.set(p.x, p.y, p.z); B.rotation.set(0, VH.hy + Math.PI, 0, 'YXZ'); B.rotation.x = Math.atan2(gB - gF, 3.6) - Math.sin(VH.rk * Math.PI) * 0.06;
  VH.tur.rotation.y = VH.ty - VH.hy; VH.tur.position.copy(VH.tur0); VH.tur.position.z -= Math.sin(VH.rk * Math.PI) * 0.18;
  if (TK.aim) { const o = V(0, 0, 0), d = V(0, 0, 0); tankAimRay(o, d); const t = rayClear(o, d, VEH.tank.gun.range), w = o.addScaledVector(d, t).project(camera);
    const on = w.z < 1 && Math.abs(w.x) < 1.2 && Math.abs(w.y) < 1.2; TK.aim.style.display = on && !dlgOpen ? 'block' : 'none';
    if (on) { TK.aim.style.left = ((w.x + 1) / 2 * innerWidth) + 'px'; TK.aim.style.top = ((1 - w.y) / 2 * innerHeight) + 'px'; TK.aim.style.borderColor = Math.abs(((player.yaw - VH.ty + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI) < 0.03 ? 'rgba(120,255,140,.9)' : 'rgba(255,90,60,.9)'; } }
}
// where the barrel actually points: the turret's yaw, your pitch
function tankAimRay(o, d) { VH.body.updateMatrixWorld(true); VH.muz.getWorldPosition(o); const pt = clamp(player.pitch, -0.2, 0.35); d.set(-Math.sin(VH.ty) * Math.cos(pt), Math.sin(pt), -Math.cos(VH.ty) * Math.cos(pt)); }
function tankRecoil() { VH.rk = 1; VH.shk = 0.35; VH.v -= 0.6;
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; burst(player.pos.clone().add(V(Math.cos(a) * 2.4, 0.15, Math.sin(a) * 2.4)), (LEVEL.palette && (LEVEL.palette.sand || LEVEL.palette.dirt)) || '#a08a70', 2, 3); }
  const m = V(0, 0, 0); VH.muz.getWorldPosition(m); burst(m, '#ffd36a', 10, 5); burst(m, '#5a5550', 8, 2); }
