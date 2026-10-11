// =================== CHARACTERS: every character has a permanent id; new characters never replace old ones ===================
// cloud: data/users/<you>/<cid> holds each character; data/users/<you>/save is whichever one you're playing
const CHAR_LOCAL = 'aow-chars';
function localChars() { try { return JSON.parse(localStorage.getItem(CHAR_LOCAL) || '{}') || {}; } catch (_) { return {}; } }
{ const _wl = writeLocal; writeLocal = function () { _wl(); try { if (!S.cid || !S.t) return; const m = localChars(); m[S.cid] = S; const ks = Object.keys(m).sort((a, b) => (m[b].t || 0) - (m[a].t || 0)); for (const k of ks.slice(8)) delete m[k]; localStorage.setItem(CHAR_LOCAL, JSON.stringify(m)); } catch (_) {} }; }
const shortId = cid => (cid || '').slice(-6).toUpperCase();
async function listChars() {
  const all = {}; for (const [k, v] of Object.entries(localChars())) if (v && v.v === 1) all[k] = v;
  if (db && uid) { try { const snap = await db.collection('data/users/' + uid).get(); for (const d of snap.docs) { const v = d.data(); if (d.id === 'save' || !v || v.v !== 1) continue; const cid = v.cid || d.id; if (!all[cid] || (all[cid].t || 0) < (v.t || 0)) all[cid] = Object.assign({}, v, { cid }); } } catch (_) {} }
  if (S.t && S.cid) all[S.cid] = S;
  return Object.values(all).filter(c => c.t).sort((a, b) => (b.t || 0) - (a.t || 0));
}
function playChar(c) { if (dirty) { try { flushSave(); } catch (_) {} } adopt(JSON.parse(JSON.stringify(c))); fillStart(); const w = resumeWhere(); if (w !== LEVEL.id) loadLevel(w); dirty = true; S.t = Date.now(); writeLocal(); renderChars(); toast('CHARACTER', `${S.nick} · ID ${shortId(S.cid)}`, 1.4); }
function newChar() { if (S.t && dirty) { try { flushSave(); } catch (_) {} } S = fresh(); $('nickIn').value = ''; fillStart(); loadLevel(resumeWhere()); renderChars(); toast('NEW CHARACTER', 'Pick a callsign and armor color, then Press Start. Your other characters are kept.', 3); }
// ---- start screen panel ----
const charBox = document.createElement('div'); charBox.id = 'charBox'; charBox.hidden = true;
const charBtn = document.createElement('button'); charBtn.className = 'pbtn'; charBtn.id = 'charBtn'; charBtn.textContent = '👥 Characters';
$('playBtn').after(charBtn); charBtn.after(charBox);
{ const st = document.createElement('style'); st.textContent = `#charBtn { align-self: center; padding: 6px 14px; }
#charBox { display: flex; flex-direction: column; gap: 6px; max-height: 34vh; overflow-y: auto; text-align: left; }
#charBox[hidden] { display: none; }
#charBox .ch { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid rgba(255,255,255,.22); background: rgba(10,15,42,.55); }
#charBox .ch.cur { border-color: #ffd36a; } #charBox .ch b { flex: 1; } #charBox .ch small { opacity: .75; font-family: monospace; }
#charBox .pbtn { padding: 4px 10px; min-width: 0; }`; document.body.appendChild(st); }
async function renderChars() {
  if (charBox.hidden) return; charBox.textContent = 'Loading…';
  const list = await listChars(); charBox.textContent = '';
  for (const c of list) { const r = document.createElement('div'); r.className = 'ch' + (c.cid === S.cid ? ' cur' : '');
    const nm = document.createElement('b'); nm.textContent = `${c.nick || 'Trooper'} · Lv ${c.lvl}${c.asc ? ' · NG+' + c.asc : ''}`;
    const id = document.createElement('small'); id.textContent = 'ID ' + shortId(c.cid);
    r.append(nm, id);
    if (c.cid === S.cid) { const t = document.createElement('small'); t.textContent = 'selected'; r.append(t); }
    else { const b = document.createElement('button'); b.className = 'pbtn go'; b.textContent = 'Play'; b.addEventListener('click', () => { SFX.ui(); playChar(c); }); r.append(b); }
    charBox.appendChild(r); }
  const nb = document.createElement('button'); nb.className = 'pbtn'; nb.textContent = '＋ New character'; nb.addEventListener('click', () => { SFX.ui(); newChar(); }); charBox.appendChild(nb);
  // move a character to another device or account
  const tr = document.createElement('div'); tr.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
  const cp = document.createElement('button'); cp.className = 'pbtn'; cp.textContent = '📤 Copy transfer code'; cp.addEventListener('click', () => { if (!S.t) { toast('TRANSFER', 'Start this character first', 1.5); return; } const code = 'AOW1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); try { navigator.clipboard.writeText(code); toast('TRANSFER', 'Code copied. On the other device: Characters → Paste transfer code', 3); } catch (_) { prompt('Copy this code', code); } });
  const ps = document.createElement('button'); ps.className = 'pbtn'; ps.textContent = '📥 Paste transfer code'; ps.addEventListener('click', async () => { let code = ''; try { code = await navigator.clipboard.readText(); } catch (_) {} if (!/^AOW1:/.test(code || '')) code = prompt('Paste the transfer code') || ''; try { const c = JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/^AOW1:/, ''))))); if (!c || c.v !== 1) throw 0; c.cid = c.cid || newCid(); c.t = Date.now(); playChar(c); markDirty(); toast('TRANSFER', `${c.nick} (Lv ${c.lvl}) is on this device now`, 3); } catch (_) { toast('TRANSFER', 'That code did not work', 2); } });
  tr.append(cp, ps); charBox.appendChild(tr);
  const hint = document.createElement('small'); hint.textContent = 'Same Claude account on any device = same characters automatically. Different account? Use a transfer code.'; charBox.appendChild(hint);
  if (!db) { const n = document.createElement('small'); n.textContent = cloudDone ? 'Offline: showing characters saved on this device.' : 'Loading your cloud characters…'; charBox.appendChild(n); }
}
charBtn.addEventListener('click', () => { charBox.hidden = !charBox.hidden; renderChars(); });
function charsReady() { renderChars(); fillStart(); }
// the save line shows the permanent id
{ const _fs = fillStart; fillStart = function () { _fs(); if (S.t && S.cid) $('saveNote').textContent += ` · ID ${shortId(S.cid)}`; }; }
setTimeout(() => { try { fillStart(); } catch (_) {} }, 0);
