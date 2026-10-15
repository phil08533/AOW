// =================== THE FINALE (2.13): the Watcher dies and tears a wormhole; the Greater Maw waits on the other side ===================
// Flow: kill the Watcher on Vector → death scene, a wormhole opens in open space past Vector → w3 turn-in → w4 "Through the Wormhole"
// (upgrade the ship first: a new top tier for lasers, hull and engines) → fly in alone → the Greater Maw → your friends arrive →
// its death scene → hand in to Vega → the ceremony (e1). The wormhole stays open: the fight can be replayed any time.

// ---- a new top tier of ship systems, paid in Void Shards from Vector ----
SHIP_SYS.laser.lv.push({ dmg: 170, cost: { cr: 12000, ore: 50, starcrystal: 8, voidshard: 4 } });
SHIP_SYS.hull.lv.push({ hp: 1300, cost: { cr: 11000, ore: 60, starcrystal: 8, voidshard: 4 } });
SHIP_SYS.engine.lv.push({ sp: 175, cost: { cr: 10000, ore: 45, starcrystal: 6, voidshard: 3 } });

// ---- the quest ----
if (QDEFS.w3) QDEFS.w3.outro = ["It's dying... no. Look. LOOK at the sky.", "It tore a hole on its way out. A wormhole, out in space past Vector. What you killed was its eye. The rest of it went through.", "I won't lie to you, trooper. Whatever waits on the other side is bigger. Get your ship ready. Everything you can. Then go."];
defQuest('w4', { ch: 'Chapter 8 · Vector', title: 'Through the Wormhole', giver: 'lumen', turnIn: 'vega', req: ['w3'], main: true,
  intro: ["The wormhole is open, out in space past Vector. You'll see it from the helm: a wound in the sky.", "Get your ship ready first. Lasers, hull, engines. The engineers on the Zeltac can push them further now, with the Void Shards this world drops.", "No one else can follow you through. I'm sorry. Go when you're ready."],
  obj: [{ kind: 'kill', t: 'greatermaw', n: 1, text: 'Fly through the wormhole and destroy the Greater Maw', planet: 'space' }],
  outro: ["You thought I'd let you fly in there alone? I flew that ship before you were born, rookie. I wasn't going to miss her last fight.", "It's over. Really over. The sky's quiet, and the Eye is gone for good.", "Now come on. Mayor Holloway has a ceremony planned, and she's been practicing her speech for a week."],
  reward: { cr: 60000, xp: 60000 } });

