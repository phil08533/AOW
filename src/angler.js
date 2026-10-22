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
  { const ax = (sd > 0 ? s.x0 : s.x1) + sd * 0.7, az = cz - 3.2, tk = new THREE.Group(); tk.position.set(ax, 0, az); levelGroup.add(tk); const n0 = tk.children.length;
    part(tk, B(1.0, 0.7, 2.6), toon('#2a2c32'), 0, 0.35, 0); part(tk, B(0.9, 1.0, 2.5), new THREE.MeshBasicMaterial({ color: '#4fa8ff', transparent: true, opacity: 0.3, depthWrite: false }), 0, 1.2, 0); part(tk, B(1.0, 0.08, 2.6), toon('#2a2c32'), 0, 1.74, 0); part(tk, B(0.86, 0.12, 2.46), toon('#d8c8a0', 'grime'), 0, 0.76, 0);
    box(ax, az, 0.55, 1.35); ANG.tank = tk; ANG.shell = tk.children.slice(n0); ANG.deco = new THREE.Group(); tk.add(ANG.deco); ANG.live = new THREE.Group(); tk.add(ANG.live); angTankFill(); INTERACTS.push({ x: ax + sd * 1.1, z: az, r: 1.8, label: 'Aquarium: drop in a fish', fn: openAngTank }); }
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
const ANG_TIERS = [['Desk tank', 4, 0, 0.42], ['Long tank', 8, 2500, 0.62], ['Show tank', 12, 7500, 0.82], ['Grand aquarium', 16, 18000, 1]];
const angTier = () => ANG_TIERS[Math.min(3, S.tankLv || 0)], ANG_TANK_MAX = 16;
const ANG_DECO = { pebbles: ['Coloured pebbles', 300], plants: ['Swaying weeds', 600], rocks: ['Rock arch', 800], chest: ['Treasure chest (bubbles)', 1200], castle: ['Little castle', 1500], diver: ['Deep-sea diver', 1800], lights: ['Glow lights', 2500] };
const angDeco = () => { S.tankDeco = S.tankDeco || {}; return S.tankDeco; };
const angTank = () => { if (!Array.isArray(S.tank)) S.tank = []; return S.tank; };
function angTankFill() {
  const L = ANG.live; if (!L || !ANG.tank || !ANG.tank.parent) return; for (const c of [...L.children]) { L.remove(c); disposeTree(c); }
  const k0 = angTier()[3]; (ANG.shell || []).forEach(m => { m.scale.z = k0; }); ANG.rz = k0; angDecoBuild();
  angTank().slice(0, angTier()[1]).forEach((id, i) => { if (!ITEMS[id]) return; let f; try { f = makeFishModel(id); } catch (_) { return; }
    const b = new THREE.Box3().setFromObject(f), sz = b.getSize(new THREE.Vector3()), k = 0.26 / Math.max(sz.x, sz.z, 0.05), c = b.getCenter(new THREE.Vector3()).multiplyScalar(k);
    f.scale.setScalar(k); f.position.sub(c); const w = new THREE.Group(), turn = new THREE.Group(); turn.add(f); w.add(turn); L.add(w);
    const sp = (0.04 + (i * 0.618 % 1) * 0.04) * (i % 3 === 1 ? -1 : 1), ph = i * 2.39, y0 = 0.95 + (i % 4) * 0.15, sx = sz.x >= sz.z, fx = 1.2 + (i * 0.73 % 1) * 1.4, fy = 1.5 + (i * 0.41 % 1) * 2; w.userData = { sp, ph, y0, sx, turn, fx, fy }; });
}
// swim: lazy figure-eights inside the glass, turning to face where they go
setInterval(() => { try { const L = ANG.live; if (!L || !L.parent || !L.parent.parent) return; const t = performance.now() / 1000;
  for (const w of L.children) { const { sp, ph, y0, sx, turn, fx, fy } = w.userData, a = t * sp + ph, rz = (ANG.rz || 1) * 1.0, x = Math.sin(a * fx) * 0.28, z = Math.sin(a) * rz, y = y0 + Math.sin(a * fy) * 0.07;
    const dx = Math.cos(a * fx) * fx * 0.28 * Math.sign(sp), dz = Math.cos(a) * rz * Math.sign(sp); w.position.set(x, y, z); turn.rotation.y = Math.atan2(dz, dx) * -1 + (sx ? 0 : Math.PI / 2); turn.rotation.z = Math.sin(t * 3 + ph) * 0.06; } } catch (_) {} }, 33);
