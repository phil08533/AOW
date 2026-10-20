// =================== THE DEN TV (2.17): a couch you can sit on, a TV playing Night of the Living Dead, and the rainbow Worm Hole ===================
// The TV remembers where you stopped (S.tv.t, in the save), pauses when you leave the room and turns the ship music down while it plays.
// The film is public domain (George A. Romero, 1968). It plays from local parts (video/notld/parts.json + mp4 parts, made by
// tools/fetch_movie.py) when they're there, and otherwise streams it from the Internet Archive.
// Angler's Den Lv 5 adds the Worm Hole: an ice-fishing hole that can bite with any fish in the game. You can fish it from the couch.
// tan wallpaper with little fish for the den (2.17.2)
TEX.fishpaper = canvasTex(64, (x, s) => { x.fillStyle = '#c4a274'; x.fillRect(0, 0, s, s); x.fillStyle = '#b59366'; for (let i = 0; i < s; i += 16) x.fillRect(i, 0, 1, s);
  const fish = (cx, cy, c, d) => { x.fillStyle = c; x.fillRect(cx - 4 * d, cy - 2, 7, 4); x.fillRect(cx - 3 * d, cy - 3, 4, 1); x.fillRect(cx - 3 * d, cy + 2, 4, 1); const tx = cx + (d > 0 ? -6 : 3); x.fillRect(tx, cy - 3, 2, 2); x.fillRect(tx, cy + 1, 2, 2); x.fillRect(tx + (d > 0 ? 1 : 0), cy - 1, 2, 2); x.fillStyle = '#2a2420'; x.fillRect(cx + (d > 0 ? 1 : -2), cy - 1, 1, 1); };
  fish(16, 14, '#4f8a96', 1); fish(48, 30, '#c8763a', -1); fish(20, 46, '#c8763a', 1); fish(50, 58, '#4f8a96', -1); x.fillStyle = '#a8c8d0'; for (const [a, b] of [[34, 10], [8, 30], [40, 48], [60, 18]]) x.fillRect(a, b, 1, 1); });
// Phil's wallpaper tile (64x64), drawn over the fallback above once it loads
{ const im = new Image(); im.onload = () => { const T = TEX.fishpaper, c = T.image, x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, c.width, c.height); T.needsUpdate = true; }; im.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kb9Lw0AcxV9Ti1IqKnYQcchQdbGLijjWKhShQqgVWnUwufQXNGlIUlwcBdeCgz8Wqw4uzro6uAqC4A8Q/wBxUnSREr+XFFrEenDch3f3HnfvAKFeZprVFQM03TZTibiYya6K3a8Ioh8DCGBcZpYxJ0lJdBxf9/Dx9S7Kszqf+3P0qjmLAT6ROMYM0ybeIJ7ZtA3O+8RhVpRV4nPiCZMuSPzIdcXjN84FlwWeGTbTqXniMLFYaGOljVnR1IiniSOqplO+kPFY5bzFWStXWfOe/IWhnL6yzHWaI0hgEUuQIEJBFSWUYSNKq06KhRTtxzv4h12/RC6FXCUwciygAg2y6wf/g9/dWvmpSS8pFAcCL47zMQp07wKNmuN8HztO4wTwPwNXestfqQOzn6TXWlrkCOjbBi6uW5qyB1zuAENPhmzKruSnKeTzwPsZfVMWGLwFgmteb819nD4AaeoqeQMcHAJjBcpe7/Dunvbe/j3T7O8HfDJyqghqD2cAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfqChARCxn72WU2AAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAQNJREFUeNrt2jsOwjAMgGETsSDEJbpzlCw9EAPchqFLTsAZ2HsJhBhh6sCjQ6Mo2M7vralayV8eSiKvLufTUwrH7f6Q3Xaj/p8iIkEaDwAAAAAAAAAAAAAAAAAAgCZjnfPRmIa35y72MqZButj7HwGfyc+1uQSYEj2m69c7i72/GGBK8hD3bkbB4inwq6et9n72IugJgX0AAAAAAAAAAAAAAPcBBqPEvUTwknzuiTRYTr7EvYRJgJL3EmanQKkjuelFsAQC+wAAAAAAAAAAAAAAAAAAAIAWo/pxWFt9Ufhn8nNtLgG01hdVA9BaX1R1Cmgsram+CGpDYB8AAAAAAABAw/ECYDlM/3fE2AsAAAAASUVORK5CYII='; }
const TV_CHANNELS = [
  {
    id: 'notld',
    title: 'Night of the Living Dead (1968)',
    short: 'Night of the Living Dead',
    dir: 'George A. Romero',
    year: '1968',
    localJson: 'video/notld/parts.json',
    remotes: ['https://archive.org/download/night_of_the_living_dead_dvd/Night.mp4']
  },
  {
    id: 'santamartians',
    title: 'Santa Claus Conquers the Martians (1964)',
    short: 'Santa Claus Conquers the Martians',
    dir: 'Nicholas Webster',
    year: '1964',
    localJson: 'video/santamartians/parts.json',
    remotes: [
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/83/Santa_Claus_Conquers_the_Martians_%281964%29_by_Nicholas_Webster.webm/Santa_Claus_Conquers_the_Martians_%281964%29_by_Nicholas_Webster.webm.480p.vp9.webm',
      'https://archive.org/download/santa_claus_conquers_the_martians/santa_claus_conquers_the_martians.mp4',
      'https://upload.wikimedia.org/wikipedia/commons/8/83/Santa_Claus_Conquers_the_Martians_%281964%29_by_Nicholas_Webster.webm'
    ]
  }
];

