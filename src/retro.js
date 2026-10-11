// =================== PS1 LOOK ===================
// Everything renders into a small render target (about 240 lines tall), then gets upscaled with hard pixels,
// 15-bit color and a 4x4 ordered dither. Vertices snap to that low-res grid (the classic wobble), textures
// are sampled without perspective correction (the classic warp), and lighting is per-vertex.
const PSX = { res: { value: new THREE.Vector2(320, 240) } };
function psx(mat) {
  if (RSTYLE !== 'retro') return mat;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uRes = PSX.res;
    sh.vertexShader = 'uniform vec2 uRes;\n#ifdef USE_MAP\nvarying vec3 vAff;\n#endif\n' + sh.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\n{ vec4 sp = gl_Position; vec2 g = uRes * 0.5; sp.xy = floor(sp.xy / sp.w * g + 0.5) / g * sp.w; gl_Position = sp; }\n#ifdef USE_MAP\nvAff = vec3(vUv * gl_Position.w, gl_Position.w);\n#endif');
    if (sh.fragmentShader.indexOf('#include <map_fragment>') >= 0)
      sh.fragmentShader = '#ifdef USE_MAP\nvarying vec3 vAff;\n#endif\n' + sh.fragmentShader.replace('#include <map_fragment>',
        '#ifdef USE_MAP\nvec4 texelColor = texture2D( map, vAff.xy / vAff.z );\ntexelColor = mapTexelToLinear( texelColor );\ndiffuseColor *= texelColor;\n#endif');
  };
  mat.customProgramCacheKey = () => 'psx1';
  return mat;
}
// seeded procedural pixel textures
let texSeed = 1234567;
const trnd = () => (texSeed = (texSeed * 16807) % 2147483647) / 2147483647;
function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; draw(x, size);
  if (RSTYLE !== 'retro' && size >= 16) {
    // HD styles: upscale the pixel texture smoothly and add fine grain so surfaces read as material, not pixels
    const S2 = Math.min(256, size * 8), c2 = document.createElement('canvas'); c2.width = c2.height = S2; const y = c2.getContext('2d'); y.imageSmoothingEnabled = true; y.imageSmoothingQuality = 'high'; y.drawImage(c, 0, 0, S2, S2);
    const id = y.getImageData(0, 0, S2, S2), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (trnd() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; } y.putImageData(id, 0, 0);
    const t2 = new THREE.CanvasTexture(c2); t2.magFilter = THREE.LinearFilter; t2.minFilter = THREE.LinearMipmapLinearFilter; t2.anisotropy = 8; t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.encoding = THREE.sRGBEncoding; return t2;
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapNearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding;
  return t;
}
const g8 = (v) => `rgb(${v},${v},${v})`;
function speckle(x, n, s, lo, hi) { for (let i = 0; i < s * s * n; i++) { x.fillStyle = g8(Math.floor(lo + trnd() * (hi - lo))); x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 1, 1); } }
const TEX = {
  grime: canvasTex(32, (x, s) => { x.fillStyle = g8(232); x.fillRect(0, 0, s, s); speckle(x, 0.55, s, 196, 255);
    x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, s - 2, s, 2); x.fillRect(s - 2, 0, 2, s); x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(0, 0, s, 1); x.fillRect(0, 0, 1, s);
    for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 1 + Math.floor(trnd() * 3), 1); } }),
  panel: canvasTex(32, (x, s) => { x.fillStyle = g8(222); x.fillRect(0, 0, s, s); speckle(x, 0.4, s, 200, 250);
    x.fillStyle = g8(150); x.fillRect(0, 15, s, 1); x.fillRect(15, 0, 1, 15); x.fillRect(0, 31, s, 1); x.fillRect(31, 0, 1, s);
    x.fillStyle = g8(255); x.fillRect(0, 16, s, 1); x.fillRect(16, 0, 1, 15);
    x.fillStyle = g8(120); [[3, 3], [12, 3], [3, 12], [12, 12], [20, 20], [28, 20], [20, 28], [28, 28]].forEach(([a, b]) => x.fillRect(a, b, 2, 2)); }),
  stone: canvasTex(32, (x, s) => { x.fillStyle = g8(205); x.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) { x.fillStyle = g8(Math.floor(165 + trnd() * 80)); x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 2 + Math.floor(trnd() * 6), 2 + Math.floor(trnd() * 5)); }
    speckle(x, 0.3, s, 150, 240); x.fillStyle = g8(120); for (let i = 0; i < 3; i++) { let a = Math.floor(trnd() * s), b = Math.floor(trnd() * s); for (let k = 0; k < 9; k++) { x.fillRect(a, b, 1, 1); a += trnd() < 0.5 ? 1 : 0; b += 1; } } }),
  leaves: canvasTex(32, (x, s) => { x.fillStyle = g8(150); x.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) { const v = Math.floor(170 + trnd() * 85), cx = trnd() * s, cy = trnd() * s, r = 2 + trnd() * 3; x.fillStyle = g8(v - 60); x.beginPath(); x.arc(cx + 1, cy + 1, r, 0, 7); x.fill(); x.fillStyle = g8(v); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } }),
  grass: canvasTex(64, (x, s) => { x.fillStyle = g8(214); x.fillRect(0, 0, s, s); speckle(x, 0.5, s, 180, 245);
    for (let i = 0; i < 140; i++) { const a = Math.floor(trnd() * s), b = Math.floor(trnd() * s), h = 2 + Math.floor(trnd() * 3); x.fillStyle = g8(trnd() < 0.5 ? 168 : 250); x.fillRect(a, b, 1, h); }
    for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 6 + Math.floor(trnd() * 8), 4 + Math.floor(trnd() * 6)); } }),
  tuft: canvasTex(32, (x, s) => { x.clearRect(0, 0, s, s);
    for (let i = 0; i < 16; i++) { const bx = 3 + Math.floor(trnd() * 26), h = 10 + Math.floor(trnd() * 20), lean = (trnd() - 0.5) * 6; const col = ['#5f8a2e', '#7aa23a', '#94b84a', '#4d7426'][i % 4]; x.fillStyle = col;
      for (let k = 0; k < h; k++) x.fillRect(Math.round(bx + lean * k / h), s - 1 - k, k < h - 3 ? 2 : 1, 1); } }),
  blob: canvasTex(32, (x, s) => { const gr = x.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.65, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, s, s); }),
  cloud: canvasTex(64, (x, s) => { x.clearRect(0, 0, s, s); for (let i = 0; i < 14; i++) { const cx = 10 + trnd() * 44, cy = 26 + trnd() * 14, r = 6 + trnd() * 9; x.fillStyle = 'rgba(255,214,190,.9)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.fillStyle = 'rgba(255,240,228,.95)'; x.beginPath(); x.arc(cx - 1, cy - 2, r * 0.7, 0, 7); x.fill(); } })
};
TEX.tuftDry = canvasTex(32, (x, s) => { x.clearRect(0, 0, s, s);
  for (let i = 0; i < 14; i++) { const bx = 3 + Math.floor(trnd() * 26), h = 8 + Math.floor(trnd() * 18), lean = (trnd() - 0.5) * 7; x.fillStyle = ['#b89a4a', '#d4b860', '#9a7a3a', '#c8a85a'][i % 4];
    for (let k = 0; k < h; k++) x.fillRect(Math.round(bx + lean * k / h), s - 1 - k, k < h - 3 ? 2 : 1, 1); } });
TEX.skin = canvasTex(32, (x, s) => { x.fillStyle = g8(226); x.fillRect(0, 0, s, s); speckle(x, 0.35, s, 205, 250);
  for (let i = 0; i < 18; i++) { const cx = trnd() * s, cy = trnd() * s, r = 1 + trnd() * 2.2; x.fillStyle = g8(Math.floor(170 + trnd() * 30)); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 10; i++) x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 2, 1); });
TEX.fur = canvasTex(32, (x, s) => { x.fillStyle = g8(200); x.fillRect(0, 0, s, s);
  for (let i = 0; i < 260; i++) { const a = Math.floor(trnd() * s), b = Math.floor(trnd() * s); x.fillStyle = g8(Math.floor(150 + trnd() * 105)); x.fillRect(a, b, 1, 2 + Math.floor(trnd() * 3)); } });
TEX.cloth = canvasTex(32, (x, s) => { x.fillStyle = g8(222); x.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 2) { x.fillStyle = g8(205); x.fillRect(0, y, s, 1); } for (let xx = 0; xx < s; xx += 4) { x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(xx, 0, 1, s); }
  speckle(x, 0.12, s, 190, 245); x.fillStyle = g8(170); x.fillRect(0, s - 3, s, 1); });
