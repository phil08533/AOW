// blork.js: the Blork Studios logo, shot like our cutscenes in one take (~7 s, Phil's storyboard), with the game's own models.
// A Drome trooper runs down an Earth trail toward the camera, the Setting Sun drops in behind him and shoots him, blood hits
// the lens and covers it, then drains away leaving BLORK written in dripping blood over STUDIOS. Click skips. Falls back to the old card.
const BLORK_T = { ship: 0.9, fire: 2.35, hit: 2.75, splat: 2.85, flood: 3.25, text: 3.95, studios: 4.7, end: 7.0 };
// realistic blood fill: a dark-to-bright body with clots, a wet gloss band and a dark rim, clipped to whatever is in `mask`
const BLORK_BODY = {};
function blorkBody(w, h) { const k = w + 'x' + h; if (BLORK_BODY[k]) return BLORK_BODY[k]; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9a0610'); g.addColorStop(0.5, '#6e0208'); g.addColorStop(1, '#3a0004'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 900; i++) { x.fillStyle = Math.random() < 0.6 ? 'rgba(40,0,2,.25)' : 'rgba(190,20,30,.18)'; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 9, 0, 7); x.fill(); }
  return (BLORK_BODY[k] = c); }
const BLORK_TMP = {}; const blorkTmp = (n, w, h) => { let c = BLORK_TMP[n]; if (!c) c = BLORK_TMP[n] = document.createElement('canvas'); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } const x = c.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, w, h); return [c, x]; };
function blorkBloodify(mask, gloss, fast) { const w = mask.width, h = mask.height, [c, x] = blorkTmp(fast ? 'outF' : 'out', w, h); x.drawImage(blorkBody(w, h), 0, 0);
  x.globalCompositeOperation = 'destination-in'; x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-atop';
  if (gloss) { // wet highlight: the shape nudged up-left, kept only where it overlaps itself, lit pale
    const [o, y] = blorkTmp('o', w, h); y.drawImage(mask, 0, 0); y.globalCompositeOperation = 'source-out'; y.drawImage(mask, -gloss, -gloss * 1.4);
    x.globalAlpha = 0.55; if (!fast) x.filter = `blur(${gloss * 0.5}px)`; x.drawImage(o, 0, 0); x.filter = 'none'; x.globalAlpha = 1;
    const [hl, z] = blorkTmp('hl', w, h); z.drawImage(mask, 0, 0); z.globalCompositeOperation = 'source-in'; z.fillStyle = '#ff9aa0'; z.fillRect(0, 0, w, h); z.globalCompositeOperation = 'destination-out'; z.drawImage(mask, gloss * 0.6, gloss);
    x.globalAlpha = 0.5; if (!fast) x.filter = `blur(${gloss * 0.35}px)`; x.drawImage(hl, 0, 0); x.filter = 'none'; x.globalAlpha = 1; }
  return c; }
