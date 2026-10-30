// =================== NEW JAMESTOWN: Earth's capital city (Revamped) ===================
const JT_R = 44, JT_K = 1.9; // city radius, and how far the rest of Earth is pushed out to make room
const ET = (x, z) => [TOWN.x + (x - TOWN.x) * JT_K, TOWN.z + (z - TOWN.z) * JT_K];
const PI2 = Math.PI / 2;



// Late registration helper for features defined in subsequent files (CAPES, ARMORS, QDEFS, invUse)
function initJamestownLate() {
  if (typeof ITEMS !== 'undefined') {
    // aranus_gold keeps its old id so saved bags still hold it; it is now the signed Two Tired
    ITEMS.aranus_gold = { name: 'Signed Pail & Big E #1', v: 250, col: '#ffd700', use: true, comic: true, note: 'Gold-embossed collector copy of Two Tired, signed on the cover. Use to read.' };
    ITEMS.twotired_comic = { name: 'Pail & Big E #1: Two Tired', v: 40, col: '#1a7a82', use: true, comic: true, note: 'A Mile Down comic. Pail and Big E, five jokes, zero apologies. Use to read.' };
    ITEMS.bbq_burger = { name: 'Bobby Burger', v: 15, col: '#d86822', heal: 9999, food: true, use: true, note: 'Fresh off Bobby\'s kettle grill. Restores full health.' };
    ITEMS.diner_meatloaf = { name: 'Space Meatloaf', v: 25, col: '#8a402f', heal: 9999, food: true, note: 'Savory meatloaf with mystery gravy. Full heal + 10% damage.' };
    ITEMS.diner_coffee = { name: 'Diner Coffee', v: 15, col: '#4a2a1a', heal: 50, food: true, note: 'Piping hot black coffee. +50 HP & +15% move speed.' };
    ITEMS.diner_pie = { name: 'Cherry Pie', v: 20, col: '#c8223a', heal: 9999, food: true, note: 'Flaky crust with sweet cherry filling. Full heal.' };
  }
  if (typeof CAPES !== 'undefined') {
    CAPES.aranus = { name: 'Aranus Man Cape', lvl: 1, flag: 'aranusCape', col: '#1a7a82', trim: '#ff9a2a' };
  }
  if (typeof ARMORS !== 'undefined') {
    ARMORS.aranuscape = { name: 'Aranus Suit', lvl: 1, flag: 'aranusCape', def: 0.12, trim: '#ff9a2a', visor: '#4fe0d0', note: 'Heroic suburban vigilante outfit with cape' };
  }
  if (typeof invUse === 'function' && !window._aranusInvHooked) {
    window._aranusInvHooked = true;
    const _origInvUse = invUse;
    invUse = function (key) {
      const [t, id] = String(key).split(':');
      if (t === 'i' && ITEMS[id] && ITEMS[id].comic) {
        openComicReader(1, 'twotired');
        return;
      }
      return _origInvUse.apply(this, arguments);
    };
  }
  if (typeof subSpeed === 'function' && !window._dinerSpeedHooked) {
    window._dinerSpeedHooked = true;
    const _origSubSpeed = subSpeed;
    subSpeed = function () {
      const d = (typeof S !== 'undefined' && S.buffs && S.buffs.diner_spd > Date.now()) ? 0.15 : 0;
      const c = (typeof S !== 'undefined' && S.buffs && S.buffs.cat_spd > Date.now()) ? 0.15 : 0;
      return _origSubSpeed() + d + c;
    };
    const _origSubDmg = subDmg;
    subDmg = function () {
      const d = (typeof S !== 'undefined' && S.buffs && S.buffs.diner_dmg > Date.now()) ? 0.10 : 0;
      return _origSubDmg() + d;
    };
  }
  if (typeof defQuest === 'function' && typeof QDEFS !== 'undefined' && !QDEFS.aranus_fix) {
    defQuest('aranus_fix', {
      ch: 'Earth · Chapter 1',
      title: 'The Fixed Fight',
      giver: 'arthur',
      turnIn: 'arthur',
      req: ['q1'],
      intro: [
        "Psst, trooper! Over here! You look like someone who knows how to handle a blaster... and a delicate situation.",
        "I'm Arthur Vance, I print Pail & Big E up here on Earth. Issue #1 sells out every week, the kids and diner folks love it. Problem is, Issue #2 is stalled and I made a reckless wager at the Arena to fund the print run.",
        "A rogue syndicate is rigging the exhibition bouts. Go out to the Scrapyard and destroy 4 rogue XR-17 patrol bots to gather their combat telemetry for me. With that data, my fighter wins the match clean!",
        "Help me out, and I'll reward you with 1,000 credits, a signed gold collector edition of Pail & Big E #1, and the exclusive Aranus Cape!"
      ],
      obj: [{ kind: 'kill', t: 'xr17', n: 4, text: 'Destroy 4 XR-17s in the Scrapyard for telemetry', zone: 'scrap' }],
      outro: [
        "You got the telemetry! Glorious! The bookie paid out every single credit, and Issue #2 is officially funded!",
        "Here is your cut: 1,000 credits, a signed collector edition of Two Tired, and my personal Aranus Cape. Wear it with pride, trooper—suburban justice never sleeps!"
      ],
      reward: { cr: 1000, xp: 450, grant: 'c:aranus' }
    });
  }
  if (typeof completeQuest === 'function' && !window._aranusQuestHooked) {
    window._aranusQuestHooked = true;
    const _origCompleteQuest = completeQuest;
    completeQuest = function (id) {
      const res = _origCompleteQuest.apply(this, arguments);
      if (id === 'aranus_fix') {
        S.flags = S.flags || {};
        S.flags.aranusCape = 1;
        S.inv = S.inv || {};
        S.inv.aranus_gold = (S.inv.aranus_gold || 0) + 1;
        markDirty();
      }
      return res;
    };
  }
}
setTimeout(initJamestownLate, 0);