const TVD = { room: null, scr: null, led: null, vid: null, tex: null, idle: null, on: false, parts: null, channelParts: {}, part: 0, cand: 0, sinceSave: 0, musDown: false, hole: null };
const SEAT = { on: false, x: 0, z: 0, yaw: 0, out: null, y: 0.62 };

// Inactivity tracking for prompt auto-hide when seated
let _tvLastInput = performance.now();
const _noteInput = () => { _tvLastInput = performance.now(); };
window.addEventListener('mousemove', _noteInput, { passive: true });
window.addEventListener('pointermove', _noteInput, { passive: true });
window.addEventListener('keydown', (e) => {
  _noteInput();
  if (e.code === 'KeyC' && typeof state !== 'undefined' && state === 'play' && !dlgOpen && (SEAT.on || tvInRoom())) {
    tvChangeChannel(1);
  }
}, { passive: true });
window.addEventListener('touchstart', _noteInput, { passive: true });
window.addEventListener('touchmove', _noteInput, { passive: true });
window.addEventListener('wheel', _noteInput, { passive: true });

// ---- every fish in the game, for the Worm Hole ----
function wormTable() { const seen = new Map();
  for (const k in FISH_TABLES) { if (k === 'wormhole') continue; for (const e of FISH_TABLES[k]) { if (!ITEMS[e[0]] || (typeof fishJunk === 'function' && fishJunk(e[0]))) continue; const o = seen.get(e[0]); if (!o) seen.set(e[0], [e[0], e[1], e[2] || 0.3]); else o[1] = Math.max(o[1], e[1]); } }
  return [...seen.values()]; }

// ---- the screen before the film starts, and when there's no signal ----
function tvIdleTex() { const c = document.createElement('canvas'); c.width = 256; c.height = 192; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.userData = { c, x: c.getContext('2d') }; return t; }
function tvDrawIdle(mode, time) {
  const T = TVD.idle; if (!T) return;
  const { c, x } = T.userData;
  const mov = tvCurMovie();
  const chNum = tvCurChan() + 1;
  if (mode === 'static') {
    const id = x.createImageData(c.width, c.height);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 200;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    x.fillStyle = 'rgba(0,0,0,.65)';
    x.fillRect(36, 78, 184, 36);
    x.fillStyle = '#e8f4ff';
    x.font = 'bold 16px monospace';
    x.textAlign = 'center';
    x.fillText(`CH ${chNum} · NO SIGNAL`, 128, 102);
  } else if (mode === 'load') {
    x.fillStyle = '#05060a';
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#4fd2ff';
    x.font = 'bold 11px monospace';
    x.textAlign = 'center';
    x.fillText(`[ CH ${chNum} · ${mov.year} ]`, 128, 62);
    x.fillStyle = '#cfd6e0';
    x.font = 'bold 12px monospace';
    x.fillText(mov.short.toUpperCase(), 128, 88);
    x.fillStyle = '#8a8e96';
    x.font = '12px monospace';
    x.fillText('loading' + '.'.repeat(1 + Math.floor((time || 0) * 2) % 3), 128, 114);
  } else {
    x.fillStyle = '#07080c';
    x.fillRect(0, 0, c.width, c.height);
    const g = x.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, 'rgba(120,150,190,.12)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = 'rgba(255,255,255,0.45)';
    x.font = 'bold 12px monospace';
    x.textAlign = 'center';
    x.fillText(`CH ${chNum} · ${mov.short}`, 128, 96);
    x.fillStyle = 'rgba(255,255,255,0.2)';
    x.font = '10px monospace';
    x.fillText(`dir. ${mov.dir}`, 128, 116);
  }
  T.needsUpdate = true;
  if (typeof THEATRE !== 'undefined' && THEATRE && THEATRE.scr && !TVD.on) {
    THEATRE.scr.material.map = T;
    THEATRE.scr.material.needsUpdate = true;
  }
}

