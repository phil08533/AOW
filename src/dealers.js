// =================== STREET DEALERS (2.21.5): one corner in every outlaw world ===================
// Each world in OUT_WORLDS has a street corner with someone looking for work. Hire them there, or (if you have a Dealer on
// your crew) send your Dealer to set someone up remotely for a bigger fee. Street dealers sell Lab product in their world
// every shift and send the credits home. Rivals can kill them, and sometimes they rat you out: the Marshals hear about you
// (outlaw rep up, maybe Wanted) and the corner is empty until you hire again. Save field: S.dealers { worldId: m }.
const SD_EVERY = 12, SD_RIVAL = 0.035, SD_RAT = 0.025;
const SD_RAT_LINES = ['cut a deal with the Marshals', 'sang to a Marshal for a lighter sentence', 'traded your name for a clean record', 'wore a wire for a week'];
const SD_DEAD_LINES = ['was offed by a rival crew', 'got pushed off the corner for good', 'was found in a ditch with a rival gang\'s tag on them', 'took a knife from a competing dealer'];
function sdS() { S.dealers = S.dealers || {}; return S.dealers; }
const sdWorldName = id => (LEVELS[id] && LEVELS[id].name) || id;
function sdSpot(id) { const sd = (typeof outSeed === 'function' ? outSeed(id) : id.length * 13) + 77; return typeof outSpot === 'function' ? outSpot(sd, 0.45, 0.75) : null; }
function sdCandidate(id) { S.sdPool = S.sdPool || {}; const c = S.sdPool[id], now = Date.now(); if (c && now - c.t < 30 * 60000) return c.c;
  const sk = 1 + Math.floor(Math.random() * 3), n = { name: CREW_FIRST[Math.floor(Math.random() * CREW_FIRST.length)] + ' ' + CREW_LAST[Math.floor(Math.random() * CREW_LAST.length)], skill: sk, trait: Object.keys(CREW_TRAITS)[Math.floor(Math.random() * 6)], look: Math.floor(Math.random() * CREW_LOOKS.length), fee: 400 + sk * 450 };
  S.sdPool[id] = { t: now, c: n }; return n; }
function sdHire(id, c, remote) { const fee = remote ? Math.round(c.fee * 1.6) : c.fee; if (S.cr < fee) return false; S.cr -= fee;
  sdS()[id] = { name: c.name, skill: c.skill, trait: c.trait, look: c.look, t: Date.now(), earned: 0, sold: 0, log: [remote ? 'Set up by your Dealer.' : 'Hired on the corner.'] };
  if (S.sdPool) delete S.sdPool[id]; SFX.coin(); toast('STREET DEALER', `${c.name} is working ${sdWorldName(id)}`, 2.5); markDirty(); return true; }
// take one dose from the Lab (shelf first, then stations), or a boutique dose from your bag
function sdTakeDose() { try { const L = labS(); let id = Object.keys(L.shelf).find(i => L.shelf[i] > 0); if (id) { if (!--L.shelf[id]) delete L.shelf[id]; return id; }
  const T = L.st.find(t => t.n > 0); if (T) { T.n--; return T.r; } } catch (_) {}
  const b = Object.keys(S.inv || {}).find(k => SUBS[k] && SUBS[k].boutique && S.inv[k] > 0 && SUBS[k].price > 0); if (b) { if (!--S.inv[b]) delete S.inv[b]; return b; } return null; }
