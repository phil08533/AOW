// =================== QUESTS v2: many quests at once, across planets ===================
// Each quest: giver/turnIn NPC ids, req (quests that must be done), objectives of kind
// kill / item / reach / level. "found" quests start from an object in the world instead of an NPC.
const QDEFS = {};
const QORDER = [];
function defQuest(id, q) { q.id = id; QDEFS[id] = q; QORDER.push(id); }
// ---- Earth: Chapter 1 ----
defQuest('q1', { ch: 'Earth · Chapter 1', title: 'Welcome to Earth', giver: 'vega', turnIn: 'vega', req: [], main: true,
  intro: ["You made it through the drop. Good. I'm Captain Vega, I run this Safe Zone.",
    "Earth was quiet for years, until the sun started setting red. Three nights ago Drome's ships hit the scrapyard and everything out there went wild.",
    "Start small, rookie. The dogs past the gate have gone rabid. Thin them out."],
  obj: [{ kind: 'kill', t: 'dog', n: 4, text: 'Defeat wild dogs in the Outskirts', zone: 'out' }],
  outro: ["Not bad for your first day. But dogs aren't the real problem. Go see the machines."], reward: { cr: 40, xp: 60 } });
defQuest('q2', { ch: 'Earth · Chapter 1', title: 'Rogue Machines', giver: 'vega', turnIn: 'tully', req: ['q1'], main: true,
  intro: ["The XR-17 patrol bots in the Robot Scrapyard to the east turned on us the same night Drome landed.",
    "Put some down and bring their scrap to Tully, our gunsmith. He'll want to see what's inside them."],
  obj: [{ kind: 'kill', t: 'xr17', n: 5, text: 'Destroy XR-17s in the Scrapyard', zone: 'scrap' }, { kind: 'item', t: 'scrap', n: 3, text: 'Bring Robot Scrap to Tully', zone: 'scrap' }],
  outro: ["Scrap! Lovely. Look at this chip... someone burned a red mark into it. That's not a malfunction, that's an order.",
    "Here. Take this Lvl 5 Blaster, on the house. You'll need it."], reward: { xp: 110, gun: 'b5', take: { scrap: 3 }, tip: 'Tip: Robot Scrap builds floors and walls. Press Build to start a base outside town.' } });
defQuest('q3', { ch: 'Earth · Chapter 1', title: 'Marked Bugs', giver: 'mira', turnIn: 'mira', req: ['q2'], main: true,
  intro: ["I've stitched up six people today. All bitten by bugs that never used to come near the Safe Zone.",
    "Something is driving them. Bring me Bug Shells from the Bug Grounds to the west and I'll find out what."],
  obj: [{ kind: 'item', t: 'shell', n: 4, text: 'Collect Bug Shells in the Bug Grounds', zone: 'bug' }],
  outro: ["The same red mark, grown right into the shell. Drome isn't just attacking us. He's controlling the wildlife.",
    "You can't fight that alone. A Master landed at the airport this morning. Talk to him."], reward: { cr: 120, xp: 160, take: { shell: 4 } } });
defQuest('q4', { ch: 'Earth · Chapter 1', title: 'The Gun Master', giver: 'elismas', turnIn: 'elismas', req: ['q3'], main: true,
  intro: ["I am Elismas, Master of the Gun. I have followed Drome across three worlds.",
    "Masters do not teach the weak. The raider chief Gor-Tak rules the Alien Camp to the south. He takes Drome's credits.",
    "Bring me his spear tip and I will give you a Master's reward."],
  obj: [{ kind: 'item', t: 'spear', n: 1, text: "Take Gor-Tak's spear tip in the Alien Camp", zone: 'camp' }],
  outro: ["You fight like one of my own. Take the Unlimited Ammo Clip. Your gun will never run dry.",
    "Go to your captain. Her scouts have found where Drome hides."], reward: { xp: 280, clip: true, take: { spear: 1 } } });
defQuest('q5', { ch: 'Earth · Chapter 1', title: "Drome's Outpost", giver: 'vega', turnIn: 'vega', req: ['q4'], main: true,
  intro: ["Scouts found it. Drome built an outpost past the Alien Camp, to the southwest. Black walls, red banners, can't miss it.",
    "He's the one marking the machines and the bugs. End this."],
  obj: [{ kind: 'item', t: 'sigil', n: 1, text: 'Defeat Drome and take his sigil', zone: 'drome' }],
  outro: ["You did it. Earth's sun can set normal again.",
    "This sigil is a star map, and it points to Mezar. Drome was only a scout. Whatever sent him is still out there.",
    "So the Corps is giving you a ship. The Setting Sun. She's small, but you can add rooms as you go. She's waiting on the landing pad."],
  reward: { cr: 600, xp: 600, take: { sigil: 1 }, ship: true } });
