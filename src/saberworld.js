// =================== SABER CRYSTALS IN THE WORLD, AND THE SWING TRAIL ===================
// Each world hides one crystal (SABER_CRYSTALS in sabers.js): it floats over a little rock with a tall beam of its own
// light so you can spot it from a distance. Walk up and take it, then set it at any saber forge.
const SCRY = { g: null, said: 0 };
function scryRand(id) { let h = 2166136261; for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
function scryClear(x, z, m) { for (const [cx, cz, cr] of CIRCLES) if (Math.hypot(x - cx, z - cz) < cr + m) return false; for (const [cx, cz, hx, hz] of BOXES) if (Math.abs(x - cx) < hx + m && Math.abs(z - cz) < hz + m) return false; return true; }
// a spot in the open: inside one of the world's zones, clear of walls and props, on real ground
function scrySpot(id) {
  const rnd = scryRand(id), rc = new THREE.Raycaster(), zs = ZONES.filter(z => !z.safe).concat(ZONES.filter(z => z.safe)); let loose = null; levelGroup.updateMatrixWorld(true);
  for (let i = 0; i < 80 && zs.length; i++) { const zn = zs[Math.floor(rnd() * Math.min(zs.length, i < 50 ? Math.max(1, ZONES.filter(z => !z.safe).length) : zs.length))], a = rnd() * Math.PI * 2, r = zn.r * (0.2 + 0.55 * rnd()), x = zn.x + Math.cos(a) * r, z = zn.z + Math.sin(a) * r;
    if (!scryClear(x, z, 1.8)) continue; rc.set(V(x, 200, z), V(0, -1, 0)); rc.far = 400; const h = rc.intersectObjects(levelGroup.children, true).find(o => o.object.visible !== false && !(o.object.material && o.object.material.transparent));
    const gy = groundH(x, z); if (!h) continue; if (Math.abs(h.point.y - gy) < 1.2) return V(x, h.point.y, z); if (!loose) loose = V(x, h.point.y, z); }
  return loose;
}
function scrySpawn(id) {
  SCRY.g = null; SCRY.said = 0; const C = SABER_CRYSTALS[id]; if (!C || (S.saberCrystals && S.saberCrystals[id]) || LEVEL.fly) return;
  const p = scrySpot(id); if (!p) return;
  const g = new THREE.Group(); g.position.copy(p); levelGroup.add(g); SCRY.g = g; SCRY.id = id;
  part(g, new THREE.DodecahedronGeometry(0.45, 0), toon('#6a6470', 'stone'), 0, 0.2, 0, 0.3, 0.6, 0).scale.y = 0.55;
  const cm = saberCrystalMesh(id, 11); cm.position.y = 1.15; g.add(cm); SCRY.cm = cm;
  const beam = new THREE.Mesh(Cy(0.09, 0.22, 36, 8, true), new THREE.MeshBasicMaterial({ color: C.col, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); beam.position.y = 18; g.add(beam);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: typeof FLASH_TEX !== 'undefined' ? FLASH_TEX : null, color: C.col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(1.6); halo.position.y = 1.15; g.add(halo);
  levelAnims.push(t => { if (!SCRY.g || SCRY.g !== g) return; cm.rotation.y = t * 1.2; cm.position.y = 1.15 + Math.sin(t * 2) * 0.08; halo.material.opacity = 0.45 + Math.sin(t * 3) * 0.15;
    if (!SCRY.said && player.pos.distanceTo(g.position) < 28) { SCRY.said = 1; toast('A HUM IN THE AIR', `Something nearby is singing. A ${C.name}?`, 3); } });
  const it = { x: p.x, z: p.z, r: 2.0, label: `💎 Take the ${C.name}`, fn: () => { S.saberCrystals = S.saberCrystals || {}; S.saberCrystals[id] = 1; markDirty(); SFX.item(); g.visible = false; it.r = 0; SCRY.g = null;
    burst(p.clone().add(V(0, 1.1, 0)), C.col, 30, 8); toast('CRYSTAL FOUND', `${C.name} · set it in your laser sword at a saber forge`, 4); log(`Found the ${C.name}. ${C.desc}`, 'loot'); } };
  INTERACTS.push(it);
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll.apply(this, arguments); try { scrySpawn(id); } catch (e) { console.warn('crystal', e); } return r; }; }

// ---- light trail: the whole blade leaves a fading ribbon of their own colour while you swing (first person)
const STRL = { list: [] };
function strlMesh(col) { const N = 10, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 2 * 3), cl = new Float32Array(N * 2 * 3), idx = [];
  for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(cl, 3)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.frustumCulled = false; m.renderOrder = 5; camera.add(m); return { m, N, hist: [], col: new THREE.Color(col) }; }
{ const _uh = updateHands; updateHands = function (dt, t) { _uh(dt, t);
  try { const sw = vmMelee.visible && MELEE[S.melee] && MELEE[S.melee].saber && vmMelee.children[0], tips = sw ? vmMelee.children[0].userData.tips || [] : [];
    while (STRL.list.length < tips.length) STRL.list.push(null);
    STRL.list.forEach((T, i) => { const tp = tips[i];
      if (tp && (!T || T.hex !== tp[2])) { if (T) { camera.remove(T.m); T.m.geometry.dispose(); } T = STRL.list[i] = strlMesh(tp[2]); T.hex = tp[2]; }
      if (!T) return; const live = tp && typeof SWG !== 'undefined' && SWG.blend > 0.3;
      if (live) { vmMelee.updateMatrixWorld(true); const b = camera.worldToLocal(tp[1].getWorldPosition(new THREE.Vector3())), r = camera.worldToLocal(tp[0].getWorldPosition(new THREE.Vector3())); const dz = Math.abs(b.clone().sub(r).normalize().z); T.hist.unshift([r, b, Math.pow(1 - dz, 2)]); }
      else T.hist.unshift(T.hist[0] || null);
      if (!live) T.hist.splice(Math.max(1, T.hist.length - 2)); if (T.hist.length > T.N) T.hist.length = T.N;
      const P = T.m.geometry.attributes.position, Cc = T.m.geometry.attributes.color, h = T.hist.filter(Boolean); T.m.visible = live && h.length > 2;
      for (let k = 0; k < T.N; k++) { const s = h[Math.min(k, h.length - 1)]; if (!s) continue; const f = Math.pow(1 - k / (T.N - 1), 2) * 0.2 * (s[2] == null ? 1 : s[2]);
        P.setXYZ(k * 2, s[0].x, s[0].y, s[0].z); P.setXYZ(k * 2 + 1, s[1].x, s[1].y, s[1].z); Cc.setXYZ(k * 2, T.col.r * f * 0.45, T.col.g * f * 0.45, T.col.b * f * 0.45); Cc.setXYZ(k * 2 + 1, T.col.r * f, T.col.g * f, T.col.b * f); }
      P.needsUpdate = Cc.needsUpdate = true; });
  } catch (e) { console.warn('trail', e); } }; }
