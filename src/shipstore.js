// =================== SHIP STORAGE + ROOM LEVELS ===================
// Every room you build can be upgraded from level 1 to 5 at the Engineering terminal.
// The Cargo Bay doubles as ship storage: beam loot up from the backpack; level 5 is the Black Hole Box (no limit).
// New, optional save fields (old saves start empty): S.ship.lvl (room → level), S.stash (item → count).
const ROOM_MAX = 5;
function roomLvl(id) { return S.ship && (S.ship.rooms || []).includes(id) ? Math.min(ROOM_MAX, Math.max(1, (S.ship.lvl || {})[id] || 1)) : 0; }
const lvUp = id => Math.max(0, roomLvl(id) - 1); // levels bought on top of the base room
const restMin = () => 15 + 5 * lvUp('quarters');            // Well Rested: +X% XP for X minutes
const stimCut = () => 0.25 + 0.05 * lvUp('med');             // armor stim damage cut
const stimCd = () => 30 - 5 * lvUp('med');                   // minutes between stims
const gardenEvery = () => (10 - 1.5 * lvUp('garden')) * 60000; // one medkit per this long
const gardenMax = () => 3 + 2 * lvUp('garden');
const STASH_CAP = [0, 100, 200, 400, 800, Infinity];
const stashCap = () => STASH_CAP[roomLvl('cargo')];
const stashSlots = () => Object.keys(S.stash || {}).reduce((a, k) => a + invSlotsOf(k, S.stash[k]), 0);
function stashRoomFor(id) { const cap = stashCap(); if (cap === Infinity) return 1e9; const cur = (S.stash || {})[id] || 0, st = invStack(id); return Math.max(0, (cur ? st * Math.ceil(cur / st) - cur : 0) + Math.max(0, cap - stashSlots()) * st); }
const beamDownOk = () => roomLvl('cargo') > 0 && (LEVEL.id === 'ship' || roomLvl('cargo') >= 3);

// what the next level of each room gives
function roomUpText(id, L) {
  const u = L - 1;
  return ({
    quarters: `Well Rested gives +${15 + 5 * u}% XP for ${15 + 5 * u} min`,
    armory: `${3 + (L >= 3) + (L >= 5)} ordnance charges, gun upgrades ${5 * u}% cheaper`,
    cargo: L >= 5 ? 'Black Hole Box: unlimited ship storage' : `${STASH_CAP[L]} storage slots${L >= 3 ? ', beam items down from anywhere' : ''}`,
    med: `Stim cuts damage ${25 + 5 * u}%, ready every ${30 - 5 * u} min`,
    trophy: `+${4 * u}% credits from bosses`,
    garden: `A medkit every ${10 - 1.5 * u} min, holds ${3 + 2 * u}`,
    hangar: `Vehicles ${4 * u}% faster`
  })[id] || 'Better in every way';
}
const ROOM_UP_MATS = { 2: { scrap: 8 }, 3: { circuit: 6 }, 4: { crystal: 5 }, 5: { core: 6 } }, ROOM_UP_MULT = { 2: 2, 3: 4, 4: 8, 5: 15 };
function roomUpCost(id, L) { const R = ROOMS[id]; if (!R || R.fixed || L < 2 || L > ROOM_MAX) return null; const base = Math.max(300, (R.cost && R.cost.cr) || 0); return Object.assign({ cr: base * ROOM_UP_MULT[L] }, ROOM_UP_MATS[L]); }
function roomUpgrade(id) {
  const L = roomLvl(id) + 1, c = roomUpCost(id, L); if (!L || !c || L > ROOM_MAX || !costOk(c)) { SFX.hit(); return; }
  costPay(c); S.ship.lvl = S.ship.lvl || {}; S.ship.lvl[id] = L; roomApply(); markDirty(); SFX.level();
  toast(`${ROOMS[id].name.toUpperCase()} · LEVEL ${L}`, roomUpText(id, L), 3);
  closeDlg(); if (LEVEL.id === 'ship') loadLevel('ship', { at: { x: player.pos.x, z: player.pos.z, yaw: player.yaw } });
}
// bonuses that live in other systems' numbers
const MOD_COST_BASE = MOD_COST.map(c => Object.assign({}, c));
function roomApply() {
  const A = roomLvl('armory'), om = 3 + (A >= 3) + (A >= 5); if (ORD_MAX !== om) { ORD_MAX = om; ordCharges = Math.min(ordCharges, ORD_MAX); }
  const off = 1 - 0.05 * Math.max(0, A - 1); MOD_COST.forEach((c, i) => { c.cr = Math.round(MOD_COST_BASE[i].cr * off); });
}
setInterval(() => { try { roomApply(); } catch (_) {} }, 1000);
{ const _k = kill; kill = function (e) { const r = _k(e); try { const t = lvUp('trophy'); if (t && e.def && e.def.boss && e.def.cr) { const n = Math.round((e.def.cr[0] + e.def.cr[1]) / 2 * (1 + 0.2 * ((e.lv || 1) - 1)) * 0.04 * t); S.cr += n; log(`+${n} cr (Trophy Hall bonus)`, 'loot'); } } catch (_) {} return r; }; }

