// =================== VIXEN GLIPPO (2.22.28): the Undercroft's new singer, and the fight for her ===================
// Vixen replaces Velma on the round stage. Her ex, Krenn Vosh, lives in apartment 9C off the Undercroft and won't leave her alone.
// Take the job and go in with your fists only (no guns, no blades, safe-zone rules off for the fight), knock him out,
// and he stays on his floor for good. After that Vixen can be romanced like the lounge regulars (she stays in the Undercroft).
// Save field: S.vixen { st: 0 none, 1 job taken, 2 done }.
function makeVixen() {
  const g = makeCivilian('#ff3b8a', '#2a0e2a', '#5ad8b8', '#c86aff', '#ffd36a'), skin = toon('#5ad8b8'), hair = toon('#c86aff', 'cloth');
  for (const s of [-1, 1]) { part(g, B(0.11, 0.09, 0.03), toon('#0c0a14'), s * 0.085, 1.72, 0.2); part(g, B(0.03, 0.03, 0.01), glow('#ffffff'), s * 0.085 + 0.025, 1.745, 0.217); part(g, B(0.12, 0.02, 0.02), toon('#14081a'), s * 0.085, 1.785, 0.205, 0, 0, -s * 0.2);
    part(g, Cy(0.012, 0.016, 0.34, 5), skin, s * 0.11, 2.08, -0.02, 0, 0, -s * 0.35); part(g, new THREE.SphereGeometry(0.045, 8, 6), glow('#ff6ad8'), s * 0.17, 2.24, -0.02); }
  part(g, B(0.08, 0.025, 0.02), glow('#ff3b8a'), 0, 1.6, 0.21);
  part(g, B(0.46, 0.5, 0.18), hair, 0, 1.62, -0.2); for (let i = 0; i < 5; i++) part(g, Cy(0.05, 0.02, 0.5, 5), hair, -0.16 + i * 0.08, 1.3, -0.22, 0.15);
  part(g, B(0.42, 0.08, 0.46), hair, 0, 1.95, -0.02);
  part(g, B(0.44, 0.04, 0.3), glow('#ffd36a'), 0, 1.05, 0); return g;
}
const vixS = () => { S.vixen = S.vixen || { st: 0 }; return S.vixen; };
ROMANCE.vixen = { name: 'Vixen Glippo', role: 'Undercroft singer', away: 1, make: makeVixen, x: 0, z: 0, face: 0,
  likes: ['starcrystal', 'crystal', 'glimmer'], loves: 'starcrystal', perk: { txt: '+10% melee damage', k: 'melee' },
  lines: { 0: ["Thanks for what you did. Krenn won't come near me again.", "I write songs about this place. You're in one now."], 1: ["Back again? I'll save you a spot by the stage.", "The horn guys say you've got a good face for jazz."],
    2: ["Stay for the set. I sing better when I know someone's listening.", "You hit like a freighter. I mean that kindly."], 3: ["Every song tonight is about you. Don't tell the band.", "Come closer. The smoke's thinner up here."],
    4: ["Let's skip the second set and go somewhere quiet.", "I hum your name between verses now. It fits the melody."], 5: ["My favourite person in the whole rotten Undercroft.", "When the lights come up, I look for you first."] },
  flirtOk: ["Mm. Say that again, slower.", "Careful. Singers fall for anyone who listens."], flirtNo: ["Cute. Try it after the encore.", "I've heard better lines from the trumpet player."],
  dates: ["She takes you to the roof vents to watch the ship's engines glow. She sings the whole time, just for you.", "A late set at a dive two decks up. She drags you onstage for a duet. You're terrible. She loves it."] };
{ const _bn = barNpcs; barNpcs = function () { return _bn().filter(n => !(n.romId && ROMANCE[n.romId] && ROMANCE[n.romId].away)); }; }
// the stage singer
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th !== 'under') return L;
  const v = L.find(d => d.id === 'velma'); if (!v) return L; const a = Math.PI / 4;
  Object.assign(v, { name: 'Vixen Glippo', role: 'Singer · the Undercroft band', rig: 'civ', make: makeVixen, x: -21 + 6.1 * Math.sin(a), z: -19.6 + 6.1 * Math.cos(a), face: a,
    idle: ["This one's called 'Awzil Nap'. It's about sleeping through an apocalypse. Twice.", "Tips go in the jar. Hecklers go to Knuckles.", "The sax player owes me money. Don't tell him I told you."],
    custom: [['Talk', () => vixTalk()]] });
  return L; }; }
