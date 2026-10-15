// =================== RADIO: stations you tune in your ship and your Velocity car ===================
// R (or the 📻 button) flips through the stations while you're flying or driving. Stations are built from the game's
// music library; each one has a slot for a DJ who will talk between songs later (RADIO_DJ hooks below).
const RADIO_TITLES = { risingsun: 'Art of War: Rising Sun', overture: 'Velocity Overture', eventhorizon: 'Event Horizon', tidal: 'Tidal', nebula: 'Nebula', neon: 'Neon', wakeup: 'Wake Up', dancing: 'Dancing', hymn: 'Hymn', mushroom: 'Mushroom', enchanted: 'Enchanted', iloveyou: 'I Love You', apocalyptic: 'Apocalyptic', low: 'Low', c4po: 'C4PO' };
const RADIO_STATIONS = [
  { id: 'sunfm', name: 'Setting Sun FM', tag: 'the big songs', tracks: ['risingsun', 'overture', 'eventhorizon', 'tidal'], dj: null },
  { id: 'nebula', name: 'Nebula 88.8', tag: 'club all night', tracks: ['nebula', 'neon', 'wakeup', 'dancing'], dj: null },
  { id: 'ghost', name: 'Ghost Signal', tag: 'late night, low lights', tracks: ['hymn', 'mushroom', 'enchanted', 'iloveyou'], dj: null },
  { id: 'raider', name: 'Raider Radio', tag: 'loud and illegal', tracks: ['apocalyptic', 'low', 'c4po'], dj: null },
];
RADIO_STATIONS.forEach(s => { PLAYLISTS['radio_' + s.id] = s.tracks.filter(t => TRACKS[t]); });
const RADIO = { st: -1, btn: null };
const radioInVehicle = () => !!(LEVEL && state === 'play' && (LEVEL.fly || (typeof RC !== 'undefined' && RC.on && LEVEL.id === 'speedway')));
function radioNow() { if (RADIO.st < 0) return null; const s = RADIO_STATIONS[RADIO.st], list = 'radio_' + s.id; const id = MUS.list === list ? PLAYLISTS[list][MUS.idx] : null; return { name: s.name, track: id ? (RADIO_TITLES[id] || id) : 'tuning…', station: s }; }
function radioNext() {
  if (!radioInVehicle()) return;
  RADIO.st = RADIO.st + 1 >= RADIO_STATIONS.length ? -1 : RADIO.st + 1; S.radio = RADIO.st; markDirty();
  if (RADIO.st >= 0) { const s = RADIO_STATIONS[RADIO.st], L = PLAYLISTS['radio_' + s.id]; for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
    if (PREFS.music !== 3) toast('📻 ' + s.name, 'Turn music to Soundtrack in Settings to hear the radio', 2.5); else toast('📻 ' + s.name, s.tag, 1.6); }
  else toast('📻 Radio off', 'Back to the soundtrack', 1.2);
  SFX.ui(); musUnlock(); musTick();
}
// while you're in a vehicle with the radio on, the station is what plays (cutscenes still win)
{ const _mc = musContext; musContext = function (dt) { const r = _mc(dt); if (MUS.force) return r; if (RADIO.st >= 0 && radioInVehicle()) return 'radio_' + RADIO_STATIONS[RADIO.st].id; return r; }; }
// a DJ hook for later: called when a new song starts on a station (quest-aware chatter goes here)
const RADIO_DJ = { say: null };
{ let lastKey = ''; setInterval(() => { const n = radioNow(); const k = n ? n.name + n.track : ''; if (k !== lastKey) { lastKey = k; if (n && n.track !== 'tuning…') { if (radioInVehicle()) toast('📻 ' + n.name, '♪ ' + n.track, 1.6); if (RADIO_DJ.say && n.station.dj) try { RADIO_DJ.say(n.station, n.track); } catch (_) {} } } }, 500); }
window.addEventListener('keydown', e => { if (e.code !== 'KeyR' || e.repeat || !radioInVehicle() || dlgOpen || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; e.stopImmediatePropagation(); e.preventDefault(); radioNext(); }, true);
setInterval(() => { if (RADIO.st < 0 && S && typeof S.radio === 'number' && S.radio >= 0 && !RADIO.init) { RADIO.st = S.radio; } RADIO.init = true;
  let b = RADIO.btn; if (!b) { b = RADIO.btn = document.createElement('button'); b.textContent = '📻'; b.title = 'Radio (R)'; b.style.cssText = 'position:fixed;right:calc(env(safe-area-inset-right,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 190px);z-index:22;width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(10,14,30,.7);font-size:20px;cursor:pointer'; b.addEventListener('click', e => { e.stopPropagation(); radioNext(); }); b.addEventListener('touchstart', e => { e.stopPropagation(); e.preventDefault(); radioNext(); }, { passive: false }); document.body.appendChild(b); }
  b.hidden = !radioInVehicle() || dlgOpen; b.style.borderColor = RADIO.st >= 0 ? '#ffd36a' : 'rgba(255,255,255,.3)'; }, 300);
