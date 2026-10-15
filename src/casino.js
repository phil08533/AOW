// =================== THE LUCKY ASTEROID (2.15): a casino and two playable arcade cabinets in the Zeltac's Neon Arcade ===================
// Casino (left side of the floor): six slot machines, a high-low card table and a space poker table with NPC players and chip stacks.
// Arcade (back row): the SPACE SNAKE and SPACE ROCKS cabinets are real games. Beat your best for credits.
// Odds: slots return about 90%, high-low pays 95% of fair odds, poker is you against two NPCs for a fixed pot.
// Save fields: S.arcade = { snake, rocks } best scores.

// ---------------- cards ----------------
const CS_SUITS = [['★', '#ffd36a'], ['☾', '#8fe3ff'], ['☄', '#ff6a5a'], ['⬢', '#9fff6a']];
const CS_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
function csDeck() { const d = []; for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) d.push({ r, s }); for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; }
function csCardHtml(c, held, hidden) {
  if (hidden) return `<span class="cscard back">◆</span>`;
  const [sym, col] = CS_SUITS[c.s]; return `<span class="cscard${held ? ' held' : ''}" style="color:${col}"><b>${CS_RANKS[c.r]}</b>${sym}</span>`;
}
// poker hand value: [category, tiebreak ranks...]; higher array wins
function csHandValue(h) {
  const rs = h.map(c => c.r).sort((a, b) => b - a), cnt = {}; rs.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; });
  const groups = Object.entries(cnt).map(([r, n]) => [n, +r]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const flush = h.every(c => c.s === h[0].s), uniq = [...new Set(rs)];
  let straight = uniq.length === 5 && rs[0] - rs[4] === 4, top = rs[0]; if (uniq.length === 5 && rs[0] === 12 && rs[1] === 3) { straight = true; top = 3; } // A-2-3-4-5
  if (straight && flush) return [8, top]; if (groups[0][0] === 4) return [7, groups[0][1], groups[1][1]]; if (groups[0][0] === 3 && groups[1][0] === 2) return [6, groups[0][1], groups[1][1]];
  if (flush) return [5, ...rs]; if (straight) return [4, top]; if (groups[0][0] === 3) return [3, ...groups.map(g => g[1])]; if (groups[0][0] === 2 && groups[1][0] === 2) return [2, ...groups.map(g => g[1])];
  if (groups[0][0] === 2) return [1, ...groups.map(g => g[1])]; return [0, ...rs];
}
const CS_HAND_NAMES = ['High card', 'A pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush'];
const csCmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; };
// NPC draw: keep anything paired or better, a four-card flush, or the two highest cards
function csNpcHold(h) { const v = csHandValue(h); if (v[0] >= 4) return h.map(() => true); if (v[0] >= 1) { const cnt = {}; h.forEach(c => { cnt[c.r] = (cnt[c.r] || 0) + 1; }); return h.map(c => cnt[c.r] > 1); }
  const bySuit = {}; h.forEach(c => { bySuit[c.s] = (bySuit[c.s] || 0) + 1; }); const fs = Object.keys(bySuit).find(s => bySuit[s] === 4); if (fs != null) return h.map(c => c.s === +fs);
  const top = [...h].sort((a, b) => b.r - a.r).slice(0, 2); return h.map(c => top.includes(c)); }

// ---------------- dialog helpers ----------------
function csPanel(html) { clearRows(); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.innerHTML = html; $('dlgActs').before(rows); return rows; }
const csCan = bet => { if (S.cr >= bet) return true; $('dlgLine').textContent = `You need ${bet} cr on you for that.`; SFX.hit && SFX.hit(); return false; };

