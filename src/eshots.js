// =================== ENEMY SHOTS (2.22.15): glowing plasma bolts instead of plain balls ===================
// Each enemy bolt is a bright core stretched along its flight, wrapped in a soft halo of its own colour, with a fading
// comet tail behind it and a flash where it lands. Coloured lobbed shots glow too.
const ESH = { list: [] };
{ const _es = enemyShot; enemyShot = function (e, lob) { const n = shots.length; const r = _es.apply(this, arguments);
  try { const s = shots[shots.length - 1]; if (!s || shots.length === n) return r; const def = e.def, colS = lob ? def.lob && def.lob.col : def.ranged && def.ranged.col; if (!colS) return r;
    const col = new THREE.Color(colS), m = s.m, sm = (c, o) => new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    if (!lob) { m.material = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').lerp(col, 0.35), fog: false }); m.lookAt(m.position.clone().add(s.v)); m.scale.set(0.55, 0.55, 2.4); }
    const halo = sm(col.clone().multiplyScalar(1.4), 0.85); halo.scale.setScalar(lob ? 1.1 : 1.3); halo.position.copy(m.position); scene.add(halo);
    const tail = []; for (let i = 0; i < (lob ? 4 : 7); i++) { const t = sm(col, 0.55 * (1 - i / 7)); t.scale.setScalar((lob ? 0.6 : 0.7) * (1 - i / 9)); t.position.copy(m.position); scene.add(t); tail.push(t); }
    ESH.list.push({ s, halo, tail, hist: [], col });
  } catch (err) { console.warn('eshot', err); } return r; }; }
function eshStep(dt) {
  for (let i = ESH.list.length - 1; i >= 0; i--) { const F = ESH.list[i], m = F.s.m;
    if (!m.parent) { // the shot is gone: flash where it ended and clean up
      if (!F.dying) { F.dying = 0.18; F.halo.scale.multiplyScalar(1.8); F.tail.forEach(t => scene.remove(t)); }
      F.dying -= dt; F.halo.material.opacity = Math.max(0, F.dying / 0.18) * 0.9;
      if (F.dying <= 0) { scene.remove(F.halo); F.halo.material.dispose(); F.tail.forEach(t => t.material.dispose()); ESH.list.splice(i, 1); } continue; }
    F.halo.position.copy(m.position); F.halo.material.opacity = 0.7 + Math.sin(performance.now() * 0.03 + i) * 0.15;
    F.hist.unshift(m.position.clone()); if (F.hist.length > F.tail.length * 2) F.hist.pop();
    F.tail.forEach((t, k) => { const p = F.hist[Math.min(F.hist.length - 1, k * 2 + 1)]; if (p) t.position.copy(p); }); }
}
{ const _b = boltStep; boltStep = function (dt) { _b(dt); try { eshStep(dt); } catch (_) {} }; }
