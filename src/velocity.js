// =================== VELOCITY 2: the magnet storm planet ===================
// A flat, glassy plain under a storm that never ends. Cars hover on magnets with almost no friction.
// The town floats above the plain and a long ramp bridge runs down to it.
const VEL_HOVER = 0.62;
const VEL = { built: false, ref: null, cam: 1, carObj: null, carKey: '', lamp: null, streaks: null, low: null, up: null, base: null, bm: 1, dm: 0, kick: 0, wasDrift: false, driftHeld: false, cp: null, bolts: [], lastFlash: 0, rainOn: false, gateRings: {}, hud: null, cls: '' };
const VCITY = { x: 0, z: -20, hx: 30, hz: 24, y: 20 }, VBR = { x: 0, z0: 4, z1: 124, hw: 6 };
const velBridgeY = t => VCITY.y + (0.3 - VCITY.y) * t;
function velTop(x, z) {
  if (Math.abs(x - VCITY.x) <= VCITY.hx && Math.abs(z - VCITY.z) <= VCITY.hz) return VCITY.y;
  const t = (z - VBR.z0) / (VBR.z1 - VBR.z0); if (t >= 0 && t <= 1 && Math.abs(x - VBR.x) <= VBR.hw) return velBridgeY(t);
  return null;
}
// the city and bridge only count as floor when you're up on them (cars drive underneath)
{ const _fa = floorAt; floorAt = function (x, z) { const h = _fa(x, z); if (!VEL.built || !LEVEL || LEVEL.id !== 'speedway') return h; const top = velTop(x, z); if (top == null) return h; return VEL.ref == null || VEL.ref > top - 3 ? Math.max(h, top) : h; }; }
// up top you bump into the town; down below, into the pylons
{ const _co = collide; collide = function (p, r, k) {
  if (!VEL.built || !LEVEL || LEVEL.id !== 'speedway' || !VEL.low) return _co(p, r, k);
  if (!VEL.base) VEL.base = { C: CIRCLES.slice(), B: BOXES.slice() };
  const up = p.y > VCITY.y - 3, C0 = CIRCLES.slice(), B0 = BOXES.slice(); CIRCLES.length = 0; BOXES.length = 0;
  if (up) { CIRCLES.push(...VEL.base.C, ...VEL.up.C); BOXES.push(...VEL.base.B, ...VEL.up.B); } else { CIRCLES.push(...VEL.low.C); BOXES.push(...VEL.low.B); }
  try { return _co(p, r, k); } finally { CIRCLES.length = 0; BOXES.length = 0; CIRCLES.push(...C0); BOXES.push(...B0); } }; }
// railings: you can't walk or drive off the edge of the town or the bridge
function velClamp(p) {
  const t = (p.z - VBR.z0) / (VBR.z1 - VBR.z0);
  if (t > 0 && t < 0.9 && p.y > velBridgeY(t) - 1.2) { if (Math.abs(p.x - VBR.x) > VBR.hw - 0.5) { p.x = VBR.x + Math.sign(p.x - VBR.x) * (VBR.hw - 0.5); return 1; } return 0; }
  if (p.y > VCITY.y - 1.2 && !(Math.abs(p.x - VCITY.x) <= VCITY.hx && Math.abs(p.z - VCITY.z) <= VCITY.hz) && !(t >= 0 && Math.abs(p.x - VBR.x) <= VBR.hw)) {
    const nx = clamp(p.x, VCITY.x - VCITY.hx + 0.5, VCITY.x + VCITY.hx - 0.5), nz = clamp(p.z, VCITY.z - VCITY.hz + 0.5, VCITY.z + VCITY.hz - 0.5); const moved = nx !== p.x || nz !== p.z; p.x = nx; p.z = nz; return moved ? 1 : 0; }
  return 0;
}

// ---- the three new courses: open plain, ring gates far apart ----
for (const k of Object.keys(RTRACKS)) delete RTRACKS[k];
Object.assign(RTRACKS, {
  storm: { name: 'Storm Sprint', pay: 1, gap: 150, gold: 31, col: '#4fd2ff', pts: [[0, 130], [90, 195], [200, 175], [255, 60], [220, -70], [120, -160], [-10, -200], [-120, -170]] },
  magnet: { name: 'Magnet Mile', pay: 1.6, gap: 150, gold: 38, col: '#c86aff', pts: [[0, 130], [-90, 200], [-200, 180], [-260, 60], [-200, -60], [-80, -120], [40, -70], [150, -20], [240, 30], [200, 150]] },
  thunder: { name: 'Thunder Run', pay: 2.4, gap: 160, gold: 37.5, col: '#ffd36a', pts: [[0, 130], [0, 240], [-120, 290], [-230, 200], [-180, 80], [-60, 30], [60, -80], [180, -130], [260, -60], [230, 120], [120, 250], [40, 300]] },
  // out the east gate, all the way around the planet in the Halo Line, and home from the west gate
  halo: { name: 'Halo Run', pay: 3, bonus: true, halo: true, par: 48, col: '#ff3bd1', pts: [[0, 130], [140, 80], [276, 34], [-276, 34], [-190, 70], [-90, 120], [0, 150]] } });
{ const _tl = trackLen; trackLen = function (T) { _tl(T); if (T.halo) { const L = T.seg.map(q => q[3]); T.gates = [L[1] * 0.6, L[2], L[2] + T.seg[2][2], L[4], L[5], T.len]; T.needHalo = 2; T.tunnelGate = 2; return; } if (T.gap) { T.gates = []; for (let g = T.gap; g < T.len - T.gap * 0.5; g += T.gap) T.gates.push(g); T.gates.push(T.len); } }; }
for (let i = LB_BOARDS.length - 1; i >= 0; i--) if (/^race_/.test(LB_BOARDS[i][0])) LB_BOARDS.splice(i, 1);
LB_BOARDS.push(...Object.entries(RTRACKS).map(([k, T]) => ['race_' + k, T.name + ' (best time)', 'asc', v => v.toFixed(2) + 's']));
if (QDEFS.v1) { QDEFS.v1.obj[0].t = 'racewin_storm'; QDEFS.v1.obj[0].text = 'Get gold on the Storm Sprint'; QDEFS.v1.intro = ["New driver! Welcome to Velocity. The ground's glass, the sky's angry and the cars ride on magnets. Everything here is a race.", "Take the Storm Sprint and get under the gold time. Then I'll know you're real."]; QDEFS.v1.outro = ["A winner! Gus can tune your magnets when you're ready. Magnet Mile and Thunder Run are waiting."]; }
LORE.speedway = ['Velocity', 'The magnet storm planet. A plain of gray glass under a storm that never ends. Cars float on magnets with nothing to slow them down, and the town of Pit Row hovers above it all.'];
// the planet from orbit: storm gray with blue lightning
PLANET_LOOK.speedway = { seed: 47, ramp: [[0, '#23262e'], [0.45, '#4a505c'], [0.65, '#7a808c'], [0.82, '#b8c4d4'], [0.95, '#8fd0ff']], grid: '#4fd2ff' };
SPACE_BODIES.speedway.col = '#6a7080';
delete CITY.speedway; if (typeof BIOME !== 'undefined') delete BIOME.speedway;
// the cars: base stats, plus the hover bike
Object.assign(RCARS.mk1, { grip: 2.2 }); Object.assign(RCARS.buggy, { grip: 2.8 }); Object.assign(RCARS.mk2, { grip: 2.0 }); Object.assign(RCARS.manta, { grip: 2.6 }); Object.assign(RCARS.mk3, { grip: 2.1 }); Object.assign(RCARS.hauler, { grip: 1.7 }); Object.assign(RCARS.bubble, { grip: 2.5 }); Object.assign(RCARS.phantom, { grip: 2.8 });
RCARS.hbike = { name: 'Hover Bike', style: 'bike', top: 34, acc: 25, grip: 3.0, price: 2500 };
const VEL_STRIPES = ['#f4f8ff', '#1e1c22', '#ffd36a', '#ff3b2a', '#4fd2ff', '#c86aff', '#6fdc5a', '#ff9a3c'], VEL_PATS = ['None', 'Racing stripe', 'Twin stripes', 'Side flash'];
const VEL_UP = { eng: ['Engine', 'top speed and acceleration'], mag: ['Magnets', 'grip in the turns'], bst: ['Boost', 'bigger meter, harder push'] }, VEL_COST = [1500, 3000, 6000, 10000, 16000];
function velR() { const R = rs(); R.up = R.up || { eng: 0, mag: 0, bst: 0 }; if (R.stripe == null) R.stripe = 0; if (R.pat == null) R.pat = 1; return R; }
function velStats() { const R = velR(), C = RCARS[R.car] || RCARS.mk1, U = R.up; return { top: C.top * (1 + 0.06 * U.eng), acc: C.acc * (1 + 0.08 * U.eng), grip: (C.grip || 2.2) * (1 + 0.22 * U.mag), bcap: 1 + 0.25 * U.bst, bpow: 1 + 0.12 * U.bst }; }