const SKIN_HEX = new Set(['#9aa58e', '#7fae63', '#4f7a3c', '#5f8a3a', '#3e5e26', '#86664a', '#5a4231', '#a78563', '#d9893a', '#9b5a22', '#9a7650', '#6a4f34', '#e2a24a', '#a8672a', '#8e8f8c', '#5f605d', '#b5653f', '#7a3a26', '#8a6fc4', '#5d4a8a', '#e2dfb2', '#d9a77a', '#c58a64', '#e0b892']);
const FUR_HEX = new Set(['#7a6a58', '#4a3f35']);
const CLOTH_HEX = new Set(['#7a5a3c', '#e8e4dc', '#2e5a3a', '#5a6a7a', '#3d3a36', '#2c2a28', '#4a3a2c']);
TEX.water = canvasTex(32, (x, s) => { x.fillStyle = g8(205); x.fillRect(0, 0, s, s);
  for (let i = 0; i < 22; i++) { const y = Math.floor(trnd() * s), x0 = Math.floor(trnd() * s), w = 3 + Math.floor(trnd() * 7); x.fillStyle = g8(250); x.fillRect(x0, y, w, 1); x.fillStyle = g8(175); x.fillRect(x0 + 1, y + 1, w - 1, 1); } speckle(x, 0.15, s, 185, 235); });
