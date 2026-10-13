// Art of War: Setting Sun — Dedicated Server (Static Web + WebSocket Multiplayer Room)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');
const vm = require('vm');

const { execSync } = require('child_process');

const PORT = parseInt(process.env.PORT || process.argv[2] || '8080', 10);
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SRC_DIR = path.join(ROOT_DIR, 'src');

function scanModels() {
  const pattern = /function\s+(make[A-Za-z0-9_]+)\s*\((.*?)\)\s*\{/g;
  const categories = {
    'ant': 'Creatures & Aliens', 'bugbug': 'Creatures & Aliens', 'snorfal': 'Creatures & Aliens',
    'gutworm': 'Creatures & Aliens', 'porcupine': 'Creatures & Aliens', 'jumper': 'Creatures & Aliens',
    'nomine': 'Creatures & Aliens', 'snofel': 'Creatures & Aliens', 'snapvine': 'Creatures & Aliens',
    'spriggan': 'Creatures & Aliens', 'glowmoth': 'Creatures & Aliens', 'bugmaster': 'Creatures & Aliens',
    'bughybrid': 'Creatures & Aliens', 'crolan': 'Creatures & Aliens', 'stagrone': 'Creatures & Aliens',
    'skyrene': 'Creatures & Aliens', 'gopel': 'Creatures & Aliens', 'chunkmonster': 'Creatures & Aliens',
    'blaster': 'Weapons', 'xr17': 'Weapons', 'gunmodel': 'Weapons', 'meleemodel': 'Weapons', 'spearman': 'Weapons',
    'trooper': 'Characters & Troopers', 'civilian': 'Characters & Troopers', 'playerchar': 'Characters & Troopers',
    'elismas': 'Characters & Troopers', 'maxurge': 'Characters & Troopers', 'drome': 'Characters & Troopers',
    'kragmech': 'Bosses & Mechs', 'siegebot': 'Bosses & Mechs', 'mysticmodel': 'Bosses & Mechs',
    'dropship': 'Vehicles & Drones', 'dronemodel': 'Vehicles & Drones', 'trainingdrone': 'Vehicles & Drones', 'hulk': 'Vehicles & Drones',
    'gianttree': 'Props & Environment', 'fern': 'Props & Environment', 'pine': 'Props & Environment',
    'icespike': 'Props & Environment', 'hive': 'Props & Environment', 'wreck': 'Props & Environment',
    'beacon': 'Props & Environment', 'jtbuilding': 'Props & Environment', 'town': 'Props & Environment', 'land': 'Props & Environment'
  };

  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js') || f === 'game.src.html');
  const list = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(SRC_DIR, f), 'utf8');
    let m;
    while ((m = pattern.exec(content)) !== null) {
      const fnName = m[1];
      const params = m[2];
      const startPos = m.index;
      const sample = content.slice(startPos, startPos + 1200);
      if (!sample.includes('THREE.Group') && !sample.includes('part(') && !sample.includes('E(')) continue;

      let brace = 0, endPos = -1, inFn = false;
      for (let i = startPos; i < content.length; i++) {
        if (content[i] === '{') { brace++; inFn = true; }
        else if (content[i] === '}') {
          brace--;
          if (inFn && brace === 0) { endPos = i + 1; break; }
        }
      }
      const fnCode = endPos !== -1 ? content.slice(startPos, endPos) : sample;
      const startLine = content.slice(0, startPos).split('\n').length;
      const endLine = endPos !== -1 ? content.slice(0, endPos).split('\n').length : startLine + 10;

      const lowerKey = fnName.toLowerCase().replace('make', '');
      let cat = 'Other 3D Models';
      for (const [k, v] of Object.entries(categories)) {
        if (lowerKey.includes(k)) { cat = v; break; }
      }
      const cleanName = fnName.replace('make', '').replace(/([A-Z])/g, ' $1').trim() || fnName;

      list.push({
        fn: fnName,
        name: cleanName,
        file: f,
        category: cat,
        params,
        startLine,
        endLine,
        code: fnCode
      });
    }
  }
  return list;
}

