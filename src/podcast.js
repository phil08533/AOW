// =================== NEBULA 88.8: radio shows unlock with the story, play on the pocket radio (O) with the music stopped ===================
// Audio files live next to the page (podcast/*.mp3). Which quest unlocks each episode, and which intro plays first, is set in
// the owner's editor (Podcast tab) and saved to the shared world/podcast doc, so it changes for everyone without a rebuild.
// def: what unlocks it until the owner picks something else in the editor ('@allmain' = every main quest done, '@maw' = the Greater Maw is dead)
const POD_EPS = [
  { id: 'vector', file: 'podcast/vector_before.mp3', title: 'Why Everyone Avoided Vector Before Drome', def: 'q1' },
  { id: 'earth', file: 'podcast/earth_against.mp3', title: 'How Drome Turned Earth Against Itself', def: 'q5' },
  { id: 'surreal', file: 'podcast/surreal_drama.mp3', title: 'Surreal Local Drama in the Drome War', def: '@allmain' },
  { id: 'final', file: 'podcast/final_hours.mp3', title: 'The Final Hours of the Drome War', def: '@maw' },
  { id: 'drome', file: 'podcast/drome_map.mp3', title: "Drome's Death Reveals a Map to Vector" },
  { id: 'duke', file: 'podcast/duke_starling.mp3', title: 'Did Duke Starling Escape True Justice?' },
];
const POD_INTROS = [{ id: 'nebula88', file: 'music/radio/nebula88-intro.mp3', title: 'Nebula 88.8 station intro' }]; // picked per episode in the editor
const POD = { cfg: {}, el: null, ep: null, part: null, playing: false, cutPaused: false };
const podCfg = id => { const c = POD.cfg[id] || {}, ep = POD_EPS.find(e => e.id === id) || {}; return { quest: c.quest !== undefined ? c.quest : ep.def || '', intro: c.intro !== undefined ? c.intro : 'nebula88' }; };
const podUnlocked = q => !q ? false : q === '@maw' ? !!(S.flags && S.flags.mawDead) : q === '@allmain' ? Object.keys(QDEFS).every(k => !QDEFS[k] || !QDEFS[k].main || qDone(k)) : qDone(q);
const podOpen = ep => podUnlocked(podCfg(ep.id).quest);
// the radio itself: Vega hands it over after the first quest, and you need it to tune in
ITEMS.radio88 = { name: 'Nebula 88.8 Radio', v: 0, col: '#c86aff', quest: true, desc: 'A pocket radio locked to Nebula 88.8. Press O (or Menu → Journal → Radio) to tune in.' };
setTimeout(() => { // after inventory.js has loaded
  INV_SVG.radio = '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8 17 3l.6 1.2L10 8z"/><circle cx="8.5" cy="14" r="3.2" fill="#000" opacity=".45"/><rect x="14" y="11" width="5" height="1.6" fill="#000" opacity=".45"/><rect x="14" y="14" width="5" height="1.6" fill="#000" opacity=".45"/><rect x="14" y="17" width="3" height="1.4" fill="#000" opacity=".45"/>';
  const _ii = itemIcon; itemIcon = function (id) { return id === 'radio88' ? 'radio' : _ii(id); }; }, 0);
const podHasRadio = () => !!(S.inv && S.inv.radio88);
function podGiveRadio() { if (podHasRadio() || !qDone('q1')) return; S.inv.radio88 = 1; if (typeof markDirty === 'function') markDirty(); log('+1 Nebula 88.8 Radio', 'loot'); toast('NEBULA 88.8 RADIO', 'A pocket radio. ' + (TOUCH ? 'Menu → Journal → Radio' : 'Press O') + ' to tune in.', 3.5); }
const podList = () => POD_EPS.filter(podOpen);
// shared config: the owner's picks, loaded once the cloud is up (local copy when offline)
{ let tries = 0; const iv = setInterval(async () => { tries++; if (!db && tries < 20) return; clearInterval(iv);
  try { if (db) { const s = await db.doc('world/podcast').get(); if (s.exists && s.data() && s.data().data) POD.cfg = JSON.parse(s.data().data) || {}; }
    else { const l = localStorage.getItem('aow-podcast'); if (l) POD.cfg = JSON.parse(l) || {}; } } catch (_) {}
  POD.seen = true; podGiveRadio(); podCheckNew(); }, 500); }