// ---------------- slots ----------------
function openSlots() {
  openDlg('The Lucky Asteroid', 'Slot machine');
  $('dlgLine').textContent = 'Three in a row pays 8×, three diamonds 20×, a pair next to each other pays 1.5×.';
  const P = csPanel('<div class="csreels"><span>🍒</span><span>⭐</span><span>🚀</span></div>');
  let busy = false;
  const spin = bet => { if (busy || !csCan(bet)) return; busy = true; S.cr -= bet; markDirty(); const sy = ['🍒', '⭐', '🚀', '👾', '💎'], r = [0, 0, 0].map(() => sy[randi(0, sy.length - 1)]), els = [...P.querySelectorAll('.csreels span')]; let t = 0;
    const iv = setInterval(() => { t++; els.forEach((e, i) => { if (t < 6 + i * 4) e.textContent = sy[randi(0, sy.length - 1)]; else e.textContent = r[i]; }); SFX.ui && SFX.ui();
      if (t >= 14) { clearInterval(iv); busy = false; const win = r[0] === r[1] && r[1] === r[2] ? (r[0] === '💎' ? 20 : 8) : (r[0] === r[1] || r[1] === r[2]) ? 1.5 : 0, pay = Math.round(bet * win);
        S.cr += pay; markDirty(); if (pay) { SFX.coin && SFX.coin(); P.querySelector('.csreels').classList.add('win'); setTimeout(() => P.querySelector('.csreels') && P.querySelector('.csreels').classList.remove('win'), 900); }
        $('dlgLine').textContent = pay ? `You win ${pay} cr!` : 'Nothing. The machine hums smugly.'; } }, 70); };
  acts([['Spin 50', () => spin(50), true], ['Spin 250', () => spin(250)], ['Spin 1000', () => spin(1000)], ['Leave', closeDlg]]);
}

// ---------------- high-low ----------------
function openHighLow() {
  openDlg('Dealer Pip', 'High-Low');
  let card = csDeck()[0], bet = 100;
  const P = csPanel('');
  const show = (msg, next) => { P.innerHTML = `<div class="cshand">${csCardHtml(card)}${next ? ' → ' + csCardHtml(next) : ''}</div>`; $('dlgLine').textContent = msg; };
  const odds = hi => { const n = hi ? 12 - card.r : card.r; return n > 0 ? (0.95 * 12 / n) : 0; }; // ties lose
  const play = hi => { if (!csCan(bet)) return; const m = odds(hi); if (!m) { $('dlgLine').textContent = hi ? "Nothing beats an ace. Go lower." : 'Nothing is lower than a 2. Go higher.'; return; }
    S.cr -= bet; const next = csDeck().find(c => !(c.r === card.r && c.s === card.s)); const won = hi ? next.r > card.r : next.r < card.r, pay = won ? Math.round(bet * m) : 0; S.cr += pay; markDirty(); if (pay) SFX.coin && SFX.coin(); else SFX.hit && SFX.hit();
    show(won ? `Right! You win ${pay} cr.` : next.r === card.r ? 'A tie. The house takes it.' : 'Wrong way. The house takes it.', next); card = next; setTimeout(render, 1100); };
  const render = () => { if (!dlgOpen) return; show(`Higher pays ${odds(true) ? odds(true).toFixed(2) + '×' : '–'}, lower pays ${odds(false) ? odds(false).toFixed(2) + '×' : '–'}. Bet: ${bet} cr.`);
    acts([['Higher', () => play(true), true], ['Lower', () => play(false), true], [`Bet ${bet === 100 ? 500 : bet === 500 ? 1000 : 100}`, () => { bet = bet === 100 ? 500 : bet === 500 ? 1000 : 100; render(); }], ['Leave', closeDlg]]); };
  render();
}

