// =================== STORY: Chapter 5 "The Dark Fleet", chain fixes, the epilogue, and the ending cutscene ===================
// --- Chapter 4 now hands off to Chapter 5 instead of a placeholder ---
QDEFS.r5.outro = ["His core is still warm. Listen... it's broadcasting.", "\"THE SETTING SUN RISES. ALL WORLDS WILL BURN RED.\"", "That's not a speech, gunner. It's a roll call. Ships are answering it. Out in the lanes, right now.", "Robot City is free. Talk to me again when you're ready to go hunting."];
defQuest('d1', { ch: 'Chapter 5 · The Dark Fleet', title: 'Dead Air', giver: 'ada', turnIn: 'rell', req: ['r5'], main: true,
  intro: ["The Overseer's core is still answering a roll call. Dozens of ships, all out in the lanes between worlds.", "Fly out and board a couple. See who's crewing them. Then take what you learn to Harbor Master Rell on the Zeltac Ship. Rell tracks every hull in the galaxy."],
  obj: [{ kind: 'kill', t: 'board', n: 2, planet: 'space', board: 'any', text: 'Board and clear ships drifting in space' }],
  outro: ["Two ships, two crews, and both holds carried the same red-sun manifest.", "Drome isn't hiding anymore, trooper. He's mustering a fleet."], reward: { cr: 6000, xp: 22000, items: { medkit: 3 } } });
defQuest('d2', { ch: 'Chapter 5 · The Dark Fleet', title: 'Red Sun Manifest', giver: 'rell', turnIn: 'rell', req: ['d1'], main: true,
  intro: ["Drome Cutters run the fleet's errands. Black hulls, a red sun on the side. You can't miss them.", "Every cutter carries a fleet code: where the fleet meets, when, and who's in charge. Bring me three."],
  obj: [{ kind: 'item', t: 'fleetcode', n: 3, planet: 'space', board: 'drome', text: 'Board Drome Cutters and take their Fleet Codes' }],
  outro: ["Three codes, one answer. The Eclipse. Drome's flagship, under Admiral Sable.", "She's parked past Robot City, waiting for the rest of the fleet. Waiting for you, if we're lucky."], reward: { cr: 9000, xp: 26000, take: { fleetcode: 3 } } });
defQuest('d3', { ch: 'Chapter 5 · The Dark Fleet', title: 'The Eclipse', giver: 'rell', turnIn: 'hale', req: ['d2'], main: true,
  intro: ["The Eclipse is holding past Robot City. Look for the biggest, ugliest ship in the sky.", "Board it, put Admiral Sable down, and pull her nav core. Then take it to General Hale at Fort Ironrock. He'll know what it means."],
  obj: [{ kind: 'item', t: 'eclipsecore', n: 1, planet: 'space', board: 'flagship', text: 'Board the Eclipse and defeat Admiral Sable' }],
  outro: ["Sable's nav core. (He whistles.) Drome's whole fleet refuels here. At MY fort. Warlord Krag has been letting them in through the far side of the rock.", "And there's more in here. The Eclipse wasn't Drome's first flagship. The first was a transport called the Setting Sun, stolen out of his shipyard twenty years ago by a young officer named Vega.", "Your ship, trooper. He's been chasing YOUR ship this whole time.", "Get some wheels from Sgt. Torque if you haven't, then come back. We have a warlord to evict."],
  reward: { cr: 14000, xp: 32000, take: { eclipsecore: 1 }, cape: 'eclipse' } });