function blorkIntro(stageEl, done) {
  const W = innerWidth, H = innerHeight, T = BLORK_T, PX = Math.max(1.2, Math.min(W, H) / 230 * 0.66 * 0.55); // the game's default PS1 Crisp pixel size
  const gl = document.createElement('canvas'), ov = document.createElement('canvas');
  gl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated'; ov.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  ov.width = W; ov.height = H; stageEl.append(gl, ov);
  const r = new THREE.WebGLRenderer({ canvas: gl, antialias: false }); r.setPixelRatio(1); r.setSize(Math.ceil(W / PX), Math.ceil(H / PX), false); r.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(W > H ? 46 : 64, W / H, 0.1, 400); cam.position.set(0, 1.6, 8); cam.lookAt(0, 2.2, -12);
  const lin = c => new THREE.Color(c).convertSRGBToLinear(), G = c => new THREE.MeshBasicMaterial({ color: lin(c), fog: false });
  // Earth outskirts at sunset: a dirt trail between grassy rises, pines and rocks, all the game's own materials and models
  { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#24183a'); g.addColorStop(0.42, '#7a3448'); g.addColorStop(0.66, '#e2683a'); g.addColorStop(0.8, '#ffb066'); g.addColorStop(1, '#ffdca0'); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; sc.background = t; }
  sc.fog = new THREE.Fog(lin('#d07a58'), 30, 140);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(12, 28), G('#ffcf7a')); sun.position.set(-26, 9, -160); sc.add(sun);
  const gy = (x, z) => { const a = Math.abs(x); return (a > 5 ? Math.pow((a - 5) / 22, 2) * 3 : 0) + Math.sin(x * 0.5 + z * 0.3) * 0.12 + (z < -70 ? Math.pow((-70 - z) / 40, 2) * 3 : 0); };
  const land = (w, d, cz, col, tex, lift) => { const g = new THREE.PlaneGeometry(w, d, 70, 70); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, gy(p.getX(i), p.getZ(i) + cz) + (lift || 0)); g.computeVertexNormals(); const m = new THREE.Mesh(g, toon(col, tex)); m.position.z = cz; sc.add(m); return m; };
  land(120, 160, -60, '#86a04a', 'grass'); { const g = new THREE.PlaneGeometry(4.2, 120, 6, 60); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, gy(p.getX(i), p.getZ(i) - 50) + 0.03); g.computeVertexNormals(); const m = new THREE.Mesh(g, toon('#ad9260', 'dirt')); m.position.z = -50; sc.add(m); }
  { const R = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(3);
    for (let i = 0; i < 46; i++) { const sd = i % 2 ? 1 : -1, x = sd * (6 + R() * 26), z = 4 - R() * 110, p = makePine(0.7 + R() * 0.7); p.position.set(x, gy(x, z), z); sc.add(p); }
    for (let i = 0; i < 16; i++) { const sd = i % 2 ? 1 : -1, x = sd * (2.6 + R() * 5), z = 2 - R() * 60, rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 + R() * 0.5, 0), toon(['#9c8668', '#7c6850'][i % 2], 'stone')); rk.position.set(x, gy(x, z) + 0.1, z); rk.rotation.set(R() * 3, R() * 3, 0); sc.add(rk); } }
  sc.add(new THREE.HemisphereLight(lin('#ffd8b8'), lin('#3a2a3a'), 0.9)); const key = new THREE.DirectionalLight(lin('#ffb070'), 1.1); key.position.set(-8, 6, -10); sc.add(key); const fill = new THREE.DirectionalLight(lin('#8a9aff'), 0.35); fill.position.set(4, 3, 10); sc.add(fill);
  // a Drome trooper (the game's trooper rig in Drome black and red) running straight at the camera
  const man = makeTrooper({ noGun: true }); recolor(man, { '#6f7a3e': '#2b2a30', '#4a5229': '#1a1a1e', '#c9b27c': '#c8202a' }); rig(man, Object.assign({}, RIGS.trooper, { hold: false })); mergeChar(man); sc.add(man); const ms = {};
  // the Setting Sun, as the player has it set up in the garage
  let cfg = {}; try { cfg = scS().cfg.fighter || {}; } catch (_) {} // the save may not be loaded yet this early
  let ship; try { ship = makeClassShip('fighter', Object.assign({}, cfg, { cls: 'fighter' })); } catch (e) { console.warn('blork ship', e); ship = new THREE.Group(); }
  ship.rotation.y = Math.PI; const guns = (ship.userData.guns || []).length ? [ship.userData.guns[0], ship.userData.guns[ship.userData.guns.length - 1]] : [new THREE.Vector3(-4.4, 0, -1), new THREE.Vector3(4.4, 0, -1)]; const sh = new THREE.Group(); sh.add(ship); sc.add(sh); { const b = new THREE.Box3().setFromObject(ship), sz = b.getSize(new THREE.Vector3()); ship.scale.setScalar(6 / Math.max(sz.x, sz.z, 0.01)); }
  let lc = '#ff3a2a'; try { lc = (LASER_COLS[cfg.lc | 0] || LASER_COLS[0])[1] || lc; } catch (_) {} const boltM = boltMat(new THREE.Color('#ffffff').lerp(new THREE.Color(lc), 0.45), 0.95), boltR = boltMat(new THREE.Color(lc).multiplyScalar(1.3), 0.55);
  const bolts = [0, 1, 2, 3].map(() => { const g = new THREE.Group(), a = new THREE.Mesh(BOLT.unit, boltM), b = new THREE.Mesh(BOLT.unit, boltR); g.add(a, b); g.visible = false; sc.add(g); return { g, a, b, from: null }; });
  const flash = new THREE.PointLight(lin('#ff3a2a'), 0, 14); sc.add(flash);
  const gore = Array.from({ length: 120 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), G(Math.random() < 0.5 ? '#7a0408' : '#c01018')); m.visible = false; sc.add(m); return { m, v: new THREE.Vector3() }; });
  // blood on the lens: a few wet splats with spray, runs that creep down, then it covers everything
  const x = ov.getContext('2d'), rnd = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(11), U = Math.min(W, H);
  const splats = Array.from({ length: 7 }, (_, i) => ({ dx: (rnd() - 0.5) * 0.9, dy: (rnd() - 0.5) * 0.7, r: U * (0.05 + rnd() * 0.09) * (i ? 1 : 1.6), d: i ? 0.03 + rnd() * 0.18 : 0, blobs: Array.from({ length: 9 }, () => [rnd() * 7, 0.4 + rnd() * 0.7, 0.3 + rnd() * 0.5]),
    drops: Array.from({ length: 14 }, () => [rnd() * 7, 1.2 + rnd() * 2.6, 0.03 + rnd() * 0.12]), runs: Array.from({ length: 3 }, () => [(rnd() - 0.5) * 1.2, 0.08 + rnd() * 0.1, 0.6 + rnd() * 2.2]) }));
  const lens = document.createElement('canvas'); lens.width = Math.ceil(W / 2); lens.height = Math.ceil(H / 2); const lx = lens.getContext('2d');
  const drawLens = (hx, hy, t) => { lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, lens.width, lens.height); lx.setTransform(0.5, 0, 0, 0.5, 0, 0); lx.fillStyle = '#fff';
    for (const s of splats) { const k = Math.max(0, Math.min(1, (t - T.splat - s.d) / 0.12)); if (!k) continue; const cx = hx + s.dx * W * (s.d ? 1 : 0), cy = hy + s.dy * H * (s.d ? 1 : 0), R = s.r * k;
      lx.beginPath(); lx.arc(cx, cy, R * 0.8, 0, 7); lx.fill(); for (const [a, f, o] of s.blobs) { lx.beginPath(); lx.arc(cx + Math.cos(a) * R * o, cy + Math.sin(a) * R * o, R * f * 0.55, 0, 7); lx.fill(); }
      for (const [a, f, rr] of s.drops) { lx.beginPath(); lx.arc(cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f, U * rr * 0.12 * k, 0, 7); lx.fill(); }
      const run = Math.max(0, t - T.splat - s.d - 0.15); for (const [ox, w, sp] of s.runs) { const L = Math.min(H, run * sp * U * 0.5), rx = cx + ox * R * 0.6, rw = R * w; if (L <= 0) continue; lx.fillRect(rx - rw / 2, cy, rw, L); lx.beginPath(); lx.arc(rx, cy + L, rw * 0.75, 0, 7); lx.fill(); } }
    const fk = Math.max(0, Math.min(1, (t - T.flood) / 0.6)); if (fk > 0) { lx.beginPath(); lx.arc(hx, hy, Math.hypot(W, H) * fk * fk, 0, 7); lx.fill(); } };
  // the logo: BLORK in the game's title face, written in blood with drips that keep running; STUDIOS in bone white under it
  let logo = null; const fam = '"Gasoek One", "Tektur", system-ui, sans-serif'; try { document.fonts && document.fonts.load('400 100px "Gasoek One"'); } catch (_) {}
  const buildLogo = () => { const fs = Math.min(W * 0.2, H * 0.3), m = document.createElement('canvas'); m.width = W; m.height = H; const y = m.getContext('2d'); y.font = `400 ${fs}px ${fam}`; y.textAlign = 'center'; y.textBaseline = 'alphabetic';
    const by = H * 0.5; y.fillStyle = '#fff'; y.fillText('BLORK', W / 2, by); const tw = y.measureText('BLORK').width, img = y.getImageData(0, 0, W, H).data, drips = [];
    for (let i = 0; i < 26; i++) { const cx = Math.round(W / 2 - tw / 2 + rnd() * tw); let low = -1; for (let yy = Math.round(by + fs * 0.1); yy > by - fs; yy--) if (img[(yy * W + cx) * 4 + 3] > 200) { low = yy; break; } if (low > 0) drips.push({ x: cx, y: low, w: fs * (0.018 + rnd() * 0.035), L: fs * (0.12 + rnd() * rnd() * 0.5), sp: 0.4 + rnd() * 0.9, d: rnd() * 0.6 }); }
    return { m, fs, by, tw, drips }; };
  const logoFrame = t => { if (!logo) { logo = buildLogo(); logo.txt = blorkBloodify(logo.m, Math.max(2, logo.fs * 0.035)); const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(logo.txt, 0, 0); logo.txt = c; }
    const { fs, by, drips } = logo, k = t - T.text, [mk, y] = blorkTmp('drip', W, H); y.fillStyle = '#fff';
    for (const d of drips) { const e = Math.max(0, Math.min(1, (k - d.d) * d.sp)), L = d.L * (1 - Math.pow(1 - e, 2)); if (L <= 0) continue; y.beginPath(); y.moveTo(d.x - d.w, d.y - d.w); y.quadraticCurveTo(d.x - d.w * 0.5, d.y + L * 0.5, d.x - d.w * 0.45, d.y + L); y.lineTo(d.x + d.w * 0.45, d.y + L); y.quadraticCurveTo(d.x + d.w * 0.5, d.y + L * 0.5, d.x + d.w, d.y - d.w); y.fill(); y.beginPath(); y.arc(d.x, d.y + L, d.w * 0.85, 0, 7); y.fill(); }
    const dr = blorkBloodify(mk, Math.max(2, fs * 0.035), true), [out, o] = blorkTmp('logo', W, H); o.drawImage(dr, 0, 0); o.drawImage(logo.txt, 0, 0); return out; };
  let hitPt = null, t = 0, last = performance.now(), raf = 0, over = false, shake = 0, mv = null;
  const v = new THREE.Vector3(), wf = new THREE.Vector3();
  const shipAt = (t, o) => { const z = -90 + 46 * Math.max(0, t - T.ship), a = Math.max(0, Math.min(1, -(z + 8) / 82)); return o.set(9 * Math.max(0, Math.min(1, -z / 90)), 6.5 + 16 * Math.pow(a, 1.5) + Math.max(0, z + 8) * 0.15, z); };
  const frame = () => { if (over) return; raf = requestAnimationFrame(frame); const now = performance.now(), dt = Math.min(1 / 30, (now - last) / 1000); last = now; t += dt;
    if (t < T.text) {
      if (t < T.hit) { const mz = -19 + t * 7.2, mx = Math.sin(t * 2.3) * 0.25; man.position.set(mx, gy(mx, mz), mz); man.rotation.y = Math.cos(t * 2.3) * 0.1; animRig(man, ms, dt, t); }
      else { if (!mv) { mv = new THREE.Vector3(0.5, 3.8, 5.2); hitPt = man.position.clone().add(new THREE.Vector3(0, 1.2, 0)); flash.position.copy(hitPt); flash.intensity = 8; shake = 0.4;
          for (const g of gore) { g.m.visible = true; g.m.position.copy(hitPt); g.v.set((Math.random() - 0.5) * 6, Math.random() * 6, Math.random() * 9); } }
        mv.y -= 14 * dt; man.position.addScaledVector(mv, dt); const gh = gy(man.position.x, man.position.z); if (man.position.y < gh) { man.position.y = gh; mv.set(0, 0, mv.z * 0.3); } man.rotation.x -= dt * 6 * Math.min(1, mv.length() / 2); }
      for (const g of gore) if (g.m.visible) { g.v.y -= 14 * dt; g.m.position.addScaledVector(g.v, dt); const gh = gy(g.m.position.x, g.m.position.z) + 0.03; if (g.m.position.y < gh) { g.m.position.y = gh; g.v.multiplyScalar(0.15); } }
      flash.intensity = Math.max(0, flash.intensity - dt * 14);
      // the Setting Sun drops in behind him, chases him down the trail, fires, then screams over the camera
      // one constant-speed strafing run: it never slows, fires two wing volleys on the way in, then pulls up over the camera
      shipAt(t, sh.position); sh.lookAt(shipAt(t + 0.05, wf)); sh.rotateZ(Math.max(0, 0.55 - (t - T.ship) * 0.3) + Math.sin(t * 3) * 0.04); sh.updateMatrixWorld(true);
      bolts.forEach((b, i) => { const ft = T.fire + (i >> 1) * 0.12, k = (t - ft) / 0.28; if (k > 0 && !b.from) b.from = ship.localToWorld(guns[i & 1].clone()); b.g.visible = k > 0 && k < 1.1 && !mv; if (!b.g.visible) return; const tgt = man.position.clone().add(new THREE.Vector3((i & 1) * 0.4 - 0.2, 1.1, 0)), from = b.from, d = tgt.clone().sub(from), h0 = Math.min(1, k), tb = Math.max(0, h0 - 0.3);
        boltAlong(b.a, from.clone().addScaledVector(d, tb), from.clone().addScaledVector(d, h0), 0.07); boltAlong(b.b, from.clone().addScaledVector(d, tb), from.clone().addScaledVector(d, h0), 0.2); });
      cam.position.set((Math.random() - 0.5) * shake, 1.6 + (Math.random() - 0.5) * shake, 8); cam.lookAt(0, 2.2, -12); shake = Math.max(0, shake - dt * 0.9); r.render(sc, cam); }
    x.clearRect(0, 0, W, H);
    if (hitPt && t > T.splat) { v.copy(hitPt).project(cam); const hx = Math.max(W * 0.2, Math.min(W * 0.8, (v.x + 1) / 2 * W)), hy = Math.max(H * 0.25, Math.min(H * 0.7, (1 - v.y) / 2 * H)); drawLens(hx, hy, t);
      const bl = blorkBloodify(lens, Math.max(1, U * 0.006), true), fade = t > T.text ? Math.max(0, 1 - (t - T.text) / 0.7) : 1; x.globalAlpha = fade; x.drawImage(bl, 0, 0, W, H); x.globalAlpha = 1; }
    if (t > T.text) { if (gl.parentNode) { try { r.dispose(); r.forceContextLoss(); } catch (_) {} gl.remove(); }
      x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#050304'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
      x.save(); x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = U * 0.02; x.shadowOffsetY = U * 0.006; x.drawImage(logoFrame(t), 0, 0); x.restore();
      const sk = Math.max(0, Math.min(1, (t - T.studios) / 0.6)); if (sk > 0) { x.globalAlpha = sk; x.fillStyle = '#e8e0d8'; x.font = `400 ${logo.fs * 0.2}px ${fam}`; x.textAlign = 'center'; x.letterSpacing = `${logo.fs * 0.08}px`; x.fillText('STUDIOS', W / 2 + logo.fs * 0.04, logo.by + logo.fs * 0.78); x.letterSpacing = '0px'; x.globalAlpha = 1; } }
    if (t > T.end) finish(); };
  const finish = () => { if (over) return; over = true; cancelAnimationFrame(raf); try { r.dispose(); r.forceContextLoss(); } catch (_) {} gl.remove(); done && done(); };
  frame(); return { finish };
}

