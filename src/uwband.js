// =================== THE GLONK QUARTET, REDONE (2.23.32): a real band, a new singer and a dim, smoky Grub's ===================
// The Underworld band gets the Undercroft treatment: a drummer behind a full kit, guitar, bass and keys, shades and hats,
// and up front Lirra Vey, a green alien singer in a black sequined gown with big pretty eyes and red lips.
// The whole den is dimmed way down with a low smoky haze, and a pin spot picks her out.
const UWB_ON = () => LEVEL && LEVEL.id === 'underworld';
{ const _ue = updateEnv; updateEnv = function (a, b) { _ue(a, b); if (!UWB_ON()) return;
  scene.fog.color.set('#0a0709').convertSRGBToLinear(); scene.fog.near = 3; scene.fog.far = 22; sun.intensity = 0.08; hemi.intensity = 0.2; hemi.color.set('#a08a90'); fill.intensity = 0.05; }; }
{ const _b = LEVELS.underworld.build; LEVELS.underworld.build = function () { _b.apply(this, arguments); try { uwbBand(); uwbSmoke(); } catch (e) { console.warn('uwband', e); } }; }

// the singer: a slim green alien in a long black sequined gown, opera gloves, big almond eyes and glossy red lips
function makeLirra() {
  // built from scratch (not the boxy civilian): an oval head, bare shoulders, a fitted bodice and a mermaid gown, slim gloved arms
  const g = new THREE.Group(), skin = new THREE.MeshLambertMaterial({ color: '#5fc27a' }), gown = new THREE.MeshPhongMaterial({ color: '#120c18', shininess: 25, specular: '#1a1420', side: THREE.DoubleSide }), glove = toon('#0c0a10', 'cloth');
  // head and neck
  E(g, skin, 0, 1.765, 0, 0.112, 0.138, 0.118); E(g, skin, 0, 1.672, 0.028, 0.06, 0.04, 0.06); part(g, Cy(0.042, 0.05, 0.14, 10), skin, 0, 1.59, 0);
  // bare shoulders and collarbones, the bodice with a sweetheart line, a nipped waist and the hips
  E(g, skin, 0, 1.475, 0, 0.2, 0.055, 0.085); E(g, skin, 0, 1.43, 0.02, 0.14, 0.07, 0.07);
  E(g, gown, 0, 1.3, 0, 0.15, 0.12, 0.095); for (const s of [-1, 1]) E(g, gown, s * 0.065, 1.335, 0.052, 0.078, 0.07, 0.065);
  part(g, Cy(0.105, 0.135, 0.3, 14), gown, 0, 1.1, 0); E(g, gown, 0, 0.92, 0, 0.17, 0.12, 0.125);
  for (const s of [-1, 1]) part(g, B(0.015, 0.1, 0.012), gown, s * 0.1, 1.42, 0.05, 0, 0, s * 0.15);
  // the mermaid skirt: hugs the legs to the knee, then flares out onto the floor
  const prof = [[0.31, 0.0], [0.24, 0.06], [0.16, 0.22], [0.125, 0.4], [0.135, 0.6], [0.155, 0.8], [0.15, 0.95]].map(([r, y]) => new THREE.Vector2(r, y));
  part(g, new THREE.LatheGeometry(prof, 20), gown, 0, 0, 0);
  part(g, B(0.05, 0.36, 0.012), skin, 0.06, 0.5, 0.13, -0.08);
  for (const s of [-1, 1]) part(g, B(0.06, 0.04, 0.12), toon('#c9a43a'), s * 0.06, 0.02, 0.12);
  // sequins scattered over the gown, and a thin gold belt
  for (let i = 0; i < 50; i++) { const y = 0.04 + Math.random() * 1.32, a = (Math.random() - 0.5) * Math.PI * 1.6, r = y > 1.0 ? 0.13 : y > 0.4 ? 0.14 + Math.abs(y - 0.6) * 0.05 : 0.13 + (0.4 - y) * 0.45;
    part(g, new THREE.OctahedronGeometry(0.011, 0), glow(i % 3 ? '#e8e0ff' : '#ffd36a'), Math.sin(a) * r, y, Math.cos(a) * r); }
  part(g, Cy(0.112, 0.112, 0.025, 14), toon('#c9a43a'), 0, 0.97, 0);
  // slim arms: bare green upper arms and black opera gloves past the elbow
  for (const s of [-1, 1]) { part(g, Cy(0.036, 0.032, 0.28, 8), skin, 0.265 * s, 1.31, 0, 0, 0, 0.04 * s); part(g, Cy(0.034, 0.028, 0.32, 8), glove, 0.275 * s, 1.03, 0, 0, 0, 0.03 * s); E(g, '#0c0a10', 0.28 * s, 0.85, 0.01, 0.03, 0.05, 0.022); }
  // the face: big almond eyes with green irises, lashes and a shimmer of eyeshadow, a small nose, glossy red lips, cheek glow
  for (const s of [-1, 1]) { const ex = s * 0.046, ey = 1.785;
    E(g, '#3a1a4a', ex, ey + 0.012, 0.1, 0.038, 0.024, 0.012, 0, 0, -s * 0.2);
    E(g, '#f4f0ec', ex, ey, 0.104, 0.031, 0.02, 0.012, 0, 0, -s * 0.18); E(g, '#1a8a5a', ex, ey - 0.002, 0.113, 0.017, 0.018, 0.006); E(g, '#05040a', ex, ey - 0.002, 0.118, 0.008, 0.01, 0.003);
    E(g, glow('#ffffff'), ex + 0.006, ey + 0.006, 0.121, 0.004, 0.004, 0.002);
    part(g, B(0.064, 0.009, 0.012), toon('#05040a'), ex, ey + 0.019, 0.112, 0, 0, -s * 0.2); for (let k = 0; k < 3; k++) part(g, B(0.006, 0.018, 0.004), toon('#05040a'), ex + s * (0.018 + k * 0.01), ey + 0.025 + k * 0.003, 0.11, 0, 0, -s * (0.5 + k * 0.2));
    part(g, B(0.045, 0.007, 0.008), toon('#1e3a22'), ex, ey + 0.044, 0.104, 0, 0, -s * 0.14);
    E(g, '#7ad89a', s * 0.066, 1.735, 0.094, 0.02, 0.011, 0.006); part(g, new THREE.SphereGeometry(0.014, 8, 6), glow('#ffd36a'), s * 0.112, 1.7, 0); }
  E(g, '#4aa866', 0, 1.752, 0.118, 0.008, 0.012, 0.008);
  E(g, '#b80e22', 0, 1.709, 0.108, 0.026, 0.009, 0.009); E(g, '#d4142e', 0, 1.699, 0.106, 0.024, 0.01, 0.009); E(g, glow('#ff6a7a'), 0.008, 1.698, 0.114, 0.008, 0.003, 0.002);
  // little antennae with glowing pearl tips
  for (const s of [-1, 1]) { const pts = []; for (let k = 0; k <= 6; k++) { const f = k / 6; pts.push(new THREE.Vector3(s * (0.045 + f * 0.08), 1.88 + f * 0.19 - f * f * 0.06, 0.02 - f * 0.05)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.008, 5, false), skin)); part(g, new THREE.SphereGeometry(0.022, 8, 6), glow('#c8ffd8'), pts[6].x, pts[6].y, pts[6].z); }
  // sleek black hair with a deep green sheen, a side-swept wave across the brow, falling past the shoulders
  const hm = toon('#0c0a10', 'cloth'), hm2 = toon('#1a3a2a', 'cloth');
  E(g, '#0c0a10', 0, 1.83, -0.018, 0.124, 0.098, 0.13);
  for (let i = 0; i < 22; i++) { const a = Math.PI * (0.4 + i / 21 * 1.2), r0 = 0.12, len = 0.3 + (i % 3) * 0.05, ph = i * 1.1, pts = [];
    for (let k = 0; k <= 8; k++) { const f = k / 8, r = r0 + f * 0.035 + Math.sin(f * 6 + ph) * 0.018; pts.push(new THREE.Vector3(Math.sin(a) * r, 1.87 - f * len - f * f * 0.06, Math.cos(a) * r - f * 0.03)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.028 - (i % 2) * 0.006, 5, false), i % 4 ? hm : hm2)); }
  { const pts = []; for (let k = 0; k <= 8; k++) { const f = k / 8; pts.push(new THREE.Vector3(0.09 - f * 0.18, 1.9 - f * 0.03 + Math.sin(f * 3.2) * 0.025, 0.095 + Math.sin(f * 3.1) * 0.02)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.032, 6, false), hm)); }
  // a choker with a green gem
  part(g, Cy(0.05, 0.05, 0.02, 12), toon('#0c0a10'), 0, 1.6, 0); part(g, new THREE.OctahedronGeometry(0.016, 0), glow('#6aff9a'), 0, 1.595, 0.052);
  return g;
}

