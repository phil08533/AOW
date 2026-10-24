// B.U.R.P.'s wall terminal on the ship (a little animated head that talks back) and his hologram guide for new characters.
const BG = { head: null, holo: null, talkUntil: 0 };
const BURP_GUIDE = [
  "Hello. I am B.U.R.P., the ship's assistant. I have been asked to explain things. I will keep it short.",
  "Your first job is to talk to Captain Vega on Earth. Your current quest is always in the top left. Press J for the full list.",
  "To leave the ship, press L to launch, or M for the galaxy map. Press T from anywhere to come back here.",
  "Press E to talk to people and use things. B opens your bag. Escape opens the menu and the settings.",
  "Popular activities in this galaxy include fishing, racing, murder, and building an intergalactic drug trade. I am not recommending. I am listing.",
  "That is all I am explaining. Explore the rest on your own. I will be on the wall if you need me.",
];
const BURP_IDLE = ["I have counted the rivets in this room. There are four thousand and twelve. I counted twice.", "The ship is running normally. I checked. Then I checked again, for fun.",
  "If you are lost, Captain Vega is on Earth. If you are emotionally lost, I am also here, but less qualified.", "The coffee machine and I are not speaking. It knows why."];
function burpHead(holo) {
  const g = new THREE.Group(), m = c => holo ? new THREE.MeshBasicMaterial({ color: '#4fd2ff', transparent: true, opacity: 0.4, depthWrite: false }) : toon(c);
  part(g, new THREE.SphereGeometry(0.32, 16, 12), m('#9aa1aa'), 0, 0, 0); part(g, B(0.36, 0.09, 0.1), holo ? m() : glow('#4fd2ff'), 0, 0.07, 0.28);
  for (const s of [-1, 1]) { part(g, Cy(0.08, 0.08, 0.1, 10), m('#5d636c'), s * 0.33, 0, 0, 0, 0, Math.PI / 2); }
  part(g, Cy(0.015, 0.015, 0.25, 4), m('#5d636c'), 0.1, 0.42, 0); part(g, new THREE.SphereGeometry(0.04, 6, 4), holo ? m() : glow('#ff6a3a'), 0.1, 0.56, 0);
  const mouth = new THREE.Mesh(B(0.2, 0.04, 0.05), holo ? m() : glow('#7fe8ff')); mouth.position.set(0, -0.14, 0.29); g.add(mouth); g.userData.mouth = mouth; return g;
}
// every B.U.R.P. line moves the mouths while it plays
{ const _bs = burpSay; burpSay = function (text) { BG.talkUntil = performance.now() + Math.min(9000, 700 + String(text).split(/\s+/).length * 330); return _bs.apply(this, arguments); }; }
setInterval(() => { const t = performance.now(), on = t < BG.talkUntil; for (const h of [BG.head, BG.holo]) { if (!h || !h.parent) continue; const mo = h.userData.mouth; mo.scale.y = on ? 1 + Math.abs(Math.sin(t / 70)) * 3.5 : 1; } }, 40);

