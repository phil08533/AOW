// =================== SHIP SOUND: speakers in the walls, songs you collect, and a Music Drive with a queue ===================
const SONG_NAMES = { hymn: 'Heavenly Hymn', mushroom: 'Mushroom Bar', nebula: 'Nebula Groove', neon: 'Neon Groove', wakeup: 'Wake Up', dancing: 'Still Dancing', apocalyptic: 'The Apocalyptic Build', enchanted: 'The Enchanted Unfolding', low: 'Low', overture: 'Overture', tidal: 'Tidal Wave', iloveyou: 'I <3 You', c4po: 'C4-PO' };
const SONG_FROM = { hymn: 'Your ship', mushroom: 'Your ship', nebula: 'Starlight Lounge', neon: 'Starlight Lounge', wakeup: 'Starlight Lounge', dancing: 'Starlight Lounge', apocalyptic: 'Boss fights', enchanted: 'Earth', low: 'Battles', overture: 'Velocity', tidal: 'Fort Ironrock', iloveyou: 'Someone special', c4po: 'Out in the galaxy' };
const drive = () => { S.drive = S.drive || { songs: { hymn: 1, mushroom: 1 }, queue: [] }; S.drive.songs = S.drive.songs || {}; S.drive.queue = S.drive.queue || []; return S.drive; };
// hearing a song anywhere adds it to your collection
{ const _ms = musStart; musStart = function (list, idx) { _ms(list, idx); try { const key = PLAYLISTS[list][idx % PLAYLISTS[list].length], D = drive(); if (key && !D.songs[key] && list !== 'drive') { D.songs[key] = 1; markDirty(); setTimeout(() => toast('♪ SONG COLLECTED', `${SONG_NAMES[key]} · play it on your ship's Music Drive`, 3), 1200); } } catch (_) {} }; }
// on the ship, play your queue if you've made one
{ const _mc = musContext; musContext = function (dt) { const c = _mc(dt); if (c === 'ship' && drive().queue.length) { PLAYLISTS.drive = drive().queue.slice(); return 'drive'; } return c; }; }
function driveChanged() { const D = drive(); PLAYLISTS.drive = D.queue.slice(); markDirty();
  if (LEVEL.id !== 'ship' || !MUS.a) return;
  if (!D.queue.length) { MUS.list = null; musTick(); return; }
  const playing = MUS.list === 'drive' && MUS.cur && D.queue.some(k => MUS.cur.src.endsWith(TRACKS[k]));
  if (!playing) { MUS.list = null; musStart('drive', 0); } else if (MUS.cur) MUS.cur.loop = D.queue.length === 1; }
