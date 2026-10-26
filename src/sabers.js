// ---------------- laser swords, gun/melee hands, offhand shield ----------------
Object.assign(MELEE, {
  lsaber: { name: 'Laser Sword', dmg: 280, rate: 0.45, reach: 3.0, req: 12, price: 4500, saber: true },
  lsaber2: { name: 'Prism Laser Sword', dmg: 460, rate: 0.42, reach: 3.2, req: 24, price: 14000, saber: true }
});

const SABER_COLS = { blue: '#4fa8ff', green: '#6fdc5a', red: '#ff3b2a', purple: '#c86aff', yellow: '#ffe14a', orange: '#ff9a3c', cyan: '#4fffe0', white: '#f4f8ff', pink: '#ff6aa8' };
// metal and trim colours for the hilt parts
const SABER_TRIM = { steel: '#b8bcc4', gunmetal: '#4a4f58', black: '#1e1c22', gold: '#c9a43a', copper: '#b8693a', bone: '#e8e4dc', crimson: '#a8322a', navy: '#2f5aa8', jade: '#3a7a4a', violet: '#6a3a8a' };
// one crystal on every world, each its own shape, colour and perk; found out in the world, then set in the core chamber
const SABER_CRYSTALS = {
  earth: { name: 'Terran Quartz', col: '#6fdc5a', shape: 'shard', dmg: 0.04, desc: 'Steady and green. A little extra bite.' },
  skycity: { name: 'Cloudglass', col: '#e8f4ff', shape: 'orb', spd: 0.04, desc: 'Light as air. Faster swings.' },
  zeltac: { name: 'Zeltac Amber', col: '#ffb347', shape: 'cube', block: 0.08, desc: 'Dense and warm. Blocks hold longer.' },
  mezar: { name: 'Sunstone', col: '#ffd23a', shape: 'prism', dmg: 0.05, desc: 'Burns bright. More damage.' },
  capitone: { name: 'Frostspar', col: '#9fe8ff', shape: 'cluster', spd: 0.03, block: 0.04, desc: 'Cold and quick, and tough.' },
  robot: { name: 'Circuit Garnet', col: '#ff3b2a', shape: 'chip', dmg: 0.06, spd: -0.01, desc: 'Hums with current. Heavy hits.' },
  ocean: { name: 'Tide Pearl', col: '#4fffe0', shape: 'pearl', reach: 0.2, desc: 'Pulls the beam a little further.' },
  moon: { name: 'Moonstone', col: '#c8c8ff', shape: 'disc', block: 0.06, spd: 0.02, desc: 'Calm. Light on the wrist and the shield.' },
  zarlich: { name: 'Void Jet', col: '#c86aff', shape: 'spike', dmg: 0.08, spd: -0.03, desc: 'Dark and heavy. Big hits, slower swings.' },
  vector: { name: 'Vector Shard', col: '#ff6aa8', shape: 'tetra', spd: 0.06, dmg: -0.02, desc: 'Sharp angles, very fast.' },
  speedway: { name: 'Velocity Ruby', col: '#ff6a1a', shape: 'needle', spd: 0.05, desc: 'Born in the canyon wind. Fast.' },
  arena: { name: "Champion's Topaz", col: '#ffe14a', shape: 'crown', dmg: 0.04, reach: 0.1, desc: 'Won in blood and sand.' }
};
// ---- the forge: each slot has its own parts and its own colour. Stats are small trade-offs: spd = faster swings, dmg, reach (m), block (less shield drain)
const SABER_SLOTS = {
  blade: { name: 'Blade', colors: 'glow', parts: {
    beam: { name: 'Beam', desc: 'A clean round beam. No surprises.' },
    edge: { name: 'Cleaver Edge', desc: 'A flat, wide energy slab with a chisel tip.', dmg: 0.08, spd: -0.04, cost: { cr: 2500, scrap: 6 } },
    wave: { name: 'Ripple', desc: 'A beam that bulges in knots along its length.', dmg: 0.05, reach: 0.1, cost: { cr: 3500, circuit: 4 } },
    needle: { name: 'Needle', desc: 'Long and tapering to a point.', reach: 0.5, dmg: -0.06, cost: { cr: 3000, crystal: 3 } },
    twin: { name: 'Twin Rail', desc: 'Two thin beams side by side, sparking between them.', dmg: 0.12, spd: -0.06, cost: { cr: 6000, starcrystal: 2 } },
    crescent: { name: 'Crescent', desc: 'A beam bent into a shallow arc.', reach: 0.2, spd: 0.03, cost: { cr: 5000, icecore: 2 } },
    stub: { name: 'Stub', desc: 'Short and quick.', spd: 0.12, reach: -0.6, dmg: -0.05 } } },
  core: { name: 'Crystal', parts: Object.assign({ plain: { name: 'Plain Lens', desc: 'A clear starter lens. Find planet crystals to replace it.' } }, SABER_CRYSTALS) },
  emit: { name: 'Emitter', colors: 'trim', parts: {
    coil: { name: 'Coil', desc: 'Stacked rings around the beam.' },
    fins: { name: 'Fins', desc: 'Four swept vanes that vent heat.', spd: 0.03, cost: { cr: 1800, scrap: 5 } },
    claw: { name: 'Claw', desc: 'Three prongs gripping the beam.', dmg: 0.05, cost: { cr: 2600, circuit: 4 } },
    cowl: { name: 'Cowl', desc: 'A slanted hood plate on one side.', block: 0.08, cost: { cr: 2200, scrap: 6 } },
    bell: { name: 'Bell', desc: 'A wide flared mouth.', reach: 0.15, cost: { cr: 2400, icecore: 1 } },
    halo: { name: 'Halo', desc: 'A floating ring held off the hilt.', spd: 0.02, dmg: 0.02, cost: { cr: 5000, pearl: 1 } } } },
  grip: { name: 'Grip', colors: 'trim', parts: {
    ribbed: { name: 'Ribbed', desc: 'Plain ribbed grip.' },
    twist: { name: 'Twist Wrap', desc: 'A spiral wrap for a quick wrist.', spd: 0.06, cost: { cr: 2200, scrap: 4 } },
    knuckle: { name: 'Knuckle Bow', desc: 'A D-shaped guard over your fingers.', block: 0.15, spd: -0.02, cost: { cr: 2800, scrap: 8 } },
    pole: { name: 'Long Haft', desc: 'A long two-hand haft.', reach: 0.25, dmg: 0.05, spd: -0.05, cost: { cr: 3500, circuit: 4 } },
    scale: { name: 'Scale Grip', desc: 'Overlapping plates like armour.', dmg: 0.03, block: 0.05, cost: { cr: 3000, icecore: 1 } },
    bound: { name: 'Ring-bound', desc: 'Bare grip held by thick bands.', spd: 0.04, cost: { cr: 1600, scrap: 3 } },
    fluted: { name: 'Fluted', desc: 'Machined ridges that run the length of the grip.', spd: 0.03, block: 0.03, cost: { cr: 2400, circuit: 3 } },
    cage: { name: 'Open Cage', desc: 'A wire cage around a core that glows with your blade.', dmg: 0.04, spd: 0.02, cost: { cr: 4500, cell: 2 } },
    carved: { name: 'Carved Wood', desc: 'Dark hardwood with metal caps. Warm in the hand.', block: 0.06, cost: { cr: 2000, pelt: 3 } } } },
  pom: { name: 'Pommel', colors: 'trim', parts: {
    cap: { name: 'Cap', desc: 'A simple end cap.' },
    spike: { name: 'Spike', desc: 'A sharp point for backhand hits.', dmg: 0.05, cost: { cr: 1500, scrap: 4 } },
    ribbon: { name: 'Ribbon Cap', desc: 'A domed cap trailing two long ribbons.', spd: 0.03, block: 0.02, cost: { cr: 1400, pelt: 3 } },
    tassel: { name: 'Tassel', desc: 'A ribbon that trails your swings.', spd: 0.04, cost: { cr: 1200, pelt: 4 } },
    ring: { name: 'Ring', desc: 'A loop to hang it from your belt.', block: 0.05, cost: { cr: 1000, scrap: 3 } },
    weight: { name: 'Weight', desc: 'A heavy ball that adds momentum.', dmg: 0.03, spd: -0.02, cost: { cr: 1800, scrap: 6 } },
    fork: { name: 'Fork', desc: 'Two short prongs.', reach: 0.1, cost: { cr: 2000, circuit: 2 } } } }
};
// double-ended: the pommel comes off and a second emitter and blade take its place (bought once, then a free toggle)
const SABER_DUAL = { name: 'Double-ended', cost: { cr: 8000, circuit: 6, cell: 2 }, dmg: 0.1, spd: -0.03 };
const SABER_MODS = {
  focus: { name: 'Core Focus', desc: '+15% damage per tier', cost: [{ cr: 1500, crystal: 2 }, { cr: 4000, starcrystal: 2 }, { cr: 9000, starcrystal: 5, jellygel: 2 }] },
  grip: { name: 'Swing Speed', desc: '7% faster swings per tier', cost: [{ cr: 1200, scrap: 6 }, { cr: 3500, circuit: 6 }, { cr: 8000, cell: 3 }, { cr: 14000, cell: 5, starcrystal: 3 }, { cr: 22000, cell: 8, pearl: 4 }] },
  emitter: { name: 'Long Emitter', desc: '+0.35 m reach per tier', cost: [{ cr: 1000, circuit: 3 }, { cr: 3000, icecore: 2 }, { cr: 7000, pearl: 2 }] }
};
const saberMod = (k) => (S.saberMods && S.saberMods[k]) || 0;
const SABER_DEF = { blade: 'beam', col: 'blue', core: 'plain', emit: 'coil', emitCol: 'steel', grip: 'ribbed', gripCol: 'black', pom: 'cap', pomCol: 'steel', dual: false, blade2: 'beam', col2: 'blue', emit2: 'coil', emit2Col: 'steel' };
function saberCfg() { const s = S.saber || {}, c = Object.assign({}, SABER_DEF, s);
  // older saves picked one "hilt"; carry the look over
  if (s.hilt && !s.v2) { if (s.hilt === 'shoto') c.blade = 'stub'; if (s.hilt === 'ornate') c.gripCol = c.emitCol = c.pomCol = 'gold'; if (s.hilt === 'double') c.dual = true; c.col2 = c.col; }
  for (const k of ['blade', 'core', 'emit', 'grip', 'pom']) if (!SABER_SLOTS[k].parts[c[k]] || !saberOwns(k, c[k])) c[k] = SABER_DEF[k];
  if (!SABER_SLOTS.blade.parts[c.blade2] || !saberOwns('blade', c.blade2)) c.blade2 = 'beam'; if (!SABER_SLOTS.emit.parts[c.emit2] || !saberOwns('emit', c.emit2)) c.emit2 = 'coil';
  if (c.dual && !saberHasDual()) c.dual = false; return c; }
