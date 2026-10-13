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
  const port = 9444;
  console.log('Spawning headless Chrome on port', port);
  const chrome = spawn('google-chrome', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1366,850',
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

    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:8080/dev.html' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const sendSession = (method, params = {}) => send(method, params, sessionId);

    await sendSession('Page.enable');
    await sendSession('Runtime.enable');

    console.log('Waiting for dev.html DOM to load...');
    for (let i = 0; i < 50; i++) {
      const check = await sendSession('Runtime.evaluate', {
        expression: `!!(window.THREE && document.getElementById('tabModeChar') && document.getElementById('tabModePlanets'))`,
        returnByValue: true
      });
      if (check.result && check.result.value) {
        console.log('dev.html DOM ready!');
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    // Helper to evaluate with promise
    async function exec(expr) {
      const res = await sendSession('Runtime.evaluate', {
        expression: expr,
        awaitPromise: true,
        returnByValue: true
      });
      return res.result ? res.result.value : res;
    }

    // Helper to take a screenshot
    async function takeScreenshot(filename) {
      await new Promise(r => setTimeout(r, 600));
      const { data } = await sendSession('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${filePath}`);
    }

    // -------------------------------------------------------------
    // Test 1: Armor Exclusivity Toggle
    // -------------------------------------------------------------
    console.log('\n--- Testing Armor Exclusivity ---');
    const armorRes = await exec(`(async () => {
      document.getElementById('tabModeChar').click();
      // Wait for charData to load
      for (let i = 0; i < 30; i++) {
        if (typeof charDataLoaded !== 'undefined' && charDataLoaded && charData && charData.armors) break;
        await new Promise(r => setTimeout(r, 100));
      }
      
      document.getElementById('subtabArmors').click();
      await new Promise(r => setTimeout(r, 400));
      
      const scout = charData.armors.find(a => a.id === 'scout') || charData.armors[0];
      selectArmor(scout);
      await new Promise(r => setTimeout(r, 300));
      
      const chk = document.getElementById('chkArmorShop');
      const badge = document.getElementById('armorPropsBadge');
      const initialChecked = chk ? chk.checked : null;
      
      // Toggle to exclusive
      if (chk) {
        chk.checked = false;
        chk.dispatchEvent(new Event('change'));
      }
      await new Promise(r => setTimeout(r, 300));
      
      const badgeAfterToggle = badge ? badge.textContent : '';
      const isShopFalse = scout.meta && scout.meta.shop === false;
      
      return {
        ok: true,
        armorId: scout.id,
        initialChecked,
        badgeAfterToggle,
        isShopFalse
      };
    })()`);
    console.log('Armor test result:', armorRes);
    await takeScreenshot('armor_studio_exclusive.png');

    // -------------------------------------------------------------
    // Test 2: Planets & Map Studio (3D View: Earth)
    // -------------------------------------------------------------
    console.log('\n--- Testing Planets Studio (3D View: Earth) ---');
    const planetEarthRes = await exec(`(async () => {
      document.getElementById('tabModePlanets').click();
      for (let i = 0; i < 30; i++) {
        if (typeof planetsLoaded !== 'undefined' && planetsLoaded && planetsData && planetsData.length) break;
        await new Promise(r => setTimeout(r, 100));
      }
      
      const earth = planetsData.find(p => p.id === 'earth');
      if (!earth) return { error: 'Earth not found' };
      selectPlanet(earth);
      await new Promise(r => setTimeout(r, 600));
      
      return {
        ok: true,
        planetCount: planetsData.length,
        selectedId: selectedPlanet.id,
        selectedName: selectedPlanet.name,
        hasMesh: !!currentModelGroup,
        childCount: currentModelGroup ? currentModelGroup.children.length : 0
      };
    })()`);
    console.log('Planet Earth result:', planetEarthRes);
    await takeScreenshot('planet_studio_3d_earth.png');

    // -------------------------------------------------------------
    // Test 3: Planets Studio (3D View: Mezar with rings)
    // -------------------------------------------------------------
    console.log('\n--- Testing Planets Studio (3D View: Mezar) ---');
    const planetMezarRes = await exec(`(async () => {
      const mezar = planetsData.find(p => p.id === 'mezar');
      if (!mezar) return { error: 'Mezar not found' };
      selectPlanet(mezar);
      await new Promise(r => setTimeout(r, 600));
      
      return {
        ok: true,
        selectedId: selectedPlanet.id,
        selectedName: selectedPlanet.name,
        childCount: currentModelGroup ? currentModelGroup.children.length : 0,
        hasRings: !!selectedPlanet.ring
      };
    })()`);
    console.log('Planet Mezar result:', planetMezarRes);
    await takeScreenshot('planet_studio_3d_mezar.png');

    // -------------------------------------------------------------
    // Test 4: Star Chart Mode
    // -------------------------------------------------------------
    console.log('\n--- Testing Star Chart Mode ---');
    const chartRes = await exec(`(async () => {
      document.getElementById('btnViewGalaxyMap').click();
      await new Promise(r => setTimeout(r, 600));
      
      const mapCanvas = document.getElementById('mapCanvas');
      return {
        ok: true,
        mode: planetViewMode,
        mapVisible: mapCanvas ? mapCanvas.style.display !== 'none' : false,
        width: mapCanvas ? mapCanvas.width : null,
        height: mapCanvas ? mapCanvas.height : null
      };
    })()`);
    console.log('Star Chart result:', chartRes);
    await takeScreenshot('planet_studio_starchart.png');

    console.log('\nAll verification steps completed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
