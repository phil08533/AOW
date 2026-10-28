// =================== AMBIENCE (2.13.9): a sound bed for every place, built live on the game's audio engine ===================
// Each place gets layers: a filtered-noise bed (wind, surf, rain, vents, crowd wash) that swells slowly, an optional low hum
// (engines, machines, the Maw), and little one-shots on timers (birds, drips, creaks, beeps, distant thunder, crowd murmur).
// Nothing is a sound file. It sits under the music on its own volume (Settings → Sound → Ambience) and crossfades between places.
const AMB_PROFILES = {
  ship: { bed: [['lowpass', 380, 0.7, 0.05, 0.05, 0.4]], hum: [[55, 0.05], [110, 0.012]], ev: [['beep', 6, 14, 0.5], ['creak', 10, 24, 0.6], ['vent', 12, 22, 0.6]] },
  space: { bed: [['lowpass', 170, 0.7, 0.05, 0.06, 0.25]], hum: [[41, 0.03]], ev: [['beep', 8, 18, 0.4]] },
  maw: { bed: [['lowpass', 120, 1, 0.08, 0.04, 0.6]], hum: [[28, 0.06], [42.5, 0.03]], ev: [['groan', 5, 11, 1], ['creak', 8, 16, 0.5]] },
  earth: { bed: [['lowpass', 650, 0.6, 0.05, 0.1, 0.8]], ev: [['chirp', 2.5, 8, 0.7], ['chirp', 4, 11, 0.5]] },
  forestlife: { bed: [['lowpass', 700, 0.6, 0.04, 0.1, 0.8]], ev: [['chirp', 1.5, 5, 0.8], ['trill', 3, 9, 0.6], ['chirp', 3, 8, 0.5]] },
  swift: { bed: [['bandpass', 750, 0.6, 0.05, 0.06, 0.6]], ev: [['murmur', 1, 3, 0.8], ['cheer', 14, 30, 0.6]] },
  mezar: { bed: [['bandpass', 480, 0.6, 0.08, 0.15, 1]], ev: [['howl', 9, 18, 0.8]] },
  capitone: { bed: [['lowpass', 900, 0.5, 0.07, 0.12, 0.9]], ev: [['howl', 10, 20, 0.6], ['creak', 8, 16, 0.4]] },
  ocean: { bed: [['lowpass', 380, 0.7, 0.1, 0.12, 0.6]], ev: [['gull', 7, 16, 0.6], ['drip', 4, 10, 0.4]] },
  moon: { bed: [['lowpass', 140, 0.7, 0.02, 0.05, 0.2]], hum: [[38, 0.012]], ev: [['beep', 14, 30, 0.3]] },
  underworld: { bed: [['lowpass', 260, 0.7, 0.03, 0.04, 0.4]], hum: [[60, 0.012], [120, 0.004]], ev: [['clank', 10, 22, 0.6]] },
  apt: { bed: [['lowpass', 300, 0.7, 0.02, 0.04, 0.4]], hum: [[60, 0.008]], ev: [['creak', 14, 30, 0.4], ['murmur', 9, 20, 0.3]] },
  robot: { bed: [['bandpass', 1100, 0.8, 0.02, 0.05, 0.5]], hum: [[50, 0.03], [75, 0.01]], ev: [['beep', 2, 5, 0.6], ['clank', 5, 12, 0.7], ['vent', 8, 16, 0.5]] },
  zeltac: { bed: [['bandpass', 620, 0.7, 0.05, 0.08, 0.5]], hum: [[70, 0.012]], ev: [['murmur', 0.8, 2.5, 0.9], ['beep', 6, 12, 0.5], ['murmur', 1.5, 4, 0.6]] },
  zfloor: { bed: [['bandpass', 600, 0.7, 0.035, 0.06, 0.5]], hum: [[66, 0.012]], ev: [['murmur', 1.5, 4, 0.7], ['beep', 7, 14, 0.4]] },
  arena: { bed: [['bandpass', 800, 0.6, 0.06, 0.08, 0.6]], ev: [['murmur', 0.7, 2, 0.9], ['cheer', 10, 22, 0.8]] },
  crucible: { bed: [['bandpass', 700, 0.6, 0.05, 0.08, 0.6]], hum: [[45, 0.02]], ev: [['murmur', 1, 3, 0.7], ['clank', 6, 14, 0.6]] },
  fort: { bed: [['lowpass', 500, 0.6, 0.04, 0.08, 0.6]], hum: [[45, 0.02]], ev: [['clank', 4, 10, 0.7], ['beep', 7, 15, 0.4]] },
  skycity: { bed: [['lowpass', 1200, 0.5, 0.06, 0.15, 1]], ev: [['chirp', 3, 9, 0.6], ['howl', 14, 26, 0.4]] },
  zarlich: { bed: [['lowpass', 800, 0.6, 0.07, 0.15, 1]], ev: [['thunder', 10, 22, 1], ['howl', 9, 18, 0.5], ['trill', 5, 12, 0.4]] },
  vector: { bed: [['lowpass', 300, 0.8, 0.05, 0.08, 0.6]], hum: [[33, 0.035]], ev: [['groan', 9, 18, 0.6], ['howl', 12, 24, 0.4]] },
  boarding: { bed: [['lowpass', 380, 0.7, 0.04, 0.05, 0.4]], hum: [[52, 0.04]], ev: [['beep', 2.5, 6, 0.6], ['clank', 6, 14, 0.6]] },
  speedway: { bed: [['bandpass', 700, 0.6, 0.035, 0.06, 0.5]], ev: [['murmur', 1.5, 4, 0.6], ['cheer', 16, 30, 0.5]] },
  jamestown: { bed: [['lowpass', 600, 0.6, 0.04, 0.1, 0.8]], ev: [['chirp', 3, 9, 0.6], ['creak', 10, 20, 0.4]] },
  theatre: { bed: [['lowpass', 240, 0.7, 0.03, 0.04, 0.3]], hum: [[60, 0.012]], ev: [['creak', 10, 24, 0.4], ['murmur', 6, 16, 0.4]] },
  indoor: { bed: [['lowpass', 300, 0.7, 0.025, 0.04, 0.4]], hum: [[60, 0.01]], ev: [['creak', 12, 26, 0.4]] },
  outdoor: { bed: [['lowpass', 650, 0.6, 0.045, 0.1, 0.8]], ev: [['chirp', 4, 11, 0.5]] }
};
// weather adds its own layer on top
const AMB_WEATHER = { rain: ['highpass', 2600, 0.5, 0.035], acid: ['highpass', 2200, 0.6, 0.03], snow: ['lowpass', 1500, 0.4, 0.015], sand: ['bandpass', 1800, 0.7, 0.02] };
const AMB = { on: null, cur: null, g: null, nb: null, evT: [], vol: 1 };
function ambKey() { if (!LEVEL) return null; return LEVEL.fly && LEVEL.id !== 'maw' ? 'space' : LEVEL.id; }
function ambProfile(id) { return AMB_PROFILES[id] || (LEVEL && (LEVEL.indoor || LEVEL.sky === 'space') ? AMB_PROFILES.indoor : AMB_PROFILES.outdoor); }
function ambCtx() { const c = SFX._ctx && SFX._ctx(); if (!c) return null;
  if (!AMB.g) { AMB.g = c.ac.createGain(); AMB.g.gain.value = 0; AMB.g.connect(c.master);
    const len = c.ac.sampleRate * 3, nb = c.ac.createBuffer(1, len, c.ac.sampleRate), d = nb.getChannelData(0); let b = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b = 0.985 * b + 0.15 * w; d[i] = w * 0.55 + b * 0.45; } AMB.nb = nb; }
  return c.ac; }
