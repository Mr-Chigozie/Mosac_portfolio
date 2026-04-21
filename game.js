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
  gameCanvas.focus(); // 🔥 important
});

gameCanvas.addEventListener("mouseleave", () => {
  document.body.classList.remove("no-scroll");
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    gameStarted = true;
    baseY = gameCanvas.height / 2; // 🔥 reset position
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

  checkLoaded(); // ✅ keep loader working
};

obstacleImg.onload = () => {
  obstacleFrameWidth = 256;   // adjust after testing
  obstacleFrameHeight = 256;
  console.log("Obstacle loaded:", obstacleImg.width, obstacleImg.height);
  checkLoaded(); // if you're using loader system
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

  console.log("KEY PRESS:", e.key)

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
// const player = {
//   x: 100,
//   y: gameCanvas.height - 120,
//   size: 100,

//   vx: 0,
//   vy: 0,

//   speed: 0.8,
//   maxSpeed: 5,
//   friction: 0.95,

//   gravity: 0.4,
//   jumpForce: -10,

//   frame: 0
// };

const player = {
  x: 100,
  y: gameCanvas.height / 2, // start centered (feels better for flying)
  size: 100,

  vx: 0,
  vy: 0,

  speed: 0.4,        // horizontal acceleration
  vSpeed: 0.6,       // 🔥 vertical control (separate power)
  maxSpeed: 5,

  friction: 0.95,

  gravity: 0,        // ❌ REMOVE gravity for space
  jumpForce: 0,      // ❌ not needed in flying mode

  frame: 0
};

const LANES = [
  gameCanvas.height - 120, // ground
  gameCanvas.height / 2,   // mid
  80                       // top
];

function getRandomLane() {
  return LANES[Math.floor(Math.random() * LANES.length)];
}

const playerPadding = 25;
const obstaclePadding = 20;
let boostOffset = 0;

let boostVelocity = 0;
let boostPhase = "idle"; // "up", "hold", "down"
let holdTimer = 0;

let baseY = player.y;   // resting position
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

// sprite grid
const OBSTACLE_COLS = 4;
const OBSTACLE_ROWS = 3;

let obstacleFrameWidth, obstacleFrameHeight;



// ==========================
// UPDATE
// ==========================




function update() {
  if (!gameStarted) return;
  if (gameOver) return;

  // ======================
  // PROGRESSION
  // ======================
  distance += 0.05;

  // 🔥 SCORE SYSTEM
  score += 0.1;

  if (score > hiScore) {
    hiScore = Math.floor(score);
    localStorage.setItem("hiScore", hiScore);
  }

  // 🔥 TIME SYSTEM
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  window.timeText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  // ======================
  // BACKGROUND
  // ======================
  bgX -= bgSpeed;
  if (bgX <= -gameCanvas.width) bgX += gameCanvas.width;

  // ======================
  // MOVEMENT
  // ======================
  // ======================
  // 🎮 VERTICAL CONTROL (NEW)
  // ======================
  if (keys["ArrowUp"]) {
    baseY -= 2;
  }

  if (keys["ArrowDown"]) {
    baseY += 2;
  }

  // ======================
  // 🚀 BOOST (SPACE TAP)
  // ======================
  // ======================
  // 🚀 BOOST SYSTEM (FIXED)
  // ======================

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
  }

  else if (boostPhase === "hold") {
    holdTimer--;

    if (holdTimer <= 0) {
      boostPhase = "down";
    }
  }

  else if (boostPhase === "down") {
    boostVelocity += 0.15;
    boostOffset += boostVelocity;

    if (boostOffset >= 0) {
      boostOffset = 0;
      boostVelocity = 0;
      boostPhase = "idle";
    }
  }

  // apply movement
  player.y = baseY + boostOffset;



  // ======================
  // HORIZONTAL MOVEMENT (RESTORE THIS)
  // ======================
  if (keys["ArrowRight"]) player.vx += player.speed;
  if (keys["ArrowLeft"]) player.vx -= player.speed;

  // clamp speed
  player.vx = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.vx));

  // friction
  player.vx *= player.friction;


  player.x += player.vx;


  // ======================
  // BOUNDS
  // ======================


  player.x = Math.max(0, Math.min(gameCanvas.width - player.size, player.x));

  if (player.y < 0) player.y = 0;


  if (player.y >= GROUND_Y - player.size) {
    player.y = GROUND_Y - player.size;
  }



  // ======================
  // BULLETS
  // ======================
  bullets.forEach(b => b.x += b.speed);
  bullets = bullets.filter(b => b.x < gameCanvas.width);

  // ======================
  // OBSTACLES
  // ======================
  spawnTimer++;

  if (spawnTimer > 100) {
    spawnTimer = 0;

    const type = Math.random();

    if (type < 0.65) {
      // 🧱 OBSTACLE (65%)

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
      // 👹 MONSTER (35%)
      monsters.push({
        x: gameCanvas.width,
        y: Math.random() * (gameCanvas.height - 120),
        width: 90,
        height: 90,
        speed: 2.5,
        type: VALID_MONSTERS[Math.floor(Math.random() * VALID_MONSTERS.length)], // ✅ FIX
        frameTick: 0
      });
    }
  }

  obstacles.forEach(o => {
    o.x -= o.speed;
  });

  obstacles = obstacles.filter(o => o.x + o.width > 0);

  // ======================
  // 🔥 COLLISION (WITH COOLDOWN)
  // ======================
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];

    const hit =
      player.x + playerPadding < o.x + o.width - obstaclePadding &&
      player.x + player.size - playerPadding > o.x + obstaclePadding &&
      player.y + playerPadding < o.y + o.height - obstaclePadding &&
      player.y + player.size - playerPadding > o.y + obstaclePadding;

    if (hit) {

      const now = Date.now();

      // only take damage if enough time passed
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

  // ======================
  // 🔥 BULLET vs OBSTACLE
  // ======================
  // ======================
  // 🔥 BULLET vs OBSTACLE (MULTI HIT)
  // ======================
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
        // remove bullet ALWAYS
        bullets.splice(j, 1);

        // reduce health
        o.health--;

        console.log("Hit obstacle! HP:", o.health);

        // only destroy if health is 0
        if (o.health <= 0) {
          obstacles.splice(i, 1);

          // reward player
          score += 20;

          console.log("💥 destroyed!");
        }

        break;
      }
    }
  }

  // ======================
  // 🔥 BULLET vs MONSTER
  // ======================
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

        score += 30; // reward

        console.log("👹 monster destroyed!");
        break;
      }
    }
  }

  //monsters spawning code
  monsters.forEach(m => {
    m.x -= m.speed;


  });

  monsters = monsters.filter(m => m.x + m.width > 0);


  // ======================
  // 👹 PLAYER vs MONSTER
  // ======================
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
        monsters.splice(i, 1); // remove monster
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

  // ======================
  // BACKGROUND
  // ======================
  gctx.fillStyle = "#02121f";
  gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gctx.drawImage(bgImage, bgX, 0, gameCanvas.width, gameCanvas.height);
  gctx.drawImage(bgImage, bgX + gameCanvas.width, 0, gameCanvas.width, gameCanvas.height);



  // ======================
  // PLAYER
  // ======================
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



  // ======================
  // 🔥 HIT FLASH EFFECT
  // ======================
  if (Date.now() - lastHitTime < 200) {
    gctx.fillStyle = "rgba(255,0,0,0.25)";
    gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  }

  // ======================
  // BULLETS
  // ======================
  gctx.fillStyle = "#00f7ff";
  bullets.forEach(b => {
    gctx.fillRect(b.x, b.y, 10, 4);
  });


  // ======================
  // OBSTACLES
  // ======================


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


      // 🟡 DEBUG HITBOX (KEEP THIS)
      // gctx.strokeStyle = "yellow";
      // gctx.strokeRect(
      //   o.x + obstaclePadding,
      //   o.y + obstaclePadding,
      //   o.width - obstaclePadding * 2,
      //   o.height - obstaclePadding * 2
      // );

    });
  }

  if (monsterFrameWidth && monsterFrameHeight) {
    const MONSTER_PADDING = {
      0: { left: 10, right: 14 },
      1: { left: 10, right: 14 },
      2: { left: 2, right: 6 },   // 👈 FIX black demon (less left crop)
      3: { left: 10, right: 14 }
    };

    monsters.forEach(m => {
      const col = m.type % 4;
      const row = 0;

      // 🔥 pull correct padding for this sprite
      const pad = MONSTER_PADDING[m.type] || MONSTER_PADDING[0];

      const padLeft = pad.left;
      const padRight = pad.right;
      const padTop = 8;
      const padBottom = 12;

      const srcX = col * monsterFrameWidth + padLeft;
      const srcY = row * monsterFrameHeight + padTop;

      const srcW = monsterFrameWidth - padLeft - padRight;
      const srcH = monsterFrameHeight - padTop - padBottom;

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

  // ======================
  // 🔥 HUD BAR
  // ======================
  gctx.fillStyle = "rgba(0,0,0,0.4)";
  gctx.fillRect(0, 0, gameCanvas.width, 50);

  gctx.fillStyle = "#00f7ff";
  gctx.font = "bold 18px Arial";
  gctx.textAlign = "right";

  // time
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

  // ======================
  // 🔥 GAME OVER
  // ======================
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
    gameCanvas.focus(); // 🔥 start focused
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