TEX.lava = canvasTex(32, (x, s) => { x.fillStyle = '#c2280e'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 30; i++) { const cx = trnd() * s, cy = trnd() * s, r = 1.5 + trnd() * 4; x.fillStyle = trnd() < 0.5 ? '#ff7a18' : '#ffb43a'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
  for (let i = 0; i < 12; i++) { x.fillStyle = '#5a120a'; x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 2 + Math.floor(trnd() * 4), 1); } });
TEX.fall = canvasTex(32, (x, s) => { x.fillStyle = '#9fcbe6'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 40; i++) { const a = Math.floor(trnd() * s), b = Math.floor(trnd() * s), h = 3 + Math.floor(trnd() * 8); x.fillStyle = trnd() < 0.5 ? '#ffffff' : '#d8eefa'; x.fillRect(a, b, 1, h); } });
TEX.wood = canvasTex(32, (x, s) => { x.fillStyle = g8(214); x.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 8) { x.fillStyle = g8(150); x.fillRect(0, y, s, 1); } for (let i = 0; i < 60; i++) { x.fillStyle = g8(Math.floor(185 + trnd() * 50)); x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 3 + Math.floor(trnd() * 6), 1); }
  x.fillStyle = g8(120); [[4, 3], [26, 3], [12, 11], [20, 19], [6, 27], [28, 27]].forEach(([a, b]) => x.fillRect(a, b, 1, 1)); });
TEX.star = canvasTex(8, (x, s) => { x.clearRect(0, 0, s, s); x.fillStyle = '#fff'; x.fillRect(3, 3, 2, 2); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(2, 3, 1, 2); x.fillRect(5, 3, 1, 2); x.fillRect(3, 2, 2, 1); x.fillRect(3, 5, 2, 1); });
// ---- ship interior materials (64px = 2 m of surface) ----
const rivet = (x, a, b) => { x.fillStyle = g8(110); x.fillRect(a, b, 2, 2); x.fillStyle = g8(250); x.fillRect(a, b, 1, 1); };
TEX.hull = canvasTex(64, (x, s) => { x.fillStyle = g8(214); x.fillRect(0, 0, s, s); speckle(x, 0.25, s, 196, 236);
  x.fillStyle = g8(170); x.fillRect(0, 0, s, 5); x.fillRect(0, 50, s, 14); x.fillStyle = g8(240); x.fillRect(0, 5, s, 1); x.fillRect(0, 50, s, 1);
  x.fillStyle = g8(130); x.fillRect(0, 0, 1, s); x.fillRect(s - 1, 0, 1, s); x.fillRect(0, 27, s, 1); x.fillStyle = g8(245); x.fillRect(1, 0, 1, s); x.fillRect(0, 28, s, 1);
  for (const a of [4, 58]) for (const b of [9, 23, 33, 46]) rivet(x, a, b);
  x.fillStyle = g8(95); for (let i = 0; i < 4; i++) x.fillRect(22, 53 + i * 3, 20, 1); x.fillStyle = g8(150); x.fillRect(21, 52, 22, 1);
  x.fillStyle = g8(185); x.fillRect(44, 12, 12, 7); x.fillStyle = g8(120); x.fillRect(45, 14, 10, 1); x.fillRect(45, 16, 6, 1); });
