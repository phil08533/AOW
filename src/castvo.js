// =================== CAST VOICES: recorded lines from the voice actors, one mp3 per line_id (docs/voice_lines.csv) ===================
// Files live in voice/cast/<line_id>.mp3 with voice/cast/index.json listing what's there (the Cast Voices page in the admin app writes both).
// Whenever a line shows in a dialogue box, a cutscene caption or B.U.R.P.'s speech and a recording exists, the recording plays.
// No index.json (the published build today) means nothing changes.
const CAST_LINES = {};
const VOICE_CREDITS = []; // filled by build.py from docs/voice_credits.json (Cast Voices → Voice actor)
const CASTVO = { radio: new Map(), have: new Set(), v: 0, t: 0, buf: new Map(), src: null, last: '', lastT: 0 };
const castNorm = t => String(t || '').replace(/\s+/g, ' ').trim().replace(/^["“”]+|["“”]+$/g, '').trim();
// lines Phil rewrote in Cast Voices (SCRIPT.say, keyed by the original line's hash): the new words show in dialogue boxes and still find their recording
const CAST_ALIAS = {}; { const say = (typeof SCRIPT !== 'undefined' && SCRIPT.say) || {}; for (const h in say) if (CAST_LINES[h] && typeof say[h] === 'string' && say[h].trim()) CAST_ALIAS[burpHash(castNorm(say[h]))] = CAST_LINES[h]; }
const castEdit = t => { const say = (typeof SCRIPT !== 'undefined' && SCRIPT.say) || {}, n = say[burpHash(castNorm(t))]; if (typeof n !== 'string' || !n.trim()) return null; const m = /^(\s*["\u201c]?)[\s\S]*?(["\u201d]?\s*)$/.exec(t); return (m ? m[1] : '') + n + (m ? m[2] : ''); };
const castId = t => { const h = burpHash(castNorm(t)), id = CAST_LINES[h] || CAST_ALIAS[h]; return id && CASTVO.have.has(id) ? id : null; };
function castLoad() { if (performance.now() - CASTVO.t < 8000) return; CASTVO.t = performance.now();
  fetch('voice/cast/index.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).then(j => { if (!j || !Array.isArray(j.ids)) return; if (j.v !== CASTVO.v) CASTVO.buf.clear(); CASTVO.v = j.v; CASTVO.have = new Set(j.ids); CASTVO.radio = new Map(Array.isArray(j.radio) ? j.radio.map(id => [id, ['helmet', 1]]) : Object.entries(j.radio || {})); }).catch(() => {}); }
// helmet radio presets (same code in cast.html and src/castvo.js). amt is the strength slider: 0 = clean, 1 = the preset, up to 1.5 = extra crunchy
const RADIO_FX = {
  helmet: { name: 'Helmet (light)', hp: 300, lp: 3600, pf: 1800, pg: 4, drive: 2.2, stat: 0.012, sq: 0.08, dry: 0.18, box: 0 },
  comms: { name: 'Clean comms', hp: 250, lp: 5200, pf: 2500, pg: 2, drive: 1.3, stat: 0.004, sq: 0.05, dry: 0.3, box: 0 },
  visor: { name: 'Closed visor', hp: 180, lp: 3000, pf: 900, pg: 3, drive: 1.6, stat: 0.005, sq: 0.04, dry: 0.25, box: 0.28 },
  oldradio: { name: 'Old radio', hp: 500, lp: 2800, pf: 1500, pg: 6, drive: 4, stat: 0.03, sq: 0.12, dry: 0.05, box: 0 },
  longrange: { name: 'Long range', hp: 650, lp: 2400, pf: 1600, pg: 7, drive: 5.5, stat: 0.05, sq: 0.15, dry: 0, box: 0 },
  robot: { name: 'Robot speaker', hp: 350, lp: 4200, pf: 1200, pg: 5, drive: 3, stat: 0.006, sq: 0.03, dry: 0.15, box: 0.45 }
};
function radioPlay(ac, buf, dest, vol, preset, amt) {
  const P = RADIO_FX[preset] || RADIO_FX.helmet, k = Math.max(0, Math.min(1.5, amt == null ? 1 : amt)), mix = Math.min(1, k);
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 20 + (P.hp - 20) * mix; hp.Q.value = 0.7;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 16000 - (16000 - P.lp) * mix; lp.Q.value = 0.8;
  const pk = ac.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = P.pf; pk.gain.value = P.pg * k; pk.Q.value = 1;
  const dr = 1 + (P.drive - 1) * k, sh = ac.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(x * dr) / Math.tanh(dr); } sh.curve = cv;
  const wet = ac.createGain(), dry = ac.createGain(), out = ac.createGain(); wet.gain.value = 0.85 * mix + 0.0; dry.gain.value = 1 - mix * (1 - P.dry); out.gain.value = vol;
  const s = ac.createBufferSource(); s.buffer = buf; s.connect(hp); hp.connect(lp); lp.connect(pk); pk.connect(sh); sh.connect(wet); s.connect(dry); wet.connect(out); dry.connect(out); out.connect(dest);
  if (P.box) { const d = ac.createDelay(0.1), fb = ac.createGain(), bg = ac.createGain(); d.delayTime.value = 0.011; fb.gain.value = P.box * mix; bg.gain.value = 0.5 * mix; sh.connect(d); d.connect(fb); fb.connect(d); d.connect(bg); bg.connect(out); }
  const t0 = ac.currentTime + 0.06, end = t0 + buf.duration, nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const nz = ac.createBufferSource(); nz.buffer = nb; nz.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.6; const ng = ac.createGain(); ng.gain.value = 0;
  nz.connect(bp); bp.connect(ng); ng.connect(out); const st = P.stat * k, sq = P.sq * k;
  const g = ng.gain; g.setValueAtTime(0, ac.currentTime); g.linearRampToValueAtTime(sq, ac.currentTime + 0.01); g.linearRampToValueAtTime(st, t0); g.setValueAtTime(st, end); g.linearRampToValueAtTime(sq, end + 0.02); g.linearRampToValueAtTime(0, end + 0.1);
  nz.start(); nz.stop(end + 0.12); s.start(t0); s.onended = () => { try { nz.stop(); } catch (_) {} };
  return s; }
function castStop() { try { if (CASTVO.src) CASTVO.src.stop(); } catch (_) {} CASTVO.src = null; try { TALK.speak = null; } catch (_) {} castGate(0); }
// a recorded line in a dialogue box: the words wait for the audio to start, and the options wait for it to finish (click the words or press Space to skip ahead)
function castGate(mode, dur) { const d = $('dlg'); clearTimeout(CASTVO.gt); if (!d) return; d.classList.toggle('vo-wait', mode === 1); d.classList.toggle('vo-play', mode === 2);
  if (mode === 1) CASTVO.gt = setTimeout(() => castGate(0), 1800); else if (mode === 2) CASTVO.gt = setTimeout(() => castGate(0), dur * 1000 + 250); }
function castFetch(id) { const ac = SFX.ctx && SFX.ctx(); if (!ac || CASTVO.buf.has(id)) return Promise.resolve(CASTVO.buf.get(id)); if (CASTVO.pf && CASTVO.pf.has(id)) return CASTVO.pf.get(id); CASTVO.pf = CASTVO.pf || new Map();
  const pr = fetch('voice/cast/' + id + '.mp3?v=' + CASTVO.v).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a)).then(buf => { CASTVO.buf.set(id, buf); CASTVO.pf.delete(id); return buf; }, e => { CASTVO.pf.delete(id); throw e; }); CASTVO.pf.set(id, pr); return pr; }
