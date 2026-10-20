// =================== POSTERS & GRAFFITI: Phil's poster art and spray tags on walls across the universe ===================
const POSTER_TEX = {};
function posterTex(k) { if (!POSTER_TEX[k]) { const t = new THREE.TextureLoader().load(POSTER_IMG[k]); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; POSTER_TEX[k] = t; } return POSTER_TEX[k]; }
const GRAF_TAGS = ['ZIB WAS HERE', 'SETTING SUN', 'VEX LIVES', 'XR-17 SUX', 'NO GODS NO MAWS', 'RELL OWES ME', 'ORE OR DIE', 'GRUB 4 MAYOR', 'ART OF WAR', 'KILROY 2136'];
function grafTex(text, hue) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
  x.font = 'bold 40px "Pixelify Sans", Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.save(); x.translate(128, 44); x.rotate((Math.random() - 0.5) * 0.18);
  x.lineWidth = 9; x.strokeStyle = '#111'; x.strokeText(text, 0, 0, 240); x.fillStyle = `hsl(${hue},90%,58%)`; x.fillText(text, 0, 0, 240);
  x.fillStyle = `hsl(${hue},90%,48%)`; for (let i = 0; i < 7; i++) x.fillRect(-110 + Math.random() * 220, 14, 3, 6 + Math.random() * 22);
  x.restore(); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function placeWallArt() {
  if (!LEVEL || LEVEL.fly || LEVEL.id === 'space' || !levelGroup) return;
  let sd = 0; for (const ch of LEVEL.id) sd = (sd * 31 + ch.charCodeAt(0)) >>> 0; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  const rc = new THREE.Raycaster(), targets = [], spots = [], keys = Object.keys(POSTER_IMG);
  levelGroup.traverse(o => { if (o.isMesh && o.visible && !o.userData.rig && !(o.material && o.material.transparent)) targets.push(o); });
  const p0 = player.pos.clone(), dirs = [V(1, 0, 0), V(-1, 0, 0), V(0, 0, 1), V(0, 0, -1)], nrm = new THREE.Vector3();
  for (let gx = -36; gx <= 36; gx += 6) for (let gz = -36; gz <= 36; gz += 6) {
    const o = V(p0.x + gx, (p0.y || 0) + 1.7, p0.z + gz);
    for (const d of dirs) { rc.set(o, d); rc.far = 9; const h = rc.intersectObjects(targets, false)[0]; if (!h || !h.face || h.distance < 1.2) continue;
      nrm.copy(h.face.normal).transformDirection(h.object.matrixWorld); if (Math.abs(nrm.y) > 0.15 || nrm.dot(d) > -0.9) continue;
      if (spots.some(s => s.p.distanceTo(h.point) < 4.5)) continue; spots.push({ p: h.point.clone(), n: nrm.clone() }); } }
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
  spots.slice(0, 18).forEach((s, i) => {
    const graf = i % 3 === 2, m = new THREE.Mesh(new THREE.PlaneGeometry(graf ? 2.4 : 0.9, graf ? 0.9 : 1.2),
      new THREE.MeshBasicMaterial({ map: graf ? grafTex(GRAF_TAGS[Math.floor(rnd() * GRAF_TAGS.length)], Math.floor(rnd() * 360)) : posterTex(keys[i % keys.length]), transparent: graf, alphaTest: graf ? 0.1 : 0, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.copy(s.p).addScaledVector(s.n, 0.03); if (graf) m.position.y -= 0.5 + rnd() * 0.3; m.lookAt(m.position.clone().add(s.n)); m.rotation.z += (rnd() - 0.5) * 0.06;
    m.userData.wallArt = 1; levelGroup.add(m);
  });
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); setTimeout(() => { try { placeWallArt(); } catch (e) { console.warn('wallart', e); } }, 120); return r; }; }