// ---- Comic book: a real paper comic you hold up and flip, page by page ----
// vo: the cast line ids (docs/voice_lines.csv) spoken on each page, in reading order; the speaker plays the ones that have been recorded
const COMICS = {
  twotired: { title: 'PAIL & BIG E #1: TWO TIRED', dir: 'shots/twotired', pages: 6, price: 40, item: 'twotired_comic', ink: '#1a7a82', pop: '#ff9a2a',
    vo: [[], ['BIG_E_001', 'PAIL_023', 'BIG_E_002', 'PAIL_024', 'BIG_E_003'], ['BIG_E_004', 'PAIL_025', 'BIG_E_005', 'BIG_E_006'],
      ['BIG_E_007', 'PAIL_026', 'BIG_E_007', 'PAIL_026', 'BIG_E_007', 'PAIL_027', 'BIG_E_008'], ['BIG_E_009', 'PAIL_028', 'BIG_E_010'], ['DOC_004', 'BIG_E_011']] }
};
// a short dry paper rustle for each page turn
function comicRustle() {
  try { const ac = SFX.ctx && SFX.ctx(); if (!ac || PREFS.sfx === false) return; const t = ac.currentTime, len = Math.floor(ac.sampleRate * 0.32), b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) { const k = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.6)), 1.5) * (0.6 + 0.4 * Math.random() * (Math.random() < 0.08)); }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.setValueAtTime(2600, t); f.frequency.linearRampToValueAtTime(5200, t + 0.3); f.Q.value = 0.7;
    g.gain.value = 0.22; s.connect(f); f.connect(g); g.connect(SFX.voiceOut()); s.start(t); } catch (_) {}
}
function openComicReader(startPage = 1, comicId = 'twotired') {
  const C = COMICS[comicId] || COMICS.twotired, N = C.pages;
  const old = document.getElementById('comicModal'); if (old) old.remove();
  if (document.pointerLockElement) try { document.exitPointerLock(); } catch (_) {}
  // faces in print order: cover, inside cover, the story pages, (a blank to keep it even), back cover. Leaf k carries faces 2k (front) and 2k+1 (back)
  const faces = [1, 'in']; for (let p = 2; p <= N; p++) faces.push(p); if (faces.length % 2 === 0) faces.push('blank'); faces.push('back');
  const L = faces.length / 2;
  const wrap = document.createElement('div'); wrap.id = 'comicModal';
  wrap.innerHTML = `<style>
#comicModal{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;touch-action:none;
  background:radial-gradient(ellipse at 50% 55%,rgba(30,22,14,.55) 0%,rgba(6,6,10,.94) 70%);opacity:0;transition:opacity .25s}
#comicModal.on{opacity:1}
#comicModal .cb{--w:min(40vw,calc(84vh/1.2));--h:calc(var(--w)*1.2);position:relative;width:calc(var(--w)*2);height:var(--h);perspective:calc(var(--w)*4.5);
  transition:transform .55s cubic-bezier(.3,.7,.3,1);transform:translateY(40px) scale(.94)}
#comicModal.on .cb{transform:translateY(0) scale(1)}
@media (max-aspect-ratio:1/1){#comicModal .cb{--w:min(47vw,calc(84vh/1.2))}}
#comicModal .cb-pos{position:absolute;inset:0;transition:transform .6s cubic-bezier(.4,.1,.2,1)}
#comicModal .cb-bed{position:absolute;top:0;height:100%;width:50%;background:#e9e1cf;border-radius:2px}
#comicModal .cb-bed.l{left:0;transform-origin:right}#comicModal .cb-bed.r{left:50%}
#comicModal .cb-leaf{position:absolute;left:50%;top:0;width:50%;height:100%;transform-origin:0 50%;transform-style:preserve-3d;will-change:transform;cursor:pointer}
#comicModal .cb-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;background:#f3ecdc}
#comicModal .cb-face.b{transform:rotateY(180deg)}
#comicModal .cb-face img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
#comicModal .cb-face::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;
  background:linear-gradient(90deg,rgba(0,0,0,.34),rgba(0,0,0,.08) 5%,rgba(255,255,255,.05) 9%,transparent 16%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .35 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")}
#comicModal .cb-face.b::before{background:linear-gradient(270deg,rgba(0,0,0,.34),rgba(0,0,0,.08) 5%,rgba(255,255,255,.05) 9%,transparent 16%)}
#comicModal .cb-face.cover::after,#comicModal .cb-face.bk::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:3;background:linear-gradient(115deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 62%,rgba(255,255,255,.1) 72%,rgba(255,255,255,0) 82%)}
#comicModal .cb-sh{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0}
#comicModal .cb-face.f .cb-sh{background:linear-gradient(270deg,rgba(0,0,0,.55),rgba(0,0,0,.05) 70%)}
#comicModal .cb-face.b .cb-sh{background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.05) 70%)}
#comicModal .cb-cast{position:absolute;top:0;width:50%;height:100%;pointer-events:none;opacity:0;z-index:90}
#comicModal .cb-cast.r{left:50%;background:linear-gradient(90deg,rgba(0,0,0,.6),rgba(0,0,0,0) 60%)}
#comicModal .cb-cast.l{left:0;background:linear-gradient(270deg,rgba(0,0,0,.6),rgba(0,0,0,0) 60%)}
#comicModal .cb-txt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10%;box-sizing:border-box;color:#2a2018;font-family:'Courier New',monospace;font-size:calc(var(--w)*.034);line-height:1.5;text-shadow:none}
#comicModal .cb-txt b{font-family:Impact,'Arial Black',sans-serif;font-weight:900;letter-spacing:.04em;line-height:1}
#comicModal .cb-tip{position:fixed;left:50%;bottom:3.5vh;transform:translateX(-50%);color:#d8cdb6;font:13px/1.2 var(--ui,sans-serif);letter-spacing:.06em;opacity:.8;transition:opacity 1s;pointer-events:none;text-shadow:0 1px 3px #000;white-space:nowrap}
#comicModal .cb-btn{position:fixed;width:42px;height:42px;border-radius:50%;border:0;background:rgba(20,18,16,.55);color:#e9e1cf;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
#comicModal .cb-btn:hover{background:rgba(60,50,40,.8)}
#comicModal .cb-x{top:18px;right:18px}#comicModal .cb-vo{bottom:calc(3.5vh + 26px);left:50%;transform:translateX(-50%)}
</style>`;
  const book = document.createElement('div'); book.className = 'cb'; wrap.appendChild(book);
  const pos = document.createElement('div'); pos.className = 'cb-pos'; book.appendChild(pos);
  const bedL = document.createElement('div'), bedR = document.createElement('div'); bedL.className = 'cb-bed l'; bedR.className = 'cb-bed r'; pos.append(bedL, bedR);
  const castL = document.createElement('div'), castR = document.createElement('div'); castL.className = 'cb-cast l'; castR.className = 'cb-cast r'; pos.append(castL, castR);
  const faceHTML = f => f === 'in' ? `<div class="cb-txt"><b style="font-size:2.3em;color:${C.ink}">A MILE DOWN<br>COMIC</b><br><br>${C.title.replace(': ', '<br>')}<br><br>Printed one mile under<br>the Floating City.<br><br>Read it at the bar.<br>Don't spill on it.</div>`
    : f === 'blank' ? '' : f === 'back' ? `<div class="cb-txt" style="background:${C.ink};color:#f3ecdc"><b style="font-size:3em;color:${C.pop};-webkit-text-stroke:1px #111">PAIL &amp; BIG E</b><br><br>Five jokes. Zero apologies.<br><br><br><span style="display:inline-block;background:#f3ecdc;color:#111;padding:.6em .9em;font-size:.8em">${C.price} CR<br>||| || |||| | ||</span></div>`
    : `<img src="${C.dir}/${f}.jpg" alt="Page ${f}" draggable="false">`;
  const leaves = [];
  for (let k = 0; k < L; k++) {
    const el = document.createElement('div'); el.className = 'cb-leaf';
    const fa = faces[2 * k], fb = faces[2 * k + 1];
    el.innerHTML = `<div class="cb-face f${k === 0 ? ' cover' : ''}">${faceHTML(fa)}<div class="cb-sh"></div></div><div class="cb-face b${k === L - 1 ? ' bk' : ''}">${faceHTML(fb)}<div class="cb-sh"></div></div>`;
    pos.appendChild(el); leaves.push({ el, a: 0, shF: el.querySelector('.f .cb-sh'), shB: el.querySelector('.b .cb-sh') });
  }
  const tip = document.createElement('div'); tip.className = 'cb-tip'; tip.textContent = TOUCH_HINT();
  const xBtn = document.createElement('button'); xBtn.className = 'cb-btn cb-x'; xBtn.textContent = '✕'; xBtn.title = 'Put it down (Esc)';
  const voBtn = document.createElement('button'); voBtn.className = 'cb-btn cb-vo'; voBtn.textContent = '🔊'; voBtn.title = 'Read aloud'; voBtn.hidden = true;
  wrap.append(tip, xBtn, voBtn);
  function TOUCH_HINT() { return (typeof TOUCH !== 'undefined' && TOUCH) ? 'Swipe or tap a page to turn it' : 'Click or drag a page to turn it  ·  ← →  ·  Esc to put it down'; }

  // spread s: leaves 0..s-1 are turned over. 0 = closed on the cover, L = closed on the back
  let spread = 0, anim = null, drag = null, voRun = 0;
  for (let p = 2; p <= Math.min(startPage, N); p++) spread = Math.ceil((faces.indexOf(p)) / 2);
  function setAngle(k, a) {
    const lf = leaves[k]; lf.a = a; const r = a / 180;
    // a turning page lifts a little off the stack and bows; the far half darkens as it rolls away from the light
    lf.el.style.transform = `rotateY(${-a}deg) translateZ(${Math.sin(r * Math.PI) * 6}px)`;
    lf.shF.style.opacity = Math.min(1, r * 1.8); lf.shB.style.opacity = Math.min(1, (1 - r) * 1.8);
    const moving = a > 0.5 && a < 179.5; lf.el.style.zIndex = moving ? 100 : a >= 90 ? 10 + k : 10 + L - k;
    if (moving) { castR.style.opacity = r < .5 ? Math.sin(r * Math.PI) * .9 : 0; castL.style.opacity = r >= .5 ? Math.sin(r * Math.PI) * .9 : 0; }
  }
  function layout() {
    const w = book.offsetWidth / 2, shift = spread === 0 ? -w / 2 : spread === L ? w / 2 : 0;
    pos.style.transform = `translateX(${shift}px)`;
    // page stacks: the paper edges under each side grow with the pages piled there
    const edge = n => Array.from({ length: Math.min(n, 6) }, (_, i) => `${0}px ${i + 1}px 0 ${i % 2 ? '#cfc5ae' : '#e6dcc6'}`).join(',');
    const sh = '0 18px 40px rgba(0,0,0,.6)';
    bedL.style.visibility = spread > 0 ? 'visible' : 'hidden'; bedR.style.visibility = spread < L ? 'visible' : 'hidden';
    bedL.style.boxShadow = [edge(spread * 2), sh].filter(Boolean).join(','); bedR.style.boxShadow = [edge((L - spread) * 2), sh].filter(Boolean).join(',');
    castL.style.opacity = castR.style.opacity = 0;
    const p = faces[2 * spread - 1], q = faces[2 * spread];
    voBtn.hidden = !voIds().length;
    if (typeof castLoad === 'function') castLoad();
    return [p, q];
  }
  // turn one leaf to its new side with an eased swing; dir +1 forward, -1 back
  function turn(dir, from) {
    if (anim) return; const k = dir > 0 ? spread : spread - 1; if (k < 0 || k >= L) return;
    voStop(); comicRustle();
    const a0 = from != null ? from : leaves[k].a, a1 = dir > 0 ? 180 : 0, t0 = performance.now(), dur = 520 * Math.abs(a1 - a0) / 180 + 120;
    spread += dir; layout();
    const step = now => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); setAngle(k, a0 + (a1 - a0) * e);
      if (t < 1) anim = requestAnimationFrame(step); else { anim = null; setAngle(k, a1); castL.style.opacity = castR.style.opacity = 0; } };
    anim = requestAnimationFrame(step);
  }
  function settle(k, a1) { // a drag let go short of the halfway mark: the page falls back where it was
    const a0 = leaves[k].a, t0 = performance.now(), dur = 260;
    const step = now => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); setAngle(k, a0 + (a1 - a0) * e);
      if (t < 1) anim = requestAnimationFrame(step); else { anim = null; setAngle(k, a1); castL.style.opacity = castR.style.opacity = 0; } };
    anim = requestAnimationFrame(step);
  }
  // pointer: press on the right page to pull it over, on the left page to pull one back; a tap turns it; hovering lifts the corner
  const sideAt = e => { const r = book.getBoundingClientRect(); return e.clientX > r.left + r.width / 2 ? 1 : -1; };
  book.addEventListener('pointerdown', e => {
    if (anim) return; const dir = sideAt(e), k = dir > 0 ? spread : spread - 1; if (k < 0 || k >= L) return;
    drag = { dir, k, x: e.clientX, moved: 0, base: leaves[k].a }; try { book.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault();
  });
  book.addEventListener('pointermove', e => {
    if (drag) { const w = book.offsetWidth / 2, dx = e.clientX - drag.x; drag.moved = Math.max(drag.moved, Math.abs(dx));
      const a = drag.dir > 0 ? Math.max(0, Math.min(180, -dx / (w * 1.6) * 180)) : Math.max(0, Math.min(180, 180 - dx / (w * 1.6) * 180));
      setAngle(drag.k, a); return; }
    if (anim || e.pointerType !== 'mouse') return; // peek: the page corner under the mouse lifts a few degrees
    const dir = sideAt(e), k = dir > 0 ? spread : spread - 1;
    leaves.forEach((lf, i) => { if (i === spread || i === spread - 1) setAngle(i, i === k ? (dir > 0 ? 9 : 171) : i < spread ? 180 : 0); });
  });
  book.addEventListener('pointerleave', () => { if (drag || anim) return; leaves.forEach((lf, i) => setAngle(i, i < spread ? 180 : 0)); castL.style.opacity = castR.style.opacity = 0; });
  const release = () => { if (!drag) return; const { dir, k, moved } = drag, a = leaves[k].a; drag = null;
    if (moved < 6 || (dir > 0 ? a > 50 : a < 130)) turn(dir, a); else settle(k, dir > 0 ? 0 : 180); };
  book.addEventListener('pointerup', release); book.addEventListener('pointercancel', release);
  wrap.addEventListener('pointerdown', e => { if (e.target === wrap) close(); });

  // only the lines a voice actor has recorded (Cast Voices); the speaker hides when the open pages have none
  const voIds = () => { if (!C.vo || typeof CASTVO === 'undefined') return []; const ids = [];
    for (const f of [faces[2 * spread - 1], faces[2 * spread]]) if (typeof f === 'number') ids.push(...(C.vo[f - 1] || [])); return ids.filter(id => CASTVO.have.has(id)); };
  function voStop() { voRun++; if (typeof castStop === 'function') castStop(); }
  async function voPlay() {
    const run = ++voRun;
    for (const id of voIds()) {
      let buf; try { buf = await castFetch(id); } catch (_) { continue; }
      if (run !== voRun || !buf) return;
      CASTVO.last = ''; castPlay(id);
      await new Promise(r => setTimeout(r, buf.duration * 1000 + 450));
      if (run !== voRun) return;
    }
  }
  voBtn.onclick = () => voPlay();
  xBtn.onclick = () => close();
  function close() {
    voStop(); cancelAnimationFrame(anim); window.removeEventListener('keydown', keyHandler, true); window.removeEventListener('resize', layout);
    wrap.classList.remove('on'); setTimeout(() => wrap.remove(), 250);
    if (typeof SFX !== 'undefined' && SFX.ui) SFX.ui();
    if (typeof state !== 'undefined' && state === 'play' && !(typeof dlgOpen !== 'undefined' && dlgOpen) && typeof lock === 'function') lock();
  }
  function keyHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turn(-1);
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'd' || e.key === 'D') turn(1);
    else if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') close();
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }
  window.addEventListener('keydown', keyHandler, true); window.addEventListener('resize', layout);
  leaves.forEach((lf, k) => setAngle(k, k < spread ? 180 : 0));
  document.body.appendChild(wrap);
  requestAnimationFrame(() => { wrap.classList.add('on'); layout(); });
  setTimeout(() => { tip.style.opacity = 0; }, 5000);
  comicRustle();
}

// ---- Street Runner Network (Outlaw Rep) ----
function talkRunner(id) {
  const runnerNames = { slick: 'Slick Eddie', viper: 'Viper' };
  const name = runnerNames[id] || 'Street Runner';
  const R = (S.runners = S.runners || {});
  R[id] = R[id] || { stash: {}, cash: 0, sold: 0 };
  const data = R[id];
  const tier = typeof outTier === 'function' ? outTier() : 0;

  if (tier < 1) {
    openDlg('Shady Runner', name);
    $('dlgLine').textContent = `They eye your shiny armor with contempt. "Beat it, citizen. You smell like city watch and clean laundry. I only talk business with folks who have a reputation in the streets." (Requires Outlaw Rep 10+ / Shady)`;
    acts([['Understood', closeDlg, true]]);
    return;
  }

  openDlg('Street Runner Network', name);
  const stashCount = Object.values(data.stash || {}).reduce((a, b) => a + b, 0);
  $('dlgLine').textContent = `"What's the word, boss? My runners are working the dark corners of New Jamestown. You supply the product, we take a 20% cut, and you collect the profits."\n[Holding: ${stashCount}/25 units · Earned: ${Math.round(data.cash || 0).toLocaleString()} cr waiting · Total sold: ${data.sold || 0}]`;

  acts([
    ['📦 Supply Product', () => openRunnerSupply(id)],
    [`💰 Collect Earnings${data.cash > 0 ? ` (${Math.round(data.cash).toLocaleString()} cr)` : ''}`, () => collectRunnerEarnings(id), data.cash <= 0],
    ['Done', closeDlg, true]
  ]);
}

function openRunnerSupply(id) {
  const runnerNames = { slick: 'Slick Eddie', viper: 'Viper' };
  const name = runnerNames[id] || 'Street Runner';
  const R = (S.runners = S.runners || {});
  const data = (R[id] = R[id] || { stash: {}, cash: 0, sold: 0 });
  const stashCount = Object.values(data.stash || {}).reduce((a, b) => a + b, 0);

  openDlg('Supply Street Runner', name);
  const rows = document.createElement('div');
  rows.className = 'rows'; rows.id = 'shopRows';

  const eligible = Object.keys(S.inv || {}).filter(k => (S.inv[k] > 0) && ((typeof SUBS !== 'undefined' && SUBS[k]) || (ITEMS[k] && ITEMS[k].illegal)));

  if (!eligible.length) {
    $('dlgLine').textContent = `"You don't have any product on you, boss. Bring back some substances or contraband from the underworld, and we'll push it."`;
    acts([['Back', () => talkRunner(id), true], ['Done', closeDlg]]);
    return;
  }

  const render = () => {
    const curN = Object.values(data.stash || {}).reduce((a, b) => a + b, 0);
    const have = Object.keys(S.inv || {}).filter(k => (S.inv[k] > 0) && ((typeof SUBS !== 'undefined' && SUBS[k]) || (ITEMS[k] && ITEMS[k].illegal)));
    $('dlgLine').textContent = `"Drop off the goods and we'll move them through the alleys." (Holding ${curN}/25 units)`;
    if (!have.length) {
      rows.textContent = '';
      const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No more product in your pockets.';
      rows.appendChild(e);
      return;
    }
    itemRows(rows, have.map(k => {
      const itemDef = (typeof SUBS !== 'undefined' && SUBS[k]) || ITEMS[k];
      const itemName = itemDef ? itemDef.name : k;
      return [k, S.inv[k], `${itemName}`, [
        ['Give 1', () => give(k, 1), curN >= 25],
        ['Give all', () => give(k, Math.min(S.inv[k], 25 - curN)), curN >= 25]
      ]];
    }));
  };

  const give = (k, q) => {
    const curN = Object.values(data.stash || {}).reduce((a, b) => a + b, 0);
    q = Math.min(q, S.inv[k] || 0, 25 - curN);
    if (q <= 0) { toast('RUNNER FULL', 'Runner cannot carry more product', 2); return; }
    S.inv[k] -= q;
    if (!S.inv[k]) delete S.inv[k];
    data.stash[k] = (data.stash[k] || 0) + q;
    markDirty();
    if (typeof SFX !== 'undefined' && SFX.item) SFX.item();
    try { invQuickRender(); } catch (_) {}
    render();
  };

  $('dlgActs').before(rows);
  acts([['Back', () => talkRunner(id), true], ['Done', closeDlg]]);
  render();
}

