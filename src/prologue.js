// =================== PROLOGUE: the first-time-aboard film, now a tour of the galaxy with narration ===================
// Lines are subtitles until Phil's recordings arrive; each recording is voice/<id>.mp3 and listed in VOICE_READY.
const VOICE_READY = [];
const PROLOGUE = [
  { id: 'p1', shot: 'galaxy', text: 'Long before you were born, the galaxy was a quiet place. A dozen worlds, turning in the light of one old sun.' },
  { id: 'p2', shot: 'earth', text: 'Earth was the heart of it. Humans and aliens, traders and troopers, all living under the same sky.' },
  { id: 'p3', shot: 'worlds', text: 'Out past the Moon, the worlds grew strange. The bug hives of Mezar. The frozen forests of Capitone. The endless streets of Robot City.' },
  { id: 'p4', shot: 'zeltac', text: 'And between them all sailed the Zeltac, a city that flies, carrying anyone brave enough to leave home.' },
  { id: 'p5', shot: 'fleet', text: 'Then the sun began to set. A warlord named Drome rose out of nowhere, with an army of machines and a promise.' },
  { id: 'p6', shot: 'burn', text: '"Every world," he said, "will burn red." And one by one, the lights began to go out.' },
  { id: 'p7', shot: 'eye', text: 'The Masters went quiet. The Safe Zones hid behind their walls. And far past the edge of the map, something in the dark opened its eye.' },
  { id: 'p8', shot: 'launch', text: "But Earth still had one thing Drome didn't count on. A battered old transport, held together with hope and duct tape..." },
  { id: 'p9', shot: 'flyby', text: '...and a trooper crazy enough to fly it.' },
  { id: 'p10', shot: 'shoulder', text: 'This is your ship now, Captain. Her name is the Setting Sun.' },
  { id: 'p11', shot: 'window', text: "Let's see if we can give her a better one." },
];
const lineSecs = L => Math.max(4.5, L.text.split(/\s+/).length / 2.5 + 1.6);
// the diorama: a model galaxy built far from the ship's interior for the film
function buildDiorama() {
  const g = new THREE.Group(), C0 = V(0, 0, -900); g.position.copy(C0);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffb347', fog: false })); g.add(sun); const halo = glowSprite('rgba(255,160,60,.9)', 260); g.add(halo);
  const P = {}, ring = [['earth', 140, 0.2, 16], ['moon', 165, 0.35, 5], ['mezar', 210, 1.4, 14], ['capitone', 270, 2.4, 13], ['robot', 330, 3.3, 15], ['ocean', 380, 4.1, 14], ['zarlich', 450, 5.0, 13], ['vector', 520, 5.8, 15]];
  for (const [id, r, a, s] of ring) { const m = new THREE.Mesh(new THREE.SphereGeometry(s, 24, 16), new THREE.MeshBasicMaterial({ map: planetTex(id), fog: false })); m.position.set(Math.cos(a) * r, Math.sin(a * 3) * 18, Math.sin(a) * r); g.add(m); P[id] = m;
    if (id === 'mezar') { const rg = new THREE.Mesh(new THREE.RingGeometry(s * 1.4, s * 2.2, 40), new THREE.MeshBasicMaterial({ color: '#f2d6a8', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, fog: false })); rg.rotation.set(-1.2, 0.3, 0); m.add(rg); }
    const orbit = new THREE.Mesh(new THREE.RingGeometry(r - 0.4, r + 0.4, 96), new THREE.MeshBasicMaterial({ color: '#8fe3ff', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, fog: false })); orbit.rotation.x = -Math.PI / 2; g.add(orbit); }
  const zel = makeZeltac(); zel.scale.setScalar(0.5); zel.position.copy(P.mezar.position).add(V(-40, 6, 30)); g.add(zel); P.zeltac = zel;
  const fleet = []; for (let i = 0; i < 9; i++) { const h = makeHulk(i === 4 ? 'flagship' : 'drome'); h.scale.setScalar(i === 4 ? 0.5 : 0.35); h.position.set(-120 + (i % 3) * 25, 30 + Math.floor(i / 3) * 10, 200 + Math.floor(i / 3) * 22 + (i % 2) * 8); h.rotation.y = Math.PI * 0.85; if (h.userData.beacon) h.userData.beacon.visible = false; g.add(h); fleet.push(h); } P.fleet = fleet;
  const eye = new THREE.Group(); const white = new THREE.Mesh(new THREE.SphereGeometry(10, 20, 14), new THREE.MeshBasicMaterial({ color: '#ff2a3a', fog: false })); white.scale.set(1.6, 0.05, 0.4); eye.add(white); const pupil = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshBasicMaterial({ color: '#000000', fog: false })); pupil.position.z = 3; pupil.scale.set(1, 0.05, 0.5); eye.add(pupil); eye.add(glowSprite('rgba(255,40,60,.6)', 50)); eye.position.copy(P.vector.position).add(V(0, 0, 0)); g.add(eye); P.eye = eye; P.eyeW = white; P.eyeP = pupil;
  const myShip = makeStarship(S.col); myShip.scale.setScalar(1.2); g.add(myShip); P.ship = myShip;
  // the sky around the model galaxy: a full sphere of stars, a faint Milky Way band and a few soft nebulae, so every shot has stars behind it
  { const n = 4200, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new THREE.Color();
    for (let i = 0; i < n; i++) { let u = Math.random() * 2 - 1, a = Math.random() * 6.28; if (i % 3 === 0) u = (Math.random() - 0.5) * 0.18; const r = 1700, q = Math.sqrt(1 - u * u); p.set([Math.cos(a) * q * r, u * r, Math.sin(a) * q * r], i * 3);
      col.setHSL(0.08 + Math.random() * 0.6, 0.35, 0.55 + Math.random() * 0.45); c.set([col.r, col.g, col.b], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3)); sg.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const st = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false })); st.rotation.set(0.35, 0, 0.2); g.add(st); P.stars = st;
    const nt = typeof trlSmokeTex === 'function' ? trlSmokeTex() : null;
    if (nt) [['#5a2a8a', 1, 0.2], ['#1a4a8a', 2.3, -0.15], ['#8a3a2a', 3.8, 0.1], ['#2a6a7a', 5.1, 0.25]].forEach(([cl, a, y]) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nt, color: cl, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.position.set(Math.cos(a) * 1500, y * 1500, Math.sin(a) * 1500); s.scale.setScalar(1800); g.add(s); }); }
  levelGroup.add(g); return { g, C0, P, sun };
}
// world position helper
const wpos = (obj) => obj.getWorldPosition(V(0, 0, 0));
function prologueShot(D, name, t, k) { // t = seconds into the line, k = 0..1 progress
  const C = D.C0, P = D.P, look = (o, off) => { const p = wpos(o); camera.lookAt(p.x + (off ? off.x : 0), p.y + (off ? off.y : 0), p.z + (off ? off.z : 0)); };
  P.ship.visible = ['launch', 'flyby'].includes(name);
  if (name === 'galaxy') { const a = -0.6 + k * 0.5, r = 760 - k * 180; camera.position.set(C.x + Math.cos(a) * r, C.y + 260 - k * 110, C.z + Math.sin(a) * r); camera.lookAt(C.x, C.y, C.z); }
  if (name === 'earth') { const e = wpos(P.earth); camera.position.set(e.x + 44 - k * 10, e.y + 8 + k * 4, e.z + 30 - k * 8); look(P.earth); P.earth.rotation.y = t * 0.08; }
  if (name === 'worlds') { const part = k < 0.34 ? 'mezar' : k < 0.67 ? 'capitone' : 'robot', lk = (k % 0.334) / 0.334, w = wpos(P[part]); camera.position.set(w.x + 40 - lk * 12, w.y + 10, w.z + 34 - lk * 6); look(P[part]); P[part].rotation.y = t * 0.1; }
  if (name === 'zeltac') { const z = wpos(P.zeltac); const a = 0.4 + k * 0.9; camera.position.set(z.x + Math.cos(a) * 46, z.y + 14, z.z + Math.sin(a) * 46); look(P.zeltac); }
  if (name === 'fleet') { P.fleet.forEach((h, i) => { h.position.x = -120 + (i % 3) * 25 + t * 6; }); const f = wpos(P.fleet[4]); camera.position.set(f.x - 30 + k * 10, f.y + 4, f.z + 50); look(P.fleet[4]); }
  if (name === 'burn') { P.fleet.forEach((h, i) => { h.position.x = -60 + (i % 3) * 25 + t * 6; }); const e = wpos(P.earth); camera.position.set(e.x + 70, e.y + 22, e.z + 90 - k * 20); camera.lookAt(e.x, e.y, e.z); }
  if (name === 'eye') { const v = wpos(P.vector); camera.position.set(v.x + 70 - k * 30, v.y + 6, v.z + 50 - k * 20); camera.lookAt(v.x, v.y, v.z); const open = Math.min(1, Math.max(0, (k - 0.45) / 0.4)); P.eyeW.scale.y = 0.05 + open * 0.7; P.eyeP.scale.y = 0.05 + open * 0.95; P.eye.position.copy(P.vector.position).add(V(0, 0, 22)); P.eye.lookAt(camera.position); }
  if (name === 'launch') { const e = wpos(P.earth); P.ship.position.copy(P.earth.position).add(V(18 + k * 30, 2 + k * 14, 10 + k * 20)); P.ship.rotation.set(0, -0.8, 0); camera.position.set(e.x + 60, e.y + 10, e.z + 55); look(P.ship); }
  if (name === 'flyby') { P.ship.position.copy(P.earth.position).add(V(60 + t * 3, 18, 40)); const s = wpos(P.ship); camera.position.set(s.x - 14 + k * 26, s.y + 3, s.z + 8); look(P.ship); }
  if (name === 'shoulder') { camera.position.set(2.6 - t * 0.05, 1.9, -9.5 - t * 0.05); camera.lookAt(0.2, 1.4, -15); }
  if (name === 'window') { camera.position.set(0, 1.65, -12.8); camera.lookAt(-6 + t * 0.6, -6 + Math.sin(t * 0.2) * 2, -95); }
}
// tint overlay for the dark chapters of the story
function prologueTint(ov, name) { const red = ['fleet', 'burn'].includes(name) ? 0.28 : name === 'eye' ? 0.4 : 0; ov.querySelector('#cuttint').style.opacity = red; }
shipIntro = function (replay) {
  if (CUT.on) return; CUT.on = true; S.flags = S.flags || {};
  const prevState = state === 'cut' ? 'play' : state; setState('cut'); $('hud').hidden = true; $('touch').hidden = true; vm.visible = false; const far0 = camera.far; camera.far = 3000; camera.updateProjectionMatrix();
  const ov = document.createElement('div'); ov.id = 'cutov'; ov.style.cssText = 'position:fixed;inset:0;z-index:40;pointer-events:none';
  ov.innerHTML = '<div id="cuttint" style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(255,40,30,.2), rgba(120,0,0,.9));opacity:0;transition:opacity 1.6s"></div><div style="position:absolute;left:0;right:0;top:0;height:11vh;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:11vh;background:#000"></div><div id="cutcap" style="position:absolute;left:6%;right:6%;bottom:13vh;text-align:center;color:#fff;font:600 clamp(15px,3.6vw,24px) var(--hud,sans-serif);letter-spacing:.03em;line-height:1.35;text-shadow:0 2px 8px #000,0 0 2px #000;opacity:0;transition:opacity .6s"></div><div id="cuttitle" style="position:absolute;left:0;right:0;top:40%;text-align:center;color:#ffe08a;font:700 clamp(30px,8vw,64px) var(--hud,sans-serif);letter-spacing:.2em;text-shadow:0 4px 16px #000;opacity:0;transition:opacity 1.5s">PROLOGUE</div>';
  const skip = document.createElement('button'); skip.className = 'pbtn'; skip.textContent = 'Skip ▸'; skip.style.cssText = 'position:fixed;right:16px;bottom:calc(11vh + 14px);z-index:41;pointer-events:auto;opacity:0;transition:opacity .6s;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.5);color:#fff'; skip.hidden = true;
  document.body.append(ov, skip);
  const D = buildDiorama(), me = buildChar(() => makePlayerChar(myLook(), S.col), 'trooper'); me.position.set(0.4, 0, -12.6); me.rotation.y = Math.PI; levelGroup.add(me);
  musForce('cutscene');
  const voice = new Audio(); voice.preload = 'auto';
  let li = -1, lineT0 = performance.now(), lineDur = 6, done = false; const t0 = performance.now(), MIN_LOCK = 12, cap = ov.querySelector('#cutcap'), title = ov.querySelector('#cuttitle');
  const startLine = i => { li = i; const L = PROLOGUE[i]; lineT0 = performance.now(); lineDur = lineSecs(L); cap.style.opacity = 0; setTimeout(() => { if (!done) { cap.textContent = L.text; cap.style.opacity = 1; } }, 250); prologueTint(ov, L.shot);
    if (VOICE_READY.includes(L.id)) { voice.src = `voice/${L.id}.mp3`; voice.volume = 1; voice.play().then(() => { if (isFinite(voice.duration)) lineDur = voice.duration + 0.8; }).catch(() => {}); if (MUS.cur) musFade(MUS.cur, musVol() * 0.35, 0.6); } };
  const end = () => { if (done) return; done = true; window.__cutscene_done = true; const cd = document.createElement('div'); cd.id = 'cutscene_done'; document.body.appendChild(cd); voice.pause(); musRelease('cutscene'); levelGroup.remove(D.g); levelGroup.remove(me); ov.remove(); skip.remove(); if (!replay) { S.flags.prologue1 = 1; S.flags.shipIntro = 1; markDirty(); } camera.far = far0; camera.updateProjectionMatrix(); CUT.on = false; setState(prevState); player.pos.set(0, 0, -4); player.yaw = 0; vm.visible = true; if (!replay) toast('THE SETTING SUN', 'Welcome aboard, Captain', 3); };
  skip.addEventListener('click', end);
  setTimeout(() => { title.style.opacity = 1; setTimeout(() => { title.style.opacity = 0; }, 2600); }, 400);
  const lead = 4;
  const tick = () => { if (done) return; const el = (performance.now() - t0) / 1000;
    if (el > MIN_LOCK && skip.hidden) { skip.hidden = false; requestAnimationFrame(() => { skip.style.opacity = 1; }); }
    if (el < lead) { prologueShot(D, 'galaxy', el, el / (lead + lineSecs(PROLOGUE[0])) ); }
    else { if (li < 0) startLine(0); const lt = (performance.now() - lineT0) / 1000; if (lt > lineDur && !(VOICE_READY.includes(PROLOGUE[li].id) && !voice.paused && !voice.ended)) { if (li + 1 < PROLOGUE.length) startLine(li + 1); else if (lt > lineDur + 2) return end(); }
      const L = PROLOGUE[li], k = Math.min(1, ((performance.now() - lineT0) / 1000) / lineDur); prologueShot(D, L.shot, (performance.now() - lineT0) / 1000 + (li === 0 ? lead : 0), li === 0 ? Math.min(1, (el) / (lead + lineDur)) : k); }
    requestAnimationFrame(tick); };
  tick();
};
// keep the film's long view: no fog while it plays
{ const _ue = updateEnv; updateEnv = function (...a) { const r = _ue.apply(this, a); if (CUT.on && scene.fog) { scene.fog.near = 4000; scene.fog.far = 9000; } return r; }; }
