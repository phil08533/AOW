// =================== THE STARLIGHT LOUNGE IS A PARTY NOW ===================
{ const _bb = buildBar; buildBar = function (T, W, D, H, rnd) {
  _bb(T, W, D, H, rnd);
  // light-up dance floor
  const cols = ['#ff3b8a', '#3bd2ff', '#ffd23a', '#8a3bff', '#3bff8a'], mats = cols.map(c => new THREE.MeshBasicMaterial({ color: c })), tiles = [];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 7; j++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.06, 1.45), mats[(i + j) % 5]); m.position.set(-5.25 + i * 1.5, 0.03, 1.5 + j * 1.5); levelGroup.add(m); tiles.push([m, i, j]); }
  levelAnims.push(t => { const beat = Math.floor(t * 2.1); for (const [m, i, j] of tiles) m.material = mats[(i * 3 + j * 7 + beat) % 5]; });
  // DJ booth on the stage
  part(props, B(4.2, 1.2, 1.2), '#1e1c22', 0, 1.1, 21.2); part(props, B(4.2, 0.08, 1.2), glow('#ff3b8a'), 0, 1.72, 21.2); for (const s of [-1, 1]) { part(props, Cy(0.35, 0.35, 0.06, 16), '#2b2a2c', s * 1.1, 1.78, 21.2); part(props, B(1.1, 2.6, 1.1), '#1e1c22', s * 3.2, 1.8, 21.6); for (let k = 0; k < 3; k++) part(props, Cy(0.32 - k * 0.06, 0.32 - k * 0.06, 0.05, 14), '#3a3d44', s * 3.2, 1 + k * 0.8, 21.04, Math.PI / 2); }
  // lasers and strobes
  const lasers = []; for (let k = 0; k < 6; k++) { const L = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 30, 4, 1, true), new THREE.MeshBasicMaterial({ color: cols[k % 5], transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); L.position.set(k % 2 ? 6 : -6, H - 0.4, 20); levelGroup.add(L); lasers.push(L); }
  levelAnims.push(t => lasers.forEach((L, k) => { L.rotation.set(1.2 + Math.sin(t * 0.9 + k) * 0.35, 0, (k % 2 ? 1 : -1) * (0.6 + Math.sin(t * 1.3 + k * 2) * 0.5)); L.visible = Math.sin(t * 3 + k) > -0.4; }));
  const strobe = new THREE.PointLight(0xffffff, 0, 30, 1.5); strobe.position.set(0, H - 1, 6); levelGroup.add(strobe); const wash = new THREE.PointLight(0xff3b8a, 1.2, 30, 1.5); wash.position.set(0, 3, 6); levelGroup.add(wash);
  levelAnims.push(t => { strobe.intensity = (Math.floor(t * 8) % 7 === 0) ? 2.2 : 0; wash.color.set(cols[Math.floor(t * 0.5) % 5]); });
  // the crowd on the floor
  const looks = [['#ff3b8a', '#1e1c22', '#e0b892', '#1e1a18'], ['#3bd2ff', '#3a2a4a', '#8a5a3a', '#ffd36a'], ['#ffd23a', '#2c2a28', '#c58a64', '#c8402f'], ['#8a3bff', '#1e1c22', '#9fe8ff', '#e8e4dc'], ['#3bff8a', '#3a3d44', '#e0b892', '#5a3a22'], ['#e8e4dc', '#c8402f', '#8a5a3a', '#1e1a18']];
  for (let k = 0; k < 14; k++) { const L = looks[k % looks.length], o = buildChar(() => makeCivilian(...L, cols[k % 5]), 'civ'), a = k * 2.39, r = 1.2 + (k % 4) * 1.2, bx = Math.cos(a) * r, bz = 6.5 + Math.sin(a) * r * 0.9, ph = k * 0.7, st = {};
    o.position.set(bx, 0.06, bz); levelGroup.add(o);
    levelAnims.push(t => { const b = Math.abs(Math.sin(t * 4.2 + ph)); o.position.y = 0.06 + b * 0.18; o.rotation.y = ph + Math.sin(t * 1.1 + ph) * 1.4; o.rotation.z = Math.sin(t * 4.2 + ph) * 0.08; animRig(o, st, 0.016, t); }); }
}; }
// the President of the New United States is here, and he is having a very good time
function makePrez() { const g = makeCivilian('#1e2a4a', '#1e2a4a', '#e8b896', '#e8e0c8', '#c8402f'); part(g, B(0.08, 0.5, 0.03), '#c8402f', 0.03, 1.3, 0.14); part(g, B(0.52, 0.08, 0.3), toon('#e8e4dc', 'cloth'), 0, 1.5, 0, 0, 0, 0.5); part(g, B(0.2, 0.06, 0.04), glow('#ffd36a'), -0.12, 1.42, 0.14); for (const s of [-1, 1]) part(g, B(0.1, 0.05, 0.03), '#1e1c22', s * 0.06, 1.79, 0.13); const v = part(g, Cy(0.03, 0.03, 0.12, 6), glow('#c86aff'), 0.36, 0.95, 0.12); return g; }
{ const _bn = barNpcs; barNpcs = function () { const list = _bn();
  list.push({ id: 'prez', name: 'President Duke Starling', role: 'President of the New United States · off duty', rig: 'civ', make: makePrez, x: 1.5, z: 6.5, face: 2.6,
    custom: [['🎉 Party with the President', () => partyWithPrez()]],
    idle: ["THIS SONG! THIS IS MY SONG! Every song is my song tonight!", "Don't tell the Senate I'm here. Don't tell the Senate I'm anywhere.", "You wanna know the secret to running a country? Neither do I. Have some Nebula Dust.", "I signed three bills today. With my FEET. Dancing feet.", "Zeltac moon-moss, trooper. It's not illegal if you're in orbit. I checked. I made it legal. I'm the president."] });
  list.push({ id: 'djnova', name: 'DJ Nova', role: 'On the decks', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#ff3b8a', '#5d636c': '#1e1c22' }), x: 0, z: 22.4, face: Math.PI, idle: ["NEXT TRACK: ALSO BANGING.", "I HAVE 4,000 SONGS. I PLAY FOUR. THE PEOPLE KNOW WHAT THEY WANT."] });
  return list; }; }
function partyWithPrez() {
  openDlg('Starlight Lounge', 'President Duke Starling');
  $('dlgLine').textContent = "You! Trooper! Hero of the galaxy! Take a hit of this Nebula Dust. It's what the moons are made of. Probably. Don't operate a starship for, like, ten minutes.";
  acts([['Take a hit', () => { closeDlg(); spaceTrip(); }, true], ['Just dance', () => { closeDlg(); toast('🕺 DANCING', 'The President approves', 2); SFX.quest(); }], ['Maybe later, sir', closeDlg]]);
}
function fuzzCurve(k) { const n = 2048, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
function spaceTrip() {
  const st = $('stage'); if (!st) return; SFX.level(); toast('NEBULA DUST', 'Whoa. The colors have colors.', 3);
  const DUR = 15; MUS.tripUntil = performance.now() + DUR * 1000; if (MUS.fz) MUS.fz.curve = fuzzCurve(14);
  // a burning cigarette in your hand
  const cig = new THREE.Group(); const body = part(cig, Cy(0.009, 0.009, 0.16, 8), '#f4f0e8', 0, 0, 0, 0, 0, Math.PI / 2); const filt = part(cig, Cy(0.0095, 0.0095, 0.045, 8), '#d89a5a', -0.095, 0, 0, 0, 0, Math.PI / 2); const tip = part(cig, Cy(0.0092, 0.0092, 0.012, 8), glow('#ff6a1a'), 0.085, 0, 0, 0, 0, Math.PI / 2);
  const hand = part(cig, B(0.07, 0.035, 0.05), toon('#e0b892', 'skin'), -0.06, -0.025, 0.01); cig.scale.setScalar(1.15); cig.position.set(0.17, -0.17, -0.38); cig.rotation.set(0.15, -0.5, 0.35); camera.add(cig);
  let t = 0; const iv = setInterval(() => { t += 0.1; const k = t / DUR;
    st.style.filter = `hue-rotate(${(t * 60) % 360}deg) saturate(${1.6 + Math.sin(t) * 0.5}) blur(${Math.max(0, Math.sin(t * 2)) * 1.1}px)`;
    const len = 0.16 * (1 - k * 0.75); body.scale.y = len / 0.16; body.position.x = -0.0725 + len / 2; tip.position.x = -0.0725 + len + 0.004; tip.material = glow(Math.sin(t * 9) > 0 ? '#ff6a1a' : '#ff9a3c');
    if (Math.random() < 0.6) { const wp = tip.getWorldPosition(V(0, 0, 0)); burst(wp.add(V(0, 0.02, 0)), '#b8b8c0', 1, 0.25); }
    const hf = Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect); cig.position.x = Math.min(0.17, 0.38 * Math.tan(hf) * 0.35); cig.position.y = -0.38 * Math.tan(camera.fov * Math.PI / 360) * 0.32 + Math.sin(t * 2) * 0.006;
    if (t >= DUR) { clearInterval(iv); st.style.filter = ''; camera.remove(cig); if (MUS.fz) MUS.fz.curve = null; MUS.tripUntil = 0; toast('...', 'The room stops breathing. Mostly.', 2); } }, 100);
  S.buffs = S.buffs || {}; S.buffs.rest = Math.max(S.buffs.rest || 0, Date.now()) + 5 * 60000; markDirty();
}
// he dances too
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); setTimeout(() => { const N = npcObjs.prez; if (!N) return; const o0 = N.obj, base = o0.position.y, ry = o0.rotation.y; levelAnims.push(t => { if (!o0.parent) return; o0.position.y = base + Math.abs(Math.sin(t * 4.2)) * 0.22; o0.rotation.y = ry + Math.sin(t * 1.7) * 0.9; if (Math.random() < 0.05) burst(o0.position.clone().add(V(0.3, 1.7, 0.2)), '#c86aff', 3, 1); }); }, 50); return r; }; }

