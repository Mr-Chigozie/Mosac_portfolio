// Disable automatic browser scroll restoration on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Force the window to stay at the top on a fresh load/reload
window.scrollTo(0, 0);

console.log("GAME JS LOADED");
let gameStarted = false;
let monsters = [];
let score = 0;
let lives = 3;
let distance = 0;
let startTime = Date.now();
let gameOver = false;
let hiScore = localStorage.getItem("hiScore") || 0;
let lastHitTime = 0;
const hitCooldown = 1000; // 1 second
const VALID_MONSTERS = [0, 1]; // only safe sprites
const gameCanvas = document.getElementById("gameCanvas");
const gctx = gameCanvas.getContext("2d");
gctx.imageSmoothingEnabled = false;

// ==========================
// CANVAS SETUP
// ==========================
gameCanvas.width = gameCanvas.clientWidth;
gameCanvas.height = gameCanvas.clientHeight;
const GROUND_Y = gameCanvas.height - 42; // tweak this visually
console.log("SIZE:", gameCanvas.width, gameCanvas.height);

// make canvas focusable
gameCanvas.setAttribute("tabindex", "0");

// ==========================
// SCROLL LOCK (ONLY IN GAME)
// ==========================
gameCanvas.addEventListener("mouseenter", () => {
  document.body.classList.add("no-scroll");
  gameCanvas.focus({ preventScroll: true });
});

gameCanvas.addEventListener("mouseleave", () => {
  document.body.classList.remove("no-scroll");
});

window.addEventListener("keydown", (e) => {
  if (["Space", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
    e.preventDefault(); // 🔥 Prevent default page jump globally for game inputs
  }

  if (e.key === "Enter" && !gameStarted) {
    gameStarted = true;
    baseY = gameCanvas.height / 2; 
    gameCanvas.focus({ preventScroll: true });
  }
});

// ==========================
// IMAGES
// ==========================
const bgImage = new Image();
bgImage.src = "images/backg.png";

const playerImg = new Image();
playerImg.src = "images/ships.png";

const obstacleImg = new Image();
obstacleImg.src = "images/barrs.png";

const monsterImg = new Image();
monsterImg.src = "images/blame.png";

let monsterFrameWidth, monsterFrameHeight;

monsterImg.onload = () => {
  monsterFrameWidth = monsterImg.width / 4;
  monsterFrameHeight = monsterImg.height / 4;
  checkLoaded(); 
};

obstacleImg.onload = () => {
  obstacleFrameWidth = 256;  
  obstacleFrameHeight = 256;
  console.log("Obstacle loaded:", obstacleImg.width, obstacleImg.height);
  checkLoaded(); 
};

// ==========================
// SPRITE CONFIG
// ==========================
const GAME_SPRITE_COLS = 4;
const GAME_SPRITE_ROWS = 3;

let frameWidth, frameHeight;

// ==========================
// INPUT SYSTEM (FIXED)
// ==========================
const keys = {};

gameCanvas.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault();
  }

  console.log("KEY PRESS:", e.key);
  keys[e.key] = true;

  // shooting
  if (e.key === "f") {
    bullets.push({
      x: player.x + player.size,
      y: player.y + player.size * 0.6,
      speed: 8
    });
  }

  if (e.key === "r" && gameOver) {
    location.reload();
  }
});

gameCanvas.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ==========================
// PLAYER
// ==========================
const player = {
  x: 100,
  y: gameCanvas.height / 2, 
  size: 100,

  vx: 0,
  vy: 0,

  speed: 0.4,        
  vSpeed: 0.6,       
  maxSpeed: 5,

  friction: 0.95,

  gravity: 0,        
  jumpForce: 0,      

  frame: 0
};

const LANES = [
  gameCanvas.height - 120, 
  gameCanvas.height / 2,   
  80                       
];

function getRandomLane() {
  return LANES[Math.floor(Math.random() * LANES.length)];
}

const playerPadding = 25;
const obstaclePadding = 20;
let boostOffset = 0;

let boostVelocity = 0;
let boostPhase = "idle"; 
let holdTimer = 0;

let baseY = player.y;   
let isBoosting = false;

// ==========================
// BACKGROUND
// ==========================
let bgX = 0;
const bgSpeed = 0.5;

// ==========================
// BULLETS
// ==========================
let bullets = [];
let obstacles = [];
let spawnTimer = 0;

const OBSTACLE_COLS = 4;
const OBSTACLE_ROWS = 3;

let obstacleFrameWidth, obstacleFrameHeight;

