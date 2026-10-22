// =================== THE BRIDGE CREW AND THE BIG SHIPMENT (2.22.20) ===================
// The Captain's Bridge gets a working crew at the stations, and Quartermaster Dax runs a side job: bring him a big
// drug shipment for the officers' "morale fund". When you hand it over, the Marshals were tipped off and storm the bridge.
// Fight them off and Dax pays double. The job comes back a day later.
const DAX = { need: 12, fight: null };
function daxS() { return S.flags.dax = S.flags.dax || { st: 0, t: 0, done: 0 }; }
function daxDoses() { let n = 0; for (const k in S.inv) if (typeof SUBS !== 'undefined' && SUBS[k] && S.inv[k] > 0) n += S.inv[k]; return n; }
function daxValue() { let v = 0; for (const k in S.inv) if (SUBS[k] && S.inv[k] > 0) v += S.inv[k] * (SUBS[k].price || 100); return v; }
function daxTalk() { const D = daxS(), have = daxDoses(); openDlg('Quartermaster · the morale fund', 'Dax');
  if (DAX.fight) { $('dlgLine').textContent = 'Marshals! Shoot them, not me!'; acts([['Go', closeDlg, true]]); return; }
  if (D.st === 0 && Date.now() - D.t < 24 * 3600e3) { $('dlgLine').textContent = "That last shipment's still going round. Come back tomorrow."; acts([['Later', closeDlg, true]]); return; }
  if (D.st === 0) { $('dlgLine').textContent = `The officers need... morale. A big shipment, quietly. ${DAX.need} doses of anything you cook or score. I pay well, and the Captain never looks at the cargo logs.`;
    acts([['Take the job', () => { D.st = 1; markDirty(); log(`Dax wants ${DAX.need} doses of any drug for the bridge. Bring them to him.`, 'loot'); closeDlg(); }, true], ['Not now', closeDlg]]); return; }
  $('dlgLine').textContent = have >= DAX.need ? `${have} doses on you. That'll do nicely. Hand them over?` : `You've got ${have} of ${DAX.need} doses. Cook some more at the Boutique Bench, or buy from a dealer.`;
  acts([['Hand over the shipment', () => daxHandOver(), true, have < DAX.need], ['Later', closeDlg]]); }
function daxHandOver() { if (daxDoses() < DAX.need) return; const pay = Math.round(daxValue() / Math.max(1, daxDoses()) * DAX.need * 2); let left = DAX.need;
  for (const k of Object.keys(S.inv)) { if (!left) break; if (!SUBS[k] || !(S.inv[k] > 0)) continue; const q = Math.min(left, S.inv[k]); S.inv[k] -= q; left -= q; if (!S.inv[k]) delete S.inv[k]; }
  closeDlg(); markDirty(); daxS().st = 2; DAX.pay = pay;
  toast('MARSHALS!', 'Someone tipped them off. Defend the bridge!', 3.5); SFX.hit(); try { crime(30, "drug deal on the Captain's Bridge"); } catch (_) {}
  DAX.safes = SAFES.splice(0); const lv = [Math.max(1, S.lvl - 1), S.lvl + 1]; DAX.fight = [];
  for (let i = 0; i < 6; i++) { const e = makeEnemy({ zone: 'deck', type: 'mhunter', n: 1, lv, at: [-12 + i * 5, 14] }); e.aggro = true; DAX.fight.push(e); } }
setInterval(() => { try { if (!DAX.fight) return;
  if (!LEVEL || LEVEL.id !== 'zfloor') { DAX.fight = null; daxS().st = 1; return; } // left mid-fight: the shipment's gone, the job resets to "bring more"
  for (const e of DAX.fight) if (e.dead && e.obj.parent) { scene.remove(e.obj); const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1); }
  if (DAX.fight.every(e => e.dead)) { DAX.fight = null; SAFES.push(...(DAX.safes || [])); const D = daxS(); D.st = 0; D.t = Date.now(); D.done++; S.cr += DAX.pay; markDirty(); SFX.level();
    toast('SHIPMENT DELIVERED', `Dax pays ${DAX.pay.toLocaleString()} CR. "Never happened."`, 4); log(`The Marshals are down. Dax paid ${DAX.pay.toLocaleString()} CR for the shipment.`, 'loot'); }
} catch (e) { console.warn('dax', e); } }, 500);
// the crew at their stations
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th !== 'bridge') return L;
  const crew = (id, name, role, x, z, cols, extra, idle) => Object.assign({ id, name, role, rig: 'civ', make: () => makeCivilian(...cols), x, z, face: Math.PI, idle }, extra || {});
  L.push(crew('zhelm', 'Helmsman Orrin', 'Helm', -15, 3.2, ['#2a3a7a', '#1e1c22', '#c58a64', '#1e1c22', '#ffd36a'], null, ["Steady as she goes. She always goes."]),
    crew('znav', 'Navigator Pell-Ri', 'Navigation', -5, 3.2, ['#2a3a7a', '#1e1c22', '#9fe8ff', '#5a4030'], null, ["Eleven decks, four hundred corridors, and they still ask me where the toilet is."]),
    crew('zcomms', 'Comms Officer Yune', 'Communications', 5, 3.2, ['#2a3a7a', '#1e1c22', '#e0b892', '#c8402f'], null, ["Marshal chatter's been loud lately. Just saying."]),
    crew('zsci', 'Science Officer Tamm', 'Sensors', 15, 3.2, ['#2a3a7a', '#1e1c22', '#8a5a3a', '#c9a43a'], null, ["Sensors show stars. Lots of them. Riveting."]),
    crew('zdax', 'Quartermaster Dax', 'Supplies · side jobs', 12, -6, ['#5a3a2a', '#1e1c22', '#c58a64', '#1e1c22', '#6fdc5a'], { face: -Math.PI / 2, custom: [['The morale fund', () => daxTalk()]] }, ["Supplies. All sorts. Don't ask what sort."]));
  return L; }; }
