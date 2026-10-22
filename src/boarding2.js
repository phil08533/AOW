// =================== BOARDING 2: detailed ship interiors. Grated decks, ribbed walls, pipes, and themed rooms ===================
const BTEX = {};
function bTex(key, draw, rx, ry) {
  if (!BTEX[key]) { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; BTEX[key] = t; }
  const t = BTEX[key].clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1); const m = toon('#ffffff', 'panel').clone(); m.map = t; m.color.set('#ffffff'); return m;
}
const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
// deck grating: diamond plate with drain slots
const texGrate = (col) => x => { x.fillStyle = shade(col, 0.9); x.fillRect(0, 0, 128, 128); for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.fillStyle = (i + j) % 2 ? shade(col, 1.25) : shade(col, 0.7); x.fillRect(i * 8 + 2, j * 8 + 3, 4, 2); }
  x.fillStyle = shade(col, 0.45); for (let k = 0; k < 4; k++) x.fillRect(0, k * 32, 128, 2); x.fillRect(62, 0, 4, 128); x.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 30; i++) x.fillRect((i * 53) % 128, (i * 37) % 128, 3 + i % 5, 2); };
// wall panels: ribs, rivets, a vent and grime
const texWall = (col, neon) => x => { x.fillStyle = col; x.fillRect(0, 0, 128, 128); x.fillStyle = shade(col, 0.6); x.fillRect(0, 0, 6, 128); x.fillRect(122, 0, 6, 128); x.fillRect(0, 60, 128, 5); x.fillStyle = shade(col, 1.35); x.fillRect(6, 0, 2, 128); x.fillRect(0, 65, 128, 1);
  x.fillStyle = shade(col, 0.5); for (const [a, b] of [[14, 8], [114, 8], [14, 54], [114, 54], [14, 74], [114, 74], [14, 120], [114, 120]]) { x.beginPath(); x.arc(a, b, 2.2, 0, 7); x.fill(); }
  x.fillStyle = shade(col, 0.4); x.fillRect(40, 84, 48, 22); x.fillStyle = shade(col, 0.8); for (let i = 0; i < 5; i++) x.fillRect(42, 86 + i * 4, 44, 2);
  x.fillStyle = neon; x.fillRect(24, 20, 6, 24); x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, 108, 128, 20); for (let i = 0; i < 12; i++) x.fillRect((i * 41) % 120, 110 + (i % 3) * 5, 8, 3); };