function scanCharacterData() {
  const helmets = [];
  const armors = [];

  const facePath = path.join(SRC_DIR, 'face.js');
  const armorPath = path.join(SRC_DIR, 'armor.js');
  const featPath = path.join(SRC_DIR, 'features.js');
  const moonPath = path.join(SRC_DIR, 'moon.js');
  const wizPath = path.join(SRC_DIR, 'wizard.js');

  const faceContent = fs.existsSync(facePath) ? fs.readFileSync(facePath, 'utf8') : '';
  const armorContent = fs.existsSync(armorPath) ? fs.readFileSync(armorPath, 'utf8') : '';
  const featContent = fs.existsSync(featPath) ? fs.readFileSync(featPath, 'utf8') : '';
  const moonContent = fs.existsSync(moonPath) ? fs.readFileSync(moonPath, 'utf8') : '';
  const wizContent = fs.existsSync(wizPath) ? fs.readFileSync(wizPath, 'utf8') : '';

  const reserved = new Set(['for', 'if', 'while', 'switch', 'catch', 'function', 'return', 'let', 'const', 'var']);
  function parseMethods(str) {
    const res = {};
    const regex = /^\s*(\w+)\s*\(([^)]*)\)\s*\{/gm;
    let m;
    while ((m = regex.exec(str)) !== null) {
      const name = m[1];
      if (reserved.has(name)) continue;
      const args = m[2];
      const startIdx = m.index + m[0].length;
      let count = 1, endIdx = -1;
      for (let i = startIdx; i < str.length; i++) {
        if (str[i] === '{') count++;
        else if (str[i] === '}') { count--; if (count === 0) { endIdx = i; break; } }
      }
      if (endIdx !== -1) {
        res[name] = {
          name, args,
          code: 'function (' + args + ') {\n  ' + str.substring(startIdx, endIdx).trim() + '\n}'
        };
      }
    }
    return res;
  }

  // Helmets
  helmets.push({
    id: 'visor',
    name: 'Visor Helmet',
    lvl: 1,
    file: 'features.js',
    code: 'function (g, look, A) {\n  // Standard trooper visor (default helmet)\n}'
  });
  helmets.push({
    id: 'face',
    name: 'No helmet (show face)',
    lvl: 1,
    file: 'face.js',
    code: 'function (g, look) {\n  for (let i = g.children.length - 1; i >= 0; i--) {\n    const c = g.children[i];\n    if (c.position.y > 1.65 && Math.abs(c.position.x) < 0.26 && Math.abs(c.position.z) < 0.3) g.remove(c);\n  }\n  buildFace(g, faceOf(look));\n}'
  });

  // Features.js helms: spike, bug, crown
  const featHelms = {
    spike: { name: 'Spiked Helm', lvl: 15 },
    bug: { name: 'Bug Helm', lvl: 1 },
    crown: { name: 'Ice Crown', lvl: 1 }
  };
  for (const [id, meta] of Object.entries(featHelms)) {
    const r = new RegExp(id + '\\(g\\)\\s*\\{([\\s\\S]*?)\\n  \\},');
    const m = r.exec(featContent);
    helmets.push({
      id,
      name: meta.name,
      lvl: meta.lvl,
      file: 'features.js',
      code: m ? ('function (g, look, A) {\n  ' + m[1].trim() + '\n}') : 'function (g) {}'
    });
  }

  // Moon.js helms
  const moonMatch = moonContent.match(/Object\.assign\(HELM_KITS,\s*\{([\s\S]*?)\n\}\);/);
  if (moonMatch) {
    const methods = parseMethods(moonMatch[1]);
    const moonMeta = {
      horns: { name: 'Horned Helm', lvl: 8 },
      skull: { name: 'Skull Mask', lvl: 18 },
      bubble: { name: 'Bubble Helmet', lvl: 1 },
      crest: { name: 'Gladiator Crest', lvl: 12 },
      antenna: { name: 'Antenna Visor', lvl: 5 },
      goggles: { name: 'Goggle Cap', lvl: 3 }
    };
    for (const [id, m] of Object.entries(methods)) {
      const meta = moonMeta[id] || { name: id, lvl: 1 };
      helmets.push({ id, name: meta.name, lvl: meta.lvl, file: 'moon.js', code: m.code });
    }
  }

  // Wizard.js helm
  const wizMatch = wizContent.match(/HELM_KITS\.(\w+)\s*=\\s*function[^{]*\{([\\s\\S]*?)\\n\\};/);
  if (wizMatch) {
    helmets.push({
      id: wizMatch[1],
      name: 'Wizard Hat',
      lvl: 5,
      file: 'wizard.js',
      code: 'function (g, look, A) {\n  ' + wizMatch[2].trim() + '\n}'
    });
  }

  // Custom helmets in face.js
  const rCustomHelm = /HELM_KITS\.(\w+)\s*=\s*function[^{]*\{([\s\S]*?)\n\};/g;
  let chm;
  while ((chm = rCustomHelm.exec(faceContent)) !== null) {
    const id = chm[1];
    if (helmets.some(h => h.id === id)) continue;
    const nr = new RegExp('HELMS\\.' + id + '\\s*=\\s*\\{\\s*name:\\s*[\'\"]([^\'\"]+)[\'\"](?:,\\s*lvl:\\s*(\\d+))?');
    const nm = nr.exec(faceContent);
    helmets.push({
      id,
      name: nm ? nm[1] : id,
      lvl: nm && nm[2] ? parseInt(nm[2]) : 1,
      file: 'face.js',
      code: 'function (g, look, A) {\n  ' + chm[2].trim() + '\n}'
    });
  }

  // Armors
  armors.push({
    id: 'std',
    name: 'Standard Combat Rig',
    lvl: 1,
    cost: 0,
    def: 0,
    trim: '#c9b27c',
    visor: '#4fd2ff',
    body: '#6f7a3e',
    note: 'Standard issue field armor',
    shop: true,
    file: 'features.js',
    code: 'function (g, A) {\n  // Standard combat rig (base trooper colors)\n}'
  });

  const armMeta = {
    recon: { name: 'Recon Armor', lvl: 4, cost: 450, def: 0.04, trim: '#4a5a2a', visor: '#8fd94f', note: 'Camouflage scout set' },
    heavy: { name: 'Heavy Plate', lvl: 7, cost: 900, def: 0.08, trim: '#2b2a2c', visor: '#ffd36a', note: 'Reinforced ballistic plating' },
    hive: { name: 'Hive Carapace', lvl: 10, cost: 1600, def: 0.11, trim: '#3a2c1c', visor: '#ffd23a', note: 'Chitin-reinforced armor' },
    frost: { name: 'Frost Cape', lvl: 14, cost: 2400, def: 0.13, trim: '#5d7f99', visor: '#9fe8ff', note: 'Insulated sub-zero parka' },
    spike: { name: 'Spike Mail', lvl: 16, cost: 2900, def: 0.15, trim: '#b3262c', visor: '#c8402f', note: 'Barbed combat rig' },
    marshal: { name: 'Marshal Coat', lvl: 22, cost: 5000, def: 0.19, trim: '#c9a43a', visor: '#ffd36a', note: 'Galactic Marshals duster' },
    gladiator: { name: 'Gladiator Kit', lvl: 3, cost: 400, def: 0.03, trim: '#a8743a', visor: '#ffb347', note: 'From the starter-outfit sketch' },
    diver: { name: 'Deep Diver Suit', lvl: 8, cost: 1400, def: 0.07, trim: '#c9a43a', visor: '#9fe8ff', note: 'Brass dome helmet and air tanks' },
    eva: { name: 'Lunar EVA Suit', lvl: 12, cost: 2200, def: 0.1, body: '#e8eef2', trim: '#ff8a2a', visor: '#ffd36a', note: 'Moon-base spacesuit' },
    assassin: { name: 'Shadow Wraps', lvl: 18, cost: 3500, def: 0.14, body: '#2a2830', trim: '#1e1c22', visor: '#ff2a3a', note: 'Assassin set: hood, scarf, wrist blades' },
    robo: { name: 'Robo Chassis', lvl: 20, cost: 4000, def: 0.16, trim: '#5d636c', visor: '#ff2a3a', note: 'Robot City plating with a core light' },
    mystic: { name: 'Seer Robes', lvl: 24, cost: 4500, def: 0.17, trim: '#ffd36a', visor: '#c86aff', note: "Ixa's order: robes and floating orbs" },
    tank: { name: 'Tank Suit', lvl: 27, cost: 6500, def: 0.24, trim: '#5d636c', visor: '#ff8a2a', note: 'Heavy plated suit with arm cannon' },
    mech: { name: 'Mech Frame', lvl: 34, cost: 9000, def: 0.27, trim: '#3a3d44', visor: '#4fd2ff', note: 'Exo-frame with missile pod' },
    drome: { name: 'Drome Warplate', lvl: 40, cost: 15000, def: 0.3, body: '#1e1c22', trim: '#2a1416', visor: '#ff2a3a', note: "The villain's own armor" }
  };

  // Dynamically parse ARMORS entries from armorContent for custom metadata (e.g. shop availability)
  const rArmLine = /([a-zA-Z0-9_]+)\s*:\s*\{([^}]+)\}/g;
  let alm;
  while ((alm = rArmLine.exec(armorContent)) !== null) {
    const aid = alm[1], props = alm[2];
    if (aid === 'ARMORS' || aid === 'ARMOR_KITS' || aid === 'const' || aid === 'AK') continue;
    if (!armMeta[aid]) armMeta[aid] = {};
    const nm = props.match(/name:\s*['"]([^'"]+)['"]/); if (nm) armMeta[aid].name = nm[1];
    const lv = props.match(/lvl:\s*(\d+)/); if (lv) armMeta[aid].lvl = parseInt(lv[1]);
    const cst = props.match(/cost:\s*(\d+)/); if (cst) armMeta[aid].cost = parseInt(cst[1]);
    const df = props.match(/def:\s*([0-9.]+)/); if (df) armMeta[aid].def = parseFloat(df[1]);
    const tr = props.match(/trim:\s*['"]([^'"]+)['"]/); if (tr) armMeta[aid].trim = tr[1];
    const vs = props.match(/visor:\s*['"]([^'"]+)['"]/); if (vs) armMeta[aid].visor = vs[1];
    const bd = props.match(/body:\s*['"]([^'"]+)['"]/); if (bd) armMeta[aid].body = bd[1];
    const nt = props.match(/note:\s*['"]([^'"]+)['"]/); if (nt) armMeta[aid].note = nt[1];
    const shp = props.match(/shop:\s*(true|false)/); if (shp) armMeta[aid].shop = shp[1] === 'true';
  }

  const akMatch = armorContent.match(/const AK\s*=\s*\{([\s\S]*?)\n\};/);
  if (akMatch) {
    const methods = parseMethods(akMatch[1]);
    for (const [id, m] of Object.entries(methods)) {
      const meta = armMeta[id] || { name: id, lvl: 1 };
      armors.push({
        id,
        name: meta.name || id,
        lvl: meta.lvl || 1,
        cost: meta.cost || 0,
        def: meta.def || 0,
        trim: meta.trim || '#c9b27c',
        visor: meta.visor || '#4fd2ff',
        body: meta.body || '',
        note: meta.note || '',
        shop: meta.shop !== false,
        file: 'armor.js',
        code: m.code
      });
    }
  }

  // Parse custom armors appended to armor.js
  const rCustomArmor = /ARMOR_KITS\.(\w+)\s*=\s*function[^{]*\{([\s\S]*?)\n\};/g;
  let cam;
  while ((cam = rCustomArmor.exec(armorContent)) !== null) {
    const id = cam[1];
    if (armors.some(a => a.id === id)) continue;
    const meta = armMeta[id] || { name: id, lvl: 1 };
    armors.push({
      id,
      name: meta.name || id,
      lvl: meta.lvl || 1,
      cost: meta.cost || 0,
      def: meta.def || 0,
      trim: meta.trim || '#c9b27c',
      visor: meta.visor || '#4fd2ff',
      body: meta.body || '',
      note: meta.note || '',
      shop: meta.shop !== false,
      file: 'armor.js',
      code: 'function (g, A) {\n  ' + cam[2].trim() + '\n}'
    });
  }

  const faceData = {
    skin: ['#e0b892', '#c58a64', '#8a5a3a', '#5a3a24', '#7fae63', '#6a9ad8', '#9aa1aa', '#a86ad8'],
    skinN: ['Light', 'Tan', 'Brown', 'Deep', 'Alien green', 'Alien blue', 'Chrome', 'Violet'],
    eyesN: ['Normal', 'Angry', 'Visor strip', 'Cyclops', 'Bug eyes', 'Goggles', 'Scar', 'Glowing'],
    mouthN: ['None', 'Grin', 'Beard', 'Mandibles', 'Respirator', 'Tusks'],
    hairN: ['Bald', 'Buzz cut', 'Mohawk', 'Spikes', 'Ponytail', 'Antennae', 'Horns', 'Fin crest', 'Afro', 'Topknot'],
    hairC: ['#1e1a18', '#5a3a22', '#c9a43a', '#e8e4dc', '#c8402f', '#4fd2ff', '#6fdc5a', '#c86aff']
  };

  return { helmets, armors, face: faceData, faceFile: faceContent, armorFile: armorContent };
}

function scanPlanetsData() {
  const spaceFp = path.join(SRC_DIR, 'space.js');
  const levelsFp = path.join(SRC_DIR, 'levels.js');
  const spaceContent = fs.readFileSync(spaceFp, 'utf8');
  const levelsContent = fs.readFileSync(levelsFp, 'utf8');

  let spaceBodies = {};
  const sbMatch = spaceContent.match(/const SPACE_BODIES\s*=\s*(\{[\s\S]*?\n\};)/);
  if (sbMatch) {
    try {
      const sandbox = { V: (x, y, z) => ({ x, y, z }) };
      spaceBodies = vm.runInNewContext(`(${sbMatch[1].replace(/;$/, '')})`, sandbox);
    } catch (e) {
      console.error('Error parsing SPACE_BODIES:', e);
    }
  }

  // Scan extra bodies from other source files if any
  const extraFiles = ['arena.js', 'army.js', 'racing.js', 'skycity.js'];
  for (const ef of extraFiles) {
    const efp = path.join(SRC_DIR, ef);
    if (!fs.existsSync(efp)) continue;
    const txt = fs.readFileSync(efp, 'utf8');
    const rx = /SPACE_BODIES\.(\w+)\s*=\s*\{([^}]+)\}/g;
    let m;
    while ((m = rx.exec(txt)) !== null) {
      const bid = m[1];
      if (!spaceBodies[bid]) {
        try {
          const sandbox = {
            V: (x, y, z) => ({ x, y, z, multiplyScalar: () => ({ x, y, z }) }),
            SPACE_SPREAD: 1.45,
            SPACE_BODIES: { earth: { pos: { clone: () => ({ add: (v) => ({ x: v.x, y: -40 + v.y, z: -700 + v.z }) }) } } }
          };
          const bObj = vm.runInNewContext(`({${m[2]}})`, sandbox);
          spaceBodies[bid] = bObj;
        } catch (_) {}
      }
    }
  }

  let planetLooks = {};
  const plMatch = levelsContent.match(/const PLANET_LOOK\s*=\s*(\{[\s\S]*?\n\};)/);
  if (plMatch) {
    try {
      planetLooks = vm.runInNewContext(`(${plMatch[1].replace(/;$/, '')})`);
    } catch (e) {
      console.error('Error parsing PLANET_LOOK:', e);
    }
  }

  const PLANET_META = {
    earth: { name: 'Earth', desc: 'Home world of New Jamestown, Forest of Life, and Super Swift Arena.' },
    mezar: { name: 'Mezar', desc: 'Arid canyon world with deep sandstone ravines, sand worms, and outposts.' },
    capitone: { name: 'Capitone', desc: 'Volcanic and glacial world of fire, magma lakes, and ice spires.' },
    robot: { name: 'Robot City', desc: 'Industrial cyber-megacity governed by autonomous defense grids.' },
    zeltac: { name: 'Zeltac Station', desc: 'Orbital starbase, bounty hunters hub, casino, and trading station.' },
    moon: { name: "Earth's Moon", desc: 'Low-gravity lunar colony with mining complexes and biodomes.' },
    ocean: { name: 'Ocean World', desc: 'Endless aquatic expanse with submerged cities, bioluminescent kelp, and leviathans.' },
    zarlich: { name: 'Zarlich', desc: 'Violet storm planet with hyper-charged ring system and alien flora.' },
    vector: { name: 'Vector', desc: 'The dark world enveloped in deep purple haze. Something watches back.' },
    arena: { name: 'Gladiator Arena', desc: 'Asteroid arena world hosted for interstellar combat trials.' },
    fort: { name: 'Fort Ironrock', desc: 'Heavy fortified military bastion and garrison outpost.' },
    speedway: { name: 'Hyper Speedway', desc: 'Neon rings and raceway world for high-speed ship competition.' },
    skycity: { name: 'Sky City', desc: 'Floating metropolis hovering in the upper troposphere above Earth.' }
  };

  const list = [];
  for (const [id, body] of Object.entries(spaceBodies)) {
    const meta = PLANET_META[id] || {};
    const look = planetLooks[id] || {
      seed: (Math.abs(Math.round((body.pos ? body.pos.x : 0) + (body.pos ? body.pos.z : 0))) % 100) || 1,
      ramp: [[0, body.col || '#3a6cb8'], [0.5, '#5d7f99'], [1, '#ffffff']],
      craters: !body.clouds
    };
    list.push({
      id,
      name: body.survey || meta.name || (id.charAt(0).toUpperCase() + id.slice(1)),
      survey: body.survey || '',
      note: body.note || meta.desc || '',
      pos: { x: body.pos ? Math.round(body.pos.x) : 0, y: body.pos ? Math.round(body.pos.y) : 0, z: body.pos ? Math.round(body.pos.z) : 0 },
      r: body.r || 100,
      col: body.col || '#9aa1aa',
      clouds: !!body.clouds,
      ring: !!body.ring,
      station: !!body.station,
      look: {
        seed: look.seed || 1,
        ramp: look.ramp || [[0, '#1a3a7a'], [1, '#ffffff']],
        bands: look.bands || 0,
        caps: look.caps || 0,
        clouds: typeof look.clouds === 'string' ? look.clouds : (body.clouds ? '#ffffff' : ''),
        lava: look.lava || '',
        grid: look.grid || '',
        glowDots: look.glowDots || '',
        craters: !!look.craters
      }
    });
  }

  return { planets: list };
}


const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
};

