// =================== 2.0 MENU TABLET: the menu is a 3D tablet you hold up, with 6 big buttons and no scrolling ===================
// The tablet is a real 3D model in front of the camera. The buttons are page elements laid exactly over its screen,
// using the same perspective as the game camera, so they move and tilt with it.
const TAB = { t: 0, page: 'home', want: false };
const tabWrap = document.createElement('div'); tabWrap.id = 'tabWrap';
const tabShade = document.createElement('div'); tabShade.id = 'tabShade'; tabWrap.appendChild(tabShade);
document.body.appendChild(tabWrap);
{ const drop = $('menuDrop'); tabWrap.appendChild(drop); }
{ const st = document.createElement('style'); st.textContent = `
#tabWrap { position: fixed; inset: 0; z-index: 20; pointer-events: none; perspective-origin: 50% 50%; }
#tabWrap.on { pointer-events: auto; }
#tabShade { position: absolute; inset: 0; background: rgba(0,0,0,.32); opacity: 0; transition: opacity .2s; }
#tabWrap.on #tabShade { opacity: 1; }
body.menuopen #zone { opacity: 0 !important; }
body #tabWrap #menuDrop { position: absolute !important; display: flex !important; flex-direction: column; inset: auto !important; max-height: none !important; transform-origin: 50% 50%; padding: 0 !important; overflow: hidden !important; border-radius: 8px !important;
  background: radial-gradient(120% 90% at 30% 0%, #1d4366, #050c1a 60%) !important; border: 1px solid rgba(120,220,255,.28) !important; box-shadow: inset 0 0 30px rgba(80,200,255,.10) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; animation: none !important; gap: 0 !important; grid-template-columns: none !important; }
body #tabWrap #menuDrop[hidden] { display: none !important; }
body #tabWrap #menuDrop::before { display: none !important; }
#menuDrop .tabTop { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-bottom: 1px solid rgba(120,220,255,.18); font: 700 13px var(--hud); letter-spacing: .2em; color: #8fe3ff; flex: none; }
#menuDrop .tabTop b { flex: 1; text-align: left; } #menuDrop .tabTop .tclock { font: 12px var(--mono); letter-spacing: .05em; opacity: .75; }
#menuDrop .tabTop button { all: unset; cursor: pointer; font: 700 14px var(--hud); color: #e6f6ff; padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.2); }
#menuDrop .tabTop button[hidden] { display: none; }
#menuDrop .tabPage { flex: 1; min-height: 0; display: grid; gap: 8px; padding: 10px; grid-auto-rows: 1fr; }
#menuDrop .tabPage[hidden] { display: none; }
body #tabWrap #menuDrop .hbtn, body #tabWrap #menuDrop * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
body #tabWrap #menuDrop .hbtn { min-height: 0 !important; height: auto; position: relative; }
body #tabWrap #menuDrop .hbtn[hidden] { display: none !important; }
body #tabWrap #menuDrop .hbtn:disabled { opacity: .4; cursor: default; }
#menuDrop .hbtn .why { display: block; font: 600 10px var(--ui, sans-serif); letter-spacing: 0; text-transform: none; opacity: .8; margin-top: 2px; }
#menuDrop .tabCat { font-size: 15px !important; } #menuDrop .tabCat::before { font-size: 34px !important; }
#menuDrop .tabCat small { display: block; font: 600 11px var(--ui, sans-serif); letter-spacing: 0; text-transform: none; opacity: .7; margin-top: 2px; }
body:not(.touch) #menuDrop .tabPage .hbtn[data-k]::after { content: attr(data-k); position: absolute; top: 5px; left: 7px; font: 700 11px var(--mono); opacity: .55; }
#tcShip::before { content: "🚀"; } #tcVeh::before { content: "🚙"; } #tcBag::before { content: "🎒"; } #tcJournal::before { content: "📜"; } #tcSocial::before { content: "💬"; } #tcSet::before { content: "⚙️"; }
#galaxyBtn::before { content: "🌌"; } #danceBtn::before { content: "🪩"; } #stGfx::before { content: "🖼️"; } #stSnd::before { content: "🔊"; } #stCtl::before { content: "🎮"; } #stGame::before { content: "🛠️"; }
#fullBtn::before { content: "⛶"; } body #tabWrap #helpBtn::before { content: "⌨️"; } #logoutHudBtn::before { content: "🚪"; }
`; document.head.appendChild(st); }

