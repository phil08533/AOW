// =================== the Marshal Office, reworked: a gold star on the wall, a wanted board, a gun rack, a banner, a star in the floor
// and a red-blue light bar over the holding cell. Added on top of officePerks (marshal2.js), so the terminal, locker and cell stay put.
function mrWanted(name, k, got) { const c = document.createElement('canvas'); c.width = 96; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#e8dcb8'; x.fillRect(0, 0, 96, 128); x.fillStyle = '#5a1a12'; x.font = '900 20px serif'; x.textAlign = 'center'; x.fillText('WANTED', 48, 22);
  x.fillStyle = ['#6a5a4a', '#4a5a6a', '#5a4a6a', '#6a4a4a'][k % 4]; x.fillRect(24, 30, 48, 50); x.fillStyle = '#d8b890'; x.beginPath(); x.arc(48, 52, 13, 0, 7); x.fill(); x.fillRect(32, 66, 32, 14);
  x.fillStyle = '#1e1a18'; x.font = '700 10px sans-serif'; x.fillText(name.length > 16 ? name.slice(0, 15) + '…' : name, 48, 96); x.font = '700 11px sans-serif'; x.fillText((2 + k) * 500 + ' CR', 48, 114);
  if (got) { x.strokeStyle = '#c8201a'; x.lineWidth = 7; x.beginPath(); x.moveTo(10, 10); x.lineTo(86, 118); x.moveTo(86, 10); x.lineTo(10, 118); x.stroke(); }
  return new THREE.CanvasTexture(c); }
function mrDress(cx, cz, inner, outer) { const sd = Math.sign(outer - cx), wx = outer - sd * 0.26, ry = sd > 0 ? -Math.PI / 2 : Math.PI / 2, gold = toon('#e8b83a'), navy = toonNS('#16204a');
  const onWall = (g, z, y) => { g.position.set(wx, y, z); g.rotation.y = ry; props.add(g); return g; };
  // the big star over the terminal
  { const g = new THREE.Group(); part(g, Cy(0.42, 0.42, 0.04, 28), navy, 0, 0, 0, Math.PI / 2, 0, 0); part(g, new THREE.TorusGeometry(0.42, 0.025, 6, 28), gold, 0, 0, 0.02);
    const st = new THREE.Mesh(new THREE.ExtrudeGeometry(mb3Star(0.36, 0.2, 7), { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 1 }), gold); st.position.z = 0.03; g.add(st);
    part(g, Cy(0.13, 0.13, 0.03, 20), navy, 0, 0, 0.09, Math.PI / 2, 0, 0); part(g, new THREE.OctahedronGeometry(0.06, 0), glow('#ffd36a'), 0, 0, 0.12); g.scale.setScalar(0.8); onWall(g, cz, 2.8);
    const L = new THREE.PointLight(new THREE.Color('#ffd890'), 0.8, 5); L.position.set(wx - sd * 0.8, 2.7, cz); props.add(L); }
  // wanted board: the Marshals' fugitive list, the ones you've caught crossed out
  { const g = new THREE.Group(), busts = mS().busts || 0; part(g, B(1.5, 1.25, 0.04), toonNS('#5a4030', 'wood'), 0, 0, 0); part(g, B(1.6, 0.06, 0.06), gold, 0, 0.66, 0.02);
    for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.52), new THREE.MeshBasicMaterial({ map: mrWanted(M_FUGS[k % M_FUGS.length], k, k < busts) })); m.position.set(-0.48 + (k % 3) * 0.48, 0.28 - Math.floor(k / 3) * 0.58, 0.025); m.rotation.z = (k % 2 ? 1 : -1) * 0.04; g.add(m); }
    onWall(g, cz + 1.75, 1.7); }
  // gun rack: three long guns behind a gold rail
  { const g = new THREE.Group(); part(g, B(0.95, 1.3, 0.05), toonNS('#2a2e36'), 0, 0, 0); for (let i = 0; i < 3; i++) { const x = -0.3 + i * 0.3; part(g, B(0.06, 1.05, 0.08), toonNS('#1e1c22'), x, 0, 0.07); part(g, B(0.09, 0.32, 0.1), toonNS('#5a3a22', 'wood'), x, -0.38, 0.07); part(g, B(0.03, 0.04, 0.05), glow('#4fd2ff'), x, 0.3, 0.12); }
    part(g, B(0.95, 0.04, 0.06), gold, 0, -0.1, 0.13); onWall(g, cz + 3.45, 1.5); }
  // a navy banner with the star
  { const g = new THREE.Group(); const c = document.createElement('canvas'); c.width = 64; c.height = 160; const x = c.getContext('2d'); x.fillStyle = '#16204a'; x.fillRect(0, 0, 64, 160); x.fillStyle = '#e8b83a'; x.fillRect(0, 0, 64, 8); x.beginPath(); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + i * Math.PI / 7, R = i % 2 ? 11 : 22; x.lineTo(32 + Math.cos(a) * R, 62 + Math.sin(a) * R); } x.fill(); x.font = '700 9px sans-serif'; x.textAlign = 'center'; x.fillText('GALACTIC', 32, 106); x.fillText('MARSHALS', 32, 118); x.beginPath(); x.moveTo(0, 150); x.lineTo(32, 160); x.lineTo(64, 150); x.lineTo(64, 160); x.lineTo(0, 160); x.fill();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); m.position.z = 0.03; g.add(m); part(g, Cy(0.02, 0.02, 0.75, 6), gold, 0, 0.8, 0.04, 0, 0, Math.PI / 2); onWall(g, cz - 3.5, 1.9); }
  // a gold star set into the floor
  { const st = new THREE.Mesh(new THREE.ShapeGeometry(mb3Star(0.8, 0.45, 7)), gold); st.rotation.x = -Math.PI / 2; st.position.set(cx, 0.045, cz); props.add(st);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.02, 40), gold); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 0.045, cz); props.add(ring); }
  // light bar over the holding cell, flashing red and blue
  { const r = part(props, B(0.5, 0.12, 0.16), glow('#ff2a2a'), cx - 0.3, 2.34, cz - 2.9), b = part(props, B(0.5, 0.12, 0.16), glow('#2a6aff'), cx + 0.3, 2.34, cz - 2.9); part(props, B(1.2, 0.05, 0.2), toonNS('#2a2e36'), cx, 2.26, cz - 2.9);
    const L = new THREE.PointLight(0xff2a2a, 0.9, 5); L.position.set(cx, 2.6, cz - 2.6); props.add(L);
    levelAnims.push(t => { const on = Math.floor(t * 3) % 2; r.material = glow(on ? '#ff2a2a' : '#3a0a0a'); b.material = glow(on ? '#0a1430' : '#2a6aff'); L.color.set(on ? 0xff2a2a : 0x2a6aff); }); } }
{ const f0 = officePerks; officePerks = function (cx, cz, inner, outer) { const r = f0.apply(this, arguments); try { mrDress(cx, cz, inner, outer); } catch (e) { console.warn('mroom', e); } return r; }; }