// ---- multi-channel catalog helpers ----
const tvSave = () => {
  if (!S.tv) S.tv = { t: 0, ch: 0, times: {} };
  if (!S.tv.times) S.tv.times = {};
  if (S.tv.ch == null) S.tv.ch = 0;
  return S.tv;
};
function tvCurChan() {
  const s = tvSave();
  return (s.ch >= 0 && s.ch < TV_CHANNELS.length) ? s.ch : 0;
}
function tvCurMovie() {
  return TV_CHANNELS[tvCurChan()];
}
function tvGetTime(ch) {
  const s = tvSave();
  if (s.times && s.times[ch] != null) return s.times[ch];
  if (ch === 0 && s.t) return s.t;
  return 0;
}
function tvSetTime(ch, t) {
  const s = tvSave();
  s.times[ch] = t;
  if (s.ch === ch) s.t = t;
}

// ---- the film: local parts first, then remote streams ----
async function tvLoadParts(ch = tvCurChan()) {
  const mov = TV_CHANNELS[ch] || TV_CHANNELS[0];
  if (TVD.channelParts && TVD.channelParts[ch] !== undefined) {
    TVD.parts = TVD.channelParts[ch];
    return TVD.parts;
  }
  TVD.partsDone = false;
  try {
    if (!TVD.channelParts) TVD.channelParts = {};
    if (mov.localJson) {
      try {
        const r = await fetch(mov.localJson, { cache: 'no-cache' });
        if (r.ok) {
          const j = await r.json();
          if (j && j.parts && j.parts.length) {
            const basePath = mov.localJson.substring(0, mov.localJson.lastIndexOf('/') + 1);
            TVD.parts = j.parts.map(p => ({ u: basePath + p.f, d: +p.d || 0 }));
            TVD.channelParts[ch] = TVD.parts;
            return TVD.parts;
          }
        }
      } catch (_) {}
    }
    TVD.parts = null;
    TVD.channelParts[ch] = null;
    return null;
  } finally {
    TVD.partsDone = true;
  }
}

function tvNow() {
  const v = TVD.vid;
  if (!v) return tvGetTime(tvCurChan());
  if (!TVD.parts) return v.currentTime || 0;
  let t = 0;
  for (let i = 0; i < TVD.part; i++) t += TVD.parts[i].d;
  return t + (v.currentTime || 0);
}

function tvVideo() {
  if (TVD.vid) return TVD.vid;
  const v = document.createElement('video');
  v.crossOrigin = 'anonymous';
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.preload = 'auto';
  v.volume = 0;
  v.addEventListener('ended', () => {
    const ch = tvCurChan();
    const mov = tvCurMovie();
    if (TVD.parts && TVD.part < TVD.parts.length - 1) {
      let at = 0;
      for (let i = 0; i <= TVD.part; i++) at += TVD.parts[i].d;
      tvSrc(at + 0.05);
      v.play().catch(() => {});
    } else {
      tvSetTime(ch, 0);
      tvOff(true);
      toast('THE END', mov.title, 4);
    }
  });
  v.addEventListener('error', () => {
    if (!TVD.on) return;
    const mov = tvCurMovie();
    const remotes = mov.remotes || [];
    if (!TVD.parts && TVD.cand < remotes.length - 1) {
      TVD.cand++;
      tvSrc(tvGetTime(tvCurChan()));
      v.play().catch(() => {});
      return;
    }
    TVD.err = true;
  });
  v.addEventListener('playing', () => {
    TVD.err = false;
    TVD.played = true;
    if (TVD.scr) {
      TVD.scr.material.map = TVD.tex;
      TVD.scr.material.needsUpdate = true;
    }
    if (typeof THEATRE !== 'undefined' && THEATRE && THEATRE.scr) {
      THEATRE.scr.material.map = TVD.tex;
      THEATRE.scr.material.needsUpdate = true;
    }
  });
  TVD.tex = new THREE.VideoTexture(v);
  TVD.tex.encoding = THREE.sRGBEncoding;
  TVD.tex.minFilter = THREE.LinearFilter;
  TVD.tex.magFilter = THREE.LinearFilter;
  return (TVD.vid = v);
}