// ---- detailed hover cars (front is +z) ----
function velCar(style, col, stripe, pat) {
  const g = new THREE.Group(), c = col || '#ff3b2a', dk = '#2b2a2c', mt = '#5d636c', gl = glow('#8fd0ff'), hov = glow('#4fd2ff'), P = (geo, m, x, y, z, rx, ry, rz) => part(g, geo, m, x, y, z, rx, ry, rz);
  const pads = (pts, r) => pts.forEach(([x, z]) => { P(Cy(r, r * 1.1, 0.12, 10), dk, x, 0.3, z); P(Cy(r * 0.75, r * 0.75, 0.03, 10), hov, x, 0.235, z); });
  const lamps = (w, y, zf, zb) => { for (const s of [-1, 1]) { P(B(0.28, 0.1, 0.06), glow('#f4f8ff'), s * w, y, zf); P(B(0.3, 0.08, 0.05), glow('#ff3b2a'), s * w, y, zb); } };
  const stripes = (top, L, w, z0) => { const sc = stripe || '#f4f8ff', z = z0 || 0; if (pat === 1) P(B(0.26, 0.02, L), sc, 0, top + 0.01, z); if (pat === 2) for (const s of [-1, 1]) P(B(0.12, 0.02, L), sc, s * 0.2, top + 0.01, z); if (pat === 3) for (const s of [-1, 1]) P(B(0.02, 0.1, L * 0.8), sc, s * (w / 2 + 0.01), top - 0.15, z, 0, 0, 0); };
  if (style === 'bike') {
    P(B(0.42, 0.34, 1.7), c, 0, 0.72, 0); P(B(0.36, 0.26, 0.7), c, 0, 0.82, 0.85, -0.25); P(B(0.3, 0.12, 0.8), dk, 0, 0.95, -0.35); P(B(0.34, 0.22, 0.04), gl, 0, 1.0, 0.7, -0.6);
    P(Cy(0.03, 0.03, 0.9, 5), mt, 0, 1.02, 0.55, 0, 0, Math.PI / 2); for (const s of [-1, 1]) { P(B(0.08, 0.06, 0.18), dk, s * 0.42, 1.02, 0.55); P(B(0.05, 0.22, 0.7), dk, s * 0.24, 0.62, -0.1); }
    for (const z of [0.95, -0.95]) { P(new THREE.TorusGeometry(0.3, 0.07, 6, 14), dk, 0, 0.42, z, Math.PI / 2, 0, 0); P(Cy(0.24, 0.24, 0.03, 12), hov, 0, 0.36, z); }
    P(Cy(0.12, 0.16, 0.4, 8), dk, 0, 0.7, -0.95, Math.PI / 2); P(Cy(0.11, 0.11, 0.04, 8), glow('#ff9a3c'), 0, 0.7, -1.16, Math.PI / 2);
    P(B(0.16, 0.08, 0.05), glow('#f4f8ff'), 0, 0.82, 1.2); P(B(0.18, 0.06, 0.04), glow('#ff3b2a'), 0, 0.85, -0.82); stripes(0.89, 1.4, 0.42, 0);
    return g;
  }
  if (style === 'muscle') {
    P(B(1.9, 0.5, 3.1), c, 0, 0.62, 0); P(B(1.5, 0.42, 1.25), dk, 0, 1.06, -0.35); P(B(1.36, 0.34, 0.06), gl, 0, 1.06, 0.3, -0.5); P(B(1.36, 0.3, 0.06), gl, 0, 1.08, -1.0, 0.45);
    P(B(0.7, 0.2, 0.8), dk, 0, 0.95, 1.0); P(B(0.5, 0.06, 0.1), glow('#ff6a1a'), 0, 1.0, 1.4); P(B(2.0, 0.3, 0.35), dk, 0, 0.45, 1.6); P(B(1.9, 0.08, 0.5), c, 0, 1.3, -1.45); for (const s of [-1, 1]) P(B(0.08, 0.35, 0.3), dk, s * 0.8, 1.12, -1.45);
    for (const s of [-1, 1]) { P(Cy(0.3, 0.3, 0.8, 12), dk, 0.6 * s, 0.6, -1.5, Math.PI / 2); P(Cy(0.24, 0.24, 0.05, 12), glow('#ff6a1a'), 0.6 * s, 0.6, -1.92, Math.PI / 2); P(B(0.2, 0.18, 2.4), mt, 1.0 * s, 0.42, 0); }
    pads([[-0.75, 1.1], [0.75, 1.1], [-0.75, -1.1], [0.75, -1.1]], 0.32); lamps(0.65, 0.68, 1.56, -1.56); stripes(0.87, 3.0, 1.9);
  } else if (style === 'jet') {
    P(B(0.8, 0.36, 3.4), c, 0, 0.58, 0); P(new THREE.ConeGeometry(0.42, 1.5, 6), c, 0, 0.58, 2.4, Math.PI / 2); P(new THREE.SphereGeometry(0.42, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), gl, 0, 0.74, 0.5); g.children[g.children.length - 1].scale.set(1, 0.8, 2.0);
    for (const s of [-1, 1]) { P(B(1.7, 0.06, 1.3), c, 0.95 * s, 0.5, -0.7, 0, 0.35 * s, 0); P(B(0.08, 0.5, 0.7), dk, 1.75 * s, 0.7, -1.0); P(B(0.06, 0.04, 1.0), glow('#4fd2ff'), 1.75 * s, 0.97, -1.0); }
    P(B(0.06, 0.8, 0.9), c, 0, 1.05, -1.3, -0.3); P(Cy(0.3, 0.4, 0.9, 12), dk, 0, 0.58, -2.05, Math.PI / 2); P(Cy(0.28, 0.28, 0.05, 12), glow('#4fd2ff'), 0, 0.58, -2.52, Math.PI / 2);
    pads([[-0.4, 1.3], [0.4, 1.3], [-1.3, -0.8], [1.3, -0.8]], 0.25); lamps(0.25, 0.6, 1.72, -1.72); stripes(0.76, 3.0, 0.8);
  } else if (style === 'buggy') {
    P(B(1.2, 0.26, 2.3), c, 0, 0.62, 0); P(B(0.6, 0.4, 0.6), dk, 0, 0.92, -0.25); P(B(1.1, 0.06, 0.9), mt, 0, 1.6, -0.15);
    for (const s of [-1, 1]) { P(Cy(0.05, 0.05, 1.0, 5), mt, 0.5 * s, 1.1, 0.2, 0.3, 0, 0); P(Cy(0.05, 0.05, 1.0, 5), mt, 0.5 * s, 1.1, -0.55, -0.3, 0, 0); for (const z of [-1, 1]) { P(B(0.5, 0.08, 0.12), mt, 0.75 * s, 0.55, z * 0.95); P(Cy(0.34, 0.38, 0.22, 12), dk, 1.05 * s, 0.45, z * 0.95); P(Cy(0.26, 0.26, 0.03, 12), hov, 1.05 * s, 0.33, z * 0.95); } }
    P(B(1.0, 0.1, 0.1), glow('#ffd36a'), 0, 1.66, 0.3); lamps(0.4, 0.66, 1.16, -1.16); stripes(0.75, 2.2, 1.2);
    return g;
  } else if (style === 'hauler') {
    P(B(1.9, 1.0, 1.4), c, 0, 0.95, 1.0); P(B(1.8, 0.5, 0.06), gl, 0, 1.22, 1.71); P(B(2.0, 1.3, 2.2), mt, 0, 1.1, -0.9); P(B(2.02, 0.12, 2.22), c, 0, 1.6, -0.9); P(B(2.1, 0.2, 3.7), dk, 0, 0.4, 0);
    for (const s of [-1, 1]) P(Cy(0.12, 0.12, 1.2, 6), '#9aa1aa', 0.75 * s, 1.9, 0.6); P(B(1.8, 0.1, 0.1), glow('#ffd36a'), 0, 1.5, 1.72);
    pads([[-0.8, 1.3], [0.8, 1.3], [-0.8, 0], [0.8, 0], [-0.8, -1.4], [0.8, -1.4]], 0.32); lamps(0.75, 0.75, 1.72, -2.02); stripes(1.66, 2.0, 2.0, -0.9);
  } else if (style === 'manta') {
    P(B(1.4, 0.3, 2.6), c, 0, 0.55, 0); for (const s of [-1, 1]) { P(B(1.4, 0.1, 1.8), c, 1.2 * s, 0.48, -0.2, 0, 0.3 * s, 0.08 * s); P(B(0.05, 0.04, 1.6), glow(c), 1.88 * s, 0.5, -0.4, 0, 0.3 * s, 0); }
    P(new THREE.SphereGeometry(0.5, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), gl, 0, 0.7, 0.35); P(B(0.06, 0.6, 0.6), c, 0, 0.95, -1.1, -0.4); P(B(1.0, 0.18, 0.3), dk, 0, 0.55, -1.35); P(B(0.9, 0.08, 0.05), glow('#4fd2ff'), 0, 0.55, -1.51);
    pads([[-0.5, 1.0], [0.5, 1.0], [-1.6, -0.4], [1.6, -0.4]], 0.28); lamps(0.5, 0.58, 1.31, -1.36); stripes(0.7, 2.4, 1.4);
  } else if (style === 'bubble') {
    P(new THREE.SphereGeometry(0.95, 14, 10), c, 0, 0.95, 0); P(new THREE.SphereGeometry(0.66, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), gl, 0, 1.3, 0.3); P(new THREE.TorusGeometry(1.05, 0.12, 6, 20), dk, 0, 0.62, 0, Math.PI / 2);
    P(Cy(0.28, 0.28, 0.06, 12), glow('#ffd36a'), 0, 0.95, -0.96, Math.PI / 2); pads([[0, 0.7], [-0.6, -0.4], [0.6, -0.4]], 0.3); lamps(0.35, 0.95, 0.93, -0.93); if (pat) P(new THREE.TorusGeometry(0.97, 0.05, 4, 20), stripe || '#f4f8ff', 0, 0.95, 0, 0, Math.PI / 2, 0);
  } else if (style === 'phantom') {
    const pk = glow('#c86aff'); P(B(1.55, 0.3, 3.3), '#1e1c22', 0, 0.55, 0); P(B(1.2, 0.26, 1.5), '#2b2a2c', 0, 0.8, -0.15); P(B(1.04, 0.22, 0.06), pk, 0, 0.84, 0.6, -0.55); P(B(1.5, 0.2, 0.75), '#1e1c22', 0, 0.5, 1.98, 0.2); P(B(1.0, 0.16, 0.5), '#2b2a2c', 0, 0.58, 1.9, 0.28); P(B(1.66, 0.04, 0.42), '#1e1c22', 0, 0.36, 2.2); P(B(1.5, 0.03, 0.05), pk, 0, 0.38, 2.41); for (const s of [-1, 1]) P(B(0.2, 0.18, 0.6), '#2b2a2c', 0.7 * s, 0.5, 2.0, 0.15, 0.12 * s, 0);
    for (const s of [-1, 1]) { P(B(0.04, 0.04, 3.1), pk, 0.78 * s, 0.62, 0); P(B(0.9, 0.05, 1.5), '#1e1c22', 1.05 * s, 0.5, -0.85, 0, 0.4 * s, -0.2 * s); P(B(0.06, 0.6, 0.5), '#1e1c22', 0.6 * s, 0.95, -1.4, 0, 0, 0.3 * s); }
    P(B(1.4, 0.04, 3.0), pk, 0, 0.36, 0); pads([[-0.6, 1.1], [0.6, 1.1], [-0.6, -1.1], [0.6, -1.1]], 0.3); lamps(0.55, 0.5, 2.36, -1.66); stripes(0.71, 3.0, 1.55);
  } else { // wedge
    P(B(1.5, 0.32, 3.0), c, 0, 0.55, -0.1); P(B(1.5, 0.22, 0.9), c, 0, 0.5, 1.55, 0.22); P(B(1.1, 0.3, 1.1), dk, 0, 0.84, -0.25); P(B(1.02, 0.26, 0.05), gl, 0, 0.86, 0.33, -0.55);
    for (const s of [-1, 1]) { P(B(0.36, 0.3, 1.8), mt, 0.86 * s, 0.5, -0.3); P(B(0.1, 0.5, 0.6), c, 0.55 * s, 0.98, -1.35, 0.25, 0, 0.12 * s); P(Cy(0.18, 0.2, 0.55, 10), dk, 0.5 * s, 0.55, -1.75, Math.PI / 2); P(Cy(0.15, 0.15, 0.04, 10), glow('#ff9a3c'), 0.5 * s, 0.55, -2.04, Math.PI / 2); }
    P(B(1.7, 0.06, 0.45), c, 0, 1.24, -1.4); pads([[-0.7, 1.0], [0.7, 1.0], [-0.7, -1.2], [0.7, -1.2]], 0.3); lamps(0.5, 0.56, 1.98, -1.62); stripes(0.71, 3.0, 1.5, -0.1);
  }
  if (style !== 'bubble') P(B(1.2, 0.03, 2.4), glow(c), 0, 0.22, 0);
  return g;
}
const velPaint = R => [RPAINTS[R.paint || 0], VEL_STRIPES[R.stripe || 0], R.pat || 0];
makeHoverCar = function (col, style) { const R = velR(); return velCar(style || 'wedge', col, VEL_STRIPES[R.stripe || 0], R.pat == null ? 1 : R.pat); };
function velMyCar() { const R = velR(), C = RCARS[R.car] || RCARS.mk1, [c, s, p] = velPaint(R); return velCar(C.style, c, s, p); }

