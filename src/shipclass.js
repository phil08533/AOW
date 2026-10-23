// =================== SHIP CLASSES: buy a Fighter or a Miner, tune them in the garage, Need for Speed style ===================
// Room to grow: a new class is one entry in SHIP_CLASSES (stats, flight feel, slots) plus a builder in SC_BUILD.
const PAINT_STYLES = [['Solid', 0], ['Two-tone', 0], ['Racing stripes', 2500], ['Flames', 4000], ['Camo', 3000], ['Hazard', 2000], ['Checker', 3500], ['Tiger', 4500], ['Carbon', 5000]];
// laser colors: the bolt color for the Setting Sun, the beam style for the Miner (borrowed from the beam guns)
const LASER_COLS = [['Ice blue', '#4fd2ff', 'frost'], ['Solar', '#ffb02a', 'solar'], ['Venom', '#7fff6a', 'venom'], ['Crimson', '#ff3b3b', 'crimson'], ['Galaxy', '#a87aff', 'galaxy'], ['White dwarf', '#e8ecff', 'dark']];
const LASER_OPTS = LASER_COLS.map((c, i) => [c[0], [0, 0, 1500, 1500, 3000, 5000][i], {}]);
const SHIP_CLASSES = {
  fighter: { name: 'Setting Sun', blurb: 'Your fighter. Wingtip laser pods, and side thrusters that strafe, climb and stop on a dime.', cost: 0, stat: { sp: 0.1, laser: 0.15 }, grip: 1.3, strafe: 1, lift: true, rcs: true,
    slots: {
      wing: ['Wings', [['Swept wings', 0, {}], ['Forward-swept', 3000, { sp: 0.04 }], ['Delta', 4000, { sp: 0.03, hull: 0.04 }], ['Quad X-wing', 7000, { laser: 0.08 }], ['Halo ring', 12000, { hull: 0.08, rcs: 0.1 }], ['Gull wings', 6000, { sp: 0.05 }], ['Twin blades', 9000, { sp: 0.03, laser: 0.05 }]]],
      eng: ['Engines', [['Twin thrusters', 0, {}], ['Single pulse', 3500, { sp: 0.06 }], ['Quad cluster', 6000, { sp: 0.1, hull: -0.04 }]]],
      nose: ['Nose', [['Wedge', 0, {}], ['Shark mouth', 2500, { hull: 0.04 }], ['Twin prong', 3500, { laser: 0.05 }], ['Hammerhead', 4000, { hull: 0.06 }], ['Needle lance', 4500, { sp: 0.05 }], ['Armored ram', 5000, { hull: 0.12, sp: -0.03 }], ['Split jaw', 5500, { laser: 0.08 }]]],
      lc: ['Laser color', LASER_OPTS],
      bolt: ['Bolt speed', [['Standard', 0, {}], ['Fast', 3000, {}], ['Hyper', 8000, {}]]],
      wpn: ['Guns', [['Laser pods', 0, {}], ['Gatling pods', 5000, { laser: 0.1 }], ['Missile racks', 6500, { laser: 0.14, sp: -0.02 }]]],
      kit: ['Body kit', [['Stock', 0, {}], ['Spoiler fins', 2000, { sp: 0.02 }], ['Side skirts', 2000, { hull: 0.04 }], ['Canards', 3000, { sp: 0.03 }]]]
    } },
  miner: { name: 'Bulldog Miner', blurb: 'A flying hauler. Huge hull, shrugs off fire, and its blue mining lasers carve asteroids fast (but hit ships softer).', cost: 20000, stat: { hull: 6.2, sp: -0.15, laser: -0.4 }, grip: 0.8, strafe: 0.6, lift: true, mine: 2.5, ore: 1.5, armor: 0.45,
    slots: {
      drill: ['Mining gear', [['Twin mining lasers', 0, {}], ['Big auger', 4000, { mine: 0.6 }], ['Claw arms', 3000, { ore: 0.3 }]]],
      armor: ['Armor', [['Plated', 0, {}], ['Heavy slab', 4500, { hull: 0.25, sp: -0.05 }], ['Cage frame', 3000, { hull: 0.1, sp: 0.03 }]]],
      eng: ['Engines', [['Hauler twins', 0, {}], ['Quad thrusters', 4000, { sp: 0.1 }]]],
      hopper: ['Cargo', [['Ore trays', 0, {}], ['Tank pods', 3000, { ore: 0.2 }], ['Container rack', 5000, { ore: 0.35, sp: -0.03 }]]],
      lights: ['Lights', [['Floodlights', 0, {}], ['Light bar', 1500, {}], ['Lights off', 0, {}]]],
      lc: ['Laser color', LASER_OPTS],
      beam: ['Beam', [['Steady', 0, {}], ['Overdrive', 4000, { mine: 0.4 }], ['Cutter', 8000, { mine: 0.8, laser: 0.1 }]]]
    } }
};
function scS() { S.scl = S.scl || { cur: 'fighter', own: {}, cfg: {}, m3: 1 }; const Q = S.scl; Q.own = Q.own || {}; Q.cfg = Q.cfg || {};
  // the Viper Fighter merged into the Setting Sun: anyone who bought it gets their credits back
  if (!Q.m3) { Q.m3 = 1; if (Q.own.fighter && typeof S.cr === 'number') { S.cr += 25000; setTimeout(() => toast('SHIPYARD', 'The Viper merged into the Setting Sun. 25,000 cr refunded', 3), 2500); } if (Q.cfg.fighter) Q.cfg.fighter.p = 10; }
  Q.own.fighter = 1; delete Q.own.starter; if (Q.cur === 'starter') Q.cur = 'fighter';
  for (const k in SHIP_CLASSES) if (!Q.cfg[k]) { const c = { v: 2, p: 10, a: k === 'miner' ? 6 : 6, st: 0, x: 0, own: {} }; for (const s in SHIP_CLASSES[k].slots) c[s] = 0; Q.cfg[k] = c; }
  if (Q.cfg.miner && Q.cfg.miner.v !== 2) Object.assign(Q.cfg.miner, { v: 2, p: 10, a: 6, st: 0 }); // the Miner's new hauler look
  if (!SHIP_CLASSES[Q.cur] || !Q.own[Q.cur]) Q.cur = 'fighter'; return Q; }
