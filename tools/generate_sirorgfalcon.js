// Generator for Sirorgfalcon Chapter 5 Level 63 save state
const fs = require('fs');
const path = require('path');

const btoa = (str) => Buffer.from(str, 'binary').toString('base64');
const atob = (b64) => Buffer.from(b64, 'base64').toString('binary');

const cid = 'csirorgfalcon63';
const save = {
  v: 1,
  cid: cid,
  nick: 'Sirorgfalcon',
  col: '#7a6a3a',
  lvl: 63,
  xp: 1540,
  cr: 60000,
  bank: 50000,
  clip: true, // Unlimited ammo clip
  where: 'earth',
  orbit: 'earth',
  rod: 3, // Frost Rod
  melees: ['knife', 'cleaver', 'hook', 'staff', 'master', 'saber', 'thornblade', 'ramblade', 'bsaber'],
  melee: 'saber',
  guns: [
    'b1', 'b5', 'sg8', 'c10', 'r15', 'k18', 'h20', 's25', 'l28', 'f30', 
    'p35', 'r40', 'g45', 'x50', 'xbow', 'bh30', 'bh60'
  ],
  gun: 'g45',
  mods: {
    b1: 3, b5: 3, sg8: 3, c10: 3, r15: 3, k18: 3, h20: 3, s25: 3, 
    l28: 3, f30: 3, p35: 3, r40: 3, g45: 3, x50: 3, xbow: 3, bh30: 3, bh60: 3
  },
  gear: [
    'gaunt',       // Combat Gauntlets (+25% HP)
    'ring',        // Power Ring (+15% dmg)
    'cape',        // Oasis Cape (+12% speed)
    'jet',         // Salvaged Jetpack (hover)
    'eye',         // Eye Accelerator (+15% fire rate)
    'hvisor',      // Hunter's Visor (+20% boss/elite dmg)
    'gboots',      // Grav Boots (+15% run speed)
    'shockgloves', // Shock Gloves
    'armblade'     // Arm Sword (+30% melee dmg)
  ],
  ship: {
    unlocked: true,
    rooms: ['bridge', 'quarters', 'armory', 'cargo', 'med', 'trophy', 'garden', 'hangar']
  },
  flags: {
    eclipse: true,
    cape_eclipse: true
  },
  drone: {
    own: true,
    on: true,
    gun: 2,
    ord: 2,
    heal: 2,
    paint: 0,
    parts: 35
  },
  veh: {
    owned: ['battlecar', 'tank', 'skimmer'],
    sel: 'battlecar',
    res: { arm: 2, wpn: 2, eng: 2 }
  },
  pets: ['dog', 'crolan', 'bugbug', 'snorfal'],
  pet: 'snorfal',
  petXp: 850,
  fishLog: {
    minnow: 25,
    pike: 18,
    koi: 14,
    coel: 5,
    trout: 22,
    crystalgill: 15,
    sandeel: 20,
    glassfin: 16,
    ringfish: 9,
    boot: 3
  },
  look: {
    a: 'heavy',
    c: 'master',
    h: 'crest',
    f: 'cyber'
  },
  inv: {
    medkit: 25,
    scrap: 150,
    circuit: 85,
    crystal: 60,
    shell: 45,
    scale: 40,
    mandible: 30,
    sandpearl: 20,
    quillx: 25,
    fluff: 25,
    essence: 20,
    icecore: 22,
    magma: 18
  },
  qst: {
    // Earth Chapter 1
    q1: { st: 'done', p: [] },
    q2: { st: 'done', p: [] },
    q3: { st: 'done', p: [] },
    q4: { st: 'done', p: [] },
    q5: { st: 'done', p: [] },
    s1: { st: 'done', p: [] },
    s2: { st: 'done', p: [] },
    fl1: { st: 'done', p: [] },
    fl2: { st: 'done', p: [] },
    ss1: { st: 'done', p: [] },
    f1: { st: 'done', p: [] },
    // Mezar Chapter 2
    m1: { st: 'done', p: [] },
    m2: { st: 'done', p: [] },
    m3: { st: 'done', p: [] },
    m4: { st: 'done', p: [] },
    m5: { st: 'done', p: [] },
    ms1: { st: 'done', p: [] },
    ms2: { st: 'done', p: [] },
    ms3: { st: 'done', p: [] },
    f2: { st: 'done', p: [] },
    // Capitone Chapter 3
    c1: { st: 'done', p: [] },
    c2: { st: 'done', p: [] },
    c3: { st: 'done', p: [] },
    c4: { st: 'done', p: [] },
    c5: { st: 'done', p: [] },
    cs1: { st: 'done', p: [] },
    cs2: { st: 'done', p: [] },
    cf1: { st: 'done', p: [] },
    f3: { st: 'done', p: [] },
    // Moon
    l1: { st: 'done', p: [] },
    l2: { st: 'done', p: [] },
    l3: { st: 'done', p: [] },
    // Robot City Chapter 4
    r1: { st: 'done', p: [] },
    r2: { st: 'done', p: [] },
    r3: { st: 'done', p: [] },
    r4: { st: 'done', p: [] },
    r5: { st: 'done', p: [] },
    // Chapter 5: The Dark Fleet
    d1: { st: 'done', p: [] },
    d2: { st: 'done', p: [] },
    d3: { st: 'done', p: [] },
    // Chapter 5: Fort Ironrock
    a1: { st: 'done', p: [] },
    a2: { st: 'done', p: [] },
    a3: { st: 'done', p: [] },
    a4: { st: 'done', p: [] },
    // Mystic & Ocean
    mq1: { st: 'done', p: [] },
    mq2: { st: 'done', p: [] },
    o1: { st: 'done', p: [] },
    o2: { st: 'done', p: [] },
    o3: { st: 'done', p: [] },
    o4: { st: 'done', p: [] },
    // Next available: Chapter 6 Earth Sky
    k1: { st: 'active', p: [0] }
  },
  track: 'k1',
  t: Date.now()
};

const jsonStr = JSON.stringify(save, null, 2);
const transferCode = 'AOW1:' + btoa(unescape(encodeURIComponent(JSON.stringify(save))));

// Write to sirorgfalcon_save.json in root
fs.writeFileSync(path.join(__dirname, '..', 'sirorgfalcon_save.json'), jsonStr, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'sirorgfalcon_code.txt'), transferCode, 'utf8');

console.log('Successfully generated Sirorgfalcon save!');
console.log('Save file: sirorgfalcon_save.json');
console.log('Code file: sirorgfalcon_code.txt');
console.log('Transfer code prefix:', transferCode.slice(0, 40) + '...');
console.log('Total transfer code length:', transferCode.length);
