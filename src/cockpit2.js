// cockpit2.js: riveted canopy, gauges, switches and meters for the ship cockpit, plus a console-style mobile MENU tab
(function () {
  const css = document.createElement('style');
  css.textContent = `#pullTab{width:150px!important;height:28px!important;border-radius:10px 10px 0 0!important;background:linear-gradient(#3a404c,#1d2129 55%,#14171d)!important;border:2px solid #0b0d11!important;border-bottom:0!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -3px 0 rgba(0,0,0,.4),0 -2px 8px rgba(0,0,0,.5)!important;backdrop-filter:none!important;color:#ffd36a!important;text-shadow:0 0 6px rgba(255,190,80,.6),0 1px 0 #000!important;font:700 13px var(--hud)!important;letter-spacing:.3em!important}
#pullTab::after{content:"";position:absolute;inset:5px 7px auto 7px;height:4px;background:radial-gradient(circle,#8a8f9a 1.6px,transparent 2px) left/8px 4px no-repeat,radial-gradient(circle,#8a8f9a 1.6px,transparent 2px) right/8px 4px no-repeat;pointer-events:none}
#pullTab::before{background:#4fd2ff!important;box-shadow:0 0 6px #4fd2ff!important;opacity:.85}`;
  document.head.appendChild(css);
  const base = scockBuild;
  scockBuild = function () {
    base();
    const g = SCOCK.g, s0 = g.scale.x; g.scale.setScalar(1);
    const M = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).convertSRGBToLinear(), fog: false }), L = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h), fog: false, toneMapped: false });
    const rivet = M('#8a8f9a'), plate = M('#343a46'), edge = M('#0b0d11'), add = [];
    const P = (geo, m, x, y, z) => { const o = part(g, geo, m, x, y, z); add.push(o); return o; };
    // riveted canopy bar and corner plates
    for (let i = -7; i <= 7; i++) P(B(0.012, 0.012, 0.01), rivet, i * 0.11, -0.228, -0.61);
    for (const s of [-1, 1]) { const c = P(B(0.22, 0.16, 0.02), plate, s * 0.78, 0.12, -0.6); c.rotation.z = s * 0.5; for (const [dx, dy] of [[-0.08, 0.05], [0.08, 0.05], [-0.08, -0.05], [0.08, -0.05]]) { const r = part(c, B(0.012, 0.012, 0.01), rivet, dx, dy, 0.012); }
      // vertical glowing meters on the side panels
      for (let k = 0; k < 3; k++) { P(B(0.022, 0.16, 0.01), edge, s * (0.62 + k * 0.035), -0.33, -0.615); const bar = P(B(0.016, 0.15, 0.012), L(['#6fdc5a', '#ffd36a', '#4fd2ff'][k]), s * (0.62 + k * 0.035), -0.33, -0.612); bar.userData.meter = k + (s > 0 ? 3 : 0); }
      // toggle switch row
      for (let k = 0; k < 4; k++) { P(B(0.026, 0.026, 0.01), plate, s * (0.6 + k * 0.045), -0.195, -0.67); const t = P(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), M('#c8ccd4'), s * (0.6 + k * 0.045), -0.18, -0.665); t.rotation.x = 0.7 * (k % 2 ? 1 : -1); P(B(0.008, 0.008, 0.008), L(k % 2 ? '#6fdc5a' : '#ff6a3a'), s * (0.6 + k * 0.045), -0.2, -0.65); } }
    // round gauges with needles
    SCOCK.needles = [];
    for (const x of [-0.2, 0.2]) { const ring = P(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 24), plate, x, -0.3, -0.612); ring.rotation.x = Math.PI / 2; const face = P(new THREE.CircleGeometry(0.038, 24), M('#0e1418'), x, -0.3, -0.604);
      for (let k = 0; k < 9; k++) { const a = -2.2 + k * 0.55, tk = part(face, B(0.003, 0.01, 0.002), L('#ffd36a'), Math.sin(a) * 0.034, Math.cos(a) * 0.034, 0.001); tk.rotation.z = -a; }
      const n = new THREE.Group(); n.position.set(x, -0.3, -0.6); g.add(n); add.push(n); part(n, B(0.003, 0.036, 0.002), L('#ff3a2a'), 0, 0.016, 0); part(n, new THREE.CircleGeometry(0.006, 10), M('#c8ccd4'), 0, 0, 0.001); SCOCK.needles.push(n); }
    // warning lamp
    SCOCK.warn = P(new THREE.SphereGeometry(0.014, 10, 8), L('#ff3a2a'), 0.17, -0.19, -0.68);
    // edge piping on the dash
    P(B(1.6, 0.012, 0.012), edge, 0, -0.215, -0.615);
    add.forEach(o => o.traverse(c => { c.renderOrder = 5; }));
    g.scale.setScalar(s0);
    const tick = () => { if (g.visible) { const t = performance.now() / 1000; SCOCK.needles.forEach((n, i) => { n.rotation.z = -(Math.sin(t * (0.7 + i * 0.5)) * 1.4 + Math.sin(t * 3.1 + i) * 0.15); });
      SCOCK.warn.material.color.setHSL(0, 1, Math.sin(t * 4) > 0.3 ? 0.55 : 0.12);
      g.children.forEach(o => { if (o.userData.meter != null) { const v = 0.35 + 0.6 * Math.abs(Math.sin(t * (0.6 + o.userData.meter * 0.23) + o.userData.meter)); o.scale.y = v; o.position.y = -0.405 + 0.075 * v; } }); }
      requestAnimationFrame(tick); };
    tick();
  };
})();