function ambStart(key) {
  const ac = ambCtx(); if (!ac) return; ambStop();
  const P = ambProfile(key), out = ac.createGain(), t = ac.currentTime, nodes = []; out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(1, t + 2.5); out.connect(AMB.g);
  const bed = ([type, f, q, vol, depth, rate]) => { const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    s.buffer = AMB.nb; s.loop = true; s.loopStart = Math.random(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = vol;
    lfo.frequency.value = 0.04 + Math.random() * 0.05 * (rate || 0.5); lg.gain.value = depth * vol * 4; lfo.connect(lg); lg.connect(g.gain);
    const lfo2 = ac.createOscillator(), lg2 = ac.createGain(); lfo2.frequency.value = 0.07 + Math.random() * 0.05; lg2.gain.value = f * 0.25 * (rate || 0.5); lfo2.connect(lg2); lg2.connect(fl.frequency);
    s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random() * 2); lfo.start(t); lfo2.start(t); nodes.push(s, lfo, lfo2); };
  (P.bed || []).forEach(bed);
  const w = LEVEL && AMB_WEATHER[LEVEL.weather]; if (w && !LEVEL.indoor && !(LEVEL.fly)) bed([w[0], w[1], w[2], w[3] * Math.max(0.2, (PREFS.weatherVol == null ? 0.7 : PREFS.weatherVol) / 0.7), 0.02, 0.3]);
  for (const [f, vol] of P.hum || []) { const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = vol; lfo.frequency.value = 0.1 + Math.random() * 0.15; lg.gain.value = vol * 0.35; lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(out); o.start(t); lfo.start(t); nodes.push(o, lfo); }
  AMB.cur = { key, out, nodes, ev: (P.ev || []).map(e => ({ e, t: e[1] * (0.3 + Math.random() * 0.7) })) };
}
function ambStop() { const C = AMB.cur; if (!C) return; AMB.cur = null; const ac = ambCtx(); if (!ac) return; const t = ac.currentTime;
  try { C.out.gain.cancelScheduledValues(t); C.out.gain.setValueAtTime(C.out.gain.value, t); C.out.gain.linearRampToValueAtTime(0, t + 1.8); } catch (_) {}
  setTimeout(() => { for (const n of C.nodes) try { n.stop(); } catch (_) {} try { C.out.disconnect(); } catch (_) {} }, 2200); }
