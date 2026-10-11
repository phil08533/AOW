// =================== SHIP DECORATING: building is gone; you furnish your ship's rooms instead ===================
// Every piece is bought once (lots are free) and then placed as many times as you like.
const FURN_CATS = ['Living', 'Bedroom', 'Kitchen', 'Fun', 'Decor', 'Tech', 'Build'];
const FURN = {
  // [name, category, price, [w,h,d], layer, solid]
  sofa: ['Sofa', 'Living', 0, [1.9, 0.9, 0.9], 1, 1], armchair: ['Armchair', 'Living', 0, [0.9, 0.9, 0.9], 1, 1], coffeetable: ['Coffee table', 'Living', 0, [1.2, 0.45, 0.7], 1, 1],
  beanbag: ['Beanbag', 'Living', 150, [0.9, 0.6, 0.9], 1, 0], holotv: ['Holo-TV', 'Living', 400, [1.6, 1.6, 0.3], 1, 1], bookshelf: ['Bookshelf', 'Living', 250, [1.4, 2.0, 0.5], 1, 1],
  floorlamp: ['Floor lamp', 'Living', 0, [0.4, 1.8, 0.4], 1, 1], rug: ['Rug', 'Living', 0, [1.9, 0.04, 1.4], 0, 0], fancyrug: ['Fancy rug', 'Living', 200, [1.9, 0.04, 1.9], 0, 0], fireplace: ['Fireplace', 'Living', 1200, [1.8, 1.6, 0.7], 1, 1],
  bed: ['Bed', 'Bedroom', 0, [1.2, 0.7, 2.0], 1, 1], bunkbed: ['Bunk bed', 'Bedroom', 300, [1.1, 2.0, 2.0], 1, 1], nightstand: ['Nightstand', 'Bedroom', 100, [0.5, 0.6, 0.5], 1, 1], dresser: ['Dresser', 'Bedroom', 200, [1.3, 1.1, 0.5], 1, 1], hammock: ['Hammock', 'Bedroom', 600, [1.9, 1.4, 0.8], 1, 1], petbed: ['Pet bed', 'Bedroom', 200, [0.9, 0.3, 0.9], 1, 0],
  counter: ['Kitchen counter', 'Kitchen', 150, [1.9, 0.95, 0.7], 1, 1], fridge: ['Fridge', 'Kitchen', 250, [0.8, 1.9, 0.7], 1, 1], stove: ['Stove', 'Kitchen', 300, [0.8, 0.95, 0.7], 1, 1], dinertable: ['Dining table', 'Kitchen', 200, [1.6, 0.8, 1.0], 1, 1], stool: ['Bar stool', 'Kitchen', 50, [0.4, 0.8, 0.4], 1, 0], coffee: ['Coffee machine', 'Kitchen', 150, [0.5, 1.2, 0.5], 1, 1],
  arcade: ['Arcade cabinet', 'Fun', 800, [0.8, 1.8, 0.8], 1, 1], jukebox: ['Jukebox', 'Fun', 1000, [0.9, 1.6, 0.6], 1, 1], pooltable: ['Pool table', 'Fun', 1500, [1.9, 0.9, 1.1], 1, 1], dartboard: ['Dartboard', 'Fun', 200, [0.6, 1.8, 0.3], 1, 1], punchbag: ['Punching bag', 'Fun', 300, [0.6, 2.0, 0.6], 1, 1], weights: ['Weight bench', 'Fun', 300, [1.6, 1.0, 0.6], 1, 1],
  guitar: ['Guitar stand', 'Fun', 400, [0.5, 1.2, 0.5], 1, 1], telescope: ['Telescope', 'Fun', 900, [0.8, 1.6, 0.8], 1, 1], aquarium: ['Aquarium', 'Fun', 1500, [1.6, 1.4, 0.6], 1, 1], disco: ['Disco ball', 'Fun', 700, [0.6, 2.4, 0.6], 1, 0],
  plant: ['Potted plant', 'Decor', 0, [0.6, 1.1, 0.6], 1, 1], bonsai: ['Bonsai', 'Decor', 200, [0.5, 0.7, 0.5], 1, 1], cactus: ['Cactus pot', 'Decor', 100, [0.5, 1.0, 0.5], 1, 1], lavalamp: ['Lava lamp', 'Decor', 150, [0.3, 0.7, 0.3], 1, 1], statue: ['Trooper statue', 'Decor', 2000, [0.9, 2.4, 0.9], 1, 1],
  trophy: ['Trophy stand', 'Decor', 500, [0.8, 1.6, 0.8], 1, 1], poster: ['Poster', 'Decor', 50, [1.0, 1.8, 0.1], 1, 0], neon: ['Neon sign', 'Decor', 400, [1.6, 1.8, 0.1], 1, 0], banner: ['Banner', 'Decor', 0, [0.8, 3, 0.2], 1, 1], painting: ['Painting', 'Decor', 300, [1.2, 1.9, 0.1], 1, 0], candles: ['Candles', 'Decor', 80, [0.4, 0.4, 0.4], 1, 0], clock: ['Wall clock', 'Decor', 120, [0.6, 2.0, 0.1], 1, 0],
  computer: ['Computer desk', 'Tech', 600, [1.4, 1.4, 0.7], 1, 1], holotable: ['Holo-map table', 'Tech', 2500, [1.4, 1.3, 1.4], 1, 1], gunrack: ['Weapon rack', 'Tech', 800, [1.4, 1.8, 0.4], 1, 1], saberstand: ['Saber display', 'Tech', 1200, [0.8, 1.5, 0.5], 1, 1], crate: ['Crate', 'Tech', 0, [0.9, 0.9, 0.9], 1, 1], robobuddy: ['Robo-buddy', 'Tech', 1000, [0.6, 1.0, 0.6], 1, 1],
  floor: ['Floor tile', 'Build', 0, [2, 0.24, 2], 0, 0], wall: ['Wall', 'Build', 0, [2, 2.4, 0.3], 1, 1], divider: ['Glass divider', 'Build', 100, [2, 2.0, 0.15], 1, 1], pillar: ['Pillar', 'Build', 150, [0.5, 2.6, 0.5], 1, 1], railing: ['Railing', 'Build', 80, [2, 1.0, 0.1], 1, 1], lamp: ['Ceiling lamp', 'Build', 0, [0.4, 2.6, 0.4], 1, 1]
};
// rewrite the piece table (base.js keeps the placement/grid logic)
for (const k of Object.keys(PIECES)) delete PIECES[k];
for (const [id, f] of Object.entries(FURN)) PIECES[id] = { name: f[0], cost: {}, price: f[2], cat: f[1], layer: f[4], dim: f[3], solid: f[5] };
const furnOwned = id => FURN[id] && (FURN[id][2] === 0 || !!(S.furn && S.furn[id]));
const _pieceModelOld = pieceModel;
pieceModel = function (type, col) {
  if (type === 'floor' || type === 'wall' || type === 'lamp' || type === 'crate' || type === 'banner') return _pieceModelOld(type, col);
  const g = new THREE.Group(), w = (c) => toon(c || '#8a6a44', 'wood'), cl = (c) => toon(c, 'cloth'), acc = col || '#3b4f7a';
  switch (type) {
    case 'sofa': part(g, B(1.9, 0.4, 0.9), cl(acc), 0, 0.3, 0); part(g, B(1.9, 0.6, 0.25), cl(acc), 0, 0.7, -0.33); for (const s of [-1, 1]) part(g, B(0.22, 0.55, 0.9), cl(acc), 0.84 * s, 0.5, 0); for (const s of [-1, 1]) part(g, B(0.8, 0.12, 0.6), cl('#e8e4dc'), 0.42 * s, 0.55, 0.05); break;
    case 'armchair': part(g, B(0.9, 0.4, 0.9), cl('#8a3a2e'), 0, 0.3, 0); part(g, B(0.9, 0.6, 0.22), cl('#8a3a2e'), 0, 0.75, -0.34); for (const s of [-1, 1]) part(g, B(0.18, 0.5, 0.9), cl('#8a3a2e'), 0.36 * s, 0.5, 0); break;
    case 'coffeetable': part(g, B(1.2, 0.08, 0.7), w('#5a3a22'), 0, 0.42, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, B(0.06, 0.4, 0.06), w('#5a3a22'), 0.52 * sx, 0.2, 0.3 * sz); part(g, Cy(0.08, 0.06, 0.12, 8), '#e8e4dc', 0.3, 0.52, 0); break;
    case 'beanbag': E(g, cl(acc), 0, 0.3, 0, 0.45, 0.3, 0.45); break;
    case 'holotv': part(g, B(1.6, 0.9, 0.06), '#1e1c22', 0, 1.2, 0); part(g, B(1.5, 0.8, 0.02), glow('#4fd2ff'), 0, 1.2, 0.04); part(g, B(0.1, 0.7, 0.1), '#3a3d44', 0, 0.4, 0); part(g, B(0.6, 0.06, 0.3), '#3a3d44', 0, 0.05, 0); break;
    case 'bookshelf': part(g, B(1.4, 2.0, 0.5), w('#6a4a2e'), 0, 1.0, 0); for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) part(g, B(0.12, 0.34, 0.3), toon(['#c8402f', '#3b4f7a', '#5a6a3a', '#c9a43a', '#8a6fc4'][(r + k) % 5]), -0.55 + k * 0.18, 0.28 + r * 0.46, 0.08); break;
    case 'floorlamp': part(g, Cy(0.18, 0.2, 0.06, 8), '#2b2a2c', 0, 0.03, 0); part(g, Cy(0.03, 0.03, 1.5, 5), '#2b2a2c', 0, 0.8, 0); part(g, Cy(0.15, 0.25, 0.3, 8), glow('#ffe0a0'), 0, 1.65, 0); break;
    case 'rug': part(g, B(1.9, 0.03, 1.4), cl('#8a2a3a'), 0, 0.02, 0); part(g, B(1.5, 0.035, 1.0), cl('#c9a43a'), 0, 0.025, 0); break;
    case 'fancyrug': part(g, Cy(0.95, 0.95, 0.03, 20), cl('#3b4f7a'), 0, 0.02, 0); part(g, Cy(0.7, 0.7, 0.035, 20), cl('#e8e4dc'), 0, 0.025, 0); part(g, Cy(0.4, 0.4, 0.04, 20), cl('#c8402f'), 0, 0.03, 0); break;
    case 'fireplace': part(g, B(1.8, 1.6, 0.7), toon('#8a7a68', 'stone'), 0, 0.8, 0); part(g, B(1.0, 0.7, 0.2), '#1e1c22', 0, 0.45, 0.28); { const f = part(g, new THREE.OctahedronGeometry(0.22, 0), glow('#ffb347'), 0, 0.35, 0.3); f.scale.y = 1.6; } part(g, B(2.0, 0.12, 0.8), w('#5a3a22'), 0, 1.62, 0); break;
    case 'bed': part(g, B(1.2, 0.35, 2.0), w('#6a4a2e'), 0, 0.2, 0); part(g, B(1.1, 0.18, 1.9), cl('#e8e4dc'), 0, 0.45, 0); part(g, B(1.1, 0.1, 1.2), cl(acc), 0, 0.56, 0.35); part(g, B(0.8, 0.14, 0.35), cl('#ffffff'), 0, 0.6, -0.72); part(g, B(1.2, 0.9, 0.12), w('#6a4a2e'), 0, 0.6, -0.98); break;
    case 'bunkbed': for (const y of [0.35, 1.45]) { part(g, B(1.1, 0.15, 1.9), cl('#e8e4dc'), 0, y + 0.1, 0); part(g, B(1.0, 0.08, 1.1), cl(acc), 0, y + 0.2, 0.3); } for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, B(0.08, 2.0, 0.08), '#5d636c', 0.52 * sx, 1.0, 0.92 * sz); break;
    case 'nightstand': part(g, B(0.5, 0.55, 0.5), w(), 0, 0.28, 0); part(g, Cy(0.08, 0.1, 0.25, 8), glow('#ffe0a0'), 0, 0.68, 0); break;
    case 'dresser': part(g, B(1.3, 1.1, 0.5), w('#8a5a3a'), 0, 0.55, 0); for (let r = 0; r < 3; r++) part(g, B(1.2, 0.02, 0.02), '#2b2a2c', 0, 0.3 + r * 0.32, 0.26); break;
    case 'hammock': for (const s of [-1, 1]) part(g, Cy(0.05, 0.05, 1.4, 5), w(), 0.9 * s, 0.7, 0); { const h = part(g, new THREE.CylinderGeometry(0.5, 0.5, 1.7, 10, 1, true, Math.PI, Math.PI), new THREE.MeshLambertMaterial({ color: '#c9a46a', side: THREE.DoubleSide }), 0, 0.95, 0, 0, 0, Math.PI / 2); } break;
    case 'petbed': part(g, Cy(0.45, 0.4, 0.2, 12), cl('#c8402f'), 0, 0.1, 0); part(g, Cy(0.35, 0.35, 0.12, 12), cl('#e8e4dc'), 0, 0.16, 0); break;
    case 'counter': part(g, B(1.9, 0.9, 0.7), '#e8e4dc', 0, 0.45, 0); part(g, B(1.95, 0.06, 0.75), '#3a3d44', 0, 0.93, 0); part(g, B(0.5, 0.06, 0.4), '#9aa1aa', -0.4, 0.97, 0); break;
    case 'fridge': part(g, B(0.8, 1.9, 0.7), '#e8eef2', 0, 0.95, 0); part(g, B(0.04, 0.5, 0.04), '#9aa1aa', 0.3, 1.3, 0.37); part(g, B(0.04, 0.3, 0.04), '#9aa1aa', 0.3, 0.6, 0.37); part(g, B(0.8, 0.02, 0.71), '#9aa1aa', 0, 1.0, 0); break;
    case 'stove': part(g, B(0.8, 0.9, 0.7), '#5d636c', 0, 0.45, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, Cy(0.12, 0.12, 0.02, 10), glow('#ff6a3a'), 0.2 * sx, 0.92, 0.17 * sz); part(g, B(0.6, 0.35, 0.02), '#1e1c22', 0, 0.45, 0.36); break;
    case 'dinertable': part(g, B(1.6, 0.08, 1.0), w('#8a5a3a'), 0, 0.76, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, B(0.08, 0.74, 0.08), w('#5a3a22'), 0.7 * sx, 0.37, 0.4 * sz); part(g, Cy(0.15, 0.1, 0.12, 8), '#e8e4dc', 0, 0.86, 0); break;
    case 'stool': part(g, Cy(0.2, 0.2, 0.08, 10), cl('#c8402f'), 0, 0.78, 0); part(g, Cy(0.04, 0.04, 0.74, 5), '#2b2a2c', 0, 0.38, 0); part(g, Cy(0.18, 0.18, 0.04, 8), '#2b2a2c', 0, 0.02, 0); break;
    case 'coffee': part(g, B(0.5, 0.7, 0.45), '#3a3d44', 0, 0.85, 0); part(g, B(0.5, 0.5, 0.45), w(), 0, 0.25, 0); part(g, Cy(0.06, 0.05, 0.1, 8), '#e8e4dc', 0, 0.62, 0.12); part(g, B(0.15, 0.08, 0.02), glow('#6fdc5a'), 0.1, 1.05, 0.23); break;
    case 'arcade': part(g, B(0.8, 1.8, 0.8), '#1e1c22', 0, 0.9, 0); part(g, B(0.65, 0.5, 0.04), glow(['#ff6aa8', '#4fd2ff', '#6fdc5a'][Math.floor(Math.random() * 3)]), 0, 1.35, 0.41, -0.15); part(g, B(0.7, 0.12, 0.35), '#3a3d44', 0, 0.95, 0.45, -0.4); part(g, B(0.82, 0.25, 0.82), glow('#ffd36a'), 0, 1.75, 0); break;
    case 'jukebox': part(g, B(0.9, 1.3, 0.6), '#8a2a3a', 0, 0.65, 0); part(g, Cy(0.45, 0.45, 0.6, 14, 1, false, 0, Math.PI), '#8a2a3a', 0, 1.3, 0, Math.PI / 2, 0, Math.PI / 2); part(g, B(0.6, 0.5, 0.04), glow('#ffd36a'), 0, 0.95, 0.31); for (let k = 0; k < 3; k++) part(g, B(0.7 - k * 0.1, 0.04, 0.04), glow(['#ff6aa8', '#4fd2ff', '#6fdc5a'][k]), 0, 1.35 + k * 0.1, 0.31); break;
    case 'pooltable': part(g, B(1.9, 0.15, 1.1), w('#5a3a22'), 0, 0.8, 0); part(g, B(1.7, 0.04, 0.9), cl('#2f7a3a'), 0, 0.88, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, B(0.12, 0.75, 0.12), w('#5a3a22'), 0.8 * sx, 0.37, 0.45 * sz); for (let k = 0; k < 6; k++) part(g, new THREE.SphereGeometry(0.05, 6, 4), ['#ffffff', '#c8402f', '#ffd36a', '#3b4f7a', '#1e1c22', '#6fdc5a'][k], -0.4 + (k % 3) * 0.12, 0.95, -0.1 + Math.floor(k / 3) * 0.12); break;
    case 'dartboard': part(g, B(0.08, 1.8, 0.08), '#3a3d44', 0, 0.9, -0.1); part(g, Cy(0.28, 0.28, 0.05, 16), '#1e1c22', 0, 1.6, 0, Math.PI / 2); part(g, Cy(0.18, 0.18, 0.06, 16), '#c8402f', 0, 1.6, 0.005, Math.PI / 2); part(g, Cy(0.05, 0.05, 0.07, 10), '#6fdc5a', 0, 1.6, 0.01, Math.PI / 2); break;
    case 'punchbag': part(g, Cy(0.03, 0.03, 0.6, 4), '#2b2a2c', 0, 1.8, 0); part(g, Cy(0.25, 0.25, 1.1, 10), cl('#8a2a2a'), 0, 1.0, 0); part(g, Cy(0.3, 0.3, 0.06, 10), '#2b2a2c', 0, 0.03, 0); break;
    case 'weights': part(g, B(1.2, 0.12, 0.35), cl('#2b2a2c'), 0, 0.5, 0); for (const s of [-1, 1]) part(g, B(0.08, 0.45, 0.3), '#5d636c', 0.5 * s, 0.22, 0); part(g, Cy(0.02, 0.02, 1.6, 5), '#9aa1aa', 0, 1.0, -0.2, 0, 0, Math.PI / 2); for (const s of [-1, 1]) part(g, Cy(0.18, 0.18, 0.08, 10), '#2b2a2c', 0.65 * s, 1.0, -0.2, 0, 0, Math.PI / 2); break;
    case 'guitar': part(g, B(0.06, 0.9, 0.06), '#2b2a2c', 0, 0.45, -0.1); E(g, w('#c9733a'), 0, 0.45, 0.05, 0.22, 0.28, 0.06); part(g, B(0.06, 0.6, 0.04), w('#3a2a1e'), 0, 0.95, 0.05); break;
    case 'telescope': for (let k = 0; k < 3; k++) part(g, Cy(0.02, 0.02, 1.0, 4), '#2b2a2c', Math.cos(k * 2.1) * 0.25, 0.48, Math.sin(k * 2.1) * 0.25, Math.sin(k * 2.1) * 0.25, 0, -Math.cos(k * 2.1) * 0.25); part(g, Cy(0.09, 0.12, 1.1, 10), '#e8e4dc', 0, 1.15, 0.2, -0.8); break;
    case 'aquarium': { part(g, B(1.6, 0.5, 0.6), w('#3a2a1e'), 0, 0.25, 0); const tank = new THREE.Mesh(B(1.5, 0.8, 0.5), new THREE.MeshLambertMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.45, depthWrite: false })); tank.position.y = 0.92; g.add(tank); for (let k = 0; k < 5; k++) part(g, B(0.14, 0.07, 0.03), ['#ff9a3c', '#ffd23a', '#ff6aa8'][k % 3], -0.5 + k * 0.25, 0.75 + (k % 3) * 0.15, 0); part(g, B(0.3, 0.2, 0.3), toon('#6fdc5a', 'leaves'), 0.55, 0.65, 0); break; }
    case 'disco': part(g, Cy(0.02, 0.02, 1.0, 4), '#2b2a2c', 0, 1.9, 0); part(g, new THREE.IcosahedronGeometry(0.3, 1), glow('#e8e4dc'), 0, 1.35, 0); break;
    case 'plant': part(g, Cy(0.25, 0.2, 0.4, 8), toon('#c9733a', 'stone'), 0, 0.2, 0); E(g, toon('#4f8a3a', 'leaves'), 0, 0.75, 0, 0.35, 0.4, 0.35); break;
    case 'bonsai': part(g, B(0.45, 0.15, 0.3), '#3a3d44', 0, 0.08, 0); part(g, Cy(0.03, 0.05, 0.35, 5), w('#5a3a22'), 0, 0.3, 0, 0, 0, 0.3); E(g, toon('#4f8a3a', 'leaves'), 0.08, 0.5, 0, 0.22, 0.12, 0.18); break;
    case 'cactus': part(g, Cy(0.18, 0.15, 0.3, 8), toon('#c9733a', 'stone'), 0, 0.15, 0); part(g, Cy(0.1, 0.12, 0.6, 7), toon('#5a8a3a', 'leaves'), 0, 0.6, 0); part(g, Cy(0.05, 0.06, 0.25, 6), toon('#5a8a3a', 'leaves'), 0.13, 0.65, 0, 0, 0, -0.7); break;
    case 'lavalamp': part(g, Cy(0.1, 0.13, 0.15, 8), '#2b2a2c', 0, 0.08, 0); part(g, Cy(0.08, 0.1, 0.4, 8), glow('#ff6aa8'), 0, 0.35, 0); E(g, glow('#ffd36a'), 0, 0.4, 0, 0.05, 0.08, 0.05); break;
    case 'statue': { part(g, B(0.9, 0.5, 0.9), toon('#9a9088', 'stone'), 0, 0.25, 0); const t = makeTrooper(); recolor(t, { '#6f7a3e': '#c9c0b0', '#4a5229': '#a89a88', '#c9b27c': '#d8d0c0' }); t.position.y = 0.5; g.add(t); break; }
    case 'trophy': part(g, B(0.8, 1.0, 0.8), w('#3a2a1e'), 0, 0.5, 0); part(g, Cy(0.15, 0.08, 0.3, 8), '#c9a43a', 0, 1.2, 0); part(g, Cy(0.05, 0.05, 0.2, 6), '#c9a43a', 0, 1.0, 0); for (const s of [-1, 1]) part(g, new THREE.TorusGeometry(0.08, 0.02, 4, 8), '#c9a43a', 0.17 * s, 1.25, 0); break;
    case 'poster': { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshBasicMaterial({ map: signTex(['ART OF WAR', 'HOVER CUP', 'VISIT MEZAR', 'DROME SUCKS', 'BOUNTY HUNTER', 'STARLIGHT LOUNGE'][Math.floor(Math.random() * 6)], ['#c8402f', '#3b4f7a', '#5a2a8a', '#1e1c22'][Math.floor(Math.random() * 4)], '#ffd36a'), side: THREE.DoubleSide })); p.position.y = 1.4; g.add(p); break; }
    case 'neon': { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), new THREE.MeshBasicMaterial({ map: signTex(['GOOD VIBES', 'NO DROME ZONE', 'PEW PEW', 'HOME', 'SPACE COWBOY'][Math.floor(Math.random() * 5)], '#1e0e1a', ['#ff6aa8', '#4fd2ff', '#6fdc5a'][Math.floor(Math.random() * 3)]), side: THREE.DoubleSide })); p.position.y = 1.6; g.add(p); break; }
    case 'painting': part(g, B(1.2, 0.9, 0.05), w('#c9a43a'), 0, 1.5, 0); part(g, B(1.05, 0.75, 0.02), toon(['#3b4f7a', '#c8402f', '#5a6a3a'][Math.floor(Math.random() * 3)]), 0, 1.5, 0.03); E(g, '#ffd36a', 0.2, 1.6, 0.04, 0.15, 0.15, 0.01); break;
    case 'candles': for (let k = 0; k < 3; k++) { part(g, Cy(0.04, 0.04, 0.12 + k * 0.08, 6), '#e8e4dc', (k - 1) * 0.12, 0.06 + k * 0.04, 0); part(g, new THREE.OctahedronGeometry(0.03, 0), glow('#ffb347'), (k - 1) * 0.12, 0.16 + k * 0.08, 0); } break;
    case 'clock': part(g, Cy(0.28, 0.28, 0.05, 16), '#e8e4dc', 0, 1.7, 0, Math.PI / 2); part(g, B(0.02, 0.2, 0.01), '#1e1c22', 0, 1.78, 0.03); part(g, B(0.15, 0.02, 0.01), '#1e1c22', 0.06, 1.7, 0.03); break;
    case 'computer': part(g, B(1.4, 0.06, 0.7), w('#3a2a1e'), 0, 0.75, 0); for (const s of [-1, 1]) part(g, B(0.06, 0.74, 0.65), w('#3a2a1e'), 0.65 * s, 0.37, 0); part(g, B(0.7, 0.45, 0.04), '#1e1c22', 0, 1.1, -0.2); part(g, B(0.64, 0.4, 0.02), glow('#6fdc5a'), 0, 1.1, -0.17); part(g, B(0.5, 0.03, 0.18), '#3a3d44', 0, 0.8, 0.05); break;
    case 'holotable': part(g, Cy(0.7, 0.6, 0.8, 12), '#3a3d44', 0, 0.4, 0); part(g, Cy(0.65, 0.65, 0.04, 16), glow('#2a6aa8'), 0, 0.82, 0); { const p = part(g, new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: '#4fd2ff', transparent: true, opacity: 0.6 }), 0, 1.2, 0); } break;
    case 'gunrack': part(g, B(1.4, 1.8, 0.15), w('#3a2a1e'), 0, 0.9, -0.1); for (let k = 0; k < 3; k++) { const gm = makeGunModel(['b5', 'r15', 'p35'][k] || 'b1'); gm.position.set(-0.45 + k * 0.45, 1.0, 0.05); gm.rotation.set(0, Math.PI / 2, Math.PI / 2); g.add(gm); } break;
    case 'saberstand': part(g, B(0.8, 0.9, 0.5), '#1e1c22', 0, 0.45, 0); part(g, Cy(0.03, 0.035, 0.25, 8), '#9aa1aa', 0, 1.0, 0, 0, 0, 0.6); part(g, B(0.05, 0.8, 0.05), glow(S.saber && S.saber.c ? S.saber.c : '#4fd2ff'), -0.25, 1.35, 0, 0, 0, 0.6); break;
    case 'robobuddy': { const r = recolor(makeXR17(), { '#9aa1aa': '#ffd36a' }); r.scale.setScalar(0.5); g.add(r); break; }
    case 'divider': { const d = new THREE.Mesh(B(2, 2.0, 0.08), new THREE.MeshLambertMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.35, depthWrite: false })); d.position.y = 1.0; g.add(d); part(g, B(2.02, 0.08, 0.12), '#5d636c', 0, 2.0, 0); part(g, B(2.02, 0.08, 0.12), '#5d636c', 0, 0.04, 0); break; }
    case 'pillar': part(g, Cy(0.22, 0.25, 2.6, 10), '#cfd3d8', 0, 1.3, 0); part(g, B(0.5, 0.12, 0.5), '#9aa1aa', 0, 2.55, 0); part(g, B(0.5, 0.12, 0.5), '#9aa1aa', 0, 0.06, 0); break;
    case 'railing': part(g, B(2, 0.06, 0.06), '#9aa1aa', 0, 0.95, 0); for (let k = 0; k < 5; k++) part(g, B(0.04, 0.95, 0.04), '#9aa1aa', -0.9 + k * 0.45, 0.48, 0); break;
  }
  return g;
};
// placement rules: only inside your ship, pieces are owned not spent
canBuild = function (type, gx, gz) {
  const x = gx * CELL, z = gz * CELL, def = PIECES[type]; if (!def) return 'Pick something to place';
  if (!onShip()) return 'Decorate inside your ship';
  const h = def.layer === 0 ? 1 : 0.5;
  if (!SHIP_ROOMS.some(r => x - h >= r.x0 + 0.3 && x + h <= r.x1 - 0.3 && z - h >= r.z0 + 0.3 && z + h <= r.z1 - 0.3)) return 'Place it inside one of your ship’s rooms';
  if (myBase().some(p => p[1] === gx && p[2] === gz && PIECES[p[0]] && PIECES[p[0]].layer === def.layer)) return 'Something is already there';
  if (myBase().length >= MAX_PIECES) return 'Your ship is full of stuff';
  if (!furnOwned(type)) return S.cr >= def.price ? null : `Costs ${def.price} cr`;
  return null;
};
placePiece = function () {
  const c = targetCell();
  if (baseState.remove) { const hit = topPieceAt(c.gx, c.gz); if (!hit) return; myBase().splice(myBase().indexOf(hit), 1); SFX.ui(); afterBaseChange(); return; }
  const why = canBuild(baseState.type, c.gx, c.gz); if (why) { SFX.hurt(); log(why); return; }
  const def = PIECES[baseState.type];
  if (!furnOwned(baseState.type)) { S.cr -= def.price; S.furn = S.furn || {}; S.furn[baseState.type] = 1; SFX.coin(); log(`Bought ${def.name} (${def.price} cr). Place as many as you like.`, 'loot'); }
  myBase().push([baseState.type, c.gx, c.gz, c.rot]); SFX.item(); afterBaseChange();
};
const _updGhost = updateGhost;
updateGhost = function () { _updGhost(); if (baseState.on && !baseState.remove) { const def = PIECES[baseState.type], why = canBuild(baseState.type, targetCell().gx, targetCell().gz); $('buildMsg').textContent = why || `Place ${def.name}${furnOwned(baseState.type) ? '' : ` · buy for ${def.price} cr`} · R rotates`; } };
baseState.cat = 'Living'; baseState.type = 'sofa';
renderBuildBar = function () {
  const bar = $('buildPieces'); bar.textContent = '';
  let cats = $('buildCats'); if (!cats) { cats = document.createElement('div'); cats.id = 'buildCats'; cats.className = 'bpieces'; bar.before(cats); }
  cats.textContent = ''; FURN_CATS.forEach(cn => { const b = document.createElement('button'); b.className = 'pbtn' + (baseState.cat === cn ? ' go' : ''); b.style.padding = '3px 8px'; b.style.fontSize = '12px'; b.textContent = cn; b.addEventListener('click', () => { baseState.cat = cn; const first = Object.keys(PIECES).find(k => PIECES[k].cat === cn); if (first) baseState.type = first; baseState.remove = false; SFX.ui(); renderBuildBar(); }); cats.appendChild(b); });
  Object.entries(PIECES).filter(([, p]) => p.cat === baseState.cat).forEach(([id, p]) => {
    const b = document.createElement('button'); b.className = 'pbtn' + (baseState.type === id && !baseState.remove ? ' go' : '');
    const n = document.createElement('span'); n.textContent = p.name; const c = document.createElement('small'); c.style.display = 'block'; c.style.fontSize = '11px';
    c.textContent = furnOwned(id) ? (p.price ? 'Owned' : 'Free') : `${p.price} cr`; c.style.color = furnOwned(id) || S.cr >= p.price ? 'var(--dim)' : '#ff8a80';
    b.append(n, c); b.addEventListener('click', () => { baseState.type = id; baseState.remove = false; SFX.ui(); renderBuildBar(); }); bar.appendChild(b); });
  $('bRemove').classList.toggle('go', baseState.remove);
  $('buildCount').textContent = `${myBase().length}/${MAX_PIECES} pieces · ${S.cr} cr`;
  const hd = document.querySelector('#buildBar .bhead b'); if (hd) hd.textContent = 'Decorate your ship';
};
setBuild = function (on) {
  if (on && !onShip()) { log('Decorating happens on your ship. Board it and open Decorate from the menu.'); return; }
  baseState.on = on; $('buildBar').hidden = !on; $('ammo').hidden = on; firing = false;
  if (on) { renderBuildBar(); log('Decorate: aim at the floor of a room, pick furniture, click/tap to place, R rotates.'); } else if (ghost) ghost.visible = false;
};
// planet bases are retired: only your ship's furniture renders
{ const _rb = renderBase; renderBase = function (key, pieces, col, own) { if (key !== 'ship') return; const r = _rb(key, cleanPieces(pieces), col, own); const g = baseState.groups.get('ship'); if (g) { g.userData.boxes = []; for (const p of cleanPieces(pieces)) { const d = PIECES[p[0]]; if (!d || !d.solid || p[0] === 'wall') continue; const hx = (p[3] ? d.dim[2] : d.dim[0]) / 2, hz = (p[3] ? d.dim[0] : d.dim[2]) / 2; g.userData.boxes.push([p[1] * CELL, p[2] * CELL, hx, hz]); } for (const p of cleanPieces(pieces)) if (p[0] === 'wall') g.userData.boxes.push(p[3] ? [p[1] * CELL, p[2] * CELL, 0.17, 1.0] : [p[1] * CELL, p[2] * CELL, 1.0, 0.17]); rebuildBaseColliders(); } furnInteracts(pieces); return r; }; }
function furnInteracts(pieces) {
  for (let i = INTERACTS.length - 1; i >= 0; i--) if (INTERACTS[i].furn) INTERACTS.splice(i, 1);
  for (const p of cleanPieces(pieces)) { const x = p[1] * CELL, z = p[2] * CELL, t = p[0], add = (label, fn) => INTERACTS.push({ x, z, r: 1.6, label, fn, furn: true, quiet: true });
    if (t === 'bed' || t === 'bunkbed' || t === 'hammock') add('Nap', () => { player.hp = maxHp(); SFX.quest(); toast('ZZZ', 'Fully rested', 1.5); });
    if (t === 'holotv') add('Watch the news', () => openUpdates(false));
    if (t === 'jukebox') add('Jukebox: Music Drive', () => openMusicDrive());
    if (t === 'holotable') add('Holo-map', () => openGalaxy());
    if (t === 'arcade') add('Play arcade', () => { const sc = randi(100, 9999); toast('HIGH SCORE?', `You scored ${sc}${sc > 9000 ? '. LEGENDARY.' : '. Not bad.'}`, 2); SFX.coin(); });
    if (t === 'coffee') add('Grab a coffee', () => { player.hp = Math.min(maxHp(), player.hp + 25); toast('COFFEE', 'Wide awake (+25 HP)', 1.5); SFX.item(); });
    if (t === 'fridge') add('Raid the fridge', () => { toast('FRIDGE', ['Space leftovers. Probably fine.', 'Someone ate your sandwich. It was B.U.R.P.', 'Ice cubes and a single olive.'][randi(0, 2)], 2); });
    if (t === 'telescope') add('Look through the telescope', () => toast('TELESCOPE', ['You spot Zarlich\'s storms.', 'A comet! Make a wish.', 'Is that... the Zeltac Ship waving?'][randi(0, 2)], 2.5));
    if (t === 'punchbag') add('Punch the bag', () => { SFX.hit(); toast('POW', 'Take that, Drome', 1); });
  }
}
// hide the Build button off-ship, rename it Decorate
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); const b = $('buildBtn'); if (b) { b.hidden = id !== 'ship'; b.textContent = 'Decorate'; } if (id !== 'ship' && baseState.on) setBuild(false); return r; }; }
window.__furn = { get rooms() { return SHIP_ROOMS; } };
