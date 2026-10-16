// =================== COMBAT DRONE: hovers at your shoulder; upgrade its guns, ordnance and repair beam ===================
const DRONE_PAINT = [['Gunmetal', '#5d636c'], ['Sunset', '#ff9a3c'], ['Ice', '#8fe3ff'], ['Venom', '#6fdc5a'], ['Royal', '#8a6fc4'], ['Blood', '#b3262c'], ['Gold', '#c9a43a']];
const DRONE_UP = {
  gun: { name: 'Twin blasters', max: 5, desc: L => L ? `${droneDmg(L).toFixed(0)} damage, ${(1 / droneRate(L)).toFixed(1)} shots/s, ${droneRange(L)} m range` : 'Not fitted', cost: L => [1200 * (L + 1), L + 1] },
  ord: { name: 'Micro-missiles', max: 3, desc: L => L ? `Splash missile every ${18 - L * 4}s` : 'Not fitted', cost: L => [4000 * (L + 1), 2 * (L + 1)] },
  heal: { name: 'Repair beam', max: 3, desc: L => L ? `Heals ${[0, 2, 4, 7][L]} HP/s out of combat${L >= 2 ? ' · emergency patch below 30%' : ''}` : 'Not fitted', cost: L => [3000 * (L + 1), 2 * (L + 1)] },
};
const droneS = () => { S.drone = S.drone || { own: false, on: true, gun: 0, ord: 0, heal: 0, paint: 0, parts: 0 }; return S.drone; };
const droneDmg = L => (5 + 5 * L) * (1 + S.lvl * 0.12);
const droneRate = L => 1.1 - L * 0.12;
const droneRange = L => 14 + L * 2;
const DR = { obj: null, key: '', cd: 0, ocd: 6, ecd: 0, t: 0, pos: null, beam: null };
function makeDroneModel(D) {
  const g = new THREE.Group(), c = DRONE_PAINT[D.paint || 0][1];
  part(g, new THREE.SphereGeometry(0.2, 12, 8), c, 0, 0, 0); part(g, Cy(0.34, 0.34, 0.05, 16), '#2a2c32', 0, 0, 0);
  part(g, new THREE.SphereGeometry(0.07, 8, 6), glow(D.heal ? '#6fdc5a' : '#ff3b2a'), 0, 0.02, 0.18);
  for (const s of [-1, 1]) { part(g, Cy(0.08, 0.08, 0.02, 10), glow('#4fd2ff'), s * 0.3, 0.03, 0); }
  if (D.gun) for (const s of [-1, 1]) part(g, Cy(0.025, 0.025, 0.22 + D.gun * 0.02, 6), '#1e1c22', s * 0.12, -0.12, 0.12, Math.PI / 2);
  if (D.ord) part(g, B(0.14, 0.1, 0.22), '#3a3d44', 0, 0.16, -0.04);
  if (D.heal) part(g, B(0.1, 0.03, 0.03), glow('#6fdc5a'), 0, -0.2, 0), part(g, B(0.03, 0.03, 0.1), glow('#6fdc5a'), 0, -0.2, 0);
  g.traverse(o => { if (o.isMesh) o.castShadow = false; });
  return g;
}
function droneSpawn() {
  const D = droneS(), key = [D.own, D.on, D.gun, D.ord, D.heal, D.paint, LEVEL.id].join();
  if (key === DR.key && (DR.obj ? DR.obj.parent : true)) return; DR.key = key;
  if (DR.obj) { scene.remove(DR.obj); disposeTree(DR.obj); DR.obj = null; }
  if (!D.own || !D.on || LEVEL.fly) return;
  DR.obj = makeDroneModel(D); DR.obj.position.copy(player.pos).add(V(0.8, 2.2, 0)); scene.add(DR.obj);
}
function droneStep(dt) {
  droneSpawn(); const D = droneS(); if (!DR.obj || !player.alive) return; DR.t += dt;
  const o = DR.obj.position, side = V(Math.cos(player.yaw), 0, -Math.sin(player.yaw)), back = V(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const goal = player.pos.clone().addScaledVector(side, 0.85).addScaledVector(back, 0.5).add(V(0, (VH.on ? 3.2 : 2.15) + Math.sin(DR.t * 2.2) * 0.08, 0));
  if (o.distanceTo(goal) > 20) o.copy(goal); else o.lerp(goal, Math.min(1, dt * 5));
  // target: nearest enemy that is fighting you
  let tg = null, td = 1e9; const range = droneRange(D.gun || 1), safe = inSafe(player.pos);
  if (!safe) for (const e of enemies) { if (e.dead || e.gone || !e.obj.visible || !(e.aggro || e.sp.board)) continue; const d = e.obj.position.distanceTo(o); if (d < range && d < td) { td = d; tg = e; } }
  if (tg) { const tp = tg.obj.position; DR.obj.rotation.y = Math.atan2(tp.x - o.x, tp.z - o.z); } else DR.obj.rotation.y += (player.yaw + Math.PI - DR.obj.rotation.y) * Math.min(1, dt * 3);
  const hitE = (e, dmg) => { if (e.dead) return; e.hp -= dmg; e.hitT = 0.1; e.aggro = true; e.lastHit = gameTime; if (e.hp <= 0) kill(e); else updatePlate(e); };
  DR.cd -= dt; DR.ocd -= dt; DR.ecd -= dt;
  if (tg && D.gun && DR.cd <= 0) { DR.cd = droneRate(D.gun); const from = o.clone().add(V(0, -0.1, 0)), to = tg.obj.position.clone().add(V(0, tg.def.hy * tg.sc, 0)); tracer(from, to, '#4fd2ff'); burst(to, '#4fd2ff', 3, 2); hitE(tg, droneDmg(D.gun)); if (SFX.laser && Math.random() < 0.5) SFX.laser(); }
  if (tg && D.ord && DR.ocd <= 0) { DR.ocd = 18 - D.ord * 4; droneMissile(o.clone(), tg, droneDmg(Math.max(1, D.gun)) * (3 + D.ord), 3 + D.ord * 0.6, hitE); }
  // repair beam
  if (D.heal && player.hp < maxHp() && !LEVEL.fly) {
    const calm = gameTime - (player.lastHurt || -99) > 3.5;
    if (calm) { player.hp = Math.min(maxHp(), player.hp + [0, 2, 4, 7][D.heal] * dt); droneBeam(true); } else droneBeam(false);
    if (D.heal >= 2 && player.hp < maxHp() * 0.3 && DR.ecd <= 0) { DR.ecd = 60; player.hp = Math.min(maxHp(), player.hp + maxHp() * 0.3); burst(player.pos.clone().add(V(0, 1.2, 0)), '#6fdc5a', 24, 4); toast('DRONE', 'Emergency patch!', 1.2); SFX.ui(); }
  } else droneBeam(false);
}
function droneBeam(on) {
  if (!DR.beam) { DR.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.12, 1, 6, 1, true), new THREE.MeshBasicMaterial({ color: '#6fdc5a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(DR.beam); }
  DR.beam.visible = on && !!DR.obj; if (!DR.beam.visible) return;
  const a = DR.obj.position, b = player.pos.clone().add(V(0, 1.0, 0)), mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b);
  DR.beam.position.copy(mid); DR.beam.scale.set(1, len, 1); DR.beam.lookAt(b); DR.beam.rotateX(Math.PI / 2); DR.beam.material.opacity = 0.25 + Math.sin(DR.t * 12) * 0.1;
}
function droneMissile(from, tg, dmg, rad, hitE) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), glow('#ff9a3c')); m.position.copy(from); scene.add(m); let life = 3;
  const tick = dt => { life -= dt; const to = tg.dead ? m.position.clone().add(V(0, -1, 0)) : tg.obj.position.clone().add(V(0, tg.def.hy * tg.sc, 0)), d = m.position.distanceTo(to);
    if (Math.random() < 0.7) burst(m.position.clone(), '#ffd36a', 1, 0.5);
    if (d < 0.6 || life <= 0) { scene.remove(m); burst(m.position.clone(), '#ff6a1a', 18, 7); burst(m.position.clone(), '#ffd36a', 8, 4); if (SFX.boom) SFX.boom(); for (const e of enemies) { if (e.dead) continue; const dd = e.obj.position.distanceTo(m.position); if (dd < rad + e.def.r * e.sc) hitE(e, dmg * (1 - 0.5 * dd / (rad + 1))); } return true; }
    m.position.addScaledVector(to.sub(m.position).normalize(), Math.min(d, 22 * dt)); return false; };
  DR.missiles = DR.missiles || []; DR.missiles.push(tick);
}
{ const _s = step; step = function (dt) { _s(dt); try { droneStep(dt); if (DR.missiles) DR.missiles = DR.missiles.filter(f => !f(dt)); } catch (err) { console.warn('drone', err); } }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); DR.key = ''; if (DR.missiles) DR.missiles.length = 0; if (DR.obj) DR.obj.position.copy(player.pos).add(V(0.8, 2.2, 0)); return r; }; }
// robots sometimes drop drone parts
{ const _k = kill; kill = function (e) { const r = _k(e); try { if (droneS().own && /xr17|guard|droid|hoverbot|f162|robotron|tdrone|skydroid|siegebot/.test(e.sp.type) && Math.random() < 0.08) { droneS().parts++; log('Salvaged a drone part.', 'loot'); markDirty(); } } catch (_) {} return r; }; }
// ---- the drone bay ----
function openDroneBay() {
  const D = droneS(); openDlg('Drone bay', D.own ? 'Your combat drone' : 'Combat drones');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const row = (a, b, btn) => { const r = document.createElement('div'); r.className = 'rowi nodot'; const x = document.createElement('span'); x.innerHTML = a; const y = document.createElement('span'); y.className = 'meta'; y.style.fontSize = '14px'; y.textContent = b; const z = document.createElement('span'); if (btn) z.appendChild(btn); r.append(x, y, z); rows.appendChild(r); };
  const mkb = (label, fn, dis) => { const b = document.createElement('button'); b.className = 'pbtn go'; b.textContent = label; b.disabled = !!dis; b.addEventListener('click', () => { SFX.ui(); fn(); }); return b; };
  if (!D.own) {
    $('dlgLine').textContent = `A combat drone hovers at your shoulder, shoots whatever is shooting you, and can be fitted with missiles and a repair beam. ${S.cr.toLocaleString()} cr.`;
    row('<b>Mk I Combat Drone</b><br><small style="color:var(--dim)">Comes with twin blasters (level 1)</small>', '2,500 cr', mkb('Buy', () => { if (S.cr < 2500) return toast('DRONE', 'Not enough credits', 1.5); S.cr -= 2500; D.own = true; D.on = true; D.gun = 1; markDirty(); SFX.level(); toast('DRONE ONLINE', 'It already likes you.', 2.5); openDroneBay(); }, S.cr < 2500));
  } else {
    $('dlgLine').textContent = `Drone parts: ${D.parts}. Credits: ${S.cr.toLocaleString()}. Parts come from boarded ships' holds and broken robots, or buy them here.`;
    for (const k of ['gun', 'ord', 'heal']) { const U = DRONE_UP[k], L = D[k] || 0, [cr, pt] = U.cost(L), max = L >= U.max;
      row(`<b>${U.name}</b> ${'▮'.repeat(L)}${'▯'.repeat(U.max - L)}<br><small style="color:var(--dim)">${U.desc(L)}</small>`, max ? 'Maxed' : `${cr.toLocaleString()} cr · ${pt} parts`, max ? null : mkb(L ? 'Upgrade' : 'Fit', () => { if (S.cr < cr || D.parts < pt) return toast('DRONE', S.cr < cr ? 'Not enough credits' : 'Not enough drone parts', 1.5); S.cr -= cr; D.parts -= pt; D[k] = L + 1; markDirty(); SFX.level(); toast('DRONE UPGRADED', `${U.name} level ${L + 1}`, 2); openDroneBay(); }, S.cr < cr || D.parts < pt)); }
    row('<b>Drone part</b>', '900 cr each', mkb('Buy 1', () => { if (S.cr < 900) return; S.cr -= 900; D.parts++; markDirty(); SFX.coin(); openDroneBay(); }, S.cr < 900));
    const pr = document.createElement('div'); pr.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin:8px 0'; DRONE_PAINT.forEach(([n, c], i) => { const b = document.createElement('button'); b.className = 'sw'; b.style.background = c; b.title = n; b.setAttribute('aria-label', n + ' paint'); b.setAttribute('aria-pressed', String((D.paint || 0) === i)); b.addEventListener('click', () => { D.paint = i; markDirty(); SFX.ui(); openDroneBay(); }); pr.appendChild(b); }); rows.appendChild(pr);
  }
  $('dlgActs').before(rows);
  acts([...(D.own ? [[D.on ? 'Dock the drone' : 'Launch the drone', () => { D.on = !D.on; markDirty(); openDroneBay(); }]] : []), ['Done', closeDlg, true]]);
}
function openDroneStatus() { const D = droneS(); if (!D.own) { toast('DRONE', 'Buy one at the drone bay on your ship or at Fort Ironrock', 2.5); return; } D.on = !D.on; markDirty(); toast('DRONE', D.on ? 'Launched' : 'Docked', 1.2); }
// where to find the bay: your ship, Fort Ironrock's quartermaster, Brakka on the Zeltac Ship
{ const ob = LEVELS.ship.build; LEVELS.ship.build = function () { ob.call(this); const st = new THREE.Group(), X = -4.4, Z = -9.2;
  part(st, Cy(0.85, 0.95, 0.25, 16), '#2a2c32', 0, 0.12, 0); part(st, Cy(0.88, 0.88, 0.03, 24), glow('#4fd2ff'), 0, 0.26, 0);
  part(st, Cy(0.35, 0.5, 0.6, 10), '#3a3f4a', 0, 0.55, 0); part(st, Cy(0.6, 0.6, 0.06, 20), '#3a3f4a', 0, 0.88, 0); part(st, Cy(0.5, 0.5, 0.02, 20), glow('#4fd2ff'), 0, 0.92, 0);
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, cx = Math.sin(a) * 0.62, cz = Math.cos(a) * 0.62; part(st, B(0.1, 1.5, 0.1), '#5a606a', cx, 0.95, cz); part(st, B(0.06, 0.06, 0.32), '#5a606a', cx * 0.75, 1.7, cz * 0.75, 0, a, 0); part(st, B(0.04, 1.1, 0.02), glow('#4fd2ff'), cx * 1.08, 0.95, cz * 1.08, 0, a, 0); }
  part(st, new THREE.TorusGeometry(0.62, 0.035, 6, 24), '#5a606a', 0, 1.72, 0, Math.PI / 2, 0, 0);
  const dr = new THREE.Group(); part(dr, new THREE.SphereGeometry(0.22, 12, 8), '#d8dde4', 0, 0, 0); part(dr, B(0.6, 0.05, 0.12), '#5a606a', 0, 0, 0); part(dr, new THREE.SphereGeometry(0.07, 8, 6), glow('#ff5a4a'), 0, 0, 0.2); dr.position.set(X, 1.3, Z); levelGroup.add(dr);
  const hl = part(st, Cy(0.45, 0.45, 0.8, 16, 1, true), glow('#4fd2ff'), 0, 1.3, 0); hl.material = hl.material.clone(); hl.material.transparent = true; hl.material.opacity = 0.12; hl.material.side = THREE.DoubleSide;
  part(st, B(0.6, 0.4, 0.05), '#2a2c32', 0.95, 1.1, 0.2, 0, -0.5, 0); part(st, B(0.52, 0.32, 0.02), glow('#6fdc5a'), 0.96, 1.1, 0.23, 0, -0.5, 0);
  at(st, X, Z, 0.3); solid(X, Z, 0.95); window.__droneDr = dr; if (!window.__droneHov) { window.__droneHov = 1; const ob2 = scene.onBeforeRender; scene.onBeforeRender = function () { const d = window.__droneDr; if (d && d.parent) { const t = performance.now() / 1000; d.position.y = 1.3 + Math.sin(t * 1.6) * 0.06; d.rotation.y = t * 0.8; } return ob2 && ob2.apply(this, arguments); }; }
  INTERACTS.push({ x: X + 0.4, z: Z + 1.3, r: 1.6, label: 'Drone bay', fn: openDroneBay }); }; }
for (const [lv, nid] of [['fort', 'brix'], ['zeltac', 'brakka']]) { const n = (LEVELS[lv].npcs || []).find(n => n.id === nid); if (n) n.custom = [...(n.custom || []), ['Drone bay', () => openDroneBay()]]; }
