// =================== HOT GUNS (2.22.52): energy and beam guns use their charge even with the Unlimited Clip, and vent steam when they reload ===================
// A noisy hiss, shared: steam vents ("tssshh"), and anything else that needs a spray sound.
function sfxHiss(dur, vol, freq) { if (!PREFS.sfx) return; try { if (!window.__hissAc) window.__hissAc = new (window.AudioContext || window.webkitAudioContext)(); const ac = window.__hissAc, t = ac.currentTime;
  const n = ac.createBufferSource(), b = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1; n.buffer = b;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq || 5200, t); f.frequency.exponentialRampToValueAtTime((freq || 5200) * 0.55, t + dur); f.Q.value = 0.7;
  const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.35, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t); n.stop(t + dur); } catch (_) {} }
const gunHot = g => !!g && !g.mana && (!!g.beam || ['energy', 'charge'].includes(ammoUnit(g)));
// the Unlimited Clip still covers bullets, shells, bolts and rockets; energy guns run on their charge and have to cool down
{ const _f = fire; fire = function () { const g = gun(); if (!S.clip || handMelee() || !gunHot(g)) return _f.apply(this, arguments); S.clip = false; try { return _f.apply(this, arguments); } finally { S.clip = true; } }; }
{ const _r = reload; reload = function () { const g = gun(), hot = !handMelee() && gunHot(g), was = player.reloading; let r; if (S.clip && hot) { S.clip = false; try { r = _r.apply(this, arguments); } finally { S.clip = true; } } else r = _r.apply(this, arguments);
    if (hot && was <= 0 && player.reloading > 0) gunVent(g); return r; }; }
// the vent: a "tssshh" and white steam pouring off the gun for the length of the reload
function gunVent(g) { sfxHiss(Math.min(1.4, (g.reload || 1) * 0.8), 0.32, 5600); setTimeout(() => sfxHiss(0.5, 0.18, 3800), 380);
  const t0 = performance.now(), dur = Math.max(600, (g.reload || 1) * 900), d = V(0, 0, 0), r = V(0, 0, 0);
  const puff = () => { if (performance.now() - t0 > dur || state !== 'play') return; requestAnimationFrame(puff); if (Math.random() < 0.35) return;
    const o = camera.getWorldPosition(V(0, 0, 0)); camera.getWorldDirection(d); r.crossVectors(d, V(0, 1, 0)).normalize();
    const p = o.addScaledVector(d, 0.7).addScaledVector(r, 0.28 + Math.random() * 0.1); p.y -= 0.18; try { burst(p, Math.random() < 0.5 ? '#f4f8ff' : '#cfd8e8', 5, 1.3); } catch (_) {} };
  puff(); }
// HUD: the Unlimited Clip shows ∞ on guns it covers, and phones lose the Reload button (guns reload on their own when they run dry)
{ const _u = updateHud; updateHud = function () { _u(); if (LEVEL.fly) return; const g = GUNS[S.gun];
    if (S.clip && g && !handMelee() && !g.mana && !gunHot(g) && player.reloading <= 0) { const el = $('ammoN'), h = `∞<small> ${ammoUnit(g)}</small>`; if (el.innerHTML !== h) el.innerHTML = h; }
    const rb = $('tReload'); if (rb && TOUCH) rb.style.display = handMelee() ? '' : 'none'; }; }
// an empty hot gun reloads by itself the moment you let go of the trigger
setInterval(() => { try { if (state === 'play' && !LEVEL.fly && !handMelee() && gunHot(gun()) && player.ammo <= 0 && player.reloading <= 0) reload(); } catch (_) {} }, 250);
