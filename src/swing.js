// =================== SMOOTH MELEE (2.22.13): flowing swings instead of a jerky up-and-down chop ===================
// Hold attack and the weapon carves a continuous figure-eight in front of you: every pass across is one strike, and the
// blade turns to follow its own path. A single tap does one clean eased pass. Everything blends in and out of the rest pose.
const SWG = { th: Math.PI / 2, blend: 0, pos: null, rot: null, off: null, offId: null };
// two-handed weapons: a mirrored copy in the left hand that swings half a beat behind the right
const TWO_HAND = { nunchucks: 1, claws: 1, driller: 1, twinmaster: 1 }, POLE = { staff: 1, scythe: 1 };
// twin swords: split the pair, blue sword in the right hand and red in the left
function swSplit(m, side) { for (const c of [...m.children]) { const x = c.position.x; if (side > 0 ? x < -0.001 : x > 0.001) m.remove(c); else c.position.x = 0; } return m; }
const vmOffM = new THREE.Group(); camera.add(vmOffM); vmOffM.visible = false;
function swPose(th, b, big) { const s = Math.sin(th), c = Math.cos(th), ly = s * c;
  return [[0.2 + (0.04 - 0.2 + s * 0.24 * big) * b, -0.27 + (0.07 + ly * 0.26 * big) * b, -0.42 + (0.06 - Math.abs(c) * 0.05) * b],
    [-0.75 + (0.15 - ly * 1.1 - Math.abs(s) * 0.2) * b, 0.25 + (-s * 0.55) * b, -0.4 + (0.9 - s * 1.5 + Math.atan2(Math.cos(2 * th), c) * 0.35) * b]]; }
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