defQuest('s1', { ch: 'Earth · Side job', title: "Zib's Order", giver: 'zib', turnIn: 'zib', req: ['q2'],
  intro: ["Psst. Zib has a buyer on the Zeltac ship who wants Rock Cores. Big ones.", "Rock Monsters live up on Rock Mesa, south and east. Bring three, Zib pays extra."],
  obj: [{ kind: 'item', t: 'core', n: 3, text: 'Bring Rock Cores to Zib', zone: 'rock' }],
  outro: ["Beautiful cores! Zib's buyer will be very happy. Here, extra credits as promised."], reward: { cr: 260, xp: 200, take: { core: 3 } } });
defQuest('s2', { ch: 'Earth · Side job', title: 'Pelts for the Clinic', giver: 'mira', turnIn: 'mira', req: ['q1'],
  intro: ["Nights are getting cold and the clinic is short on blankets.", "Dog pelts would do it. Five should be enough."],
  obj: [{ kind: 'item', t: 'pelt', n: 5, text: 'Collect Dog Pelts', zone: 'out' }],
  outro: ["Warm and only slightly smelly. Thank you. Take these, you'll need them more than I do."], reward: { cr: 60, xp: 90, take: { pelt: 5 }, items: { medkit: 3 } } });
// ---- Mezar: Chapter 2 ----
defQuest('m1', { ch: 'Mezar · Chapter 2', title: 'Landfall', giver: 'vega', turnIn: 'bugmaster', req: ['q5'], main: true,
  intro: ["The sigil's map points to Mezar, the ringed desert world. Bug country.",
    "There's a Master there too, they call him the Bug Master. If anyone knows who sent Drome, he does.",
    "Take your ship. Use the galaxy map on the bridge."],
  obj: [{ kind: 'reach', zone: 'hive', planet: 'mezar', n: 1, text: 'Fly to Mezar and enter Bug City' }],
  outro: ["A gunner from Earth. Drome's killer. The hive heard you coming.",
    "Drome served the one we call the Setting Sun. He eats worlds, little gunner. Earth was a taste.",
    "Stay. Help my hive and I will tell you where he hides."], reward: { cr: 150, xp: 500 } });
defQuest('m2', { ch: 'Mezar · Chapter 2', title: 'Ant Problem', giver: 'bugmaster', turnIn: 'bugmaster', req: ['m1'], main: true,
  intro: ["The ants of the eastern hills attack in swarms now. Black ones and red ones. The red ones burn.",
    "They carry the same red mark as Drome's machines. Break the swarm."],
  obj: [{ kind: 'kill', t: 'ant', n: 8, text: 'Defeat black ants in the Ant Hills', zone: 'ants' }, { kind: 'kill', t: 'redant', n: 4, text: 'Defeat red ants', zone: 'ants' }],
  outro: ["The swarm scatters. Good.", "Thrax has been waiting to arm someone worth arming. Go see him."], reward: { cr: 300, xp: 700 } });
defQuest('m3', { ch: 'Mezar · Chapter 2', title: 'Scales for Thrax', giver: 'thrax', turnIn: 'thrax', req: ['m2'], main: true,
  intro: ["Hive steel needs snorfal scale. Those spiked brutes live out in the Sand Dome Desert, south.",
    "Bring me five scales and I'll build you a Hive Repeater. Forty shots a mag."],
  obj: [{ kind: 'item', t: 'scale', n: 5, text: 'Collect Snorfal Scales in the desert', zone: 'dunes' }],
  outro: ["Good scales. Hold still... there. The Lvl 20 Hive Repeater. It hums when it's hungry."], reward: { xp: 900, gun: 'h20', take: { scale: 5 } } });
defQuest('m4', { ch: 'Mezar · Found', title: 'Signal in the Sand', found: true, giver: null, turnIn: 'sela', req: ['m1'],
  intro: ["An Earth beacon, half buried. It's still blinking a distress code: TRANSPORT 7 DOWN.", "The signal points further into the dunes, to the east."],
  obj: [{ kind: 'item', t: 'blackbox', n: 1, text: 'Find the crash site and pull the flight recorder', zone: 'dunes' }],
  outro: ["That's my ship's recorder! Let me hear it...", "...we were shot down by red bolts. Drome's color. They knew we were coming.", "Thank you, trooper. Take my old gauntlets, they kept me alive out here."],
  reward: { cr: 250, xp: 800, take: { blackbox: 1 }, gear: 'gaunt' } });
defQuest('m5', { ch: 'Mezar · Chapter 2', title: 'The Gut Pit', giver: 'bugmaster', turnIn: 'bugmaster', req: ['m3'], main: true,
  intro: ["Under the desert lives the Gut Worm Matriarch. The Setting Sun marked her first, and every worm she births carries his mark.",
    "Kill her, little gunner. Bring me her heart. The Gut Pit is far to the southwest."],
  obj: [{ kind: 'item', t: 'wormheart', n: 1, text: "Defeat the Matriarch and take her heart", zone: 'pit' }],
  outro: ["The hive is free. You have my thanks, and a Master's gift: the Power Ring.",
    "Now listen. The Setting Sun's next mark is Capitone, the frozen forest world. Maxurge guards it, the Master of the Staff.",
    "Go when you are ready."], reward: { cr: 1200, xp: 2000, take: { wormheart: 1 }, gear: 'ring' } });
