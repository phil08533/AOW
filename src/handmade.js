// =================== HAND-MADE UI (2.20): our own pixel panels and buttons, our pixel font everywhere, no glass, no glow, no emoji ===================
// The 9-slice art is drawn here on canvas at 2px per pixel and fed to border-image, so every window and button shares one hand-drawn kit.
const HMP = 2, hmArt = (n, draw) => { const c = document.createElement('canvas'); c.width = c.height = n * HMP; const x = c.getContext('2d'); const px = (a, b, col, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(a * HMP, b * HMP, w * HMP, h * HMP); }; draw(px, n); return c.toDataURL(); };
  // a framed panel: black outline, light bevel top-left, dark bevel bottom-right, brass rivets in the corners
const hmFrame = (body, lite, dark, rivet) => hmArt(12, (px, n) => { px(0, 0, body, n, n);
    px(0, 0, '#07060a', n, 1); px(0, n - 1, '#07060a', n, 1); px(0, 0, '#07060a', 1, n); px(n - 1, 0, '#07060a', 1, n);
    px(1, 1, lite, n - 2, 1); px(1, 1, lite, 1, n - 2); px(1, n - 2, dark, n - 2, 1); px(n - 2, 1, dark, 1, n - 2);
    if (rivet) for (const [a, b] of [[2, 2], [n - 4, 2], [2, n - 4], [n - 4, n - 4]]) { px(a, b, rivet, 2, 2); px(a, b, '#fff3c8'); } });
