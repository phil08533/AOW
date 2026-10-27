// =================== MARSHAL INFORMANTS: anyone looking for work (street corners, Grub's bar) can be hired by a Marshal ===================
// Save: S.marshal.inf = { key: { name, w, t } }. Each informant builds up a tip every 15 minutes (holds 3).
// A tip is Marshal XP and a little cash, and on their own world it can flush out a bust nearby.
const INF_EVERY = 15 * 60000, INF_MAX = 6;
function mInfS() { const M = mS(); M.inf = M.inf || {}; return M.inf; }
const mInfReady = I => Math.min(3, Math.floor((Date.now() - I.t) / INF_EVERY));
const mInfFee = c => Math.max(150, Math.round((c.fee || 600) * 0.4));
const INF_TIPS = ['"Fella with a limp has been moving crates after dark. Same alley, every night."', '"Somebody\'s cooking two blocks over. You can smell it if the wind is right."', '"Heard a name: a smuggler who pays in old credits. Nobody pays in old credits."', '"The bar back has been closing early. Too early. Something\'s going on in there."', '"Kid on the corner is carrying for someone big. He\'s scared. Go easy on him."'];
function mInfCollect(key, here) { const I = mInfS()[key], n = I ? mInfReady(I) : 0; if (!n) return false; const M = mS();
  I.t = Date.now(); const cr = n * (120 + 30 * mRank()); S.cr += cr; mGain(n * 40, `${I.name} passed you ${n} tip${n > 1 ? 's' : ''}`); M.tips = (M.tips || 0) + n; markDirty(); SFX.coin && SFX.coin();
  if (here && typeof mSpawnBust === 'function') setTimeout(() => { try { mSpawnBust(); } catch (e) {} }, 1500);
  return { n, cr }; }
function mInfTalk(key, c, where) { const I = mInfS()[key];
  if (I) { openDlg(I.name, 'Your informant · ' + where); const n = mInfReady(I);
    $('dlgLine').textContent = n ? INF_TIPS[Math.floor(Math.random() * INF_TIPS.length)] + `  (${n} tip${n > 1 ? 's' : ''} ready)` : '"Nothing yet, Marshal. Give it time. I\'ll keep my ears open."';
    return acts([n && ['Take the tips', () => { const r = mInfCollect(key, true); $('dlgLine').textContent = `"That's everything I've got." +${r.cr} CR. Keep an eye out, a bust might turn up nearby.`; acts([['Thanks', closeDlg, true]]); }, true], ['Let them go', () => { delete mInfS()[key]; markDirty(); $('dlgLine').textContent = '"No hard feelings, Marshal. I was never here."'; acts([['Close', closeDlg, true]]); }], ['Close', closeDlg, !n]].filter(Boolean)); }
  const fee = mInfFee(c), have = Object.keys(mInfS()).length; openDlg(c.name, 'Looking for work · ' + where);
  $('dlgLine').textContent = `"A Marshal, huh? I don't sell, I don't snitch... unless the money's right. I hear everything on this street." Hire as an informant for ${fee} CR. They pass you a tip every 15 minutes (XP and cash), and a tip can flush out a bust. You have ${have} of ${INF_MAX} informants.`;
  acts([[`Hire as informant · ${fee} CR`, () => { if (S.cr < fee || have >= INF_MAX) return; S.cr -= fee; mInfS()[key] = { name: c.name, w: where, t: Date.now() }; markDirty(); SFX.coin && SFX.coin(); toast('INFORMANT HIRED', `${c.name} will keep their ears open on ${where}`, 2.8); closeDlg(); }, true, S.cr < fee || have >= INF_MAX], ['Not now', closeDlg]]); }
// Grub's bar: the regulars looking for work become informant candidates too
{ const f0 = openHire; openHire = function () { if (!mOn()) return f0.apply(this, arguments); const P = crewPool();
  openDlg("Grub's bar", 'Looking for work'); $('dlgLine').textContent = '"Hire a crew? For what, the bake sale?" Grub nods at the regulars. "But these lot hear everything. Pay them and they\'ll talk to you."';
  const L = P.slice(0, 3).map(c => [`${c.name} · informant`, () => mInfTalk('bar:' + c.name, c, "Grub's bar")]); L.push(['Close', closeDlg, true]); acts(L); }; }
// the Marshal terminal gets an Informants page with everyone's tips
function mInfBoard() { const K = Object.keys(mInfS()); openDlg('Galactic Marshals', 'Informants');
  $('dlgLine').textContent = K.length ? K.map(k => { const I = mInfS()[k], n = mInfReady(I); return `${I.name} (${I.w}): ${n ? n + ' tip' + (n > 1 ? 's' : '') + ' ready' : 'listening'}`; }).join(' · ') : 'No informants yet. Anyone looking for work on a street corner, or the regulars at Grub\'s bar, can be hired.';
  const ready = K.filter(k => mInfReady(mInfS()[k]));
  acts([ready.length && ['Collect all tips', () => { let cr = 0; ready.forEach(k => { const r = mInfCollect(k, false); if (r) cr += r.cr; }); $('dlgLine').textContent = `Tips logged. +${cr} CR.`; acts([['Back', openMarshalBoard, true]]); }, true], ['Back', openMarshalBoard, !ready.length]].filter(Boolean)); }
{ const f0 = openMarshalBoard; openMarshalBoard = function () { const r = f0.apply(this, arguments); try { const b = document.createElement('button'); b.className = 'pbtn'; const n = Object.values(mInfS()).reduce((a, I) => a + mInfReady(I), 0); b.textContent = '🕵 Informants' + (n ? ` (${n})` : ''); b.addEventListener('click', mInfBoard); $('dlgActs').prepend(b); } catch (e) {} return r; }; }