const shipCls = () => scS().cur, shipClsDef = () => SHIP_CLASSES[shipCls()];
function scPartStat(cls, cfg, stat) { const D = SHIP_CLASSES[cls]; let m = (D.stat[stat] || 0); for (const s in D.slots || {}) { const P = D.slots[s][1][cfg[s] || 0]; if (P && P[2][stat]) m += P[2][stat]; } return m; }
// stats: class + its fitted parts
{ const _sm = shipMod; shipMod = function (stat) { const c = shipCls(); return Math.max(0.3, 1 + scPartStat(c, scS().cfg[c], stat)); }; }
shipGrip = () => 1.6 * SHIP_SYS.thrust.lv[sysLv('thrust')].grip * shipClsDef().grip;
shipStrafe = () => shipClsDef().strafe;
shipLift = () => !shipClsDef().lift ? 0 : clamp((keys.Space || (typeof jetHeld !== 'undefined' && jetHeld) ? 1 : 0) - (keys.KeyX ? 1 : 0), -1, 1);
shipMineMul = () => { const c = shipCls(), D = SHIP_CLASSES[c]; return (D.mine || 1) + scPartStat(c, scS().cfg[c], 'mine'); };
shipOreMul = () => { const c = shipCls(), D = SHIP_CLASSES[c]; return (D.ore || 1) + scPartStat(c, scS().cfg[c], 'ore'); };
SHIP_SYS.thrust = { name: 'Thrusters', lbl: ['floaty', 'responsive', 'snappy', 'tight', 'on a dime'], lv: [{ grip: 1 }, { grip: 1.7, cost: { cr: 1500, circuit: 4 } }, { grip: 2.8, cost: { cr: 4000, circuit: 8, ore: 15 } }, { grip: 4.5, cost: { cr: 9000, circuit: 14, starcrystal: 3 } }, { grip: 7.5, cost: { cr: 18000, circuit: 20, starcrystal: 6 } }] };
// the miner's armor: less damage in space
{ const _h = hurt; hurt = function (dmg, src) { if (LEVEL && LEVEL.fly && SHIP_CLASSES[shipCls()].armor) dmg *= 1 - SHIP_CLASSES[shipCls()].armor; return _h(dmg, src); }; }

// ---------- paint jobs: a canvas texture per (base, accent, style) ----------
const SC_TEX = {};
function scPaintMat(base, acc, st) {
  const key = base + acc + st; if (SC_TEX[key]) return SC_TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 128, 128); x.fillStyle = acc;
  const name = PAINT_STYLES[st][0];
  if (name === 'Two-tone') x.fillRect(0, 64, 128, 64);
  else if (name === 'Racing stripes') { x.fillRect(44, 0, 14, 128); x.fillRect(70, 0, 14, 128); }
  else if (name === 'Flames') { x.beginPath(); x.moveTo(0, 128); for (let i = 0; i <= 8; i++) { x.quadraticCurveTo(i * 16 + 8, 128 - 40 - (i % 2) * 30, i * 16 + 16, 128 - (i % 3) * 10 - 20); } x.lineTo(128, 128); x.fill(); x.fillStyle = '#ffd36a'; x.beginPath(); x.moveTo(0, 128); for (let i = 0; i <= 8; i++) x.quadraticCurveTo(i * 16 + 8, 128 - 18 - (i % 2) * 14, i * 16 + 16, 118); x.lineTo(128, 128); x.fill(); }
  else if (name === 'Camo') { let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 26; i++) { x.fillStyle = i % 2 ? acc : 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(r() * 128, r() * 128, 8 + r() * 14, 5 + r() * 9, r() * 3, 0, 7); x.fill(); } }
  else if (name === 'Hazard') { x.fillStyle = '#ffd36a'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#16181c'; for (let i = -128; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 16, 0); x.lineTo(i + 16 + 128, 128); x.lineTo(i + 128, 128); x.fill(); } x.fillStyle = base; x.fillRect(0, 32, 128, 64); }
  else if (name === 'Checker') { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(i * 16, j * 16, 16, 16); }
  else if (name === 'Tiger') { for (let i = 0; i < 9; i++) { x.beginPath(); const y = i * 15; x.moveTo(0, y); x.quadraticCurveTo(40, y + 10, 64, y + 2); x.quadraticCurveTo(90, y - 6, 128, y + 6); x.lineTo(128, y + 10); x.quadraticCurveTo(80, y + 2, 64, y + 7); x.quadraticCurveTo(30, y + 14, 0, y + 5); x.fill(); } }
  else if (name === 'Carbon') { x.fillStyle = '#1a1c20'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.fillStyle = (i + j) % 2 ? '#2a2d33' : '#14161a'; x.fillRect(i * 8, j * 8, 8, 8); } x.fillStyle = acc; x.fillRect(0, 58, 128, 12); }
  // panel lines on top of every style
  x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 1; for (let i = 32; i < 128; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  const m = toon('#ffffff', 'panel').clone(); m.map = t; m.color.set('#ffffff'); return SC_TEX[key] = m;
}

