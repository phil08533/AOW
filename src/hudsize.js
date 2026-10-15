// =================== HUD SIZE, COMPACT TRACKER AND FULLSCREEN ===================
if (PREFS.hudSize == null) PREFS.hudSize = TOUCH ? 1 : 2;
if (PREFS.compact == null) PREFS.compact = false;
const HUD_SIZES = [['Small', 0.72], ['Medium', 0.86], ['Large', 1]];
{ const st = document.createElement('style'); st.id = 'hudsizecss'; document.body.appendChild(st); }
function applyHudSize() {
  const z = HUD_SIZES[PREFS.hudSize][1];
  $('hudsizecss').textContent = `#hud > *:not(#toast):not(#zone):not(#menuDrop):not(.hudbtns), #hud .hudbtns > *:not(#menuDrop), #touch > * { zoom: ${z}; }
  ${PREFS.compact ? '#quest ul, #quest .ch, #clock, #online { display: none !important; } #log > :not(.chat) { display: none !important; } #ctape { opacity: .75; }' : ''}`;
}
applyHudSize();
{ const anchor = $('setMusic').previousElementSibling; const mk = (label, id, fn) => { const l = document.createElement('span'); l.textContent = label; const b = document.createElement('button'); b.className = 'pbtn'; b.id = id; b.addEventListener('click', () => { fn(); savePrefs(); applyHudSize(); renderSettings(); SFX.ui(); }); anchor.before(l, b); };
  mk('HUD size', 'setHud', () => { PREFS.hudSize = (PREFS.hudSize + 1) % HUD_SIZES.length; });
  mk('Quest tracker', 'setCompact', () => { PREFS.compact = !PREFS.compact; });
  mk('Fullscreen', 'setFull', () => goFullscreen()); }
{ const _rs = renderSettings; renderSettings = function () { _rs(); $('setHud').textContent = HUD_SIZES[PREFS.hudSize][0]; $('setCompact').textContent = PREFS.compact ? 'Compact' : 'Full'; $('setFull').textContent = document.fullscreenElement ? 'Exit' : 'Go fullscreen'; }; }
renderSettings();
function goFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen; if (!req) { toast('FULLSCREEN', 'Not supported in this browser', 2.5); return; }
  try { const p = req.call(el, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => toast('FULLSCREEN', 'Blocked here. Open the game link in your phone browser instead.', 3.5)); } catch (_) { toast('FULLSCREEN', 'Blocked here. Open the game link in your phone browser instead.', 3.5); }
}
// a fullscreen tile in the menu drawer too
{ const drop = $('menuDrop'), ref = $('unstuckBtn'); const b = document.createElement('button'); b.className = ref.className; b.id = 'fullBtn'; b.textContent = 'Fullscreen'; b.addEventListener('click', () => { drop.hidden = true; document.body.classList.remove('menuopen'); goFullscreen(); }); drop.insertBefore(b, ref);
  const st = document.createElement('style'); st.textContent = '#fullBtn::before { content: "⛶"; }'; document.body.appendChild(st); }
