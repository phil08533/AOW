// =================== SERVERS: browse, search, preview and join player-hosted Blork servers ===================
// Joining stores {url, pass} in sessionStorage and reloads; joinRoom() in the page then connects to that server instead of the built-in room.
const LOOKUP = 'https://blork-lookup.philip08533gonzales.workers.dev'; // the Cloudflare Worker address, e.g. https://blork-lookup.NAME.workers.dev
const RULE_LABEL = { pvp: ['PvP', v => ({ off: 'Off', on: 'On', zones: 'Zones only' })[v] || v], friendlyFire: ['Friendly fire', v => v ? 'On' : 'Off'], difficulty: ['Difficulty', v => v + 'x'], xpMult: ['XP', v => v + 'x'], lootMult: ['Loot', v => v + 'x'], paths: ['Paths', v => ({ both: 'Outlaw + Marshal', outlaw: 'Outlaw only', marshal: 'Marshal only' })[v] || v], civilians: ['Killing civilians', v => v ? 'Allowed' : 'Off'], startWorld: ['Start', v => v], devGear: ['Test gear', v => v ? 'Allowed' : 'Off'] };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function srvAddr(s) { s = String(s || '').trim(); if (!s) return null; if (/^wss?:\/\//.test(s)) return s; const m = s.match(/^([\w.\-]+|\[[0-9a-f:]+\])(?::(\d+))?$/i); return m ? `ws://${m[1]}:${m[2] || 7777}` : null; }
// ask over the WebSocket itself: works from https pages where a plain http fetch to the host's PC gets blocked
function srvInfo(url) { return new Promise((res, rej) => { let w; try { w = new WebSocket(url); } catch (e) { return rej(e); }
  const t = setTimeout(() => { try { w.close(); } catch (_) {} rej(new Error('timeout')); }, 5000);
  w.onopen = () => w.send(JSON.stringify({ type: 'info' }));
  w.onmessage = e => { try { const m = JSON.parse(e.data); if (m.type === 'info') { clearTimeout(t); w.close(); res(m.server); } } catch (_) {} };
  w.onerror = () => { clearTimeout(t); rej(new Error('unreachable')); }; }); }
function srvRules(r) { return Object.keys(RULE_LABEL).filter(k => r && k in r).map(k => `<span class="srR"><b>${RULE_LABEL[k][0]}</b> ${esc(RULE_LABEL[k][1](r[k]))}</span>`).join(''); }
function openServers() {
  const d = document.createElement('div'); d.className = 'introLegal'; d.id = 'srvDlg';
  d.innerHTML = `<div class="ilBox" style="max-width:720px;width:100%"><h2>Multiplayer</h2>
    ${LOOKUP ? `<div style="display:flex;gap:8px;margin-bottom:8px"><input id="srvQ" placeholder="Search servers" style="flex:1;min-width:0;box-sizing:border-box;padding:8px"><button class="cta" id="srvRef" title="Refresh">⟳ Refresh</button></div><div id="srvList" style="max-height:38vh;overflow:auto"></div>` : `<p style="color:#9ab">The public server list goes live once the lookup service is set up. You can still join by address.</p>`}
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><input id="srvAddr" placeholder="${LOOKUP ? 'Join code or address' : 'Address, like 192.168.1.5:7777'}" style="flex:1;min-width:180px;padding:8px"><button class="cta" id="srvPrev">Preview</button></div>
    <div style="margin-top:12px;padding:10px;border:1px solid #2a3040;border-radius:8px"><b>Host a server</b>
      <ol style="margin:6px 0 8px 18px;padding:0;font-size:13px;line-height:1.5">
        <li><a href="https://github.com/phil08533/AOW/archive/refs/heads/main.zip" target="_blank" rel="noopener" style="color:#9cf">Download the game files</a> and unzip them (skip this if you already have them).</li>
        <li>Open the <code>gameserver</code> folder and double-click <b>Host Server.bat</b> (Mac/Linux: <code>host-server.sh</code>). It sets itself up and opens a control panel.</li>
        <li>Come back here and press <b>Find my server</b>.</li></ol>
      <button class="cta" id="srvFind">Find my server</button><div id="srvMine" style="margin-top:8px;font-size:13px"></div></div>
    <details style="margin-top:10px;font-size:13px;line-height:1.5"><summary style="cursor:pointer;color:#9cf">How to join or host</summary>
      <p><b>Join a friend:</b> pick a server from the list, or type the 6-letter <b>join code</b> they give you. Then press Preview, then Join.</p>
      <p><b>Join by address:</b></p><ul style="margin:4px 0 8px 18px;padding:0">
        <li>Server on this same PC: <code>127.0.0.1:7777</code></li>
        <li>Server on another PC on your Wi-Fi: that PC's local address, like <code>192.168.1.23:7777</code>. On Windows, open Command Prompt on that PC, type <code>ipconfig</code>, and use the "IPv4 Address".</li></ul>
      <p><b>Host your own server:</b> in the game folder, run <code>npm install ws</code> once, then <code>node gameserver/server.js</code>. Keep that window open. It prints a <b>Join code</b> to share. Change its name, password and rules in <code>gameserver/server-config.json</code>, then restart it.</p>
      <p><b>Friends outside your home:</b> they join with your code, but your router must forward port <b>7777</b> to your PC first. Search "port forward" plus your router's brand for steps. If Windows asks to let Node through the firewall, click Allow.</p></details>
    <div id="srvView" style="margin-top:10px"></div>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">${sessionStorage.getItem('aow-server') ? '<button class="cta" id="srvLeave">Leave server</button>' : ''}<button class="cta win" id="srvClose">Close</button></div></div>
    <style>.srRow{display:flex;gap:10px;align-items:center;padding:8px;border-bottom:1px solid #222;cursor:pointer}.srRow:hover{background:#1c2030}.srR{display:inline-block;margin:2px 8px 2px 0;font-size:12px;color:#bcd}.srR b{color:#fff;font-weight:600}</style>`;
  document.body.appendChild(d); const $q = id => d.querySelector('#' + id);
  $q('srvClose').onclick = () => d.remove(); if ($q('srvLeave')) $q('srvLeave').onclick = () => { sessionStorage.removeItem('aow-server'); location.reload(); };
  const view = async (url, code) => { const v = $q('srvView'); v.textContent = 'Checking server...';
    try { const i = await srvInfo(url);
      v.innerHTML = `<h3 style="margin:4px 0">${esc(i.name)} ${i.locked ? '🔒' : ''}</h3><p style="margin:2px 0;color:#bcd">${esc(i.desc)}</p><p>${i.count}/${i.max} players${i.players && i.players.length ? ': ' + i.players.map(esc).join(', ') : ''}</p><div>${srvRules(i.rules)}</div>
        <p style="font-size:12px;color:#9ab">Your character comes with you. Server rules only change what you earn while you're there.</p>
        <div style="display:flex;gap:8px">${i.locked ? '<input id="srvPass" type="password" placeholder="Password" maxlength="128" style="flex:1;padding:8px">' : ''}<button class="cta win" id="srvJoin" ${i.count >= i.max ? 'disabled' : ''}>${i.count >= i.max ? 'Full' : 'Join'}</button></div>`;
      $q('srvJoin').onclick = () => { sessionStorage.setItem('aow-server', JSON.stringify({ url, code, pass: i.locked ? $q('srvPass').value : '' })); location.reload(); };
    } catch (_) { v.innerHTML = `<p style="color:#f87">Couldn't reach that server. Check the address, or the host may be offline.</p>`; } };
  $q('srvFind').onclick = () => { const M = $q('srvMine'); M.textContent = 'Looking for a server on this PC...';
    let w; try { w = new WebSocket('ws://127.0.0.1:7777'); } catch (_) { M.innerHTML = '<span style="color:#f87">No server found. Start Host Server first.</span>'; return; }
    const t = setTimeout(() => { try { w.close(); } catch (_) {} M.innerHTML = '<span style="color:#f87">No server found on this PC. Start Host Server, then press Find my server again.</span>'; }, 4000);
    w.onopen = () => w.send(JSON.stringify({ type: 'local' }));
    w.onerror = () => { clearTimeout(t); M.innerHTML = '<span style="color:#f87">No server found on this PC. Start Host Server, then press Find my server again.</span>'; };
    w.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (_) { return; } if (m.type !== 'local') return; clearTimeout(t); w.close();
      const rows = [['Join code', m.code || 'shows once the server list answers'], ['Same Wi-Fi', (m.lan || []).map(a => a + ':' + m.port).join(', ') || 'none found'], ['Internet', m.publicIp ? m.publicIp + ':' + m.port + ' (needs port ' + m.port + ' forwarded)' : 'unknown yet']];
      M.innerHTML = `<div style="color:#7dff6a;margin-bottom:4px">Your server is running.</div>` + rows.map(([l, v]) => `<div style="display:flex;gap:8px;align-items:center;margin:3px 0"><span style="flex:0 0 90px;color:#9ab">${l}</span><code style="flex:1">${esc(v)}</code>${/:\d+$|^[A-Z0-9]{6}$/.test(v) ? `<button class="cta" data-cp="${esc(v)}" style="padding:2px 8px">Copy</button>` : ''}</div>`).join('') +
        `<div style="display:flex;gap:8px;margin-top:8px"><button class="cta win" id="srvJoinMine">Join my server</button><a class="cta" href="${esc(m.panel)}" target="_blank" rel="noopener" style="text-decoration:none">Open control panel</a></div>`;
      M.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { try { navigator.clipboard.writeText(b.dataset.cp); b.textContent = 'Copied'; } catch (_) {} });
      $q('srvJoinMine').onclick = () => { $q('srvAddr').value = '127.0.0.1:' + m.port; $q('srvPrev').click(); }; }; };
  $q('srvPrev').onclick = async () => { const raw = $q('srvAddr').value.trim();
    if (LOOKUP && /^[A-Z0-9]{6}$/i.test(raw)) { try { const r = await (await fetch(LOOKUP + '/code/' + raw)).json(); if (r.error) throw r.error; return view(`ws://${r.host}:${r.port}`, raw.toUpperCase()); } catch (e) { $q('srvView').innerHTML = `<p style="color:#f87">${esc(typeof e === 'string' ? e : 'No server with that code is online.')}</p>`; return; } }
    const u = srvAddr(raw); if (!u) { $q('srvView').innerHTML = '<p style="color:#f87">That doesn\'t look like a server address.</p>'; return; } view(u); };
  if (LOOKUP) { let tm = 0; const load = async () => { const L = $q('srvList'); try { const rows = await (await fetch(LOOKUP + '/list?q=' + encodeURIComponent($q('srvQ').value))).json();
      L.innerHTML = rows.length ? rows.map(r => `<div class="srRow" data-c="${esc(r.code)}"><div style="flex:1"><b>${esc(r.name)}</b> ${r.locked ? '🔒' : ''}<div style="font-size:12px;color:#9ab">${esc(r.desc)}</div></div><div>${r.count}/${r.max}</div></div>`).join('') : '<p style="color:#9ab">No servers found.</p>';
      L.querySelectorAll('.srRow').forEach(el => el.onclick = () => { $q('srvAddr').value = el.dataset.c; $q('srvPrev').click(); }); } catch (_) { L.innerHTML = '<p style="color:#f87">Server list is offline right now.</p>'; } };
    $q('srvQ').oninput = () => { clearTimeout(tm); tm = setTimeout(load, 300); }; $q('srvRef').onclick = load; load();
    const auto = setInterval(() => { if (!document.body.contains(d)) return clearInterval(auto); load(); }, 15000); }
}
(function () { const pb = document.getElementById('playBtn'); if (!pb) return; const b = document.createElement('button'); b.className = 'cta'; b.id = 'mpBtn';
  let cur = null; try { cur = JSON.parse(sessionStorage.getItem('aow-server') || 'null'); } catch (_) {}
  b.textContent = cur ? 'Multiplayer · on a server' : 'Multiplayer'; b.style.marginTop = '6px'; b.onclick = openServers; pb.after(b); })();
