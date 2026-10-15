// =================== 2.15 FIXES: one weapon cycle, a steady weapon box, a better shield, flashes on the barrel ===================
// ---- Q, Y and the weapon box all cycle the same way: gun → staff → (both, New Game+) → melee → gun ----
function loadoutFill() { const sl = loadoutSlots(); const best = f => S.guns.filter(id => GUNS[id] && f(id)).sort((a, b) => (GUNS[b].req || 0) - (GUNS[a].req || 0))[0];
  if (!sl.staff) { const s = best(isStaffId); if (s) sl.staff = s; } if (!sl.gun) { const g = best(id => !isStaffId(id)); if (g) sl.gun = g; } return sl; }
function weaponMode() { return handMelee() ? 'melee' : S.dual && dualOn() ? 'both' : isStaffId(S.gun) ? 'staff' : 'gun'; }
function weaponSeq() { const sl = loadoutFill(); return ['gun', 'staff', 'both', 'melee'].filter(m => m === 'melee' || (m === 'gun' && sl.gun) || (m === 'staff' && sl.staff) || (m === 'both' && sl.gun && sl.staff && canDual())); }
cycleWeapon = function () {
  if (state !== 'play' || dlgOpen || LEVEL.fly || S.riding || (typeof inLounge === 'function' && inLounge())) return;
  const seq = weaponSeq(), cur = weaponMode(), next = seq[(seq.indexOf(cur) + 1) % seq.length], sl = S.slots;
  if (next === 'melee') { S.dual = false; if (!handMelee()) swapHand(); return; }
  if (handMelee()) { S.hand = 'gun'; firing = false; SHIELD.blocking = false; meleeShown = null; refreshMeleeModel(); }
  const want = next === 'gun' ? sl.gun : sl.staff;
  if (S.gun !== want) { if (!S.guns.includes(want)) return; WMEM[S.gun] = { ammo: player.ammo, manaF: player.manaF, t: gameTime }; S.gun = want; const m = WMEM[want], g = GUNS[want];
    if (m) { const regen = g.mana ? (gameTime - m.t) * g.mag / (g.reload * 2.2) : 0; player.ammo = Math.min(g.mag, Math.floor((m.manaF != null ? m.manaF : m.ammo) + regen)); player.manaF = g.mana ? player.ammo : null; } else { player.ammo = g.mag; player.manaF = null; }
    player.reloading = 0; player.cool = Math.max(player.cool, 0.15); firing = false; }
  S.dual = next === 'both'; if (S.dual) { OFF.id = null; toast('DUAL WIELD', `${GUNS[sl.staff].name} + ${GUNS[sl.gun].name}`, 1.4); }
  SFX.ui && SFX.ui(); markDirty();
  log(`${next === 'both' ? 'Gun and staff' : GUNS[S.gun].name} out. ${TOUCH ? 'Tap the weapon box' : 'Q or Y'} for ${({ gun: 'your gun', staff: 'your staff', both: 'both', melee: 'melee' })[seq[(seq.indexOf(next) + 1) % seq.length]]}.`);
};
const cycleNext2 = () => { const seq = weaponSeq(), n = seq[(seq.indexOf(weaponMode()) + 1) % seq.length]; return ({ gun: '◈ gun', staff: '✦ staff', both: '◈✦ both', melee: '⚔ melee' })[n]; };
{ const _oh = offHud; offHud = function (on) { if ((on && GUNS[OFF.id]) || LEVEL.fly || state !== 'play') return _oh(on); const t = `<span class="k">${TOUCH ? 'tap' : 'Q'} ⇄</span> ${cycleNext2()}`; if (t !== offTxt) { offTxt = t; offEl.innerHTML = t; } }; }
// Y used to only flip gun/staff; it now walks the same cycle as Q
window.addEventListener('keydown', e => { if (e.code === 'KeyY' && state === 'play' && !dlgOpen && !chatOpen() && !e.repeat) { e.stopImmediatePropagation(); cycleWeapon(); } }, true);
// ---- the weapon box keeps one size whether it shows ammo, a spell or the shield ----
{ const st = document.createElement('style'); st.textContent = `
#ammo { box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
body:not(.touch) #ammo { width: 214px; height: 98px; }
body.touch #ammo { height: 84px; }
#ammo .n { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#ammo .n > span:first-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`; document.head.appendChild(st); }
// ---- the shield: a proper energy kite shield with a rim, a sun sigil and hex light; it sits off to the left and doesn't blanket the screen ----
{ const kids = vmShield.children.slice(); kids.forEach(c => vmShield.remove(c));
  const sh = new THREE.Shape(); sh.moveTo(0, 0.2); sh.quadraticCurveTo(0.15, 0.2, 0.16, 0.12); sh.quadraticCurveTo(0.16, -0.06, 0, -0.22); sh.quadraticCurveTo(-0.16, -0.06, -0.16, 0.12); sh.quadraticCurveTo(-0.15, 0.2, 0, 0.2);
  const hexTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 160; const x = c.getContext('2d'), g = x.createRadialGradient(64, 70, 6, 64, 80, 96); g.addColorStop(0, 'rgba(140,220,255,.55)'); g.addColorStop(1, 'rgba(40,120,220,.15)'); x.fillStyle = g; x.fillRect(0, 0, 128, 160);
    x.strokeStyle = 'rgba(200,240,255,.35)'; x.lineWidth = 1.5; for (let r = 0; r < 12; r++) for (let q = 0; q < 8; q++) { const cx = q * 17 + (r % 2) * 8.5, cy = r * 15; x.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; x.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); } x.closePath(); x.stroke(); }
    const t = new THREE.CanvasTexture(c); return t; })();
  const geo = new THREE.ShapeGeometry(sh, 16); { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 0.16) / 0.32, (p.getY(i) + 0.22) / 0.42); }
  const face = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: hexTex, color: '#ffffff', transparent: true, opacity: 0.3, depthWrite: false, depthTest: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); face.renderOrder = 3; vmShield.add(face);
  const pts = sh.getPoints(40).map(p => new THREE.Vector3(p.x, p.y, 0.002)); const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 60, 0.006, 5, true), new THREE.MeshBasicMaterial({ color: '#cfeaff', transparent: true, opacity: 0.9, depthTest: false, depthWrite: false })); rim.renderOrder = 4; vmShield.add(rim);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#ffd36a', transparent: true, opacity: 0.85, depthTest: false, depthWrite: false, side: THREE.DoubleSide })); sun.position.set(0, 0.0, 0.003); sun.renderOrder = 5; vmShield.add(sun);
  for (const y of [-0.012, -0.03]) { const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.12 - (y < -0.02 ? 0.03 : 0), 0.008), sun.material); bar.position.set(0, y, 0.003); bar.renderOrder = 5; vmShield.add(bar); }
  const grip = part(vmShield, Cy(0.012, 0.012, 0.12, 6), '#3a3d44', 0, 0, -0.03, 0, 0, Math.PI / 2); grip.renderOrder = 2;
  const emit = part(vmShield, B(0.05, 0.03, 0.02), glow('#6fc8ff'), 0, -0.16, -0.012); emit.renderOrder = 2;
  vmShield.userData.face = face; vmShield.userData.rim = rim; vmShield.userData.sun = sun; }
{ const _uh = updateHands; updateHands = function (dt, t) { _uh(dt, t); if (!vmShield.visible) return; const up = SHIELD.blocking ? 1 : 0, U = vmShield.userData, lowHp = SHIELD.hp / SHIELD.max;
  U.k = (U.k || 0) + (up - (U.k || 0)) * Math.min(1, dt * 12); const k = U.k;
  vmShield.position.set(-0.27 + k * 0.1, -0.2 + k * 0.08 + Math.sin(t * 2) * 0.004, -0.5); vmShield.rotation.set(0.05, 0.55 - k * 0.4, 0.06 - k * 0.06); vmShield.scale.setScalar(0.62 + k * 0.2);
  U.face.material.opacity = 0.18 + k * 0.32 + SHIELD.flash * 1.5; U.face.material.color.setRGB(1, 0.55 + lowHp * 0.45, 0.55 + lowHp * 0.45);
  U.rim.material.opacity = 0.45 + k * 0.5; U.rim.material.color.set(SHIELD.flash > 0 ? '#ffffff' : lowHp < 0.3 ? '#ff8a6a' : '#cfeaff'); U.sun.material.opacity = 0.5 + k * 0.4;
  U.face.material.map.offset.y = (t * 0.05) % 1; }; }
