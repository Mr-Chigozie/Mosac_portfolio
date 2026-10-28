// Disable automatic browser scroll restoration on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Force the window to stay at the top on a fresh load/reload
window.scrollTo(0, 0);

// ==========================
// CANVAS SETUP
// ==========================
const gameCanvas = document.getElementById("gameCanvas");
const gctx = gameCanvas.getContext("2d");

// Everything is simulated in this fixed logical resolution and scaled to
// whatever size the canvas is displayed at, so resizing never breaks gameplay.
const W = 960;
const H = 540;
const HUD_H = 46;
const GROUND_Y = 405;   // ship touching this line = crash
const FLOOR_Y = 420;    // where ground obstacles sit
const FONT = "'JetBrains Mono', monospace";

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const cssW = gameCanvas.clientWidth || W;
  const scale = cssW / W;

  gameCanvas.width = Math.round(cssW * dpr);
  gameCanvas.height = Math.round(cssW * (H / W) * dpr);

  gctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  gctx.imageSmoothingEnabled = true;
  gctx.imageSmoothingQuality = "high";
}

if ("ResizeObserver" in window) {
  new ResizeObserver(resizeCanvas).observe(gameCanvas);
} else {
  window.addEventListener("resize", resizeCanvas);
}
resizeCanvas();

// ==========================
// TUNING
// ==========================
const PHYSICS = {
  gravity: 0.3,       // constant pull towards the ground
  thrust: 0.72,       // upward force while holding thrust
  maxFall: 9,
  maxRise: -7,
  drag: 0.985,
  accel: 0.55,        // horizontal
  friction: 0.88,
  maxSpeedX: 6
};

const FIRE_COOLDOWN = 11;
const RAPID_COOLDOWN = 4;
const INVULN_FRAMES = 120;
const MAX_LIVES = 5;

// ==========================
// SPRITE SHEETS
// Hand-measured source rects [x, y, w, h] so each sprite is cropped tightly
// ==========================
const SHIP_FRAMES = [
  [38, 96, 344, 112], [384, 96, 378, 112], [786, 96, 342, 112], [1154, 96, 350, 110],
  [42, 417, 340, 110], [384, 417, 378, 110], [786, 417, 344, 110], [1152, 417, 352, 110]
];

const OBSTACLE_RECTS = [
  [35, 62, 220, 228], [270, 65, 240, 225], [525, 90, 240, 195], [775, 72, 225, 208],
  [25, 310, 235, 235], [270, 355, 245, 190], [530, 360, 220, 185], [770, 330, 230, 215],
  [20, 575, 250, 205], [280, 585, 235, 195], [530, 575, 215, 205], [765, 575, 235, 185]
];

const ENEMY_TYPES = [
  { name: "bat",         rect: [65, 70, 240, 200],    size: 72,  hp: 1, speed: 1.6, wave: 34, freq: 0.07, glow: "#c86bff", score: 25 },
  { name: "greenDragon", rect: [320, 70, 280, 195],   size: 80,  hp: 2, speed: 1.2, wave: 20, freq: 0.04, glow: "#8dff4a", score: 40, shoots: true },
  { name: "redDragon",   rect: [75, 320, 310, 290],   size: 96,  hp: 3, speed: 1.0, wave: 16, freq: 0.035, glow: "#ff4d3d", score: 55, shoots: true },
  { name: "blueDragon",  rect: [400, 340, 325, 245],  size: 92,  hp: 3, speed: 1.3, wave: 24, freq: 0.05, glow: "#3db8ff", score: 55, shoots: true },
  { name: "demon",       rect: [640, 55, 405, 235],   size: 96,  hp: 5, speed: 0.7, wave: 8,  freq: 0.03, glow: "#ff2a55", score: 80, homing: true },
  { name: "shadow",      rect: [390, 635, 285, 245],  size: 88,  hp: 4, speed: 1.5, wave: 40, freq: 0.06, glow: "#9d6bff", score: 70, homing: true },
  { name: "goldDragon",  rect: [1050, 630, 470, 250], size: 104, hp: 6, speed: 0.9, wave: 14, freq: 0.03, glow: "#ffc53d", score: 100, shoots: true }
];

const PICKUP_TYPES = [
  { name: "life",  rect: [700, 650, 315, 255],  size: 62, glow: "#ff8ad8", label: "+1 LIFE" },
  { name: "rapid", rect: [760, 320, 260, 290],  size: 62, glow: "#7dfcff", label: "RAPID FIRE" }
];

