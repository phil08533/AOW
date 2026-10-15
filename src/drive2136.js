// =================== 2.13.6: a clean Velocity screen, the ship radio console, blacklights, a real rear window ===================
// While you drive on Velocity the screen keeps only what driving needs: speed, the map, the quest and your buttons.
// Health, the drone and pet, the heal button and the raid tracker step aside, and the "how to drive" line fades after
// ten seconds behind the wheel. Elsewhere: the raid tracker is a Settings switch (off by default), the radio console
// sits by the bridge window, the Halo Line gates glow under blacklight, and the hall viewport looks out on real space.
{ const st = document.createElement('style'); st.textContent = `
body.velocity.driving #vitals, body.velocity.driving #tHeal, body.velocity.driving #raidBar { display: none !important; }
body:not(.raidOn) #raidBar { display: none !important; }
body.driving #tDrift { right: calc(env(safe-area-inset-right, 0px) + 14px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px) !important; width: 86px !important; height: 86px !important; }
body.driving #tBoost { right: calc(env(safe-area-inset-right, 0px) + 110px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 20px) !important; width: 72px !important; height: 72px !important; }
body.driving #tCam { right: calc(env(safe-area-inset-right, 0px) + 31px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 116px) !important; width: 52px !important; height: 52px !important; }
body.driving #tSub.tq { right: calc(env(safe-area-inset-right, 0px) + 96px) !important; bottom: calc(env(safe-area-inset-bottom, 0px) + 108px) !important; width: 48px !important; height: 48px !important; }
/* the galaxy map and the pause menu fit a sideways phone */
@media (max-height: 520px) {
  .dlg.galaxy { display: grid; grid-template-columns: auto minmax(170px, 1fr); column-gap: 14px; align-content: start; width: min(calc(100% - 16px), 860px); max-height: calc(100vh - 12px); bottom: calc(env(safe-area-inset-bottom, 0px) + 6px); padding: 8px 12px; }
  .dlg.galaxy > * { grid-column: 2; }
  .dlg.galaxy #shopRows { display: contents; }
  .dlg.galaxy #shopRows canvas { grid-column: 1; grid-row: 1 / span 6; height: calc(100vh - 34px) !important; width: auto !important; max-width: 62vw !important; }
  .dlg.galaxy #shopRows > div { grid-column: 2; margin-top: 0 !important; font-size: 13px !important; }
  .dlg.galaxy .line { font-size: 13px; min-height: 0; }
  .dlg.galaxy h3 { font-size: 18px; }
  .dlg.galaxy .acts { margin-top: 6px; gap: 6px; }
  .dlg.galaxy .acts .pbtn { padding: 6px 10px; font-size: 13px; }
  #pause { place-items: start center; padding: 6px 10px; }
  #pause .sheet { width: min(100%, 760px); max-height: calc(100vh - 12px); overflow-y: auto !important; gap: 6px; padding: 8px 14px 10px; }
  #pause .sheet .sub { font-size: 16px; margin: 0; }
  #pause .settings { grid-template-columns: auto auto auto auto; column-gap: 14px; row-gap: 6px; }
  #pause #setTabs { margin: 0 0 4px; }
  #pause .cta { padding: 8px 18px; font-size: 18px; }
  #pause #logoutBtn { margin-top: 2px !important; padding: 6px !important; }
}
`; document.head.appendChild(st); }

// ---- the galaxy map gets its landscape layout ----
{ const _og = openGalaxy; openGalaxy = function () { const r = _og.apply(this, arguments); $('dlg').classList.add('galaxy'); return r; }; }
{ const _od = openDlg; openDlg = function () { $('dlg').classList.remove('galaxy'); return _od.apply(this, arguments); }; }

