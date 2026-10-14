// ---------------- phone message log (2.12) ----------------
// On short screens the log sits under the quest tracker with little room, so keep the newest three
// lines, fade them sooner, and give them a soft backing so they read over bright scenes.
const LOG_PHONE = () => innerHeight <= 520 || innerWidth <= 600;
{ const _log = log; log = function (text, cls, who) {
  _log(text, cls, who);
  if (!LOG_PHONE()) return;
  const L = $('log'), d = L.lastElementChild; while (L.children.length > 3) L.removeChild(L.firstChild);
  if (d) { setTimeout(() => { d.style.opacity = 0; }, cls === 'chat' ? 8000 : 5000); setTimeout(() => d.remove(), cls === 'chat' ? 9200 : 6200); }
}; }
{ const st = document.createElement('style'); st.textContent = `
@media (pointer: fine) and (min-height: 521px) { body #hud #log { bottom: calc(env(safe-area-inset-bottom, 0px) + 158px); } }
@media (max-height: 520px), (max-width: 600px) {
  #log { max-height: none !important; gap: 3px; font-size: 12.5px !important; }
  #log div { background: rgba(8,12,20,.42); border-radius: 6px; padding: 2px 7px; width: fit-content; max-width: 100%;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
}`; document.head.appendChild(st); }