// ---------------- space poker (five-card draw against two NPCs) ----------------
const CS_POKER_NPCS0 = ['Gambler Rook', 'Lady Nyx'];
function openPoker(o = {}) {
  const CS_POKER_NPCS = o.npcs || CS_POKER_NPCS0, ANTES = o.antes || [100, 500, 2000];
  openDlg(o.dealer || 'Dealer Vex', o.title || 'Space poker');
  let ante = ANTES[0], G = null;
  const P = csPanel('');
  const intro = () => { G = null; P.innerHTML = '<div class="csnote">' + (o.note || 'Five-card draw. Everyone antes, you swap any cards once, best hand takes the pot. Rook and Nyx play it straight.') + '</div>'; $('dlgLine').textContent = `Ante ${ante} cr. Pot is three antes.`;
    acts([['Deal me in', deal, true], [`Ante ${ANTES[(ANTES.indexOf(ante) + 1) % 3]}`, () => { ante = ANTES[(ANTES.indexOf(ante) + 1) % 3]; intro(); }], ['Leave', closeDlg]]); };
  const deal = () => { if (!csCan(ante)) return; S.cr -= ante; markDirty(); const d = csDeck(); G = { d, me: d.splice(0, 5), npc: [d.splice(0, 5), d.splice(0, 5)], hold: [false, false, false, false, false] }; SFX.ui && SFX.ui(); drawPhase(); };
  const handRow = (who, h, hold, hidden, note) => `<div class="csrow"><span class="cswho">${who}</span><span class="cshand">${h.map((c, i) => `<span data-i="${i}">${csCardHtml(c, hold && hold[i], hidden)}</span>`).join('')}</span>${note ? `<span class="csval">${note}</span>` : ''}</div>`;
  const drawPhase = () => { P.innerHTML = handRow(CS_POKER_NPCS[0], G.npc[0], null, true) + handRow(CS_POKER_NPCS[1], G.npc[1], null, true) + handRow('You', G.me, G.hold, false, CS_HAND_NAMES[csHandValue(G.me)[0]]);
    P.querySelectorAll('.csrow:last-child [data-i]').forEach(e => e.addEventListener('click', () => { const i = +e.dataset.i; G.hold[i] = !G.hold[i]; SFX.ui && SFX.ui(); drawPhase(); }));
    $('dlgLine').textContent = 'Tap the cards you want to KEEP, then Draw. Unheld cards get swapped.';
    acts([['Draw', showdown, true], ['Keep all', () => { G.hold = G.hold.map(() => true); showdown(); }]]); };
  const showdown = () => { G.me = G.me.map((c, i) => G.hold[i] ? c : G.d.shift()); G.npc = G.npc.map(h => { const k = csNpcHold(h); return h.map((c, i) => k[i] ? c : G.d.shift()); });
    const vals = [csHandValue(G.me), ...G.npc.map(csHandValue)]; let best = 0; for (let i = 1; i < 3; i++) if (csCmp(vals[i], vals[best]) > 0) best = i;
    const tie = vals.filter(v => csCmp(v, vals[best]) === 0).length > 1, pot = ante * 3, meWin = best === 0 || (tie && csCmp(vals[0], vals[best]) === 0);
    const pay = meWin ? (tie ? Math.round(pot / vals.filter(v => csCmp(v, vals[best]) === 0).length) : pot) : 0; S.cr += pay; markDirty();
    P.innerHTML = handRow(CS_POKER_NPCS[0], G.npc[0], null, false, CS_HAND_NAMES[vals[1][0]]) + handRow(CS_POKER_NPCS[1], G.npc[1], null, false, CS_HAND_NAMES[vals[2][0]]) + handRow('You', G.me, null, false, CS_HAND_NAMES[vals[0][0]]);
    P.querySelectorAll('.csrow')[best === 0 ? 2 : best - 1].classList.add('cswin');
    if (pay) SFX.coin && SFX.coin(); $('dlgLine').textContent = meWin ? (tie ? `Split pot. You take ${pay} cr.` : `You win with ${CS_HAND_NAMES[vals[0][0]].toLowerCase()}! +${pay} cr.`) : `${CS_POKER_NPCS[best - 1]} takes it with ${CS_HAND_NAMES[vals[best][0]].toLowerCase()}.`;
    acts([['Deal again', deal, true], ['Change ante', intro], ['Leave', closeDlg]]); };
  intro();
}