// ---- driving on Velocity: the drive hint fades, the drone and pet are put away ----
const DRV = { t: 0 };
const velDriving = () => !!(LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly && typeof RC !== 'undefined' && RC.on);
{ const _up = updatePet; updatePet = function (dt, t) { if (velDriving()) { if (petObj) petObj.visible = false; return; } if (petObj) petObj.visible = true; return _up(dt, t); }; }
{ const _ds = droneStep; droneStep = function (dt) { if (velDriving()) { if (DR.obj) DR.obj.visible = false; if (typeof droneBeam === 'function') droneBeam(false); return; } if (DR.obj) DR.obj.visible = true; return _ds(dt); }; }
{ const _sc = subChip; subChip = function () { const r = _sc.apply(this, arguments); if (document.body.classList.contains('driving')) tSub.style.removeProperty('bottom'); return r; }; }
{ const _st = step; step = function (dt) { _st(dt);
  document.body.classList.toggle('raidOn', !!PREFS.raidBar);
  const hum = velDriving() || (typeof HALO !== 'undefined' && HALO.on); if (!hum && DRV.hum && SFX.maghum) SFX.maghum(0, 0); DRV.hum = hum;
  if (!velDriving()) { DRV.t = 0; return; }
  if (RC.free && !(typeof HALO !== 'undefined' && HALO.on)) { DRV.t += dt; if (DRV.t > 10) { $('zone').style.opacity = 0; zoneT = 0; } }
}; }

// ---- Settings → Game: the raid tracker switch (off by default; the raid pop-ups still show) ----
{ const anchor = $('setMusic').previousElementSibling, l = document.createElement('span'); l.textContent = 'Raid tracker'; const b = document.createElement('button'); b.className = 'pbtn'; b.id = 'setRaidBar';
  b.addEventListener('click', () => { PREFS.raidBar = !PREFS.raidBar; savePrefs(); renderSettings(); SFX.ui(); document.body.classList.toggle('raidOn', !!PREFS.raidBar); }); anchor.before(l, b);
  SET_OF.setRaidBar = 'game'; }
{ const _rs = renderSettings; renderSettings = function () { _rs(); const b = $('setRaidBar'); if (b) b.textContent = PREFS.raidBar ? 'On' : 'Off'; }; }
renderSettings(); try { showSetTab(setTab); } catch (_) {}

// ---- the ship radio console, at the right end of the bridge consoles by the window ----
function openShipRadio() {
  openDlg('Ship radio', RADIO.st >= 0 ? RADIO_STATIONS[RADIO.st].name : 'Off');
  $('dlgLine').textContent = 'The radio plays on board and while you fly the ship. Everywhere else you hear the normal soundtrack.' + (PREFS.music !== 3 ? ' (Set Music to Soundtrack in Settings to hear it.)' : '');
  acts([...RADIO_STATIONS.map((s, i) => [`${RADIO.st === i ? '▶ ' : ''}${s.name} · ${s.tag}`, () => { radioTune(i); openShipRadio(); }, RADIO.st === i]), [RADIO.st >= 0 ? 'Turn it off' : 'Off', () => { radioTune(-1); openShipRadio(); }], ['Close', closeDlg]]);
}
{ const _b = LEVELS.ship.build; LEVELS.ship.build = function () { const r = _b.apply(this, arguments);
  try { const g = new THREE.Group(), x = 3.45, z = -12.85; g.position.set(x, 0.95, z); g.rotation.y = -3 * 0.12; levelGroup.add(g);
    part(g, B(0.62, 0.26, 0.3), '#1e2026', 0, 0.13, 0); part(g, B(0.5, 0.1, 0.02), glow('#ffb03b'), -0.02, 0.17, 0.152); part(g, B(0.02, 0.12, 0.025), glow('#ff3b5a'), -0.12, 0.17, 0.162);
    for (const k of [-1, 1]) part(g, Cy(0.05, 0.05, 0.04, 10), '#9aa0aa', 0.22 * k + 0.02, 0.07, 0.16, Math.PI / 2, 0, 0);
    part(g, B(0.02, 0.32, 0.02), '#9aa0aa', 0.24, 0.42, -0.08); const tip = part(g, B(0.05, 0.05, 0.05), glow('#4fd2ff'), 0.24, 0.6, -0.08);
    levelAnims.push(t => { tip.visible = RADIO.st >= 0 ? Math.sin(t * 6) > -0.2 : false; });
    INTERACTS.push({ x: 3.0, z: -12.25, r: 1.3, label: 'Ship radio', fn: openShipRadio });
  } catch (e) { console.warn('radio console', e); }
  return r; }; }