function podSaveCfg() { try { localStorage.setItem('aow-podcast', JSON.stringify(POD.cfg)); } catch (_) {} clearTimeout(POD.st);
  POD.st = setTimeout(async () => { if (db) { try { await db.doc('world/podcast').set({ v: 1, t: Date.now(), data: JSON.stringify(POD.cfg) }); toast('EDITOR', 'Podcast saved · live for everyone', 1.2); } catch (_) { toast('EDITOR', 'Saved on this device only', 1.5); } } }, 600); }
// a new episode unlocked: tell the player once
function podCheckNew() { if (!POD.seen || !S || !S.qst || !podHasRadio()) return; S.podNew = S.podNew || {};
  for (const ep of podList()) if (!S.podNew[ep.id]) { S.podNew[ep.id] = 1; if (typeof markDirty === 'function') markDirty(); (POD.pending = POD.pending || []).push(ep); } }
{ const _cq = completeQuest; completeQuest = function (id) { const r = _cq.apply(this, arguments); setTimeout(() => { podGiveRadio(); podCheckNew(); }, 1500); return r; }; }
// playback: the intro (if any) then the episode; the music drops low underneath and cutscenes pause it
function podEl() { if (POD.el) return POD.el; const e = POD.el = new Audio(); e.preload = 'auto';
  e.addEventListener('ended', () => { if (POD.part === 'intro') podStart(POD.ep, 'main'); else if (POD.ep && POD.ep.song) { const L = podSongList(), i = L.indexOf(POD.ep); podStart(L[(i + 1) % L.length]); if (RDEV.open && RDEV.mode === 'songs') RDEV.sel = (i + 1) % L.length; } else { S.podPos = S.podPos || {}; delete S.podPos[POD.ep.id]; POD.playing = false; POD.ep = null; podUi(); } });
  e.addEventListener('error', () => { if (POD.playing) { POD.playing = false; toast('NEBULA 88.8', 'Could not load that show', 2); podUi(); } }); return e; }
function podStart(ep, part) { const e = podEl(), intro = !ep.song && POD_INTROS.find(x => x.id === podCfg(ep.id).intro);
  if (!part) part = intro && !(S.podPos && S.podPos[ep.id]) ? 'intro' : 'main';
  POD.ep = ep; POD.part = part; e.src = part === 'intro' ? intro.file : ep.file; e.volume = Math.max(0.2, Math.min(1, PREFS.sfxVol != null ? Math.max(0.6, PREFS.sfxVol) : 1));
  if (part === 'main' && !ep.song && S.podPos && S.podPos[ep.id]) { const at = S.podPos[ep.id]; e.addEventListener('loadedmetadata', function f() { e.removeEventListener('loadedmetadata', f); try { e.currentTime = at; } catch (_) {} }); }
  POD.playing = true; e.play().catch(() => { POD.playing = false; podUi(); }); podUi(); }
function podPause() { if (!POD.el) return; POD.el.pause(); POD.playing = false; if (POD.ep && !POD.ep.song && POD.part === 'main') { S.podPos = S.podPos || {}; S.podPos[POD.ep.id] = POD.el.currentTime; } podUi(); }
function podResume() { if (!POD.ep || !POD.el) return; POD.playing = true; POD.el.play().catch(() => { POD.playing = false; }); podUi(); }
function podStop() { if (POD.el) { POD.el.pause(); POD.el.removeAttribute('src'); } POD.playing = false; POD.ep = null; podUi(); }
// duck the music while an episode plays
// (music.js scales musVol by POD.playing)
setInterval(() => { if (!POD.el || !POD.ep) return;
  const cut = CUT.on || !!document.getElementById('ending') || (typeof TRL !== 'undefined' && TRL.on);
  if (cut && POD.playing) { POD.cutPaused = true; POD.el.pause(); POD.playing = false; podUi(); }
  else if (!cut && POD.cutPaused) { POD.cutPaused = false; podResume(); }
  if (POD.playing && POD.part === 'main' && !POD.ep.song) { S.podPos = S.podPos || {}; S.podPos[POD.ep.id] = POD.el.currentTime; } }, 400);
