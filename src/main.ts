import * as THREE from 'three';


// ---- SOUND SYSTEM (Web Audio API - Procedural) ----
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

function playLaserSound(weaponIndex: number) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  if (weaponIndex === 0) {
    // Laser - high pitch zap
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now); osc.stop(now + 0.15);
  } else if (weaponIndex === 1) {
    // Plasma - deep thud
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now); osc.stop(now + 0.4);
  } else {
    // Railgun - powerful crack
    osc.type = 'square';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(5, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now); osc.stop(now + 0.5);
  }
}

function playExplosionSound() {
  const bufferSize = audioCtx.sampleRate * 0.8;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.6);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noise.start();
}

function playHitSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  osc.start(); osc.stop(audioCtx.currentTime + 0.08);
}

function playDamageSound() {
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, audioCtx.currentTime);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noise.start();
}

function playWeaponSwitchSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.03);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  osc.start(); osc.stop(audioCtx.currentTime + 0.08);
}

function playDeathSound() {
  // Deep rumble + high whine
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  const gain2 = audioCtx.createGain();
  osc1.connect(gain1); gain1.connect(audioCtx.destination);
  osc2.connect(gain2); gain2.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(100, now);
  osc1.frequency.exponentialRampToValueAtTime(30, now + 1.5);
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(2000, now);
  osc2.frequency.exponentialRampToValueAtTime(100, now + 1.0);
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  osc1.start(now); osc1.stop(now + 1.5);
  osc2.start(now); osc2.stop(now + 1.0);
}

function playEnemyLaserSound(dist: number) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();
  osc.connect(gain);
  gain.connect(panner);
  panner.connect(audioCtx.destination);
  panner.pan.setValueAtTime(Math.random() * 2 - 1, audioCtx.currentTime);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
  const vol = Math.max(0.01, 0.2 - (dist / 2000));
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}

function playLevelUpSound() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.3);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
  });
}

function playPortalSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.start(now); osc.stop(now + 0.5);
}

// Resume AudioContext on first user interaction
document.addEventListener('click', () => { if (audioCtx.state === 'suspended') audioCtx.resume(); }, { once: true });

// ---- Game State ----
let isPlaying = false;
let isDead = false;
const otherPlayers: Record<string, THREE.Group> = {};
const npcs: Record<string, THREE.Group> = {};

// RPG Systems
let level = 1;
let xp = 0;
let xpNeeded = 100;
let maxHealth = 100;
let health = 100;
let dmgMult = 1.0;
let fireRateMult = 1.0;
let killCount = 0;
let cameraShakeIntensity = 0;

// Flight Physics
let throttle = 0;
const MAX_SPEED = 100;
let pitch = 0;
let yaw = 0;
let roll = 0;

// Weapons
const WEAPONS = [
  { id: 1, name: 'LASER', cooldown: 0.15, damage: 10, color: 0x00ffcc, speed: 1000 },
  { id: 2, name: 'PLASMA', cooldown: 0.6, damage: 35, color: 0x0055ff, speed: 400 },
  { id: 3, name: 'RAILGUN', cooldown: 2.0, damage: 80, color: 0xff5500, speed: 3000 }
];
let currentWeapon = 0;
let lastShotTime = 0;
let isShooting = false;
let isZooming = false;

// UI
const UI = {
  startMenu: document.getElementById('start-menu')!,
  gameOverMenu: document.getElementById('game-over-menu')!,
  upgradeMenu: document.getElementById('upgrade-menu')!,
  hud: document.getElementById('hud')!,
  startBtn: document.getElementById('start-btn')!,
  respawnBtn: document.getElementById('respawn-btn')!,
  healthFill: document.getElementById('health-bar-fill')!,
  healthLabel: document.getElementById('health-label')!,
  xpFill: document.getElementById('xp-bar-fill')!,
  levelLabel: document.getElementById('level-label')!,
  speedDisplay: document.getElementById('speed-display')!,
  hitMarker: document.getElementById('hit-marker')!,
  crosshair: document.getElementById('crosshair')!,
  wepSlots: [
    document.getElementById('wep-1')!,
    document.getElementById('wep-2')!,
    document.getElementById('wep-3')!
  ],
  upgDmg: document.getElementById('upg-damage')!,
  upgHealth: document.getElementById('upg-health')!,
  upgFireRate: document.getElementById('upg-firerate')!,
  finalStats: document.getElementById('final-stats')!,
  killFeed: document.getElementById('kill-feed')!,
  killCounter: document.getElementById('kill-counter')!
};

// ---- ThreeJS Setup ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('app')!.appendChild(renderer.domElement);

// ---- BACKGROUND MUSIC ----
// Removed because the source audio had an unwanted AI voiceover.
// The procedural engine hum provides a better space atmosphere anyway.
function startMusic() {
  // bgMusic play removed
}

// ---- ENGINE SOUND ----
let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;
function startEngineSound() {
  if (engineOsc) return;
  engineOsc = audioCtx.createOscillator();
  engineGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, audioCtx.currentTime);
  engineOsc.type = 'sawtooth';
  engineOsc.frequency.setValueAtTime(40, audioCtx.currentTime);
  engineGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
  engineOsc.connect(filter);
  filter.connect(engineGain);
  engineGain.connect(audioCtx.destination);
  engineOsc.start();
}
function updateEngineSound(throttlePercent: number) {
  if (!engineOsc || !engineGain) return;
  engineOsc.frequency.setTargetAtTime(40 + throttlePercent * 80, audioCtx.currentTime, 0.1);
  engineGain.gain.setTargetAtTime(0.02 + throttlePercent * 0.06, audioCtx.currentTime, 0.1);
}

// ---- SPEED LINES ----
const speedLinesCount = 150;
const speedLinesGeo = new THREE.BufferGeometry();
const slPositions = new Float32Array(speedLinesCount * 3);
for (let i = 0; i < speedLinesCount; i++) {
  slPositions[i * 3] = (Math.random() - 0.5) * 40;
  slPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
  slPositions[i * 3 + 2] = -Math.random() * 80;
}
speedLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(slPositions, 3));
const speedLinesMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.3, transparent: true, opacity: 0 });
const speedLines = new THREE.Points(speedLinesGeo, speedLinesMat);
camera.add(speedLines);