// ---- pages ----
const TAB_PAGES = {
  home: { title: 'MENU' },
  ship: { title: 'SHIP', ids: ['shipBtn', 'launchBtn', 'galaxyBtn', 'buildBtn'] },
  veh: { title: 'VEHICLES', ids: ['vehBtn', 'bikeBtn', 'droneBtn'] },
  journal: { title: 'JOURNAL', ids: ['questBtn', 'codexBtn', 'newsBtn'] },
  social: { title: 'SOCIAL', ids: ['playersBtn', 'chatBtn', 'photoBtn', 'danceBtn'] },
  set: { title: 'SETTINGS', ids: ['stGfx', 'stSnd', 'stCtl', 'stGame', 'helpBtn', 'fullBtn', 'unstuckBtn', 'logoutHudBtn'] }
};
const TAB_HOME = [['tcShip', 'Ship', 'Beam up · launch · map', 'ship'], ['tcVeh', 'Vehicles', 'Car · bike · drone', 'veh'], ['tcBag', 'Bag', 'Your gear', null],
  ['tcJournal', 'Journal', 'Quests · codex · news', 'journal'], ['tcSocial', 'Social', "Who's here · chat · photo", 'social'], ['tcSet', 'Settings', 'Graphics · sound · controls', 'set']];
const tabBtn = (id, label, fn) => { const b = document.createElement('button'); b.className = 'hbtn win'; b.id = id; b.textContent = label; b.addEventListener('click', fn); return b; };
{
  const drop = $('menuDrop'), loose = [...drop.children];
  const top = document.createElement('div'); top.className = 'tabTop';
  top.innerHTML = '<button class="tback" aria-label="Back">◀ Back</button><b class="ttitle">MENU</b><span class="tclock"></span><button class="tx" aria-label="Close menu">✕</button>';
  drop.appendChild(top);
  top.querySelector('.tback').addEventListener('click', e => { e.stopPropagation(); SFX.ui(); tabGo('home'); });
  top.querySelector('.tx').addEventListener('click', e => { e.stopPropagation(); closeTablet(); });
  // new buttons
  const extra = {
    galaxyBtn: tabBtn('galaxyBtn', 'Galaxy map', () => openGalaxy()),
    danceBtn: tabBtn('danceBtn', 'Dance', () => toggleDance()),
    stGfx: tabBtn('stGfx', 'Graphics', () => openSettingsTab('gfx')),
    stSnd: tabBtn('stSnd', 'Sound', () => openSettingsTab('snd')),
    stCtl: tabBtn('stCtl', 'Controls', () => openSettingsTab('ctl')),
    stGame: tabBtn('stGame', 'Game', () => openSettingsTab('game'))
  };
  const home = document.createElement('div'); home.className = 'tabPage'; home.dataset.p = 'home'; drop.appendChild(home);
  for (const [id, label, sub, page] of TAB_HOME) { const b = document.createElement('button'); b.className = 'hbtn win tabCat'; b.id = id; b.innerHTML = `<span class="tcT">${label}<small>${sub}</small></span>`;
    b.addEventListener('click', e => { if (page) { e.stopPropagation(); SFX.ui(); tabGo(page); } else { if (!dlgOpen) openBag(); } }); home.appendChild(b); }
  const placed = new Set();
  for (const [p, P] of Object.entries(TAB_PAGES)) { if (!P.ids) continue; const pg = document.createElement('div'); pg.className = 'tabPage'; pg.dataset.p = p; pg.hidden = true; drop.appendChild(pg);
    for (const id of P.ids) { const b = $(id) || extra[id]; if (b) { pg.appendChild(b); placed.add(b); } } }
  // the old Settings and Bag buttons are covered by the home page; anything else a future update adds goes to Journal
  for (const b of loose) if (!placed.has(b)) { if (b.id === 'menuBtn' || b.id === 'bagBtn') { b.hidden = true; b.dataset.tabGone = 1; b.style.display = 'none'; drop.appendChild(b); } else drop.querySelector('[data-p="journal"]').appendChild(b); }
  $('shipBtn').textContent = 'Beam up'; $('helpBtn').textContent = 'Key list'; $('codexBtn').textContent = 'Codex'; $('vehBtn').textContent = 'Vehicle';
  tabShade.addEventListener('click', () => closeTablet());
}
function tabGo(p) {
  const drop = $('menuDrop'); TAB.page = TAB_PAGES[p] ? p : 'home';
  drop.querySelectorAll('.tabPage').forEach(pg => { pg.hidden = pg.dataset.p !== TAB.page; });
  drop.querySelector('.ttitle').textContent = TAB_PAGES[TAB.page].title;
  drop.querySelector('.tback').hidden = TAB.page === 'home';
  tabRefresh(); tabLayout();
}
// gray out what can't be used here, with the reason
function tabRefresh() {
  const why = (id, reason) => { const b = $(id); if (!b) return; b.disabled = !!reason; let w = b.querySelector('.why'); if (reason) { if (!w) { w = document.createElement('span'); w.className = 'why'; b.appendChild(w); } w.textContent = reason; } else if (w) w.remove(); };
  const onShip = LEVEL && (LEVEL.id === 'ship' || LEVEL.fly || LEVEL.id === 'space');
  why('galaxyBtn', onShip ? '' : 'On your ship');
  why('buildBtn', LEVEL && LEVEL.id === 'ship' ? '' : 'Inside your ship');
  why('danceBtn', typeof inLounge === 'function' && inLounge() ? '' : 'In the Starlight Lounge');
  const pg = $('menuDrop').querySelector(`.tabPage[data-p="${TAB.page}"]`); let k = 0;
  if (pg) [...pg.children].forEach(b => { if (!b.hidden && b.style.display !== 'none') b.dataset.k = ++k; else delete b.dataset.k; });
}
// lay the page out so it never scrolls: columns from the number of buttons and the screen shape
function tabLayout() {
  const pg = $('menuDrop').querySelector(`.tabPage[data-p="${TAB.page}"]`); if (!pg) return;
  const n = [...pg.children].filter(b => !b.hidden && b.style.display !== 'none').length, tall = innerHeight > innerWidth;
  const cols = tall ? 2 : n <= 3 ? n : n <= 4 ? 2 : n <= 6 ? 3 : 4;
  pg.style.gridTemplateColumns = `repeat(${Math.max(1, cols)}, 1fr)`;
}
function closeTablet() { const d = $('menuDrop'); if (d.hidden) return; d.hidden = true; $('menuToggle').setAttribute('aria-expanded', 'false'); document.body.classList.remove('menuopen'); SFX.ui(); }
// Esc / Backspace: back one page, or close from the home page. Returns true when it handled it.
function tabletBack() { if ($('menuDrop').hidden) return false; if (TAB.page !== 'home') { SFX.ui(); tabGo('home'); return true; } closeTablet(); return true; }
function tabletNum(n) { const pg = $('menuDrop').querySelector(`.tabPage[data-p="${TAB.page}"]`); const b = pg && pg.querySelector(`[data-k="${n}"]`); if (b && !b.disabled) b.click(); }
window.addEventListener('keydown', e => { if (e.code === 'Backspace' && !$('menuDrop').hidden && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) { e.preventDefault(); tabletBack(); } }, true);
// opening always starts on the home page
new MutationObserver(() => { const open = !$('menuDrop').hidden; if (open && !TAB.want) tabGo('home'); TAB.want = open; tabWrap.classList.toggle('on', open); }).observe($('menuDrop'), { attributes: true, attributeFilter: ['hidden'] });

