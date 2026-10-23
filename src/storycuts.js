// =================== STORY CUTS: boss intros, first-landing intros for each world, and a lit-up Tower of Death ===================
// Save: S.flags['bi_<enemy type>'] once a boss intro has played, S.flags['wi_<level id>'] once a world intro has played.
// Both use runCutscene, so the "Story scenes: Skip" setting skips them too.
const BOSS_INTRO = {
  drome: ['DROME', ["So the Corps sends a rookie. I'm insulted.", "Take one more step and your helmet goes on my wall."]],
  matriarch: ['THE GUT WORM MATRIARCH', ['The pit shudders. Something enormous uncoils out of the dark.', 'Every ant on Mezar was born from her. She does not like visitors.']],
  vask: ['COMMANDER VASK', ["Lio's little helper. Drop the weapon and I'll make it quick.", 'No? Good. I was hoping you would say no.']],
  frostking: ['THE FROST KING', ['You walk into my palace and bring warmth with you?', 'I will fix that.']],
  krank: ['FOREMAN KRANK', ['Shift is over, meatbag.', 'Permanently.']],
  overseer: ['THE OVERSEER', ['DELETION SCHEDULED.', 'Every unit that defied me stands in this yard. You will join them.'], 'tower'],
  leviathan: ['THE LEVIATHAN', ['The trench goes quiet. Then the water itself starts to move.']],
  excavator: ['THE EXCAVATOR', ['The drill spins up. It has noticed you.']],
  krag: ['WARLORD KRAG', ['Ironrock still stands? Not after tonight.', 'I will melt your fort down into my next suit of armor.']],
  dromeprime: ['DROME, LORD OF THE SETTING SUN', ['You keep surviving, Captain. It changes nothing.', 'The Setting Sun rises. Every world burns red.']],
  stormmother: ['THE STORM MOTHER', ['The sky over the spires turns black. She has come home.']],
  watcher: ['THE WATCHER IN THE MAW', ['It has watched a thousand worlds die.', 'Now it is watching you.']],
  rotking: ['THE ROT KING', ['The Heartwood rots, little seed.', 'And so will you.']],
  admiral: ['ADMIRAL SABLE', ['You boarded my flagship? Bold.', 'Brief, too.']],
  starling: ['PRESIDENT STARLING', ['Guards! ...Oh. You dealt with the guards.', 'Then let us negotiate. Everyone has a price.']]
};
function bossIntro(e, replay) {
  const B = BOSS_INTRO[e.sp.type] || [e.def.name.toUpperCase(), [e.def.name + '.']], o = e.obj, h = (e.def.hy || 1) * 2 * (e.sc || 1), P = () => o.position;
  const face = () => { const a = Math.atan2(player.pos.x - P().x, player.pos.z - P().z); o.rotation.y = a; return a; };
  const shots = [];
  if (B[2] === 'tower' && Z.tower) { const tx = Z.tower.x, tz = Z.tower.z - 10; shots.push({ text: 'The Tower of Death. Nothing that went inside ever came back out.', dur: 5.5, cam: (t, k) => { camera.position.set(tx + 10, 3 + k * 4, tz + 26); camera.lookAt(tx, 4 + k * 30, tz); } }); }
  shots.push({ text: B[1][0], dur: 4.5, cam: (t, k) => { const a = face(); camera.position.set(P().x + Math.sin(a + 0.5) * (h * 1.4 + 2.5 - k), P().y + h * 0.35, P().z + Math.cos(a + 0.5) * (h * 1.4 + 2.5 - k)); camera.lookAt(P().x, P().y + h * 0.75, P().z); } });
  if (B[1][1]) shots.push({ text: B[1][1], dur: 4.5, cam: (t, k) => { const a = face(); camera.position.set(P().x + Math.sin(a - 0.35) * (h * 1.0 + 1.4), P().y + h * 0.95, P().z + Math.cos(a - 0.35) * (h * 1.0 + 1.4)); camera.lookAt(P().x, P().y + h * 0.85, P().z); } });
  shots.push({ text: '', dur: 1.6, cam: (t, k) => { const d = V(P().x - player.pos.x, 0, P().z - player.pos.z).normalize(); camera.position.set(player.pos.x - d.x * 2.6 + d.z * 0.8, player.pos.y + 2.2, player.pos.z - d.z * 2.6 - d.x * 0.8); camera.lookAt(P().x, P().y + h * 0.6, P().z); } });
  runCutscene({ title: B[0], lock: 2, replay, shots, onEnd: () => { if (!replay) { S.flags['bi_' + e.sp.type] = 1; markDirty(); } e.aggro = true; } });
}
setInterval(() => { try {
  if (state !== 'play' || CUT.on || dlgOpen || !LEVEL || LEVEL.fly || !player.alive || (typeof BH !== 'undefined' && BH.cut)) return; S.flags = S.flags || {};
  for (const e of enemies) { if (e.dead || e.netRemote || e.sp.type === 'sable' || !(e.def.boss || BOSS_INTRO[e.sp.type]) || S.flags['bi_' + e.sp.type]) continue;
    if (e.obj.position.distanceTo(player.pos) < 24 && lineOfSight(player.pos.clone().add(V(0, 1.5, 0)), e.obj.position.clone().add(V(0, 1.2, 0)))) { bossIntro(e); return; } }
} catch (err) { console.warn('boss intro', err); } }, 300);