// ---- lounge mode: no weapons on the dance floor, just a DANCE button ----
const inLounge = () => LEVEL && LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' && zTheme(ZF.floor) === 'bar';
const DANCE = { on: false, t: 0 };
{ const st = document.createElement('style'); st.textContent = `
body.lounge #tFire, body.lounge #tJump, body.lounge .tq, body.lounge #ammo, body.lounge #cross { display: none !important; }
#tDance { display: none; right: 72px; bottom: calc(env(safe-area-inset-bottom, 0px) + 104px); width: 96px; height: 96px; border-radius: 50%; font: 700 15px var(--hud); letter-spacing: .1em; }
body.lounge #tDance { display: grid !important; }
body.lounge.dancing #tDance { background: radial-gradient(circle, rgba(255,59,138,.5), rgba(138,59,255,.3)) !important; }
#danceHud { position: absolute; right: 12px; bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); padding: 8px 14px; font: 700 15px var(--hud); letter-spacing: .08em; color: #fff; display: none; pointer-events: auto; cursor: pointer; }
body.lounge #danceHud { display: block; }
@media (pointer: coarse) { body.lounge #danceHud { display: none; } }
`; document.body.appendChild(st); }
{ const b = document.createElement('button'); b.className = 'tbtn'; b.id = 'tDance'; b.textContent = 'DANCE'; $('touch').appendChild(b); b.addEventListener('touchstart', e => { toggleDance(); e.preventDefault(); }, { passive: false }); b.addEventListener('click', toggleDance);
  const d = document.createElement('button'); d.className = 'win'; d.id = 'danceHud'; d.innerHTML = '🕺 DANCE <small style="opacity:.7">(click)</small>'; $('hud').appendChild(d); d.addEventListener('click', toggleDance); }
