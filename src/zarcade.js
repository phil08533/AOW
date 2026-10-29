// =================== THE NEON ARCADE AND THE LUCKY ASTEROID, REBUILT (2.23.69) ===================
// Deck 6 is rebuilt from scratch as two real rooms under a 4.2 m ceiling instead of one dark 7 m warehouse.
// East: the Neon Arcade (cosmic carpet, black walls with neon, a neon ceiling grid): upright cabinets, pinball, air hockey,
// Star Racer sit-downs, Neon Step, skee-ball, claw machines, hoop shot, whack-a-Blork and the prize counter.
// West, through a lit archway: the Lucky Asteroid casino (patterned carpet, wood panelling, coffered ceiling, chandeliers):
// twenty slot machines with real spinning reels, poker, blackjack, roulette with a spinning wheel, high-low and a cashier cage.
// No plank signs: every name is a lit cabinet marquee, a lightbox on brackets, a hanging sign or a brass plaque.
// The older arcade builds (zeltac2, casino.js, arcade2.js, zfloors) still run first; this wrapper clears what they made.
const ZA = { mach: [], cur: -1, W: 24, D: 20, H: 4.2 };
const ZA_SYM = ['🍒', '⭐', '🚀', '👾', '💎'];
function zaCanvas(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
const zaLit = t => new THREE.MeshBasicMaterial({ map: t });
const zaMat = (t, col) => new THREE.MeshLambertMaterial({ map: t, color: col || '#ffffff' });
// a lettered face for a lightbox, a marquee or a plaque
function zaSignTex(text, o = {}) { const w = o.w || 512, h = o.h || 128; return zaCanvas(w, h, (x) => {
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, o.bg2 || o.bg || '#140814'); g.addColorStop(1, o.bg || '#140814'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  if (o.rim) { x.strokeStyle = o.rim; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16); }
  x.textAlign = 'center'; x.textBaseline = 'middle'; let fs = o.fs || h * 0.56; x.font = `${o.bold === false ? '' : 'bold '}${fs}px ${o.font || 'Georgia, serif'}`;
  while (x.measureText(text).width > w * 0.88 && fs > 10) { fs -= 2; x.font = `${o.bold === false ? '' : 'bold '}${fs}px ${o.font || 'Georgia, serif'}`; }
  x.shadowColor = o.glow || o.fg || '#ffd36a'; x.shadowBlur = o.blur == null ? 18 : o.blur; x.fillStyle = o.fg || '#ffd36a'; x.fillText(text, w / 2, h / 2 + (o.dy || 0));
  if (o.sub) { x.shadowBlur = 6; x.font = `bold ${Math.round(h * 0.16)}px monospace`; x.fillText(o.sub, w / 2, h * 0.86); } }); }
// a box lightbox: a dark housing with depth, a glowing face and a thin lit rim. Front faces local +z.
function zaLightbox(par, tex, w, h, d, x, y, z, ry, rim) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; par.add(g);
  part(g, B(w + 0.12, h + 0.12, d), toon('#16141a', 'panel'), 0, 0, 0); const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), zaLit(tex)); f.position.z = d / 2 + 0.006; g.add(f);
  if (rim) for (const [sx, sy, ww, hh] of [[0, h / 2 + 0.06, w + 0.14, 0.03], [0, -h / 2 - 0.06, w + 0.14, 0.03], [w / 2 + 0.06, 0, 0.03, h + 0.14], [-w / 2 - 0.06, 0, 0.03, h + 0.14]]) part(g, B(ww, hh, 0.03), glow(rim), sx, sy, d / 2 + 0.01);
  return g; }
