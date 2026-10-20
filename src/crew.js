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
function crewS() { S.crew = S.crew || {}; return S.crew; }
function crewSlots() { return S.lvl >= 30 ? 3 : S.lvl >= 15 ? 2 : 1; }
function crewPool() { const now = Date.now(); if (!S.crewPool || now - S.crewPool.t > 30 * 60000) {
    const P = []; for (let i = 0; i < 4; i++) { const sk = 1 + Math.floor(Math.random() * 3); P.push({ name: CREW_FIRST[Math.floor(Math.random() * CREW_FIRST.length)] + ' ' + CREW_LAST[Math.floor(Math.random() * CREW_LAST.length)], skill: sk, fee: 600 + sk * 700 + Math.floor(Math.random() * 300) }); }
    S.crewPool = { t: now, list: P }; }
  return S.crewPool.list; }
const crewStars = k => '★'.repeat(k) + '☆'.repeat(3 - k);
function crewWork() { // catch up on every shift since the last check, offline time included (capped)
  if (!S.crew || !roomLvl('lab')) return; const C = crewS(), now = Date.now();
  for (const job in C) { const m = C[job], J = CREW_JOBS[job]; if (!m || !J) continue; const ev = J.every * 60000 * (1 - (m.skill - 1) * 0.15);
    let n = 0; while (now - m.t >= ev && n < 12) { m.t += ev; n++;
      if (Math.random() < J.risk * (1.3 - m.skill * 0.15)) { delete C[job]; const how = CREW_DEATHS[Math.floor(Math.random() * CREW_DEATHS.length)]; toast('CREW LOST', `${m.name} ${how}.`, 4); log(`Your ${J.name.toLowerCase()} ${m.name} ${how}. Find a replacement at Grub's bar in the Underworld.`, 'loot'); try { SFX.hit(); } catch (_) {} break; }
      if (job === 'runner') { const mats = ['scrap', 'crystal', 'circuit', 'shell']; for (let k = 0; k < m.skill; k++) { const id = mats[Math.floor(Math.random() * mats.length)]; if (ITEMS[id] && invRoomFor(id) > 0) S.inv[id] = (S.inv[id] || 0) + 1; } }
      else if (job === 'cook') { const L = labS(), T = L.st[0], need = LAB_RECIPES[T.r] || {}; if (T.n < labMax() && costOk(need)) { costPay(need); T.n++; } }
      else if (job === 'dealer') { const L = labS(); let sold = 0; for (let k = 0; k < m.skill + 1; k++) { let id = Object.keys(L.shelf).find(i => L.shelf[i] > 0); if (id) { if (!--L.shelf[id]) delete L.shelf[id]; } else { const T = L.st.find(t => t.n > 0); if (!T) break; id = T.r; T.n--; } const cr = Math.round((SUBS[id] ? SUBS[id].price : 100) * 0.8); S.cr += cr; sold += cr; }
        if (sold) log(`${m.name} sold product on the street: +${sold} CR`, 'loot'); } }
    if (C[job] && now - m.t > ev) m.t = now; }
  markDirty();
}
setInterval(() => { try { crewWork(); } catch (e) { console.warn('crew', e); } }, 5000);
function openCrew() {
  crewWork(); const C = crewS(); openDlg('Crew', `${Object.keys(C).length} of ${crewSlots()} hired`);
  $('dlgLine').textContent = (roomLvl('lab') ? '' : 'You need a Lab on your ship before your crew can work. ') + Object.keys(CREW_JOBS).map(j => { const m = C[j]; return `${CREW_JOBS[j].name}: ${m ? `${m.name} ${crewStars(m.skill)}` : 'nobody'}`; }).join(' · ') + '. Hire new crew at Grub\'s bar in the Underworld.';
  const A = []; for (const j in C) A.push([`Fire ${C[j].name}`, () => { delete C[j]; markDirty(); openCrew(); }]); A.push(['Close', closeDlg, true]); acts(A);
}
function openHire(pick) {
  crewWork(); const C = crewS(), P = crewPool(), used = Object.keys(C).length;
  openDlg("Grub's bar", 'Looking for work'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  $('dlgLine').textContent = `Regulars who'll work for you, for a fee. You have ${used} of ${crewSlots()} crew slots${crewSlots() < 3 ? ` (more at level ${crewSlots() < 2 ? 15 : 30})` : ''}. More skill means faster shifts and less chance they get killed on the job.` + (roomLvl('lab') ? '' : ' They need a Lab on your ship to work.');
  P.forEach((c, i) => { const r = document.createElement('div'); r.className = 'rowi'; r.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
    const nm = document.createElement('span'); nm.style.flex = '1 1 160px'; nm.textContent = `${c.name} ${crewStars(c.skill)} · ${c.fee} CR`; r.appendChild(nm);
    for (const j in CREW_JOBS) { const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = CREW_JOBS[j].name; b.title = CREW_JOBS[j].desc;
      b.disabled = S.cr < c.fee || (!C[j] && used >= crewSlots());
      b.addEventListener('click', () => { if (S.cr < c.fee) return; S.cr -= c.fee; C[j] = { name: c.name, skill: c.skill, t: Date.now() }; P.splice(i, 1); markDirty(); SFX.coin(); toast('HIRED', `${c.name} is your new ${CREW_JOBS[j].name.toLowerCase()}`, 2.5); openHire(); });
      r.appendChild(b); }
    rows.appendChild(r); });
  if (!P.length) { const r = document.createElement('div'); r.className = 'rowi'; r.textContent = 'Nobody else is looking for work right now. Check back later.'; rows.appendChild(r); }
  $('dlgActs').before(rows); acts([['My crew', openCrew], ['Close', closeDlg, true]]);
}
// the Lab terminal gets a Crew button
{ const _ol = openLab; openLab = function () { _ol.apply(this, arguments); const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Crew'; b.addEventListener('click', openCrew); $('dlgActs').prepend(b); }; }