// the title crest behind ART OF WAR: the top half of a setting sun with the Lvl 15 Rifle (side on, muzzle left) and Master Sword
// rendered with the game's own models at the default pixel size, swaying slowly until the title closes
function titleCrest(cov, below) {
  const S0 = Math.round(Math.min(innerWidth, innerHeight) * 0.9), PX = Math.max(1.2, Math.min(innerWidth, innerHeight) / 230 * 0.66 * 0.55), n = Math.ceil(S0 / PX);
  const cv = document.createElement('canvas'); cv.className = 'crest'; cv.style.cssText = `position:absolute;left:50%;top:50%;width:${S0}px;height:${S0}px;margin:${-S0 / 2}px 0 0 ${-S0 / 2}px;image-rendering:pixelated;opacity:0;transition:opacity 1.2s;pointer-events:none`;
  cov.appendChild(cv);
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true }); r.setPixelRatio(1); r.setSize(n, n, false); r.outputEncoding = THREE.sRGBEncoding; r.setClearColor(0, 0);
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 0, 9); cam.lookAt(0, 0, 0);
  const lin = c => new THREE.Color(c).convertSRGBToLinear();
  sc.add(new THREE.HemisphereLight(lin('#ffe0c0'), lin('#402838'), 1.0)); const key = new THREE.DirectionalLight(lin('#ffd0a0'), 1.0); key.position.set(-3, 4, 6); sc.add(key);
  // the sun: warm gradient disc with the bottom half cut into bands, sinking behind a thin horizon line
  const st = document.createElement('canvas'); st.width = st.height = 256; { const x = st.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#ffe27a'); g.addColorStop(0.45, '#ff9a3c'); g.addColorStop(1, '#d8283a'); x.fillStyle = g; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill();
    x.clearRect(0, 128, 256, 128); } // only the top half: the sun is half set
  const tex = new THREE.CanvasTexture(st); tex.encoding = THREE.sRGBEncoding; tex.magFilter = THREE.NearestFilter;
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); sun.position.set(0, 0, -1.2); sc.add(sun);
  const hz = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.05), new THREE.MeshBasicMaterial({ color: lin('#ff9a3c') })); hz.position.set(0, 0, -1.1); sc.add(hz);
  // the weapons, each scaled to the same length and crossed behind the words
  const arms = new THREE.Group(); arms.position.y = 1.0; sc.add(arms);
  const fit = (m, len) => { const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()), w = new THREE.Group(); m.position.sub(c); w.add(m); w.scale.setScalar(len / Math.max(sz.x, sz.y, sz.z, 0.01)); return w; };
  let gun = null, sword = null; try { const m = makeGunModel('r15'); m.rotation.set(0, -Math.PI / 2, 0); const o = new THREE.Group(); o.add(m); gun = fit(o, 2.9); } catch (e) { console.warn('crest gun', e); }
  try { const m = makeMeleeModel('master'); sword = fit(m, 3.3); } catch (e) { console.warn('crest sword', e); }
  if (gun) { const p = new THREE.Group(); p.add(gun); p.rotation.z = -0.72; p.position.z = 0.2; arms.add(p); }
  if (sword) { const p = new THREE.Group(); p.add(sword); p.rotation.z = -0.72; p.position.z = 0.35; arms.add(p); }
  let raf = 0, t0 = performance.now(), on = true;
  const loop = () => { if (!on) return; raf = requestAnimationFrame(loop); const t = (performance.now() - t0) / 1000; arms.rotation.y = Math.sin(t * 0.6) * 0.35; arms.position.y = 1.0 + Math.sin(t * 0.9) * 0.05; r.render(sc, cam); };
  if (below) { cam.updateMatrixWorld(); const v = new THREE.Vector3(0, 0, -1.1).project(cam), hy = (1 - v.y) / 2 * S0, top = below.getBoundingClientRect().top - cov.getBoundingClientRect().top - 3; cv.style.top = (top - hy) + 'px'; cv.style.marginTop = '0'; }
  loop(); requestAnimationFrame(() => { cv.style.opacity = '0.32'; });
  cv.stop = () => { on = false; cancelAnimationFrame(raf); setTimeout(() => { try { r.dispose(); r.forceContextLoss(); } catch (_) {} }, 900); };
  return cv;
}
