// aptstart.js: a new character wakes up in their flat on Earth (Jamestown Arms, 1st floor, third door on the left, 1C).
// B.U.R.P. is a robot head you built, sitting on your desk. He says good morning; when you step out into the hallway he
// "transplants" into your head. The elevator is broken. The street door at the end of the hall lets you out into Earth town.
// Built like the Coral Heights tower in dome2.js: a hallway and a flat placed apart in one small indoor level.
const AW = { burp: null, said: 0, out: 0 };
const AH = { x: 0, z: 0, L: 26, W: 4 }, AF = { x: 0, z: 40, W: 5, L: 6 };
const AW_DOORS = [['1A', -1, 8, 'Mr. Pruitt', ['Do you know what time it is? It is SEVEN. In the MORNING. *door closes*']], ['1B', -1, 2, 'Vacant', ['A note on the door: "Drome inspectors, please knock twice. Everyone else, once."']],
  ['1C', -1, -4, null, null], ['1D', 1, 8, 'The Okonkwos', ['Kids yelling, a dog barking, a radio playing the news about the Drome. Someone shouts "WE\'RE LATE" at nobody in particular.']],
  ['1E', 1, 2, 'Mrs. Abernathy', ['Oh, it\'s you. Your robot was singing at three in the morning again. It was quite good, actually. Tell it I said so.']], ['1F', 1, -4, 'Laundry', ['Two machines. One says "OUT OF ORDER". The other one says "ALSO OUT OF ORDER".']]];
LEVELS.earthapt = { id: 'earthapt', name: 'Jamestown Arms', tag: 'Your building', lvls: 'Safe', size: 120, center: [0, 20], radius: 200, water: -99, sky: 'space', weather: 'none', indoor: true, terrain: null, palette: { grass: '#3a3d44' },
  zones: [{ id: 'home', name: 'Jamestown Arms', lvl: 'Safe', x: 0, z: 20, r: 40, col: '#3a3d44', safe: true, h: 0 }], paths: [], river: [], pools: [], lava: [], safes: [{ x: 0, z: 20, r: 400 }],
  spawn: { x: AF.x - 0.6, z: AF.z + 0.6, yaw: -0.9 }, pad: { x: 0, z: 10 }, menu: { x: 0, z: 200, r: 1, h: 1 }, npcBase: [0, 0], npcs: [], spawns: [],
  build() { try { awHall(); awFlat(); } catch (e) { console.warn('aptstart', e); } } };
function awFade(txt, mid, after, hold) { if (typeof bubFade === 'function') return bubFade(txt, mid, after, hold); mid && mid(); after && after(); }
function awSign(txt, bg, fg, w, h, x, y, z, ry) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) })); m.position.set(x, y, z); m.rotation.y = ry || 0; levelGroup.add(m); return m; }
function awBurpSays(lines, done, i) { i = i || 0; if (i >= lines.length) { closeDlg(); done && done(); return; }
  openDlg(AW.out ? 'In your head' : 'Your desk', 'B.U.R.P.'); $('dlgLine').textContent = lines[i]; try { burpSay(lines[i]); } catch (_) {}
  acts([[i === lines.length - 1 ? 'Okay' : 'Next ▸', () => awBurpSays(lines, done, i + 1), true]]); }
