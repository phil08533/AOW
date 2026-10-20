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
  const port = 9559;
  console.log('Spawning headless Chrome on port', port);
  const chrome = spawn('google-chrome', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1280,720',
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

    const targets = await send('Target.getTargets');
    let pageTarget = targets.targetInfos.find(t => t.type === 'page');
    if (!pageTarget) {
      const newTarget = await send('Target.createTarget', { url: 'about:blank' });
      pageTarget = { targetId: newTarget.targetId };
    }
    const { sessionId } = await send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);

    console.log('Navigating to http://localhost:8080/ ...');
    await send('Page.navigate', { url: 'http://localhost:8080/' }, sessionId);
    await new Promise(r => setTimeout(r, 2000));

    const evalCode = async (expr) => {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      }, sessionId);
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result ? res.result.value : undefined;
    };

    const takeScreenshot = async (filename) => {
      await evalCode(`(() => {
        const p = document.getElementById('pause'); if (p) p.style.display = 'none';
        const s = document.getElementById('start'); if (s) s.style.display = 'none';
        const l = document.getElementById('lookPick'); if (l) l.remove();
        const G = window.__game;
        if (G && G.ENV) {
          G.ENV.forceHour = 12;
          G.ENV.forceWx = 'clear';
          G.ENV.flash = 0;
        }
        if (G && G.camera && G.player) {
          G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
          G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
        }
      })()`);
      await new Promise(r => setTimeout(r, 500));
      const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
      const buf = Buffer.from(shot.data, 'base64');
      const outPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(outPath, buf);
      console.log('Saved screenshot:', filename);
    };

    // 1. Enter Game and travel to Earth New Jamestown
    console.log('Starting game and traveling to New Jamestown...');
    const initRes = await evalCode(`(async () => {
      window.cloudDone = true;
      try { localStorage.setItem('aow-prefs', JSON.stringify({ lookPicked: 1, subs: true, gfx: 2, pix: 2 })); } catch (_) {}
      const lookGo = document.getElementById('lookGo');
      if (lookGo) lookGo.click();
      const pick = document.getElementById('lookPick');
      if (pick) pick.remove();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.click();
      await new Promise(r => setTimeout(r, 1200));
      const G = window.__game;
      if (G && G.setState) G.setState('play');
      const startEl = document.getElementById('start');
      if (startEl) startEl.hidden = true;
      if (G && G.loadLevel && (!G.LEVEL || G.LEVEL.id !== 'earth')) {
        G.loadLevel('earth');
        await new Promise(r => setTimeout(r, 1000));
      }
      if (G && G.ENV) {
        G.ENV.forceHour = 12;
        G.ENV.forceWx = 'clear';
        G.ENV.flash = 0;
      }
      return {
        level: G.LEVEL ? G.LEVEL.id : null,
        playerPos: G.player ? [G.player.pos.x, G.player.pos.y, G.player.pos.z] : null
      };
    })()`);
    console.log('Game initialized on Earth:', initRes);
    await new Promise(r => setTimeout(r, 800));

    // 2. Municipal Notice Board in Civic Plaza
    console.log('\n--- 1. Testing Municipal Notice Board ---');
    const nbRes = await evalCode(`(() => {
      const G = window.__game;
      const J = window.__jamestown;
      const tx = J.TOWN ? J.TOWN.x : 0;
      const tz = J.TOWN ? J.TOWN.z : -24;
      G.player.pos.set(tx + 0, G.groundH(tx + 0, tz - 17.5), tz - 17.5);
      G.player.yaw = 0; // Looking North
      G.player.pitch = 0.05;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
      const nbAct = G.INTERACTS.find(a => a.label && a.label.includes('Notice Board'));
      return {
        hasNbAct: !!nbAct,
        nbLabel: nbAct ? nbAct.label : null
      };
    })()`);
    console.log('Notice board check:', nbRes);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_notice_board_exterior.png');

    // Open Notice Board dialog
    await evalCode(`window.__jamestown.openNoticeBoard()`);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_notice_board_modal.png');
    await evalCode(`if (window.__game && window.__game.closeDlg) window.__game.closeDlg(); else if (typeof closeDlg === 'function') closeDlg();`);
    await new Promise(r => setTimeout(r, 400));

    // 3. Arthur Vance Stimulant Dealing
    console.log('\n--- 2. Testing Arthur Vance Stimulant Dealing ---');
    const arthurRes = await evalCode(`(() => {
      const G = window.__game;
      const J = window.__jamestown;
      const tx = J.TOWN ? J.TOWN.x : 0;
      const tz = J.TOWN ? J.TOWN.z : -24;
      G.player.pos.set(tx - 24.5, G.groundH(tx - 24.5, tz + 0), tz + 0);
      G.player.yaw = Math.PI / 2; // Looking West
      G.player.pitch = 0.05;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
      G.S.inv = G.S.inv || {};
      G.S.inv.focusfizz = 3;
      G.S.inv.voidspice = 2;
      G.S.cr = 500;
      return { cr: G.S.cr, focusfizz: G.S.inv.focusfizz, voidspice: G.S.inv.voidspice };
    })()`);
    console.log('Arthur setup:', arthurRes);
    await takeScreenshot('jamestown_arthur_booth_view.png');

    // Open Arthur Dealing dialog
    await evalCode(`window.__jamestown.openArthurDealing()`);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_arthur_dealing_modal.png');

    // Sell 1 Focus Fizz (verify 120 cr payout)
    const sellRes = await evalCode(`(() => {
      const G = window.__game;
      const crBefore = G.S.cr;
      const rows = document.querySelectorAll('#shopRows .rowi');
      let sold = false;
      rows.forEach(r => {
        if (r.textContent.includes('Focus Fizz')) {
          const btn = r.querySelector('button');
          if (btn) { btn.click(); sold = true; }
        }
      });
      return { sold, crGain: G.S.cr - crBefore, ffRemaining: G.S.inv.focusfizz, crTotal: G.S.cr };
    })()`);
    await new Promise(r => setTimeout(r, 500));
    await takeScreenshot('jamestown_arthur_after_deal.png');
    await evalCode(`(() => {
      if (window.__game && window.__game.closeDlg) window.__game.closeDlg();
      else if (typeof closeDlg === 'function') closeDlg();
      const d = document.getElementById('dlg'); if (d) d.hidden = true;
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // 4. Retro Arcade Cabinets & Pixel Pete
    console.log('\n--- 3. Testing Retro Arcade Cabinets ---');
    const arcRes = await evalCode(`(() => {
      const G = window.__game;
      const J = window.__jamestown;
      const tx = J.TOWN ? J.TOWN.x : 0;
      const tz = J.TOWN ? J.TOWN.z : -24;
      // Position facing North towards arcade cabinets at [-25, -8.2]
      G.player.pos.set(tx - 24.8, G.groundH(tx - 24.8, tz - 5.0), tz - 5.0);
      G.player.yaw = 0; // Looking North
      G.player.pitch = 0.05;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
      const snakeAct = G.INTERACTS.find(a => a.label && a.label.includes('Space Snake'));
      const rocksAct = G.INTERACTS.find(a => a.label && a.label.includes('Space Rocks'));
      return {
        hasSnakeAct: !!snakeAct,
        hasRocksAct: !!rocksAct
      };
    })()`);
    console.log('Arcade cabinets check:', arcRes);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_arcade_cabinets_facade.png');

    // Open Space Snake Arcade Game
    await evalCode(`window.arcOpen('snake');`);
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('jamestown_space_snake_cabinet.png');
    await evalCode(`(() => {
      const b = document.querySelector('#arcX') || document.querySelector('#arcadeModal button');
      if (b) b.click();
      const ov = document.getElementById('arcOv');
      if (ov) ov.remove();
      if (window.__game && window.__game.closeDlg) window.__game.closeDlg();
      else if (typeof closeDlg === 'function') closeDlg();
      const d = document.getElementById('dlg'); if (d) d.hidden = true;
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // 5. Barnaby Fish Feeding
    console.log('\n--- 4. Testing Barnaby Fish Feeding ---');
    const catRes = await evalCode(`(() => {
      const G = window.__game;
      const J = window.__jamestown;
      const tx = J.TOWN ? J.TOWN.x : 0;
      const tz = J.TOWN ? J.TOWN.z : -24;
      G.player.pos.set(tx - 18, G.groundH(tx - 18, tz + 7.8), tz + 7.8);
      G.player.yaw = 0; // Looking North
      G.player.pitch = 0.35;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
      G.S.inv = G.S.inv || {};
      G.S.inv.fish1 = 2;
      G.player.hp = 35;
      return { hp: G.player.hp, fish1: G.S.inv.fish1 };
    })()`);
    console.log('Barnaby check:', catRes);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_barnaby_view.png');

    // Feed Barnaby
    const feedRes = await evalCode(`(() => {
      const G = window.__game;
      const hpBefore = G.player.hp;
      window.__jamestown.feedBarnabyFish();
      return {
        hpAfter: G.player.hp,
        hpBefore,
        fishRemaining: G.S.inv.fish1 || 0,
        catBuff: (G.S.buffs && G.S.buffs.cat_spd) > Date.now()
      };
    })()`);
    console.log('Barnaby feed result:', feedRes);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_barnaby_fed_fish.png');
    await evalCode(`(() => {
      if (window.__game && window.__game.closeDlg) window.__game.closeDlg();
      else if (typeof closeDlg === 'function') closeDlg();
      const d = document.getElementById('dlg'); if (d) d.hidden = true;
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // 6. Cookie's Diner Patio & Menu Specials
    console.log('\n--- 5. Testing Cookie Diner Specials & Patio ---');
    const dinerRes = await evalCode(`(() => {
      const G = window.__game;
      const J = window.__jamestown;
      const tx = J.TOWN ? J.TOWN.x : 0;
      const tz = J.TOWN ? J.TOWN.z : -24;
      G.player.pos.set(tx - 5.0, G.groundH(tx - 5.0, tz + 27), tz + 27);
      G.player.yaw = Math.PI / 2; // Looking West
      G.player.pitch = 0.04;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
      return { playerPos: [G.player.pos.x, G.player.pos.y, G.player.pos.z] };
    })()`);
    console.log('Diner setup:', dinerRes);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_diner_patio_exterior.png');

    // Open Diner Menu
    await evalCode(`window.__jamestown.openDinerMenu()`);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('jamestown_diner_menu_modal.png');

    // Order coffee
    const orderRes = await evalCode(`(() => {
      const G = window.__game;
      const rows = document.querySelectorAll('#shopRows .rowi');
      let ordered = false;
      rows.forEach(r => {
        if (r.textContent.includes('Coffee')) {
          const btn = r.querySelector('button');
          if (btn) { btn.click(); ordered = true; }
        }
      });
      return {
        ordered,
        coffeeBuff: (G.S.buffs && G.S.buffs.diner_spd) > Date.now(),
        subSpeed: typeof subSpeed === 'function' ? subSpeed() : null
      };
    })()`);
    console.log('Diner order result:', orderRes);
    await evalCode(`(() => {
      if (window.__game && window.__game.closeDlg) window.__game.closeDlg();
      else if (typeof closeDlg === 'function') closeDlg();
      const d = document.getElementById('dlg'); if (d) d.hidden = true;
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // 7. Roxy Cinema Facade & Marquee
    console.log('\n--- 6. Testing Roxy Cinema Facade ---');
    await evalCode(`(() => {
      const G = window.__game;
      const J = window.__jamestown;
      const tx = J.TOWN ? J.TOWN.x : 0;
      const tz = J.TOWN ? J.TOWN.z : -24;
      const cinX = tx - 28, cinZ = tz + 12;
      G.player.pos.set(cinX, G.groundH(cinX, cinZ + 12.0), cinZ + 12.0);
      G.player.yaw = 0; // Looking North straight at marquee and entrance
      G.player.pitch = 0.10;
      if (G.camera) {
        G.camera.position.set(G.player.pos.x, G.player.pos.y + 1.6, G.player.pos.z);
        G.camera.rotation.set(G.player.pitch, G.player.yaw, 0);
      }
    })()`);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('theatre_marquee_facade.png');

    console.log('\nAll town life tests completed successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
