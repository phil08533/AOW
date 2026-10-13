// =================== HUD 2.0: helmet-style glass HUD, compass tape, quick-action column, menu sheet ===================
{ const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap'; document.head.appendChild(l); }
{ const st = document.createElement('style'); st.id = 'hud2css'; st.textContent = `
:root { --hl: rgba(127,233,255,.85); --hl2: rgba(127,233,255,.28); --glass: rgba(5,12,24,.58); --glass2: rgba(5,12,24,.82); --amber: #ffb347; --hp2: #5dff9a;
  --hud: "Rajdhani", "Pixelify Sans", system-ui, sans-serif; --mono: "Share Tech Mono", "VT323", monospace; }
/* every window: dark glass with corner brackets */
.win { border: 1px solid var(--hl2); border-radius: 3px; box-shadow: 0 4px 18px rgba(0,0,0,.45);
  background:
    linear-gradient(var(--hl), var(--hl)) top left / 12px 2px no-repeat, linear-gradient(var(--hl), var(--hl)) top left / 2px 12px no-repeat,
    linear-gradient(var(--hl), var(--hl)) top right / 12px 2px no-repeat, linear-gradient(var(--hl), var(--hl)) top right / 2px 12px no-repeat,
    linear-gradient(var(--hl), var(--hl)) bottom left / 12px 2px no-repeat, linear-gradient(var(--hl), var(--hl)) bottom left / 2px 12px no-repeat,
    linear-gradient(var(--hl), var(--hl)) bottom right / 12px 2px no-repeat, linear-gradient(var(--hl), var(--hl)) bottom right / 2px 12px no-repeat,
    linear-gradient(180deg, rgba(20,40,70,.55), var(--glass2)); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
#hud, .dlg, #pause, #dead { font-family: var(--hud); }
body { text-shadow: 0 1px 2px rgba(0,0,0,.9); }
.dlg .who { font-family: var(--mono); letter-spacing: .14em; color: var(--hl); font-size: 11px; }
.dlg h3 { font-family: var(--hud); font-size: 24px; letter-spacing: .02em; color: var(--amber); }
.dlg .line { font-size: 18px; font-weight: 500; }
.pbtn { font-family: var(--hud); font-weight: 700; letter-spacing: .04em; background: rgba(8,20,36,.75); border: 1px solid var(--hl2); border-radius: 2px; color: #e6f6ff; padding: 7px 14px; text-transform: uppercase; font-size: 14px; }
.pbtn:hover:not(:disabled) { color: #fff; border-color: var(--hl); background: rgba(30,70,100,.6); }
.pbtn.go { color: #1a0f00; background: linear-gradient(180deg, #ffd27a, #ff9a3c); border-color: #ffd27a; }
.pbtn.go:hover:not(:disabled) { color: #000; background: linear-gradient(180deg, #ffe3a8, #ffb347); }
.cta::before, .pbtn:hover::before, .pbtn:focus-visible::before { content: none; }
.rowi { border-bottom: 1px solid rgba(127,233,255,.12); font-family: var(--hud); font-weight: 500; }
.rowi .meta { font-family: var(--mono); font-size: 15px; color: #9fd8ea; }
/* top-left: objective tracker, no box, a cyan rail */
#quest { background: linear-gradient(90deg, rgba(5,12,24,.55), rgba(5,12,24,0)); border: 0; box-shadow: none; border-left: 2px solid var(--hl); border-radius: 0; padding: 4px 10px 6px; backdrop-filter: none; }
#quest .ch { font-family: var(--mono); font-size: 10px; letter-spacing: .16em; color: var(--hl); }
#quest .qt { font-size: 18px; font-weight: 700; color: var(--amber); letter-spacing: .01em; }
#quest ul { font-size: 14px; font-weight: 600; }
#quest li::before { content: "◇ "; color: var(--hl); }
#quest li.done::before { content: "◆ "; color: var(--hp2); }
#quest li.done { color: var(--hp2); }
/* top-right: round radar with a ring */
#map { width: 104px; height: 104px; border-radius: 50%; padding: 0; background: rgba(5,12,24,.6); border: 2px solid var(--hl2); box-shadow: 0 0 0 1px rgba(0,0,0,.5), 0 0 14px rgba(127,233,255,.25), inset 0 0 18px rgba(0,0,0,.6); }
#map::after { content: "N"; position: absolute; left: 50%; top: 1px; transform: translateX(-50%); font: 700 10px var(--mono); color: var(--amber); }
#map canvas { border-radius: 50%; }
#clock { top: calc(env(safe-area-inset-top, 0px) + 118px); right: 8px; background: none; border: 0; box-shadow: none; backdrop-filter: none; font-family: var(--mono); font-size: 13px; color: #c8ecf6; padding: 0; text-align: right; width: 104px; white-space: normal; line-height: 1.15; }
#online { background: none; border: 0; box-shadow: none; font-family: var(--mono); font-size: 12px; top: calc(env(safe-area-inset-top, 0px) + 150px) !important; }
/* compass tape */
#compass { display: none !important; }
body.menuopen #touch { display: none !important; }
#ctape { position: absolute; left: 50%; transform: translateX(-50%); top: calc(env(safe-area-inset-top, 0px) + 10px); width: min(42vw, 340px); height: 40px; pointer-events: none; }
#ctape canvas { width: 100%; height: 100%; display: block; }
/* bottom-left: vitals */
#vitals { width: min(46vw, 230px); padding: 7px 10px 8px; gap: 3px; }
#vitals .row { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9fd8ea; }
#vitals .row b { font-family: var(--mono); font-size: 18px; color: #fff; letter-spacing: 0; }
#vitals .bar { height: 12px; background: rgba(0,0,0,.5); border: 1px solid rgba(127,233,255,.25); border-radius: 1px; }
#hpFill { background-image: repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), rgba(0,0,0,.55) calc(10% - 2px) 10%) !important; box-shadow: 0 0 10px rgba(93,255,154,.35); }
#xpbar { height: 4px !important; } #xpFill { background-color: var(--amber); background-image: none; }
#credits { color: var(--amber) !important; }
#lvlLbl { color: #fff; }
#vchips { display: flex; gap: 5px; margin-top: 3px; pointer-events: auto; }
.vchip { font: 700 12px var(--hud); letter-spacing: .06em; padding: 2px 7px; border: 1px solid var(--hl2); background: rgba(8,20,36,.7); color: #e6f6ff; border-radius: 2px; cursor: pointer; text-transform: uppercase; }
.vchip.hl { border-color: #5dff9a; color: #5dff9a; } .vchip.off { opacity: .45; }
.vchip kbd { font: 11px var(--mono); opacity: .7; margin-left: 3px; }
/* bottom-right: weapon */
#ammo { min-width: 120px; padding: 6px 12px 7px; pointer-events: auto; }
#ammo .n { font-family: var(--mono); font-size: 40px; letter-spacing: -.02em; color: #fff; text-shadow: 0 0 10px rgba(127,233,255,.35); }
#ammo .n small { font-size: 17px; color: #9fd8ea; }
#ammo .g { font: 700 12px var(--hud); letter-spacing: .08em; text-transform: uppercase; color: var(--amber); }
/* center text */
#zone .n { font-family: var(--hud); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; font-size: clamp(22px, 5.6vw, 36px); }
#zone .l { font-family: var(--mono); font-size: 15px; letter-spacing: .14em; color: var(--hl); text-transform: uppercase; }
#toast .big { font-family: var(--hud); letter-spacing: .1em; text-transform: uppercase; text-shadow: 0 2px 8px #000, 0 0 22px rgba(255,154,60,.55); }
#toast .sm { font-family: var(--hud); font-weight: 600; font-size: 18px; color: var(--amber); }
#log { font-family: var(--hud); font-weight: 600; font-size: 14px; }
#talk { font-family: var(--hud); font-weight: 700; letter-spacing: .05em; text-transform: uppercase; font-size: 15px; padding: 8px 14px; }
#talk kbd { font-family: var(--mono); border-color: var(--hl); color: var(--hl); border-radius: 2px; }
#boss { padding: 5px 12px 8px; } #boss .n { font-family: var(--hud); letter-spacing: .2em; color: #ff8a80; }
#boss .bar { height: 10px; }
#raidBar { font-family: var(--hud) !important; font-weight: 700; letter-spacing: .05em; }
/* menu: one icon button; opens a full sheet of tiles */
.hudbtns { top: calc(env(safe-area-inset-top, 0px) + 10px); right: 124px; }
#menuToggle { width: 42px; height: 42px; padding: 0; font-size: 0; display: grid; place-items: center; }
#menuToggle::before { content: "☰"; font-size: 22px; color: #e6f6ff; }
#menuDrop { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(92vw, 520px); max-height: 82vh; overflow-y: auto; padding: 38px 12px 12px; display: grid !important; grid-template-columns: repeat(3, 1fr); gap: 8px; z-index: 20;
  background: linear-gradient(var(--hl), var(--hl)) top left / 14px 2px no-repeat, linear-gradient(var(--hl), var(--hl)) top left / 2px 14px no-repeat, linear-gradient(var(--hl), var(--hl)) bottom right / 14px 2px no-repeat, linear-gradient(var(--hl), var(--hl)) bottom right / 2px 14px no-repeat, rgba(4,10,20,.9);
  border: 1px solid var(--hl2); box-shadow: 0 0 0 100vmax rgba(0,0,0,.45); backdrop-filter: blur(6px); }
#menuDrop[hidden] { display: none !important; }
#menuDrop::before { content: "MENU"; position: absolute; left: 14px; top: 10px; font: 700 14px var(--mono); letter-spacing: .3em; color: var(--hl); }
#menuDrop .hbtn { min-width: 0 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 12px 4px 10px !important; font: 700 13px var(--hud); letter-spacing: .05em; text-transform: uppercase; text-align: center; min-height: 72px; background: rgba(12,28,48,.75); border: 1px solid var(--hl2); box-shadow: none; }
#menuDrop .hbtn::before { font-size: 24px; line-height: 1; text-transform: none; }
#menuDrop .hbtn:hover { border-color: var(--hl); background: rgba(30,70,100,.6); }
#shipBtn::before { content: "🚀"; } #questBtn::before { content: "📜"; } #bagBtn::before { content: "🎒"; } #buildBtn::before { content: "🛋️"; } #bikeBtn::before { content: "🏍️"; } #chatBtn::before { content: "💬"; }
#launchBtn::before { content: "🛫"; } #codexBtn::before { content: "📖"; } #vehBtn::before { content: "🚙"; } #newsBtn::before { content: "📰"; } #unstuckBtn::before { content: "🧭"; } #menuBtn::before { content: "⚙️"; }
#playersBtn::before { content: "👥"; } #photoBtn::before { content: "📷"; } #helpBtn::before { content: "❓"; } #droneBtn::before { content: "🤖"; }
/* touch controls: stick, big fire, jump, and one tidy column of quick actions */
.tbtn { border: 1px solid var(--hl2); background: rgba(5,14,28,.5); color: #e6f6ff; font-family: var(--hud); backdrop-filter: blur(2px); box-shadow: 0 0 0 1px rgba(0,0,0,.4); }
.tbtn:active { background: rgba(127,233,255,.3); }
#stick { border: 1px solid var(--hl2); background: radial-gradient(circle, rgba(127,233,255,.08), rgba(5,14,28,.35)); }
#knob { background: radial-gradient(circle at 40% 35%, #e6f6ff, #7fe9ff 60%, #3a8aa0); box-shadow: 0 0 12px rgba(127,233,255,.6); opacity: .85; }
#tFire { background: radial-gradient(circle at 45% 40%, rgba(255,179,71,.65), rgba(255,110,40,.45)); border-color: #ffd27a; font-weight: 700; letter-spacing: .1em; }
#tJump { font-weight: 700; letter-spacing: .06em; }
.tq { border-radius: 10px !important; width: 50px !important; height: 50px !important; right: 12px !important; display: flex !important; flex-direction: column; align-items: center; justify-content: center; gap: 0; padding: 0; }
.tq i { font-style: normal; font-size: 21px; line-height: 1; } .tq small { font: 700 8px var(--hud); letter-spacing: .03em; margin-top: 2px; opacity: .85; }
.tq .cnt { position: absolute; right: -4px; top: -6px; min-width: 18px; height: 18px; border-radius: 9px; background: var(--amber); color: #1a0f00; font: 700 11px var(--mono); display: grid; place-items: center; padding: 0 4px; }
body.flying .tq { display: none !important; }
@media (pointer: coarse) {
  #ctape { top: calc(env(safe-area-inset-top, 0px) + 122px); width: min(70vw, 300px); }
  #vitals { width: min(46vw, 190px); padding: 5px 8px 6px; } #vitals .row b { font-size: 16px; }
  #ammo .n { font-size: 30px; } #ammo { min-width: 0; padding: 4px 10px 5px; }
  #stick { left: 18px; bottom: calc(env(safe-area-inset-bottom, 0px) + 122px); width: 116px; height: 116px; }
  #tFire { right: 72px; bottom: calc(env(safe-area-inset-bottom, 0px) + 104px); width: 92px; height: 92px; }
  #tJump { right: 172px; bottom: calc(env(safe-area-inset-bottom, 0px) + 124px); width: 58px; height: 58px; }
  #tBoost { right: 172px; bottom: calc(env(safe-area-inset-bottom, 0px) + 124px); }
  #vchips .vchip:first-child { display: none; }
  #tReload { bottom: calc(env(safe-area-inset-bottom, 0px) + 382px) !important; }
  #tMelee { bottom: calc(env(safe-area-inset-bottom, 0px) + 324px) !important; }
  #tNade { bottom: calc(env(safe-area-inset-bottom, 0px) + 266px) !important; }
  #tHeal { bottom: calc(env(safe-area-inset-bottom, 0px) + 208px) !important; }
  #log { bottom: calc(env(safe-area-inset-bottom, 0px) + 246px); width: min(60vw, 300px); }
  #talk { bottom: calc(env(safe-area-inset-bottom, 0px) + 212px); }
  .hudbtns { right: 124px; }
  #vchips .vchip kbd { display: none; }
}
@media (pointer: coarse) and (max-width: 520px) {
  #quest { width: calc(100vw - 186px); }
  #compass { display: none !important; }
  #ctape { top: calc(env(safe-area-inset-top, 0px) + 140px); }
  #zone { top: calc(env(safe-area-inset-top, 0px) + 214px); }
  #boss { top: calc(env(safe-area-inset-top, 0px) + 252px); }
  body #raidBar { top: calc(env(safe-area-inset-top, 0px) + 186px); left: 50%; transform: translateX(-50%); max-width: 70vw; text-align: center; }
  #log { bottom: calc(env(safe-area-inset-bottom, 0px) + 300px); }
}
@media (pointer: coarse) and (max-height: 520px) {
  #ctape { top: calc(env(safe-area-inset-top, 0px) + 8px); width: 34vw; }
  .hudbtns { right: 124px; top: calc(env(safe-area-inset-top, 0px) + 8px); }
  #tFire { right: 72px; bottom: calc(env(safe-area-inset-bottom, 0px) + 66px); }
  #tJump { right: 174px; bottom: calc(env(safe-area-inset-bottom, 0px) + 50px); }
  #tReload { bottom: calc(env(safe-area-inset-bottom, 0px) + 222px) !important; }
  #tMelee { bottom: calc(env(safe-area-inset-bottom, 0px) + 172px) !important; }
  #tNade { bottom: calc(env(safe-area-inset-bottom, 0px) + 122px) !important; }
  #tHeal { bottom: calc(env(safe-area-inset-bottom, 0px) + 72px) !important; }
  .tq { width: 44px !important; height: 44px !important; } .tq i { font-size: 18px; } .tq small { font-size: 7px; }
  #stick { bottom: calc(env(safe-area-inset-bottom, 0px) + 100px); width: 96px; height: 96px; }
  #zone { top: calc(env(safe-area-inset-top, 0px) + 54px); }
  #toast { top: 44%; }
  #vitals { width: 180px; }
}
`; document.body.appendChild(st); }
// ---- new DOM: compass tape, vitals chips, quick-action column ----
const ctape = document.createElement('div'); ctape.id = 'ctape'; const ctc = document.createElement('canvas'); ctc.width = 300; ctc.height = 80; ctape.appendChild(ctc); $('hud').appendChild(ctape);
const vchips = document.createElement('div'); vchips.id = 'vchips'; $('vitals').appendChild(vchips);
const healChip = document.createElement('button'); healChip.className = 'vchip'; healChip.addEventListener('click', () => quickHeal()); vchips.appendChild(healChip);
const droneChip = document.createElement('button'); droneChip.className = 'vchip'; droneChip.addEventListener('click', () => openDroneStatus()); vchips.appendChild(droneChip);
const tHeal = document.createElement('button'); tHeal.className = 'tbtn'; tHeal.id = 'tHeal'; tHeal.setAttribute('aria-label', 'Use a medkit'); $('touch').appendChild(tHeal);
tHeal.addEventListener('touchstart', e => { quickHeal(); e.preventDefault(); }, { passive: false }); tHeal.addEventListener('click', () => quickHeal());
const QB = { tReload: ['⟳', 'RELOAD'], tMelee: ['⇄', 'SWAP'], tNade: ['✸', 'ORDNANCE'], tHeal: ['✚', 'HEAL'] };
for (const id in QB) { const b = $(id); b.classList.add('tq'); b.innerHTML = `<i>${QB[id][0]}</i><small>${QB[id][1]}</small>`; }
$('tHeal').insertAdjacentHTML('beforeend', '<span class="cnt" id="healCnt">0</span>');
$('ammo').addEventListener('click', () => { if (state === 'play' && !dlgOpen && TOUCH) reload(); });
function quickHeal() {
  if ((S.inv.medkit || 0) < 1) { toast('NO MEDKITS', 'Buy them at a general store or clinic', 1.6); SFX.block && SFX.block(); return; }
  if (player.hp >= maxHp()) { toast('FULL HEALTH', '', 0.9); return; }
  useMedkit(); burst(player.pos.clone().add(V(0, 1.2, 0)), '#5dff9a', 18, 3); SFX.ui();
}
// menu: drone button, icon tiles
{ const drop = $('menuDrop'), ref = $('unstuckBtn'); const b = document.createElement('button'); b.className = ref.className; b.id = 'droneBtn'; b.textContent = 'Drone'; b.addEventListener('click', () => { drop.hidden = true; droneS().own && (LEVEL.id === 'ship') ? openDroneBay() : droneS().own ? openDroneStatus() : openDroneBay(); }); drop.insertBefore(b, ref);
  for (const [id, t] of [['playersBtn', 'Players'], ['photoBtn', 'Photo'], ['helpBtn', 'Controls'], ['newsBtn', "What's new"], ['menuBtn', 'Settings'], ['launchBtn', 'Launch']]) { const e = $(id); if (e && /[^\x00-\x7F]|Launch ship|Players online|Photo mode/.test(e.textContent)) e.textContent = t; }
  drop.addEventListener('click', e => { if (e.target === drop) { drop.hidden = true; $('menuToggle').setAttribute('aria-expanded', 'false'); } });
}
// ---- per-frame bits ----
function drawTape() {
  const x = ctc.getContext('2d'), w = ctc.width, h = ctc.height; x.clearRect(0, 0, w, h);
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(5,12,24,0)'); g.addColorStop(0.15, 'rgba(5,12,24,.55)'); g.addColorStop(0.85, 'rgba(5,12,24,.55)'); g.addColorStop(1, 'rgba(5,12,24,0)'); x.fillStyle = g; x.fillRect(0, 8, w, 42);
  const hd = player.yaw + Math.PI, face = Math.atan2(Math.sin(hd), -Math.cos(hd)), span = Math.PI * 0.9, px = a => w / 2 + a / span * w;
  const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  x.textAlign = 'center'; const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  for (let d = 0; d < 360; d += 15) { const a = wrap(d * Math.PI / 180 - face); if (Math.abs(a) > span / 2) continue; const X = px(a), fade = 1 - Math.abs(a) / (span / 2);
    x.globalAlpha = 0.25 + 0.75 * fade; x.fillStyle = '#7fe9ff';
    if (d % 45 === 0) { x.fillRect(X - 1, 10, 2, 12); x.font = `700 ${d % 90 ? 20 : 27}px "Share Tech Mono", monospace`; x.fillStyle = d === 0 ? '#ffb347' : '#e6f6ff'; x.fillText(names[d / 45], X, 46); } else x.fillRect(X - 1, 10, 2, 6); }
  x.globalAlpha = 1; x.fillStyle = '#e6f6ff'; x.beginPath(); x.moveTo(w / 2 - 7, 8); x.lineTo(w / 2 + 7, 8); x.lineTo(w / 2, 16); x.fill();
  const tg = questTarget(); if (tg && tg.p) { const dx = tg.p.x - player.pos.x, dz = tg.p.z - player.pos.z, a = wrap(Math.atan2(dx, -dz) - face), dist = Math.round(Math.hypot(dx, dz)), cl = Math.max(-span / 2 * 0.92, Math.min(span / 2 * 0.92, a)), X = px(cl);
    x.fillStyle = '#ffb347'; x.strokeStyle = '#000'; x.lineWidth = 2; x.beginPath(); x.moveTo(X, 14); x.lineTo(X + 9, 26); x.lineTo(X, 38); x.lineTo(X - 9, 26); x.closePath(); x.stroke(); x.fill();
    if (Math.abs(a) > span / 2) { x.beginPath(); const s = a > 0 ? 1 : -1; x.moveTo(X + s * 18, 26); x.lineTo(X + s * 11, 19); x.lineTo(X + s * 11, 33); x.fill(); }
    x.font = '700 22px "Share Tech Mono", monospace'; x.fillStyle = '#ffd27a'; x.strokeText(dist + ' m', X, 70); x.fillText(dist + ' m', X, 70); }
}
let hudT2 = 0;
{ const _s = step; step = function (dt) { _s(dt); hudT2 -= dt; if (hudT2 > 0) return; hudT2 = 0.06; try { hudTick(); } catch (err) { console.warn('hud', err); } }; }
function hudTick() {
  drawTape();
  const mk = S.inv.medkit || 0; healChip.innerHTML = `✚ ${mk}${TOUCH ? '' : '<kbd>H</kbd>'}`; healChip.classList.toggle('hl', mk > 0 && player.hp < maxHp() * 0.5); healChip.classList.toggle('off', !mk);
  $('healCnt').textContent = mk; $('tHeal').style.opacity = mk ? 1 : 0.5;
  const D = droneS(); droneChip.hidden = !D.own; if (D.own) { droneChip.textContent = `🤖 ${D.on ? 'ON' : 'OFF'}`; droneChip.classList.toggle('off', !D.on); }
  const mel = handMelee(); const rb = $('tReload'); rb.style.visibility = !mel && (S.clip || (gun() && gun().mana)) ? 'hidden' : ''; if (rb.dataset.m !== String(mel)) { rb.dataset.m = String(mel); rb.innerHTML = mel ? '<i>🛡</i><small>BLOCK</small>' : '<i>⟳</i><small>RELOAD</small>'; }
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); ctape.hidden = !!LEVELS[id].fly; return r; }; }

