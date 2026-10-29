// =================== ENVIRONMENT DETAIL PASS: every world gets ground clutter, ambient life and air particles ===================
// Biome kits: what grows / lies around on each world. Decorations are small and walk-through unless marked solid.
const BIOME = {
  earth: { n: 260, kit: ['flower', 'flower', 'bush', 'pebbles', 'mushroom', 'log', 'rock'], flowers: ['#e84a4a', '#ffd23a', '#ffffff', '#c86aff'], motes: '#fff6c0', birds: true },
  forestlife: { n: 320, kit: ['flower', 'mushroom', 'glowshroom', 'bush', 'fern', 'log', 'flower'], flowers: ['#ff6aa8', '#ffd23a', '#9fe8ff', '#ffffff'], motes: '#9fff6a', birds: true },
  mezar: { n: 220, kit: ['cactus', 'dryshrub', 'pebbles', 'bones', 'rock', 'dryshrub'], flowers: ['#ff9a3c'], motes: '#e0b070' },
  capitone: { n: 240, kit: ['icecrystal', 'snowrock', 'pine', 'fern', 'pebbles', 'icecrystal'], flowers: ['#9fe8ff'], motes: '#ffffff' },
  robot: { n: 200, kit: ['scrap', 'cable', 'barrel', 'scrap', 'tire', 'pebbles'], flowers: ['#ff3b2a'], motes: '#ff9a3c' },
  moon: { n: 200, kit: ['pebbles', 'rock', 'crystalsm', 'pebbles', 'boulder'], flowers: ['#9fe8ff'], motes: null },
  speedway: { n: 260, kit: ['rock', 'tumble', 'pebbles', 'cactus', 'boulder', 'dryshrub'], flowers: ['#ff9a3c'], motes: '#e0a070' },
  ocean: { n: 160, kit: ['shell', 'pebbles', 'coral', 'shell', 'driftwood'], flowers: ['#ff6aa8', '#ffd23a'], motes: '#cfe6ff', birds: true },
  fort: { n: 200, kit: ['crate', 'scrap', 'barrel', 'pebbles', 'rock', 'sandbag'], flowers: ['#ff8a2a'], motes: '#cfc0a0' },
  skycity: { n: 220, kit: ['flower', 'bush', 'flower', 'pebbles', 'mushroom'], flowers: ['#ffffff', '#ffd23a', '#9fe8ff', '#ff6aa8'], motes: '#ffffff', birds: true },
  zarlich: { n: 280, kit: ['glowshroom', 'alienpod', 'tendril', 'glowshroom', 'pebbles', 'crystalsm'], flowers: ['#c86aff', '#ff6aa8', '#4fffe0'], motes: '#c86aff' },
  vector: { n: 220, kit: ['spike', 'bones', 'eyeplant', 'pebbles', 'spike', 'deadtree'], flowers: ['#ff2a3a'], motes: '#ff3b2a' },
  arena: { n: 120, kit: ['pebbles', 'bones', 'rock', 'dryshrub'], flowers: ['#ff9a3c'], motes: '#e0b070' },
  swift: { n: 60, kit: ['pebbles', 'bones'], flowers: ['#ff9a3c'], motes: '#ffe0a0' }
};
const ICE_MAT = new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.8 }), TUMBLE_MAT = new THREE.MeshLambertMaterial({ color: '#8a6a44', wireframe: true });
function detailProp(kind, x, z, s, F, rnd) {
  const y = groundH(x, z), g = new THREE.Group(), pal = LEVEL.palette || {};
  const col = (i) => F[i % F.length];
  switch (kind) {
    case 'flower': for (let k = 0; k < 3; k++) { const ox = (rnd() - 0.5) * 0.5, oz = (rnd() - 0.5) * 0.5; part(g, Cy(0.012, 0.012, 0.35, 3), '#3f7a2f', ox, 0.17, oz); part(g, new THREE.OctahedronGeometry(0.07, 0), col(k + Math.floor(x)), ox, 0.38, oz); } break;
    case 'bush': E(g, toon(pal.grass || '#4f8a3a', 'leaves'), 0, 0.35 * s, 0, 0.55 * s, 0.4 * s, 0.55 * s); E(g, toon(pal.patch || pal.grass || '#5aa04a', 'leaves'), 0.3 * s, 0.3 * s, 0.1, 0.35 * s, 0.3 * s, 0.35 * s); break;
    case 'pebbles': for (let k = 0; k < 4; k++) part(g, new THREE.DodecahedronGeometry(0.08 + rnd() * 0.08, 0), toon(k % 2 ? (pal.rockA || '#8a7a68') : (pal.rockB || '#6a5a48'), 'stone'), (rnd() - 0.5) * 0.9, 0.04, (rnd() - 0.5) * 0.9); break;
    case 'rock': part(g, new THREE.DodecahedronGeometry(0.45 * s, 0), toon(pal.rockA || '#8a7a68', 'stone'), 0, 0.25 * s, 0, rnd(), rnd(), rnd()); break;
    case 'boulder': part(g, new THREE.DodecahedronGeometry(1.1 * s, 0), toon(pal.rockB || '#6a5a48', 'stone'), 0, 0.6 * s, 0, rnd(), rnd(), rnd()); g.userData.solid = 1.0 * s; break;
    case 'mushroom': for (let k = 0; k < 3; k++) { const ox = (rnd() - 0.5) * 0.6, oz = (rnd() - 0.5) * 0.6, h = 0.15 + rnd() * 0.2; part(g, Cy(0.03, 0.04, h, 5), '#e8e4dc', ox, h / 2, oz); E(g, k % 2 ? '#c8402f' : '#c9a46a', ox, h, oz, 0.12, 0.06, 0.12); } break;
    case 'glowshroom': for (let k = 0; k < 4; k++) { const ox = (rnd() - 0.5) * 0.8, oz = (rnd() - 0.5) * 0.8, h = 0.2 + rnd() * 0.5; part(g, Cy(0.03, 0.05, h, 5), '#d8d0e0', ox, h / 2, oz); E(g, glow(col(k)), ox, h, oz, 0.14, 0.07, 0.14); } break;
    case 'log': part(g, Cy(0.22 * s, 0.25 * s, 2.2 * s, 7), toon('#5a3a22', 'wood'), 0, 0.22 * s, 0, 0, rnd() * 3, Math.PI / 2); g.userData.solid = 0.6; break;
    case 'fern': for (let k = 0; k < 5; k++) part(g, B(0.08, 0.02, 0.6 * s), toon('#3f7a2f', 'leaves'), 0, 0.2, 0, 0.5, k * 1.25, 0); break;
    case 'cactus': part(g, Cy(0.16 * s, 0.2 * s, 1.6 * s, 7), toon('#5a8a3a', 'leaves'), 0, 0.8 * s, 0); part(g, Cy(0.09 * s, 0.1 * s, 0.6 * s, 6), toon('#5a8a3a', 'leaves'), 0.28 * s, 1.0 * s, 0, 0, 0, -0.6); part(g, Cy(0.09 * s, 0.1 * s, 0.5 * s, 6), toon('#5a8a3a', 'leaves'), -0.25 * s, 0.75 * s, 0, 0, 0, 0.7); g.userData.solid = 0.25; break;
    case 'dryshrub': for (let k = 0; k < 6; k++) part(g, Cy(0.01, 0.015, 0.6, 3), '#8a6a44', 0, 0.25, 0, 0.6 * Math.cos(k), k, 0.6 * Math.sin(k)); break;
    case 'bones': // a skeleton on its back: spine along x, skull at the front, ribs arching up across the spine
      part(g, Cy(0.05, 0.05, 0.7, 5), '#efe7d6', -0.1, 0.05, 0, 0, 0, Math.PI / 2); E(g, '#efe7d6', 0.4, 0.12, 0, 0.16, 0.14, 0.18); for (let k = 0; k < 3; k++) part(g, new THREE.TorusGeometry(0.22 - k * 0.03, 0.03, 4, 8, Math.PI), '#efe7d6', 0.08 - k * 0.15, 0.05, 0, 0, Math.PI / 2, 0); g.rotation.y = rnd() * 6.28; break;
    case 'icecrystal': for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.2 + rnd() * 0.3, 0), ICE_MAT); c.scale.y = 2; c.position.set((rnd() - 0.5) * 0.6, 0.35, (rnd() - 0.5) * 0.6); c.rotation.z = (rnd() - 0.5) * 0.6; g.add(c); } break;
    case 'snowrock': part(g, new THREE.DodecahedronGeometry(0.5 * s, 0), toon('#8a9aa8', 'stone'), 0, 0.3 * s, 0); E(g, '#f4f8ff', 0, 0.62 * s, 0, 0.42 * s, 0.14 * s, 0.42 * s); break;
    case 'pine': part(g, Cy(0.1, 0.14, 0.9 * s, 5), toon('#5a3a22', 'wood'), 0, 0.45 * s, 0); for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry((0.8 - k * 0.2) * s, 0.9 * s, 7), toon(k % 2 ? '#2f5a3a' : '#3a6a4a', 'leaves'), 0, (1.1 + k * 0.55) * s, 0); E(g, '#f4f8ff', 0, 2.4 * s, 0, 0.2 * s, 0.12 * s, 0.2 * s); g.userData.solid = 0.3; break;
    case 'scrap': for (let k = 0; k < 3; k++) part(g, B(0.3 + rnd() * 0.4, 0.1 + rnd() * 0.2, 0.3 + rnd() * 0.3), k % 2 ? '#7a7f87' : '#8a5a3c', (rnd() - 0.5) * 0.8, 0.08 + k * 0.08, (rnd() - 0.5) * 0.8, rnd(), rnd() * 3, rnd()); break;
    case 'cable': chain(g, [[-0.8, 0.02, 0], [0, 0.08, 0.4 * (rnd() - 0.5)], [0.8, 0.02, 0.3]], 0.03, '#2b2a2c', 0.03); break;
    case 'barrel': part(g, Cy(0.3, 0.3, 0.8, 8), toon(['#b8562f', '#5d636c', '#3a5a3a'][Math.floor(rnd() * 3)]), 0, 0.4, 0); part(g, Cy(0.31, 0.31, 0.05, 8), '#2b2a2c', 0, 0.55, 0); g.userData.solid = 0.35; break;
    case 'tire': part(g, new THREE.TorusGeometry(0.32, 0.12, 5, 10), '#2b2a2c', 0, 0.12, 0, Math.PI / 2); break;
    case 'crystalsm': for (let k = 0; k < 3; k++) { const c = part(g, new THREE.OctahedronGeometry(0.12 + rnd() * 0.15, 0), glow(col(k)), (rnd() - 0.5) * 0.5, 0.2, (rnd() - 0.5) * 0.5); c.scale.y = 2; } break;
    case 'tumble': { const t = part(g, new THREE.IcosahedronGeometry(0.4, 0), TUMBLE_MAT, 0, 0.4, 0); break; }
    case 'shell': for (let k = 0; k < 2; k++) { const sh = part(g, new THREE.ConeGeometry(0.08, 0.2, 6), k ? '#ffd8c8' : '#f4e8d8', (rnd() - 0.5) * 0.4, 0.05, (rnd() - 0.5) * 0.4, Math.PI / 2, rnd() * 3, 0); } break;
    case 'coral': for (let k = 0; k < 4; k++) part(g, Cy(0.03, 0.05, 0.4 + rnd() * 0.4, 5), col(k), (rnd() - 0.5) * 0.4, 0.25, (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.6, 0, (rnd() - 0.5) * 0.6); break;
    case 'driftwood': part(g, Cy(0.08, 0.12, 1.4, 5), toon('#a89070', 'wood'), 0, 0.08, 0, 0, rnd() * 3, Math.PI / 2); break;
    case 'crate': part(g, B(0.8, 0.8, 0.8), toon('#8a6a44', 'wood'), 0, 0.4, 0, 0, rnd(), 0); g.userData.solid = 0.5; break;
    case 'sandbag': for (let k = 0; k < 3; k++) E(g, toon('#a89a70', 'cloth'), -0.5 + k * 0.5, 0.15, 0, 0.28, 0.14, 0.2); break;
    case 'alienpod': E(g, toon('#5a3a7a', 'leaves'), 0, 0.4 * s, 0, 0.35 * s, 0.5 * s, 0.35 * s); E(g, glow(col(1)), 0, 0.85 * s, 0, 0.12 * s, 0.12 * s, 0.12 * s); break;
    case 'tendril': for (let k = 0; k < 3; k++) { const a = k * 2.1; chain(g, [[Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1], [Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3], [Math.cos(a) * 0.15, 1.0, Math.sin(a) * 0.15]], 0.04, '#7a4a9a', 0.01); E(g, glow(col(k)), Math.cos(a) * 0.15, 1.02, Math.sin(a) * 0.15, 0.05, 0.05, 0.05); } break;
    case 'spike': for (let k = 0; k < 3; k++) part(g, new THREE.ConeGeometry(0.1 + rnd() * 0.08, 0.8 + rnd() * 0.8, 4), '#140e18', (rnd() - 0.5) * 0.6, 0.5, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.4, 0, (rnd() - 0.5) * 0.4); break;
    case 'eyeplant': part(g, Cy(0.02, 0.03, 0.6, 4), '#2a1a30', 0, 0.3, 0); E(g, '#efe7d6', 0, 0.65, 0, 0.1, 0.1, 0.1); E(g, glow('#ff2a3a'), 0, 0.65, 0.07, 0.05, 0.05, 0.04); break;
    case 'deadtree': part(g, Cy(0.08, 0.14, 2.2 * s, 5), '#1a141e', 0, 1.1 * s, 0, 0.1, 0, 0.1); for (let k = 0; k < 3; k++) part(g, Cy(0.03, 0.05, 0.9, 4), '#1a141e', 0, (1.2 + k * 0.4) * s, 0, 0, k * 2.1, 0.9); g.userData.solid = 0.2; break;
  }
  g.position.set(x, y, z); g.rotation.y = rnd() * 6.28; props.add(g); if (g.userData.solid) solid(x, z, g.userData.solid);
}
let PROP_BLOCK = [];
// footprints of everything a level already built, so clutter and crowds never spawn inside it
function scanPropBlocks() {
  PROP_BLOCK = []; const bx = new THREE.Box3(), sz = new THREE.Vector3();
  for (const c of props.children) { bx.setFromObject(c); if (bx.isEmpty()) continue; bx.getSize(sz); if (sz.y < 0.35 || sz.x > 60 || sz.z > 60 || (sz.x < 1.2 && sz.z < 1.2)) continue; PROP_BLOCK.push([bx.min.x, bx.min.z, bx.max.x, bx.max.z, sz.x > 14 && sz.z > 14]); }
}
const propBlocked = (x, z, pad, loose) => PROP_BLOCK.some(b => !(loose && b[4]) && x > b[0] - pad && x < b[2] + pad && z > b[1] - pad && z < b[3] + pad);
function detailLevel(L, id) {
  try { scanPropBlocks(); } catch (_) { PROP_BLOCK = []; }
  const K = BIOME[id];
  // indoor decks: floating dust in the air only
  if (!L.terrain || !K) { if (L.indoor || id === 'ship') addMotes('#cfe6ff', 60, 30, 8); return; }
  let seed = (id.length * 7919) % 233280; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let placed = 0;
  for (let i = 0; i < K.n * 3 && placed < K.n; i++) {
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * (WORLD_R - 6), x = WORLD_C.x + Math.cos(a) * d, z = WORLD_C.z + Math.sin(a) * d;
    if (roadDist(x, z) < 2.2 || groundH(x, z) < WATER_Y + 0.15) continue;
    if (id === 'earth' && typeof JT_R !== 'undefined' && Math.hypot(x - TOWN.x, z - TOWN.z) < JT_R + 1) continue; // New Jamestown is paved: no bushes or rocks in its streets
    if (CIRCLES.some(([cx, cz, cr]) => Math.abs(x - cx) < cr + 1.2 && Math.abs(z - cz) < cr + 1.2)) continue;
    if (BOXES.some(([bx, bz, hx, hz]) => Math.abs(x - bx) < hx + 1 && Math.abs(z - bz) < hz + 1)) continue;
    if (propBlocked(x, z, 0.8)) continue;
    const slope = Math.abs(groundH(x + 1, z) - groundH(x - 1, z)) + Math.abs(groundH(x, z + 1) - groundH(x, z - 1)); if (slope > 2.2) continue;
    let kind = K.kit[Math.floor(rnd() * K.kit.length)];
    if (id === 'fort' && typeof irInFort === 'function' && irInFort(x, z, 3)) continue; // nothing scattered inside the fortress
    if (inSafe({ x, z }) && !['flower', 'bush', 'pebbles', 'fern', 'shell', 'crystalsm', 'glowshroom'].includes(kind)) continue; // keep towns walkable
    detailProp(kind, x, z, 0.8 + rnd() * 0.6, K.flowers, rnd); placed++;
  }
  if (K.motes) addMotes(K.motes, id === 'vector' || id === 'zarlich' ? 260 : 160, Math.min(WORLD_R, 70), 10);
  if (K.birds) addBirds(5);
}
function addMotes(col, n, R, H) {
  const pos = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * R; base.push([Math.cos(a) * d, Math.random() * H, Math.sin(a) * d, Math.random() * 6]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false })); m.frustumCulled = false; levelGroup.add(m);
  levelAnims.push(t => { const c = camera.position; for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = c.x + b[0] + Math.sin(t * 0.3 + b[3]) * 1.5; pos[i * 3 + 1] = c.y - 2 + ((b[1] + t * 0.25 + b[3]) % H); pos[i * 3 + 2] = c.z + b[2] + Math.cos(t * 0.25 + b[3]) * 1.5; } g.attributes.position.needsUpdate = true; });
}
function addBirds(n) {
  const flock = new THREE.Group(); levelGroup.add(flock); const birds = [];
  for (let i = 0; i < n; i++) { const b = new THREE.Group(); for (const s of [-1, 1]) { const w = part(b, B(0.6, 0.03, 0.18), '#2b2a2c', 0.3 * s, 0, 0); w.userData.s = s; } flock.add(b); birds.push(b); }
  levelAnims.push(t => birds.forEach((b, i) => { const a = t * 0.18 + i * 0.5; b.position.set(WORLD_C.x + Math.cos(a) * (30 + i * 4), 22 + Math.sin(t * 0.7 + i) * 2, WORLD_C.z + Math.sin(a) * (30 + i * 4)); b.rotation.y = -a; b.children.forEach(w => { w.rotation.z = Math.sin(t * 8 + i) * 0.5 * w.userData.s; }); }));
}