let SC_HAZM = null;
function SC_HAZ() { if (SC_HAZM) return SC_HAZM; const c = document.createElement('canvas'); c.width = 64; c.height = 16; const x = c.getContext('2d'); x.fillStyle = '#ffd36a'; x.fillRect(0, 0, 64, 16); x.fillStyle = '#16181c'; for (let i = -16; i < 80; i += 12) { x.beginPath(); x.moveTo(i, 16); x.lineTo(i + 6, 16); x.lineTo(i + 16, 0); x.lineTo(i + 10, 0); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return SC_HAZM = new THREE.MeshBasicMaterial({ map: t }); }
// the Miner fires its blue mining lasers from the arm emitters
shipGunOff = side => { const G = fly && fly.ship && fly.ship.userData.guns; if (G && G.length) { const v = G[side < 0 ? 0 : G.length - 1]; return V(v.x, v.y, v.z); } return V(4.4 * side, 0, -1); };
shipTracer = () => shipCls() === 'miner' ? '#3ff4ff' : '#4fd2ff';
// ---------- the two ships ----------
// extra Setting Sun wings: 4 halo ring (a short split cylinder around the hull), 5 gull wings, 6 twin blades
function scWingX(g, W, s, m) {
  const red = glow('#ff3a2a'), cy = glow('#4fd2ff');
  if (W === 4) {
    if (s > 0) { const R = 2.05, len = 1.9, gap = 0.75, t0 = Math.PI + gap / 2, tl = Math.PI * 2 - gap, ring = new THREE.Group(); ring.position.set(0, 0.2, 0.9); g.add(ring);
      const shell = (r, mat) => { const geo = new THREE.CylinderGeometry(r, r, len, 40, 1, true, t0, tl); geo.rotateX(Math.PI / 2); const mm = typeof mat === 'string' ? toon(mat).clone() : mat.clone(); mm.side = THREE.DoubleSide; ring.add(new THREE.Mesh(geo, mm)); };
      shell(R, m.grey); shell(R - 0.16, m.dk);
      for (const z of [-len / 2, len / 2]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(R - 0.08, 0.1, 6, 40, tl), typeof (z < 0 ? m.hull : m.lg) === 'string' ? toon(z < 0 ? m.hull : m.lg) : (z < 0 ? m.hull : m.lg)); rim.rotation.z = Math.PI / 2 + gap / 2; rim.position.z = z; ring.add(rim); }
      const band = new THREE.Mesh(new THREE.TorusGeometry(R + 0.02, 0.035, 4, 40, tl), cy); band.rotation.z = Math.PI / 2 + gap / 2; ring.add(band);
      // the split: two armored lips with hazard caps and red marker lights
      for (const k of [-1, 1]) { const a = Math.PI / 2 + k * gap / 2, x = Math.cos(a) * (R - 0.08), y = Math.sin(a) * (R - 0.08); part(ring, B(0.24, 0.3, len + 0.06), m.hull, x, y, 0, 0, 0, a - Math.PI / 2); part(ring, B(0.26, 0.12, 0.5), m.haz, x, y + 0.12, -len / 2 + 0.3, 0, 0, a - Math.PI / 2); part(ring, B(0.1, 0.1, 0.1), red, x, y + 0.2, len / 2 - 0.1); }
      for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + gap / 2 + 0.25 + i * (tl - 0.5) / 9; part(ring, B(0.05, 0.05, len * 0.8), m.lg, Math.cos(a) * (R + 0.03), Math.sin(a) * (R + 0.03), 0, 0, 0, a); } }
    // struts tie the ring to the hull
    for (const y of [-0.35, 0.65]) { part(g, B(1.0, 0.14, 0.5), m.grey, 1.5 * s, y, 0.9, 0, 0, s * (y < 0 ? 0.3 : -0.3)); part(g, B(0.9, 0.05, 0.08), cy, 1.5 * s, y + 0.09, 0.66, 0, 0, s * (y < 0 ? 0.3 : -0.3)); }
    return;
  }
  if (W === 5) { // gull: up from the hull, then down to the pods
    const a = part(g, B(1.4, 0.18, 1.9), m.grey, 1.62 * s, 0.13, 1.0, 0, 0.35 * s, 0.42 * s); part(g, B(1.4, 0.07, 0.4), m.hull, 1.62 * s, 0.25, 0.35, 0, 0.35 * s, 0.42 * s);
    const b = part(g, B(1.45, 0.16, 1.7), m.grey, 2.78 * s, 0.17, 0.75, 0, 0.35 * s, -0.42 * s); part(g, B(0.5, 0.06, 0.16), m.haz, 2.75 * s, 0.27, 1.55, 0, 0.35 * s, -0.42 * s);
    part(g, B(0.3, 0.3, 0.3), m.lg, 2.22 * s, 0.42, 0.85); part(g, B(0.12, 0.12, 0.12), red, 2.22 * s, 0.6, 0.85); part(g, B(1.2, 0.03, 0.05), cy, 1.62 * s, 0.24, 1.95, 0, 0, 0.42 * s);
    return;
  }
  if (W === 6) { // twin blades: two thin swept wings joined by an end plate
    for (const [y, l] of [[-0.32, 2.3], [0.5, 1.9]]) { part(g, B(l, 0.1, 1.5), m.grey, (1.0 + l / 2) * s, y, 1.1, 0, 0.5 * s, 0); part(g, B(l, 0.05, 0.3), m.hull, (1.0 + l / 2) * s, y + 0.06, 0.55, 0, 0.5 * s, 0); part(g, B(l * 0.9, 0.02, 0.04), cy, (1.0 + l / 2) * s, y + 0.07, 1.85, 0, 0.5 * s, 0); }
    part(g, B(0.1, 1.05, 1.2), m.grey, 3.0 * s, 0.1, 1.55); part(g, B(0.12, 0.3, 0.6), m.haz, 3.0 * s, 0.55, 1.75); part(g, B(0.08, 0.08, 0.08), red, 3.02 * s, 0.62, 1.2);
  }
}
const SC_BUILD = {
  fighter(g, C, hull, acc, dk, eg) {
    // the Setting Sun: a grey wedge hull with orange trim, a white canopy, laser pods on the wingtips
    const grey = '#6a6e76', lg = '#9aa1aa', wh = '#e8eef2', cyan = glow('#3ff4ff'), haz = SC_HAZ(), rcs = [], guns = [];
    part(g, B(1.9, 0.8, 5.2), grey, 0, -0.1, 0.6); part(g, B(1.94, 0.12, 5.2), dk, 0, -0.42, 0.6);
    // nose
    if (C.nose === 3) { part(g, B(1.7, 0.6, 2.0), grey, 0, -0.2, -2.8); part(g, B(3.0, 0.42, 0.9), grey, 0, -0.2, -4.1); part(g, B(2.9, 0.1, 0.8), hull, 0, 0.05, -4.1); part(g, B(1.3, 0.12, 2.0), hull, 0, 0.14, -2.8, 0.05);
      for (const s of [-1, 1]) { part(g, B(0.3, 0.3, 0.06), glow('#fff6d0'), 1.3 * s, -0.2, -4.57); part(g, B(0.2, 0.44, 0.92), haz, 1.5 * s, -0.2, -4.1); } }
    else if (C.nose === 4) { for (const [w, h, z] of [[1.4, 0.55, -2.6], [0.9, 0.42, -3.9], [0.5, 0.3, -5.1]]) { part(g, B(w, h, 1.4), grey, 0, -0.2, z); part(g, B(w * 0.7, 0.08, 1.3), hull, 0, -0.2 + h / 2 + 0.03, z); }
      part(g, Cy(0.05, 0.05, 1.4, 6), lg, 0, -0.2, -6.4, Math.PI / 2); E(g, glow('#ff3a2a'), 0, -0.2, -7.1, 0.08, 0.08, 0.08); }
    else if (C.nose === 5) { part(g, B(1.95, 0.9, 2.4), grey, 0, -0.1, -2.9); part(g, B(1.85, 0.8, 0.16), haz, 0, -0.1, -4.15); part(g, B(1.5, 0.14, 2.2), hull, 0, 0.38, -2.9);
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) E(g, lg, 0.99 * s, -0.1, -2.1 - k * 0.7, 0.07, 0.07, 0.07); }
    else if (C.nose === 6) { for (const s of [-1, 1]) { part(g, B(0.55, 0.5, 2.8), grey, 0.6 * s, -0.2, -3.0, 0, -0.12 * s, 0); part(g, B(0.45, 0.1, 2.6), hull, 0.62 * s, 0.07, -3.0, 0, -0.12 * s, 0); part(g, B(0.3, 0.3, 0.3), lg, 0.82 * s, -0.2, -4.4); }
      part(g, B(0.6, 0.35, 1.2), dk, 0, -0.25, -2.6); part(g, B(0.5, 0.25, 0.05), glow('#3ff4ff'), 0, -0.25, -3.22); }
    else if (C.nose === 2) for (const s of [-1, 1]) { part(g, B(0.5, 0.5, 2.6), grey, 0.55 * s, -0.15, -2.9); part(g, B(0.4, 0.12, 2.4), hull, 0.55 * s, 0.14, -2.9); }
    else { const n = part(g, B(1.7, 0.6, 2.2), grey, 0, -0.2, -2.9); part(g, B(1.2, 0.5, 1.2), grey, 0, -0.25, -4.4); part(g, B(1.3, 0.14, 3.4), hull, 0, 0.17, -2.9, 0.06); part(g, B(0.8, 0.12, 1.1), hull, 0, 0.0, -4.4, 0.12);
      if (C.nose === 1) { for (let i = 0; i < 5; i++) part(g, new THREE.ConeGeometry(0.07, 0.22, 3), wh, -0.4 + i * 0.2, -0.5, -4.95, Math.PI); E(g, glow('#ff2a3a'), 0.4, -0.05, -4.6, 0.07, 0.07, 0.07); E(g, glow('#ff2a3a'), -0.4, -0.05, -4.6, 0.07, 0.07, 0.07); } }
    // cockpit: white canopy frame around a dark glass front
    part(g, B(1.3, 0.75, 1.7), wh, 0, 0.62, -0.7); const gl = part(g, B(1.1, 0.6, 0.06), '#07090c', 0, 0.62, -1.56, 0.25); for (const s of [-1, 1]) part(g, B(0.06, 0.45, 1.1), '#07090c', 0.66 * s, 0.6, -0.9);
    part(g, B(1.5, 0.1, 2.0), hull, 0, 0.32, -0.7);
    // rear body: orange deck with vent slats, side steps and lights
    part(g, B(2.1, 1.1, 2.6), grey, 0, 0.25, 2.1); part(g, B(1.9, 0.12, 2.2), hull, 0, 0.85, 2.0); part(g, B(1.1, 0.06, 1.3), dk, 0, 0.92, 2.1); for (let i = 0; i < 4; i++) part(g, B(1.0, 0.05, 0.12), '#2a2c32', 0, 0.96, 1.6 + i * 0.3);
    for (const s of [-1, 1]) { for (let i = 0; i < 4; i++) part(g, B(0.06, 0.1, 2.2), lg, 1.06 * s, -0.1 + i * 0.22, 2.1); part(g, B(0.05, 0.16, 0.16), glow('#ffd36a'), 1.1 * s, 0.35, 0.9); part(g, B(0.05, 0.16, 0.16), glow('#ff3a2a'), 1.1 * s, 0.15, 0.9);
      part(g, B(0.05, 0.14, 0.14), glow('#ffd36a'), 0.97 * s, -0.1, -1.5); part(g, B(0.05, 0.14, 0.14), glow('#ff3a2a'), 0.97 * s, -0.1, -1.3); }
    // tail fins with hazard tips
    for (const s of [-1, 1]) { const big = C.kit === 1 ? 1.4 : 1; const f = part(g, B(0.14, 1.0 * big, 1.2), grey, 0.55 * s, 1.25 + (big - 1) * 0.3, 2.6, -0.35, 0, -0.45 * s); part(g, B(0.16, 0.3, 0.6), haz, 0.55 * s + s * 0.28 * big, 1.75 + (big - 1) * 0.6, 2.85, -0.35, 0, -0.45 * s); }
    for (const s of [-1, 1]) {
      // wings
      const ws = C.wing === 1 ? -0.35 : C.wing === 2 ? 0.7 : 0.4, wl = C.wing === 2 || C.wing === 5 ? 2.4 : C.wing === 4 ? 1.1 : 2.2;
      if ((C.wing | 0) < 4) {
      const w = part(g, B(wl, 0.2, 2.0), grey, (1.0 + wl / 2) * s, -0.15, 1.0, 0, ws * s, 0); part(g, B(wl, 0.08, 0.4), hull, (1.0 + wl / 2) * s, -0.02, 0.2 + (C.wing === 1 ? -0.3 : 0.3), 0, ws * s, 0);
      part(g, B(0.4, 0.06, 0.15), haz, 2.4 * s, -0.02, 1.9); part(g, B(0.35, 0.18, 0.5), lg, 1.7 * s, 0.03, 0.7); part(g, B(0.12, 0.12, 0.12), glow('#ff3a2a'), 1.55 * s, 0.1, 0.45); part(g, B(0.12, 0.12, 0.12), glow('#ff3a2a'), 1.72 * s, 0.1, 0.45);
      if (C.wing === 3) { const w2 = part(g, B(2.2, 0.16, 1.6), grey, 2.1 * s, 0.5, 1.2, 0, 0.3 * s, 0.35 * s); }
      } else scWingX(g, C.wing, s, { grey, hull, lg, haz, dk });
      // wingtip pods: orange barrels, grey collars, glowing cyan laser faces
      const px = C.wing === 4 ? 2.45 * s : (1.0 + wl) * s + (C.wing === 2 || C.wing === 5 ? 0 : 0.1 * s), pz = C.wing === 1 ? 0.6 : C.wing === 4 ? 0.9 : 0.2, py = C.wing === 5 ? -0.55 : 0;
      part(g, B(0.75, 0.7, 2.4), hull, px, -0.1, pz); for (const z of [pz - 0.6, pz + 0.7]) part(g, B(0.8, 0.75, 0.15), lg, px, -0.1, z); part(g, B(0.4, 0.15, 0.6), lg, px, 0.3, pz + 0.2); part(g, B(0.22, 0.22, 0.06), lg, px + 0.39 * s, -0.1, pz + 0.3);
      part(g, B(0.6, 0.55, 0.5), lg, px, -0.1, pz - 1.45);
      if (C.wpn === 1) for (let k = 0; k < 4; k++) part(g, Cy(0.05, 0.05, 0.8, 4), lg, px + Math.cos(k * 1.57) * 0.13, -0.1 + Math.sin(k * 1.57) * 0.13, pz - 2.0, Math.PI / 2);
      else part(g, B(0.46, 0.42, 0.05), cyan, px, -0.1, pz - 1.72);
      guns.push(V(px, -0.1, pz - 1.8));
      if (C.wpn === 2) for (let k = 0; k < 2; k++) { part(g, Cy(0.08, 0.08, 1.2, 6), lg, (1.5 + k * 0.45) * s, -0.45, 0.8, Math.PI / 2); part(g, new THREE.ConeGeometry(0.08, 0.25, 6), '#c8402f', (1.5 + k * 0.45) * s, -0.45, 0.07, -Math.PI / 2); }
      // small cannons under the nose and wings, orange tipped
      part(g, Cy(0.06, 0.06, 1.0, 6), lg, 0.5 * s, -0.55, -3.4, Math.PI / 2); part(g, B(0.14, 0.14, 0.14), hull, 0.5 * s, -0.55, -3.95); part(g, B(0.25, 0.2, 0.4), hull, 0.5 * s, -0.5, -2.9);
      part(g, Cy(0.06, 0.06, 0.6, 6), lg, 1.4 * s, -0.4, -0.3, Math.PI / 2); part(g, B(0.13, 0.13, 0.13), hull, 1.4 * s, -0.4, -0.65);
      // body kit
      if (C.kit === 2) part(g, B(0.12, 0.25, 4.0), hull, 0.98 * s, -0.4, 0.2);
      else if (C.kit === 3) { part(g, B(1.0, 0.08, 0.45), grey, 1.1 * s, -0.1, -2.7, 0, 0.4 * s); part(g, B(0.35, 0.09, 0.45), hull, 1.5 * s, -0.1, -2.85, 0, 0.4 * s); }
      // side thruster pods (RCS)
      for (const z of [-1.9, 2.6]) { part(g, B(0.3, 0.3, 0.4), dk, 1.08 * s, 0.25, z); part(g, B(0.32, 0.06, 0.42), hull, 1.09 * s, 0.42, z);
        for (const d of [V(s, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, z < 0 ? -1 : 1)]) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 6), glow('#bfe8ff')); fl.material = fl.material.clone(); fl.material.transparent = true; fl.material.opacity = 0.85; fl.material.blending = THREE.AdditiveBlending; fl.material.depthWrite = false;
          fl.position.set(1.08 * s + d.x * 0.3, 0.25 + d.y * 0.3, z + d.z * 0.3); fl.quaternion.setFromUnitVectors(V(0, -1, 0), d); fl.geometry = fl.geometry.clone().translate(0, -0.35, 0); fl.scale.setScalar(0.001); g.add(fl); rcs.push({ m: fl, d }); } }
    }
    // engines: glowing orange thruster blocks at the stern
    const th = C.eng === 1 ? [[0, 0.25, 1.2]] : C.eng === 2 ? [[-0.5, 0.55, 0.5], [0.5, 0.55, 0.5], [-0.5, -0.05, 0.5], [0.5, -0.05, 0.5]] : [[-0.55, 0.45, 0.6], [0.55, 0.45, 0.6], [0, -0.1, 0.6]];
    for (const [x, yy, r] of th) { part(g, B(r + 0.15, r + 0.15, 0.8), lg, x, yy, 3.6); part(g, B(r + 0.2, r + 0.2, 0.12), hull, x, yy, 4.0); part(g, B(r, r, 0.06), glow(eg), x, yy, 4.07); }
    g.userData.rcs = rcs; g.userData.guns = guns;
  },
  miner(g, C, hull, acc, dk, eg) {
    const grey = '#6a6e76', lg = '#9aa1aa', wh = '#e8eef2', y = '#ffd36a', cyan = glow('#3ff4ff'), haz = SC_HAZ(), spin = [], guns = [];
    // chassis, body and the white cab with its big dark windshield
    part(g, B(2.8, 0.7, 5.6), grey, 0, -0.6, 0.4); part(g, B(2.9, 1.4, 4.2), hull, 0, 0.45, 1.0); part(g, B(2.92, 0.12, 4.22), dk, 0, -0.2, 1.0);
    part(g, B(2.3, 1.7, 1.5), wh, 0, 0.15, -1.75); part(g, B(1.8, 1.05, 0.06), '#07090c', 0, 0.3, -2.52); part(g, B(2.32, 0.5, 0.4), hull, 0, -0.55, -2.35);
    for (const s of [-1, 1]) { part(g, B(0.3, 0.3, 0.06), grey, 0.85 * s, -0.55, -2.57); part(g, B(0.3, 0.3, 0.06), grey, 1.4 * s, 0.9, -0.95); }
    // body panel seams and grey side bands
    for (const s of [-1, 1]) { part(g, B(0.04, 0.55, 4.0), grey, 1.46 * s, -0.05, 1.0); for (const z of [0.2, 1.6]) part(g, B(0.05, 0.8, 0.04), dk, 1.47 * s, 0.75, z); }
    // side console with a yellow and a red light
    part(g, B(0.06, 0.45, 0.6), grey, 1.48, 0.05, -0.55); part(g, B(0.04, 0.16, 0.16), glow(y), 1.52, 0.05, -0.67); part(g, B(0.04, 0.16, 0.16), glow('#ff3a2a'), 1.52, 0.05, -0.45);
    // the roof: plates, hazard bars, buttons, a radar dome and two stacks
    part(g, B(2.2, 0.08, 1.6), lg, 0, 1.19, 0.1); part(g, B(1.2, 0.04, 0.9), grey, 0, 1.24, 0.2); part(g, B(2.2, 0.08, 1.7), lg, 0, 1.19, 2.15);
    part(g, B(0.6, 0.06, 0.22), haz, -0.75, 1.24, -0.6); part(g, B(0.6, 0.06, 0.22), haz, 0.75, 1.24, 0.75); part(g, B(0.22, 0.08, 0.18), glow(y), -0.3, 1.25, -0.75); part(g, B(0.22, 0.08, 0.18), glow('#ff3a2a'), 0.6, 1.25, 0.35);
    part(g, Cy(0.55, 0.6, 0.12, 12), grey, 0.4, 1.28, 2.4); const dome = part(g, new THREE.SphereGeometry(0.42, 10, 6, 0, 6.3, 0, 1.6), wh, 0.4, 1.32, 2.4); part(g, Cy(0.38, 0.4, 0.12, 10), glow('#4fd2ff'), 0.4, 1.36, 2.4); dome.userData.ax = 'y'; spin.push(dome);
    part(g, B(0.22, 0.9, 0.22), lg, -0.5, 1.65, 1.7); part(g, B(0.2, 1.4, 0.2), lg, -0.15, 1.9, 2.3); part(g, B(0.4, 0.2, 0.4), grey, -0.15, 1.3, 2.3);
    // mining gear up front
    if (C.drill === 1) { const d = new THREE.Group(); d.position.set(0, -0.55, -2.6); g.add(d); part(d, new THREE.ConeGeometry(0.75, 2.4, 8), lg, 0, 0, -1.2, -Math.PI / 2); for (let k = 0; k < 4; k++) part(d, new THREE.TorusGeometry(0.6 - k * 0.13, 0.06, 4, 10), y, 0, 0, -0.35 - k * 0.5); spin.push(d); }
    else if (C.drill === 2) for (const s of [-1, 1]) { part(g, B(0.4, 0.4, 1.6), hull, 1.75 * s, -0.4, -1.6); for (const k of [-1, 1]) part(g, B(0.14, 0.14, 0.9), lg, 1.75 * s + k * 0.2, -0.4, -2.75, 0, -k * s * 0.4); E(g, cyan, 1.75 * s, -0.4, -2.45, 0.12, 0.12, 0.12); guns.push(V(1.75 * s, -0.4, -2.6)); }
    else for (const s of [-1, 1]) {
      // twin mining lasers: chunky orange arms with grey collars and a glowing cyan emitter
      part(g, B(1.0, 0.85, 1.3), hull, 1.95 * s, -0.35, -0.9); part(g, B(0.5, 0.2, 0.5), lg, 1.95 * s, 0.13, -0.9); part(g, B(0.6, 0.5, 0.6), lg, 1.5 * s, -0.35, -0.6);
      part(g, B(0.9, 0.75, 0.6), hull, 1.95 * s, -0.35, -1.8); for (const z of [-1.45, -2.15]) part(g, B(0.95, 0.8, 0.12), lg, 1.95 * s, -0.35, z); part(g, B(0.25, 0.25, 0.06), grey, 2.43 * s, -0.35, -1.0);
      part(g, B(0.75, 0.65, 0.5), lg, 1.95 * s, -0.35, -2.4); part(g, B(0.6, 0.5, 0.05), cyan, 1.95 * s, -0.35, -2.67); guns.push(V(1.95 * s, -0.35, -2.75)); }
    // armor options
    if (C.armor === 1) for (const s of [-1, 1]) { part(g, B(0.2, 1.0, 3.2), grey, 1.55 * s, 0.6, 1.3); for (let k = 0; k < 3; k++) part(g, B(0.22, 0.1, 0.1), y, 1.56 * s, 1.0, 0.3 + k * 1.0); }
    else if (C.armor === 2) for (const s of [-1, 1]) { for (let k = 0; k < 5; k++) part(g, B(0.06, 1.5, 0.06), lg, 1.52 * s, 0.4, -0.4 + k * 0.85); part(g, B(0.06, 0.06, 3.6), lg, 1.52 * s, 1.1, 1.3); }
    // cargo: open ore trays heaped with crystals, tank pods or a container rack
    if (C.hopper === 1) for (const s of [-1, 1]) { part(g, Cy(0.4, 0.4, 2.4, 10), lg, 1.75 * s, -0.4, 1.8, Math.PI / 2); part(g, Cy(0.42, 0.42, 0.1, 10), y, 1.75 * s, -0.4, 1.0, Math.PI / 2); }
    else if (C.hopper === 2) for (let k = 0; k < 3; k++) part(g, B(1.8, 0.6, 0.7), ['#c8402f', '#3a6cb8', '#6f7a3e'][k], 0, 1.55, 1.5 + k * 0.75);
    else for (const s of [-1, 1]) { const x = 1.78 * s; part(g, B(0.75, 0.12, 2.3), grey, x, -0.65, 1.6); part(g, B(0.08, 0.55, 2.3), grey, x + 0.36 * s, -0.4, 1.6); part(g, B(0.75, 0.55, 0.08), grey, x, -0.4, 0.48); part(g, B(0.75, 0.55, 0.08), grey, x, -0.4, 2.72);
      for (let k = 0; k < 7; k++) { const cr = part(g, new THREE.ConeGeometry(0.12 + (k % 3) * 0.04, 0.5 + (k % 2) * 0.3, 5), glow(['#3ab8ff', '#ff8a2a', '#2a5aff', '#7fe8ff'][k % 4]), x + ((k % 3) - 1) * 0.18, -0.25 + (k % 2) * 0.12, 0.7 + k * 0.3, (k % 3 - 1) * 0.3, 0, (k % 2 ? 0.3 : -0.3) * s); }
      for (let k = 0; k < 3; k++) part(g, B(0.3, 0.3, 0.3), ['#2a5aff', '#ff8a2a', '#e86a5a'][k], x, -0.42, 0.85 + k * 0.7, 0.3, k, 0.2); }
    // lights
    if (C.lights === 0) for (const s of [-1, 1]) { part(g, B(0.35, 0.25, 0.2), dk, 0.75 * s, 1.1, -2.2); part(g, B(0.28, 0.18, 0.05), glow('#fff6d0'), 0.75 * s, 1.1, -2.31); }
    else if (C.lights === 1) { part(g, B(1.9, 0.16, 0.2), dk, 0, 1.08, -2.3); for (let k = 0; k < 6; k++) part(g, B(0.22, 0.1, 0.05), glow(k % 2 ? '#fff6d0' : '#ffb347'), -0.75 + k * 0.3, 1.08, -2.42); }
    // thrusters at the back: grey housings with glowing orange faces
    const th = C.eng === 1 ? [[-1.0, 0.75], [1.0, 0.75], [-1.0, -0.25], [1.0, -0.25], [0, 0.25]] : [[-1.0, 0.75], [1.0, 0.75], [-1.0, -0.25], [1.0, -0.25]];
    for (const [x, yy] of th) { part(g, B(0.75, 0.75, 0.9), grey, x, yy, 3.45); part(g, B(0.8, 0.8, 0.12), hull, x, yy, 3.88); part(g, B(0.6, 0.6, 0.06), glow(eg), x, yy, 3.95); }
    g.userData.spin = spin; g.userData.guns = guns;
  }
};
function makeClassShip(cls, C, col) {
  const g = new THREE.Group(), base = (SHIP_PAINTS[C.p] || SHIP_PAINTS[0])[1], acc = (SHIP_ACCENTS[C.a] || SHIP_ACCENTS[0])[1] || col || '#ff8a2a', ex = (SHIP_EXHAUST[C.x | 0] || SHIP_EXHAUST[0])[1], eg = ex === 'rainbow' ? '#ff9a3c' : ex;
  SC_BUILD[cls](g, C, scPaintMat(base, acc, C.st | 0), acc, '#2a2d33', eg);
  g.userData.engines = g.children.filter(m => m.material === glow(eg)); g.userData.cls = cls;
  return g;
}
{ const _mk = makeStarship; makeStarship = function (col, cfgIn) {
  if (cfgIn && cfgIn.cls) return makeClassShip(SHIP_CLASSES[cfgIn.cls] ? cfgIn.cls : 'fighter', SHIP_CLASSES[cfgIn.cls] ? cfgIn : scS().cfg.fighter, col);
  const c = shipCls(); if (!cfgIn) return makeClassShip(c, scS().cfg[c], col);
  return scStarterDetail(_mk(col, cfgIn)); }; }