// ==========================
// ASSET LOADING + PRE-RENDERING
// ==========================
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load " + src));
    img.src = src;
  });
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

function tint(source, color) {
  const c = makeCanvas(source.width, source.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

// Crops a sprite out of a sheet once, at 2x the display height (crisp on hi-dpi),
// optionally wrapping it in a dark outline + coloured glow so it pops on the bright sky.
function bakeSprite(img, rect, displayH, glow) {
  const [sx, sy, sw, sh] = rect;
  const bakeScale = (displayH * 2) / sh;
  const bw = sw * bakeScale;
  const bh = sh * bakeScale;
  const pad = glow ? 22 : 0;

  const body = makeCanvas(bw, bh);
  body.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, bw, bh);

  const out = makeCanvas(bw + pad * 2, bh + pad * 2);
  const ctx = out.getContext("2d");

  if (glow) {
    const glowSil = tint(body, glow);
    const darkSil = tint(body, "rgba(5, 8, 20, 0.95)");

    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 24;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      ctx.drawImage(glowSil, pad + Math.cos(a) * 7, pad + Math.sin(a) * 7);
    }
    ctx.restore();

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      ctx.drawImage(darkSil, pad + Math.cos(a) * 3, pad + Math.sin(a) * 3);
    }
  }

  ctx.drawImage(body, pad, pad);

  return {
    img: out,
    flash: tint(out, "rgba(255, 255, 255, 0.9)"),
    // display size of the full baked image and of the body inside it
    w: out.width / 2,
    h: out.height / 2,
    pad: pad / 2,
    bodyW: bw / 2,
    bodyH: bh / 2
  };
}

const art = {
  bg: null,
  ship: [],
  obstacles: [],
  enemies: [],
  pickups: []
};

let assetsReady = false;
let assetsError = null;

Promise.all([
  loadImage("images/backg.png"),
  loadImage("images/ships.png"),
  loadImage("images/barrs.png"),
  loadImage("images/blame.png")
]).then(([bgImg, shipImg, obstacleImg, monsterImg]) => {
  art.bg = bgImg;
  art.ship = SHIP_FRAMES.map(r => bakeSprite(shipImg, r, 44, null));
  art.obstacles = OBSTACLE_RECTS.map(r => bakeSprite(obstacleImg, r, 140, null));
  art.enemies = ENEMY_TYPES.map(t => bakeSprite(monsterImg, t.rect, t.size, t.glow));
  art.pickups = PICKUP_TYPES.map(t => bakeSprite(monsterImg, t.rect, t.size, t.glow));
  assetsReady = true;
}).catch(err => {
  console.error(err);
  assetsError = err.message;
});

// ==========================
// STATE
// ==========================
const safeStorage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  }
};

let state = "ready"; // ready | playing | paused | over
let hiScore = Number(safeStorage.get("hiScore")) || 0;
let newBest = false;

let player, bullets, enemyShots, obstacles, enemies, pickups, particles, floaters;
let score, lives, distance, playTime, worldSpeed, level;
let bgFarX, bgNearX, shake, hitFlash, rapidTimer, fireCooldown;
let obstacleTimer, enemyTimer, pickupTimer;
let frameCount = 0;

function resetGame() {
  player = {
    x: 120,
    y: H * 0.38,
    w: 132,
    h: 44,
    vx: 0,
    vy: -5,   // small launch so new players get a moment to react
    invuln: 0,
    thrusting: false,
    alive: true
  };

  bullets = [];
  enemyShots = [];
  obstacles = [];
  enemies = [];
  pickups = [];
  particles = [];
  floaters = [];

  score = 0;
  lives = 3;
  distance = 0;
  playTime = 0;
  worldSpeed = 3;
  level = 1;
  newBest = false;

  bgFarX = 0;
  bgNearX = 0;
  shake = 0;
  hitFlash = 0;
  rapidTimer = 0;
  fireCooldown = 0;

  obstacleTimer = 120;
  enemyTimer = 90;
  pickupTimer = 900;
}

resetGame();

// ==========================
// INPUT
// ==========================
const keys = {};
const touch = { active: false };

const GAME_KEYS = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];

function canvasFocused() {
  return document.activeElement === gameCanvas;
}

function startOrRestart() {
  if (state === "ready" || state === "over") {
    resetGame();
    state = "playing";
  } else if (state === "paused") {
    state = "playing";
  }
}

