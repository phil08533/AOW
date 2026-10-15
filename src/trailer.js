// =================== OPENING TRAILER: "THE ART OF WAR" ===================
// A war film built from the game's own models, played the first time a character starts (and from Codex → Cinema).
// It runs in its own little world (TRL.ground, then TRL.space) so nothing in the real game is touched.
// The timeline follows the song "Art of War: Rising Sun" (2:12). Narration cues live in TRL_VO; shots in trlShot().
TRACKS.risingsun = 'music/risingsun.mp3'; TRACKS.eventhorizon = 'music/eventhorizon.mp3';
PLAYLISTS.trailer = ['risingsun']; PLAYLISTS.eyeboss = ['eventhorizon'];
const TRL_VO = [ // [time in seconds, line]
  [3.0, 'Hidden deep in the evil of war… is an art.', 1], [13.2, 'An art that few will ever find.', 2],
  [23.0, 'Generals are artists.', 3], [30.2, 'They command the field. They control the action.', 4],
  [41.0, 'Few warriors can master this art.', 5], [55.0, 'I have…', 6],
  [59.0, 'Every stroke makes a picture upon the field.', 7], [71.0, 'A fallen trooper paints a masterpiece…', 8],
  [90.0, 'Yes… war is an art.', 10], [104.5, 'And only those who find this art…', 11], [121.5, '…will live.', 12]
];
const TRL_END = 134;
const TRL = { on: false };
// ---- music and narration ----
// cutscenes play the soundtrack even when the game music is set to Ambient or Beep boop (only Off keeps them silent)
function musForce(list) { musUnlock(); MUS.force = list; if (PREFS.music === 1 || PREFS.music === 2) { MUS.prevSynth = PREFS.music; SFX.setMusic(0); } musTick(); }
function musRelease(list) { if (list && MUS.force !== list) return; MUS.force = null; if (MUS.prevSynth) { SFX.setMusic(MUS.prevSynth); MUS.prevSynth = 0; } musTick(); }
// the big eye gets its own song
{ const _mc = musContext; musContext = function (dt) { const r = _mc(dt); if (r === 'boss' && enemies.some(e => !e.dead && e.aggro && e.sp && e.sp.type === 'watcher' && e.obj.position.distanceTo(player.pos) < 60)) return 'eyeboss'; return r; }; }
function trlVoice() { if (!window.speechSynthesis) return null; const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); if (!vs.length) return null;
  // the narrator is Captain Vega: a woman's voice, low and steady
  return vs.find(v => /female|samantha|victoria|karen|moira|tessa|fiona|serena|zira|susan|hazel|libby|sonia|aria|jenny/i.test(v.name)) || vs.find(v => /UK/i.test(v.name)) || vs[0]; }
