// ---------------- pacing (2.12) ----------------
// Enemy levels follow the story: Robot City (28–40) → Dark Fleet → Fort Ironrock's war zones (34–40)
// → Earth Sky (34–44) → Zarlich (44–50) → Vector (50–54). Quest XP is capped near one level for
// the quest's own level, so finishing a chapter no longer leaves you thirty levels above the next one.
{
  const shift = (id, d) => { const L = LEVELS[id]; if (L) for (const s of L.spawns || []) s.lv = [s.lv[0] + d, s.lv[1] + d]; };
  shift('skycity', 4); shift('zarlich', 4); shift('vector', 4);
  const F = LEVELS.fort;
  if (F) for (const s of F.spawns) {
    if (s.zone === 'siege') s.lv = [34, 37];
    if (s.zone === 'tankyard') s.lv = s.type === 'dtank' ? [36, 39] : [37, 38];
    if (s.zone === 'kragpit') s.lv = [40, 40];
  }
  const lab = { fort: 'Lv 12–40 · vehicles', skycity: 'Lv 34–44', zarlich: 'Lv 44–50', vector: 'Lv 50–54' };
  for (const id in lab) if (LEVELS[id]) LEVELS[id].lvls = lab[id];
  // Fort's training range stays a beginner area; the war starts after the Dark Fleet.
  if (QDEFS.a2 && !QDEFS.a2.req.includes('d3')) QDEFS.a2.req.push('d3');
  // The President arc follows Robot City instead of opening right after Earth.
  if (QDEFS.pr1) QDEFS.pr1.req = ['r5'];
}
{ const _po = planetOpen; planetOpen = function (id) {
  if (id === 'skycity') return shipUnlocked() && (qDone('a4') || !!qState('k1') || S.lvl >= 36);
  if (id === 'zarlich') return shipUnlocked() && (qDone('k4') || !!qState('x1') || S.lvl >= 44);
  if (id === 'vector') return shipUnlocked() && (qDone('x3') || !!qState('w1') || S.lvl >= 50);
  return _po(id); }; }
// Quest XP cap: about one level at the quest's own level, a bit over half a level past 30 where kills pay more.
const QUEST_LV = { m1: 12, c1: 18, r1: 28, d1: 40, d2: 41, d3: 42, e1: 54, pr1: 36, pr2: 37, pr3: 37, pr4: 38 };
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
