// =================== 2.1: equip from the bag, and a shared world (everyone sees the same monsters) ===================

// ---- Bag: your guns, staffs and melee weapons, with Equip right there ----
function bagWeaponRows(container) {
  const head = t => { const h = document.createElement('div'); h.className = 'bagHead'; h.textContent = t; container.appendChild(h); };
  const row = (col, name, meta, label, dis, fn) => { const r = document.createElement('div'); r.className = 'rowi';
    const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = col || '#ffd36a';
    const nm = document.createElement('span'); nm.textContent = name; const mt = document.createElement('span'); mt.className = 'meta'; mt.textContent = meta;
    const ac = document.createElement('span'); ac.style.display = 'flex'; ac.style.gap = '6px'; const b = document.createElement('button'); b.className = 'pbtn'; b.style.padding = '5px 10px'; b.textContent = label; b.disabled = dis; b.addEventListener('click', fn); ac.appendChild(b);
    r.append(dot, nm, mt, ac); container.appendChild(r); };
  const rerender = () => { SFX.ui(); markDirty(); openBag(); };
  head('Weapons');
  const slots = loadoutSlots(), mel = handMelee();
  for (const id of S.guns.filter(id => GUNS[id])) { const g = GUNS[id], t = gunTier(id), inHand = S.gun === id && !mel, staff = isStaffId(id), carried = slots[staff ? 'staff' : 'gun'] === id;
    row(g.col, `${g.name}${t ? ' ' + '★'.repeat(t) : ''}`, inHand ? 'In hand' : carried ? (staff ? 'Staff slot' : 'Gun slot') : staff ? 'Staff' : 'Gun', inHand ? 'In hand' : 'Equip', inHand, () => { bagEquipGun(id); rerender(); }); }
  for (const id of (S.melees || ['knife']).filter(id => MELEE[id])) { const M = MELEE[id], on = (S.melee || 'knife') === id;
    row(M.col || '#cfd4dc', M.name, on ? (mel ? 'In hand' : 'Melee slot') : 'Melee', on && mel ? 'In hand' : on ? 'Hold' : 'Equip', on && mel, () => { S.melee = id; if (typeof refreshMeleeModel === 'function') try { refreshMeleeModel(); } catch (_) {} if (!handMelee()) swapHand(); rerender(); }); }
  head('Items');
}
function bagEquipGun(id) {
  const g = GUNS[id]; if (!g || !S.guns.includes(id)) return;
  if (handMelee()) swapHand();
  if (S.gun !== id) { WMEM[S.gun] = { ammo: player.ammo, manaF: player.manaF, t: gameTime }; S.gun = id; const m = WMEM[id];
    player.ammo = m ? Math.min(g.mag, Math.floor(m.manaF != null ? m.manaF : m.ammo)) : g.mag; player.manaF = g.mana ? player.ammo : null; }
  S.dual = false; player.reloading = 0; player.cool = Math.max(player.cool, 0.15); firing = false; loadoutSlots(); log(`${g.name} equipped.`);
}
{ const st = document.createElement('style'); st.textContent = '#dlg .bagHead { font: 700 12px var(--hud); letter-spacing: .18em; text-transform: uppercase; color: #8fe3ff; margin: 8px 0 2px; }'; document.head.appendChild(st); }
{ const _ir = itemRows; itemRows = function (container, entries, btn) { _ir(container, entries, btn);
  if ($('dlgName').textContent === 'Bag' && $('dlgRole').textContent === 'Inventory' && container.id === 'shopRows') { const items = [...container.children]; container.textContent = ''; bagWeaponRows(container); items.forEach(c => container.appendChild(c)); } }; }

// ---- shared world ----
// Each monster is run by one player at a time: whoever is closest when nobody else is running it.
// That player's game moves it, fights with it and sends where it is and how hurt it is. Everyone else
// shows it in the same place and sends the damage they do to it; the runner applies that damage.
// Everyone who hurt a monster gets the kill and the loot when it dies.
const NET = { base: 0, sig: '', own: new Set(), peers: new Map(), mine: {}, seen: new Map(), t: 0 };
function netSig() { let h = 0; for (let i = 0; i < NET.base; i++) { const n = enemies[i].def.name || ''; for (let k = 0; k < n.length; k++) h = (h * 31 + n.charCodeAt(k)) % 99991; }
  return LEVEL.id + (LEVEL.id === 'zfloor' && typeof ZF !== 'undefined' ? '.' + ZF.floor : '') + ':' + NET.base + ':' + h; }
