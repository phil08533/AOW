// =================== VIXEN GLIPPO (2.22.28): the Undercroft's new singer, and the fight for her ===================
// Vixen replaces Velma on the round stage. Her ex, Krenn Vosh, lives in apartment 9C off the Undercroft and won't leave her alone.
// Take the job and go in with your fists only (no guns, no blades, safe-zone rules off for the fight), knock him out,
// and he stays on his floor for good. After that Vixen can be romanced like the lounge regulars (she stays in the Undercroft).
// Save field: S.vixen { st: 0 none, 1 job taken, 2 done }.
function makeVixen(outfit) {
  const pink = '#f29ac0', red = '#c8102e', g = makeCivilian(pink, pink, pink, '#9a4ae0', null), dress = toon(red, 'cloth'), skin = new THREE.MeshLambertMaterial({ color: pink });
  // smooth skin: the base body's pink parts get a plain soft material instead of the textured one
  g.children.forEach(o => { const c = o.isMesh && o.material && o.material.color; if (c && c.r > c.g && c.r > c.b && c.b > c.g) o.material = skin; });
  // the red dress: a fitted bodice with a sweetheart line, thin straps, a flared skirt with a slit, a sparkle belt
  part(g, B(0.5, 0.42, 0.28), dress, 0, 1.15, 0); for (const s of [-1, 1]) { part(g, new THREE.SphereGeometry(0.1, 10, 8), dress, s * 0.09, 1.36, 0.08); part(g, B(0.025, 0.2, 0.02), dress, s * 0.15, 1.46, 0.1); }
  if (outfit === 'shorts') { for (const sx of [-1, 1]) part(g, B(0.2, 0.26, 0.22), dress, sx * 0.11, 0.84, 0); part(g, B(0.44, 0.14, 0.24), dress, 0, 0.93, 0); }
  else { part(g, new THREE.CylinderGeometry(0.25, 0.4, 0.82, 18, 1, true), new THREE.MeshLambertMaterial({ color: red, side: THREE.DoubleSide }), 0, 0.53, 0);
  part(g, B(0.08, 0.5, 0.02), skin, 0.12, 0.42, 0.33, -0.25); }
  part(g, B(0.52, 0.05, 0.3), glow('#ffd6f0'), 0, 0.95, 0);
  for (const s of [-1, 1]) { part(g, B(0.1, 0.12, 0.2), toon(red), s * 0.11, 0.06, 0.05); part(g, B(0.03, 0.12, 0.03), toon(red), s * 0.11, 0.06, -0.07); }
  // a small, pretty face: almond eyes with lashes, a little nose, glossy lips, gold earrings and a pendant
  for (const s of [-1, 1]) { E(g, '#ffffff', s * 0.048, 1.78, 0.118, 0.024, 0.016, 0.008); E(g, '#5a1e8a', s * 0.048, 1.78, 0.125, 0.012, 0.013, 0.005); E(g, '#0c0a14', s * 0.048, 1.78, 0.129, 0.006, 0.007, 0.003);
    part(g, B(0.05, 0.008, 0.01), toon('#1a0a1e'), s * 0.05, 1.795, 0.127, 0, 0, s * 0.18); part(g, B(0.045, 0.008, 0.008), toon('#7a3aa0'), s * 0.048, 1.822, 0.122, 0, 0, -s * 0.15);
    part(g, new THREE.SphereGeometry(0.018, 8, 6), glow('#ffd36a'), s * 0.13, 1.7, 0.0); E(g, '#ff7aa8', s * 0.07, 1.735, 0.108, 0.02, 0.012, 0.006); }
  E(g, '#e88aae', 0, 1.745, 0.13, 0.01, 0.014, 0.008); E(g, '#d4145a', 0, 1.705, 0.122, 0.026, 0.009, 0.008); E(g, '#ff3a7a', 0, 1.697, 0.121, 0.022, 0.007, 0.008);
  part(g, new THREE.TorusGeometry(0.07, 0.006, 4, 16, Math.PI), toon('#c9a43a'), 0, 1.56, 0.06, Math.PI / 2 + 0.3, 0, Math.PI); part(g, new THREE.OctahedronGeometry(0.022, 0), glow('#ff6ad8'), 0, 1.49, 0.13);
  // long wavy purple hair: tube strands swept from the crown down past the shoulders, with sparkles caught in it
  const hm = toon('#9a4ae0', 'cloth'), hm2 = toon('#b46aff', 'cloth'), sparks = [];
  E(g, '#9a4ae0', 0, 1.82, -0.015, 0.145, 0.11, 0.15);
  for (let i = 0; i < 26; i++) { const a = Math.PI * (0.32 + i / 25 * 1.36), r0 = 0.14, len = 0.38 + (i % 3) * 0.08 + Math.abs(Math.cos(a)) * 0.06, ph = i * 1.3, pts = [];
    for (let k = 0; k <= 8; k++) { const f = k / 8, r = r0 + f * 0.05 + Math.sin(f * 7 + ph) * 0.025; pts.push(new THREE.Vector3(Math.sin(a) * r, 1.86 - f * len - f * f * 0.1, Math.cos(a) * r - f * 0.03)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.032 - (i % 2) * 0.006, 5, false), i % 4 ? hm : hm2); g.add(m);
    if (i % 2 === 0) { const sp = part(g, new THREE.OctahedronGeometry(0.012, 0), glow('#ffffff'), pts[4 + (i % 4)].x * 1.15, pts[4 + (i % 4)].y, pts[4 + (i % 4)].z * 1.15); sparks.push(sp); } }
  for (const s of [-1, 1]) { const pts = []; for (let k = 0; k <= 6; k++) { const f = k / 6; pts.push(new THREE.Vector3(s * (0.03 + f * 0.11), 1.9 - f * 0.17, 0.12 - f * 0.02 + Math.sin(f * 5) * 0.01)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.03, 5, false), hm)); }
  // smooth skin: swap the textured pink for a plain soft material
  g.userData.vixSparks = sparks; return g;
}
// sparkles in her hair twinkle
setInterval(() => { try { if (typeof npcObjs === 'undefined' || !npcObjs.velma) return; const o = npcObjs.velma.obj, t = performance.now() / 1000; let k = 0; o.traverse(c => { if (c.isMesh && c.geometry.type === 'OctahedronGeometry' && c.geometry.parameters.radius < 0.015) { const v = 0.4 + Math.max(0, Math.sin(t * 3 + k++ * 1.7)) * 1.2; c.scale.setScalar(v); } }); } catch (_) {} }, 80);
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
  if (V.st === 1) { $('dlgLine').textContent = '"9C, the door on the left wall. I\'ll be there after this set. Don\'t keep a girl waiting."'; acts([['See you there', closeDlg, true]]); return; }
  const have = typeof hbSgrade === 'function' ? hbSgrade() : [];
  if (!have.length) { $('dlgLine').textContent = '"You stayed for the whole set. Cute." She looks you over. "Tell you what. Bring me something S-grade, cooked perfect, and maybe I\'ll invite you up. I don\'t party with amateurs, sugar."'; acts([['I\'ll cook something', closeDlg, true]]); return; }
  $('dlgLine').textContent = `"Is that... S-grade? ${SUBS[have[0]].name}?" Her antennae would perk up if she still had antennae. "Okay. You're interesting. I'm in 9C, just off this floor. Bring that."`;
  acts([[`Give her the ${SUBS[have[0]].name}`, () => { const k = have[0]; S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; V.st = 1; markDirty(); toast('AN INVITATION', 'Vixen asked you over to her place: apartment 9C.', 3.5); log(`You gave Vixen Glippo a ${SUBS[k].name}. She invited you to her apartment, 9C, off the Undercroft.`, 'loot'); SFX.quest(); closeDlg(); }, true], ['Maybe another night', closeDlg]]);
}
// apartment 9C: a small flat built off to the side of the Undercroft; the door on the left wall takes you there
const VX = { scene: 0, krenn: null, fight: null, home: [-19.6, 1.2], flat: [70, 0] };
MELEE.fists = { name: 'Bare Fists', dmg: 30, rate: 0.4, reach: 2.2, req: 9999, price: 0, hide: 1 };
{ const _mm = makeMeleeModel; makeMeleeModel = function (id) { if (id !== 'fists') return _mm(id); const g = new THREE.Group(); part(g, B(0.11, 0.1, 0.12), '#c58a64', 0, 0.05, 0); part(g, B(0.1, 0.03, 0.12), '#a8704e', 0, 0.11, 0.0); return g; }; }
{ const _f = fire; fire = function () { if (VX.fight) { if (Math.random() < 0.05) toast('FISTS ONLY', 'No weapons in this fight. Swing!', 1.2); return; } return _f.apply(this, arguments); }; }
{ const _sw = swapWeapon; swapWeapon = function () { if (VX.fight) return; return _sw.apply(this, arguments); }; }
{ const _sh = swapHand; swapHand = function () { if (VX.fight) { toast('FISTS ONLY', 'Your weapons are at the door.', 1.2); return; } return _sh.apply(this, arguments); }; }
function vixEndFight(won) {
  const F = VX.fight; if (!F) return; VX.fight = null; S.melee = F.melee; S.hand = F.hand; SAFES.push(...F.safes); meleeShown = null; try { refreshMeleeModel(); } catch (_) {}
  vixDrone(true);
  if (won) { const V = vixS(); V.st = 2; const M = romOf('vixen'); M.aff = Math.max(M.aff, 40); markDirty(); SFX.level(); toast('KNOCKED OUT', 'Krenn Vosh is out cold.', 2.5);
    setTimeout(() => vixSeq([
      ['Vixen Glippo', 'Oh. My. Stars. You knocked him out with your HANDS. Nobody does anything with their hands down here except pick pockets.'],
      ['Vixen Glippo', 'Look at him. He\'s drooling on my good rug. That rug was a gift. From him. Okay, he can drool on it.'],
      ['You', 'Is he going to be okay?'],
      ['Vixen Glippo', 'He\'s snoring, so he\'s fine. Krenn snores through everything. Meteor storms. Our anniversary. Both of our anniversaries.'],
      ['Vixen Glippo', 'Thank you. Really. You\'re kind of my hero now. Don\'t let it go to your head. Your head took a few hits.'],
      ['Vixen Glippo', 'Oh no, what time is it? I have to go play my next set! The horn section can\'t be trusted alone. They start doing jazz.'],
      ['Vixen Glippo', 'Come find me by the stage. I\'ll dedicate a song to you. It\'s called "The Hero Who Smelled Like My Couch".']
    ], () => { if (VX.vix && VX.vix.parent) levelGroup.remove(VX.vix); VX.vix = null; toast('VIXEN', 'She blows you a kiss and runs back to the stage.', 3); log('You knocked out Krenn Vosh. Vixen Glippo is grateful, and you can get to know her now. She\'s back on stage.', 'loot'); }), 1800); }
}
// a short scripted conversation in the dialog box, one line at a time
function vixSeq(lines, done, i) { i = i || 0; if (i >= lines.length) { closeDlg(); if (done) done(); return; } const [who, t] = lines[i];
  openDlg(who === 'You' ? 'You' : who === 'Krenn Vosh' ? 'Her ex · very upset' : 'Singer · apartment 9C', who); $('dlgLine').textContent = t; try { SFX.babble && SFX.babble(voicePitch(who), Math.min(14, 4 + (t.length >> 4))); } catch (_) {}
  acts([[i === lines.length - 1 ? 'Okay' : 'Next ▸', () => vixSeq(lines, done, i + 1), true]]); }