// ---- the level: flat glass, the floating town, the bridge, the storm ----
Object.assign(LEVELS.speedway, {
  tag: 'The magnet storm planet', weather: 'storm', lvls: 'All levels · hover races', radius: 330,
  carve: (x, z, h) => h,
  terrain: { a1: 0, f1: 0.035, a2: 0, f2: 0.08, a3: 0, f3: 0.2, base: 0.3, min: 0.1, edge: 34, step: 3, noTerrace: true },
  palette: { grass: '#6a707a', patch: '#5a606a', dirt: '#2b2a2c', sand: '#8a909a', wet: '#3a3e46', rockA: '#4a4e56', rockB: '#3a3e46' },
  tint: { hor: '#3a4250', mid: '#232a36', top: '#0c1018', k: 0.65 },
  zones: [{ id: 'pits', name: 'Pit Row', lvl: 'Safe · the floating town', x: 0, z: -20, r: 26, fr: 1, col: '#5a606a', safe: true, h: 0.3 },
    { id: 'flats', name: 'The Mirror Flats', lvl: 'Free drive · magnet storm', x: 0, z: 34, r: 330, fr: 1, col: '#6a707a', h: 0.3 }],
  safes: [{ x: 0, z: -20, r: 28 }], spawn: { x: 0, z: -8, yaw: Math.PI }, pad: { x: 18, z: -36 }, menu: { x: 0, z: 60, r: 90, h: 30 }, npcBase: [0, -14]
});
LEVELS.speedway.npcs.forEach(n => { if (n.id === 'vroom') { n.x = 0; n.z = 10; } if (n.id === 'gus') { n.x = 9; n.z = 2; } if (n.id === 'pita') { n.x = -9; n.z = 2; } });
LEVELS.speedway.npcs.find(n => n.id === 'vroom').idle = ["Three courses. No roads. No walls. Find your own line, rookie!", "The ground's glass and the brakes are a suggestion. Welcome to Velocity!"];
LEVELS.speedway.npcs.find(n => n.id === 'gus').idle = ["Magnets, engine, boost. I can tune all three. I can't make the glass less slippery.", "Want stripes? Everyone wants stripes. Stripes are faster. Science."];
LEVELS.speedway.build = function () {
  VEL.built = true; VEL.ref = null; VEL.base = null; VEL.low = { C: [], B: [] }; VEL.up = { C: [], B: [] }; VEL.carObj = null; VEL.carKey = ''; VEL.gateRings = {}; VEL.bolts = [];
  for (const k in RTRACKS) trackLen(RTRACKS[k]);
  const Y = VCITY.y, cx = VCITY.x, cz = VCITY.z, W = VCITY.hx * 2, D = VCITY.hz * 2, upC = (x, z, r) => VEL.up.C.push([x, z, r]), upB = (x, z, hx, hz) => VEL.up.B.push([x, z, hx, hz]);
  // glassy ground
  levelGroup.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && o.material.vertexColors) { o.material = psx(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: new THREE.Color('#5a6a80'), color: new THREE.Color('#c8d0dc') })); } });
  // the floating town: a thick deck held up by magnet pylons
  const city = new THREE.Group(); city.position.set(cx, Y, cz); levelGroup.add(city);
  part(city, B(W, 1.6, D), '#4a4e56', 0, -0.8, 0); part(city, B(W - 1, 0.06, D - 1), toon('#5d636c', 'panel'), 0, 0.03, 0); part(city, B(W + 0.6, 0.5, D + 0.6), '#2b2a2c', 0, -1.6, 0);
  for (let i = 0; i < 6; i++) part(city, B(W - 4, 0.04, 0.12), glow('#4fd2ff'), 0, 0.07, -D / 2 + 4 + i * (D - 8) / 5);
  // rails with a gap for the bridge
  for (const s of [-1, 1]) { part(city, B(0.25, 1.1, D), '#2b2a2c', s * (W / 2 - 0.15), 0.55, 0); part(city, B(0.12, 0.06, D), glow('#4fd2ff'), s * (W / 2 - 0.15), 1.12, 0); }
  part(city, B(W, 1.1, 0.25), '#2b2a2c', 0, 0.55, -D / 2 + 0.15); part(city, B(W, 0.06, 0.12), glow('#4fd2ff'), 0, 1.12, -D / 2 + 0.15);
  for (const s of [-1, 1]) { const w = W / 2 - VBR.hw; part(city, B(w, 1.1, 0.25), '#2b2a2c', s * (VBR.hw + w / 2), 0.55, D / 2 - 0.15); part(city, B(w, 0.06, 0.12), glow('#4fd2ff'), s * (VBR.hw + w / 2), 1.12, D / 2 - 0.15); }
  // underside magnets and the pylons that hold it up
  for (const [px, pz] of [[-22, -16], [22, -16], [-22, 16], [22, 16], [0, 0]]) { part(city, Cy(3, 3, 0.4, 16), '#2b2a2c', px, -2.0, pz); part(city, Cy(2.6, 2.6, 0.05, 16), glow('#4fd2ff'), px, -2.22, pz);
    const py = new THREE.Group(); py.position.set(cx + px, 0, cz + pz); levelGroup.add(py); part(py, Cy(1.4, 2.2, 6, 10), '#3a3e46', 0, 3, 0); for (let k = 0; k < 4; k++) part(py, new THREE.TorusGeometry(1.6, 0.18, 6, 16), glow('#4fd2ff'), 0, 7.5 + k * 2.6, 0, Math.PI / 2); part(py, Cy(0.5, 0.5, 11, 8), glow('#8fd0ff'), 0, 11.5, 0);
    VEL.low.C.push([cx + px, cz + pz, 2.3]); py.userData.rings = py.children.slice(1, 5); VEL.pylons = VEL.pylons || []; VEL.pylons.push(py); }
  // garages, a plaza, stands, parked cars and signs up top
  for (let i = 0; i < 5; i++) { const x = -18 + i * 9, gr = makeCityBlock(7, 4, 5, '#3a3d44', i % 2 ? '#ff9a3c' : '#4fd2ff'); gr.position.set(x, Y, cz - 19); levelGroup.add(gr); upB(x, cz - 19, 3.6, 2.6); }
  for (const s of [-1, 1]) { const tw = makeCityBlock(6, 14, 6, '#2e3440', s > 0 ? '#c86aff' : '#4fd2ff'); tw.position.set(s * 24, Y, cz - 14); levelGroup.add(tw); upB(s * 24, cz - 14, 3.1, 3.1); const tw2 = makeCityBlock(5, 9, 5, '#3a3e46', '#ffd36a'); tw2.position.set(s * 25, Y, cz + 4); levelGroup.add(tw2); upB(s * 25, cz + 4, 2.6, 2.6); }
  for (let i = 0; i < 4; i++) { const st = ['wedge', 'muscle', 'jet', 'manta'][i], c = velCar(st, RPAINTS[i + 1], VEL_STRIPES[i % 3], 1 + (i % 3)); mergeChar(c); c.position.set(-13.5 + i * 9, Y, cz - 12); c.rotation.y = 0.2; levelGroup.add(c); upB(-13.5 + i * 9, cz - 12, 1, 1.8); }
  for (const s of [-1, 1]) { const gs = new THREE.Group(); for (let k = 0; k < 4; k++) part(gs, B(12, 0.6, 1.6), k % 2 ? '#4a4e56' : '#5d636c', 0, 0.3 + k * 0.6, -k * 1.6); gs.position.set(s * 17, Y, cz + 14); gs.rotation.y = Math.PI + s * 0.25; levelGroup.add(gs); upB(s * 17, cz + 14, 6.2, 3.4); }
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.6), new THREE.MeshBasicMaterial({ map: signTex('PIT ROW · VELOCITY', '#1e1c22', '#4fd2ff'), side: THREE.DoubleSide })); sg.position.set(0, Y + 7, cz + VCITY.hz - 0.4); levelGroup.add(sg); const sg2 = sg.clone(); sg2.material = sg.material.clone(); sg2.material.side = THREE.FrontSide; sg2.rotation.y = Math.PI; sg2.position.z -= 0.2; sg.material.side = THREE.FrontSide; levelGroup.add(sg2); for (const s of [-1, 1]) { part(levelGroup, B(0.5, 7, 0.5), '#2b2a2c', s * 7.4, Y + 3.5, cz + VCITY.hz - 0.5); upC(s * 7.4, cz + VCITY.hz - 0.5, 0.4); } }
  { const pad = new THREE.Group(); part(pad, Cy(3.0, 3.0, 0.12, 20), '#4f4c46', 0, 0.06, 0); part(pad, new THREE.RingGeometry(2.3, 2.6, 24), glow('#f6b56a'), 0, 0.14, 0, -Math.PI / 2); const ship = makeDropship(); ship.rotation.y = 0.6; pad.add(ship); pad.position.set(18, Y, -36); levelGroup.add(pad); upC(18, -36, 2.4); INTERACTS.push({ x: 18, z: -36, r: 4.2, label: 'Return to your ship', fn: () => boardShip() }); }
  // lamps on the town (one light keeps phones fast)
  { const L = new THREE.PointLight(0x8fd0ff, 0.9, 60, 1.4); L.position.set(cx, Y + 9, cz); levelGroup.add(L); }
  // the ramp bridge
  { const len = VBR.z1 - VBR.z0, ang = Math.atan2(Y - 0.3, len), hyp = Math.hypot(len, Y - 0.3), br = new THREE.Group(); br.position.set(VBR.x, (Y + 0.3) / 2, (VBR.z0 + VBR.z1) / 2); br.rotation.x = ang; levelGroup.add(br);
    part(br, B(VBR.hw * 2, 0.8, hyp), '#4a4e56', 0, -0.4, 0); part(br, B(VBR.hw * 2 - 0.6, 0.05, hyp), toon('#5d636c', 'panel'), 0, 0.03, 0); part(br, B(0.25, 0.04, hyp), glow('#ffd36a'), 0, 0.07, 0);
    for (const s of [-1, 1]) { part(br, B(0.25, 1.0, hyp), '#2b2a2c', s * (VBR.hw - 0.12), 0.5, 0); part(br, B(0.12, 0.06, hyp), glow('#4fd2ff'), s * (VBR.hw - 0.12), 1.02, 0); }
    for (let k = 1; k < 5; k++) { const z = VBR.z0 + len * k / 5, h = velBridgeY(k / 5); for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(VBR.x + s * (VBR.hw + 0.8), 0, z); levelGroup.add(p); part(p, Cy(0.5, 0.8, h - 0.6, 8), '#3a3e46', 0, (h - 0.6) / 2, 0); part(p, new THREE.TorusGeometry(0.75, 0.1, 6, 12), glow('#4fd2ff'), 0, h * 0.7, 0, Math.PI / 2); VEL.low.C.push([VBR.x + s * (VBR.hw + 0.8), z, 0.8]); } } }
  // start line at the foot of the bridge
  { const gan = new THREE.Group(); for (const s of [-1, 1]) part(gan, B(0.6, 7, 0.6), '#2b2a2c', 9 * s, 3.5, 0); part(gan, B(19, 1, 0.6), '#2b2a2c', 0, 7, 0); const sg = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.9), new THREE.MeshBasicMaterial({ map: signTex('START · STORM GATE', '#1e1c22', '#ffd36a'), side: THREE.DoubleSide })); sg.position.set(0, 7, 0.32); gan.add(sg); gan.position.set(0, groundH(0, 133), 133); levelGroup.add(gan); VEL.low.C.push([-9, 133, 0.5], [9, 133, 0.5]); for (let i = 0; i < 18; i++) for (let j = 0; j < 2; j++) part(levelGroup, B(1, 0.04, 1), glow((i + j) % 2 ? '#f4f8ff' : '#1e1c22'), -8.5 + i, groundH(0, 133) + 0.04, 132.5 + j); }
  // ring gates for every course (only the course you're on lights up)
  for (const [k, T] of Object.entries(RTRACKS)) { VEL.gateRings[k] = T.gates.map((gs, gi) => { const [x, z, a] = trackAt(T, gs), last = gi === T.gates.length - 1, r = new THREE.Group();
    const ring = part(r, new THREE.TorusGeometry(7, 0.35, 8, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(last ? '#ffd36a' : T.col).convertSRGBToLinear(), transparent: true, opacity: 0.35, fog: false }), 0, 7.4, 0);
    for (const s of [-1, 1]) part(r, Cy(0.3, 0.5, 1.2, 8), '#2b2a2c', s * 7.2, 0.6, 0);
    if (last) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.2), new THREE.MeshBasicMaterial({ map: signTex('FINISH · ' + T.name.toUpperCase(), '#1e1c22', '#ffd36a'), side: THREE.DoubleSide, fog: false })); sg.position.set(0, 15.2, 0); r.add(sg); }
    r.position.set(x, groundH(x, z), z); r.rotation.y = a; levelGroup.add(r); r.userData.ring = ring; return r; }); }
  // the headlight (one spotlight, only on your car)
  VEL.lamp = new THREE.SpotLight(0xfff4e0, 0, 75, 0.55, 0.6, 1.2); VEL.lampT = new THREE.Object3D(); levelGroup.add(VEL.lamp, VEL.lampT); VEL.lamp.target = VEL.lampT;
  // speed streaks: wisps of fog that rush past
  { const N = 80, pos = new Float32Array(N * 6), g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const l = new THREE.LineSegments(g2, new THREE.LineBasicMaterial({ color: '#c8d4e8', transparent: true, opacity: 0, depthWrite: false })); l.frustumCulled = false; levelGroup.add(l); VEL.streaks = { l, N, p: [], init: false }; }
  levelAnims.push(t => velAnim(t));
};
function velAnim(t) {
  for (const py of VEL.pylons || []) if (py.parent) py.userData.rings.forEach((r, i) => { r.position.y = 7.5 + i * 2.6 + Math.sin(t * 2 + i) * 0.25; });
  if (RC.on && RC.T && VEL.gateRings[RC.tid]) VEL.gateRings[RC.tid].forEach((r, i) => { const m = r.userData.ring.material; m.opacity = i === RC.gate ? 0.95 : i < RC.gate ? 0.12 : 0.35; r.userData.ring.rotation.z = i === RC.gate ? t * 1.5 : 0; });
  else for (const k in VEL.gateRings) VEL.gateRings[k].forEach(r => { r.userData.ring.material.opacity = 0.3; });
}