defQuest('ms1', { ch: 'Mezar · Side job', title: 'Wax Works', giver: 'kix', turnIn: 'kix', req: ['m1'],
  intro: ["Kix makes hive wax. Hive wax needs ant mandibles. Eight! Kix pays good."],
  obj: [{ kind: 'item', t: 'mandible', n: 8, text: 'Collect Ant Mandibles', zone: 'ants' }],
  outro: ["Eight! Kix counts eight! Here, credits and something shiny."], reward: { cr: 500, xp: 600, take: { mandible: 8 }, items: { crystal: 2 } } });
defQuest('ms2', { ch: 'Mezar · Side job', title: 'Oasis Patrol', giver: 'vexa', turnIn: 'vexa', req: ['m1'],
  intro: ["Skyrenes have taken the Glass Oasis to the west. My herbs grow there.", "Clear them out, gently or not."],
  obj: [{ kind: 'kill', t: 'skyrene', n: 5, text: 'Drive the Skyrenes from the Glass Oasis', zone: 'oasis', planet: 'mezar' }],
  outro: ["The herbs are safe. This cape is woven with oasis silk. Light as wind, it'll make you quicker."], reward: { cr: 300, xp: 700, gear: 'cape' } });
defQuest('ms3', { ch: 'Mezar · Side job', title: 'Bug-bug Hunt', giver: 'sela', turnIn: 'sela', req: ['m4'],
  intro: ["Those little flying beetles, bug-bugs, chew through radio wire. I need their shells to fix mine.", "Four chitin plates should do."],
  obj: [{ kind: 'item', t: 'chitin', n: 4, text: 'Collect Bug-bug Chitin', zone: 'ants' }],
  outro: ["Radio's back up. I can hear the Corps again. Here, a jetpack I salvaged. Hold jump in the air to hover."], reward: { cr: 300, xp: 800, take: { chitin: 4 }, gear: 'jet' } });

// ---- Capitone: Chapter 3 ----
defQuest('c1', { ch: 'Capitone · Chapter 3', title: 'The Giant Tree', giver: 'bugmaster', turnIn: 'maxurge', req: ['m5'], main: true,
  intro: ["Capitone waits, little gunner. Forests on forests, then ice, then fire.", "Find the Giant Tree. Maxurge lives in its roots."],
  obj: [{ kind: 'reach', zone: 'tree', planet: 'capitone', n: 1, text: 'Fly to Capitone and reach the Giant Tree' }],
  outro: ["So. The gunner who killed Drome and the Matriarch.", "I am Maxurge, Master of the Staff. The Setting Sun has put his mark on my world too. Let us see what you can do."], reward: { cr: 400, xp: 2500 } });
defQuest('c2', { ch: 'Capitone · Chapter 3', title: 'Quills and Thorns', giver: 'maxurge', turnIn: 'maxurge', req: ['c1'], main: true,
  intro: ["The Quillbacks of the Fern Forest east of here used to be gentle grazers.", "Now they shoot anyone who passes. Six of them, gunner. Mind the jumpers in the trees."],
  obj: [{ kind: 'kill', t: 'porcupine', n: 6, text: 'Defeat Quillbacks in the Fern Forest', zone: 'fern' }],
  outro: ["Good. The ferns are quiet again.", "Quill has something for you, he says. Then come back to me."], reward: { cr: 600, xp: 3200, items: { medkit: 2 } } });
defQuest('c3', { ch: 'Capitone · Chapter 3', title: 'What the Forest Forgot', giver: 'maxurge', turnIn: 'elder', req: ['c2'], main: true,
  intro: ["West, past the river, is the Forgotten Forest. The Nomines drift there, memories of the old people.", "Their essence can show us where the Setting Sun's mark began. Bring four to Elder Bark."],
  obj: [{ kind: 'item', t: 'essence', n: 4, text: 'Collect Nomine Essence in the Forgotten Forest', zone: 'forgot' }],
  outro: ["Let me see... yes. The mark began in the volcano, where the Setting Sun's army dug in.", "And it spread up the mountain to our guardian. The Frost King."], reward: { cr: 800, xp: 4000, take: { essence: 4 } } });
defQuest('c4', { ch: 'Capitone · Chapter 3', title: 'Fire Under Ice', giver: 'lio', turnIn: 'lio', req: ['c3'], main: true,
  intro: ["The Volcano Base. Drome's old crew still runs it, under a commander named Vask.", "Break their guard and take Vask's keycard. It opens the mountain gate."],
  obj: [{ kind: 'kill', t: 'guard', n: 4, text: 'Destroy guard bots at the Volcano Base', zone: 'volcano' }, { kind: 'item', t: 'keycard', n: 1, text: "Defeat Commander Vask, take the keycard", zone: 'volcano' }],
  outro: ["The keycard! And the base is burning. Ha!", "The Lvl 30 Frost Carbine was Vask's prize. It's yours now."], reward: { cr: 1200, xp: 5200, take: { keycard: 1 }, gun: 'f30' } });