TEX.deck = canvasTex(64, (x, s) => { x.fillStyle = g8(200); x.fillRect(0, 0, s, s);
  for (let py = 0; py < 2; py++) for (let px = 0; px < 2; px++) { const ox = px * 32, oy = py * 32; for (let j = 0; j < 32; j += 4) for (let i = (j / 4) % 2 ? 2 : 0; i < 32; i += 4) { x.fillStyle = g8(228); x.fillRect(ox + i + 1, oy + j + 1, 2, 1); x.fillStyle = g8(170); x.fillRect(ox + i + 1, oy + j + 2, 2, 1); }
    x.fillStyle = g8(120); x.fillRect(ox, oy, 32, 1); x.fillRect(ox, oy, 1, 32); x.fillStyle = g8(235); x.fillRect(ox + 1, oy + 1, 31, 1); x.fillRect(ox + 1, oy + 1, 1, 31); for (const [a, b] of [[3, 3], [28, 3], [3, 28], [28, 28]]) rivet(x, ox + a, oy + b); } });
TEX.tread = TEX.deck;
TEX.ceil = canvasTex(64, (x, s) => { x.fillStyle = g8(150); x.fillRect(0, 0, s, s); speckle(x, 0.2, s, 130, 170);
  for (const [a, b] of [[2, 2], [34, 2], [2, 34], [34, 34]]) { x.fillStyle = g8(185); x.fillRect(a, b, 28, 28); x.fillStyle = g8(120); x.fillRect(a, b + 27, 28, 1); x.fillRect(a + 27, b, 1, 28); x.fillStyle = g8(215); x.fillRect(a, b, 28, 1); x.fillRect(a, b, 1, 28); }
  x.fillStyle = g8(90); for (let i = 0; i < 6; i++) x.fillRect(40, 42 + i * 3, 16, 1); });
TEX.carpet = canvasTex(32, (x, s) => { x.fillStyle = g8(200); x.fillRect(0, 0, s, s); speckle(x, 0.9, s, 170, 230); x.fillStyle = g8(160); for (let i = 0; i < s; i += 4) { x.fillRect(i, 0, 1, s); } x.fillStyle = g8(235); x.fillRect(0, 0, s, 2); x.fillRect(0, s - 2, s, 2); });
TEX.woodwall = canvasTex(64, (x, s) => { x.fillStyle = g8(205); x.fillRect(0, 0, s, s);
  for (let i = 0; i < s; i += 8) { x.fillStyle = g8(150); x.fillRect(i, 22, 1, 42); for (let k = 0; k < 6; k++) { x.fillStyle = g8(180 + Math.floor(trnd() * 40)); x.fillRect(i + 2 + Math.floor(trnd() * 5), 24 + Math.floor(trnd() * 38), 1, 3 + Math.floor(trnd() * 6)); } }
  x.fillStyle = g8(235); x.fillRect(0, 0, s, 20); speckle(x, 0.05, s, 215, 245); x.fillStyle = g8(120); x.fillRect(0, 20, s, 2); x.fillStyle = g8(250); x.fillRect(0, 22, s, 1); x.fillStyle = g8(140); x.fillRect(0, 60, s, 4); });