const saberHasDual = () => !!(S.saberParts && S.saberParts.dual) || !!(S.saber && S.saber.hilt === 'double' && !S.saber.v2);
function saberOwns(slot, id) { if (slot === 'core') return id === 'plain' || !!(S.saberCrystals && S.saberCrystals[id]); return !SABER_SLOTS[slot].parts[id].cost || !!(S.saberParts && S.saberParts[slot + ':' + id]); }
// the stat bonus of the parts you have on
function saberParts() { const c = saberCfg(), o = { spd: 0, dmg: 0, reach: 0, block: 0 }, add = P => { for (const s in o) o[s] += (P && P[s]) || 0; };
  for (const k of ['blade', 'core', 'emit', 'grip']) add(SABER_SLOTS[k].parts[c[k]]);
  if (c.dual) { add(SABER_DUAL); const b2 = SABER_SLOTS.blade.parts[c.blade2], e2 = SABER_SLOTS.emit.parts[c.emit2]; for (const s in o) o[s] += ((b2[s] || 0) + (e2[s] || 0)) * 0.5; } else add(SABER_SLOTS.pom.parts[c.pom]);
  return o; }
// a melee weapon's real numbers: laser swords add their parts and forge upgrades
function meleeStats(id) { const M0 = MELEE[id || S.melee || 'knife'] || MELEE.knife; if (!M0.saber) return M0; const p = saberParts(), c = saberCfg();
  return Object.assign({}, M0, { dmg: M0.dmg * (1 + 0.15 * saberMod('focus') + p.dmg), rate: Math.max(0.16, M0.rate * (1 - 0.07 * saberMod('grip')) / (1 + p.spd)), reach: Math.max(1.6, M0.reach + 0.35 * saberMod('emitter') + p.reach), block: Math.min(0.5, p.block), sweep: M0.sweep || c.dual }); }
const saberDesc = () => { const c = saberCfg(); return (c.dual ? 'Double-ended · ' : '') + ['blade', 'core', 'emit', 'grip'].map(k => SABER_SLOTS[k].parts[c[k]].name).join(' · ') + (c.dual ? '' : ' · ' + SABER_SLOTS.pom.parts[c.pom].name); };
const SABER_TASSELS = [];
function saberCrystalMesh(id, scale) { const C = SABER_CRYSTALS[id] || { col: '#dfefff', shape: 'shard' }, m = glow(C.col), g = new THREE.Group(), s = scale || 1, P = (geo, x, y, z, rx, ry, rz) => part(g, geo, m, x * s, y * s, z * s, rx, ry, rz);
  switch (C.shape) {
    case 'orb': P(new THREE.SphereGeometry(0.015 * s, 10, 8), 0, 0, 0); P(new THREE.TorusGeometry(0.019 * s, 0.002 * s, 4, 12), 0, 0, 0, Math.PI / 2); break;
    case 'cube': P(B(0.02 * s, 0.02 * s, 0.02 * s), 0, 0, 0, 0.6, 0.6, 0); break;
    case 'prism': P(new THREE.OctahedronGeometry(0.017 * s, 0), 0, 0, 0).scale.y = 1.5; break;
    case 'cluster': for (let i = 0; i < 3; i++) P(new THREE.OctahedronGeometry(0.009 * s, 0), Math.cos(i * 2.1) * 0.008, -0.006 + i * 0.006, Math.sin(i * 2.1) * 0.008, 0.3 * i, 0, 0.4 - i * 0.3).scale.y = 2; break;
    case 'chip': P(B(0.024 * s, 0.03 * s, 0.006 * s), 0, 0, 0); for (const y of [-0.008, 0, 0.008]) P(B(0.032 * s, 0.002 * s, 0.002 * s), 0, y, 0); break;
    case 'pearl': P(new THREE.SphereGeometry(0.017 * s, 12, 10), 0, 0, 0).scale.y = 0.85; break;
    case 'disc': P(Cy(0.018 * s, 0.018 * s, 0.006 * s, 14), 0, 0, 0, Math.PI / 2); break;
    case 'spike': P(new THREE.ConeGeometry(0.012 * s, 0.04 * s, 5), 0, 0.004, 0); P(new THREE.ConeGeometry(0.008 * s, 0.022 * s, 5), 0, -0.012, 0, Math.PI); break;
    case 'tetra': P(new THREE.TetrahedronGeometry(0.02 * s, 0), 0, 0, 0, 0.4, 0.3, 0); break;
    case 'needle': P(new THREE.OctahedronGeometry(0.008 * s, 0), 0, 0, 0).scale.y = 4.5; break;
    case 'crown': for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; P(new THREE.ConeGeometry(0.005 * s, 0.022 * s, 4), Math.cos(a) * 0.011, 0.002, Math.sin(a) * 0.011); } P(Cy(0.013 * s, 0.013 * s, 0.006 * s, 10), 0, -0.008, 0); break;
    default: P(new THREE.OctahedronGeometry(0.011 * s, 0), 0, 0, 0).scale.y = 2.6;
  }
  g.userData.spin = 1; return g; }