// colour themes: every menu colour comes from one of these, picked in Settings → Graphics → Menu colour
const UI_THEMES = {
  Plum: { body: '#1d1828', lite: '#4a3f5e', dark: '#0e0b14', btn: '#352d48', btnLite: '#5e5378', hiLite: '#7a6d9a', screen: '#120e1a', accent: '#f2c46a', who: '#b8a0d8' },
  Navy: { body: '#141c2c', lite: '#34486a', dark: '#080c14', btn: '#22324e', btnLite: '#3e5a86', hiLite: '#5a7aaa', screen: '#0a101c', accent: '#8fd0ff', who: '#8fb0d8' },
  Ember: { body: '#24140f', lite: '#5e3624', dark: '#100806', btn: '#44261a', btnLite: '#7a4630', hiLite: '#9a5e40', screen: '#160c08', accent: '#ffb35e', who: '#e0a080' },
  Moss: { body: '#141e14', lite: '#3a5434', dark: '#080e08', btn: '#26381f', btnLite: '#4a6a3e', hiLite: '#62884f', screen: '#0a120a', accent: '#c8e86a', who: '#a0c890' },
  Steel: { body: '#1c1e22', lite: '#4a5058', dark: '#0c0d10', btn: '#30343a', btnLite: '#585e68', hiLite: '#767e8a', screen: '#101114', accent: '#e8e8e8', who: '#b0b8c4' },
  Crimson: { body: '#22101a', lite: '#5e2a3e', dark: '#10060a', btn: '#40182a', btnLite: '#743050', hiLite: '#964268', screen: '#16080e', accent: '#ff7aa8', who: '#e090b0' }
};
if (!PREFS.uiThemeV) { PREFS.uiThemeV = 1; PREFS.uiTheme = 'Steel'; try { savePrefs(); } catch (_) {} }
if (!UI_THEMES[PREFS.uiTheme]) PREFS.uiTheme = 'Steel';
function uiThemeCss(T) {
  const PANEL = hmFrame(T.body, T.lite, T.dark, '#b8862e');
  const BTN = hmFrame(T.btn, T.btnLite, T.dark), BTN_HI = hmFrame(T.btnLite, T.hiLite, T.dark), BTN_DN = hmFrame(T.dark, T.dark, T.btnLite);
  const GO = hmFrame('#d08a2a', '#ffd27a', '#7a4a10'), GO_HI = hmFrame('#e8a03a', '#ffe6a8', '#8a5414');
  const TAB_ON = hmFrame('#d08a2a', '#ffd27a', '#7a4a10');
  const hmBi = u => `border-style: solid !important; border-width: 8px !important; border-image: url(${u}) 8 fill stretch !important; border-radius: 0 !important; background: none !important;`;
  return `
html:root { --ui: "Pixelify Sans", "Courier New", monospace; --hud: "Pixelify Sans", "Courier New", monospace; --mono: "Pixelify Sans", "Courier New", monospace; --num: "Pixelify Sans", "Courier New", monospace;
  --hl: #e8a33a; --hl2: #6a5a80; --accent: #f2c46a; --gold: #f2c46a; --amber: #f2c46a; --text: #f2e8d0; }
body, button, input, select, textarea, .dlg, .win, #hud, #pause, #dead, h1, h2, h3, .logo, #toast .big, #zone .n, #quest .qt, .dlg h3, .win h2, .win h3 { font-family: "Pixelify Sans", "Courier New", monospace !important; }
body { text-shadow: 2px 2px 0 #07060a !important; }
.win, .dlg, #catchCard { ${hmBi(PANEL)} box-shadow: 4px 4px 0 rgba(0,0,0,.55) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
.win::before, .win::after, .dlg::before, .dlg::after { content: none !important; }
.dlg .who, .win .who { letter-spacing: .12em; }
.dlg h3, .win h2, .win h3 { color: #f2c46a !important; font-weight: 700 !important; letter-spacing: .02em !important; }
.pbtn, .tbtn, #menuDrop button, body #tabWrap #menuDrop .hbtn { ${hmBi(BTN)} color: #f2e8d0 !important; font-weight: 600 !important; letter-spacing: .04em !important; text-shadow: 2px 2px 0 #07060a !important; padding: 2px 8px !important; box-shadow: none !important; transition: none !important; }
.pbtn:hover:not(:disabled), .tbtn:hover, #menuDrop button:hover, body #tabWrap #menuDrop .hbtn:hover { border-image: url(${BTN_HI}) 8 fill stretch !important; color: #fff !important; }
.pbtn:active:not(:disabled), .tbtn:active, #menuDrop button:active { border-image: url(${BTN_DN}) 8 fill stretch !important; transform: translateY(2px); }
.pbtn.go, .pbtn.on, .pbtn.sel { border-image: url(${GO}) 8 fill stretch !important; color: #1a0f04 !important; text-shadow: 1px 1px 0 #ffe6a8 !important; }
.pbtn.go:hover:not(:disabled) { border-image: url(${GO_HI}) 8 fill stretch !important; color: #000 !important; }
.pbtn:disabled { opacity: .45 !important; filter: grayscale(.6); }
.pbtn kbd, .pbtn .k { border: 0 !important; background: rgba(0,0,0,.35) !important; color: inherit !important; border-radius: 0 !important; }
.rowi { border-bottom: 2px dashed ${T.lite} !important; }
#tabWrap { z-index: 60 !important; } body.menuopen #map, body.menuopen #vitals, body.menuopen #ammo, body.menuopen #quest, body.menuopen #compass, body.menuopen #clock { visibility: hidden; }
#map { border-image: none !important; border: 4px solid ${T.lite} !important; border-radius: 50% !important; background: ${T.screen} !important; box-shadow: 0 0 0 2px #07060a, inset 0 0 0 2px ${T.dark}, 4px 4px 0 rgba(0,0,0,.55) !important; overflow: hidden !important; }
#map canvas { border-radius: 50% !important; }
#map::before, #map::after { content: none !important; }
body #tabWrap #menuDrop { border: 0 !important; border-image: none !important; border-radius: 0 !important; background: ${T.screen} !important; box-shadow: inset 0 0 0 2px #000, inset 0 0 40px rgba(0,0,0,.6) !important; }
body #tabWrap #menuDrop::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 5; background: linear-gradient(118deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,.025) 34%, transparent 34.2%), radial-gradient(ellipse at 50% 45%, transparent 62%, rgba(0,0,0,.32) 100%); box-shadow: inset 0 0 0 1px rgba(160,220,255,.08), inset 0 0 18px rgba(80,170,255,.07); }
#menuDrop .tabTop { border-bottom: 2px solid ${T.lite} !important; color: ${T.accent} !important; background: rgba(0,0,0,.25); }
#menuDrop .tabTop button { all: unset; }
.dlg .who, .win .who { color: ${T.who} !important; }
input[type=range] { -webkit-appearance: none; appearance: none; height: 8px; background: #0e0b14; border: 2px solid #4a3f5e; border-radius: 0; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 18px; background: #f2c46a; border: 2px solid #07060a; border-radius: 0; box-shadow: inset -2px -2px 0 #b8862e; }
input[type=range]::-moz-range-thumb { width: 14px; height: 18px; background: #f2c46a; border: 2px solid #07060a; border-radius: 0; }
`; }
function applyUiTheme() { const T = UI_THEMES[PREFS.uiTheme] || UI_THEMES.Steel; let st = document.getElementById('handmadeCss'); if (!st) { st = document.createElement('style'); st.id = 'handmadeCss'; document.head.appendChild(st); } st.textContent = uiThemeCss(T); }
applyUiTheme();
// emoji in buttons, titles and menus read as machine-made; strip them as UI appears (keeps game symbols like stars and hearts)
{ const EMO = /(?![★☆♥♦♠♣✓✔✕✖·•→←↑↓⚔])[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}][\u{FE0F}\u{200D}\p{Extended_Pictographic}]*\s?/gu;
  const scrub = root => { if (!root || root.nodeType !== 1) return; if (root.closest && root.closest('#chatLog,#chatBox,input,textarea')) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.nodeValue; if (EMO.test(t)) { EMO.lastIndex = 0; n.nodeValue = t.replace(EMO, '').replace(/^\s+/, ''); } EMO.lastIndex = 0; } };
  const roots = () => ['dlg', 'pause', 'menuDrop', 'tablet'].map(id => document.getElementById(id)).filter(Boolean);
  roots().forEach(scrub);
  new MutationObserver(ms => { for (const m of ms) { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (t && roots().some(r => r.contains(t))) scrub(t); } })
    .observe(document.body, { subtree: true, childList: true, characterData: true }); }