// the now-playing strip (stays up while the radio is put away)
const podBar = document.createElement('div'); podBar.id = 'podBar';
podBar.style.cssText = 'position:fixed;left:50%;top:132px;transform:translateX(-50%);z-index:21;display:none;align-items:center;gap:8px;padding:5px 10px;background:rgba(8,10,16,.78);border:1px solid rgba(255,255,255,.22);color:#e8eef2;font:600 12px var(--mono,monospace);max-width:min(92vw,520px)';
podBar.innerHTML = '<span style="color:#d08aff">📻 NEBULA 88.8</span><span id="podT" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"></span><span id="podTime" style="opacity:.7"></span><button id="podPP" class="pbtn" style="padding:2px 8px;min-width:0">❚❚</button><button id="podX" class="pbtn" style="padding:2px 8px;min-width:0">✕</button>';
document.body.appendChild(podBar);
$('podPP').addEventListener('click', () => { POD.playing ? podPause() : podResume(); });
$('podX').addEventListener('click', () => { podPause(); podStop(); });
const podFmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '--:--';
function podUi() { podBar.style.display = 'none'; if (!POD.ep) return; $('podT').textContent = (POD.part === 'intro' ? 'Station ID · ' : '') + POD.ep.title; $('podPP').textContent = POD.playing ? '❚❚' : '▶'; }
setInterval(() => { if (POD.ep && POD.el) $('podTime').textContent = podFmt(POD.el.currentTime) + ' / ' + podFmt(POD.el.duration); podBar.style.display = 'none'; }, 500);
// ---- the pocket radio: a real little player (chamfered body, green screen, d-pad, earbuds) that pops up in a dialog ----
const RDEV = { r: null, cv: null, sc: null, cam: null, g: null, sx: null, stex: null, keys: {}, sel: 0, ask: null, open: false, t0: 0, drawT: 0 };
function rdevShape(w, h, c) { const s = new THREE.Shape(), x = w / 2, y = h / 2; s.moveTo(-x + c, -y); s.lineTo(x - c, -y); s.lineTo(x, -y + c); s.lineTo(x, y - c); s.lineTo(x - c, y); s.lineTo(-x + c, y); s.lineTo(-x, y - c); s.lineTo(-x, -y + c); s.closePath(); return s; }
function rdevBuild() {
  const cv = RDEV.cv = document.createElement('canvas'); cv.id = 'radioDev'; cv.style.cssText = 'width:420px;height:560px;display:block;margin:0 auto;cursor:pointer;touch-action:none';
  const r = RDEV.r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(420, 560, false); r.outputEncoding = THREE.sRGBEncoding;
  const sc = RDEV.sc = new THREE.Scene(), cam = RDEV.cam = new THREE.PerspectiveCamera(30, 0.75, 0.1, 50); cam.position.set(0, 0, 11.6);
  sc.add(new THREE.HemisphereLight(0xdfe8ff, 0x20222a, 0.8)); const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-3, 4, 6); sc.add(key); const rim = new THREE.DirectionalLight(0x9fd8c0, 0.2); rim.position.set(4, -2, 3); sc.add(rim);
  const M = (c, rough) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c).convertSRGBToLinear(), roughness: rough || 0.75, metalness: 0.1, flatShading: true });
  const ext = (shape, d, bv) => { const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 1 }); geo.translate(0, 0, -d / 2); return geo; };
  const g = RDEV.g = new THREE.Group(); sc.add(g);
  const body = new THREE.Mesh(ext(rdevShape(2.5, 3.9, 0.38), 0.42, 0.13), M('#3a3d44')); g.add(body);
  const bez = new THREE.Mesh(ext(rdevShape(2.04, 1.62, 0.14), 0.06, 0.04), M('#16181c', 0.5)); bez.position.set(0, 0.86, 0.29); g.add(bez);
  const c2 = document.createElement('canvas'); c2.width = 512; c2.height = 400; RDEV.sx = c2.getContext('2d'); RDEV.stex = new THREE.CanvasTexture(c2); RDEV.stex.encoding = THREE.sRGBEncoding;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.45), new THREE.MeshBasicMaterial({ map: RDEV.stex, toneMapped: false })); scr.position.set(0, 0.86, 0.41); g.add(scr);
  // d-pad: four chamfered keys with arrows round an octagonal play/pause
  const keyM = M('#18191d', 0.6), ink = new THREE.MeshBasicMaterial({ color: '#d4d8de' }), tri = new THREE.Shape(); tri.moveTo(0, 0.11); tri.lineTo(-0.1, -0.06); tri.lineTo(0.1, -0.06); tri.closePath();
  const pad = new THREE.Group(); pad.position.set(0, -0.92, 0.27); g.add(pad);
  const mkBtn = (name, geo, x, y, rot) => { const k = new THREE.Group(); k.position.set(x, y, 0); k.rotation.z = rot || 0; const m = new THREE.Mesh(geo, keyM); m.userData.btn = name; k.add(m); pad.add(k); RDEV.keys[name] = k; return k; };
  const sideGeo = ext(rdevShape(0.5, 0.42, 0.12), 0.1, 0.04);
  [['up', 0, 0.6, 0], ['down', 0, -0.6, Math.PI], ['left', -0.6, 0, Math.PI / 2], ['right', 0.6, 0, -Math.PI / 2]].forEach(([n, x, y, rot]) => { const k = mkBtn(n, sideGeo, x, y, rot); const a = new THREE.Mesh(new THREE.ShapeGeometry(tri), ink); a.position.z = 0.1; a.userData.btn = n; k.add(a); });
  const mid = mkBtn('mid', new THREE.CylinderGeometry(0.34, 0.34, 0.12, 8).rotateX(Math.PI / 2).rotateZ(Math.PI / 8), 0, 0, 0);
  { const pl = new THREE.Mesh(new THREE.ShapeGeometry(tri), ink); pl.rotation.z = -Math.PI / 2; pl.position.set(-0.07, 0, 0.08); pl.scale.setScalar(0.9); pl.userData.btn = 'mid'; mid.add(pl);
    for (const x of [0.08, 0.15]) { const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.17), ink); bar.position.set(x, 0, 0.08); bar.userData.btn = 'mid'; mid.add(bar); } }
  // the heart key: favourite (or un-favourite) the song on screen
  { const h = new THREE.Shape(); h.moveTo(0, -0.17); h.bezierCurveTo(-0.05, -0.1, -0.2, -0.02, -0.2, 0.07); h.bezierCurveTo(-0.2, 0.16, -0.08, 0.2, 0, 0.1); h.bezierCurveTo(0.08, 0.2, 0.2, 0.16, 0.2, 0.07); h.bezierCurveTo(0.2, -0.02, 0.05, -0.1, 0, -0.17);
    const k = mkBtn('fav', ext(h, 0.1, 0.03), 0.8, -0.66, 0); k.children[0].material = M('#b8324a', 0.55); }
  // tap a key
  const ray = new THREE.Raycaster(), m2 = new THREE.Vector2();
  cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(); m2.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(m2, cam);
    const hit = ray.intersectObjects(pad.children, true).find(h => h.object.userData.btn); if (hit) { e.preventDefault(); rdevPress(hit.object.userData.btn); } });
}
// two lists on the dial: SHOWS (Nebula 88.8) and SONGS (every track you've heard out in the galaxy). Up/down switch list, left/right pick, middle plays
const POD_SONG_TITLES = { risingsun: 'Art of War: Rising Sun', overture: 'Velocity Overture', eventhorizon: 'Event Horizon', tidal: 'Tidal', nebula: 'Nebula', neon: 'Neon', wakeup: 'Wake Up', dancing: 'Dancing', hymn: 'Hymn', mushroom: 'Mushroom', enchanted: 'Enchanted', iloveyou: 'I Love You', apocalyptic: 'Apocalyptic', low: 'Low', c4po: 'C4PO', awzil: 'Awzil', wistful: 'Wistful', glinky: 'Glinky', clarinet: 'Clarinet', mayhem: 'Orchestral Mayhem' };
const POD_SONGS = {}; // song items, made once so the player can tell them apart
function podSongList() { S.songs = S.songs || {}; return Object.keys(S.songs).filter(k => TRACKS[k]).map(k => POD_SONGS[k] || (POD_SONGS[k] = { id: 'song_' + k, key: k, file: TRACKS[k], title: POD_SONG_TITLES[k] || k[0].toUpperCase() + k.slice(1), song: true })); }
{ const _ms = musStart; musStart = function (list, idx) { const r = _ms.apply(this, arguments); try { const k = PLAYLISTS[list][idx % PLAYLISTS[list].length]; S.songs = S.songs || {}; if (k && TRACKS[k] && !S.songs[k]) { S.songs[k] = 1; if (typeof markDirty === 'function') markDirty(); } } catch (_) {} return r; }; }
const RDEV_MODES = ['shows', 'songs', 'favs'], RDEV_NAMES = { shows: 'NEBULA 88.8', songs: 'ALL SONGS', favs: 'FAVORITES' };
const podFavs = () => (S.favSongs = S.favSongs || {});
const rdevList = () => RDEV.mode === 'songs' ? podSongList() : RDEV.mode === 'favs' ? podSongList().filter(e => podFavs()[e.key]) : podList();
function rdevPress(k) { const K = RDEV.keys[k]; if (K) { K.position.z = -0.06; setTimeout(() => { K.position.z = 0; }, 120); } try { SFX.ui(); } catch (_) {}
  if (RDEV.ask && k !== 'mid') { RDEV.ask = null; rdevDraw(); return; }
  if (k === 'fav') { const L = rdevList(), ep = L.length ? L[RDEV.sel % L.length] : null; if (!ep || !ep.song) { toast('FAVORITES', ep ? 'Only songs go in Favorites' : 'Pick a song first', 1.4); return; }
    const F = podFavs(); if (F[ep.key]) delete F[ep.key]; else F[ep.key] = 1; RDEV.heartT = performance.now(); markDirty(); if (RDEV.mode === 'favs') RDEV.sel = Math.min(RDEV.sel, Math.max(0, rdevList().length - 1)); rdevDraw(); return; }
  if (k === 'up' || k === 'down') { RDEV.mode = RDEV_MODES[(RDEV_MODES.indexOf(RDEV.mode) + (k === 'up' ? 2 : 1)) % 3]; RDEV.sel = 0; const L = rdevList(); if (POD.ep && L.includes(POD.ep)) RDEV.sel = L.indexOf(POD.ep); rdevDraw(); return; }
  const L = rdevList(); if (!L.length) { rdevDraw(); return; }
  if (k === 'left') RDEV.sel = (RDEV.sel + L.length - 1) % L.length;
  else if (k === 'right') RDEV.sel = (RDEV.sel + 1) % L.length;
  else if (k === 'mid') { const ep = L[RDEV.sel % L.length]; RDEV.ask = null; if (POD.ep === ep) { POD.playing ? podPause() : podResume(); } else { if (POD.ep) podPause(); podStart(ep); } }
  rdevDraw(); }
