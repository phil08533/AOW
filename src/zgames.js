// =================== MORE GAMES FOR THE NEON ARCADE AND THE LUCKY ASTEROID (2.23.69) ===================
// Arcade (25 cr, pays tickets): air hockey, pinball, Blork Invaders, Star Racer and Neon Step. They run in the arcMini frame (arcade2.js).
// Casino (credits): roulette and blackjack, in the same dialog style as the slots, high-low and poker (casino.js).
// Keys: the frame only reports key presses, so held moves (paddles, flippers) work as short pushes, and mouse or touch steers.

// ---- air hockey: you're the blue mallet at the bottom; first to five ----
function gameHockey(G) { const { x } = G; const T = { l: 60, r: 420, t: 20, b: 340 }, P = { x: 240, y: 300, px: 240, py: 300 }, A = { x: 240, y: 60 }, K = { x: 240, y: 180, vx: 0, vy: 0 };
  let me = 0, ai = 0, wait = 1, flash = 0; const R = 22, KR = 13, GOAL = 70;
  G.hint('Move the mouse or drag to push your mallet. First to 5. Arrow keys nudge it.'); G.my = 300;
  G.key = c => { if (c === 'ArrowLeft' || c === 'KeyA') G.mx -= 30; if (c === 'ArrowRight' || c === 'KeyD') G.mx += 30; if (c === 'ArrowUp' || c === 'KeyW') G.my -= 30; if (c === 'ArrowDown' || c === 'KeyS') G.my += 30; };
  const serve = toAI => { K.x = 240; K.y = toAI ? 150 : 210; K.vx = 0; K.vy = 0; wait = 0.8; };
  const hit = (M, mvx, mvy) => { const dx = K.x - M.x, dy = K.y - M.y, d = Math.hypot(dx, dy); if (d >= R + KR || d < 0.01) return; const nx = dx / d, ny = dy / d;
    K.x = M.x + nx * (R + KR); K.y = M.y + ny * (R + KR); const rel = (K.vx - mvx) * nx + (K.vy - mvy) * ny; if (rel < 0) { K.vx -= 1.9 * rel * nx; K.vy -= 1.9 * rel * ny; } K.vx += mvx * 0.35; K.vy += mvy * 0.35; SFX.ui && SFX.ui(); };
  G.tick = (dt) => { if (flash > 0) flash -= dt;
    // your mallet chases the pointer, held in your half
    P.px = P.x; P.py = P.y; const tx = clamp(G.mx, T.l + R, T.r - R), ty = clamp(G.my, 190 + R, T.b - R); P.x += (tx - P.x) * Math.min(1, dt * 18); P.y += (ty - P.y) * Math.min(1, dt * 18);
    // the house mallet: guards the goal, then strikes when the puck is on its side
    const ax = K.y < 180 ? K.x : 240 + (K.x - 240) * 0.4, ay = K.y < 180 && K.vy < 120 ? Math.max(T.t + R, K.y - 26) : 60, apx = A.x, apy = A.y, sp = 260 + me * 20;
    A.x += clamp(ax - A.x, -sp * dt, sp * dt); A.y += clamp(ay - A.y, -sp * dt, sp * dt); A.y = clamp(A.y, T.t + R, 170 - R);
    if (wait > 0) wait -= dt; else { K.x += K.vx * dt; K.y += K.vy * dt; K.vx *= 1 - dt * 0.25; K.vy *= 1 - dt * 0.25;
      const s = Math.hypot(K.vx, K.vy); if (s > 900) { K.vx *= 900 / s; K.vy *= 900 / s; }
      hit(P, (P.x - P.px) / Math.max(dt, 1e-3), (P.y - P.py) / Math.max(dt, 1e-3)); hit(A, (A.x - apx) / Math.max(dt, 1e-3), (A.y - apy) / Math.max(dt, 1e-3));
      if (K.x < T.l + KR) { K.x = T.l + KR; K.vx = Math.abs(K.vx); } if (K.x > T.r - KR) { K.x = T.r - KR; K.vx = -Math.abs(K.vx); }
      const inGoal = Math.abs(K.x - 240) < GOAL;
      if (K.y < T.t + KR) { if (inGoal) { me++; flash = 0.6; SFX.coin && SFX.coin(); serve(true); } else { K.y = T.t + KR; K.vy = Math.abs(K.vy); } }
      if (K.y > T.b - KR) { if (inGoal) { ai++; flash = 0.6; SFX.hurt && SFX.hurt(); serve(false); } else { K.y = T.b - KR; K.vy = -Math.abs(K.vy); } } }
    // draw: an ice-white table with blue lines and lit rails
    arcBg(x, '#0a1020', '#04060c'); x.fillStyle = flash > 0 ? '#ffffff' : '#e8f2ff'; x.fillRect(T.l, T.t, T.r - T.l, T.b - T.t);
    x.strokeStyle = '#ff4a6a'; x.lineWidth = 3; x.beginPath(); x.moveTo(T.l, 180); x.lineTo(T.r, 180); x.stroke(); x.strokeStyle = '#4a8aff'; x.beginPath(); x.arc(240, 180, 40, 0, 7); x.stroke();
    for (const y of [T.t, T.b]) { x.fillStyle = '#10141e'; x.fillRect(240 - GOAL, y - 6, GOAL * 2, 12); }
    x.strokeStyle = '#4fd2ff'; x.lineWidth = 6; x.strokeRect(T.l - 3, T.t - 3, T.r - T.l + 6, T.b - T.t + 6);
    const mal = (M, c) => { x.fillStyle = c; x.beginPath(); x.arc(M.x, M.y, R, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(M.x, M.y, R * 0.45, 0, 7); x.fill(); };
    mal(A, '#d8303a'); mal(P, '#2a6aff'); x.fillStyle = '#1e1c22'; x.beginPath(); x.arc(K.x, K.y, KR, 0, 7); x.fill(); x.strokeStyle = '#ffd36a'; x.lineWidth = 2; x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold 26px monospace'; x.textAlign = 'center'; x.fillText(ai, 30, 150); x.fillText(me, 30, 230);
    G.score(`YOU ${me} · HOUSE ${ai}`); if (me >= 5) G.end(40, 'YOU WIN!'); else if (ai >= 5) G.end(me * 5, 'HOUSE WINS'); }; }

// ---- pinball: three balls, two flippers, pop bumpers and a spinner lane ----
function gamePinball(G) { const { x } = G; const L = 130, Rr = 350, TOP = 14, BOT = 360; let ball = null, balls = 3, sc = 0, lf = 0, rf = 0, launch = 0, mult = 1, drops = [1, 1, 1];
  const bump = [[195, 110, 20], [285, 110, 20], [240, 170, 20]], BR = 7, G2 = 420;
  G.hint('Left and right flippers: A / D or arrow keys, or tap the left or right side. Space launches. Three balls.');
  const flip = s => { if (s < 0) lf = 0.2; else rf = 0.2; SFX.ui && SFX.ui(); };
  const newBall = () => { ball = { x: Rr - 12, y: 300, vx: 0, vy: 0, live: false }; launch = 0; };
  newBall();
  G.act = () => { if (ball && !ball.live) { ball.live = true; ball.vy = -620 - Math.random() * 60; ball.vx = -30; return; } flip(G.mx < 240 ? -1 : 1); };
  G.key = c => { if (c === 'KeyA' || c === 'ArrowLeft') flip(-1); if (c === 'KeyD' || c === 'ArrowRight') flip(1); if ((c === 'ArrowUp' || c === 'KeyW') && ball && !ball.live) G.act(); };
  // flipper as a segment from a pivot; up when the timer runs
  const flipSeg = s => { const px = s < 0 ? 185 : 295, up = s < 0 ? lf > 0 : rf > 0, a = up ? -0.45 : 0.5, len = 46; return { x1: px, y1: 318, x2: px - s * Math.cos(a) * len, y2: 318 + Math.sin(a) * len, up, s }; };
  const seg = (S2, br) => { const dx = S2.x2 - S2.x1, dy = S2.y2 - S2.y1, l2 = dx * dx + dy * dy, t = clamp(((br.x - S2.x1) * dx + (br.y - S2.y1) * dy) / l2, 0, 1), cx = S2.x1 + dx * t, cy = S2.y1 + dy * t, ex = br.x - cx, ey = br.y - cy, d = Math.hypot(ex, ey);
    if (d < BR + 4 && d > 0.01) { const nx = ex / d, ny = ey / d; br.x = cx + nx * (BR + 4); br.y = cy + ny * (BR + 4); const vn = br.vx * nx + br.vy * ny; if (vn < 0) { br.vx -= 1.6 * vn * nx; br.vy -= 1.6 * vn * ny; }
      if (S2.up !== undefined && S2.up) { br.vy -= 520 * (0.6 + t); br.vx += S2.s * -60; } return true; } return false; };
  G.tick = (dt) => { lf -= dt; rf -= dt;
    if (ball && ball.live) { const n = 3; for (let k = 0; k < n; k++) { const h = dt / n; ball.vy += G2 * h; ball.x += ball.vx * h; ball.y += ball.vy * h;
        if (ball.x < L + BR) { ball.x = L + BR; ball.vx = Math.abs(ball.vx) * 0.85; } if (ball.x > Rr - BR) { ball.x = Rr - BR; ball.vx = -Math.abs(ball.vx) * 0.85; } if (ball.y < TOP + BR) { ball.y = TOP + BR; ball.vy = Math.abs(ball.vy) * 0.85; }
        // the angled guides above the flippers
        seg({ x1: L, y1: 250, x2: 185, y2: 300 }, ball); seg({ x1: Rr, y1: 250, x2: 295, y2: 300 }, ball); seg(flipSeg(-1), ball); seg(flipSeg(1), ball);
        for (const b of bump) { const dx = ball.x - b[0], dy = ball.y - b[1], d = Math.hypot(dx, dy); if (d < b[2] + BR) { const nx = dx / d, ny = dy / d; ball.x = b[0] + nx * (b[2] + BR); ball.y = b[1] + ny * (b[2] + BR); ball.vx = nx * 420; ball.vy = ny * 420; sc += 100 * mult; b[3] = 0.15; SFX.coin && SFX.coin(); } }
        drops.forEach((v, i) => { const dx = 180 + i * 60; if (v && Math.abs(ball.x - dx) < 18 && Math.abs(ball.y - 60) < 10) { drops[i] = 0; ball.vy = Math.abs(ball.vy); sc += 250 * mult; if (!drops.some(Boolean)) { drops = [1, 1, 1]; mult++; sc += 1000; } } });
        const s = Math.hypot(ball.vx, ball.vy); if (s > 950) { ball.vx *= 950 / s; ball.vy *= 950 / s; } }
      if (ball.y > BOT + 10) { balls--; if (balls <= 0) { ball = null; G.end(Math.round(sc / 300), sc >= 9000 ? 'WIZARD!' : 'TILT'); } else newBall(); } }
    // the table
    arcBg(x, '#160a24', '#05030c'); x.fillStyle = '#20103a'; x.fillRect(L, TOP, Rr - L, BOT - TOP);
    const g = x.createRadialGradient(240, 150, 10, 240, 150, 180); g.addColorStop(0, 'rgba(200,106,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(L, TOP, Rr - L, BOT - TOP);
    x.strokeStyle = '#c86aff'; x.lineWidth = 4; x.strokeRect(L, TOP, Rr - L, BOT - TOP);
    x.strokeStyle = '#ffd36a'; x.lineWidth = 5; x.beginPath(); x.moveTo(L, 250); x.lineTo(185, 300); x.moveTo(Rr, 250); x.lineTo(295, 300); x.stroke();
    for (const b of bump) { b[3] = Math.max(0, (b[3] || 0) - dt); x.fillStyle = b[3] > 0 ? '#ffffff' : '#ff6aa8'; x.beginPath(); x.arc(b[0], b[1], b[2], 0, 7); x.fill(); x.fillStyle = '#ffd36a'; x.beginPath(); x.arc(b[0], b[1], b[2] * 0.5, 0, 7); x.fill(); }
    drops.forEach((v, i) => { x.fillStyle = v ? '#4fd2ff' : '#2a2a40'; x.fillRect(166 + i * 60, 54, 28, 10); });
    for (const s of [-1, 1]) { const f = flipSeg(s); x.strokeStyle = '#f4f0e8'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(f.x1, f.y1); x.lineTo(f.x2, f.y2); x.stroke(); }
    if (ball) { x.fillStyle = '#e8eef4'; x.beginPath(); x.arc(ball.x, ball.y, BR, 0, 7); x.fill(); if (!ball.live) { x.fillStyle = '#ffd36a'; x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.fillText('SPACE / TAP TO LAUNCH', 240, 220); } }
    x.fillStyle = '#ffd36a'; x.font = 'bold 18px monospace'; x.textAlign = 'left'; x.fillText(String(sc).padStart(6, '0'), 370, 40); x.fillText('x' + mult, 370, 64); x.fillText('●'.repeat(Math.max(0, balls)), 370, 88);
    G.score(`${sc} · ${balls} ball${balls === 1 ? '' : 's'}`); }; }

// ---- Blork Invaders: rows of Blorks march down; slide the cannon and shoot ----
function gameInvaders(G) { const { x } = G; let px = 240, shots = [], drop = [], cd = 0, wave = 1, kills = 0, lives = 3, dir = 1, stepT = 0, inv = [];
  const fill = () => { inv = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) inv.push({ x: 80 + c * 44, y: 40 + r * 34, r, alive: true }); };
  fill(); G.hint('Mouse or A / D to move, tap or Space to fire. Don\'t let them land.');
  G.act = () => { if (cd <= 0) { shots.push({ x: px, y: 320 }); cd = 0.32; SFX.ui && SFX.ui(); } };
  G.key = c => { if (c === 'KeyA' || c === 'ArrowLeft') G.mx = px - 40; if (c === 'KeyD' || c === 'ArrowRight') G.mx = px + 40; };
  G.tick = (dt, t) => { cd -= dt; px += clamp(G.mx - px, -380 * dt, 380 * dt); px = clamp(px, 20, 460);
    const live = inv.filter(i => i.alive), sp = Math.max(0.08, 0.55 - (32 - live.length) * 0.014 - wave * 0.05); stepT -= dt;
    if (stepT <= 0) { stepT = sp; const edge = live.some(i => (dir > 0 && i.x > 450) || (dir < 0 && i.x < 30)); if (edge) { dir = -dir; live.forEach(i => { i.y += 14; }); } else live.forEach(i => { i.x += dir * 10; }); }
    if (Math.random() < dt * (0.8 + wave * 0.3) && live.length) { const s = live[(Math.random() * live.length) | 0]; drop.push({ x: s.x, y: s.y + 10 }); }
    shots.forEach(s => { s.y -= 460 * dt; for (const i of live) if (i.alive && Math.abs(s.x - i.x) < 16 && Math.abs(s.y - i.y) < 12) { i.alive = false; s.y = -99; kills++; SFX.coin && SFX.coin(); } }); shots = shots.filter(s => s.y > -10);
    drop.forEach(d => { d.y += 200 * dt; if (Math.abs(d.x - px) < 18 && Math.abs(d.y - 326) < 10) { d.y = 999; lives--; SFX.hurt && SFX.hurt(); } }); drop = drop.filter(d => d.y < 370);
    if (!inv.some(i => i.alive)) { wave++; fill(); }
    if (lives <= 0 || live.some(i => i.y > 300)) return G.end(Math.round(kills * 0.6 + (wave - 1) * 8), wave > 2 ? 'EARTH DEFENDER!' : 'THEY LANDED');
    arcBg(x, '#020512', '#05121a'); for (let i = 0; i < 40; i++) { x.fillStyle = '#ffffff55'; x.fillRect((i * 97) % 480, (i * 61 + t * 20) % 360, 2, 2); }
    for (const i of live) { const bob = Math.sin(t * 6 + i.x) * 2; x.fillStyle = ['#6fdc5a', '#9fff6a', '#4fd2ff', '#ff6aa8'][i.r]; x.beginPath(); x.arc(i.x, i.y + bob, 13, Math.PI, 0); x.fillRect(i.x - 13, i.y + bob, 26, 9); x.fill();
      x.fillStyle = '#05060a'; x.fillRect(i.x - 7, i.y - 4 + bob, 4, 4); x.fillRect(i.x + 3, i.y - 4 + bob, 4, 4); x.fillStyle = '#fff'; for (let k = 0; k < 3; k++) x.fillRect(i.x - 7 + k * 5, i.y + 4 + bob, 3, 4); }
    x.fillStyle = '#9fff6a'; shots.forEach(s => x.fillRect(s.x - 2, s.y - 8, 4, 12)); x.fillStyle = '#ff4a3a'; drop.forEach(d => x.fillRect(d.x - 2, d.y, 4, 10));
    x.fillStyle = '#4fd2ff'; x.fillRect(px - 18, 322, 36, 10); x.fillRect(px - 4, 312, 8, 12); x.fillStyle = '#3a8a3a'; x.fillRect(0, 340, 480, 20);
    G.score(`${kills} blorks · wave ${wave} · ${'♥'.repeat(Math.max(0, lives))}`); }; }

// ---- Star Racer: thread your ship through an asteroid field for 45 seconds ----
function gameRacer(G) { const { x } = G; let t = 0, px = 240, rocks = [], spawnT = 0, dist = 0, hits = 0, inv = 0, stars = Array.from({ length: 60 }, (_, i) => ({ x: (i * 97) % 480, y: (i * 53) % 360, z: 1 + (i % 3) }));
  G.hint('Steer with the mouse, A / D or the arrow keys. Survive 45 seconds; three hits and you\'re out.');
  G.key = c => { if (c === 'KeyA' || c === 'ArrowLeft') G.mx = px - 60; if (c === 'KeyD' || c === 'ArrowRight') G.mx = px + 60; };
  G.tick = (dt) => { t += dt; inv -= dt; const sp = 220 + t * 7; dist += sp * dt; px += clamp(G.mx - px, -420 * dt, 420 * dt); px = clamp(px, 30, 450);
    spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.16, 0.6 - t * 0.01); rocks.push({ x: 20 + Math.random() * 440, y: -30, r: 12 + Math.random() * 18, spin: Math.random() * 6, gem: Math.random() < 0.12 }); }
    rocks.forEach(r => { r.y += sp * dt * (r.gem ? 0.8 : 1); r.spin += dt * 2; if (Math.hypot(r.x - px, r.y - 300) < r.r + 12) { if (r.gem) { dist += 600; SFX.coin && SFX.coin(); r.y = 999; } else if (inv <= 0) { hits++; inv = 1.2; SFX.hurt && SFX.hurt(); r.y = 999; } } }); rocks = rocks.filter(r => r.y < 400);
    arcBg(x, '#05020e', '#0a0618'); stars.forEach(s => { s.y += sp * dt * 0.3 * s.z; if (s.y > 360) s.y = 0; x.fillStyle = s.z > 2 ? '#ffffff' : '#8a8aaa'; x.fillRect(s.x, s.y, s.z, s.z * 3); });
    for (const r of rocks) { x.save(); x.translate(r.x, r.y); x.rotate(r.spin); if (r.gem) { x.fillStyle = '#4fd2ff'; x.beginPath(); x.moveTo(0, -r.r * 0.7); x.lineTo(r.r * 0.6, 0); x.lineTo(0, r.r * 0.7); x.lineTo(-r.r * 0.6, 0); x.fill(); }
      else { x.fillStyle = '#7a6a5a'; x.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, rr = r.r * (0.8 + ((k * 37) % 5) * 0.06); x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.fill(); x.fillStyle = '#5a4a3a'; x.beginPath(); x.arc(-r.r * 0.2, -r.r * 0.1, r.r * 0.25, 0, 7); x.fill(); } x.restore(); }
    if (inv <= 0 || ((t * 10) | 0) % 2) { x.fillStyle = '#ffd36a'; x.beginPath(); x.moveTo(px, 284); x.lineTo(px + 14, 314); x.lineTo(px - 14, 314); x.fill(); x.fillStyle = '#ff6a1a'; x.fillRect(px - 5, 314, 10, 6 + Math.random() * 8); }
    G.score(`${Math.round(dist / 10)} m · ${Math.max(0, Math.ceil(45 - t))} s · ${'♥'.repeat(Math.max(0, 3 - hits))}`);
    if (hits >= 3) G.end(Math.round(dist / 400), 'WRECKED'); else if (t >= 45) G.end(Math.round(dist / 300) + 10, 'FINISH!'); }; }

