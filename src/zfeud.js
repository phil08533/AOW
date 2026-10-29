// =================== DECK 6 FEUD AND VIXEN'S ARREST (2.23.77) ===================
// Gus Bitwhistle runs the Neon Arcade and hates Lucky Lux, who runs the Lucky Asteroid next door. Gus wants Lux's coffee spiked.
// Outlaws poison Lux. Marshals arrest Gus. Anyone else can poison Lux or turn Gus in to Marshal Rook in the plaza.
// Whoever gets poisoned or arrested is gone for a few in-game days (S.jail), same as every arrest.
// Save field: S.feud = { st: 0 not met, 1 holding the powder, 2 done, how: 'poison' | 'arrest' | 'rook' }.
const feudS = () => (S.feud = S.feud || { st: 0 });
const FD = { mug: null };
ITEMS.gutrot = { name: 'Gutrot powder', v: 0, col: '#9fff6a', note: "Gus Bitwhistle's packet. One spoon in Lucky Lux's coffee and he's off the floor for days." };
function feudLines(lines, done, i) { i = i || 0; if (i >= lines.length) { closeDlg(); if (done) done(); return; } const [who, role, t] = lines[i];
  openDlg(role, who); $('dlgLine').textContent = t; try { SFX.babble && SFX.babble(voicePitch(who), Math.min(14, 4 + (t.length >> 4))); } catch (_) {}
  acts([[i === lines.length - 1 ? 'Okay' : 'Next ▸', () => feudLines(lines, done, i + 1), true]]); }
const feudGone = (id, k) => { const o = npcObjs[id]; if (o) { scene.remove(o.obj); delete npcObjs[id]; } jailS()[k] = jailUntil(); markDirty(); };
const feudId = base => Object.keys(npcObjs).find(k => k.startsWith(base) && /\d+$/.test(k.slice(base.length)));

// ---- Gus and his desk by the arcade's south wall ----
{ const _zn = zNpcs; zNpcs = function (n, th) { let L = _zn(n, th);
  if (th === 'under' && jailed('vixen')) L = L.filter(d => d.id !== 'velma');
  if (th !== 'arcade') return L;
  if (jailed('lux')) L = L.filter(d => d.id !== 'slots' + n);
  if (!jailed('gus')) L.push({ id: 'gus' + n, name: 'Gus Bitwhistle', role: 'Manager · Neon Arcade', rig: 'civ', make: () => makeCivilian('#3fd8ff', '#1e1c22', '#e0b892', '#5a3a22', '#ff4fa0'), x: 1.4, z: 18.5, face: Math.PI,
    idle: ["Every token in this place is mine. Every ticket. Every sticky joystick.", "Lux keeps stealing my customers with free drinks. FREE. DRINKS. That's not business, that's warfare."], custom: [['Talk', () => feudGus()]] });
  return L; }; }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.apply(this, arguments); FD.mug = null; if (zTheme(ZF.floor) !== 'arcade') return;
  try { const X = 1.4, Z = 17.6; part(props, B(1.8, 0.85, 0.7), toon('#1e1e2a', 'hull'), X, 0.425, Z); part(props, B(1.9, 0.05, 0.8), toon('#2a2a3a'), X, 0.875, Z); part(props, B(1.8, 0.04, 0.04), glow('#3fd8ff'), X, 0.8, Z - 0.36);
    part(props, B(0.5, 0.32, 0.04), toon('#0a0a0e'), X - 0.4, 1.06, Z + 0.15, -0.2); part(props, B(0.44, 0.26, 0.01), glow('#2a4a8a'), X - 0.4, 1.06, Z + 0.125, -0.2); for (let k = 0; k < 3; k++) part(props, Cy(0.05, 0.05, 0.03, 10), toon('#c9a43a'), X + 0.35 + k * 0.05, 0.915 + k * 0.03, Z);
    zaLightbox(props, zaSignTex('MANAGER', { fg: '#ffffff', glow: '#3fd8ff', bg: '#0a1838', w: 256, h: 72, font: 'Impact, sans-serif' }), 0.9, 0.24, 0.06, X, 2.6, 19.83, Math.PI, '#3fd8ff'); box(X, Z, 0.9, 0.35);
    // Lux's coffee on the cashier counter
    const m = new THREE.Group(); m.position.set(-11.6, 1.16, 18.5); levelGroup.add(m); part(m, Cy(0.05, 0.045, 0.1, 10), toon('#e8e4dc'), 0, 0.05, 0); part(m, new THREE.TorusGeometry(0.03, 0.008, 4, 8), toon('#e8e4dc'), 0.055, 0.05, 0, 0, 0, Math.PI / 2); part(m, Cy(0.043, 0.043, 0.01, 10), toon('#3a2010'), 0, 0.095, 0); FD.mug = m;
    INTERACTS.push({ x: -11.6, z: 17.6, r: 1.1, get label() { return feudS().st === 1 && S.inv.gutrot && !jailed('lux') ? "☠ Spike Lux's coffee" : "Lux's coffee"; }, fn: () => feudSpike() });
  } catch (e) { console.warn('feud', e); } }; }

