// =================== BODY TYPE: male or female trooper ===================
// stored as a 6th part of the face code (look.f = "s.e.m.h.hc.f"), so it travels with presence to other players
const isFemale = L => String((L && L.f) || '').split('.')[5] === 'f';
function sexTag() { return isFemale(S.look) ? '.f' : '.m'; }
function setSex(f) { const p = String((S.look && S.look.f) || '0.0.0.0.0').split('.').slice(0, 5); while (p.length < 5) p.push('0'); S.look = Object.assign({}, S.look || {}, { f: p.join('.') + (f ? '.f' : '.m') }); }
{ const _mp = makePlayerChar; makePlayerChar = function (look, col) {
  const g = _mp(look, col); if (!isFemale(look)) return g;
  for (const c of g.children) { const p = c.position;
    if (p.y > 1.2 && p.y < 1.62 && Math.abs(p.x) > 0.25) p.x *= 0.86;            // shoulders and arms in
    else if (p.y > 1.15 && p.y < 1.5 && Math.abs(p.x) < 0.05) c.scale.x *= 0.86;   // slimmer chest plate
    else if (p.y > 0.95 && p.y < 1.12 && Math.abs(p.x) < 0.05) c.scale.x *= 0.84;  // narrower waist
    else if (p.y > 0.7 && p.y < 0.9) p.x *= 1.06;                                     // a touch wider at the hips
  }
  // contoured chest armor
  const plate = toon(ARMORS[look.a] && ARMORS[look.a].trim || C.tan);
  for (const s of [-1, 1]) { const m = part(g, new THREE.SphereGeometry(0.1, 8, 6), plate, 0.09 * s, 1.36, 0.14); m.scale.set(1, 0.85, 0.7); }
  // ponytail out the back of the helmet
  const F = typeof faceOf === 'function' ? faceOf(look) : { hc: 0 }, hc = (typeof FACE !== 'undefined' ? FACE.hairC[F.hc % FACE.hairC.length] : '#5a3a22');
  if (look.h !== 'wizhat') { part(g, Cy(0.05, 0.035, 0.32, 6), toon(hc), 0, 1.6, -0.2, 0.35); part(g, new THREE.SphereGeometry(0.055, 6, 5), toon(hc), 0, 1.75, -0.16); }
  g.scale.setScalar(0.97);
  return g; }; }
// ---- start screen: Male / Female ----
{ const f = document.createElement('div'); f.className = 'field'; f.innerHTML = '<label>Character</label><div class="swatches" id="sexPick"></div>';
  const after = $('swatches').closest('.field'); after.after(f);
  const mk = (t, fem) => { const b = document.createElement('button'); b.className = 'pbtn'; b.style.cssText = 'padding:5px 12px;min-width:0'; b.textContent = t; b.addEventListener('click', () => { setSex(fem); SFX.ui && SFX.ui(); paintSex(); if (S.t) { markDirty(); try { sendPresence(true); } catch (_) {} } }); return b; };
  const bm = mk('♂ Male', false), bf = mk('♀ Female', true); $('sexPick').append(bm, bf);
  window.paintSex = () => { const fem = isFemale(S.look); bm.classList.toggle('go', !fem); bf.classList.toggle('go', fem); bm.setAttribute('aria-pressed', String(!fem)); bf.setAttribute('aria-pressed', String(fem)); try { if (typeof placeMannequin === 'function') placeMannequin(); } catch (_) {} };
  setTimeout(() => { try { paintSex(); } catch (_) {} }, 0); }
{ const _fs = fillStart; fillStart = function () { _fs(); try { paintSex(); } catch (_) {} }; }