// ---------------- arcade cabinets: SPACE SNAKE and SPACE ROCKS ----------------
const ARC = { on: false };
function arcOpen(game) {
  if (ARC.on) return; ARC.on = true; dlgOpen = true; firing = false; if (document.pointerLockElement) document.exitPointerLock(); $('touch').hidden = true;
  const ov = document.createElement('div'); ov.id = 'arcOv'; ov.innerHTML = `<div class="arcBox"><div class="arcTop"><b>${game === 'snake' ? 'SPACE SNAKE' : 'SPACE ROCKS'}</b><span id="arcScore">0</span><button class="pbtn" id="arcX">✕</button></div><canvas id="arcCv" width="480" height="360"></canvas><div class="arcHelp">${game === 'snake' ? 'Arrows / WASD or swipe to steer. Eat the stars, miss your tail.' : 'Arrows / WASD to turn and thrust, Space to fire. On a phone: the buttons below.'}</div>${game === 'rocks' && TOUCH ? '<div class="arcPad"><button data-k="L">⟲</button><button data-k="U">▲</button><button data-k="R">⟳</button><button data-k="F">FIRE</button></div>' : ''}</div>`;
  document.body.appendChild(ov); const cv = ov.querySelector('canvas'), x = cv.getContext('2d'); ARC.keys = {}; ARC.game = game; ARC.ov = ov;
  const best = (S.arcade = S.arcade || {})[game] || 0; let score = 0, over = false, raf = 0, last = performance.now();
  const setScore = v => { score = v; ov.querySelector('#arcScore').textContent = `${v}   best ${Math.max(best, v)}`; };
  const finish = () => { if (over) return; over = true; let pay = Math.min(400, game === 'snake' ? score * 4 : Math.floor(score / 10)); const nb = score > best; if (nb) { S.arcade[game] = score; pay += 100; }
    if (pay) { S.cr += pay; SFX.coin && SFX.coin(); } markDirty();
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 0, 480, 360); x.fillStyle = '#ffd36a'; x.font = 'bold 34px monospace'; x.textAlign = 'center'; x.fillText('GAME OVER', 240, 150); x.font = '18px monospace'; x.fillStyle = '#fff';
    x.fillText(`Score ${score}${nb ? '  NEW BEST!' : ''}`, 240, 190); x.fillText(pay ? `+${pay} cr` : 'No payout', 240, 220); x.fillText('Tap or press Enter to play again', 240, 270); };
  const close = () => { cancelAnimationFrame(raf); ov.remove(); ARC.on = false; removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); closeDlg(); };
  const restart = () => { cancelAnimationFrame(raf); close(); setTimeout(() => arcOpen(game), 30); };
  const kd = e => { const k = e.code; e.stopPropagation(); if (k === 'Escape') { e.preventDefault(); return close(); } if (over && (k === 'Enter' || k === 'Space')) { e.preventDefault(); return restart(); } ARC.keys[k] = true; if (/Arrow|Space/.test(k)) e.preventDefault(); if (game === 'snake') snakeTurn(k); };
  const ku = e => { ARC.keys[e.code] = false; e.stopPropagation(); };
  addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
  ov.querySelector('#arcX').addEventListener('click', close);
  cv.addEventListener('pointerdown', () => { if (over) restart(); });
  ov.querySelectorAll('.arcPad button').forEach(b => { const k = { L: 'ArrowLeft', U: 'ArrowUp', R: 'ArrowRight', F: 'Space' }[b.dataset.k]; b.addEventListener('pointerdown', e => { e.preventDefault(); ARC.keys[k] = true; }); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => { ARC.keys[k] = false; }); });
  // stars behind both games
  const bg = Array.from({ length: 70 }, () => [Math.random() * 480, Math.random() * 360, Math.random()]);
  const drawBg = () => { x.fillStyle = '#05060f'; x.fillRect(0, 0, 480, 360); for (const [sx, sy, b] of bg) { x.fillStyle = `rgba(200,220,255,${0.25 + b * 0.5})`; x.fillRect(sx, sy, 1.5, 1.5); } };
  // ---- snake ----
  let snakeTurn = () => {};
  if (game === 'snake') {
    const N = 24, C = 20, cols = 24, rows = 18; let sn = [[12, 9], [11, 9], [10, 9]], dir = [1, 0], ndir = [1, 0], food = null, acc = 0, step = 0.14;
    const place = () => { do { food = [randi(0, cols - 1), randi(0, rows - 1)]; } while (sn.some(s => s[0] === food[0] && s[1] === food[1])); }; place();
    snakeTurn = k => { const m = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] }[k]; if (m && !(m[0] === -dir[0] && m[1] === -dir[1])) ndir = m; };
    let sx0 = null, sy0 = null; cv.addEventListener('touchstart', e => { sx0 = e.touches[0].clientX; sy0 = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener('touchmove', e => { if (sx0 == null) return; const dx = e.touches[0].clientX - sx0, dy = e.touches[0].clientY - sy0; if (Math.hypot(dx, dy) < 24) return; snakeTurn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp')); sx0 = e.touches[0].clientX; sy0 = e.touches[0].clientY; e.preventDefault(); }, { passive: false });
    const tick = now => { const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!over) { acc += dt; while (acc > step && !over) { acc -= step; dir = ndir; const h = [sn[0][0] + dir[0], sn[0][1] + dir[1]];
          if (h[0] < 0 || h[1] < 0 || h[0] >= cols || h[1] >= rows || sn.some(s => s[0] === h[0] && s[1] === h[1])) { drawS(); finish(); break; }
          sn.unshift(h); if (h[0] === food[0] && h[1] === food[1]) { setScore(score + 1); SFX.ui && SFX.ui(); place(); step = Math.max(0.065, step * 0.97); } else sn.pop(); } if (!over) drawS(); } raf = requestAnimationFrame(tick); };
    const drawS = () => { drawBg(); x.strokeStyle = '#2a3a6a'; x.strokeRect(0.5, 0.5, 479, 359); const t = performance.now() / 200;
      x.fillStyle = '#ffd36a'; x.beginPath(); const fx = food[0] * C + C / 2, fy = food[1] * C + C / 2; for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 9 + Math.sin(t) * 1.2, a = i / 10 * Math.PI * 2 - Math.PI / 2; x.lineTo(fx + Math.cos(a) * r, fy + Math.sin(a) * r); } x.fill();
      sn.forEach((s, i) => { x.fillStyle = i ? `hsl(${170 + i * 4},90%,${60 - Math.min(30, i)}%)` : '#9fff6a'; x.fillRect(s[0] * C + 1, s[1] * C + 1, C - 2, C - 2); }); };
    setScore(0); raf = requestAnimationFrame(tick);
  }
  // ---- rocks ----
  if (game === 'rocks') {
    const sh = { x: 240, y: 180, a: -Math.PI / 2, vx: 0, vy: 0, cd: 0, inv: 2 }; let rocks = [], shots = [], lives = 3, wave = 0;
    const spawnWave = () => { wave++; for (let i = 0; i < 3 + wave; i++) { let rx, ry; do { rx = Math.random() * 480; ry = Math.random() * 360; } while (Math.hypot(rx - sh.x, ry - sh.y) < 120); const a = Math.random() * 6.28, sp = 30 + Math.random() * 30 + wave * 6; rocks.push({ x: rx, y: ry, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 34, sd: Math.random() * 100 }); } };
    spawnWave();
    const wrap = o => { o.x = (o.x + 480) % 480; o.y = (o.y + 360) % 360; };
    const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; const K = ARC.keys;
      if (!over) {
        if (K.ArrowLeft || K.KeyA) sh.a -= 3.6 * dt; if (K.ArrowRight || K.KeyD) sh.a += 3.6 * dt; const th = K.ArrowUp || K.KeyW;
        if (th) { sh.vx += Math.cos(sh.a) * 220 * dt; sh.vy += Math.sin(sh.a) * 220 * dt; } sh.vx *= 0.99; sh.vy *= 0.99; sh.x += sh.vx * dt; sh.y += sh.vy * dt; wrap(sh); sh.cd -= dt; sh.inv -= dt;
        if ((K.Space || K.KeyJ) && sh.cd <= 0) { sh.cd = 0.22; shots.push({ x: sh.x + Math.cos(sh.a) * 12, y: sh.y + Math.sin(sh.a) * 12, vx: Math.cos(sh.a) * 420 + sh.vx, vy: Math.sin(sh.a) * 420 + sh.vy, t: 0.9 }); }
        shots.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt; wrap(s); }); shots = shots.filter(s => s.t > 0);
        rocks.forEach(r => { r.x += r.vx * dt; r.y += r.vy * dt; wrap(r); });
        for (const s of shots) for (const r of rocks) if (!r.dead && s.t > 0 && Math.hypot(s.x - r.x, s.y - r.y) < r.r) { s.t = 0; r.dead = true; setScore(score + (r.r > 30 ? 20 : r.r > 15 ? 50 : 100)); SFX.ui && SFX.ui();
          if (r.r > 12) for (let k = 0; k < 2; k++) { const a = Math.random() * 6.28; rocks.push({ x: r.x, y: r.y, vx: Math.cos(a) * (60 + wave * 8), vy: Math.sin(a) * (60 + wave * 8), r: r.r / 2, sd: Math.random() * 100 }); } }
        rocks = rocks.filter(r => !r.dead);
        if (sh.inv <= 0 && rocks.some(r => Math.hypot(r.x - sh.x, r.y - sh.y) < r.r + 8)) { lives--; SFX.hit && SFX.hit(); if (lives <= 0) { drawR(); finish(); } else { Object.assign(sh, { x: 240, y: 180, vx: 0, vy: 0, inv: 2 }); } }
        if (!rocks.length) spawnWave();
        if (!over) drawR(th); }
      raf = requestAnimationFrame(tick); };
    const drawR = th => { drawBg(); x.strokeStyle = '#c9d6ff'; x.lineWidth = 2;
      rocks.forEach(r => { x.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = r.r * (0.78 + 0.22 * Math.sin(r.sd + i * 2.3)); x.lineTo(r.x + Math.cos(a) * rr, r.y + Math.sin(a) * rr); } x.closePath(); x.stroke(); });
      x.fillStyle = '#ffd36a'; shots.forEach(s => x.fillRect(s.x - 2, s.y - 2, 4, 4));
      if (sh.inv <= 0 || Math.floor(sh.inv * 8) % 2) { x.save(); x.translate(sh.x, sh.y); x.rotate(sh.a); x.strokeStyle = '#9fff6a'; x.beginPath(); x.moveTo(14, 0); x.lineTo(-10, -9); x.lineTo(-6, 0); x.lineTo(-10, 9); x.closePath(); x.stroke(); if (th) { x.strokeStyle = '#ff8a3a'; x.beginPath(); x.moveTo(-8, -4); x.lineTo(-16 - Math.random() * 6, 0); x.lineTo(-8, 4); x.stroke(); } x.restore(); }
      x.fillStyle = '#fff'; x.font = '14px monospace'; x.textAlign = 'left'; x.fillText('♥'.repeat(lives) + `  wave ${wave}`, 10, 20); };
    setScore(0); raf = requestAnimationFrame(tick);
  }
}