function collectRunnerEarnings(id) {
  const runnerNames = { slick: 'Slick Eddie', viper: 'Viper' };
  const name = runnerNames[id] || 'Street Runner';
  const data = S.runners && S.runners[id];
  if (!data || !data.cash) {
    toast('NO EARNINGS', 'No cash waiting to be collected', 2);
    return;
  }
  const amt = Math.round(data.cash);
  data.cash = 0;
  S.cr += amt;
  const repGain = Math.max(1, Math.floor(amt / 200));
  if (typeof crime === 'function') crime(repGain, 'Street runner kickback');
  markDirty();
  if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
  toast('CASH COLLECTED', `+${amt.toLocaleString()} cr from ${name} (+${repGain} rep)`, 3);
  log(`Collected ${amt.toLocaleString()} cr from ${name}'s street sales in New Jamestown. (+${repGain} outlaw rep)`, 'loot');
  talkRunner(id);
}

setInterval(() => {
  try {
    if (typeof state === 'undefined' || state !== 'play' || !S.runners || document.hidden) return;
    for (const [rid, data] of Object.entries(S.runners)) {
      if (!data || !data.stash) continue;
      const ks = Object.keys(data.stash).filter(k => data.stash[k] > 0);
      if (!ks.length) continue;
      if (Math.random() < 0.45) {
        const k = ks[Math.floor(Math.random() * ks.length)];
        data.stash[k]--;
        if (!data.stash[k]) delete data.stash[k];
        let baseVal = 40;
        if (typeof SUBS !== 'undefined' && SUBS[k]) baseVal = SUBS[k].price || SUBS[k].v * 2 || 50;
        else if (ITEMS[k]) baseVal = ITEMS[k].v || 50;
        const payout = Math.round(baseVal * 0.80 * (0.9 + Math.random() * 0.3));
        data.cash = (data.cash || 0) + payout;
        data.sold = (data.sold || 0) + 1;
        markDirty();
        if (Math.random() < 0.22) {
          const runnerName = rid === 'slick' ? 'Slick Eddie' : 'Viper';
          const subName = (typeof SUBS !== 'undefined' && SUBS[k] && SUBS[k].name) || (ITEMS[k] && ITEMS[k].name) || k;
          log(`${runnerName}: "Just pushed 1 ${subName} in the alley. +${payout} cr in your stash."`, 'chat');
        }
      }
    }
  } catch (err) { console.warn('runner tick error', err); }
}, 10000);

// ---- Actions for Arthur, Bobby, and Barnaby ----
function buyComic(comicId = 'twotired') {
  const C = COMICS[comicId] || COMICS.twotired, name = ITEMS[C.item].name;
  if (S.cr < C.price) {
    toast('NOT ENOUGH CREDITS', `Need ${C.price} cr to buy ${name}`, 2.5);
    if (typeof SFX !== 'undefined' && SFX.hit) SFX.hit();
    return;
  }
  S.cr -= C.price;
  S.inv = S.inv || {};
  S.inv[C.item] = (S.inv[C.item] || 0) + 1;
  markDirty();
  if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
  toast('COMIC PURCHASED', `${name} added to bag! Read it anytime.`, 3);
  log(`Bought "${name}" for ${C.price} cr. Open your bag to read!`, 'loot');
  closeDlg();
}

function grabBurger() {
  player.hp = maxHp();
  S.inv = S.inv || {};
  S.inv.bbq_burger = (S.inv.bbq_burger || 0) + 1;
  markDirty();
  if (typeof SFX !== 'undefined' && SFX.item) SFX.item();
  toast('HOT OFF THE GRILL', 'Bobby handed you a sizzling burger! (Full Heal)', 3);
  log('Bobby the Grillmaster handed you a fresh, sizzling space burger. Health fully restored!', 'loot');
  closeDlg();
}

function petBarnaby() {
  const catObj = npcObjs && npcObjs['barnaby'] && npcObjs['barnaby'].obj;
  const pos = catObj ? catObj.position.clone().add(V(0, 0.4, 0)) : player.pos.clone().add(V(0, 0.5, 0));
  burst(pos, '#ff6aa8', 16, 2.5);
  player.hp = Math.min(maxHp(), player.hp + 30);
  if (typeof playTone === 'function') {
    playTone(392, 0.25, 'sine');
    setTimeout(() => playTone(523.25, 0.35, 'sine'), 120);
  } else if (typeof SFX !== 'undefined' && SFX.ui) SFX.ui();
  toast('PURRRRRR...', 'Barnaby purrs contentedly and rubs against your boot. (+30 HP)', 3.5);
  log('You pet Barnaby the cat. He arches his back, purrs happily, and gives you warm fuzzies.', 'loot');
  closeDlg();
}

// Arthur Vance Stimulant Dealing
function openArthurDealing() {
  openDlg('Arthur Vance · Writing Stimulants', 'Arthur Vance');
  const rows = document.createElement('div');
  rows.className = 'rows';
  rows.id = 'shopRows';

  const prices = {
    focusfizz: { p: 120, rep: 0, quote: '"Focus Fizz! The holy grail of prose! Page 4 is officially written!"' },
    stimpatch: { p: 135, rep: 0, quote: '"A stim patch right on the carotid! My typing fingers are a blur!"' },
    irongum:   { p: 170, rep: 0, quote: '"Tough prose. Gritty action. Aranus Man is crushing jawbones."' },
    voidspice: { p: 220, rep: 1, quote: '"Void Spice... oh wow. I see galaxies inside my typewriter. (+1 Outlaw Rep)"' },
    neondust:  { p: 240, rep: 1, quote: '"Glowing rainbow inspiration! Issue #2 will have foil embossing! (+1 Outlaw Rep)"' },
    glimmer:   { p: 310, rep: 1, quote: '"Liquid gold for the mind! The bookie will never catch me now! (+1 Outlaw Rep)"' },
    redhaze:   { p: 360, rep: 1, quote: '"PURE SUBURBAN WRATH! Aranus Man is wielding dual weed-whackers! (+1 Outlaw Rep)"' },
    blackout:  { p: 480, rep: 2, quote: '"I have ascended beyond comprehension. Issue #2 is already published in the future! (+2 Outlaw Rep)"' }
  };

  const sell = (k, q) => {
    q = Math.min(q, (S.inv && S.inv[k]) || 0);
    if (q <= 0) return;
    const info = prices[k] || { p: 50, rep: 0, quote: '"Thanks, trooper! Inspiration is flowing!"' };
    const tot = info.p * q;
    S.inv[k] -= q;
    if (!S.inv[k]) delete S.inv[k];
    S.cr += tot;
    markDirty();
    if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
    if (info.rep > 0 && typeof crime === 'function') {
      crime(info.rep * q, 'Supplied writing stimulants to Arthur Vance');
    }
    const aPos = npcObjs && npcObjs['arthur'] && npcObjs['arthur'].obj;
    if (aPos) {
      try { burst(aPos.position.clone().add(V(0, 1.6, 0)), '#ffd36a', 14, 2.5); } catch (_) {}
    }
    const subName = (typeof SUBS !== 'undefined' && SUBS[k] && SUBS[k].name) || (ITEMS[k] && ITEMS[k].name) || k;
    toast('STIMULANTS SOLD', `Sold ${q}x ${subName} to Arthur for ${tot} cr!`, 3.5);
    log(`Sold ${q}x ${subName} to Arthur Vance for ${tot.toLocaleString()} cr.${info.rep ? ` (+${info.rep * q} Outlaw Rep)` : ''}`, 'loot');
    $('dlgLine').textContent = info.quote;
    setTimeout(() => { if (dlgOpen) render(); }, 1200);
  };

  const render = () => {
    const inv = S.inv || {};
    const have = (typeof SUBS !== 'undefined' ? Object.keys(SUBS) : []).filter(k => (inv[k] || 0) > 0);
    if (!have.length) {
      $('dlgLine').textContent = '"You holding any Focus Fizz or brain-boosters? I\'ve been staring at a blank page 4 for three months! Bring me anything from a Fizz to Void Spice and I\'ll pay double!"';
      itemRows(rows, []);
      return;
    }
    $('dlgLine').textContent = `Arthur Vance. "Show me what you've got! Focus Fizz pays DOUBLE (120 cr)!" You have ${S.cr.toLocaleString()} cr.`;
    itemRows(rows, have.map(k => {
      const info = prices[k] || { p: 50, rep: 0 };
      const subName = SUBS[k].name;
      const note = `${info.p} cr each${k === 'focusfizz' ? ' · 2× BONUS' : ''}${info.rep ? ' · contraband (+rep)' : ' · legal'}`;
      return [
        k,
        inv[k],
        note,
        [
          ['Sell 1', () => sell(k, 1)],
          ['Sell all', () => sell(k, inv[k])]
        ]
      ];
    }));
  };

  $('dlgActs').before(rows);
  acts([
    ['Back', () => talk('arthur'), true],
    ['Leave', closeDlg]
  ]);
  render();
}

// Feed Barnaby Fresh Fish
function feedBarnabyFish() {
  const inv = S.inv || {};
  const fishKey = Object.keys(inv).find(k => (inv[k] || 0) > 0 && ((ITEMS[k] && ITEMS[k].fish) || k.startsWith('fish')));

  if (!fishKey) {
    toast('NO FISH IN BAG', 'Barnaby sniffs your boots expectantly, but detects no fish. Visit Gil\'s fish market!', 3.5);
    if (typeof playTone === 'function') playTone(240, 0.2, 'sine');
    $('dlgLine').textContent = 'Barnaby looks up at you with large, pleading eyes, sniff-testing your pockets. Alas, you have no fresh fish.';
    return;
  }

  inv[fishKey] -= 1;
  if (!inv[fishKey]) delete inv[fishKey];
  player.hp = maxHp();
  if (typeof gainXp === 'function') gainXp(50);
  S.buffs = S.buffs || {};
  S.buffs['cat_spd'] = Date.now() + 600000;
  markDirty();

  const catObj = npcObjs && npcObjs['barnaby'] && npcObjs['barnaby'].obj;
  const pos = catObj ? catObj.position.clone().add(V(0, 0.4, 0)) : player.pos.clone().add(V(0, 0.5, 0));
  burst(pos, '#4fa8ff', 16, 2.5);
  burst(pos, '#ff6aa8', 14, 2.0);

  if (typeof playTone === 'function') {
    playTone(440, 0.15, 'triangle');
    setTimeout(() => playTone(587.33, 0.22, 'triangle'), 100);
    setTimeout(() => playTone(880, 0.35, 'sine'), 220);
  } else if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();

  const fishName = (ITEMS[fishKey] && ITEMS[fishKey].name) || fishKey;
  toast('PURRRRR!', `Barnaby devoured the ${fishName}! Full Heal + 50 XP + Feline Agility (+15% Spd for 10m)!`, 4.5);
  log(`You fed Barnaby a fresh ${fishName}. He devours it happily, purrs at top volume, and blesses you with Cat's Grace!`, 'loot');
  $('dlgLine').textContent = 'Barnaby chomps down the fish with ferocious enthusiasm, licks his whiskers clean, and rubs warmly against your leg. Purrrrrrr!';
}

