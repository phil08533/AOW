// =================== FISHING, WARDROBE UNLOCKS, MELEE, GUN MODELS ===================
// ---------------- fishing ----------------
Object.assign(ITEMS, {
  boot: { name: 'Old Boot', v: 1, col: '#5a4a3a', fish: true }, mudcarp: { name: 'Mud Carp', v: 8, col: '#8a7a4a', fish: true }, trout: { name: 'Lake Trout', v: 16, col: '#8fae8a', fish: true },
  catfish: { name: 'Whisker Cat', v: 24, col: '#6a6a5a', fish: true }, gill: { name: 'Crystal Gill', v: 45, col: '#9b6bff', fish: true },
  sandeel: { name: 'Sand Eel', v: 30, col: '#d8b070', fish: true }, glassfin: { name: 'Glassfin', v: 58, col: '#9fe8ff', fish: true }, ringfish: { name: 'Ringfish', v: 140, col: '#ffb347', fish: true },
  minnow: { name: 'Snow Minnow', v: 40, col: '#eef4f8', fish: true }, pike: { name: 'Frost Pike', v: 80, col: '#5d7f99', fish: true }, koi: { name: 'Ghost Koi', v: 230, col: '#e8e4ff', fish: true },
  coel: { name: 'Ancient Coelacanth', v: 750, col: '#3a5ea8', fish: true }
});
// [fish, weight, difficulty 0..1]
const FISH_TABLES = {
  lake: [['boot', 6, 0], ['mudcarp', 40, 0.2], ['trout', 34, 0.35], ['gill', 8, 0.62]],
  pond: [['boot', 10, 0], ['mudcarp', 60, 0.2], ['trout', 20, 0.35]],
  river: [['boot', 8, 0], ['trout', 40, 0.35], ['catfish', 30, 0.45], ['gill', 4, 0.62]],
  oasis: [['sandeel', 50, 0.4], ['glassfin', 34, 0.55], ['ringfish', 6, 0.78], ['boot', 4, 0]],
  frost: [['minnow', 50, 0.4], ['pike', 34, 0.6], ['koi', 6, 0.82]],
  icehole: [['minnow', 40, 0.4], ['pike', 40, 0.6], ['koi', 8, 0.82], ['coel', 2, 0.93]]
};
const RODS = { 1: { name: 'Basic Rod', price: 40, zone: 1, rare: 1 }, 2: { name: 'Hive Rod', price: 600, zone: 1.3, rare: 1.6 }, 3: { name: 'Frost Rod', price: 2500, zone: 1.6, rare: 2.4 } };
// fish buyers live in each hub
LEVELS.earth.npcs.push({ id: 'marlo', name: 'Marlo', role: 'Fishmonger · buys fish', rig: 'civ', make: () => makeCivilian('#3f7d7a', '#3d3a36', '#e0b892', '#8a6a44', '#e8e4dc'), x: -4.6, z: 8.6, face: Math.PI, shop: 'fish', rods: [1],
  idle: ["Crystal Lake's to the south and west. Trout bite all day, Crystal Gills only bite for the patient.", "Bring me fish, I pay coin. Simple."] });
LEVELS.mezar.npcs.push({ id: 'gulp', name: 'Gulp', role: 'Hive fish trader', rig: 'bughybrid', make: () => recolor(makeBugHybrid(), { '#5f8a3a': '#3f8a9a', '#3e5e26': '#2a5a6a' }), x: -3, z: 9.6, face: Math.PI, shop: 'fish', rods: [1, 2],
  idle: ["Glass Oasis fish are crunchy. Gulp loves crunchy.", "Ringfish only come up when the rings are bright."] });
LEVELS.capitone.npcs.push({ id: 'nan', name: 'Nan Ice', role: 'Ice angler · buys fish', rig: 'civ', make: () => makeCivilian('#dce8f0', '#3a5266', '#d9a77a', '#e8e4dc', '#5d7f99'), x: 3, z: 10.6, face: Math.PI, shop: 'fish', rods: [1, 2, 3],
  idle: ["Cut a hole on the Frozen Plains, drop a line, and wait. That's the whole secret.", "There's something old under that ice. Older than the tree."] });
// fishing quests
defQuest('f1', { ch: 'Earth · Fishing', title: 'Gone Fishing', giver: 'marlo', turnIn: 'marlo', req: ['q1'], onStart: () => { if (!S.rod) { S.rod = 1; log('Got a Basic Rod', 'loot'); } },
  intro: ["You look like you need a break from shooting things.", "Here, take my spare rod. Find a fishing spot, the little docks by the water, and catch me three fish."],
  obj: [{ kind: 'fish', n: 3, text: 'Catch any 3 fish', zone: 'lake' }],
  outro: ["Not bad! You've got the wrist for it. Every hub has a fish buyer, by the way. Bring us what you catch."], reward: { cr: 80, xp: 120, items: { medkit: 2 } } });
defQuest('f2', { ch: 'Mezar · Fishing', title: 'Ringfish Rumors', giver: 'gulp', turnIn: 'gulp', req: ['m1'],
  intro: ["Gulp has never tasted a Ringfish. Gulp dreams of Ringfish.", "They live in the Glass Oasis. Very rare, very fast. A Hive Rod helps."],
  obj: [{ kind: 'item', t: 'ringfish', n: 1, text: 'Catch a Ringfish at the Glass Oasis', zone: 'oasis', planet: 'mezar' }],
  outro: ["RINGFISH! Gulp is so happy. Take this, Gulp's best treasure."], reward: { cr: 600, xp: 1200, take: { ringfish: 1 }, items: { crystal: 3 } } });
