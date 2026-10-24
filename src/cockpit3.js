// cockpit3.js: the ship cockpit gets real depth (lit, shaded panels, a thick dash lip, side consoles and a footwell),
// a clear plinth for the bobblehead, and every gauge reads something real: speed, hull, cruise, missiles, EMP, contacts,
// heading and a target lock on the aiming ring. Also the "C · Cockpit view" hint on PC while flying or racing.
(function () {
  const base = scockBuild;
  scockBuild = function () {
    base();
    const g = SCOCK.g, s0 = g.scale.x; g.scale.setScalar(1);
    // shaded materials: everything that isn't a light, a screen or glass now catches the cockpit lamps
    const lit = new Map();
    g.traverse(o => { if (!o.isMesh || !o.material || !o.material.isMeshBasicMaterial || o.material.map || o.material.transparent || o.material.toneMapped === false) return;
      let m = lit.get(o.material); if (!m) { m = new THREE.MeshLambertMaterial({ color: o.material.color.clone().multiplyScalar(1.6), fog: false }); lit.set(o.material, m); } o.material = m; });
    const M = h => new THREE.MeshLambertMaterial({ color: new THREE.Color(h).convertSRGBToLinear().multiplyScalar(1.6), fog: false }), L = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h), fog: false, toneMapped: false });
    const add = [], P = (geo, m, x, y, z, rx, ry, rz) => { const o = part(g, geo, m, x, y, z, rx, ry, rz); add.push(o); return o; };
    const hull = M('#2a2f3a'), dark = M('#14171d'), trim = M('#3a404c');
    // depth: a padded dash lip that juts toward you, angled side consoles, a sill under the canopy and a dark footwell
    P(B(1.66, 0.05, 0.12), dark, 0, -0.235, -0.58, 0.35); P(B(1.66, 0.02, 0.02), trim, 0, -0.213, -0.525);
    for (const s of [-1, 1]) { P(B(0.3, 0.06, 0.5), hull, s * 0.86, -0.36, -0.42, 0, 0, -s * 0.28); P(B(0.26, 0.01, 0.44), trim, s * 0.85, -0.325, -0.42, 0, 0, -s * 0.28);
      P(B(0.06, 0.5, 0.6), dark, s * 0.98, -0.12, -0.45, 0, 0, s * 0.12); P(B(0.05, 0.05, 0.9), hull, s * 0.92, 0.18, -0.55, 0.15, 0, s * 0.5); }
    P(B(1.4, 0.3, 0.4), M('#0c0e12'), 0, -0.62, -0.5);
    // cockpit lamps: a cool key from the canopy and a warm fill off the dash, only reaching the cockpit itself
    const key = new THREE.PointLight(0xbfd8ff, 1.6, 4, 1.5); key.position.set(0, 0.35, -0.3); g.add(key);
    const fill = new THREE.PointLight(0xffb070, 0.8, 3, 1.8); fill.position.set(0, -0.25, -0.35); g.add(fill);
    // the bobblehead spot: clear the switches and lamps crowding it, give it a plinth with a soft glow ring
    const B0 = SCOCK.bob.position; g.children.forEach(o => { if (o === SCOCK.bob || add.includes(o) || o.isLight) return; const p = o.position;
      if (Math.abs(p.x - B0.x) < 0.13 && p.y > B0.y - 0.07 && p.y < B0.y + 0.12 && Math.abs(p.z - B0.z) < 0.1) { const sz = o.geometry && o.geometry.parameters; if (!sz || !(sz.width > 0.3)) o.visible = false; } });
    P(new THREE.CylinderGeometry(0.05, 0.056, 0.016, 20), M('#3a404c'), B0.x, B0.y - 0.006, B0.z); P(new THREE.TorusGeometry(0.052, 0.003, 4, 24), L('#ffd36a'), B0.x, B0.y + 0.002, B0.z, Math.PI / 2);
    const bl = new THREE.PointLight(0xffe0a0, 0.6, 0.8, 2); bl.position.set(B0.x, B0.y + 0.16, B0.z + 0.06); g.add(bl);
    // the cockpit2 meters and warning lamp now take real readings from us, not a random wave
    SCOCK.meters = []; g.children.forEach(o => { if (o.userData.meter != null) { SCOCK.meters[o.userData.meter] = o; o.userData.meter = null; } });
    SCOCK.warnReal = SCOCK.warn; SCOCK.warn = { material: { color: new THREE.Color() } };
    // target lock text over the aiming ring
    const c = document.createElement('canvas'); c.width = 128; c.height = 32; SCOCK.lockC = c; SCOCK.lockT = new THREE.CanvasTexture(c);
    SCOCK.lock = P(new THREE.PlaneGeometry(0.12, 0.03), new THREE.MeshBasicMaterial({ map: SCOCK.lockT, transparent: true, fog: false, depthWrite: false, toneMapped: false }), 0, -0.06, -1.2); SCOCK.lock.visible = false;
    add.forEach(o => o.traverse(q => { q.renderOrder = 5; }));
    g.scale.setScalar(s0);
  };
  const gaugeSet = (n, v) => { if (n) n.rotation.z = -(-2.2 + 4.4 * clamp(v, 0, 1)); };
  const meterSet = (o, v) => { if (!o) return; v = clamp(v, 0.04, 1); o.scale.y = v; o.position.y = -0.405 + 0.075 * v; };
  const _st = step; step = function (dt) { _st(dt);
    if (!SCOCK.g || !SCOCK.g.visible || !fly || !fly.ship) return; const F = fly, sp = F.vel.length(), hp = clamp(player.hp / hullMax(), 0, 1);
    const SA = typeof SAMMO !== 'undefined' ? SAMMO : null, empK = SA ? (SA.empT > gameTime ? 0 : 1) : 1;
    const live = F.raiders.filter(r => !r.dead), near = live.filter(r => r.obj.position.distanceTo(player.pos) < 800).length;
    // big gauges: speed and hull; small dials: throttle, cruise, heading | missiles, EMP, contacts
    const N = SCOCK.needles || [], th = clamp((keys.KeyW ? 1 : 0) + move.y, 0, 1);
    gaugeSet(N[0], sp / 160); gaugeSet(N[1], hp);
    const head = ((player.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
    [th, ((F.cruise || 1) - 1) / 3, head, SA ? SA.rack / 6 : 1, empK, near / 8].forEach((v, i) => gaugeSet(N[2 + i], v));
    const Mt = SCOCK.meters || []; [hp, sp / 160, ((F.cruise || 1) - 1) / 3, SA ? SA.rack / 6 : 1, empK, near / 8].forEach((v, i) => meterSet(Mt[i], v));
    // warning lamp: only blinks when the hull is low
    if (SCOCK.warnReal) SCOCK.warnReal.material.color.setHSL(0, 1, hp < 0.35 ? (Math.sin(gameTime * 8) > 0 ? 0.55 : 0.12) : 0.08);
    // lock: a raider within a few degrees of the nose and in range turns the ring red and pulses it
    let best = null, bd = 1e9; for (const r of live) { const v = r.obj.position.clone().sub(player.pos), d = v.length(); if (d > 700) continue; if (v.normalize().dot(shipFwd) > 0.992 && d < bd) { bd = d; best = r; } }
    const ring = SCOCK.holo; if (best) { ring.material.color.set('#ff3a2a'); ring.scale.setScalar(1.15 + Math.sin(gameTime * 14) * 0.08); } else ring.scale.setScalar(1);
    SCOCK.lock.visible = !!best; if (best && (SCOCK.lockD | 0) !== (bd | 0)) { SCOCK.lockD = bd; const x = SCOCK.lockC.getContext('2d'); x.clearRect(0, 0, 128, 32); x.fillStyle = '#ff5a3a'; x.font = 'bold 20px monospace'; x.textAlign = 'center'; x.fillText('LOCK ' + Math.round(bd) + 'm', 64, 23); SCOCK.lockT.needsUpdate = true; }
  };
  // PC hint: "C · Cockpit view" for a few seconds each time you start flying or racing
  const hint = document.createElement('div'); hint.id = 'cockHint'; hint.innerHTML = '<kbd>C</kbd> Cockpit view'; hint.hidden = true;
  hint.style.cssText = 'position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:21;padding:6px 12px;background:rgba(8,10,16,.72);border:1px solid rgba(255,255,255,.22);color:#e8eef2;font:600 14px var(--mono,monospace);letter-spacing:.04em;pointer-events:none;transition:opacity .4s';
  document.body.appendChild(hint); const kb = hint.querySelector('kbd'); kb.style.cssText = 'display:inline-block;padding:1px 7px;margin-right:6px;background:#ffd36a;color:#14171d;font:700 13px var(--mono,monospace)';
  let was = false, until = 0;
  setInterval(() => { const on = typeof TOUCH !== 'undefined' && !TOUCH && state === 'play' && !dlgOpen && LEVEL && ((LEVEL.fly && fly && fly.ship) || (LEVEL.id === 'speedway' && typeof RC !== 'undefined' && RC.on));
    if (on && !was) until = performance.now() + 7000; was = !!on; const show = on && performance.now() < until; hint.hidden = !show; }, 250);
})();
