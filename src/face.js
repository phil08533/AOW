// =================== CHARACTER CREATOR: faces from the 2×3 head-design sheet ===================
const FACE = {
  skin: ['#e0b892', '#c58a64', '#8a5a3a', '#5a3a24', '#7fae63', '#6a9ad8', '#9aa1aa', '#a86ad8'],
  skinN: ['Light', 'Tan', 'Brown', 'Deep', 'Alien green', 'Alien blue', 'Chrome', 'Violet'],
  eyesN: ['Normal', 'Angry', 'Visor strip', 'Cyclops', 'Bug eyes', 'Goggles', 'Scar', 'Glowing'],
  mouthN: ['None', 'Grin', 'Beard', 'Mandibles', 'Respirator', 'Tusks'],
  hairN: ['Bald', 'Buzz cut', 'Mohawk', 'Spikes', 'Ponytail', 'Antennae', 'Horns', 'Fin crest', 'Afro', 'Topknot'],
  hairC: ['#1e1a18', '#5a3a22', '#c9a43a', '#e8e4dc', '#c8402f', '#4fd2ff', '#6fdc5a', '#c86aff']
};
window.FACE = FACE;
const faceOf = L => { const p = String((L && L.f) || '0.0.0.0.0').split('.').map(Number); return { s: p[0] || 0, e: p[1] || 0, m: p[2] || 0, h: p[3] || 0, hc: p[4] || 0 }; };

FACE.eyesBuild = [
  (g, y, hc, sk) => { for (const s of [-1, 1]) { E(g, '#ffffff', 0.06 * s, y + 0.03, 0.14, 0.035, 0.035, 0.02); E(g, '#1a1a1e', 0.06 * s, y + 0.03, 0.155, 0.017, 0.017, 0.01); } },
  (g, y, hc, sk) => { for (const s of [-1, 1]) { E(g, '#ffffff', 0.06 * s, y + 0.03, 0.14, 0.035, 0.035, 0.02); E(g, '#1a1a1e', 0.06 * s, y + 0.03, 0.155, 0.017, 0.017, 0.01); part(g, B(0.08, 0.018, 0.02), hc, 0.06 * s, y + 0.075, 0.15, 0, 0, 0.35 * s); } },
  (g, y, hc, sk) => { part(g, B(0.28, 0.05, 0.04), glow('#4fd2ff'), 0, y + 0.03, 0.14); },
  (g, y, hc, sk) => { E(g, '#ffffff', 0, y + 0.03, 0.14, 0.06, 0.06, 0.02); E(g, '#c8402f', 0, y + 0.03, 0.155, 0.03, 0.03, 0.01); },
  (g, y, hc, sk) => { for (const s of [-1, 1]) for (const k of [0, 1]) E(g, glow(k ? '#ffd23a' : '#ff6a1a'), (0.05 + k * 0.05) * s, y + 0.04 + k * 0.03, 0.13 - k * 0.02, 0.025, 0.025, 0.02); },
  (g, y, hc, sk) => { for (const s of [-1, 1]) { part(g, Cy(0.045, 0.045, 0.05, 10), '#c9a43a', 0.06 * s, y + 0.03, 0.14, Math.PI / 2); part(g, Cy(0.034, 0.034, 0.052, 10), glow('#ffb347'), 0.06 * s, y + 0.03, 0.145, Math.PI / 2); } part(g, B(0.34, 0.02, 0.02), '#2b2a2c', 0, y + 0.03, 0.05); },
  (g, y, hc, sk) => { for (const s of [-1, 1]) { E(g, '#ffffff', 0.06 * s, y + 0.03, 0.14, 0.035, 0.035, 0.02); E(g, '#1a1a1e', 0.06 * s, y + 0.03, 0.155, 0.017, 0.017, 0.01); } part(g, B(0.015, 0.12, 0.01), '#8a3a2e', 0.07, y + 0.03, 0.16, 0, 0, 0.3); },
  (g, y, hc, sk) => { for (const s of [-1, 1]) E(g, glow('#7fff6a'), 0.06 * s, y + 0.03, 0.14, 0.04, 0.025, 0.02); }
];

FACE.mouthBuild = [
  () => {},
  (g, y) => { part(g, B(0.08, 0.014, 0.01), '#3a1a18', 0, y - 0.07, 0.155); },
  (g, y, hc) => { E(g, hc, 0, y - 0.09, 0.08, 0.13, 0.08, 0.1); },
  (g, y) => { for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.02, 0.1, 4), '#3a2c1c', 0.04 * s, y - 0.12, 0.13, 0.4, 0, -0.4 * s); },
  (g, y) => { part(g, B(0.14, 0.08, 0.06), '#3a3d44', 0, y - 0.07, 0.14); for (const s of [-1, 1]) part(g, Cy(0.025, 0.025, 0.04, 8), '#5d636c', 0.07 * s, y - 0.08, 0.16, Math.PI / 2); },
  (g, y) => { for (const s of [-1, 1]) part(g, new THREE.ConeGeometry(0.018, 0.08, 4), '#efe7d6', 0.05 * s, y - 0.06, 0.14); }
];

