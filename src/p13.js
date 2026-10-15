// =================== 2.13.7: the crew quarters door in the ship hall ===================
// A sliding door at the far end of the hall, port side, signed CREW QUARTERS. It opens for anyone
// who walks up, and now and then a crew member steps out, wanders the hall, and heads back in.
const CREWQ_LINES = ["Off shift, Captain. Don't tell Ruiz I was napping.", "Bunks are tight but the pillows are real. Mostly.", "Somebody keeps eating the good rations. I have a list of suspects.", "Quiet in there for once. Pell's finally asleep."];
{ const _dh = dressHall; dressHall = function () { _dh.apply(this, arguments);
  try { const { Lz } = hallLayout(), z = Math.floor((Lz - 2.6) / 3) * 3 + 1.5, x = -1.82, dw = 1.1, dh = 2.2;
    // clear the stretch of port wall the door goes on (crates, lockers or an extinguisher may sit there), between two hull ribs
    const small = o => { if (!o.isMesh) return true; const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); const v = g.boundingBox.getSize(new THREE.Vector3()); return Math.max(v.x, v.z) < 1.6 && v.y < 2.4; };
    for (const o of props.children.slice()) if (o.position.x < -1.0 && o.position.x > -1.95 && Math.abs(o.position.z - z) < 0.95 && o.position.y < 2.6 && small(o)) props.remove(o);
    for (let i = BOXES.length - 1; i >= 0; i--) { const b = BOXES[i]; if (b[0] < -1.0 && b[0] > -1.95 && Math.abs(b[1] - z) < 1.2 && b[3] < 2) BOXES.splice(i, 1); }
    for (let i = CIRCLES.length - 1; i >= 0; i--) { const c = CIRCLES[i]; if (c[0] < -1.0 && Math.abs(c[1] - z) < 1.2) CIRCLES.splice(i, 1); }
    const frameM = toonNS('#2a2c32', 'hull'), doorM = toonNS('#5d636c', 'hull');
    part(levelGroup, B(0.12, 0.16, dw + 0.32), frameM, x + 0.02, dh + 0.08, z);
    for (const s of [-1, 1]) part(levelGroup, B(0.12, dh + 0.16, 0.16), frameM, x + 0.02, (dh + 0.16) / 2, z + s * (dw / 2 + 0.08));
    part(levelGroup, B(0.02, dh, dw), new THREE.MeshBasicMaterial({ color: '#0a0c10' }), x - 0.025, dh / 2, z);
    // two leaves that part sideways
    const leaves = [-1, 1].map(s => { const l = new THREE.Group(); part(l, B(0.06, dh, dw / 2), doorM, 0, dh / 2, 0); part(l, B(0.065, 0.06, dw / 2 - 0.1), glow('#4fd2ff'), 0, 1.3, 0); part(l, B(0.065, dh - 0.3, 0.04), frameM, 0, dh / 2, -s * (dw / 4 - 0.04)); l.position.set(x, 0, z + s * dw / 4); levelGroup.add(l); return { l, s }; });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: signTex('CREW QUARTERS', '#16202c', '#ffd36a') })); sg.position.set(x + 0.06, dh + 0.42, z); sg.rotation.y = Math.PI / 2; levelGroup.add(sg);
    const lamp = part(levelGroup, B(0.05, 0.08, 0.3), glow('#6fdc5a'), x + 0.06, dh + 0.14, z);
    INTERACTS.push({ x: -1.1, z, r: 1.2, label: 'Crew quarters', fn: () => { openDlg('Crew quarters', 'Crew only'); $('dlgLine').textContent = "The crew's bunks, lockers and a very contested ration cabinet. Best to let them have their space, Captain."; acts([['Close', closeDlg, true]]); } });
    // one off-shift crew member who comes and goes through the door
    const o = buildChar(() => recolor(makeTrooper(), { '#6f7a3e': '#5a3a6a' }), 'trooper'); blob(o, 0.4); o.visible = false; levelGroup.add(o);
    const C = { st: {}, mode: 'in', t: 8 + Math.random() * 12, tgt: 0, talk: 0 }, home = V(-1.5, 0, z);
    INTERACTS.push({ get x() { return o.visible ? o.position.x : 99; }, get z() { return o.position.z; }, r: 1.5, label: 'Talk to Cook Vasquez', fn: () => { C.talk = 6; o.rotation.y = Math.atan2(player.pos.x - o.position.x, player.pos.z - o.position.z); openDlg('Ship cook', 'Cook Vasquez'); $('dlgLine').textContent = CREWQ_LINES[Math.floor(Math.random() * CREWQ_LINES.length)]; acts([['Carry on', closeDlg, true]]); } });
    let open = 0, last = 0;
    levelAnims.push(t => { const dt = Math.min(0.05, t - last || 0.016); last = t;
      const near = p => Math.hypot(p.x - (x + 0.6), p.z - z) < 1.7;
      let want = near(player.pos) || C.mode === 'out1' || C.mode === 'in1';
      if (!want) for (const m of MOVERS) if (m[0] && m[0].visible && near(m[0].position)) { want = true; break; }
      open += ((want ? 1 : 0) - open) * Math.min(1, dt * 7);
      for (const { l, s } of leaves) l.position.z = z + s * (dw / 4 + open * dw / 2 * 0.92);
      lamp.material.color.set(open > 0.5 ? '#ffd36a' : '#6fdc5a');
      if (C.talk > 0) { C.talk -= dt; animRig(o, C.st, dt, t); return; }
      const walk = (tx, tz, sp) => { const dx = tx - o.position.x, dz = tz - o.position.z, d = Math.hypot(dx, dz); if (d < 0.08) return true; const k = Math.min(d, sp * dt); o.position.x += dx / d * k; o.position.z += dz / d * k; o.rotation.y = Math.atan2(dx, dz); animRig(o, C.st, dt, t); return false; };
      if (C.mode === 'in') { if ((C.t -= dt) <= 0) { C.mode = 'out1'; C.t = 0.6; o.position.set(x + 0.15, 0, z); o.visible = true; } return; }
      if (C.mode === 'out1') { if ((C.t -= dt) > 0) return; if (walk(home.x, home.z, 1.1)) { C.mode = 'stroll'; C.tgt = 1 + Math.random() * Math.max(1, Lz - 5); } return; }
      if (C.mode === 'stroll') { if (walk(-0.75, C.tgt, 1.1)) { C.mode = 'idle'; C.t = 3 + Math.random() * 6; } return; }
      if (C.mode === 'idle') { animRig(o, C.st, dt, t); if ((C.t -= dt) <= 0) C.mode = 'back'; return; }
      if (C.mode === 'back') { if (walk(home.x, home.z, 1.1)) C.mode = 'in1'; return; }
      if (C.mode === 'in1') { if (walk(x + 0.15, z, 1.1)) { o.visible = false; C.mode = 'in'; C.t = 25 + Math.random() * 35; } return; }
    });
  } catch (e) { console.warn('crew quarters', e); }
}; }

