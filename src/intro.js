// =================== INTRO: studio card, game title, legal ===================
// Plays once per page load before the start screen. Tap or any key skips a card. S is not loaded yet, so the accepted-terms flag lives in localStorage.
const STUDIO = { name: 'Blork Studios', video: null }; // swap in the logo/video when Phil sends them
const LEGAL_VER = 1;
const LEGAL = {
  terms: ['Terms of Service', [
    'By playing Art of War: Setting Sun you agree to these terms. If you do not agree, do not play.',
    'Age. You must be at least 13 years old, or the minimum age to use online services where you live. If you are under 18, a parent or guardian should review these terms with you.',
    'Conduct. Do not harass, threaten or impersonate other players. Do not use hateful, sexual or offensive names, chat or server names. Do not cheat, exploit bugs on purpose, or attack servers or other players\' devices.',
    'Player servers. Servers are run by players, not by Blork Studios. Hosts set their own rules and are responsible for what happens on their server. We may remove any public listing that breaks these terms.',
    'Your content. You keep what you make. By sharing names, chat or builds in multiplayer you let other players see them while playing.',
    'Virtual items. Credits, gear and other in-game items have no real-world value and cannot be sold or exchanged for money.',
    'Enforcement. We may limit or block access for anyone who breaks these terms.',
    'No warranty. The game is provided as is. Saves can be lost, servers can go down. To the extent the law allows, Blork Studios is not liable for losses from using the game.',
    'Changes. We may update these terms. Continuing to play after an update means you accept it.']],
  privacy: ['Privacy', [
    'Saves. Your characters and progress are stored on your device. Clearing your browser data deletes them.',
    'Multiplayer. When you play online, other players on the same server see your callsign, character, position and chat. Server hosts can see who joined.',
    'We do not sell your data and we do not run ads that track you.',
    'Children. We do not knowingly collect personal information from children under 13.',
    'Questions or removal requests: contact Blork Studios.']],
  eula: ['License', [
    'Blork Studios grants you a personal, non-exclusive license to play the game. You may not resell, redistribute or claim the game as your own.',
    'Art of War: Setting Sun, its characters, art and code are owned by Blork Studios. All rights reserved.']],
  credits: ['Credits', ['A Blork Studios game.', 'Created by Phil and Caleb.', 'Built with three.js (MIT license).']]
};
function legalOpen(k) { const L = LEGAL[k], d = document.createElement('div'); d.className = 'introLegal';
  d.innerHTML = `<div class="ilBox"><h2>${L[0]}</h2>${L[1].map(p => `<p>${p}</p>`).join('')}<button class="cta win">Close</button></div>`;
  d.querySelector('button').onclick = () => d.remove(); document.body.appendChild(d); }