{ const sync = () => document.body.classList.toggle('menuopen', !$('menuDrop').hidden); $('menuToggle').addEventListener('click', () => setTimeout(sync, 0)); $('menuDrop').addEventListener('click', () => setTimeout(sync, 0)); new MutationObserver(sync).observe($('menuDrop'), { attributes: true, attributeFilter: ['hidden'] }); }
// ---- light, see-through buttons and a pull-up menu drawer ----
{ const st = document.createElement('style'); st.textContent = `
.tbtn, .tq { background: rgba(255,255,255,.13) !important; border: 1px solid rgba(255,255,255,.55) !important; color: #fff !important; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); box-shadow: 0 2px 10px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.35) !important; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
.tbtn:active, .tq:active { background: rgba(255,255,255,.32) !important; }
#tFire { background: radial-gradient(circle at 45% 38%, rgba(255,214,150,.45), rgba(255,140,60,.22)) !important; border-color: rgba(255,220,170,.85) !important; }
#stick { background: radial-gradient(circle, rgba(255,255,255,.10), rgba(255,255,255,.04)) !important; border: 1px solid rgba(255,255,255,.45) !important; }
#knob { background: radial-gradient(circle at 40% 35%, #fff, rgba(220,240,255,.75)) !important; box-shadow: 0 0 12px rgba(255,255,255,.5) !important; }
.tq .cnt { background: #fff !important; color: #1a1a1a !important; }
#menuToggle { display: none !important; }
#pullTab { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(env(safe-area-inset-bottom, 0px) + 2px); width: 132px; height: 22px; border-radius: 12px 12px 4px 4px; pointer-events: auto; cursor: pointer; z-index: 4;
  background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.5); border-bottom: 0; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); color: #fff; font: 700 11px var(--hud); letter-spacing: .22em; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
#pullTab::before { content: ""; position: absolute; top: 4px; left: 50%; width: 34px; height: 3px; margin-left: -17px; border-radius: 2px; background: rgba(255,255,255,.7); }
#pullTab span { margin-top: 6px; }
body.menuopen #pullTab { opacity: 0; pointer-events: none; }
#menuDrop { top: auto !important; bottom: 0 !important; left: 50% !important; transform: translateX(-50%) !important; width: min(100vw, 560px) !important; max-height: 70vh !important; border-radius: 18px 18px 0 0 !important; padding: 34px 14px calc(env(safe-area-inset-bottom, 0px) + 16px) !important;
  background: rgba(240,248,255,.16) !important; border: 1px solid rgba(255,255,255,.45) !important; border-bottom: 0 !important; backdrop-filter: blur(14px) saturate(1.2) !important; -webkit-backdrop-filter: blur(14px) saturate(1.2) !important; box-shadow: 0 -10px 40px rgba(0,0,0,.35), 0 0 0 100vmax rgba(0,0,0,.25) !important; animation: drawerUp .28s cubic-bezier(.2,.9,.3,1); }
#menuDrop::before { content: "" !important; position: absolute; left: 50%; top: 10px; width: 46px; height: 4px; margin-left: -23px; border-radius: 3px; background: rgba(255,255,255,.75); }
#menuDrop .hbtn { background: rgba(255,255,255,.12) !important; border: 1px solid rgba(255,255,255,.38) !important; border-radius: 12px !important; color: #fff !important; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
#menuDrop .hbtn:hover, #menuDrop .hbtn:active { background: rgba(255,255,255,.26) !important; }
@keyframes drawerUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
@media (pointer: coarse) { #vitals, #ammo { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px) !important; } }
#raidBar { bottom: calc(env(safe-area-inset-bottom, 0px) + 30px); }
`; document.body.appendChild(st); }
{ const tab = document.createElement('button'); tab.id = 'pullTab'; tab.setAttribute('aria-label', 'Open menu'); tab.innerHTML = '<span>MENU</span>'; $('hud').appendChild(tab);
  const drop = $('menuDrop'), open = v => { drop.hidden = !v; $('menuToggle').setAttribute('aria-expanded', String(v)); document.body.classList.toggle('menuopen', v); if (v) { firing = false; if (document.pointerLockElement) document.exitPointerLock(); } SFX.ui(); };
  tab.addEventListener('click', () => open(true));
  let sy = null; tab.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true }); tab.addEventListener('touchend', e => { if (sy != null && sy - e.changedTouches[0].clientY > 20) open(true); sy = null; });
  let dy = null; drop.addEventListener('touchstart', e => { dy = e.touches[0].clientY; }, { passive: true }); drop.addEventListener('touchend', e => { if (dy != null && e.changedTouches[0].clientY - dy > 50) open(false); dy = null; });
  window.addEventListener('keydown', e => { if (e.code === 'Tab' && state === 'play' && !dlgOpen && !chatOpen()) { e.preventDefault(); open(drop.hidden); } else if (e.code === 'Escape' && !drop.hidden) { if (typeof tabletBack === 'function') tabletBack(); else open(false); e.stopImmediatePropagation(); } }, true);
}
