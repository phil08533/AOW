// =================== BOUNTY HUNTING for the Galactic Marshals ===================
// Random contracts: a named outlaw on a planet you've unlocked (or a raider ace in space). Kill them,
// and the Marshals wire the credits straight to your bank account. Bounties level your Hunter Rank,
// and every rank unlocks gear.
const BH_RANKS = [
  { name: 'Rookie', xp: 0 }, { name: 'Tracker', xp: 300, gift: 'hvisor' }, { name: 'Hunter', xp: 900, gift: 'bh30' }, { name: 'Veteran', xp: 2000, gift: 'marshalArmor' },
  { name: 'Marshal-for-hire', xp: 3800, gift: 'bsaber' }, { name: 'Ace', xp: 6500, gift: 'hull' }, { name: 'Headhunter', xp: 10000, gift: 'gboots' },
  { name: 'Nightmare', xp: 15000, gift: 'bh60' }, { name: 'Legend', xp: 22000, gift: 'legendCape' }, { name: 'The Last Marshal', xp: 32000, gift: 'title' }
];
const BH_TIERS = { C: { mult: 1, hp: 3, lv: 0, rank: 0, col: '#9aa1aa' }, B: { mult: 1.9, hp: 5, lv: 2, rank: 1, col: '#6fdc5a' }, A: { mult: 3.2, hp: 8, lv: 4, rank: 3, col: '#4fa8ff' }, S: { mult: 5.5, hp: 12, lv: 6, rank: 5, col: '#ffd36a' } };
GEAR.hvisor = { name: "Hunter's Visor", desc: '+20% damage to bosses, elites and bounties', col: '#ff6a1a' };
GEAR.gboots = { name: 'Grav Boots', desc: '+15% run speed', col: '#9fe8ff' };
GUNS.bh30 = { name: 'Marshal Repeater', dmg: 55, rate: 0.09, mag: 40, reload: 1.3, req: 12, price: 0, col: '#ffd36a', kind: 'carbine' };
GUNS.bh60 = { name: 'Lvl 60 Judgement Cannon', dmg: 520, splash: 4.5, rate: 0.85, mag: 8, reload: 2.0, req: 25, price: 0, col: '#ff3b2a', kind: 'plasma' };
MELEE.bsaber = { name: 'Marshal Saber', dmg: 520, rate: 0.42, reach: 3.2, req: 1, price: 0, saber: true };
ARMORS.marshal = { name: 'Marshal Armor', lvl: 1, flag: 'marshalArmor', def: 0.2, trim: '#c9a43a', visor: '#ffd36a' };
CAPES.marshal = { name: "Marshal's Cape", lvl: 1, flag: 'marshalArmor', col: '#2a3a7a', trim: '#ffd36a' };
CAPES.legend = { name: 'Legend Cape', lvl: 1, flag: 'legendCape', col: '#1e1c22', trim: '#ff3b2a' };
const BH_FIRST = ['Vex', 'Krall', 'Mora', 'Dax', 'Sil', 'Grub', 'Zenna', 'Orrin', 'Tib', 'Quell', 'Rusk', 'Nyx', 'Bolo', 'Jett', 'Hask', 'Vira'];
const BH_LAST = ['Kalgar', 'Drenn', 'Moss', 'Vantablack', 'Sixfingers', 'Ironteeth', 'Brightside', 'Gloom', 'Thorne', 'McSpleen', 'Zarr', 'Hollow'];
const BH_TITLES = ['the Butcher', 'the Unwashed', 'Two-Guns', 'the Tax Dodger', 'the Kind of Mean', 'the Bridge Thief', 'the Space Pirate', 'the Ex-Mayor', 'the Bad Neighbor', 'Never Pays Tips', 'the Moon Smuggler', 'the Very Wanted'];
const BH_CRIMES = ['stole a cargo hauler full of soup', 'blew up a moon bank', 'jaywalked across three star systems', 'smuggled angry bees', 'robbed the Zeltac casino', 'sold fake maps of Mezar', 'took a Corps officer hostage', 'ran an illegal ant-fighting ring', 'parked a warship in a no-warship zone', 'kidnapped a prize snorfal'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function bhState() { S.bh = S.bh || { xp: 0, rank: 0, board: [], boardT: 0, active: null, done: 0 }; return S.bh; }
function bhRankIdx() { const B = bhState(); let r = 0; BH_RANKS.forEach((k, i) => { if (B.xp >= k.xp) r = i; }); return r; }
function genBounty() {
  const B = bhState(), rank = bhRankIdx(), tiers = Object.keys(BH_TIERS).filter(k => BH_TIERS[k].rank <= rank), tier = pick(tiers), T = BH_TIERS[tier];
  const planets = ['earth', 'mezar', 'capitone', 'robot', 'ocean'].filter(p => LEVELS[p] && planetOpen(p) && p !== 'earth' || (p === 'earth')), space = shipUnlocked() && Math.random() < 0.22;
  const name = `${pick(BH_FIRST)} "${pick(BH_TITLES)}" ${pick(BH_LAST)}`;
  if (space) { const lv = Math.max(8, S.lvl + T.lv); return { id: 'b' + Date.now() + randi(0, 999), name, tier, planet: 'space', zone: null, type: 'raider', lv, crime: pick(BH_CRIMES), reward: Math.round((260 + lv * 45) * T.mult), xp: Math.round((120 + lv * 12) * T.mult) }; }
  const pl = pick(planets), L = LEVELS[pl];
  const sps = L.spawns.filter(s => { const d = ENEMY[s.type]; return d && !d.boss && !d.elite && !s.at; });
  if (!sps.length) return null;
  const sp = pick(sps), lv = Math.max(sp.lv[1], S.lvl) + T.lv;
  return { id: 'b' + Date.now() + randi(0, 999), name, tier, planet: pl, zone: sp.zone, type: sp.type, lv, crime: pick(BH_CRIMES), reward: Math.round((200 + lv * 40) * T.mult), xp: Math.round((100 + lv * 10) * T.mult) };
}
function refreshBoard(force) {
  const B = bhState();
  if (force || !B.board.length || Date.now() - (B.boardT || 0) > 15 * 60000) { B.board = []; for (let i = 0; i < 4; i++) { const b = genBounty(); if (b) B.board.push(b); } B.boardT = Date.now(); markDirty(); }
}
function openBountyBoard(who) {
  refreshBoard(); const B = bhState(), rk = bhRankIdx(), next = BH_RANKS[rk + 1];
  openDlg('Galactic Marshals', who || 'Bounty board');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    rows.textContent = '';
    $('dlgLine').textContent = `Hunter Rank ${rk + 1}: ${BH_RANKS[rk].name} · ${B.xp} bounty XP${next ? ` (next rank at ${next.xp})` : ''} · ${B.done || 0} bounties closed. Rewards are wired straight to your bank.`;
    if (B.active) { const a = B.active, r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = BH_TIERS[a.tier].col;
      const nm = document.createElement('span'); nm.textContent = `ACTIVE · ${a.name}, who ${a.crime}. ${a.planet === 'space' ? 'Hiding in open space (look for the WANTED raider)' : `${LEVELS[a.planet].name} · ${Z[a.zone] && LEVEL.id === a.planet ? Z[a.zone].name : (LEVELS[a.planet].zones.find(z => z.id === a.zone) || {}).name}`}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = `${a.reward} cr`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Drop'; b.addEventListener('click', () => { B.active = null; if (S.track === 'bounty') S.track = null; markDirty(); renderQuest(); render(); });
      r.append(dot, nm, mt, b); rows.appendChild(r); }
    B.board.forEach((c, i) => { const r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = BH_TIERS[c.tier].col;
      const nm = document.createElement('span'); nm.textContent = `[${c.tier}] ${c.name} · ${c.crime} · ${c.planet === 'space' ? 'Open space' : LEVELS[c.planet].name} · Lv ${c.lv}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = `${c.reward} cr · ${c.xp} xp`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Accept'; b.disabled = !!B.active;
      b.addEventListener('click', () => { B.active = c; B.board.splice(i, 1); S.track = 'bounty'; markDirty(); SFX.quest(); toast('BOUNTY ACCEPTED', c.name, 3); log(`Bounty: find ${c.name} ${c.planet === 'space' ? 'in open space' : 'on ' + LEVELS[c.planet].name}. The compass will lead you.`, 'loot'); renderQuest(); if (LEVEL.id === c.planet) spawnBounty(); if (LEVEL.fly && c.planet === 'space') spawnSpaceBounty(); render(); });
      r.append(dot, nm, mt, b); rows.appendChild(r); });
  };
  $('dlgActs').before(rows); acts([['New contracts (100 cr)', () => { if (S.cr < 100) return; S.cr -= 100; refreshBoard(true); SFX.coin(); render(); }, false, S.cr < 100], ['Done', closeDlg]]); render();
}
let bountyEnemy = null;
function spawnBounty() {
  const B = bhState(), a = B.active; bountyEnemy = null;
  if (!a || a.planet !== LEVEL.id || !Z[a.zone] || !ENEMY[a.type]) return;
  const base = ENEMY[a.type], T = BH_TIERS[a.tier];
  ENEMY.__bounty = Object.assign({}, base, { name: 'WANTED · ' + a.name.replace(/".*?"\s*/, ''), elite: true, hp: base.hp * T.hp, scale: (base.scale || 1) * 1.3, xp: base.xp * 3, drops: [['crystal', 0.6], ['circuit', 0.6]] });
  bountyEnemy = makeEnemy({ zone: a.zone, type: '__bounty', n: 1, lv: [a.lv, a.lv], once: true, bounty: true });
  for (let i = 0; i < 1 + Object.keys(BH_TIERS).indexOf(a.tier); i++) { const m = makeEnemy({ zone: a.zone, type: a.type, n: 1, lv: [a.lv - 1, a.lv], once: true }); m.obj.position.copy(bountyEnemy.obj.position).add(V(rand(-3, 3), 0, rand(-3, 3))); }
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.6, 20).rotateX(-Math.PI / 2), glow('#ffd36a')); halo.position.y = 0.1; bountyEnemy.obj.add(halo);
}
function spawnSpaceBounty() {
  const B = bhState(), a = B.active; if (!a || a.planet !== 'space' || !fly) return;
  const ang = Math.random() * Math.PI * 2, p = V(Math.cos(ang) * 700, rand(-80, 80), Math.sin(ang) * 700);
  const r = spawnRaider(p, a.lv); r.max *= BH_TIERS[a.tier].hp; r.hp = r.max; r.bounty = true; r.def = { name: 'WANTED · ' + a.name };
  r.obj.scale.setScalar(1.6); drawPlate(r.plate, 'WANTED', a.name.replace(/".*?"\s*/, ''), '#ffd36a', null); bountyEnemy = r;
  for (let i = 0; i < 2; i++) spawnRaider(p.clone().add(V(rand(-30, 30), rand(-10, 10), rand(-30, 30))), a.lv - 1);
}
function bountyDone() {
  const B = bhState(), a = B.active; if (!a) return;
  const before = bhRankIdx();
  S.bank += a.reward; B.xp += a.xp; B.done = (B.done || 0) + 1; B.active = null; bountyEnemy = null; if (S.track === 'bounty') S.track = null;
  gainXp(a.xp * 2);
  toast('BOUNTY CLOSED', `+${a.reward} cr wired to your bank`, 5); SFX.level(); log(`The Galactic Marshals deposited ${a.reward} cr into your bank. +${a.xp} bounty XP.`, 'loot');
  const after = bhRankIdx(); for (let r = before + 1; r <= after; r++) rankUp(r);
  setTimeout(() => burp('boss'), 1500); markDirty(); renderQuest();
}
function rankUp(r) {
  const R = BH_RANKS[r]; toast(`HUNTER RANK ${r + 1}`, R.name, 5); SFX.quest();
  S.flags = S.flags || {}; const g = R.gift;
  if (g === 'hvisor' || g === 'gboots') { if (!hasGear(g)) S.gear.push(g); log(`Marshal reward: ${GEAR[g].name} (${GEAR[g].desc})`, 'loot'); }
  if (g === 'bh30' || g === 'bh60') { if (!S.guns.includes(g)) S.guns.push(g); log(`Marshal reward: ${GUNS[g].name}`, 'loot'); }
  if (g === 'bsaber') { S.melees = S.melees || ['knife']; if (!S.melees.includes(g)) S.melees.push(g); log('Marshal reward: the Marshal Saber (open the Saber mod station on your ship to style it)', 'loot'); }
  if (g === 'marshalArmor' || g === 'legendCape') { S.flags[g] = true; log(`Marshal reward: ${g === 'marshalArmor' ? 'Marshal Armor and Marshal Cape' : 'the Legend Cape'} (Wardrobe)`, 'loot'); }
  if (g === 'hull') { S.ship.sys = S.ship.sys || {}; S.ship.sys.hull = Math.min(3, (S.ship.sys.hull || 0) + 1); log('Marshal reward: free hull upgrade for your ship', 'loot'); }
  if (g === 'title') log('You are The Last Marshal. Every outlaw in the galaxy knows your name.', 'loot');
  markDirty();
}
// on loading a level, place an active bounty there
function bountyOnLoad() { bountyEnemy = null; if (LEVEL && LEVEL.id === (bhState().active || {}).planet) spawnBounty(); if (LEVEL && LEVEL.fly) spawnSpaceBounty(); }
// bridge terminal + saber mod station on your ship
{ const orig = LEVELS.ship.build;
  LEVELS.ship.build = function () { orig.call(this);
    part(props, B(1.3, 1.1, 0.6), '#3a3d44', 5, 0.55, -10); part(props, B(1.1, 0.6, 0.05), glow('#ffd36a'), 5, 1.3, -9.68, -0.3); box(5, -10, 0.65, 0.3);
    INTERACTS.push({ x: 5, z: -9.2, r: 2, label: 'Bounty terminal (Galactic Marshals)', fn: () => openBountyBoard('Ship terminal') });
    const st = new THREE.Group(); part(st, Cy(0.5, 0.6, 0.9, 8), '#3a3d44', 0, 0.45, 0); part(st, Cy(0.55, 0.55, 0.04, 16), glow('#4fa8ff'), 0, 0.92, 0);
    const holo = makeSaberModel(saberCfg()); holo.scale.setScalar(1.4); holo.position.set(0, 1.6, 0); holo.rotation.z = 0.3; st.add(holo); st.position.set(5, 0, -4.5); levelGroup.add(st); solid(5, -4.5, 0.6);
    levelAnims.push(t => { holo.rotation.y = t * 0.8; holo.position.y = 1.6 + Math.sin(t * 1.5) * 0.05; });
    INTERACTS.push({ x: 5, z: -3.6, r: 2, label: 'Saber mod station', fn: () => openSaberForge() });
  };
}
// Marshal Rook on the Zeltac
LEVELS.zeltac.npcs.push({ id: 'rook', name: 'Marshal Rook', role: 'Galactic Marshals · bounties', rig: 'trooper', make: () => makePlayerChar({ a: 'marshal', c: 'marshal', h: 'visor' }, '#2a3a7a'), x: 0, z: 6, face: Math.PI, marshal: true,
  idle: ["The law out here is me, a badge, and whoever I'm paying this week. Want to be paid this week?", "Bounties pay to your bank. Cleaner that way. Fewer people carrying sacks of credits into firefights."] });
IDLE.rook = LEVELS.zeltac.npcs.find(n => n.id === 'rook').idle;
