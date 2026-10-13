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
function downloadChar(c) {
  c = c || S;
  if (!c || !c.t) { toast('DOWNLOAD', 'Start or select this character first', 2); return; }
  try {
    const jsonStr = JSON.stringify(c, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(c.nick || 'character').replace(/[^\w\-]/g, '_')}_save.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('DOWNLOAD', `Downloaded ${c.nick} save file!`, 2.5);
  } catch (_) {
    toast('DOWNLOAD', 'Download failed', 2);
  }
}
function parseCharData(raw) {
  raw = (raw || '').trim();
  if (!raw) throw new Error('Empty');
  if (/^AOW1:/.test(raw)) return JSON.parse(decodeURIComponent(escape(atob(raw.replace(/^AOW1:/, '')))));
  try { return JSON.parse(raw); } catch (_) { return JSON.parse(decodeURIComponent(escape(atob(raw)))); }
}
let charFilterText = '';
async function renderChars() {
  if (charBox.hidden) return; charBox.textContent = 'Loading…';
  const list = await listChars(); charBox.textContent = '';

  // search / filter input
  const fi = document.createElement('input');
  fi.id = 'charFilter';
  fi.placeholder = '🔍 Filter characters by name or ID...';
  fi.value = charFilterText;
  fi.autocomplete = 'off';
  fi.style.cssText = 'padding:6px 10px;font:inherit;background:#0a0f3a;color:#e8ecf8;border:1px solid rgba(232,236,248,.35);width:100%;box-sizing:border-box;margin-bottom:2px;border-radius:3px;';
  const listWrap = document.createElement('div');
  listWrap.id = 'charList';
  listWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  const filterRows = () => {
    const q = charFilterText.trim().toLowerCase();
    let visibleCount = 0;
    listWrap.querySelectorAll('.ch').forEach(el => {
      const match = !q || el.dataset.nick.includes(q) || el.dataset.cid.includes(q);
      el.style.display = match ? 'flex' : 'none';
      if (match) visibleCount++;
    });
    if (noMatch) noMatch.style.display = visibleCount === 0 ? 'block' : 'none';
  };
  fi.addEventListener('input', () => { charFilterText = fi.value; filterRows(); });
  charBox.appendChild(fi);

  for (const c of list) {
    const r = document.createElement('div');
    r.className = 'ch' + (c.cid === S.cid ? ' cur' : '');
    r.dataset.nick = (c.nick || 'trooper').toLowerCase();
    r.dataset.cid = shortId(c.cid).toLowerCase();
    const nm = document.createElement('b'); nm.textContent = `${c.nick || 'Trooper'} · Lv ${c.lvl}${c.asc ? ' · NG+' + c.asc : ''}`;
    const id = document.createElement('small'); id.textContent = 'ID ' + shortId(c.cid);
    r.append(nm, id);
    if (c.cid === S.cid) { const t = document.createElement('small'); t.textContent = 'selected'; r.append(t); }
    else { const b = document.createElement('button'); b.className = 'pbtn go'; b.textContent = 'Play'; b.addEventListener('click', () => { SFX.ui(); playChar(c); }); r.append(b); }
    const dl = document.createElement('button'); dl.className = 'pbtn'; dl.title = 'Download save (.json)'; dl.textContent = '💾'; dl.style.cssText = 'padding:4px 8px;min-width:0;'; dl.addEventListener('click', (e) => { e.stopPropagation(); SFX.ui(); downloadChar(c); });
    r.append(dl);
    listWrap.appendChild(r);
  }
  const noMatch = document.createElement('div');
  noMatch.style.cssText = 'display:none;padding:8px;opacity:.7;font-style:italic;';
  noMatch.textContent = 'No matching characters found.';
  listWrap.appendChild(noMatch);
  charBox.appendChild(listWrap);

  const nb = document.createElement('button'); nb.className = 'pbtn'; nb.textContent = '＋ New character'; nb.addEventListener('click', () => { SFX.ui(); newChar(); }); charBox.appendChild(nb);

  // file picker for uploads
  let fileIn = document.getElementById('charFileIn');
  if (!fileIn) {
    fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.id = 'charFileIn'; fileIn.accept = '.json,.txt'; fileIn.style.display = 'none';
    fileIn.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const c = parseCharData(text);
        if (!c || c.v !== 1) throw 0;
        c.cid = c.cid || newCid(); c.t = Date.now();
        playChar(c); markDirty();
        toast('UPLOAD', `${c.nick} (Lv ${c.lvl}) imported from file!`, 3);
      } catch (_) {
        toast('UPLOAD', 'Could not read character file', 2.5);
      }
      fileIn.value = '';
    });
    document.body.appendChild(fileIn);
  }

  // move a character to another device or account
  const tr = document.createElement('div'); tr.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:2px;';
  const cp = document.createElement('button'); cp.className = 'pbtn'; cp.textContent = '📤 Copy code'; cp.addEventListener('click', () => { if (!S.t) { toast('TRANSFER', 'Start this character first', 1.5); return; } const code = 'AOW1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); try { navigator.clipboard.writeText(code); toast('TRANSFER', 'Code copied. On the other device: Characters → Paste code', 3); } catch (_) { prompt('Copy this code', code); } });
  const ps = document.createElement('button'); ps.className = 'pbtn'; ps.textContent = '📥 Paste code'; ps.addEventListener('click', async () => { let code = ''; try { code = await navigator.clipboard.readText(); } catch (_) {} if (!/^AOW1:/.test(code || '')) code = prompt('Paste the transfer code') || ''; try { const c = parseCharData(code); if (!c || c.v !== 1) throw 0; c.cid = c.cid || newCid(); c.t = Date.now(); playChar(c); markDirty(); toast('TRANSFER', `${c.nick} (Lv ${c.lvl}) is on this device now`, 3); } catch (_) { toast('TRANSFER', 'That code did not work', 2); } });
  const dlBtn = document.createElement('button'); dlBtn.className = 'pbtn'; dlBtn.textContent = '💾 Download file'; dlBtn.addEventListener('click', () => { SFX.ui(); downloadChar(S); });
  const ulBtn = document.createElement('button'); ulBtn.className = 'pbtn'; ulBtn.textContent = '📁 Upload file'; ulBtn.addEventListener('click', () => { SFX.ui(); fileIn.click(); });
  tr.append(cp, ps, dlBtn, ulBtn); charBox.appendChild(tr);

  const hint = document.createElement('small'); hint.textContent = 'Characters save automatically to this browser and cloud. Use files or transfer codes to switch devices anytime.'; charBox.appendChild(hint);
  if (!db) { const n = document.createElement('small'); n.textContent = cloudDone ? 'Offline: showing characters saved on this device.' : 'Loading your cloud characters…'; charBox.appendChild(n); }
  filterRows();
}
charBtn.addEventListener('click', () => { charBox.hidden = !charBox.hidden; renderChars(); });
function charsReady() { renderChars(); fillStart(); }
// the save line shows the permanent id
{ const _fs = fillStart; fillStart = function () { _fs(); if (S.t && S.cid) $('saveNote').textContent += ` · ID ${shortId(S.cid)}`; }; }
setTimeout(() => { try { fillStart(); } catch (_) {} }, 0);
try {
  window.parseCharData = parseCharData;
  window.downloadChar = downloadChar;
  window.playChar = playChar;
  window.listChars = listChars;
} catch (_) {}
