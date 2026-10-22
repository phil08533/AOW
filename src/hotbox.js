// =================== THE HOTBOX (2.22.25): the Undercroft back room is now an outlaws-only smoke den ===================
// Knuckles only lets Outlaws (rep 40+) through the curtain. Inside, rainbow haze hangs in the air and gives a contact high,
// people lounge and smoke on cushions, and two high rollers buy S-grade boutique drugs (only S) at a big markup.
// The Fence moved out to the main floor so nothing anyone needs is behind the curtain. Runs after the Undercroft shrink, so coords are scaled by UC_K.
SUBS.hotbox = { name: 'Hotbox haze', price: 0, v: 0, col: '#c86aff', sec: 45, trip: 0, legal: false, hidden: 1, desc: 'Contact high from the back room. Colors bend for a while.', fx: { cycle: 1.2, wobble: 0.22, sat: 0.5, bloom: 0.4 } };
const HB_K = typeof UC_K === 'number' ? UC_K : 1;
const hbIn = p => p.x < -16.2 * HB_K && p.z > 12.2 * HB_K && p.z < 28 * HB_K;
const hbSgrade = () => Object.keys(S.inv).filter(k => SUBS[k] && SUBS[k].boutique && / \(S\)$/.test(SUBS[k].name) && S.inv[k] > 0);
function hbBuyer(who, mult) {
  openDlg('High roller · S-grade only', who); const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const price = k => Math.round((typeof bqPrice === 'function' ? bqPrice(k) : SUBS[k].price) * mult);
  const render = () => { const have = hbSgrade();
    $('dlgLine').textContent = have.length ? `"S-grade? Now we're talking. I pay ${mult}× what the street pays."` : `"I don't touch anything under S-grade. Cook something perfect and come back."`;
    itemRows(rows, have.map(k => [k, S.inv[k], `${price(k).toLocaleString()} cr each`, [['Sell 1', () => sell(k, 1)], ['Sell all', () => sell(k, S.inv[k])]]])); };
  const sell = (k, n) => { n = Math.min(n, S.inv[k] || 0); if (!n) return; const p = price(k) * n; S.inv[k] -= n; if (!S.inv[k]) delete S.inv[k]; S.cr += p; SFX.coin && SFX.coin();
    log(`${who} bought ${n} ${SUBS[k].name} for ${p.toLocaleString()} cr.`, 'loot'); if (typeof crime === 'function') crime(Math.min(6, n), null); markDirty(); render(); };
  $('dlgActs').before(rows); acts([['Done', closeDlg, true]]); render();
}
{ const _zn = zNpcs; zNpcs = function (n, th) { const L = _zn(n, th); if (th !== 'under') return L; const K = HB_K;
  const fence = L.find(d => d.id === 'fence2'); if (fence) Object.assign(fence, { x: -24.6 * K, z: 6 * K, face: Math.PI / 2, role: 'The Fence · corner table' });
  const kn = L.find(d => d.id === 'knuckles'); if (kn) Object.assign(kn, { role: 'Bouncer · the Hotbox',
    custom: [['Ask to go in', () => { $('dlgLine').textContent = isOutlaw() ? '"You\'ve got a name now. Go on in. Breathe deep, everybody else is."' : `"Outlaws only. You're ${outTierName()}. Come back when the Marshals know your face." (Outlaw rep 40, you have ${outS().rep})`; }]],
    idle: ["Outlaws only past this curtain. No exceptions. I've sat on exceptions.", "The haze in there will get you high just standing around. That's the point.", "Big money in the back. They only buy the good stuff."] });
  L.push({ id: 'hbduke', name: 'Duke Ferro', role: 'High roller · buys S-grade only', rig: 'civ', make: () => makeCivilian('#ffd36a', '#1e1c22', '#c58a64', '#1e1a18', '#c86aff'), x: -18.6 * K, z: 26.6 * K, face: Math.PI,
    custom: [['Sell S-grade', () => hbBuyer('Duke Ferro', 2.5)]], idle: ["I only buy perfection. Perfection costs.", "Anything less than S-grade, give it to the street.", "Cough. Cough. Worth it."] });
  L.push({ id: 'hbopal', name: 'Madame Opal', role: 'High roller · buys S-grade only', rig: 'civ', make: () => makeCivilian('#c86aff', '#2a1e3a', '#e0b892', '#ff6aa8', '#ffd36a'), x: -27.6 * K, z: 19 * K, face: Math.PI / 2,
    custom: [['Sell S-grade', () => hbBuyer('Madame Opal', 3)]], idle: ["My parties have standards, darling. S-grade or nothing.", "Three times the street price. I don't haggle, I just pay.", "Mm. The colors in here are doing something to the walls."] });
  return L; }; }
function hbHazeTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }
{ const _b = LEVELS.zfloor.build; LEVELS.zfloor.build = function () { _b.apply(this, arguments); if (zTheme(ZF.floor) !== 'under') return; try { hbBuild(); } catch (e) { console.warn('hotbox', e); } }; }
function hbBuild() {
  const K = HB_K, x0 = -29.6 * K, x1 = -16.6 * K, z0 = 12.6 * K, z1 = 27.6 * K;
  // the haze: slow drifting rainbow puffs filling the room
  const N = 220, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = [], c = new THREE.Color();
  for (let i = 0; i < N; i++) { pos[i * 3] = x0 + Math.random() * (x1 - x0); pos[i * 3 + 1] = 0.4 + Math.random() * 3.4; pos[i * 3 + 2] = z0 + Math.random() * (z1 - z0);
    c.setHSL(Math.random(), 0.9, 0.62); col.set([c.r, c.g, c.b], i * 3); vel.push([(Math.random() - 0.5) * 0.25, (Math.random() - 0.3) * 0.08, (Math.random() - 0.5) * 0.25, Math.random() * 6]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const haze = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, map: hbHazeTex(), vertexColors: true, transparent: true, opacity: 0.16, depthWrite: false, sizeAttenuation: true }));
  haze.frustumCulled = false; levelGroup.add(haze);
  const lc = [0xff6aa8, 0x7fff6a, 0x4fd2ff, 0xc86aff].map((h, i) => { const L = new THREE.PointLight(h, 0.9, 9, 1.6); L.position.set(x0 + (x1 - x0) * (0.2 + (i % 2) * 0.6), 2.6, z0 + (z1 - z0) * (i < 2 ? 0.3 : 0.75)); levelGroup.add(L); return L; });
  // cushions and low tables, and people smoking on them
  const cush = ['#5a1e4a', '#1e3a5a', '#3a5a1e', '#5a3a1e'];
  const seats = [[-28.6, 14.2, Math.PI / 2], [-28.6, 16.4, Math.PI / 2], [-28.6, 22.2, Math.PI / 2], [-21.4, 13.4, 0], [-19.2, 13.4, 0], [-23.6, 18.6, Math.PI], [-21.4, 18.6, Math.PI], [-25.4, 23, -Math.PI / 2]];
  const looks = [['#ff6aa8', '#1e1c22', '#e0b892', '#5a3a22', '#7fff6a'], ['#4fd2ff', '#2a1e3a', '#8a5a3a', '#1e1a18', '#ffd36a'], ['#7fff6a', '#3a3d44', '#c58a64', '#c8402f', '#ff6aa8'], ['#c86aff', '#1e1c22', '#9fe8ff', '#e8e4dc', '#4fd2ff']];
  seats.forEach(([x, z, ry], i) => { x *= K; z *= K; part(props, B(1.0, 0.45, 1.0), toon(cush[i % 4], 'cloth'), x, 0.22, z); box(x, z, 0.5, 0.5);
    const o = buildChar(() => makeCivilian(...looks[i % 4]), 'civ'), R = o.userData.rig; o.position.set(x, 0.45 - (R ? R.spec.hip : 0.95) + 0.07, z); sitChar(o, 0.45); o.rotation.y = ry; levelGroup.add(o);
    if (R) R.torso.rotation.x = -0.18; const st = {}, ph = i * 1.7; part(o, Cy(0.03, 0.03, 0.3, 5), glow('#ffd36a'), 0.28, 1.05, 0.22, 0, 0, 0.5);
    levelAnims.push(t => { if (!o.parent) return; o.rotation.y = ry + Math.sin(t * 0.3 + ph) * 0.25; animRig(o, st, 1 / 60, t);
      if (Math.random() < 0.02) { c.setHSL((t * 0.1 + i * 0.13) % 1, 0.9, 0.65); burst(o.position.clone().add(V(0, 1.6, 0)), '#' + c.getHexString(), 3, 0.5); } }); });
  for (const [x, z] of [[-22.5, 16], [-26.5, 19.2]]) { part(props, B(1.4, 0.35, 0.9), toon('#2a1e16', 'wood'), x * K, 0.18, z * K); part(props, Cy(0.12, 0.16, 0.5, 8), glow('#c86aff'), x * K, 0.6, z * K); part(props, Cy(0.03, 0.03, 0.5, 5), glow('#7fff6a'), x * K + 0.2, 0.9, z * K, 0, 0, 0.6); box(x * K, z * K, 0.7, 0.45); }
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.7), new THREE.MeshBasicMaterial({ map: signTex('THE HOTBOX', '#140806', '#ff6aa8') })); sg.position.set(-15.7 * K, 4.6, 21.2 * K); sg.rotation.y = Math.PI / 2; levelGroup.add(sg);
  let warnT = 0;
  levelAnims.push(t => {
    const P = pos; for (let i = 0; i < N; i++) { const v = vel[i]; let px = P[i * 3] + v[0] * 0.016 + Math.sin(t * 0.4 + v[3]) * 0.004, py = P[i * 3 + 1] + v[1] * 0.016, pz = P[i * 3 + 2] + v[2] * 0.016;
      if (px < x0 || px > x1) v[0] *= -1; if (pz < z0 || pz > z1) v[2] *= -1; if (py > 3.9) py = 0.4; if (py < 0.3) v[1] = Math.abs(v[1]);
      P[i * 3] = Math.min(x1, Math.max(x0, px)); P[i * 3 + 1] = py; P[i * 3 + 2] = Math.min(z1, Math.max(z0, pz)); }
    g.attributes.position.needsUpdate = true; haze.material.opacity = 0.15 + Math.sin(t * 0.8) * 0.03;
    lc.forEach((L, i) => { L.intensity = 0.7 + Math.sin(t * 1.3 + i * 1.6) * 0.3; });
    if (!hbIn(player.pos)) return;
    if (!isOutlaw()) { player.pos.x = -15.2 * K; if (t - warnT > 3) { warnT = t; toast('KNUCKLES', `"Outlaws only." You need Outlaw rep 40 (you have ${outS().rep}).`, 2.5); try { SFX.hit(); } catch (_) {} } return; }
    if (typeof subsOn === 'function' && subsOn()) { const B2 = buffs(), was = (B2.sub_hotbox || 0) > Date.now(); B2.sub_hotbox = Math.max(B2.sub_hotbox || 0, Date.now() + 45000);
      if (!was) { toast('CONTACT HIGH', 'The haze gets in your head. Colors start to bend.', 2.5); try { subChip(); } catch (_) {} } } });
}
