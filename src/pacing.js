// ---------------- pacing (2.12) ----------------
// Enemy levels follow the story: Robot City (28–40) → Dark Fleet → Fort Ironrock's war zones (34–40)
// → Earth Sky (34–44) → Zarlich (44–50) → Vector (50–54). Quest XP is capped near one level for
// the quest's own level, so finishing a chapter no longer leaves you thirty levels above the next one.
{
  const shift = (id, d) => { const L = LEVELS[id]; if (L) for (const s of L.spawns || []) s.lv = [s.lv[0] + d, s.lv[1] + d]; };
  shift('zarlich', 6); shift('vector', 6);
  // 2.13: each chapter climbs steadily (Dark Fleet 40–42 → Fort 42–44 → Earth Sky 43–48 → Zarlich 46–52 → Vector 52–56)
  const C = LEVELS.capitone; if (C) for (const s of C.spawns) { if (s.zone === 'volcano') s.lv = s.type === 'vask' ? [28, 28] : [26, 27]; if (s.zone === 'mount') s.lv = s.type === 'frostking' ? [30, 30] : [27, 29]; }
  const K = LEVELS.skycity; if (K) for (const s of K.spawns) { if (s.zone === 'city') s.lv = [43, 45]; if (s.zone === 'forest') s.lv = s.type === 'nomine' ? [45, 47] : [44, 46]; if (s.zone === 'dbase') s.lv = s.type === 'dromeprime' ? [48, 48] : [46, 48]; }
  const F = LEVELS.fort;
  if (F) for (const s of F.spawns) {
    if (s.zone === 'siege') s.lv = [40, 42];
    if (s.zone === 'tankyard') s.lv = s.type === 'dtank' ? [41, 43] : [42, 43];
    if (s.zone === 'kragpit') s.lv = [44, 44];
  }
  const lab = { fort: 'Lv 12–44 · vehicles', skycity: 'Lv 43–48', zarlich: 'Lv 46–52', vector: 'Lv 52–56' };
  for (const id in lab) if (LEVELS[id]) LEVELS[id].lvls = lab[id];
  // Fort's training range stays a beginner area; the war starts after the Dark Fleet.
  if (QDEFS.a2 && !QDEFS.a2.req.includes('d3')) QDEFS.a2.req.push('d3');
  // The President arc follows Robot City instead of opening right after Earth.
  if (QDEFS.pr1) QDEFS.pr1.req = ['r5'];
}
{ const _po = planetOpen; planetOpen = function (id) {
  if (id === 'skycity') return shipUnlocked() && (qDone('a4') || !!qState('k1') || S.lvl >= 42);
  if (id === 'zarlich') return shipUnlocked() && (qDone('k4') || !!qState('x1') || S.lvl >= 46);
  if (id === 'vector') return shipUnlocked() && (qDone('x3') || !!qState('w1') || S.lvl >= 52);
  return _po(id); }; }
// Quest XP cap: about one level at the quest's own level, a bit over half a level past 30 where kills pay more.
const QUEST_LV = { m1: 12, c1: 18, r1: 31, d1: 40, d2: 41, d3: 42, x1: 49, w4: 58, e1: 58, pr1: 36, pr2: 37, pr3: 37, pr4: 38 };
function questLevel(id) {
  if (QUEST_LV[id]) return QUEST_LV[id];
  const q = QDEFS[id]; let hi = 0;
  for (const o of q.obj) { const L = LEVELS[objPlanet(q, o)]; for (const s of (L && L.spawns) || []) if (!o.zone || s.zone === o.zone) hi = Math.max(hi, s.lv[1]); }
  return hi || null;
}
{ const keep = Object.assign({}, NPC_HOME); indexNpcs(); Object.assign(NPC_HOME, keep); }
for (const id in QDEFS) { const q = QDEFS[id], r = q.reward; if (!r || !r.xp) continue;
  const lv = questLevel(id); if (!lv) continue;
  const cap = Math.round((lv > 30 ? 0.6 : 1) * 60 * Math.pow(lv, 1.45) / 50) * 50; if (r.xp > cap) r.xp = cap; }
// what opens a locked world, in words, for the galaxy map
function planetLockHint(id) {
  if (!shipUnlocked() && id !== 'earth') return "you need a ship first. Finish Captain Vega's Earth chapter";
  return ({ capitone: 'beat the Gut Worm Matriarch on Mezar (The Gut Pit)', robot: 'defeat the Frost King on Capitone', ocean: 'scan it from space, or defeat the Frost King',
    skycity: "win Fort Ironrock's war (Krag's Last Stand), or reach Level 36", zarlich: 'defeat Drome in Earth Sky, or reach Level 44', vector: 'defeat the Storm Mother on Zarlich, or reach Level 50' })[id] || 'keep following the story';
}