window.addEventListener("keydown", (e) => {
  // only hijack keys while the game has focus, so the rest of the page
  // (search boxes, scrolling) keeps working normally
  if (!canvasFocused()) return;

  if (GAME_KEYS.includes(e.code)) e.preventDefault();
  keys[e.code] = true;

  if (e.code === "Enter" && state !== "playing") startOrRestart();
  if (e.code === "KeyR" && state === "over") startOrRestart();
  if (e.code === "KeyP" || e.code === "Escape") {
    if (state === "playing") state = "paused";
    else if (state === "paused") state = "playing";
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

gameCanvas.addEventListener("pointerdown", (e) => {
  gameCanvas.focus({ preventScroll: true });

  if (state !== "playing") {
    startOrRestart();
  }

  if (e.pointerType === "touch") {
    e.preventDefault();
    touch.active = true;
  }
});

window.addEventListener("pointerup", () => { touch.active = false; });
window.addEventListener("pointercancel", () => { touch.active = false; });

// pause automatically when focus leaves the game (keys would stop registering)
gameCanvas.addEventListener("blur", () => {
  for (const k in keys) keys[k] = false;
  if (state === "playing") state = "paused";
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state === "playing") state = "paused";
});

const isThrusting = () => keys.Space || keys.ArrowUp || keys.KeyW || touch.active;
const isFiring = () => keys.KeyF || keys.KeyJ || touch.active;

// ==========================
// HELPERS
// ==========================
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function hitbox(e, insetX = 0.18, insetY = 0.2) {
  return {
    x: e.x + e.w * insetX,
    y: e.y + e.h * insetY,
    w: e.w * (1 - insetX * 2),
    h: e.h * (1 - insetY * 2)
  };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function centerOf(e) {
  return { x: e.x + e.w / 2, y: e.y + e.h / 2 };
}

function burst(x, y, colors, count, power = 4, size = 4) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * power;
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(25, 50),
      max: 50,
      size: rand(size * 0.5, size * 1.4),
      color: pick(colors),
      gravity: 0.05
    });
  }
}

function addFloater(x, y, text, color) {
  floaters.push({ x, y, text, color, life: 60 });
}

function addScore(points, x, y, color = "#ffe066") {
  score += points;
  addFloater(x, y, `+${points}`, color);
}

// ==========================
// SPAWNING
// ==========================
function spawnObstacle() {
  const index = Math.floor(Math.random() * art.obstacles.length);
  const sprite = art.obstacles[index];
  const h = rand(80, 105 + Math.min(level * 8, 45));
  const w = h * (sprite.w / sprite.h);

  obstacles.push({
    x: W + 20,
    y: FLOOR_Y - h,
    w, h,
    sprite: index,
    hp: 3,
    flash: 0
  });
}

function spawnEnemy() {
  const unlocked = Math.min(ENEMY_TYPES.length, 2 + level);
  const typeIndex = Math.floor(Math.random() * unlocked);
  const type = ENEMY_TYPES[typeIndex];
  const sprite = art.enemies[typeIndex];

  const baseY = rand(HUD_H + 20, GROUND_Y - sprite.bodyH - 30);

  enemies.push({
    type,
    typeIndex,
    x: W + 60,
    y: baseY,
    baseY,
    w: sprite.bodyW,
    h: sprite.bodyH,
    hp: type.hp + Math.floor(level / 3),
    maxHp: type.hp + Math.floor(level / 3),
    phase: Math.random() * Math.PI * 2,
    age: 0,
    flash: 0,
    shotTimer: rand(60, 140)
  });
}

function spawnPickup() {
  const typeIndex = lives < MAX_LIVES && Math.random() < 0.55 ? 0 : 1;
  const sprite = art.pickups[typeIndex];
  const baseY = rand(HUD_H + 40, GROUND_Y - sprite.bodyH - 60);

  pickups.push({
    typeIndex,
    x: W + 40,
    y: baseY,
    baseY,
    w: sprite.bodyW,
    h: sprite.bodyH,
    age: 0
  });
}