// the starter gets a detail pass too: nav lights, panel seams, vents, a canopy frame and an antenna
function scStarterDetail(g) { const dk = '#2a2d33';
  for (const s of [-1, 1]) { E(g, glow(s < 0 ? '#ff3a2a' : '#6fdc5a'), 4.6 * s, -0.1, 1.2, 0.12, 0.12, 0.12); for (let i = 0; i < 5; i++) part(g, B(0.04, 0.6, 0.04), dk, 0.81 * s, 0, -2.2 + i * 1.1);
    for (let i = 0; i < 3; i++) part(g, B(0.05, 0.25, 0.6), '#16181c', 0.81 * s, -0.2, 1.4 + i * 0.7); part(g, B(0.06, 0.06, 1.5), '#cfd3d8', 0.5 * s, 0.86, -2.6, 0.25); }
  part(g, B(1.1, 0.06, 0.06), '#cfd3d8', 0, 0.9, -2.0); part(g, Cy(0.02, 0.02, 1.0, 4), dk, 0.4, 1.1, 1.6); E(g, glow('#ff3a2a'), 0.4, 1.6, 1.6, 0.06, 0.06, 0.06);
  for (let i = 0; i < 4; i++) part(g, B(1.62, 0.03, 0.04), dk, 0, 0.5, -2.2 + i * 1.6); return g; }

