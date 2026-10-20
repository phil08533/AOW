// =================== THE UNDERWORLD, LIVED IN (2.12.1): a bartender, a dice table, booths, a jukebox and some regulars ===================
function uwDrink() {
  if (S.cr < 25) { log("Grub: No credits, no drink. House rule. My rule. I'm the house."); return; }
  S.cr -= 25; player.hp = Math.min(maxHp(), player.hp + Math.round(maxHp() * 0.3)); markDirty(); SFX.item(); toast('ROT-GUT', ['It burns. In a good way? +30% health', 'Tastes like a battery. +30% health', 'Something in it waved at you. +30% health'][randi(0, 2)], 2);
}
function uwDice() {
  openDlg('Dice table', 'Lucky Seven');
  $('dlgLine').textContent = `Two dice each. Beat my roll and I pay double. Tie, you keep your stake. You have ${S.cr} cr.`;
  const roll = bet => { if (S.cr < bet) return; const d = () => randi(1, 6), a = [d(), d()], b = [d(), d()], me = a[0] + a[1], her = b[0] + b[1];
    S.cr -= bet; let msg; if (me > her) { S.cr += bet * 2; msg = `You roll ${a.join(' + ')} = ${me}. I roll ${b.join(' + ')} = ${her}. Ugh. Take your ${bet * 2} cr.`; SFX.coin(); } else if (me === her) { S.cr += bet; msg = `${me} and ${her}. A tie. Stake back, nobody's happy.`; SFX.ui(); } else { msg = `You roll ${a.join(' + ')} = ${me}. I roll ${b.join(' + ')} = ${her}. The house thanks you.`; SFX.hurt(); }
    markDirty(); $('dlgLine').textContent = msg + ` You have ${S.cr} cr.`; setBets(); };
  const setBets = () => acts([[`Bet 50`, () => roll(50), true, S.cr < 50], [`Bet 250`, () => roll(250), false, S.cr < 250], [`Bet 1000`, () => roll(1000), false, S.cr < 1000], ['Walk away', closeDlg]]);
  setBets();
}
LEVELS.underworld.npcs.push(
  { id: 'grub', name: 'Grub', role: 'Bartender · drinks', rig: 'civ', make: () => makeCivilian('#5a4a3a', '#1e1c22', '#8a5a3a', '#2a2420', '#e8e4dc'), x: 0, z: -9.7, face: 0, custom: [['Buy a drink (25 cr)', uwDrink], ['Hire crew', () => openHire()]],
    idle: ["What'll it be? We have rot-gut, and we have rot-gut with ice.", "Saw a Marshal down here once. Once.", "The Fence pays more than the shops, but don't tell him I said that. He'll pay me less."] },
  { id: 'lucky', name: 'Lucky Seven', role: 'Dice dealer', rig: 'civ', make: () => makeCivilian('#1e4a2a', '#1e1c22', '#e8b896', '#c8402f', '#ffd36a'), x: -8, z: 2.2, face: Math.PI, custom: [['Roll dice', uwDice]],
    idle: ["Feeling lucky? Everyone does. Right up until they don't.", "Seven's my number. Also my name. Also how many husbands I've had."] },
  { id: 'rattle', name: 'Rattle', role: 'Information broker', rig: 'civ', make: () => makeCivilian('#3a3d44', '#2a2c32', '#c58a64', '#5a5e66', '#4fd2ff'), x: 8.4, z: 4.4, face: -Math.PI / 2,
    idle: ["Bounty hunters check the Hit Board every hour. If your name's up there, maybe don't sit near the door.", "Merchant haulers in space carry real cargo. Board one and the Marshals come looking. Worth it? Sometimes.", "The President throws a party every night in the Starlight Lounge. Nobody asks who pays for it. I asked. Now I live in a basement.", "Every basement hatch on every world leads here. Same room. Don't think about it too hard."] }
);
function uwDress() {
  const H = 3.4, P = (k, x, z, ry, y) => { const g = pieceModel(k); g.position.set(x, y || 0, z); g.rotation.y = ry || 0; props.add(g); return g; };
  // brick walls and a grimy rug
  const brick = toonNS('#4a3036', 'retro');
  for (const [x, z, w, d] of [[0, -10.7, 23.4, 0.1], [0, 10.7, 23.4, 0.1], [-11.7, 0, 0.1, 21.4], [11.7, 0, 0.1, 21.4]]) part(props, B(w, H - 0.4, d), brick, x, H / 2 - 0.1, z);
  part(props, B(5, 0.02, 3.4), toon('#5a1e2a', 'cloth'), 0, 0.018, 2);
  // the bar: stools, a back shelf full of bottles, lights on chains
  for (let i = 0; i < 6; i++) { const x = -3.2 + i * 1.28; part(props, Cy(0.05, 0.05, 0.7, 6), '#2a2c32', x, 0.35, -7.5); part(props, Cy(0.25, 0.25, 0.08, 10), toon('#8a2a3a', 'cloth'), x, 0.74, -7.5); solid(x, -7.5, 0.25); }
  for (const y of [1.9, 2.45]) { part(props, B(7, 0.06, 0.35), toon('#3a2a20'), 0, y, -10.45); for (let i = 0; i < 12; i++) { const c = ['#2a6a3a', '#6a2a1a', '#c9a43a', '#3a4a8a', '#8fd0ff'][(i * 7 + (y > 2 ? 3 : 0)) % 5]; part(props, Cy(0.05, 0.07, 0.3, 6), glow(['#ff4fd8', '#4fe0ff', '#7fff6a', '#ffd36a', '#ff7a3a', '#a86aff'][(i + (y > 2 ? 3 : 0)) % 6]), -3.2 + i * 0.58, y + 0.18, -10.45); } }
  for (const x of [-2.6, 0, 2.6]) P('chainlight', x, -8.6);
  // pool table: lamp, balls, cues
  P('hanglamp', 0, 2); const pl = new THREE.PointLight(0x9fe87a, 0.7, 7); pl.position.set(0, 2.2, 2); levelGroup.add(pl);
  for (let i = 0; i < 9; i++) part(props, new THREE.SphereGeometry(0.05, 8, 6), ['#ffd36a', '#3a4aa8', '#c8402f', '#5a2a8a', '#ff8a2a', '#2a6a3a', '#8a2a2a', '#1e1c22', '#e8e4dc'][i], -0.6 + (i % 3) * 0.12, 0.92, 1.8 + Math.floor(i / 3) * 0.11);
  part(props, Cy(0.015, 0.02, 1.5, 5), '#c8a070', 1.75, 0.75, 1.3, 0.3, 0, 0.25); part(props, Cy(0.015, 0.02, 1.5, 5), '#c8a070', 1.8, 0.75, 1.5, 0.3, 0, 0.3);
  // the dice table, west side
  part(props, Cy(0.9, 0.9, 0.08, 16), toon('#1e4a2a'), -8, 0.85, 3.4); part(props, Cy(0.12, 0.2, 0.8, 8), '#2a2c32', -8, 0.42, 3.4); solid(-8, 3.4, 0.95);
  for (const [dx, dz] of [[-1.25, 0.4], [0.9, 1.0], [1.2, -0.3]]) { part(props, Cy(0.22, 0.22, 0.06, 10), toon('#5a1e2a', 'cloth'), -8 + dx, 0.5, 3.4 + dz); part(props, Cy(0.04, 0.04, 0.5, 5), '#2a2c32', -8 + dx, 0.25, 3.4 + dz); }
  for (const [x, z] of [[-8.15, 3.3], [-7.9, 3.55]]) part(props, B(0.1, 0.1, 0.1), '#e8e4dc', x, 0.94, z, 0, x * 3);
  const dl = new THREE.PointLight(0xff4a3a, 0.6, 7); dl.position.set(-8, 2.6, 3.4); levelGroup.add(dl); P('hanglamp', -8, 3.4);
  // booths on the east wall, under a neon sign
  P('rug', 9.6, 1.5); P('sofa', 10.9, 1.5, -Math.PI / 2); P('armchair', 8.3, 0.1, 0); P('coffeetable', 9.6, 1.5); box(10.9, 1.5, 0.45, 1.0);
  P('neon', 11.55, 1.5, -Math.PI / 2, 1.9);
  // jukebox and arcade cabinets, things to poke at
  P('jukebox', 10.9, -9.6, 0); box(10.9, -9.6, 0.45, 0.3);
  INTERACTS.push({ x: 10.9, z: -8.6, r: 1.4, label: 'Jukebox: change music', fn: () => { const order = [3, 1, 2, 0]; PREFS.music = order[(order.indexOf(PREFS.music) + 1) % order.length]; try { savePrefs(); SFX.setMusic(PREFS.music); } catch (_) {} toast('JUKEBOX', (typeof MUSIC_NAMES !== 'undefined' && MUSIC_NAMES[PREFS.music]) || 'Off', 1.5); SFX.ui(); } });
  for (const z of [7.2, 8.4]) { P('arcade', 11.0, z, -Math.PI / 2); box(11.0, z, 0.4, 0.4); }
  INTERACTS.push({ x: 10.0, z: 7.8, r: 1.5, label: 'Play arcade', fn: () => { const sc = randi(100, 9999); toast('HIGH SCORE?', `You scored ${sc}${sc > 9000 ? '. LEGENDARY.' : '. Not bad.'}`, 2); SFX.coin(); } });

  // ---- Grub's Bar look (after Phil's render): neon sign, glowing bottles, bulb chandeliers, taps, regulars, wet floor, junk ----
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(23.2, 21.2), toon('#2a2220', 'panel')); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.009; props.add(fl);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.75), new THREE.MeshBasicMaterial({ map: signTex("GRUB'S BAR", '#06121a', '#7fe8ff') })); sg.position.set(0, 3.0, -10.6); levelGroup.add(sg);
    const sl = new THREE.PointLight(0x7fe8ff, 0.7, 6, 1.8); sl.position.set(0, 2.8, -9.8); levelGroup.add(sl);
    const bl = new THREE.PointLight(0xff6ad8, 0.6, 5, 1.8); bl.position.set(0, 2.2, -9.8); levelGroup.add(bl);
    const bulb = glow('#ffe2a8'), chain = toon('#2a2c30', 'panel');
    for (const [x, z] of [[-2.6, -7.8], [2.6, -7.8], [-7, -4], [-7, 3.4], [6, -3], [0, 6]]) { for (let k = 0; k < 4; k++) part(props, new THREE.TorusGeometry(0.05, 0.015, 4, 8), chain, x, H - 0.1 - k * 0.14, z, 0, k % 2 ? Math.PI / 2 : 0, 0);
      part(props, Cy(0.35, 0.35, 0.05, 10), chain, x, H - 0.7, z); for (let b = 0; b < 4; b++) { const a = b * Math.PI / 2 + 0.4; part(props, new THREE.SphereGeometry(0.09, 8, 6), bulb, x + Math.cos(a) * 0.26, H - 0.82, z + Math.sin(a) * 0.26); }
      const l = new THREE.PointLight(0xffc98a, 0.55, 6, 1.8); l.position.set(x, H - 1.1, z); levelGroup.add(l); }
    for (let i = 0; i < 5; i++) { const x = 1 + i * 0.5; part(props, Cy(0.04, 0.04, 0.4, 6), toon('#c9a43a'), x, 1.3, -8.7); part(props, B(0.07, 0.18, 0.07), glow(['#ff4fd8', '#4fe0ff', '#7fff6a', '#ffd36a', '#ff7a3a'][i]), x, 1.58, -8.7); }
    for (let i = 0; i < 4; i++) part(props, Cy(0.07, 0.07, 0.17, 8), glow(i % 2 ? '#ffb347' : '#ffd36a'), -2.6 + i * 1.5, 1.2, -8.25);
    // regulars on the stools and around two tables
    const regs = [() => recolor(makeBugHybrid(), { '#5f8a3a': '#4a8a3a' }), () => makeCivilian('#3a3430', '#1e1c22', '#d9cfc0', '#1e1a18', '#5a3a22'), () => makeCivilian('#5a2a6a', '#2c2a28', '#c58a64', '#cfcac0', '#3a3d44'), () => makeCivilian('#2a4a6a', '#1e1c22', '#e0b892', '#1e1a18', '#c8402f')];
    const ucStand = (mk, rig, x, z, ry) => { const o = buildChar(mk, rig); o.position.set(x, 0, z); o.rotation.y = ry; levelGroup.add(o); solid(x, z, 0.35); const st = {}; levelAnims.push(t => { if (o.parent) animRig(o, st, 1 / 60, t); }); };
    const sit = (mk, rig, x, y, z, ry, i) => { const o = buildChar(mk, rig), R = o.userData.rig; o.position.set(x, y - (R ? R.spec.hip : 0.95) + 0.07, z); sitChar(o, y); o.rotation.y = ry; levelGroup.add(o); solid(x, z, 0.35);
      if (R && R.head) levelAnims.push(t => { R.head.rotation.y = Math.sin(t * 0.5 + i * 2) * 0.25; if (R.armR) R.armR.rotation.x = -0.6 + Math.sin(t * 0.8 + i) * 0.25; }); };
    [[-3.2, 0], [-0.64, 1], [1.92, 3]].forEach(([x, k], i) => sit(regs[k], k ? 'civ' : 'bughybrid', x, 0.78, -7.5, Math.PI, i));
    for (const [tx, tz] of [[-6.5, -4], [5.5, -2.6]]) { part(props, B(1.8, 0.1, 1.0), toon('#4a3020', 'wood'), tx, 0.82, tz); part(props, B(0.16, 0.78, 0.16), '#2a2c32', tx, 0.4, tz); box(tx, tz, 0.9, 0.5);
      for (let k = 0; k < 3; k++) part(props, Cy(0.05, 0.06, 0.22, 6), glow(['#7fff6a', '#ffd36a', '#ff4fd8'][k]), tx - 0.5 + k * 0.5, 0.98, tz);
      for (const s of [-1, 1]) { part(props, Cy(0.24, 0.24, 0.08, 10), toon('#8a1e24', 'cloth'), tx, 0.5, tz + s * 0.95); part(props, Cy(0.04, 0.04, 0.48, 5), '#2a2c32', tx, 0.25, tz + s * 0.95); } }
    sit(regs[2], 'civ', -6.5, 0.54, -4.95, 0, 3); sit(regs[0], 'bughybrid', 5.5, 0.54, -1.65, Math.PI, 4); sit(regs[3], 'civ', 5.5, 0.54, -3.55, 0, 5);
    // more regulars: a couple eating in the east booth, a deal going down in a new north booth, two talking business by the dice table
    const look = (tx, tz, x, z) => Math.atan2(tx - x, tz - z);
    sit(regs[3], 'civ', 10.6, 0.45, 1.0, look(9.6, 1.0, 10.6, 1.0), 6); sit(regs[1], 'civ', 10.6, 0.45, 2.1, look(9.6, 2.1, 10.6, 2.1), 7);
    for (const [x, z] of [[9.6, 1.1], [9.6, 1.9]]) { part(props, Cy(0.18, 0.18, 0.02, 10), '#e8e4dc', x, 0.42, z); part(props, B(0.16, 0.08, 0.16), toon('#c88a3a'), x, 0.46, z); }
    part(props, B(3.2, 0.45, 0.8), toon('#5a1e2a', 'cloth'), -5, 0.22, 9.9); part(props, B(3.2, 1.0, 0.2), toon('#5a1e2a', 'cloth'), -5, 0.7, 10.35); box(-5, 9.9, 1.6, 0.4);
    part(props, B(2.4, 0.08, 0.9), toon('#4a3020', 'wood'), -5, 0.75, 8.9); part(props, B(0.16, 0.72, 0.16), '#2a2c32', -5, 0.37, 8.9); box(-5, 8.9, 1.2, 0.45);
    sit(regs[2], 'civ', -5.8, 0.45, 9.85, look(-5.8, 8.9, -5.8, 9.85), 8); sit(regs[0], 'bughybrid', -4.2, 0.45, 9.85, look(-4.2, 8.9, -4.2, 9.85), 9);
    part(props, B(0.5, 0.36, 0.14), toon('#2a2420'), -5, 0.97, 8.85); part(props, B(0.3, 0.05, 0.2), glow('#7fff6a'), -4.4, 0.81, 8.7); for (let k = 0; k < 4; k++) part(props, B(0.16, 0.03, 0.08), toon('#6fdc5a'), -5.6 + k * 0.05, 0.8 + k * 0.03, 8.75);
    for (const [x, z, tx, tz, k] of [[-9.6, -1.2, -8.6, -1.2, 2], [-8.6, -1.2, -9.6, -1.2, 3]]) ucStand(regs[k], 'civ', x, z, look(tx, tz, x, z));
    // junk on the floor
    for (let i = 0; i < 18; i++) { const x = -10 + ((i * 37) % 20), z = -6 + ((i * 23) % 15); if (Math.abs(x) < 3 && z > 0 && z < 4) continue;
      part(props, i % 3 ? Cy(0.04, 0.04, 0.12, 6) : B(0.28, 0.03, 0.2), toon(['#8a8f96', '#c8402f', '#d9c79a', '#3a6a8a'][i % 4]), x, 0.03, z, i % 3 ? Math.PI / 2 : 0, i, 0); }
    for (const [x, z] of [[-10.6, -9.4], [-9.8, -9.6], [10.4, 9.6]]) { part(props, B(0.8, 0.6, 0.8), toon('#4a3020', 'wood'), x, 0.3, z, 0, x, 0); box(x, z, 0.45, 0.45); }
  }
  P('plant', -11, 9.6); P('plant', 6.5, -10.1);
  // graffiti and posters
  const tag = (text, bg, fg, x, y, z, ry, w) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w || 2.6, (w || 2.6) / 5), new THREE.MeshBasicMaterial({ map: signTex(text, bg, fg), transparent: true, opacity: 0.85 })); m.position.set(x, y, z); m.rotation.y = ry; props.add(m); };
  tag('MARSHALS GO HOME', '#2a1418', '#ff6aa8', 11.6, 2.4, -3.5, -Math.PI / 2); tag('NO SNITCHES', '#14202a', '#6fdc5a', -11.6, 2.5, 6, Math.PI / 2, 2.2); tag('CASH ONLY', '#2a2014', '#ffd36a', -6, 2.6, -10.6, 0, 2);
  for (const [x, z, ry] of [[6, 10.6, Math.PI], [-6, 10.6, Math.PI], [-11.6, -7, Math.PI / 2]]) P('poster', x, z, ry, 1.2);
}
{ const _b = LEVELS.underworld.build; LEVELS.underworld.build = function () { _b.apply(this, arguments); try { uwDress(); } catch (e) { console.warn('uw', e); } }; }