// Cookie's Diner Specials Menu
function openDinerMenu() {
  openDlg('Cookie\'s Diner · Menu Specials', 'Cookie');
  const rows = document.createElement('div');
  rows.className = 'rows';
  rows.id = 'shopRows';

  const specials = [
    {
      id: 'diner_meatloaf',
      name: 'Space Meatloaf Platter',
      cost: 25,
      desc: 'Savory meatloaf with mystery gravy. Full heal + 10% damage boost.',
      fn: () => {
        if (S.cr < 25) { toast('NOT ENOUGH CREDITS', 'Need 25 cr', 2); return; }
        S.cr -= 25;
        player.hp = maxHp();
        S.buffs = S.buffs || {};
        S.buffs['diner_dmg'] = Date.now() + 300000;
        markDirty();
        if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
        toast('DELICIOUS!', 'A hearty slice of space meatloaf. Full HP + 10% damage for 5m!', 3.5);
        log('Ate Cookie\'s famous Space Meatloaf. Fully restored and feeling strong!', 'loot');
        render();
      }
    },
    {
      id: 'diner_coffee',
      name: 'Black Diner Coffee',
      cost: 15,
      desc: 'Steaming black brew. +50 HP & +15% movement speed for 5m.',
      fn: () => {
        if (S.cr < 15) { toast('NOT ENOUGH CREDITS', 'Need 15 cr', 2); return; }
        S.cr -= 15;
        player.hp = Math.min(maxHp(), player.hp + 50);
        S.buffs = S.buffs || {};
        S.buffs['diner_spd'] = Date.now() + 300000;
        markDirty();
        if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
        toast('CAFFEINATED!', 'Strong, bitter diner coffee. +50 HP & +15% move speed!', 3.5);
        log('Drank a cup of piping hot diner coffee. You feel energized!', 'loot');
        render();
      }
    },
    {
      id: 'diner_pie',
      name: 'Slice of Cherry Pie',
      cost: 20,
      desc: 'Flaky golden crust with sweet cherry filling. Full heal.',
      fn: () => {
        if (S.cr < 20) { toast('NOT ENOUGH CREDITS', 'Need 20 cr', 2); return; }
        S.cr -= 20;
        player.hp = maxHp();
        markDirty();
        if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
        toast('SWEET PERFECTION', 'Warm cherry pie. Full health restored!', 3.5);
        log('Enjoyed a warm slice of cherry pie at Cookie\'s Diner. Full heal!', 'loot');
        render();
      }
    }
  ];

  const render = () => {
    $('dlgLine').textContent = `Cookie's Specials. You have ${S.cr.toLocaleString()} cr.`;
    itemRows(rows, specials.map(s => [
      s.id,
      null,
      `${s.cost} cr · ${s.desc}`,
      [['Order', s.fn, S.cr < s.cost]]
    ]));
  };

  $('dlgActs').before(rows);
  acts([
    ['Heal (Free)', () => { player.hp = maxHp(); toast('HEALED', 'Cookie patched you up', 2); render(); }],
    ['Back', () => talk('cookie'), true],
    ['Leave', closeDlg]
  ]);
  render();
}

// Municipal Notice Board Dialog
function openNoticeBoard() {
  openDlg('New Jamestown Gazette · Municipal Notice Board', 'Town Bulletin');
  const rep = typeof outS === 'function' ? outS().rep : 0;
  const tier = typeof outTierName === 'function' ? outTierName() : 'Clean';
  const bounty = typeof outS === 'function' && outS().bounty ? outS().bounty : 0;

  $('dlgLine').innerHTML = `
    <div style="font-family:sans-serif;line-height:1.5;color:#d8e2ec;">
      <div style="text-align:center;font-weight:bold;font-size:16px;color:#ffd36a;border-bottom:1px solid #4a3a2a;padding-bottom:6px;margin-bottom:8px;">
        📜 NEW JAMESTOWN GAZETTE · MUNICIPAL BULLETIN
      </div>
      <div style="margin-bottom:8px;">
        <b style="color:#ffd36a;">★ THE ROXY CINEMA IS OPEN:</b> Catch classic cinema on the giant silver screen! Free buttered popcorn at the concession stand. Now showing: <i>1. Night of the Living Dead</i> and <i>2. Santa Claus Conquers the Martians</i>. Press <b>[C]</b> to change channels.
      </div>
      <div style="margin-bottom:8px;">
        <b style="color:#ff9a2a;">★ PAIL &amp; BIG E HIT EARTH:</b> Arthur Vance is selling <i>Pail &amp; Big E #1: Two Tired</i> at the West Pavilion. Arthur is also paying double for writing stimulants (especially Focus Fizz) to break his writer's block on Issue #2!
      </div>
      <div style="margin-bottom:8px;">
        <b style="color:#d86822;">★ BOBBY'S BACKYARD BBQ:</b> Sizzling space burgers hot off the grill behind the West residential block. Fresh heals for all weary travelers!
      </div>
      <div style="margin-bottom:8px;">
        <b style="color:#6fdc5a;">★ LOST & FOUND:</b> Barnaby the ginger cat is loose on the West Boulevard. Friendly, purrs on petting, and goes wild for fresh fish from Gil's fish market.
      </div>
      <div style="margin-bottom:8px;">
        <b style="color:#4fe0d0;">★ ARCADE HIGHSCORES:</b> Retro cabinets for <i>Space Snake</i> and <i>Space Rocks</i> are operational outside the Neon Arcade on West Street!
      </div>
      <div style="border-top:1px solid #4a3a2a;padding-top:6px;color:#a0b8d0;font-size:13px;">
        <b>⚖️ WATCH STATUS:</b> Your Outlaw Standing: <span style="color:#ffd36a;">${tier} (${rep} rep)</span>${bounty ? ` · <span style="color:#ff4a3a;">WANTED BOUNTY: ${bounty.toLocaleString()} cr</span>` : ' · No active warrants'}.
      </div>
    </div>
  `;
  acts([
    ['Town News', () => { if (typeof openUpdates === 'function') openUpdates(false); else closeDlg(); }],
    ['Leave', closeDlg, true]
  ]);
}

// ---- Custom Architectural Building Builder ----
function makeJTBuilding(w, h, d, col, trim, sign, awn, bStyle = 'commercial') {
  const g = new THREE.Group();

  // Resolve authentic retro materials
  const wallMat = toon(col || '#9a9088', bStyle === 'commercial' || bStyle === 'industrial' ? 'brick' : 'stucco');
  const trimMat = toon(trim || '#4a3f35', 'wood');
  const roofMat = toon(trim || '#3a343c', 'shingle');

  // 1. Stone foundation plinth
  part(g, B(w + 0.3, 0.5, d + 0.3), toon('#4e4a46', 'stone'), 0, 0.25, 0);

  // 2. Main Wall Body
  part(g, tileBox(B(w, h, d), bStyle === 'commercial' || bStyle === 'industrial' ? 1.4 : 2.2), wallMat, 0, h / 2, 0);

  // 3. Ground floor display windows & entrance
  if (bStyle === 'civic') {
    // Neoclassical portico / Town Hall steps
    part(g, B(w * 0.9, 0.3, 3.0), toon('#9a9088', 'stone'), 0, 0.15, d / 2 + 1.5);
    part(g, B(w * 0.8, 0.3, 2.0), toon('#b8a888', 'stone'), 0, 0.45, d / 2 + 1.0);
    // Double door
    part(g, B(2.4, 3.2, 0.1), '#2c1e14', 0, 1.8, d / 2 + 0.05);
    part(g, B(2.8, 0.3, 0.2), trimMat, 0, 3.45, d / 2 + 0.08);
  } else {
    // Commercial / Residential entrance stoop
    part(g, B(1.6, 0.16, 0.8), toon('#6e665e', 'stone'), 0, 0.08, d / 2 + 0.4);
    part(g, B(1.2, 2.2, 0.08), '#2c1e14', 0, 1.15, d / 2 + 0.03);
    part(g, B(1.5, 0.2, 0.12), trimMat, 0, 2.3, d / 2 + 0.05);

    // Warm storefront display windows
    if (w >= 7) {
      const winW = (w - 2.8) / 2;
      part(g, B(winW, 1.8, 0.06), glow('#ffe494'), -w / 4 - 0.2, 1.6, d / 2 + 0.03);
      part(g, B(winW, 1.8, 0.06), glow('#ffe494'), w / 4 + 0.2, 1.6, d / 2 + 0.03);
      // Window frame trims
      part(g, B(winW + 0.1, 0.1, 0.1), trimMat, -w / 4 - 0.2, 0.65, d / 2 + 0.05);
      part(g, B(winW + 0.1, 0.1, 0.1), trimMat, w / 4 + 0.2, 0.65, d / 2 + 0.05);
      part(g, B(winW + 0.1, 0.1, 0.1), trimMat, -w / 4 - 0.2, 2.55, d / 2 + 0.05);
      part(g, B(winW + 0.1, 0.1, 0.1), trimMat, w / 4 + 0.2, 2.55, d / 2 + 0.05);
    }
  }

  // 4. Middle belt cornice separating ground floor
  part(g, B(w + 0.25, 0.22, d + 0.25), trimMat, 0, 3.1, 0);

  // 5. Upper floor sash windows with stone sills
  for (let y = 4.4; y < h - 0.8; y += 1.8) {
    for (let x = -w / 2 + 1.2; x < w / 2 - 0.8; x += 1.6) {
      const lit = Math.sin(x * 6 + y * 4 + w) > -0.25;
      part(g, B(0.85, 1.1, 0.06), lit ? glow('#ffe0a0') : '#202a36', x, y + 0.5, d / 2 + 0.02);
      // Sill and lintel
      part(g, B(1.05, 0.1, 0.14), trimMat, x, y - 0.08, d / 2 + 0.05);
      part(g, B(1.05, 0.12, 0.1), trimMat, x, y + 1.08, d / 2 + 0.05);
    }
  }

  // 6. Roof Cornice & Mansard Slate Roof
  part(g, B(w + 0.35, 0.35, d + 0.35), trimMat, 0, h + 0.17, 0);
  const roofH = bStyle === 'civic' ? 2.8 : 2.0;
  part(g, tileBox(B(w - 0.3, roofH, d - 0.3), 1.2), roofMat, 0, h + roofH / 2 + 0.35, 0);
  part(g, B(w - 1.2, 0.25, d - 1.2), trimMat, 0, h + roofH + 0.45, 0);

  // Dormer windows on the slate roof
  if (w >= 8) {
    for (const sx of [-w * 0.25, w * 0.25]) {
      part(g, B(1.1, 1.1, 0.5), roofMat, sx, h + 1.1, d / 2 - 0.1);
      part(g, B(0.65, 0.75, 0.05), glow('#ffd080'), sx, h + 1.1, d / 2 + 0.16);
      part(g, new THREE.ConeGeometry(0.7, 0.5, 4), trimMat, sx, h + 1.8, d / 2 - 0.1, 0, Math.PI / 4, 0);
    }
  }

  // 7. Brick Chimneys with stone caps
  if (w >= 7) {
    part(g, B(0.8, 1.6, 0.8), toon('#7a4030', 'stone'), w / 3, h + roofH + 0.6, d / 4);
    part(g, B(1.0, 0.2, 1.0), toon('#3a3530', 'stone'), w / 3, h + roofH + 1.45, d / 4);
  }

  // 8. Awning & Sign
  if (awn) {
    part(g, B(w * 0.82, 0.08, 1.5), toon(awn, 'cloth'), 0, 2.7, d / 2 + 0.7, 0.22);
  }
  if (sign) {
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w - 0.6, 5.4), 0.85), psx(new THREE.MeshBasicMaterial({ map: signTex(sign, '#181a20', '#ffd36a') })));
    sg.position.set(0, 3.25, d / 2 + 0.09);
    g.add(sg);
  }

  return g;
}

// [label, x, z, w, d, h, facing ry, wall colour, trim, awning, bStyle]
const JT_BUILDINGS = [
  ['TOWN HALL', 0, -36, 18, 9, 11, 0, '#d8c8a8', '#8a6a44', null, 'civic'],
  ['BANK', -14, -14, 10, 8, 8.5, PI2, '#c9c0b0', '#c9a43a', null, 'commercial'],
  ['CLINIC', 14, -14, 10, 8, 8, -PI2, '#e8e4dc', '#c8402f', '#c8402f', 'commercial'],
  ['GUN SHOP', -14, 14, 10, 8, 8, PI2, '#8a6a4a', '#3a2a1e', '#5a6a3a', 'commercial'],
  ['GENERAL STORE', 14, 14, 10, 8, 8, -PI2, '#a88a6a', '#5d4a8a', '#8a6fc4', 'commercial'],
  ['TAILOR', -14, -27, 9, 7, 7, PI2, '#b8a8c8', '#5d3a8a', '#c86aff', 'commercial'],
  ['PET SHOP', 14, -27, 9, 7, 7, -PI2, '#c8b890', '#6fdc5a', '#6fdc5a', 'commercial'],
  ['DINER', -14, 27, 9, 7, 6, PI2, '#d8a878', '#c8402f', '#ffd36a', 'commercial'],
  ['HOTEL', 14, 27, 10, 8, 12, -PI2, '#9a8a9a', '#3b4f7a', '#3b4f7a', 'commercial'],
  ['FISH MARKET', 28, -12, 10, 7, 6, 0, '#a8b8c8', '#2a5a7a', '#4fa8ff', 'commercial'],
  ['ARCADE', -28, -12, 10, 7, 7, 0, '#5a2a6a', '#ff6aa8', '#ff6aa8', 'entertainment'],
  [null, -28, 12, 11, 8, 9, Math.PI, '#8a2a3a', '#ffd36a', '#c8402f', 'cinema'],
  ['GARAGE', 28, 12, 11, 7, 6, Math.PI, '#5d636c', '#ff8a2a', '#ff8a2a', 'industrial'],
  ['APARTMENTS', 28.5, 22.5, 9, 9, 15, Math.PI, '#b8a088', '#5a3a22', null, 'residential'],
  ['APARTMENTS', -30.5, -21, 9, 9, 14, PI2, '#a8b0b8', '#3a4a5a', null, 'residential'],
  [null, -37.5, 10.5, 7, 6, 7, PI2, '#d8c098', '#5a3a22', null, 'residential'],
  [null, 38, -8, 7, 6, 7.5, -PI2, '#b8b8c8', '#3b4f7a', null, 'residential'],
  [null, -24, -36, 8, 7, 8, 0.3, '#c8b0d8', '#5d3a8a', null, 'residential']
];