function netReset() {
  NET.own.clear(); NET.mine = {}; NET.seen.clear();
  NET.base = Math.min(enemies.length, 60); enemies.forEach((e, i) => { e.netI = i < NET.base ? i : null; e.netRemote = false; e.gen = 0; e.myDmg = 0; e.netShown = e.hp; });
  NET.sig = NET.base ? netSig() : '';
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll.apply(this, arguments); try { netReset(); } catch (_) {} return r; }; }
{ const _re = resetEnemy; resetEnemy = function (e) { _re(e); if (e.netI != null && !e.netRemote) e.gen = (e.gen || 0) + 1; e.myDmg = 0; e.rewarded = false; e.netShown = e.hp; e.netDeadT = 0; }; }
// a monster you hurt: count the damage (any weapon, pet, drone or burn) so the runner gets it
function netTrackDamage(e) { if (e.netI == null) return; if (e.hp < e.netShown - 1e-3 && !e.dead) { const d = e.netShown - e.hp; e.myDmg += d; if (e.netRemote) { const k = e.netI + '.' + e.gen; NET.mine[k] = (NET.mine[k] || 0) + d; e.netHitAt = gameTime; } } e.netShown = e.hp; if (e.netRemote && e.hp <= 0 && !e.dead) kill(e); }
{ const _k = kill; kill = function (e) { e.rewarded = true; return _k.apply(this, arguments); }; }
function silentKill(e) { if (e.dead) return; e.dead = 0.001; e.hp = 0; e.plate.material.opacity = 0; burst(e.obj.position.clone().add(V(0, e.def.hy, 0)), '#f6b56a', 10, 5); }
// the per-frame stand-in for a monster someone else runs: follow their copy, never attack
function netEnemyStep(e, dt, t) {
  const st = e.netState; if (!st) return false;
  const o = e.obj; netTrackDamage(e);
  if (e.dead) { if (e.dead < 2) { e.dead += dt; o.rotation.x = -Math.min(Math.PI / 2, e.dead * 4); o.position.y -= dt * (e.dead > 0.6 ? 1.2 : 0); if (e.dead >= 2) o.visible = false; } return true; }
  const d2p = o.position.distanceTo(player.pos); o.visible = d2p < 64; e.plate.visible = d2p < 36 && d2p > 2.4;
  const k = Math.min(1, dt * 8), px = o.position.x, pz = o.position.z;
  o.position.x += (st.x - o.position.x) * k; o.position.z += (st.z - o.position.z) * k;
  if (Math.hypot(st.x - px, st.z - pz) > 25) { o.position.x = st.x; o.position.z = st.z; }
  o.position.y = Math.max(floorAt(o.position.x, o.position.z), e.def.fly ? WATER_Y + 0.2 : -99);
  o.rotation.y += Math.atan2(Math.sin(st.ry - o.rotation.y), Math.cos(st.ry - o.rotation.y)) * k;
  if (o.userData.anim && d2p < 45) o.userData.anim(t + e.seed);
  if (st.atk && !e.anim.atk) e.anim.atk = 0.42; st.atk = 0;
  if (d2p < 45) animRig(o, e.anim, dt, t + e.seed);
  o.scale.setScalar(e.sc * (e.def.grow ? 0.8 + 0.7 * (1 - e.hp / e.max) : 1) * (1 + Math.max(0, e.hitT) * 0.6)); if (e.hitT > 0) e.hitT -= dt;
  return true;
}
// apply what the runner says about a monster
function netApply(e, a) {
  if (!Array.isArray(a) || a.length < 7) return;
  netTrackDamage(e);
  const [x, z, ry, hp, gen, fl, lv] = a.map(Number); if (![x, z, ry, hp, gen, fl, lv].every(Number.isFinite)) return;
  const st = e.netState || (e.netState = {}); st.x = x / 10; st.z = z / 10; st.ry = ry / 100; if (fl & 4) st.atk = 1;
  if (lv !== e.lv && lv >= 1 && lv <= 200) { const f = e.hp / e.max; e.lv = lv; e.max = e.def.hp * (1 + 0.22 * (lv - 1)); e.hp = e.max * f; e.netShown = e.hp; e.plateLvl = -1; }
  if (gen < e.gen) e.gen = gen; // follow the runner's count
  if (gen > e.gen) { // the runner respawned it
    e.gen = gen; if (e.dead) { e.dead = 0; e.respawn = 0; e.obj.rotation.x = 0; e.obj.visible = true; e.plate.material.opacity = 1; }
    e.hp = e.max; e.myDmg = 0; e.rewarded = false; e.obj.position.set(st.x, floorAt(st.x, st.z), st.z); e.netShown = e.hp; }
  const ownerHp = clamp(hp, 0, 1000) / 1000 * e.max;
  if (fl & 1) { if (!e.dead) { if (e.myDmg > 0 && !e.rewarded) kill(e); else silentKill(e); } return; }
  if (e.dead && gen === e.gen) { e.netDeadT = (e.netDeadT || 0) + 1; if (e.netDeadT > 12) { e.dead = 0; e.obj.rotation.x = 0; e.obj.visible = true; e.plate.material.opacity = 1; e.hp = ownerHp; e.netDeadT = 0; } return; }
  const fresh = gameTime - (e.netHitAt || -99) < 1.5; const want = fresh ? Math.min(ownerHp, e.hp) : ownerHp;
  if (Math.abs(want - e.hp) > 0.5) { e.hp = want; updatePlate(e); } e.netShown = e.hp; e.aggro = !!(fl & 2);
}
// read everyone's copies
{ const _sp = syncPeers; syncPeers = function (peers) { _sp(peers);
  const keep = new Set();
  for (const peer of peers || []) { if (peer.isMe || peer.kind !== 'viewer') continue; const pr = peer.presence || {};
    if (!LEVEL || pr.lv !== LEVEL.id || pr.ek !== NET.sig || !NET.sig) continue;
    keep.add(peer.peer); NET.peers.set(peer.peer, { x: +pr.x, z: +pr.z, es: pr.es && typeof pr.es === 'object' ? pr.es : {}, eh: pr.eh && typeof pr.eh === 'object' ? pr.eh : {} }); }
  for (const k of [...NET.peers.keys()]) if (!keep.has(k)) { NET.peers.delete(k); NET.seen.delete(k); }
  netThink(); }; }
