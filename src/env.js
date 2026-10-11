// =================== DAY / NIGHT + WEATHER ===================
// One shared clock: every player sees the same time of day and the same weather, because both
// come from the real time. A full day lasts 16 minutes; weather changes every 5 minutes.
const DAY_LEN = 960;
const ENV = { hour: 18, light: 1, night: 0, cloud: 0, rain: 0, storm: 0, flash: 0, nextStrike: 6, forceHour: null, forceWx: null, wxName: 'clear', init: false };
const SKY_KEYS = [
  [0, '#04051a', '#0b1036', '#1a2050', 0.22], [4.5, '#05061c', '#101540', '#202656', 0.22],
  [6, '#2c2c60', '#a65a7a', '#ffa868', 0.62], [8, '#3d68c4', '#88b6e8', '#d6e8f2', 1.0],
  [16, '#3d68c4', '#88b6e8', '#d6e8f2', 1.0], [18.4, '#2a2448', '#8a4d6b', '#f0a15e', 0.78],
  [19.8, '#141432', '#3a2a55', '#6a3a52', 0.42], [21.3, '#04051a', '#0b1036', '#1a2050', 0.22], [24, '#04051a', '#0b1036', '#1a2050', 0.22]
].map(([h, a, b, c, l]) => [h, new THREE.Color(a), new THREE.Color(b), new THREE.Color(c), l]);
const STORM_TOP = new THREE.Color('#2c3038'), STORM_MID = new THREE.Color('#4a4f5a'), STORM_HOR = new THREE.Color('#6c7078'), NIGHT_STORM = new THREE.Color('#121419'), FLASH = new THREE.Color('#dfe3ff');
const WX = { clear: [0.08, 0, 0], cloudy: [0.6, 0, 0], rain: [0.85, 0.75, 0], storm: [1, 1, 1], sandstorm: [0.5, 0, 0], snowfall: [0.7, 0, 0] };
const RB_HOR = new THREE.Color('#c8604a'), RB_MID = new THREE.Color('#6a2a3a'), RB_TOP = new THREE.Color('#1a0e1e'), ACID_COL = new THREE.Color('#9fff6a');
const SNOW_COL = new THREE.Color('#f4f8ff'), CP_HOR = new THREE.Color('#bfe0e0'), CP_MID = new THREE.Color('#6aa8a8');
ENV.sand = 0;
const SAND_COL = new THREE.Color('#d8b070'), RAIN_COL = new THREE.Color('#b4c0dc'), MZ_HOR = new THREE.Color('#f0b070'), MZ_MID = new THREE.Color('#d88a5a'), MZ_NIGHT = new THREE.Color('#1c0c2c');
const WX_CYCLE = ['clear', 'cloudy', 'clear', 'rain', 'clear', 'storm', 'cloudy', 'clear', 'rain', 'cloudy'];
const skyTop = new THREE.Color(), skyMid = new THREE.Color(), skyHor = new THREE.Color();
function sampleSky(h) {
  for (let i = 0; i < SKY_KEYS.length - 1; i++) {
    const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
    if (h >= a[0] && h <= b[0]) { const t = (h - a[0]) / (b[0] - a[0]); skyTop.copy(a[1]).lerp(b[1], t); skyMid.copy(a[2]).lerp(b[2], t); skyHor.copy(a[3]).lerp(b[3], t); return a[4] + (b[4] - a[4]) * t; }
  }
  return 0.22;
}
function weatherNow() {
  if (ENV.forceWx) return ENV.forceWx;
  const block = Math.floor(Date.now() / 300000), r = Math.abs(Math.sin(block * 12.9898) * 43758.5453) % 1;
  return WX_CYCLE[Math.floor(r * WX_CYCLE.length)];
}
// stars, moon, rain, fireflies, lantern
const stars = (() => {
  const n = 520, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random() * 0.95), r = 170; pos[i * 3] = Math.sin(v) * Math.cos(u) * r; pos[i * 3 + 1] = Math.cos(v) * r * 0.9 + 4; pos[i * 3 + 2] = Math.sin(v) * Math.sin(u) * r; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ map: TEX.star, size: 4, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false, opacity: 0 }));
  scene.add(p); return p;
})();
const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(8, 20), new THREE.MeshBasicMaterial({ color: '#e4ebff', fog: false, transparent: true }));
scene.add(moonDisc);
const moonSpots = new THREE.Mesh(new THREE.CircleGeometry(2.2, 10), new THREE.MeshBasicMaterial({ color: '#b8c2e0', fog: false, transparent: true })); moonDisc.add(moonSpots); moonSpots.position.set(2, 1.5, 0.1);
const RAIN_N = 900;
const rain = (() => {
  const pos = new Float32Array(RAIN_N * 6), g = new THREE.BufferGeometry();
  for (let i = 0; i < RAIN_N; i++) { const x = (Math.random() - 0.5) * 36, y = Math.random() * 22 - 6, z = (Math.random() - 0.5) * 36; pos.set([x, y, z, x + 0.05, y - 0.7, z + 0.08], i * 6); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#b4c0dc', transparent: true, opacity: 0, fog: false, depthWrite: false }));
  l.frustumCulled = false; scene.add(l); return l;
})();
const FF_N = 90;
const fireflies = (() => {
  const pos = new Float32Array(FF_N * 3), col = new Float32Array(FF_N * 3), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  p.frustumCulled = false; p.userData.seed = Array.from({ length: FF_N }, () => [Math.random() * 6, Math.random() * 6, Math.random()]); p.userData.home = Array.from({ length: FF_N }, () => V(0, -99, 0));
  scene.add(p); return p;
})();
// Mezar's rings hang in the sky
const skyRing = new THREE.Mesh(new THREE.RingGeometry(70, 104, 64, 1), new THREE.MeshBasicMaterial({ color: '#f2d6a8', transparent: true, opacity: 0.5, side: THREE.DoubleSide, fog: false, depthWrite: false }));
skyRing.visible = false; scene.add(skyRing);
const skyRing2 = new THREE.Mesh(new THREE.RingGeometry(108, 116, 64, 1), skyRing.material.clone()); skyRing2.material.opacity = 0.3; skyRing.add(skyRing2);
const SPACE_TOP = new THREE.Color('#02030a'), SPACE_MID = new THREE.Color('#060a1e'), SPACE_HOR = new THREE.Color('#0c1230');
const lantern = new THREE.PointLight(0xffd6a0, 0, 16, 1.4); camera.add(lantern); lantern.position.set(0.25, -0.1, -0.6);
const sunDir = V(0, 1, 0);
function updateEnv(dt, t) {
  const SK = LEVEL ? LEVEL.sky : 'earth', cp0 = camera.position;
  skyRing.visible = SK === 'mezar';
  if (SK === 'space') {
    skyMat.uniforms.top.value.copy(SPACE_TOP); skyMat.uniforms.mid.value.copy(SPACE_MID); skyMat.uniforms.hor.value.copy(SPACE_HOR);
    HORIZON.copy(SPACE_HOR); scene.fog.color.copy(SPACE_HOR).convertSRGBToLinear(); scene.fog.near = LEVEL.fly ? 2800 : 40; scene.fog.far = LEVEL.fly ? 7000 : 260;
    sky.position.copy(cp0); stars.position.copy(cp0); stars.material.opacity = LEVEL.fly ? 0.4 : 0.6; stars.material.size = 2;
    sunDisc.visible = moonDisc.visible = false; rain.visible = false; fireflies.visible = false; clouds.visible = false;
    sun.intensity = 0.35; sun.color.set('#cfe0ff'); sun.position.copy(player.pos).add(V(-10, 20, -12)); sun.target.position.copy(player.pos);
    hemi.intensity = 0.75; hemi.color.set('#cfd8ff'); fill.intensity = 0.25; lantern.intensity = 0; ENV.flash = 0; ENV.rain = 0; ENV.storm = 0; ENV.sand = 0; ENV.wxName = 'space';
    SFX.rain(0); return;
  }
  clouds.visible = true;
  const cyc = ENV.forceHour != null ? ENV.forceHour / 24 : ((Date.now() / 1000 + DAY_LEN * 0.74) % DAY_LEN) / DAY_LEN;
  ENV.hour = (cyc * 24 + ((LEVEL && LEVEL.hourOffset) || 0)) % 24;
  let light = sampleSky(ENV.hour);
  // weather eases toward the current target
  ENV.wxName = weatherNow(); if (LEVEL && LEVEL.weather === 'sand' && (ENV.wxName === 'rain' || ENV.wxName === 'storm')) ENV.wxName = 'sandstorm';
  if (LEVEL && LEVEL.weather === 'none') ENV.wxName = 'clear';
  if (LEVEL && LEVEL.weather === 'storm') ENV.wxName = ENV.wxName === 'clear' ? 'cloudy' : 'storm';
  if (LEVEL && LEVEL.weather === 'snow' && (ENV.wxName === 'rain' || ENV.wxName === 'storm' || ENV.wxName === 'cloudy')) ENV.wxName = 'snowfall';
  const snowy = ENV.wxName === 'snowfall' || (LEVEL && LEVEL.weather === 'snow' && ENV.sand > 0.02 && ENV.wxName !== 'sandstorm');
  const tg = WX[ENV.wxName];
  const k = ENV.init ? Math.min(1, dt * 0.06) : 1; ENV.init = true;
  ENV.cloud += (tg[0] - ENV.cloud) * k; ENV.rain += (tg[1] - ENV.rain) * k; ENV.storm += (tg[2] - ENV.storm) * k; ENV.sand += ((ENV.wxName === 'sandstorm' || ENV.wxName === 'snowfall' ? 1 : 0) - ENV.sand) * k;
  const cl = ENV.cloud;
  ENV.night = clamp((0.62 - light) / 0.38, 0, 1);
  const stormMix = cl * 0.82;
  skyTop.lerp(ENV.night > 0.5 ? NIGHT_STORM : STORM_TOP, stormMix); skyMid.lerp(ENV.night > 0.5 ? NIGHT_STORM : STORM_MID, stormMix); skyHor.lerp(ENV.night > 0.5 ? NIGHT_STORM : STORM_HOR, stormMix * 0.9);
  if (SK === 'capitone') { const dk = 1 - ENV.night; skyHor.lerp(CP_HOR, 0.35 * dk); skyMid.lerp(CP_MID, 0.25 * dk); skyHor.lerp(SNOW_COL, ENV.sand * 0.4); }
  if (SK === 'robot') { const dk = 1 - ENV.night; skyHor.lerp(RB_HOR, 0.4 * dk + 0.2); skyMid.lerp(RB_MID, 0.3); skyTop.lerp(RB_TOP, 0.3); }
  if (SK === 'mezar') { const dk = 1 - ENV.night; skyHor.lerp(MZ_HOR, 0.4 * dk); skyMid.lerp(MZ_MID, 0.35 * dk); skyTop.lerp(MZ_NIGHT, 0.5 * ENV.night); skyHor.lerp(SAND_COL, ENV.sand * 0.7); skyMid.lerp(SAND_COL, ENV.sand * 0.5); }
  if (LEVEL && LEVEL.tint) { const T = LEVEL.tint; T.c = T.c || [new THREE.Color(T.hor), new THREE.Color(T.mid), new THREE.Color(T.top)]; skyHor.lerp(T.c[0], T.k); skyMid.lerp(T.c[1], T.k); skyTop.lerp(T.c[2], T.k); }
  // lightning
  if (ENV.storm > 0.6) { ENV.nextStrike -= dt; if (ENV.nextStrike <= 0) { ENV.flash = 1; ENV.nextStrike = rand(5, 14); SFX.thunder(rand(0.2, 1.4)); if (Math.random() < 0.5) setTimeout(() => { ENV.flash = 0.8; }, 140); } }
  ENV.flash = Math.max(0, ENV.flash - dt * 3.2);
  if (ENV.flash > 0) { skyTop.lerp(FLASH, ENV.flash * 0.6); skyMid.lerp(FLASH, ENV.flash * 0.7); skyHor.lerp(FLASH, ENV.flash * 0.7); }
  skyMat.uniforms.top.value.copy(skyTop); skyMat.uniforms.mid.value.copy(skyMid); skyMat.uniforms.hor.value.copy(skyHor);
  HORIZON.copy(skyHor); scene.fog.color.copy(skyHor).convertSRGBToLinear();
  const fogFar = 74 - ENV.night * 20 - cl * 18 - ENV.rain * 8 - ENV.sand * (snowy ? 14 : 26), fogNear = Math.max(6, 20 - ENV.night * 6 - cl * 6 - ENV.rain * 4);
  scene.fog.near = fogNear; scene.fog.far = Math.max(fogNear + 18, fogFar);
  // sun and moon arcs
  const a = (ENV.hour - 6) / 12 * Math.PI; sunDir.set(Math.cos(a), Math.sin(a), -0.38).normalize();
  const cp = camera.position;
  sky.position.copy(cp); stars.position.copy(cp);
  if (skyRing.visible) { skyRing.position.copy(cp).add(V(-60, 70, -110)); skyRing.rotation.set(-1.15, 0.35, 0.5); skyRing.material.opacity = (0.55 - ENV.sand * 0.35) * (1 - cl * 0.4); skyRing2.material.opacity = skyRing.material.opacity * 0.55; }
  sunDisc.position.copy(cp).addScaledVector(sunDir, 160); sunDisc.lookAt(cp); sunDisc.visible = sunDir.y > -0.12;
  sunDisc.material.color.set(sunDir.y < 0.25 ? '#ffb45a' : '#fff1c8'); sunDisc.material.opacity = 1 - cl * 0.8; sunDisc.material.transparent = true;
  moonDisc.position.copy(cp).addScaledVector(sunDir, -160); moonDisc.lookAt(cp); moonDisc.visible = sunDir.y < 0.12;
  moonDisc.material.opacity = moonSpots.material.opacity = 1 - cl * 0.85;
  stars.material.size = 4; stars.material.opacity = ENV.night * (1 - cl * 0.95);
  const dayK = Math.max(0, sunDir.y);
  sun.position.copy(player.pos).addScaledVector(sunDir.y > 0 ? sunDir : sunDir.clone().negate(), 30);
  sun.target.position.copy(player.pos);
  sun.color.set(sunDir.y > 0 ? (sunDir.y < 0.3 ? '#ffb070' : '#fff0d8') : '#8fa0ff');
  sun.intensity = (sunDir.y > 0 ? 0.25 + 0.95 * Math.min(1, dayK * 2.5) : 0.22) * (1 - cl * 0.65);
  hemi.intensity = (0.25 + 0.62 * light) * (1 - cl * 0.35) + ENV.flash * 2.4;
  hemi.color.set(ENV.night > 0.5 ? '#6a78c8' : '#d6d8ff');
  fill.intensity = 0.3 * light;
  lantern.intensity = clamp(ENV.night * 1.1 + ENV.storm * 0.35, 0, 1.3);
  // clouds: colored by the sky, thicker in bad weather
  const cloudCol = new THREE.Color('#ffffff').lerp(skyHor, 0.55).lerp(STORM_MID, cl * 0.6);
  clouds.children.forEach((s, i) => { s.material.color.copy(cloudCol); s.material.opacity = Math.min(0.95, 0.35 + cl * 0.6) * (i % 3 === 0 || cl > 0.4 ? 1 : 0.5); });
  // rain falls around the camera
  const sandy = ENV.sand > 0.02, pk = sandy ? ENV.sand : ENV.rain;
  rain.visible = pk > 0.02; rain.material.opacity = pk * (sandy ? 0.7 : 0.55); rain.material.color.copy(sandy ? (snowy ? SNOW_COL : SAND_COL) : (LEVEL && LEVEL.weather === 'acid' ? ACID_COL : RAIN_COL)); rain.position.copy(cp);
  if (rain.visible) {
    const arr = rain.geometry.attributes.position.array, fall = (sandy ? (snowy ? 2.2 : 2.5) : 24) * dt, wind = sandy ? (snowy ? 0.8 * dt : 16 * dt) : 2.5 * dt * ENV.storm;
    for (let i = 0; i < RAIN_N; i++) { const o = i * 6; arr[o + 1] -= fall; arr[o + 4] -= fall; arr[o] += wind; arr[o + 3] += wind;
      if (arr[o + 1] < -7 || arr[o] > 18) { const x = (Math.random() - 0.5) * 36, z = (Math.random() - 0.5) * 36, y = 14 + Math.random() * 3; arr[o] = x; arr[o + 1] = y; arr[o + 2] = z; if (sandy && snowy) { arr[o + 1] = 6 + Math.random() * 6; arr[o + 3] = x + 0.07; arr[o + 4] = arr[o + 1] - 0.07; arr[o + 5] = z; continue; }
        if (sandy) { arr[o] = x - 18 * Math.random(); arr[o + 1] = Math.random() * 8 - 4; arr[o + 3] = arr[o] + 0.6; arr[o + 4] = arr[o + 1] - 0.05; arr[o + 5] = z; continue; } arr[o + 3] = x + 0.05 + ENV.storm * 0.25; arr[o + 4] = y - 0.7; arr[o + 5] = z + 0.08; } }
    rain.geometry.setDrawRange(0, Math.floor(RAIN_N * pk) * 2); rain.geometry.attributes.position.needsUpdate = true;
  }
  SFX.rain(ENV.rain * (state === 'menu' ? 0.4 : 1));
  // fireflies at night near the player, gone in the rain
  const ffOn = ENV.night * (1 - ENV.rain);
  fireflies.material.opacity = ffOn; fireflies.visible = ffOn > 0.02;
  if (fireflies.visible) {
    const pa = fireflies.geometry.attributes.position.array, ca = fireflies.geometry.attributes.color.array, sd = fireflies.userData.seed, hm = fireflies.userData.home;
    for (let i = 0; i < FF_N; i++) {
      const h = hm[i];
      if (h.y < -50 || h.distanceToSquared(player.pos) > 26 * 26) { const aa = Math.random() * 6.28, rr = 4 + Math.random() * 20; h.set(player.pos.x + Math.cos(aa) * rr, 0, player.pos.z + Math.sin(aa) * rr); h.y = Math.max(groundH(h.x, h.z), WATER_Y) + 0.4 + Math.random() * 1.6; }
      const s = sd[i], tt = t * (0.3 + s[2] * 0.4);
      pa[i * 3] = h.x + Math.sin(tt + s[0]) * 1.4; pa[i * 3 + 1] = h.y + Math.sin(tt * 1.7 + s[1]) * 0.4; pa[i * 3 + 2] = h.z + Math.cos(tt * 0.9 + s[1]) * 1.4;
      const b = Math.max(0, Math.sin(t * (1.5 + s[2] * 2) + s[0] * 3)) ; ca[i * 3] = 0.8 * b; ca[i * 3 + 1] = 1.0 * b; ca[i * 3 + 2] = 0.35 * b;
    }
    fireflies.geometry.attributes.position.needsUpdate = true; fireflies.geometry.attributes.color.needsUpdate = true;
  }
}
function clockText() {
  const h = Math.floor(ENV.hour), m = Math.floor((ENV.hour - h) * 60 / 10) * 10;
  if (ENV.wxName === 'space') return '✦ Deep space';
  const icon = ENV.wxName === 'snowfall' ? '❄' : ENV.wxName === 'sandstorm' ? '≋' : ENV.wxName === 'storm' ? '⚡' : ENV.wxName === 'rain' ? '☂' : ENV.night > 0.5 ? '☾' : ENV.wxName === 'cloudy' ? '☁' : '☀';
  return `${icon} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} · ${ENV.wxName[0].toUpperCase() + ENV.wxName.slice(1)}`;
}