// ==========================
// PLAYER DAMAGE
// ==========================
function damagePlayer(crashedIntoGround) {
  if (player.invuln > 0 || !player.alive) return;

  const c = centerOf(player);
  lives--;
  shake = 14;
  hitFlash = 14;
  burst(c.x, c.y, ["#ffb347", "#ff5e3a", "#ffe066", "#ffffff"], 40, 6, 5);

  if (lives <= 0) {
    player.alive = false;
    burst(c.x, c.y, ["#ffb347", "#ff5e3a", "#888", "#ffffff"], 80, 9, 7);
    shake = 24;
    state = "over";

    if (Math.floor(score) > hiScore) {
      hiScore = Math.floor(score);
      newBest = true;
      safeStorage.set("hiScore", hiScore);
    }
    return;
  }

  player.invuln = INVULN_FRAMES;

  if (crashedIntoGround) {
    // relaunch the ship from mid-air so the player can recover
    player.y = H * 0.35;
    player.vy = -2;
    addFloater(c.x, GROUND_Y - 30, "CRASHED!", "#ff5e5e");
  }
}

// ==========================
// UPDATE
// ==========================
function update(dt) {
  frameCount += dt;
  if (shake > 0) shake = Math.max(0, shake - dt);
  if (hitFlash > 0) hitFlash -= dt;

  if (state === "paused") return;

  if (state !== "playing") {
    updateParticles(dt);
    return;
  }

  playTime += dt / 60;
  level = 1 + Math.floor(playTime / 25);
  worldSpeed = 3 + Math.min(playTime * 0.045, 4.5);
  distance += worldSpeed * dt * 0.05;
  score += worldSpeed * dt * 0.02;

  bgFarX -= worldSpeed * 0.35 * dt;
  bgNearX -= worldSpeed * dt;

  if (rapidTimer > 0) rapidTimer -= dt;

  updatePlayer(dt);
  updateBullets(dt);
  updateObstacles(dt);
  updateEnemies(dt);
  updatePickups(dt);
  updateParticles(dt);
  bullets = bullets.filter(b => !b.dead);

  // spawning
  obstacleTimer -= dt;
  if (obstacleTimer <= 0) {
    spawnObstacle();
    obstacleTimer = Math.max(70, 160 - level * 10) * rand(0.8, 1.3);
  }

  enemyTimer -= dt;
  if (enemyTimer <= 0) {
    spawnEnemy();
    enemyTimer = Math.max(45, 130 - level * 12) * rand(0.7, 1.3);
  }

  pickupTimer -= dt;
  if (pickupTimer <= 0) {
    spawnPickup();
    pickupTimer = rand(900, 1400);
  }
}

function updatePlayer(dt) {
  if (!player.alive) return;

  player.thrusting = isThrusting();

  // gravity always pulls the craft down – hold thrust to stay airborne
  player.vy += PHYSICS.gravity * dt;
  if (player.thrusting) player.vy -= PHYSICS.thrust * dt;
  if (keys.ArrowDown || keys.KeyS) player.vy += PHYSICS.gravity * dt;

  player.vy *= Math.pow(PHYSICS.drag, dt);
  player.vy = clamp(player.vy, PHYSICS.maxRise, PHYSICS.maxFall);
  player.y += player.vy * dt;

  if (keys.ArrowRight || keys.KeyD) player.vx += PHYSICS.accel * dt;
  if (keys.ArrowLeft || keys.KeyA) player.vx -= PHYSICS.accel * dt;
  player.vx *= Math.pow(PHYSICS.friction, dt);
  player.vx = clamp(player.vx, -PHYSICS.maxSpeedX, PHYSICS.maxSpeedX);
  player.x = clamp(player.x + player.vx * dt, 10, W * 0.65);

  // ceiling
  if (player.y < HUD_H + 4) {
    player.y = HUD_H + 4;
    player.vy = Math.max(0, player.vy);
  }

  // ground = crash
  const box = hitbox(player, 0.08, 0.15);
  if (box.y + box.h >= GROUND_Y) {
    if (player.invuln > 0) {
      // bounce while invulnerable instead of crashing repeatedly
      player.y = GROUND_Y - player.h * 0.85;
      player.vy = -6;
    } else {
      damagePlayer(true);
    }
  }

  if (player.invuln > 0) player.invuln -= dt;

  // exhaust trail
  if (player.thrusting && Math.random() < 0.9 * dt) {
    particles.push({
      x: player.x + 8,
      y: player.y + player.h * 0.5 + rand(-4, 4),
      vx: -rand(2, 4) - worldSpeed * 0.5,
      vy: rand(0.5, 1.5),
      life: rand(14, 24),
      max: 24,
      size: rand(3, 6),
      color: pick(["#ffb347", "#ffe066", "#ff7b39"]),
      gravity: 0
    });
  }

  // shooting
  fireCooldown -= dt;
  if (isFiring() && fireCooldown <= 0) {
    fireCooldown = rapidTimer > 0 ? RAPID_COOLDOWN : FIRE_COOLDOWN;
    bullets.push({
      x: player.x + player.w * 0.9,
      y: player.y + player.h * 0.62,
      vx: 13,
      vy: rapidTimer > 0 ? rand(-0.6, 0.6) : 0
    });
  }
}