// ---------- settings a server host locked ----------
// Locked values are served through a getter and never saved: savePrefs runs with the locks lifted, so leaving the server gives back the player's own choice.
const SRV_LOCK = {}; let SRV_INFO = null;
for (const k of ['subs', 'cuts']) { const d = Object.getOwnPropertyDescriptor(PREFS, k) || { value: PREFS[k], writable: true }; let v = d.value;
  Object.defineProperty(PREFS, k, { get: () => k in SRV_LOCK ? SRV_LOCK[k] : d.get ? d.get() : v, set: x => { if (d.set) d.set(x); else v = x; }, enumerable: true, configurable: true }); }
{ const _sp = savePrefs; savePrefs = function () { const held = Object.assign({}, SRV_LOCK); for (const k in SRV_LOCK) delete SRV_LOCK[k]; try { return _sp.apply(this, arguments); } finally { Object.assign(SRV_LOCK, held); } }; }
function srvApplyRules(info) { SRV_INFO = info; const L = (info.rules && info.rules.locks) || {};
  for (const k in SRV_LOCK) delete SRV_LOCK[k]; for (const k in L) SRV_LOCK[k] = L[k] === 'on';
  const n = Object.keys(L).length; if (typeof toast === 'function') toast(info.name || 'SERVER', n ? `Joined. The host locked ${n} setting${n > 1 ? 's' : ''}.` : 'Joined.', 3);
  if (typeof renderSettings === 'function') try { renderSettings(); } catch (_) {} }
