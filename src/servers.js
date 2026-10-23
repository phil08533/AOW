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
    ${LOOKUP ? `<input id="srvQ" placeholder="Search servers" style="width:100%;padding:8px;margin-bottom:8px"><div id="srvList" style="max-height:38vh;overflow:auto"></div>` : `<p style="color:#9ab">The public server list goes live once the lookup service is set up. You can still join by address.</p>`}
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><input id="srvAddr" placeholder="${LOOKUP ? 'Join code or address' : 'Address, like 192.168.1.5:7777'}" style="flex:1;min-width:180px;padding:8px"><button class="cta" id="srvPrev">Preview</button></div>
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
  $q('srvPrev').onclick = async () => { const raw = $q('srvAddr').value.trim();
    if (LOOKUP && /^[A-Z0-9]{6}$/i.test(raw)) { try { const r = await (await fetch(LOOKUP + '/code/' + raw)).json(); if (r.error) throw r.error; return view(`ws://${r.host}:${r.port}`, raw.toUpperCase()); } catch (e) { $q('srvView').innerHTML = `<p style="color:#f87">${esc(typeof e === 'string' ? e : 'No server with that code is online.')}</p>`; return; } }
    const u = srvAddr(raw); if (!u) { $q('srvView').innerHTML = '<p style="color:#f87">That doesn\'t look like a server address.</p>'; return; } view(u); };
  if (LOOKUP) { let tm = 0; const load = async () => { const L = $q('srvList'); try { const rows = await (await fetch(LOOKUP + '/list?q=' + encodeURIComponent($q('srvQ').value))).json();
      L.innerHTML = rows.length ? rows.map(r => `<div class="srRow" data-c="${esc(r.code)}"><div style="flex:1"><b>${esc(r.name)}</b> ${r.locked ? '🔒' : ''}<div style="font-size:12px;color:#9ab">${esc(r.desc)}</div></div><div>${r.count}/${r.max}</div></div>`).join('') : '<p style="color:#9ab">No servers found.</p>';
      L.querySelectorAll('.srRow').forEach(el => el.onclick = () => { $q('srvAddr').value = el.dataset.c; $q('srvPrev').click(); }); } catch (_) { L.innerHTML = '<p style="color:#f87">Server list is offline right now.</p>'; } };
    $q('srvQ').oninput = () => { clearTimeout(tm); tm = setTimeout(load, 300); }; load(); }
}
(function () { const pb = document.getElementById('playBtn'); if (!pb) return; const b = document.createElement('button'); b.className = 'cta'; b.id = 'mpBtn';
  let cur = null; try { cur = JSON.parse(sessionStorage.getItem('aow-server') || 'null'); } catch (_) {}
  b.textContent = cur ? 'Multiplayer · on a server' : 'Multiplayer'; b.style.marginTop = '6px'; b.onclick = openServers; pb.after(b); })();
