// Stardust Books sells Aranus Man comics. Don Klunkleone holds court in the McKlunkies booths in the mall: nobody fences contraband
// (drugs aside) on any world until you do his "little favour": a hit on Glorbo Fishwhistle, the gentle alien who keeps the hydroponics
// fish tank. The Don's secret sauce, poured on a drug you made, makes a dose Glorbo won't walk away from. After that the tank is yours.
ITEMS.mob_sauce = { name: "The Don's Secret Sauce", v: 0, col: '#c8402f', quest: true, use: true, note: 'Use it on a drug you made. "Trust me. It\'s the sauce."' };
ITEMS.mob_tainted = { name: 'Extra Saucy Special', v: 0, col: '#7fff6a', quest: true, note: 'A drug with the Don\'s sauce on it. Glowing slightly. Humming slightly. For Glorbo only.' };
function mobS() { S.mob = S.mob || { st: 0 }; S.tank2 = S.tank2 || []; return S.mob; }
const mobIn = () => mobS().st >= 4;
const MOB = { glorbo: null };
function mobSay(lines, done, i) { i = i || 0; if (i >= lines.length) { closeDlg(); if (done) done(); return; } const [who, t] = lines[i];
  openDlg(who === 'You' ? 'You' : who === 'Glorbo' ? 'Fish tank keeper · Hydroponics' : 'McKlunkies · booth 4', who === 'Don' ? 'Don Klunkleone' : who === 'Glorbo' ? 'Glorbo Fishwhistle' : who); $('dlgLine').textContent = t;
  try { SFX.babble && SFX.babble(voicePitch(who), Math.min(14, 4 + (t.length >> 4))); } catch (_) {}
  acts([[i === lines.length - 1 ? 'Okay' : 'Next ▸', () => mobSay(lines, done, i + 1), true]]); }

// ---- Stardust Books ----
const STARDUST = [['aranus_comic', 120], ['aranus_gold', 600]];
function openStardust() {
  openDlg('Stardust Books', 'Clerk Pemberly'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `"Imported from Earth! The Astonishing Aranus Man. The tentacles are hand-inked." You have ${S.cr.toLocaleString()} cr.`;
    itemRows(rows, STARDUST.map(([k, p]) => [k, S.inv[k] || null, `${p} cr`, [['Buy', () => buy(k, p)]]])); };
  const buy = (k, p) => { if (S.cr < p) { SFX.hit(); log('Not enough credits.'); return; } if (invRoomFor(k) < 1) { invFullNote(k); return; } S.cr -= p; S.inv[k] = (S.inv[k] || 0) + 1; SFX.coin(); log(`+1 ${ITEMS[k].name}`, 'loot'); markDirty(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}

// ---- the Don's booths, east side of the mall ----
const MOB_AT = { x: 25.5, z: 3 };
function mobBooths() {
  const g = new THREE.Group(), red = toon('#c8402f'), yel = toon('#ffd36a'), X = MOB_AT.x, Z = MOB_AT.z;
  part(g, B(6.5, 0.06, 10), toon('#e8e4dc', 'panel'), X, 0.03, Z); // checker floor
  for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) if ((i + j) % 2) part(g, B(1.08, 0.065, 1.1), toon('#c8402f'), X - 2.7 + i * 1.08, 0.035, Z - 4.4 + j * 1.1);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(5, 1), new THREE.MeshBasicMaterial({ map: signTex('McKLUNKIES', MCK.col, MCK.yel) })); sg.position.set(29.6, 4.2, Z); sg.rotation.y = -Math.PI / 2; g.add(sg);
  part(g, B(0.1, 0.1, 5.2), glow('#ffd36a'), 29.6, 3.6, Z);
  for (const dz of [-3, 0.4, 3.8]) { // booth: two benches and a table, backs to the wall side
    part(g, B(1.5, 0.75, 0.9), toon('#3a3d44'), X + 1.2, 0.36, Z + dz); // table base
    part(g, B(1.8, 0.08, 1.3), yel, X + 1.2, 0.76, Z + dz);
    for (const s of [-1, 1]) { part(g, B(1.8, 0.45, 0.6), red, X + 1.2, 0.22, Z + dz + s * 1.05); part(g, B(1.8, 0.9, 0.2), red, X + 1.2, 0.85, Z + dz + s * 1.35); }
    box(X + 1.2, Z + dz, 0.95, 1.45); }
  // the Don's table: a Mega Klunk, fries and a little flag
  part(g, Cy(0.28, 0.28, 0.22, 10), toon('#c8892a'), X + 1.0, 0.92, Z - 3 + 0.3); part(g, Cy(0.3, 0.3, 0.06, 10), toon('#5a2a1a'), X + 1.0, 0.9, Z - 3 + 0.3);
  part(g, B(0.25, 0.3, 0.18), red, X + 1.6, 0.95, Z - 3 + 0.3);
  levelGroup.add(g);
  const sit = (make, x, z, ry) => { const o = buildChar(make, 'civ'), R = o.userData.rig; o.position.set(x, 0.45 - (R ? R.spec.hip : 0.95) + 0.07, z); sitChar(o, 0.45); o.rotation.y = ry; levelGroup.add(o); return o; };
  const don = sit(() => makeCivilian('#f4f0e8', '#2a2a30', '#d8a07a', '#1e1c22', '#c8402f'), X + 1.2, Z - 3 - 1.0, 0);
  for (const [x, z, ry] of [[X - 0.9, Z - 4.6, 0.6], [X - 1.0, Z - 1.6, 2.2]]) { const o = buildChar(() => makeCivilian('#1e1c22', '#1e1c22', '#c58a64', '#1e1c22', '#3a3d44'), 'civ'); o.position.set(x, 0, z); o.rotation.y = ry; levelGroup.add(o); solid(x, z, 0.4); }
  INTERACTS.push({ x: X + 1.2, z: Z - 3 - 1.8, r: 2.4, label: '🍔 Talk to Don Klunkleone', fn: mobDon });
  INTERACTS.push({ x: -25.3, z: -4, r: 2.6, label: '📚 Stardust Books', fn: openStardust });
}
{ const _zb = LEVELS.zeltac.build; LEVELS.zeltac.build = function () { _zb.apply(this, arguments); try { mobBooths(); } catch (e) { console.warn('mob', e); } }; }