function castPlay(id) { const ac = SFX.ctx && SFX.ctx(); if (!ac || !PREFS.voice || !PREFS.sfx) return false;
  const now = performance.now(); if (id === CASTVO.last && now - CASTVO.lastT < 1500) return true; CASTVO.last = id; CASTVO.lastT = now; castStop();
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (_) {} try { if (typeof burpSrc !== 'undefined' && burpSrc) burpSrc.stop(); } catch (_) {}
  const fromDlg = dlgOpen && !$('dlg').hidden; if (fromDlg) castGate(1);
  const go = buf => { if (CASTVO.last !== id) return; if (fromDlg) castGate(2, buf.duration + (CASTVO.radio.get(id) ? 0.06 : 0)); if (ac.state !== 'running') { try { ac.resume(); } catch (_) {} } const rf = CASTVO.radio.get(id); try { TALK.speak = { env: buf._env || (buf._env = talkEnv(buf)), t0: ac.currentTime + (rf ? 0.06 : 0), dur: buf.duration }; } catch (_) {} if (rf) { CASTVO.src = radioPlay(ac, buf, SFX.voiceOut(), 1.5, rf[0], rf[1]); return; } const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = buf; g.gain.value = 1.4; s.connect(g); g.connect(SFX.voiceOut()); s.start(); CASTVO.src = s; };
  const b = CASTVO.buf.get(id); if (b) { go(b); return true; }
  castFetch(id).then(buf => { if (buf && performance.now() - now < 5000) go(buf); else if (fromDlg) castGate(0); }).catch(() => { if (fromDlg) castGate(0); });
  return true; }