// ---- the 3D tablet ----
const tabletObj = (() => {
  const g = new THREE.Group(); g.visible = false;
  const mat = c => new THREE.MeshBasicMaterial({ color: c });
  const add = (geo, c, x, y, z) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); g.add(m); return m; };
  // unit-sized parts, scaled each frame to match the screen
  g.userData.body = add(new THREE.BoxGeometry(1, 1, 1), '#20252c', 0, 0, 0);
  g.userData.edge = add(new THREE.BoxGeometry(1, 1, 1), '#3a4350', 0, 0, 0);
  g.userData.screen = add(new THREE.PlaneGeometry(1, 1), '#06101e', 0, 0, 0);
  g.userData.cam = add(new THREE.CircleGeometry(1, 10), '#0b0d10', 0, 0, 0);
  const hand = side => { const h = new THREE.Group();
    const glove = '#2b3340', cuff = '#c9a43a';
    const palm = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 0.5), mat(glove)); h.add(palm);
    for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.34), mat(i % 2 ? '#323b4a' : glove)); f.position.set(side * -0.55, 0.15 + (i - 1) * 0.36, 0.32); f.rotation.z = side * 0.15; h.add(f); }
    const th = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.34), mat('#323b4a')); th.position.set(side * -0.2, 0.75, 0.3); th.rotation.z = side * -0.5; h.add(th);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.45, 0.65), mat(cuff)); c.position.set(side * 0.15, -0.75, -0.05); h.add(c);
    g.add(h); return h; };
  g.userData.hl = hand(-1); g.userData.hr = hand(1);
  g.traverse(o => { o.layers.set(1); o.frustumCulled = false; });
  camera.add(g); return g;
})();
let tabLast = performance.now();
function tabletFrame() {
  requestAnimationFrame(tabletFrame);
  const now = performance.now(), dt = Math.min(0.1, (now - tabLast) / 1000); tabLast = now;
  const drop = $('menuDrop'), open = !drop.hidden && state === 'play';
  TAB.t = Math.max(0, Math.min(1, TAB.t + (open ? dt / 0.22 : -dt / 0.16)));
  if (TAB.t <= 0) { if (tabletObj.visible) tabletObj.visible = false; return; }
  const W0 = innerWidth, H0 = innerHeight, tall = H0 > W0;
  const W = Math.round(Math.min(W0 * (tall ? 0.94 : 0.86), 720)), H = Math.round(Math.min(H0 * (tall ? 0.7 : 0.78), tall ? W * 1.35 : W * 0.6));
  const e = 1 - Math.pow(1 - TAB.t, 3), ty = H0 * 0.03 + (1 - e) * H0 * 0.9, tilt = 7;
  const f = H0 / 2 / Math.tan(camera.fov * Math.PI / 360);
  tabWrap.style.perspective = f + 'px';
  for (const [k2, v] of [['width', W + 'px'], ['height', H + 'px'], ['left', (W0 - W) / 2 + 'px'], ['top', (H0 - H) / 2 + 'px'], ['transform', `translateY(${ty}px) rotateX(${tilt}deg)`]]) drop.style.setProperty(k2, v, 'important');
  // 3D tablet at depth d, sized so 1 css px on the screen plane = k world units
  const d = Math.max(0.5, camera.near * 2.2), k = 2 * d * Math.tan(camera.fov * Math.PI / 360) / H0, U = tabletObj.userData, bz = Math.max(14, W * 0.035);
  tabletObj.visible = true; tabletObj.position.set(0, -ty * k, -d); tabletObj.rotation.set(tilt * Math.PI / 180, 0, 0);
  U.screen.scale.set(W * k, H * k, 1); U.screen.position.z = -0.0005;
  U.body.scale.set((W + bz * 2) * k, (H + bz * 2 + 26) * k, 0.012); U.body.position.set(0, -13 * k, -0.0075); // extra chin for the brand line
  U.edge.scale.set((W + bz * 2 + 4) * k, (H + bz * 2 + 30) * k, 0.008); U.edge.position.set(0, -13 * k, -0.012);
  U.cam.scale.setScalar(3 * k); U.cam.position.set(0, (H / 2 + bz / 2) * k, -0.001);
  const hs = Math.max(26, Math.min(W, H) * 0.13) * k;
  U.hl.scale.setScalar(hs); U.hl.position.set(-(W / 2 + bz * 0.4) * k, -(H * 0.18) * k, 0.006);
  U.hr.scale.setScalar(hs); U.hr.position.set((W / 2 + bz * 0.4) * k, -(H * 0.18) * k, 0.006);
  if (open) { const c = drop.querySelector('.tclock'); if (c) c.textContent = (typeof clockText === 'function' ? String(clockText()).split(' ·')[0] : new Date().toTimeString().slice(0, 5)); }
}
requestAnimationFrame(tabletFrame);
// put the gun away while the tablet is up
{ const _st = step; step = function (dt) { _st(dt); if (TAB.t > 0) { vm.visible = false; vmMelee.visible = false; if (typeof vmOff !== 'undefined' && vmOff) vmOff.visible = false; } }; }
addEventListener('resize', () => { if (!$('menuDrop').hidden) tabLayout(); });

