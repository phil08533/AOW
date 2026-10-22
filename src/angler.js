// =================== ANGLER'S DEN (2.14.5): a ship room where you mount your catches on the walls ===================
// Mount a fish from your bag onto one of 12 wall plaques (it uses up that fish). Each plaque shows the fish and your best length for it.
// Take one down and the fish goes back in your bag. Save field: S.mounts = [{ id, cm } | null] × 12.
ROOMS.angler = { name: "Angler's Den", cost: { cr: 1500, shell: 6 }, desc: 'Mount your catches on the walls: 12 trophy plaques, a rod rack, an armchair and a big aquarium.' };
const ANG = { g: null, slots: [] };
const ANG_N = 12;
const angFish = () => { const s = new Set(); for (const k in FISH_TABLES) for (const e of FISH_TABLES[k]) if (ITEMS[e[0]] && !fishJunk(e[0])) s.add(e[0]); return s; };
const angMounts = () => { if (!Array.isArray(S.mounts)) S.mounts = []; while (S.mounts.length < ANG_N) S.mounts.push(null); return S.mounts; };
function anglerRoom(s, cx, cz, outer, term, props) {
  const sd = s.side, H = 3.2, face = -sd * Math.PI / 2;
  ANG.slots = [];
  // eight plaques on the outer wall in two rows, four along the back wall
  for (const y of [2.25, 1.25]) for (const dz of [-3.3, -1.1, 1.1, 3.3]) ANG.slots.push({ x: outer - sd * 0.32, y, z: cz + dz, ry: face });
  for (const dx of [-3.4, -1.15, 1.15, 3.4]) ANG.slots.push({ x: cx + dx, y: 1.75, z: s.z1 - 0.32, ry: Math.PI });
  // wood panelling under the plaques
  part(props, B(0.05, 1.0, 9.6), toonNS('#5a3e2a', 'wood'), outer - sd * 0.27, 0.5, cz); part(props, B(0.07, 0.06, 9.6), toon('#c9a43a'), outer - sd * 0.28, 1.02, cz);
  part(props, B(9.6, 1.0, 0.05), toonNS('#5a3e2a', 'wood'), cx, 0.5, s.z1 - 0.27);
  // rug; the couch, side table and TV are added by tvden.js (2.17)
  part(props, B(4.2, 0.03, 3.0), toonNS('#2f5a6a', 'carpet'), cx, 0.02, cz); part(props, B(3.8, 0.035, 2.6), toonNS('#c9a43a', 'carpet'), cx, 0.021, cz); part(props, B(3.6, 0.04, 2.4), toonNS('#2f5a6a', 'carpet'), cx, 0.022, cz);
  // a big aquarium on the inner side, with a few fish swimming laps
  { const ax = (sd > 0 ? s.x0 : s.x1) + sd * 0.7, az = cz - 3.2, tk = new THREE.Group(); tk.position.set(ax, 0, az); levelGroup.add(tk);
    part(tk, B(1.0, 0.7, 2.6), toon('#2a2c32'), 0, 0.35, 0); part(tk, B(0.9, 1.0, 2.5), new THREE.MeshBasicMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.3, depthWrite: false }), 0, 1.2, 0); part(tk, B(1.0, 0.08, 2.6), toon('#2a2c32'), 0, 1.74, 0); part(tk, B(0.86, 0.12, 2.46), toon('#d8c8a0', 'grime'), 0, 0.76, 0);
    const fs = []; ['#ff9a3c', '#ffd36a', '#4fd2ff', '#ff6aa8'].forEach((c, i) => { const f = new THREE.Group(); part(f, B(0.16, 0.08, 0.04), glow(c), 0, 0, 0); part(f, B(0.05, 0.08, 0.02), glow(c), -0.1, 0, 0); f.rotation.y = Math.PI / 2; tk.add(f); fs.push(f); });
    levelAnims.push(t => fs.forEach((f, i) => { const a = t * (0.4 + i * 0.1) + i * 1.6; f.position.set(Math.sin(a * 1.3) * 0.25, 1.0 + i * 0.15 + Math.sin(a * 2) * 0.05, Math.sin(a) * 1.0); f.rotation.y = Math.cos(a) >= 0 ? Math.PI / 2 : -Math.PI / 2; }));
    box(ax, az, 0.55, 1.35); ANG.tank = tk; ANG.live = new THREE.Group(); tk.add(ANG.live); angTankFill(); INTERACTS.push({ x: ax + sd * 1.1, z: az, r: 1.8, label: 'Aquarium: drop in a fish', fn: openAngTank }); }
  // rod rack: every rod tier standing up against the front wall (2.17: they used to lie on the floor)
  { const rk = new THREE.Group(), wd = toon('#5a3e2a', 'wood'); part(rk, B(1.5, 0.14, 0.34), wd, 0, 0.07, 0); part(rk, B(1.5, 0.08, 0.1), wd, 0, 1.3, -0.1); for (const x of [-0.72, 0.72]) part(rk, B(0.08, 1.34, 0.08), wd, x, 0.67, -0.12);
    for (let i = 0; i < 4; i++) { part(rk, Cy(0.05, 0.05, 0.03, 8), '#2a2c32', -0.48 + i * 0.32, 0.15, 0); try { const r = makeRodModel(Math.min(i + 1, 4)); r.position.set(-0.48 + i * 0.32, 0.12, 0); r.rotation.x = -0.07; rk.add(r); } catch (_) {} }
    rk.position.set(cx + sd * 3.4, 0, s.z0 + 0.3); props.add(rk); box(cx + sd * 3.4, s.z0 + 0.3, 0.8, 0.22); }
  ANG.g = new THREE.Group(); levelGroup.add(ANG.g); anglerPlaques(); // not in props: props get merged into one mesh, and the plaques change
  term(cx - sd * 1.5, s.z0 + 0.6, '#4fd2ff', 'Mount a catch', openAngler, 0);
}
function anglerPlaques() {
  if (!ANG.g || ANG.g.parent !== levelGroup) return; for (const c of [...ANG.g.children]) { ANG.g.remove(c); disposeTree(c); }
  const M = angMounts();
  ANG.slots.forEach((sl, i) => { const g = new THREE.Group(); g.position.set(sl.x, sl.y, sl.z); g.rotation.y = sl.ry; ANG.g.add(g); const m = M[i];
    part(g, B(1.1, 0.72, 0.05), toon(m ? '#6a4a30' : '#3a2e26', 'wood'), 0, 0, 0); part(g, B(1.16, 0.04, 0.06), toon('#c9a43a'), 0, 0.37, 0); part(g, B(1.16, 0.04, 0.06), toon('#c9a43a'), 0, -0.37, 0);
    if (!m || !ITEMS[m.id]) { part(g, B(0.3, 0.3, 0.01), toon('#2a221c'), 0, 0.02, 0.03); return; }
    try { const f = makeFishModel(m.id); const b = new THREE.Box3().setFromObject(f), sz = b.getSize(new THREE.Vector3()), k = Math.min(0.85 / Math.max(sz.x, 0.05), 0.42 / Math.max(sz.y, 0.05)); f.scale.setScalar(k); const c = b.getCenter(new THREE.Vector3()).multiplyScalar(k); f.position.set(-c.x, 0.06 - c.y, 0.1); g.add(f); } catch (e) { console.warn('plaque fish', e); }
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshBasicMaterial({ map: signTex(`${ITEMS[m.id].name} · ${m.cm} cm`, '#1e1610', '#ffd36a') })); lab.position.set(0, -0.25, 0.035); g.add(lab); });
}
function openAngler() {
  openDlg("Angler's Den", 'Trophy wall');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    const M = angMounts(), used = M.filter(Boolean).length, F = angFish(), free = M.indexOf(null);
    $('dlgLine').textContent = `${used} of ${ANG_N} plaques filled. Mounting a fish uses it up and shows your best length for that species. Take one down to get the fish back.`;
    const bag = Object.keys(S.inv).filter(k => F.has(k) && S.inv[k] > 0).map(k => [k, S.inv[k], (S.fishBest && S.fishBest[k] ? 'Best ' + S.fishBest[k] + ' cm · ' : '') + ITEMS[k].v + ' cr', [['Mount', () => anglerMount(k), free < 0]]]);
    const wall = M.map((m, i) => m && ITEMS[m.id] ? [m.id, null, `On the wall · ${m.cm} cm`, [['Take down', () => anglerTake(i)]]] : null).filter(Boolean);
    itemRows(rows, [...bag, ...wall]);
    if (!bag.length && !wall.length) rows.firstChild.textContent = 'No fish in your bag yet. Catch some at any fishing dock, then come back to mount them.';
  };
  ANG.render = render; render(); $('dlgActs').before(rows); acts([['Close', closeDlg]]);
}
function anglerMount(id) {
  const M = angMounts(), i = M.indexOf(null); if (i < 0 || !(S.inv[id] > 0)) return;
  S.inv[id]--; if (!S.inv[id]) delete S.inv[id];
  M[i] = { id, cm: (S.fishBest && S.fishBest[id]) || fishSize(id).cm }; markDirty(); anglerPlaques(); SFX.ui && SFX.ui(); log(`Mounted a ${ITEMS[id].name} on the wall.`, 'loot'); if (ANG.render) ANG.render();
}
function anglerTake(i) {
  const M = angMounts(), m = M[i]; if (!m) return; M[i] = null; S.inv[m.id] = (S.inv[m.id] || 0) + 1; markDirty(); anglerPlaques(); SFX.ui && SFX.ui(); if (ANG.render) ANG.render();
}