function vixTalk() {
  const V = vixS(); openDlg('Singer · the Undercroft band', 'Vixen Glippo');
  if (V.st === 2) { closeDlg(); openRomance('vixen'); return; }
  if (V.st === 1) { $('dlgLine').textContent = '"Krenn\'s in 9C, the door on the left wall. He won\'t fight fair if you walk in armed, so the house rule is fists. Please be careful."'; acts([['Okay', closeDlg, true]]); return; }
  $('dlgLine').textContent = '"You noticed the bruise. That\'s Krenn, my ex. He lives in 9C, right off this floor, and he won\'t leave me alone. Nobody here will touch him... unless you would?"';
  acts([['I\'ll handle him', () => { V.st = 1; markDirty(); toast('NEW JOB', 'Knock out Krenn Vosh in apartment 9C. Fists only.', 3.5); log('Vixen Glippo asked you to deal with her ex, Krenn Vosh, in apartment 9C (left wall of the Undercroft). Fists only.', 'loot'); SFX.quest(); closeDlg(); }, true], ['Not my business', closeDlg]]);
}
// apartment 9C: a small flat built off to the side of the Undercroft; the door on the left wall takes you there
const VX = { fight: null, home: [-19.6, -8], flat: [70, 0] };
MELEE.fists = { name: 'Bare Fists', dmg: 30, rate: 0.4, reach: 2.2, req: 9999, price: 0, hide: 1 };
{ const _mm = makeMeleeModel; makeMeleeModel = function (id) { if (id !== 'fists') return _mm(id); const g = new THREE.Group(); part(g, B(0.11, 0.1, 0.12), '#c58a64', 0, 0.05, 0); part(g, B(0.1, 0.03, 0.12), '#a8704e', 0, 0.11, 0.0); return g; }; }
{ const _f = fire; fire = function () { if (VX.fight) { if (Math.random() < 0.05) toast('FISTS ONLY', 'No weapons in this fight. Swing!', 1.2); return; } return _f.apply(this, arguments); }; }
{ const _sw = swapWeapon; swapWeapon = function () { if (VX.fight) return; return _sw.apply(this, arguments); }; }
{ const _sh = swapHand; swapHand = function () { if (VX.fight) { toast('FISTS ONLY', 'Your weapons are at the door.', 1.2); return; } return _sh.apply(this, arguments); }; }
function vixEndFight(won) {
  const F = VX.fight; if (!F) return; VX.fight = null; S.melee = F.melee; S.hand = F.hand; SAFES.push(...F.safes); meleeShown = null; try { refreshMeleeModel(); } catch (_) {}
  if (won) { const V = vixS(); V.st = 2; const M = romOf('vixen'); M.aff = Math.max(M.aff, 40); markDirty(); SFX.level(); toast('KNOCKED OUT', 'Krenn is out cold. Go tell Vixen.', 4); log('You knocked out Krenn Vosh. Vixen Glippo is grateful, and you can get to know her now.', 'loot'); }
}
function vixKO(x, z) { const o = buildChar(() => makeCivilian('#5a3a1e', '#1e1c22', '#7a8a5a', '#1e1a18', '#c8402f'), 'civ'); o.rotation.set(-Math.PI / 2, 0, 0.3); o.position.set(x, 0.18, z); levelGroup.add(o);
  levelAnims.push(t => { if (o.parent && Math.random() < 0.012) burst(V(x, 0.7, z + 0.6), '#cfe8ff', 1, 0.15); }); }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.apply(this, arguments); if (zTheme(ZF.floor) !== 'under') return; try { vixBuild(); } catch (e) { console.warn('vixen', e); } }; }
