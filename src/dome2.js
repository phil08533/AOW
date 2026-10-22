// Bubble City, inside: the Burbs (and their murder), the Low Tide strip (drugs, a fence, a stolen TV), the control room,
// Reel Deal Tackle, and Coral Heights, an apartment tower with an elevator, six floors of neighbours, a lost hamster and your own flat.
// Save: S.bub = { tv, tvOff, ham, mur: { st, clues: {} }, apt, night }.
const bubS = () => (S.bub = S.bub || { tv: 0, ham: 0, mur: { st: 0, clues: {} }, apt: 0 });
const BUB = { floor: 1, lie: false, ham: null };
const BAX = 150, BAZ = 0, BAL = 26, BAW = 4; // the hallway, built far from the city; your flat sits beyond it
const BFLAT = { x: 150, z: 60 };
function bubTalk(role, name, lines, done, i) { i = i || 0; if (i >= lines.length) { closeDlg(); if (done) done(); return; }
  openDlg(role, name); $('dlgLine').textContent = lines[i]; try { SFX.babble && SFX.babble(voicePitch(name), Math.min(14, 4 + (lines[i].length >> 4))); } catch (_) {}
  acts([[i === lines.length - 1 ? 'Okay' : 'Next ▸', () => bubTalk(role, name, lines, done, i + 1), true]]); }
function bubFade(txt, mid, after, hold) { const f = $('fade'); f.hidden = false; f.style.opacity = 1; $('fadeTxt').textContent = txt;
  setTimeout(() => { try { mid && mid(); } catch (e) { console.warn(e); } setTimeout(() => { f.style.opacity = 0; setTimeout(() => { f.hidden = true; after && after(); }, 400); }, hold || 700); }, 600); }
function bubNpc(x, z, ry, c, label, fn) { const o = buildChar(() => makeCivilian(c[0], c[1], c[2], c[3]), 'civ'); o.position.set(x, 0, z); o.rotation.y = ry; levelGroup.add(o); solid(x, z, 0.4);
  if (label) INTERACTS.push({ x, z, r: 2.2, label, fn }); return o; }
function bubSign(txt, bg, fg, w, h, x, y, z, ry) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) })); m.position.set(x, y, z); m.rotation.y = ry || 0; levelGroup.add(m); return m; }
// a lit neon tube sign that flickers now and then
function bubNeon(txt, col, x, y, z, ry, w) { const m = bubSign(txt, '#120818', col, w || 3, 0.6, x, y, z, ry); const fr = new THREE.Mesh(B((w || 3) + 0.2, 0.8, 0.06), glow(col)); fr.position.set(x, y, z); fr.rotation.y = ry || 0; fr.translateZ(-0.05); levelGroup.add(fr);
  levelAnims.push(t => { m.visible = Math.sin(t * 13 + x) > -0.97; }); }
function bubTV(w, h) { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 72; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); let last = 0;
  levelAnims.push(t => { if (t - last < 0.12) return; last = t; const sh = Math.floor(t / 4) % 4; cx.fillStyle = ['#2a5a9a', '#9a3a6a', '#2a7a4a', '#1a1a2a'][sh]; cx.fillRect(0, 0, 128, 72);
    cx.fillStyle = '#ffd36a'; cx.beginPath(); cx.arc(64 + Math.sin(t * 2) * 30, 40 + Math.cos(t * 3) * 10, 10, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.font = 'bold 11px monospace';
    cx.fillText(['FISH COPS', 'DOME SHOPPING', 'KELP NEWS', 'LATE NIGHT JELLY'][sh], 6, 14); cx.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = (t * 40) % 4; y < 72; y += 4) cx.fillRect(0, y, 128, 1); tex.needsUpdate = true; });
  return m; }

