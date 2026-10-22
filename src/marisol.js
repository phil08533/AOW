// =================== MARISOL (2.22.48): her flat in 4B, a companion, a hazy night in, and real doors at Coral Heights ===================
const MARI = { x: 150, z: 100, W: 8, L: 9, npc: null };
// a proper panel door: frame, raised panels, a peephole, brass handle and kick plate, an optional number plate. Front faces +z before ry.
function bcDoor(par, x, y, z, ry, col, num, w, h) { w = w || 1.1; h = h || 2.2; const g = new THREE.Group(), wood = toonNS(col, 'wood'), dk = toonNS('#2b2420'), brass = toonNS('#c9a43a');
  part(g, B(w + 0.24, h + 0.12, 0.1), dk, 0, h / 2 + 0.06, -0.02); part(g, B(w, h, 0.08), wood, 0, h / 2, 0.02);
  for (const [py, ph] of [[h * 0.72, h * 0.34], [h * 0.3, h * 0.34]]) for (const s of [-1, 1]) { part(g, B(w * 0.36, ph, 0.03), toonNS(new THREE.Color(col).multiplyScalar(0.8).getStyle()), s * w * 0.22, py, 0.07); part(g, B(w * 0.3, ph - 0.08, 0.02), wood, s * w * 0.22, py, 0.09); }
  part(g, Cy(0.035, 0.035, 0.03, 8), brass, 0, h * 0.84, 0.08).rotation.x = Math.PI / 2;
  part(g, new THREE.SphereGeometry(0.06, 8, 6), brass, w * 0.38, h * 0.47, 0.11); part(g, B(0.05, 0.22, 0.03), brass, w * 0.38, h * 0.47, 0.07);
  part(g, B(w * 0.9, 0.2, 0.02), brass, 0, 0.12, 0.07);
  if (num) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshBasicMaterial({ map: bubSignTex(num, '#c9a43a', '#2b2420', 0.34, 0.16) })); m.position.set(0, h * 0.95, 0.07); g.add(m); }
  g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g; }