TEX.grate = canvasTex(64, (x, s) => { x.fillStyle = g8(80); x.fillRect(0, 0, s, s); x.fillStyle = g8(205); for (let i = 0; i < s; i += 3) x.fillRect(i, 0, 1, s); for (let j = 0; j < s; j += 6) x.fillRect(0, j, s, 1); x.fillStyle = g8(120); x.fillRect(0, 31, s, 2); x.fillRect(31, 0, 2, s); x.fillRect(0, 63, s, 1); x.fillRect(63, 0, 1, s); });
TEX.tile = canvasTex(32, (x, s) => { x.fillStyle = g8(240); x.fillRect(0, 0, s, s); speckle(x, 0.15, s, 225, 252); x.fillStyle = g8(170); for (let i = 0; i < s; i += 8) { x.fillRect(i, 0, 1, s); x.fillRect(0, i, s, 1); } x.fillStyle = g8(255); for (let i = 1; i < s; i += 8) { x.fillRect(i, 1, 6, 1); } });
TEX.marble = canvasTex(64, (x, s) => { x.fillStyle = g8(236); x.fillRect(0, 0, s, s); speckle(x, 0.2, s, 220, 250); x.fillStyle = g8(170); for (let v = 0; v < 5; v++) { let a = Math.floor(trnd() * s), b = 0; while (b < s) { x.fillRect(a, b, 1, 2); a = (a + (trnd() < 0.5 ? -1 : 1) + s) % s; b += 2; } }
  x.fillStyle = g8(150); x.fillRect(0, 31, s, 1); x.fillRect(31, 0, 1, s); x.fillRect(0, 63, s, 1); x.fillRect(63, 0, 1, s); });
