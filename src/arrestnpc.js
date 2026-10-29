// =================== MARSHALS CAN ARREST CIVILIAN OFFENDERS (2.23.69) ===================
// With a Marshal badge, a few lawbreakers in town get an "Arrest" option. Arthur Vance is buying stimulants in broad daylight.
// An arrest pays Marshal XP and a seizure bounty, and the suspect sits in a cell for a while (S.jail[id] = release time).
const ARRESTABLE = {
  arthur: { lvl: 'earth', crime: 'buying stimulants at his signing booth', xp: 60, cr: 350, mins: 20,
    plead: ["Arrest me? Officer, it was for ART. Page four doesn't write itself!", "You can't cuff a man mid-sentence! I haven't even finished issue two!"],
    sold: "Hold on. Half of that Focus Fizz came from YOU. ...Fine. I'll take the fall. Tell the kids Aranus Man never snitches." }
};
const jailS = () => (S.jail = S.jail || {});
const jailed = id => (jailS()[id] || 0) > Date.now();
for (const id in ARRESTABLE) { const L = LEVELS[ARRESTABLE[id].lvl], lists = [L && L.npcs, typeof JT_NPCS !== 'undefined' ? JT_NPCS : null];
  for (const list of lists) { const n = (list || []).find(k => k.id === id); if (n && !n._jail) { n._jail = 1; const s0 = n.showIf; n.showIf = () => !jailed(id) && (!s0 || s0()); } } }
// a belt-and-braces check at spawn time, in case a level rebuilds its NPC list from scratch
{ const _mn = makeNpc; makeNpc = function (n) { if (n && ARRESTABLE[n.id] && jailed(n.id)) { const s0 = n.showIf; if (!n._jail) { n._jail = 1; n.showIf = () => !jailed(n.id) && (!s0 || s0()); } } return _mn.apply(this, arguments); }; }
function arrestNpc(id) {
  const A = ARRESTABLE[id], o = npcObjs[id]; if (!A || !o || !mOn()) return; const name = o.def.name, dealt = !!(S.flags && S.flags['sold_' + id]);
  openDlg(name, 'Under arrest'); $('dlgLine').textContent = `"${dealt ? A.sold : A.plead[randi(0, A.plead.length - 1)]}"`;
  acts([['🚔 Cuff him', () => { closeDlg(); mBadgePop(); const M = mS(); M.busts = (M.busts || 0) + 1; jailS()[id] = Date.now() + A.mins * 60000;
    const cr = A.cr + S.lvl * 5; S.cr += cr; mGain(A.xp, `Arrested ${name} for ${A.crime}`); toast('ARRESTED', `${name} · contraband seized · +${cr} cr`, 3.5); SFX.quest && SFX.quest();
    log(`${name} is in a Marshal holding cell for ${A.mins} minutes. Seizure bounty: ${cr} cr.`, 'loot'); scene.remove(o.obj); delete npcObjs[id]; markDirty(); }, true], ['Let him off', closeDlg]]); SFX.ui && SFX.ui();
}
{ const _t = talk; talk = function (id) { const A = ARRESTABLE[id], o = npcObjs[id];
  if (A && o) { const d = o.def; d._c0 = d._c0 || d.custom || []; d.custom = mOn() ? [...d._c0, [`🚔 Arrest ${d.name}`, () => arrestNpc(id)]] : d._c0; }
  return _t.apply(this, arguments); }; }
// remember who you've sold to, so they can call you on it
{ const _c = crime; crime = function (n, why) { try { if (/Arthur Vance/.test(why || '')) (S.flags = S.flags || {}).sold_arthur = 1; } catch (_) {} return _c.apply(this, arguments); }; }