defQuest('f3', { ch: 'Capitone · Fishing', title: 'The Old One', giver: 'nan', turnIn: 'nan', req: ['c1'],
  intro: ["Fifty years I've fished that ice. Once, just once, I saw it. An Ancient Coelacanth.", "Catch it at the ice hole on the Frozen Plains. Bring a Frost Rod. And bring patience."],
  obj: [{ kind: 'item', t: 'coel', n: 1, text: 'Catch an Ancient Coelacanth at the ice hole', zone: 'frozen', planet: 'capitone' }],
  outro: ["...There it is. Older than the tree.", "You're a true angler now. Wear this with pride: the Angler's Cape."], reward: { cr: 2500, xp: 5000, take: { coel: 1 }, cape: 'angler' } });
function questProgressFish() { for (const id in S.qst) { const s = S.qst[id]; if (s.st !== 'active') continue; QDEFS[id].obj.forEach((o, k) => { if (o.kind === 'fish' && (s.p[k] || 0) < o.n) s.p[k] = (s.p[k] || 0) + 1; }); } }
// a fishing spot: little dock on the shore, facing the water
function shoreSpot(cx, cz, ang, minR) {
  for (let d = minR || 1; d < 30; d += 0.25) { const x = cx + Math.cos(ang) * d, z = cz + Math.sin(ang) * d; if (groundH(x, z) > WATER_Y + 0.12) return [x, z]; }
  return [cx + Math.cos(ang) * 6, cz + Math.sin(ang) * 6];
}
function fishSpot(name, table, x, z, faceX, faceZ, ice) {
  const g = new THREE.Group(), y = Math.max(groundH(x, z), WATER_Y + 0.2);
  if (ice) { const hole = new THREE.Mesh(new THREE.CircleGeometry(0.7, 10).rotateX(-Math.PI / 2), toon('#1a3a5a')); hole.position.y = 0.06; g.add(hole); part(g, B(0.4, 0.5, 0.4), toon('#8a6a44', 'wood'), 1.2, 0.25, 0); }
  else {
    for (let i = 0; i < 6; i++) part(g, B(1.4, 0.1, 0.42), toon(i % 2 ? '#9a7650' : '#8a6a44', 'wood'), 0, 0.2, 0.25 + i * 0.44);
    for (const s of [-1, 1]) for (const k of [0, 1]) part(g, Cy(0.07, 0.07, 1.6, 5), toon('#6a4f34', 'wood'), 0.62 * s, -0.4, 0.4 + k * 1.8);
    part(g, Cy(0.04, 0.04, 1.4, 4), toon('#6a4f34', 'wood'), 0.62, 0.9, 0.3); part(g, B(0.7, 0.4, 0.05), toon('#3f7d7a'), 0.62, 1.4, 0.3);
  }
  const bob = new THREE.Group(); part(bob, new THREE.SphereGeometry(0.08, 6, 4), glow('#ff3b2a'), 0, 0, 0); part(bob, new THREE.SphereGeometry(0.07, 6, 4), glow('#f4f8ff'), 0, -0.06, 0);
  bob.position.set(0, ice ? 0.1 : WATER_Y - y + 0.05, ice ? 0 : 3.4); g.add(bob);
  g.position.set(x, y, z); g.rotation.y = Math.atan2(faceX - x, faceZ - z); levelGroup.add(g);
  const ph = Math.random() * 6; levelAnims.push(t => { bob.position.y = (ice ? 0.1 : WATER_Y - y + 0.05) + Math.sin(t * 2 + ph) * 0.04; });
  INTERACTS.push({ x, z, r: 2.6, label: 'Fish: ' + name, fn: () => startFishing(name, table) });
  if (!ice) { const ry = g.rotation.y, ux = Math.sin(ry), uz = Math.cos(ry); SURFACES.push({ x: x + ux * 1.2, z: z + uz * 1.2, ux, uz, hl: 1.6, hw: 0.8, y: y + 0.25 }); }
  SAFES.push({ x, z, r: 6 }); // fishing spots are peaceful
  const halo = new THREE.Mesh(new THREE.RingGeometry(5.6, 6, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#8fe3ff', transparent: true, opacity: 0.25, depthWrite: false })); halo.position.set(x, Math.max(groundH(x, z), WATER_Y) + 0.08, z); levelGroup.add(halo);
}
function buildFishSpots(id) {
  const add = (name, table, cx, cz, ang, minR) => { const [x, z] = shoreSpot(cx, cz, ang, minR); fishSpot(name, table, x, z, cx, cz); };
  if (id === 'earth') { add('Crystal Lake', 'lake', Z.lake.x, Z.lake.z, 0.3, 4); add('Crystal Lake', 'lake', Z.lake.x, Z.lake.z, -2.2, 4); add('Bug Pond', 'pond', ...ET(-52, 2), 0.4); add('The River', 'river', LEVELS.earth.river[2][0] + 3, LEVELS.earth.river[2][1], 0, 0.5); }
  if (id === 'mezar') { add('Glass Oasis', 'oasis', -44, 20, 0.2, 2); add('Glass Oasis', 'oasis', -44, 20, 2.6, 2); }
  if (id === 'robot') add('Coolant Canal', 'canal', 22, -22, 2.4, 2);
  if (id === 'ocean') { fishSpot('North Dock', 'sea', PORT[0], PORT[1] + 23.8, PORT[0], PORT[1] + 40); fishSpot('West Dock', 'sea', PORT[0] - 21.8, PORT[1] + 2, PORT[0] - 40, PORT[1] + 2); }
  if (id === 'capitone') { add('Fern Pond', 'frost', 50, 6, 3.6); add('Tree River', 'frost', -20, -12, 0, 0.5); fishSpot('Ice Hole', 'icehole', Z.frozen.x - 10, Z.frozen.z + 10, Z.frozen.x, Z.frozen.z, true); }
}
let fishing = null;
function startFishing(name, table) {
  if (!S.rod) { openDlg('Fishing spot', name); $('dlgLine').textContent = 'You need a fishing rod. Fish buyers sell them, and Marlo in the Earth Safe Zone gives one away.'; acts([['Close', closeDlg]]); return; }
  const rod = RODS[S.rod];
  openDlg('Fishing · ' + rod.name, name);
  const wrap = document.createElement('div'); wrap.className = 'rows'; wrap.id = 'shopRows';
  wrap.innerHTML = '<div class="fishbar"><i class="fz"></i><b class="fm"></b></div>';
  $('dlgActs').before(wrap);
  const bar = wrap.firstChild, zoneEl = bar.querySelector('.fz'), mark = bar.querySelector('.fm');
  const F = fishing = { st: 'wait', t: rand(1.6, 4.2), table, name, fish: null, zone: 0.3, pos: 0, sp: 1, bar, zoneEl, mark, z0: 0 };
  $('dlgLine').textContent = 'You cast your line... wait for a bite.'; SFX.plop(); bar.style.opacity = 0.35;
  const reel = () => {
    if (F.st === 'wait') { $('dlgLine').textContent = 'Too early! The ripples scare the fish. Wait for the bite.'; F.t += 1.2; SFX.ui(); return; }
    if (F.st !== 'bite') return;
    const ok = F.pos >= F.z0 && F.pos <= F.z0 + F.zone;
    if (ok) { F.hits++; SFX.reel(); SFX.coin(); if (F.hits >= F.need) return land(); $('dlgLine').textContent = `Hooked! Keep reeling... ${F.hits}/${F.need}`; F.z0 = Math.random() * (1 - F.zone); zoneEl.style.left = (F.z0 * 100) + '%'; F.sp *= 1.12; }
    else { F.st = 'gone'; SFX.hurt(); $('dlgLine').textContent = `It got away! (${ITEMS[F.fish].name})`; bar.style.opacity = 0.35; acts([['Cast again', () => { closeDlg(); startFishing(name, table); }, true], ['Stop', closeDlg]]); }
  };
  const land = () => {
    F.st = 'done'; S.inv[F.fish] = (S.inv[F.fish] || 0) + 1; S.fishLog = S.fishLog || {}; const first = !S.fishLog[F.fish]; S.fishLog[F.fish] = (S.fishLog[F.fish] || 0) + 1;
    const it = ITEMS[F.fish]; $('dlgLine').textContent = `You caught a ${it.name}! (${it.v} cr)${first ? ' New species for your log!' : ''}`;
    SFX.splash(); SFX.item(); if (it.v >= 100) { SFX.quest(); toast('RARE CATCH', it.name); burp('rare'); }
    log(`Caught ${it.name}`, 'loot'); questProgressFish(); gainXp(Math.max(4, Math.round(it.v * 0.9))); markDirty(); checkReady();
    bar.style.opacity = 0.35; acts([['Cast again', () => { closeDlg(); startFishing(name, table); }, true], ['Stop', closeDlg]]);
  };
  F.reel = reel; F.hits = 0;
  acts([['Reel!', reel, true], ['Stop', closeDlg]]);
}
function updateFishing(dt) {
  const F = fishing; if (!F) return;
  if (!dlgOpen || !document.body.contains(F.bar)) { fishing = null; return; }
  if (F.st === 'wait') { F.t -= dt; if (F.t <= 0) {
      const rod = RODS[S.rod], tb = FISH_TABLES[F.table].map(([id, w, d]) => [id, d > 0.55 ? w * rod.rare : w, d]);
      let tot = tb.reduce((a, b) => a + b[1], 0), r = Math.random() * tot; let pick = tb[0]; for (const e of tb) { r -= e[1]; if (r <= 0) { pick = e; break; } }
      F.fish = pick[0]; const d = pick[2];
      F.zone = clamp((0.34 - d * 0.24) * rod.zone, 0.08, 0.5); F.need = d > 0.8 ? 3 : d > 0.5 ? 2 : 1; F.sp = 0.7 + d * 1.6; F.z0 = Math.random() * (1 - F.zone);
      F.st = 'bite'; F.bar.style.opacity = 1; F.zoneEl.style.width = (F.zone * 100) + '%'; F.zoneEl.style.left = (F.z0 * 100) + '%';
      $('dlgLine').textContent = F.need > 1 ? `Something BIG bit! Hit Reel in the green ${F.need} times.` : 'A bite! Hit Reel when the marker is in the green.'; SFX.bite(); F.ph = 0; } }
  if (F.st === 'bite') { F.ph += dt * F.sp; F.pos = 0.5 + 0.5 * Math.sin(F.ph * 2.2); F.mark.style.left = (F.pos * 100) + '%'; }
}
function openFishShop(n) {
  openDlg(n.role, n.name);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    const fish = Object.entries(S.inv).filter(([k]) => ITEMS[k] && ITEMS[k].fish);
    const total = fish.reduce((a, [k, c]) => a + (questWants(k) ? 0 : c * ITEMS[k].v), 0);
    $('dlgLine').textContent = `Fish sell for full price here. ${S.cr} cr on hand. Species caught: ${Object.keys(S.fishLog || {}).length}/${Object.keys(ITEMS).filter(k => ITEMS[k].fish).length}`;
    const list = fish.map(([k, c]) => [k, c, ITEMS[k].v + ' cr', [['Sell', () => { if (questWants(k)) { log('Keep that one, a quest needs it.'); return; } S.cr += c * ITEMS[k].v; delete S.inv[k]; SFX.coin(); markDirty(); render(); }]]]);
    (n.rods || []).forEach(t => { const R = RODS[t]; list.push(['__rod' + t, null, S.rod >= t ? 'Owned' : R.price + ' cr', [['Buy', () => { S.cr -= R.price; S.rod = t; SFX.item(); log('Bought a ' + R.name, 'loot'); markDirty(); render(); }, S.rod >= t || S.cr < R.price]]]); ITEMS['__rod' + t] = { name: R.name + (t > 1 ? ` (bigger catch window, rarer fish)` : ''), col: '#c9a43a', v: 0 }; });
    itemRows(rows, list);
    acts([['Sell all fish', () => { let sum = 0; for (const [k, c] of Object.entries(S.inv)) if (ITEMS[k] && ITEMS[k].fish && !questWants(k)) { sum += c * ITEMS[k].v; delete S.inv[k]; } if (sum) { S.cr += sum; SFX.coin(); log(`Sold fish for ${sum} cr`, 'loot'); markDirty(); } render(); }, true, !total], ['Done', closeDlg]]);
  };
  $('dlgActs').before(rows); render();
}

// ---------------- wardrobe: armor, capes, helmets unlocked by level and deeds ----------------
const ARMORS = {
  std: { name: 'Trooper Armor', lvl: 1, def: 0, trim: '#c9b27c', visor: '#4fd2ff' },
  recon: { name: 'Recon Armor', lvl: 6, def: 0.05, trim: '#3a4a3a', visor: '#7fff6a' },
  heavy: { name: 'Heavy Plate', lvl: 12, def: 0.1, trim: '#5d636c', visor: '#ffd36a' },
  hive: { name: 'Hive Carapace', lvl: 16, q: 'm5', def: 0.13, trim: '#c9a46a', visor: '#ffd23a' },
  frost: { name: 'Frost Guard', lvl: 22, def: 0.17, trim: '#dce8f0', visor: '#9fe8ff' },
  spike: { name: 'Spiked Commando', lvl: 30, def: 0.22, trim: '#1e1c22', visor: '#ff2a3a' }
};
const ARMOR_KITS = {};
const CAPES = {
  none: { name: 'No cape', lvl: 1 }, red: { name: 'Red Cape', lvl: 3, col: '#b3262c' }, royal: { name: 'Royal Cape', lvl: 10, col: '#5d3a8a', trim: '#c9a43a' },
  drome: { name: "Drome's Banner Cape", lvl: 1, q: 'q5', col: '#1e1c22', trim: '#b3262c' }, oasis: { name: 'Oasis Cape', lvl: 1, gear: 'cape', col: '#3f7d7a', trim: '#e8cf98' },
  frost: { name: 'Frost Cape', lvl: 20, col: '#bfe6f2', trim: '#5d7f99' }, angler: { name: "Angler's Cape", lvl: 1, flag: 'angler', col: '#2a5a7a', trim: '#ffb347' },
  master: { name: "Masters' Cape", lvl: 1, q: 'c5', col: '#0f1757', trim: '#ffd75e' }
};
const HELMS = window.HELMS = window.HELMS || {
  visor: { name: 'Visor Helmet', lvl: 1 }, spike: { name: 'Spiked Helm', lvl: 15 }, bug: { name: 'Bug Helm', lvl: 1, q: 'm3' }, crown: { name: 'Ice Crown', lvl: 1, q: 'c5' }
};
const HELM_KITS = window.HELM_KITS = window.HELM_KITS || {
  visor(g) {},
  spike(g) { for (let k = -1; k <= 1; k++) part(g, new THREE.ConeGeometry(0.04, 0.2, 4), '#b3262c', k * 0.08, 1.95, -0.02); },
  bug(g) { for (const s of [-1, 1]) { chain(g, [[0.06 * s, 1.9, 0.05], [0.14 * s, 2.1, 0.12], [0.2 * s, 2.15, 0.2]], 0.012, '#3a2c1c', 0.008); E(g, glow('#ffd23a'), 0.07 * s, 1.83, 0.15, 0.03, 0.03, 0.02); } },
  crown(g) { part(g, Cy(0.15, 0.15, 0.05, 10), toon('#c9a43a'), 0, 1.9, 0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.03, 0.14, 4), glow('#9fe8ff'), Math.cos(a) * 0.13, 1.98, Math.sin(a) * 0.13); } }
};
function lookUnlocked(T, id) {
  const it = T[id]; if (!it) return false;
  if (S.lvl < it.lvl) return false; if (it.q && !qDone(it.q)) return false; if (it.gear && !hasGear(it.gear)) return false; if (it.flag && !(S.flags && S.flags[it.flag])) return false; if (it.cost && !(S.ownA && S.ownA[id])) return false; return true;
}
const myLook = () => { const L = S.look || {}; return { a: ARMORS[L.a] && lookUnlocked(ARMORS, L.a) ? L.a : 'std', c: CAPES[L.c] && lookUnlocked(CAPES, L.c) ? L.c : 'none', h: HELMS[L.h] && lookUnlocked(HELMS, L.h) ? L.h : 'visor', f: L.f || '0.0.0.0.0' }; };
const armorDef = () => ARMORS[myLook().a].def;
function swapMats(obj, map) { obj.traverse(o => { if (o.isMesh && map.has(o.material)) o.material = map.get(o.material); }); }
function makePlayerChar(look, col, opts) {
  opts = opts || {};
  const isStd = !look || !look.a || look.a === 'std';
  const bare = (opts.bare !== undefined) ? opts.bare : (!isStd && look.a !== 'recon' && (!ARMORS[look.a] || ARMORS[look.a].bare !== false));
  const noGun = !!(opts.noGun || opts.noWeapon);
  const A = ARMORS[look.a] || ARMORS.std, g = makeTrooper({ bare, noGun });
  const m = new Map([[toon(C.olive), toon(A.body || col)], [toon(C.oliveDk), toon(A.body ? A.trim : C.oliveDk)], [toon(C.tan), toon(A.trim)], [glow(C.visor), glow(A.visor)]]);
  swapMats(g, m);
  if (ARMOR_KITS[look.a]) ARMOR_KITS[look.a](g, A);
  const Cp = CAPES[look.c];
  if (Cp && Cp.col) { const cape = part(g, B(0.52, 1.05, 0.03), toon(Cp.col, 'cloth'), 0, 1.0, -0.3, 0.12, 0, 0); cape.castShadow = false; if (Cp.trim) part(g, B(0.54, 0.06, 0.04), Cp.trim, 0, 0.5, -0.24, 0.12); if (Cp.trim) part(g, new THREE.CircleGeometry(0.09, 8), glow(Cp.trim), 0, 1.15, -0.33, 0, Math.PI, 0); }
  // built once here; the flags stop the later makePlayerChar wrappers (moon.js, face.js, wizard.js) building the same helmet a second time without A
  if (HELM_KITS[look.h]) { HELM_KITS[look.h](g, look, A); g.userData._helmCustom = g.userData._face = g.userData._wizHat = true; }
  else if (look.h === 'spike') for (let k = -1; k <= 1; k++) part(g, new THREE.ConeGeometry(0.04, 0.2, 4), '#b3262c', k * 0.08, 1.95, -0.02);
  else if (look.h === 'bug') { for (const s of [-1, 1]) { chain(g, [[0.06 * s, 1.9, 0.05], [0.14 * s, 2.1, 0.12], [0.2 * s, 2.15, 0.2]], 0.012, '#3a2c1c', 0.008); E(g, glow('#ffd23a'), 0.07 * s, 1.83, 0.15, 0.03, 0.03, 0.02); } }
  else if (look.h === 'crown') { part(g, Cy(0.15, 0.15, 0.05, 10), toon('#c9a43a'), 0, 1.9, 0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.03, 0.14, 4), glow('#9fe8ff'), Math.cos(a) * 0.13, 1.98, Math.sin(a) * 0.13); } }
  return g;
}
let mannequin = null, mannequinAt = null;
function placeMannequin() {
  if (!mannequinAt || !levelGroup) return;
  if (mannequin) { levelGroup.remove(mannequin); disposeTree(mannequin); }
  mannequin = buildChar(() => makePlayerChar(myLook(), S.col), 'trooper'); blob(mannequin, 0.5);
  mannequin.position.set(mannequinAt.x, 0.3, mannequinAt.z); mannequin.rotation.y = mannequinAt.ry; levelGroup.add(mannequin);
  const t0 = Math.random(); levelAnims.push(t => { if (mannequin) mannequin.rotation.y = mannequinAt.ry + Math.sin(t * 0.5 + t0) * 0.5; });
}
{ const orig = LEVELS.ship.build;
  LEVELS.ship.build = function () {
    orig.call(this); mannequin = null; mannequinAt = null;
    const q = SHIP_ROOMS.find(r => r.id === 'quarters'); if (!q) return;
    const cx = (q.x0 + q.x1) / 2, cz = q.zc + 2.2; mannequinAt = { x: cx, z: cz, ry: q.side > 0 ? -Math.PI / 2 : Math.PI / 2 };
    part(props, Cy(0.5, 0.55, 0.3, 10), '#3a3d44', cx, 0.15, cz); part(props, Cy(0.52, 0.52, 0.03, 16), glow('#6fdc5a'), cx, 0.31, cz); solid(cx, cz, 0.55);
    INTERACTS.push({ x: cx - q.side * 1.2, z: cz, r: 2.2, label: 'Wardrobe', fn: openWardrobe });
    setTimeout(placeMannequin, 0);
  };
}
function openWardrobe() {
  openDlg('Wardrobe', 'Armor · capes · helmets');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  let tab = 'a', tryOn = null;
  const pvTry = nm => setPreview(() => { const g = makePlayerChar(tryOn || myLook(), S.col); g.rotation.y = tab === 'c' ? Math.PI : 0; return g; }, tryOn ? 'Trying on: ' + nm : 'You');
  const render = () => {
    if (tab === 'f') return renderFace(rows, () => setTimeout(pvMe, 0));
    rows.textContent = ''; const L = myLook(), T = tab === 'a' ? ARMORS : tab === 'c' ? CAPES : HELMS;
    $('dlgLine').textContent = tab === 'a' ? `Tap a set to try it on. Armor reduces damage. Wearing ${ARMORS[L.a].name} (−${Math.round(ARMORS[L.a].def * 100)}% damage taken). Other players see your look.` : tab === 'c' ? 'Capes show off where you have been.' : 'Helmets.';
    if (tab === 'a' && typeof setSex === 'function') { const r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.innerHTML = '<b>Body</b>'; const c = document.createElement('span'); c.style.cssText = 'display:flex;gap:6px;margin-left:auto';
      for (const [t, f] of [['♂ Male', false], ['♀ Female', true]]) { const b = document.createElement('button'); b.className = 'pbtn' + (isFemale(S.look) === f ? ' go' : ''); b.style.padding = '5px 10px'; b.textContent = t; b.addEventListener('click', () => { setSex(f); markDirty(); SFX.item(); sendPresence(true); if (LEVEL.id === 'ship') placeMannequin(); render(); }); c.appendChild(b); }
      r.append(nm, c); rows.appendChild(r); }
    Object.entries(T).forEach(([id, it]) => {
      if (tab === 'a' && it.shop === false && !(S.ownA && S.ownA[id])) return;
      const un = lookUnlocked(T, id), on = L[tab] === id, r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = it.col || it.trim || it.visor || '#9aa1aa';
      const nm = document.createElement('span'); nm.textContent = it.name + (tab === 'a' && it.def ? ` · −${Math.round(it.def * 100)}% dmg` : '');
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px';
      const buyable = it.cost && !(S.ownA && S.ownA[id]) && S.lvl >= it.lvl;
      mt.textContent = un ? (on ? 'Wearing' : 'Unlocked') : buyable ? `${it.cost} cr` : it.q ? `Finish “${QDEFS[it.q].title}”` : it.gear ? 'Master gear reward' : it.flag ? (it.flag.startsWith('marshal') ? 'Bounty rank reward' : 'Fishing reward') : `Reach Lv ${it.lvl}`;
      if (it.note) nm.title = it.note;
      r.style.cursor = 'pointer'; r.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') return; tryOn = Object.assign({}, myLook(), { [tab]: id }); pvTry(it.name); });
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = on ? '✓' : buyable ? 'Buy' : 'Wear'; b.disabled = buyable ? S.cr < it.cost : (!un || on);
      if (buyable) { b.addEventListener('click', () => { if (S.cr < it.cost) return; S.cr -= it.cost; S.ownA = S.ownA || {}; S.ownA[id] = 1; S.look = Object.assign({}, myLook(), { a: id }); SFX.coin(); log(`Bought ${it.name}`, 'loot'); markDirty(); sendPresence(true); if (LEVEL.id === 'ship') placeMannequin(); tryOn = null; render(); pvMe(); }); r.append(dot, nm, mt, b); rows.appendChild(r); return; }
      b.addEventListener('click', () => { tryOn = null; S.look = Object.assign({}, myLook(), { [tab]: id }); markDirty(); SFX.item(); sendPresence(true); if (LEVEL.id === 'ship') placeMannequin(); render(); });
      r.append(dot, nm, mt, b); rows.appendChild(r);
    });
  };
  $('dlgActs').before(rows);
  acts([['Armor', () => { tab = 'a'; render(); }, true], ['Capes', () => { tab = 'c'; render(); }], ['Helmets', () => { tab = 'h'; render(); }], ['Face', () => { tab = 'f'; render(); }], ['Done', closeDlg]]);
  render();
  showPreviewIn(rows); const pvMe = () => setPreview(() => { const g = makePlayerChar(myLook(), S.col); g.rotation.y = tab === 'c' ? Math.PI : 0; return g; }, 'You');
  pvMe(); rows.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') setTimeout(pvMe, 0); });
}
function announceUnlocks(lv) {
  for (const T of [ARMORS, CAPES, HELMS]) for (const id in T) { const it = T[id]; if (it.lvl === lv && !it.q && !it.gear && !it.flag && it.shop !== false) log(`Unlocked: ${it.name}. Open the Wardrobe from your Bag.`, 'loot'); }
  for (const id in MELEE) if (MELEE[id].req === lv) log(`${MELEE[id].name} can now be bought from gunsmiths.`, 'loot');
}

