// =================== SOUNDTRACK: real music per place and moment, with clean crossfades ===================
const TRACKS = { awzil: 'music/awzil.mp3', hymn: 'music/hymn.mp3', wistful: 'music/wistful.mp3', mushroom: 'music/mushroom.mp3', nebula: 'music/nebula.mp3', neon: 'music/neon.mp3', wakeup: 'music/wakeup.mp3', dancing: 'music/dancing.mp3', apocalyptic: 'music/apocalyptic.mp3', enchanted: 'music/enchanted.mp3', low: 'music/low.mp3', overture: 'music/overture.mp3', tidal: 'music/tidal.mp3', iloveyou: 'music/iloveyou.mp3', c4po: 'music/c4po.mp3', glinky: 'music/glinky.mp3', clarinet: 'music/clarinet.mp3' };
const PLAYLISTS = { undercroft: ['awzil'], cutscene: ['hymn'], romance: ['iloveyou'], boss: ['apocalyptic'], battle: ['low'], lounge: ['nebula', 'neon', 'wakeup', 'dancing'], ship: ['mushroom', 'hymn', 'wistful'], earth: ['enchanted'], speedway: ['overture'], fort: ['tidal'], other: ['c4po'], cantina: ['glinky', 'clarinet'] };
MUSIC_NAMES[3] = 'Soundtrack';
if (!PREFS.musicV2) { PREFS.musicV2 = 1; PREFS.music = 3; if (PREFS.musicVol == null) PREFS.musicVol = 0.7; try { savePrefs(); } catch (_) {} }
if (PREFS.musicVol == null) PREFS.musicVol = 0.7;
const MUS = { a: null, b: null, cur: null, list: null, idx: 0, want: null, force: null, battleT: 0, calmT: 0, romT: 0, unlocked: false, fades: [] };
function musEl() { const e = new Audio(); e.preload = 'auto'; e.volume = 0; e.addEventListener('ended', () => { if (e === MUS.cur && MUS.list && PLAYLISTS[MUS.list].length > 1) { MUS.idx = (MUS.idx + 1) % PLAYLISTS[MUS.list].length; musStart(MUS.list, MUS.idx); } }); return e; }
const musVol = () => (PREFS.music === 3 || (MUS.force && PREFS.music)) ? Math.max(0, Math.min(1, PREFS.musicVol * (MUS.ac ? 1 : (MUS.spaceK || 1)))) * (typeof POD !== 'undefined' && POD.playing ? 0 : 1) : 0;
function musFade(el, to, sec, then) { MUS.fades = MUS.fades.filter(f => f.el !== el); MUS.fades.push({ el, from: el.volume, to, t: 0, sec, then }); }
setInterval(() => { for (const f of MUS.fades.slice()) { f.t += 0.05; const k = Math.min(1, f.t / f.sec); f.el.volume = Math.max(0, Math.min(1, f.from + (f.to - f.from) * k)); if (k >= 1) { MUS.fades.splice(MUS.fades.indexOf(f), 1); if (f.then) f.then(); } } }, 50);
function musStart(list, idx) {
  if (!MUS.a) return; const key = PLAYLISTS[list][idx % PLAYLISTS[list].length];
  const next = MUS.cur === MUS.a ? MUS.b : MUS.a, old = MUS.cur;
  next.src = TRACKS[key]; next.loop = PLAYLISTS[list].length === 1; next.volume = 0; next.currentTime = 0;
  const p = next.play(); if (p && p.catch) p.catch(() => {});
  musFade(next, musVol(), 1.6); if (old && old !== next) musFade(old, 0, 1.6, () => { if (old !== MUS.cur) old.pause(); });
  MUS.cur = next; MUS.list = list; MUS.idx = idx;
}
function musPlay(list) { if (!MUS.a || list === MUS.list) return; const start = list === 'ship' ? Math.floor(Math.random() * PLAYLISTS.ship.length) : list === 'lounge' ? Math.floor(Math.random() * 4) : 0; musStart(list, start); }
function musStop() { for (const el of [MUS.a, MUS.b]) if (el) musFade(el, 0, 1.2, () => el.pause()); MUS.list = null; MUS.cur = null; }
function musUnlock() { if (MUS.unlocked) return; MUS.unlocked = true; MUS.a = musEl(); MUS.b = musEl();
  musTick(true); }