// ---------------- textures ----------------
const zaTexCache = {};
function zaTex(k) { if (zaTexCache[k]) return zaTexCache[k]; let t;
  if (k === 'casinoCarpet') t = zaCanvas(256, 256, (x) => { x.fillStyle = '#5a1420'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#c9a43a'; x.lineWidth = 3;
    for (const [cx, cy] of [[64, 64], [192, 192], [192, 64], [64, 192]]) { x.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 18 : 40; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.stroke(); x.fillStyle = '#1f5a5a'; x.beginPath(); x.arc(cx, cy, 9, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(201,164,58,.45)'; x.lineWidth = 2; for (let i = 0; i <= 256; i += 128) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); }
    x.fillStyle = '#7a1e2a'; for (const [cx, cy] of [[128, 0], [0, 128], [128, 128], [128, 256], [256, 128]]) { x.beginPath(); x.arc(cx, cy, 14, 0, 7); x.fill(); } }, [6, 10]);
  else if (k === 'damask') t = zaCanvas(128, 256, (x) => { x.fillStyle = '#4a1418'; x.fillRect(0, 0, 128, 256); x.fillStyle = '#5e1c22';
    for (const [cx, cy] of [[64, 64], [0, 192], [128, 192]]) { x.beginPath(); x.ellipse(cx, cy, 26, 44, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx, cy - 52, 8, 12, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx, cy + 52, 8, 12, 0, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(201,164,58,.35)'; x.lineWidth = 2; for (const [cx, cy] of [[64, 64], [0, 192], [128, 192]]) { x.beginPath(); x.ellipse(cx, cy, 18, 32, 0, 0, 7); x.stroke(); } }, [16, 1]);
  else if (k === 'cosmic') t = zaCanvas(256, 256, (x) => { x.fillStyle = '#0b0a18'; x.fillRect(0, 0, 256, 256); let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 26; i++) { const cx = r() * 256, cy = r() * 256, c = ['#ff4fa0', '#3fd8ff', '#ffd23a', '#9a6aff', '#5aff8a'][i % 5]; x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 3;
      if (i % 3 === 0) { x.beginPath(); x.moveTo(cx, cy - 9); x.lineTo(cx + 8, cy + 6); x.lineTo(cx - 8, cy + 6); x.closePath(); x.stroke(); }
      else if (i % 3 === 1) { x.beginPath(); for (let k = 0; k < 4; k++) x.quadraticCurveTo(cx + k * 8 + 4, cy + (k % 2 ? 8 : -8), cx + k * 8 + 8, cy); x.stroke(); }
      else { x.beginPath(); x.arc(cx, cy, 2.5, 0, 7); x.fill(); } } }, [10, 10]);
  else if (k === 'arcWall') t = zaCanvas(128, 128, (x) => { x.fillStyle = '#121220'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#1e1e34'; x.lineWidth = 3; x.strokeRect(4, 4, 120, 120); x.strokeStyle = '#26264a'; x.lineWidth = 1; x.strokeRect(14, 14, 100, 100);
    x.fillStyle = '#2a2a50'; for (const [a, b] of [[10, 10], [118, 10], [10, 118], [118, 118]]) { x.beginPath(); x.arc(a, b, 2.5, 0, 7); x.fill(); } }, [24, 2]);
  else if (k === 'coffer') t = zaCanvas(128, 128, (x) => { x.fillStyle = '#2a1214'; x.fillRect(0, 0, 128, 128); const g = x.createRadialGradient(64, 64, 4, 64, 64, 60); g.addColorStop(0, '#6a3a24'); g.addColorStop(1, '#2a1214'); x.fillStyle = g; x.fillRect(12, 12, 104, 104);
    x.strokeStyle = '#c9a43a'; x.lineWidth = 3; x.strokeRect(12, 12, 104, 104); x.strokeStyle = 'rgba(201,164,58,.5)'; x.lineWidth = 1.5; x.strokeRect(24, 24, 80, 80); }, [11, 10]);
  else if (k === 'reel') t = zaCanvas(400, 80, (x) => { x.fillStyle = '#f6f1e2'; x.fillRect(0, 0, 400, 80);
    for (let i = 0; i < 5; i++) { const cx = i * 80 + 40, cy = 40; x.strokeStyle = '#d8d0b8'; x.lineWidth = 2; x.beginPath(); x.moveTo(i * 80, 0); x.lineTo(i * 80, 80); x.stroke();
      if (i === 0) { x.strokeStyle = '#3a7a2a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 10, cy + 8); x.quadraticCurveTo(cx - 4, cy - 22, cx + 6, cy - 24); x.moveTo(cx + 12, cy + 6); x.quadraticCurveTo(cx + 10, cy - 16, cx + 6, cy - 24); x.stroke(); x.fillStyle = '#d0202a'; x.beginPath(); x.arc(cx - 11, cy + 12, 11, 0, 7); x.arc(cx + 13, cy + 10, 11, 0, 7); x.fill(); }
      if (i === 1) { x.fillStyle = '#f0b81a'; x.strokeStyle = '#8a5a10'; x.lineWidth = 2; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 11 : 26; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); }
      if (i === 2) { x.fillStyle = '#d8dce6'; x.beginPath(); x.moveTo(cx, cy - 28); x.quadraticCurveTo(cx + 13, cy - 10, cx + 9, cy + 14); x.lineTo(cx - 9, cy + 14); x.quadraticCurveTo(cx - 13, cy - 10, cx, cy - 28); x.fill(); x.fillStyle = '#d0202a'; x.beginPath(); x.moveTo(cx - 9, cy + 4); x.lineTo(cx - 18, cy + 20); x.lineTo(cx - 8, cy + 14); x.moveTo(cx + 9, cy + 4); x.lineTo(cx + 18, cy + 20); x.lineTo(cx + 8, cy + 14); x.fill(); x.fillStyle = '#3a8ad0'; x.beginPath(); x.arc(cx, cy - 8, 5, 0, 7); x.fill(); x.fillStyle = '#ff9a2a'; x.beginPath(); x.moveTo(cx - 6, cy + 15); x.lineTo(cx, cy + 28); x.lineTo(cx + 6, cy + 15); x.fill(); }
      if (i === 3) { x.fillStyle = '#5ad04a'; x.beginPath(); x.arc(cx, cy, 22, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - 8, cy - 5, 6, 0, 7); x.arc(cx + 8, cy - 5, 6, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(cx - 8, cy - 5, 3, 0, 7); x.arc(cx + 8, cy - 5, 3, 0, 7); x.fill(); x.fillRect(cx - 9, cy + 8, 18, 4); }
      if (i === 4) { x.fillStyle = '#3ad0f0'; x.strokeStyle = '#0a6a8a'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy - 26); x.lineTo(cx + 22, cy - 6); x.lineTo(cx, cy + 26); x.lineTo(cx - 22, cy - 6); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(cx - 22, cy - 6); x.lineTo(cx + 22, cy - 6); x.stroke(); } } });
  else if (k === 'wheel') t = zaCanvas(512, 512, (x) => { const R = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    x.fillStyle = '#4a2a14'; x.beginPath(); x.arc(256, 256, 256, 0, 7); x.fill(); for (let k = 0; k < 37; k++) { const a0 = (k - 0.5) / 37 * Math.PI * 2, a1 = (k + 0.5) / 37 * Math.PI * 2, n = R[k];
      x.fillStyle = n === 0 ? '#1a8a3a' : RL_RED.includes(n) ? '#c0202a' : '#16161a'; x.beginPath(); x.moveTo(256, 256); x.arc(256, 256, 236, a0, a1); x.closePath(); x.fill();
      x.save(); x.translate(256 + Math.cos(k / 37 * Math.PI * 2) * 214, 256 + Math.sin(k / 37 * Math.PI * 2) * 214); x.rotate(k / 37 * Math.PI * 2 + Math.PI / 2); x.fillStyle = '#fff'; x.font = 'bold 20px Georgia'; x.textAlign = 'center'; x.fillText(n, 0, 7); x.restore(); }
    x.fillStyle = '#5a3418'; x.beginPath(); x.arc(256, 256, 150, 0, 7); x.fill(); x.fillStyle = '#c9a43a'; x.beginPath(); x.arc(256, 256, 40, 0, 7); x.fill(); x.strokeStyle = '#c9a43a'; x.lineWidth = 6; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; x.beginPath(); x.moveTo(256, 256); x.lineTo(256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140); x.stroke(); }
    x.strokeStyle = '#c9a43a'; x.lineWidth = 4; x.beginPath(); x.arc(256, 256, 192, 0, 7); x.stroke(); });
  else if (k === 'rlFelt') t = zaCanvas(512, 256, (x) => { x.fillStyle = '#145a32'; x.fillRect(0, 0, 512, 256); x.strokeStyle = '#e8e2c8'; x.lineWidth = 2; x.fillStyle = '#e8e2c8'; x.font = 'bold 16px Georgia'; x.textAlign = 'center';
    x.strokeRect(20, 30, 40, 150); x.fillText('0', 40, 110);
    for (let n = 1; n <= 36; n++) { const c = Math.floor((n - 1) / 3), r = 2 - (n - 1) % 3, X = 60 + c * 34, Y = 30 + r * 50; x.strokeRect(X, Y, 34, 50); x.fillStyle = RL_RED.includes(n) ? '#e0303a' : '#111'; x.beginPath(); x.ellipse(X + 17, Y + 25, 12, 15, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillText(n, X + 17, Y + 31); }
    x.fillStyle = '#e8e2c8'; ['1st 12', '2nd 12', '3rd 12'].forEach((s, i) => { x.strokeRect(60 + i * 136, 180, 136, 34); x.fillText(s, 128 + i * 136, 203); });
    ['1-18', 'EVEN', 'RED', 'BLACK', 'ODD', '19-36'].forEach((s, i) => { x.strokeRect(60 + i * 68, 214, 68, 32); if (s === 'RED' || s === 'BLACK') { x.fillStyle = s === 'RED' ? '#e0303a' : '#111'; x.beginPath(); x.moveTo(94 + i * 68 - 18, 230); x.lineTo(94 + i * 68, 220); x.lineTo(94 + i * 68 + 18, 230); x.lineTo(94 + i * 68, 240); x.fill(); x.fillStyle = '#e8e2c8'; } else x.fillText(s, 94 + i * 68, 236); }); });
  else if (k === 'hlFelt') t = zaCanvas(512, 256, (x) => { x.fillStyle = '#5a1a2a'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#f0d8a8'; x.textAlign = 'center'; x.font = 'bold 30px Georgia'; x.fillText('HIGH  ·  LOW', 256, 92); x.font = '18px Georgia'; x.fillText('Ties go to the house', 256, 122);
    x.strokeStyle = '#f0d8a8'; x.lineWidth = 2; x.strokeRect(256 - 30, 140, 60, 84); x.beginPath(); x.arc(256, 30, 205, 0.2, Math.PI - 0.2); x.stroke(); x.font = 'bold 22px Georgia'; x.fillText('▲', 150, 190); x.fillText('▼', 362, 190); });
  else if (k === 'bjFelt') t = zaCanvas(512, 256, (x) => { x.fillStyle = '#1a4a6a'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#e8d8a0'; x.textAlign = 'center'; x.font = 'bold 26px Georgia'; x.fillText('BLACKJACK PAYS 3 TO 2', 256, 90); x.font = '18px Georgia'; x.fillText('Dealer must stand on 17', 256, 120);
    x.strokeStyle = '#e8d8a0'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { const a = Math.PI * (0.15 + i * 0.175); x.strokeRect(256 + Math.cos(a) * 200 - 22, 30 + Math.sin(a) * 200 - 30, 44, 60); } });
  else if (k === 'screens') t = zaCanvas(512, 128, (x) => { // four attract screens side by side: snake, rocks, invaders, racer
    const pal = [['#041204', '#5aff5a'], ['#040812', '#9fd8ff'], ['#0a0418', '#ff6aa8'], ['#120408', '#ffd23a']];
    pal.forEach(([bg, fg], i) => { const X = i * 128; x.fillStyle = bg; x.fillRect(X, 0, 128, 128); x.fillStyle = fg; x.strokeStyle = fg; x.lineWidth = 2;
      if (i === 0) { for (let k = 0; k < 9; k++) x.fillRect(X + 20 + k * 9, 64, 8, 8); x.fillRect(X + 101, 55, 8, 8); x.fillStyle = '#ffd23a'; x.fillRect(X + 60, 30, 8, 8); }
      if (i === 1) { for (const [a, b, r] of [[30, 30, 14], [96, 40, 10], [70, 96, 18]]) { x.beginPath(); for (let k = 0; k < 8; k++) { const q = k / 8 * 6.28; x.lineTo(X + a + Math.cos(q) * r * (0.8 + (k % 2) * 0.2), b + Math.sin(q) * r); } x.closePath(); x.stroke(); } x.beginPath(); x.moveTo(X + 64, 56); x.lineTo(X + 56, 74); x.lineTo(X + 72, 74); x.closePath(); x.stroke(); }
      if (i === 2) { for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { x.fillRect(X + 14 + c * 21, 14 + r * 18, 12, 9); } x.fillStyle = '#5aff5a'; x.fillRect(X + 56, 108, 16, 8); }
      if (i === 3) { x.fillStyle = '#1a1020'; x.beginPath(); x.moveTo(X + 54, 20); x.lineTo(X + 74, 20); x.lineTo(X + 124, 128); x.lineTo(X + 4, 128); x.fill(); x.strokeStyle = fg; x.setLineDash([8, 8]); x.beginPath(); x.moveTo(X + 64, 20); x.lineTo(X + 64, 128); x.stroke(); x.setLineDash([]); x.fillStyle = '#ff4a4a'; x.fillRect(X + 56, 100, 16, 14); }
      x.fillStyle = '#fff'; x.font = 'bold 10px monospace'; x.textAlign = 'center'; x.fillText('INSERT COIN', X + 64, 124); }); });
  zaTexCache[k] = t; return t; }
// a sub-rectangle of the attract-screen sheet as its own texture
const zaScreen = i => { const k = 'scr' + i; if (zaTexCache[k]) return zaTexCache[k]; const t = zaTex('screens').clone(); t.needsUpdate = true; t.repeat.set(0.25, 1); t.offset.set(i * 0.25, 0); return (zaTexCache[k] = t); };

// ---------------- pieces ----------------
// rotate a local (x, z) offset into the world for a machine facing ry
const zaRot = (ry, x, z) => [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
function zaStool(par, x, z, col) { part(par, Cy(0.22, 0.24, 0.1, 12), toon(col || '#7a1e2a', 'cloth'), x, 0.72, z); part(par, Cy(0.03, 0.03, 0.7, 6), toon('#b8bec8'), x, 0.36, z); part(par, Cy(0.22, 0.24, 0.03, 12), toon('#2a2c32'), x, 0.015, z); part(par, new THREE.TorusGeometry(0.16, 0.015, 4, 12), toon('#b8bec8'), x, 0.3, z, Math.PI / 2); }
const ZA_SLOT_NAMES = [['LUCKY STAR', '#ffd36a', '#3a1030'], ['COMET CASH', '#7fe8ff', '#0a1838'], ['BLORK BUCKS', '#9fff6a', '#0e2a10'], ['DIAMOND MAW', '#ff9ad8', '#2a0a2a'], ['TRIPLE 7', '#ff5a4a', '#2a0808']];
function zaSlot(x, z, ry, i) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; props.add(g); const [nm, fg, bg] = ZA_SLOT_NAMES[i % ZA_SLOT_NAMES.length];
  const body = toon(['#3a1a2a', '#1a2440', '#1e3020', '#3a1a3a', '#3a1414'][i % 5], 'hull'), chrome = toon('#c8ccd4'), dark = toon('#141218');
  part(g, B(0.86, 0.95, 0.72), body, 0, 0.475, -0.02); part(g, B(0.9, 0.06, 0.76), chrome, 0, 0.97, -0.02);
  part(g, B(0.86, 0.95, 0.36), body, 0, 1.47, -0.23); for (const s of [-1, 1]) part(g, B(0.1, 0.95, 0.2), body, s * 0.38, 1.47, 0.04); part(g, B(0.86, 0.22, 0.2), body, 0, 1.84, 0.04); part(g, B(0.86, 0.31, 0.2), body, 0, 1.155, 0.04); part(g, B(0.66, 0.42, 0.04), dark, 0, 1.52, -0.24); for (const s of [-1, 1]) part(g, B(0.66, 0.06, 0.36), dark, 0, 1.52 + s * 0.2, -0.04); part(g, B(0.7, 0.04, 0.05), chrome, 0, 1.75, 0.14); part(g, B(0.7, 0.04, 0.05), chrome, 0, 1.29, 0.14);
  for (const s of [-1, 1]) part(g, B(0.04, 0.46, 0.05), chrome, s * 0.35, 1.52, 0.14);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.4), new THREE.MeshPhongMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.12, shininess: 120, depthWrite: false })); gl.position.set(0, 1.52, 0.165); g.add(gl);
  part(g, B(0.66, 0.012, 0.02), glow('#ff3a3a'), 0, 1.52, 0.17); // the pay line
  part(g, B(0.86, 0.3, 0.24), body, 0, 1.12, 0.22, -0.5); for (let k = 0; k < 3; k++) part(g, Cy(0.045, 0.045, 0.03, 10), glow(['#ff4a4a', '#ffd36a', '#4fd2ff'][k]), -0.2 + k * 0.2, 1.2, 0.31, Math.PI / 2 - 0.5);
  part(g, B(0.5, 0.1, 0.14), chrome, 0, 0.72, 0.38); part(g, B(0.42, 0.05, 0.1), dark, 0, 0.76, 0.38); part(g, B(0.18, 0.08, 0.02), glow('#ffd36a'), 0.24, 1.02, 0.35);
  // topper: a lit name marquee with a dome light that flashes on wins
  part(g, B(0.9, 0.36, 0.4), body, 0, 2.13, -0.16); const mq = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.28), zaLit(zaSignTex(nm, { fg, bg, bg2: '#000', w: 256, h: 88, font: 'Impact, sans-serif' }))); mq.position.set(0, 2.13, 0.045); g.add(mq);
  part(g, B(0.92, 0.03, 0.42), chrome, 0, 1.94, -0.16); part(g, B(0.92, 0.03, 0.42), chrome, 0, 2.32, -0.16);
  // lever on the right side
  part(g, Cy(0.06, 0.06, 0.12, 10), chrome, 0.47, 1.4, -0.1, 0, 0, Math.PI / 2); const lv = new THREE.Group(); lv.position.set(0.53, 1.4, -0.1); g.add(lv); part(lv, Cy(0.018, 0.018, 0.5, 6), chrome, 0, 0.25, 0); part(lv, new THREE.SphereGeometry(0.06, 10, 8), toon('#d0202a'), 0, 0.52, 0);
  zaStool(props, x + zaRot(ry, 0, 0.95)[0], z + zaRot(ry, 0, 0.95)[1], '#7a1e2a');
  // reels and the lit parts live in levelGroup so they can move
  const lg = new THREE.Group(); lg.position.copy(g.position); lg.rotation.y = ry; levelGroup.add(lg);
  const reels = []; for (let k = 0; k < 3; k++) { const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.19, 24, 1, true); geo.rotateZ(Math.PI / 2); const r = new THREE.Mesh(geo, zaMat(zaTex('reel'))); r.position.set(-0.21 + k * 0.21, 1.52, -0.04); r.rotation.x = (randi(0, 4) + 0.5) / 5 * Math.PI * 2; lg.add(r); reels.push(r); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff5a4a' })); dome.position.set(0, 2.32, -0.16); lg.add(dome);
  const strip = new THREE.Mesh(B(0.03, 0.9, 0.03), new THREE.MeshBasicMaterial({ color: fg })), strip2 = strip.clone(); strip.position.set(-0.445, 1.47, 0.1); strip2.position.set(0.445, 1.47, 0.1); strip2.material = strip.material; lg.add(strip, strip2);
  const M = { reels, dome, strip, lv, spin: 0, ready: true, stop: [0, 0, 0], tgt: reels.map(r => r.rotation.x), win: 0, i, x, z, ry, nm, pay: null };
  ZA.mach.push(M); const [fx, fz] = zaRot(ry, 0, 0.95); const [bx, bz] = zaRot(ry, 0, -0.05); box(x + bx, z + bz, Math.abs(Math.cos(ry)) * 0.45 + Math.abs(Math.sin(ry)) * 0.4, Math.abs(Math.sin(ry)) * 0.45 + Math.abs(Math.cos(ry)) * 0.4);
  INTERACTS.push({ x: x + fx, z: z + fz, r: 0.9, get label() { return ZS.M === M ? `🎰 Pull the lever (${ZS.bet} cr)` : `🎰 Sit at the ${nm[0] + nm.slice(1).toLowerCase()} slots`; }, fn: () => zaSit(M) }); }
