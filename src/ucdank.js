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
  const K = typeof UC_K === 'number' ? UC_K : 1, X0 = -21 * 1, X1 = -13, Z0 = -19.6, Z1 = -13.6, inS = (x, z) => x > X0 && x < X1 && z > Z0 && z < Z1;
  // clear the old plank stage, speakers and the two old musicians
  for (const o of [...props.children]) if (inS(o.position.x, o.position.z)) props.remove(o);
  for (const o of [...levelGroup.children]) if (o.userData && o.userData.rig && inS(o.position.x, o.position.z)) levelGroup.remove(o);
  for (let i = BOXES.length - 1; i >= 0; i--) if (inS(BOXES[i][0], BOXES[i][1])) BOXES.splice(i, 1);
  for (let i = CIRCLES.length - 1; i >= 0; i--) if (inS(CIRCLES[i][0], CIRCLES[i][1])) CIRCLES.splice(i, 1);
  const cx = -16.8, wood = toon('#241712', 'wood'), black = toon('#141218'), chrome = toon('#a8aeb8'), gold = toon('#c9a43a'), red = toon('#5a1018', 'cloth');
  // the stage: raised platform, lit front lip, steps, curtain
  part(props, B(7.6, 0.5, 5.4), wood, cx, 0.25, -16.5); box(cx, -16.5, 3.8, 2.7);
  part(props, B(7.6, 0.06, 0.08), glow('#ff4a6a'), cx, 0.5, -13.78); for (let i = 0; i < 8; i++) part(props, Cy(0.07, 0.07, 0.04, 8), glow('#ffd36a'), cx - 3.4 + i * 0.97, 0.3, -13.77, Math.PI / 2);
  part(props, B(1.6, 0.25, 0.6), wood, cx + 3, 0.12, -13.4);
  part(props, B(7.8, 4.2, 0.12), red, cx, 2.1, -19.25); for (let i = 0; i < 13; i++) part(props, B(0.14, 4.2, 0.18), toon(i % 2 ? '#6a1420' : '#4a0c14', 'cloth'), cx - 3.75 + i * 0.625, 2.1, -19.15);
  // lighting truss with coloured cans that sweep
  for (const s of [-1, 1]) part(props, B(0.18, 4.4, 0.18), chrome, cx + s * 3.7, 2.2, -14.1); part(props, B(7.6, 0.18, 0.18), chrome, cx, 4.35, -14.1);
  const cans = [], lights = [];
  [0xff3a6a, 0x4fd2ff, 0xffb347, 0xc86aff].forEach((h, i) => { const x = cx - 2.7 + i * 1.8, can = new THREE.Group(); part(can, Cy(0.16, 0.2, 0.4, 10), black, 0, 0, 0, Math.PI / 2 - 0.6); part(can, Cy(0.15, 0.15, 0.02, 10), glow('#' + new THREE.Color(h).getHexString()), 0, -0.12, 0.17, Math.PI / 2 - 0.6);
    can.position.set(x, 4.15, -14.1); levelGroup.add(can); cans.push(can); const L = new THREE.SpotLight(h, 2.2, 12, 0.5, 0.6, 1.4); L.position.set(x, 4.1, -14.1); L.target.position.set(x, 0.5, -16.5); levelGroup.add(L, L.target); lights.push(L); });
  levelAnims.push(t => lights.forEach((L, i) => { const a = Math.sin(t * 0.8 + i * 1.7); L.target.position.x = cx - 2.7 + i * 1.8 + a * 1.4; cans[i].rotation.z = -a * 0.3; L.intensity = 1.6 + Math.sin(t * 3 + i) * 0.7; }));
  // amps
  for (const s of [-1, 1]) { const x = cx + s * 3.0; part(props, B(1.0, 1.2, 0.6), black, x, 1.1, -18.5); part(props, Cy(0.32, 0.32, 0.04, 14), toon('#2a2a2e'), x, 1.2, -18.18, Math.PI / 2); part(props, B(0.9, 0.12, 0.05), gold, x, 1.6, -18.18); }
  // drum riser and kit
  part(props, B(2.4, 0.3, 1.8), black, cx, 0.65, -17.9);
  const dk = new THREE.Group(); dk.position.set(cx, 0.8, -17.2); levelGroup.add(dk);
  part(dk, Cy(0.42, 0.42, 0.36, 16), toon('#7a1020'), 0, 0.42, 0.1, Math.PI / 2); part(dk, Cy(0.38, 0.38, 0.37, 16), toon('#e8e4dc'), 0, 0.42, 0.1, Math.PI / 2);
  part(dk, Cy(0.2, 0.2, 0.14, 12), toon('#7a1020'), -0.42, 0.75, 0.25); part(dk, Cy(0.17, 0.17, 0.16, 12), toon('#7a1020'), -0.15, 0.95, 0.15, 0.4); part(dk, Cy(0.17, 0.17, 0.16, 12), toon('#7a1020'), 0.18, 0.95, 0.15, 0.4);
  part(dk, Cy(0.26, 0.26, 0.4, 12), toon('#7a1020'), 0.55, 0.42, 0.1);
  const cym = []; for (const [x, y, z] of [[-0.75, 1.2, 0.05], [0.7, 1.45, -0.05], [-0.4, 1.35, -0.25]]) { part(dk, Cy(0.015, 0.015, y, 4), chrome, x, y / 2, z); cym.push(part(dk, Cy(0.3, 0.3, 0.015, 16), gold, x, y, z)); }
  // the players
  const mus = (look, x, z, ry, anim, y) => { const o = buildChar(() => makeCivilian(...look), 'civ'); o.position.set(x, y == null ? 0.5 : y, z); o.rotation.y = ry; levelGroup.add(o); solid(x, z, 0.35); const st = {};
    levelAnims.push(t => { if (!o.parent) return; animRig(o, st, 1 / 60, t); anim(o, o.userData.rig, t); }); return o; };
  // drummer, seated on a throne behind the kit
  part(props, Cy(0.22, 0.2, 0.5, 10), black, cx, 1.05, -18.1);
  { const o = buildChar(() => makeCivilian('#1e1c22', '#14120f', '#c58a64', '#c8402f', '#ff3a6a'), 'civ'), R = o.userData.rig; o.position.set(cx, 1.3 - (R ? R.spec.hip : 0.95) + 0.07, -18.0); sitChar(o, 1.3); levelGroup.add(o);
    for (const s of [-1, 1]) { const arm = s < 0 ? R.armL : R.armR; if (arm) part(arm, Cy(0.02, 0.02, 0.5, 4), toon('#e8d0a0'), 0, -0.55, 0.22, 1.2); }
    levelAnims.push(t => { if (!o.parent || !R) return; const b = t * 8.6; if (R.armL) R.armL.rotation.x = -1.0 + Math.max(0, Math.sin(b)) * 0.7; if (R.armR) R.armR.rotation.x = -1.0 + Math.max(0, Math.sin(b + Math.PI)) * 0.7; if (R.head) R.head.rotation.x = Math.abs(Math.sin(b / 2)) * 0.25;
      cym.forEach((c, i) => { c.rotation.x = Math.sin(t * 9 + i * 2) * 0.12; }); }); }
  const strum = axe => (o, R, t) => { if (!R) return; if (R.armR) R.armR.rotation.x = -0.7 + Math.sin(t * 9) * 0.35; if (R.armL) R.armL.rotation.x = -1.1; if (R.head) R.head.rotation.x = Math.max(0, Math.sin(t * 4.3)) * 0.35; o.rotation.z = Math.sin(t * 2.15) * 0.05; };
  const guitar = (o, body, neck) => { const g = new THREE.Group(); part(g, B(0.44, 0.5, 0.08), toon(body), 0, 0, 0); part(g, B(0.1, 0.75, 0.05), toon(neck, 'wood'), 0, 0.6, 0); part(g, B(0.14, 0.16, 0.05), toon('#14120f'), 0, 1.02, 0); for (let i = 0; i < 4; i++) part(g, B(0.006, 1.1, 0.006), chrome, -0.03 + i * 0.02, 0.45, 0.045);
    g.position.set(0, 1.0, 0.24); g.rotation.z = 1.05; o.add(g); };
  guitar(mus(['#2a2a30', '#14120f', '#e0b892', '#1e1a18', '#4fd2ff'], cx - 2.4, -15.8, 0.25, strum()), '#c8402f', '#5a3a22');
  guitar(mus(['#4a1e5a', '#14120f', '#8a5a3a', '#e8e4dc', '#ffd36a'], cx + 2.4, -15.8, -0.25, (o, R, t) => { if (!R) return; if (R.armR) R.armR.rotation.x = -0.8 + Math.sin(t * 4.3) * 0.25; if (R.armL) R.armL.rotation.x = -1.1; o.rotation.y = -0.25 + Math.sin(t * 1.07) * 0.2; }), '#1e3a6a', '#3a2a1e');
  // keys
  part(props, B(1.3, 0.08, 0.4), black, cx - 2.6, 1.45, -17.6); part(props, B(1.2, 0.02, 0.18), toon('#f0ece4'), cx - 2.6, 1.5, -17.5); for (const s of [-1, 1]) part(props, B(0.05, 0.95, 0.05), chrome, cx - 2.6 + s * 0.35, 0.98, -17.6, 0, 0, s * 0.5);
  mus(['#1e3a2a', '#14120f', '#c58a64', '#ffd36a', '#7fff6a'], cx - 2.6, -18.2, 0, (o, R, t) => { if (!R) return; if (R.armL) R.armL.rotation.x = -0.9 + Math.sin(t * 6) * 0.12; if (R.armR) R.armR.rotation.x = -0.9 + Math.sin(t * 6 + 2) * 0.12; if (R.head) R.head.rotation.z = Math.sin(t * 2.15) * 0.2; });
  // Velma's mic stand
  part(props, Cy(0.02, 0.02, 1.5, 5), chrome, -16.1, 1.25, -14.4); part(props, Cy(0.2, 0.22, 0.04, 10), black, -16.1, 0.52, -14.4); part(props, Cy(0.05, 0.035, 0.14, 8), toon('#2a2a2e'), -16.1, 2.0, -14.5, 0.9);
}
