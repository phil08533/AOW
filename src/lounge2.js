// =================== THE STARLIGHT LOUNGE, FILLED OUT ===================
// The President gets his own VIP spot in the middle of the floor (the dancers ring around him now),
// plus a second bar, a VIP couch corner, plants, waiter bots, and people mingling with drinks.
{ const _bn = barNpcs; barNpcs = function () { const L = _bn();
  const ves = L.find(d => d.name === 'Vesper'); if (ves) ves.z = 12.8;
  L.push({ id: 'cometbar', name: 'Lyra', role: 'The Comet Bar · cocktails', rig: 'civ', make: () => makeCivilian('#e8e4dc', '#1e1c22', '#9fe8ff', '#c86aff', '#ff6aa8'), x: 12, z: 25.2, face: Math.PI, heal: true,
    custom: [['Comet cocktail (40 cr)', () => { if (S.cr < 40) { toast('NOT ENOUGH', 'Lyra raises one perfect eyebrow.', 2); return; } S.cr -= 40; player.hp = Math.min(player.maxHp || player.hp, player.hp + 60); markDirty(); closeDlg(); toast('COMET COCKTAIL', 'It sparkles on the way down. +60 HP', 2.5); SFX.coin && SFX.coin(); }]],
    idle: ["Moe-bot does volume. I do art. The art costs more.", "The President tips in commemorative coins with his own face on them.", "Try the Supernova. It's on fire. On purpose."] });
  L.push({ id: 'vipguard', name: 'Agent Brooks', role: 'Secret Service · very tired', rig: 'civ', make: () => makeCivilian('#1e1c22', '#1e1c22', '#8a5a3a', '#1e1a18', '#1e1c22'), x: 6.6, z: 0.4, face: -Math.PI * 0.75,
    idle: ["I have protected this man through two wars and a pie-eating contest. This is the worst one.", "Please don't give him anything. Anything at all.", "He signed an executive order making this song the national anthem. Twice."] });
  return L; }; }
{ const _bb = buildBar; buildBar = function (T, W, D, H, rnd) { _bb(T, W, D, H, rnd);
  const wood = toon('#3a2a1e', 'wood'), gold = toon('#c9a43a'), velvet = toon('#7a1e3a', 'cloth'), metal = '#2b2a2c';
  // the President's VIP spot: a gold ring on the floor and four little rope posts
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.4, 32), new THREE.MeshBasicMaterial({ color: '#ffd36a' })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.07, 6.5); levelGroup.add(ring);
  levelAnims.push(t => ring.material.color.setHSL(0.12, 0.9, 0.5 + Math.sin(t * 3) * 0.12));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; part(props, Cy(0.05, 0.08, 0.9, 6), gold, Math.cos(a) * 1.6, 0.45, 6.5 + Math.sin(a) * 1.6); part(props, new THREE.SphereGeometry(0.08, 8, 6), gold, Math.cos(a) * 1.6, 0.92, 6.5 + Math.sin(a) * 1.6); }
  // ---- the Comet Bar: back right ----
  part(props, B(8, 1.1, 1.2), toon('#2a1e3a', 'panel'), 12, 0.55, 23.6); part(props, B(8.3, 0.1, 1.5), gold, 12, 1.15, 23.6); part(props, B(8, 0.08, 0.1), glow('#4fd2ff'), 12, 0.15, 22.98); box(12, 23.6, 4, 0.7);
  part(props, B(8, 3.2, 0.3), wood, 12, 1.6, D - 0.5); for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) part(props, Cy(0.07, 0.07, 0.42, 6), glow(['#4fd2ff', '#c86aff', '#ff6aa8'][(i + r) % 3]), 8.6 + i * 0.62, 2.0 + r * 0.9, D - 0.75);
  const cs = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.8), new THREE.MeshBasicMaterial({ map: signTex('COMET BAR', '#0e0a1e', '#4fd2ff') })); cs.position.set(12, 4.0, D - 0.6); cs.rotation.y = Math.PI; levelGroup.add(cs);
  for (let i = 0; i < 4; i++) { const x = 9.4 + i * 1.75; part(props, Cy(0.26, 0.26, 0.08, 10), velvet, x, 0.8, 22.2); part(props, Cy(0.04, 0.04, 0.78, 5), metal, x, 0.4, 22.2); }
  // ---- the VIP couches: back left ----
  for (const [x, z, ry] of [[-22, 25.4, Math.PI], [-25.6, 21.6, Math.PI / 2], [-18.4, 21.6, -Math.PI / 2]]) { const g = new THREE.Group(); part(g, B(3.6, 0.5, 1.1), velvet, 0, 0.35, 0); part(g, B(3.6, 0.9, 0.3), velvet, 0, 0.8, 0.45); for (const s of [-1, 1]) part(g, B(0.3, 0.7, 1.1), velvet, s * 1.8, 0.5, 0); g.position.set(x, 0, z); g.rotation.y = ry + Math.PI; props.add(g); const side = Math.abs(Math.sin(ry)) > 0.5; box(x, z, side ? 0.6 : 1.9, side ? 1.9 : 0.6); }
  part(props, B(2, 0.4, 1.2), toon('#1e1c22', 'panel'), -22, 0.2, 21.6); part(props, B(2.04, 0.04, 1.24), gold, -22, 0.41, 21.6); box(-22, 21.6, 1, 0.6); part(props, Cy(0.12, 0.08, 0.3, 8), glow('#ffd36a'), -22.4, 0.58, 21.6); part(props, Cy(0.04, 0.04, 0.4, 6), glow('#7fff6a'), -21.5, 0.6, 21.4);
  for (let i = 0; i < 5; i++) { const x = -26.5 + i * 2.25; part(props, Cy(0.05, 0.08, 1.0, 6), gold, x, 0.5, 18.4); if (i < 4) { const rope = part(props, Cy(0.03, 0.03, 2.25, 6), velvet, x + 1.12, 0.82, 18.4, 0, 0, Math.PI / 2); } }
  const vs = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), new THREE.MeshBasicMaterial({ map: signTex('VIP', '#1e0e1a', '#ffd36a') })); vs.position.set(-22, 4.2, D - 0.6); vs.rotation.y = Math.PI; levelGroup.add(vs);
  const L = new THREE.PointLight(0xffd36a, 0.8, 14, 1.6); L.position.set(-22, 4.5, 22); levelGroup.add(L); const L2 = new THREE.PointLight(0x4fd2ff, 0.8, 14, 1.6); L2.position.set(12, 4.5, 22); levelGroup.add(L2);
  // people: lounging VIPs, bar regulars and mingling groups
  const P = [['#ffd36a', '#1e1c22', '#e0b892', '#5a3a22', '#ff6aa8'], ['#c86aff', '#2a1e3a', '#8a5a3a', '#1e1a18', '#ffd36a'], ['#e8e4dc', '#3a3d44', '#c58a64', '#c8402f', '#4fd2ff'], ['#3bd2ff', '#1e1c22', '#9fe8ff', '#e8e4dc', '#ff6aa8'], ['#ff3b8a', '#1e1c22', '#e0b892', '#1e1a18', '#ffd36a'], ['#2a5a3a', '#1e1c22', '#8a5a3a', '#ffd36a', '#c9a43a']];
  const guy = (k, x, z, ry, fn, y) => { const o = buildChar(() => makeCivilian(...P[k % P.length]), 'civ'); o.position.set(x, y || 0, z); o.rotation.y = ry; blob(o, 0.4); levelGroup.add(o); if (!y) solid(x, z, 0.4); const st = {}, ph = k * 1.3; levelAnims.push(t => { if (!o.parent) return; fn && fn(o, t, ph); animRig(o, st, 1 / 60, t); }); return o; };
  const chat = ry => (o, t, ph) => { o.rotation.y = ry + Math.sin(t * 0.6 + ph) * 0.4; };
  const glass = (o, c) => part(o, Cy(0.05, 0.035, 0.16, 6), glow(c), 0.3, 1.0, 0.18);
  // seated on the VIP couches (low and leaning back)
  for (const [k, x, z, ry] of [[0, -23, 25.3, Math.PI], [1, -21, 25.3, Math.PI], [2, -25.5, 21.0, Math.PI / 2], [4, -25.5, 22.4, Math.PI / 2], [3, -18.5, 22.2, -Math.PI / 2], [5, -18.5, 20.8, -Math.PI / 2]]) { const o = guy(k, x, z, ry, (o, t, ph) => { o.rotation.y = ry + Math.sin(t * 0.4 + ph) * 0.2; }, 1); const R = o.userData.rig; o.position.y = 0.6 - (R ? R.spec.hip : 0.95) + 0.07; sitChar(o, 0.6); if (R) R.torso.rotation.x = -0.12; glass(o, '#7fff6a'); }
  // at the Comet Bar
  for (const [k, x] of [[4, 9.4], [5, 12.9], [2, 14.6]]) glass(guy(k, x, 21.4, 0, chat(0)), '#4fd2ff');
  // mingling groups with drinks
  for (const [cx, cz] of [[-7, -11], [7, -11], [-20, 9], [20, 10]]) for (let k = 0; k < 3; k++) { const a = k * 2.09 + cx, x = cx + Math.cos(a) * 1.0, z = cz + Math.sin(a) * 1.0, ry = Math.atan2(cx - x, cz - z); glass(guy(k + Math.abs(cx), x, z, ry, chat(ry)), ['#ff6aa8', '#ffd36a', '#4fd2ff'][k]); }
  // potted palms around the edges
  const palm = (x, z) => { part(props, Cy(0.45, 0.35, 0.8, 10), toon('#c9a43a'), x, 0.4, z); part(props, Cy(0.08, 0.1, 1.8, 6), toon('#5a3a22', 'wood'), x, 1.6, z); for (let i = 0; i < 6; i++) { const a = i * 1.047; part(props, B(1.3, 0.05, 0.32), toon(i % 2 ? '#3f7a3a' : '#4f8a3a', 'leaves'), x + Math.cos(a) * 0.55, 2.4, z + Math.sin(a) * 0.55, 0, -a, -0.45); } solid(x, z, 0.5); };
  for (const [x, z] of [[-9, -20], [9, -20], [-W + 1.2, -14], [W - 1.2, -14], [-W + 1.2, 17], [W - 1.2, 17], [-16, 26.6], [16, 26.6], [-5.6, 26.4], [5.6, 26.4]]) palm(x, z);
  // little hanging lamps over the round tables
  for (const [x, z] of [[-8, -4], [8, -4], [-14, 14], [14, 14], [-10, 16], [10, 16]]) { part(props, Cy(0.015, 0.015, 2.4, 4), metal, x, H - 1.2, z); part(props, new THREE.ConeGeometry(0.4, 0.35, 10, 1, true), toon('#c9a43a'), x, H - 2.5, z); part(props, new THREE.SphereGeometry(0.1, 8, 6), glow('#ffd38a'), x, H - 2.6, z); }
  // two waiter bots doing laps with trays
  for (let i = 0; i < 2; i++) { const o = buildChar(() => { const m = recolor(makeXR17(), { '#9aa1aa': '#e8e4dc', '#5d636c': '#1e1c22' }); m.children.filter(c => c.isGroup).forEach(c => m.remove(c)); return m; }, 'xr17'); // no gun head: the spring carries the tray
    part(o, Cy(0.32, 0.3, 0.03, 16), toon('#c9a43a'), 0, 1.0, 0); part(o, new THREE.TorusGeometry(0.31, 0.012, 5, 20), toon('#e8c45a'), 0, 1.015, 0, Math.PI / 2); for (let k = 0; k < 3; k++) part(o, Cy(0.04, 0.03, 0.14, 6), glow(['#ff6aa8', '#4fd2ff', '#ffd36a'][k]), -0.12 + k * 0.12, 1.085, 0.05 * (k - 1));
    blob(o, 0.4); levelGroup.add(o); MOVERS.push([o, 0.4]); const st = {};
    levelAnims.push(t => { if (!o.parent) return; const a = t * 0.16 + i * Math.PI, x = Math.cos(a) * 10, z = -4 + Math.sin(a) * 6; o.position.set(x, 0, z); o.rotation.y = Math.atan2(-Math.sin(a) * 10, Math.cos(a) * 6); animRig(o, st, 1 / 60, t); }); }
}; }