// ---------------- the city ----------------
function bubCity() { const S2 = bubS();
  // THE LOW TIDE: the west strip goes seedy after dark. Neon, a pawn shop, a dealer, Rizzo and his TV
  bubNeon('THE LOW TIDE', '#ff3bd2', -28, 5.4, 18.5, Math.PI, 4); bubNeon('CRABBY\'S PAWN', '#ffd36a', -37.3, 3.8, -16, Math.PI / 2);
  bubNeon('BAR · OPEN LATE', '#4fffe0', -37.3, 4.2, 6, Math.PI / 2);
  for (let i = 0; i < 6; i++) { const t = new THREE.Group(); part(t, Cy(0.35, 0.3, 0.9, 8), toon('#3a4a3a'), 0, 0.45, 0); part(t, Cy(0.36, 0.36, 0.08, 8), toon('#2b2a2c'), 0, 0.92, 0); t.position.set(-35 + (i % 3) * 1.1, 0, -6 + Math.floor(i / 3) * 18); levelGroup.add(t); }
  bubNpc(-36.8, 6, Math.PI / 2, ['#2b2a2c', '#1e1a18', '#c58a64', '#111'], '💊 Dregs (dealer)', () => openSubShop('Low Tide dealer', 'Dregs', Object.keys(SUBS).filter(k => !SUBS[k].legal && !SUBS[k].lab)));
  bubNpc(-36.8, -16, Math.PI / 2, ['#c8402f', '#3a3d44', '#ff8a6a', '#e8e4dc'], '🦀 Crabby\'s Pawn', bubPawn);
  bubNpc(-33.5, -4, Math.PI / 2, ['#6a3a8a', '#2c2a38', '#8a5a3a', '#1e1a18'], '📺 Talk to Rizzo', bubRizzo);
  // CORAL HEIGHTS: the apartment tower in the south-west
  const tx = -27, tz = 30, tw = 10, th = 34, tower = new THREE.Group();
  part(tower, B(tw, th, tw), toon('#8a7f9a', 'panel'), 0, th / 2, 0);
  for (let f = 0; f < 10; f++) for (let k = 0; k < 4; k++) for (const [sx, sz, ry] of [[1, 0, Math.PI / 2], [0, -1, Math.PI]]) {
    const lit = ((f * 7 + k * 3) % 5) > 1, w = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), lit ? glow(['#ffe9a0', '#ffd0a0', '#c8e0ff'][(f + k) % 3]) : toon('#2a3040'));
    const o = -3.6 + k * 2.4; w.position.set(sx ? tw / 2 + 0.03 : o, 3.5 + f * 3, sz ? -tw / 2 - 0.03 : o); if (sx) w.position.z = o; w.rotation.y = ry === Math.PI ? Math.PI : Math.PI / 2; tower.add(w); }
  part(tower, B(tw + 0.6, 0.5, tw + 0.6), toon('#5d636c'), 0, th, 0); part(tower, Cy(0.1, 0.1, 4, 5), toon('#2b2a2c'), 3, th + 2, 3); part(tower, new THREE.SphereGeometry(0.25, 8, 6), glow('#ff3b2a'), 3, th + 4, 3);
  part(tower, B(0.1, 2.6, 2.4), toon('#3a5266'), tw / 2 + 0.05, 1.3, 0); part(tower, B(0.3, 0.2, 3.4), glow('#ffe9a0'), tw / 2 + 0.6, 2.9, 0);
  tower.position.set(tx, 0, tz); levelGroup.add(tower); box(tx, tz, tw / 2, tw / 2);
  bubSign('CORAL HEIGHTS', '#1a1426', '#ffd0a0', 3.4, 0.6, tx + tw / 2 + 0.1, 3.6, tz, Math.PI / 2);
  INTERACTS.push({ x: tx + tw / 2 + 1, z: tz, r: 2.4, label: '🏢 Enter Coral Heights', fn: () => bubGoFloor(1, true) });
  // REEL DEAL TACKLE in the house by the tower
  bubSign('REEL DEAL TACKLE', '#0c2a3a', '#7fe8ff', 3.4, 0.6, -16, 4.2, 27.4, Math.PI);
  const rod = new THREE.Group(); part(rod, Cy(0.05, 0.08, 4.6, 6), toon('#c9a43a'), 0, 2.3, 0); part(rod, new THREE.TorusGeometry(0.3, 0.08, 6, 12), toon('#5d636c'), 0, 1, 0.1); rod.position.set(-19, 0, 27); rod.rotation.z = 0.35; levelGroup.add(rod);
  bubNpc(-16, 26.6, Math.PI, ['#3a7a5a', '#5a4a3a', '#e0b892', '#c8c0b0'], '🎣 Reel Deal Tackle', bubTackle);
  // THE CONTROL ROOM in the north-west: glass front, a wall of monitors, a big lever
  const cx = -22, cz = -38, cr = new THREE.Group();
  part(cr, B(11, 5, 7), toon('#3a3d44', 'panel'), 0, 2.5, 0); part(cr, B(9, 2.2, 0.1), new THREE.MeshLambertMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.35 }), 0, 2.4, 3.52);
  for (let i = 0; i < 6; i++) { const s = bubTV(1.3, 0.8); s.position.set(-3.2 + (i % 3) * 1.6, 3.5 - Math.floor(i / 3) * 1.0, 3.6); cr.add(s); }
  part(cr, B(11.6, 0.4, 7.6), glow('#4fd2ff'), 0, 5.2, 0); cr.position.set(cx, 0, cz); levelGroup.add(cr); box(cx, cz, 5.5, 3.5);
  bubSign('DOME CONTROL · AUTHORISED FISH ONLY', '#0c1a24', '#7fe8ff', 5, 0.6, cx, 6, cz + 3.6);
  bubNpc(cx + 4, cz + 4.6, Math.PI, ['#4fd2ff', '#2c2a38', '#9fe8ff', '#3a2a1a'], '🖥 Talk to Dot (Dome Control)', bubDot);
  // THE BURBS: lawns, picket fences and mailboxes on the east lane, and a crime scene
  for (const z of [-26, -18, -10, 10, 18, 26]) for (const x of [28.6, 33.4]) { part(levelGroup, B(0.08, 0.7, 6), toon('#f4f0e8'), x, 0.35, z); const mb = new THREE.Group(); part(mb, Cy(0.04, 0.04, 1, 4), toon('#5d636c'), 0, 0.5, 0); part(mb, B(0.25, 0.25, 0.45), toon(['#c8402f', '#3a5266', '#3f7a3a'][(z + 40) % 3]), 0, 1.1, 0); mb.position.set(x + (x < 31 ? 0.4 : -0.4), 0, z + 2.6); levelGroup.add(mb); }
  part(levelGroup, B(0.1, 0.1, 64), toon('#e8e4dc'), 31, 0.02, 0);
  bubSign('WELCOME TO THE BURBS · NICE LAWNS ONLY', '#1a3a1a', '#b8ffcf', 4.4, 0.6, 31, 3.4, -33, 0);
  bubMurderScene();
  // the lost hamster, running laps in the coral park (until you pick him up)
  if (!S2.ham) { const h = bubHamster(); h.position.set(22, 0, 34); levelGroup.add(h); BUB.ham = h; const hx = 22, hz = 34;
    levelAnims.push(t => { if (bubS().ham) return; h.position.set(hx + Math.cos(t * 1.7) * 1.2, 0, hz + Math.sin(t * 1.7) * 1.2); h.rotation.y = -t * 1.7; });
    INTERACTS.push({ get x() { return bubS().ham ? 1e9 : h.position.x; }, get z() { return h.position.z; }, r: 1.8, label: '🐹 Pick up the tiny hamster', fn: bubPickHam }); }
  if (S2.ham === 1) bubFollower();
}
{ const _b = LEVELS.bubblecity.build; LEVELS.bubblecity.build = function () { _b.apply(this, arguments); try { bubCity(); bubTower(); bubFlat(); } catch (e) { console.warn('dome2', e); } }; }

// ---------------- the stolen TV ----------------
ITEMS.bub_tv = { name: 'Suspiciously Cheap TV', v: 0, col: '#5d636c', quest: true, note: 'Still warm. Still has the store tag. Rizzo says "sell it, split it."' };
function bubRizzo() { const s = bubS();
  if (s.tv === 3) return bubTalk('The Low Tide', 'Rizzo', ['Pleasure doing business. If anyone asks, I was at my mother\'s. I don\'t have a mother.']);
  if (s.tv >= 1) return bubTalk('The Low Tide', 'Rizzo', ['Still got the TV? Crabby will buy it. Crabby buys everything except stuff with a tracker in it.', 'Which is everything in this dome. Talk to Dot in Dome Control. She owes me. Or I owe her. One of those.']);
  bubTalk('The Low Tide', 'Rizzo', ['Psst. You. Big-eyes. You want a TV? Fifty-inch. Well, fifty millimetre. We\'re all small here.', 'I can\'t sell it myself. Long story. The store has my face on a poster.', 'You sell it to Crabby, we split it. You keep most. Okay, some.'], () => {
    s.tv = 1; S.inv.bub_tv = 1; markDirty(); SFX.quest(); toast('STOLEN TV', 'Sell it at Crabby\'s Pawn', 2.4); log('+1 Suspiciously Cheap TV', 'loot'); }); }