// ---------- flight fx: side thrusters puff against your acceleration; drills spin ----------
const _rv = V(0, 0, 0), _ra = V(0, 0, 0), _rq = new THREE.Quaternion();
{ const _ss = spaceStep; spaceStep = function (dt, t) {
  const F = fly; const pv = F ? _rv.copy(F.vel) : null; _ss(dt, t); if (!F || !F.ship) return;
  const U = F.ship.userData;
  if (U.spin) U.spin.forEach((d, i) => { d.rotation[d.userData.ax || 'z'] += dt * (d.userData.ax ? 1.5 : 6 + i); });
  if (U.rcs && dt > 0) { _ra.copy(F.vel).sub(pv).divideScalar(dt); _rq.copy(_q).invert(); _ra.applyQuaternion(_rq);
    const want = (keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD || Math.abs(move.x) + Math.abs(move.y) > 0.1 || shipLift() !== 0), mag = Math.max(45, F.vel.length() * 0.4);
    for (const R of U.rcs) { const k = clamp(-R.d.dot(_ra) / mag, 0, 1.6), s = k > 0.08 ? (0.5 + k) * (0.85 + Math.random() * 0.3) : 0.001; R.m.scale.setScalar(R.m.scale.x + (s - R.m.scale.x) * Math.min(1, dt * 18)); }
    if (want && _ra.length() > 25 && (F.rcsT = (F.rcsT || 0) - dt) <= 0) { F.rcsT = 0.12; try { SFX.engine(0.25, 0.5); } catch (_) {} } }
}; }

