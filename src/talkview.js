// =================== TALK VIEW: every character with a line gets a mouth that moves with the voice, the camera frames whoever is talking,
// and the conversation sits in a column beside them (bottom half on tall phones). Shops and big menus keep the old full panel. Cutscenes keep their own cameras.
// Mouth styles: lips on faces, a pulsing comm light under a helmet visor, a glowing speaker grille on robots. Characters that already have a mouth keep theirs.
const TALK = { on: false, b: 0, who: null, head: null, H: V(0, 0, 0), span: 0.34, until: 0, speak: null, rot: null, pos: V(0, 0, 0), q: new THREE.Quaternion(), cam: new THREE.PerspectiveCamera() };
const TALK_NO_MOUTH = new Set([]); // npc ids that already have their own lips/mouth: they keep theirs
const TALK_ROBOT = /\b(bot|droid)\b|-bot|R7-|PIP-9|Vault-9|ORDER-BOT|Sparkplug|Moe-bot|XR-?17/i;
const _tr = new THREE.Raycaster(), _tm = new THREE.Matrix4(), _tv = V(0, 0, 0), _tw = V(0, 0, 0);
const talkMat = (() => { const c = {}; return (hex, basic) => c[hex + basic] || (c[hex + basic] = basic ? new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), transparent: true }) : new THREE.MeshLambertMaterial({ color: hex })); })();
// scan the face straight on (x = 0) from the neck up: the span of hits is the face; the mouth sits a bit under a third of the way up
function talkFace(obj) {
  const R = obj.userData.rig, head = R && R.head, meshes = []; (head || obj).traverse(m => { if (m.isMesh && !m.userData.talkMouth) meshes.push(m); }); if (!meshes.length) return null;
  obj.updateMatrixWorld(true); _tm.copy(obj.matrixWorld).invert();
  const box = new THREE.Box3(); for (const m of meshes) { m.geometry.computeBoundingBox && m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld).applyMatrix4(_tm); box.union(b); }
  const sp = R && R.spec, y0 = sp && sp.neck ? Math.max(box.min.y, sp.neck - 0.05) : box.min.y + (box.max.y - box.min.y) * 0.55, y1 = box.max.y, zf = box.max.z + 1, hits = [];
  const toW = p => p.applyMatrix4(obj.matrixWorld), dirW = toW(V(0, 0, -1)).sub(toW(V(0, 0, 0))).normalize();
  for (let y = y0; y <= y1; y += Math.max(0.008, (y1 - y0) / 60)) { _tr.set(toW(V(0, y, zf)), dirW); _tr.far = (zf - box.min.z) * 1.2 * obj.getWorldScale(_tw).z + 1; const h = _tr.intersectObjects(meshes, false)[0]; if (h) hits.push({ y, h, z: _tv.copy(h.point).applyMatrix4(_tm).z }); }
  if (hits.length < 3) return null;
  // the face is the top of what we hit; unrigged models scan the whole upper body, so keep only the head-sized top part
  const tall = Math.max(0.5, box.max.y - Math.min(0, box.min.y)), fy1 = hits[hits.length - 1].y, cap = R && sp ? 9 : tall * 0.19, fy0 = Math.max(hits[0].y, fy1 - cap), span = fy1 - fy0;
  for (let i = hits.length - 1; i >= 0; i--) if (hits[i].y < fy0) { hits.splice(0, i + 1); break; }
  // unrigged: walk down from the top; where the front surface falls away (a thin neck) is the chin
  let cy0 = fy0; if (!(R && sp)) { let zm = -1e9; for (let i = hits.length - 1; i >= 0; i--) { const d = fy1 - hits[i].y; zm = Math.max(zm, hits[i].z); if (d > 0.08 && zm - hits[i].z > Math.max(0.03, 0.3 * d)) { cy0 = hits[i].y; break; } } }
  // dark eyes off-centre: the mouth goes halfway between the lowest eye and the chin
  let fs = fy1 - cy0, my = cy0 + fs * 0.27, eyeLo = 1e9;
  for (const sx of [-0.2, 0.2]) for (let y = cy0; y <= fy1; y += fs / 40) { _tr.set(toW(V(sx * fs, y, zf)), dirW); const h = _tr.intersectObjects(meshes, false)[0], c = h && h.object.material && h.object.material.color; if (c && !h.object.material.isMeshBasicMaterial && c.r + c.g + c.b < 0.06) { eyeLo = Math.min(eyeLo, y); break; } }
  if (eyeLo < fy1 && eyeLo > cy0 + fs * 0.12) my = cy0 + (eyeLo - cy0) * 0.5;
  const eye = cy0 + fs * 0.62;
  const near = (yy) => hits.reduce((a, c) => Math.abs(c.y - yy) < Math.abs(a.y - yy) ? c : a);
  const mh = near(my), eh = near(eye), visor = eh.h.object.material && eh.h.object.material.isMeshBasicMaterial;
  const col = (mh.h.object.material && mh.h.object.material.color) ? '#' + mh.h.object.material.color.clone().convertLinearToSRGB().getHexString() : '#8a6a5a';
  const vcol = visor ? '#' + eh.h.object.material.color.clone().convertLinearToSRGB().getHexString() : null;
  return { y: mh.y, z: mh.z, span: fs, col, visor, vcol, eyeY: eh.y };
}
function addMouth(obj, name) {
  if (!obj || obj.userData.talkMouth !== undefined) return obj && obj.userData.talkMouth; obj.userData.talkMouth = null;
  if (obj.userData.mouth) return null; // already has one (B.U.R.P. style heads)
  const f = talkFace(obj); if (!f) return null;
  const R = obj.userData.rig, host = (R && R.head) || obj, s = f.span, g = new THREE.Group(); g.userData.talkMouth = true;
  const robot = TALK_ROBOT.test(name || '') || (R && R.spec === RIGS.xr17), kind = robot ? 'robot' : f.visor ? 'helmet' : 'lips', parts = {};
  const mk = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.userData.talkMouth = true; g.add(m); return m; };
  if (kind === 'lips') {
    const c = new THREE.Color(f.col), lip = c.clone().multiplyScalar(0.62).lerp(new THREE.Color('#7a2a2a'), 0.25);
    parts.in = mk(s * 0.3, s * 0.12, 0.006, talkMat('#1c0a0c'), 0, 0, 0.002);
    parts.up = mk(s * 0.34, s * 0.035, 0.02, talkMat('#' + lip.getHexString()), 0, s * 0.012, 0.008);
    parts.lo = mk(s * 0.3, s * 0.04, 0.02, talkMat('#' + lip.getHexString()), 0, -s * 0.014, 0.008);
  } else if (kind === 'helmet') {
    parts.glow = mk(s * 0.26, s * 0.03, 0.012, new THREE.MeshBasicMaterial({ color: new THREE.Color(f.vcol || '#6ad0ff').convertSRGBToLinear(), transparent: true, opacity: 0.35 }), 0, 0, 0.006);
  } else {
    parts.bars = [0, 1, 2].map(k => mk(s * 0.26, s * 0.022, 0.01, new THREE.MeshBasicMaterial({ color: new THREE.Color('#6ad0ff').convertSRGBToLinear(), transparent: true, opacity: 0.3 }), 0, (1 - k) * s * 0.05, 0.005));
  }
  g.position.set(0, f.y, f.z); obj.add(g); host.attach(g);
  return obj.userData.talkMouth = { g, kind, parts, span: s, eyeY: f.eyeY, mouthY: f.y };
}
// mouth opening 0..1: a real recording follows its loudness; otherwise a syllable rhythm for as long as the babble runs
function talkAmp(now) {
  const sp = TALK.speak, ac = SFX.ctx && SFX.ctx();
  if (sp && ac) { const t = ac.currentTime - sp.t0; if (t >= 0 && t < sp.dur) { const v = sp.env[Math.min(sp.env.length - 1, Math.floor(t / 0.03))] || 0; return Math.min(1, v * 1.15); } if (t < 0) return 0; }
  if (now < TALK.until) { const k = (now / 65) | 0, ph = (now % 65) / 65, r = Math.abs(Math.sin(k * 12.9898) * 43758.5453 % 1); return (0.35 + r * 0.65) * Math.sin(ph * Math.PI); }
  return 0;
}
function talkEnv(buf) { const d = buf.getChannelData(0), n = Math.floor(buf.sampleRate * 0.03), out = []; let mx = 1e-4;
  for (let i = 0; i < d.length; i += n) { let s = 0; for (let j = i; j < Math.min(d.length, i + n); j += 4) s += d[j] * d[j]; const v = Math.sqrt(s / (n / 4)); out.push(v); if (v > mx) mx = v; }
  return out.map(v => Math.max(0, (v / mx - 0.08) / 0.92)); }
