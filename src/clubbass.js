// =================== CLUB BASS: the Starlight Lounge thumps like a real club ===================
// Each lounge song has a bass-only twin (music/bass/*.mp3, low-passed and compressed offline). It plays in sync
// under the song, loudest by the DJ's speakers and on the dance floor, so the low end fills the room.
// (Routing the music itself through Web Audio broke playback on some browsers, so this stays two plain audio elements.)
const CLUB = { el: null, name: null, lag: 0.025 };
setInterval(() => { try {
  const on = PREFS.music && MUS.cur && !MUS.cur.paused && MUS.list === 'lounge' && LEVEL && LEVEL.id === 'zfloor' && state !== 'menu';
  if (!on) { if (CLUB.el && !CLUB.el.paused) CLUB.el.pause(); return; }
  const name = PLAYLISTS.lounge[MUS.idx] || PLAYLISTS.lounge[0];
  if (!CLUB.el) { CLUB.el = new Audio(); CLUB.el.preload = 'auto'; }
  const el = CLUB.el; if (CLUB.name !== name) { CLUB.name = name; el.src = 'music/bass/' + name + '.mp3'; }
  // near the speakers it shakes the floor; at the back of the room it's a rumble
  let best = 1e9; for (const [x, z] of LOUNGE_SPK) best = Math.min(best, Math.hypot(player.pos.x - x, player.pos.z - z));
  const trip = (MUS.tripUntil || 0) > performance.now(), k = Math.max(0.3, Math.min(1, 1.5 / (1 + best / 8))) * (trip ? 1.2 : 1);
  el.volume = Math.max(0, Math.min(1, MUS.cur.volume * 1.15 * k));
  const want = MUS.cur.currentTime + CLUB.lag; if (el.readyState >= 2 && Math.abs(el.currentTime - want) > 0.07) el.currentTime = want;
  if (el.paused) el.play().catch(() => {});
} catch (_) {} }, 100);
