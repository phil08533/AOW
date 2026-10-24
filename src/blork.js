// blork.js: the Blork Studios logo, shot like our cutscenes (one take, ~6 s, Phil's storyboard).
// A little drone trooper runs across a dusk ridge, the Blork ship swoops in and shoots him, blood sprays over the screen,
// the screen floods red in brush strokes and BLORK STUDIOS is hand-lettered on top. Click skips. Falls back to the old card.
const BLORK_T = { ship: 1.3, fire: 2.45, hit: 2.8, splat: 2.95, flood: 3.45, text: 4.05, end: 6.4 };
// hand-lettered strokes, each letter in a box 1 high, x from 0 to its width (Phil's marker letters)
const BLORK_GLYPH = {
  B: [0.62, [[[0, 0], [0, 1]], [[0, 0], [0.35, 0], [0.55, 0.1], [0.56, 0.3], [0.36, 0.46], [0, 0.47]], [[0, 0.47], [0.42, 0.48], [0.62, 0.62], [0.62, 0.84], [0.42, 1], [0, 1]]]],
  L: [0.52, [[[0, 0], [0, 1], [0.52, 1]]]],
  O: [0.66, [Array.from({ length: 19 }, (_, i) => { const a = -Math.PI / 2 + i / 18 * Math.PI * 2.05; return [0.33 + Math.cos(a) * 0.33, 0.5 + Math.sin(a) * 0.5]; })]],
  R: [0.6, [[[0, 1], [0, 0], [0.36, 0], [0.56, 0.12], [0.56, 0.32], [0.36, 0.46], [0, 0.47]], [[0.22, 0.47], [0.6, 1]]]],
  K: [0.6, [[[0, 0], [0, 1]], [[0.56, 0], [0, 0.56]], [[0.17, 0.4], [0.6, 1]]]],
  S: [0.58, [[[0.56, 0.12], [0.4, 0], [0.16, 0], [0.02, 0.14], [0.06, 0.34], [0.3, 0.49], [0.52, 0.62], [0.58, 0.82], [0.42, 1], [0.15, 1], [0, 0.87]]]],
  T: [0.62, [[[0, 0], [0.62, 0]], [[0.31, 0], [0.31, 1]]]],
  U: [0.6, [[[0, 0], [0, 0.74], [0.12, 0.95], [0.3, 1], [0.48, 0.95], [0.6, 0.74], [0.6, 0]]]],
  D: [0.6, [[[0, 0], [0, 1]], [[0, 0], [0.3, 0], [0.52, 0.14], [0.6, 0.5], [0.52, 0.86], [0.3, 1], [0, 1]]]],
  I: [0.1, [[[0.05, 0], [0.05, 1]]]] };
function blorkWord(x, word, cx, cy, h, prog, rot) { // prog 0..1 across the whole word; letters write on one after another
  const gap = 0.2, w = [...word].reduce((a, ch) => a + BLORK_GLYPH[ch][0] + gap, -gap) * h, n = word.length;
  x.save(); x.translate(cx, cy); x.rotate(rot); x.lineCap = x.lineJoin = 'round'; x.lineWidth = h * 0.14; x.strokeStyle = '#ececec';
  let ox = -w / 2; [...word].forEach((ch, i) => { const [gw, strokes] = BLORK_GLYPH[ch], p = Math.max(0, Math.min(1, prog * n - i));
    if (p > 0) { const all = strokes.reduce((a, s) => a + s.length - 1, 0); let left = p * all;
      for (const s of strokes) { if (left <= 0) break; x.beginPath(); const P = ([a, b], k) => [ox + a * h + Math.sin(i * 7 + k * 3) * h * 0.012, -h / 2 + b * h + Math.cos(i * 5 + k * 2) * h * 0.012];
        let q = P(s[0], 0); x.moveTo(q[0], q[1]); for (let k = 1; k < s.length && left > 0; k++) { const a = P(s[k - 1], k - 1), b = P(s[k], k), f = Math.min(1, left); x.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); left -= 1; } x.stroke(); } }
    ox += (gw + gap) * h; }); x.restore(); }