function castSay(t) { const id = castId(t); if (id) return castPlay(id); castStop(); CASTVO.last = ''; return false; }
castLoad();
// dialogue boxes
{ const el = $('dlgLine'); if (el) new MutationObserver(() => { const e = castEdit(el.textContent); if (e && e !== el.textContent) { el.textContent = e; return; } if (dlgOpen) { castLoad(); castSay(el.textContent); } }).observe(el, { childList: true, characterData: true, subtree: true }); }
{ const _c = closeDlg; closeDlg = function () { castStop(); CASTVO.last = ''; return _c.apply(this, arguments); }; }
// a conversation's next lines load while the first one plays, so each starts on time
{ const _s = say; say = function (lines) { try { castLoad(); (lines || []).forEach(t => { const id = castId(typeof t === 'string' ? t : ''); if (id) castFetch(id).catch(() => {}); }); } catch (_) {} return _s.apply(this, arguments); }; }
{ const skip = () => { const d = $('dlg'); if (d && d.classList.contains('vo-play')) { castGate(0); const f = $('dlgActs').querySelector('.pbtn:not(:disabled)'); if (f && !TOUCH) f.focus(); return true; } return false; };
  $('dlgLine').addEventListener('click', skip); window.addEventListener('keydown', e => { if (!dlgOpen || !/^(Space|Enter|NumpadEnter|Digit[1-9])$/.test(e.code)) return; const d = $('dlg'); if (d.classList.contains('vo-wait') || skip()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  const st = document.createElement('style'); st.textContent = '#dlg.vo-wait .line { visibility: hidden; } #dlg.vo-wait .acts, #dlg.vo-play .acts { visibility: hidden; } #dlg.vo-play .line { cursor: pointer; }'; document.head.appendChild(st); }
// the gibberish babble steps aside when a real recording is about to play
{ const _b = SFX.babble; SFX.babble = function () { const el = $('dlgLine'); if (el && dlgOpen && castId(el.textContent)) return; return _b.apply(this, arguments); }; }
// cutscene captions (the overlay is added to <body> when a cutscene starts)
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { const cc = n.querySelector && n.querySelector('.cc'); if (cc) { castLoad(); new MutationObserver(() => castSay(cc.textContent)).observe(cc, { childList: true, characterData: true, subtree: true }); } } }).observe(document.body, { childList: true });
// B.U.R.P.: a cast recording wins over his voice packs and the browser voice
{ const _bs = burpSay; burpSay = function (text) { const id = castId(typeof scr === 'function' ? scr(text) : text) || castId(text); if (id && castPlay(id)) return; return _bs.apply(this, arguments); }; }

// ---- voice cast in the credits: the end roll gets a Voices section, the Codex credits tab lists each actor with a link to reach them ----
const vcEsc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const vcHref = c => { c = String(c || '').trim(); if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return 'mailto:' + c; if (/^https?:\/\/\S+$/i.test(c)) return c; if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(c)) return 'https://' + c; return null; };
function voiceCreditLines() { if (!VOICE_CREDITS.length) return []; return ['<b style="color:#ffd36a">Voices</b>', ...VOICE_CREDITS.map(e => `${vcEsc(e.name)} <span style="opacity:.7">as ${vcEsc(e.roles.join(', '))}</span>${e.contact ? `<br><small style="opacity:.6">${vcEsc(e.contact)}</small>` : ''}`), '<br>']; }
{ const _o = openCodex; openCodex = function (tab) { const r = _o.apply(this, arguments); try { const rows = tab === 'credits' && VOICE_CREDITS.length && $('shopRows'); if (rows) {
  const hd = document.createElement('div'); hd.className = 'rowi nodot'; hd.innerHTML = '<b>Voices</b><span></span>'; rows.appendChild(hd);
  for (const e of VOICE_CREDITS) { const d = document.createElement('div'); d.className = 'rowi nodot'; const b = document.createElement('b'); b.textContent = e.name; const sp = document.createElement('span'); sp.textContent = e.roles.join(', '); d.append(b, sp);
    const h = vcHref(e.contact); if (h) { const a = document.createElement('a'); a.href = h; a.target = '_blank'; a.rel = 'noopener'; a.className = 'pbtn'; a.textContent = /^mailto:/.test(h) ? 'Email' : 'Website'; a.title = e.contact; a.style.textDecoration = 'none'; a.addEventListener('click', ev => ev.stopPropagation()); d.appendChild(a); } rows.appendChild(d); }
  if (typeof pageRows === 'function') pageRows(); } } catch (e) { console.warn('voice credits', e); } return r; }; }
