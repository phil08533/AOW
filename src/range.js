// =================== GUN RANGE: a buyable ship room where you can actually shoot ===================
// The ship is a safe zone, so guns are locked everywhere on board except inside the range.
// Free ammo on the range. Pop-up targets: body 10, bullseye 15, head 25. The drill is 30 seconds of random pop-ups.
ROOMS.range = { name: 'Gun Range', cost: { cr: 1200, circuit: 6 }, desc: 'Pop-up targets and a 30 second drill with a best score. The one place on the ship you can fire, with free ammo.' };
const RANGE = { rect: null, side: 1, tg: [], drill: null, hud: null };
function rangeRoom(s, cx, cz, outer, term, props) {
  RANGE.rect = { x0: s.x0 + 0.2, x1: s.x1 - 0.2, z0: s.z0 + 0.2, z1: s.z1 - 0.2 }; RANGE.side = s.side; RANGE.tg = []; RANGE.drill = null;
  const sd = s.side, lineX = sd * 4.2;
  // firing line: a counter you shoot over and a yellow stripe on the deck
  part(props, B(0.5, 1.0, 4.8), '#2a2c32', lineX, 0.5, cz + 1.2); part(props, B(0.56, 0.05, 4.9), toon('#c9a43a', 'hazard'), lineX, 1.02, cz + 1.2); box(lineX, cz + 1.2, 0.25, 2.4); // the open end lets you walk downrange
  part(props, B(0.12, 0.012, 9.6), glow('#ffd36a'), lineX + sd * 0.45, 0.014, cz);
  // lane dividers and a dark backstop
  for (const dz of [-2.55, -0.85, 0.85, 2.55]) part(props, B(4.5, 0.05, 0.04), glow('#ff6a3a'), sd * 8.6, 0.03, cz + dz);
  part(props, B(0.3, 2.9, 9.6), toonNS('#2a2228', 'grime'), outer - sd * 0.2, 1.45, cz);
  const lanes = [[9.6, -3.4], [8.2, -1.7], [11.0, 0], [8.2, 1.7], [9.6, 3.4]];
  const bodyM = toon('#e8e2d4'), ringM = glow('#ff4a3a'), headM = toon('#e8e2d4'), postM = toon('#3a3d44');
  lanes.forEach(([ax, dz]) => {
    const x = sd * ax, z = cz + dz, g = new THREE.Group(), pv = new THREE.Group();
    part(g, B(0.3, 0.25, 0.5), postM, 0, 0.12, 0); g.add(pv); pv.position.y = 0.25;
    part(pv, B(0.05, 0.4, 0.05), postM, 0, 0.2, 0);
    part(pv, B(0.04, 0.9, 0.6), bodyM, 0, 0.8, 0); part(pv, B(0.045, 0.24, 0.24), ringM, 0, 0.8, 0); part(pv, B(0.05, 0.1, 0.1), bodyM, 0, 0.8, 0);
    part(pv, B(0.04, 0.32, 0.32), headM, 0, 1.5, 0); part(pv, B(0.045, 0.1, 0.1), ringM, 0, 1.5, 0);
    g.position.set(x, 0, z); levelGroup.add(g);
    RANGE.tg.push({ x, z, g: pv, up: 1, want: 1, downT: 0, popT: 0, live: false });
  });
  levelAnims.push(() => rangeAnim());
  term(sd * 3.1, s.z0 + 0.7, '#ff6a3a', 'Gun range drill', openRange, 0);
}
const rangeHere = () => { const R = RANGE.rect; if (!R || !LEVEL || LEVEL.id !== 'ship') return null; const p = player.pos; return p.x > R.x0 && p.x < R.x1 && p.z > R.z0 && p.z < R.z1 ? R : null; };
let rangeLast = 0;
function rangeAnim() {
  const now = performance.now(), dt = Math.min(0.05, (now - (rangeLast || now)) / 1000); rangeLast = now;
  for (const t of RANGE.tg) {
    if (!RANGE.drill && t.want === 0 && now > t.downT) t.want = 1; // free shooting: targets pop back up
    t.up += (t.want - t.up) * Math.min(1, dt * 14);
    t.g.rotation.z = -RANGE.side * (1 - t.up) * Math.PI / 2;
  }
  const D = RANGE.drill; if (!D) return;
  if (!rangeHere()) { rangeEnd('You left the range'); return; }
  const left = D.end - now; if (left <= 0) { rangeEnd(); return; }
  for (const t of RANGE.tg) if (t.live && now > t.popT) { t.live = false; t.want = 0; } // missed: it drops on its own
  if (now > D.next) { const idle = RANGE.tg.filter(t => !t.live && t.up < 0.1); if (idle.length) { const t = idle[Math.floor(Math.random() * idle.length)]; t.live = true; t.want = 1; t.popT = now + Math.max(900, 1700 - D.hits * 40); D.pops++; } D.next = now + 450 + Math.random() * 650; }
  rangeHud(`🎯 ${Math.ceil(left / 1000)}s · ${D.score} pts · ${D.hits}/${D.pops} hit`);
}
function rangeHud(txt) {
  let h = RANGE.hud; if (!h) { h = RANGE.hud = document.createElement('div'); h.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top,0px) + 64px);left:50%;transform:translateX(-50%);z-index:30;padding:6px 14px;border-radius:10px;background:rgba(15,23,87,.82);color:#ffd75e;font:700 16px system-ui,sans-serif;pointer-events:none;letter-spacing:.5px'; document.body.appendChild(h); }
  h.hidden = !txt; if (txt) h.textContent = txt;
}
function openRange() {
  const best = S.rangeBest || 0;
  openDlg('Gun Range', 'Drill');
  $('dlgLine').textContent = `30 seconds. Targets pop up at random and drop again if you are too slow. Body 10, bullseye 15, head 25. Ammo is free in here. Best score: ${best}. Beating your best pays 2 credits a point.`;
  acts([['Start drill', () => { closeDlg(); rangeStart(); }, true], ['Close', closeDlg]]);
}
function rangeStart() {
  const now = performance.now();
  for (const t of RANGE.tg) { t.want = 0; t.live = false; }
  RANGE.drill = { end: now + 30000 + 1500, next: now + 1500, score: 0, hits: 0, pops: 0 };
  toast('DRILL', 'Targets incoming', 1.4); SFX.ui && SFX.ui();
}
function rangeEnd(why) {
  const D = RANGE.drill; RANGE.drill = null; rangeHud(''); if (!D) return;
  for (const t of RANGE.tg) { t.live = false; t.want = 1; }
  if (why) { toast('DRILL STOPPED', why, 2); return; }
  const old = S.rangeBest || 0, acc = D.pops ? Math.round(100 * D.hits / D.pops) : 0;
  if (D.score > old) { const pay = (D.score - old) * 2; S.rangeBest = D.score; S.cr += pay; gainXp(Math.round((D.score - old) / 4) + 1); markDirty(); SFX.level(); toast('NEW BEST ' + D.score, `${acc}% accuracy · +${pay} cr`, 3); }
  else toast('SCORE ' + D.score, `${acc}% accuracy · best ${old}`, 3);
}
// which target a shot hits, and where
function rangeHit(o, d) {
  let best = null, bt = 1e9;
  for (const t of RANGE.tg) {
    if (t.up < 0.7 || Math.abs(d.x) < 1e-4) continue;
    const tt = (t.x - o.x) / d.x; if (tt <= 0 || tt > bt) continue;
    const y = o.y + d.y * tt, dz = o.z + d.z * tt - t.z, base = t.g.parent.position.y + 0.25;
    let pts = 0; if (Math.abs(dz) < 0.16 && Math.abs(y - (base + 1.5)) < 0.16) pts = 25;
    else if (Math.abs(dz) < 0.3 && Math.abs(y - (base + 0.8)) < 0.45) pts = Math.hypot(dz, y - (base + 0.8)) < 0.13 ? 15 : 10;
    if (pts) { best = { t, pts, at: V(t.x, y, o.z + d.z * tt) }; bt = tt; }
  }
  return best;
}
// the ship's safe zone is lifted for shots fired from inside the range, and the ammo comes back
{ const _f = fire; fire = function () {
  if (!rangeHere()) return _f();
  const keep = SAFES.splice(0), am = player.ammo, c0 = player.cool; let r;
  try { r = _f(); } finally { for (const s of keep) SAFES.push(s); }
  if (c0 <= 0 && player.cool > 0) { player.ammo = am;
    const o = camera.getWorldPosition(V(0, 0, 0)), d = V(0, 0, 0); camera.getWorldDirection(d); const h = rangeHit(o, d);
    if (h) { const D = RANGE.drill, t = h.t;
      burst(h.at, h.pts >= 25 ? '#ff4a3a' : '#ffd36a', h.pts >= 25 ? 12 : 6, 4); hitmark(h.pts >= 25); SFX.hit && SFX.hit();
      if (D) { if (t.live) { t.live = false; t.want = 0; D.hits++; D.score += h.pts + (h.pts >= 25 ? 5 : 0); } }
      else { t.want = 0; t.downT = performance.now() + 1400; toast(h.pts >= 25 ? 'HEADSHOT' : h.pts >= 15 ? 'BULLSEYE' : 'HIT', h.pts + ' pts', 0.6); } } }
  return r; }; }