function updateBullets(dt) {
  bullets.forEach(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  });
  bullets = bullets.filter(b => b.x < W + 20 && !b.dead);

  enemyShots.forEach(s => {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
  });
  enemyShots = enemyShots.filter(s => s.x > -30 && s.x < W + 30 && s.y > 0 && s.y < H);

  if (!player.alive) return;
  const pBox = hitbox(player, 0.12, 0.25);

  for (let i = enemyShots.length - 1; i >= 0; i--) {
    const s = enemyShots[i];
    if (overlaps(pBox, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) {
      enemyShots.splice(i, 1);
      damagePlayer(false);
    }
  }
}

function bulletHits(target, insetX, insetY) {
  const box = hitbox(target, insetX, insetY);
  for (const b of bullets) {
    if (!b.dead && overlaps(box, { x: b.x, y: b.y - 2, w: 16, h: 4 })) {
      b.dead = true;
      burst(b.x + 12, b.y, ["#7dfcff", "#ffffff"], 6, 3, 2);
      return true;
    }
  }
  return false;
}

function updateObstacles(dt) {
  const pBox = player.alive ? hitbox(player, 0.12, 0.25) : null;

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= worldSpeed * dt;
    if (o.flash > 0) o.flash -= dt;

    if (bulletHits(o, 0.1, 0.12)) {
      o.hp--;
      o.flash = 6;
      if (o.hp <= 0) {
        const c = centerOf(o);
        burst(c.x, c.y, ["#b8ab98", "#8c7f6d", "#e2d6c2", "#ffb347"], 35, 5, 6);
        addScore(20, c.x, o.y);
        obstacles.splice(i, 1);
        continue;
      }
    }

    if (pBox && overlaps(pBox, hitbox(o, 0.15, 0.15))) {
      if (player.invuln <= 0) {
        const c = centerOf(o);
        burst(c.x, c.y, ["#b8ab98", "#8c7f6d"], 25, 4, 5);
        obstacles.splice(i, 1);
        damagePlayer(false);
        continue;
      }
    }

    if (o.x + o.w < -20) obstacles.splice(i, 1);
  }
}

function updateEnemies(dt) {
  const pBox = player.alive ? hitbox(player, 0.12, 0.25) : null;
  const pc = centerOf(player);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const t = e.type;
    e.age += dt;
    if (e.flash > 0) e.flash -= dt;

    e.x -= (worldSpeed * 0.55 + t.speed) * dt;

    if (t.homing && player.alive) {
      e.baseY += clamp(pc.y - (e.baseY + e.h / 2), -1, 1) * 0.6 * dt;
    }
    e.y = clamp(e.baseY + Math.sin(e.age * t.freq + e.phase) * t.wave, HUD_H + 4, GROUND_Y - e.h);

    // dragons breathe fireballs at the player
    if (t.shoots && player.alive && e.x < W - 60 && e.x > player.x + 140) {
      e.shotTimer -= dt;
      if (e.shotTimer <= 0) {
        e.shotTimer = rand(110, 180) - level * 6;
        const sx = e.x + e.w * 0.1;
        const sy = e.y + e.h * 0.45;
        const a = Math.atan2(pc.y - sy, pc.x - sx);
        const speed = 4 + level * 0.25;
        enemyShots.push({ x: sx, y: sy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: 7 });
      }
    }

    if (bulletHits(e, 0.15, 0.15)) {
      e.hp--;
      e.flash = 6;
      if (e.hp <= 0) {
        const c = centerOf(e);
        burst(c.x, c.y, [t.glow, "#ffffff", "#ffe066"], 45, 6, 5);
        addScore(t.score, c.x, e.y, t.glow);
        shake = Math.max(shake, 5);
        enemies.splice(i, 1);
        continue;
      }
    }

    if (pBox && player.invuln <= 0 && overlaps(pBox, hitbox(e, 0.2, 0.2))) {
      const c = centerOf(e);
      burst(c.x, c.y, [t.glow, "#ffffff"], 30, 5, 5);
      enemies.splice(i, 1);
      damagePlayer(false);
      continue;
    }

    if (e.x + e.w < -40) enemies.splice(i, 1);
  }
}