function bubPawn() { const s = bubS();
  if (s.tv === 1 && S.inv.bub_tv) return bubTalk('Crabby\'s Pawn', 'Crabby', ['Is that a TV? With a little blinking light on the back? That\'s a DomeNet tracker, pal.', 'I sell that, the cops are in here before I can say "I found it." Get the tracker turned off and we\'ll talk.']);
  if (s.tv === 2 && S.inv.bub_tv) return bubTalk('Crabby\'s Pawn', 'Crabby', ['No blinking light. Beautiful. I don\'t ask, you don\'t tell. 900 for it.', 'Rizzo\'s cut? Rizzo owes me 600, so I just took it out. Here\'s your 900. Everyone\'s happy except Rizzo.'], () => {
    delete S.inv.bub_tv; s.tv = 3; S.cr += 900; markDirty(); SFX.coin(); toast('TV SOLD', '+900 cr. Rizzo is going to be furious.', 2.6); });
  openFence('Fence · The Low Tide', 'Crabby', '"Hot goods, cold cash. I don\'t check pockets."', 1.1);
}
function bubDot() { const s = bubS();
  openDlg('Dome Control', 'Dot'); $('dlgLine').textContent = '"Welcome to Dome Control. I control the dome. Mostly the lights. Sometimes the hum."';
  const L = []; if (s.tv === 1) L.push(['Ask about TV trackers', () => { $('dlgLine').textContent = '"A tracker? On a TV that is definitely yours? I could switch it off. The coffee fund is 200 credits, by the way. Unrelated."';
    acts([['Pay 200 cr', () => { if (S.cr < 200) { SFX.hit(); $('dlgLine').textContent = '"The coffee fund only takes credits. You do not have them."'; return; } S.cr -= 200; s.tv = 2; markDirty(); SFX.coin(); $('dlgLine').textContent = '"Click. Oh no, I seem to have lost track of a TV. Anyway."'; acts([['Thanks', closeDlg, true]]); }, true], ['Never mind', closeDlg]]); }, true]);
  L.push(['Flip the day/night lever', () => { bubNight(!BUB.night); SFX.door(); $('dlgLine').textContent = '"Whoa! Ok. Everyone just got very confused. I love it."'; }]);
  L.push(['Read the PA announcements', () => { $('dlgLine').textContent = ['"Reminder: tapping on the dome is a crime. A big one."', '"Lost: one hamster, small, even for here. Answers to Peanut. Probably."', '"The Burbs HOA would like to remind residents that lawns are measured with a ruler."'][Math.floor(Math.random() * 3)]; }]);
  L.push(['Bye', closeDlg]); acts(L); }

// ---------------- Reel Deal Tackle: fishing clothes ----------------
ARMORS.angler = { name: 'Reel Deal Waders', lvl: 1, flag: 'anglerSet', def: 0.04, trim: '#3a7a5a', visor: '#ffd36a' };
CAPES.angler = { name: 'Pro Angler Vest', lvl: 1, flag: 'anglerVest', col: '#4a6a3a', trim: '#ffd36a' };
const TACKLE = [['anglerSet', 'Reel Deal Waders', 1200, 'Rubber to the chest. Fish respect you more. (Armor, wardrobe)'], ['anglerVest', 'Pro Angler Vest', 800, 'Forty pockets. You will lose things in all of them. (Cape, wardrobe)']];
function bubTackle() { openDlg('Reel Deal Tackle', 'Old Hank'); S.flags = S.flags || {};
  const render = () => { $('dlgLine').textContent = `"Fish can smell a beginner. Dress like a pro." You have ${S.cr.toLocaleString()} cr.`;
    acts([...TACKLE.map(([f, n, p]) => [S.flags[f] ? `${n} ✓ owned` : `${n} · ${p} cr`, () => { if (S.flags[f]) return; if (S.cr < p) { SFX.hit(); log('Not enough credits.'); return; } S.cr -= p; S.flags[f] = true; markDirty(); SFX.coin(); toast('NEW GEAR', `${n}. Wear it from the wardrobe.`, 2.4); render(); }, false, !!S.flags[f]]), ['Look around', () => { $('dlgLine').textContent = TACKLE.map(t => `${t[1]}: ${t[3]}`).join('  ·  '); }], ['Done', closeDlg, true]]); };
  render(); }

// ---------------- the murder in the Burbs ----------------
const MUR_CLUES = { tracks: 'Little round wheel tracks circle the pool. Lots of them. Like something was doing laps.', barb: 'Barb heard "a humming, and a bump, and a splash" at 3 a.m.', dale: 'Dale says Gerald set his robot vacuum to AGGRESSIVE MODE to "deal with the leaves".', manual: 'A soggy manual: "Sir Sucks-a-Lot v2. Do NOT use near pools. Do NOT insult."' };
function bubMurderScene() { const m = bubS().mur, X = 31, Zc = 22;
  const pool = new THREE.Group(); part(pool, Cy(1.6, 1.6, 0.5, 18), toon('#ff8ab8'), 0, 0.25, 0); part(pool, Cy(1.45, 1.45, 0.05, 18), new THREE.MeshLambertMaterial({ color: '#4fa8cc' }), 0, 0.46, 0); pool.position.set(X + 0.5, 0, Zc); levelGroup.add(pool); solid(X + 0.5, Zc, 1.6);
  if (m.st < 2) { const body = new THREE.Group(); part(body, B(0.5, 0.35, 1.6), toon('#ffd36a'), 0, 0.55, 0); part(body, B(0.5, 0.2, 0.5), toon('#e0b892'), 0, 0.5, -1.0); body.position.set(X + 0.5, 0, Zc); body.rotation.y = 0.6; levelGroup.add(body);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, t = new THREE.Mesh(B(0.8, 0.5, 0.04), toon(i % 2 ? '#ffd36a' : '#1e1a18')); t.position.set(X + 0.5 + Math.cos(a) * 2.6, 0.7, Zc + Math.sin(a) * 2.6); t.rotation.y = -a + Math.PI / 2; levelGroup.add(t); } }
  const robo = new THREE.Group(); part(robo, Cy(0.35, 0.35, 0.12, 14), toon('#2b2a2c'), 0, 0.06, 0); part(robo, new THREE.SphereGeometry(0.05, 6, 4), glow('#ff3b2a'), 0, 0.14, 0.25); robo.position.set(X - 1, 0, Zc + 4); levelGroup.add(robo);
  levelAnims.push(t => { if (bubS().mur.st >= 2) return; robo.position.set(X - 1 + Math.sin(t * 0.8) * 1.2, 0, Zc + 4 + Math.cos(t * 0.6) * 0.8); robo.rotation.y = t; });
  bubNpc(X - 1.4, Zc - 2.6, 0.4, ['#6a5a3a', '#3a3d44', '#c58a64', '#2b2a2c'], '🕵 Detective Clam', bubClam);
  INTERACTS.push({ get x() { return bubS().mur.st === 1 ? X + 2.4 : 1e9; }, z: Zc + 1.6, r: 1.6, label: '🔍 Examine the pool edge', fn: () => bubClue('tracks') });
  INTERACTS.push({ get x() { return bubS().mur.st === 1 ? robo.position.x : 1e9; }, get z() { return robo.position.z; }, r: 1.4, label: '🔍 Examine the robot vacuum', fn: () => bubClue('manual') });
  INTERACTS.push({ x: 21, z: 26, r: 2.2, label: '🚪 Knock: Barb (HOA president)', fn: () => bubSuspect('barb') });
  INTERACTS.push({ x: 21, z: 18, r: 2.2, label: '🚪 Knock: Dale (grill dad)', fn: () => bubSuspect('dale') });
  INTERACTS.push({ x: 41, z: 18, r: 2.2, label: '🚪 Knock: Kevin (teenager)', fn: () => bubSuspect('kevin') }); }
