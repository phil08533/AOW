// stand still and look at the view: after a few quiet seconds the HUD and buttons fade away, and any movement or input brings them back
const HIDLE = { t: performance.now(), p: null, off: false };
function hidleWake() { HIDLE.t = performance.now(); if (HIDLE.off) hidleSet(false); }
function hidleSet(off) { HIDLE.off = off; for (const id of ['hud', 'touch']) { const el = $(id); if (!el) continue; el.style.transition = 'opacity 0.6s'; el.style.opacity = off ? '0' : ''; } }
for (const ev of ['keydown', 'pointerdown', 'touchstart', 'wheel']) addEventListener(ev, hidleWake, { capture: true, passive: true });
setInterval(() => { try {
  const p = typeof player !== 'undefined' && player.pos ? [player.pos.x, player.pos.z, player.yaw, player.pitch] : null;
  if (p && HIDLE.p && p.some((v, i) => Math.abs(v - HIDLE.p[i]) > 1e-3)) hidleWake(); HIDLE.p = p;
  const busy = (typeof dlgOpen !== 'undefined' && dlgOpen) || $('hud').hidden;
  if (busy) hidleWake(); else if (!HIDLE.off && performance.now() - HIDLE.t > 6000) hidleSet(true);
} catch (_) {} }, 200);