// Settings → Graphics → Menu colour: cycles the themes above
{ const grid = $('pause') && $('pause').querySelector('.settings');
  if (grid) { const lb = document.createElement('span'); lb.textContent = 'Menu colour'; const b = document.createElement('button'); b.className = 'pbtn'; b.id = 'setUiCol'; b.textContent = PREFS.uiTheme;
    b.addEventListener('click', () => { const ks = Object.keys(UI_THEMES); PREFS.uiTheme = ks[(ks.indexOf(PREFS.uiTheme) + 1) % ks.length]; b.textContent = PREFS.uiTheme; try { savePrefs(); } catch (_) {} applyUiTheme(); SFX.ui(); });
    grid.append(lb, b); if (typeof SET_OF !== 'undefined') SET_OF.setUiCol = 'gfx'; } }
// the menu tablet: a black glass slab with a thin metal rim, the menu drawn on its screen, and the maker's mark on the bottom bezel
{ const st = document.createElement('style'); st.textContent = `
#tcShip::before, #tcVeh::before, #tcBag::before, #tcJournal::before, #tcSocial::before, #tcSet::before, #galaxyBtn::before, #danceBtn::before, #stGfx::before, #stSnd::before, #stCtl::before, #stGame::before, #fullBtn::before, body #tabWrap #helpBtn::before, #logoutHudBtn::before { content: none !important; }
#menuDrop .tabCat { font-size: 18px !important; }`; document.head.appendChild(st);
  const U = tabletObj.userData; U.body.material.color.set('#0d0f12'); U.edge.material.color.set('#9aa0a8'); U.screen.material.color.set('#000000');
  const brand = document.createElement('div'); brand.id = 'tabBrand'; brand.textContent = 'iTab 15 Pro + Ss Extreme';
  brand.style.cssText = 'position:absolute;pointer-events:none;text-align:center;font:600 10px "Pixelify Sans","Courier New",monospace;letter-spacing:.08em;color:#aab0b8;text-shadow:none;opacity:.8;white-space:nowrap';
  tabWrap.appendChild(brand);
  const loop = () => { requestAnimationFrame(loop); const d = $('menuDrop'); if (!tabletObj.visible || d.hidden) { brand.style.display = 'none'; return; }
    const W = parseFloat(d.style.width), H = parseFloat(d.style.height), bz = Math.max(14, W * 0.035);
    brand.style.display = 'block'; brand.style.left = d.style.left; brand.style.width = W + 'px'; brand.style.top = (parseFloat(d.style.top) + H + bz * 0.5 - 6) + 'px';
    brand.style.transformOrigin = `50% ${-(H / 2 + bz * 0.5 - 6)}px`; brand.style.transform = d.style.transform; brand.style.fontSize = Math.max(8, Math.min(12, bz * 0.5)) + 'px'; };
  requestAnimationFrame(loop); }
