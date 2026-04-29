const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resize();
window.addEventListener("resize", resize);

// 🔵 bubbles
const bubbles = [];

for (let i = 0; i < 40; i++) {
  bubbles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 4 + 1,
    speed: Math.random() * 0.5 + 0.2,
    alpha: Math.random() * 0.5 + 0.2
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // bubbles
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

    ctx.fillStyle = `hsla(${200 + Math.sin(b.y * 0.01) * 50}, 100%, 60%, ${b.alpha})`;
    ctx.fill();

    b.y -= b.speed * (b.r / 3);

    if (b.y < 0) {
      b.y = window.innerHeight;
      b.x = Math.random() * window.innerWidth;
    }
  });

  // 🔥 CONNECTION LINES (moved inside animate)
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const dx = bubbles[i].x - bubbles[j].x;
      const dy = bubbles[i].y - bubbles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.strokeStyle = "rgba(0,247,255,0.05)";
        ctx.beginPath();
        ctx.moveTo(bubbles[i].x, bubbles[i].y);
        ctx.lineTo(bubbles[j].x, bubbles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();