function sdWork() { if (!S.dealers || !roomLvl('lab')) return; const D = sdS(), now = Date.now();
  for (const id in D) { const m = D[id]; m.heat = m.heat || 0; const ev = SD_EVERY * 60000 * (m.trait === 'quick' ? 0.75 : 1); let n = 0;
    while (now - m.t >= ev && n < 10) { m.t += ev; n++;
      if (m.low) { m.heat = Math.max(0, m.heat - 25); continue; } m.heat = Math.max(0, m.heat - 4);
      const rk = (m.trait === 'careful' ? 0.5 : m.trait === 'reckless' ? 2 : 1) * (0.2 + m.heat / 40);
      if (Math.random() < SD_RIVAL * rk) { const how = SD_DEAD_LINES[Math.floor(Math.random() * SD_DEAD_LINES.length)]; delete D[id]; toast('DEALER LOST', `${m.name} ${how} on ${sdWorldName(id)}.`, 4); log(`Your street dealer on ${sdWorldName(id)}, ${m.name}, ${how}. Go back to the corner, or have your Dealer set someone up.`, 'loot'); try { SFX.hit(); } catch (_) {} break; }
      if (Math.random() < SD_RAT * (m.trait === 'loyal' ? 0.3 : 1)) { const how = SD_RAT_LINES[Math.floor(Math.random() * SD_RAT_LINES.length)]; delete D[id]; toast('RATTED OUT', `${m.name} ${how}. The Marshals know your name.`, 4.5); try { crime(25 + m.sold, `${m.name} ${how} on ${sdWorldName(id)}`); } catch (_) {} break; }
      let got = 0; for (let k = 0; k < m.skill + 1; k++) { const d = sdTakeDose(); if (!d) break; const cr = Math.round((SUBS[d] ? SUBS[d].price : 100) * 0.75 * (m.trait === 'greedy' ? 1.3 : 1)); S.cr += cr; got += cr; m.sold++; m.heat = Math.min(100, m.heat + (m.trait === 'careful' ? 3 : 5)); }
      m.earned += got; if (m.heat >= 70 && !m.warned) { m.warned = 1; toast('HEAT', `${m.name} on ${sdWorldName(id)} is getting hot. Tell them to lay low.`, 3.5); } if (m.heat < 50) m.warned = 0; m.log.unshift(got ? `Sold product: +${got} CR.` : 'Nothing to sell. Stood around.'); if (m.log.length > 5) m.log.length = 5; }
    if (D[id] && now - m.t > ev) m.t = now; }
  markDirty(); }
setInterval(() => { try { sdWork(); } catch (e) { console.warn('dealers', e); } }, 5000);
const sdHeat = m => { const h = Math.round(m.heat || 0), n = Math.round(h / 10); return `Heat ${'▮'.repeat(n)}${'▯'.repeat(10 - n)} ${h}%${h >= 70 ? ' HOT' : h >= 40 ? ' warm' : ''}`; };
function openStreetDealers() { sdWork(); const D = sdS(), hasDealer = !!crewS().dealer; openDlg('Street dealers', `${Object.keys(D).length} of ${OUT_WORLDS.length} worlds covered`);
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows'; rows.style.cssText = 'display:flex;flex-direction:column;gap:6px';
  $('dlgLine').textContent = `Street dealers sell your Lab product in their world and send the credits home. Every sale adds heat, and the hotter they are the likelier rivals or the Marshals get to them. Tell a hot dealer to lay low to cool off. Hire on each world's street corner${hasDealer ? ', or have your Dealer set someone up from here for a bigger fee' : '. Hire a Dealer for your crew and they can set people up from here'}.`;
  for (const id of OUT_WORLDS) { if (!LEVELS[id]) continue; const m = D[id], d = document.createElement('div'); d.className = 'rowi'; d.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
    const s = document.createElement('span'); s.style.flex = '1 1 220px';
    if (m) { s.textContent = `${sdWorldName(id)}: ${m.name} ${crewStars(m.skill)} · ${CREW_TRAITS[m.trait].name} · ${m.sold} sold · ${m.earned} CR${m.low ? ' · laying low' : ''}`; const hm = document.createElement('div'); hm.textContent = sdHeat(m); hm.style.color = (m.heat || 0) >= 70 ? '#ff5a4a' : (m.heat || 0) >= 40 ? '#ffd36a' : '#7fff6a'; s.appendChild(hm); }
    else { const c = sdCandidate(id); s.textContent = `${sdWorldName(id)}: nobody. ${c.name} ${crewStars(c.skill)} (${CREW_TRAITS[c.trait].name}) wants in.`; }
    d.appendChild(s);
    const b = document.createElement('button'); b.className = 'pbtn';
    if (m) { const lb = document.createElement('button'); lb.className = 'pbtn'; lb.textContent = m.low ? 'Back to work' : 'Lay low'; lb.addEventListener('click', () => { m.low = !m.low; m.log.unshift(m.low ? 'Laying low. No sales, cooling off.' : 'Back on the corner.'); markDirty(); openStreetDealers(); }); d.appendChild(lb); b.textContent = 'Cut loose'; b.addEventListener('click', () => { delete D[id]; markDirty(); openStreetDealers(); }); }
    else { const c = sdCandidate(id), fee = Math.round(c.fee * 1.6); b.textContent = `Set up ${fee} CR`; b.disabled = !hasDealer || S.cr < fee; b.addEventListener('click', () => { if (sdHire(id, c, true)) openStreetDealers(); }); }
    d.appendChild(b); rows.appendChild(d); }
  $('dlgActs').before(rows); acts([['Back to crew', () => openCrew()], ['Close', closeDlg, true]]); }
