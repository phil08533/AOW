// =================== GUNS 2: cooler models, firing animation, alien glow, and other players see it all ===================
// Every gun gets sights, a muzzle brake, a moving slide and a side light strip in its accent color.
// Alien-tech guns also get a floating energy core and spinning rings that pulse, and flash their own color when fired.
// Other players see your gun (with its paint), and see it flash and fire.
const GUNFX = { shots: 0, heat: 0, forcePaint: undefined, casings: [] };
const GUN_ALIEN_KIND = ['hive', 'plasma', 'mystic'];
const gunIsAlien = id => { const G = GUNS[id]; if (!G) return false; return GUN_ALIEN_KIND.includes(G.kind) || /plasma|frost|storm|nova|phase|pulse|rail|void|star|ion|hive|stinger|volt|lumen|crystal|judgement|maw|wizard|mystic|arc|quantum/i.test(G.name || ''); };
const gunIsBallistic = id => { const G = GUNS[id]; return !!G && !gunIsAlien(id) && ['carbine', 'rifle', 'long', 'scatter', 'minigun', 'gatling'].includes(G.kind); };
{ const _gm = makeGunModel; makeGunModel = function (id) {
  let g; if (GUNFX.forcePaint !== undefined) { S.gunLook = S.gunLook || {}; const keep = S.gunLook[id]; S.gunLook[id] = Object.assign({}, keep || {}, { paint: GUNFX.forcePaint || 'stock' }); try { g = _gm(id); } finally { if (keep) S.gunLook[id] = keep; else delete S.gunLook[id]; } } else g = _gm(id);
  try { gunDress(g, id); } catch (e) { console.warn('gunDress', e); } return g; }; }
function gunDress(g, id) {
  const G = GUNS[id]; if (!G) return; const paint = GUN_PAINTS[(GUNFX.forcePaint !== undefined ? GUNFX.forcePaint : gunLook(id).paint)] || null, acc = paint || G.col || '#4fd2ff', alien = gunIsAlien(id), U = { spin: [], pulse: [], slide: null, alien, col: acc, heat: [] };
  if (G.kind !== 'mystic') {
    // sights, a light strip down each side, a muzzle brake and a top slide that kicks back when you fire
    part(g, B(0.012, 0.03, 0.012), C.dark, 0, 0.125, 0.26); part(g, B(0.04, 0.025, 0.012), C.dark, 0, 0.12, -0.12);
    for (const s of [-1, 1]) { const st = part(g, B(0.004, 0.012, 0.3), glow(acc), s * 0.037, 0.05, 0.02); U.pulse.push(st); }
    const brake = part(g, Cy(0.03, 0.03, 0.06, 8), C.dark, 0, 0.05, 0.38, Math.PI / 2); for (const s of [-1, 1]) part(g, B(0.006, 0.02, 0.03), glow(acc), s * 0.03, 0.05, 0.38);
    U.slide = part(g, B(0.06, 0.02, 0.18), toon(acc), 0, 0.112, 0.04); U.slide.userData.z0 = 0.04;
    if (['carbine', 'rifle', 'long'].includes(G.kind)) { part(g, B(0.05, 0.05, 0.03), C.dark, 0, 0.15, 0.05); const holo = part(g, new THREE.PlaneGeometry(0.035, 0.035), new THREE.MeshBasicMaterial({ color: new THREE.Color(acc).convertSRGBToLinear(), transparent: true, opacity: 0.45, side: THREE.DoubleSide }), 0, 0.15, 0.067); U.pulse.push(holo); }
    if (gunIsBallistic(id)) part(g, B(0.045, 0.12, 0.07), C.dark, 0, -0.07, 0.12, 0.15);
  }
  if (alien) {
    // a floating energy core in a cage, rings spinning around the barrel, glowing vents
    const core = part(g, new THREE.SphereGeometry(0.03, 10, 8), glow(acc), 0, 0.05, -0.05); U.pulse.push(core); U.core = core;
    for (const s of [-1, 1]) part(g, Cy(0.004, 0.004, 0.09, 4), C.dark, s * 0.035, 0.05, -0.05);
    for (let k = 0; k < 3; k++) { const r = part(g, new THREE.TorusGeometry(0.05 - k * 0.005, 0.006, 5, 14), glow(acc), 0, 0.05, 0.18 + k * 0.07); U.spin.push(r); }
    for (let k = 0; k < 4; k++) { const v = part(g, B(0.075, 0.006, 0.012), glow(acc), 0, 0.02, -0.17 + k * 0.025); U.heat.push(v); }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: acc, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(0, 0.05, -0.05); halo.scale.setScalar(0.16); g.add(halo); U.halo = halo;
  }
  g.userData.gfx = U;
}
function gunAnim(g, dt, t, kick) {
  const U = g && g.userData.gfx; if (!U) return;
  for (let i = 0; i < U.spin.length; i++) U.spin[i].rotation.z += dt * (3 + i * 2) * (i % 2 ? -1 : 1) * (1 + kick * 6);
  const p = 1 + Math.sin(t * 5) * 0.12 + kick * 0.6; if (U.core) U.core.scale.setScalar(p); if (U.halo) { U.halo.material.opacity = 0.35 + Math.sin(t * 5) * 0.15 + kick * 0.5; U.halo.scale.setScalar(0.16 * p); }
  if (U.slide) U.slide.position.z = U.slide.userData.z0 - kick * 0.08;
}
// your gun: kick, heat and effects when you fire
{ const _f = fire; fire = function () { const before = player.ammo, clip = S.clip; const r = _f(); if (player.ammo !== before && !handMelee()) gunShotFx(); return r; }; }
function gunShotFx() {
  GUNFX.shots = (GUNFX.shots + 1) % 1000; GUNFX.kick = 1; GUNFX.heat = Math.min(1, GUNFX.heat + 0.12);
  const U = vmGun && vmGun.userData.gfx; if (!U) return;
  if (U.alien) { // a ring of energy bursts off the muzzle in the gun's color
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.05, 18), new THREE.MeshBasicMaterial({ color: new THREE.Color(U.col).convertSRGBToLinear(), transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    ring.position.set(0, 0.05, 0.46); vmGun.add(ring); GUNFX.casings.push({ m: ring, life: 0.22, ring: true, par: vmGun });
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: U.col, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending })); fl.position.set(0, 0.05, 0.46); fl.scale.setScalar(0.3); vmGun.add(fl); GUNFX.casings.push({ m: fl, life: 0.07, par: vmGun });
    if (typeof fxFlashLight !== 'undefined') fxFlashLight.color.set(U.col);
  } else if (gunIsBallistic(S.gun)) { // a brass casing flips out to the right
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.02, 6), new THREE.MeshBasicMaterial({ color: '#d8a84a' })); c.position.set(0.03, 0.03, -0.05); camera.add(c); c.position.copy(vm.position).add(V(0.02, 0.03, -0.12));
    GUNFX.casings.push({ m: c, life: 0.5, v: V(0.9 + Math.random() * 0.4, 0.9 + Math.random() * 0.4, 0.2), spin: V(Math.random() * 20, Math.random() * 20, 0), par: camera });
    if (typeof fxFlashLight !== 'undefined') fxFlashLight.color.set('#ffc870');
  } else if (typeof fxFlashLight !== 'undefined') fxFlashLight.color.set(U.col);
}
// remote players: show their paint and their shots
{ const _pw = pvpWrite; pvpWrite = function (p) { _pw(p); p.fs = GUNFX.shots; try { p.gp = gunLook(S.gun).paint || 'stock'; } catch (_) {} }; }
{ const _rw = remoteWeapon; remoteWeapon = function (r, code) { if (r.gpWant !== r.gpHave) { r.gpHave = r.gpWant; r.gnCode = null; } GUNFX.forcePaint = r.gpWant || 'stock'; try { return _rw(r, code); } finally { GUNFX.forcePaint = undefined; } }; }
{ const _sp = syncPeers; syncPeers = function (peers) {
  for (const peer of peers || []) { if (peer.isMe) continue; const r = remotes.get(peer.peer); if (!r) continue; const pr = peer.presence || {}; r.gpWant = typeof pr.gp === 'string' && pr.gp in GUN_PAINTS ? pr.gp : 'stock'; }
  _sp(peers);
  for (const peer of peers || []) { if (peer.isMe) continue; const r = remotes.get(peer.peer); if (!r) continue; const pr = peer.presence || {};
    const fs = typeof pr.fs === 'number' ? pr.fs : null; if (fs == null) continue; if (r.fsLast == null) { r.fsLast = fs; continue; }
    const n = (fs - r.fsLast + 1000) % 1000; r.fsLast = fs; if (n > 0 && n < 60) remoteShots(r, Math.min(3, n)); } }; }
