// =================== TUBES AND THE AIRLOCK (2.22.30) ===================
// The Zeltac elevators become Futurama-style pneumatic tubes: a glass tube from floor to ceiling with chrome rings,
// a glowing intake pad and air rushing upward, and a WHOOSH that sucks you up when you pick a floor.
// The plaza's flat blue airlock becomes a real one: a heavy frame, striped blast doors with portholes, beacons and hazard floor.
function zHazardTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#e8b020'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#141218';
  for (let i = -64; i < 128; i += 22) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 11, 0); x.lineTo(i + 11 - 64, 64); x.lineTo(i - 64, 64); x.fill(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
const zIsBox = (o, w, h, d) => { const p = o.isMesh && o.geometry && o.geometry.parameters; return p && Math.abs(p.width - w) < 0.01 && Math.abs(p.height - h) < 0.01 && Math.abs(p.depth - d) < 0.01; };
function zTube() {
  const slab = props.children.find(o => zIsBox(o, 5, 5, 0.4) && Math.abs(o.position.y - 2.5) < 0.01); if (!slab) return;
  const glowP = props.children.find(o => zIsBox(o, 3.6, 4.4, 0.2)); const X = slab.position.x, Zw = slab.position.z; props.remove(slab); if (glowP) props.remove(glowP);
  const Z = Zw - 2.0, H = 10, chrome = toon('#b8bec8'), dark = toon('#2a2d34', 'panel'), cyan = '#7fe8ff';
  part(props, B(5.4, 6.2, 0.4), dark, X, 3.1, Zw); part(props, Cy(1.85, 2.0, 0.3, 28), dark, X, 0.15, Z); const pad = part(props, Cy(1.5, 1.5, 0.04, 28), glow('#2a8aa8'), X, 0.31, Z);
  const ring0 = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.07, 6, 32), glow(cyan)); ring0.rotation.x = Math.PI / 2; ring0.position.set(X, 0.32, Z); levelGroup.add(ring0);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, H, 32, 1, true), new THREE.MeshPhongMaterial({ color: '#bff4ff', transparent: true, opacity: 0.16, shininess: 120, specular: '#ffffff', side: THREE.DoubleSide, depthWrite: false }));
  glass.position.set(X, H / 2 + 0.3, Z); glass.renderOrder = 3; levelGroup.add(glass);
  for (const y of [0.45, 2.6, 4.8, 7]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.09, 6, 32), chrome); r.rotation.x = Math.PI / 2; r.position.set(X, y, Z); levelGroup.add(r); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; part(props, Cy(0.06, 0.06, 7, 6), chrome, X + Math.cos(a) * 1.52, 3.8, Z + Math.sin(a) * 1.52); }
  // an open mouth at the front so you can step in, with a lit arch
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 6, 20, Math.PI), glow(cyan)); arch.position.set(X, 0.32, Z + 1.47); levelGroup.add(arch);
  // air rushing up the tube
  const N = 70, pos = new Float32Array(N * 3), spd = []; for (let i = 0; i < N; i++) { const a = Math.random() * 6.28, r = Math.random() * 1.2; pos.set([X + Math.cos(a) * r, Math.random() * H, Z + Math.sin(a) * r], i * 3); spd.push(3 + Math.random() * 5); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const air = new THREE.Points(g, new THREE.PointsMaterial({ color: '#dffaff', size: 0.12, transparent: true, opacity: 0.7, depthWrite: false })); air.frustumCulled = false; levelGroup.add(air);
  const L = new THREE.PointLight(0x7fe8ff, 1.2, 9, 1.6); L.position.set(X, 2.2, Z); levelGroup.add(L);
  levelAnims.push((t, dt) => { const d = 0.016; for (let i = 0; i < N; i++) { pos[i * 3 + 1] += spd[i] * d; if (pos[i * 3 + 1] > H) pos[i * 3 + 1] = 0.3; } g.attributes.position.needsUpdate = true; pad.material.opacity = 1; ring0.scale.setScalar(1 + Math.sin(t * 3) * 0.03); L.intensity = 1 + Math.sin(t * 2) * 0.25; });
  ZTUBE.at = [X, Z];
}
const ZTUBE = { at: null };
// the WHOOSH: a flash of rushing air and the sound of being sucked upward before the floor changes
{ const _gf = goFloor; goFloor = function () { const a = arguments; if (!ZTUBE.at || state !== 'play') return _gf.apply(this, a);
  try { SFX.door(); for (let i = 0; i < 4; i++) burst(player.pos.clone().add(V(0, 0.5 + i * 0.6, 0)), '#dffaff', 6, 4); } catch (_) {}
  let fl = $('tubeFlash'); if (!fl) { fl = document.createElement('div'); fl.id = 'tubeFlash'; fl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;background:radial-gradient(circle at 50% 60%,#ffffff 0%,#bff4ff 35%,rgba(127,232,255,0) 75%);opacity:0;transition:opacity .25s'; document.body.appendChild(fl); }
  fl.style.opacity = '1'; toast('WHOOSH', 'The tube sucks you upward.', 1.2); setTimeout(() => { _gf.apply(this, a); setTimeout(() => { fl.style.opacity = '0'; }, 250); }, 300); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { ZTUBE.at = null; return _ll(id, o); }; }
for (const lv of ['zfloor', 'zeltac']) { const _b = LEVELS[lv].build; LEVELS[lv].build = function () { _b.apply(this, arguments); try { zTube(); if (lv === 'zeltac') zAirlock(); } catch (e) { console.warn('ztube', e); } }; }
function zAirlock() {
  const slab = props.children.find(o => zIsBox(o, 8, 6, 0.4)), gl = props.children.find(o => zIsBox(o, 6, 5, 0.3)); if (!slab) return; const Zw = slab.position.z - 0.2; props.remove(slab); if (gl) props.remove(gl);
  const dark = toon('#2a2d34', 'panel'), steel = toon('#6a707a', 'panel'), chrome = toon('#b8bec8'), hz = new THREE.MeshLambertMaterial({ map: zHazardTex() });
  // deep frame and an arched lintel
  for (const s of [-1, 1]) { part(props, B(1.6, 6.4, 1.4), dark, s * 4.6, 3.2, Zw); part(props, B(0.3, 5.6, 1.42), hz, s * 3.95, 2.8, Zw); for (let k = 0; k < 5; k++) part(props, B(0.12, 0.12, 0.12), glow(k % 2 ? '#ff8a2a' : '#ffd36a'), s * 4.6, 0.8 + k * 1.1, Zw - 0.72); }
  const lin = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.55, 8, 28, Math.PI), dark); lin.position.set(0, 5.4, Zw); levelGroup.add(lin); lin.scale.y = 0.5;
  // blast doors: two heavy halves with chevrons, a lit seam and a porthole each
  const doors = []; for (const s of [-1, 1]) { const d = new THREE.Group(); part(d, B(3.8, 5.4, 0.5), steel, 0, 2.7, 0); part(d, B(3.8, 0.6, 0.52), hz, 0, 0.5, 0); part(d, B(3.8, 0.12, 0.54), dark, 0, 1.6, 0); part(d, B(3.8, 0.12, 0.54), dark, 0, 4.4, 0);
    const ph = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), new THREE.MeshBasicMaterial({ color: '#0a1428' })); ph.position.set(-s * 0.9, 3.1, -0.27); ph.rotation.y = Math.PI; d.add(ph); const pr = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.06, 6, 20), chrome); pr.position.set(-s * 0.9, 3.1, -0.28); d.add(pr);
    for (let k = 0; k < 3; k++) part(d, new THREE.SphereGeometry(0.02, 4, 4), glow('#ffffff'), -s * 0.9 + (k - 1) * 0.15, 3.1 + (k % 2) * 0.12, -0.29);
    d.position.set(s * 1.9, 0, Zw + 0.3); levelGroup.add(d); doors.push([d, s]); }
  part(props, B(0.08, 5.3, 0.05), glow('#7fe8ff'), 0, 2.7, Zw + 0.02);
  // beacons that spin, a hazard strip on the floor, status panels and the sign
  const bc = []; for (const s of [-1, 1]) { part(props, Cy(0.22, 0.26, 0.3, 10), dark, s * 4.6, 6.55, Zw - 0.3); const b = part(props, Cy(0.18, 0.18, 0.32, 10), glow('#ff8a2a'), s * 4.6, 6.86, Zw - 0.3); props.remove(b); levelGroup.add(b);
    const sl = new THREE.SpotLight(0xff8a2a, 2.5, 14, 0.4, 0.5, 1.5); sl.position.set(s * 4.6, 6.9, Zw - 0.3); levelGroup.add(sl, sl.target); bc.push(sl); }
  levelAnims.push(t => { bc.forEach((L, i) => { const a = t * 3 + i * Math.PI; L.target.position.set(L.position.x + Math.cos(a) * 6, 0, L.position.z - 3 + Math.sin(a) * 6); });
    const near = Math.hypot(player.pos.x, player.pos.z - Zw) < 6, k = near ? 1 : 0; doors.forEach(([d, s]) => { d.position.x += ((s * (1.9 + k * 0.35)) - d.position.x) * 0.08; }); });
  part(props, B(8.4, 0.02, 1.2), hz, 0, 0.012, Zw - 1.6); for (const s of [-1, 1]) part(props, B(0.1, 0.03, 8), glow('#7fe8ff'), s * 3.2, 0.02, Zw - 5.6);
  for (const s of [-1, 1]) { part(props, B(0.9, 1.2, 0.1), toon('#14161c'), s * 5.6, 1.6, Zw - 0.75); for (let k = 0; k < 4; k++) { const l = part(props, B(0.12, 0.12, 0.02), glow(k === 3 ? '#7fff6a' : '#4fd2ff'), s * 5.6 - 0.25 + (k % 2) * 0.5, 1.4 + Math.floor(k / 2) * 0.4, Zw - 0.81); props.remove(l); levelGroup.add(l); if (k === 3) levelAnims.push(t => { l.visible = Math.sin(t * 4 + s) > -0.3; }); } }
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.7), new THREE.MeshBasicMaterial({ map: signTex('AIRLOCK · DOCK 7', '#0f1757', '#ffd75e') })); sg.position.set(0, 6.6, Zw - 0.75); sg.rotation.y = Math.PI; levelGroup.add(sg);
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), new THREE.MeshBasicMaterial({ map: signTex('PRESSURE OK', '#06140a', '#7fff6a') })); ps.position.set(0, 0.95, Zw - 0.75); ps.rotation.y = Math.PI; levelGroup.add(ps);
}
