// =================== THE MILE DOWN: an elevator off the Floating City, a bar a mile down the cliff, and Doc's lab ===================
// Side story: Pail's buddy Big E went down to see what was in the middle. Doc put Big E's brain in a frog.
const MDT = { x: 90, z: 38 }; // the elevator head on the Floating City's east rim
const MD = { ride: 0, act: null, door: null, doorBox: null, frog: null, jar: null, doc: null, pail: null, body: null, seat: null, arcs: [], scope: null, alarm: null, e: null };
const mdF = () => (S.flags && S.flags.md) || 0, mdSet = v => { S.flags = S.flags || {}; S.flags.md = v; markDirty(); };

// ---- the cast ----
function makePail() { const g = makeCivilian('#c8a040', '#3a4a6a', '#c58a64', '#5a3a1a', '#7a5a2a');
  part(g, Cy(0.15, 0.15, 0.12, 10), toon('#c8402f', 'cloth'), 0, 1.9, -0.01); E(g, '#c8402f', 0, 1.97, -0.01, 0.06, 0.05, 0.06); E(g, '#5a3a1a', 0, 1.66, 0.12, 0.05, 0.05, 0.03); return g; }
function makeDoc() { const g = makeCivilian('#e8e8e0', '#2a2a30', '#e0b892', '#f2f2f2', '#9aa1aa');
  part(g, B(0.52, 0.5, 0.3), '#e8e8e0', 0, 0.68, 0); for (const s of [-1, 1]) { E(g, '#f2f2f2', 0.15 * s, 1.84, -0.02, 0.07, 0.07, 0.08); part(g, Cy(0.05, 0.05, 0.05, 10), glow('#ffb03a'), 0.055 * s, 1.79, 0.13, Math.PI / 2); }
  part(g, B(0.2, 0.02, 0.02), '#2a2a30', 0, 1.79, 0.14); return g; }
function makeMags() { const g = makeCivilian('#5a1e2a', '#1e1c22', '#e8b896', '#c84040', '#1e1c22'); E(g, '#c84040', 0, 1.9, -0.1, 0.08, 0.08, 0.08); return g; }
function makeBigE(feral) { const g = makeCivilian(feral ? '#3a4a2a' : '#4a6a3a', '#2a2a40', '#8a5a3a', '#1e1a18', feral ? '#5a1a14' : null);
  E(g, '#1e1a18', 0, 1.68, 0.1, 0.11, 0.08, 0.05);
  for (let i = 0; i < 5; i++) part(g, B(0.025, 0.06, 0.02), '#2a0a0a', -0.1 + i * 0.05, 1.83, 0.125); part(g, B(0.24, 0.012, 0.02), '#5a1a14', 0, 1.83, 0.128);
  if (feral) for (const s of [-1, 1]) { part(g, B(0.06, 0.05, 0.02), glow('#8aff3a'), 0.05 * s, 1.78, 0.135); part(g, B(0.12, 0.08, 0.04), '#3a4a2a', 0.3 * s, 1.0, 0.08); }
  return g; }
function makeFrog() { const g = new THREE.Group(), sk = '#3fa860', bel = '#b8e07a';
  E(g, sk, 0, 0.2, 0, 0.22, 0.17, 0.26); E(g, bel, 0, 0.17, 0.08, 0.17, 0.12, 0.2); E(g, sk, 0, 0.33, 0.14, 0.2, 0.13, 0.15);
  for (const s of [-1, 1]) { E(g, sk, 0.2 * s, 0.13, -0.08, 0.1, 0.1, 0.16); E(g, sk, 0.26 * s, 0.04, 0.06, 0.08, 0.03, 0.12); E(g, sk, 0.12 * s, 0.1, 0.2, 0.04, 0.1, 0.04);
    E(g, sk, 0.11 * s, 0.43, 0.2, 0.07, 0.07, 0.07); E(g, glow('#ffd23a'), 0.12 * s, 0.44, 0.25, 0.05, 0.05, 0.03); part(g, B(0.05, 0.015, 0.01), '#0a0a0a', 0.12 * s, 0.44, 0.28); }
  part(g, B(0.22, 0.012, 0.01), '#1a3a20', 0, 0.3, 0.29);
  // Big E's brain, under a glass dome bolted to the skull
  E(g, '#f29ab0', 0, 0.48, 0.06, 0.12, 0.08, 0.13); for (let i = -1; i <= 1; i++) part(g, B(0.006, 0.02, 0.22), '#c86a84', i * 0.05, 0.53, 0.06);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: '#cfefff', transparent: true, opacity: 0.28, shininess: 90, depthWrite: false })); dome.position.set(0, 0.42, 0.06); g.add(dome);
  part(g, Cy(0.165, 0.165, 0.03, 14), '#8a8f99', 0, 0.42, 0.06); return g; }

// a figure in a holder, so it can face one way (holder) and tip over another (inner)
function mdActor(o, x, z, ry, par) { const h = new THREE.Group(); h.add(o); h.position.set(x, 0, z); h.rotation.y = ry; (par || MD.dyn || props).add(h); return { h, o, st: {} }; }
function mdTube(a, b, sag, col) { const m = a.clone().lerp(b, 0.5); m.y -= sag; const c = new THREE.CatmullRomCurve3([a, m, b]); return new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.03, 5), toon(col)); }