// 1. HTTP Server for static game files & Developer API
const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Check if request is coming directly from localhost/internal machine (not proxied through Cloudflare Tunnel)
  const clientIp = req.socket.remoteAddress || '';
  const hasProxyHeader = !!(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.headers['cf-ray']);
  const host = (req.headers.host || '').toLowerCase();
  const isLocalHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const isLocalIp = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1';
  const isLocal = !hasProxyHeader && isLocalHost && isLocalIp;

  // --- DEVELOPER API (Localhost only) ---
  if (pathname.startsWith('/api/')) {
    if (!isLocal) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Access denied: Developer API is restricted to local machine' }));
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // GET /api/files - List all JS files in src/
    if (req.method === 'GET' && pathname === '/api/files') {
      try {
        const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js') || f.endsWith('.html'));
        const list = files.map(name => {
          const fp = path.join(SRC_DIR, name);
          const st = fs.statSync(fp);
          const content = fs.readFileSync(fp, 'utf8');
          const lines = content.split('\n').length;
          return {
            name,
            size: st.size,
            mtime: st.mtimeMs,
            lines
          };
        });
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ files: list }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // GET /api/file?name=xxx.js - Get single file content
    if (req.method === 'GET' && pathname === '/api/file') {
      const name = urlObj.searchParams.get('name');
      if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid filename' }));
        return;
      }
      const fp = path.join(SRC_DIR, name);
      if (!fs.existsSync(fp)) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'File not found' }));
        return;
      }
      try {
        const content = fs.readFileSync(fp, 'utf8');
        const st = fs.statSync(fp);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          name,
          content,
          size: st.size,
          mtime: st.mtimeMs,
          lines: content.split('\n').length
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // POST /api/save - Save file content to src/ and optionally rebuild dist/index.html
    if (req.method === 'POST' && pathname === '/api/save') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const name = payload.name;
          const content = payload.content;
          if (!name || name.includes('..') || name.includes('/') || name.includes('\\') || typeof content !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid name or content' }));
            return;
          }
          const fp = path.join(SRC_DIR, name);
          fs.writeFileSync(fp, content, 'utf8');

          let buildMsg = '';
          if (rebuild !== false) {
            try {
              buildMsg = execSync('python3 tools/build.py', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
            } catch (bErr) {
              buildMsg = 'Build error: ' + (bErr.stderr || bErr.message);
            }
          }

          broadcastAssetCacheBust('file', name, '');

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, name, build: buildMsg }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // GET /api/models - List all 3D model generator functions and their code
    if (req.method === 'GET' && pathname === '/api/models') {
      try {
        const list = scanModels();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ models: list }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // GET /api/character-data - Get source code and metadata for faces, helmets, and armors
    if (req.method === 'GET' && pathname === '/api/character-data') {
      try {
        const charData = scanCharacterData();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(charData));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // POST /api/save-character-part - Update or add a helmet, armor set, or face code
    if (req.method === 'POST' && pathname === '/api/save-character-part') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const { type, id, name, code, meta } = payload;
          if (!type || !id || !code) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing type, id, or code' }));
            return;
          }

          if (type === 'helmet') {
            const fp = path.join(SRC_DIR, 'face.js');
            let content = fs.readFileSync(fp, 'utf8');
            const kitRegex = new RegExp('(HELM_KITS\\.' + id + '\\s*=\\s*function[^{]*\\{[\\s\\S]*?\\n\\};?)');
            const metaRegex = new RegExp('(HELMS\\.' + id + '\\s*=\\s*\\{[^}]*\\};?)');
            const newMetaLine = `HELMS.${id} = { name: ${JSON.stringify(name || id)}, lvl: ${(meta && meta.lvl) || 1} };`;
            const newKitBlock = `HELM_KITS.${id} = ${code.trim()};`;

            if (kitRegex.test(content)) {
              content = content.replace(kitRegex, newKitBlock);
              if (metaRegex.test(content)) content = content.replace(metaRegex, newMetaLine);
            } else {
              content = content.trim() + `\n\n// Added Helmet: ${name || id}\n${newMetaLine}\n${newKitBlock}\n`;
            }
            fs.writeFileSync(fp, content, 'utf8');
          } else if (type === 'armor') {
            const fp = path.join(SRC_DIR, 'armor.js');
            let content = fs.readFileSync(fp, 'utf8');
            const metaObj = {
              name: name || id,
              lvl: (meta && meta.lvl) || 1,
              cost: (meta && meta.cost) || 500,
              def: (meta && meta.def) || 0.05,
              trim: (meta && meta.trim) || '#a8743a',
              visor: (meta && meta.visor) || '#ffd36a',
              body: (meta && meta.body) || '',
              note: (meta && meta.note) || '',
              shop: (meta && typeof meta.shop === 'boolean') ? meta.shop : true
            };
            const shopStr = metaObj.shop === false ? ', shop: false' : '';
            const metaLine = `  ${id}: { name: ${JSON.stringify(metaObj.name)}, lvl: ${metaObj.lvl}, cost: ${metaObj.cost}, def: ${metaObj.def}, trim: ${JSON.stringify(metaObj.trim)}, visor: ${JSON.stringify(metaObj.visor)}${metaObj.body ? `, body: ${JSON.stringify(metaObj.body)}` : ''}, note: ${JSON.stringify(metaObj.note)}${shopStr} },`;

            const assignMarker = 'Object.assign(ARMORS, {';
            if (content.includes(`${id}: {`)) {
              const armRegex = new RegExp('([ \\t]*' + id + ':\\s*\\{[^}]*\\},?)');
              content = content.replace(armRegex, metaLine);
            } else if (content.includes(assignMarker)) {
              content = content.replace(assignMarker, assignMarker + '\n' + metaLine);
            }

            const kitRegex = new RegExp('(ARMOR_KITS\\.' + id + '\\s*=\\s*function[^{]*\\{[\\s\\S]*?\\n\\};?)');
            if (kitRegex.test(content)) {
              content = content.replace(kitRegex, `ARMOR_KITS.${id} = ${code.trim()};`);
            } else {
              content = content.trim() + `\n\n// Added Armor Kit: ${name || id}\nARMOR_KITS.${id} = ${code.trim()};\n`;
            }
            fs.writeFileSync(fp, content, 'utf8');
          } else if (type === 'face') {
            const fp = path.join(SRC_DIR, 'face.js');
            fs.writeFileSync(fp, code, 'utf8');
          }

          let buildMsg = '';
          try {
            buildMsg = execSync('python3 tools/build.py', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
          } catch (bErr) {
            buildMsg = 'Build error: ' + (bErr.stderr || bErr.message);
          }

          broadcastAssetCacheBust(type, id, code);

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, type, id, build: buildMsg }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // GET /api/planets - List all planets, celestial bodies, and procedural looks
    if (req.method === 'GET' && pathname === '/api/planets') {
      try {
        const data = scanPlanetsData();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // POST /api/save-planet - Save planet coordinates, celestial properties, and PLANET_LOOK
    if (req.method === 'POST' && pathname === '/api/save-planet') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const { id, name, survey, note, pos, r, col, clouds, ring, station, look } = payload;
          if (!id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing planet id' }));
            return;
          }

          // 1. Update src/space.js
          const spaceFp = path.join(SRC_DIR, 'space.js');
          let spaceContent = fs.readFileSync(spaceFp, 'utf8');

          const extraProps = [];
          if (clouds) extraProps.push('clouds: true');
          if (ring) extraProps.push('ring: true');
          if (station) extraProps.push('station: true');
          if (survey) extraProps.push(`survey: ${JSON.stringify(survey)}`);
          if (note) extraProps.push(`note: ${JSON.stringify(note)}`);
          const extraStr = extraProps.length ? ', ' + extraProps.join(', ') : '';
          const px = pos && pos.x != null ? Math.round(pos.x) : 0;
          const py = pos && pos.y != null ? Math.round(pos.y) : 0;
          const pz = pos && pos.z != null ? Math.round(pos.z) : 0;
          const rad = r != null ? Math.round(r) : 120;
          const colorHex = col || '#9aa1aa';
          const bodyLine = `  ${id}: { pos: V(${px}, ${py}, ${pz}), r: ${rad}, col: ${JSON.stringify(colorHex)}${extraStr} },`;

          const bodyRegex = new RegExp('([ \\t]*' + id + ':\\s*\\{[^}]*\\},?)');
          if (bodyRegex.test(spaceContent)) {
            spaceContent = spaceContent.replace(bodyRegex, bodyLine);
          } else {
            const sbEnd = /const SPACE_BODIES\s*=\s*\{([\s\S]*?)\n\};/;
            if (sbEnd.test(spaceContent)) {
              spaceContent = spaceContent.replace(sbEnd, (match, p1) => {
                return `const SPACE_BODIES = {${p1}\n${bodyLine}\n};`;
              });
            } else {
              spaceContent = spaceContent.trim() + `\n\nSPACE_BODIES.${id} = { pos: V(${px}, ${py}, ${pz}), r: ${rad}, col: ${JSON.stringify(colorHex)}${extraStr} };\n`;
            }
          }
          fs.writeFileSync(spaceFp, spaceContent, 'utf8');

          // 2. Update src/levels.js (PLANET_LOOK)
          const levelsFp = path.join(SRC_DIR, 'levels.js');
          let levelsContent = fs.readFileSync(levelsFp, 'utf8');

          const lk = look || {};
          const lookParts = [`seed: ${lk.seed || 1}`, `ramp: ${JSON.stringify(lk.ramp || [[0, '#1a3a7a'], [1, '#ffffff']])}`];
          if (lk.bands) lookParts.push(`bands: ${Number(lk.bands)}`);
          if (lk.caps) lookParts.push(`caps: ${Number(lk.caps)}`);
          if (lk.clouds) lookParts.push(`clouds: ${JSON.stringify(lk.clouds)}`);
          if (lk.lava) lookParts.push(`lava: ${JSON.stringify(lk.lava)}`);
          if (lk.grid) lookParts.push(`grid: ${JSON.stringify(lk.grid)}`);
          if (lk.glowDots) lookParts.push(`glowDots: ${JSON.stringify(lk.glowDots)}`);
          if (lk.craters) lookParts.push(`craters: true`);
          const lookLine = `  ${id}: { ${lookParts.join(', ')} },`;

          const lookRegex = new RegExp('([ \\t]*' + id + ':\\s*\\{[^}]*\\},?)');
          if (lookRegex.test(levelsContent)) {
            levelsContent = levelsContent.replace(lookRegex, lookLine);
          } else {
            const plEnd = /const PLANET_LOOK\s*=\s*\{([\s\S]*?)\n\};/;
            if (plEnd.test(levelsContent)) {
              levelsContent = levelsContent.replace(plEnd, (match, p1) => {
                return `const PLANET_LOOK = {${p1}\n${lookLine}\n};`;
              });
            } else {
              levelsContent = levelsContent.trim() + `\n\nPLANET_LOOK.${id} = { ${lookParts.join(', ')} };\n`;
            }
          }
          fs.writeFileSync(levelsFp, levelsContent, 'utf8');

          let buildMsg = '';
          try {
            buildMsg = execSync('python3 tools/build.py', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
          } catch (bErr) {
            buildMsg = 'Build error: ' + (bErr.stderr || bErr.message);
          }

          broadcastAssetCacheBust('planet', id, '');

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, id, build: buildMsg }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // POST /api/save-model - Update single model function in its source file
    if (req.method === 'POST' && pathname === '/api/save-model') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const { fn, file, code, rebuild } = payload;
          if (!fn || !file || !code || file.includes('..') || file.includes('/') || file.includes('\\')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid fn, file, or code' }));
            return;
          }
          const fp = path.join(SRC_DIR, file);
          if (!fs.existsSync(fp)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'File not found' }));
            return;
          }
          let content = fs.readFileSync(fp, 'utf8');
          const reg = new RegExp('function\\s+' + fn + '\\s*\\([^)]*\\)\\s*\\{');
          const m = reg.exec(content);
          if (!m) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Function ${fn} not found in ${file}` }));
            return;
          }
          const startPos = m.index;
          let brace = 0, endPos = -1, inFn = false;
          for (let i = startPos; i < content.length; i++) {
            if (content[i] === '{') { brace++; inFn = true; }
            else if (content[i] === '}') {
              brace--;
              if (inFn && brace === 0) { endPos = i + 1; break; }
            }
          }
          if (endPos === -1) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: `Could not parse boundaries of ${fn}` }));
            return;
          }

          const updatedContent = content.slice(0, startPos) + code.trim() + content.slice(endPos);
          fs.writeFileSync(fp, updatedContent, 'utf8');

          let buildMsg = '';
          if (rebuild !== false) {
            try {
              buildMsg = execSync('python3 tools/build.py', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
            } catch (bErr) {
              buildMsg = 'Build error: ' + (bErr.stderr || bErr.message);
            }
          }

          broadcastAssetCacheBust('model', fn, code);

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, fn, file, build: buildMsg }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  let cleanUrl = pathname;
  if (cleanUrl === '/' || cleanUrl === '') cleanUrl = '/index.html';
  if (cleanUrl === '/dev' || cleanUrl === '/dev.html' || cleanUrl === '/editor' || cleanUrl === '/editor.html' || cleanUrl === '/workbench' || cleanUrl === '/admin' || cleanUrl === '/admin.html') {
    if (!isLocal) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Access Forbidden: Developer workbench is only accessible from the host PC');
      return;
    }
    cleanUrl = '/dev.html';
  }

  const safePath = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, '');
  let filePath;
  if (cleanUrl.startsWith('/src/')) {
    if (!isLocal) {
      res.statusCode = 403;
      res.end('Access Forbidden');
      return;
    }
    filePath = path.join(SRC_DIR, safePath.replace(/^src[\/\\]/, ''));
  } else {
    filePath = path.join(DIST_DIR, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', ext === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600');

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.statusCode = 500;
      res.end('Server Error');
    });
    stream.pipe(res);
  });
});

// 2. WebSocket Multiplayer Room
const wss = new WebSocketServer({ server });
const clients = new Map(); // ws -> { peerId, presence, lastActive }

function broadcastAssetCacheBust(target, id, code) {
  const payload = JSON.stringify({
    type: 'asset_cache_bust',
    target: target || 'model',
    id: id || '',
    code: code || '',
    time: Date.now()
  });
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

let broadcastTimeout = null;

function broadcastPeers() {
  broadcastTimeout = null;
  const peerList = [];
  for (const info of clients.values()) {
    if (info.presence && info.presence.nick) {
      peerList.push({
        peer: info.peerId,
        kind: 'viewer',
        presence: info.presence,
      });
    }
  }

  const payload = JSON.stringify({ type: 'peers', peers: peerList });
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function scheduleBroadcast(immediate = false) {
  if (immediate) {
    if (broadcastTimeout) clearTimeout(broadcastTimeout);
    broadcastPeers();
    return;
  }
  if (!broadcastTimeout) {
    broadcastTimeout = setTimeout(broadcastPeers, 50); // 20 updates per second
  }
}

wss.on('connection', (ws) => {
  const peerId = 'p_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  clients.set(ws, { peerId, presence: null, lastActive: Date.now() });

  console.log(`[Multiplayer] Trooper connected: ${peerId} (Total online: ${clients.size})`);

  // Send initial welcome with assigned peer ID
  ws.send(JSON.stringify({ type: 'welcome', peerId }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'presence' && msg.presence) {
        const info = clients.get(ws);
        if (info) {
          info.presence = msg.presence;
          info.lastActive = Date.now();
          // If this is a chat message, shout, or action, broadcast immediately
          const isImmediate = !!(msg.presence.msg || msg.presence.sh || msg.presence.cmd);
          scheduleBroadcast(isImmediate);
        }
      }
    } catch (_) {}
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    clients.delete(ws);
    console.log(`[Multiplayer] Trooper disconnected: ${info ? info.peerId : 'unknown'} (Total online: ${clients.size})`);
    scheduleBroadcast(true);
  });

  ws.on('error', () => {
    ws.close();
  });
});

// Periodic heartbeat to clean dead sockets
setInterval(() => {
  for (const [ws, info] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clients.delete(ws);
    }
  }
}, 30000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`⚔  Art of War: Setting Sun Game & Room Server`);
  console.log(`📡 Local web & multiplayer: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