// one emitter and blade, built upward from the group's origin (the dual's lower head is the same build, flipped)
// hilt materials: smooth shiny metal and soft wrap, no grime texture
const SMAT = {};
const sMetal = hex => SMAT[hex] || (SMAT[hex] = new THREE.MeshPhongMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), specular: 0x9a9a9a, shininess: 70, side: THREE.DoubleSide }));
const sSoft = hex => SMAT['s' + hex] || (SMAT['s' + hex] = new THREE.MeshPhongMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), specular: 0x222222, shininess: 8, side: THREE.DoubleSide }));
const sLathe = (pts, seg) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg || 24);
const sCollar = () => sLathe([[0, 0], [0.026, 0], [0.0285, 0.003], [0.0285, 0.011], [0.026, 0.014], [0, 0.014]]);
const sHelix = (r, y0, y1, turns, tube, ph) => { const P = []; for (let i = 0; i <= 120; i++) { const t = i / 120, a = t * turns * Math.PI * 2 + (ph || 0); P.push(V(Math.cos(a) * r, y0 + t * (y1 - y0), Math.sin(a) * r)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 200, tube, 6); };
const sTag = (par, tag) => { for (const c of par.children) if (!c.userData.slot) c.userData.slot = tag; };
function saberHead(par, emit, emc, blade, col, tips, sfx) {
  sfx = sfx || ''; const g = new THREE.Group(); g.userData.slot = 'head' + sfx; par.add(g); const em = sMetal(SABER_TRIM[emc] || SABER_TRIM.steel), dark = sSoft('#16151a'), bc = SABER_COLS[col] || SABER_COLS.blue;
  const aura = (c, op) => { const m = glow(c).clone(); m.transparent = true; m.opacity = op; m.depthWrite = false; return m; };
  let eh = 0.05;
  switch (emit) {
    case 'fins': part(g, Cy(0.026, 0.022, eh, 8), em, 0, eh / 2, 0); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, f = part(g, B(0.006, 0.05, 0.026), em, Math.cos(a) * 0.03, eh * 0.6, Math.sin(a) * 0.03); f.rotation.order = 'YXZ'; f.rotation.set(0, -a, -0.35); } break;
    case 'claw': part(g, Cy(0.024, 0.026, 0.026, 8), em, 0, 0.013, 0); for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, p = part(g, B(0.008, 0.06, 0.008), em, Math.cos(a) * 0.026, 0.045, Math.sin(a) * 0.026); p.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); } eh = 0.03; break;
    case 'cowl': part(g, Cy(0.026, 0.026, eh, 8), em, 0, eh / 2, 0); part(g, B(0.05, 0.075, 0.006), em, 0, eh * 0.9, 0.028, -0.35, 0, 0); part(g, B(0.05, 0.006, 0.03), dark, 0, eh * 0.3, 0.018); break;
    case 'bell': part(g, Cy(0.04, 0.024, eh, 10), em, 0, eh / 2, 0); part(g, Cy(0.041, 0.041, 0.006, 10), dark, 0, eh - 0.003, 0); break;
    case 'halo': part(g, Cy(0.022, 0.026, 0.03, 8), em, 0, 0.015, 0); { const h = part(g, new THREE.TorusGeometry(0.04, 0.005, 5, 18), em, 0, 0.06, 0, Math.PI / 2); h.userData.spin = 2; for (let i = 0; i < 3; i++) { const a = i * 2.1; part(g, B(0.004, 0.035, 0.004), dark, Math.cos(a) * 0.03, 0.045, Math.sin(a) * 0.03); } } eh = 0.035; break;
    default: { const P = [[0, 0], [0.027, 0]]; for (let i = 0; i < 4; i++) { const y = 0.004 + i * 0.011; P.push([0.0275, y], [0.0305, y + 0.002], [0.0305, y + 0.007], [0.0275, y + 0.009]); } P.push([0.031, 0.048], [0.031, 0.05], [0.02, 0.05], [0.02, 0.046]); part(g, sLathe(P, 28), em, 0, 0, 0); part(g, Cy(0.02, 0.02, 0.003, 16), dark, 0, 0.047, 0); }
  }
  sTag(g, 'emit' + sfx); const b0 = eh; let len = 0.78, main = null;
  const beam = (l, r, x) => { part(g, Cy(r * 0.45, r * 0.45, l, 6), glow('#ffffff'), x || 0, b0 + l / 2, 0); const a = part(g, Cy(r, r, l + 0.02, 8), glow(bc), x || 0, b0 + l / 2, 0); a.material = aura(bc, 0.55); return a; };
  switch (blade) {
    case 'edge': { len = 0.74; part(g, B(0.05, len, 0.006), glow('#ffffff'), 0, b0 + len / 2, 0); main = part(g, B(0.09, len, 0.02), glow(bc), 0, b0 + len / 2, 0); main.material = aura(bc, 0.5);
      const tip = part(g, new THREE.ConeGeometry(0.064, 0.1, 4), glow(bc), 0, b0 + len + 0.05, 0, 0, Math.PI / 4, 0); tip.scale.z = 0.22; tip.material = aura(bc, 0.5); len += 0.08; break; }
    case 'wave': len = 0.8; main = beam(len, 0.02); for (let i = 0; i < 7; i++) { const k = part(g, new THREE.SphereGeometry(0.032, 8, 6), glow(bc), 0, b0 + 0.06 + i * 0.115, 0); k.scale.y = 1.6; k.material = aura(bc, 0.35); } break;
    case 'needle': { len = 1.0; part(g, new THREE.ConeGeometry(0.01, len, 6), glow('#ffffff'), 0, b0 + len / 2, 0); main = part(g, new THREE.ConeGeometry(0.03, len + 0.02, 8), glow(bc), 0, b0 + len / 2, 0); main.material = aura(bc, 0.55); break; }
    case 'twin': len = 0.8; main = beam(len, 0.016, -0.022); beam(len, 0.016, 0.022); for (let i = 0; i < 5; i++) part(g, B(0.044, 0.004, 0.004), glow('#ffffff'), 0, b0 + 0.1 + i * 0.15, 0, 0, 0, (i % 2 ? 0.4 : -0.4)); break;
    case 'crescent': { len = 0.8; const R = 0.9, ang = len / R, arc = new THREE.Group(); arc.position.set(-R, b0, 0); g.add(arc);
      part(arc, new THREE.TorusGeometry(R, 0.009, 5, 24, ang), glow('#ffffff'), 0, 0, 0); main = part(arc, new THREE.TorusGeometry(R, 0.024, 6, 24, ang), glow(bc), 0, 0, 0); main.material = aura(bc, 0.55); break; }
    case 'stub': len = 0.42; main = beam(len, 0.026); break;
    default: main = beam(len, 0.024);
  }
  sTag(g, 'blade' + sfx);
  // anchors for the swing trail: the blade's root and tip
  const a0 = new THREE.Object3D(), a1 = new THREE.Object3D(); a0.position.y = b0 + 0.08; a1.position.y = b0 + len; if (blade === 'crescent') { const R = 0.9, an = len / R; a1.position.set(-R + Math.cos(an) * R, b0 + Math.sin(an) * R, 0); } g.add(a0, a1); tips.push([a0, a1, bc]);
  return { g, main };
}
function makeSaberModel(cfg) {
  cfg = Object.assign({}, SABER_DEF, cfg || {});
  const g = new THREE.Group(), tr = k => SABER_TRIM[cfg[k + 'Col']] || SABER_TRIM.steel, em = sMetal(tr('emit')), gm = sMetal(tr('grip')), pm = sMetal(tr('pom')), dark = sSoft('#16151a'), tips = [];
  const aura = (c, op) => { const m = glow(c).clone(); m.transparent = true; m.opacity = op; m.depthWrite = false; return m; };
  // grip (centred on the origin, along +Y)
  const gl = cfg.grip === 'pole' ? 0.42 : 0.2, top = gl / 2;
  const h = gl / 2, col = y => part(g, sCollar(), gm, 0, y, 0);
  switch (cfg.grip) {
    case 'twist': part(g, Cy(0.0215, 0.0215, gl, 16), dark, 0, 0, 0); part(g, sHelix(0.0225, -h + 0.016, h - 0.016, 5, 0.0048), gm, 0, 0, 0); part(g, sHelix(0.0222, -h + 0.016, h - 0.016, 5, 0.0018, Math.PI), sMetal('#2a2a2e'), 0, 0, 0); col(-h); col(h - 0.014); break;
    case 'knuckle': { const P = [[0, -h], [0.024, -h]]; for (let i = 0; i <= 24; i++) { const y = -h + 0.02 + i * (gl - 0.04) / 24; P.push([0.0235 - 0.0025 * Math.max(0, Math.sin(i / 24 * Math.PI * 4)), y]); } P.push([0.024, h], [0, h]); part(g, sLathe(P), gm, 0, 0, 0); col(-h); col(h - 0.014);
      const C = new THREE.CatmullRomCurve3([V(0.022, h - 0.008, 0), V(0.05, h - 0.022, 0), V(0.062, 0, 0), V(0.05, -h + 0.022, 0), V(0.022, -h + 0.008, 0)]); part(g, new THREE.TubeGeometry(C, 40, 0.0055, 8), em, 0, 0, 0);
      for (const y of [h - 0.008, -h + 0.008]) part(g, new THREE.SphereGeometry(0.0075, 10, 8), em, 0.022, y, 0); break; }
    case 'pole': part(g, sLathe([[0, -h], [0.02, -h], [0.022, 0], [0.02, h], [0, h]]), dark, 0, 0, 0); for (const y of [-0.15, 0, 0.15]) part(g, sLathe([[0, -0.014], [0.0225, -0.014], [0.027, -0.006], [0.027, 0.006], [0.0225, 0.014], [0, 0.014]]), gm, 0, y, 0);
      for (const [y0, y1] of [[-0.135, -0.015], [0.015, 0.135]]) part(g, sHelix(0.0222, y0, y1, 6, 0.0035), sSoft('#3a2a20'), 0, 0, 0); col(-h); col(h - 0.014); break;
    case 'scale': { part(g, Cy(0.021, 0.021, gl, 16), dark, 0, 0, 0); const sg = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      for (let r = 0; r < 7; r++) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + (r % 2) * Math.PI / 8, m = part(g, sg, gm, Math.cos(a) * 0.0215, -h + 0.03 + r * 0.023, Math.sin(a) * 0.0215); m.scale.set(0.0095, 0.004, 0.017); m.rotation.set(0, -a, 0, 'YXZ'); m.rotateZ(-Math.PI / 2); m.rotateY(0.25); }
      col(-h); col(h - 0.014); break; }
    case 'bound': part(g, sLathe([[0, -h], [0.02, -h], [0.0215, -h / 2], [0.022, 0], [0.0215, h / 2], [0.02, h], [0, h]]), sSoft('#4a3a2e'), 0, 0, 0);
      for (const y of [-0.07, -0.023, 0.023, 0.07]) for (const d of [-0.006, 0, 0.006]) part(g, new THREE.TorusGeometry(0.0232, 0.0029, 6, 20), gm, 0, y + d, 0, Math.PI / 2); col(-h); col(h - 0.014); break;
    case 'fluted': part(g, Cy(0.021, 0.021, gl, 16), dark, 0, 0, 0); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; part(g, Cy(0.0042, 0.0042, gl - 0.03, 8), gm, Math.cos(a) * 0.0215, 0, Math.sin(a) * 0.0215); } col(-h); col(h - 0.014); break;
    case 'cage': { const cc = SABER_COLS[cfg.col] || SABER_COLS.blue, core = part(g, Cy(0.011, 0.011, gl - 0.02, 12), glow(cc), 0, 0, 0); core.userData.pulse = 1; const hz = part(g, Cy(0.017, 0.017, gl - 0.02, 12), glow(cc), 0, 0, 0); hz.material = glow(cc).clone(); hz.material.transparent = true; hz.material.opacity = 0.25; hz.material.depthWrite = false;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, Cy(0.0026, 0.0026, gl - 0.02, 6), gm, Math.cos(a) * 0.024, 0, Math.sin(a) * 0.024); } for (const y of [-h / 2, 0, h / 2]) part(g, new THREE.TorusGeometry(0.024, 0.0022, 6, 24), gm, 0, y, 0, Math.PI / 2); col(-h); col(h - 0.014); break; }
    case 'carved': { const P = [[0, -h]]; for (let i = 0; i <= 30; i++) { const y = -h + 0.012 + i * (gl - 0.024) / 30; P.push([0.0225 + 0.0012 * Math.sin(i / 30 * Math.PI) - (i % 5 === 0 ? 0.002 : 0), y]); } P.push([0, h]); part(g, sLathe(P), sSoft('#4a2a18'), 0, 0, 0);
      part(g, sLathe([[0, -h], [0.026, -h], [0.027, -h + 0.012], [0.0235, -h + 0.02], [0, -h + 0.02]]), gm, 0, 0, 0); part(g, sLathe([[0, h - 0.02], [0.0235, h - 0.02], [0.027, h - 0.012], [0.026, h], [0, h]]), gm, 0, 0, 0); break; }
    default: { part(g, Cy(0.023, 0.023, gl, 16), gm, 0, 0, 0); const P = [[0, -h + 0.02]]; for (let y = -h + 0.02; y <= h - 0.03; y += 0.012) P.push([0.0234, y], [0.0258, y + 0.004], [0.0258, y + 0.008], [0.0234, y + 0.012]); P.push([0, h - 0.02]); part(g, sLathe(P), dark, 0, 0, 0); col(-h); col(h - 0.014); }
  }
  part(g, B(0.016, 0.034, 0.008), em, 0, 0.03, 0.025); part(g, Cy(0.0045, 0.0045, 0.006, 12), glow('#ff3b2a'), 0, 0.038, 0.03, Math.PI / 2); part(g, B(0.006, 0.01, 0.004), sMetal('#d8d8d8'), 0, 0.02, 0.03); sTag(g, 'grip');
  // the crystal chamber: a short glass section with the crystal glowing inside
  const ch = 0.06; part(g, sCollar(), em, 0, top, 0); part(g, sCollar(), em, 0, top + ch - 0.014, 0); for (let i = 0; i < 4; i++) part(g, Cy(0.003, 0.003, ch - 0.02, 6), em, Math.cos(i * Math.PI / 2 + 0.78) * 0.025, top + ch / 2, Math.sin(i * Math.PI / 2 + 0.78) * 0.025);
  { const gs = part(g, Cy(0.024, 0.024, ch - 0.016, 10), '#9fd8ff', 0, top + ch / 2, 0); gs.material = aura('#bfe8ff', 0.22); const cm = saberCrystalMesh(cfg.core === 'plain' ? null : cfg.core, 1); cm.position.y = top + ch / 2; g.add(cm); } sTag(g, 'core');
  const up = saberHead(g, cfg.emit, cfg.emitCol, cfg.blade, cfg.col, tips); up.g.position.y = top + ch; g.userData.head = up.g;
  // the lower end: a pommel, or a second emitter and blade on a double-ended sword
  const py = -gl / 2;
  if (cfg.dual) { part(g, Cy(0.026, 0.026, 0.012, 8), em, 0, py - 0.006, 0); const lo = saberHead(g, cfg.emit2, cfg.emit2Col, cfg.blade2, cfg.col2, tips, '2'); lo.g.position.y = py - 0.012; lo.g.rotation.z = Math.PI; g.userData.head2 = lo.g; }
  else switch (cfg.pom) {
    case 'spike': part(g, Cy(0.026, 0.024, 0.015, 8), pm, 0, py - 0.0075, 0); part(g, new THREE.ConeGeometry(0.018, 0.07, 6), pm, 0, py - 0.05, 0, Math.PI); break;
    case 'tassel': { part(g, Cy(0.026, 0.026, 0.02, 8), pm, 0, py - 0.01, 0); const W = new THREE.Group(); W.position.y = py - 0.02; W.userData.hang = 1; g.add(W); const t = new THREE.Group(); W.add(t); let par = t;
      for (let i = 0; i < 6; i++) { const s = new THREE.Group(); s.position.y = i ? -0.04 : 0; par.add(s); part(s, B(0.018 - i * 0.002, 0.042, 0.003), sSoft(cfg.pomCol === 'steel' ? '#c8322a' : tr('pom')), 0, -0.021, 0); par = s; }
      SABER_TASSELS.push(t); break; }
    case 'ribbon': { part(g, sLathe([[0, -0.03], [0.014, -0.029], [0.024, -0.022], [0.028, -0.01], [0.027, 0], [0, 0]], 28), pm, 0, py, 0); part(g, new THREE.TorusGeometry(0.008, 0.0025, 6, 14), pm, 0, py - 0.034, 0);
      const rc = cfg.pomCol === 'steel' ? '#d8b03a' : tr('pom'); for (const sd of [-1, 1]) { const W = new THREE.Group(); W.position.set(0, py - 0.036, 0); W.userData.hang = 1; g.add(W); const S2 = new THREE.Group(); S2.rotation.z = sd * 0.3; W.add(S2); const t = new THREE.Group(); S2.add(t); let par = t;
        for (let i = 0; i < 9; i++) { const q = new THREE.Group(); q.position.y = i ? -0.034 : 0; par.add(q); const r = part(q, B(0.014 - i * 0.0006, 0.035, 0.0018), sSoft(sd > 0 ? rc : '#c8322a'), 0, -0.017, 0); r.rotation.y = Math.sin(i * 0.8) * 0.5; par = q; } SABER_TASSELS.push(t); } break; }
    case 'ring': part(g, Cy(0.026, 0.02, 0.02, 8), pm, 0, py - 0.01, 0); part(g, new THREE.TorusGeometry(0.022, 0.005, 5, 14), pm, 0, py - 0.042, 0); break;
    case 'weight': part(g, Cy(0.02, 0.02, 0.015, 8), pm, 0, py - 0.007, 0); part(g, new THREE.SphereGeometry(0.03, 10, 8), pm, 0, py - 0.038, 0); break;
    case 'fork': part(g, Cy(0.026, 0.026, 0.015, 8), pm, 0, py - 0.007, 0); for (const s of [-1, 1]) part(g, B(0.008, 0.05, 0.008), pm, s * 0.014, py - 0.035, 0, 0, 0, s * 0.3); break;
    default: part(g, sLathe([[0, -0.042], [0.012, -0.041], [0.022, -0.036], [0.028, -0.026], [0.029, -0.006], [0.027, 0], [0, 0]], 28), pm, 0, py, 0); part(g, new THREE.TorusGeometry(0.0285, 0.0018, 6, 28), dark, 0, py - 0.016, 0, Math.PI / 2);
  }
  sTag(g, 'pom');
  g.userData.saberLight = SABER_COLS[cfg.col] || SABER_COLS.blue; g.userData.aura = up.main; g.userData.tips = tips;
  return g;
}
// tassels trail the swing, crystals and halos turn
{ const _uh = updateHands; updateHands = function (dt, t) { _uh(dt, t);
  for (let i = SABER_TASSELS.length - 1; i >= 0; i--) { const T = SABER_TASSELS[i]; let top = T; while (top.parent) top = top.parent; if (!top.isScene) { SABER_TASSELS.splice(i, 1); continue; } const sw = typeof SWG !== 'undefined' ? Math.sin(SWG.th) * SWG.blend : 0; let s = T, k = 0; while (s) { s.rotation.z = (sw * 0.5 + Math.sin(t * 3 + k) * 0.12) * (k ? 0.6 : 1); s.rotation.x = Math.cos(t * 2.2 + k) * 0.1; s = s.children.find(c => c.isGroup); k++; } }
  if (vmMelee.visible) vmMelee.traverse(o => { if (o.userData.spin) o.rotation.y += dt * o.userData.spin; }); }; }