// ---------------- melee ----------------
const MELEE = {
  knife: { name: 'Combat Knife', dmg: 42, rate: 0.42, reach: 2.4, req: 1, price: 0 },
  cleaver: { name: 'Alien Cleaver', dmg: 95, rate: 0.6, reach: 2.7, req: 7, price: 500 },
  hook: { name: 'Hook Blade', dmg: 150, rate: 0.48, reach: 2.7, req: 13, price: 2600 },
  staff: { name: 'Frost Staff', dmg: 250, rate: 0.7, reach: 3.3, req: 20, price: 6500 },
  master: { name: 'Master Sword', dmg: 420, rate: 0.55, reach: 3.1, req: 28, price: 15000 }
};
function makeMeleeModel(id) {
  const g = new THREE.Group();
  part(g, Cy(0.022, 0.024, 0.16, 6), C.dark, 0, 0, 0); part(g, B(0.1, 0.02, 0.04), '#5d636c', 0, 0.09, 0);
  if (id === 'knife') part(g, B(0.025, 0.24, 0.012), '#cfd4dc', 0, 0.22, 0);
  if (id === 'cleaver') { part(g, B(0.03, 0.38, 0.014), '#b8bcc4', 0, 0.28, 0); part(g, B(0.14, 0.26, 0.014), '#9aa1aa', 0.07, 0.34, 0); part(g, B(0.02, 0.26, 0.016), glow('#7fff6a'), 0.14, 0.34, 0); }
  if (id === 'hook') { part(g, B(0.03, 0.34, 0.014), '#9aa1aa', 0, 0.27, 0); part(g, new THREE.TorusGeometry(0.1, 0.016, 5, 10, Math.PI), '#cfd4dc', -0.1, 0.44, 0, 0, 0, -0.4); }
  if (id === 'staff') { part(g, Cy(0.022, 0.022, 0.9, 6), toon('#5a4030', 'wood'), 0, 0.4, 0); part(g, new THREE.OctahedronGeometry(0.07, 0), glow('#9fe8ff'), 0, 0.9, 0); part(g, new THREE.TorusGeometry(0.08, 0.012, 5, 10), '#c9a43a', 0, 0.84, 0, Math.PI / 2); }
  if (id === 'master') { part(g, B(0.04, 0.62, 0.014), glow('#4fa8ff'), 0, 0.42, 0); part(g, B(0.016, 0.6, 0.018), glow('#ff3b2a'), 0, 0.42, 0.001); part(g, B(0.18, 0.03, 0.05), '#c9a43a', 0, 0.1, 0); }
  return g;
}
const vmMelee = new THREE.Group(); camera.add(vmMelee); vmMelee.visible = false;
let meleeShown = null, meleeT = 0, meleeCool = 0;
function refreshMeleeModel() {
  const id = S.melee || 'knife', key = id + (MELEE[id] && MELEE[id].saber ? JSON.stringify(saberCfg()) : ''); if (meleeShown === key) return; meleeShown = key;
  while (vmMelee.children.length) vmMelee.remove(vmMelee.children[0]);
  const m = makeMeleeModel(id); m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); vmMelee.add(m);
}
function meleeAttack() {
  if (LEVEL.fly || !handMelee()) return;
  if (state !== 'play' || dlgOpen || meleeCool > 0 || !player.alive || baseState.on) return;
  const M0 = MELEE[S.melee || 'knife'], M = M0.saber ? Object.assign({}, M0, { dmg: M0.dmg * (1 + 0.15 * saberMod('focus')), rate: M0.rate * (1 - 0.08 * saberMod('grip')), reach: M0.reach + 0.35 * saberMod('emitter') }) : M0; refreshMeleeModel();
  meleeCool = M.rate; meleeT = 0.3; SFX.swing(M.saber);
  if (inSafe(player.pos)) return;
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw); let n = 0;
  const hits = enemies.filter(e => !e.dead).map(e => { const dx = e.obj.position.x - player.pos.x, dz = e.obj.position.z - player.pos.z, d = Math.hypot(dx, dz); return { e, d, dot: (dx * fx + dz * fz) / (d || 1) }; })
    .filter(h => h.d < M.reach + h.e.def.r * h.e.sc && h.dot > (M.sweep ? -0.2 : 0.45) && Math.abs(h.e.obj.position.y - player.pos.y) < 3).sort((a, b) => a.d - b.d).slice(0, M.sweep ? 6 : 3);
  for (const { e } of hits) {
    const dmg = M.dmg * (1 + (S.lvl - 1) * 0.045) * (hasGear('ring') ? 1.15 : 1) * (hasGear('armblade') ? 1.3 : 1) * subDmg();
    e.hp -= dmg; e.hitT = 0.15; e.aggro = true; e.lastHit = gameTime; e.anim.hit = 0.18; n++;
    burst(e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), M.saber ? SABER_COLS[saberCfg().col] : S.melee === 'staff' ? '#9fe8ff' : '#fff1c8', 8, 4);
    if (S.melee === 'staff') e.cd = Math.max(e.cd, 1.2);
    if (e.hp <= 0) kill(e); else { updatePlate(e); }
  }
  if (typeof meleeExtras === 'function') meleeExtras(M, hits);
  if (n) { hitmark(false); SFX.hit(); }
}
function updateMelee(dt) {
  meleeCool -= dt;
  if (meleeT > 0) { meleeT -= dt; const k = 1 - Math.max(0, meleeT) / 0.3, sw = Math.sin(k * Math.PI);
    vmMelee.visible = true; vmMelee.position.set(0.05 - k * 0.25, -0.2 + sw * 0.08, -0.32); vmMelee.rotation.set(-0.4 - sw * 0.6, 0.3, 1.2 - k * 2.2);
    vm.position.y -= sw * 0.12; }
  else if (!handMelee()) vmMelee.visible = false;
}

