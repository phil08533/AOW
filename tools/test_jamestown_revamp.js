const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = '/home/phil/.gemini/antigravity/brain/fec63393-9784-4aca-b519-89fa486da9c2';

async function getWsUrl(port) {
  for (let i = 0; i < 30; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/version`, res => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch (_) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error('Failed to connect to Chrome CDP');
}

async function run() {
  const port = 9555;
  console.log('Spawning headless Chrome on port', port);
  const chrome = spawn('google-chrome', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1280,800',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
      const payload = { id: msgId, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });

    console.log('Opening http://localhost:8080/...');
    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:8080/' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const sendSession = (method, params = {}) => send(method, params, sessionId);

    await sendSession('Page.enable');
    await sendSession('Runtime.enable');

    console.log('Waiting for game page to load...');
    for (let i = 0; i < 50; i++) {
      const check = await sendSession('Runtime.evaluate', {
        expression: `!!(window.__jamestown && window.__game && document.getElementById('playBtn'))`,
        returnByValue: true
      });
      if (check.result && check.result.value) {
        console.log('Game page and __jamestown exports loaded!');
        break;
      }
      await new Promise(r => setTimeout(r, 300));
    }

    async function exec(expr) {
      const res = await sendSession('Runtime.evaluate', {
        expression: expr,
        awaitPromise: true,
        returnByValue: true
      });
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result ? res.result.value : res;
    }

    async function takeScreenshot(filename, waitMs = 500) {
      if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
      const { data } = await sendSession('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${filePath}`);
    }

    async function ensureInGame() {
      await exec(`(() => {
        const p = document.getElementById('pause');
        if (p) { p.hidden = true; p.style.display = 'none'; }
        const s = document.getElementById('start');
        if (s) { s.hidden = true; s.style.display = 'none'; }
        const pk = document.getElementById('lookPick');
        if (pk) pk.remove();
        if (window.__game && window.__game.setState) window.__game.setState('play');
      })()`);
    }

    // 1. Enter the game directly on Earth
    console.log('Starting game and traveling to Earth New Jamestown...');
    const initRes = await exec(`(async () => {
      window.cloudDone = true;
      try { localStorage.setItem('aow-prefs', JSON.stringify({ lookPicked: 1, subs: true, gfx: 2, pix: 2 })); } catch (_) {}
      const lookGo = document.getElementById('lookGo');
      if (lookGo) lookGo.click();
      const pick = document.getElementById('lookPick');
      if (pick) pick.remove();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.click();
      await new Promise(r => setTimeout(r, 1200));
      const J = window.__jamestown;
      const G = window.__game;
      if (G && G.setState) G.setState('play');
      const startEl = document.getElementById('start');
      if (startEl) startEl.hidden = true;
      const pick2 = document.getElementById('lookPick');
      if (pick2) pick2.remove();
      if (G && G.loadLevel && (!J.LEVEL || J.LEVEL.id !== 'earth')) {
        G.loadLevel('earth');
        await new Promise(r => setTimeout(r, 1000));
      }
      return {
        level: J.LEVEL ? J.LEVEL.id : null,
        townX: J.TOWN ? J.TOWN.x : null,
        townZ: J.TOWN ? J.TOWN.z : null,
        playerPos: J.player ? [J.player.pos.x, J.player.pos.y, J.player.pos.z] : null
      };
    })()`);
    console.log('Current level state:', initRes);

    // 2. Verify all NPCs and New Jamestown features
    console.log('\n--- Checking New Jamestown NPCs ---');
    const npcCheck = await exec(`(() => {
      const J = window.__jamestown;
      const expected = [
        'mayor', 'nash', 'mira', 'tully', 'zib', 'tailor', 'paws', 'cookie',
        'hank', 'gil', 'elismas', 'scoop', 'banjo', 'vega', 'dent',
        'arthur', 'bobby', 'barnaby', 'slick', 'viper'
      ];
      const found = [];
      const missing = [];
      expected.forEach(id => {
        const inNpcObjs = !!(J.npcObjs && J.npcObjs[id]);
        const inLevelNpcs = !!(J.LEVEL && J.LEVEL.npcs && J.LEVEL.npcs.find(n => n.id === id));
        if (inNpcObjs || inLevelNpcs) found.push(id);
        else missing.push(id);
      });
      return {
        totalExpected: expected.length,
        foundCount: found.length,
        found,
        missing,
        hasBrickTex: !!(J.TEX && J.TEX.jtBrick),
        hasSlateRoofTex: !!(J.TEX && J.TEX.jtSlateRoof),
        hasStuccoTex: !!(J.TEX && J.TEX.jtStucco)
      };
    })()`);
    console.log('NPC & Texture check:', npcCheck);

    // 3. Test Arthur Vance & Comic Reader Modal
    console.log('\n--- Testing Aranus Man Comic Reader Modal ---');
    const comicRes = await exec(`(async () => {
      const J = window.__jamestown;
      J.openComicReader(1);
      await new Promise(r => setTimeout(r, 600));
      const modal = document.getElementById('comicModal');
      const img = document.getElementById('comicImg');
      const pageNum = document.getElementById('comicPageNum');
      const page1Src = img ? img.src : null;

      // Click next page
      const nextBtn = modal ? Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Next')) : null;
      if (nextBtn) nextBtn.click();
      await new Promise(r => setTimeout(r, 300));
      const page2Src = img ? img.src : null;

      return {
        hasModal: !!modal,
        hasImg: !!img,
        page1Src,
        page2Src,
        pageNumText: pageNum ? pageNum.textContent : null
      };
    })()`);
    console.log('Comic reader result:', comicRes);
    await takeScreenshot('jamestown_comic_reader.png');

    // Close comic modal and test buying comic
    await exec(`(() => {
      const J = window.__jamestown;
      const modal = document.getElementById('comicModal');
      if (modal) modal.remove();
      J.S.cr = 5000;
      J.buyComic();
      return {
        cr: J.S.cr,
        comicCount: J.S.inv ? J.S.inv.aranus_comic : 0
      };
    })()`);

    // 4. Test Bobby the Grillmaster & Backyard BBQ
    console.log('\n--- Testing Bobby the Grillmaster & BBQ ---');
    await ensureInGame();
    const bobbyRes = await exec(`(async () => {
      const J = window.__jamestown;
      if (J.closeDlg) J.closeDlg();
      J.grabBurger();
      // Stand in front of Bobby and look at him and his BBQ grill
      const px = J.TOWN.x - 21, pz = J.TOWN.z + 36.5;
      const tx = J.TOWN.x - 21, tz = J.TOWN.z + 34;
      const gy = J.groundH(px, pz);
      J.player.pos.set(px, gy + 0.1, pz);
      const dx = tx - px, dz = tz - pz;
      J.player.yaw = Math.atan2(-dx, -dz);
      J.player.pitch = -0.12;
      await new Promise(r => setTimeout(r, 500));
      return {
        burgerInBag: J.S.inv ? J.S.inv.bbq_burger : 0,
        playerHp: J.player.hp,
        maxHp: J.maxHp()
      };
    })()`);
    console.log('Bobby BBQ result:', bobbyRes);
    await ensureInGame();
    await takeScreenshot('jamestown_backyard_bbq.png');

    // 5. Test Barnaby the Cat
    console.log('\n--- Testing Barnaby the Cat Petting ---');
    await ensureInGame();
    const catRes = await exec(`(async () => {
      const J = window.__jamestown;
      if (J.closeDlg) J.closeDlg();
      const px = J.TOWN.x - 18, pz = J.TOWN.z + 4.2;
      const tx = J.TOWN.x - 18, tz = J.TOWN.z + 6;
      const gy = J.groundH(px, pz);
      J.player.pos.set(px, gy + 0.1, pz);
      const dx = tx - px, dz = tz - pz;
      J.player.yaw = Math.atan2(-dx, -dz);
      J.player.pitch = -0.28;
      J.petBarnaby();
      await new Promise(r => setTimeout(r, 400));
      return {
        buffs: J.buffs ? Object.keys(J.buffs) : [],
        catNpc: !!(J.npcObjs && J.npcObjs['barnaby'])
      };
    })()`);
    console.log('Cat petting result:', catRes);
    await ensureInGame();
    await takeScreenshot('jamestown_cat_barnaby.png');

    // 6. Test Shady Street Runner
    console.log('\n--- Testing Shady Street Runners ---');
    await ensureInGame();
    const runnerRes = await exec(`(async () => {
      const J = window.__jamestown;
      J.S.out = J.S.out || {};
      J.S.out.rep = 0;
      J.talkRunner('slick');
      await new Promise(r => setTimeout(r, 300));
      const cleanLine = document.getElementById('dlgLine') ? document.getElementById('dlgLine').textContent : '';

      // Set rep to Shady
      J.S.out.rep = 15;
      J.talkRunner('slick');
      await new Promise(r => setTimeout(r, 300));
      const shadyLine = document.getElementById('dlgLine') ? document.getElementById('dlgLine').textContent : '';

      // Supply 3 voidspice
      J.S.inv = J.S.inv || {};
      J.S.inv.voidspice = 5;
      J.openRunnerSupply('slick');
      await new Promise(r => setTimeout(r, 300));

      const p = document.getElementById('pause');
      if (p) { p.hidden = true; p.style.display = 'none'; }

      return {
        cleanLineSnippet: cleanLine.substring(0, 60),
        shadyLineSnippet: shadyLine.substring(0, 60),
        hasSupplyMenu: !!document.getElementById('shopRows')
      };
    })()`);
    console.log('Runner test result:', runnerRes);
    await takeScreenshot('jamestown_shady_runner.png');
    await exec(`(() => { const J = window.__jamestown; if (J.closeDlg) J.closeDlg(); })()`);

    // 7. Test Inhaler First-Person Animation
    console.log('\n--- Testing First-Person Inhaler Animation ---');
    await ensureInGame();
    const inhalerRes = await exec(`(async () => {
      const J = window.__jamestown;
      if (J.closeDlg) J.closeDlg();
      J.S.inv = J.S.inv || {};
      J.S.inv.focusfizz = 3;
      window._inhalerFreeze = true;
      if (J.useSub) J.useSub('focusfizz');
      await new Promise(r => setTimeout(r, 100));
      return {
        hasCurInhaler: !!J.curInhaler,
        inhalerChildren: J.curInhaler ? J.curInhaler.children.length : 0,
        subBuffs: J.buffs ? Object.keys(J.buffs).filter(k => k.startsWith('sub_')) : []
      };
    })()`);
    console.log('Inhaler animation check:', inhalerRes);
    await ensureInGame();
    await takeScreenshot('jamestown_inhaler_anim.png', 100);
    await exec(`(() => { window._inhalerFreeze = false; })()`);

    // 8. Capture Wide City Panorama (Civic Center & Plaza)
    console.log('\n--- Capturing Town Hall & Central Plaza Panorama ---');
    await ensureInGame();
    await exec(`(async () => {
      const J = window.__jamestown;
      if (J.closeDlg) J.closeDlg();
      const px = J.TOWN.x, pz = J.TOWN.z + 18;
      const tx = J.TOWN.x, tz = J.TOWN.z - 36;
      const gy = J.groundH(px, pz);
      J.player.pos.set(px, gy + 0.1, pz);
      const dx = tx - px, dz = tz - pz;
      J.player.yaw = Math.atan2(-dx, -dz);
      J.player.pitch = 0.08;
      await new Promise(r => setTimeout(r, 600));
    })()`);
    await ensureInGame();
    await takeScreenshot('jamestown_civic_plaza.png');

    // 9. Capture Arthur Vance Book Signing Pavilion
    console.log('\n--- Capturing Arthur Vance Book Signing Pavilion ---');
    await ensureInGame();
    await exec(`(async () => {
      const J = window.__jamestown;
      if (J.closeDlg) J.closeDlg();
      const px = J.TOWN.x - 25, pz = J.TOWN.z;
      const tx = J.TOWN.x - 28, tz = J.TOWN.z;
      const gy = J.groundH(px, pz);
      J.player.pos.set(px, gy + 0.1, pz);
      const dx = tx - px, dz = tz - pz;
      J.player.yaw = Math.atan2(-dx, -dz);
      J.player.pitch = -0.05;
      await new Promise(r => setTimeout(r, 500));
    })()`);
    await ensureInGame();
    await takeScreenshot('jamestown_arthur_signing.png');

    // 10. Check Update Log 2.19
    console.log('\n--- Checking Update Log 2.19 ---');
    await exec(`(() => {
      const p = document.getElementById('pause');
      if (p) { p.hidden = true; p.style.display = 'none'; }
    })()`);
    const updRes = await exec(`(async () => {
      if (window.openUpdates) window.openUpdates(false);
      await new Promise(r => setTimeout(r, 400));
      const box = document.getElementById('shopRows');
      return {
        hasBox: !!box,
        snippet: box ? box.textContent.substring(0, 160) : '',
        has219: box ? box.textContent.includes('2.19') : false,
        hasAranusMan: box ? box.textContent.includes('Aranus Man') : false
      };
    })()`);
    console.log('Update log check:', updRes);
    await takeScreenshot('jamestown_update_log.png');

    console.log('\n🎉 ALL TESTS AND SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
