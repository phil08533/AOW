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
  // rug, armchair and a side table with a lamp
  part(props, B(4.2, 0.03, 3.0), toonNS('#2f5a6a', 'carpet'), cx, 0.02, cz); part(props, B(3.8, 0.035, 2.6), toonNS('#c9a43a', 'carpet'), cx, 0.021, cz); part(props, B(3.6, 0.04, 2.4), toonNS('#2f5a6a', 'carpet'), cx, 0.022, cz);
  { const ch = new THREE.Group(), lea = toon('#7a3a22', 'cloth'); part(ch, B(1.0, 0.45, 0.9), lea, 0, 0.3, 0); part(ch, B(1.0, 0.8, 0.22), lea, 0, 0.75, -0.38); for (const x of [-0.45, 0.45]) part(ch, B(0.18, 0.6, 0.9), lea, x, 0.45, 0);
    ch.position.set(cx - sd * 1.6, 0, cz + 1.4); ch.rotation.y = sd > 0 ? Math.PI * 0.75 : -Math.PI * 0.75; props.add(ch); solid(cx - sd * 1.6, cz + 1.4, 0.6);
    part(props, Cy(0.3, 0.3, 0.6, 12), toon('#5a3e2a', 'wood'), cx - sd * 0.5, 0.3, cz + 2.2); part(props, Cy(0.03, 0.03, 0.4, 5), '#2a2c32', cx - sd * 0.5, 0.8, cz + 2.2); part(props, Cy(0.12, 0.2, 0.22, 10), glow('#ffd8a0'), cx - sd * 0.5, 1.08, cz + 2.2); solid(cx - sd * 0.5, cz + 2.2, 0.35); }
  // a big aquarium on the inner side, with a few fish swimming laps
  { const ax = (sd > 0 ? s.x0 : s.x1) + sd * 0.7, az = cz - 3.2, tk = new THREE.Group(); tk.position.set(ax, 0, az); levelGroup.add(tk);
    part(tk, B(1.0, 0.7, 2.6), toon('#2a2c32'), 0, 0.35, 0); part(tk, B(0.9, 1.0, 2.5), new THREE.MeshBasicMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.3, depthWrite: false }), 0, 1.2, 0); part(tk, B(1.0, 0.08, 2.6), toon('#2a2c32'), 0, 1.74, 0); part(tk, B(0.86, 0.12, 2.46), toon('#d8c8a0', 'grime'), 0, 0.76, 0);
    const fs = []; ['#ff9a3c', '#ffd36a', '#4fd2ff', '#ff6aa8'].forEach((c, i) => { const f = new THREE.Group(); part(f, B(0.16, 0.08, 0.04), glow(c), 0, 0, 0); part(f, B(0.05, 0.08, 0.02), glow(c), -0.1, 0, 0); f.rotation.y = Math.PI / 2; tk.add(f); fs.push(f); });
    levelAnims.push(t => fs.forEach((f, i) => { const a = t * (0.4 + i * 0.1) + i * 1.6; f.position.set(Math.sin(a * 1.3) * 0.25, 1.0 + i * 0.15 + Math.sin(a * 2) * 0.05, Math.sin(a) * 1.0); f.rotation.y = Math.cos(a) >= 0 ? Math.PI / 2 : -Math.PI / 2; }));
    box(ax, az, 0.55, 1.35); }
  // rod rack: every rod tier on display
  { const rk = new THREE.Group(); part(rk, B(0.2, 0.1, 1.6), toon('#5a3e2a', 'wood'), 0, 0.1, 0); part(rk, B(0.12, 0.1, 1.6), toon('#5a3e2a', 'wood'), 0, 1.6, 0);
    for (let i = 0; i < 4; i++) { try { const r = makeRodModel(Math.min(i + 1, 4)); r.scale.setScalar(1.5); r.rotation.x = -Math.PI / 2 + 0.06; r.position.set(0, 0.15, -0.6 + i * 0.4); rk.add(r); } catch (_) {} }
    rk.position.set(cx + sd * 2.0, 0, s.z0 + 0.35); rk.rotation.y = Math.PI / 2; props.add(rk); box(cx + sd * 2.0, s.z0 + 0.35, 0.9, 0.2); }
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
