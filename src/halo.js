// =================== VELOCITY: THE HALO LINE (hyper tunnel) ===================
// Two great ring gates stand at the east and west edges of the Mirror Flats. Drive into one and the magnet
// field throws you down the Halo Line, a tube that circles the planet: dark neon, then a long glass gallery
// looking into Prism Deep, the drowned rainbow city of the Hydrans, then neon again, and out of the other gate.
// You can steer all the way around the tube, hit speed pads, and hold boost. No crashing, no failing.
const HALO_PORTALS = [{ x: 292, z: 34, nx: 1 }, { x: -292, z: 34, nx: -1 }];
const HALO = { on: false, d: 0, s: 0, th: 0, thv: 0, thCam: 0, from: 0, cool: 0, slots: [], town: null, T0: new THREE.Vector3(0, -3000, 0), got: new Set(), flash: 0, park: null, fov0: 72, kick: 0, built: false, last: 0, glassSeen: false };
const HALO_R = 7, HALO_SEG = 24, HALO_N = 15, HALO_LEN = 3600, HALO_GLASS = [820, 2420];
LORE_FACTIONS.push(['The Hydrans of Prism Deep', 'speedway', 'Velocity\'s other people. Hydrans breathe hydrogen and live in Prism Deep, a city of glowing domes at the bottom of the Glass Sea, far under the racing flats. Their breath rises through the vents as rainbow vapor, the magnet storm charges it, and it falls back as the rainbow rain. They built the Halo Line, a magnet tube that rings the whole planet, to move cargo. Drivers sneak rides through it. Nobody visits Prism Deep: the air would kill you, and the water would crush what was left.']);
if (LORE.speedway) LORE.speedway[1] = 'The racing planet, and a magnet: the ground field holds every car a hand above the glass, and the storm never stops. The rain falls in rainbows because of the Hydrans living under the Glass Sea. At the east and west edges of the flats, the Halo Line gates throw you around the planet.';

const haloOn = () => LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly;
const haloHash = v => { let h = (v * 374761393) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
// the three stretches: neon A, the glass gallery, neon B (different colors)
const HALO_PAL_A = ['#4fd2ff', '#ff3bd1', '#4fd2ff', '#8a5bff'], HALO_PAL_B = ['#ffb03b', '#3bff8a', '#c86aff', '#ff3b5a'];
const haloPhase = dist => dist < HALO_GLASS[0] ? 0 : dist < HALO_GLASS[1] ? 1 : dist < HALO_LEN - 120 ? 2 : 3;

function haloTex(draw, w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
let HALO_TEX = null;
function haloTextures() {
  if (HALO_TEX) return HALO_TEX;
  HALO_TEX = {
    panel: haloTex((x, w, h) => { x.fillStyle = '#0d0f15'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1c2030'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();
      for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#22283a' : '#151a26'; x.fillRect(6 + i * 9, 6, 5, 3); } }, 64, 128),
    chev: haloTex((x, w, h) => { x.fillStyle = '#0d0f15'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.lineWidth = 7; for (let k = 0; k < 2; k++) { const y = 20 + k * 64; x.beginPath(); x.moveTo(10, y + 30); x.lineTo(w / 2, y); x.lineTo(w - 10, y + 30); x.stroke(); } }, 64, 128),
    water: haloTex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a9ac0'); g.addColorStop(0.25, '#0f6a94'); g.addColorStop(0.6, '#08345c'); g.addColorStop(1, '#030c1e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) { const px = Math.random() * w, py = Math.random() * h * 0.6, r = 10 + Math.random() * 40; const rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, `hsla(${Math.random() * 360},90%,75%,0.18)`); rg.addColorStop(1, 'hsla(0,0%,0%,0)'); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2); } }, 256, 256),
    dot: haloTex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 32),
    ray: haloTex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 8)
  };
  return HALO_TEX;
}
const haloGlow = (col, op) => new THREE.MeshBasicMaterial({ color: new THREE.Color(col), transparent: op != null, opacity: op == null ? 1 : op, fog: false, depthWrite: op == null });

// ---- the gates on the flats ----
function haloGates() {
  for (const P of HALO_PORTALS) {
    const g = new THREE.Group(), y = groundH(P.x, P.z); g.position.set(P.x, y, P.z); g.rotation.y = P.nx > 0 ? -Math.PI / 2 : Math.PI / 2; levelGroup.add(g);
    // a huge ring gate with a swirling field and a short barrel leading out into the fog
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.9, 10, 40), toon('#2b2a2c')); ring.position.y = 8.6; g.add(ring);
    const neon = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.22, 6, 48), haloGlow('#4fd2ff')); neon.position.set(0, 8.6, 0.85); g.add(neon);
    const neon2 = new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.12, 6, 48), haloGlow('#ff3bd1')); neon2.position.set(0, 8.6, 0.6); g.add(neon2);
    const field = new THREE.Mesh(new THREE.CircleGeometry(7.3, 40), new THREE.MeshBasicMaterial({ map: haloTextures().water, color: '#9fe8ff', transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, fog: false, blending: THREE.AdditiveBlending }));
    field.position.set(0, 8.6, 0.2); g.add(field);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.6, 26, 24, 1, true), new THREE.MeshLambertMaterial({ color: '#1a1c22', side: THREE.DoubleSide })); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 8.6, -13.5); g.add(barrel);
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.TorusGeometry(8.7, 0.1, 4, 40), haloGlow(HALO_PAL_A[k % 4])); b.position.set(0, 8.6, -3 - k * 5); g.add(b); }
    // pylons and a sign
    for (const s of [-1, 1]) { part(g, B(1.4, 18, 1.4), '#2b2a2c', s * 10, 9, 0); part(g, B(0.3, 16, 0.3), glow('#4fd2ff'), s * 10, 9, 0.75); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.6), new THREE.MeshBasicMaterial({ map: signTex('HALO LINE  ·  ' + (P.nx > 0 ? 'EAST GATE' : 'WEST GATE'), '#0f1757', '#4fd2ff'), fog: false })); sign.position.set(0, 18.4, 0.9); g.add(sign);
    // the approach: a lit runway of chevron lights pointing into the gate
    for (let k = 1; k <= 8; k++) { const cx = P.x - P.nx * k * 6; const cy = groundH(cx, P.z); for (const s of [-1, 1]) { const l = part(levelGroup, B(0.5, 0.06, 1.6), glow(k % 2 ? '#4fd2ff' : '#ff3bd1'), cx, cy + 0.05, P.z + s * 5); l.rotation.y = s * 0.5 * P.nx; } }
    levelAnims.push(t => { neon.material.color.setHSL((t * 0.15) % 1, 0.9, 0.62); field.rotation.z = -t * 1.6; field.material.opacity = 0.42 + Math.sin(t * 3) * 0.12; neon2.rotation.z = t * 0.8; });
    INTERACTS.push({ x: P.x - P.nx * 9, z: P.z, r: 5, label: 'Halo Line: drive in to ride', fn: () => { if (!RC.on) toast('HALO LINE', 'Drive a car into the gate to ride the tunnel around the planet.', 3); else toast('HALO LINE', 'Just drive through the gate!', 2); } });
  }
}

