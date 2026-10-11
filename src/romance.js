// =================== THE STARLIGHT LOUNGE: romance on the Zeltac Ship ===================
// Six regulars you can get to know. Chat, flirt, bring gifts, take them on dates.
// Affection builds through stages; one partner at a time, and partners give a perk and visit your ship.
const ROM_STAGES = [[0, 'Stranger'], [15, 'Acquaintance'], [35, 'Friend'], [55, 'Crush'], [75, 'Dating'], [95, 'Partner']];
const ROMANCE = {
  nyra: { name: 'Nyra Voss', role: 'Ace starfighter pilot', make: () => makeCivilian('#c8402f', '#2c2a28', '#c58a64', '#1e1a18', '#ffd36a'), x: -12, z: -8, face: 0.6,
    likes: ['raiderchip', 'starcrystal', 'ore'], loves: 'raiderchip', perk: { txt: '+15% ship laser damage', k: 'laser' },
    lines: { 0: ["You fly that ship like you rented it.", "Buy me a drink and I'll tell you about the time I outran a sun. Briefly."], 1: ["You again. Good. Everyone else here is boring.", "Barrel roll count today: forty. Personal best."], 2: ["Okay, you're alright. Don't tell anyone I said that.", "Wanna race asteroids sometime? Loser buys dinner. You'll be buying dinner."], 3: ["I keep looking at the door to see if you came in. That's... a pilot thing. Situational awareness.", "You're kind of my favorite wingman."], 4: ["Fly safe out there. I mean it. I'm not losing you to a rock.", "I named my new laser after you. It's very accurate. Like your face."], 5: ["Partner. Co-pilot. Whatever we call it, I'm in.", "Come home in one piece, flyboy. Or flygirl. Or fly-whatever. Just come home."] },
    flirtOk: ["Smooth. Like a re-entry with the shields up.", "Careful, I bite. Mostly lasers, but still."], flirtNo: ["Wow. Did you get that line off a cereal box?", "Ha. No. Try again after you've crashed fewer ships."],
    dates: ["You race through the asteroid belt. She wins. She's insufferable about it. You don't mind.", "Rooftop of the Zeltac Ship, watching the jump lanes. She points out every ship she's ever shot down."] },
  grix: { name: 'Grix', role: 'Rock-monster poet', make: () => { const g = makeChunkMonster('#8a7a6a', '#6a5a4a', '#b8a888', '#3a3430', false); g.scale.setScalar(0.7); return g; }, rig: 'chunk', x: 12, z: -8, face: -0.6,
    likes: ['core', 'crystal', 'icecore'], loves: 'core', perk: { txt: '+10% max HP', k: 'hp' },
    lines: { 0: ["*rumble*. I write poetry. It is about rocks. All of it.", "Do not sit on me. Many have tried."], 1: ["You returned. Like erosion. Slow. Inevitable. Nice.", "New poem: 'Pebble.' That is the whole poem."], 2: ["You are a good friend. Sturdy. Like granite. That is a compliment where I am from.", "I wrote a haiku about you. It has sixteen syllables. I got excited."], 3: ["My core gets warm when you visit. Geologically, this is alarming.", "Roses are red. Basalt is grey. I like you. A normal amount. Very normal."], 4: ["We should go see a canyon. Canyons are very romantic. For me.", "I carved our initials on an asteroid. It is a big asteroid. The initials are bigger."], 5: ["You are my favorite mineral.", "Together we are a conglomerate. That is rock humor. I am crying sediment."] },
    flirtOk: ["*rumbles bashfully* You make my strata shift.", "Please continue. My magma is listening."], flirtNo: ["I do not understand. Is that a mining technique?", "Grix requires more time. Grix is a rock. Rocks are slow."],
    dates: ["You watch a meteor shower together. Grix names every meteor. Some of the names are very long.", "Poetry night at the lounge. Grix reads 'Ode to You (Part 9)'. The room goes silent. Then cheers."] },
  juno: { name: 'Juno Sparks', role: 'Engine-deck mechanic', make: () => makeCivilian('#c9a43a', '#3d3a36', '#8a5a3a', '#ff6aa8', '#3a3d44'), x: -12, z: 4, face: 1.2,
    likes: ['circuit', 'scrap', 'cog', 'cell'], loves: 'cell', perk: { txt: '+20% vehicle armor', k: 'veh' },
    lines: { 0: ["Hi! Sorry, I smell like engine grease. And coolant. And a little like fire.", "I can fix anything. Except my sleep schedule."], 1: ["Your ship's left thruster is out of alignment. I can hear it from here. Just saying.", "I built a toaster that makes toast in space. Nobody asked. I did it anyway."], 2: ["You're fun! Most pilots only talk to me when something explodes.", "Hey, wanna see the reactor? It's super safe. Mostly. Bring goggles."], 3: ["I tuned up your engines while you were gone. Is that weird? That's a love language, right?", "I keep doodling your ship on my clipboard. With hearts. For aerodynamics."], 4: ["Date idea: we take apart a robot and put it back together as two smaller, happier robots.", "You make my circuits short in the good way."], 5: ["Partners! I'm putting your name on my toolbox. In welding.", "If you ever break down out there, I'm coming to get you. With every wrench I own."] },
    flirtOk: ["Oh! Oh. Wow. Okay my face is overheating, give me a second.", "Did someone just turn up my thermostat or is that you?"], flirtNo: ["Haha, what? Sorry, I wasn't listening, there's a weird noise in the ceiling.", "That's sweet but I think you meant that for the toaster."],
    dates: ["You spend the night building a tiny robot together. It walks into a wall. You both cheer.", "A tour of the engine deck. Juno names every pipe. The pipes have backstories."] },
  rhett: { name: 'Rhett Calloway', role: 'Smuggler · smooth talker', make: () => makeCivilian('#3b4f7a', '#2c2a28', '#e0b892', '#5a3a22', '#c9a43a'), x: 12, z: 4, face: -1.2,
    likes: ['sandpearl', 'pearl', 'blackbox'], loves: 'sandpearl', perk: { txt: '+10% credits from everything', k: 'cr' },
    lines: { 0: ["Rhett Calloway. Legitimate businessman. Mostly legitimate. Partly a businessman.", "Whatever you heard, it was exaggerated. Except the part about the lizard."], 1: ["Back for more of my charm? Understandable.", "I've got a cargo hold full of... let's say 'mysteries'."], 2: ["You know, you're the first person in this bar who hasn't tried to arrest me.", "Stick with me, kid. I know every back door in this galaxy."], 3: ["I almost sold my ship for a ring. Then I remembered I live in my ship. Still thought about it.", "You've got a way of making a smuggler want to stay put."], 4: ["Dinner's on me. Well, it's on someone. I'll explain later.", "Every port I dock at, I look for you first."], 5: ["Partner in crime. Partner in everything.", "I'd go straight for you. ...Straight-ish."] },
    flirtOk: ["Well, well. Someone's been practicing.", "Keep talking like that and I'll start giving you discounts."], flirtNo: ["Oof. Smooth as a gravel road, friend.", "I've heard better lines from customs officers."],
    dates: ["A late-night run past a blockade. Nobody shoots at you. Rhett is weirdly disappointed.", "Dinner at a floating restaurant on Ocean World. Rhett pays in pearls. Questionable pearls."] },
  vesper: { name: 'Vesper', role: 'Refugee from Vector', make: () => makeCivilian('#1e1c22', '#1e1c22', '#d8d0e0', '#e8e4dc', '#c86aff'), x: 0, z: 10, face: Math.PI,
    likes: ['voidshard', 'essence', 'ghostchip'], loves: 'voidshard', perk: { txt: '+10% damage at night', k: 'night' },
    lines: { 0: ["Don't sit there. That seat is for the ghost. ...Kidding. Probably.", "I'm from Vector. Yes, the dark one. No, I don't want to talk about it."], 1: ["You're still alive. Interesting.", "The lights in here are too bright. I like them anyway."], 2: ["You're not afraid of me. Most people are. It's refreshing.", "I counted the stars tonight. One less than yesterday. Just thought you should know."], 3: ["When I'm with you the dark feels... smaller.", "I saved you a seat. Away from the ghost."], 4: ["Let's go somewhere with no light at all. I'll hold your hand so you don't trip.", "You're the first warm thing I've found since I left home."], 5: ["Partner. I've never said a word that felt so bright.", "If the Watcher ever comes back, it goes through me first."] },
    flirtOk: ["...Hm. Do that again.", "You're bold. I like bold. It glows."], flirtNo: ["No.", "Was that supposed to be charming? On Vector we'd call that a curse."],
    dates: ["You stargaze from the hull of the ship. Vesper knows the name of every dying star. She tells you the happy ones.", "A walk through the hydroponics bay at night. The plants glow. So does she, a little."] },
  pip9: { name: 'PIP-9', role: 'Robot studying love', make: () => recolor(makeXR17(), { '#9aa1aa': '#ff6aa8' }), rig: 'xr17', x: 0, z: -14, face: 0,
    likes: ['circuit', 'cog', 'cell'], loves: 'ghostchip', perk: { txt: '+10% XP from everything', k: 'xp' },
    lines: { 0: ["GREETINGS. I AM PIP-9. I AM RESEARCHING THE HUMAN EMOTION 'LOVE'. PLEASE FILL OUT THIS SURVEY.", "QUESTION ONE: WHY."], 1: ["YOU HAVE RETURNED. LOGGING: 'RETURNED'. HEART RATE: UNKNOWN. I DO NOT HAVE A HEART.", "I WATCHED 4,000 ROMANCE FILMS. CONCLUSION: RAIN IS INVOLVED."], 2: ["FRIENDSHIP DETECTED. ADDING YOU TO 'SPECIAL CONTACTS'. ALSO 'EMERGENCY CONTACTS'. ALSO 'DESKTOP WALLPAPER'.", "I HAVE LEARNED A JOKE. KNOCK KNOCK. ...I DO NOT KNOW WHO IS THERE. THAT IS THE JOKE."], 3: ["MY FANS SPIN FASTER WHEN YOU ARRIVE. TECHNICIANS SAY THIS IS 'NOT A DEFECT'.", "I HAVE COMPOSED A LOVE SONG. IT IS A DIAL-UP TONE. IT IS FOR YOU."], 4: ["DATE PROTOCOL INITIATED. PLEASE HOLD MY HAND. IT IS A CLAMP. PLEASE HOLD MY CLAMP.", "RESEARCH UPDATE: I THINK LOVE IS WHEN THE DATA DOES NOT MATTER."], 5: ["PARTNER STATUS CONFIRMED. UPDATING FIRMWARE TO 'HAPPY'.", "I DO NOT NEED THE SURVEY ANYMORE. I HAVE THE ANSWER. IT IS YOU."] },
    flirtOk: ["ERROR. ERROR. ...PLEASE DO THAT AGAIN, FOR SCIENCE.", "MY CHEEK LEDS ARE PINK. THIS HAS NEVER HAPPENED."], flirtNo: ["INPUT NOT RECOGNIZED. DID YOU MEAN 'HELLO'?", "THAT DID NOT COMPUTE. PLEASE REBOOT YOUR CHARM."],
    dates: ["You take PIP-9 to see rain on Zarlich. It stands in the storm for an hour. 'I UNDERSTAND THE FILMS NOW.'", "A walk through the arcade. PIP-9 wins every claw machine and gives you every prize."] }
};
const romS = () => { S.rom = S.rom || {}; return S.rom; };
const romOf = id => { const R = romS(); R[id] = R[id] || { aff: 0, t: 0, d: 0, g: 0 }; return R[id]; };
const romStage = aff => { let i = 0; for (let k = 0; k < ROM_STAGES.length; k++) if (aff >= ROM_STAGES[k][0]) i = k; return i; };
const romPartner = () => Object.keys(romS()).find(id => romS()[id].partner);
const romPerk = k => { const p = romPartner(); return p && ROMANCE[p] && ROMANCE[p].perk.k === k; };
function barNpcs() {
  const list = [{ id: 'moe', name: 'Moe-bot', role: 'Bartender · heals', rig: 'xr17', make: () => recolor(makeXR17(), { '#9aa1aa': '#c9a43a' }), x: 0, z: -20, face: 0, heal: true, idle: ["WHAT'LL IT BE. I RECOMMEND THE NEBULA FIZZ. IT IS BLUE AND LEGALLY A BEVERAGE.", "I HEAR EVERYTHING. I REPEAT NOTHING. EXCEPT TO THE OTHER BARTENDER BOTS."] }];
  for (const [id, R] of Object.entries(ROMANCE)) list.push({ id: 'rom_' + id, romId: id, name: R.name, role: R.role, rig: R.rig || 'civ', make: R.make, x: R.x, z: R.z, face: R.face, custom: [['♥ Hang out', () => openRomance(id)]], idle: R.lines[0] });
  return list;
}
function romHeart(aff) { const n = Math.round(aff / 10); return '♥'.repeat(n) + '♡'.repeat(10 - n); }
function openRomance(id) {
  const R = ROMANCE[id], M = romOf(id), st = romStage(M.aff), now = Date.now(), partner = romPartner();
  openDlg(`${R.role} · ${ROM_STAGES[st][1]} ${romHeart(M.aff)}`, R.name);
  const say = t => { $('dlgLine').textContent = t; SFX.babble && SFX.babble(voicePitch(R.name), Math.min(14, 4 + (t.length >> 4))); };
  const lines = R.lines[st] || R.lines[0]; say(lines[randi(0, lines.length - 1)]);
  const gain = (n, why) => { const was = romStage(M.aff); M.aff = clamp(M.aff + n, 0, 100); const now2 = romStage(M.aff); markDirty(); if (now2 > was) { toast(`${R.name.toUpperCase()}`, `You're now: ${ROM_STAGES[now2][1]}`, 3); SFX.quest(); } if (n > 0) burst(npcObjs['rom_' + id] ? npcObjs['rom_' + id].obj.position.clone().add(V(0, 2, 0)) : player.pos.clone(), '#ff6aa8', 8, 2); };
  const back = () => setTimeout(() => openRomance(id), 1600);
  const cd = (k, s) => now - (M[k] || 0) < s * 1000;
  acts([
    ['Chat', () => { if (cd('t', 45)) { say(`${R.name.split(' ')[0]} smiles. "We just talked! Go shoot something and come back with stories."`); return; } M.t = now; gain(3); say(lines[randi(0, lines.length - 1)]); back(); }, true],
    ['Flirt', () => { if (cd('f', 60)) { say('Maybe give it a minute. Charm needs to recharge.'); return; } M.f = now; if (st >= 2 || Math.random() < 0.25) { gain(5); say(R.flirtOk[randi(0, R.flirtOk.length - 1)]); } else { gain(-1); say(R.flirtNo[randi(0, R.flirtNo.length - 1)]); } back(); }],
    ['Give a gift', () => romGift(id)],
    ['Ask on a date (300 cr)', () => { if (st < 3) { say(st < 2 ? "A date? I don't even know your middle name. Do you have a middle name?" : "Let's be friends a little longer first. Ask me again soon."); return; } if (partner && partner !== id) { say(`Aren't you with ${ROMANCE[partner].name}? I'm not getting in the middle of that.`); return; } if (cd('d', 180)) { say("We JUST went out! Pace yourself, hotshot."); return; } if (S.cr < 300) { say("Date night costs credits. Go earn some, I'll wait."); return; } S.cr -= 300; M.d = now; M.dates = (M.dates || 0) + 1; gain(10); say(R.dates[randi(0, R.dates.length - 1)]); SFX.level(); back(); }],
    ...(st >= 5 && !M.partner && !partner ? [['💍 Ask to be partners', () => { Object.values(romS()).forEach(o => { o.partner = false; }); M.partner = true; markDirty(); toast('PARTNERS', `${R.name} said yes! Perk: ${R.perk.txt}`, 5); SFX.level(); say(R.lines[5][0]); }, true]] : []),
    ...(M.partner ? [['Break up', () => { M.partner = false; M.aff = 40; markDirty(); say("...Okay. I get it. Fly safe out there."); }]] : []),
    ['Bye', closeDlg]]);
}
function romGift(id) {
  const R = ROMANCE[id], M = romOf(id);
  const have = Object.keys(S.inv).filter(k => S.inv[k] > 0 && ITEMS[k] && !ITEMS[k].quest).sort((a, b) => (R.loves === b) - (R.loves === a) || R.likes.includes(b) - R.likes.includes(a));
  if (!have.length) { $('dlgLine').textContent = "You pat your pockets. Nothing to give. Awkward."; return; }
  $('dlgLine').textContent = `What do you give ${R.name.split(' ')[0]}? (They like: ${R.likes.map(k => ITEMS[k] ? ITEMS[k].name : k).join(', ')}${ITEMS[R.loves] ? '; they LOVE ' + ITEMS[R.loves].name : ''}. Fish work too.)`;
  acts([...have.slice(0, 6).map(k => [`${ITEMS[k].name} (${S.inv[k]})`, () => {
    if (Date.now() - (M.g || 0) < 30000) { $('dlgLine').textContent = '"You just gave me something! Save some for later."'; return; }
    S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; M.g = Date.now();
    const love = k === R.loves, like = R.likes.includes(k) || (ITEMS[k].fish && id !== 'pip9'), n = love ? 12 : like ? 6 : 1;
    const was = romStage(M.aff); M.aff = clamp(M.aff + n, 0, 100); markDirty(); if (romStage(M.aff) > was) toast(R.name.toUpperCase(), `You're now: ${ROM_STAGES[romStage(M.aff)][1]}`, 3);
    $('dlgLine').textContent = love ? `"Is this... a ${ITEMS[k].name}? For ME? Nobody's ever gotten me exactly the right thing before."` : like ? `"Oh, nice! I can actually use this. Thanks!"` : `"A... ${ITEMS[k].name}. Huh. Thank you? I'll... find a shelf for it."`;
    SFX.item(); setTimeout(() => openRomance(id), 1800); }]), ['Never mind', () => openRomance(id)]]);
}
// partner perks
{ const _g = gainXp; gainXp = function (n) { return _g(romPerk('xp') ? Math.round(n * 1.1) : n); }; }
setInterval(() => { try { if (state !== 'play') return; if (romPerk('hp') && player.alive && player.hp < maxHp() * 1.1 && !LEVEL.fly) player.hp = Math.min(maxHp() * 1.1, player.hp + 0.4); } catch (_) {} }, 500);
{ const _k = kill; kill = function (e) { const r = _k(e); if (romPerk('cr') && e.def && e.def.cr) S.cr += Math.round((e.def.cr[0] + e.def.cr[1]) * 0.05); return r; }; }
{ const _h = hurt; hurt = function (dmg, src) { if (typeof VH !== 'undefined' && VH.on && romPerk('veh')) dmg *= 0.8; return _h(dmg, src); }; }
// partners send messages now and then
setInterval(() => { try { const p = romPartner(); if (!p || state !== 'play' || Math.random() > 0.35) return; const R = ROMANCE[p]; log(`${R.name}: "${R.lines[5][randi(0, 1)]}"`, 'chat'); } catch (_) {} }, 240000);
// your partner hangs out on your ship
// (partner/roommate spawning on the ship lives in residential.js)
// the lounge itself
function buildBar(T, W, D, H, rnd) {
  // long bar counter with stools and a glowing bottle wall
  part(props, B(16, 1.1, 1.4), toon('#5a3a22', 'wood'), 0, 0.55, -18); part(props, B(16.4, 0.12, 1.7), '#c9a43a', 0, 1.15, -18); box(0, -18, 8, 0.8);
  part(props, B(18, 4, 0.4), toon('#3a2a1e', 'wood'), 0, 2, -D + 0.6);
  for (let r = 0; r < 3; r++) { part(props, B(16, 0.1, 0.5), '#2b2a2c', 0, 1.6 + r * 0.9, -D + 0.9); for (let i = 0; i < 18; i++) part(props, Cy(0.08, 0.08, 0.5, 6), glow(['#ff6aa8', '#4fd2ff', '#ffd36a', '#7fff6a', '#c86aff'][(i + r) % 5]), -7.6 + i * 0.9, 1.92 + r * 0.9, -D + 0.9); }
  for (let i = 0; i < 9; i++) { const x = -7 + i * 1.75; part(props, Cy(0.28, 0.28, 0.1, 10), toon('#c8402f', 'cloth'), x, 0.8, -16.6); part(props, Cy(0.05, 0.05, 0.75, 5), '#2b2a2c', x, 0.4, -16.6); solid(x, -16.6, 0.3); }
  // round tables with candles, booths along the walls
  for (const [x, z] of [[-8, -4], [8, -4], [-14, 14], [14, 14], [-10, 16], [10, 16]]) { part(props, Cy(0.9, 0.9, 0.08, 14), toon('#3a2a1e', 'wood'), x, 0.85, z); part(props, Cy(0.1, 0.18, 0.8, 6), '#2b2a2c', x, 0.4, z); part(props, Cy(0.06, 0.06, 0.15, 6), glow('#ffb347'), x, 0.97, z); solid(x, z, 1); for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4; part(props, Cy(0.25, 0.25, 0.5, 8), toon('#5a2a4a', 'cloth'), x + Math.cos(a) * 1.3, 0.25, z + Math.sin(a) * 1.3); } }
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const z = -10 + i * 7; part(props, B(1.6, 1.2, 3.6), toon('#7a2a4a', 'cloth'), s * (W - 1.4), 0.6, z); part(props, B(0.4, 2.2, 3.6), toon('#7a2a4a', 'cloth'), s * (W - 0.5), 1.1, z); part(props, B(1.4, 0.08, 1.6), toon('#3a2a1e', 'wood'), s * (W - 3.2), 0.85, z); box(s * (W - 1.6), z, 1.5, 1.9); }
  // little stage with a hologram singer and neon sign
  part(props, Cy(4, 4, 0.5, 20), toon('#2b2a2c', 'panel'), 0, 0.25, 23); box(0, 23, 4, 3); const holo = part(props, new THREE.ConeGeometry(0.6, 2.2, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#ff6aa8', transparent: true, opacity: 0.45, side: THREE.DoubleSide }), 0, 1.6, 23);
  levelAnims.push(t => { holo.rotation.y = t * 1.5; holo.material.opacity = 0.35 + Math.sin(t * 6) * 0.12; });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.4), new THREE.MeshBasicMaterial({ map: signTex('STARLIGHT LOUNGE', '#1e0e1a', '#ff6aa8') })); sg.position.set(0, 5.6, -D + 0.9); levelGroup.add(sg);
  // warm pink light + a slow disco ball
  const lamp = new THREE.PointLight(0xff6aa8, 0.9, 40, 1.6); lamp.position.set(0, 5, 6); levelGroup.add(lamp);
  const ball = part(props, new THREE.IcosahedronGeometry(0.6, 1), glow('#e8e4dc'), 0, H - 1, 6); props.remove(ball); levelGroup.add(ball); levelAnims.push(t => { ball.rotation.y = t * 0.8; });
  const sp = []; for (let i = 0; i < 24; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ color: ['#ff6aa8', '#4fd2ff', '#ffd36a'][i % 3], transparent: true, opacity: 0.6, depthWrite: false })); d.rotation.x = -Math.PI / 2; levelGroup.add(d); sp.push(d); }
  levelAnims.push(t => sp.forEach((d, i) => { const a = t * 0.4 + i * 0.26, r = 4 + (i % 5) * 3; d.position.set(Math.cos(a) * r, 0.05, 6 + Math.sin(a) * r * 0.8); }));
}