const _makeMeleeModel = makeMeleeModel;
makeMeleeModel = function (id) { return MELEE[id] && MELEE[id].saber ? makeSaberModel(saberCfg()) : _makeMeleeModel(id); };
// offhand energy shield
const vmShield = new THREE.Group(); camera.add(vmShield); vmShield.visible = false;
{ const sm = new THREE.Mesh(new THREE.CircleGeometry(0.22, 6), new THREE.MeshBasicMaterial({ color: '#6fc8ff', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); vmShield.add(sm);
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.225, 6), new THREE.MeshBasicMaterial({ color: '#cfeaff', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })); vmShield.add(rim);
  const emb = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.055, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })); vmShield.add(emb);
  vmShield.userData.face = sm; vmShield.userData.rim = rim; }
const SHIELD = { hp: 100, max: 100, blocking: false, flash: 0 };
const handMelee = () => S.hand === 'melee' && !LEVEL.fly;
function swapHand() {
  if (state !== 'play' || dlgOpen || LEVEL.fly || S.riding) return;
  S.hand = S.hand === 'melee' ? 'gun' : 'melee'; firing = false; SHIELD.blocking = false; meleeShown = null; refreshMeleeModel(); if (MELEE[S.melee || 'knife'].saber) SFX.ignite(S.hand === 'melee'); else SFX.ui();
  log(S.hand === 'melee' ? `${MELEE[S.melee || 'knife'].name} out. Click to swing, hold right click to block with your shield. Q swaps back.` : `${gun().name} out. Q swaps to melee.`); markDirty();
}
function setBlock(on) { SHIELD.blocking = !!on && handMelee() && SHIELD.hp > 5; }
// returns the damage left after the shield takes its share
function shieldBlock(dmg, src) {
  if (src === false || !SHIELD.blocking || !handMelee() || SHIELD.hp <= 0) return dmg;
  if (src) { const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), dx = src.x - player.pos.x, dz = src.z - player.pos.z, d = Math.hypot(dx, dz) || 1; if ((dx * fx + dz * fz) / d < 0.3) return dmg; }
  SHIELD.hp = Math.max(0, SHIELD.hp - dmg * 0.6 * (1 - ((MELEE[S.melee] || {}).saber ? meleeStats().block : 0))); SHIELD.flash = 0.25; SFX.block(); burst(camera.localToWorld(V(-0.15, -0.05, -0.5)), '#6fc8ff', 6, 3);
  if (SHIELD.hp <= 0) { SHIELD.blocking = false; SFX.shieldBreak(); log('Shield broken! It recharges in a moment.'); }
  return dmg * 0.1;
}
function updateHands(dt, t) {
  refreshMeleeModel();
  const melee = handMelee(); SFX.hum(melee && !!MELEE[S.melee || 'knife'].saber);
  if (!SHIELD.blocking) SHIELD.hp = Math.min(SHIELD.max, SHIELD.hp + dt * (SHIELD.hp <= 0 ? 12 : 22));
  SHIELD.flash = Math.max(0, SHIELD.flash - dt);
  vmShield.visible = melee && player.alive;
  if (vmShield.visible) { const up = SHIELD.blocking ? 1 : 0; vmShield.position.set(-0.24 + up * 0.06, -0.22 + up * 0.1, -0.5); vmShield.rotation.set(0, 0.5 - up * 0.4, 0);
    vmShield.userData.face.material.opacity = (SHIELD.blocking ? 0.42 : 0.16) + SHIELD.flash; vmShield.userData.rim.material.opacity = SHIELD.blocking ? 0.95 : 0.4; vmShield.scale.setScalar(SHIELD.blocking ? 0.85 : 0.55); }
  if (melee) { vm.visible = false; if (meleeT <= 0) { vmMelee.visible = true; vmMelee.position.set(0.2, -0.27 + Math.sin(t * 2) * 0.006, -0.42); vmMelee.rotation.set(-0.75, 0.25, -0.4); }
    vmMelee.scale.setScalar(0.8);
    if (firing && !SHIELD.blocking) meleeAttack();
    const M = MELEE[S.melee || 'knife']; if (M.saber && vmMelee.children[0] && vmMelee.children[0].userData.aura) vmMelee.children[0].userData.aura.material.opacity = 0.45 + Math.sin(t * 40) * 0.08; }
}
// ---- the forge: one floating saber, pulled apart into its parts. Each part has arrows to scroll its options; locked ones show grayed out.
// Wide screens lay it on a work bench with the parts in columns; tall phones stand it up with the parts in rows
const SFORGE = { el: null, r: null, scene: null, cam: null, model: null, v: null, rows: [], ups: false, raf: 0, who: '', pop: 0, wide: false };
const SF_GRAY = new THREE.MeshLambertMaterial({ color: '#5a5e66', transparent: true, opacity: 0.5, depthWrite: false });
const sfOwnsEnd = (e) => e === 'dual' ? saberHasDual() : saberOwns('pom', e);
function sfRows() { const v = SFORGE.v, d = v.end === 'dual', R = [
  { k: 'blade', slot: 'blade', tag: 'blade', name: d ? 'Upper blade' : 'Blade', col: 'col', pal: 'glow' },
  { k: 'emit', slot: 'emit', tag: 'emit', name: d ? 'Upper emitter' : 'Emitter', col: 'emitCol', pal: 'trim' },
  { k: 'core', slot: 'core', tag: 'core', name: 'Crystal' },
  { k: 'grip', slot: 'grip', tag: 'grip', name: 'Grip', col: 'gripCol', pal: 'trim' },
  { k: 'end', slot: 'pom', tag: 'pom', name: d ? 'Lower end' : 'Pommel', col: d ? null : 'pomCol', pal: 'trim' }];
  if (d) R.push({ k: 'emit2', slot: 'emit', tag: 'emit2', name: 'Lower emitter', col: 'emit2Col', pal: 'trim' }, { k: 'blade2', slot: 'blade', tag: 'blade2', name: 'Lower blade', col: 'col2', pal: 'glow' });
  return R; }
