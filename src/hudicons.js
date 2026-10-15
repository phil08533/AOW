// =================== HUD ICONS (2.14.4): our own drawn icons for the camera and repair buttons ===================
// The ship's cockpit/chase camera and the car's camera share one icon, so the same job always looks the same.
const ICON_CAM = `<svg viewBox="0 0 48 48" width="70%" height="70%" aria-hidden="true"><g stroke="#0b0f1c" stroke-width="2" stroke-linejoin="round">
<circle cx="15" cy="12" r="7" fill="#c9a43a"/><circle cx="15" cy="12" r="2.4" fill="#0b0f1c"/><circle cx="29" cy="11" r="6" fill="#c9a43a"/><circle cx="29" cy="11" r="2" fill="#0b0f1c"/>
<rect x="5" y="19" width="28" height="20" rx="3" fill="#3a4250"/><rect x="8" y="22" width="9" height="5" rx="1" fill="#ffd36a" stroke-width="1.5"/>
<path d="M33 25 L44 19 V39 L33 33 Z" fill="#2a2f3a"/><circle cx="24" cy="31" r="4.5" fill="#4fd2ff"/></g><circle cx="22.6" cy="29.6" r="1.4" fill="#e8fbff"/></svg>`;
const ICON_REPAIR = `<svg viewBox="0 0 48 48" width="62%" height="62%" aria-hidden="true"><g stroke="#0b0f1c" stroke-width="2" stroke-linejoin="round">
<path d="M30 6 a10 10 0 0 0 -9.4 13.4 L7 33 a4 4 0 0 0 0 5.6 l2.4 2.4 a4 4 0 0 0 5.6 0 L28.6 27.4 A10 10 0 0 0 42 18 l-6 2 -6 -6 2 -6 z" fill="#cfd6e0"/>
<circle cx="11" cy="37" r="2" fill="#0b0f1c" stroke="none"/></g><path d="M34 30 l4 0 2 3.5 -2 3.5 -4 0 -2 -3.5z" fill="#ffd36a" stroke="#0b0f1c" stroke-width="1.6"/></svg>`;
function hudIconsApply() {
  const cam = [typeof SCOCK !== 'undefined' ? SCOCK.vb : null, document.getElementById('tCam')];
  cam.forEach(b => { if (b && !b.dataset.ico) { b.dataset.ico = 1; b.innerHTML = ICON_CAM + '<small>CAM</small>'; b.classList.add('icoBtn'); } });
  const r = document.getElementById('tRepair'); if (r && !r.dataset.ico) { r.dataset.ico = 1; r.innerHTML = ICON_REPAIR + '<small>REPAIR</small>'; r.classList.add('icoBtn'); }
}
setInterval(() => { try { hudIconsApply(); } catch (_) {} }, 1000);
document.head.insertAdjacentHTML('beforeend', `<style>
.icoBtn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; padding: 0 !important; line-height: 1; }
body.driving #tCam.icoBtn { display: flex !important; }
.icoBtn svg { flex: none; max-width: 34px; max-height: 34px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.6)); }
.icoBtn small { font: 700 8px var(--hud, sans-serif); letter-spacing: .05em; color: #fff; opacity: .9; margin-top: 1px; }
</style>`);