// ---- hover physics ----
function velPhysics(dt) {
  const K = velStats(), p = player.pos, frozen = dlgOpen || chatOpen();
  const th = frozen ? 0 : (keys.KeyW ? 1 : 0) + Math.max(0, move.y), br = frozen ? 0 : (keys.KeyS ? 1 : 0) + Math.max(0, -move.y), st = frozen ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + move.x;
  const drift = !frozen && (keys.Space || VEL.driftHeld), boosting = !frozen && (keys.ShiftLeft || keys.ShiftRight) && VEL.bm > 0.02 && th > 0;
  RC.vx = RC.vx || 0; RC.vz = RC.vz || 0; RC.vy = RC.vy || 0;
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), rx = -fz, rz = fx;
  let vf = RC.vx * fx + RC.vz * fz, vr = RC.vx * rx + RC.vz * rz;
  VEL.ref = p.y; const floor0 = floorAt(p.x, p.z), air = p.y > floor0 + 0.3;
  if (!air) {
    const top = K.top * (boosting ? 1 + 0.18 * K.bpow : 1) * (VEL.kick > 0 ? 1.25 : 1), room = Math.max(0, 1 - Math.pow(Math.max(0, vf) / top, 3));
    vf += th * K.acc * room * dt;
    if (br) vf -= (vf > 0.5 ? 30 : 12) * br * dt;
    if (boosting) { vf += K.acc * 0.9 * K.bpow * room * dt; VEL.bm = Math.max(0, VEL.bm - dt * 0.32); }
    if (VEL.kick > 0) { vf += K.acc * 1.3 * K.bpow * room * dt; VEL.kick -= dt; }
    if (vf > top) vf -= (vf - top) * 2.5 * dt;
    vf -= vf * (th ? 0.01 : 0.06) * dt; vf = Math.max(vf, -10);
    const g = drift ? K.grip * 0.3 : K.grip, vr0 = vr; vr *= Math.exp(-g * dt); if (!drift && vf < top) vf += Math.abs(vr0 - vr) * 0.2;
  }
  // drifting fills the drift meter; letting go fires a boost
  if (drift && !air && Math.abs(vr) > 3 && vf > 10) { VEL.dm = Math.min(2.5, VEL.dm + dt); VEL.bm = Math.min(K.bcap, VEL.bm + dt * 0.12); if (Math.random() < dt * 30) burst(p.clone().add(V(rx * 1.2 * Math.sign(-vr), 0.3, rz * 1.2 * Math.sign(-vr))), Math.random() < 0.5 ? '#4fd2ff' : '#c86aff', 1, 2); }
  if (!drift && VEL.wasDrift && VEL.dm > 0.5) { VEL.kick = VEL.dm * 0.8; toast('DRIFT BOOST', `${VEL.dm.toFixed(1)}s drift`, 0.9); SFX.coin(); }
  if (!drift) VEL.dm = 0; VEL.wasDrift = drift;
  VEL.bm = Math.min(K.bcap, VEL.bm + dt * 0.05);
  // steering eases in (no keyboard twitch) and calms down at high speed so long straights stay straight
  VEL.stS = (VEL.stS || 0) + (st - (VEL.stS || 0)) * Math.min(1, dt * (st ? 9 : 14));
  const steerK = (drift ? 1.95 : 1.6) * Math.min(1, 0.3 + Math.abs(vf) / 16) * (air ? 0.4 : 1) / (1 + Math.max(0, Math.abs(vf) - 35) / (drift ? 110 : 70));
  player.yaw -= VEL.stS * steerK * dt * (vf < -1 ? -1 : 1);
  RC.vx = fx * vf + rx * vr; RC.vz = fz * vf + rz * vr;
  // move, then bounce off whatever we hit
  const ix = p.x + RC.vx * dt, iz = p.z + RC.vz * dt; p.x = ix; p.z = iz; collide(p, 0.9, false); velClamp(p);
  const nx = p.x - ix, nz = p.z - iz, nl = Math.hypot(nx, nz);
  if (nl > 0.01) { const ux = nx / nl, uz = nz / nl, vn = RC.vx * ux + RC.vz * uz; if (vn < 0) { RC.vx -= ux * vn * 1.4; RC.vz -= uz * vn * 1.4; RC.vx *= 0.85; RC.vz *= 0.85; if (-vn > 6 && (!RC.wallT || gameTime - RC.wallT > 0.35)) { RC.wallT = gameTime; SFX.hit(); FX.shake = Math.min(1, (FX.shake || 0) + 0.4); } } }
  // hover height, gravity and jumps off the bridge
  const floor1 = floorAt(p.x, p.z); RC.vy -= 22 * dt; p.y += RC.vy * dt;
  // stick to the road going downhill (the ramp used to bounce you down it in little hops)
  if (!air && RC.vy <= 0.5 && p.y > floor1 && p.y - floor1 < 0.35 + Math.hypot(RC.vx, RC.vz) * dt * 0.9) { p.y = floor1; RC.vy = 0; }
  if (p.y <= floor1) { if (air && RC.vy < -9) { SFX.land(); burst(p.clone(), '#8fd0ff', 10, 4); } p.y = floor1; RC.vy = Math.max(0, (floor1 - floor0) / Math.max(dt, 1e-3)) * 0.6; }
  player.onGround = !air; player.vy = 0; RC.v = vf; RC.vr = vr; RC.drift = drift && Math.abs(vr) > 2; RC.boost = boosting || VEL.kick > 0;
  SFX.engine(0.3 + Math.abs(vf) / K.top * 0.7, Math.abs(vf) / 30);
  return { air };
}
// drive while a race or free drive is on
raceDrive = function (dt) {
  const T = RC.T;
  if (RC.free) { const { air } = velPhysics(dt);
    $('zoneN').textContent = 'FREE DRIVE'; $('zoneL').textContent = `Space drift · Shift boost · C camera · X to park`; $('zone').style.opacity = 1; zoneT = 1;
    if (air) RC.airT = (RC.airT || 0) + dt; else if (RC.airT) { if (RC.airT > 1.2) { const cr = Math.round(RC.airT * 25); S.cr += cr; log(`Big air! ${RC.airT.toFixed(1)}s (+${cr} cr)`, 'loot'); SFX.coin(); } RC.airT = 0; }
    return; }
  if (RC.count > 0) { const c0 = Math.ceil(RC.count); RC.count -= dt; const c1 = Math.ceil(RC.count); if (c1 !== c0) { toast(c1 > 0 ? String(c1) : 'GO!', T.name, 0.8); if (c1 > 0) SFX.ui(); else SFX.horn(); } if (RC.count <= 0) RC.t0 = gameTime; VEL.ref = player.pos.y; return; }
  velPhysics(dt);
  const gs = T.gates[RC.gate], [gx, gz] = trackAt(T, gs), gd = Math.hypot(player.pos.x - gx, player.pos.z - gz);
  if (gd < 9.5 && !(T.needHalo && RC.gate >= T.needHalo && !RC.haloDone)) { RC.gate++; SFX.coin(); if (RC.gate >= T.gates.length) return finishRace2(); toast(`GATE ${RC.gate}/${T.gates.length}`, '', 0.8); }
  if (!RC.beacon) { RC.beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 60, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd36a', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, fog: false })); levelGroup.add(RC.beacon); }
  { const g2 = T.gates[Math.min(RC.gate, T.gates.length - 1)], [bx, bz] = trackAt(T, g2); RC.beacon.position.set(bx, groundH(bx, bz) + 30, bz); }
  const left = gd + (T.len - T.gates[Math.min(RC.gate, T.gates.length - 1)]);
  $('zoneN').textContent = `${T.name} · time trial`; $('zoneL').textContent = `Gate ${RC.gate + 1}/${T.gates.length} · ${Math.max(0, Math.round(left))} m to go · ${(gameTime - RC.t0).toFixed(1)}s`; $('zone').style.opacity = 1; zoneT = 1;
};
{ const _sr = startRace2; startRace2 = function (tid) { _sr(tid); RC.vx = 0; RC.vz = 0; RC.vy = 0; VEL.bm = velStats().bcap; VEL.kick = 0; VEL.dm = 0; VEL.ref = 1; player.pos.y = floorAt(player.pos.x, player.pos.z); VEL.cp = null; const T = RC.T; toast(T.name.toUpperCase(), `${Math.round(T.len)} m · ${T.gates.length} ring gates · gold under ${velPar(T).toFixed(0)}s`, 2.5); }; }
const velPar = T => T.par || T.len / (T.gold || 31);
function velMph(v) { return Math.round(Math.abs(v || 0) * 2.237 * 2.4); }
finishRace2 = function () {
  const T = RC.T, R = rs(), el = gameTime - RC.t0, par = velPar(T), keep = { vx: RC.vx || 0, vz: RC.vz || 0 }, medal = el <= par ? 0 : el <= par * 1.2 ? 1 : el <= par * 1.5 ? 2 : 3;
  RC.on = false; if (RC.beacon) levelGroup.remove(RC.beacon); SFX.engine(0, 0);
  const pay = Math.round([1600, 900, 500, 150][medal] * T.pay), best = R.best[RC.tid];
  S.cr += pay; gainXp(Math.round([600, 420, 300, 120][medal] * T.pay));
  if (!best || el < best) R.best[RC.tid] = +el.toFixed(2); if (medal === 0) { R.wins[RC.tid] = (R.wins[RC.tid] || 0) + 1; questProgressKill('racewin_' + RC.tid); }
  toast(['🥇 GOLD!', '🥈 SILVER', '🥉 BRONZE', 'FINISHED'][medal], `${el.toFixed(1)}s (gold under ${par.toFixed(0)}s) · +${pay} cr${!best || el < best ? ' · NEW BEST' : ''}`, 5); medal === 0 ? (SFX.level(), SFX.cheer()) : SFX.quest();
  log(`${T.name}: ${el.toFixed(1)}s, ${['gold', 'silver', 'bronze', 'no'][medal]} medal (+${pay} cr).`, 'loot');
  const allWon = Object.keys(RTRACKS).filter(k => !RTRACKS[k].bonus).every(k => (R.wins[k] || 0) > 0); if (allWon && !R.owned.includes('phantom')) { R.owned.push('phantom'); S.flags = S.flags || {}; S.flags.racerCape = true; toast('GRAND CHAMPION', 'Gold on every course: The Phantom car + Checkered Cape!', 6); }
  if (typeof lbPush === 'function') lbPush(true); checkReady(); markDirty();
  // keep driving after the finish
  RC = { on: true, free: true, vx: keep.vx, vz: keep.vz, vy: 0 };
};
// ---- race control and the garage ----
openRaceMenu = function () {
  openDlg('Race control', 'Race Marshal Vroom'); const R = velR();
  $('dlgLine').textContent = `Time trials across the Mirror Flats. Fly through the ring gates in order and beat the clock. There are no roads and no walls, so pick your own line. Hold Space to drift (it charges a boost), Shift boosts, C switches the camera. Your car: ${RCARS[R.car].name}.`;
  acts([...Object.entries(RTRACKS).map(([k, T]) => [`${T.name}${R.best[k] ? ' · best ' + R.best[k] + 's' : ''}${R.wins[k] ? ' · 🏆' : ''}`, () => startRace2(k), k === 'storm']), ['Bye', closeDlg]]);
};
openGarage = function () {
  openDlg('Garage', 'Garage Gus'); const R = velR();
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const prev = (style, name) => setPreview(() => { const [c, s, p] = velPaint(R); return velCar(style, c, s, p); }, name);
  const btn = (txt, on, fn, dis) => { const b = document.createElement('button'); b.className = 'pbtn' + (on ? ' go' : ''); b.style.padding = '5px 10px'; b.textContent = txt; b.disabled = !!dis; b.addEventListener('click', fn); return b; };
  const row = (name, meta, b, dotCol) => { const r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = dotCol || '#9aa1aa'; const nm = document.createElement('span'); nm.textContent = name; const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = meta; r.append(dot, nm, mt); if (b) r.append(b); rows.appendChild(r); return r; };
  const render = () => { rows.textContent = ''; const K = velStats(); $('dlgLine').textContent = `${S.cr} cr. Driving the ${RCARS[R.car].name}: top ${velMph(K.top)} mph, grip ${K.grip.toFixed(1)}, boost ${K.bcap.toFixed(2)}.`;
    for (const [k, C2] of Object.entries(RCARS)) { const own = R.owned.includes(k), price = k === 'hbike' && typeof bikeOwned === 'function' && bikeOwned() ? 0 : C2.price;
      const b = own ? btn('Drive', false, () => { R.car = k; markDirty(); render(); prev(C2.style, C2.name); }, R.car === k) : btn(price ? 'Buy' : 'Take', false, () => { S.cr -= price; R.owned.push(k); R.car = k; SFX.item(); markDirty(); render(); prev(C2.style, C2.name); }, C2.prize || S.cr < price);
      const r = row(`${C2.name} · ${velMph(C2.top)} mph`, own ? (R.car === k ? 'Driving' : 'Owned') : C2.prize ? 'Gold on all 3 courses' : price ? price + ' cr' : 'Free with your bike', b, own ? '#6fdc5a' : '#9aa1aa'); r.addEventListener('pointerenter', () => prev(C2.style, C2.name)); }
    for (const [k, [nm, what]] of Object.entries(VEL_UP)) { const L = R.up[k], max = L >= 5, cost = VEL_COST[L];
      row(`${nm} ${'▮'.repeat(L)}${'▯'.repeat(5 - L)}`, max ? 'Maxed' : `${what} · ${cost} cr`, btn(max ? 'Max' : 'Upgrade', false, () => { S.cr -= cost; R.up[k]++; SFX.item(); markDirty(); render(); }, max || S.cr < cost), '#4fd2ff'); }
    const swatches = (label, list, cur, set) => { const r = document.createElement('div'); r.className = 'rowi nodot'; r.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;align-items:center'; const l = document.createElement('span'); l.textContent = label; l.style.minWidth = '64px'; r.appendChild(l);
      list.forEach((c, i) => { const b = document.createElement('button'); b.className = 'pbtn' + (cur === i ? ' go' : ''); b.style.cssText = `padding:5px 12px;background:${c};outline:${cur === i ? '2px solid #fff' : 'none'}`; b.textContent = ' '; b.setAttribute('aria-label', label + ' ' + (i + 1)); b.addEventListener('click', () => { set(i); markDirty(); render(); prev(RCARS[R.car].style, 'Your paint'); }); r.appendChild(b); }); rows.appendChild(r); };
    swatches('Body', RPAINTS, R.paint || 0, i => { R.paint = i; }); swatches('Stripes', VEL_STRIPES, R.stripe || 0, i => { R.stripe = i; });
    { const r = document.createElement('div'); r.className = 'rowi nodot'; r.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;align-items:center'; const l = document.createElement('span'); l.textContent = 'Pattern'; l.style.minWidth = '64px'; r.appendChild(l); VEL_PATS.forEach((n, i) => r.appendChild(btn(n, (R.pat || 0) === i, () => { R.pat = i; markDirty(); render(); prev(RCARS[R.car].style, 'Your paint'); }))); rows.appendChild(r); } };
  $('dlgActs').before(rows); acts([['Free drive', () => { closeDlg(); toggleFreeDrive(); }, true], ['Done', closeDlg]]); render(); showPreviewIn(rows); prev(RCARS[R.car].style, RCARS[R.car].name);
};
{ const _tf = toggleFreeDrive; toggleFreeDrive = function () { const was = RC.on; const _lg = log; if (!was) log = () => {}; let r; try { r = _tf(); } finally { log = _lg; } if (!was && RC.on && RC.free) { toast('FREE DRIVE', `${RCARS[velR().car].name} · the flats are yours`, 2.5); RC.vx = 0; RC.vz = 0; RC.vy = 0; VEL.bm = velStats().bcap; VEL.cp = null; log('Hover drive: W/S gas and brake, A/D or the stick steers, hold Space to drift (charges a boost), Shift boosts, C switches the camera. X to park.', 'loot'); } return r; }; }

// ---- every frame: the camera, your car, the headlight, the HUD ----
function velHudEl() {
  if (VEL.hud) return VEL.hud; const h = document.createElement('div'); h.id = 'velHud';
  h.innerHTML = '<b id="velSpd">0</b><small>mph</small><div class="vb"><i id="velBst"></i></div><div class="vb dr"><i id="velDrf"></i></div>';
  const st = document.createElement('style'); st.textContent = `#velHud{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 46px);transform:translateX(-50%);z-index:6;display:none;text-align:center;color:#e8f0ff;font-family:var(--mono,monospace);text-shadow:0 2px 4px #000;pointer-events:none}
#velHud b{font-size:34px;line-height:1}#velHud small{display:block;font-size:11px;opacity:.8;margin-bottom:4px}#velHud .vb{width:180px;height:7px;background:rgba(0,0,0,.45);border-radius:4px;overflow:hidden;margin:3px auto}#velHud .vb i{display:block;height:100%;width:0;background:#4fd2ff}#velHud .vb.dr i{background:#c86aff}
body.velocity #ammo,body.velocity #cross{display:none!important}body.driving #tFire,body.driving #tReload,body.driving #tMelee,body.driving #tNade,body.driving #tJump{display:none!important}body.driving #tBoost{display:grid!important}
.tbtn#tDrift,.tbtn#tCam{display:none}body.driving #tDrift,body.driving #tCam{display:grid!important}#tDrift{right:20px;bottom:calc(env(safe-area-inset-bottom,0px) + 140px);width:78px;height:78px;background:rgba(200,106,255,.45)}#tCam{right:20px;bottom:calc(env(safe-area-inset-bottom,0px) + 232px);width:56px;height:56px;font-size:11px}
`;
  document.head.appendChild(st); document.body.appendChild(h); VEL.hud = h;
  const tc = $('touch'); if (tc) { const d = document.createElement('button'); d.className = 'tbtn'; d.id = 'tDrift'; d.textContent = 'DRIFT'; d.setAttribute('aria-label', 'Drift'); const c = document.createElement('button'); c.className = 'tbtn'; c.id = 'tCam'; c.textContent = 'CAM'; c.setAttribute('aria-label', 'Switch camera'); tc.append(d, c);
    d.addEventListener('touchstart', e => { VEL.driftHeld = true; e.preventDefault(); }, { passive: false }); for (const ev of ['touchend', 'touchcancel']) d.addEventListener(ev, () => { VEL.driftHeld = false; });
    c.addEventListener('touchstart', e => { velCamNext(); e.preventDefault(); }, { passive: false }); }
  return h;
}
const VEL_CAMS = ['Hood', 'Chase', 'Far chase'];
function velCamNext() { VEL.cam = (VEL.cam + 1) % 3; VEL.cp = null; toast('CAMERA', VEL_CAMS[VEL.cam], 0.8); SFX.ui(); try { PREFS.velCam = VEL.cam; savePrefs(); } catch (_) {} }
if (PREFS.velCam != null) VEL.cam = PREFS.velCam;
window.addEventListener('keydown', e => { if (e.code === 'KeyC' && !e.repeat && LEVEL && LEVEL.id === 'speedway' && RC.on && state === 'play' && !dlgOpen && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) { e.stopImmediatePropagation(); e.preventDefault(); velCamNext(); } }, true);
{ const _fi = fire; fire = function () { if (LEVEL && LEVEL.id === 'speedway') return; return _fi(); }; }
{ const _st = step; step = function (dt) {
  const on = LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly;
  if (on) VEL.ref = player.pos.y;
  _st(dt);
  const cls = on ? (RC.on ? 'velocity driving' : 'velocity') : ''; if (cls !== VEL.cls) { document.body.classList.remove('velocity', 'driving'); if (cls) cls.split(' ').forEach(c => document.body.classList.add(c)); VEL.cls = cls; }
  if (!on) { if (VEL.hud) VEL.hud.style.display = 'none'; return; }
  if (!RC.on) { velClamp(player.pos); VEL.ref = player.pos.y; }
  vm.visible = false; if (typeof vmMelee !== 'undefined') vmMelee.visible = false;
  const hud = velHudEl(); hud.style.display = RC.on ? 'block' : 'none';
  if (VEL.lamp) VEL.lamp.intensity = 0;
  if (!RC.on) { if (VEL.carObj) VEL.carObj.visible = false; velStreaks(dt, 0); return; }
  // your car
  const R = velR(), key = [R.car, R.paint, R.stripe, R.pat].join('|');
  if (key !== VEL.carKey || !VEL.carObj || !VEL.carObj.parent) { if (VEL.carObj && VEL.carObj.parent) VEL.carObj.parent.remove(VEL.carObj); VEL.carObj = mergeChar(velMyCar()); levelGroup.add(VEL.carObj); VEL.carKey = key; }
  const car = VEL.carObj, f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), sp = Math.hypot(RC.vx || 0, RC.vz || 0);
  car.visible = true; car.position.copy(player.pos); car.position.y += VEL_HOVER + Math.sin(gameTime * 4.2) * 0.07; /* Velocity is a magnet: cars float on the field */ car.rotation.set(clamp(-(RC.vy || 0) * 0.02, -0.3, 0.3), player.yaw + Math.PI, clamp((RC.vr || 0) * 0.012, -0.2, 0.2));
  // headlight
  VEL.lamp.intensity = 2.4; VEL.lamp.position.copy(player.pos).addScaledVector(f, 1.8).add(V(0, 0.9, 0)); VEL.lampT.position.copy(player.pos).addScaledVector(f, 22); VEL.lampT.position.y = player.pos.y - 0.5;
  // camera
  if (VEL.cam > 0) { const d = VEL.cam === 1 ? 6.2 : 11.5, h = VEL.cam === 1 ? 2.4 : 4.4, want = player.pos.clone().addScaledVector(f, -d); want.y += h; VEL.ref = player.pos.y; want.y = Math.max(want.y, floorAt(want.x, want.z) + 0.8);
    if (!VEL.cp) VEL.cp = want.clone(); VEL.cp.lerp(want, 1 - Math.exp(-dt * 7)); camera.position.copy(VEL.cp); camera.lookAt(player.pos.x + f.x * 6, player.pos.y + 1.3, player.pos.z + f.z * 6); vmCar.visible = false;}
  else { camera.position.copy(player.pos).addScaledVector(f, 1.0); camera.position.y += 1.2 + VEL_HOVER - 0.08; camera.rotation.set(-0.06, player.yaw, clamp(-(RC.vr || 0) * 0.01, -0.12, 0.12)); vmCar.visible = false; }
  VEL.ref = player.pos.y;
  // HUD
  const K = velStats(); $('velSpd').textContent = velMph(sp); $('velBst').style.width = Math.round(VEL.bm / K.bcap * 100) + '%'; $('velDrf').style.width = Math.round(VEL.dm / 2.5 * 100) + '%';
  velStreaks(dt, sp);
}; }
function velStreaks(dt, sp) {
  const S2 = VEL.streaks; if (!S2) return; const cp = camera.position, k = clamp((sp - 10) / 30, 0, 1); S2.l.material.opacity = k * 0.55; if (k <= 0) return;
  const dx = RC.vx / (sp || 1), dz = RC.vz / (sp || 1), arr = S2.l.geometry.attributes.position.array, len = 1 + sp * 0.12;
  if (!S2.init) { for (let i = 0; i < S2.N; i++) S2.p[i] = [cp.x + (Math.random() - 0.5) * 60, 0.4 + Math.random() * 6, cp.z + (Math.random() - 0.5) * 60]; S2.init = true; }
  for (let i = 0; i < S2.N; i++) { const q = S2.p[i], ox = q[0] - cp.x, oz = q[2] - cp.z, along = ox * dx + oz * dz;
    if (along < -12 || Math.abs(ox * -dz + oz * dx) > 30 || along > 60) { const a = 20 + Math.random() * 40, l = (Math.random() - 0.5) * 50; q[0] = cp.x + dx * a - dz * l; q[2] = cp.z + dz * a + dx * l; q[1] = player.pos.y + 0.3 + Math.random() * 6; }
    arr.set([q[0], q[1], q[2], q[0] - dx * len, q[1], q[2] - dz * len], i * 6); }
  S2.l.geometry.attributes.position.needsUpdate = true;
}

// ---- the storm: always on, rainbow rain, real lightning bolts, longer sight lines ----
{ const _wn = weatherNow; weatherNow = function () { if (LEVEL && LEVEL.id === 'speedway') return 'storm'; return _wn(); }; }
{ const _ue = updateEnv; updateEnv = function (dt, t) { _ue(dt, t); const on = LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly && state !== 'menu';
  if (on !== VEL.rainOn) { VEL.rainOn = on; if (on && !rain.geometry.attributes.color) rain.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(RAIN_N * 6), 3)); rain.material.vertexColors = on; rain.material.color.set(on ? '#ffffff' : '#b4c0dc'); rain.material.needsUpdate = true; }
  if (!on) return;
  scene.fog.far = Math.max(scene.fog.far, 130); scene.fog.near = Math.max(scene.fog.near, 14);
  if (rain.visible && (VEL.rainT = (VEL.rainT || 0) + dt) > 0.08) { VEL.rainT = 0; const col = rain.geometry.attributes.color.array, c = new THREE.Color(), tt = t * 0.25; for (let i = 0; i < RAIN_N; i++) { c.setHSL((tt + i * 0.0137) % 1, 0.85, 0.72); col.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6); } rain.geometry.attributes.color.needsUpdate = true; }
  if (ENV.flash > VEL.lastFlash + 0.5) velBolt(); VEL.lastFlash = ENV.flash;
  for (let i = VEL.bolts.length - 1; i >= 0; i--) { const b = VEL.bolts[i]; b.life -= dt; b.l.material.opacity = Math.max(0, b.life / 0.35); if (b.life <= 0) { if (b.l.parent) b.l.parent.remove(b.l); b.l.geometry.dispose(); VEL.bolts.splice(i, 1); } } }; }
