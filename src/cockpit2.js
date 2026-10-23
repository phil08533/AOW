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
    // thin canopy struts, dressed: a lit inner strip, rivets, a cable run and clamp bands
    for (const st of SCOCK.struts || []) { const pr = st.geometry.parameters, long = pr.width > pr.height, Lw = long ? pr.width : pr.height, ax = (o, v) => long ? o.position.setX(v) : o.position.setY(v);
      const strip = part(st, long ? B(Lw * 0.96, 0.006, 0.004) : B(0.006, Lw * 0.96, 0.004), L('#4fd2ff'), 0, 0, pr.depth / 2 + 0.002); add.push(strip);
      const cab = part(st, long ? new THREE.CylinderGeometry(0.005, 0.005, Lw * 0.9, 6) : new THREE.CylinderGeometry(0.005, 0.005, Lw * 0.9, 6), M('#1a1c22'), long ? 0 : pr.width / 2 + 0.006, long ? -pr.height / 2 - 0.006 : 0, 0); if (long) cab.rotation.z = Math.PI / 2;
      const n = Math.max(3, Math.round(Lw / 0.1)); for (let i = 0; i < n; i++) { const v = -Lw / 2 + (i + 0.5) * Lw / n, r = part(st, B(0.008, 0.008, 0.006), rivet, 0, 0, pr.depth / 2 + 0.003); ax(r, v); if (long) r.position.y = pr.height * 0.3; else r.position.x = pr.width * 0.3;
        if (i % 3 === 1) { const band = part(st, long ? B(0.012, pr.height + 0.012, pr.depth + 0.012) : B(pr.width + 0.012, 0.012, pr.depth + 0.012), M('#5a6070'), 0, 0, 0); ax(band, v); } } }
    // a pine-tree air freshener hanging off the canopy spine
    { const fr = new THREE.Group(); fr.position.set(0.28, 0.425, -0.62); g.add(fr); add.push(fr); part(fr, new THREE.CylinderGeometry(0.0012, 0.0012, 0.09, 4), M('#e8e4dc'), 0, -0.045, 0);
      const tree = new THREE.Group(); tree.position.y = -0.09; fr.add(tree); const grn = M('#2f9a4a');
      for (const [w, y] of [[0.05, -0.012], [0.04, -0.03], [0.03, -0.046]]) { const t = part(tree, new THREE.CircleGeometry(w / 2, 3), grn, 0, y, 0); t.rotation.z = -Math.PI / 2; }
      part(tree, B(0.008, 0.014, 0.002), M('#6a4a2a'), 0, -0.062, 0); part(tree, B(0.026, 0.008, 0.0025), M('#ffd36a'), 0, -0.03, 0.001);
      SCOCK.fresh = fr; }
    for (const s of [-1, 1]) {
      // vertical glowing meters on the side panels
      for (let k = 0; k < 3; k++) { P(B(0.022, 0.16, 0.01), edge, s * (0.62 + k * 0.035), -0.33, -0.615); const bar = P(B(0.016, 0.15, 0.012), L(['#6fdc5a', '#ffd36a', '#4fd2ff'][k]), s * (0.62 + k * 0.035), -0.33, -0.612); bar.userData.meter = k + (s > 0 ? 3 : 0); }
      // toggle switch row
      for (let k = 0; k < 4; k++) { P(B(0.026, 0.026, 0.01), plate, s * (0.6 + k * 0.045), -0.195, -0.67); const t = P(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), M('#c8ccd4'), s * (0.6 + k * 0.045), -0.18, -0.665); t.rotation.x = 0.7 * (k % 2 ? 1 : -1); P(B(0.008, 0.008, 0.008), L(k % 2 ? '#6fdc5a' : '#ff6a3a'), s * (0.6 + k * 0.045), -0.2, -0.65); } }
    SCOCK.needles = [];
    // round gauges with needles
        for (const x of [-0.2, 0.2]) { const ring = P(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 24), plate, x, -0.3, -0.612); ring.rotation.x = Math.PI / 2; const face = P(new THREE.CircleGeometry(0.038, 24), M('#0e1418'), x, -0.3, -0.604);
      for (let k = 0; k < 9; k++) { const a = -2.2 + k * 0.55, tk = part(face, B(0.003, 0.01, 0.002), L('#ffd36a'), Math.sin(a) * 0.034, Math.cos(a) * 0.034, 0.001); tk.rotation.z = -a; }
      const n = new THREE.Group(); n.position.set(x, -0.3, -0.6); g.add(n); add.push(n); part(n, B(0.003, 0.036, 0.002), L('#ff3a2a'), 0, 0.016, 0); part(n, new THREE.CircleGeometry(0.006, 10), M('#c8ccd4'), 0, 0, 0.001); SCOCK.needles.push(n); }
    // warning lamp
    SCOCK.warn = P(new THREE.SphereGeometry(0.014, 10, 8), L('#ff3a2a'), 0.17, -0.19, -0.68);
    // side clusters: mini scope screens, small dials and button grids
    SCOCK.minis = [];
    const mini = (x, y, z, ry, w, h) => { const c = document.createElement('canvas'); c.width = 96; c.height = 64; const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter;
      P(B(w + 0.014, h + 0.014, 0.008), edge, x, y, z - 0.004).rotation.y = ry; const m = P(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, fog: false, toneMapped: false }), x, y, z + 0.002); m.rotation.y = ry; SCOCK.minis.push({ c, x: c.getContext('2d'), t, k: SCOCK.minis.length }); };
    const dial = (x, y, z, ry, r, col) => { const d = P(new THREE.CircleGeometry(r + 0.005, 18), plate, x, y, z); d.rotation.y = ry; const f = P(new THREE.CircleGeometry(r, 18), M('#0e1418'), x, y, z + 0.001); f.rotation.y = ry;
      const n = new THREE.Group(); n.position.set(x, y, z + 0.003); n.rotation.y = ry; g.add(n); add.push(n); part(n, B(0.002, r * 0.85, 0.001), L(col), 0, r * 0.4, 0); SCOCK.needles.push(n); };
    for (const s of [-1, 1]) { const ry = -s * 0.45;
      
      for (let k = 0; k < 3; k++) dial(s * (0.71 + k * 0.0), -0.04 + k * 0.0 - k * 0.055, -0.6 + k * 0.0, ry, 0.022, ['#ff3a2a', '#6fdc5a', '#4fd2ff'][k]);
      for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const b = P(B(0.018, 0.014, 0.01), L(['#ff6a3a', '#6fdc5a', '#4fd2ff', '#ffd36a'][(r + k) % 4]), s * (0.53 + k * 0.026), -0.15 - r * 0.022, -0.635); b.rotation.y = ry; b.userData.blink = r * 4 + k + (s > 0 ? 8 : 0); }
    }

    // banks of flip switches under the side screens, each with a status light
    for (const s of [-1, 1]) for (let r = 0; r < 1; r++) for (let k = 0; k < 7; k++) { const x = s * (0.12 + k * 0.04), y = -0.172, ry = 0;
      P(B(0.022, 0.024, 0.008), plate, x, y, -0.672).rotation.y = ry; const t = P(new THREE.CylinderGeometry(0.003, 0.004, 0.022, 6), M('#d8dce4'), x, y + 0.01, -0.665); t.rotation.x = ((k + r) % 3 ? 0.8 : -0.8); part(t, B(0.007, 0.006, 0.007), L(['#ff3a2a', '#ffd36a', '#c8ccd4'][(k + r) % 3]), 0, 0.012, 0);
      const lp = P(B(0.006, 0.006, 0.006), L((k + r) % 3 ? '#6fdc5a' : '#ff3a2a'), x, y - 0.006, -0.664); lp.userData.blink = 40 + r * 6 + k; }
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
    const tick = () => { if (g.visible) { const t = performance.now() / 1000; if (SCOCK.fresh) { const yv = fly && fly.vel ? fly.vel.dot(shipRight) * 0.004 : 0; SCOCK.fresh.userData.a = (SCOCK.fresh.userData.a || 0) * 0.96 + yv * 0.04; SCOCK.fresh.rotation.z = Math.sin(t * 1.9) * 0.12 + SCOCK.fresh.userData.a * 8; SCOCK.fresh.rotation.y = Math.sin(t * 0.7) * 0.6; } SCOCK.needles.forEach((n, i) => { n.rotation.z = -(Math.sin(t * (0.7 + i * 0.5)) * 1.4 + Math.sin(t * 3.1 + i) * 0.15); });
      if ((t * 2 | 0) !== SCOCK._ct) { SCOCK._ct = t * 2 | 0; SCOCK.clk(); }
      if ((t * 12 | 0) !== SCOCK._mt) { SCOCK._mt = t * 12 | 0; SCOCK.minis.forEach(m => { const x = m.x; x.fillStyle = '#041008'; x.fillRect(0, 0, 96, 64); x.strokeStyle = ['#6fdc5a', '#4fd2ff', '#ffd36a', '#ff6a3a'][m.k % 4]; x.lineWidth = 2; x.beginPath();
        if (m.k % 2) for (let i = 0; i < 96; i += 3) x.lineTo(i, 32 + Math.sin(i * 0.15 + t * 5 + m.k) * 18 * Math.sin(t + m.k)); else for (let i = 0; i < 8; i++) { const h = 10 + Math.abs(Math.sin(t * 2 + i + m.k)) * 46; x.rect(4 + i * 11, 62 - h, 8, h); }
        x.stroke(); m.t.needsUpdate = true; }); }
      g.children.forEach(o => { if (o.userData.blink != null) o.visible = Math.sin(t * (1 + (o.userData.blink % 5) * 0.4) + o.userData.blink * 1.7) > -0.6; });
      SCOCK.warn.material.color.setHSL(0, 1, Math.sin(t * 4) > 0.3 ? 0.55 : 0.12);
      g.children.forEach(o => { if (o.userData.meter != null) { const v = 0.35 + 0.6 * Math.abs(Math.sin(t * (0.6 + o.userData.meter * 0.23) + o.userData.meter)); o.scale.y = v; o.position.y = -0.405 + 0.075 * v; } }); }
      requestAnimationFrame(tick); };
    tick();
  };
})();
