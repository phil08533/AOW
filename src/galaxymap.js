// =================== GALAXY MAP: a top-down chart of the whole galaxy; tap a world to travel ===================
const GM_SUB = { earth: [['New Jamestown', 'earth'], ['Forest of Life', 'forestlife'], ['Super Swift Arena', 'swift']] };
openGalaxy = function () {
  openDlg('Navigation', 'Galaxy map');
  $('dlgLine').textContent = 'Tap a world to select it. Autopilot takes you straight there; or fly there yourself.';
  const wrap = document.createElement('div'); wrap.id = 'shopRows'; wrap.className = 'rows'; wrap.style.alignItems = 'center';
  const cv = document.createElement('canvas'), W = 640, H = 420; cv.width = W; cv.height = H; cv.style.width = '100%'; cv.style.maxWidth = '640px'; cv.style.borderRadius = '6px'; cv.style.border = '2px solid rgba(232,236,248,.5)'; cv.style.touchAction = 'none'; cv.style.cursor = 'pointer';
  const info = document.createElement('div'); info.style.cssText = 'width:100%;max-width:640px;margin-top:6px;font-size:14px;min-height:40px';
  wrap.append(cv, info); $('dlgActs').before(wrap);
  const ids = Object.keys(SPACE_BODIES).filter(id => LEVELS[id] || SPACE_BODIES[id].survey);
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const id of ids) { const p = SPACE_BODIES[id].pos; x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
  const pad = 70, sc = Math.min((W - pad * 2) / (x1 - x0 || 1), (H - pad * 2) / (z1 - z0 || 1)), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const toPx = p => [W / 2 + (p.x - cx) * sc, H / 2 + (p.z - cz) * sc];
  const here = LEVEL.fly ? null : (['forestlife', 'swift'].includes(LEVEL.id) ? 'earth' : LEVEL.id === 'zfloor' ? 'zeltac' : LEVEL.id === 'ship' ? (S.orbit || 'earth') : LEVEL.id);
  let sel = here && SPACE_BODIES[here] ? here : ids[0];
  const stars = Array.from({ length: 220 }, () => [Math.random() * W, Math.random() * H, Math.random()]);
  const tex = {}; for (const id of ids) { try { tex[id] = planetTex(id).image; } catch (_) {} }
  const raid = typeof raidNow === 'function' ? raidNow() : null;
  const draw = (t) => {
    const c = cv.getContext('2d'); c.fillStyle = '#05060f'; c.fillRect(0, 0, W, H);
    const neb = c.createRadialGradient(W * 0.3, H * 0.35, 10, W * 0.3, H * 0.35, W * 0.6); neb.addColorStop(0, 'rgba(120,60,160,0.35)'); neb.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = neb; c.fillRect(0, 0, W, H);
    const neb2 = c.createRadialGradient(W * 0.8, H * 0.7, 10, W * 0.8, H * 0.7, W * 0.5); neb2.addColorStop(0, 'rgba(40,110,170,0.3)'); neb2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = neb2; c.fillRect(0, 0, W, H);
    for (const [x, y, b] of stars) { c.fillStyle = `rgba(255,255,255,${0.25 + b * 0.5 + Math.sin(t * 2 + b * 9) * 0.15})`; c.fillRect(x, y, b > 0.85 ? 2 : 1, b > 0.85 ? 2 : 1); }
    // the sun, off toward the corner
    { const [sx, sy] = toPx(V(-2600, 0, 1800)), px = clamp(sx, 18, W - 18), py = clamp(sy, 18, H - 18), g = c.createRadialGradient(px, py, 2, px, py, 46); g.addColorStop(0, 'rgba(255,230,160,1)'); g.addColorStop(0.3, 'rgba(255,190,90,0.6)'); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, py, 46, 0, 6.3); c.fill(); }
    // asteroid belt
    c.strokeStyle = 'rgba(180,160,130,0.35)'; c.setLineDash([2, 5]); c.lineWidth = 6; c.beginPath(); for (let a = 0; a <= 6.3; a += 0.05) { const [x, y] = toPx(V(Math.cos(a) * 760, 0, Math.sin(a) * 760 * 0.7 + 90)); a ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]); c.lineWidth = 1;
    // route line from here to the selection
    if (here && SPACE_BODIES[here] && sel !== here) { const [ax, ay] = toPx(SPACE_BODIES[here].pos), [bx, by] = toPx(SPACE_BODIES[sel].pos); c.strokeStyle = 'rgba(255,211,106,0.8)'; c.setLineDash([8, 6]); c.lineDashOffset = -t * 30; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.setLineDash([]); c.lineWidth = 1; }
    for (const id of ids) {
      const P = SPACE_BODIES[id], [x, y] = toPx(P.pos), r = Math.max(P.station ? 6 : 7, Math.min(22, P.r * sc * 1.6)), open = !!LEVELS[id] && planetOpen(id);
      if (P.ring) { c.strokeStyle = 'rgba(220,200,160,0.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r * 1.8, r * 0.5, -0.3, 0, 6.3); c.stroke(); c.lineWidth = 1; }
      if (P.station) { c.fillStyle = '#8fe3ff'; c.fillRect(x - r, y - r * 0.35, r * 2, r * 0.7); c.fillStyle = '#3a3d44'; c.fillRect(x - r * 0.4, y - r * 0.6, r * 0.8, r * 1.2); }
      else { c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.3); c.clip(); if (tex[id]) { const off = (t * 4 + x) % (r * 4); c.drawImage(tex[id], x - r - off, y - r, r * 4, r * 2); c.drawImage(tex[id], x - r - off + r * 4, y - r, r * 4, r * 2); } else { c.fillStyle = P.col || '#9aa1aa'; c.fill(); } const sh = c.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0, 'rgba(255,255,255,0.15)'); sh.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = sh; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
      if (!open) { c.fillStyle = 'rgba(5,6,15,0.55)'; c.beginPath(); c.arc(x, y, r + 1, 0, 6.3); c.fill(); }
      if (id === sel) { c.strokeStyle = '#ffd36a'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 6 + Math.sin(t * 4) * 2, 0, 6.3); c.stroke(); c.lineWidth = 1; }
      if (id === here) { c.fillStyle = '#6fdc5a'; c.beginPath(); c.moveTo(x, y - r - 14); c.lineTo(x - 6, y - r - 24); c.lineTo(x + 6, y - r - 24); c.fill(); }
      if (raid && raid.active && raid.world === id) { c.fillStyle = '#ff6a5a'; c.font = 'bold 14px monospace'; c.fillText('⚔', x + r + 2, y - r); }
      const name = (LEVELS[id] && !P.survey ? LEVELS[id].name : P.survey || id) + (open ? '' : ' 🔒');
      c.font = `${id === sel ? 'bold ' : ''}12px monospace`; c.textAlign = 'center'; c.fillStyle = 'rgba(0,0,0,0.6)'; const tw = c.measureText(name).width; const ly = id === 'skycity' || id === 'moon' ? y - r - 19 : y + r + 4; c.fillRect(x - tw / 2 - 3, ly, tw + 6, 15); c.fillStyle = open ? (id === sel ? '#ffd36a' : '#e8ecf8') : '#8a8fa0'; c.fillText(name, x, ly + 11); c.textAlign = 'left';
    }
    c.fillStyle = 'rgba(232,236,248,0.6)'; c.font = '11px monospace'; c.fillText('▲ you are here   ⚔ raid   🔒 locked', 10, H - 10);
  };
  const showInfo = () => {
    const P = SPACE_BODIES[sel], L = LEVELS[sel], open = !!L && planetOpen(sel);
    info.innerHTML = ''; const h = document.createElement('div'); h.innerHTML = `<b style="color:var(--gold)">${L && !P.survey ? L.name : P.survey || sel}</b> · ${L ? L.tag + ' · ' + L.lvls : (P.note || 'Uncharted')}${open ? '' : ' · <span style="color:#ff8a80">Locked: ' + planetLockHint(sel) + '</span>'}`; info.appendChild(h);
    const subs = GM_SUB[sel] || [[L ? L.name : sel, sel]], list = [];
    if (open) subs.forEach(([nm, lid], i) => list.push([sel === 'earth' && subs.length > 1 ? `Go: ${nm}` : `Autopilot to ${nm}`, () => { S.orbit = sel; closeDlg(); travel(lid); }, i === 0]));
    if (open && shipUnlocked()) list.push(['Fly there yourself', () => { S.orbit = sel; closeDlg(); enterSpace(sel); }]);
    list.push(['Close', closeDlg]); acts(list);
  };
  const pick = e => { const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width * W, my = (e.clientY - r.top) / r.height * H; let best = null, bd = 40; for (const id of ids) { const [x, y] = toPx(SPACE_BODIES[id].pos), d = Math.hypot(x - mx, y - my); if (d < bd) { bd = d; best = id; } } if (best) { sel = best; SFX.ui(); showInfo(); } };
  cv.addEventListener('pointerdown', pick);
  const loop = () => { if (!document.body.contains(cv) || $('dlg').hidden) return; draw(performance.now() / 1000); requestAnimationFrame(loop); };
  showInfo(); loop();
};
