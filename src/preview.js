// =================== 3D ITEM PREVIEW in shop windows ===================
const PREV = { r: null, scene: null, cam: null, obj: null, wrap: null, label: null, spin: 0, raf: 0 };
function prevInit() {
  if (PREV.r) return true;
  try {
    const c = document.createElement('canvas'); c.width = 520; c.height = 300;
    PREV.r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: false }); PREV.r.outputEncoding = THREE.sRGBEncoding; PREV.r.setClearColor('#0b1240');
    PREV.scene = new THREE.Scene(); PREV.cam = new THREE.PerspectiveCamera(32, 520 / 300, 0.01, 50); PREV.cam.position.set(0, 0.35, 3.4); PREV.cam.lookAt(0, 0, 0);
    PREV.scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a3a2a, 1.0)); const d = new THREE.DirectionalLight(0xfff0d8, 0.9); d.position.set(2, 3, 2); PREV.scene.add(d);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 0.95, 40), new THREE.MeshBasicMaterial({ color: '#3b52bd', side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = -0.85; PREV.scene.add(ring);
    PREV.wrap = document.createElement('div'); PREV.wrap.className = 'prevWrap'; PREV.wrap.appendChild(c);
    PREV.label = document.createElement('div'); PREV.label.className = 'prevLbl'; PREV.wrap.appendChild(PREV.label);
    return true;
  } catch (_) { PREV.r = null; return false; }
}
function setPreview(make, label, zoom) {
  if (!prevInit()) return;
  if (PREV.obj) { PREV.scene.remove(PREV.obj); PREV.obj.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const inner = make(), holder = new THREE.Group(); holder.add(inner);
  const box = new THREE.Box3().setFromObject(inner), size = box.getSize(V(0, 0, 0)), ctr = box.getCenter(V(0, 0, 0)), s = 1.55 * (zoom || 1) / Math.max(size.x, size.y, size.z, 0.01);
  inner.position.sub(ctr); holder.scale.setScalar(s); PREV.obj = holder; PREV.scene.add(holder);
  PREV.label.textContent = label || ''; PREV.spin = 0;
}
function showPreviewIn(beforeEl) {
  if (!prevInit()) return; beforeEl.before(PREV.wrap);
  cancelAnimationFrame(PREV.raf);
  const loop = () => { if (!PREV.wrap.isConnected || $('dlg').hidden) return; PREV.spin += 0.012; if (PREV.obj) { PREV.obj.rotation.y = PREV.spin; PREV.obj.rotation.x = Math.sin(PREV.spin * 0.7) * 0.15; } PREV.r.render(PREV.scene, PREV.cam); PREV.raf = requestAnimationFrame(loop); };
  loop();
}
const gunPreview = (id) => () => { const m = makeGunModel(id); m.rotation.y = Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; };
const meleePreview = (id) => () => { const m = makeMeleeModel(id); const g = new THREE.Group(); m.rotation.z = -1.0; g.add(m); return g; };