// ---------------- the floor: people, furniture and machines ----------------
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th !== 'arcade') return L;
    const lux = L.find(d => d.id === 'slots' + n); if (lux) { lux.x = -19; lux.z = 11; lux.face = Math.PI; lux.role = 'Casino host · slots'; lux.custom = [['Play a slot machine', openSlots]]; }
    const c = (id, name, role, col, skin, x, z, face, extra, idle) => Object.assign({ id: id + n, name, role, rig: 'civ', make: () => makeCivilian(col, '#1e1c22', skin, '#2a2430', '#ffd36a'), x, z, face, idle }, extra);
    L.push(c('vex', 'Dealer Vex', 'Space poker · five-card draw', '#1e1c22', '#9fe8ff', -20, -5.6, 0, { custom: [['Sit down for space poker', openPoker]] }, ["Cards don't lie. Players do. Sit down."]));
    L.push(c('rook', 'Gambler Rook', 'Poker regular', '#5a3a2a', '#c58a64', -22.6, -2.4, Math.PI * 0.75, {}, ["I've lost this ship twice. Won it back once.", "Don't look at my cards. Don't look at my face either."]));
    L.push(c('nyx', 'Lady Nyx', 'Poker regular', '#8a3a8a', '#e0b892', -17.4, -2.4, -Math.PI * 0.75, {}, ["Sit down, darling. I need someone to take money from.", "I never bluff. Except always."]));
    L.push(c('pip', 'Dealer Pip', 'High-Low · higher or lower', '#2a5a3a', '#8a5a3a', -20, 5.4, Math.PI, { custom: [['Play high-low', openHighLow]] }, ["Higher or lower. That's the whole game. People still lose."]));
    return L; }; }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.call(this); if (zTheme(ZF.floor) !== 'arcade') return;
    const felt = toon('#1f6a3a', 'cloth'), rail = toon('#5a2a1e', 'wood'), gold = toon('#ffd36a');
    // red carpet and a sign over the casino side
    { const c = document.createElement('canvas'); c.width = 300; c.height = 520; const x = c.getContext('2d'); x.fillStyle = '#5e1620'; x.fillRect(0, 0, 300, 520); x.fillStyle = '#c9a43a'; x.fillRect(8, 8, 284, 504); x.fillStyle = '#6a1a24'; x.fillRect(16, 16, 268, 488);
      x.strokeStyle = 'rgba(201,164,58,.35)'; x.lineWidth = 2; for (let i = 0; i < 6; i++) for (let j = 0; j < 11; j++) { const cx = 38 + i * 45, cy = 38 + j * 44; x.beginPath(); x.moveTo(cx, cy - 12); x.lineTo(cx + 12, cy); x.lineTo(cx, cy + 12); x.lineTo(cx - 12, cy); x.closePath(); x.stroke(); }
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; const cp = new THREE.Mesh(new THREE.PlaneGeometry(15, 26), new THREE.MeshLambertMaterial({ map: t, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); cp.rotation.x = -Math.PI / 2; cp.position.set(-21, 0.04, 0); cp.receiveShadow = true; levelGroup.add(cp); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.5), new THREE.MeshBasicMaterial({ map: signTex('THE LUCKY ASTEROID', '#1a0a1e', '#ffd36a') })); sg.position.set(-13.4, 5.4, 0); sg.rotation.y = Math.PI / 2; props.add(sg);
    for (const z of [-12.6, 12.6]) { part(props, Cy(0.18, 0.18, 6.8, 8), toon('#c9a43a'), -13.6, 3.4, z); }
    // poker table: an oval of green felt, chip stacks and dealt cards
    { const tb = new THREE.Group(); part(tb, Cy(1.6, 1.6, 0.12, 24), felt, 0, 0.9, 0).scale.set(1.5, 1, 1); part(tb, new THREE.TorusGeometry(1.6, 0.12, 6, 28), rail, 0, 0.96, 0, Math.PI / 2).scale.set(1.5, 1, 1); part(tb, Cy(0.35, 0.5, 0.85, 10), '#2a2c32', 0, 0.42, 0);
      [[-1.6, 0.6], [1.6, 0.6], [0, -1.0], [0, 0.9]].forEach(([cx, cz], k) => { for (let i = 0; i < 4; i++) part(tb, Cy(0.11, 0.11, 0.04, 10), toon(['#c8402f', '#3b4f7a', '#e8e4dc', '#1e1c22'][i]), cx + (i % 2) * 0.24, 1.0 + Math.floor(i / 2) * 0.05 + (i % 3) * 0.04, cz + (i > 1 ? 0.2 : 0)); for (let i = 0; i < 2; i++) part(tb, B(0.18, 0.01, 0.26), '#f4f8ff', cx * 0.6 + i * 0.2 - 0.1, 0.975, cz * 0.6, 0, 0.3 * (i ? 1 : -1)); });
      part(tb, B(0.6, 0.012, 0.3), toon('#ffd36a'), 0, 0.975, 0); tb.position.set(-20, 0, -2.4); props.add(tb); box(-20, -2.4, 2.5, 1.7);
      const lamp = new THREE.PointLight(0xffe2a0, 0.6, 7, 1.6); lamp.position.set(-20, 3.2, -2.4); levelGroup.add(lamp); part(props, Cy(0.5, 0.9, 0.5, 12, true), '#2a2c32', -20, 3.4, -2.4); part(props, Cy(0.02, 0.02, 3.3, 4), '#1e1c22', -20, 5.3, -2.4); }
    // high-low table: a half moon
    { const tb = new THREE.Group(), half = (r, h, y, m) => part(tb, new THREE.CylinderGeometry(r, r, h, 24, 1, false, -Math.PI / 2, Math.PI), m, 0, y, 0);
      half(1.3, 0.8, 0.4, rail); half(1.42, 0.1, 0.84, rail); half(1.36, 0.06, 0.9, felt); part(tb, new THREE.TorusGeometry(1.4, 0.07, 6, 24, Math.PI), toon('#2a1410', 'cloth'), 0, 0.93, 0, Math.PI / 2, 0, 0);
      part(tb, B(2.84, 0.9, 0.14), rail, 0, 0.45, 0.05); part(tb, B(1.2, 0.08, 0.3), toon('#1e1c22'), 0, 0.95, 0.3); for (let i = 0; i < 5; i++) part(tb, Cy(0.07, 0.07, 0.06 + (i % 2) * 0.05, 10), toon(['#c8402f', '#e8e4dc', '#3b4f7a', '#ffd36a', '#1f6a3a'][i]), -0.44 + i * 0.22, 1.0, 0.3);
      for (let i = 0; i < 3; i++) part(tb, B(0.18, 0.01, 0.26), '#f4f8ff', -0.5 + i * 0.5, 0.94, 0.8); // cards and chips sit on the felt (2.17: they floated behind the table)
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i + 0.5) * Math.PI / 3, x = Math.sin(a) * 1.85, z = Math.cos(a) * 1.85; part(tb, Cy(0.25, 0.25, 0.08, 10), toon('#6a1a24', 'cloth'), x, 0.72, z); part(tb, Cy(0.04, 0.04, 0.7, 5), '#2b2a2c', x, 0.36, z); }
      tb.position.set(-20, 0, 4.3); tb.rotation.y = Math.PI; props.add(tb); box(-20, 4.3, 1.5, 0.8); }
    // six slot machines along the casino wall, lights chasing
    for (let i = 0; i < 6; i++) { const z = -11 + i * 4.3, m = new THREE.Group(); part(m, B(1.0, 2.0, 1.1), toon('#3a1a2a', 'hull'), 0, 1.0, 0); part(m, B(0.06, 0.7, 0.9), toon('#f4f8ff'), 0.53, 1.4, 0); for (let k = 0; k < 3; k++) part(m, B(0.07, 0.5, 0.22), toon(['#c8402f', '#ffd36a', '#4fd2ff'][(i + k) % 3]), 0.55, 1.4, -0.28 + k * 0.28);
      part(m, B(0.3, 0.3, 1.1), gold, 0, 2.15, 0); part(m, Cy(0.03, 0.03, 0.5, 5), '#8a8e96', 0.3, 1.5, 0.6); part(m, new THREE.SphereGeometry(0.07, 8, 6), toon('#c8402f'), 0.3, 1.78, 0.6);
      const lt = new THREE.Mesh(B(0.04, 0.12, 1.0), new THREE.MeshBasicMaterial({ color: '#ff6aa8' })); lt.position.set(0.55, 1.9, 0); m.add(lt); levelAnims.push(t => { lt.material.color.setHSL((t * 0.3 + i * 0.15) % 1, 0.9, 0.6); });
      m.position.set(-28.6, 0, z); levelGroup.add(m); box(-28.6, z, 0.6, 0.6); INTERACTS.push({ x: -27.2, z, r: 1.4, label: 'Slot machine', fn: openSlots }); }
    // the two playable cabinets get proper marquees
    [['snake', 'SPACE SNAKE', '#9fff6a', -3.6], ['rocks', 'SPACE ROCKS', '#8fe3ff', 3.2]].forEach(([g, nm, col, x]) => { const mq = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.36), new THREE.MeshBasicMaterial({ map: signTex(nm, '#05060f', col) })); mq.position.set(x, 2.55, -19.45); props.add(mq);
      INTERACTS.push({ x, z: -18.4, r: 1.6, label: `Play ${nm}${S.arcade && S.arcade[g] ? ` (best ${S.arcade[g]})` : ''}`, fn: () => arcOpen(g) }); }); }; }