// ---- blacklights on the Halo Line ramp: violet tubes overhead, glowing paint on the glass, no real lights needed ----
function haloBlackTex() { if (haloBlackTex.t) return haloBlackTex.t; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(150,80,255,.85)'); g.addColorStop(0.45, 'rgba(110,40,255,.35)'); g.addColorStop(1, 'rgba(80,20,200,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return haloBlackTex.t = new THREE.CanvasTexture(c); }
{ const _hg = haloGates; haloGates = function () { _hg.apply(this, arguments);
  // the barrels run all the way back into the edge wall (it rises from about 325 m out), so the gates sit in the cliff
  try { levelGroup.traverse(o => { if (!o.isMesh || !o.geometry || o.geometry.type !== 'CylinderGeometry') return; const q = o.geometry.parameters; if (Math.abs(q.radiusTop - 8.6) > 0.01 || Math.abs(q.height - 26) > 0.01) return;
      o.geometry.dispose(); o.geometry = new THREE.CylinderGeometry(8.6, 8.6, 64, 24, 1, true); o.position.z = -32; o.material = new THREE.MeshLambertMaterial({ color: '#3a3e48', side: THREE.DoubleSide });
      const g = o.parent; for (let k = 5; k < 12; k++) { const b = new THREE.Mesh(new THREE.TorusGeometry(8.7, 0.1, 4, 40), haloGlow(HALO_PAL_A[k % 4])); b.position.set(0, 8.6, -3 - k * 5); g.add(b); }
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(11, 13, 10, 24, 1, true), new THREE.MeshLambertMaterial({ color: '#2b2a2c', side: THREE.DoubleSide })); collar.rotation.x = Math.PI / 2; collar.position.set(0, 8.6, -44); g.add(collar); }); } catch (e) { console.warn('halo barrels', e); }
  try { const tubeM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#9a5bff'), fog: false }), poolM = new THREE.MeshBasicMaterial({ map: haloBlackTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), paint = [];
    for (const P of HALO_PORTALS) {
      for (let k = 0; k < 6; k++) { const cx = P.x - P.nx * (6 + k * 8), cy = groundH(cx, P.z);
        // an arch of dark posts carrying a violet tube across the lane
        for (const s of [-1, 1]) { part(levelGroup, B(0.35, 6.4, 0.35), '#1c1b22', cx, cy + 3.2, P.z + s * 7.2); part(levelGroup, B(0.12, 5.6, 0.12), tubeM, cx + P.nx * 0.2, cy + 3.2, P.z + s * 7.2); }
        part(levelGroup, B(0.4, 0.3, 14.8), '#1c1b22', cx, cy + 6.5, P.z); part(levelGroup, B(0.14, 0.14, 14.2), tubeM, cx, cy + 6.3, P.z);
        // the light pool it throws on the glass
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), poolM); pool.rotation.x = -Math.PI / 2; pool.position.set(cx, cy + 0.08, P.z); levelGroup.add(pool);
        // fluorescent paint that only shows up under the blacklight
        const cols = ['#3bff8a', '#ff3bd1', '#ffe03b', '#3bf0ff'];
        for (const s of [-1, 1]) { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(cols[(k + (s > 0 ? 0 : 2)) % 4]), transparent: true, opacity: 0.8, fog: false }); const st = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.35), m); st.rotation.set(-Math.PI / 2, 0, s * 0.35 * P.nx); st.position.set(cx - P.nx * 2, cy + 0.1, P.z + s * 3.2); levelGroup.add(st); paint.push([m, k * 0.6 + (s > 0 ? 0 : 0.3)]); }
      }
      // splatter dots along the lane edges
      for (let i = 0; i < 26; i++) { const cx = P.x - P.nx * (4 + Math.random() * 46), cz = P.z + (Math.random() < 0.5 ? -1 : 1) * (4.5 + Math.random() * 2.5), m = new THREE.MeshBasicMaterial({ color: new THREE.Color(['#3bff8a', '#ff3bd1', '#ffe03b'][i % 3]), transparent: true, opacity: 0.7, fog: false });
        const d = new THREE.Mesh(new THREE.CircleGeometry(0.15 + Math.random() * 0.25, 10), m); d.rotation.x = -Math.PI / 2; d.position.set(cx, groundH(cx, cz) + 0.09, cz); levelGroup.add(d); paint.push([m, i * 0.37]); }
    }
    levelAnims.push(t => { for (const [m, ph] of paint) m.opacity = 0.55 + 0.35 * Math.max(0, Math.sin(t * 2.2 - ph)); tubeM.color.setHSL(0.74 + Math.sin(t * 1.3) * 0.02, 1, 0.62 + Math.sin(t * 9) * 0.03); });
  } catch (e) { console.warn('blacklights', e); }
}; }