// ---- textures ----
function mdSkyTex(dusk) { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, dusk ? '#1a1a3a' : '#5a7ab0'); gr.addColorStop(0.55, dusk ? '#c8603a' : '#cfe0f0'); gr.addColorStop(1, dusk ? '#3a1a2a' : '#8aa0c0'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { const y = 120 + Math.random() * 130, r = 14 + Math.random() * 30; x.fillStyle = `rgba(${dusk ? '255,190,170' : '255,255,255'},${0.15 + Math.random() * 0.25})`; x.beginPath(); x.ellipse(Math.random() * 256, y, r * 1.8, r * 0.6, 0, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function mdCheckTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#e8e4d8' : '#1a1a1e'; x.fillRect(i * 16, j * 16, 16, 16); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 4.5); t.magFilter = THREE.NearestFilter; t.encoding = THREE.sRGBEncoding; return t; }
function mdBoardTex() { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#1e2a22'; x.fillRect(0, 0, 512, 256);
  x.fillStyle = 'rgba(240,240,230,.85)'; x.font = '26px "Courier New",monospace';
  ['E = mc² + 🐸', 'BRAIN (m) → FROG (f)', 'f(x) = RIBBIT', 'Δ VOLTAGE ≥ 1.21 GW', 'DOCILE?? (yes)', 'Ψ_frog ⊗ Ψ_man'].forEach((s, i) => x.fillText(s, 20 + (i % 2) * 250, 50 + Math.floor(i / 2) * 70));
  x.strokeStyle = 'rgba(240,240,230,.7)'; x.lineWidth = 3; x.beginPath(); x.arc(440, 200, 30, 0, 6); x.stroke(); x.beginPath(); x.moveTo(300, 230); x.lineTo(380, 180); x.stroke();
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function mdPosterTex(top, big, col) { const c = document.createElement('canvas'); c.width = 192; c.height = 280; const x = c.getContext('2d');
  x.fillStyle = '#1a1210'; x.fillRect(0, 0, 192, 280); x.fillStyle = col; x.beginPath(); x.moveTo(96, 40); for (let i = 0; i < 9; i++) x.lineTo(96 + Math.cos(i * 0.7 + 0.3) * 90, 150 + Math.sin(i * 0.7 + 0.3) * 70); x.fill();
  x.fillStyle = '#ffe9b0'; x.textAlign = 'center'; x.font = 'bold 18px Impact, sans-serif'; x.fillText(top, 96, 30); x.font = 'bold 34px Impact, sans-serif'; big.split('|').forEach((s, i) => x.fillText(s, 96, 215 + i * 34));
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }

// ---- the bar and the lab ----
LEVELS.miledown = {
  id: 'miledown', name: 'The Mile Down', tag: 'A bar one mile under the Floating City', lvls: 'Lv 30+', size: 60, center: [0, 0], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true,
  terrain: null, palette: { grass: '#1a141e' }, paths: [], river: [], pools: [], lava: [],
  zones: [{ id: 'mdbar', name: 'The Mile Down', lvl: 'Safe', x: 0, z: 6, r: 9, col: '#1a141e', safe: true, h: 0 }, { id: 'mdlab', name: "Doc's Lab", lvl: 'Keep out', x: 0, z: -12, r: 9, col: '#0e1a14', h: 0 }],
  safes: [{ x: 0, z: 7, r: 7.5 }], spawn: { x: 0, z: 11, yaw: 0 }, menu: { x: 0, z: 6, r: 7, h: 2.6 }, npcBase: [0, 0], spawns: [],
  npcs: [
    { id: 'pail_md', name: 'Pail', role: "Big E's buddy", rig: 'civ', make: makePail, x: -6.1, z: 7.4, face: Math.PI / 2,
      idle: ["Big E came down three days ago. Mags says he went through that door.", "I ain't going in first. I'm the moral support.", "You hear that hum? That's not the jukebox."] },
    { id: 'mags', name: 'Mags', role: 'Bartender', rig: 'civ', make: makeMags, x: -9.4, z: 5, face: Math.PI / 2,
      idle: ["Mile down, mile high prices. That's the joke. Nobody laughs.", "Doc pays his tab in favors. I don't ask what kind.", "The window? That's just clouds. Don't look too long, they look back."] },
  ],
  build() {
    const W = 11, H = 4.2, rock = toon('#3a2e2a', 'panel'), rock2 = toon('#2a2220', 'panel'), wood = toon('#4a2a1a', 'wood'), chrome = toon('#b8bcc4'), red = toon('#a8202a', 'cloth');
    MD.arcs = []; MD.e = null; MD.smoke = null; const dyn = new THREE.Group(); levelGroup.add(dyn); MD.dyn = dyn; // things that move or hide stay out of props
    // floor, ceiling and cave walls
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 18).rotateX(-Math.PI / 2), toon('#2a1a18', 'wood')); fl.position.z = 5.5; props.add(fl);
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 40).rotateX(Math.PI / 2), toon('#1a1412')); ce.position.set(0, H, -3); props.add(ce);
    const wall = (x, z, w, d, m) => { part(props, B(w, H, d), m || rock, x, H / 2, z); box(x, z, w / 2, d / 2); };
    wall(-W, 5.5, 0.6, 18); wall(0, 14.4, W * 2, 0.6); wall(W, 0.5, 0.6, 6); wall(W, 12.5, 0.6, 3.4); part(props, B(0.6, 0.9, 6.2), rock, W, 0.45, 7.8); part(props, B(0.6, 0.6, 6.2), rock, W, H - 0.3, 7.8); box(W, 7.8, 0.3, 3.1);
    for (let i = 0; i < 26; i++) { const sx = i % 2 ? 1 : -1, z = -2 + (i * 7 % 16), y = 0.4 + (i * 5 % 9) * 0.42, s = 0.5 + (i % 3) * 0.3; if (sx > 0 && z > 3.5 && z < 12) continue; part(props, new THREE.DodecahedronGeometry(s, 0), i % 3 ? rock : rock2, sx * (W - 0.25), y, z, i, i * 2, 0); }
    for (let i = 0; i < 9; i++) part(props, new THREE.ConeGeometry(0.18 + (i % 3) * 0.08, 0.6 + (i % 4) * 0.3, 5), rock2, -9 + i * 2.3, H - 0.3, 1 + (i * 5 % 12), Math.PI);
    // the window: clouds a mile under the island
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 22), new THREE.MeshBasicMaterial({ map: mdSkyTex(true), fog: false })); sky.position.set(W + 14, 2, 8); sky.rotation.y = -Math.PI / 2; props.add(sky);
    for (const z of [4.7, 7.8, 10.9]) part(props, B(0.2, 2.6, 0.12), chrome, W - 0.2, 2.2, z); part(props, B(0.2, 0.12, 6.2), chrome, W - 0.2, 3.5, 7.8); part(props, B(0.2, 0.12, 6.2), chrome, W - 0.2, 0.95, 7.8);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.6), new THREE.MeshPhongMaterial({ color: '#9fc8ff', transparent: true, opacity: 0.1, shininess: 100, depthWrite: false })); gl.position.set(W - 0.25, 2.2, 7.8); gl.rotation.y = -Math.PI / 2; props.add(gl);
    // the bar counter, stools, bottles and the sign
    part(props, B(1.2, 1.1, 9), wood, -8, 0.55, 5); part(props, B(1.5, 0.08, 9.3), toon('#7a4a2a', 'wood'), -8, 1.13, 5); part(props, B(0.04, 0.06, 9), glow('#ff3a8a'), -7.24, 1.0, 5); box(-8, 5, 0.6, 4.5);
    for (const z of [2, 4, 6, 8]) { part(props, Cy(0.05, 0.05, 0.7, 6), chrome, -6.9, 0.35, z); part(props, Cy(0.24, 0.24, 0.1, 12), red, -6.9, 0.72, z); }
    for (let i = 0; i < 14; i++) part(props, Cy(0.06, 0.08, 0.32 + (i % 3) * 0.08, 6), glow(['#8aff3a', '#ffd36a', '#ff6aa8', '#4fd2ff'][i % 4]), -10.5, 1.9 + (i % 2) * 0.7, 1.4 + (i >> 1) * 1.05);
    part(props, B(0.1, 0.06, 8), wood, -10.5, 1.72, 5); part(props, B(0.1, 0.06, 8), wood, -10.5, 2.42, 5);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.9), new THREE.MeshBasicMaterial({ map: signTex('THE MILE DOWN', '#100808', '#ff3a8a') })); sg.position.set(-10.62, 3.3, 5); sg.rotation.y = Math.PI / 2; props.add(sg);
    const sg2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.4), new THREE.MeshBasicMaterial({ map: signTex('5,280 FT BELOW', '#100808', '#4fd2ff') })); sg2.position.set(-10.62, 2.75, 5); sg2.rotation.y = Math.PI / 2; props.add(sg2);
    // booths by the window, a jukebox, an atomic clock and B-movie posters
    for (const z of [4.2, 10.4]) { part(props, B(1.4, 0.75, 1), toon('#e8e4dc'), 8.8, 0.75, z); part(props, Cy(0.06, 0.06, 0.75, 6), chrome, 8.8, 0.37, z); for (const s of [-1, 1]) { part(props, B(1.6, 0.45, 0.6), red, 8.8, 0.22, z + s * 1.0); part(props, B(1.6, 0.9, 0.18), red, 8.8, 0.9, z + s * 1.25); } box(8.8, z, 0.8, 1.35); }
    const jb = new THREE.Group(); part(jb, B(1.1, 1.5, 0.7), toon('#7a2a1a', 'wood'), 0, 0.75, 0); part(jb, Cy(0.55, 0.55, 0.7, 16), glow('#ffb03a'), 0, 1.5, 0, Math.PI / 2); part(jb, Cy(0.45, 0.45, 0.72, 16), toon('#7a2a1a', 'wood'), 0, 1.5, 0, Math.PI / 2); part(jb, B(0.8, 0.5, 0.05), glow('#ff6aa8'), 0, 0.9, 0.36); jb.position.set(6, 0, 13.6); jb.rotation.y = Math.PI; props.add(jb); box(6, 13.6, 0.6, 0.4);
    const clk = new THREE.Group(); part(clk, Cy(0.18, 0.18, 0.06, 10), chrome, 0, 0, 0, Math.PI / 2); for (let i = 0; i < 8; i++) part(clk, B(0.6, 0.03, 0.03), chrome, Math.cos(i * 0.785) * 0.3, Math.sin(i * 0.785) * 0.3, 0, 0, 0, i * 0.785); clk.position.set(-4, 3.2, 14.05); props.add(clk);
    [['THE MILE DOWN PRESENTS', 'IT CAME|FROM BELOW', '#5a8a2a'], ['ATOMIC TERROR', 'FROG|MEN', '#c8402f'], ['SEE IT! FEAR IT!', 'THE BRAIN|THAT HOPPED', '#3a6aa8']].forEach(([a, b, c], i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), new THREE.MeshBasicMaterial({ map: mdPosterTex(a, b, c) })); m.position.set(-1.5 + i * 2.2, 2.3, 14.08); m.rotation.y = Math.PI; props.add(m); });
    // the elevator cage you came down in
    for (const s of [-1, 1]) part(props, B(0.14, H, 0.14), chrome, s * 1.1, H / 2, 13.2); part(props, B(2.3, 0.14, 0.14), chrome, 0, 2.7, 13.2);
    for (let i = 0; i < 9; i++) part(props, B(0.04, 2.6, 0.04), toon('#8a8f99'), -0.9 + i * 0.225, 1.3, 13.4, 0, 0, i % 2 ? 0.35 : -0.35);
    part(props, B(1.2, 0.3, 0.05), glow('#ffd36a'), 0, 3.1, 13.25);
    INTERACTS.push({ x: 0, z: 12, r: 2.0, label: 'Ride the elevator up', fn: () => { SFX.door(); travel('skycity', { at: { x: MDT.x - 3.2, z: MDT.z, yaw: Math.PI / 2 } }); } });
    // the lab wall and its door
    part(props, B(10, H, 0.5), rock, -6, H / 2, -3); box(-6, -3, 5, 0.25); part(props, B(10, H, 0.5), rock, 6, H / 2, -3); box(6, -3, 5, 0.25); part(props, B(2, H - 2.6, 0.5), rock, 0, H - (H - 2.6) / 2, -3);
    const dr = new THREE.Group(); part(dr, B(2, 2.6, 0.16), toon('#5d636c', 'panel'), 0, 1.3, 0); for (let i = 0; i < 6; i++) part(dr, B(0.3, 0.12, 0.02), toon(i % 2 ? '#1a1a1a' : '#ffd23a'), -0.75 + i * 0.3, 0.3, 0.09, 0, 0, 0.6);
    part(dr, Cy(0.3, 0.3, 0.06, 12), toon('#8a8f99'), 0, 1.5, 0.1, Math.PI / 2); dr.position.set(0, 0, -3); dyn.add(dr); MD.door = dr;
    const ds = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.4), new THREE.MeshBasicMaterial({ map: signTex('LAB · KEEP OUT', '#1a0a0a', '#ff3a2a') })); ds.position.set(0, 3.0, -2.72); props.add(ds);
    box(0, -3, 1, 0.25); MD.doorBox = BOXES[BOXES.length - 1];
    MD.act = { x: 0, z: -1.6, r: 2.0, label: 'Open the lab door', fn: mdDoor }; INTERACTS.push(MD.act);
    // ---- DOC'S LAB: checkerboard floor, tesla coils, reel-to-reels, oscilloscopes and jars ----
    const lf = new THREE.Mesh(new THREE.PlaneGeometry(20, 18).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: mdCheckTex() })); lf.position.set(0, 0.01, -12); props.add(lf);
    wall(-10, -12, 0.6, 18, toon('#4a5a52', 'panel')); wall(10, -12, 0.6, 18, toon('#4a5a52', 'panel')); wall(0, -21, 20, 0.6, toon('#4a5a52', 'panel'));
    part(props, B(19.4, 0.3, 0.1), toon('#2a3a32'), 0, 1.2, -20.68); part(props, B(0.1, 0.3, 17.4), toon('#2a3a32'), -9.68, 1.2, -12); part(props, B(0.1, 0.3, 17.4), toon('#2a3a32'), 9.68, 1.2, -12);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ map: mdBoardTex() })); bd.position.set(0, 2.5, -20.66); props.add(bd); part(props, B(4.2, 2.2, 0.06), wood, 0, 2.5, -20.72);
    // oscilloscopes (one live green trace) and reel-to-reel computers
    const sc = document.createElement('canvas'); sc.width = 128; sc.height = 96; const sct = new THREE.CanvasTexture(sc); MD.scope = { c: sc, x: sc.getContext('2d'), t: sct };
    for (const x of [-6.5, -4.6, 4.6, 6.5]) { part(props, B(1.6, 1.4, 0.8), toon('#6a6a5a', 'panel'), x, 0.7, -20.2); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.65), new THREE.MeshBasicMaterial({ map: sct })); s.position.set(x, 1.0, -19.78); props.add(s); for (let k = 0; k < 4; k++) part(props, Cy(0.05, 0.05, 0.05, 8), glow(k % 2 ? '#ff3a2a' : '#ffd36a'), x - 0.5 + k * 0.33, 0.45, -19.78, Math.PI / 2); box(x, -20.2, 0.8, 0.4); }
    MD.reels = [];
    for (const z of [-17, -14, -11, -8]) { part(props, B(0.9, 2.6, 1.6), toon('#cfcab8', 'panel'), 9.2, 1.3, z); box(9.2, z, 0.45, 0.8);
      for (const dy of [0, 0.75]) for (const dz of [-0.35, 0.35]) { const r = part(dyn, Cy(0.28, 0.28, 0.06, 12), toon('#2a2a2a'), 8.72, 1.75 + dy * 0.6, z + dz, 0, 0, Math.PI / 2); MD.reels.push(r); }
      for (let k = 0; k < 6; k++) part(props, B(0.04, 0.06, 0.06), glow(k % 3 ? '#ffd36a' : '#ff3a2a'), 8.73, 0.9, z - 0.6 + k * 0.24); }
    // specimen jars on shelves
    for (const y of [1.0, 1.9, 2.8]) part(props, B(0.6, 0.06, 7), wood, -9.4, y, -12);
    for (let i = 0; i < 15; i++) { const y = [1.0, 1.9, 2.8][i % 3], z = -15.2 + Math.floor(i / 3) * 1.6, g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 10), new THREE.MeshPhongMaterial({ color: ['#8aff3a', '#4fd2ff', '#ffd36a'][i % 3], transparent: true, opacity: 0.35, emissive: ['#2a6a10', '#104a6a', '#6a4a10'][i % 3] }))); g.children[0].position.y = 0.28;
      E(g, ['#c86a84', '#3fa860', '#e8d0a0', '#8a5a9a', '#3fa860'][i % 5], 0, 0.27, 0, 0.1, 0.09, 0.08); part(g, Cy(0.21, 0.21, 0.06, 10), toon('#8a8f99'), 0, 0.58, 0); g.position.set(-9.4, y + 0.03, z); props.add(g); }
    // tesla coils, each one throwing a live arc
    for (const [x, z] of [[-7, -18], [7, -18], [-7, -5.5], [7, -5.5]]) { part(props, Cy(0.4, 0.55, 0.4, 10), toon('#3a3d44'), x, 0.2, z); part(props, Cy(0.16, 0.22, 2.6, 10), toon('#b87333'), x, 1.7, z); for (let k = 0; k < 6; k++) part(props, Cy(0.24, 0.24, 0.04, 10), toon('#cfcab8'), x, 0.7 + k * 0.4, z);
      part(props, new THREE.TorusGeometry(0.42, 0.14, 8, 18), chrome, x, 3.2, z, Math.PI / 2); solid(x, z, 0.6);
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 10 }, () => V(x, 3.2, z))), new THREE.LineBasicMaterial({ color: '#c8b0ff', transparent: true, fog: false })); dyn.add(ln); MD.arcs.push({ ln, x, z }); }
    // the operating table, the jar and the big switch
    part(props, B(1.1, 0.12, 2.8), chrome, 0, 0.92, -12.2); part(props, B(0.2, 0.86, 0.2), chrome, 0, 0.43, -11.2); part(props, B(0.2, 0.86, 0.2), chrome, 0, 0.43, -13.2); box(0, -12.2, 0.55, 1.4);
    for (const z of [-11.4, -12.4]) part(props, B(1.16, 0.06, 0.12), toon('#5a3a2a'), 0, 1.06, z);
    part(props, Cy(0.5, 0.6, 0.85, 12), toon('#3a3d44'), 2.2, 0.42, -13.3); solid(2.2, -13.3, 0.6);
    const jar = new THREE.Group(); jar.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 16), new THREE.MeshPhongMaterial({ color: '#bfffd8', transparent: true, opacity: 0.22, shininess: 100, depthWrite: false })));
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.75, 16), new THREE.MeshPhongMaterial({ color: '#6aff8a', transparent: true, opacity: 0.25, emissive: '#1a6a2a', depthWrite: false })); liq.position.y = -0.11; jar.add(liq);
    part(jar, Cy(0.45, 0.45, 0.08, 16), toon('#8a8f99'), 0, 0.52, 0); jar.position.set(2.2, 1.35, -13.3); dyn.add(jar); MD.jar = jar; MD.liq = liq;
    const frog = buildChar(makeFrog); frog.position.set(2.2, 0.88, -13.3); frog.rotation.y = -0.6; dyn.add(frog); MD.frog = frog;
    props.add(mdTube(V(2.2, 1.9, -13.3), V(0.0, 1.15, -13.8), -0.6, '#c8402f')); props.add(mdTube(V(2.1, 1.9, -13.2), V(0.15, 1.15, -13.7), -0.8, '#1e1c22'));
    const lever = new THREE.Group(); part(lever, B(0.5, 0.8, 0.2), toon('#3a3d44'), 0, 0, 0); const arm = new THREE.Group(); part(arm, Cy(0.04, 0.04, 0.7, 6), chrome, 0, 0.35, 0); part(arm, new THREE.SphereGeometry(0.09, 8, 6), red, 0, 0.72, 0); arm.position.z = 0.12; arm.rotation.x = 0.7; lever.add(arm);
    lever.position.set(-4.2, 1.5, -15.6); dyn.add(lever); MD.lever = arm;
    part(props, B(1.8, 1.0, 0.8), toon('#6a6a5a', 'panel'), -4.2, 0.5, -15.6); box(-4.2, -15.6, 0.9, 0.4);
    // the red alarm light
    const al = new THREE.PointLight(0xff2a1a, 0, 14); al.position.set(0, 3.8, -12); levelGroup.add(al); MD.alarm = al; part(props, Cy(0.2, 0.25, 0.25, 10), glow('#ff2a1a'), 0, 4.05, -12);
    // the cast in the lab: Big E on the table, Doc at the switch, Pail in the doorway
    const st = mdF();
    MD.body = mdActor(buildChar(() => makeBigE(false), 'civ'), 0, -11.0, 0); MD.body.o.scale.setScalar(1.25); MD.body.o.rotation.x = -Math.PI / 2; MD.body.o.position.y = 1.12; MD.body.h.visible = st === 0;
    MD.doc = mdActor(buildChar(makeDoc, 'civ'), -3.6, -14.9, -2.5); if (st >= 1) mdDocDown();
    MD.pail = mdActor(buildChar(makePail, 'civ'), 0.6, -2.2, Math.PI); MD.pail.h.visible = false;
    if (st >= 2) { const sh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 1.9), toon('#e8e8e0', 'cloth')); sh.position.set(MD.doc.h.position.x, 0.12, MD.doc.h.position.z); sh.rotation.y = MD.doc.h.rotation.y; props.add(sh); MD.doc.h.visible = false; frog.visible = false; }
    // after: Big E's body on a stool, Big E the frog on the bar with a tiny glass
    MD.seat = mdActor(buildChar(() => makeBigE(false), 'civ'), -6.9, 4, -Math.PI / 2); { const o = MD.seat.o, R = o.userData.rig; o.scale.setScalar(1.25); o.position.y = 0.77 - (R ? R.spec.hip : 0.95) * 1.25 + 0.06; sitChar(o, 0.6); o.rotation.x = 0.35; if (R && R.head) R.head.rotation.x = 0.5; if (R && R.armL) R.armL.rotation.x = -1.1; }
    MD.barFrog = mdActor(buildChar(makeFrog), -7.9, 4.9, Math.PI / 2 - 0.3); MD.barFrog.h.position.y = 1.17;
    part(MD.barFrog.h, Cy(0.05, 0.04, 0.1, 8), new THREE.MeshPhongMaterial({ color: '#ffb03a', transparent: true, opacity: 0.7 }), 0.12, 0.06, 0.32);
    part(props, Cy(0.07, 0.06, 0.16, 8), new THREE.MeshPhongMaterial({ color: '#ffb03a', transparent: true, opacity: 0.7 }), -7.7, 1.25, 3.7);
    MD.seat.h.visible = MD.barFrog.h.visible = st >= 2;
    if (st >= 2) { MD.act.label = 'Look into the lab'; MD.act.fn = () => toast('THE LAB', "Doc's under a sheet. The coils still hum.", 3); mdOpenDoor(); }
    else if (st === 1) { mdOpenDoor(); setTimeout(() => { if (LEVEL.id === 'miledown') mdSpawnBody(V(0.6, 0, -9.6)); }, 400); }
    // lights: neon pink and blue in the bar, cold green in the lab
    for (const [x, z, c, k] of [[-6, 5, 0xff3a8a, 1.4], [6, 8, 0x4fd2ff, 1.1], [0, 12, 0xffb03a, 0.9], [-2, 2, 0xffd9a0, 0.6], [-5, -9, 0x6aff9a, 0.9], [5, -15, 0x8ab0ff, 0.9], [0, -18, 0x6aff9a, 0.6]]) { const l = new THREE.PointLight(c, k, 16); l.position.set(x, H - 0.6, z); levelGroup.add(l); }
    let last = 0; levelAnims.push(t => { if (LEVEL.id !== 'miledown') return; const dt = Math.min(0.1, t - last || 0.016); last = t; mdTick(t, dt); });
  }
};
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'miledown') return false; return _po(id); }; }