// --- the Coral Heights doors: swap the plain slabs for real doors ---
{ const _b = LEVELS.bubblecity.build; LEVELS.bubblecity.build = function () { const r = _b.apply(this, arguments); try { mariDoors(); mariFlat(); } catch (e) { console.warn('marisol', e); } return r; }; }
function mariDoors() { const X = BAX, Z = BAZ;
  // hide the old flat slabs (thin boxes 0.1 wide and 2.3 tall on the hall walls, and the 4x3 street-side slab)
  levelGroup.traverse(m => { if (!m.isMesh || !m.geometry.parameters) return; const p = m.geometry.parameters, wp = m.getWorldPosition(new THREE.Vector3());
    if (p.width === 0.1 && p.height === 2.3 && p.depth === 1.2 && Math.abs(wp.x - X) < BAW && Math.abs(wp.z - Z) < BAL) m.visible = false;
    if (p.width === 4 && p.height === 3 && p.depth === 0.2) m.visible = false;
    if (p.width === 1.6 && p.height === 2.4 && p.depth === 0.12 && Math.abs(wp.x - X) < 1 && wp.z > Z) m.parent.visible = false; });
  levelGroup.traverse(m => { if (m.isMesh && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.radius === 0.06 && Math.abs(m.position.x - X) > BAW / 2 - 0.3 && Math.abs(m.position.x - X) < BAW / 2 && Math.abs(m.position.z - Z) < BAL / 2) m.visible = false; });
  const plates = [];
  [['A', -1, -5], ['B', -1, 4], ['C', 1, -5], ['D', 1, 4]].forEach(([k, s, dz], i) => { const d = bcDoor(levelGroup, X + s * (BAW / 2 - 0.02), 0, Z + dz, -s * Math.PI / 2, ['#6a3a2a', '#3a4a6a', '#4a5a3a', '#6a5a2a'][i], null); plates.push([d, k]);
    const mat = part(levelGroup, B(0.9, 0.03, 1.2), toonNS('#5a3a2a'), X + s * (BAW / 2 - 0.6), 0.11, Z + dz); mat.visible = true;
    const lamp = part(levelGroup, new THREE.SphereGeometry(0.12, 8, 6), glow('#ffe0a0'), X + s * (BAW / 2 - 0.1), 2.55, Z + dz + 0.85); });
  // number plates redraw per floor
  const np = plates.map(([d, k]) => { const cv = document.createElement('canvas'); cv.width = 96; cv.height = 48; const t = new THREE.CanvasTexture(cv), m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshBasicMaterial({ map: t })); m.position.set(0, 2.08, 0.07); d.add(m); return [cv, t, k]; });
  const _l = BUB.lbl; BUB.lbl = () => { _l && _l(); for (const [cv, t, k] of np) { const c = cv.getContext('2d'); c.fillStyle = '#c9a43a'; c.fillRect(0, 0, 96, 48); c.fillStyle = '#2b2420'; c.font = 'bold 30px monospace'; c.textAlign = 'center'; c.fillText(BUB.floor + k, 48, 36); t.needsUpdate = true; } }; BUB.lbl();
  // lobby street door: glass double door
  const sd = new THREE.Group(); sd.position.set(X, 0, Z + BAL / 2 - 0.05); sd.rotation.y = Math.PI; levelGroup.add(sd); mariGlassDoors(sd);
  const _l2 = BUB.lbl; BUB.lbl = () => { _l2(); sd.visible = BUB.floor === 1; }; BUB.lbl();
  // the building's front entrance: glass double doors with frame, step and intercom
  const ex = BUB.towerExit[0], ez = BUB.towerExit[1] + 2.4 - 0.12; const fe = new THREE.Group(); fe.position.set(ex, 0, ez); fe.rotation.y = Math.PI; levelGroup.add(fe); mariGlassDoors(fe, 1);
}
function mariGlassDoors(g, outside) { const frame = toonNS('#2b2a2c'), brass = toonNS('#c9a43a'), glass = new THREE.MeshLambertMaterial({ color: '#9fd8ea', transparent: true, opacity: 0.45 });
  part(g, B(2.6, 0.12, 0.14), frame, 0, 2.5, 0); for (const s of [-1, 0, 1]) part(g, B(0.1, 2.5, 0.14), frame, s * 1.25, 1.25, 0);
  for (const s of [-1, 1]) { part(g, B(1.1, 2.3, 0.04), glass, s * 0.62, 1.2, 0); part(g, B(1.15, 0.12, 0.08), frame, s * 0.62, 0.08, 0); part(g, Cy(0.03, 0.03, 0.9, 6), brass, s * 0.15, 1.15, 0.1); }
  part(g, B(2.6, 0.5, 0.06), new THREE.MeshLambertMaterial({ color: '#9fd8ea', transparent: true, opacity: 0.35 }), 0, 2.85, 0);
  if (outside) { part(g, B(3.4, 0.12, 1.2), toonNS('#9a9088'), 0, 0.06, 0.6); part(g, B(0.3, 0.45, 0.08), toonNS('#5d636c'), 1.6, 1.3, 0.06); for (let i = 0; i < 6; i++) part(g, B(0.05, 0.05, 0.02), glow('#ffd36a'), 1.55 + (i % 2) * 0.1, 1.42 - (i >> 1) * 0.08, 0.11);
    for (const s of [-1, 1]) part(g, new THREE.SphereGeometry(0.16, 8, 6), glow('#ffe0a0'), s * 1.6, 2.4, 0.2); } }