// keep your combat drone out of this: it's parked for the scene and the fight
function vixDrone(back) { const D = droneS(); if (!back) { VX.drone = D.on; D.on = false; } else if (VX.drone != null) { D.on = VX.drone; VX.drone = null; } }
function vixBlack(on, txt) { let el = $('vixBlack'); if (!el) { el = document.createElement('div'); el.id = 'vixBlack'; el.style.cssText = 'position:fixed;inset:0;background:#000;z-index:60;pointer-events:none;opacity:0;transition:opacity 1.6s;display:flex;align-items:center;justify-content:center;color:#cfc8d8;font:20px monospace;letter-spacing:2px'; document.body.appendChild(el); }
  el.textContent = txt || ''; el.style.opacity = on ? '1' : '0'; }
function vixKO(x, z) { const o = buildChar(() => makeCivilian('#5a3a1e', '#1e1c22', '#7a8a5a', '#1e1a18', '#c8402f'), 'civ'); o.rotation.set(-Math.PI / 2, 0, 0.3); o.position.set(x, 0.18, z); levelGroup.add(o);
  levelAnims.push(t => { if (o.parent && Math.random() < 0.012) burst(V(x, 0.7, z + 0.6), '#cfe8ff', 1, 0.15); });
  INTERACTS.push({ get x() { return o.parent && !VX.fight && !VX.scene && !VX.piss ? x : 1e9; }, z, r: 1.8, label: '💦 Piss on Krenn', fn: () => vixPiss(x, z) }); }
