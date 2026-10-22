// =================== CITY LIFE: every hub gets street furniture, market clutter, signs, lights, vehicles and a crowd ===================
const CITY = {
  earth: { zone: 'town', style: 'earth', n: 0, walkers: 18 }, // New Jamestown lays out its own street furniture (jamestown.js),
  mezar: { zone: 'hive', style: 'mezar', n: 34, walkers: 8 },
  capitone: { zone: 'tree', style: 'capitone', n: 34, walkers: 7 },
  robot: { zone: 'store', style: 'robot', n: 36, walkers: 9 },
  ocean: { zone: 'port', style: 'ocean', n: 30, walkers: 7 },
  moon: { zone: 'dome', style: 'moon', n: 30, walkers: 7 },
  fort: { zone: 'base', style: 'fort', n: 34, walkers: 8 },
  skycity: { zone: 'airbase', style: 'sky', n: 28, walkers: 7 },
  zarlich: { zone: 'rest', style: 'zarlich', n: 22, walkers: 5 },
  vector: { zone: 'lantern', style: 'vector', n: 18, walkers: 4 },
  speedway: { zone: 'pits', style: 'robot', n: 18, walkers: 6 },
  forestlife: { zone: 'grove', style: 'forest', n: 18, walkers: 4 },
  zeltac: { zone: 'plaza', style: 'zeltac', n: 30, walkers: 0 }
};
const CITY_KITS = {
  earth: ['stall', 'crates', 'barrel', 'lamp', 'bench', 'cart', 'plant', 'trash', 'newsbox', 'lanterns', 'flowerbox', 'hydrant'],
  mezar: ['stall', 'crates', 'honeypot', 'hivelamp', 'rug', 'cart', 'plant', 'lanterns', 'honeypot', 'awning'],
  capitone: ['campfire', 'crates', 'sled', 'icelamp', 'bench', 'woodpile', 'stall', 'lanterns', 'totem'],
  robot: ['hoload', 'vending', 'neonsign', 'crates', 'barrel', 'lamp', 'trash', 'cart', 'hoload', 'cables'],
  ocean: ['net', 'boat', 'buoy', 'crates', 'barrel', 'stall', 'lamp', 'fishrack', 'lanterns'],
  moon: ['rover', 'o2tank', 'crates', 'lamp', 'bench', 'plant', 'hoload', 'antenna'],
  fort: ['crates', 'barrel', 'sandbags', 'tent', 'jeep', 'lamp', 'ammo', 'flag'],
  sky: ['windsock', 'crates', 'toolcart', 'lamp', 'barrel', 'flag', 'bench', 'plant'],
  zarlich: ['specimen', 'crates', 'lamp', 'pod', 'hoload', 'plant'],
  vector: ['brazier', 'crates', 'totem', 'lanterns', 'rug'],
  forest: ['flowerbox', 'bench', 'lanterns', 'plant', 'woodpile'],
  zeltac: [] // the Zeltac Plaza is laid out by hand in zmall.js, so no random street clutter
};
const CITY_FOLK = {
  earth: () => makeCivilian(pickC(['#c8402f', '#3b4f7a', '#5a6a3a', '#8a6fc4', '#c9a43a', '#2a5a7a', '#e8e4dc']), pickC(['#2c2a28', '#3d3a36', '#5a4a3a']), pickC(['#e0b892', '#c58a64', '#8a5a3a', '#5a3a24']), pickC(['#1e1a18', '#5a3a22', '#c9a43a', '#cfcac0', '#c8402f'])),
  mezar: () => recolor(makeBugHybrid(), { '#5f8a3a': pickC(['#c9a46a', '#8a6a3a', '#a07a4a', '#7a8a3a']) }),
  capitone: () => makeCivilian(pickC(['#6a8aa8', '#e8e4dc', '#3a5a4a', '#8a3a2e']), '#3d3a36', pickC(['#e0b892', '#c58a64', '#9fe8ff']), '#e8e4dc', '#bfe6f2'),
  robot: () => recolor(makeXR17(), { '#9aa1aa': pickC(['#9aa1aa', '#c8402f', '#4fd2ff', '#c9a43a', '#5d636c']) }),
  ocean: () => makeCivilian(pickC(['#2a5a7a', '#e8e4dc', '#c8402f', '#ffd36a']), '#3d3a36', pickC(['#c58a64', '#8a5a3a', '#4fd2ff']), '#1e1a18', '#ffb347'),
  moon: () => makeCivilian(pickC(['#e8e4dc', '#c8c8d0', '#ff8a2a']), '#5d636c', pickC(['#e0b892', '#c58a64']), '#e8e4dc', '#4fd2ff'),
  fort: () => recolor(makeTrooper(), { '#6f7a3e': pickC(['#5a6a3a', '#3a4a2a', '#6f7a3e']) }),
  sky: () => makeCivilian('#3b4f7a', '#2c2a28', pickC(['#e0b892', '#8a5a3a']), '#1e1a18', '#e8eef2'),
  zarlich: () => makeCivilian('#e8e4dc', '#4a2a6a', pickC(['#e0b892', '#9fe8ff', '#c86aff']), '#5a3a7a', '#9fe8ff'),
  vector: () => makeCivilian('#1e1c22', '#1e1c22', pickC(['#d8d0e0', '#9aa1aa']), '#1e1c22', '#ffd36a'),
  forest: () => makeCivilian('#3f6a2f', '#5a4a32', pickC(['#c58a64', '#e0b892']), '#8a5a2a', '#9fff6a'),
  zeltac: () => makeCivilian('#8a3a2e', '#2c2a28', '#9fe8ff', '#1e1a18')
};
const CITY_RIG = { robot: 'xr17', fort: 'trooper', mezar: 'bughybrid' };
function pickC(a) { return a[Math.floor(Math.random() * a.length)]; }
function cityProp(kind, x, z, ry, st) {
  const g = new THREE.Group(); let solidR = 0;
  const wood = c => toon(c || '#8a6a44', 'wood');
  switch (kind) {
    case 'stall': { part(g, B(2.4, 0.9, 1.1), wood(), 0, 0.45, 0); for (const s of [-1, 1]) part(g, B(0.1, 2.2, 0.1), '#3a3d44', 1.1 * s, 1.1, 0.5); const cc = pickC(['#c8402f', '#3b4f7a', '#ffd36a', '#6fdc5a', '#c86aff']); part(g, B(2.8, 0.08, 1.6), toon(cc, 'cloth'), 0, 2.2, 0.2, 0.2); for (let k = 0; k < 5; k++) E(g, pickC(['#ff9a3c', '#c86aff', '#6fdc5a', '#ffd23a', '#c8402f']), -0.9 + k * 0.45, 1.0, 0, 0.16, 0.12, 0.16); solidR = 1.2; break; }
    case 'crates': for (let k = 0; k < 3; k++) part(g, B(0.7, 0.7, 0.7), wood(k % 2 ? '#9a7650' : '#8a6a44'), (k % 2) * 0.75 - 0.3, 0.35 + (k === 2 ? 0.7 : 0), (k === 1 ? 0.2 : 0), 0, k * 0.3, 0); solidR = 0.8; break;
    case 'barrel': part(g, Cy(0.3, 0.3, 0.85, 8), toon(pickC(['#b8562f', '#5d636c', '#3a5a3a'])), 0, 0.42, 0); part(g, Cy(0.31, 0.31, 0.05, 8), '#2b2a2c', 0, 0.6, 0); solidR = 0.35; break;
    case 'lamp': part(g, Cy(0.06, 0.08, 3.2, 6), '#2b2a2c', 0, 1.6, 0); part(g, B(0.6, 0.06, 0.06), '#2b2a2c', 0.3, 3.1, 0); part(g, B(0.3, 0.3, 0.3), glow(st === 'robot' || st === 'zeltac' ? '#4fd2ff' : '#ffe0a0'), 0.55, 2.9, 0); solidR = 0.15; break;
    case 'bench': part(g, B(1.6, 0.1, 0.45), wood(), 0, 0.48, 0); part(g, B(1.6, 0.45, 0.08), wood(), 0, 0.75, -0.2); for (const s of [-1, 1]) part(g, B(0.08, 0.48, 0.4), '#2b2a2c', 0.7 * s, 0.24, 0); solidR = 0.5; break;
    case 'cart': part(g, B(1.4, 0.6, 0.9), toon(pickC(['#c8402f', '#ffd36a', '#3b4f7a'])), 0, 0.75, 0); for (const s of [-1, 1]) part(g, Cy(0.3, 0.3, 0.08, 10), '#2b2a2c', 0.5 * s, 0.3, 0.48, Math.PI / 2); part(g, B(1.5, 0.06, 1.0), toon('#e8e4dc', 'cloth'), 0, 1.7, 0); for (const s of [-1, 1]) part(g, B(0.05, 0.7, 0.05), '#3a3d44', 0.65 * s, 1.35, 0.4); solidR = 0.8; break;
    case 'plant': part(g, Cy(0.35, 0.28, 0.5, 8), toon('#8a6a58', 'stone'), 0, 0.25, 0); E(g, toon(st === 'zarlich' ? '#7a4a9a' : '#4f8a3a', 'leaves'), 0, 0.85, 0, 0.45, 0.55, 0.45); solidR = 0.35; break;
    case 'trash': part(g, Cy(0.25, 0.22, 0.8, 8), '#3a4a3a', 0, 0.4, 0); part(g, Cy(0.27, 0.27, 0.06, 8), '#2b2a2c', 0, 0.82, 0); solidR = 0.3; break;
    case 'newsbox': part(g, B(0.5, 0.9, 0.45), toon('#3b4f7a'), 0, 0.45, 0); part(g, B(0.4, 0.3, 0.02), glow('#ffe0a0'), 0, 0.7, 0.24); solidR = 0.3; break;
    case 'hydrant': part(g, Cy(0.13, 0.15, 0.6, 8), '#c8402f', 0, 0.3, 0); part(g, Cy(0.05, 0.05, 0.4, 6), '#c8402f', 0, 0.4, 0, 0, 0, Math.PI / 2); break;
    case 'flowerbox': part(g, B(1.2, 0.35, 0.4), wood(), 0, 0.18, 0); for (let k = 0; k < 5; k++) part(g, new THREE.OctahedronGeometry(0.08, 0), pickC(['#e84a4a', '#ffd23a', '#ffffff', '#c86aff']), -0.45 + k * 0.22, 0.45, 0); break;
    case 'lanterns': { for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 3, 5), '#3a3430', 2 * s, 1.5, 0); chain(g, [[-2, 2.9, 0], [0, 2.4, 0], [2, 2.9, 0]], 0.012, '#2b2a2c', 0.012); for (let k = 0; k < 5; k++) { const t = k / 4, x = -2 + t * 4, y = 2.9 - Math.sin(t * Math.PI) * 0.5; part(g, B(0.2, 0.25, 0.2), glow(pickC(['#ff6a5a', '#ffd36a', '#6fdc5a', '#4fd2ff'])), x, y - 0.18, 0); } break; }
    case 'awning': part(g, B(3, 0.06, 2), toon(pickC(['#d8b888', '#c8402f', '#e8e4dc']), 'cloth'), 0, 2.3, 0, 0.12); for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 2.3, 5), '#5a3a22', 1.4 * s, 1.15, 0.9); break;
    case 'honeypot': for (let k = 0; k < 2; k++) { E(g, '#c9a46a', k * 0.6 - 0.3, 0.35, 0, 0.3, 0.35, 0.3); E(g, glow('#ffb347'), k * 0.6 - 0.3, 0.68, 0, 0.18, 0.05, 0.18); } solidR = 0.6; break;
    case 'hivelamp': part(g, Cy(0.05, 0.06, 2.6, 5), '#5a3a22', 0, 1.3, 0); E(g, glow('#ffb347'), 0, 2.7, 0, 0.3, 0.4, 0.3); for (let k = 0; k < 3; k++) part(g, B(0.62, 0.04, 0.04), '#5a3a22', 0, 2.5 + k * 0.2, 0); solidR = 0.15; break;
    case 'rug': part(g, B(2, 0.03, 1.4), toon(pickC(['#8a2a3a', '#3b4f7a', '#c9a43a']), 'cloth'), 0, 0.03, 0); part(g, B(1.6, 0.035, 1.0), toon(pickC(['#ffd36a', '#e8e4dc']), 'cloth'), 0, 0.035, 0); break;
    case 'campfire': for (let k = 0; k < 4; k++) part(g, Cy(0.07, 0.07, 0.9, 5), '#5a4532', 0, 0.1, 0, Math.PI / 2, k * 0.8, 0); { const f = part(g, new THREE.OctahedronGeometry(0.3, 0), glow('#ffb347'), 0, 0.4, 0); f.scale.y = 1.6; } for (let k = 0; k < 4; k++) part(g, B(0.8, 0.3, 0.3), wood('#6a4f34'), Math.cos(k * 1.57) * 1.2, 0.15, Math.sin(k * 1.57) * 1.2, 0, k * 1.57, 0); solidR = 0.6; break;
    case 'sled': part(g, B(0.9, 0.12, 2), wood(), 0, 0.3, 0); for (const s of [-1, 1]) part(g, B(0.06, 0.06, 2.2), '#9aa1aa', 0.4 * s, 0.1, 0.1); part(g, B(0.8, 0.5, 0.6), toon('#3b4f7a', 'cloth'), 0, 0.6, -0.4); break;
    case 'icelamp': part(g, Cy(0.08, 0.1, 2.4, 6), '#e8eef2', 0, 1.2, 0); part(g, new THREE.OctahedronGeometry(0.3, 0), glow('#9fe8ff'), 0, 2.6, 0); solidR = 0.15; break;
    case 'woodpile': for (let k = 0; k < 6; k++) part(g, Cy(0.12, 0.12, 1.2, 6), wood('#6a4a2e'), -0.3 + (k % 3) * 0.25, 0.12 + Math.floor(k / 3) * 0.22, 0, 0, 0, Math.PI / 2); solidR = 0.6; break;
    case 'totem': part(g, Cy(0.25, 0.3, 2.6, 6), wood(st === 'vector' ? '#2a1e30' : '#6a4a2e'), 0, 1.3, 0); for (let k = 0; k < 3; k++) E(g, st === 'vector' ? glow('#c86aff') : pickC(['#c8402f', '#ffd36a', '#3b4f7a']), 0, 0.7 + k * 0.7, 0.24, 0.12, 0.12, 0.06); solidR = 0.35; break;
    case 'hoload': { part(g, Cy(0.08, 0.1, 2.2, 6), '#3a3d44', 0, 1.1, 0); const ad = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.0), new THREE.MeshBasicMaterial({ map: signTex(pickC(['SPACE COLA', 'BUY ROBOTS', 'ZIP ZAP', 'NEW! JETPACKS', 'EAT AT MOE\'S', 'VOTE PIP-9', 'HOVER CUP!']), '#0f1757', pickC(['#4fd2ff', '#ff6aa8', '#ffd36a'])), transparent: true, opacity: 0.85 })); ad.position.y = 2.7; g.add(ad); const ad2 = ad.clone(); ad2.rotation.y = Math.PI; g.add(ad2); solidR = 0.15; break; }
    case 'vending': part(g, B(0.9, 1.9, 0.7), toon(pickC(['#c8402f', '#3b4f7a', '#6fdc5a'])), 0, 0.95, 0); part(g, B(0.6, 1.0, 0.02), glow('#e8eef2'), 0, 1.2, 0.36); solidR = 0.55; break;
    case 'neonsign': { const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), new THREE.MeshBasicMaterial({ map: signTex(pickC(['OPEN 25/8', 'BOLTS & NUTS', 'OIL BAR', 'CHIPS', 'NO HUMANS (JK)', 'REPAIRS']), '#1e0e1a', pickC(['#ff6aa8', '#4fd2ff', '#6fdc5a'])), side: THREE.DoubleSide })); sg.position.y = 2.6; g.add(sg); for (const s of [-1, 1]) part(g, Cy(0.04, 0.04, 2.6, 4), '#2b2a2c', 1.0 * s, 1.3, 0); break; }
    case 'cables': chain(g, [[-1.5, 0.02, 0], [0, 0.06, 0.3], [1.5, 0.02, 0]], 0.04, '#2b2a2c', 0.04); chain(g, [[-1.4, 0.02, 0.3], [0, 0.05, 0.6], [1.4, 0.02, 0.5]], 0.03, '#c8402f', 0.03); break;
    case 'net': part(g, B(2, 1.2, 0.02), new THREE.MeshLambertMaterial({ color: '#c8b880', wireframe: true }), 0, 0.9, 0); for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 1.6, 4), wood(), 1 * s, 0.8, 0); break;
    case 'boat': part(g, B(1.4, 0.5, 3.2), wood('#6a8aa8'), 0, 0.25, 0); part(g, new THREE.ConeGeometry(0.7, 1.2, 4), wood('#6a8aa8'), 0, 0.25, 2.1, Math.PI / 2, Math.PI / 4, 0); part(g, Cy(0.05, 0.05, 2.6, 4), wood(), 0, 1.5, 0); part(g, B(0.04, 1.6, 1.2), toon('#e8e4dc', 'cloth'), 0, 1.7, 0.5); solidR = 1.2; break;
    case 'buoy': part(g, Cy(0.3, 0.35, 0.6, 8), '#c8402f', 0, 0.3, 0); part(g, Cy(0.31, 0.31, 0.12, 8), '#e8e4dc', 0, 0.4, 0); part(g, Cy(0.03, 0.03, 0.6, 4), '#2b2a2c', 0, 0.9, 0); break;
    case 'fishrack': for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 1.8, 4), wood(), 1 * s, 0.9, 0); part(g, Cy(0.03, 0.03, 2.1, 4), wood(), 0, 1.7, 0, 0, 0, Math.PI / 2); for (let k = 0; k < 5; k++) { part(g, B(0.08, 0.4, 0.14), pickC(['#c8b880', '#ff9a3c', '#6a8aa8']), -0.8 + k * 0.4, 1.4, 0); } solidR = 0.4; break;
    case 'rover': part(g, B(1.6, 0.6, 2.4), '#e8e4dc', 0, 0.75, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, Cy(0.35, 0.35, 0.25, 10), '#3a3d44', 0.9 * sx, 0.35, 0.9 * sz, 0, 0, Math.PI / 2); part(g, Cy(0.03, 0.03, 1, 4), '#3a3d44', 0.5, 1.5, -0.8); part(g, new THREE.SphereGeometry(0.25, 8, 4, 0, 6.3, 0, 1.4), '#cfd3d8', 0.5, 2.0, -0.8); solidR = 1.2; break;
    case 'o2tank': for (let k = 0; k < 3; k++) { part(g, Cy(0.25, 0.25, 1.4, 8), k % 2 ? '#6fdc5a' : '#e8e4dc', k * 0.55 - 0.55, 0.7, 0); } solidR = 0.8; break;
    case 'antenna': part(g, Cy(0.05, 0.08, 3.4, 5), '#9aa1aa', 0, 1.7, 0); part(g, new THREE.SphereGeometry(0.6, 8, 4, 0, 6.3, 0, 1.2), '#cfd3d8', 0, 3.2, 0, Math.PI / 3); part(g, new THREE.SphereGeometry(0.06, 5, 4), glow('#ff3b2a'), 0, 3.5, 0); solidR = 0.2; break;
    case 'sandbags': for (let k = 0; k < 5; k++) E(g, toon('#a89a70', 'cloth'), -1 + (k % 3) * 0.7 + (k > 2 ? 0.35 : 0), 0.15 + (k > 2 ? 0.28 : 0), 0, 0.36, 0.15, 0.24); solidR = 0.9; break;
    case 'tent': part(g, new THREE.ConeGeometry(1.6, 2.2, 4), toon('#5a6a3a', 'cloth'), 0, 1.1, 0, 0, Math.PI / 4, 0); part(g, B(0.7, 1.2, 0.05), '#2b2a2c', 0, 0.6, 1.1); solidR = 1.3; break;
    case 'jeep': { const c = makeBattleCar('#5a6a3a'); c.scale.setScalar(0.6); g.add(c); solidR = 1.3; break; }
    case 'ammo': for (let k = 0; k < 2; k++) { part(g, B(0.9, 0.45, 0.5), toon('#5a6a3a'), 0, 0.22 + k * 0.45, 0); part(g, B(0.2, 0.1, 0.02), '#ffd36a', 0, 0.3 + k * 0.45, 0.26); } solidR = 0.5; break;
    case 'flag': part(g, Cy(0.05, 0.05, 4.5, 5), '#cfd3d8', 0, 2.25, 0); part(g, B(1.4, 0.8, 0.03), toon(st === 'fort' ? '#3a4a2a' : '#3b4f7a', 'cloth'), 0.7, 4.0, 0); solidR = 0.1; break;
    case 'windsock': part(g, Cy(0.05, 0.05, 4, 5), '#cfd3d8', 0, 2, 0); part(g, Cy(0.25, 0.1, 1.4, 8, 1, true), toon('#ff8a2a', 'cloth'), 0.7, 3.8, 0, 0, 0, Math.PI / 2); solidR = 0.1; break;
    case 'toolcart': part(g, B(1, 0.9, 0.6), '#c8402f', 0, 0.55, 0); for (let k = 0; k < 3; k++) part(g, B(0.9, 0.02, 0.5), '#2b2a2c', 0, 0.3 + k * 0.28, 0.06); for (const s of [-1, 1]) part(g, Cy(0.08, 0.08, 0.05, 8), '#2b2a2c', 0.4 * s, 0.08, 0.25, Math.PI / 2); solidR = 0.5; break;
    case 'specimen': { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.6, 10, 1, true), new THREE.MeshLambertMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); t.position.y = 1.0; g.add(t); part(g, Cy(0.5, 0.5, 0.2, 10), '#3a3d44', 0, 0.1, 0); part(g, Cy(0.5, 0.5, 0.15, 10), '#3a3d44', 0, 1.85, 0); E(g, glow(pickC(['#c86aff', '#6fdc5a', '#ff6aa8'])), 0, 1.0, 0, 0.2, 0.3, 0.2); solidR = 0.5; break; }
    case 'pod': E(g, '#e8d8ff', 0, 0.6, 0, 0.6, 0.6, 0.6); part(g, B(0.4, 0.06, 0.02), glow('#4fd2ff'), 0, 0.8, 0.58); solidR = 0.6; break;
    case 'brazier': part(g, Cy(0.35, 0.2, 0.9, 7), '#2a2430', 0, 0.45, 0); { const f = part(g, new THREE.OctahedronGeometry(0.28, 0), glow('#ffb347'), 0, 1.1, 0); f.scale.y = 1.5; } solidR = 0.4; break;
  }
  g.position.set(x, groundH(x, z), z); g.rotation.y = ry; props.add(g); if (solidR) solid(x, z, solidR);
}
function cityClear(x, z, pad, L, loose) {
  if (CIRCLES.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr + pad)) return false;
  if (BOXES.some(([bx, bz, hx, hz]) => Math.abs(x - bx) < hx + pad && Math.abs(z - bz) < hz + pad)) return false;
  const nb = L.npcBase || [0, 0]; if ((L.npcs || []).some(n => Math.hypot(x - (nb[0] + n.x), z - (nb[1] + n.z)) < 2.4)) return false;
  if (L.pad && Math.hypot(x - L.pad.x, z - L.pad.z) < 4.5) return false; if (L.spawn && Math.hypot(x - L.spawn.x, z - L.spawn.z) < 2.5) return false;
  if (INTERACTS.some(i => Math.hypot(x - i.x, z - i.z) < (i.r || 2) + 0.6)) return false;
  if (typeof propBlocked === 'function' && propBlocked(x, z, pad * 0.8, loose)) return false;
  return true;
}
function cityLife(L, id) {
  const C = CITY[id]; if (!C) return; const Zn = Z[C.zone]; if (!Zn) return;
  const kit = CITY_KITS[C.style], cx = Zn.x, cz = Zn.z, R = Zn.r * (id === 'zeltac' ? 1.1 : 0.92);
  let placed = kit.length ? 0 : C.n;
  for (let i = 0; i < C.n * 8 && placed < C.n; i++) {
    const a = Math.random() * 6.283, d = R * (0.28 + Math.random() * 0.7), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    const kind = kit[placed % kit.length], pad = ['stall', 'boat', 'rover', 'tent', 'jeep', 'cart', 'campfire'].includes(kind) ? 2.0 : 1.2;
    if (!cityClear(x, z, pad, L)) continue;
    if (L.terrain && Math.abs(groundH(x + 1, z) - groundH(x - 1, z)) + Math.abs(groundH(x, z + 1) - groundH(x, z - 1)) > 1.4) continue;
    cityProp(kind, x, z, Math.atan2(cx - x, cz - z) + (Math.random() - 0.5) * 0.6, C.style); placed++;
  }
  // a warm hub light so towns glow at night
  const lamp = new THREE.PointLight(C.style === 'robot' || C.style === 'zeltac' ? 0x4fd2ff : C.style === 'vector' ? 0xff9a3c : 0xffd8a0, 0.6, Zn.r * 2.2, 1.6); lamp.position.set(cx, (L.terrain ? groundH(cx, cz) : 0) + 6, cz); levelGroup.add(lamp);
  // the crowd: citizens wandering between clear spots, pausing to chat
  if (!C.walkers) return;
  const mk = CITY_FOLK[C.style] || CITY_FOLK.earth, rigN = CITY_RIG[C.style] || 'civ', folk = [];
  // walkable spots: a grid over the hub, keeping only clear ground (big hollow structures like domes don't count as blocked)
  const SP = []; for (let gx = -R; gx <= R; gx += 1.6) for (let gz = -R; gz <= R; gz += 1.6) { const d = Math.hypot(gx, gz); if (d > R * 0.92 || d < R * 0.12) continue; const x = cx + gx, z = cz + gz; if (!cityClear(x, z, 0.8, L, true)) continue; if (L.terrain && Math.abs(groundH(x + 0.8, z) - groundH(x - 0.8, z)) + Math.abs(groundH(x, z + 0.8) - groundH(x, z - 0.8)) > 0.9) continue; SP.push(V(x, 0, z)); }
  if (SP.length < 6) return;
  const spot = () => SP[Math.floor(Math.random() * SP.length)];
  const pathClear = (a, b) => { for (let k = 1; k < 8; k++) { const t = k / 8; if (!cityClear(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 0.45, L, true)) return false; } return true; };
  const used = []; const nW = Math.min(C.walkers, Math.floor(SP.length / 4));
  for (let i = 0; i < nW; i++) { const o = buildChar(mk, rigN); blob(o, 0.4); let p = spot(); for (let k = 0; k < 20 && used.some(u => u.distanceTo(p) < 2.5); k++) p = spot(); used.push(p); o.position.set(p.x, L.terrain ? groundH(p.x, p.z) : 0, p.z); o.rotation.y = Math.random() * 6.28; levelGroup.add(o); MOVERS.push([o, 0.4]); folk.push({ o, st: {}, tgt: null, wait: Math.random() * 3, sp: 0.9 + Math.random() * 0.5 }); }
  let last = 0;
  levelAnims.push(t => { const dt = Math.min(0.05, t - last || 0.016); last = t;
    for (const f of folk) { const o = f.o;
      if (f.wait > 0) { f.wait -= dt; animRig(o, f.st, dt, t); continue; }
      if (!f.tgt) { const cand = []; for (let k = 0; k < 12 && cand.length < 3; k++) { const s = spot(); const d = s.distanceTo(o.position); if (d > 1.5 && d < 14) cand.push(s); } for (const s of cand) if (pathClear(o.position, s)) { f.tgt = s; break; } if (!f.tgt) { f.wait = 0.8 + Math.random(); const near = SP.filter(s => { const d = Math.hypot(s.x - o.position.x, s.z - o.position.z); return d > 1 && d < 3.5; }); if (near.length) { f.tgt = near[Math.floor(Math.random() * near.length)]; f.wait = 0; } } if (!f.tgt) continue; }
      const dx = f.tgt.x - o.position.x, dz = f.tgt.z - o.position.z, d = Math.hypot(dx, dz);
      if (d < 0.4) { f.tgt = null; f.wait = 1.5 + Math.random() * 5; continue; }
      const step = Math.min(d, f.sp * dt); o.position.x += dx / d * step; o.position.z += dz / d * step; o.position.y = L.terrain ? groundH(o.position.x, o.position.z) : 0;
      const want = Math.atan2(dx, dz); o.rotation.y += Math.atan2(Math.sin(want - o.rotation.y), Math.cos(want - o.rotation.y)) * Math.min(1, dt * 6);
      animRig(o, f.st, dt, t); } });
}
{ const _dl = detailLevel; detailLevel = function (L, id) { _dl(L, id); try { cityLife(L, id); } catch (e) { console.warn('city', e); } }; }
