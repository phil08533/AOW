// =================== NEW JAMESTOWN: Earth's capital city (replaces the old walled safe zone) ===================
const JT_R = 44, JT_K = 1.9; // city radius, and how far the rest of Earth is pushed out to make room
const ET = (x, z) => [TOWN.x + (x - TOWN.x) * JT_K, TOWN.z + (z - TOWN.z) * JT_K];
function makeJTBuilding(w, h, d, col, trim, sign, awn) {
  const g = new THREE.Group();
  part(g, B(w, h, d), toon(col, 'stone'), 0, h / 2, 0); part(g, B(w + 0.3, 0.35, d + 0.3), trim, 0, h + 0.17, 0);
  for (let y = 1.9; y < h - 0.6; y += 1.6) for (let x = -w / 2 + 0.9; x < w / 2 - 0.5; x += 1.3) { const lit = Math.sin(x * 7 + y * 3 + w) > -0.2; part(g, B(0.7, 0.8, 0.06), lit ? glow('#ffe0a0') : '#2a3a4a', x, y + 0.4, d / 2 + 0.02); }
  part(g, B(1.2, 2.0, 0.08), '#3a2a1e', 0, 1.0, d / 2 + 0.03); part(g, B(1.5, 0.15, 0.1), trim, 0, 2.1, d / 2 + 0.05);
  if (awn) { part(g, B(w * 0.8, 0.08, 1.4), toon(awn, 'cloth'), 0, 2.5, d / 2 + 0.6, 0.25); }
  if (sign) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w - 0.4, 5), 0.8), new THREE.MeshBasicMaterial({ map: signTex(sign, '#1e1c22', '#ffd36a') })); sg.position.set(0, 3.0, d / 2 + 0.08); g.add(sg); }
  return g;
}
// [label, x, z, w, d, h, facing ry, wall colour, trim, awning]
const PI2 = Math.PI / 2;
const JT_BUILDINGS = [
  ['TOWN HALL', 0, -36, 16, 7, 10, 0, '#d8c8a8', '#8a6a44', null],
  ['BANK', -14, -14, 9, 7, 8, PI2, '#c9c0b0', '#c9a43a', null], ['CLINIC', 14, -14, 9, 7, 7, -PI2, '#e8e4dc', '#c8402f', '#c8402f'],
  ['GUN SHOP', -14, 14, 9, 7, 7, PI2, '#8a6a4a', '#3a2a1e', '#5a6a3a'], ['GENERAL STORE', 14, 14, 9, 7, 7, -PI2, '#a88a6a', '#5d4a8a', '#8a6fc4'],
  ['TAILOR', -14, -27, 8, 6, 6, PI2, '#b8a8c8', '#5d3a8a', '#c86aff'], ['PET SHOP', 14, -27, 8, 6, 6, -PI2, '#c8b890', '#6fdc5a', '#6fdc5a'],
  ['DINER', -14, 27, 8, 6, 5.5, PI2, '#d8a878', '#c8402f', '#ffd36a'], ['HOTEL', 14, 27, 8, 6, 11, -PI2, '#9a8a9a', '#3b4f7a', '#3b4f7a'],
  ['FISH MARKET', 28, -12, 9, 6, 5.5, 0, '#a8b8c8', '#2a5a7a', '#4fa8ff'], ['ARCADE', -28, -12, 9, 6, 6, 0, '#5a2a6a', '#ff6aa8', '#ff6aa8'],
  ['CINEMA', -28, 12, 10, 6, 8, Math.PI, '#8a2a3a', '#ffd36a', '#c8402f'], ['GARAGE', 28, 12, 10, 6, 5.5, Math.PI, '#5d636c', '#ff8a2a', '#ff8a2a'],
  ['APARTMENTS', 36, 28, 8, 8, 14, Math.PI, '#b8a088', '#5a3a22', null], ['APARTMENTS', -38, -24, 8, 8, 13, 0, '#a8b0b8', '#3a4a5a', null],
  [null, -26, 34, 7, 6, 6, Math.PI, '#c8a888', '#5a3a22', null], [null, 26, 36, 7, 6, 7, Math.PI, '#a8c8a8', '#3a4a3a', null], [null, -40, 10, 6, 7, 6, PI2, '#d8c098', '#5a3a22', null],
  [null, 40, -8, 6, 7, 7, -PI2, '#b8b8c8', '#3b4f7a', null], [null, -24, -36, 7, 6, 8, 0.3, '#c8b0d8', '#5d3a8a', null]
];
// where each townsperson stands: [x, z, face] (shopkeepers stand outside their shop door)
const JT_POS = { mayor: [0, -30.5, 0], nash: [-8.6, -14, PI2], mira: [8.6, -14, -PI2], tully: [-8.6, 14, PI2], zib: [8.6, 14, -PI2], ada: [-9.2, -27, PI2], paws: [9.2, -27, -PI2], cookie: [-9.2, 27, PI2], hank: [9.2, 27, -PI2], gil: [28, -7.5, 0],
  vega: [3.5, 40, 0], dent: [-3.5, 40, 0], scoop: [7, -7, -0.8], banjo: [-7, 7, 2.4], elismas: [-7.5, -7.5, 0.8] };