// ---- the Greater Maw: the Watcher, grown huge and wrong ----
function makeGreaterMaw() {
  let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const flesh = ['#2a1a28', '#3d2a38', '#4f3a48', '#5c2a38', '#46202e'], sph = (r, w, h) => new THREE.SphereGeometry(r, w || 18, h || 12);
  const blob = (par, col, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(sph(1), typeof col === 'string' ? toon(col) : col); m.position.set(x, y, z); m.scale.set(sx, sy, sz); par.add(m); return m; };
  // the bloated core, lumpy and veined
  blob(body, '#3d2a38', 0, 0, 0, 44, 40, 42);
  for (let i = 0; i < 34; i++) { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 8 + rnd() * 14, d = 36 + rnd() * 6;
    blob(body, flesh[i % 5], Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d * 0.9, Math.sin(v) * Math.sin(u) * d * (Math.sin(v) * Math.sin(u) > 0.6 ? 0.7 : 1), r, r * (0.7 + rnd() * 0.5), r); }
  const veins = [];
  for (let i = 0; i < 16; i++) { const a = rnd() * 6.28, b = (rnd() - 0.5) * 2.4, v = new THREE.Mesh(new THREE.TorusGeometry(40 + rnd() * 4, 0.9 + rnd(), 5, 24, 1.2 + rnd() * 1.4), toon('#7a1e30')); v.rotation.set(b, a, rnd() * 6.28); body.add(v); veins.push(v); }
  // pustules that glow sick green
  const pus = [];
  for (let i = 0; i < 18; i++) { const u = rnd() * 6.28, v = Math.acos(2 * rnd() - 1), d = 44; const m = blob(body, glow('#9fe86a'), Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d * 0.9, Math.sin(v) * Math.sin(u) * d * 0.85, 2.4, 2.4, 2.4); pus.push(m); }
  // bone horns along the top
  for (let i = 0; i < 9; i++) { const a = -1.1 + i * 0.28, h = new THREE.Mesh(new THREE.ConeGeometry(4, 26 + (i % 3) * 8, 7), toon('#d8c8b0')); h.position.set(Math.sin(a) * 30, 34 + Math.cos(a) * 6, -6 - Math.abs(Math.sin(a)) * 8); h.rotation.set(-0.3, 0, -a * 0.9); body.add(h); }
  // THE eye, with lids that open and close
  const eye = new THREE.Group(); eye.position.set(0, 10, 30); body.add(eye);
  blob(eye, '#efe6d4', 0, 0, 0, 25, 25, 25);
  for (const a of [0.3, 1.2, 2.2, 3.4, 4.3, 5.4]) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 16, 4), toon('#c8402f')); v.position.set(Math.cos(a) * 14, Math.sin(a) * 14, 17); v.rotation.set(Math.PI / 2, 0, a + Math.PI / 2); v.lookAt(0, 0, 40); eye.add(v); }
  const iris = blob(eye, glow('#ff2a3a'), 0, 0, 19, 13, 13, 7), ring = blob(eye, glow('#ff8a2a'), 0, 0, 18.4, 15, 15, 6.5);
  const pupil = blob(eye, '#0a0608', 0, 0, 24.5, 3.2, 10, 2.5);
  const lidT = new THREE.Mesh(new THREE.SphereGeometry(27, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#4f3a48')), lidB = lidT.clone();
  lidT.rotation.x = -0.2; lidB.rotation.x = Math.PI + 0.2; eye.add(lidT, lidB);
  // the maw: rows of teeth around a glowing throat
  const mouth = new THREE.Group(); mouth.position.set(0, -20, 34); body.add(mouth);
  blob(mouth, '#1a0a12', 0, 0, 0, 22, 12, 8); blob(mouth, glow('#ff5a20'), 0, 0, -3, 9, 5, 3);
  const jawT = new THREE.Group(), jawB = new THREE.Group(); mouth.add(jawT, jawB);
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2, top = Math.sin(a) > 0, t = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6 + (i % 3) * 2.5, 5), toon('#e8dcc0'));
    t.position.set(Math.cos(a) * 21, Math.sin(a) * 11, 4); t.rotation.z = a + Math.PI / 2; (top ? jawT : jawB).add(t); }
  // little eyes everywhere, every one of them watching
  const eyes = [];
  for (let i = 0; i < 40; i++) { const u = rnd() * 6.28, v = 0.35 + rnd() * 2.4, d = 43 + rnd() * 3, e = new THREE.Group();
    e.position.set(Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d * 0.9, Math.sin(v) * Math.sin(u) * d); if (e.position.z > 26 && Math.abs(e.position.x) < 26 && e.position.y > -32) continue;
    const s = 2 + rnd() * 3.5; blob(e, '#efe6d4', 0, 0, 0, s, s, s); blob(e, glow(i % 3 ? '#ff2a3a' : '#ff8a2a'), 0, 0, s * 0.8, s * 0.5, s * 0.5, s * 0.3);
    e.lookAt(e.position.clone().multiplyScalar(2)); body.add(e); eyes.push(e); }
  // tentacles: chains of segments that curl and whip
  const tents = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, root = new THREE.Group(); root.position.set(Math.cos(a) * 30, Math.sin(a) * 26 - 6, -14); root.rotation.set(Math.sin(a) * 1.1, 0, 0); root.lookAt(Math.cos(a) * 120, Math.sin(a) * 100 - 6, -90); body.add(root);
    let par = root, segs = [], r = 7.5; for (let k = 0; k < 10; k++) { const sg = new THREE.Group(); sg.position.z = k ? 11 : 0; par.add(sg);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r, 12, 7), toon(k % 2 ? '#2e1c2c' : '#3a2436')); m.rotation.x = Math.PI / 2; m.position.z = 6; sg.add(m);
      if (k % 2 === 0) { const sk = new THREE.Mesh(sph(r * 0.35, 8, 6), glow('#c86aff')); sk.position.set(0, r * 0.9, 6); sg.add(sk); }
      segs.push(sg); par = sg; r *= 0.84; }
    tents.push({ segs, ph: i * 0.7, a }); }
  const aura = deadGlow('255,40,60', 380); aura.position.z = -30; g.add(aura);
  const aura2 = deadGlow('160,60,255', 260); aura2.position.set(0, 0, -10); g.add(aura2);
  g.userData = { body, eye, iris, ring, pupil, lidT, lidB, mouth, jawT, jawB, eyes, tents, pus, veins, aura, open: 1, rage: 0 };
  return g;
}
function mawAnim(g, t, aim) {
  const U = g.userData; if (!U) return;
  const p = 1 + Math.sin(t * 1.3) * 0.025 + U.rage * Math.sin(t * 9) * 0.01; U.body.scale.set(p, 1 / p, p);
  for (const T of U.tents) T.segs.forEach((s, k) => { s.rotation.x = Math.sin(t * (1.1 + U.rage) + T.ph + k * 0.55) * (0.16 + k * 0.012); s.rotation.y = Math.cos(t * 0.9 + T.ph * 1.3 + k * 0.4) * 0.14; });
  const o = Math.max(0.05, U.open); U.lidT.rotation.x = -0.2 - o * 1.15; U.lidB.rotation.x = Math.PI + 0.2 + o * 1.15;
  const m = 0.5 + Math.sin(t * 2.2) * 0.5; U.jawT.position.y = m * 3; U.jawB.position.y = -m * 3;
  U.pus.forEach((q, i) => q.scale.setScalar(2 + Math.sin(t * 3 + i) * 0.8));
  U.aura.material.opacity = 0.7 + Math.sin(t * 2) * 0.25 + U.rage * 0.2;
  if (aim) { const lp = U.eye.worldToLocal(aim.clone()); const dx = clamp(lp.x / 400, -0.3, 0.3), dy = clamp(lp.y / 400, -0.3, 0.3);
    U.iris.position.set(dx * 14, dy * 14, 19); U.ring.position.set(dx * 14, dy * 14, 18.4); U.pupil.position.set(dx * 14, dy * 14, 24.5);
    U.eyes.forEach((e, i) => { if (e.visible && i % 4 === ((t * 2) | 0) % 4) e.lookAt(aim); }); }
}

