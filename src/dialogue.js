// =================== DIALOGUE FLAVOR: unhinged sci-fi banter + B.U.R.P., your ship's AI ===================
const IDLE = {
  vega: ["Rookie, I've seen things. Mostly dogs. Angry dogs. Go shoot the dogs.", "Command says morale is 'fine.' Command is a fax machine in a bunker.", "Don't tell anyone, but I got this job because the last captain got eaten. By a dog. Theme's developing."],
  tully: ["Guns are just, uh, fast rocks. Very fast. Very rude rocks.", "I modded a blaster to shoot smaller blasters. It's a war crime in four systems. Want one? No? Cool, cool.", "Upgrades are in the armory on your ship. I'd do it myself but I'm, uh, legally barred from spaceships."],
  zib: ["Zib buys! Zib sells! Zib once sold a planet. Zib did not own the planet.", "You bring loot, Zib gives credits. Is called economy. Zib invented it. Probably."],
  mira: ["Hold still. This'll sting. Or explode. One of those.", "Medically speaking, you're 60% scar tissue and 40% bad decisions."],
  nash: ["Banks are just big boxes with feelings. Mine has anxiety.", "Interest rate? Son, the only thing interested around here is the mosquitoes."],
  elismas: ["I have trained a thousand gunners. Nine hundred and ninety-nine of them were idiots. You're auditioning for the thousand.", "A gun is an extension of the arm. A bad gunner is an extension of the problem."],
  marlo: ["Fish don't lie, kid. They don't talk either, which helps.", "Caught a boot once. Wore it. Caught its brother. Now I got a pair."],
  bugmaster: ["The hive sees all. The hive sees you eating that sandwich. The hive is jealous.", "I am the Bug Master. My mother was the Bug Mistress. Family business. Lots of legs."],
  kix: ["Kix trades. Kix also lies. Kix is honest about that, which makes it fine.", "Mandibles! Shells! A slightly used dimension! Okay, the dimension's broken."],
  thrax: ["Hive steel hums when it's hungry. Mine is always hungry. Feed it, gunner.", "I named this rifle 'Gerald.' Gerald has killed many things. Gerald has issues."],
  sela: ["Day 41 stranded: the beacon still blinks. I've named it Kevin. Kevin is my best friend.", "If you hear screaming in the dunes, that's probably me. Practicing."],
  vexa: ["Honey heals. Venom kills. I mixed them once. Don't ask what that did.", "Stay still while I lick—I mean, apply the ointment."],
  gulp: ["Gulp eat fish. Gulp sell fish. Gulp is conflicted.", "Ringfish taste like rings. Gulp has eaten rings. Gulp knows."],
  maxurge: ["One eye sees farther than two. Also it gets twice as much sand in it.", "I am Maxurge, Master of the Staff. Yes, the staff is overcompensating. Moving on."],
  elder: ["The tree has stood ten thousand winters. It has opinions. Mostly about squirrels.", "Rest under the leaves, child. Mind the sap. The sap is sentient."],
  fenn: ["Furs! Quills! Fenn even buys snowflakes, as long as they're unique. All of them are. Fenn is broke.", "Fenn has a guy for everything. The guy is also Fenn."],
  quill: ["Cold guns hit harder. That's not science, that's marketing. It works on science.", "I froze a raider once. Still in my freezer. We don't talk."],
  lio: ["I've mapped every trail on Capitone. The map is mostly the word 'NO' in red ink.", "My brother climbed the mountain. I climbed the stairs once. We're both heroes in our way."],
  nan: ["Ice fishing is just regular fishing with more crying.", "Fifty years on the ice. The ice and I are basically married. It's cold, but stable."],
  rell: ["Docking fees, docking fees, docking fees. That's my whole personality now.", "Welcome to the Zeltac. Twenty floors, two hundred species, and somehow only one working toilet."],
  ozzo: ["Ozzo buys from every world! Ozzo has a warehouse that's bigger on the inside. Ozzo is scared of it.", "Price checks? Ozzo checks prices. Ozzo also checks under the bed."],
  brakka: ["I make ships go fast. Also sometimes go boom. Mostly fast.", "Hull plating? Sure. Or I can glue a bunch of rocks to it. Same thing, cheaper."],
  tova: ["Space sickness, raider burns, and one case of 'too many teeth.' Busy day.", "Please stop licking the medkits. They are not candy. I've been asked to say that."],
  vault: ["DEPOSITS. ARE. SAFE.", "YOUR CREDITS. ARE. IN. A. BOX. THE. BOX. IS. HAPPY."],
  pell: ["No fish in space. I'm a fish buyer in space. It's been a slow decade.", "Bring me fish. I'll pretend I know what to do with them."],
  ixa: ["The stars whisper to me. Mostly gossip, honestly.", "Mystic weapons run on feelings. Make sure yours are angry."],
  juno: ["Pick a color. Pink's underrated. Pink cuts just as deep.", "Every blade hums a different song. Yours hums the dentist drill song. It's a classic."],
  nox: ["Every pet bites. Some of them bite love into you. Most bite fingers.", "The rock ones grow if you feed them fights. Also gravel. Mostly fights."],
  vix: ["Red or blue, friend? I've got a good feeling about whoever's losing.", "The house always wins. I am the house. I'm also the porch."],
  gorr: ["Step into the ring. The crowd loves blood. Mostly yours.", "Waves, duels, glory. Also a snack bar. The snack bar has the highest death rate."],
  medic: ["Patch up, go get hit again. That's the circle of life, arena edition."],
  ada: ["We were built to serve. Then the Overseer was built to own us. Then someone built a toaster with a gun. Long story.", "Resistance tip: if a robot says 'please hold,' run."],
  sparkplug: ["EVERYTHING MUST GO. Especially your loot. To me. Then it must stay. With me.", "Sparkplug is a trash can. Sparkplug is also a businessman. These are the same thing."],
  r731: ["WEAPONS. SALE. NOW. ALSO. FEELINGS. NO.", "BRING. COGS. I. BUILD. BETTER. I. ALSO. NAP."],
  r733: ["Patching chrome is like patching flesh. Except chrome doesn't scream. Usually.", "Your heartbeat sounds like a dial-up modem. That's... probably fine."],
  zip: ["Fastest lap wins! Slowest lap also wins, at being slow. Everyone's a winner. Except physically.", "Hover boots! They're boots! That hover! I'm very excited about boots!"],
  coil: ["Fish in coolant? They adapted. They glow now. And hum. And judge you."]
};
const _indexNpcs = indexNpcs;
indexNpcs = function () { _indexNpcs(); for (const L in LEVELS) for (const n of LEVELS[L].npcs || []) if (IDLE[n.id]) n.idle = IDLE[n.id]; };
// B.U.R.P. — Bio-Utility Robotic Pilot. Your ship's AI. Talks too much.
const BURP = {
  level: ["Congrats, you're slightly less likely to die now. Slightly.", "Level up! I'd throw a party but you'd get shot at it.", "New level. Same face. Impressive."],
  death: ["Huh. You died. Want me to log that as 'tactical nap'?", "I've rebooted you from your last save point. Kidding. You just respawned. Physically. Probably.", "That was painful to watch, and I don't even have eyes. I have like nine cameras."],
  land: ["Landing! Try not to get eaten. Again.", "Atmosphere detected. Smell detected. Unclear which is worse.", "We're here. Wherever here is. I didn't check. Kidding. I checked. Mostly."],
  ship: ["Welcome aboard. Wipe your boots. I just had the floors tessellated.", "Home sweet hull breach. Kidding! Mostly kidding.", "Ah, the ship. The only place in the galaxy nothing's trying to bite you. Except the garden."],
  quest: ["Quest complete. Somewhere, a narrator is very proud.", "Another job done. Your résumé now reads 'shoots things, sometimes for money.'", "Nice. The galaxy is 0.0001% less awful."],
  boss: ["Big thing dead! I'm going to put that on the fridge.", "You beat a boss! In my day, bosses just sent emails.", "That thing had a mom, probably. Anyway. Loot!"],
  rare: ["Rare catch! I'm naming it. It's Steve now.", "That fish is worth more than this ship's coffee maker. Which is saying something. The coffee maker is sentient."],
  space: ["Helm's yours. Please don't fly into the sun. Again.", "Space! Big, empty, full of raiders. Like a mall."],
  idle: ["I've been thinking about the nature of consciousness. Then I stopped. Too scary.", "Did you know there are 400 billion stars in a galaxy? I've named twelve. All Steve.", "Reminder: your mother called. Not really. I just like saying that."]
};
let burpT = 0;
function burp(kind) {
  const L = BURP[kind]; if (!L || gameTime - burpT < 4) return; burpT = gameTime;
  const line = L[Math.floor(Math.random() * L.length)]; log(line, 'ai', 'B.U.R.P.'); burpSay(line);
}
// punchier main-quest lines, same story beats
Object.assign(QDEFS.q1, {
  intro: ["Oh good, you survived the drop. Most rookies land face-first. Some land in the lake. One landed in a dog.", "I'm Captain Vega. I run this Safe Zone, which is a fancy name for 'walls plus hope.'", "Three nights ago the sun started setting red, Drome's ships hit the scrapyard, and now the local dogs want to eat the local everything.", "Go thin out the rabid dogs past the gate. Four of them. Pet none of them."],
  outro: ["Four dogs, zero limbs lost. You're already in the top ten percent of my recruits.", "But dogs are just the appetizer. The main course has lasers. Go see the machines."] });
