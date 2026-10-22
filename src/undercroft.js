// =================== THE UNDERCROFT: a wretched hive of scum and villainy ===================
// A dive cantina under the Senate Archive: the Rusty Rivet bar, a band nobody asked for, back-room poker,
// a members-only back room, wanted posters, drunks and smoke. The Mole and the Fence still do business here.
Object.assign(ZTHEMES.under, { floor: '#221d19', neon: '#6a2418', col: '#4a2a1e' });
function ucPoster(name, crime, reward, hue, you) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 176; const x = c.getContext('2d');
  x.fillStyle = you ? '#e8d9a8' : '#d9c79a'; x.fillRect(0, 0, 128, 176);
  for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(80,50,20,${Math.random() * 0.14})`; x.fillRect(Math.random() * 128, Math.random() * 176, 3, 3); }
  x.fillStyle = '#3a1e10'; x.font = 'bold 26px Impact, "Arial Narrow", sans-serif'; x.textAlign = 'center'; x.fillText('WANTED', 64, 30);
  x.fillStyle = `hsl(${hue},28%,32%)`; x.fillRect(24, 40, 80, 72); x.fillStyle = '#1e1410'; x.beginPath(); x.arc(64, 70, 17, 0, 7); x.fill(); x.fillRect(38, 88, 52, 24);
  if (you) { x.fillStyle = '#c8402f'; x.font = 'bold 40px Impact, sans-serif'; x.fillText('?', 64, 84); }
  x.fillStyle = '#3a1e10'; x.font = 'bold 14px "Arial Narrow", sans-serif'; x.fillText(name.toUpperCase(), 64, 130, 120);
  x.font = '11px "Arial Narrow", sans-serif'; x.fillText(crime, 64, 145, 120); x.fillStyle = '#8a1e10'; x.font = 'bold 15px Impact, sans-serif'; x.fillText(reward, 64, 166, 120);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
const UC_POSTERS = [['Krell the Gut', 'Ate a customs officer', '5,000 CR', 20], ['Twin Vasko', 'Both of them', '8,000 CR', 200], ['Madame Slyth', 'Poisoned a senator', '12,000 CR', 300], ['Gorvo', 'Stole a moon', '40,000 CR', 90],
  ['Skeets', 'Unpaid bar tab', '45 CR', 50], ['Doc Ninefinger', 'Unlicensed surgery', '6,500 CR', 160], ['The Hum', 'Unknown', '20,000 CR', 260], ['Rax Vorell', 'Piracy, 31 counts', '15,000 CR', 0]];
function ucChar(make, rigN, x, z, ry, fn) { const o = buildChar(() => npcDisarm(make()), rigN); o.position.set(x, 0, z); o.rotation.y = ry; blob(o, 0.45); levelGroup.add(o); solid(x, z, 0.45);
  const st = {}, ph = Math.random() * 6; levelAnims.push(t => { if (!o.parent) return; if (fn) fn(o, t, ph); animRig(o, st, 1 / 60, t); }); return o; }
const ucSway = (o, t, ph) => { o.rotation.z = Math.sin(t * 0.9 + ph) * 0.06; };
const ucChat = ry => (o, t, ph) => { o.rotation.y = ry + Math.sin(t * 0.7 + ph) * 0.35; };
const ucBob = (o, t, ph) => { o.position.y = Math.abs(Math.sin(t * 4 + ph)) * 0.1; o.rotation.z = Math.sin(t * 2 + ph) * 0.05; };
function ucSmoke(o, y) { levelAnims.push(() => { if (o.parent && Math.random() < 0.03) burst(o.position.clone().add(V(0.15, y || 1.55, 0.2)), '#9a9aa0', 1, 0.35); }); }
// who is where
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th !== 'under') return L;
  const mole = L.find(d => d.id === 'mole'); if (mole) Object.assign(mole, { x: -24.6, z: -4, face: Math.PI / 2, role: 'Informant · corner booth' });
  const fence = L.find(d => d.id === 'fence2'); if (fence) Object.assign(fence, { x: -23, z: 21, face: Math.PI / 2, role: 'The Fence · back room' });
  L.push({ id: 'grubb', name: 'Grubb', role: 'Bartender · Grub\'s Bar', rig: 'chunk', make: () => makeChunkMonster('#5a6a3a', '#3e4a28', '#8a9a5a', '#3a2a1e', false), x: 0, z: -22.4, face: 0, heal: true,
    custom: [['Rotgut (25 cr)', () => { if (S.cr < 25) { toast('NO CREDIT', 'Grubb does not do tabs. Grubb does do kneecaps.', 2.5); return; } S.cr -= 25; player.hp = Math.min(player.maxHp || player.hp, player.hp + 40); markDirty(); closeDlg(); toast('ROTGUT', 'It burns. It keeps burning. +40 HP', 2.5); SFX.coin && SFX.coin(); }],
      ['Buy the bar a round (300 cr)', () => { if (S.cr < 300) { toast('NO CREDIT', 'Not enough credits to make friends.', 2); return; } S.cr -= 300; S.buffs = S.buffs || {}; S.buffs.rest = Math.max(S.buffs.rest || 0, Date.now()) + 5 * 60000; markDirty(); closeDlg(); toast('A ROUND ON YOU', 'The whole dive cheers. Nobody stabs you tonight. Rested buff.', 3); SFX.quest && SFX.quest(); }]],
    idle: ["WHAT. You drink or you leave. Leaving is extra.", "No blasters at the bar. Knives are fine. Knives are tradition.", "Last guy asked for water. We buried him in it.", "You're not Marshal, are you? Marshals pay double. And then they pay again."] });
  L.push({ id: 'jax', name: 'One-Eye Jax', role: 'Back-room poker · high stakes', rig: 'civ', make: () => makeCivilian('#3a2a1e', '#1e1c22', '#8a5a3a', '#1e1a18', '#c8402f'), x: 20, z: -21.2, face: 0,
    custom: [['Sit in on a hand', () => openPoker({ dealer: 'One-Eye Jax', title: 'Back-room poker', npcs: ['One-Eye Jax', 'Slick Venn'], antes: [250, 1000, 5000], note: "Five-card draw, Undercroft rules: same as upstairs, but nobody's watching. Jax swears he only has the one eye for cards." })]],
    idle: ["Sit. Cards are honest. Everyone else in here's a liar.", "Lost the eye in a hand of poker. Won the guy's ship though.", "Venn cheats. I cheat better. You'll be fine."] });
  L.push({ id: 'knuckles', name: 'Knuckles', role: 'Bouncer · back room', rig: 'chunk', make: () => makeChunkMonster('#4a4e56', '#2c2f36', '#6a6e78', '#1e1c22', false), x: -14.4, z: 23.5, face: Math.PI / 2,
    idle: ["Members only. You're a member if Marlo's cousin says you are. He says you are. Go on.", "I don't start fights. I finish them. Usually by sitting on people.", "Shoes off in the back room. Kidding. Nobody in there has shoes."] });
  L.push({ id: 'velma', name: 'Velma Voss', role: 'Singer · the Undercroft band', rig: 'elismas', make: () => recolor(makeElismas(), { '#9aa1aa': '#8a2a4a', '#5d636c': '#3a1e2a' }), x: -23, z: -21.5, face: 0.2,
    idle: ["This next one's about a man who owed me money. It's a short song.", "Tips go in the jar. Tips that don't go in the jar go in the band.", "We know four songs. Two of them are the same song slower."] });
  return L; }; }
// the room
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.call(this); if (zTheme(ZF.floor) !== 'under') return;
  const W = 30, D = 28, H = 7, rust = toon('#5a3a26', 'panel'), dark = toon('#1e1a18', 'panel'), wood = toon('#4a3020', 'wood'), metal = toon('#3a3d44', 'panel');
  // grime on the floor: oily puddles and stains
  for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.6 + (i % 4) * 0.4, 12), new THREE.MeshBasicMaterial({ color: i % 3 ? '#0c0a08' : '#0e140c', transparent: true, opacity: 0.45, depthWrite: false })); p.rotation.x = -Math.PI / 2; p.scale.y = 0.6 + (i % 3) * 0.2; p.position.set(-24 + ((i * 37) % 48), 0.012 + i * 0.0005, -20 + ((i * 23) % 44)); props.add(p); }
  // pipes along the ceiling, one of them leaking
  for (let i = 0; i < 4; i++) part(props, Cy(0.22, 0.22, W * 2, 8), i % 2 ? rust : metal, 0, H - 0.5 - (i % 2) * 0.45, -22 + i * 13, 0, 0, Math.PI / 2);
  for (const [x, z] of [[6, -9], [-10, 17]]) levelAnims.push(t => { if (Math.random() < 0.025) burst(V(x, H - 0.8, z), '#5a8a6a', 1, 0.2); });
  // grime on the walls: rusted wainscot and patch plates
  for (const sx of [-1, 1]) { part(props, B(0.12, 2.2, D * 2 - 1), rust, sx * (W - 0.36), 1.1, 0); part(props, B(0.14, 0.12, D * 2 - 1), metal, sx * (W - 0.38), 2.22, 0); for (let i = 0; i < 5; i++) part(props, B(0.14, 0.9 + (i % 2) * 0.5, 1.4), i % 2 ? dark : rust, sx * (W - 0.4), 3.6 + (i % 3) * 0.5, -20 + i * 10 + sx * 2, 0, 0, (i - 2) * 0.05); }
  // shady booths along the right wall: hooded types doing quiet business
  const hood = (shirt, eye) => () => { const g = makeCivilian(shirt, '#14120f', '#2a2430', '#14120f', shirt); part(g, new THREE.ConeGeometry(0.34, 0.62, 8), toon(shirt, 'cloth'), 0, 1.86, -0.02); part(g, B(0.42, 0.5, 0.4), toon(shirt, 'cloth'), 0, 1.62, -0.04); for (const s of [-1, 1]) part(g, B(0.06, 0.03, 0.02), glow(eye), s * 0.07, 1.7, 0.21); return g; };
  for (const [z, n] of [[-1, 2], [6, 1], [13, 2]]) { part(props, B(1.4, 0.5, 3.8), toon('#3a1e1a', 'cloth'), W - 1.2, 0.25, z); part(props, B(0.4, 2.0, 3.8), toon('#3a1e1a', 'cloth'), W - 0.6, 1.0, z); part(props, B(1.2, 0.08, 1.6), wood, W - 2.7, 0.75, z); part(props, Cy(0.08, 0.1, 0.72, 6), dark, W - 2.7, 0.37, z); box(W - 2, z, 2, 1.9);
    part(props, Cy(0.05, 0.05, 0.12, 6), glow('#7fff6a'), W - 2.5, 0.85, z + 0.3);
    for (let k = 0; k < n; k++) { const o = ucChar(hood(['#2a2a30', '#3a2a1e', '#1e2a2a'][(k + z + 30) % 3], ['#ff3b2a', '#7fff6a', '#ffd36a'][(k + z + 30) % 3]), 'civ', W - 1.6, z + (n > 1 ? (k ? 0.9 : -0.9) : 0), -Math.PI / 2, ucChat(-Math.PI / 2)); const R = o.userData.rig; o.position.y = 0.5 - (R ? R.spec.hip : 0.95) + 0.07; sitChar(o, 0.5); if (k) ucSmoke(o, 1.2); } }
  // a jukebox nobody is allowed to touch
  { part(props, B(1.4, 2.0, 0.9), toon('#5a1e2a'), -W + 0.9, 1.0, 6); const jb = part(props, Cy(0.6, 0.6, 0.92, 16, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#ffb347' }), -W + 0.9, 2.0, 6, Math.PI / 2, 0, Math.PI / 2); props.remove(jb); levelGroup.add(jb);
    for (let i = 0; i < 4; i++) part(props, B(0.06, 1.3, 0.05), glow(['#ff6aa8', '#4fd2ff', '#7fff6a', '#ffd36a'][i]), -W + 1.62, 1.0, 5.6 + i * 0.27); box(-W + 0.9, 6, 0.7, 0.5);
    levelAnims.push(t => jb.material.color.setHSL((t * 0.08) % 1, 0.8, 0.55)); }
  // ---- THE RUSTY RIVET: the bar on the back wall ----
  part(props, B(16, 1.1, 1.3), wood, 0, 0.55, -20); part(props, B(16.4, 0.1, 1.6), rust, 0, 1.15, -20); part(props, B(16, 0.14, 0.12), glow('#c8402f'), 0, 0.12, -19.32); box(0, -20, 8, 0.7);
  part(props, B(18, 4.2, 0.4), dark, 0, 2.1, -D + 0.6);
  for (let r = 0; r < 3; r++) { part(props, B(16, 0.08, 0.5), rust, 0, 1.6 + r * 0.9, -D + 0.9); for (let i = 0; i < 16; i++) part(props, Cy(0.08, 0.08, 0.42 + (i % 3) * 0.08, 6), glow(['#5a8a3a', '#8a5a2a', '#6a2a1e', '#c8a03a'][(i * 3 + r) % 4]), -7.4 + i * 0.95, 1.86 + r * 0.9, -D + 0.9); }
  const rv = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.9), new THREE.MeshBasicMaterial({ map: signTex("GRUB'S BAR", '#06121a', '#7fe8ff') })); rv.position.set(0, 3.2, -19.2); rv.rotation.x = 0; levelGroup.add(rv); part(props, B(0.05, 1.4, 0.05), metal, -2.6, 4.3, -19.2); part(props, B(0.05, 1.4, 0.05), metal, 2.6, 4.3, -19.2);
  // only the tired letters flicker: the board stays lit and the second B sputters, the S now and then
  { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 77; const cx = cv.getContext('2d'), tx = new THREE.CanvasTexture(cv), txt = "GRUB'S BAR";
    const draw = dim => { cx.fillStyle = '#06121a'; cx.fillRect(0, 0, 512, 77); cx.strokeStyle = '#7fe8ff'; cx.lineWidth = 4; cx.strokeRect(4, 4, 504, 69); cx.font = 'bold 50px monospace'; cx.textBaseline = 'middle';
      const w = cx.measureText(txt).width; let x = 256 - w / 2;
      for (let i = 0; i < txt.length; i++) { const off = dim.includes(i); cx.fillStyle = off ? '#1c3a44' : '#7fe8ff'; cx.shadowColor = '#7fe8ff'; cx.shadowBlur = off ? 0 : 14; cx.fillText(txt[i], x, 40); x += cx.measureText(txt[i]).width; }
      cx.shadowBlur = 0; tx.needsUpdate = true; };
    draw([]); rv.material.map = tx; rv.material.needsUpdate = true; let last = '';
    levelAnims.push(t => { const d = []; if (Math.sin(t * 13) > 0.7 && Math.sin(t * 1.7) > 0.2) d.push(7); if (Math.sin(t * 9.3 + 1) > 0.95 && Math.sin(t * 0.9) > 0.6) d.push(4); const k = d.join(); if (k !== last) { last = k; draw(d); } }); }
  const nb = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signTex('NO BLASTERS', '#1e1410', '#d9c79a') })); nb.position.set(7.4, 2.6, -D + 0.85); props.add(nb);
  for (let i = 0; i < 7; i++) { const x = -6 + i * 2; part(props, Cy(0.26, 0.26, 0.08, 8), toon('#4a2a1e', 'cloth'), x, 0.78, -18.4); part(props, Cy(0.04, 0.04, 0.75, 5), metal, x, 0.39, -18.4); }
  for (let i = 0; i < 9; i++) part(props, Cy(0.05, 0.06, 0.24, 6), glow(['#5a8a3a', '#8a5a2a', '#c8a03a'][i % 3]), -7 + i * 1.7 + (i % 2) * 0.4, 1.32, -19.8 + (i % 3) * 0.2);
  // patrons hunched at the bar, one asleep face-down on it
  const P = [() => recolor(makeBugHybrid(), { '#5f8a3a': '#6a5a2a', '#3e5e26': '#4a3a1e' }), () => makeCivilian('#3a3430', '#1e1c22', '#8fae6a', '#1e1a18', '#5a3a22'), () => recolor(makeSpearman(), { '#7fae63': '#8a4a6a', '#4f7a3c': '#5a2a4a' }), () => makeCivilian('#5a2a1e', '#2c2a28', '#c58a64', '#cfcac0', '#3a3d44')];
  const PR = ['bughybrid', 'civ', 'spearman', 'civ'];
  [-5, -1, 3].forEach((x, i) => { const o = ucChar(P[i], PR[i], x, -18.2, Math.PI, ucSway); if (i === 1) ucSmoke(o); });
  { const o = ucChar(P[3], 'civ', 6.4, -18.6, Math.PI, null); o.userData.rig.torso.rotation.x = 0.75; o.position.z = -17.9; let k = 0; levelAnims.push(t => { if (!o.parent) return; o.userData.rig.torso.rotation.x = 0.72 + Math.sin(t * 0.6) * 0.04; if (++k % 140 === 0) burst(o.position.clone().add(V(0, 1.6, -0.5)), '#cfe8ff', 1, 0.2); }); }
  // ---- the band, stage left ----
  part(props, B(10, 0.5, 7), toon('#2a1e1a', 'wood'), -24, 0.25, -23.5); box(-24, -23.5, 5, 3.5); part(props, B(10, 0.06, 0.08), glow('#c86aff'), -24, 0.52, -20.02);
  for (const s of [-1, 1]) { part(props, B(1.2, 2.2, 1), dark, -24 + s * 4.2, 1.6, -25.8); for (let k = 0; k < 2; k++) part(props, Cy(0.34, 0.34, 0.05, 12), metal, -24 + s * 4.2, 1.1 + k * 0.9, -25.28, Math.PI / 2); }
  part(props, Cy(0.5, 0.5, 0.5, 12), toon('#8a2a1e'), -26.2, 0.75, -24.4); part(props, Cy(0.3, 0.3, 0.3, 10), toon('#8a2a1e'), -25.2, 0.95, -24.0); part(props, Cy(0.36, 0.36, 0.02, 12), glow('#c8a03a'), -26.8, 1.5, -23.6);
  part(props, Cy(0.03, 0.03, 1.3, 5), metal, -22.8, 1.15, -21.4); part(props, new THREE.SphereGeometry(0.08, 8, 6), metal, -22.8, 1.82, -21.4);
  ucChar(() => recolor(makeBugHybrid(), { '#5f8a3a': '#3a5a7a', '#3e5e26': '#2a3a5a' }), 'bughybrid', -26.2, -25.4, 0.3, (o, t, ph) => { o.position.y = 0.5 + Math.abs(Math.sin(t * 6)) * 0.05; const R = o.userData.rig; R.armL.rotation.x = -0.9 + Math.sin(t * 12) * 0.5; R.armR.rotation.x = -0.9 - Math.sin(t * 12) * 0.5; });
  { const o = ucChar(() => recolor(makeMaxurge(), {}), 'maxurge', -20.6, -24.6, -0.4, (o, t) => { o.position.y = 0.5 + Math.abs(Math.sin(t * 3)) * 0.06; o.rotation.z = Math.sin(t * 1.5) * 0.06; }); part(o, B(0.16, 1.1, 0.06), toon('#6a3a1e', 'wood'), 0.1, 1.2, 0.3, 0, 0, 0.8); }
  const spot = new THREE.PointLight(0xc86aff, 1.3, 14, 1.6); spot.position.set(-23, 4.5, -21); levelGroup.add(spot);
  const jar = part(props, Cy(0.18, 0.15, 0.32, 10), new THREE.MeshLambertMaterial({ color: '#9ad8c8', transparent: true, opacity: 0.5 }), -20.4, 0.66, -20.6); jar.renderOrder = 2;
  // velma's spotlight bob is on the NPC itself (she sways a little)
  setTimeout(() => { const N = typeof npcObjs !== 'undefined' && npcObjs.velma; if (!N) return; const o = N.obj, y0 = o.position.y, r0 = o.rotation.y; levelAnims.push(t => { if (!o.parent) return; o.position.y = y0 + 0.5 + Math.abs(Math.sin(t * 2.2)) * 0.04; o.rotation.y = r0 + Math.sin(t * 0.8) * 0.4; }); }, 80);
  // ---- back-room poker, stage right ----
  part(props, Cy(1.5, 1.5, 0.1, 18), toon('#1f4a2a', 'cloth'), 20, 0.86, -18.6); part(props, Cy(1.6, 1.6, 0.08, 18), wood, 20, 0.8, -18.6); part(props, Cy(0.22, 0.4, 0.8, 8), dark, 20, 0.4, -18.6); solid(20, -18.6, 1.6);
  for (let i = 0; i < 9; i++) { const a = i * 0.7; part(props, Cy(0.09, 0.09, 0.04 + (i % 3) * 0.05, 10), toon(['#c8402f', '#e8e4dc', '#3b4f7a'][i % 3]), 20 + Math.cos(a) * 0.5, 0.94, -18.6 + Math.sin(a) * 0.5); }
  for (let i = 0; i < 4; i++) part(props, B(0.18, 0.01, 0.26), toon('#e8e4dc'), 19.2 + i * 0.5, 0.92, -17.8 + (i % 2) * 0.2, 0, i * 0.4);
  part(props, Cy(0.04, 0.04, 0.12, 6), glow('#c8a03a'), 21, 0.97, -18.2);
  ucChar(() => makeCivilian('#2a3a4a', '#1e1c22', '#9fe8ff', '#cfcac0', '#c9a43a'), 'civ', 22.5, -18.6, -Math.PI / 2, ucChat(-Math.PI / 2));
  { const o = ucChar(() => recolor(makeStagrone(), {}), 'stagrone', 17.3, -18.5, Math.PI / 2, ucChat(Math.PI / 2)); ucSmoke(o, 2.0); }
  ucChar(() => makeCivilian('#6a2a4a', '#1e1c22', '#e0b892', '#5a3a22', '#c86aff'), 'civ', 20, -16.4, Math.PI, ucChat(Math.PI));
  const bulb = new THREE.PointLight(0xffb347, 1.2, 9, 1.8); bulb.position.set(20, 3.2, -18.6); levelGroup.add(bulb); part(props, Cy(0.02, 0.02, 3.4, 4), dark, 20, H - 1.9, -18.6); const shade = part(props, new THREE.ConeGeometry(0.7, 0.45, 12, 1, true), toon('#3a5a3a'), 20, 3.5, -18.6); props.remove(shade); levelGroup.add(shade);
  const bm = part(props, new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd38a' }), 20, 3.25, -18.6); props.remove(bm); levelGroup.add(bm);
  levelAnims.push(t => { const s = Math.sin(t * 0.9) * 0.25; shade.position.x = bm.position.x = bulb.position.x = 20 + s; bulb.intensity = Math.random() < 0.03 ? 0.2 : 1.2; });
  // ---- the back room (members only) in the front-left corner ----
  part(props, B(14, H, 0.4), rust, -23, H / 2, 12); box(-23, 12, 7, 0.2);
  part(props, B(0.4, H, 5.4), rust, -16, H / 2, 14.7); box(-16, 14.7, 0.2, 2.7); part(props, B(0.4, H, 4.6), rust, -16, H / 2, 25.7); box(-16, 25.7, 0.2, 2.3);
  part(props, B(0.4, H - 3.2, 3.6), rust, -16, 3.2 + (H - 3.2) / 2, 21.2); part(props, B(0.12, 3.2, 0.12), metal, -16, 1.6, 19.5); part(props, B(0.12, 3.2, 0.12), metal, -16, 1.6, 23.0);
  const curtain = []; for (let i = 0; i < 6; i++) { const c = part(props, B(0.05, 3.1, 0.55), toon('#5a1e2a', 'cloth'), -16, 1.6, 19.9 + i * 0.58); props.remove(c); levelGroup.add(c); curtain.push(c); }
  levelAnims.push(t => curtain.forEach((c, i) => { const d = player.pos.distanceTo(c.position) < 1.4; c.rotation.y = d ? 1.2 : Math.sin(t * 0.8 + i) * 0.05; }));
  const mo = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.7), new THREE.MeshBasicMaterial({ map: signTex('MEMBERS ONLY', '#140806', '#7fff6a') })); mo.position.set(-15.7, 3.8, 21.2); mo.rotation.y = Math.PI / 2; props.add(mo);
  for (let i = 0; i < 8; i++) { const x = -28.4 + (i % 4) * 1.5, z = 26.4 - Math.floor(i / 4) * 1.6; part(props, B(1.3, 1.1, 1.3), toon(i % 3 ? '#3a2e26' : '#2a3a2a', 'wood'), x, 0.55, z, 0, i * 0.2); if (i % 2 === 0) part(props, B(0.5, 0.2, 0.5), glow('#7fff6a'), x, 1.2, z); box(x, z, 0.7, 0.7); }
  part(props, B(2.6, 0.9, 1.4), wood, -26.5, 0.45, 15.4); box(-26.5, 15.4, 1.3, 0.7); for (let i = 0; i < 6; i++) part(props, B(0.24, 0.12, 0.24), glow(['#ff6aa8', '#7fff6a', '#c86aff'][i % 3]), -27.4 + i * 0.36, 0.96, 15.4);
  part(props, Cy(0.35, 0.35, 1.2, 10), metal, -24.2, 0.6, 15.2); part(props, Cy(0.1, 0.1, 0.5, 6), metal, -24.2, 1.45, 15.2);
  const gl = new THREE.PointLight(0x7fff6a, 1.1, 12, 1.6); gl.position.set(-23, 4.5, 20); levelGroup.add(gl);
  // ---- the hit board stays on the back wall ----
  part(props, B(3, 1.8, 0.1), toon('#1e1c22'), -12, 1.6, -27.5); INTERACTS.push({ x: -12, z: -25.5, r: 2.4, label: 'Hit board (contracts on players)', fn: () => openHitBoard() });
  const hb = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.5), new THREE.MeshBasicMaterial({ map: signTex('CONTRACTS', '#140806', '#c8402f') })); hb.position.set(-12, 2.9, -27.4); props.add(hb);
  // ---- wanted posters on both side walls and the back wall ----
  const wnt = typeof isWanted === 'function' && isWanted(), bty = wnt && typeof outS === 'function' ? outS().bounty : 0;
  const spots = [[-W + 0.35, -14, Math.PI / 2], [-W + 0.35, -11, Math.PI / 2], [-W + 0.35, 2, Math.PI / 2], [W - 0.35, -12, -Math.PI / 2], [W - 0.35, -8, -Math.PI / 2], [W - 0.35, 4, -Math.PI / 2], [W - 0.35, 7, -Math.PI / 2], [-9.4, -D + 0.85, 0], [9.4, -D + 0.85, 0]];
  spots.forEach(([x, z, ry], i) => { const you = wnt && i === 4, d = you ? ['You', 'Known to this bar', `${(bty || 1000).toLocaleString()} CR`, 0] : UC_POSTERS[i % UC_POSTERS.length];
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.24), new THREE.MeshBasicMaterial({ map: ucPoster(d[0], d[1], d[2], d[3], you) })); m.position.set(x, 2.1 + (i % 2) * 0.25, z); m.rotation.set(0, ry, (i % 3 - 1) * 0.06); props.add(m); });
  // ---- the floor: barrel tables, arm wrestlers, drunks ----
  const barrel = (x, z) => { part(props, Cy(0.55, 0.55, 1.1, 12), toon('#5a3a22', 'wood'), x, 0.55, z); part(props, Cy(0.57, 0.57, 0.08, 12), metal, x, 0.3, z); part(props, Cy(0.57, 0.57, 0.08, 12), metal, x, 0.85, z); part(props, Cy(0.8, 0.8, 0.06, 12), wood, x, 1.12, z); solid(x, z, 0.85); };
  for (const [x, z, a] of [[-6, -2, 0.4], [7, 6, 2.2], [-4, 10, 1.3]]) { barrel(x, z); part(props, Cy(0.06, 0.06, 0.24, 6), glow('#c8a03a'), x + 0.2, 1.27, z); for (let k = 0; k < 2; k++) { const aa = a + k * 2.6, px = x + Math.cos(aa) * 1.15, pz = z + Math.sin(aa) * 1.15, ry = Math.atan2(x - px, z - pz);
    const mk = [() => makeCivilian(['#3a3430', '#4a2a2a', '#2a3a2a'][k], '#1e1c22', ['#8fae6a', '#c58a64', '#9fe8ff'][Math.abs(k + Math.round(x)) % 3], '#1e1a18', '#3a3d44'), () => recolor(makeSpearman(), { '#7fae63': '#6a6a3a', '#4f7a3c': '#3a3a1e' })][Math.abs(k + Math.round(z)) % 2];
    const o = ucChar(mk, Math.abs(k + Math.round(z)) % 2 ? 'spearman' : 'civ', px, pz, ry, ucChat(ry)); if (k === 0) ucSmoke(o, Math.abs(k + Math.round(z)) % 2 ? 1.0 : 1.55); } }
  barrel(13, -6); const aw = [], awA = [1, -1].map(s => { const o = ucChar(() => makeChunkMonster(s > 0 ? '#7a5a3a' : '#4a5a6a', s > 0 ? '#5a3a22' : '#2c3a4a', s > 0 ? '#9a7a5a' : '#6a7a8a', '#1e1c22', false), 'chunk', 13 + s * 1.25, -6, s > 0 ? -Math.PI / 2 : Math.PI / 2, null); aw.push(o); return o; });
  levelAnims.push(t => { const lean = Math.sin(t * 0.7) * 0.12 + Math.sin(t * 5.3) * 0.03; aw.forEach((o, i) => { const R = o.userData.rig; R.armR.rotation.x = -1.2; R.armL.rotation.x = -0.3; R.torso.rotation.z = (i ? -1 : 1) * lean; }); });
  // passed out on the floor, with the bottle that did it
  { const o = buildChar(() => makeCivilian('#5a4a2a', '#2c2a28', '#c58a64', '#1e1a18', '#3a3d44'), 'civ'); o.position.set(9.5, 0.22, 13); o.rotation.set(-Math.PI / 2, 0, 0.4); levelGroup.add(o); solid(9.5, 13.6, 0.6); part(props, Cy(0.06, 0.06, 0.3, 6), glow('#5a8a3a'), 10.4, 0.07, 12.2, 0, 0, Math.PI / 2);
    levelAnims.push(t => { if (o.parent && Math.random() < 0.006) burst(o.position.clone().add(V(0, 0.5, 0.7)), '#cfe8ff', 1, 0.15); }); }
  // and one who is still walking, badly
  { const o = buildChar(() => makeCivilian('#4a3a5a', '#1e1c22', '#8fae6a', '#cfcac0', '#c86aff'), 'civ'); blob(o, 0.45); levelGroup.add(o); MOVERS.push([o, 0.45]); const st = {};
    levelAnims.push(t => { if (!o.parent) return; const a = t * 0.18, x = 2 + Math.cos(a) * 6 + Math.sin(t * 1.3) * 0.6, z = 2 + Math.sin(a) * 4; o.rotation.y = Math.atan2(-Math.sin(a) * 6, Math.cos(a) * 4) + Math.sin(t * 2.1) * 0.4; o.position.set(x, 0, z); o.rotation.z = Math.sin(t * 1.7) * 0.14; animRig(o, st, 1 / 60, t); }); }

  // ---- GRUB'S BAR look: hanging chain lamps, a wall of glowing bottles, taps, tables and junk on the floor ----
  { const chain = toon('#2a2c30', 'panel'), bulbM = glow('#ffe2a8'), lamps = [[-6, -17], [0, -17], [6, -17], [-14, -8], [-14, 4], [16, -6], [-4, 14]];
    lamps.forEach(([x, z], i) => { const top = H - 0.1, len = 1.6 + (i % 2) * 0.5; for (let k = 0; k < 6; k++) part(props, new THREE.TorusGeometry(0.06, 0.018, 4, 8), chain, x, top - k * (len / 6), z, 0, k % 2 ? Math.PI / 2 : 0, 0);
      part(props, Cy(0.5, 0.5, 0.06, 10), chain, x, top - len, z); for (let b = 0; b < 4; b++) { const a = b * Math.PI / 2 + 0.4; part(props, new THREE.SphereGeometry(0.11, 8, 6), bulbM, x + Math.cos(a) * 0.38, top - len - 0.14, z + Math.sin(a) * 0.38); }
      if (i % 2 === 0) { const l = new THREE.PointLight(0xffc98a, 0.9, 10, 1.8); l.position.set(x, top - len - 0.4, z); levelGroup.add(l); } });
    // a back-bar wall of bright bottles in neon colours
    const bc = ['#ff4fd8', '#4fe0ff', '#7fff6a', '#ffd36a', '#ff7a3a', '#a86aff'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 14; i++) part(props, Cy(0.09, 0.1, 0.36 + (i % 2) * 0.12, 6), glow(bc[(i + r * 2) % 6]), -6.6 + i * 1.02 + 0.45, 2.3 + r * 0.9, -D + 1.15);
    const bl = new THREE.PointLight(0xff6ad8, 0.8, 9, 1.8); bl.position.set(0, 3, -D + 2.5); levelGroup.add(bl);
    // beer taps along the counter
    for (let i = 0; i < 6; i++) { const x = 2.5 + i * 0.7; part(props, Cy(0.05, 0.05, 0.5, 6), toon('#c9a43a'), x, 1.45, -20.4); part(props, B(0.08, 0.22, 0.08), glow(bc[i]), x, 1.78, -20.4); }
    // mugs of amber beer on the bar
    for (let i = 0; i < 6; i++) part(props, Cy(0.09, 0.09, 0.2, 8), glow(i % 2 ? '#ffb347' : '#ffd36a'), -5.2 + i * 2.1, 1.3, -19.5);
    // tables with drinks and stools in the main room
    [[-14, -8], [-14, 4], [16, -6], [-4, 14]].forEach(([x, z], i) => { part(props, B(2.6, 0.12, 1.4), wood, x, 0.9, z); part(props, B(0.2, 0.85, 0.2), dark, x, 0.43, z); box(x, z, 1.3, 0.7);
      for (const [sx, sz] of [[-1.7, 0], [1.7, 0], [0, 1.2]]) { part(props, Cy(0.28, 0.28, 0.1, 10), toon('#8a1e24', 'cloth'), x + sx, 0.62, z + sz); part(props, Cy(0.05, 0.05, 0.6, 5), metal, x + sx, 0.3, z + sz); }
      for (let k = 0; k < 3; k++) part(props, Cy(0.06, 0.07, 0.28, 6), glow(bc[(i + k) % 6]), x - 0.8 + k * 0.7, 1.1, z + (k % 2) * 0.3 - 0.15); });
    // junk on the floor: crates, cans and scraps
    for (let i = 0; i < 26; i++) { const x = -26 + ((i * 41) % 52), z = -16 + ((i * 29) % 40); if (Math.abs(x - 2) < 8 && Math.abs(z - 2) < 6) continue;
      if (i % 5 === 0) { part(props, B(0.8, 0.6, 0.8), wood, x, 0.3, z, 0, i * 0.7, 0); box(x, z, 0.45, 0.45); }
      else part(props, i % 2 ? Cy(0.05, 0.05, 0.14, 6) : B(0.3, 0.04, 0.22), toon(['#8a8f96', '#c8402f', '#d9c79a', '#3a6a8a'][i % 4]), x, 0.04, z, i % 2 ? Math.PI / 2 : 0, i, 0); }
    // a pair of arcade cabinets glowing on the left wall
    for (const z of [-10, -6.5]) { part(props, B(1.1, 2.0, 0.9), toon('#1a1a2a'), -W + 0.9, 1.0, z); part(props, B(0.05, 0.7, 0.7), glow('#4fe0ff'), -W + 1.47, 1.45, z); part(props, B(0.05, 0.25, 0.8), glow('#ff4fd8'), -W + 1.47, 1.95, z); box(-W + 0.9, z, 0.6, 0.5); }
  }
  // dim, dirty light and a haze of smoke
  for (const [x, z, c, i] of [[0, -16, 0xff5a2a, 1.0], [8, 4, 0x8a3a2a, 0.7], [-8, 2, 0x5a8a4a, 0.5], [14, 16, 0x8a3a2a, 0.6]]) { const l = new THREE.PointLight(c, i, 20, 1.6); l.position.set(x, 4.6, z); levelGroup.add(l); }
  { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(160,150,140,0.5)'); g.addColorStop(1, 'rgba(160,150,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c), haze = [];
    for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.22, depthWrite: false })); s.scale.set(9, 4, 1); levelGroup.add(s); haze.push(s); }
    levelAnims.push(t => haze.forEach((s, i) => s.position.set(-22 + ((i * 11 + t * 0.4) % 46), 3.6 + (i % 3) * 0.6, -22 + ((i * 17) % 42)))); }
}; }
