// Finds every line the Script Studio can edit, straight from the source in src/:
//   B.U.R.P.'s trigger lists (dialogue.js BURP + burpmore.js BURP_MORE), his one-off lines,
//   cutscene captions (runCutscene shots and the ending), and the Greater Maw battle radio.
// Used by server.js (/api/script). Run by hand for a summary: node tools/script_scan.js
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');
const hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };

// what fires each B.U.R.P. trigger, in plain words
const TRIGGERS = {
  level: 'You level up.', death: 'You get knocked out.', land: 'You land on a planet that has no lines of its own (planets with a planet_ list use that instead).',
  ship: 'You beam aboard your ship.', space: 'You take the helm and fly out into space.', quest: 'About a second after you finish a quest.',
  boss: 'You beat a bounty boss.', rare: 'You catch a rare fish (worth 100 credits or more).', idle: 'You stand still for about 50 seconds (at most once every 2.5 minutes).',
  low_hp: 'Your health drops below a quarter (at most once a minute, not while flying).', room: 'You build a new room on your ship.', veh: 'You get in a vehicle or climb on a mount.',
  buy: 'You buy something.', fall: 'You fall off the edge of Sky City and get put back.', board: 'You board a pirate ship.', board_clear: 'You clear every enemy on a boarded ship.',
  fish: 'You catch a fish (35% chance).', range: 'You finish a gun range drill (70% chance).', halo: 'You get off the Halo Line, after your first ride (60% chance).',
  race_win: 'You win a Velocity race.', maw_final: 'Greater Maw, last phase: after fight mode switches on, he says one of these every 11 to 16 seconds until it dies.', race_lose: 'You finish a Velocity race without winning.', trailer: 'The B.U.R.P. trailer in the Codex cinema (read in order, one per shot).'
};
const PLANETS = { earth: 'Earth', mezar: 'Mezar', capitone: 'Capitone', moon: 'the Moon', robot: 'Robot City', fort: 'the Fort', ocean: 'the Ocean world', sky: 'Sky City', speedway: 'Velocity', zeltac: 'the Zeltac Ship' };
const triggerText = k => TRIGGERS[k] || (k.startsWith('planet_') ? `You land on ${PLANETS[k.slice(7)] || k.slice(7)}.` : 'Used by the game for "' + k + '".');

function objLiteral(src, at) { const i = src.indexOf('{', at); let b = 0; for (let k = i; k < src.length; k++) { const c = src[k]; if (c === '"' || c === "'" || c === '`') { k = strEnd(src, k); continue; } if (c === '{') b++; else if (c === '}' && !--b) return src.slice(i, k + 1); } return '{}'; }
function strEnd(src, i) { const q = src[i]; for (let k = i + 1; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) return k; } return src.length; }
function readStr(src, i) { const e = strEnd(src, i), raw = src.slice(i + 1, e); if (src[i] === '`' && raw.includes('${')) return null; let out = ''; for (let k = 0; k < raw.length; k++) { if (raw[k] === '\\' && k + 1 < raw.length) { const n = raw[++k]; out += n === 'n' ? '\n' : n === 't' ? '\t' : n; } else out += raw[k]; } return out; }
const lineOf = (src, i) => src.slice(0, i).split('\n').length;
function fnAt(src, i) { const before = src.slice(0, i); const m = [...before.matchAll(/\nfunction\s+([A-Za-z0-9_$]+)\s*\(/g)].pop(); return m ? m[1] : ''; }
const SCENE_NAMES = { mawIntro: 'Greater Maw: going in', mawAlliesCut: 'Greater Maw: the squadron arrives', mawFinal: 'Greater Maw: the final phase', mawDeath: 'Greater Maw: its death', watcherDeath: 'The Watcher dies on Vector', rollCredits: 'The ending (before the credits)' };
const sceneName = fn => SCENE_NAMES[fn] || (fn ? fn.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()) : 'Cutscene');

