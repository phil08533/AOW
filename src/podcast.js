// =================== PODCAST: episodes unlock after a quest the owner picks, play on the pod (O) with the music ducked ===================
// Audio files live next to the page (podcast/*.mp3). Which quest unlocks each episode, and which intro plays first, is set in
// the owner's editor (Podcast tab) and saved to the shared world/podcast doc, so it changes for everyone without a rebuild.
const POD_EPS = [
  { id: 'drome', file: 'podcast/drome_map.mp3', title: "Drome's Death Reveals a Map to Vector" },
  { id: 'duke', file: 'podcast/duke_starling.mp3', title: 'Did Duke Starling Escape True Justice?' },
];
const POD_INTROS = []; // { id, file, title }: intro stingers, picked per episode in the editor
const POD = { cfg: {}, el: null, ep: null, part: null, playing: false, cutPaused: false };
const podCfg = id => POD.cfg[id] || {};
const podOpen = ep => !!podCfg(ep.id).quest && qDone(podCfg(ep.id).quest);
const podList = () => POD_EPS.filter(podOpen);
// shared config: the owner's picks, loaded once the cloud is up (local copy when offline)
{ let tries = 0; const iv = setInterval(async () => { tries++; if (!db && tries < 20) return; clearInterval(iv);
  try { if (db) { const s = await db.doc('world/podcast').get(); if (s.exists && s.data() && s.data().data) POD.cfg = JSON.parse(s.data().data) || {}; }
    else { const l = localStorage.getItem('aow-podcast'); if (l) POD.cfg = JSON.parse(l) || {}; } } catch (_) {}
  POD.seen = true; podCheckNew(); }, 500); }
function podSaveCfg() { try { localStorage.setItem('aow-podcast', JSON.stringify(POD.cfg)); } catch (_) {} clearTimeout(POD.st);
  POD.st = setTimeout(async () => { if (db) { try { await db.doc('world/podcast').set({ v: 1, t: Date.now(), data: JSON.stringify(POD.cfg) }); toast('EDITOR', 'Podcast saved · live for everyone', 1.2); } catch (_) { toast('EDITOR', 'Saved on this device only', 1.5); } } }, 600); }
// a new episode unlocked: tell the player once
function podCheckNew() { if (!POD.seen || !S || !S.qst) return; S.podNew = S.podNew || {};
  for (const ep of podList()) if (!S.podNew[ep.id]) { S.podNew[ep.id] = 1; if (typeof markDirty === 'function') markDirty(); toast('NEW PODCAST', ep.title + (TOUCH ? ' · Journal → Podcast' : ' · press O'), 3); } }
{ const _cq = completeQuest; completeQuest = function (id) { const r = _cq.apply(this, arguments); setTimeout(podCheckNew, 1500); return r; }; }
// playback: the intro (if any) then the episode; the music drops low underneath and cutscenes pause it
function podEl() { if (POD.el) return POD.el; const e = POD.el = new Audio(); e.preload = 'auto';
  e.addEventListener('ended', () => { if (POD.part === 'intro') podStart(POD.ep, 'main'); else { S.podPos = S.podPos || {}; delete S.podPos[POD.ep.id]; POD.playing = false; POD.ep = null; podUi(); } });
  e.addEventListener('error', () => { if (POD.playing) { POD.playing = false; toast('PODCAST', 'Could not load that episode', 2); podUi(); } }); return e; }
function podStart(ep, part) { const e = podEl(), intro = POD_INTROS.find(x => x.id === podCfg(ep.id).intro);
  if (!part) part = intro && !(S.podPos && S.podPos[ep.id]) ? 'intro' : 'main';
  POD.ep = ep; POD.part = part; e.src = part === 'intro' ? intro.file : ep.file; e.volume = Math.max(0.2, Math.min(1, PREFS.sfxVol != null ? Math.max(0.6, PREFS.sfxVol) : 1));
  if (part === 'main' && S.podPos && S.podPos[ep.id]) { const at = S.podPos[ep.id]; e.addEventListener('loadedmetadata', function f() { e.removeEventListener('loadedmetadata', f); try { e.currentTime = at; } catch (_) {} }); }
  POD.playing = true; e.play().catch(() => { POD.playing = false; podUi(); }); podUi(); }
function podPause() { if (!POD.el) return; POD.el.pause(); POD.playing = false; if (POD.ep && POD.part === 'main') { S.podPos = S.podPos || {}; S.podPos[POD.ep.id] = POD.el.currentTime; } podUi(); }
function podResume() { if (!POD.ep || !POD.el) return; POD.playing = true; POD.el.play().catch(() => { POD.playing = false; }); podUi(); }
function podStop() { if (POD.el) { POD.el.pause(); POD.el.removeAttribute('src'); } POD.playing = false; POD.ep = null; podUi(); }
// duck the music while an episode plays
// (music.js scales musVol by POD.playing)
setInterval(() => { if (!POD.el || !POD.ep) return;
  const cut = CUT.on || !!document.getElementById('ending') || (typeof TRL !== 'undefined' && TRL.on);
  if (cut && POD.playing) { POD.cutPaused = true; POD.el.pause(); POD.playing = false; podUi(); }
  else if (!cut && POD.cutPaused) { POD.cutPaused = false; podResume(); }
  if (POD.playing && POD.part === 'main') { S.podPos = S.podPos || {}; S.podPos[POD.ep.id] = POD.el.currentTime; } }, 400);
