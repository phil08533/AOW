// =================== PHASE 6: SUBSTANCES AND THE LAB ===================
// Optional (Settings → Game → Substances, off by default). Timed boosts with screen effects; illegal ones can bring a bad trip.
// The Lab is a ship room that brews the illegal ones; owning it keeps you Wanted until you tear it down.
// Save fields: PREFS.subs, S.buffs['sub_<id>'] (end time), S.buffs.trip, S.lastSub, S.lab ({ st: [{ r, t, n }], shelf }).
if (PREFS.subs == null) PREFS.subs = true;
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

// ---- First-Person Inhaler Animation ----
// Raises a high-tech canister inhaler to your mouth. The top dome is clear glass,
// housing a glowing substance core whose color and light change dynamically based on the drug.
let curInhaler = null, curInhalerIv = null;
function playInhalerAnim(id) {
  if (curInhaler) { camera.remove(curInhaler); curInhaler = null; }
  if (curInhalerIv) { clearInterval(curInhalerIv); curInhalerIv = null; }
  if (typeof camera === 'undefined') return;

  const D = SUBS[id] || { col: '#c86aff', name: id };
  const col = D.col || '#c86aff';

  const g = new THREE.Group();
  // 1. Sleek sci-fi inhaler body (dark matte casing)
  part(g, Cy(0.018, 0.019, 0.09, 12), '#25272c', 0, 0, 0);
  for (let r = 0; r < 3; r++) {
    part(g, Cy(0.0195, 0.0195, 0.008, 12), '#18191d', 0, -0.02 + r * 0.016, 0);
  }
  // Mouthpiece nozzle angled forward
  const nozzle = part(g, Cy(0.013, 0.014, 0.045, 10), '#32353c', 0, -0.018, 0.035, Math.PI / 3, 0, 0);
  part(g, Cy(0.011, 0.011, 0.01, 10), '#111215', 0, -0.004, 0.052, Math.PI / 3, 0, 0);

  // 2. Clear glass canister chamber at the top
  const glassMat = psx(new THREE.MeshBasicMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.45, depthWrite: false }));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.056, 14), glassMat);
  glass.position.set(0, 0.072, 0);
  g.add(glass);

  // Metal cap / actuator on top of the glass
  const cap = part(g, Cy(0.023, 0.023, 0.016, 12), '#454850', 0, 0.104, 0);
  part(g, Cy(0.015, 0.015, 0.005, 10), col, 0, 0.113, 0);

  // 3. Glowing substance inside the clear glass
  const drugCore = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.046, 12), glow(col));
  drugCore.position.set(0, 0.072, 0);
  g.add(drugCore);

  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.009, 0), glow('#ffffff'));
  orb.position.set(0, 0.072, 0);
  g.add(orb);

  // Local glow pointlight
  const pl = new THREE.PointLight(new THREE.Color(col), 1.2, 2.0);
  pl.position.set(0, 0.075, 0.03);
  g.add(pl);

  // Hand / thumb & fingers supporting the inhaler
  const skinCol = (typeof FACE !== 'undefined' && FACE.skin && typeof charLook !== 'undefined' && charLook && FACE.skin[typeof getFaceParts === 'function' ? getFaceParts().s : 0]) || '#e0b892';
  // fingers curled round the body and a thumb resting on the actuator
  const skinM = new THREE.MeshLambertMaterial({ color: new THREE.Color(skinCol).convertSRGBToLinear() });
  for (let i = 0; i < 4; i++) part(g, B(0.012, 0.011, 0.03), skinM, -0.012, 0.03 - i * 0.014, 0.012, 0, 0.5, 0);
  part(g, B(0.03, 0.06, 0.02), skinM, -0.026, 0.008, -0.004);
  part(g, B(0.011, 0.028, 0.012), skinM, 0.019, 0.04, 0.006, 0, 0, -0.2);

  g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.renderOrder = 4; } });
  g.scale.setScalar(1.5);
  const oldVmVis = typeof vm !== 'undefined' ? vm.visible : true;
  if (typeof vm !== 'undefined') vm.visible = false;
  camera.add(g);
  curInhaler = g;

  const startTime = performance.now();
  const dur = 1300;
  let puffed = false;

  curInhalerIv = setInterval(() => {
    if (window._inhalerFreeze) {
      g.position.set(0.05, -0.10, -0.28);
      g.rotation.set(0.12, -0.08, 0.1);
      drugCore.scale.set(1.08, 1, 1.08);
      return;
    }

    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / dur);

    let pX, pY, pZ, rotX, rotY;
    if (progress < 0.32) {
      const k = progress / 0.32, ease = 1 - Math.pow(1 - k, 3);
      pX = 0.20 + (0.05 - 0.20) * ease;
      pY = -0.34 + (-0.10 - -0.34) * ease;
      pZ = -0.38 + (-0.28 - -0.38) * ease;
      rotX = 0.45 * (1 - ease) + 0.12 * ease;
      rotY = -0.35 * (1 - ease) - 0.08 * ease;
    } else if (progress < 0.68) {
      pX = 0.05 + Math.sin((progress - 0.32) * 20) * 0.002;
      pY = -0.10 + Math.cos((progress - 0.32) * 20) * 0.002;
      pZ = -0.28;
      rotX = 0.12;
      rotY = -0.08;
      cap.position.y = 0.104 - 0.008;

      if (!puffed) {
        puffed = true;
        try {
          const wp = nozzle.getWorldPosition(new THREE.Vector3());
          burst(wp.add(new THREE.Vector3(0, 0.01, 0.02)), col, 12, 1.4);
        } catch (_) {}
        try { if (SFX.laser) SFX.laser(); else if (SFX.item) SFX.item(); } catch (_) {}
      }

      drugCore.scale.set(1 + Math.sin(elapsed * 0.02) * 0.14, 1, 1 + Math.cos(elapsed * 0.02) * 0.14);
      orb.position.y = 0.072 + Math.sin(elapsed * 0.015) * 0.014;
    } else {
      const k = (progress - 0.68) / 0.32, ease = k * k;
      pX = 0.05 + (0.20 - 0.05) * ease;
      pY = -0.10 + (-0.38 - -0.10) * ease;
      pZ = -0.28 + (-0.38 - -0.28) * ease;
      rotX = 0.12 + (0.45 - 0.12) * ease;
      rotY = -0.08 + (-0.35 - -0.08) * ease;
      cap.position.y = 0.104;
    }

    g.position.set(pX, pY, pZ);
    g.rotation.set(rotX, rotY, 0.1);

    if (progress >= 1) {
      clearInterval(curInhalerIv);
      curInhalerIv = null;
      if (curInhaler === g) {
        camera.remove(g);
        curInhaler = null;
      }
      if (typeof vm !== 'undefined') vm.visible = oldVmVis;
    }
  }, 16);
}