const JT_NPCS = [
  { id: 'vega', name: 'Captain Vega', role: 'City watch', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#3b4f7a', '#4a5229': '#2a3756', '#c9b27c': '#d9c48a' }), x: 2.6, z: 16.5, face: 0, idle: ["Welcome to New Jamestown. Biggest city on Earth. Also the only one left.", "Keep your blaster charged out there. In here, keep it holstered."] },
  { id: 'tully', name: 'Tully', role: 'Gunsmith', rig: 'civ', make: () => makeCivilian('#7a5a3c', '#3d3a36', '#d9a77a', '#3a2a1e', '#4a3a2c'), x: -4.6, z: 8, face: Math.PI / 2, shop: 'guns', guns: ['b1', 'b5', 'c10', 'r15', 'h20'], melee: ['cleaver', 'hook'], idle: ["If it shoots, I can make it shoot better.", "Scrap builds walls too. Press Build out past the city gate."] },
  { id: 'zib', name: 'Zib', role: 'General store · buys anything', rig: 'spearman', make: () => recolor(makeSpearman(), { '#7fae63': '#8a6fc4', '#4f7a3c': '#5d4a8a' }), x: 4.6, z: 8, face: -Math.PI / 2, shop: 'store', idle: ["Zib buys! Zib sells! Pelts, shells, crystals, all good.", "Rock cores from the mesa fetch a fine price."] },
  { id: 'mira', name: 'Doc Mira', role: 'Clinic', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#5a6a7a', '#c58a64', '#1e1a18', '#c8402f'), x: 4.6, z: -8, face: -Math.PI / 2, heal: true, idle: ["Hold still. There, good as new.", "Come back in one piece, please. Two pieces is a lot more paperwork."] },
  { id: 'nash', name: 'Old Nash', role: 'Bank', rig: 'civ', make: () => makeCivilian('#2e5a3a', '#2c2a28', '#e0b892', '#cfcac0'), x: -4.6, z: -8, face: Math.PI / 2, bank: true, idle: ["Credits in the bank don't get dropped when you go down.", "Safest vault on Earth. Probably."] },
  { id: 'elismas', name: 'Elismas', role: 'Master of the Gun', rig: 'elismas', make: makeElismas, x: -3.6, z: -3.4, face: 0.8, showIf: () => qDone('q3') || qState('q4'), idle: ["A true gunner never wastes a shot.", "The galaxy is wide. Your ship will carry you to the other Masters."] },
  { id: 'mayor', name: 'Mayor Holloway', role: 'Mayor of New Jamestown · town news', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#c58a64', '#cfcac0', '#c9a43a'), x: 0, z: -12.2, face: 0, custom: [['Town news', () => openUpdates(false)]], idle: ["New Jamestown! Named after the old one. Which was named after an older one. We're very traditional.", "Ask me for the town news. I have SO much news."] },
  { id: 'cookie', name: 'Cookie', role: 'Diner · heals', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#c8402f', '#8a5a3a', '#1e1a18', '#ffd36a'), x: -14, z: 3.6, face: Math.PI, heal: true, idle: ["Today's special: space meatloaf. Yesterday's special: also space meatloaf.", "Eat something. You look like you've been shot. Have you been shot?"] },
  { id: 'tailor', name: 'Ada the Tailor', role: 'Wardrobe · faces · capes', rig: 'civ', make: () => makeCivilian('#5d3a8a', '#2c2a28', '#e0b892', '#c8402f', '#c86aff'), x: -8.4, z: -12.3, face: 0.5, custom: [['Wardrobe', () => openWardrobe()]], idle: ["Armor is just clothing that argues with bullets.", "Let me guess: something dramatic with a cape. Always a cape."] },
  { id: 'paws', name: 'Auntie Paws', role: 'Pet shop', rig: 'civ', make: () => makeCivilian('#6fdc5a', '#3d3a36', '#c58a64', '#e8e4dc', '#ffd23a'), x: -14, z: -3.6, face: 0, petshop: true, idle: ["Every pet deserves a home. Some pets deserve a cage. That one bites."] },
  { id: 'gil', name: 'Gil', role: 'Fish market', rig: 'civ', make: () => makeCivilian('#2a5a7a', '#2c2a28', '#e0b892', '#5a3a22', '#ffb347'), x: 14, z: -3.6, face: 0, shop: 'fish', rods: [1, 2], idle: ["Bring me fish. Any fish. Even the angry ones."] },
  { id: 'scoop', name: 'Scoop', role: 'Newsie', rig: 'civ', make: () => makeCivilian('#c9a43a', '#3d3a36', '#d9a77a', '#5a3a22', '#c8402f'), x: 3.6, z: -3.4, face: -0.8, idle: ["EXTRA! EXTRA! Trooper saves Earth, still can't parallel park!", "EXTRA! Drome's robots spotted in the scrapyard! Again! Still!", "EXTRA! Mayor says everything is fine! Mayor seen hiding under desk!"] },
  { id: 'banjo', name: 'Banjo Bob', role: 'Street musician', rig: 'civ', make: () => makeCivilian('#8a3a2e', '#3d3a36', '#c58a64', '#cfcac0', '#c9a43a'), x: 3.6, z: 3.4, face: -2.4, idle: ["♪ Oh the sun is setting red, and the robots want me dead ♪", "Tips appreciated. Requests tolerated."] },
  { id: 'dent', name: 'Officer Dent', role: 'City watch', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#2a3756', '#c9b27c': '#ffd36a' }), x: -2.6, z: 16.5, face: 0, idle: ["No running in the plaza. No shooting in the plaza. No fun in the plaza, basically."] },
  { id: 'hank', name: 'Hotel Hank', role: 'Hotel · rest', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#e0b892', '#1e1a18', '#e8e4dc'), x: 14, z: 3.6, face: Math.PI, heal: true, idle: ["Rooms are free for heroes. Heroes are anyone who pays. Kidding. Mostly."] }
];
// rework the Earth level around a much bigger city: everything outside town is pushed outward by JT_K
{ const E0 = LEVELS.earth, T = (p) => ET(p[0], p[1]);
  E0.size = Math.round(280 * JT_K); E0.radius = Math.round(92 * JT_K); E0.center = T(E0.center); E0.tag = 'New Jamestown, the capital city';
  E0.zones = E0.zones.map(z => { if (z.id === 'town') return Object.assign({}, z, { name: 'New Jamestown', lvl: 'Safe · capital city', r: JT_R, fr: JT_R + 4 });
    const [x, zz] = T([z.x, z.z]), o = Object.assign({}, z, { x, z: zz, r: z.r * 1.25, fr: z.fr ? z.fr * 1.25 : z.fr }); if (z.id === 'out') { o.x = 0; o.z = TOWN.z + JT_R + 30; o.r = 20; } return o; });
  E0.safes = [{ x: TOWN.x, z: TOWN.z, r: JT_R - 1 }];
  const rv = E0.river.map(T); rv[1][0] -= 18; rv[2][0] -= 18; rv[3][0] -= 12; E0.river = rv;
  E0.paths = E0.paths.map((p, i) => i === 0 ? [[0, TOWN.z + JT_R], [0, T([0, 4])[1]]] : p.map(T));
  E0.pools = E0.pools.map(p => [...T(p), p[2] * 1.3]); E0.lava = E0.lava.map(p => [...T(p), p[2] * 1.3]);
  const oc = E0.carve; E0.carve = (x, z, h) => oc(TOWN.x + (x - TOWN.x) / JT_K, TOWN.z + (z - TOWN.z) / JT_K, h);
  E0.spawn = { x: TOWN.x + 1.5, z: TOWN.z + 36, yaw: 0 }; E0.pad = { x: TOWN.x + 28, z: TOWN.z - 30 };
  E0.menu = { x: TOWN.x, z: TOWN.z, r: 70, h: 30 };
  E0.npcs = JT_NPCS.map(n => { const o = EARTH_NPCS.find(q => q.id === n.id), p = JT_POS[n.id] || [n.x, n.z, n.face]; return Object.assign({}, o || n, { x: p[0], z: p[1], face: p[2], role: n.role, idle: n.idle }); });
}
function buildJamestown() {
  const tx = TOWN.x, tz = TOWN.z, G = (x, z) => groundH(tx + x, tz + z);
  // paved streets and plaza
  const pave = (w, d, x, z, col, top) => { const m = part(props, B(w, 0.3, d), toon(col, 'stone'), tx + x, G(x, z) + top - 0.15, tz + z); m.castShadow = false; };
  pave(10, JT_R * 2 - 2, 0, 0, '#9a9088', 0.09); pave(JT_R * 2 - 2, 8, 0, 0, '#948a82', 0.12); for (const s of [-1, 1]) { pave(2.2, JT_R * 2 - 4, 6.2 * s, 0, '#b8b0a4', 0.05); pave(JT_R * 2 - 4, 2, 0, 5.1 * s, '#b8b0a4', 0.06); }
  { const pl = new THREE.Mesh(new THREE.CircleGeometry(11, 32), toon('#b8a888', 'stone')); pl.rotation.x = -Math.PI / 2; pl.position.set(tx, G(0, 0) + 0.155, tz); props.add(pl); }
  for (let i = -4; i <= 4; i++) for (const zz of [12.5, -12.5]) part(props, B(0.7, 0.04, 2), '#efe7d6', tx + i * 1.1, G(0, zz) + 0.11, tz + zz); for (let i = -3; i <= 3; i++) for (const xx of [12.5, -12.5]) part(props, B(2, 0.04, 0.7), '#efe7d6', tx + xx, G(xx, 0) + 0.14, tz + i * 1.1);
  // city wall with a south gate and corner towers
  const N = 92; for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.09) continue; const x = Math.cos(a) * JT_R, z = Math.sin(a) * JT_R; part(props, B(3.1, 3.2, 0.7), toon('#a89a88', 'stone'), tx + x, G(x, z) + 1.6, tz + z, 0, -a + Math.PI / 2, 0); if (i % 11 === 5) { part(props, B(2, 5.4, 2), toon('#8a7a68', 'stone'), tx + x, G(x, z) + 2.7, tz + z); part(props, new THREE.ConeGeometry(1.6, 1.6, 4), '#5a3a22', tx + x, G(x, z) + 6.2, tz + z, 0, Math.PI / 4, 0); solid(tx + x, tz + z, 1.2); } }
  RINGS.push({ x: tx, z: tz, r: JT_R, gate: Math.PI / 2, half: 4.2, safe: true });
  { const gate = new THREE.Group(); for (const s of [-1, 1]) part(gate, B(1.8, 8, 1.8), toon('#8a7a68', 'stone'), 5 * s, 4, 0); part(gate, B(12, 1.4, 1.8), toon('#8a7a68', 'stone'), 0, 8.4, 0); const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.9), new THREE.MeshBasicMaterial({ map: signTex('NEW JAMESTOWN', '#1e1c22', '#ffd36a'), side: THREE.DoubleSide })); sg.position.set(0, 8.4, 0.95); sg.scale.set(1.5, 1.5, 1); gate.add(sg); at(gate, tx, tz + JT_R); solid(tx - 5, tz + JT_R, 1.1); solid(tx + 5, tz + JT_R, 1.1); }
  // buildings
  for (const [label, x, z, w, d, h, ry, col, trim, awn] of JT_BUILDINGS) { const b = makeJTBuilding(w, h, d, col, trim, label, awn); at(b, tx + x, tz + z, ry); const sw = Math.abs(Math.sin(ry)) > 0.7; box(tx + x, tz + z, (sw ? d : w) / 2 + 0.15, (sw ? w : d) / 2 + 0.15); }
  // town hall columns + flag
  for (let i = 0; i < 6; i++) { const x = -7 + i * 2.8; part(props, Cy(0.4, 0.45, 7, 8), '#e8e4dc', tx + x, G(x, -31.6) + 3.5, tz - 31.6); solid(tx + x, tz - 31.6, 0.45); } part(props, B(18, 0.8, 4), '#d8c8a8', tx, G(0, -32) + 7.3, tz - 32.5); part(props, B(18, 0.4, 5), toon('#9a9088', 'stone'), tx, G(0, -32) + 0.2, tz - 31.8);
  { const fl = new THREE.Group(); part(fl, Cy(0.06, 0.06, 6, 6), '#cfd3d8', 0, 3, 0); const cl = part(fl, B(1.8, 1.1, 0.04), toon('#3b4f7a', 'cloth'), 0.9, 5.4, 0); at(fl, tx + 12, tz - 29); levelAnims.push(t => { cl.rotation.y = Math.sin(t * 2) * 0.25; }); }
  // plaza statue: the trooper raising the logo sword
  { const st = new THREE.Group(); part(st, Cy(1.6, 1.9, 1.2, 10), toon('#9a9088', 'stone'), 0, 0.6, 0); part(st, B(0.9, 3.2, 0.9), toon('#c9c0b0', 'stone'), 0, 2.8, 0); part(st, new THREE.ConeGeometry(0.7, 1, 4), toon('#c9c0b0', 'stone'), 0, 4.9, 0, 0, Math.PI / 4, 0); part(st, new THREE.TorusGeometry(1.1, 0.12, 6, 20, Math.PI), glow('#ff9a3c'), 0, 4.6, 0); for (const s of [-1, 1]) part(st, B(0.12, 2.6, 0.04), '#cfd3d8', 0.55 * s, 4.4, 0.5, 0, 0, 0.6 * s); at(st, tx, tz); solid(tx, tz, 1.9);
    const water = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.8, 20), new THREE.MeshLambertMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.7 })); water.rotation.x = -Math.PI / 2; water.position.set(tx, G(0, 0) + 0.35, tz); props.add(water); part(props, new THREE.TorusGeometry(2.85, 0.15, 4, 24), toon('#9a9088', 'stone'), tx, G(0, 0) + 0.3, tz, Math.PI / 2); solid(tx, tz, 2.9); }
  // street lamps, benches, planters, parked hover cars
  const lampAt = (x, z) => { part(props, Cy(0.08, 0.1, 4, 6), '#2b2a2c', tx + x, G(x, z) + 2, tz + z); part(props, B(0.8, 0.08, 0.08), '#2b2a2c', tx + x + 0.4, G(x, z) + 3.9, tz + z); part(props, B(0.4, 0.35, 0.4), glow('#ffe0a0'), tx + x + 0.75, G(x, z) + 3.7, tz + z); solid(tx + x, tz + z, 0.15); };
  for (let z = -26; z <= 38; z += 9) if (Math.abs(z) > 12) for (const s of [-1, 1]) lampAt(7.6 * s, z);
  for (let x = -38; x <= 38; x += 9) if (Math.abs(x) > 12) for (const s of [-1, 1]) lampAt(x, 6.5 * s);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.39, x = Math.cos(a) * 9, z = Math.sin(a) * 9, b = new THREE.Group(); part(b, B(1.8, 0.1, 0.5), toon('#8a6a44', 'wood'), 0, 0.5, 0); part(b, B(1.8, 0.5, 0.08), toon('#8a6a44', 'wood'), 0, 0.8, -0.22); for (const s of [-1, 1]) part(b, B(0.08, 0.5, 0.45), '#2b2a2c', 0.8 * s, 0.25, 0); at(b, tx + x, tz + z, Math.atan2(-x, -z)); solid(tx + x, tz + z, 0.5); }
  for (let z = -24; z <= 36; z += 12) if (Math.abs(z) > 14) for (const s of [-1, 1]) { const x = 5.2 * s; part(props, Cy(0.15, 0.2, 2.6, 5), toon('#5a3a22', 'wood'), tx + x, G(x, z) + 1.3, tz + z); E(props, toon('#4f8a3a', 'leaves'), tx + x, G(x, z) + 3, tz + z, 1.1, 1.2, 1.1); solid(tx + x, tz + z, 0.3); }
  // the park: a pond, trees, benches and a gazebo in the south-west
  { const px = -30, pz = 24; const pond = new THREE.Mesh(new THREE.CircleGeometry(4.5, 20), new THREE.MeshLambertMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.8 })); pond.rotation.x = -Math.PI / 2; pond.position.set(tx + px, G(px, pz) + 0.08, tz + pz); props.add(pond); solid(tx + px, tz + pz, 4.4);
    for (let i = 0; i < 10; i++) { const a = i * 0.63, x = px + Math.cos(a) * 8.5, z = pz + Math.sin(a) * 7; part(props, Cy(0.25, 0.35, 3.2, 6), toon('#5a3a22', 'wood'), tx + x, G(x, z) + 1.6, tz + z); E(props, toon(i % 2 ? '#3f8a2f' : '#5aa04a', 'leaves'), tx + x, G(x, z) + 3.8, tz + z, 1.8, 1.5, 1.8); solid(tx + x, tz + z, 0.4); }
    const gz = new THREE.Group(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; part(gz, Cy(0.1, 0.1, 2.6, 5), '#e8e4dc', Math.cos(a) * 2, 1.3, Math.sin(a) * 2); } part(gz, new THREE.ConeGeometry(2.8, 1.4, 6), toon('#c8402f', 'cloth'), 0, 3.2, 0); part(gz, Cy(2.2, 2.2, 0.2, 6), toon('#9a9088', 'stone'), 0, 0.1, 0); at(gz, tx - 20, tz + 30); solid(tx - 20, tz + 30, 0.6); }
  if (typeof makeHoverCar === 'function') for (const [x, z, ry, c, st] of [[-20, 4.6, 0, '#c8402f', 'muscle'], [20, -4.6, Math.PI, '#4fd2ff', 'wedge'], [24, 4.6, 0, '#ffd36a', 'bubble'], [-32, -4.6, Math.PI, '#6fdc5a', 'jet'], [3.4, 24, Math.PI / 2, '#ff6aa8', 'manta'], [-3.4, -22, -Math.PI / 2, '#e8e4dc', 'phantom'], [34, 4.6, 0, '#8a6fc4', 'buggy']]) { const car = makeHoverCar(c, st); at(car, tx + x, tz + z, ry + Math.PI / 2, 0.3); solid(tx + x, tz + z, 1.4); }
  // the airport pad (from the Earth sketch) in the north-east
  dropshipPad(E_PAD().x, E_PAD().z, 0, shipUnlocked() ? 'Board your ship' : 'Dropship pad (locked until you earn a ship)');
  // crowd: citizens walking loops around the streets
  const ppl = [], sts = [], C0 = [['#c8402f', '#e0b892'], ['#3b4f7a', '#8a5a3a'], ['#5a6a3a', '#c58a64'], ['#8a6fc4', '#e0b892'], ['#c9a43a', '#5a3a24'], ['#2a5a7a', '#d9a77a'], ['#e8e4dc', '#8a5a3a'], ['#6fdc5a', '#e0b892'], ['#ff9a3c', '#c58a64'], ['#5d636c', '#e0b892']];
  for (let i = 0; i < 10; i++) { const [sh, sk] = C0[i], o = buildChar(() => makeCivilian(sh, '#2c2a28', sk, ['#1e1a18', '#5a3a22', '#c9a43a', '#cfcac0'][i % 4]), 'civ'); blob(o, 0.4); levelGroup.add(o); ppl.push(o); sts.push({}); MOVERS.push([o, 0.4]); }
  levelAnims.push(t => ppl.forEach((o, i) => { let x, z, yaw; const sp = 0.9 + (i % 3) * 0.25, L = 30;
    if (i < 4) { const s = ((t * sp + i * 9) % (L * 2)), fwd = s < L, k = fwd ? s : L * 2 - s; x = (i % 2 ? 6.4 : -6.4); z = -26 + k * 2.1; yaw = fwd ? Math.PI : 0; }
    else if (i < 8) { const s = ((t * sp + i * 7) % (L * 2)), fwd = s < L, k = fwd ? s : L * 2 - s; z = (i % 2 ? 5.2 : -5.2); x = -38 + k * 2.5; yaw = fwd ? -Math.PI / 2 : Math.PI / 2; }
    else { const a = t * 0.12 * (i % 2 ? 1 : -1) + i; x = Math.cos(a) * 12.5; z = Math.sin(a) * 12.5; yaw = Math.atan2(-Math.sin(a), Math.cos(a)) * (i % 2 ? 1 : -1) + (i % 2 ? 0 : Math.PI); }
    o.position.set(tx + x, G(x, z), tz + z); o.rotation.y = yaw + Math.PI; animRig(o, sts[i], 1 / 60, t); }));
}
const E_PAD = () => LEVELS.earth.pad;
