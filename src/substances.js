// =================== PHASE 6: SUBSTANCES AND THE LAB ===================
// Optional (Settings → Game → Substances, off by default). Timed boosts with screen effects; illegal ones can bring a bad trip.
// The Lab is a ship room that brews the illegal ones; owning it keeps you Wanted until you tear it down.
// Save fields: PREFS.subs, S.buffs['sub_<id>'] (end time), S.buffs.trip, S.lastSub, S.lab ({ r, t, n }).
if (PREFS.subs == null) PREFS.subs = false;
const subsOn = () => !!PREFS.subs;
const SUBS = {
  focusfizz: { name: 'Focus Fizz', legal: true, price: 60, v: 20, col: '#7fe0ff', sec: 600, xp: 0.15, fx: { sat: 0.15 }, trip: 0, desc: 'A fizzy focus drink. +15% XP for 10 minutes.' },
  stimpatch: { name: 'Stim Patch', legal: true, price: 90, v: 30, col: '#9fff6a', sec: 300, spd: 0.15, fx: { con: 0.12 }, trip: 0, desc: 'Stick it on, feel the buzz. +15% move speed for 5 minutes.' },
  irongum: { name: 'Iron Gum', legal: true, price: 120, v: 40, col: '#ffb36a', sec: 480, def: 0.10, fx: { warm: 0.08 }, trip: 0, desc: 'Chew it and your skin goes leathery. Take 10% less damage for 8 minutes.' },
  voidspice: { name: 'Void Spice', price: 140, v: 45, col: '#c86aff', sec: 180, dmg: 0.25, fx: { hue: 0.5, ghost: 0.5 }, trip: 0.10, desc: 'Glittering purple dust from the void lanes. +25% damage for 3 minutes, and everything goes purple. Very illegal.' },
  neondust: { name: 'Neon Dust', price: 160, v: 60, col: '#ff6aa8', sec: 180, spd: 0.35, fx: { cycle: 1 }, trip: 0.15, desc: 'Glows in the dark, and so do you. +35% move speed for 3 minutes, rainbow vision.' },
  glimmer: { name: 'Glimmer', price: 220, v: 80, col: '#ffd36a', sec: 300, cr: 0.6, fx: { bloom: 0.7, sat: 0.3 }, trip: 0.15, desc: 'Liquid gold you drip in your eyes. +60% credits from kills for 5 minutes.' },
  redhaze: { name: 'Red Haze', price: 260, v: 90, col: '#ff3b2a', sec: 120, dmg: 0.45, take: 0.2, fx: { red: 1, pulse: 1 }, trip: 0.20, desc: 'Rage in a can. +45% damage but you take 20% more, for 2 minutes.' },
  blackout: { name: 'Blackout', price: 0, v: 300, col: '#6a4aa8', sec: 90, dmg: 0.5, spd: 0.5, xp: 0.5, fx: { wobble: 1, ghost: 1, cycle: 1 }, trip: 0.35, lab: true, desc: 'Only a Lab can cook it. +50% damage, speed and XP for 90 seconds. Nobody remembers the rest.' }
};
for (const id in SUBS) { const D = SUBS[id]; ITEMS[id] = Object.assign(ITEMS[id] || {}, { name: D.name, v: D.v, col: D.col, drug: true, illegal: !D.legal, desc: D.desc }); }
const subEnd = id => buffs()['sub_' + id] || 0;
const subActive = () => subsOn() ? Object.keys(SUBS).filter(id => subEnd(id) > Date.now()) : [];
const subSum = k => subActive().reduce((a, id) => a + (SUBS[id][k] || 0), 0);
function subSpeed() { return 1 + subSum('spd'); }
function subDmg() { return 1 + subSum('dmg'); }
function subCr() { return 1 + subSum('cr'); }
const tripOn = () => subsOn() && (buffs().trip || 0) > Date.now();
{ const _g = gainXp; gainXp = function (n) { const m = 1 + subSum('xp'); return _g(m > 1 ? Math.round(n * m) : n); }; }
{ const _h = hurt; hurt = function (dmg, src) { const d = subSum('def'), t = subSum('take'); return _h(d || t ? dmg * (1 - d) * (1 + t) : dmg, src); }; }

