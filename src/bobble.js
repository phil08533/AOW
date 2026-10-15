// =================== BOBBLEHEADS: little figures on your dash that wobble when you drive and fly ===================
// You earn them by doing things (see BOBBLES[].got). N swaps which one rides on the dash of your ship and your car.
const BOBBLES = [
  { id: 'burp', name: 'B.U.R.P.', how: 'Yours from the start', got: () => true },
  { id: 'vega', name: 'Captain Vega', how: 'Finish your first job for Vega', got: () => qDone('q1') },
  { id: 'dog', name: 'Wild Dog', how: 'Finish the dog hunt', got: () => qDone('q1') },
  { id: 'gus', name: 'Gus the Tuner', how: 'Win any race on Velocity', got: () => { const R = S.racing; return !!(R && R.wins && Object.values(R.wins).some(v => v > 0)); } },
  { id: 'hydran', name: 'Hydran', how: 'Ride the Halo Line', got: () => !!(S.halo && S.halo.runs > 0) },
  { id: 'raider', name: 'Drome Raider', how: 'Shoot down a raider in space', got: () => !!(S.flags && S.flags.bobRaider) },
  { id: 'drome', name: 'Drome', how: 'Defeat Drome', got: () => qDone('q5') },
  { id: 'eye', name: 'The Watcher', how: 'Defeat the Watcher in the Maw', got: () => !!(S.flags && S.flags.watcherDied) },
  { id: 'fish', name: 'Void Gulper', how: 'Catch a Void Gulper', got: () => !!(S.fishBest && S.fishBest.voidgulper) },
];
function bobbleMake(id) {
  const g = new THREE.Group(), M = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h).convertSRGBToLinear(), fog: false }), Gl = h => new THREE.MeshBasicMaterial({ color: new THREE.Color(h), fog: false });
  part(g, new THREE.CylinderGeometry(0.03, 0.034, 0.012, 14), M('#2a2e38'), 0, 0.006, 0);
  const body = new THREE.Group(); body.position.y = 0.012; g.add(body);
  const head = new THREE.Group(); head.position.y = 0.06; g.add(head);
  part(body, new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6), M('#8a909c'), 0, 0.03, 0); // the spring
  const bod = (c, w = 0.03, h = 0.035) => part(body, B(w, h, 0.02), M(c), 0, h / 2, 0);
  if (id === 'burp') { bod('#c9a43a'); part(head, B(0.045, 0.04, 0.035), M('#e0b840'), 0, 0.02, 0); part(head, B(0.032, 0.008, 0.002), Gl('#ff3a2a'), 0, 0.024, 0.018); part(head, B(0.003, 0.02, 0.003), M('#30333a'), 0, 0.05, 0); part(head, new THREE.SphereGeometry(0.004, 6, 4), Gl('#ff3a2a'), 0, 0.06, 0); }
  else if (id === 'vega') { bod('#2a4a7a'); part(head, new THREE.SphereGeometry(0.024, 10, 8), M('#e8c09a'), 0, 0.022, 0); part(head, B(0.05, 0.012, 0.05), M('#1e2a40'), 0, 0.044, 0); part(head, B(0.03, 0.01, 0.03), M('#1e2a40'), 0, 0.052, 0); part(head, B(0.012, 0.006, 0.002), Gl('#ffd36a'), 0, 0.05, 0.026); }
  else if (id === 'dog') { part(body, B(0.024, 0.02, 0.045), M('#3a2c2a'), 0, 0.014, 0); part(head, B(0.026, 0.026, 0.03), M('#4a3632'), 0, 0.016, 0.01); part(head, B(0.014, 0.012, 0.016), M('#4a3632'), 0, 0.01, 0.032); for (const s of [-1, 1]) { part(head, B(0.006, 0.014, 0.004), M('#2a1e1c'), s * 0.01, 0.034, 0.004); part(head, B(0.005, 0.005, 0.002), Gl('#ff2a2a'), s * 0.007, 0.02, 0.026); } }
  else if (id === 'gus') { bod('#ff7a2a'); part(head, new THREE.SphereGeometry(0.023, 10, 8), M('#c89070'), 0, 0.022, 0); part(head, B(0.05, 0.008, 0.03), M('#ff3b2a'), 0, 0.04, 0.01); part(head, B(0.034, 0.016, 0.034), M('#ff3b2a'), 0, 0.044, 0); part(head, B(0.03, 0.006, 0.004), M('#222'), 0, 0.022, 0.022); }
  else if (id === 'hydran') { const c = '#ff6af0'; part(head, new THREE.SphereGeometry(0.028, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, fog: false }), 0, 0.012, 0); part(head, new THREE.SphereGeometry(0.008, 8, 6), Gl('#ffffff'), 0, 0.018, 0); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; part(head, B(0.003, 0.03, 0.003), Gl(c), Math.cos(a) * 0.018, -0.004, Math.sin(a) * 0.018); } }
  else if (id === 'raider') { bod('#5a2a2a'); part(head, B(0.04, 0.034, 0.034), M('#3a3d44'), 0, 0.02, 0); part(head, B(0.03, 0.008, 0.002), Gl('#ff2a3a'), 0, 0.024, 0.018); for (const s of [-1, 1]) part(head, B(0.004, 0.02, 0.004), M('#2a2c32'), s * 0.016, 0.044, 0); }
  else if (id === 'drome') { bod('#1e1c22', 0.034, 0.04); part(head, B(0.04, 0.04, 0.036), M('#2a2830'), 0, 0.022, 0); for (const s of [-1, 1]) { part(head, new THREE.ConeGeometry(0.006, 0.026, 6), M('#7a1a1a'), s * 0.016, 0.054, 0); part(head, B(0.008, 0.004, 0.002), Gl('#ff6a1a'), s * 0.009, 0.026, 0.019); } }
  else if (id === 'eye') { part(head, new THREE.SphereGeometry(0.026, 14, 10), M('#e8e2d4'), 0, 0.02, 0); part(head, new THREE.CircleGeometry(0.014, 14), Gl('#ff3a1a'), 0, 0.02, 0.026); part(head, new THREE.CircleGeometry(0.006, 10), M('#08080a'), 0, 0.02, 0.0262); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; part(body, B(0.003, 0.03, 0.003), M('#5a3a3a'), Math.cos(a) * 0.014, 0.02, Math.sin(a) * 0.014); } }
  else if (id === 'fish') { part(head, B(0.05, 0.03, 0.024), M('#2a1e4a'), 0, 0.018, 0); part(head, B(0.02, 0.022, 0.004), M('#3a2a6a'), -0.032, 0.018, 0); part(head, B(0.024, 0.006, 0.026), Gl('#c86aff'), 0.016, 0.008, 0); part(head, B(0.004, 0.012, 0.004), M('#5a4a8a'), 0.014, 0.04, 0); part(head, new THREE.SphereGeometry(0.004, 6, 4), Gl('#ffd36a'), 0.014, 0.048, 0); }
  g.traverse(o => { o.renderOrder = 6; });
  g.userData = { head, ang: V(0, 0, 0), vel: V(0, 0, 0) }; return g;
}
const BOB = { mounts: new Map() };
const bobbleOwned = () => BOBBLES.filter(b => { try { return b.got(); } catch (_) { return false; } });
function bobbleCur() { const own = bobbleOwned(); const b = own.find(b => b.id === S.bobble) || own[0]; return b ? b.id : 'burp'; }
// put the current bobblehead on a mount (a Group on a dash) and keep it up to date
function bobbleMount(mount, scale) { if (!mount) return; const want = bobbleCur(); let m = BOB.mounts.get(mount); if (m && m.id === want) return m;
  if (m) mount.remove(m.g); const g = bobbleMake(want); g.scale.setScalar(scale || 1); mount.add(g); m = { id: want, g }; BOB.mounts.set(mount, m); return m; }
