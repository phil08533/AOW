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
    // retro leather: tufted burgundy rolls with stitching, a tan dash pad and an 80s sunset stripe
    const lt = (base, hi, rows) => { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
      x.fillStyle = base; x.fillRect(0, 0, 128, 128); const h = 128 / rows;
      for (let r = 0; r < rows; r++) { const gr = x.createLinearGradient(0, r * h, 0, r * h + h); gr.addColorStop(0, hi); gr.addColorStop(0.5, base); gr.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = gr; x.fillRect(0, r * h + 1, 128, h - 2);
        x.strokeStyle = 'rgba(255,220,170,.35)'; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(0, r * h + 3); x.lineTo(128, r * h + 3); x.stroke(); }
      for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return new THREE.MeshBasicMaterial({ map: t, fog: false }); };
    const burg = lt('#2e0c10', '#4e1c20', 5), tan = lt('#6a4a34', '#8a6448', 2);
    for (const s of [-1, 1]) { const sp = P(new THREE.PlaneGeometry(0.88, 0.48), burg, s * 0.705, -0.32, -0.45); sp.rotation.y = -s * Math.PI / 2;
      for (const [w, c, y] of [[0.012, '#ff3a5a', -0.1], [0.008, '#ff8a3a', -0.08], [0.006, '#ffd36a', -0.064]]) { const st = P(B(0.004, w, 0.88), L(c), s * 0.703, y, -0.45); }
      const wing = P(new THREE.PlaneGeometry(0.34, 0.2), burg, s * 0.66, -0.1, -0.64); wing.rotation.y = -s * 0.45;
      for (const [c, y] of [['#ff3a5a', -0.03], ['#ff8a3a', -0.042], ['#ffd36a', -0.052]]) { const st = P(B(0.34, 0.007, 0.004), L(c), s * 0.66, y, -0.638); st.rotation.y = -s * 0.45; }
      const arm = P(B(0.12, 0.05, 0.5), tan, s * 0.65, -0.5, -0.4); }
    const pad = P(B(1.62, 0.035, 0.08), tan, 0, -0.19, -0.7); pad.rotation.x = 0.15;
    for (const [c, y] of [['#ff3a5a', -0.505], ['#ff8a3a', -0.518], ['#ffd36a', -0.528]]) P(B(1.6, 0.007, 0.006), L(c), 0, y, -0.618);
    const lowP = P(new THREE.PlaneGeometry(1.2, 0.12), burg, 0, -0.58, -0.62);
    // chrome bezels around the three screens
    const chrome = M('#a8b0bc');
    for (const [sx, w] of [[-0.42, 0.26], [0, 0.22], [0.42, 0.26]]) { const h = w * 0.69, z = -0.616 + Math.abs(sx) * 0.08; for (const [bw, bh, bx, by] of [[w + 0.02, 0.008, 0, h / 2 + 0.004], [w + 0.02, 0.008, 0, -h / 2 - 0.004], [0.008, h, -w / 2 - 0.004, 0], [0.008, h, w / 2 + 0.004, 0]]) { const b = P(B(bw, bh, 0.006), chrome, sx + bx, -0.315 + by, z); b.rotation.y = sx > 0 ? -0.28 : sx < 0 ? 0.28 : 0; } }
    // little digital clock and rocker buttons, very 80s
    const ck = document.createElement('canvas'); ck.width = 96; ck.height = 32; const cx = ck.getContext('2d'); const ckT = new THREE.CanvasTexture(ck);
    P(B(0.1, 0.035, 0.01), edge, 0, -0.455, -0.616); const ckM = P(new THREE.PlaneGeometry(0.09, 0.028), new THREE.MeshBasicMaterial({ map: ckT, fog: false, toneMapped: false }), 0, -0.455, -0.61);
    SCOCK.clk = () => { cx.fillStyle = '#100808'; cx.fillRect(0, 0, 96, 32); cx.fillStyle = '#ff5a3a'; cx.font = 'bold 24px monospace'; cx.textAlign = 'center'; const d = new Date(); cx.fillText(String(d.getHours()).padStart(2, '0') + (d.getSeconds() % 2 ? ':' : ' ') + String(d.getMinutes()).padStart(2, '0'), 48, 25); ckT.needsUpdate = true; };
    for (let k = 0; k < 6; k++) P(B(0.028, 0.016, 0.01), M(k % 3 ? '#2a2f3a' : '#6a2a2c'), -0.2 + k * 0.08 - (k > 2 ? -0.0 : 0) + (k > 2 ? 0.0 : 0), -0.38, -0.616);
    // edge piping on the dash
    P(B(1.6, 0.012, 0.012), edge, 0, -0.215, -0.615);
    add.forEach(o => o.traverse(c => { c.renderOrder = 5; }));
    g.scale.setScalar(s0);
    const tick = () => { if (g.visible) { const t = performance.now() / 1000; SCOCK.needles.forEach((n, i) => { n.rotation.z = -(Math.sin(t * (0.7 + i * 0.5)) * 1.4 + Math.sin(t * 3.1 + i) * 0.15); });
      if ((t * 2 | 0) !== SCOCK._ct) { SCOCK._ct = t * 2 | 0; SCOCK.clk(); }
      SCOCK.warn.material.color.setHSL(0, 1, Math.sin(t * 4) > 0.3 ? 0.55 : 0.12);
      g.children.forEach(o => { if (o.userData.meter != null) { const v = 0.35 + 0.6 * Math.abs(Math.sin(t * (0.6 + o.userData.meter * 0.23) + o.userData.meter)); o.scale.y = v; o.position.y = -0.405 + 0.075 * v; } }); }
      requestAnimationFrame(tick); };
    tick();
  };
})();
