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
  const hiS = sph(1), loS = sph(1, 10, 7);
  const blob = (par, col, x, y, z, sx, sy, sz, lo) => { const m = new THREE.Mesh(lo ? loS : hiS, typeof col === 'string' ? toon(col) : col); m.position.set(x, y, z); m.scale.set(sx, sy, sz); par.add(m); return m; };
  // the bloated core, lumpy and veined
  const core = blob(body, '#3d2a38', 0, 0, 0, 44, 40, 42);
  for (let i = 0; i < 34; i++) { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 8 + rnd() * 14, d = 36 + rnd() * 6;
    blob(body, flesh[i % 5], Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d * 0.9, Math.sin(v) * Math.sin(u) * d * (Math.sin(v) * Math.sin(u) > 0.6 ? 0.7 : 1), r, r * (0.7 + rnd() * 0.5), r, true); }
  const veins = [];
  for (let i = 0; i < 16; i++) { const a = rnd() * 6.28, b = (rnd() - 0.5) * 2.4, v = new THREE.Mesh(new THREE.TorusGeometry(40 + rnd() * 4, 0.9 + rnd(), 5, 24, 1.2 + rnd() * 1.4), toon('#7a1e30')); v.rotation.set(b, a, rnd() * 6.28); body.add(v); veins.push(v); }
  // pustules that glow sick green
  const pus = [];
  for (let i = 0; i < 18; i++) { const u = rnd() * 6.28, v = Math.acos(2 * rnd() - 1), d = 44; const m = blob(body, glow('#9fe86a'), Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d * 0.9, Math.sin(v) * Math.sin(u) * d * 0.85, 2.4, 2.4, 2.4, true); pus.push(m); }
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
  for (let i = 0; i < 64; i++) { const u = rnd() * 6.28, v = 0.35 + rnd() * 2.4, d = 43 + rnd() * 3, e = new THREE.Group();
    e.position.set(Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d * 0.9, Math.sin(v) * Math.sin(u) * d); if (e.position.z > 26 && Math.abs(e.position.x) < 26 && e.position.y > -32) continue;
    const s = 2 + rnd() * 3.5; blob(e, '#efe6d4', 0, 0, 0, s, s, s, true); blob(e, glow(i % 3 ? '#ff2a3a' : '#ff8a2a'), 0, 0, s * 0.8, s * 0.5, s * 0.5, s * 0.3, true); blob(e, '#0a0608', 0, 0, s * 0.98, s * 0.14, s * 0.32, s * 0.1, true);
    if (s > 4) { const lid = new THREE.Mesh(new THREE.TorusGeometry(s * 1.02, s * 0.22, 4, 12), toon('#4f3a48')); lid.position.z = s * 0.35; e.add(lid); }
    e.lookAt(e.position.clone().multiplyScalar(2)); body.add(e); eyes.push(e); }
  // tentacles: chains of segments that curl and whip
  const tents = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, root = new THREE.Group(); root.position.set(Math.cos(a) * 30, Math.sin(a) * 26 - 6, -14); root.rotation.set(Math.sin(a) * 1.1, 0, 0); root.lookAt(Math.cos(a) * 120, Math.sin(a) * 100 - 6, -90); body.add(root);
    let par = root, segs = [], r = 7.5; for (let k = 0; k < 10; k++) { const sg = new THREE.Group(); sg.position.z = k ? 11 : 0; par.add(sg);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r, 12, 7), toon(k % 2 ? '#2e1c2c' : '#3a2436')); m.rotation.x = Math.PI / 2; m.position.z = 6; sg.add(m);
      if (k % 2 === 0) { const sk = new THREE.Mesh(sph(r * 0.35, 8, 6), glow('#c86aff')); sk.position.set(0, r * 0.9, 6); sg.add(sk); }
      segs.push(sg); par = sg; r *= 0.84; }
    tents.push({ segs, ph: i * 0.7, a }); }
  // armour: bony plates across the back and crown, each with a ridge of spikes
  const plates = [], bone = toon('#6a5650'), boneDk = toon('#4a3a3a'), spikeM = toon('#d8c8b0');
  for (let i = 0; i < 18; i++) { const u = rnd() * 6.28, v = 0.25 + rnd() * 1.9, n = V(Math.sin(v) * Math.cos(u), Math.cos(v) * 0.9, Math.sin(v) * Math.sin(u)); if (n.z > 0.45) continue;
    const pg = new THREE.Group(); body.add(pg); plates.push({ pg, n });
    const pl = new THREE.Mesh(loS, i % 3 ? bone : boneDk); pl.position.copy(n).multiplyScalar(45); pl.scale.set(13 + rnd() * 6, 9 + rnd() * 5, 2.6); pl.lookAt(n.clone().multiplyScalar(90)); pl.rotation.z += rnd() * 3; pg.add(pl);
    const tg = V(0, 1, 0).cross(n); if (tg.lengthSq() < 0.01) tg.set(1, 0, 0); tg.normalize();
    for (let k = -1; k <= 1; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5 + rnd() * 4, 5), spikeM); sp.position.copy(n).multiplyScalar(47).addScaledVector(tg, k * 4); sp.quaternion.setFromUnitVectors(V(0, 1, 0), n); pg.add(sp); } }
  // a crown of teeth around the great eye
  const eyeTeeth = new THREE.Group(); eye.add(eyeTeeth);
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, tt = new THREE.Mesh(new THREE.ConeGeometry(2, 9 + (i % 2) * 5, 5), spikeM); tt.position.set(Math.cos(a) * 29, Math.sin(a) * 29, 6); tt.rotation.set(0, 0, a - Math.PI / 2); tt.rotateX(0.5); eyeTeeth.add(tt); }
  const socket = new THREE.Mesh(new THREE.TorusGeometry(28, 3.2, 6, 28), toon('#2a1420')); socket.position.z = 4; eye.add(socket);
  // the outer jaw: a second, bigger ring of fangs
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, f = new THREE.Mesh(new THREE.ConeGeometry(2.6, 11 + (i % 4) * 3, 6), spikeM); f.position.set(Math.cos(a) * 26, Math.sin(a) * 15, 2); f.rotation.z = a + Math.PI / 2; f.rotateX(-0.35); (Math.sin(a) > 0 ? jawT : jawB).add(f); }
  const throat = deadGlow('255,110,40', 30); throat.position.set(0, 0, 2); mouth.add(throat);
  // glowing cracks where the flesh has split, pulsing with its heartbeat
  const crackM = new THREE.MeshBasicMaterial({ color: '#ff5a20', fog: false }), crackG = [];
  for (let i = 0; i < 14; i++) { const a = rnd() * 6.28, b = (rnd() - 0.5) * 2.6, z0 = rnd() * 6.28;
    for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.TorusGeometry(45.2, 0.55, 3, 8, 0.16 + rnd() * 0.14), crackM); c.rotation.set(b + k * 0.06 * (rnd() - 0.5), a + k * 0.035, z0 + k * 0.17); body.add(c); crackG.push(c); } }
  // thin whip tendrils trailing from its underside
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, root = new THREE.Group(); root.position.set(Math.cos(a) * 18, -36, Math.sin(a) * 18 - 4); root.lookAt(Math.cos(a) * 50, -140, Math.sin(a) * 50 - 20); body.add(root);
    let par = root, segs = [], r = 3.2; for (let k = 0; k < 8; k++) { const sg = new THREE.Group(); sg.position.z = k ? 9 : 0; par.add(sg);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, 10, 5), toon('#3a2436')); m.rotation.x = Math.PI / 2; m.position.z = 5; sg.add(m);
      if (k === 7) { const tip = new THREE.Mesh(loS, glow('#ff2a3a')); tip.scale.setScalar(2.2); tip.position.z = 10; sg.add(tip); }
      segs.push(sg); par = sg; r *= 0.86; }
    tents.push({ segs, ph: 3 + i * 1.1, a, whip: 1 }); }
  // the last form: great spikes that burst out of it (hidden until it morphs)
  const morphG = new THREE.Group(); morphG.visible = false; body.add(morphG); const mSpike = glow('#ff4ae0'), mBone = toon('#e8d8f0');
  for (let i = 0; i < 16; i++) { const u = rnd() * 6.28, v = 0.3 + rnd() * 2.5, n = V(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)); if (n.z > 0.6) continue;
    const c = new THREE.Mesh(new THREE.ConeGeometry(4.5, 34 + rnd() * 26, 6), i % 3 ? mBone : mSpike); c.quaternion.setFromUnitVectors(V(0, 1, 0), n); c.position.copy(n).multiplyScalar(52); morphG.add(c); }
  const aura = deadGlow('255,40,60', 380); aura.position.z = -30; g.add(aura);
  const aura2 = deadGlow('160,60,255', 260); aura2.position.set(0, 0, -10); g.add(aura2);
  g.userData = { body, eye, iris, ring, pupil, lidT, lidB, mouth, jawT, jawB, eyes, tents, pus, veins, aura, aura2, crackM, eyeTeeth, throat, plates, morphG, core, morph: 0, open: 1, rage: 0 };
  return g;
}
function mawAnim(g, t, aim) {
  const U = g.userData; if (!U) return;
  const p = 1 + Math.sin(t * 1.3) * 0.025 + U.rage * Math.sin(t * 9) * 0.01; U.body.scale.set(p, 1 / p, p);
  for (const T of U.tents) { const w = T.whip ? 1.8 : 1; T.segs.forEach((s, k) => { s.rotation.x = Math.sin(t * (1.1 + U.rage) * w + T.ph + k * 0.55) * (0.16 + k * 0.012) * w; s.rotation.y = Math.cos(t * 0.9 * w + T.ph * 1.3 + k * 0.4) * 0.14 * w; }); }
  if (U.crackM) { const beat = Math.pow(Math.max(0, Math.sin(t * (2.4 + U.rage * 1.2))), 6); U.crackM.color.setRGB(0.6 + beat * 0.4 + U.rage * 0.1, 0.12 + beat * 0.35, 0.02 + beat * 0.1); }
  if (U.eyeTeeth) U.eyeTeeth.rotation.z = Math.sin(t * 0.7) * 0.06 + U.rage * Math.sin(t * 7) * 0.02;
  if (U.throat) U.throat.material.opacity = 0.6 + Math.sin(t * 4) * 0.3;
  const o = Math.max(0.05, U.open); U.lidT.rotation.x = -0.2 - o * 1.15; U.lidB.rotation.x = Math.PI + 0.2 + o * 1.15;
  const m = 0.5 + Math.sin(t * 2.2) * 0.5; U.jawT.position.y = m * 3; U.jawB.position.y = -m * 3;
  U.pus.forEach((q, i) => q.scale.setScalar(2 + Math.sin(t * 3 + i) * 0.8));
  U.aura.material.opacity = 0.7 + Math.sin(t * 2) * 0.25 + U.rage * 0.2;
  // the last form: the armour splits away, spikes burst out, everything goes violet
  if (U.morph > 0) { const k = U.morph; U.morphG.visible = true; U.morphG.scale.setScalar(Math.max(0.01, k * (1 + Math.sin(t * 6) * 0.05)));
    U.plates.forEach((P, i) => { P.pg.position.copy(P.n).multiplyScalar(k * (10 + Math.sin(t * 3 + i) * 3)); });
    const q = 1 + k * (0.08 + Math.sin(t * 5) * 0.05); U.body.scale.multiplyScalar(q);
    U.aura.material.color.setRGB(1 - k * 0.3, 1 - k * 0.7, 1); U.aura2.material.opacity = 0.6 + k * 0.4; U.aura2.scale.setScalar(260 * (1 + k * 0.6 + Math.sin(t * 4) * 0.08 * k));
    if (U.crackM) U.crackM.color.setRGB(0.9 + Math.sin(t * 9) * 0.1, 0.2 * (1 - k), 0.9 * k); }
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
  if (MAW.fmCancel) { MAW.fmCancel(); MAW.fmCancel = null; }
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
    Object.assign(MAW, { obj: m, hp: max, max, t: 0, phase: 1, beam: null, beamT: 9, volT: 3, spawnT: 20, allies: [], alliesIn: false, dead: false, hurtAcc: 0, commsT: 6, said: 0, intro: false, ev: [], lost: [], nowSaid: false, shots: [], flashes: [], smoke: [], fxPool: null, final: 0, mega: false, megaCd: 0, blastT: 0, vegaT: 0 });
    fly.ship = makeStarship(S.col); levelGroup.add(fly.ship);
    fly.trail = []; for (let i = 0; i < 18; i++) { const tm = new THREE.Mesh(sparkGeo, glow('#ff9a3c')); tm.scale.setScalar(6); levelGroup.add(tm); fly.trail.push(tm); }
    levelAnims.push(t => { if (MAW.obj && !MAW.dead) mawAnim(MAW.obj, t, player.pos); });
    mawHud();
    // the intro plays every time you come through: wait until the fade, dialogs and any other scene are done, then run it
    const me = m, t0 = performance.now();
    const tryIntro = () => { if (LEVEL.id !== 'maw' || MAW.obj !== me || MAW.intro) return;
      if (state === 'play' && !dlgOpen && !CUT.on && performance.now() - t0 > 700) { mawIntro(); return; }
      if (performance.now() - t0 > 20000 && state === 'play') { MAW.intro = true; return; }
      setTimeout(tryIntro, 150); };
    setTimeout(tryIntro, 300);
  }
};
function mawHud() {
  let bar = $('mawBar'); if (!bar) { bar = document.createElement('div'); bar.id = 'mawBar'; bar.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 12px);transform:translateX(-50%);width:min(520px,70vw);z-index:6;pointer-events:none;text-align:center;font:600 13px var(--hud,sans-serif);letter-spacing:.18em;color:#ffb0b8;text-shadow:0 1px 4px #000';
    bar.innerHTML = '<div id="mawName">THE GREATER MAW</div><div style="height:10px;margin-top:4px;background:rgba(0,0,0,.6);border:1px solid #ff2a3a;border-radius:3px;overflow:hidden"><div id="mawFill" style="height:100%;width:100%;background:linear-gradient(90deg,#7a1020,#ff2a3a,#ff8a2a)"></div></div>'; document.body.appendChild(bar); }
  const f = $('mawFill'); if (f && MAW.max) f.style.width = Math.max(0, MAW.hp / MAW.max * 100) + '%';
  bar.hidden = state !== 'play' || LEVEL.id !== 'maw' || MAW.dead;
}
function mawComms(who, line, dur) {
  let c = $('mawComms'); if (!c) { c = document.createElement('div'); c.id = 'mawComms'; c.style.cssText = 'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);transform:translateX(-50%);width:max-content;max-width:min(480px,56vw);z-index:6;pointer-events:none;padding:3px 10px;background:rgba(8,6,20,.5);border:1px solid rgba(143,208,255,.45);border-radius:6px;font:600 12px/1.3 var(--hud,sans-serif);color:#e8ecf8;text-align:center;transition:opacity .4s;opacity:0'; document.body.appendChild(c); }
  c.innerHTML = `<span style="color:#8fd0ff">${who}:</span> ${line}`; c.style.opacity = 1; clearTimeout(c._t); c._t = setTimeout(() => { c.style.opacity = 0; }, (dur || 4.5) * 1000);
}
// ---- your friends ----
// the last three are Earth Defense Force wingmen who fly with the squadron; the Maw takes them, one by one
const MAW_ALLIES = [['Captain Vega', '#3b4f7a'], ['Captain Skye', '#8fe3ff'], ['Ada-9', '#3f7d7a'], ['Harbor Master Rell', '#c9a43a'], ['General Hale', '#6f7a3e'], ['Lumen', '#e8e4dc'], ['Elismas', '#9aa1aa'], ['The Bug Master', '#c8a050'], ['Maxurge', '#4fa8ff'], ['Ramick', '#c8402f'], ['Lt. Vance', '#5a6e8a'], ['Ensign Park', '#7a8a9a'], ['Sgt. Okafor', '#6a7a5a']];
// [hp fraction, ally, their last words (cut off), who answers, the answer, B.U.R.P.]
const MAW_LOSSES = [
  [0.64, 'Lt. Vance', 'It\'s on me, I can\'t shake it, I can\'t—', 'CAPTAIN VEGA', 'VANCE! ...Close it up, squadron. Close it up.', 'We lost Vance. Stay with me, Captain. Don\'t let it be for nothing.'],
  [0.42, 'Ensign Park', 'Captain, the big eye is turning toward m—', 'CAPTAIN SKYE', 'Park\'s gone. She was nineteen.', 'Park is gone. I saved her last transmission. We will play it for her family. After we win.'],
  [0.24, 'Sgt. Okafor', 'Rockets dry. Going in close. Tell my kids I—', 'GENERAL HALE', 'Okafor bought us that opening. Don\'t you dare waste it.', 'Okafor\'s signal just stopped. No jokes today, Captain. Please, be careful.'],
];
const MAW_NOW = 'It\'s now or never, Captain. Let\'s set this guy\'s sun.';
function mawBurp(line, dur) { mawComms('B.U.R.P.', line, dur || 6); try { burpSay(line); } catch (_) {} try { log(line, 'ai', 'B.U.R.P.'); } catch (_) {} }
const MAW_CHATTER = [['CAPTAIN VEGA', 'Hit the big eye, rookie! Everything else is just meat.'], ['LT. VANCE', 'Vance, Earth Defense Force. First time through a wormhole. Don\'t tell my mom.'], ['ENSIGN PARK', 'Park on your six, Captain. I\'ve got the little eyes.'], ['SGT. OKAFOR', 'Okafor here. Rockets hot. Point me at something ugly.'], ['ADA-9', 'Calculating weak points. Result: all of it is gross. Keep firing.'], ['GENERAL HALE', 'Fort Ironrock never misses a fight. Tanks don\'t fly, so I brought the next best thing.'], ['ELISMAS', 'A true gunner never wastes a shot. You are wasting several. Aim.'],
  ['THE BUG MASTER', 'The hive remembers this thing. The hive does not forgive it.'], ['MAXURGE', 'One eye sees farther than two. Let us see how far it sees with none.'], ['RAMICK', 'I left my sword at home. I regret nothing. LASERS!'], ['CAPTAIN SKYE', 'Watch for the beam! When the big eye locks on, MOVE.'], ['HARBOR MASTER RELL', 'I logged every ship that ever flew. This one\'s going in the book as a win.'], ['LUMEN', 'Its light is failing. Keep pushing, trooper!'], ['B.U.R.P.', 'Hull integrity: worrying. Morale: surprisingly high. Snacks: none.']];