// ---- Settings → Game: planet name tags in space (off by default) ----
{ const anchor = $('setMusic').previousElementSibling, l = document.createElement('span'); l.textContent = 'Planet name tags'; const b = document.createElement('button'); b.className = 'pbtn'; b.id = 'setPlanetTags';
  b.addEventListener('click', () => { PREFS.planetTags = !PREFS.planetTags; savePrefs(); renderSettings(); SFX.ui(); }); anchor.before(l, b);
  SET_OF.setPlanetTags = 'game'; }
{ const _rs = renderSettings; renderSettings = function () { _rs(); const b = $('setPlanetTags'); if (b) b.textContent = PREFS.planetTags ? 'On' : 'Off'; }; }
renderSettings(); try { showSetTab(setTab); } catch (_) {}

// ---- hold to heal / hold to repair: keeps topping up quickly while held, stops at full, never wastes a kit ----
// A medkit is 50 health. Opening one puts its 50 into a pool; holding heal draws from the pool and only opens
// another medkit when the pool runs dry, so whatever isn't needed stays banked for next time.
// In flight the button becomes REPAIR: hull points cost credits, paid point by point, so nothing is overspent.
const HOLD = { on: false, mode: null, min: 0, cr: 0, full: false };
const REPAIR_CR = 2;
function holdStart(tap) { if (state !== 'play' || dlgOpen) return; HOLD.mode = LEVEL && LEVEL.fly ? 'rep' : 'heal'; HOLD.min = tap ? 50 : 0; HOLD.on = !tap; HOLD.cr = 0; HOLD.full = false;
  if (player.hp >= maxHp()) { toast(HOLD.mode === 'rep' ? 'HULL INTACT' : 'FULL HEALTH', '', 0.9); HOLD.mode = null; return; }
  if (HOLD.mode === 'heal' && !(S.medPool > 0) && (S.inv.medkit || 0) < 1) { toast('NO MEDKITS', 'Buy them at a general store or clinic', 1.6); SFX.block && SFX.block(); HOLD.mode = null; return; }
  if (HOLD.mode === 'rep' && S.cr < REPAIR_CR) { toast('NO CREDITS', 'Repairs cost ' + REPAIR_CR + ' cr per hull point', 1.6); HOLD.mode = null; return; }
  SFX.ui(); }