function awHall() { const X = AH.x, Z = AH.z, L = AH.L, W = AH.W, wall = toonNS('#9a8a74'), trim = toonNS('#5a4a3a');
  part(levelGroup, B(W, 0.1, L), toonNS('#6a3a32'), X, 0.05, Z); part(levelGroup, B(W + 0.4, 0.2, L + 0.4), toonNS('#d8d0c0'), X, 3.3, Z);
  for (const s of [-1, 1]) { part(levelGroup, B(0.2, 3.4, L), wall, X + s * (W / 2 + 0.1), 1.7, Z); part(levelGroup, B(0.06, 0.25, L), trim, X + s * (W / 2 - 0.02), 0.12, Z); box(X + s * (W / 2 + 0.3), Z, 0.3, L / 2);
    part(levelGroup, B(W, 3.4, 0.2), wall, X, 1.7, Z + s * (L / 2 + 0.1)); box(X, Z + s * (L / 2 + 0.3), W / 2, 0.3); }
  const lights = []; for (let i = 0; i < 5; i++) lights.push(part(levelGroup, B(0.6, 0.06, 0.6), glow('#ffe9a0'), X, 3.18, Z - L / 2 + 3 + i * 5));
  levelAnims.push(t => { lights[3].visible = Math.sin(t * 13) + Math.sin(t * 5.3) > -0.6; }); // one tube flickers, as they do
  const hl = new THREE.PointLight(0xffe0b0, 0.7, 30); hl.position.set(X, 2.8, Z); levelGroup.add(hl);
  // the elevator at the far end: broken, taped off
  part(levelGroup, B(2.2, 2.6, 0.12), toonNS('#8a8f96'), X, 1.3, Z - L / 2 + 0.05); part(levelGroup, B(0.04, 2.6, 0.14), toonNS('#4a4f56'), X, 1.3, Z - L / 2 + 0.06);
  for (const r of [0.5, -0.5]) part(levelGroup, B(2.6, 0.14, 0.03), toonNS('#ffd23a'), X, 1.4, Z - L / 2 + 0.14, 0, 0, r);
  awSign('OUT OF ORDER', '#f4f0e8', '#c8402f', 1.2, 0.4, X, 2.1, Z - L / 2 + 0.16, 0);
  INTERACTS.push({ x: X, z: Z - L / 2 + 1.2, r: 2, label: '🛗 Call the elevator', fn: () => { SFX.hit(); bubTalk('Jamestown Arms', 'Elevator', ['You press the button. Nothing. You press it again, harder. Somewhere above, something goes "clunk" and gives up.', 'A note taped to the doors: "BROKEN DOWN. Engineer booked. Do NOT climb the shaft, Kevin."']); } });
  // the street door at the near end
  const sd = new THREE.Group(); part(sd, B(1.6, 2.4, 0.12), toonNS('#3a4a3a'), 0, 1.2, 0); part(sd, B(1.0, 0.6, 0.02), new THREE.MeshBasicMaterial({ color: '#9fb4c8' }), 0, 1.8, -0.07); part(sd, B(0.4, 0.05, 0.08), toonNS('#c9a43a'), 0.5, 1.1, -0.08); sd.position.set(X, 0, Z + L / 2 - 0.05); levelGroup.add(sd);
  awSign('EXIT', '#1a3a1a', '#7fff6a', 0.7, 0.25, X, 2.6, Z + L / 2 - 0.13, Math.PI);
  INTERACTS.push({ x: X, z: Z + L / 2 - 1.1, r: 1.8, label: '🚪 Out to the street', fn: awLeave });
  // doors 1A–1F, three on each wall; yours is the third on the left as you come in
  for (const [n, s, dz, who, lines] of AW_DOORS) { const dx = X + s * (W / 2 - 0.02), mine = n === '1C';
    part(levelGroup, B(0.1, 2.3, 1.2), toonNS(mine ? '#3a5266' : ['#6a3a2a', '#4a5a3a', '#6a5a2a'][(dz + 8) / 6 | 0]), dx, 1.15, Z + dz); part(levelGroup, new THREE.SphereGeometry(0.06, 6, 4), toonNS('#c9a43a'), dx - s * 0.08, 1.1, Z + dz + 0.4);
    awSign(n, '#2b2a2c', '#ffd36a', 0.3, 0.16, dx - s * 0.06, 2.0, Z + dz, -s * Math.PI / 2);
    if (mine) INTERACTS.push({ x: dx - s * 0.9, z: Z + dz, r: 1.6, label: '🚪 1C · Home', fn: () => { SFX.door(); awFade('1C', () => { player.pos.set(AF.x, 0, AF.z + AF.L / 2 - 1); player.yaw = 0; }); } });
    else INTERACTS.push({ x: dx - s * 0.9, z: Z + dz, r: 1.6, label: `🚪 ${n} · ${who}`, fn: () => { SFX.door(); bubTalk(`Jamestown Arms · ${n}`, who, lines); } }); }
  for (let i = 0; i < 3; i++) awSign(['NO BIKES IN THE HALL', 'RENT DUE FRIDAY', 'REPORT DROME ACTIVITY'][i], '#f4f0e8', '#3a2a20', 0.9, 0.5, X + (i % 2 ? 1 : -1) * (W / 2 - 0.03), 1.7, Z - 9 + i * 7, i % 2 ? -Math.PI / 2 : Math.PI / 2);
  const pot = new THREE.Group(); part(pot, Cy(0.3, 0.25, 0.5, 8), toonNS('#c8402f'), 0, 0.25, 0); part(pot, B(0.1, 1.2, 0.1), toonNS('#3f7a3a', 'leaves'), 0, 1, 0); pot.position.set(X + 1.5, 0, Z + 11); levelGroup.add(pot); solid(X + 1.5, Z + 11, 0.35); }