// ---- taking one ----
function useSub(id) {
  const D = SUBS[id]; if (!D || !(S.inv[id] > 0)) return false;
  if (!subsOn()) { log('Substances are switched off. Turn them on in Settings → Game.'); SFX.hit(); return true; }
  S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; buffs()['sub_' + id] = Date.now() + D.sec * 1000; S.lastSub = id; markDirty();
  try { burst(player.pos.clone().add(V(0, 1.3, 0)), D.col, 16, 2.5); } catch (_) {} SFX.quest();
  toast(D.name.toUpperCase(), D.desc.split('. ').slice(1).join('. ').replace(/\.$/, '') || D.desc, 2.4);
  if (D.trip && Math.random() < D.trip) setTimeout(() => startTrip(40 + Math.random() * 50), 2500 + Math.random() * 4000);
  subChip(); invQuickRender(); return true;
}
{ const _ou = outUseItem; outUseItem = function (id) { if (SUBS[id]) return useSub(id); return _ou(id); }; }
// hide them from the bag while the system is off (they stay saved)
{ const _ik = invKeys; invKeys = function () { const ks = _ik(); return subsOn() ? ks : ks.filter(k => !SUBS[k.slice(2)]); }; }

// ---- shops ----
function subStoreRows(render) {
  if (!subsOn()) return [];
  return Object.keys(SUBS).filter(id => SUBS[id].legal).map(id => { const D = SUBS[id]; return [id, S.inv[id] || 0, `${D.price} cr`, [['Buy', () => { if (S.cr < D.price) return; if (invRoomFor(id) < 1) { invFullNote(id); return; } S.cr -= D.price; S.inv[id] = (S.inv[id] || 0) + 1; SFX.coin(); markDirty(); render(); }, S.cr < D.price]]]; });
}
const MCK_SUBS = ['voidspice', 'neondust'];
function openSubShop(role, who, ids, back) {
  openDlg(role, who); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `Cash only, no questions. You have ${S.cr.toLocaleString()} cr.`;
    itemRows(rows, ids.map(id => { const D = SUBS[id]; return [id, S.inv[id] || 0, `${D.price} cr ▲`, [['Buy', () => buy(id, 1)], ['Buy 5', () => buy(id, 5)]]]; })); };
  const buy = (id, n) => { const p = SUBS[id].price * n; if (S.cr < p) { SFX.hit(); log('Not enough credits.'); return; } if (invRoomFor(id) < n) { invFullNote(id); return; } S.cr -= p; S.inv[id] = (S.inv[id] || 0) + n; S.invT = S.invT || {}; S.invT['i:' + id] = Date.now(); SFX.coin(); log(`+${n} ${SUBS[id].name}`, 'loot'); markDirty(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
// Madame Vex: every illegal one but Blackout, for outlaws
BM_STOCK.forEach(it => { if (it.id === 'voidspice') it.show = () => !subsOn(); });
for (const id of ['voidspice', 'neondust', 'glimmer', 'redhaze']) BM_STOCK.push({ id, name: SUBS[id].name, price: SUBS[id].price, desc: SUBS[id].desc, show: subsOn, buy: () => { S.inv[id] = (S.inv[id] || 0) + 1; } });

// ---- the screen: hue shift, wobble, ghosting, tint, and the dark of a bad trip ----
const SUBFX = { hue: 0, wob: 0, ghost: 0, tintA: 0, dark: 0, sat: 0, con: 0, warm: 0, bloom: 0, vig: 0, was: false };
const subLerp = (a, b, k) => a + (b - a) * k;
function subFxStep(dt) {
  const U = postMat.uniforms, now = Date.now(), act = subActive(), trip = tripOn(), t = performance.now() / 1000;
  const tgt = { hue: 0, wob: 0, ghost: 0, tintA: 0, dark: 0, sat: 0, con: 0, warm: 0, bloom: 0, vig: 0 }; let red = 0;
  for (const id of act) { const F = SUBS[id].fx || {}, left = (subEnd(id) - now) / 1000, k = Math.min(1, left / 8); // fade out over the last 8 seconds
    tgt.sat += (F.sat || 0) * k; tgt.con += (F.con || 0) * k; tgt.warm += (F.warm || 0) * k; tgt.bloom += (F.bloom || 0) * k;
    if (F.hue) tgt.hue += F.hue * k; if (F.cycle) tgt.hue += Math.sin(t * 0.7) * 2.2 * F.cycle * k; tgt.ghost += (F.ghost || 0) * k; tgt.wob += (F.wobble || 0) * k;
    if (F.red) red = Math.max(red, F.red * k * (F.pulse ? 0.75 + Math.sin(t * 5) * 0.25 : 1)); }
  if (red) { U.tint.value.setRGB(1, 0.35, 0.3); tgt.tintA = red * 0.6; }
  if (trip) { tgt.dark = 1; tgt.sat -= 0.5; tgt.vig += 0.9; tgt.wob += 0.35; tgt.hue *= 0.3; }
  const k = Math.min(1, dt * 2.5); let any = false;
  for (const key in tgt) { SUBFX[key] = subLerp(SUBFX[key], tgt[key], key === 'hue' ? Math.min(1, dt * 6) : k); if (Math.abs(SUBFX[key]) > 0.002) any = true; }
  if (!any && !SUBFX.was) return; SUBFX.was = any;
  const G = gfxNow(); U.hue.value = SUBFX.hue; U.wob.value = SUBFX.wob; U.ghost.value = Math.min(1.2, SUBFX.ghost); U.tintA.value = SUBFX.tintA; U.dark.value = SUBFX.dark; U.ftime.value = t;
  U.sat.value = Math.max(0, G.sat + SUBFX.sat); U.con.value = G.con + SUBFX.con; U.warm.value = G.warm + SUBFX.warm; U.bloom.value = G.bloom + SUBFX.bloom; U.vig.value = G.vig + SUBFX.vig;
  if (!any) applyGfx();
}

// ---- bad trips: shadow figures at the edge of view that vanish when you look, and whispers ----
const TRIP = { figs: [], t: 0, wt: 0 };
function startTrip(sec) {
  if (!subsOn() || !player.alive) return; buffs().trip = Date.now() + sec * 1000; markDirty();
  toast('BAD TRIP', 'Something is wrong. Ride it out.', 2.5); log("The colors drain out of everything. You're not alone.", 'loot');
}
function makeShadowFig() {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: '#050308', transparent: true, opacity: 0, depthWrite: false });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 1.7, 8), m); body.position.y = 0.85; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), m); head.position.y = 1.9; g.add(head);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 0 })); e.position.set(0.08 * s, 1.93, 0.21); g.add(e); }
  g.userData.mats = [m, g.children[2].material, g.children[3].material]; return g;
}
const WHISPERS = ['behind you', 'we see you', 'it was never yours', 'keep running', 'the sun is setting', "don't look", 'come down here', 'you did this'];
function whisper() {
  if (!PREFS.sfx) return;
  try { const u = new SpeechSynthesisUtterance(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]); u.volume = 0.25; u.rate = 0.7; u.pitch = 0.1; speechSynthesis.speak(u); } catch (_) {}
}
function tripStep(dt) {
  const on = tripOn() && LEVEL && !LEVEL.fly && state === 'play';
  if (!on) { if (TRIP.figs.length) { for (const f of TRIP.figs) scene.remove(f.o); TRIP.figs.length = 0; } return; }
  TRIP.t -= dt; TRIP.wt -= dt;
  if (TRIP.wt <= 0) { TRIP.wt = 6 + Math.random() * 8; whisper(); }
  if (TRIP.t <= 0 && TRIP.figs.length < 3) { TRIP.t = 3 + Math.random() * 4;
    const side = Math.random() < 0.5 ? -1 : 1, a = player.yaw + side * (0.9 + Math.random() * 0.5), d = 9 + Math.random() * 8;
    const x = player.pos.x - Math.sin(a) * d, z = player.pos.z - Math.cos(a) * d, o = makeShadowFig();
    o.position.set(x, (LEVEL.terrain ? groundH(x, z) : player.pos.y - 1.6), z); scene.add(o); TRIP.figs.push({ o, a: 0, life: 9, gone: false }); }
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
  for (let i = TRIP.figs.length - 1; i >= 0; i--) { const f = TRIP.figs[i], dx = f.o.position.x - player.pos.x, dz = f.o.position.z - player.pos.z, d = Math.hypot(dx, dz) || 1;
    f.o.rotation.y = Math.atan2(-dx, -dz); f.life -= dt;
    if ((dx * fx + dz * fz) / d > 0.88 || f.life <= 0) f.gone = true; // you looked right at it
    f.a = f.gone ? f.a - dt * 4 : Math.min(0.85, f.a + dt * 0.6);
    f.o.userData.mats.forEach((m, j) => { m.opacity = Math.max(0, j ? Math.min(1, f.a * 1.2) : f.a); });
    if (f.gone && f.a <= 0) { scene.remove(f.o); TRIP.figs.splice(i, 1); } }
}
{ const _st = step; step = function (dt) { const r = _st.apply(this, arguments); try { subFxStep(dt); tripStep(dt); } catch (_) {} return r; }; }
// leaving the game screen or dying ends the visuals cleanly
{ const _ss = setState; setState = function (s) { const r = _ss.apply(this, arguments); if (s !== 'play' && s !== 'pause') { try { subFxStep(10); } catch (_) {} } return r; }; }