function tvSrc(at) {
  const v = tvVideo();
  const ch = tvCurChan();
  const mov = TV_CHANNELS[ch] || TV_CHANNELS[0];
  if (TVD.parts && TVD.parts.length) {
    let i = 0, t = at;
    while (i < TVD.parts.length - 1 && t >= TVD.parts[i].d) {
      t -= TVD.parts[i].d;
      i++;
    }
    if (TVD.part !== i || !v.src.endsWith(TVD.parts[i].u)) {
      TVD.part = i;
      v.src = TVD.parts[i].u;
    }
    const go = () => { try { v.currentTime = t; } catch (_) {} };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
  } else {
    const remotes = mov.remotes || [];
    const idx = Math.min(TVD.cand || 0, remotes.length - 1);
    const u = remotes[idx] || '';
    if (v.src !== u) v.src = u;
    const go = () => { try { v.currentTime = at; } catch (_) {} };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
  }
}

async function tvOn() {
  if (TVD.on) return;
  TVD.on = true;
  TVD.err = false;
  TVD.played = false;
  SFX.ui && SFX.ui();
  if (TVD.scr) TVD.scr.material.map = TVD.idle;
  if (typeof THEATRE !== 'undefined' && THEATRE && THEATRE.scr) THEATRE.scr.material.map = TVD.idle;
  tvDrawIdle('load', 0);
  const ch = tvCurChan();
  const mov = tvCurMovie();
  const v = tvVideo();
  if (!TVD.partsDone) {
    await tvLoadParts(ch);
    if (!TVD.on) return;
  }
  const curTime = tvGetTime(ch);
  tvSrc(curTime);
  v.play().catch(() => { TVD.err = true; });
  if (curTime > 30) log(`TV: picking up ${mov.short} at ${Math.floor(curTime / 60)}:${String(Math.floor(curTime % 60)).padStart(2, '0')}.`);
}

function tvOff(quiet) {
  if (!TVD.on) return;
  TVD.on = false;
  const v = TVD.vid;
  if (v) {
    if (TVD.played) {
      tvSetTime(tvCurChan(), tvNow());
      markDirty();
    }
    v.pause();
  }
  if (TVD.scr) {
    TVD.scr.material.map = TVD.idle;
    TVD.scr.material.needsUpdate = true;
  }
  if (typeof THEATRE !== 'undefined' && THEATRE && THEATRE.scr) {
    THEATRE.scr.material.map = TVD.idle;
    THEATRE.scr.material.needsUpdate = true;
  }
  tvDrawIdle('off');
  if (!quiet) SFX.ui && SFX.ui();
  tvMusic(false);
}

function tvChangeChannel(delta = 1) {
  const wasOn = TVD.on;
  const oldCh = tvCurChan();
  if (wasOn) {
    tvSetTime(oldCh, tvNow());
  }
  const newCh = (oldCh + delta + TV_CHANNELS.length) % TV_CHANNELS.length;
  tvSave().ch = newCh;
  markDirty();
  TVD.cand = 0;
  TVD.part = 0;
  TVD.partsDone = false;
  TVD.parts = null;

  const mov = TV_CHANNELS[newCh];
  if (typeof SFX !== 'undefined' && SFX.ui) SFX.ui();
  toast(`CHANNEL ${newCh + 1}`, mov.title, 3);
  log(`TV: switched to Channel ${newCh + 1}: ${mov.title}`, 'chat');

  if (wasOn) {
    const v = TVD.vid;
    if (v) v.pause();
    tvDrawIdle('load', 0);
    tvLoadParts(newCh).then(() => {
      if (!TVD.on || tvCurChan() !== newCh) return;
      const targetTime = tvGetTime(newCh);
      tvSrc(targetTime);
      v.play().catch(() => { TVD.err = true; });
    });
  } else {
    tvDrawIdle('off');
  }
}

function tvMusic(down) {
  if (down === TVD.musDown) return;
  TVD.musDown = down;
  try { musTick(); } catch (_) {}
}

