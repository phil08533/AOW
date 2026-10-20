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
const FORT_WALL_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEEElEQVR4Aezav4pUTRAF8GGTL/gSA0EzU0EwUHwBBcHAxEAxVQx9BSPBBzAUzY0NBEFfQDQQBFMzBQMTAyPld6GhHab6dt8dt2RmFw5dt7tOVffpvn+2mIPbN2/8evjgUQrkhsz8Bz9/fFhFfx8/vV1BNN7Tjw89vrUPDtR9ozY+tHgH0SDiiZOnV5dv3VsswtIYePLKz47m2OrHwxfn/bunoWsoQGG8f/2imIvbl8/uD3O3kffr51crcf77/3yYPxTg3NlLq+/fvkxghxEaA3himAC74frHEF88YP8x2HmBJy8R2BHtgFM0iAjReE8/PvT41j44UPeN2vgXLt5t0sIT0GTt0GCqAK030FFoLH+qAG4/kziKxUY5UgUwKSJos5AuQNbC5SV+ugB7fQtYvF2wG1lIPQEWT4SsxcubKoAJZMH/B8TfOwGK4L4QncBUAexAmVBWmyqARdsFbRbSBchaeMmbKkD27hOhWRLjsOtongBlJa+Lw4iAL85oDBwY5dX+PblDASRXU7t25/FKoDpwry3GqTNXh+uK8qnlyS9Gb77aT4ye3KEAJZiaWrGXtqMxPBtwlLOW5hQDVxxthEkAaq07KCepyYGPhvXxnmsxLEIMdg+HD18ci2DrGwWeGMCO+H+9Jki81gSiieFANN7Tjw8t3+kEtBx2fWwSwC7t+kKj9U0CRIP70H8swMgub3pbjPDXff03COv9m663nbvkmE6Ajw2QRBsBiU9B5Nfb7zUn5py/fPy0MOdfj7f8xZwEYOwrJgG8K8HbQBuBSHwKIr/e/nL85/zlq3PP+dfjuPV1bYs5CcDogWA9fr0+bgHo8d927pJzSIBC2qX2WAC76Ump3Uccn4DyJP5bu/+vn67pBMw9YQ+ziLnYLeEPk7cVtx6bBKg7art8UdV9o/aSGBaO1/uK3DSnEkOcTeOlLxQAUU3OLbJ0ImLgq++xS9K5Vj4c+Ud4dVwxenKHApRgCovFXtLiz9XlNsVdwlmP05M7LIn5ZFRPA/Z68J5rPHxg93D48MUBtr5R4OEDO+I3TwAiROSefnzY5OuIburXhwPspcCHFr8pQIu4K2PpArROwRKRRzmpAnhSj0542/6pAmx7MSPxfCc4fXsrgC9UJzBVADtgEiM7t23fVAEsngjbXtRIvFQBTJQI2iykC5C1cHmdvnQBTMJkspAqgMXv9S2QvXj5U09A1rGv8zZ/JqcYATVh1MaHo+LVeeT1xVf3rdvhCUBWkQH2OrHnGg/fvc7u4fDhiwdsfaPAk1dRhB3xQwEK4cKV68Vc3Pqp3Sh5G3ktXhxCRPlDARQSVFPePH+yYkcBWv14S2LgyYvLbuWIxvDwxfHdH/mFJTEEQYC9FPgwyseBOV5rHB9aPr8BAAD//2HWoUAAAAAGSURBVAMAdTf4f9d4z80AAAAASUVORK5CYII=';
TEX.ironwall = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#847e87'; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapNearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding;
  const img = new Image();
  img.onload = () => { ctx.drawImage(img, 0, 0, 64, 64); t.needsUpdate = true; };
  img.src = FORT_WALL_PNG;
  if (img.complete) { ctx.drawImage(img, 0, 0, 64, 64); t.needsUpdate = true; }
  return t;
})();
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
    if (RSTYLE === 'real') { const R = { panel: [0.45, 0.45], stone: [0.92, 0], wood: [0.75, 0], cloth: [0.95, 0], leaves: [0.85, 0], skin: [0.65, 0], fur: [1, 0], grime: [0.7, 0.2], ironwall: [0.6, 0.35] }[tex] || [0.8, 0.05]; matCache[key] = new THREE.MeshStandardMaterial({ color: col, map: TEX[tex], bumpMap: TEX[tex], bumpScale: tex === 'stone' ? 0.06 : 0.025, roughness: R[0], metalness: R[1] }); }
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
const PREFS = (() => { let p; try { p = Object.assign({ pix: 2, gfx: 2, music: 2, sfx: true, voice: true, weatherVol: 0.7 }, JSON.parse(localStorage.getItem('aow-prefs') || '{}')); } catch (_) { p = { pix: 2, gfx: 2, music: 2, sfx: true, weatherVol: 0.7 }; } if (p.music === true) p.music = 2; if (p.music === false) p.music = 0; if (p.weatherVol == null) p.weatherVol = 0.7; return p; })();
const MUSIC_NAMES = ['Off', 'Ambient', 'Beep boop'];
function savePrefs() { try { localStorage.setItem('aow-prefs', JSON.stringify(PREFS)); } catch (_) {} }
const SFX = (() => {
  let chipGain = null, chipStep = 0, chipNext = 0, chipSong = null, loops = {};
  let comp = null, wpnGain = null, verb = null, verbSend = null, lastGun = 0;
  let ac = null, master = null, sfxGain = null, musicGain = null, noiseBuf = null, musicTimer = null, bar = 0;
  // browsers only let sound start inside a tap or key press; the game's Play button can retry from a timer while your save
  // loads, which left the sound effects stuck "suspended" (music uses its own players, so it still worked). Wake them on any input.
  let wired = false; const res = () => { try { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); } catch (_) {} };
  function wire() { if (wired) return; wired = true; const wake = () => { if (!ac) init(); else if (ac.state !== 'running') res(); };
    ['pointerdown', 'touchend', 'keydown', 'mousedown', 'click'].forEach(ev => window.addEventListener(ev, wake, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && ac && ac.state !== 'running') res(); }); }
  function init() {
    wire(); try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {} // iPhone: play even with the ring switch on silent
    if (ac) { if (ac.state !== 'running') res(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      sfxGain = ac.createGain(); sfxGain.gain.value = PREFS.sfx ? 1 : 0;
      // weapons go through a limiter so loud guns punch through the soundtrack without clipping, plus a short room reverb send
      comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.12;
      sfxGain.connect(comp); comp.connect(master);
      wpnGain = ac.createGain(); wpnGain.gain.value = 1.35; wpnGain.connect(sfxGain);
      { const len = Math.floor(ac.sampleRate * 1.1), ir = ac.createBuffer(2, len, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
        verb = ac.createConvolver(); verb.buffer = ir; verbSend = ac.createGain(); verbSend.gain.value = 0.32; verbSend.connect(verb); verb.connect(sfxGain); }
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
  // =================== WEAPON SOUND KIT ===================
  // every gun is layered from a few parts: a sharp transient, a filtered noise body, a low thump, a pitched "energy" tone,
  // and a dash of room reverb. Each weapon family mixes them differently, with a little random pitch so no two shots match.
  const vary = (k) => 1 + (Math.random() - 0.5) * (k || 0.08);
  function out(dry, wet) { const g = ac.createGain(); g.gain.value = 1; g.connect(wpnGain); if (wet && verbSend) { const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(verbSend); } return g; }
  // filtered noise burst. type: lowpass/bandpass/highpass; f1 sweeps the filter
  function nz(dest, t, dur, vol, type, f0, f1, q, att) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.playbackRate.value = vary(0.2);
    f.type = type; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (att || 0.002)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.05);
  }
  function os(dest, t, type, f0, f1, dur, vol, att, lp) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (att || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(lp, t); f.frequency.exponentialRampToValueAtTime(Math.max(80, lp / 6), t + dur); o.connect(f); n = f; }
    n.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  const thump = (d, t, f, dur, vol) => os(d, t, 'sine', f * vary(), Math.max(25, f * 0.35), dur, vol, 0.002);
  const click = (d, t, vol, f) => nz(d, t, 0.018, vol, 'highpass', f || 3500, 0, 0.7, 0.0005);
  // spent casings bouncing on the floor
  const casing = (t) => { const d = out(1, 0.1); for (let i = 0; i < 2; i++) os(d, t + 0.32 + i * 0.09 + Math.random() * 0.04, 'sine', 3600 * vary(0.2), 0, 0.05, 0.03 - i * 0.01); };
  // which sound family a gun belongs to
  function family(g) {
    if (!g) return 'blaster'; if (g.kind === 'mystic') return 'm_' + (g.elem || 'arcane');
    if (g.kind) return g.kind === 'carbine' && g.rate < 0.07 ? 'minigun' : g.kind;
    const n = (g.name || '').toLowerCase();
    return /hive/.test(n) ? 'hive' : /stinger/.test(n) ? 'stinger' : /frost/.test(n) ? 'frost' : /plasma/.test(n) ? 'plasma' : /rifle/.test(n) ? 'rifle' : /carbine/.test(n) ? 'carbine' : 'blaster';
  }
  const GUNSND = {
    blaster(t) { const d = out(1, 0.25); os(d, t, 'square', 1500 * vary(), 240, 0.13, 0.16, 0.001, 4000); os(d, t, 'sawtooth', 760 * vary(), 160, 0.1, 0.08); thump(d, t, 150, 0.12, 0.45); click(d, t, 0.25); nz(d, t, 0.06, 0.2, 'bandpass', 2400, 900, 1.2); },
    carbine(t) { const d = out(1, 0.28); click(d, t, 0.35); nz(d, t, 0.07, 0.6, 'bandpass', 2200 * vary(), 800, 0.9); nz(d, t, 0.16, 0.38, 'lowpass', 1300, 300); thump(d, t, 120, 0.13, 0.7); os(d, t, 'square', 900 * vary(), 300, 0.05, 0.05); casing(t); },
    rifle(t) { const d = out(1, 0.32); click(d, t, 0.45, 4200); nz(d, t, 0.08, 0.75, 'bandpass', 1800 * vary(), 600, 0.8); nz(d, t, 0.24, 0.45, 'lowpass', 1100, 200); thump(d, t, 100, 0.18, 0.85); os(d, t + 0.01, 'sawtooth', 420 * vary(), 90, 0.12, 0.06, 0.002, 1600); casing(t); },
    minigun(t) { const d = out(1, 0.15); click(d, t, 0.3); nz(d, t, 0.05, 0.5, 'bandpass', 2000 * vary(0.15), 900, 1); thump(d, t, 110, 0.07, 0.55); os(d, t, 'sawtooth', 320 * vary(0.04), 280, 0.06, 0.05); if (Math.random() < 0.4) casing(t); },
    long(t, g) { const d = out(1, 0.55); click(d, t, 0.6, 5000); nz(d, t, 0.1, 0.9, 'bandpass', 1500, 400, 0.7); nz(d, t, 0.6, 0.45, 'lowpass', 900, 120); thump(d, t, 80, 0.45, 1); nz(d, t + 0.08, 0.9, 0.12, 'lowpass', 600, 90, 0.5, 0.05);
      if (/rail|phase/i.test(g && g.name || '')) { os(d, t, 'sawtooth', 220, 3200, 0.22, 0.1, 0.002, 6000); os(d, t, 'sine', 4800, 900, 0.35, 0.06); }
      else { nz(d, t + 0.45, 0.06, 0.12, 'bandpass', 900, 0, 3); nz(d, t + 0.62, 0.05, 0.14, 'bandpass', 1400, 0, 3); casing(t + 0.3); } },
    scatter(t) { const d = out(1, 0.45); click(d, t, 0.6, 3000); nz(d, t, 0.12, 0.95, 'lowpass', 2600, 500, 0.6); nz(d, t, 0.35, 0.5, 'lowpass', 900, 150); thump(d, t, 90, 0.3, 1); os(d, t, 'square', 600, 120, 0.1, 0.06, 0.002, 2000);
      // pump: back, then forward
      nz(d, t + 0.32, 0.07, 0.3, 'bandpass', 1100, 700, 2); nz(d, t + 0.44, 0.06, 0.34, 'bandpass', 1700, 1000, 2); click(d, t + 0.45, 0.2, 2500); casing(t + 0.2); },
    plasma(t) { const d = out(1, 0.4); os(d, t, 'sawtooth', 900 * vary(), 110, 0.28, 0.2, 0.002, 3500); os(d, t, 'square', 450 * vary(), 70, 0.22, 0.1, 0.002, 1500); thump(d, t, 90, 0.3, 0.9); nz(d, t, 0.22, 0.35, 'bandpass', 1800, 300, 1.4); os(d, t, 'sine', 2600, 500, 0.15, 0.06); },
    rocket(t) { const d = out(1, 0.45); thump(d, t, 70, 0.4, 1); nz(d, t, 0.1, 0.7, 'lowpass', 1800, 400, 0.6); nz(d, t + 0.02, 0.75, 0.42, 'bandpass', 500, 2600, 1.1, 0.06); nz(d, t + 0.05, 0.9, 0.18, 'highpass', 3000, 6000, 0.7, 0.1); click(d, t, 0.4, 2000); },
    crossbow(t) { const d = out(1, 0.2); os(d, t, 'triangle', 190 * vary(), 95, 0.22, 0.35, 0.001); os(d, t, 'sawtooth', 380 * vary(), 190, 0.1, 0.08, 0.001, 2500); nz(d, t, 0.05, 0.5, 'highpass', 2500, 0, 0.7, 0.001); nz(d, t + 0.01, 0.2, 0.35, 'bandpass', 700, 1600, 1.2, 0.02); thump(d, t, 130, 0.08, 0.4); },
    hive(t) { const d = out(1, 0.3); os(d, t, 'sine', 380 * vary(0.15), 70, 0.16, 0.45, 0.003); os(d, t + 0.03, 'sine', 260 * vary(0.15), 90, 0.1, 0.25); nz(d, t, 0.12, 0.45, 'lowpass', 900, 200, 4); click(d, t, 0.2, 2000); thump(d, t, 120, 0.12, 0.5); },
    stinger(t) { const d = out(1, 0.3); os(d, t, 'sawtooth', 1200 * vary(), 260, 0.12, 0.18, 0.001, 5000); os(d, t, 'square', 1250 * vary(), 300, 0.1, 0.07); nz(d, t, 0.08, 0.5, 'bandpass', 3000, 1200, 2); thump(d, t, 140, 0.1, 0.55); },
    frost(t) { GUNSND.carbine(t); const d = out(0.6, 0.6); os(d, t, 'sine', 2600 * vary(), 1900, 0.3, 0.09); os(d, t + 0.03, 'sine', 3900 * vary(), 3100, 0.25, 0.05); },
    // ---- magic: one voice per element ----
    m_arcane(t) { const d = out(1, 0.6); [880, 1320, 1760].forEach((f, i) => os(d, t + i * 0.025, 'sine', f * vary(0.04), f * 1.5, 0.2, 0.13)); nz(d, t, 0.2, 0.3, 'bandpass', 2400, 5200, 3, 0.01); thump(d, t, 160, 0.12, 0.35); },
    m_flame(t) { const d = out(1, 0.35); nz(d, t, 0.38, 0.75, 'lowpass', 500, 3000, 0.8, 0.02); nz(d, t + 0.05, 0.3, 0.35, 'bandpass', 1400, 600, 0.7, 0.02); thump(d, t, 110, 0.25, 0.6); for (let i = 0; i < 4; i++) click(d, t + 0.05 + Math.random() * 0.25, 0.25, 2500); },
    m_storm(t) { const d = out(1, 0.5); for (let i = 0; i < 5; i++) os(d, t + i * 0.025 + Math.random() * 0.015, 'square', 1800 * vary(0.5), 300, 0.05, 0.12, 0.001, 6000); nz(d, t, 0.18, 0.7, 'highpass', 2500, 900, 0.7, 0.001); thump(d, t, 110, 0.35, 0.8); nz(d, t + 0.1, 0.6, 0.2, 'lowpass', 600, 120); },
    m_frost(t) { const d = out(1, 0.7); [1568, 2093, 2637, 3136].forEach((f, i) => os(d, t + i * 0.03, 'sine', f * vary(0.03), 0, 0.4, 0.09)); nz(d, t, 0.25, 0.4, 'highpass', 5000, 2500, 0.7, 0.01); thump(d, t, 140, 0.12, 0.35); },
    m_poison(t) { const d = out(1, 0.35); for (let i = 0; i < 5; i++) os(d, t + i * 0.04, 'sine', (300 + Math.random() * 500), 900 + Math.random() * 600, 0.06, 0.18); nz(d, t, 0.25, 0.4, 'lowpass', 700, 300, 5, 0.02); thump(d, t, 120, 0.12, 0.4); },
    m_spirit(t) { const d = out(1, 0.8); os(d, t, 'sine', 520 * vary(0.04), 1040, 0.4, 0.2, 0.02); os(d, t, 'sine', 780 * vary(0.04), 1560, 0.4, 0.12, 0.02); os(d, t, 'triangle', 190, 95, 0.2, 0.3, 0.001); nz(d, t, 0.06, 0.4, 'highpass', 2500, 0, 0.7, 0.001); },
    m_void(t) { const d = out(1, 0.7); os(d, t, 'sawtooth', 55, 140, 0.55, 0.28, 0.15, 900); os(d, t, 'sawtooth', 58, 150, 0.55, 0.22, 0.15, 900); os(d, t + 0.1, 'sine', 900, 60, 0.5, 0.12); thump(d, t + 0.12, 70, 0.4, 0.8); nz(d, t, 0.6, 0.3, 'bandpass', 300, 1500, 2, 0.2); },
    m_sun(t) { const d = out(1, 0.6); [523, 659, 784].forEach(f => os(d, t, 'sawtooth', f * vary(0.02), f * 1.02, 0.45, 0.07, 0.02, 3000)); nz(d, t, 0.4, 0.6, 'lowpass', 800, 4000, 0.7, 0.03); thump(d, t, 100, 0.35, 0.8); },
    m_blast(t) { const d = out(1, 0.5); thump(d, t, 90, 0.4, 1); nz(d, t, 0.3, 0.8, 'lowpass', 2400, 300, 0.7); os(d, t, 'square', 700, 100, 0.2, 0.1, 0.002, 2500); },
    m_mend(t) { const d = out(0.8, 0.8); [523, 659, 784, 1047].forEach((f, i) => os(d, t + i * 0.05, 'sine', f, 0, 0.5, 0.12)); nz(d, t, 0.4, 0.15, 'highpass', 4000, 7000, 0.7, 0.05); },
    m_setsun(t) { const d = out(1, 0.8); [262, 392, 523, 659, 784].forEach(f => os(d, t, 'sawtooth', f * vary(0.015), f, 0.7, 0.06, 0.03, 3500)); thump(d, t, 80, 0.5, 1); nz(d, t, 0.5, 0.5, 'lowpass', 600, 5000, 0.7, 0.05); os(d, t + 0.05, 'sine', 1568, 2093, 0.5, 0.08); }
  };
  function gunShot(g) {
    if (!ac) return; if (ac.state !== 'running') res();
    const t = ac.currentTime + 0.005, fam = family(g), fn = GUNSND[fam] || GUNSND.blaster;
    // very fast guns: skip the heavy layers if the last shot was a moment ago, so the mix doesn't turn to mush
    if (t - lastGun < 0.045 && fam !== 'minigun') { const d = out(0.8, 0.1); click(d, t, 0.3); nz(d, t, 0.05, 0.4, 'bandpass', 2000, 800, 1); thump(d, t, 120, 0.06, 0.4); lastGun = t; return; }
    lastGun = t; fn(t, g);
  }
  function gunReload(g) {
    if (!ac) return; const t = ac.currentTime, fam = family(g), d = out(0.8, 0.15), dur = (g && g.reload) || 1.2;
    if (fam.startsWith('m_')) { os(d, t, 'sine', 220, 880, dur * 0.8, 0.1, dur * 0.4); os(d, t, 'triangle', 330, 1320, dur * 0.8, 0.05, dur * 0.4); nz(d, t, dur * 0.8, 0.08, 'bandpass', 800, 4000, 3, dur * 0.4); os(d, t + dur * 0.8, 'sine', 1320, 0, 0.25, 0.1); return; }
    if (fam === 'scatter') { for (let i = 0; i < 3; i++) { const u = t + 0.15 + i * dur * 0.24; nz(d, u, 0.05, 0.3, 'bandpass', 900, 600, 3); click(d, u + 0.02, 0.15, 2000); } nz(d, t + dur * 0.85, 0.07, 0.35, 'bandpass', 1100, 700, 2); nz(d, t + dur * 0.92, 0.06, 0.38, 'bandpass', 1700, 1000, 2); return; }
    if (fam === 'crossbow') { os(d, t + 0.1, 'sawtooth', 90, 260, dur * 0.6, 0.05, 0.05, 1200); nz(d, t + dur * 0.8, 0.06, 0.4, 'bandpass', 2000, 0, 2); os(d, t + dur * 0.82, 'triangle', 200, 190, 0.15, 0.2); return; }
    const heavy = fam === 'rocket' || fam === 'plasma' || fam === 'minigun';
    // magazine out, magazine in, then the bolt or charge
    nz(d, t + 0.05, 0.06, 0.3, 'bandpass', heavy ? 700 : 1300, 0, 2); click(d, t + 0.06, 0.2, 3000);
    nz(d, t + dur * 0.55, 0.08, 0.45, 'bandpass', heavy ? 500 : 900, 0, 2); thump(d, t + dur * 0.55, heavy ? 120 : 200, 0.06, 0.4);
    if (fam === 'plasma' || fam === 'stinger' || fam === 'blaster' || fam === 'frost') os(d, t + dur * 0.7, 'sine', 300, 1600, dur * 0.25, 0.06, 0.05);
    else { nz(d, t + dur * 0.82, 0.05, 0.35, 'bandpass', 1500, 900, 2.5); nz(d, t + dur * 0.9, 0.05, 0.4, 'bandpass', 2200, 1300, 2.5); }
  }
  // a looping engine-style sound we can steer every frame
  function loop(name, type, freq, vol) {
    if (!ac) return; let L = loops[name];
    if (!L) { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = type; lp.type = 'lowpass'; lp.frequency.value = 900; g.gain.value = 0; o.connect(lp); lp.connect(g); g.connect(sfxGain); o.start(); L = loops[name] = { o, g }; }
    L.o.frequency.setTargetAtTime(freq, ac.currentTime, 0.08); L.g.gain.setTargetAtTime(vol, ac.currentTime, 0.12);
  }
  let hurtT = 0, stepT = 0, babbleT = 0;
  wire();
  return {
    init,
    ctx() { return ac; }, voiceOut() { return master; },
    setMusic(mode) { const k = PREFS.musicVol == null ? 1 : Math.max(0, Math.min(1, PREFS.musicVol)) / 0.7; if (musicGain) musicGain.gain.value = mode === 1 ? 0.16 * k : 0; if (chipGain) chipGain.gain.value = mode === 2 ? 0.11 * k : 0; },
    setSfx(on) { if (sfxGain) sfxGain.gain.value = on ? 1 : 0; },
    shot(g) { gunShot(g || (typeof gun === 'function' ? gun() : null)); },
    dry() { if (!ac) return; const d = out(0.6, 0); click(d, ac.currentTime, 0.25, 2500); nz(d, ac.currentTime + 0.01, 0.03, 0.15, 'bandpass', 1200, 0, 3); },
    hit() { if (!ac) return; const t = ac.currentTime, d = out(0.7, 0); nz(d, t, 0.06, 0.3, 'bandpass', 1400, 500, 1.5); os(d, t, 'square', 1200, 800, 0.04, 0.05); thump(d, t, 180, 0.06, 0.3); },
    kill() { if (!ac) return; const t = ac.currentTime, d = out(0.8, 0.3); thump(d, t, 140, 0.3, 0.6); nz(d, t, 0.3, 0.35, 'lowpass', 1600, 200); os(d, t + 0.02, 'triangle', 1320, 0, 0.12, 0.1); os(d, t + 0.09, 'triangle', 1760, 0, 0.18, 0.1); },
    coin() { tone('square', 988, 0, 0.06, 0.06); tone('square', 1319, 0, 0.12, 0.06, 0.06); },
    item() { tone('triangle', 660, 0, 0.08, 0.14); tone('triangle', 990, 0, 0.12, 0.14, 0.08); },
    hurt() { if (!ac || ac.currentTime - hurtT < 0.25) return; hurtT = ac.currentTime; tone('sawtooth', 200, 80, 0.2, 0.16); noise(0.12, 0.18, 500); },
    zap() { if (!ac) return; const t = ac.currentTime, d = out(0.35, 0.3); os(d, t, 'square', 700 * vary(0.2), 180, 0.12, 0.08, 0.002, 2500); nz(d, t, 0.06, 0.12, 'bandpass', 1500, 600, 1.2); },
    quest() { arp([523.3, 659.3, 784, 1046.5], 'triangle', 0.09, 0.16); },
    level() { arp([392, 523.3, 659.3, 784, 1046.5, 1318.5], 'square', 0.07, 0.07); },
    ui() { tone('square', 740, 0, 0.035, 0.04); },
    step(surface) { if (!ac || ac.currentTime - stepT < 0.22) return; stepT = ac.currentTime; noise(0.04, surface === 'metal' ? 0.018 : 0.014, surface === 'metal' ? 900 : surface === 'snow' ? 1200 : 320); },
    jump() { tone('square', 220, 440, 0.1, 0.035); }, land() { noise(0.08, 0.12, 400); },
    reload(g) { gunReload(g || (typeof gun === 'function' ? gun() : null)); },
    swing(saber) { if (!ac) return; const t = ac.currentTime, d = out(0.8, 0.2); if (saber) { os(d, t, 'sawtooth', 150 * vary(), 85, 0.3, 0.12, 0.02, 1200); os(d, t, 'sine', 640 * vary(), 280, 0.25, 0.08); nz(d, t, 0.25, 0.15, 'bandpass', 600, 2000, 2, 0.05); } else nz(d, t, 0.2, 0.45, 'bandpass', 500, 2600, 1.6, 0.06); },
    ignite(on) { if (on) { tone('sawtooth', 60, 140, 0.35, 0.07); tone('sine', 300, 900, 0.3, 0.04); } else tone('sawtooth', 140, 50, 0.3, 0.06); },
    block() { tone('sine', 1200, 600, 0.12, 0.08); tone('square', 300, 0, 0.05, 0.04); }, shieldBreak() { tone('sawtooth', 600, 60, 0.5, 0.1); noise(0.3, 0.2, 2000); },
    boom() { if (!ac) return; const t = ac.currentTime, d = out(1, 0.5); thump(d, t, 75, 0.9, 1); os(d, t, 'sine', 45, 25, 1.2, 0.6); nz(d, t, 0.15, 0.9, 'lowpass', 3500, 600, 0.6); nz(d, t + 0.02, 1.3, 0.55, 'lowpass', 900, 80, 0.5, 0.01); for (let i = 0; i < 6; i++) click(d, t + 0.15 + Math.random() * 0.6, 0.12 + Math.random() * 0.1, 1800); },
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
    // the magnet cars: a deep sub hum with a slow electric throb on top, so it feels like the floor is buzzing
    // the ambience engine (ambience.js) builds its own beds on the same context, straight into the master bus
    _ctx() { return ac ? { ac, master } : null; },
    maghum(level, pitch) { if (!ac) return; let M = loops.maghum;
      if (!M) { const g = ac.createGain(), lp = ac.createBiquadFilter(), sub = ac.createOscillator(), mid = ac.createOscillator(), buzz = ac.createOscillator(), bg = ac.createGain(), trem = ac.createOscillator(), tg = ac.createGain();
        lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 2.2; sub.type = 'sine'; mid.type = 'triangle'; buzz.type = 'sawtooth'; bg.gain.value = 0.22; g.gain.value = 0;
        trem.type = 'sine'; trem.frequency.value = 7; tg.gain.value = 0;
        sub.connect(g); mid.connect(g); buzz.connect(bg); bg.connect(lp); lp.connect(g); trem.connect(tg); tg.connect(g.gain); g.connect(sfxGain);
        for (const o of [sub, mid, buzz, trem]) o.start(); M = loops.maghum = { g, sub, mid, buzz, trem, tg, lp }; }
      const t = ac.currentTime, f = 31 + pitch * 26, v = level * 0.2;
      M.sub.frequency.setTargetAtTime(f, t, 0.1); M.mid.frequency.setTargetAtTime(f * 2, t, 0.1); M.buzz.frequency.setTargetAtTime(f * 3.01, t, 0.1); M.lp.frequency.setTargetAtTime(160 + pitch * 220, t, 0.1);
      M.trem.frequency.setTargetAtTime(5 + pitch * 9, t, 0.2); M.g.gain.setTargetAtTime(v, t, 0.12); M.tg.gain.setTargetAtTime(v * 0.35, t, 0.12); },
    bike(level) { loop('bike', 'sawtooth', 70 + level * 160, level > 0.01 ? 0.04 + level * 0.03 : 0); },
    hum(on) { loop('hum', 'sawtooth', 92, on ? 0.018 : 0); },
    talk() { tone('triangle', 520, 0, 0.05, 0.08); tone('triangle', 660, 0, 0.06, 0.08, 0.05); },
    thunder(delay) {
      if (!ac) return; const t = ac.currentTime + (delay || 0);
      const wVol = PREFS.weatherVol == null ? 0.7 : PREFS.weatherVol;
      if (wVol <= 0.001) return;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(120, t + 2.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.55 * wVol, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2); s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + 3.3);
    },
    rain(level) {
      if (!ac) return;
      const wVol = PREFS.weatherVol == null ? 0.7 : PREFS.weatherVol;
      if (!this._rain) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.4; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(sfxGain); s.start(); this._rain = g; }
      this._rain.gain.setTargetAtTime(level * 0.22 * wVol, ac.currentTime, 0.5);
    }
  };
})();