document.head.insertAdjacentHTML('beforeend', `<style>
.cscard { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 46px; height: 64px; margin: 2px; border-radius: 7px; background: #f4f1e8; border: 2px solid #1e1c22; font: 700 20px var(--mono, monospace); line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,.4); cursor: pointer; text-shadow: 0 1px 0 rgba(0,0,0,.35); }
.cscard b { color: #1e1c22; font-size: 18px; text-shadow: none; } .cscard.back { background: repeating-linear-gradient(45deg,#3b4f7a 0 6px,#2a3756 6px 12px); color: #ffd36a; }
.cscard.held { transform: translateY(-6px); border-color: #ffd36a; box-shadow: 0 0 0 2px #ffd36a, 0 4px 8px rgba(0,0,0,.5); }
.cshand { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; } .csrow { display: flex; align-items: center; gap: 10px; padding: 4px 6px; border-radius: 8px; } .csrow.cswin { background: rgba(255,211,106,.18); }
.cswho { min-width: 92px; font-weight: 700; color: #cfd6e0; } .csval { color: #ffd36a; font-size: 13px; } .csnote { padding: 6px; color: #cfd6e0; }
.csreels { display: flex; justify-content: center; gap: 10px; font-size: 44px; padding: 8px; } .csreels span { background: #0b0f1c; border: 2px solid #ffd36a; border-radius: 10px; width: 68px; text-align: center; } .csreels.win span { border-color: #9fff6a; box-shadow: 0 0 14px #9fff6a; }
#arcOv { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.78); display: grid; place-items: center; touch-action: none; }
#arcOv .arcBox { width: min(96vw, 560px); background: #10121c; border: 3px solid #c86aff; border-radius: 14px; padding: 10px; box-shadow: 0 0 30px rgba(200,106,255,.4); }
#arcOv .arcTop { display: flex; align-items: center; gap: 10px; color: #fff; font: 700 16px var(--mono, monospace); margin-bottom: 6px; } #arcOv .arcTop b { color: #ffd36a; letter-spacing: .1em; } #arcOv #arcScore { flex: 1; text-align: right; }
#arcOv canvas { width: 100%; height: auto; max-height: 62vh; object-fit: contain; display: block; border-radius: 6px; image-rendering: pixelated; }
#arcOv .arcHelp { color: #9fb0c8; font-size: 12px; margin-top: 6px; } #arcOv .arcPad { display: flex; gap: 8px; margin-top: 8px; } #arcOv .arcPad button { flex: 1; height: 52px; border-radius: 10px; border: 1px solid rgba(255,255,255,.4); background: rgba(255,255,255,.12); color: #fff; font: 700 18px var(--hud, sans-serif); touch-action: none; }
</style>`);