// ---- taking one ----
function useSub(id) {
  const D = SUBS[id]; if (!D || !(S.inv[id] > 0)) return false;
  if (!subsOn()) { log('Substances are switched off. Turn them on in Settings → Game.'); SFX.hit(); return true; }
  S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; buffs()['sub_' + id] = Date.now() + D.sec * 1000; S.lastSub = id; markDirty();
  playInhalerAnim(id);
  try { burst(player.pos.clone().add(V(0, 1.3, 0)), D.col, 16, 2.5); } catch (_) {} SFX.quest();
  toast(D.name.toUpperCase(), D.desc.split('. ').slice(1).join('. ').replace(/\.$/, '') || D.desc, 2.4);
  if (D.trip && Math.random() < D.trip) setTimeout(() => startTrip(40 + Math.random() * 50), 2500 + Math.random() * 4000);
  subChip(); invQuickRender(); return true;
}
window.playInhalerAnim = playInhalerAnim;
window.getCurInhaler = () => curInhaler;
window.useSub = useSub;
window.SUBS = SUBS;
{ const _ou = outUseItem; outUseItem = function (id) { if (SUBS[id]) return useSub(id); return _ou(id); }; }
// hide them from the bag while the system is off (they stay saved)
{ const _ik = invKeys; invKeys = function () { const ks = _ik(); return subsOn() ? ks : ks.filter(k => !SUBS[k.slice(2)]); }; }