function remoteShots(r, n) {
  const g = r.gnObj; if (!g || !g.parent || !r.obj.visible) return; const U = g.userData.gfx, col = (U && U.col) || '#ffd36a';
  g.updateWorldMatrix(true, false); const from = V(0, 0.05, 0.45).applyMatrix4(g.matrixWorld), dir = V(0, 0, 1).transformDirection(g.matrixWorld);
  if (from.distanceTo(player.pos) > 80) return;
  for (let i = 0; i < n; i++) setTimeout(() => { if (!g.parent) return; const to = from.clone().addScaledVector(dir, 28).add(V((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)); tracer(from, to, col); impactFlash(from, col, 0.6); r.gfxKick = 1; }, i * 90);
}
// every frame: animate your gun, every visible remote gun, and the casings
{ const _st = step; step = function (dt) { _st(dt); const t = gameTime;
  GUNFX.kick = Math.max(0, (GUNFX.kick || 0) - dt * 9); GUNFX.heat = Math.max(0, GUNFX.heat - dt * 0.35);
  if (vmGun) { gunAnim(vmGun, dt, t, GUNFX.kick); const U = vmGun.userData.gfx; if (U && U.heat) U.heat.forEach((v, i) => { v.scale.y = 1 + GUNFX.heat * 3; }); }
  for (const r of remotes.values()) { if (r.gnObj && r.obj.visible) { r.gfxKick = Math.max(0, (r.gfxKick || 0) - dt * 9); gunAnim(r.gnObj, dt, t, r.gfxKick); } }
  for (let i = GUNFX.casings.length - 1; i >= 0; i--) { const c = GUNFX.casings[i]; c.life -= dt;
    if (c.ring) { const k = 1 + (0.22 - c.life) * 30; c.m.scale.setScalar(k); c.m.material.opacity = Math.max(0, c.life / 0.22); }
    if (c.v) { c.v.y -= 6 * dt; c.m.position.addScaledVector(c.v, dt * 0.25); c.m.rotation.x += c.spin.x * dt; c.m.rotation.z += c.spin.y * dt; }
    if (c.life <= 0) { if (c.m.parent) c.m.parent.remove(c.m); c.m.geometry && c.m.geometry.dispose(); c.m.material.dispose(); GUNFX.casings.splice(i, 1); } } }; }