FACE.hairBuild = [
  () => {},
  (g, y, hc) => { E(g, hc, 0, y + 0.08, -0.01, 0.165, 0.11, 0.165); },
  (g, y, hc) => { for (let k = 0; k < 6; k++) part(g, B(0.04, 0.1, 0.05), hc, 0, y + 0.19 - Math.abs(k - 2.5) * 0.008, -0.13 + k * 0.05); },
  (g, y, hc) => { for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; part(g, new THREE.ConeGeometry(0.03, 0.13, 4), hc, Math.cos(a) * 0.1, y + 0.17, Math.sin(a) * 0.1, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); } },
  (g, y, hc) => { E(g, hc, 0, y + 0.08, -0.02, 0.165, 0.11, 0.165); chain(g, [[0, y + 0.06, -0.16], [0, y - 0.05, -0.22], [0, y - 0.2, -0.22]], 0.035, hc, 0.02); },
  (g, y) => { for (const s of [-1, 1]) { part(g, Cy(0.006, 0.006, 0.22, 4), '#2b2a2c', 0.06 * s, y + 0.25, 0, 0, 0, -0.25 * s); E(g, glow('#6fdc5a'), 0.09 * s, y + 0.36, 0, 0.025, 0.025, 0.025); } },
  (g, y) => { for (const s of [-1, 1]) chain(g, [[0.12 * s, y + 0.1, 0], [0.22 * s, y + 0.18, 0.02], [0.24 * s, y + 0.32, 0.08]], 0.035, '#efe7d6', 0.01); },
  (g, y, hc, sk) => { for (let k = 0; k < 5; k++) part(g, B(0.02, 0.12 + Math.sin(k / 4 * Math.PI) * 0.08, 0.06), sk, 0, y + 0.18, -0.1 + k * 0.05); },
  (g, y, hc) => { E(g, hc, 0, y + 0.12, -0.02, 0.24, 0.2, 0.24); },
  (g, y, hc) => { E(g, hc, 0, y + 0.06, -0.01, 0.165, 0.1, 0.165); E(g, hc, 0, y + 0.22, -0.04, 0.06, 0.06, 0.06); }
];

function buildFace(g, F) {
  const sk = FACE.skin[F.s % FACE.skin.length], hc = FACE.hairC[F.hc % FACE.hairC.length], y = 1.77;
  E(g, sk, 0, y, 0.01, 0.16, 0.18, 0.16);
  const eFn = FACE.eyesBuild[F.e % FACE.eyesBuild.length] || FACE.eyesBuild[0];
  if (eFn) eFn(g, y, hc, sk);
  const mFn = FACE.mouthBuild[F.m % FACE.mouthBuild.length] || FACE.mouthBuild[0];
  if (mFn) mFn(g, y, hc, sk);
  const hFn = FACE.hairBuild[F.h % FACE.hairBuild.length] || FACE.hairBuild[0];
  if (hFn) hFn(g, y, hc, sk);
}
HELMS.face = { name: 'No helmet (show your face)', lvl: 1 };
HELM_KITS.face = function (g, look) {
  for (let i = g.children.length - 1; i >= 0; i--) { const c = g.children[i]; if (c.position.y > 1.65 && Math.abs(c.position.x) < 0.26 && Math.abs(c.position.z) < 0.3) g.remove(c); }
  buildFace(g, faceOf(look));
};
{ const _mp = makePlayerChar; makePlayerChar = function (look, col) {
  const g = _mp(look, col); if (look && look.h === 'face' && !g.userData._face) { g.userData._face = true; HELM_KITS.face(g, look); } return g; }; }
function renderFace(rows, refresh) {
  rows.textContent = ''; const F = faceOf(S.look || {});
  $('dlgLine').textContent = 'Build your face. Pick "No helmet" in the Helmets tab to show it off (we switched it on for you).';
  const set = (k, d, n) => { F[k] = (F[k] + d + n) % n; S.look = Object.assign({}, myLook(), { f: [F.s, F.e, F.m, F.h, F.hc].join('.') + sexTag(), h: 'face' }); markDirty(); sendPresence(true); SFX.ui(); renderFace(rows, refresh); refresh(); };
  [['Skin', 's', FACE.skinN], ['Eyes', 'e', FACE.eyesN], ['Mouth', 'm', FACE.mouthN], ['Hair / top', 'h', FACE.hairN], ['Hair color', 'hc', FACE.hairC.map((c, i) => ['Black', 'Brown', 'Blond', 'White', 'Red', 'Blue', 'Green', 'Purple'][i])]].forEach(([lab, k, names]) => {
    const r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${lab}: ${names[F[k] % names.length]}`;
    const a = document.createElement('button'), b = document.createElement('button'); a.className = b.className = 'pbtn'; a.style.padding = b.style.padding = '5px 12px'; a.textContent = '◀'; b.textContent = '▶';
    a.addEventListener('click', () => set(k, -1, names.length)); b.addEventListener('click', () => set(k, 1, names.length)); r.append(nm, a, b); rows.appendChild(r); });
  const r = document.createElement('div'); r.className = 'rowi nodot'; const nm = document.createElement('span'); nm.textContent = `${FACE.skinN.length * FACE.eyesN.length * FACE.mouthN.length * FACE.hairN.length * FACE.hairC.length} possible faces`;
  const rb = document.createElement('button'); rb.className = 'pbtn'; rb.style.padding = '5px 12px'; rb.textContent = '🎲 Random';
  rb.addEventListener('click', () => { S.look = Object.assign({}, myLook(), { f: [randi(0, 7), randi(0, 7), randi(0, 5), randi(0, 9), randi(0, 7)].join('.') + sexTag(), h: 'face' }); markDirty(); sendPresence(true); SFX.item(); renderFace(rows, refresh); refresh(); });
  r.append(nm, rb); rows.appendChild(r);
}

// Added Helmet: Short Horns
HELMS.short_horns = { name: "Short Horns", lvl: 1 };
HELM_KITS.short_horns = function (g) {
  for (const s of [-1, 1])
    chain(g, [[0.14 * s, 1.85, 0], [0.21 * s, 1.91, 0.02], [0.24 * s, 2.0, 0.05]], 0.04, '#efe7d6', 0.012);
};