function scan() {
  const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
  // B.U.R.P. trigger lists, merged the same way the game merges them
  const dlg = read('dialogue.js'); const B = Function('return ' + objLiteral(dlg, dlg.indexOf('const BURP = {')))();
  const more = read('burpmore.js'); const M = Function('return ' + objLiteral(more, more.indexOf('const BURP_MORE =')))();
  const burp = {}; for (const k in B) burp[k] = B[k].slice(); for (const k in M) burp[k] = (k === 'trailer' ? [] : (burp[k] || [])).concat(M[k]);
  const kinds = {}; for (const k of Object.keys(burp)) kinds[k] = { desc: triggerText(k), lines: burp[k] };
  // one-off lines, captions, radio
  const say = [], seen = new Set();
  const add = (text, o) => { if (!text || text.length < 3) return; const id = hash(text), key = id + '|' + o.group; if (seen.has(key)) return; seen.add(key); say.push(Object.assign({ id, text }, o)); };
  for (const f of fs.readdirSync(SRC).filter(f => f.endsWith('.js'))) {
    const s = read(f);
    for (const m of s.matchAll(/\{\s*text:\s*(['"`])/g)) { const i = m.index + m[0].length - 1, t = readStr(s, i); if (t == null) continue; const fn = fnAt(s, m.index); if (!/runCutscene|shots/.test(s.slice(Math.max(0, m.index - 4000), m.index))) continue; add(t, { group: sceneName(fn), who: '', kind: 'caption', file: f, line: lineOf(s, m.index) }); }
    for (const m of s.matchAll(/\b(?:mawBurp|burpSay)\(\s*(['"])/g)) { const i = m.index + m[0].length - 1, t = readStr(s, i); if (t) add(t, { group: 'B.U.R.P. one-off lines', who: 'B.U.R.P.', kind: 'burp', file: f, line: lineOf(s, m.index) }); }
    for (const m of s.matchAll(/\bMAW_(?:FM_ASK|FM_ON|NOW)\s*=\s*(['"])/g)) { const i = m.index + m[0].length - 1, t = readStr(s, i); if (t) add(t, { group: 'Greater Maw: final phase (B.U.R.P.)', who: 'B.U.R.P.', kind: 'burp', file: f, line: lineOf(s, m.index) }); }
    for (const m of s.matchAll(/\bmawComms\(\s*(['"])/g)) { let i = m.index + m[0].length - 1; const who = readStr(s, i); i = strEnd(s, i) + 1; const arr = /^\s*,\s*\[/.exec(s.slice(i)); if (arr) { let k = i + arr[0].length; const stop = s.indexOf(']', k); while (k < stop) { if (s[k] === "'" || s[k] === '"') { const t = readStr(s, k); if (t && who !== 'B.U.R.P.') add(t, { group: 'Greater Maw: battle radio', who, kind: 'radio', file: f, line: lineOf(s, m.index) }); k = strEnd(s, k); } k++; } continue; }
      const mm = /^\s*,\s*(['"])/.exec(s.slice(i)); if (!mm) continue; const t = readStr(s, i + mm[0].length - 1); if (t && who !== 'B.U.R.P.') add(t, { group: 'Greater Maw: battle radio', who, kind: 'radio', file: f, line: lineOf(s, m.index) }); }
    const ch = s.indexOf('const MAW_CHATTER'); if (ch >= 0) { const end = s.indexOf('];', ch); for (const m of s.slice(ch, end).matchAll(/\[\s*(['"])/g)) { let i = ch + m.index + m[0].length - 1; const who = readStr(s, i); i = strEnd(s, i) + 1; const mm = /^\s*,\s*(['"])/.exec(s.slice(i)); if (!mm) continue; const t = readStr(s, i + mm[0].length - 1); if (t) add(t, { group: who === 'B.U.R.P.' ? 'B.U.R.P. one-off lines' : 'Greater Maw: battle radio', who, kind: who === 'B.U.R.P.' ? 'burp' : 'radio', file: f, line: lineOf(s, ch) }); } }
    const lo = s.indexOf('const MAW_LOSSES'); if (lo >= 0) { const end = s.indexOf('];', lo); for (const row of s.slice(lo, end).matchAll(/\[\s*[\d.]+\s*,([^\n]*)\]/g)) { const strs = []; const r = row[1]; for (let k = 0; k < r.length; k++) if (r[k] === "'" || r[k] === '"') { strs.push(readStr(r, k)); k = strEnd(r, k); }
      const [name, l1, who2, l2, bl] = strs; add(l1, { group: 'Greater Maw: battle radio', who: 'CAPTAIN VEGA', kind: 'radio', file: f, line: lineOf(s, lo) }); add(l2, { group: 'Greater Maw: battle radio', who: who2, kind: 'radio', file: f, line: lineOf(s, lo) }); add(bl, { group: 'B.U.R.P. one-off lines', who: 'B.U.R.P.', kind: 'burp', file: f, line: lineOf(s, lo) }); } }
    const sc = s.indexOf('const scenes = [['); if (sc >= 0) { const end = s.indexOf('\n', sc); for (const m of s.slice(sc, end).matchAll(/\[\s*[\d.]+\s*,\s*(['"])/g)) { const t = readStr(s, sc + m.index + m[0].length - 1); if (t) add(t, { group: sceneName('rollCredits'), who: '', kind: 'caption', file: f, line: lineOf(s, sc) }); } }
  }
  return { kinds, say, hash: 'fnv1a-utf16' };
}
// every line B.U.R.P. can actually speak, after Phil's edits (what a voice pack needs clips for)
function spoken(inv, script) {
  const out = new Map(), S = script || {}, put = t => { if (t && t.trim()) out.set(hash(t), t); };
  for (const k in inv.kinds) (Array.isArray((S.burp || {})[k]) ? S.burp[k] : inv.kinds[k].lines).forEach(put);
  for (const k in (S.burp || {})) if (!inv.kinds[k]) (S.burp[k] || []).forEach(put);
  for (const L of inv.say) if (L.kind === 'burp') put(((S.say || {})[L.id]) || L.text);
  put('Voice check. This is how I sound now.');
  return [...out.entries()];
}
module.exports = { scan, spoken, hash };
if (require.main === module) { const r = scan(); const g = {}; r.say.forEach(l => g[l.group] = (g[l.group] || 0) + 1); console.log(Object.keys(r.kinds).length, 'triggers,', Object.values(r.kinds).reduce((a, k) => a + k.lines.length, 0), 'trigger lines'); console.log(g); console.log('spoken:', spoken(r, {}).length); }