function zaSlotStep(t, dt) { for (const M of ZA.mach) {
  if (M.spin > 0) { M.spin += dt; M.lv.rotation.x = M.spin < 0.25 ? M.spin * 3 : Math.max(0, 0.75 - (M.spin - 0.25) * 2);
    M.reels.forEach((r, k) => { const stopAt = 1.05 + k * 0.28; if (M.spin < stopAt || !M.ready) r.rotation.x -= dt * 22; else { const tw = M.tgt[k] - Math.PI * 2 * Math.ceil(0.0001 + (M.tgt[k] - r.rotation.x) / (Math.PI * 2)); r.rotation.x += (tw + 0 - r.rotation.x) * 0; r.rotation.x = M.tgt[k]; } });
    if (M.spin > 1.05 + 0.56 + 0.1 && M.ready) { M.spin = 0; if (M.win) M.win = 3; if (M.pay != null) zaPaid(M); } }
  if (M.win > 0) M.win -= dt; M.dome.material.color.set(M.win > 0 ? (Math.sin(t * 20) > 0 ? '#ffffff' : '#ffd36a') : M.spin > 0 ? '#ffd36a' : '#a02a2a');
  M.strip.material.color.setHSL((t * 0.25 + M.i * 0.13) % 1, 0.9, 0.55); } }

// ---------------- sitting at a slot: E sits you on the stool, then E, Space or the PULL button drops the crank and spins the reels ----------------
const ZS = { M: null, bet: 50, ui: null };
const zaIn = () => typeof LEVEL !== 'undefined' && LEVEL && LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' && zTheme(ZF.floor) === 'arcade';
function zaSlotUi() { if (ZS.ui) return ZS.ui; const st = document.createElement('style'); st.textContent = `#zaSlot { position: fixed; left: 50%; bottom: 7%; transform: translateX(-50%); z-index: 40; background: rgba(12,8,20,.86); border: 1px solid #6a3a8a; border-radius: 12px; padding: 10px 14px; color: #f0e8ff; font: 14px system-ui, sans-serif; text-align: center; min-width: 300px; }
#zaSlot .t { font: bold 15px Georgia, serif; letter-spacing: .06em; margin-bottom: 4px; } #zaSlot .m { min-height: 20px; margin: 4px 0 8px; color: #cfe8ff; } #zaSlot .row { display: flex; gap: 6px; justify-content: center; align-items: center; flex-wrap: wrap; }
#zaSlot button { cursor: pointer; border-radius: 8px; border: 1px solid #5a5a7a; background: #1e1c2e; color: #e8e8ff; padding: 6px 10px; font: 13px system-ui, sans-serif; } #zaSlot button.on { background: #3a6ad8; border-color: #8ab0ff; }
#zaSlot button.pull { background: #b0202e; border-color: #ff8a90; color: #fff; font-weight: bold; padding: 9px 22px; font-size: 15px; } #zaSlot button.pull:disabled { opacity: .5; } #zaSlot small { opacity: .7; }`; document.head.appendChild(st);
  const d = document.createElement('div'); d.id = 'zaSlot'; d.hidden = true; d.innerHTML = '<div class="t"></div><div class="m"></div><div class="row"><span>Bet</span><button data-b="50">50</button><button data-b="250">250</button><button data-b="1000">1000</button><button class="pull">PULL</button><button class="up">Stand up</button></div><small>Three in a row pays 8×, three diamonds 20×, a pair next to each other 1.5× · Click, E or Space pulls · 1 2 3 set the bet · WASD stands</small>';
  document.body.appendChild(d); d.querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => { ZS.bet = +b.dataset.b; zaUiRefresh(); SFX.ui && SFX.ui(); }));
  d.querySelector('.pull').addEventListener('click', () => zaPull()); d.querySelector('.up').addEventListener('click', () => zaStand()); ZS.ui = d; return d; }
function zaUiRefresh(msg) { const d = zaSlotUi(); if (msg != null) d.querySelector('.m').textContent = msg; d.querySelectorAll('[data-b]').forEach(b => b.classList.toggle('on', +b.dataset.b === ZS.bet)); d.querySelector('.pull').disabled = !!(ZS.M && ZS.M.spin > 0); }
const zaSeat = M => { const [fx, fz] = zaRot(M.ry, 0, 0.95); return [M.x + fx, M.z + fz]; };
function zaSit(M) { if (ZS.M === M) return zaPull(); if (ZS.M) zaStand(true);
  ZS.M = M; const [sx, sz] = zaSeat(M), [rx, rz] = zaRot(M.ry, 0, 0.95); player.pos.x = sx; player.pos.z = sz; player.yaw = Math.atan2(rx, rz); player.pitch = 0.12; firing = false;
  const d = zaSlotUi(); d.hidden = false; d.querySelector('.t').textContent = '🎰 ' + M.nm; zaUiRefresh(`You have ${S.cr.toLocaleString()} cr. Pick a bet and pull.`); SFX.ui && SFX.ui(); }
function zaStand(quiet) { const M = ZS.M; if (!M) return; ZS.M = null; if (ZS.ui) ZS.ui.hidden = true; const [ox, oz] = zaRot(M.ry, 0, 1.55); player.pos.x = M.x + ox; player.pos.z = M.z + oz; if (!quiet) SFX.ui && SFX.ui(); }
function zaPull() { const M = ZS.M; if (!M || M.spin > 0) return; const bet = ZS.bet; if (S.cr < bet) { zaUiRefresh(`You need ${bet} cr for that bet.`); SFX.hit && SFX.hit(); return; }
  S.cr -= bet; markDirty(); const r = [0, 0, 0].map(() => randi(0, ZA_SYM.length - 1)); M.tgt = r.map(j => (j + 0.5) / 5 * Math.PI * 2); M.win = 0; M.lv.rotation.x = 0; M.ready = true; M.spin = 0.001;
  const mult = r[0] === r[1] && r[1] === r[2] ? (r[0] === 4 ? 20 : 8) : (r[0] === r[1] || r[1] === r[2]) ? 1.5 : 0; M.pay = Math.round(bet * mult); M.roll = r.map(j => ZA_SYM[j]).join(' ');
  try { const c = SFX.ctx(), o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.setValueAtTime(140, c.currentTime); o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.18); g.gain.setValueAtTime(0.12, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2); o.connect(g); g.connect(SFX.voiceOut ? SFX.voiceOut() : c.destination); o.start(); o.stop(c.currentTime + 0.22); } catch (_) {}
  zaUiRefresh('Ka-chunk. The reels spin…'); }
function zaPaid(M) { const p = M.pay; M.pay = null; S.cr += p; markDirty(); if (p) { M.win = 3; SFX.coin && SFX.coin(); } else SFX.ui && SFX.ui();
  if (ZS.M === M) zaUiRefresh(p ? `${M.roll} · You win ${p.toLocaleString()} cr!` : `${M.roll} · Nothing. The machine hums smugly.`);
  if (p >= 1000) toast('🎰 JACKPOT', `+${p.toLocaleString()} cr`, 2.5); }
// sitting: hold the seat, sit low, WASD stands you up; and no guns anywhere on the arcade deck
{ const _st = step; step = function (dt) { const M = ZS.M;
  if (M && !zaIn()) zaStand(true);
  if (ZS.M && state === 'play' && !dlgOpen && (keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || (typeof move !== 'undefined' && Math.hypot(move.x, move.y) > 0.3))) zaStand();
  _st(dt); const A = zaIn(); document.body.classList.toggle('unarmed', A);
  if (A) { vm.visible = false; vmMelee.visible = false; if (typeof vmOff !== 'undefined' && vmOff) vmOff.visible = false; firing = false; }
  if (ZS.M) { const [sx, sz] = zaSeat(ZS.M); player.pos.x = sx; player.pos.z = sz; player.vy = 0; camera.position.set(sx, player.pos.y + 1.3, sz); zaUiRefresh(); } }; }
{ const _f = fire; fire = function () { if (zaIn()) return; return _f.apply(this, arguments); }; }
{ const _sw = swapHand; swapHand = function () { if (zaIn()) return; return _sw.apply(this, arguments); }; }
{ const _to = throwOrd; throwOrd = function () { if (zaIn()) return; return _to.apply(this, arguments); }; }
window.addEventListener('keydown', e => { if (!ZS.M || state !== 'play' || dlgOpen) return; const b = { Digit1: 50, Digit2: 250, Digit3: 1000 }[e.code];
  if (e.code === 'Space') zaPull(); else if (b) { ZS.bet = b; zaUiRefresh(); SFX.ui && SFX.ui(); } else return; e.preventDefault(); e.stopImmediatePropagation(); }, true);
window.addEventListener('mousedown', e => { if (ZS.M && e.button === 0 && document.pointerLockElement && state === 'play' && !dlgOpen) zaPull(); });
{ const st = document.createElement('style'); st.textContent = 'body.unarmed #tFire, body.unarmed .tq, body.unarmed #ammo, body.unarmed #cross, body.unarmed #tReload { display: none !important; }'; document.head.appendChild(st); }

// an upright arcade cabinet facing local +z with a lit marquee, a screen, a control panel and side art
function zaCabinet(x, z, ry, game) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; props.add(g);
  const [title, col, scr, fn, label] = game, side = toon(col, 'hull'), black = toon('#121216'), chrome = toon('#b8bec8');
  for (const s of [-1, 1]) { part(g, B(0.05, 1.9, 0.82), side, s * 0.36, 0.95, 0); part(g, B(0.052, 0.04, 0.6), glow(col), s * 0.362, 1.3, 0.05); }
  part(g, B(0.68, 0.95, 0.7), black, 0, 0.475, -0.04); part(g, B(0.68, 0.7, 0.3), black, 0, 1.6, -0.26); part(g, B(0.66, 0.06, 0.02), toon('#ffd36a'), 0, 0.5, 0.315);
  part(g, B(0.4, 0.14, 0.02), toon('#2a2a30'), 0, 0.55, 0.32); part(g, B(0.08, 0.1, 0.02), glow('#ff5a4a'), -0.1, 0.55, 0.33); part(g, B(0.08, 0.1, 0.02), glow('#ff5a4a'), 0.1, 0.55, 0.33); // coin door
  part(g, B(0.68, 0.12, 0.34), toon('#1e1e26'), 0, 1.0, 0.2, 0.25); part(g, Cy(0.012, 0.012, 0.12, 6), black, -0.16, 1.11, 0.22); part(g, new THREE.SphereGeometry(0.035, 8, 6), toon('#d0202a'), -0.16, 1.17, 0.22);
  for (let k = 0; k < 3; k++) part(g, Cy(0.028, 0.028, 0.025, 10), glow(['#ff4a4a', '#ffd36a', '#4fd2ff'][k]), 0.04 + k * 0.09, 1.08, 0.2 + (k % 2) * 0.03, 0.25);
  // the screen sits back in a bezel, tilted up a little
  part(g, B(0.64, 0.56, 0.05), toon('#0a0a0e'), 0, 1.42, -0.05, -0.18); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.42), zaLit(zaScreen(scr))); sc.position.set(0, 1.42, -0.02); sc.rotation.x = -0.18; g.add(sc);
  part(g, B(0.68, 0.36, 0.52), black, 0, 2.08, -0.13); const mq = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.26), zaLit(zaSignTex(title, { fg: '#ffffff', glow: col, bg: '#08060e', bg2: col, w: 256, h: 104, font: 'Impact, sans-serif' }))); mq.position.set(0, 2.08, 0.135); g.add(mq);
  part(g, B(0.7, 0.03, 0.54), chrome, 0, 2.27, -0.13); part(g, B(0.7, 0.03, 0.54), chrome, 0, 1.89, -0.13);
  const [bx, bz] = zaRot(ry, 0, -0.05), [fx, fz] = zaRot(ry, 0, 0.8); box(x + bx, z + bz, Math.abs(Math.sin(ry)) * 0.4 + Math.abs(Math.cos(ry)) * 0.38, Math.abs(Math.cos(ry)) * 0.4 + Math.abs(Math.sin(ry)) * 0.38);
  INTERACTS.push({ x: x + fx, z: z + fz, r: 0.8, label, fn }); }