function blorkIntro(stageEl, done) {
  const W = innerWidth, H = innerHeight, PX = 3, T = BLORK_T;
  const gl = document.createElement('canvas'), ov = document.createElement('canvas');
  for (const c of [gl, ov]) c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
  ov.width = W; ov.height = H; stageEl.append(gl, ov);
  const r = new THREE.WebGLRenderer({ canvas: gl, antialias: false }); r.setPixelRatio(1); r.setSize(Math.ceil(W / PX), Math.ceil(H / PX), false); r.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(W > H ? 38 : 58, W / H, 0.1, 300); cam.position.set(0, 1.5, 10); cam.lookAt(0, 1.6, 0);
  const lin = c => new THREE.Color(c).convertSRGBToLinear(), M = c => new THREE.MeshLambertMaterial({ color: lin(c), flatShading: true }), G = c => new THREE.MeshBasicMaterial({ color: lin(c) });
  // dusk sky with the setting sun, a far ridge and the rolling ground line from the drawing
  { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1a1030'); g.addColorStop(0.45, '#6a2a48'); g.addColorStop(0.72, '#e0603a'); g.addColorStop(0.85, '#ffb066'); g.addColorStop(1, '#ffd8a0'); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; sc.background = t; }
  sc.fog = new THREE.Fog(lin('#c8604a'), 30, 120);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 28), G('#ffcf7a')); sun.position.set(-14, 2, -110); sc.add(sun);
  const hill = (w, d, amp, f, col, z, y) => { const g = new THREE.PlaneGeometry(w, d, 90, 6); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const X = p.getX(i), Z = p.getZ(i); p.setY(i, Math.sin(X * f) * amp + Math.sin(X * f * 2.7 + 1) * amp * 0.4 + (Z < -d / 2 + 1 ? 0 : 0)); } g.computeVertexNormals(); const m = new THREE.Mesh(g, M(col)); m.position.set(0, y, z); sc.add(m); return m; };
  hill(260, 40, 2.6, 0.06, '#4a2a34', -60, -1); hill(220, 40, 0.35, 0.18, '#5a4038', -48, 0.3); const ground = hill(160, 80, 0.12, 0.35, '#6a5244', -20, 0);
  const gy = x => Math.sin(x * 0.35) * 0.12 + Math.sin(x * 0.35 * 2.7 + 1) * 0.048;
  sc.add(new THREE.HemisphereLight(lin('#ffd0b0'), lin('#2a1a30'), 0.85)); const key = new THREE.DirectionalLight(lin('#ffb070'), 1.0); key.position.set(-6, 5, 4); sc.add(key);
  // the drone trooper: big round helmet, box body, swinging limbs
  const man = new THREE.Group(), body = new THREE.Group(); man.add(body); sc.add(man);
  const box = (w, h, d, c, x, y, z, par) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); (par || body).add(m); return m; };
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), M('#c8ccd2')); head.position.y = 1.62; body.add(head); box(0.42, 0.12, 0.2, '#1a1e24', 0.12, 1.64, 0.22).material = G('#3fd8ff');
  box(0.5, 0.64, 0.34, '#5a6a3a', 0, 1.06, 0); box(0.3, 0.4, 0.16, '#3a4428', -0.02, 1.1, -0.24);
  const limb = (x, y, len, w, c) => { const p = new THREE.Group(); p.position.set(x, y, 0); body.add(p); box(w, len, w, c, 0, -len / 2, 0, p); return p; };
  const legs = [limb(0, 0.76, 0.76, 0.2, '#3a4428'), limb(0, 0.76, 0.76, 0.2, '#3a4428')], arms = [limb(0, 1.34, 0.56, 0.15, '#5a6a3a'), limb(0, 1.34, 0.56, 0.15, '#5a6a3a')];
  legs[0].position.x = 0.13; legs[1].position.x = -0.13; arms[0].position.x = 0.33; arms[1].position.x = -0.33; man.rotation.y = Math.PI / 2;
  // the Blork ship: a cockpit ball on a bar with a ring pod at each end, side on like the sketch
  const ship = new THREE.Group(); sc.add(ship);
  { const hull = M('#6a7078'); ship.add(new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 10), hull)); const win = new THREE.Mesh(new THREE.CircleGeometry(0.42, 14), G('#200608')); win.position.z = 0.72; ship.add(win);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.6, 8), hull); bar.rotation.z = Math.PI / 2; ship.add(bar);
    for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.17, 8, 16), hull); ring.position.x = s * 1.95; ship.add(ring); const core = new THREE.Mesh(new THREE.CircleGeometry(0.34, 12), G('#ff5a3a')); core.position.set(s * 1.95, 0, 0.05); ship.add(core); } }
  const bolts = [0, 1, 2].map(() => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 1.3), G('#ff2a2a')); b.visible = false; sc.add(b); return b; });
  const flash = new THREE.PointLight(lin('#ff3a2a'), 0, 12); sc.add(flash);
  const gore = Array.from({ length: 90 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), G(Math.random() < 0.5 ? '#c00808' : '#ff2020')); m.visible = false; sc.add(m); return { m, v: new THREE.Vector3() }; });
  // 2D blood: streaks that burst out from the hit, then a flood of brush strokes, then the letters
  const x = ov.getContext('2d'), rnd = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(7);
  const streaks = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2 + rnd() * 0.4, L = (0.35 + rnd() * 0.5) * Math.max(W, H), bend = (rnd() - 0.5) * 0.9; return { a, L, bend, w: (0.025 + rnd() * 0.03) * Math.min(W, H), d: rnd() * 0.25 }; });
  const strokes = Array.from({ length: 16 }, (_, i) => ({ y: (i - 1.5) / 12 * H, w: H * (0.13 + rnd() * 0.04), l: rnd() * 0.12 * W, rgt: rnd() * 0.12 * W, d: i * 0.025 + rnd() * 0.05 }));
  let hitPt = null, t0 = performance.now(), last = t0, raf = 0, over = false, shake = 0;
  const v = new THREE.Vector3();
  const frame = () => { if (over) return; raf = requestAnimationFrame(frame); const now = performance.now(), t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    // run in from the left; after the hit, fly back and tumble
    if (t < T.hit) { const mx = -7 + t * 2.6; man.position.set(mx, gy(mx), 0.6); const ph = t * 13; legs[0].rotation.x = Math.sin(ph) * 0.9; legs[1].rotation.x = -Math.sin(ph) * 0.9; arms[0].rotation.x = -Math.sin(ph) * 0.8; arms[1].rotation.x = Math.sin(ph) * 0.8; body.position.y = Math.abs(Math.sin(ph)) * 0.08; body.rotation.x = 0.18; }
    else { if (!man.userData.v) { man.userData.v = new THREE.Vector3(-2.4, 4.2, 0.3); hitPt = man.position.clone().add(new THREE.Vector3(0, 1.1, 0)); flash.position.copy(hitPt); flash.intensity = 6; shake = 0.35;
        for (const g of gore) { g.m.visible = true; g.m.position.copy(hitPt); g.v.set((Math.random() - 0.3) * 7, Math.random() * 7, (Math.random() - 0.2) * 5); } }
      const mv = man.userData.v; mv.y -= 14 * dt; man.position.addScaledVector(mv, dt); if (man.position.y < gy(man.position.x)) { man.position.y = gy(man.position.x); mv.set(mv.x * 0.4, 0, 0); } body.rotation.x -= dt * 9 * Math.min(1, mv.length()); legs[0].rotation.x = 1.2; arms[1].rotation.x = -2.4; arms[0].rotation.x = 2; }
    for (const g of gore) if (g.m.visible) { g.v.y -= 14 * dt; g.m.position.addScaledVector(g.v, dt); if (g.m.position.y < gy(g.m.position.x) + 0.03) { g.m.position.y = gy(g.m.position.x) + 0.03; g.v.multiplyScalar(0.2); } }
    flash.intensity = Math.max(0, flash.intensity - dt * 14);
    // the ship swoops down from the top right, hangs, fires three bolts, then peels off
    const sp = Math.max(0, Math.min(1, (t - T.ship) / (T.fire - T.ship))), e = 1 - Math.pow(1 - sp, 3);
    ship.position.set(13 - e * 9 + Math.max(0, t - T.hit) * 3, 8 - e * 5 + Math.max(0, t - T.hit) * 2.4, -4 + e * 2); ship.rotation.set(0.12, -0.25 + e * 0.15, (1 - e) * 0.5 + Math.sin(t * 3) * 0.04);
    bolts.forEach((b, i) => { const ft = T.fire + i * 0.11, k = (t - ft) / 0.32; b.visible = k > 0 && k < 1; if (!b.visible) return; const tgt = man.position.clone().add(new THREE.Vector3(i * 0.3 - 0.3, 1.1, 0)), from = ship.position.clone().add(new THREE.Vector3(-0.6, -0.4, 0.4)); b.position.lerpVectors(from, tgt, k); b.lookAt(tgt); });
    cam.position.set((Math.random() - 0.5) * shake, 1.5 + (Math.random() - 0.5) * shake, 10); shake = Math.max(0, shake - dt * 0.8); r.render(sc, cam);
    // overlay
    x.clearRect(0, 0, W, H);
    if (hitPt && t > T.splat) { v.copy(hitPt).project(cam); const hx = (v.x + 1) / 2 * W, hy = (1 - v.y) / 2 * H; x.strokeStyle = '#ff3a3a'; x.fillStyle = '#ff3a3a'; x.lineCap = 'round';
      for (const s of streaks) { const k = Math.max(0, Math.min(1, (t - T.splat - s.d) / 0.3)); if (!k) continue; const ex = hx + Math.cos(s.a) * s.L * k, ey = hy + Math.sin(s.a) * s.L * k, mx = (hx + ex) / 2 - Math.sin(s.a) * s.L * s.bend * k * 0.3, my = (hy + ey) / 2 + Math.cos(s.a) * s.L * s.bend * k * 0.3;
        x.lineWidth = s.w; x.beginPath(); x.moveTo(hx, hy); x.quadraticCurveTo(mx, my, ex, ey); x.stroke(); }
      x.beginPath(); x.arc(hx, hy, Math.min(W, H) * 0.08 * Math.min(1, (t - T.splat) / 0.2), 0, 7); x.fill(); }
    if (t > T.flood) { x.fillStyle = '#e8e8e8'; x.globalAlpha = Math.min(1, (t - T.flood) / 0.5); x.fillRect(0, 0, W, H); x.globalAlpha = 1; x.strokeStyle = '#ff3b3b'; x.lineCap = 'round';
      for (const s of strokes) { const k = Math.max(0, Math.min(1, (t - T.flood - s.d) / 0.28)); if (!k) continue; x.lineWidth = s.w; x.beginPath(); x.moveTo(-0.05 * W + s.l, s.y + s.w * 0.4); x.lineTo(-0.05 * W + s.l + (1.1 * W - s.l - s.rgt) * k, s.y - s.w * 0.4); x.stroke();
        x.lineWidth = s.w * 0.12; for (let j = 0; j < 3; j++) { const yy = s.y + (j - 1) * s.w * 0.3; x.beginPath(); x.moveTo(-0.05 * W + s.l, yy); x.lineTo(-0.05 * W + s.l - W * 0.05 * (1 + j % 2), yy + s.w * 0.1); x.stroke(); } } }
    if (t > T.text) { const k = Math.min(1, (t - T.text) / 1.3), u = Math.min(W * 0.9, H * 1.3), tilt = -0.05;
      blorkWord(x, 'BLORK', W / 2, H * 0.42, u * 0.17, Math.min(1, k * 1.6), tilt); blorkWord(x, 'STUDIOS', W / 2 + u * 0.03, H * 0.42 + u * 0.19, u * 0.09, Math.max(0, k * 1.6 - 0.6), tilt); }
    if (t > T.end) finish(); };
  const finish = () => { if (over) return; over = true; cancelAnimationFrame(raf); try { r.dispose(); r.forceContextLoss(); } catch (_) {} gl.remove(); done && done(); };
  frame(); return { finish, last: () => ov };
}
