// =================== THE MARSHALS part 2: the ship board (rank animation), missions, random busts, the armory, the Lawbringer ===================
// Save adds to S.marshal: seenXp, hunt { lv, name }, bustT, buy {}.
// ---- gear ----
GUNS.mlaw = { name: 'Lawgiver Pistol', dmg: 160, rate: 0.22, mag: 14, reload: 1.0, req: 1, price: 0, col: '#ffd36a' };
GUNS.mpeace = { name: 'Peacekeeper Rifle', dmg: 300, rate: 0.12, mag: 36, reload: 1.3, req: 1, price: 0, col: '#4fd2ff', kind: 'rifle' };
ARMORS.mcoat = { name: 'Star Marshal Coat', lvl: 1, flag: 'mCoat', def: 0.3, trim: '#e8c35a', visor: '#4fd2ff', note: 'Marshal armory' };
ARMOR_KITS.mcoat = (g, A) => { if (ARMOR_KITS.marshal) ARMOR_KITS.marshal(g, A); const navy = toon('#1a2448', 'cloth');
  part(g, B(0.56, 0.1, 0.36), navy, 0, 1.6, -0.02); for (const s of [-1, 1]) { part(g, B(0.2, 0.62, 0.05), navy, 0.15 * s, 0.92, -0.22, 0.08); part(g, B(0.05, 0.6, 0.03), toon('#e8c35a'), 0.24 * s, 0.94, -0.2, 0.08); }
  part(g, B(0.4, 0.6, 0.05), navy, 0, 0.92, -0.25, 0.1); part(g, new THREE.OctahedronGeometry(0.06, 0), glow('#ffd36a'), 0.14, 1.42, 0.2); };
const M_SHOP = [['mlaw', 'gun', 1, 4000, 'Lawgiver Pistol', 'A heavy sidearm with a gold slide'], ['marshalArmor', 'flag', 0, 0, 'Marshal Armor', 'Standard issue for every Deputy'], ['mcoat', 'armor', 2, 12000, 'Star Marshal Coat', 'Armor 30%, a long navy coat with gold trim'], ['mpeace', 'gun', 3, 15000, 'Peacekeeper Rifle', 'A scoped rifle for Chief Marshals']];
function mArmory() {
  openDlg('Marshal armory', mRankName()); const rows = document.createElement('div'); rows.className = 'rows'; $('dlgLine').textContent = `Gear unlocks with rank. ${S.cr.toLocaleString()} cr.`; $('dlgActs').before(rows);
  for (const [id, kind, rk, cost, name, desc] of M_SHOP) { const have = kind === 'gun' ? S.guns.includes(id) : kind === 'flag' ? !!(S.flags && S.flags[id]) : !!(S.flags && S.flags[ARMORS[id].flag]), r = document.createElement('div'); r.className = 'rowi';
    const nm = document.createElement('span'); nm.textContent = `${name} · ${desc}`; const mt = document.createElement('span'); mt.className = 'meta'; mt.textContent = have ? 'Owned' : mRank() < rk ? `${M_RANKS[rk][1]} rank` : cost ? cost.toLocaleString() + ' cr' : 'Free';
    const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = '#e8c35a'; const ac = document.createElement('span'); ac.style.display = 'flex'; const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = have ? '✓' : 'Get'; b.disabled = have || mRank() < rk || S.cr < cost;
    b.addEventListener('click', () => { if (S.cr < cost) return; S.cr -= cost; S.flags = S.flags || {}; if (kind === 'gun') { S.guns.push(id); S.gun = id; player.ammo = gun().mag; } else if (kind === 'flag') S.flags[id] = true; else S.flags[ARMORS[id].flag] = true; SFX.buy ? SFX.buy() : SFX.ui(); toast('ISSUED', name, 2.5); log(`Marshal armory: ${name}${kind === 'gun' ? '' : '. Wear it from the Wardrobe.'}`, 'loot'); markDirty(); mArmory(); });
    ac.appendChild(b); r.append(dot, nm, mt, ac); rows.appendChild(r); }
  acts([['Back', openMarshalBoard, true]]);
}
// ---- the Lawbringer: a Marshal interceptor, the Setting Sun's frame in navy and white with a spinning light bar ----
SHIP_CLASSES.lawman = { name: 'Lawbringer Interceptor', blurb: 'Marshal issue. Tough, quick, and a red and blue light bar every crook knows.', cost: 30000, stat: { hull: 0.7, sp: 0.06, laser: 0.12 }, grip: 1.2, strafe: 1, lift: true, rcs: true, hide: () => !mOn() || mRank() < 2,
  slots: { bar: ['Light bar', [['Red and blue', 0, {}], ['Gold strobe', 2000, {}], ['Stealth (off)', 0, {}]]], lc: ['Laser color', LASER_OPTS], bolt: ['Bolt speed', [['Standard', 0, {}], ['Fast', 3000, {}], ['Hyper', 8000, {}]]] } };