function rdevWrap(x, text, maxW) { const w = String(text).split(' '), out = []; let line = ''; for (const s of w) { const t = line ? line + ' ' + s : s; if (x.measureText(t).width > maxW && line) { out.push(line); line = s; } else line = t; } if (line) out.push(line); return out; }
function rdevDraw() { const x = RDEV.sx; if (!x) return; const W = 512, H = 400, fg = '#a8e6cc', dim = 'rgba(168,230,204,.45)';
  const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#13302a'); gr.addColorStop(1, '#0a1a17'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.strokeStyle = fg; x.fillStyle = fg; x.lineWidth = 5;
  // podcast icon, station name, battery
  x.beginPath(); x.arc(52, 58, 12, 0, Math.PI * 2); x.fill(); for (const r of [22, 32]) { x.beginPath(); x.arc(52, 58, r, Math.PI * 0.8, Math.PI * 2.2); x.stroke(); } x.fillRect(48, 70, 8, 26);
  x.font = 'bold 30px "Courier New",monospace'; x.textBaseline = 'middle'; x.fillText(RDEV_NAMES[RDEV.mode] || 'NEBULA 88.8', 100, 46); x.font = '20px "Courier New",monospace'; x.fillStyle = dim; x.fillText(RDEV.mode === 'songs' ? 'Songs from the galaxy' : RDEV.mode === 'favs' ? 'Your hearted songs' : 'Drome War Radio', 100, 76); x.fillStyle = fg;
  x.lineWidth = 3; x.strokeRect(440, 24, 44, 20); x.fillRect(484, 29, 5, 10); x.fillRect(444, 28, 30, 12);
  const songs = RDEV.mode !== 'shows', L = rdevList(), ep = L.length ? L[RDEV.sel % L.length] : null;
  x.font = 'bold 17px "Courier New",monospace'; [['shows', 'RADIO', 40], ['songs', 'ALL SONGS', 150], ['favs', '♥ FAVS', 300]].forEach(([m, t, tx]) => { x.fillStyle = RDEV.mode === m ? fg : dim; x.fillText(t, tx, 108); if (RDEV.mode === m) x.fillRect(tx, 120, x.measureText(t).width, 3); }); x.fillStyle = dim; x.fillText('▲▼', 440, 108); x.fillStyle = fg;
  if (!ep) { x.font = 'bold 30px "Courier New",monospace'; x.fillText(RDEV.mode === 'favs' ? 'No favorites yet' : songs ? 'No songs yet' : 'Nothing on air yet', 40, 190); x.font = '22px "Courier New",monospace'; x.fillStyle = dim; (RDEV.mode === 'favs' ? ['Pick a song in ALL SONGS', 'and press the heart key.'] : songs ? ['Songs you hear around the', 'galaxy show up here.'] : ['Shows come on as the', 'story moves on.']).forEach((l, i) => x.fillText(l, 40, 236 + i * 28)); RDEV.stex.needsUpdate = true; return; }
  if (RDEV.ask) { x.font = 'bold 22px "Courier New",monospace'; x.fillText('★ NEW SHOW ON AIR', 40, 130); }
  if (ep.song) { const on = podFavs()[ep.key], pop = RDEV.heartT ? Math.max(0, 1 - (performance.now() - RDEV.heartT) / 400) : 0; x.save(); x.translate(460, 150); x.scale(1 + pop * 0.5, 1 + pop * 0.5); x.beginPath(); x.moveTo(0, 14); x.bezierCurveTo(-4, 8, -18, 2, -18, -7); x.bezierCurveTo(-18, -16, -6, -19, 0, -10); x.bezierCurveTo(6, -19, 18, -16, 18, -7); x.bezierCurveTo(18, 2, 4, 8, 0, 14);
    x.lineWidth = 3; if (on) { x.fillStyle = '#ff6a8a'; x.fill(); } else x.stroke(); x.restore(); x.fillStyle = fg; }
  x.font = 'bold 30px "Courier New",monospace'; rdevWrap(x, ep.title, ep.song ? 390 : 440).slice(0, 2).forEach((l, i) => x.fillText(l, 40, (RDEV.ask ? 172 : 140) + i * 36));
  const on = POD.ep === ep, cur = on && POD.el ? POD.el.currentTime : (!ep.song && S.podPos && S.podPos[ep.id]) || 0, dur = on && POD.el && isFinite(POD.el.duration) ? POD.el.duration : 0;
  x.font = '24px "Courier New",monospace'; x.fillStyle = RDEV.ask ? fg : dim;
  x.fillText(RDEV.ask ? 'Listen now? Press ▶‖' : on && POD.part === 'intro' ? 'Station ID…' : on ? `${podFmt(cur)} / ${podFmt(dur)}` : cur ? `Resume at ${podFmt(cur)}` : 'Press ▶‖ to play', 40, 248); x.fillStyle = fg;
  x.lineWidth = 3; x.strokeRect(40, 276, 432, 18); x.fillRect(44, 280, Math.max(0, 424 * (dur ? cur / dur : 0)), 10);
  // ⏮ ⏯ ⏭
  const ic = (cx, f) => { x.save(); x.translate(cx, 340); f(); x.restore(); };
  ic(120, () => { x.fillRect(-16, -16, 5, 32); x.beginPath(); x.moveTo(14, -16); x.lineTo(-10, 0); x.lineTo(14, 16); x.fill(); });
  ic(256, () => { if (on && POD.playing) { x.fillRect(-14, -18, 9, 36); x.fillRect(5, -18, 9, 36); } else { x.beginPath(); x.moveTo(-12, -18); x.lineTo(16, 0); x.lineTo(-12, 18); x.fill(); } });
  ic(392, () => { x.fillRect(11, -16, 5, 32); x.beginPath(); x.moveTo(-14, -16); x.lineTo(10, 0); x.lineTo(-14, 16); x.fill(); });
  x.font = '18px "Courier New",monospace'; x.fillStyle = dim; x.textAlign = 'right'; x.fillText(`${(RDEV.sel % L.length) + 1}/${L.length}`, 484, 384); x.textAlign = 'left';
  RDEV.stex.needsUpdate = true; }
