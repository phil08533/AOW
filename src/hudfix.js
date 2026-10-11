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