function bubClue(k) { const m = bubS().mur; if (m.clues[k]) { bubTalk('Clue', 'Your notes', [MUR_CLUES[k]]); return; } m.clues[k] = 1; markDirty(); SFX.quest(); toast('CLUE', `${Object.keys(m.clues).length} of 4 found`, 1.8); bubTalk('Clue found', 'Your notes', [MUR_CLUES[k]]); }
function bubClam() { const m = bubS().mur;
  if (m.st === 2) return bubTalk('The Burbs', 'Detective Clam', ['Sir Sucks-a-Lot is in custody. He has not said a word. He is a vacuum.', 'Good work. The Burbs are safe again. Except from the HOA.']);
  if (m.st === 0) return bubTalk('The Burbs', 'Detective Clam', ['Gerald Puffington. Found face down in his own kiddie pool. In a dome. Under the ocean. You couldn\'t write it.', 'I need a fresh pair of eyes. Mine have been open since Tuesday.', 'Talk to the neighbours. Look around the pool. Then tell me who did it.'], () => { m.st = 1; markDirty(); toast('MURDER IN THE BURBS', 'Find clues, then tell Detective Clam who did it', 3); });
  const n = Object.keys(m.clues).length;
  if (n < 3) return bubTalk('The Burbs', 'Detective Clam', [`You've got ${n} clue${n === 1 ? '' : 's'}. I need at least three before we start accusing people. Last time we accused a mailbox.`]);
  openDlg('The Burbs', 'Detective Clam'); $('dlgLine').textContent = '"Okay, detective. Who did it?"';
  const wrong = w => () => { $('dlgLine').textContent = w; SFX.hit(); acts([['Think again', bubClam, true]]); };
  acts([['Barb', wrong('"Barb? She measures lawns with a ruler. That\'s a crime, but not this one."')], ['Dale', wrong('"Dale was grilling all night. We have a hundred witnesses. They were all hungry."')], ['Kevin', wrong('"Kevin can\'t even get out of bed before noon. He\'s fifteen."')],
    ['The robot vacuum', () => { m.st = 2; S.cr += 1500; markDirty(); SFX.quest(); toast('CASE CLOSED', 'Sir Sucks-a-Lot did it · +1500 cr', 3);
      $('dlgLine').textContent = '"The VACUUM. Aggressive mode, a pool, laps all night, one bump too many. Cuff him! Well. Put him in a bag."'; acts([['Case closed', closeDlg, true]]); }, true]]); }
function bubSuspect(who) { const m = bubS().mur, L = {
  barb: m.st === 1 ? ['Gerald? Oh, terrible. His lawn was two centimetres over code, but terrible.', 'I heard a humming at about three. Then a bump. Then a splash. I assumed it was Dale.'] : ['Your shoes are on the lawn. Please remove your shoes from the lawn.'],
  dale: m.st === 1 ? ['I was grilling! All night! Ask anyone, they all came over.', 'Gerald? He loved that robot vacuum. Set it to aggressive mode for the leaves. We don\'t have leaves. We\'re underwater.'] : ['Burger? They\'re kelp. They\'re all kelp. I\'m so tired.'],
  kevin: ['...', 'What.', 'I didn\'t do it. I was asleep. I\'m always asleep. Can you close the door, the light is too loud.'] }[who];
  bubTalk('The Burbs', { barb: 'Barb', dale: 'Dale', kevin: 'Kevin' }[who], L, () => { if (m.st === 1 && who !== 'kevin' && !m.clues[who]) bubClue(who); }); }

// ---------------- the hamster ----------------
function bubHamster() { const g = new THREE.Group(); part(g, new THREE.SphereGeometry(0.16, 10, 8), toon('#d8a060'), 0, 0.15, 0); part(g, new THREE.SphereGeometry(0.1, 8, 6), toon('#f4e0c0'), 0, 0.17, -0.12);
  for (const s of [-1, 1]) { part(g, new THREE.SphereGeometry(0.04, 6, 4), toon('#ffb8b8'), s * 0.08, 0.3, -0.04); part(g, new THREE.SphereGeometry(0.02, 4, 3), toon('#111'), s * 0.05, 0.21, -0.2); } g.scale.setScalar(1.3); return g; }
function bubPickHam() { const s = bubS(); if (s.ham) return; s.ham = 1; markDirty(); if (BUB.ham) { BUB.ham.parent && BUB.ham.parent.remove(BUB.ham); BUB.ham = null; } SFX.quest(); toast('TINY HAMSTER', 'He follows you now', 2);
  bubFollower(); setTimeout(() => burpSay('That is a hamster. It is very small, even for here. It probably belongs to someone in the Coral Heights apartments.'), 600); }
function bubFollower() { const h = bubHamster(); levelGroup.add(h); const p = new THREE.Vector3(player.pos.x, 0, player.pos.z);
  levelAnims.push(t => { if (bubS().ham !== 1) { h.visible = false; return; } const fx = player.pos.x + Math.sin(player.yaw) * 1.1, fz = player.pos.z + Math.cos(player.yaw) * 1.1; const d = Math.hypot(fx - p.x, fz - p.z);
    if (d > 8) p.set(fx, 0, fz); else { p.x += (fx - p.x) * 0.08; p.z += (fz - p.z) * 0.08; } h.position.set(p.x, player.pos.y + Math.abs(Math.sin(t * 14)) * 0.06 * Math.min(1, d), p.z); h.rotation.y = Math.atan2(-(fx - p.x), -(fz - p.z)) + Math.PI; }); }

