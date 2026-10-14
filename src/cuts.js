// ---------------- story scenes on/off (2.12.1) ----------------
// With scenes off, every first-time intro (ship, worlds, lounge) skips itself the moment it starts. Replays from the Codex still play.
if (PREFS.cuts == null) PREFS.cuts = true;
let cutsReplayT = -1e9;
function autoSkipCut() {
  if (PREFS.cuts !== false || performance.now() - cutsReplayT < 2000) return; let n = 0;
  const go = () => { const b = [...document.querySelectorAll('body > button')].find(b => /^Skip/.test(b.textContent.trim())); if (b) b.click(); else if (n++ < 12) requestAnimationFrame(go); };
  requestAnimationFrame(go);
}
{ const _rc = runCutscene; runCutscene = function (opt) { const r = _rc.apply(this, arguments); if (!(opt && opt.replay)) autoSkipCut(); return r; }; }
{ const _si = shipIntro; shipIntro = function (replay) { const r = _si.apply(this, arguments); if (!replay) autoSkipCut(); return r; }; }
{ const _oc = openCinema; openCinema = function () { const r = _oc.apply(this, arguments); const rows = $('shopRows'); if (rows) rows.addEventListener('click', e => { if (e.target.closest('button')) cutsReplayT = performance.now(); }, true); return r; }; }
{ const anchor = $('setMusic').previousElementSibling, l = document.createElement('span'), b = document.createElement('button');
  l.textContent = 'Story scenes'; b.className = 'pbtn'; b.id = 'setCuts';
  b.addEventListener('click', () => { PREFS.cuts = PREFS.cuts === false; savePrefs(); renderSettings(); SFX.ui(); }); anchor.before(l, b);
  const _rs = renderSettings; renderSettings = function () { _rs(); $('setCuts').textContent = PREFS.cuts === false ? 'Skip' : 'Play'; }; renderSettings(); }