// ---- muzzle flashes sit on the end of the barrel of whatever gun you hold ----
function gunMuzzle(g) { if (!g) return null; if (g.userData.muzzle) return g.userData.muzzle; const top = !!(GUNS[S.gun] && GUNS[S.gun].mana);
  g.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), m = new THREE.Matrix4(), bb = new THREE.Box3(); let best = null;
  g.traverse(o => { if (!o.isMesh || o.isSprite || !o.geometry || (o.material && o.material.blending === THREE.AdditiveBlending)) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); m.multiplyMatrices(inv, o.matrixWorld); bb.copy(o.geometry.boundingBox).applyMatrix4(m);
    if (top ? (!best || bb.max.y > best.max.y) : (!best || bb.max.z > best.max.z + 0.005 || (Math.abs(bb.max.z - best.max.z) < 0.005 && (bb.max.x - bb.min.x) < (best.max.x - best.min.x)))) best = bb.clone(); });
  if (!best) return null; const c = best.getCenter(V(0, 0, 0)); return (g.userData.muzzle = top ? c : V(c.x, c.y, best.max.z + 0.04)); }
{ const _mf = muzzleFlash; muzzleFlash = function () { const g = typeof vmGun !== 'undefined' ? vmGun : null, n = g ? g.children.length : 0; _mf(); const mz = gunMuzzle(g); if (g && mz) for (let i = n; i < g.children.length; i++) if (g.children[i].isSprite) g.children[i].position.copy(mz); }; }
{ const _gs = gunShotFx; gunShotFx = function () { const g = vmGun, n = g ? g.children.length : 0; _gs(); const mz = gunMuzzle(g); if (g && mz) for (let i = n; i < g.children.length; i++) g.children[i].position.copy(mz); }; }