// --- Marisol's flat, 4B ---
function mariFlat() { const X = MARI.x, Z = MARI.z, W = MARI.W, L = MARI.L, g = levelGroup, wall = bcMat('wallpaper', 3, 2, '#f0c8d8');
  part(g, B(W, 0.1, L), bcMat('wood', 4, 5, '#a8784a'), X, 0.05, Z); part(g, B(W, 0.1, L), toonNS('#f0e0e8'), X, 3.2, Z);
  for (const s of [-1, 1]) { part(g, B(0.2, 3.2, L), wall, X + s * (W / 2 + 0.1), 1.6, Z); box(X + s * (W / 2 + 0.3), Z, 0.3, L / 2); part(g, B(W, 3.2, 0.2), wall, X, 1.6, Z + s * (L / 2 + 0.1)); box(X, Z + s * (L / 2 + 0.3), W / 2, 0.3); }
  for (const [lx, lz, c] of [[-2, -2, '#ffd0e0'], [2, 1, '#ffe0c0'], [0, 3, '#e0d0ff']]) { const pl = new THREE.PointLight(c, 1.3, 10); pl.position.set(X + lx, 2.9, Z + lz); g.add(pl); }
  // string lights along the top of the walls
  for (let i = 0; i < 18; i++) { const a = i / 18, s = i % 2 ? -1 : 1; part(g, new THREE.SphereGeometry(0.06, 6, 4), glow(['#ff6ab0', '#ffd36a', '#7fe8ff', '#9aff6a'][i % 4]), X + s * (W / 2 - 0.05), 2.9 - Math.sin(a * 40) * 0.08, Z - L / 2 + a * L * 2 % L); }
  // rug, couch facing the TV wall (east), coffee table with lava lamp
  part(g, Cy(1.7, 1.7, 0.03, 20), toonNS('#e86aa0'), X, 0.11, Z + 0.5); part(g, Cy(1.3, 1.3, 0.035, 20), toonNS('#f4c0d8'), X, 0.12, Z + 0.5);
  part(g, B(1.0, 0.45, 2.6), toonNS('#7a4ac0'), X - 1.6, 0.35, Z + 0.5); part(g, B(0.3, 0.6, 2.6), toonNS('#6a3ab0'), X - 2.05, 0.85, Z + 0.5); for (const s of [-1, 1]) part(g, B(1.0, 0.35, 0.25), toonNS('#6a3ab0'), X - 1.6, 0.75, Z + 0.5 + s * 1.3);
  for (const s of [-1, 1]) part(g, B(0.4, 0.35, 0.12), toonNS(s > 0 ? '#ffd36a' : '#7fe8ff'), X - 1.75, 0.75, Z + 0.5 + s * 0.6).rotation.z = 0.3; box(X - 1.7, Z + 0.5, 0.6, 1.4);
  part(g, B(0.9, 0.4, 1.4), toonNS('#6a4f34', 'wood'), X + 0.1, 0.3, Z + 0.5); box(X + 0.1, Z + 0.5, 0.5, 0.75);
  part(g, Cy(0.08, 0.12, 0.1, 8), toonNS('#c9a43a'), X + 0.1, 0.55, Z + 0.1); const lava = part(g, Cy(0.06, 0.1, 0.35, 10), glow('#ff6a3a'), X + 0.1, 0.78, Z + 0.1); part(g, Cy(0.03, 0.06, 0.08, 8), toonNS('#c9a43a'), X + 0.1, 0.99, Z + 0.1);
  for (let i = 0; i < 3; i++) part(g, Cy(0.05, 0.05, 0.12, 8), toonNS(['#c8402f', '#e8e4dc', '#4f9a4a'][i]), X + 0.3 - i * 0.14, 0.56, Z + 0.8 + i * 0.1);
  // TV on the east wall
  part(g, B(0.1, 1.2, 2.0), toonNS('#1a1418'), X + W / 2 - 0.06, 1.6, Z + 0.5); const tv = part(g, B(0.02, 1.05, 1.85), glow('#3a6ad0'), X + W / 2 - 0.12, 1.6, Z + 0.5); part(g, B(0.5, 0.5, 1.8), toonNS('#3a2a20', 'wood'), X + W / 2 - 0.3, 0.25, Z + 0.5); box(X + W / 2 - 0.3, Z + 0.5, 0.3, 0.95);
  // kitchenette along the north wall: counter, sink, fridge with magnets, kettle
  part(g, B(3.6, 0.95, 0.7), toonNS('#e8e4dc'), X + 1.2, 0.48, Z - L / 2 + 0.45); part(g, B(3.7, 0.06, 0.8), toonNS('#4a5a6a'), X + 1.2, 0.98, Z - L / 2 + 0.45); part(g, B(0.6, 0.04, 0.45), toonNS('#9aa1aa'), X + 0.6, 1.0, Z - L / 2 + 0.45); box(X + 1.2, Z - L / 2 + 0.45, 1.85, 0.4);
  part(g, B(0.9, 2.0, 0.8), toonNS('#bfefff'), X + 3.4, 1.0, Z - L / 2 + 0.5); for (let i = 0; i < 4; i++) part(g, B(0.08, 0.08, 0.02), toonNS(['#c8402f', '#ffd36a', '#4f9a4a', '#e86aa0'][i]), X + 3.2 + (i % 2) * 0.3, 1.3 + (i >> 1) * 0.3, Z - L / 2 + 0.92); box(X + 3.4, Z - L / 2 + 0.5, 0.45, 0.45);
  part(g, Cy(0.1, 0.12, 0.2, 10), toonNS('#c8402f'), X + 1.9, 1.11, Z - L / 2 + 0.45);
  // bed in the north-west corner with a messy blanket and plushies
  part(g, B(1.8, 0.45, 2.4), toonNS('#6a4f34', 'wood'), X - W / 2 + 1.0, 0.25, Z - L / 2 + 1.3); part(g, B(1.7, 0.2, 2.3), toonNS('#f4e0e8'), X - W / 2 + 1.0, 0.55, Z - L / 2 + 1.3); part(g, B(1.75, 0.12, 1.5), toonNS('#e86aa0'), X - W / 2 + 1.0, 0.7, Z - L / 2 + 1.7).rotation.x = 0.04;
  part(g, B(1.6, 0.18, 0.4), toonNS('#ffffff'), X - W / 2 + 1.0, 0.75, Z - L / 2 + 0.35); part(g, new THREE.SphereGeometry(0.18, 8, 6), toonNS('#d8a060'), X - W / 2 + 0.5, 0.85, Z - L / 2 + 0.6); box(X - W / 2 + 1.0, Z - L / 2 + 1.3, 0.95, 1.25);
  // Peanut's cage with a spinning wheel, on a little table by the door
  const cx = X + W / 2 - 1.0, cz = Z + L / 2 - 1.3; part(g, B(1.2, 0.7, 0.8), toonNS('#6a4f34', 'wood'), cx, 0.35, cz); box(cx, cz, 0.65, 0.45);
  for (let i = 0; i < 9; i++) part(g, Cy(0.01, 0.01, 0.6, 4), toonNS('#c9a43a'), cx - 0.5 + i * 0.125, 1.0, cz - 0.3); for (let i = 0; i < 9; i++) part(g, Cy(0.01, 0.01, 0.6, 4), toonNS('#c9a43a'), cx - 0.5 + i * 0.125, 1.0, cz + 0.3);
  part(g, B(1.05, 0.03, 0.65), toonNS('#c9a43a'), cx, 1.3, cz); part(g, B(1.0, 0.06, 0.6), toonNS('#f4e0a0'), cx, 0.73, cz);
  const wh = new THREE.Group(); wh.position.set(cx + 0.25, 0.98, cz); g.add(wh); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 16), toonNS('#7fe8ff')); wh.add(ring); for (let i = 0; i < 6; i++) { const sp = part(wh, B(0.02, 0.44, 0.02), toonNS('#7fe8ff'), 0, 0, 0); sp.rotation.z = i * Math.PI / 6; }
  const pea = bubHamster(); pea.scale.setScalar(0.9); pea.position.set(cx + 0.25, 0.77, cz); g.add(pea);
  levelAnims.push(t => { wh.rotation.z = -t * 6; pea.position.y = 0.77 + Math.abs(Math.sin(t * 12)) * 0.03; lava.material.color.setHSL(0.02 + Math.sin(t * 0.7) * 0.03, 1, 0.55); tv.material.color.setHSL(0.6 + Math.sin(t * 1.3) * 0.08, 0.6, 0.45 + Math.sin(t * 5) * 0.05); });
  INTERACTS.push({ x: cx - 0.2, z: cz - 0.9, r: 1.3, label: '🐹 Say hi to Peanut', fn: () => { SFX.yip && SFX.yip(); toast('PEANUT', ['He runs faster when you watch.', 'He stops, stares, and keeps running.', 'He has a tiny seed. He is not sharing.'][Math.random() * 3 | 0], 2); } });
  // plants, posters, a porthole window, bookshelf
  for (const [px, pz] of [[X - W / 2 + 0.5, Z + L / 2 - 0.5], [X + 2.4, Z - L / 2 + 0.5]]) { part(g, Cy(0.25, 0.2, 0.45, 10), toonNS('#e8e4dc'), px, 0.33, pz); for (let j = 0; j < 7; j++) part(g, new THREE.SphereGeometry(0.2, 7, 5), toonNS(j % 2 ? '#3f8a3a' : '#2e6a2e'), px + Math.cos(j) * 0.16, 0.7 + (j % 3) * 0.2, pz + Math.sin(j) * 0.16); solid(px, pz, 0.32); }
  for (const [pz, c] of [[-0.6, '#7fe8ff'], [1.6, '#ffd36a']]) { part(g, B(0.04, 0.9, 0.65), toonNS(c), X - W / 2 + 0.06, 1.9, Z + pz); part(g, B(0.05, 0.98, 0.73), toonNS('#1a1418'), X - W / 2 + 0.04, 1.9, Z + pz); }
  part(g, new THREE.TorusGeometry(0.55, 0.07, 6, 18), toonNS('#c9a43a'), X - 1.2, 1.8, Z - L / 2 + 0.02); part(g, new THREE.CircleGeometry(0.52, 18), glow('#2a6a9a'), X - 1.2, 1.8, Z - L / 2 + 0.01);
  part(g, B(0.4, 1.8, 1.2), toonNS('#6a4f34', 'wood'), X - W / 2 + 0.25, 0.9, Z + 3.0); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) part(g, B(0.25, 0.3, 0.12), toonNS(['#c8402f', '#3a6ad0', '#e8c040', '#4f9a4a', '#e86aa0'][(i + j) % 5]), X - W / 2 + 0.3, 0.3 + i * 0.42, Z + 2.55 + j * 0.22); box(X - W / 2 + 0.25, Z + 3, 0.25, 0.6);
  // the door back to the hallway
  bcDoor(g, X, 0, Z + L / 2 - 0.02, Math.PI, '#3a4a6a', '4B'); INTERACTS.push({ x: X, z: Z + L / 2 - 1.1, r: 1.5, label: '🚪 Back to the hallway', fn: () => bubFade('Coral Heights', () => { BUB.floor = 4; BUB.lbl && BUB.lbl(); player.pos.set(BAX - BAW / 2 + 1.2, 0, BAZ + 4); player.yaw = -Math.PI / 2; }) });
  // Marisol herself, by the kitchen (she steps out when she is travelling with you)
  MARI.npc = buildChar(() => makeCivilian(...MARI_C), 'civ'); MARI.npc.position.set(X + 1.0, 0, Z - L / 2 + 1.5); g.add(MARI.npc); solid(X + 1.0, Z - L / 2 + 1.5, 0.4); const nx = MARI.npc.position;
    INTERACTS.push({ x: nx.x, z: nx.z + 1.0, r: 1.8, label: '💬 Talk to Marisol', fn: mariTalk }); }
