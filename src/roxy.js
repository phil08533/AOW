// =================== THE ROXY (2.23.68): a real art-deco picture palace on the Jamestown square ===================
// Replaces the brick block with a flat sign on it (Phil: "looks like slop"): a cream-and-maroon stepped facade with gold speed lines,
// a tall ROXY blade sign with chasing bulbs, a three-sided marquee with lit letter boards, a ticket booth, poster lightboxes,
// brass doors, a terrazzo star on the sidewalk and velvet ropes. Front of the building is local +z (d/2).
function roxyCanvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }
function roxyNeon(x, text, px, cx, cy, col, glowCol) { x.font = `900 ${px}px Georgia, 'Times New Roman', serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = glowCol || col; x.shadowBlur = px * 0.35; x.fillStyle = col; x.fillText(text, cx, cy); x.shadowBlur = px * 0.12; x.fillStyle = '#fffbe8'; x.fillText(text, cx, cy); x.shadowBlur = 0; }
// lettered reader board: white panel, black slotted letters, like the real changeable-letter boards
function roxyBoard(lines, w, h) { return roxyCanvas(w, h, (x, W, H) => {
  x.fillStyle = '#f4efe2'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(0,0,0,0.12)'; for (let y = H / lines.length; y < H; y += H / lines.length) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  x.fillStyle = '#16121a'; x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach((l, i) => { const px = Math.min(H / lines.length * 0.7, W / (l.length * 0.68)); x.font = `800 ${px}px 'Arial Black', Arial, sans-serif`; x.fillText(l, W / 2, (i + 0.5) * H / lines.length); }); }); }
function roxyPoster(kind) { return roxyCanvas(192, 288, (x, W, H) => {
  if (kind === 'dead') {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0c0c0e'); g.addColorStop(1, '#3a3a3e'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#d8d8d0'; x.beginPath(); x.arc(W * 0.5, H * 0.33, 38, 0, 7); x.fill();                               // pale moon
    x.fillStyle = '#060608'; for (let i = 0; i < 6; i++) { const bx = 14 + i * 30, bh = 70 + (i * 37 % 40); x.fillRect(bx, H * 0.78 - bh, 16, bh); x.beginPath(); x.arc(bx + 8, H * 0.78 - bh, 9, 0, 7); x.fill();   // the shambling crowd
      x.fillRect(bx - 6, H * 0.78 - bh + 14, 6, 26); x.fillRect(bx + 16, H * 0.78 - bh + 10, 6, 24); }
    x.fillRect(0, H * 0.78, W, H); roxyNeon(x, 'NIGHT OF THE', 18, W / 2, H * 0.84, '#e8e0d0', '#000'); roxyNeon(x, 'LIVING DEAD', 26, W / 2, H * 0.92, '#e8202a', '#ff0000');
    x.font = '700 9px Arial'; x.fillStyle = '#9a9a92'; x.textAlign = 'center'; x.fillText('THEY KEEP COMING BACK IN A BLOODTHIRSTY LUST', W / 2, 16);
  } else {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a3a2a'); g.addColorStop(1, '#0a1a3a'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + (i % 3) * 0.2) + ')'; x.fillRect((i * 53) % W, (i * 97) % (H * 0.6), 2, 2); }
    x.fillStyle = '#c8202a'; x.beginPath(); x.arc(W * 0.36, H * 0.42, 34, 0, 7); x.fill(); x.fillStyle = '#f4f0e8'; x.fillRect(W * 0.36 - 34, H * 0.42 + 12, 68, 12); x.beginPath(); x.arc(W * 0.36, H * 0.42 + 34, 22, 0, 3.14); x.fill(); // Santa
    x.fillStyle = '#5aff6a'; x.beginPath(); x.ellipse(W * 0.72, H * 0.36, 20, 26, 0, 0, 7); x.fill(); x.fillStyle = '#0a1a0a'; x.fillRect(W * 0.72 - 10, H * 0.33, 6, 6); x.fillRect(W * 0.72 + 4, H * 0.33, 6, 6); // a Martian
    x.strokeStyle = '#5aff6a'; x.lineWidth = 3; x.beginPath(); x.moveTo(W * 0.66, H * 0.26); x.lineTo(W * 0.6, H * 0.16); x.moveTo(W * 0.78, H * 0.26); x.lineTo(W * 0.84, H * 0.16); x.stroke();
    roxyNeon(x, 'SANTA CLAUS', 24, W / 2, H * 0.74, '#ffd36a', '#ff8a2a'); roxyNeon(x, 'CONQUERS THE', 16, W / 2, H * 0.83, '#f4f0e8', '#fff'); roxyNeon(x, 'MARTIANS', 26, W / 2, H * 0.92, '#5aff6a', '#2aff4a');
  } }); }
function makeRoxy(w, h, d) {
  const g = new THREE.Group(), F = d / 2;
  const cream = toon('#e8dcc4', 'stucco'), maroon = toon('#6a1424'), gold = toon('#d8a838'), dark = toon('#1a1216'), brass = toon('#c9a43a');
  // body, plinth and roof
  part(g, B(w + 0.4, 0.6, d + 0.4), toon('#3a3236', 'stone'), 0, 0.3, 0);
  part(g, tileBox(B(w, h, d), 2.2), cream, 0, h / 2, 0);
  part(g, B(w + 0.3, 0.35, d + 0.3), maroon, 0, h + 0.17, 0);
  // the stepped crown over the front: three tiers, each edged in gold
  [[w * 0.62, 1.3], [w * 0.4, 1.1], [w * 0.2, 0.9]].reduce((y, [cw, ch]) => { part(g, B(cw, ch, 1.2), cream, 0, y + ch / 2, F - 0.6); part(g, B(cw + 0.12, 0.14, 1.28), gold, 0, y + ch, F - 0.6); return y + ch; }, h + 0.35);
  // fluted pilasters, rising past the roof in little steps
  for (const px of [-w / 2 + 0.35, -w * 0.2, w * 0.2, w / 2 - 0.35]) { const y0 = Math.abs(px) < w / 3 ? 3.3 : 0; part(g, B(0.7, h + 0.8 - y0, 0.4), maroon, px, y0 + (h + 0.8 - y0) / 2, F + 0.18); // the inner pair starts above the doors
    for (let k = -1; k <= 1; k++) part(g, B(0.08, h - 4.5, 0.06), gold, px + k * 0.2, 4.5 + (h - 4.5) / 2, F + 0.41);
    part(g, B(0.5, 0.5, 0.5), gold, px, h + 1.05, F + 0.18); }
  // speed lines across the upper facade
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) part(g, B(w * 0.26, 0.08, 0.06), gold, s * w * 0.355, h - 1.1 - k * 0.32, F + 0.04);
  // tall glass-block windows, lit amber from inside
  const winM = new THREE.MeshBasicMaterial({ color: '#ffc874' });
  for (const s of [-1, 1]) for (const xo of [0.27, 0.43]) { const wx = s * w * xo;
    part(g, B(0.9, 3.0, 0.08), winM, wx, 6.4, F + 0.03); for (let r = 0; r < 6; r++) part(g, B(0.96, 0.05, 0.1), dark, wx, 5.0 + r * 0.55, F + 0.05); part(g, B(0.05, 3.0, 0.1), dark, wx, 6.4, F + 0.05); }
  // ---- the blade sign: ROXY, stacked, sticking out over the sidewalk ----
  const blade = new THREE.Group(); blade.position.set(0, 0, F + 0.95); g.add(blade);
  const bh = 6.6, by = h + 0.2;
  part(blade, B(0.36, bh, 1.5), maroon, 0, by, 0); part(blade, B(0.42, bh + 0.1, 0.1), gold, 0, by, 0.78); part(blade, B(0.42, bh + 0.1, 0.1), gold, 0, by, -0.78);
  const bladeTex = roxyCanvas(128, 512, (x, W, H) => { x.fillStyle = '#4a0c18'; x.fillRect(0, 0, W, H); 'ROXY'.split('').forEach((c, i) => roxyNeon(x, c, 104, W / 2, 70 + i * 124, '#ffd36a', '#ff8a2a')); });
  for (const s of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.25, bh - 0.4), new THREE.MeshBasicMaterial({ map: bladeTex })); pl.position.set(0.185 * s, by, 0); pl.rotation.y = s * Math.PI / 2; blade.add(pl); }
  // a gold sunburst on top
  const fan = new THREE.Group(); fan.position.set(0, by + bh / 2 + 0.1, 0); blade.add(fan);
  for (let k = 0; k < 7; k++) { const a = (k / 6 - 0.5) * 2.4, r = part(fan, B(0.16, 1.0, 0.16), gold, Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0, 0, 0, -a); r.position.z = 0; }
  part(fan, new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffe8a0' }), 0, 0.05, 0);
  // bulbs: two materials that trade places, so the lights chase
  const bA = new THREE.MeshBasicMaterial({ color: '#fff2c0' }), bB = new THREE.MeshBasicMaterial({ color: '#fff2c0' }), bulb = new THREE.SphereGeometry(0.075, 6, 4); let bi = 0;
  const bulbAt = (par, x, y, z) => { const m = new THREE.Mesh(bulb, (bi++ & 1) ? bA : bB); m.position.set(x, y, z); par.add(m); };
  for (let i = 0; i < 26; i++) for (const s of [-1, 1]) for (const zz of [-0.7, 0.7]) bulbAt(blade, 0.2 * s, by - bh / 2 + 0.2 + i * (bh - 0.4) / 25, zz);
  // ---- the marquee: three lit faces angled out over the doors ----
  const mq = new THREE.Group(); mq.position.set(0, 0, F); g.add(mq);
  const my = 3.5, mh = 1.5, fw = 7.4, sd = 2.4, sw = 2.0, sa = 0.62;
  const box3 = (par, ww, x, z, ry) => { const f = new THREE.Group(); f.position.set(x, 0, z); f.rotation.y = ry; par.add(f);
    part(f, B(ww, mh, 0.5), maroon, 0, my, 0); part(f, B(ww + 0.06, 0.12, 0.56), gold, 0, my + mh / 2, 0); part(f, B(ww + 0.06, 0.12, 0.56), gold, 0, my - mh / 2, 0); return f; };
  const front = box3(mq, fw, 0, sd, 0), L = box3(mq, sw, -fw / 2 - Math.sin(sa) * sw / 2 + 0.05, sd - Math.cos(sa) * sw / 2, -sa), R = box3(mq, sw, fw / 2 + Math.sin(sa) * sw / 2 - 0.05, sd - Math.cos(sa) * sw / 2, sa);
  const title = roxyCanvas(512, 64, (x, W, H) => { x.fillStyle = '#4a0c18'; x.fillRect(0, 0, W, H); roxyNeon(x, '★  THE ROXY  ★', 46, W / 2, H / 2 + 2, '#ffd36a', '#ff8a2a'); });
  const addFace = (f, ww, tex1, tex2) => { const a = new THREE.Mesh(new THREE.PlaneGeometry(ww - 0.3, 0.5), new THREE.MeshBasicMaterial({ map: tex1 })); a.position.set(0, my + 0.4, 0.26); f.add(a);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(ww - 0.3, 0.72), new THREE.MeshBasicMaterial({ map: tex2 })); b.position.set(0, my - 0.28, 0.26); f.add(b);
    for (let i = 0; i <= Math.round(ww * 3); i++) { const x = -ww / 2 + 0.1 + i * (ww - 0.2) / Math.round(ww * 3); bulbAt(f, x, my + mh / 2 + 0.12, 0.2); bulbAt(f, x, my - mh / 2 - 0.12, 0.2); } };
  addFace(front, fw, title, roxyBoard(['NIGHT OF THE LIVING DEAD', 'SANTA CLAUS CONQUERS THE MARTIANS'], 1024, 128));
  const sideT = roxyCanvas(256, 64, (x, W, H) => { x.fillStyle = '#4a0c18'; x.fillRect(0, 0, W, H); roxyNeon(x, 'ROXY', 44, W / 2, H / 2 + 2, '#ffd36a', '#ff8a2a'); });
  addFace(L, sw, sideT, roxyBoard(['TONIGHT', '8 PM'], 256, 128)); addFace(R, sw, sideT, roxyBoard(['FREE', 'POPCORN'], 256, 128));
  // the canopy: roof and a glowing ceiling of lights underneath
  const cv = new THREE.Shape(); cv.moveTo(-fw / 2 - 1.1, 0); cv.lineTo(fw / 2 + 1.1, 0); cv.lineTo(fw / 2, sd + 0.25); cv.lineTo(-fw / 2, sd + 0.25); cv.closePath();
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(cv, { depth: 0.22, bevelEnabled: false }), dark); roof.rotation.x = Math.PI / 2; roof.position.y = my + mh / 2 + 0.2; mq.add(roof);
  const ceil = new THREE.Mesh(new THREE.ShapeGeometry(cv), new THREE.MeshBasicMaterial({ color: '#ffe0a0', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = my - mh / 2 - 0.01; mq.add(ceil);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) part(mq, new THREE.CylinderGeometry(0.16, 0.16, 0.04, 10), new THREE.MeshBasicMaterial({ color: '#ffffff' }), -3 + i * 1.5, my - mh / 2 - 0.03, 0.6 + j * 1.1);
  for (const s of [-1, 1]) part(mq, Cy(0.035, 0.035, 2.6, 6), '#9aa1aa', s * 3.4, my + 1.5, sd * 0.5, -0.75, 0, 0);
  const lt = new THREE.PointLight(0xffc878, 1.1, 11); lt.position.set(0, my - 1.2, 2.2); mq.add(lt);
  // ---- the entrance: a recessed lobby with three pairs of brass doors ----
  part(g, B(7.0, 3.0, 0.3), dark, 0, 1.6, F - 0.05);
  const lobby = new THREE.MeshBasicMaterial({ color: '#ffd890' });
  for (const dx of [-2.2, 0, 2.2]) { part(g, B(1.9, 2.5, 0.06), brass, dx, 1.55, F + 0.12);
    for (const s of [-1, 1]) { part(g, B(0.78, 2.2, 0.04), lobby, dx + s * 0.44, 1.6, F + 0.16); const port = part(g, new THREE.CircleGeometry(0.18, 12), toon('#c9a43a'), dx + s * 0.44, 2.15, F + 0.19); port.rotation.y = 0;
      part(g, B(0.04, 0.5, 0.05), brass, dx + s * 0.1, 1.4, F + 0.2); part(g, B(0.78, 0.4, 0.05), brass, dx + s * 0.44, 0.55, F + 0.19); } }
  part(g, B(7.4, 0.25, 0.3), gold, 0, 3.15, F + 0.15);
  // poster lightboxes either side of the doors
  [['dead', -4.55], ['santa', 4.55]].forEach(([k, px]) => { part(g, B(1.5, 2.1, 0.22), gold, px, 1.75, F + 0.11);
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.85), new THREE.MeshBasicMaterial({ map: roxyPoster(k) })); pm.position.set(px, 1.75, F + 0.23); g.add(pm);
    for (const s of [-1, 1]) bulbAt(g, px + s * 0.8, 2.85, F + 0.2); });
  // terrazzo: a gold star set into a dark pad, then a red carpet to the curb
  const tz = roxyCanvas(256, 256, (x, W, H) => { x.fillStyle = '#2a1a22'; x.fillRect(0, 0, W, H); for (let i = 0; i < 400; i++) { x.fillStyle = ['#5a3a48', '#8a6a70', '#c8b0a0'][i % 3]; x.fillRect((i * 97) % W, (i * 61) % H, 2, 2); }
    x.translate(W / 2, H / 2); x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 40 : 100, a = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = '#d8a838'; x.fill(); x.strokeStyle = '#fff2c0'; x.lineWidth = 4; x.stroke(); });
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), toon('#ffffff')); pad.material = new THREE.MeshLambertMaterial({ map: tz }); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.62, F + 1.6); g.add(pad);
  part(g, B(2.2, 0.04, 1.6), toon('#8a1524', 'cloth'), 0, 0.62, F + 4.0);
  // the ticket booth: a little chrome-capped kiosk
  const tb = new THREE.Group(); tb.position.set(-3.3, 0.6, F + 1.5); g.add(tb);
  part(tb, Cy(0.75, 0.8, 1.0, 8), maroon, 0, 0.5, 0); part(tb, Cy(0.77, 0.77, 0.08, 8), gold, 0, 1.02, 0);
  part(tb, Cy(0.7, 0.7, 1.1, 8, 1, true), new THREE.MeshLambertMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.32 }), 0, 1.6, 0);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; part(tb, B(0.05, 1.1, 0.05), brass, Math.cos(a) * 0.71, 1.6, Math.sin(a) * 0.71); }
  part(tb, new THREE.SphereGeometry(0.82, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d8dce4'), 0, 2.15, 0); part(tb, new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff3a4a' }), 0, 2.98, 0);
  const tix = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.24), new THREE.MeshBasicMaterial({ map: roxyCanvas(256, 64, (x, W, H) => { x.fillStyle = '#4a0c18'; x.fillRect(0, 0, W, H); roxyNeon(x, 'TICKETS', 40, W / 2, H / 2 + 2, '#ffd36a', '#ff8a2a'); }) }));
  tix.position.set(0, 2.3, 0.8); tix.rotation.x = -0.25; tb.add(tix);
  if (typeof makeCivilian === 'function') { try { const tk = makeCivilian('#6a1424', '#2a2228', '#c58a64', '#2a1a14', '#d8a838'); tk.position.set(0, -0.2, -0.1); tk.rotation.y = 0; tk.scale.setScalar(0.92); tb.add(tk); } catch (_) {} }
  // velvet ropes along the carpet
  const rope = toon('#a8142a', 'cloth');
  for (const s of [-1, 1]) { for (let k = 0; k < 2; k++) { const z = F + 3.2 + k * 1.3; part(g, Cy(0.05, 0.07, 0.95, 8), brass, s * 1.5, 1.08, z); part(g, new THREE.SphereGeometry(0.08, 8, 6), brass, s * 1.5, 1.6, z); part(g, Cy(0.2, 0.22, 0.05, 10), brass, s * 1.5, 0.63, z); }
    for (let k = 0; k < 1; k++) { const z0 = F + 3.2 + k * 1.3, c = new THREE.QuadraticBezierCurve3(V(s * 1.5, 1.5, z0), V(s * 1.5, 1.15, z0 + 0.65), V(s * 1.5, 1.5, z0 + 1.3)); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 10, 0.035, 5), rope)); } }
  // the chase: bulbs swap brightness four times a second; the blade sign flickers now and then like old neon
  const on = new THREE.Color('#fff2c0'), off = new THREE.Color('#6a4a20'); let fl = 0;
  levelAnims.push(t => { if (!g.parent) return; const k = (t * 4 | 0) & 1; bA.color.copy(k ? on : off); bB.color.copy(k ? off : on); fl = Math.sin(t * 37) > 0.995 ? 0.5 : 1; });
  g.userData.roxy = true; return g;
}