function uwbBand() {
  const sx = -9.4, sz = 7.2, ry = Math.PI / 2 + 0.35;
  // clear the old players, the theremin, the drum pods and the old mic, keeping the stage, truss, backdrop and speakers
  const inS = o => Math.abs(o.position.x - sx) < 1.55 && Math.abs(o.position.z - sz) < 1.55;
  for (const o of [...levelGroup.children]) if (o.userData && o.userData.rig && inS(o)) levelGroup.remove(o);
  for (const o of [...props.children]) if (inS(o) && o.position.y > 0.33) props.remove(o);
  const black = toon('#141218'), chrome = toon('#a8aeb8'), gold = toon('#c9a43a'), red = toon('#7a1020');
  // stage-local placement: +f toward the crowd, +s along the stage
  const fx = Math.sin(ry), fz = Math.cos(ry), lx = Math.cos(ry), lz = -Math.sin(ry), at = (f, s) => [sx + fx * f + lx * s, sz + fz * f + lz * s];
  const band = [];
  const mus = (mk, rig, f, s, anim, seat) => { const [x, z] = at(f, s), o = buildChar(mk, rig), R = o.userData.rig; o.position.set(x, 0.3, z); o.rotation.y = ry;
    if (seat) { o.position.y = 0.3 + seat - (R ? R.spec.hip : 0.95) + 0.07; sitChar(o, seat); } levelGroup.add(o); const st = {}; band.push([o, R, anim, st, !seat]); return o; };
  // drums on a riser at the back
  { const [x, z] = at(-1.35, 0); part(props, Cy(0.85, 0.9, 0.22, 18), black, x, 0.41, z);
    const dk = new THREE.Group(); dk.position.set(x, 0.52, z); dk.rotation.y = ry; levelGroup.add(dk);
    part(dk, Cy(0.34, 0.34, 0.3, 16), red, 0, 0.36, 0.4, Math.PI / 2); part(dk, Cy(0.3, 0.3, 0.31, 16), toon('#e8e4dc'), 0, 0.36, 0.4, Math.PI / 2);
    part(dk, Cy(0.16, 0.16, 0.12, 12), red, -0.34, 0.62, 0.5); part(dk, Cy(0.14, 0.14, 0.14, 12), red, -0.12, 0.8, 0.46, 0.4); part(dk, Cy(0.14, 0.14, 0.14, 12), red, 0.14, 0.8, 0.46, 0.4); part(dk, Cy(0.21, 0.21, 0.34, 12), red, 0.46, 0.36, 0.42);
    const cym = []; for (const [cx, cy, cz] of [[-0.62, 1.05, 0.38], [0.6, 1.2, 0.3], [-0.34, 1.15, 0.12]]) { part(dk, Cy(0.012, 0.012, cy, 4), chrome, cx, cy / 2, cz); cym.push(part(dk, Cy(0.25, 0.25, 0.012, 16), gold, cx, cy, cz)); }
    part(dk, Cy(0.18, 0.16, 0.42, 10), black, 0, 0.21, -0.12);
    const dn = new THREE.Mesh(new THREE.CircleGeometry(0.29, 20), new THREE.MeshBasicMaterial({ map: signTex('GLONK', '#1a0a12', '#c86aff') })); dn.position.set(0, 0.36, 0.56); dk.add(dn);
    const o = buildChar(() => npcDisarm(recolor(makeSpearman(), { '#7fae63': '#8a4a6a', '#4f7a3c': '#5a2a4a' })), 'spearman'), R = o.userData.rig; o.position.set(0, 0.42 - (R ? R.spec.hip : 0.95) + 0.07, -0.1); sitChar(o, 0.42); dk.add(o);
    for (const arm of [R && R.armL, R && R.armR]) if (arm) part(arm, Cy(0.018, 0.018, 0.45, 4), toon('#e8d0a0'), 0, -0.5, 0.2, 1.2);
    levelAnims.push(t => { if (!R || !o.parent) return; const b = t * 8.4; if (R.armL) R.armL.rotation.x = -1.0 + Math.max(0, Math.sin(b)) * 0.7; if (R.armR) R.armR.rotation.x = -1.0 + Math.max(0, Math.sin(b + Math.PI)) * 0.7; if (R.head) R.head.rotation.x = Math.abs(Math.sin(b / 2)) * 0.22; cym.forEach((c, i) => { c.rotation.x = Math.sin(t * 9 + i * 2) * 0.12; }); }); }
  // a guitar (or bass): body, neck, headstock and glowing strings, slung across the player
  const axe = (o, col, bass) => { const g = new THREE.Group(), L = bass ? 0.95 : 0.8; part(g, B(0.34, 0.42, 0.07), toon(col), 0, 0, 0); part(g, B(0.24, 0.2, 0.072), toon(col), 0.04, 0.24, 0); part(g, Cy(0.06, 0.06, 0.075, 12), black, 0, 0.02, 0.0, Math.PI / 2);
    part(g, B(0.06, L, 0.04), toon('#3a2414', 'wood'), 0, 0.2 + L / 2, 0.01); part(g, B(0.1, 0.16, 0.04), black, 0, 0.28 + L, 0.01); for (let k = 0; k < (bass ? 4 : 6); k++) part(g, B(0.004, L + 0.25, 0.004), glow('#e8f0ff'), -0.02 + k * 0.009, 0.1 + L / 2, 0.04);
    part(g, B(0.04, 0.6, 0.02), black, 0.1, 0.34, -0.06, 0, 0, -0.9); g.position.set(0.04, 1.08, 0.2); g.rotation.set(0, 0, -1.15); o.add(g); };
  const strum = (o, R, t) => { if (R.armR) { R.armR.rotation.x = -0.75 + Math.sin(t * 9.5) * 0.18; R.armR.rotation.z = 0.25; } if (R.armL) { R.armL.rotation.x = -1.05 + Math.sin(t * 2.1) * 0.06; R.armL.rotation.z = -0.55; } if (R.head) R.head.rotation.x = Math.max(0, Math.sin(t * 4.2)) * 0.18; };
  axe(mus(() => npcDisarm(recolor(makeBugHybrid(), { '#5f8a3a': '#3a5a8a', '#3e5e26': '#2a3a6a' })), 'bughybrid', -0.2, -1.05, strum), '#c8202a');
  axe(mus(() => makeCivilian('#2a2a30', '#14120f', '#8fae6a', '#1e1a18', '#4fd2ff'), 'civ', -0.2, 1.05, (o, R, t) => strum(o, R, t * 0.6)), '#2a6ac8', true);
  // keys back left
  { const [x, z] = at(-0.95, -1.15), kb = new THREE.Group(); kb.position.set(x, 0.3, z); kb.rotation.y = ry; levelGroup.add(kb);
    part(kb, B(1.0, 0.07, 0.34), black, 0, 0.98, 0.42); part(kb, B(0.92, 0.02, 0.15), toon('#f0ece4'), 0, 1.02, 0.48); for (let k = 0; k < 6; k++) part(kb, B(0.05, 0.02, 0.09), black, -0.38 + k * 0.16, 1.035, 0.45); for (const s of [-1, 1]) part(kb, B(0.04, 0.9, 0.04), chrome, s * 0.3, 0.5, 0.42, 0, 0, s * 0.45);
    for (let k = 0; k < 4; k++) part(kb, B(0.03, 0.03, 0.01), glow(['#ff4fd8', '#4fe0ff', '#ffd36a', '#7fff6a'][k]), -0.36 + k * 0.07, 1.0, 0.6); }
  // singer's spot, front and centre, with a vintage mic on a stand
  const [mx, mz] = at(1.25, 0);
  { const [x, z] = at(1.62, 0); part(props, Cy(0.015, 0.015, 1.25, 5), chrome, x, 0.92, z); part(props, Cy(0.17, 0.19, 0.03, 10), black, x, 0.32, z); const m = part(props, new THREE.SphereGeometry(0.05, 10, 8), chrome, x, 1.56, z); m.scale.set(1, 1.3, 1); part(props, Cy(0.035, 0.025, 0.08, 8), black, x, 1.49, z); }
  const sing = mus(makeLirra, 'civ', 1.25, 0, (o, R, t) => { if (R.armR) { R.armR.rotation.x = -1.0 + Math.sin(t * 0.9) * 0.05; R.armR.rotation.z = 0.12; } if (R.armL) { R.armL.rotation.x = -0.55 - Math.max(0, Math.sin(t * 0.7)) * 0.9; R.armL.rotation.z = -0.35 - Math.sin(t * 0.5) * 0.25; }
    if (R.head) { R.head.rotation.x = -0.12 + Math.sin(t * 1.3) * 0.06; R.head.rotation.z = Math.sin(t * 0.8) * 0.1; } o.rotation.y = ry + Math.sin(t * 0.45) * 0.22; });
  const sp = []; sing.traverse(c => { if (c.isMesh && c.geometry.type === 'OctahedronGeometry' && c.geometry.parameters.radius < 0.012) sp.push(c); }); // sequins that survived the merge twinkle
  // the players get shades, and a fedora or a beret
  band.forEach(([o, R], i) => { if (!R || !R.head || o === sing) return; const y = 1.78 - R.spec.neck; part(R.head, B(0.24, 0.045, 0.02), toon('#0c0a10'), 0, y, 0.14); part(R.head, B(0.06, 0.03, 0.02), glow(['#ff6ad8', '#7fe8ff'][i % 2]), 0.06, y + 0.005, 0.151);
    if (i % 2) { part(R.head, Cy(0.13, 0.15, 0.12, 12), toon('#1a1418', 'cloth'), 0, y + 0.16, -0.01); part(R.head, Cy(0.24, 0.24, 0.015, 16), toon('#1a1418', 'cloth'), 0, y + 0.1, -0.01); part(R.head, Cy(0.151, 0.151, 0.03, 12), toon('#8a1e2a'), 0, y + 0.12, -0.01); }
    else part(R.head, Cy(0.17, 0.15, 0.06, 14), toon('#5a1e8a', 'cloth'), 0.02, y + 0.12, -0.01, 0, 0, 0.2); });
  // a warm pin spot on her from the truss, and a soft violet wash on the band behind
  const pin = new THREE.SpotLight(0xffd8b0, 1.5, 7, 0.32, 0.55, 1.4); pin.position.set(mx + fx * 0.6, 3.2, mz + fz * 0.6); pin.target.position.set(mx, 1.2, mz); levelGroup.add(pin, pin.target);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.62, 2.9, 18, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd8b0', transparent: true, opacity: 0.035, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); beam.position.set(mx + fx * 0.3, 1.75, mz + fz * 0.3); levelGroup.add(beam);
  const wash = new THREE.PointLight(0x9a5aff, 0.5, 5, 1.6); { const [wx, wz] = at(-0.8, 0); wash.position.set(wx, 2.6, wz); } levelGroup.add(wash);
  levelAnims.push(t => { band.forEach(([o, R, anim, st, stand], i) => { if (!o.parent || !R) return; if (stand) { animRig(o, st, 1 / 60, t); o.position.y = 0.3 + Math.abs(Math.sin(t * 2.1 + i)) * 0.02; } anim(o, R, t); });
    sp.forEach((c, i) => c.scale.setScalar(0.4 + Math.max(0, Math.sin(t * 3 + i * 1.7)) * 1.3)); beam.material.opacity = 0.03 + Math.sin(t * 1.3) * 0.008; pin.intensity = 1.4 + Math.sin(t * 2.3) * 0.15; });
  // the room's own lamps come way down, and the old band's colour cones go
  for (const o of levelGroup.children) if (o.isMesh && o.geometry.type === 'ConeGeometry' && o.geometry.parameters.height === 2.9 && o !== beam) o.visible = false;
  for (const o of levelGroup.children) if (o.isPointLight && o !== wash && o.position.y > 2.5 && o.intensity > 0.5) o.intensity *= 0.3;
}

