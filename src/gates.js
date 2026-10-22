// =================== WARP GATES (2.22.51): the Forest of Life trail sign becomes a living warp gate ===================
{ const ob = LEVELS.earth.build; LEVELS.earth.build = function () { const r = ob.apply(this, arguments); try { warpGate(TOWN.x + 9, TOWN.z + 39, 'Trail to the Forest of Life', 'FOREST OF LIFE', 'forest'); warpGate(TOWN.x - 9, TOWN.z + 39, 'Shuttle to the Super Swift Arena', 'SUPER SWIFT ARENA', 'swift'); } catch (e) { console.warn('gate', e); } return r; }; }
function warpGate(x, z, lbl, title, kind) { const F = kind === 'forest', C1 = F ? '#7fff9a' : '#4fd2ff', C2 = F ? '#ffd36a' : '#ff8a2a';
  // retire the old wooden signpost
  const it = INTERACTS.find(i => i.label === lbl); if (it) it.label = '🌀 Step through the warp gate to the ' + (F ? 'Forest of Life' : 'Super Swift Arena');
  const g = new THREE.Group(), stone = F ? toon('#7a7468', 'stone') : toon('#3a3d44'), moss = F ? toon('#3f7a34') : toon('#2b2a2c'), bark = F ? toon('#5a3a22', 'wood') : toon('#9aa1aa');
  // stone dais with steps and glowing runes
  part(g, Cy(2.4, 2.6, 0.3, 16), stone, 0, 0.15, 0); part(g, Cy(2.0, 2.2, 0.2, 16), stone, 0, 0.4, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; part(g, B(0.3, 0.03, 0.12), glow(C1), Math.cos(a) * 1.75, 0.51, Math.sin(a) * 1.75, 0, -a, 0); }
  // twin root-wrapped pillars
  for (const s of [-1, 1]) { part(g, Cy(0.32, 0.42, 4.4, 8), stone, s * 1.9, 2.6, 0); for (let k = 0; k < 6; k++) { const v = part(g, new THREE.TorusGeometry(0.42, 0.08, 5, 10), bark, s * 1.9, 0.9 + k * 0.65, 0, Math.PI / 2 + 0.3, 0, k * 0.8); v.scale.y = 0.9; }
    for (let k = 0; k < 5; k++) part(g, new THREE.SphereGeometry(0.28, 7, 5), moss, s * (1.9 + (k % 2 ? 0.25 : -0.2)), 1.2 + k * 0.8, (k % 2 ? 0.25 : -0.25)); part(g, new THREE.SphereGeometry(0.22, 8, 6), glow(C1), s * 1.9, 4.95, 0); }
  // the ring: a big leafy arch around a swirling portal
  const ring = part(g, new THREE.TorusGeometry(1.75, 0.2, 8, 32), stone, 0, 2.5, 0); part(g, new THREE.TorusGeometry(1.6, 0.06, 6, 32), glow(C1), 0, 2.5, 0.12);
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; part(g, new THREE.SphereGeometry(0.26 + (i % 3) * 0.06, 7, 5), i % 4 ? moss : glow(C2), Math.cos(a) * 1.85, 2.5 + Math.sin(a) * 1.85, 0.05); }
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), gr = c.createRadialGradient(128, 128, 8, 128, 128, 128);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, F ? '#b8ffcf' : '#b8f0ff'); gr.addColorStop(0.6, F ? '#2fbf6a' : '#2a7ad0'); gr.addColorStop(1, F ? '#0a3a2a' : '#0a1a3a'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5; for (let k = 0; k < 5; k++) { c.beginPath(); for (let t = 0; t < 60; t++) { const a = k * 1.256 + t * 0.12, r = 6 + t * 2; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } c.stroke(); }
  const tex = new THREE.CanvasTexture(cv); const disc = new THREE.Mesh(new THREE.CircleGeometry(1.58, 40), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); disc.position.set(0, 2.5, 0); g.add(disc);
  const pl = new THREE.PointLight(C1, 1.6, 10); pl.position.set(0, 2.5, 1); g.add(pl);
  // drifting motes pulled into the gate
  const motes = []; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 4), glow(i % 3 ? C1 : C2)); g.add(m); motes.push([m, Math.random() * 6.28, Math.random()]); }
  // sign above the arch
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: signTex(title, F ? '#1e3a1e' : '#1a1e2a', F ? '#b8ffcf' : '#ffd36a'), side: THREE.DoubleSide })); sp.position.set(0, 5.35, 0.1); g.add(sp);
  at(g, x, z, Math.PI); for (const s of [-1, 1]) solid(x + s * 1.9, z, 0.5);
  levelAnims.push(t => { disc.rotation.z = -t * 1.2; pl.intensity = 1.4 + Math.sin(t * 2.3) * 0.4;
    for (const [m, a0, k] of motes) { const u = (t * 0.35 + k) % 1, a = a0 + t * 1.5, r = 2.6 * (1 - u); m.position.set(Math.cos(a) * r, 2.5 + Math.sin(a) * r, (1 - u) * 1.2); } });
  // stepping through: a green flash before the jump
  if (it) { const f0 = it.fn; it.fn = () => { try { SFX.zap && SFX.zap(); } catch (_) {} const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;background:radial-gradient(circle,#ffffff,' + C1 + ' 40%,#000);opacity:0;transition:opacity .45s'; document.body.appendChild(o); requestAnimationFrame(() => o.style.opacity = 1); setTimeout(() => { f0(); o.style.opacity = 0; setTimeout(() => o.remove(), 600); }, 480); }; }
}