// ---------------- more guns, each with its own model ----------------
Object.assign(GUNS, {
  sg8: { name: 'Lvl 8 Scatter Blaster', dmg: 22, pellets: 7, spread: 0.06, rate: 0.65, mag: 6, reload: 1.5, req: 5, price: 380, col: '#c8402f', kind: 'scatter' },
  k18: { name: 'Lvl 18 Long Rifle', dmg: 210, rate: 0.75, mag: 5, reload: 1.6, req: 12, price: 3600, col: '#6fdc5a', kind: 'long' },
  l28: { name: 'Lvl 28 Rocket Launcher', dmg: 380, splash: 3.4, rate: 1.0, mag: 4, reload: 1.8, req: 19, price: 9000, col: '#ff6a1a', kind: 'rocket' }
});
Object.assign(GUNS.b5, { col: '#4fa8ff' }); Object.assign(GUNS.c10, { col: '#ffd36a', kind: 'carbine' }); Object.assign(GUNS.r15, { col: '#c86aff', kind: 'rifle' });
Object.assign(GUNS.h20, { col: '#ffd23a', kind: 'hive' }); Object.assign(GUNS.s25, { col: '#ff3b2a', kind: 'rifle' }); Object.assign(GUNS.f30, { col: '#9fe8ff', kind: 'carbine' }); Object.assign(GUNS.p35, { col: '#c86aff', kind: 'plasma' });
LEVELS.earth.npcs.find(n => n.id === 'tully').guns = ['b1', 'b5', 'sg8', 'c10', 'r15']; LEVELS.earth.npcs.find(n => n.id === 'tully').melee = ['knife', 'cleaver'];
LEVELS.mezar.npcs.find(n => n.id === 'thrax').guns = ['r15', 'k18', 'h20', 's25']; LEVELS.mezar.npcs.find(n => n.id === 'thrax').melee = ['cleaver', 'hook'];
LEVELS.capitone.npcs.find(n => n.id === 'quill').guns = ['s25', 'f30', 'l28', 'p35']; LEVELS.capitone.npcs.find(n => n.id === 'quill').melee = ['hook', 'staff', 'master'];
function makeGunModel(id) {
  if (GUNS[id] && GUNS[id].kind === 'mystic') return makeMysticModel(id);
  const G = GUNS[id] || GUNS.b1, g = makeBlaster(), acc = G.col || C.gunAcc;
  swapMats(g, new Map([[toon(C.gunAcc), toon(acc)]]));
  if (G.kind === 'scatter') { part(g, Cy(0.03, 0.03, 0.2, 8), C.dark, 0.022, 0.05, 0.32, Math.PI / 2); part(g, Cy(0.03, 0.03, 0.2, 8), C.dark, -0.022, 0.05, 0.32, Math.PI / 2); part(g, B(0.08, 0.05, 0.14), '#6a4f34', 0, -0.03, 0.18); }
  if (G.kind === 'carbine' || G.kind === 'rifle' || G.kind === 'long') { part(g, Cy(0.018, 0.018, G.kind === 'long' ? 0.5 : 0.28, 6), C.dark, 0, 0.05, G.kind === 'long' ? 0.5 : 0.42, Math.PI / 2); part(g, B(0.06, 0.11, 0.06), C.dark, 0, -0.08, 0.06); }
  if (G.kind === 'rifle' || G.kind === 'long') { part(g, Cy(0.025, 0.025, 0.18, 8), C.dark, 0, 0.14, -0.02, Math.PI / 2); part(g, new THREE.CircleGeometry(0.022, 8), glow(acc), 0, 0.14, 0.071); part(g, B(0.07, 0.09, 0.2), C.gunBody, 0, 0.02, -0.3); }
  if (G.kind === 'hive') { E(g, '#c9a46a', 0, 0.05, 0.1, 0.06, 0.06, 0.18); for (let k = 0; k < 3; k++) part(g, new THREE.TorusGeometry(0.05, 0.01, 5, 10), '#8a5a2a', 0, 0.05, 0.02 + k * 0.08); }
  if (G.kind === 'plasma') { part(g, Cy(0.04, 0.03, 0.22, 8), C.gunBody, 0, 0.05, 0.36, Math.PI / 2); for (let k = 0; k < 3; k++) part(g, new THREE.TorusGeometry(0.045, 0.01, 5, 10), glow(acc), 0, 0.05, 0.28 + k * 0.06); }
  if (G.kind === 'rocket') { part(g, Cy(0.07, 0.07, 0.6, 10), '#5d636c', 0, 0.1, 0.1, Math.PI / 2); part(g, Cy(0.075, 0.075, 0.06, 10), toon(acc), 0, 0.1, 0.4, Math.PI / 2); part(g, B(0.04, 0.04, 0.08), C.dark, 0, 0.2, 0); }
  return g;
}