function vixBuild() {
  VX.fight = null; const [hx, hz] = VX.home, [fx, fz] = VX.flat;
  // the door on the Undercroft's left wall
  part(props, B(0.2, 2.6, 1.4), toon('#3a2a1e', 'wood'), hx - 1.3, 1.3, hz); part(props, B(0.22, 0.12, 0.12), toon('#c9a43a'), hx - 1.2, 1.25, hz + 0.45);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.36), new THREE.MeshBasicMaterial({ map: signTex('9C', '#140806', '#ffd36a') })); sg.position.set(hx - 1.18, 2.85, hz); sg.rotation.y = Math.PI / 2; levelGroup.add(sg);
  INTERACTS.push({ x: hx, z: hz, r: 1.8, label: 'Apartment 9C', fn: () => vixDoor() });
  // the flat itself
  const W = 5, D = 4, wall = toon('#4a3a30', 'panel'), floor = toon('#2a201a', 'wood');
  part(props, B(W * 2, 0.1, D * 2), floor, fx, -0.04, fz); part(props, B(W * 2, 0.2, D * 2), toon('#2a2622', 'panel'), fx, 3.2, fz);
  part(props, B(W * 2, 3.2, 0.2), wall, fx, 1.6, fz - D); part(props, B(W * 2, 3.2, 0.2), wall, fx, 1.6, fz + D); part(props, B(0.2, 3.2, D * 2), wall, fx - W, 1.6, fz); part(props, B(0.2, 3.2, D * 2), wall, fx + W, 1.6, fz);
  box(fx, fz - D, W, 0.2); box(fx, fz + D, W, 0.2); box(fx - W, fz, 0.2, D); box(fx + W, fz, 0.2, D);
  part(props, B(1.8, 0.5, 2.4), toon('#3a2a3a', 'cloth'), fx + 3.6, 0.25, fz - 2.4); part(props, B(1.8, 0.2, 0.6), toon('#d8d0c0', 'cloth'), fx + 3.6, 0.58, fz - 3.2); box(fx + 3.6, fz - 2.4, 0.9, 1.2);
  part(props, B(2.2, 0.45, 0.8), toon('#5a2a1e', 'cloth'), fx - 2.8, 0.25, fz + 3.3); part(props, B(2.2, 0.7, 0.2), toon('#5a2a1e', 'cloth'), fx - 2.8, 0.6, fz + 3.7); box(fx - 2.8, fz + 3.4, 1.1, 0.5);
  part(props, B(1.2, 0.7, 0.1), toon('#14120f'), fx - 2.8, 1.7, fz - 3.85); part(props, B(1.1, 0.6, 0.02), glow('#4a6a8a'), fx - 2.8, 1.7, fz - 3.79);
  for (let i = 0; i < 9; i++) part(props, Cy(0.05, 0.05, 0.22, 6), toon(['#3a6a3a', '#6a3a1e', '#2a4a6a'][i % 3]), fx - 3 + i * 0.7, 0.11, fz + 1 - (i % 3) * 0.9, Math.PI / 2, i);
  const lamp = new THREE.PointLight(0xffb070, 1.4, 12, 1.6); lamp.position.set(fx, 2.8, fz); levelGroup.add(lamp);
  part(props, B(0.2, 2.6, 1.4), toon('#3a2a1e', 'wood'), fx - W + 0.12, 1.3, fz); INTERACTS.push({ x: fx - W + 0.9, z: fz, r: 1.6, label: 'Leave 9C', fn: () => { if (VX.fight) { toast('NO ESCAPE', 'Krenn blocks the door. Finish this.', 1.6); return; } player.pos.set(hx + 0.6, 0, hz); player.yaw = -Math.PI / 2; SFX.door(); } });
  if (vixS().st === 2) vixKO(fx + 1.5, fz + 0.5);
  levelAnims.push(() => { const F = VX.fight; if (!F) return;
    if (!player.alive) { vixEndFight(false); toast('KNOCKED DOWN', 'Krenn got the better of you. Try again.', 3); return; }
    if (F.e.dead) { const p = F.e.obj.position; scene.remove(F.e.obj); const i = enemies.indexOf(F.e); if (i >= 0) enemies.splice(i, 1); vixKO(p.x, p.z); vixEndFight(true); } });
}
function vixDoor() {
  const V = vixS(), [fx, fz] = VX.flat;
  if (V.st === 0) { toast('9C', 'Locked. Someone inside is yelling at a TV.', 2); return; }
  SFX.door(); player.pos.set(fx - 3.8, 0, fz); player.yaw = -Math.PI / 2;
  if (V.st === 2) return;
  const safes = SAFES.splice(0), e = makeEnemy({ zone: 'deck', type: 'scavenger', n: 1, lv: [S.lvl, S.lvl], at: [fx + 2.5, fz] });
  const fistHit = MELEE.fists.dmg * (1 + (S.lvl - 1) * 0.045);
  e.def = Object.assign({}, e.def, { name: 'Krenn Vosh', boss: true, wanderer: null }); e.plateHp = -1; e.zone = { x: fx, z: fz, r: 5 }; e.hp = e.max = Math.round(fistHit * 9); e.aggro = true; try { updatePlate(e); } catch (_) {}
  VX.fight = { e, safes, melee: S.melee, hand: S.hand }; S.melee = 'fists'; S.hand = 'melee'; meleeShown = null; try { refreshMeleeModel(); } catch (_) {}
  toast('FISTS ONLY', '"You\'re Vixen\'s new friend?" Krenn cracks his knuckles. Your weapons are stashed at the door.', 3.5); SFX.hit();
}