// ---- HUD: active-substance chip, the quick Use button (U on PC) ----
const subChipEl = document.createElement('button'); subChipEl.className = 'vchip'; subChipEl.hidden = true; subChipEl.title = 'Take a substance (U)'; subChipEl.addEventListener('click', () => quickSub()); { const h = document.getElementById('vchips'); if (h) h.appendChild(subChipEl); }
const tSub = document.createElement('button'); tSub.className = 'tbtn tq'; tSub.id = 'tSub'; tSub.setAttribute('aria-label', 'Take a substance'); tSub.innerHTML = '<i>✦</i><small>USE</small>'; tSub.hidden = true; { const t = document.getElementById('touch'); if (t) t.appendChild(tSub); }
tSub.addEventListener('touchstart', e => { quickSub(); e.preventDefault(); }, { passive: false }); tSub.addEventListener('click', () => quickSub());
{ const st = document.createElement('style'); st.textContent = 'body #tSub { right: 70px !important; } @media (pointer: coarse) and (max-height: 520px) { body #tSub { right: 62px !important; } }'; document.head.appendChild(st); }
const subOwned = () => Object.keys(SUBS).filter(id => S.inv[id] > 0);
function subChip() {
  const on = subsOn(), act = subActive(), now = Date.now();
  subChipEl.hidden = !on || (!act.length && !subOwned().length);
  if (!subChipEl.hidden) subChipEl.innerHTML = (act.length ? act.map(id => `<span style="color:${SUBS[id].col}">✦${Math.ceil((subEnd(id) - now) / 60000)}m</span>`).join(' ') : '✦ Use') + (tripOn() ? ' <span style="color:#ff3b2a">☠</span>' : '') + ' <kbd>U</kbd>';
  tSub.hidden = !on || !subOwned().length;
  try { const h = $('tReload'); if (h && !tSub.hidden) tSub.style.setProperty('bottom', getComputedStyle(h).bottom, 'important'); } catch (_) {}
}
setInterval(() => { try { subChip(); } catch (_) {} }, 1000);
function quickSub() {
  if (!subsOn() || state !== 'play' || dlgOpen) return; const own = subOwned();
  if (!own.length) { toast('NOTHING TO TAKE', 'Stores sell the legal ones', 1.4); return; }
  if (own.length === 1) { useSub(own[0]); return; }
  openDlg('Substances', 'Take something'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  itemRows(rows, own.map(id => [id, S.inv[id], SUBS[id].desc.split('. ').slice(1, 2).join('') || '', [['Take', () => { closeDlg(); useSub(id); }, false]]]));
  $('dlgActs').before(rows); acts([['Close', closeDlg, true]]);
}
window.addEventListener('keydown', e => { if (e.code !== 'KeyU' || e.repeat || state !== 'play' || dlgOpen || (typeof chatOpen === 'function' && chatOpen()) || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return; quickSub(); });

// ---- Settings → Game: the switch ----
{ const anchor = $('setMusic').previousElementSibling, l = document.createElement('span'); l.textContent = 'Substances'; const b = document.createElement('button'); b.className = 'pbtn'; b.id = 'setSubs';
  b.addEventListener('click', () => { PREFS.subs = !PREFS.subs; savePrefs(); renderSettings(); SFX.ui(); if (!PREFS.subs) { subFxStep(10); } subChip(); invQuickRender(); }); anchor.before(l, b);
  SET_OF.setSubs = 'game'; }
{ const _rs = renderSettings; renderSettings = function () { _rs(); const b = $('setSubs'); if (b) b.textContent = PREFS.subs ? 'On' : 'Off'; }; }
renderSettings(); try { showSetTab(setTab); } catch (_) {}

// =================== THE LAB ===================
ROOMS.lab = { name: 'Lab', cost: { cr: 2500, crystal: 8 }, desc: 'Brews illegal substances from materials, and the only place to cook Blackout. Owning one keeps you Wanted.', hide: () => !subsOn() };
const LAB_RECIPES = { voidspice: { scrap: 2 }, neondust: { crystal: 1 }, glimmer: { circuit: 1, crystal: 1 }, redhaze: { shell: 2 }, blackout: { core: 1, crystal: 1 } };
const labEvery = () => (12 - 2 * lvUp('lab')) * 60000, labMax = () => 3 + 2 * lvUp('lab');
{ const _ut = roomUpText; roomUpText = function (id, L) { if (id === 'lab') return `Brews a dose every ${12 - 2 * (L - 1)} min, holds ${3 + 2 * (L - 1)}`; return _ut(id, L); }; }
function labS() { S.lab = S.lab || { r: 'voidspice', t: Date.now(), n: 0 }; return S.lab; }
function labTick() { // brew what the time and materials allow; no materials means the batch waits
  if (!roomLvl('lab')) return; const L = labS(), now = Date.now(), ev = labEvery(), need = LAB_RECIPES[L.r] || {};
  while (now - L.t >= ev && L.n < labMax()) { if (!costOk(need)) { L.t = now; break; } costPay(need); L.n++; L.t += ev; }
  if (L.n >= labMax()) L.t = now;
}
setInterval(() => { try { const O = outS(), had = !!O.lab; O.lab = roomLvl('lab') > 0; labTick();
  if (O.lab && !O.bounty) { O.bounty = 300 + O.rep * 10; O.growT = O.obT = Date.now(); O.huntT = Date.now() + 90000; if (!had) log('The Marshals heard about your Lab. You stay Wanted while it runs.', 'loot'); try { outPush(); } catch (_) {} }
  if (had && !O.lab && O.bounty && outTier() < 3) { O.bounty = 0; O.obT = 0; try { outPush(); } catch (_) {} } } catch (_) {} }, 5000);
function openLab() {
  labTick(); const L = labS(); openDlg('Lab', `Level ${roomLvl('lab')}`); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { labTick(); rows.textContent = ''; const need = LAB_RECIPES[L.r];
    $('dlgLine').textContent = `Brewing ${SUBS[L.r].name}: ${L.n} of ${labMax()} doses ready. One every ${Math.round(labEvery() / 60000)} min, using ${costLabel(need)} each${costOk(need) ? '' : ' (you are out of materials, so it has stopped)'}.`;
    itemRows(rows, Object.keys(LAB_RECIPES).map(id => [id, S.inv[id] || 0, `${costLabel(LAB_RECIPES[id])} a dose`, [[L.r === id ? 'Brewing' : 'Brew this', () => { if (L.r !== id) { L.r = id; L.n = 0; L.t = Date.now(); markDirty(); SFX.ui(); render(); } }, L.r === id]]])); };
  $('dlgActs').before(rows);
  acts([['Collect ' + L.n, () => { if (!L.n) return; const n = Math.min(L.n, invRoomFor(L.r)); if (n < 1) { invFullNote(L.r); return; } S.inv[L.r] = (S.inv[L.r] || 0) + n; L.n -= n; L.t = Date.now(); SFX.coin(); log(`+${n} ${SUBS[L.r].name}`, 'loot'); markDirty(); openLab(); }, true, !L.n],
    ['Tear down the Lab', () => labTearDown()], ['Close', closeDlg]]); render();
}
function labTearDown() {
  openDlg('Lab', 'Tear it down?'); $('dlgLine').textContent = "Strip the Lab out of your ship? You get nothing back, but the Marshals stop treating you as Wanted (unless your rep still says you are).";
  acts([['Tear it down', () => { S.ship.rooms = S.ship.rooms.filter(r => r !== 'lab'); if (S.ship.lvl) delete S.ship.lvl.lab; S.lab = null; const O = outS(); O.lab = false; if (outTier() < 3) { O.bounty = 0; O.obT = 0; } markDirty(); try { outPush(); } catch (_) {} closeDlg(); SFX.hit(); toast('LAB GONE', 'The Marshals lose interest', 2.5); loadLevel('ship', { at: { x: 0, z: -4, yaw: 0 } }); }, true], ['Keep it', () => openLab()]]);
}
function labRoom(s, cx, cz, far, outer, faceIn, term, props) {
  // a steel bench of glowing flasks, a bubbling vat, and the lab console
  part(props, B(1.0, 0.9, 4.4), '#3a3d44', far, 0.45, cz - 0.6); part(props, B(1.05, 0.06, 4.5), toon('#5a5e66'), far, 0.92, cz - 0.6); box(far, cz - 0.6, 0.5, 2.2);
  const cols = ['#c86aff', '#ff6aa8', '#ffd36a', '#ff3b2a', '#7fe0ff'], flasks = [];
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glow(cols[i % cols.length])); f.position.set(far + (i % 2 ? 0.2 : -0.2), 1.08, cz - 2.4 + i * 0.6); props.add(f); flasks.push(f);
    part(props, Cy(0.03, 0.04, 0.22, 6), new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.5 }), f.position.x, 1.28, f.position.z); }
  const vat = new THREE.Group(); part(vat, Cy(0.75, 0.85, 1.1, 14), '#2a2c32', 0, 0.55, 0); const liq = part(vat, Cy(0.68, 0.68, 0.05, 14), glow('#8f6ad0'), 0, 1.1, 0);
  vat.position.set(cx - s.side * 0.4, 0, cz + 2.6); props.add(vat); solid(vat.position.x, vat.position.z, 0.9);
  const pl = new THREE.PointLight(0xa070ff, 0.8, 8); pl.position.set(cx, 1.6, cz + 2.4); props.add(pl);
  levelAnims.push(t => { liq.position.y = 1.1 + Math.sin(t * 3) * 0.02; flasks.forEach((f, i) => { f.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.08); }); pl.intensity = 0.7 + Math.sin(t * 4) * 0.15; });
  term(cx + s.side * 0.5, s.z0 + 0.6, '#c8a8ff', 'Lab console (brew, collect)', openLab, 0);
}