// ==========================
// UPDATE
// ==========================
function update() {
  if (!gameStarted) return;
  if (gameOver) return;

  distance += 0.05;
  score += 0.1;

  if (score > hiScore) {
    hiScore = Math.floor(score);
    localStorage.setItem("hiScore", hiScore);
  }

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  window.timeText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  bgX -= bgSpeed;
  if (bgX <= -gameCanvas.width) bgX += gameCanvas.width;

  if (keys["ArrowUp"]) {
    baseY -= 2;
  }

  if (keys["ArrowDown"]) {
    baseY += 2;
  }

  if (keys[" "] && boostPhase === "idle") {
    boostPhase = "up";
    boostVelocity = -8;
  }

  if (boostPhase === "up") {
    boostVelocity += 0.3;
    boostOffset += boostVelocity;

    if (boostVelocity >= 0) {
      boostPhase = "hold";
      holdTimer = 12;
    }
  } else if (boostPhase === "hold") {
    holdTimer--;

    if (holdTimer <= 0) {
      boostPhase = "down";
    }
  } else if (boostPhase === "down") {
    boostVelocity += 0.15;
    boostOffset += boostVelocity;

    if (boostOffset >= 0) {
      boostOffset = 0;
      boostVelocity = 0;
      boostPhase = "idle";
    }
  }

  player.y = baseY + boostOffset;

  if (keys["ArrowRight"]) player.vx += player.speed;
  if (keys["ArrowLeft"]) player.vx -= player.speed;

  player.vx = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.vx));
  player.vx *= player.friction;
  player.x += player.vx;

  player.x = Math.max(0, Math.min(gameCanvas.width - player.size, player.x));

  if (player.y < 0) player.y = 0;

  if (player.y >= GROUND_Y - player.size) {
    player.y = GROUND_Y - player.size;
  }

  bullets.forEach(b => b.x += b.speed);
  bullets = bullets.filter(b => b.x < gameCanvas.width);

  spawnTimer++;

  if (spawnTimer > 100) {
    spawnTimer = 0;
    const type = Math.random();

    if (type < 0.65) {
      const h = 80 + Math.random() * 40;
      obstacles.push({
        x: gameCanvas.width,
        y: GROUND_Y - h - 2,
        width: 80 + Math.random() * 40,
        height: 80 + Math.random() * 40,
        speed: 3,
        frame: Math.floor(Math.random() * OBSTACLE_COLS),
        health: 3
      });
    } else {
      monsters.push({
        x: gameCanvas.width,
        y: Math.random() * (gameCanvas.height - 120),
        width: 90,
        height: 90,
        speed: 2.5,
        type: VALID_MONSTERS[Math.floor(Math.random() * VALID_MONSTERS.length)],
        frameTick: 0
      });
    }
  }

  obstacles.forEach(o => {
    o.x -= o.speed;
  });

  obstacles = obstacles.filter(o => o.x + o.width > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    const hit =
      player.x + playerPadding < o.x + o.width - obstaclePadding &&
      player.x + player.size - playerPadding > o.x + obstaclePadding &&
      player.y + playerPadding < o.y + o.height - obstaclePadding &&
      player.y + player.size - playerPadding > o.y + obstaclePadding;

    if (hit) {
      const now = Date.now();
      if (now - lastHitTime > hitCooldown) {
        obstacles.splice(i, 1);
        lives--;
        lastHitTime = now;

        console.log("HIT! Lives:", lives);

        if (lives <= 0) {
          gameOver = true;
        }
      }
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];

    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const hit =
        b.x < o.x + o.width &&
        b.x + 10 > o.x &&
        b.y < o.y + o.height &&
        b.y + 4 > o.y;

      if (hit) {
        bullets.splice(j, 1);
        o.health--;

        console.log("Hit obstacle! HP:", o.health);

        if (o.health <= 0) {
          obstacles.splice(i, 1);
          score += 20;
          console.log("💥 destroyed!");
        }
        break;
      }
    }
  }

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];

    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const hit =
        b.x < m.x + m.width &&
        b.x + 10 > m.x &&
        b.y < m.y + m.height &&
        b.y + 4 > m.y;

      if (hit) {
        bullets.splice(j, 1);
        monsters.splice(i, 1);
        score += 30; 
        console.log("👹 monster destroyed!");
        break;
      }
    }
  }

  monsters.forEach(m => {
    m.x -= m.speed;
  });

  monsters = monsters.filter(m => m.x + m.width > 0);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    const hit =
      player.x + playerPadding < m.x + m.width - obstaclePadding &&
      player.x + player.size - playerPadding > m.x + obstaclePadding &&
      player.y + playerPadding < m.y + m.height - obstaclePadding &&
      player.y + player.size - playerPadding > m.y + obstaclePadding;

    if (hit) {
      const now = Date.now();

      if (now - lastHitTime > hitCooldown) {
        monsters.splice(i, 1); 
        lives--;
        lastHitTime = now;

        console.log("👹 HIT BY MONSTER! Lives:", lives);

        if (lives <= 0) {
          gameOver = true;
        }
      }
    }
  }
}