// a soft colored glow with no white-hot center (dead stars, haze, the Maw's aura)
function deadGlow(rgb, size) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), gr = x.createRadialGradient(64, 64, 2, 64, 64, 64);
  gr.addColorStop(0, `rgba(${rgb},0.9)`); gr.addColorStop(0.35, `rgba(${rgb},0.35)`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.scale.setScalar(size); return sp;
}
// ---- the wormhole itself (in open space, and as a backdrop inside the rift) ----
function swirlTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.18, 'rgba(10,0,20,1)'); gr.addColorStop(0.3, 'rgba(200,90,255,0.9)'); gr.addColorStop(0.55, 'rgba(255,42,58,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256); x.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++) { x.strokeStyle = k % 2 ? 'rgba(255,120,200,0.35)' : 'rgba(140,200,255,0.3)'; x.lineWidth = 3; x.beginPath();
    for (let i = 0; i < 160; i++) { const a = k * 1.26 + i * 0.07, r = 22 + i * 0.66; x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } x.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
function makeWormhole(R) {
  const g = new THREE.Group(), tex = swirlTex();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false })); g.add(disc);
  const disc2 = disc.clone(); disc2.material = disc.material.clone(); disc2.material.opacity = 0.6; disc2.scale.setScalar(1.25); disc2.material.blending = THREE.AdditiveBlending; g.add(disc2);
  const rings = []; for (const [r, c] of [[1.02, '#c86aff'], [1.18, '#ff2a3a'], [1.36, '#8fd0ff']]) { const m = new THREE.Mesh(new THREE.TorusGeometry(R * r, R * 0.025, 6, 64), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.8, fog: false })); g.add(m); rings.push(m); }
  const core = glowSprite('rgba(200,90,255,0.9)', R * 3.2); g.add(core);
  g.userData = { disc, disc2, rings, core };
  return g;
}
function wormholeAnim(g, t) { const U = g.userData; U.disc.rotation.z = -t * 0.6; U.disc2.rotation.z = t * 0.35; U.rings.forEach((r, i) => { r.rotation.x = Math.sin(t * 0.5 + i) * 0.4; r.rotation.y = t * (0.3 + i * 0.2); }); U.core.material.opacity = 0.7 + Math.sin(t * 3) * 0.3; }
const WH = { pos: null };
function wormholeOpen() { return !!(S.flags && S.flags.wormhole) || qDone('w3') || !!qState('w4'); }
function wormholePos() { const P = SPACE_BODIES.vector; return P.pos.clone().add(V(430, 140, -380)); }
{ const _ll = loadLevel; loadLevel = function (id, o) {
  const r = _ll(id, o); const bar = $('mawBar'); if (id !== 'maw') { if (bar) bar.remove(); const cm = $('mawComms'); if (cm) cm.remove(); }
  if (id === 'space' && wormholeOpen()) {
    const w = makeWormhole(60), p = wormholePos(); w.position.copy(p); levelGroup.add(w); WH.pos = p; WH.obj = w; WH.prompted = false;
    const lab = labelSprite(768, 72); levelGroup.add(lab); let mk = 0;
    levelAnims.push(t => { if (!w.parent) return; wormholeAnim(w, t); w.lookAt(player.pos); const d = player.pos.distanceTo(p);
      lab.position.copy(p).add(V(0, 80 + d * 0.06, 0)); lab.scale.set(d * 0.75, d * 0.07, 1); lab.visible = d > 140;
      if ((mk -= 1) <= 0) { mk = 30; drawPlate(lab, 'Wormhole', d > 999 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m', '#ff6aa8', null); }
      if (d < 85 && !WH.prompted && !dlgOpen && player.alive && state === 'play') { WH.prompted = true; wormholePrompt(); }
      if (d > 200) WH.prompted = false;
      if (d < 40 && fly) { player.pos.copy(p).addScaledVector(player.pos.clone().sub(p).normalize(), 40); fly.vel.multiplyScalar(0.3); } });
  }
  return r; }; }
function wormholePrompt() {
  const beaten = !!(S.flags && S.flags.mawDead);
  openDlg('Wormhole', beaten ? 'The rift is still open' : 'A wound in the sky');
  $('dlgLine').textContent = beaten ? 'The Greater Maw is dead, but the rift never closed. Something in there still remembers. Fly in to fight it again.' : `Whatever is left of the Watcher went through here. Your ship: ${hullMax()} hull, lasers ${'★'.repeat(sysLv('laser')) || 'stock'}, engines ${'★'.repeat(sysLv('engine')) || 'stock'}. There's no coming back until it's done, or you are.`;
  acts([['Fly in', () => { closeDlg(); S.flags = S.flags || {}; S.flags.wormhole = 1; markDirty(); travel('maw'); }, true], ['Not yet', closeDlg]]);
}
{ const _qt = questTarget; questTarget = function () {
  const id = trackedQuest(), s = id === 'w4' && S.qst.w4;
  if (s && s.st !== 'ready') { if (LEVEL.id === 'space' && WH.pos) return { p: WH.pos, label: 'Fly into the wormhole' }; if (LEVEL.id === 'maw' && MAW.obj) return { p: MAW.obj.position, label: 'Destroy the Greater Maw' }; }
  return _qt(); }; }

// ---- the rift: a big empty dark with the things the Maw has eaten ----
const MAW = { obj: null };
const MAW_C = V(0, 0, -150), MAW_S = 1.8, MAW_R = 52 * MAW_S, MAW_EYE = 24 * MAW_S;
LEVELS.maw = {
  id: 'maw', name: 'The Rift', tag: 'Beyond the wormhole', size: 120, center: [0, 0], radius: 3000, water: -99, sky: 'space', weather: 'none', fly: true,
  terrain: null, palette: { grass: '#0a0f26' }, zones: [], paths: [], river: [], pools: [], lava: [], safes: [], npcs: [], spawns: [], npcBase: [0, 0],
  spawn: { x: 0, y: 0, z: 560, yaw: 0 }, menu: { x: 0, z: 560, r: 30, h: 8 },
  build() {
    fly = { vel: V(0, 0, 0), roll: 0, cool: 0, raiders: [], bolts: [], drops: [], rocks: null, rockData: [], ship: null, shake: 0, prompt: null, hintT: 99 };
    F_markers.length = 0;
    // the way back
    const back = makeWormhole(70); back.position.set(0, 20, 760); levelGroup.add(back); MAW.back = back; levelAnims.push(t => { wormholeAnim(back, t); back.lookAt(MAW_C); });
    // dead stars: cold red embers, very far away
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, s = deadGlow(i % 2 ? '255,70,40' : '170,70,230', 160 + (i % 4) * 70); s.position.set(Math.cos(a) * 2400, -500 + (i * 397 % 1100), Math.sin(a) * 2400); levelGroup.add(s);
      const m = new THREE.Mesh(new THREE.SphereGeometry(18 + (i % 3) * 12, 12, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? '#5a1a14' : '#2a1438', fog: false })); m.position.copy(s.position); levelGroup.add(m); }
    // a haze of dark nebula behind it
    for (let i = 0; i < 7; i++) { const s = deadGlow(['120,30,80', '60,20,120', '160,30,40'][i % 3], 900 + i * 120); s.position.set((i - 3) * 520, (i % 3 - 1) * 300, -1500 - (i % 2) * 400); levelGroup.add(s); }
    // drifting rock and the hulls of ships it swallowed
    const N = 140, rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), psx(new THREE.MeshLambertMaterial({ map: TEX.stone, color: '#8a7a8a' })), N), dm = new THREE.Object3D(), RD = [];
    for (let i = 0; i < N; i++) { const a = i * 2.39996, d = 380 + (i * 53 % 900), p = V(Math.cos(a) * d, ((i * 131) % 700) - 350, Math.sin(a) * d * 0.8 - 200); const s = 2 + (i * 37 % 11) * 1.6;
      RD.push({ p, s, sp: V(Math.sin(i), Math.cos(i * 2), Math.sin(i * 3)).multiplyScalar(0.15), i }); dm.position.copy(p); dm.scale.setScalar(s); dm.updateMatrix(); rocks.setMatrixAt(i, dm.matrix); }
    levelGroup.add(rocks);
    levelAnims.push(t => { if ((t * 10 | 0) % 2) return; RD.forEach(R => { dm.position.copy(R.p).add(V(Math.sin(t * 0.05 + R.i) * 8, Math.cos(t * 0.04 + R.i) * 6, 0)); dm.rotation.set(t * R.sp.x, t * R.sp.y, t * R.sp.z); dm.scale.setScalar(R.s); dm.updateMatrix(); rocks.setMatrixAt(R.i, dm.matrix); }); rocks.instanceMatrix.needsUpdate = true; });
    const types = ['derelict', 'raider', 'drome', 'hive'];
    for (let i = 0; i < 6; i++) { if (typeof makeHulk !== 'function') break; const h = makeHulk(types[i % 4]); const a = i * 1.1 - 2.6; h.position.set(Math.cos(a) * 520, -120 + (i % 3) * 140, Math.sin(a) * 380 - 260); h.rotation.set(i * 0.6, i, i * 0.3); levelGroup.add(h);
      if (h.userData && h.userData.beacon) h.userData.beacon.visible = false; const sp = 0.02 + i * 0.006; levelAnims.push(t => { h.rotation.z = t * sp; h.rotation.x = i * 0.6 + t * sp * 0.5; }); }
    // dust hanging in the dark
    { const n = 900, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 1800; pos[i * 3 + 1] = (Math.random() - 0.5) * 900; pos[i * 3 + 2] = (Math.random() - 0.5) * 1800 - 100; }
      const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.BufferAttribute(pos, 3)); levelGroup.add(new THREE.Points(gm, new THREE.PointsMaterial({ color: '#c8a0ff', size: 1.6, transparent: true, opacity: 0.55, fog: false }))); }
    const red = new THREE.PointLight(0xff2a3a, 2.2, 900); red.position.copy(MAW_C).add(V(0, 40, 120)); levelGroup.add(red);
    const hemi2 = new THREE.HemisphereLight(0x8a5aa8, 0x200810, 0.7); levelGroup.add(hemi2);
    // the Greater Maw
    const m = makeGreaterMaw(); m.position.copy(MAW_C); m.scale.setScalar(MAW_S); levelGroup.add(m);
    const asc = S.asc || 0, max = Math.round(180000 * (1 + 0.35 * asc));
    Object.assign(MAW, { obj: m, hp: max, max, t: 0, phase: 1, beam: null, beamT: 9, volT: 3, spawnT: 20, allies: [], alliesIn: false, dead: false, hurtAcc: 0, commsT: 6, said: 0, intro: false });
    fly.ship = makeStarship(S.col); levelGroup.add(fly.ship);
    fly.trail = []; for (let i = 0; i < 18; i++) { const tm = new THREE.Mesh(sparkGeo, glow('#ff9a3c')); tm.scale.setScalar(6); levelGroup.add(tm); fly.trail.push(tm); }
    levelAnims.push(t => { if (MAW.obj && !MAW.dead) mawAnim(MAW.obj, t, player.pos); });
    mawHud();
    setTimeout(() => { if (LEVEL.id === 'maw' && state === 'play') mawIntro(); }, 700);
  }
};
function mawHud() {
  let bar = $('mawBar'); if (!bar) { bar = document.createElement('div'); bar.id = 'mawBar'; bar.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 12px);transform:translateX(-50%);width:min(520px,70vw);z-index:6;pointer-events:none;text-align:center;font:600 13px var(--hud,sans-serif);letter-spacing:.18em;color:#ffb0b8;text-shadow:0 1px 4px #000';
    bar.innerHTML = '<div id="mawName">THE GREATER MAW</div><div style="height:10px;margin-top:4px;background:rgba(0,0,0,.6);border:1px solid #ff2a3a;border-radius:3px;overflow:hidden"><div id="mawFill" style="height:100%;width:100%;background:linear-gradient(90deg,#7a1020,#ff2a3a,#ff8a2a)"></div></div>'; document.body.appendChild(bar); }
  const f = $('mawFill'); if (f && MAW.max) f.style.width = Math.max(0, MAW.hp / MAW.max * 100) + '%';
  bar.hidden = state !== 'play' || LEVEL.id !== 'maw' || MAW.dead;
}
function mawComms(who, line, dur) {
  let c = $('mawComms'); if (!c) { c = document.createElement('div'); c.id = 'mawComms'; c.style.cssText = 'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);transform:translateX(-50%);max-width:min(560px,86vw);z-index:6;pointer-events:none;padding:6px 12px;background:rgba(8,6,20,.72);border:1px solid #8fd0ff;border-radius:6px;font:600 14px var(--hud,sans-serif);color:#e8ecf8;text-align:center;transition:opacity .4s;opacity:0'; document.body.appendChild(c); }
  c.innerHTML = `<span style="color:#8fd0ff">${who}:</span> ${line}`; c.style.opacity = 1; clearTimeout(c._t); c._t = setTimeout(() => { c.style.opacity = 0; }, (dur || 4.5) * 1000);
}
// ---- your friends ----
const MAW_ALLIES = [['Captain Vega', '#3b4f7a'], ['Captain Skye', '#8fe3ff'], ['Ada-9', '#3f7d7a'], ['Harbor Master Rell', '#c9a43a'], ['General Hale', '#6f7a3e'], ['Lumen', '#e8e4dc'], ['Elismas', '#9aa1aa'], ['The Bug Master', '#c8a050'], ['Maxurge', '#4fa8ff'], ['Ramick', '#c8402f']];
const MAW_CHATTER = [['CAPTAIN VEGA', 'Hit the big eye, rookie! Everything else is just meat.'], ['ADA-9', 'Calculating weak points. Result: all of it is gross. Keep firing.'], ['GENERAL HALE', 'Fort Ironrock never misses a fight. Tanks don\'t fly, so I brought the next best thing.'], ['ELISMAS', 'A true gunner never wastes a shot. You are wasting several. Aim.'],
  ['THE BUG MASTER', 'The hive remembers this thing. The hive does not forgive it.'], ['MAXURGE', 'One eye sees farther than two. Let us see how far it sees with none.'], ['RAMICK', 'I left my sword at home. I regret nothing. LASERS!'], ['CAPTAIN SKYE', 'Watch for the beam! When the big eye locks on, MOVE.'], ['HARBOR MASTER RELL', 'I logged every ship that ever flew. This one\'s going in the book as a win.'], ['LUMEN', 'Its light is failing. Keep pushing, trooper!'], ['B.U.R.P.', 'Hull integrity: worrying. Morale: surprisingly high. Snacks: none.']];