// the victory lap: stand over him and let it go. A yellow arc, a growing puddle, a hiss, and Krenn mumbling in his sleep
function vixPiss(x, z) { if (VX.piss || PEE.on) return; VX.piss = 1;
  peeOn(x, z, 'Krenn Vosh', ["Ahhh. That's the stuff.", 'Krenn (asleep): "...is it raining, Vixen?"', 'You write your initials. Most of them.'], () => { VX.piss = 0; toast('RELIEVED', 'Krenn will wake up smelling like a decision he made.', 2.6); }); }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.apply(this, arguments); if (zTheme(ZF.floor) !== 'under') return; try { vixBuild(); } catch (e) { console.warn('vixen', e); } }; }
function vixBuild() {
  VX.fight = null; const [hx, hz] = VX.home, [fx, fz] = VX.flat;
  // the door on the Undercroft's left wall
  bcDoor(levelGroup, hx - 0.95, 0, hz, Math.PI / 2, '#5a2a3a', '9C', 1.2, 2.4); { const lamp = part(levelGroup, new THREE.SphereGeometry(0.13, 8, 6), glow('#ff6aa8'), hx - 0.9, 2.75, hz + 0.95); const pl = new THREE.PointLight('#ff6aa8', 1.2, 5); pl.position.set(hx - 0.6, 2.6, hz); levelGroup.add(pl); }
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.36), new THREE.MeshBasicMaterial({ map: signTex('9C', '#140806', '#ffd36a') })); sg.position.set(hx - 0.88, 2.85, hz); sg.visible = false; sg.rotation.y = Math.PI / 2; levelGroup.add(sg);
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
  part(props, B(0.2, 2.6, 1.4), toon('#3a2a1e', 'wood'), fx - W + 0.12, 1.3, fz); INTERACTS.push({ x: fx - W + 0.9, z: fz, r: 1.6, label: 'Leave 9C', fn: () => { if (VX.fight || VX.scene) { toast('NO ESCAPE', 'Krenn blocks the door. Finish this.', 1.6); return; } player.pos.set(hx + 0.6, 0, hz); player.yaw = -Math.PI / 2; SFX.door(); } });
  VX.scene = 0; VX.krenn = null; if (vixS().st === 2) vixKO(fx + 1.5, fz + 0.5);
  VX.vix = null; if (vixS().st === 1) vixHome();
  levelAnims.push(() => { const F = VX.fight; if (!F) return;
    if (!player.alive) { vixEndFight(false); toast('KNOCKED DOWN', 'Krenn got the better of you. Try again.', 3); return; }
    if (F.e.dead) { const p = F.e.obj.position; scene.remove(F.e.obj); const i = enemies.indexOf(F.e); if (i >= 0) enemies.splice(i, 1); vixKO(p.x, p.z); vixEndFight(true); } });
}
function vixHome(outfit) { if (VX.vix && VX.vix.parent) { if (!outfit) return; levelGroup.remove(VX.vix); } const [fx, fz] = VX.flat; { const v = buildChar(() => makeVixen(outfit), 'civ'); VX.vix = v; v.position.set(fx + 3.4, 0, fz + 1.2); v.rotation.y = -Math.PI / 2 - 0.3; levelGroup.add(v); solid(fx + 3.4, fz + 1.2, 0.4); const st = {}; levelAnims.push(t => { if (v.parent) { animRig(v, st, 1 / 60, t); v.rotation.y = -Math.PI / 2 - 0.3 + Math.sin(t * 0.5) * 0.15; } }); } }
function vixDoor() {
  const V = vixS(), [fx, fz] = VX.flat;
  if (V.st === 0) { toast('9C', 'Locked. A nameplate on the door says GLIPPO.', 2); return; }
  SFX.door(); player.pos.set(fx - 3.8, 0, fz); player.yaw = -Math.PI / 2;
  if (V.st === 2 || VX.scene) return;
  vixHome(); vixDrone(false); VX.scene = 1; player.pos.set(fx - 0.5, 0, fz - 0.8); player.yaw = Math.atan2(-3.9, -2.0);
  vixSeq([
    ['Vixen Glippo', 'You came! Sit anywhere. Not there, that\'s the cat. I don\'t have a cat. Don\'t sit there anyway.'],
    ['Vixen Glippo', 'Excuse the mess. I was rehearsing. Rehearsing is mostly lying on the floor and humming at the ceiling.'],
    ['You', 'Nice place. Is that a hole in the wall?'],
    ['Vixen Glippo', 'That\'s a window. Into the next apartment. Say hi to Doug. Doug doesn\'t say hi back. Doug is a plant.'],
    ['Vixen Glippo', 'So... I promised drinks, but I lied. I have something better. Hotbox-grade. Straight from the back room.'],
    ['You', 'Is that legal?'],
    ['Vixen Glippo', 'We live on floor nine of a flying city run by a guy named Brakka. Nothing is legal. Everything is allowed.']
  ], () => vixHigh());
}
function vixHigh() {
  const [fx, fz] = VX.flat; toast('YOU', 'You take a long pull. Then another. Then Vixen says "that one was for me" and you take that too.', 4);
  try { playInhalerAnim && playInhalerAnim('glimmer'); } catch (_) {} try { if (subsOn()) buffs().sub_hotbox = Date.now() + 40000; } catch (_) {}
  for (let i = 0; i < 6; i++) setTimeout(() => { try { burst(player.pos.clone().add(V(Math.random() - 0.5, 1.4, Math.random() - 0.5)), ['#c86aff', '#ff6ad8', '#7fe8ff', '#ffd36a'][i % 4], 10, 1.5); } catch (_) {} }, i * 500);
  setTimeout(() => toast('VIXEN', '"Whoa. Your face is doing a thing. A nice thing. Keep doing it."', 3.2), 2600);
  setTimeout(() => toast('YOU', '"Vixen. Vixen. The ceiling is breathing. Is your ceiling supposed to breathe?"', 3.2), 5800);
  setTimeout(() => { vixBlack(true, ''); }, 8800);
  setTimeout(() => { vixBlack(true, 'Some time later...'); player.pos.set(fx - 0.2, 0, fz - 1.6); player.pitch = 0.6; vixHome('shorts'); }, 11000);
  setTimeout(() => { vixBlack(true, 'BANG. BANG. BANG.'); try { SFX.hit(); } catch (_) {} }, 13600);
  setTimeout(() => { vixBlack(false); try { SFX.hit(); } catch (_) {} }, 15200);
  const knock = ['"VIXEN! I KNOW YOU\'RE IN THERE! I CAN HEAR THE HUMMING!"', '"IS SOMEONE ELSE IN THERE? I SMELL A STRANGER! AND... IS THAT MY GOOD STUFF?!"', '"I\'M COUNTING TO THREE! ONE! TWO! TWO AND A HALF!"'];
  knock.forEach((t, i) => setTimeout(() => { toast('THROUGH THE DOOR', t, 3); try { SFX.hit(); } catch (_) {} }, 16400 + i * 3300));
  setTimeout(() => toast('VIXEN', '"Oh no. That\'s Krenn. Get up. GET UP. Act casual! And stop staring at my shorts, I got warm. Why are you upside down?"', 3.4), 26300);
  setTimeout(() => { if (!VX.scene) return; SFX.door(); player.pitch = 0; const k = buildChar(() => makeCivilian('#5a3a1e', '#1e1c22', '#7a8a5a', '#1e1a18', '#c8402f'), 'civ'); k.position.set(fx - 4.2, 0, fz); k.rotation.y = Math.PI / 2; levelGroup.add(k); VX.krenn = k;
    player.yaw = Math.atan2(3.7, 1.6);
    vixSeq([
      ['Krenn Vosh', 'TWO AND THREE QUARTERS! ...Oh. The door was open. Okay. That\'s on me.'],
      ['Krenn Vosh', 'Who is THIS? Vix, you said you were done singing for strangers! And you\'re both... is the ceiling breathing in here?'],
      ['Vixen Glippo', 'Krenn, you don\'t live here anymore. You moved out. You moved out THREE TIMES.'],
      ['Krenn Vosh', 'I came back for my blender!'],
      ['Vixen Glippo', 'You never owned a blender. You owned a bucket and a dream.'],
      ['You', 'Hey, buddy. Let\'s all just calm down. Maybe sit. Not there, that\'s the cat.'],
      ['Krenn Vosh', 'THERE IS NO CAT! ...Okay. Okay. I guess I\'m just going to have to fight you.'],
      ['Krenn Vosh', 'No guns. No blades. Fists, like our ancestors. Our ancestors were very angry people.']
    ], () => { VX.scene = 0; if (VX.krenn) { levelGroup.remove(VX.krenn); VX.krenn = null; } vixFight(fx - 4.0, fz); }); }, 30000);
}
function vixFight(x, z) {
  const [fx, fz] = VX.flat, safes = SAFES.splice(0), e = makeEnemy({ zone: 'deck', type: 'scavenger', n: 1, lv: [S.lvl, S.lvl], at: [x, z] });
  const fistHit = MELEE.fists.dmg * (1 + (S.lvl - 1) * 0.045);
  e.obj.position.set(x, 0, z); e.def = Object.assign({}, e.def, { name: 'Krenn Vosh', boss: true, wanderer: null }); e.plateHp = -1; e.zone = { x: fx, z: fz, r: 5 }; e.hp = e.max = Math.round(fistHit * 9); e.aggro = true; try { updatePlate(e); } catch (_) {}
  VX.fight = { e, safes, melee: S.melee, hand: S.hand }; S.melee = 'fists'; S.hand = 'melee'; meleeShown = null; try { refreshMeleeModel(); } catch (_) {}
  toast('FISTS ONLY', 'Krenn kicks your weapons under the couch. Put him down!', 3); SFX.hit();
}
