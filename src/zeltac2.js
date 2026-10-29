// =================== THE ZELTAC SHIP: 9 floors, by elevator ===================
const ZTHEMES = {
  market: { name: 'Market Deck', col: '#c9a43a', floor: '#5a4a3a', neon: '#ffd36a', safe: true },
  homes: { name: 'Residential Ring', col: '#6a8aa8', floor: '#4f545c', neon: '#8fe3ff', safe: true },
  hydro: { name: 'Hydroponics Bay', col: '#4f8a3a', floor: '#3a4a3a', neon: '#7fff6a', safe: true },
  engine: { name: 'Engine Deck', col: '#8a4a2a', floor: '#3a3430', neon: '#ff8a2a', safe: false },
  arcade: { name: 'Neon Arcade', col: '#8a3a8a', floor: '#2a1e2e', neon: '#ff6aa8', safe: true },
  aliens: { name: 'Alien Quarter', col: '#7a2a2a', floor: '#3a2a2a', neon: '#ff3b2a', safe: false }
};
ZTHEMES.bar = { name: 'Starlight Lounge', col: '#5a2a4a', floor: '#2a1a24', neon: '#ff6aa8', safe: true };
// each working deck has its own floor, walls, ceiling and height (2.23.70) so no two neighbours feel the same
const ZDECK = {
  market: { H: 5.5, floor: ['#6a5a48', 'stone'], wall: ['#7a4a34', 'brick'], ceil: ['#3a2a1e', 'wood'] },
  hydro: { H: 6, floor: ['#2a4a3a', 'panel'], wall: ['#4a6a5a', 'hull'], ceil: ['#1e2a24', 'panel'] },
  engine: { H: 7, floor: ['#3a3430', 'panel'], wall: ['#5a5048', 'hull'], ceil: ['#24201c', 'hull'] },
  aliens: { H: 6, floor: ['#4a3a2a', 'stone'], wall: ['#5a4a3a', 'stone'], ceil: ['#2a2018', 'stone'] },
  archive: { H: 5.5, floor: ['#5a3a24', 'wood'], wall: ['#4a3424', 'wood'], ceil: ['#d8ccb0', 'stucco'] },
  bridge: { H: 6.5, floor: ['#2c3440', 'panel'], wall: ['#5a6470', 'hull'], ceil: ['#1e2430', 'panel'] },
};
const ZLIST = [null, 'plaza', 'market', 'homes', 'hydro', 'bar', 'arcade', 'engine', 'aliens', 'under', 'archive', 'bridge'], ZTOP = ZLIST.length - 1;
const zTheme = n => ZLIST[n] || 'market';
const ZF = { floor: 1 };
function zFloorName(n) { if (n === 1) return 'Zeltac Plaza'; if (n === ZTOP) return "Captain's Bridge"; return `Floor ${n} · ${ZTHEMES[zTheme(n)].name}`; }
function openElevator() {
  openDlg('Elevator', `Zeltac Ship · ${ZTOP} floors`);
  $('dlgLine').textContent = `You're on ${zFloorName(ZF.floor)}. Where to? Engine decks and the Alien Quarter are not safe.`;
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.display = 'grid'; rows.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))'; rows.style.gap = '4px';
  for (let n = 1; n <= ZTOP; n++) { const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '6px 8px'; b.style.fontSize = '13px'; b.style.textAlign = 'left'; const t = n === 1 || n === ZTOP ? null : ZTHEMES[zTheme(n)];
    b.textContent = `${n}. ${n === 1 ? 'Plaza' : n === ZTOP ? "Captain's Bridge" : t.name}${t && !t.safe ? ' ⚠' : ''}`; b.disabled = n === ZF.floor; b.addEventListener('click', () => { closeDlg(); goFloor(n); }); rows.appendChild(b); }
  $('dlgActs').before(rows); acts([['Stay here', closeDlg]]);
}
function goFloor(n) {
  SFX.door(); ZF.floor = n;
  if (n === 1) { loadLevel('zeltac', { at: { x: 22, z: 20, yaw: -Math.PI / 2 } }); return; }
  const th = zTheme(n), L = LEVELS.zfloor, T = ZTHEMES[th];
  L.name = zFloorName(n);
  L.zones = [{ id: 'deck', name: zFloorName(n), lvl: th === 'bridge' ? 'Safe · the captain' : T.safe ? 'Safe' : th === 'engine' ? 'Lv 24–28 · hostile' : 'Lv 30–35 · hostile', x: 0, z: 0, r: 30, col: T ? T.floor : '#3a3d44', safe: th === 'bridge' || T.safe, h: 0 }];
  L.safes = th === 'bridge' || T.safe ? [{ x: 0, z: 0, r: 400 }] : [{ x: 22, z: 20, r: 6 }];
  L.npcs = zNpcs(n, th); L.spawns = zSpawns(n, th);
  loadLevel('zfloor'); toast(zFloorName(n).toUpperCase(), th === 'bridge' ? 'The top of the ship' : T.safe ? 'Safe deck' : 'Hostile deck: watch yourself', 2.5);
}
function zNpcs(n, th) {
  const civ = (id, name, role, x, z, face, extra, idle) => Object.assign({ id: id + n, name, role, rig: 'civ', make: () => makeCivilian(['#c8402f', '#3b4f7a', '#5a6a3a', '#8a6fc4', '#c9a43a'][n % 5], '#2c2a28', ['#e0b892', '#8a5a3a', '#9fe8ff', '#c58a64'][n % 4], '#1e1a18', '#ffd36a'), x, z, face, idle }, extra);
  if (th === 'bridge') return [{ id: 'zcap', name: 'Captain Zeltac', role: 'Master of the ship', rig: 'elismas', make: () => recolor(makeElismas(), { '#9aa1aa': '#c9a43a' }), x: 0, z: -18, face: 0, idle: ["Twenty floors. Ten thousand souls. One very tired captain.", "Every world you free sends us more passengers. Thank you, I think."] }];
  if (th === 'market') return [civ('vend', 'Vendor Kip', 'Market · buys anything', -10, -6, 1.2, { shop: 'store' }, ["Fresh from twelve worlds! Some of it is still moving."]), civ('gunv', 'Arms Dealer Rax', 'Guns', 10, -6, -1.2, { shop: 'guns', guns: ['r15', 's25', 'p35', 'xbow'] }, ["Lightly used. By a careful owner. Who is now in jail."])];
  if (th === 'bar') return barNpcs();
  if (th === 'homes') return resNpcs(civ);
  if (th === 'hydro') return [civ('farm', 'Farmer Sprout', 'Hydroponics · fish buyer', -8, -10, 0.6, { shop: 'fish', rods: [1, 2, 3] }, ["The fish in the tanks are friends. The ones you catch are business."])];
  if (th === 'arcade') return [civ('slots', 'Lucky Lux', 'Slots · double or nothing', 0, -12, 0, { custom: [['Spin (100 cr)', () => zSlots(100)], ['Spin (1000 cr)', () => zSlots(1000)]] }, ["The house always wins. But sometimes the house falls asleep."])];
  return [];
}
function zSpawns(n, th) {
  const lv = th === 'engine' ? [24, 28] : [30, 34];
  if (th === 'engine') return [{ zone: 'deck', type: 'drillbot', n: 6, lv }, { zone: 'deck', type: 'hoverbot', n: 3, lv }].filter(s => ENEMY[s.type]);
  if (th === 'aliens') return [{ zone: 'deck', type: 'spearman', n: 6, lv }, { zone: 'deck', type: 'bughybrid', n: 4, lv }, ...(th === 'aliens' ? [{ zone: 'deck', type: 'chief', n: 1, lv: [lv[1] + 2, lv[1] + 2], at: [0, -20] }] : [])];
  return [];
}
function zSlots(bet) {
  if (S.cr < bet) { $('dlgLine').textContent = "You can't afford that spin. The machine looks disappointed."; return; }
  S.cr -= bet; const sy = ['🍒', '⭐', '🚀', '👾', '💎'], r = [0, 0, 0].map(() => sy[randi(0, sy.length - 1)]);
  const win = r[0] === r[1] && r[1] === r[2] ? (r[0] === '💎' ? 20 : 8) : (r[0] === r[1] || r[1] === r[2]) ? 1.5 : 0, pay = Math.round(bet * win);
  S.cr += pay; markDirty(); SFX[pay ? 'coin' : 'ui']();
  $('dlgLine').textContent = `[ ${r.join(' | ')} ]  ${pay ? `You win ${pay} cr!` : 'Nothing. The machine beeps smugly.'}`;
}
LEVELS.zfloor = {
  id: 'zfloor', name: 'Zeltac Floor', tag: 'Inside the Zeltac Ship', lvls: 'Varies', size: 120, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#3a3d44' }, zones: [], paths: [], river: [], pools: [], lava: [],
  safes: [], spawn: { x: 22, z: 20, yaw: -Math.PI / 2 }, pad: { x: 22, z: 24 }, menu: { x: 0, z: 10, r: 16, h: 6 }, npcBase: [0, 0], npcs: [], spawns: [],
  build() {
    const n = ZF.floor, th = zTheme(n), T = ZTHEMES[th] || { col: '#c9a43a', floor: '#2c2f36', neon: '#8fe3ff' }, K = ZDECK[th] || {}, H = K.H || 7, big = th === 'bar' || th === 'homes' || th === 'under', W = big ? 30 : 26, D = big ? 28 : 24; // working decks are a little tighter so they feel full
    const fl = new THREE.PlaneGeometry(W * 2, D * 2, 12, 12); fl.rotateX(-Math.PI / 2); const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W, uv.getY(i) * D);
    props.add(new THREE.Mesh(fl, toon(...(K.floor || [T.floor, 'panel'])))); const ce = new THREE.Mesh(fl.clone(), toon(...(K.ceil || ['#24262c', 'panel']))); ce.rotation.x = Math.PI; ce.position.y = H; props.add(ce);
    for (const [x, z, w, d] of [[0, -D, W * 2, 0.6], [0, D, W * 2, 0.6], [-W, 0, 0.6, D * 2], [W, 0, 0.6, D * 2]]) { part(props, K.wall ? tileBox(B(w, H, d), 2) : B(w, H, d), K.wall ? toon(...K.wall) : '#4a4e56', x, H / 2, z); box(x, z, w / 2, d / 2); }
    for (let z = -D + 4; z < D; z += 7) part(props, B(W * 2 - 2, 0.1, 0.3), glow(T.neon), 0, H - 0.1, z);
    // elevator
    part(props, B(5, 5, 0.4), '#3a3d44', 22, 2.5, D - 0.2); part(props, B(3.6, 4.4, 0.2), glow(T.neon), 22, 2.2, D - 0.45);
    zaLightbox(props, zaSignTex(`DECK ${n}`, { fg: '#ffd75e', glow: '#ffb347', bg: '#0f1757', bg2: '#1a2470', w: 512, h: 112, font: 'Impact, sans-serif' }), 2.4, 0.5, 0.14, 22, Math.min(H - 0.6, 5.6), D - 0.45, Math.PI, T.neon);
    INTERACTS.push({ x: 22, z: D - 3, r: 3.5, label: 'Elevator', fn: openElevator });
    const rnd = (i) => (Math.sin(n * 91.7 + i * 13.3) + 1) / 2;
    if (th === 'bridge') {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.6, H - 1.5), new THREE.MeshBasicMaterial({ color: '#0a0e1e' })); win.position.set(0, H / 2, -D + 0.4); props.add(win);
      for (let i = 0; i < 80; i++) part(props, B(0.06, 0.06, 0.02), glow('#ffffff'), -W * 0.75 + rnd(i) * W * 1.5, 1 + rnd(i + 99) * (H - 2.5), -D + 0.5);
      const pl = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 10), new THREE.MeshBasicMaterial({ map: planetTex('mezar') })); pl.position.set(-12, 3.6, -D - 2); levelGroup.add(pl);
      for (let i = 0; i < 8; i++) { const x = -14 + i * 4; part(props, B(2.6, 1, 1.2), '#3a3d44', x, 0.5, -D + 5); part(props, B(2.2, 0.05, 0.8), glow(i % 2 ? '#4fd2ff' : '#ffd36a'), x, 1.05, -D + 5, -0.3); box(x, -D + 5, 1.3, 0.6); }
      part(props, Cy(1.2, 1.4, 1.2, 10), '#c9a43a', 0, 0.6, -12); part(props, B(1.6, 2.2, 0.3), '#5d636c', 0, 1.7, -12.6); solid(0, -12, 1.4);
    } else if (th === 'bar') { buildBar(T, W, D, H, rnd);
    } else if (th === 'market') {
      for (let i = 0; i < 14; i++) { const x = -22 + (i % 7) * 7.3, z = i < 7 ? -12 : 8, st = new THREE.Group(); part(st, B(4, 1, 2), toon('#8a6a44', 'wood'), 0, 0.5, 0); for (const s of [-1, 1]) part(st, B(0.15, 3, 0.15), '#3a3d44', 1.9 * s, 1.5, 0.9); part(st, B(4.4, 0.1, 2.4), toon(['#c8402f', '#3b4f7a', '#ffd36a', '#6fdc5a'][i % 4], 'cloth'), 0, 3, 0.3, 0.15); for (let k = 0; k < 4; k++) E(st, ['#ff9a3c', '#c86aff', '#6fdc5a', '#ffd23a'][(i + k) % 4], -1.4 + k * 0.9, 1.15, 0, 0.25, 0.2, 0.25); at(st, x, z, i < 7 ? 0 : Math.PI); box(x, z, 2, 1); }
    } else if (th === 'homes') { buildResidential(T, W, D, H, rnd);
    } else if (th === 'hydro') {
      for (let i = 0; i < 6; i++) { const z = -20 + i * 7; part(props, B(40, 0.8, 2.4), '#3a3d44', -2, 0.4, z); for (let k = 0; k < 16; k++) E(props, toon(k % 3 ? '#4f8a3a' : '#6fce4a', 'leaves'), -21 + k * 2.5, 1.0, z, 0.6, 0.4 + rnd(k + i * 16) * 0.5, 0.6); part(props, B(40, 0.06, 0.1), glow('#c86aff'), -2, 3.5, z); box(-2, z, 20, 1.2); }
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 5, 14, 1, true), new THREE.MeshLambertMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); tank.position.set(22, 2.5, -14); props.add(tank); solid(22, -14, 3.1);
      for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(B(0.5, 0.25, 0.12), toon(['#ff9a3c', '#ffd23a', '#4fd2ff'][i % 3])); levelGroup.add(f); levelAnims.push(t => { const a = t * 0.7 + i; f.position.set(22 + Math.cos(a) * 2, 1.4 + i * 0.5, -14 + Math.sin(a) * 2); f.rotation.y = -a; }); }
    } else if (th === 'engine') {
      for (let i = 0; i < 6; i++) { const x = -20 + i * 8; part(props, Cy(1.8, 1.8, H, 12), '#5d636c', x, H / 2, -14); part(props, Cy(1.9, 1.9, 0.3, 12), glow('#ff8a2a'), x, 2.5, -14); solid(x, -14, 2); }
      for (let i = 0; i < 8; i++) part(props, Cy(0.3, 0.3, W * 2, 8), '#3a3430', 0, 5 + (i % 3) * 0.6, -24 + i * 6, 0, 0, Math.PI / 2);
      for (let i = 0; i < 10; i++) { const x = -24 + rnd(i) * 48, z = 2 + rnd(i + 5) * 20; part(props, B(2, 1.4, 2), toon('#8a6a44', 'wood'), x, 0.7, z, 0, rnd(i + 9), 0); box(x, z, 1, 1); }
    } else if (th === 'arcade') {
      for (let i = 0; i < 16; i++) { const x = -24 + (i % 8) * 6.8, z = i < 8 ? -20 : 18, m = new THREE.Group(); part(m, B(1.4, 2.4, 1), '#1e1c22', 0, 1.2, 0); part(m, B(1.1, 0.9, 0.05), glow(['#ff6aa8', '#4fd2ff', '#ffd36a', '#6fdc5a'][i % 4]), 0, 1.7, 0.52); part(m, B(1.2, 0.3, 0.3), '#3a3d44', 0, 1.0, 0.55, -0.4); at(m, x, z, i < 8 ? 0 : Math.PI); box(x, z, 0.7, 0.5); }
      for (let i = 0; i < 20; i++) { const tile = part(props, B(2.8, 0.04, 2.8), glow(['#ff6aa8', '#4fd2ff', '#ffd36a', '#c86aff'][i % 4]), -9 + (i % 5) * 4.4, 0.03, -6 + Math.floor(i / 5) * 4.4); tile.material = tile.material.clone(); levelAnims.push(t => { tile.visible = Math.sin(t * 3 + i * 1.7) > -0.2; }); }
    } else if (th === 'aliens') {
      for (let i = 0; i < 9; i++) { part(props, B(2.4, 1.6, 1.2), toon(i % 2 ? '#a07a4a' : '#5d636c', i % 2 ? 'wood' : 'panel'), -20 + i * 5, 0.8, 10 + Math.sin(i) * 3, 0, i * 0.3); part(props, new THREE.ConeGeometry(0.2, 0.8, 4), C.red, -20 + i * 5, 2, 10 + Math.sin(i) * 3); box(-20 + i * 5, 10 + Math.sin(i) * 3, 1.2, 0.6); }
      for (let i = 0; i < 6; i++) { const x = -20 + i * 8; part(props, new THREE.ConeGeometry(2.4, 4.5, 6), toon('#7a4a2a', 'cloth'), x, 2.25, -16); solid(x, -16, 2.2); }
      part(props, B(0.2, 3, 4), glow('#ff3b2a'), -W + 0.4, 2, 0);
    }
    // crowd on safe decks
    if (th !== 'engine' && th !== 'aliens' && th !== 'bridge' && th !== 'bar' && th !== 'homes' && th !== 'under') { const ppl = []; for (let i = 0; i < 8; i++) { const o = buildChar(() => makeCivilian(['#c8402f', '#3b4f7a', '#5a6a3a', '#8a6fc4'][i % 4], '#2c2a28', ['#e0b892', '#8a5a3a', '#9fe8ff'][i % 3], '#1e1a18'), 'civ'); o.position.set(-20 + i * 5, 0, -2 + (i % 2) * 4); blob(o, 0.45); levelGroup.add(o); ppl.push(o); MOVERS.push([o, 0.45]); }
      const sts = ppl.map(() => ({}));
      levelAnims.push(t => ppl.forEach((o, i) => { const a = t * 0.15 + i * 0.8, x = Math.cos(a) * (8 + i), z = Math.sin(a) * (5 + i % 3); o.rotation.y = Math.atan2(-Math.sin(a) * (8 + i), Math.cos(a) * (5 + i % 3)); o.position.set(x, 0, z); animRig(o, sts[i], 1 / 60, t); })); }
  }
};
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'zfloor') return false; return _po(id); }; }
{ const ob = LEVELS.zeltac.build; LEVELS.zeltac.build = function () { ob.call(this); ZF.floor = 1;
  part(props, B(5, 5, 0.4), '#3a3d44', 22, 2.5, 33.8); part(props, B(3.6, 4.4, 0.2), glow('#8fe3ff'), 22, 2.2, 33.5);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.8), new THREE.MeshBasicMaterial({ map: signTex(`ELEVATOR · ${ZTOP} FLOORS`, '#0f1757', '#ffd75e') })); sg.position.set(22, 5.6, 33.5); sg.rotation.y = Math.PI; props.add(sg);
  INTERACTS.push({ x: 22, z: 30, r: 3.5, label: `Elevator (${ZTOP} floors)`, fn: openElevator }); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'zfloor') { S.where = 'zeltac'; S.orbit = 'zeltac'; } if (['fort', 'skycity', 'zarlich', 'vector'].includes(id)) S.orbit = id; if (id === 'forestlife' || id === 'swift') S.orbit = 'earth'; return r; }; }