// ---------------- game controller (any standard gamepad) ----------------
const PAD = { prev: [], active: false, sprint: false };
window.addEventListener('gamepadconnected', () => { toast('CONTROLLER', 'Connected · A jump · X interact · RT fire · RB melee', 3.5); });
function pollPad(dt) {
  const pads = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null;
  for (const p of pads) if (p && p.connected) { gp = p; break; }
  if (!gp) { if (PAD.active) { PAD.active = false; move.x = move.y = 0; } return; }
  const b = (i) => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5)), was = (i) => !!PAD.prev[i], hit = (i) => b(i) && !was(i);
  const dz = (v) => Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82;
  const lx = dz(gp.axes[0] || 0), ly = dz(gp.axes[1] || 0), rx = dz(gp.axes[2] || 0), ry = dz(gp.axes[3] || 0);
  const any = lx || ly || rx || ry || gp.buttons.some(x => x.pressed);
  if (any) PAD.active = true;
  if (state === 'menu' || state === 'pause' || state === 'dead') {
    if (hit(0) || hit(9)) { const btn = $(state === 'menu' ? 'playBtn' : state === 'pause' ? 'resumeBtn' : 'respawnBtn'); if (btn) btn.click(); }
  } else if (dlgOpen) {
    const btns = [...$('dlg').querySelectorAll('button:not(:disabled)')];
    if (btns.length && (hit(12) || hit(13) || hit(14) || hit(15))) { let i = btns.indexOf(document.activeElement); i = (i + (hit(13) || hit(15) ? 1 : -1) + btns.length) % btns.length; if (i < 0) i = 0; btns[i].focus(); }
    if (hit(0)) { const f = btns.includes(document.activeElement) ? document.activeElement : $('dlgActs').querySelector('.go:not(:disabled)') || btns[btns.length - 1]; if (f) f.click(); }
    if (hit(1)) closeDlg();
  } else if (state === 'play') {
    if (lx || ly) { move.x = lx; move.y = -ly; PAD.moving = true; } else if (PAD.moving) { move.x = move.y = 0; PAD.moving = false; }
    if (rx || ry) look(rx * 900 * dt, ry * 600 * dt, 0.0035);
    if (b(7) !== was(7)) firing = b(7);
    if (hit(10)) PAD.sprint = true; if (!lx && !ly) PAD.sprint = false; const spr = PAD.sprint && Math.hypot(lx, ly) > 0.3; if (spr !== !!PAD.sprWas) { keys.ShiftLeft = spr; PAD.sprWas = spr; }
    if (b(0) !== was(0)) keys.Space = b(0); if (hit(0)) jump();
    if (hit(2)) { if (nearNpc) talk(nearNpc); else if (nearAct) nearAct.fn(); }
    if (hit(3)) reload(); if (hit(5) || hit(11)) swapHand(); if (b(6) !== was(6)) setBlock(b(6));
    if (hit(4)) openBag(); if (hit(8)) openQuestLog(); if (hit(9)) setState('pause'); if (hit(12)) setBuild(!baseState.on); if (hit(13)) recallToShip(); if (hit(14)) toggleBike(); if (hit(15)) throwOrd();
    if (baseState.on && hit(7)) placePiece();
  }
  PAD.prev = gp.buttons.map(x => x.pressed || x.value > 0.5);
}