function awFlat() { const X = AF.x, Z = AF.z, W = AF.W, L = AF.L, wall = toonNS('#c8bca8');
  part(levelGroup, B(W, 0.1, L), toonNS('#8a6a4a', 'wood'), X, 0.05, Z); part(levelGroup, B(W, 0.1, L), toonNS('#e8e4dc'), X, 2.8, Z);
  for (const s of [-1, 1]) { part(levelGroup, B(0.2, 2.8, L), wall, X + s * (W / 2 + 0.1), 1.4, Z); box(X + s * (W / 2 + 0.3), Z, 0.3, L / 2); part(levelGroup, B(W, 2.8, 0.2), wall, X, 1.4, Z + s * (L / 2 + 0.1)); box(X, Z + s * (L / 2 + 0.3), W / 2, 0.3); }
  // the window: rainy Jamestown rooftops at dawn
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 160; const c = cv.getContext('2d'), tx = new THREE.CanvasTexture(cv); let f = 0;
  const towers = Array.from({ length: 9 }, (_, i) => [i * 30 - 6 + (i * 37 % 11), 50 + (i * 53 % 60), 22 + (i * 17 % 12)]);
  levelAnims.push(t => { if (f++ & 3) return; const g = c.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, '#5a6a8a'); g.addColorStop(0.7, '#d8a088'); g.addColorStop(1, '#e8c098'); c.fillStyle = g; c.fillRect(0, 0, 256, 160);
    for (const [x, h, w] of towers) { c.fillStyle = '#2a2a3a'; c.fillRect(x, 160 - h, w, h); c.fillStyle = '#ffd88a'; for (let y = 165 - h; y < 155; y += 9) for (let k = 3; k < w - 4; k += 7) if ((x * 7 + y * 3 + k) % 5 < 2) c.fillRect(x + k, y, 3, 4); }
    c.strokeStyle = 'rgba(220,230,255,.35)'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const rx = (i * 61 + t * 90) % 270 - 10, ry = (i * 97 + t * 420) % 180 - 20; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 10); c.stroke(); } tx.needsUpdate = true; });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshBasicMaterial({ map: tx })); win.position.set(X, 1.6, Z - L / 2 + 0.02); levelGroup.add(win);
  part(levelGroup, B(1.95, 0.08, 0.1), toonNS('#e8e4dc'), X, 1.03, Z - L / 2 + 0.05); part(levelGroup, B(0.05, 1.1, 0.06), toonNS('#e8e4dc'), X, 1.6, Z - L / 2 + 0.05); part(levelGroup, B(1.8, 0.05, 0.06), toonNS('#e8e4dc'), X, 1.6, Z - L / 2 + 0.05);
  // bed in the corner, unmade
  const bed = new THREE.Group(); part(bed, B(1.3, 0.4, 2.1), toonNS('#6a4f34', 'wood'), 0, 0.2, 0); part(bed, B(1.2, 0.2, 2.0), toonNS('#e8e4dc'), 0, 0.5, 0); part(bed, B(1.25, 0.14, 1.2), toonNS('#7a4a6a'), 0, 0.64, 0.3, 0.05, 0.15, 0); part(bed, B(0.8, 0.15, 0.4), toonNS('#ffffff'), 0, 0.66, -0.75);
  bed.position.set(X - 1.75, 0, Z - 1.6); levelGroup.add(bed); box(X - 1.75, Z - 1.6, 0.65, 1.05);
  // the desk with B.U.R.P. on it: a head on a little stand, wires, tools, a lamp, a monitor full of code
  const dk = new THREE.Group(); part(dk, B(1.8, 0.08, 0.8), toonNS('#7a5a3a', 'wood'), 0, 0.82, 0); for (const [a, b] of [[-0.82, -0.32], [0.82, -0.32], [-0.82, 0.32], [0.82, 0.32]]) part(dk, B(0.07, 0.8, 0.07), toonNS('#4a3a2a'), a, 0.4, b);
  part(dk, B(0.7, 0.45, 0.05), toonNS('#1e1f24'), -0.45, 1.15, -0.3); part(dk, B(0.62, 0.38, 0.01), new THREE.MeshBasicMaterial({ map: signTex('burp.py  ▌', '#0a1a14', '#6fdc5a') }), -0.45, 1.15, -0.27); part(dk, B(0.08, 0.2, 0.08), toonNS('#2b2a2c'), -0.45, 0.95, -0.3);
  part(dk, Cy(0.09, 0.12, 0.05, 10), toonNS('#2b2a2c'), 0.35, 0.88, 0); part(dk, Cy(0.03, 0.03, 0.22, 6), toonNS('#5d636c', 'metal'), 0.35, 1.0, 0);
  part(dk, B(0.3, 0.03, 0.04), toonNS('#c8402f'), -0.1, 0.875, 0.22, 0, 0.6, 0); part(dk, B(0.18, 0.03, 0.03), toonNS('#ffd36a'), 0.75, 0.875, 0.25, 0, -0.4, 0); part(dk, Cy(0.05, 0.05, 0.03, 8), toonNS('#9aa1aa', 'metal'), -0.75, 0.875, 0.2);
  for (let i = 0; i < 3; i++) part(dk, B(0.02, 0.02, 0.5), toonNS(['#c8402f', '#3a6aba', '#ffd36a'][i]), 0.2 + i * 0.04, 0.87, 0.12, 0, 0.3 - i * 0.2, 0);
  const h = burpHead(false); h.scale.setScalar(0.62); h.position.set(0.35, 1.32, 0); dk.add(h); AW.burp = h;
  const lampG = new THREE.Group(); part(lampG, Cy(0.08, 0.1, 0.03, 8), toonNS('#2b2a2c'), 0, 0.87, 0); part(lampG, Cy(0.015, 0.015, 0.45, 5), toonNS('#2b2a2c'), 0, 1.1, 0); part(lampG, Cy(0.05, 0.12, 0.12, 8), toonNS('#c8402f'), 0, 1.33, 0.05); lampG.position.set(0.75, 0, -0.25); dk.add(lampG);
  const dl = new THREE.PointLight(0xffd8a0, 0.6, 4); dl.position.set(0.6, 1.4, 0); dk.add(dl);
  dk.position.set(X + 1.55, 0, Z - 1.2); dk.rotation.y = -Math.PI / 2; levelGroup.add(dk); box(X + 1.55, Z - 1.2, 0.4, 0.9);
  // chair, rug, kitchen corner, clothes on the floor, posters
  part(levelGroup, B(0.5, 0.06, 0.5), toonNS('#2b2a2c'), X + 0.85, 0.5, Z - 1.2); part(levelGroup, B(0.06, 0.5, 0.5), toonNS('#2b2a2c'), X + 0.6, 0.78, Z - 1.2);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), toonNS('#3a6a8a')); rug.rotation.x = -Math.PI / 2; rug.position.set(X - 0.2, 0.105, Z + 0.6); levelGroup.add(rug);
  part(levelGroup, B(1.2, 0.9, 0.6), toonNS('#d8d0c0'), X - 1.6, 0.45, Z + L / 2 - 0.35); part(levelGroup, B(0.4, 0.5, 0.4), toonNS('#5d636c'), X - 1.9, 1.15, Z + L / 2 - 0.35); part(levelGroup, Cy(0.06, 0.05, 0.12, 8), toonNS('#ffffff'), X - 1.3, 0.96, Z + L / 2 - 0.35); box(X - 1.6, Z + L / 2 - 0.35, 0.6, 0.3);
  for (let i = 0; i < 4; i++) part(levelGroup, B(0.35, 0.05, 0.25), toonNS(['#3a5266', '#c8402f', '#2b2a2c', '#e8e4dc'][i]), X - 0.6 + i * 0.25, 0.12, Z - 0.3 + (i % 2) * 0.3, 0, i, 0);
  awSign('ROBOTICS FAIR · 2ND PLACE', '#1a2a4a', '#ffd36a', 0.9, 0.5, X + W / 2 - 0.03, 1.8, Z + 1.2, -Math.PI / 2); awSign('DON\'T PANIC', '#2b2a2c', '#7fe8ff', 0.7, 0.35, X - W / 2 + 0.03, 1.8, Z + 0.6, Math.PI / 2);
  const pl = new THREE.PointLight(0xffe0b0, 0.8, 9); pl.position.set(X, 2.4, Z); levelGroup.add(pl);
  INTERACTS.push({ x: X + 0.9, z: Z - 1.2, r: 1.3, label: '🤖 Talk to B.U.R.P.', fn: () => awBurpSays(AW.out ? ['I am in your head now. The desk me is just a speaker. Do not unplug it, it is load-bearing.'] : ['Still here. Still a head. Go on, the door is behind you.']) });
  INTERACTS.push({ x: X, z: Z + L / 2 - 0.9, r: 1.3, label: '🚪 Out to the hallway', fn: () => { SFX.door(); awFade('Jamestown Arms', () => { player.pos.set(AH.x - AH.W / 2 + 1, 0, AH.z - 4); player.yaw = Math.PI; }, () => { if (!AW.out) { AW.out = 1; setTimeout(() => awBurpSays(['Testing sound transplant. Yup, I can hear your thoughts and see what you see.. remember that when you use the toilet please..']), 500); } }); } });
  part(levelGroup, B(1.2, 2.3, 0.1), toonNS('#3a5266'), X, 1.15, Z + L / 2 - 0.02);
  // he watches you and moves his mouth when he talks
  levelAnims.push(t => { if (!AW.burp || !AW.burp.parent) return; const p = AW.burp.getWorldPosition(V(0, 0, 0)), want = Math.atan2(player.pos.x - p.x, player.pos.z - p.z) - (-Math.PI / 2), d = ((want - AW.burp.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    AW.burp.rotation.y += d * 0.08; AW.burp.position.y = 1.32 + Math.sin(t * 2) * 0.015; AW.burp.userData.mouth.scale.y = performance.now() < BG.talkUntil ? 1 + Math.abs(Math.sin(t * 14)) * 3.5 : 1; }); }
function awLeave() { SFX.door(); S.flags = S.flags || {}; S.flags.aptWake = 1; delete S.flags.aptPending; markDirty();
  awFade('New Jamestown', () => { loadLevel('earth'); }, () => toast('EARTH', 'Talk to Captain Vega by the gate', 4)); }
function awStart() { S.flags.aptStarted = 1; AW.out = 0; AW.said = 0; markDirty();
  awFade('Earth · 7:02 AM', () => { loadLevel('earthapt'); player.pitch = 0.5; AW.wake = performance.now(); }, () => { toast('JAMESTOWN ARMS', 'Apartment 1C', 2.5); setTimeout(() => { if (LEVEL.id === 'earthapt' && !AW.said) { AW.said = 1; awBurpSays(['Good morning!', 'You slept through three alarms. I was two of them.', 'Captain Vega called. She wants you down by the gate. The elevator is still broken, but we live on the first floor, so that is a you problem.']); } }, 900); }, 1400); }
// a brand-new character is flagged on Play; once the trailer and any opening scene are out of the way, they wake up at home
$('playBtn').addEventListener('click', () => setTimeout(() => { S.flags = S.flags || {}; if (state === 'play' && !S.flags.aptWake && !Object.keys(S.qst || {}).length && (S.lvl || 1) <= 1) S.flags.aptPending = 1; }, 0));
setInterval(() => { try { const F = S.flags || {}; if (!F.aptPending || F.aptWake || state !== 'play' || CUT.on || dlgOpen || (typeof TRL !== 'undefined' && TRL.on)) return;
  if (LEVEL.id === 'earth' && !AW.busy) { AW.busy = 1; setTimeout(() => { AW.busy = 0; }, 3000); awStart(); } } catch (_) {} }, 500);
// the building counts as Earth for saves and leaderboards
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'earthapt') S.where = 'earth'; return r; }; }
{ const _po = planetOpen; planetOpen = function (id) { if (id === 'earthapt') return false; return _po(id); }; }
// waking up: the view drifts down from the ceiling to the room
setInterval(() => { if (!AW.wake || LEVEL.id !== 'earthapt') return; const k = (performance.now() - AW.wake) / 2500; if (k >= 1) { AW.wake = 0; return; } player.pitch = 0.5 - 0.48 * (1 - Math.pow(1 - k, 2)); }, 30);
{ const _ct = clockText; clockText = function () { return LEVEL && LEVEL.id === 'earthapt' ? '☂ Home · Earth' : _ct(); }; }
