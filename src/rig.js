// =================== CHARACTER RIGS + ANIMATION ===================
// Models are built as loose parts; rig() sorts those parts into limbs by where they sit
// (legs below the hip, arms out past the shoulders, head above the neck) and hangs each limb
// on a pivot so it can swing. Then each limb's parts are merged to keep draw calls low.
const RIGS = {
  trooper: { type: 'biped', hip: 0.98, neck: 1.62, armX: 0.21, ax: 0.3, sh: 1.5, legX: 0.13, hold: true },
  civ: { type: 'biped', hip: 0.95, neck: 1.62, armX: 0.24, ax: 0.3, sh: 1.5, legX: 0.11 },
  xr17: { type: 'biped', hip: 0.42, neck: 0.95, armX: 0.3, ax: 0.3, sh: 0.6, legX: 0.13, stiff: true },
  elismas: { type: 'biped', hip: 1.0, neck: 1.5, armX: 0.16, ax: 0.18, sh: 1.43, legX: 0.12 },
  maxurge: { type: 'biped', hip: 0.97, neck: 1.53, armX: 0.24, ax: 0.31, sh: 1.47, legX: 0.13 },
  bughybrid: { type: 'biped', hip: 0.86, neck: 1.86, armX: 0.18, ax: 0.2, sh: 1.62, legX: 0.13 },
  spearman: { type: 'biped', hip: 0.62, neck: 1.16, armX: 0.12, ax: 0.14, sh: 1.05, legX: 0.09 },
  stagrone: { type: 'biped', hip: 0.84, neck: 1.98, armX: 0.06, ax: 0.08, sh: 1.15, legX: 0.11 },
  chunk: { type: 'biped', hip: 0.75, neck: 1.62, armX: 0.32, ax: 0.4, sh: 1.45, legX: 0.16 },
  drome: { type: 'biped', hip: 1.06, neck: 1.82, armX: 0.34, ax: 0.42, sh: 1.76, legX: 0.15 },
  dog: { type: 'quad', hip: 0.48, lx: 0.12, lz: 0.3 },
  gopel: { type: 'quad', hip: 0.55, lx: 0.24, lz: 0.31 },
  porcupine: { type: 'quad', hip: 0.36, lx: 0.2, lz: 0.24 },
  snofel: { type: 'quad', hip: 0.3, lx: 0.18, lz: 0.16 },
  jumper: { type: 'biped', hip: 0.5, neck: 0.9, armX: 0.21, ax: 0.22, sh: 0.82, legX: 0.1 }
};
const _box = new THREE.Box3(), _c = V(0, 0, 0);
const _s = new THREE.Vector3();
function rig(obj, spec) {
  if (obj.userData.anim && obj.children.length <= 1) return obj;
  obj.updateMatrixWorld(true);
  const parts = obj.children.slice();
  const R = { spec };
  const pivot = (name, x, y, z, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); (parent || obj).add(g); R[name] = g; return g; };
  if (spec.type === 'quad') {
    pivot('torso', 0, spec.hip, 0);
    pivot('fl', spec.lx, spec.hip, spec.lz); pivot('fr', -spec.lx, spec.hip, spec.lz); pivot('bl', spec.lx, spec.hip, -spec.lz); pivot('br', -spec.lx, spec.hip, -spec.lz);
  } else {
    const torso = pivot('torso', 0, spec.hip, 0);
    pivot('legL', spec.legX, spec.hip, 0); pivot('legR', -spec.legX, spec.hip, 0);
    pivot('armL', spec.ax, spec.sh - spec.hip, 0, torso); pivot('armR', -spec.ax, spec.sh - spec.hip, 0, torso);
    pivot('head', 0, spec.neck - spec.hip, 0, torso);
  }
  obj.updateMatrixWorld(true);
  for (const c of parts) {
    _box.setFromObject(c); _box.getCenter(_c);
    let target = R.torso;
    if (spec.type === 'quad') {
      if (_c.y < spec.hip - 0.06) target = _c.x >= 0 ? (_c.z >= 0 ? R.fl : R.bl) : (_c.z >= 0 ? R.fr : R.br);
    } else if (_c.y > spec.neck) target = R.head;
    else if (Math.abs(_c.x) > spec.armX && _c.y > spec.hip + 0.05) target = _c.x > 0 ? R.armL : R.armR;
    // hands hang just below the hip line: small parts out at arm width go with the arm, so they stay on the wrist
    else if (Math.abs(_c.x) > spec.armX && _c.y > spec.hip - 0.3 && _box.getSize(_s).length() < 0.3) target = _c.x > 0 ? R.armL : R.armR;
    else if (_c.y < spec.hip && Math.abs(_c.x) > 0.03) target = _c.x > 0 ? R.legL : R.legR;
    target.attach(c);
  }
  obj.userData.rig = R;
  return obj;
}
function mergeNode(node) {
  const buckets = new Map(), drop = [];
  for (const o of node.children) {
    if (!o.isMesh) continue;
    o.updateMatrix();
    let b = buckets.get(o.material); if (!b) { b = { pos: [], nor: [], uv: [] }; buckets.set(o.material, b); }
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrix);
    b.pos.push(g.attributes.position.array); b.nor.push(g.attributes.normal.array); b.uv.push(g.attributes.uv ? g.attributes.uv.array : new Float32Array(g.attributes.position.count * 2)); g.dispose(); drop.push(o);
  }
  drop.forEach(o => node.remove(o));
  const cat = (list) => { let n = 0; list.forEach(a => n += a.length); const r = new Float32Array(n); let off = 0; list.forEach(a => { r.set(a, off); off += a.length; }); return r; };
  for (const [mat, b] of buckets) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(cat(b.pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(b.nor), 3)); g.setAttribute('uv', new THREE.BufferAttribute(cat(b.uv), 2)); g.computeBoundingSphere();
    node.add(new THREE.Mesh(g, mat));
  }
}
function mergeChar(obj) { const nodes = [obj]; obj.traverse(o => { if (o !== obj && !o.isMesh && !o.isSprite && o.children.length) nodes.push(o); }); nodes.forEach(mergeNode); return obj; }
function buildChar(make, rigName) { const o = make(); if (rigName && RIGS[rigName]) rig(o, RIGS[rigName]); return mergeChar(o); }
// procedural animation: walk cycle from real movement speed, idle breathing, attack swing, hit flinch
function animRig(obj, st, dt, t) {
  const R = obj.userData.rig; if (!R) return;
  const p = obj.position;
  if (st.lx === undefined) { st.lx = p.x; st.lz = p.z; st.ph = Math.random() * 6; st.ph0 = Math.random() * 6; st.mv = 0; st.atk = 0; st.hit = 0; }
  const sp = Math.hypot(p.x - st.lx, p.z - st.lz) / Math.max(dt, 1e-3); st.lx = p.x; st.lz = p.z;
  st.mv += (Math.min(1, sp / 2.2) - st.mv) * Math.min(1, dt * 8);
  st.ph += dt * (3 + Math.min(sp, 8) * 2.4);
  const S = R.spec, s = Math.sin(st.ph), mv = st.mv;
  let atk = 0; if (st.atk > 0) { st.atk -= dt; atk = Math.sin(clamp(1 - st.atk / 0.42, 0, 1) * Math.PI); }
  const hit = st.hit > 0 ? st.hit : 0; if (st.hit > 0) st.hit -= dt;
  if (S.type === 'quad') {
    const a = s * 0.6 * mv; R.fl.rotation.x = a; R.br.rotation.x = a; R.fr.rotation.x = -a; R.bl.rotation.x = -a;
    R.torso.position.y = S.hip + Math.abs(Math.cos(st.ph)) * 0.05 * mv + Math.sin(t * 2.4 + st.ph0) * 0.006;
    R.torso.rotation.x = -hit * 2 - atk * 0.25;
    return;
  }
  const a = s * (S.stiff ? 0.38 : 0.62) * mv;
  R.legL.rotation.x = a; R.legR.rotation.x = -a;
  R.torso.position.y = S.hip + Math.abs(Math.cos(st.ph)) * 0.04 * mv + Math.sin(t * 2.1 + st.ph0) * 0.008;
  R.torso.rotation.z = Math.sin(st.ph) * 0.035 * mv;
  R.torso.rotation.x = -hit * 2.2 + atk * 0.2 + 0.04 * mv;
  const sw = S.hold ? 0 : a * 0.85, idle = Math.sin(t * 1.6 + st.ph0) * 0.04;
  R.armL.rotation.x = -sw + idle - (st.gest || 0);
  R.armR.rotation.x = sw - idle - atk * 1.8;
  R.armR.rotation.z = -atk * 0.3;
  if (R.head) { R.head.rotation.y = (st.look || 0); R.head.rotation.x = Math.sin(t * 0.9 + st.ph0) * 0.04; }
}