// ---- the tube: a treadmill of segments that scroll past the car ----
function haloBuildTube() {
  const T = haloTextures(), root = new THREE.Group(); root.position.copy(HALO.T0); levelGroup.add(root); HALO.root = root; HALO.slots = [];
  const NP = 16, pw = 2 * HALO_R * Math.tan(Math.PI / NP) + 0.05, pGeo = new THREE.PlaneGeometry(pw, HALO_SEG);
  for (let k = 0; k < HALO_N; k++) {
    const g = new THREE.Group(); root.add(g); const panels = [];
    const solid = new THREE.MeshBasicMaterial({ map: T.panel, color: '#5a6078', side: THREE.DoubleSide });
    const chev = new THREE.MeshBasicMaterial({ map: T.chev, color: '#4fd2ff', side: THREE.DoubleSide });
    const glass = new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, fog: false });
    for (let i = 0; i < NP; i++) { const ph = i / NP * Math.PI * 2, m = new THREE.Mesh(pGeo, solid); m.position.set(HALO_R * Math.sin(ph), -HALO_R * Math.cos(ph), -HALO_SEG / 2); m.rotation.set(0, 0, ph); m.rotateX(-Math.PI / 2); g.add(m); panels.push({ m, ph }); }
    const ringMat = haloGlow('#4fd2ff'), stripMat = haloGlow('#4fd2ff', 0.7);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(HALO_R - 0.05, 0.14, 4, 32), ringMat); g.add(ring);
    const strips = []; for (const ph of [Math.PI / 2, -Math.PI / 2, Math.PI, Math.PI * 0.25, -Math.PI * 0.25]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, HALO_SEG * 0.8), stripMat); s.position.set((HALO_R - 0.1) * Math.sin(ph), -(HALO_R - 0.1) * Math.cos(ph), -HALO_SEG / 2); g.add(s); strips.push({ s, ph }); }
    const ribs = []; for (let r = 1; r < 4; r++) { const rb = new THREE.Mesh(new THREE.TorusGeometry(HALO_R - 0.02, 0.05, 3, 32, Math.PI * 0.9), haloGlow('#cfefff', 0.5)); rb.position.z = -r * HALO_SEG / 4; rb.rotation.z = Math.PI * 0.6; g.add(rb); ribs.push(rb); }
    const pad = new THREE.Group(); const pm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.2), new THREE.MeshBasicMaterial({ map: T.chev, color: '#ffe14a', transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); pm.rotation.x = -Math.PI / 2; pm.position.y = 0.05; pad.add(pm);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.dot, color: '#ffe14a', transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(4, 2, 1); halo.position.y = 0.6; pad.add(halo); g.add(pad);
    HALO.slots.push({ g, panels, solid, chev, glass, ring, ringMat, stripMat, strips, ribs, pad, v: null });
  }
}
function haloDress(sl, v) {
  const dist = v * HALO_SEG, ph = haloPhase(dist), pal = ph === 2 ? HALO_PAL_B : HALO_PAL_A, col = pal[((v % 4) + 4) % 4];
  for (const p of sl.panels) { const left = Math.sin(p.ph) < -0.15 || (Math.cos(p.ph) < -0.55 && Math.sin(p.ph) < 0.3); p.m.material = ph === 1 && left ? sl.glass : (Math.abs(p.ph) < 0.01 && ph !== 1 ? sl.chev : sl.solid); }
  sl.chev.color.set(col);
  sl.ringMat.color.set(ph === 1 ? '#bff4ff' : col); sl.ring.scale.setScalar(ph === 1 ? 1 : 1); sl.ring.visible = ph !== 1 || v % 2 === 0;
  sl.stripMat.color.set(ph === 1 ? '#7fdfff' : pal[((v + 1) % 4 + 4) % 4]); sl.strips.forEach(s => { s.s.visible = ph !== 1 || Math.sin(s.ph) > 0.1 || Math.abs(s.ph) < 0.01; });
  sl.ribs.forEach(r => { r.visible = ph === 1; });
  // a speed pad on some segments, at a fixed spot around the tube
  const has = ph !== 3 && v > 2 && haloHash(v) < (ph === 1 ? 0.22 : 0.4); sl.pad.visible = has && !HALO.got.has(v);
  if (has) { const a = (haloHash(v + 7777) - 0.5) * Math.PI * (ph === 1 ? 1.3 : 2); sl.pad.position.set((HALO_R - 0.15) * Math.sin(a), -(HALO_R - 0.15) * Math.cos(a), -HALO_SEG * 0.5); sl.pad.rotation.set(0, 0, a); sl.padA = a; } else sl.padA = null;
  sl.v = v;
}

