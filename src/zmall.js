// =================== ZELTAC PLAZA MALL (2.22.17): the first floor becomes a little shopping mall ===================
// Glass-fronted shops line both long walls under neon signs, with shelves of goods, counters and awnings. Kiosks, benches
// and planters dress the concourse, a starlit skylight runs down the ceiling, and a directory greets you at the airlock.
{ const _zb = LEVELS.zeltac.build; LEVELS.zeltac.build = function () { _zb.apply(this, arguments); try { zMall(); } catch (e) { console.warn('mall', e); } }; }
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
  for (const z of [-20, -12, -4, 15]) unit(1, z, SHOPS[n++ % SHOPS.length], n);
  // concourse: inlaid walkway strips and a polished centre
  for (const x of [-7, 7]) { part(props, B(0.25, 0.03, 52), glow('#8fe3ff'), x, 0.02, 2); part(props, B(3.2, 0.02, 52), toon('#6a6f78', 'panel'), x - Math.sign(x) * 1.7, 0.01, 2); }
  // planters with little trees and benches around the hologram
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2, x = Math.cos(a) * 5.6, z = Math.sin(a) * 5.6;
    part(props, B(1.2, 0.6, 1.2), toon('#5d636c', 'panel'), x, 0.3, z); part(props, B(1.1, 0.1, 1.1), toon('#3a2a1a'), x, 0.62, z);
    part(props, Cy(0.07, 0.09, 1.0, 6), toon('#5a4030', 'wood'), x, 1.1, z); part(props, new THREE.IcosahedronGeometry(0.6, 0), toon('#4f8a3a', 'leaves'), x, 1.8, z); solid(x, z, 0.8);
    const b = Math.PI / 4 + i * Math.PI / 2 + Math.PI / 4, bx = Math.cos(b) * 8.5, bz = Math.sin(b) * 8.5;
    if (Math.hypot(bx - 0, bz - 6) > 2 && Math.hypot(bx + 5, bz - 12) > 2) { part(props, B(2.2, 0.12, 0.6), toon('#8a6a44', 'wood'), bx, 0.5, bz, 0, -b); part(props, B(2.2, 0.5, 0.1), toon('#8a6a44', 'wood'), bx + Math.cos(b) * 0.3, 0.8, bz + Math.sin(b) * 0.3, 0, -b); } }
  // kiosks out on the concourse
  const kiosk = (x, z, label, col) => { part(props, B(1.6, 1.0, 1.6), toon('#2c2f36'), x, 0.5, z); part(props, B(1.8, 0.08, 1.8), toon(col), x, 1.04, z);
    for (const [ox, oz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) part(props, Cy(0.04, 0.04, 1.6, 5), '#9aa0a8', x + ox, 1.85, z + oz);
    part(props, B(2.0, 0.12, 2.0), toon(col), x, 2.7, z); const sg = sign(label, '#0c0d14', col, 1.8, 0.4); sg.position.set(x, 2.95, z + 1.01); props.add(sg); solid(x, z, 1.1); };
  kiosk(-16, -16, 'JUICE', '#ffb347'); kiosk(16, -16, 'HOLO CASES', '#8fe3ff'); kiosk(-16, 22, 'SNACKS', '#ff6aa8'); kiosk(14, 22, 'MAPS', '#7fff6a');
  // a skylight of stars down the middle of the ceiling
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(10, 56), new THREE.MeshBasicMaterial({ color: '#0a0e2a' })); sky.rotation.x = Math.PI / 2; sky.position.set(0, 8.94, 0); props.add(sky);
  for (let i = 0; i < 70; i++) part(props, B(0.06, 0.02, 0.06), glow(i % 7 ? '#ffffff' : '#9fd8ff'), Math.sin(i * 12.9) * 4.6, 8.92, Math.cos(i * 7.7) * 27);
  for (const e of [-1, 1]) part(props, B(0.3, 0.2, 56), '#9aa0a8', e * 5.1, 8.85, 0);
  // hanging banners between the balconies
  for (const [z, c] of [[-18, '#ff6aa8'], [-6, '#8fe3ff'], [10, '#ffd36a'], [22, '#b86aff']]) for (const e of [-1, 1]) { part(props, B(0.06, 2.6, 1.4), toon(c), e * 11, 6.2, z); part(props, B(0.08, 0.08, 1.6), '#9aa0a8', e * 11, 7.55, z); }
  // the mall directory by the airlock
  part(props, B(0.3, 2.6, 1.6), '#2c2f36', -6, 1.3, 28); const dir = sign('ZELTAC MALL · SHOPS · MISSIONS · VAULT', '#0c0d14', '#8fe3ff', 2.4, 1.4); dir.rotation.y = Math.PI / 2; dir.position.set(-5.84, 1.7, 28); props.add(dir); solid(-6, 28, 0.9);
}