function feudGus() { const F = feudS(), Mar = mOn(), Out = !Mar && typeof isOutlaw === 'function' && isOutlaw(); openDlg('Manager · Neon Arcade', 'Gus Bitwhistle');
  if (F.st === 2) { $('dlgLine').textContent = F.how === 'poison' ? '"Quiet next door, isn\'t it? Beautiful. I can hear my own pinball machines again."' : '"Business is business. Go play something."'; acts([['Bye', closeDlg, true]]); return; }
  if (F.st === 1) { $('dlgLine').textContent = '"Well? His coffee sits on the cashier counter. Lux drinks a pot a day and never once offered me a cup."'; const L = [['Working on it', closeDlg, true]]; if (Mar) L.unshift(['🚔 Arrest Gus for plotting a poisoning', () => feudArrest()]); acts(L); return; }
  feudLines([['Gus Bitwhistle', 'Manager · Neon Arcade', "Psst. You. You look like someone who can carry a small packet across a room without making a whole thing of it."],
    ['Gus Bitwhistle', 'Manager · Neon Arcade', "See that archway? Lucky Lux. Runs the casino. Gives out FREE DRINKS so my customers wander over and lose their ticket money on slots."],
    ['Gus Bitwhistle', 'Manager · Neon Arcade', "This is Gutrot powder. One spoon in his coffee and he spends three days hugging a med-bay bucket. Nobody gets hurt. Much."],
    ['Gus Bitwhistle', 'Manager · Neon Arcade', "Do it and there's 1,500 cr in it for you. And a lifetime pass. The pass is a sticker. It's a nice sticker."]], () => {
    openDlg('Manager · Neon Arcade', 'Gus Bitwhistle'); $('dlgLine').textContent = Mar ? `He hasn't noticed the badge on your belt yet.` : '"So? Are we doing business?"';
    const take = ['Take the powder', () => { F.st = 1; invAdd('gutrot', 1); markDirty(); SFX.quest && SFX.quest(); toast('GUTROT POWDER', Out ? "Spike Lux's coffee at the cashier counter." : "Spike Lux's coffee, or take this to Marshal Rook in the plaza.", 3.5);
      log(Out ? "Gus Bitwhistle gave you Gutrot powder for Lucky Lux's coffee." : "Gus Bitwhistle gave you Gutrot powder for Lucky Lux's coffee. Or you could turn him in to Marshal Rook in the plaza.", 'quest'); closeDlg(); }, true];
    acts(Mar ? [['🚔 Arrest Gus for plotting a poisoning', () => feudArrest(), true], ['Walk away', closeDlg]] : [take, ['Not my business', closeDlg]]); }); }
function feudSpike() { const F = feudS();
  if (!(F.st === 1 && S.inv.gutrot) || jailed('lux')) { toast("LUX'S COFFEE", 'Black, cold and somehow still smug.', 2); return; }
  if (mOn()) { toast('MARSHAL', "You wear a badge. Arrest Gus instead.", 2.5); return; }
  S.inv.gutrot--; if (!S.inv.gutrot) delete S.inv.gutrot; SFX.ui && SFX.ui(); const id = feudId('slots');
  feudLines([['You', 'Neon Arcade', 'You tip the packet into the mug while Lux counts chips. It fizzes, turns faintly green, then looks like coffee again.'],
    ['Lucky Lux', 'Cashier · casino host', "*sip* ...Huh. Hazelnut? We don't stock hazelnut."], ['Lucky Lux', 'Cashier · casino host', "*sip* Oh. Oh no. Oh, that's a rumble. That's a casino-wide rumble."],
    ['Lucky Lux', 'Cashier · casino host', "SOMEBODY WATCH THE CAGE. Nobody touch the chips. I'll be in the med bay for, uh, several business days."]], () => {
    if (id) feudGone(id, 'lux'); else { jailS().lux = jailUntil(); markDirty(); } F.st = 2; F.how = 'poison'; const pay = 1500; S.cr += pay; gainXp(400); if (typeof crime === 'function') crime(10, 'Poisoned Lucky Lux');
    toast('☠ LUX IS OUT', `Gus slides you ${pay} cr and a sticker.`, 3.5); log(`You spiked Lucky Lux's coffee. He's in the med bay for a few days. Gus paid ${pay} cr.`, 'loot'); SFX.coin && SFX.coin(); markDirty(); }); }
