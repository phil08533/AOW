// =================== SHIP CLASSES: buy a Fighter or a Miner, tune them in the garage, Need for Speed style ===================
// Room to grow: a new class is one entry in SHIP_CLASSES (stats, flight feel, slots) plus a builder in SC_BUILD.
const PAINT_STYLES = [['Solid', 0], ['Two-tone', 0], ['Racing stripes', 2500], ['Flames', 4000], ['Camo', 3000], ['Hazard', 2000], ['Checker', 3500], ['Tiger', 4500], ['Carbon', 5000]];
const SHIP_CLASSES = {
  starter: { name: 'Setting Sun', blurb: 'Your trusty starter. Balanced, a bit floaty.', cost: 0, stat: {}, grip: 1, strafe: 0.4 },
  fighter: { name: 'Viper Fighter', blurb: 'Built to dogfight. Side thrusters let it strafe, climb and stop on a dime.', cost: 25000, stat: { sp: 0.15, laser: 0.3 }, grip: 1.4, strafe: 1, lift: true, rcs: true,
    slots: {
      wing: ['Wings', [['Swept blades', 0, {}], ['Forward-swept', 3000, { sp: 0.04 }], ['Delta', 4000, { sp: 0.03, hull: 0.04 }], ['Quad X-wing', 7000, { laser: 0.08 }]]],
      eng: ['Engines', [['Twin afterburners', 0, {}], ['Single pulse', 3500, { sp: 0.06 }], ['Quad cluster', 6000, { sp: 0.1, hull: -0.04 }]]],
      nose: ['Nose', [['Needle', 0, {}], ['Shark mouth', 2500, { hull: 0.04 }], ['Twin prong', 3500, { laser: 0.05 }]]],
      wpn: ['Guns', [['Twin cannons', 0, {}], ['Gatling pods', 5000, { laser: 0.1 }], ['Missile racks', 6500, { laser: 0.14, sp: -0.02 }]]],
      kit: ['Body kit', [['Stock', 0, {}], ['Spoiler fins', 2000, { sp: 0.02 }], ['Side skirts', 2000, { hull: 0.04 }], ['Canards', 3000, { sp: 0.03 }]]]
    } },
  miner: { name: 'Bulldog Miner', blurb: 'A flying bunker. Huge hull, shrugs off fire, tears through asteroids for extra ore.', cost: 20000, stat: { hull: 0.8, sp: -0.15, laser: -0.1 }, grip: 0.8, strafe: 0.6, lift: true, mine: 2.5, ore: 1.5, armor: 0.45,
    slots: {
      drill: ['Drills', [['Twin drills', 0, {}], ['Big auger', 4000, { mine: 0.6 }], ['Claw arms', 3000, { ore: 0.3 }]]],
      armor: ['Armor', [['Plated', 0, {}], ['Heavy slab', 4500, { hull: 0.25, sp: -0.05 }], ['Cage frame', 3000, { hull: 0.1, sp: 0.03 }]]],
      eng: ['Engines', [['Hauler twins', 0, {}], ['Quad thrusters', 4000, { sp: 0.1 }]]],
      hopper: ['Cargo', [['Ore bins', 0, {}], ['Tank pods', 3000, { ore: 0.2 }], ['Container rack', 5000, { ore: 0.35, sp: -0.03 }]]],
      lights: ['Lights', [['Floodlights', 0, {}], ['Light bar', 1500, {}], ['Lights off', 0, {}]]]
    } }
};
function scS() { S.scl = S.scl || { cur: 'starter', own: { starter: 1 }, cfg: {} }; const Q = S.scl; Q.own = Q.own || { starter: 1 }; Q.cfg = Q.cfg || {};
  for (const k in SHIP_CLASSES) if (k !== 'starter' && !Q.cfg[k]) { const c = { p: k === 'miner' ? 5 : 3, a: k === 'miner' ? 3 : 1, st: k === 'miner' ? 5 : 2, x: 0, own: {} }; for (const s in SHIP_CLASSES[k].slots) c[s] = 0; Q.cfg[k] = c; }
  if (!SHIP_CLASSES[Q.cur] || !Q.own[Q.cur]) Q.cur = 'starter'; return Q; }