// in the lounge the music comes out of the DJ's speakers: louder near them, panned toward them, muffled far away
const LOUNGE_SPK = [[-3.2, 21.6], [3.2, 21.6]];
function musSpace() { if (!MUS.ac) return; const now = MUS.ac.currentTime, set = (p, v) => p.setTargetAtTime(v, now, 0.12);
  const SPK = MUS.list === 'lounge' && LEVEL.id === 'zfloor' ? LOUNGE_SPK : MUS.list === 'cantina' && LEVEL.id === 'underworld' && window.UW_SPK ? UW_SPK : MUS.list === 'undercroft' && LEVEL.id === 'zfloor' && window.UC_SPK ? UC_SPK : null;
  if (SPK) { let best = 1e9, sx = 0, sz = 0; for (const [x, z] of SPK) { const d = Math.hypot(player.pos.x - x, player.pos.z - z); if (d < best) best = d; sx += x / 2; sz += z / 2; }
    const dx = sx - player.pos.x, dz = sz - player.pos.z, dl = Math.hypot(dx, dz) || 1, right = [Math.cos(player.yaw), -Math.sin(player.yaw)], fwd = [-Math.sin(player.yaw), -Math.cos(player.yaw)];
    const p = (dx * right[0] + dz * right[1]) / dl, behind = (dx * fwd[0] + dz * fwd[1]) / dl < 0;
    const trip = (MUS.tripUntil || 0) > performance.now(); set(MUS.gn.gain, Math.max(0.3, Math.min(1.35, 1.6 / (1 + best / 9))) * (trip ? 1.3 : 1)); if (MUS.pan) set(MUS.pan.pan, Math.max(-0.85, Math.min(0.85, p * 0.85))); set(MUS.lp.frequency, trip ? 2600 + Math.sin(performance.now() / 380) * 1400 : Math.max(1800, 20000 - Math.max(0, best - 6) * 900) * (behind ? 0.7 : 1));
  } else { set(MUS.gn.gain, 1); if (MUS.pan) set(MUS.pan.pan, 0); set(MUS.lp.frequency, 20000); } }
