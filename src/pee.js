// Game bible rule: anyone lying on the ground can be peed on (except the drunk in the Undercroft bar).
// peeable(obj, name) adds the prompt while obj is tipped flat (rotation.x near ±90°);
// peeable(obj, name) adds the "Piss on" prompt at obj's spot; peeOn() is the Vixen-quest animation, shared by everyone.
const PEE = { on: 0 };
const PEE_LINES = ["Ahhh. That's the stuff.", '(no response)', 'You write your initials. Most of them.'];
function peeable(o, name, lines, after) { if (!o) return; const w = V(0, 0, 0);
  const at = () => { let p = o; while (p && p !== levelGroup && p !== scene) p = p.parent; if (!p || !o.visible || Math.abs(o.rotation.x) < 1.2) return null; o.getWorldPosition(w); return w; };
  INTERACTS.push({ get x() { const p = !PEE.on && at(); return p ? p.x : 1e9; }, get z() { const p = at(); return p ? p.z : 1e9; }, r: 1.8, label: '💦 Piss on ' + name,
    fn: () => { const p = at(); if (p) peeOn(p.x, p.z, name, lines, after); } }); }
function peeOn(x, z, name, lines, after) { if (PEE.on) return; PEE.on = 1; lines = lines || PEE_LINES;
  player.yaw = Math.atan2(-(x - player.pos.x), -(z - player.pos.z)); player.pitch = -0.75; vm.visible = false;
  const g = new THREE.Group(); levelGroup.add(g); const mat = new THREE.MeshBasicMaterial({ color: '#f2d33a', transparent: true, opacity: 0.85 });
  const drops = []; for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), mat); g.add(m); drops.push([m, i / 40]); }
  const pud = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: '#d8b830', transparent: true, opacity: 0.6, depthWrite: false })); pud.rotation.x = -Math.PI / 2; pud.position.set(x, 0.03, z + 0.2); pud.scale.setScalar(0.01); levelGroup.add(pud);
  const t0 = performance.now(), dur = 5200; let hiss = 0;
  lines.forEach((L, i) => setTimeout(() => { const [t, l] = Array.isArray(L) ? L : [i === 1 ? name.toUpperCase() : '💦', L]; toast(t, l, 1.8); }, 400 + i * 1600));
  const anim = () => { const k = (performance.now() - t0) / dur; if (k >= 1 || !g.parent) { levelGroup.remove(g); PEE.on = 0; vm.visible = true; player.pitch = -0.2; if (after) after(); else toast('RELIEVED', name + ' will wake up smelling like a decision you made.', 2.6); return; } requestAnimationFrame(anim);
    const sx = player.pos.x + Math.sin(player.yaw) * -0.35, sz = player.pos.z + Math.cos(player.yaw) * -0.35, sy = player.pos.y + 0.95, flow = Math.min(1, k * 6, (1 - k) * 6);
    const tx = x + Math.sin(performance.now() / 300) * 0.25, tz = z + Math.cos(performance.now() / 410) * 0.3;
    for (const [m, ph] of drops) { const u = ((performance.now() / 600) + ph) % 1; m.visible = flow > ph * 0.8; m.position.set(sx + (tx - sx) * u, sy + (0.35 - sy) * u + Math.sin(u * Math.PI) * 0.55, sz + (tz - sz) * u); }
    pud.scale.setScalar(0.1 + k * 0.9); player.pitch = -0.75;
    if (performance.now() - hiss > 260) { hiss = performance.now(); if (typeof sfxHiss === 'function') sfxHiss(0.32, 0.12, 1800); if (Math.random() < 0.6) burst(V(tx, 0.4, tz), '#f2d33a', 2, 0.6); } };
  anim(); }