// B.U.R.P. lives in a wall hatch on the front bridge wall (where the old Marshal board was). When you come close the
// hatch pops, his arm swings out on a hinge, and he hangs out: looks at you, bobs, does the odd spin or nod, then tucks away.
function burpTerminal() {
  const x = 3.0, z = -10.42, g = new THREE.Group(); g.position.set(x, 0, z); levelGroup.add(g);
  part(g, B(1.3, 1.4, 0.12), toon('#2a2d34', 'panel'), 0, 1.65, 0); part(g, B(1.1, 1.2, 0.04), new THREE.MeshBasicMaterial({ color: '#0a1a24' }), 0, 1.65, 0.07);
  part(g, B(1.3, 0.06, 0.08), glow('#7fe8ff'), 0, 2.36, 0.08); part(g, B(1.3, 0.06, 0.08), glow('#7fe8ff'), 0, 0.94, 0.08);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.16), new THREE.MeshBasicMaterial({ map: signTex('B.U.R.P.', '#0a1a24', '#7fe8ff') })); sg.position.set(0, 2.5, 0.07); g.add(sg);
  // hatch door, hinged on its left edge
  const door = new THREE.Group(); door.position.set(-0.55, 1.65, 0.1); g.add(door); part(door, B(1.1, 1.2, 0.05), toon('#3a3e48', 'panel'), 0.55, 0, 0); part(door, B(0.5, 0.05, 0.06), glow('#ff6a3a'), 0.55, 0.3, 0.03);
  // the arm: hinge at the wall, two segments, head on the end
  const hinge = new THREE.Group(); hinge.position.set(0.3, 1.65, 0.12); g.add(hinge); part(hinge, Cy(0.09, 0.09, 0.3, 10), toon('#5d636c', 'metal'), 0, 0, 0);
  const arm1 = new THREE.Group(); hinge.add(arm1); part(arm1, B(0.1, 0.1, 0.7), toon('#9aa1aa', 'metal'), 0, 0, 0.35);
  const elbow = new THREE.Group(); elbow.position.z = 0.7; arm1.add(elbow); part(elbow, new THREE.SphereGeometry(0.08, 8, 6), toon('#5d636c', 'metal'), 0, 0, 0); part(elbow, B(0.08, 0.08, 0.55), toon('#9aa1aa', 'metal'), 0, 0, 0.27);
  const h = burpHead(false); h.scale.setScalar(1.0); h.position.z = 0.75; elbow.add(h); BG.head = h;
  const st = { out: 0, trick: 0, tt: 6 + Math.random() * 6, kind: 0 }; let last = 0;
  levelAnims.push(t => { const dt = Math.min(0.05, last ? t - last : 0.016); last = t; if (!g.parent) return;
    const near = Math.hypot(player.pos.x - x, player.pos.z - z) < 5.5 || performance.now() < BG.talkUntil || dlgOpen && $('dlgName') && /B\.U\.R\.P/.test($('dlgName').textContent);
    st.out += ((near ? 1 : 0) - st.out) * Math.min(1, dt * 3.2); const o = st.out;
    door.rotation.y = -Math.min(1, o * 1.6) * 1.9; // the hatch pops first
    const ext = clamp((o - 0.25) / 0.75, 0, 1);
    arm1.rotation.y = (1 - ext) * 1.5; elbow.rotation.y = (1 - ext) * -2.6; hinge.position.z = 0.12 + ext * 0.05; h.visible = o > 0.12;
    // look at you, with a little bob
    const wx = x + 0.3 + Math.sin(arm1.rotation.y) * 0.7, wz = z + 0.9; h.rotation.y = Math.atan2(player.pos.x - wx, player.pos.z - wz) * ext + Math.sin(t * 0.9) * 0.12 - arm1.rotation.y - elbow.rotation.y;
    h.position.y = Math.sin(t * 2.1) * 0.04 * ext; arm1.rotation.x = Math.sin(t * 0.8) * 0.06 * ext;
    // the odd trick while he's out: a spin, a happy nod, or a wobble
    if (ext > 0.9) { st.tt -= dt; if (st.tt <= 0) { st.trick = 1; st.kind = Math.floor(Math.random() * 3); st.tt = 6 + Math.random() * 7; } }
    if (st.trick > 0) { st.trick = Math.max(0, st.trick - dt * 0.9); const k = 1 - st.trick;
      if (st.kind === 0) h.rotation.y += k * Math.PI * 2; else if (st.kind === 1) h.rotation.x = Math.sin(k * Math.PI * 4) * 0.35; else h.rotation.z = Math.sin(k * Math.PI * 6) * 0.3; }
    else { h.rotation.x *= 0.9; h.rotation.z *= 0.9; } });
  INTERACTS.push({ x, z: z + 1.2, r: 2.4, label: '🤖 Talk to B.U.R.P.', fn: openBurpTerminal });
}
function openBurpTerminal() {
  openDlg('Ship assistant', 'B.U.R.P.'); const say = t => { $('dlgLine').textContent = t; burpSay(t); };
  say("Hello. What do you need?");
  acts([['Explain things again', () => { closeDlg(); burpGuide(true); }, true], ['Say something', () => say(BURP_IDLE[Math.floor(Math.random() * BURP_IDLE.length)])], ['Bye', closeDlg]]);
}
{ const _b = LEVELS.ship.build; LEVELS.ship.build = function () { _b.apply(this, arguments); try { burpTerminal(); } catch (e) { console.warn('burp terminal', e); } }; }

// the hologram guide: floats in front of you and walks through the basics, one line at a time
function burpGuide(replay) {
  if (BG.holo && BG.holo.parent) return; S.flags = S.flags || {}; S.flags.burpGuide = 1; markDirty();
  const h = burpHead(true); h.scale.setScalar(0.9); levelGroup.add(h); BG.holo = h; const t0 = performance.now();
  const glowRing = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 24), new THREE.MeshBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); glowRing.rotation.x = -Math.PI / 2; h.add(glowRing); glowRing.position.y = -0.6;
  const place = () => { if (!h.parent) return; const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw), t = (performance.now() - t0) / 1000;
    h.position.set(player.pos.x + fx * 1.9 + rx * 0.7, 1.55 + Math.sin(t * 2) * 0.05, player.pos.z + fz * 1.9 + rz * 0.7); h.rotation.y = player.yaw + Math.sin(t) * 0.15;
    h.traverse(o => { if (o.material) o.material.opacity = (o === glowRing ? 0.3 : 0.4) * (0.8 + Math.random() * 0.2); }); requestAnimationFrame(place); };
  place();
  const step = i => { if (i >= BURP_GUIDE.length) { closeDlg(); levelGroup.remove(h); BG.holo = null; return; }
    openDlg('Hologram · ship assistant', 'B.U.R.P.'); $('dlgLine').textContent = BURP_GUIDE[i]; burpSay(BURP_GUIDE[i]);
    acts([[i === BURP_GUIDE.length - 1 ? 'Got it' : 'Next ▸', () => step(i + 1), true], ...(i < BURP_GUIDE.length - 1 ? [['Skip', () => step(BURP_GUIDE.length)]] : [])]); };
  step(0);
}
// new characters get the guide once, a moment after they first stand on the ship
setInterval(() => { try { if (state !== 'play' || LEVEL.id !== 'ship' || dlgOpen || CUT.on) return; const F = S.flags || {}; if (F.burpGuide || !(F.shipIntro || F.prologue1) || (S.lvl || 1) > 3) return;
  if (!BG.wait) { BG.wait = performance.now(); return; } if (performance.now() - BG.wait > 2500) { BG.wait = 0; burpGuide(); } } catch (_) {} }, 500);