setInterval(() => { try { musSpace(); } catch (_) {} }, 100);
// what should be playing right now?
function musContext(dt) {
  if (MUS.force) return MUS.force;
  if (state === 'menu') return null;
  // romance: talking to your love interest, or they're close by
  const love = id => { const M = romS()[id]; return M && (M.partner || romStage(M.aff) >= 3); };
  const rom = MUS.romDlg; // only while you're actually talking to them
  if (rom) return 'romance';
  // fights: a boss in the fight, or anything hunting you
  if (state === 'play' && !LEVEL.fly) {
    let boss = false, fight = false; for (const e of enemies) { if (e.dead || e.gone || !e.aggro) continue; const d = e.obj.position.distanceTo(player.pos); if (d > 40) continue; if (e.def.boss) boss = true; fight = true; }
    if (fight) { MUS.battleT += dt; MUS.calmT = 0; } else { MUS.calmT += dt; if (MUS.calmT > 6) MUS.battleT = 0; }
    if (boss && MUS.battleT > 0) return 'boss';
    if (MUS.battleT > 1.2 && !(inSafe(player.pos) && !(typeof raidNow === 'function' && raidNow().active && raidNow().world === LEVEL.id))) return 'battle';
  } else if (LEVEL.fly && fly && fly.raiders && fly.raiders.some(r => !r.dead && r.obj.position.distanceTo(player.pos) < 160)) return 'battle';
  const id = LEVEL.id;
  if (id === 'zfloor' && typeof ZF !== 'undefined' && zTheme(ZF.floor) === 'bar') return 'lounge';
  if (id === 'zfloor' && typeof ZF !== 'undefined' && zTheme(ZF.floor) === 'under') return 'undercroft';
  if (id === 'underworld') return 'cantina';
  if (id === 'ship') return 'ship';
  if (id === 'earth') return 'earth';
  if (id === 'speedway') return 'speedway';
  if (id === 'fort') return 'fort';
  return 'other';
}
let musLast = performance.now();
function musTick(now) { const t = performance.now(), dt = Math.min(1, (t - musLast) / 1000); musLast = t; if (!MUS.a) return;
  if (PREFS.music !== 3 && !(MUS.force && PREFS.music)) { if (MUS.list) musStop(); return; }
  const want = musContext(dt); if (!want) { if (MUS.list) musStop(); return; }
  if (want !== MUS.list) musPlay(want);
  if (MUS.cur && !MUS.fades.some(f => f.el === MUS.cur)) MUS.cur.volume = musVol();
}
setInterval(musTick, 250);
['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, () => { if (state !== 'menu' || ev === 'pointerdown') musUnlock(); }, { passive: true }));
$('playBtn').addEventListener('click', () => { musUnlock(); setTimeout(() => { if (LEVEL.id === 'ship' && state === 'play' && !(S.flags && (S.flags.prologue1 || S.flags.shipIntro))) shipIntro(); }, 900); });
{ const _or = openRomance; openRomance = function (...a) { MUS.romDlg = true; return _or.apply(this, a); }; }
{ const _cd = closeDlg; closeDlg = function () { MUS.romDlg = false; return _cd(); }; }
// ---- settings: Soundtrack / Ambient / Beep boop / Off, plus a volume slider ----
$('setMusic').addEventListener('click', e => { e.stopImmediatePropagation(); const order = [3, 1, 2, 0]; PREFS.music = order[(order.indexOf(PREFS.music) + 1) % order.length]; savePrefs(); SFX.setMusic(PREFS.music); renderSettings(); SFX.ui(); musTick(); }, true);
{ const row = $('setMusic'), lab = document.createElement('span'); lab.textContent = 'Music volume'; const wrap = document.createElement('span'); wrap.style.cssText = 'display:flex;align-items:center;gap:8px';
  const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = Math.round(PREFS.musicVol * 100); r.id = 'setMusicVol'; r.style.cssText = 'width:130px;accent-color:#8fe3ff'; const v = document.createElement('span'); v.style.cssText = 'font-family:var(--mono,monospace);min-width:3ch'; v.textContent = r.value;
  r.addEventListener('input', () => { PREFS.musicVol = r.value / 100; v.textContent = r.value; savePrefs(); SFX.setMusic(PREFS.music); musTick(); });
  r.addEventListener('keydown', e => e.stopPropagation()); wrap.append(r, v); row.after(lab, wrap); }

// =================== FIRST TIME ABOARD: a short film of your new ship ===================
const CUT = { on: false };
function shipIntro() {
  if (CUT.on) return; CUT.on = true; S.flags = S.flags || {};
  const prevState = state; setState('cut'); $('hud').hidden = true; $('touch').hidden = true; vm.visible = false;
  const ov = document.createElement('div'); ov.id = 'cutov'; ov.style.cssText = 'position:fixed;inset:0;z-index:40;pointer-events:none';
  ov.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:11vh;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:11vh;background:#000"></div><div id="cutcap" style="position:absolute;left:0;right:0;bottom:14vh;text-align:center;color:#fff;font:600 clamp(16px,3.8vw,26px) var(--hud,sans-serif);letter-spacing:.08em;text-shadow:0 2px 8px #000;opacity:0;transition:opacity 1.2s"></div>';
  const skip = document.createElement('button'); skip.className = 'pbtn'; skip.textContent = 'Skip ▸'; skip.style.cssText = 'position:fixed;right:16px;bottom:calc(11vh + 14px);z-index:41;pointer-events:auto;opacity:0;transition:opacity .6s;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.5);color:#fff'; skip.hidden = true;
  document.body.append(ov, skip);
  // set dressing for the exterior shots: your ship hanging in space beside the planet
  const ship = makeStarship(S.col); ship.scale.setScalar(2.2); ship.position.set(70, 18, -150); ship.rotation.y = -0.9; levelGroup.add(ship);
  const me = buildChar(() => makePlayerChar(myLook(), S.col), 'trooper'); me.position.set(0.6, 0, -13.7); me.rotation.y = Math.PI; levelGroup.add(me);
  const P = V(-10, -14, -95);
  const shots = [
    ['', t => { const a = 0.4 + t * 0.03; camera.position.set(70 + Math.cos(a) * 26, 26 + t * 0.3, -150 + Math.sin(a) * 26); camera.lookAt(70, 18, -150); }],
    ['THE SETTING SUN', t => { camera.position.set(110 - t * 2.2, 30, -110); camera.lookAt(ship.position.x - 10, 14, ship.position.z); }],
    ['', t => { camera.position.set(25 - t * 0.8, 8 + t * 0.4, -40 - t); camera.lookAt(P.x, P.y, P.z); }],
    ['Your ship. Your home.', t => { camera.position.set(2.6 - t * 0.05, 1.9, -9.5 - t * 0.05); camera.lookAt(0.2, 1.4, -15); }],
    ['', t => { camera.position.set(0, 1.65, -12.8); camera.lookAt(-6 + t * 0.8, -6 + Math.sin(t * 0.2) * 2, -95); }],
    ['Somewhere out there, the sun is still setting.', t => { const a = t * 0.04; camera.position.set(P.x + Math.cos(a) * 80, P.y + 30, P.z + Math.sin(a) * 80 + 40); camera.lookAt(P.x, P.y, P.z); }],
    ['', t => { camera.position.set(0.9 + Math.sin(t * 0.3) * 0.2, 1.75, -12.2); camera.lookAt(0, 1.4, -16); }],
  ];
  const SHOT = 9, MIN_LOCK = 12; let t0 = performance.now(), last = -1, done = false;
  const cap = ov.querySelector('#cutcap');
  musForce('cutscene');
  const end = () => { if (done) return; done = true; musRelease('cutscene'); levelGroup.remove(ship); levelGroup.remove(me); ov.remove(); skip.remove(); S.flags.shipIntro = 1; markDirty(); CUT.on = false; setState(prevState === 'cut' ? 'play' : prevState); player.pos.set(0, 0, -4); player.yaw = 0; vm.visible = true; toast('THE SETTING SUN', 'Welcome aboard, Captain', 3); };
  skip.addEventListener('click', end);
  const tick = () => { if (done) return; const el = (performance.now() - t0) / 1000, si = Math.floor(el / SHOT) % shots.length, lt = el - Math.floor(el / SHOT) * SHOT;
    if (si !== last) { last = si; cap.style.opacity = 0; if (shots[si][0]) setTimeout(() => { cap.textContent = shots[si][0]; cap.style.opacity = 1; }, 600); }
    shots[si][1](lt);
    if (el > MIN_LOCK && skip.hidden) { skip.hidden = false; requestAnimationFrame(() => { skip.style.opacity = 1; }); }
    const dur = MUS.cur && MUS.list === 'cutscene' && isFinite(MUS.cur.duration) ? MUS.cur.duration : 174;
    if (el > dur - 0.3 || (MUS.cur && MUS.list === 'cutscene' && MUS.cur.ended)) return end();
    requestAnimationFrame(tick); };
  tick();
}
PLAYLISTS.cutscene = ['hymn'];
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'ship' && state === 'play' && !(S.flags && (S.flags.prologue1 || S.flags.shipIntro))) setTimeout(() => { if (LEVEL.id === 'ship' && state === 'play' && !CUT.on) shipIntro(); }, 800); return r; }; }
// hymn shouldn't loop during the film
{ const _ms = musStart; musStart = function (list, idx) { _ms(list, idx); if (list === 'cutscene' && MUS.cur) MUS.cur.loop = false; }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { MUS.battleT = 0; MUS.calmT = 0; return _ll(id, o); }; }

