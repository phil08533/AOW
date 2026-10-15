// =================== B.U.R.P.'s real voice ===================
// Every B.U.R.P. line is a recorded clip (a British voice run through a robot filter), named by a hash of the line.
// Lines without a clip, or a phone that can't load it, fall back to the old browser speech.
const burpHash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const burpVoBuf = new Map(); let burpSrc = null;
{ const _bs = burpSay; burpSay = function (text) {
  const id = burpHash(text), ac = SFX.ctx && SFX.ctx();
  const pack = typeof voicePack === 'function' ? voicePack() : 'burp', have = (typeof BURP_VO_PACKS !== 'undefined' && BURP_VO_PACKS[pack]) || BURP_VO, key = pack + ':' + id;
  if (!have.has(id) || !ac || !PREFS.voice || !PREFS.sfx) return _bs(text);
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (_) {}
  const play = buf => { try { if (burpSrc) burpSrc.stop(); } catch (_) {} if (ac.state !== 'running') { try { ac.resume(); } catch (_) {} }
    const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = buf; g.gain.value = 1.5; s.connect(g); g.connect(SFX.voiceOut()); s.start(); burpSrc = s;
    if (Math.random() < 0.25) s.onended = () => { if (burpSrc === s) SFX.burp(); }; };
  const b = burpVoBuf.get(key); if (b) { play(b); return; }
  const t0 = performance.now(); // a clip that took too long to arrive is kept for next time, not played late
  fetch('voice/' + pack + '/' + id + '.mp3').then(r => { if (!r.ok) throw new Error('no clip'); return r.arrayBuffer(); })
    .then(a => ac.decodeAudioData(a)).then(buf => { burpVoBuf.set(key, buf); if (performance.now() - t0 < 6000) play(buf); }).catch(() => _bs(text));
}; }