const shipCls = () => scS().cur, shipClsDef = () => SHIP_CLASSES[shipCls()];
function scPartStat(cls, cfg, stat) { const D = SHIP_CLASSES[cls]; let m = (D.stat[stat] || 0); for (const s in D.slots || {}) { const P = D.slots[s][1][cfg[s] || 0]; if (P && P[2][stat]) m += P[2][stat]; } return m; }
// stats: class + its fitted parts. The starter keeps the old customizer's bonuses.
{ const _sm = shipMod; shipMod = function (stat) { const c = shipCls(); if (c === 'starter') return _sm(stat); return Math.max(0.3, 1 + scPartStat(c, scS().cfg[c], stat)); }; }
shipGrip = () => 1.6 * SHIP_SYS.thrust.lv[sysLv('thrust')].grip * shipClsDef().grip;
shipStrafe = () => shipClsDef().strafe;
shipLift = () => !shipClsDef().lift ? 0 : clamp((keys.Space || (typeof jetHeld !== 'undefined' && jetHeld) ? 1 : 0) - (keys.KeyX ? 1 : 0), -1, 1);
shipMineMul = () => { const c = shipCls(), D = SHIP_CLASSES[c]; return (D.mine || 1) + (c !== 'starter' ? scPartStat(c, scS().cfg[c], 'mine') : 0); };
shipOreMul = () => { const c = shipCls(), D = SHIP_CLASSES[c]; return (D.ore || 1) + (c !== 'starter' ? scPartStat(c, scS().cfg[c], 'ore') : 0); };
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

