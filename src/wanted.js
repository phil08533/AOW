// =================== PHASE 5b: PLAYER BOUNTIES, HITS, SPACE RAIDS, THE PRESIDENT ===================
// Shared board: everyone's outlaw record rides along in their own leaders/<id> doc (ob = Marshal bounty,
// oh = hits they posted, oc = contracts they've collected), so every player reads the same board.
// Fights between players outside the arena: only between a contract holder and their target.
{ const _lr = lbRow; lbRow = function () { const d = _lr(); const O = outS(), now = Date.now();
  O.oh = O.oh.filter(h => now - h.t < 48 * 3600000); O.oc = O.oc.slice(-40);
  d.ob = isWanted() ? O.bounty : 0; d.obT = isWanted() ? (O.obT || 0) : 0; d.orp = O.rep; d.oh = O.oh.slice(-6); d.oc = O.oc; d.where = LEVEL ? LEVEL.id : 'earth'; return d; }; }
let outPushT = 0;
function outPush() { clearTimeout(outPushT); outPushT = setTimeout(() => { try { lbPush(true); } catch (_) {} }, 2500); }
async function outFetch(force) {
  if (!db) return OUTB.board; if (!force && Date.now() - OUTB.boardT < 45000) return OUTB.board;
  OUTB.boardT = Date.now();
  try { const snap = await db.collection('leaders').limit(500).get(); const docs = snap.docs.map(s => Object.assign({ id: s.id }, s.data())), now = Date.now();
    const claimed = new Set(); for (const d of docs) for (const c of (Array.isArray(d.oc) ? d.oc : [])) claimed.add(String(c));
    const nickOf = {}; for (const d of docs) nickOf[d.id] = String(d.nick || 'Trooper').slice(0, 16);
    const list = [];
    for (const d of docs) { if (!(now - (d.t || 0) < 7 * 86400000)) continue;
      if (typeof d.ob === 'number' && d.ob > 0) { const id = 'b:' + d.id + ':' + (d.obT || 0); if (!claimed.has(id)) list.push({ kind: 'bounty', id, to: d.id, nick: nickOf[d.id], amt: Math.round(d.ob), where: d.where, lvl: d.lvl || 1 }); }
      for (const h of (Array.isArray(d.oh) ? d.oh : [])) { if (!h || typeof h.to !== 'string' || !(h.amt > 0) || !(now - (h.t || 0) < 48 * 3600000)) continue; const id = 'h:' + String(h.id); if (claimed.has(id) || !nickOf[h.to]) continue;
        const T = docs.find(x => x.id === h.to); list.push({ kind: 'hit', id, to: h.to, nick: nickOf[h.to], amt: Math.round(Math.min(h.amt, 50000)), by: nickOf[d.id], byId: d.id, where: T && T.where, lvl: (T && T.lvl) || 1 }); } }
    OUTB.board = list; OUTB.people = docs.filter(d => now - (d.t || 0) < 7 * 86400000).map(d => ({ id: d.id, nick: nickOf[d.id], lvl: d.lvl || 1, where: d.where }));
    const O = outS(); if (O.hunt && !list.some(c => c.id === O.hunt.id)) { log(`Your contract on ${O.hunt.nick} is gone (someone else collected, or it was cleared).`); O.hunt = null; markDirty(); }
  } catch (err) { console.warn('board', err); }
  outHud(); return OUTB.board;
}
setInterval(() => { if (state === 'play' && db) outFetch(false); }, 60000);
const whereName = w => (LEVELS[w] && LEVELS[w].name) || 'somewhere';
function contractRows(rows, list, canTake, empty) {
  rows.textContent = ''; const O = outS();
  if (!list.length) { const e = document.createElement('div'); e.className = 'rowi nodot'; e.textContent = empty; rows.appendChild(e); return; }
  for (const c of list) { const r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = c.kind === 'hit' ? '#ff3b2a' : '#ffd36a';
    const nm = document.createElement('span'); nm.textContent = `${c.kind === 'hit' ? 'HIT' : 'BOUNTY'} · ${c.nick} (Lv ${c.lvl})${c.by ? ' · posted by ' + c.by : ''} · last seen on ${whereName(c.where)}`;
    const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = c.amt.toLocaleString() + ' cr';
    const mine = O.hunt && O.hunt.id === c.id, self = c.to === uid, b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px';
    b.textContent = self ? 'You' : mine ? 'Taken' : 'Take'; b.disabled = self || mine || !!O.hunt || !canTake;
    b.addEventListener('click', () => { O.hunt = { kind: c.kind, id: c.id, to: c.to, nick: c.nick, amt: c.amt }; markDirty(); outPush(); outHud(); SFX.quest(); toast('CONTRACT TAKEN', `${c.nick} · ${c.amt.toLocaleString()} cr`, 3); log(`You took the ${c.kind} on ${c.nick}. Find them (last seen on ${whereName(c.where)}). You can only fight each other while you hold it, and they can fight back.`, 'loot'); closeDlg(); });
    r.append(dot, nm, mt, b); rows.appendChild(r); }
}
// Marshal terminals: bounties on players, for clean hunters
async function openPlayerBounties(who) {
  openDlg('Galactic Marshals', who || 'Wanted players'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; $('dlgActs').before(rows);
  $('dlgLine').textContent = db ? 'Checking the wire…' : 'The player board needs you signed in to the game page.';
  acts([['NPC contracts', () => openBountyBoard(who)], ['Done', closeDlg, true]]); if (!db) return;
  await outFetch(true); if (!$('shopRows')) return; const can = !isOutlaw();
  $('dlgLine').textContent = can ? 'Players with a Marshal bounty. Take one, find them, beat them. While you hold it, you two can fight anywhere outside a city; they can fight back.' : "The Marshals don't hire outlaws. Lower your rep below 40 to take player bounties.";
  contractRows(rows, OUTB.board.filter(c => c.kind === 'bounty'), can, 'No player is Wanted right now.');
}
{ const _ob = openBountyBoard; openBountyBoard = function (who) { const r = _ob(who); const a = $('dlgActs'); if (a) { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Wanted players'; b.addEventListener('click', () => { SFX.ui(); openPlayerBounties(who); }); a.prepend(b); } return r; }; }
// the Hit board: outlaws post and take hits on players
const HIT_AMTS = [500, 1000, 2500, 5000];
async function openHitBoard() {
  openDlg('Underworld', 'Hit board'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; $('dlgActs').before(rows);
  $('dlgLine').textContent = db ? 'Reading the board…' : 'The Hit board needs you signed in to the game page.';
  acts([['Done', closeDlg, true]]); if (!db) return;
  await outFetch(true); if (!$('shopRows')) return; const can = isOutlaw();
  $('dlgLine').textContent = can ? 'Contracts on players, paid by outlaws. Take one and hunt them down, or post your own.' : 'Outlaws only. Get your rep to 40 (Outlaw) to post or take hits.';
  contractRows(rows, OUTB.board.filter(c => c.kind === 'hit'), can, 'No open hits. Post one?');
  acts([['Post a hit', () => openPostHit(), false, !can], ['Done', closeDlg, true]]);
}
function openPostHit() {
  openDlg('Underworld', 'Post a hit'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; $('dlgActs').before(rows);
  const people = (OUTB.people || []).filter(p => p.id !== uid).sort((a, b) => b.lvl - a.lvl).slice(0, 30); let amt = HIT_AMTS[0];
  const render = () => { rows.textContent = ''; $('dlgLine').textContent = `Pick a target. The ${amt.toLocaleString()} cr is paid now and goes to whoever collects. You have ${S.cr.toLocaleString()} cr.`;
    const pick = document.createElement('div'); pick.className = 'rowi nodot'; for (const a of HIT_AMTS) { const b = document.createElement('button'); b.className = 'pbtn' + (a === amt ? ' go' : ''); b.style.padding = '4px 8px'; b.textContent = a.toLocaleString() + ' cr'; b.addEventListener('click', () => { amt = a; render(); }); pick.appendChild(b); } rows.appendChild(pick);
    if (!people.length) { const e = document.createElement('div'); e.className = 'rowi nodot'; e.textContent = 'No other players on record yet.'; rows.appendChild(e); }
    for (const p of people) { const r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = '#ff3b2a'; const nm = document.createElement('span'); nm.textContent = `${p.nick} · Lv ${p.lvl} · ${whereName(p.where)}`;
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Post'; b.disabled = S.cr < amt;
      b.addEventListener('click', () => { if (S.cr < amt) return; const O = outS(); S.cr -= amt; O.oh.push({ id: (uid || 'me').slice(-6) + Date.now().toString(36), to: p.id, amt, t: Date.now() }); crime(5, `Put a hit on ${p.nick}`); SFX.coin(); toast('HIT POSTED', `${p.nick} · ${amt.toLocaleString()} cr`, 3); OUTB.boardT = 0; markDirty(); outPush(); closeDlg(); });
      r.append(dot, nm, b); rows.appendChild(r); } };
  acts([['Back', () => openHitBoard()], ['Done', closeDlg, true]]); render();
}

// ---- fights between contract holders and their targets ----
const outSafe = p => SAFES.some(s => s.r < 100 && Math.hypot(p.x - s.x, p.z - s.z) < s.r);
function canFight(r) { const O = outS(); if (!r || !r.wu || LEVEL.id === 'arena' || LEVEL.fly) return false; if (outSafe(player.pos) || outSafe(r.obj.position)) return false;
  return (O.hunt && r.wu === O.hunt.to) || (r.hn && r.hn === uid); }
{ const _ps = pvpShoot; pvpShoot = function (o, dir, dmg, maxT) {
  if (LEVEL && LEVEL.id === 'arena') return _ps(o, dir, dmg, maxT);
  let best = null, bt = maxT; for (const r of remotes.values()) { if (!r.peerId || !canFight(r)) continue; const b = r.obj.position; for (const f of [0.6, 1.2, 1.7]) { const t = raySphere(o, dir, tmp.set(b.x, b.y + f, b.z), 0.45); if (t > 0 && t < bt) { bt = t; best = r; } } }
  if (best) { pvpOut.push([best.peerId, Math.round(dmg * 0.5), ++pvpSeq]); while (pvpOut.length > 8) pvpOut.shift(); burst(best.obj.position.clone().add(V(0, 1.3, 0)), '#ff3b2a', 8, 4); hitmark(false); SFX.hit(); sendPresence(true); }
  return best ? bt : null; }; }
{ const _pw = pvpWrite; pvpWrite = function (p) { _pw(p); const O = outS(); if (uid) p.wu = uid; if (isWanted() && O.bounty) p.wb = O.bounty; if (O.hunt) p.hn = O.hunt.to;
  if (LEVEL && LEVEL.id !== 'arena') { if (pvpOut.length) p.hx = pvpOut.slice(); if (koOut.length) p.ko = koOut.slice(); } }; }
{ const _pr = pvpRead; pvpRead = function (peerId, pr, r) {
  r.wu = typeof pr.wu === 'string' ? pr.wu : null; r.hn = typeof pr.hn === 'string' ? pr.hn : null; r.wb = Number(pr.wb) || 0;
  if (LEVEL && LEVEL.id === 'arena') return _pr(peerId, pr, r);
  if (!myPeer) return; const seen = pvpSeen.get(peerId) || { hit: 0, ko: 0 }, O = outS();
  if (Array.isArray(pr.hx)) for (const h of pr.hx) { if (!Array.isArray(h) || h[0] !== myPeer || !(h[2] > seen.hit)) continue; seen.hit = h[2]; if (!canFight(r)) continue; const d = clamp(Number(h[1]) || 0, 0, 200); if (player.alive) { player.pvpBy = r.nick; player.pvpPeer = peerId; player.pvpT = gameTime; hurt(d); } }
  if (Array.isArray(pr.ko)) for (const k of pr.ko) { if (!Array.isArray(k) || k[0] !== myPeer || !(k[1] > seen.ko)) continue; seen.ko = k[1];
    if (O.hunt && r.wu === O.hunt.to) { const c = O.hunt; S.cr += c.amt; O.oc.push(c.id); O.hunt = null; toast('CONTRACT COLLECTED', `${c.nick} · +${c.amt.toLocaleString()} cr`, 4); SFX.level(); log(`You collected the ${c.kind} on ${c.nick}: +${c.amt.toLocaleString()} cr.`, 'loot'); if (c.kind === 'bounty') goodDeed(10); else crime(10, 'Collected a hit'); gainXp(300 + S.lvl * 15); markDirty(); outPush(); outHud(); }
    else if (r.hn === uid) { toast('HUNTER BEATEN', `You fought off ${r.nick}`, 3); SFX.quest(); gainXp(200 + S.lvl * 10); } }
  pvpSeen.set(peerId, seen); }; }
function outlawOnDeath() {
  const O = outS();
  if (player.pvpBy && gameTime - (player.pvpT || 0) < 12 && player.pvpPeer) { koOut.push([player.pvpPeer, ++pvpSeq]); while (koOut.length > 4) koOut.shift(); sendPresence(true); }
  const byHunters = enemies.some(e => !e.dead && e.def === ENEMY.mhunter && e.obj.position.distanceTo(player.pos) < 35);
  if ((player.pvpBy && gameTime - (player.pvpT || 0) < 12) || byHunters) { if (isWanted() && O.bounty) { O.bounty = 0; O.obT = 0; O.rep = Math.min(O.rep, 60); O.crimeT = Date.now(); log(byHunters ? 'The Marshal hunters got you. Your bounty is collected and your rep drops to Outlaw.' : `${player.pvpBy} collected your bounty. Your rep drops to Outlaw.`, 'loot'); markDirty(); outPush(); } }
  player.pvpBy = null; player.pvpPeer = null; outHud();
}
// show WANTED and TARGET on other players' name plates
{ const _sp = syncPeers; syncPeers = function (peers) { _sp(peers); const O = outS(); for (const r of remotes.values()) { const tgt = O.hunt && r.wu === O.hunt.to, hunter = r.hn && r.hn === uid, key = `${r.nick}|${r.lvl}|${r.wb}|${tgt}|${hunter}`; if (r._outKey === key || !r.nick) continue; r._outKey = key;
  if (tgt || hunter || r.wb) drawPlate(r.plate, r.nick, tgt ? `TARGET · ${O.hunt.amt.toLocaleString()} cr` : hunter ? 'HUNTING YOU' : `WANTED · ${r.wb.toLocaleString()} cr`, tgt || hunter ? '#ff6a5a' : '#ffd36a', null); else drawPlate(r.plate, r.nick, 'Lv ' + r.lvl, '#7fd6ff', null); } }; }
// the compass points at your target
{ const _qt = questTarget; questTarget = function () { const O = outS(); if (O.hunt) { for (const r of remotes.values()) if (r.wu === O.hunt.to) return { p: r.obj.position, label: `Hunt ${O.hunt.nick}` }; } return _qt(); }; }

// ---- raiding merchant haulers in space, and Marshal patrols when you're Wanted ----
HULK_TYPES.trader = { name: 'Merchant Hauler', hull: '#c9c4bc', trim: '#4fa8ff', light: '#4fd2ff', wall: '#5d636c', floor: '#3a3d44', neon: '#4fd2ff', crew: () => ['secguard'], boss: () => 'secguard', line: 'A merchant guild hauler, heavy with cargo. Peaceful. Robbing it is a crime.' };
{ const _fw = freshWrecks; freshWrecks = function () { _fw(); const W = BOARD.wrecks || []; let n = 0; for (const w of W) { if (n >= 2) break; if (w.type === 'derelict' || w.type === 'hive') { w.type = 'trader'; n++; } } }; }
{ const _bp = boardPrompt; boardPrompt = function (W) { if (W.type !== 'trader') return _bp(W); const T = HULK_TYPES.trader; openDlg('Sensors', T.name);
  $('dlgLine').textContent = `${T.line} Security level ${W.lv}. Raiding it raises your outlaw rep a lot${isWanted() ? '' : ', and could make you Wanted'}.`;
  acts([['Raid it', () => { closeDlg(); crime(25, 'Raided a merchant hauler'); boardShipW(W); }, true], ['Fly on', closeDlg]]); }; }
{ const _bl = boardLoot; boardLoot = function (C) { const r = _bl(C); if (C.type === 'trader') { const got = []; for (let i = 0, n = 2 + randi(0, 2); i < n; i++) { const k = CONTRA[randi(0, CONTRA.length - 1)]; S.inv[k] = (S.inv[k] || 0) + 1; got.push(ITEMS[k].name); } const cr = 400 + C.lv * 40; S.cr += cr; log(`The hauler's hold: ${cr} cr and ${got.join(', ')} (contraband: sell it to a Fence).`, 'loot'); markDirty(); } return r; }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'space' && isWanted()) setTimeout(() => { if (!LEVEL || LEVEL.id !== 'space' || !fly || !isWanted()) return;
  const n = Math.min(4, 2 + Math.floor(outS().bounty / 3000)); for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, p = player.pos.clone().add(V(Math.cos(a) * 320, rand(-40, 40), Math.sin(a) * 320)); const R = spawnRaider(p, Math.max(8, S.lvl + 1)); R.marshal = true; R.aggro = true; R.def = { name: 'Marshal Patrol' }; drawPlate(R.plate, 'Marshal Patrol', 'Lv ' + R.lv, '#4fa8ff', null); }
  toast('MARSHAL PATROL', 'They know your ship. Fight or outrun them.', 3); SFX.hit(); }, 15000); return r; }; }
{ const _kr = killRaider; killRaider = function (R) { const r = _kr(R); if (R.marshal) crime(10, 'Shot down a Marshal patrol'); return r; }; }

// ---- the President storyline: the Undercroft and the Senate Archive on the Zeltac ----
Object.assign(ZTHEMES, { under: { name: 'The Undercroft', col: '#5a2a7a', floor: '#1e1a22', neon: '#c86aff', safe: true }, archive: { name: 'Senate Archive', col: '#3a4a7a', floor: '#2a2e3a', neon: '#ffd36a', safe: false } });
Object.assign(ENEMY, {
  presguard: { rig: 'trooper', name: 'Presidential Guard', make: () => recolor(makeTrooper(), { '#6f7a3e': '#1e2a4a', '#4a5229': '#141c30', '#c9b27c': '#e8e4dc' }), hp: 260, speed: 2.6, r: 0.45, hy: 0.95, xp: 140, cr: [40, 80], ranged: { dmg: 16, rate: 1.1, speed: 18, col: '#ffd36a', range: 22, keep: 9 }, drops: [['treasuryledger', 0.4], ['credsticks', 0.2]] },
  starling: { rig: 'civ', name: 'President Starling · Power Suit', make: () => { const g = makePrez(); part(g, B(0.9, 0.7, 0.55), toon('#c9a43a'), 0, 1.25, 0); part(g, B(0.3, 0.2, 0.6), glow('#ffd36a'), 0, 1.3, -0.3); return g; }, scale: 1.5, hp: 14000, speed: 2.4, r: 0.6, hy: 1.0, xp: 30000, cr: [4000, 6000], boss: true,
    ranged: { dmg: 26, rate: 0.8, speed: 20, col: '#ffd36a', range: 26, keep: 9 }, melee: { dmg: 45, rate: 1.4, reach: 2.6 }, drops: [['credsticks', 1], ['lootedrelic', 1]] },
});
{ const _zn = zNpcs; zNpcs = function (n, th) {
  if (th === 'under') return [{ id: 'mole', name: 'The Mole', role: 'Informant · knows everything', rig: 'civ', make: () => makeCivilian('#2a2430', '#1e1c22', '#9fe8ff', '#5d636c', '#c86aff'), x: -8, z: -10, face: 0.5, idle: ["Every secret on this ship passes through the Undercroft. Most of them twice.", "Want to know who really paid for Drome's war? So do I. So does everyone. I know, though."] },
    { id: 'fence2', name: 'Sly Marlo\'s Cousin', role: 'The Fence · Zeltac branch', rig: 'civ', make: () => makeCivilian('#3a2a4a', '#1e1c22', '#8a5a3a', '#1e1c22', '#c86aff'), x: 8, z: -10, face: -0.5, custom: [['Sell', () => openFence('The Fence', 'Marlo\'s Cousin', 'Same deal as the basements. Contraband at full price.', 1.0)], ['Black market', () => openBlackMarket("Marlo's Cousin")]], idle: ["Family business. The family is mostly crimes."] }];
  if (th === 'archive') return [];
  return _zn(n, th); }; }
{ const _zs = zSpawns; zSpawns = function (n, th) {
  if (th === 'archive') { const lv = [34, 38], list = [{ zone: 'deck', type: 'presguard', n: 7, lv }]; if (qState('o4') && qState('o4').st === 'active') list.push({ zone: 'deck', type: 'starling', n: 1, lv: [40, 40], at: [0, -20], once: true }); return list; }
  if (th === 'under') return [];
  return _zs(n, th); }; }
{ const _zb = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _zb.call(this); const th = zTheme(ZF.floor);
  if (th === 'under') {
    for (let i = 0; i < 10; i++) { const x = -24 + (i % 5) * 12, z = i < 5 ? -18 : 14; part(props, B(1.2, 1.2, 1.2), toon('#3a2e26'), x, 0.6, z, 0, i); box(x, z, 0.6, 0.6); }
    part(props, B(10, 1.1, 1.4), toon('#2a1e2a'), 0, 0.55, -16); box(0, -16, 5, 0.7); const sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.2), new THREE.MeshBasicMaterial({ map: signTex('THE UNDERCROFT', '#1a0a20', '#c86aff') })); sg.position.set(0, 4.2, -27.6); props.add(sg);
    part(props, B(3, 1.8, 0.1), toon('#1e1c22'), -14, 1.6, -27.5); INTERACTS.push({ x: -14, z: -25.5, r: 2.4, label: 'Hit board (contracts on players)', fn: () => openHitBoard() });
    for (const [x, z, c] of [[-10, -10, 0xc86aff], [10, -10, 0xff6aa8], [0, 8, 0xc86aff]]) { const l = new THREE.PointLight(c, 1.0, 22); l.position.set(x, 5, z); levelGroup.add(l); }
  }
  if (th === 'archive') {
    for (let i = 0; i < 12; i++) { const x = -24 + (i % 6) * 9.6, z = i < 6 ? -10 : 6; part(props, B(1.2, 4.5, 6), toon('#5a4a3a', 'wood'), x, 2.25, z); for (let k = 0; k < 4; k++) part(props, B(1.25, 0.08, 6), toon('#3a2e26'), x, 0.6 + k * 1.1, z); box(x, z, 0.6, 3); }
    part(props, B(6, 1.0, 2.4), toon('#3a4a7a'), 0, 0.5, -22); part(props, B(6.2, 0.06, 2.6), toon('#c9a43a'), 0, 1.02, -22); box(0, -22, 3, 1.2);
    const seal = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), glow('#c9a43a')); seal.position.set(0, 4, -27.6); props.add(seal);
  } }; }
