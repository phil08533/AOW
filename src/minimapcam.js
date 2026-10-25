// =================== MINIMAP CAMERA: an overhead live view in the minimap, with zoom levels ===================
// Click the minimap (or press = / -) to cycle: classic map, then live camera at near, mid and far zoom.
const MMC = { modes: [0, 16, 34, 70], rt: null, cam: null, buf: null, img: null, tmp: null, t: 0 };
const mmcMode = () => (S.flags && S.flags.mmCam) || 0;
function mmcSet(i) { S.flags = S.flags || {}; S.flags.mmCam = (i + MMC.modes.length) % MMC.modes.length; markDirty();
  toast('MINIMAP', S.flags.mmCam ? ['', 'Live view · close', 'Live view · mid', 'Live view · far'][S.flags.mmCam] : 'Classic map', 1.6); hudT = 0; }
function mmcRender(R) {
  const N = 128;
  if (!MMC.rt) { MMC.rt = new THREE.WebGLRenderTarget(N, N); MMC.rt.texture.encoding = renderer.outputEncoding; MMC.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400); MMC.cam.up.set(0, 0, -1);
    MMC.buf = new Uint8Array(N * N * 4); MMC.tmp = document.createElement('canvas'); MMC.tmp.width = MMC.tmp.height = N; MMC.img = MMC.tmp.getContext('2d').createImageData(N, N); }
  const c = MMC.cam, p = player.pos, inside = LEVEL.indoor || LEVEL.id === 'ship' || LEVEL.id === 'zfloor';
  c.left = -R; c.right = R; c.top = R; c.bottom = -R; c.updateProjectionMatrix();
  // indoors the camera sits just under the ceiling so it sees the room, not the roof
  c.position.set(p.x, (p.y || 0) + (inside ? 3.0 : 90), p.z); c.far = inside ? 40 : 400; c.updateProjectionMatrix(); c.lookAt(p.x, (p.y || 0) - 10, p.z);
  const fog = scene.fog, su = renderer.shadowMap.autoUpdate, vmv = typeof vm !== 'undefined' && vm.visible; scene.fog = null; renderer.shadowMap.autoUpdate = false; if (typeof vm !== 'undefined') vm.visible = false;
  const prev = renderer.getRenderTarget(); renderer.setRenderTarget(MMC.rt); const cc = renderer.getClearColor(new THREE.Color()), ca = renderer.getClearAlpha(); renderer.setClearColor(inside ? 0x07060a : 0x1a2a3a, 1); renderer.clear(); renderer.render(scene, c); renderer.setClearColor(cc, ca); renderer.readRenderTargetPixels(MMC.rt, 0, 0, N, N, MMC.buf); renderer.setRenderTarget(prev);
  scene.fog = fog; renderer.shadowMap.autoUpdate = su; if (typeof vm !== 'undefined') vm.visible = vmv;
  const d = MMC.img.data, b = MMC.buf; for (let y = 0; y < N; y++) d.set(b.subarray((N - 1 - y) * N * 4, (N - y) * N * 4), y * N * 4);
  MMC.tmp.getContext('2d').putImageData(MMC.img, 0, 0);
}
{ const _dm = drawMap; drawMap = function () {
  const m = mmcMode(); if (!m || !LEVEL || LEVEL.fly || state === 'menu') return _dm();
  const S2 = 112, R = MMC.modes[m], sc = S2 / 2 / R, cx = S2 / 2, cy = S2 / 2;
  const now = performance.now(); try { if (!MMC.tmp || now - MMC.t > 220 || MMC.r !== R || MMC.lv !== LEVEL.id) { MMC.t = now; MMC.r = R; MMC.lv = LEVEL.id; mmcRender(R); } } catch (e) { console.warn('mmc', e); S.flags.mmCam = 0; return _dm(); }
  mctx.clearRect(0, 0, S2, S2); mctx.imageSmoothingEnabled = true; mctx.drawImage(MMC.tmp, 0, 0, S2, S2);
  const w2m = (x, z) => [cx + (x - player.pos.x) * sc, cy + (z - player.pos.z) * sc];
  for (const e of enemies) if (!e.dead && e.obj.visible && Math.abs(e.obj.position.x - player.pos.x) < R && Math.abs(e.obj.position.z - player.pos.z) < R) { const [ex, ez] = w2m(e.obj.position.x, e.obj.position.z); mctx.fillStyle = e.def.boss ? '#ff2a3a' : '#d83a3a'; mctx.strokeStyle = '#000'; mctx.lineWidth = 1; mctx.beginPath(); mctx.arc(ex, ez, e.def.boss ? 4 : 2.5, 0, 7); mctx.fill(); mctx.stroke(); }
  for (const id in npcObjs) { const N = npcObjs[id]; if (!N.obj.visible || !N.mark) continue; const [nx, nz] = w2m(N.obj.position.x, N.obj.position.z); if (N.mark === '$') { mctx.fillStyle = '#8fe3ff'; mctx.strokeStyle = '#000'; mctx.lineWidth = 1; mctx.fillRect(nx - 2, nz - 2, 4, 4); mctx.strokeRect(nx - 2, nz - 2, 4, 4); continue; } mctx.fillStyle = '#ffd36a'; mctx.font = 'bold 12px monospace'; mctx.textAlign = 'center'; mctx.strokeStyle = '#000'; mctx.lineWidth = 3; mctx.strokeText(N.mark, nx, nz + 4); mctx.fillText(N.mark, nx, nz + 4); }
  mctx.save(); mctx.translate(cx, cy); mctx.rotate(-player.yaw); mctx.fillStyle = '#ff9a3c'; mctx.strokeStyle = '#000'; mctx.lineWidth = 1.5; mctx.beginPath(); mctx.moveTo(0, -7); mctx.lineTo(5, 5); mctx.lineTo(0, 2.5); mctx.lineTo(-5, 5); mctx.closePath(); mctx.stroke(); mctx.fill(); mctx.restore();
}; }
{ const st = document.createElement('style'); st.textContent = '#map { pointer-events: auto; cursor: pointer; }'; document.head.appendChild(st);
  $('map').addEventListener('click', e => { e.stopPropagation(); mmcSet(mmcMode() + 1); }); }
window.addEventListener('keydown', e => { if (state !== 'play' || dlgOpen || e.repeat || (typeof chatOpen === 'function' && chatOpen())) return;
  if (e.code === 'Equal') mmcSet(mmcMode() + 1); else if (e.code === 'Minus') mmcSet(mmcMode() - 1); });
