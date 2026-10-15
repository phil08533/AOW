// =================== PROGRESS: stats, achievements, bestiary, daily challenges, the ending and New Game+ ===================
const ST = () => { S.stats = S.stats || { kills: 0, bosses: 0, fish: 0, deaths: 0, quests: 0, crEarned: 0, worlds: {}, kt: {}, shots: 0, golds: 0, raids: 0, dist: 0 }; S.stats.worlds = S.stats.worlds || {}; S.stats.kt = S.stats.kt || {}; return S.stats; };
// ---- counters ----
{ const _k = kill; kill = function (e) { const r = _k(e); const T = ST(); T.kills++; T.kt[e.sp.type] = (T.kt[e.sp.type] || 0) + 1; if (e.def.boss) T.bosses++; if (e.sp.raid) T.raids++; dailyTick(); return r; }; }
{ const _q = questProgressFish; questProgressFish = function (...a) { ST().fish++; dailyTick(); return _q.apply(this, a); }; }
{ const _c = completeQuest; completeQuest = function (id) { const r = _c(id); ST().quests++; checkAch(); if (id === 'w4' && !(S.flags && S.flags.creditsSeen)) setTimeout(rollCredits, 4500); return r; }; }
{ const _r = respawn; respawn = function () { ST().deaths++; return _r(); }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (LEVELS[id] && !['ship', 'space', 'apt', 'zfloor'].includes(id)) ST().worlds[id] = 1; return r; }; }
{ let lastCr = null; setInterval(() => { try { if (state !== 'play') return; if (lastCr != null && S.cr > lastCr) { ST().crEarned += S.cr - lastCr; dailyTick(); } lastCr = S.cr; } catch (_) {} }, 1000); }
// ---- achievements ----
const ACH = [
  ['first_blood', 'First Blood', 'Defeat your first enemy', () => ST().kills >= 1, 100],
  ['k100', 'Exterminator', 'Defeat 100 enemies', () => ST().kills >= 100, 1000], ['k1000', 'One-Trooper Army', 'Defeat 1,000 enemies', () => ST().kills >= 1000, 10000],
  ['boss1', 'Giant Slayer', 'Defeat a boss', () => ST().bosses >= 1, 500], ['boss10', 'Boss Collector', 'Defeat 10 bosses', () => ST().bosses >= 10, 5000],
  ['drome', 'Sunset', 'Defeat Drome on Earth', () => qDone('q5'), 1000], ['sunslayer', 'Sunslayer', 'Defeat Drome, Lord of the Setting Sun', () => qDone('k4'), 8000], ['watcher', 'Dawn', 'Defeat the Watcher in the Maw', () => qDone('w3'), 20000],
  ['ship', 'Captain', 'Earn your own ship', () => shipUnlocked() && S.ship.unlocked, 500], ['rooms', 'Interior Designer', 'Own 5 ship rooms', () => S.ship && S.ship.rooms && S.ship.rooms.length >= 5, 2000],
  ['decor', 'Homemaker', 'Place 25 pieces of furniture on your ship', () => (S.shipBase || []).length >= 25, 2000],
  ['worlds5', 'Tourist', 'Set foot on 5 worlds', () => Object.keys(ST().worlds).length >= 5, 1000], ['worlds12', 'Galaxy Walker', 'Set foot on 12 worlds', () => Object.keys(ST().worlds).length >= 12, 6000],
  ['fish1', 'Gone Fishin\'', 'Catch a fish', () => ST().fish >= 1, 100], ['fish50', 'Master Angler', 'Catch 50 fish', () => ST().fish >= 50, 3000],
  ['lv10', 'Veteran', 'Reach level 10', () => S.lvl >= 10, 500], ['lv25', 'Elite', 'Reach level 25', () => S.lvl >= 25, 3000], ['lv40', 'Legend', 'Reach level 40', () => S.lvl >= 40, 10000],
  ['rich', 'Space Rich', 'Have 50,000 credits (carried + banked)', () => S.cr + S.bank >= 50000, 0], ['earned', 'Big Earner', 'Earn 250,000 credits in total', () => ST().crEarned >= 250000, 5000],
  ['quests10', 'Helpful', 'Finish 10 quests', () => ST().quests >= 10, 1000], ['quests40', 'Hero of the Galaxy', 'Finish 40 quests', () => ST().quests >= 40, 8000],
  ['gold', 'Speed Demon', 'Get gold in a time trial', () => typeof rs === 'function' && Object.values(rs().wins || {}).some(v => v > 0), 1500], ['champ', 'Grand Champion', 'Gold on every Velocity course', () => S.flags && S.flags.racerCape, 5000],
  ['veh', 'Motor Pool', 'Own all three war vehicles', () => S.veh && S.veh.owned && S.veh.owned.length >= 3, 5000],
  ['pet', 'Best Friend', 'Adopt a pet', () => !!S.pet, 300], ['saber', 'Elegant Weapon', 'Own a laser sword', () => (S.melees || []).some(m => MELEE[m] && MELEE[m].saber), 1000],
  ['hunter', 'Bounty Hunter', 'Reach Hunter Rank 5', () => S.bh && S.bh.rank >= 5, 4000], ['raid', 'Raider Raider', 'Defeat 50 raiders', () => ST().raids >= 50, 3000],
  ['partner', 'Starlight Romance', 'Become partners with someone from the lounge', () => typeof romPartner === 'function' && !!romPartner(), 2000], ['roomie', 'Roommates', 'Have someone move onto your ship', () => S.rom && Object.values(S.rom).some(o => o.ship), 1000],
  ['swift', 'Swift Champion', 'Clear the whole Super Swift boss rush', () => S.flags && S.flags.swiftchamp, 8000], ['fashion', 'Fashionista', 'Unlock 10 armor sets', () => Object.keys(ARMORS).filter(id => lookUnlocked(ARMORS, id)).length >= 10, 2000],
  ['scav', 'Scavenger', 'Scavenge 10 ship parts', () => S.sm && Object.keys(S.sm.own || {}).length >= 10, 3000], ['die10', 'Learning Experience', 'Get knocked out 10 times', () => ST().deaths >= 10, 200],
  ['asc', 'Ascended', 'Start New Game+', () => (S.asc || 0) >= 1, 5000]
];
function checkAch() {
  S.ach = S.ach || {}; let got = 0;
  for (const [id, name, desc, test, cr] of ACH) { if (S.ach[id]) continue; let ok = false; try { ok = !!test(); } catch (_) {} if (!ok) continue; S.ach[id] = Date.now(); got++; if (cr) S.cr += cr; setTimeout(() => { toast('🏆 ACHIEVEMENT', `${name}${cr ? ' · +' + cr + ' cr' : ''}`, 3.5); SFX.quest(); log(`Achievement: ${name} — ${desc}`, 'loot'); }, got * 1800); }
  if (got) markDirty();
}
setInterval(() => { try { if (state === 'play') checkAch(); } catch (_) {} }, 4000);
// ---- daily challenges (same three for everyone each day) ----
const DAILY_POOL = [
  { k: 'kills', n: 40, text: 'Defeat 40 enemies', cr: 1500 }, { k: 'kills', n: 80, text: 'Defeat 80 enemies', cr: 3000 }, { k: 'fish', n: 5, text: 'Catch 5 fish', cr: 1500 },
  { k: 'bosses', n: 1, text: 'Defeat a boss', cr: 2500 }, { k: 'crEarned', n: 5000, text: 'Earn 5,000 credits', cr: 2000 }, { k: 'raids', n: 10, text: 'Defeat 10 raiders', cr: 2500 },
  { k: 'quests', n: 2, text: 'Finish 2 quests', cr: 2000 }, { k: 'worldsToday', n: 3, text: 'Visit 3 different worlds', cr: 1500 }
];
function dailyKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function dailies() {
  const key = dailyKey(); S.daily = S.daily || {};
  if (S.daily.key !== key) { const T = ST(); let seed = [...key].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7); const pick = []; while (pick.length < 3) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; const i = (seed >>> 16) % DAILY_POOL.length; if (!pick.includes(i)) pick.push(i); }
    S.daily = { key, picks: pick, base: { kills: T.kills, fish: T.fish, bosses: T.bosses, crEarned: T.crEarned, raids: T.raids, quests: T.quests }, worlds: {}, done: [] }; markDirty(); }
  return S.daily;
}
function dailyProg(D, c) { const T = ST(); if (c.k === 'worldsToday') return Object.keys(D.worlds || {}).length; return (T[c.k] || 0) - (D.base[c.k] || 0); }
function dailyTick() { try { const D = dailies(); D.picks.forEach((i, j) => { const c = DAILY_POOL[i]; if (D.done.includes(j)) return; if (dailyProg(D, c) >= c.n) { D.done.push(j); S.cr += c.cr; S.inv.raidtoken = (S.inv.raidtoken || 0) + 3; toast('DAILY COMPLETE', `${c.text} · +${c.cr} cr · +3 Raid Tokens`, 3.5); SFX.level(); markDirty(); } }); } catch (_) {} }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); try { const D = dailies(); if (LEVELS[id] && !['ship', 'space', 'apt', 'zfloor'].includes(id)) { D.worlds[id] = 1; dailyTick(); } } catch (_) {} return r; }; }
// ---- the codex (achievements, bestiary, stats, dailies, credits) ----
function openCodex(tab) {
  tab = tab || 'ach'; openDlg('Codex', 'Your record');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.maxHeight = '52vh'; rows.style.overflowY = 'auto';
  const row = (a, b, c, done) => { const r = document.createElement('div'); r.className = 'rowi nodot'; const x = document.createElement('span'); x.innerHTML = a; const y = document.createElement('span'); y.className = 'meta'; y.style.fontSize = '13px'; y.textContent = b || ''; const z = document.createElement('span'); z.textContent = c || ''; z.style.color = done ? '#6fdc5a' : 'var(--dim)'; r.append(x, y, z); rows.appendChild(r); };
  const T = ST(); S.ach = S.ach || {};
  if (tab === 'ach') { const n = ACH.filter(a => S.ach[a[0]]).length; $('dlgLine').textContent = `Achievements: ${n} / ${ACH.length}. Each one pays out credits.`; for (const [id, name, desc, , cr] of ACH) { const d = !!S.ach[id]; row(`${d ? '🏆' : '🔒'} <b>${name}</b><br><small style="color:var(--dim)">${desc}</small>`, cr ? cr + ' cr' : '', d ? 'Done' : '', d); } }
  if (tab === 'best') { const types = Object.keys(ENEMY); const seen = types.filter(t => T.kt[t]); $('dlgLine').textContent = `Bestiary: ${seen.length} / ${types.length} creatures defeated. Undiscovered ones stay hidden.`; for (const t of types) { const k = T.kt[t] || 0, d = ENEMY[t]; row(k ? `<b>${d.name}</b>${d.boss ? ' ★' : ''}` : '<b>???</b>', k ? `${k} defeated` : '', k ? (d.boss ? 'Boss' : d.fly ? 'Flyer' : d.ranged || d.lob ? 'Ranged' : 'Melee') : '', !!k); } }
  if (tab === 'stats') { $('dlgLine').textContent = `${S.nick} · Level ${S.lvl}${S.asc ? ' · Ascension ' + S.asc : ''}`; [['Enemies defeated', T.kills], ['Bosses defeated', T.bosses], ['Raiders defeated', T.raids], ['Fish caught', T.fish], ['Quests finished', T.quests], ['Credits earned', T.crEarned.toLocaleString()], ['Worlds visited', Object.keys(T.worlds).length], ['Knocked out', T.deaths], ['Achievements', `${Object.keys(S.ach).length}/${ACH.length}`]].forEach(([a, b]) => row(`<b>${a}</b>`, String(b), '')); }
  if (tab === 'daily') { const D = dailies(); $('dlgLine').textContent = 'Three new challenges every day, the same for everyone. Each pays credits and 3 Raid Tokens.'; D.picks.forEach((i, j) => { const c = DAILY_POOL[i], p = Math.min(c.n, dailyProg(D, c)), d = D.done.includes(j); row(`<b>${c.text}</b>`, `${p.toLocaleString()} / ${c.n.toLocaleString()}`, d ? 'Done' : `${c.cr} cr`, d); }); }
  if (tab === 'credits') { $('dlgLine').textContent = 'ART OF WAR: SETTING SUN'; [['Created by', 'Philip Gonzales & Caleb Dingus'], ['Original art', 'Phil & Caleb\'s high-school notebooks (plus one sketch by Ethan)'], ['Built in collaboration with', 'Philip & Claude/Gemini/Codex, as the dev team'], ['Engine', 'Three.js in your browser'], ['Thanks', 'Everyone who flew the Setting Sun']].forEach(([a, b]) => row(`<b>${a}</b>`, '', b)); }
  $('dlgActs').before(rows);
  acts([['Achievements', () => openCodex('ach'), tab === 'ach'], ['Daily', () => openCodex('daily'), tab === 'daily'], ['Bestiary', () => openCodex('best'), tab === 'best'], ['Stats', () => openCodex('stats'), tab === 'stats'], ['Credits', () => openCodex('credits'), tab === 'credits'], ...(gameBeaten() ? [['✦ New Game+', () => openAscend()]] : []), ['Close', closeDlg]]);
}
// ---- the ending ----
function rollCredits() {
  const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:50;background:radial-gradient(ellipse at 50% 120%, #ff9a3c 0%, #5a2a6a 35%, #05060f 75%);color:#e8ecf8;overflow:hidden;font-family:inherit;text-align:center;cursor:pointer';
  const inner = document.createElement('div'); inner.style.cssText = 'position:absolute;left:0;right:0;top:100%;padding:0 20px;font-size:18px;line-height:1.7';
  const L = ['<div style="font-size:42px;color:#ffd36a;margin-bottom:10px">ART OF WAR</div><div style="font-size:22px;margin-bottom:40px">SETTING SUN</div>', 'The Watcher is gone. The sky is quiet.', 'Drome, the Overseer, the Frost King, Krag, the Storm Mother...', 'all of them were pieces of one long sunset.', 'You turned it into a sunrise.', '<br>', '<b style="color:#ffd36a">Created by</b>', 'Philip Gonzales', 'Caleb Dingus', '<br>', '<b style="color:#ffd36a">Original concept art</b>', 'Phil & Caleb\'s high-school notebooks', 'with one sketch by Ethan', '<br>', '<b style="color:#ffd36a">Starring</b>', S.nick + ' as the Trooper', 'B.U.R.P. as the ship AI (against his will)', 'Captain Vega · Elismas · Maxurge · Ramick · Seer Ixa', 'Marshal Rook · Old Wren · Captain Skye · Lumen', 'Nyra · Grix · Juno · Rhett · Vesper · PIP-9', '<br>', '<b style="color:#ffd36a">Built by</b>', 'Claude, as the whole dev team', '<br>', '<br>', '<div style="font-size:22px;color:#ffd36a">The galaxy is still out there.</div>', 'New Game+ is unlocked: open the Codex to Ascend.', '<br><br><small>(tap to close)</small>'];
  inner.innerHTML = L.map(l => `<div>${l}</div>`).join(''); ov.appendChild(inner); document.body.appendChild(ov);
  if (document.pointerLockElement) document.exitPointerLock(); SFX.level();
  let y = 0; const H = () => inner.offsetHeight + window.innerHeight; const tick = () => { if (!ov.parentNode) return; y += 0.7; inner.style.transform = `translateY(${-y}px)`; if (y < H()) requestAnimationFrame(tick); else ov.remove(); }; tick();
  ov.addEventListener('click', () => ov.remove());
}
// ---- New Game+: replay the story with tougher enemies and better rewards, keep everything you own ----
// New Game+ only opens once every story chapter is finished, ending with the Watcher
function gameBeaten() { if (!qDone('w4')) return false; for (const id in QDEFS) { const q = QDEFS[id]; if (q.main && /Chapter/.test(q.ch || '') && !qDone(id)) return false; } return true; }
function openAscend() {
  if (!gameBeaten()) { toast('NEW GAME+ LOCKED', 'Finish the story first'); return; }
  const a = S.asc || 0; openDlg('New Game+', `Ascension ${a} → ${a + 1}`);
  $('dlgLine').textContent = `Ascend to replay every chapter from Earth with all your gear, level, ship, pets and friends. Enemies get +35% health and damage per Ascension; you get +25% credits and XP. Ascension ${a + 1} also unlocks a new cape color.`;
  acts([['Ascend!', () => { S.asc = a + 1; const keep = {}; for (const id in S.qst) if (!QDEFS[id] || !QDEFS[id].main && !/^(q|m|c|r|k|x|w|a|l|o)\d/.test(id)) keep[id] = S.qst[id]; S.qst = keep; S.track = null; markDirty(); closeDlg(); toast(`ASCENSION ${S.asc}`, 'The galaxy remembers you. It is angrier now.', 4); SFX.level(); loadLevel('earth'); renderQuest(); }, true], ['Not yet', closeDlg]]);
}
CAPES.ascend = { name: 'Ascendant Cape', lvl: 1, flag: 'ascendCape', col: '#ffd36a', trim: '#c86aff' };
{ const _re = resetEnemy; resetEnemy = function (e) { const r = _re(e); const a = S.asc || 0; if (a && !e.gone) { e.max *= 1 + 0.35 * a; e.hp = e.max; } return r; }; }
{ const _g = gainXp; gainXp = function (n) { return _g(Math.round(n * (1 + 0.25 * (S.asc || 0)))); }; }
{ const _h = hurt; hurt = function (dmg, src) { return _h(dmg * (1 + 0.35 * (S.asc || 0)), src); }; }
setInterval(() => { try { if ((S.asc || 0) >= 1 && !(S.flags && S.flags.ascendCape)) { S.flags = S.flags || {}; S.flags.ascendCape = true; } } catch (_) {} }, 5000);