const sfOpts = (r) => r.k === 'end' ? [...Object.keys(SABER_SLOTS.pom.parts), 'dual'] : Object.keys(SABER_SLOTS[r.slot].parts);
const sfPart = (r, id) => r.k === 'end' && id === 'dual' ? SABER_DUAL : SABER_SLOTS[r.slot].parts[id];
const sfOwn = (r, id) => r.k === 'end' ? sfOwnsEnd(id) : saberOwns(r.slot, id);
// what's shown: may include locked parts. What's worn (S.saber) only ever takes parts you own
function sfShown() { const v = SFORGE.v; return Object.assign({}, v, { dual: v.end === 'dual', pom: v.end === 'dual' ? v.pom : v.end }); }
function sfWear(r, id) { if (!sfOwn(r, id)) return; const o = r.k === 'end' ? (id === 'dual' ? { dual: true } : { dual: false, pom: id }) : { [r.k]: id };
  S.saber = Object.assign(saberCfg(), o, { v2: 1 }); delete S.saber.hilt; meleeShown = null; markDirty(); SFX.ignite(true); }
function sfBuild() { const F = SFORGE, cfg = sfShown(), m = makeSaberModel(cfg), d = F.wide ? 0.09 : 0.075, lock = new Set();
  for (const r of sfRows()) if (!sfOwn(r, F.v[r.k])) { lock.add(r.tag); if (r.k === 'end' && cfg.dual) lock.add('emit2').add('blade2'); }
  // pull the parts apart along the hilt
  for (const c of m.children) { const s = c.userData.slot; if (s === 'core') c.position.y += d; else if (s === 'head') c.position.y += 2 * d; else if (s === 'pom' || s === 'head2') c.position.y -= d; }
  for (const [h, t] of [[m.userData.head, 'blade'], [m.userData.head2, 'blade2']]) if (h) for (const c of h.children) if (c.userData.slot === t) c.position.y += d;
  if (F.wide) for (const c of m.children) if (c.userData.hang) c.rotation.z = Math.PI / 2;
  m.traverse(o => { if (!o.isMesh) return; let p = o; while (p && !p.userData.slot) p = p.parent; if (p && lock.has(p.userData.slot)) o.material = SF_GRAY; });
  F.holder.position.set(0, 0, 0); F.holder.rotation.set(0, 0, 0); F.base.rotation.set(0, 0, F.wide ? -Math.PI / 2 : 0);
  if (F.model) { F.base.remove(F.model); F.model.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  F.base.add(m); F.model = m; F.holder.updateMatrixWorld(true);
  const bc = SABER_COLS[cfg.col] || SABER_COLS.blue; F.light.color.set(bc); F.dust.material.color.set(bc); F.grid.material.color.set(bc); F.edge.material.color.set(bc); F.pool.material.color.set(bc);
  // where each part sits (for its arrows) and the frame of the hilt, in world space at rest
  const box = new THREE.Box3(), hilt = new THREE.Box3(), all = new THREE.Box3(); F.anch = {};
  for (const r of sfRows()) { box.makeEmpty(); m.traverse(o => { if (o.isMesh) { let p = o; while (p && !p.userData.slot) p = p.parent; if (p && p.userData.slot === r.tag && !p.userData.hang) box.expandByObject(o); } });
    if (box.isEmpty()) continue; all.union(box); const c = box.getCenter(V(0, 0, 0));
    if (F.wide) { if (r.tag === 'blade') c.x = box.min.x + 0.16; if (r.tag === 'blade2') c.x = box.max.x - 0.16; } else { if (r.tag === 'blade') c.y = box.min.y + 0.14; if (r.tag === 'blade2') c.y = box.max.y - 0.14; }
    F.anch[r.k] = c; if (r.slot !== 'blade') hilt.union(box); }
  F.hilt = hilt; F.dual = cfg.dual; F.light.position.copy(hilt.getCenter(V(0, 0, 0))).add(V(0, 0, 0.25)); sfFit(); }
function sfFit() { const F = SFORGE; if (!F.el || !F.r || !F.hilt) return; const w = F.el.clientWidth, h = F.el.clientHeight; F.r.setSize(w, h, false); F.cam.aspect = w / h;
  const hc = F.hilt.getCenter(V(0, 0, 0)), hs = F.hilt.getSize(V(0, 0, 0)), tan = Math.tan(THREE.MathUtils.degToRad(F.cam.fov / 2));
  F.bench.visible = F.wide; F.pad.visible = !F.wide;
  if (F.wide) { // the hilt plus a stretch of blade fills most of the width; the saber sits just under the header
    const span = hs.x + (F.dual ? 0.5 : 0.55), visW = span / (w < 900 ? 0.92 : 0.84), visH = visW / F.cam.aspect, dist = (visH / 2) / tan, cx = hc.x + (F.dual ? 0 : 0.16);
    const sy = Math.min(h * 0.42, F.topH + Math.max(60, h * 0.16)), lookY = hc.y + (sy - h / 2) / h * visH;
    F.cam.position.set(cx, lookY, dist); F.cam.lookAt(cx, lookY, 0); F.bench.position.set(cx, hc.y - 0.075, 0); F.bench.scale.setScalar(visW / 2); F.sy = sy;
  } else { const H = hs.y + 0.42, dist = (H / 2) / tan, vw = H * F.cam.aspect, sx = 0.27, cy = hc.y + (F.dual ? 0 : 0.07);
    F.cam.position.set(hc.x + (0.5 - sx) * vw, cy, dist); F.cam.lookAt(hc.x + (0.5 - sx) * vw, cy, 0); F.sx = sx * w; F.pad.position.set(hc.x, F.hilt.min.y - 0.05, 0); }
  F.cam.updateProjectionMatrix(); }
function sfDot() { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(0.3, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); }
function sfInit() { const F = SFORGE; if (F.el) return true;
  try { F.r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (_) { return false; }
  F.r.outputEncoding = THREE.sRGBEncoding; F.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); F.r.setClearColor(0x000000, 0);
  F.scene = new THREE.Scene(); F.cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  F.scene.add(new THREE.HemisphereLight(0xe6ecff, 0x3a2e24, 0.9)); const dl = new THREE.DirectionalLight(0xfff0d8, 0.9); dl.position.set(1.5, 2, 2.5); F.scene.add(dl); const rim = new THREE.DirectionalLight(0x8fc8ff, 0.7); rim.position.set(-2, 0.5, -1.5); F.scene.add(rim);
  F.light = new THREE.PointLight(0x4fa8ff, 0.9, 1.4); F.scene.add(F.light);
  F.holder = new THREE.Group(); F.scene.add(F.holder); F.base = new THREE.Group(); F.holder.add(F.base);
  const tex = sfDot(), add = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, map: tex });
  // the work bench: a dark steel slab with a glowing front edge and a holo grid, tipped toward you
  F.bench = new THREE.Group(); F.scene.add(F.bench); const bt = new THREE.Group(); bt.rotation.x = 0.42; F.bench.add(bt);
  part(bt, B(2.2, 0.03, 0.5), new THREE.MeshPhongMaterial({ color: new THREE.Color('#14161c').convertSRGBToLinear(), specular: 0x333844, shininess: 30 }), 0, -0.015, 0);
  F.edge = part(bt, B(2.2, 0.006, 0.006), new THREE.MeshBasicMaterial({ color: '#4fa8ff' }), 0, 0, 0.25);
  { const L = []; for (let x = -1.1; x <= 1.1001; x += 0.1) L.push(x, 0, -0.25, x, 0, 0.25); for (const z of [-0.25, -0.125, 0, 0.125, 0.25]) L.push(-1.1, 0, z, 1.1, 0, z); const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(L, 3)); F.grid = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#4fa8ff' })); }
  F.grid.position.y = 0.001; F.grid.material.transparent = true; F.grid.material.opacity = 0.14; F.grid.material.depthWrite = false; bt.add(F.grid);
  const glowPool = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.3), add('#4fa8ff', 0.12)); glowPool.rotation.x = -Math.PI / 2; glowPool.position.y = 0.002; bt.add(glowPool); F.pool = glowPool;
  // tall screens: a small holo pad under the pommel instead
  F.pad = new THREE.Group(); F.scene.add(F.pad); for (const [r, o] of [[0.07, 0.5], [0.1, 0.25]]) { const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.006, 40), new THREE.MeshBasicMaterial({ color: '#8fd0ff', transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; F.pad.add(m); }
  // drifting sparks around the saber
  const N = 90, pos = new Float32Array(N * 3); F.sp = []; for (let i = 0; i < N; i++) F.sp.push({ x: (Math.random() - 0.5) * 1.6, y: (Math.random() - 0.5) * 0.6, z: (Math.random() - 0.5) * 0.4, v: 0.02 + Math.random() * 0.05, p: Math.random() * 6 });
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); F.dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#4fa8ff', size: 0.018, map: tex, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); F.scene.add(F.dust);
  // the flash when a part changes
  F.ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.065, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); F.scene.add(F.ring);
  F.flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); F.scene.add(F.flare);
  const el = document.createElement('div'); el.id = 'sforge'; el.hidden = true; F.el = el; el.append(F.r.domElement);
  el.insertAdjacentHTML('beforeend', `<div class="sfTop"><div class="sfWho"></div><div class="sfStats"></div></div><div class="sfRows"></div><div class="sfUps win" hidden></div><div class="sfSwing"><button class="pbtn sfArr" data-d="-1">‹</button><span><small>Swing style</small><br><b class="sfSwN"></b></span><button class="pbtn sfArr" data-d="1">›</button></div><div class="sfBot"><button class="pbtn sfUpB">Upgrades</button><button class="pbtn go sfDone">Done</button></div>`);
  document.body.append(el); el.querySelector('.sfDone').addEventListener('click', () => closeDlg()); el.querySelector('.sfUpB').addEventListener('click', () => { F.ups = !F.ups; sfUps(); });
  el.querySelectorAll('.sfSwing .sfArr').forEach(b => b.addEventListener('click', () => { const K = Object.keys(SWING_STYLES), i = K.indexOf(S.swingStyle in SWING_STYLES ? S.swingStyle : 'fig8'); S.swingStyle = K[(i + +b.dataset.d + K.length) % K.length]; markDirty(); sfSwing(); F.demo = 2.4; SFX.ignite(true); }));
  window.addEventListener('resize', () => { if (!el.hidden) sfOpenView(); });
  const st = document.createElement('style'); st.textContent = `#sforge{position:fixed;inset:0;z-index:40;background:radial-gradient(ellipse at 50% 30%,rgba(34,46,84,.97),rgba(6,8,16,.985) 75%);font-size:13px;color:#e8ecf8;touch-action:manipulation;user-select:none;-webkit-user-select:none}
#sforge canvas{position:absolute;inset:0;width:100%;height:100%}
#sforge .sfTop{position:absolute;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);pointer-events:none}#sforge .sfWho{font-size:20px;font-weight:700;color:var(--gold)}#sforge .sfStats{opacity:.85;margin-top:2px}
#sforge .sfRow{position:absolute;left:0;right:0;height:0;pointer-events:none}#sforge .sfRow>*{pointer-events:auto;position:absolute;top:0;transform:translateY(-50%)}
#sforge .sfArr{width:34px;height:34px;padding:0;font-size:20px;line-height:1;border-radius:50%}
#sforge .sfLbl{right:10px;line-height:1.25;text-shadow:0 1px 2px #000}#sforge b{color:var(--gold)}#sforge .lock b{color:#8a8f98}#sforge small{opacity:.7}
#sforge .pbtn.sfF{padding:3px 9px;margin-top:3px}#sforge .sfDot{display:inline-block;width:16px;height:16px;border-radius:50%;border:2px solid #000;box-shadow:0 0 0 1px #fff8,0 0 8px currentColor;vertical-align:-3px;margin-left:6px;cursor:pointer}
#sforge .sfCol{position:absolute;transform:translateX(-50%);text-align:center;line-height:1.25;text-shadow:0 1px 2px #000;padding:6px 4px 8px;border-radius:10px;background:linear-gradient(rgba(255,255,255,.07),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
#sforge .sfCol .ar{display:flex;justify-content:center;align-items:center;gap:6px;margin:4px 0 3px}#sforge .sfCol .sfDot{margin:0}#sforge .sfCol .ch{font-size:11px}
#sforge .sfCol:before{content:'';position:absolute;left:50%;top:-14px;height:14px;border-left:1px dashed rgba(255,255,255,.3)}
#sforge .sfSwing{position:absolute;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);display:flex;align-items:center;gap:8px;line-height:1.15;text-shadow:0 1px 2px #000}#sforge .sfSwing span{min-width:96px;text-align:center}
#sforge .sfBot{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);display:flex;gap:8px}
#sforge .sfUps{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 56px);width:min(calc(100% - 24px),380px);padding:10px 12px;z-index:2}#sforge .sfUps .r{display:flex;align-items:center;gap:8px;margin:5px 0}#sforge .sfUps .r span{flex:1}
@media (max-height:480px){#sforge .sfWho{font-size:16px}#sforge{font-size:12px}#sforge .sfArr{width:30px;height:30px;font-size:18px}}`;
  document.head.append(st); return true; }