defQuest('c5', { ch: 'Capitone · Chapter 3', title: 'The Frost King', giver: 'maxurge', turnIn: 'maxurge', req: ['c4'], main: true,
  intro: ["The Frost King guarded Capitone for an age. Now he guards the Setting Sun's way in.", "He waits at the top of the Mountain of the Lost, far to the southeast. Free him, gunner. Bring me his crown."],
  obj: [{ kind: 'item', t: 'crown', n: 1, text: 'Defeat the Frost King and take his crown', zone: 'mount' }],
  outro: ["He is free. Thank you.", "My gift: the Eye Accelerator. Your hands will move faster than you can think.", "The Setting Sun builds his army in Robot City. Every machine there wears his mark. That is where this ends."],
  reward: { cr: 3000, xp: 8000, take: { crown: 1 }, gear: 'eye' } });
defQuest('cs1', { ch: 'Capitone · Side job', title: 'Snofel Fluff', giver: 'fenn', turnIn: 'fenn', req: ['c1'],
  intro: ["Snofel fluff makes the warmest coats in the galaxy. Careful, they grow when they're angry.", "Six tufts. The Frozen Plains, south."],
  obj: [{ kind: 'item', t: 'fluff', n: 6, text: 'Collect Snofel Fluff on the Frozen Plains', zone: 'frozen' }],
  outro: ["So soft! Fenn pays double for fluff this good."], reward: { cr: 900, xp: 3000, take: { fluff: 6 } } });
defQuest('cs2', { ch: 'Capitone · Side job', title: 'Jumpers!', giver: 'elder', turnIn: 'elder', req: ['c1'],
  intro: ["Tree jumpers drop out of the branches onto travelers.", "Teach six of them some manners."],
  obj: [{ kind: 'kill', t: 'jumper', n: 6, text: 'Defeat Tree Jumpers', zone: 'fern' }],
  outro: ["The paths are safer. The tree thanks you."], reward: { cr: 700, xp: 2800, items: { medkit: 3, crystal: 2 } } });
defQuest('cf1', { ch: 'Capitone · Found', title: 'The Lost Climber', found: true, grant: 'journal', giver: null, turnIn: 'lio', req: ['c1'],
  intro: ["A frozen pack, half buried in snow. The name tag says LIO'S BROTHER, KAL.", "Inside: a climber's journal. Scout Lio should have this."],
  obj: [{ kind: 'item', t: 'journal', n: 1, text: "Bring Kal's journal to Scout Lio", zone: 'mount' }],
  outro: ["That's... Kal's handwriting.", "He made it further up than anyone. Thank you for bringing him home, in a way. Take his savings. He'd want it used."],
  reward: { cr: 2000, xp: 3000, take: { journal: 1 } } });