function mawAlliesArrive(quick) {
  if (MAW.alliesIn) return; MAW.alliesIn = true;
  MAW_ALLIES.forEach(([name, col], i) => { let o;
    try { o = makeStarship(col, { p: i % SHIP_PAINTS.length, a: i % SHIP_ACCENTS.length, wing: 0, eng: i % 2, nose: 0, fin: 0, pod: 0 }); } catch (_) { o = makeStarship(col); }
    o.scale.setScalar(1.1); o.position.copy(MAW.back.position).add(V((i - 4.5) * 12, (i % 3) * 8, 0)); levelGroup.add(o);
    const plate = labelSprite(512, 72); plate.scale.set(26, 3.6, 1); plate.position.y = 6; o.add(plate); drawPlate(plate, name, 'Ally', '#8fd0ff', null);
    MAW.allies.push({ o, name, a: i * 0.63, R: 150 + (i % 4) * 26, h: ((i % 5) - 2) * 26, sp: 0.16 + (i % 3) * 0.04, cd: 0.5 + i * 0.13, enter: quick ? 1 : 0 }); });
  if (quick) mawComms('CAPTAIN VEGA', 'Squadron, on the rookie. Let\'s finish this.');
}
function mawAllyStep(dt, t) {
  for (const A of MAW.allies) {
    A.a += A.sp * dt; const want = MAW_C.clone().add(V(Math.cos(A.a) * A.R, A.h + Math.sin(t * 0.5 + A.a) * 20, Math.sin(A.a) * A.R + 40));
    A.enter = Math.min(1, A.enter + dt * 0.35); A.o.position.lerp(want, A.enter < 1 ? dt * 1.2 : Math.min(1, dt * 3));
    const ahead = MAW_C.clone().add(V(Math.cos(A.a + 0.2) * A.R, A.h, Math.sin(A.a + 0.2) * A.R + 40)); A.o.lookAt(ahead); A.o.rotateY(Math.PI);
    if (MAW.dead) continue;
    A.cd -= dt; if (A.cd <= 0 && A.enter > 0.6) { A.cd = 0.35 + Math.random() * 0.5; const hit = MAW_C.clone().add(V(rand(-30, 30), rand(-25, 25), rand(10, 40))); tracer(A.o.position.clone(), hit, A.name === 'Captain Vega' ? '#ffd36a' : '#8fe3ff'); if (Math.random() < 0.3) burst(hit, '#ffd36a', 3, 10); }
    mawDamage(dt * 60 * (1 + 0.35 * (S.asc || 0)), false);
  }
}
// ---- the fight ----
function mawDamage(n, byYou, at) {
  if (MAW.dead || !MAW.obj) return; MAW.hp -= n;
  const f = MAW.hp / MAW.max, ph = f > 0.66 ? 1 : f > 0.33 ? 2 : 3;
  if (ph !== MAW.phase) { MAW.phase = ph; MAW.obj.userData.rage = ph - 1; SFX.boom(); if (fly) fly.shake = 0.6;
    toast(ph === 2 ? 'IT SPAWNS' : 'IT\'S ENRAGED', ph === 2 ? 'The Maw tears off pieces of itself' : 'Every eye opens at once', 2.5); }
  if (!MAW.alliesIn && f < 0.86) mawAlliesCut();
  if (MAW.hp <= 0) { MAW.hp = 0; mawDeath(); }
}
function mawSpawn() {
  const alive = fly.raiders.filter(r => !r.dead).length; if (alive >= 7) return;
  for (let k = 0; k < (MAW.phase === 3 ? 3 : 2); k++) {
    const obj = makeEyeWatcher(false); obj.scale.setScalar(4.5); obj.rotation.order = 'YXZ'; levelGroup.add(obj);
    const p = MAW_C.clone().add(V(rand(-50, 50), rand(-30, 30), 60)); obj.position.copy(p);
    const plate = labelSprite(512, 72); plate.scale.set(3.2, 0.45, 1); plate.position.y = 3.2; obj.add(plate);
    const lv = 32, r = { obj, plate, home: p.clone(), lv, max: 900 + S.lvl * 30, hp: 0, cd: rand(1, 3), dead: 0, vel: V(0, 0, 0), wander: p.clone(), aggro: true, def: { name: 'Maw Spawn' }, maw: true };
    r.hp = r.max; fly.raiders.push(r); drawPlate(plate, 'Maw Spawn', 'Lv ' + S.lvl, '#ff6a6a', null); burst(p, '#c86aff', 12, 20);
  }
}
function mawBolt(from, dmg, spread) {
  const F = fly, m = new THREE.Mesh(boltGeo, glow(MAW.phase === 3 ? '#ff8a2a' : '#ff2a3a')); m.scale.setScalar(9); m.position.copy(from); levelGroup.add(m);
  const d = player.pos.distanceTo(from), lead = player.pos.clone().addScaledVector(F.vel, d / 170).add(V(rand(-spread, spread), rand(-spread, spread), rand(-spread, spread)));
  F.bolts.push({ m, v: lead.sub(from).normalize().multiplyScalar(170), life: 5, dmg });
}
function mawStep(dt, t) {
  const F = fly; if (!F || !MAW.obj) return;
  mawHud(); mawAllyStep(dt, t);
  // nearAct: the way out
  if (!dlgOpen && !MAW.dead) { const d = player.pos.distanceTo(MAW.back.position); nearAct = d < 120 ? { label: 'Retreat through the wormhole', fn: () => { player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; const p = wormholePos(); travel('space', { at: { x: p.x + 120, y: p.y, z: p.z + 120, yaw: 0.8 } }); } } : { label: 'The Greater Maw', fn: () => {}, quiet: true };
    const tb = $('talk'); tb.hidden = false; tb.innerHTML = ''; tb.append(nearAct.label); if (!TOUCH && d < 120) { const k = document.createElement('kbd'); k.textContent = 'E'; tb.append(k); } tb.style.opacity = nearAct.quiet ? 0.4 : 1; }
  // don't fly into it
  const dm = player.pos.distanceTo(MAW_C); if (dm < MAW_R + 22) { const out = player.pos.clone().sub(MAW_C).normalize(); player.pos.copy(MAW_C).addScaledVector(out, MAW_R + 22); const vn = F.vel.dot(out); if (vn < 0) F.vel.addScaledVector(out, -vn * 1.8); if (!MAW.bumpT || t - MAW.bumpT > 1) { MAW.bumpT = t; hurt(25); F.shake = 0.5; log('It bites!', 'hurt'); } }
  if (player.pos.distanceTo(MAW_C) > 1500) { const out = player.pos.clone().sub(MAW_C).normalize(); player.pos.copy(MAW_C).addScaledVector(out, 1500); F.vel.multiplyScalar(0.2); }
  if (MAW.dead || !player.alive || !MAW.intro) return;
  MAW.t += dt; const ph = MAW.phase, eyeW = MAW.obj.userData.eye.getWorldPosition(V(0, 0, 0));
  // turn to face you
  const want = Math.atan2(player.pos.x - MAW_C.x, player.pos.z - MAW_C.z); let dy = want - MAW.obj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); MAW.obj.rotation.y += dy * Math.min(1, dt * 0.35);
  MAW.obj.rotation.x = clamp(-Math.atan2(player.pos.y - MAW_C.y, Math.hypot(player.pos.x - MAW_C.x, player.pos.z - MAW_C.z)) * 0.6, -0.4, 0.4);
  // volleys from the little eyes
  MAW.volT -= dt; if (MAW.volT <= 0) { MAW.volT = ph === 3 ? 1.6 : ph === 2 ? 2.3 : 3.0; const E = MAW.obj.userData.eyes.filter(e => e.visible); const n = ph === 3 ? 6 : ph === 2 ? 4 : 3;
    for (let k = 0; k < n; k++) { const e = E[(Math.random() * E.length) | 0]; if (!e) break; mawBolt(e.getWorldPosition(V(0, 0, 0)), 26 + ph * 4, 14); } if (dm < 700) SFX.zap(); }
  // the eye beam: it locks on, then burns a line you have to dodge
  MAW.beamT -= dt;
  if (!MAW.beam && MAW.beamT <= 0) { const dir = player.pos.clone().sub(eyeW).normalize();
    const tl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1, 6), new THREE.MeshBasicMaterial({ color: '#ff2a3a', transparent: true, opacity: 0.5, fog: false })); levelGroup.add(tl);
    MAW.beam = { dir, st: 0, tl, len: 1400, fire: null }; toast('THE EYE LOCKS ON', 'Get out of the line!', 1.4); SFX.ui(); }
  if (MAW.beam) { const Bm = MAW.beam; Bm.st += dt; const tgt = player.pos.clone().sub(eyeW).normalize();
    if (Bm.st < 1.5) Bm.dir.lerp(tgt, Math.min(1, dt * 3)).normalize(); else Bm.dir.lerp(tgt, Math.min(1, dt * (ph === 3 ? 0.55 : 0.35))).normalize();
    const mesh = Bm.fire || Bm.tl, mid = eyeW.clone().addScaledVector(Bm.dir, Bm.len / 2); mesh.position.copy(mid); mesh.quaternion.setFromUnitVectors(V(0, 1, 0), Bm.dir); mesh.scale.set(1, Bm.len, 1);
    if (!Bm.fire) { Bm.tl.material.opacity = 0.25 + Math.abs(Math.sin(Bm.st * 12)) * 0.5; }
    if (Bm.st > 1.5 && !Bm.fire) { levelGroup.remove(Bm.tl); Bm.fire = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 1, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#ff5a5a', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); levelGroup.add(Bm.fire); SFX.boom(); F.shake = 0.35; }
    if (Bm.fire) { Bm.fire.scale.x = Bm.fire.scale.z = 1 + Math.sin(Bm.st * 30) * 0.15; const rel = player.pos.clone().sub(eyeW), along = rel.dot(Bm.dir);
      if (along > 0 && rel.clone().addScaledVector(Bm.dir, -along).length() < 11) { MAW.hurtAcc += (60 + ph * 15) * dt; F.shake = 0.3; }
      if (Bm.st > 1.5 + (ph === 3 ? 2.4 : 1.6)) { levelGroup.remove(Bm.fire); MAW.beam = null; MAW.beamT = ph === 3 ? 7 : ph === 2 ? 10 : 13; } } }
  if (MAW.hurtAcc > 12) { hurt(MAW.hurtAcc); MAW.hurtAcc = 0; }
  // Maw spawn, from phase two
  if (ph >= 2) { MAW.spawnT -= dt; if (MAW.spawnT <= 0) { MAW.spawnT = ph === 3 ? 12 : 16; mawSpawn(); } }
  // allies arrive even if you're slow to hurt it
  if (!MAW.alliesIn && MAW.t > 40) mawAlliesCut();
  // a line of chatter now and then
  if (MAW.alliesIn) { MAW.commsT -= dt; if (MAW.commsT <= 0) { MAW.commsT = 9 + Math.random() * 5; const [w, l] = MAW_CHATTER[MAW.said++ % MAW_CHATTER.length]; mawComms(w, l); } }
}
{ const _ss = spaceStep; spaceStep = function (dt, t) {
  if (!LEVEL || LEVEL.id !== 'maw') return _ss(dt, t);
  // the rift has no planets: hide them from the flight code while it runs
  const keep = {}; for (const k in SPACE_BODIES) { keep[k] = SPACE_BODIES[k]; delete SPACE_BODIES[k]; }
  try { _ss(dt, t); } finally { Object.assign(SPACE_BODIES, keep); }
  mawStep(dt, t); }; }
