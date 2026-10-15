// =================== HANGAR (2.14.4): a working vehicle bay instead of an empty room ===================
// A turntable shows off your selected war vehicle, with a gantry crane overhead, a tool wall, tyre stacks, fuel drums and guide lights to the launch door.
function hangarDress(s, cx, cz, outer, props) {
  const sd = s.side, H = 3.2, wall = outer - sd * 0.2;
  // turntable with a glowing rim and your vehicle on it
  const tt = new THREE.Group(); tt.position.set(cx, 0.07, cz); props.add(tt);
  part(tt, Cy(1.75, 1.8, 0.1, 40), toonNS('#2a2c32', 'deck'), 0, 0.05, 0); const rim = part(tt, new THREE.TorusGeometry(1.78, 0.04, 6, 48), glow('#4fd2ff'), 0, 0.1, 0, Math.PI / 2);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; part(tt, B(0.5, 0.012, 0.08), glow('#ffd36a'), Math.cos(a) * 1.45, 0.105, Math.sin(a) * 1.45, 0, -a); }
  const V0 = typeof vehS === 'function' ? vehS() : null, vid = V0 && (V0.sel && V0.owned.includes(V0.sel) ? V0.sel : V0.owned[0]);
  const spin = new THREE.Group(); spin.position.y = 0.1; tt.add(spin);
  if (vid && typeof VEH !== 'undefined' && VEH[vid]) { try { const m = VEH[vid].make(); m.traverse(o => { if (o.isSprite || o.isPoints) o.visible = false; });
      const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3()), k = 2.9 / Math.max(sz.x, sz.z, 0.1), kk = Math.min(k, 2.4 / Math.max(sz.y, 0.1)); m.scale.multiplyScalar(kk); m.position.y = -b.min.y * kk; spin.add(m); } catch (e) { console.warn('hangar vehicle', e); } }
  else { const holo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signTex('BAY EMPTY', '#06202a', '#4fd2ff'), transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })); holo.position.y = 1.2; spin.add(holo); }
  levelAnims.push(t => { spin.rotation.y = t * 0.25; rim.material.opacity = 0.75 + Math.sin(t * 3) * 0.25; });
  solid(cx, cz, 1.6);
  // gantry crane across the ceiling with a hook over the pad
  for (const dz of [-2.3, 2.3]) part(props, B(9.6, 0.22, 0.22), toon('#c9a43a', 'hazard'), (s.x0 + s.x1) / 2, H - 0.2, cz + dz);
  const trolley = new THREE.Group(); props.add(trolley); part(trolley, B(0.6, 0.25, 5), '#3a3d44', 0, H - 0.42, cz); part(trolley, Cy(0.02, 0.02, 0.9, 4), '#1e1c22', 0, H - 1.0, cz); part(trolley, new THREE.TorusGeometry(0.12, 0.035, 6, 12, Math.PI * 1.4), '#8a8e96', 0, H - 1.5, cz);
  levelAnims.push(t => { trolley.position.x = cx + Math.sin(t * 0.18) * 1.8; });
  // tool wall: pegboard, tools, a rolling red tool chest
  const tw = wall - sd * 0.02; part(props, B(0.05, 1.4, 3.2), toonNS('#3a3d44', 'deck'), tw, 1.5, cz + 0.2);
  [['#8a8e96', 0.08, 0.5], ['#c9a43a', 0.06, 0.35], ['#8a8e96', 0.1, 0.25], ['#d23a2a', 0.07, 0.45], ['#8a8e96', 0.05, 0.6]].forEach(([c, w, h], i) => { part(props, B(0.05, h, w), c, tw - sd * 0.05, 1.6 + (i % 2) * 0.35, cz - 1.0 + i * 0.55); part(props, B(0.05, 0.04, w * 3), '#c9a43a', tw - sd * 0.05, 1.6 + (i % 2) * 0.35 + h / 2, cz - 1.0 + i * 0.55); });
  const chest = new THREE.Group(); part(chest, B(0.6, 0.9, 1.2), toon('#b8322a', 'hull'), 0, 0.5, 0); for (let i = 0; i < 4; i++) part(chest, B(0.02, 0.03, 1.0), '#cfd6e0', sd * -0.31, 0.25 + i * 0.18, 0); for (const z of [-0.5, 0.5]) part(chest, Cy(0.06, 0.06, 0.05, 8), C.dark, 0, 0.06, z, 0, 0, Math.PI / 2);
  chest.position.set(wall - sd * 0.45, 0, cz + 0.2); props.add(chest); box(wall - sd * 0.45, cz + 0.2, 0.35, 0.65);
  // tyre stacks and fuel drums in the corners
  for (const [z, n] of [[s.z0 + 0.9, 4], [s.z0 + 1.9, 3]]) { for (let i = 0; i < n; i++) part(props, new THREE.TorusGeometry(0.3, 0.13, 6, 14), '#1e1c22', wall - sd * 0.5, 0.13 + i * 0.25, z, Math.PI / 2); solid(wall - sd * 0.5, z, 0.45); }
  for (let i = 0; i < 3; i++) { const z = s.z1 - 0.8 - i * 0.75; part(props, Cy(0.3, 0.3, 0.9, 12), toon(i === 1 ? '#3a6a3a' : '#c8402f', 'hull'), wall - sd * 0.45, 0.45, z); part(props, Cy(0.31, 0.31, 0.06, 12), '#ffd36a', wall - sd * 0.45, 0.6, z); solid(wall - sd * 0.45, z, 0.35); }
  // fuel pump by the launch door
  { const pm = new THREE.Group(); part(pm, B(0.5, 1.3, 0.4), toon('#e8e4dc', 'hull'), 0, 0.65, 0); part(pm, B(0.4, 0.25, 0.02), glow('#6fdc5a'), 0, 1.05, 0.21); part(pm, Cy(0.03, 0.03, 0.8, 5), C.dark, 0.2, 0.5, 0.25, 0.4); pm.position.set(cx + sd * 2.6, 0, s.z1 - 0.7); pm.rotation.y = Math.PI; props.add(pm); solid(cx + sd * 2.6, s.z1 - 0.7, 0.35); }
  // guide lights from the pad to the launch door, and hanging work lights
  const dots = []; for (let i = 0; i < 4; i++) { dots.push(part(props, B(0.5, 0.02, 0.18), glow('#4fd2ff'), cx, 0.03, cz + 2.8 + i * 0.5)); }
  levelAnims.push(t => dots.forEach((d, i) => { d.material.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * 4 - i * 0.9)); d.material.transparent = true; }));
  for (const dz of [-3.3, 3.3]) { part(props, Cy(0.015, 0.015, 0.6, 4), '#1e1c22', cx - sd * 2.5, H - 0.3, cz + dz); part(props, Cy(0.18, 0.28, 0.2, 10, true), '#3a3d44', cx - sd * 2.5, H - 0.68, cz + dz); part(props, Cy(0.17, 0.17, 0.02, 10), glow('#fff2d0'), cx - sd * 2.5, H - 0.78, cz + dz); }
}