// ---------------- the room ----------------
function zaBuildRoom() { const { W, D, H } = ZA, X0 = -2; // the partition between the casino (x < -2) and the arcade
  // floors
  const fl = (x0, x1, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, D * 2), mat); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.005, 0); props.add(m); };
  const cc = zaTex('casinoCarpet'); cc.repeat.set((X0 + W) / 3.2, D * 2 / 3.2); fl(-W, X0, zaMat(cc)); const ck = zaTex('cosmic'); ck.repeat.set((W - X0) / 3.5, D * 2 / 3.5); fl(X0, W, zaMat(ck));
  // ceilings: coffered wood over the casino, black with a neon grid over the arcade
  const ceil = (x0, x1, mat, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, D * 2), mat); m.rotation.x = Math.PI / 2; m.position.set((x0 + x1) / 2, y, 0); props.add(m); };
  const cf = zaTex('coffer'); cf.repeat.set((X0 + W) / 2.4, D * 2 / 2.4); ceil(-W, X0, zaMat(cf), H + 0.3); ceil(X0, W, toon('#0c0c14', 'panel'), H);
  for (let x = -W + 2.4; x < X0; x += 2.4) part(props, B(0.22, 0.3, D * 2), toon('#3a1e16', 'wood'), x, H + 0.15, 0); for (let z = -D + 2.4; z < D; z += 2.4) part(props, B(X0 + W, 0.3, 0.22), toon('#3a1e16', 'wood'), (X0 - W) / 2, H + 0.15, z);
  part(props, B(X0 + W, 0.3, 0.3), toon('#c9a43a'), (X0 - W) / 2, H + 0.02, -D + 0.15); part(props, B(X0 + W, 0.3, 0.3), toon('#c9a43a'), (X0 - W) / 2, H + 0.02, D - 0.15);
  for (let x = X0 + 3; x < W; x += 4) part(props, B(0.05, 0.03, D * 2 - 1), glow(['#ff4fa0', '#3fd8ff'][Math.round(x) % 2 ? 1 : 0]), x, H - 0.02, 0);
  for (let z = -D + 4; z < D; z += 4) part(props, B(W - X0 - 1, 0.03, 0.05), glow('#9a6aff'), (W + X0) / 2, H - 0.02, z);
  // walls: damask over wood panelling in the casino, dark panels with neon strips in the arcade
  const dam = zaTex('damask'), aw = zaTex('arcWall'), wood = toon('#4a2418', 'wood'), gold = toon('#c9a43a');
  const wall = (x, z, w, d, h, mat, y) => { part(props, B(w, h, d), mat, x, (y || 0) + h / 2, z); };
  const cW = X0 + W, cx = (X0 - W) / 2;
  { const m = zaMat(dam); dam.repeat.set(cW / 1.6, 1); wall(cx, -D, cW, 0.3, H + 0.3, m); wall(cx, D, cW, 0.3, H + 0.3, m); const m2 = zaMat(zaTex('damask').clone()); m2.map.repeat.set(D * 2 / 1.6, 1); m2.map.needsUpdate = true; wall(-W, 0, 0.3, D * 2, H + 0.3, m2); }
  for (const [x, z, w, d] of [[cx, -D + 0.2, cW, 0.12], [cx, D - 0.2, cW, 0.12], [-W + 0.2, 0, 0.12, D * 2]]) { wall(x, z, w, d, 1.1, wood); part(props, B(w + (d > 1 ? 0.04 : 0), 0.06, d + 0.04), gold, x, 1.12, z); part(props, B(w, 0.12, d + 0.02), toon('#2a140e', 'wood'), x, 0.06, z); part(props, B(w, 0.14, d + 0.04), gold, x, H + 0.2, z); }
  { const m = zaMat(aw); aw.repeat.set((W - X0) / 2, H / 2); const aW = W - X0, ax = (W + X0) / 2; wall(ax, -D, aW, 0.3, H, m); wall(ax, D, aW, 0.3, H, m); const m2 = zaMat(zaTex('arcWall').clone()); m2.map.repeat.set(D, H / 2); m2.map.needsUpdate = true; wall(W, 0, 0.3, D * 2, H, m2);
    for (const [y, c] of [[0.9, '#ff4fa0'], [H - 0.4, '#3fd8ff']]) { part(props, B(aW, 0.05, 0.05), glow(c), ax, y, -D + 0.18); part(props, B(aW, 0.05, 0.05), glow(c), ax, y, D - 0.18); part(props, B(0.05, 0.05, D * 2), glow(c), W - 0.18, y, 0); } }
  for (const [x, z, hx, hz] of [[0, -D, W, 0.3], [0, D, W, 0.3], [-W, 0, 0.3, D], [W, 0, 0.3, D]]) box(x, z, hx, hz);
  // the partition with an arch at z -3..3: gold columns on the arcade side and a lit sign over the arch
  for (const [z0, z1] of [[-D, -3], [3, D]]) { const zc = (z0 + z1) / 2, L = z1 - z0; part(props, B(0.4, H + 0.3, L), zaMat(zaTex('arcWall').clone()), X0, (H + 0.3) / 2, zc); box(X0, zc, 0.2, L / 2);
    part(props, B(0.12, 1.1, L), wood, X0 - 0.24, 0.55, zc); part(props, B(0.14, 0.06, L), gold, X0 - 0.24, 1.12, zc); part(props, B(0.05, 0.05, L), glow('#ff4fa0'), X0 + 0.22, 0.9, zc); part(props, B(0.05, 0.05, L), glow('#3fd8ff'), X0 + 0.22, H - 0.4, zc); }
  part(props, B(0.4, H + 0.3 - 3.0, 6), toon('#1a1a26', 'panel'), X0, 3.0 + (H + 0.3 - 3.0) / 2, 0);
  for (const s of [-1, 1]) { part(props, Cy(0.2, 0.24, 3.0, 12), gold, X0 + 0.3, 1.5, s * 3.1); part(props, B(0.5, 0.2, 0.5), gold, X0 + 0.3, 3.05, s * 3.1); part(props, B(0.5, 0.12, 0.5), gold, X0 + 0.3, 0.06, s * 3.1); part(props, Cy(0.2, 0.24, 3.0, 12), gold, X0 - 0.3, 1.5, s * 3.1); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.08, 6, 24, Math.PI), glow('#ffd36a')); arch.position.set(X0 + 0.22, 0.2, 0); arch.rotation.y = Math.PI / 2; arch.scale.set(1, 0.93, 1); props.add(arch);
  // the Lucky Asteroid lightbox on brackets over the arch, with chasing bulbs round it
  { const lb = zaLightbox(props, zaSignTex('The Lucky Asteroid', { fg: '#ffe08a', glow: '#ff9a3a', bg: '#3a0c14', bg2: '#5a1420', rim: '#c9a43a', w: 1024, h: 160, font: 'Georgia, serif', sub: 'CASINO · SLOTS · TABLES' }), 4.6, 0.72, 0.22, X0 + 0.42, 3.62, 0, Math.PI / 2, '#ffd36a');
    for (const s of [-1, 1]) part(props, B(0.24, 0.06, 0.06), toon('#8a8e96'), X0 + 0.32, 3.62, s * 1.8);
    const bulbs = []; for (let k = 0; k < 22; k++) { const u = k / 22, per = 2 * (4.7 + 0.82), d = u * per; let bz, by; if (d < 4.7) { bz = -2.35 + d; by = 4.03; } else if (d < 5.52) { bz = 2.35; by = 4.03 - (d - 4.7); } else if (d < 10.22) { bz = 2.35 - (d - 5.52); by = 3.21; } else { bz = -2.35; by = 3.21 + (d - 10.22); }
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffd36a' })); b.position.set(X0 + 0.55, by, bz); levelGroup.add(b); bulbs.push(b); }
    levelAnims.push(t => bulbs.forEach((b, k) => b.material.color.set((Math.floor(t * 8) + k) % 3 ? '#ffe9a8' : '#5a3a10'))); }
  // casino side of the arch: velvet ropes on brass posts
  for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) { const z = s * (2.6 - k * 0.0), x = X0 - 0.6 - k * 1.1; part(props, Cy(0.04, 0.05, 0.95, 8), gold, x, 0.47, s * 2.8); part(props, new THREE.SphereGeometry(0.06, 8, 6), gold, x, 0.98, s * 2.8); part(props, Cy(0.15, 0.17, 0.04, 10), gold, x, 0.02, s * 2.8); }
    part(props, Cy(0.025, 0.025, 2.2, 6), toon('#8a0a1a', 'cloth'), X0 - 1.7, 0.85, s * 2.8, 0, 0, Math.PI / 2); }
  // lights: warm chandeliers in the casino, coloured washes in the arcade
  const chand = (x, z) => { const g = new THREE.Group(); g.position.set(x, H + 0.3, z); props.add(g); part(g, Cy(0.02, 0.02, 0.6, 4), gold, 0, -0.3, 0); part(g, new THREE.TorusGeometry(0.55, 0.03, 6, 20), gold, 0, -0.7, 0, Math.PI / 2); part(g, new THREE.TorusGeometry(0.32, 0.03, 6, 16), gold, 0, -0.95, 0, Math.PI / 2);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; part(g, new THREE.OctahedronGeometry(0.07, 0), glow('#fff4d0'), Math.cos(a) * 0.55, -0.82, Math.sin(a) * 0.55); part(g, Cy(0.03, 0.03, 0.1, 6), glow('#ffe8b0'), Math.cos(a) * 0.55, -0.64, Math.sin(a) * 0.55); }
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.3; part(g, new THREE.OctahedronGeometry(0.05, 0), glow('#fff4d0'), Math.cos(a) * 0.32, -1.05, Math.sin(a) * 0.32); } part(g, new THREE.OctahedronGeometry(0.12, 0), glow('#fff4d0'), 0, -1.2, 0);
    const l = new THREE.PointLight(0xffd8a0, 0.9, 13, 1.4); l.position.set(x, H - 1.1, z); levelGroup.add(l); };
  chand(-13, -9); chand(-13, 3); chand(-8, 13);
  for (const [x, z, c] of [[6, -10, 0xff4fa0], [16, -10, 0x3fd8ff], [6, 8, 0x9a6aff], [17, 8, 0x3fd8ff]]) { const l = new THREE.PointLight(c, 0.8, 14, 1.4); l.position.set(x, H - 0.6, z); levelGroup.add(l); }
  { const l = new THREE.PointLight(0xfff0d8, 0.5, 30, 1); l.position.set(10, H - 0.3, 0); levelGroup.add(l); }
}

