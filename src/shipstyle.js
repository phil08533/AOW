// =================== SHIP INTERIOR STYLES: pick the floor, walls and ceiling for the flight deck and the hallway ===================
// Six of each, all different. Option 0 is the stock look. Change them at the Interior Styles panel on the flight deck.
const SHIP_STYLES = {
  floor: [['Standard'], ['Steel Grate', 'grate', '#9a9ea6'], ['Hex Plates', 'hexplate', '#6a7484'], ['Checkerboard', 'checker', '#d8d8dc'], ['Hardwood', 'planks', '#a8744a'], ['Carbon Weave', 'carbon', '#4a4e56']],
  wall: [['Standard'], ['Wood Panels', 'woodwall', '#a08060'], ['Padded Leather', 'padded', '#7a2a2a'], ['Riveted Iron', 'ironwall', '#847e87'], ['Clean White', 'tile', '#e8ecf0'], ['Neon Lines', 'neonwall', '#4fd2ff']],
  ceil: [['Standard'], ['Light Grid', 'ceilgrid', '#d0d8e4'], ['Pipe Run', 'pipes', '#8a7a6a'], ['Ribbed Hull', 'ribbed', '#6a7080'], ['Wood Beams', 'beams', '#8a5a3a'], ['Starlight', 'starceil', '#9ab8ff']]
};
const SHIP_AREAS = [['bridge', 'Flight deck'], ['hall', 'Hallway']], SHIP_KINDS = [['floor', 'Floor'], ['wall', 'Walls'], ['ceil', 'Ceiling']];
// the new textures, drawn once on first use (grey, so the option's colour tints them)
function shipTexInit() { if (TEX.hexplate) return;
  TEX.hexplate = canvasTex(64, (x, s) => { x.fillStyle = g8(190); x.fillRect(0, 0, s, s); speckle(x, 0.15, s, 175, 205); x.strokeStyle = g8(110); const r = 10, w = r * Math.sqrt(3), sx = s / (4 * w), sy = s / (6 * r); x.setTransform(sx, 0, 0, sy, 0, 0); x.lineWidth = 1.5 / ((sx + sy) / 2); // exactly 4 hexes across and 4 rows down, so the tile repeats without a seam
    for (let row = -1; row < 6; row++) for (let col = -1; col < 6; col++) { const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * r * 1.5; x.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.stroke(); x.fillStyle = g8(225); x.fillRect(cx - 1, cy - 1, 2, 2); } });
  TEX.checker = canvasTex(32, (x, s) => { for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { x.fillStyle = g8((i + j) % 2 ? 70 : 245); x.fillRect(i * 16, j * 16, 16, 16); } speckle(x, 0.08, s, 120, 200); });
  TEX.planks = canvasTex(64, (x, s) => { x.fillStyle = g8(200); x.fillRect(0, 0, s, s); for (let j = 0; j < 8; j++) { const y = j * 8, off = (j * 23) % 64; x.fillStyle = g8(170 + (j % 3) * 18); x.fillRect(0, y, s, 7); x.fillStyle = g8(95); x.fillRect(0, y + 7, s, 1); x.fillRect(off, y, 1, 7); x.fillRect((off + 32) % 64, y, 1, 7);
      for (let k = 0; k < 5; k++) { x.fillStyle = g8(150 + Math.floor(trnd() * 50)); x.fillRect(Math.floor(trnd() * s), y + 1 + Math.floor(trnd() * 5), 6 + Math.floor(trnd() * 10), 1); } } });
  TEX.carbon = canvasTex(32, (x, s) => { for (let j = 0; j < s; j += 4) for (let i = 0; i < s; i += 4) { const a = ((i + j) / 4) % 2; x.fillStyle = g8(a ? 150 : 95); x.fillRect(i, j, 4, 4); x.fillStyle = g8(a ? 190 : 120); a ? x.fillRect(i, j, 4, 1) : x.fillRect(i, j, 1, 4); } });
  TEX.padded = canvasTex(64, (x, s) => { x.fillStyle = g8(200); x.fillRect(0, 0, s, s); x.strokeStyle = g8(120); x.lineWidth = 1.5; for (let k = -s; k < s * 2; k += 16) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + s, s); x.stroke(); x.beginPath(); x.moveTo(k, s); x.lineTo(k + s, 0); x.stroke(); }
    for (let j = 0; j < s; j += 16) for (let i = 0; i < s; i += 16) { x.fillStyle = g8(80); x.fillRect(i - 1, j - 1, 3, 3); x.fillStyle = g8(235); x.fillRect(i + 7, j + 4, 3, 2); } });
  TEX.neonwall = canvasTex(64, (x, s) => { x.fillStyle = g8(45); x.fillRect(0, 0, s, s); speckle(x, 0.1, s, 35, 60); x.fillStyle = g8(255); x.fillRect(0, 14, s, 2); x.fillRect(0, 50, s, 1); x.fillStyle = g8(150); x.fillRect(0, 13, s, 1); x.fillRect(0, 16, s, 1); x.fillStyle = g8(30); x.fillRect(31, 0, 2, s); x.fillStyle = g8(80); x.fillRect(33, 0, 1, s); });
  TEX.ceilgrid = canvasTex(64, (x, s) => { x.fillStyle = g8(120); x.fillRect(0, 0, s, s); for (const [a, b] of [[2, 2], [34, 2], [2, 34], [34, 34]]) { x.fillStyle = g8(250); x.fillRect(a + 2, b + 2, 24, 24); x.fillStyle = g8(215); x.fillRect(a + 2, b + 2, 24, 2); } });
  TEX.pipes = canvasTex(64, (x, s) => { x.fillStyle = g8(70); x.fillRect(0, 0, s, s); for (const [y, h] of [[4, 10], [18, 6], [28, 12], [44, 8], [55, 6]]) { for (let k = 0; k < h; k++) { const v = Math.sin(k / (h - 1) * Math.PI); x.fillStyle = g8(Math.round(110 + v * 130)); x.fillRect(0, y + k, s, 1); } x.fillStyle = g8(60); for (let i = (y * 7) % 20; i < s; i += 22) x.fillRect(i, y, 2, h); } });
  TEX.ribbed = canvasTex(64, (x, s) => { for (let i = 0; i < s; i++) { const v = Math.sin((i % 16) / 16 * Math.PI); x.fillStyle = g8(Math.round(110 + v * 120)); x.fillRect(i, 0, 1, s); } x.fillStyle = g8(80); x.fillRect(0, 31, s, 2); });
  TEX.beams = canvasTex(64, (x, s) => { x.fillStyle = g8(225); x.fillRect(0, 0, s, s); speckle(x, 0.1, s, 205, 240); x.fillStyle = g8(150); x.fillRect(0, 26, s, 12); x.fillRect(26, 0, 12, s); x.fillStyle = g8(110); x.fillRect(0, 37, s, 1); x.fillRect(37, 0, 1, s); x.fillStyle = g8(185); x.fillRect(0, 26, s, 1); x.fillRect(26, 0, 1, s); for (let k = 0; k < 8; k++) { x.fillStyle = g8(130); x.fillRect(Math.floor(trnd() * s), 28 + Math.floor(trnd() * 8), 8, 1); } });
  TEX.starceil = canvasTex(64, (x, s) => { x.fillStyle = g8(40); x.fillRect(0, 0, s, s); for (let k = 0; k < 40; k++) { const v = 150 + Math.floor(trnd() * 105); x.fillStyle = g8(v); x.fillRect(Math.floor(trnd() * s), Math.floor(trnd() * s), 1, 1); } for (const [a, b] of [[10, 12], [40, 44], [52, 8]]) { x.fillStyle = g8(255); x.fillRect(a, b, 2, 2); } });
}
const shipStyleIdx = (area, kind) => { const st = (S.ship && S.ship.style) || {}, i = st[area + '_' + kind] | 0; return i > 0 && i < SHIP_STYLES[kind].length ? i : 0; };
// the material for that surface, or null for the stock look
function shipStyleMat(kind, area) { const i = shipStyleIdx(area, kind); if (!i) return null; shipTexInit(); const [, tex, col] = SHIP_STYLES[kind][i]; return toonNS(col, tex); }
function openShipStyle() { openDlg('Ship interior', 'Interior styles'); $('dlgLine').textContent = 'Pick a floor, walls and ceiling for the flight deck and the hallway. Six of each.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  for (const [area, an] of SHIP_AREAS) for (const [kind, kn] of SHIP_KINDS) { const L = SHIP_STYLES[kind], i = shipStyleIdx(area, kind), r = document.createElement('div'); r.className = 'rowi';
    const nm = document.createElement('span'); nm.innerHTML = `<b>${an} · ${kn}</b><br><small style="opacity:.8">${L[i][0]} (${i + 1}/${L.length})</small>`;
    const sw = document.createElement('span'); sw.className = 'dot'; sw.style.background = L[i][2] || '#8a8e96';
    const go = d => () => { S.ship.style = S.ship.style || {}; S.ship.style[area + '_' + kind] = (i + d + L.length) % L.length; markDirty(); SFX.ui(); const at = { x: player.pos.x, z: player.pos.z, yaw: player.yaw }; closeDlg(); loadLevel('ship', { at }); setTimeout(openShipStyle, 350); };
    const a = document.createElement('button'), b = document.createElement('button'); a.className = b.className = 'pbtn'; a.style.padding = b.style.padding = '5px 12px'; a.textContent = '‹'; b.textContent = '›'; a.addEventListener('click', go(-1)); b.addEventListener('click', go(1));
    r.append(sw, nm, a, b); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); }
// the panel on the flight deck, by the starboard wall
{ const _ll = loadLevel; loadLevel = function () { const r = _ll.apply(this, arguments); try { if (LEVEL && LEVEL.id === 'ship') { const g = new THREE.Group(); g.position.set(6.75, 0, -6); g.rotation.y = -Math.PI / 2; levelGroup.add(g);
    part(g, B(0.9, 0.6, 0.06), '#2a2c32', 0, 1.45, 0); for (let k = 0; k < 6; k++) part(g, B(0.12, 0.12, 0.02), glow(['#9a9ea6', '#a8744a', '#7a2a2a', '#4fd2ff', '#d0d8e4', '#9ab8ff'][k]), -0.3 + (k % 3) * 0.3, 1.55 - Math.floor(k / 3) * 0.2, 0.04); part(g, B(0.8, 0.03, 0.02), glow('#ffd36a'), 0, 1.18, 0.04);
    INTERACTS.push({ x: 6.2, z: -6, r: 1.8, label: '🎨 Interior styles', fn: openShipStyle }); } } catch (e) { console.warn('shipstyle', e); } return r; }; }