// ---------------- Coral Heights: lobby, elevator, six floors ----------------
const BRES = {
  1: { A: ['Laundry room', ['The machines hum. One of them has been running since 2019. Nobody dares open it.']], B: ['Mrs. Krill (landlord)', null], C: ['Mail room', ['Forty-one parcels addressed to "Resident". Two of them are moving.']], D: ['Maintenance', ['A sign: "BACK IN 5 MIN". It is very dusty.']] },
  2: { A: ['Old Man Tidwell', ['Back in my day this dome was a bubble. And the bubble was a smaller bubble. Get off my mat.']], B: ['The Gill Brothers (band)', ['We\'re practising! Our band is called Gill Collins! You can\'t come in, the drummer is asleep on the drums.']], C: ['Vacant', ['A note on the door: "Not haunted. Probably."']], D: ['The Twins', ['Two identical kids stare at you through the gap. "Our mom says don\'t talk to big people." "You ARE big." Door closes.']] },
  3: { A: ['Chad Brine', ['Bro. Bro. I just did four hundred crunches. On the dome. Under the ocean. Respect the grind.']], B: ['Madame Opal', ['I saw you coming. Not in a vision. Through the peephole. It\'s a very good peephole.']], C: ['Gary (works from home)', ['I\'m on a call! I\'m on mute! I\'ve been on mute for six years!']], D: ['Somebody crying', ['Muffled sobbing. Then, very clearly: "IT WAS ONE EPISODE, KEITH." You back away.']] },
  4: { A: ['Mr. Fussbucket', ['Is that a SHOE on my carpet runner? The runner is communal. I will be writing a note.']], B: ['Marisol Puddleby', null], C: ['A party', ['Loud music, a fog machine, someone dressed as a crab. "Are you the pizza?" "No." Door slams.']], D: ['Nobody answers', ['Heavy breathing on the other side. Then a fish face at the peephole. Then nothing.']] },
  5: { A: ['Dr. Kelpman', ['I\'m a doctor. Of kelp. Please stop telling people I\'m a real doctor.']], B: ['Grandma Coral', ['Come in, come in! No, stay out there, I just mopped. Have a cookie through the gap. It\'s a kelp cookie.']], C: ['Conspiracy Steve', ['The dome isn\'t real. The ocean isn\'t real. YOU are real, maybe. Prove it. Don\'t. Leave.']], D: ['The Hendersons', ['Shouting inside. "YOU loaded the dishwasher WRONG." "There\'s only one WAY." You quietly leave.']] },
  6: { A: ['Brittani (influencer)', ['OMG hi, can you hold this ring light? No? Okay, can you be in the background looking mysterious? Perfect, never mind.']], B: ['Apartment 6B', null], C: ['Sketchy Lou', null], D: ['Roof access', ['Locked. A sign: "ROOF CLOSED. DOME IS ROOF."']] } };
function bubGoFloor(f, enter) { BUB.floor = f; bubFade(enter ? 'Coral Heights' : `Floor ${f}`, () => { player.pos.set(BAX, 0, enter ? BAZ + BAL / 2 - 2 : BAZ - BAL / 2 + 2.6); player.yaw = enter ? 0 : Math.PI; BUB.lbl && BUB.lbl(); }, () => toast('CORAL HEIGHTS', f === 1 ? 'Lobby' : `Floor ${f}`, 1.4), 200); }
function bubElevator() { openDlg('Elevator', 'Coral Heights'); $('dlgLine').textContent = `You're on ${BUB.floor === 1 ? 'the lobby' : 'floor ' + BUB.floor}. The music is a smooth jazz cover of a sea shanty.`;
  acts([...[1, 2, 3, 4, 5, 6].map(f => [f === 1 ? 'Lobby' : `${f}`, () => { closeDlg(); SFX.door(); bubGoFloor(f); }, f === BUB.floor, f === BUB.floor]), ['Stay', closeDlg]]); }
function bubTower() { const X = BAX, Z = BAZ, hall = toon('#8a6a7a'), carpet = toon('#5a2a3a');
  part(levelGroup, B(BAW, 0.1, BAL), carpet, X, 0.05, Z); part(levelGroup, B(BAW + 0.4, 0.2, BAL + 0.4), toon('#d8d0c0'), X, 3.3, Z);
  for (const s of [-1, 1]) { part(levelGroup, B(0.2, 3.4, BAL), hall, X + s * (BAW / 2 + 0.1), 1.7, Z); box(X + s * (BAW / 2 + 0.3), Z, 0.3, BAL / 2); }
  for (const s of [-1, 1]) { part(levelGroup, B(BAW, 3.4, 0.2), hall, X, 1.7, Z + s * (BAL / 2 + 0.1)); box(X, Z + s * (BAL / 2 + 0.3), BAW / 2, 0.3); }
  for (let i = 0; i < 5; i++) part(levelGroup, B(0.6, 0.06, 0.6), glow('#ffe9a0'), X, 3.18, Z - BAL / 2 + 3 + i * 5);
  // elevator at the far (north) end, the street door at the south end on the lobby
  part(levelGroup, B(2.2, 2.6, 0.12), toon('#c9a43a'), X, 1.3, Z - BAL / 2 + 0.05); part(levelGroup, B(0.04, 2.6, 0.14), toon('#6a5a3a'), X, 1.3, Z - BAL / 2 + 0.06);
  INTERACTS.push({ x: X, z: Z - BAL / 2 + 1.2, r: 2, label: '🛗 Call the elevator', fn: bubElevator });
  part(levelGroup, B(1.6, 2.4, 0.12), toon('#3a5266'), X, 1.2, Z + BAL / 2 - 0.05);
  INTERACTS.push({ x: X, z: Z + BAL / 2 - 1.1, r: 1.8, label: 'Street door (lobby only)', fn: () => { if (BUB.floor !== 1) { toast('CORAL HEIGHTS', 'Take the elevator down to the lobby', 1.6); return; } bubFade('Bubble City', () => { player.pos.set(-27 + 5 + 1.6, 0, 30); player.yaw = -Math.PI / 2; }); } });
  // floor plate signs, re-drawn on each floor
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const tex = new THREE.CanvasTexture(cv), pl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: tex }));
  pl.position.set(X, 2.9, Z - BAL / 2 + 0.15); levelGroup.add(pl);
  BUB.lbl = () => { const c = cv.getContext('2d'); c.fillStyle = '#1a1426'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#ffd36a'; c.font = 'bold 34px monospace'; c.textAlign = 'center'; c.fillText(BUB.floor === 1 ? 'LOBBY' : 'FLOOR ' + BUB.floor, 128, 44); tex.needsUpdate = true; }; BUB.lbl();
  // doors: A and B on the west wall, C and D on the east
  [['A', -1, -5], ['B', -1, 4], ['C', 1, -5], ['D', 1, 4]].forEach(([k, s, dz]) => { const dx = X + s * (BAW / 2 - 0.02);
    part(levelGroup, B(0.1, 2.3, 1.2), toon(['#6a3a2a', '#3a4a6a', '#4a5a3a', '#6a5a2a'][' ABCD'.indexOf(k) - 1]), dx, 1.15, Z + dz); part(levelGroup, new THREE.SphereGeometry(0.06, 6, 4), toon('#c9a43a'), dx - s * 0.08, 1.1, Z + dz + 0.4);
    INTERACTS.push({ x: dx - s * 0.9, z: Z + dz, r: 1.6, get label() { const r = BRES[BUB.floor][k]; return `🚪 ${BUB.floor}${k} · ${r[0]}`; }, fn: () => bubDoor(k) }); });
  part(levelGroup, B(1.2, 1, 0.6), toon('#6a4f34', 'wood'), X - 1, 0.5, Z + 4); // lobby desk (only Mrs. Krill uses it, but every floor has one; the building was cheap)
  const pot = new THREE.Group(); part(pot, Cy(0.3, 0.25, 0.5, 8), toon('#c8402f'), 0, 0.25, 0); part(pot, B(0.1, 1.2, 0.1), toon('#3f7a3a', 'leaves'), 0, 1, 0); pot.position.set(X + 1.5, 0, Z - 9); levelGroup.add(pot); }