// ---- KILL FEED ----
function addKillFeedEntry(killerName: string, victimName: string, isPlayerKill: boolean) {
  const entry = document.createElement('div');
  entry.className = 'kill-entry' + (isPlayerKill ? ' player-kill' : '');
  entry.innerHTML = `<span class="killer">${killerName}</span> \u25ba <span class="victim">${victimName}</span>`;
  UI.killFeed.appendChild(entry);
  setTimeout(() => entry.remove(), 4000);
  while (UI.killFeed.children.length > 6) UI.killFeed.removeChild(UI.killFeed.firstChild!);
}
function updateKillCounter() {
  UI.killCounter.innerText = `KILLS: ${killCount}`;
}

// Lighting - brighter for visibility
const ambientLight = new THREE.AmbientLight(0x334466, 2.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffeedd, 3.0);
dirLight.position.set(100, 200, 50);
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x4466aa, 1.0);
fillLight.position.set(-50, -100, 30);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0x8844cc, 0.8);
rimLight.position.set(0, 50, -100);
scene.add(rimLight);

// ---- GALACTIC SPACE ENVIRONMENT ----

// Layer 1: Dense white stars
const starGeo1 = new THREE.BufferGeometry();
const starPos1: number[] = [];
for (let i = 0; i < 4000; i++) {
  const r = 700 + Math.random() * 500;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  starPos1.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
}
starGeo1.setAttribute('position', new THREE.Float32BufferAttribute(starPos1, 3));
scene.add(new THREE.Points(starGeo1, new THREE.PointsMaterial({ size: 1.5, color: 0xffffff })));

// Layer 2: Blue-white bright stars
const starGeo2 = new THREE.BufferGeometry();
const starPos2: number[] = [];
for (let i = 0; i < 800; i++) {
  const r = 600 + Math.random() * 600;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  starPos2.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
}
starGeo2.setAttribute('position', new THREE.Float32BufferAttribute(starPos2, 3));
scene.add(new THREE.Points(starGeo2, new THREE.PointsMaterial({ size: 2.5, color: 0xaaccff })));

// Layer 3: Warm accent stars
const starGeo3 = new THREE.BufferGeometry();
const starPos3: number[] = [];
for (let i = 0; i < 400; i++) {
  const r = 650 + Math.random() * 550;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  starPos3.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
}
starGeo3.setAttribute('position', new THREE.Float32BufferAttribute(starPos3, 3));
scene.add(new THREE.Points(starGeo3, new THREE.PointsMaterial({ size: 3.0, color: 0xffccaa })));

