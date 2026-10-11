// =================== SHIP SOUND: speakers in the walls (the Music Drive is parked for now) ===================
// ---- the ship's speakers: on the bridge, along the corridor and in each room ----
let SHIP_SPK = [];
{ const ob = LEVELS.ship.build; LEVELS.ship.build = function () { ob.call(this); SHIP_SPK = [];
  const spk = (x, z, y, ry) => { const g = new THREE.Group(); part(g, B(0.5, 0.7, 0.18), '#1e1c22', 0, 0, 0); part(g, Cy(0.17, 0.17, 0.03, 14), '#3a3d44', 0, 0.1, 0.1, Math.PI / 2); part(g, Cy(0.08, 0.08, 0.03, 10), '#3a3d44', 0, -0.2, 0.1, Math.PI / 2); part(g, B(0.04, 0.04, 0.02), glow('#4fd2ff'), 0.18, 0.28, 0.1); g.position.set(x, y, z); g.rotation.y = ry; props.add(g); SHIP_SPK.push([x, z]); };
  spk(-6.6, -14.2, 2.4, Math.PI / 4); spk(6.6, -14.2, 2.4, -Math.PI / 4); spk(-6.75, -3, 2.4, Math.PI / 2); spk(6.75, -3, 2.4, -Math.PI / 2);
  for (const r of SHIP_ROOMS) { const outer = r.side > 0 ? r.x1 : r.x0; spk(outer - r.side * 0.25, r.zc + 3.6, 2.5, r.side > 0 ? -Math.PI / 2 : Math.PI / 2); }
  for (let z = 6; z < 4 + Math.max(1, Math.ceil(SHIP_ROOMS.length / 2)) * 11; z += 11) SHIP_SPK.push([0, z]);
}; }
{ const _sp = musSpace; musSpace = function () { if (!MUS.ac) return _sp();
  if (LEVEL.id === 'ship' && SHIP_SPK.length && ['ship', 'drive'].includes(MUS.list)) { const now = MUS.ac.currentTime, set = (p, v) => p.setTargetAtTime(v, now, 0.15);
    let best = 1e9, bx = 0, bz = 0; for (const [x, z] of SHIP_SPK) { const d = Math.hypot(player.pos.x - x, player.pos.z - z); if (d < best) { best = d; bx = x; bz = z; } }
    const dx = bx - player.pos.x, dz = bz - player.pos.z, dl = Math.hypot(dx, dz) || 1, p = (dx * Math.cos(player.yaw) - dz * Math.sin(player.yaw)) / dl;
    set(MUS.gn.gain, Math.max(0.45, Math.min(1.15, 1.35 / (1 + best / 7)))); if (MUS.pan) set(MUS.pan.pan, Math.max(-0.6, Math.min(0.6, p * 0.6 * Math.min(1, best / 2)))); set(MUS.lp.frequency, Math.max(3500, 20000 - Math.max(0, best - 4) * 1400));
    return; }
  return _sp(); }; }
