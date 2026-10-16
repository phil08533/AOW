// =================== THE RESIDENTIAL RING: apartments, a park, and the homes of the people you date ===================
// Twelve apartments face a central park. Six belong to the Starlight Lounge regulars: get close enough and they'll let you in.
// Dating someone? Invite them to move onto your ship. They live in your quarters, hang out and leave you gifts.
const RES_DOORS = [];
const ROM_HOME = { nyra: 0, grix: 2, juno: 4, rhett: 7, vesper: 9, pip9: 11 };
const RES_NEIGHBORS = [
  ['The Bloops', ["Nana Bloop is at the park. Take a muffin on your way out. Take two."]],
  ['Apt 2B', ["*muffled* WE DON'T WANT ANY SPACE SUBSCRIPTIONS.", "A voice says: 'If you're the landlord, I'm not home.'"]],
  ['Mr. Krill', ["A tiny alien opens the door, sees you, and closes it very slowly.", "'I'm in the middle of molting. Come back never.'"]],
  ['The Twins', ["Two identical kids open the door. 'Are you the hero?' 'You look shorter in the news.' Door closes."]],
  ['Dr. Odd', ["Something inside goes BOOM. A soot-covered scientist waves. 'Everything is fine! Mostly fine!'"]],
  ['Apt 6F', ["The door has seven locks and a sign: GO AWAY (UNLESS YOU HAVE PIZZA)."]]
];
function resNpcs(civ) {
  return [civ('nana', 'Nana Bloop', 'Resident · heals', 0, 4, Math.PI, { heal: true }, ["You look thin. Have a space muffin. It's mostly space.", "My grandson is a bounty hunter too. Well. He hunts bargains."]),
    civ('mgr', 'Building Manager Ott', 'Residential Ring · rooms', 20, 18, -2.2, { custom: [['Who lives here?', () => resDirectory()]] }, ["Twelve apartments, one park, zero working elevators. Except that one. That one works.", "Rent is due on the first. Of every cycle. Of every year. Forever."]),
    civ('kid', 'Little Zeek', 'Kid', -6, -2, 0.6, {}, ["Are you a real space marine? Can I hold your gun? Can I hold it now? How about now?"]),
    civ('gard', 'Gardener Fern', 'Community garden', 12, 2, -1, { shop: 'fish', rods: [1] }, ["Tomatoes in zero-G go everywhere. EVERYWHERE."])];
}
function resDirectory() {
  openDlg('Residential Ring', 'Building Manager Ott');
  const lines = Object.entries(ROM_HOME).map(([id, i]) => `#${i + 1}: ${ROMANCE[id].name}${romOf(id).ship ? ' (living on your ship now)' : ''}`).join(' · ');
  $('dlgLine').textContent = `Who lives where: ${lines}. They only open the door for friends. Everybody else is... colorful.`;
  acts([['Thanks', closeDlg, true]]);
}
function buildResidential(T, W, D, H, rnd) {
  RES_DOORS.length = 0;
  // the park: grass, trees, a fountain, benches, a playground
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), toon('#4f8a3a', 'leaves')); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0.03, 0); props.add(grass);
  for (const [x, z] of [[-15, -6], [-9, 6], [-3, -7], [9, 6], [15, -6], [16, 7], [-16, 6]]) { part(props, Cy(0.25, 0.35, 3, 6), toon('#5a3a22', 'wood'), x, 1.5, z); E(props, toon(x % 2 ? '#4f8a3a' : '#6fae4a', 'leaves'), x, 3.6, z, 1.6, 1.3, 1.6); solid(x, z, 0.4); }
  part(props, Cy(2.2, 2.4, 0.5, 16), toon('#9a9088', 'stone'), 0, 0.25, 0); part(props, Cy(1.9, 1.9, 0.05, 16), new THREE.MeshLambertMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.7 }), 0, 0.48, 0); part(props, Cy(0.2, 0.3, 1.6, 8), toon('#9a9088', 'stone'), 0, 1.0, 0); part(props, new THREE.SphereGeometry(0.3, 8, 6), glow('#9fe8ff'), 0, 1.9, 0); solid(0, 0, 2.4);
  for (const [x, z, ry] of [[-6, 3, 0], [6, -3, Math.PI], [-6, -3, Math.PI], [6, 3, 0]]) { const b = new THREE.Group(); part(b, B(1.8, 0.1, 0.5), toon('#8a6a44', 'wood'), 0, 0.5, 0); part(b, B(1.8, 0.5, 0.08), toon('#8a6a44', 'wood'), 0, 0.8, -0.22); at(b, x, z, ry); solid(x, z, 0.6); }
  { const pg = new THREE.Group(); for (const s of [-1, 1]) part(pg, B(0.12, 2.4, 0.12), '#c8402f', 1.2 * s, 1.2, 0); part(pg, B(2.6, 0.12, 0.12), '#c8402f', 0, 2.4, 0); for (const s of [-1, 1]) { chain(pg, [[0.6 * s, 2.4, 0], [0.6 * s, 1.2, 0], [0.6 * s, 0.6, 0]], 0.015, '#2b2a2c', 0.015); part(pg, B(0.5, 0.06, 0.25), '#ffd36a', 0.6 * s, 0.55, 0); } at(pg, -12, 0, Math.PI / 2); solid(-12, 0, 1.3);
    part(props, B(2.4, 0.3, 2.4), toon('#e0c890', 'stone'), -12, 0.15, -4.5); part(props, new THREE.ConeGeometry(0.6, 0.5, 8), toon('#e0c890', 'stone'), -12, 0.45, -4.5); }
  for (let i = 0; i < 6; i++) { const x = 9 + (i % 3) * 2, z = -1 + Math.floor(i / 3) * 2; part(props, B(1.6, 0.4, 1.6), toon('#5a3a22', 'wood'), x, 0.2, z); for (let k = 0; k < 4; k++) E(props, toon(['#c8402f', '#ffd23a', '#6fdc5a'][(i + k) % 3], 'leaves'), x - 0.5 + (k % 2), 0.55, z - 0.5 + Math.floor(k / 2), 0.2, 0.18, 0.2); box(x, z, 0.8, 0.8); }
  // twelve apartment fronts, six on each side of the street
  const pal = ['#c8a888', '#8aa8c8', '#c8b0d8', '#a8c8a8', '#d8c098', '#b8b8c8'];
  for (let i = 0; i < 12; i++) {
    const north = i < 6, k = i % 6, x = north ? -25 + k * 10 : -26 + k * 8, z = north ? -D + 4 : D - 4, ry = north ? 0 : Math.PI, rid = Object.keys(ROM_HOME).find(id => ROM_HOME[id] === i);
    const g = new THREE.Group(); part(g, B(9, 6.2, 6), toon(pal[(i * 7) % pal.length], 'panel'), 0, 3.1, 0); part(g, B(9.2, 0.3, 6.2), '#3a3d44', 0, 6.3, 0);
    part(g, B(1.6, 2.6, 0.1), rid ? toon(ROM_COLORS[rid] || '#5a3a22') : '#5a3a22', 0, 1.3, 3.02); part(g, B(0.12, 0.12, 0.06), '#c9a43a', 0.6, 1.3, 3.08);
    for (const s of [-1, 1]) { part(g, B(1.8, 1.3, 0.06), glow(rnd(i + s) > 0.35 ? '#ffe0a0' : '#2a3a4a'), 2.8 * s, 2.0, 3.02); part(g, B(2.0, 0.12, 0.3), '#3a3d44', 2.8 * s, 1.3, 3.12); part(g, B(1.8, 1.3, 0.06), glow(rnd(i * 3 + s) > 0.5 ? '#ffe0a0' : '#2a3a4a'), 2.8 * s, 4.6, 3.02); }
    part(g, B(2.4, 0.08, 1.2), toon(rid ? ROM_COLORS[rid] : '#8a6a44', 'cloth'), 0, 2.85, 3.5, 0.2);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({ map: signTex(rid ? `#${i + 1} ${ROMANCE[rid].name.split(' ')[0].toUpperCase()}` : `#${i + 1}`, '#1e1c22', '#ffd36a') })); sg.position.set(0, 3.3, 3.05); g.add(sg);
    if (rid === 'grix') for (let q = 0; q < 4; q++) part(g, new THREE.DodecahedronGeometry(0.3 + q * 0.08, 0), toon('#8a7a6a', 'stone'), -1.6 + q * 0.4, 0.3, 3.8);
    if (rid === 'juno') { part(g, B(1, 0.7, 0.6), '#c8402f', -2, 0.35, 3.6); part(g, Cy(0.25, 0.25, 0.1, 8), '#2b2a2c', -3, 0.3, 3.7, Math.PI / 2); }
    if (rid === 'vesper') for (let q = 0; q < 3; q++) part(g, new THREE.OctahedronGeometry(0.05, 0), glow('#c86aff'), -1.2 + q * 0.3, 0.5, 3.7);
    if (rid === 'pip9') part(g, B(0.8, 1.2, 0.5), '#ff6aa8', -2, 0.6, 3.6);
    if (rid === 'nyra') part(g, B(1.4, 0.06, 0.4), '#c8402f', -2.2, 0.8, 3.4, 0, 0.3, 0);
    if (rid === 'rhett') for (let q = 0; q < 2; q++) part(g, B(0.7, 0.7, 0.7), toon('#8a6a44', 'wood'), -2.2 + q * 0.8, 0.35, 3.7);
    if (!rid && i % 3 === 0) { part(g, Cy(0.25, 0.2, 0.4, 8), toon('#c9733a', 'stone'), 1.6, 0.2, 3.6); E(g, toon('#4f8a3a', 'leaves'), 1.6, 0.6, 3.6, 0.3, 0.35, 0.3); }
    at(g, x, z, ry); if (!north) g.scale.x = 0.82; box(x, z, north ? 4.5 : 3.7, 3); // south row is narrower so the elevator stays clear
    const dz = north ? z + 3.9 : z - 3.9; RES_DOORS.push({ i, x, z: dz, rid });
    INTERACTS.push({ x, z: dz, r: 1.8, label: rid ? `${ROMANCE[rid].name.split(' ')[0]}'s door` : `Apartment #${i + 1}`, fn: () => resDoor(i, rid) });
  }
  // street lamps and a mail kiosk
  for (let i = 0; i < 6; i++) for (const zz of [-12, 12]) { const x = -25 + i * 10 + 5; part(props, Cy(0.06, 0.08, 3.2, 6), '#2b2a2c', x, 1.6, zz); part(props, B(0.35, 0.3, 0.35), glow('#ffe0a0'), x, 3.3, zz); solid(x, zz, 0.15); }
  part(props, B(2, 2.2, 1.2), '#3b4f7a', 22, 1.1, -14); part(props, B(1.6, 0.6, 0.04), glow('#ffd36a'), 22, 1.6, -13.38); { const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshBasicMaterial({ map: signTex('SPACE MAIL', '#3b4f7a', '#ffd36a') })); sg.position.set(22, 2.5, -13.37); props.add(sg); } box(22, -14, 1, 0.6);
  INTERACTS.push({ x: 22, z: -12.6, r: 1.6, label: 'Check your mailbox', fn: resMail });
  // residents strolling and kids running laps around the park
  const folk = []; for (let i = 0; i < 9; i++) { const kid = i >= 6, o = buildChar(() => { const c = makeCivilian(pickC(['#c8402f', '#3b4f7a', '#5a6a3a', '#8a6fc4', '#c9a43a', '#2a5a7a']), '#2c2a28', pickC(['#e0b892', '#c58a64', '#8a5a3a', '#9fe8ff']), pickC(['#1e1a18', '#5a3a22', '#c9a43a'])); return c; }, 'civ'); if (kid) o.scale.setScalar(0.65); /* scale after rigging so the arms still pivot at the shoulders */ blob(o, 0.35); levelGroup.add(o); MOVERS.push([o, 0.35]); folk.push({ o, st: {}, kid, ph: i * 0.7, r: kid ? 7 + (i % 2) : 10 + (i % 3) * 1.4 }); }
  levelAnims.push(t => folk.forEach((f, i) => { const sp = f.kid ? 0.35 : 0.1, a = t * sp * (i % 2 ? 1 : -1) + f.ph, x = Math.cos(a) * f.r * 1.6, z = Math.sin(a) * f.r * 0.85; f.o.position.set(x, 0, z); f.o.rotation.y = Math.atan2(-Math.sin(a) * f.r * 1.6 * (i % 2 ? 1 : -1), Math.cos(a) * f.r * 0.85 * (i % 2 ? 1 : -1)); animRig(f.o, f.st, 1 / 60, t); }));
}
const ROM_COLORS = { nyra: '#c8402f', grix: '#8a7a6a', juno: '#ffd36a', rhett: '#3b4f7a', vesper: '#5a2a8a', pip9: '#ff6aa8' };
function resDoor(i, rid) {
  if (!rid) { const N = RES_NEIGHBORS[i % RES_NEIGHBORS.length]; openDlg('Knock knock', N[0]); $('dlgLine').textContent = N[1][randi(0, N[1].length - 1)]; acts([['Back away slowly', closeDlg, true]]); SFX.ui(); return; }
  const R = ROMANCE[rid], M = romOf(rid), st = romStage(M.aff);
  openDlg(`#${i + 1} · ${R.role}`, `${R.name}'s place`);
  if (M.ship) { $('dlgLine').textContent = `A note on the door: "Moved onto the Setting Sun with someone very handsome/pretty/robust. Forward mail there. — ${R.name.split(' ')[0]}"`; acts([['Aww', closeDlg, true]]); return; }
  if (st < 2) { $('dlgLine').textContent = `You knock. ${R.name.split(' ')[0]} opens the door a crack. "Do I... know you? Find me at the Starlight Lounge first."`; acts([['Fair enough', closeDlg, true]]); SFX.ui(); return; }
  $('dlgLine').textContent = `${R.name.split(' ')[0]} opens the door and grins. "Oh, it's you! Come in, come in."`;
  acts([['Go inside', () => { closeDlg(); visitApt(rid); }, true], ['Not now', closeDlg]]);
}
function resMail() {
  openDlg('Mailbox', 'Space Mail'); const roomie = Object.keys(romS()).find(id => romOf(id).ship), p = romPartner();
  const notes = ['A coupon for 10% off at Moe-bot\'s. Expired three cycles ago.', 'A postcard from Mezar: "Wish you were here. Actually don\'t, it\'s really hot."', 'Junk mail: "Have YOU considered a career in asteroid mining?"', 'A bill. For the elevator. It says "PAY OR WALK".'];
  if (p) notes.push(`A letter from ${ROMANCE[p].name}: "${ROMANCE[p].lines[5][1]}"`);
  $('dlgLine').textContent = notes[randi(0, notes.length - 1)]; acts([['Close', closeDlg, true]]);
}
// ---------------- apartment interiors ----------------
const APT = { rid: 'nyra' };
LEVELS.apt = { id: 'apt', name: 'Apartment', tag: 'Residential Ring', lvls: 'Safe', size: 60, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true, terrain: null, palette: { grass: '#3a3d44' },
  zones: [{ id: 'home', name: 'Apartment', lvl: 'Safe', x: 0, z: 0, r: 12, col: '#3a3d44', safe: true, h: 0 }], paths: [], river: [], pools: [], lava: [], safes: [{ x: 0, z: 0, r: 400 }], spawn: { x: 0, z: 5, yaw: 0 }, pad: { x: 0, z: 7 }, menu: { x: 0, z: 0, r: 6, h: 3 }, npcBase: [0, 0], npcs: [], spawns: [],
  build() {
    const rid = APT.rid, col = ROM_COLORS[rid], W = 7, D = 6, H = 3.6;
    const fl = new THREE.PlaneGeometry(W * 2, D * 2, 4, 4); fl.rotateX(-Math.PI / 2); props.add(new THREE.Mesh(fl, toon(rid === 'vesper' ? '#2a1e30' : rid === 'grix' ? '#7a6a58' : '#8a6a4a', rid === 'grix' ? 'stone' : 'wood')));
    const ce = new THREE.Mesh(fl.clone(), toon('#2c2a28', 'panel')); ce.rotation.x = Math.PI; ce.position.y = H; props.add(ce);
    for (const [x, z, w, d] of [[0, -D, W * 2, 0.3], [0, D, W * 2, 0.3], [-W, 0, 0.3, D * 2], [W, 0, 0.3, D * 2]]) { part(props, B(w, H, d), toon(rid === 'vesper' ? '#1e1c22' : '#c8b8a8', 'panel'), x, H / 2, z); box(x, z, w / 2, d / 2); }
    part(props, B(1.4, 2.6, 0.1), toon(col), 0, 1.3, D - 0.2); INTERACTS.push({ x: 0, z: D - 1.2, r: 1.5, label: 'Leave', fn: () => goFloor(ZLIST.indexOf('homes')) });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshBasicMaterial({ color: '#0a0e1e' })); win.position.set(0, 2, -D + 0.17); props.add(win); for (let i = 0; i < 30; i++) part(props, B(0.04, 0.04, 0.01), glow('#ffffff'), -2.4 + Math.random() * 4.8, 1.1 + Math.random() * 1.8, -D + 0.18);
    const place = (type, x, z, ry) => { const m = pieceModel(type, col); m.position.set(x, 0, z); m.rotation.y = ry || 0; props.add(m); solid(x, z, 0.6); };
    place('bed', -5, -3.5, 0); place('nightstand', -3.6, -4.8); place('rug', 0, 0); place(rid === 'grix' ? 'bonsai' : 'plant', 6, -5);
    if (rid === 'nyra') { place('sofa', 2, 2.5, Math.PI); place('poster', 6.6, -1, -Math.PI / 2); place('poster', 6.6, 2, -Math.PI / 2); place('dartboard', -6.6, 1, Math.PI / 2); place('trophy', 4, -4.5); const sh = makeStarship(col, { p: 4, a: 3, wing: 2, eng: 1, nose: 1, fin: 2, pod: 1 }); sh.scale.setScalar(0.15); sh.position.set(0, 1.2, 0.6); props.add(sh); }
    if (rid === 'grix') { for (let i = 0; i < 9; i++) part(props, new THREE.DodecahedronGeometry(0.2 + (i % 3) * 0.15, 0), toon(['#8a7a6a', '#a89a88', '#6a5a4a'][i % 3], 'stone'), -3 + (i % 5) * 1.5, 0.2, 2 + Math.floor(i / 5) * 1.2); place('bookshelf', 6.6, 0, -Math.PI / 2); place('candles', 2, -2); place('painting', -6.6, 1, Math.PI / 2); }
    if (rid === 'juno') { place('computer', 4.5, -4.8); place('counter', -4, 4.5, Math.PI); place('robobuddy', 2, 1); for (let i = 0; i < 6; i++) part(props, B(0.3, 0.2, 0.3), ['#9aa1aa', '#c8402f', '#ffd36a'][i % 3], -6 + i * 0.6, 0.95, 4.6); place('neon', 6.6, 2, -Math.PI / 2); }
    if (rid === 'rhett') { place('sofa', 2, 2.5, Math.PI); place('pooltable', 3, -2); place('crate', -6, 4.6); place('crate', -5, 4.6); place('jukebox', 6.4, 4.4, -Math.PI / 2); place('painting', -6.6, 0, Math.PI / 2); }
    if (rid === 'vesper') { for (let i = 0; i < 8; i++) place('candles', -5 + i * 1.4, -5.2); place('telescope', 4.5, -3); place('lavalamp', -3.6, -4.8); const sky = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), new THREE.MeshBasicMaterial({ map: signTex('✦ · ✧ ✦ · ✧', '#0a0610', '#c86aff') })); sky.position.set(6.8, 2, 0); sky.rotation.y = -Math.PI / 2; props.add(sky); }
    if (rid === 'pip9') { for (let i = 0; i < 3; i++) { part(props, B(0.9, 2.2, 0.7), '#2b2a2c', -6 + i * 1.1, 1.1, 4.8); for (let k = 0; k < 6; k++) part(props, B(0.5, 0.05, 0.02), glow(k % 2 ? '#6fdc5a' : '#ff6aa8'), -6 + i * 1.1, 0.4 + k * 0.3, 4.44); box(-6 + i * 1.1, 4.8, 0.45, 0.35); } place('holotv', 6.6, 0, -Math.PI / 2); place('poster', -6.6, -1, Math.PI / 2); place('beanbag', 3, 1); }
    const lamp = new THREE.PointLight(0xffd8a0, 0.9, 20, 1.5); lamp.position.set(0, 3, 0); levelGroup.add(lamp);
  }
};
function visitApt(rid) {
  APT.rid = rid; const R = ROMANCE[rid];
  LEVELS.apt.name = `${R.name.split(' ')[0]}'s apartment`; LEVELS.apt.zones[0].name = LEVELS.apt.name;
  LEVELS.apt.npcs = [{ id: 'host_' + rid, romId: rid, name: R.name, role: 'At home', rig: R.rig || 'civ', make: R.make, x: 1.5, z: -1.5, face: 0.4, custom: [['♥ Hang out', () => openRomance(rid, true)]], idle: R.lines[Math.min(5, romStage(romOf(rid).aff))] }];
  SFX.door(); loadLevel('apt'); toast(LEVELS.apt.name.toUpperCase(), 'Make yourself at home', 2.5);
}
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'apt') return false; return _po(id); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'apt') { S.where = 'zeltac'; S.orbit = 'zeltac'; } if (id === 'ship') spawnRoommate(); return r; }; }
// ---------------- moving in ----------------
function spawnRoommate() {
  const rid = Object.keys(romS()).find(id => romOf(id).ship); if (!rid || !ROMANCE[rid]) return;
  const R = ROMANCE[rid], M = romOf(rid), q = SHIP_ROOMS.find(r => r.id === 'quarters') || SHIP_ROOMS[0]; if (!q) return;
  const x = (q.x0 + q.x1) / 2 - q.side * 0.4, z = q.zc + 0.5; // across the room from the bunk, so the bed and the partner each get their own button
  makeNpc({ id: 'roomie', romId: rid, name: R.name, role: 'Lives on your ship', rig: R.rig || 'civ', make: R.make, x, z, face: q.side > 0 ? -Math.PI / 2 : Math.PI / 2, custom: [['♥ Hang out', () => openRomance(rid, true)]], idle: R.lines[5] }, [0, 0]);
  if (Date.now() - (M.gift || 0) > 20 * 60 * 1000) { M.gift = Date.now(); const k = R.likes.filter(i => ITEMS[i])[randi(0, R.likes.filter(i => ITEMS[i]).length - 1)]; if (k) { S.inv[k] = (S.inv[k] || 0) + 1; } const cr = 100 + randi(0, 200); S.cr += cr; markDirty(); setTimeout(() => log(`${R.name} left you a gift: ${k ? ITEMS[k].name + ' and ' : ''}${cr} credits. "${R.lines[5][0]}"`, 'loot'), 1500); }
}
// add home-only actions to the romance menu
{ const _or = openRomance; openRomance = function (id, home) {
  _or(id); const R = ROMANCE[id], M = romOf(id), st = romStage(M.aff), roomie = Object.keys(romS()).find(k => romOf(k).ship);
  const extra = [];
  if (home) extra.push(['Spend the evening', () => { if (Date.now() - (M.ev || 0) < 120000) { $('dlgLine').textContent = '"We literally just did that. Go save the galaxy, I\'ll be here."'; return; } M.ev = Date.now(); M.aff = clamp(M.aff + 6, 0, 100); player.hp = maxHp(); markDirty(); SFX.quest(); $('dlgLine').textContent = R.dates[randi(0, R.dates.length - 1)].replace(/^You /, 'At home, you '); setTimeout(() => openRomance(id, home), 2200); }]);
  if (st >= 4 && !M.ship && (!roomie || roomie === id)) extra.push(['🏠 Invite to live on your ship', () => { Object.values(romS()).forEach(o => { o.ship = false; }); M.ship = true; markDirty(); SFX.level(); toast('MOVING IN', `${R.name} is moving onto the Setting Sun!`, 4); $('dlgLine').textContent = st >= 5 ? `"Finally! I already packed. Twice."` : `"Your ship? Like, live there? ...Yeah. Yeah, okay. I'd like that."`; }]);
  if (M.ship) extra.push(['Ask them to move back home', () => { M.ship = false; markDirty(); $('dlgLine').textContent = '"Oh. Okay. I\'ll take my stuff back to the Residential Ring. Visit me, okay?"'; }]);
  if (extra.length) { const box = $('dlgActs'), bye = [...box.querySelectorAll('button')].pop(); extra.forEach(([label, fn]) => { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = label; b.addEventListener('click', fn); box.insertBefore(b, bye); }); }
}; }
