// =================== SCRIPT STUDIO (2.13.13): Phil's edits to B.U.R.P.'s lines, cutscene captions and battle radio, plus voice packs ===================
// The lines in the code are the defaults. SCRIPT (built from src/script.json, edited in the admin app's Script Studio) layers on top:
//   SCRIPT.burp[kind] = the full list of lines for that trigger, replacing the default list
//   SCRIPT.say[hash]  = new words for one line, keyed by burpHash() of the line as written in the code
//   SCRIPT.voice      = the voice packs (voice/<pack>/<hash>.mp3) and which one plays by default
const BURP_DEFAULT = {}; for (const k in BURP) BURP_DEFAULT[k] = BURP[k].slice(); if (typeof BURP_MORE !== 'undefined' && BURP_MORE.trailer) BURP_DEFAULT.trailer = BURP_MORE.trailer.slice();
for (const k in (SCRIPT.burp || {})) { const L = SCRIPT.burp[k]; if (!Array.isArray(L)) continue; if (k === 'trailer') { if (typeof BURP_MORE !== 'undefined') BURP_MORE.trailer = L.slice(); } else BURP[k] = L.slice(); }
function scr(t) { if (typeof t !== 'string' || !SCRIPT.say) return t; const n = SCRIPT.say[burpHash(t)]; return typeof n === 'string' && n.trim() ? n : t; }
{ const _bs = burpSay; burpSay = function (text) { return _bs.call(this, scr(text)); }; }
if (typeof mawComms === 'function') { const _mc = mawComms; mawComms = function (who, line, dur) { return _mc.call(this, who, scr(line), dur); }; }
if (typeof mawBurp === 'function') { const _mb = mawBurp; mawBurp = function (line, dur) { return _mb.call(this, scr(line), dur); }; }
{ const _rc = runCutscene; runCutscene = function (opt) { try { if (opt && opt.shots) opt.shots.forEach(s => { if (s && typeof s.text === 'string') s.text = scr(s.text); }); } catch (_) {} return _rc.apply(this, arguments); }; }
// ---- voice packs: Settings → Sound → B.U.R.P. voice ----
const voicePacks = () => (SCRIPT.voice && SCRIPT.voice.packs) || { burp: { name: 'B.U.R.P.' } };
function voicePack() { const P = voicePacks(), want = PREFS.vpack || (SCRIPT.voice && SCRIPT.voice.active) || 'burp'; return P[want] ? want : 'burp'; }
{ const anchor = $('setVoice') && $('setVoice').previousElementSibling, P = voicePacks(); if (anchor && Object.keys(P).length > 1) { const l = document.createElement('span'); l.textContent = 'B.U.R.P. voice';
  const sel = document.createElement('select'); sel.id = 'setVpack'; sel.className = 'pbtn'; sel.style.cssText = 'max-width:200px'; for (const id in P) { const o = document.createElement('option'); o.value = id; o.textContent = P[id].name || id; sel.appendChild(o); }
  sel.addEventListener('change', () => { PREFS.vpack = sel.value; savePrefs(); try { burpVoBuf.clear(); } catch (_) {} burpSay('Voice check. This is how I sound now.'); });
  anchor.before(l, sel); if (typeof SET_OF !== 'undefined') SET_OF.setVpack = 'snd'; } }
{ const _rs = renderSettings; renderSettings = function () { _rs(); if ($('setVpack')) $('setVpack').value = voicePack(); }; }