// ==========================
// DRAW
// ==========================
function draw() {
  if (!gameStarted) {
    gctx.fillStyle = "black";
    gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    gctx.fillStyle = "white";
    gctx.font = "30px Arial";
    gctx.textAlign = "center";

    gctx.fillText("PRESS ENTER TO START", gameCanvas.width / 2, gameCanvas.height / 2);
    return;
  }

  gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  gctx.fillStyle = "#02121f";
  gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gctx.drawImage(bgImage, bgX, 0, gameCanvas.width, gameCanvas.height);
  gctx.drawImage(bgImage, bgX + gameCanvas.width, 0, gameCanvas.width, gameCanvas.height);

  if (frameWidth && frameHeight) {
    const col = player.frame % GAME_SPRITE_COLS;
    const row = Math.floor(player.frame / GAME_SPRITE_COLS);

    gctx.drawImage(
      playerImg,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      player.x,
      player.y,
      player.size,
      player.size
    );
  }

  if (Date.now() - lastHitTime < 200) {
    gctx.fillStyle = "rgba(255,0,0,0.25)";
    gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  }

  gctx.fillStyle = "#00f7ff";
  bullets.forEach(b => {
    gctx.fillRect(b.x, b.y, 10, 4);
  });

  if (obstacleImg.complete && obstacleFrameWidth && obstacleFrameHeight) {
    obstacles.forEach(o => {
      const col = o.frame;
      const row = 0;
      const padX = 12;
      const padY = 20;

      const srcX = col * obstacleFrameWidth + padX;
      const srcY = row * obstacleFrameHeight + padY;
      const srcW = obstacleFrameWidth - padX * 2;
      const srcH = obstacleFrameHeight - padY - 4;

      gctx.drawImage(
        obstacleImg,
        Math.floor(srcX),
        Math.floor(srcY),
        Math.floor(srcW),
        Math.floor(srcH),
        Math.floor(o.x),
        Math.floor(o.y),
        Math.floor(o.width),
        Math.floor(o.height)
      );
    });
  }

  if (monsterFrameWidth && monsterFrameHeight) {
    const MONSTER_PADDING = {
      0: { left: 10, right: 14 },
      1: { left: 10, right: 14 },
      2: { left: 2, right: 6 },  
      3: { left: 10, right: 14 }
    };

    monsters.forEach(m => {
      const col = m.type % 4;
      const row = 0;
      const pad = MONSTER_PADDING[m.type] || MONSTER_PADDING[0];

      const srcX = col * monsterFrameWidth + pad.left;
      const srcY = row * monsterFrameHeight + 8;
      const srcW = monsterFrameWidth - pad.left - pad.right;
      const srcH = monsterFrameHeight - 8 - 12;

      gctx.drawImage(
        monsterImg,
        Math.floor(srcX),
        Math.floor(srcY),
        Math.floor(srcW),
        Math.floor(srcH),
        Math.floor(m.x),
        Math.floor(m.y),
        Math.floor(m.width),
        Math.floor(m.height)
      );
    });
  }

  gctx.fillStyle = "rgba(0,0,0,0.4)";
  gctx.fillRect(0, 0, gameCanvas.width, 50);

  gctx.fillStyle = "#00f7ff";
  gctx.font = "bold 18px Arial";
  gctx.textAlign = "right";

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const hudText =
    `Score: ${Math.floor(score)}   ` +
    `Lives: ${lives}   ` +
    `Time: ${timeText}   ` +
    `Distance: ${Math.floor(distance)}   ` +
    `Hi-score: ${hiScore}`;

  gctx.fillText(hudText, gameCanvas.width - 20, 30);
  gctx.textAlign = "left";

  if (gameOver) {
    gctx.fillStyle = "rgba(0,0,0,0.7)";
    gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    gctx.fillStyle = "#ff3c3c";
    gctx.font = "bold 50px Arial";
    gctx.textAlign = "center";

    gctx.fillText("GAME OVER", gameCanvas.width / 2, gameCanvas.height / 2);

    gctx.font = "20px Arial";
    gctx.fillText(
      "Press R to restart",
      gameCanvas.width / 2,
      gameCanvas.height / 2 + 40
    );

    gctx.textAlign = "left";
  }
}

// ==========================
// LOOP
// ==========================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ==========================
// ANIMATION
// ==========================
setInterval(() => {
  player.frame = (player.frame + 1) % (GAME_SPRITE_COLS * GAME_SPRITE_ROWS);
}, 120);

// ==========================
// LOAD CONTROL
// ==========================
let loaded = 0;

function checkLoaded() {
  loaded++;
  if (loaded === 4) {
    console.log("ALL LOADED");
    // Removed automatic gameCanvas.focus() here so it won't force the page to snap down on load
    loop();
  }
}

bgImage.onload = checkLoaded;

playerImg.onload = () => {
  frameWidth = playerImg.width / GAME_SPRITE_COLS;
  frameHeight = playerImg.height / GAME_SPRITE_ROWS;
  checkLoaded();
};

playerImg.onerror = () => {
  console.log("SHIP IMAGE FAILED TO LOAD ❌");
};