// Nebula Clouds
function createNebula(x: number, y: number, z: number, color: number, size: number, opacity: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  gradient.addColorStop(0, `rgba(${r},${g},${b},${opacity})`);
  gradient.addColorStop(0.4, `rgba(${r},${g},${b},${opacity * 0.5})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, y, z);
  sprite.scale.set(size, size, 1);
  scene.add(sprite);
  return sprite;
}

// Scatter nebulae
const nebulaColors = [0x6622aa, 0x2244cc, 0xcc2266, 0x2288aa, 0x8833cc, 0x4466ff];
for (let i = 0; i < 12; i++) {
  const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
  createNebula(
    (Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 1600,
    color, 200 + Math.random() * 400, 0.15 + Math.random() * 0.15
  );
}

// Galaxy Disc
const galaxyGeo = new THREE.BufferGeometry();
const galaxyPos: number[] = [];
const galaxyColors: number[] = [];
for (let i = 0; i < 2000; i++) {
  const angle = Math.random() * Math.PI * 2;
  const armOffset = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3);
  const dist = 300 + Math.random() * 400;
  const spiralAngle = angle + armOffset + dist * 0.005;
  const x = Math.cos(spiralAngle) * dist;
  const z = Math.sin(spiralAngle) * dist;
  const y = (Math.random() - 0.5) * 20;
  galaxyPos.push(x, y + 400, z - 500);
  const t = Math.random();
  galaxyColors.push(0.6 + t * 0.4, 0.4 + t * 0.3, 0.8 + t * 0.2);
}
galaxyGeo.setAttribute('position', new THREE.Float32BufferAttribute(galaxyPos, 3));
galaxyGeo.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));
const galaxyMat = new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
scene.add(new THREE.Points(galaxyGeo, galaxyMat));

// Distant Planets
function createPlanet(px: number, py: number, pz: number, radius: number, color: number, hasRing: boolean, glowColor: number) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.2 });
  const planet = new THREE.Mesh(geo, mat);
  planet.position.set(px, py, pz);
  scene.add(planet);
  const atmGeo = new THREE.SphereGeometry(radius * 1.08, 16, 16);
  const atmMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.15, side: THREE.BackSide });
  const atm = new THREE.Mesh(atmGeo, atmMat);
  atm.position.copy(planet.position);
  scene.add(atm);
  if (hasRing) {
    const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xccaa88, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(planet.position);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);
  }
}

createPlanet(-400, 200, -600, 60, 0x886644, true, 0xffaa66);
createPlanet(500, -150, -800, 40, 0x334488, false, 0x4488ff);
createPlanet(-200, -300, -500, 25, 0x884422, false, 0xff6633);
createPlanet(300, 350, -700, 80, 0x664488, true, 0xaa66ff);

// Space Dust
const dustGeo = new THREE.BufferGeometry();
const dustPos: number[] = [];
for (let i = 0; i < 400; i++) {
  dustPos.push((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
}
dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ size: 0.5, color: 0x888899, transparent: true, opacity: 0.4 });
const spaceDust = new THREE.Points(dustGeo, dustMat);
scene.add(spaceDust);

// Asteroids (fewer, organic shapes)
const asteroids: THREE.Mesh[] = [];
const rockColors = [0x776655, 0x665544, 0x887766, 0x554433];
for(let i=0; i<15; i++) {
  const size = 3 + Math.random() * 12;
  const geo = new THREE.IcosahedronGeometry(size, 1);
  const positions = geo.attributes.position;
  for (let v = 0; v < positions.count; v++) {
    positions.setXYZ(v,
      positions.getX(v) * (0.8 + Math.random() * 0.4),
      positions.getY(v) * (0.8 + Math.random() * 0.4),
      positions.getZ(v) * (0.8 + Math.random() * 0.4)
    );
  }
  const rMat = new THREE.MeshStandardMaterial({ color: rockColors[Math.floor(Math.random() * rockColors.length)], roughness: 0.95, flatShading: true });
  const rock = new THREE.Mesh(geo, rMat);
  rock.position.set((Math.random()-0.5)*600, (Math.random()-0.5)*600, (Math.random()-0.5)*600);
  rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  rock.userData = { rx: (Math.random()-0.5)*0.3, ry: (Math.random()-0.5)*0.3 };
  scene.add(rock);
  asteroids.push(rock);
}

// Portals (Vibe Jam 2026 required element)
const portals: THREE.Mesh[] = [];
for(let i=0; i<20; i++) {
  const geo = new THREE.TorusGeometry(15, 1.5, 16, 100);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.8 });
  const portal = new THREE.Mesh(geo, mat);
  portal.position.set((Math.random()-0.5)*800, (Math.random()-0.5)*400, (Math.random()-0.5)*800);
  portal.lookAt(0, 0, 0);
  scene.add(portal);
  portals.push(portal);
}

// ---- 3D Cockpit ----
const cockpitGroup = new THREE.Group();
camera.add(cockpitGroup);

// Cockpit interior light - illuminates the whole cockpit
const cockpitLight = new THREE.PointLight(0x00ffcc, 0.8, 15);
cockpitLight.position.set(0, -0.5, -1.5);
cockpitGroup.add(cockpitLight);

// Secondary warm fill light
const cockpitFill = new THREE.PointLight(0x334466, 0.5, 12);
cockpitFill.position.set(0, -1.5, -0.5);
cockpitGroup.add(cockpitFill);

const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x1a2535, metalness: 0.7, roughness: 0.4, emissive: 0x050a12, emissiveIntensity: 0.3 });
const cockpitMatDark = new THREE.MeshStandardMaterial({ color: 0x152030, metalness: 0.8, roughness: 0.3, emissive: 0x040810, emissiveIntensity: 0.2 });
const edgeGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });

// Main Dashboard
const dashGeo = new THREE.BoxGeometry(8, 1.2, 4);
const dash = new THREE.Mesh(dashGeo, cockpitMat);
dash.position.set(0, -2.0, -2.5);
dash.rotation.x = -Math.PI / 7;
cockpitGroup.add(dash);

// Dashboard glow trim line
const dashTrimGeo = new THREE.BoxGeometry(7.5, 0.08, 0.08);
const dashTrim = new THREE.Mesh(dashTrimGeo, edgeGlowMat);
dashTrim.position.set(0, -1.45, -1.2);
cockpitGroup.add(dashTrim);

// Dashboard second glow line
const dashTrim2 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 0.05), edgeGlowMat);
dashTrim2.position.set(0, -1.6, -1.6);
cockpitGroup.add(dashTrim2);

// Left Console
const consoleGeo = new THREE.BoxGeometry(1.5, 2.5, 4);
const consoleL = new THREE.Mesh(consoleGeo, cockpitMatDark);
consoleL.position.set(-4.2, -1.5, -1.5);
consoleL.rotation.y = Math.PI / 10;
cockpitGroup.add(consoleL);

// Right Console
const consoleR = new THREE.Mesh(consoleGeo, cockpitMatDark);
consoleR.position.set(4.2, -1.5, -1.5);
consoleR.rotation.y = -Math.PI / 10;
cockpitGroup.add(consoleR);

// Console edge glow strips
const stripGeo = new THREE.BoxGeometry(0.04, 2.0, 0.04);
[[-3.5, -0.8, -1.8], [3.5, -0.8, -1.8]].forEach(p => {
  const strip = new THREE.Mesh(stripGeo, edgeGlowMat);
  strip.position.set(p[0], p[1], p[2]);
  cockpitGroup.add(strip);
});

// Window Frame Pillars - THIN with glow edge
const pillarGeo = new THREE.BoxGeometry(0.08, 4.5, 0.08);
const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.8, roughness: 0.3, emissive: 0x0a1520, emissiveIntensity: 0.4 });

const pillarL = new THREE.Mesh(pillarGeo, pillarMat);
pillarL.position.set(-3.2, 0.5, -2.5);
pillarL.rotation.z = Math.PI / 10;
pillarL.rotation.x = Math.PI / 5;
cockpitGroup.add(pillarL);

const pillarR = new THREE.Mesh(pillarGeo, pillarMat);
pillarR.position.set(3.2, 0.5, -2.5);
pillarR.rotation.z = -Math.PI / 10;
pillarR.rotation.x = Math.PI / 5;
cockpitGroup.add(pillarR);

// Pillar glow strips (cyan edge lighting)
const pillarGlowGeo = new THREE.BoxGeometry(0.03, 4.5, 0.03);
const pillarGlowL = new THREE.Mesh(pillarGlowGeo, edgeGlowMat);
pillarGlowL.position.set(-3.15, 0.5, -2.5);
pillarGlowL.rotation.z = Math.PI / 10;
pillarGlowL.rotation.x = Math.PI / 5;
cockpitGroup.add(pillarGlowL);

const pillarGlowR = new THREE.Mesh(pillarGlowGeo, edgeGlowMat);
pillarGlowR.position.set(3.15, 0.5, -2.5);
pillarGlowR.rotation.z = -Math.PI / 10;
pillarGlowR.rotation.x = Math.PI / 5;
cockpitGroup.add(pillarGlowR);

// Top Frame Bar - thin
const topBarGeo = new THREE.BoxGeometry(7, 0.06, 0.06);
const topBar = new THREE.Mesh(topBarGeo, pillarMat);
topBar.position.set(0, 2.8, -3.5);
cockpitGroup.add(topBar);

// Top bar glow
const topGlow = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.04, 0.04), edgeGlowMat);
topGlow.position.set(0, 2.75, -3.5);
cockpitGroup.add(topGlow);

// Left screen glow (instrument panel) - BRIGHTER
const screenGeo = new THREE.PlaneGeometry(1.2, 0.7);
const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
const screenL = new THREE.Mesh(screenGeo, screenGlowMat);
screenL.position.set(-3.5, -0.8, -1.8);
screenL.rotation.y = Math.PI / 5;
screenL.rotation.x = -Math.PI / 8;
cockpitGroup.add(screenL);

// Right screen glow - BRIGHTER
const screenR = new THREE.Mesh(screenGeo, screenGlowMat);
screenR.position.set(3.5, -0.8, -1.8);
screenR.rotation.y = -Math.PI / 5;
screenR.rotation.x = -Math.PI / 8;
cockpitGroup.add(screenR);

// Center HUD screen on dashboard - BRIGHTER
const centerScreenGeo = new THREE.PlaneGeometry(2.0, 1.0);
const centerScreenMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
const centerScreen = new THREE.Mesh(centerScreenGeo, centerScreenMat);
centerScreen.position.set(0, -1.3, -2.0);
centerScreen.rotation.x = -Math.PI / 6;
cockpitGroup.add(centerScreen);

// Floor panel
const floorGeo = new THREE.BoxGeometry(9, 0.1, 6);
const floor = new THREE.Mesh(floorGeo, cockpitMatDark);
floor.position.set(0, -3.0, 0);
cockpitGroup.add(floor);

// Cockpit lights - bigger and brighter emissive dots
const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
const dotGreen = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
const dotAmber = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const dotCyan = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
const dotRed = new THREE.MeshBasicMaterial({ color: 0xff4444 });

const lightPositions = [
  { pos: [-3.0, -0.5, -1.5], mat: dotGreen },
  { pos: [-2.8, -0.5, -1.6], mat: dotAmber },
  { pos: [-2.5, -0.5, -1.7], mat: dotCyan },
  { pos: [3.0, -0.5, -1.5], mat: dotGreen },
  { pos: [2.8, -0.5, -1.6], mat: dotCyan },
  { pos: [2.5, -0.5, -1.7], mat: dotAmber },
  { pos: [-1.5, -1.4, -1.0], mat: dotCyan },
  { pos: [1.5, -1.4, -1.0], mat: dotCyan },
  { pos: [0, -1.4, -1.0], mat: dotRed },
  { pos: [-0.5, -1.4, -1.0], mat: dotGreen },
  { pos: [0.5, -1.4, -1.0], mat: dotAmber },
];
lightPositions.forEach(lp => {
  const dot = new THREE.Mesh(dotGeo, lp.mat);
  dot.position.set(lp.pos[0], lp.pos[1], lp.pos[2]);
  cockpitGroup.add(dot);
});

// ---- Models ----
function createShipModel(isNPC: boolean, colors?: { fuselage: number, canopy: number, wing: number }) {
  const group = new THREE.Group();
  
  if (!colors && isNPC) colors = { fuselage: 0xcc2222, canopy: 0xff4444, wing: 0x881111 };
  
  // Fuselage - sleek tapered body
  const fuselageGeo = new THREE.CylinderGeometry(0.3, 1.5, 8, 6);
  fuselageGeo.rotateX(Math.PI / 2);
  const fuselageMat = new THREE.MeshStandardMaterial({ 
    color: isNPC ? colors!.fuselage : 0x8899aa, metalness: 0.7, roughness: 0.3 
  });
  group.add(new THREE.Mesh(fuselageGeo, fuselageMat));
  
  // Cockpit canopy
  const canopyGeo = new THREE.SphereGeometry(0.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const canopyMat = new THREE.MeshStandardMaterial({ 
    color: isNPC ? colors!.canopy : 0x44aaff, transparent: true, opacity: 0.6, metalness: 0.9, roughness: 0.1 
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.5, -1.5);
  canopy.rotation.x = -Math.PI / 2;
  group.add(canopy);
  
  // Wings - swept back
  const wingGeo = new THREE.BoxGeometry(12, 0.15, 3);
  wingGeo.translate(0, 0, 1);
  const wingMat = new THREE.MeshStandardMaterial({ 
    color: isNPC ? colors!.wing : 0x556677, metalness: 0.6, roughness: 0.4 
  });
  group.add(new THREE.Mesh(wingGeo, wingMat));
  
  // Tail fin
  const finGeo = new THREE.BoxGeometry(0.1, 2, 1.5);
  const finMat = new THREE.MeshStandardMaterial({ color: isNPC ? 0x991111 : 0x445566, metalness: 0.5 });
  const fin = new THREE.Mesh(finGeo, finMat);
  fin.position.set(0, 1.2, 3.5);
  fin.rotation.x = Math.PI / 12;
  group.add(fin);
  
  // Engine glow
  const engineGlowGeo = new THREE.SphereGeometry(0.8, 8, 8);
  const engineGlowMat = new THREE.MeshBasicMaterial({ 
    color: isNPC ? 0xff4400 : 0x00ccff, transparent: true, opacity: 0.6 
  });
  const engineGlow = new THREE.Mesh(engineGlowGeo, engineGlowMat);
  engineGlow.position.set(0, 0, 4.2);
  engineGlow.scale.set(0.6, 0.6, 1.2);
  group.add(engineGlow);
  
  // Wing tip nav lights
  const tipGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const tipR = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
  tipR.position.set(5.5, 0, 1);
  group.add(tipR);
  const tipL = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
  tipL.position.set(-5.5, 0, 1);
  group.add(tipL);
  
  return group;
}

// ---- Local NPC Logic ----
let npcSpawnTimer = 0;
const AI_STATES = { PATROL: 0, ENGAGE: 1, STRAFE: 2, EVADE: 3, DIVE: 4 };

function spawnLocalNPC() {
  const id = 'npc_' + Math.floor(Math.random() * 1000000);
  
  // Random faction (red, blue, green)
  const factions = ['red', 'blue', 'green'];
  const faction = factions[Math.floor(Math.random() * factions.length)];
  let fColor = 0, cColor = 0, wColor = 0, laserColor = 0;
  if (faction === 'red') { fColor = 0xcc2222; cColor = 0xff4444; wColor = 0x881111; laserColor = 0xff2244; }
  else if (faction === 'blue') { fColor = 0x2244cc; cColor = 0x4488ff; wColor = 0x112288; laserColor = 0x4488ff; }
  else { fColor = 0x22cc22; cColor = 0x44ff44; wColor = 0x118811; laserColor = 0x44ff44; }
  
  // Random scattered spawn
  const nx = camera.position.x + (Math.random() - 0.5) * 1600;
  const ny = camera.position.y + (Math.random() - 0.5) * 600;
  const nz = camera.position.z + (Math.random() - 0.5) * 1600;
  
  const npc = {
    x: nx, y: ny, z: nz,
    qx: 0, qy: 0, qz: 0, qw: 1,
    health: 100, isDead: false, speed: 0.8 + Math.random() * 1.2,
    colors: { fuselage: fColor, canopy: cColor, wing: wColor }
  };
  addEntity(npcs, id, npc, true);
  
  const ud = npcs[id].userData;
  ud.health = npc.health; ud.speed = npc.speed;
  ud.vx = 0; ud.vy = 0; ud.vz = 0;
  ud.aiState = AI_STATES.PATROL;
  ud.stateTimer = performance.now() + 2000;
  ud.evadeDir = new THREE.Vector3(); ud.lastShoot = 0;
  ud.faction = faction; ud.laserColor = laserColor;
  ud.targetId = null; ud.retargetTime = 0;
  ud.patrolAngle = Math.random() * Math.PI * 2;
  ud.patrolCenterX = (Math.random() - 0.5) * 1000;
  ud.patrolCenterZ = (Math.random() - 0.5) * 1000;
}

// Initial NPCs
for(let i=0; i<30; i++) spawnLocalNPC();

function addEntity(dict: any, id: string, state: any, isNPC: boolean) {
  if(dict[id]) scene.remove(dict[id]);
  const ship = createShipModel(isNPC, state.colors);
  ship.position.set(state.x, state.y, state.z);
  ship.quaternion.set(state.qx || 0, state.qy || 0, state.qz || 0, state.qw || 1);
  ship.userData = {
    targetPosition: ship.position.clone(),
    targetQuaternion: ship.quaternion.clone()
  };
  scene.add(ship);
  dict[id] = ship;
}
// updateEntity removed

// ---- Visual Effects ----
const lasers: {mesh: THREE.Mesh, dir: THREE.Vector3, life: number, speed: number, color: number}[] = [];
function createLaser(pos: THREE.Vector3, dir: THREE.Vector3, color: number, speed: number) {
  const geo = new THREE.CylinderGeometry(0.2, 0.2, 10);
  geo.rotateX(Math.PI/2);
  const mat = new THREE.MeshBasicMaterial({ color: color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  mesh.lookAt(pos.clone().add(dir));
  scene.add(mesh);
  lasers.push({ mesh, dir: dir.normalize(), life: 2.0, speed, color });
}

function createExplosion(pos: THREE.Vector3) {
  // Particle debris
  const pGeo = new THREE.BufferGeometry();
  const pPos = [];
  const pVels: number[] = [];
  for(let i=0; i<80; i++) {
    pPos.push(pos.x, pos.y, pos.z);
    pVels.push((Math.random()-0.5)*60, (Math.random()-0.5)*60, (Math.random()-0.5)*60);
  }
  pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 2.5, transparent: true });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);
  
  // Shockwave ring
  const ringGeo = new THREE.RingGeometry(0.5, 2, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(pos);
  ring.lookAt(camera.position);
  scene.add(ring);
  
  // Flash sphere
  const flashGeo = new THREE.SphereGeometry(3, 8, 8);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.copy(pos);
  scene.add(flash);
  
  const startTime = Date.now();
  function anim() {
    const age = (Date.now() - startTime) / 1000;
    if(age > 1.5) { scene.remove(points); scene.remove(ring); scene.remove(flash); return; }
    const positions = points.geometry.attributes.position.array as Float32Array;
    for(let i=0; i<80; i++) {
      positions[i*3] += pVels[i*3] * 0.016;
      positions[i*3+1] += pVels[i*3+1] * 0.016;
      positions[i*3+2] += pVels[i*3+2] * 0.016;
    }
    points.geometry.attributes.position.needsUpdate = true;
    pMat.opacity = Math.max(0, 1 - age);
    
    // Expand shockwave ring
    const ringScale = 1 + age * 30;
    ring.scale.set(ringScale, ringScale, ringScale);
    ringMat.opacity = Math.max(0, 0.8 - age * 0.8);
    
    // Flash fade
    const flashScale = 1 + age * 5;
    flash.scale.set(flashScale, flashScale, flashScale);
    flashMat.opacity = Math.max(0, 0.9 - age * 2);
    
    requestAnimationFrame(anim);
  }
  anim();
  
  // Camera shake if close enough
  const dist = pos.distanceTo(camera.position);
  if(dist < 150) {
    cameraShakeIntensity = Math.max(cameraShakeIntensity, (1 - dist / 150) * 0.05);
  }
}

// ---- Controls ----
const keys = { w: false, s: false, a: false, d: false };
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if(keys.hasOwnProperty(k)) keys[k as keyof typeof keys] = true;
  
  if(k === '1') setWeapon(0);
  if(k === '2') setWeapon(1);
  if(k === '3') setWeapon(2);
});
document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if(keys.hasOwnProperty(k)) keys[k as keyof typeof keys] = false;
});

document.addEventListener('wheel', (e) => {
  if(!isPlaying || isDead) return;
  if(e.deltaY > 0) setWeapon((currentWeapon + 1) % 3);
  else setWeapon((currentWeapon - 1 + 3) % 3);
});

document.addEventListener('mousemove', (e) => {
  if(!isPlaying || isDead) return;
  if(document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  }
});

document.addEventListener('mousedown', (e) => {
  if(!isPlaying || isDead) return;
  if(document.pointerLockElement !== document.body) {
    document.body.requestPointerLock();
  } else {
    if (e.button === 0) isShooting = true;
    if (e.button === 2) isZooming = true;
  }
});

document.addEventListener('mouseup', (e) => {
  if (e.button === 0) isShooting = false;
  if (e.button === 2) isZooming = false;
});

// Prevent context menu
document.addEventListener('contextmenu', e => e.preventDefault());

function setWeapon(index: number) {
  currentWeapon = index;
  UI.wepSlots.forEach((slot, i) => {
    slot.classList.toggle('active', i === currentWeapon);
  });
  playWeaponSwitchSound();
}

function shoot() {
  const now = Date.now() / 1000;
  const wep = WEAPONS[currentWeapon];
  const actualCooldown = wep.cooldown / fireRateMult;
  
  if(now - lastShotTime < actualCooldown) return;
  lastShotTime = now;
  
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const spawnPos = camera.position.clone().add(dir.clone().multiplyScalar(3));
  spawnPos.y -= 0.5;
  
  createLaser(spawnPos, dir, wep.color, wep.speed);
  playLaserSound(currentWeapon);
  
  // Hitscan for instant weapons
  const raycaster = new THREE.Raycaster(camera.position, dir);
  const targets = [...Object.values(npcs)];
  const intersects = raycaster.intersectObjects(targets, true);
  
  if(intersects.length > 0) {
    UI.hitMarker.classList.add('hit');
    playHitSound();
    setTimeout(() => UI.hitMarker.classList.remove('hit'), 100);
    
    const hitObj = intersects[0].object;
    let targetId: string | null = null;
    
    for(let id in npcs) {
      if(hitObj.parent === npcs[id] || hitObj.parent?.parent === npcs[id]) targetId = id;
    }
    
    if(targetId && npcs[targetId]) {
      const npc = npcs[targetId];
      npc.userData.health -= wep.damage * dmgMult;
      
      if(npc.userData.health <= 0) {
        createExplosion(npc.position);
        playExplosionSound();
        addKillFeedEntry('YOU', `BOT-${targetId.slice(4)}`, true);
        scene.remove(npc);
        delete npcs[targetId];
        killCount++;
        updateKillCounter();
        addXP(40);
      }
    }
  }
}

// ---- Level & Upgrades ----
function addXP(amount: number) {
  if(level >= 50) return;
  xp += amount;
  while(xp >= xpNeeded && level < 50) {
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.5);
    triggerLevelUp();
  }
  updateXPUI();
}

function triggerLevelUp() {
  isPlaying = false;
  document.exitPointerLock();
  UI.upgradeMenu.classList.remove('hidden');
  playLevelUpSound();
}

function applyUpgrade(type: string) {
  if(type === 'dmg') dmgMult += 0.2;
  if(type === 'hp') { maxHealth += 50; health = maxHealth; }
  if(type === 'fire') fireRateMult += 0.2;
  
  UI.upgradeMenu.classList.add('hidden');
  updateHealthUI();
  updateXPUI();
  
  // resume
  isPlaying = true;
  document.body.requestPointerLock();
}

UI.upgDmg.addEventListener('click', () => applyUpgrade('dmg'));
UI.upgHealth.addEventListener('click', () => applyUpgrade('hp'));
UI.upgFireRate.addEventListener('click', () => applyUpgrade('fire'));

function updateXPUI() {
  UI.levelLabel.innerText = `LEVEL ${level}`;
  UI.xpFill.style.width = `${(xp / xpNeeded) * 100}%`;
}
function updateHealthUI() {
  const pct = Math.max(0, (health / maxHealth) * 100);
  UI.healthFill.style.width = pct + '%';
  UI.healthLabel.innerText = `HULL: ${health}/${maxHealth}`;
  UI.healthFill.style.background = pct < 30 ? '#ff0000' : '#00ffcc';
}

// ---- Game Loop ----
const clock = new THREE.Clock();

function update() {
  requestAnimationFrame(update);
  const dt = clock.getDelta();
  
  asteroids.forEach(a => {
    if (a.userData.rx !== undefined) {
      a.rotation.x += a.userData.rx * dt;
      a.rotation.y += a.userData.ry * dt;
    }
  });
  
  // Interpolate other players
  for (let id in otherPlayers) {
    const p = otherPlayers[id];
    p.position.lerp(p.userData.targetPosition, dt * 15);
    p.quaternion.slerp(p.userData.targetQuaternion, dt * 15);
  }
  
  // Local NPC Logic
  npcSpawnTimer += dt;
  if(npcSpawnTimer > 1.5) {
    if(Object.keys(npcs).length < 60) {
      spawnLocalNPC();
      spawnLocalNPC();
    }
    npcSpawnTimer = 0;
  }
  
  for (let id in npcs) {
    const npc = npcs[id];
    const ud = npc.userData;
    const now = performance.now();
    const timeSec = now / 1000;
    const idx = parseInt(id.replace('npc_', '')) || 0;
    
    // Retarget every 3-5 seconds
    if (!ud.targetId || now - ud.retargetTime > 3000 + Math.random() * 2000) {
        ud.retargetTime = now;
        ud.targetId = null;
        let bestDist = 400; let bestTarget = null;
        
        // Check other NPCs
        for (let oid in npcs) {
            if (oid === id || npcs[oid].userData.faction === ud.faction) continue;
            const d = npc.position.distanceTo(npcs[oid].position);
            if (d < bestDist) { bestDist = d; bestTarget = oid; }
        }
        
        // Check player
        const playerDist = npc.position.distanceTo(camera.position);
        if (playerDist < 600 && (!bestTarget || Math.random() < 0.6)) {
            ud.targetId = 'player';
        } else if (bestTarget) {
            ud.targetId = bestTarget;
        } else if (playerDist < 1500) {
            ud.targetId = 'player';
        }
        
        if (ud.targetId && ud.aiState === AI_STATES.PATROL) {
            ud.aiState = AI_STATES.ENGAGE;
            ud.stateTimer = now + 3000 + Math.random() * 2000;
        }
    }
    
    let targetObj: any = null;
    if (ud.targetId === 'player') targetObj = camera;
    else if (npcs[ud.targetId]) targetObj = npcs[ud.targetId];
    
    if (!targetObj) {
        ud.targetId = null;
        ud.aiState = AI_STATES.PATROL;
    }
    
    let toTarget = new THREE.Vector3(0, 0, 1);
    let mag = 1;
    let perpX = 1, perpZ = 0;
    
    if (targetObj) {
        const dx = targetObj.position.x - npc.position.x;
        const dy = targetObj.position.y - npc.position.y;
        const dz = targetObj.position.z - npc.position.z;
        mag = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
        toTarget.set(dx/mag, dy/mag, dz/mag);
        perpX = -toTarget.z;
        perpZ = toTarget.x;
    }
    
    // State timer - switch behaviors
    if(now > ud.stateTimer && targetObj) {
        const roll = Math.random();
        if(roll < 0.35) {
            ud.aiState = AI_STATES.ENGAGE;
            ud.stateTimer = now + 2000 + Math.random() * 2000;
        } else if(roll < 0.6) {
            ud.aiState = AI_STATES.STRAFE;
            ud.stateTimer = now + 2000 + Math.random() * 1500;
        } else if(roll < 0.8) {
            ud.aiState = AI_STATES.EVADE;
            ud.stateTimer = now + 1000 + Math.random() * 1500;
            ud.evadeDir.set((Math.random() - 0.5) * 2, Math.random() - 0.5, (Math.random() - 0.5) * 2).normalize();
        } else {
            ud.aiState = AI_STATES.DIVE;
            ud.stateTimer = now + 1500 + Math.random() * 1000;
        }
    }
    
    if (!targetObj) {
        // Patrol
        ud.patrolAngle += 0.008 + (idx % 5) * 0.002;
        const tx = ud.patrolCenterX + Math.cos(ud.patrolAngle) * 150;
        const tz = ud.patrolCenterZ + Math.sin(ud.patrolAngle) * 150;
        const ty = Math.sin(ud.patrolAngle * 0.5) * 80;
        ud.vx += (tx - npc.position.x) * 0.01 * dt;
        ud.vy += (ty - npc.position.y) * 0.01 * dt;
        ud.vz += (tz - npc.position.z) * 0.01 * dt;
    } else {
        switch(ud.aiState) {
            case AI_STATES.ENGAGE:
                const appSpd = ud.speed * (mag > 40 ? 1.8 : 0.8);
                ud.vx += toTarget.x * appSpd * dt;
                ud.vy += toTarget.y * appSpd * dt;
                ud.vz += toTarget.z * appSpd * dt;
                ud.vy += Math.sin(timeSec * 2.5 + idx) * 1.5 * dt;
                break;
            case AI_STATES.STRAFE:
                const idealDist = 60 + (idx % 3) * 20;
                const distForce = (mag - idealDist) * 0.3;
                const strafeSpd = ud.speed * 1.5;
                const strafePhase = Math.sin(timeSec * 1.6 + idx * 2.1);
                ud.vx += (toTarget.x * distForce + perpX * strafeSpd * 1.2 * strafePhase) * dt;
                ud.vz += (toTarget.z * distForce + perpZ * strafeSpd * 1.2 * strafePhase) * dt;
                ud.vy += Math.sin(timeSec * 2 + idx * 1.3) * 2 * dt;
                break;
            case AI_STATES.EVADE:
                const evadeSpd = ud.speed * 2.5;
                ud.vx += ud.evadeDir.x * evadeSpd * 2 * dt;
                ud.vy += ud.evadeDir.y * evadeSpd * 1.5 * dt;
                ud.vz += ud.evadeDir.z * evadeSpd * 2 * dt;
                ud.vx += Math.sin(timeSec * 5 + idx) * 5 * dt;
                break;
            case AI_STATES.DIVE:
                const diveProgress = 1 - (ud.stateTimer - now) / 2500;
                if(diveProgress < 0.5) {
                    ud.vx += toTarget.x * ud.speed * 2.5 * dt;
                    ud.vy -= ud.speed * 3 * dt;
                    ud.vz += toTarget.z * ud.speed * 2.5 * dt;
                } else {
                    ud.vy += ud.speed * 4 * dt;
                    ud.vx -= toTarget.x * ud.speed * 1 * dt;
                    ud.vz -= toTarget.z * ud.speed * 1 * dt;
                }
                break;
        }
        
        // Shoot
        if(mag < 200 && now - ud.lastShoot > 1500 + Math.random() * 1000) {
            ud.lastShoot = now;
            const shootDir = toTarget.clone().add(new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2)).normalize();
            createLaser(npc.position.clone().add(shootDir.multiplyScalar(3)), shootDir, ud.laserColor || 0xff0000, 400);
            
            // Play sound with distance volume falloff
            const d = npc.position.distanceTo(camera.position);
            if (d < 500) {
               playEnemyLaserSound(d);
            }
        }
    }
    
    const drag = Math.pow(0.5, dt);
    ud.vx *= drag;
    ud.vy *= drag;
    ud.vz *= drag;
    
    const vel = Math.sqrt(ud.vx*ud.vx + ud.vy*ud.vy + ud.vz*ud.vz);
    const maxVel = ud.speed * 4;
    if(vel > maxVel) {
        ud.vx = (ud.vx/vel) * maxVel;
        ud.vy = (ud.vy/vel) * maxVel;
        ud.vz = (ud.vz/vel) * maxVel;
    }
    
    // Update position
    npc.position.x += ud.vx * dt * 10;
    npc.position.y += ud.vy * dt * 10;
    npc.position.z += ud.vz * dt * 10;
    
    // Avoid floor
    if (npc.position.y < -5) {
        npc.position.y = -5;
        ud.vy = Math.abs(ud.vy);
    }
    
    // Look ahead
    const targetLook = npc.position.clone().add(new THREE.Vector3(ud.vx, ud.vy, ud.vz));
    if (targetLook.distanceTo(npc.position) > 0.1) {
        const m = new THREE.Matrix4().lookAt(npc.position, targetLook, new THREE.Vector3(0,1,0));
        npc.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(m), dt * 8);
    }
  }
  
  for(let i=lasers.length-1; i>=0; i--) {
    const l = lasers[i];
    l.mesh.position.add(l.dir.clone().multiplyScalar(l.speed * dt));
    l.life -= dt;
    if(l.life <= 0) { scene.remove(l.mesh); lasers.splice(i, 1); }
  }
  
  if (isPlaying && !isDead) {
    if(isShooting) shoot();
    
    // Zoom logic
    const targetFov = isZooming ? 45 : 75;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
    camera.updateProjectionMatrix();
    if(isZooming) UI.crosshair.classList.add('zoomed');
    else UI.crosshair.classList.remove('zoomed');

    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    
    if(keys.w) throttle += 50 * dt;
    else if(keys.s) throttle -= 50 * dt;
    else throttle -= throttle * 2 * dt;
    throttle = Math.max(-MAX_SPEED * 0.2, Math.min(MAX_SPEED, throttle));
    
    roll = THREE.MathUtils.lerp(roll, (keys.a ? 0.3 : 0) + (keys.d ? -0.3 : 0), 0.1);
    camera.rotateZ(roll);

    const thrustPct = Math.max(0, throttle) / MAX_SPEED;
    UI.speedDisplay.innerText = `THRUST: ${Math.floor(thrustPct * 100)}%`;

    camera.translateZ(-throttle * dt);
    if(keys.a) camera.translateX(-30 * dt);
    if(keys.d) camera.translateX(30 * dt);
    
    // Portal Logic
    for (let i = 0; i < portals.length; i++) {
      const p = portals[i];
      p.rotation.y += dt * 0.5;
      if (camera.position.distanceTo(p.position) < 18) {
        playPortalSound();
        
        // Vibe Jam 2026 Game Transition
        UI.gameOverMenu.innerHTML = '<h1 style="color:#fff; text-shadow: 0 0 20px #f0f;">PORTAL JUMP INITIATED...</h1><p style="color:#0ff;">Entering Hyper-Space...</p>';
        UI.gameOverMenu.style.display = 'flex';
        UI.gameOverMenu.style.background = 'rgba(255, 0, 255, 0.3)';
        UI.gameOverMenu.style.backdropFilter = 'blur(10px)';
        isPlaying = false; // Stop game loop logic
        
        setTimeout(() => {
            window.location.href = 'https://vibej.am/2026/next';
        }, 1500);
        
        p.position.set(9999,9999,9999); // remove so it doesn't trigger again
      }
    }
    
    // Engine sound update
    updateEngineSound(thrustPct);
    
    // Speed lines intensity based on throttle (reduced for better visibility)
    speedLinesMat.opacity = thrustPct * 0.25;
    speedLinesMat.size = 0.2 + thrustPct * 0.8;
    const slArr = speedLines.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < speedLinesCount; i++) {
      slArr[i * 3 + 2] += thrustPct * 1.5;
      if (slArr[i * 3 + 2] > 5) slArr[i * 3 + 2] = -80;
    }
    speedLines.geometry.attributes.position.needsUpdate = true;
    
    // Camera shake decay
    if (cameraShakeIntensity > 0.001) {
      camera.position.x += (Math.random() - 0.5) * cameraShakeIntensity * 2;
      camera.position.y += (Math.random() - 0.5) * cameraShakeIntensity * 2;
      cameraShakeIntensity *= 0.9;
    } else {
      cameraShakeIntensity = 0;
    }
    
    // Laser Hit Detection
    const playerBox = new THREE.Box3().setFromCenterAndSize(camera.position, new THREE.Vector3(2, 2, 2));
    for(let i=0; i<lasers.length; i++) {
      const c = lasers[i].color;
      const isNPCLaser = (c === 0xff2244 || c === 0x4488ff || c === 0x44ff44);
      
      if(isNPCLaser) {
          // Check player
          if(playerBox.containsPoint(lasers[i].mesh.position)) {
             health -= 10;
             updateHealthUI();
             playDamageSound();
             cameraShakeIntensity = Math.max(cameraShakeIntensity, 0.03);
             document.body.style.backgroundColor = '#ff0000';
             setTimeout(() => document.body.style.backgroundColor = '#000', 100);
             lasers[i].life = 0; // Destroy laser
             
             if(health <= 0 && !isDead) {
               playDeathSound();
               die();
             }
             continue;
          }
          
          // Check other NPCs
          let hitNPC = false;
          for (let id in npcs) {
              const n = npcs[id];
              // Don't hurt same faction
              if (n.userData.laserColor === c) continue;
              const npcBox = new THREE.Box3().setFromCenterAndSize(n.position, new THREE.Vector3(4, 4, 4));
              
              if(npcBox.containsPoint(lasers[i].mesh.position)) {
                  n.userData.health -= 10;
                  lasers[i].life = 0; // Destroy laser
                  hitNPC = true;
                  
                  if (n.userData.health <= 0) {
                      createExplosion(n.position);
                      // Only play sound if close enough to player
                      if (n.position.distanceTo(camera.position) < 800) {
                          playExplosionSound();
                      }
                      scene.remove(n);
                      delete npcs[id];
                  }
                  break; // Move to next laser
              }
          }
          if(hitNPC) continue;
      }
    }
  }
  renderer.render(scene, camera);
}

// ---- Flow Control ----
function startGame() {
  document.body.requestPointerLock();
  isPlaying = true;
  isDead = false;
  UI.startMenu.classList.add('hidden');
  UI.gameOverMenu.classList.add('hidden');
  UI.hud.classList.remove('hidden');
  startMusic();
  startEngineSound();
}

function die() {
  isDead = true;
  document.exitPointerLock();
  UI.hud.classList.add('hidden');
  UI.gameOverMenu.classList.remove('hidden');
  UI.finalStats.innerText = `You reached Level ${level} with ${Math.floor(xp)} XP.`;
}

UI.startBtn.addEventListener('click', startGame);
UI.respawnBtn.addEventListener('click', () => {
  camera.position.set((Math.random()-0.5)*50, (Math.random()-0.5)*50, (Math.random()-0.5)*50);
  pitch = 0; yaw = 0; roll = 0; throttle = 0;
  level = 1; xp = 0; xpNeeded = 100; maxHealth = 100; health = 100; dmgMult = 1.0; fireRateMult = 1.0;
  updateXPUI(); updateHealthUI();
  startGame();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

update();