const texCeil = x => { x.fillStyle = '#1a1c22'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#2a2d34'; for (let i = 0; i < 4; i++) x.fillRect(0, i * 32 + 2, 128, 26); x.fillStyle = '#111'; for (let i = 0; i < 8; i++) x.fillRect(i * 16, 0, 2, 128); };
const texHaz = x => { x.fillStyle = '#ffd36a'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#16181c'; for (let i = -128; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 16, 0); x.lineTo(i + 144, 128); x.lineTo(i + 128, 128); x.fill(); } };
const texScreen = (col) => x => { x.fillStyle = '#04080c'; x.fillRect(0, 0, 128, 128); x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); for (let i = 0; i < 128; i += 4) x.lineTo(i, 64 + Math.sin(i * 0.12) * 22); x.stroke(); x.fillStyle = col; for (let i = 0; i < 6; i++) x.fillRect(8 + i * 19, 100 - (i * 13 % 30), 12, 20 + (i * 13 % 30)); x.font = '12px monospace'; x.fillText('SYS OK', 8, 16); x.fillText('HULL 71%', 64, 16); };

const ROOM_KINDS = ['armory', 'quarters', 'mess', 'cargo', 'comms', 'med', 'engine', 'brig'];
LEVELS.boarding.build = function () {
  const C = BOARD.cur || { type: 'derelict' }, T = HULK_TYPES[C.type], H = 5, W = 14, D = 34, seed = (C.id ? C.id.length * 7 + C.lv : 3);
  const rnd = i => (Math.sin(seed * 17.3 + i * 12.9) + 1) / 2;
  const floorM = bTex('fl' + T.floor, texGrate(T.floor), W, D), wallM = bTex('wa' + T.wall + T.neon, texWall(T.wall, T.neon), 1, 1), haz = bTex('haz', texHaz, 1, 1), ceilM = bTex('ce', texCeil, W / 2, D / 2);
  const fl = new THREE.PlaneGeometry(W * 2, D * 2); fl.rotateX(-Math.PI / 2); props.add(new THREE.Mesh(fl, floorM)); const ce = new THREE.Mesh(fl.clone(), ceilM); ce.rotation.x = Math.PI; ce.position.y = H; props.add(ce);
  // walls get their texture repeated by length so the panels stay square
  const wall = (x, z, w, d) => { const m = wallM.clone(); m.map = wallM.map.clone(); m.map.needsUpdate = true; m.map.repeat.set(Math.max(w, d) / 2.5, H / 2.5); part(props, B(w, H, d), m, x, H / 2, z); box(x, z, w / 2, d / 2); };
  wall(0, -D, W * 2, 0.6); wall(0, D, W * 2, 0.6); wall(-W, 0, 0.6, D * 2); wall(W, 0, 0.6, D * 2);
  const roomZ = [-25.5, -8.5, 8.5, 25.5];
  for (const sx of [-1, 1]) {
    let z0 = -D; for (const rz of roomZ) { const a = rz - 1.8, len = a - z0; if (len > 0.2) wall(sx * 3, z0 + len / 2, 0.4, len); z0 = rz + 1.8; }
    wall(sx * 3, (z0 + D) / 2, 0.4, D - z0);
    for (const zd of [-17, 0, 17]) wall(sx * 8.5, zd, 11, 0.4);
    // door frames: hazard-striped jambs, a lintel with a lit sign, and the slid-open door leaf
    roomZ.forEach((rz, ri) => { for (const k of [-1, 1]) part(props, B(0.5, H, 0.3), haz, sx * 3, H / 2, rz + k * 1.95); part(props, B(0.5, 0.8, 4.2), toon(shade(T.wall, 0.6), 'panel'), sx * 3, H - 0.4, rz);
      part(props, B(0.1, 0.3, 3.4), glow(T.neon), sx * 2.74, H - 0.95, rz); part(props, B(0.25, 3.2, 1.6), toon(shade(T.wall, 0.8), 'panel'), sx * 3, 1.6, rz + 2.8);
      const kind = ROOM_KINDS[(ri * 2 + (sx > 0 ? 1 : 0) + seed) % ROOM_KINDS.length];
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), new THREE.MeshBasicMaterial({ map: signTex(kind.toUpperCase(), '#0b0d11', T.neon) })); sg.position.set(sx * 2.72, H - 0.55, rz); sg.rotation.y = -sx * Math.PI / 2; props.add(sg);
      dressRoom(kind, sx * 8.5, rz, sx, T, rnd, ri * 2 + (sx > 0 ? 1 : 0)); });
  }
  // the corridor: pipes, cable trays, wall lights, floor strip lights and a central grate
  for (const sx of [-1, 1]) { part(props, Cy(0.15, 0.15, D * 2, 6), '#5d636c', sx * 2.2, H - 0.5, 0, Math.PI / 2); part(props, Cy(0.09, 0.09, D * 2, 6), '#8a5a3a', sx * 2.5, H - 0.8, 0, Math.PI / 2); part(props, B(0.5, 0.08, D * 2), '#2a2c32', sx * 1.6, H - 0.25, 0);
    for (let z = -D + 4; z < D; z += 8) { part(props, B(0.12, 0.6, 0.12), '#3a3d44', sx * 2.15, H - 0.9, z); if (!roomZ.some(rz => Math.abs(rz - z) < 2.4)) { part(props, B(0.1, 0.5, 1.1), glow(T.neon), sx * 2.78, 2.8, z); part(props, B(0.15, 0.7, 1.3), toon('#26282e', 'panel'), sx * 2.84, 2.8, z); } } }
  for (let z = -D + 3; z < D; z += 6) { part(props, B(1.2, 0.08, 0.4), glow(T.neon), 0, H - 0.05, z); for (const sx of [-1, 1]) part(props, B(0.1, 0.03, 0.6), glow(shade(T.neon, 0.7)), sx * 2.6, 0.02, z); }
  part(props, B(0.8, 0.02, D * 2 - 4), toon('#3a3d44', 'panel'), 0, 0.01, 0);
  // emergency lights
  for (const z of [-24, 0, 24]) { const l = new THREE.PointLight(new THREE.Color(T.light), 1.3, 24); l.position.set(0, H - 1, z); levelGroup.add(l); if (C.type === 'derelict') levelAnims.push(t => { l.intensity = Math.sin(t * 9 + z) > 0.7 ? 0.2 : 1.3; }); }
  // the airlock home: a round hatch in a hazard frame
  part(props, B(5.4, 4.8, 0.4), haz, 0, 2.4, D - 0.4); part(props, B(4.4, 4, 0.3), '#3a3d44', 0, 2.2, D - 0.55); part(props, new THREE.CircleGeometry(1.7, 20), glow('#4fd2ff'), 0, 2, D - 0.72, 0, Math.PI); part(props, new THREE.TorusGeometry(1.75, 0.12, 6, 20), '#9aa1aa', 0, 2, D - 0.72);
  for (let i = 0; i < 6; i++) part(props, B(0.2, 0.5, 0.15), '#9aa1aa', Math.cos(i * 1.05) * 1.75, 2 + Math.sin(i * 1.05) * 1.75, D - 0.8, 0, 0, i * 1.05);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.6), new THREE.MeshBasicMaterial({ map: signTex('AIRLOCK', '#0f1757', '#ffd75e') })); sg.position.set(0, 4.5, D - 0.75); sg.rotation.y = Math.PI; props.add(sg);
  INTERACTS.push({ x: 0, z: D - 2.5, r: 3.2, label: 'Airlock: back to your ship', fn: leaveBoarding });
  // the captain's bridge at the bow: a raised dais, a chair, wraparound screens
  part(props, B(10, 0.3, 6), toon(shade(T.floor, 1.2), 'panel'), 0, 0.15, -D + 3.4); part(props, B(10, 0.08, 0.2), haz, 0, 0.32, -D + 6.3);
  part(props, B(4, 1.2, 1.4), toon(T.trim, 'panel'), 0, 0.6, -D + 1.6); box(0, -D + 1.6, 2, 0.7);
  for (let i = -2; i <= 2; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshBasicMaterial({ map: (BTEX['sc' + T.neon] || (bTex('sc' + T.neon, texScreen(T.neon)), BTEX['sc' + T.neon])) })); s.position.set(i * 2, 2.6, -D + 0.35 + Math.abs(i) * 0.25); s.rotation.y = -i * 0.18; props.add(s); }
  part(props, Cy(0.15, 0.2, 0.6, 8), '#2a2c32', 0, 0.6, -D + 4); part(props, B(1.1, 0.25, 1), toon(T.trim, 'cloth'), 0, 1.0, -D + 4); part(props, B(1.1, 1.3, 0.2), toon(T.trim, 'cloth'), 0, 1.7, -D + 4.5); solid(0, -D + 4, 0.6);
  if (C.type === 'flagship') part(props, new THREE.CircleGeometry(2, 20), glow('#b3262c'), 0, 3.8, -D + 0.32);
  levelAnims.push(t => boardTick(t));
};
// furniture for each kind of room; kept against the walls so the middle of each room stays open for fights
function dressRoom(kind, cx, cz, sx, T, rnd, k) {
  const H = 5, out = cx + sx * 4.6, inn = cx - sx * 4.2, steel = '#5d636c', dk = '#2a2c32';
  const crate = (x, z, s, col) => { part(props, B(s, s, s), toon(col || '#6a5a3a', 'wood'), x, s / 2, z, 0, rnd(x + z) * 0.5); part(props, B(s * 1.02, s * 0.12, s * 1.02), toon(steel, 'panel'), x, s * 0.85, z, 0, rnd(x + z) * 0.5); box(x, z, s / 2, s / 2); };
  const barrel = (x, z, col) => { part(props, Cy(0.4, 0.4, 1.1, 10), toon(col, 'panel'), x, 0.55, z); part(props, Cy(0.42, 0.42, 0.08, 10), dk, x, 0.8, z); solid(x, z, 0.42); };
  const light = col => { part(props, B(2.4, 0.06, 0.6), glow(col), cx, 4.95, cz); };
  if (kind === 'cargo') { for (let i = 0; i < 4; i++) crate(out - sx * (i % 2) * 1.3, cz - 5.5 + i * 1.2 + (i > 1 ? 7.6 : 0), 1.1 + rnd(k * 9 + i) * 0.4, ['#6a5a3a', '#3a6cb8', '#6f7a3e', '#c8402f'][i]); crate(out, cz - 5.5, 1.0, '#7a6a4a'); part(props, B(1.2, 0.1, 1.2), toon('#8a6a3a', 'wood'), out, 2.4, cz + 1.5); for (let i = 0; i < 3; i++) barrel(inn + sx * i * 0.95, cz + 6, ['#c8402f', '#3a6cb8', '#c9a43a'][i]); light('#ffe7a8'); }
  else if (kind === 'quarters') { for (const z of [cz - 4.5, cz + 4.5]) { part(props, B(2.2, 0.5, 1.2), toon(dk, 'panel'), out - sx * 0.6, 0.5, z); part(props, B(2.0, 0.2, 1.0), toon('#8a8f9a', 'cloth'), out - sx * 0.6, 0.85, z); part(props, B(2.2, 0.15, 1.2), toon(dk, 'panel'), out - sx * 0.6, 2.2, z); part(props, B(2.0, 0.2, 1.0), toon('#6a4a8a', 'cloth'), out - sx * 0.6, 2.4, z); box(out - sx * 0.6, z, 1.1, 0.6); }
    for (let i = 0; i < 3; i++) { part(props, B(0.9, 2.4, 0.6), toon(steel, 'panel'), inn + sx * i * 0.95, 1.2, cz - 6.3); part(props, B(0.05, 0.4, 0.05), '#c9a43a', inn + sx * (i * 0.95 + 0.3), 1.4, cz - 5.98); } box(inn + sx * 0.95, cz - 6.3, 1.5, 0.3); light('#ffcf8a'); }
  else if (kind === 'mess') { part(props, B(2.2, 0.15, 5), toon('#8a6a3a', 'wood'), out - sx * 1.4, 1.0, cz); part(props, B(0.2, 1, 0.2), dk, out - sx * 1.4, 0.5, cz - 2); part(props, B(0.2, 1, 0.2), dk, out - sx * 1.4, 0.5, cz + 2); box(out - sx * 1.4, cz, 1.1, 2.5);
    for (let i = 0; i < 3; i++) { part(props, Cy(0.15, 0.15, 0.04, 8), '#e8eef2', out - sx * 1.4, 1.1, cz - 1.6 + i * 1.6); part(props, Cy(0.08, 0.06, 0.25, 6), '#c8402f', out - sx * 1.0, 1.2, cz - 1.2 + i * 1.6); }
    part(props, B(1.2, 2.2, 0.9), toon('#c8ccd4', 'panel'), inn, 1.1, cz - 6); part(props, B(0.6, 0.4, 0.05), glow('#4fd2ff'), inn, 1.6, cz - 5.54); box(inn, cz - 6, 0.6, 0.45); light('#fff6d0'); }
  else if (kind === 'armory') { for (let i = 0; i < 4; i++) { part(props, B(0.3, 2.6, 1.2), toon(dk, 'panel'), out, 1.3, cz - 4.5 + i * 3); for (let j = 0; j < 3; j++) part(props, B(0.12, 0.12, 1.0), toon(steel, 'panel'), out - sx * 0.25, 0.8 + j * 0.6, cz - 4.5 + i * 3); box(out, cz - 4.5 + i * 3, 0.2, 0.6); }
    crate(inn, cz + 5.6, 1.0, '#3a3d44'); part(props, B(1, 0.06, 0.6), glow('#ff3a2a'), inn, 1.02, cz + 5.6); light('#ff8a6a'); }
  else if (kind === 'comms') { part(props, B(1.2, 1.1, 6), toon(dk, 'panel'), out, 0.55, cz); box(out, cz, 0.6, 3); for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: (bTex('sc' + T.neon, texScreen(T.neon)), BTEX['sc' + T.neon]) })); s.position.set(out + sx * 0.3 - sx * 0.0, 2.0, cz - 2 + i * 2); s.rotation.y = -sx * Math.PI / 2; props.add(s); }
    for (let i = 0; i < 12; i++) part(props, B(0.08, 0.05, 0.08), glow(['#6fdc5a', '#ff3a2a', '#ffd36a'][i % 3]), out - sx * 0.62, 1.12, cz - 2.6 + i * 0.45); part(props, Cy(0.05, 0.05, 1.6, 4), steel, out, 4.0, cz + 4); part(props, new THREE.SphereGeometry(0.4, 10, 6, 0, 6.3, 0, 1.3), steel, out - sx * 0.3, 4.3, cz + 4); light('#8fd0ff'); }
  else if (kind === 'med') { for (const z of [cz - 4, cz + 4]) { part(props, B(2.2, 0.6, 1.0), toon('#e8eef2', 'panel'), out - sx * 0.8, 0.7, z); part(props, B(0.1, 1.6, 0.1), steel, out - sx * 0.1, 1.2, z - 0.6); part(props, B(0.5, 0.3, 0.05), glow('#6fdc5a'), out - sx * 0.1, 2.0, z - 0.6); box(out - sx * 0.8, z, 1.1, 0.5); }
    part(props, B(1.6, 1.8, 0.5), toon('#e8eef2', 'panel'), inn, 0.9, cz - 6.3); part(props, B(0.6, 0.6, 0.06), glow('#ff3a2a'), inn, 1.5, cz - 6.02); part(props, B(0.2, 0.6, 0.06), toon('#ffffff', 'panel'), inn, 1.5, cz - 5.98); box(inn, cz - 6.3, 0.8, 0.3); light('#e8f4ff'); }
  else if (kind === 'engine') { const core = part(props, Cy(1.1, 1.1, 4.6, 12), glow(T.neon), out - sx * 1.2, 2.3, cz); part(props, Cy(1.4, 1.4, 0.4, 12), toon(dk, 'panel'), out - sx * 1.2, 0.2, cz); part(props, Cy(1.4, 1.4, 0.4, 12), toon(dk, 'panel'), out - sx * 1.2, 4.6, cz); for (let i = 0; i < 4; i++) part(props, B(0.15, 4.6, 0.15), steel, out - sx * 1.2 + Math.cos(i * 1.57) * 1.25, 2.3, cz + Math.sin(i * 1.57) * 1.25); solid(out - sx * 1.2, cz, 1.5);
    levelAnims.push(t => { core.scale.set(1 + Math.sin(t * 6) * 0.05, 1, 1 + Math.sin(t * 6) * 0.05); });
    for (let i = 0; i < 4; i++) part(props, Cy(0.18, 0.18, 7, 6), ['#8a5a3a', '#5d636c'][i % 2], out - sx * (0.2 + i * 0.25), 4.2 - i * 0.25, cz, Math.PI / 2); barrel(inn, cz + 5.8, '#c9a43a'); barrel(inn + sx, cz + 5.8, '#c9a43a'); light(T.neon); }
  else if (kind === 'brig') { for (let i = 0; i < 9; i++) part(props, Cy(0.05, 0.05, H, 4), steel, out - sx * 2.2, H / 2, cz - 4 + i); box(out - sx * 2.2, cz, 0.1, 4.5); part(props, B(1.8, 0.4, 1), toon(dk, 'panel'), out - sx * 0.4, 0.4, cz + 2.5); box(out - sx * 0.4, cz + 2.5, 0.9, 0.5); part(props, B(0.5, 0.5, 0.5), toon(steel, 'panel'), out - sx * 0.6, 0.25, cz - 3); light('#ff6a5a'); }
  // every room: a wall console with a lit strip and a vent
  part(props, B(2.2, 1, 0.8), dk, cx + sx * 4.5, 0.5, cz + (kind === 'cargo' ? -2.2 : 0) + (kind === 'quarters' || kind === 'mess' ? 0 : 0), 0, Math.PI / 2); part(props, B(1.8, 0.05, 0.5), glow(k % 2 ? '#4fd2ff' : T.neon), cx + sx * 4.4, 1.05, cz + (kind === 'cargo' ? -2.2 : 0), 0, Math.PI / 2 + sx * 0.3);
  part(props, B(0.1, 0.7, 1.2), toon('#16181c', 'panel'), cx + sx * 5.1, 3.6, cz + 2.5);
}