// the music system asks what should play; while the film is on in the den, the answer is nothing (it comes back when the TV goes off or you leave)
{ const _mc = musContext; musContext = function (dt) { if (TVD.on && TVD.musDown && tvInRoom()) return null; return _mc.apply(this, arguments); }; }
const tvInRoom = () => {
  if (typeof LEVEL !== 'undefined' && LEVEL && LEVEL.id === 'theatre') return true;
  const r = TVD.room;
  return !!r && typeof LEVEL !== 'undefined' && LEVEL && LEVEL.id === 'ship' && player.pos.x > r.x0 && player.pos.x < r.x1 && player.pos.z > r.z0 && player.pos.z < r.z1;
};
// ---- the den: couch, side table, TV, and at Lv 5 the Worm Hole ----
function tvDen(s, cx, cz, props) {
  const sd = s.side; TVD.room = { x0: Math.min(s.x0, s.x1), x1: Math.max(s.x0, s.x1), z0: s.z0, z1: s.z1 }; TVD.on = false; TVD.musDown = false; if (TVD.vid) TVD.vid.pause();
  const mx = cx + sd * 0.8; // the TV, couch and hole line up on this
  tvLoadParts();
  // couch facing the TV on the front wall
  { const g = new THREE.Group(), lea = toon('#7a3a22', 'cloth'), cush = toon('#8e4a2c', 'cloth');
    part(g, B(2.3, 0.4, 0.95), lea, 0, 0.28, 0); for (const x of [-0.55, 0.55]) part(g, B(1.08, 0.14, 0.82), cush, x, 0.55, -0.04); part(g, B(2.3, 0.75, 0.24), lea, 0, 0.75, 0.38);
    for (const x of [-1.08, 1.08]) part(g, B(0.2, 0.62, 0.95), lea, x, 0.42, 0); for (const x of [-1.05, 1.05]) for (const z of [-0.38, 0.38]) part(g, Cy(0.04, 0.03, 0.1, 6), '#2a2c32', x, 0.05, z);
    g.position.set(mx, 0, cz + 1.2); props.add(g); box(mx, cz + 1.2, 1.15, 0.45); }
  // side table with the lamp and a bowl of bait
  part(props, Cy(0.3, 0.3, 0.6, 12), toon('#5a3e2a', 'wood'), mx - sd * 1.6, 0.3, cz + 1.3); part(props, Cy(0.03, 0.03, 0.4, 5), '#2a2c32', mx - sd * 1.6, 0.8, cz + 1.3); part(props, Cy(0.12, 0.2, 0.22, 10), glow('#ffd8a0'), mx - sd * 1.6, 1.08, cz + 1.3); solid(mx - sd * 1.6, cz + 1.3, 0.35);
  // the TV on the front wall
  { const g = new THREE.Group(), W = 2.2, H = 1.65; part(g, B(W + 0.16, H + 0.16, 0.1), '#15161a', 0, 0, 0); part(g, B(0.5, 0.06, 0.12), '#2a2c32', 0, -H / 2 - 0.1, 0); part(g, B(0.3, 0.3, 0.12), '#2a2c32', 0, 0, -0.08);
    TVD.idle = tvIdleTex(); tvDrawIdle('off');
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: TVD.idle, toneMapped: false })); scr.position.z = 0.056; g.add(scr); TVD.scr = scr;
    const led = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: '#ff3a2a' })); led.position.set(W / 2 - 0.05, -H / 2 - 0.045, 0.056); g.add(led); TVD.led = led;
    const sp = new THREE.PointLight(0x9fb4d8, 0, 6, 2); sp.position.set(0, 0, 1.2); g.add(sp); TVD.glow = sp;
    g.position.set(mx, 1.85, s.z0 + 0.12); levelGroup.add(g); TVD.g = g; }
  INTERACTS.push({ x: mx, z: s.z0 + 1.1, r: 2.0, label: 'Turn on the TV', tv: true, /* only right by the TV, so the prompt stays out of the way while you watch */ fn: () => (TVD.on ? tvOff() : tvOn()) });
  INTERACTS.push({ x: mx - sd * 0.9, z: s.z0 + 1.1, r: 2.0, label: 'Change channel (C)', tvChan: true, fn: () => tvChangeChannel(1) });
  INTERACTS.push({ x: mx, z: cz + 1.2, r: 1.7, label: 'Sit on the couch', seat: true, fn: () => seatDown(mx, cz + 1.05, Math.PI * 0) });
  // ---- the Worm Hole (Lv 5) ----
  TVD.hole = null;
  if (typeof roomLvl === 'function' && roomLvl('angler') >= 5) {
    FISH_TABLES.wormhole = wormTable(); const hx = mx, hz = cz - 1.5, g = new THREE.Group(); g.position.set(hx, 0, hz); levelGroup.add(g);
    // a containment collar of dark alloy with six emitters, a hovering lens ring, and a swirling event horizon full of stars
    const alloy = toon('#2a2e36', 'panel'), trim = toon('#5a606c');
    part(g, new THREE.CylinderGeometry(0.86, 0.92, 0.1, 6), alloy, 0, 0.05, 0); part(g, new THREE.TorusGeometry(0.66, 0.06, 6, 36), trim, 0, 0.1, 0, -Math.PI / 2);
    const nodes = []; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; part(g, B(0.16, 0.14, 0.16), alloy, Math.cos(a) * 0.8, 0.14, Math.sin(a) * 0.8, 0, -a, 0); nodes.push(part(g, B(0.08, 0.05, 0.08), glow('#8fe3ff'), Math.cos(a) * 0.8, 0.23, Math.sin(a) * 0.8, 0, -a, 0)); }
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 4, 48), new THREE.MeshBasicMaterial({ color: '#c8a8ff', transparent: true, opacity: 0.7 })); lens.rotation.x = -Math.PI / 2; lens.position.y = 0.55; g.add(lens);
    const motes = []; for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.025), glow(k % 2 ? '#c8a8ff' : '#8fe3ff')); g.add(m); motes.push([m, Math.random() * 6.3, 0.15 + Math.random() * 0.4, Math.random()]); }
    const wc = document.createElement('canvas'); wc.width = wc.height = 128; const wx = wc.getContext('2d'), wt = new THREE.CanvasTexture(wc); wt.encoding = THREE.sRGBEncoding;
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.62, 40), new THREE.MeshBasicMaterial({ map: wt })); water.rotation.x = -Math.PI / 2; water.position.y = 0.106; g.add(water);
    const stars = Array.from({ length: 40 }, () => [Math.random() * 6.3, 8 + Math.random() * 54, Math.random()]);
    const L = new THREE.PointLight(0x9a7aff, 0.7, 4, 2); L.position.y = 0.5; g.add(L);
    let lastDraw = 0; levelAnims.push(t => { if (!g.parent) return; lens.position.y = 0.55 + Math.sin(t * 1.3) * 0.05; lens.rotation.z = t * 0.4; L.intensity = 0.6 + Math.sin(t * 2) * 0.15;
      nodes.forEach((n, k) => n.material.color.setHSL(0.55 + Math.sin(t * 2 + k) * 0.08, 0.9, 0.6 + Math.sin(t * 4 + k) * 0.15));
      motes.forEach(([m, a, r, ph]) => { const q = (t * 0.25 + ph) % 1, ang = a + t * 1.2 * (1 - q); m.position.set(Math.cos(ang) * r * (1 - q), 0.1 + q * 0.9, Math.sin(ang) * r * (1 - q)); m.scale.setScalar(1 - q); });
      if (t - lastDraw > 0.05) { lastDraw = t; const gr = wx.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, '#000'); gr.addColorStop(0.18, '#05010c'); gr.addColorStop(0.45, '#1a0a3a'); gr.addColorStop(0.75, '#3a1a6a'); gr.addColorStop(0.92, '#8a5ad8'); gr.addColorStop(1, '#d8c0ff'); wx.fillStyle = gr; wx.fillRect(0, 0, 128, 128);
        for (const [a, r, b] of stars) { const q = a + t * (2.4 - r / 40), rr = r * (1 - ((t * 0.05 + b) % 1) * 0.3); wx.fillStyle = `rgba(230,220,255,${0.4 + b * 0.6})`; wx.fillRect(64 + Math.cos(q) * rr, 64 + Math.sin(q) * rr, 2, 2); }
        wx.strokeStyle = 'rgba(200,170,255,.28)'; wx.lineWidth = 2; for (let k = 0; k < 4; k++) { wx.beginPath(); for (let a = 0; a < 7; a += 0.15) { const r = 10 + a * 7.5, q = a + t * 1.4 + k * 1.57; wx.lineTo(64 + Math.cos(q) * r, 64 + Math.sin(q) * r); } wx.stroke(); } wt.needsUpdate = true; } });
    box(hx, hz, 0.6, 0.6);
    TVD.hole = { x: hx, z: hz, y: 0.06, ry: 0, ice: true, worm: true };
    INTERACTS.push({ x: hx, z: hz, r: 3.4, label: 'Fish: Worm Hole', fn: () => startFishing('Worm Hole', 'wormhole') });
  }
}
{ const _ar = anglerRoom; anglerRoom = function (s, cx, cz, outer, term, props) { _ar.apply(this, arguments); try { tvDen(s, cx, cz, props); } catch (e) { console.warn('tv den', e); } }; }
{ const _ll = loadLevel; loadLevel = function () { if (TVD.on) tvOff(true); TVD.room = null; seatUp(true); const r = _ll.apply(this, arguments); if (TVD.hole && LEVEL.id === 'ship' && !FISH_SPOTS.includes(TVD.hole)) FISH_SPOTS.push(TVD.hole); return r; }; }
// ---- sitting ----
function seatDown(x, z, yaw, msg) { if (SEAT.on) return; SEAT.on = true; SEAT.x = x; SEAT.z = z; SEAT.out = V(player.pos.x, player.pos.y, player.pos.z); player.yaw = yaw; player.pitch = -0.05; _noteInput(); SFX.ui && SFX.ui(); toast(msg || 'ON THE COUCH', TOUCH ? 'Move stick to get up' : 'Move to get up · Press C to change channel', 2.5); }
function seatUp(quiet) { if (!SEAT.on) return; SEAT.on = false; _noteInput(); const tb = $('talk'); if (tb) { tb.style.opacity = '1'; tb.style.pointerEvents = 'auto'; } if (SEAT.out) { player.pos.x = SEAT.x; player.pos.z = SEAT.z - 0.9; } if (!quiet) SFX.ui && SFX.ui(); }
{ const _st = step; step = function (dt) {
  if (SEAT.on && state === 'play' && !dlgOpen && (keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.Space || Math.hypot(move.x, move.y) > 0.3)) seatUp();
  _st(dt);
  if (SEAT.on) { player.pos.x = SEAT.x; player.pos.z = SEAT.z; player.vy = 0; camera.position.set(SEAT.x, player.pos.y + 1.05, SEAT.z); }
  // Auto-hide prompt button on inactivity when seated
  const tb = $('talk');
  if (SEAT.on) {
    const idleTime = performance.now() - _tvLastInput;
    if (idleTime > 2800) {
      if (tb && tb.style.opacity !== '0') {
        tb.style.transition = 'opacity 0.6s ease';
        tb.style.opacity = '0';
        tb.style.pointerEvents = 'none';
      }
    } else {
      if (tb && tb.style.opacity !== '1') {
        tb.style.transition = 'opacity 0.2s ease';
        tb.style.opacity = '1';
        tb.style.pointerEvents = 'auto';
      }
    }
  } else {
    if (tb && (tb.style.opacity === '0' || tb.style.pointerEvents === 'none')) {
      tb.style.transition = '';
      tb.style.opacity = '1';
      tb.style.pointerEvents = 'auto';
    }
  }
  // the TV: label, power light, sound by distance, auto-pause, music down, keep the save current
  const tvI = INTERACTS.find(a => a.tv); if (tvI) tvI.label = TVD.on ? 'Turn off the TV' : 'Turn on the TV';
  const tvCI = INTERACTS.find(a => a.tvChan); if (tvCI) { const nextM = TV_CHANNELS[(tvCurChan() + 1) % TV_CHANNELS.length]; tvCI.label = `Switch to ${nextM.short} (C)`; }
  for (const a of INTERACTS) {
    if (a.seat) {
      if (typeof LEVEL !== 'undefined' && LEVEL && LEVEL.id === 'theatre') {
        a.label = SEAT.on ? (TVD.on ? 'Pause Movie [E] (Move: get up · C: Channel)' : 'Start Movie [E] (Move: get up · C: Channel)') : (a.seatLabel || 'Sit in Cinema Seat');
      } else {
        a.label = SEAT.on ? 'Get up' : 'Sit on the couch';
      }
    }
  }
  if (TVD.on) { const v = TVD.vid, inR = tvInRoom();
    if (!inR) { tvOff(true); log('Movie paused. It will pick up where you left off.'); }
    else if (v) {
      const isTheat = typeof LEVEL !== 'undefined' && LEVEL && LEVEL.id === 'theatre';
      const refX = isTheat && typeof THEATRE !== 'undefined' && THEATRE.scr ? THEATRE.scr.position.x : (TVD.g ? TVD.g.position.x : player.pos.x);
      const refZ = isTheat && typeof THEATRE !== 'undefined' && THEATRE.scr ? THEATRE.scr.position.z : (TVD.g ? TVD.g.position.z : player.pos.z);
      const d = Math.hypot(player.pos.x - refX, player.pos.z - refZ);
      const maxD = isTheat ? 38 : 11;
      v.volume = Math.max(0, Math.min(1, (PREFS.sfx === false ? 0 : 1) * (1.15 - d / maxD))); tvMusic(true);
      TVD.sinceSave += dt; if (TVD.sinceSave > 10 && !v.paused && TVD.played) { TVD.sinceSave = 0; tvSetTime(tvCurChan(), tvNow()); markDirty(); }
      if (TVD.err || (v.readyState < 2 && v.paused)) { TVD.errT = (TVD.errT || 0) + dt; if (TVD.err || TVD.errT > 12) { tvDrawIdle('static'); } else tvDrawIdle('load', gameTime); } else TVD.errT = 0;
      if (TVD.glow) TVD.glow.intensity = v.paused ? 0 : 0.5 + Math.random() * 0.15;
      if (typeof THEATRE !== 'undefined' && THEATRE && THEATRE.glow) {
        THEATRE.glow.intensity = v.paused ? 0 : 1.2 + Math.random() * 0.35;
      }
    } }
  else {
    if (TVD.glow) TVD.glow.intensity = 0;
    if (typeof THEATRE !== 'undefined' && THEATRE && THEATRE.glow) THEATRE.glow.intensity = 0;
  }
  if (TVD.led) TVD.led.material.color.set(TVD.on ? '#4fff7a' : '#ff3a2a');
}; }
// the couch's own "Get up" works too
{ const _sd = seatDown; seatDown = function () { if (SEAT.on) { seatUp(); return; } return _sd.apply(this, arguments); }; }
document.addEventListener('visibilitychange', () => { if (document.hidden && TVD.on && TVD.vid && TVD.played) { tvSave().t = tvNow(); markDirty(); } });
// ---- ice-fishing look for holes: a short jigging rod held low over the hole ----
{ const _fs = fshStart; fshStart = function (F) { _fs(F); const s = FSH.spot; if (s && s.worm) { const dx = s.x - player.pos.x, dz = s.z - player.pos.z, d = Math.hypot(dx, dz) || 1, eye = SEAT.on ? 1.05 : 1.6; player.yaw = Math.atan2(-dx, -dz); player.pitch = -Math.atan2(eye - 0.1, d) * 0.5; /* tilted up so the top of the TV stays in view */ } }; }
{ const _fst = fshStep; fshStep = function (dt) { _fst(dt); const F = fishing, H = FSH.holder, s = FSH.spot; if (!F || !H || !FSH.rod) return;
  const ice = !!(s && s.ice); FSH.rod.scale.set(1, ice ? 0.42 : 1, 1); if (!ice) { H.position.set(0.24, -0.27, -0.5); return; }
  const t = FSH.t; let jig = 0; if (F.st === 'wait') jig = Math.max(0, Math.sin(t * 2.6)) * 0.16 * (Math.sin(t * 0.7) > -0.2 ? 1 : 0.2); else if (F.st === 'bite') jig = 0.18 + Math.sin(t * 24) * 0.05 + (FSH.pull > 0 ? 0.15 : 0); else if (F.st === 'done') jig = 0.35;
  H.position.set(0.12, -0.26, -0.4); H.rotation.set(-1.05 + jig, 0, -0.2); FSH.rod.rotation.x = -jig * 0.4;
  FSH.iceLine = true; }; }
// the camera moves again after the fishing step, so a line drawn there trails behind the short rod: redraw it from the real tip right before each render
{ const _br = scene.onBeforeRender; scene.onBeforeRender = function () { if (_br) _br.apply(this, arguments); const F = fishing; if (!F || !FSH.F || !FSH.iceLine || !(FSH.spot && FSH.spot.ice) || !fshLine.visible) return;
  camera.updateMatrixWorld(true); const a = fshTip(), b = fshBobber.visible ? FSH.pos : a, P = fshLine.geometry.attributes.position, sag = F.st === 'bite' || FSH.pull > 0 ? 0.02 : 0.12;
    for (let i = 0; i < 16; i++) { const k = i / 15; P.setXYZ(i, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * sag * Math.min(1, a.distanceTo(b) / 4), a.z + (b.z - a.z) * k); } P.needsUpdate = true; }; }

window.TV_CHANNELS = TV_CHANNELS;
window.TVD = TVD;
window.SEAT = SEAT;
window.tvCurChan = tvCurChan;
window.tvCurMovie = tvCurMovie;
window.tvChangeChannel = tvChangeChannel;
window.tvOn = tvOn;
window.tvOff = tvOff;
window.seatDown = seatDown;
window.seatUp = seatUp;

