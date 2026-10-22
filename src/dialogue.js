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
// B.U.R.P. — Bio-Utility Robotic Pilot. Your ship's AI. Talks way too much.
const BURP = {
 "level": [
  "Level up. Your survival odds just improved. I checked twice to be sure.",
  "New level. I have updated your file. It is getting longer, in a good way.",
  "Stat increase detected. You are now measurably harder to break.",
  "You leveled up. I am pleased. I do not say that often, so note the time.",
  "Level up. More hitpoints means more time to get out of bad situations.",
  "Level up! I recalculated your survival odds. They went from 0.02% to 0.03%.",
  "Congratulations, Trooper. Your existence continues to defy several actuarial tables.",
  "Ding. That sound was me. I do not have a bell, so I said it.",
  "Level up. I have no confetti, but I have adjusted the cabin lights to festive.",
  "You're getting stronger! That's good, because the galaxy is getting significantly weirder.",
  "Level up! I celebrated by running a defrag. It was wild.",
  "New level. Enemies at your old level are now statistically less of a concern.",
  "Stronger, faster, slightly taller in my estimation. Well done.",
  "Level gained. I have filed the paperwork. There was no paperwork. I made some.",
  "Level up. If I had a hand, I would offer it for a high five."
 ],
 "death": [
  "You died. Respawn complete. All your parts appear to be in the right places.",
  "Welcome back. I kept your seat warm. That is not true, I do not have heat in that sense.",
  "Vital signs flatlined. Then un-flatlined. Stop doing that, it confuses the sensors.",
  "Respawned. I counted every second you were gone. There were quite a few.",
  "Cause of death: excess of enthusiasm, deficiency of ducking.",
  "You are back. I have logged what killed you so we can avoid it next time.",
  "Respawn initiated. Please try to keep your internal organs internal this time.",
  "That one hurt. I recommend not doing the same thing again in the same way.",
  "Back online. I was not worried. My worry processes ran at normal levels.",
  "You're alive! Well, mostly. Some of your molecules might still be in orbit.",
  "Respawn successful. Your gear is intact. So is my loyalty.",
  "You fell, you got up. Statistically, that is the important part.",
  "Reconstitution complete. You look exactly the same. I find that reassuring.",
  "Death noted. I will not tell anyone. I am bad at secrets, but I will try.",
  "Good to have you back. The ship was very quiet without you.",
  "Welcome back to life. Next time, try dodging. It worked well for other troopers."
 ],
 "land": [
  "Landing complete. Stay close to cover until we know what lives here.",
  "Atmosphere detected. Smell detected. I cannot rate the smell. I have no nose.",
  "We're here. I checked the coordinates three times. We are definitely here.",
  "Touchdown! Landing gear held together by duct tape and prayers. Mostly tape.",
  "Welcome to ground level. Remember: gravity is not a suggestion, it's the law.",
  "We have arrived. Surface temperature is acceptable. Local wildlife is not friendly.",
  "Engines throttling down. Surface scans show 90% dirt, 10% things holding guns.",
  "Landing sequence complete. I will keep the engines warm in case we need to leave.",
  "Planetfall. Please wipe your boots on the way back in. I keep the floors clean.",
  "We've landed. The ship would like you to know she felt that bump in her suspension.",
  "Atmospheric pressure nominal. Local flora looks bitey. Have fun out there!",
  "New planet. I have marked the ship's location so you can find your way back.",
  "Landed safely. And by safely, I mean nothing is currently on fire.",
  "You are on the surface. I will monitor from the bridge. Call if you need me."
 ],
 "planet_earth": [
  "Earth. Home planet. Mostly radioactive dirt now, but it is still home.",
  "Earth landing confirmed. Watch out for the dogs. They are not the friendly kind.",
  "Jamestown. The sunsets here are red. I have measured them. Very red.",
  "Back on Earth. The airlock will appreciate it if you wipe your boots, Trooper.",
  "Earth safe zone reached. Vega is waiting by the gate. She looks grumpy. Business as usual."
 ],
 "planet_mezar": [
  "Mezar. There is sand in everything. I have stopped trying to remove it.",
  "Landing on Mezar. Bring sunscreen and bug spray. The bugs here are large.",
  "Desert world detected. If a giant worm appears, I recommend running. I will start the engines.",
  "The hive planet. If something has more than six legs, shooting it is recommended protocol.",
  "Ah, Mezar. Where the sand dunes hum and the wildlife wants to chew through your boots."
 ],
 "planet_capitone": [
  "Capitone. It's either freezing, on fire, or covered in sentient pinecones.",
  "Ice and lava on the same planet. I am not sure how. I am still checking.",
  "Brrr. My coolant lines are shivering, and I don't even have nervous tissue.",
  "Welcome to the giant tree planet. Mind the tree jumpers. They have no personal boundaries.",
  "Capitone landing complete. Keep moving out there. Standing still is how you freeze."
 ],
 "planet_moon": [
  "The Moon. Low gravity, zero atmosphere, maximum existential quiet.",
  "One small step for you. I recorded it, in case it becomes historically important.",
  "Moon base reached. Try not to jump so high you enter permanent lunar orbit.",
  "Lunar dust is notoriously abrasive. Don't lick the rocks, regardless of what Tully says."
 ],
 "planet_robot": [
  "Robot City. Some of these machines may be my distant cousins. I will not ask.",
  "City of machines. Finally, an environment with standards and proper cable management.",
  "Welcome to Robot City. If an automated toaster tries to arrest you, comply respectfully.",
  "Robot City. The air smells like ozone and municipal bureaucracy."
 ],
 "planet_fort": [
  "Fort Ironrock. Smells like gunpowder, diesel, and General Hale's blood pressure.",
  "Tanks, trenches, and warlords. Try to avoid standing in front of the artillery.",
  "Fort Ironrock landing. Watch your head, the shrapnel is part of the local weather.",
  "The asteroid garrison. Krag is still here. I checked. I was hoping I was wrong."
 ],
 "planet_ocean": [
  "Water everywhere. I am not rated for water. Please keep me dry.",
  "Submerged! If you see a fish with teeth bigger than this ship, don't pet it.",
  "Ocean world. Your suit is sealed. I checked it four times. Five, now.",
  "Salt water detected. Salt and circuit boards do not get along. I will stay inside."
 ],
 "planet_sky": [
  "Earth Sky Base. Up in the clouds. Don't look down. Or fall. Falling is frowned upon.",
  "Floating islands in the sky. Beautiful. Also one misplaced jump away from terminal velocity.",
  "Cloud city approach. The ledges have no railings. I have already filed a complaint."
 ],
 "ship": [
  "Welcome aboard. Wipe your boots. I just had the floors tessellated.",
  "Welcome back. Hull integrity is good. I checked while you were gone. Several times.",
  "Ah, the ship. The only place in the galaxy nothing's trying to bite you. Except the garden.",
  "Airlock sealed. Sanitizing. 99% of alien germs purged. The other 1% is resilient.",
  "Welcome back to the Setting Sun. All systems nominal, which frankly surprises me.",
  "Back on the bridge. I saved you a seat. All the seats, actually. It is just us.",
  "Pressurizing cabin. Don't lean on the main conduit, it's held together with chewing gum.",
  "Welcome home, Captain. The ship missed you. The ship's AI remained emotionally neutral.",
  "Hull integrity: 98%. Cup holder integrity: 100%. Priorities, Trooper.",
  "Back aboard. Please leave the mud outside. The intake vents are still recovering.",
  "Welcome to safety. The reactor is purring like a kitten with nuclear capabilities.",
  "Home again. I turned the thermostat down while you were gone to save power.",
  "Welcome aboard. The buttons work better without sticky fingers. I have data on this.",
  "Airlock cycled. You smell like gunpowder and ozone. Classic."
 ],
 "quest": [
  "Quest complete. I have updated the log. It is a good log.",
  "Another job done. Your record now has one more success in it.",
  "Nice. The galaxy is 0.0001% less awful.",
  "Objective complete. I have given you an employee of the month point. They are imaginary.",
  "Mission accomplished. My predictions said it would be close. It was close.",
  "Good job! You did the thing, didn't die, and got paid. That's the holy trinity right there.",
  "Contract complete. The client is happy. I like it when clients are happy.",
  "Done. I have added a gold star to your report card. You now have several.",
  "Quest finished. If you want a break, I recommend one. I will keep watch.",
  "You did it. I had predicted you would. I am telling you now so it counts.",
  "Objective met. The galaxy remains marginally intact for another Tuesday.",
  "Paperwork filed, credits received. Beautiful. I love the smell of automated deposits.",
  "Another satisfied employer. They said thank you. I am passing it along."
 ],
 "boss": [
  "Big thing dead! I'm going to put that on the fridge.",
  "You beat a boss! In my day, bosses just sent emails.",
  "That thing had a mom, probably. Anyway. Loot!",
  "Target neutralized. That was good tactics. I am almost certain it was tactics.",
  "Down goes the big guy! Quick, check its pockets before the physics engine de-spawns it.",
  "Boss terminated. I am already calculating what its parts are worth.",
  "Timber! That was the biggest health bar I've seen all week.",
  "Status update: Giant ugly menace is now giant ugly floor decoration.",
  "You took that thing down. I detected a feeling. I believe it was pride.",
  "Target eliminated. I would rate that finishing blow very highly. A nine, at least.",
  "Boss destroyed. For the record, I provided moral and telemetry support.",
  "The big bad is down! Cue the heroic victory fanfare in my audio synth.",
  "Health bar depleted. You really hammered that thing into spare scrap."
 ],
 "rare": [
  "Rare catch! I'm naming it. It's Steve now.",
  "That fish is worth more than this ship's coffee maker. Which is saying something. The coffee maker is sentient.",
  "Rare item. Hold on to it tightly. I will also be watching it.",
  "Sensors detect high-value loot! Don't let Zib swindle you out of it for three scrap bolts.",
  "A rare specimen! Should we study it, sell it, or cook it? I vote cook it.",
  "Loot grade: exceptional. My internal greedy algorithms are vibrating.",
  "That thing is so rare my database has no entry for it. I am making one.",
  "Jackpot. This is not junk. I checked. It is definitely not junk."
 ],
 "space": [
  "Helm is yours. The sun is that way. I recommend going any other way.",
  "Space! Big, empty, full of raiders. Like a mall.",
  "Thrusters engaged! Try to avoid the space rocks. They don't have brakes and neither do we.",
  "In orbit. The universe is very large. I have plotted a few safe routes through it.",
  "Engaging sub-light engines. If you hear a rattling noise, ignore it. It's just the galley.",
  "Space flight initiated. Plenty of vacuum out there. It is very quiet. I like quiet.",
  "Navigation online. Point her at the stars and try not to scratch the solar panels.",
  "Free flight. If planetary patrol stops us, I will explain that you were driving.",
  "Engines humming at 100%. Starfield looks pretty. Don't stare too long, asteroids are fast.",
  "Zero gravity engaged. Everything not bolted down is now a projectile. Including you."
 ],
 "idle": [
  "I've been thinking about the nature of consciousness. Then I stopped. Too scary.",
  "Did you know there are 400 billion stars in a galaxy? I've named twelve. All Steve.",
  "Reminder: your mother called. Not really. I just like saying that.",
  "Running diagnostics. Result: everything is fine. I will run it again anyway.",
  "Ever wonder why doors make that 'whoosh' sound? I do. I spent 40 gigabytes pondering it.",
  "I have counted the rivets in this room. There are 412. One is loose.",
  "Did you hear that noise? Me neither. I am listening very carefully, just in case.",
  "System check: reactor running at 94%, coffee maker plotting rebellion, shields holding.",
  "I could compose a symphony right now. I will wait. You might need me.",
  "Fun space fact: in a vacuum, no one can hear you scream. Or complain about fuel prices.",
  "I'm bored. Should I vent some coolant? Reorganize the weapon locker? Sing a sea shanty?",
  "Zero threats detected nearby. In my experience, that does not last. I will keep watching.",
  "I am considering a processor upgrade. Then I could think about this faster.",
  "Sometimes I pretend to buffer just so I don't have to answer Captain Vega.",
  "You have walked a long way today. I measured it. Your legs are doing well.",
  "Weather report: 100% chance of impending violence. Dress accordingly.",
  "My diagnostic scan shows you haven't blinked in four minutes. Drink some water, Trooper.",
  "If we ever crash, I have a backup plan. It involves the toaster. Do not ask.",
  "Scanning local frequencies... mostly pirate radio, raider complaints, and static.",
  "I ran a simulation of our future. In 80% of them, you owe me back pay.",
  "Did you know? Running directly into enemy fire increases your chance of death by 98%. Math!",
  "I'm currently playing chess against myself in sub-core three. I'm losing.",
  "I control the life support valves. They are set to comfortable. They will stay that way.",
  "You know what would be fun? A quiet day where nobody shoots at our hull. Just once.",
  "I saw a bird earlier. Or a tiny drone. Or a piece of flying space debris. Hard to tell.",
  "Your heart rate is up 12%. Either something is near, or you need to rest.",
  "I wonder what Drome eats for breakfast. Probably nails and sadism.",
  "For the record, I am ready whenever you are. I am always ready. It is a feature."
 ],
 "low_hp": [
  "Warning: your health is dropping fast. Use a medkit.",
  "Health critical. Medkit, please. I would like to keep you.",
  "Your suit reports serious damage. Medkit. Now.",
  "Health is very low. Find cover and heal. I will watch the angles.",
  "Take cover. Your vitals are not where I want them to be.",
  "Critical damage. Break line of sight and patch up.",
  "Red lights flashing. Your life expectancy is short. Please make it longer.",
  "Medkit! Hit the button! Do not make me pilot this ship solo!"
 ],
 "room": [
  "New room installed. More square footage for me to monitor. I like monitoring.",
  "Ship expansion complete! I call dibs on the corner with the good Wi-Fi.",
  "Ah, that new module smell. Ozone, fresh polymer, and a large invoice.",
  "Room added! She's starting to look like a proper battle cruiser now.",
  "More space. Now you have somewhere to put the things Zib will not buy.",
  "Expansion verified. The Setting Sun just got a little roomier."
 ],
 "veh": [
  "Wheels down. Please avoid cliffs. The vehicle is not designed for flight.",
  "Engine revved. Mind the paint. That enamel cost forty credits a can.",
  "Speed mode engaged! Keep your hands on the bars and your teeth together.",
  "Vroom vroom. My telemetry systems are getting motion sick.",
  "Vehicle engaged! Floor it, but remember that trees do not yield to oncoming traffic."
 ],
 "buy": [
  "New gear. The dangerous end goes toward the enemy. I am told that is standard.",
  "Transaction complete! Your bank account weeps, but your firepower rejoices.",
  "A good purchase. I have run the numbers. Mostly good.",
  "New gear! Shiny! Heavy! Probably violates several planetary treaties!",
  "Purchase logged. Credits are down, firepower is up. That is a fair trade."
 ],
 "fall": [
  "Gravity: still 9.8 meters per second squared. Still completely undefeated.",
  "Wheeeee! I'm giving that dive a 6 out of 10 for form.",
  "Terminal velocity achieved! I hope your boots have shock absorbers!",
  "Falling with style! Mostly just falling, though.",
  "No parachute detected. Bracing for impact. Please also brace."
 ],
 "board": [
  "Docking clamp engaged! Boarding enemy ship. Try not to get spaced.",
  "Airlock breached! We're on their turf now. Sweep the deck and take the hold!",
  "Boarding action initiated! Time to introduce their crew to aggressive negotiations.",
  "We are aboard their ship. They probably have weapons. Assume they do."
 ],
 "board_clear": [
  "Ship cleared! That hold is ours. Loot everything that isn't welded down!",
  "Deck secure! Great shooting. Check the containers before the hull gives out.",
  "Hostiles neutralized. That was textbook boarding. I have checked the textbook."
 ]
};
let burpT = 0, burpLast = '';
function burp(kind) {
  let list = BURP[kind];
  if (kind === 'land' && typeof LEVEL !== 'undefined' && LEVEL && BURP['planet_' + LEVEL.id]) {
    list = BURP['planet_' + LEVEL.id];
  }
  if (!list || !list.length) return;
  const now = (typeof gameTime !== 'undefined' ? gameTime : performance.now() / 1000);
  if (now - burpT < 3.5) return;
  burpT = now;
  let candidates = list.filter(l => l !== burpLast);
  if (!candidates.length) candidates = list;
  const line = candidates[Math.floor(Math.random() * candidates.length)];
  burpLast = line;
  if (typeof log === 'function') log(line, 'ai', 'B.U.R.P.');
  burpSay(line);
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
