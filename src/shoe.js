// =================== THE OTHER SHOE (2.23.95) ===================
// Lonnie stands by the south gate of New Jamestown in one black shoe and one white sock. He lost the left one.
// The quest opens on day one and sits in the journal the whole game: the shoe only turns up when the Greater Maw dies.
// It drops on any Maw kill while the quest is active, so picking the quest up after the ending still works (the fight replays).
ITEMS.lostshoe = { name: "Lonnie's Left Shoe", v: 0, col: '#1a1a1e', quest: true, note: 'A black, left shoe. It came out of the Greater Maw. It is still warm.' };
ITEMS.lonniesock = { name: "Lonnie's Spare Sock", v: 1, col: '#e8e4dc', note: "You didn't ask for it. He insisted." };

// one shoe, one sock: recolor the left shoe white and flatten it into a sock until the quest is done
function makeLonnie() { const g = makeCivilian('#7a6a8a', '#3a5a8a', '#e0b892', '#6a4a2a'), done = qDone('shoe');
  for (const m of g.children) if (m.isMesh && Math.abs(m.position.y - 0.06) < 0.001 && Math.abs(m.position.z - 0.03) < 0.001) {
    if (m.position.x > 0 && !done) { m.material = toon('#e8e4dc', 'cloth'); m.scale.set(0.9, 1.1, 0.9); m.position.y = 0.066; } else m.material = toon('#111114'); }
  return g; }
LEVELS.earth.npcs.push({ id: 'lonnie', name: 'Lonnie', role: 'Lost a shoe', rig: 'civ', make: makeLonnie, x: -7, z: 35, face: 0.5,
  idle: ["Thanks again for the shoe. I walk in circles less now.", "Two shoes. Like a king."] });

defQuest('shoe', { ch: 'Earth · Side job', title: 'The Other Shoe', giver: 'lonnie', turnIn: 'lonnie', req: [],
  intro: ["Hey. Hey, you. Don't look at my feet.", "...Okay, you looked. Yes. One shoe. I lost the other one. Black, left foot. Real leather. Well, real something.",
    "I was standing right here and then it was just gone. If you see it out there, anywhere, could you bring it back? I've been hopping since Tuesday."],
  obj: [{ kind: 'item', t: 'lostshoe', n: 1, text: "Find Lonnie's other shoe" }],
  outro: ["Is that... MY SHOE! Where was it?", "Inside the WHAT?", "...It's warm. Why is it warm.", "You know what, I don't need to know. Here. It's all I've got. And take my spare sock, I won't need it anymore."],
  reward: { cr: 12, xp: 150, take: { lostshoe: 1 }, items: { lonniesock: 1 } } });

// taking the quest doesn't steal the compass from whatever you were actually doing
{ const _sq = startQuest; startQuest = function (id) { const tr = S.track, r = _sq.apply(this, arguments); if (id === 'shoe') { S.track = tr; renderQuest(); } return r; }; }

// while you look, he gets more desperate
const SHOE_WAIT = ["Any luck? Black. Left foot. Smells like a left foot.", "I've checked the fountain four times. It's not in the fountain.",
  "It's been weeks. My left foot has started making decisions without me.", "Someone said they saw it on Mezar. That doesn't make any sense. Unless it does.",
  "Vega says I should just buy new shoes. She doesn't understand. Those were my shoes.", "Out there saving the galaxy, huh? Great. Keep an eye out for the shoe though."];
{ const _t = talk; talk = function (id) { const s = S.qst.shoe;
  if (id === 'lonnie' && s && s.st === 'active' && npcObjs.lonnie) { const n = npcObjs.lonnie.def; openDlg(n.role, n.name); SFX.talk(); $('dlgLine').textContent = SHOE_WAIT[Math.floor(Math.random() * SHOE_WAIT.length)]; return menuFor(n); }
  return _t.apply(this, arguments); }; }

// the payoff: the Greater Maw coughs it up
{ const _qk = questProgressKill; questProgressKill = function (type) { const r = _qk.apply(this, arguments), s = S.qst.shoe;
  if (type === 'greatermaw' && s && s.st === 'active' && !S.inv.lostshoe) { S.inv.lostshoe = 1; markDirty();
    log("Something falls out of the Greater Maw. It's a shoe. A black, left shoe. Lonnie is going to be thrilled.", 'loot'); }
  return r; }; }
