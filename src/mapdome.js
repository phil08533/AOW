// =================== MDOME MINIMAP: the map sits under an oil-filled high-dome watch glass ===================
// Inspired by the U-Boat Capsoil: a metal case in the menu colours, cream lume bars with N E S W at the quarters,
// a dark oily edge, a gentle magnifying bulge in the middle and a curved glass highlight. The map underneath is
// whatever drawMap() drew (classic, live camera or space), so every mode gets the same face. The compass tape is untouched.
const MDOME = { k: 2, off: null, key: '', face: null };
{ const st = document.createElement('style'); st.textContent = `
html body #map.win { border: 0 !important; background: transparent !important; box-shadow: none !important; filter: drop-shadow(3px 3px 0 rgba(0,0,0,.55)); overflow: visible !important; }
html body #map.win canvas { image-rendering: auto !important; border-radius: 50% !important; }
#mapCrown { position: absolute; width: 7px; height: 16px; border-radius: 2px; pointer-events: none; z-index: 4; box-shadow: 2px 2px 0 rgba(0,0,0,.55); }
body.menuopen #mapCrown, body.photo #mapCrown, body.decor #mapCrown, body.flying #mapCrown { visibility: hidden; }`; document.head.appendChild(st); }
const domeTheme = () => (typeof UI_THEMES !== 'undefined' && (UI_THEMES[PREFS.uiTheme] || UI_THEMES.Steel)) || { lite: '#4a5058', dark: '#0c0d10', hiLite: '#767e8a', body: '#1c1e22', accent: '#e8e8e8' };
// the parts that never move (case, lume, glass) are painted once per theme into their own canvas
function domeFace(T) {
  const N = 112 * MDOME.k, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'); x.scale(MDOME.k, MDOME.k);
  const C = 56, R = 48.5;
  // the oil: dark at the rim, clear in the middle, a touch of deep blue like the dial in the photo
  let g = x.createRadialGradient(C, C, R * 0.35, C, C, R); g.addColorStop(0, 'rgba(10,20,50,0)'); g.addColorStop(0.7, 'rgba(10,18,44,.22)'); g.addColorStop(0.93, 'rgba(4,6,16,.7)'); g.addColorStop(1, 'rgba(0,0,0,.92)');
  x.fillStyle = g; x.beginPath(); x.arc(C, C, R, 0, 7); x.fill();
  // minute track and lume bars
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; x.fillStyle = 'rgba(233,220,184,.45)'; x.beginPath(); x.arc(C + Math.sin(a) * (R - 1.6), C - Math.cos(a) * (R - 1.6), 0.45, 0, 7); x.fill(); }
  x.lineCap = 'round';
  for (let i = 0; i < 12; i++) { if (i % 3 === 0) continue; const a = i / 12 * Math.PI * 2, s = Math.sin(a), co = -Math.cos(a), r0 = R - 3.2, r1 = R - 9;
    x.strokeStyle = 'rgba(0,0,0,.65)'; x.lineWidth = 3.6; x.beginPath(); x.moveTo(C + s * r0, C + co * r0); x.lineTo(C + s * r1, C + co * r1); x.stroke();
    x.strokeStyle = '#e9dcb8'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(C + s * r0, C + co * r0); x.lineTo(C + s * r1, C + co * r1); x.stroke(); }
  x.font = '700 12px "Pixelify Sans", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (const [t, i] of [['N', 0], ['E', 1], ['S', 2], ['W', 3]]) { const a = i * Math.PI / 2, px = C + Math.sin(a) * (R - 8.5), py = C - Math.cos(a) * (R - 8.5) + 0.5;
    x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.75)'; x.strokeText(t, px, py); x.fillStyle = t === 'N' ? '#ffb347' : '#e9dcb8'; x.fillText(t, px, py); }
  // the glass: a dark refraction rim, a big curved highlight up top-left and a small hot spot
  x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 2; x.beginPath(); x.arc(C, C, R - 0.8, 0, 7); x.stroke();
  x.save(); x.beginPath(); x.arc(C, C, R, 0, 7); x.clip();
  g = x.createLinearGradient(C - R, C - R, C, C); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.55, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.ellipse(C - 8, C - 13, R * 0.86, R * 0.6, -0.55, Math.PI * 1.02, Math.PI * 1.98); x.ellipse(C - 4, C - 6, R * 0.72, R * 0.36, -0.55, Math.PI * 1.98, Math.PI * 1.02, true); x.fill();
  g = x.createRadialGradient(C - 17, C - 22, 0, C - 17, C - 22, 7); g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(C - 26, C - 31, 18, 18);
  g = x.createLinearGradient(C, C + R, C + R * 0.6, C); g.addColorStop(0, 'rgba(160,210,255,.16)'); g.addColorStop(1, 'rgba(160,210,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(C, C, R - 2.5, 0.15, 1.45); x.arc(C, C, R - 7, 1.45, 0.15, true); x.fill();
  x.restore();
  // the case: brushed metal in the menu colours, a thin accent line, a dark lip and four screws
  x.save(); x.beginPath(); x.arc(C, C, 55.6, 0, 7); x.arc(C, C, R, 0, 7, true);
  g = x.createLinearGradient(0, 0, 112, 112); g.addColorStop(0, T.hiLite); g.addColorStop(0.45, T.lite); g.addColorStop(1, T.dark); x.fillStyle = g; x.fill('evenodd');
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; x.strokeStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.12)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(C + Math.sin(a) * (R + 1.5), C - Math.cos(a) * (R + 1.5)); x.lineTo(C + Math.sin(a) * 55, C - Math.cos(a) * 55); x.stroke(); }
  x.restore();
  x.lineWidth = 1; x.strokeStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(C, C, 55, Math.PI * 0.95, Math.PI * 1.75); x.stroke();
  x.strokeStyle = T.accent; x.globalAlpha = 0.75; x.lineWidth = 0.9; x.beginPath(); x.arc(C, C, R + 1.1, 0, 7); x.stroke(); x.globalAlpha = 1;
  x.strokeStyle = 'rgba(0,0,0,.8)'; x.lineWidth = 1; x.beginPath(); x.arc(C, C, R + 0.3, 0, 7); x.stroke(); x.beginPath(); x.arc(C, C, 55.6, 0, 7); x.stroke();
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2, px = C + Math.sin(a) * 52, py = C - Math.cos(a) * 52;
    x.fillStyle = T.dark; x.beginPath(); x.arc(px, py, 1.9, 0, 7); x.fill(); x.fillStyle = T.hiLite; x.beginPath(); x.arc(px - 0.3, py - 0.3, 1.3, 0, 7); x.fill(); x.strokeStyle = T.dark; x.lineWidth = 0.6; x.beginPath(); x.moveTo(px - 1, py + 0.6); x.lineTo(px + 0.6, py - 1); x.stroke(); }
  return c;
}
// the oil bulge: the middle of the map is drawn a little larger than the rim, in rings, like looking down through a lens
function domeBulge() {
  const N = 112 * MDOME.k; if (!MDOME.off) { MDOME.off = document.createElement('canvas'); MDOME.off.width = MDOME.off.height = N; }
  const o = MDOME.off.getContext('2d'); o.clearRect(0, 0, N, N); o.drawImage(mapC, 0, 0);
  const C = N / 2, R = 48.5 * MDOME.k, steps = 9; mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < steps; i++) { const f = 1 - i / steps, r = R * f, m = 1 + 0.13 * Math.pow(1 - f, 0.8) + 0.02, w = N * m;
    mctx.save(); mctx.beginPath(); mctx.arc(C, C, r, 0, 7); mctx.clip(); mctx.drawImage(MDOME.off, C - w / 2, C - w / 2, w, w); mctx.restore(); }
  mctx.restore();
}
{ const _dm = drawMap; drawMap = function () {
  if (mapC.width !== 112 * MDOME.k) mapC.width = mapC.height = 112 * MDOME.k;
  mctx.setTransform(MDOME.k, 0, 0, MDOME.k, 0, 0); _dm();
  try { if (!LEVEL || state === 'menu') return; const T = domeTheme(), key = PREFS.uiTheme || 'Steel'; if (!MDOME.face || MDOME.key !== key) { MDOME.face = domeFace(T); MDOME.key = key; }
    domeBulge(); mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.drawImage(MDOME.face, 0, 0); mctx.restore(); domeCrown(T); } catch (e) { console.warn('dome', e); }
}; }
// a knurled crown at 3 o'clock, outside the round map
const mapCrown = document.createElement('div'); mapCrown.id = 'mapCrown';
function domeCrown(T) { const m = $('map'); if (!m) return; if (mapCrown.parentNode !== m.parentNode) m.parentNode.appendChild(mapCrown);
  const r = m.getBoundingClientRect(), pr = m.parentNode.getBoundingClientRect(), h = Math.round(r.height * 0.15), w = Math.max(4, Math.round(h * 0.42));
  mapCrown.style.left = (r.right - pr.left - 1) + 'px'; mapCrown.style.top = (r.top - pr.top + r.height / 2 - h / 2) + 'px'; mapCrown.style.width = w + 'px'; mapCrown.style.height = h + 'px';
  if (mapCrown.dataset.k !== MDOME.key) { mapCrown.dataset.k = MDOME.key; mapCrown.style.background = `repeating-linear-gradient(0deg, ${T.hiLite} 0 1.5px, ${T.dark} 1.5px 3px)`; mapCrown.style.border = `1px solid ${T.dark}`; } }