function sfSwing() { SFORGE.el.querySelector('.sfSwN').textContent = (SWING_STYLES[S.swingStyle] || SWING_STYLES.fig8).name; }
function sfStats() { sfSwing(); const F = SFORGE, id = MELEE[S.melee] && MELEE[S.melee].saber ? S.melee : 'lsaber', M = meleeStats(id);
  F.el.querySelector('.sfWho').textContent = F.who ? F.who + ' · Saber smith' : 'Saber forge';
  F.el.querySelector('.sfStats').textContent = `Damage ${Math.round(M.dmg)} · ${(1 / M.rate).toFixed(2)} swings/s · reach ${M.reach.toFixed(1)} m${M.block ? ' · block +' + Math.round(M.block * 100) + '%' : ''} · ${Object.keys(S.saberCrystals || {}).length}/${Object.keys(SABER_CRYSTALS).length} crystals found`; }
const sfChips = P => ['dmg', 'spd', 'reach', 'block'].filter(k => P[k]).map(k => { const v = P[k], up = v > 0; return `<span style="color:${up ? '#6fdc5a' : '#ff8a6a'}">${up ? '+' : ''}${k === 'reach' ? v.toFixed(2) + 'm reach' : Math.round(v * 100) + '% ' + { dmg: 'dmg', spd: 'speed', block: 'block' }[k]}</span>`; }).join(' ');
function sfFlash(k) { const F = SFORGE, a = F.anch && F.anch[k]; if (!a) return; F.pop = 1; F.popAt = a.clone(); }
function sfRender() { const F = SFORGE, box = F.el.querySelector('.sfRows'); box.textContent = ''; F.rows = []; sfStats();
  for (const r of sfRows()) { const ids = sfOpts(r), cur = F.v[r.k], P = sfPart(r, cur), own = sfOwn(r, cur), row = document.createElement('div'); row.className = F.wide ? 'sfCol' + (own ? '' : ' lock') : 'sfRow';
    const arr = (t, dir) => { const b = document.createElement('button'); b.className = 'pbtn sfArr'; b.textContent = t; b.addEventListener('click', () => { const i = (ids.indexOf(F.v[r.k]) + dir + ids.length) % ids.length; F.v[r.k] = ids[i]; sfWear(r, ids[i]); sfBuild(); sfRender(); sfFlash(r.k); }); return b; };
    const L = arr('‹', -1), Rb = arr('›', 1), n = ids.indexOf(cur) + 1, col = r.col && (r.k !== 'end' || cur !== 'dual') ? (r.pal === 'glow' ? SABER_COLS : SABER_TRIM)[F.v[r.col]] : r.k === 'core' && P.col;
    let dot = null; if (col) { dot = document.createElement('span'); dot.className = 'sfDot'; dot.style.background = dot.style.color = col; dot.title = 'Change colour';
      if (r.col) dot.addEventListener('click', () => { const L2 = Object.keys(r.pal === 'glow' ? SABER_COLS : SABER_TRIM); F.v[r.col] = L2[(L2.indexOf(F.v[r.col]) + 1) % L2.length]; S.saber = Object.assign(saberCfg(), { [r.col]: F.v[r.col] }, { v2: 1 }); meleeShown = null; markDirty(); sfBuild(); sfRender(); sfFlash(r.k); }); }
    const lockEl = () => { if (own) return null; const m = document.createElement('div');
      if (r.k === 'core') m.innerHTML = `<small>Hidden on ${(LEVELS[cur] && LEVELS[cur].name) || cur}</small>`;
      else { const b = document.createElement('button'); b.className = 'pbtn go sfF'; b.textContent = 'Forge · ' + costLabel(P.cost); b.disabled = !costOk(P.cost);
        b.addEventListener('click', () => { costPay(P.cost); S.saberParts = S.saberParts || {}; S.saberParts[r.k === 'end' && cur === 'dual' ? 'dual' : r.slot + ':' + cur] = 1; log(`Forged: ${P.name}`, 'loot'); sfWear(r, cur); sfBuild(); sfRender(); sfFlash(r.k); }); m.append(b); }
      return m; };
    if (F.wide) { const ar = document.createElement('div'); ar.className = 'ar'; ar.append(L); if (dot) ar.append(dot); ar.append(Rb);
      row.innerHTML = `<small>${r.name} · ${n}/${ids.length}</small>`; row.append(ar); row.insertAdjacentHTML('beforeend', `<b>${own ? '' : '🔒 '}${P.name}</b><div class="ch">${sfChips(P)}</div>`); const le = lockEl(); if (le) row.append(le);
      box.append(row); F.rows.push({ k: r.k, row }); }
    else { const lb = document.createElement('div'); lb.className = 'sfLbl' + (own ? '' : ' lock'); lb.innerHTML = `<small>${r.name} · ${n}/${ids.length}</small><br><b>${own ? '' : '🔒 '}${P.name}</b>`; if (dot) lb.append(dot); lb.insertAdjacentHTML('beforeend', `<br>${sfChips(P)}`); const le = lockEl(); if (le) lb.append(le);
      row.append(L, Rb, lb); box.append(row); F.rows.push({ k: r.k, row, L, Rb, lb }); } }
  if (F.wide) { const cw = F.el.clientWidth < 900 ? Math.min(118, (F.el.clientWidth - 16) / F.rows.length - 4) : 136; for (const R of F.rows) { R.row.style.width = cw + 'px'; R.w = cw; } }
  else for (const R of F.rows) R.h = Math.max(36, R.lb.offsetHeight);
  sfPlace(); if (F.ups) sfUps(); }