function holdEnd() { HOLD.on = false; }
function holdTick(dt) {
  if (!HOLD.mode) return; if (state !== 'play' || player.hp <= 0) { HOLD.mode = null; return; }
  if (!HOLD.on && HOLD.min <= 0) { HOLD.mode = null; return; }
  const mx = maxHp(); if (player.hp >= mx) { toast(HOLD.mode === 'rep' ? 'HULL REPAIRED' : 'FULL HEALTH', HOLD.mode === 'heal' && S.medPool > 0 ? Math.round(S.medPool) + ' left in the open medkit' : '', 1); HOLD.mode = null; markDirty(); return; }
  let amt = Math.min(mx - player.hp, Math.max(70, mx * 0.9) * dt);
  if (HOLD.mode === 'heal') { S.medPool = S.medPool || 0;
    while (S.medPool < amt && (S.inv.medkit || 0) > 0) { S.inv.medkit--; if (!S.inv.medkit) delete S.inv.medkit; S.medPool += 50; }
    amt = Math.min(amt, S.medPool); if (amt <= 0) { toast('OUT OF MEDKITS', '', 1.2); HOLD.mode = null; markDirty(); return; }
    S.medPool -= amt; player.hp = Math.min(mx, player.hp + amt); if (Math.random() < dt * 14) burst(player.pos.clone().add(V(0, 1.2, 0)), '#5dff9a', 3, 2);
  } else {
    HOLD.cr += amt * REPAIR_CR; const pay = Math.floor(HOLD.cr); if (pay > S.cr) { amt = S.cr / REPAIR_CR; HOLD.cr = 0; S.cr = 0; player.hp = Math.min(mx, player.hp + amt); toast('OUT OF CREDITS', '', 1.2); HOLD.mode = null; markDirty(); return; }
    S.cr -= pay; HOLD.cr -= pay; player.hp = Math.min(mx, player.hp + amt); if (Math.random() < dt * 10) burst(player.pos.clone().add(V(0, -1, 0)), '#ffd36a', 3, 6);
  }
  HOLD.min -= amt;
}
quickHeal = function () { holdStart(true); };
useMedkit = (function (_u) { return function () { if (S.medPool >= 50 || (S.medPool > 0 && player.hp + S.medPool >= maxHp())) { const a = Math.min(maxHp() - player.hp, S.medPool); if (a <= 0) return; S.medPool -= a; player.hp += a; log(`Used the open medkit (+${Math.round(a)} health)`); markDirty(); return; } return _u.apply(this, arguments); }; })(useMedkit);
{ const tH = $('tHeal'); tH.addEventListener('touchstart', () => { HOLD.on = true; HOLD.min = 0; }, { passive: true });
  for (const ev of ['touchend', 'touchcancel']) tH.addEventListener(ev, holdEnd); }