const MARI_C = ['#e86aa0', '#3a3440', '#e8c09a', '#7a3ac0'];

// Peanut returned: now you get invited in
bubMarisol = function () { const s = bubS();
  if (s.ham === 1) return bubTalk('Coral Heights · 4B', 'Marisol Puddleby', ['PEANUT! Oh my gosh, you found Peanut! He\'s been gone for two days. He takes himself on walks. He\'s very independent.', 'You\'re a hero. Here, I have 500 credits in a sock. Take the sock too.', 'Come in, come in! Don\'t mind the mess. I wasn\'t expecting a hero today.'], () => {
    s.ham = 2; S.cr += 500; markDirty(); SFX.quest(); toast('PEANUT IS HOME', '+500 cr · Marisol invited you in', 2.6); mariIn(); });
  if (s.ham === 2) { openDlg('Coral Heights · 4B', 'Marisol Puddleby'); $('dlgLine').textContent = '"Oh hey, you! Peanut says hi. Come in!"'; return acts([['Go inside', () => { closeDlg(); mariIn(); }, true], ['Not now', closeDlg]]); }
  bubTalk('Coral Heights · 4B', 'Marisol Puddleby', ['Have you seen a hamster? Tiny? Even for here? Called Peanut? He likes the coral park. No? Okay. *closes door sadly*']); };
