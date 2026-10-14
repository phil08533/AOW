// =================== FIRST LAUNCH: pick your look and your music ===================
// Shown once, the first time you press Start. Default is PS1 render + Crisp Toon + Sharp pixels.
const LOOKS = [
  { id: 'ps1crisp', name: 'PS1 Crisp', tag: 'Recommended · retro PS1 models, clean toon colors, sharp pixels', style: 'retro', gfx: 2, pix: 2 },
  { id: 'ps1classic', name: 'Classic PS1', tag: 'Chunky pixels and dithering, like 1998', style: 'retro', gfx: 0, pix: 1 },
  { id: 'hd', name: 'HD Stylized', tag: 'Full resolution, smooth textures, real-time shadows', style: 'stylized', gfx: 2, pix: 2 },
  { id: 'real', name: 'Semi-Realistic', tag: 'Most detailed. Needs a stronger device', style: 'real', gfx: 2, pix: 2 }
];
const MUSIC_PICK = [[3, 'Soundtrack'], [2, 'Retro beeps'], [0, 'Off']];
function lookNow() { return LOOKS.find(L => L.style === RSTYLE && L.gfx === (PREFS.gfx == null ? 2 : PREFS.gfx) && L.pix === PREFS.pix) || (RSTYLE === 'retro' ? null : LOOKS.find(L => L.style === RSTYLE)); }
function openLookPicker(done) {
  const ov = document.createElement('div'); ov.id = 'lookPick';
  ov.style.cssText = 'position:fixed;inset:0;z-index:70;background:rgba(3,5,20,.94);color:#e8ecf8;font-family:var(--ui);overflow-y:auto;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 18px)';
  let pick = (lookNow() || LOOKS[0]).id, mus = PREFS.music === 1 ? 2 : (PREFS.music == null ? 3 : PREFS.music);
  const render = () => {
    ov.innerHTML = `<div style="max-width:880px;margin:0 auto">
      <div style="font-family:var(--hud);font-size:clamp(22px,5vw,34px);color:#ffd36a;text-align:center;letter-spacing:.06em">CHOOSE YOUR LOOK</div>
      <div style="text-align:center;opacity:.8;margin:4px 0 14px">You can change this any time in Menu → Settings, along with the music.</div>
      <div id="lookGrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px"></div>
      <div style="font-family:var(--hud);font-size:18px;color:#ffd36a;margin:18px 0 8px;text-align:center">MUSIC</div>
      <div id="musRow" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"></div>
      <div style="text-align:center;margin-top:12px;position:sticky;bottom:-18px;padding:10px 0 18px;background:linear-gradient(rgba(3,5,20,0),rgba(3,5,20,.96) 35%)"><button class="cta win" id="lookGo" style="min-width:220px">Play</button></div></div>`;
    const grid = ov.querySelector('#lookGrid');
    for (const L of LOOKS) { const b = document.createElement('button'); const on = L.id === pick;
      b.style.cssText = `text-align:left;padding:0;cursor:pointer;background:rgba(6,10,46,.7);color:inherit;font:inherit;border:2px solid ${on ? '#ffd36a' : 'rgba(232,236,248,.25)'};border-radius:6px;overflow:hidden;box-shadow:${on ? '0 0 0 3px rgba(255,211,106,.25)' : 'none'}`;
      b.innerHTML = `<div style="aspect-ratio:16/9;background:#0a0f2a url('shots/${L.id}.jpg') center/cover no-repeat"></div><div style="padding:8px 10px"><b style="color:${on ? '#ffd36a' : '#fff'}">${on ? '✔ ' : ''}${L.name}</b><div style="font-size:13px;opacity:.75;margin-top:2px">${L.tag}</div></div>`;
      b.addEventListener('click', () => { pick = L.id; SFX.ui(); render(); }); grid.appendChild(b); }
    const row = ov.querySelector('#musRow');
    for (const [v, label] of MUSIC_PICK) { const b = document.createElement('button'); b.className = 'pbtn' + (v === mus ? ' go' : ''); b.textContent = (v === mus ? '✔ ' : '') + label; b.addEventListener('click', () => { mus = v; SFX.ui(); render(); }); row.appendChild(b); }
    ov.querySelector('#lookGo').addEventListener('click', () => {
      const L = LOOKS.find(x => x.id === pick); PREFS.gfx = L.gfx; PREFS.pix = L.pix; PREFS.style = L.style; PREFS.music = mus; PREFS.lookPicked = 1; savePrefs();
      SFX.setMusic(PREFS.music); try { musTick(); } catch (_) {} applyGfx(); resize(); renderSettings(); ov.remove();
      if (L.style !== RSTYLE) { toast('LOADING', L.name, 3); setTimeout(() => location.reload(), 300); return; }
      done();
    });
  };
  render(); document.body.appendChild(ov);
}
$('playBtn').addEventListener('click', e => {
  if (PREFS.lookPicked || $('lookPick')) return;
  e.stopImmediatePropagation(); SFX.init(); openLookPicker(() => $('playBtn').click());
}, true);
