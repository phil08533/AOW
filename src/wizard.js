// =================== WIZARDRY: the notebook's staff line (Lvl 1 → 100), new elements, Merla the Wizard, robes and a hat ===================
Object.assign(GUNS, {
  w_1: { name: 'Lvl 1 Apprentice Staff', dmg: 22, rate: 0.4, mag: 16, reload: 1.2, req: 1, price: 300, col: '#9fd8ff', kind: 'mystic', elem: 'arcane', mana: true, staff: 'crystal' },
  w_10: { name: 'Lvl 10 Ember Staff', dmg: 30, rate: 0.4, mag: 16, reload: 1.3, req: 4, price: 1200, col: '#ff6a1a', kind: 'mystic', elem: 'flame', mana: true, staff: 'flame' },
  w_20: { name: 'Lvl 20 Lightning Staff', dmg: 45, rate: 0.45, mag: 14, reload: 1.4, req: 8, price: 2600, col: '#8fe3ff', kind: 'mystic', elem: 'storm', mana: true, staff: 'rings' },
  w_30: { name: 'Lvl 30 Glacier Staff', dmg: 70, rate: 0.5, mag: 14, reload: 1.4, req: 12, price: 4800, col: '#bfefff', kind: 'mystic', elem: 'frost', mana: true, staff: 'crystal' },
  w_40: { name: 'Lvl 40 Plague Staff', dmg: 95, rate: 0.5, mag: 14, reload: 1.5, req: 16, price: 8000, col: '#7fff6a', kind: 'mystic', elem: 'poison', mana: true, staff: 'skull' },
  w_50: { name: 'Lvl 50 Blast Staff', dmg: 160, rate: 0.8, mag: 10, reload: 1.6, req: 20, price: 13000, col: '#ffb347', kind: 'mystic', elem: 'blast', splash: 4, mana: true, staff: 'orb' },
  w_60: { name: 'Lvl 60 Archmage Staff', dmg: 150, rate: 0.4, mag: 16, reload: 1.5, req: 24, price: 20000, col: '#c86aff', kind: 'mystic', elem: 'arcane', mana: true, staff: 'rings', arc: 3 },
  w_70: { name: 'Lvl 70 Stormcaller', dmg: 260, rate: 0.55, mag: 12, reload: 1.6, req: 28, price: 30000, col: '#4fd2ff', kind: 'mystic', elem: 'storm', mana: true, staff: 'rings' },
  w_80: { name: 'Lvl 80 Inferno Staff', dmg: 420, rate: 0.9, mag: 8, reload: 1.8, req: 32, price: 45000, col: '#ff3b2a', kind: 'mystic', elem: 'sun', splash: 5, mana: true, staff: 'flame' },
  w_90: { name: 'Lvl 90 Void Staff', dmg: 600, rate: 1.0, mag: 6, reload: 2.0, req: 36, price: 65000, col: '#9b6bff', kind: 'mystic', elem: 'void', splash: 6, mana: true, staff: 'orb' },
  w_100: { name: 'Lvl 100 Staff of the Setting Sun', dmg: 180, rate: 0.14, mag: 40, reload: 1.8, req: 40, price: 0, col: '#ffd36a', kind: 'mystic', elem: 'setsun', mana: true, staff: 'sun' },
});
// staff models: a long shaft along the barrel axis with a head that matches the element
{ const _mm = makeMysticModel; makeMysticModel = function (id) {
  const G = GUNS[id]; if (!G || !G.staff) return _mm(id);
  const g = new THREE.Group(), col = G.col, wood = id === 'w_100' ? '#3a1e10' : G.req >= 20 ? '#2a1e3a' : '#6a4a2a';
  part(g, Cy(0.016, 0.022, 0.86, 6), toon(wood, 'wood'), 0, 0, 0.12, Math.PI / 2);
  for (const z of [-0.12, 0.2]) part(g, Cy(0.026, 0.026, 0.03, 8), toon('#c9a43a'), 0, 0, z, Math.PI / 2);
  const hz = 0.58; let orb;
  if (G.staff === 'crystal') { for (const s of [-1, 1]) part(g, Cy(0.006, 0.01, 0.12, 4), toon(wood, 'wood'), s * 0.04, 0, hz - 0.03, Math.PI / 2, 0, s * 0.4); orb = part(g, new THREE.OctahedronGeometry(0.055, 0), glow(col), 0, 0, hz + 0.02); orb.scale.set(0.8, 0.8, 1.5); }
  if (G.staff === 'flame') { for (let k = 0; k < 4; k++) part(g, new THREE.ConeGeometry(0.018, 0.1, 4), toon('#2a1a12'), Math.cos(k * 1.57) * 0.04, Math.sin(k * 1.57) * 0.04, hz, Math.PI / 2); orb = part(g, new THREE.SphereGeometry(0.045, 8, 6), glow(col), 0, 0, hz + 0.03); }
  if (G.staff === 'rings') { for (let k = 0; k < 3; k++) part(g, new THREE.TorusGeometry(0.05 + k * 0.014, 0.006, 5, 12), glow(col), 0, 0, hz - 0.04 + k * 0.03); orb = part(g, new THREE.IcosahedronGeometry(0.04, 0), glow('#ffffff'), 0, 0, hz + 0.02); }
  if (G.staff === 'skull') { part(g, B(0.08, 0.07, 0.08), '#e8e4dc', 0, 0, hz); for (const s of [-1, 1]) part(g, B(0.02, 0.02, 0.01), glow(col), s * 0.018, 0.012, hz + 0.041); orb = part(g, new THREE.SphereGeometry(0.02, 6, 4), glow(col), 0, 0.06, hz); }
  if (G.staff === 'orb') { part(g, new THREE.TorusGeometry(0.07, 0.01, 5, 14), toon('#c9a43a'), 0, 0, hz, 0, Math.PI / 2); orb = part(g, new THREE.SphereGeometry(0.055, 10, 8), glow(col), 0, 0, hz); }
  if (G.staff === 'sun') { for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.012, 0.09, 4), glow('#ff9a3c'), Math.cos(a) * 0.075, Math.sin(a) * 0.075, hz, 0, 0, a - Math.PI / 2); } part(g, new THREE.TorusGeometry(0.06, 0.01, 5, 16), toon('#c9a43a'), 0, 0, hz); orb = part(g, new THREE.SphereGeometry(0.045, 10, 8), glow(col), 0, 0, hz); }
  g.userData.orb = orb; return g;
}; }
// new elements: arcane sparks, frost (slow + freeze), blast, and the Setting Sun (burn + chain)
{ const _mh = mysticHit; mysticHit = function (G, e, end, dmg0, hitOne) {
  if (G.elem === 'arcane') { let n = 0; for (const f of enemies) { if (n >= (G.arc || 1) || f.dead || f === e) continue; if (f.obj.position.distanceTo(e.obj.position) < 7) { tracer(end.clone(), f.obj.position.clone().add(V(0, f.def.hy * f.sc, 0)), G.col); hitOne(f, dmg0 * 0.45); n++; } } burst(end, G.col, 8, 3); return; }
  if (G.elem === 'frost') { e.slow = 3; if (Math.random() < 0.3 && !e.def.boss) { e.frozen = 1.6; e.frozenAt = e.obj.position.clone(); burst(end, '#ffffff', 16, 3); } burst(end, '#bfefff', 10, 3); return; }
  if (G.elem === 'setsun') { e.burn = { t: 3, dps: dmg0 * 0.4 }; let from = end.clone(), n = 0; for (const f of enemies) { if (n >= 2 || f.dead || f === e) continue; if (f.obj.position.distanceTo(e.obj.position) < 9) { const to = f.obj.position.clone().add(V(0, f.def.hy * f.sc, 0)); tracer(from, to, '#ff9a3c'); hitOne(f, dmg0 * 0.6); f.burn = { t: 2, dps: dmg0 * 0.25 }; from = to; n++; } } burst(end, '#ffd36a', 12, 5); return; }
  return _mh(G, e, end, dmg0, hitOne);
}; }
{ const _ma = mysticArea; mysticArea = function (G, end, dmg0, hitOne) {
  if (G.elem === 'blast') { burst(end, '#ffb347', 26, 9); burst(end, '#ff3b2a', 14, 6); if (typeof shake === 'function') shake(0.25); for (const f of enemies) { if (f.dead) continue; const d = f.obj.position.distanceTo(end); if (d < G.splash + f.def.r * f.sc) hitOne(f, dmg0 * (1 - 0.6 * d / (G.splash + 1))); } return true; }
  return _ma(G, end, dmg0, hitOne);
}; }
{ const _tm = tickMystic; tickMystic = function (e, dt) {
  if (e.frozen > 0) { e.frozen -= dt; if (e.frozenAt) { e.obj.position.x = e.frozenAt.x; e.obj.position.z = e.frozenAt.z; } e.cd = Math.max(e.cd, 0.25); if (Math.random() < dt * 6) burst(e.obj.position.clone().add(V(0, e.def.hy * e.sc, 0)), '#dff6ff', 1, 1); }
  return _tm(e, dt);
}; }
// ---- Merla the Wizard: New Jamestown's staff shop and trainer ----
function makeWizard(robe, trim) {
  const g = makeCivilian(robe, robe, '#e0b892', '#e8e4dc', trim);
  part(g, Cy(0.2, 0.34, 0.95, 10), toon(robe, 'cloth'), 0, 0.5, 0);
  part(g, Cy(0.3, 0.3, 0.03, 14), toon(robe, 'cloth'), 0, 1.86, 0); const hat = part(g, new THREE.ConeGeometry(0.17, 0.5, 10), toon(robe, 'cloth'), 0, 2.1, -0.02, -0.15);
  part(g, Cy(0.172, 0.172, 0.05, 10), toon(trim), 0, 1.9, 0); for (let k = 0; k < 3; k++) part(g, new THREE.OctahedronGeometry(0.025, 0), glow('#ffd36a'), Math.cos(k * 2) * 0.12, 1.98 + k * 0.08, 0.1);
  E(g, '#e8e4dc', 0, 1.62, 0.12, 0.1, 0.16, 0.06);
  const st = new THREE.Group(); part(st, Cy(0.018, 0.022, 1.7, 6), toon('#4a3a5a', 'wood'), 0, 0.85, 0); part(st, new THREE.OctahedronGeometry(0.07, 0), glow('#9fd8ff'), 0, 1.78, 0); st.position.set(0.4, 0, 0.1); g.add(st);
  return g;
}
JT_POS.merla = [7.5, 7.5, -2.4];
if (!JT_POS.tailor && JT_POS.ada) JT_POS.tailor = JT_POS.ada;
{ const L = LEVELS.earth; const npc = { id: 'merla', name: 'Merla the Wizard', role: 'Staffs · wizardry', rig: 'civ', make: () => makeWizard('#3a2a6a', '#c9a43a'), x: JT_POS.merla[0], z: JT_POS.merla[1], face: JT_POS.merla[2], shop: 'guns', guns: ['w_1', 'w_10', 'w_20', 'w_30'],
  idle: ["Staffs don't run out of ammo, dear. They run out of patience. Give them a breath and they're ready again.", "Fire, frost, lightning, plague. Pick the one that matches your temper.", "Maxurge taught me. Well. He yelled and I learned."] };
  L.npcs.push(npc); }
{ const mx = LEVELS.capitone.npcs.find(n => n.id === 'maxurge'); if (mx) { mx.shop = mx.shop || 'guns'; mx.guns = [...(mx.guns || []), 'w_40', 'w_50', 'w_60']; } }
{ const ix = LEVELS.zeltac.npcs.find(n => n.id === 'ixa'); if (ix) ix.guns = [...ix.guns, 'w_70', 'w_80', 'w_90']; }
// ---- robes and a proper pointed hat in the Wardrobe ----
ARMORS.wizard = { name: 'Wizard Robes', lvl: 5, cost: 900, def: 0.06, body: '#3a2a6a', trim: '#c9a43a', visor: '#9fd8ff', note: 'Long robes with gold trim, from the staff pages' };
ARMOR_KITS.wizard = (g, A) => { part(g, Cy(0.24, 0.4, 0.95, 10), toon(A.body, 'cloth'), 0, 0.5, 0); part(g, Cy(0.25, 0.25, 0.06, 10), toon(A.trim), 0, 0.92, 0); for (const s of [-1, 1]) part(g, Cy(0.07, 0.12, 0.42, 6), toon(A.body, 'cloth'), 0.34 * s, 1.1, 0); for (let k = 0; k < 5; k++) part(g, new THREE.OctahedronGeometry(0.025, 0), glow('#ffd36a'), Math.cos(k * 1.3) * 0.3, 0.3 + k * 0.12, Math.sin(k * 1.3) * 0.3); };
HELMS.wizhat = { name: 'Wizard Hat', lvl: 5 };
HELM_KITS.wizhat = function (g) {
  part(g, Cy(0.3, 0.3, 0.03, 14), toon('#3a2a6a', 'cloth'), 0, 1.92, 0);
  part(g, new THREE.ConeGeometry(0.17, 0.55, 10), toon('#3a2a6a', 'cloth'), 0, 2.2, -0.03, -0.18);
  part(g, Cy(0.172, 0.172, 0.05, 10), toon('#c9a43a'), 0, 1.96, 0);
  part(g, new THREE.OctahedronGeometry(0.03, 0), glow('#ffd36a'), 0.08, 2.08, 0.12);
};
{ const _mp = makePlayerChar; makePlayerChar = function (look, col) { const g = _mp(look, col); if (look && look.h === 'wizhat' && !g.userData._wizHat) { g.userData._wizHat = true; HELM_KITS.wizhat(g); } return g; }; }
// ---- the Wizard's path: three quests from Merla ----
{ const _k = kill; kill = function (e) { const r = _k(e); try { if (!handMelee() && GUNS[S.gun] && GUNS[S.gun].kind === 'mystic') questProgressKill('staffkill'); } catch (_) {} return r; }; }
const giveGun = id => { if (!S.guns.includes(id)) S.guns.push(id); S.gun = id; log(`${GUNS[id].name} added to your guns and equipped.`, 'loot'); };
defQuest('wz1', { ch: 'Earth · The Wizard\'s Path', title: 'A Spark of Talent', giver: 'merla', turnIn: 'merla', req: ['q1'],
  intro: ["You have the look of someone who solves problems by pointing at them. Good. That's most of wizardry.", "Take this Apprentice Staff and defeat ten creatures with it. Any staff counts. Come back with your eyebrows, ideally."],
  onStart: () => giveGun('w_1'),
  obj: [{ kind: 'kill', t: 'staffkill', n: 10, text: 'Defeat creatures with a staff', planet: 'earth' }],
  outro: ["Ten! And only a little singed. Here: an Ember Staff. Everything it touches remembers being on fire."], reward: { cr: 600, xp: 1500, fn: () => giveGun('w_10') } });