// bad-word filter for callsigns, chat and server names
const BAD_WORDS = ['fuck', 'shit', 'cunt', 'nigg', 'fag', 'retard', 'rape', 'nazi', 'hitler', 'whore', 'slut', 'bitch', 'dick', 'cock', 'pussy', 'porn', 'kkk', 'chink', 'spic', 'kike'];
function badName(s) { const n = String(s || '').toLowerCase().replace(/[0@]/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[4]/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't').replace(/[^a-z]/g, ''); return BAD_WORDS.some(w => n.includes(w)); }
function cleanName(s, fb) { return badName(s) ? fb : s; }
let showTitleRef = () => {};
(function introRun() {
  const css = document.createElement('style'); css.textContent = `
#introCov{position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;transition:opacity .8s}
#introCov .ic{opacity:0;transition:opacity 1s;text-align:center;color:#fff;font-family:inherit}
#introCov .ic.on{opacity:1}
#introCov .studio{font-size:clamp(28px,6vw,56px);font-weight:900;letter-spacing:.04em;color:#7dff6a;text-shadow:0 0 30px #3aff2a88}
#introCov .studio small{display:block;font-size:.3em;letter-spacing:.5em;color:#cfe;margin-top:10px;font-weight:600}
#introCov .drop{position:relative;width:64px;height:60px;margin:0 auto 18px;background:#7dff6a;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;box-shadow:0 0 30px #3aff2a;animation:icd 1.4s ease-in}
#introCov .shades{position:absolute;left:8px;right:8px;top:20px;height:12px;background:#0a0a0a;border-radius:3px 3px 10px 10px;box-shadow:inset 0 2px 0 #444}#introCov .shades:before,#introCov .shades:after{content:'';position:absolute;top:0;width:18px;height:14px;background:#0a0a0a;border-radius:2px 2px 9px 9px}#introCov .shades:before{left:0}#introCov .shades:after{right:0}
@keyframes icd{0%{transform:translateY(-60vh) scaleY(1.4)}70%{transform:translateY(0) scaleY(1.2)}85%{transform:scale(1.3,.6)}100%{transform:none}}
#introCov .gt{font-size:clamp(34px,8vw,84px);font-weight:900;color:#fff;letter-spacing:.06em;line-height:1}
#introCov .gt span{color:#ff5a3a}#introCov .gs{color:#ff8a4a;letter-spacing:.6em;font-size:clamp(12px,2vw,18px);margin-top:12px}
#introCov .gt,#introCov .gs,#introCov .pk{text-shadow:0 3px 0 #000,0 0 14px #000,0 0 4px #000}#bootLoad{z-index:10001}html:not(.ready) #introCov .pk{visibility:hidden}
#introCov .pk{margin-top:40px;font-size:14px;letter-spacing:.3em;color:#ccd;animation:icp 1.6s infinite}@keyframes icp{50%{opacity:.25}}
.introLegal{position:fixed;inset:0;z-index:10000;background:#000c;display:flex;align-items:center;justify-content:center;padding:16px}
.introLegal .ilBox{max-width:620px;max-height:85vh;overflow:auto;background:#12141a;border:1px solid #333;border-radius:10px;padding:20px;color:#dde;font-size:14px;line-height:1.5}
.introLegal h2{margin:0 0 10px}#legalRow{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;font-size:12px;margin-top:6px}
#legalRow a{color:#9ab;cursor:pointer;text-decoration:underline}#tosRow{font-size:12px;display:flex;gap:8px;align-items:center;justify-content:center}`;
  document.head.appendChild(css);
  // the studio card is already in the page markup so it shows the moment the page opens
  let cov = document.getElementById('introCov');
  if (!cov) { cov = document.createElement('div'); cov.id = 'introCov'; document.body.appendChild(cov); }
  if (!cov.querySelector('#ic1')) cov.insertAdjacentHTML('beforeend', '<div class="ic on" id="ic1"></div>');
  // the Blork logo shot (blork.js); the old slime card only if WebGL is unavailable
  let blork = null; { const c = cov.querySelector('#ic1'); c.style.cssText = 'position:absolute;inset:0';
    try { blork = blorkIntro(c, () => setTimeout(showTitleRef, 250)); } catch (e) { console.warn('blork', e); c.style.cssText = 'text-align:center'; c.innerHTML = `<div class="drop"><i class="shades"></i></div><div class="studio">BLORK<small>STUDIOS</small></div>`; setTimeout(() => showTitleRef(), 3200); } }
  // card -> title -> (player input, once the game is ready) -> start screen. Each stage runs once, whatever calls it.
  const c1 = () => cov.querySelector('#ic1'), ready = () => document.documentElement.classList.contains('ready');
  let stage = 'card', inputAt = 0;
  const showTitle = () => { if (stage !== 'card') return; stage = 'title'; if (blork) blork.finish(); inputAt = performance.now() + 900; const c = c1(); if (c) c.classList.remove('on');
    setTimeout(() => { if (c) c.remove(); const g = document.createElement('div'); g.className = 'ic'; g.innerHTML = `<div class="gt">ART <span>OF</span> WAR</div><div class="gs">SETTING SUN</div><div class="pk">PRESS ANY KEY</div>`; g.style.cssText = 'position:relative;z-index:1'; try { titleCrest(cov); } catch (e) { console.warn('crest', e); } cov.appendChild(g);
      requestAnimationFrame(() => { g.classList.add('on'); }); try { SFX.coin(); } catch (_) {} }, 700); };
  const finish = () => { if (stage === 'done') return; stage = 'done'; const cr = cov.querySelector('.crest'); if (cr && cr.stop) cr.stop(); cov.style.opacity = 0; setTimeout(() => cov.remove(), 800); };
  const onInput = e => { if (!e.isTrusted || !document.getElementById('introCov')) return; if (stage === 'card') { if (performance.now() > 600) showTitle(); } else if (stage === 'title' && ready() && performance.now() > inputAt) finish(); };
  cov.addEventListener('click', onInput); addEventListener('keydown', onInput);
  { const c = c1(); if (c) c.classList.add('on'); } showTitleRef = showTitle; if (!blork) setTimeout(showTitle, 3200);
  // legal links + terms acceptance on the start screen
  const pb = document.getElementById('playBtn'); if (!pb) return;
  let ok = false; try { ok = +localStorage.getItem('aow-tos') >= LEGAL_VER; } catch (_) {}
  const row = document.createElement('div'); row.id = 'legalRow'; row.innerHTML = Object.keys(LEGAL).map(k => `<a data-k="${k}">${LEGAL[k][0]}</a>`).join('') + `<span style="color:#667">© ${new Date().getFullYear()} ${STUDIO.name}</span>`;
  row.onclick = e => { const k = e.target.dataset && e.target.dataset.k; if (k) legalOpen(k); };
  pb.after(row);
  if (!ok) { const t = document.createElement('label'); t.id = 'tosRow'; t.innerHTML = `<input type="checkbox" id="tosChk"> I am 13 or older and agree to the <a style="color:#9cf;text-decoration:underline" data-k="terms">Terms</a> and <a style="color:#9cf;text-decoration:underline" data-k="privacy">Privacy</a>`;
    t.onclick = e => { const k = e.target.dataset && e.target.dataset.k; if (k) { e.preventDefault(); legalOpen(k); } }; pb.before(t);
    pb.addEventListener('click', e => { if (!document.getElementById('tosChk').checked) { e.stopImmediatePropagation(); t.style.color = '#ff6a5a'; return; } try { localStorage.setItem('aow-tos', LEGAL_VER); } catch (_) {} t.remove(); }, true); }
  const ni = document.getElementById('nickIn'); if (ni) ni.addEventListener('change', () => { if (badName(ni.value)) { ni.value = ''; ni.placeholder = 'Pick a different callsign'; } });
})();