// NPC Positions: [x, z, face]
const JT_POS = {
  mayor: [0, -28.4, 0],
  nash: [-8.6, -14, PI2],
  mira: [8.6, -14, -PI2],
  tully: [-8.6, 14, PI2],
  zib: [8.6, 14, -PI2],
  ada: [-9.2, -27, PI2],
  tailor: [-9.2, -27, PI2],
  paws: [9.2, -27, -PI2],
  cookie: [-9.2, 27, PI2],
  hank: [9.2, 27, -PI2],
  gil: [28, -7.5, 0],
  vega: [3.5, 40, 0],
  dent: [-3.5, 40, 0],
  scoop: [7, -7, -0.8],
  banjo: [-7, 7, 2.4],
  elismas: [-7.5, -7.5, 0.8],
  merla: [7.5, 7.5, -2.4],
  arthur: [-36, -7.4, 0],
  bobby: [-16.6, 35.4, -0.6],
  barnaby: [-18, 6, 0.4],
  slick: [-20.5, -13, 0],
  viper: [-20.3, 13, Math.PI],
  pete: [-27.0, -7.2, 0.2]
};

// 3D Model: Barnaby the Cat
function makeCat() {
  const g = new THREE.Group();
  part(g, B(0.36, 0.26, 0.54), toon('#d8782a', 'fur'), 0, 0.22, 0);
  part(g, B(0.26, 0.14, 0.44), toon('#f4efe8', 'fur'), 0, 0.14, 0.02);
  const head = new THREE.Group();
  part(head, B(0.28, 0.24, 0.26), toon('#d8782a', 'fur'), 0, 0, 0);
  part(head, B(0.16, 0.1, 0.08), toon('#f4efe8', 'fur'), 0, -0.05, 0.14);
  part(head, B(0.04, 0.04, 0.02), toon('#ff9aa8'), 0, -0.02, 0.185);
  for (const s of [-1, 1]) {
    part(head, B(0.05, 0.06, 0.02), glow('#50ff60'), 0.08 * s, 0.04, 0.132);
    part(head, new THREE.ConeGeometry(0.06, 0.12, 4), toon('#d8782a', 'fur'), 0.1 * s, 0.16, 0.02, 0, Math.PI / 4, 0.2 * s);
    part(head, new THREE.ConeGeometry(0.04, 0.09, 4), toon('#ffb0c0'), 0.1 * s, 0.15, 0.03, 0, Math.PI / 4, 0.2 * s);
  }
  head.position.set(0, 0.36, 0.28);
  g.add(head);

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      part(g, Cy(0.05, 0.05, 0.2, 6), toon('#d8782a', 'fur'), 0.12 * sx, 0.1, 0.18 * sz);
      part(g, B(0.1, 0.05, 0.12), toon('#f4efe8', 'fur'), 0.12 * sx, 0.025, 0.18 * sz + 0.02);
    }
  }

  const tail = new THREE.Group();
  part(tail, Cy(0.035, 0.04, 0.38, 6), toon('#d8782a', 'fur'), 0, 0.18, 0, -0.6, 0, 0);
  part(tail, Cy(0.03, 0.035, 0.18, 6), toon('#f4efe8', 'fur'), 0, 0.38, -0.14, -1.1, 0, 0);
  tail.position.set(0, 0.22, -0.26);
  g.add(tail);

  levelAnims.push(t => {
    tail.rotation.z = Math.sin(t * 3.5) * 0.28;
    head.rotation.y = Math.sin(t * 1.2) * 0.15;
  });

  return g;
}

// 3D Model: Sizzling BBQ Kettle Grill
function makeBBQGrill() {
  const g = new THREE.Group();
  part(g, Cy(0.65, 0.2, 0.55, 12), toon('#222226', 'panel'), 0, 0.9, 0);
  part(g, new THREE.TorusGeometry(0.66, 0.04, 6, 16), toon('#44444a', 'panel'), 0, 1.18, 0, Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const a = i * (Math.PI * 2 / 3);
    part(g, Cy(0.03, 0.03, 0.95, 6), '#333338', Math.cos(a) * 0.35, 0.45, Math.sin(a) * 0.35, 0.25 * Math.sin(a), 0, -0.25 * Math.cos(a));
  }
  part(g, Cy(0.35, 0.35, 0.04, 6), '#222226', 0, 0.3, 0);
  part(g, Cy(0.6, 0.6, 0.1, 10), glow('#ff3a08'), 0, 1.0, 0);

  for (let i = -4; i <= 4; i++) {
    const x = i * 0.12;
    const len = Math.sqrt(Math.max(0.05, 0.62 * 0.62 - x * x)) * 2;
    part(g, B(0.02, 0.02, len), '#55555c', x, 1.12, 0);
  }
  for (const [bx, bz] of [[-0.2, -0.15], [0.2, -0.1], [0.0, 0.2], [-0.25, 0.2], [0.22, 0.22]]) {
    part(g, Cy(0.12, 0.12, 0.04, 8), toon('#4a2212', 'wood'), bx, 1.15, bz);
    part(g, B(0.08, 0.02, 0.08), toon('#ffcc00'), bx, 1.17, bz);
  }

  const smokePuffs = [];
  for (let i = 0; i < 5; i++) {
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.12 + i * 0.05, 6, 6), psx(new THREE.MeshBasicMaterial({ color: '#cccccc', transparent: true, opacity: 0.35 })));
    g.add(sp);
    smokePuffs.push(sp);
  }
  levelAnims.push(t => {
    smokePuffs.forEach((sp, i) => {
      const phase = (t * 0.8 + i * 0.6) % 3.0;
      sp.position.set(Math.sin(t * 1.5 + i) * 0.15, 1.25 + phase * 0.8, Math.cos(t * 1.5 + i) * 0.15);
      const sc = 0.8 + phase * 1.2;
      sp.scale.set(sc, sc, sc);
      sp.material.opacity = Math.max(0, 0.45 * (1.0 - phase / 3.0));
    });
  });
  return g;
}

// 3D Model: Arthur Vance's Book Signing Pavilion
// the Two Tired cover as a texture, for the booth poster and the comic stacks (single-sided so it never reads backwards)
let COMIC_COVER_MAT = null;
function comicCoverMat() {
  if (!COMIC_COVER_MAT) { const t = new THREE.TextureLoader().load(`${COMICS.twotired.dir}/1.jpg`); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; COMIC_COVER_MAT = new THREE.MeshBasicMaterial({ map: t }); }
  return COMIC_COVER_MAT;
}
function makeBookSigningBooth() {
  const g = new THREE.Group();
  part(g, B(3.6, 0.1, 2.6), toon('#1a6b7c', 'cloth'), 0, 2.8, 0);
  part(g, B(3.8, 0.35, 0.08), toon('#ffd36a', 'cloth'), 0, 2.7, 1.3);
  part(g, B(3.8, 0.35, 0.08), toon('#ffd36a', 'cloth'), 0, 2.7, -1.3);
  for (const s of [-1, 1]) {
    part(g, Cy(0.04, 0.04, 2.8, 6), '#cfd3d8', 1.7 * s, 1.4, 1.2);
    part(g, Cy(0.04, 0.04, 2.8, 6), '#cfd3d8', 1.7 * s, 1.4, -1.2);
  }
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.65), psx(new THREE.MeshBasicMaterial({ map: signTex('PAIL & BIG E · COMICS', '#102830', '#ff9a2a'), side: THREE.DoubleSide })));
  sg.position.set(0, 2.75, 1.35);
  g.add(sg);

  part(g, B(2.6, 0.1, 1.0), toon('#8a6a44', 'wood'), 0, 0.9, 0.3);
  for (const s of [-1, 1]) part(g, B(0.08, 0.9, 0.8), '#2b2a2c', 1.1 * s, 0.45, 0.3);

  // stacks of Two Tired on the table, each topped with the real cover
  const cover = comicCoverMat();
  for (const [cx, cz, rot] of [[-0.8, 0.3, 0.1], [-0.4, 0.35, -0.05], [0.4, 0.28, 0.2], [0.8, 0.32, -0.15]]) {
    for (let k = 0; k < 6; k++) part(g, B(0.35, 0.025, 0.42), k === 5 ? toon('#1a7a82') : '#eeeeee', cx, 0.96 + k * 0.025, cz, 0, rot);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.42), cover); top.rotation.set(-Math.PI / 2, 0, rot); top.position.set(cx, 0.96 + 5 * 0.025 + 0.014, cz); g.add(top);
  }

  const easel = new THREE.Group();
  part(easel, Cy(0.03, 0.03, 1.9, 5), toon('#6a4a2e', 'wood'), -0.4, 0.95, -0.2, 0.15, 0, -0.2);
  part(easel, Cy(0.03, 0.03, 1.9, 5), toon('#6a4a2e', 'wood'), 0.4, 0.95, -0.2, 0.15, 0, 0.2);
  part(easel, Cy(0.03, 0.03, 1.7, 5), toon('#6a4a2e', 'wood'), 0, 0.85, -0.6, -0.4, 0, 0);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.08), cover);
  poster.position.set(0, 1.25, -0.15);
  poster.rotation.x = -0.15;
  easel.add(poster);
  easel.position.set(1.9, 0, 0.2);
  g.add(easel);

  return g;
}

// 3D Model: Retro Arcade Cabinet
function makeArcadeCabinet(title, screenCol, marqueeCol) {
  const g = new THREE.Group();
  // Main cabinet body
  part(g, B(0.78, 1.85, 0.76), toon('#181a24'), 0, 0.925, 0);
  // Colored side art stripes
  for (const s of [-1, 1]) {
    part(g, B(0.04, 1.6, 0.65), toon(marqueeCol), 0.395 * s, 0.95, 0);
    part(g, B(0.02, 1.4, 0.5), toon(screenCol), 0.425 * s, 0.95, 0); // sits proud of the stripe so the faces never fight
  }
  // Slanted screen recess
  part(g, B(0.66, 0.55, 0.1), '#0a0c10', 0, 1.15, 0.34, -0.3, 0, 0);
  part(g, B(0.58, 0.45, 0.04), glow(screenCol), 0, 1.15, 0.36, -0.3, 0, 0);
  // Control panel shelf angled forward
  part(g, B(0.72, 0.12, 0.36), toon('#252732'), 0, 0.82, 0.45, 0.22, 0, 0);
  // Joystick
  part(g, Cy(0.015, 0.015, 0.1, 6), '#cfd3d8', -0.16, 0.91, 0.45);
  part(g, new THREE.SphereGeometry(0.035, 6, 6), toon('#ff2233'), -0.16, 0.97, 0.45);
  // Buttons
  for (let i = 0; i < 3; i++) {
    part(g, Cy(0.025, 0.025, 0.02, 8), toon(['#4fe0d0', '#ffd36a', '#ff4a3a'][i]), 0.08 + i * 0.08, 0.88, 0.45);
  }
  // Lower coin door
  part(g, B(0.45, 0.5, 0.04), toon('#111318'), 0, 0.35, 0.39);
  for (const s of [-1, 1]) {
    part(g, B(0.08, 0.12, 0.02), toon('#ff3a2a'), 0.12 * s, 0.42, 0.41);
    part(g, B(0.04, 0.01, 0.03), '#101010', 0.12 * s, 0.44, 0.42);
  }
  // Top backlit marquee banner
  const mq = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.26), psx(new THREE.MeshBasicMaterial({ map: signTex(title, '#0a0d14', screenCol), side: THREE.DoubleSide })));
  mq.position.set(0, 1.68, 0.38);
  g.add(mq);
  part(g, B(0.76, 0.05, 0.2), toon('#3a3d4a'), 0, 1.83, 0.32);

  return g;
}

