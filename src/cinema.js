// =================== CINEMA: a small cutscene engine, the Starlight Lounge intro, and replays in the Codex ===================
// runCutscene({ shots: [{ text, dur, cam(t, k) }], lock, music, onEnd, replay })
function runCutscene(opt) {
  if (CUT.on) return; CUT.on = true;
  const prevState = state === 'cut' ? 'play' : state; setState('cut'); $('hud').hidden = true; $('touch').hidden = true; vm.visible = false;
  const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:40;pointer-events:none';
  ov.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:11vh;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:11vh;background:#000"></div><div class="cc" style="position:absolute;left:6%;right:6%;bottom:13vh;text-align:center;color:#fff;font:600 clamp(15px,3.6vw,24px) var(--hud,sans-serif);line-height:1.35;text-shadow:0 2px 8px #000;opacity:0;transition:opacity .6s"></div>' + (opt.title ? `<div class="ct" style="position:absolute;left:0;right:0;top:38%;text-align:center;color:#ffe08a;font:700 clamp(28px,7vw,58px) var(--hud,sans-serif);letter-spacing:.16em;text-shadow:0 4px 16px #000;opacity:0;transition:opacity 1.4s">${opt.title}</div>` : '');
  const skip = document.createElement('button'); skip.className = 'pbtn'; skip.textContent = 'Skip ▸'; skip.style.cssText = 'position:fixed;right:16px;bottom:calc(11vh + 14px);z-index:41;pointer-events:auto;opacity:0;transition:opacity .6s;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.5);color:#fff'; skip.hidden = true;
  document.body.append(ov, skip);
  const cap = ov.querySelector('.cc'), ttl = ov.querySelector('.ct'); if (ttl) { setTimeout(() => { ttl.style.opacity = 1; setTimeout(() => { ttl.style.opacity = 0; }, 2400); }, 300); }
  if (opt.music) musForce(opt.music);
  let si = -1, s0 = performance.now(), done = false; const t0 = performance.now(), lock = opt.lock == null ? 8 : opt.lock;
  const end = () => { if (done) return; done = true; window.__cutscene_done = true; const cd = document.createElement('div'); cd.id = 'cutscene_done'; document.body.appendChild(cd); if (opt.music) musRelease(opt.music); ov.remove(); skip.remove(); CUT.on = false; setState(prevState); vm.visible = true; if (opt.onEnd) opt.onEnd(); };
  skip.addEventListener('click', end);
  const next = () => { si++; if (si >= opt.shots.length) return end(); s0 = performance.now(); const sh = opt.shots[si]; cap.style.opacity = 0; if (sh.text) setTimeout(() => { if (!done) { cap.textContent = sh.text; cap.style.opacity = 1; } }, 300); };
  next();
  const tick = () => { if (done) return; const el = (performance.now() - t0) / 1000, st = (performance.now() - s0) / 1000, sh = opt.shots[si];
    if (el > lock && skip.hidden) { skip.hidden = false; requestAnimationFrame(() => { skip.style.opacity = 1; }); }
    sh.cam(st, Math.min(1, st / sh.dur)); if (st > sh.dur) next(); if (!done) requestAnimationFrame(tick); };
  tick();
}
// ---- the Starlight Lounge, the first time you walk in ----
function loungeIntro(replay) {
  const prez = () => npcObjs.prez && npcObjs.prez.obj.position, dj = V(0, 1.8, 22.4);
  runCutscene({ title: 'STARLIGHT LOUNGE', music: 'lounge', lock: 6, shots: [
    { text: 'Deck five of the Zeltac Ship. The one place in the galaxy where nobody is at war.', dur: 7, cam: (t, k) => { camera.position.set(-12 + k * 6, 4.5 - k * 1.5, 18 - k * 4); camera.lookAt(0, 1, 6); } },
    { text: 'DJ Nova has been playing the same four songs for nine years. Nobody has complained.', dur: 6, cam: (t, k) => { camera.position.set(2.5 - k * 5, 2.2, 17 + k * 1.5); camera.lookAt(dj.x, dj.y, dj.z); } },
    { text: 'The floor lights up. The lasers never stop. The drinks are blue and legally beverages.', dur: 6, cam: (t, k) => { const a = t * 0.35; camera.position.set(Math.cos(a) * 7, 1.6, 6.5 + Math.sin(a) * 7); camera.lookAt(0, 1.2, 6.5); } },
    { text: 'And in the middle of it all...', dur: 4, cam: (t, k) => { const p = prez() || V(1.5, 0, 6.5); camera.position.set(p.x + 5 - k * 2.5, 1.8, p.z - 4 + k * 1.5); camera.lookAt(p.x, 1.4, p.z); } },
    { text: '...the President of the New United States. Off duty. Very off duty.', dur: 6, cam: (t, k) => { const p = prez() || V(1.5, 0, 6.5); camera.position.set(p.x + 1.6, 1.75, p.z - 2.2); camera.lookAt(p.x, 1.6, p.z); } },
  ], onEnd: () => { if (!replay) { S.flags = S.flags || {}; S.flags.loungeIntro = 1; markDirty(); } player.pos.set(22, 0, 20); player.yaw = -Math.PI / 2; } });
}
{ const _gf = goFloor; goFloor = function (n) { const r = _gf(n); if (zTheme(n) === 'bar' && !(S.flags && S.flags.loungeIntro)) setTimeout(() => { if (LEVEL.id === 'zfloor' && zTheme(ZF.floor) === 'bar' && state === 'play') loungeIntro(); }, 900); return r; }; }
// ---- Codex → Cinema: every scene you've unlocked, replayable ----
const SCENES = [
  ['prologue', '🎬 Prologue', () => true, () => { if (LEVEL.id !== 'ship') loadLevel('ship'); setTimeout(() => shipIntro(true), 400); }],
  ['lounge', '🪩 Starlight Lounge', () => !!(S.flags && S.flags.loungeIntro) || DEV_ALL, () => { if (!(LEVEL.id === 'zfloor' && zTheme(ZF.floor) === 'bar')) { const keep = S.flags.loungeIntro; S.flags.loungeIntro = 1; goFloor(ZLIST.indexOf('bar')); S.flags.loungeIntro = keep; } setTimeout(() => loungeIntro(true), 600); }],
  ['ending', '🌅 The Ending', () => qDone('w3') || DEV_ALL, () => rollCredits(true)],
];
function openCinema() {
  openDlg('Codex', 'Cinema'); $('dlgLine').textContent = 'Every cutscene you have seen, ready to replay.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  for (const [, label, ok, play] of SCENES) { const r = document.createElement('div'); r.className = 'rowi nodot'; const a = document.createElement('span'); a.innerHTML = ok() ? `<b>${label}</b>` : '<b style="color:var(--dim)">??? </b><small style="color:var(--dim)">Not seen yet</small>'; const b = document.createElement('span'); const c = document.createElement('span');
    if (ok()) { const bt = document.createElement('button'); bt.className = 'pbtn go'; bt.textContent = 'Play'; bt.addEventListener('click', () => { SFX.ui(); closeDlg(); cinemaPlay(play); }); c.appendChild(bt); } r.append(a, b, c); rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['Back to Codex', () => openCodex('ach')], ['Close', closeDlg, true]]);
}
{ const _oc = openCodex; openCodex = function (tab) { const r = _oc(tab); if (tab !== 'lore') { const a = $('dlgActs'), lore = [...a.children].find(b => b.textContent === 'Lore'); const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = '🎬 Cinema'; b.addEventListener('click', () => { SFX.ui(); openCinema(); }); a.insertBefore(b, lore || null); } return r; }; }
window.addEventListener('load', () => {
  const p = new URLSearchParams(window.location.search).get('cutscene');
  if (!p) return;
  setTimeout(() => {
    musUnlock();
    if (p === 'prologue') {
      if (LEVEL.id !== 'ship') loadLevel('ship');
      setTimeout(() => shipIntro(true), 500);
    } else if (p === 'lounge') {
      S.flags = S.flags || {}; S.flags.loungeIntro = 1;
      goFloor(ZLIST.indexOf('bar'));
      setTimeout(() => loungeIntro(true), 600);
    } else if (p === 'ending') {
      setTimeout(() => rollCredits(true), 500);
    }
  }, 600);
});