// insert the two new floors before the Captain's Bridge
NPC_HOME.mole = 'zeltac'; NPC_HOME.fence = 'underworld';
defQuest('o1', { ch: 'Underworld · The President', title: 'Word in the Undercroft', giver: 'mole', turnIn: 'fence', req: ['q5'], main: true,
  intro: ["You're the one who killed Drome. Then you'll want to hear this.", "Drome's war chest was paid in New United States treasury credsticks. Somebody in the government bankrolled him.", "The Fence, Sly Marlo, launders half the credits in the galaxy. Every planet has a hatch on the outskirts that leads to his basement. Ask him."],
  obj: [{ kind: 'reach', zone: 'den', planet: 'underworld', n: 1, text: 'Find a hatch on any planet and visit the underworld basement' }],
  outro: ["The Mole sent you? Fine. Yes, I washed those credits. Treasury sticks, all signed from one office.", "The paper trail lives in the Senate Archive, two floors under the Captain's Bridge on the Zeltac. Heavily guarded. Good luck."], reward: { cr: 800, xp: 2500 } });
defQuest('o2', { ch: 'Underworld · The President', title: 'The Senate Archive', giver: 'fence', turnIn: 'mole', req: ['o1'], main: true,
  intro: ["The Presidential Guard carries the Treasury Ledger between the stacks. Take it off one of them.", "Bring it to the Mole. He'll know what to do with it."],
  obj: [{ kind: 'item', t: 'treasuryledger', n: 1, text: 'Take the Treasury Ledger from the Presidential Guard (Zeltac elevator · Senate Archive)', planet: 'zeltac' }],
  outro: ["Let me see... payments to Drome, every month, for three years. Each one signed D. Starling.", "The President. The man dancing in the Starlight Lounge right now. He paid Drome to burn Earth so his friends could sell the rebuilding contracts.", "This needs a Marshal. Take it to Rook."], reward: { cr: 1500, xp: 5000 } });