function bubDoor(k) { const f = BUB.floor, r = BRES[f][k], s = bubS();
  if (f === 1 && k === 'B') return bubKrill();
  if (f === 4 && k === 'B') return bubMarisol();
  if (f === 6 && k === 'B') { if (s.apt) return bubFade('Home', () => { player.pos.set(BFLAT.x, 0, BFLAT.z + 1.5); player.yaw = 0; }); return bubTalk('Coral Heights', '6B', ['A brass plate: "FOR RENT · SEE MRS. KRILL IN THE LOBBY · 1 BED · HAS A PORTHOLE"']); }
  if (f === 6 && k === 'C') return openSubShop('Coral Heights · 6C', 'Sketchy Lou', Object.keys(SUBS).filter(i => !SUBS[i].lab));
  const L = r[1].slice(); if (s.ham === 1) L.push(['"A hamster? Not ours. We had a goldfish once. It moved out."', '"Not mine. Try upstairs, they have a cage-y vibe."', '"Is that a HAMSTER? In THIS economy? Not mine."'][(f + ' ABCD'.indexOf(k)) % 3]);
  SFX.door(); bubTalk(`Coral Heights · ${f}${k}`, r[0], L); }
function bubKrill() { const s = bubS();
  openDlg('Coral Heights · landlord', 'Mrs. Krill');
  if (s.apt) { $('dlgLine').textContent = '"Rent\'s paid. Don\'t put anything in the porthole. It\'s a window. It doesn\'t open. Last tenant tried."'; acts([['Okay', closeDlg, true]]); return; }
  $('dlgLine').textContent = '"6B is free. One bedroom, a TV, a bed you can lie down on, and a PORTHOLE. 3,000 credits and it\'s yours forever. I don\'t do monthly, I hate maths."';
  acts([['Rent 6B (3,000 cr)', () => { if (S.cr < 3000) { SFX.hit(); $('dlgLine').textContent = '"Three thousand. Come back when your pockets jingle."'; return; } S.cr -= 3000; s.apt = 1; markDirty(); SFX.coin(); toast('APARTMENT 6B', 'Take the elevator to floor 6. It\'s yours.', 3); $('dlgLine').textContent = '"Lovely. Don\'t lose the key. I don\'t have another one. There is no key, actually. Just say your name to the door."'; acts([['Thanks', closeDlg, true]]); }, true], ['Not now', closeDlg]]); }
function bubMarisol() { const s = bubS();
  if (s.ham === 1) return bubTalk('Coral Heights · 4B', 'Marisol Puddleby', ['PEANUT! Oh my gosh, you found Peanut! He\'s been gone for two days. He takes himself on walks. He\'s very independent.', 'You\'re a hero. Here, I have 500 credits in a sock. Take the sock too.'], () => {
    s.ham = 2; S.cr += 500; markDirty(); SFX.quest(); toast('PEANUT IS HOME', '+500 cr', 2.4); bubStayOver(); });
  if (s.ham === 2) return bubStayOver(true);
  bubTalk('Coral Heights · 4B', 'Marisol Puddleby', ['Have you seen a hamster? Tiny? Even for here? Called Peanut? He likes the coral park. No? Okay. *closes door sadly*']); }
function bubStayOver(again) { openDlg('Coral Heights · 4B', 'Marisol Puddleby');
  $('dlgLine').textContent = again ? '"Oh hey, you! Peanut says hi. Want to come in and hang out? I\'ve got snacks and, um, other snacks."' : '"So... it\'s late. Do you want to stay over? We could watch something. I have snacks. And, um, other snacks."';
  acts([['Stay the night', () => { closeDlg(); bubFade('Later that night…', () => { bubS().night = (bubS().night || 0) + 1; if (subsOn()) { buffs().sub_neondust = Date.now() + 120000; } }, () => {
      bubFade('…morning.', () => { bubNight(false); player.hp = maxHp(); markDirty(); }, () => { toast('GOOD MORNING', subsOn() ? 'You feel… colourful. Peanut is watching you.' : 'Full health. Peanut is watching you.', 3); }, 1200); }, 1800); }, true], ['Maybe another time', closeDlg]]); }

