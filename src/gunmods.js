// =================== GUN MODS: paint, projectile types, and ordnance (grenades) ===================
const GUN_PAINTS = { stock: null, ember: '#ff6a1a', gold: '#ffd36a', ice: '#9fe8ff', toxic: '#7fff6a', violet: '#c86aff', crimson: '#ff3b2a', royal: '#4f6aff', pink: '#ff6aa8', white: '#f4f8ff' };
const PROJ = {
  laser: { name: 'Laser', lvl: 1, col: null, desc: 'Clean beam' },
  tracer: { name: 'Tracer rounds', lvl: 3, col: '#ffe14a', desc: 'Bright fast streaks' },
  plasma: { name: 'Plasma bolts', lvl: 6, col: '#4fffe0', desc: 'Glowing bolts you can see fly' },
  fire: { name: 'Incendiary', lvl: 10, col: '#ff6a1a', desc: 'Sets targets on fire' },
  ice: { name: 'Cryo rounds', lvl: 15, col: '#9fe8ff', desc: 'Slows targets' },
  shock: { name: 'Shock rounds', lvl: 20, col: '#4fa8ff', desc: 'Sometimes arcs to a second enemy' },
  boom: { name: 'Explosive tips', lvl: 25, col: '#ffb347', desc: 'Small blast on impact' },
  void: { name: 'Void rounds', lvl: 30, col: '#9b6bff', desc: 'Tugs enemies toward the hit' }
};
const gunLook = (id) => Object.assign({ paint: 'stock', proj: 'laser' }, (S.gunLook || {})[id] || {});
const projOf = () => { const p = gunLook(S.gun).proj; return PROJ[p] && S.lvl >= PROJ[p].lvl ? p : 'laser'; };
function projColor(g) { const P = PROJ[projOf()]; return P.col || GUN_PAINTS[gunLook(S.gun).paint] || g.col; }
// paint changes the gun's accent parts
{ const _gm = makeGunModel;
  makeGunModel = function (id) { const G = GUNS[id], paint = GUN_PAINTS[gunLook(id).paint]; if (!G || !paint) return _gm(id); const old = G.col; G.col = paint; try { return _gm(id); } finally { G.col = old; } };
}
const gunModelKey = () => S.gun + '|' + gunLook(S.gun).paint;
// projectile effects on the enemy that got hit
function projHit(e, end, dmg0, hitOne) {
  const p = projOf();
  if (p === 'plasma') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), glow('#4fffe0')); b.position.copy(vmGun.localToWorld(V(0, 0.05, 0.38))); scene.add(b); const t0 = performance.now(), from = b.position.clone();
    const fly = () => { const k = Math.min(1, (performance.now() - t0) / 120); b.position.lerpVectors(from, end, k); if (k < 1) requestAnimationFrame(fly); else { scene.remove(b); burst(end, '#4fffe0', 6, 3); } }; fly(); }
  if (!e || e.dead) return;
  if (p === 'fire') { e.burn = { t: 3, dps: dmg0 * 0.2, col: '#ff6a1a' }; }
  if (p === 'ice') { e.slow = 2.2; burst(end, '#9fe8ff', 5, 2); }
  if (p === 'shock' && Math.random() < 0.35) { for (const f of enemies) { if (f.dead || f === e || f.obj.position.distanceTo(e.obj.position) > 7) continue; tracer(end, f.obj.position.clone().add(V(0, f.def.hy * f.sc, 0)), '#4fa8ff'); hitOne(f, dmg0 * 0.5); break; } }
  if (p === 'boom') { burst(end, '#ffb347', 10, 5); for (const f of enemies) { if (f.dead || f === e) continue; if (f.obj.position.distanceTo(end) < 2.2) hitOne(f, dmg0 * 0.4); } }
  if (p === 'void') { e.pull = { p: player.pos.clone().lerp(e.obj.position, 0.6), t: 0.25 }; }
}
// ---------------- ordnance: throwable grenades that recharge ----------------
const ORD = {
  frag: { name: 'Frag grenade', lvl: 1, col: '#c8b84a', r: 4, dmg: 120, desc: 'Big boom' },
  cryo: { name: 'Cryo grenade', lvl: 10, col: '#9fe8ff', r: 4.5, dmg: 70, desc: 'Freezes and slows everything nearby', slow: 4 },
  shock: { name: 'Shock grenade', lvl: 16, col: '#4fa8ff', r: 5, dmg: 90, desc: 'Stuns: enemies stop attacking for a moment', stun: 2.5 },
  plasma: { name: 'Plasma sticky', lvl: 22, col: '#ff6aa8', r: 3.5, dmg: 320, desc: 'Massive damage, small area' },
  hole: { name: 'Black hole', lvl: 28, col: '#9b6bff', r: 7, dmg: 160, desc: 'Pulls everything in, then pops', pull: 1.8 },
  orbital: { name: 'Orbital strike beacon', lvl: 35, col: '#ff3b2a', r: 8, dmg: 600, desc: 'Marks a spot; the sky answers 2 seconds later', delay: 2 }
};
let ORD_MAX = 3; const ORD_RECHARGE = 9;
const ordSel = () => { const o = S.ord || 'frag'; return ORD[o] && S.lvl >= ORD[o].lvl ? o : 'frag'; };
let ordCharges = ORD_MAX, ordT = 0; const grenades = [];
function throwOrd() {
  if (state !== 'play' || dlgOpen || LEVEL.fly || !player.alive || inSafe(player.pos) || S.inSub) return;
  if (ordCharges < 1) { log('No ordnance ready yet. It recharges over time.'); return; }
  ordCharges--; const id = ordSel(), O = ORD[id], d = V(0, 0, 0); camera.getWorldDirection(d);
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), glow(O.col)); m.position.copy(camera.getWorldPosition(V(0, 0, 0))).addScaledVector(d, 0.6); scene.add(m);
  const v = d.clone().multiplyScalar(17); v.y += 4.5; grenades.push({ m, v, id, life: 4 }); SFX.jump();
}
function boomOrd(g) {
  const O = ORD[g.id], p = g.m.position.clone(); scene.remove(g.m);
  const go = () => {
    burst(p, O.col, 26, 8); burst(p, '#ffffff', 8, 4); SFX.boom();
    const dmg = O.dmg * (1 + S.lvl * 0.1);
    for (const e of enemies) { if (e.dead) continue; const d = e.obj.position.distanceTo(p); if (d > O.r + e.def.r * e.sc) continue;
      e.hp -= dmg * (1 - 0.5 * d / O.r); e.aggro = true; e.hitT = 0.15; if (O.slow) e.slow = O.slow; if (O.stun) e.cd = Math.max(e.cd, O.stun); if (O.pull) e.pull = { p: p.clone(), t: O.pull };
      if (e.hp <= 0) kill(e); else updatePlate(e); }
    if (Math.hypot(player.pos.x - p.x, player.pos.z - p.z) < O.r * 0.5 && g.id !== 'cryo') hurt(dmg * 0.08, false);
  };
  if (O.delay) { const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 60, 6), new THREE.MeshBasicMaterial({ color: '#ff3b2a', transparent: true, opacity: 0.35 })); beam.position.copy(p).add(V(0, 30, 0)); scene.add(beam); SFX.horn(); setTimeout(() => { scene.remove(beam); go(); }, O.delay * 1000); }
  else go();
}
function updateOrd(dt) {
  if (ordCharges < ORD_MAX) { ordT += dt; if (ordT >= ORD_RECHARGE) { ordT = 0; ordCharges++; } }
  for (let i = grenades.length - 1; i >= 0; i--) { const g = grenades[i]; g.v.y -= 14 * (LEVEL.gravity || 1) * dt; g.m.position.addScaledVector(g.v, dt); g.m.rotation.x += dt * 8; g.life -= dt;
    const hitE = enemies.some(e => !e.dead && e.obj.position.distanceTo(g.m.position) < e.def.r * e.sc + 0.6 && Math.abs(e.obj.position.y + e.def.hy - g.m.position.y) < 1.5);
    if (g.life <= 0 || hitE || blockedAt(g.m.position.x, g.m.position.y, g.m.position.z)) { if (!hitE) g.m.position.y = Math.max(g.m.position.y, groundH(g.m.position.x, g.m.position.z) + 0.2); grenades.splice(i, 1); boomOrd(g); } }
}
// ---------------- the gun mod bench ----------------
function openGunMods(who) {
  openDlg(who || 'Gun mod bench', 'Paint · rounds · ordnance');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  let gid = S.gun;
  const set = (k, v) => { S.gunLook = S.gunLook || {}; S.gunLook[gid] = Object.assign(gunLook(gid), { [k]: v }); markDirty(); SFX.ui(); };
  const pv = () => setPreview(() => { const m = makeGunModel(gid); m.rotation.y = Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; }, `${GUNS[gid].name} · ${PROJ[gunLook(gid).proj].name}`);
  const render = () => {
    rows.textContent = ''; const L = gunLook(gid);
    $('dlgLine').textContent = `Modding the ${GUNS[gid].name}. Paint and rounds are saved per gun.`;
    const row = (label, items) => { const r = document.createElement('div'); r.style.display = 'flex'; r.style.flexWrap = 'wrap'; r.style.gap = '6px'; r.style.margin = '6px 0'; const h = document.createElement('div'); h.textContent = label; h.style.width = '100%'; h.style.color = 'var(--gold)'; r.appendChild(h); items.forEach(it => r.appendChild(it)); rows.appendChild(r); };
    const btn = (text, on, dis, fn, col) => { const b = document.createElement('button'); b.className = 'pbtn' + (on ? ' go' : ''); b.style.padding = '5px 9px'; b.textContent = text; b.disabled = !!dis; if (col) { b.style.borderColor = col; b.style.color = col; } b.addEventListener('click', fn); return b; };
    row('Gun', S.guns.map(id => btn(GUNS[id].name.replace(/^Lvl \d+ /, ''), id === gid, false, () => { gid = id; render(); pv(); })));
    row('Paint', Object.entries(GUN_PAINTS).map(([k, c]) => btn(k[0].toUpperCase() + k.slice(1), L.paint === k, false, () => { set('paint', k); render(); pv(); }, c || undefined)));
    row('Rounds', Object.entries(PROJ).map(([k, P]) => btn(S.lvl >= P.lvl ? `${P.name}` : `${P.name} · Lv ${P.lvl}`, L.proj === k, S.lvl < P.lvl, () => { set('proj', k); render(); pv(); }, P.col || undefined)));
    { const d = document.createElement('div'); d.className = 'empty'; d.style.margin = '0 0 4px'; const P = PROJ[L.proj]; d.textContent = P ? `${P.name}: ${P.desc}` : ''; rows.appendChild(d); }
    { row('Ordnance · Z or NADE to throw', Object.entries(ORD).map(([k, O]) => btn(S.lvl >= O.lvl ? O.name : `${O.name} · Lv ${O.lvl}`, ordSel() === k, S.lvl < O.lvl, () => { S.ord = k; markDirty(); SFX.ui(); render(); }, O.col))); const d = document.createElement('div'); d.className = 'empty'; d.style.margin = '0 0 4px'; d.textContent = `${ORD[ordSel()].name}: ${ORD[ordSel()].desc}`; rows.appendChild(d); }
  };
  $('dlgActs').before(rows);
  acts([['Done', () => { closeDlg(); vmGunId = null; }, true]]);
  render(); showPreviewIn(rows); pv();
}
// station on the ship next to the saber mods
{ const orig = LEVELS.ship.build;
  LEVELS.ship.build = function () { orig.call(this);
    // the display (2.23.77): a steel workbench cabinet with drawers, a glass case on top where your gun turns on a lit turntable, a pegboard of tools behind and a plaque on the front
    const st = new THREE.Group(), steel = toon('#3a3d44', 'hull'), dk = toon('#1e2128'), chrome = toon('#a8aeb8'), cy = '#4fd2ff';
    part(st, B(1.7, 0.86, 0.85), steel, 0, 0.43, 0); part(st, B(1.76, 0.05, 0.9), toon('#2a2d34'), 0, 0.885, 0); part(st, B(1.7, 0.08, 0.85), dk, 0, 0.04, 0);
    for (let r = 0; r < 2; r++) for (const sx of [-0.43, 0.43]) { part(st, B(0.76, 0.3, 0.02), toon('#30333a'), sx, 0.27 + r * 0.34, 0.43); part(st, B(0.3, 0.03, 0.03), chrome, sx, 0.33 + r * 0.34, 0.45); }
    { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#0a1420'; x.fillRect(0, 0, 256, 64); x.strokeStyle = cy; x.lineWidth = 3; x.strokeRect(3, 3, 250, 58); x.fillStyle = '#cfefff'; x.font = 'bold 30px Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('GUNSMITH', 128, 34);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshBasicMaterial({ map: t })); pl.position.set(0, 0.79, 0.433); st.add(pl); part(st, B(0.66, 0.19, 0.01), chrome, 0, 0.79, 0.427); }
    // glass case: a dark plinth, a cyan-lit turntable, four chrome posts, a lid and see-through panes
    part(st, B(1.5, 0.08, 0.7), dk, 0, 0.95, 0); part(st, Cy(0.34, 0.36, 0.04, 24), toon('#24282f'), 0, 1.01, 0); part(st, new THREE.TorusGeometry(0.35, 0.012, 4, 32), glow(cy), 0, 1.035, 0, Math.PI / 2);
    for (const sx of [-0.73, 0.73]) for (const sz of [-0.33, 0.33]) part(st, B(0.04, 0.72, 0.04), chrome, sx, 1.35, sz);
    part(st, B(1.5, 0.05, 0.7), dk, 0, 1.73, 0); part(st, B(1.4, 0.015, 0.6), glow('#dff4ff'), 0, 1.70, 0);
    const glass = new THREE.MeshPhongMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.13, shininess: 120, depthWrite: false, side: THREE.DoubleSide });
    for (const [w, d, x, z] of [[1.42, 0.01, 0, 0.33], [1.42, 0.01, 0, -0.33], [0.01, 0.62, 0.73, 0], [0.01, 0.62, -0.73, 0]]) { const m = new THREE.Mesh(B(w, 0.7, d), glass); m.position.set(x, 1.34, z); st.add(m); }
    // pegboard behind with tools
    part(st, B(1.7, 1.1, 0.05), toon('#2a2d34', 'panel'), 0, 1.5, -0.47); for (let k = 0; k < 4; k++) part(st, B(0.04, 0.24 + (k % 2) * 0.1, 0.03), toon(['#c9733a', '#a8aeb8', '#6a6e78', '#a8aeb8'][k]), -0.66 + k * 0.08, 1.75, -0.43);
    part(st, Cy(0.05, 0.05, 0.03, 10), chrome, 0.62, 1.8, -0.43, Math.PI / 2); part(st, B(0.26, 0.05, 0.03), toon('#c8402f'), 0.6, 1.6, -0.43); part(st, B(1.6, 0.03, 0.03), glow(cy), 0, 2.03, -0.44);
    const tt = new THREE.Group(); tt.position.set(0, 1.04, 0); st.add(tt); const gm = makeGunModel(S.gun); const gb = new THREE.Box3().setFromObject(gm), gs = gb.getSize(V(0, 0, 0)); gm.scale.setScalar(Math.min(2.2, 1.1 / Math.max(gs.z, 0.01), 0.5 / Math.max(gs.y, 0.01), 0.45 / Math.max(gs.x, 0.01)));
    gm.rotation.y = Math.PI / 2; tt.add(gm); const gb2 = new THREE.Box3().setFromObject(gm); gm.position.y = 0.3 - (gb2.min.y + gb2.max.y) / 2;
    const lt = new THREE.PointLight(0x8fe3ff, 0.6, 2.4, 1.6); lt.position.set(0, 1.6, 0.3); st.add(lt);
    st.position.set(-5, 0, -3.5); levelGroup.add(st); box(-5, -3.5, 0.88, 0.5);
    levelAnims.push(t => { tt.rotation.y = Math.sin(t * 0.5) * 0.22; }); // the gun lies along the case and sways a little, so it never pokes through the glass
    INTERACTS.push({ x: -5, z: -2.6, r: 2, label: 'Gun mod bench', fn: () => openGunMods() });
  };
}
// launch your ship from anywhere with L
function launchShip() {
  if (state !== 'play' || dlgOpen) return;
  if (!shipUnlocked()) { log('You get your ship after beating Drome.'); return; }
  if (LEVEL.fly) { const F = fly; if (F && F.prompt && LEVELS[F.prompt] && planetOpen(F.prompt)) { S.orbit = F.prompt; player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; travel(F.prompt); } else log('Fly close to a world to land, or into it.'); return; }
  const here = SPACE_BODIES[LEVEL.id] ? LEVEL.id : (S.orbit || 'earth');
  SFX.warp(); enterSpace(here);
}