defQuest('wz2', { ch: 'Earth · The Wizard\'s Path', title: 'The Four Temperaments', giver: 'merla', turnIn: 'merla', req: ['wz1'],
  intro: ["Fire is easy. Frost is patient. Lightning is rude. Plague is... a choice.", "Defeat forty more with any staff, anywhere in the galaxy, and I'll trust you with ice."],
  obj: [{ kind: 'kill', t: 'staffkill', n: 40, text: 'Defeat creatures with a staff (any world)', planet: 'earth' }],
  outro: ["A Glacier Staff. Freezes what it hits, sometimes solid. Try not to freeze anything you love."], reward: { cr: 3000, xp: 9000, fn: () => giveGun('w_30') } });
defQuest('wz3', { ch: 'Earth · The Wizard\'s Path', title: "The Archmage's Trial", giver: 'merla', turnIn: 'merla', req: ['wz2', 'c5'],
  intro: ["The old staffs were forged from sunlight. Drome hid the last one in plain sight: a crystal of it sits in the Frost King's crown.", "Defeat two hundred foes with a staff and bring me the Frost King's crown. Then we'll talk about the Staff of the Setting Sun."],
  obj: [{ kind: 'kill', t: 'staffkill', n: 200, text: 'Defeat foes with a staff', planet: 'earth' }, { kind: 'item', t: 'crown', n: 1, text: "Bring the Frost King's crown", planet: 'capitone' }],
  outro: ["...There. Sunlight, bound to wood. The Staff of the Setting Sun. Its fire jumps from foe to foe.", "Wear the hat, too. You've earned the hat."], reward: { cr: 20000, xp: 60000, take: { crown: 1 }, fn: () => { giveGun('w_100'); S.look = S.look || {}; S.look.h = 'wizhat'; } } });
