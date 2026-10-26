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
const sTag = (par, tag) => { for (const c of par.children) if (!c.userData.slot) c.userData.slot = tag; };
function saberHead(par, emit, emc, blade, col, tips, sfx) {
  sfx = sfx || ''; const g = new THREE.Group(); g.userData.slot = 'head' + sfx; par.add(g); const em = SABER_TRIM[emc] || SABER_TRIM.steel, dark = '#16151a', bc = SABER_COLS[col] || SABER_COLS.blue;
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
  part(g, B(0.012, 0.03, 0.01), glow('#ff3b2a'), 0.026, 0.02, 0); sTag(g, 'grip');
  // the crystal chamber: a short glass section with the crystal glowing inside
  const ch = 0.06; part(g, Cy(0.026, 0.026, 0.008, 8), em, 0, top + 0.004, 0); part(g, Cy(0.026, 0.026, 0.008, 8), em, 0, top + ch - 0.004, 0);
  { const gs = part(g, Cy(0.024, 0.024, ch - 0.016, 10), '#9fd8ff', 0, top + ch / 2, 0); gs.material = aura('#bfe8ff', 0.22); const cm = saberCrystalMesh(cfg.core === 'plain' ? null : cfg.core, 1); cm.position.y = top + ch / 2; g.add(cm); } sTag(g, 'core');
  const up = saberHead(g, cfg.emit, cfg.emitCol, cfg.blade, cfg.col, tips); up.g.position.y = top + ch; g.userData.head = up.g;
  // the lower end: a pommel, or a second emitter and blade on a double-ended sword
  const py = -gl / 2;
  if (cfg.dual) { part(g, Cy(0.026, 0.026, 0.012, 8), em, 0, py - 0.006, 0); const lo = saberHead(g, cfg.emit2, cfg.emit2Col, cfg.blade2, cfg.col2, tips, '2'); lo.g.position.y = py - 0.012; lo.g.rotation.z = Math.PI; g.userData.head2 = lo.g; }
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
  sTag(g, 'pom');
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
// ---- the forge: one floating saber, pulled apart into its parts. Each part has arrows to scroll its options; locked ones show grayed out
const SFORGE = { el: null, r: null, scene: null, cam: null, model: null, v: null, rows: [], ups: false, raf: 0, who: '' };
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
function sfBuild() { const F = SFORGE, cfg = sfShown(), m = makeSaberModel(cfg), d = 0.075, lock = new Set();
  for (const r of sfRows()) if (!sfOwn(r, F.v[r.k])) { lock.add(r.tag); if (r.k === 'end' && cfg.dual) lock.add('emit2').add('blade2'); }
  // pull the parts apart along the hilt
  for (const c of m.children) { const s = c.userData.slot; if (s === 'core') c.position.y += d; else if (s === 'head') c.position.y += 2 * d; else if (s === 'pom' || s === 'head2') c.position.y -= d; }
  for (const [h, t] of [[m.userData.head, 'blade'], [m.userData.head2, 'blade2']]) if (h) for (const c of h.children) if (c.userData.slot === t) c.position.y += d;
  m.traverse(o => { if (!o.isMesh) return; let p = o; while (p && !p.userData.slot) p = p.parent; if (p && lock.has(p.userData.slot)) o.material = SF_GRAY; });
  if (F.model) { F.holder.remove(F.model); F.model.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  F.holder.add(m); F.model = m; F.holder.updateMatrixWorld(true);
  // where each part sits (for its row of arrows) and the frame of the hilt
  const box = new THREE.Box3(), hilt = new THREE.Box3(); F.anch = {};
  for (const r of sfRows()) { box.makeEmpty(); m.traverse(o => { if (o.isMesh) { let p = o; while (p && !p.userData.slot) p = p.parent; const t = p && p.userData.slot; if (t === r.tag || (r.k === 'end' && cfg.dual && t === 'pom')) box.expandByObject(o); } });
    if (box.isEmpty()) continue; const c = box.getCenter(V(0, 0, 0)); if (r.tag === 'blade') c.y = box.min.y + 0.14; if (r.tag === 'blade2') c.y = box.max.y - 0.14; F.anch[r.k] = m.worldToLocal(c.clone());
    if (r.slot !== 'blade') hilt.union(box); }
  const h = hilt.getSize(V(0, 0, 0)).y + 0.42; F.frameH = h; F.frameY = hilt.getCenter(V(0, 0, 0)).y + (cfg.dual ? 0 : 0.07); sfFit(); }
function sfFit() { const F = SFORGE; if (!F.el || !F.r) return; const w = F.el.clientWidth, h = F.el.clientHeight; F.r.setSize(w, h, false); F.cam.aspect = w / h;
  const dist = (F.frameH / 2) / Math.tan(THREE.MathUtils.degToRad(F.cam.fov / 2)), vw = F.frameH * F.cam.aspect, sx = w < 620 ? 0.27 : 0.34;
  F.cam.position.set((0.5 - sx) * vw, F.frameY, dist); F.cam.lookAt((0.5 - sx) * vw, F.frameY, 0); F.cam.updateProjectionMatrix(); F.sx = sx * w; }
function sfInit() { const F = SFORGE; if (F.el) return true;
  try { F.r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (_) { return false; }
  F.r.outputEncoding = THREE.sRGBEncoding; F.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); F.r.setClearColor(0x000000, 0);
  F.scene = new THREE.Scene(); F.cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  F.scene.add(new THREE.HemisphereLight(0xe6ecff, 0x3a2e24, 1.0)); const dl = new THREE.DirectionalLight(0xfff0d8, 0.9); dl.position.set(1.5, 2, 2.5); F.scene.add(dl); const rim = new THREE.DirectionalLight(0x8fc8ff, 0.6); rim.position.set(-2, 0.5, -1.5); F.scene.add(rim);
  F.holder = new THREE.Group(); F.scene.add(F.holder);
  const el = document.createElement('div'); el.id = 'sforge'; el.hidden = true; F.el = el; el.append(F.r.domElement);
  el.insertAdjacentHTML('beforeend', `<div class="sfTop"><div class="sfWho"></div><div class="sfStats"></div></div><div class="sfRows"></div><div class="sfUps win" hidden></div><div class="sfBot"><button class="pbtn sfUpB">Upgrades</button><button class="pbtn go sfDone">Done</button></div>`);
  document.body.append(el); el.querySelector('.sfDone').addEventListener('click', () => closeDlg()); el.querySelector('.sfUpB').addEventListener('click', () => { F.ups = !F.ups; sfUps(); });
  window.addEventListener('resize', () => { if (!el.hidden) sfFit(); });
  const st = document.createElement('style'); st.textContent = `#sforge{position:fixed;inset:0;z-index:40;background:radial-gradient(ellipse at 34% 50%,rgba(34,46,84,.96),rgba(6,8,16,.98) 70%);font-size:13px;color:#e8ecf8;touch-action:manipulation}
#sforge canvas{position:absolute;inset:0;width:100%;height:100%}
#sforge .sfTop{position:absolute;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);pointer-events:none}#sforge .sfWho{font-size:20px;font-weight:700;color:var(--gold)}#sforge .sfStats{opacity:.85;margin-top:2px}
#sforge .sfRow{position:absolute;left:0;right:0;height:0;pointer-events:none}#sforge .sfRow>*{pointer-events:auto;position:absolute;top:0;transform:translateY(-50%)}
#sforge .sfArr{width:34px;height:34px;padding:0;font-size:20px;line-height:1;border-radius:50%}
#sforge .sfLbl{right:10px;line-height:1.25;text-shadow:0 1px 2px #000}#sforge .sfLbl b{color:var(--gold)}#sforge .sfLbl.lock b{color:#8a8f98}#sforge .sfLbl small{opacity:.7}
#sforge .sfLbl .pbtn{padding:3px 9px;margin-top:3px}#sforge .sfDot{display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid #000;box-shadow:0 0 0 1px #fff8;vertical-align:-2px;margin-left:6px;cursor:pointer}
#sforge .sfBot{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);display:flex;gap:8px}
#sforge .sfUps{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 56px);width:min(calc(100% - 24px),380px);padding:10px 12px}#sforge .sfUps .r{display:flex;align-items:center;gap:8px;margin:5px 0}#sforge .sfUps .r span{flex:1}`;
  document.head.append(st); return true; }
function sfStats() { const F = SFORGE, id = MELEE[S.melee] && MELEE[S.melee].saber ? S.melee : 'lsaber', M = meleeStats(id);
  F.el.querySelector('.sfWho').textContent = F.who ? F.who + ' · Saber smith' : 'Saber forge';
  F.el.querySelector('.sfStats').textContent = `Damage ${Math.round(M.dmg)} · ${(1 / M.rate).toFixed(2)} swings/s · reach ${M.reach.toFixed(1)} m${M.block ? ' · block +' + Math.round(M.block * 100) + '%' : ''} · ${Object.keys(S.saberCrystals || {}).length}/${Object.keys(SABER_CRYSTALS).length} crystals found`; }
const sfChips = P => ['dmg', 'spd', 'reach', 'block'].filter(k => P[k]).map(k => { const v = P[k], up = v > 0; return `<span style="color:${up ? '#6fdc5a' : '#ff8a6a'}">${up ? '+' : ''}${k === 'reach' ? v.toFixed(2) + 'm reach' : Math.round(v * 100) + '% ' + { dmg: 'dmg', spd: 'speed', block: 'block' }[k]}</span>`; }).join(' ');
function sfRender() { const F = SFORGE, box = F.el.querySelector('.sfRows'); box.textContent = ''; F.rows = []; sfStats();
  for (const r of sfRows()) { const ids = sfOpts(r), cur = F.v[r.k], P = sfPart(r, cur), own = sfOwn(r, cur), row = document.createElement('div'); row.className = 'sfRow';
    const arr = (t, dir) => { const b = document.createElement('button'); b.className = 'pbtn sfArr'; b.textContent = t; b.addEventListener('click', () => { const i = (ids.indexOf(F.v[r.k]) + dir + ids.length) % ids.length; F.v[r.k] = ids[i]; sfWear(r, ids[i]); SFX.click && SFX.click(); sfBuild(); sfRender(); }); return b; };
    const L = arr('‹', -1), Rb = arr('›', 1), lb = document.createElement('div'); lb.className = 'sfLbl' + (own ? '' : ' lock');
    const n = ids.indexOf(cur) + 1, col = r.col && (r.k !== 'end' || cur !== 'dual') ? (r.pal === 'glow' ? SABER_COLS : SABER_TRIM)[F.v[r.col]] : r.k === 'core' && P.col;
    lb.innerHTML = `<small>${r.name} · ${n}/${ids.length}</small><br><b>${own ? '' : '🔒 '}${P.name}</b>${col ? `<span class="sfDot" style="background:${col}" title="Change colour"></span>` : ''}<br>${sfChips(P)}`;
    const dot = lb.querySelector('.sfDot'); if (dot && r.col) dot.addEventListener('click', () => { const L2 = Object.keys(r.pal === 'glow' ? SABER_COLS : SABER_TRIM); F.v[r.col] = L2[(L2.indexOf(F.v[r.col]) + 1) % L2.length]; S.saber = Object.assign(saberCfg(), { [r.col]: F.v[r.col] }, { v2: 1 }); meleeShown = null; markDirty(); sfBuild(); sfRender(); });
    if (!own) { const m = document.createElement('div');
      if (r.k === 'core') m.innerHTML = `<small>Hidden on ${(LEVELS[cur] && LEVELS[cur].name) || cur}. Look for a beam of light.</small>`;
      else { const b = document.createElement('button'); b.className = 'pbtn go'; b.textContent = 'Forge · ' + costLabel(P.cost); b.disabled = !costOk(P.cost);
        b.addEventListener('click', () => { costPay(P.cost); S.saberParts = S.saberParts || {}; S.saberParts[r.k === 'end' && cur === 'dual' ? 'dual' : r.slot + ':' + cur] = 1; log(`Forged: ${P.name}`, 'loot'); sfWear(r, cur); sfBuild(); sfRender(); }); m.append(b); }
      lb.append(m); }
    row.append(L, Rb, lb); box.append(row); F.rows.push({ k: r.k, row, L, Rb, lb }); }
  for (const R of F.rows) R.h = Math.max(36, R.lb.offsetHeight); F.topH = F.el.querySelector('.sfTop').getBoundingClientRect().bottom;
  if (F.ups) sfUps(); }
function sfUps() { const F = SFORGE, p = F.el.querySelector('.sfUps'); p.hidden = !F.ups; if (!F.ups) return; p.innerHTML = '<b style="color:var(--gold)">Upgrades (every laser sword)</b>';
  for (const [k, Md] of Object.entries(SABER_MODS)) { const lv = saberMod(k), mx = Md.cost.length, r = document.createElement('div'); r.className = 'r';
    r.innerHTML = `<span>${Md.name} ${'★'.repeat(lv)}${'☆'.repeat(mx - lv)}<br><small style="opacity:.7">${Md.desc}${lv < mx ? ' · ' + costLabel(Md.cost[lv]) : ''}</small></span>`;
    const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = lv >= mx ? 'Maxed' : 'Install'; b.disabled = lv >= mx || !costOk(Md.cost[lv]);
    b.addEventListener('click', () => { costPay(Md.cost[lv]); S.saberMods = S.saberMods || {}; S.saberMods[k] = lv + 1; SFX.ignite(true); log(`${Md.name} installed (tier ${lv + 1})`, 'loot'); markDirty(); sfStats(); sfUps(); }); r.append(b); p.append(r); } }
// rows follow their part as the saber floats; they never overlap
function sfPlace() { const F = SFORGE, w = F.el.clientWidth, h = F.el.clientHeight, top = F.topH + 8, bot = h - 70, P = [];
  for (const R of F.rows) { const a = F.anch[R.k]; if (!a) continue; const p = F.model.localToWorld(a.clone()).project(F.cam); P.push({ R, y: (1 - p.y) / 2 * h, hh: R.h / 2 }); }
  P.sort((a, b) => a.y - b.y);
  for (let i = 0; i < P.length; i++) P[i].y = Math.max(P[i].y, i ? P[i - 1].y + P[i - 1].hh + P[i].hh + 6 : top + P[i].hh);
  for (let i = P.length - 1; i >= 0; i--) P[i].y = Math.min(P[i].y, i < P.length - 1 ? P[i + 1].y - P[i + 1].hh - P[i].hh - 6 : bot - P[i].hh);
  const sx = F.sx, off = w < 620 ? 44 : 58;
  for (const { R, y } of P) { R.row.style.top = y + 'px'; R.L.style.left = (sx - off - 34) + 'px'; R.Rb.style.left = (sx + off) + 'px'; R.lb.style.left = (sx + off + 44) + 'px'; } }
function openSaberForge(who) {
  if (!sfInit()) return; openDlg('Saber forge', who || ''); acts([['Done', closeDlg, true]]); $('dlg').hidden = true; const F = SFORGE; F.who = who || ''; F.ups = false;
  const c = saberCfg(); F.v = Object.assign({}, c, { end: c.dual ? 'dual' : c.pom }); F.el.hidden = false; sfBuild(); sfRender();
  cancelAnimationFrame(F.raf); const t0 = performance.now();
  const loop = () => { if (F.el.hidden) return; const t = (performance.now() - t0) / 1000; F.holder.position.y = Math.sin(t * 1.3) * 0.012; F.holder.rotation.y = Math.sin(t * 0.45) * 0.7; F.holder.rotation.z = Math.sin(t * 0.8) * 0.03;
    F.model.traverse(o => { if (o.userData.spin) o.rotation.y += 0.016 * o.userData.spin; }); F.holder.updateMatrixWorld(true); sfPlace(); F.r.render(F.scene, F.cam); F.raf = requestAnimationFrame(loop); };
  loop(); }
{ const _cd = closeDlg; closeDlg = function () { if (SFORGE.el && !SFORGE.el.hidden) { SFORGE.el.hidden = true; cancelAnimationFrame(SFORGE.raf); } return _cd.apply(this, arguments); }; }
LEVELS.zeltac.npcs.push({ id: 'juno', name: 'Juno', role: 'Saber smith · laser swords', rig: 'civ', make: () => makeCivilian('#2a2a3a', '#1e1c22', '#c58a64', '#e8e4dc', '#4fa8ff'), x: 6, z: 12, face: Math.PI * 1.2, shop: 'guns', guns: [], melee: ['lsaber', 'lsaber2'], forge: true,
  idle: ["Every blade sings a different color. Pick yours.", "Hold your shield up when they swing. Laser swords are fast, not invincible."] });
