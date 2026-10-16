// =================== POLISH: world lore, arrival title cards, controls help, photo mode, hotkeys ===================
const LORE = {
  earth: ['Earth · New Jamestown', 'Humanity\'s last capital sits inside a walled Safe Zone on the river. Outside the walls the wilds have turned: wild dogs, rogue bugs and rogue robots, all pushed by something that wants the planet empty. Captain Vega holds the gate. The sun over Earth has been setting red for a long time now.'],
  ship: ['The Setting Sun', 'Your ship. A battered military transport with a bridge, armory, med bay, hydro garden, trophy hall and a bar nobody admits to building. Its AI, B.U.R.P., was installed as a punishment, though nobody can say whose.'],
  space: ['Open space', 'The lanes between worlds. Debris fields hide salvage crates full of ship parts and paint, and Drome\'s fighters patrol the routes between his holdings.'],
  mezar: ['Mezar', 'A ringed desert world. Bug City rises out of the sand like a beehive tower, ruled by the Bug Master. Out in the Sand Dome Desert there is no law: anyone can attack anyone, and the dunes keep what they bury.'],
  capitone: ['Capitone', 'A frozen forest world of giant trees and ice. The Mountain of the Lost, the Forgotten Forest and the Volcano Base all sit under a sky that never fully warms. The Frost King claims all of it.'],
  zeltac: ['The Zeltac Ship', 'A city that flies. Nine decks stacked inside one enormous hull: a plaza, a market, homes, hydroponics, a bar, a neon arcade, the engine deck, the alien quarter and the bridge. Everyone in the galaxy passes through here sooner or later.'],
  robot: ['Robot City', 'The machine metropolis. A super store, a robot graveyard, hover-car lanes and the Tower of Death, where ghost robots repeat their last orders forever. The Overseer watches every street.'],
  arena: ['Arena Prime', 'Fight, bet and climb the ladder. The safe side keeps score; the dangerous side keeps your stuff.'],
  moon: ['The Moon', 'Earth\'s moon: a dome super-city, mining pits, oxygen plants and farms under glass. Low gravity makes every jump a long one.'],
  speedway: ['Velocity', 'The racing planet. Every road on Velocity is a track, and every track has a record someone wants back.'],
  ocean: ['Ocean World', 'Kelp cities, bubble domes and a swamp jungle on the only dry land. The mystic shop sells to anyone who can reach it. Something very large lives below the shelf.'],
  fort: ['Fort Ironrock', 'An asteroid army base: vehicle training, a clinic, military research and an army shop. Drome hit it hard and Warlord Krag still holds the far side of the rock.'],
  skycity: ['Earth Sky', 'Floating islands above Earth, chained to nothing. Droids patrol the bridges, and Drome Prime keeps his base at the highest island, where he can see the whole sunset.'],
  zarlich: ['Zarlich', 'Violet storms and unknown life. Tube sharks swim through the air, T-rexes hunt the lowlands, and the Storm Mother rides the lightning that never stops.'],
  vector: ['Vector', 'The dark world. Nothing grows and nothing should live, but something watches from the Maw. Every road in the war leads here in the end.'],
  forestlife: ['Forest of Life', 'The oldest forest on Earth. Spriggans tend it, glowmoths light it, and the Rot King is eating it from the inside.'],
  swift: ['Super Swift Arena', 'Earth\'s boss rush. One fighter, every champion the arena owns, back to back, no breaks.'],
};
const LORE_FACTIONS = [
  ['Drome', 'earth', 'The black-and-red warlord behind the sunset. His blade, his symbol and his guards turn up on every world the war touches.'],
  ['The Masters', 'earth', 'Elismas (gun), Ramick (sword) and Maxurge (staff). Beat a Master and you earn their signature gear, and a place on your cape.'],
  ['The Bug Master', 'mezar', 'A four-eyed insectoid with a glowing staff who rules Bug City and breeds hybrids in the hive tower.'],
  ['The robot lines', 'robot', 'XR-17, ZR-306, K8-72, R7-31 and R7-33, the X-G Police and the hover-bots. Most were built to serve and were rewired to fight.'],
  ['The Zeltac', 'zeltac', 'The people of the city-ship. Traders and engineers who never stay in one orbit for long and remember everyone who owes them.'],
  ['The Watcher', 'vector', 'Whatever lives in the Maw on Vector. Drome takes orders from no one, except, maybe, this.'],
];
const LORE_ORDER = ['earth', 'forestlife', 'swift', 'ship', 'space', 'mezar', 'capitone', 'zeltac', 'arena', 'moon', 'speedway', 'ocean', 'fort', 'robot', 'skycity', 'zarlich', 'vector'];
const loreKnown = id => !!(ST().worlds[id] || id === 'ship' && S.ship && S.ship.unlocked || id === 'space' && S.ship && S.ship.unlocked || DEV_ALL);
// a Lore and Controls tab in the Codex
{ const _oc = openCodex; openCodex = function (tab) {
  if (tab === 'lore') {
    openDlg('Codex', 'Galaxy lore'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '52vh'; rows.style.overflowY = 'auto';
    const add = (title, body, known) => { const r = document.createElement('div'); r.className = 'rowi nodot'; r.style.cssText = 'display:block;height:auto;min-height:0;padding:6px 2px;line-height:1.35'; r.innerHTML = known ? `<b>${title}</b><br><small style="color:var(--dim);line-height:1.45">${body}</small>` : `<b style="color:var(--dim)">??? </b><small style="color:var(--dim)">Visit more of the galaxy to unlock this entry.</small>`; rows.appendChild(r); };
    const n = LORE_ORDER.filter(loreKnown).length; $('dlgLine').textContent = `Worlds: ${n} / ${LORE_ORDER.length}. Entries unlock when you first set foot somewhere.`;
    for (const id of LORE_ORDER) add(LORE[id][0], LORE[id][1], loreKnown(id));
    const h = document.createElement('div'); h.style.cssText = 'margin:10px 0 4px;color:#ffd36a;font-weight:bold'; h.textContent = 'Factions & figures'; rows.appendChild(h);
    for (const [t, w, b] of LORE_FACTIONS) add(t, b, loreKnown(w));
    $('dlgActs').before(rows); acts([['Back to Codex', () => openCodex('ach'), true], ['Close', closeDlg]]); return;
  }
  const r = _oc(tab); const a = $('dlgActs'), close = [...a.children].find(b => b.textContent === 'Close');
  const mk = (label, fn) => { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = label; b.addEventListener('click', () => { SFX.ui(); fn(); }); a.insertBefore(b, close || null); };
  mk('Lore', () => openCodex('lore')); mk('Controls', () => openControls()); return r;
}; }
// controls reference, from the menu, the Codex or F1
function openControls() {
  openDlg('Help', 'Controls'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '54vh'; rows.style.overflowY = 'auto';
  const sec = t => { const h = document.createElement('div'); h.style.cssText = 'margin:8px 0 2px;color:#ffd36a;font-weight:bold'; h.textContent = t; rows.appendChild(h); };
  const row = (k, v) => { const r = document.createElement('div'); r.className = 'rowi nodot'; r.innerHTML = `<b style="min-width:120px;display:inline-block">${k}</b><span>${v}</span>`; rows.appendChild(r); };
  if (TOUCH) {
    $('dlgLine').textContent = 'Phone and tablet controls.';
    sec('On foot'); [['Left stick', 'Move'], ['Drag right side', 'Aim'], ['FIRE', 'Hold to shoot'], ['JUMP · RLD', 'Jump · reload'], ['SWAP · ORDNANCE', 'Gun/melee · fire your ordnance'], ['Tap the ammo box', 'Switch gun and staff (New Game+: both)'], ['MENU tab (bottom)', 'Swipe up or tap: ship, quests, bag, vehicle, codex, photo mode, settings']].forEach(r => row(...r));
    sec('Flying'); [['Left stick', 'Steer'], ['Drag right side', 'Look'], ['FIRE · BOOST', 'Lasers · afterburner']].forEach(r => row(...r));
  } else {
    $('dlgLine').textContent = 'Keyboard and mouse. A controller works too.';
    sec('On foot'); [['WASD', 'Move (Shift to sprint)'], ['Mouse', 'Aim · click to fire'], ['Right click', 'Block with a shield'], ['Space', 'Jump'], ['R', 'Reload'], ['Q / F', 'Swap gun and melee'], ['Y', 'Switch gun and staff (New Game+: both at once)'], ['Z', 'Fire your ordnance'], ['H', 'Use a medkit'], ['E', 'Talk · use']].forEach(r => row(...r));
    sec('Getting around'); [['X', 'Ride your speed bike'], ['V', 'Drive your vehicle (car, tank or mech)'], ['T', 'Teleport to your ship'], ['L', 'Launch your ship'], ['M', 'Galaxy map (on your ship or in space)']].forEach(r => row(...r));
    sec('Menus'); [['B', 'Bag'], ['J', 'Quest log'], ['C', 'Codex: achievements, dailies, bestiary, lore'], ['G', 'Decorate your ship'], ['Enter', 'Chat (start with ! to shout)'], ['P', 'Photo mode (K saves a picture)'], ['Tab', 'Menu drawer'], ['F1', 'This help'], ['Esc', 'Pause menu and settings']].forEach(r => row(...r));
    sec('Controller'); [['Left stick · right stick', 'Move · aim (click L3 to sprint)'], ['A · X', 'Jump · talk / use'], ['RT · LT', 'Fire · block'], ['RB', 'Gun / melee'], ['Y', 'Reload (switches gun/staff when nothing to reload)'], ['R3', 'Heal'], ['Tap LB', 'Bag'], ['Hold LB + Y · X · B · A · RB', 'Gun/staff · heal · codex · dance · melee'], ['D-pad', 'Build · ship · bike · ordnance (moves between buttons in menus)'], ['Back · Start', 'Quest log · pause'], ['Right stick in menus', 'Scroll lists'], ['A or Start in a cutscene', 'Skip']].forEach(r => row(...r));
  }
  $('dlgActs').before(rows); acts([['Got it', closeDlg, true]]);
}
// photo mode: hide the HUD and the gun so you can take a clean picture
const PHOTO = { on: false, vm: true };
function setPhoto(on) {
  PHOTO.on = on; document.body.classList.toggle('photo', on);
  if (on) { PHOTO.vm = vm.visible; toast('PHOTO MODE', TOUCH ? 'Tap the camera button to leave' : 'P to leave · K saves a picture', 2.5); }
  else vm.visible = PHOTO.vm;
  if (TOUCH) photoExit.hidden = !on;
}
const photoExit = document.createElement('button'); photoExit.className = 'hbtn win'; photoExit.textContent = '📷 Exit photo mode'; photoExit.hidden = true; photoExit.style.cssText = 'position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:30;font-size:13px';
photoExit.addEventListener('click', () => setPhoto(false)); document.body.appendChild(photoExit);
{ const st = document.createElement('style'); st.textContent = 'body.photo #hud, body.photo #touch, body.photo #vignette { visibility: hidden !important; }'; document.head.appendChild(st); }
function snapPhoto() {
  requestAnimationFrame(() => { try { renderer.domElement.toBlob(async blob => {
    if (!blob) return toast('PHOTO', 'Could not capture the picture. Use a screenshot instead.', 2);
    let dl = null; try { dl = window.claude && await window.claude.use('downloads'); } catch (_) {}
    if (!dl) return toast('PHOTO', 'Saving is not available here. Use a screenshot instead.', 2.5);
    try { await dl.save({ filename: `art-of-war-${LEVEL.id}-${Date.now()}.jpg`, data: blob }); SFX.ui(); toast('PHOTO SAVED', '', 1.5); } catch (e) { if (e && e.code === 'rate_limited') toast('PHOTO', 'One save at a time.', 1.5); }
  }, 'image/jpeg', 0.92); } catch (_) { toast('PHOTO', 'Could not capture the picture. Use a screenshot instead.', 2); } });
}
{ const _s = step; step = function (dt) { _s(dt); if (PHOTO.on) vm.visible = false; }; }
{ const _ss = setState; setState = function (s) { if (s !== 'play' && PHOTO.on) setPhoto(false); return _ss(s); }; }
// extra hotkeys
window.addEventListener('keydown', e => {
  if (e.repeat || chatOpen() || dlgOpen || state !== 'play' || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
  if (e.code === 'KeyP') setPhoto(!PHOTO.on);
  else if (e.code === 'KeyK' && PHOTO.on) snapPhoto();
  else if (e.code === 'F1') { e.preventDefault(); openControls(); }
  else if (e.code === 'KeyC' && !PHOTO.on) openCodex();
  else if (e.code === 'KeyM' && !PHOTO.on) { if (LEVEL.id === 'ship' || LEVEL.fly || LEVEL.id === 'space') openGalaxy(); else toast('GALAXY MAP', 'The map is on your ship. Press T to go there.', 2); }
});
// menu buttons
{ const drop = $('menuDrop'), ref = $('unstuckBtn');
  const mk = (id, label, fn) => { const b = document.createElement('button'); b.className = ref.className; b.id = id; b.textContent = label; b.addEventListener('click', () => { drop.hidden = true; $('menuToggle').setAttribute('aria-expanded', 'false'); fn(); }); drop.insertBefore(b, ref); };
  mk('playersBtn', '👥 Players online', () => openOnline()); mk('photoBtn', '📷 Photo mode', () => setPhoto(true)); mk('helpBtn', '❓ Controls', () => openControls()); }
// arrival title card the first time you set foot on a world
const arrive = document.createElement('div'); arrive.id = 'arrive'; arrive.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 30%);max-width:min(92vw,520px);padding:8px 18px 10px;border-radius:12px;background:rgba(8,14,26,.55);text-align:center;pointer-events:none;z-index:20;opacity:0;transition:opacity .7s;text-shadow:0 1px 0 #000'; document.body.appendChild(arrive);
function arrivalCard(id) {
  const L = LEVELS[id]; if (!L) return; const lore = LORE[id];
  arrive.innerHTML = `<div style="font-size:10px;letter-spacing:.2em;color:#ffd36a">NEW WORLD DISCOVERED</div><div style="font-size:clamp(20px,3.6vw,30px);font-weight:bold;color:#fff;margin:2px 0;line-height:1.1">${(L.name || id).toUpperCase()}</div><div style="font-size:13px;color:#e8ecf8">${L.tag || ''}${L.lvls ? ' · ' + L.lvls : ''}</div>${lore ? '<div style="font-size:11px;color:#c8d0e8;margin-top:4px;opacity:.8">Lore entry added to your Codex (C)</div>' : ''}`;
  arrive.style.opacity = 0.9; $('toast').style.opacity = 0; toastT = 0; SFX.level && SFX.level(); clearTimeout(arrive._t); arrive._t = setTimeout(() => arrive.style.opacity = 0, 3000); arrive._until = performance.now() + 3000;
}
// toasts that pop while the arrival card is up wait their turn instead of landing on top of it
{ const _to = toast; toast = function (big, sm, dur) { const wait = (arrive._until || 0) - performance.now(); if (wait > 0) { setTimeout(() => toast(big, sm, dur), wait + 250); return; } return _to(big, sm, dur); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) {
  const known = !!ST().worlds[id], r = _ll(id, o);
  if (!known && state === 'play' && LORE[id] && !['ship', 'space'].includes(id)) { const show = () => { if (LEVEL.id !== id) return; if (state === 'cut') { setTimeout(show, 700); return; } if (state === 'play') arrivalCard(id); }; setTimeout(show, 900); }
  return r;
}; }
// one-time contextual tips for new players (each shows once per save)
const TIPS = [
  ['heal', () => player.hp < maxHp() * 0.4 && (S.inv.medkit || 0) > 0, () => TOUCH ? 'Low health! Open your Bag from the Menu to use a Medkit.' : 'Low health! Press H to use a Medkit.'],
  ['heal2', () => player.hp < maxHp() * 0.35 && !(S.inv.medkit || 0), () => 'Low health and no Medkits. Back off into a safe zone ring to heal, and buy Medkits at the general store.'],
  ['codex', () => S.ach && Object.keys(S.ach).length > 0, () => TOUCH ? 'Achievement earned! Menu → Codex tracks them, plus dailies, the bestiary and lore.' : 'Achievement earned! Press C for the Codex: achievements, dailies, bestiary and lore.'],
  ['ship', () => S.ship && S.ship.unlocked && LEVEL.id !== 'ship' && !ST().worlds.mezar, () => TOUCH ? 'Your ship is ready. Menu → Ship teleports you aboard.' : 'Your ship is ready. Press T to teleport aboard, or M on the bridge for the galaxy map.'],
  ['veh', () => typeof vehS === 'function' && vehS().owned.length > 0, () => TOUCH ? 'You own a vehicle! Menu → Vehicle to drive it where there is room.' : 'You own a vehicle! Press V to drive it where there is room.'],
  ['dec', () => LEVEL.id === 'ship' && S.lvl >= 3, () => TOUCH ? 'Make the ship yours: the Decorate button places furniture, most of it free.' : 'Make the ship yours: press G to decorate with furniture, most of it free.'],
  ['raid', () => typeof raidNow === 'function' && raidNow().active && S.lvl >= 5, () => 'A world raid is live! Tap the red raid bar to fly there and fight with everyone online for Raid Tokens.'],
  ['help', () => S.lvl >= 2, () => TOUCH ? 'Menu → Controls lists every control. Menu → Photo mode hides the HUD for screenshots.' : 'Press F1 any time for the full controls list, or P for photo mode.'],
];
setInterval(() => { try {
  if (state !== 'play' || dlgOpen || PHOTO.on) return; S.tips = S.tips || {};
  for (const [id, cond, text] of TIPS) if (!S.tips[id] && cond()) { S.tips[id] = 1; markDirty(); log('TIP: ' + text(), 'loot'); toast('TIP', text().split(/[.!]/)[0], 3); break; }
} catch (_) {} }, 3000);
// Shared boards (leaderboards, Marshal and Hit boards) live in claude.ai's database on the game page. Anywhere else the game
// falls back to the /pub/leaders store on whatever server.js is serving it (your own PC through the tunnel).
const PUB = { on: false, id: null, key: null, rows: null };
(async () => { if (!/^https?:$/.test(location.protocol)) return; try { const r = await fetch('pub/leaders', { cache: 'no-store' }); if (!r.ok) return; await r.json(); } catch (_) { return; }
  try { PUB.id = localStorage.getItem('aow-pub-id'); PUB.key = localStorage.getItem('aow-pub-key'); } catch (_) {}
  const rnd = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('');
  if (!PUB.id || !PUB.key) { PUB.id = 'p' + rnd(8); PUB.key = rnd(16); try { localStorage.setItem('aow-pub-id', PUB.id); localStorage.setItem('aow-pub-key', PUB.key); } catch (_) {} }
  PUB.on = true; })();
const PUB_DB = {
  doc: p => ({ set: d => fetch('pub/leaders/' + encodeURIComponent(p.split('/')[1]), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Aow-Key': PUB.key }, body: JSON.stringify(d) }) }),
  collection: () => ({ limit: () => ({ get: async () => { const r = await fetch('pub/leaders', { cache: 'no-store' }); const j = await r.json(); return { docs: (j.rows || []).map(x => ({ id: x.id, data: () => x.d })) }; } }) }),
};
const LBD = () => db || (PUB.on ? PUB_DB : null), LBU = () => (db ? uid : PUB.on ? PUB.id : null);
// =================== LEADERBOARDS: everyone's records in one shared collection (leaders/<player id>) ===================
const LB = { last: '', lastT: 0, cache: null, cacheT: 0 };
function lbRow() {
  const T = ST(), R = rs(), d = { nick: S.nick || 'Trooper', lvl: S.lvl || 1, kills: T.kills || 0, bosses: T.bosses || 0, raids: T.raids || 0, fish: T.fish || 0, swift: (S.swift && S.swift.best) || 0, asc: S.asc || 0, ach: Object.keys(S.ach || {}).length, col: S.col || '', where: LEVEL ? LEVEL.id : 'earth' };
  for (const k in RTRACKS) if (R.best && R.best[k]) d['race_' + k] = R.best[k];
  return d;
}
async function lbPush(force) {
  if (!LBD() || !LBU() || state === 'menu') return; const d = lbRow(), j = JSON.stringify(d);
  if (!force && (j === LB.last || Date.now() - LB.lastT < 60000)) return;
  LB.last = j; LB.lastT = Date.now(); d.t = Date.now();
  try { await LBD().doc('leaders/' + LBU()).set(d); } catch (_) {}
}
setInterval(() => lbPush(false), 20000);
const LB_BOARDS = [
  ['lvl', 'Level', 'desc', v => 'Lv ' + v], ['kills', 'Enemies defeated', 'desc', v => v.toLocaleString()], ['bosses', 'Bosses defeated', 'desc', v => v], ['swift', 'Super Swift rounds', 'desc', v => 'Round ' + v], ['raids', 'Raiders defeated', 'desc', v => v], ['ach', 'Achievements', 'desc', v => v + ' / ' + ACH.length], ['fish', 'Fish caught', 'desc', v => v],
  ...Object.entries(RTRACKS).map(([k, T]) => ['race_' + k, T.name + ' (best time)', 'asc', v => v.toFixed(2) + 's']),
];
async function openLeaders(bi) {
  bi = bi || 0; const B = LB_BOARDS[bi]; openDlg('Codex', 'Leaderboards');
  $('dlgLine').textContent = LBD() ? 'Loading…' : 'Leaderboards need the game page signed in, or a game server.';
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '46vh'; rows.style.overflowY = 'auto'; $('dlgActs').before(rows);
  const pick = document.createElement('select'); pick.className = 'pbtn'; pick.style.cssText = 'margin:4px 0;max-width:100%'; LB_BOARDS.forEach((b, i) => { const o = document.createElement('option'); o.value = i; o.textContent = b[1]; o.selected = i === bi; pick.appendChild(o); }); pick.addEventListener('change', () => +pick.value < 0 ? openOnline() : openLeaders(+pick.value)); { const o = document.createElement('option'); o.value = -1; o.textContent = '● Who\'s online now'; pick.insertBefore(o, pick.firstChild); } const pw = document.createElement('div'); pw.className = 'prevWrap'; pw.appendChild(pick); rows.before(pw);
  acts([['Who\'s online', () => openOnline(), true], ['Back to Codex', () => openCodex('ach')], ['Close', closeDlg]]);
  if (!LBD()) return;
  await lbPush(true);
  try {
    if (!LB.cache || Date.now() - LB.cacheT > 15000) { const snap = await LBD().collection('leaders').limit(500).get(); LB.cache = snap.docs.map(s => Object.assign({ id: s.id }, s.data())); LB.cacheT = Date.now(); }
    if (!$('shopRows') || $('dlgName').textContent !== 'Leaderboards') return;
    const [f, , dir, fmt] = B, list = LB.cache.filter(r => typeof r[f] === 'number' && r[f] > 0).sort((a, b) => dir === 'asc' ? a[f] - b[f] : b[f] - a[f]);
    $('dlgLine').textContent = `${B[1]} · ${list.length} trooper${list.length === 1 ? '' : 's'} ranked`;
    if (!list.length) { const r = document.createElement('div'); r.className = 'rowi nodot'; r.textContent = 'No one has a record here yet. Be the first!'; rows.appendChild(r); }
    list.slice(0, 50).forEach((p, i) => {
      const r = document.createElement('div'); r.className = 'rowi nodot'; const me = p.id === LBU();
      const a = document.createElement('span'); a.innerHTML = `<b style="color:${i === 0 ? '#ffd36a' : i === 1 ? '#d8dde8' : i === 2 ? '#d89a5a' : 'inherit'}">${i + 1}.</b> `; const nm = document.createElement('span'); nm.textContent = String(p.nick || 'Trooper').slice(0, 16) + (me ? ' (you)' : '') + (p.asc ? ' ✦' + p.asc : ''); if (me) nm.style.color = '#6fdc5a'; a.appendChild(nm);
      const b = document.createElement('span'); b.className = 'meta'; b.style.fontSize = '14px'; b.textContent = 'Lv ' + (p.lvl || 1) + (p.where && LEVELS[lbWorld(p.where)] ? ' · ' + LEVELS[lbWorld(p.where)].name : ''); const c = document.createElement('span'); c.textContent = fmt(p[f]); r.append(a, b, c); rows.appendChild(r);
    });
  } catch (_) { $('dlgLine').textContent = 'Could not load the leaderboards right now.'; }
}
{ const _oc = openCodex; openCodex = function (tab) { const r = _oc(tab); if (tab !== 'lore') { const a = $('dlgActs'), lore = [...a.children].find(b => b.textContent === 'Lore'); if (lore) { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Leaderboards'; b.addEventListener('click', () => { SFX.ui(); openLeaders(0); }); a.insertBefore(b, lore); } } return r; }; }

// ---- who's online and where; join them ----
const lbWorld = id => id === 'zfloor' || id === 'apt' ? 'zeltac' : id;
function canJoin(lv) { const w = lbWorld(lv); if (!LEVELS[w] || w === 'ship') return false; if (w === 'earth') return true; if (w === 'space') return shipUnlocked(); return shipUnlocked() && planetOpen(w); }
function joinPlayer(pr) {
  const w = lbWorld(pr.lv); closeDlg();
  if (w === 'space') { travel('space'); return; }
  const same = LEVEL.id === w; if (!same) travel(w);
  if (pr.lv === w && typeof pr.x === 'number') setTimeout(() => { if (LEVEL.id !== w) return; const a = Math.random() * 6.28; player.pos.set(pr.x + Math.cos(a) * 2.5, (typeof pr.y === 'number' ? pr.y : player.pos.y) + 0.5, pr.z + Math.sin(a) * 2.5); if (player.vel) player.vel.set(0, 0, 0); toast('JOINED', pr.nick || 'Trooper', 2); }, same ? 50 : 1300);
}
function openOnline() {
  openDlg('Codex', 'Who\'s online'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '50vh'; rows.style.overflowY = 'auto'; $('dlgActs').before(rows);
  const peers = (lastPeers || []).filter(p => !p.isMe && p.kind === 'viewer' && p.presence && p.presence.nick);
  $('dlgLine').textContent = !room ? 'Live player tracking needs the game page signed in.' : peers.length ? `${peers.length} other trooper${peers.length === 1 ? '' : 's'} online. Join drops you right next to them.` : 'Nobody else is online right now. Share the game link with a friend!';
  const order = p => p.presence.lv === LEVEL.id ? 0 : 1; peers.sort((a, b) => order(a) - order(b));
  for (const pe of peers) { const pr = pe.presence, w = lbWorld(pr.lv), r = document.createElement('div'); r.className = 'rowi nodot';
    const a = document.createElement('span'); const nm = document.createElement('b'); nm.textContent = String(pr.nick).slice(0, 16); nm.style.color = pr.col || '#e8ecf8'; a.append(nm, document.createTextNode(' · Lv ' + (pr.lvl || 1)));
    const b = document.createElement('span'); b.className = 'meta'; b.style.fontSize = '14px'; b.textContent = pr.lv === 'ship' ? 'Aboard their ship' : (LEVELS[w] ? LEVELS[w].name : w) + (pr.lv === LEVEL.id ? ' (here)' : '');
    const c = document.createElement('span'); if (canJoin(pr.lv)) { const bt = document.createElement('button'); bt.className = 'pbtn go'; bt.textContent = pr.lv === LEVEL.id ? 'Go to' : 'Join'; bt.addEventListener('click', () => { SFX.ui(); joinPlayer(pr); }); c.appendChild(bt); } else c.textContent = pr.lv === 'ship' ? '' : 'Locked';
    r.append(a, b, c); rows.appendChild(r); }
  acts([['Leaderboards', () => openLeaders(0)], ['Refresh', () => openOnline()], ['Close', closeDlg, true]]);
}

// ---- change your callsign any time from the pause menu ----
function saveNick() {
  const n = (typeof cleanNick === 'function') ? cleanNick($('nickEdit').value) : ($('nickEdit').value || '').replace(/[^\w .\-]/g, '').trim().slice(0, 16);
  if (!n) { $('nickEdit').value = S.nick; return; }
  $('nickEdit').value = n;
  if (n === S.nick) return; const old = S.nick; S.nick = n; $('nickIn').value = n; markDirty(); sendPresence(true); lbPush(true);
  log(`Callsign changed from ${old} to ${n}`, 'loot'); toast('CALLSIGN', n, 1.5); SFX.ui();
}
$('nickSave').addEventListener('click', saveNick);
$('nickEdit').addEventListener('keydown', e => { if (e.key !== 'Escape') e.stopPropagation(); if (e.key === 'Enter') { saveNick(); e.preventDefault(); } });
{ const _ss2 = setState; setState = function (s) { const r = _ss2(s); if (s === 'pause') $('nickEdit').value = S.nick || ''; return r; }; }
// ---- landing pads: if a pad ended up clipped into a building or crowding a doorway, slide it to the nearest open ground ----
const PADS = [];
{ const _dp = dropshipPad; dropshipPad = function (x, z, ry, label) { const r = _dp(x, z, ry, label); PADS.push({ g: props.children[props.children.length - 1], c: CIRCLES[CIRCLES.length - 1], it: INTERACTS[INTERACTS.length - 1], x, z }); return r; }; }
function padClear(x, z, me, L) {
  const R = 5.2;
  if (CIRCLES.some(c => c !== me.c && Math.hypot(x - c[0], z - c[1]) < c[2] + R)) return false;
  if (BOXES.some(([bx, bz, hx, hz]) => Math.abs(x - bx) < hx + R && Math.abs(z - bz) < hz + R)) return false;
  if (INTERACTS.some(i => i !== me.it && Math.hypot(x - i.x, z - i.z) < (i.r || 2) + 4)) return false;
  const nb = L.npcBase || [0, 0]; if ((L.npcs || []).some(n => Math.hypot(x - (nb[0] + n.x), z - (nb[1] + n.z)) < 5)) return false;
  if (PROP_BLOCK.some(b => b !== me.box && !b[4] && x > b[0] - R && x < b[2] + R && z > b[1] - R && z < b[3] + R)) return false;
  if (L.terrain) { const h = groundH(x, z); if (h < WATER_Y + 0.4) return false; for (const [dx, dz] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) if (Math.abs(groundH(x + dx, z + dz) - h) > 0.8) return false; if (LAVA.some(l => Math.hypot(x - l[0], z - l[1]) < l[2] + 4)) return false; }
  if (WORLD_R && Math.hypot(x - WORLD_C.x, z - WORLD_C.z) > WORLD_R - 8) return false;
  return true;
}
function settlePads(L) {
  if (!PADS.length) return; try { scanPropBlocks(); } catch (_) { return; }
  const b3 = new THREE.Box3();
  for (const P of PADS) {
    if (!P.g || !P.g.parent) continue; b3.setFromObject(P.g); P.box = PROP_BLOCK.find(b => Math.abs(b[0] - b3.min.x) < 0.01 && Math.abs(b[1] - b3.min.z) < 0.01);
    if (padClear(P.x, P.z, P, L)) continue;
    const inSafeNow = SAFES.find(s => Math.hypot(P.x - s.x, P.z - s.z) < s.r);
    let best = null;
    for (let r = 2; r <= 40 && !best; r += 2) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, x = P.x + Math.cos(a) * r, z = P.z + Math.sin(a) * r;
      if (inSafeNow && r < 30 && Math.hypot(x - inSafeNow.x, z - inSafeNow.z) > inSafeNow.r + 6) continue;
      if (padClear(x, z, P, L)) { best = [x, z]; break; } }
    if (!best) continue;
    const [x, z] = best; P.g.position.x = x; P.g.position.z = z; P.g.position.y = L.terrain ? groundH(x, z) : P.g.position.y;
    if (P.c) { P.c[0] = x; P.c[1] = z; } if (P.it) { P.it.x = x; P.it.z = z; }
    if (L.pad && Math.hypot(L.pad.x - P.x, L.pad.z - P.z) < 1) { L.pad.x = x; L.pad.z = z; }
    P.x = x; P.z = z; P.moved = true;
  }
}
{ const _dl = detailLevel; detailLevel = function (L, id) { try { settlePads(L); } catch (e) { console.warn('pads', e); } return _dl(L, id); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { PADS.length = 0; return _ll(id, o); }; }
// the HUD weapon line just shows ordnance charges now (Phil: no gun name)
{ const _u = updateHud; updateHud = function () { _u(); if (!LEVEL.fly && !handMelee()) $('gunLbl').textContent = `◆ ${ordCharges} ordnance`; else if (!LEVEL.fly) $('gunLbl').textContent = `◆ ${ordCharges} ordnance`; }; }
// signs seen from behind used to read backwards: give each two-sided sign a proper back face instead
function unmirrorSigns(root) {
  const list = []; root.traverse(o => { const m = o.material; if (o.isMesh && m && !Array.isArray(m) && m.map && m.map.userData && m.map.userData.sign && m.side === THREE.DoubleSide && !o.userData.unmir) list.push(o); });
  for (const o of list) { o.userData.unmir = true; const f = o.material.clone(); f.side = THREE.FrontSide; o.material = f; const b = new THREE.Mesh(o.geometry, f); b.rotation.y = Math.PI; b.userData.unmir = true; o.add(b); }
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); try { unmirrorSigns(levelGroup); setTimeout(() => { try { unmirrorSigns(scene); } catch (_) {} }, 1500); } catch (_) {} return r; }; }