// ---- staffs cast spells from a mana pool that refills on its own: no rounds, no reloading ----
const SPELLS = { flame: ['🔥', 'Fireball'], storm: ['⚡', 'Chain Lightning'], poison: ['☠', 'Plague Cloud'], frost: ['❄', 'Ice Shard'], arcane: ['✦', 'Arcane Bolt'], blast: ['💥', 'Blast Wave'], void: ['🌀', 'Void Rift'], sun: ['☀', 'Sunburst'], spirit: ['🏹', 'Spirit Arrow'], setsun: ['🌅', 'Setting Sun'] };
const spellOf = g => SPELLS[g.elem] || ['✦', 'Spell'];
const isCaster = () => { const g = gun(); return !!(g && g.mana) && !handMelee() && !LEVEL.fly; };
{ const _r = reload; reload = function () { if (gun() && gun().mana) { if (player.ammo <= 0 && !player.manaWarn) { player.manaWarn = 1.2; toast('OUT OF MANA', 'It refills on its own', 0.9); } return; } return _r(); }; }
{ const _s = step; step = function (dt) { _s(dt); const g = gun(); if (!g || !g.mana) { player.manaF = null; return; }
  if (player.manaWarn > 0) player.manaWarn -= dt; player.reloading = 0;
  if (player.manaF == null) player.manaF = player.ammo;
  { const fl = Math.floor(player.manaF); if (player.ammo < fl) player.manaF -= fl - player.ammo; } // casts spend mana
  player.manaF = Math.min(g.mag, player.manaF + dt * g.mag / (g.reload * 2.2)); player.ammo = Math.floor(player.manaF); }; }
{ const _u = updateHud; updateHud = function () { _u(); if (isCaster()) { const g = gun(), [ic, nm] = spellOf(g), pct = Math.round(Math.max(0, Math.min(1, (player.manaF != null ? player.manaF : player.ammo) / g.mag)) * 100);
  $('ammoN').innerHTML = `<span style="font-size:22px;font-family:var(--hud,inherit);font-weight:700;letter-spacing:.02em">${ic} ${nm}</span><span style="display:block;height:7px;margin-top:4px;background:rgba(0,0,0,.5);border:1px solid rgba(143,227,255,.35)"><i style="display:block;height:100%;width:${pct}%;background:linear-gradient(90deg,#6a5aff,#8fe3ff);box-shadow:0 0 8px #8fe3ff"></i></span>`; } }; }
// shop rows name the spell, not the ammo
for (const id in GUNS) { const G = GUNS[id]; if (G.mana && !/·/.test(G.name)) G.name = `${G.name} · ${spellOf(G)[1]}`; }