// ---- the hall viewport: a hole in the end wall onto real 3D space (stars at depth, a planet, drifting rocks, dust) ----
{ const _dh = dressHall; dressHall = function () { _dh.apply(this, arguments);
  try { const { Lz } = hallLayout(), vw = 2.6, vh = 1.5, cy = 1.65, H = 3.2, zEnd = Lz - 0.18;
    // swap the flat picture for glass, and cut the window out of the end wall
    // (removed outright, not hidden: the props get merged into one mesh after the build)
    let wallM = null; const gone = []; levelGroup.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.parameters) return; const q = o.geometry.parameters, p = o.position;
      if (o.geometry.type === 'PlaneGeometry' && Math.abs(p.z - zEnd) < 0.01 && Math.abs(q.width - vw) < 0.01 && o.material && o.material.map) gone.push(o);
      if (o.geometry.type === 'BoxGeometry' && Math.abs(p.z - Lz) < 0.01 && Math.abs(p.x) < 0.01 && Math.abs(q.width - 4) < 0.05 && Math.abs(q.height - H) < 0.05) { wallM = o.material; gone.push(o); } });
    for (const o of gone) o.parent.remove(o);
    if (wallM) { const add = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), wallM); m.position.set(x, y, Lz); levelGroup.add(m); };
      const top = cy + vh / 2, bot = cy - vh / 2; add(4, H - top, 0, (H + top) / 2); add(4, bot, 0, bot / 2); for (const s of [-1, 1]) add(2 - vw / 2, vh, s * (1 + vw / 4), cy); }
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(vw, vh), new THREE.MeshBasicMaterial({ color: '#8fd0ff', transparent: true, opacity: 0.07, depthWrite: false })); glass.position.set(0, cy, zEnd); levelGroup.add(glass);
    // the hull is thick: a short tunnel of dark plating out to the outer skin
    const hullM = toonNS('#2a2c32', 'hull'); for (const s of [-1, 1]) { part(levelGroup, B(0.06, vh, 0.9), hullM, s * vw / 2, cy, Lz + 0.6); part(levelGroup, B(vw, 0.06, 0.9), hullM, 0, cy + s * vh / 2, Lz + 0.6); }
    const sky = new THREE.Group(); sky.position.set(0, cy, Lz); levelGroup.add(sky);
    // stars in three depths so they slide against each other as you walk
    for (const [n, d0, d1, sz, op] of [[500, 40, 120, 1.6, 0.9], [900, 120, 240, 1.3, 0.8], [260, 18, 40, 2.2, 1]]) { const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
      for (let i = 0; i < n; i++) { const d = d0 + Math.random() * (d1 - d0); pos[i * 3] = (Math.random() - 0.5) * d * 1.6; pos[i * 3 + 1] = (Math.random() - 0.5) * d * 1.1; pos[i * 3 + 2] = d; c.setHSL(Math.random() < 0.2 ? 0.08 : 0.6, 0.5, 0.75 + Math.random() * 0.25); col.set([c.r, c.g, c.b], i * 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      sky.add(new THREE.Points(g, new THREE.PointsMaterial({ size: sz, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: op, fog: false, depthWrite: false }))); }
    // a nebula far back
    { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); for (const [px, py, r, col] of [[90, 110, 110, 'rgba(140,70,200,.5)'], [170, 150, 90, 'rgba(50,120,200,.45)'], [140, 80, 70, 'rgba(220,90,160,.3)']]) { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
      const neb = new THREE.Mesh(new THREE.PlaneGeometry(420, 300), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); neb.rotation.y = Math.PI; neb.position.set(30, 10, 250); sky.add(neb); }
    // the planet you're orbiting, and its moon
    const pl = new THREE.Mesh(new THREE.SphereGeometry(26, 32, 20), new THREE.MeshBasicMaterial({ map: planetTex(S.orbit || 'earth'), fog: false })); pl.position.set(-30, -26, 120); sky.add(pl);
    { const a = new THREE.Mesh(new THREE.SphereGeometry(27.5, 32, 20), new THREE.MeshBasicMaterial({ color: '#8fd0ff', transparent: true, opacity: 0.18, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); a.position.copy(pl.position); sky.add(a); }
    const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), new THREE.MeshBasicMaterial({ map: planetTex('moon'), color: '#d8d4cc', fog: false })); moon.position.set(22, 10, 90); sky.add(moon);
    // tumbling rocks drifting past, near enough to show depth
    const rocks = []; for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + Math.random() * 1.2, 0), new THREE.MeshLambertMaterial({ color: new THREE.Color(['#6a6058', '#7a7068', '#5a524c'][i % 3]), emissive: new THREE.Color('#2a2420'), flatShading: true, fog: false }));
      const d = 9 + Math.random() * 40; r.position.set((Math.random() - 0.5) * d * 1.4, (Math.random() - 0.5) * d * 0.8, d); r.userData = { v: 0.4 + Math.random() * 1.2, sx: Math.random() * 2, sy: Math.random() * 2, w: d * 0.8 }; sky.add(r); rocks.push(r); }
    // dust right outside the glass
    const dn = 120, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { dp[i * 3] = (Math.random() - 0.5) * 8; dp[i * 3 + 1] = (Math.random() - 0.5) * 5; dp[i * 3 + 2] = 1 + Math.random() * 10; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#cfe6ff', size: 0.035, transparent: true, opacity: 0.6, fog: false, depthWrite: false })); sky.add(dust);
    let lt = null; levelAnims.push(t => { const dt = lt == null ? 0.016 : clamp(t - lt, 0, 0.05); lt = t; pl.rotation.y = t * 0.03; moon.position.x = 22 + Math.sin(t * 0.05) * 4;
      for (const r of rocks) { const u = r.userData; r.position.x += u.v * dt; if (r.position.x > u.w) r.position.x = -u.w; r.rotation.x += u.sx * dt * 0.3; r.rotation.y += u.sy * dt * 0.3; }
      const a = dg.attributes.position.array; for (let i = 0; i < dn; i++) { a[i * 3] += dt * 0.25; if (a[i * 3] > 4) a[i * 3] = -4; } dg.attributes.position.needsUpdate = true; });
  } catch (e) { console.warn('hall viewport', e); }
}; }