function mobDon() { const M = mobS();
  if (M.st === 0) return mobSay([
    ['Don', "Siddown. Not there, that's Sal's seat. Sal stands. Sal always stands."],
    ['Don', "You wanna move product. Hot stuff, stuff with serial numbers filed off. I respect that. But on every world, every McKlunkies back counter, every fence? Those are MY people."],
    ['You', "So how do I get in good with you?"],
    ['Don', "A little favour. There's a guy. Glorbo Fishwhistle. Hydroponics deck. Takes care of the fish tank."],
    ['Don', "Three weeks ago I ask him, polite, 'Glorbo, what's the fish's name?' And he says 'They don't have names, they're fish.' In front of my mother."],
    ['You', "That's... it?"],
    ['Don', "He also said the Klunk sauce tastes like a boot. My family's sauce. Four generations of sauce."],
    ['Don', "Here's the thing. Glorbo don't fight. No guns, no nothing. Never touched anything stronger than kelp tea. So you're gonna cook him something special."],
    ['Don', "Take the sauce. Pour it on a batch you made yourself, then let him try it. He takes one hit of that, he's swimming with the fishes. Get it? The fish? 'Cause he likes fish."],
    ['Big Sal', "Heh. Fishes."],
  ], () => { if (M.st >= 1) return; M.st = 1; S.inv.mob_sauce = 1; log("+1 The Don's Secret Sauce", 'loot'); toast('A LITTLE FAVOUR', 'Pour the sauce on a drug, give it to Glorbo in Hydroponics', 3.5); markDirty(); });
  if (M.st < 3) return mobSay([['Don', M.st === 2 ? "You got the special? Good. Hydroponics deck. Take the tube up. Be friendly. He likes people who ask about the fish." : "Sauce goes on the product. Product goes in Glorbo. It ain't complicated. Use the sauce from your bag once you're holding a drug you made."], ['Big Sal', "Heh. Fishes."]]);
  if (M.st === 3) return mobSay([
    ['Don', "I heard. Hydroponics guy says Glorbo did one bump, said 'oh, the fish are SINGING,' and went straight down like a dropped tray."],
    ['Don', "Beautiful. Tasteful. My mother cried. Happy tears, mostly."],
    ['Don', "You're family now. Any fence, any back counter, any world: tell 'em the Don sent you. And keep the tank. Somebody's gotta feed those things."],
    ['Big Sal', "Welcome to the family. We got jackets. We don't got jackets, I'm lying, but welcome."],
  ], () => { if (M.st >= 4) return; M.st = 4; toast('YOU\'RE IN', 'Contraband can be sold to fences and McKlunkies on every world', 4); SFX.levelup && SFX.levelup(); crime(10, 'Did a favour for the Don'); markDirty(); });
  mobSay([['Don', ["Siddown, eat something. You look thin.", "Glorbo's tank looks better than ever. You got an eye.", "If anybody gives you trouble at a back counter, you tell me. I'll have Sal stand near them."][Math.floor(Math.random() * 3)]]]);
}