// ---------------- your flat: 6B ----------------
function bubFlat() { const X = BFLAT.x, Z = BFLAT.z, W = 4.2, L = 5, wall = toon('#b8a8c8');
  part(levelGroup, B(W, 0.1, L), toon('#8a6a4a', 'wood'), X, 0.05, Z); part(levelGroup, B(W, 0.1, L), toon('#e8e4dc'), X, 2.8, Z);
  for (const s of [-1, 1]) { part(levelGroup, B(0.2, 2.8, L), wall, X + s * (W / 2 + 0.1), 1.4, Z); box(X + s * (W / 2 + 0.3), Z, 0.3, L / 2); part(levelGroup, B(W, 2.8, 0.2), wall, X, 1.4, Z + s * (L / 2 + 0.1)); box(X, Z + s * (L / 2 + 0.3), W / 2, 0.3); }
  // the porthole, with fish going past
  const ph = new THREE.Group(); part(ph, new THREE.TorusGeometry(0.55, 0.09, 8, 20), toon('#c9a43a'), 0, 0, 0); const gl = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), new THREE.MeshBasicMaterial({ color: '#1f6a8a' })); gl.position.z = -0.02; ph.add(gl);
  const fsh = new THREE.Mesh(B(0.25, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: '#ffb347' })); fsh.position.z = -0.01; ph.add(fsh); levelAnims.push(t => { const k = (t * 0.25) % 1; fsh.position.x = -0.5 + k; fsh.position.y = Math.sin(t) * 0.15; fsh.visible = k > 0.05 && k < 0.95; });
  ph.position.set(X - W / 2 + 0.01, 1.6, Z); ph.rotation.y = Math.PI / 2; levelGroup.add(ph);
  // the bed along the back wall, the TV on the opposite wall, a tiny kitchen corner
  const bed = new THREE.Group(); part(bed, B(1.4, 0.4, 2.2), toon('#6a4f34', 'wood'), 0, 0.2, 0); part(bed, B(1.3, 0.2, 2.1), toon('#e8e4dc'), 0, 0.5, 0); part(bed, B(1.3, 0.12, 1.3), toon('#4a6a9a'), 0, 0.62, 0.35); part(bed, B(0.9, 0.15, 0.4), toon('#ffffff'), 0, 0.66, -0.8);
  bed.position.set(X + 1.3, 0, Z - 1.2); levelGroup.add(bed); box(X + 1.3, Z - 1.2, 0.7, 1.1);
  const tv = bubTV(1.2, 0.7); tv.position.set(X + 1.3, 1.4, Z + L / 2 - 0.06); tv.rotation.y = Math.PI; levelGroup.add(tv); part(levelGroup, B(1.35, 0.85, 0.06), toon('#1e1a18'), X + 1.3, 1.4, Z + L / 2 - 0.0);
  part(levelGroup, B(1.0, 0.9, 0.6), toon('#d8d0c0'), X - 1.5, 0.45, Z - L / 2 + 0.3); part(levelGroup, B(0.4, 0.5, 0.4), toon('#5d636c'), X - 1.5, 1.15, Z - L / 2 + 0.3);
  const pl = new THREE.PointLight(0xffe0b0, 0.8, 8); pl.position.set(X, 2.4, Z); levelGroup.add(pl);
  bubSign('HOME SWEET 6B', '#1a1426', '#ffd0a0', 1.4, 0.3, X - W / 2 + 0.02, 2.3, Z + 1.4, Math.PI / 2);
  INTERACTS.push({ x: X + 1.3, z: Z - 0.3, r: 1.6, get label() { return BUB.lie ? 'Get up' : '🛏 Lie down and watch TV'; }, fn: () => { BUB.lie = !BUB.lie; if (BUB.lie) { player.yaw = Math.PI; player.pitch = 0.05; toast('6B', 'Press E to get up. Hold still to sleep it off.', 2); BUB.lieT = performance.now(); } } });
  INTERACTS.push({ x: X, z: Z + 1.6, r: 1.4, label: 'Leave to the hallway', fn: () => { BUB.lie = false; BUB.floor = 6; bubFade('Floor 6', () => { player.pos.set(BAX - BAW / 2 + 1, 0, BAZ + 4); player.yaw = -Math.PI / 2; BUB.lbl && BUB.lbl(); }); } });
}
// lying in bed: pin the player to the mattress and put the eye at pillow height, looking at the TV
{ const _r = renderer.render.bind(renderer); renderer.render = function (s, c) {
  if (BUB.lie && c === camera && c.layers.mask === 2) return; // no gun in bed
  if (BUB.lie && c === camera && LEVEL && LEVEL.id === 'bubblecity') { player.pos.set(BFLAT.x + 1.3, 0, BFLAT.z - 0.3); if (player.vel) player.vel.set(0, 0, 0); c.position.set(BFLAT.x + 1.3, 0.95, BFLAT.z - 1.7); } return _r(s, c); }; }
{ const _l = loadLevel; loadLevel = function () { BUB.lie = false; BUB.ham = null; return _l.apply(this, arguments); }; }
// sleeping in your own bed works like the ship bunk after a while of lying still
setInterval(() => { try { if (BUB.lie && BUB.lieT && performance.now() - BUB.lieT > 20000) { BUB.lieT = 0; sleepInBunk(); } } catch (_) {} }, 1000);
// the dome has no sun; "night" dims the dome's own lights and turns the street lamps up
function bubNight(on) { BUB.night = on; BUB.base = BUB.base || new Map(); levelGroup.traverse(o => { if (!o.isLight) return; if (!BUB.base.has(o)) BUB.base.set(o, o.intensity); o.intensity = BUB.base.get(o) * (on ? 0.3 : 1); }); }
{ const _l2 = loadLevel; loadLevel = function () { BUB.night = false; BUB.base = null; return _l2.apply(this, arguments); }; }