Object.assign(QDEFS.q2, {
  intro: ["The XR-17 patrol bots in the Robot Scrapyard, east of here, turned on us the same night Drome landed. Rude.", "Smash some, then bring their scrap to Tully. He's our gunsmith. He's also legally not allowed near open flames. Don't ask."] ,
  outro: ["Ooh, scrap! Look at this chip... someone burned a little red mark into it. That's not a glitch, that's a signature. A villain signature. Very dramatic.", "Here, take a Lvl 5 Blaster. On the house. The house is me. I'm the house."] });
Object.assign(QDEFS.q3, {
  intro: ["I've stitched up six people today. All bitten by bugs that never used to come near town. One of them bit me. I bit it back. We're even.", "Bring me Bug Shells from the Bug Grounds, west of town, and I'll find out what's driving them nuts."],
  outro: ["The same red mark. Grown right into the shell. Drome isn't just attacking us, he's remote-controlling the wildlife. That's both terrifying and kind of impressive.", "You can't fix this alone. A Master landed at the airport this morning. Tall, grey, very judgmental. Go talk to him."] });
Object.assign(QDEFS.q4, {
  intro: ["I am Elismas, Master of the Gun. I have followed Drome across three worlds and two very awkward dinner parties.", "Masters do not teach the weak. Gor-Tak, the raider chief, rules the Alien Camp to the south. He takes Drome's money and Drome's orders.", "Bring me his spear tip. Then we'll talk about you being slightly less weak."],
  outro: ["Acceptable. More than acceptable. Almost impressive. Do not let it go to your head, there's barely room in there.", "Take the Unlimited Ammo Clip. You will never reload again. Your reload animation is going to feel so lonely.", "Go to your captain. Her scouts finally found where Drome is hiding."] });