// ---------- the garage ----------
function scBuy(k) { const D = SHIP_CLASSES[k]; if (S.cr < D.cost) { toast('NOT ENOUGH CREDITS', `${D.name} costs ${D.cost.toLocaleString()} cr`, 1.6); return; } S.cr -= D.cost; scS().own[k] = 1; scS().cur = k; SFX.level(); toast('NEW SHIP', D.name, 2.2); markDirty(); scRefit(); }
function scRefit() { if (LEVEL.fly && fly && fly.ship) { const old = fly.ship, nw = makeStarship(S.col); nw.position.copy(old.position); nw.quaternion.copy(old.quaternion); levelGroup.remove(old); levelGroup.add(nw); fly.ship = nw; fly.sternD = null; } if (typeof sendPresence === 'function') sendPresence(true); }
const _origShipMods = openShipMods;
openShipMods = function () { const Q = scS(); openDlg('Shipyard', 'Your hangar');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = `Buy a hull, fly it, then tune it in the garage. ${S.cr.toLocaleString()} cr.`;
    for (const k in SHIP_CLASSES) { const D = SHIP_CLASSES[k], own = Q.own[k], on = Q.cur === k; if (D.hide && D.hide() && !own) continue; const r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = on ? '#6fdc5a' : own ? '#4fd2ff' : '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = `${D.name} · ${D.blurb}`; const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; mt.textContent = on ? 'Flying' : own ? 'Owned' : D.cost.toLocaleString() + ' cr';
      const b1 = document.createElement('button'); b1.className = 'pbtn'; b1.style.padding = '5px 10px'; b1.textContent = own ? (on ? 'Garage' : 'Fly') : 'Buy';
      b1.addEventListener('click', () => { if (!own) { scBuy(k); render(); return; } if (!on) { Q.cur = k; markDirty(); SFX.item(); scRefit(); render(); pv(); return; } closeDlg(); scGarage(k); });
      r.style.cursor = 'pointer'; r.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') return; setPreview(() => { const g = makeStarship(S.col, Object.assign({ cls: k }, Q.cfg[k])); g.rotation.set(0.4, Math.PI * 0.75, 0); return g; }, D.name, 1.5) });
      r.append(dot, nm, mt, b1); rows.appendChild(r); } };
  const pv = () => setPreview(() => { const g = makeStarship(S.col); g.rotation.set(0.4, Math.PI * 0.75, 0); return g; }, SHIP_CLASSES[Q.cur].name, 1.5)
  $('dlgActs').before(rows); acts([['Garage', () => { closeDlg(); scGarage(Q.cur); }, true], ['Done', closeDlg]]); render(); showPreviewIn(rows); pv(); };
