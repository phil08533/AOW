// =================== HD RENDERING: stylized and semi-realistic styles (full res, shadows, bloom, film color) ===================
const HD = (() => {
  if (RSTYLE === 'retro') return { frame() {}, resize() {} };
  let comp = null, bloom = null, grade = null;
  const GradeShader = { uniforms: { tDiffuse: { value: null }, warm: { value: 0 }, scan: { value: 0 }, rows: { value: 360 }, exposure: { value: RSTYLE === 'real' ? 1.2 : 1.1 }, sat: { value: RSTYLE === 'real' ? 1.18 : 1.32 }, con: { value: RSTYLE === 'real' ? 1.12 : 1.1 }, aces: { value: RSTYLE === 'real' ? 1 : 0 }, vig: { value: RSTYLE === 'real' ? 0.32 : 0.22 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: ['uniform sampler2D tDiffuse; uniform float exposure, sat, aces, vig, con, warm, scan, rows; varying vec2 vUv;',
      'vec3 ACES(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }',
      'void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * exposure; if (aces > 0.5) c = ACES(c); float l = dot(c, vec3(0.2126,0.7152,0.0722)); c = mix(vec3(l), c, sat);',
      ' c = pow(max(c, 0.0), vec3(1.0/2.2)); c = (c - 0.5) * con + 0.5; vec2 q = vUv - 0.5; c.r += warm; c.b -= warm; c *= 1.0 - scan * step(0.5, fract(vUv.y * rows)); c *= 1.0 - dot(q,q) * vig; gl_FragColor = vec4(c, 1.0); }'].join('\n') };
  try {
    if (THREE.EffectComposer && THREE.UnrealBloomPass) {
      comp = new THREE.EffectComposer(renderer); comp.renderTarget1.texture.encoding = comp.renderTarget2.texture.encoding = THREE.LinearEncoding;
      const rp = new THREE.RenderPass(scene, camera); rp.clearColor = HORIZON; rp.clearAlpha = 1; comp.addPass(rp);
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(512, 512), RSTYLE === 'real' ? 0.55 : 0.75, 0.55, 0.78); comp.addPass(bloom);
      grade = new THREE.ShaderPass(GradeShader); comp.addPass(grade);
    }
  } catch (e) { console.warn('hd post', e); comp = null; }
  if (!comp && RSTYLE === 'real') { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; }
  const shadowize = () => { scene.traverse(o => { if (!o.isMesh || o.userData.sh) return; o.userData.sh = 1; const m = o.material; const basic = m && (m.isMeshBasicMaterial || m.transparent || m.isSpriteMaterial || m.isPointsMaterial); o.receiveShadow = !basic; o.castShadow = !basic && !(o.geometry && o.geometry.parameters && o.geometry.parameters.width > 60); }); };
  setInterval(() => { try { shadowize(); } catch (_) {} }, 2500);
  return {
    frame() {
      sun.target.position.copy(player.pos); sun.target.updateMatrixWorld();
      camera.layers.set(0);
      if (comp) { comp.render(); renderer.setRenderTarget(null); }
      else { renderer.setRenderTarget(null); renderer.setClearColor(HORIZON, 1); renderer.clear(); renderer.render(scene, camera); }
    },
    resize(w, h) { if (comp) { comp.setSize(w, h); if (bloom) bloom.resolution.set(w / 2, h / 2); } },
    shadowize, grade: () => grade, bloom: () => bloom, base: { sat: RSTYLE === 'real' ? 1.18 : 1.32, con: RSTYLE === 'real' ? 1.12 : 1.1, vig: RSTYLE === 'real' ? 0.32 : 0.2, bloom: RSTYLE === 'real' ? 0.55 : 0.75 }
  };
})();
if (RSTYLE !== 'retro') {
  // the Filter setting (Classic PS1, PS1 Glow, Crisp Toon, Neon Night, Golden Hour) also tints the HD looks, on top of their own grade
  { const _ag = applyGfx; applyGfx = function () { _ag(); const G = gfxNow(), gp = HD.grade && HD.grade(), bp = HD.bloom && HD.bloom(), B0 = HD.base; if (!gp) return; const U = gp.uniforms;
    U.sat.value = B0.sat * (0.75 + G.sat * 0.25); U.con.value = B0.con * (0.8 + G.con * 0.2); U.warm.value = G.warm * 0.6; U.vig.value = B0.vig + G.vig * 0.35; U.scan.value = G.scan; U.rows.value = stage.clientHeight / 2; if (bp) bp.strength = B0.bloom * (0.55 + G.bloom * 0.7); }; setTimeout(() => { try { applyGfx(); } catch (_) {} }, 0); }
  // longer sight lines, softer blob shadows, and the label pass needs sRGB again
  { const _ue = updateEnv; updateEnv = function (a, b) { _ue(a, b); if (LEVEL && !LEVEL.fly && !LEVEL.indoor) { scene.fog.near *= 2.4; scene.fog.far *= 3.2; } sun.intensity *= 1.55; hemi.intensity *= 0.72; fill.intensity *= 0.6; }; }
  BLOB_MAT.opacity = 0.45;
  { const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); setTimeout(() => HD.shadowize(), 50); return r; }; }
  { const _rs = resize; resize = function () { _rs(); HD.resize(stage.clientWidth, stage.clientHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TOUCH ? 1.5 : 2)); }; }
  setTimeout(() => { try { resize(); } catch (_) {} }, 0); window.addEventListener('resize', () => HD.resize(stage.clientWidth, stage.clientHeight));
}
