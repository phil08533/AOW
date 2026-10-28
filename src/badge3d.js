// =================== the Marshal badge as a 3D object: a leather wallet that comes up into view, flips open and shows the star ===================
// mBadgePop() (used by the badge flash and by arrests) now plays this instead of the flat pop-up. The badge face is the same art as the HUD badge.
const MB3 = { g: null, flap: null, face: null, rank: -1, t0: 0, run: false };
function mb3Star(R0, R1, n) { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n, R = i % 2 ? R1 : R0; i ? s.lineTo(Math.cos(a) * R, Math.sin(a) * R) : s.moveTo(Math.cos(a) * R, Math.sin(a) * R); } return s; }
function mb3Build() {
  const g = new THREE.Group(), lea = toon('#3a2214'), lea2 = toon('#2a180e'), gold = new THREE.MeshPhongMaterial({ color: new THREE.Color('#e8b83a').convertSRGBToLinear(), specular: 0xfff0b0, shininess: 70, emissive: new THREE.Color('#3a2a00') });
  // back half of the wallet (holds the badge) and the front flap (ID card side), hinged along the bottom
  const back = new THREE.Group(); g.add(back); part(back, B(0.13, 0.17, 0.012), lea, 0, 0.085, 0); part(back, B(0.118, 0.158, 0.004), lea2, 0, 0.085, 0.007);
  for (const x of [-0.064, 0.064]) part(back, B(0.003, 0.17, 0.014), toon('#c8a060'), x, 0.085, 0);
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(mb3Star(0.058, 0.032, 7), { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0025, bevelSegments: 1 }), gold); star.position.set(0, 0.09, 0.009); back.add(star);
  for (let i = 0; i < 7; i++) { const a = Math.PI / 2 + i * 2 * Math.PI / 7; part(back, new THREE.SphereGeometry(0.0065, 8, 6), gold, Math.cos(a) * 0.058, 0.09 + Math.sin(a) * 0.058, 0.016); }
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const T = new THREE.CanvasTexture(cv);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.03, 28), new THREE.MeshBasicMaterial({ map: T })); face.position.set(0, 0.09, 0.0185); back.add(face);
  const flap = new THREE.Group(); g.add(flap); part(flap, B(0.13, 0.17, 0.012), lea, 0, 0.085, 0); part(flap, B(0.11, 0.07, 0.002), toon('#e8e4dc'), 0, 0.1, -0.007);
  part(flap, B(0.03, 0.036, 0.002), toon('#8a9aaa'), -0.03, 0.1, -0.0085); part(flap, B(0.05, 0.006, 0.002), toon('#3a3a44'), 0.02, 0.112, -0.0085); part(flap, B(0.05, 0.006, 0.002), toon('#3a3a44'), 0.02, 0.098, -0.0085);
  // the shine is drawn on the star's own shape, so it only sweeps across the metal (a band moving along a slanted axis)
  const glint = new THREE.Mesh(star.geometry, new THREE.ShaderMaterial({ uniforms: { u: { value: -1 }, amt: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vp; void main() { vp = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float u; uniform float amt; varying vec2 vp; void main() { float d = abs(dot(vp, vec2(0.83, 0.56)) - u); float k = 1.0 - smoothstep(0.0, 0.016, d); gl_FragColor = vec4(vec3(1.0, 0.96, 0.82) * k * amt, 1.0); }' }));
  glint.position.copy(star.position); glint.position.z += 0.0004; back.add(glint);
  // the glint has to draw after the star (everything here ignores depth so it sits on top of the world)
  const amb = new THREE.AmbientLight(0xffffff, 0.55), key = new THREE.DirectionalLight(0xfff0d0, 0.9); key.position.set(0.3, 0.5, 1); g.add(amb, key);
  g.traverse(o => { o.layers.set(1); o.renderOrder = 999; if (o.material) { o.material = o.material.clone(); o.material.depthTest = false; } });
  glint.renderOrder = 1000;
  flap.position.z = 0.022; Object.assign(MB3, { g, flap, face, tex: T, cv, glint }); g.visible = false; camera.add(g); }
function mb3Face(r) { if (MB3.rank === r) return; MB3.rank = r; const x = MB3.cv.getContext('2d');
  // the seal: navy disc, gold ring, GALACTIC MARSHALS around the edge, a ringed planet, and rank stars underneath
  x.fillStyle = '#c99a2a'; x.beginPath(); x.arc(128, 128, 128, 0, 7); x.fill(); x.fillStyle = '#16204a'; x.beginPath(); x.arc(128, 128, 112, 0, 7); x.fill();
  x.fillStyle = '#ffe27a'; x.font = '700 22px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const arc = (t, a0, a1, R, flip) => { const n = t.length; for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i + 0.5) / n; x.save(); x.translate(128 + Math.cos(a) * R, 128 + Math.sin(a) * R); x.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2)); x.fillText(t[i], 0, 0); x.restore(); } };
  arc('GALACTIC', -Math.PI * 0.82, -Math.PI * 0.18, 92); arc('MARSHALS', Math.PI * 0.8, Math.PI * 0.2, 92, true);
  x.fillStyle = '#4fa8ff'; x.beginPath(); x.arc(128, 122, 30, 0, 7); x.fill(); x.strokeStyle = '#ffe27a'; x.lineWidth = 6; x.beginPath(); x.ellipse(128, 122, 54, 14, -0.3, 0, 7); x.stroke();
  x.fillStyle = '#4fa8ff'; x.beginPath(); x.arc(128, 122, 30, Math.PI * 1.05, Math.PI * 1.95); x.fill();
  for (let i = 0; i < 5; i++) { x.fillStyle = i <= r ? '#ffe27a' : '#2a3466'; x.font = '700 20px sans-serif'; x.fillText('★', 128 + (i - 2) * 22, 176); }
  MB3.tex.needsUpdate = true; }
const mbEase = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
function mb3Tick() { if (!MB3.run) return; const t = (performance.now() - MB3.t0) / 1000, D = 2.1, G = MB3.g;
  if (t >= D || state === 'menu' || state === 'dead') { MB3.run = false; G.visible = false; return; } requestAnimationFrame(mb3Tick);
  const up = mbEase(t / 0.35) - mbEase((t - (D - 0.35)) / 0.35), open = mbEase((t - 0.25) / 0.3) - mbEase((t - (D - 0.5)) / 0.25);
  G.position.set(-0.05, -0.34 + up * 0.24, -0.34); G.rotation.set(-0.15 + (1 - up) * 0.6, -0.12 + Math.sin(t * 2.5) * 0.03, 0.05);
  MB3.flap.rotation.x = open * Math.PI * 0.97; // the ID flap swings down on its bottom hinge
  const gk = (t - 0.7) / 0.45; MB3.glint.material.uniforms.amt.value = gk > 0 && gk < 1 ? Math.sin(gk * Math.PI) * 0.9 : 0; MB3.glint.material.uniforms.u.value = -0.07 + gk * 0.14; }
mBadgePop = function () { try { if (!MB3.g) mb3Build(); mb3Face(mRank()); MB3.t0 = performance.now(); MB3.g.visible = true; if (!MB3.run) { MB3.run = true; mb3Tick(); } } catch (e) { console.warn('badge3d', e); } };