function sfUps() { const F = SFORGE, p = F.el.querySelector('.sfUps'); p.hidden = !F.ups; if (!F.ups) return; p.innerHTML = '<b>Upgrades (every laser sword)</b>';
  for (const [k, Md] of Object.entries(SABER_MODS)) { const lv = saberMod(k), mx = Md.cost.length, r = document.createElement('div'); r.className = 'r';
    r.innerHTML = `<span>${Md.name} ${'★'.repeat(lv)}${'☆'.repeat(mx - lv)}<br><small>${Md.desc}${lv < mx ? ' · ' + costLabel(Md.cost[lv]) : ''}</small></span>`;
    const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = lv >= mx ? 'Maxed' : 'Install'; b.disabled = lv >= mx || !costOk(Md.cost[lv]);
    b.addEventListener('click', () => { costPay(Md.cost[lv]); S.saberMods = S.saberMods || {}; S.saberMods[k] = lv + 1; SFX.ignite(true); log(`${Md.name} installed (tier ${lv + 1})`, 'loot'); markDirty(); sfStats(); sfUps(); F.pop = 1; F.popAt = F.hilt.getCenter(V(0, 0, 0)); }); r.append(b); p.append(r); } }
// the labels sit still under (or beside) their part while the saber floats; they never overlap
function sfPlace() { const F = SFORGE, w = F.el.clientWidth, h = F.el.clientHeight, P = [];
  for (const R of F.rows) { const a = F.anch[R.k]; if (!a) continue; const p = a.clone().project(F.cam); P.push({ R, x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h }); }
  if (F.wide) { P.sort((a, b) => a.x - b.x); const lo = 8, hi = w - 8;
    for (let i = 0; i < P.length; i++) P[i].x = Math.max(P[i].x, i ? P[i - 1].x + (P[i - 1].R.w + P[i].R.w) / 2 + 4 : lo + P[i].R.w / 2);
    for (let i = P.length - 1; i >= 0; i--) P[i].x = Math.min(P[i].x, i < P.length - 1 ? P[i + 1].x - (P[i + 1].R.w + P[i].R.w) / 2 - 4 : hi - P[i].R.w / 2);
    const top = F.sy + (h < 480 ? 44 : 64); for (const { R, x } of P) { R.row.style.left = x + 'px'; R.row.style.top = top + 'px'; } return; }
  const top = F.topH + 8, bot = h - 70; P.forEach(p => p.hh = p.R.h / 2); P.sort((a, b) => a.y - b.y);
  for (let i = 0; i < P.length; i++) P[i].y = Math.max(P[i].y, i ? P[i - 1].y + P[i - 1].hh + P[i].hh + 6 : top + P[i].hh);
  for (let i = P.length - 1; i >= 0; i--) P[i].y = Math.min(P[i].y, i < P.length - 1 ? P[i + 1].y - P[i + 1].hh - P[i].hh - 6 : bot - P[i].hh);
  const sx = F.sx, off = 44;
  for (const { R, y } of P) { R.row.style.top = y + 'px'; R.L.style.left = (sx - off - 34) + 'px'; R.Rb.style.left = (sx + off) + 'px'; R.lb.style.left = (sx + off + 44) + 'px'; } }