// ---------------- casino ----------------
function zaCasino() { const gold = toon('#c9a43a'), wood = toon('#4a2418', 'wood'), felt = toon('#1f6a3a', 'cloth'), rail = toon('#3a1a10', 'wood');
  // twenty slot machines: a bank along the west wall, a row on the north wall, and a back-to-back island
  let n = 0; for (let k = 0; k < 8; k++) zaSlot(-23.4, -17.4 + k * 2.1, Math.PI / 2, n++);
  for (let k = 0; k < 6; k++) zaSlot(-19.6 + k * 2.1, -19.4, 0, n++);
  for (let k = 0; k < 3; k++) { zaSlot(-21 + k * 1.05, 7.55, Math.PI, n++); zaSlot(-21 + k * 1.05, 8.45, 0, n++); }
  part(props, B(3.4, 0.12, 2.1), gold, -20, 0.06, 8); part(props, B(3.2, 0.5, 0.15), toon('#2a1414', 'wood'), -20, 2.6, 8); // island plinth and a sign spine
  zaLightbox(props, zaSignTex('★ SLOTS ★', { fg: '#ffe08a', bg: '#3a0c14', bg2: '#5a1420', rim: '#c9a43a', w: 512, h: 128 }), 1.6, 0.4, 0.14, -20, 2.62, 8.1, 0, '#ffd36a');
  zaLightbox(props, zaSignTex('★ SLOTS ★', { fg: '#ffe08a', bg: '#3a0c14', bg2: '#5a1420', rim: '#c9a43a', w: 512, h: 128 }), 1.6, 0.4, 0.14, -20, 2.62, 7.9, Math.PI, '#ffd36a');
  // poker: an oval felt table under its own lamp
  { const tb = new THREE.Group(); tb.position.set(-15, 0, -9.5); props.add(tb); part(tb, Cy(1.5, 1.5, 0.1, 28), felt, 0, 0.88, 0).scale.set(1.45, 1, 1); part(tb, new THREE.TorusGeometry(1.5, 0.12, 6, 30), rail, 0, 0.92, 0, Math.PI / 2).scale.set(1.45, 1, 1); part(tb, Cy(0.35, 0.55, 0.85, 12), toon('#2a1a14', 'wood'), 0, 0.42, 0);
    [[-1.4, 0.4], [1.4, 0.4], [0, 0.8], [-0.7, -0.6], [0.7, -0.6]].forEach(([cx, cz], k) => { for (let i = 0; i < 4; i++) part(tb, Cy(0.08, 0.08, 0.035, 10), toon(['#c8402f', '#3b4f7a', '#e8e4dc', '#1e1c22'][i]), cx * 0.75 + (i % 2) * 0.17, 0.96 + Math.floor(i / 2) * 0.035, cz * 0.75); for (let i = 0; i < 2; i++) part(tb, B(0.13, 0.008, 0.19), toon('#f4f8ff'), cx * 0.45 + i * 0.15, 0.94, cz * 0.45, 0, 0.3 * (i ? 1 : -1)); });
    for (const [cx, cz] of [[-1.3, -1.7], [1.3, -1.7]]) { part(tb, Cy(0.26, 0.26, 0.1, 12), toon('#6a1a24', 'cloth'), cx, 0.55, cz); part(tb, B(0.5, 0.5, 0.08), toon('#6a1a24', 'cloth'), cx * 1.12, 0.85, cz * 1.12 + (cz > 0 ? 0.0 : 0), 0, Math.atan2(cx, cz)); part(tb, Cy(0.04, 0.04, 0.5, 5), gold, cx, 0.25, cz); }
    part(props, Cy(0.02, 0.02, 0.9, 4), toon('#1e1c22'), -15, ZA.H - 0.15, -9.5); part(props, Cy(0.35, 0.8, 0.4, 14, 1, true), toon('#1a4a2a'), -15, ZA.H - 0.8, -9.5); part(props, Cy(0.3, 0.3, 0.02, 12), glow('#fff1c8'), -15, ZA.H - 0.99, -9.5);
    box(-15, -9.5, 2.3, 1.6); INTERACTS.push({ x: -15, z: -11.6, r: 1.5, label: '🃏 Space poker with Dealer Vex', fn: () => openPoker() }); }
  // blackjack: a half-moon table, the dealer on the flat side with a shoe and a chip rack
  const halfMoon = (X, Z, ry, ftex) => { const tb = new THREE.Group(); tb.position.set(X, 0, Z); tb.rotation.y = ry; props.add(tb); const half = (r, h, y, m) => part(tb, new THREE.CylinderGeometry(r, r, h, 28, 1, false, -Math.PI / 2, Math.PI), m, 0, y, 0);
    half(1.35, 0.82, 0.41, rail); half(1.48, 0.1, 0.86, rail); const fg = new THREE.CircleGeometry(1.4, 28, Math.PI, Math.PI), fp = fg.attributes.position, fu = fg.attributes.uv; for (let i = 0; i < fp.count; i++) fu.setXY(i, (fp.getX(i) / 1.4 + 1) / 2, 1 + fp.getY(i) / 1.4); fu.needsUpdate = true;
    const top = new THREE.Mesh(fg, (ftex.isMaterial ? ftex : zaMat(ftex))); top.rotation.x = -Math.PI / 2; top.position.y = 0.915; tb.add(top);
    part(tb, new THREE.TorusGeometry(1.44, 0.07, 6, 24, Math.PI), toon('#2a1410', 'cloth'), 0, 0.93, 0, Math.PI / 2); part(tb, B(2.96, 0.92, 0.14), rail, 0, 0.46, 0.0);
    part(tb, B(0.9, 0.1, 0.24), toon('#1e1c22'), 0, 0.97, 0.18); for (let i = 0; i < 7; i++) part(tb, Cy(0.05, 0.05, 0.06, 10), toon(['#c8402f', '#e8e4dc', '#3b4f7a', '#ffd36a', '#1f6a3a', '#c8402f', '#1e1c22'][i]), -0.36 + i * 0.12, 1.05, 0.18);
    part(tb, B(0.24, 0.16, 0.36), toon('#3a1a10', 'wood'), 0.9, 1.0, 0.35, 0, -0.3); for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i + 0.5) * Math.PI / 4; part(tb, Cy(0.25, 0.25, 0.08, 12), toon('#6a1a24', 'cloth'), Math.sin(a) * 1.9, 0.72, Math.cos(a) * 1.9); part(tb, Cy(0.04, 0.04, 0.7, 5), gold, Math.sin(a) * 1.9, 0.36, Math.cos(a) * 1.9); }
    return tb; };
  halfMoon(-7.5, -10.4, 0, zaTex('bjFelt')); box(-7.5, -10, 1.5, 0.9); INTERACTS.push({ x: -7.5, z: -8.4, r: 1.5, label: '🂡 Blackjack with Dealer Marlo', fn: openBlackjack });
  halfMoon(-7.5, 4.6, Math.PI, zaTex('hlFelt')); box(-7.5, 4.4, 1.5, 0.9); INTERACTS.push({ x: -7.5, z: 2.6, r: 1.5, label: '🂠 High-low with Dealer Pip', fn: openHighLow });
  // roulette: a long felt layout with a wheel in a wooden bowl at the west end
  { const X = -14, Z = 2.8, tb = new THREE.Group(); tb.position.set(X, 0, Z); props.add(tb);
    part(tb, B(4.6, 0.84, 1.9), rail, 0, 0.42, 0); part(tb, B(4.7, 0.08, 2.0), toon('#2a1410', 'cloth'), 0, 0.88, 0); const lay = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), zaMat(zaTex('rlFelt'))); lay.rotation.x = -Math.PI / 2; lay.position.set(0.6, 0.925, 0); tb.add(lay);
    part(tb, Cy(0.86, 0.8, 0.2, 28), toon('#4a2418', 'wood'), -1.55, 0.98, 0); for (let i = 0; i < 6; i++) { part(tb, Cy(0.05, 0.05, 0.05 + (i % 3) * 0.04, 10), toon(['#c8402f', '#e8e4dc', '#3b4f7a'][i % 3]), 0.2 + i * 0.3, 0.95, 0.55 - (i % 2) * 1.1); }
    for (let i = 0; i < 4; i++) { part(tb, Cy(0.25, 0.25, 0.08, 12), toon('#6a1a24', 'cloth'), -0.6 + i * 1.0, 0.72, 1.45); part(tb, Cy(0.04, 0.04, 0.7, 5), gold, -0.6 + i * 1.0, 0.36, 1.45); }
    const wh = new THREE.Group(); wh.position.set(X - 1.55, 1.09, Z); levelGroup.add(wh); const top = new THREE.Mesh(new THREE.CircleGeometry(0.72, 37), zaMat(zaTex('wheel'))); top.rotation.x = -Math.PI / 2; wh.add(top);
    const tur = new THREE.Mesh(Cy(0.03, 0.06, 0.16, 8), toon('#c9a43a')); tur.position.y = 0.08; wh.add(tur); for (let k = 0; k < 4; k++) part(wh, B(0.18, 0.025, 0.025), toon('#c9a43a'), Math.cos(k * Math.PI / 2) * 0.09, 0.14, Math.sin(k * Math.PI / 2) * 0.09, 0, -k * Math.PI / 2);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.06, 6, 32), toon('#3a1a10', 'wood')); rim.rotation.x = Math.PI / 2; rim.position.set(X - 1.55, 1.1, Z); levelGroup.add(rim);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), toon('#f4f4f4')); wh.add(ball);
    const POCK = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    const pAng = n => POCK.indexOf(n) / 37 * Math.PI * 2; let last = -1, w = 0;
    levelAnims.push(t => { const now = performance.now(), p = RL.spinAt ? Math.min(1, (now - RL.spinAt) / 3000) : 1, res = RL.result == null ? 17 : RL.result;
      if (p < 1) { w += (0.016) * (1 + 9 * (1 - p)); const rel = pAng(res) + 26 * (1 - p) * (1 - p), r = p < 0.7 ? 0.66 : 0.66 - (p - 0.7) / 0.3 * 0.2; ball.position.set(Math.cos(rel) * r, 0.03 + (p > 0.7 && p < 0.95 ? Math.abs(Math.sin(p * 60)) * 0.03 : 0), Math.sin(rel) * r); }
      else { w += 0.004; ball.position.set(Math.cos(pAng(res)) * 0.46, 0.03, Math.sin(pAng(res)) * 0.46); }
      wh.rotation.y = w; });
    part(props, Cy(0.02, 0.02, 0.9, 4), toon('#1e1c22'), X, ZA.H - 0.15, Z); part(props, B(3.4, 0.16, 0.6), toon('#1a4a2a'), X, ZA.H - 0.65, Z); part(props, B(3.2, 0.02, 0.5), glow('#fff1c8'), X, ZA.H - 0.74, Z);
    box(X, Z, 2.4, 1.0); INTERACTS.push({ x: X + 0.6, z: Z + 1.9, r: 1.8, label: '🎡 Roulette with Croupier Sol', fn: openRoulette }); }
  // the cashier cage on the north wall: a counter, brass bars, a brass plaque and Lucky Lux behind the glass
  { const X = -13, Z = 18.7; part(props, B(6, 1.1, 0.7), wood, X, 0.55, Z); part(props, B(6.1, 0.06, 0.8), toon('#e8d8b0', 'stone'), X, 1.13, Z); part(props, B(6, 0.05, 0.05), gold, X, 0.3, Z - 0.36);
    for (let k = 0; k <= 24; k++) part(props, Cy(0.015, 0.015, 1.6, 5), gold, X - 3 + k * 0.25, 1.95, Z - 0.3); part(props, B(6.1, 0.08, 0.08), gold, X, 2.78, Z - 0.3); part(props, B(6.1, 0.08, 0.08), gold, X, 1.18, Z - 0.3);
    for (const dx of [-1.6, 0, 1.6]) { part(props, B(0.8, 0.08, 0.06), toon('#1e1c22'), X + dx, 1.2, Z - 0.32); part(props, B(0.8, 0.5, 0.02), new THREE.MeshLambertMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.2 }), X + dx, 1.5, Z - 0.33); }
    part(props, B(6.2, 1.2, 0.5), wood, X, 3.5, Z + 0.1); zaLightbox(props, zaSignTex('CASHIER', { fg: '#3a1a08', glow: '#fff4c0', bg: '#c9a43a', bg2: '#f0d890', blur: 2, w: 512, h: 112, font: 'Georgia, serif' }), 2.2, 0.48, 0.06, X, 3.5, Z - 0.17, 0);
    box(X, Z, 3, 0.4); }
  // a lounge corner: two sofas, a low table and potted palms
  for (const [x, z, ry] of [[-21.2, 15.2, Math.PI / 2], [-18.4, 17.8, Math.PI]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; props.add(g); part(g, B(2.2, 0.45, 0.9), toon('#5a1420', 'cloth'), 0, 0.3, 0); part(g, B(2.2, 0.6, 0.22), toon('#5a1420', 'cloth'), 0, 0.75, -0.36); for (const s of [-1, 1]) part(g, B(0.2, 0.62, 0.9), toon('#4a1018', 'cloth'), s * 1.1, 0.4, 0); part(g, B(2.3, 0.06, 0.06), gold, 0, 0.06, 0.44);
    const [bx, bz] = zaRot(ry, 0, 0); box(x + bx, z + bz, Math.abs(Math.cos(ry)) * 1.1 + Math.abs(Math.sin(ry)) * 0.45, Math.abs(Math.sin(ry)) * 1.1 + Math.abs(Math.cos(ry)) * 0.45); }
  part(props, Cy(0.55, 0.55, 0.06, 18), toon('#1e1c22'), -19.4, 0.45, 15.6); part(props, Cy(0.08, 0.2, 0.42, 8), gold, -19.4, 0.21, 15.6); solid(-19.4, 15.6, 0.55);
  for (const [x, z] of [[-23, 18.8], [-3.2, 18.8], [-3.2, -18.8], [-23, -19.4]]) { part(props, Cy(0.32, 0.25, 0.6, 10), gold, x, 0.3, z); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; part(props, B(0.12, 0.02, 0.8), toon('#3f7a2a', 'leaves'), x + Math.cos(a) * 0.32, 1.3, z + Math.sin(a) * 0.32, 0.6 * Math.sin(a), -a, 0.6 * Math.cos(a)); } part(props, Cy(0.05, 0.07, 0.8, 6), toon('#5a4030', 'wood'), x, 0.95, z); solid(x, z, 0.4); }
}

