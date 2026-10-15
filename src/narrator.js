// =================== NARRATOR (2.14.3): Vega reads every cutscene caption out loud ===================
// Clips live in voice/narrator/<burpHash of the caption>.mp3 (made with tools/voicegen.py, the same voice as the opening film).
// A caption with no clip just stays silent. Vega is the only voice in the cutscenes and on the Maw battle radio.
const NARR = { a: null };
const narrIds = () => (typeof BURP_VO_PACKS !== 'undefined' && BURP_VO_PACKS.narrator) || new Set();
function narrStop() { if (NARR.a) { try { NARR.a.pause(); } catch (_) {} NARR.a = null; } }
function narrSay(text, onDur) {
  if (!text || PREFS.voice === false || !PREFS.sfx) return null; const id = burpHash(text); if (!narrIds().has(id)) return null;
  narrStop(); const a = new Audio('voice/narrator/' + id + '.mp3'); a.volume = 1; NARR.a = a;
  if (onDur) a.addEventListener('loadedmetadata', () => { if (isFinite(a.duration)) onDur(a.duration); });
  a.play().then(() => { if (MUS.cur) musFade(MUS.cur, musVol() * 0.45, 0.4); a.onended = () => { if (NARR.a === a && MUS.cur) musFade(MUS.cur, musVol(), 0.9); }; }).catch(() => {});
  return a;
}
// runCutscene: speak each shot's caption as the shot starts, and hold the shot until she has finished
{ const _rc = runCutscene; runCutscene = function (opt) {
  if (opt && opt.shots && !CUT.on) opt.shots.forEach(sh => { if (!sh.text || !sh.cam) return; const cam = sh.cam; let said = false;
    let a = null; const d0 = sh.dur;
    sh.cam = function (t, k) { if (!said) { said = true; a = narrSay(sh.text, d => { sh.dur = Math.max(sh.dur, d + 0.7); }); }
      if (a && NARR.a === a && !a.paused && !a.ended && t < d0 + 15) sh.dur = Math.max(sh.dur, t + 0.4); // still talking: hold the shot
      return cam.apply(this, arguments); }; });
  const wasOn = CUT.on, r = _rc.apply(this, arguments);
  if (!wasOn && CUT.on) { const iv = setInterval(() => { if (!CUT.on) { clearInterval(iv); narrStop(); if (MUS.cur) musFade(MUS.cur, musVol(), 0.6); } }, 300); }
  return r; }; }
// the ending's captions
{ const _rc = rollCredits; rollCredits = function () { const r = _rc.apply(this, arguments); const ov = document.getElementById('ending'); if (!ov) return r;
  let last = ''; const iv = setInterval(() => { const e = document.getElementById('ending'); if (!e) { clearInterval(iv); narrStop(); return; } const c = e.querySelector('.cap, #endCap') || null; const txt = c ? c.textContent : ''; if (txt && txt !== last && +getComputedStyle(c).opacity > 0.2) { last = txt; narrSay(txt); } }, 200);
  return r; }; }
