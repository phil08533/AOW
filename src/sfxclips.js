// =================== RECORDED SOUNDS (2.23.63): room ambience loops, the pee clip, the Mile Down laugh, the Maw's charge ===================
// Loops sit on top of the synth ambience beds and fade in and out by where you stand (1.2 s crossfades).
// Files live in sfx/ next to the game; each is loudness-matched and its loop seam is crossfaded when encoded.
const CLIP = { buf: {}, wait: {} };
function clipCtx() { const c = SFX._ctx && SFX._ctx(); return c || null; }
function clipLoad(name) { const c = clipCtx(); if (!c) return Promise.resolve(null); if (CLIP.buf[name]) return Promise.resolve(CLIP.buf[name]);
  if (!CLIP.wait[name]) CLIP.wait[name] = fetch('sfx/' + name + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(a => new Promise((ok, no) => c.ac.decodeAudioData(a, ok, no))).then(b => (CLIP.buf[name] = b)).catch(e => { console.warn('clip', name, e); return null; });
  return CLIP.wait[name]; }
// a one-shot through the sound-effects bus; resolves to { src, g } so callers can fade it
function clipPlay(name, vol = 1, at = 0) { if (!PREFS.sfx) return Promise.resolve(null); return clipLoad(name).then(b => { const c = clipCtx(); if (!b || !c) return null;
  const src = c.ac.createBufferSource(), g = c.ac.createGain(); src.buffer = b; g.gain.value = vol; src.connect(g); g.connect(c.master); src.start(c.ac.currentTime + 0.01, at); return { src, g, ac: c.ac }; }); }
function clipFade(h, sec) { if (!h) return; try { const t = h.ac.currentTime; h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + sec); h.src.stop(t + sec + 0.05); } catch (_) {} }

// ---- room ambience: which recording plays where ----
const zfTheme = () => LEVEL && LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' ? zTheme(ZF.floor) : null;
const AMBREC = [
  { f: 'amb/restaurant', v: 0.5, on: () => LEVEL.id === 'zeltac' && player.pos.x > 125 },                                   // inside McKlunkies
  { f: 'amb/foodfest', v: 0.42, on: () => LEVEL.id === 'zeltac' && player.pos.x <= 125 },                                   // the mall, first floor
  { f: 'amb/party', v: 0.5, on: () => zfTheme() === 'under' && !(player.pos.x < -16 && player.pos.z > 12) },                // the Undercroft bar
  { f: 'amb/muffled', v: 0.62, on: () => zfTheme() === 'under' && player.pos.x < -16 && player.pos.z > 12 },               // its members-only back room
  { f: 'amb/chatter', v: 0.45, on: () => LEVEL.id === 'underworld' },                                                      // Grub's Bar
  { f: 'amb/park', v: 0.42, on: () => LEVEL.id === 'earth' && Math.hypot(player.pos.x - TOWN.x, player.pos.z - TOWN.z) < (typeof JT_R !== 'undefined' ? JT_R : 44) + 6 && player.pos.y < 6 }, // New Jamestown, outdoors
  { f: 'amb/arcade', v: 0.5, on: () => zfTheme() === 'arcade' }                                                            // the Neon Arcade
];
const AR = { live: {} };
function ambRecTick() { const c = clipCtx(); if (!c || !AMB.g) return; const t = c.ac.currentTime, out = AMB.g;
  for (const R of AMBREC) { let want = 0; try { want = (state === 'play' || state === 'cut') && LEVEL && R.on() ? R.v : 0; } catch (_) {}
    let L = AR.live[R.f];
    if (want > 0 && !L) { if (CLIP.buf[R.f]) { const src = c.ac.createBufferSource(), g = c.ac.createGain(); src.buffer = CLIP.buf[R.f]; src.loop = true; g.gain.value = 0; src.connect(g); g.connect(out);
        src.start(t + 0.02, Math.random() * Math.max(0, CLIP.buf[R.f].duration - 1)); L = AR.live[R.f] = { src, g, w: -1, idle: 0 }; } else clipLoad(R.f); }
    if (!L) continue;
    if (want !== L.w) { L.w = want; L.g.gain.cancelScheduledValues(t); L.g.gain.setValueAtTime(L.g.gain.value, t); L.g.gain.linearRampToValueAtTime(want, t + 1.2); }
    L.idle = want > 0 ? 0 : L.idle + 1; if (L.idle > 20) { try { L.src.stop(); L.g.disconnect(); } catch (_) {} delete AR.live[R.f]; } } }
setInterval(() => { try { ambRecTick(); } catch (e) { console.warn('ambrec', e); } }, 200);

// ---- the pee clip: the stream starts 3 s in, so the yellow arc waits for it ----
{ const _po = peeOn; peeOn = function (x, z, name, lines, after) { if (PEE.on) return; if (!PREFS.sfx) return _po(x, z, name, lines, after);
    PEE.on = 1; PEE.clip = 1; player.yaw = Math.atan2(-(x - player.pos.x), -(z - player.pos.z)); player.pitch = -0.75; vm.visible = false; toast('💦', '*zzzip*', 1.6);
    const h = clipPlay('pee', 1); const go = () => { PEE.on = 0; _po(x, z, name, lines, () => { PEE.clip = 0; h.then(v => clipFade(v, 0.5)); if (after) after(); else toast('RELIEVED', name + ' will wake up smelling like a decision you made.', 2.6); }); };
    h.then(v => setTimeout(go, v ? 3000 : 0)); }; }

// ---- the Mile Down: the whole bar loses it on the last line ----
function mdLaugh() { clipPlay('laugh', 0.9); }

// ---- the Greater Maw, phase 2: the charge-up clip, a held breath, then a deep guttural blast (synth) ----
function mawCharge() { clipLoad('mawcharge'); return clipPlay('mawcharge', 1); }
function mawGutBlast() { const c = clipCtx(); if (!c || !PREFS.sfx) return; const ac = c.ac, t = ac.currentTime + 0.01, out = ac.createGain(); out.gain.value = 1; out.connect(c.master);
  const sh = ac.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(x * 3.2); } sh.curve = cv; sh.connect(out);
  // the growl: two detuned saws sliding down through a throaty band-pass that opens and closes
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.4; bp.frequency.setValueAtTime(420, t); bp.frequency.exponentialRampToValueAtTime(140, t + 2.6); bp.connect(sh);
  const wob = ac.createOscillator(), wg = ac.createGain(); wob.frequency.value = 7; wg.gain.value = 90; wob.connect(wg); wg.connect(bp.frequency); wob.start(t); wob.stop(t + 3);
  for (const [f, d] of [[62, 0], [64.5, 0.3]]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(24, t + 2.8); o.detune.value = d * 100;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.9); o.connect(g); g.connect(bp); o.start(t); o.stop(t + 3); }
  // the sub punch underneath
  { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(22, t + 1.6); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2); o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.3); }
  // the blast itself: a wash of low noise that rolls off into the dark
  { const n = ac.sampleRate * 3, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let br = 0; for (let i = 0; i < n; i++) { br = 0.97 * br + 0.03 * (Math.random() * 2 - 1); d[i] = br * 6; }
    const s = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(80, t + 2.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 3); s.connect(lp); lp.connect(g); g.connect(sh); s.start(t); } }
