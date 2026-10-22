// =================== ZELTAC PLAZA MALL (2.22.17): the first floor becomes a little shopping mall ===================
// Glass-fronted shops line both long walls under neon signs, with shelves of goods, counters and awnings. Kiosks, benches
// and planters dress the concourse, a starlit skylight runs down the ceiling, and a directory greets you at the airlock.
{ const _zb = LEVELS.zeltac.build; LEVELS.zeltac.build = function () { _zb.apply(this, arguments); try { zMallClear(); zMall(); zMallCivic(); } catch (e) { console.warn('mall', e); } }; }
function zMall() {
  const glass = new THREE.MeshLambertMaterial({ color: '#9fd8ff', transparent: true, opacity: 0.22, depthWrite: false });
  const sign = (txt, bg, fg, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) }));
  const SHOPS = [['NOVA THREADS', '#ff6aa8'], ['QUASAR BITES', '#ffb347'], ['ORBIT TECH', '#8fe3ff'], ['STARDUST BOOKS', '#c9a43a'], ['COMET CAFE', '#ff8a5a'],
    ['VOID TOYS', '#b86aff'], ['NEBULA NAILS', '#ff7ad8'], ['PULSE GAMES', '#7fff6a'], ['LUNA FLOWERS', '#9fffd0'], ['ASTRO SPORTS', '#4fa8ff']];
  // a shop unit flush to a side wall: s = -1 west wall, +1 east wall; it opens toward the middle
  const unit = (s, z, [name, col], n) => { const g = new THREE.Group(), d = 4.2, w = 7, x0 = s * 30;
    part(g, B(d, 0.12, w), toon('#e8e4dc', 'panel'), x0 - s * d / 2, 0.06, z); // shop floor
    for (const e of [-1, 1]) part(g, B(d, 5.2, 0.25), '#3a3d44', x0 - s * d / 2, 2.6, z + e * w / 2); // party walls
    part(g, B(0.3, 1.1, w + 0.3), '#2c2f36', x0 - s * d, 4.65, z); // fascia
    const sg = sign(name, '#0c0d14', col, 5.4, 0.85); sg.position.set(x0 - s * (d + 0.17), 4.65, z); sg.rotation.y = -s * Math.PI / 2; g.add(sg);
    part(g, B(0.08, 0.08, w), glow(col), x0 - s * (d + 0.2), 4.05, z); part(g, B(0.08, 0.08, w), glow(col), x0 - s * (d + 0.2), 5.25, z);
    // awning, glass shopfront with a doorway in the middle
    part(g, B(1.2, 0.08, w - 0.4), toon(col), x0 - s * (d + 0.55), 3.85, z, 0, 0, s * 0.25);
    for (const e of [-1, 1]) { const gl = new THREE.Mesh(B(0.06, 3.6, 2.4), glass); gl.position.set(x0 - s * d, 1.9, z + e * 2.3); g.add(gl); part(g, B(0.12, 3.7, 0.12), '#9aa0a8', x0 - s * d, 1.85, z + e * 1.1); }
    // inside: back shelves full of goods, a counter, a lit back wall
    part(g, B(0.1, 3.2, w - 0.8), glow(new THREE.Color(col).multiplyScalar(0.35).getStyle()), x0 - s * 0.2, 2.2, z);
    for (let k = 0; k < 3; k++) { part(g, B(0.6, 0.06, w - 1.2), toon('#6a4a30', 'wood'), x0 - s * 0.55, 0.8 + k * 0.9, z);
      for (let j = 0; j < 6; j++) part(g, B(0.3, 0.32 + ((j + k + n) % 3) * 0.12, 0.45), toon(['#c8402f', '#3a6a8a', '#c9a43a', '#7a4a8a', '#3a7a4a'][(j + k * 2 + n) % 5]), x0 - s * 0.55, 0.98 + k * 0.9, z - 2.6 + j * 1.05); }
    part(g, B(0.8, 1.0, 2.2), toon('#2c2f36'), x0 - s * 2.4, 0.5, z + 1.8); part(g, B(0.9, 0.06, 2.3), toon(col), x0 - s * 2.4, 1.03, z + 1.8);
    // a mannequin or display plinth by the window
    part(g, Cy(0.35, 0.4, 0.5, 10), '#e8e4dc', x0 - s * 3.3, 0.25, z - 1.9); part(g, new THREE.IcosahedronGeometry(0.32, 0), glow(col), x0 - s * 3.3, 0.85, z - 1.9);
    props.add(g); box(x0 - s * d / 2, z, d / 2, w / 2); };
  let n = 0; for (const z of [-20, -12, -4, 12, 20]) unit(-1, z, SHOPS[n++ % SHOPS.length], n);
  for (const z of [-20, -12, 20]) unit(1, z, SHOPS[n++ % SHOPS.length], n);
  // concourse: inlaid walkway strips and a polished centre
  for (const x of [-7, 7]) { part(props, B(0.25, 0.03, 52), glow('#8fe3ff'), x, 0.02, 2); part(props, B(3.2, 0.02, 52), toon('#6a6f78', 'panel'), x - Math.sign(x) * 1.7, 0.01, 2); }
  // planters with little trees and benches around the hologram
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2, x = Math.cos(a) * 5.6, z = Math.sin(a) * 5.6;
    part(props, B(1.2, 0.6, 1.2), toon('#5d636c', 'panel'), x, 0.3, z); part(props, B(1.1, 0.1, 1.1), toon('#3a2a1a'), x, 0.62, z);
    part(props, Cy(0.07, 0.09, 1.0, 6), toon('#5a4030', 'wood'), x, 1.1, z); part(props, new THREE.IcosahedronGeometry(0.6, 0), toon('#4f8a3a', 'leaves'), x, 1.8, z); solid(x, z, 0.8);
    const b = Math.PI / 4 + i * Math.PI / 2 + Math.PI / 4, bx = Math.cos(b) * 8.5, bz = Math.sin(b) * 8.5;
    if (Math.hypot(bx - 0, bz - 6) > 2 && Math.hypot(bx + 5, bz - 12) > 2) { const r = Math.PI / 2 - b; part(props, B(2.2, 0.12, 0.6), toon('#8a6a44', 'wood'), bx, 0.5, bz, 0, r); part(props, B(2.2, 0.5, 0.1), toon('#8a6a44', 'wood'), bx + Math.cos(b) * 0.3, 0.8, bz + Math.sin(b) * 0.3, 0, r);
      for (const e of [-0.9, 0.9]) part(props, B(0.12, 0.44, 0.5), '#5d636c', bx + Math.sin(b) * e, 0.22, bz - Math.cos(b) * e, 0, r); solid(bx, bz, 0.8); } }
  // kiosks out on the concourse
  const kiosk = (x, z, label, col) => { part(props, B(1.6, 1.0, 1.6), toon('#2c2f36'), x, 0.5, z); part(props, B(1.8, 0.08, 1.8), toon(col), x, 1.04, z);
    for (const [ox, oz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) part(props, Cy(0.04, 0.04, 1.6, 5), '#9aa0a8', x + ox, 1.85, z + oz);
    part(props, B(2.0, 0.12, 2.0), toon(col), x, 2.7, z); const sg = sign(label, '#0c0d14', col, 1.8, 0.4); sg.position.set(x, 2.95, z + 1.01); props.add(sg); solid(x, z, 1.1); };
  kiosk(-16, -16, 'JUICE', '#ffb347'); kiosk(16, -16, 'HOLO CASES', '#8fe3ff'); kiosk(-16, 22, 'SNACKS', '#ff6aa8'); kiosk(14, 22, 'MAPS', '#7fff6a');
  // a real skylight: the ceiling is cut open down the middle so you look straight out at the stars, a planet and passing traffic
  props.children.filter(o => o.isMesh && Math.abs(o.position.y - 9) < 0.01 && Math.abs(o.rotation.x - Math.PI) < 0.01).forEach(o => { o.visible = false; });
  for (const e of [-1, 1]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(25, 68), toon('#2c2f36', 'panel')); c.rotation.x = Math.PI / 2; c.position.set(e * 17.5, 9, 0); props.add(c); part(props, B(0.4, 0.5, 68), '#9aa0a8', e * 5.1, 8.8, 0); }
  for (let z = -30; z <= 30; z += 6) part(props, B(10.4, 0.25, 0.25), '#9aa0a8', 0, 8.9, z);
  const out = new THREE.Group(); levelGroup.add(out);
  const pl = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16), new THREE.MeshBasicMaterial({ map: planetTex('capitone'), fog: false })); pl.position.set(-40, 120, -90); out.add(pl);
  const mo = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 10), new THREE.MeshBasicMaterial({ map: planetTex('moon'), fog: false })); mo.position.set(30, 90, 40); out.add(mo);
  for (let i = 0; i < 40; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + (i % 5) * 0.5, 0), new THREE.MeshLambertMaterial({ color: '#6a6460', fog: false })); r.position.set(Math.sin(i * 7.1) * 60, 30 + (i % 9) * 8, Math.cos(i * 3.3) * 80); out.add(r); }
  const ship = new THREE.Group(); part(ship, B(2, 0.6, 5), toon('#8a8f99'), 0, 0, 0); part(ship, B(5, 0.2, 1.5), toon('#5d636c'), 0, 0, 0.8); part(ship, B(0.6, 0.4, 0.3), glow('#4fd2ff'), 0, 0, 2.6); out.add(ship);
  levelAnims.push(t => { out.rotation.y = t * 0.004; ship.position.set(Math.sin(t * 0.05) * 50, 22, ((t * 6) % 160) - 80); ship.rotation.y = Math.PI; });
  // the mall directory by the airlock
  part(props, B(0.3, 2.6, 1.6), '#2c2f36', -6, 1.3, 28); const dir = sign('ZELTAC MALL · SHOPS · MISSIONS · VAULT', '#0c0d14', '#8fe3ff', 2.4, 1.4); dir.rotation.y = Math.PI / 2; dir.position.set(-5.84, 1.7, 28); props.add(dir); solid(-6, 28, 0.9);
}

