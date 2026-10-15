// =================== OTHER PILOTS IN SPACE: see each other's ships ===================
// Other players already fly in the same space. This makes them easy to spot and read: their ships pitch and bank
// the way they're really flying, carry an engine glow, and wear a name tag and beacon that stay readable from far away.
const RSHIP = { tex: null };
function rshipDot() { if (RSHIP.tex) return RSHIP.tex; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(127,232,255,.8)'); g.addColorStop(1, 'rgba(127,232,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return RSHIP.tex = new THREE.CanvasTexture(c); }
{ const _sp = syncPeers; syncPeers = function (peers) { const r0 = _sp.apply(this, arguments);
  if (LEVEL && LEVEL.fly) for (const peer of peers || []) { const r = remotes.get(peer.peer), pr = peer.presence || {}; if (!r) continue; r.pt = typeof pr.pt === 'number' ? clamp(pr.pt, -1.5, 1.5) : 0;
    if (!r.beacon) { r.beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: rshipDot(), color: '#7fe8ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); r.obj.add(r.beacon);
      r.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: rshipDot(), color: '#ffb03b', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); r.glow.scale.setScalar(4); r.glow.position.set(0, 0, -5.5); r.obj.add(r.glow);
      if (!RSHIP.told) { RSHIP.told = true; toast('PILOTS NEARBY', 'Other players are flying here. Look for the blue beacons.', 3); } } }
  return r0; }; }
{ const _st = step; step = function (dt) { _st(dt); if (!LEVEL || !LEVEL.fly) return;
  for (const r of remotes.values()) { const o = r.obj, d = o.position.distanceTo(camera.position);
    o.rotation.order = 'YXZ'; o.rotation.x += (-(r.pt || 0) - o.rotation.x) * Math.min(1, dt * 8);
    const yr = r.lastYaw == null ? 0 : Math.atan2(Math.sin(r.yaw - r.lastYaw), Math.cos(r.yaw - r.lastYaw)) / Math.max(dt, 1e-3); r.lastYaw = r.yaw; o.rotation.z += (clamp(yr * 0.35, -0.7, 0.7) - o.rotation.z) * Math.min(1, dt * 4);
    const s = Math.max(1, d / 45); r.plate.scale.set(2.2 * s, 0.48 * s, 1); r.plate.position.y = 3 + s * 1.2;
    if (r.beacon) { r.beacon.scale.setScalar(Math.max(3, d * 0.035)); r.beacon.material.opacity = clamp((d - 60) / 200, 0, 0.9); }
    if (r.glow) r.glow.material.opacity = 0.6 + Math.sin(gameTime * 20) * 0.2;
  } }; }
