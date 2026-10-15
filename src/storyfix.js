// =================== STORY FIXES (2.13): one clear villain chain, Drome escapes Earth, the Eye in the Dark, Ramick is required ===================
// Drome's red-sun mark is HIS. Drome serves the Eye in the Dark (the Watcher). "Setting Sun" means only Drome's campaign and your ship.
{
  const Q = (id, o) => { if (QDEFS[id]) Object.assign(QDEFS[id], o); };
  // ---- Chapter 1: Tully spots the eye; Drome runs; Vega's hint ----
  Q('q2', { outro: ["Ooh, scrap! Look at this chip... someone burned a little red mark into it. That's not a glitch, that's a signature. A villain signature. Very dramatic.", "Huh. And right in the middle of the sun... is that a tiny eye? Why would you put an eye on it. I hate that.", "Here, take a Lvl 5 Blaster. On the house. The house is me. I'm the house."] });
  if (QDEFS.q5) { QDEFS.q5.obj.forEach(o => { if (o.kind === 'item') o.text = 'Beat Drome and grab the sigil he drops'; });
    QDEFS.q5.outro = ["He ran! Drome actually ran. Jumped in a shuttle and burned for orbit like his cape was on fire.", "But he dropped this. His sigil. It's a star map, and it points to Mezar. Whatever Drome is planning, it's bigger than Earth, and he answers to someone.", "So the Corps is giving you a ship. The Setting Sun. She's small, she smells like old socks, and you can add rooms. She's on the landing pad.", "Take care of her, rookie. She's... older than she looks. Try not to crash her in the first five minutes."]; }
  // ---- Mezar ----
  Q('m1', { outro: ["A gunner from Earth. The one who sent Drome running. The hive heard you coming.", "Drome serves the one we call the Eye in the Dark. It eats worlds, little gunner. Earth was a taste.", "Stay. Help my hive and I will tell you where Drome hides."] });
  Q('m5', { intro: ["Under the desert lives the Gut Worm Matriarch. Drome marked her first, and every worm she births carries his mark.", "Kill her, little gunner. Bring me her heart. The Gut Pit is far to the southwest."],
    outro: ["The hive is free. You have my thanks, and a Master's gift: the Power Ring.", "Now listen. Drome's next mark is Capitone, the frozen forest world. Maxurge guards it, the Master of the Staff.", "Go when you are ready."] });
  // ---- Capitone, then the last Master ----
  Q('c1', { outro: ["So. The gunner who chased Drome off Earth and killed the Matriarch.", "I am Maxurge, Master of the Staff. Drome has put his mark on my world too. Let us see what you can do."] });
  Q('c3', { intro: ["West, past the river, is the Forgotten Forest. The Nomines drift there, memories of the old people.", "Their essence can show us where Drome's mark began. Bring four to Elder Bark."],
    outro: ["Let me see... yes. The mark began in the volcano, where Drome's army dug in.", "And it spread up the mountain to our guardian. The Frost King."] });
  Q('c5', { intro: ["The Frost King guarded Capitone for an age. Now he guards Drome's way in.", "He waits at the top of the Mountain of the Lost, far to the southeast. Free him, gunner. Bring me his crown."],
    outro: ["He is free. Thank you.", "My gift: the Eye Accelerator. Your hands will move faster than you can think.", "Drome builds his army in Robot City. But do not go yet. One Master remains: Ramick, Master of the Sword, on Ocean World. You will need all four arts for what is coming.", "Captain Brine runs the docks at Port Kelp. Start there."] });
  for (const id of ['o1', 'o4']) Q(id, { main: true, ch: 'Ocean World · Chapter 3' });
  Q('o4', { outro: ["...You did it. Huh. I've been trying for nine years.", "Take my greatsword, and the Arm Sword. Your melee will hit like a falling moon.", "Maxurge sent word while you were down there. Robot City. Drome's army is waiting. Talk to me again and I'll point you to the resistance."] });
  Q('o5', { intro: ["Something big lives in the Trench, far northwest. The Leviathan. It wears Drome's red mark, and it's been eating our domes.", "We need a hero. Or a very brave snack. Ideally a hero."],
    outro: ["The Leviathan is gone! Bubble City is safe! Free bubbles for everyone!", "You've freed four worlds from that red mark now. Drome must be very, very annoyed with you."] });
  // ---- Robot City: Ramick sends you; the Overseer names the Eye ----
  Q('r1', { giver: 'ramick', req: ['c5', 'o4'], intro: ["Robot City, gunner. The machines there were free once. The Overseer took that.", "Find the resistance. A unit called Ada-9 waits at the Super Store. Go. And swing that sword like you mean it."],
    outro: ["A gunner. With the mark of all four Masters. Good.", "The Overseer serves Drome. Every robot in this city wears his mark. Help us cut it."] });
  Q('r5', { outro: ["His core is still warm. Listen... it's broadcasting.", "\"THE SETTING SUN RISES. THE EYE IN THE DARK WATCHES. ALL WORLDS WILL BURN RED.\"", "That's not a speech, gunner. It's a roll call. Ships are answering it. Out in the lanes, right now.", "And that eye... the Masters warned us about something in the dark. Robot City is free. Talk to me again when you're ready to go hunting."] });
  // ---- side quests that named the wrong villain ----
  Q('l1', { outro: ["They carry the red mark too. Even here. Drome reached the Moon."] });
  if (QDEFS.mq3) QDEFS.mq3.intro = ["Three worlds fell to Drome's mark and rose again by your hand. One spell remains.", "Win the Grand Bout in the arena, then return. The Codex only opens for a champion."];
  if (QDEFS.pr1) QDEFS.pr1.intro = ["You're the one who ran Drome off Earth. Then you'll want to hear this.", "Drome's war chest was paid in New United States treasury credsticks. Somebody in the government bankrolled him.", "The Fence, Sly Marlo, launders half the credits in the galaxy. Every planet has a hatch on the outskirts that leads to his basement. Ask him."];
  // ---- Zarlich: the older mark is an eye ----
  Q('x2', { outro: ["Engineered. These are engineered. The same red mark as Drome's machines, but older. Much older.", "And there's no sun in this one. Just an eye. Whatever made Drome's mark copied it from this."] });
  // ---- NPC lines ----
  const npc = (id, f) => { for (const k in LEVELS) for (const n of (LEVELS[k].npcs || [])) if (n.id === id) f(n); };
  npc('maxurge', n => { n.idle = (n.idle || []).map(l => l.replace("the Setting Sun's mark", "Drome's mark")); });
  npc('vega', n => { n.idle = (n.idle || []).concat(["If you're bored, the Moon's mining dome keeps sending distress calls. Drill bots with the red mark. Charming.", "Elder Oaken in the Forest of Life says the soil is going bad. Drome's mark again. Go help the trees, rookie.", "That ship of yours. Treat her right. She's been through more than you'd think."]); });
  if (typeof BURP !== 'undefined' && BURP.idle) BURP.idle.push("Who was my first captain? That information is classified. By me. Because I am embarrassed. Next question.", "This ship has been stolen exactly once. I was not consulted. I would have said yes.");
  // ---- achievements and the opening cards ----
  if (typeof ACH !== 'undefined') for (const a of ACH) if (a[0] === 'drome') a[2] = 'Drive Drome off Earth';
}
// Drome escapes Earth: no body, just a shuttle burning for orbit
{ const _k = kill; kill = function (e) { const r = _k.apply(this, arguments);
  try { if (e && e.sp && e.sp.type === 'drome' && LEVEL && LEVEL.id === 'earth') {
    const p = e.obj.position.clone(); setTimeout(() => { if (e.obj) e.obj.visible = false; }, 250); burst(p.clone().add(V(0, 1, 0)), '#ff2a3a', 26, 8); burst(p.clone().add(V(0, 1, 0)), '#5a5e66', 30, 6);
    const sh = makeRaider(); sh.scale.setScalar(0.35); sh.position.copy(p).add(V(0, 0.6, 0)); levelGroup.add(sh); SFX.engine && SFX.boom();
    let t = 0; levelAnims.push(dt => { if (!sh.parent || t > 7) { if (sh.parent) levelGroup.remove(sh); return; } t += 1 / 60; sh.position.y += t * 0.25; sh.position.x += t * 0.08; sh.rotation.x = -0.6; });
    toast('DROME ESCAPES', 'He dropped his sigil. Grab it!', 3); log('Drome jumps into a shuttle and burns for orbit. He left his sigil behind.', 'quest'); } } catch (_) {}
  return r; }; }