// ---- Settings and the pause screen: four tabs that each fit on screen ----
const SET_TABS = [['gfx', 'Graphics'], ['snd', 'Sound'], ['ctl', 'Controls'], ['game', 'Game']];
const SET_OF = { setStyle: 'gfx', setGfx: 'gfx', setPix: 'gfx', setWeather: 'gfx', setFov: 'gfx', setShake: 'gfx', setNums: 'gfx',
  setMusic: 'snd', setMusicVol: 'snd', setSfx: 'snd', setVoice: 'snd',
  setSens: 'ctl', setInv: 'ctl', nickEdit: 'game', setHud: 'game', setCompact: 'game', setFull: 'game' };
let setTab = 'gfx';
{ const st = document.createElement('style'); st.textContent = `
#pause .settings > .tabOff, #pause .tabOff { display: none !important; }
#setTabs { display: flex; gap: 6px; justify-content: center; margin: 4px 0 10px; flex-wrap: wrap; }
#setTabs button.on { background: var(--gold, #ffd36a) !important; color: #1a1a1a !important; }
#pause .sheet { max-height: 94vh; overflow: hidden; }
#setGame { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 8px 0 2px; }
`; document.head.appendChild(st);
  const sheet = $('pause').querySelector('.sheet'), grid = sheet.querySelector('.settings');
  const bar = document.createElement('div'); bar.id = 'setTabs'; grid.before(bar);
  for (const [id, label] of SET_TABS) { const b = document.createElement('button'); b.className = 'pbtn'; b.dataset.t = id; b.textContent = label; b.addEventListener('click', () => { SFX.ui(); showSetTab(id); }); bar.appendChild(b); }
  // Game tab extras: Unstuck and controls help right in Settings
  const row = document.createElement('div'); row.id = 'setGame';
  const un = document.createElement('button'); un.className = 'pbtn'; un.textContent = '🧭 Unstuck'; un.addEventListener('click', () => { setState('play'); setTimeout(() => $('unstuckBtn').click(), 0); });
  const hp = document.createElement('button'); hp.className = 'pbtn'; hp.textContent = '❓ Key list'; hp.addEventListener('click', () => { setState('play'); setTimeout(() => $('helpBtn').click(), 0); });
  row.append(un, hp); grid.after(row);
}
function showSetTab(t) {
  setTab = t; const grid = $('pause').querySelector('.settings'), kids = [...grid.children];
  for (let i = 0; i + 1 < kids.length; i += 2) { const ctl = kids[i + 1], id = ctl.id || (ctl.querySelector('[id]') || {}).id || ''; const tab = SET_OF[id] || 'game'; kids[i].classList.toggle('tabOff', tab !== t); ctl.classList.toggle('tabOff', tab !== t); }
  for (const id of ['logoutBtn', 'skipBtn', 'setGame']) { const e = $(id); if (e) e.classList.toggle('tabOff', t !== 'game'); }
  $('setTabs').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
}
function openSettingsTab(t) { if (dlgOpen || (typeof chatOpen === 'function' && chatOpen())) return; setState('pause'); showSetTab(t); }
{ const _ss = setState; setState = function (s) { const r = _ss.apply(this, arguments); if (s === 'pause') showSetTab(setTab); return r; }; }
showSetTab('gfx');