// your lasers hit it (the big eye takes extra)
{ const _sf = shipFire; shipFire = function () { const r = _sf.apply(this, arguments);
  if (LEVEL && LEVEL.id === 'maw' && MAW.obj && !MAW.dead) {
    const dmg = SHIP_SYS.laser.lv[sysLv('laser')].dmg * (1 + (S.lvl - 1) * 0.03) * (typeof shipMod === 'function' ? shipMod('laser') : 1);
    _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q);
    const eyeW = MAW.obj.userData.eye.getWorldPosition(V(0, 0, 0));
    for (const side of [-1, 1]) { const from = player.pos.clone().addScaledVector(shipRight, 4.4 * side).addScaledVector(shipFwd, -1);
      const te = raySphere(from, shipFwd, eyeW, MAW_EYE), tb = raySphere(from, shipFwd, MAW_C, MAW_R), tt = te > 0 ? te : tb;
      if (tt > 0 && tt < 1600) { const end = from.clone().addScaledVector(shipFwd, tt); tracer(from, end, '#6fdc5a'); const crit = te > 0 && MAW.obj.userData.open > 0.5;
        burst(end, crit ? '#ffd36a' : '#ff6a8a', crit ? 6 : 3, crit ? 24 : 14); hitmark(false); mawDamage(dmg / 2 * (crit ? 1.6 : 1), true); } } }
  return r; }; }
{ const _kr = killRaider; killRaider = function (r) { const res = _kr(r); if (r && r.maw) { const F = fly, i = F.raiders.indexOf(r); if (i >= 0) F.raiders.splice(i, 1); levelGroup.remove(r.obj); } return res; }; }
{ const _mc = musContext; musContext = function (dt) { const r = _mc(dt); if (LEVEL && LEVEL.id === 'maw' && !MAW.dead) return 'eyeboss'; return r; }; }

