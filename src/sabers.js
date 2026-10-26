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
    bound: { name: 'Ring-bound', desc: 'Bare grip held by thick bands.', spd: 0.04, cost: { cr: 1600, scrap: 3 } } } },
  pom: { name: 'Pommel', colors: 'trim', parts: {
    cap: { name: 'Cap', desc: 'A simple end cap.' },
    spike: { name: 'Spike', desc: 'A sharp point for backhand hits.', dmg: 0.05, cost: { cr: 1500, scrap: 4 } },
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
function saberHead(par, emit, emc, blade, col, tips) {
  const g = new THREE.Group(); par.add(g); const em = SABER_TRIM[emc] || SABER_TRIM.steel, dark = '#16151a', bc = SABER_COLS[col] || SABER_COLS.blue;
  const aura = (c, op) => { const m = glow(c).clone(); m.transparent = true; m.opacity = op; m.depthWrite = false; return m; };
  let eh = 0.05;
  switch (emit) {
    case 'fins': part(g, Cy(0.026, 0.022, eh, 8), em, 0, eh / 2, 0); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, f = part(g, B(0.006, 0.05, 0.026), em, Math.cos(a) * 0.03, eh * 0.6, Math.sin(a) * 0.03); f.rotation.order = 'YXZ'; f.rotation.set(0, -a, -0.35); } break;
    case 'claw': part(g, Cy(0.024, 0.026, 0.026, 8), em, 0, 0.013, 0); for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, p = part(g, B(0.008, 0.06, 0.008), em, Math.cos(a) * 0.026, 0.045, Math.sin(a) * 0.026); p.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); } eh = 0.03; break;
    case 'cowl': part(g, Cy(0.026, 0.026, eh, 8), em, 0, eh / 2, 0); part(g, B(0.05, 0.075, 0.006), em, 0, eh * 0.9, 0.028, -0.35, 0, 0); part(g, B(0.05, 0.006, 0.03), dark, 0, eh * 0.3, 0.018); break;
    case 'bell': part(g, Cy(0.04, 0.024, eh, 10), em, 0, eh / 2, 0); part(g, Cy(0.041, 0.041, 0.006, 10), dark, 0, eh - 0.003, 0); break;
    case 'halo': part(g, Cy(0.022, 0.026, 0.03, 8), em, 0, 0.015, 0); { const h = part(g, new THREE.TorusGeometry(0.04, 0.005, 5, 18), em, 0, 0.06, 0, Math.PI / 2); h.userData.spin = 2; for (let i = 0; i < 3; i++) { const a = i * 2.1; part(g, B(0.004, 0.035, 0.004), dark, Math.cos(a) * 0.03, 0.045, Math.sin(a) * 0.03); } } eh = 0.035; break;
    default: for (let i = 0; i < 4; i++) part(g, Cy(0.03 - i * 0.002, 0.03 - i * 0.002, 0.009, 10), i % 2 ? dark : em, 0, 0.006 + i * 0.012, 0);
  }
  const b0 = eh; let len = 0.78, main = null;
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
  // anchors for the swing trail: the blade's root and tip
  const a0 = new THREE.Object3D(), a1 = new THREE.Object3D(); a0.position.y = b0 + 0.08; a1.position.y = b0 + len; if (blade === 'crescent') { const R = 0.9, an = len / R; a1.position.set(-R + Math.cos(an) * R, b0 + Math.sin(an) * R, 0); } g.add(a0, a1); tips.push([a0, a1, bc]);
  return { g, main };
}
function makeSaberModel(cfg) {
  cfg = Object.assign({}, SABER_DEF, cfg || {});
  const g = new THREE.Group(), tr = k => SABER_TRIM[cfg[k + 'Col']] || SABER_TRIM.steel, em = tr('emit'), gm = tr('grip'), pm = tr('pom'), dark = '#16151a', tips = [];
  const aura = (c, op) => { const m = glow(c).clone(); m.transparent = true; m.opacity = op; m.depthWrite = false; return m; };
  // grip (centred on the origin, along +Y)
  const gl = cfg.grip === 'pole' ? 0.42 : 0.2, top = gl / 2;
  switch (cfg.grip) {
    case 'twist': part(g, Cy(0.022, 0.022, gl, 8), dark, 0, 0, 0); for (let i = 0; i < 14; i++) { const a = i * 0.9, y = -gl / 2 + 0.008 + i * (gl - 0.016) / 13; part(g, B(0.016, 0.012, 0.014), gm, Math.cos(a) * 0.022, y, Math.sin(a) * 0.022, 0, -a, 0.5); } break;
    case 'knuckle': part(g, Cy(0.024, 0.024, gl, 8), gm, 0, 0, 0); part(g, new THREE.TorusGeometry(gl * 0.48, 0.007, 5, 14, Math.PI), em, 0.012, 0, 0, 0, 0, -Math.PI / 2).scale.set(0.55, 1, 1); break;
    case 'pole': part(g, Cy(0.02, 0.022, gl, 8), gm, 0, 0, 0); for (const y of [-0.15, 0, 0.15]) part(g, Cy(0.026, 0.026, 0.02, 8), em, 0, y, 0); break;
    case 'scale': part(g, Cy(0.021, 0.021, gl, 8), dark, 0, 0, 0); for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + r * 0.5; part(g, B(0.02, 0.04, 0.006), gm, Math.cos(a) * 0.023, -gl / 2 + 0.025 + r * 0.037, Math.sin(a) * 0.023, -0.25, -a + Math.PI / 2, 0); } break;
    case 'bound': part(g, Cy(0.02, 0.02, gl, 8), '#3a3430', 0, 0, 0); for (const y of [-0.075, -0.025, 0.025, 0.075]) part(g, Cy(0.027, 0.027, 0.018, 8), gm, 0, y, 0); break;
    default: part(g, Cy(0.024, 0.026, gl, 8), em, 0, 0, 0); for (let k = 0; k < 3; k++) part(g, Cy(0.028, 0.028, 0.02, 8), gm, 0, -gl / 2 + 0.04 + k * 0.05, 0);
  }
  part(g, B(0.012, 0.03, 0.01), glow('#ff3b2a'), 0.026, 0.02, 0);
  // the crystal chamber: a short glass section with the crystal glowing inside
  const ch = 0.06; part(g, Cy(0.026, 0.026, 0.008, 8), em, 0, top + 0.004, 0); part(g, Cy(0.026, 0.026, 0.008, 8), em, 0, top + ch - 0.004, 0);
  { const gs = part(g, Cy(0.024, 0.024, ch - 0.016, 10), '#9fd8ff', 0, top + ch / 2, 0); gs.material = aura('#bfe8ff', 0.22); const cm = saberCrystalMesh(cfg.core === 'plain' ? null : cfg.core, 1); cm.position.y = top + ch / 2; g.add(cm); }
  const up = saberHead(g, cfg.emit, cfg.emitCol, cfg.blade, cfg.col, tips); up.g.position.y = top + ch;
  // the lower end: a pommel, or a second emitter and blade on a double-ended sword
  const py = -gl / 2;
  if (cfg.dual) { part(g, Cy(0.026, 0.026, 0.012, 8), em, 0, py - 0.006, 0); const lo = saberHead(g, cfg.emit2, cfg.emit2Col, cfg.blade2, cfg.col2, tips); lo.g.position.y = py - 0.012; lo.g.rotation.z = Math.PI; }
  else switch (cfg.pom) {
    case 'spike': part(g, Cy(0.026, 0.024, 0.015, 8), pm, 0, py - 0.0075, 0); part(g, new THREE.ConeGeometry(0.018, 0.07, 6), pm, 0, py - 0.05, 0, Math.PI); break;
    case 'tassel': { part(g, Cy(0.026, 0.026, 0.02, 8), pm, 0, py - 0.01, 0); const t = new THREE.Group(); t.position.y = py - 0.02; g.add(t); let par = t;
      for (let i = 0; i < 6; i++) { const s = new THREE.Group(); s.position.y = i ? -0.04 : 0; par.add(s); part(s, B(0.018 - i * 0.002, 0.042, 0.003), toon(cfg.pomCol === 'steel' ? '#c8322a' : pm), 0, -0.021, 0); par = s; }
      SABER_TASSELS.push(t); break; }
    case 'ring': part(g, Cy(0.026, 0.02, 0.02, 8), pm, 0, py - 0.01, 0); part(g, new THREE.TorusGeometry(0.022, 0.005, 5, 14), pm, 0, py - 0.042, 0); break;
    case 'weight': part(g, Cy(0.02, 0.02, 0.015, 8), pm, 0, py - 0.007, 0); part(g, new THREE.SphereGeometry(0.03, 10, 8), pm, 0, py - 0.038, 0); break;
    case 'fork': part(g, Cy(0.026, 0.026, 0.015, 8), pm, 0, py - 0.007, 0); for (const s of [-1, 1]) part(g, B(0.008, 0.05, 0.008), pm, s * 0.014, py - 0.035, 0, 0, 0, s * 0.3); break;
    default: part(g, Cy(0.03, 0.026, 0.04, 8), pm, 0, py - 0.02, 0);
  }
  g.userData.saberLight = SABER_COLS[cfg.col] || SABER_COLS.blue; g.userData.aura = up.main; g.userData.tips = tips;
  return g;
}
// tassels trail the swing, crystals and halos turn
{ const _uh = updateHands; updateHands = function (dt, t) { _uh(dt, t);
  for (let i = SABER_TASSELS.length - 1; i >= 0; i--) { const T = SABER_TASSELS[i]; if (!T.parent || !T.parent.parent) { SABER_TASSELS.splice(i, 1); continue; } const sw = typeof SWG !== 'undefined' ? Math.sin(SWG.th) * SWG.blend : 0; let s = T, k = 0; while (s) { s.rotation.z = (sw * 0.5 + Math.sin(t * 3 + k) * 0.12) * (k ? 0.6 : 1); s.rotation.x = Math.cos(t * 2.2 + k) * 0.1; s = s.children.find(c => c.isGroup); k++; } }
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
function openSaberForge(who) {
  openDlg(who ? 'Saber smith' : 'Saber forge', who || 'Your laser sword');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; let tab = SFORGE.tab || 'blade';
  const pv = () => setPreview(() => { const g = new THREE.Group(), m = makeSaberModel(saberCfg()); m.rotation.z = -1.0; g.add(m); return g; }, 'Your blade', saberCfg().dual ? 0.95 : 1.25);
  const set = (o) => { S.saber = Object.assign(saberCfg(), o, { v2: 1 }); delete S.saber.hilt; meleeShown = null; markDirty(); SFX.ignite(true); render(); pv(); };
  const chips = P => ['dmg', 'spd', 'reach', 'block'].filter(k => P[k]).map(k => { const v = P[k], up = v > 0; return `<span style="color:${up ? '#6fdc5a' : '#ff8a6a'}">${up ? '+' : ''}${k === 'reach' ? v.toFixed(2) + ' m reach' : Math.round(v * 100) + '% ' + { dmg: 'dmg', spd: 'speed', block: 'block' }[k]}</span>`; }).join(' ');
  const head = (txt) => { const h = document.createElement('div'); h.textContent = txt; h.style.cssText = 'width:100%;color:var(--gold);margin:8px 0 4px'; rows.appendChild(h); };
  const partList = (slot, key) => { const S0 = SABER_SLOTS[slot], cfg = saberCfg();
    for (const [id, P] of Object.entries(S0.parts)) { const own = saberOwns(slot, id), on = cfg[key] === id, r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = slot === 'core' ? (P.col || '#dfefff') : on ? '#6fdc5a' : own ? '#9aa1aa' : '#3a3d44';
      const nm = document.createElement('span'); nm.innerHTML = `<b>${P.name}</b> ${chips(P)}<br><small style="opacity:.75">${P.desc}</small>`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px';
      const b = document.createElement('button'); b.className = 'pbtn' + (on ? ' go' : ''); b.style.padding = '5px 10px';
      if (on) { b.textContent = 'On'; b.disabled = true; mt.textContent = ''; }
      else if (own) { b.textContent = 'Use'; b.addEventListener('click', () => set({ [key]: id })); }
      else if (slot === 'core') { b.textContent = 'Not found'; b.disabled = true; mt.textContent = 'Hidden on ' + ((LEVELS[id] && LEVELS[id].name) || id); }
      else { mt.textContent = costLabel(P.cost); b.textContent = 'Forge'; b.disabled = !costOk(P.cost); b.addEventListener('click', () => { costPay(P.cost); S.saberParts = S.saberParts || {}; S.saberParts[slot + ':' + id] = 1; log(`Forged: ${P.name}`, 'loot'); set({ [key]: id }); }); }
      r.append(dot, nm, mt, b); rows.appendChild(r); } };
  const colors = (kind, key, label) => { head(label); const r = document.createElement('div'); r.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px'; const cfg = saberCfg(), L = kind === 'glow' ? SABER_COLS : SABER_TRIM;
    for (const [id, hex] of Object.entries(L)) { const b = document.createElement('button'); b.className = 'pbtn' + (cfg[key] === id ? ' go' : ''); b.style.cssText = `padding:5px 9px;border-color:${hex};color:${kind === 'glow' ? hex : '#fff'}`; b.innerHTML = (kind === 'glow' ? '' : `<span style="display:inline-block;width:10px;height:10px;background:${hex};border:1px solid #000;margin-right:5px;vertical-align:-1px"></span>`) + id[0].toUpperCase() + id.slice(1); b.addEventListener('click', () => set({ [key]: id })); r.appendChild(b); }
    rows.appendChild(r); };
  const render = () => {
    rows.textContent = ''; const cfg = saberCfg(), M = meleeStats(MELEE[S.melee] && MELEE[S.melee].saber ? S.melee : 'lsaber'), M0 = MELEE[MELEE[S.melee] && MELEE[S.melee].saber ? S.melee : 'lsaber'];
    const side = SFORGE.side; side.textContent = ''; $('dlgLine').textContent = saberDesc();
    const st = document.createElement('div'); st.style.cssText = 'font-size:13px;opacity:.85;margin-bottom:6px'; st.innerHTML = `Damage ${Math.round(M.dmg)} · ${(1 / M.rate).toFixed(2)} swings/s · reach ${M.reach.toFixed(1)} m${M.block ? ' · block +' + Math.round(M.block * 100) + '%' : ''} (base ${M0.dmg} · ${(1 / M0.rate).toFixed(2)}/s). Every laser sword you own uses this build.`; side.appendChild(st);
    const tabs = document.createElement('div'); tabs.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 4px';
    for (const [id, nm] of [['blade', 'Blade'], ['core', 'Crystal'], ['emit', 'Emitter'], ['grip', 'Grip'], ['pom', cfg.dual ? 'Lower blade' : 'Pommel'], ['up', 'Upgrades']]) { const b = document.createElement('button'); b.className = 'pbtn' + (tab === id ? ' go' : ''); b.style.padding = '5px 10px'; b.textContent = nm; b.addEventListener('click', () => { tab = SFORGE.tab = id; render(); }); tabs.appendChild(b); }
    side.appendChild(tabs);
    if (tab === 'blade') { partList('blade', 'blade'); colors('glow', 'col', 'Blade colour'); }
    else if (tab === 'core') { const n = Object.keys(S.saberCrystals || {}).length; head(`Crystals found: ${n} of ${Object.keys(SABER_CRYSTALS).length}. One is hidden on each world; look for a beam of light.`); partList('core', 'core'); }
    else if (tab === 'emit') { partList('emit', 'emit'); colors('trim', 'emitCol', 'Emitter colour'); }
    else if (tab === 'grip') { partList('grip', 'grip'); colors('trim', 'gripCol', 'Grip colour'); }
    else if (tab === 'pom') {
      const r = document.createElement('div'); r.className = 'rowi'; const nm = document.createElement('span'); nm.innerHTML = `<b>Double-ended</b> ${chips(SABER_DUAL)}<br><small style="opacity:.75">The pommel comes off and a second emitter and blade take its place. Swings hit all around you.</small>`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; const b = document.createElement('button'); b.className = 'pbtn' + (cfg.dual ? ' go' : ''); b.style.padding = '5px 10px';
      if (!saberHasDual()) { mt.textContent = costLabel(SABER_DUAL.cost); b.textContent = 'Forge'; b.disabled = !costOk(SABER_DUAL.cost); b.addEventListener('click', () => { costPay(SABER_DUAL.cost); S.saberParts = S.saberParts || {}; S.saberParts.dual = 1; log('Forged: double-ended hilt', 'loot'); set({ dual: true }); }); }
      else { b.textContent = cfg.dual ? 'On (switch off)' : 'Switch on'; b.addEventListener('click', () => set({ dual: !cfg.dual })); }
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = cfg.dual ? '#6fdc5a' : '#9aa1aa'; r.append(dot, nm, mt, b); rows.appendChild(r);
      if (cfg.dual) { head('Lower blade'); partList('blade', 'blade2'); colors('glow', 'col2', 'Lower blade colour'); head('Lower emitter'); partList('emit', 'emit2'); colors('trim', 'emit2Col', 'Lower emitter colour'); }
      else { head('Pommel'); partList('pom', 'pom'); colors('trim', 'pomCol', 'Pommel colour'); } }
    else {
      head('Upgrades (all laser swords)');
      for (const [k, Md] of Object.entries(SABER_MODS)) { const lv = saberMod(k), mx = Md.cost.length, r = document.createElement('div'); r.className = 'rowi';
        const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = ['#9aa1aa', '#6fdc5a', '#4fa8ff', '#c86aff', '#ffb347', '#ff6aa8'][lv];
        const nm = document.createElement('span'); nm.textContent = `${Md.name} ${'★'.repeat(lv)}${'☆'.repeat(mx - lv)} · ${Md.desc}`;
        const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; mt.textContent = lv >= mx ? 'Maxed' : costLabel(Md.cost[lv]);
        const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Install'; b.disabled = lv >= mx || !costOk(Md.cost[lv]);
        b.addEventListener('click', () => { costPay(Md.cost[lv]); S.saberMods = S.saberMods || {}; S.saberMods[k] = lv + 1; SFX.ignite(true); log(`${Md.name} installed (tier ${lv + 1})`, 'loot'); markDirty(); render(); });
        r.append(dot, nm, mt, b); rows.appendChild(r); } }
  };
  $('dlgActs').before(rows); acts([['Done', closeDlg]]); showPreviewIn(rows);
  // the preview sits beside the tabs so the parts list gets the room
  const topEl = document.createElement('div'); topEl.className = 'prevWrap'; topEl.style.cssText = 'display:flex;gap:10px;align-items:flex-start;width:100%'; rows.before(topEl); const side = document.createElement('div'); side.style.cssText = 'flex:1;min-width:0';
  if (PREV.wrap && PREV.wrap.isConnected) { const hold = document.createElement('div'); hold.style.cssText = 'flex:0 0 44%;min-width:0'; hold.append(PREV.wrap); topEl.append(hold); } topEl.append(side); SFORGE.side = side; render(); pv();
}
const SFORGE = { tab: 'blade' };
LEVELS.zeltac.npcs.push({ id: 'juno', name: 'Juno', role: 'Saber smith · laser swords', rig: 'civ', make: () => makeCivilian('#2a2a3a', '#1e1c22', '#c58a64', '#e8e4dc', '#4fa8ff'), x: 6, z: 12, face: Math.PI * 1.2, shop: 'guns', guns: [], melee: ['lsaber', 'lsaber2'], forge: true,
  idle: ["Every blade sings a different color. Pick yours.", "Hold your shield up when they swing. Laser swords are fast, not invincible."] });