function mawAlliesArrive(quick) {
  if (MAW.alliesIn) return; MAW.alliesIn = true;
  MAW_ALLIES.forEach(([name, col], i) => { let o;
    try { o = makeStarship(col, { p: i % SHIP_PAINTS.length, a: i % SHIP_ACCENTS.length, wing: 0, eng: i % 2, nose: 0, fin: 0, pod: 0 }); } catch (_) { o = makeStarship(col); }
    o.scale.setScalar(1.1); o.position.copy(MAW.back.position).add(V((i - 6) * 12, (i % 3) * 8, 0)); levelGroup.add(o);
    MAW.allies.push({ o, name, a: i * 0.483, R: 150 + (i % 4) * 26, h: ((i % 5) - 2) * 26, sp: 0.16 + (i % 3) * 0.04, cd: 0.5 + i * 0.13, enter: quick ? 1 : 0 }); });
  if (quick) mawSquadIn();
}
function mawSquadIn() {
  mawComms('CAPTAIN VEGA', 'Squadron, on the rookie. Let\'s finish this.');
  mawAt(4.5, () => mawBurp('They came for you, Captain. All of them. Let\'s bring them home.'));
}
// scripted beats on the fight clock (pauses with the game)
function mawAt(dt, fn) { MAW.ev.push({ at: MAW.t + dt, fn }); }
// ---- light shows: ally laser bolts that fly to the Maw and burst on its hide ----
let mawFlashTex = null;
function mawFx() {
  if (MAW.fxPool) return MAW.fxPool;
  if (!mawFlashTex) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), gr = x.createRadialGradient(32, 32, 1, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,220,150,0.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); mawFlashTex = new THREE.CanvasTexture(cv); }
  const P = { beams: [], flashes: [], bi: 0, fi: 0, geo: new THREE.BoxGeometry(1, 1, 1), mats: {} };
  for (let i = 0; i < 56; i++) { const m = new THREE.Mesh(P.geo, mawBeamMat0()); m.visible = false; levelGroup.add(m); P.beams.push(m); }
  for (let i = 0; i < 18; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mawFlashTex, color: '#ffd36a', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.visible = false; levelGroup.add(sp); P.flashes.push(sp); }
  return (MAW.fxPool = P);
}
const mawBeamMats = {};
function mawBeamMat(col) { return mawBeamMats[col] || (mawBeamMats[col] = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); }
function mawBeamMat0() { return mawBeamMat('#8fe3ff'); }
function mawFlash(p, col, size, life) { const P = mawFx(), sp = P.flashes[P.fi++ % P.flashes.length]; sp.position.copy(p); sp.material.color.set(col); sp.visible = true; MAW.flashes = MAW.flashes.filter(f => f.sp !== sp); MAW.flashes.push({ sp, t: 0, life: life || 0.3, size }); }
function mawAllyShot(from, to, col, miss, big) { const P = mawFx(), m = P.beams[P.bi++ % P.beams.length]; MAW.shots = MAW.shots.filter(s => s.m !== m);
  m.material = mawBeamMat(col); m.visible = true; m.position.copy(from); m.lookAt(to); m.scale.set(big ? 1.3 : 0.9, big ? 1.3 : 0.9, big ? 26 : 20); MAW.shots.push({ m, from: from.clone(), to: to.clone(), t: 0, dur: Math.max(0.08, from.distanceTo(to) / (big ? 1100 : 650)), col, miss, big }); }