// the now-playing strip
const podBar = document.createElement('div'); podBar.id = 'podBar';
podBar.style.cssText = 'position:fixed;left:50%;top:132px;transform:translateX(-50%);z-index:21;display:none;align-items:center;gap:8px;padding:5px 10px;background:rgba(8,10,16,.78);border:1px solid rgba(255,255,255,.22);color:#e8eef2;font:600 12px var(--mono,monospace);max-width:min(92vw,520px)';
podBar.innerHTML = '<span style="color:#ffd36a">♪ PODCAST</span><span id="podT" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"></span><span id="podTime" style="opacity:.7"></span><button id="podPP" class="pbtn" style="padding:2px 8px;min-width:0">❚❚</button><button id="podX" class="pbtn" style="padding:2px 8px;min-width:0">✕</button>';
document.body.appendChild(podBar);
$('podPP').addEventListener('click', () => { POD.playing ? podPause() : podResume(); });
$('podX').addEventListener('click', () => { podPause(); podStop(); });
const podFmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '--:--';
function podUi() { podBar.style.display = POD.ep && state === 'play' ? 'flex' : 'none'; if (!POD.ep) return; $('podT').textContent = (POD.part === 'intro' ? 'Intro · ' : '') + POD.ep.title; $('podPP').textContent = POD.playing ? '❚❚' : '▶'; }
setInterval(() => { if (POD.ep && POD.el) $('podTime').textContent = podFmt(POD.el.currentTime) + ' / ' + podFmt(POD.el.duration); podBar.style.display = POD.ep && state === 'play' ? 'flex' : 'none'; }, 500);
// the pod: list of unlocked episodes (O on PC, Journal → Podcast on the tablet)
function openPodcast() { const L = podList(); openDlg('Podcast', L.length ? 'Episodes you have unlocked' : 'No episodes yet');
  $('dlgLine').textContent = L.length ? 'Plays over your music, pauses for cutscenes, and remembers where you stopped.' : 'Finish quests to unlock episodes.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  for (const ep of L) { const r = document.createElement('div'); r.className = 'rowi nodot'; const on = POD.ep === ep, at = S.podPos && S.podPos[ep.id];
    r.innerHTML = `<span><b></b></span><span class="meta">${on && POD.playing ? 'Playing' : at ? 'Resume at ' + podFmt(at) : ''}</span>`; r.querySelector('b').textContent = ep.title;
    const b = document.createElement('button'); b.className = 'pbtn go'; b.style.cssText = 'padding:4px 10px;min-width:0'; b.textContent = on && POD.playing ? 'Pause' : 'Play';
    b.addEventListener('click', () => { SFX.ui(); if (on && POD.playing) podPause(); else if (on) podResume(); else { if (POD.ep) podPause(); podStart(ep); } openPodcast(); });
    const sp = document.createElement('span'); sp.appendChild(b); r.appendChild(sp); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['Close', closeDlg]]); }
window.addEventListener('keydown', e => { if (e.code === 'KeyO' && !e.repeat && state === 'play' && !dlgOpen && !(typeof chatOpen === 'function' && chatOpen())) openPodcast(); });
{ const b = document.createElement('button'); b.className = 'hbtn win'; b.id = 'podBtn'; b.textContent = 'Podcast'; b.addEventListener('click', () => { if (!dlgOpen) openPodcast(); }); $('menuDrop').appendChild(b); }
// ---- editor: Podcast tab (owner only) ----
function openPodEditor() { if (!EDIT.owner) return; openDlg('Game editor', 'Podcast');
  $('dlgLine').textContent = 'Pick the quest that unlocks each episode, and an intro to play before it. Saves for everyone. Send Claude new episode or intro files to add them here.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '50vh'; rows.style.overflowY = 'auto';
  const sel = (opts, cur, fn) => { const s = document.createElement('select'); s.style.cssText = 'font:inherit;padding:3px;background:#0a0f2a;color:#fff;border:1px solid rgba(255,255,255,.35);max-width:220px'; for (const [v, t] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = t; o.selected = v === (cur || ''); s.appendChild(o); } s.addEventListener('keydown', e => e.stopPropagation()); s.addEventListener('change', () => fn(s.value)); return s; };
  const qs = [['', '— Locked (no quest) —']].concat(Object.keys(QDEFS).filter(k => QDEFS[k] && QDEFS[k].title).map(k => [k, (QDEFS[k].main ? '★ ' : '') + QDEFS[k].title]).sort((a, b) => a[1].localeCompare(b[1])));
  const ins = [['', 'No intro']].concat(POD_INTROS.map(x => [x.id, x.title]));
  for (const ep of POD_EPS) { const c = POD.cfg[ep.id] = POD.cfg[ep.id] || {};
    const r = document.createElement('div'); r.className = 'rowi nodot'; r.style.flexWrap = 'wrap'; const a = document.createElement('span'); a.innerHTML = '<b></b>'; a.querySelector('b').textContent = ep.title;
    const ctl = document.createElement('span'); ctl.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end';
    const test = document.createElement('button'); test.className = 'pbtn'; test.style.cssText = 'padding:4px 9px;min-width:0'; test.textContent = POD.ep === ep && POD.playing ? 'Stop' : 'Test';
    test.addEventListener('click', () => { SFX.ui(); if (POD.ep === ep && POD.playing) podStop(); else { if (S.podPos) delete S.podPos[ep.id]; podStart(ep); } openPodEditor(); });
    ctl.append(sel(qs, c.quest, v => { c.quest = v; podSaveCfg(); }), sel(ins, c.intro, v => { c.intro = v; podSaveCfg(); }), test);
    r.append(a, ctl); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['← Editor', () => openEditor('place')], ['Close', closeDlg]]); }
// wrapped after every script has loaded, so the button survives the other editor tabs' wrappers
setTimeout(() => { const _oe = openEditor; openEditor = function (tab) { _oe(tab); if (!EDIT.owner || !$('dlgActs')) return; const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = '🎙 Podcast'; b.addEventListener('click', () => { SFX.ui(); openPodEditor(); }); $('dlgActs').prepend(b); }; }, 0);