function toggleDance() { if (!inLounge()) return; DANCE.on = !DANCE.on; document.body.classList.toggle('dancing', DANCE.on); SFX.ui(); if (DANCE.on && Math.random() < 0.5) toast(['🕺 NICE MOVES', '💃 THE CROWD GOES WILD', '🪩 SMOOTH', '🕺 THE PRESIDENT IS IMPRESSED'][Math.floor(Math.random() * 4)], '', 1.4); }
{ const _f = fire; fire = function () { if (inLounge()) return; return _f(); }; }
{ const _sw = swapHand; swapHand = function () { if (inLounge()) return; return _sw(); }; }
{ const _to = throwOrd; throwOrd = function () { if (inLounge()) return; return _to(); }; }
window.addEventListener('mousedown', e => { if (e.button === 0 && inLounge() && state === 'play' && !dlgOpen && document.pointerLockElement) toggleDance(); });
{ const _s = step; step = function (dt) { _s(dt); const L = inLounge(); document.body.classList.toggle('lounge', L); if (!L) { if (DANCE.on) { DANCE.on = false; document.body.classList.remove('dancing'); } if (DR && DR.obj && !DR.obj.visible) DR.obj.visible = true; return; }
  vm.visible = false; if (DR && DR.obj) DR.obj.visible = false;
  if (DANCE.on) { DANCE.t += dt; const b = Math.abs(Math.sin(DANCE.t * 4.2)); camera.position.y += b * 0.12 - 0.04; camera.rotation.z += Math.sin(DANCE.t * 2.1) * 0.06; player.yaw += Math.sin(DANCE.t * 1.05) * dt * 0.6; } }; }