// ---------- first landing on each world ----------
const WORLD_INTRO = {
  mezar: 'Mezar. A desert world where the bugs built a city, and the city fights back.',
  capitone: 'Capitone. Giant trees, ferns taller than ships, and a winter that never ends up north.',
  robot: 'Robot City. Neon, chrome and police drones. The machines run everything here.',
  ocean: 'Ocean World. One island, a lot of water, and something big down in the trench.',
  skycity: 'Earth Sky. A floating city above the clouds, built by Drome and full of his droids.',
  zarlich: 'Zarlich. Storms that never stop, and spires that pull the lightning down.',
  vector: 'Vector. The last light at the edge of the map. The shades came from somewhere past it.',
  forestlife: 'The Forest of Life. Old, green, and slowly rotting from the heart out.',
  zeltac: 'The Zeltac. A ship the size of a city, with a mall, a senate and a lot of secrets.',
  underworld: 'The Underworld. Every planet has a hatch down here. Nobody asks what you came to buy.',
  bubblecity: 'Bubble City. Domes on the sea floor, and a lot of people who never want to go back up.',
  arena: 'Arena Prime. Fight, bet, and climb the ladder. The crowd always wants more.'
};
function worldIntro(id, replay) {
  const L = LEVELS[id], sp = L.spawn || { x: 0, z: 0 }, zs = (L.zones || []).filter(z => !z.safe && z.r >= 8).slice(0, 6), pick = [zs[0], zs[Math.floor(zs.length / 2)]].filter((z, i, a) => z && a.indexOf(z) === i), fh = (x, z) => { try { return floorAt(x, z); } catch (_) { return 0; } };
  const inner = id === 'zeltac', R0 = inner ? 16 : 70, H0 = inner ? 7 : 38;
  const shots = [{ text: WORLD_INTRO[id], dur: 6.5, cam: (t, k) => { const a = 0.4 + k * 0.6, r = R0 - k * (inner ? 4 : 20); camera.position.set((inner ? 0 : sp.x) + Math.sin(a) * r, fh(sp.x, sp.z) + H0 - k * (inner ? 2 : 12), (inner ? 0 : sp.z) + Math.cos(a) * r); camera.lookAt(inner ? 0 : sp.x, fh(sp.x, sp.z) + 2, inner ? 0 : sp.z); } }];
  for (const z of pick) shots.push({ text: `${z.name}${z.lvl ? ' · ' + z.lvl : ''}`, dur: 4, cam: (t, k) => { const a = t * 0.15 + 1, r = z.r * 1.4 + 8; camera.position.set(z.x + Math.sin(a) * r, fh(z.x, z.z) + 9 + z.r * 0.35, z.z + Math.cos(a) * r); camera.lookAt(z.x, fh(z.x, z.z) + 1.5, z.z); } });
  shots.push({ text: '', dur: 2, cam: (t, k) => { const p = player.pos; camera.position.set(p.x + Math.sin(player.yaw) * (6 - k * 6), p.y + 1.6 + 4 * (1 - k), p.z + Math.cos(player.yaw) * (6 - k * 6)); camera.lookAt(p.x - Math.sin(player.yaw) * 8, p.y + 1.4, p.z - Math.cos(player.yaw) * 8); } });
  camera.near = 0.4; camera.updateProjectionMatrix(); // a deeper near plane stops the striped floors on high flyover shots
  runCutscene({ lock: 3, replay, shots, onEnd: () => { camera.near = LEVEL.fly ? 0.5 : 0.03; camera.updateProjectionMatrix(); if (!replay) { S.flags['wi_' + id] = 1; markDirty(); } } });
}
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); S.flags = S.flags || {};
  if (WORLD_INTRO[id] && !S.flags['wi_' + id]) setTimeout(() => { if (LEVEL.id === id && state === 'play' && !CUT.on && !dlgOpen && !S.flags['wi_' + id]) worldIntro(id); }, 1100);
  return r; }; }