// 3D Model: Municipal Notice Board
function makeNoticeBoard() {
  const g = new THREE.Group();
  // Timber posts
  for (const s of [-1, 1]) {
    part(g, B(0.2, 2.7, 0.2), toon('#4a3522', 'wood'), 1.35 * s, 1.35, 0);
    part(g, B(0.32, 0.3, 0.32), toon('#6a6258', 'stone'), 1.35 * s, 0.15, 0);
  }
  // Bulletin cork board
  part(g, B(2.8, 1.6, 0.1), toon('#b88c58', 'wood'), 0, 1.6, 0);
  part(g, B(2.9, 0.1, 0.14), toon('#5a3a22', 'wood'), 0, 2.45, 0);
  part(g, B(2.9, 0.1, 0.14), toon('#5a3a22', 'wood'), 0, 0.75, 0);

  // Overhanging pitched roof canopy
  part(g, B(3.2, 0.12, 0.8), toon('#4a3522', 'wood'), 0, 2.75, 0.15, 0.25, 0, 0);
  part(g, B(3.3, 0.15, 0.15), toon('#4a3522', 'wood'), 0, 2.85, 0.15);

  // Hanging brass lantern
  part(g, Cy(0.02, 0.02, 0.35, 6), '#222222', 0, 2.55, 0.45);
  part(g, Cy(0.12, 0.14, 0.28, 6), toon('#c9a43a'), 0, 2.35, 0.45);
  part(g, new THREE.OctahedronGeometry(0.08, 0), glow('#ffe0a0'), 0, 2.35, 0.45);

  // Header plaque: "NEW JAMESTOWN GAZETTE"
  const hd = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.32), psx(new THREE.MeshBasicMaterial({ map: signTex('NEW JAMESTOWN GAZETTE', '#241a10', '#ffd36a'), side: THREE.DoubleSide })));
  hd.position.set(0, 2.22, 0.06);
  g.add(hd);

  // Pinned flyers & notices
  const f1 = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.55), psx(new THREE.MeshBasicMaterial({ map: signTex('★ THE ROXY ★\nNOW SHOWING', '#180810', '#ffd36a'), side: THREE.DoubleSide })));
  f1.position.set(-0.8, 1.62, 0.06);
  f1.rotation.z = 0.05;
  g.add(f1);

  const f2 = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.55), psx(new THREE.MeshBasicMaterial({ map: signTex('ARANUS MAN\nBOOK SIGNING', '#102830', '#ff9a2a'), side: THREE.DoubleSide })));
  f2.position.set(0.05, 1.64, 0.06);
  f2.rotation.z = -0.04;
  g.add(f2);

  const f3 = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.5), psx(new THREE.MeshBasicMaterial({ map: signTex('WANTED\nOUTLAWS', '#2a0a0a', '#ff4a3a'), side: THREE.DoubleSide })));
  f3.position.set(0.85, 1.60, 0.06);
  f3.rotation.z = 0.03;
  g.add(f3);

  const f4 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.45), psx(new THREE.MeshBasicMaterial({ map: signTex('BOBBY\'S BBQ · FRESH BURGERS', '#2a1a10', '#ffd36a'), side: THREE.DoubleSide })));
  f4.position.set(-0.4, 1.05, 0.06);
  g.add(f4);

  const f5 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), psx(new THREE.MeshBasicMaterial({ map: signTex('PETS & FISH\nCAT SIGHTING', '#102010', '#6fdc5a'), side: THREE.DoubleSide })));
  f5.position.set(0.55, 1.06, 0.06);
  g.add(f5);

  return g;
}

// 3D Model: Diner Outdoor Cafe Table & Chairs
function makeDinerTable() {
  const g = new THREE.Group();
  // Chrome base and pedestal
  part(g, Cy(0.4, 0.4, 0.04, 16), '#cfd3d8', 0, 0.02, 0);
  part(g, Cy(0.05, 0.05, 0.75, 8), '#d8dcde', 0, 0.4, 0);
  // Round tabletop with red checkered cloth
  part(g, Cy(0.75, 0.75, 0.06, 20), toon('#c83232', 'cloth'), 0, 0.78, 0);
  part(g, Cy(0.72, 0.72, 0.02, 20), toon('#ffffff', 'cloth'), 0, 0.815, 0);
  // Condiments
  part(g, Cy(0.035, 0.04, 0.16, 6), toon('#c82222'), -0.08, 0.9, 0.02);
  part(g, Cy(0.035, 0.04, 0.16, 6), toon('#e8b820'), 0.08, 0.9, 0.02);
  part(g, Cy(0.025, 0.03, 0.12, 6), '#e8e8e8', 0, 0.88, -0.08);

  // Two red retro diner chairs
  for (const s of [-1, 1]) {
    const ch = new THREE.Group();
    // 4 chrome legs
    for (const lx of [-0.18, 0.18]) {
      for (const lz of [-0.18, 0.18]) {
        part(ch, Cy(0.02, 0.02, 0.46, 6), '#cfd3d8', lx, 0.23, lz);
      }
    }
    // Round red vinyl seat
    part(ch, Cy(0.24, 0.24, 0.08, 14), toon('#c82a2a'), 0, 0.48, 0);
    // Chrome backrest frame and red pad
    for (const bx of [-0.16, 0.16]) part(ch, Cy(0.018, 0.018, 0.45, 6), '#cfd3d8', bx, 0.7, -0.18);
    part(ch, B(0.36, 0.2, 0.05), toon('#c82a2a'), 0, 0.8, -0.18);

    ch.position.set(0, 0, 1.1 * s);
    ch.rotation.y = s > 0 ? Math.PI : 0;
    g.add(ch);
  }

  return g;
}