// ---- scenes ----
const camLook = (p, at) => { camera.position.copy(p); camera.lookAt(at); };
function mawIntro() {
  const first = !(S.flags && S.flags.mawIntro), m = MAW.obj, U = m.userData, ship = fly.ship;
  U.open = 0; const t0 = performance.now() / 1000, T = () => performance.now() / 1000 - t0;
  ship.position.set(0, 20, 740); ship.quaternion.identity();
  const done = () => { MAW.intro = true; U.open = 1; S.flags = S.flags || {}; S.flags.mawIntro = 1; markDirty(); player.pos.set(0, 0, 560); player.yaw = 0; player.pitch = 0;
    if (!first) toast('THE GREATER MAW', 'Again. It remembers you.', 2.5); };
  if (!first) { runCutscene({ lock: 1, shots: [{ text: 'THE GREATER MAW', dur: 3, cam: (t, k) => { U.open = k; mawAnim(m, T(), camera.position); camLook(V(0, 30, 260 - k * 60), MAW_C); } }], onEnd: done }); return; }
  runCutscene({ music: 'eyeboss', lock: 4, shots: [
    { text: 'You go through alone.', dur: 4.5, cam: (t, k) => { wormholeAnim(MAW.back, T()); ship.position.set(0, 20 - k * 20, 740 - k * 180); camLook(V(-30 + k * 10, 34, 690 - k * 150), ship.position.clone().add(V(0, 0, -40))); } },
    { text: 'No stars. No sound. Just the things it has eaten.', dur: 5.5, cam: (t, k) => { const a = 2.2 + k * 0.6; camLook(V(Math.cos(a) * 700, 160 - k * 60, Math.sin(a) * 700 - 150), V(0, 0, -150)); mawAnim(m, T(), null); } },
    { text: 'And waiting at the bottom of the dark...', dur: 5, cam: (t, k) => { mawAnim(m, T(), null); camLook(V(0, 30 - k * 10, 420 - k * 200), MAW_C.clone().add(V(0, 8, 0))); } },
    { text: 'THE GREATER MAW', dur: 4.5, cam: (t, k) => { U.open = Math.min(1, k * 1.6); mawAnim(m, T(), V(0, 0, 400)); if (k > 0.3 && !U.roared) { U.roared = 1; SFX.boom(); } camLook(V(Math.sin(k * 0.6) * 30, 24, 190 - k * 30), U.eye.getWorldPosition(V(0, 0, 0))); } },
  ], onEnd: done });
}
function mawAlliesCut() {
  if (MAW.alliesIn) return;
  if (S.flags && S.flags.mawAllies) { mawAlliesArrive(true); return; }
  mawAlliesArrive(false); const ships = MAW.allies, B = MAW.back.position, t0 = performance.now() / 1000;
  const fwd = (k) => ships.forEach((A, i) => { A.o.position.copy(B).add(V((i - 4.5) * 14, (i % 3) * 10 - 10, -k * (120 + (i % 4) * 30))); A.o.lookAt(MAW_C); A.o.rotateY(Math.PI); A.enter = 0; });
  runCutscene({ lock: 3, shots: [
    { text: 'Behind you, the wormhole flares.', dur: 3, cam: (t, k) => { wormholeAnim(MAW.back, performance.now() / 1000 - t0); MAW.back.scale.setScalar(1 + k * 0.4); fwd(0); camLook(player.pos.clone().add(V(20, 16, -40)), B); } },
    { text: 'VEGA: You really thought we\'d let you go in alone, rookie?', dur: 4, cam: (t, k) => { fwd(k); camLook(B.clone().add(V(60, 30, -260)), B.clone().add(V(0, 0, -k * 150))); } },
    { text: 'SKYE: Earth Defense Force, on your wing. ADA-9: Robot City sends its regards.', dur: 4, cam: (t, k) => { fwd(1 + k * 0.6); const c = ships[0].o.position; camLook(c.clone().add(V(-30, 12, 40)), c.clone().add(V(0, 0, -60))); } },
    { text: 'ELISMAS: Four Masters. Four arts. One eye. Let us close it.', dur: 4, cam: (t, k) => { fwd(1.6 + k * 0.5); const c = ships[6].o.position; camLook(c.clone().add(V(24, 10, 30)), MAW_C); } },
  ], onEnd: () => { MAW.back.scale.setScalar(1); S.flags = S.flags || {}; S.flags.mawAllies = 1; markDirty(); mawComms('CAPTAIN VEGA', 'Squadron, on the rookie. Let\'s finish this.'); } });
}
function mawDeath() {
  if (MAW.dead) return; MAW.dead = true; const m = MAW.obj, U = m.userData, first = !(S.flags && S.flags.mawDead), t0 = performance.now() / 1000;
  if (MAW.beam) { if (MAW.beam.fire) levelGroup.remove(MAW.beam.fire); if (MAW.beam.tl) levelGroup.remove(MAW.beam.tl); MAW.beam = null; }
  fly.raiders.slice().forEach(r => { if (!r.dead) killRaider(r); }); fly.bolts.forEach(b => levelGroup.remove(b.m)); fly.bolts.length = 0;
  const bar = $('mawBar'); if (bar) bar.hidden = true;
  questProgressKill('greatermaw'); gainXp(first ? 40000 : 12000); S.cr += first ? 20000 : 6000; S.inv.voidshard = (S.inv.voidshard || 0) + (first ? 10 : 4); log(`+${first ? 20000 : 6000} cr · +${first ? 10 : 4} Void Shards`, 'loot');
  S.flags = S.flags || {}; S.flags.mawDead = (S.flags.mawDead || 0) + 1; markDirty(); checkReady();
  const flash = glowSprite('rgba(255,240,220,1)', 10); flash.position.copy(MAW_C); levelGroup.add(flash);
  let popped = 0; const T = () => performance.now() / 1000 - t0;
  const shake = (k) => { m.position.copy(MAW_C).add(V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(2 + k * 4)); };
  const popTo = (n) => { while (popped < n && popped < U.eyes.length) { const e = U.eyes[popped++]; burst(e.getWorldPosition(V(0, 0, 0)), '#ff2a3a', 10, 30); e.visible = false; } };
  const leave = () => { m.visible = false; levelGroup.remove(flash);
    toast('THE GREATER MAW IS DEAD', first ? 'Return to Captain Vega on Earth' : 'The rift remembers. It will be back.', 4); SFX.level();
    setTimeout(() => { if (LEVEL.id !== 'maw') return; player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; const p = wormholePos(); travel('space', { at: { x: p.x + 120, y: p.y, z: p.z + 120, yaw: 0.8 } }); }, 3500); };
  runCutscene({ lock: first ? 4 : 1, shots: (first ? [
    { text: 'It screams, and there is no sound.', dur: 4, cam: (t, k) => { U.rage = 3; mawAnim(m, T(), camera.position); shake(k); popTo(Math.floor(k * U.eyes.length * 0.6)); camLook(V(Math.sin(k) * 220, 60, 360), MAW_C); } },
    { text: 'Every eye it ever opened closes.', dur: 4.5, cam: (t, k) => { mawAnim(m, T(), null); shake(1); popTo(Math.floor((0.6 + k * 0.4) * U.eyes.length)); U.open = 1 - k; U.iris.material = glow(k > 0.5 ? '#3a0a10' : '#ff2a3a'); m.scale.setScalar(MAW_S * (1 - k * 0.35)); camLook(V(40, 30, 210 - k * 40), U.eye.getWorldPosition(V(0, 0, 0))); } },
    { text: 'And the dark lets go.', dur: 3.5, cam: (t, k) => { m.scale.setScalar(MAW_S * Math.max(0.01, 0.65 - k * 0.65)); flash.scale.setScalar(10 + k * 900); flash.material.opacity = 1 - Math.max(0, k - 0.6) * 2.5; if (k > 0.2 && !U.boomed) { U.boomed = 1; SFX.boom(); burst(MAW_C, '#ffd36a', 60, 60); burst(MAW_C, '#c86aff', 40, 50); } camLook(V(0, 60, 420), MAW_C); } },
    { text: 'VEGA: ...That\'s it. That\'s really it. Come on, rookie. Let\'s go home.', dur: 4.5, cam: (t, k) => { m.visible = false; flash.material.opacity = 0; mawAllyStep(1 / 60, T()); const c = player.pos; camLook(c.clone().add(V(-40, 20, 60 - k * 20)), c.clone().add(V(0, 0, -100))); } },
  ] : [
    { text: 'The Greater Maw falls again.', dur: 3.5, cam: (t, k) => { shake(1); popTo(U.eyes.length); m.scale.setScalar(MAW_S * Math.max(0.01, 1 - k)); flash.scale.setScalar(10 + k * 700); camLook(V(0, 60, 420), MAW_C); } },
  ]), onEnd: leave });
}