function updatePickups(dt) {
  const pBox = player.alive ? hitbox(player, 0.05, 0.1) : null;

  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.age += dt;
    p.x -= worldSpeed * 0.7 * dt;
    p.y = p.baseY + Math.sin(p.age * 0.06) * 14;

    if (pBox && overlaps(pBox, hitbox(p, 0.1, 0.1))) {
      const type = PICKUP_TYPES[p.typeIndex];
      const c = centerOf(p);

      if (type.name === "life") {
        if (lives < MAX_LIVES) lives++;
        else score += 100;
      } else {
        rapidTimer = 420;
      }

      burst(c.x, c.y, [type.glow, "#ffffff"], 35, 5, 4);
      addFloater(c.x, p.y, type.label, type.glow);
      pickups.splice(i, 1);
      continue;
    }

    if (p.x + p.w < -20) pickups.splice(i, 1);
  }
}

function updateParticles(dt) {
  particles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.gravity * dt;
    p.life -= dt;
  });
  particles = particles.filter(p => p.life > 0);

  floaters.forEach(f => {
    f.y -= 0.8 * dt;
    f.life -= dt;
  });
  floaters = floaters.filter(f => f.life > 0);
}

// ==========================
// DRAW
// ==========================
function drawBackground() {
  const img = art.bg;
  const k = H / img.height;
  const tileW = img.width * k;
  const split = 381; // source row where the grass starts

  // far layer: sky, mountains, bushes
  let x = ((bgFarX % tileW) + tileW) % tileW - tileW;
  for (; x < W; x += tileW) {
    gctx.drawImage(img, 0, 0, img.width, split + 2, x, 0, tileW, (split + 2) * k);
  }

  // near layer: ground, scrolls at the same speed as obstacles
  x = ((bgNearX % tileW) + tileW) % tileW - tileW;
  for (; x < W; x += tileW) {
    gctx.drawImage(img, 0, split, img.width, img.height - split, x, split * k, tileW, (img.height - split) * k);
  }
}

function drawShip() {
  if (!player.alive) return;
  // blink while invulnerable
  if (player.invuln > 0 && Math.floor(player.invuln / 5) % 2 === 0) return;

  const sprite = art.ship[Math.floor(frameCount / 7) % art.ship.length];
  const tilt = clamp(player.vy * 0.045, -0.3, 0.35);

  gctx.save();
  gctx.translate(player.x + player.w / 2, player.y + player.h / 2);
  gctx.rotate(tilt);
  gctx.shadowColor = "rgba(0, 247, 255, 0.6)";
  gctx.shadowBlur = 14;
  gctx.drawImage(sprite.img, -player.w / 2, -player.h / 2, player.w, player.h);
  gctx.restore();
}

function drawObstacles() {
  obstacles.forEach(o => {
    const sprite = art.obstacles[o.sprite];

    // contact shadow
    gctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    gctx.beginPath();
    gctx.ellipse(o.x + o.w / 2, FLOOR_Y - 4, o.w * 0.45, 7, 0, 0, Math.PI * 2);
    gctx.fill();

    gctx.drawImage(o.flash > 0 ? sprite.flash : sprite.img, o.x, o.y, o.w, o.h);

    if (o.hp < 3) drawHealthBar(o.x + o.w * 0.2, o.y - 10, o.w * 0.6, o.hp / 3, "#ffb347");
  });
}

function drawEnemies() {
  enemies.forEach(e => {
    const sprite = art.enemies[e.typeIndex];
    const pulse = 1 + Math.sin(e.age * 0.12) * 0.04;
    const w = sprite.w * pulse;
    const h = sprite.h * pulse;
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;

    gctx.drawImage(e.flash > 0 ? sprite.flash : sprite.img, cx - w / 2, cy - h / 2, w, h);

    if (e.hp < e.maxHp) drawHealthBar(e.x + e.w * 0.15, e.y - 12, e.w * 0.7, e.hp / e.maxHp, e.type.glow);

    // warning marker for enemies about to enter from the right
    if (e.x > W - 30) {
      const blink = Math.floor(frameCount / 8) % 2 === 0;
      gctx.fillStyle = blink ? "#ff3c3c" : "#ffe066";
      gctx.beginPath();
      gctx.moveTo(W - 8, cy);
      gctx.lineTo(W - 26, cy - 12);
      gctx.lineTo(W - 26, cy + 12);
      gctx.closePath();
      gctx.fill();
    }
  });
}