// the old plaza had plywood shop fronts, loose counters and a barricade of crates; clear them before the planned layout goes in
function zMallClear() {
  const near = (o, x, z) => Math.abs(o.position.x - x) < 0.2 && Math.abs(o.position.z - z) < 0.2;
  for (const o of [...props.children]) { if (o.isGroup && [[-9, -11.5], [9, -11.5], [-15, 4], [0, -17.5]].some(([x, z]) => near(o, x, z))) props.remove(o);
    else if (o.isMesh && o.position.z < -24.9 && o.position.z > -27 && Math.abs(o.position.x) < 20) props.remove(o); }
  for (let i = BOXES.length - 1; i >= 0; i--) { const [x, z] = BOXES[i]; if ([[-9, -11.5], [9, -11.5], [0, -17.5], [-15, 4], [-10.2, -26]].some(([a, b]) => Math.abs(x - a) < 0.1 && Math.abs(z - b) < 0.1)) BOXES.splice(i, 1); }
}
// the planned civic end of the mall: a proper bank, a mission center, the exchange, a clinic, and a sealed gate to the Alien Quarter
function zMallCivic() {
  const sign = (txt, bg, fg, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) })); m.position.set(x, y, z); m.rotation.y = ry || 0; props.add(m); return m; };
  const stone = toon('#d8d0c0', 'panel'), gold = toon('#c9a43a');
  // ZELTAC BANK: stone facade with columns and steps, a gold sign, a big round vault door and a teller counter behind glass
  part(props, B(14, 6.5, 0.6), stone, 0, 3.25, -19.5); box(0, -19.5, 7, 0.3);
  part(props, B(14.6, 0.6, 1.0), stone, 0, 6.6, -19.2); part(props, B(14.8, 0.15, 1.1), gold, 0, 6.95, -19.1);
  for (let i = 0; i < 6; i++) { const x = -6.25 + i * 2.5; part(props, Cy(0.35, 0.4, 6, 12), stone, x, 3, -18.6); part(props, B(0.9, 0.25, 0.9), stone, x, 0.12, -18.6); part(props, B(0.9, 0.25, 0.9), stone, x, 5.9, -18.6); solid(x, -18.6, 0.45); }
  for (let k = 0; k < 2; k++) part(props, B(14 - k, 0.2, 1.2 - k * 0.4), stone, 0, 0.1 + k * 0.2, -17.6 + k * 0.2);
  sign('ZELTAC BANK', '#1a1408', '#ffd36a', 6, 0.9, 0, 6.6, -18.68);
  const vd = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.3, 24), toon('#9aa0a8')); vd.rotation.x = Math.PI / 2; vd.position.set(0, 2.6, -19.1); props.add(vd);
  part(props, Cy(1.4, 1.4, 0.32, 24), toon('#7a8088'), 0, 2.6, -19.08, Math.PI / 2); for (let i = 0; i < 6; i++) part(props, B(0.12, 1.2, 0.1), gold, Math.cos(i) * 0.01, 2.6, -18.88, 0, 0, i * Math.PI / 3);
  part(props, Cy(0.3, 0.3, 0.2, 12), gold, 0, 2.6, -18.85, Math.PI / 2);
  part(props, B(7, 1.1, 0.8), toon('#5a4030', 'wood'), 0, 0.55, -12.8); part(props, B(7.2, 0.08, 1.0), toon('#2c2f36'), 0, 1.14, -12.8); box(0, -12.8, 3.5, 0.4);
  for (let i = 0; i < 4; i++) { const g = new THREE.Mesh(B(1.6, 1.0, 0.05), new THREE.MeshLambertMaterial({ color: '#9fd8ff', transparent: true, opacity: 0.25, depthWrite: false })); g.position.set(-2.55 + i * 1.7, 1.7, -12.8); props.add(g); part(props, B(0.06, 1.0, 0.06), gold, -3.4 + i * 1.7, 1.7, -12.8); }
  part(props, B(4.5, 0.02, 2.4), toon('#7a1e1e'), 0, 0.012, -10.8); for (const x of [-4, 4]) { part(props, Cy(0.05, 0.05, 1.0, 6), gold, x, 0.5, -11.4); } part(props, B(8, 0.04, 0.04), toon('#7a1e1e'), 0, 0.95, -11.4);
  // MISSION CENTER: a raised platform with a holographic job board, two consoles and a railing
  const mx = -10, mz = -10;
  part(props, Cy(3.6, 3.8, 0.06, 24), toon('#3a3d44', 'panel'), mx, 0.03, mz); part(props, Cy(3.5, 3.5, 0.02, 24), toon('#2a3a5a'), mx, 0.065, mz); part(props, B(0.3, 0.03, 7), glow('#4fd2ff'), mx + 3.55, 0.07, mz);
  part(props, B(5, 3, 0.2), '#2c2f36', mx, 1.8, mz - 3.2); const holo = sign('MISSION BOARD', '#06121a', '#7fe8ff', 4.6, 0.6, mx, 3.1, mz - 3.08);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.8), new THREE.MeshBasicMaterial({ color: '#4fd2ff', transparent: true, opacity: 0.35, depthWrite: false })); board.position.set(mx, 1.75, mz - 3.05); props.add(board);
  for (let i = 0; i < 6; i++) part(props, B(1.2, 0.18, 0.02), glow(i % 3 ? '#9fe8ff' : '#ffd36a'), mx - 1.4 + (i % 2) * 2.8, 2.35 - Math.floor(i / 2) * 0.5, mz - 3.0);
  for (const s of [-1, 1]) { part(props, B(1.2, 1.0, 0.7), '#2c2f36', mx + s * 2.4, 0.8, mz - 1.6, 0, -s * 0.5); part(props, B(1.0, 0.5, 0.05), glow('#4fd2ff'), mx + s * 2.4, 1.5, mz - 1.4, -0.4, -s * 0.5); solid(mx + s * 2.4, mz - 1.6, 0.6); }
  box(mx, mz - 3.2, 2.5, 0.2); const ml = new THREE.PointLight(0x4fd2ff, 0.7, 10, 1.6); ml.position.set(mx, 3, mz - 1); levelGroup.add(ml); levelAnims.push(t => { board.material.opacity = 0.3 + Math.sin(t * 2) * 0.06; });
  // THE EXCHANGE: a market stall for Ozzo, mirroring the mission center
  const ex = 10, ez = -10;
  part(props, B(6, 0.3, 4), toon('#3a3d44', 'panel'), ex, 0.15, ez - 1); part(props, B(5.6, 1.0, 0.8), toon('#5a4030', 'wood'), ex, 0.8, ez - 0.6); part(props, B(5.8, 0.08, 1.0), toon('#8a6fc4'), ex, 1.34, ez - 0.6); box(ex, ez - 0.6, 2.8, 0.4);
  for (const s of [-1, 1]) part(props, Cy(0.08, 0.08, 3.2, 6), '#9aa0a8', ex + s * 2.8, 1.9, ez - 2.6); part(props, B(6.2, 0.1, 2.4), toon('#8a6fc4'), ex, 3.5, ez - 1.8, 0.2);
  sign('ZELTAC EXCHANGE', '#0c0d14', '#c8a8ff', 4.6, 0.6, ex, 3.1, ez - 2.95);
  for (let i = 0; i < 8; i++) part(props, B(0.4, 0.35, 0.4), toon(['#c9a43a', '#4fa8ff', '#c8402f', '#6fdc5a'][i % 4]), ex - 2.2 + i * 0.6, 1.55, ez - 0.6);
  // CLINIC: a clean white front with a red cross for Dr. Tova
  part(props, B(0.4, 5, 7), toon('#e8e4dc', 'panel'), -16.5, 2.5, 4); box(-16.5, 4, 0.2, 3.5); part(props, B(0.1, 1.4, 0.4), glow('#ff3b2a'), -16.25, 3.6, 4); part(props, B(0.1, 0.4, 1.4), glow('#ff3b2a'), -16.25, 3.6, 4);
  sign('CLINIC', '#f2f2f2', '#c8402f', 2.6, 0.6, -16.25, 4.7, 4, Math.PI / 2); part(props, B(1.6, 0.9, 0.6), toon('#e8e4dc'), -15.4, 0.45, 2.2); box(-15.4, 2.2, 0.8, 0.3);
  // the Alien Quarter is through a sealed blast door now, not a pile of crates
  part(props, B(8, 6, 0.5), toon('#3a3d44', 'panel'), -12, 3, -33.5); for (let i = 0; i < 6; i++) part(props, B(1.1, 0.4, 0.06), toon(i % 2 ? '#ffd36a' : '#1e1c22'), -14.8 + i * 1.12, 0.6, -33.2);
  part(props, B(6, 4.6, 0.1), toon('#5d636c', 'panel'), -12, 2.6, -33.2); part(props, B(0.1, 4.6, 0.12), glow('#ff3b2a'), -12, 2.6, -33.14);
  sign('ALIEN QUARTER · FLOOR 8 · SEALED', '#3a0e0e', '#ff6a5a', 5.4, 0.7, -12, 5.4, -33.18);
}