function velBolt() {
  if (!levelGroup) return; const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 130, x = player.pos.x + Math.cos(a) * d, z = player.pos.z + Math.sin(a) * d, pts = []; let px = x, pz = z;
  for (let y = 95; y > 0; y -= 6 + Math.random() * 6) { pts.push(new THREE.Vector3(px, y, pz)); px += (Math.random() - 0.5) * 8; pz += (Math.random() - 0.5) * 8; } pts.push(new THREE.Vector3(px, groundH(px, pz), pz));
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#e8f4ff', transparent: true, opacity: 1, fog: false })); levelGroup.add(l); VEL.bolts.push({ l, life: 0.35 });
  burst(new THREE.Vector3(px, groundH(px, pz) + 0.3, pz), '#8fd0ff', 14, 6);
}

// ---- other players see your car ----
{ const _pw = pvpWrite; pvpWrite = function (p) { _pw(p); if (LEVEL && LEVEL.id === 'speedway' && RC.on) { const R = velR(); p.vc = [(RCARS[R.car] || RCARS.mk1).style, R.paint || 0, R.stripe || 0, R.pat || 0].join('|'); } else p.vc = ''; }; }
{ const _sp = syncPeers; syncPeers = function (peers) { _sp(peers);
  for (const peer of peers) { if (peer.isMe) continue; const r = remotes.get(peer.peer); if (!r) continue; const pr = peer.presence || {}, key = LEVEL && LEVEL.id === 'speedway' && typeof pr.vc === 'string' ? pr.vc.slice(0, 40) : '';
    if (key === (r.vcKey || '')) continue; r.vcKey = key;
    if (r.vcar) { r.obj.remove(r.vcar); r.vcar = null; (r.vcHid || []).forEach(o => { o.visible = true; }); r.vcHid = null; }
    if (key) { const [st, pi, si, pt] = key.split('|'); const style = CAR_STYLES.includes(st) || st === 'phantom' || st === 'bike' ? st : 'wedge';
      r.vcHid = r.obj.children.filter(o => o.visible && !o.isSprite); r.vcHid.forEach(o => { o.visible = false; });
      r.vcar = mergeChar(velCar(style, RPAINTS[+pi % RPAINTS.length] || RPAINTS[0], VEL_STRIPES[+si % VEL_STRIPES.length], (+pt || 0) % 4)); r.obj.add(r.vcar); } } }; }