function mdTick(t, dt) {
  // arcs crackle between the coil tops and the room, harder when the alarm is on
  const hot = MD.alarm && MD.alarm.intensity > 0;
  for (const a of MD.arcs) { if (Math.random() < (hot ? 0.6 : 0.22)) { const p = a.ln.geometry.attributes.position, tx = a.x * 0.4 + (Math.random() - 0.5) * 6, ty = 0.5 + Math.random() * 3.4, tz = a.z * 0.6 - 5 + (Math.random() - 0.5) * 6;
      for (let i = 0; i < 10; i++) { const k = i / 9; p.setXYZ(i, a.x + (tx - a.x) * k + (i && i < 9 ? (Math.random() - 0.5) * 0.5 : 0), 3.2 + (ty - 3.2) * k + (i && i < 9 ? (Math.random() - 0.5) * 0.5 : 0), a.z + (tz - a.z) * k + (i && i < 9 ? (Math.random() - 0.5) * 0.5 : 0)); }
      p.needsUpdate = true; a.ln.visible = true; } else if (Math.random() < 0.5) a.ln.visible = false; }
  if (MD.alarm && hot) MD.alarm.position.x = Math.sin(t * 9) * 2;
  if (MD.reels) MD.reels.forEach((r, i) => { r.rotation.x += dt * (i % 2 ? 2 : -3); });
  if (MD.liq) MD.liq.material.opacity = 0.22 + Math.sin(t * 2) * 0.06;
  if (MD.frog && MD.frog.visible && !MD.frog.userData.held) MD.frog.position.y = 0.88 + Math.sin(t * 1.3) * 0.04;
  const s = MD.scope; if (s && (t * 20 | 0) % 2 === 0) { const x = s.x; x.fillStyle = '#04140a'; x.fillRect(0, 0, 128, 96); x.strokeStyle = 'rgba(80,255,120,.25)'; x.lineWidth = 1; for (let i = 16; i < 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 96); x.stroke(); }
    x.strokeStyle = '#6aff8a'; x.lineWidth = 2; x.beginPath(); for (let i = 0; i < 128; i++) { const y = 48 + Math.sin(i * 0.15 + t * 6) * (hot ? 34 : 16) * Math.sin(i * 0.03 + t); i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); s.t.needsUpdate = true; }
  if (MD.smoke) MD.smoke.forEach((m, i) => { m.position.y += dt * 0.35; m.scale.multiplyScalar(1 + dt * 0.4); m.material.opacity = Math.max(0, m.material.opacity - dt * 0.07); if (m.material.opacity <= 0) { m.position.set(-7.4 + Math.random() * 0.4, 1.4, 4.6 + Math.random() * 0.6); m.scale.setScalar(0.3); m.material.opacity = 0.32; } });
}
function mdOpenDoor() { if (MD.door) MD.door.visible = false; const i = BOXES.indexOf(MD.doorBox); if (i >= 0) BOXES.splice(i, 1); }
function mdDocDown() { const d = MD.doc; d.h.position.set(-3.1, 0, -13.4); d.h.rotation.y = -0.6; d.o.rotation.x = -Math.PI / 2; d.o.position.y = 0.15; }
function mdSmoke() { if (MD.smoke) return; MD.smoke = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshBasicMaterial({ color: '#d8d0c8', transparent: true, opacity: 0.05 * i, depthWrite: false })); m.position.set(-7.4, 1.4 + i * 0.25, 4.8); MD.dyn.add(m); MD.smoke.push(m); } }

