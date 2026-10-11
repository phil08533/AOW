// =================== BASE BUILDING ===================
// Grid-snapped pieces bought with loot. Your base saves with your character and is shared to a
// world document every player reads, so friends see each other's bases.
const PIECES = {
  floor: { name: 'Floor', cost: { scrap: 2 }, layer: 0, dim: [2, 0.24, 2] },
  wall: { name: 'Wall', cost: { scrap: 3 }, layer: 1, dim: [2, 2.4, 0.3] },
  turret: { name: 'Turret', cost: { scrap: 4, circuit: 2 }, layer: 1, dim: [0.9, 1.5, 0.9] },
  fire: { name: 'Campfire', cost: { pelt: 3 }, layer: 1, dim: [1.2, 0.8, 1.2] },
  lamp: { name: 'Lamp', cost: { scrap: 2, circuit: 1 }, layer: 1, dim: [0.4, 2.6, 0.4] },
  crate: { name: 'Crate', cost: { scrap: 2 }, layer: 1, dim: [0.9, 0.9, 0.9] },
  banner: { name: 'Banner', cost: { crystal: 1 }, layer: 1, dim: [0.8, 3, 0.2] }
};
const SHORT = { scrap: 'Scrap', circuit: 'Circuit', pelt: 'Pelt', crystal: 'Crystal' };
const CELL = 2, MAX_PIECES = 160;
const costText = (c) => Object.entries(c).map(([k, n]) => `${n} ${SHORT[k] || k}`).join(' + ');
function pieceModel(type, col) {
  const g = new THREE.Group();
  if (type === 'floor') { part(g, B(2, 0.22, 2), toon('#9a7650', 'wood'), 0, 0.11, 0); for (const s of [-1, 1]) { part(g, B(2.04, 0.08, 0.12), toon('#6a4f34', 'wood'), 0, 0.2, 0.96 * s); part(g, B(0.12, 0.08, 2.04), toon('#6a4f34', 'wood'), 0.96 * s, 0.2, 0); } }
  if (type === 'wall') { part(g, B(1.9, 2.3, 0.24), '#80848c', 0, 1.15, 0); part(g, B(2.02, 0.16, 0.32), '#5d636c', 0, 2.36, 0); part(g, B(2.02, 0.14, 0.32), '#5d636c', 0, 0.07, 0); for (const s of [-1, 1]) part(g, B(0.16, 2.44, 0.34), '#5d636c', 0.95 * s, 1.22, 0); part(g, B(0.5, 0.14, 0.05), glow(col), 0, 1.7, 0.14); }
  if (type === 'turret') { part(g, Cy(0.42, 0.5, 0.4, 8), '#5d636c', 0, 0.2, 0); part(g, Cy(0.12, 0.16, 0.7, 6), '#80848c', 0, 0.75, 0);
    const head = new THREE.Group(); head.position.y = 1.18; g.add(head); part(head, B(0.5, 0.34, 0.5), '#3a3d44', 0, 0, 0); part(head, Cy(0.05, 0.05, 0.6, 6), C.dark, 0.1, 0.02, 0.4, Math.PI / 2); part(head, Cy(0.05, 0.05, 0.6, 6), C.dark, -0.1, 0.02, 0.4, Math.PI / 2); part(head, B(0.14, 0.08, 0.04), glow('#ff3b2a'), 0, 0.08, 0.26); part(head, B(0.52, 0.06, 0.52), glow(col), 0, -0.2, 0); g.userData.head = head; }
  if (type === 'fire') { for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; part(g, new THREE.DodecahedronGeometry(0.16, 0), toon('#8f8778', 'stone'), Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5); }
    for (let k = 0; k < 3; k++) part(g, Cy(0.07, 0.07, 0.8, 5), toon('#5a4532', 'wood'), 0, 0.12, 0, Math.PI / 2, k * 1.05, 0);
    const fl = part(g, new THREE.OctahedronGeometry(0.28, 0), glow('#ffb347'), 0, 0.45, 0); fl.scale.y = 1.6; const f2 = part(g, new THREE.OctahedronGeometry(0.16, 0), glow('#fff0a0'), 0, 0.42, 0); f2.scale.y = 1.4;
    const fg = new THREE.Group(); g.add(fg); fg.attach(fl); fg.attach(f2); g.userData.flame = fg; }
  if (type === 'lamp') { part(g, Cy(0.2, 0.25, 0.15, 6), '#3a3d44', 0, 0.07, 0); part(g, Cy(0.05, 0.05, 2.3, 6), '#5d636c', 0, 1.2, 0); part(g, B(0.3, 0.06, 0.3), '#3a3d44', 0, 2.38, 0); part(g, new THREE.SphereGeometry(0.16, 8, 6), glow('#ffe2a0'), 0, 2.25, 0); }
  if (type === 'crate') { part(g, B(0.86, 0.86, 0.86), toon('#a07a4a', 'wood'), 0, 0.43, 0); for (const y of [0.15, 0.71]) part(g, B(0.9, 0.06, 0.9), '#5d636c', 0, y, 0); }
  if (type === 'banner') { part(g, Cy(0.04, 0.05, 3, 5), toon('#6a4f34', 'wood'), 0, 1.5, 0); part(g, B(0.02, 1.1, 0.7), toon(col, 'cloth'), 0, 2.35, 0.36); part(g, new THREE.SphereGeometry(0.07, 6, 4), '#c9a43a', 0, 3.04, 0); }
  return g;
}
const baseState = { on: false, type: 'floor', rot: 0, remove: false, groups: new Map(), data: new Map(), own: null, turrets: [], fires: [] };
let ghost = null;
const baseCache = new Map();
const onShip = () => LEVEL && LEVEL.id === 'ship';
const myBase = () => onShip() ? S.shipBase : S.base;
const myKey = () => onShip() ? 'ship' : 'me';
function pieceY(pieces, gx, gz, layer) {
  const cx = gx * CELL, cz = gz * CELL;
  let y = Math.max(groundH(cx - 0.9, cz - 0.9), groundH(cx + 0.9, cz - 0.9), groundH(cx - 0.9, cz + 0.9), groundH(cx + 0.9, cz + 0.9), groundH(cx, cz));
  if (layer === 1 && pieces.some(p => p[0] === 'floor' && p[1] === gx && p[2] === gz)) y += 0.22;
  return y;
}
function cleanPieces(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 200).filter(p => Array.isArray(p) && PIECES[p[0]] && Number.isInteger(p[1]) && Number.isInteger(p[2]) && Math.abs(p[1]) < 80 && Math.abs(p[2]) < 80).map(p => [p[0], p[1], p[2], p[3] ? 1 : 0]);
}
function renderBase(key, pieces, col, own) {
  const old = baseState.groups.get(key); if (old) scene.remove(old);
  baseState.data.set(key, { pieces, col, own });
  const g = new THREE.Group(); g.userData.turrets = []; g.userData.fires = []; g.userData.boxes = []; g.userData.surfaces = [];
  for (const p of pieces) {
    const [type, gx, gz, rot] = p, def = PIECES[type], x = gx * CELL, z = gz * CELL, y = pieceY(pieces, gx, gz, def.layer);
    const m = mergeChar(pieceModel(type, col)); m.position.set(x, y, z); m.rotation.y = rot ? Math.PI / 2 : 0; g.add(m);
    if (type === 'floor') g.userData.surfaces.push({ x, z, ux: 1, uz: 0, hl: 1, hw: 1, y: y + 0.22, base: true });
    if (type === 'wall') g.userData.boxes.push(rot ? [x, z, 0.17, 1.0] : [x, z, 1.0, 0.17]);
    if (type === 'turret' || type === 'crate' || type === 'lamp') g.userData.boxes.push([x, z, type === 'lamp' ? 0.18 : 0.42, type === 'lamp' ? 0.18 : 0.42]);
    if (type === 'turret' && own) g.userData.turrets.push({ head: m.userData.head, x, y: y + 1.2, z, cd: 0 });
    if (type === 'fire') g.userData.fires.push({ x, z, flame: m.userData.flame });
  }
  scene.add(g); baseState.groups.set(key, g);
  rebuildBaseColliders();
}
function rebuildBaseColliders() {
  BASE_BOXES.length = 0; for (let i = SURFACES.length - 1; i >= 0; i--) if (SURFACES[i].base) SURFACES.splice(i, 1);
  baseState.turrets = []; baseState.fires = [];
  for (const g of baseState.groups.values()) { BASE_BOXES.push(...g.userData.boxes); SURFACES.push(...g.userData.surfaces); baseState.turrets.push(...g.userData.turrets); baseState.fires.push(...g.userData.fires); }
}
function canBuild(type, gx, gz) {
  const x = gx * CELL, z = gz * CELL, def = PIECES[type];
  const B0 = myBase();
  if (onShip()) {
    const h = def.layer === 0 ? 1 : 0.5;
    if (!SHIP_ROOMS.some(r => x - h >= r.x0 + 0.3 && x + h <= r.x1 - 0.3 && z - h >= r.z0 + 0.3 && z + h <= r.z1 - 0.3)) return 'Build inside one of your ship’s rooms';
  } else if (LEVEL.id !== 'earth') return 'Build on Earth or inside your ship';
  else {
    for (const sf of SAFES) if (Math.hypot(x - sf.x, z - sf.z) < sf.r + 5) return 'You can’t build inside the Safe Zone';
    for (const zn of ZONES) if (!zn.safe && zn.id !== 'out' && zn.id !== 'north' && Math.hypot(x - zn.x, z - zn.z) < zn.r * 0.75) return 'Too close to ' + zn.name;
    for (const R of RINGS) if (!R.safe && Math.hypot(x - R.x, z - R.z) < R.r + 2) return 'Too close to Drome’s walls';
  }
  if (roadDist(x, z) < 1.5) return 'Keep the road clear';
  const hs = [groundH(x - 0.9, z - 0.9), groundH(x + 0.9, z - 0.9), groundH(x - 0.9, z + 0.9), groundH(x + 0.9, z + 0.9)];
  if (Math.min(...hs) < WATER_Y + 0.1) return 'Can’t build on water';
  if (Math.max(...hs) - Math.min(...hs) > 1.1) return 'Ground too steep';
  if (B0.some(p => p[1] === gx && p[2] === gz && PIECES[p[0]].layer === def.layer)) return 'Something is already there';
  if (B0.length >= MAX_PIECES) return 'Base is at the piece limit';
  for (const [k, n] of Object.entries(def.cost)) if ((S.inv[k] || 0) < n) return `Need ${costText(def.cost)}`;
  return null;
}
function targetCell() {
  const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const p = player.pos.clone().addScaledVector(f, 3.6);
  const auto = Math.abs(f.x) > Math.abs(f.z) ? 1 : 0;
  return { gx: Math.round(p.x / CELL), gz: Math.round(p.z / CELL), rot: auto ^ baseState.rot };
}
const ghostOk = new THREE.MeshBasicMaterial({ color: '#6fdc5a', transparent: true, opacity: 0.42, depthWrite: false });
const ghostBad = new THREE.MeshBasicMaterial({ color: '#ff4a3d', transparent: true, opacity: 0.42, depthWrite: false });
function updateGhost() {
  if (!baseState.on) { if (ghost) ghost.visible = false; return; }
  const c = targetCell();
  if (baseState.remove) {
    const hit = topPieceAt(c.gx, c.gz);
    if (!ghost) { ghost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), ghostOk); scene.add(ghost); }
    ghost.visible = true; ghost.material = ghostBad; ghost.scale.set(2.05, hit ? (PIECES[hit[0]].dim[1] + 0.1) : 0.1, 2.05);
    ghost.position.set(c.gx * CELL, pieceY(myBase(), c.gx, c.gz, 0) + ghost.scale.y / 2, c.gz * CELL); ghost.rotation.y = 0;
    $('buildMsg').textContent = hit ? `Remove ${PIECES[hit[0]].name} (refunds half)` : 'Aim at one of your pieces';
    return;
  }
  const def = PIECES[baseState.type], why = canBuild(baseState.type, c.gx, c.gz);
  if (!ghost) { ghost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), ghostOk); scene.add(ghost); }
  ghost.visible = true; ghost.material = why ? ghostBad : ghostOk; ghost.scale.set(def.dim[0], def.dim[1], def.dim[2]);
  ghost.position.set(c.gx * CELL, pieceY(myBase(), c.gx, c.gz, def.layer) + def.dim[1] / 2, c.gz * CELL); ghost.rotation.y = c.rot ? Math.PI / 2 : 0;
  $('buildMsg').textContent = why || `Place ${def.name} · ${costText(def.cost)}`;
}
function topPieceAt(gx, gz) { const here = myBase().filter(p => p[1] === gx && p[2] === gz); return here.find(p => PIECES[p[0]].layer === 1) || here[0] || null; }
function placePiece() {
  const c = targetCell();
  if (baseState.remove) {
    const hit = topPieceAt(c.gx, c.gz); if (!hit) return;
    myBase().splice(myBase().indexOf(hit), 1);
    for (const [k, n] of Object.entries(PIECES[hit[0]].cost)) { const back = Math.floor(n / 2); if (back) S.inv[k] = (S.inv[k] || 0) + back; }
    SFX.ui(); afterBaseChange(); return;
  }
  const why = canBuild(baseState.type, c.gx, c.gz); if (why) { SFX.hurt(); log(why); return; }
  for (const [k, n] of Object.entries(PIECES[baseState.type].cost)) { S.inv[k] -= n; if (!S.inv[k]) delete S.inv[k]; }
  myBase().push([baseState.type, c.gx, c.gz, c.rot]);
  SFX.item(); afterBaseChange();
}
let baseWriteT = 0, baseWriting = false, baseDirty = false;
function afterBaseChange() { renderBase(myKey(), myBase(), S.col, true); markDirty(); renderBuildBar(); if (!onShip()) { baseDirty = true; baseWriteT = 1.5; } }
async function flushBase() {
  if (!baseDirty || baseWriting || !db || !uid) return;
  baseDirty = false; baseWriting = true;
  try { await db.doc('bases/' + uid).set({ v: 1, nick: S.nick, col: S.col, pieces: S.base.map(p => p.slice()), t: Date.now() }); } catch (_) { }
  baseWriting = false;
}
function watchBases() {
  if (!db) return;
  try {
    db.collection('bases').onSnapshot(snap => {
      const seen = new Set();
      snap.docs.forEach(d => {
        if (d.id === uid) return; const v = d.data(); if (!v) return; seen.add(d.id);
        const col = typeof v.col === 'string' && /^#[0-9a-f]{6}$/i.test(v.col) ? v.col : COLORS[1];
        const pieces = cleanPieces(v.pieces);
        const prev = baseCache.get(d.id); if (prev && JSON.stringify(prev.pieces) === JSON.stringify(pieces) && prev.col === col) return;
        baseCache.set(d.id, { pieces, col });
        if (LEVEL && LEVEL.id === 'earth') renderBase(d.id, pieces, col, false);
      });
      for (const k of [...baseCache.keys()]) if (!seen.has(k)) baseCache.delete(k);
      for (const k of [...baseState.groups.keys()]) if (k !== 'me' && k !== 'ship' && !seen.has(k)) { scene.remove(baseState.groups.get(k)); baseState.groups.delete(k); baseState.data.delete(k); rebuildBaseColliders(); }
    }, () => {});
  } catch (_) {}
}
function renderBuildBar() {
  const bar = $('buildPieces'); bar.textContent = '';
  Object.entries(PIECES).forEach(([id, p]) => {
    const b = document.createElement('button'); b.className = 'pbtn' + (baseState.type === id && !baseState.remove ? ' go' : ''); b.id = 'bp-' + id;
    const afford = Object.entries(p.cost).every(([k, n]) => (S.inv[k] || 0) >= n);
    b.innerHTML = ''; const n = document.createElement('span'); n.textContent = p.name; const c = document.createElement('small'); c.textContent = costText(p.cost); c.style.display = 'block'; c.style.fontSize = '11px'; c.style.color = afford ? 'var(--dim)' : 'var(--hurt)';
    b.append(n, c); b.addEventListener('click', () => { baseState.type = id; baseState.remove = false; SFX.ui(); renderBuildBar(); }); bar.appendChild(b);
  });
  $('bRemove').classList.toggle('go', baseState.remove);
  $('buildCount').textContent = `${myBase().length}/${MAX_PIECES} pieces`;
}
function setBuild(on) {
  baseState.on = on; $('buildBar').hidden = !on; $('ammo').hidden = on; firing = false;
  if (on && LEVEL.id !== 'earth' && LEVEL.id !== 'ship') { baseState.on = false; $('buildBar').hidden = true; $('ammo').hidden = false; log('You can build on Earth, or inside your ship.'); return; }
  if (on) { renderBuildBar(); log('Build mode: aim at the ground in front of you and place pieces.'); } else if (ghost) ghost.visible = false;
}
function updateBaseWorld(dt, t) {
  for (const f of baseState.fires) { if (f.flame) { f.flame.scale.set(1 + Math.sin(t * 9 + f.x) * 0.12, 1 + Math.sin(t * 13 + f.z) * 0.2, 1); }
    if (Math.hypot(player.pos.x - f.x, player.pos.z - f.z) < 3.2 && player.alive) player.hp = Math.min(maxHp(), player.hp + 6 * dt); }
  for (const tu of baseState.turrets) {
    tu.cd -= dt; let best = null, bd = 15;
    for (const e of enemies) { if (e.dead || !e.obj.visible) continue; const d = Math.hypot(e.obj.position.x - tu.x, e.obj.position.z - tu.z); if (d < bd) { bd = d; best = e; } }
    if (!best) continue;
    const want = Math.atan2(best.obj.position.x - tu.x, best.obj.position.z - tu.z); if (tu.head) tu.head.rotation.y = want;
    if (tu.cd <= 0) {
      tu.cd = 0.7; const tgt = best.obj.position.clone().add(V(0, best.def.hy * best.sc, 0));
      tracer(V(tu.x, tu.y, tu.z), tgt, '#ff6a5a'); best.hp -= 12 * (1 + 0.05 * S.lvl); best.hitT = 0.1; best.aggro = true; best.lastHit = gameTime; if (best.anim) best.anim.hit = 0.12;
      if (Math.hypot(tu.x - player.pos.x, tu.z - player.pos.z) < 30) SFX.zap();
      if (best.hp <= 0) kill(best); else updatePlate(best);
    }
  }
  if (baseWriteT > 0) { baseWriteT -= dt; if (baseWriteT <= 0) flushBase(); }
  updateGhost();
}