SC_BUILD.lawman = (g, C, hull, acc, dk, eg) => {
  SC_BUILD.fighter(g, Object.assign({}, C, { wing: 2, nose: 5, eng: 0, wpn: 0, kit: 2 }), toon('#1e2a52'), '#e8eef2', dk, eg);
  g.traverse(m => { if (!m.isMesh || !m.material || !m.material.color) return; const h = '#' + m.material.color.getHexString(); if (/^#6a6e76|^#5d6168|^#6b6f77/.test(h)) m.material = toon('#e8eef2'); });
  for (const s of [-1, 1]) { part(g, B(0.06, 0.5, 2.6), toon('#e8c35a'), 1.0 * s, -0.05, 0.6); }
  part(g, new THREE.OctahedronGeometry(0.32, 0), glow('#ffd36a'), 0, 0.98, 1.9);
  const bar = new THREE.Group(); bar.position.set(0, 1.18, -0.2); g.add(bar); part(bar, B(1.5, 0.12, 0.3), dk, 0, 0, 0);
  const cols = (C.bar | 0) === 1 ? ['#ffd36a', '#ffd36a'] : (C.bar | 0) === 2 ? ['#22262e', '#22262e'] : ['#ff2a3a', '#2a6aff'];
  const spin = new THREE.Group(); bar.add(spin); for (const s of [-1, 1]) part(spin, B(0.6, 0.12, 0.24), glow(cols[s < 0 ? 0 : 1]), 0.38 * s, 0.1, 0);
  (g.userData.spin = g.userData.spin || []).push(spin);
};
// ---- missions (start and report in from the board) ----
const M_FUGS = ["Vex 'Two-Bit' Marlo", 'Dolly Quint', 'The Brothers Kask', 'Ripper Saul', 'Jandro the Smiling', 'Nine-Fingers Oyelaran', 'Madam Vey', 'Kit Corvo'];
ENEMY.fugitive = Object.assign({}, ENEMY.drifter, { name: 'Fugitive', passive: false, wanderer: null, hp: 900, xp: 300, elite: true, ranged: { dmg: 14, rate: 1.1, speed: 22, col: '#ff8a2a', range: 30, keep: 10 } });
ENEMY.suspect = Object.assign({}, ENEMY.drifter, { name: 'Suspect', passive: true, wanderer: null, hp: 260, xp: 60, ranged: { dmg: 9, rate: 1.4, speed: 18, col: '#ff8a2a', range: 24, keep: 8 } });
defQuest('mf1', { ch: 'Marshals · Fleet sweep', title: 'Sweep the Drome Cutters', giver: 'rook', turnIn: 'rook', req: [], repeat: true, when: () => mOn(), intro: ['Drome Cutters are running guns through the lanes. Board two and clear them.'], obj: [{ kind: 'kill', t: 'board_drome', n: 2, text: 'Board and clear 2 Drome Cutters', planet: 'space' }], outro: ['Two Cutters down. Good work, Marshal.'], reward: { cr: 4000, xp: 9000 } });
defQuest('mf2', { ch: 'Marshals · Fleet sweep', title: 'Clear the Raider Barges', giver: 'rook', turnIn: 'rook', req: [], repeat: true, when: () => mOn(), intro: ['Raider barges keep hitting the trade lanes. Board three and clear them out.'], obj: [{ kind: 'kill', t: 'board_raider', n: 3, text: 'Board and clear 3 raider ships', planet: 'space' }], outro: ['The lanes are quieter. For now.'], reward: { cr: 5000, xp: 11000 } });
defQuest('mm1', { ch: 'Marshals · Manhunt', title: 'Manhunt', giver: 'rook', turnIn: 'rook', req: [], repeat: true, when: () => mOn(), intro: ['A fugitive is hiding out in the wilds. Find them and bring them in.'], obj: [{ kind: 'kill', t: 'fugitive', n: 1, text: 'Track down the fugitive', zone: 'mhunt', planet: 'mezar' }], outro: ['Got them. One less name on the wall.'], reward: { cr: 6000, xp: 12000 } });
const M_MISSIONS = [['zh1', 'Hostage rescue', 140], ['mf1', 'Fleet sweep: Drome Cutters', 120], ['mf2', 'Fleet sweep: raider barges', 150], ['mm1', 'Manhunt', 180]];
function mHuntSet() { const M = mS(); if (!M.hunt) return; QDEFS.mm1.obj[0].planet = M.hunt.lv; QDEFS.mm1.obj[0].text = `Track down ${M.hunt.name} on ${(LEVELS[M.hunt.lv] || {}).name || M.hunt.lv}`; }
function mStart(id) { const M = mS(); if (id === 'mm1') { const w = OUT_WORLDS.filter(k => LEVELS[k] && k !== LEVEL.id); M.hunt = { lv: w[Math.floor(Math.random() * w.length)] || 'mezar', name: M_FUGS[Math.floor(Math.random() * M_FUGS.length)] }; mHuntSet(); }
  delete S.qst[id]; startQuest(id); markDirty(); openMarshalBoard(); }
function mReport(id, xp) { const s = S.qst[id]; if (!s) return; s.st = 'ready'; completeQuest(id); mGain(xp + mRank() * 20, QDEFS[id].title); if (id === 'mm1') { mS().hunt = null; } markDirty(); openMarshalBoard(); }
// ---- the board ----
function mBadgeSvg(r, anim) { return `<svg width="120" height="136" viewBox="0 0 150 170" style="${anim ? 'animation:mspin 2.4s ease-out 1;' : ''}display:block;margin:0 auto"><path d="M75 6l17 34 38 5-28 26 7 38-34-18-34 18 7-38-28-26 38-5z" fill="#e8c35a" stroke="#7a5a1a" stroke-width="5"/><circle cx="75" cy="70" r="22" fill="#2a3a7a" stroke="#ffe8a0" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => `<text x="${43 + i * 16}" y="128" text-anchor="middle" font-size="16" fill="${i <= r ? '#ffd36a' : '#3a3f4c'}" style="${anim && i === r ? 'animation:mstar 1s 1.2s both' : ''}">★</text>`).join('')}<rect x="18" y="138" width="114" height="26" rx="5" fill="#1a2240"/><text x="75" y="156" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#ffe8a0">${M_RANKS[r][1].toUpperCase()}</text></svg>`; }
{ const st = document.createElement('style'); st.textContent = '@keyframes mspin{0%{transform:rotateY(0) scale(.6)}70%{transform:rotateY(720deg) scale(1.08)}100%{transform:rotateY(720deg) scale(1)}}@keyframes mstar{0%{opacity:0;font-size:40px}100%{opacity:1}}@keyframes mstamp{0%{opacity:0;transform:rotate(-14deg) scale(2.4)}60%{opacity:1;transform:rotate(-14deg) scale(.9)}100%{opacity:1;transform:rotate(-14deg) scale(1)}}'; document.head.appendChild(st); }
function openMarshalBoard() {
  if (!mOn()) { openDlg('Galactic Marshals', 'Marshal board'); $('dlgLine').textContent = qDone('law1') ? 'The board is for badge holders. Talk to Marshal Rook, or tap your record chip, if you want in.' : 'A Galactic Marshals terminal. It is locked.'; acts([['Close', closeDlg, true]]); return; }
  const M = mS(), r = mRank(), nx = M_RANKS[r + 1], prev = M.seenXp == null ? M.xp : M.seenXp, pr = (() => { let k = 0; M_RANKS.forEach((x, i) => { if (prev >= x[0]) k = i; }); return k; })(), up = r > pr;
  const lo = M_RANKS[r][0], hi = nx ? nx[0] : lo + 1, f0 = up ? 0 : clamp((prev - lo) / (hi - lo), 0, 1), f1 = nx ? clamp((M.xp - lo) / (hi - lo), 0, 1) : 1; M.seenXp = M.xp; markDirty();
  openDlg('Galactic Marshals', 'Marshal board');
  const L = $('dlgLine'); L.innerHTML = `<div style="position:relative">${mBadgeSvg(r, true)}${up ? '<div style="position:absolute;left:50%;top:38%;margin-left:-70px;padding:4px 10px;border:3px solid #ff3a2a;color:#ff3a2a;font:800 22px var(--hud,sans-serif);letter-spacing:.1em;animation:mstamp .5s 2.3s both">PROMOTED</div>' : ''}</div><div style="margin:8px auto 4px;max-width:320px;height:10px;background:#1a2240;border-radius:5px;overflow:hidden"><div id="mbar" style="height:100%;width:${f0 * 100}%;background:linear-gradient(90deg,#c9a43a,#ffe8a0);transition:width 1.4s ease-out .6s"></div></div><div style="text-align:center;font-size:13px;opacity:.85">${M.xp} XP${nx ? ` · ${nx[1]} at ${nx[0]}` : ' · top rank'} · clout ${M.clout || 0} · busts ${M.busts || 0}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const b = $('mbar'); if (b) b.style.width = f1 * 100 + '%'; }));
  const list = [];
  for (const [id, name, xp] of M_MISSIONS) { const s = S.qst[id], q = QDEFS[id]; if (!q) continue; const done = s && (s.st === 'ready' || (s.st === 'active' && q.obj.every((o, k) => objDone(o, s.p[k]))));
    if (done) list.push([`✅ Report in: ${name}`, () => mReport(id, xp), true]); else if (s && s.st === 'active') list.push([`… ${name} (in progress)`, () => { S.track = id; renderQuest(); closeDlg(); toast('TRACKING', name, 2); }]); else list.push([`▶ ${name}`, () => mStart(id)]); }
  list.push(['🛡 Armory', mArmory], ['Close', closeDlg]); acts(list);
}
{ const _b = LEVELS.ship.build; LEVELS.ship.build = function () { const r = _b.apply(this, arguments); try {
  const X = 3.0, Z = -10.36, G = new THREE.Group(); G.position.set(X, 0, Z); props.add(G);
  part(G, B(1.7, 1.15, 0.08), toon('#1a2240'), 0, 1.75, 0); part(G, B(1.8, 0.06, 0.1), toon('#e8c35a'), 0, 2.34, 0); part(G, B(1.8, 0.06, 0.1), toon('#e8c35a'), 0, 1.16, 0);
  const tex = document.createElement('canvas'); tex.width = 256; tex.height = 160; const x = tex.getContext('2d'); x.fillStyle = '#0c1430'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#e8c35a'; x.font = '700 22px sans-serif'; x.textAlign = 'center'; x.fillText('GALACTIC MARSHALS', 128, 34); x.font = '600 16px sans-serif'; x.fillStyle = '#9fb0d8'; ['Missions', 'Rank', 'Armory'].forEach((t, i) => x.fillText('▸ ' + t, 128, 70 + i * 26));
  const T = new THREE.CanvasTexture(tex); part(G, new THREE.PlaneGeometry(1.5, 0.94), new THREE.MeshBasicMaterial({ map: T }), 0, 1.75, 0.05);
  const star = part(G, new THREE.OctahedronGeometry(0.12, 0), glow('#ffd36a'), 0.95, 2.15, 0.08); levelAnims.push(t => { star.rotation.y = t * 1.5; });
  INTERACTS.push({ x: X, z: Z + 1.0, r: 1.6, get label() { return mOn() ? '⭐ Marshal board (missions, rank, armory)' : 'Marshal board (locked)'; }, fn: openMarshalBoard });
} catch (err) { console.warn('marshal board', err); } return r; }; }
// ---- manhunt spawns and random busts ----
function mRandSpot(min, max) { for (let n = 0; n < 20; n++) { const a = Math.random() * 6.283, d = min + Math.random() * (max - min), x = player.pos.x + Math.sin(a) * d, z = player.pos.z + Math.cos(a) * d; if (Math.hypot(x - LEVEL.center[0], z - LEVEL.center[1]) > LEVEL.radius - 6) continue; if (typeof inSafe === 'function' && inSafe(V(x, 0, z))) continue; return { x, z }; } return null; }
function mMarker(e, col) { const m = part(e.obj, Cy(0.08, 0.08, 6, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 4.5, 0); return m; }
function mSpawnHunt() { const M = mS(), s = S.qst.mm1; if (!M.hunt || !s || s.st !== 'active' || LEVEL.id !== M.hunt.lv || enemies.some(e => e.sp.mHunt && !e.dead)) return;
  let p = null; try { p = outSpot(Math.floor(Math.random() * 999), 0.5, 0.85); } catch (_) {} if (!p) p = mRandSpot(50, 90); if (!p) return; Z.mhunt = { id: 'mhunt', name: 'Fugitive hideout', x: p.x, z: p.z, r: 12 };
  const e = makeEnemy({ zone: 'mhunt', type: 'fugitive', n: 1, lv: [S.lvl, S.lvl], once: true, mHunt: true }); e.def = Object.assign({}, e.def, { name: M.hunt.name }); e.plateHp = -1; updatePlate(e); mMarker(e, '#ff8a2a'); toast('MANHUNT', `${M.hunt.name} is hiding on this world. Follow your tracker.`, 4); }
const M_BUSTS = [['Street deal in progress', 'Dealer'], ['Smuggler with contraband', 'Smuggler'], ['Wanted fugitive spotted', 'Fugitive'], ['Lab runner on the move', 'Lab runner']];
function mSpawnBust() { const M = mS(); if (!OUT_WORLDS.includes(LEVEL.id) || LEVEL.fly || enemies.some(e => e.sp.mBust && !e.dead)) return; const p = mRandSpot(22, 40); if (!p) return; const B0 = M_BUSTS[Math.floor(Math.random() * M_BUSTS.length)];
  const zid = 'mbust'; Z[zid] = { id: zid, name: B0[0], x: p.x, z: p.z, r: 6 }; const e = makeEnemy({ zone: zid, type: 'suspect', n: 1, lv: [Math.max(1, S.lvl - 2), S.lvl], once: true, mBust: true, at: [0, 0] }); e.def = Object.assign({}, e.def, { name: B0[1] }); e.plateHp = -1; updatePlate(e); mMarker(e, '#ff2a3a');
  const a = { r: 3, get x() { return e.obj.position.x; }, get z() { return e.obj.position.z; }, label: '🪪 Flash your badge: you\'re under arrest', fn: () => mArrest(e, a) }; INTERACTS.push(a); e.mAct = a;
  toast('🚔 ' + B0[0].toUpperCase(), 'Nearby. Look for the red beacon', 3.5); SFX.zap && SFX.zap(); }
function mDrop(e) { const k = INTERACTS.indexOf(e.mAct); if (k >= 0) INTERACTS.splice(k, 1); }
function mArrest(e, a) { if (e.dead) return mDrop(e); mBadgePop(); const M = mS();
  if (!e.ran && Math.random() < 0.6) { e.dead = 3; e.gone = true; scene.remove(e.obj); const k = enemies.indexOf(e); if (k >= 0) enemies.splice(k, 1); mDrop(e); M.busts = (M.busts || 0) + 1; const cr = 120 + S.lvl * 12; S.cr += cr; mGain(40 + mRank() * 10, 'Arrest'); toast('ARRESTED', `Contraband seized · +${cr} cr`, 3); SFX.quest && SFX.quest(); markDirty(); M.bustT = Date.now() + (150 + Math.random() * 120) * 1000; }
  else { e.ran = true; e.def = Object.assign({}, e.def, { passive: false, speed: e.def.speed * 1.4 }); e.aggro = true; mDrop(e); toast('HE\'S RUNNING', 'Take him down', 2.5); } }
{ const _k = kill; kill = function (e) { const r = _k.apply(this, arguments); try { if (e.sp && e.sp.mBust) { mDrop(e); const M = mS(); M.busts = (M.busts || 0) + 1; mGain(15, 'Suspect down'); M.bustT = Date.now() + (150 + Math.random() * 120) * 1000; } if (e.sp && e.sp.mHunt) toast('FUGITIVE DOWN', 'Report in at the Marshal board on your ship', 3.5); } catch (_) {} return r; }; }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll.apply(this, arguments); if (mOn()) { mHuntSet(); setTimeout(() => { try { mSpawnHunt(); } catch (err) { console.warn('hunt', err); } }, 2500); } return r; }; }
setInterval(() => { try { if (!mOn() || state !== 'play' || CUT.on || !LEVEL) return; const M = mS(); if (!M.bustT) M.bustT = Date.now() + 60000; if (Date.now() > M.bustT) { M.bustT = Date.now() + 60000; mSpawnBust(); } } catch (err) { console.warn('bust', err); } }, 5000);
setTimeout(() => { try { if (mOn()) mHuntSet(); } catch (_) {} }, 2000);
// ---- the Maw finale: Vega and her squadron, plus your side (Marshals or outlaws) instead of the old cameos ----
{ const KEEP = ['Captain Vega', 'Lt. Vance', 'Ensign Park', 'Sgt. Okafor'], base = MAW_ALLIES.filter(a => KEEP.includes(a[0])), chat0 = MAW_CHATTER.filter(c => c[2] || /rookie!|beam|MOVE/.test(c[1]) && !/Skye|Ada|Hale|Rell|Lumen|Bug|Maxurge|Ramick|Elismas/.test(c[1]));
  const SIDES = {
    law: { ships: [['Marshal Rook', '#1e2a52'], ['Senior Marshal Quill', '#1e2a52'], ['Marshal Ibarra', '#2a3a7a'], ['Marshal Toomey', '#2a3a7a'], ['Deputy Hask', '#3a4a8a'], ['Deputy Brandt', '#3a4a8a'], ['Deputy Oyelaran', '#3a4a8a'], ['Marshal Vey', '#2a3a7a']], cls: 'lawman',
      chat: [['CAPTAIN VEGA', 'Rook brought every badge in the sector. Never thought I\'d be glad to see Marshals.'], ['CAPTAIN VEGA', 'Marshal squadron, light bars on! Let it know the law is here.'], ['CAPTAIN VEGA', 'Rook says you outrank half of them now, Marshal. Lead from the front.'], ['CAPTAIN VEGA', 'Deputies, stay in pairs. The little eyes love a straggler.']], in: 'Marshals, on the Captain! Light it up!' },
    out: { ships: [['Kade', '#0c0a10'], ['Don Klunkleone', '#8a2a22'], ['Grub', '#5a4a2a'], ['Lucky Vix', '#c9a43a'], ['Nine-Fingers', '#3a2a20'], ['Red Mags', '#a8302a'], ['Smiley Jax', '#4a3a5a'], ['The Fence', '#2a2c32']], cls: 'fighter',
      chat: [['CAPTAIN VEGA', 'Kade brought friends. Smugglers, pirates, the Don\'s whole crew. Don\'t ask, rookie.'], ['CAPTAIN VEGA', 'The Don says this thing owes him money. I believe him.'], ['CAPTAIN VEGA', 'Kade is on its left eye. Nobody ever said he wasn\'t good.'], ['CAPTAIN VEGA', 'Grub says if we win, drinks are on him. If we lose, drinks are also on him.']], in: 'Kade here. Heard you were picking a fight with a god. Couldn\'t miss it.' } };
  const _ar = mawAlliesArrive; mawAlliesArrive = function (quick) {
    if (!MAW.alliesIn) { const side = SIDES[mOn() ? 'law' : 'out']; MAW_ALLIES.length = 0; base.forEach(a => MAW_ALLIES.push(a)); side.ships.forEach(a => MAW_ALLIES.push(a)); MAW_CHATTER.length = 0; chat0.concat(side.chat).forEach(c => MAW_CHATTER.push(c));
      const r = _ar.apply(this, arguments);
      try { MAW.allies.forEach((A, i) => { const sh = side.ships.find(s => s[0] === A.name); if (!sh) return; const cfg = Object.assign({}, scS().cfg[side.cls] || {}, { cls: side.cls, p: i % SHIP_PAINTS.length }); const o = makeStarship(sh[1], cfg); o.scale.setScalar(1.1); o.position.copy(A.o.position); levelGroup.remove(A.o); levelGroup.add(o); A.o = o; }); } catch (err) { console.warn('maw side', err); }
      setTimeout(() => { try { mawComms(mOn() ? 'MARSHAL ROOK' : 'KADE', side.in, 6); } catch (_) {} }, 4000);
      return r; }
    return _ar.apply(this, arguments); }; }