function rdevLoop() { if (!RDEV.open) return; requestAnimationFrame(rdevLoop); const t = performance.now() / 1000, k = Math.min(1, (performance.now() - RDEV.t0) / 350), e = 1 - Math.pow(1 - k, 3);
  RDEV.g.position.y = -4 * (1 - e) + Math.sin(t * 1.4) * 0.05; RDEV.g.position.x = 0.45; RDEV.g.rotation.set(-0.1 + Math.sin(t * 0.9) * 0.03, 0.32 + Math.sin(t * 0.6) * 0.06 - (1 - e) * 0.6, 0.05); RDEV.g.scale.setScalar(0.8 + 0.2 * e);
  if (t - RDEV.drawT > 0.25 || (RDEV.heartT && performance.now() - RDEV.heartT < 450)) { RDEV.drawT = t; rdevDraw(); } RDEV.r.render(RDEV.sc, RDEV.cam); }
const rdevWrapEl = document.createElement('div'); rdevWrapEl.id = 'radioWrap'; rdevWrapEl.hidden = true;
rdevWrapEl.style.cssText = 'position:fixed;left:50%;bottom:48px;z-index:60;width:420px;transform:translateX(-50%);transform-origin:50% 100%';
rdevWrapEl.innerHTML = '<button id="radioX" class="pbtn" style="position:absolute;right:4px;top:18px;padding:2px 9px;min-width:0;z-index:1" aria-label="Put the radio away">✕</button><div id="radioHint" style="position:absolute;left:50%;bottom:-20px;transform:translateX(-50%);white-space:nowrap;text-align:center;font:600 11px var(--mono,monospace);color:#cfd6de;text-shadow:0 1px 2px #000;margin-top:-6px"></div>';
document.body.appendChild(rdevWrapEl); $('radioX').addEventListener('pointerdown', e => e.stopPropagation()); $('radioX').addEventListener('click', e => { e.stopPropagation(); rdevClose(); });
function rdevClose() { RDEV.open = false; RDEV.ask = null; rdevWrapEl.hidden = true; }
function openPodcast(askEp) { if (!podHasRadio()) { toast('NO RADIO', 'Finish your first job for Captain Vega', 2); return; }
  if (!RDEV.r) { rdevBuild(); rdevWrapEl.prepend(RDEV.cv); }
  if (askEp) { RDEV.mode = 'shows'; const L = podList(); RDEV.ask = askEp; RDEV.sel = Math.max(0, L.indexOf(askEp)); }
  else { RDEV.ask = null; RDEV.mode = RDEV.mode || 'shows'; if (POD.ep && POD.ep.song && RDEV.mode === 'shows') RDEV.mode = 'songs'; const L = rdevList(); if (POD.ep && L.includes(POD.ep)) RDEV.sel = L.indexOf(POD.ep); }
  $('radioHint').textContent = TOUCH ? 'Tap the keys' : 'Click the keys, or arrows · Enter · H for ♥ · O puts it away';
  rdevWrapEl.style.scale = String(Math.min(1, innerHeight * 0.8 / 590, innerWidth * 0.94 / 420)); rdevWrapEl.hidden = false; firing = false;
  if (document.pointerLockElement) document.exitPointerLock();
  RDEV.open = true; RDEV.t0 = performance.now(); RDEV.drawT = 0; rdevDraw(); requestAnimationFrame(rdevLoop); }