// ---- Neon Step: arrows rise to the line; hit them on the beat ----
function gameDance(G) { const { x } = G; const COLS = [['←', 'ArrowLeft', 'KeyA', '#ff6aa8'], ['↓', 'ArrowDown', 'KeyS', '#4fd2ff'], ['↑', 'ArrowUp', 'KeyW', '#9fff6a'], ['→', 'ArrowRight', 'KeyD', '#ffd36a']];
  let t = -1.5, notes = [], perf = 0, good = 0, miss = 0, combo = 0, best = 0, msg = '', msgT = 0; const LINE = 60, SPD = 210, BPM = 128, beat = 60 / BPM;
  for (let i = 0; i < 48; i++) { const b = 4 + i * (i > 24 ? 0.5 : 1) + (i > 24 ? 12 : 0); notes.push({ t: b * beat, c: (i * 7 + (i >> 2)) % 4, done: false }); }
  G.hint('Arrow keys or WASD, or tap the column, as each arrow reaches the top line.');
  const hit = c => { const n = notes.find(n => !n.done && n.c === c && Math.abs(n.t - t) < 0.2); if (!n) { combo = 0; return; } n.done = true; const e = Math.abs(n.t - t);
    if (e < 0.07) { perf++; msg = 'PERFECT'; } else { good++; msg = 'GOOD'; } combo++; best = Math.max(best, combo); msgT = 0.5; SFX.ui && SFX.ui(); };
  G.key = c => { COLS.forEach((C, i) => { if (c === C[1] || c === C[2]) hit(i); }); };
  G.act = () => hit(clamp(Math.floor((G.mx - 120) / 60), 0, 3));
  G.tick = (dt) => { t += dt; msgT -= dt; notes.forEach(n => { if (!n.done && t - n.t > 0.2) { n.done = true; miss++; combo = 0; msg = 'MISS'; msgT = 0.4; } });
    arcBg(x, '#14061e', '#05020a'); const pulse = Math.max(0, 1 - ((t / beat) % 1) * 3);
    for (let i = 0; i < 4; i++) { const cx = 150 + i * 60; x.fillStyle = `rgba(255,255,255,${0.04 + pulse * 0.05})`; x.fillRect(cx - 26, 0, 52, 360); x.strokeStyle = COLS[i][3]; x.lineWidth = 3; x.strokeRect(cx - 22, LINE - 22, 44, 44);
      x.fillStyle = COLS[i][3]; x.font = 'bold 30px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = 0.4; x.fillText(COLS[i][0], cx, LINE); x.globalAlpha = 1; }
    for (const n of notes) { if (n.done) continue; const y = LINE + (n.t - t) * SPD; if (y > 380) continue; const cx = 150 + n.c * 60; x.fillStyle = COLS[n.c][3]; x.font = 'bold 34px monospace'; x.fillText(COLS[n.c][0], cx, y); }
    if (msgT > 0) { x.fillStyle = msg === 'MISS' ? '#ff4a3a' : msg === 'PERFECT' ? '#9fff6a' : '#ffd36a'; x.font = 'bold 26px monospace'; x.fillText(msg, 240, 200); if (combo > 3) { x.font = 'bold 16px monospace'; x.fillText(combo + ' combo', 240, 228); } }
    x.textBaseline = 'alphabetic'; G.score(`${perf} perfect · ${good} good · ${miss} miss`);
    if (notes.every(n => n.done)) G.end(Math.round(perf * 1.2 + good * 0.6 + best * 0.3), miss === 0 ? 'FULL COMBO!' : 'NICE MOVES'); }; }

// ---------------- roulette (casino) ----------------
const RL_RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const RL = { spinAt: 0, result: null };   // the 3D wheel in the casino reads this to spin and settle
function openRoulette() {
  openDlg('Croupier Sol', 'Roulette');
  let bet = 100, pick = 'red';
  const P = csPanel('');
  const pays = { red: 2, black: 2, odd: 2, even: 2, low: 2, high: 2, d1: 3, d2: 3, d3: 3 }, names = { red: 'Red', black: 'Black', odd: 'Odd', even: 'Even', low: '1–18', high: '19–36', d1: '1st 12', d2: '2nd 12', d3: '3rd 12' };
  const wins = (k, n) => n === 0 ? false : k === 'red' ? RL_RED.includes(n) : k === 'black' ? !RL_RED.includes(n) : k === 'odd' ? n % 2 === 1 : k === 'even' ? n % 2 === 0 : k === 'low' ? n <= 18 : k === 'high' ? n >= 19 : k[0] === 'd' ? Math.ceil(n / 12) === +k[1] : k === 'n' + n;
  const render = msg => { P.innerHTML = `<div class="csnote">${Object.keys(names).map(k => `<button class="pbtn${k === pick ? ' win' : ''}" data-k="${k}" style="margin:2px;padding:4px 8px">${names[k]}</button>`).join('')}<button class="pbtn${pick === 'n7' ? ' win' : ''}" data-k="n7" style="margin:2px;padding:4px 8px">Lucky 7 (36×)</button></div>`;
    P.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { pick = b.dataset.k; SFX.ui && SFX.ui(); render(); }));
    $('dlgLine').textContent = msg || `Betting ${bet} cr on ${pick === 'n7' ? 'number 7' : names[pick]}. Pays ${pick === 'n7' ? 36 : pays[pick]}× your bet back.`;
    acts([['Spin', spin, true], [`Bet ${bet === 100 ? 500 : bet === 500 ? 2000 : 100}`, () => { bet = bet === 100 ? 500 : bet === 500 ? 2000 : 100; render(); }], ['Leave', closeDlg]]); };
  let busy = false;
  const spin = () => { if (busy || !csCan(bet)) return; busy = true; S.cr -= bet; markDirty(); const n = randi(0, 36); RL.spinAt = performance.now(); RL.result = n; SFX.ui && SFX.ui();
    $('dlgLine').textContent = 'No more bets. The ball rattles round the wheel…';
    setTimeout(() => { busy = false; const won = wins(pick, n), m = pick === 'n7' ? 36 : pays[pick], pay = won ? bet * m : 0; S.cr += pay; markDirty(); if (pay) SFX.coin && SFX.coin(); else SFX.hit && SFX.hit();
      if (dlgOpen) render(`${n} ${n === 0 ? 'green' : RL_RED.includes(n) ? 'red' : 'black'}. ${pay ? `You win ${pay} cr!` : 'The house takes it.'}`); }, 3200); };
  render();
}