// ---- the aquarium (2.22.33): drop a catch in and it shrinks down and swims laps. Save field: S.tank = [fishId, ...] (max 16) ----
const ANG_TANK_MAX = 16;
const angTank = () => { if (!Array.isArray(S.tank)) S.tank = []; return S.tank; };
function angTankFill() {
  const L = ANG.live; if (!L || !ANG.tank || !ANG.tank.parent) return; for (const c of [...L.children]) { L.remove(c); disposeTree(c); }
  angTank().forEach((id, i) => { if (!ITEMS[id]) return; let f; try { f = makeFishModel(id); } catch (_) { return; }
    const b = new THREE.Box3().setFromObject(f), sz = b.getSize(new THREE.Vector3()), k = 0.26 / Math.max(sz.x, sz.z, 0.05), c = b.getCenter(new THREE.Vector3()).multiplyScalar(k);
    f.scale.setScalar(k); f.position.sub(c); const w = new THREE.Group(), turn = new THREE.Group(); turn.add(f); w.add(turn); L.add(w);
    const sp = 0.25 + (i % 5) * 0.06, ph = i * 2.39, y0 = 0.95 + (i % 4) * 0.15, sx = sz.x >= sz.z; w.userData = { sp, ph, y0, sx, turn }; });
}
// swim: lazy figure-eights inside the glass, turning to face where they go
setInterval(() => { try { const L = ANG.live; if (!L || !L.parent || !L.parent.parent) return; const t = performance.now() / 1000;
  for (const w of L.children) { const { sp, ph, y0, sx, turn } = w.userData, a = t * sp + ph, x = Math.sin(a * 1.7) * 0.28, z = Math.sin(a) * 1.05, y = y0 + Math.sin(a * 2.3) * 0.07;
    const dx = Math.cos(a * 1.7) * 1.7 * 0.28, dz = Math.cos(a) * 1.05; w.position.set(x, y, z); turn.rotation.y = Math.atan2(dz, dx) * -1 + (sx ? 0 : Math.PI / 2); turn.rotation.z = Math.sin(t * 6 + ph) * 0.08; } } catch (_) {} }, 33);
