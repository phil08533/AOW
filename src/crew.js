// =================== CREW FOR HIRE (2.19.16): runners, cooks and dealers for your ship's Lab ===================
// Hire them from the regulars at Grub's bar in the Underworld. Each job pays off over real time, and each one is risky:
// now and then a crew member is killed on the job and you head back to the bar for a replacement.
// One slot to start, two from level 15, all three from level 30. Save field: S.crew { runner|cook|dealer: { name, skill, t } }, S.crewPool.
const CREW_JOBS = {
  runner: { name: 'Runner', every: 10, risk: 0.06, desc: 'Goes out for Lab materials (scrap, crystal, circuits, shells) and brings them back to your bag.' },
  cook: { name: 'Cook', every: 8, risk: 0.04, desc: 'Works the Lab: brews an extra dose on station 1 each shift, if the materials are there.' },
  dealer: { name: 'Dealer', every: 10, risk: 0.08, desc: 'Takes doses from the Lab and sells them on the street. You get the credits.' }
};
const CREW_FIRST = ['Skid', 'Mags', 'Rook', 'Juno', 'Teck', 'Bix', 'Nola', 'Fen', 'Dusty', 'Kade', 'Pell', 'Rhee', 'Sorrow', 'Vic', 'Lux', 'Tam'];
const CREW_LAST = ['Varga', 'Okoro', 'Quill', 'Marsh', 'Doyle', 'Krane', 'Sato', 'Bellweather', 'Moss', 'Ash', 'Rivet', 'Cole'];
const CREW_DEATHS = ['got jumped in a back alley on the job', 'took a Marshal round during a pickup', 'never came back from a deal that went sideways', 'was caught in a lab fire', 'crossed the wrong gang'];
// 2.21.4: crew are people now. Each one has a trait, a look, loyalty that their wages keep up, a skill that grows with
// shifts (up to 5 stars), a shift log, and they stand in your Lab doing their job. Bad nights wound them more often than
// they kill them, and loyal crew are more careful. m = { name, skill, t, trait, look, loy, shifts, earned, xp, log, hurt, low }
const CREW_TRAITS = {
  careful: { name: 'Careful', desc: 'Half the risk on the job.' },
  quick: { name: 'Quick', desc: 'Shifts run 25% faster.' },
  greedy: { name: 'Greedy', desc: 'Brings in 30% more, wants 50% more pay.' },
  lucky: { name: 'Lucky', desc: 'Now and then finds something rare.' },
  loyal: { name: 'Loyal', desc: 'Loyalty barely drops, even unpaid.' },
  reckless: { name: 'Reckless', desc: 'Double the risk, but costs half to hire.' }
};
const CREW_BIOS = ['Used to fly freight before the Marshals took the ship.', 'Says they knew Grub before the scar.', 'Owes money to three different gangs. Working on four.', 'Quiet. Counts everything twice.', 'Got kicked out of the Academy for "chemistry".', 'Will not talk about the moon.', 'Grew up in the Undercroft. Knows every back door.', 'Laughs at the wrong moments. Very good with numbers.'];
const CREW_LOOKS = [['#3a5a8a', '#1e1c22', '#e0b892', '#2a1a14', '#ffd36a'], ['#8a2a3a', '#2a2a30', '#8a5a3a', '#1a1414', '#4fe0ff'], ['#4a6a3a', '#3a3020', '#c89a6a', '#5a3a22', '#ff6aa8'], ['#6a4a8a', '#1e1c22', '#5a3a28', '#0e0c0a', '#7fff6a'], ['#c8a03a', '#2a2420', '#e8c8a0', '#c86a2a', '#c86aff'], ['#2a6a6a', '#1a2a2a', '#a07050', '#2a1a10', '#ffd36a']];
function crewS() { S.crew = S.crew || {}; for (const j in S.crew) crewFix(S.crew[j]); return S.crew; }
function crewFix(m) { if (!m) return m; const h = [...m.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  if (!m.trait) m.trait = Object.keys(CREW_TRAITS)[h % 6]; if (m.look == null) m.look = h % CREW_LOOKS.length; if (m.bio == null) m.bio = h % CREW_BIOS.length;
  if (m.loy == null) m.loy = 60; m.shifts = m.shifts || 0; m.earned = m.earned || 0; m.xp = m.xp || 0; m.log = m.log || []; return m; }
const crewWage = m => Math.round((15 + m.skill * 15) * (m.trait === 'greedy' ? 1.5 : 1));
function crewNote(m, txt) { m.log.unshift(txt); if (m.log.length > 6) m.log.length = 6; }
function crewSlots() { return S.lvl >= 30 ? 3 : S.lvl >= 15 ? 2 : 1; }
function crewPool() { const now = Date.now(); if (!S.crewPool || now - S.crewPool.t > 30 * 60000 || !S.crewPool.list.every(c => c.trait)) {
    const P = []; for (let i = 0; i < 4; i++) { const sk = 1 + Math.floor(Math.random() * 3), tr = Object.keys(CREW_TRAITS)[Math.floor(Math.random() * 6)];
      P.push({ name: CREW_FIRST[Math.floor(Math.random() * CREW_FIRST.length)] + ' ' + CREW_LAST[Math.floor(Math.random() * CREW_LAST.length)], skill: sk, trait: tr, look: Math.floor(Math.random() * CREW_LOOKS.length), bio: Math.floor(Math.random() * CREW_BIOS.length),
        fee: Math.round((600 + sk * 700 + Math.floor(Math.random() * 300)) * (tr === 'reckless' ? 0.5 : 1)) }); }
    S.crewPool = { t: now, list: P }; }
  return S.crewPool.list; }
const crewStars = k => '★'.repeat(k) + '☆'.repeat(Math.max(0, 5 - k));
function crewWork() { // catch up on every shift since the last check, offline time included (capped)
  if (!S.crew || !roomLvl('lab')) return; const C = crewS(), now = Date.now();
  for (const job in C) { const m = C[job], J = CREW_JOBS[job]; if (!m || !J) continue; const ev = J.every * 60000 * (1 - (m.skill - 1) * 0.1) * (m.trait === 'quick' ? 0.75 : 1);
    if (m.hurt && now < m.hurt) { m.t = now; continue; } if (m.hurt) { m.hurt = 0; crewNote(m, 'Back on their feet and back to work.'); }
    if (m.low) { m.t = now; continue; }
    let n = 0; while (now - m.t >= ev && n < 12) { m.t += ev; n++; m.shifts++;
      // wages come out of your credits; unpaid crew lose loyalty, and at zero they walk
      const w = crewWage(m); if (S.cr >= w) { S.cr -= w; m.loy = Math.min(100, m.loy + 2); } else { m.loy -= m.trait === 'loyal' ? 3 : 12; crewNote(m, `Wasn't paid (${w} CR). Not happy.`); }
      if (m.loy <= 0) { delete C[job]; toast('CREW QUIT', `${m.name} walked out. Nobody works for free.`, 4); log(`${m.name} quit over missed wages. Hire someone new at Grub's bar.`, 'loot'); break; }
      const risk = J.risk * (1.3 - m.skill * 0.12) * (m.trait === 'careful' ? 0.5 : m.trait === 'reckless' ? 2 : 1) * (1.2 - m.loy / 250) * 0.8;
      if (Math.random() < risk) { const how = CREW_DEATHS[Math.floor(Math.random() * CREW_DEATHS.length)];
        if (Math.random() < 0.35 + m.loy / 250) { m.hurt = now + 30 * 60000; crewNote(m, `Got hurt: ${how.replace(/^was |^got |^took /, '')}. Out for 30 min.`); toast('CREW HURT', `${m.name} is laid up for a while.`, 3); break; }
        delete C[job]; toast('CREW LOST', `${m.name} ${how}.`, 4); log(`Your ${J.name.toLowerCase()} ${m.name} ${how}. Find a replacement at Grub's bar in the Underworld.`, 'loot'); try { SFX.hit(); } catch (_) {} break; }
      const more = m.trait === 'greedy' ? 1.3 : 1;
      if (job === 'runner') { const mats = ['scrap', 'crystal', 'circuit', 'shell'], got = {}; for (let k = 0; k < Math.round(m.skill * more); k++) { const id = mats[Math.floor(Math.random() * mats.length)]; if (ITEMS[id] && invRoomFor(id) > 0) { S.inv[id] = (S.inv[id] || 0) + 1; got[id] = (got[id] || 0) + 1; } }
        if (m.trait === 'lucky' && Math.random() < 0.25 && typeof BQ_ING !== 'undefined') { const k = Math.random() < 0.15 ? 'starnectar' : Object.keys(BQ_ING)[Math.floor(Math.random() * 5)]; invAdd(k, 1); got[ITEMS[k].name] = 1; }
        crewNote(m, 'Brought back ' + (Object.entries(got).map(([k, v]) => `${v} ${ITEMS[k] ? ITEMS[k].name : k}`).join(', ') || 'nothing, bag was full') + '.'); }
      else if (job === 'cook') { const L = labS(), T = L.st[0], need = LAB_RECIPES[T.r] || {}; if (T.n < labMax() && costOk(need)) { costPay(need); T.n++; crewNote(m, `Cooked a dose of ${SUBS[T.r].name}.`); } else crewNote(m, T.n >= labMax() ? 'Station was full. Sat around.' : 'Out of materials. Sat around.'); }
      else if (job === 'dealer') { const L = labS(); let sold = 0; for (let k = 0; k < m.skill + 1; k++) { let id = Object.keys(L.shelf).find(i => L.shelf[i] > 0); if (id) { if (!--L.shelf[id]) delete L.shelf[id]; } else { const T = L.st.find(t => t.n > 0); if (!T) break; id = T.r; T.n--; } const cr = Math.round((SUBS[id] ? SUBS[id].price : 100) * 0.8 * more); S.cr += cr; sold += cr; }
        m.earned += sold; crewNote(m, sold ? `Sold product: +${sold} CR.` : 'Nothing to sell.'); if (sold) log(`${m.name} sold product on the street: +${sold} CR`, 'loot'); }
      m.xp++; if (m.skill < 5 && m.xp >= m.skill * 8) { m.xp = 0; m.skill++; crewNote(m, `Got better at the job (${m.skill} stars).`); toast('CREW', `${m.name} is now ${m.skill} stars`, 2.5); } }
    if (C[job] && now - m.t > ev) m.t = now; }
  markDirty();
}
setInterval(() => { try { crewWork(); } catch (e) { console.warn('crew', e); } }, 5000);
function crewStatus(m) { return m.hurt && Date.now() < m.hurt ? `hurt, back in ${Math.ceil((m.hurt - Date.now()) / 60000)} min` : m.low ? 'laying low' : 'working'; }
function openCrew(focus) {
  crewWork(); const C = crewS(); openDlg('Crew', `${Object.keys(C).length} of ${crewSlots()} hired`);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.cssText = 'display:flex;flex-direction:column;gap:8px';
  $('dlgLine').textContent = (roomLvl('lab') ? 'Wages come out of your credits each shift. Paid crew stay loyal, and loyal crew are more careful.' : 'You need a Lab on your ship before your crew can work.') + ' Hire at Grub\'s bar in the Underworld.';
  for (const j in CREW_JOBS) { const m = C[j], d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:flex;flex-direction:column;gap:4px';
    if (!m) { d.textContent = `${CREW_JOBS[j].name}: nobody. ${CREW_JOBS[j].desc}`; rows.appendChild(d); continue; }
    const T = CREW_TRAITS[m.trait], h = document.createElement('b'); h.textContent = `${CREW_JOBS[j].name} · ${m.name} ${crewStars(m.skill)} · ${T.name}`;
    const info = document.createElement('span'); info.textContent = `${CREW_BIOS[m.bio]} ${T.desc} Loyalty ${Math.round(m.loy)}% · ${crewWage(m)} CR a shift · ${m.shifts} shifts${m.earned ? ` · brought in ${m.earned} CR` : ''} · ${crewStatus(m)}.`;
    const lg = document.createElement('span'); lg.className = 'meta'; lg.textContent = m.log.length ? 'Last: ' + m.log.slice(0, 3).join(' / ') : 'No shifts yet.';
    const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'; const b = (t, fn, dis) => { const x = document.createElement('button'); x.className = 'pbtn'; x.textContent = t; x.disabled = !!dis; x.addEventListener('click', fn); bs.appendChild(x); };
    const bonus = crewWage(m) * 5; b(`Bonus ${bonus} CR`, () => { S.cr -= bonus; m.loy = Math.min(100, m.loy + 25); crewNote(m, 'Got a bonus. Grinning.'); SFX.coin(); markDirty(); openCrew(); }, S.cr < bonus || m.loy >= 100);
    b(m.low ? 'Back to work' : 'Lay low', () => { m.low = !m.low; m.t = Date.now(); crewNote(m, m.low ? 'Laying low. No pay, no risk.' : 'Back to work.'); markDirty(); openCrew(); });
    b('Fire', () => { delete C[j]; markDirty(); openCrew(); });
    d.append(h, info, lg, bs); rows.appendChild(d); }
  $('dlgActs').before(rows); acts([['Close', closeDlg, true]]);
}
function openHire(pick) {
  crewWork(); const C = crewS(), P = crewPool(), used = Object.keys(C).length;
  openDlg("Grub's bar", 'Looking for work'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  $('dlgLine').textContent = `Regulars who'll work for you: a hiring fee now, wages every shift. You have ${used} of ${crewSlots()} crew slots${crewSlots() < 3 ? ` (more at level ${crewSlots() < 2 ? 15 : 30})` : ''}.` + (roomLvl('lab') ? '' : ' They need a Lab on your ship to work.');
  P.forEach((c, i) => { const r = document.createElement('div'); r.className = 'rowi'; r.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
    const nm = document.createElement('span'); nm.style.flex = '1 1 220px'; const T = CREW_TRAITS[c.trait]; nm.textContent = `${c.name} ${crewStars(c.skill)} · ${T.name}: ${T.desc} ${CREW_BIOS[c.bio]} · ${c.fee} CR`; r.appendChild(nm);
    for (const j in CREW_JOBS) { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = CREW_JOBS[j].name; b.title = CREW_JOBS[j].desc;
      b.disabled = S.cr < c.fee || (!C[j] && used >= crewSlots());
      b.addEventListener('click', () => { if (S.cr < c.fee) return; S.cr -= c.fee; C[j] = crewFix({ name: c.name, skill: c.skill, trait: c.trait, look: c.look, bio: c.bio, loy: 70, t: Date.now() }); crewNote(C[j], 'Hired at Grub\'s bar.'); P.splice(i, 1); markDirty(); SFX.coin(); toast('HIRED', `${c.name} is your new ${CREW_JOBS[j].name.toLowerCase()}`, 2.5); openHire(); });
      r.appendChild(b); }
    rows.appendChild(r); });
  if (!P.length) { const r = document.createElement('div'); r.className = 'rowi'; r.textContent = 'Nobody else is looking for work right now. Check back later.'; rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['My crew', () => openCrew()], ['Close', closeDlg, true]]);
}
// the Lab terminal gets a Crew button
{ const _ol = openLab; openLab = function () { _ol.apply(this, arguments); const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Crew'; b.addEventListener('click', () => openCrew()); $('dlgActs').prepend(b); }; }
// and the crew are there in the Lab, doing their jobs: the cook at the flask bench, the runner sorting crates, the dealer counting cash
{ const _lr = labRoom; labRoom = function (s, cx, cz, far, outer, faceIn, term, props) { _lr.apply(this, arguments);
  try { const C = crewS(), mid = (far + cx) / 2;
    const spots = { cook: [far - s.side * 0.95, cz - 1.2, far, cz - 1.2], runner: [mid - s.side * 0.4, cz + 0.6, cx - s.side * 2, cz + 0.6], dealer: [cx + s.side * 0.9, cz + 2.0, cx + s.side * 0.9, cz + 3.0] };
    // the dealer's own little counting table, out of the way of the consoles
    { const tx = cx + s.side * 0.9, tz = cz + 2.75; part(props, B(0.9, 0.75, 0.6), toon('#3a2e24', 'wood'), tx, 0.375, tz); part(props, B(0.95, 0.05, 0.65), toon('#5a4632'), tx, 0.77, tz); for (let i = 0; i < 3; i++) part(props, B(0.16, 0.04 + i * 0.03, 0.08), toon('#6fdc5a'), tx - 0.25 + i * 0.2, 0.8 + i * 0.015, tz - 0.05); part(props, B(0.3, 0.12, 0.2), toon('#2a2c32'), tx + 0.25, 0.86, tz + 0.1); solid(tx, tz, 0.5); }
    part(props, B(0.6, 0.5, 0.6), toon('#5a4a32', 'wood'), spots.runner[0] - s.side * 0.7, 0.25, cz + 0.6); part(props, B(0.5, 0.4, 0.5), toon('#4a3a28', 'wood'), spots.runner[0] - s.side * 0.7, 0.7, cz + 0.6);
    for (const j in spots) { const m = C[j]; if (!m || (m.hurt && Date.now() < m.hurt) || m.low) continue; const [x, z, tx, tz] = spots[j], L = CREW_LOOKS[m.look] || CREW_LOOKS[0];
      const o = buildChar(() => makeCivilian(...L), 'civ'); o.position.set(x, 0, z); o.rotation.y = Math.atan2(tx - x, tz - z); levelGroup.add(o); const R = o.userData.rig, ph = Math.random() * 6;
            levelAnims.push(t => { if (!o.parent || !R || !R.armL) return; const k = t + ph;
        if (j === 'cook') { R.armR.rotation.x = -1.1 + Math.sin(k * 3) * 0.25; R.armL.rotation.x = -0.9 + Math.cos(k * 2.2) * 0.15; }
        else if (j === 'runner') { const b = Math.max(0, Math.sin(k * 0.9)); R.armL.rotation.x = R.armR.rotation.x = -0.4 - b * 0.9; o.rotation.y = Math.atan2(tx - x, tz - z) + Math.sin(k * 0.45) * 0.6; }
        else { R.armR.rotation.x = -0.9 + Math.abs(Math.sin(k * 5)) * 0.2; R.armL.rotation.x = -0.8; } });
      INTERACTS.push({ x, z, r: 1.4, label: `Talk to ${m.name} (${CREW_JOBS[j].name.toLowerCase()})`, fn: () => { crewWork(); const mm = crewS()[j]; if (!mm) return; openDlg(mm.name, `${CREW_JOBS[j].name} · ${crewStars(mm.skill)} · ${CREW_TRAITS[mm.trait].name}`);
        const lines = mm.loy > 75 ? ['Best gig I ever had, boss.', 'Whatever you need.', 'Nobody touches this lab on my watch.'] : mm.loy > 35 ? ['Shift\'s going fine.', 'Could use a raise, but fine.', 'Same old.'] : ['Pay me or I walk.', 'You know what you owe me.', 'Don\'t push it.'];
        $('dlgLine').textContent = `"${lines[Math.floor(Math.random() * 3)]}" ${mm.log[0] ? 'Last shift: ' + mm.log[0] : ''}`; acts([['Crew panel', () => openCrew()], ['Close', closeDlg, true]]); } }); }
  } catch (e) { console.warn('crew lab', e); } }; }