function mariIn() { SFX.door && SFX.door(); bubFade('Marisol\'s place · 4B', () => { player.pos.set(MARI.x, 0, MARI.z + MARI.L / 2 - 1.6); player.yaw = 0; player.vy = 0; }); }
function mariTalk() { const s = bubS();
  openDlg('Coral Heights · 4B', 'Marisol Puddleby');
  $('dlgLine').textContent = ['"So what do you actually DO? Like, for a job? Is it the shooting? It\'s the shooting, isn\'t it."', '"Peanut likes you. He bit you, which means he likes you."', '"I\'ve never been outside the dome. Is space big? It looks big."'][(s.night || 0) % 3];
  acts([['Ask her to sell for you', mariJoin, true], ['Get high together', mariHaze], ['Stay the night', () => { closeDlg(); bubStayOver(true); }], ['Leave', closeDlg]]); }
function mariJoin() { const C = crewS(), m = C.dealer, on = m && m.mari;
  if (on) { $('dlgLine').textContent = '"I\'m already slinging for you, boss. Your Lab, your shelf, my charm. Pays better than the fish counter."'; return acts([['Good', closeDlg, true]]); }
  const used = Object.keys(C).filter(k => C[k]).length;
  if (!m && used >= crewSlots()) { $('dlgLine').textContent = '"I\'d love to, but your crew\'s full. Free up a spot and I\'m yours."'; return acts([['Okay', closeDlg, true]]); }
  $('dlgLine').textContent = (m ? `"Sell for you? On your ship? I'd be better than ${m.name}, for sure."` : '"Sell for you? Like... the colourful stuff? On your ship?"') + ' *grabs a jacket* "Peanut can mind the flat. I know EVERYONE down here. They\'ll buy anything from me."';
  acts([[m ? `Hire her (replaces ${m.name})` : 'Hire her as your Dealer', () => {
    CREW_LOOKS.push(MARI_LOOK); C.dealer = crewFix({ name: 'Marisol Puddleby', skill: 3, t: Date.now(), trait: 'loyal', look: CREW_LOOKS.length - 1, loy: 100, mari: 1 }); crewNote(C.dealer, 'Joined the crew. Brought snacks.');
    markDirty(); SFX.quest(); toast('MARISOL JOINED YOUR CREW', 'She works your ship\'s Lab as your Dealer: takes doses off the shelf and sells them for you.', 4); log('Marisol is your Dealer now. Find her in the Lab on your ship.', 'loot'); closeDlg(); }, true], ['Not yet', closeDlg]]); }