// ---------------- arcade ----------------
function zaArcade() { const chrome = toon('#a8aeb8'), dark = toon('#1e1c22'), wood = toon('#6a4a30', 'wood');
  const UP = [['SPACE SNAKE', '#3fb83a', 0, () => arcOpen('snake'), '🕹 Space Snake (free · pays for high scores)'], ['SPACE ROCKS', '#3a7ad8', 1, () => arcOpen('rocks'), '🕹 Space Rocks (free · pays for high scores)'],
    ['BLORK INVADERS', '#c83a8a', 2, () => arcMini('BLORK INVADERS', 25, gameInvaders), '👾 Blork Invaders (25 cr)'], ['STAR RACER', '#d8a020', 3, () => arcMini('STAR RACER', 25, gameRacer), '🏁 Star Racer (25 cr)']];
  // a row of uprights along the north wall and a back-to-back row in the middle
  [0, 1, 2, 0, 1, 2, 3].forEach((gi, k) => zaCabinet(0.8 + k * 1.0, -19.35, 0, UP[gi]));
  [2, 0, 1, 3].forEach((gi, k) => { zaCabinet(4 + k * 1.0, -4.45, Math.PI, UP[gi]); zaCabinet(4 + k * 1.0, -3.55, 0, UP[(gi + 1) % 4]); }); part(props, B(4.1, 2.3, 0.1), toon('#121216'), 5.5, 1.15, -4);
  zaLightbox(props, zaSignTex('VIDEO GAMES', { fg: '#7fe8ff', glow: '#3fd8ff', bg: '#05060f', w: 512, h: 112, font: 'Impact, sans-serif' }), 2.2, 0.42, 0.12, 5.5, 2.9, -4, 0, '#3fd8ff');
  zaLightbox(props, zaSignTex('VIDEO GAMES', { fg: '#7fe8ff', glow: '#3fd8ff', bg: '#05060f', w: 512, h: 112, font: 'Impact, sans-serif' }), 2.2, 0.42, 0.12, 5.5, 2.9, -4, Math.PI, '#3fd8ff');
  part(props, Cy(0.015, 0.015, ZA.H - 3.1, 4), chrome, 4.6, (ZA.H + 3.1) / 2, -4); part(props, Cy(0.015, 0.015, ZA.H - 3.1, 4), chrome, 6.4, (ZA.H + 3.1) / 2, -4);
  // pinball: three tables along the partition, glass playfields lit from inside
  for (let k = 0; k < 3; k++) { const z = -16.6 + k * 1.3, g = new THREE.Group(); g.position.set(-0.6, 0, z); g.rotation.y = -Math.PI / 2; props.add(g); const col = ['#ff4fa0', '#3fd8ff', '#ffd23a'][k];
    part(g, B(0.75, 0.3, 1.4), toon('#1a1a2a', 'hull'), 0, 0.95, 0, 0.1); for (const [lx, lz] of [[-0.32, -0.6], [0.32, -0.6], [-0.32, 0.6], [0.32, 0.6]]) part(g, B(0.06, 0.85, 0.06), chrome, lx, 0.42, lz * (lz < 0 ? 1 : 0.95));
    const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 1.3), zaLit(zaCanvas(128, 256, (x) => { x.fillStyle = '#0a0a1a'; x.fillRect(0, 0, 128, 256); x.strokeStyle = col; x.lineWidth = 3; for (const [a, b] of [[40, 60], [88, 60], [64, 100]]) { x.beginPath(); x.arc(a, b, 12, 0, 7); x.stroke(); } x.beginPath(); x.moveTo(20, 200); x.lineTo(54, 228); x.moveTo(108, 200); x.lineTo(74, 228); x.stroke(); x.fillStyle = '#e8e8f0'; x.beginPath(); x.arc(70, 160, 5, 0, 7); x.fill(); x.strokeStyle = '#ffd36a'; x.strokeRect(6, 6, 116, 244); })));
    pf.rotation.x = -Math.PI / 2 + 0.1; pf.position.set(0, 1.115, 0); g.add(pf); part(g, B(0.75, 0.75, 0.12), toon('#1a1a2a', 'hull'), 0, 1.45, -0.72);
    const bb = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.52), zaLit(zaSignTex(['GALAXY QUEEN', 'BLORK ATTACK', 'MAW WIZARD'][k], { fg: '#ffffff', glow: col, bg: '#0a0410', bg2: col, w: 256, h: 196, font: 'Impact, sans-serif' }))); bb.position.set(0, 1.47, -0.655); g.add(bb);
    box(-0.6, z, 0.7, 0.4); INTERACTS.push({ x: 0.6, z, r: 0.75, label: '🎯 Pinball (25 cr)', fn: () => arcMini(['GALAXY QUEEN', 'BLORK ATTACK', 'MAW WIZARD'][k], 25, gamePinball) }); }
  // air hockey: a white table with lit rails and a puck that drifts on the air
  { const X = 11, Z = -11, g = new THREE.Group(); g.position.set(X, 0, Z); props.add(g); part(g, B(1.5, 0.8, 2.6), toon('#1a2a5a', 'hull'), 0, 0.4, 0); part(g, B(1.36, 0.04, 2.46), toon('#eef4ff'), 0, 0.82, 0);
    for (const s of [-1, 1]) { part(g, B(0.08, 0.1, 2.6), glow('#3fd8ff'), s * 0.72, 0.86, 0); part(g, B(1.5, 0.1, 0.08), glow('#ff4fa0'), 0, 0.86, s * 1.28); part(g, B(0.45, 0.02, 0.1), toon('#10141e'), 0, 0.85, s * 1.24); }
    part(g, B(1.36, 0.005, 0.03), toon('#ff4a6a'), 0, 0.843, 0); const pk = new THREE.Mesh(Cy(0.07, 0.07, 0.02, 14), toon('#d0202a')); levelGroup.add(pk); const ms = [0, 1].map(i => { const m = new THREE.Mesh(Cy(0.09, 0.1, 0.06, 14), toon(i ? '#3a7ad8' : '#c83a3a')); levelGroup.add(m); return m; });
    levelAnims.push(t => { const px = Math.sin(t * 1.3) * 0.5, pz = Math.sin(t * 0.9) * 1.0; pk.position.set(X + px, 0.86, Z + pz); ms[0].position.set(X + Math.sin(t * 1.3 - 0.4) * 0.4, 0.88, Z - 0.95); ms[1].position.set(X + Math.sin(t * 1.3 + 0.5) * 0.4, 0.88, Z + 0.95); });
    zaLightbox(props, zaSignTex('AIR HOCKEY', { fg: '#ffffff', glow: '#3fd8ff', bg: '#0a1838', w: 512, h: 112, font: 'Impact, sans-serif' }), 1.5, 0.34, 0.12, X, 3.4, Z, Math.PI / 2, '#3fd8ff');
    zaLightbox(props, zaSignTex('AIR HOCKEY', { fg: '#ffffff', glow: '#3fd8ff', bg: '#0a1838', w: 512, h: 112, font: 'Impact, sans-serif' }), 1.5, 0.34, 0.12, X, 3.4, Z, -Math.PI / 2, '#3fd8ff');
    for (const s of [-1, 1]) part(props, Cy(0.012, 0.012, ZA.H - 3.55, 4), chrome, X, (ZA.H + 3.55) / 2, Z + s * 0.6);
    box(X, Z, 0.75, 1.3); INTERACTS.push({ x: X + 1.3, z: Z, r: 1.3, label: '🏒 Air hockey (25 cr)', fn: () => arcMini('AIR HOCKEY', 25, gameHockey) }); }
  // Star Racer sit-downs: a moulded seat, a wheel and a wide screen, facing the north wall
  for (let k = 0; k < 2; k++) { const X = 4.2 + k * 2.0, Z = 11, g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = Math.PI; props.add(g);
    part(g, B(1.4, 1.5, 0.7), toon('#d8a020', 'hull'), 0, 0.75, -0.6); part(g, B(1.2, 0.8, 0.05), toon('#0a0a0e'), 0, 1.45, -0.24, -0.15); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.66), zaLit(zaScreen(3))); sc.position.set(0, 1.45, -0.21); sc.rotation.x = -0.15; g.add(sc);
    part(g, B(1.4, 0.4, 0.75), toon('#121216'), 0, 2.25, -0.62); const mq = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.34), zaLit(zaSignTex('STAR RACER', { fg: '#ffffff', glow: '#ffd23a', bg: '#120408', bg2: '#d8a020', w: 512, h: 132, font: 'Impact, sans-serif' }))); mq.position.set(0, 2.25, -0.24); g.add(mq);
    part(g, B(0.8, 0.5, 0.4), toon('#1e1e26'), 0, 0.85, -0.1); const wl = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 18), dark); wl.position.set(0, 1.12, 0.05); wl.rotation.x = -0.7; g.add(wl);
    part(g, B(0.9, 0.12, 1.6), toon('#121216'), 0, 0.06, 0.6); part(g, B(0.62, 0.15, 0.62), toon('#c8402f', 'cloth'), 0, 0.55, 0.85); part(g, B(0.62, 0.8, 0.15), toon('#c8402f', 'cloth'), 0, 0.95, 1.18, 0.15); part(g, B(0.64, 0.4, 0.5), dark, 0, 0.25, 0.85);
    for (const s of [-1, 1]) part(g, B(0.03, 0.03, 1.5), glow('#ffd23a'), s * 0.7, 0.04, 0.5);
    box(X, Z + 0.3, 0.7, 0.9); INTERACTS.push({ x: X, z: Z - 1.3, r: 0.9, label: '🏁 Star Racer (25 cr)', fn: () => arcMini('STAR RACER', 25, gameRacer) }); }
  // Neon Step: a lit four-arrow dance pad in front of a tall screen with speakers
  { const X = 9.5, Z = 4, g = new THREE.Group(); g.position.set(X, 0, Z); props.add(g); part(g, B(2.0, 2.6, 0.7), toon('#2a0a3a', 'hull'), 0, 1.3, -1.1); part(g, B(1.4, 0.9, 0.04), toon('#0a0a0e'), 0, 1.75, -0.74);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), zaLit(zaCanvas(256, 160, (x) => { x.fillStyle = '#0a0418'; x.fillRect(0, 0, 256, 160); ['#ff6aa8', '#4fd2ff', '#9fff6a', '#ffd36a'].forEach((c, i) => { x.fillStyle = c; for (let k = 0; k < 3; k++) x.fillRect(40 + i * 48, 20 + k * 45 + i * 10, 30, 12); }); x.strokeStyle = '#fff'; x.strokeRect(36, 130, 184, 16); }))); sc.position.set(0, 1.75, -0.72); g.add(sc);
    for (const s of [-1, 1]) { part(g, B(0.4, 0.7, 0.4), dark, s * 0.85, 0.75, -1.0); part(g, Cy(0.13, 0.13, 0.04, 14), toon('#3a3a44'), s * 0.85, 0.85, -0.79, Math.PI / 2); }
    part(g, B(2.2, 0.5, 0.75), toon('#120418'), 0, 2.85, -1.1); const mq = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.42), zaLit(zaSignTex('NEON STEP', { fg: '#ffffff', glow: '#ff4fa0', bg: '#1a0420', bg2: '#5a0a5a', w: 512, h: 108, font: 'Impact, sans-serif' }))); mq.position.set(0, 2.85, -0.72); g.add(mq);
    part(g, B(1.9, 0.12, 1.9), toon('#2a2a34', 'panel'), 0, 0.06, 0.4); part(g, Cy(0.02, 0.02, 1.0, 5), chrome, 0, 1.1, -0.45, 0, 0, Math.PI / 2); for (const s of [-1, 1]) part(g, Cy(0.02, 0.02, 1.0, 5), chrome, s * 0.5, 0.6, -0.45);
    const pads = []; [[0, -0.2, '#4fd2ff'], [0, 1.0, '#9fff6a'], [-0.6, 0.4, '#ff6aa8'], [0.6, 0.4, '#ffd36a']].forEach(([px, pz, c]) => { const p = new THREE.Mesh(B(0.5, 0.03, 0.5), new THREE.MeshBasicMaterial({ color: c })); p.position.set(X + px, 0.135, Z + pz); levelGroup.add(p); pads.push([p, c]); });
    levelAnims.push(t => pads.forEach(([p, c], i) => p.material.color.set(Math.floor(t * 2.4 + i * 1.7) % 3 ? c : '#202028'))); box(X, Z - 1.05, 1.0, 0.4);
    INTERACTS.push({ x: X, z: Z + 0.5, r: 1.2, label: '💃 Neon Step (25 cr)', fn: () => arcMini('NEON STEP', 25, gameDance) }); }
  // skee-ball: three lanes rolling east, with one lit header across the backboards
  for (let i = 0; i < 3; i++) { const z = -14.6 + i * 1.5, g = new THREE.Group(); g.position.set(17.4, 0, z); props.add(g);
    part(g, B(6, 0.7, 1.2), wood, 3, 0.35, 0); part(g, B(5.4, 0.06, 0.9), toon('#a07a4a', 'wood'), 3.1, 0.95, 0, 0, 0, 0.12); for (const s of [-1, 1]) part(g, B(6, 0.25, 0.08), dark, 3, 0.8, s * 0.6); for (const s of [-1, 1]) part(g, B(5.6, 0.03, 0.03), glow(['#ff6aa8', '#4fd2ff', '#ffd36a'][i]), 3, 0.94, s * 0.6);
    part(g, B(0.3, 2.2, 1.2), dark, 6.1, 1.1, 0); for (const [r, c, y] of [[0.45, '#6fdc5a', 1.25], [0.34, '#4fd2ff', 1.35], [0.24, '#ffd36a', 1.48], [0.13, '#ff6aa8', 1.62]]) part(g, Cy(r, r, 0.03, 20), glow(c), 5.93, y, 0, 0, 0, Math.PI / 2 - 0.4);
    for (let k = 0; k < 3; k++) part(g, new THREE.SphereGeometry(0.1, 8, 6), toon('#e8e4dc'), 0.4 + k * 0.22, 0.78, -0.3); box(20.4, z, 3, 0.6); }
  zaLightbox(props, zaSignTex('SKEE-BALL', { fg: '#ffffff', glow: '#ffd36a', bg: '#1a0a04', bg2: '#8a3a10', rim: '#ffd36a', w: 512, h: 112, font: 'Impact, sans-serif' }), 3.6, 0.6, 0.2, 23.35, 2.6, -13.1, -Math.PI / 2, '#ffd36a');
  INTERACTS.push({ x: 16.8, z: -13.1, r: 2.2, label: '🎳 Skee-ball (25 cr)', fn: () => arcMini('SKEE-BALL', 25, gameSkee) });
  // claw machines against the east wall
  const claws = []; for (const z of [-7.4, -5.6]) { const g = new THREE.Group(); g.position.set(23.1, 0, z); g.rotation.y = -Math.PI / 2; props.add(g);
    part(g, B(1.5, 1.0, 1.4), toon('#7a2a6a'), 0, 0.5, 0); part(g, B(1.52, 0.08, 1.42), glow('#ff6aa8'), 0, 1.02, 0);
    const gl = new THREE.Mesh(B(1.44, 1.3, 1.34), new THREE.MeshLambertMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.18, depthWrite: false })); gl.position.set(0, 1.71, 0); g.add(gl); for (const [a, b] of [[-0.72, -0.67], [0.72, -0.67], [-0.72, 0.67], [0.72, 0.67]]) part(g, B(0.05, 1.3, 0.05), chrome, a, 1.71, b);
    part(g, B(1.5, 0.45, 1.4), toon('#7a2a6a'), 0, 2.58, 0); const mq = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.36), zaLit(zaSignTex('CLAW-O-MATIC', { fg: '#ffffff', glow: '#ff6aa8', bg: '#2a0a2a', bg2: '#7a2a6a', w: 512, h: 136, font: 'Impact, sans-serif' }))); mq.position.set(0, 2.58, 0.705); g.add(mq);
    for (let k = 0; k < 12; k++) part(g, new THREE.SphereGeometry(0.14, 8, 6), toon(['#c8402f', '#6fdc5a', '#7fae63', '#ffd36a', '#4fd2ff'][k % 5]), -0.5 + (k % 4) * 0.33, 1.16 + (k > 7 ? 0.14 : 0), -0.45 + Math.floor(k / 4) * 0.36);
    const cl = new THREE.Group(); part(cl, Cy(0.008, 0.008, 0.6, 4), chrome, 0, -0.3, 0); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; part(cl, B(0.03, 0.18, 0.03), chrome, Math.cos(a) * 0.07, -0.66, Math.sin(a) * 0.07, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); }
    cl.position.set(0, 2.33, 0); g.add(cl); claws.push(cl); part(g, B(0.5, 0.06, 0.3), toon('#2a2a30'), 0, 1.02, 0.85); part(g, Cy(0.015, 0.015, 0.15, 6), dark, -0.1, 1.1, 0.85); part(g, new THREE.SphereGeometry(0.04, 8, 6), toon('#d0202a'), -0.1, 1.18, 0.85); part(g, Cy(0.04, 0.04, 0.03, 10), glow('#ffd36a'), 0.12, 1.06, 0.85);
    // the claw sways, so this machine's moving parts go in levelGroup instead of the merged props
    props.remove(g); levelGroup.add(g); box(23.1, z, 0.7, 0.75); }
  levelAnims.push(t => claws.forEach((c, i) => { c.position.x = Math.sin(t * 0.7 + i * 2) * 0.45; c.position.z = Math.cos(t * 0.5 + i) * 0.35; }));
  INTERACTS.push({ x: 21.8, z: -6.5, r: 1.6, label: '🧸 Claw machine (25 cr)', fn: () => arcMini('CLAW-O-MATIC', 25, gameClaw) });
  // hoop shot: two netted cages, the lit header on top of each backboard
  const hoops = []; for (const z of [-1.4, 1.2]) { const g = new THREE.Group(); g.position.set(21.3, 0, z); g.rotation.y = -Math.PI / 2; props.add(g);
    part(g, B(2.2, 0.5, 4.2), toon('#2a3a6a'), 0, 0.25, -0.6); part(g, B(2.2, 0.06, 3.6), toon('#c86a2a', 'wood'), 0, 0.62, -0.9, -0.12);
    for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), new THREE.MeshBasicMaterial({ color: '#cfd8ff', transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })); n.position.set(s * 1.1, 1.8, -0.6); n.rotation.y = Math.PI / 2; g.add(n); part(g, B(0.06, 2.7, 0.06), chrome, s * 1.1, 1.65, 1.45); part(g, B(0.06, 2.7, 0.06), chrome, s * 1.1, 1.65, -2.65); }
    part(g, B(2.2, 0.06, 4.2), chrome, 0, 3.0, -0.6); const bb = new THREE.Group(); bb.position.set(0, 2.2, -2.5); g.add(bb); part(bb, B(1.2, 0.8, 0.06), toon('#f4f8ff'), 0, 0.3, 0); part(bb, B(0.5, 0.36, 0.07), glow('#c8402f'), 0, 0.15, 0.01);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 6, 20), toon('#ff7a2a')); rim.rotation.x = Math.PI / 2; rim.position.set(0, -0.08, 0.3); bb.add(rim); hoops.push(bb);
    for (let k = 0; k < 4; k++) part(g, new THREE.SphereGeometry(0.13, 10, 8), toon('#e8762a'), -0.6 + k * 0.4, 0.82, 0.9);
    part(g, B(2.2, 0.5, 0.2), toon('#1a2448'), 0, 3.35, -2.6); const mq = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.4), zaLit(zaSignTex('HOOP SHOT', { fg: '#ffffff', glow: '#ff7a2a', bg: '#0a1030', bg2: '#2a3a8a', w: 512, h: 104, font: 'Impact, sans-serif' }))); mq.position.set(0, 3.35, -2.49); g.add(mq);
    props.remove(g); levelGroup.add(g); box(21.3 + 0.6, z, 2.1, 1.1); }
  levelAnims.push(t => hoops.forEach((h, i) => { h.position.x = Math.sin(t * 0.9 + i * 1.7) * 0.4; }));
  INTERACTS.push({ x: 18.6, z: -0.1, r: 2.0, label: '🏀 Hoop shot (25 cr)', fn: () => arcMini('HOOP SHOT', 25, gameHoop) });
  // whack-a-Blork: a lit header box on the back panel, a padded mallet on a tether
  { const g = new THREE.Group(); g.position.set(23.2, 0, 5.4); g.rotation.y = -Math.PI / 2; levelGroup.add(g); part(g, B(2.0, 0.9, 1.4), toon('#3a5a2a', 'hull'), 0, 0.45, 0); part(g, B(2.1, 0.08, 1.5), glow('#6fdc5a'), 0, 0.92, 0);
    const heads = []; for (let k = 0; k < 9; k++) { const hx = -0.6 + (k % 3) * 0.6, hz = -0.4 + Math.floor(k / 3) * 0.4; part(g, Cy(0.15, 0.15, 0.02, 14), dark, hx, 0.965, hz); const h = new THREE.Group(); h.position.set(hx, 0.9, hz); g.add(h); part(h, new THREE.SphereGeometry(0.12, 10, 8), toon('#6fdc5a'), 0, 0, 0); part(h, new THREE.SphereGeometry(0.035, 6, 4), toon('#ffffff'), -0.05, 0.05, 0.1); part(h, new THREE.SphereGeometry(0.035, 6, 4), toon('#ffffff'), 0.05, 0.05, 0.1); heads.push(h); }
    part(g, B(2.0, 1.4, 0.14), toon('#2a4a1a', 'hull'), 0, 1.6, -0.7); for (let k = 0; k < 8; k++) part(g, new THREE.SphereGeometry(0.04, 6, 4), glow(k % 2 ? '#ffd36a' : '#9fff6a'), -0.9 + k * 0.257, 2.28, -0.62);
    part(g, B(2.2, 0.55, 0.3), toon('#14240c'), 0, 2.6, -0.7); const mq = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.46), zaLit(zaSignTex('WHACK-A-BLORK', { fg: '#efffd8', glow: '#9fff6a', bg: '#0a1206', bg2: '#2a5a1a', w: 512, h: 118, font: 'Impact, sans-serif' }))); mq.position.set(0, 2.6, -0.545); g.add(mq);
    part(g, Cy(0.03, 0.03, 0.5, 6), toon('#5a3a24', 'wood'), 0.85, 1.05, 0.55, 0, 0, 1.2); part(g, Cy(0.09, 0.09, 0.2, 10), toon('#c8402f', 'cloth'), 1.05, 1.15, 0.55, 0, 0, Math.PI / 2);
    levelAnims.push(t => heads.forEach((h, k) => { h.position.y = 0.86 + Math.max(0, Math.sin(t * 3 + k * 2.3)) * 0.16; })); box(23.2, 5.4, 0.75, 1.05);
    INTERACTS.push({ x: 21.5, z: 5.4, r: 1.6, label: '🔨 Whack-a-Blork (25 cr)', fn: () => arcMini('WHACK-A-BLORK', 25, gameWhack) }); }
  // the prize counter on the south wall: glass case, shelves of plushies and a hanging lightbox
  { const X = 11.5, Z = 18.2; part(props, B(6, 1.0, 0.8), toon('#1e1e2a', 'hull'), X, 0.5, Z); part(props, B(6.1, 0.05, 0.9), toon('#cfe8ff'), X, 1.03, Z); part(props, B(6, 0.04, 0.04), glow('#ff4fa0'), X, 0.98, Z - 0.42);
    for (let k = 0; k < 14; k++) part(props, new THREE.IcosahedronGeometry(0.1, 0), toon(['#ffd36a', '#4fd2ff', '#ff6aa8', '#6fdc5a'][k % 4]), X - 2.6 + k * 0.4, 0.7, Z - 0.1);
    part(props, B(6.4, 2.8, 0.3), toon('#16161e', 'panel'), X, 1.4, Z + 1.55); for (let r = 0; r < 3; r++) { part(props, B(6.2, 0.06, 0.45), wood, X, 0.7 + r * 0.75, Z + 1.25); part(props, B(6.2, 0.03, 0.03), glow(['#ff6aa8', '#4fd2ff', '#ffd36a'][r]), X, 0.72 + r * 0.75, Z + 1.02);
      for (let k = 0; k < 9; k++) { const px = X - 2.8 + k * 0.7, col = ['#c8402f', '#6fdc5a', '#7fae63', '#8a3a8a', '#ffd36a', '#4fd2ff'][(k + r * 2) % 6], py = 0.73 + r * 0.75; part(props, new THREE.SphereGeometry(0.17, 8, 6), toon(col, 'cloth'), px, py + 0.17, Z + 1.25); part(props, new THREE.SphereGeometry(0.12, 8, 6), toon(col, 'cloth'), px, py + 0.42, Z + 1.25);
        part(props, new THREE.SphereGeometry(0.025, 5, 4), dark, px - 0.045, py + 0.45, Z + 1.14); part(props, new THREE.SphereGeometry(0.025, 5, 4), dark, px + 0.045, py + 0.45, Z + 1.14); } }
    for (const s of [-1, 1]) part(props, Cy(0.01, 0.01, 0.7, 4), chrome, X + s * 1.1, ZA.H - 0.35, Z - 0.3);
    zaLightbox(props, zaSignTex('🎟 PRIZES', { fg: '#ffffff', glow: '#ff4fa0', bg: '#1a0420', bg2: '#5a0a5a', w: 512, h: 112, font: 'Impact, sans-serif' }), 2.6, 0.55, 0.14, X, ZA.H - 0.95, Z - 0.3, Math.PI, '#ff4fa0');
    zaLightbox(props, zaSignTex('🎟 PRIZES', { fg: '#ffffff', glow: '#ff4fa0', bg: '#1a0420', bg2: '#5a0a5a', w: 512, h: 112, font: 'Impact, sans-serif' }), 2.6, 0.55, 0.14, X, ZA.H - 0.95, Z - 0.3, 0, '#ff4fa0');
    box(X, Z + 0.6, 3.2, 1.1); INTERACTS.push({ x: X, z: Z - 1.2, r: 1.8, label: '🎟 Prize counter', fn: openPrizes }); }
  // NEON ARCADE in neon tube letters on a black backer on the east wall
  zaLightbox(props, zaSignTex('NEON ARCADE', { fg: '#ffd8f0', glow: '#ff2a9a', bg: '#06040a', blur: 30, w: 1024, h: 180, font: 'Impact, sans-serif' }), 5.2, 0.9, 0.1, 23.8, 3.4, 12, -Math.PI / 2);
  // a change machine and a soda machine by the arch, benches, a ticket redemption kiosk and framed posters
  { const g = new THREE.Group(); g.position.set(-1.5, 0, 6.4); g.rotation.y = Math.PI / 2; props.add(g); part(g, B(0.8, 1.7, 0.5), toon('#3a4a5a', 'hull'), 0, 0.85, 0); part(g, B(0.5, 0.3, 0.02), glow('#7fff6a'), 0, 1.35, 0.26); part(g, B(0.3, 0.06, 0.02), toon('#111'), 0, 1.0, 0.26); part(g, B(0.4, 0.15, 0.1), toon('#b8bec8'), 0, 0.4, 0.28);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.2), zaLit(zaSignTex('CHANGE', { fg: '#ffffff', glow: '#7fff6a', bg: '#0a1a0a', w: 256, h: 72, font: 'Impact, sans-serif' }))); lb.position.set(0, 1.6, 0.26); g.add(lb); box(-1.5, 6.4, 0.3, 0.45); }
  { const g = new THREE.Group(); g.position.set(-1.5, 0, 7.6); g.rotation.y = Math.PI / 2; props.add(g); part(g, B(0.95, 1.9, 0.7), toon('#c8202a', 'hull'), 0, 0.95, 0); const fr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.1), zaLit(zaCanvas(64, 128, (x) => { x.fillStyle = '#1a0a0a'; x.fillRect(0, 0, 64, 128); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { x.fillStyle = ['#ff4a4a', '#4fd2ff', '#9fff6a', '#ffd36a'][(r + c) % 4]; x.fillRect(6 + c * 19, 8 + r * 30, 14, 22); } })));
    fr.position.set(-0.12, 1.15, 0.36); g.add(fr); const lg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.22), zaLit(zaSignTex('BLORK COLA', { fg: '#ffffff', glow: '#ff4a4a', bg: '#8a0a10', w: 256, h: 72, font: 'Georgia, serif' }))); lg.position.set(0, 1.78, 0.36); g.add(lg); part(g, B(0.2, 0.5, 0.04), toon('#b8bec8'), 0.32, 1.1, 0.36); box(-1.5, 7.6, 0.4, 0.5);
    INTERACTS.push({ x: -0.6, z: 7.0, r: 1.0, label: '🥤 Change & Blork Cola', fn: () => { if (S.cr < 5) return toast('BLORK COLA', '5 cr', 1.5); S.cr -= 5; markDirty(); SFX.item && SFX.item(); toast('BLORK COLA', 'Fizzy. Faintly green. +5 HP', 1.8); if (player.hp != null && player.maxHp) player.hp = Math.min(player.maxHp, player.hp + 5); } }); }
  for (const [x, z, r] of [[14.5, 8.5, 0], [14.5, 4.5, Math.PI]]) { part(props, B(2.2, 0.1, 0.55), toon('#2a2a3a', 'cloth'), x, 0.45, z, 0, r); part(props, B(2.2, 0.5, 0.08), toon('#2a2a3a', 'cloth'), x, 0.75, z + (r ? 0.26 : -0.26)); part(props, B(2.2, 0.04, 0.04), glow('#3fd8ff'), x, 0.05, z + 0.2); for (const s of [-1, 1]) part(props, B(0.06, 0.45, 0.5), toon('#a8aeb8'), x + s * 1.05, 0.22, z); box(x, z, 1.1, 0.35); }
  const poster = (x, z, ry, title, sub, c1, c2) => { const g = new THREE.Group(); g.position.set(x, 2.1, z); g.rotation.y = ry; props.add(g); part(g, B(1.0, 1.4, 0.05), toon('#c9a43a'), 0, 0, 0);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), zaLit(zaCanvas(180, 260, (x) => { const gg = x.createLinearGradient(0, 0, 0, 260); gg.addColorStop(0, c1); gg.addColorStop(1, c2); x.fillStyle = gg; x.fillRect(0, 0, 180, 260); x.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < 30; k++) x.fillRect((k * 53) % 180, (k * 97) % 160, 2, 2);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 22px Impact, sans-serif'; x.fillText(title, 90, 200); x.font = '12px monospace'; x.fillText(sub, 90, 222); x.fillStyle = c1; x.beginPath(); x.arc(90, 100, 40, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 3; x.stroke(); }))); p.position.z = 0.03; g.add(p); };
  poster(23.83, -17.8, -Math.PI / 2, 'BLORK INVADERS', 'THEY CAME FOR THE TICKETS', '#c83a8a', '#1a0420'); poster(23.83, 8.6, -Math.PI / 2, 'STAR RACER', 'TOP SPEED: YES', '#d8a020', '#120408');
  poster(17, 19.83, Math.PI, 'NEON STEP', 'DANCE OR DIE TRYING', '#ff4fa0', '#1a0420'); poster(-1.75, -8, Math.PI / 2, 'PINBALL WIZARD', 'TILT AT YOUR OWN RISK', '#3fd8ff', '#04101a');
  // regulars: a few people playing machines, swaying a little
  const ppl = []; for (const [x, z, f, col] of [[0.8 + 2 * 1.0, -18.6, Math.PI, '#3b4f7a'], [0.8 + 5 * 1.0, -18.6, Math.PI, '#8a6fc4'], [11, -12.75, 0, '#c8402f'], [4.2, 10.1, 0, '#5a6a3a'], [16.75, -13.1, -Math.PI / 2, '#c9a43a']]) {
    const o = buildChar(() => makeCivilian(col, '#2c2a28', ['#e0b892', '#8a5a3a', '#9fe8ff', '#c58a64'][ppl.length % 4], '#1e1a18'), 'civ'); o.position.set(x, 0, z); o.rotation.y = f; blob(o, 0.45); levelGroup.add(o); ppl.push(o); solid(x, z, 0.35);
    if (Math.abs(z - 10.1) < 0.01) { const R = o.userData.rig; o.position.y = 0.625 - (R ? R.spec.hip : 0.95) + 0.05; sitChar(o, 0.55); } }
  const sts = ppl.map(() => ({})); levelAnims.push(t => ppl.forEach((o, i) => { try { animRig(o, sts[i], 1 / 60, t); } catch (_) {} o.rotation.z = Math.sin(t * 1.5 + i) * 0.03; }));
}

// ---------------- the deck: clear what the older builds made, then build ours ----------------
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () {
  const arc = zTheme(ZF.floor) === 'arcade', n0 = arc ? { lg: levelGroup.children.length, it: INTERACTS.length, bx: BOXES.length, ci: CIRCLES.length, an: levelAnims.length, mv: MOVERS.length } : null;
  _b.apply(this, arguments); if (!arc) return;
  try { for (const o of levelGroup.children.slice(n0.lg)) if (o !== props) levelGroup.remove(o); props.clear(); INTERACTS.length = n0.it; BOXES.length = n0.bx; CIRCLES.length = n0.ci; levelAnims.length = n0.an; MOVERS.length = n0.mv;
    ZA.mach = []; const { W, D } = ZA; zaBuildRoom(); zaCasino(); zaArcade();
    part(props, B(5, 5, 0.4), '#3a3d44', 22, 2.5, D - 0.2); zTube(); INTERACTS.push({ x: 22, z: D - 3, r: 3.5, label: 'Elevator', fn: openElevator });
    let last = 0; levelAnims.push(t => { const dt = Math.min(0.1, Math.max(0, t - (last || t))); last = t; zaSlotStep(t, dt); });
    LEVELS.zfloor.spawn = { x: 22, z: D - 5, yaw: LEVELS.zfloor.spawn.yaw };
  } catch (e) { console.warn('zarcade', e); } }; }