// smoke: a low, slow haze over the whole den, thicker in front of the stage
function uwbSmoke() {
  const N = 230, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), c = new THREE.Color(), sp = [];
  for (let i = 0; i < N; i++) { const st = i < 60; pos.set(st ? [-9.4 + 1 + Math.random() * 5, 0.5 + Math.random() * 2.6, 7.2 + (Math.random() - 0.5) * 6] : [(Math.random() - 0.5) * 23, 0.5 + Math.random() * 2.6, (Math.random() - 0.5) * 21], i * 3);
    if (st) c.setHSL(0.75 + Math.random() * 0.1, 0.45, 0.42 + Math.random() * 0.12); else c.setHSL(0.07 + Math.random() * 0.06, 0.18, 0.3 + Math.random() * 0.12); col.set([c.r, c.g, c.b], i * 3); sp.push(Math.random() * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 3.2, map: hbHazeTex(), vertexColors: true, transparent: true, opacity: 0.14, depthWrite: false })); m.frustumCulled = false; levelGroup.add(m);
  levelAnims.push(t => { for (let i = 0; i < N; i++) { pos[i * 3] += Math.sin(t * 0.07 + sp[i]) * 0.005; pos[i * 3 + 2] += Math.cos(t * 0.05 + sp[i]) * 0.005; pos[i * 3 + 1] += Math.sin(t * 0.2 + sp[i]) * 0.0015; } g.attributes.position.needsUpdate = true; });
  // cigarette smoke curling up off a few tables and the bar
  for (const [x, z] of [[-5, 8.9], [-2, -7.8], [1.6, -7.8], [6, 4]]) levelAnims.push(() => { if (Math.random() < 0.05) burst(V(x, 1.0, z), '#9a9aa4', 1, 0.08); });
}