// ---- the Music Drive console ----
function openMusicDrive() {
  const D = drive(); openDlg('Ship systems', 'Music Drive');
  const own = Object.keys(SONG_NAMES).filter(k => D.songs[k]);
  $('dlgLine').textContent = `${own.length} / ${Object.keys(SONG_NAMES).length} songs collected. Add songs to the queue with +, take them out with −. An empty queue plays the ship's own two songs.`;
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '48vh'; rows.style.overflowY = 'auto';
  const now = MUS.cur && Object.keys(TRACKS).find(k => MUS.cur.src.endsWith(TRACKS[k]));
  const h = t => { const d = document.createElement('div'); d.style.cssText = 'margin:8px 0 2px;color:#ffd36a;font-weight:bold'; d.textContent = t; rows.appendChild(d); };
  h(`Queue (${D.queue.length})`);
  if (!D.queue.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Empty: the ship plays Mushroom Bar and Heavenly Hymn.'; rows.appendChild(e); }
  D.queue.forEach((k, i) => { const r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.innerHTML = `<b>${i + 1}. ${SONG_NAMES[k]}</b>${now === k ? ' <small style="color:#6fdc5a">▶ playing</small>' : ''}`; const b = document.createElement('span'); const c = document.createElement('span'); c.style.cssText = 'display:flex;gap:4px';
    const mk = (t, fn, dis) => { const x = document.createElement('button'); x.className = 'pbtn'; x.style.cssText = 'padding:4px 10px;min-width:0'; x.textContent = t; x.disabled = !!dis; x.addEventListener('click', () => { SFX.ui(); fn(); driveChanged(); openMusicDrive(); }); c.appendChild(x); };
    mk('▲', () => { D.queue.splice(i, 1); D.queue.splice(i - 1, 0, k); }, i === 0); mk('−', () => D.queue.splice(i, 1)); r.append(a, b, c); rows.appendChild(r); });
  h('Collection');
  for (const k of Object.keys(SONG_NAMES)) { const got = !!D.songs[k], r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.innerHTML = got ? `<b>${SONG_NAMES[k]}</b><br><small style="color:var(--dim)">${SONG_FROM[k]}</small>` : `<b style="color:var(--dim)">??? </b><small style="color:var(--dim)">Heard somewhere out there: ${SONG_FROM[k]}</small>`;
    const b = document.createElement('span'); b.className = 'meta'; b.style.fontSize = '13px'; const n = D.queue.filter(q => q === k).length; b.textContent = n ? `×${n} in queue` : '';
    const c = document.createElement('span'); c.style.cssText = 'display:flex;gap:4px'; if (got) { for (const [t, fn] of [['+', () => D.queue.push(k)], ['−', () => { const j = D.queue.lastIndexOf(k); if (j >= 0) D.queue.splice(j, 1); }]]) { const x = document.createElement('button'); x.className = 'pbtn'; x.style.cssText = 'padding:4px 12px;min-width:0'; x.textContent = t; x.disabled = t === '−' && !n; x.addEventListener('click', () => { SFX.ui(); fn(); driveChanged(); openMusicDrive(); }); c.appendChild(x); } }
    r.append(a, b, c); rows.appendChild(r); }
  $('dlgActs').before(rows);
  acts([['Clear queue', () => { D.queue.length = 0; driveChanged(); openMusicDrive(); }, false, !D.queue.length], ['Skip song', () => { if (MUS.list === 'drive' || MUS.list === 'ship') { const L = PLAYLISTS[MUS.list]; musStart(MUS.list, (MUS.idx + 1) % L.length); setTimeout(openMusicDrive, 200); } }, false, LEVEL.id !== 'ship'], ['Done', closeDlg, true]]);
}
// ---- the ship's speakers: on the bridge, along the corridor and in each room ----
let SHIP_SPK = [];
{ const ob = LEVELS.ship.build; LEVELS.ship.build = function () { ob.call(this); SHIP_SPK = [];
  const spk = (x, z, y, ry) => { const g = new THREE.Group(); part(g, B(0.5, 0.7, 0.18), '#1e1c22', 0, 0, 0); part(g, Cy(0.17, 0.17, 0.03, 14), '#3a3d44', 0, 0.1, 0.1, Math.PI / 2); part(g, Cy(0.08, 0.08, 0.03, 10), '#3a3d44', 0, -0.2, 0.1, Math.PI / 2); part(g, B(0.04, 0.04, 0.02), glow('#4fd2ff'), 0.18, 0.28, 0.1); g.position.set(x, y, z); g.rotation.y = ry; props.add(g); SHIP_SPK.push([x, z]); };
  spk(-6.6, -14.2, 2.4, Math.PI / 4); spk(6.6, -14.2, 2.4, -Math.PI / 4); spk(-6.75, -3, 2.4, Math.PI / 2); spk(6.75, -3, 2.4, -Math.PI / 2);
  for (const r of SHIP_ROOMS) { const outer = r.side > 0 ? r.x1 : r.x0; spk(outer - r.side * 0.25, r.zc + 3.6, 2.5, r.side > 0 ? -Math.PI / 2 : Math.PI / 2); }
  for (let z = 6; z < 4 + Math.max(1, Math.ceil(SHIP_ROOMS.length / 2)) * 11; z += 11) SHIP_SPK.push([0, z]);
  // the Music Drive console on the bridge
  const t = new THREE.Group(); part(t, B(0.9, 1.1, 0.5), '#2a2c32', 0, 0.55, 0); part(t, B(0.75, 0.45, 0.04), glow('#c86aff'), 0, 1.25, 0.2, -0.3); for (let i = 0; i < 5; i++) part(t, B(0.06, 0.08 + (i % 3) * 0.06, 0.02), glow('#ffd36a'), -0.2 + i * 0.1, 1.26, 0.23, -0.3); t.position.set(5.4, 0, -9.6); t.rotation.y = -Math.PI / 2; props.add(t); solid(5.4, -9.6, 0.5);
  INTERACTS.push({ x: 4.3, z: -9.6, r: 1.6, label: 'Music Drive', fn: openMusicDrive });
}; }
{ const _sp = musSpace; musSpace = function () { if (!MUS.ac) return _sp();
  if (LEVEL.id === 'ship' && SHIP_SPK.length && ['ship', 'drive'].includes(MUS.list)) { const now = MUS.ac.currentTime, set = (p, v) => p.setTargetAtTime(v, now, 0.15);
    let best = 1e9, bx = 0, bz = 0; for (const [x, z] of SHIP_SPK) { const d = Math.hypot(player.pos.x - x, player.pos.z - z); if (d < best) { best = d; bx = x; bz = z; } }
    const dx = bx - player.pos.x, dz = bz - player.pos.z, dl = Math.hypot(dx, dz) || 1, p = (dx * Math.cos(player.yaw) - dz * Math.sin(player.yaw)) / dl;
    set(MUS.gn.gain, Math.max(0.45, Math.min(1.15, 1.35 / (1 + best / 7)))); if (MUS.pan) set(MUS.pan.pan, Math.max(-0.6, Math.min(0.6, p * 0.6 * Math.min(1, best / 2)))); set(MUS.lp.frequency, Math.max(3500, 20000 - Math.max(0, best - 4) * 1400));
    return; }
  return _sp(); }; }