// ---- the Watcher's death on Vector: it dies, and tears the wormhole open ----
{ const _k = kill; kill = function (e) { const r = _k.apply(this, arguments);
  try { if (e && e.sp && e.sp.type === 'watcher' && LEVEL && LEVEL.id === 'vector') { const first = !(S.flags && S.flags.watcherDied); S.flags = S.flags || {}; S.flags.watcherDied = 1; S.flags.wormhole = 1; markDirty();
    if (first) setTimeout(() => watcherDeath(e), 350); else toast('THE WATCHER FALLS', 'The wormhole past Vector is still open', 3); } } catch (err) { console.warn('watcher death', err); }
  return r; }; }
function watcherDeath(e) {
  const o = e.obj, base = o.position.clone(), sc = o.scale.x, top = base.clone().add(V(0, 26, 0)), t0 = performance.now() / 1000;
  const hole = makeWormhole(10); hole.position.copy(top); hole.scale.setScalar(0.01); levelGroup.add(hole); o.visible = true;
  const T = () => performance.now() / 1000 - t0, look = (p, at) => { camera.position.copy(p); camera.lookAt(at); };
  runCutscene({ lock: 4, shots: [
    { text: 'The Watcher shudders. Its eye goes dark.', dur: 4, cam: (t, k) => { o.position.copy(base).add(V(rand(-0.2, 0.2), Math.sin(t * 20) * 0.15, rand(-0.2, 0.2))); if (Math.random() < 0.08) burst(base.clone().add(V(rand(-3, 3), rand(2, 6), rand(-3, 3))), '#ff2a3a', 6, 8); const a = 0.6 + k * 0.5; look(base.clone().add(V(Math.cos(a) * 16, 7, Math.sin(a) * 16)), base.clone().add(V(0, 4, 0))); } },
    { text: 'And as it dies, it tears a hole in the sky.', dur: 4.5, cam: (t, k) => { hole.scale.setScalar(0.01 + k * 2.4); wormholeAnim(hole, T()); hole.lookAt(base.clone().add(V(0, 0, 30))); look(base.clone().add(V(20, 6, 34)), top); } },
    { text: 'Something on the other side pulls what is left of it through.', dur: 4.5, cam: (t, k) => { wormholeAnim(hole, T()); o.position.copy(base).lerp(top, k * k); o.scale.setScalar(sc * Math.max(0.05, 1 - k * 0.9)); o.rotation.y += 0.05 + k * 0.2; look(base.clone().add(V(-14, 6, 22)), base.clone().lerp(top, 0.6)); } },
    { text: 'Out past Vector, a wormhole opens.', dur: 3.5, cam: (t, k) => { o.visible = false; wormholeAnim(hole, T()); hole.scale.setScalar(2.4 * (1 - k) + 0.01); look(base.clone().add(V(0, 8, 30)), top); } },
  ], onEnd: () => { levelGroup.remove(hole); o.visible = false; toast('A WORMHOLE HAS OPENED', 'Out in space, past Vector', 4); SFX.quest(); } });
}