// ---------------- extra dressing ----------------
function bubDetails() {
  const R = i => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5; return x - Math.floor(x); };
  // benches and bins round the plaza ring, a bus stop, hydrants in the Burbs
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, x = Math.cos(a) * 12.5, z = Math.sin(a) * 12.5, g = new THREE.Group();
    part(g, B(1.8, 0.08, 0.5), toon('#8a6a44', 'wood'), 0, 0.5, 0); part(g, B(1.8, 0.5, 0.08), toon('#8a6a44', 'wood'), 0, 0.8, -0.25); for (const s of [-1, 1]) part(g, B(0.08, 0.5, 0.5), toon('#2b2a2c'), s * 0.8, 0.25, 0);
    g.position.set(x, 0, z); g.rotation.y = -a - Math.PI / 2; levelGroup.add(g); box(x, z, 0.6, 0.6);
    if (i % 2) { const b = new THREE.Group(); part(b, Cy(0.28, 0.24, 0.8, 8), toon('#3f7a3a'), 0, 0.4, 0); part(b, Cy(0.3, 0.3, 0.06, 8), toon('#2b2a2c'), 0, 0.82, 0); b.position.set(Math.cos(a + 0.25) * 12.5, 0, Math.sin(a + 0.25) * 12.5); levelGroup.add(b); } }
  for (const [x, z] of [[29, -22], [29, 14], [33, 4], [29, -6]]) { const h = new THREE.Group(); part(h, Cy(0.14, 0.17, 0.6, 8), toon('#c8402f'), 0, 0.3, 0); part(h, new THREE.SphereGeometry(0.15, 8, 6), toon('#c8402f'), 0, 0.62, 0); part(h, Cy(0.05, 0.05, 0.4, 5), toon('#c8402f'), 0, 0.4, 0, 0, 0, Math.PI / 2); h.position.set(x, 0, z); levelGroup.add(h); }
  // the Low Tide: graffiti, puddles, a flickering streetlight, litter, a shopping cart
  for (const [t, c, x, z] of [['GILL COLLINS RULEZ', '#ff3bd2', -38.4, -2], ['NO NARCS', '#7fff6a', -38.4, 12], ['RIZZO OWES ME', '#ffd36a', -38.4, -24]]) { const m = bubSign(t, '#2a2230', c, 2.6, 0.6, x, 1.6, z, Math.PI / 2); m.material.transparent = true; m.material.opacity = 0.85; }
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.5 + R(i) * 0.8, 12), new THREE.MeshBasicMaterial({ color: '#2a2a44', transparent: true, opacity: 0.55, depthWrite: false })); p.rotation.x = -Math.PI / 2; p.position.set(-30 - R(i + 9) * 8, 0.03, -26 + R(i + 3) * 44); levelGroup.add(p); }
  for (let i = 0; i < 14; i++) part(levelGroup, B(0.18, 0.04, 0.12), toon(['#e8e4dc', '#c8402f', '#ffd36a'][i % 3]), -26 - R(i + 30) * 12, 0.03, -24 + R(i + 40) * 42, 0, R(i) * 3, 0);
  const cart = new THREE.Group(); part(cart, B(0.8, 0.5, 0.5), toon('#9aa1aa'), 0, 0.6, 0); for (const [a, b] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) part(cart, Cy(0.06, 0.06, 0.05, 6), toon('#2b2a2c'), a, 0.08, b, Math.PI / 2, 0, 0); cart.position.set(-34.5, 0, 10); cart.rotation.set(0, 0.7, 0.25); levelGroup.add(cart);
  const sl = new THREE.PointLight(0xff5ad2, 1.2, 10); sl.position.set(-33, 3, 0); levelGroup.add(sl); levelAnims.push(t => { sl.intensity = Math.sin(t * 17) > 0.6 ? 0.2 : 1.2; });
  // kelp swaying outside the dome glass, little skylight bubbles rising up the ribs
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, k = new THREE.Mesh(B(0.4, 6 + R(i) * 6, 0.1), toon(i % 2 ? '#3f7a3a' : '#2f5a2a', 'leaves')); k.position.set(Math.cos(a) * 57, 3, Math.sin(a) * 57); levelGroup.add(k); levelAnims.push(t => { k.rotation.z = Math.sin(t * 0.7 + i) * 0.15; }); }
}
function bubFlatDetails() { const X = BFLAT.x, Z = BFLAT.z;
  // rug, a beanbag, a lamp, posters, snack pile, a fish bowl, a clothes pile
  const rug = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), toon('#c86a3a')); rug.rotation.x = -Math.PI / 2; rug.position.set(X - 0.4, 0.105, Z + 0.6); levelGroup.add(rug);
  part(levelGroup, new THREE.SphereGeometry(0.45, 10, 8), toon('#6a3a8a'), X - 1.2, 0.3, Z + 1.3); part(levelGroup, Cy(0.03, 0.03, 1.4, 5), toon('#2b2a2c'), X + 0.35, 0.7, Z - 2.1); part(levelGroup, Cy(0.2, 0.12, 0.25, 8), glow('#ffd36a'), X + 0.35, 1.45, Z - 2.1);
  for (const [t, c, x] of [['FISH COPS S2', '#c8402f', -0.6], ['GILL COLLINS', '#3a5266', 0.6]]) bubSign(t, c, '#ffffff', 0.7, 0.9, X + x, 1.7, Z - 2.48, 0);
  for (let i = 0; i < 5; i++) part(levelGroup, B(0.18, 0.06, 0.12), toon(['#ffd36a', '#ff6aa8', '#7fe8ff'][i % 3]), X + 0.4 + i * 0.08, 0.13 + (i % 2) * 0.04, Z + 1.9, 0, i, 0);
  part(levelGroup, new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshLambertMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.5 }), X - 1.5, 1.08, Z - 2.2); part(levelGroup, B(0.06, 0.04, 0.02), toon('#ffb347'), X - 1.5, 1.08, Z - 2.2);
  part(levelGroup, new THREE.SphereGeometry(0.35, 8, 6), toon('#4a6a9a'), X + 1.7, 0.15, Z + 1.8); }
function bubHallDetails() { const X = BAX, Z = BAZ;
  for (let i = 0; i < 4; i++) bubSign(['NO BALL GAMES', 'QUIET HOURS 10-6', 'RECYCLE YOUR SHELLS', 'WHOSE FISH IS THIS'][i], '#f4f0e8', '#3a2a20', 0.9, 0.5, X + (i % 2 ? 1 : -1) * (BAW / 2 - 0.03), 1.7, Z - 9 + i * 5, i % 2 ? -Math.PI / 2 : Math.PI / 2);
  for (const z of [-5, 4]) for (const s of [-1, 1]) { const m = new THREE.Mesh(B(0.7, 0.03, 0.5), toon('#8a6a44')); m.position.set(X + s * (BAW / 2 - 0.45), 0.12, Z + z); levelGroup.add(m); }
  for (const z of [-11, 0, 10]) { part(levelGroup, B(0.6, 0.25, 0.04), toon('#2b2a2c'), X - BAW / 2 + 0.06, 2.5, Z + z, 0, Math.PI / 2, 0); part(levelGroup, B(0.03, 0.18, 0.03), glow('#ff3b2a'), X - BAW / 2 + 0.1, 2.5, Z + z - 0.2); } }
{ const _b = LEVELS.bubblecity.build; LEVELS.bubblecity.build = function () { _b.apply(this, arguments); try { bubDetails(); bubFlatDetails(); bubHallDetails(); } catch (e) { console.warn('dome2 details', e); } }; }