const MARI_LOOK = ['#e86aa0', '#3a3440', '#e8c09a', '#7a3ac0', '#ff6ab0'];
// her look survives reloads: the look index points at her colours
{ const _f = crewFix; crewFix = function (m) { if (m && m.mari) { if (!CREW_LOOKS.includes(MARI_LOOK)) CREW_LOOKS.push(MARI_LOOK); m.look = CREW_LOOKS.indexOf(MARI_LOOK); } return _f(m); }; }
// she no longer tags along: anyone who had her as a following companion gets her as a Dealer instead
setTimeout(() => { try { if (S.pet === 'marisol') S.pet = null; if (S.pets && S.pets.includes('marisol')) { S.pets = S.pets.filter(p => p !== 'marisol'); const C = crewS(); if (!C.dealer) { CREW_LOOKS.push(MARI_LOOK); C.dealer = crewFix({ name: 'Marisol Puddleby', skill: 3, t: Date.now(), trait: 'loyal', look: CREW_LOOKS.length - 1, loy: 100, mari: 1 }); } markDirty(); } } catch (e) {} }, 3000);

// --- the hazy night in: a rainbow cutscene, then morning ---
function mariHaze() { closeDlg(); const X = MARI.x, Z = MARI.z;
  bubFade('…', () => { player.pos.set(X - 1.55, 0, Z + 1.1); player.yaw = -Math.PI / 2 + 1.0; player.pitch = -0.1; player.vy = 0; MARI.npc.position.set(X - 1.0, 0, Z - 0.7); MARI.npc.rotation.y = Math.PI * 0.75; MARI.haze = { t: 0 }; mariHazeFx(true); }, () => {
    const lines = ['Marisol lights something that smells like burnt candy.', '"Okay. Okay. Is the TV breathing? The TV is breathing."', 'The walls go soft. The colours start talking.', '"Peanut is SO wise. Look at him. He knows things."', 'You laugh at nothing for a very long time.'];
    lines.forEach((l, i) => setTimeout(() => toast(i % 2 ? 'MARISOL' : '~ ~ ~', l, 2.3), i * 2400));
    setTimeout(() => bubFade('…morning.', () => { mariHazeFx(false); MARI.haze = null; MARI.npc.position.set(X + 1.0, 0, Z - MARI.L / 2 + 1.5); MARI.npc.rotation.y = 0; bubNight(false); player.hp = maxHp(); bubS().night = (bubS().night || 0) + 1; if (typeof subsOn === 'function' && subsOn()) buffs().sub_neondust = Date.now() + 120000; markDirty(); }, () => toast('GOOD MORNING', 'Full health. Your head is foggy. Marisol is asleep on the rug. Peanut is judging you.', 3.4), 1600), lines.length * 2400 + 600); }, 900); }