// ---- the feral body ----
Object.assign(ENEMY, { bigebody: { rig: 'civ', name: 'Big E (the body)', make: () => makeBigE(true), scale: 1.25, hp: 1400, speed: 4.2, r: 0.55, hy: 1.0, xp: 900, cr: [40, 60], elite: true, melee: { dmg: 38, rate: 0.9, reach: 2.3 }, drops: [] } });
function mdSpawnBody(p) { if (MD.e && !MD.e.dead) return MD.e; const lv = Math.max(30, Math.min(70, S.lvl)); const e = makeEnemy({ zone: 'mdlab', type: 'bigebody', n: 1, lv: [lv, lv], once: true, at: [p.x, p.z + 12] });
  e.obj.position.set(p.x, 0, p.z); e.aggro = true; MD.e = e; return e; }
{ const _qk = questProgressKill; questProgressKill = function (type) { _qk(type); if (type === 'bigebody' && LEVEL.id === 'miledown' && mdF() === 1) setTimeout(mdAfter, 1600); }; }

// ---- the cutscenes ----
const mdCam = (px, py, pz, lx, ly, lz) => { camera.position.set(px, py, pz); camera.lookAt(lx, ly, lz); };
function mdRideScene() {
  if (LEVEL.id !== 'miledown') return;
  // a shaft beside the bar: the cliff, the cage and the sky, built just for the ride
  const g = new THREE.Group(); levelGroup.add(g); const rock = toon('#4a3a30', 'panel'), roots = toon('#5a4030', 'wood');
  for (let i = 0; i < 60; i++) part(g, new THREE.DodecahedronGeometry(1.5 + (i % 4) * 0.8, 0), i % 3 ? rock : toon('#3a2e28', 'panel'), 52 + (i % 3) * 1.0, -6 + i * 3.4, 40 + ((i * 7) % 9) - 4, i, i * 1.3, 0);
  for (let i = 0; i < 16; i++) part(g, Cy(0.08, 0.14, 4 + (i % 4), 5), roots, 57.4, 10 + i * 12, 38 + (i % 5), 0.4 * (i % 3 - 1), 0, 0.3);
  const sk = new THREE.Mesh(new THREE.PlaneGeometry(260, 220), new THREE.MeshBasicMaterial({ map: mdSkyTex(true), fog: false })); sk.position.set(150, 80, 40); sk.rotation.y = -Math.PI / 2; g.add(sk);
  const signs = []; for (const [y, txt] of [[150, '1,000 FT · KEEP HANDS INSIDE'], [95, 'DANGER · NO RETURN'], [45, 'MILE DOWN · NEARLY THERE']]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.7), new THREE.MeshBasicMaterial({ map: signTex(txt, '#1a0a0a', '#ffd23a') })); m.position.set(58.3, y, 40); m.rotation.y = Math.PI / 2; g.add(m); signs.push(m); }
  const cage = new THREE.Group(); const ch = toon('#8a8f99'); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(cage, B(0.1, 2.8, 0.1), ch, x, 1.4, z); part(cage, B(2.2, 0.1, 2.2), ch, 0, 0, 0); part(cage, B(2.2, 0.1, 2.2), ch, 0, 2.8, 0);
  for (let i = 0; i < 8; i++) part(cage, B(0.03, 2.8, 0.03), ch, -0.9 + i * 0.26, 1.4, -1);
  part(cage, Cy(0.03, 0.03, 300, 4), toon('#3a3d44'), 0, 152, 0); const lamp = new THREE.PointLight(0xffd36a, 1.2, 8); lamp.position.set(0, 2.5, 0); cage.add(lamp); part(cage, new THREE.SphereGeometry(0.12, 8, 6), glow('#ffd36a'), 0, 2.6, 0);
  const pl = mdActor(buildChar(makePail, 'civ'), 0.4, 0.3, Math.PI * 0.6, cage); cage.position.set(61, 170, 40); g.add(cage);
  const y = k => 170 - k * 168;
  let T = 0; const at = (k0, k1, k) => k0 + (k1 - k0) * k;
  runCutscene({ title: 'THE THING FROM A MILE DOWN', lock: 4, shots: [
    { text: "Pail: Big E said there was something in the middle of the island. Said he could hear it humming.", dur: 6, cam: (t, k) => { cage.position.y = y(at(0, 0.2, k)); lamp.intensity = Math.random() < 0.06 ? 0.2 : 1.2; mdCam(61.6, cage.position.y + 1.7, 41.4 - k * 0.3, 61.2, cage.position.y + 1.6, 39.6); } },
    { text: 'The cable groans. Nobody has oiled this thing since the war before the war.', dur: 5, cam: (t, k) => { cage.position.y = y(at(0.2, 0.45, k)); lamp.intensity = Math.random() < 0.1 ? 0.1 : 1.2; mdCam(82 - k * 4, cage.position.y - 6 + k * 4, 52 - k * 3, 60, cage.position.y + 1, 40); } },
    { text: "Pail: That sign's new.", dur: 4, cam: (t, k) => { cage.position.y = 99 - k * 9; lamp.intensity = 1.2; mdCam(62.5, 96.4, 44.5, 58.3, 95.2, 40); } },
    { text: 'Down past the roots. Down past the light. Down where the island keeps its secrets.', dur: 5, cam: (t, k) => { cage.position.y = 60 - k * 52; lamp.intensity = Math.random() < 0.15 ? 0.1 : 1; mdCam(68, cage.position.y - 9, 50, 61, cage.position.y + 1.4, 40); } },
    { text: "Pail: The Mile Down. Best drinks under the sky. Worst commute.", dur: 5, cam: (t, k) => { mdCam(0, 2 - k * 0.3, 12.5 - k * 2, 0, 1.6, 0); } },
  ], onEnd: () => { levelGroup.remove(g); player.pos.set(0, 0, 11); player.yaw = 0; } });
}
function mdDoor() {
  const q = S.qst && S.qst.md1; if (!q || q.st === 'done') { toast('LOCKED', 'Somebody is humming on the other side.', 2.5); return; }
  if (mdF() >= 1) return; mdSet(1); SFX.door(); mdOpenDoor(); MD.act.label = 'Doc\'s lab'; MD.act.fn = () => {};
  const N = npcObjs.pail_md; if (N) N.obj.visible = false; const P = MD.pail; P.h.visible = true; P.h.position.set(0.6, 0, -2.2);
  const b = MD.body, d = MD.doc, f = MD.frog; MD.alarm.intensity = 0;
  runCutscene({ title: 'DOC', lock: 5, shots: [
    { text: 'The door gives. The lab smells like ozone and pond water.', dur: 5, cam: (t, k) => { mdCam(0.2, 1.8, 1.2 - k * 2.6, 0, 1.4, -12); P.h.position.z = -2.2 - k * 1.2; } },
    { text: 'Pail: BIG E?!', dur: 3, cam: (t, k) => { mdCam(1.6, 2.4, -9.2, 0, 1.1, -12.6); } },
    { text: "Doc: Don't touch ANYTHING! The transfer is ninety percent complete!", dur: 5, cam: (t, k) => { mdCam(-2.2, 1.8, -12.6, d.h.position.x, 1.6, d.h.position.z); d.h.rotation.y = -2.5 + k * 1.2; } },
    { text: '', dur: 2.5, cam: (t, k) => { MD.lever.rotation.x = 0.7 - k * 1.4; MD.alarm.intensity = k > 0.5 ? 2.5 : 0; if (k > 0.5 && Math.random() < 0.3) burst(V(2.2, 2.0, -13.3), '#c8b0ff', 6, 4); mdCam(-3.0, 1.8, -13.9, -4.2, 1.6, -15.6); } },
    { text: "Doc: It works! The finest mind in Sky City, preserved forever in a superior amphibian vessel!", dur: 6, cam: (t, k) => { mdCam(2.9 - k * 0.3, 1.5, -12.3, 2.2, 1.2, -13.3); f.rotation.y = -0.6 + Math.sin(t * 2) * 0.2; } },
    { text: 'Pail: Finest mind? He once ate a battery. On purpose.', dur: 4, cam: (t, k) => { mdCam(0.6, 1.75, -4.6, P.h.position.x, 1.6, P.h.position.z); } },
    { text: 'Something on the table croaks.', dur: 4, cam: (t, k) => { b.o.rotation.x = -Math.PI / 2 + k * Math.PI / 2; b.h.position.z = -11.0 + k * 0.4; b.o.position.y = 1.12 - k * 0.2; if (Math.random() < 0.2) burst(V(0, 1.4, -12), '#8aff3a', 3, 3); mdCam(2.6, 1.3, -9.6, 0, 1.4 + k, -11.5); } },
    { text: "Big E's body: RIBBIT.", dur: 3, cam: (t, k) => { b.o.rotation.x = 0; mdCam(0.2, 2.0, -9.0, 0, 2.2, -10.6); } },
    { text: "Doc: No. No no no. The frog was supposed to be DOCILE—", dur: 4, cam: (t, k) => { const tx = d.h.position.x + 0.9, tz = d.h.position.z + 0.6; b.h.position.x += (tx - b.h.position.x) * 0.06; b.h.position.z += (tz - b.h.position.z) * 0.06; b.h.rotation.y = Math.atan2(d.h.position.x - b.h.position.x, d.h.position.z - b.h.position.z); if (k > 0.75 && !b.st.atk) b.st.atk = 0.42; animRig(b.o, b.st, 1 / 60, t); mdCam(-0.5, 2.1, -11.4, -3.2, 1.4, -14.4); } },
    { text: '', dur: 2.5, cam: (t, k) => { mdDocDown(); d.o.rotation.x = -Math.PI / 2 * Math.min(1, k * 2); if (k < 0.2) burst(V(-3.2, 1.2, -14), '#8a1a1a', 10, 4); mdCam(-0.5, 2.6, -11.0, -3.1, 0.4, -13.4); } },
    { text: "It isn't Big E anymore. It's a very angry frog in a very big man.", dur: 4, cam: (t, k) => { b.h.rotation.y = Math.atan2(0 - b.h.position.x, 0 - b.h.position.z); mdCam(b.h.position.x + 0.5, 2.3, b.h.position.z + 2.6 - k * 0.8, b.h.position.x, 2.2, b.h.position.z); } },
  ], onEnd: () => { const p = b.h.position.clone(); b.h.visible = false; MD.alarm.intensity = 1.2; P.h.position.set(-1.6, 0, -3.8); P.h.rotation.y = Math.PI;
    player.pos.set(0, 0, -4.2); player.yaw = 0; mdSpawnBody(p); toast("DOC'S LAB", 'Put the body down. Gently, if you can.', 3.5); } });
}
function mdAfter() {
  const e = MD.e, p = e ? e.obj.position.clone() : V(0, 0, -9); if (e) e.obj.visible = false; MD.alarm.intensity = 0;
  const dead = mdActor(buildChar(() => makeBigE(true), 'civ'), p.x, p.z, 0.4); dead.o.scale.setScalar(1.25); dead.o.rotation.x = -Math.PI / 2; dead.o.position.y = 0.16;
  const P = MD.pail, f = MD.frog, j = MD.jar; P.h.visible = true; P.h.position.set(0.8, 0, -6); f.userData.held = 1;
  const hand = () => V(P.h.position.x + Math.sin(P.h.rotation.y) * 0.35, 1.25, P.h.position.z + Math.cos(P.h.rotation.y) * 0.35);
  runCutscene({ lock: 4, shots: [
    { text: 'It goes down hard. Then it is quiet. Just the hum of the coils.', dur: 4.5, cam: (t, k) => { mdCam(p.x + 3, 2.4 - k * 0.6, p.z + 3, p.x, 0.3, p.z); } },
    { text: '', dur: 3.5, cam: (t, k) => { P.h.position.x = 0.8 + k * 0.6; P.h.position.z = -6 - k * 6.4; P.h.rotation.y = Math.PI - 0.3; animRig(P.o, P.st, 1 / 60, t); if (k > 0.85) { j.position.y = 1.35 + (k - 0.85) * 4; } mdCam(-1.2, 2.0, -9.2, 1.6, 1.2, -12.8); } },
    { text: 'Pail: Ahh man. Sorry, Big E.', dur: 4, cam: (t, k) => { P.h.rotation.y = Math.PI * 0.75; f.position.copy(hand()); f.rotation.y = P.h.rotation.y + Math.PI; mdCam(P.h.position.x - 1.3, 1.7, P.h.position.z - 1.2, P.h.position.x, 1.4, P.h.position.z); } },
    { text: "Pail: Looks like you're a frog, dude.", dur: 3.5, cam: (t, k) => { const h = hand(); f.position.copy(h); mdCam(h.x - 0.7, 1.45, h.z - 0.75, h.x, 1.5, h.z); } },
    { text: 'Big E: ...ribbit.', dur: 3, cam: (t, k) => { const h = hand(); f.position.copy(h); f.rotation.z = Math.sin(t * 3) * 0.1; mdCam(h.x - 0.5, 1.55, h.z - 0.55, h.x, 1.55, h.z); } },
    { text: "Pail: Let's get your body up to the bar. Maybe that can help us.", dur: 5, cam: (t, k) => { P.h.rotation.y = Math.atan2(p.x - P.h.position.x, p.z - P.h.position.z); f.position.copy(hand()); mdCam(P.h.position.x + 2, 2.2, P.h.position.z + 1.5, p.x, 0.6, p.z); } },
  ], onEnd: () => { MD.dyn.remove(dead.h); P.h.visible = false; f.visible = false; setTimeout(() => mdFinale(false), 300); } });
}
function mdFinale(replay) {
  if (LEVEL.id !== 'miledown') return;
  const seat = MD.seat, fr = MD.barFrog, N = npcObjs.pail_md; seat.h.visible = fr.h.visible = true; mdSmoke();
  if (N) { N.obj.visible = true; N.obj.position.set(-6.1, 0, 5.6); N.obj.rotation.y = -Math.PI / 2 + 0.4; }
  runCutscene({ title: 'LATER, AT THE MILE DOWN', lock: 4, shots: [
    { text: 'Three regulars at the bar. One of them is a frog. One of them is dead.', dur: 6, cam: (t, k) => { mdCam(-2 - k, 2.4, 9 - k * 2, -7.4, 1.1, 4.6); } },
    { text: 'Pail: Mags. Three of the strong stuff.', dur: 4, cam: (t, k) => { mdCam(-4.6, 1.8, 5.2, -6.1, 1.6, 5.6); } },
    { text: "Mags: He's dead, Pail.  Pail: He's still a regular.", dur: 5, cam: (t, k) => { mdCam(-6.4, 1.7, 2.6, -9.4, 1.6, 5); } },
    { text: 'Big E takes a long pull. For a frog, he holds it pretty well.', dur: 5, cam: (t, k) => { fr.h.rotation.z = Math.sin(t * 1.5) * 0.08; mdCam(-6.8, 1.45, 5.6 - k * 0.3, -7.9, 1.35, 4.9); } },
    { text: 'Pail: You know what, man? You look good. Real good. Better than him.', dur: 5, cam: (t, k) => { mdCam(-5.6, 1.5, 3.2, -6.9, 1.3, 4); } },
    { text: 'THE END ...?', dur: 4, cam: (t, k) => { mdCam(1 + k * 2, 2.6 + k * 0.6, 11, -7, 1.2, 5); } },
  ], onEnd: () => {
    if (!replay) { mdSet(2); if (S.qst.md1 && S.qst.md1.st !== 'done') { S.qst.md1.st = 'ready'; completeQuest('md1'); SFX.quest(); toast('QUEST COMPLETE', 'The Mile Down', 4); } }
    MD.act.label = 'Look into the lab'; MD.act.fn = () => toast('THE LAB', "Doc's under a sheet. The coils still hum.", 3);
    const n = LEVELS.miledown.npcs[0]; n.idle = ["He's doing better than you'd think. Lighter, mostly.", "Doc's lab is yours if you want it. I'm never going back in there.", "Big E says thanks. I think. It was one ribbit, but a grateful one."];
    player.pos.set(-2, 0, 7); player.yaw = Math.PI / 2 + 0.6; } });
}
// the NPC moves to the bar for good once it's over
{ const _ll = loadLevel; loadLevel = function (id, o) { if (id === 'miledown') { const n = LEVELS.miledown.npcs[0]; if (mdF() >= 2) { n.x = -6.1; n.z = 5.6; n.face = -Math.PI / 2 + 0.4; n.idle = ["He's doing better than you'd think. Lighter, mostly.", "Big E says thanks. I think. It was one ribbit, but a grateful one."]; } }
  const r = _ll(id, o); if (id === 'miledown') { if (mdF() >= 2) setTimeout(() => { if (LEVEL.id === 'miledown') mdSmoke(); }, 200); if (MD.ride) { MD.ride = 0; const go = n => { if (LEVEL.id !== 'miledown') return; if ((CUT.on || state !== 'play') && n < 30) return setTimeout(() => go(n + 1), 300); mdRideScene(); }; setTimeout(() => go(0), 700); } } return r; }; }