// the crew panel gets a Street dealers button
{ const _oc = openCrew; openCrew = function () { _oc.apply(this, arguments); const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = 'Street dealers'; b.addEventListener('click', openStreetDealers); $('dlgActs').prepend(b); }; }
// the corner itself: your dealer leaning on a lamp post, or someone waiting for work
function sdDressWorld(id) { if (!OUT_WORLDS.includes(id)) return; const p = sdSpot(id); if (!p) return; const y = floorAt(p.x, p.z), face = Math.atan2(WORLD_C.x - p.x, WORLD_C.z - p.z);
  part(levelGroup, Cy(0.06, 0.08, 3.2, 6), '#3a3d44', p.x - 0.7, y + 1.6, p.z); const lamp = part(levelGroup, new THREE.SphereGeometry(0.16, 8, 6), glow('#ffd36a'), p.x - 0.7, y + 3.25, p.z);
  const m = sdS()[id], c = m || sdCandidate(id), L = CREW_LOOKS[c.look] || CREW_LOOKS[0];
  const o = buildChar(() => makeCivilian(...L), 'civ'); o.position.set(p.x, y, p.z); o.rotation.y = face; levelGroup.add(o); const R = o.userData.rig, ph = Math.random() * 6;
  levelAnims.push(t => { if (!o.parent || !R || !R.armL) return; R.armR.rotation.x = m ? -0.5 + Math.sin(t * 0.7 + ph) * 0.3 : -0.1; R.armL.rotation.x = -0.15; o.rotation.y = face + Math.sin(t * 0.3 + ph) * 0.5; });
  INTERACTS.push({ x: p.x, z: p.z, r: 1.8, label: m ? `Talk to ${m.name} (your dealer)` : `Talk to ${c.name} (looking for work)`, fn: () => { sdWork(); const mm = sdS()[id];
    if (mm) { openDlg(mm.name, `Street dealer · ${sdWorldName(id)}`); $('dlgLine').textContent = `"${mm.low ? 'Keeping my head down, boss.' : (mm.heat || 0) >= 70 ? 'Marshals keep driving past. I don\'t like it.' : 'Corner\'s quiet. Business is good.'}" ${mm.sold} sold, ${mm.earned} CR sent home. ${sdHeat(mm)}.`; acts([[mm.low ? 'Back to work' : 'Lay low', () => { mm.low = !mm.low; markDirty(); closeDlg(); }, true], ['All street dealers', openStreetDealers], ['Close', closeDlg]]); return; }
    const cc = sdCandidate(id); openDlg(cc.name, `Looking for work · ${sdWorldName(id)}`);
    $('dlgLine').textContent = `"I know this street. Give me product and I'll move it." ${crewStars(cc.skill)} · ${CREW_TRAITS[cc.trait].name}: ${CREW_TRAITS[cc.trait].desc} Hiring fee ${cc.fee} CR. Sells from your ship's Lab.${roomLvl('lab') ? '' : ' You need a Lab first.'}`;
    acts([[`Hire for ${cc.fee} CR`, () => { if (sdHire(id, cc, false)) { closeDlg(); log(`${cc.name} is working the corner on ${sdWorldName(id)}. Visit next time you land here.`, 'loot'); } }, true, S.cr < cc.fee || !roomLvl('lab')], ['Not now', closeDlg]]); } }); }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); setTimeout(() => { try { sdDressWorld(id); } catch (e) { console.warn('sd', e); } }, 200); return r; }; }