// ---- shops ----
function subStoreRows(render) {
  if (!subsOn()) return [];
  return Object.keys(SUBS).filter(id => SUBS[id].legal).map(id => { const D = SUBS[id]; return [id, S.inv[id] || 0, `${D.price} cr`, [['Buy', () => { if (S.cr < D.price) return; if (invRoomFor(id) < 1) { invFullNote(id); return; } S.cr -= D.price; S.inv[id] = (S.inv[id] || 0) + 1; SFX.coin(); markDirty(); render(); }, S.cr < D.price]]]; });
}
const MCK_SUBS = ['voidspice', 'neondust'];
// sellers mark illegal product up hard and only carry a few of each, restocked once a game day: cooking your own should pay
const DEAL_MARKUP = 3, DEAL_STOCK = 3;
const dealPrice = id => SUBS[id].legal ? SUBS[id].price : SUBS[id].price * DEAL_MARKUP;
function dealStock(who, id) { S.dealStock = S.dealStock || {}; const day = Math.floor(Date.now() / 1000 / DAY_LEN), k = who + ':' + id, e = S.dealStock[k];
  if (!e || e.day !== day) S.dealStock[k] = { day, n: SUBS[id].legal ? 9 : DEAL_STOCK }; return S.dealStock[k]; }
function openSubShop(role, who, ids, back) {
  openDlg(role, who); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `Cash only, no questions, and I don't carry much. You have ${S.cr.toLocaleString()} cr.`;
    itemRows(rows, ids.map(id => { const st = dealStock(who, id).n; return [id, S.inv[id] || 0, st > 0 ? `${dealPrice(id)} cr ▲ · ${st} left` : 'sold out · back tomorrow', st > 0 ? [['Buy', () => buy(id, 1)]] : []]; })); };
  const buy = (id, n) => { const st = dealStock(who, id); if (st.n < n) { SFX.hit(); log('They\'re out. Come back tomorrow.'); return; } const p = dealPrice(id) * n; if (S.cr < p) { SFX.hit(); log('Not enough credits.'); return; } if (invRoomFor(id) < n) { invFullNote(id); return; }
    S.cr -= p; st.n -= n; S.inv[id] = (S.inv[id] || 0) + n; S.invT = S.invT || {}; S.invT['i:' + id] = Date.now(); SFX.coin(); log(`+${n} ${SUBS[id].name}`, 'loot'); markDirty(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
// Madame Vex: every illegal one but Blackout, for outlaws
BM_STOCK.forEach(it => { if (it.id === 'voidspice') it.show = () => !subsOn(); });
for (const id of ['voidspice', 'neondust', 'glimmer', 'redhaze']) BM_STOCK.push({ id, name: SUBS[id].name, price: SUBS[id].price * 3, desc: SUBS[id].desc, show: subsOn, buy: () => { S.inv[id] = (S.inv[id] || 0) + 1; } });

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
  try { if (typeof hudStack === 'function') hudStack(); } catch (_) {}
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
// 2.13.10: the lab has stations (1 to 3), each brewing its own recipe, and a shelf that keeps finished doses per recipe.
// Switching a station's recipe moves its finished doses to the shelf, so nothing is ever lost; Collect empties shelf + stations into your bag.
const LAB_STATION_COST = [null, { cr: 5000, circuit: 4 }, { cr: 12000, circuit: 8, crystal: 4 }];
function labS() { let L = S.lab;
  if (!L) L = S.lab = { st: [{ r: 'voidspice', t: Date.now(), n: 0 }], shelf: {} };
  if (!L.st) { L = S.lab = { st: [{ r: L.r || 'voidspice', t: L.t || Date.now(), n: L.n || 0 }], shelf: {} }; }
  L.shelf = L.shelf || {}; return L; }
function labTick() { // each station brews what the time and materials allow; no materials means that batch waits
  if (!roomLvl('lab')) return; const L = labS(), now = Date.now(), ev = labEvery();
  for (const T of L.st) { const need = LAB_RECIPES[T.r] || {};
    while (now - T.t >= ev && T.n < labMax()) { if (!costOk(need)) { T.t = now; break; } costPay(need); T.n++; T.t += ev; }
    if (T.n >= labMax()) T.t = now; }
}
setInterval(() => { try { const O = outS(), had = !!O.lab; O.lab = roomLvl('lab') > 0; labTick();
  if (O.lab && !O.bounty) { O.bounty = 300 + O.rep * 10; O.growT = O.obT = Date.now(); O.huntT = Date.now() + 90000; if (!had) log('The Marshals heard about your Lab. You stay Wanted while it runs.', 'loot'); try { outPush(); } catch (_) {} }
  if (had && !O.lab && O.bounty && outTier() < 3) { O.bounty = 0; O.obT = 0; try { outPush(); } catch (_) {} } } catch (_) {} }, 5000);
// where the batch is at: ready, waiting on materials, full, or counting down to the next dose
const labMm = ms => { const t = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
function labStation(T) { const need = LAB_RECIPES[T.r] || {}, ev = labEvery();
  if (T.n >= labMax()) return { text: `Full: ${T.n} ready`, k: 1, short: 'FULL' };
  if (!costOk(need)) return { text: `Stopped: needs ${costLabel(need)}`, k: 0, short: 'needs ' + costLabel(need) };
  const left = ev - (Date.now() - T.t); return { text: `Next in ${labMm(left)}${T.n ? ` · ${T.n} ready` : ''}`, k: clamp(1 - left / ev, 0, 1), short: `${labMm(left)}${T.n ? ' · ' + T.n : ''}` }; }
function labReady() { const L = labS(); let n = 0; for (const k in L.shelf) n += L.shelf[k]; for (const T of L.st) n += T.n; return n; }
function labState() { const L = labS(), r = labReady(), s0 = labStation(L.st[0]); return { text: s0.text, k: s0.k, short: (r ? r + ' ready · ' : '') + (L.st.length > 1 ? L.st.length + ' stations' : s0.short) }; }
function labCollect() { const L = labS(); let got = 0, full = false;
  const take = (id, n) => { const k = Math.min(n, invRoomFor(id)); if (k < n) full = true; if (k > 0) { S.inv[id] = (S.inv[id] || 0) + k; got += k; } return k; };
  for (const id in L.shelf) { L.shelf[id] -= take(id, L.shelf[id]); if (!L.shelf[id]) delete L.shelf[id]; }
  for (const T of L.st) { if (!T.n) continue; const had = T.n >= labMax(); T.n -= take(T.r, T.n); if (had) T.t = Date.now(); }
  if (full) invFullNote(Object.keys(L.shelf)[0] || L.st[0].r); if (got) { SFX.coin(); log(`Collected ${got} dose${got > 1 ? 's' : ''} from the Lab`, 'loot'); } markDirty(); }
function openLab() {
  labTick(); const L = labS(); openDlg('Lab', `Level ${roomLvl('lab')} · ${L.st.length} station${L.st.length > 1 ? 's' : ''}`); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.dataset.one = '1';
  const bars = [];
  const tick = () => { if (!rows.isConnected) { clearInterval(iv); return; } labTick(); bars.forEach(([T, txt, fill]) => { const st = labStation(T); txt.textContent = st.text; fill.style.width = Math.round(st.k * 100) + '%'; });
    const c = [...$('dlgActs').children].find(b => /^Collect/.test(b.textContent)); if (c) { const n = labReady(); c.textContent = 'Collect ' + n; c.disabled = !n; } };
  const render = () => { labTick(); const keep = rows.scrollTop; rows.textContent = ''; bars.length = 0;
    const shelf = Object.entries(L.shelf).filter(([, n]) => n > 0).map(([id, n]) => `${n} ${SUBS[id].name}`).join(', ');
    $('dlgLine').textContent = `Each station brews one dose every ${Math.round(labEvery() / 60000)} min and holds ${labMax()}. Switching a recipe keeps what's done on the shelf.` + (shelf ? ` Shelf: ${shelf}.` : '');
    L.st.forEach((T, si) => {
      const hd = document.createElement('div'); hd.style.cssText = 'margin:8px 2px 2px;font-weight:700;color:#c8a8ff;display:flex;flex-direction:column;gap:3px';
      const top = document.createElement('span'); top.textContent = `STATION ${si + 1} · ${SUBS[T.r].name}`; const txt = document.createElement('span'); txt.style.cssText = 'font:600 13px var(--mono,monospace);color:#d8c8ff';
      const bar = document.createElement('div'); bar.style.cssText = 'height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden'; const fill = document.createElement('i'); fill.style.cssText = 'display:block;height:100%;width:0;background:linear-gradient(90deg,#8f6ad0,#ff6aa8)'; bar.appendChild(fill);
      const eff = document.createElement('span'); eff.style.cssText = 'font:500 12.5px/1.35 system-ui,sans-serif;color:#b9b0d0;white-space:normal'; eff.textContent = 'Effects: ' + SUBS[T.r].desc + ' Costs ' + costLabel(LAB_RECIPES[T.r]) + ' a dose.';
      hd.append(top, eff, txt, bar); rows.appendChild(hd); bars.push([T, txt, fill]);
      const r = document.createElement('div'); r.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 4px';
      for (const id of Object.keys(LAB_RECIPES)) { const b = document.createElement('button'); b.className = 'pbtn' + (T.r === id ? ' go' : ''); b.style.padding = '5px 9px'; b.textContent = SUBS[id].name; b.title = SUBS[id].desc + ' ' + costLabel(LAB_RECIPES[id]) + ' a dose';
        b.addEventListener('click', () => { if (T.r === id) return; if (T.n) { L.shelf[T.r] = (L.shelf[T.r] || 0) + T.n; log(`${T.n} ${SUBS[T.r].name} moved to the lab shelf`, 'loot'); } T.r = id; T.n = 0; T.t = Date.now(); markDirty(); SFX.ui(); render(); });
        r.appendChild(b); }
      rows.appendChild(r); });
    const nx = LAB_STATION_COST[L.st.length];
    if (nx) { const r = document.createElement('div'); r.className = 'rowi'; r.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap'; const nm = document.createElement('span'); nm.style.flex = '1 1 180px'; nm.textContent = `Add station ${L.st.length + 1}: brews another recipe at the same time`; const mt = document.createElement('span'); mt.className = 'meta'; mt.textContent = costLabel(nx);
      const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Build'; b.disabled = !costOk(nx); b.addEventListener('click', () => { costPay(nx); L.st.push({ r: 'voidspice', t: Date.now(), n: 0 }); SFX.level(); log('New lab station built.', 'loot'); markDirty(); openLab(); }); r.append(nm, mt, b); rows.appendChild(r); }
    tick(); if (keep) rows.scrollTop = keep; };
  const iv = setInterval(tick, 1000);
  $('dlgActs').before(rows);
  acts([['Collect ' + labReady(), () => { labCollect(); render(); }, true, !labReady()],
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
  { const sg = labelSprite(768, 72); sg.scale.set(3.6, 0.34, 1); sg.position.set(vat.position.x, 2.2, vat.position.z); props.add(sg); let last = '', nt = 0;
    levelAnims.push(t => { if (t < nt) return; nt = t + 1; labTick(); const v = labState().short; if (v !== last) { last = v; drawPlate(sg, labS().st.length > 1 ? 'LAB' : SUBS[labS().st[0].r].name, v, '#c8a8ff', null); } }); }
  levelAnims.push(t => { liq.position.y = 1.1 + Math.sin(t * 3) * 0.02; flasks.forEach((f, i) => { f.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.08); }); pl.intensity = 0.7 + Math.sin(t * 4) * 0.15; });
  term(cx + s.side * 0.5, s.z0 + 0.6, '#c8a8ff', 'Lab console (brew, collect)', openLab, 0);
}
// start screen: a checkbox so players pick before they begin (2.12.4)
{ const note = $('saveNote'); if (note) { const l = document.createElement('label'); l.id = 'subsPick'; l.style.cssText = 'display:flex;align-items:center;gap:8px;width:min(100%,290px);font-size:14px;color:var(--dim);cursor:pointer;text-align:left';
  const c = document.createElement('input'); c.type = 'checkbox'; c.id = 'subsChk'; c.checked = !!PREFS.subs; c.style.cssText = 'width:18px;height:18px;accent-color:#ffd36a;flex:none';
  const t = document.createElement('span'); t.innerHTML = 'Drugs &amp; drinks in the game <small>(you can change this later in Settings)</small>';
  c.addEventListener('change', () => { PREFS.subs = c.checked; savePrefs(); try { renderSettings(); subChip(); invQuickRender(); } catch (_) {} SFX.ui(); });
  l.append(c, t); note.before(l); } }