// one-shots: tiny synth gestures, randomised so they never repeat exactly
function ambShot(kind, vol) { const ac = ambCtx(), C = AMB.cur; if (!ac || !C) return; const t = ac.currentTime + 0.02, out = C.out, pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
  const dest = pan ? (pan.pan.value = Math.random() * 1.6 - 0.8, pan.connect(out), pan) : out;
  const osc = (type, f0, f1, dur, v, at) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t + at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + at + dur);
    g.gain.setValueAtTime(0.0001, t + at); g.gain.linearRampToValueAtTime(v * vol, t + at + Math.min(0.03, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur); o.connect(g); g.connect(dest); o.start(t + at); o.stop(t + at + dur + 0.05); };
  const nz = (type, f, q, dur, v, at, att) => { const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = AMB.nb; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t + at); g.gain.linearRampToValueAtTime(v * vol, t + at + (att || 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t + at, Math.random() * 2); s.stop(t + at + dur + 0.1); return fl; };
  const r = (a, b) => a + Math.random() * (b - a);
  if (kind === 'chirp') { const f = r(2600, 4200), n = 2 + (Math.random() * 4 | 0); for (let i = 0; i < n; i++) osc('sine', f * r(0.9, 1.1), f * r(1.2, 1.5), 0.07, 0.03, i * r(0.09, 0.14)); }
  else if (kind === 'trill') { const f = r(4000, 5500); for (let i = 0; i < 10; i++) osc('sine', f, f * 1.05, 0.03, 0.015, i * 0.045); }
  else if (kind === 'gull') { const f = r(900, 1300); for (let i = 0; i < 3; i++) osc('triangle', f * 1.4, f * 0.8, 0.22, 0.03, i * 0.28); }
  else if (kind === 'drip') { const f = r(900, 1600); osc('sine', f, f * 2.2, 0.06, 0.05, 0); osc('sine', f * 0.6, f * 0.9, 0.12, 0.015, 0.05); }
  else if (kind === 'creak') { const f = r(70, 140), o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * r(1.3, 1.8), t + 0.7); fl.type = 'bandpass'; fl.frequency.value = 600; fl.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025 * vol, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); o.connect(fl); fl.connect(g); g.connect(dest); o.start(t); o.stop(t + 1); }
  else if (kind === 'beep') { const f = [880, 1175, 1320, 990][Math.random() * 4 | 0]; osc('square', f, 0, 0.05, 0.008, 0); if (Math.random() < 0.6) osc('square', f * 1.25, 0, 0.05, 0.007, 0.09); }
  else if (kind === 'vent') nz('bandpass', r(900, 1600), 1.2, 1.6, 0.03, 0, 0.5);
  else if (kind === 'clank') { const f = r(180, 320); osc('triangle', f, f * 0.98, 0.5, 0.03, 0); osc('square', f * 2.7, 0, 0.2, 0.008, 0); nz('highpass', 2500, 0.7, 0.08, 0.03, 0); }
  else if (kind === 'howl') { const fl = nz('bandpass', r(350, 600), 6, 3.2, 0.05, 0, 1.2); fl.frequency.setValueAtTime(r(350, 500), t); fl.frequency.linearRampToValueAtTime(r(600, 900), t + 1.6); fl.frequency.linearRampToValueAtTime(r(300, 450), t + 3.2); }
  else if (kind === 'thunder') { nz('lowpass', 160, 0.7, 4, 0.16, 0, 0.08); nz('lowpass', 90, 0.7, 5, 0.12, 0.3, 0.6); }
  else if (kind === 'groan') { const f = r(36, 55), o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.7, t + 2.4); fl.type = 'lowpass'; fl.frequency.value = 220;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07 * vol, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); o.connect(fl); fl.connect(g); g.connect(dest); o.start(t); o.stop(t + 2.7); }
  else if (kind === 'murmur') { const n = 3 + (Math.random() * 4 | 0), f0 = r(350, 900); for (let i = 0; i < n; i++) { const fl = nz('bandpass', f0 * r(0.8, 1.3), 5, r(0.12, 0.25), 0.03, i * r(0.12, 0.2), 0.03); fl.frequency.setValueAtTime(f0 * r(0.8, 1.3), t + i * 0.15); } }
  else if (kind === 'cheer') nz('bandpass', r(900, 1300), 0.8, 2.6, 0.05, 0, 0.7);
}
// Settings → Sound: an Ambience slider (default 60%)
{ const anchor = $('setVoice') && $('setVoice').previousElementSibling; if (anchor) { const l = document.createElement('span'); l.textContent = 'Ambience';
  const w = document.createElement('span'); w.style.cssText = 'display:flex;align-items:center;gap:8px'; w.innerHTML = '<input type="range" min="0" max="100" id="setAmb" style="width:130px;accent-color:#8fe3ff"><span id="setAmbVal" style="font-family:var(--mono,monospace);min-width:3ch"></span>';
  anchor.before(l, w); SET_OF.setAmb = 'snd';
  const sl = $('setAmb'); sl.addEventListener('input', e => { PREFS.amb = +e.target.value; $('setAmbVal').textContent = PREFS.amb + '%'; savePrefs(); }); sl.addEventListener('keydown', e => e.stopPropagation()); } }
{ const _rs = renderSettings; renderSettings = function () { _rs(); const v = typeof PREFS.amb === 'number' ? PREFS.amb : 60; if ($('setAmb')) $('setAmb').value = v; if ($('setAmbVal')) $('setAmbVal').textContent = v + '%'; }; }
renderSettings(); try { showSetTab(setTab); } catch (_) {}
{ const _st = step; step = function (dt) { _st(dt);
  try { const ac = ambCtx(); if (!ac) return;
    const key = state === 'menu' ? null : ambKey(); if (key !== AMB.on) { AMB.on = key; if (key) ambStart(key); else ambStop(); }
    // fade with the master setting; duck while paused, in a cutscene, or with the tab hidden
    const v = (typeof PREFS.amb === 'number' ? PREFS.amb : 60) / 100, want = document.hidden || state === 'pause' || state === 'menu' ? 0 : v * (typeof CUT !== 'undefined' && CUT.on ? 0.55 : 1);
    if (Math.abs(want - AMB.vol) > 0.005 || AMB.g.gain.value === 0 && want > 0) { AMB.vol = want; AMB.g.gain.setTargetAtTime(want * 1.6, ac.currentTime, 0.4); }
    const C = AMB.cur; if (C && want > 0) for (const E of C.ev) { E.t -= dt; if (E.t <= 0) { const [kind, a, b, vol] = E.e; E.t = a + Math.random() * (b - a); ambShot(kind, vol); } }
  } catch (e) { console.warn('ambience', e); } }; }