// ---- up top: Pail, the elevator head and the quest ----
LEVELS.skycity.npcs.push({ id: 'pail', name: 'Pail', role: 'Looking for his buddy', rig: 'civ', make: makePail, x: MDT.x - 3, z: MDT.z + 2.2, face: Math.PI / 2 + 0.5, showIf: () => mdF() < 2,
  idle: ["There's a bar a mile down the side of this rock. A MILE. Big E went down to see what's in the middle.", "He tied a rope to the elevator and said 'be right back'. That was three days ago."] });
LEVELS.skycity.zones.push({ id: 'mdtop', name: 'Mile Down Elevator', lvl: 'Lv 30–34', x: MDT.x, z: MDT.z, r: 4, col: '#cfe6ff', h: 0 });
defQuest('md1', { ch: 'Earth Sky · Side story', title: 'The Mile Down', giver: 'pail', turnIn: 'pail', req: [],
  intro: ["Hey. Hey you. You look like somebody who goes places.", "My buddy Big E went down the Mile Down elevator. It's a bar, a mile down the side of the island. Best drinks under the sky.", "He said there was something humming in the middle of the rock and he was gonna go see. Three days. No Big E.", "Ride down with me? I'll buy the first round. Probably."],
  obj: [{ kind: 'kill', t: 'bigebody', n: 1, text: 'Find Big E, a mile down', zone: 'mdlab', planet: 'miledown' }],
  outro: ["Thanks, man. Big E says ribbit."], reward: { cr: 3000, xp: 4000 } });
{ const _qt = questTarget; questTarget = function () { const id = trackedQuest(), s = id === 'md1' && S.qst.md1;
  if (s && s.st === 'active' && LEVEL && LEVEL.id !== 'miledown') return LEVEL.id === 'skycity' ? { p: V(MDT.x, 0, MDT.z), label: 'Take the elevator down' } : goto('skycity', null, '');
  if (s && s.st === 'active' && LEVEL.id === 'miledown' && mdF() === 0) return { p: V(0, 0, -2.5) }; return _qt(); }; }
{ const _b = LEVELS.skycity.build; LEVELS.skycity.build = function () { _b.apply(this, arguments);
  const x = MDT.x, z = MDT.z, y0 = groundH(x, z), g = new THREE.Group(), st = toon('#5d636c', 'panel'), ch = toon('#b8bcc4');
  // a steel headframe hanging off the rim, a wheel, cables and a neon sign
  for (const [ax, az] of [[-1.3, -1.3], [-1.3, 1.3], [1.3, -1.3], [1.3, 1.3]]) part(g, B(0.22, 7, 0.22), st, ax, 3.5, az);
  for (const h of [2.8, 6.8]) { part(g, B(2.8, 0.18, 0.18), st, 0, h, -1.3); part(g, B(2.8, 0.18, 0.18), st, 0, h, 1.3); part(g, B(0.18, 0.18, 2.8), st, -1.3, h, 0); part(g, B(0.18, 0.18, 2.8), st, 1.3, h, 0); }
  const wh = part(g, new THREE.TorusGeometry(0.9, 0.1, 6, 16), ch, 0, 7.6, 0); for (let i = 0; i < 4; i++) part(g, B(1.7, 0.06, 0.06), ch, 0, 7.6, 0, 0, 0, i * 0.785);
  for (let i = 0; i < 9; i++) part(g, B(0.04, 2.6, 0.04), toon('#8a8f99'), -1.15, 1.3, -1.0 + i * 0.25, 0, 0, i % 2 ? 0.3 : -0.3);
  part(g, B(2.6, 0.12, 2.6), toon('#3a3d44'), 0, 0.06, 0); part(g, Cy(0.03, 0.03, 60, 4), toon('#3a3d44'), 0.5, -22, 0);
  for (let i = 0; i < 6; i++) part(g, B(0.3, 6, 0.3), st, 2.4, -3 - i * 5.8, (i % 2 ? 0.6 : -0.6), 0.1 * (i % 2 ? 1 : -1));
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.8), new THREE.MeshBasicMaterial({ map: signTex('MILE DOWN BAR ↓', '#100808', '#ff3a8a'), side: THREE.DoubleSide })); sg.position.set(-1.45, 5, 0); sg.rotation.y = -Math.PI / 2; g.add(sg);
  const sg2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.4), new THREE.MeshBasicMaterial({ map: signTex('5,280 FT · OPEN LATE', '#100808', '#4fd2ff'), side: THREE.DoubleSide })); sg2.position.set(-1.45, 4.3, 0); sg2.rotation.y = -Math.PI / 2; g.add(sg2);
  const lp = new THREE.PointLight(0xff3a8a, 0.8, 9); lp.position.set(-2.5, 4.6, 0); g.add(lp);
  g.position.set(x, y0, z); levelGroup.add(g);
  INTERACTS.push({ x: x - 1.6, z, r: 2.2, label: 'Ride the elevator a mile down', fn: () => { const s = S.qst.md1; if (!s && mdF() < 2) { toast('MILE DOWN', 'Pail looks like he wants a word first.', 3); return; } SFX.door(); MD.ride = s && s.st === 'active' && mdF() === 0 ? 1 : 0; travel('miledown', { at: { x: 0, z: 11, yaw: 0 } }); } });
}; }
SCENES.push(['miledown', '🐸 The Mile Down', () => mdF() >= 2 || DEV_ALL, () => { const go = () => { mdFinale(true); }; if (LEVEL.id === 'miledown') go(); else { travel('miledown', { at: { x: 0, z: 11, yaw: 0 } }); setTimeout(go, 2600); } }]);