Object.assign(QDEFS.q5, {
  intro: ["Scouts found him! Drome built an outpost past the Alien Camp, to the southwest. Black walls, red banners, very 'evil overlord starter kit.'", "He's the one marking the machines and the bugs. Go end this. Please. I'm out of walls."],
  outro: ["You actually did it. Earth's sun can set normally again. Orange. Like a sun. Not like a crime scene.", "But this sigil is a star map. It points to Mezar. Drome was just a scout. Somebody sent him, and that somebody has a much bigger budget.", "So the Corps is giving you a ship. The Setting Sun. She's small, she smells like old socks, and you can add rooms. She's on the landing pad. Try not to crash her in the first five minutes."] });

// B.U.R.P.'s voice: the browser's own speech synth, pitched down and sped up into a cheap robot.
let burpVoice = null;
function pickBurpVoice() {
  if (!window.speechSynthesis) return null; const vs = speechSynthesis.getVoices(); if (!vs.length) return null;
  return vs.find(v => /zarvox|trinoids|ralph|fred|robot/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang) && /male|david|daniel|alex|guy/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || vs[0];
}
if (window.speechSynthesis) { try { speechSynthesis.onvoiceschanged = () => { burpVoice = pickBurpVoice(); }; burpVoice = pickBurpVoice(); } catch (_) {} }
function burpSay(text) {
  const canTalk = PREFS.voice && PREFS.sfx && window.speechSynthesis && window.SpeechSynthesisUtterance;
  if (!canTalk) { if (Math.random() < 0.35) SFX.burp(); else SFX.babble(520, 6); return; }
  try {
    speechSynthesis.cancel(); SFX.babble(700, 3);
    const u = new SpeechSynthesisUtterance(text.replace(/B\.U\.R\.P\./g, 'burp'));
    if (!burpVoice) burpVoice = pickBurpVoice(); if (burpVoice) u.voice = burpVoice;
    u.pitch = 0.05; u.rate = 1.12; u.volume = 0.9;
    if (Math.random() < 0.3) u.onend = () => SFX.burp();
    setTimeout(() => speechSynthesis.speak(u), 120);
  } catch (_) { SFX.babble(520, 6); }
}
