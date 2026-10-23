// Blork lookup service: Cloudflare Worker + D1 database bound as DB. Holds only listings, never passwords or gameplay.
//   POST /announce  {key?, name, desc, port, public, locked, count, max, rules}  -> {key, code}   (heartbeat every 2 min)
//   POST /remove    {key}
//   GET  /list?q=   public servers seen in the last 5 minutes, matching the search text
//   GET  /code/:code  -> {host, port, name, locked}
//   POST /report    {code, why}
const BAD = ['fuck', 'shit', 'cunt', 'nigg', 'fag', 'retard', 'rape', 'nazi', 'hitler', 'whore', 'slut', 'bitch', 'dick', 'cock', 'pussy', 'porn', 'kkk', 'chink', 'spic', 'kike'];
const norm = s => String(s || '').toLowerCase().replace(/[0@]/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't').replace(/[^a-z]/g, '');
const bad = s => BAD.some(w => norm(s).includes(w));
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: CORS });
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', rnd = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => ABC[b % ABC.length]).join('');
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2, '0')).join('');
const FRESH = 5 * 60 * 1000;
export default { async fetch(req, env) {
  const u = new URL(req.url), ip = req.headers.get('cf-connecting-ip') || '', now = Date.now(), db = env.DB;
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method === 'GET' && u.pathname === '/list') {
    const q = norm(u.searchParams.get('q')).slice(0, 40);
    const { results } = await db.prepare('SELECT code,name,descr,locked,count,max,rules,search FROM servers WHERE public=1 AND t>?1 ORDER BY count DESC LIMIT 300').bind(now - FRESH).all();
    return J(results.filter(r => !q || r.search.includes(q)).slice(0, 200).map(r => ({ code: r.code, name: r.name, desc: r.descr, locked: !!r.locked, count: r.count, max: r.max, rules: JSON.parse(r.rules || '{}') }))); }
  if (req.method === 'GET' && u.pathname.startsWith('/code/')) { const c = u.pathname.slice(6).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const r = await db.prepare('SELECT ip,port,name,locked FROM servers WHERE code=?1 AND t>?2').bind(c, now - FRESH).first();
    return r ? J({ host: r.ip, port: r.port, name: r.name, locked: !!r.locked }) : J({ error: 'No server with that code is online.' }, 404); }
  if (req.method !== 'POST') return J({ error: 'not found' }, 404);
  let b; try { b = await req.json(); } catch (_) { return J({ error: 'bad json' }, 400); }
  if (u.pathname === '/announce') {
    const name = String(b.name || '').slice(0, 40), desc = String(b.desc || '').slice(0, 300);
    if (!name || bad(name) || bad(desc)) return J({ error: 'Pick a different server name or description.' }, 400);
    if (await db.prepare('SELECT 1 FROM bans WHERE ip=?1').bind(ip).first()) return J({ error: 'This host was removed for breaking the Terms.' }, 403);
    let key = typeof b.key === 'string' && /^[a-f0-9]{32}$/.test(b.key) ? b.key : null;
    const old = key && await db.prepare('SELECT code FROM servers WHERE key=?1 AND ip=?2').bind(key, ip).first(); // a key only works from the machine that made it
    if (!old) { if ((await db.prepare('SELECT COUNT(*) n FROM servers WHERE ip=?1 AND t>?2').bind(ip, now - FRESH).first()).n >= 3) return J({ error: 'Too many servers from this connection.' }, 429); key = hex(16); }
    const code = old ? old.code : rnd(6), port = Math.max(1, Math.min(65535, b.port | 0 || 7777)), max = Math.max(1, Math.min(64, b.max | 0 || 16)), count = Math.max(0, Math.min(max, b.count | 0));
    const rules = JSON.stringify(typeof b.rules === 'object' && b.rules ? b.rules : {}).slice(0, 2000);
    await db.prepare('INSERT INTO servers(key,code,ip,port,name,descr,search,public,locked,count,max,rules,t) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13) ON CONFLICT(key) DO UPDATE SET port=?4,name=?5,descr=?6,search=?7,public=?8,locked=?9,count=?10,max=?11,rules=?12,t=?13')
      .bind(key, code, ip, port, name, desc, norm(name + ' ' + desc), b.public ? 1 : 0, b.locked ? 1 : 0, count, max, rules, now).run();
    if (Math.random() < 0.02) await db.prepare('DELETE FROM servers WHERE t<?1').bind(now - FRESH * 12).run();
    return J({ key, code }); }
  if (u.pathname === '/remove') { await db.prepare('DELETE FROM servers WHERE key=?1 AND ip=?2').bind(String(b.key || ''), ip).run(); return J({ ok: true }); }
  if (u.pathname === '/report') { await db.prepare('INSERT INTO reports(code,why,ip,t) VALUES(?1,?2,?3,?4)').bind(String(b.code || '').slice(0, 8), String(b.why || '').slice(0, 500), ip, now).run(); return J({ ok: true }); }
  return J({ error: 'not found' }, 404);
} };
