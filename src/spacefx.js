// =================== PRETTIER SPACE: nebulae, rich starfield, sun glare, glowing atmospheres, speed dust ===================
function nebulaTex() {
  const W = 512, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), img = x.createImageData(W, H);
  const n = pnoise(91), n2 = pnoise(57), A = new THREE.Color('#5a2a8a'), Bc = new THREE.Color('#1a6a8a'), Cc = new THREE.Color('#c84a7a'), c = new THREE.Color();
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const u = i / W, v = j / H, band = Math.exp(-Math.pow((v - 0.5 - Math.sin(u * 6.28) * 0.12) / 0.2, 2)), e = n(u * 1.5, v * 0.8), f = n2(u * 2.2, v * 1.1);
    const a = clamp((e - 0.42) * 2.2, 0, 1) * band; c.copy(A).lerp(Bc, f).lerp(Cc, clamp((f - 0.6) * 3, 0, 1));
    const k = (j * W + i) * 4; img.data[k] = c.r * 255; img.data[k + 1] = c.g * 255; img.data[k + 2] = c.b * 255; img.data[k + 3] = a * 200;
  }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; return t;
}
function glowSprite(col, size) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), gr = x.createRadialGradient(64, 64, 2, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); s.scale.setScalar(size); return s;
}
function atmoMat(col) {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { c: { value: new THREE.Color(col) } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c; varying vec3 vN; varying vec3 vV; void main(){ float r = pow(1.0 - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(c * r * 1.6, r); }' });
}
{ const orig = LEVELS.space.build;
  LEVELS.space.build = function () {
    orig.call(this);
    // glowing atmosphere rims instead of flat tinted shells
    levelGroup.children.forEach(m => { if (m.isMesh && m.material && m.material.side === THREE.BackSide && m.material.opacity > 0.1 && m.material.opacity < 0.2) { const col = m.material.color.clone(); m.material = atmoMat(col); m.scale.setScalar(1.06); } });
    // nebula band wrapped around the sky
    const neb = new THREE.Mesh(new THREE.SphereGeometry(5200, 32, 16), new THREE.MeshBasicMaterial({ map: nebulaTex(), transparent: true, side: THREE.BackSide, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
    neb.rotation.set(0.5, 0, 0.3); levelGroup.add(neb);
    // a deep starfield with colored stars
    const N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), cs = ['#ffffff', '#cfe6ff', '#ffe9a0', '#ffb8a0', '#a0c8ff'].map(h => new THREE.Color(h));
    for (let i = 0; i < N; i++) { const u = Math.random() * 6.283, v = Math.acos(2 * Math.random() - 1), r = 4800; pos[i * 3] = Math.sin(v) * Math.cos(u) * r; pos[i * 3 + 1] = Math.cos(v) * r; pos[i * 3 + 2] = Math.sin(v) * Math.sin(u) * r; const c = cs[i % 5]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sf = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, fog: false })); levelGroup.add(sf);
    const big = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos.slice(0, 300 * 3), 3)), new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: '#dfe8ff', transparent: true, opacity: 0.55, depthWrite: false, fog: false })); levelGroup.add(big);
    // distant spiral galaxy and the sun's glare
    const gal = glowSprite('rgba(200,140,255,0.7)', 900); gal.position.set(3200, 1800, -3000); levelGroup.add(gal);
    const gal2 = glowSprite('rgba(120,200,255,0.5)', 1400); gal2.position.set(-3600, -900, 2600); levelGroup.add(gal2);
    const glare = glowSprite('rgba(255,210,140,0.9)', 2400); glare.position.set(-2600, 700, 1800); levelGroup.add(glare);
    // drifting space dust that streaks past to sell your speed
    const D = 260, dp = new Float32Array(D * 6); for (let i = 0; i < D; i++) { const x = rand(-60, 60), y = rand(-40, 40), z = rand(-60, 60); dp.set([x, y, z, x, y, z], i * 6); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.LineSegments(dg, new THREE.LineBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.5, fog: false, depthWrite: false })); dust.frustumCulled = false; levelGroup.add(dust);
    levelAnims.push(() => { if (!fly) return; neb.position.copy(player.pos); sf.position.copy(player.pos); big.position.copy(player.pos);
      const a = dg.attributes.position.array, vel = fly.vel, stretch = 0.06;
      for (let i = 0; i < D; i++) { const o = i * 6; let x = a[o], y = a[o + 1], z = a[o + 2];
        if (x - player.pos.x > 60) x -= 120; if (x - player.pos.x < -60) x += 120; if (y - player.pos.y > 40) y -= 80; if (y - player.pos.y < -40) y += 80; if (z - player.pos.z > 60) z -= 120; if (z - player.pos.z < -60) z += 120;
        a[o] = x; a[o + 1] = y; a[o + 2] = z; a[o + 3] = x - vel.x * stretch; a[o + 4] = y - vel.y * stretch; a[o + 5] = z - vel.z * stretch; }
      dg.attributes.position.needsUpdate = true; dust.material.opacity = clamp(vel.length() / 120, 0.15, 0.7); });
    for (let i = 0; i < D; i++) { const o = i * 6; dp[o] += player.pos.x; dp[o + 1] += player.pos.y; dp[o + 2] += player.pos.z; }
  };
}