// ---------------- blackjack (casino) ----------------
function openBlackjack() {
  openDlg('Dealer Marlo', 'Blackjack');
  let bet = 100, G = null; const P = csPanel('');
  const val = h => { let v = 0, a = 0; h.forEach(c => { const r = c.r; if (r === 12) { a++; v += 11; } else v += r >= 8 ? 10 : r + 2; }); while (v > 21 && a) { v -= 10; a--; } return v; };
  const show = (hideDealer, msg) => { P.innerHTML = `<div class="csrow"><span class="cswho">Marlo</span><span class="cshand">${G.dl.map((c, i) => csCardHtml(c, false, hideDealer && i === 1)).join('')}</span><span class="csval">${hideDealer ? '' : val(G.dl)}</span></div>
    <div class="csrow"><span class="cswho">You</span><span class="cshand">${G.me.map(c => csCardHtml(c)).join('')}</span><span class="csval">${val(G.me)}</span></div>`; if (msg) $('dlgLine').textContent = msg; };
  const intro = () => { G = null; P.innerHTML = '<div class="csnote">Get closer to 21 than the dealer without going over. Blackjack pays 3 to 2. Dealer stands on 17.</div>'; $('dlgLine').textContent = `Bet ${bet} cr.`;
    acts([['Deal', deal, true], [`Bet ${bet === 100 ? 500 : bet === 500 ? 2000 : 100}`, () => { bet = bet === 100 ? 500 : bet === 500 ? 2000 : 100; intro(); }], ['Leave', closeDlg]]); };
  const settle = msg => { show(false, msg); acts([['Deal again', deal, true], ['Leave', closeDlg]]); };
  const finish = () => { while (val(G.dl) < 17) G.dl.push(G.d.pop()); const p = val(G.me), d = val(G.dl);
    if (d > 21 || p > d) { S.cr += G.bet * 2; SFX.coin && SFX.coin(); settle(`${d > 21 ? 'Marlo busts' : 'You beat the dealer'}. You win ${G.bet} cr!`); }
    else if (p === d) { S.cr += G.bet; settle('Push. Your bet comes back.'); } else { SFX.hit && SFX.hit(); settle(`Marlo has ${d}. The house takes it.`); } markDirty(); };
  const deal = () => { if (!csCan(bet)) return; S.cr -= bet; markDirty(); const d = csDeck(); G = { d, me: [d.pop(), d.pop()], dl: [d.pop(), d.pop()], bet }; SFX.ui && SFX.ui();
    if (val(G.me) === 21) { const pay = Math.round(bet * 2.5); S.cr += pay; markDirty(); SFX.coin && SFX.coin(); return settle(`Blackjack! You win ${pay - bet} cr.`); } turn(); };
  const turn = () => { show(true, `You have ${val(G.me)}. Hit or stand?`); acts([['Hit', () => { G.me.push(G.d.pop()); SFX.ui && SFX.ui(); if (val(G.me) > 21) { SFX.hit && SFX.hit(); settle(`Bust with ${val(G.me)}. The house takes it.`); } else if (val(G.me) === 21) finish(); else turn(); }, true],
    ['Stand', finish, true], ...(G.me.length === 2 && S.cr >= G.bet ? [['Double', () => { S.cr -= G.bet; G.bet *= 2; markDirty(); G.me.push(G.d.pop()); if (val(G.me) > 21) settle(`Bust with ${val(G.me)}. The house takes it.`); else finish(); }]] : [])]); };
  intro();
}