// spring physics: the head swings against how the vehicle turns and speeds up
function bobbleStep(m, dt, side, fwd) { if (!m) return; const u = m.g.userData, k = 90, d = 5.5; u.vel.x += (-u.ang.x * k - u.vel.x * d + fwd * 30) * dt; u.vel.z += (-u.ang.z * k - u.vel.z * d - side * 30) * dt; u.ang.x += u.vel.x * dt; u.ang.z += u.vel.z * dt; u.ang.x = clamp(u.ang.x, -0.7, 0.7); u.ang.z = clamp(u.ang.z, -0.7, 0.7); u.head.rotation.set(u.ang.x, 0, u.ang.z); }
function bobbleKick(m, s) { if (m) { const u = m.g.userData; u.vel.x += (Math.random() - 0.5) * s; u.vel.z += (Math.random() - 0.5) * s; } }
function bobbleNext() { const own = bobbleOwned(); if (!own.length) return; const i = own.findIndex(b => b.id === bobbleCur()); const b = own[(i + 1) % own.length]; S.bobble = b.id; markDirty(); SFX.ui(); toast('BOBBLEHEAD', `${b.name} · ${own.length}/${BOBBLES.length} collected`, 1.4); }
window.addEventListener('keydown', e => { if (e.code !== 'KeyN' || e.repeat || state !== 'play' || dlgOpen || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; if (!(LEVEL.fly || (typeof RC !== 'undefined' && RC.on))) return; bobbleNext(); }, true);
// tell the player when they earn a new one
setInterval(() => { if (!S || state === 'menu') return; S.bobSeen = S.bobSeen || ['burp']; for (const b of bobbleOwned()) if (!S.bobSeen.includes(b.id)) { S.bobSeen.push(b.id); markDirty(); toast('NEW BOBBLEHEAD', `${b.name} · on your dash now (N to swap)`, 3); S.bobble = b.id; } }, 2000);
// a raider kill counts for the raider bobblehead
{ const _kr = killRaider; killRaider = function (r) { const x = _kr.apply(this, arguments); S.flags = S.flags || {}; if (!S.flags.bobRaider) { S.flags.bobRaider = 1; markDirty(); } return x; }; }
// the car cabin's dash spot
{ const _st = step; step = function (dt) { _st(dt); if (typeof CABIN === 'undefined' || !CABIN.bob || !VEL.cock || !VEL.cock.visible) return;
  const m = bobbleMount(CABIN.bob, 1.6), sp = Math.hypot(RC.vx || 0, RC.vz || 0), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (move.x || 0);
  BOB.lastSp = BOB.lastSp == null ? sp : BOB.lastSp; const acc = (sp - BOB.lastSp) / Math.max(dt, 1e-3); BOB.lastSp = sp;
  bobbleStep(m, dt, st * Math.min(1, sp / 15), clamp(acc / 20, -1.5, 1.5)); if (FX.shake > 0.2) bobbleKick(m, 3); }; }