// the repair button sits just above Boost while flying
const tRepair = document.createElement('button'); tRepair.className = 'tbtn'; tRepair.id = 'tRepair'; tRepair.setAttribute('aria-label', 'Repair the ship'); tRepair.innerHTML = '<i>🔧</i><small>REPAIR</small>'; $('touch').appendChild(tRepair);
tRepair.style.cssText = 'display:none;position:fixed;font-size:11px;background:rgba(255,211,106,.35);flex-direction:column;align-items:center;justify-content:center;line-height:1';
tRepair.addEventListener('touchstart', e => { holdStart(false); e.preventDefault(); }, { passive: false }); for (const ev of ['touchend', 'touchcancel']) tRepair.addEventListener(ev, holdEnd);
tRepair.addEventListener('mousedown', () => holdStart(false)); addEventListener('mouseup', holdEnd);
document.head.insertAdjacentHTML('beforeend', `<style>#tHeal{touch-action:none}body.flying #tRepair{display:flex!important}#tRepair i{font-style:normal;font-size:18px}
body.flying #tFire { right: calc(env(safe-area-inset-right, 0px) + 14px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px) !important; width: 86px !important; height: 86px !important; top: auto !important; left: auto !important; }
body.flying #tBoost { right: calc(env(safe-area-inset-right, 0px) + 110px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 20px) !important; width: 72px !important; height: 72px !important; top: auto !important; left: auto !important; }
body.flying .flyCam { right: calc(env(safe-area-inset-right, 0px) + 31px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 116px) !important; top: auto !important; width: 52px !important; height: 52px !important; border-radius: 50% !important; }
#tRepair { right: calc(env(safe-area-inset-right, 0px) + 96px); bottom: calc(env(safe-area-inset-bottom, 0px) + 108px); width: 52px; height: 52px; }
body.flying #ammo { display: none !important; }</style>`);
addEventListener('keydown', e => { if (e.code !== 'KeyH' || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; e.stopImmediatePropagation(); e.preventDefault(); if (!e.repeat) holdStart(false); }, true);
addEventListener('keyup', e => { if (e.code === 'KeyH') holdEnd(); }, true);
{ const _st = step; step = function (dt) { _st(dt); try { holdTick(dt);
  if (typeof SCOCK !== 'undefined' && SCOCK.vb) SCOCK.vb.classList.add('flyCam');
  tRepair.style.opacity = player.hp < maxHp() ? 1 : 0.45; } catch (e) { console.warn('hold', e); } }; }

// ---- Zeltac: Brakka's shipwright bay. A ship up on stands with a panel open, a crane, a tool cart,
// and Brakka at work on it: he leans in, the welder flares and sparks fly. Talk to him for ship upgrades. ----
{ const _zb = LEVELS.zeltac.build; LEVELS.zeltac.build = function () { _zb.apply(this, arguments);
  try { const cx = 24.5, cz = 6, Y = 0.02;
    // the bay floor: a dark pad with hazard striping around the edge
    part(props, B(10, 0.04, 14), '#2a2c32', cx, Y, cz);
    for (let i = 0; i < 12; i++) { const k = i % 2 ? '#ffd36a' : '#1e1c22'; part(props, B(0.83, 0.05, 0.3), k, cx - 4.6 + i * 0.83 + 0.4, Y + 0.01, cz - 7); part(props, B(0.83, 0.05, 0.3), k, cx - 4.6 + i * 0.83 + 0.4, Y + 0.01, cz + 7); }
    for (let i = 0; i < 16; i++) part(props, B(0.3, 0.05, 0.875), i % 2 ? '#ffd36a' : '#1e1c22', cx - 5, Y + 0.01, cz - 7 + i * 0.875 + 0.44);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: signTex('SHIPWRIGHT BAY', '#2a1e0a', '#ffd36a') })); sg.position.set(29.6, 5.4, cz); sg.rotation.y = -Math.PI / 2; props.add(sg);
    // the ship on its stands, nose toward the plaza, one engine panel swung open
    const ship = makeStarship('#c9a43a'); ship.scale.setScalar(0.62); ship.position.set(cx + 0.6, 1.55, cz); ship.rotation.y = Math.PI / 2; props.add(ship);
    for (const [dx, dz] of [[-2.2, -1.6], [-2.2, 1.6], [2.4, 0]]) { part(props, Cy(0.14, 0.2, 1.2, 8), '#5d636c', cx + 0.6 + dx, 0.6, cz + dz); part(props, B(0.7, 0.08, 0.7), '#3a3d44', cx + 0.6 + dx, 0.06, cz + dz); }
    const panel = part(props, B(0.05, 0.75, 1.1), '#c9a43a', cx - 0.5, 2.2, cz - 0.6); panel.rotation.x = -0.9;
    part(props, B(0.04, 0.55, 0.9), new THREE.MeshBasicMaterial({ color: '#141418' }), cx - 0.52, 1.75, cz - 0.6);
    box(cx + 0.6, cz, 3.6, 3.4);
    // overhead crane with a hook and an engine block on the chain
    part(props, B(0.3, 0.3, 13), '#c9a43a', cx + 3.8, 7.2, cz); for (const s of [-1, 1]) part(props, B(0.3, 7.2, 0.3), '#5d636c', cx + 3.8, 3.6, cz + s * 6.3);
    part(props, B(0.6, 0.4, 0.6), '#3a3d44', cx + 3.8, 6.85, cz + 2.4); part(props, Cy(0.03, 0.03, 3.2, 4), '#2a2c32', cx + 3.8, 5.05, cz + 2.4);
    part(props, B(0.9, 0.7, 1.2), '#5d636c', cx + 3.8, 3.1, cz + 2.4); part(props, Cy(0.28, 0.28, 0.3, 10), glow('#ff7a3a'), cx + 3.8, 3.1, cz + 3.05, Math.PI / 2, 0, 0);
    // tool cart and parts crates
    { const g = new THREE.Group(); part(g, B(1.2, 0.08, 0.7), '#c8402f', 0, 0.9, 0); part(g, B(1.2, 0.08, 0.7), '#c8402f', 0, 0.35, 0); for (const [x, z] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) part(g, B(0.05, 0.9, 0.05), '#3a3d44', x, 0.45, z);
      part(g, B(0.4, 0.15, 0.25), '#2a2c32', -0.3, 1.02, 0); part(g, B(0.5, 0.04, 0.06), '#9aa1aa', 0.25, 0.97, -0.1, 0, 0.4, 0); part(g, Cy(0.08, 0.08, 0.35, 8), '#4fa8ff', 0.3, 1.1, 0.15);
      g.position.set(cx - 3.6, 0, cz + 4.6); props.add(g); box(cx - 3.6, cz + 4.6, 0.65, 0.4); }
    part(props, B(1.1, 0.9, 1.1), toonNS('#8a6a4a', 'wood'), cx + 3.4, 0.45, cz - 5.6); part(props, B(0.8, 0.6, 0.8), toonNS('#5a7a9a', 'hull'), cx + 3.4, 1.2, cz - 5.5, 0, 0.3, 0); box(cx + 3.4, cz - 5.6, 0.6, 0.6);
    // Brakka at work: lean in, weld, step back
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#9fe8ff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flare.scale.setScalar(0.01); flare.position.set(cx - 0.55, 1.75, cz - 0.6); levelGroup.add(flare);
    let last = 0; const W = { t: 0 };
    levelAnims.push(t => { const dt = Math.min(0.05, t - last || 0.016); last = t; const n = npcObjs.brakka; if (!n || !n.obj) return; const o = n.obj;
      const talking = Math.hypot(player.pos.x - o.position.x, player.pos.z - o.position.z) < 3;
      if (talking) { o.rotation.x *= 0.8; flare.scale.setScalar(0.01); return; }
      W.t += dt; const c = W.t % 6, weld = c > 1.2 && c < 4.2;
      o.rotation.y = Math.PI / 2 + Math.sin(t * 0.7) * 0.15; o.rotation.x = (weld ? 0.18 : 0.02) * 0.4 + o.rotation.x * 0.6;
      if (weld) { flare.scale.setScalar(0.25 + Math.random() * 0.45); if (Math.random() < dt * 18) burst(flare.position, Math.random() < 0.5 ? '#ffd36a' : '#ff9a3c', 3, 4); }
      else flare.scale.setScalar(0.01);
    });
  } catch (e) { console.warn('shipwright bay', e); }
}; }