// replaying a scene from the Cinema puts you back where you were watching from, on the same world and floor
function cinemaPlay(play) {
  const home = { lvl: LEVEL.id, floor: LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' ? ZF.floor : null, at: { x: player.pos.x, z: player.pos.z, yaw: player.yaw }, y: player.pos.y };
  play(); let calm = 0, seenBusy = false, tries = 0;
  const busy = () => state !== 'play' || (typeof CUT !== 'undefined' && CUT.on) || !!document.getElementById('ending') || (typeof BTR !== 'undefined' && BTR.on);
  const tick = () => { if (++tries > 2400) return; if (busy()) { seenBusy = true; calm = 0; return setTimeout(tick, 500); } if (++calm < (seenBusy ? 2 : 8)) return setTimeout(tick, 500);
    const moved = LEVEL.id !== home.lvl || (home.floor != null && ZF.floor !== home.floor) || Math.hypot(player.pos.x - home.at.x, player.pos.z - home.at.z) > 2;
    if (!moved) return;
    if (home.floor != null) { if (LEVEL.id !== 'zfloor' || ZF.floor !== home.floor) goFloor(home.floor); setTimeout(() => { player.pos.set(home.at.x, home.y, home.at.z); player.yaw = home.at.yaw; }, 400); }
    else if (LEVEL.id !== home.lvl) loadLevel(home.lvl, { at: home.at });
    else { player.pos.set(home.at.x, home.y, home.at.z); player.yaw = home.at.yaw; } };
  setTimeout(tick, 1200);
}
