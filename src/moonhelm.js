// =================== MOON HELMETS (2.23.32): anyone out on the Moon's surface wears a glass bubble and an air pack ===================
// Inside Luna Dome the bubble comes off. Checked twice a second, so walkers and NPCs who stroll out the airlock suit up.
const MH_RIGS = ['civ', 'trooper', 'maxurge', 'elismas'];
let MH_GLASS = null;
function mhSuit(o) { const R = o.userData.rig; if (o.userData.mh || !R || !R.head || !R.torso) return o.userData.mh; const sp = R.spec;
  if (!MH_GLASS) MH_GLASS = new THREE.MeshPhongMaterial({ color: '#d8f0ff', transparent: true, opacity: 0.22, shininess: 120, specular: '#ffffff', depthWrite: false });
  const h = new THREE.Group(), y = 1.78 - sp.neck; part(h, new THREE.SphereGeometry(0.25, 16, 12), MH_GLASS, 0, y, 0.01); part(h, new THREE.TorusGeometry(0.17, 0.035, 6, 16), '#c8ccd4', 0, 1.6 - sp.neck, 0, Math.PI / 2);
  part(h, new THREE.SphereGeometry(0.04, 6, 4), glow('#7fe8ff'), 0.12, 1.6 - sp.neck, 0.11); R.head.add(h);
  const t = new THREE.Group(); part(t, B(0.3, 0.42, 0.14), '#e8e4dc', 0, 1.3 - sp.hip, -0.2); for (const s of [-1, 1]) part(t, Cy(0.055, 0.055, 0.4, 8), '#9aa1aa', s * 0.08, 1.32 - sp.hip, -0.3); part(t, B(0.08, 0.03, 0.02), glow('#6fdc5a'), 0.08, 1.45 - sp.hip, -0.13); R.torso.add(t);
  return (o.userData.mh = [h, t]); }
setInterval(() => { try { if (!LEVEL || LEVEL.id !== 'moon') return; const seen = new Set();
  const check = o => { if (!o || seen.has(o) || !o.userData || !o.userData.rig) return; seen.add(o); const R = o.userData.rig; if (!MH_RIGS.some(k => RIGS[k] === R.spec)) return;
    if (typeof enemies !== 'undefined' && enemies.some(e => e.obj === o)) return;
    const out = Math.hypot(o.position.x - DOME[0], o.position.z - DOME[1]) > 15.5, m = out ? mhSuit(o) : o.userData.mh; if (m) m.forEach(g => g.visible = out); };
  levelGroup.children.forEach(check); scene.children.forEach(check); if (typeof npcObjs !== 'undefined') for (const id in npcObjs) check(npcObjs[id].obj);
} catch (_) {} }, 500);
