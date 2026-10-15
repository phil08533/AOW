// =================== ROOM UPGRADES SHOW (2.14.5): every level you buy for a ship room adds things you can see ===================
// Lv 2 and Lv 3 each add a themed prop by the inner wall, Lv 4 hangs a banner and a second light, Lv 5 adds gold trim and a floor crest.
function rupProp(kind, sd) {
  const g = new THREE.Group(), wood = toon('#6a4a30', 'wood'), dark = '#2a2c32', metal = '#5d636c';
  const crate = (x, y, z, s, c) => part(g, B(s, s, s), toon(c || '#a07a4a', 'wood'), x, y + s / 2, z);
  const barrel = (x, z, c) => { part(g, Cy(0.28, 0.28, 0.8, 12), toon(c, 'hull'), x, 0.4, z); part(g, Cy(0.29, 0.29, 0.05, 12), '#ffd36a', x, 0.55, z); };
  switch (kind) {
    case 'shelf': part(g, B(0.4, 1.8, 1.2), wood, 0, 0.9, 0); for (let i = 0; i < 4; i++) { part(g, B(0.42, 0.04, 1.2), toon('#4a3020', 'wood'), 0, 0.3 + i * 0.45, 0); for (let k = 0; k < 6; k++) part(g, B(0.25, 0.3, 0.1), toon(['#8a2a2a', '#2a5a8a', '#3a6a3a', '#c9a43a'][(i + k) % 4]), 0.02, 0.48 + i * 0.45, -0.45 + k * 0.17); } break;
    case 'plant': part(g, Cy(0.28, 0.22, 0.5, 10), toon('#8a5a3a', 'wood'), 0, 0.25, 0); part(g, new THREE.IcosahedronGeometry(0.5, 0), toon('#4f8a3a', 'leaves'), 0, 0.95, 0); part(g, new THREE.IcosahedronGeometry(0.35, 0), toon('#6f9a3e', 'leaves'), 0.15, 1.35, 0.1); break;
    case 'gunCrate': crate(0, 0, 0, 0.8, '#4a5a3a'); part(g, B(0.82, 0.08, 0.82), '#ffd36a', 0, 0.62, 0); crate(0, 0.8, 0, 0.5, '#3a4a2e'); break;
    case 'armorStand': part(g, Cy(0.3, 0.35, 0.1, 10), dark, 0, 0.05, 0); part(g, Cy(0.04, 0.04, 1.0, 5), metal, 0, 0.6, 0); part(g, B(0.6, 0.7, 0.35), toon('#5a6a3a', 'hull'), 0, 1.3, 0); part(g, B(0.75, 0.15, 0.4), toon('#4a5a2e', 'hull'), 0, 1.65, 0); part(g, new THREE.SphereGeometry(0.2, 8, 6), toon('#4a5a2e', 'hull'), 0, 1.92, 0); part(g, B(0.3, 0.08, 0.05), glow('#4fd2ff'), 0, 1.94, sd * 0 + 0.18); break;
    case 'barrels': barrel(0, -0.35, '#c8402f'); barrel(0, 0.35, '#3a6a8a'); barrel(0.1, 0, '#c9a43a'); break;
    case 'pallet': part(g, B(1.0, 0.12, 1.2), toon('#a07a4a', 'wood'), 0, 0.06, 0); crate(0, 0.12, -0.25, 0.55); crate(0, 0.12, 0.3, 0.55, '#5d7f99'); crate(0, 0.67, 0, 0.5); break;
    case 'monitor': part(g, Cy(0.25, 0.3, 0.08, 10), dark, 0, 0.04, 0); part(g, Cy(0.03, 0.03, 1.2, 5), metal, 0, 0.65, 0); part(g, B(0.08, 0.5, 0.7), dark, 0, 1.4, 0); part(g, B(0.02, 0.4, 0.6), glow('#5dff9a'), 0.05, 1.4, 0); break;
    case 'bed': part(g, B(0.9, 0.5, 2.0), '#cfd6e0', 0, 0.25, 0); part(g, B(0.85, 0.12, 1.9), toon('#e8e4dc', 'cloth'), 0, 0.56, 0); part(g, B(0.8, 0.1, 0.4), toon('#ffffff', 'cloth'), 0, 0.66, -0.7); break;
    case 'cup': part(g, B(0.6, 0.9, 0.6), toon('#3a3d44', 'hull'), 0, 0.45, 0); part(g, Cy(0.18, 0.08, 0.3, 10), toon('#ffd36a'), 0, 1.15, 0); part(g, Cy(0.05, 0.05, 0.15, 6), toon('#ffd36a'), 0, 0.97, 0); part(g, Cy(0.12, 0.12, 0.04, 10), toon('#ffd36a'), 0, 0.92, 0); break;
    case 'crystal': part(g, B(0.6, 0.9, 0.6), toon('#3a3d44', 'hull'), 0, 0.45, 0); part(g, new THREE.OctahedronGeometry(0.25, 0), glow('#c86aff'), 0, 1.25, 0); break;
    case 'planter': part(g, B(0.7, 0.5, 1.6), toon('#6a4f34', 'wood'), 0, 0.25, 0); for (let i = 0; i < 3; i++) part(g, new THREE.IcosahedronGeometry(0.3, 0), toon(i % 2 ? '#6f9a3e' : '#4f8a3a', 'leaves'), 0, 0.7, -0.5 + i * 0.5); break;
    case 'tank': part(g, Cy(0.4, 0.4, 1.4, 12), toon('#5d7f99', 'hull'), 0, 0.7, 0); part(g, Cy(0.41, 0.41, 0.06, 12), glow('#4fd2ff'), 0, 1.0, 0); break;
    case 'engine': part(g, B(0.7, 0.3, 0.9), dark, 0, 0.15, 0); part(g, B(0.6, 0.6, 0.8), toon('#8a8e96', 'hull'), 0, 0.6, 0); for (let i = 0; i < 3; i++) part(g, Cy(0.06, 0.06, 0.25, 6), '#c9a43a', 0, 1.0, -0.25 + i * 0.25); break;
    case 'wheels': for (let i = 0; i < 3; i++) part(g, new THREE.TorusGeometry(0.32, 0.13, 6, 14), '#1e1c22', 0, 0.13 + i * 0.25, 0, Math.PI / 2); break;
    case 'ammo': crate(0, 0, 0, 0.7, '#4a5a3a'); part(g, B(0.72, 0.06, 0.4), '#c8402f', 0, 0.5, 0); crate(0, 0.7, 0, 0.45, '#3a4a2e'); break;
    case 'flask': part(g, B(0.5, 1.2, 1.2), toon('#3a3d44', 'hull'), 0, 0.6, 0); for (let i = 0; i < 4; i++) part(g, Cy(0.08, 0.1, 0.3, 8), glow(['#7fe0ff', '#9fff6a', '#ff6aa8', '#ffd36a'][i]), 0.05, 1.35, -0.45 + i * 0.3); break;
    case 'icechest': part(g, B(0.6, 0.55, 1.0), toon('#e8e4dc', 'hull'), 0, 0.28, 0); part(g, B(0.62, 0.1, 1.02), toon('#3a6a8a', 'hull'), 0, 0.6, 0); break;
    default: crate(0, 0, 0, 0.7); crate(0, 0.7, 0, 0.5, '#5d7f99');
  }
  return g;
}
const RUP_KINDS = { quarters: ['shelf', 'plant'], armory: ['gunCrate', 'armorStand'], cargo: ['pallet', 'barrels'], med: ['monitor', 'bed'], trophy: ['cup', 'crystal'], garden: ['planter', 'tank'], hangar: ['engine', 'wheels'], range: ['ammo', 'gunCrate'], lab: ['flask', 'barrels'], angler: ['icechest', 'plant'] };
const RUP_COL = { quarters: '#ffd8a0', armory: '#ff8a6a', cargo: '#ffd36a', med: '#5dff9a', trophy: '#ffd36a', garden: '#9fff6a', hangar: '#4fd2ff', range: '#ff6a3a', lab: '#c86aff', angler: '#4fd2ff' };
function roomUpDress(id, s, cx, cz, inner, props) {
  if (typeof roomLvl !== 'function' || !ROOMS[id] || ROOMS[id].fixed) return; const L = roomLvl(id); if (L < 2) return;
  const sd = s.side, H = 3.2, kinds = RUP_KINDS[id] || ['crates', 'crates'], col = RUP_COL[id] || '#ffd36a', x = inner + sd * 0.55;
  const put = (k, z) => { const p = rupProp(k, sd); p.position.set(x, 0, z); p.rotation.y = sd > 0 ? 0 : Math.PI; props.add(p); box(x, z, 0.45, 0.65); };
  put(kinds[0], cz + 2.4);
  if (L >= 3) put(kinds[1], cz + 3.9);
  if (L >= 4) { const bn = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: signTex('LEVEL ' + L, '#0f1757', col), side: THREE.DoubleSide })); bn.position.set(cx, H - 0.45, s.z1 - 0.2); bn.rotation.y = Math.PI; props.add(bn);
    const l2 = new THREE.PointLight(new THREE.Color(col), 0.35, 9, 1.6); l2.position.set(cx, H - 0.7, cz + 3); levelGroup.add(l2); part(props, B(0.6, 0.05, 0.6), glow(col), cx, H - 0.03, cz + 3); }
  if (L >= 5) { for (const z of [s.z0 + 0.06, s.z1 - 0.06]) part(props, B(9.6, 0.06, 0.04), toon('#ffd36a'), cx, 1.0, z);
    const mx = inner + sd * 1.5; part(props, new THREE.CylinderGeometry(0.9, 0.9, 0.04, 24), toon('#c9a43a'), mx, 0.02, cz); part(props, new THREE.CylinderGeometry(0.7, 0.7, 0.04, 24), toon(col), mx, 0.04, cz); } // a crest just inside the door
}
