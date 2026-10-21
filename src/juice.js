// =================== JUICE: damage numbers, muzzle flashes, screen shake, impact flashes, footstep dust, level-up beams ===================
const FX = { shake: 0, nums: [], flashes: [], beams: [], lastHp: new WeakMap(), dustT: 0 };
const numTexCache = new Map();
function numTex(text, col) {
  const key = text + col; if (numTexCache.has(key)) return numTexCache.get(key);
  const c = document.createElement('canvas'); c.width = 128; c.height = 48; const x = c.getContext('2d');
  x.font = 'bold 34px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 6; x.strokeStyle = '#000'; x.strokeText(text, 64, 24); x.fillStyle = col; x.fillText(text, 64, 24);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; if (numTexCache.size > 300) numTexCache.clear(); numTexCache.set(key, t); return t;
}
function damageNumber(pos, amount, col, big) {
  if (PREFS.dmgNums === false) return;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: numTex(String(Math.round(amount)), col || '#ffd36a'), depthTest: false, depthWrite: false, transparent: true, fog: false }));
  s.layers.set(1); const sc = big ? 1.5 : 1; s.scale.set(1.3 * sc, 0.5 * sc, 1); s.position.copy(pos).add(V((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6)); scene.add(s);
  FX.nums.push({ s, life: 0.9, vy: 2.2 });
}
function shake(a) { FX.shake = Math.min(1.2, Math.max(FX.shake, a)); }
const fxFlashLight = new THREE.PointLight(0xffc870, 0, 9, 2); scene.add(fxFlashLight);
function muzzleFlash() {
  const p = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); fxFlashLight.position.copy(p).addScaledVector(d, 1.2); fxFlashLight.intensity = 2.4;
  FX.flashT = 0.06;
  if (typeof vmGun !== 'undefined' && vmGun.visible !== false) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: '#ffd8a0', transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending })); m.position.set(0.02, 0.06, -0.42); m.scale.setScalar(0.22 + Math.random() * 0.1); m.material.rotation = Math.random() * 6; vmGun.add(m); FX.flashes.push({ m, life: 0.05, parent: vmGun }); }
}
const FLASH_TEX = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(0.3, 'rgba(255,200,90,0.85)'); g.addColorStop(1, 'rgba(255,120,30,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); for (let i = 0; i < 6; i++) { x.save(); x.translate(32, 32); x.rotate(i * 1.05); x.fillStyle = 'rgba(255,230,160,0.7)'; x.fillRect(0, -2, 30, 4); x.restore(); } return new THREE.CanvasTexture(c); })();
function impactFlash(pos, col, size) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: col || '#ffd36a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.position.copy(pos); m.scale.setScalar(size || 1.2); scene.add(m); FX.flashes.push({ m, life: 0.12, grow: 6 });
}
function beam(pos, col, h) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, h || 14, 12, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }));
  m.position.copy(pos).add(V(0, (h || 14) / 2, 0)); scene.add(m); FX.beams.push({ m, life: 1.4, max: 1.4 });
}
// hooks into the existing game
{ const _f = fire; fire = function () { const before = player.ammo, c0 = player.cool; const r = _f(); if (player.ammo !== before || (S.clip && !handMelee() && player.cool > c0)) { muzzleFlash(); shake(gun().kind === 'rocket' || gun().splash ? 0.35 : gun().kind === 'shotgun' || gun().pellets ? 0.25 : 0.08); } return r; }; }
{ const _h = hurt; hurt = function (dmg, src) { const hp0 = player.hp, r = _h(dmg, src); const lost = hp0 - player.hp; if (lost > 0.5) { shake(Math.min(0.6, 0.12 + lost / maxHp() * 2)); damageNumber(player.pos.clone().add(V(0, 2.1, 0)), lost, '#ff5a4a'); } return r; }; }
{ const _k = kill; kill = function (e) { const p = e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)); impactFlash(p, e.def.boss ? '#ff4040' : '#ffb347', e.def.boss ? 4 : 1.8); if (e.def.boss) { shake(0.9); beam(e.obj.position.clone(), '#ffd36a', 30); } return _k(e); }; }
{ const _g = gainXp; gainXp = function (n) { const lv0 = S.lvl, r = _g(n); if (S.lvl > lv0 && player.pos) { beam(player.pos.clone(), '#ffd36a', 18); burst(player.pos.clone().add(V(0, 1, 0)), '#ffd36a', 40, 7); burst(player.pos.clone().add(V(0, 1, 0)), '#ffffff', 20, 4); shake(0.3); } return r; }; }
{ const _b = SFX.boom; SFX.boom = function (...a) { shake(0.4); return _b.apply(this, a); }; }
// per frame: watch enemy health for damage numbers, animate effects, shake the camera, kick up dust
{ const _s = step; step = function (dt) {
  _s(dt);
  for (const e of enemies) { if (e.dead) { FX.lastHp.delete(e); continue; } const last = FX.lastHp.get(e); if (last != null && e.hp < last - 0.5 && e.obj.visible) { const d = last - e.hp, crit = d > e.max * 0.25; damageNumber(e.obj.position.clone().add(V(0, e.def.hy * e.sc * 2 + 0.6, 0)), d, crit ? '#ff9a3c' : '#ffe06a', crit); impactFlash(e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), '#ffd36a', 0.7 + Math.min(1.5, d / e.max * 3)); } FX.lastHp.set(e, e.hp); }
  for (let i = FX.nums.length - 1; i >= 0; i--) { const n = FX.nums[i]; n.life -= dt; n.s.position.y += n.vy * dt; n.vy *= 0.94; n.s.material.opacity = Math.min(1, n.life * 2.5); if (n.life <= 0) { scene.remove(n.s); n.s.material.dispose(); FX.nums.splice(i, 1); } }
  for (let i = FX.flashes.length - 1; i >= 0; i--) { const f = FX.flashes[i]; f.life -= dt; if (f.grow) f.m.scale.multiplyScalar(1 + f.grow * dt * 0.2); f.m.material.opacity = Math.max(0, f.life * 8); if (f.life <= 0) { (f.parent || scene).remove(f.m); f.m.material.dispose(); FX.flashes.splice(i, 1); } }
  for (let i = FX.beams.length - 1; i >= 0; i--) { const b = FX.beams[i]; b.life -= dt; b.m.material.opacity = 0.55 * (b.life / b.max); b.m.scale.x = b.m.scale.z = 1 + (1 - b.life / b.max) * 1.5; if (b.life <= 0) { scene.remove(b.m); b.m.geometry.dispose(); b.m.material.dispose(); FX.beams.splice(i, 1); } }
  if (FX.flashT > 0) { FX.flashT -= dt; if (FX.flashT <= 0) fxFlashLight.intensity = 0; }
  if (FX.shake > 0.001 && PREFS.shake !== false) { const a = FX.shake * 0.12; camera.position.add(V((Math.random() - 0.5) * a, (Math.random() - 0.5) * a, (Math.random() - 0.5) * a)); camera.rotation.z += (Math.random() - 0.5) * a * 0.3; FX.shake *= Math.pow(0.02, dt); }
  // footstep dust on dirt and sand
  if (LEVEL.terrain && !LEVEL.fly && player.onGround && !VH.on && !S.inSub) { const sp = Math.hypot(move.x, move.y) + ((keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD) ? 1 : 0); FX.dustT -= dt * sp; if (FX.dustT <= 0) { FX.dustT = 0.32; const pal = LEVEL.palette || {}; burst(player.pos.clone().add(V((Math.random() - 0.5) * 0.4, 0.05, (Math.random() - 0.5) * 0.4)), pal.dirt || '#a08a70', 2, 1.2); } }
  if ((VH.on || RC.on) && Math.random() < 0.6) { const pal = LEVEL.palette || {}; burst(player.pos.clone().add(V((Math.random() - 0.5) * 1.6, 0.1, (Math.random() - 0.5) * 1.6)), pal.sand || pal.dirt || '#a08a70', 1, 2.5); }
}; }