// the sauce: used from the bag, it turns one drug into the special
{ const _iu = invUse; invUse = function (key) { const [t, id] = String(key).split(':');
  if (t === 'i' && id === 'mob_sauce') { const k = Object.keys(S.inv).find(x => ITEMS[x] && ITEMS[x].drug && S.inv[x] > 0);
    if (!k) { log("You need a drug to pour it on. Brew a batch at your lab first.", 'warn'); SFX.hit(); return; }
    S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; delete S.inv.mob_sauce; S.inv.mob_tainted = 1; mobS().st = 2; SFX.ui(); log(`You drown a dose of ${ITEMS[k].name} in the Don's sauce. It starts humming. +1 Extra Saucy Special`, 'loot'); toast('EXTRA SAUCY', 'Give it to Glorbo in Hydroponics', 3); markDirty(); try { invRender && invRender(); } catch (_) {} return; }
  return _iu.apply(this, arguments); }; }

// ---- Glorbo and the hydroponics tank ----
function mobHydro() { const M = mobS(); MOB.glorbo = null;
  // the old fish: hide them when the tank is yours and stocked
  const mine = M.st >= 3 && S.tank2.length; if (mine) levelGroup.children.forEach(o => { const p = o.geometry && o.geometry.parameters; if (p && p.width === 0.5 && p.height === 0.25 && p.depth === 0.12) o.visible = false; });
  MOB.live = new THREE.Group(); MOB.live.position.set(22, 0, -14); levelGroup.add(MOB.live); mobTankFill();
  if (M.st < 3) { const o = buildChar(() => recolor(makeElismas(), { '#9aa1aa': '#7fdc6a', '#5d636c': '#3a6a8a' }), 'elismas'); o.position.set(18.2, 0, -14); o.rotation.y = -Math.PI / 2; levelGroup.add(o); solid(18.2, -14, 0.45); MOB.glorbo = o;
    const ap = new THREE.Group(); part(ap, B(0.5, 0.06, 0.4), toon('#4fa8ff'), 0, 0, 0); ap.position.set(17.9, 1.05, -14); levelGroup.add(ap); // apron
    INTERACTS.push({ x: 18.2, z: -14, r: 2.4, label: '🐟 Talk to Glorbo', fn: mobGlorbo }); }
  else INTERACTS.push({ x: 19, z: -14, r: 2.6, label: 'Fish tank: put your fish in', fn: openMobTank });
}
{ const _fb = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _fb.apply(this, arguments); try { if (zTheme(ZF.floor) === 'hydro') mobHydro(); } catch (e) { console.warn('mob hydro', e); } }; }