// ---- Prism Deep: the drowned rainbow city of the Hydrans, seen through the glass ----
function haloBuildTown() {
  const T = haloTextures(), town = new THREE.Group(); town.position.copy(HALO.T0); levelGroup.add(town); HALO.town = town; town.visible = false;
  const anims = []; HALO.townAnims = anims;
  // the water itself: a deep gradient wall and a glowing seabed
  const back = new THREE.Mesh(new THREE.PlaneGeometry(3200, 420), new THREE.MeshBasicMaterial({ map: T.water, color: '#3a5a78', fog: false })); back.position.set(-270, -20, 0); back.rotation.y = Math.PI / 2; town.add(back);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(600, 3200), new THREE.MeshBasicMaterial({ color: '#062a3c', fog: false, side: THREE.DoubleSide })); top.rotation.x = Math.PI / 2; top.position.set(-150, 120, 0); town.add(top);
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(600, 3200, 30, 120), new THREE.MeshBasicMaterial({ color: '#03161e', fog: false, side: THREE.DoubleSide })); bed.rotation.x = -Math.PI / 2; bed.position.set(-150, -70, 0); town.add(bed);
  { const p = bed.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 0.05) * 4 + Math.cos(p.getY(i) * 0.03) * 5); p.needsUpdate = true; }
  // light shafts from the surface
  for (let i = 0; i < 18; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(14 + Math.random() * 20, 260), new THREE.MeshBasicMaterial({ map: T.ray, color: '#bff8ff', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide }));
    r.position.set(-60 - Math.random() * 190, 20, -650 + i * 75 + Math.random() * 30); r.rotation.set(0, Math.PI / 2, 0.25); town.add(r); anims.push(t => { r.material.opacity = 0.05 + Math.sin(t * 0.7 + i) * 0.03; }); }
  // domes: glowing glass bubbles in every color, with spires and walkway tubes between them
  const domes = [];
  for (let i = 0; i < 16; i++) {
    const r = 14 + Math.random() * 30, x = -70 - Math.random() * 170, z = -640 + i * 82 + (Math.random() - 0.5) * 30, hue = (i * 0.137) % 1, col = new THREE.Color().setHSL(hue, 0.85, 0.6);
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    d.position.set(x, -70, z); town.add(d);
    const core = new THREE.Mesh(new THREE.SphereGeometry(r * 0.35, 12, 8), new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color('#ffffff'), 0.5), fog: false })); core.position.set(x, -70 + r * 0.3, z); town.add(core);
    for (let k = 0; k < 3; k++) { const h = r * (0.6 + Math.random() * 0.8), tw = new THREE.Mesh(new THREE.ConeGeometry(1.4 + Math.random() * 2, h, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL((hue + 0.1 * k) % 1, 0.7, 0.45), fog: false })); const a = Math.random() * 6.28; tw.position.set(x + Math.cos(a) * r * 0.45, -70 + r * 0.55 + h / 2, z + Math.sin(a) * r * 0.45); town.add(tw);
      const band = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.25, 4, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false })); band.rotation.x = Math.PI / 2; band.position.copy(tw.position); band.position.y += h * 0.1; town.add(band); anims.push(t => { band.material.color.setHSL((hue + t * 0.1 + k * 0.2) % 1, 1, 0.7); }); }
    anims.push(t => { d.material.opacity = 0.3 + Math.sin(t * 1.2 + i) * 0.08; });
    domes.push({ x, z, r, col });
  }
  for (let i = 0; i + 1 < domes.length; i++) { const a = domes[i], b = domes[i + 1], len = Math.hypot(b.x - a.x, b.z - a.z), tube = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, len, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#bfefff', transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    tube.position.set((a.x + b.x) / 2, -66, (a.z + b.z) / 2); tube.rotation.set(Math.PI / 2, 0, Math.atan2(b.x - a.x, b.z - a.z)); tube.rotation.order = 'YXZ'; tube.rotation.set(Math.PI / 2, Math.atan2(b.x - a.x, b.z - a.z), 0); town.add(tube); }
  // kelp-glass forests that sway
  for (let i = 0; i < 70; i++) { const h = 10 + Math.random() * 40, k = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, h, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5), fog: false })); k.geometry.translate(0, h / 2, 0);
    k.position.set(-45 - Math.random() * 210, -70, -680 + Math.random() * 1360); town.add(k); const ph = Math.random() * 6; anims.push(t => { k.rotation.z = Math.sin(t * 0.8 + ph) * 0.12; k.rotation.x = Math.cos(t * 0.6 + ph) * 0.08; }); }
  // the rainbow vents: columns of colored bubbles rising to the surface, where the rainbow rain begins
  const BN = 900, bpos = new Float32Array(BN * 3), bcol = new Float32Array(BN * 3), bg = new THREE.BufferGeometry(), vents = [[-110, -380], [-180, -60], [-95, 210], [-200, 470]], bub = [];
  for (let i = 0; i < BN; i++) { const vnt = vents[i % vents.length], c = new THREE.Color().setHSL(Math.random(), 1, 0.65); bub.push([vnt[0] + (Math.random() - 0.5) * 12, -70 + Math.random() * 190, vnt[1] + (Math.random() - 0.5) * 12, 6 + Math.random() * 10, vnt]); bcol.set([c.r, c.g, c.b], i * 3); }
  bg.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); bg.setAttribute('color', new THREE.BufferAttribute(bcol, 3));
  const bpts = new THREE.Points(bg, new THREE.PointsMaterial({ size: 2.2, map: T.dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); bpts.frustumCulled = false; town.add(bpts);
  for (const [vx, vz] of vents) { const v = new THREE.Mesh(new THREE.ConeGeometry(8, 14, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#2a1e3a', fog: false, side: THREE.DoubleSide })); v.position.set(vx, -63, vz); town.add(v); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.dot, color: '#ff8af0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); gl.position.set(vx, -55, vz); gl.scale.setScalar(26); town.add(gl); anims.push(t => { gl.material.color.setHSL((t * 0.2 + vx * 0.01) % 1, 1, 0.6); }); }
  anims.push((t, dt) => { for (let i = 0; i < BN; i++) { const b = bub[i]; b[1] += b[3] * dt; b[0] += Math.sin(t * 2 + i) * dt * 0.8; if (b[1] > 118) { b[1] = -64; b[0] = b[4][0] + (Math.random() - 0.5) * 12; b[2] = b[4][1] + (Math.random() - 0.5) * 12; } bpos[i * 3] = b[0]; bpos[i * 3 + 1] = b[1]; bpos[i * 3 + 2] = b[2]; } bg.attributes.position.needsUpdate = true; });
  // the Hydrans: drifting jelly-folk with glowing hearts, going about their day
  const bellGeo = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), tentGeo = new THREE.CylinderGeometry(0.06, 0.02, 1, 4); tentGeo.translate(0, -0.5, 0);
  const mkHydran = (sc, hue) => { const g = new THREE.Group(), col = new THREE.Color().setHSL(hue, 0.9, 0.7);
    const bell = new THREE.Mesh(bellGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, fog: false })); g.add(bell);
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color('#ffffff'), 0.6), fog: false })); heart.position.y = 0.25; g.add(heart);
    for (const s of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshBasicMaterial({ color: '#10131c', fog: false })); eye.position.set(s * 0.28, 0.35, 0.8); g.add(eye); }
    const tents = []; for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, tn = new THREE.Mesh(tentGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7, depthWrite: false, fog: false })); tn.position.set(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7); tn.scale.y = 2.2 + Math.random() * 1.6; g.add(tn); tents.push(tn); }
    g.scale.setScalar(sc); g.userData = { bell, tents, heart }; return g; };
  const jobs = [];
  for (let i = 0; i < 46; i++) {
    const kind = i % 4, hue = Math.random(), h = mkHydran(3 + Math.random() * 3, hue); town.add(h);
    const a = domes[i % domes.length], b = domes[(i * 3 + 5) % domes.length];
    if (kind === 0) { // commuters drifting between domes along the walkways
      const sp = 0.04 + Math.random() * 0.05, off = Math.random(); jobs.push(t => { const u = (Math.sin(t * sp * 6 + off * 6) + 1) / 2; h.position.set(a.x + (b.x - a.x) * u, -40 + Math.sin(t + i) * 6, a.z + (b.z - a.z) * u); h.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); });
    } else if (kind === 1) { // haulers towing glowing cargo orbs toward the vents
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL((hue + 0.5) % 1, 1, 0.6), fog: false })); town.add(orb);
      const ox = a.x, oz = a.z, r = 20 + Math.random() * 40, sp = 0.12 + Math.random() * 0.1, ph = Math.random() * 6;
      jobs.push(t => { const q = t * sp + ph; h.position.set(ox + Math.cos(q) * r, -30 + Math.sin(q * 2) * 5, oz + Math.sin(q) * r); h.rotation.y = -q; orb.position.set(h.position.x - Math.cos(q + 0.4) * 4, h.position.y - 6, h.position.z - Math.sin(q + 0.4) * 4); });
    } else if (kind === 2) { // a crowd at the market ring, bobbing and trading lights
      const cx = domes[(i >> 2) % domes.length].x, cz = domes[(i >> 2) % domes.length].z, ang = Math.random() * 6.28, rr = domes[(i >> 2) % domes.length].r + 6;
      jobs.push(t => { h.position.set(cx + Math.cos(ang + t * 0.05) * rr, -60 + Math.abs(Math.sin(t * 1.5 + i)) * 4, cz + Math.sin(ang + t * 0.05) * rr); h.userData.heart.material.color.setHSL((t * 0.5 + i * 0.1) % 1, 1, 0.75); });
    } else { // kids and joyriders racing up the bubble columns
      const vnt = vents[i % vents.length], sp = 8 + Math.random() * 8, ph = Math.random() * 190;
      jobs.push(t => { const y = ((t * sp + ph) % 190) - 70; h.position.set(vnt[0] + Math.sin(t * 2 + i) * 9, y, vnt[1] + Math.cos(t * 2 + i) * 9); h.rotation.z = Math.sin(t * 3 + i) * 0.3; });
    }
    jobs.push(t => { const u = h.userData, p = 1 + Math.sin(t * 2.4 + i) * 0.12; u.bell.scale.set(p, 2 - p, p); u.tents.forEach((tn, k) => { tn.rotation.x = Math.sin(t * 2.4 + i + k) * 0.35; tn.rotation.z = Math.cos(t * 2 + k) * 0.25; }); });
  }
  anims.push(t => { for (const j of jobs) j(t); });
  // window watchers: a few curious Hydrans drifting right up by the glass, tracking the cars that roar past
  for (let i = 0; i < 12; i++) { const h = mkHydran(2.2 + Math.random() * 1.6, Math.random()); town.add(h); const x0 = -24 - Math.random() * 34, z0 = -560 + i * 100 + Math.random() * 40, y0 = -8 + Math.random() * 16;
    jobs.push(t => { h.position.set(x0 + Math.sin(t * 0.6 + i) * 3, y0 + Math.sin(t * 1.3 + i) * 2, z0 + Math.sin(t * 0.25 + i) * 10); h.rotation.y = -Math.PI / 2 + Math.sin(t + i) * 0.3; const u = h.userData, p = 1 + Math.sin(t * 2.4 + i) * 0.12; u.bell.scale.set(p, 2 - p, p); u.heart.material.color.setHSL((t * 0.3 + i * 0.13) % 1, 1, 0.75); }); }
  // a few huge Hydran signs in their glowing script, and a whale-sized hydrogen tanker drifting overhead
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(26, 8), new THREE.MeshBasicMaterial({ map: signTex(['◇ ∿ ◈ ∿ ◇', 'PRISM DEEP', '≋ HYDRO ≋', '∴ HALO ∴', 'H₂ ONLY', '◈ ◇ ◈'][i], '#06121e', '#7ff8ff'), transparent: true, opacity: 0.85, fog: false, side: THREE.DoubleSide }));
    s.position.set(-60 - Math.random() * 60, -10 + Math.random() * 30, -560 + i * 220); s.rotation.y = Math.PI / 2; town.add(s); anims.push(t => { s.material.opacity = 0.65 + Math.sin(t * 3 + i) * 0.2; }); }
  { const tk = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshBasicMaterial({ color: '#3a5a7a', fog: false })); body.scale.set(16, 9, 52); tk.add(body);
    for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(k / 6, 1, 0.65), fog: false })); l.position.set(15.5, 0, -30 + k * 12); tk.add(l); }
    tk.position.set(-150, 60, 0); town.add(tk); anims.push(t => { tk.position.z = Math.sin(t * 0.05) * 300; tk.position.y = 60 + Math.sin(t * 0.3) * 4; }); }
}