// Seated pose: hide the straight leg pivots and give the character a flat thigh and a shin bent 90° at the knee.
// The character is placed so its hips rest on a seat seatH above its feet' floor; call after positioning x/z.
function sitChar(o, seatH) {
  const R = o.userData.rig; if (!R || !R.legL) return o;
  const sp = R.spec, hip = sp.hip, th = Math.min(0.5, hip * 0.5), sh = Math.max(0.2, seatH);
  for (const leg of [R.legL, R.legR]) {
    let mat = null; leg.traverse(c => { if (!mat && c.isMesh) mat = c.material; }); leg.visible = false;
    const g = new THREE.Group(); g.position.set(leg.position.x, hip, 0); o.add(g);
    const w = Math.max(0.12, Math.abs(sp.legX) * 1.4);
    const a = new THREE.Mesh(new THREE.BoxGeometry(w, w, th + w / 2), mat); a.position.set(0, 0, th / 2); g.add(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, sh, w), mat); b.position.set(0, -sh / 2, th); g.add(b);
    const f = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, 0.08, w * 1.6), new THREE.MeshLambertMaterial({ color: '#1e1a18' })); f.position.set(0, -sh + 0.04, th + w * 0.3); g.add(f);
  }
  o.position.y += 0; o.userData.seated = 1; return o;
}
