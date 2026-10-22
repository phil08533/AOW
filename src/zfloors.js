// =================== ZELTAC DECKS, DRESSED (2.22.19): every working deck gets structure and detail ===================
// Pillars and wall lights march down the long walls, a trim border frames the floor, the ceiling gets beams and lamps
// instead of only neon streaks, and each theme gets its own set dressing. The bar, homes and Undercroft keep their own.
{ const _zb = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _zb.apply(this, arguments); try { zfDress(); } catch (e) { console.warn('zfloors', e); } }; }
function zfDress() {
  const n = ZF.floor, th = zTheme(n); if (th === 'bar' || th === 'homes' || th === 'under') return;
  const T = ZTHEMES[th] || { col: '#c9a43a', floor: '#2c2f36', neon: '#8fe3ff' }, W = 26, D = 24, H = 7, rnd = i => (Math.sin(n * 47.3 + i * 11.9) + 1) / 2;
  // structure: pillars with lit caps, wall sconces, a base trim and a floor border
  for (const s of [-1, 1]) for (let z = -D + 4; z <= D - 6; z += 8) { part(props, B(1.0, H, 1.0), '#3a3d44', s * (W - 0.8), H / 2, z); part(props, B(1.1, 0.2, 1.1), glow(T.neon), s * (W - 0.8), H - 0.6, z); part(props, B(0.3, 0.5, 0.3), glow('#fff1c8'), s * (W - 1.4), 3, z + 4); }
  for (const s of [-1, 1]) { part(props, B(W * 2, 0.5, 0.15), toon(T.col), 0, 0.25, s * (D - 0.4)); part(props, B(0.15, 0.5, D * 2), toon(T.col), s * (W - 0.4), 0.25, 0); }
  part(props, B(W * 2 - 6, 0.02, 0.3), toon(T.col), 0, 0.015, -D + 3); part(props, B(W * 2 - 6, 0.02, 0.3), toon(T.col), 0, 0.015, D - 6);
  for (let x = -W + 4; x < W; x += 10) { part(props, B(0.4, 0.5, D * 2), '#2c2f36', x, H - 0.4, 0); }
  for (let i = 0; i < 6; i++) { const x = -W + 6 + i * 8.5; part(props, Cy(0.03, 0.03, 1.2, 4), '#5d636c', x, H - 0.6, 0); part(props, Cy(0.5, 0.7, 0.4, 10), toon('#2c2f36'), x, H - 1.3, 0); part(props, Cy(0.45, 0.45, 0.04, 10), glow('#fff1c8'), x, H - 1.52, 0); }
  // a deck directory by the elevator
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), new THREE.MeshBasicMaterial({ map: signTex(ZTHEMES[th] ? ZTHEMES[th].name.toUpperCase() : "CAPTAIN'S BRIDGE", '#0c0d14', T.neon) })); sg.position.set(16, 2.4, D - 0.5); sg.rotation.y = Math.PI; props.add(sg);
  const benches = pts => pts.forEach(([x, z, r]) => { part(props, B(2.2, 0.12, 0.6), toon('#8a6a44', 'wood'), x, 0.5, z, 0, r || 0); part(props, B(2.2, 0.5, 0.1), toon('#8a6a44', 'wood'), x - Math.sin(r || 0) * 0.3, 0.8, z - Math.cos(r || 0) * 0.3, 0, r || 0); box(x, z, 1.1, 0.4); });
  const plant = (x, z) => { part(props, B(1.0, 0.7, 1.0), toon('#5d636c', 'panel'), x, 0.35, z); part(props, new THREE.IcosahedronGeometry(0.6, 0), toon('#4f8a3a', 'leaves'), x, 1.2, z); solid(x, z, 0.6); };
  if (th === 'market') { // hanging lanterns over the aisles, produce crates and a rest area
    for (let i = 0; i < 12; i++) { const x = -20 + (i % 6) * 8, z = i < 6 ? -2 : 2; part(props, Cy(0.02, 0.02, 2, 4), '#5d636c', x, H - 1, z); part(props, new THREE.OctahedronGeometry(0.35, 0), glow(['#ffb347', '#ff6aa8', '#ffd36a'][i % 3]), x, H - 2.1, z); }
    for (let i = 0; i < 8; i++) { const x = -22 + i * 6.2, z = 20; part(props, B(1.2, 0.6, 0.9), toon('#8a6a44', 'wood'), x, 0.3, z); for (let k = 0; k < 4; k++) part(props, new THREE.SphereGeometry(0.16, 6, 4), toon(['#c8402f', '#ffb347', '#7fae63', '#c86aff'][(i + k) % 4]), x - 0.4 + k * 0.27, 0.72, z); box(x, z, 0.6, 0.45); }
    benches([[-4, 15, 0], [4, 15, 0]]); plant(0, 15);
  } else if (th === 'hydro') { // purple grow lights over the beds, a water channel and misting pipes
    for (let i = 0; i < 6; i++) { const z = -20 + i * 7; part(props, B(38, 0.08, 0.4), glow('#c86aff'), -2, 3.2, z); part(props, B(38, 0.12, 0.12), '#5d636c', -2, 3.35, z); }
    part(props, B(1.6, 0.06, D * 2 - 4), new THREE.MeshLambertMaterial({ color: '#2a6aa8', transparent: true, opacity: 0.7 }), -W + 3, 0.05, 0); part(props, B(0.2, 0.3, D * 2 - 4), '#5d636c', -W + 2.1, 0.15, 0);
    levelAnims.push(() => { if (Math.random() < 0.05) burst(V(-2 + (Math.random() - 0.5) * 36, 3.1, -20 + Math.floor(Math.random() * 6) * 7), '#cfe6ff', 1, 0.25); });
  } else if (th === 'arcade') { // a prize counter, couches and a neon border on the dance floor
    part(props, B(6, 1.1, 1.2), toon('#2c2f36'), -14, 0.55, 8); part(props, B(6.2, 0.08, 1.4), glow('#ff6aa8'), -14, 1.12, 8); box(-14, 8, 3, 0.6);
    for (let k = 0; k < 10; k++) part(props, new THREE.IcosahedronGeometry(0.18, 0), toon(['#ffd36a', '#4fd2ff', '#ff6aa8', '#6fdc5a'][k % 4]), -16.5 + k * 0.55, 1.35, 8);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: signTex('PRIZES', '#0c0d14', '#ff6aa8') })); sp.position.set(-14, 2.4, 7.3); props.add(sp);
    for (const [x, z] of [[12, 6], [12, 10]]) { part(props, B(3, 0.5, 1.1), toon('#7a2a6a'), x, 0.35, z); part(props, B(3, 0.8, 0.3), toon('#7a2a6a'), x, 0.8, z + 0.5); box(x, z, 1.5, 0.6); }
  } else if (th === 'engine') { // hazard stripes, steam vents, catwalk rails and barrels
    for (let i = 0; i < 14; i++) part(props, B(1.2, 0.02, 0.6), toon(i % 2 ? '#ffd36a' : '#1e1c22'), -21 + i * 3.2, 0.012, -10);
    for (let i = 0; i < 5; i++) { const x = -18 + i * 9; part(props, Cy(0.35, 0.35, 0.2, 8), '#3a3430', x, 0.1, 4); levelAnims.push(() => { if (Math.random() < 0.08) burst(V(x, 0.3, 4), '#d8d8e0', 1, 0.5); }); }
    for (let i = 0; i < 6; i++) { const x = 18 + (i % 3) * 1.1, z = -2 + Math.floor(i / 3) * 1.1; part(props, Cy(0.45, 0.45, 1.2, 10), toon(['#c8402f', '#ffd36a'][i % 2]), x, 0.6, z); } box(19.1, -1.45, 1.7, 1.2);
    part(props, B(W * 2 - 4, 0.08, 0.08), '#ffd36a', 0, 1.0, -17.5);
  } else if (th === 'aliens') { // bonfires, totems and hanging hides
    for (const [x, z] of [[-10, -4], [10, -4], [0, 4]]) { for (let k = 0; k < 6; k++) part(props, B(0.2, 0.2, 1.0), toon('#5a4030', 'wood'), x + Math.cos(k) * 0.4, 0.15, z + Math.sin(k) * 0.4, 0, k); part(props, new THREE.ConeGeometry(0.5, 1.0, 6), glow('#ff6a1a'), x, 0.6, z); solid(x, z, 0.8);
      const l = new THREE.PointLight(0xff6a1a, 0.8, 9, 1.8); l.position.set(x, 1.4, z); levelGroup.add(l); levelAnims.push(t => { l.intensity = 0.7 + Math.sin(t * 13 + x) * 0.15; }); }
    for (let i = 0; i < 4; i++) { const x = -18 + i * 12; part(props, Cy(0.3, 0.35, 3.2, 6), toon('#5a4030', 'wood'), x, 1.6, 18); part(props, B(0.8, 0.5, 0.5), toon('#c8402f'), x, 2.6, 18); part(props, B(0.12, 0.12, 0.05), glow('#ffd36a'), x - 0.18, 2.7, 18.26); part(props, B(0.12, 0.12, 0.05), glow('#ffd36a'), x + 0.18, 2.7, 18.26); solid(x, 18, 0.4); }
  } else if (th === 'archive') { // reading desks with green lamps and a carpet runner
    part(props, B(4, 0.02, D * 2 - 8), toon('#5a1e1e'), 0, 0.012, -2);
    for (const z of [-4, 0, 12]) for (const s of [-1, 1]) { const x = s * 5; part(props, B(2.4, 0.8, 1.2), toon('#5a4a3a', 'wood'), x, 0.4, z); part(props, Cy(0.03, 0.03, 0.4, 4), '#c9a43a', x + 0.7, 1.0, z); part(props, Cy(0.18, 0.12, 0.14, 8), glow('#6fdc5a'), x + 0.7, 1.25, z); box(x, z, 1.2, 0.6); }
  } else if (th === 'bridge') { // a raised captain's dais, railings and crew stations
    // a real window: drop the painted one and the solid wall, frame an opening, and put the actual stars, a planet and traffic outside
    for (const o of [...props.children]) { if (!o.isMesh) continue; const p = o.position; if (Math.abs(p.z + D) < 0.7 && p.y > 0.9 && Math.abs(p.x) < W * 0.9 && !(o.geometry && o.geometry.parameters && o.geometry.parameters.width > W * 1.9)) props.remove(o);
      else if (Math.abs(p.z + D) < 0.01 && o.geometry && o.geometry.parameters && o.geometry.parameters.width >= W * 2) props.remove(o); }
    levelGroup.children.filter(o => o.isMesh && o.geometry && o.geometry.type === 'SphereGeometry' && o.position.z < -D).forEach(o => levelGroup.remove(o));
    part(props, B(W * 2, 1.2, 0.6), '#4a4e56', 0, 0.6, -D); part(props, B(W * 2, 1.4, 0.6), '#4a4e56', 0, H - 0.7, -D);
    for (const s of [-1, 1]) part(props, B(W * 0.25, H, 0.6), '#4a4e56', s * W * 0.875, H / 2, -D);
    for (let i = 0; i <= 6; i++) part(props, B(0.25, H - 2.6, 0.3), '#9aa0a8', -W * 0.75 + i * W * 0.25, H / 2, -D); part(props, B(W * 1.5, 0.12, 0.2), glow('#4fd2ff'), 0, 1.25, -D + 0.3);
    const out = new THREE.Group(); levelGroup.add(out);
    const pl = new THREE.Mesh(new THREE.SphereGeometry(40, 28, 18), new THREE.MeshBasicMaterial({ map: planetTex('mezar'), fog: false })); pl.position.set(-60, 10, -D - 160); out.add(pl);
    const mo = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 10), new THREE.MeshBasicMaterial({ map: planetTex('moon'), fog: false })); mo.position.set(50, 25, -D - 110); out.add(mo);
    for (let i = 0; i < 50; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + (i % 5) * 0.6, 0), new THREE.MeshLambertMaterial({ color: '#6a6460', fog: false })); r.position.set(Math.sin(i * 7.1) * 70, Math.cos(i * 2.3) * 18, -D - 20 - (i % 10) * 9); out.add(r); }
    const sh = new THREE.Group(); part(sh, B(2, 0.6, 5), toon('#8a8f99'), 0, 0, 0); part(sh, B(5, 0.2, 1.5), toon('#5d636c'), 0, 0, 0.8); part(sh, B(0.6, 0.4, 0.3), glow('#ffb347'), 0, 0, 2.6); out.add(sh);
    levelAnims.push(t => { out.children.forEach((r, i) => { if (i > 1 && r !== sh) r.rotation.set(t * 0.1 + i, t * 0.07, 0); }); sh.position.set(((t * 8) % 200) - 100, 6 + Math.sin(t * 0.3) * 3, -D - 45); sh.rotation.y = -Math.PI / 2; });
    part(props, Cy(4, 4.2, 0.3, 20), toon('#3a3d44', 'panel'), 0, 0.15, -12); part(props, Cy(3.6, 3.6, 0.04, 20), toon('#3a4a7a'), 0, 0.32, -12);
    for (const s of [-1, 1]) { part(props, B(0.08, 1.0, 12), '#9aa0a8', s * 8, 0.5, -12); part(props, B(0.12, 0.08, 12), glow('#4fd2ff'), s * 8, 1.0, -12); }
    for (let i = 0; i < 4; i++) { const x = -15 + i * 10; part(props, B(1.6, 1.0, 0.8), '#2c2f36', x, 0.5, 2); part(props, B(1.4, 0.6, 0.05), glow(i % 2 ? '#4fd2ff' : '#6fdc5a'), x, 1.3, 1.65, -0.3); box(x, 2, 0.8, 0.4); }
  }
}