function drawPickups() {
  pickups.forEach(p => {
    const sprite = art.pickups[p.typeIndex];
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const type = PICKUP_TYPES[p.typeIndex];

    // halo ring so pickups read differently from enemies
    gctx.save();
    gctx.strokeStyle = type.glow;
    gctx.globalAlpha = 0.5 + Math.sin(p.age * 0.15) * 0.3;
    gctx.lineWidth = 3;
    gctx.beginPath();
    gctx.arc(cx, cy, Math.max(p.w, p.h) * 0.65, 0, Math.PI * 2);
    gctx.stroke();
    gctx.restore();

    gctx.drawImage(sprite.img, cx - sprite.w / 2, cy - sprite.h / 2, sprite.w, sprite.h);
  });
}

function drawProjectiles() {
  gctx.save();
  gctx.globalCompositeOperation = "lighter";

  bullets.forEach(b => {
    const grad = gctx.createLinearGradient(b.x - 18, b.y, b.x + 16, b.y);
    grad.addColorStop(0, "rgba(0, 247, 255, 0)");
    grad.addColorStop(1, "#bffcff");
    gctx.fillStyle = grad;
    gctx.fillRect(b.x - 18, b.y - 2, 34, 4);
  });

  enemyShots.forEach(s => {
    const grad = gctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.2);
    grad.addColorStop(0, "#fff6c2");
    grad.addColorStop(0.35, "#ff9a2e");
    grad.addColorStop(1, "rgba(255, 60, 20, 0)");
    gctx.fillStyle = grad;
    gctx.beginPath();
    gctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
    gctx.fill();
  });

  particles.forEach(p => {
    gctx.globalAlpha = Math.max(0, p.life / p.max);
    gctx.fillStyle = p.color;
    gctx.beginPath();
    gctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    gctx.fill();
  });

  gctx.restore();

  floaters.forEach(f => {
    gctx.globalAlpha = Math.min(1, f.life / 30);
    gctx.font = `600 16px ${FONT}`;
    gctx.textAlign = "center";
    gctx.lineWidth = 4;
    gctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    gctx.strokeText(f.text, f.x, f.y);
    gctx.fillStyle = f.color;
    gctx.fillText(f.text, f.x, f.y);
    gctx.globalAlpha = 1;
  });
}

function drawHealthBar(x, y, w, ratio, color) {
  gctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  gctx.fillRect(x - 1, y - 1, w + 2, 6);
  gctx.fillStyle = color;
  gctx.fillRect(x, y, w * Math.max(0, ratio), 4);
}

function drawHeart(x, y, size, filled) {
  gctx.beginPath();
  gctx.moveTo(x, y + size * 0.3);
  gctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
  gctx.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size * 0.8, x, y + size);
  gctx.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
  gctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
  gctx.fillStyle = filled ? "#ff4d6d" : "rgba(255, 255, 255, 0.15)";
  gctx.fill();
}

function formatTime(seconds) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function drawHUD() {
  gctx.fillStyle = "rgba(2, 8, 23, 0.65)";
  gctx.fillRect(0, 0, W, HUD_H);
  gctx.fillStyle = "rgba(0, 247, 255, 0.35)";
  gctx.fillRect(0, HUD_H - 1, W, 1);

  for (let i = 0; i < MAX_LIVES; i++) {
    if (i >= 3 && i >= lives) continue;
    drawHeart(26 + i * 26, 13, 20, i < lives);
  }

  gctx.font = `600 15px ${FONT}`;
  gctx.textBaseline = "middle";
  gctx.textAlign = "left";

  const stats = [
    ["SCORE", Math.floor(score)],
    ["LVL", level],
    ["TIME", formatTime(playTime)],
    ["DIST", `${Math.floor(distance)}m`],
    ["BEST", Math.max(hiScore, Math.floor(score))]
  ];

  let x = 170;
  stats.forEach(([label, value]) => {
    gctx.fillStyle = "rgba(0, 247, 255, 0.6)";
    gctx.fillText(label, x, HUD_H / 2);
    x += gctx.measureText(label + " ").width;
    gctx.fillStyle = "#e6fdff";
    gctx.fillText(String(value), x, HUD_H / 2);
    x += gctx.measureText(String(value)).width + 26;
  });

  if (rapidTimer > 0) {
    gctx.fillStyle = "#7dfcff";
    gctx.textAlign = "right";
    gctx.fillText(`RAPID ${Math.ceil(rapidTimer / 60)}s`, W - 16, HUD_H / 2);
  }

  gctx.textBaseline = "alphabetic";
  gctx.textAlign = "left";
}

