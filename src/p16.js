// =================== 2.16: water that matches each world, a space-age type and colour pass, fullscreen everywhere ===================
// ---- each world's water takes its own colour ----
const WATER_COLS = { earth: '#6fb7da', capitone: '#5ab8cc', mezar: '#6fc4a8', robot: '#b8706a', forestlife: '#4fa08a', ocean: '#2f9aa8', zarlich: '#a98ae8', moon: '#9aa8c0' };
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); try { WATER_MAT.color.set(WATER_COLS[id] || WATER_COLS.earth).convertSRGBToLinear(); if (typeof OCEAN_WATER_MAT !== 'undefined') OCEAN_WATER_MAT.color.set(WATER_COLS.ocean).convertSRGBToLinear(); } catch (_) {} return r; }; }
// ---- type and colour: Orbitron for big numbers and titles, Oxanium for the HUD, Exo 2 for reading; light space blue replaces the orange accent ----
{ const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800&family=Oxanium:wght@500;600;700&family=Exo+2:wght@400;500;600;700&display=swap'; document.head.appendChild(l);
  const st = document.createElement('style'); st.textContent = `
:root { --accent: #a8e4ff; --gold: #a8e4ff; --amber: #a8e4ff; --sun: #8fd8ff;
  --ui: "Exo 2", "Oxanium", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif;
  --hud: "Oxanium", "Exo 2", system-ui, sans-serif;
  --mono: "Orbitron", "Oxanium", monospace;
  --num: "Orbitron", "Oxanium", monospace; }
#ammo .n, #vitals .row b, #clock, #compass span { font-family: var(--num) !important; letter-spacing: .02em; }
#ammo .n { font-size: 32px; } #ammo .n small { font-size: 15px; }
#toast .big, #zone .n, .dlg h3, #quest .qt { font-family: "Orbitron", var(--hud) !important; letter-spacing: .04em; }
#zone .n { font-size: 24px; } .dlg h3 { font-size: 20px; } #quest .qt { font-size: 15px; }
.tq .cnt { color: #04121e !important; }
`; document.head.appendChild(st); }
// the old orange/gold accents written straight into styles get swapped for the blue at load and whenever new UI appears
{ const ORANGE = /#(ffb347|ffd36a|ffd75e|ff9a3c|ffc870)\b/gi, swapCss = s => s.replace(ORANGE, '#a8e4ff');
  const fixStyle = el => { if (el && el.style && el.style.cssText && ORANGE.test(el.style.cssText)) { ORANGE.lastIndex = 0; el.style.cssText = swapCss(el.style.cssText); } ORANGE.lastIndex = 0; };
  const fixSheet = n => { if (n.tagName === 'STYLE' && ORANGE.test(n.textContent)) { ORANGE.lastIndex = 0; n.textContent = swapCss(n.textContent); } ORANGE.lastIndex = 0; };
  document.querySelectorAll('style').forEach(fixSheet); document.querySelectorAll('[style]').forEach(fixStyle);
  new MutationObserver(ms => { for (const m of ms) { if (m.type === 'attributes') fixStyle(m.target); else for (const n of m.addedNodes) { if (n.nodeType !== 1) continue; fixSheet(n); fixStyle(n); if (n.querySelectorAll) n.querySelectorAll('[style]').forEach(fixStyle); } } })
    .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] }); }
// ---- fullscreen: real fullscreen where the browser allows it, and an install-to-home-screen guide on iPhone (Safari only allows it for home-screen apps) ----
const isStandalone = () => !!(navigator.standalone || (window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches)));
const isIOS = () => /iPhone|iPod/.test(navigator.userAgent) || (/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
goFullscreen = function () {
  const el = document.documentElement, on = document.fullscreenElement || document.webkitFullscreenElement;
  if (on) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
  if (isStandalone()) { toast('FULLSCREEN', "You're already playing fullscreen", 2); return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  const guide = () => { openDlg('Fullscreen', 'Play it like an app');
    $('dlgLine').innerHTML = isIOS() ? 'iPhone Safari only goes fullscreen for home-screen apps. Tap <b>Share</b> <span style="font-size:18px">⎋</span> at the bottom, then <b>Add to Home Screen</b>. Open Art of War from your home screen and it fills the whole screen, no browser bars.'
      : 'This browser blocked fullscreen here. Open the game link in Chrome, Edge, Firefox or Safari directly, or use your browser menu: <b>Install app</b> / <b>Add to Home screen</b>.';
    acts([['Got it', closeDlg, true]]); };
  if (!req) { guide(); return; }
  try { const p = req.call(el, { navigationUI: 'hide' }); const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (_) {} };
    if (p && p.then) p.then(lock).catch(guide); else lock(); } catch (_) { guide(); }
};
// home-screen app on a notched phone: keep the HUD clear of the notch
{ const st = document.createElement('style'); st.textContent = '@media (display-mode: fullscreen), (display-mode: standalone) { body { padding: 0; } }'; document.head.appendChild(st); }
// ---- Vega is the one voice on the Maw battle radio ----
{ const _mc = mawComms; mawComms = function (who, line, dur) { const r = _mc.apply(this, arguments); if (who === 'CAPTAIN VEGA') try { narrSay(line); } catch (_) {} return r; }; }