// recorded narration (voice/trailer/t1..t12.mp3, one per TRL_VO line); the browser voice only fills in if a clip won't play
const TRL_CLIPS = {};
function trlClip(n) { const k = 't' + n; if (!TRL_CLIPS[k]) { const a = new Audio('voice/trailer/' + k + '.mp3'); a.preload = 'auto'; TRL_CLIPS[k] = a; } return TRL_CLIPS[k]; }
function trlNarrate(i, text) {
  if (PREFS.voice === false || !PREFS.sfx) return;
  const a = trlClip(i); a.currentTime = 0; a.volume = 1;
  const duck = () => { if (MUS.cur) musFade(MUS.cur, musVol() * 0.5, 0.4); a.onended = () => { if (MUS.cur && TRL.on && !TRL.hush) musFade(MUS.cur, musVol(), 0.9); }; };
  a.play().then(duck).catch(() => trlSay(text));
}
function trlSay(text) {
  if (!(PREFS.voice !== false && PREFS.sfx && window.speechSynthesis && window.SpeechSynthesisUtterance)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/…/g, '...')); const v = trlVoice(); if (v) u.voice = v; u.pitch = 0.8; u.rate = 0.82; u.volume = 1;
    if (MUS.cur) { const v0 = MUS.cur.volume; musFade(MUS.cur, v0 * 0.55, 0.4); u.onend = () => { if (MUS.cur && TRL.on && !TRL.hush) musFade(MUS.cur, musVol(), 0.8); }; } speechSynthesis.speak(u); } catch (_) {}
}
// ---- little helpers ----
const trlE = k => k * k * (3 - 2 * k), trlK = (T, a, b) => clamp((T - a) / (b - a), 0, 1);
function trlGradTex(stops) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; }
// soft, lumpy smoke (many faint blobs) instead of a single round gradient
function trlSmokeTex() { if (TRL.smokeTex) return TRL.smokeTex; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (let i = 0; i < 46; i++) { const a = Math.random() * 6.28, d = Math.random() * 30, px = 64 + Math.cos(a) * d, py = 64 + Math.sin(a) * d, r = 14 + Math.random() * 22, g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  return (TRL.smokeTex = new THREE.CanvasTexture(c)); }
// a painted sky: deep night overhead, a burning band on the horizon, and the setting sun
function trlSky(W, top, mid, hor, low, sunDir, sunCol, sunSize) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top); g.addColorStop(0.36, mid); g.addColorStop(0.5, hor); g.addColorStop(0.56, low); g.addColorStop(1, low); x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -2; W.add(sky);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: trlGradTex([[0, '#fff6dc'], [0.18, sunCol], [0.32, 'rgba(255,90,40,.35)'], [1, 'rgba(255,60,30,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sun.position.copy(sunDir).normalize().multiplyScalar(820); sun.scale.setScalar(sunSize); sun.renderOrder = -1; W.add(sun);
  // a few long cloud streaks across the sun
  const ct = trlSmokeTex(); for (let i = 0; i < 7; i++) { const cl = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, color: i % 2 ? '#3a1a1c' : '#5a2a22', transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
    const a = Math.atan2(sunDir.x, sunDir.z) + (i - 3) * 0.22; cl.position.set(Math.sin(a) * 780, 40 + (i % 3) * 38 + sunDir.y * 2, Math.cos(a) * 780); cl.scale.set(420, 46, 1); cl.renderOrder = -1; W.add(cl); }
  return { sky, sun };
}
function trlPose(o, p) { const R = o.userData.rig; if (!R) return; for (const k of ['armL', 'armR', 'legL', 'legR', 'head']) if (R[k]) { R[k].rotation.x = p[k] || 0; R[k].rotation.z = p[k + 'Z'] || 0; } if (R.torso) { R.torso.rotation.y = p.twist || 0; R.torso.rotation.x = p.lean || 0; } }
function trlRun(o, ph, amt) { const s = Math.sin(ph) * 0.9 * amt; return { legL: s, legR: -s, armL: -s * 0.7, lean: 0.18 * amt }; }
// ---- the battlefield ----
function trlBuildGround() {
  const W = new THREE.Scene(), own = []; W.background = new THREE.Color('#1a0c10'); W.fog = new THREE.FogExp2('#3a1a18', 0.0105);
  const geo = g => { own.push(g); return g; };
  const sunDir = V(-0.32, 0.07, -1); trlSky(W, '#04040a', '#1c0d1e', '#b4441c', '#2a1412', sunDir, 'rgba(255,150,70,.95)', 200);
  W.add(new THREE.HemisphereLight('#8a7a98', '#2a1a14', 0.75)); const sun = new THREE.DirectionalLight('#ffa060', 1.15); sun.position.copy(sunDir).multiplyScalar(80); W.add(sun);
  const rim = new THREE.DirectionalLight('#6a8aff', 0.35); rim.position.set(30, 20, 40); W.add(rim);
  // black smoke columns rising off the far battle, leaning in the wind
  { const ct = trlSmokeTex(); for (let i = 0; i < 9; i++) { const a = -2.2 + i * 0.55, d = 150 + (i % 3) * 60; for (let k = 0; k < 12; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, color: k < 2 ? '#6a2a14' : '#140e10', transparent: true, opacity: 0.95 - k * 0.05, depthWrite: false, fog: false }));
    sp.position.set(Math.sin(a) * d + k * k * 0.5, 4 + k * 7, Math.cos(a) * d - 40); sp.scale.setScalar(14 + k * 5); sp.material.rotation = k; W.add(sp); } } }
  const flash = new THREE.PointLight('#ffb070', 0, 160, 2); W.add(flash);
  const fires = []; for (const [x, z] of [[-8, -16], [10, -26], [-18, 6]]) { const L = new THREE.PointLight('#ff7a2a', 1.4, 26, 2); L.position.set(x, 1.5, z); W.add(L); fires.push(L); }
  // mud with craters
  const gg = geo(new THREE.PlaneGeometry(420, 420, 60, 60)); gg.rotateX(-Math.PI / 2); const pa = gg.attributes.position;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i); pa.setY(i, Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.5 + Math.sin(x * 0.03 + z * 0.05) * 1.2 - (Math.hypot(x, z) < 5 ? 0 : 0)); } gg.computeVertexNormals();
  W.add(new THREE.Mesh(gg, toon('#3a2c24', 'grime')));
  const gy = (x, z) => Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.5 + Math.sin(x * 0.03 + z * 0.05) * 1.2;
  const put = (o, x, z, ry, y) => { o.position.set(x, gy(x, z) + (y || 0), z); o.rotation.y = ry || 0; W.add(o); return o; };
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(geo(new THREE.CircleGeometry(1.5 + (i % 4), 12).rotateX(-Math.PI / 2)), toon('#15110f', 'grime')); const a = i * 2.39, d = 8 + (i * 13) % 70; put(c, Math.cos(a) * d, Math.sin(a) * d - 20, 0, 0.06); }
  // ruins and rocks
  for (let i = 0; i < 30; i++) { const a = i * 1.7, d = 10 + (i * 17) % 80, h = 1 + (i % 5) * 1.3; const w = new THREE.Mesh(geo(new THREE.BoxGeometry(0.8 + (i % 3) * 2, h, 0.7)), toon(i % 2 ? '#4a4640' : '#3a3632', 'stone')); put(w, Math.cos(a) * d, Math.sin(a) * d - 25, a, h / 2 - 0.2).rotation.z = ((i % 3) - 1) * 0.12; }
  for (let i = 0; i < 20; i++) { const r = new THREE.Mesh(geo(new THREE.DodecahedronGeometry(0.6 + (i % 4) * 0.5, 0)), toon('#3a342e', 'stone')); const a = i * 2.9, d = 6 + (i * 11) % 60; put(r, Math.cos(a) * d, Math.sin(a) * d - 10, i, 0.2); }
  // the fallen and their broken weapons
  const gunIds = Object.keys(GUNS).filter(k => !GUNS[k].mana).slice(0, 12);
  for (let i = 0; i < 12; i++) { const f = buildChar(() => i % 3 ? makeTrooper() : makeXR17()); f.rotation.set(-Math.PI / 2, i * 1.3, 0); const a = i * 2.2, d = 4 + (i * 7) % 26; f.position.set(Math.cos(a) * d, gy(Math.cos(a) * d, Math.sin(a) * d - 8) + 0.2, Math.sin(a) * d - 8); W.add(f); }
  for (let i = 0; i < 14; i++) { try { const g = makeGunModel(gunIds[i % gunIds.length]); g.scale.setScalar(1.6); const a = i * 2.7, d = 2.5 + (i * 5) % 20; put(g, Math.cos(a) * d, Math.sin(a) * d - 6, i * 1.3, 0.16).rotation.z = Math.PI / 2; } catch (_) {} }
  // wrecked vehicles and fires
  for (const [x, z, r] of [[-22, -30, 0.4], [26, -12, 2.2], [-34, 18, 1.1], [14, -48, 2.8]]) { const t = makeTankModel('#3a3a32'); t.scale.setScalar(1.6); put(t, x, z, r).rotation.z = 0.25; }
  const flames = []; { const ft = trlGradTex([[0, 'rgba(255,240,180,1)'], [0.35, 'rgba(255,140,40,.8)'], [1, 'rgba(255,60,10,0)']]);
    for (const L of fires) { const f = new THREE.Group(); for (let k = 0; k < 4; k++) { const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: ft, color: ['#ff5a1a', '#ff8a2a', '#ffb050', '#ff7020'][k], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); c.position.set((k - 1.5) * 0.25, 0.5 + (k % 2) * 0.5, 0); c.scale.set(1.3 - k * 0.15, 2 - k * 0.2, 1); f.add(c); } put(f, L.position.x, L.position.z); flames.push(f); } }
  // the warrior and the enemy machines
  const warrior = buildChar(() => makePlayerChar(myLook(), S.col), 'trooper'); W.add(warrior);
  const sword = makeMeleeModel('master'); sword.scale.setScalar(1.4); const R = warrior.userData.rig; (R && R.armR ? R.armR : warrior).add(sword); sword.position.set(0, -0.5, 0.12); sword.rotation.set(Math.PI / 2, 0, 0);
  const MIX = [[makeXR17, 'xr17', 1.25], [typeof makeZR306 === 'function' ? makeZR306 : makeXR17, null, 1.1], [typeof makeK872 === 'function' ? makeK872 : makeXR17, null, 1.1], [typeof makeXGPolice === 'function' ? makeXGPolice : makeXR17, null, 1.1], [typeof makeDrillbot === 'function' ? makeDrillbot : makeXR17, null, 1], [typeof makeSiegeBot === 'function' ? makeSiegeBot : makeXR17, null, 0.8]];
  const mkFoe = i => { const [mk, rg, sc] = MIX[i % MIX.length]; let e; try { e = buildChar(mk, rg && RIGS[rg] ? rg : undefined); } catch (_) { e = buildChar(makeXR17, 'xr17'); } e.scale.setScalar(sc); return e; };
  const foes = []; for (let i = 0; i < 6; i++) { const e = i < 2 ? buildChar(makeXR17, 'xr17') : mkFoe(i - 1); if (i < 2) e.scale.setScalar(1.25); W.add(e); foes.push(e); }
  const foeGun = makeGunModel('c10'); foeGun.scale.setScalar(1.6); W.add(foeGun);
  // the armies in the fog
  const ranks = [];
  for (let i = 0; i < 18; i++) { const e = mkFoe(i); const x = -28 + (i % 9) * 7, z = -58 - Math.floor(i / 9) * 7; put(e, x, z, 0); ranks.push([e, x, z, -1]); }
  for (let i = 0; i < 14; i++) { const e = buildChar(makeTrooper, 'trooper'); const x = -24 + (i % 7) * 8, z = 34 + Math.floor(i / 7) * 6; put(e, x, z, Math.PI); ranks.push([e, x, z, 1]); }
  // the general on the ridge, with a glowing battle map
  const ridge = new THREE.Mesh(geo(new THREE.BoxGeometry(12, 8, 10)), toon('#2e2a26', 'stone')); put(ridge, 34, 30, 0.3, 3.6);
  const general = buildChar(() => makeTrooper(), 'trooper'); put(general, 34, 30, Math.PI + 0.5, 7.7);
  { const cape = new THREE.Mesh(geo(new THREE.PlaneGeometry(0.8, 1.2)), toon('#7a1a1a', 'cloth')); cape.position.set(0, 1.0, -0.2); cape.rotation.x = 0.15; general.add(cape); }
  const mc = document.createElement('canvas'); mc.width = mc.height = 128; const mx = mc.getContext('2d'); const mapTex = new THREE.CanvasTexture(mc);
  const holo = new THREE.Mesh(geo(new THREE.PlaneGeometry(2.4, 1.6)), new THREE.MeshBasicMaterial({ map: mapTex, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  holo.position.set(32.8, gy(34, 30) + 8.9, 28.4); holo.rotation.set(-1.0, 0.5, 0); W.add(holo);
  const drawMap = t => { mx.fillStyle = 'rgba(0,20,30,.9)'; mx.fillRect(0, 0, 128, 128); mx.strokeStyle = 'rgba(80,220,255,.35)'; for (let i = 0; i <= 128; i += 16) { mx.beginPath(); mx.moveTo(i, 0); mx.lineTo(i, 128); mx.moveTo(0, i); mx.lineTo(128, i); mx.stroke(); }
    for (let i = 0; i < 9; i++) { const k = (t * 0.25 + i * 0.11) % 1; mx.fillStyle = '#5fd0ff'; mx.fillRect(20 + i * 10, 100 - k * 60, 5, 5); mx.fillStyle = '#ff4a3a'; mx.fillRect(18 + i * 10, 22 + Math.sin(t + i) * 4, 5, 5); }
    mx.strokeStyle = '#ffd36a'; mx.lineWidth = 2; mx.beginPath(); mx.moveTo(64, 110); mx.lineTo(64 + Math.sin(t) * 20, 40); mx.stroke(); mapTex.needsUpdate = true; };
  // charging soldiers, artillery, aircraft
  const chargers = []; for (let i = 0; i < 8; i++) { const c = buildChar(makeTrooper, 'trooper'); W.add(c); chargers.push([c, -10 + i * 2.6, 26 + (i % 3) * 2, {}]); }
  const guns = []; for (let i = 0; i < 3; i++) { const t = makeTankModel('#4a5a3a'); t.scale.setScalar(1.5); put(t, -46 + i * 9, 40, Math.PI * 0.9); guns.push(t); }
  const planes = []; for (let i = 0; i < 3; i++) { const p = makeDropship(); p.scale.setScalar(1.6); W.add(p); planes.push(p); }
  // the standard
  const banner = new THREE.Group(); banner.add(new THREE.Mesh(geo(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 5)), toon('#5d636c'))).position.y = 2.1;
  { const bc = document.createElement('canvas'); bc.width = 64; bc.height = 48; const x = bc.getContext('2d'); x.fillStyle = '#8a1a1a'; x.fillRect(0, 0, 64, 48); x.fillStyle = '#ffb347'; x.beginPath(); x.arc(32, 30, 12, Math.PI, 0); x.fill(); x.fillRect(12, 31, 40, 2);
    const cloth = new THREE.Mesh(geo(new THREE.PlaneGeometry(1.6, 1.1, 6, 2)), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(bc), side: THREE.DoubleSide })); cloth.position.set(0.82, 3.6, 0); banner.add(cloth); banner.userData.cloth = cloth; }
  put(banner, -5, -20, 0.4);
  const bearer = buildChar(makeTrooper, 'trooper'); put(bearer, -5.5, -20.3, 0.4);
  // the statue of rubble (hidden until the dust settles)
  const statue = new THREE.Group(); statue.visible = false; const SX = 0, SZ = -60;
  const rub = ['#4a4640', '#3a3632', '#5d636c', '#6a5a4a', '#2b2a2c', '#7a6a58'];
  const lump = (cx, cy, cz, sx, sy, sz, n) => { for (let i = 0; i < n; i++) { const s = 0.6 + Math.random() * 1.8, m = new THREE.Mesh(geo(i % 3 ? new THREE.BoxGeometry(s, s * (0.5 + Math.random()), s * 0.8) : new THREE.DodecahedronGeometry(s * 0.6, 0)), toon(rub[i % rub.length], i % 4 ? 'stone' : 'panel'));
    m.position.set(cx + (Math.random() - 0.5) * sx, cy + (Math.random() - 0.5) * sy, cz + (Math.random() - 0.5) * sz); m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); statue.add(m); } };
  // a giant trooper of cracked stone, leaning on a planted greatsword, with the battle's wreckage piled at its feet
  const giant = buildChar(makeTrooper, 'trooper'); const ST = 13;
  giant.traverse(o => { if (!o.isMesh) return; const c = o.material && o.material.color ? o.material.color.getHSL({}).l : 0.4; o.material = toon(c > 0.5 ? '#8a8276' : c > 0.25 ? '#6a6258' : '#4a443e', 'stone'); });
  trlPose(giant, { armR: -0.5, armL: -0.5, armRZ: 0.22, armLZ: -0.22, head: 0.18 }); giant.scale.setScalar(ST); statue.add(giant);
  const great = makeMeleeModel('master'); great.traverse(o => { if (o.isMesh) o.material = toon('#7a7268', 'stone'); }); great.scale.setScalar(15); great.rotation.x = Math.PI; statue.add(great);
  { great.updateMatrixWorld(true); const bx = new THREE.Box3().setFromObject(great); great.position.set(-(bx.min.x + bx.max.x) / 2, 13 - bx.max.y, 6.2 - (bx.min.z + bx.max.z) / 2); }
  lump(0, 0.8, 0, 14, 1.8, 12, 30); lump(0, 2.6, 1, 9, 2.4, 7, 16); lump(0, 15, 1.4, 5, 7, 1.2, 12); lump(-4.2, 13, 0, 1.6, 6, 1.6, 6); lump(4.2, 13, 0, 1.6, 6, 1.6, 6);
  for (let i = 0; i < 10; i++) { try { const g = makeGunModel(gunIds[i % gunIds.length]); g.scale.setScalar(3.5); const a = i * 0.63; g.position.set(Math.cos(a) * (5 + i % 3), 1.2 + (i % 4) * 0.6, Math.sin(a) * (4 + i % 2)); g.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); statue.add(g); } catch (_) {} }
  // light leaking through the cracks in its chest
  const heart = new THREE.Mesh(geo(new THREE.OctahedronGeometry(1.0, 0)), glow('#ffd8a0')); heart.position.set(0, 16.2, 2.0); statue.add(heart);
  for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(geo(new THREE.BoxGeometry(0.16, 1.6 + (i % 3) * 1.1, 0.2)), glow('#ffb860')); const a = i * 0.9; c.position.set(Math.cos(a) * 1.4, 16.2 + Math.sin(a) * 1.5, 2.05); c.rotation.z = a + 1.2; statue.add(c); }
  const heartL = new THREE.PointLight('#ffc070', 0, 40, 2); heartL.position.set(0, 16.5, 5); statue.add(heartL);
  statue.position.set(SX, gy(SX, SZ) - 0.5, SZ); W.add(statue);
  const falling = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(geo(new THREE.BoxGeometry(0.5, 0.4, 0.5)), toon(rub[i % 6], 'stone')); m.visible = false; W.add(m); falling.push({ m, t: Math.random() * 4 }); }
  // the big explosion
  const boom = new THREE.Group(); const shells = []; const ct = trlSmokeTex(), core = trlGradTex([[0, '#ffffff'], [0.3, 'rgba(255,220,150,.95)'], [1, 'rgba(255,120,40,0)']]);
  // kind 0 = white-hot core, 1 = rolling fire, 2 = black smoke; each puff has its own drift so the cloud boils outwards
  for (let i = 0; i < 16; i++) { const kind = i < 2 ? 0 : i < 9 ? 1 : 2; const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: kind ? ct : core, color: kind === 2 ? '#241a18' : kind === 1 ? ['#ff7a2a', '#ffb050', '#ff5a1a'][i % 3] : '#ffffff', transparent: true, depthWrite: false, fog: false, blending: kind === 2 ? THREE.NormalBlending : THREE.AdditiveBlending }));
    m.userData = { kind, d: V((Math.random() - 0.5) * 1.6, 0.2 + Math.random() * (kind === 2 ? 1.4 : 0.8), (Math.random() - 0.5) * 1.6), s: kind === 2 ? 1.3 : kind ? 1 : 0.8, r: Math.random() * 6 }; m.material.rotation = m.userData.r; boom.add(m); shells.push(m); }
  const wave = new THREE.Mesh(geo(new THREE.RingGeometry(0.8, 1, 48)), new THREE.MeshBasicMaterial({ color: '#ffcf8a', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); wave.rotation.x = -Math.PI / 2; wave.position.y = -3.6; boom.add(wave);
  boom.position.set(0, 4, -42); boom.visible = false; W.add(boom);
  const debris = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(geo(new THREE.BoxGeometry(0.6, 0.5, 0.7)), toon(rub[i % 6], 'stone')); m.visible = false; W.add(m); debris.push({ m, v: V((Math.random() - 0.5) * 30, 8 + Math.random() * 20, (Math.random() - 0.5) * 30) }); }
  return { W, own, gy, sun, flash, wave, fires, flames, warrior, sword, foes, foeGun, ranks, general, holo, drawMap, chargers, guns, planes, banner, bearer, statue, heart, heartL, falling, boom, shells, debris };
}
// ---- space ----
function trlBuildSpace() {
  const W = new THREE.Scene(), own = []; W.background = new THREE.Color('#020208');
  const geo = g => { own.push(g); return g; };
  W.add(new THREE.HemisphereLight('#8fa8ff', '#201020', 0.6)); const sun = new THREE.DirectionalLight('#ffe8c0', 1.0); sun.position.set(-300, 120, 200); W.add(sun);
  // stars and the galaxy's spiral
  { const n = 1800, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = 1500, s = Math.sqrt(1 - u * u); p.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3); }
    const g = geo(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); W.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#dfe8ff', size: 2, sizeAttenuation: false }))); }
  const galaxy = new THREE.Group(); W.add(galaxy);
  { const n = 5000, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new THREE.Color();
    for (let i = 0; i < n; i++) { const arm = i % 3, r = Math.pow(Math.random(), 0.7) * 600, a = r * 0.012 + arm * Math.PI * 2 / 3 + (Math.random() - 0.5) * 0.5; p.set([Math.cos(a) * r, (Math.random() - 0.5) * (40 - r * 0.05), Math.sin(a) * r], i * 3); col.setHSL(0.6 - r / 1600 + (arm === 1 ? 0.3 : 0), 0.7, 0.55 + Math.random() * 0.3); c.set([col.r, col.g, col.b], i * 3); }
    const g = geo(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    galaxy.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.5, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }))); }
  const neb = []; const nebTex = [trlGradTex([[0, 'rgba(200,90,255,.55)'], [1, 'rgba(0,0,0,0)']]), trlGradTex([[0, 'rgba(60,220,255,.45)'], [1, 'rgba(0,0,0,0)']]), trlGradTex([[0, 'rgba(255,120,80,.4)'], [1, 'rgba(0,0,0,0)']])];
  for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebTex[i % 3], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); const a = i * 0.7; s.position.set(Math.cos(a) * (200 + i * 40), (i % 3 - 1) * 30, Math.sin(a) * (200 + i * 40)); s.scale.setScalar(260 + i * 30); galaxy.add(s); neb.push(s); }
  const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: trlGradTex([[0, '#ffffff'], [0.25, 'rgba(255,240,200,.9)'], [1, 'rgba(255,200,120,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); star.scale.setScalar(30); W.add(star);
  for (const [x, y, z, r, c] of [[-120, -10, -260, 26, '#3f6fbf'], [170, 30, -420, 40, '#bf6a3f'], [60, -40, -160, 9, '#9aa1aa']]) { const m = new THREE.Mesh(geo(new THREE.SphereGeometry(r, 24, 16)), toon(c, 'stone')); m.position.set(x, y, z); W.add(m); }
  // the fleets: the Setting Sun and friends, and Drome's drone ships
  { const n = 3500, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new THREE.Color(); for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.28, r = 2600, q = Math.sqrt(1 - u * u); p.set([Math.cos(a) * q * r, u * r * 0.6, Math.sin(a) * q * r - 900], i * 3); col.setHSL(0.55 + Math.random() * 0.15, 0.4, 0.6 + Math.random() * 0.4); c.set([col.r, col.g, col.b], i * 3); }
    const g = geo(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); W.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false }))); }
  { const ct = trlSmokeTex(); [['#6a2a9a', -700, 120, -1900, 1500], ['#1a5a9a', 500, -80, -2000, 1300], ['#9a3a2a', 0, 260, -1700, 900], ['#2a7a8a', -300, -300, -1800, 1100], ['#5a2a7a', 800, 300, -1500, 800]].forEach(([col, x, y, z, sz]) => {
    const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, color: col, transparent: true, opacity: 0.38, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); n.position.set(x, y, z); n.scale.setScalar(sz * 1.5); W.add(n); });
    const glare = new THREE.Sprite(new THREE.SpriteMaterial({ map: trlGradTex([[0, '#ffffff'], [0.1, 'rgba(255,230,190,.9)'], [0.4, 'rgba(255,170,90,.18)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); glare.position.set(-900, 260, -1700); glare.scale.setScalar(700); W.add(glare); }
  const fleetPos = V(0, 0, -900); const fleet = new THREE.Group(); fleet.position.copy(fleetPos); W.add(fleet);
  const hero = makeStarship(S.col); hero.scale.setScalar(2); fleet.add(hero);
  const allies = []; const VF = [[-10, 1, 6], [10, 1, 6], [-20, -2, 13], [20, -2, 13], [-5, 7, 18], [5, -6, 18]]; for (let i = 0; i < 6; i++) { const s = mergeChar(makeStarship(['#c9a43a', '#4fa8ff', '#6fdc5a', '#ff8a5a', '#c86aff', '#e8e4dc'][i])); s.scale.setScalar(1.6); fleet.add(s); allies.push({ s, o: VF[i], ph: i * 1.7 }); }
  const foes = []; for (let i = 0; i < 24; i++) { const big = i % 6 === 2; let r; try { r = mergeChar(big ? makeHulk('drome') : makeRaider()); } catch (_) { r = mergeChar(makeRaider()); } r.scale.setScalar(big ? 0.55 : 2.0); if (r.userData.beacon) r.userData.beacon.visible = false; fleet.add(r); foes.push({ r, x: (i % 6 - 2.5) * 24 + (Math.floor(i / 6) % 2) * 12, y: (Math.floor(i / 6) - 1.5) * 17, z: -150 - (i % 3) * 22 - (big ? 30 : 0), dead: 0 }); }
  const lasers = []; for (let i = 0; i < 36; i++) { const m = new THREE.Mesh(geo(new THREE.BoxGeometry(0.15, 0.15, 6)), glow(i % 2 ? '#ff2a3a' : '#5fd0ff')); m.visible = false; fleet.add(m); lasers.push({ m, life: 0, v: V() }); }
  return { W, own, galaxy, neb, star, fleet, hero, allies, foes, lasers };
}
// ---- sprites: smoke, embers, sparks, fireballs ----
function trlFx(scene) {
  const tex = { soft: trlGradTex([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]) };
  const smoke = trlSmokeTex(); const pool = []; for (let i = 0; i < 140; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.soft, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); pool.push({ s, life: 0, v: V(), max: 1, g: 0, add: false }); }
  const add = (p, col, n, spread, opt) => { opt = opt || {}; for (let i = 0; i < n; i++) { const q = pool.find(q => q.life <= 0); if (!q) return; q.s.visible = true; q.s.position.copy(p); q.s.material.color.set(col); q.s.material.blending = opt.add === false ? THREE.NormalBlending : THREE.AdditiveBlending; q.s.material.map = opt.add === false ? smoke : tex.soft; q.s.material.rotation = Math.random() * 6; q.s.material.opacity = opt.op || 1;
    q.v.set((Math.random() - 0.5) * spread, (opt.up || 0) + Math.random() * spread * 0.5, (Math.random() - 0.5) * spread); q.life = q.max = (opt.life || 1) * (0.6 + Math.random() * 0.6); q.size = opt.size || 0.4; q.grow = opt.grow || 0; q.op = opt.op || 1; q.g = opt.g || 0; } };
  const tick = (dt) => { for (const q of pool) { if (q.life <= 0) continue; q.life -= dt; if (q.life <= 0) { q.s.visible = false; continue; } q.v.y -= q.g * dt; q.s.position.addScaledVector(q.v, dt); const k = q.life / q.max; q.s.scale.setScalar(q.size * (1 + (1 - k) * q.grow)); q.s.material.opacity = q.op * Math.min(1, k * 2); } };
  return { add, tick, pool };
}
// ---- the camera director: every shot, keyed to the song's clock T ----
// the fireball at age k (0 = the blast, 1 = fully grown); fade 0..1 thins it out as the dust settles
function trlBoom(G, k, fade) { const e = 1 - Math.pow(1 - Math.min(1, k), 2.2);
  for (const m of G.shells) { const u = m.userData, R = (u.kind === 0 ? 4 + e * 10 : 5 + e * (u.kind === 2 ? 30 : 22)) * u.s;
    m.position.copy(u.d).multiplyScalar(e * (u.kind === 2 ? 22 : 14)); m.scale.setScalar(R); m.material.rotation = u.r + k * 0.4 * (u.kind === 2 ? -1 : 1);
    m.material.opacity = (u.kind === 0 ? Math.max(0, 1 - k * 1.4) : u.kind === 1 ? Math.max(0, 1 - k * 0.9) * 0.9 : Math.min(1, k * 3) * 0.92) * (1 - (fade || 0)); }
  G.wave.scale.setScalar(2 + e * 70); G.wave.material.opacity = Math.max(0, 0.9 - k * 1.2) * (1 - (fade || 0)); }
// a little hand-held drift on every shot so the camera breathes
function trlCam(C, px, py, pz, lx, ly, lz) { const t = performance.now() / 1000, h = TRL.still ? 0 : 0.035; C.position.set(px + Math.sin(t * 0.9) * h, py + Math.sin(t * 1.3 + 1) * h, pz); C.lookAt(lx + Math.sin(t * 0.7 + 2) * h * 3, ly + Math.sin(t * 1.1) * h * 2, lz); }
function trlShot(G, Sp, C, T, dt, fx, sfx) {
  const W = G.warrior, R = W.userData.rig, gy = G.gy;
  const wp = (x, z, ry) => { W.position.set(x, gy(x, z), z); if (ry != null) W.rotation.y = ry; };
  // ambient life: fires flicker, ash and embers drift, the armies sway, map glows
  const t = T; G.planes.forEach(p => { p.visible = T >= 35.6 && T < 37.6; }); G.foes.forEach((f, i) => { f.visible = T >= (i < 2 ? 43 : 58) && T < 88; }); if (G.foeGun) G.foeGun.visible = T >= 43 && T < 88;
  G.flames.forEach((f, i) => { f.scale.set(1, 0.85 + Math.sin(t * 9 + i) * 0.15, 1); }); G.fires.forEach((L, i) => { L.intensity = 1.2 + Math.sin(t * 13 + i * 2) * 0.4; });
  if (Math.random() < dt * 14) fx.add(V(C.position.x + (Math.random() - 0.5) * 16, C.position.y + 6, C.position.z - 4 - Math.random() * 10), '#9a948c', 1, 1, { add: false, op: 0.55, life: 3, size: 0.08, g: 0.4 });
  if (Math.random() < dt * 6) fx.add(V(C.position.x + (Math.random() - 0.5) * 8, C.position.y - 1.5, C.position.z - 3 - Math.random() * 6), '#ff8a3a', 1, 1.2, { up: 1.2, life: 2.4, size: 0.07 });
  if (Math.random() < dt * 3) { const L = G.fires[Math.floor(Math.random() * 3)]; fx.add(L.position.clone().add(V(0, 1.6, 0)), '#3a3430', 1, 0.8, { add: false, op: 0.5, up: 1.5, life: 5, size: 2.4, grow: 3 }); }
  G.flash.intensity = Math.max(0, G.flash.intensity - dt * 9);
  const blast = (p, big) => { G.flash.position.copy(p).add(V(0, 4, 0)); G.flash.intensity = big ? 9 : 4; fx.add(p, '#ffd8a0', big ? 14 : 8, big ? 10 : 5, { up: 3, life: 0.8, size: big ? 2.6 : 1.4, grow: 2 }); fx.add(p, '#4a403a', 6, 4, { add: false, op: 0.7, up: 2, life: 4, size: 2.5, grow: 3 }); sfx('boom'); };
  // scheduled moments (each fires once)
  G.cue = G.cue || {}; const at = (k, time, fn) => { if (T >= time && !G.cue[k]) { G.cue[k] = 1; fn(); } };
  // ---------- SCENE 1 ----------
  if (T < 22.5) {
    const k1 = trlE(trlK(T, 2.5, 13));
    wp(0, 0, Math.PI);
    let raise = trlE(trlK(T, 14, 17)); trlPose(W, { armR: -raise * 2.7, armRZ: raise * 0.15, armL: -0.1 });
    if (T < 13) trlCam(C, 0.6, 2.4 - k1 * 0.6, 13 - k1 * 9, 0, 1.3, -24);
    else { const a = trlE(trlK(T, 13, 21)) * 2.3; trlCam(C, Math.sin(a) * 4.6, 1.5 + a * 0.15, Math.cos(a) * 4.6, 0, 1.6, -1.5); }
    at('b1', 8.6, () => blast(V(-30, gy(-30, -75), -75), true));
    at('b1b', 17.5, () => blast(V(38, gy(38, -64), -64), false));
    G.ranks.forEach(([e, x, z, s]) => { e.position.z = z + s * -Math.min(4, Math.max(0, T - 13) * 0.3); });
  }
  // ---------- SCENE 2 ----------
  else if (T < 40) {
    G.drawMap(T); const g = G.general.position;
    G.holo.material.opacity = trlE(trlK(T, 23.5, 25)) * 0.9;
    trlPose(G.general, { armL: -1.2 - Math.sin(T * 0.8) * 0.3 * trlK(T, 26, 27), armLZ: Math.sin(T * 0.9) * 0.4 * trlK(T, 26, 27) });
    G.ranks.forEach(([e, x, z, s], i) => { const run = s > 0 ? Math.max(0, T - 30) * 2.2 : Math.max(0, T - 30) * 1.2; e.position.z = z - 4 * s - s * run; e.position.y = gy(e.position.x, e.position.z) + (s > 0 ? Math.abs(Math.sin(T * 9 + i)) * 0.15 : 0); if (s > 0) trlPose(e, trlRun(e, T * 9 + i, Math.min(1, Math.max(0, T - 30)))); });
    if (T < 32) { const a = 0.5 + trlE(trlK(T, 22.5, 32)) * 1.1; trlCam(C, g.x + Math.sin(a) * 3.4, g.y + 2.4, g.z + Math.cos(a) * 3.4, g.x - 2.2, g.y + 1.1, g.z - 4.5); }
    else if (T < 34) { G.chargers.forEach(([c, x, z, st], i) => { const zz = z - (T - 32) * 7 - 4; c.position.set(x, gy(x, zz), zz); c.rotation.y = Math.PI; trlPose(c, trlRun(c, T * 11 + i, 1)); }); trlCam(C, -2 + (T - 32) * 0.5, 0.7, 22 - (T - 32) * 9, 0, 1.2, 0); }
    else if (T < 35.6) { G.guns.forEach((tk, i) => at('art' + i, 34.1 + i * 0.45, () => { const m = tk.position.clone().add(V(Math.sin(tk.rotation.y) * 4, 2.2, Math.cos(tk.rotation.y) * 4)); fx.add(m, '#ffe0a0', 10, 3, { life: 0.35, size: 1.3, grow: 1 }); sfx('shot'); }));
      trlCam(C, -36, 3.2, 52, -40, 2, 36); }
    else if (T < 37.6) { const k = trlK(T, 35.6, 37.6); G.planes.forEach((p, i) => { p.position.set(-10 + i * 7, 14 + i * 2, 60 - k * 120 - i * 6); p.rotation.set(0.1, Math.PI, 0); }); trlCam(C, 0, 1.6, 6, 0, 18, -10); at('plane', 35.8, () => sfx('zap')); }
    else { wp(0, 0, Math.PI); trlPose(W, { armR: -1.0, armL: -0.2 }); trlCam(C, 1.4, 1.5, 1.6, 0, 1.1, -0.5);
      at('e1', 37.9, () => blast(V(-6, gy(-6, -9), -9), false)); at('e2', 38.6, () => blast(V(7, gy(7, -12), -12), false)); at('e3', 39.3, () => blast(V(-2, gy(-2, -18), -18), true)); }
  }
  // ---------- SCENE 3 ----------
  else if (T < 58) {
    const F = G.foes;
    if (T < 43) { wp(0, 0, Math.PI); const grip = trlE(trlK(T, 40.5, 42.5)); trlPose(W, { armR: -0.9 - grip * 0.25, armL: -0.1 }); const hp = V(); (R && R.armR ? R.armR : W).getWorldPosition(hp); trlCam(C, hp.x + 1.5, hp.y - 0.1, hp.z + 1.2, hp.x, hp.y - 0.5, hp.z); }
    else if (T < 46) { const k = trlK(T, 43, 46), z = -k * 9; wp(0, z, Math.PI); trlPose(W, Object.assign(trlRun(W, T * 12, 1), { armR: -1.3 })); W.position.y += Math.abs(Math.sin(T * 12)) * 0.1; trlCam(C, 2.2, 0.7, z + 3.2, 0, 1.2, z - 4);
      F[0].position.set(0.2, gy(0, -11.4), -11.4); F[0].rotation.y = 0; F[1].position.set(-2.4, gy(-2, -14), -14); F[1].rotation.y = 0.5; }
    else if (T < 51) { // slow motion: deflect, pivot, slash
      const k = trlK(T, 46, 51); wp(0, -9.4, Math.PI - (k > 0.35 ? trlE(trlK(k, 0.35, 0.6)) * 0.9 : 0)); const a = Math.sin(k * Math.PI * 2.2);
      trlPose(W, { armR: -2.2 + a * 1.4, armRZ: -0.6 * a, twist: -0.4 + k * 0.8 }); trlPose(F[0], { armR: -1.4 + Math.sin(k * 6) * 0.5, armL: -1.2 });
      at('spark1', 47.2, () => { fx.add(V(0.1, gy(0, -10.4) + 1.6, -10.4), '#fff0b0', 16, 4, { life: 0.5, size: 0.2 }); sfx('swing'); sfx('hit'); });
      at('spark2', 49.2, () => { fx.add(V(0.2, gy(0, -10.6) + 1.3, -10.6), '#9fe8ff', 18, 5, { life: 0.6, size: 0.22 }); sfx('swing'); sfx('kill'); });
      if (T > 49.4) { const f = trlE(trlK(T, 49.4, 50.8)); F[0].rotation.x = -f * 1.5; F[0].position.y = gy(0, -11.4) + f * 0.25; }
      const orb = -0.6 + k * 1.4; trlCam(C, Math.sin(orb) * 3.2, 1.0, -10.4 + Math.cos(orb) * 3.2, 0, 1.3, -10.6); }
    else if (T < 54) { // the gunner
      const k = trlK(T, 51, 54); F[1].position.set(-2.4, gy(-2.4, -14), -14); F[1].rotation.y = 0.5; trlPose(F[1], { armR: -1.5, armL: -1.4 });
      const z = -9.4 - trlE(trlK(k, 0, 0.45)) * 3.2, x = -trlE(trlK(k, 0, 0.45)) * 1.6; wp(x, z, Math.PI + 0.45); trlPose(W, { armR: -2.4 + trlE(trlK(k, 0.45, 0.7)) * 2.6, armRZ: 0.4, twist: 0.6 * trlK(k, 0.45, 0.7) });
      const gp = G.foeGun; if (k < 0.55) { F[1].getWorldPosition(gp.position); gp.position.add(V(0.4, 1.1, 0.5)); gp.rotation.set(0, 0.5, 0); } else { const fk = (k - 0.55) / 0.45; gp.position.set(-2 + fk * 4, gy(0, -14) + 1.1 + Math.sin(fk * Math.PI) * 2.5, -13.4 + fk * 1.5); gp.rotation.set(fk * 9, fk * 4, 0); }
      at('disarm', 52.7, () => { fx.add(V(-1.9, gy(-2, -13.6) + 1.2, -13.6), '#fff0b0', 14, 4, { life: 0.5, size: 0.2 }); sfx('swing'); sfx('hit'); });
      if (k < 0.3) at('aim', 51.1, () => sfx('shot'));
      trlCam(C, 3.6 - k * 1.2, 1.2, -9 - k * 2, -1.4, 1.3, -13); }
    else { // alone amid the chaos
      wp(-1.6, -12.6, Math.PI * 0.6); trlPose(W, { armR: -0.5, armL: -0.1 }); F[1].rotation.x = -1.4; F[1].position.y = gy(-2.4, -14) + 0.25;
      const k = trlK(T, 54, 58); trlCam(C, 6 - k * 1.5, 1.1, -6 - k * 1.2, -1.6, 1.4, -12.6);
      at('c1', 55.8, () => blast(V(-14, gy(-14, -30), -30), false)); at('c2', 57.2, () => blast(V(12, gy(12, -34), -34), false)); }
  }
  // ---------- SCENE 4 ----------
  else if (T < 88) {
    const F = G.foes;
    if (T < 70) { // the rush: strikes and explosions on the beat
      const k = trlK(T, 58, 70), z = -13 - k * 26, x = Math.sin(k * 5) * 4; wp(x, z, Math.PI + Math.cos(k * 5) * 0.5);
      const hits = [61, 63.5, 66.2], slow = T > 66 && T < 67.2;
      const near = hits.find(h => Math.abs(T - h) < 0.45); const sw = near ? Math.sin((T - near + 0.45) / 0.9 * Math.PI) : 0;
      trlPose(W, Object.assign(trlRun(W, T * 12, near ? 0.3 : 1), { armR: -2.3 + sw * 2.4, armRZ: sw * 0.7, twist: sw * 0.5 }));
      hits.forEach((h, i) => { const e = F[2 + i]; const hz = -13 - trlK(h, 58, 70) * 26 - 1.4, hx = Math.sin(trlK(h, 58, 70) * 5) * 4; e.position.set(hx, gy(hx, hz), hz); e.rotation.y = 0;
        if (T > h) { const f = trlE(trlK(T, h, h + 1.2)); e.rotation.x = -f * 1.5; e.position.y += f * 0.25; } else trlPose(e, { armR: -1.4, armL: -1.2 });
        at('hit' + i, h, () => { const sp = W.position.clone().add(V(0, 1.4, -0.8)); for (let j = 0; j < 6; j++) fx.add(sp.clone().add(V(Math.sin(j) * 0.6, Math.cos(j) * 0.4, 0)), j % 2 ? '#ff6a5a' : '#5fd0ff', 3, 1.2, { life: 0.7, size: 0.18 }); sfx('swing'); sfx('kill'); }); });
      [60, 62.5, 65, 67.6, 69].forEach((b, i) => at('rb' + i, b, () => blast(V(x + (i % 2 ? 9 : -9), gy(x, z - 6), z - 6 - i), i === 3)));
      // low sweeping camera that follows the blade
      const sa = T * 0.6; trlCam(C, x + Math.sin(sa) * 3.2, 0.6 + (slow ? 0.2 : 0), z + Math.cos(sa) * 3.2 + 1, x, 1.2, z - 1);
    } else if (T < 76) { // the standard falls
      const f = trlE(trlK(T, 71.2, 74.2)); G.banner.rotation.z = -f * 1.45; G.bearer.rotation.x = -trlE(trlK(T, 71, 72.4)) * 1.5; G.bearer.position.y = gy(-5.5, -20.3) + 0.2 * trlK(T, 71, 72.4);
      if (G.banner.userData.cloth) G.banner.userData.cloth.rotation.y = Math.sin(T * 3) * 0.3;
      at('mud', 74.2, () => fx.add(V(-9.2, gy(-9, -20) + 0.3, -20), '#2a2420', 12, 3, { add: false, op: 0.8, up: 2, life: 1.4, size: 0.4, g: 6 }));
      at('far', 74.6, () => { const e = G.chargers[3][0]; e.position.set(6, gy(6, -36), -36); e.rotation.y = Math.PI; });
      if (T > 74.6) { const e = G.chargers[3][0]; e.rotation.x = -trlE(trlK(T, 74.8, 76)) * 1.5; }
      const a = trlE(trlK(T, 70, 76)); trlCam(C, -3 - a * 2, 1.2 + a * 0.6, -16 - a * 1.5, -5 - f * 3.5, 1.5 + (1 - f) * 2, -20);
    } else if (T < 84) { // pull up: the whole terrible painting
      const k = trlE(trlK(T, 76, 84)); trlCam(C, -6 + k * 6, 2 + k * 62, -14 + k * 54, 0, 0, -28);
      G.ranks.forEach(([e, x, z, s]) => { e.position.z += s * -dt * 1.4; e.position.y = gy(e.position.x, e.position.z); });
      at('w1', 78, () => blast(V(-20, 0, -40), false)); at('w2', 80.5, () => blast(V(18, 0, -22), false)); at('w3', 82.4, () => blast(V(-4, 0, -52), false));
    } else { // "And…" the great blast, slow, and the sound drops away
      at('bigboom', 84.05, () => { G.boom.visible = true; G.debris.forEach(d => { d.m.visible = true; d.m.position.copy(G.boom.position); }); G.flash.position.set(0, 8, -38); G.flash.intensity = 14; TRL.hush = true; if (MUS.cur) musFade(MUS.cur, musVol() * 0.12, 0.5); sfx('boom'); setTimeout(() => sfx('boom'), 140); });
      const k = trlK(T, 84, 88); trlBoom(G, k * 0.75, 0);
      G.debris.forEach(d => { d.m.position.addScaledVector(d.v, dt * 0.35); d.v.y -= 9 * dt * 0.35; d.m.rotation.x += dt * 2; d.m.rotation.y += dt * 1.4; });
      G.flash.intensity = Math.max(G.flash.intensity, 6 * (1 - k));
      trlCam(C, 0, 6 + k * 3, 30 - k * 16, 0, 7, -60);
    }
  }
  // ---------- SCENE 5 ----------
  else if (T < 104.5) {
    at('settle', 88, () => { G.statue.visible = true; TRL.hush = false; if (MUS.cur) musFade(MUS.cur, musVol(), 2.5); G.debris.forEach(d => { d.m.visible = false; }); });
    const k = trlK(T, 88, 93); G.boom.visible = k < 1; trlBoom(G, 0.75 + k * 0.25, k);
    G.heartL.intensity = 2 + Math.sin(T * 2.2) * 1.2; G.heart.scale.setScalar(1 + Math.sin(T * 2.2) * 0.12);
    G.falling.forEach((f, i) => { f.t -= dt; if (f.t <= 0) { f.t = 2.5 + Math.random() * 3; f.m.visible = true; f.m.position.set(G.statue.position.x + (i % 2 ? 4.4 : -4.4) + Math.random(), G.statue.position.y + 19, G.statue.position.z + Math.random() * 2); f.v = 0; } f.v = (f.v || 0) + 9.8 * dt; f.m.position.y -= f.v * dt; if (f.m.position.y < gy(0, -60)) f.m.visible = false; });
    const a = -0.6 + trlE(trlK(T, 88, 104.5)) * 2.4, r = 52 - trlK(T, 88, 104.5) * 14, sp = G.statue.position;
    trlCam(C, sp.x + Math.sin(a) * r, 8 + trlK(T, 88, 104.5) * 14, sp.z + Math.cos(a) * r, sp.x, 15, sp.z);
  }
  // ---------- SCENE 6: rise to the head, into the light ----------
  else if (T < 109.5) {
    const k = trlE(trlK(T, 104.5, 109.5)), sp = G.statue.position; G.heartL.intensity = 3 + k * 20;
    trlCam(C, sp.x + Math.sin(1.8) * (38 - k * 30), 22 + k * 10, sp.z + Math.cos(1.8) * (38 - k * 30), sp.x, 23.5, sp.z);
  }
}
function trlSpace(Sp, C, T, dt, fx, sfx) {
  const fp = Sp.fleet.position, H = Sp.hero;
  Sp.galaxy.rotation.y += dt * 0.02;
  if (T < 114) { // pull back from a star to the whole galaxy
    const k = trlK(T, 109.5, 114), e = 1 - Math.pow(1 - k, 3); Sp.star.position.set(0, 0, 0); const d = 6 + e * 1100; trlCam(C, d * 0.35, d * 0.55, d, 0, 0, 0); Sp.fleet.visible = false; return; }
  Sp.fleet.visible = true;
  // allies circle; foes hold their wall then dive in
  const loose = T > 121 ? Math.min(1, (T - 121) / 2) : 0; Sp.allies.forEach(A => { const [ox, oy, oz] = A.o, w = Math.sin(T * 0.9 + A.ph); A.s.position.set(H.position.x + ox * (1 + loose * 0.6) + w * (1.5 + loose * 6), H.position.y + oy + Math.cos(T * 0.7 + A.ph) * (1 + loose * 4), H.position.z + oz); A.s.rotation.set(0, 0, -w * (0.25 + loose * 0.5)); });
  Sp.foes.forEach((F, i) => { if (F.dead > 0) { F.dead += dt; F.r.rotation.x += dt * 3; F.r.position.y -= dt * 4; F.r.visible = F.dead < 2; return; } const adv = T > 120 ? (T - 120) * 4 : 0; F.r.position.set(F.x + Math.sin(T * 0.7 + i) * 2, F.y + Math.cos(T * 0.5 + i) * 1.5, F.z + adv); F.r.rotation.set(0, 0, Math.sin(T + i) * 0.2); });
  // lasers
  for (const L of Sp.lasers) { if (L.life <= 0) continue; L.life -= dt; L.m.position.addScaledVector(L.v, dt); if (L.life <= 0) L.m.visible = false; }
  const shoot = (from, to) => { const L = Sp.lasers.find(l => l.life <= 0); if (!L) return; L.m.visible = true; L.m.position.copy(from); L.v.copy(to).sub(from).normalize().multiplyScalar(140); L.m.lookAt(to); L.life = from.distanceTo(to) / 140; };
  if (T > 120.5 && T < 130 && Math.random() < dt * 22) { const live = Sp.foes.filter(f => !f.dead); const F = live[Math.floor(Math.random() * live.length)]; if (F) { const A = Sp.allies[Math.floor(Math.random() * Sp.allies.length)]; if (Math.random() < 0.5) shoot(A.s.position.clone(), F.r.position.clone()); else shoot(F.r.position.clone(), A.s.position.clone()); if (Math.random() < 0.18 && T < 127) { F.dead = 0.01; fx.add(F.r.position.clone().add(fp), '#ffb070', 10, 6, { life: 0.9, size: 3, grow: 2 }); sfx('boom'); } } }
  if (T < 118) { // the Setting Sun slides out of the dark, the camera along its hull
    const k = trlK(T, 114, 118); H.position.set(0, 0, 60 - k * 30); H.rotation.set(0, 0, Math.sin(T * 0.5) * 0.05); const hp = H.position.clone().add(fp);
    trlCam(C, hp.x + 7 - k * 3, hp.y + 2.5, hp.z + 16 - k * 22, hp.x, hp.y, hp.z - 4);
  } else if (T < 121) { const k = trlK(T, 118, 121); H.position.set(0, 0, 30 - k * 20); const hp = H.position.clone().add(fp); trlCam(C, hp.x - 22 + k * 10, hp.y + 9, hp.z + 18, hp.x, hp.y, hp.z - 90); }
  else if (T < 127) { // the battle
    const k = trlK(T, 121, 127); H.position.set(Math.sin(T) * 6, Math.cos(T * 0.7) * 3, 10 - k * 60); H.rotation.z = Math.sin(T * 1.3) * 0.5; const hp = H.position.clone().add(fp);
    const a = T * 0.5; trlCam(C, hp.x + Math.sin(a) * 26, hp.y + 6, hp.z + Math.cos(a) * 26, hp.x, hp.y, hp.z - 30);
    if (Math.random() < dt * 4) shoot(H.position.clone(), Sp.foes[Math.floor(Math.random() * Sp.foes.length)].r.position.clone());
  } else { // a lone ship, straight at the wall of drones
    const k = trlK(T, 127, 130.3); H.position.set(0, 0, -50 - k * 90); H.rotation.set(0, 0, 0); Sp.allies.forEach(A => { A.s.visible = false; }); const hp = H.position.clone().add(fp);
    trlCam(C, hp.x + 1.5, hp.y + 3.2, hp.z + 14, hp.x, hp.y, hp.z - 60);
    if (Math.random() < dt * 30) { const F = Sp.foes[Math.floor(Math.random() * Sp.foes.length)]; shoot(F.r.position.clone(), H.position.clone()); }
  }
}
// ---- the player ----
function playTrailer(opts) {
  opts = opts || {}; if (TRL.on || CUT.on) return; TRL.on = true; CUT.on = true; TRL.hush = false;
  const prevState = state === 'cut' ? 'play' : state; setState('cut'); $('hud').hidden = true; $('touch').hidden = true; vm.visible = false; if (document.pointerLockElement) document.exitPointerLock();
  const ov = document.createElement('div'); ov.id = 'trailerOv'; ov.style.cssText = 'position:fixed;inset:0;z-index:40;pointer-events:none;font-family:var(--hud)';
  ov.innerHTML = `<div class="tb" style="position:absolute;left:0;right:0;top:0;height:10vh;background:#000"></div><div class="tb" style="position:absolute;left:0;right:0;bottom:0;height:10vh;background:#000"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.62) 100%)"></div>
    <div id="trlGrain" style="position:absolute;inset:-50%;opacity:.07;mix-blend-mode:overlay;background-size:160px 160px"></div>
    <div id="trlFade" style="position:absolute;inset:0;background:#000;opacity:1"></div><div id="trlWhite" style="position:absolute;inset:0;background:#fff;opacity:0"></div>
    <div id="trlCap" style="position:absolute;left:8%;right:8%;bottom:13vh;text-align:center;color:#e8e2d6;font:italic 500 clamp(16px,2.6vw,28px) Georgia,'Times New Roman',serif;letter-spacing:.04em;text-shadow:0 2px 12px #000;opacity:0;transition:opacity 1.2s"></div>
    <div id="trlTitle" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8d6b0;opacity:0;transition:opacity 2s"><div style="width:clamp(70px,12vw,130px);height:clamp(35px,6vw,65px);border-radius:999px 999px 0 0;background:radial-gradient(circle at 50% 100%,#fff2c8 0,#ffb347 35%,#d8452a 75%,rgba(216,69,42,0) 100%);border-bottom:2px solid #c9a43a;margin-bottom:18px;box-shadow:0 -6px 40px rgba(255,140,60,.35)"></div><div style="font:700 clamp(30px,7vw,74px) Georgia,serif;letter-spacing:.3em">THE ART OF WAR</div><div style="font:600 clamp(12px,1.8vw,18px) var(--hud);letter-spacing:.6em;margin-top:10px;color:#c9a43a">SETTING SUN</div></div>`;
  const skip = document.createElement('button'); skip.className = 'pbtn'; skip.id = 'trlSkip'; skip.textContent = 'Skip ▸'; skip.style.cssText = 'position:fixed;right:16px;bottom:calc(10vh + 14px);z-index:41;pointer-events:auto;opacity:0;transition:opacity .6s;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.4);color:#fff'; skip.hidden = true;
  document.body.append(ov, skip);
  { const gc = document.createElement('canvas'); gc.width = gc.height = 160; const gx = gc.getContext('2d'), id = gx.createImageData(160, 160); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gx.putImageData(id, 0, 0); ov.querySelector('#trlGrain').style.backgroundImage = `url(${gc.toDataURL()})`; }
  const grain = ov.querySelector('#trlGrain'), cv = renderer.domElement, cvFilter = cv.style.filter; cv.style.filter = 'contrast(1.12) saturate(1.12) brightness(1.04)';
  const fade = ov.querySelector('#trlFade'), white = ov.querySelector('#trlWhite'), cap = ov.querySelector('#trlCap'), title = ov.querySelector('#trlTitle');
  let G, Sp; try { G = trlBuildGround(); Sp = trlBuildSpace(); } catch (err) { console.warn('trailer', err); TRL.on = false; CUT.on = false; ov.remove(); skip.remove(); setState(prevState); if (opts.onEnd) opts.onEnd(); return; }
  const C = new THREE.PerspectiveCamera(48, camera.aspect, 0.1, 4000); const fxG = trlFx(G.W), fxS = trlFx(Sp.W);
  const sfx = k => { try { if (k === 'boom') SFX.boom(); else if (k === 'shot') SFX.shot(GUNS.l28 ? 'l28' : undefined); else if (k === 'swing') SFX.swing(); else if (k === 'hit') SFX.hit(); else if (k === 'kill') SFX.kill(); else if (k === 'zap') SFX.zap(); } catch (_) {} };
  TRL.scene = G.W; TRL.cam = C;
  musForce('trailer'); const said = new Set(); TRL_VO.forEach(v => trlClip(v[2]));
  let clock = 0, last = performance.now(), done = false, capT = null;
  const finish = () => { if (done) return; done = true; TRL.on = false; TRL.scene = null; try { speechSynthesis.cancel(); } catch (_) {} for (const k in TRL_CLIPS) { try { TRL_CLIPS[k].pause(); } catch (_) {} }
    musRelease('trailer'); cv.style.filter = cvFilter; ov.remove(); skip.remove(); [G, Sp].forEach(X => X.own.forEach(g => { try { g.dispose(); } catch (_) {} }));
    CUT.on = false; setState(prevState); $('hud').hidden = false; $('touch').hidden = !(TOUCH && state === 'play'); vm.visible = true;
    S.flags = S.flags || {}; S.flags.trailer = 1; PREFS.trailerSeen = 1; try { savePrefs(); } catch (_) {} markDirty(); if (opts.onEnd) opts.onEnd(); };
  skip.addEventListener('click', finish);
  const tick = () => { if (done) return; requestAnimationFrame(tick);
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    // follow the song when it's playing, so the cuts land on the music
    const m = MUS.cur, onSong = m && MUS.list === 'trailer' && !m.paused && m.currentTime > 0.2 && m.currentTime > clock - 1; if (m && MUS.list === 'trailer') m.loop = false; clock = onSong ? m.currentTime : clock + dt; if (TRL.seek != null) { clock = TRL.seek; TRL.seek = null; if (onSong) m.currentTime = clock; } const T = clock;
    if (T > 4 && skip.hidden) { skip.hidden = false; requestAnimationFrame(() => { skip.style.opacity = 1; }); }
    C.aspect = camera.aspect; C.updateProjectionMatrix(); grain.style.transform = `translate(${(Math.random() * 40) | 0}px,${(Math.random() * 40) | 0}px)`;
    // fades: from black at the start, a dip between scenes 1 and 2, white into space, black at the end
    let f = T < 2.5 ? 1 : T < 6 ? 1 - (T - 2.5) / 3.5 : 0; if (T > 20.5 && T < 22.5) f = Math.sin((T - 20.5) / 2 * Math.PI) * 0.92; if (T > 130.3) f = 1; fade.style.opacity = f;
    let w = 0; if (T > 107.5 && T < 109.5) w = (T - 107.5) / 2; else if (T >= 109.5 && T < 111.5) w = 1 - (T - 109.5) / 2; else if (T > 129.9 && T < 130.4) w = 1; white.style.opacity = w;
    title.style.opacity = T > 130.8 ? 1 : 0;
    for (const [at, line] of TRL_VO) if (T >= at && !said.has(at)) { said.add(at); cap.style.opacity = 0; clearTimeout(capT); capT = setTimeout(() => { cap.textContent = line; cap.style.opacity = 1; }, 250); trlNarrate(TRL_VO.find(v => v[0] === at)[2], line); setTimeout(() => { if (cap.textContent === line) cap.style.opacity = 0; }, 5600); }
    try { if (T < 109.5) { TRL.scene = G.W; trlShot(G, Sp, C, T, dt, fxG, sfx); fxG.tick(dt); } else { TRL.scene = Sp.W; trlSpace(Sp, C, T, dt, fxS, sfx); fxS.tick(dt); } } catch (err) { console.warn('trailer shot', err); }
    if (T > TRL_END || (onSong && m.ended)) finish();
  };
  tick();
}
// draw the trailer's world instead of the game's while it plays
{ const _rr = renderer.render.bind(renderer); renderer.render = function (sc, cam) { if (TRL.on && TRL.scene && sc === scene) { if (cam === camera && camera.layers.mask === 2) return; return _rr(TRL.scene, TRL.cam); } return _rr(sc, cam); }; }
// first start of every character (and anyone who has never seen it): the trailer, then the usual opening.
// Back on in 2.14 after the polish pass. Settings → Story scenes → Skip skips it like the other intros.
const TRL_AUTO = true;
if (TRL_AUTO) $('playBtn').addEventListener('click', () => {
  setTimeout(function chk(n) { if (state === 'menu' && (n || 0) < 40) return setTimeout(() => chk((n || 0) + 1), 250);
    if (state !== 'play' || TRL.on || (S.flags && S.flags.trailer) || new URLSearchParams(location.search).get('cutscene')) return;
    if (CUT.on) return; // something else already playing
    if (typeof autoSkipCut === 'function') setTimeout(autoSkipCut, 50);
    playTrailer({ onEnd: () => { if (LEVEL.id === 'ship' && state === 'play' && !(S.flags && (S.flags.prologue1 || S.flags.shipIntro)) && typeof shipIntro === 'function') setTimeout(() => shipIntro(), 400); } });
  }, 300);
});
// the opening intro waits for the trailer
{ const _si = shipIntro; shipIntro = function () { if (TRL.on || (TRL_AUTO && !(S.flags && S.flags.trailer) && state === 'cut')) return; return _si.apply(this, arguments); }; }
if (TRL_AUTO) SCENES.unshift(['trailer', '⚔️ The Art of War (opening)', () => true, () => playTrailer()]);