function recallToShip() {
  if (state !== 'play' || dlgOpen) return;
  if (!shipUnlocked()) { log('You get your ship after beating Drome on Earth.'); return; }
  if (LEVEL.id === 'ship') { log('You are already aboard.'); return; }
  if (!player.alive) return;
  if (LEVEL.fly) { player.hp = player.groundHp != null ? player.groundHp : maxHpGround(); player.groundHp = null; }
  burst(player.pos.clone().add(V(0, 1, 0)), '#8fe3ff', 24, 5); travel('ship');
}

function unstuck() {
  if (state !== 'play' || dlgOpen) return;
  if (LEVEL.fly) { const P = SPACE_BODIES[S.orbit] || SPACE_BODIES.earth; player.pos.copy(P.pos).add(V(0, P.r + 80, P.r + 80)); fly.vel.set(0, 0, 0); log('Moved you clear of everything.'); return; }
  const sp = LEVEL.spawn; S.riding = false; player.pos.set(sp.x, floorAt(sp.x, sp.z) + 0.2, sp.z); player.vy = 0; player.yaw = sp.yaw != null ? sp.yaw : player.yaw;
  burst(player.pos.clone().add(V(0, 1, 0)), '#8fe3ff', 16, 4); SFX.zap(); log('Unstuck: moved you to the landing spot.');
}

