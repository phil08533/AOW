// =================== HUD layout: right column = minimap (north up) → compass → boss health; helm prompt out of the way ===================
{ const st = document.createElement('style'); st.textContent = `
body #ctape { left: auto !important; right: 0 !important; transform: none !important; top: calc(env(safe-area-inset-top, 0px) + 118px) !important; width: 128px !important; height: 34px !important; }
body #clock { top: calc(env(safe-area-inset-top, 0px) + 152px) !important; }
body #boss { left: auto !important; right: 8px !important; transform: none !important; top: calc(env(safe-area-inset-top, 0px) + 172px) !important; width: 168px !important; padding: 3px 8px 5px !important; }
body #boss .n { font-size: 11px !important; letter-spacing: .08em !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
body #boss .bar { height: 7px !important; }
body #clock { white-space: nowrap !important; width: max-content; }
@media (pointer: coarse) and (max-width: 520px) { body #boss { top: calc(env(safe-area-inset-top, 0px) + 176px) !important; } body #raidBar { top: calc(env(safe-area-inset-top, 0px) + 206px) !important; } }
body.flying #talk { top: auto !important; left: 12px !important; transform: none !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 14px) !important; font-size: 11px !important; padding: 4px 10px !important; opacity: .8; }
@media (pointer: coarse) and (max-height: 520px) { body #ctape { top: calc(env(safe-area-inset-top, 0px) + 116px) !important; } body #clock { top: calc(env(safe-area-inset-top, 0px) + 150px) !important; } body #boss { top: calc(env(safe-area-inset-top, 0px) + 168px) !important; } }
`; document.body.appendChild(st); }

// =================== Raid notices out of the way ===================
// the raid chip sits small in the bottom-left above your health instead of the middle of the screen; the countdown only shows
// in the last minute before a raid, and raid alerts go to a small line on the chip and the chat log instead of a big center popup
{ const st = document.createElement('style'); st.textContent = `
body #hud #raidBar { left: 12px !important; right: auto !important; top: auto !important; transform: none !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 128px) !important;
  max-width: min(46vw, 260px) !important; white-space: normal !important; text-align: left !important; font-size: 11px !important; padding: 2px 8px !important; opacity: .85; height: auto !important; }
@media (pointer: coarse) { body #hud #raidBar { left: 12px !important; right: auto !important; bottom: auto !important; top: calc(env(safe-area-inset-top, 0px) + 68px) !important; max-width: 46vw !important; } }
body #hud #raidBar.flash { opacity: 1; box-shadow: 0 0 0 2px #ff6a5a; }
`; document.head.appendChild(st); }
let raidNoteT = 0, raidNoteTxt = '';
function raidNote(big, sm) { raidNoteTxt = `⚔ ${big}${sm ? ' · ' + sm : ''}`; raidNoteT = performance.now() + 4500; log(raidNoteTxt, 'sys'); }
{ const _rh = raidHud; raidHud = function () { const r = _rh.apply(this, arguments); if (!raidEl || raidEl.hidden) return r;
  const R = raidNow(), on = performance.now() < raidNoteT;
  if (on) raidEl.textContent = raidNoteTxt;
  else if (!R.active && R.next > 60000) raidEl.hidden = true;
  raidEl.classList.toggle('flash', on); return r; }; }
