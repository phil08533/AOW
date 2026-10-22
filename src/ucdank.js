// =================== THE UNDERCROFT, DANKER (2.22.27) ===================
// Darker lighting and a low smoky haze over the whole floor, puddles and drips, and the band rebuilt as real musicians
// on a proper stage: drum kit on a riser, guitar, bass, keys, amps, a lighting truss and a curtain. Runs after the shrink.
const UCD_ON = () => LEVEL && LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' && zTheme(ZF.floor) === 'under';
{ const _ue = updateEnv; updateEnv = function (a, b) { _ue(a, b); if (!UCD_ON()) return;
  scene.fog.color.set('#0c0807').convertSRGBToLinear(); scene.fog.near = 5; scene.fog.far = 30; sun.intensity = 0.1; hemi.intensity = 0.26; hemi.color.set('#b89a80'); fill.intensity = 0.06; }; }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.apply(this, arguments); if (zTheme(ZF.floor) !== 'under') return; try { ucdBand(); ucdHaze(); } catch (e) { console.warn('ucdank', e); } }; }
function ucdHaze() {
  const N = 260, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), c = new THREE.Color(), sp = [];
  for (let i = 0; i < N; i++) { pos.set([(Math.random() - 0.5) * 38, 0.6 + Math.random() * 4.5, (Math.random() - 0.5) * 38], i * 3); c.setHSL(0.07 + Math.random() * 0.05, 0.25, 0.32 + Math.random() * 0.12); col.set([c.r, c.g, c.b], i * 3); sp.push(Math.random() * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 3.4, map: hbHazeTex(), vertexColors: true, transparent: true, opacity: 0.13, depthWrite: false })); m.frustumCulled = false; levelGroup.add(m);
  levelAnims.push(t => { for (let i = 0; i < N; i++) { pos[i * 3] += Math.sin(t * 0.07 + sp[i]) * 0.006; pos[i * 3 + 2] += Math.cos(t * 0.05 + sp[i]) * 0.006; pos[i * 3 + 1] += Math.sin(t * 0.2 + sp[i]) * 0.002; } g.attributes.position.needsUpdate = true; });
  // puddles, slime streaks and drips from the pipes
  const wet = new THREE.MeshPhongMaterial({ color: '#0d0f0c', shininess: 90, specular: '#5a6a5a', transparent: true, opacity: 0.85 });
  for (const [x, z, r] of [[4, 2, 1.1], [-6, 8, 0.8], [10, -6, 0.9], [-2, -10, 0.7], [13, 12, 0.6]]) { const p = new THREE.Mesh(new THREE.CircleGeometry(r, 14), wet); p.rotation.x = -Math.PI / 2; p.scale.y = 0.6 + Math.random() * 0.5; p.position.set(x, 0.015, z); levelGroup.add(p); }
  for (const [x, z] of [[4, 2], [10, -6], [-6, 8]]) levelAnims.push(() => { if (Math.random() < 0.02) burst(V(x, 5.2, z), '#6a7a6a', 1, 0.1); });
  for (let i = 0; i < 10; i++) { const x = -18 + i * 4, s = new THREE.Mesh(new THREE.PlaneGeometry(0.6 + (i % 3) * 0.3, 2 + (i % 4) * 0.6), new THREE.MeshBasicMaterial({ color: '#1e2a16', transparent: true, opacity: 0.55, depthWrite: false })); s.position.set(x, 1.2, -19.45); levelGroup.add(s); }
}
function ucdBand() {
  const X0 = -21.2, X1 = -12.8, Z0 = -19.8, Z1 = -11.8, inS = (x, z) => x > X0 && x < X1 && z > Z0 && z < Z1 && Math.hypot(x + 21, z + 19.6) < 8.2;
  // clear the old plank stage, speakers and the two old musicians
  for (const o of [...props.children]) if (inS(o.position.x, o.position.z)) props.remove(o);
  for (const o of [...levelGroup.children]) if (o.userData && o.userData.rig && inS(o.position.x, o.position.z)) levelGroup.remove(o);
  for (let i = BOXES.length - 1; i >= 0; i--) if (inS(BOXES[i][0], BOXES[i][1])) BOXES.splice(i, 1);
  for (let i = CIRCLES.length - 1; i >= 0; i--) if (inS(CIRCLES[i][0], CIRCLES[i][1])) CIRCLES.splice(i, 1);
  // a round stage tucked into the back-left corner: a quarter circle around the corner
  const OX = -21, OZ = -19.6, RS = 7.4, Q = Math.PI / 2, at = (r, a) => [OX + r * Math.sin(a), OZ + r * Math.cos(a)];
  const wood = toon('#241712', 'wood'), black = toon('#141218'), chrome = toon('#a8aeb8'), gold = toon('#c9a43a'), brass = toon('#d8b04a');
  const add = (geo, mat, x, y, z, ry) => { const m = new THREE.Mesh(geo, mat instanceof THREE.Material ? mat : toon(mat)); m.position.set(x, y, z); if (ry) m.rotation.y = ry; levelGroup.add(m); return m; };
  add(new THREE.CylinderGeometry(RS, RS, 0.5, 40, 1, false, 0, Q), wood, OX, 0.25, OZ);
  add(new THREE.CylinderGeometry(RS - 0.6, RS - 0.6, 0.04, 40, 1, false, 0, Q), toon('#3a1018', 'cloth'), OX, 0.52, OZ);
  add(new THREE.CylinderGeometry(RS + 0.02, RS + 0.02, 0.08, 40, 1, true, 0, Q), glow('#ff4a6a'), OX, 0.47, OZ);
  add(new THREE.CylinderGeometry(RS + 0.45, RS + 0.45, 0.22, 40, 1, false, 0, Q), toon('#1a1210', 'wood'), OX, 0.11, OZ);
  for (let i = 0; i <= 10; i++) { const [x, z] = at(RS + 0.03, i / 10 * Q); part(props, Cy(0.07, 0.07, 0.04, 8), glow('#ffd36a'), x, 0.3, z, Math.PI / 2, 0, 0).rotation.y = i / 10 * Q; }
  for (let i = 0; i < 9; i++) { const [x, z] = at(RS * 0.98, (i + 0.5) / 9 * Q); solid(x, z, 0.6); } for (let r = 1.5; r < RS; r += 1.6) for (let i = 0; i < Math.ceil(r); i++) { const [x, z] = at(r, (i + 0.5) / Math.ceil(r) * Q); solid(x, z, 0.75); }
  // velvet curtains on both walls behind it, gathered with gold ties
  for (let i = 0; i < 12; i++) { part(props, B(0.18, 4.4, 0.62), toon(i % 2 ? '#6a1420' : '#4a0c14', 'cloth'), OX + 0.25, 2.2, OZ + 0.35 + i * 0.62); part(props, B(0.62, 4.4, 0.18), toon(i % 2 ? '#6a1420' : '#4a0c14', 'cloth'), OX + 0.35 + i * 0.62, 2.2, OZ + 0.25); }
  part(props, B(0.2, 0.3, 7.6), gold, OX + 0.36, 4.5, OZ + 3.8); part(props, B(7.6, 0.3, 0.2), gold, OX + 3.8, 4.5, OZ + 0.36);
  // a curved lighting truss over the lip, with cans that sweep
  add(new THREE.TorusGeometry(RS - 0.6, 0.09, 6, 32, Q), chrome, OX, 4.4, OZ).rotation.set(Math.PI / 2, 0, 0);
  for (const a of [0.08, Q - 0.08]) { const [x, z] = at(RS - 0.6, a); part(props, B(0.16, 4.4, 0.16), chrome, x, 2.2, z); }
  const cans = [], lights = [];
  [0xff3a6a, 0x4fd2ff, 0xffb347, 0xc86aff, 0x7fff6a].forEach((h, i) => { const a = (i + 0.5) / 5 * Q, [x, z] = at(RS - 0.6, a), can = new THREE.Group();
    part(can, Cy(0.16, 0.2, 0.4, 10), black, 0, -0.2, 0); part(can, Cy(0.15, 0.15, 0.02, 10), glow('#' + new THREE.Color(h).getHexString()), 0, -0.41, 0); can.position.set(x, 4.3, z); levelGroup.add(can); cans.push(can);
    const L = new THREE.SpotLight(h, 2.2, 12, 0.5, 0.6, 1.4), [tx, tz] = at(3.5, a); L.position.set(x, 4.1, z); L.target.position.set(tx, 0.5, tz); levelGroup.add(L, L.target); lights.push([L, a]); });
  levelAnims.push(t => lights.forEach(([L, a], i) => { const w = Math.sin(t * 0.8 + i * 1.7), [tx, tz] = at(3.5 + w * 1.2, a + Math.cos(t * 0.6 + i) * 0.25); L.target.position.set(tx, 0.5, tz); cans[i].rotation.z = w * 0.35; L.intensity = 1.6 + Math.sin(t * 3 + i) * 0.7; }));
  // amps and a hanging mirror ball
  window.UC_SPK = [];
  for (const a of [0.12, Q - 0.12]) { const [x, z] = at(2.2, a); add(B(1.0, 1.2, 0.6), black, x, 1.1, z, a); const s = add(Cy(0.32, 0.32, 0.04, 14), toon('#2a2a2e'), x + Math.sin(a) * 0.31, 1.2, z + Math.cos(a) * 0.31, a); s.rotation.x = Math.PI / 2; UC_SPK.push([x, z]); }
  const ball = add(new THREE.IcosahedronGeometry(0.4, 1), new THREE.MeshPhongMaterial({ color: '#d8dce4', shininess: 120, flatShading: true, emissive: '#2a2a3a' }), ...at(4.2, Q / 2).slice(0, 1), 5.2, at(4.2, Q / 2)[1]);
  levelAnims.push(t => { ball.rotation.y = t * 0.6; if (Math.random() < 0.05) { const [x, z] = at(2 + Math.random() * 6, Math.random() * Q * 1.4); burst(V(x, 0.6 + Math.random(), z), ['#ffd36a', '#ff6aa8', '#4fd2ff'][randi(0, 2)], 1, 0.15); } });
  // drum riser and kit in the corner
  const [dx, dz] = at(2.6, Q / 2); add(new THREE.CylinderGeometry(1.4, 1.5, 0.3, 20), black, dx, 0.65, dz);
  const dk = new THREE.Group(); dk.position.set(dx, 0.8, dz); dk.rotation.y = Q / 2; levelGroup.add(dk);
  part(dk, Cy(0.42, 0.42, 0.36, 16), toon('#7a1020'), 0, 0.42, 0.45, Math.PI / 2); part(dk, Cy(0.38, 0.38, 0.37, 16), toon('#e8e4dc'), 0, 0.42, 0.45, Math.PI / 2);
  part(dk, Cy(0.2, 0.2, 0.14, 12), toon('#7a1020'), -0.42, 0.75, 0.55); part(dk, Cy(0.17, 0.17, 0.16, 12), toon('#7a1020'), -0.15, 0.95, 0.5, 0.4); part(dk, Cy(0.17, 0.17, 0.16, 12), toon('#7a1020'), 0.18, 0.95, 0.5, 0.4);
  part(dk, Cy(0.26, 0.26, 0.4, 12), toon('#7a1020'), 0.55, 0.42, 0.45);
  const cym = []; for (const [x, y, z] of [[-0.75, 1.2, 0.4], [0.7, 1.45, 0.3], [-0.4, 1.35, 0.1]]) { part(dk, Cy(0.015, 0.015, y, 4), chrome, x, y / 2, z); cym.push(part(dk, Cy(0.3, 0.3, 0.015, 16), gold, x, y, z)); }
  part(dk, Cy(0.22, 0.2, 0.5, 10), black, 0, 0.25, -0.15);
  { const o = buildChar(() => makeCivilian('#1e1c22', '#14120f', '#c58a64', '#c8402f', '#ff3a6a'), 'civ'), R = o.userData.rig; o.position.set(0, 0.5 - (R ? R.spec.hip : 0.95) + 0.07, -0.1); sitChar(o, 0.5); dk.add(o);
    for (const s of [-1, 1]) { const arm = s < 0 ? R.armL : R.armR; if (arm) part(arm, Cy(0.02, 0.02, 0.5, 4), toon('#e8d0a0'), 0, -0.55, 0.22, 1.2); }
    levelAnims.push(t => { if (!R) return; const b = t * 8.6; if (R.armL) R.armL.rotation.x = -1.0 + Math.max(0, Math.sin(b)) * 0.7; if (R.armR) R.armR.rotation.x = -1.0 + Math.max(0, Math.sin(b + Math.PI)) * 0.7; if (R.head) R.head.rotation.x = Math.abs(Math.sin(b / 2)) * 0.25;
      cym.forEach((c, i) => { c.rotation.x = Math.sin(t * 9 + i * 2) * 0.12; }); }); }
  const mus = (look, r, a, anim) => { const [x, z] = at(r, a), o = buildChar(() => makeCivilian(...look), 'civ'); o.position.set(x, 0.5, z); o.rotation.y = a; levelGroup.add(o); const st = {};
    levelAnims.push(t => { if (!o.parent) return; animRig(o, st, 1 / 60, t); anim(o, o.userData.rig, t, a); }); return o; };
  // the horn section: a space sax (curved brass with glowing keys) and a space trumpet (bell flares in neon)
  const blow = (o, R, t, a) => { if (!R) return; if (R.armL) R.armL.rotation.x = -1.25 + Math.sin(t * 4.3) * 0.05; if (R.armR) R.armR.rotation.x = -1.1 + Math.sin(t * 4.3 + 1) * 0.05; if (R.torso) R.torso.rotation.x = -0.12 - Math.max(0, Math.sin(t * 2.15)) * 0.18; o.rotation.y = a + Math.sin(t * 1.07) * 0.25; };
  { const o = mus(['#2a2a30', '#14120f', '#e0b892', '#1e1a18', '#4fd2ff'], 4.6, 0.32, blow), g = new THREE.Group();
    part(g, Cy(0.06, 0.08, 0.7, 10), brass, 0, 0, 0); part(g, new THREE.TorusGeometry(0.14, 0.07, 8, 12, Math.PI), brass, 0.14, -0.35, 0, 0, 0, Math.PI); part(g, Cy(0.2, 0.08, 0.32, 12), brass, 0.3, -0.2, 0, 0, 0, -0.3);
    part(g, Cy(0.21, 0.21, 0.02, 12), glow('#4fd2ff'), 0.36, -0.04, 0, 0, 0, -0.3); for (let i = 0; i < 5; i++) part(g, new THREE.SphereGeometry(0.025, 6, 4), glow('#7fe8ff'), -0.06, 0.2 - i * 0.1, 0.04);
    part(g, Cy(0.02, 0.025, 0.25, 6), toon('#14120f'), -0.05, 0.45, 0.06, 0.8); g.position.set(0, 1.15, 0.28); g.rotation.z = 0.2; o.add(g); }
  { const o = mus(['#4a1e5a', '#14120f', '#8a5a3a', '#e8e4dc', '#ffd36a'], 4.6, Q - 0.32, blow), g = new THREE.Group();
    part(g, Cy(0.03, 0.03, 0.5, 8), brass, 0, 0, 0, Math.PI / 2); part(g, Cy(0.16, 0.035, 0.24, 12), brass, 0, 0, 0.36, Math.PI / 2); part(g, Cy(0.17, 0.17, 0.02, 12), glow('#ff6aa8'), 0, 0, 0.48, Math.PI / 2);
    part(g, B(0.08, 0.14, 0.24), brass, 0, -0.08, -0.02); for (let i = 0; i < 3; i++) part(g, Cy(0.018, 0.018, 0.08, 6), glow('#ffd36a'), 0, 0.05, -0.08 + i * 0.07); g.position.set(0, 1.55, 0.3); o.add(g); }
  // keys along the back
  { const a = 0.95, [x, z] = at(4.0, a); const kb = new THREE.Group(); kb.position.set(x, 0, z); kb.rotation.y = a; levelGroup.add(kb);
    part(kb, B(1.3, 0.08, 0.4), black, 0, 1.45, 0.45); part(kb, B(1.2, 0.02, 0.18), toon('#f0ece4'), 0, 1.5, 0.52); for (const s of [-1, 1]) part(kb, B(0.05, 0.95, 0.05), chrome, s * 0.35, 0.98, 0.45, 0, 0, s * 0.5);
    mus(['#1e3a2a', '#14120f', '#c58a64', '#ffd36a', '#7fff6a'], 4.0, a, (o, R, t) => { if (!R) return; if (R.armL) R.armL.rotation.x = -0.9 + Math.sin(t * 6) * 0.12; if (R.armR) R.armR.rotation.x = -0.9 + Math.sin(t * 6 + 2) * 0.12; if (R.head) R.head.rotation.z = Math.sin(t * 2.15) * 0.2; }); }
  // the singer's mic stand, front and centre
  { const [x, z] = at(6.7, Q / 2); part(props, Cy(0.02, 0.02, 1.5, 5), chrome, x, 1.25, z); part(props, Cy(0.2, 0.22, 0.04, 10), black, x, 0.52, z); part(props, Cy(0.05, 0.035, 0.14, 8), toon('#2a2a2e'), x, 2.0, z, 0.9); }
}