// ---- the hover cars hum low: on Velocity the engine is a deep magnetic drone instead of the old buzz ----
{ const _en = SFX.engine; SFX.engine = function (level, pitch) { if (LEVEL && LEVEL.id === 'speedway' && !LEVEL.fly && SFX.maghum) { _en.call(this, 0, 0); return SFX.maghum(level, pitch); } if (SFX.maghum) SFX.maghum(0, 0); return _en.apply(this, arguments); }; }

// ---- the car's lower cabin: knee panel, footwell, floor, pedals and sills, so the road never shows through under the dash ----
{ const _cb = cabinBuild; cabinBuild = function (g) { const r = _cb.apply(this, arguments);
  try { const C = CABIN.g, M = hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), fog: false }), lower = new THREE.Group(); C.add(lower);
    const carpet = M('#101216'), panel = M('#181b22'), trim = M('#2a2f38'), metal = M('#4a505c');
    part(lower, B(1.9, 0.5, 0.05), panel, 0, -0.66, -0.64); // knee panel under the dash face
    const fw = part(lower, B(1.8, 0.05, 0.5), carpet, 0, -0.86, -0.8); fw.rotation.x = -0.5; // footwell rising to the firewall
    part(lower, B(1.8, 0.04, 1.4), carpet, 0, -0.95, -0.1); // floor
    part(lower, B(0.2, 0.5, 1.1), panel, 0.3, -0.72, -0.15); // the center tunnel under the console
    for (const s of [-1, 1]) { part(lower, B(0.07, 0.45, 1.3), panel, s * 0.88, -0.78, -0.15); part(lower, B(0.08, 0.02, 1.3), trim, s * 0.86, -0.56, -0.15); }
    for (const [px, h] of [[-0.12, 0.09], [0.06, 0.07]]) { const pd = part(lower, B(0.07, h, 0.012), metal, px, -0.82, -0.86); pd.rotation.x = -0.45; }
    lower.traverse(o => { o.renderOrder = 5; });
  } catch (e) { console.warn('cabin floor', e); }
  return r; }; }