// ---- All NPCs in New Jamestown ----
const JT_NPCS = [
  { id: 'vega', name: 'Captain Vega', role: 'City watch', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#3b4f7a', '#4a5229': '#2a3756', '#c9b27c': '#d9c48a' }), x: 3.5, z: 40, face: 0, idle: ["Welcome to New Jamestown. Biggest city on Earth. Also the only one left.", "Keep your blaster charged out there. In here, keep it holstered."] },
  { id: 'dent', name: 'Officer Dent', role: 'City watch', rig: 'trooper', make: () => recolor(makeTrooper(), { '#6f7a3e': '#2a3756', '#c9b27c': '#ffd36a' }), x: -3.5, z: 40, face: 0, idle: ["No running in the plaza. No shooting in the plaza. No fun in the plaza, basically."] },
  { id: 'tully', name: 'Tully', role: 'Gunsmith', rig: 'civ', make: () => makeCivilian('#7a5a3c', '#3d3a36', '#d9a77a', '#3a2a1e', '#4a3a2c'), x: -8.6, z: 14, face: PI2, shop: 'guns', guns: ['b1', 'b5', 'c10', 'r15', 'h20'], melee: ['cleaver', 'hook'], idle: ["If it shoots, I can make it shoot better.", "Scrap builds walls too. Press Build out past the city gate."] },
  { id: 'zib', name: 'Zib', role: 'General store · buys anything', rig: 'spearman', make: () => recolor(makeSpearman(), { '#7fae63': '#8a6fc4', '#4f7a3c': '#5d4a8a' }), x: 8.6, z: 14, face: -PI2, shop: 'store', idle: ["Zib buys! Zib sells! Pelts, shells, crystals, all good.", "Rock cores from the mesa fetch a fine price."] },
  { id: 'mira', name: 'Doc Mira', role: 'Clinic', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#5a6a7a', '#c58a64', '#1e1a18', '#c8402f'), x: 8.6, z: -14, face: -PI2, heal: true, idle: ["Hold still. There, good as new.", "Come back in one piece, please. Two pieces is a lot more paperwork."] },
  { id: 'nash', name: 'Old Nash', role: 'Bank', rig: 'civ', make: () => makeCivilian('#2e5a3a', '#2c2a28', '#e0b892', '#cfcac0'), x: -8.6, z: -14, face: PI2, bank: true, idle: ["Credits in the bank don't get dropped when you go down.", "Safest vault on Earth. Probably."] },
  { id: 'elismas', name: 'Elismas', role: 'Master of the Gun', rig: 'elismas', make: makeElismas, x: -7.5, z: -7.5, face: 0.8, showIf: () => qDone('q3') || qState('q4'), idle: ["A true gunner never wastes a shot.", "The galaxy is wide. Your ship will carry you to the other Masters."] },
  { id: 'mayor', name: 'Mayor Holloway', role: 'Mayor of New Jamestown · town news', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#c58a64', '#cfcac0', '#c9a43a'), x: 0, z: -30.5, face: 0, custom: [['Town news', () => openUpdates(false)]], idle: ["New Jamestown! Named after the old one. Which was named after an older one. We're very traditional.", "Ask me for the town news. I have SO much news."] },
  { id: 'cookie', name: 'Cookie', role: 'Diner · heals', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#c8402f', '#8a5a3a', '#1e1a18', '#ffd36a'), x: -9.2, z: 27, face: PI2, heal: true, custom: [
    ['🍽️ Diner Specials', () => openDinerMenu()]
  ], idle: ["Today's special: space meatloaf. Yesterday's special: also space meatloaf.", "Eat something. You look like you've been shot. Have you been shot?"] },
  { id: 'tailor', name: 'Ada the Tailor', role: 'Wardrobe · faces · capes', rig: 'civ', make: () => makeCivilian('#5d3a8a', '#2c2a28', '#e0b892', '#c8402f', '#c86aff'), x: -9.2, z: -27, face: PI2, custom: [['Wardrobe', () => openWardrobe()]], idle: ["Armor is just clothing that argues with bullets.", "Let me guess: something dramatic with a cape. Always a cape."] },
  { id: 'paws', name: 'Auntie Paws', role: 'Pet shop', rig: 'civ', make: () => makeCivilian('#6fdc5a', '#3d3a36', '#c58a64', '#e8e4dc', '#ffd23a'), x: 9.2, z: -27, face: -PI2, petshop: true, idle: ["Every pet deserves a home. Some pets deserve a cage. That one bites."] },
  { id: 'gil', name: 'Gil', role: 'Fish market', rig: 'civ', make: () => makeCivilian('#2a5a7a', '#2c2a28', '#e0b892', '#5a3a22', '#ffb347'), x: 28, z: -7.5, face: 0, shop: 'fish', rods: [1, 2], idle: ["Bring me fish. Any fish. Even the angry ones."] },
  { id: 'scoop', name: 'Scoop', role: 'Newsie', rig: 'civ', make: () => makeCivilian('#c9a43a', '#3d3a36', '#d9a77a', '#5a3a22', '#c8402f'), x: 7, z: -7, face: -0.8, idle: ["EXTRA! EXTRA! Trooper saves Earth, still can't parallel park!", "EXTRA! Drome's robots spotted in the scrapyard! Again! Still!", "EXTRA! Mayor says everything is fine! Mayor seen hiding under desk!"] },
  { id: 'banjo', name: 'Banjo Bob', role: 'Street musician', rig: 'civ', make: () => makeCivilian('#8a3a2e', '#3d3a36', '#c58a64', '#cfcac0', '#c9a43a'), x: -7, z: 7, face: 2.4, idle: ["♪ Oh the sun is setting red, and the robots want me dead ♪", "Tips appreciated. Requests tolerated."] },
  { id: 'hank', name: 'Hotel Hank', role: 'Hotel · rest', rig: 'civ', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#e0b892', '#1e1a18', '#e8e4dc'), x: 9.2, z: 27, face: -PI2, heal: true, idle: ["Rooms are free for heroes. Heroes are anyone who pays. Kidding. Mostly."] },
  { id: 'pete', name: 'Pixel Pete', role: 'Arcade Champion', rig: 'civ', make: () => makeCivilian('#4a2a6b', '#1e1a24', '#e0b892', '#ff6aa8', '#4fe0d0'), x: -27.2, z: -8.2, face: 0.2, idle: ["My record on Space Snake is 34. Think you can beat it?", "Space Rocks is all about thruster feathering. Never hold down W too long!", "Got high scores on both cabinets. Press E to play!"] },
  // New Additions:
  { id: 'arthur', name: 'Arthur Vance', role: 'Comic printer · Pail & Big E', rig: 'civ', make: () => makeCivilian('#2a6b7c', '#2c2a28', '#e0b892', '#5a3a22', '#ff9a2a'), x: -28, z: 0, face: PI2, custom: [
    ['📖 Read "Two Tired"', () => openComicReader()],
    ['🚲 Buy "Two Tired" (40 cr)', () => buyComic()],
    ['💊 Sell writing stimulants', () => openArthurDealing()]
  ], idle: ["Pail & Big E! Five jokes, zero apologies, forty credits!", "Big E thinks he's Aranus Man. Issue #2 might prove him right. Buy a copy!", "Writer's block is killing me. If you have any Focus Fizz, I'd pay double."] },
  { id: 'bobby', name: 'Bobby the Grillmaster', role: 'Backyard BBQ', rig: 'civ', make: () => makeCivilian('#c8402f', '#2c2a28', '#d9a77a', '#1e1a18', '#ffffff'), x: -21, z: 34, face: -0.6, heal: true, custom: [
    ['🍔 Grab a Bobby Burger', () => grabBurger()]
  ], idle: ["Low and slow, trooper. That's how you get real flavor into space patties.", "Grab a hot burger off the grate whenever you're hungry."] },
  { id: 'barnaby', name: 'Barnaby', role: 'Town Cat · 🐱 Pet', rig: 'cat', make: makeCat, x: -18, z: 6, face: 0.4, custom: [
    ['🐱 Pet Barnaby', () => petBarnaby()],
    ['🐟 Feed fresh fish', () => feedBarnabyFish()]
  ], idle: ["Purrrrrr...", "Meow?"] },
  { id: 'slick', name: 'Slick Eddie', role: 'Shady Street Runner', rig: 'civ', make: () => makeCivilian('#1c1e24', '#141416', '#c58a64', '#1e1a18', '#c9a43a'), x: -23, z: -18, face: PI2, custom: [
    ['💼 Street Network', () => talkRunner('slick')]
  ], idle: ["Watch your back in the alleys.", "Got product to push? Talk to me when you've got rep."] },
  { id: 'viper', name: 'Viper', role: 'Shady Street Runner', rig: 'civ', make: () => makeCivilian('#2e3a24', '#1a1e16', '#d9a77a', '#1e1a18', '#6fdc5a'), x: -23, z: 18, face: PI2, custom: [
    ['💼 Street Network', () => talkRunner('viper')]
  ], idle: ["The watch doesn't come down this alley.", "Keep moving unless you're talking business."] }
];

// Rework Earth level around the revamped capital city
{
  const E0 = LEVELS.earth, T = (p) => ET(p[0], p[1]);
  E0.size = Math.round(280 * JT_K);
  E0.radius = Math.round(92 * JT_K);
  E0.center = T(E0.center);
  E0.tag = 'New Jamestown, the capital city';
  E0.zones = E0.zones.map(z => {
    if (z.id === 'town') return Object.assign({}, z, { name: 'New Jamestown', lvl: 'Safe · capital city', r: JT_R, fr: JT_R + 4 });
    const [x, zz] = T([z.x, z.z]), o = Object.assign({}, z, { x, z: zz, r: z.r * 1.25, fr: z.fr ? z.fr * 1.25 : z.fr });
    if (z.id === 'out') { o.x = 0; o.z = TOWN.z + JT_R + 30; o.r = 20; }
    return o;
  });
  E0.safes = [{ x: TOWN.x, z: TOWN.z, r: JT_R - 1 }];
  const rv = E0.river.map(T); rv[1][0] -= 18; rv[2][0] -= 18; rv[3][0] -= 12; E0.river = rv;
  E0.paths = E0.paths.map((p, i) => i === 0 ? [[0, TOWN.z + JT_R], [0, T([0, 4])[1]]] : p.map(T));
  E0.pools = E0.pools.map(p => [...T(p), p[2] * 1.3]);
  E0.lava = E0.lava.map(p => [...T(p), p[2] * 1.3]);
  const oc = E0.carve;
  E0.carve = (x, z, h) => oc(TOWN.x + (x - TOWN.x) / JT_K, TOWN.z + (z - TOWN.z) / JT_K, h);
  E0.spawn = { x: TOWN.x + 1.5, z: TOWN.z + 36, yaw: 0 };
  E0.pad = { x: TOWN.x + 28, z: TOWN.z - 30 };
  E0.menu = { x: TOWN.x, z: TOWN.z, r: 70, h: 30 };
  E0.npcs = JT_NPCS.map(n => {
    const o = EARTH_NPCS.find(q => q.id === n.id), p = JT_POS[n.id] || [n.x, n.z, n.face];
    return Object.assign({}, o || n, { x: p[0], z: p[1], face: p[2], role: n.role, idle: n.idle, custom: n.custom || (o && o.custom), make: n.make || (o && o.make), shop: n.shop || (o && o.shop), guns: n.guns || (o && o.guns), heal: n.heal || (o && o.heal), bank: n.bank || (o && o.bank), petshop: n.petshop || (o && o.petshop), rods: n.rods || (o && o.rods), showIf: n.showIf || (o && o.showIf) });
  });
}

function buildJamestown() {
  initJamestownLate();
  const tx = TOWN.x, tz = TOWN.z, G = (x, z) => groundH(tx + x, tz + z);

  // 1. Paved Boulevards, Sidewalks, and Central Plaza
  const pave = (w, d, x, z, col, top) => {
    const m = part(props, B(w, 0.3, d), toon(col, 'stone'), tx + x, G(x, z) + top - 0.15, tz + z);
    m.castShadow = false;
  };

  // Main Boulevard North-South and Avenue East-West
  pave(10, JT_R * 2 - 2, 0, 0, '#9a9088', 0.09);
  pave(JT_R * 2 - 2, 8, 0, 0, '#948a82', 0.12);

  // Sidewalk curbs and stone walkways
  for (const s of [-1, 1]) {
    pave(2.4, JT_R * 2 - 4, 6.2 * s, 0, '#b8b0a4', 0.05);
    pave(JT_R * 2 - 4, 2.2, 0, 5.1 * s, '#b8b0a4', 0.06);
  }

  // Circular Fountain Plaza
  {
    const pl = new THREE.Mesh(new THREE.CircleGeometry(11.5, 32), toon('#b8a888', 'stone'));
    pl.rotation.x = -Math.PI / 2;
    pl.position.set(tx, G(0, 0) + 0.155, tz);
    props.add(pl);
  }

  // Pedestrian Crosswalks
  for (let i = -4; i <= 4; i++) {
    for (const zz of [12.5, -12.5]) part(props, B(0.7, 0.04, 2.2), '#efe7d6', tx + i * 1.1, G(0, zz) + 0.11, tz + zz);
  }
  for (let i = -3; i <= 3; i++) {
    for (const xx of [12.5, -12.5]) part(props, B(2.2, 0.04, 0.7), '#efe7d6', tx + xx, G(xx, 0) + 0.14, tz + i * 1.1);
  }

  // 2. City Wall & South Gatehouse
  const N = 92;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.09) continue;
    const x = Math.cos(a) * JT_R, z = Math.sin(a) * JT_R;
    part(props, B(3.1, 3.4, 0.8), toon('#a89a88', 'stone'), tx + x, G(x, z) + 1.7, tz + z, 0, -a + Math.PI / 2, 0);
    if (i % 11 === 5) {
      part(props, B(2.2, 5.6, 2.2), toon('#8a7a68', 'stone'), tx + x, G(x, z) + 2.8, tz + z);
      part(props, new THREE.ConeGeometry(1.7, 1.8, 4), '#5a3a22', tx + x, G(x, z) + 6.4, tz + z, 0, Math.PI / 4, 0);
      solid(tx + x, tz + z, 1.3);
    }
  }
  RINGS.push({ x: tx, z: tz, r: JT_R, gate: Math.PI / 2, half: 4.2, safe: true });

  // South Gate Monument
  {
    const gate = new THREE.Group();
    for (const s of [-1, 1]) part(gate, B(2.0, 8.2, 2.0), toon('#8a7a68', 'stone'), 5 * s, 4.1, 0);
    part(gate, B(12.4, 1.6, 2.0), toon('#8a7a68', 'stone'), 0, 8.6, 0);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.0), psx(new THREE.MeshBasicMaterial({ map: signTex('NEW JAMESTOWN', '#181a20', '#ffd36a'), side: THREE.DoubleSide })));
    sg.position.set(0, 8.6, 1.05);
    sg.scale.set(1.4, 1.4, 1);
    gate.add(sg);
    at(gate, tx, tz + JT_R);
    solid(tx - 5, tz + JT_R, 1.2);
    solid(tx + 5, tz + JT_R, 1.2);
  }

  // 3. Buildings
  for (const [label, x, z, w, d, h, ry, col, trim, awn, bStyle] of JT_BUILDINGS) {
    const b = bStyle === 'cinema' && typeof makeRoxy === 'function' ? makeRoxy(w, h, d) : makeJTBuilding(w, h, d, col, trim, label, awn, bStyle === 'cinema' ? 'entertainment' : bStyle);
    at(b, tx + x, tz + z, ry);
    const sw = Math.abs(Math.sin(ry)) > 0.7;
    box(tx + x, tz + z, (sw ? d : w) / 2 + 0.2, (sw ? w : d) / 2 + 0.2);
  }

  // Cinema Marquee & Walk-In Entrance at [-28, 12]
  {
    const cx = tx - 28, cz = tz + 12;
    // the marquee, doors and booth are part of the Roxy building now (roxy.js)
    // Interaction trigger to enter the Roxy Cinema
    INTERACTS.push({
      x: cx,
      z: cz - 6.4,
      r: 2.8,
      label: 'Enter The Roxy Cinema',
      fn: () => enterCinema(cx, cz - 6.4)
    });
  }

  // 4. Town Hall Neoclassical Columns & Municipal Flag
  for (let i = 0; i < 6; i++) {
    const x = -7 + i * 2.8;
    part(props, Cy(0.42, 0.48, 7.2, 8), '#e8e4dc', tx + x, G(x, -30.4) + 3.6, tz - 30.4);
    solid(tx + x, tz - 30.4, 0.5);
  }
  part(props, B(18.4, 0.9, 2.2), '#d8c8a8', tx, G(0, -31) + 7.4, tz - 30.6);
  part(props, B(18.4, 0.5, 3.4), toon('#9a9088', 'stone'), tx, G(0, -31) + 0.25, tz - 30.4);
  {
    const fl = new THREE.Group();
    part(fl, Cy(0.06, 0.06, 6.4, 6), '#cfd3d8', 0, 3.2, 0);
    const cl = part(fl, B(1.9, 1.15, 0.04), toon('#3b4f7a', 'cloth'), 0.95, 5.6, 0);
    at(fl, tx + 12, tz - 29);
    levelAnims.push(t => { cl.rotation.y = Math.sin(t * 2) * 0.25; });
  }

  // 5. Central Plaza Statue & Fountain
  {
    const st = new THREE.Group();
    part(st, Cy(1.7, 2.0, 1.3, 10), toon('#9a9088', 'stone'), 0, 0.65, 0);
    part(st, B(0.9, 3.4, 0.9), toon('#c9c0b0', 'stone'), 0, 3.0, 0);
    part(st, new THREE.ConeGeometry(0.7, 1.1, 4), toon('#c9c0b0', 'stone'), 0, 5.1, 0, 0, Math.PI / 4, 0);
    part(st, new THREE.TorusGeometry(1.15, 0.12, 6, 20, Math.PI), glow('#ff9a3c'), 0, 4.8, 0);
    for (const s of [-1, 1]) part(st, B(0.12, 2.8, 0.04), '#cfd3d8', 0.55 * s, 4.6, 0.5, 0, 0, 0.6 * s);
    at(st, tx, tz);
    solid(tx, tz, 2.0);

    const water = new THREE.Mesh(new THREE.RingGeometry(2.0, 3.0, 24), psx(new THREE.MeshLambertMaterial({ map: TEX.water, color: new THREE.Color('#4fa8ff').convertSRGBToLinear(), transparent: true, opacity: 0.75 })));
    water.rotation.x = -Math.PI / 2;
    water.position.set(tx, G(0, 0) + 0.35, tz);
    props.add(water);
    part(props, new THREE.TorusGeometry(3.05, 0.18, 4, 24), toon('#9a9088', 'stone'), tx, G(0, 0) + 0.3, tz, Math.PI / 2);
    solid(tx, tz, 3.1);
  }

  // 6. Arthur Vance's comic stand: Pail & Big E
  {
    const booth = makeBookSigningBooth();
    at(booth, tx - 36, tz - 9.6, 0);
    solid(tx - 36, tz - 9.6, 1.8);
  }

  // 7. Backyard BBQ Patio & Bobby the Grillmaster
  {
    const grill = makeBBQGrill();
    at(grill, tx - 18, tz + 33.6);
    solid(tx - 18, tz + 33.6, 0.8);

    // Picnic Table with benches & condiments
    part(props, B(2.4, 0.1, 1.2), toon('#8a5a3a', 'wood'), tx - 20.6, G(-20.6, 34.8) + 0.85, tz + 34.8);
    for (const s of [-1, 1]) part(props, B(0.12, 0.8, 0.9), '#3a2a1e', tx - 20.6 + 0.9 * s, G(-20.6, 34.8) + 0.4, tz + 34.8);
    for (const s of [-1, 1]) part(props, B(2.4, 0.08, 0.45), toon('#8a5a3a', 'wood'), tx - 20.6, G(-20.6, 34.8) + 0.45, tz + 34.8 + 0.85 * s);
    part(props, Cy(0.04, 0.05, 0.22, 6), toon('#c82218'), tx - 20.8, G(-20.6, 34.8) + 0.98, tz + 34.9);
    part(props, Cy(0.04, 0.05, 0.22, 6), toon('#e8b820'), tx - 20.5, G(-20.6, 34.8) + 0.98, tz + 34.9);
    solid(tx - 20.6, tz + 34.8, 1.2);
  }

  // 8. Back Alleys (Smuggler's Cut): the two gaps west of Main Street where the runners work, crates and one dim lamp each
  for (const [ax, az, s] of [[-20.6, -16.5, -1], [-20.4, 17, 1]]) {
    cityProp('crates', tx + ax - 0.6, tz + az, 0.3, 'earth'); cityProp('barrel', tx + ax + 0.9, tz + az + 0.6 * s, 0, 'earth'); cityProp('trash', tx + ax + 1.2, tz + az - 1.2 * s, 0, 'earth');
    const dl = new THREE.PointLight(0xff9a5a, 0.5, 6, 1.8); dl.position.set(tx + ax, G(ax, az) + 3, tz + az - 2 * s); levelGroup.add(dl);
  }

  // 9. Street Lamps, Planters, and Park Benches
  const lampAt = (x, z) => {
    part(props, Cy(0.08, 0.1, 4.2, 6), '#2b2a2c', tx + x, G(x, z) + 2.1, tz + z);
    part(props, B(0.85, 0.08, 0.08), '#2b2a2c', tx + x + 0.4, G(x, z) + 4.1, tz + z);
    part(props, B(0.42, 0.38, 0.42), glow('#ffe0a0'), tx + x + 0.78, G(x, z) + 3.9, tz + z);
    solid(tx + x, tz + z, 0.2);
  };
  for (let z = -26; z <= 38; z += 9) if (Math.abs(z) > 12) for (const s of [-1, 1]) lampAt(7.6 * s, z);
  for (let x = -38; x <= 38; x += 9) if (Math.abs(x) > 12) for (const s of [-1, 1]) if (!(x === -29 && s > 0)) lampAt(x, 6.5 * s); // no lamp in front of the Roxy doors

  // Plaza Benches
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + 0.39, x = Math.cos(a) * 9.2, z = Math.sin(a) * 9.2, b = new THREE.Group();
    part(b, B(1.8, 0.1, 0.5), toon('#8a6a44', 'wood'), 0, 0.5, 0);
    part(b, B(1.8, 0.5, 0.08), toon('#8a6a44', 'wood'), 0, 0.8, -0.22);
    for (const s of [-1, 1]) part(b, B(0.08, 0.5, 0.45), '#2b2a2c', 0.8 * s, 0.25, 0);
    at(b, tx + x, tz + z, Math.atan2(-x, -z));
    solid(tx + x, tz + z, 0.55);
  }

  // Boulevard Street Trees
  for (let z = -24; z <= 36; z += 12) {
    if (Math.abs(z) > 14) for (const s of [-1, 1]) {
      const x = 6.5 * s;
      part(props, Cy(0.16, 0.22, 2.8, 6), toon('#5a3a22', 'bark'), tx + x, G(x, z) + 1.4, tz + z);
      E(props, toon('#4f8a3a', 'leaves'), tx + x, G(x, z) + 3.2, tz + z, 1.2, 1.3, 1.2);
      solid(tx + x, tz + z, 0.35);
    }
  }

  // 10. Town Commons & Park (South-West: Pond, Trees, Gazebo)
  {
    const px = -30, pz = 24;
    const pond = new THREE.Mesh(new THREE.CircleGeometry(4.8, 22), psx(new THREE.MeshLambertMaterial({ map: TEX.water, color: new THREE.Color('#4fa8ff').convertSRGBToLinear(), transparent: true, opacity: 0.82 })));
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(tx + px, G(px, pz) + 0.08, tz + pz);
    props.add(pond);
    solid(tx + px, tz + pz, 4.6);

    for (let i = 0; i < 10; i++) {
      const a = i * 0.63, x = px + Math.cos(a) * 7.2, z = pz + Math.sin(a) * 5.6;
      part(props, Cy(0.25, 0.35, 3.4, 6), toon('#5a3a22', 'bark'), tx + x, G(x, z) + 1.7, tz + z);
      E(props, toon(i % 2 ? '#3f8a2f' : '#5aa04a', 'leaves'), tx + x, G(x, z) + 4.0, tz + z, 1.9, 1.6, 1.9);
      solid(tx + x, tz + z, 0.45);
    }

    // Gazebo
    const gz = new THREE.Group();
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2;
      part(gz, Cy(0.1, 0.1, 2.8, 6), '#e8e4dc', Math.cos(a) * 2.2, 1.4, Math.sin(a) * 2.2);
    }
    part(gz, new THREE.ConeGeometry(3.0, 1.5, 6), toon('#c8402f', 'cloth'), 0, 3.4, 0);
    part(gz, Cy(2.4, 2.4, 0.22, 6), toon('#9a9088', 'stone'), 0, 0.11, 0);
    at(gz, tx - 20, tz + 30);
    solid(tx - 20, tz + 30, 0.7);
  }

  // 11. Parked Hover Cars
  if (typeof makeHoverCar === 'function') {
    for (const [x, z, ry, c, st] of [
      [-20, 2.6, 0, '#c8402f', 'muscle'],
      [20, -2.6, Math.PI, '#4fd2ff', 'wedge'],
      [26, 2.6, 0, '#ffd36a', 'bubble'],
      [-32, -2.6, Math.PI, '#6fdc5a', 'jet'],
      [3.4, 24, Math.PI / 2, '#ff6aa8', 'manta'],
      [-3.4, -22, -Math.PI / 2, '#e8e4dc', 'phantom'],
      [36, 2.6, 0, '#8a6fc4', 'buggy']
    ]) {
      const car = makeHoverCar(c, st);
      at(car, tx + x, tz + z, ry + Math.PI / 2, 0.3);
      solid(tx + x, tz + z, 1.4);
    }
  }

  // 12. Airport Dropship Pad in North-East
  dropshipPad(E_PAD().x, E_PAD().z, 0, shipUnlocked() ? 'Board your ship' : 'Dropship pad (locked until you earn a ship)');

  // 13. Street Crowd: Wandering Citizens
  const ppl = [], sts = [], C0 = [
    ['#c8402f', '#e0b892'], ['#3b4f7a', '#8a5a3a'], ['#5a6a3a', '#c58a64'], ['#8a6fc4', '#e0b892'],
    ['#c9a43a', '#5a3a24'], ['#2a5a7a', '#d9a77a'], ['#e8e4dc', '#8a5a3a'], ['#6fdc5a', '#e0b892'],
    ['#ff9a3c', '#c58a64'], ['#5d636c', '#e0b892']
  ];
  for (let i = 0; i < 10; i++) {
    const [sh, sk] = C0[i];
    const o = buildChar(() => makeCivilian(sh, '#2c2a28', sk, ['#1e1a18', '#5a3a22', '#c9a43a', '#cfcac0'][i % 4]), 'civ');
    blob(o, 0.4);
    levelGroup.add(o);
    ppl.push(o);
    sts.push({});
    MOVERS.push([o, 0.4]);
  }
  levelAnims.push(t => ppl.forEach((o, i) => {
    let x, z, yaw;
    const sp = 0.9 + (i % 3) * 0.25, L = 30;
    if (i < 4) {
      const s = ((t * sp + i * 9) % (L * 2)), fwd = s < L, k = fwd ? s : L * 2 - s;
      x = (i % 2 ? 6.4 : -6.4); z = -26 + k * 2.1; yaw = fwd ? Math.PI : 0;
    } else if (i < 8) {
      const s = ((t * sp + i * 7) % (L * 2)), fwd = s < L, k = fwd ? s : L * 2 - s;
      z = (i % 2 ? 5.2 : -5.2); x = -38 + k * 2.5; yaw = fwd ? -Math.PI / 2 : Math.PI / 2;
    } else {
      const a = t * 0.12 * (i % 2 ? 1 : -1) + i;
      x = Math.cos(a) * 12.5; z = Math.sin(a) * 12.5;
      yaw = Math.atan2(-Math.sin(a), Math.cos(a)) * (i % 2 ? 1 : -1) + (i % 2 ? 0 : Math.PI);
    }
    o.position.set(tx + x, G(x, z), tz + z);
    o.rotation.y = yaw + Math.PI;
    animRig(o, sts[i], 1 / 60, t);
  }));

  // 14. Retro Arcade Cabinets outside Arcade at [-28, -12]
  {
    const ax = tx - 28, az = tz - 12;
    // Space Snake cabinet
    const cab1 = makeArcadeCabinet('SPACE SNAKE', '#50ff60', '#2a8a3a');
    at(cab1, ax + 2.4, az + 4.0, 0);
    solid(ax + 2.4, az + 4.0, 0.6);
    INTERACTS.push({
      x: ax + 2.4,
      z: az + 5.0,
      r: 2.0,
      label: 'Play Space Snake [E]',
      fn: () => { if (typeof arcOpen === 'function') arcOpen('snake'); else if (typeof openArcade === 'function') openArcade('snake'); else toast('ARCADE', 'Arcade loading...', 2); }
    });

    // Space Rocks cabinet
    const cab2 = makeArcadeCabinet('SPACE ROCKS', '#4fe0d0', '#1a5a8a');
    at(cab2, ax + 4.2, az + 4.0, 0);
    solid(ax + 4.2, az + 4.0, 0.6);
    INTERACTS.push({
      x: ax + 4.2,
      z: az + 5.0,
      r: 2.0,
      label: 'Play Space Rocks [E]',
      fn: () => { if (typeof arcOpen === 'function') arcOpen('rocks'); else if (typeof openArcade === 'function') openArcade('rocks'); else toast('ARCADE', 'Arcade loading...', 2); }
    });
  }

  // 15. Municipal Notice Board in Civic Plaza at [0, -20]
  {
    const nb = makeNoticeBoard();
    at(nb, tx + 8.6, tz - 21, -PI2);
    solid(tx + 8.6, tz - 21, 0.8);
    INTERACTS.push({
      x: tx + 7.2,
      z: tz - 21,
      r: 2.6,
      label: 'Read Jamestown Notice Board [E]',
      fn: openNoticeBoard
    });
  }

  // 16. Cookie's Diner Outdoor Cafe Patio at [-8.6, 23.5] and [-8.6, 30.5]
  {
    for (const pz of [23.5, 30.5]) {
      const pt = makeDinerTable();
      at(pt, tx - 8.6, tz + pz, 0);
      solid(tx - 8.6, tz + pz, 0.9);
    }
  }

  // 17. Market Row: one tidy line of stalls behind the south sidewalk of East Avenue, between the street lamps
  for (const x of [19, 22, 28, 31]) cityProp('stall', tx + x, tz + 7.6, Math.PI, 'earth');
  cityProp('crates', tx + 37.5, tz + 7.6, 0, 'earth');

  // 18. Corner furniture: a bench, a bin and a hydrant where each street leaves the plaza, nothing in the roads
  for (const s of [-1, 1]) {
    cityProp('bench', tx + 14.5 * s, tz + 5.7, Math.PI, 'earth'); cityProp('trash', tx + 13.1 * s, tz + 5.7, 0, 'earth');
    cityProp('bench', tx + 14.5 * s, tz - 5.7, 0, 'earth'); cityProp('hydrant', tx + 13.1 * s, tz - 5.7, 0, 'earth');
    cityProp('bench', tx + 6.7 * s, tz + 14.5, -PI2 * s, 'earth'); cityProp('trash', tx + 6.7 * s, tz + 13.1, 0, 'earth');
    cityProp('bench', tx + 6.7 * s, tz - 14.5, -PI2 * s, 'earth'); cityProp('flowerbox', tx + 6.7 * s, tz - 13.1, PI2, 'earth');
  }
}