defQuest('o3', { ch: 'Underworld · The President', title: 'Follow the Money', giver: 'mole', turnIn: 'rook', req: ['o2'], main: true,
  intro: ["Marshal Rook is the only Marshal Starling never bought. He's in the Zeltac Plaza."],
  obj: [{ kind: 'item', t: 'treasuryledger', n: 1, text: 'Bring the Treasury Ledger to Marshal Rook (Zeltac Plaza)', planet: 'zeltac' }],
  outro: ["...Signed by Duke Starling himself. I always knew he was rotten. I didn't know he was this rotten.", "I can't arrest a sitting president. But the Senate Archive is his. He's hiding in there in a power suit, waiting for this to blow over.", "Go in there and end it."], reward: { cr: 2000, xp: 6000, take: { treasuryledger: 1 } } });
defQuest('o4', { ch: 'Underworld · The President', title: "Party's Over", giver: 'rook', turnIn: 'rook', req: ['o3'], main: true,
  intro: ["Starling is in the Senate Archive in a gold power suit. He's armed, and he's not going quietly.", "Take him down. The galaxy deserves to know."],
  obj: [{ kind: 'kill', t: 'starling', n: 1, text: 'Defeat President Starling in the Senate Archive (Zeltac elevator)', planet: 'zeltac' }],
  outro: ["It's done. The ledger goes to every newsfeed in the galaxy tonight.", "Starling will spend the rest of his life explaining himself to the Senate. Somehow I think he'll still find a party.", "You did good. The Marshals owe you one."], reward: { cr: 10000, xp: 20000, fn: () => { S.flags = S.flags || {}; S.flags.marshalArmor = true; log('Marshal reward: Marshal Armor and Cape (Wardrobe).', 'loot'); } } });