function talkMouthStep(m, a, now) {
  if (!m) return; const P = m.parts;
  if (m.kind === 'lips') { const o = a; P.in.scale.y = 0.12 + o * 1.25; P.up.position.y = m.span * (0.012 + o * 0.07); P.lo.position.y = -m.span * (0.014 + o * 0.08); P.in.scale.x = 1 - o * 0.15; }
  else if (m.kind === 'helmet') { P.glow.material.opacity = 0.3 + a * 0.7; P.glow.scale.x = 0.7 + a * 0.6; }
  else P.bars.forEach((b, k) => { const v = Math.max(0, a - k * 0.15 + Math.sin(now / 50 + k) * 0.1); b.material.opacity = 0.25 + v * 0.75; b.scale.x = 0.6 + v * 0.6; });
}
// every quest NPC gets its mouth as it is built
{ const _mk = makeNpc; makeNpc = function (n, base) { const r = _mk.apply(this, arguments); try { const N = npcObjs[n.id]; if (N && !TALK_NO_MOUTH.has(n.id)) addMouth(N.obj, n.name); } catch (e) { console.warn('mouth', n.id, e); } return r; }; }
// who is talking: the named quest NPC if there is one nearby, else the closest rigged character in front of you
function talkFind(name) {
  for (const id in npcObjs) { const N = npcObjs[id]; if (N.def.name === name && N.obj.visible && N.obj.parent && N.obj.position.distanceTo(player.pos) < 9) return { obj: N.obj, id }; }
  const fw = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)); let best = null, bd = 1e9;
  const look = root => { for (const o of root.children) { if (!o.visible) continue; const R = o.userData.rig; if (R && R.head && o.userData.talkMouth !== false) { o.getWorldPosition(_tw); const dx = _tw.x - player.pos.x, dz = _tw.z - player.pos.z, d = Math.hypot(dx, dz); if (d < 6 && d > 0.3) { const dot = (dx * fw.x + dz * fw.z) / d, sc = d * (1.6 - dot); if (dot > 0.2 && sc < bd) { bd = sc; best = o; } } } } };
  look(levelGroup); look(scene); return best ? { obj: best, id: null } : null;
}
function talkLayoutOk() { const d = $('dlg'); return dlgOpen && !d.hidden && !$('shopRows') && !d.querySelector('.prevWrap, canvas') && !d.classList.contains('galaxy') && state === 'play' && !(typeof CUT !== 'undefined' && CUT.on); }
function talkStart(role, name) {
  talkEnd(true); const f = talkFind(name); if (!f) return; const o = f.obj; if (!(f.id && TALK_NO_MOUTH.has(f.id))) addMouth(o, name);
  TALK.who = o; TALK.name = name; TALK.on = true; TALK.rot = null; TALK.turnTo = null;
  // quest NPCs already turn to face you; anyone else turns for the talk and turns back after
  if (!f.id) { TALK.rot = o.rotation.y; o.getWorldPosition(_tw); TALK.turnTo = Math.atan2(player.pos.x - _tw.x, player.pos.z - _tw.z); }
  TALK.until = 0; TALK.speak = null;
}
function talkEnd(quick) { if (TALK.who && TALK.rot != null) TALK.who.rotation.y = TALK.rot; if (TALK.who && TALK.who.userData.talkMouth) talkMouthStep(TALK.who.userData.talkMouth, 0, 0); TALK.who = null; TALK.on = false; TALK.rot = null; if (quick) TALK.b = 0; document.body.classList.remove('talkview'); }
{ const _o = openDlg; openDlg = function (role, name) { const r = _o.apply(this, arguments); try { talkStart(role, name); } catch (e) { console.warn('talk', e); } return r; }; }
{ const _c = closeDlg; closeDlg = function () { try { talkEnd(false); } catch (_) {} return _c.apply(this, arguments); }; }
// a new line: the mouth runs for the length of the babble unless a recording takes over
new MutationObserver(() => { if (!TALK.on) return; const t = $('dlgLine').textContent || ''; TALK.until = performance.now() + (4 + Math.min(10, t.length >> 4)) * 65 + 60; }).observe($('dlgLine'), { childList: true, characterData: true, subtree: true });
// called every frame after the player camera is placed: blend toward a shot of the speaker
function talkCamFrame(dt) {
  const now = performance.now(), ok = TALK.on && TALK.who && TALK.who.parent && talkLayoutOk();
  document.body.classList.toggle('talkview', !!ok);
  TALK.b += ((ok ? 1 : 0) - TALK.b) * (1 - Math.exp(-dt * 5)); if (TALK.b < 0.002 && !ok) { TALK.b = 0; return; }
  const o = TALK.who; if (!o || !o.parent) return;
  if (TALK.turnTo != null) { let d = TALK.turnTo - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.y += d * (1 - Math.exp(-dt * 6)); }
  const m = o.userData.talkMouth; talkMouthStep(m, ok ? talkAmp(now) : 0, now);
  // frame: head and shoulders, speaker on the left third (upper half on tall screens), camera a little off to one side of the line between you
  o.updateMatrixWorld(true); const sc = o.getWorldScale(_tw).y, span = (m ? m.span : 0.34) * sc;
  const hy = m ? (m.mouthY + m.eyeY) / 2 : (o.userData.rig && o.userData.rig.spec && o.userData.rig.spec.neck || 1.6) + 0.12;
  const H = V(0, hy, 0).applyMatrix4(o.matrixWorld), fwd = V(Math.sin(o.rotation.y), 0, Math.cos(o.rotation.y));
  { const p = o.parent; if (p) { const q = p.getWorldQuaternion(new THREE.Quaternion()); fwd.applyQuaternion(q).setY(0).normalize(); } }
  const wide = camera.aspect >= 0.8, vis = span * (wide ? 5.2 : 4.4), fovR = THREE.MathUtils.degToRad(camera.fov) / 2, D = Math.max(0.45, vis / 2 / Math.tan(fovR));
  const side = V(fwd.z, 0, -fwd.x), C = TALK.cam; C.fov = camera.fov; C.aspect = camera.aspect; C.updateProjectionMatrix();
  C.position.copy(H).addScaledVector(fwd, D * 0.96).addScaledVector(side, D * 0.28).add(V(0, span * 0.15, 0)); C.lookAt(H);
  C.updateMatrixWorld(); const rgt = V(1, 0, 0).applyQuaternion(C.quaternion), up = V(0, 1, 0).applyQuaternion(C.quaternion);
  const hw = D * Math.tan(fovR) * camera.aspect, hh = D * Math.tan(fovR);
  C.lookAt(wide ? H.clone().addScaledVector(rgt, hw * 0.34).addScaledVector(up, -hh * 0.3) : H.clone().addScaledVector(up, -hh * 0.45));
  const k = TALK.b * TALK.b * (3 - 2 * TALK.b); camera.position.lerp(C.position, k); camera.quaternion.slerp(C.quaternion, k);
  if (k > 0.05) vm.visible = false;
}
// keys 1-9 pick the options while talking
window.addEventListener('keydown', e => { if (!document.body.classList.contains('talkview') || !/^Digit[1-9]$/.test(e.code)) return; const b = [...$('dlgActs').querySelectorAll('.pbtn')].filter(x => !x.disabled)[+e.code.slice(5) - 1]; if (!b) return; e.preventDefault(); e.stopImmediatePropagation(); b.click(); }, true);
{ const st = document.createElement('style'); st.textContent = `
body.talkview #dlg { left: auto; right: max(3vw, 16px); transform: none; bottom: max(7vh, calc(env(safe-area-inset-bottom, 0px) + 16px)); width: min(40vw, 660px); max-height: 74vh; padding: 22px 24px 20px;
  background: linear-gradient(180deg, rgba(8,12,24,.62), rgba(8,12,24,.86)); border: 1px solid rgba(255,211,106,.28); border-left: 3px solid var(--gold); box-shadow: 0 12px 40px rgba(0,0,0,.45); backdrop-filter: blur(3px); }
body.talkview #dlg h3 { font-size: clamp(22px, 2.3vw, 34px); margin-bottom: 10px; }
body.talkview #dlg .who { font-size: clamp(11px, 0.95vw, 14px); }
body.talkview #dlg .line { font-size: clamp(17px, 1.55vw, 23px); line-height: 1.45; min-height: 3em; }
body.talkview #dlg .acts { flex-direction: column; align-items: stretch; gap: 8px; margin-top: 16px; counter-reset: topt; }
body.talkview #dlg .acts .pbtn { text-align: left; font-size: clamp(15px, 1.3vw, 20px); padding: 11px 16px; display: flex; align-items: center; gap: 10px; }
body.talkview #hud, body.talkview #crosshair, body.talkview #minimap, body.talkview #touch { opacity: 0 !important; pointer-events: none !important; transition: opacity .3s; }
@media (max-aspect-ratio: 4/5) { body.talkview #dlg { left: 10px; right: 10px; width: auto; bottom: calc(env(safe-area-inset-bottom, 0px) + 10px); max-height: 46vh; padding: 16px 16px 14px; }
 }
`; document.head.appendChild(st); }