// Watchdog: some browsers and embedded viewers hand us "protected" audio that comes out silent once routed through
// the speaker effects. If the song is playing but nothing comes out, rebuild the players without the effects.
{ let quiet = 0; setInterval(() => { if (!MUS.ac || !MUS.an || !MUS.cur || MUS.cur.paused || MUS.cur.volume < 0.05 || MUS.cur.currentTime < 1) { quiet = 0; return; }
  if (MUS.ac.state === 'suspended') { MUS.ac.resume && MUS.ac.resume(); return; }
  const d = new Uint8Array(MUS.an.fftSize); MUS.an.getByteTimeDomainData(d); let dev = 0; for (const v of d) dev = Math.max(dev, Math.abs(v - 128));
  if (dev <= 1) quiet++; else quiet = 0;
  if (quiet >= 6) { quiet = 0; const list = MUS.list, idx = MUS.idx, t = MUS.cur.currentTime; for (const el of [MUS.a, MUS.b]) { el.pause(); el.src = ''; } try { MUS.ac.close(); } catch (_) {} MUS.ac = null; MUS.an = null; MUS.fz = null;
    MUS.a = musEl(); MUS.b = musEl(); MUS.cur = null; MUS.list = null; if (list) { musStart(list, idx); try { MUS.cur.currentTime = t; } catch (_) {} } } }, 500); }
// without the effects chain, the speakers still work through plain volume
{ const _sp = musSpace; musSpace = function () { if (MUS.ac) return _sp(); let k = 1;
  if (MUS.list === 'lounge' && LEVEL.id === 'zfloor') { let best = 1e9; for (const [x, z] of LOUNGE_SPK) best = Math.min(best, Math.hypot(player.pos.x - x, player.pos.z - z)); k = Math.max(0.35, Math.min(1, 1.5 / (1 + best / 9))) * ((MUS.tripUntil || 0) > performance.now() ? 1.3 : 1); }
  else if (LEVEL.id === 'ship' && typeof SHIP_SPK !== 'undefined' && SHIP_SPK.length && ['ship', 'drive'].includes(MUS.list)) { let best = 1e9; for (const [x, z] of SHIP_SPK) best = Math.min(best, Math.hypot(player.pos.x - x, player.pos.z - z)); k = Math.max(0.45, Math.min(1, 1.3 / (1 + best / 7))); }
  MUS.spaceK = k; if (MUS.cur && !MUS.fades.some(f => f.el === MUS.cur)) MUS.cur.volume = musVol(); }; }
// the end credits play the heavenly hymn, then hand the music back when they close
{ const _rc = rollCredits; rollCredits = function (...a) { const r = _rc.apply(this, a);
  { musForce('cutscene'); const iv = setInterval(() => { if (!document.getElementById('ending')) { clearInterval(iv); musRelease('cutscene'); } }, 400); }
  return r; }; }