function feudArrest() { closeDlg(); const id = feudId('gus'), F = feudS(); if (S.inv.gutrot) { delete S.inv.gutrot; } mBadgePop(); const M = mS(); M.busts = (M.busts || 0) + 1;
  if (id) feudGone(id, 'gus'); else jailS().gus = jailUntil(); F.st = 2; F.how = 'arrest'; const cr = 600 + S.lvl * 5; S.cr += cr; mGain(90, 'Arrested Gus Bitwhistle for plotting to poison Lucky Lux');
  toast('ARRESTED', `Gus Bitwhistle · Gutrot powder seized · +${cr} cr`, 3.5); log(`Gus Bitwhistle is in a Marshal holding cell for ${JAIL_DAYS} days. Lucky Lux sends a fruit basket. +${cr} cr.`, 'loot'); SFX.quest && SFX.quest(); markDirty(); }
// ---- turning Gus in to Marshal Rook (anyone who isn't an outlaw or a Marshal) ----
{ const _t = talk; talk = function (id) { const o = npcObjs[id], F = feudS();
  if (id === 'rook' && o) { const d = o.def; d._cf = d._cf || d.custom || []; d.custom = F.st === 1 && !mOn() && !(typeof isOutlaw === 'function' && isOutlaw()) ? [...d._cf, ['🗂 Report Gus Bitwhistle\'s poison plot', () => feudRook()]] : d._cf; }
  return _t.apply(this, arguments); }; }
function feudRook() { const F = feudS(); feudLines([['You', 'Zeltac plaza', "The arcade manager on Deck 6 gave you a packet of Gutrot powder to put in Lucky Lux's coffee. You hand it over."],
  ['Marshal Rook', 'Galactic Marshals', "Gus Bitwhistle. Of course. Last month he reported the claw machine for 'emotional fraud'."], ['Marshal Rook', 'Galactic Marshals', "We'll pick him up. He can cool off in a cell for a few days. Here, for doing the decent thing."]], () => {
  if (S.inv.gutrot) delete S.inv.gutrot; jailS().gus = jailUntil(); F.st = 2; F.how = 'rook'; const cr = 900; S.cr += cr; gainXp(300); toast('GUS IS IN A CELL', `Marshal Rook pays you ${cr} cr.`, 3.5); log(`You turned Gus Bitwhistle in to Marshal Rook. He's in a cell for a few days. +${cr} cr.`, 'loot'); SFX.quest && SFX.quest(); markDirty(); }); }

// ---- Vixen: she asks for S-grade drugs, so a Marshal can arrest her ----
ARRESTABLE.vixen = { obj: 'velma', her: 1, crime: 'soliciting S-grade drugs', xp: 80, cr: 420, days: JAIL_DAYS,
  plead: ['"Arrest ME? Sugar, I sing for a room full of smugglers. I am the least illegal thing down here."', '"Fine. But the band keeps playing. If the horn section starts doing jazz, that\'s on you."'],
  sold: "You're the one who brought it to me! ...Fine. Cuff me. But I'm writing a song about this, and you're the villain." };
{ const _vt = vixTalk; vixTalk = function () { _vt.apply(this, arguments); const V = vixS(); if (!mOn() || V.st === 2 || !dlgOpen || !npcObjs.velma) return;
  const b = document.createElement('button'); b.className = 'pbtn'; b.textContent = '🚔 Arrest Vixen for soliciting S-grade drugs'; b.addEventListener('click', () => { (S.flags = S.flags || {}).sold_vixen = V.st === 1 ? 1 : 0; V.st = 0; arrestNpc('vixen'); }); $('dlgActs').prepend(b); }; }