function drawLowAltitudeWarning() {
  if (!player.alive) return;
  const gap = GROUND_Y - (player.y + player.h);
  if (gap > 70 || player.vy < 0) return;

  const strength = 1 - gap / 70;
  const grad = gctx.createLinearGradient(0, GROUND_Y - 120, 0, H);
  grad.addColorStop(0, "rgba(255, 40, 40, 0)");
  grad.addColorStop(1, `rgba(255, 40, 40, ${0.45 * strength})`);
  gctx.fillStyle = grad;
  gctx.fillRect(0, GROUND_Y - 120, W, H - GROUND_Y + 120);

  if (Math.floor(frameCount / 10) % 2 === 0) {
    gctx.font = `600 22px ${FONT}`;
    gctx.textAlign = "center";
    gctx.lineWidth = 5;
    gctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    gctx.strokeText("PULL UP!", W / 2, H - 40);
    gctx.fillStyle = "#ff4d4d";
    gctx.fillText("PULL UP!", W / 2, H - 40);
    gctx.textAlign = "left";
  }
}

function drawOverlay(title, lines, titleColor = "#00f7ff") {
  gctx.fillStyle = "rgba(2, 6, 23, 0.72)";
  gctx.fillRect(0, 0, W, H);

  gctx.textAlign = "center";
  gctx.font = `600 52px ${FONT}`;
  gctx.shadowColor = titleColor;
  gctx.shadowBlur = 24;
  gctx.fillStyle = titleColor;
  gctx.fillText(title, W / 2, H / 2 - 50);
  gctx.shadowBlur = 0;

  gctx.font = `400 17px ${FONT}`;
  lines.forEach((line, i) => {
    gctx.fillStyle = i === lines.length - 1 && Math.floor(frameCount / 30) % 2 ? "rgba(230, 253, 255, 0.45)" : "#e6fdff";
    gctx.fillText(line, W / 2, H / 2 + 5 + i * 30);
  });

  gctx.textAlign = "left";
}

function draw() {
  gctx.clearRect(0, 0, W, H);

  if (!assetsReady) {
    gctx.fillStyle = "#020617";
    gctx.fillRect(0, 0, W, H);
    gctx.fillStyle = assetsError ? "#ff5e5e" : "#00f7ff";
    gctx.font = `400 20px ${FONT}`;
    gctx.textAlign = "center";
    gctx.fillText(assetsError || "Loading...", W / 2, H / 2);
    gctx.textAlign = "left";
    return;
  }

  gctx.save();
  if (shake > 0) {
    gctx.translate(rand(-shake, shake) * 0.6, rand(-shake, shake) * 0.6);
  }

  drawBackground();
  drawObstacles();
  drawPickups();
  drawEnemies();
  drawShip();
  drawProjectiles();
  drawLowAltitudeWarning();

  gctx.restore();

  if (hitFlash > 0) {
    gctx.fillStyle = `rgba(255, 30, 30, ${0.3 * (hitFlash / 14)})`;
    gctx.fillRect(0, 0, W, H);
  }

  if (state === "ready") {
    // idle ship hovering on the title screen
    player.y = H * 0.38 + Math.sin(frameCount * 0.05) * 10;
    drawOverlay("MINI WORLD", [
      "Gravity is always pulling you down — keep thrusting to stay airborne.",
      "SPACE / ↑ thrust   ← → move   F shoot   P pause",
      "Click or press ENTER to start"
    ]);
    return;
  }

  drawHUD();

  if (state === "paused") {
    drawOverlay("PAUSED", ["Click or press P to resume"]);
  } else if (state === "over") {
    drawOverlay("GAME OVER", [
      `Score ${Math.floor(score)}   ·   Distance ${Math.floor(distance)}m   ·   Time ${formatTime(playTime)}`,
      newBest ? "★ NEW BEST SCORE ★" : `Best ${hiScore}`,
      "Click, ENTER or R to fly again"
    ], "#ff3c3c");
  }
}

// ==========================
// LOOP
// ==========================
let lastTime = performance.now();

function loop(now) {
  // dt is measured in 60fps "frames" so speed is identical on 60/120/144Hz screens
  const dt = clamp((now - lastTime) / (1000 / 60), 0, 3);
  lastTime = now;

  if (assetsReady) update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