function mariHazeFx(on) { let o = document.getElementById('mariHaze');
  if (!on) { if (o) o.remove(); if (typeof vm !== 'undefined') vm.visible = true; if (MARI.fx) { levelGroup.remove(MARI.fx); MARI.fx = null; } return; }
  if (!o) { o = document.createElement('div'); o.id = 'mariHaze'; o.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40;mix-blend-mode:screen;opacity:.6;background:radial-gradient(circle at 30% 40%,#ff3a8a88,transparent 45%),radial-gradient(circle at 70% 60%,#3affd088,transparent 45%),radial-gradient(circle at 50% 20%,#ffd33a88,transparent 40%),radial-gradient(circle at 40% 80%,#7a3aff88,transparent 45%);animation:mariHz 6s linear infinite;filter:blur(18px)';
    if (!document.getElementById('mariHzK')) { const st = document.createElement('style'); st.id = 'mariHzK'; st.textContent = '@keyframes mariHz{0%{filter:blur(18px) hue-rotate(0deg);transform:scale(1)}50%{transform:scale(1.15) rotate(4deg)}100%{filter:blur(18px) hue-rotate(360deg);transform:scale(1)}}'; document.head.appendChild(st); }
    document.body.appendChild(o); }
  // drifting rainbow smoke puffs and colour-cycling lights in the room
  const g = new THREE.Group(), puffs = [], lights = []; for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.25 + Math.random() * 0.35, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false })); m.position.set(MARI.x + (Math.random() - 0.5) * 7, 0.5 + Math.random() * 2.5, MARI.z + (Math.random() - 0.5) * 8); m.userData.p = Math.random() * 6; g.add(m); puffs.push(m); }
  for (let i = 0; i < 3; i++) { const l = new THREE.PointLight('#ff00ff', 2, 9); l.position.set(MARI.x + (i - 1) * 2.5, 2.2, MARI.z); g.add(l); lights.push(l); }
  levelGroup.add(g); MARI.fx = g;
  levelAnims.push(t => { if (MARI.fx !== g) return; for (const m of puffs) { const p = m.userData.p; m.material.color.setHSL((t * 0.15 + p) % 1, 1, 0.6); m.position.y += Math.sin(t + p) * 0.004; m.position.x += Math.cos(t * 0.5 + p) * 0.004; m.scale.setScalar(1 + Math.sin(t * 2 + p) * 0.25); }
    lights.forEach((l, i) => l.color.setHSL((t * 0.2 + i / 3) % 1, 1, 0.5)); if (MARI.haze) { player.pos.set(MARI.x - 1.55, 0, MARI.z + 1.1); player.vy = 0; player.yaw = -Math.PI / 2 + 1.0 + Math.sin(t * 0.6) * 0.15; if (typeof vm !== 'undefined') vm.visible = false; } }); }