// ---- smoke and fire boiling off it in the last phase ----
let mawSmokeTex = null;
function mawSmokeSprite() {
  const P = mawFx(); if (!P.smoke) { if (!mawSmokeTex) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d');
      for (let i = 0; i < 7; i++) { const cx = 20 + Math.random() * 24, cy = 20 + Math.random() * 24, r = 14 + Math.random() * 14, gr = x.createRadialGradient(cx, cy, 1, cx, cy, r); gr.addColorStop(0, 'rgba(70,64,72,0.55)'); gr.addColorStop(1, 'rgba(40,36,44,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }
      mawSmokeTex = new THREE.CanvasTexture(cv); }
    P.smoke = []; P.si = 0; for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mawSmokeTex, color: '#8a8290', transparent: true, depthWrite: false, fog: false })); sp.visible = false; levelGroup.add(sp); P.smoke.push(sp); } }
  const sp = P.smoke[P.si++ % P.smoke.length]; MAW.smoke = MAW.smoke.filter(m => m.sp !== sp); return sp;
}
function mawBlast(big) {
  const n = V(rand(-1, 1), rand(-0.7, 1), rand(-0.2, 1)).normalize(); if (player.pos.distanceTo(MAW_C) > 1) n.add(player.pos.clone().sub(MAW_C).normalize().multiplyScalar(0.8)).normalize();
  const p = MAW_C.clone().addScaledVector(n, MAW_R * 0.9);
  mawFlash(p, big ? '#ffb060' : '#ff7a3a', big ? 90 : 55, big ? 0.7 : 0.45); burst(p, '#ffd36a', big ? 12 : 6, 40); burst(p, '#ff5a20', big ? 8 : 4, 26);
  for (let k = 0; k < (big ? 3 : 2); k++) { const sp = mawSmokeSprite(); sp.visible = true; sp.position.copy(p).addScaledVector(n, k * 6); sp.material.rotation = Math.random() * 6;
    MAW.smoke.push({ sp, t: 0, life: 2.4 + Math.random() * 1.4, size: (big ? 70 : 45) + Math.random() * 30, v: n.clone().multiplyScalar(18 + Math.random() * 22).add(V(0, 6, 0)), spin: rand(-0.6, 0.6) }); }
  if (big && player.pos.distanceTo(MAW_C) < 900) SFX.boom();
}
function mawFxStep(dt) {
  for (let i = MAW.shots.length - 1; i >= 0; i--) { const s = MAW.shots[i]; s.t += dt; const k = Math.min(1, s.t / s.dur);
    s.m.position.lerpVectors(s.from, s.to, k); if (k >= 1) { s.m.visible = false; MAW.shots.splice(i, 1); if (!s.miss) { mawFlash(s.to, s.col, (s.big ? 22 : 16) + Math.random() * 8, 0.28); if (Math.random() < (s.big ? 0.2 : 0.45)) burst(s.to, s.col, 3, 14); } } }
  for (let i = MAW.smoke.length - 1; i >= 0; i--) { const m = MAW.smoke[i]; m.t += dt; const k = m.t / m.life;
    if (k >= 1) { m.sp.visible = false; MAW.smoke.splice(i, 1); continue; } m.sp.position.addScaledVector(m.v, dt); m.sp.scale.setScalar(m.size * (0.4 + k * 1.4)); m.sp.material.opacity = 0.7 * (1 - k) * Math.min(1, k * 6); m.sp.material.rotation += dt * m.spin; }
  for (let i = MAW.flashes.length - 1; i >= 0; i--) { const f = MAW.flashes[i]; f.t += dt; const k = f.t / f.life;
    if (k >= 1) { f.sp.visible = false; MAW.flashes.splice(i, 1); continue; } f.sp.scale.setScalar(f.size * (0.6 + k * 0.8)); f.sp.material.opacity = 1 - k; }
}
// a point on the Maw's hide, on the side facing `from`
function mawHitPoint(from) {
  const n = from.clone().sub(MAW_C).normalize().add(V(rand(-0.55, 0.55), rand(-0.45, 0.45), rand(-0.55, 0.55))).normalize();
  return MAW_C.clone().addScaledVector(n, MAW_R * 0.86);
}
function mawAllyStep(dt, t) {
  mawFxStep(dt);
  for (let i = MAW.allies.length - 1; i >= 0; i--) { const A = MAW.allies[i]; if (A.doom && mawDoomStep(A, dt)) { MAW.allies.splice(i, 1); } }
  let fq = null; if (MAW.final >= 2) { _e.set(player.pitch, player.yaw, 0); fq = new THREE.Quaternion().setFromEuler(_e); }
  const live = MAW.allies.filter(a => !a.doom);
  for (const A of MAW.allies) {
    if (fq && !A.doom) { const i = live.indexOf(A), n = live.length, a = (i / n) * Math.PI * 2 + 0.3;
      const off = V(Math.cos(a) * (26 + (i % 2) * 12), Math.sin(a) * (15 + (i % 2) * 7), 14 + (i % 3) * 8).applyQuaternion(fq);
      A.o.position.lerp(player.pos.clone().add(off), Math.min(1, dt * 3.5)); A.o.quaternion.slerp(fq, Math.min(1, dt * 5));
      if (MAW.dead) continue;
      A.cd -= dt; if (A.cd <= 0) { A.cd = (MAW.mega ? 0.12 : 0.22) + Math.random() * 0.2; const from = A.o.position.clone(); mawAllyShot(from, mawHitPoint(from), A.name === 'Captain Vega' ? '#ffd36a' : A.name === 'Ramick' ? '#ff7a5a' : '#8fe3ff'); }
      mawDamage(dt * 60 * (MAW.mega ? 1.6 : 1.2) * (1 + 0.35 * (S.asc || 0)), false);
      continue; }
    A.a += A.sp * dt; const want = MAW_C.clone().add(V(Math.cos(A.a) * A.R, A.h + Math.sin(t * 0.5 + A.a) * 20, Math.sin(A.a) * A.R + 40));
    A.enter = Math.min(1, A.enter + dt * 0.35); A.o.position.lerp(want, A.enter < 1 ? dt * 1.2 : Math.min(1, dt * 3));
    const ahead = MAW_C.clone().add(V(Math.cos(A.a + 0.2) * A.R, A.h, Math.sin(A.a + 0.2) * A.R + 40)); A.o.lookAt(ahead); A.o.rotateY(Math.PI);
    if (MAW.dead) continue;
    if (A.doom) continue;
    A.cd -= dt; if (A.cd <= 0 && A.enter > 0.6) { A.cd = 0.35 + Math.random() * 0.5; const from = A.o.position.clone(), hit = mawHitPoint(from); mawAllyShot(from, hit, A.name === 'Captain Vega' ? '#ffd36a' : A.name === 'Ramick' ? '#ff7a5a' : '#8fe3ff'); }
    mawDamage(dt * 60 * (1 + 0.35 * (S.asc || 0)), false);
  }
}
// the Maw singles out a wingman: its eye burns a line to them, and they're gone
function mawDoom(L) {
  const A = MAW.allies.find(a => a.name === L[1]); if (!A || A.doom) return;
  A.doom = { t: 0, beam: null, L }; MAW.lost.push(L[1]);
  mawComms(L[1].toUpperCase(), L[2], 2.2);
}
function mawDoomStep(A, dt) {
  const D = A.doom, L = D.L; D.t += dt; const eyeW = MAW.obj.userData.eye.getWorldPosition(V(0, 0, 0)), p = A.o.position;
  A.o.rotation.z += dt * (2 + D.t * 6); p.add(V(rand(-0.6, 0.6), rand(-0.6, 0.6), rand(-0.6, 0.6)));
  if (D.t > 0.5 && !D.beam) { D.beam = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#ff3a5a', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); levelGroup.add(D.beam); }
  if (D.beam) { const d = p.clone().sub(eyeW), len = d.length(); D.beam.position.copy(eyeW).addScaledVector(d, 0.5); D.beam.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); D.beam.scale.set(1 + Math.sin(D.t * 40) * 0.3, len, 1 + Math.sin(D.t * 40) * 0.3);
    if (Math.random() < 0.4) burst(p, '#ff6a4a', 2, 12); }
  if (D.t < 1.4) return false;
  if (D.beam) levelGroup.remove(D.beam);
  burst(p, '#ffd36a', 26, 46); burst(p, '#ff5a20', 18, 30); burst(p, '#c8c8d0', 10, 22); mawFlash(p, '#ffb060', 70, 0.9);
  if (player.pos.distanceTo(p) < 900) SFX.boom();
  if (fly) fly.shake = Math.max(fly.shake || 0, 0.25);
  levelGroup.remove(A.o);
  mawAt(1.0, () => mawComms(L[3], L[4], 3.4));
  MAW.ev.push({ at: MAW.t + 4.8, fn: () => mawBurp(L[5], 6.5), burp: 1 });
  return true;
}
// ---- the fight ----
const MAW_FINAL_TOUGH = 0.6; // the last, morphed phase soaks more: every hit lands at 60%
function mawDamage(n, byYou, at) {
  if (MAW.dead || !MAW.obj) return; if (MAW.final) n *= MAW_FINAL_TOUGH; MAW.hp -= n;
  const f = MAW.hp / MAW.max, ph = f > 0.66 ? 1 : f > 0.33 ? 2 : 3;
  if (ph !== MAW.phase && !MAW.final) { MAW.phase = ph; MAW.obj.userData.rage = ph - 1; SFX.boom(); if (fly) fly.shake = 0.6;
    toast(ph === 2 ? 'IT SPAWNS' : 'IT\'S ENRAGED', ph === 2 ? 'The Maw tears off pieces of itself' : 'Every eye opens at once', 2.5); }
  if (!MAW.alliesIn && f < 0.86) mawAlliesCut();
  if (MAW.alliesIn && MAW.intro && !CUT.on) { for (const L of MAW_LOSSES) if (f < L[0] && f > 0.03 && MAW.lost.indexOf(L[1]) < 0 && !MAW.allies.some(a => a.doom)) { mawDoom(L); break; } }
  if (!MAW.final && f < 0.12 && f > 0 && MAW.intro) mawFinal();
  if (MAW.final && !MAW.mega && MAW.hp < MAW.max * 0.09) MAW.hp = MAW.max * 0.09;
  if (MAW.hp <= 0) { MAW.hp = 0; mawDeath(); }
}
function mawSpawn() {
  const alive = fly.raiders.filter(r => !r.dead).length; if (alive >= 7) return;
  for (let k = 0; k < (MAW.phase === 3 ? 3 : 2); k++) {
    const obj = makeEyeWatcher(false); obj.scale.setScalar(4.5); obj.rotation.order = 'YXZ'; levelGroup.add(obj);
    const p = MAW_C.clone().addScaledVector(player.pos.clone().sub(MAW_C).normalize(), MAW_R + 10).add(V(rand(-30, 30), rand(-20, 20), rand(-30, 30))); obj.position.copy(p);
    const plate = labelSprite(512, 72); plate.scale.set(3.2, 0.45, 1); plate.position.y = 3.2; obj.add(plate);
    // a soft red halo so they read against the dark
    const halo = deadGlow('255,40,50', 7.5); halo.position.set(0, 1.7, 0); obj.add(halo);
    const lv = 32, r = { obj, plate, halo, home: p.clone(), lv, max: 900 + S.lvl * 30, hp: 0, cd: rand(1.5, 3), dead: 0, vel: V(0, 0, 0), wander: p.clone(), aggro: false, def: { name: 'Maw Spawn' }, maw: true,
      slot: { f: 0.35 + k * 0.1 + rand(0, 0.08), ox: rand(-1, 1), oy: rand(-1, 1), ph: rand(0, 6.28) } };
    r.hp = r.max; fly.raiders.push(r); drawPlate(plate, 'Maw Spawn', 'Lv ' + S.lvl, '#ff6a6a', null); burst(p, '#c86aff', 12, 20);
  }
}
// the Maw's shots: spinning purple rings of light, flying face-first
let mawRingGeo = null, mawRingIn = null; const mawRingMats = {};
function mawRingMat(col) { return mawRingMats[col] || (mawRingMats[col] = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); }
function mawBolt(from, dmg, spread) {
  if (!mawRingGeo) { mawRingGeo = new THREE.TorusGeometry(1, 0.16, 5, 22); mawRingIn = new THREE.RingGeometry(0.55, 0.9, 20); }
  const F = fly, m = new THREE.Group(), hot = MAW.phase === 3;
  m.add(new THREE.Mesh(mawRingGeo, mawRingMat(hot ? '#ff4ae0' : '#b84aff')), new THREE.Mesh(mawRingIn, mawRingMat(hot ? '#7a1a8a' : '#4a1a8a')));
  m.scale.setScalar(5); m.position.copy(from); levelGroup.add(m);
  const d = player.pos.distanceTo(from), lead = player.pos.clone().addScaledVector(F.vel, d / 170).add(V(rand(-spread, spread), rand(-spread, spread), rand(-spread, spread)));
  const v = lead.sub(from).normalize().multiplyScalar(170); m.quaternion.setFromUnitVectors(V(0, 0, 1), v.clone().normalize());
  F.bolts.push({ m, v, life: 5, dmg, ring: Math.random() * 6.28 });
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
  // the rings spin and pulse as they fly
  for (const b of F.bolts) if (b.ring != null) { b.ring += dt; b.m.children[0].rotation.z = b.ring * 5; b.m.scale.setScalar(5 + Math.sin(b.ring * 14) * 0.9); }
  // the spawn hold the line between you and the Maw, drifting, and fire from there
  { const toP = player.pos.clone().sub(MAW_C), dist = toP.length(), dir = toP.clone().normalize(), rt = V(0, 1, 0).cross(dir); if (rt.lengthSq() < 0.01) rt.set(1, 0, 0); rt.normalize(); const up = dir.clone().cross(rt).normalize();
    for (const r of F.raiders) { if (!r.maw || r.dead || !r.slot) continue; const o = r.obj, S2 = r.slot; r.aggro = false;
      const along = clamp(dist * S2.f, MAW_R + 35, Math.max(MAW_R + 35, dist - 60)), wob = t * 0.5 + S2.ph;
      const goal = MAW_C.clone().addScaledVector(dir, along).addScaledVector(rt, S2.ox * 70 + Math.sin(wob) * 14).addScaledVector(up, S2.oy * 42 + Math.cos(wob * 1.3) * 10);
      r.wander.copy(goal); r.vel.set(0, 0, 0); o.position.lerp(goal, Math.min(1, dt * 1.4)); o.lookAt(player.pos); o.visible = true;
      if (r.halo) { r.halo.visible = true; r.halo.material.opacity = 0.75 + Math.sin(t * 3 + S2.ph) * 0.2; }
      const d = o.position.distanceTo(player.pos);
      if (MAW.intro && !MAW.dead && player.alive) { r.cd -= dt; if (r.cd <= 0 && d < 650) { r.cd = rand(1.6, 2.8); const m = new THREE.Mesh(boltGeo, glow('#ff2a3a')); m.scale.setScalar(5); m.position.copy(o.position); levelGroup.add(m);
        const lead = player.pos.clone().addScaledVector(F.vel, d / 150); F.bolts.push({ m, v: lead.sub(o.position).normalize().multiplyScalar(150), life: 4, dmg: 6 + r.lv * 0.9 }); } } } }
  if (MAW.dead || !player.alive || !MAW.intro) return;
  MAW.t += dt; const ph = MAW.phase, eyeW = MAW.obj.userData.eye.getWorldPosition(V(0, 0, 0));
  for (let i = MAW.ev.length - 1; i >= 0; i--) if (MAW.t >= MAW.ev[i].at) { const e = MAW.ev.splice(i, 1)[0]; try { e.fn(); } catch (err) { console.warn('maw beat', err); } }
  // turn to face you
  const want = Math.atan2(player.pos.x - MAW_C.x, player.pos.z - MAW_C.z); let dy = want - MAW.obj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); MAW.obj.rotation.y += dy * Math.min(1, dt * 0.35);
  MAW.obj.rotation.x = clamp(-Math.atan2(player.pos.y - MAW_C.y, Math.hypot(player.pos.x - MAW_C.x, player.pos.z - MAW_C.z)) * 0.6, -0.4, 0.4);
  // volleys from the little eyes
  MAW.volT -= dt; if (MAW.volT <= 0) { MAW.volT = ph === 3 ? 1.6 : ph === 2 ? 2.3 : 3.0; const E = MAW.obj.userData.eyes.filter(e => e.visible); const n = ph === 3 ? 6 : ph === 2 ? 4 : 3;
    for (let k = 0; k < n; k++) { const e = E[(Math.random() * E.length) | 0]; if (!e) break; mawBolt(e.getWorldPosition(V(0, 0, 0)), 26 + ph * 4, 14); } if (dm < 700) SFX.zap(); }
  // the last phase: mega guns, explosions and smoke
  if (MAW.final >= 2) mawFinalStep(dt, t);
  // the eye beam: it locks on, then burns a line you have to dodge
  if (MAW.final) MAW.beamT = Math.max(MAW.beamT, 3);
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
  if (MAW.alliesIn) { MAW.commsT -= dt; if (MAW.commsT <= 0) { MAW.commsT = 9 + Math.random() * 5;
    for (let n = 0; n < MAW_CHATTER.length; n++) { const [w, l] = MAW_CHATTER[MAW.said++ % MAW_CHATTER.length]; if (MAW.lost.some(x => x.toUpperCase() === w) || (MAW.nowSaid && w === 'B.U.R.P.')) continue; if (w === 'B.U.R.P.') mawBurp(l, 5); else mawComms(w, l); break; } } }
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
// the last, morphed phase gets its own track (Orchestral Mayhem, Phil's pick), looping until the Maw dies
TRACKS.mayhem = 'music/mayhem.mp3'; PLAYLISTS.mawfinal = ['mayhem'];
{ const _mc = musContext; musContext = function (dt) { const r = _mc(dt); if (LEVEL && LEVEL.id === 'maw' && !MAW.dead) return MAW.final ? 'mawfinal' : 'eyeboss'; return r; }; }