// the people: dealers at their tables, the regulars at poker, Lux at the cashier cage, Tess at the prize counter
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th !== 'arcade') return L; const mv = (id, x, z, face, extra) => { const d = L.find(k => k.id === id + n); if (d) Object.assign(d, { x, z, face }, extra || {}); };
  mv('slots', -13, 19.35, Math.PI, { role: 'Cashier · casino host', custom: [['Double or nothing (100 cr)', () => zSlots(100)], ['Double or nothing (1000 cr)', () => zSlots(1000)]] });
  mv('vex', -15, -7.2, Math.PI); mv('rook', -17.6, -9.5, Math.PI / 2); mv('nyx', -12.4, -9.5, -Math.PI / 2); mv('pip', -7.5, 5.3, Math.PI);
  const c = (id, name, role, col, skin, x, z, face, extra, idle) => Object.assign({ id: id + n, name, role, rig: 'civ', make: () => makeCivilian(col, '#1e1c22', skin, '#2a2430', '#ffd36a'), x, z, face, idle }, extra);
  L.push(c('sol', 'Croupier Sol', 'Roulette', '#1e1c22', '#c58a64', -16.2, 1.5, 0, { custom: [['Play roulette', openRoulette]] }, ["Place your bets. The wheel doesn't care who you are. I find that comforting."]));
  L.push(c('marlo', 'Dealer Marlo', 'Blackjack', '#3a1a10', '#8a5a3a', -7.5, -11.2, 0, { custom: [['Play blackjack', openBlackjack]] }, ["Twenty-one or bust, friend. Mostly bust."]));
  L.push(c('tess', 'Ticket Tess', 'Prize counter', '#5a0a5a', '#e0b892', 11.5, 19.3, Math.PI, { custom: [['Trade tickets for prizes', openPrizes]] }, ["Every plush on that shelf has a story. Most of them are about skee-ball."]));
  return L; }; }
