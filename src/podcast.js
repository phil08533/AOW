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
  for (const ep of podList()) if (!S.podNew[ep.id]) { S.podNew[ep.id] = 1; if (typeof markDirty === 'function') markDirty(); toast('NEW ON NEBULA 88.8', ep.title + (TOUCH ? ' · Journal → Radio' : ' · press O'), 3); } }
{ const _cq = completeQuest; completeQuest = function (id) { const r = _cq.apply(this, arguments); setTimeout(() => { podGiveRadio(); podCheckNew(); }, 1500); return r; }; }
// playback: the intro (if any) then the episode; the music drops low underneath and cutscenes pause it
function podEl() { if (POD.el) return POD.el; const e = POD.el = new Audio(); e.preload = 'auto';
  e.addEventListener('ended', () => { if (POD.part === 'intro') podStart(POD.ep, 'main'); else { S.podPos = S.podPos || {}; delete S.podPos[POD.ep.id]; POD.playing = false; POD.ep = null; podUi(); } });
  e.addEventListener('error', () => { if (POD.playing) { POD.playing = false; toast('NEBULA 88.8', 'Could not load that show', 2); podUi(); } }); return e; }
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
podBar.innerHTML = '<span style="color:#d08aff">📻 NEBULA 88.8</span><span id="podT" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"></span><span id="podTime" style="opacity:.7"></span><button id="podPP" class="pbtn" style="padding:2px 8px;min-width:0">❚❚</button><button id="podX" class="pbtn" style="padding:2px 8px;min-width:0">✕</button>';
document.body.appendChild(podBar);
$('podPP').addEventListener('click', () => { POD.playing ? podPause() : podResume(); });
$('podX').addEventListener('click', () => { podPause(); podStop(); });
const podFmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '--:--';
function podUi() { podBar.style.display = POD.ep && state === 'play' ? 'flex' : 'none'; if (!POD.ep) return; $('podT').textContent = (POD.part === 'intro' ? 'Station ID · ' : '') + POD.ep.title; $('podPP').textContent = POD.playing ? '❚❚' : '▶'; }
setInterval(() => { if (POD.ep && POD.el) $('podTime').textContent = podFmt(POD.el.currentTime) + ' / ' + podFmt(POD.el.duration); podBar.style.display = POD.ep && state === 'play' ? 'flex' : 'none'; }, 500);
// the pod: list of unlocked episodes (O on PC, Journal → Podcast on the tablet)
function openPodcast() { if (!podHasRadio()) { toast('NO RADIO', 'Finish your first job for Captain Vega', 2); return; } const L = podList(); openDlg('Nebula 88.8', L.length ? 'Shows you can tune in to' : 'Nothing on air yet');
  $('dlgLine').textContent = L.length ? 'The music stops while a show plays. Cutscenes pause it, and it remembers where you stopped.' : 'New shows come on air as the story moves on.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  for (const ep of L) { const r = document.createElement('div'); r.className = 'rowi nodot'; const on = POD.ep === ep, at = S.podPos && S.podPos[ep.id];
    r.innerHTML = `<span><b></b></span><span class="meta">${on && POD.playing ? 'Playing' : at ? 'Resume at ' + podFmt(at) : ''}</span>`; r.querySelector('b').textContent = ep.title;
    const b = document.createElement('button'); b.className = 'pbtn go'; b.style.cssText = 'padding:4px 10px;min-width:0'; b.textContent = on && POD.playing ? 'Pause' : 'Play';
    b.addEventListener('click', () => { SFX.ui(); if (on && POD.playing) podPause(); else if (on) podResume(); else { if (POD.ep) podPause(); podStart(ep); } openPodcast(); });
    const sp = document.createElement('span'); sp.appendChild(b); r.appendChild(sp); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['Close', closeDlg]]); }
window.addEventListener('keydown', e => { if (e.code === 'KeyO' && !e.repeat && state === 'play' && !dlgOpen && !(typeof chatOpen === 'function' && chatOpen())) openPodcast(); });
{ const b = document.createElement('button'); b.className = 'hbtn win'; b.id = 'podBtn'; b.textContent = 'Radio'; b.addEventListener('click', () => { if (!dlgOpen) openPodcast(); }); $('menuDrop').appendChild(b); }
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
