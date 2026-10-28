// =================== CAST VOICES: recorded lines from the voice actors, one mp3 per line_id (docs/voice_lines.csv) ===================
// Files live in voice/cast/<line_id>.mp3 with voice/cast/index.json listing what's there (the Cast Voices page in the admin app writes both).
// Whenever a line shows in a dialogue box, a cutscene caption or B.U.R.P.'s speech and a recording exists, the recording plays.
// No index.json (the published build today) means nothing changes.
const CAST_LINES = {};
const CASTVO = { radio: new Set(), have: new Set(), v: 0, t: 0, buf: new Map(), src: null, last: '', lastT: 0 };
const castNorm = t => String(t || '').replace(/\s+/g, ' ').trim().replace(/^["“”]+|["“”]+$/g, '').trim();
const castId = t => { const id = CAST_LINES[burpHash(castNorm(t))]; return id && CASTVO.have.has(id) ? id : null; };
function castLoad() { if (performance.now() - CASTVO.t < 8000) return; CASTVO.t = performance.now();
  fetch('voice/cast/index.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).then(j => { if (!j || !Array.isArray(j.ids)) return; if (j.v !== CASTVO.v) CASTVO.buf.clear(); CASTVO.v = j.v; CASTVO.have = new Set(j.ids); CASTVO.radio = new Set(j.radio || []); }).catch(() => {}); }
// helmet radio: a light comms filter (telephone band, a little bite, faint static, a soft squelch at each end). Same code in cast.html and src/castvo.js
function radioPlay(ac, buf, dest, vol) {
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300; hp.Q.value = 0.7;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = 0.8;
  const pk = ac.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1800; pk.gain.value = 4; pk.Q.value = 1;
  const sh = ac.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(x * 2.2) / Math.tanh(2.2); } sh.curve = cv;
  const wet = ac.createGain(), dry = ac.createGain(), out = ac.createGain(); wet.gain.value = 0.85; dry.gain.value = 0.18; out.gain.value = vol;
  const s = ac.createBufferSource(); s.buffer = buf; s.connect(hp); hp.connect(lp); lp.connect(pk); pk.connect(sh); sh.connect(wet); s.connect(dry); wet.connect(out); dry.connect(out); out.connect(dest);
  const t0 = ac.currentTime + 0.06, end = t0 + buf.duration, nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const nz = ac.createBufferSource(); nz.buffer = nb; nz.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.6; const ng = ac.createGain(); ng.gain.value = 0;
  nz.connect(bp); bp.connect(ng); ng.connect(out);
  const g = ng.gain; g.setValueAtTime(0, ac.currentTime); g.linearRampToValueAtTime(0.09, ac.currentTime + 0.01); g.linearRampToValueAtTime(0.012, t0); g.setValueAtTime(0.012, end); g.linearRampToValueAtTime(0.08, end + 0.02); g.linearRampToValueAtTime(0, end + 0.1);
  nz.start(); nz.stop(end + 0.12); s.start(t0); s.onended = () => { try { nz.stop(); } catch (_) {} };
  return s; }
function castStop() { try { if (CASTVO.src) CASTVO.src.stop(); } catch (_) {} CASTVO.src = null; }
function castPlay(id) { const ac = SFX.ctx && SFX.ctx(); if (!ac || !PREFS.voice || !PREFS.sfx) return false;
  const now = performance.now(); if (id === CASTVO.last && now - CASTVO.lastT < 1500) return true; CASTVO.last = id; CASTVO.lastT = now; castStop();
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (_) {} try { if (typeof burpSrc !== 'undefined' && burpSrc) burpSrc.stop(); } catch (_) {}
  const go = buf => { if (CASTVO.last !== id) return; if (ac.state !== 'running') { try { ac.resume(); } catch (_) {} } if (CASTVO.radio.has(id)) { CASTVO.src = radioPlay(ac, buf, SFX.voiceOut(), 1.5); return; } const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = buf; g.gain.value = 1.4; s.connect(g); g.connect(SFX.voiceOut()); s.start(); CASTVO.src = s; };
  const b = CASTVO.buf.get(id); if (b) { go(b); return true; }
  fetch('voice/cast/' + id + '.mp3?v=' + CASTVO.v).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a)).then(buf => { CASTVO.buf.set(id, buf); if (performance.now() - now < 5000) go(buf); }).catch(() => {});
  return true; }
function castSay(t) { const id = castId(t); if (id) return castPlay(id); castStop(); CASTVO.last = ''; return false; }
castLoad();
// dialogue boxes
{ const el = $('dlgLine'); if (el) new MutationObserver(() => { if (dlgOpen) { castLoad(); castSay(el.textContent); } }).observe(el, { childList: true, characterData: true, subtree: true }); }
{ const _c = closeDlg; closeDlg = function () { castStop(); CASTVO.last = ''; return _c.apply(this, arguments); }; }
// the gibberish babble steps aside when a real recording is about to play
{ const _b = SFX.babble; SFX.babble = function () { const el = $('dlgLine'); if (el && dlgOpen && castId(el.textContent)) return; return _b.apply(this, arguments); }; }
// cutscene captions (the overlay is added to <body> when a cutscene starts)
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { const cc = n.querySelector && n.querySelector('.cc'); if (cc) { castLoad(); new MutationObserver(() => castSay(cc.textContent)).observe(cc, { childList: true, characterData: true, subtree: true }); } } }).observe(document.body, { childList: true });
// B.U.R.P.: a cast recording wins over his voice packs and the browser voice
{ const _bs = burpSay; burpSay = function (text) { const id = castId(typeof scr === 'function' ? scr(text) : text) || castId(text); if (id && castPlay(id)) return; return _bs.apply(this, arguments); }; }
