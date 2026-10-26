// =================== SMOOTH MELEE (2.22.13): flowing swings instead of a jerky up-and-down chop ===================
// Hold attack and the weapon carves a continuous figure-eight in front of you: every pass across is one strike, and the
// blade turns to follow its own path. A single tap does one clean eased pass. Everything blends in and out of the rest pose.
const SWG = { th: Math.PI / 2, blend: 0, pos: null, rot: null, off: null, offId: null };
// two-handed weapons: a mirrored copy in the left hand that swings half a beat behind the right
const TWO_HAND = { nunchucks: 1, claws: 1, driller: 1, twinmaster: 1 }, POLE = { staff: 1, scythe: 1 };
// twin swords: split the pair, blue sword in the right hand and red in the left
function swSplit(m, side) { for (const c of [...m.children]) { const x = c.position.x; if (side > 0 ? x < -0.001 : x > 0.001) m.remove(c); else c.position.x = 0; } return m; }
const vmOffM = new THREE.Group(); camera.add(vmOffM); vmOffM.visible = false;
// swing styles: each is a path the blade traces (x across, y up, z forward thrust) as th runs; the blade rolls to follow its direction
const SWING_STYLES = {
  fig8: { name: 'Figure Eight', f: t => [Math.sin(t), Math.sin(t) * Math.cos(t), 0] },
  sweep: { name: 'Side Sweep', f: t => [Math.sin(t), 0.06 * Math.cos(t), 0] },
  chop: { name: 'Overhead Chop', f: t => [0.12 * Math.cos(t), 0.55 * Math.sin(t), 0] },
  windmill: { name: 'Windmill', f: t => [Math.sin(t), 0.5 * Math.cos(t), 0] },
  rising: { name: 'Rising Slash', f: t => [Math.sin(t), 0.45 * Math.sin(t), 0] },
  cross: { name: 'Cross Cut', f: t => [Math.sin(t), 0.45 * Math.sin(t) * Math.cos(t / 2), 0] },
  side8: { name: 'Sideways Eight', f: t => [Math.sin(t) * Math.cos(t) * 1.6, 0.5 * Math.sin(t), 0] },
  bolt: { name: 'Lightning', f: t => [Math.sin(t), 0.28 * Math.sin(3 * t), 0] },
  spiral: { name: 'Spiral', f: t => { const r = 0.55 + 0.45 * Math.sin(t / 3); return [r * Math.sin(t), 0.5 * r * Math.cos(t), 0]; } },
  lunge: { name: 'Lunge', f: t => [0.15 * Math.sin(t), 0.1 * Math.cos(t), Math.max(0, Math.sin(t)) * 1.0] },
  clover: { name: 'Clover', f: t => [Math.cos(3 * t / 2) * Math.cos(t / 2) * 1.1, 0.55 * Math.cos(3 * t / 2) * Math.sin(t / 2), 0] },
  twirl: { name: 'Twirl', f: t => [0.35 * Math.sin(t), 0.15 * Math.cos(t), 0], spin: 1 }
};
const swingStyle = () => SWING_STYLES[S.swingStyle] || SWING_STYLES.fig8;
function swPose(th, b, big) { const St = swingStyle(), [x, y, z] = St.f(th), [x2, y2] = St.f(th + 0.01), dx = (x2 - x) / 0.01, dy = (y2 - y) / 0.01, roll = (St === SWING_STYLES.fig8 ? Math.atan2(dy, dx) : Math.atan2(dy, Math.abs(dx))) + (St.spin ? th * 2 : 0);
  return [[0.2 + (0.04 - 0.2 + x * 0.24 * big) * b, -0.27 + (0.07 + y * 0.26 * big) * b, -0.42 + (0.06 - Math.min(1, Math.abs(dx)) * 0.05 - z * 0.2) * b],
    [-0.75 + (0.15 - y * 1.1 - Math.abs(x) * 0.2 - z * 0.6) * b, 0.25 + (-x * 0.55) * b, -0.4 + (0.9 - x * 1.5 + roll * 0.35) * b]]; }
updateMelee = function (dt) { meleeCool -= dt; if (meleeT > 0) meleeT -= dt; if (!handMelee() && meleeT <= 0) vmMelee.visible = false; };
{ const _uh = updateHands; updateHands = function (dt, t) { _uh(dt, t);
  try { if (!handMelee() && meleeT <= 0) { SWG.blend = 0; SWG.pos = null; vmOffM.visible = false; return; }
    const M = meleeStats(S.melee || 'knife') || {}, held = firing && !SHIELD.blocking && handMelee(), active = held || meleeT > 0;
    SWG.blend += ((active ? 1 : 0) - SWG.blend) * (1 - Math.exp(-dt * (active ? 12 : 7)));
    if (active) SWG.th += dt * Math.PI / (held ? Math.max(0.2, (M.rate || 0.4) * 1.05) : 0.3);
    else if (SWG.blend < 0.05) SWG.th = Math.PI / 2;
    const b = SWG.blend, big = M.saber ? 1.15 : 1, [P, R] = swPose(SWG.th, b, big), pole = POLE[S.melee || 'knife'];
    // pole arms are held across the body in both hands: pulled to the middle, tilted diagonal, and the swing turns into a spin
    if (pole) { P[0] -= 0.14; P[1] += 0.03; R[2] += 0.7 + Math.sin(SWG.th) * 0.6 * b; R[1] -= 0.2; }
    if (!SWG.pos) { SWG.pos = P.slice(); SWG.rot = R.slice(); }
    const k = 1 - Math.exp(-dt * 22); for (let i = 0; i < 3; i++) { SWG.pos[i] += (P[i] - SWG.pos[i]) * k; SWG.rot[i] += (R[i] - SWG.rot[i]) * k; }
    vmMelee.visible = true; vmMelee.position.set(SWG.pos[0], SWG.pos[1] + Math.sin(t * 2) * 0.006 * (1 - b), SWG.pos[2]); vmMelee.rotation.set(SWG.rot[0], SWG.rot[1], SWG.rot[2]);
    const id = S.melee || 'knife'; if (id === 'twinmaster' && vmMelee.children[0] && !vmMelee.children[0].userData.split) { swSplit(vmMelee.children[0], 1); vmMelee.children[0].userData.split = 1; }
    const two = !!TWO_HAND[id]; vmOffM.visible = two && vmMelee.visible; vmShield.visible = vmShield.visible && (!two || SHIELD.blocking);
    if (two) { if (SWG.offId !== id) { SWG.offId = id; while (vmOffM.children.length) vmOffM.remove(vmOffM.children[0]); const m = makeMeleeModel(id); if (id === 'twinmaster') swSplit(m, -1); m.scale.x = -1; vmOffM.add(m); }
      const [P2, R2] = swPose(SWG.th + Math.PI, b, big); vmOffM.scale.setScalar(0.8); vmOffM.position.set(-P2[0], P2[1], P2[2]); vmOffM.rotation.set(R2[0], -R2[1], -R2[2]); }
  } catch (e) { console.warn('swing', e); } }; }