// ---- dialogs: no more pages. The header, the picture and the buttons stay put; only the list scrolls ----
const PG2 = { key: '', two: false };
pageRows = function () {
  const rows = $('shopRows'), old = $('pgBar'); if (old) old.remove();
  if (!rows || $('dlg').hidden) { if ($('fltBar')) $('fltBar').remove(); return; }
  const all = [...rows.children].filter(c => c.id !== 'pgBar');
  rowFilter(rows, all);
  rows.classList.remove('paged'); all.forEach(c => c.classList.remove('pgOff'));
  const kids = all.filter(c => !c.classList.contains('fltOff'));
  // decide one or two columns once per dialog (and per screen size), so tapping a row never flips the layout back and forth;
  // the grid check looks at the list without our own two-column class, which used to make it alternate on every redraw
  const had = rows.classList.contains('cols2s'); rows.classList.remove('cols2s');
  const key = $('dlgName').textContent + '|' + $('dlgRole').textContent + '|' + innerWidth + 'x' + innerHeight;
  let two; if (PG2.key === key && kids.length > 3) two = PG2.two;
  else { const wordy = kids.some(c => (c.textContent || '').length > 64); two = kids.length > 3 && !rows.dataset.one && innerHeight < 520 && innerWidth > 640 && !wordy && !rows.querySelector('canvas') && getComputedStyle(rows).display !== 'grid'; if (kids.length > 3) { PG2.key = key; PG2.two = two; } }
  rows.classList.toggle('cols2s', two); void had;
  const keepTop = rows.scrollTop; rows.style.maxHeight = ''; const dlg = $('dlg'), rest = dlg.scrollHeight - rows.offsetHeight, mh = parseFloat(getComputedStyle(dlg).maxHeight) || innerHeight;
  const room = Math.max(110, Math.min(innerHeight * 0.94 - rest - 24, mh - rest - 12));
  if (rows.scrollHeight > room + 2) { rows.style.maxHeight = room + 'px'; rows.classList.add('scrollList'); } else rows.classList.remove('scrollList');
  if (keepTop) rows.scrollTop = keepTop;
};
document.head.insertAdjacentHTML('beforeend', `<style>
#shopRows.scrollList { overflow-y: auto !important; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; scrollbar-width: thin; padding-right: 4px; mask-image: linear-gradient(#000 calc(100% - 18px), transparent); }
#shopRows.cols2s { display: grid !important; grid-template-columns: 1fr 1fr; column-gap: 14px; align-items: start; }
#shopRows.cols2s > div:not(.rowi) { grid-column: 1 / -1; }
</style>`);