// who runs what, applied a few times a second and on every update
function netThink() {
  if (!NET.base || !myPeer || !LEVEL || LEVEL.fly) { for (const e of enemies) e.netRemote = false; NET.own.clear(); return; }
  const me = myPeer, alive = player.alive;
  for (let i = 0; i < NET.base; i++) { const e = enemies[i]; if (!e || e.gone) continue;
    let owner = null, ownerP = null; for (const [pid, P] of NET.peers) if (P.es[i] && (!owner || pid < owner)) { owner = pid; ownerP = P; }
    const dMe = Math.hypot(player.pos.x - e.obj.position.x, player.pos.z - e.obj.position.z);
    if (NET.own.has(i)) {
      let release = dMe > 70 || (owner && owner < me);
      // hand an idle monster to a player who is clearly closer
      if (!release && !e.aggro && !e.dead) for (const P of NET.peers.values()) if (Math.hypot(P.x - e.obj.position.x, P.z - e.obj.position.z) < dMe - 10) { release = true; break; }
      if (release) NET.own.delete(i);
    } else if (!owner && dMe < 70 && alive) {
      let closest = true; for (const P of NET.peers.values()) if (Math.hypot(P.x - e.obj.position.x, P.z - e.obj.position.z) < dMe - 2) { closest = false; break; }
      if (closest) NET.own.add(i);
    }
    const remote = !NET.own.has(i) && !!owner;
    if (remote && !e.netRemote) { e.netShown = e.hp; e.netState = null; }
    e.netRemote = remote;
    if (remote) netApply(e, ownerP.es[i]);
  }
  // damage others did to the monsters you run
  for (const [pid, P] of NET.peers) { const seen = NET.seen.get(pid) || {}; NET.seen.set(pid, seen);
    for (const key in P.eh) { const [si, sg] = key.split('.').map(Number), e = enemies[si]; if (!e || !NET.own.has(si) || sg !== e.gen || e.dead) continue;
      const tot = clamp(Number(P.eh[key]) || 0, 0, 1e7), d = tot - (seen[key] || 0); if (d <= 0) continue; seen[key] = tot;
      e.hp -= d; e.hitT = 0.12; e.aggro = true; e.lastHit = gameTime; e.netShown = e.hp;
      if (e.hp <= 0) { if (e.myDmg > 0) kill(e); else silentKill(e); } else updatePlate(e); } }
}
{ const _st = step; step = function (dt) { _st(dt);
  for (const e of enemies) if (e.netI != null && !e.netRemote) netTrackDamage(e);
  NET.t -= dt; if (NET.t <= 0) { NET.t = 0.25; try { netThink(); } catch (err) { console.warn('net', err); } } }; }
// what you send: the monsters you run and the damage you did to the ones you don't
{ const _pw = pvpWrite; pvpWrite = function (p) { _pw(p); if (!NET.sig || !NET.base) return;
  p.ek = NET.sig; const es = {};
  const mine = [...NET.own].map(i => enemies[i]).filter(Boolean).sort((a, b) => a.obj.position.distanceToSquared(player.pos) - b.obj.position.distanceToSquared(player.pos)).slice(0, 40);
  for (const e of mine) { const o = e.obj.position; es[e.netI] = [Math.round(o.x * 10), Math.round(o.z * 10), Math.round(e.obj.rotation.y * 100), e.dead ? 0 : Math.max(0, Math.round(e.hp / e.max * 1000)), e.gen, (e.dead ? 1 : 0) | (e.aggro ? 2 : 0) | ((e.anim.atk || 0) > 0.3 ? 4 : 0), e.lv]; }
  p.es = es;
  const eh = {}; let n = 0; for (const k in NET.mine) { const [i, g] = k.split('.').map(Number); if (!enemies[i] || g < enemies[i].gen) { delete NET.mine[k]; continue; } if (n++ < 30) eh[k] = Math.round(NET.mine[k]); }
  p.eh = eh; }; }