// ---- riding the line ----
function haloEnter(pi) {
  const P = HALO_PORTALS[pi]; if (!HALO.built) { haloBuildTube(); haloBuildTown(); HALO.built = true; }
  HALO.on = true; HALO.from = pi; HALO.d = 0; HALO.th = 0; HALO.thv = 0; HALO.thCam = 0; HALO.got.clear(); HALO.flash = 1; HALO.kick = 0; HALO.glassSeen = false;
  HALO.s = Math.max(45, Math.hypot(RC.vx || 0, RC.vz || 0)); HALO.park = player.pos.clone(); HALO.root.visible = true; HALO.town.visible = false;
  HALO.fov0 = camera.fov; camera.far = 1500; camera.updateProjectionMatrix(); VEL.hyper = HALO;
  for (const sl of HALO.slots) sl.v = null;
  SFX.boom && SFX.boom(); SFX.zap && SFX.zap(); FX.shake = Math.min(1, (FX.shake || 0) + 0.5);
  toast('HALO LINE', 'Steer around the tube · hit the gold pads · hold boost', 2.5);
  if (!S.flags.halo) { S.flags.halo = 1; markDirty(); setTimeout(() => { if (typeof burp === 'function') { burpT = -99; burpSay("The Halo Line. A magnet tube around the whole planet. Keep your hands inside the car. And your screaming."); log("The Halo Line. A magnet tube around the whole planet. Keep your hands inside the car. And your screaming.", 'ai', 'B.U.R.P.'); } }, 900); }
}
function haloExit() {
  const Q = HALO_PORTALS[1 - HALO.from], m = Q.nx, sp = Math.min(HALO.s * 0.45, 75);
  HALO.on = false; VEL.hyper = null; HALO.root.visible = false; HALO.town.visible = false; HALO.cool = performance.now() + 4000;
  player.pos.set(Q.x - m * 12, 0, Q.z); player.pos.y = floorAt(player.pos.x, player.pos.z); player.yaw = m > 0 ? Math.PI / 2 : -Math.PI / 2;
  RC.vx = -m * sp; RC.vz = 0; RC.v = sp; RC.vr = 0; VEL.cp = null; VEL.kick = Math.max(VEL.kick || 0, 0.6);
  camera.up.set(0, 1, 0); camera.fov = HALO.fov0; camera.far = 300; camera.updateProjectionMatrix();
  if (VEL.carObj) VEL.carObj.rotation.order = 'XYZ';
  for (const H of VEL.hrain || []) H.l.visible = true;
  SFX.boom && SFX.boom(); FX.shake = Math.min(1, (FX.shake || 0) + 0.6); toast('HALO LINE', `Around the planet in ${((performance.now() - HALO.t0) / 1000).toFixed(1)}s · top ${Math.round(HALO.top * 3.6)} km/h`, 3);
  S.halo = S.halo || { runs: 0, best: 0 }; S.halo.runs++; S.halo.best = Math.max(S.halo.best || 0, Math.round(HALO.top * 3.6)); markDirty();
}
function haloAbort() { if (!HALO.on) return; HALO.on = false; for (const H of VEL.hrain || []) H.l.visible = true; camera.far = 300; VEL.hyper = null; if (HALO.root) HALO.root.visible = false; if (HALO.town) HALO.town.visible = false; camera.up.set(0, 1, 0); camera.fov = HALO.fov0 || 72; camera.updateProjectionMatrix(); if (VEL.carObj) VEL.carObj.rotation.order = 'XYZ'; }
function haloStep(dt) {
  const K = velStats(), steer = ((keys.KeyD || keys.ArrowRight) ? 1 : 0) - ((keys.KeyA || keys.ArrowLeft) ? 1 : 0) + (move.x || 0), boost = keys.ShiftLeft || keys.ShiftRight;
  const top = 150 + K.top * 1.2, want = boost ? top * 1.35 : top;
  HALO.s += (want - HALO.s) * Math.min(1, dt * (boost ? 0.9 : 0.55)); HALO.s += HALO.kick * dt * 60; HALO.kick = Math.max(0, HALO.kick - dt * 1.5);
  HALO.top = Math.max(HALO.top || 0, HALO.s);
  // steering swings you around the tube; it eases in and out so it feels like a car, not a dial
  HALO.thv += (clamp(steer, -1, 1) * 2.6 - HALO.thv) * Math.min(1, dt * 7); HALO.th += HALO.thv * dt;
  HALO.thCam += (HALO.th - HALO.thCam) * Math.min(1, dt * 5);
  const d0 = HALO.d; HALO.d += HALO.s * dt;
  // segments: slot k shows virtual segment v = first + k, scrolled so the car sits at z = 0
  const first = Math.floor(HALO.d / HALO_SEG) - 2;
  for (let k = 0; k < HALO.slots.length; k++) { const v = first + k, sl = HALO.slots[(((v % HALO_N) + HALO_N) % HALO_N)]; if (sl.v !== v) haloDress(sl, v); sl.g.position.z = -(v * HALO_SEG - HALO.d); }
  // pads you drive over
  for (const sl of HALO.slots) { if (sl.padA == null || !sl.pad.visible) continue; const pz = sl.v * HALO_SEG + HALO_SEG * 0.5; if (pz > d0 && pz <= HALO.d) { let da = Math.atan2(Math.sin(HALO.th - sl.padA), Math.cos(HALO.th - sl.padA)); if (Math.abs(da) < 0.38) { HALO.got.add(sl.v); sl.pad.visible = false; HALO.kick = 1.2; HALO.flash = Math.max(HALO.flash, 0.5); SFX.coin && SFX.coin(); FX.shake = Math.min(1, (FX.shake || 0) + 0.15); } } }
  for (const sl of HALO.slots) if (sl.pad.visible) sl.pad.children[1].material.opacity = 0.45 + Math.sin(gameTime * 10) * 0.25;
  // the window onto Prism Deep: the city drifts past slower than the tube, so it reads as far away
  const ph = haloPhase(HALO.d); HALO.town.visible = HALO.d > HALO_GLASS[0] - 400 && HALO.d < HALO_GLASS[1] + 200;
  if (!HALO.deep) { HALO.deep = new THREE.Mesh(new THREE.PlaneGeometry(4000, 2400), new THREE.MeshBasicMaterial({ color: '#04202e', fog: false })); HALO.deep.position.set(0, 0, -1200); HALO.root.add(HALO.deep); }
  HALO.deep.visible = HALO.town.visible;
  if (HALO.town.visible) { HALO.town.position.z = HALO.T0.z + (HALO.d - (HALO_GLASS[0] + HALO_GLASS[1]) / 2) * 0.5; for (const a of HALO.townAnims) a(gameTime, dt); }
  if (ph === 1 && !HALO.glassSeen) { HALO.glassSeen = true; toast('PRISM DEEP', 'The Hydran city under the Glass Sea. They breathe hydrogen. Do not knock.', 3.5); }
  // the car rides the inside of the tube, hovering off whatever wall is "down"
  const car = VEL.carObj, rr = HALO_R - VEL_HOVER - 0.32, up = V(-Math.sin(HALO.th), Math.cos(HALO.th), 0);
  if (car) { car.visible = VEL.cam !== 0; car.rotation.order = 'ZYX'; car.position.set(HALO.T0.x + rr * Math.sin(HALO.th), HALO.T0.y - rr * Math.cos(HALO.th) + Math.sin(gameTime * 6) * 0.04, HALO.T0.z); car.rotation.set(0, Math.PI, HALO.th - HALO.thv * 0.06); }
  // camera: chase or cockpit, rolling with the tube
  const cu = V(-Math.sin(HALO.thCam), Math.cos(HALO.thCam), 0), cpos = V(HALO.T0.x + rr * Math.sin(HALO.thCam), HALO.T0.y - rr * Math.cos(HALO.thCam), HALO.T0.z);
  if (VEL.cam === 0) { camera.position.copy(cpos).addScaledVector(cu, 0.95); camera.up.copy(cu); camera.lookAt(camera.position.clone().add(V(0, 0, -10))); }
  else { const back = VEL.cam === 1 ? 6.5 : 10, hi = VEL.cam === 1 ? 2.1 : 3.4; camera.position.copy(cpos).addScaledVector(cu, hi).add(V(0, 0, back)); camera.up.copy(cu); camera.lookAt(cpos.clone().addScaledVector(cu, 1.1).add(V(0, 0, -8))); }
  const fov = HALO.fov0 + Math.min(26, (HALO.s - 40) * 0.11) + HALO.kick * 6; if (Math.abs(camera.fov - fov) > 0.2) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); }
  camera.position.x += (Math.random() - 0.5) * Math.min(0.06, HALO.s * 0.0002); camera.position.y += (Math.random() - 0.5) * Math.min(0.06, HALO.s * 0.0002);
  // HUD
  $('velSpd').textContent = Math.round(HALO.s * 3.6); $('zoneN').textContent = ph === 1 ? 'HALO LINE · PRISM DEEP' : 'HALO LINE'; $('zoneL').textContent = `${Math.min(100, Math.round(HALO.d / HALO_LEN * 100))}% around the planet · A/D steer around the tube · Shift boost`; $('zone').style.opacity = 1;
  HALO.flash = Math.max(0, HALO.flash - dt * 2);
  if (HALO.d >= HALO_LEN) haloExit();
}
// fog and light for the tube: clear and dark in the neon, teal and deep in the glass gallery
{ const _ue = updateEnv; updateEnv = function (dt, t) { _ue(dt, t); if (!HALO.on || !haloOn()) return; const ph = haloPhase(HALO.d);
  const c = ph === 1 ? new THREE.Color('#0a3a58') : new THREE.Color('#05060a'); if (HALO.flash > 0) c.lerp(new THREE.Color('#ffffff'), HALO.flash * 0.6);
  scene.fog.color.copy(c); scene.fog.near = ph === 1 ? 80 : 40; scene.fog.far = ph === 1 ? 300 : 260; HORIZON.copy(c); VEL.nextRb = Math.max(VEL.nextRb, 1); }; }