// ---- shops, sell screens and lists: show a page at a time with arrows instead of scrolling ----
const PG = { name: '', page: 0, busy: false };
{ const st = document.createElement('style'); st.textContent = `
#shopRows.paged { max-height: none !important; overflow: hidden !important; }
#shopRows.paged > .pgOff { display: none !important; }
#shopRows.paged.cols2 { display: grid !important; grid-template-columns: 1fr 1fr; column-gap: 14px; align-items: start; }
#pgBar { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 6px 0 2px; font: 700 13px var(--mono, monospace); color: #8fe3ff; }
#pgBar button { min-width: 54px; }
#fltBar { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 6px; } #fltBar .pbtn { padding: 3px 10px; font-size: 12px; opacity: .7; } #fltBar .pbtn.on { opacity: 1; background: #ffd36a; color: #15110e; }
#shopRows > .fltOff { display: none !important; }
`; document.head.appendChild(st); }
// long lists get filter chips: what you can buy, what you own, what is still locked
const FLT = { name: '', sel: 'all' };
function rowKind(c) {
  if (!c.classList || !c.classList.contains('rowi')) return null;
  const b = c.querySelector('button'), t = (b && b.textContent || '').trim();
  if (b) { if (/^(Buy|Get|Hire|Adopt|Unlock)/i.test(t)) return b.disabled ? 'locked' : 'buy'; if (/^(Equip|In hand|Wear|Wearing|Owned|Use|Ride|Fly|Set)/i.test(t)) return 'own'; return null; }
  const x = (c.textContent || '').trim(); if (/^(🏆|✓|✔)/.test(x)) return 'own'; if (/^🔒/.test(x)) return 'locked'; return null;
}
function rowFilter(rows, all) {
  const name = $('dlgName').textContent + '|' + $('dlgRole').textContent; if (name !== FLT.name) { FLT.name = name; FLT.sel = 'all'; }
  const kinds = all.map(rowKind), n = { buy: 0, own: 0, locked: 0 }; kinds.forEach(k => { if (k) n[k]++; });
  const typed = kinds.filter(Boolean).length, used = Object.values(n).filter(v => v).length;
  let bar = $('fltBar');
  if (all.length < 14 || typed < all.length * 0.8 || used < 2) { all.forEach(c => c.classList.remove('fltOff')); if (bar) bar.remove(); return; }
  const shop = n.buy > 0 || all.some(c => c.querySelector('button'));
  const opts = [['all', 'All']].concat(shop ? [['buy', 'Can buy'], ['own', 'Owned'], ['locked', 'Locked']] : [['own', 'Done'], ['locked', 'To do']]).filter(([k]) => k === 'all' || n[k]);
  if (!opts.some(o => o[0] === FLT.sel)) FLT.sel = 'all';
  all.forEach((c, i) => c.classList.toggle('fltOff', FLT.sel !== 'all' && kinds[i] !== FLT.sel));
  const html = opts.map(([k, l]) => `<button class="pbtn${k === FLT.sel ? ' on' : ''}" data-k="${k}">${l}${k === 'all' ? '' : ' ' + n[k]}</button>`).join('');
  if (!bar) { bar = document.createElement('div'); bar.id = 'fltBar'; bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); FLT.sel = b.dataset.k; PG.page = 0; SFX.ui(); pageRows(); }); }
  if (bar.innerHTML !== html) bar.innerHTML = html;
  if (bar.nextElementSibling !== rows) rows.before(bar);
}
function pageRows() {
  const rows = $('shopRows'), old = $('pgBar');
  if (!rows || $('dlg').hidden) { if (old) old.remove(); if ($('fltBar')) $('fltBar').remove(); return; }
  const all = [...rows.children].filter(c => c.id !== 'pgBar');
  rowFilter(rows, all);
  const kids = all.filter(c => !c.classList.contains('fltOff'));
  if (kids.length < 3 || rows.querySelector('canvas')) { rows.classList.remove('paged'); kids.forEach(c => c.classList.remove('pgOff')); if (old) old.remove(); return; }
  const name = $('dlgName').textContent + '|' + $('dlgRole').textContent; if (name !== PG.name) { PG.name = name; PG.page = 0; }
  rows.classList.remove('paged'); kids.forEach(c => c.classList.remove('pgOff'));
  // short, wide screens (phones sideways): two columns of rows so each page holds more
  const wordy = kids.some(c => (c.textContent || '').length > 64), two = innerHeight < 520 && innerWidth > 640 && !wordy && getComputedStyle(rows).display !== 'grid'; rows.classList.toggle('cols2', two); if (two) rows.classList.add('paged');
  // how much room the list has: the screen minus everything else in the dialog
  const dlg = $('dlg'), rest = dlg.scrollHeight - rows.offsetHeight, mh = parseFloat(getComputedStyle(dlg).maxHeight) || innerHeight, room = Math.max(120, Math.min(innerHeight * 0.92 - rest - 58, innerHeight * 0.62, mh - rest - 30));
  const pages = []; let start = null, cur = [];
  for (const c of kids) { const top = c.offsetTop, bot = top + c.offsetHeight; if (start == null) start = top; if (bot - start > room && cur.length) { pages.push(cur); cur = []; start = top; } cur.push(c); }
  if (cur.length) pages.push(cur);
  if (pages.length <= 1) { if (old) old.remove(); if (!two) rows.classList.remove('paged'); return; }
  PG.page = Math.max(0, Math.min(PG.page, pages.length - 1));
  rows.classList.add('paged'); pages.forEach((p, i) => p.forEach(c => c.classList.toggle('pgOff', i !== PG.page)));
  const bar = old || document.createElement('div'); bar.id = 'pgBar';
  bar.innerHTML = `<button class="pbtn" data-d="-1" ${PG.page ? '' : 'disabled'}>◀</button><span>Page ${PG.page + 1} / ${pages.length}</span><button class="pbtn" data-d="1" ${PG.page < pages.length - 1 ? '' : 'disabled'}>▶</button>`;
  if (!old) { bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; e.stopPropagation(); PG.page += +b.dataset.d; SFX.ui(); pageRows(); }); }
  if (bar.previousElementSibling !== rows) rows.after(bar);
}
{ let q = false; const run = () => { q = false; PG.busy = true; try { pageRows(); } finally { PG.busy = false; } };
  new MutationObserver(muts => { if (PG.busy || q) return; if (muts.every(m => m.target.id === 'pgBar' || m.target.id === 'fltBar' || (m.target.closest && m.target.closest('#pgBar, #fltBar')))) return; q = true; requestAnimationFrame(run); })
    .observe($('dlg'), { childList: true, subtree: true });
  addEventListener('resize', () => { if (!$('dlg').hidden) requestAnimationFrame(run); }); }
// arrow keys and the controller shoulders turn pages
window.addEventListener('keydown', e => { if (!dlgOpen || !$('pgBar')) return; if (e.code === 'ArrowRight' || e.code === 'PageDown') $('pgBar').querySelector('[data-d="1"]').click(); else if (e.code === 'ArrowLeft' || e.code === 'PageUp') $('pgBar').querySelector('[data-d="-1"]').click(); });