function openAngTank() {
  openDlg("Angler's Den", 'The aquarium'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const fishSet = angFish();
  const render = () => { const T = angTank(), have = Object.keys(S.inv).filter(k => S.inv[k] > 0 && fishSet.has(k));
    $('dlgLine').textContent = T.length >= ANG_TANK_MAX ? `The tank is full (${T.length}/${ANG_TANK_MAX}). Take one out to make room.` : `Drop a catch in: the tank's shrink field makes it aquarium-sized. ${T.length}/${ANG_TANK_MAX} swimming.`;
    const inTank = {}; T.forEach(id => { inTank[id] = (inTank[id] || 0) + 1; });
    itemRows(rows, [...have.map(k => [k, S.inv[k], 'in your bag', [['Drop in', () => drop(k), T.length >= ANG_TANK_MAX]]]),
      ...Object.keys(inTank).map(k => [k, inTank[k], 'swimming in the tank', [['Take out', () => take(k)]]])]); };
  const drop = k => { const T = angTank(); if (T.length >= ANG_TANK_MAX || !(S.inv[k] > 0)) return; S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; T.push(k); markDirty(); angTankFill(); try { SFX.splash ? SFX.splash() : SFX.quest(); } catch (_) {}
    if (ANG.tank) try { const p = new THREE.Vector3(); ANG.tank.getWorldPosition(p); burst(p.add(V(0, 1.7, 0)), '#9fe8ff', 12, 1.5); } catch (_) {} toast('PLOP', `${ITEMS[k].name} shrinks to fit and swims off.`, 2); render(); };
  const take = k => { const T = angTank(), i = T.indexOf(k); if (i < 0) return; if (typeof invRoomFor === 'function' && invRoomFor(k) < 1) { invFullNote(k); return; } T.splice(i, 1); S.inv[k] = (S.inv[k] || 0) + 1; markDirty(); angTankFill(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