function openAngTank() {
  openDlg("Angler's Den", 'The aquarium'); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const fishSet = angFish();
  const render = () => { const T = angTank(), MAX = angTier()[1], have = Object.keys(S.inv).filter(k => S.inv[k] > 0 && fishSet.has(k));
    const nx = ANG_TIERS[(S.tankLv || 0) + 1]; $('dlgLine').textContent = `${angTier()[0]}: ${Math.min(T.length, MAX)}/${MAX} fish. ` + (T.length >= MAX ? 'Full. Upgrade for a bigger tank, or take one out.' : 'Drop a catch in and the shrink field makes it aquarium-sized.');
    const inTank = {}; T.forEach(id => { inTank[id] = (inTank[id] || 0) + 1; });
    itemRows(rows, [...have.map(k => [k, S.inv[k], 'in your bag', [['Drop in', () => drop(k), T.length >= MAX]]]),
      ...Object.keys(inTank).map(k => [k, inTank[k], 'swimming in the tank', [['Take out', () => take(k)]]])]);
    const ex = document.createElement('div'); ex.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px';
    const btn = (label, fn, dis) => { const b = document.createElement('button'); b.textContent = label; b.disabled = !!dis; b.addEventListener('click', fn); ex.appendChild(b); };
    if (nx) btn(`⬆ ${nx[0]} (${nx[1]} fish) · ${nx[2].toLocaleString()} cr`, () => { if (S.cr < nx[2]) { toast('NO CREDIT', 'Not enough credits for the bigger tank.', 2); return; } S.cr -= nx[2]; S.tankLv = (S.tankLv || 0) + 1; markDirty(); angTankFill(); SFX.level(); toast('TANK UPGRADED', `${nx[0]}: room for ${nx[1]} fish.`, 2.5); render(); }, S.cr < nx[2]);
    for (const [id, [nm, c]] of Object.entries(ANG_DECO)) { const D = angDeco(); btn(D[id] ? `✓ ${nm} (remove)` : `${nm} · ${c} cr`, () => { if (D[id]) delete D[id]; else { if (S.cr < c) return; S.cr -= c; D[id] = 1; } markDirty(); angTankFill(); render(); }, !D[id] && S.cr < c); }
    rows.appendChild(ex); }; 
  const drop = k => { const T = angTank(); if (T.length >= angTier()[1] || !(S.inv[k] > 0)) return; S.inv[k]--; if (!S.inv[k]) delete S.inv[k]; T.push(k); markDirty(); angTankFill(); try { SFX.splash ? SFX.splash() : SFX.quest(); } catch (_) {}
    if (ANG.tank) try { const p = new THREE.Vector3(); ANG.tank.getWorldPosition(p); burst(p.add(V(0, 1.7, 0)), '#9fe8ff', 12, 1.5); } catch (_) {} toast('PLOP', `${ITEMS[k].name} shrinks to fit and swims off.`, 2); render(); };
  const take = k => { const T = angTank(), i = T.indexOf(k); if (i < 0) return; if (typeof invRoomFor === 'function' && invRoomFor(k) < 1) { invFullNote(k); return; } T.splice(i, 1); S.inv[k] = (S.inv[k] || 0) + 1; markDirty(); angTankFill(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}

function angDecoBuild() {
  const G = ANG.deco; if (!G) return; for (const c of [...G.children]) { G.remove(c); disposeTree(c); } const D = angDeco(), rz = ANG.rz || 1, y = 0.83;
  if (D.pebbles) for (let i = 0; i < 40; i++) part(G, new THREE.SphereGeometry(0.03 + (i % 3) * 0.01, 5, 4), toon(['#ff6aa8', '#4fd2ff', '#ffd36a', '#7fff6a', '#e8e4dc'][i % 5]), Math.sin(i * 7.1) * 0.38, y, Math.sin(i * 3.7) * 1.15 * rz);
  if (D.plants) for (let i = 0; i < 6; i++) { const w = new THREE.Group(); w.position.set(-0.3 + (i % 3) * 0.3, y, (-0.9 + i * 0.36) * rz); for (let k = 0; k < 4; k++) part(w, B(0.04, 0.12, 0.02), toon(i % 2 ? '#3a8a3a' : '#5ab84a'), 0, 0.06 + k * 0.11, 0); G.add(w); w.userData.sway = i; }
  if (D.rocks) { part(G, new THREE.DodecahedronGeometry(0.14, 0), toon('#6a6460'), -0.2, y + 0.1, 0.55 * rz); part(G, new THREE.DodecahedronGeometry(0.14, 0), toon('#6a6460'), 0.2, y + 0.1, 0.55 * rz); part(G, B(0.55, 0.1, 0.16), toon('#7a7470'), 0, y + 0.28, 0.55 * rz); }
  if (D.chest) { part(G, B(0.22, 0.12, 0.15), toon('#6a4a2a', 'wood'), 0.15, y + 0.06, -0.5 * rz); const lid = part(G, B(0.22, 0.04, 0.15), toon('#c9a43a'), 0.15, y + 0.15, -0.55 * rz, -0.5); G.userData.chest = [0.15, y + 0.2, -0.5 * rz]; part(G, B(0.12, 0.05, 0.08), glow('#ffd36a'), 0.15, y + 0.13, -0.5 * rz); }
  if (D.castle) { const c = new THREE.Group(); c.position.set(-0.18, y, -0.1 * rz); part(c, B(0.3, 0.22, 0.24), toon('#c8b89a'), 0, 0.11, 0); for (const [x, z] of [[-0.14, -0.11], [0.14, -0.11], [-0.14, 0.11], [0.14, 0.11]]) { part(c, Cy(0.05, 0.05, 0.32, 6), toon('#c8b89a'), x, 0.16, z); part(c, new THREE.ConeGeometry(0.06, 0.1, 6), toon('#c8402f'), x, 0.37, z); } part(c, B(0.02, 0.1, 0.07), toon('#2a1e16'), 0.151, 0.06, 0); G.add(c); }
  if (D.diver) { const d = new THREE.Group(); d.position.set(0.22, y, 0.15 * rz); part(d, new THREE.SphereGeometry(0.07, 10, 8), toon('#c9a43a'), 0, 0.3, 0); part(d, new THREE.CircleGeometry(0.035, 10), glow('#9fe8ff'), 0, 0.3, 0.071); part(d, B(0.12, 0.14, 0.09), toon('#3a5a7a'), 0, 0.17, 0); for (const s of [-1, 1]) part(d, B(0.04, 0.1, 0.05), toon('#3a5a7a'), s * 0.03, 0.05, 0); G.add(d); G.userData.diver = [0.22, y + 0.4, 0.15 * rz]; }
  if (D.lights) for (let i = 0; i < 8; i++) part(G, new THREE.SphereGeometry(0.025, 6, 4), glow(['#ff6ad8', '#4fd2ff', '#ffd36a', '#7fff6a'][i % 4]), (i % 2 ? 0.4 : -0.4), 1.62, (-1.1 + i * 0.31) * rz);
}
setInterval(() => { try { const G = ANG.deco; if (!G || !G.parent || !G.parent.parent) return; const t = performance.now() / 1000;
  for (const w of G.children) if (w.userData.sway != null) w.rotation.z = Math.sin(t * 0.9 + w.userData.sway) * 0.2;
  for (const k of ['chest', 'diver']) { const at = G.userData[k]; if (at && Math.random() < 0.08) { const p = G.localToWorld(new THREE.Vector3(...at)); burst(p, '#dffaff', 1, 0.25); } } } catch (_) {} }, 120);
