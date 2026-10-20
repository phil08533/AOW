// =================== HAND-MADE UI (2.20): our own pixel panels and buttons, our pixel font everywhere, no glass, no glow, no emoji ===================
// The 9-slice art is drawn here on canvas at 2px per pixel and fed to border-image, so every window and button shares one hand-drawn kit.
{ const P = 2, art = (n, draw) => { const c = document.createElement('canvas'); c.width = c.height = n * P; const x = c.getContext('2d'); const px = (a, b, col, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(a * P, b * P, w * P, h * P); }; draw(px, n); return c.toDataURL(); };
  // a framed panel: black outline, light bevel top-left, dark bevel bottom-right, brass rivets in the corners
  const frame = (body, lite, dark, rivet) => art(12, (px, n) => { px(0, 0, body, n, n);
    px(0, 0, '#07060a', n, 1); px(0, n - 1, '#07060a', n, 1); px(0, 0, '#07060a', 1, n); px(n - 1, 0, '#07060a', 1, n);
    px(1, 1, lite, n - 2, 1); px(1, 1, lite, 1, n - 2); px(1, n - 2, dark, n - 2, 1); px(n - 2, 1, dark, 1, n - 2);
    if (rivet) for (const [a, b] of [[2, 2], [n - 4, 2], [2, n - 4], [n - 4, n - 4]]) { px(a, b, rivet, 2, 2); px(a, b, '#fff3c8'); } });
  const PANEL = frame('#1d1828', '#4a3f5e', '#0e0b14', '#b8862e');
  const BTN = frame('#352d48', '#5e5378', '#17121f'), BTN_HI = frame('#463b60', '#7a6d9a', '#1e1828'), BTN_DN = frame('#241e32', '#17121f', '#4a4060');
  const GO = frame('#d08a2a', '#ffd27a', '#7a4a10'), GO_HI = frame('#e8a03a', '#ffe6a8', '#8a5414');
  const TAB_ON = frame('#d08a2a', '#ffd27a', '#7a4a10');
  const bi = u => `border-style: solid !important; border-width: 8px !important; border-image: url(${u}) 8 fill stretch !important; border-radius: 0 !important; background: none !important;`;
  const st = document.createElement('style'); st.id = 'handmadeCss'; st.textContent = `
html:root { --ui: "Pixelify Sans", "Courier New", monospace; --hud: "Pixelify Sans", "Courier New", monospace; --mono: "Pixelify Sans", "Courier New", monospace; --num: "Pixelify Sans", "Courier New", monospace;
  --hl: #e8a33a; --hl2: #6a5a80; --accent: #f2c46a; --gold: #f2c46a; --amber: #f2c46a; --text: #f2e8d0; }
body, button, input, select, textarea, .dlg, .win, #hud, #pause, #dead, h1, h2, h3, .logo, #toast .big, #zone .n, #quest .qt, .dlg h3, .win h2, .win h3 { font-family: "Pixelify Sans", "Courier New", monospace !important; }
body { text-shadow: 2px 2px 0 #07060a !important; }
.win, .dlg, #menuDrop, #catchCard { ${bi(PANEL)} box-shadow: 4px 4px 0 rgba(0,0,0,.55) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
.win::before, .win::after, .dlg::before, .dlg::after { content: none !important; }
.dlg .who, .win .who { color: #b8a0d8 !important; letter-spacing: .12em; }
.dlg h3, .win h2, .win h3 { color: #f2c46a !important; font-weight: 700 !important; letter-spacing: .02em !important; }
.pbtn, .tbtn, #menuDrop button { ${bi(BTN)} color: #f2e8d0 !important; font-weight: 600 !important; letter-spacing: .04em !important; text-shadow: 2px 2px 0 #07060a !important; padding: 2px 8px !important; box-shadow: none !important; transition: none !important; }
.pbtn:hover:not(:disabled), .tbtn:hover, #menuDrop button:hover { border-image: url(${BTN_HI}) 8 fill stretch !important; color: #fff !important; }
.pbtn:active:not(:disabled), .tbtn:active, #menuDrop button:active { border-image: url(${BTN_DN}) 8 fill stretch !important; transform: translateY(2px); }
.pbtn.go, .pbtn.on, .pbtn.sel { border-image: url(${GO}) 8 fill stretch !important; color: #1a0f04 !important; text-shadow: 1px 1px 0 #ffe6a8 !important; }
.pbtn.go:hover:not(:disabled) { border-image: url(${GO_HI}) 8 fill stretch !important; color: #000 !important; }
.pbtn:disabled { opacity: .45 !important; filter: grayscale(.6); }
.pbtn kbd, .pbtn .k { border: 0 !important; background: rgba(0,0,0,.35) !important; color: inherit !important; border-radius: 0 !important; }
.rowi { border-bottom: 2px dashed #3a3150 !important; }
input[type=range] { -webkit-appearance: none; appearance: none; height: 8px; background: #0e0b14; border: 2px solid #4a3f5e; border-radius: 0; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 18px; background: #f2c46a; border: 2px solid #07060a; border-radius: 0; box-shadow: inset -2px -2px 0 #b8862e; }
input[type=range]::-moz-range-thumb { width: 14px; height: 18px; background: #f2c46a; border: 2px solid #07060a; border-radius: 0; }
`; document.head.appendChild(st); }
// emoji in buttons, titles and menus read as machine-made; strip them as UI appears (keeps game symbols like stars and hearts)
{ const EMO = /(?![★☆♥♦♠♣✓✔✕✖·•→←↑↓⚔])[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}][\u{FE0F}\u{200D}\p{Extended_Pictographic}]*\s?/gu;
  const scrub = root => { if (!root || root.nodeType !== 1) return; if (root.closest && root.closest('#chatLog,#chatBox,input,textarea')) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.nodeValue; if (EMO.test(t)) { EMO.lastIndex = 0; n.nodeValue = t.replace(EMO, '').replace(/^\s+/, ''); } EMO.lastIndex = 0; } };
  const roots = () => ['dlg', 'pause', 'menuDrop', 'tablet'].map(id => document.getElementById(id)).filter(Boolean);
  roots().forEach(scrub);
  new MutationObserver(ms => { for (const m of ms) { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (t && roots().some(r => r.contains(t))) scrub(t); } })
    .observe(document.body, { subtree: true, childList: true, characterData: true }); }
