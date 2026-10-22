// rain hitting the surface: little rings spreading on the ocean and on Velocity's wet glass road, with a hop of spray where each drop lands
const RFX = { rings: [], drops: [], lvl: null, acc: 0, t: performance.now() };
function rfxBuild() { RFX.rings.length = RFX.drops.length = 0; RFX.lvl = levelGroup;
  const rg = new THREE.RingGeometry(0.5, 0.62, 16).rotateX(-Math.PI / 2), dg = new THREE.PlaneGeometry(0.05, 0.28);
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: '#dff6ff', transparent: true, opacity: 0, depthWrite: false })); m.visible = false; m.renderOrder = 2; levelGroup.add(m); RFX.rings.push({ m, life: 0 }); }
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6, depthWrite: false })); m.visible = false; levelGroup.add(m); RFX.drops.push({ m, life: 0, vy: 0 }); } }
function rfxSurface(x, z) { if (LEVEL.id === 'speedway') return floorAt(x, z) + 0.04; if (LEVEL.ocean && floorAt(x, z) < WATER_Y - 0.05) return WATER_Y + 0.03; return null; }
function rfxTick() { const now = performance.now(), dt = Math.min(0.05, (now - RFX.t) / 1000); RFX.t = now;
  if (!LEVEL || !levelGroup || LEVEL.fly || state !== 'play') return; const on = LEVEL.id === 'speedway' ? 0.8 : LEVEL.ocean ? ENV.rain : 0;
  if (on < 0.12 && !RFX.rings.some(r => r.life > 0) && !RFX.drops.some(p => p.life > 0)) return; if (RFX.lvl !== levelGroup) rfxBuild();
  RFX.acc += dt * on * 110; while (RFX.acc > 1) { RFX.acc--; const a = Math.random() * 6.283, d = 1.5 + Math.random() * 16, x = camera.position.x + Math.cos(a) * d, z = camera.position.z + Math.sin(a) * d, y = rfxSurface(x, z); if (y == null) continue;
    const r = RFX.rings.find(r => r.life <= 0); if (r) { r.life = 1; r.m.position.set(x, y, z); r.m.visible = true; r.s = 0.25 + Math.random() * 0.4; }
    if (Math.random() < 0.5) { const p = RFX.drops.find(p => p.life <= 0); if (p) { p.life = 1; p.vy = 1.6 + Math.random(); p.m.position.set(x, y, z); p.m.visible = true; } } }
  for (const r of RFX.rings) if (r.life > 0) { r.life -= dt * 1.6; const k = 1 - r.life; r.m.scale.setScalar(r.s * (0.3 + k * 1.8)); r.m.material.opacity = Math.max(0, r.life) * 0.85; if (r.life <= 0) r.m.visible = false; }
  for (const p of RFX.drops) if (p.life > 0) { p.life -= dt * 4; p.vy -= 14 * dt; p.m.position.y += p.vy * dt; p.m.lookAt(camera.position.x, p.m.position.y, camera.position.z); p.m.material.opacity = Math.max(0, p.life) * 0.6; if (p.life <= 0) p.m.visible = false; } }
{ const _u = updateEnv; updateEnv = function () { const r = _u.apply(this, arguments); try { rfxTick(); if (!(LEVEL && LEVEL.ocean && swimHere())) SWE.out = true; } catch (_) {} return r; }; }
// jumping off a dock: you keep falling until you hit the water, splash, sink a couple of metres, then bob back up to swimming depth
const SWE = { out: true, air: false, vy: 0, sink: 0 };
{ const _sw = swimStep; swimStep = function (dt, mx, mz, sprint) { if (typeof OCSIT !== 'undefined' && OCSIT.g) { ocSitPin(); return; } const now = performance.now(), top = WATER_Y - 1.15;
  if (SWE.out) { SWE.out = false; SWE.vy = Math.min(0, player.vy || 0); SWE.air = player.pos.y > top + 0.3; SWE.sink = 0; if (!SWE.air && SWE.vy < -4) SWE.sink = Math.max(-9, SWE.vy * 0.5); }
  if (SWE.air) { const y0 = player.pos.y; _sw(dt, mx, mz, sprint); SWE.vy -= 22 * dt; player.pos.y = y0 + SWE.vy * dt; player.onGround = false;
    if (player.pos.y <= top) { SWE.air = false; SWE.sink = Math.max(-9, Math.min(-2.2, SWE.vy * 0.45)); try { SFX.splash(); SFX.splash(); } catch (_) {} rfxSplash(player.pos.x, player.pos.z, Math.min(1.6, -SWE.vy / 8)); } return; }
  if (SWE.sink < 0) { const y0 = player.pos.y; _sw(dt, mx, mz, sprint); SWE.sink += 7 * dt; player.pos.y = Math.max(groundH(player.pos.x, player.pos.z) + 0.3, y0 + SWE.sink * dt); if (SWE.sink >= 0) SWE.sink = 0; if (player.pos.y < top) player.pos.y = Math.min(top, player.pos.y); return; }
  if (player.pos.y < top - 0.05) { const y0 = player.pos.y; _sw(dt, mx, mz, sprint); if (!(keys.KeyC || keys.ControlLeft)) player.pos.y = Math.min(top, y0 + 2.2 * dt + (player.pos.y - y0)); return; }
  // with a jetpack, holding jump at the surface blasts you out of the water
  if (typeof hasGear === 'function' && hasGear('jet') && (keys.Space || jetHeld) && player.pos.y >= top - 0.1 && (player.jet == null || player.jet > 0)) { _sw(dt, mx, mz, sprint); player.pos.y = WATER_Y + 0.25; player.vy = 7; player.onGround = false; SWE.out = true; try { SFX.splash(); } catch (_) {} rfxSplash(player.pos.x, player.pos.z, 0.6); return; }
  return _sw(dt, mx, mz, sprint); }; }
function rfxSplash(x, z, k) { if (RFX.lvl !== levelGroup) rfxBuild(); const y = WATER_Y + 0.03;
  for (let i = 0; i < 6; i++) { const r = RFX.rings.find(r => r.life <= 0); if (!r) break; r.life = 1 + i * 0.15; r.m.position.set(x, y, z); r.m.visible = true; r.s = (0.8 + i * 0.5) * k; }
  for (let i = 0; i < 16; i++) { const p = RFX.drops.find(p => p.life <= 0); if (!p) break; const a = Math.random() * 6.283, d = Math.random() * 0.8; p.life = 1.4; p.vy = 3 + Math.random() * 4 * k; p.m.position.set(x + Math.cos(a) * d, y, z + Math.sin(a) * d); p.m.visible = true; } }
// riding in a boat: pin the player to the front bench every frame, wherever the boat bobs
function ocSitPin() { const g = OCSIT.g; if (!g || !g.parent) { OCSIT.g = null; return; } const w = new THREE.Vector3(0, 0.5, 0.75); g.localToWorld(w); player.pos.set(w.x, w.y - 0.75, w.z); player.vy = 0; player.onGround = true; }
{ const _u = updateEnv; updateEnv = function () { const r = _u.apply(this, arguments); try { if (typeof OCSIT !== 'undefined' && OCSIT.g) { if (!LEVEL || !LEVEL.ocean) OCSIT.g = null; else ocSitPin(); } } catch (_) {} return r; }; }
