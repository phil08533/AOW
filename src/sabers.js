// ---------------- laser swords, gun/melee hands, offhand shield ----------------
Object.assign(MELEE, {
  lsaber: { name: 'Laser Sword', dmg: 280, rate: 0.45, reach: 3.0, req: 12, price: 4500, saber: true },
  lsaber2: { name: 'Kyber Laser Sword', dmg: 460, rate: 0.42, reach: 3.2, req: 24, price: 14000, saber: true }
});

const SABER_COLS = { blue: '#4fa8ff', green: '#6fdc5a', red: '#ff3b2a', purple: '#c86aff', yellow: '#ffe14a', orange: '#ff9a3c', cyan: '#4fffe0', white: '#f4f8ff', pink: '#ff6aa8' };
const SABER_HILTS = { classic: 'Classic', cross: 'Crossguard', double: 'Double-blade', curved: 'Curved', shoto: 'Shoto (short)', ornate: 'Ornate gold' };
const SABER_MODS = {
  focus: { name: 'Kyber Focus', desc: '+15% damage per tier', cost: [{ cr: 1500, crystal: 2 }, { cr: 4000, starcrystal: 2 }, { cr: 9000, starcrystal: 5, jellygel: 2 }] },
  grip: { name: 'Balanced Grip', desc: '8% faster swings per tier', cost: [{ cr: 1200, scrap: 6 }, { cr: 3500, circuit: 6 }, { cr: 8000, cell: 3 }] },
  emitter: { name: 'Long Emitter', desc: '+0.35 m reach per tier', cost: [{ cr: 1000, circuit: 3 }, { cr: 3000, icecore: 2 }, { cr: 7000, pearl: 2 }] }
};
const saberMod = (k) => (S.saberMods && S.saberMods[k]) || 0;
const saberCfg = () => Object.assign({ col: 'blue', hilt: 'classic' }, S.saber || {});
function makeSaberModel(cfg) {
  const g = new THREE.Group(), col = SABER_COLS[cfg.col] || SABER_COLS.blue, metal = cfg.hilt === 'ornate' ? '#c9a43a' : '#b8bcc4', grip = '#1e1c22';
  const len = cfg.hilt === 'shoto' ? 0.45 : 0.78, hiltL = cfg.hilt === 'double' ? 0.34 : 0.2;
  part(g, Cy(0.024, 0.026, hiltL, 8), metal, 0, 0, 0);
  for (let k = 0; k < 3; k++) part(g, Cy(0.028, 0.028, 0.02, 8), grip, 0, -hiltL / 2 + 0.04 + k * 0.05, 0);
  part(g, Cy(0.03, 0.026, 0.04, 8), metal, 0, hiltL / 2, 0); part(g, B(0.012, 0.03, 0.01), glow('#ff3b2a'), 0.026, 0.02, 0);
  if (cfg.hilt === 'ornate') { part(g, new THREE.TorusGeometry(0.032, 0.007, 5, 10), '#ffd36a', 0, hiltL / 2 - 0.02, 0, Math.PI / 2); part(g, B(0.05, 0.05, 0.01), toon('#8a3a2e'), 0, 0, 0.02); }
  const blade = (dir, l) => { const core = part(g, Cy(0.011, 0.011, l, 6), glow('#ffffff'), 0, dir * (hiltL / 2 + l / 2), 0); const aura = part(g, Cy(0.024, 0.024, l + 0.02, 8), glow(col), 0, dir * (hiltL / 2 + l / 2), 0); aura.material = aura.material.clone(); aura.material.transparent = true; aura.material.opacity = 0.55; aura.material.depthWrite = false; return [core, aura]; };
  const bl = blade(1, len); if (cfg.hilt === 'double') blade(-1, len * 0.9);
  if (cfg.hilt === 'cross') for (const s of [-1, 1]) { const c = part(g, Cy(0.008, 0.008, 0.12, 6), glow('#ffffff'), 0.07 * s, hiltL / 2 + 0.03, 0, 0, 0, Math.PI / 2); const a = part(g, Cy(0.018, 0.018, 0.13, 6), glow(col), 0.07 * s, hiltL / 2 + 0.03, 0, 0, 0, Math.PI / 2); a.material = a.material.clone(); a.material.transparent = true; a.material.opacity = 0.55; }
  if (cfg.hilt === 'curved') {
    // bent hilt: the emitter end and the blade lean over, like a curved-hilt duelist's saber
    const pivot = new THREE.Group(); pivot.position.y = hiltL / 2; g.add(pivot);
    for (const m of g.children.slice()) if (m !== pivot && m.position.y > hiltL / 2 - 0.001) { pivot.attach(m); }
    pivot.rotation.z = -0.42;
    part(g, Cy(0.026, 0.026, 0.09, 8), metal, 0.012, hiltL / 2 - 0.01, 0, 0, 0, -0.21); part(g, new THREE.TorusGeometry(0.03, 0.008, 5, 10, Math.PI), metal, 0.02, hiltL / 2 - 0.04, 0, 0, 0, 0.6);
  }
  g.userData.saberLight = col; g.userData.aura = bl[1];
  return g;
}
const _makeMeleeModel = makeMeleeModel;
makeMeleeModel = function (id) { return MELEE[id] && MELEE[id].saber ? makeSaberModel(saberCfg()) : _makeMeleeModel(id); };
// offhand energy shield
const vmShield = new THREE.Group(); camera.add(vmShield); vmShield.visible = false;
{ const sm = new THREE.Mesh(new THREE.CircleGeometry(0.22, 6), new THREE.MeshBasicMaterial({ color: '#6fc8ff', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); vmShield.add(sm);
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.225, 6), new THREE.MeshBasicMaterial({ color: '#cfeaff', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })); vmShield.add(rim);
  const emb = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.055, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })); vmShield.add(emb);
  vmShield.userData.face = sm; vmShield.userData.rim = rim; }