// ---------- the two ships ----------
const SC_BUILD = {
  fighter(g, C, hull, acc, dk, eg) {
    const glass = glow('#8fd0ff'), steel = '#cfd3d8', rcs = [];
    // fuselage: a long wedge with a raised spine
    part(g, B(1.5, 0.8, 5.6), hull, 0, 0, 0.2); const top = part(g, B(1.0, 0.5, 4.2), hull, 0, 0.55, 0.6); part(g, B(0.3, 0.12, 4.6), acc, 0, 0.84, 0.6);
    part(g, B(0.9, 0.45, 1.4), glass, 0, 0.7, -1.7, 0.18); part(g, B(1.0, 0.08, 1.5), dk, 0, 0.94, -1.6, 0.18);
    for (const s of [-1, 1]) { part(g, B(0.35, 0.5, 1.6), dk, 0.85 * s, -0.05, -0.4); part(g, B(0.3, 0.42, 0.08), '#111', 0.86 * s, -0.05, -1.22); }
    // nose
    if (C.nose === 1) { part(g, B(1.3, 0.5, 1.6), hull, 0, -0.1, -3.2, 0.12); for (let i = 0; i < 6; i++) part(g, new THREE.ConeGeometry(0.06, 0.2, 3), '#ffffff', -0.5 + i * 0.2, -0.32, -3.9, Math.PI); E(g, glow('#ff2a3a'), 0.45, 0.1, -3.4, 0.08, 0.08, 0.08); E(g, glow('#ff2a3a'), -0.45, 0.1, -3.4, 0.08, 0.08, 0.08); }
    else if (C.nose === 2) for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.22, 2.4, 6), hull, 0.45 * s, 0, -3.6, -Math.PI / 2);
    else { part(g, new THREE.ConeGeometry(0.75, 3.2, 4), hull, 0, 0, -4.0, -Math.PI / 2, Math.PI / 4); part(g, Cy(0.03, 0.03, 1.2, 4), steel, 0, 0, -6.0, Math.PI / 2); }
    for (const s of [-1, 1]) {
      // wings
      if (C.wing === 1) { const w = part(g, B(3.6, 0.14, 1.4), hull, 2.1 * s, -0.1, 0.2, 0, -0.4 * s, 0); part(g, B(0.9, 0.16, 1.5), acc, 3.6 * s, -0.1, -0.4, 0, -0.4 * s, 0); }
      else if (C.wing === 2) { const sh = new THREE.Shape(); sh.moveTo(0, -1.6); sh.lineTo(4.2, 2.2); sh.lineTo(0.6, 2.4); sh.lineTo(0, -1.6); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: false }); geo.rotateX(Math.PI / 2); const w = part(g, geo, hull, 0.6 * s, 0, 0.2); w.scale.x = s; part(g, B(3.2, 0.18, 0.18), acc, 2.4 * s, 0.01, 1.8, 0, -0.62 * s, 0); }
      else if (C.wing === 3) for (const y of [-1, 1]) { const w = part(g, B(3.4, 0.12, 1.2), hull, 2.1 * s, 0.25 * y, 1.2, 0, 0, 0.32 * y * s); part(g, Cy(0.12, 0.12, 1.4, 6), dk, 3.6 * s, 0.25 * y + 0.48 * y, 1.0, Math.PI / 2); part(g, B(0.8, 0.14, 1.25), acc, 3.4 * s, 0.25 * y + 0.4 * y, 1.2, 0, 0, 0.32 * y * s); }
      else { const w = part(g, B(3.8, 0.14, 1.5), hull, 2.2 * s, -0.1, 1.2, 0, 0.5 * s, -0.06 * s); part(g, B(1.1, 0.16, 1.6), acc, 3.8 * s, -0.22, 2.0, 0, 0.5 * s, -0.06 * s); part(g, B(0.1, 0.5, 0.9), hull, 3.9 * s, 0.1, 2.0); }
      // guns
      if (C.wpn === 1) { part(g, Cy(0.22, 0.22, 1.4, 8), dk, 1.4 * s, -0.5, -0.8, Math.PI / 2); for (let k = 0; k < 4; k++) part(g, Cy(0.04, 0.04, 1.2, 4), steel, 1.4 * s + Math.cos(k * 1.57) * 0.11, -0.5 + Math.sin(k * 1.57) * 0.11, -1.9, Math.PI / 2); }
      else if (C.wpn === 2) { part(g, B(0.5, 0.35, 1.8), dk, 1.5 * s, -0.45, 0.2); for (let k = 0; k < 4; k++) part(g, new THREE.ConeGeometry(0.08, 0.35, 6), '#c8402f', 1.38 * s + (k % 2) * 0.24 * s, -0.36 - (k > 1 ? 0.18 : 0), -0.85, -Math.PI / 2); }
      else { part(g, Cy(0.08, 0.1, 3.0, 6), dk, 1.2 * s, -0.35, -1.6, Math.PI / 2); part(g, Cy(0.05, 0.05, 0.4, 6), glow('#ff6a3a'), 1.2 * s, -0.35, -3.1, Math.PI / 2); }
      // engines
      if (C.eng === 2) for (const y of [-0.35, 0.35]) { part(g, Cy(0.32, 0.38, 1.8, 8), dk, 0.6 * s, y, 3.2, Math.PI / 2); part(g, Cy(0.26, 0.26, 0.1, 8), glow(eg), 0.6 * s, y, 4.12, Math.PI / 2); }
      else if (C.eng === 1) { if (s > 0) { part(g, Cy(0.7, 0.85, 2.2, 10), dk, 0, 0, 3.4, Math.PI / 2); part(g, Cy(0.62, 0.62, 0.1, 10), glow(eg), 0, 0, 4.52, Math.PI / 2); part(g, new THREE.TorusGeometry(0.75, 0.06, 4, 14), acc, 0, 0, 4.4); } }
      else { part(g, Cy(0.42, 0.5, 2.0, 8), dk, 0.65 * s, 0, 3.3, Math.PI / 2); part(g, Cy(0.36, 0.36, 0.1, 8), glow(eg), 0.65 * s, 0, 4.32, Math.PI / 2); part(g, Cy(0.44, 0.44, 0.12, 8), steel, 0.65 * s, 0, 4.25, Math.PI / 2); }
      // body kit
      if (C.kit === 1) { const f = part(g, B(0.1, 1.0, 1.0), hull, 0.55 * s, 1.0, 2.8, 0, 0, -0.35 * s); part(g, B(1.6, 0.08, 0.5), acc, 0, 1.45, 3.1); }
      else if (C.kit === 2) part(g, B(0.12, 0.3, 4.4), acc, 0.8 * s, -0.42, 0.2);
      else if (C.kit === 3) { part(g, B(1.2, 0.08, 0.5), hull, 0.9 * s, 0.1, -2.6, 0, 0.4 * s); part(g, B(0.4, 0.09, 0.5), acc, 1.4 * s, 0.1, -2.7, 0, 0.4 * s); }
      // side thruster pods (RCS): nozzles point out to each side, up and down, fore and aft
      for (const z of [-2.2, 2.4]) { part(g, B(0.3, 0.3, 0.4), dk, 0.85 * s, 0.25, z); part(g, B(0.32, 0.06, 0.42), acc, 0.86 * s, 0.42, z);
        for (const d of [V(s, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, z < 0 ? -1 : 1)]) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 6), glow('#bfe8ff')); fl.material = fl.material.clone(); fl.material.transparent = true; fl.material.opacity = 0.85; fl.material.blending = THREE.AdditiveBlending; fl.material.depthWrite = false;
          fl.position.set(0.85 * s + d.x * 0.3, 0.25 + d.y * 0.3, z + d.z * 0.3); fl.quaternion.setFromUnitVectors(V(0, -1, 0), d); fl.geometry = fl.geometry.clone().translate(0, -0.35, 0); fl.scale.setScalar(0.001); g.add(fl); rcs.push({ m: fl, d }); } }
    }
    // detail pass: wingtip nav lights, panel greebles, intake glow, canopy frame, vents
    for (const s of [-1, 1]) { E(g, glow(s < 0 ? '#ff3a2a' : '#6fdc5a'), 3.9 * s, 0.05, 1.6, 0.1, 0.1, 0.1); part(g, B(0.28, 0.3, 0.06), glow('#ff8a3a'), 0.86 * s, -0.05, -1.25);
      for (let i = 0; i < 4; i++) part(g, B(0.18, 0.06, 0.4), dk, 0.45 * s, 0.82, -0.6 + i * 0.9); for (let i = 0; i < 3; i++) part(g, B(0.05, 0.22, 0.5), '#16181c', 0.76 * s, 0.1, 1.4 + i * 0.6); part(g, B(0.06, 0.06, 1.6), steel, 0.48 * s, 0.94, -1.6, 0.18); }
    part(g, B(1.0, 0.06, 0.06), steel, 0, 0.98, -1.0); part(g, B(0.5, 0.25, 0.8), dk, 0, -0.5, 1.2); E(g, glow('#4fd2ff'), 0, -0.64, 1.2, 0.18, 0.05, 0.3);
    // little details: antenna, lights
    part(g, Cy(0.02, 0.02, 0.8, 4), dk, 0.3, 1.2, 1.8); E(g, glow('#ff3a2a'), 0, 0.92, 3.0, 0.07, 0.07, 0.07);
    g.userData.rcs = rcs;
  },
  miner(g, C, hull, acc, dk, eg) {
    const steel = '#9aa1aa', y = '#ffd36a';
    // a chunky box body with a cab up front
    part(g, B(2.6, 1.8, 5.4), hull, 0, 0, 0.6); part(g, B(2.0, 1.2, 1.6), hull, 0, 0.4, -2.6); part(g, B(1.7, 0.7, 0.1), glow('#8fd0ff'), 0, 0.6, -3.42, 0.2);
    for (let i = 0; i < 3; i++) part(g, B(1.8, 0.06, 0.12), dk, 0, 0.35 + i * 0.22, -3.47);
    // armor
    if (C.armor === 1) for (const s of [-1, 1]) { part(g, B(0.4, 2.2, 5.8), dk, 1.45 * s, 0, 0.6); for (let k = 0; k < 4; k++) part(g, B(0.42, 0.08, 0.08), y, 1.46 * s, 0.8, -1.6 + k * 1.4); }
    else if (C.armor === 2) for (const s of [-1, 1]) { for (let k = 0; k < 5; k++) part(g, B(0.08, 2.0, 0.08), steel, 1.4 * s, 0, -1.6 + k * 1.1); for (const yy of [-0.9, 0.9]) part(g, B(0.08, 0.08, 5.0), steel, 1.4 * s, yy, 0.6); }
    else for (const s of [-1, 1]) { part(g, B(0.2, 1.4, 4.6), dk, 1.38 * s, 0, 0.6); for (let k = 0; k < 6; k++) E(g, steel, 1.5 * s, 0.55 * (k % 2 ? 1 : -1), -1.2 + Math.floor(k / 2) * 1.8, 0.06, 0.06, 0.06); }
    // drills on the nose
    const spin = [];
    if (C.drill === 1) { const d = new THREE.Group(); d.position.set(0, -0.3, -3.6); g.add(d); part(d, new THREE.ConeGeometry(0.8, 2.6, 8), steel, 0, 0, -1.3, -Math.PI / 2); for (let k = 0; k < 4; k++) { const r = part(d, new THREE.TorusGeometry(0.62 - k * 0.14, 0.06, 4, 10), y, 0, 0, -0.4 - k * 0.55); } spin.push(d); part(g, Cy(0.9, 0.9, 0.4, 10), dk, 0, -0.3, -3.5, Math.PI / 2); }
    else if (C.drill === 2) for (const s of [-1, 1]) { part(g, B(0.25, 0.25, 2.2), dk, 1.0 * s, -0.6, -3.4); for (const k of [-1, 1]) part(g, B(0.12, 0.12, 0.8), steel, 1.0 * s + k * 0.18, -0.6, -4.7, 0, -k * s * 0.4); E(g, glow('#ff8a3a'), 1.0 * s, -0.6, -4.4, 0.1, 0.1, 0.1); }
    else for (const s of [-1, 1]) { part(g, B(0.3, 0.3, 1.8), dk, 0.9 * s, -0.5, -3.3); const d = new THREE.Group(); d.position.set(0.9 * s, -0.5, -4.3); g.add(d); part(d, new THREE.ConeGeometry(0.38, 1.6, 6), steel, 0, 0, -0.6, -Math.PI / 2); part(d, new THREE.TorusGeometry(0.3, 0.05, 4, 8), y, 0, 0, -0.1); spin.push(d); }
    // mining laser dish underneath
    part(g, Cy(0.5, 0.2, 0.3, 10), dk, 0, -1.05, -1.6); E(g, glow('#6fdc5a'), 0, -1.2, -1.6, 0.16, 0.08, 0.16);
    // cargo
    if (C.hopper === 1) for (const s of [-1, 1]) { part(g, Cy(0.55, 0.55, 3.4, 10), steel, 0.8 * s, 1.35, 1.2, Math.PI / 2); part(g, Cy(0.57, 0.57, 0.1, 10), y, 0.8 * s, 1.35, 0.0, Math.PI / 2); }
    else if (C.hopper === 2) { part(g, B(2.4, 0.15, 3.6), dk, 0, 1.0, 1.2); for (let k = 0; k < 3; k++) part(g, B(2.0, 0.9, 1.0), ['#c8402f', '#3a6cb8', '#6f7a3e'][k], 0, 1.55, 0.0 + k * 1.15); }
    else for (let k = 0; k < 2; k++) { part(g, B(1.0, 0.8, 1.4), dk, (k ? 0.6 : -0.6), 1.3, 1.6); part(g, B(0.9, 0.2, 1.3), '#7a6a5a', (k ? 0.6 : -0.6), 1.62, 1.6); }
    // lights
    if (C.lights === 0) for (const s of [-1, 1]) { part(g, B(0.4, 0.3, 0.2), dk, 0.75 * s, 1.1, -2.9); part(g, B(0.3, 0.2, 0.05), glow('#fff6d0'), 0.75 * s, 1.1, -3.02); }
    else if (C.lights === 1) { part(g, B(1.9, 0.18, 0.2), dk, 0, 1.12, -2.6); for (let k = 0; k < 6; k++) part(g, B(0.22, 0.12, 0.05), glow(k % 2 ? '#fff6d0' : '#ffb347'), -0.75 + k * 0.3, 1.12, -2.72); }
    E(g, glow('#ffb347'), 0, 1.1, 2.6, 0.14, 0.14, 0.14);
    // detail pass: rivet rows, a side hatch, ladder rungs, beacons and a cable spool
    for (const s of [-1, 1]) { for (let i = 0; i < 8; i++) E(g, steel, 1.32 * s, -0.75, -1.8 + i * 0.75, 0.05, 0.05, 0.05); part(g, B(0.06, 1.1, 0.9), '#3a3d44', 1.32 * s, 0.05, 2.4); part(g, B(0.07, 0.12, 0.5), y, 1.33 * s, 0.7, 2.4);
      for (let i = 0; i < 4; i++) part(g, B(0.05, 0.05, 0.4), steel, 1.34 * s, -0.6 + i * 0.3, 1.4); E(g, glow(s < 0 ? '#ff3a2a' : '#6fdc5a'), 1.35 * s, 0.95, -1.9, 0.09, 0.09, 0.09); }
    part(g, Cy(0.35, 0.35, 0.6, 10), '#3a3d44', 0, 1.0, 3.2, 0, 0, Math.PI / 2); part(g, new THREE.TorusGeometry(0.36, 0.08, 4, 10), y, 0, 1.0, 3.2, 0, Math.PI / 2); part(g, B(2.2, 0.1, 0.1), y, 0, 0.92, -1.75);
    // engines
    for (const s of [-1, 1]) { const ys = C.eng === 1 ? [-0.45, 0.45] : [0]; for (const yy of ys) { const r = C.eng === 1 ? 0.38 : 0.6; part(g, Cy(r, r + 0.1, 1.4, 8), dk, 0.85 * s, yy, 3.8, Math.PI / 2); part(g, Cy(r - 0.06, r - 0.06, 0.1, 8), glow(eg), 0.85 * s, yy, 4.52, Math.PI / 2); } }
    g.userData.spin = spin;
  }
};
function makeClassShip(cls, C, col) {
  const g = new THREE.Group(), base = (SHIP_PAINTS[C.p] || SHIP_PAINTS[0])[1], acc = (SHIP_ACCENTS[C.a] || SHIP_ACCENTS[0])[1] || col || '#ff8a2a', ex = (SHIP_EXHAUST[C.x | 0] || SHIP_EXHAUST[0])[1], eg = ex === 'rainbow' ? '#ff9a3c' : ex;
  SC_BUILD[cls](g, C, scPaintMat(base, acc, C.st | 0), acc, '#2a2d33', eg);
  g.userData.engines = g.children.filter(m => m.material === glow(eg)); g.userData.cls = cls;
  return g;
}
{ const _mk = makeStarship; makeStarship = function (col, cfgIn) {
  if (cfgIn && cfgIn.cls) return cfgIn.cls === 'starter' ? scStarterDetail(_mk(col, cfgIn.sm)) : makeClassShip(cfgIn.cls, cfgIn, col);
  const c = shipCls(); if (!cfgIn && c !== 'starter') return makeClassShip(c, scS().cfg[c], col);
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
  if (U.spin) U.spin.forEach((d, i) => { d.rotation.z += dt * (6 + i); });
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
    for (const k in SHIP_CLASSES) { const D = SHIP_CLASSES[k], own = Q.own[k], on = Q.cur === k, r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = on ? '#6fdc5a' : own ? '#4fd2ff' : '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = `${D.name} · ${D.blurb}`; const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; mt.textContent = on ? 'Flying' : own ? 'Owned' : D.cost.toLocaleString() + ' cr';
      const b1 = document.createElement('button'); b1.className = 'pbtn'; b1.style.padding = '5px 10px'; b1.textContent = own ? (on ? 'Garage' : 'Fly') : 'Buy';
      b1.addEventListener('click', () => { if (!own) { scBuy(k); render(); return; } if (!on) { Q.cur = k; markDirty(); SFX.item(); scRefit(); render(); pv(); return; } closeDlg(); k === 'starter' ? _origShipMods() : scGarage(k); });
      r.style.cursor = 'pointer'; r.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') return; setPreview(() => { const g = makeStarship(S.col, k === 'starter' ? { cls: 'starter' } : Object.assign({ cls: k }, Q.cfg[k])); g.rotation.set(0.4, Math.PI * 0.75, 0); return g; }, D.name, 1.5) });
      r.append(dot, nm, mt, b1); rows.appendChild(r); } };
  const pv = () => setPreview(() => { const g = makeStarship(S.col); g.rotation.set(0.4, Math.PI * 0.75, 0); return g; }, SHIP_CLASSES[Q.cur].name, 1.5)
  $('dlgActs').before(rows); acts([['Garage', () => { closeDlg(); Q.cur === 'starter' ? _origShipMods() : scGarage(Q.cur); }, true], ['Done', closeDlg]]); render(); showPreviewIn(rows); pv(); };
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
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = (tab === 'p' || tab === 'a' || tab === 'x') ? (it[1] === 'rainbow' ? 'linear-gradient(90deg,#ff2a3a,#ffd36a,#7fff6a)' : it[1] || S.col) : on ? '#6fdc5a' : '#9aa1aa';
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
  smCode = M => { const c = shipCls(); if (c === 'starter') return _c(M); const C = scS().cfg[c]; return 'c:' + c + ':' + ['p', 'a', 'st', 'x', ...Object.keys(SHIP_CLASSES[c].slots)].map(k => C[k] | 0).join('.'); };
  smParse = code => { const s = String(code || ''); if (!s.startsWith('c:')) return _p(s); const [, c, v] = s.split(':'); if (!SHIP_CLASSES[c] || c === 'starter') return _p(''); const n = (v || '').split('.').map(Number), o = { cls: c };
    ['p', 'a', 'st', 'x', ...Object.keys(SHIP_CLASSES[c].slots)].forEach((k, i) => { const max = k === 'st' ? PAINT_STYLES.length : k === 'p' ? SHIP_PAINTS.length : k === 'a' ? SHIP_ACCENTS.length : k === 'x' ? SHIP_EXHAUST.length : SHIP_CLASSES[c].slots[k][1].length; o[k] = clamp(n[i] | 0, 0, max - 1); }); return o; }; }