function scGarage(k) {
  const D = SHIP_CLASSES[k], C = scS().cfg[k]; C.own = C.own || {}; openDlg('Garage', D.name);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; let tab = 'st';
  const tabs = [['st', 'Style'], ['p', 'Paint'], ['a', 'Accent'], ['x', 'Exhaust'], ...Object.entries(D.slots).map(([s, v]) => [s, v[0]])];
  const listOf = t => t === 'st' ? PAINT_STYLES.map(s => [s[0], s[1], {}]) : t === 'p' ? SHIP_PAINTS : t === 'a' ? SHIP_ACCENTS : t === 'x' ? SHIP_EXHAUST : D.slots[t][1];
  const owned = (t, i) => (t === 'p' || t === 'a' || t === 'x') ? smOwn(t, i) : !listOf(t)[i][1] || !!C.own[t + i];
  const statTxt = st => Object.entries(st || {}).map(([s, v]) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}% ${s === 'sp' ? 'speed' : s}`).join(', ');
  const pv = (over, lbl) => setPreview(() => { const g = makeStarship(S.col, Object.assign({ cls: k }, C, over || {})); g.rotation.set(0.4, Math.PI * 0.75, 0); return g; }, lbl || D.name, 1.5)
  const render = () => { rows.textContent = '';
    $('dlgLine').textContent = `${S.cr.toLocaleString()} cr · speed ${Math.round(shipModOf(k, 'sp') * 100)}% · hull ${Math.round(shipModOf(k, 'hull') * 100)}% · guns ${Math.round(shipModOf(k, 'laser') * 100)}%`;
    listOf(tab).forEach((it, i) => { const own = owned(tab, i), on = (C[tab] | 0) === i, cost = (tab === 'p' || tab === 'a' || tab === 'x') ? 0 : it[1], r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = tab === 'lc' ? LASER_COLS[i][1] : (tab === 'p' || tab === 'a' || tab === 'x') ? (it[1] === 'rainbow' ? 'linear-gradient(90deg,#ff2a3a,#ffd36a,#7fff6a)' : it[1] || S.col) : on ? '#6fdc5a' : '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = it[0] + (statTxt(it[2]) ? ` · ${statTxt(it[2])}` : '');
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; mt.textContent = on ? 'Fitted' : own ? 'Owned' : cost ? cost.toLocaleString() + ' cr' : 'Scavenge';
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = on ? '✓' : own ? 'Fit' : cost ? 'Buy' : '🔒'; b.disabled = on || (!own && !cost);
      b.addEventListener('click', () => { if (!own) { if (S.cr < cost) { toast('NOT ENOUGH CREDITS', `${cost.toLocaleString()} cr`, 1.4); return; } S.cr -= cost; C.own[tab + i] = 1; SFX.coin(); }
        C[tab] = i; markDirty(); SFX.item(); if (shipCls() === k) scRefit(); render(); pv(); });
      r.style.cursor = 'pointer'; r.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') return; pv({ [tab]: i }, it[0]); });
      r.append(dot, nm, mt, b); rows.appendChild(r); }); };
  $('dlgActs').before(rows); acts([...tabs.map(([t, n], j) => [n, () => { tab = t; render(); }, j === 0]), ['Back', () => { closeDlg(); openShipMods(); }], ['Done', closeDlg]]); render(); showPreviewIn(rows); pv();
}
function shipModOf(k, stat) { const c = scS().cur; scS().cur = k; const v = shipMod(stat); scS().cur = c; return v; }

// other pilots see your real ship: the class rides along in the presence look code
{ const _c = smCode, _p = smParse;
  smCode = M => { const c = shipCls(); const C = scS().cfg[c]; return 'c:' + c + ':' + ['p', 'a', 'st', 'x', ...Object.keys(SHIP_CLASSES[c].slots)].map(k => C[k] | 0).join('.'); };
  smParse = code => { const s = String(code || ''); if (!s.startsWith('c:')) return _p(s); const [, c, v] = s.split(':'); if (!SHIP_CLASSES[c]) return _p(''); const n = (v || '').split('.').map(Number), o = { cls: c };
    ['p', 'a', 'st', 'x', ...Object.keys(SHIP_CLASSES[c].slots)].forEach((k, i) => { const max = k === 'st' ? PAINT_STYLES.length : k === 'p' ? SHIP_PAINTS.length : k === 'a' ? SHIP_ACCENTS.length : k === 'x' ? SHIP_EXHAUST.length : SHIP_CLASSES[c].slots[k][1].length; o[k] = clamp(n[i] | 0, 0, max - 1); }); return o; }; }