// ---- the last phase: it morphs, the squadron forms up on you, and B.U.R.P. offers fight mode ----
const MAW_FM_ASK = 'Captain, want me to activate fight mode?', MAW_FM_ON = 'Fight mode, activated.';
function mawFinal() {
  if (MAW.final) return; MAW.final = 1; MAW.ev = MAW.ev.filter(e => !e.burp);
  if (MAW.beam) { if (MAW.beam.fire) levelGroup.remove(MAW.beam.fire); if (MAW.beam.tl) levelGroup.remove(MAW.beam.tl); MAW.beam = null; }
  fly.bolts.forEach(b => levelGroup.remove(b.m)); fly.bolts.length = 0;
  if (!MAW.alliesIn) mawAlliesArrive(true);
  const m = MAW.obj, U = m.userData, t0 = performance.now() / 1000, T = () => performance.now() / 1000 - t0;
  MAW.allies.forEach(A => { if (A.doom) { if (A.doom.beam) levelGroup.remove(A.doom.beam); levelGroup.remove(A.o); } }); MAW.allies = MAW.allies.filter(A => !A.doom);
  const go = () => { U.morph = 1; MAW.final = 2; MAW.phase = 4; U.rage = 3; U.iris.material = glow('#ff4ae0');
    toast('IT CHANGES', 'Its last form. Everyone, on the Captain!', 2.5);
    mawComms('CAPTAIN VEGA', 'Squadron, form up on the Captain! All guns, together!', 3.5);
    mawAt(3.2, () => { mawBurp(MAW_FM_ASK, 5); mawFightPrompt(); }); };
  if (CUT.on) { go(); return; }
  runCutscene({ lock: 1.5, shots: [
    { text: 'It splits open.', dur: 3.2, cam: (t, k) => { U.morph = Math.min(1, k * 1.2); mawAnim(m, T(), camera.position); m.position.copy(MAW_C).add(V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(3)); if (k > 0.2 && !U.morphBoom) { U.morphBoom = 1; SFX.boom(); burst(MAW_C, '#ff4ae0', 30, 60); } camLook(player.pos.clone().lerp(MAW_C, 0.35).add(V(60, 40, 0)), MAW_C); } },
    { text: 'And the squadron closes around you.', dur: 3, cam: (t, k) => { MAW.final = 2; mawAllyStep(1 / 60, T()); m.position.copy(MAW_C); const c = player.pos; _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); camLook(c.clone().add(V(0, 22, 70).applyQuaternion(_q)), c.clone().add(V(0, 0, -80).applyQuaternion(_q))); } },
  ], onEnd: () => { m.position.copy(MAW_C); go(); } });
}
function mawFightPrompt() {
  if (MAW.mega || $('mawFight')) return;
  const d = document.createElement('div'); d.id = 'mawFight'; d.style.cssText = 'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 40px);transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:10px;padding:5px 6px 5px 12px;background:rgba(20,6,30,.7);border:1px solid #ff4ae0;border-radius:8px;font:600 12px var(--hud,sans-serif);color:#f4d8ff;pointer-events:none';
  d.innerHTML = '<span>B.U.R.P.: Fight mode?</span>';
  const b = document.createElement('button'); b.textContent = 'ACTIVATE' + (TOUCH ? '' : ' [F]'); b.style.cssText = 'pointer-events:auto;font:800 14px var(--hud,sans-serif);letter-spacing:.12em;padding:8px 16px;border-radius:6px;border:0;background:linear-gradient(#ff6ae8,#b42ad0);color:#fff;box-shadow:0 0 14px #ff4ae0;cursor:pointer';
  d.appendChild(b); document.body.appendChild(d);
  const on = () => { if (MAW.mega) return; document.removeEventListener('keydown', key, true); d.remove(); mawFightMode(); };
  const key = e => { if (e.code === 'KeyF' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); on(); } };
  b.addEventListener('click', on); b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); on(); }, { passive: false }); document.addEventListener('keydown', key, true);
  MAW.fmCancel = () => { document.removeEventListener('keydown', key, true); d.remove(); };
  mawAt(5.5, on);
}
function mawFightMode() {
  if (MAW.mega || MAW.dead) return; MAW.mega = true; MAW.megaT = 0; MAW.vegaT = 7;
  mawBurp(MAW_FM_ON, 2.6); toast('FIGHT MODE', 'Mega guns online', 2.5); SFX.level(); if (fly) fly.shake = 0.4;
  MAW.ev.push({ at: MAW.t + 2.8, fn: () => { MAW.nowSaid = true; mawBurp(MAW_NOW, 5); }, burp: 1 });
  mawAt(8.5, () => mawComms('CAPTAIN VEGA', 'Keep firing! KEEP FIRING!', 3.5));
}
function mawFinalStep(dt, t) {
  const F = fly;
  // explosions and smoke boil off it, more of them once the mega guns are tearing in
  MAW.blastT -= dt; if (MAW.blastT <= 0) { MAW.blastT = MAW.mega ? 0.28 + Math.random() * 0.25 : 0.9 + Math.random() * 0.6; mawBlast(MAW.mega && Math.random() < 0.4); }
  if (MAW.mega && MAW.nowSaid && BURP.maw_final && BURP.maw_final.length) { MAW.burpT = (MAW.burpT == null ? 9 : MAW.burpT) - dt; if (MAW.burpT <= 0) { MAW.burpT = 11 + Math.random() * 5; const L = BURP.maw_final.filter(l => l !== MAW.lastBurp), l = (L.length ? L : BURP.maw_final)[(Math.random() * (L.length || BURP.maw_final.length)) | 0]; MAW.lastBurp = l; MAW.vegaT = Math.max(MAW.vegaT, 4); mawBurp(l, 4.5); } }
  if (MAW.mega) { MAW.vegaT -= dt; if (MAW.vegaT <= 0) { MAW.vegaT = 14; mawComms('CAPTAIN VEGA', ['Keep firing!', 'Don\'t let up! Keep firing!', 'It\'s breaking! Keep firing, Captain!'][(Math.random() * 3) | 0], 3); } }
  if (!MAW.mega || !player.alive) return;
  // mega guns: a storm of shots from every hardpoint while you fire (or while it's in your sights)
  _e.set(player.pitch, player.yaw, 0); _q.setFromEuler(_e); shipFwd.set(0, 0, -1).applyQuaternion(_q); shipRight.set(1, 0, 0).applyQuaternion(_q); const up = V(0, 1, 0).applyQuaternion(_q);
  const toM = MAW_C.clone().sub(player.pos).normalize(), inSight = toM.dot(shipFwd) > 0.9;
  if (!(firing || inSight)) return;
  MAW.megaCd -= dt; let shots = 0;
  const dmg = SHIP_SYS.laser.lv[sysLv('laser')].dmg * (1 + (S.lvl - 1) * 0.03) * (typeof shipMod === 'function' ? shipMod('laser') : 1);
  while (MAW.megaCd <= 0 && shots < 4) { MAW.megaCd += 0.035; shots++;
    const side = (MAW.megaN = (MAW.megaN || 0) + 1) % 4, ox = [-5.5, 5.5, -2.5, 2.5][side], oy = side > 1 ? -1.5 : 0.8;
    const from = player.pos.clone().addScaledVector(shipRight, ox).addScaledVector(up, oy).addScaledVector(shipFwd, 2);
    const dir = shipFwd.clone().add(V(rand(-0.03, 0.03), rand(-0.03, 0.03), rand(-0.03, 0.03))).normalize(), tt = raySphere(from, dir, MAW_C, MAW_R * 0.92);
    const col = side % 2 ? '#ff6ae8' : '#9aff6a';
    if (tt > 0 && tt < 1600) { mawAllyShot(from, from.clone().addScaledVector(dir, tt), col, false, true); mawDamage(dmg * 0.55, true); }
    else mawAllyShot(from, from.clone().addScaledVector(dir, 600), col, true, true); }
  if (shots && (MAW.megaS = (MAW.megaS || 0) + 1) % 3 === 0) { try { SFX.zap(); } catch (_) {} }
  if (MAW.megaCd < -0.2) MAW.megaCd = 0;
}
// ---- scenes ----
const camLook = (p, at) => { camera.position.copy(p); camera.lookAt(at); };
function mawIntro() {
  const first = !(S.flags && S.flags.mawIntro), m = MAW.obj, U = m.userData, ship = fly.ship; U.roared = 0;
  U.open = 0; const t0 = performance.now() / 1000, T = () => performance.now() / 1000 - t0;
  ship.position.set(0, 20, 740); ship.quaternion.identity();
  const done = () => { MAW.intro = true; U.open = 1; S.flags = S.flags || {}; S.flags.mawIntro = 1; markDirty(); player.pos.set(0, 0, 560); player.yaw = 0; player.pitch = 0;
    if (!first) toast('THE GREATER MAW', 'Again. It remembers you.', 2.5);
    mawAt(2.5, () => mawBurp('No jokes this time, Captain. Just come back in one piece.', 5.5)); };
  runCutscene({ music: 'eyeboss', lock: first ? 4 : 1.5, shots: [
    { text: 'You go through alone.', dur: 4.5, cam: (t, k) => { wormholeAnim(MAW.back, T()); ship.position.set(0, 20 - k * 20, 740 - k * 180); camLook(V(-30 + k * 10, 34, 690 - k * 150), ship.position.clone().add(V(0, 0, -40))); } },
    { text: 'No stars. No sound. Just the things it has eaten.', dur: 5.5, cam: (t, k) => { const a = 2.2 + k * 0.6; camLook(V(Math.cos(a) * 700, 160 - k * 60, Math.sin(a) * 700 - 150), V(0, 0, -150)); mawAnim(m, T(), null); } },
    { text: 'And waiting at the bottom of the dark...', dur: 5, cam: (t, k) => { mawAnim(m, T(), null); camLook(V(0, 30 - k * 10, 420 - k * 200), MAW_C.clone().add(V(0, 8, 0))); } },
    { text: 'THE GREATER MAW', dur: 4.5, cam: (t, k) => { U.open = Math.min(1, k * 1.6); mawAnim(m, T(), V(0, 0, 400)); if (k > 0.3 && !U.roared) { U.roared = 1; SFX.boom(); } camLook(V(Math.sin(k * 0.6) * 30, 24, 190 - k * 30), U.eye.getWorldPosition(V(0, 0, 0))); } },
  ], onEnd: done });
}
function mawAlliesCut() {
  if (MAW.alliesIn) return;
  const again = !!(S.flags && S.flags.mawAllies);
  mawAlliesArrive(false); const ships = MAW.allies, B = MAW.back.position, t0 = performance.now() / 1000;
  const fwd = (k) => ships.forEach((A, i) => { A.o.position.copy(B).add(V((i - 4.5) * 14, (i % 3) * 10 - 10, -k * (120 + (i % 4) * 30))); A.o.lookAt(MAW_C); A.o.rotateY(Math.PI); A.enter = 0; });
  runCutscene({ lock: again ? 1.5 : 3, shots: [
    { text: 'Behind you, the wormhole flares.', dur: 3, cam: (t, k) => { wormholeAnim(MAW.back, performance.now() / 1000 - t0); MAW.back.scale.setScalar(1 + k * 0.4); fwd(0); camLook(player.pos.clone().add(V(20, 16, -40)), B); } },
    { text: 'VEGA: You really thought we\'d let you go in alone, rookie?', dur: 4, cam: (t, k) => { fwd(k); camLook(B.clone().add(V(60, 30, -260)), B.clone().add(V(0, 0, -k * 150))); } },
    { text: 'SKYE: Earth Defense Force, on your wing. ADA-9: Robot City sends its regards.', dur: 4, cam: (t, k) => { fwd(1 + k * 0.6); const c = ships[0].o.position; camLook(c.clone().add(V(-30, 12, 40)), c.clone().add(V(0, 0, -60))); } },
    { text: 'ELISMAS: Four Masters. Four arts. One eye. Let us close it.', dur: 4, cam: (t, k) => { fwd(1.6 + k * 0.5); const c = ships[6].o.position; camLook(c.clone().add(V(24, 10, 30)), MAW_C); } },
  ], onEnd: () => { MAW.back.scale.setScalar(1); S.flags = S.flags || {}; S.flags.mawAllies = 1; markDirty(); mawSquadIn(); } });
}
function mawDeath() {
  if (MAW.dead) return; MAW.dead = true; if (MAW.fmCancel) { MAW.fmCancel(); MAW.fmCancel = null; } const m = MAW.obj, U = m.userData, first = !(S.flags && S.flags.mawDead), t0 = performance.now() / 1000;
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
    toast('THE GREATER MAW IS DEAD', first ? 'The galaxy can breathe again' : 'The rift remembers. It will be back.', 4); SFX.level();
    if (first) { setTimeout(mawEnding, 1800); return; }
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

// the first kill rolls the ending and credits straight away, then lands you in New Jamestown beside Vega for the hand-in
function mawEnding() {
  S.flags = S.flags || {}; S.flags.creditsSeen = 1; markDirty(); rollCredits(false);
  const iv = setInterval(() => { if (document.getElementById('ending')) return; clearInterval(iv);
    player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; travel('earth');
    setTimeout(() => { const v = npcObjs.vega && npcObjs.vega.obj; if (v && LEVEL.id === 'earth') { const a = v.rotation.y; player.pos.x = v.position.x + Math.sin(a) * 3.2; player.pos.z = v.position.z + Math.cos(a) * 3.2; player.yaw = a; }
      toast('HOME', 'Captain Vega is waiting for you', 4); }, 1100); }, 400);
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