const E_PAD = () => LEVELS.earth.pad;

window.__jamestown = {
  openComicReader,
  buyComic,
  grabBurger,
  petBarnaby,
  feedBarnabyFish,
  openArthurDealing,
  openDinerMenu,
  openNoticeBoard,
  talkRunner,
  openRunnerSupply,
  collectRunnerEarnings,
  JT_BUILDINGS,
  JT_POS,
  JT_NPCS,
  get TOWN() { return TOWN; },
  get LEVEL() { return LEVEL; },
  get player() { return player; },
  get camera() { return camera; },
  get S() { return S; },
  get npcObjs() { return npcObjs; },
  get TEX() { return TEX; },
  get curInhaler() { return typeof window.getCurInhaler === 'function' ? window.getCurInhaler() : null; },
  get buffs() { return typeof buffs === 'function' ? buffs() : null; },
  get useSub() { return typeof window.useSub === 'function' ? window.useSub : null; },
  get playInhalerAnim() { return typeof window.playInhalerAnim === 'function' ? window.playInhalerAnim : null; },
  get groundH() { return typeof groundH === 'function' ? groundH : null; },
  get maxHp() { return typeof maxHp === 'function' ? maxHp : null; },
  get closeDlg() { return typeof closeDlg === 'function' ? closeDlg : null; }
};