// ---- beaming: backpack ⇄ ship (each move re-checks the real counts, so rapid taps can't copy or lose items) ----
function beamFx(up) { try { burst(player.pos.clone().add(V(0, 1.1, 0)), up ? '#8fd0ff' : '#c8a8ff', 16, 2.5); } catch (_) {} SFX.item ? SFX.item() : SFX.ui(); }
function beamUp(id, n) {
  if (!invLock()) return; const I = ITEMS[id]; if (!I || I.quest || !roomLvl('cargo')) return;
  n = Math.min(Math.floor(n), S.inv[id] || 0); if (n < 1) return; const fit = Math.min(n, stashRoomFor(id));
  if (fit < 1) { SFX.hit(); invChip(invIconHtml(itemIcon(id), I.col), 'Ship storage is full · upgrade the Cargo Bay', true); return; }
  S.inv[id] -= fit; if (!S.inv[id]) delete S.inv[id]; S.stash = S.stash || {}; S.stash[id] = (S.stash[id] || 0) + fit;
  beamFx(true); invChip(invIconHtml(itemIcon(id), I.col), `Beamed ${fit} ${I.name} to your ship` + (fit < n ? ' (storage full)' : '')); markDirty(); renderQuest();
  if (!S.inv[id]) INVUI.sel = null; invRender(); invQuickRender();
}
function beamDown(id, n) {
  if (!invLock()) return; const I = ITEMS[id]; if (!I || !beamDownOk()) { SFX.hit(); return; }
  n = Math.min(Math.floor(n), (S.stash || {})[id] || 0); if (n < 1) return; const fit = Math.min(n, invRoomFor(id));
  if (fit < 1) { invFullNote(id); return; }
  S.stash[id] -= fit; if (!S.stash[id]) delete S.stash[id]; S.inv[id] = (S.inv[id] || 0) + fit; S.invT = S.invT || {}; S.invT['i:' + id] = Date.now();
  beamFx(false); invChip(invIconHtml(itemIcon(id), I.col), `+${fit} ${I.name} from your ship` + (fit < n ? ' (bag full)' : '')); markDirty(); checkReady(); renderQuest();
  if (!S.stash[id]) INVUI.sel = null; invRender(); invQuickRender();
}
function openShipStorage() { INVUI.view = 'stash'; INVUI.sel = null; INVUI.q = ''; openBag(); }

// ---- the Cargo Bay: a storage terminal, shelving that grows with each level, and the Black Hole Box at level 5 ----
const BHB = { core: null, ring: null };
function cargoStorage(s, cx, cz, far, term) {
  const L = roomLvl('cargo'); BHB.core = BHB.ring = null;
  term(cx + s.side * 0.5, s.z0 + 0.6, '#c8a8ff', 'Ship storage', openShipStorage, 0);
  const shelf = (x, z) => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.5), toon('#5a5e66')); p.position.y = 0.3 + i * 0.6; g.add(p); const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), toon(i % 2 ? '#a07a4a' : '#5d7f99')); c.position.set(-0.2 + (i % 2) * 0.3, 0.48 + i * 0.6, 0); g.add(c); }
    for (const sx of [-0.43, 0.43]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.5), toon('#3a3d44')); post.position.set(sx, 0.85, 0); g.add(post); } g.position.set(x, 0, z); levelGroup.add(g); box(x, z, 0.45, 0.3); };
  for (let i = 0; i < Math.min(L, 4); i++) shelf(cx - s.side * (1.0 + i * 1.0), s.z0 + 1.9);
  if (L >= 5) {
    const x = cx - s.side * 1.0, z = cz + 1.6, g = new THREE.Group(); g.position.set(x, 0, z); levelGroup.add(g);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.3, 16), toon('#2a2c32')); base.position.y = 0.15; g.add(base);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 6, 24), glow('#8f6ad0')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.31; g.add(rim);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 12), new THREE.MeshBasicMaterial({ color: '#000000' })); core.position.y = 1.6; g.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 6, 32), new THREE.MeshBasicMaterial({ color: '#c88aff', transparent: true, opacity: 0.85 })); ring.position.y = 1.6; ring.rotation.x = 1.2; g.add(ring);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 32), glow('#ffd6a0')); halo.position.y = 1.6; halo.rotation.x = 1.2; g.add(halo);
    const pl = new THREE.PointLight(0xa070ff, 0.9, 7); pl.position.y = 1.6; g.add(pl);
    BHB.core = core; BHB.ring = ring; BHB.halo = halo; solid(x, z, 1.0);
    INTERACTS.push({ x, z, r: 2.4, label: 'Black Hole Box (storage)', fn: openShipStorage });
  }
}
{ const _st = step; step = function (dt) { if (BHB.ring && LEVEL.id === 'ship') { const t = performance.now() / 1000; BHB.ring.rotation.z = t * 1.4; BHB.halo.rotation.z = -t * 2.2; BHB.core.scale.setScalar(1 + Math.sin(t * 3) * 0.03); } return _st.apply(this, arguments); }; }