function sfOpenView() { const F = SFORGE; F.wide = F.el.clientWidth > F.el.clientHeight * 1.05; sfStats(); F.topH = F.el.querySelector('.sfTop').getBoundingClientRect().bottom; sfBuild(); sfRender(); }
function openSaberForge(who) {
  if (!sfInit()) return; openDlg('Saber forge', who || ''); acts([['Done', closeDlg, true]]); $('dlg').hidden = true; const F = SFORGE; F.who = who || ''; F.ups = false; F.demo = 0;
  const c = saberCfg(); F.v = Object.assign({}, c, { end: c.dual ? 'dual' : c.pom }); F.el.hidden = false; sfOpenView();
  cancelAnimationFrame(F.raf); const t0 = performance.now(); let last = t0;
  const loop = () => { if (F.el.hidden) return; const now = performance.now(), t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    F.holder.position.y = Math.sin(t * 1.3) * 0.01; F.holder.rotation.x = F.wide ? Math.sin(t * 0.45) * 0.6 : 0; F.holder.rotation.y = F.wide ? 0 : Math.sin(t * 0.45) * 0.5; F.holder.rotation.z = Math.sin(t * 0.8) * 0.02;
    if (F.demo > 0) { F.demo -= dt; const St = swingStyle(), th = t * 5, [x, y, z] = St.f(th), e = Math.min(1, F.demo * 2), q = F.wide ? 0.12 : 0.06; F.holder.position.x = x * q * e; F.holder.position.y += y * q * 1.2 * e; F.holder.position.z = z * 0.15 * e; F.holder.rotation.z += (x * 0.35 + (St.spin ? th : 0)) * e; } else F.holder.position.x = F.holder.position.z = 0;
    const k = F.pop; F.holder.scale.setScalar(1 + 0.05 * k * k); F.light.intensity = 0.9 + Math.sin(t * 7) * 0.08 + k * 1.5;
    F.model.traverse(o => { if (o.userData.spin) o.rotation.y += dt * o.userData.spin; if (o.userData.pulse) o.scale.x = o.scale.z = 1 + Math.sin(t * 6) * 0.15; });
    if (F.pool) F.pool.material.opacity = 0.1 + Math.sin(t * 2) * 0.03;
    // sparks drift up around the hilt and wrap
    const hc = F.hilt.getCenter(V(0, 0, 0)), A = F.dust.geometry.attributes.position;
    F.sp.forEach((s, i) => { s.y += s.v * dt; if (s.y > 0.3) s.y = -0.3; A.setXYZ(i, hc.x + s.x * (F.wide ? 0.6 : 0.25) + Math.sin(t + s.p) * 0.01, hc.y + s.y * (F.wide ? 0.8 : 1.6), hc.z + s.z); }); A.needsUpdate = true;
    if (k > 0) { F.pop = Math.max(0, k - dt * 1.8); const e = 1 - F.pop; F.ring.position.copy(F.popAt); F.ring.lookAt(F.cam.position); F.ring.scale.setScalar(0.6 + e * 2.6); F.ring.material.opacity = F.pop * 0.9; F.flare.position.copy(F.popAt); F.flare.scale.setScalar(0.08 + e * 0.25); F.flare.material.opacity = F.pop * F.pop; }
    else F.ring.material.opacity = F.flare.material.opacity = 0;
    F.r.render(F.scene, F.cam); F.raf = requestAnimationFrame(loop); };
  loop(); }
{ const _cd = closeDlg; closeDlg = function () { if (SFORGE.el && !SFORGE.el.hidden) { SFORGE.el.hidden = true; cancelAnimationFrame(SFORGE.raf); } return _cd.apply(this, arguments); }; }
LEVELS.zeltac.npcs.push({ id: 'juno', name: 'Juno', role: 'Saber smith · laser swords', rig: 'civ', make: () => makeCivilian('#2a2a3a', '#1e1c22', '#c58a64', '#e8e4dc', '#4fa8ff'), x: 6, z: 12, face: Math.PI * 1.2, shop: 'guns', guns: [], melee: ['lsaber', 'lsaber2'], forge: true,
  idle: ["Every blade sings a different color. Pick yours.", "Hold your shield up when they swing. Laser swords are fast, not invincible."] });