SCENES.push(['worlds', '🪐 World intros', () => Object.keys(WORLD_INTRO).some(k => S.flags && S.flags['wi_' + k]) || DEV_ALL, () => { const id = WORLD_INTRO[LEVEL.id] ? LEVEL.id : Object.keys(WORLD_INTRO).find(k => S.flags['wi_' + k]) || 'mezar'; if (LEVEL.id !== id) loadLevel(id); setTimeout(() => worldIntro(id, true), 900); }]);

// ---------- the Tower of Death: windows, searchlights, a breathing beacon ----------
{ const _b = LEVELS.robot.build; LEVELS.robot.build = function () { const r = _b.apply(this, arguments); try {
  const tx = Z.tower.x, tz = Z.tower.z - 10, y0 = groundH(tx, tz), G = new THREE.Group(); G.position.set(tx, y0, tz); props.add(G);
  const win = glow('#ff3a2a'), win2 = glow('#ffb040');
  for (let k = 0; k < 8; k++) { const w = 9 - k * 0.8, y = k * 4 + 1.9; for (let f = 0; f < 4; f++) { const n = Math.max(2, Math.floor(w / 1.6)); for (let i = 0; i < n; i++) { if ((i * 7 + k * 3 + f) % 5 === 0) continue; const off = -w / 2 + (i + 0.5) * w / n, m = (i + k + f) % 4 === 0 ? win2 : win, d = w / 2 + 0.03;
    const p = f === 0 ? [off, y, d] : f === 1 ? [off, y, -d] : f === 2 ? [d, y, off] : [-d, y, off]; part(G, B(f < 2 ? 0.35 : 0.04, 0.9, f < 2 ? 0.04 : 0.35), m, ...p); } } }
  const beams = [], bm = new THREE.MeshBasicMaterial({ color: '#ffe6b0', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < 4; i++) { const piv = new THREE.Group(); piv.position.set(i < 2 ? -1.3 : 1.3, 33.2, i % 2 ? -1.3 : 1.3); G.add(piv); part(piv, B(0.5, 0.4, 0.6), '#18191c', 0, 0, 0); part(piv, new THREE.CircleGeometry(0.2, 10), glow('#fff4d0'), 0, 0, 0.31);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 40, 14, 1, true), bm); cone.geometry.translate(0, -20, 0); cone.geometry.rotateX(-Math.PI / 2); piv.add(cone); piv.rotation.x = 0.55; beams.push(piv); }
  const gl = new THREE.PointLight('#ff3a2a', 1.6, 26); gl.position.set(0, 3, 7); G.add(gl);
  const beacon = new THREE.PointLight('#ff2a3a', 2, 60); beacon.position.set(0, 42, 0); G.add(beacon);
  levelAnims.push(t => { beams.forEach((b, i) => { b.rotation.y = t * 0.35 + i * Math.PI / 2; b.rotation.x = 0.5 + Math.sin(t * 0.4 + i) * 0.15; }); beacon.intensity = 1.2 + Math.sin(t * 2.2) * 1; });
} catch (err) { console.warn('tower lights', err); } return r; }; }

// ---------- ship screens: pull glowing panels a hair toward the camera so they stop z-fighting the consoles ----------
function shipScreenFix() { if (!LEVEL || LEVEL.id !== 'ship') return; levelGroup.traverse(o => { const m = o.material; if (!o.isMesh || !m || Array.isArray(m) || m.transparent) return;
  if (m.isMeshBasicMaterial || (m.emissive && m.emissive.getHex() > 0) || m.map && m.map.isCanvasTexture) { m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -4; } }); }
{ const _ll = loadLevel; loadLevel = function (id, o) { const r = _ll(id, o); if (id === 'ship') { shipScreenFix(); setTimeout(shipScreenFix, 1500); } return r; }; }