CAPES.eclipse = { name: 'Eclipse Cape', lvl: 1, flag: 'eclipse', col: '#141218', trim: '#c9a43a' };
// put Chapter 5 right after Chapter 4 in the story order
{ const ids = ['d1', 'd2', 'd3']; for (const id of ids) QORDER.splice(QORDER.indexOf(id), 1); QORDER.splice(QORDER.indexOf('r5') + 1, 0, ...ids); }
// Fort Ironrock is the second half of Chapter 5; Krag needs the Eclipse first
for (const id of ['a1', 'a2', 'a3', 'a4']) QDEFS[id].ch = 'Chapter 5 · Fort Ironrock';
QDEFS.a4.req = ['a3', 'd3'];
QDEFS.a4.outro = ["Krag's core. Still warm. Fort Ironrock stands, and Drome's fleet has nowhere to refuel!", "His last orders went UP. Drome is building something in the sky above Earth. A floating fortress.", "Captain Skye runs the Air Base up there. Fly to Earth Sky and find her."];
{ const ids = ['a1', 'a2', 'a3', 'a4']; for (const id of ids) QORDER.splice(QORDER.indexOf(id), 1); QORDER.splice(QORDER.indexOf('d3') + 1, 0, ...ids); }
// the rest of the chain, in order
QDEFS.k1.req = ['a4']; QDEFS.k1.intro = ["You're the one who took the Eclipse AND beat Krag? Good. We need people who don't panic.", QDEFS.k1.intro[1]];
QDEFS.x1.req = ['k4']; QDEFS.w1.req = ['x3'];
QDEFS.k4.outro = [...QDEFS.k4.outro.slice(0, 2), "Dr. Fenn has been studying the storms on Zarlich. Start there.", QDEFS.k4.outro[2]];
// --- Epilogue ---
defQuest('e1', { ch: 'Epilogue · Sunrise', title: 'A New Name', giver: 'vega', turnIn: 'mayor', req: ['w4'], main: true,
  intro: ["So you found out. Yeah. I stole that ship out of Drome's yard when I was younger than you, and I named it after what he swore he'd do to the galaxy. So I'd never forget.", "The sun's not setting anymore. That ship deserves a new name. Mayor Holloway has a ceremony planned in the plaza. Go on, she's waiting."],
  obj: [{ kind: 'level', n: 1, text: 'Walk to the plaza for the ceremony' }],
  outro: ["Citizens of New Jamestown! Troopers of every world!", "For twenty years one ship carried a name that was a threat. Today it carries a promise.", "B.U.R.P. (over the speakers): \"I have prepared remarks. Remark one: you are all welcome. Remark two: I would like a raise.\"", "I name her THE RISING SUN. Fly her well, Captain."],
  reward: { cr: 25000, xp: 50000, fn: () => { S.shipName = 'The Rising Sun'; LEVELS.ship.name = S.shipName; toast('THE RISING SUN', 'Your ship has a new name', 4); } } });
{ const _ll = loadLevel; loadLevel = function (id, o) { if (S.shipName) LEVELS.ship.name = S.shipName; return _ll(id, o); }; }
// =================== the ending cutscene (also replayable from the Codex) ===================
function rollCredits(replay) {
  if (document.getElementById('ending')) return;
  const ov = document.createElement('div'); ov.id = 'ending'; ov.style.cssText = 'position:fixed;inset:0;z-index:60;background:#000;overflow:hidden;font-family:var(--ui);color:#e8ecf8';
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; ov.appendChild(cv);
  const cap = document.createElement('div'); cap.id = 'endCap'; cap.style.cssText = 'position:absolute;left:0;right:0;bottom:18%;text-align:center;font-family:var(--hud);font-weight:600;letter-spacing:.04em;font-size:clamp(18px,4.4vw,30px);padding:0 24px;text-shadow:0 2px 6px #000;transition:opacity .6s;opacity:0'; ov.appendChild(cap);
  const roll = document.createElement('div'); roll.style.cssText = 'position:absolute;left:0;right:0;top:100%;text-align:center;font-size:18px;line-height:1.75;padding:0 20px;text-shadow:0 2px 6px #000'; ov.appendChild(roll);
  const bar = document.createElement('div'); bar.style.cssText = 'position:absolute;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);display:flex;gap:8px;z-index:2';
  const ffb = document.createElement('button'), skb = document.createElement('button'); [ffb, skb].forEach(b => { b.className = 'pbtn'; b.style.cssText = 'font-size:15px;padding:8px 14px;background:rgba(0,0,0,.55)'; });
  ffb.textContent = '⏩ 1×'; skb.textContent = 'Skip ✕'; bar.append(ffb, skb); ov.appendChild(bar);
  document.body.appendChild(ov); if (document.pointerLockElement) document.exitPointerLock(); SFX.level();
  const L = ['<div style="font-size:44px;color:#ffd36a;margin-bottom:6px">ART OF WAR</div><div style="font-size:22px;margin-bottom:40px;letter-spacing:6px">SETTING SUN</div>', '<b style="color:#ffd36a">Created by</b>', 'Philip Gonzales', 'Caleb Dingus', '<br>', '<b style="color:#ffd36a">Original concept art</b>', "Phil & Caleb's high-school notebooks", 'with one sketch by Ethan', '<br>', ...(typeof GALLERY !== 'undefined' ? GALLERY.filter(g => ['xr17', 'elismas', 'ramick', 'maxurge', 'bugmaster', 'drome'].includes(g[0])).flatMap(g => [galleryCard(g, true), '<br>']) : []), '<b style="color:#ffd36a">Starring</b>', (S.nick || 'Trooper') + ' as the Trooper', 'B.U.R.P. as the ship AI (against his will)', 'Captain Vega · Elismas · Maxurge · Ramick · Seer Ixa', 'Ada-9 · Harbor Master Rell · General Hale · Sgt. Torque', 'Captain Skye · Old Wren · Dr. Fenn · Lumen', 'Nyra · Grix · Juno · Rhett · Vesper · PIP-9', '<br>', '<b style="color:#ffd36a">The last squadron</b>', 'Captain Vega, who flew the old ship first', 'Captain Skye and the Earth Defense Force', 'Ada-9 for Robot City', 'Harbor Master Rell · General Hale · Lumen', 'Elismas · the Bug Master · Maxurge · Ramick, the Four Masters', 'Lt. Vance · Ensign Park · Sgt. Okafor', '<br>', '<b style="color:#ffd36a">Villains</b>', 'Drome, Lord of the Setting Sun', 'Admiral Sable · Warlord Krag · the Overseer', 'the Frost King · the Storm Mother', 'the Watcher on Vector', 'and the Greater Maw', '<br>', '<b style="color:#ffd36a">Built by</b>', 'Claude, as the whole dev team', '<br><br>', '<div style="font-size:22px;color:#ffd36a">The galaxy is still out there.</div>', replay ? '' : 'Talk to Captain Vega for one last thing. New Game+ is in the Codex.'];
  roll.innerHTML = L.map(l => `<div>${l}</div>`).join('');
  const scenes = [[0, 'The Greater Maw\'s last eye closes.'], [5.5, 'The squadron flies home through the wormhole.'], [9.5, 'Across the galaxy, the lights come back on.'], [12.5, 'On Earth, the sun comes up red...'], [17, '...and then gold.'], [21.5, '']];
  let t = 0, speed = 1, last = performance.now(), done = false, capI = -1;
  const W = () => cv.width = ov.clientWidth * Math.min(2, devicePixelRatio || 1), H = () => cv.height = ov.clientHeight * Math.min(2, devicePixelRatio || 1); W(); H();
  const stars = Array.from({ length: 220 }, (_, i) => [(Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1, (Math.sin(i * 78.233) * 12345.678 % 1 + 1) % 1, (i % 7) / 7]);
  const planets = [['#c9a43a', 0.18, 0.32, 0.05], ['#8fe3ff', 0.78, 0.22, 0.04], ['#3f7d7a', 0.62, 0.62, 0.06], ['#c86aff', 0.3, 0.7, 0.035], ['#ff9a3c', 0.9, 0.55, 0.03], ['#6fdc5a', 0.08, 0.55, 0.03]];
  const end = () => { if (done) return; done = true; window.__cutscene_done = true; const cd = document.createElement('div'); cd.id = 'cutscene_done'; document.body.appendChild(cd); ov.remove(); window.removeEventListener('keydown', key, true); };
  const key = e => { if (e.code === 'Escape') { end(); e.stopImmediatePropagation(); } };
  window.addEventListener('keydown', key, true);
  ffb.addEventListener('click', e => { e.stopPropagation(); speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; ffb.textContent = `⏩ ${speed}×`; SFX.ui(); });
  skb.addEventListener('click', e => { e.stopPropagation(); end(); });
  const draw = () => {
    if (done) return; const now = performance.now(); t += Math.min(0.1, (now - last) / 1000) * speed; last = now;
    const x = cv.getContext('2d'), w = cv.width, h = cv.height, m = Math.min(w, h);
    // sky: black void -> starfield -> sunrise
    const dawn = Math.max(0, Math.min(1, (t - 12) / 9)), gold = Math.max(0, Math.min(1, (t - 16.5) / 5));
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgb(${5 + 40 * dawn},${6 + 30 * dawn + 60 * gold},${15 + 60 * dawn + 80 * gold})`); g.addColorStop(0.7, `rgb(${10 + 200 * dawn + 40 * gold},${8 + 60 * dawn + 120 * gold},${20 + 50 * dawn})`); g.addColorStop(1, `rgb(${20 + 235 * dawn},${10 + 110 * dawn + 100 * gold},${20 + 40 * dawn + 60 * gold})`);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const sa = t < 6 ? Math.min(1, t / 2) * 0.3 : Math.max(0, 1 - dawn * 1.2); x.fillStyle = '#fff';
    for (const [sx, sy, sz] of stars) { x.globalAlpha = sa * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + sx * 40))); x.fillRect(sx * w, sy * h * 0.8, 1 + sz * 2, 1 + sz * 2); } x.globalAlpha = 1;
    if (t < 7) { // the eye closing
      const a = Math.max(0, 1 - t / 5.5), r = m * 0.16; x.save(); x.translate(w / 2, h * 0.42); x.fillStyle = `rgba(255,42,58,${0.9 * Math.min(1, t * 2)})`; x.beginPath(); x.ellipse(0, 0, r * 1.6, r * a + 1, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#000'; x.beginPath(); x.ellipse(0, 0, r * 0.5, r * 0.5 * a + 0.5, 0, 0, Math.PI * 2); x.fill(); x.restore();
    }
    if (t > 5 && t < 16) { // worlds light up, the ship flies across
      const k = Math.min(1, (t - 5) / 3) * Math.max(0, 1 - (t - 13) / 3);
      planets.forEach(([c, px, py, pr], i) => { const on = Math.min(1, Math.max(0, (t - 9.5 - i * 0.45) / 0.8)); x.globalAlpha = k; x.fillStyle = c; x.beginPath(); x.arc(px * w, py * h, pr * m, 0, Math.PI * 2); x.fill(); x.globalAlpha = k * on * 0.5; const rg = x.createRadialGradient(px * w, py * h, pr * m, px * w, py * h, pr * m * 2.4); rg.addColorStop(0, '#ffd36a'); rg.addColorStop(1, 'rgba(255,211,106,0)'); x.fillStyle = rg; x.beginPath(); x.arc(px * w, py * h, pr * m * 2.4, 0, Math.PI * 2); x.fill(); });
      { const wa = Math.min(1, (t - 5) / 1) * Math.max(0, 1 - (t - 9) / 1.5), wx = w * 0.1, wy = h * 0.45; if (wa > 0) { x.save(); x.translate(wx, wy); for (let j = 0; j < 5; j++) { x.globalAlpha = wa * (0.25 + j * 0.12); x.strokeStyle = j % 2 ? '#c86aff' : '#6ad0ff'; x.lineWidth = m * 0.008; x.beginPath(); x.ellipse(0, 0, m * (0.05 + j * 0.022), m * (0.11 + j * 0.03), 0, t * (1.5 + j * 0.3), t * (1.5 + j * 0.3) + Math.PI * 1.5); x.stroke(); } x.restore(); } }
      const sq = [[0, 0, '#e8ecf8'], [-1, -1, '#ffd36a'], [-1, 1, '#4fd2ff'], [-2, -2, '#9aff6a'], [-2, 2, '#ff6a6a'], [-3, -3, '#c86aff'], [-3, 3, '#ffb36a'], [-4, -4, '#7fe0ff'], [-4, 4, '#ff6ae8']];
      for (const [fx, fy, fc] of sq) { const go = Math.max(0, t - 6 - (-fx) * 0.25); if (!go) continue; x.globalAlpha = k; const sx = w * 0.1 + go / 8 * w * 1.3 + fx * m * 0.09, sy = h * 0.45 - go * h * 0.012 + fy * m * 0.05, sc = fx ? 0.7 : 1;
        x.fillStyle = fc; x.beginPath(); x.moveTo(sx + m * 0.06 * sc, sy); x.lineTo(sx - m * 0.03 * sc, sy - m * 0.02 * sc); x.lineTo(sx - m * 0.02 * sc, sy); x.lineTo(sx - m * 0.03 * sc, sy + m * 0.02 * sc); x.closePath(); x.fill(); x.fillStyle = '#4fd2ff'; x.fillRect(sx - m * 0.06 * sc, sy - 2, m * 0.03 * sc, 4); }
      x.globalAlpha = 1;
    }
    if (dawn > 0) { // the sun and New Jamestown's skyline
      const sy = h * (0.95 - 0.35 * Math.min(1, (t - 12) / 10)), sr = m * 0.14; const sg = x.createRadialGradient(w / 2, sy, sr * 0.2, w / 2, sy, sr * 3); sg.addColorStop(0, gold > 0.3 ? '#fff6d0' : '#ffb070'); sg.addColorStop(0.3, `rgba(255,${120 + 100 * gold},${60 + 40 * gold},.9)`); sg.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = sg; x.beginPath(); x.arc(w / 2, sy, sr * 3, 0, Math.PI * 2); x.fill();
      x.fillStyle = `rgb(${12 + 20 * gold},${10 + 14 * gold},${22 + 10 * gold})`; const base = h * 0.86; x.fillRect(0, base, w, h - base);
      for (let i = 0; i < 26; i++) { const bw = w / 26, bh = h * (0.04 + ((i * 37) % 11) / 90) + (i === 12 || i === 13 ? h * 0.08 : 0); x.fillRect(i * bw, base - bh, bw + 1, bh); if ((i * 7) % 3 === 0) { x.fillStyle = 'rgba(255,211,106,.7)'; x.fillRect(i * bw + bw * 0.3, base - bh * 0.6, 3, 3); x.fillStyle = `rgb(${12 + 20 * gold},${10 + 14 * gold},${22 + 10 * gold})`; } }
    }
    if (t > 21.5) { // logo, then the credit roll
      const la = Math.min(1, (t - 21.5) / 1.5) * Math.max(0, 1 - (t - 27) / 1.5); x.globalAlpha = la; x.textAlign = 'center'; x.fillStyle = '#ffe08a'; x.font = `bold ${Math.round(m * 0.12)}px "Pixelify Sans", monospace`; x.fillText('ART ⚔ WAR', w / 2, h * 0.42); x.fillStyle = '#fff'; x.font = `${Math.round(m * 0.045)}px "Pixelify Sans", monospace`; x.fillText('S E T T I N G   S U N', w / 2, h * 0.5); x.globalAlpha = 1;
    }
    const si = scenes.reduce((a, s, i) => t >= s[0] ? i : a, -1); if (si !== capI) { capI = si; cap.style.opacity = 0; setTimeout(() => { if (scenes[si]) { cap.textContent = typeof scr === 'function' ? scr(scenes[si][1]) : scenes[si][1]; cap.style.opacity = scenes[si][1] ? 1 : 0; } }, 250); }
    if (t > 28) { const y = (t - 28) * 46; roll.style.transform = `translateY(${-y}px)`; if (y > roll.offsetHeight + ov.clientHeight) return end(); }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