TEX.hazard = canvasTex(32, (x, s) => { x.fillStyle = '#ffd23a'; x.fillRect(0, 0, s, s); x.fillStyle = '#1e1c22'; for (let k = -s; k < s * 2; k += 16) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 8, 0); x.lineTo(k + 8 - s, s); x.lineTo(k - s, s); x.closePath(); x.fill(); } });
TEX.blob.minFilter = THREE.LinearFilter; TEX.cloud.minFilter = THREE.NearestFilter;
const matCache = {};
const TOON_RAMP = (() => { const d = new Uint8Array([90, 90, 90, 160, 160, 160, 225, 225, 225, 255, 255, 255]); const t = new THREE.DataTexture(d, 4, 1, THREE.RGBFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
// same look as toon() but without PS1 vertex snapping: for big interior surfaces seen up close, where snapping makes textures slide
function toonNS(hex, tex) {
  if (RSTYLE !== 'retro') return toon(hex, tex);
  const key = hex + tex + '_ns'; if (!matCache[key]) matCache[key] = new THREE.MeshLambertMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), map: TEX[tex] });
  return matCache[key];
}
function toon(hex, tex) {
  if (!tex) { const lc = String(hex).toLowerCase(); if (SKIN_HEX.has(lc)) tex = 'skin'; else if (FUR_HEX.has(lc)) tex = 'fur'; else if (CLOTH_HEX.has(lc)) tex = 'cloth'; else { const c = new THREE.Color(hex), h = {}; c.getHSL(h); tex = h.s < 0.14 ? 'panel' : 'grime'; } }
  const key = hex + tex;
  if (!matCache[key]) {
    const col = new THREE.Color(hex).convertSRGBToLinear();
    if (RSTYLE === 'real') { const R = { panel: [0.45, 0.45], stone: [0.92, 0], wood: [0.75, 0], cloth: [0.95, 0], leaves: [0.85, 0], skin: [0.65, 0], fur: [1, 0], grime: [0.7, 0.2] }[tex] || [0.8, 0.05]; matCache[key] = new THREE.MeshStandardMaterial({ color: col, map: TEX[tex], bumpMap: TEX[tex], bumpScale: tex === 'stone' ? 0.06 : 0.025, roughness: R[0], metalness: R[1] }); }
    else if (RSTYLE === 'stylized') matCache[key] = new THREE.MeshToonMaterial({ color: col, map: TEX[tex], gradientMap: TOON_RAMP });
    else matCache[key] = psx(new THREE.MeshLambertMaterial({ color: col, map: TEX[tex] }));
  }
  return matCache[key];
}
const glowCache = {};
function glow(hex) { return glowCache[hex] || (glowCache[hex] = psx(new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear() }))); }
const BLOB_GEO = new THREE.CircleGeometry(0.5, 12); BLOB_GEO.rotateX(-Math.PI / 2);
const BLOB_MAT = new THREE.MeshBasicMaterial({ map: TEX.blob, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
function blob(obj, r) { const m = new THREE.Mesh(BLOB_GEO, BLOB_MAT); m.scale.setScalar(r * 2); m.position.y = 0.04; m.renderOrder = 1; obj.add(m); return m; }

// =================== RETRO SOUND ===================
const PREFS = (() => { let p; try { p = Object.assign({ pix: 1, music: 2, sfx: true, voice: true }, JSON.parse(localStorage.getItem('aow-prefs') || '{}')); } catch (_) { p = { pix: 1, music: 2, sfx: true }; } if (p.music === true) p.music = 2; if (p.music === false) p.music = 0; return p; })();
const MUSIC_NAMES = ['Off', 'Ambient', 'Beep boop'];
function savePrefs() { try { localStorage.setItem('aow-prefs', JSON.stringify(PREFS)); } catch (_) {} }
const SFX = (() => {
  let chipGain = null, chipStep = 0, chipNext = 0, chipSong = null, loops = {};
  let ac = null, master = null, sfxGain = null, musicGain = null, noiseBuf = null, musicTimer = null, bar = 0;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      sfxGain = ac.createGain(); sfxGain.gain.value = PREFS.sfx ? 1 : 0; sfxGain.connect(master);
      musicGain = ac.createGain(); musicGain.gain.value = PREFS.music === 1 ? 0.16 : 0;
      chipGain = ac.createGain(); chipGain.gain.value = PREFS.music === 2 ? 0.11 : 0; const chipLP = ac.createBiquadFilter(); chipLP.type = 'lowpass'; chipLP.frequency.value = 1500; chipGain.connect(chipLP); chipLP.connect(master); musicGain.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      startMusic();
    } catch (_) { ac = null; }
  }
  function tone(type, f0, f1, dur, vol, delay, dest) {
    if (!ac) return; const t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, delay) {
    if (!ac) return; const t = ac.currentTime + (delay || 0), s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + dur + 0.05);
  }
  const arp = (notes, type, step, vol) => notes.forEach((f, i) => tone(type, f, 0, step * 1.6, vol, i * step));
  // slow minor pads + sparse pentatonic notes, like a late-90s field theme
  const PROG = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
  const PENTA = [440, 523.3, 587.3, 659.3, 784, 880];
  function startMusic() {
    const playBar = () => {
      if (!ac || PREFS.music !== 1) return; const chord = PROG[bar % PROG.length], t0 = ac.currentTime + 0.05;
      chord.forEach(f => { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 900;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.22, t0 + 1.2); g.gain.linearRampToValueAtTime(0.0001, t0 + 4.3); o.connect(lp); lp.connect(g); g.connect(musicGain); o.start(t0); o.stop(t0 + 4.4); });
      tone('square', chord[0] / 2, 0, 0.9, 0.1, 0.05, musicGain); tone('square', chord[0] / 2, 0, 0.9, 0.08, 2.05, musicGain);
      for (let k = 0; k < 4; k++) if (Math.random() < 0.55) tone('triangle', PENTA[Math.floor(Math.random() * PENTA.length)], 0, 0.7, 0.12, 0.5 + k * 0.9, musicGain);
      bar++;
    };
    playBar(); musicTimer = setInterval(playBar, 4000);
    setInterval(chipTick, 60);
  }
  // beep boop chiptune: a 16-step sequencer; each world gets its own key, tempo and seeded tune
  const SONGS = { earth: [261.6, 78, 1], mezar: [293.7, 72, 2], capitone: [220, 66, 3], robot: [329.6, 86, 4], space: [174.6, 60, 5], ship: [196, 64, 6], zeltac: [246.9, 76, 7], arena: [277.2, 92, 8] };
  const SCALE = [0, 3, 5, 7, 10, 12, 15, 17];
  function makeSong(id) {
    const [root, bpm, seed] = SONGS[id] || SONGS.earth; let x = seed * 9301; const r = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    const phrase = () => Array.from({ length: 16 }, (_, i) => (i % 4 === 0 ? r() < 0.8 : r() < 0.18) ? SCALE[Math.floor(r() * 6)] : null);
    const A = phrase(), Bp = phrase(), bass = [0, 0, 7, 5].map(v => v), arp = [0, 7, 12, 7];
    return { id, root, step: 60 / bpm / 4, mel: [A, A, Bp, A], bass, arp };
  }
  function chipTick() {
    if (!ac || PREFS.music !== 2) return;
    const want = (typeof LEVEL !== 'undefined' && LEVEL) ? LEVEL.id : 'earth';
    if (!chipSong || chipSong.id !== want) { chipSong = makeSong(want); chipStep = 0; chipNext = ac.currentTime + 0.1; }
    const S2 = chipSong;
    while (chipNext < ac.currentTime + 0.25) {
      const i = chipStep % 16, bar = Math.floor(chipStep / 16) % 4, t = chipNext - ac.currentTime, f = (n, o) => S2.root * Math.pow(2, (n + (o || 0)) / 12);
      const m = S2.mel[bar][i]; if (m != null) { tone('triangle', f(m, 12), 0, S2.step * 3.2, 0.1, t, chipGain); tone('sine', f(m, 24), 0, S2.step * 1.2, 0.02, t + 0.01, chipGain); }
      if (i === 0 || i === 8) tone('sine', f(S2.bass[bar], -12), 0, S2.step * 7, 0.2, t, chipGain);
      if (i % 4 === 2) tone('sine', f(S2.arp[(i >> 2) % 4], 0), 0, S2.step * 1.5, 0.018, t, chipGain);
      if (false) { const s = ac.createBufferSource(), g = ac.createGain(), hp = ac.createBiquadFilter(); s.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 6000; g.gain.setValueAtTime(0.06, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.05); s.connect(hp); hp.connect(g); g.connect(chipGain); s.start(ac.currentTime + t); s.stop(ac.currentTime + t + 0.06); }
      if (i === 8 && bar === 3) tone('sine', f(12, 12), f(7, 12), 0.6, 0.03, t, chipGain);
      chipNext += S2.step; chipStep++;
    }
  }
  // a looping engine-style sound we can steer every frame
  function loop(name, type, freq, vol) {
    if (!ac) return; let L = loops[name];
    if (!L) { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = type; lp.type = 'lowpass'; lp.frequency.value = 900; g.gain.value = 0; o.connect(lp); lp.connect(g); g.connect(sfxGain); o.start(); L = loops[name] = { o, g }; }
    L.o.frequency.setTargetAtTime(freq, ac.currentTime, 0.08); L.g.gain.setTargetAtTime(vol, ac.currentTime, 0.12);
  }
  let hurtT = 0, stepT = 0, babbleT = 0;
  return {
    init,
    setMusic(mode) { const k = PREFS.musicVol == null ? 1 : Math.max(0, Math.min(1, PREFS.musicVol)) / 0.7; if (musicGain) musicGain.gain.value = mode === 1 ? 0.16 * k : 0; if (chipGain) chipGain.gain.value = mode === 2 ? 0.11 * k : 0; },
    setSfx(on) { if (sfxGain) sfxGain.gain.value = on ? 1 : 0; },
    shot() { noise(0.11, 0.3, 2600); tone('square', 620, 110, 0.09, 0.08); },
    hit() { tone('square', 980, 640, 0.05, 0.06); },
    kill() { tone('sawtooth', 320, 50, 0.32, 0.12); noise(0.28, 0.22, 900); },
    coin() { tone('square', 988, 0, 0.06, 0.06); tone('square', 1319, 0, 0.12, 0.06, 0.06); },
    item() { tone('triangle', 660, 0, 0.08, 0.14); tone('triangle', 990, 0, 0.12, 0.14, 0.08); },
    hurt() { if (!ac || ac.currentTime - hurtT < 0.25) return; hurtT = ac.currentTime; tone('sawtooth', 200, 80, 0.2, 0.16); noise(0.12, 0.18, 500); },
    zap() { tone('square', 340, 180, 0.12, 0.035); },
    quest() { arp([523.3, 659.3, 784, 1046.5], 'triangle', 0.09, 0.16); },
    level() { arp([392, 523.3, 659.3, 784, 1046.5, 1318.5], 'square', 0.07, 0.07); },
    ui() { tone('square', 740, 0, 0.035, 0.04); },
    step(surface) { if (!ac || ac.currentTime - stepT < 0.22) return; stepT = ac.currentTime; noise(0.04, surface === 'metal' ? 0.018 : 0.014, surface === 'metal' ? 900 : surface === 'snow' ? 1200 : 320); },
    jump() { tone('square', 220, 440, 0.1, 0.035); }, land() { noise(0.08, 0.12, 400); },
    reload() { tone('square', 300, 0, 0.03, 0.05); tone('square', 520, 0, 0.04, 0.05, 0.12); noise(0.05, 0.08, 1800, 0.5); tone('square', 700, 0, 0.04, 0.05, 0.55); },
    swing(saber) { if (saber) { tone('sawtooth', 160, 90, 0.25, 0.05); tone('sine', 620, 300, 0.2, 0.05); } else noise(0.14, 0.12, 1200); },
    ignite(on) { if (on) { tone('sawtooth', 60, 140, 0.35, 0.07); tone('sine', 300, 900, 0.3, 0.04); } else tone('sawtooth', 140, 50, 0.3, 0.06); },
    block() { tone('sine', 1200, 600, 0.12, 0.08); tone('square', 300, 0, 0.05, 0.04); }, shieldBreak() { tone('sawtooth', 600, 60, 0.5, 0.1); noise(0.3, 0.2, 2000); },
    boom() { noise(0.6, 0.45, 600); tone('sawtooth', 120, 30, 0.5, 0.15); },
    warp() { tone('sine', 200, 1600, 0.6, 0.08); tone('square', 100, 800, 0.6, 0.03); noise(0.6, 0.08, 3000); },
    splash() { noise(0.35, 0.18, 1400); tone('sine', 500, 200, 0.15, 0.05); },
    plop() { tone('sine', 900, 300, 0.12, 0.08); }, bite() { tone('sine', 300, 700, 0.08, 0.1); tone('sine', 300, 700, 0.08, 0.1, 0.12); },
    reel() { tone('square', 1400, 0, 0.02, 0.03); },
    yip() { tone('square', 900, 1300, 0.06, 0.05); },
    laser() { tone('sawtooth', 1400, 300, 0.12, 0.05); tone('square', 900, 200, 0.1, 0.03); },
    crack() { noise(0.25, 0.25, 900); tone('square', 140, 60, 0.15, 0.06); },
    cheer() { if (!ac) return; const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4); s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + 2.5); },
    horn() { tone('sawtooth', 220, 0, 0.5, 0.08); tone('sawtooth', 277, 0, 0.5, 0.06, 0.05); },
    door() { tone('sine', 300, 500, 0.2, 0.05); noise(0.2, 0.06, 2000); },
    burp() { if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 85; lfo.frequency.value = 28; lg.gain.value = 30; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(g); g.connect(sfxGain); o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5); },
    // talking: a burst of pitched blips, like a voice made of beeps
    babble(pitch, n) { if (!ac || ac.currentTime - babbleT < 0.1) return; babbleT = ac.currentTime; for (let i = 0; i < (n || 8); i++) tone(i % 3 ? 'square' : 'triangle', pitch * (0.8 + Math.random() * 0.5), 0, 0.05, 0.035, i * 0.065); },
    engine(level, pitch) { loop('engine', 'sawtooth', 50 + pitch * 90, level * 0.06); },
    bike(level) { loop('bike', 'sawtooth', 70 + level * 160, level > 0.01 ? 0.04 + level * 0.03 : 0); },
    hum(on) { loop('hum', 'sawtooth', 92, on ? 0.018 : 0); },
    talk() { tone('triangle', 520, 0, 0.05, 0.08); tone('triangle', 660, 0, 0.06, 0.08, 0.05); },
    thunder(delay) {
      if (!ac) return; const t = ac.currentTime + (delay || 0);
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(120, t + 2.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.55, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2); s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + 3.3);
    },
    rain(level) {
      if (!ac) return;
      if (!this._rain) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.4; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(sfxGain); s.start(); this._rain = g; }
      this._rain.gain.setTargetAtTime(level * 0.22, ac.currentTime, 0.5);
    }
  };
})();