window.addEventListener('keydown', e => { if (!RDEV.open || dlgOpen || (typeof chatOpen === 'function' && chatOpen())) return; const k = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Enter: 'mid', Space: 'mid', KeyH: 'fav' }[e.code];
  if (k) { e.preventDefault(); e.stopPropagation(); rdevPress(k); } else if ((e.code === 'KeyO' && !e.repeat) || e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); rdevClose(); } }, true);
// put it away when something else takes the screen
setInterval(() => { if (RDEV.open && (state !== 'play' || dlgOpen || CUT.on || (typeof TAB !== 'undefined' && TAB.t > 0))) rdevClose(); }, 300);
window.addEventListener('keydown', e => { if (e.code === 'KeyO' && !e.repeat && !RDEV.open && state === 'play' && !dlgOpen && !(typeof chatOpen === 'function' && chatOpen())) openPodcast(); });
{ const b = document.createElement('button'); b.className = 'hbtn win'; b.id = 'podBtn'; b.textContent = 'Radio'; b.addEventListener('click', () => { if (typeof closeTablet === 'function') closeTablet(); setTimeout(() => openPodcast(), 250); }); $('menuDrop').appendChild(b); }
// a new show (or the radio itself) asks if you want to listen, as soon as you're free
setInterval(() => { if (!POD.pending || !POD.pending.length || RDEV.open || state !== 'play' || dlgOpen || CUT.on || (typeof TAB !== 'undefined' && TAB.t > 0)) return; openPodcast(POD.pending.shift()); }, 1000);
// B.U.R.P. stays quiet while a show plays; the radio stops drawing when its dialog closes
setTimeout(() => { const _bs = burpSay; burpSay = function () { if (POD.playing) return; return _bs.apply(this, arguments); }; }, 0);
// ---- editor: Podcast tab (owner only) ----
function openPodEditor() { if (!EDIT.owner) return; openDlg('Game editor', 'Podcast');
  $('dlgLine').textContent = 'Pick the quest that unlocks each episode, and an intro to play before it. Saves for everyone. Send Claude new episode or intro files to add them here.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '50vh'; rows.style.overflowY = 'auto';
  const sel = (opts, cur, fn) => { const s = document.createElement('select'); s.style.cssText = 'font:inherit;padding:3px;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35);max-width:220px'; for (const [v, t] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = t; o.selected = v === (cur || ''); s.appendChild(o); } s.addEventListener('keydown', e => e.stopPropagation()); s.addEventListener('change', () => fn(s.value)); return s; };
  const qs = [['', '— Locked (no quest) —'], ['@allmain', '◆ Every main quest done'], ['@maw', '◆ Greater Maw defeated']].concat(Object.keys(QDEFS).filter(k => QDEFS[k] && QDEFS[k].title).map(k => [k, (QDEFS[k].main ? '★ ' : '') + QDEFS[k].title]).sort((a, b) => a[1].localeCompare(b[1])));
  const ins = [['', 'No intro']].concat(POD_INTROS.map(x => [x.id, x.title]));
  for (const ep of POD_EPS) { const c = POD.cfg[ep.id] = POD.cfg[ep.id] || {};
    const r = document.createElement('div'); r.className = 'rowi nodot'; r.style.flexWrap = 'wrap'; const a = document.createElement('span'); a.innerHTML = '<b></b>'; a.querySelector('b').textContent = ep.title;
    const ctl = document.createElement('span'); ctl.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end';
    const test = document.createElement('button'); test.className = 'pbtn'; test.style.cssText = 'padding:4px 9px;min-width:0'; test.textContent = POD.ep === ep && POD.playing ? 'Stop' : 'Test';
    test.addEventListener('click', () => { SFX.ui(); if (POD.ep === ep && POD.playing) podStop(); else { if (S.podPos) delete S.podPos[ep.id]; podStart(ep); } openPodEditor(); });
    const cur = podCfg(ep.id); ctl.append(sel(qs, cur.quest, v => { c.quest = v; podSaveCfg(); }), sel(ins, cur.intro, v => { c.intro = v; podSaveCfg(); }), test);
    r.append(a, ctl); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['← Editor', () => openEditor('place')], ['Close', closeDlg]]); }
// wrapped after every script has loaded, so the button survives the other editor tabs' wrappers
setTimeout(() => { const _oe = openEditor; openEditor = function (tab) { _oe(tab); if (!EDIT.owner || !$('dlgActs')) return; const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = '🎙 Podcast'; b.addEventListener('click', () => { SFX.ui(); openPodEditor(); }); $('dlgActs').prepend(b); }; }, 0);
// put the gun down while the radio is up
setTimeout(() => { const _st = step; step = function (dt) { _st(dt); if (RDEV.open) { vm.visible = false; vmMelee.visible = false; if (typeof vmOff !== 'undefined' && vmOff) vmOff.visible = false; } }; }, 0);
