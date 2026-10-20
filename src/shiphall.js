// =================== SHIP HALLWAY (2.12): pipes, a viewport, crew, and things to poke at ===================
const HALL_CREW = [
  { name: 'Ensign Pell', role: 'Deck crew', col: '#3a5a8a', lines: ["Morning, Captain. Or evening. Hard to tell out here.", "The hangar mechanics keep stealing my wrench. I can't prove it. Yet.", "If you see a loose pipe, don't touch it. Most of them are hot. Some are VERY hot."] },
  { name: 'Tech Ruiz', role: 'Engineer', col: '#8a5a2a', lines: ["Hull's holding. Engines purring. Coffee machine is the real problem.", "Every room you add makes the ship hum a little different. I like it.", "Need upgrades? The terminal on the bridge. Tell it Ruiz says hi."] },
  { name: 'Medic Okafor', role: 'Med crew', col: '#d8e8ec', lines: ["Stay hydrated. There's a cooler in the hall. Use it.", "You came back with all your fingers again. Good. I'm counting.", "The med bay stim is safe. Mostly. Read the label."] }
];
function hallLayout() {
  const rooms = S.ship.rooms.filter(r => r !== 'bridge'), rows = Math.max(1, Math.ceil(rooms.length / 2)), Lz = 4 + (rows - 1) * 11 + 7;
  const doors = { 1: [], '-1': [] }; rooms.forEach((r, k) => { const s = roomSlot(k); doors[s.side].push(s.zc); });
  const free = side => { const out = []; let z = -2; for (const g of doors[side].sort((a, b) => a - b)) { if (g - 1.3 - z > 0.5) out.push([z, g - 1.3]); z = g + 1.3; } if (Lz - z > 0.5) out.push([z, Lz]); return out; };
  return { Lz, free };
}
function starTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#04061a'); gr.addColorStop(1, '#0c1030'); g.fillStyle = gr; g.fillRect(0, 0, 256, 160);
  for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; const s = Math.random() < 0.1 ? 2 : 1; g.fillRect(Math.random() * 256, Math.random() * 160, s, s); }
  const pg = g.createRadialGradient(178, 98, 4, 190, 110, 52); pg.addColorStop(0, '#6aa8e0'); pg.addColorStop(0.5, '#2a5a98'); pg.addColorStop(0.85, '#1a3060'); pg.addColorStop(1, '#0c1030'); g.fillStyle = pg; g.beginPath(); g.arc(190, 110, 46, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t;
}
function hallWater() { player.hp = Math.min(maxHp(), player.hp + Math.round(maxHp() * 0.1)); SFX.ui(); toast('WATER COOLER', 'Cold and a little metallic. +10% health', 1.6); }
function hallStatus() {
  const rooms = S.ship.rooms.filter(r => r !== 'bridge'), missing = Object.keys(ROOMS).filter(r => r !== 'bridge' && !S.ship.rooms.includes(r));
  openDlg('Ship status', LEVELS.ship.name);
  $('dlgLine').textContent = `Hull nominal. ${rooms.length} room${rooms.length === 1 ? '' : 's'} online: ${rooms.map(r => ROOMS[r].name).join(', ') || 'none yet'}.` + (missing.length ? ` Still to build: ${missing.map(r => ROOMS[r].name).join(', ')}. Use the ship terminal on the bridge.` : ' Every room is built. Nice ship, Captain.');
  acts([['Close', closeDlg, true]]);
}
function hallView() {
  const at = S.orbit && LEVELS[S.orbit] ? LEVELS[S.orbit].name : 'deep space';
  openDlg('Viewport', 'Looking out'); $('dlgLine').textContent = `Stars, and ${at} hanging below the ship. It never gets old.`; acts([['Galaxy map', () => { closeDlg(); openGalaxy(); }, true], ['Close', closeDlg]]);
}
function dressHall() {
  const H = 3.2, { Lz, free } = hallLayout();
  // pipes along both upper corners, brackets on every rib, a cable bundle
  for (const s of [1, -1]) {
    const len = Lz + 2, cz = (Lz - 2) / 2;
    part(props, Cy(0.07, 0.07, len, 8), '#6a7a8a', 1.64 * s, 3.02, cz, Math.PI / 2, 0, 0);
    part(props, Cy(0.05, 0.05, len, 8), '#b3762a', 1.7 * s, 2.86, cz, Math.PI / 2, 0, 0);
    part(props, Cy(0.035, 0.035, len, 6), '#2a2c32', 1.56 * s, 3.1, cz, Math.PI / 2, 0, 0);
    for (let z = 0; z < Lz; z += 3) part(props, B(0.3, 0.06, 0.08), '#3a3d44', 1.66 * s, 2.78, z);
    part(props, B(0.05, 0.012, len), glow('#4fd2ff'), 1.55 * s, 0.012, cz);
  }
  // the end of the hall: a big viewport onto the stars
  const vw = 2.6, vh = 1.5, zEnd = Lz - 0.18;
  const view = new THREE.Mesh(new THREE.PlaneGeometry(vw, vh), new THREE.MeshBasicMaterial({ map: starTex(), toneMapped: false })); view.position.set(0, 1.65, zEnd); view.rotation.y = Math.PI; levelGroup.add(view);
  part(props, B(vw + 0.3, 0.16, 0.2), '#2a2c32', 0, 1.65 + vh / 2 + 0.06, zEnd); part(props, B(vw + 0.3, 0.16, 0.2), '#2a2c32', 0, 1.65 - vh / 2 - 0.06, zEnd);
  for (const s of [-1, 1]) part(props, B(0.16, vh + 0.3, 0.2), '#2a2c32', s * (vw / 2 + 0.07), 1.65, zEnd);
  part(props, B(0.06, vh, 0.08), '#2a2c32', 0, 1.65, zEnd - 0.02);
  { const g = new THREE.Group(); part(g, B(1.6, 0.1, 0.45), toon('#3a5a8a', 'cloth'), 0, 0.45, 0); for (const x of [-0.65, 0.65]) part(g, B(0.08, 0.42, 0.38), '#2a2c32', x, 0.21, 0); g.position.set(0, 0, Lz - 0.75); props.add(g); box(0, Lz - 0.75, 0.8, 0.23); }
  INTERACTS.push({ x: 0, z: Lz - 1.4, r: 1.6, label: 'Look out the viewport', fn: hallView });
  // along the free stretches of wall: a status screen, crates, lockers, a water cooler, an extinguisher
  let n = 0; const used = { status: 0, cooler: 0 };
  for (const s of [1, -1]) for (const [a, b] of free(s)) {
    const len = b - a, x = 1.62 * s, ry = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    if (len < 1.6) continue;
    const at = k => a + len * k;
    // wall screen (clickable) or extinguisher near the start of the stretch
    if (!used.status && len > 3) { used.status = 1; const z = at(0.22); const g = new THREE.Group(); part(g, B(1.0, 0.62, 0.06), '#2a2c32', 0, 0, 0); part(g, B(0.9, 0.52, 0.02), glow('#4fd2ff'), 0, 0, 0.04); part(g, B(0.7, 0.04, 0.025), glow('#ffd36a'), 0, 0.14, 0.05); part(g, B(0.5, 0.04, 0.025), glow('#6fdc5a'), -0.1, 0.02, 0.05); g.position.set(1.95 * s, 1.55, z); g.rotation.y = ry; props.add(g); INTERACTS.push({ x: 1.1 * s, z, r: 1.4, label: 'Ship status', fn: hallStatus }); }
    else { const z = at(0.18); part(props, Cy(0.09, 0.09, 0.5, 8), '#c8402f', 1.86 * s, 0.75, z); part(props, B(0.12, 0.04, 0.12), '#2a2c32', 1.86 * s, 1.03, z); part(props, B(0.02, 0.5, 0.3), '#ffd36a', 1.98 * s, 1.5, z); }
    if (len < 3) continue;
    // middle: a crate stack or a locker bank
    const zm = at(0.55);
    if (n++ % 2 === 0) { part(props, B(0.7, 0.7, 0.7), toonNS('#8a6a4a', 'wood'), x - 0.2 * s, 0.35, zm, 0, 0.1, 0); part(props, B(0.5, 0.5, 0.5), toonNS('#5a7a9a', 'hull'), x - 0.25 * s, 0.95, zm + 0.05, 0, -0.2, 0); part(props, B(0.6, 0.45, 0.55), toonNS('#7a6a4a', 'wood'), x - 0.2 * s, 0.23, zm + 0.75); box(x - 0.2 * s, zm + 0.35, 0.38, 0.75); }
    else { for (let i = 0; i < 3; i++) { const z = zm - 0.55 + i * 0.55; part(props, B(0.45, 1.9, 0.52), "#5d636c", 1.6 * s, 0.95, z); part(props, B(0.02, 0.5, 0.06), "#2a2c32", (1.6 - 0.23) * s, 1.5, z + 0.12); for (const y of [1.7, 1.75, 1.8]) part(props, B(0.02, 0.02, 0.36), "#2a2c32", (1.6 - 0.23) * s, y, z); } box(1.6 * s, zm, 0.23, 0.85); }
    // the end of a long stretch: the water cooler, once
    if (!used.cooler && len > 5) { used.cooler = 1; const z = at(0.86), g = new THREE.Group(); part(g, B(0.4, 0.95, 0.4), '#d8e8ec', 0, 0.48, 0); part(g, Cy(0.17, 0.17, 0.45, 10), new THREE.MeshLambertMaterial({ color: '#8fd0ff', transparent: true, opacity: 0.7 }), 0, 1.18, 0); part(g, B(0.08, 0.06, 0.06), '#4fa8ff', -0.1, 0.8, 0.22); g.position.set(1.72 * s, 0, z); props.add(g); solid(1.72 * s, z, 0.28); INTERACTS.push({ x: 1.0 * s, z, r: 1.3, label: 'Water cooler', fn: hallWater }); }
  }
  // crew who walk the hall and stop for a word
  const pick = HALL_CREW.slice(0, Lz > 20 ? 3 : 2);
  pick.forEach((c, i) => {
    const o = buildChar(() => recolor(makeTrooper(), { '#6f7a3e': c.col }), 'trooper'); blob(o, 0.4); const lane = i % 2 ? -0.75 : 0.75;
    const f = { o, st: {}, a: 4 + i * 2.5, b: Lz - 1.6 - i * 1.5, tgt: null, wait: 1 + i * 1.7, sp: 1.0 + i * 0.12, talkT: 0 };
    o.position.set(lane, 0, f.a + (f.b - f.a) * (i / 3)); levelGroup.add(o); MOVERS.push([o, 0.4]); f.lane = lane;
    INTERACTS.push({ get x() { return o.position.x; }, get z() { return o.position.z; }, r: 1.6, label: 'Talk to ' + c.name, fn: () => { f.talkT = 6; const want = Math.atan2(player.pos.x - o.position.x, player.pos.z - o.position.z); o.rotation.y = want;
      openDlg(c.role, c.name); $('dlgLine').textContent = c.lines[Math.floor(Math.random() * c.lines.length)]; acts([['Carry on', closeDlg, true]]); } });
    let last = 0;
    levelAnims.push(t => { const dt = Math.min(0.05, t - last || 0.016); last = t;
      if (f.talkT > 0) { f.talkT -= dt; animRig(o, f.st, dt, t); return; }
      if (f.wait > 0) { f.wait -= dt; animRig(o, f.st, dt, t); return; }
      if (f.tgt == null) f.tgt = Math.abs(o.position.z - f.a) < Math.abs(o.position.z - f.b) ? f.b : f.a;
      const near = Math.hypot(player.pos.x - o.position.x, player.pos.z - o.position.z) < 1.1, x = near ? -f.lane : f.lane;
      const dx = x - o.position.x, dz = f.tgt - o.position.z, d = Math.hypot(dx, dz);
      if (Math.abs(dz) < 0.3) { f.tgt = null; f.wait = 2 + Math.random() * 5; return; }
      const step = Math.min(d, f.sp * dt); o.position.x += dx / d * step; o.position.z += dz / d * step;
      const want = Math.atan2(dx, dz); o.rotation.y += Math.atan2(Math.sin(want - o.rotation.y), Math.cos(want - o.rotation.y)) * Math.min(1, dt * 6);
      animRig(o, f.st, dt, t); });
  });
}
{ const _b = LEVELS.ship.build; LEVELS.ship.build = function () { _b.apply(this, arguments); try { dressHall(); } catch (e) { console.warn('hall', e); } }; }