function mobGlorbo() { const M = mobS();
  if (!S.inv.mob_tainted) return mobSay([['Glorbo', ["Oh! Hello! This is Bubbles. And that's Bubbles. And that one's also Bubbles. Easier that way.", "I feed them at nine, noon and whenever they look sad. They look sad a lot. I think it's the lighting.", "Have you tried kelp tea? It's very calming. I had two cups once and saw a colour."][Math.floor(Math.random() * 3)]]]);
  mobSay([
    ['Glorbo', "Oh! A visitor! Are you here about the fish? Nobody's ever here about the fish."],
    ['You', "Sure. Love fish. Hey, I made something. Homemade. Wanna try it?"],
    ['Glorbo', "Ooh, a snack? Is it kelp? It's glowing. Is it supposed to be humming?"],
    ['You', "That's how you know it's fresh."],
    ['Glorbo', "Well, I don't usually... but you came all the way up here about the fish..."],
    ['Glorbo', "*sniff* ...Oh. OH. Oh my. The fish. The fish are SINGING. Bubbles, you never told me you could SING."],
    ['Glorbo', "Tell Bubbles... tell all the Bubbles... feed at nine..."],
  ], mobOD);
}
function mobOD() { const M = mobS(), o = MOB.glorbo; if (M.st >= 3) return; delete S.inv.mob_tainted; M.st = 3; markDirty();
  if (o) { let t0 = performance.now(); const fall = () => { const k = Math.min(1, (performance.now() - t0) / 900); o.rotation.z = k * Math.PI / 2; o.position.y = k * 0.3; if (k < 1) requestAnimationFrame(fall); }; fall(); }
  SFX.hit && SFX.hit(); crime(15, 'Glorbo Fishwhistle'); toast('GLORBO IS SLEEPING WITH THE FISHES', 'Go tell the Don. The tank is yours now', 4);
  for (let i = INTERACTS.length - 1; i >= 0; i--) if (INTERACTS[i].fn === mobGlorbo) INTERACTS.splice(i, 1);
  INTERACTS.push({ x: 19, z: -14, r: 2.6, label: 'Fish tank: put your fish in', fn: openMobTank }); }

function mobTankFill() { const L = MOB.live; if (!L) return; for (const c of [...L.children]) { L.remove(c); disposeTree(c); }
  S.tank2.slice(0, 10).forEach((id, i) => { if (!ITEMS[id]) return; let f; try { f = makeFishModel(id); } catch (_) { return; }
    const b = new THREE.Box3().setFromObject(f), sz = b.getSize(new THREE.Vector3()), k = 0.7 / Math.max(sz.x, sz.z, 0.05), c = b.getCenter(new THREE.Vector3()).multiplyScalar(k);
    f.scale.setScalar(k); f.position.sub(c); const w = new THREE.Group(), turn = new THREE.Group(); turn.add(f); w.add(turn); L.add(w); w.userData = { sp: 0.25 + (i % 4) * 0.06, ph: i * 2.1, y0: 1.0 + (i % 5) * 0.7, r: 1.2 + (i % 3) * 0.5, sx: sz.x >= sz.z, turn }; });
}
setInterval(() => { try { const L = MOB.live; if (!L || !L.parent || !L.parent.parent) return; const t = performance.now() / 1000;
  for (const w of L.children) { const { sp, ph, y0, r, sx, turn } = w.userData, a = t * sp + ph; w.position.set(Math.cos(a) * r, y0 + Math.sin(t * 0.7 + ph) * 0.15, Math.sin(a) * r); turn.rotation.y = -a + (sx ? Math.PI : -Math.PI / 2); } } catch (_) {} }, 33);
function openMobTank() { mobS();
  openDlg('Hydroponics', 'The big fish tank'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => { $('dlgLine').textContent = `Glorbo's old tank. Your fish replace the house fish. ${S.tank2.length}/10 in the tank.`;
    const have = [...angFish()].filter(k => S.inv[k] > 0);
    itemRows(rows, [...have.map(k => [k, S.inv[k], 'in your bag', [['Drop in', () => { if (S.tank2.length >= 10) { log('The tank is full.'); return; } S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; S.tank2.push(k); done(); }]]]),
      ...S.tank2.map((k, i) => [k, null, 'swimming', [['Take out', () => { if (invRoomFor(k) < 1) { invFullNote(k); return; } S.tank2.splice(i, 1); S.inv[k] = (S.inv[k] || 0) + 1; done(); }]]])]); };
  const done = () => { SFX.ui(); markDirty(); mobTankFill(); levelGroup.children.forEach(o => { const p = o.geometry && o.geometry.parameters; if (p && p.width === 0.5 && p.height === 0.25 && p.depth === 0.12) o.visible = !S.tank2.length; }); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