const GEAR = {
  gaunt: { name: 'Combat Gauntlets', desc: '+25% max health', col: '#c9a43a' },
  ring: { name: 'Power Ring', desc: '+15% damage', col: '#c86aff' },
  cape: { name: 'Oasis Cape', desc: '+12% run speed', col: '#3f7d7a' },
  jet: { name: 'Salvaged Jetpack', desc: 'Hold jump in the air to hover', col: '#ff9a3c' },
  eye: { name: 'Eye Accelerator', desc: '+15% fire rate', col: '#9fe8ff' }
};
const hasGear = (id) => (S.gear || []).includes(id);
// which planet each NPC lives on
const NPC_HOME = {};
function indexNpcs() { for (const id in LEVELS) for (const n of LEVELS[id].npcs || []) NPC_HOME[n.id] = id; }
const npcName = (id) => { for (const L in LEVELS) { const n = (LEVELS[L].npcs || []).find(k => k.id === id); if (n) return n.name; } return id; };
const qState = (id) => S.qst[id] || null;
const qDone = (id) => !!(S.qst[id] && S.qst[id].st === 'done');
function qAvailable(id) { const q = QDEFS[id]; return !q.found && !S.qst[id] && q.req.every(qDone); }
function objPlanet(q, o) { return o.planet || NPC_HOME[q.turnIn] || NPC_HOME[q.giver] || 'earth'; }
function objHave(o, p) { return o.kind === 'item' ? Math.min(o.n, S.inv[o.t] || 0) : o.kind === 'level' ? Math.min(o.n, S.lvl) : Math.min(o.n, p || 0); }
const objDone = (o, p) => objHave(o, p) >= o.n;
function questWants(item) { for (const id in S.qst) { const s = S.qst[id]; if (s.st !== 'active' && s.st !== 'ready') continue; if (QDEFS[id].obj.some(o => o.kind === 'item' && o.t === item)) return true; } return false; }
function questNeed(item) { let n = 0; for (const id in S.qst) { const s = S.qst[id]; if (s.st !== 'active' && s.st !== 'ready') continue; for (const o of QDEFS[id].obj) if (o.kind === 'item' && o.t === item) n = Math.max(n, o.n); } return n; }
function startQuest(id, silent) {
  const q = QDEFS[id]; S.qst[id] = { st: 'active', p: q.obj.map(() => 0) }; S.track = id; if (q.onStart) q.onStart();
  if (!silent) { log('Quest started: ' + q.title); toast('NEW QUEST', q.title); SFX.quest(); }
  markDirty(); checkReady();
}
function foundQuest(id) {
  const q = QDEFS[id];
  if (S.qst[id] || !q.req.every(qDone)) { openDlg('Found', q.title); $('dlgLine').textContent = S.qst[id] ? (qDone(id) ? 'Nothing more here.' : 'The beacon keeps blinking. You already have this lead.') : 'A faint signal. You are not ready to follow it yet.'; acts([['Close', closeDlg]]); return; }
  openDlg('Something found', q.title); SFX.talk();
  say(q.intro, () => acts([['Follow the lead', () => { if (q.grant) { S.inv[q.grant] = 1; log('+1 ' + ITEMS[q.grant].name, 'loot'); } startQuest(id); closeDlg(); }, true], ['Leave it', closeDlg]]));
}
function checkReady() {
  for (const id in S.qst) {
    const s = S.qst[id]; if (s.st !== 'active') continue;
    const q = QDEFS[id];
    if (q.obj.every((o, k) => objDone(o, s.p[k]))) { s.st = 'ready'; log(`Quest ready: ${q.title}. Return to ${npcName(q.turnIn)}.`); toast('OBJECTIVE COMPLETE', q.title); refreshNpcs(); markDirty(); }
  }
  renderQuest();
}
function questProgressKill(type) {
  for (const id in S.qst) { const s = S.qst[id]; if (s.st !== 'active') continue; QDEFS[id].obj.forEach((o, k) => { if (o.kind === 'kill' && o.t === type && (s.p[k] || 0) < o.n) s.p[k] = (s.p[k] || 0) + 1; }); }
}
function questProgressReach() {
  let changed = false;
  for (const id in S.qst) { const s = S.qst[id]; if (s.st !== 'active') continue; QDEFS[id].obj.forEach((o, k) => {
    if (o.kind !== 'reach' || (s.p[k] || 0) >= o.n || objPlanet(QDEFS[id], o) !== LEVEL.id) return;
    const z = Z[o.zone]; if (z && Math.hypot(player.pos.x - z.x, player.pos.z - z.z) < z.r) { s.p[k] = 1; changed = true; } }); }
  if (changed) { markDirty(); checkReady(); }
}
function completeQuest(id) {
  const q = QDEFS[id], r = q.reward, s = S.qst[id];
  if (r.take) for (const k in r.take) { S.inv[k] = Math.max(0, (S.inv[k] || 0) - r.take[k]); if (!S.inv[k]) delete S.inv[k]; }
  if (r.cr) S.cr += r.cr;
  if (r.items) for (const k in r.items) { S.inv[k] = (S.inv[k] || 0) + r.items[k]; log(`+${r.items[k]} ${ITEMS[k].name}`, 'loot'); }
  if (r.gun && !S.guns.includes(r.gun)) { S.guns.push(r.gun); S.gun = r.gun; player.ammo = gun().mag; log('New gun: ' + GUNS[r.gun].name, 'loot'); }
  if (r.melee) { S.melees = S.melees || ['knife']; if (!S.melees.includes(r.melee)) S.melees.push(r.melee); S.melee = r.melee; log('New melee weapon: ' + MELEE[r.melee].name, 'loot'); }
  if (r.clip) { S.clip = true; log('Unlimited Ammo Clip equipped. No more reloads.', 'loot'); }
  if (r.gear && !hasGear(r.gear)) { S.gear.push(r.gear); log(`Master gear: ${GEAR[r.gear].name} (${GEAR[r.gear].desc})`, 'loot'); }
  if (r.ship) { S.ship.unlocked = true; if (LEVEL.id === 'earth') INTERACTS.push({ x: LEVEL.pad.x, z: LEVEL.pad.z, r: 4, label: 'Board your ship', fn: () => boardShip() }); }
  if (r.tip) log(r.tip, 'loot');
  if (r.fn) r.fn();
  if (r.cape) { S.flags = S.flags || {}; S.flags[r.cape] = true; log(`Unlocked: ${CAPES[r.cape].name}. Wear it from the Wardrobe.`, 'loot'); }
  s.st = 'done'; if (S.track === id) S.track = null; if (q.repeat) delete S.qst[id];
  log(`Quest complete: ${q.title} (+${r.xp} XP${r.cr ? `, +${r.cr} cr` : ''})`);
  gainXp(r.xp);
  if (r.ship) toast('YOUR SHIP IS READY', 'Board the Setting Sun at the landing pad', 5);
  else if (r.gear) toast('MASTER GEAR', GEAR[r.gear].name, 4);
  else toast('QUEST COMPLETE', q.title);
  setTimeout(() => burp('quest'), 1200);
  SFX.quest();
  // the next main quest from the same person starts the conversation going
  markDirty(); refreshNpcs(); renderQuest();
}
function npcMark(id) {
  let m = null;
  for (const qid of QORDER) { const q = QDEFS[qid], s = S.qst[qid];
    if (s && s.st === 'ready' && q.turnIn === id) return '?';
    if (!m && q.giver === id && qAvailable(qid)) m = '!'; }
  if (m) return m;
  const n = npcObjs[id] && npcObjs[id].def;
  if (n && n.romId) return '♥';
  if (n && (n.shop || n.bank || n.heal || n.shipwright || n.bookie || n.arenaMaster || n.racer || n.petshop || n.marshal || n.racemaster || n.garage || n.custom)) return '$';
  return null;
}
function talk(id) {
  const N = npcObjs[id], n = N.def; openDlg(n.role, n.name); SFX.talk();
  for (const qid of QORDER) { const q = QDEFS[qid], s = S.qst[qid];
    if (s && s.st === 'ready' && q.turnIn === id) return say(q.outro, () => acts([['Complete quest', () => { completeQuest(qid); closeDlg(); }, true]])); }
  for (const qid of QORDER) { const q = QDEFS[qid];
    if (q.giver === id && qAvailable(qid) && !(S.skipIntro && Date.now() - (S.skipIntro[id] || 0) < 60000)) return say(q.intro, () => acts([['Accept quest', () => { startQuest(qid); closeDlg(); const nd = npcObjs[id] && npcObjs[id].def; if (nd && (nd.racemaster || nd.shop || nd.custom || nd.garage || nd.marshal || nd.petshop || nd.arenaMaster)) setTimeout(() => talk(id), 250); }, true], ['Not now', () => { closeDlg(); const nd = npcObjs[id] && npcObjs[id].def; if (nd && (nd.racemaster || nd.shop || nd.custom || nd.garage || nd.marshal || nd.petshop || nd.arenaMaster)) setTimeout(() => { S.skipIntro = S.skipIntro || {}; S.skipIntro[id] = Date.now(); talk(id); }, 250); }]])); }
  for (const qid of QORDER) { const q = QDEFS[qid], s = S.qst[qid];
    if (s && s.st === 'active' && (q.giver === id || q.turnIn === id)) { $('dlgLine').textContent = 'Still working on it? ' + q.obj.filter((o, k) => !objDone(o, s.p[k])).map(o => o.text).join(', then ') + '.'; return menuFor(n); } }
  $('dlgLine').textContent = n.idle[Math.floor(Math.random() * n.idle.length)];
  menuFor(n);
}
function trackedQuest() {
  for (const k in S.qst) if (!QDEFS[k]) delete S.qst[k];
  if (S.track && QDEFS[S.track] && S.qst[S.track] && S.qst[S.track].st !== 'done') return S.track;
  for (const qid of QORDER) { const s = S.qst[qid]; if (s && s.st === 'ready') return qid; }
  for (const qid of QORDER) { const s = S.qst[qid]; if (s && s.st === 'active' && QDEFS[qid].main) return qid; }
  for (const qid of QORDER) { const s = S.qst[qid]; if (s && s.st === 'active') return qid; }
  for (const qid of QORDER) if (QDEFS[qid].main && qAvailable(qid)) return qid;
  return null;
}
function padPos() { if (LEVEL.id === 'ship') return { p: V(0, 0, -11), label: 'Use the galaxy map' }; const P = LEVEL.pad || LEVEL.spawn; return { p: V(P.x, 0, P.z), label: 'Return to your ship' }; }
function goto(planet, p, label) {
  if (planet === LEVEL.id) return { p, label };
  if (!shipUnlocked()) return null;
  const nm = LEVELS[planet] ? LEVELS[planet].name : planet;
  if (LEVEL.fly) { const B = SPACE_BODIES[planet]; return B ? { p: B.pos, label: `Fly to ${nm}` } : null; }
  if (planet === 'space') return LEVEL.id === 'ship' ? { p: V(0, 0, -7), label: 'Take the helm and fly' } : Object.assign(padPos(), { label: 'Go to your ship and take the helm' });
  const t = padPos(); t.label = `Travel to ${LEVELS[planet] ? LEVELS[planet].name : planet}`; return t;
}
function questTarget() {
  const ba = S.bh && S.bh.active;
  if (S.track === 'bounty' && ba) { if (ba.planet !== LEVEL.id) return goto(ba.planet, null, ''); if (bountyEnemy && !bountyEnemy.dead) return { p: bountyEnemy.obj.position }; const z = Z[ba.zone]; return z ? { p: V(z.x, 0, z.z) } : null; }
  const id = trackedQuest(); if (!id) return null;
  const q = QDEFS[id], s = S.qst[id];
  const npcAt = (nid, verb) => { const home = NPC_HOME[nid] || 'earth'; const o = npcObjs[nid]; return goto(home, o ? o.obj.position : V(0, 0, 0), `${verb} ${npcName(nid)}`); };
  if (!s) return npcAt(q.giver, 'Talk to');
  if (s.st === 'ready') return npcAt(q.turnIn, 'Return to');
  const k = q.obj.findIndex((o, i) => !objDone(o, s.p[i])), o = q.obj[Math.max(0, k)], planet = objPlanet(q, o);
  if (planet !== LEVEL.id) return goto(planet, null, '');
  const zn = Z[o.zone]; if (!zn) return null;
  if (o.kind === 'kill' || o.kind === 'item') {
    let best = null, bd = 1e9;
    for (const e of enemies) if (!e.dead && e.zone === zn && (o.kind === 'kill' ? e.sp.type === o.t : (e.def.drops || []).some(d => d[0] === o.t))) { const d = e.obj.position.distanceTo(player.pos); if (d < bd) { bd = d; best = e; } }
    if (best && bd < zn.r * 2.5) return { p: best.obj.position };
  }
  return { p: V(zn.x, 0, zn.z) };
}
function renderQuest() {
  const ul = $('qObj'); ul.textContent = '';
  const id = trackedQuest(), add = (txt, done) => { const li = document.createElement('li'); li.textContent = txt; if (done) li.className = 'done'; ul.appendChild(li); };
  const ba = S.bh && S.bh.active;
  if (S.track === 'bounty' && ba) { $('qCh').textContent = `Bounty · Tier ${ba.tier} · ${ba.reward} cr`; $('qTitle').textContent = ba.name; add(ba.planet === 'space' ? 'Find the WANTED raider in open space' : `Hunt them on ${LEVELS[ba.planet].name}${ba.planet === LEVEL.id && Z[ba.zone] ? ' · ' + Z[ba.zone].name : ''}`); const t = questTarget(); if (t && t.label) add(t.label); return; }
  const nAct = Object.values(S.qst).filter(s => s.st !== 'done').length;
  if (!id) { $('qCh').textContent = LEVEL ? LEVEL.name : 'Earth'; $('qTitle').textContent = 'Explore'; add(shipUnlocked() ? 'Hunt, loot, upgrade your ship. Press J for quests.' : 'Hunt, loot, and sell to Zib.'); return; }
  const q = QDEFS[id], s = S.qst[id];
  $('qCh').textContent = q.ch + (nAct > 1 ? ` · ${nAct} quests (J)` : '');
  $('qTitle').textContent = q.title;
  if (!s) { const lv = npcHome(q.giver); add('Talk to ' + npcName(q.giver) + (lv && (!LEVEL || LEVEL.id !== lv) ? ` (${LEVELS[lv].name})` : '')); return; }
  q.obj.forEach((o, k) => add(`${o.text}${o.n > 1 ? ` ${objHave(o, s.p[k])}/${o.n}` : ''}`, objDone(o, s.p[k])));
  if (s.st === 'ready') { const lv = npcHome(q.turnIn); add('Return to ' + npcName(q.turnIn) + (lv && (!LEVEL || LEVEL.id !== lv) ? ` (${LEVELS[lv].name})` : ''), true); }
  const t = questTarget(); if (t && t.label && t.label.startsWith('Travel')) add(t.label);
}
// which level an NPC lives on, so a quest you haven't picked up yet still says where to go
function npcHome(id) { for (const k in LEVELS) { const n = LEVELS[k].npcs; if (Array.isArray(n) && n.some(d => d && d.id === id)) return k; } return null; }
function openQuestLog() {
  openDlg('Journal', 'Quests');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    rows.textContent = '';
    const mainFirst = a => a.filter(id => QDEFS[id].main).concat(a.filter(id => !QDEFS[id].main)); const act = mainFirst(QORDER.filter(id => S.qst[id] && S.qst[id].st !== 'done')), avail = mainFirst(QORDER.filter(qAvailable)), done = QORDER.filter(qDone).length;
    $('dlgLine').textContent = `${act.length} in progress · ${done} done. Tracked quest shows on screen and on the compass.`;
    const row = (id, meta, btn) => { const q = QDEFS[id], r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = q.main ? '#ffd75e' : '#8fe3ff';
      const nm = document.createElement('span'); nm.textContent = `${q.main ? '★ MAIN · ' : ''}${q.title} · ${q.ch}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = meta;
      r.append(dot, nm, mt); if (btn) r.appendChild(btn); else r.appendChild(document.createElement('span')); rows.appendChild(r); };
    if (S.bh && S.bh.active) { const a = S.bh.active, b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = S.track === 'bounty' ? 'Tracked' : 'Track'; b.disabled = S.track === 'bounty'; b.addEventListener('click', () => { S.track = 'bounty'; markDirty(); renderQuest(); render(); }); const r = document.createElement('div'); r.className = 'rowi'; const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = '#ffd36a'; const nm = document.createElement('span'); nm.textContent = `BOUNTY: ${a.name} · ${a.planet === 'space' ? 'Open space' : LEVELS[a.planet].name}`; const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = a.reward + ' cr'; r.append(dot, nm, mt, b); rows.appendChild(r); }
    act.forEach(id => { const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; const tr = trackedQuest() === id; b.textContent = tr ? 'Tracked' : 'Track'; b.disabled = tr; b.addEventListener('click', () => { S.track = id; markDirty(); renderQuest(); render(); }); row(id, S.qst[id].st === 'ready' ? 'Turn in' : 'Active', b); });
    avail.forEach(id => { const lv = npcHome(QDEFS[id].giver); row(id, 'See ' + npcName(QDEFS[id].giver) + (lv ? ` (${LEVELS[lv].name})` : '')); });
    if (!act.length && !avail.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No open quests. Look for people with a ! over their heads, or explore.'; rows.appendChild(e); }
    if ((S.gear || []).length) { const g = document.createElement('div'); g.className = 'empty'; g.textContent = 'Master gear: ' + S.gear.map(k => `${GEAR[k].name} (${GEAR[k].desc})`).join(' · '); rows.appendChild(g); }
  };
  $('dlgActs').before(rows); acts([['Close', closeDlg]]); render();
}
// old saves (one linear quest) move into the new journal
function migrateQuests() {
  if (!S.qst) S.qst = {};
  if (S.q == null) return;
  const old = ['q1', 'q2', 'q3', 'q4', 'q5'];
  for (let i = 0; i < Math.min(S.q, 5); i++) S.qst[old[i]] = { st: 'done', p: [] };
  if (S.q < 5 && (S.qs === 'active' || S.qs === 'ready')) S.qst[old[S.q]] = { st: S.qs, p: (S.qp || []).slice() };
  if (S.side === 'done') S.qst.s1 = { st: 'done', p: [] }; else if (S.side === 'active' || S.side === 'ready') S.qst.s1 = { st: S.side, p: (S.sp || []).slice() };
  if (S.q >= 5) S.ship.unlocked = true;
  delete S.q; delete S.qs; delete S.qp; delete S.side; delete S.sp;
}
function skipTutorial() {
  for (const id of ['q1', 'q2', 'q3', 'q4', 'q5']) S.qst[id] = { st: 'done', p: [] };
  if (S.lvl < 8) { S.lvl = 8; S.xp = 0; }
  if (!S.guns.includes('b5')) S.guns.push('b5'); if (!S.guns.includes('c10')) S.guns.push('c10'); S.gun = 'c10'; player.ammo = gun().mag;
  S.cr += 300; S.ship.unlocked = true; player.hp = maxHp(); if (!S.qst.m1) startQuest('m1', true);
  markDirty(); setState('play'); travel('ship'); log('Tutorial skipped. Welcome aboard the Setting Sun. Use the galaxy map to fly to Mezar.', 'loot');
}
// ---- gun workbench: every gun takes 3 upgrade tiers, +8% damage each ----
const MOD_COST = [{ cr: 200, scrap: 4 }, { cr: 500, circuit: 4 }, { cr: 1200, crystal: 3, circuit: 4 }];
const gunTier = (id) => (S.mods && S.mods[id]) || 0;
function openWorkbench() {
  openDlg('Armory', 'Gun workbench');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    rows.textContent = ''; $('dlgLine').textContent = `Each tier adds +8% damage. ${S.cr} cr on hand.`;
    S.guns.forEach(id => { const g = GUNS[id], t = gunTier(id), r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = ['#9aa1aa', '#6fdc5a', '#4fa8ff', '#c86aff'][t];
      const nm = document.createElement('span'); nm.textContent = `${g.name} ${'★'.repeat(t)}${S.gun === id ? ' (in hand)' : ''}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '14px'; mt.textContent = t >= 3 ? 'Maxed' : costLabel(MOD_COST[t]);
      const ac = document.createElement('span'); ac.style.display = 'flex'; ac.style.gap = '6px';
      const eq = document.createElement('button'); eq.className = 'pbtn'; eq.style.padding = '5px 10px'; eq.textContent = 'Equip'; eq.disabled = S.gun === id; eq.addEventListener('click', () => { S.gun = id; player.ammo = g.mag; player.reloading = 0; markDirty(); render(); });
      const up = document.createElement('button'); up.className = 'pbtn'; up.style.padding = '5px 10px'; up.textContent = 'Upgrade'; up.disabled = t >= 3 || !costOk(MOD_COST[t]);
      up.addEventListener('click', () => { costPay(MOD_COST[t]); S.mods = S.mods || {}; S.mods[id] = t + 1; SFX.level(); log(`${g.name} upgraded to tier ${t + 1}`, 'loot'); markDirty(); render(); });
      ac.append(eq, up); r.append(dot, nm, mt, ac); rows.appendChild(r); });
  };
  $('dlgActs').before(rows); acts([['Done', closeDlg]]); render();
}