// ---- backpack on a sideways phone: the item panel gets two columns (picture left, stats right) and its buttons stay pinned ----
document.head.insertAdjacentHTML('beforeend', `<style>
@media (max-height:560px) and (min-width:600px){
 #inv .det{width:min(640px,72vw);display:grid;grid-template-columns:40% 1fr;grid-auto-rows:min-content;column-gap:14px;align-content:start;padding-bottom:0}
 #inv .det > *{grid-column:2;min-width:0}
 #inv .det > .big{grid-column:1;grid-row:1 / span 12;height:min(220px,calc(100vh - 40px));position:sticky;top:0;margin:0}
 #inv .det > .close{position:absolute;right:8px;top:8px;z-index:2}
 #inv .det > h3{padding-right:44px}
 #inv .det > .acts{position:sticky;bottom:0;background:#1b1d21;padding:6px 0 8px;margin-top:4px;box-shadow:0 -8px 12px #1b1d21}
 #inv .det table{font-size:12px}#inv .det td{padding:2px 0}#inv .det td:last-child{font-size:13px}#inv .det p{margin:3px 0;font-size:12px}
}
</style>`);

// ---- touch HUD tidy (2.13.11): the USE button joins the right-hand button column, and the gun/ammo box moves next to the HP panel so FIRE never covers it ----
const HUD_COL = ['tHeal', 'tNade', 'tMelee', 'tReload'];
function hudStack() {
  const sub = $('tSub'), am = $('ammo'), vit = $('vitals'), B = document.body.classList;
  const touch = matchMedia('(pointer: coarse)').matches, special = B.contains('driving') || B.contains('flying');
  if (sub) { const col = HUD_COL.map(id => $(id)).filter(e => { if (!e || !e.offsetParent) return false; const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05; });
    if (!sub.hidden && col.length && !special) { const rs = col.map(e => e.getBoundingClientRect()), top = rs.reduce((a, r) => r.top < a.top ? r : a), gap = rs.length > 1 ? Math.abs(rs[0].top - rs[1].top) : top.height + 5;
      sub.style.setProperty('left', 'auto', 'important'); sub.style.setProperty('bottom', 'auto', 'important');
      const cr = parseFloat(sub.style.right) || 0, ct = parseFloat(sub.style.top) || 0; sub.style.setProperty('right', cr + 'px', 'important'); sub.style.setProperty('top', ct + 'px', 'important');
      const r = sub.getBoundingClientRect(), k = r.width / (sub.offsetWidth || 1) || 1, mp = $('map'), mb = mp && mp.offsetParent ? mp.getBoundingClientRect().bottom + 20 : 0, side = top.top - gap < mb, dx = (top.left + top.width / 2 - (side ? gap : 0)) - (r.left + r.width / 2), dy = (side ? top.top : top.top - gap) - r.top;
      if (Math.abs(dx) > 1) sub.style.setProperty('right', Math.round(cr - dx / k) + 'px', 'important'); if (Math.abs(dy) > 1) sub.style.setProperty('top', Math.round(ct + dy / k) + 'px', 'important'); }
    else ['right', 'left', 'top', 'bottom'].forEach(k => sub.style.removeProperty(k)); }
  if (am && vit) { const v = vit.getBoundingClientRect(), w = am.offsetWidth, menu = $('pullTab'), lim = menu && menu.offsetParent ? menu.getBoundingClientRect().left - 8 : innerWidth * 0.5;
    if (touch && !special && v.width && v.right + 10 + w <= lim) { am.style.setProperty('right', 'auto', 'important'); am.style.textAlign = 'left';
      const cur = parseFloat(am.style.left) || 0; am.style.setProperty('left', cur + 'px', 'important'); const r = am.getBoundingClientRect(), k = r.width / (am.offsetWidth || 1) || 1, want = v.right + 10;
      if (Math.abs(r.left - want) > 1) am.style.setProperty('left', Math.round(cur + (want - r.left) / k) + 'px', 'important'); }
    else { am.style.removeProperty('left'); am.style.removeProperty('right'); am.style.textAlign = ''; } }
}
setInterval(() => { try { if (state === 'play') hudStack(); } catch (_) {} }, 500);
addEventListener('resize', () => setTimeout(hudStack, 100));
// ---- menu icons drawn from the game's own 3D models (2.13.11): rendered once into little transparent pictures, emoji stay as the fallback ----
const MENU_ICONS = { tcShip: () => makeStarship(), tcVeh: () => makeBattleCar('#d23a2a'), tcBag: () => makeSalvageCrate(), tcJournal: () => makeBeacon(), tcSocial: () => makeTrooper(), tcSet: () => makeDroid() };
function menuIcons() {
  let R; try { R = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); } catch (_) { return; }
  R.setSize(128, 128, false); R.setClearColor(0x000000, 0); R.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.01, 1000);
  sc.add(new THREE.AmbientLight(0xffffff, 0.75)); const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(2, 4, 3); sc.add(sun);
  for (const id in MENU_ICONS) { const b = $(id); if (!b) continue;
    try { const o = MENU_ICONS[id](); o.traverse(c => { if (c.isSprite || c.isPoints) c.visible = false; }); sc.add(o); o.updateMatrixWorld(true);
      const box = new THREE.Box3(); o.traverse(c => { if (!c.isMesh || !c.visible) return; let v = true; for (let q = c.parent; q; q = q.parent) if (!q.visible) v = false; const m = c.material; if (!v || (m && (m.blending === THREE.AdditiveBlending || (m.transparent && m.opacity < 0.5)))) return; box.expandByObject(c); }); const sp = box.getBoundingSphere(new THREE.Sphere()), d = sp.radius / Math.sin(THREE.MathUtils.degToRad(15)) * 1.02;
      cam.position.copy(sp.center).add(new THREE.Vector3(1, 0.55, 1.35).normalize().multiplyScalar(d)); cam.lookAt(sp.center); cam.near = d / 50; cam.far = d * 3; cam.updateProjectionMatrix();
      R.render(sc, cam); b.style.setProperty('--ico', `url(${R.domElement.toDataURL('image/png')})`); b.classList.add('ico3d'); sc.remove(o); } catch (e) { console.warn('menu icon', id, e); } }
  R.dispose(); try { R.forceContextLoss(); } catch (_) {}
}
document.head.insertAdjacentHTML('beforeend', `<style>
#menuDrop .tabCat.ico3d::before { content: '' !important; display: block; width: min(68px, 12vh); height: min(68px, 12vh); flex: none; background: var(--ico) center / contain no-repeat; filter: drop-shadow(0 2px 3px rgba(0,0,0,.55)); }
@media (max-height: 460px) { body #tabWrap #menuDrop .tabCat { flex-direction: row !important; justify-content: flex-start !important; text-align: left !important; gap: 10px !important; padding: 6px 10px !important; overflow: hidden; }
  #menuDrop .tabCat.ico3d::before { width: min(60px, 16vh); height: min(60px, 16vh); } #menuDrop .tabCat::before { font-size: min(30px, 8vh) !important; }
  #menuDrop .tabCat small { font: 600 12px var(--ui, sans-serif) !important; letter-spacing: 0 !important; word-spacing: normal !important; text-align: left; display: -webkit-box !important; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } }
@media (max-height: 300px) { #menuDrop .tabCat small { display: none !important; } }
</style>`);
setTimeout(() => { try { menuIcons(); } catch (_) {} }, 1500);