// driving into a gate
{ const _st = step; step = function (dt) { _st(dt);
  if (!haloOn()) { if (HALO.on) haloAbort(); return; }
  if (HALO.on) { if (!RC.on) { haloAbort(); return; } // hold the real car still at the gate while you ride
    if (HALO.park) { player.pos.copy(HALO.park); } RC.vx = 0; RC.vz = 0; RC.v = 0;
    for (const H of VEL.hrain || []) H.l.visible = false;
    if (state === 'play' && !dlgOpen) haloStep(Math.min(dt, 0.05)); else if (VEL.carObj) { VEL.carObj.rotation.order = 'ZYX'; } return; }
  if (!RC.on || !RC.free || performance.now() < HALO.cool) return;
  const vx = RC.vx || 0, vz = RC.vz || 0;
  HALO_PORTALS.forEach((P, i) => { const ox = (player.pos.x - P.x) * P.nx; if (Math.abs(player.pos.z - P.z) < 7.5 && ox > -2.5 && ox < 6 && vx * P.nx > 6) { HALO.t0 = performance.now(); HALO.top = 0; haloEnter(i); } });
}; }
// no parking or camera mishaps mid-tunnel
{ const _tf = toggleFreeDrive; toggleFreeDrive = function () { if (HALO.on) { toast('HALO LINE', 'Hang on, you can park when you come out the other side!', 1.5); return true; } return _tf(); }; }
{ const _b = LEVELS.speedway.build; LEVELS.speedway.build = function () { haloAbort(); HALO.built = false; HALO.slots = []; HALO.root = null; HALO.town = null; HALO.deep = null; const r = _b.apply(this, arguments); try { haloGates(); } catch (e) { console.warn('halo gates', e); } return r; }; }