const SHIELD = { hp: 100, max: 100, blocking: false, flash: 0 };
const handMelee = () => S.hand === 'melee' && !LEVEL.fly;
function swapHand() {
  if (state !== 'play' || dlgOpen || LEVEL.fly || S.riding) return;
  S.hand = S.hand === 'melee' ? 'gun' : 'melee'; firing = false; SHIELD.blocking = false; meleeShown = null; refreshMeleeModel(); if (MELEE[S.melee || 'knife'].saber) SFX.ignite(S.hand === 'melee'); else SFX.ui();
  log(S.hand === 'melee' ? `${MELEE[S.melee || 'knife'].name} out. Click to swing, hold right click to block with your shield. Q swaps back.` : `${gun().name} out. Q swaps to melee.`); markDirty();
}
function setBlock(on) { SHIELD.blocking = !!on && handMelee() && SHIELD.hp > 5; }
// returns the damage left after the shield takes its share
function shieldBlock(dmg, src) {
  if (src === false || !SHIELD.blocking || !handMelee() || SHIELD.hp <= 0) return dmg;
  if (src) { const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), dx = src.x - player.pos.x, dz = src.z - player.pos.z, d = Math.hypot(dx, dz) || 1; if ((dx * fx + dz * fz) / d < 0.3) return dmg; }
  SHIELD.hp = Math.max(0, SHIELD.hp - dmg * 0.6); SHIELD.flash = 0.25; SFX.block(); burst(camera.localToWorld(V(-0.15, -0.05, -0.5)), '#6fc8ff', 6, 3);
  if (SHIELD.hp <= 0) { SHIELD.blocking = false; SFX.shieldBreak(); log('Shield broken! It recharges in a moment.'); }
  return dmg * 0.1;
}
function updateHands(dt, t) {
  refreshMeleeModel();
  const melee = handMelee(); SFX.hum(melee && !!MELEE[S.melee || 'knife'].saber);
  if (!SHIELD.blocking) SHIELD.hp = Math.min(SHIELD.max, SHIELD.hp + dt * (SHIELD.hp <= 0 ? 12 : 22));
  SHIELD.flash = Math.max(0, SHIELD.flash - dt);
  vmShield.visible = melee && player.alive;
  if (vmShield.visible) { const up = SHIELD.blocking ? 1 : 0; vmShield.position.set(-0.24 + up * 0.06, -0.22 + up * 0.1, -0.5); vmShield.rotation.set(0, 0.5 - up * 0.4, 0);
    vmShield.userData.face.material.opacity = (SHIELD.blocking ? 0.42 : 0.16) + SHIELD.flash; vmShield.userData.rim.material.opacity = SHIELD.blocking ? 0.95 : 0.4; vmShield.scale.setScalar(SHIELD.blocking ? 0.85 : 0.55); }
  if (melee) { vm.visible = false; if (meleeT <= 0) { vmMelee.visible = true; vmMelee.position.set(0.2, -0.27 + Math.sin(t * 2) * 0.006, -0.42); vmMelee.rotation.set(-0.75, 0.25, -0.4); }
    vmMelee.scale.setScalar(0.8);
    if (firing && !SHIELD.blocking) meleeAttack();
    const M = MELEE[S.melee || 'knife']; if (M.saber && vmMelee.children[0] && vmMelee.children[0].userData.aura) vmMelee.children[0].userData.aura.material.opacity = 0.45 + Math.sin(t * 40) * 0.08; }
}
function openSaberForge(who) {
  openDlg(who ? 'Kyber smith' : 'Saber forge', who || 'Your laser sword');
  const rows = document.createElement('div'); rows.className = 'rows'; rows.id = 'shopRows';
  const render = () => {
    rows.textContent = ''; const cfg = saberCfg();
    $('dlgLine').textContent = `Blade: ${cfg.col} · Hilt: ${SABER_HILTS[cfg.hilt]}. Changes are free and show on every laser sword you own.`;
    const mk = (label, items, key) => { const r = document.createElement('div'); r.style.display = 'flex'; r.style.flexWrap = 'wrap'; r.style.gap = '6px'; r.style.margin = '6px 0'; const h = document.createElement('div'); h.textContent = label; h.style.width = '100%'; h.style.color = 'var(--gold)'; r.appendChild(h);
      for (const [id, name] of items) { const b = document.createElement('button'); b.className = 'pbtn' + (cfg[key] === id ? ' go' : ''); b.style.padding = '5px 9px'; b.textContent = name; if (key === 'col') { b.style.borderColor = SABER_COLS[id]; b.style.color = SABER_COLS[id]; }
        b.addEventListener('click', () => { S.saber = Object.assign(saberCfg(), { [key]: id }); meleeShown = null; markDirty(); SFX.ignite(true); render(); setPreview(() => { const g = new THREE.Group(), m = makeSaberModel(saberCfg()); m.rotation.z = -1.0; g.add(m); return g; }, 'Your blade', 1.25); }); r.appendChild(b); }
      rows.appendChild(r); };
    mk('Blade color', Object.keys(SABER_COLS).map(k => [k, k[0].toUpperCase() + k.slice(1)]), 'col');
    mk('Hilt', Object.entries(SABER_HILTS), 'hilt');
    const mods = document.createElement('div'); mods.style.margin = '6px 0'; const h = document.createElement('div'); h.textContent = 'Mods (all laser swords)'; h.style.color = 'var(--gold)'; mods.appendChild(h);
    for (const [k, M] of Object.entries(SABER_MODS)) { const lv = saberMod(k), r = document.createElement('div'); r.className = 'rowi';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = ['#9aa1aa', '#6fdc5a', '#4fa8ff', '#c86aff'][lv];
      const nm = document.createElement('span'); nm.textContent = `${M.name} ${'★'.repeat(lv)} · ${M.desc}`;
      const mt = document.createElement('span'); mt.className = 'meta'; mt.style.fontSize = '13px'; mt.textContent = lv >= 3 ? 'Maxed' : costLabel(M.cost[lv]);
      const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = 'Install'; b.disabled = lv >= 3 || !costOk(M.cost[lv]);
      b.addEventListener('click', () => { costPay(M.cost[lv]); S.saberMods = S.saberMods || {}; S.saberMods[k] = lv + 1; SFX.ignite(true); log(`${M.name} installed (tier ${lv + 1})`, 'loot'); markDirty(); render(); });
      r.append(dot, nm, mt, b); mods.appendChild(r); }
    rows.appendChild(mods);
  };
  $('dlgActs').before(rows); acts([['Done', closeDlg]]); render();
  showPreviewIn(rows); setPreview(() => { const g = new THREE.Group(), m = makeSaberModel(saberCfg()); m.rotation.z = -1.0; g.add(m); return g; }, 'Your blade', 1.25);
}
LEVELS.zeltac.npcs.push({ id: 'juno', name: 'Juno', role: 'Kyber smith · laser swords', rig: 'civ', make: () => makeCivilian('#2a2a3a', '#1e1c22', '#c58a64', '#e8e4dc', '#4fa8ff'), x: 6, z: 12, face: Math.PI * 1.2, shop: 'guns', guns: [], melee: ['lsaber', 'lsaber2'], forge: true,
  idle: ["Every blade sings a different color. Pick yours.", "Hold your shield up when they swing. Laser swords are fast, not invincible."] });
