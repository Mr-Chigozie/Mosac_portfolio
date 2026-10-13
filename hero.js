(function () {
  const isMobile = window.innerWidth < 768;
  let mouse = { x: 0, y: 0 };
  let lines = [];
  let assembleSpeed = 0.1;
  let targetSpeed = 0.1;
  const actions = document.querySelector(".hero-actions");

  const hero = document.getElementById("hero");
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  const svg = document.getElementById("stickSVG");

  if (!isMobile) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  // 🔥 CANVAS SETUP & CSS DIMENSIONS
  let cssWidth = 0;
  let cssHeight = 0;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    cssWidth = rect.width;
    cssHeight = rect.height;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const skills = isMobile
    ? ["React", "Node", "JS"]
    : ["React", "Node", "Express", "MongoDB", "JS", "CSS"];

  class SkillParticle {
    constructor(word, i) {
      this.word = word;

      this.x = Math.random() * cssWidth;
      this.y = Math.random() * cssHeight;

      this.tx = this.x;
      this.ty = this.y;

      this.mode = "scatter";

      this.orbitCenterX = cssWidth / 2;
      this.orbitCenterY = cssHeight / 2;

      this.radius = 60 + Math.random() * 140;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 0.01 + Math.random() * 0.02;

      // 🔥 True centering based on CSS width and item spacing
      const spacing = isMobile ? 90 : 130;
      this.alignX = cssWidth / 2 - ((skills.length - 1) * spacing) / 2 + (i * spacing);

      const rect = actions.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const buttonTop = rect.top - heroRect.top;

      this.alignY = buttonTop - 40;  

      this.vx = 0;
      this.vy = 0;
    }

    update() {
      if (this.mode === "orbit") {
        this.angle += this.speed;
        this.tx = this.orbitCenterX + Math.cos(this.angle) * this.radius;
        this.ty = this.orbitCenterY + Math.sin(this.angle) * this.radius;
        this.x += (this.tx - this.x) * 0.08;
        this.y += (this.ty - this.y) * 0.08;
      }
      else if (this.mode === "align") {
        this.x += (this.tx - this.x) * 0.1;
        this.y += (this.ty - this.y) * 0.1;
      }
      else if (this.mode === "scatter") {
        this.x += this.vx;
        this.y += this.vy;

        if (!isMobile) {
          this.vx += (Math.random() - 0.5) * 0.05;
          this.vy += (Math.random() - 0.5) * 0.05;
        }

        if (this.x < 0 || this.x > cssWidth) this.vx *= -1;
        if (this.y < 0 || this.y > cssHeight) this.vy *= -1;

        this.vx *= 0.995;
        this.vy *= 0.995;
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = "#00f7ff";
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.textAlign = "center"; // 🔥 Centers each word precisely at its X coordinate
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#00f7ff";
      ctx.shadowBlur = 10;
      
      ctx.fillText(this.word, Math.round(this.x), Math.round(this.y));
      ctx.restore();
    }

    align() {
      this.mode = "align";
      const rect = actions.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const buttonTop = rect.top - heroRect.top;

      this.tx = this.alignX;
      this.ty = buttonTop - (isMobile ? 45 : 65); 
      this.vx = 0;
      this.vy = 0;
    }

    scatter() {
      this.mode = "scatter";
      this.x = Math.random() * cssWidth;
      this.y = Math.random() * cssHeight;
      this.vx = (Math.random() - 0.5) * 5;
      this.vy = (Math.random() - 0.5) * 5;

      if (!isMobile) {
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  let skillParticles = skills.map((skill, i) => new SkillParticle(skill, i));

  function animate() {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    skillParticles.forEach(p => {
      p.update();
      p.draw();
    });
    if (isMobile) {
      setTimeout(animate, 30);
    } else {
      requestAnimationFrame(animate);
    }
  }

  animate();

  // 🔥 STICK FONT
  const stickFont = {
    A: [[0, 60, 20, 0], [20, 0, 40, 60], [10, 35, 30, 35]],
    B: [[0, 0, 0, 60], [0, 0, 35, 0], [35, 0, 35, 30], [35, 30, 0, 30], [35, 30, 35, 60], [35, 60, 0, 60]],
    C: [[40, 0, 0, 0], [0, 0, 0, 60], [0, 60, 40, 60]],
    H: [[0, 0, 0, 60], [40, 0, 40, 60], [0, 30, 40, 30]],
    I: [[20, 0, 20, 60]],
    O: [[0, 0, 40, 0], [40, 0, 40, 60], [40, 60, 0, 60], [0, 60, 0, 0]],
    Z: [[0, 0, 40, 0], [40, 0, 0, 60], [0, 60, 40, 60]],
    E: [[40, 0, 0, 0], [0, 0, 0, 60], [0, 30, 30, 30], [0, 60, 40, 60]],
    F: [[0, 0, 0, 60], [0, 0, 40, 0], [0, 30, 30, 30]],
    L: [[0, 0, 0, 60], [0, 60, 40, 60]],
    S: [[40, 0, 0, 0], [0, 0, 0, 30], [0, 30, 40, 30], [40, 30, 40, 60], [40, 60, 0, 60]],
    T: [[0, 0, 40, 0], [20, 0, 20, 60]],
    D: [[0, 0, 0, 60], [0, 0, 40, 20], [40, 20, 40, 40], [40, 40, 0, 60]],
    V: [[0, 0, 20, 60], [20, 60, 40, 0]],
    P: [[0, 60, 0, 0], [0, 0, 40, 0], [40, 0, 40, 30], [40, 30, 0, 30]],
    R: [[0, 0, 0, 60], [0, 0, 35, 0], [35, 0, 35, 30], [35, 30, 0, 30], [0, 30, 35, 60]],
    M: [[0, 60, 0, 0], [0, 0, 20, 30], [20, 30, 40, 0], [40, 0, 40, 60]],
    Y: [[0, 0, 20, 30], [40, 0, 20, 30], [20, 30, 20, 60]],
    G: [[40, 0, 0, 0], [0, 0, 0, 60], [0, 60, 40, 60], [40, 60, 40, 35], [40, 35, 20, 35]],
    U: [[0, 0, 0, 60], [0, 60, 40, 60], [40, 60, 40, 0]],
    N: [[0, 60, 0, 0], [0, 0, 40, 60], [40, 60, 40, 0]],
    K: [[0, 0, 0, 60], [0, 30, 40, 0], [0, 30, 40, 60]],
  };

  function drawStickText(text, startY) {
    const letterWidth = isMobile ? 45 : 60;
    const textWidth = text.length * letterWidth;
    let x = (1600 - textWidth) / 2;  

    text.split("").forEach((letterChar, letterIndex) => {
      if (letterChar === " ") {
        x += letterWidth * 0.6;
        return;
      }

      const shape = stickFont[letterChar];
      if (!shape) {
        x += letterWidth;
        return;
      }

      shape.forEach((seg, i) => {
        if (isMobile && i % 2 !== 0) return;

        const x1 = seg[0] + x;
        const y1 = seg[1] + startY;
        const x2 = seg[2] + x;
        const y2 = seg[3] + startY;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        svg.appendChild(line);

        const lineObj = {
          el: line,
          x1, y1, x2, y2,
          cx1: x1,
          cy1: y1,
          cx2: x2,
          cy2: y2,
          tx1: x1,
          ty1: y1,
          tx2: x2,
          ty2: y2,
          vx: 0,
          vy: 0,
          wanderFactor: 0.5 + Math.random(),
          drifting: false
        };

        lines.push(lineObj);
      });
      x += letterWidth;
    });
  }

  function animateLines() {
    if (!lines[0]?.drifting) {
      assembleSpeed *= 0.9;
      assembleSpeed = Math.max(assembleSpeed, targetSpeed);
    }

    lines.forEach(l => {
      if (l.drifting) {
        l.cx1 += l.vx;
        l.cy1 += l.vy;
        l.cx2 += l.vx;
        l.cy2 += l.vy;

        const base = isMobile ? 0.03 : 0.08;
        const wanderStrength = base * (l.wanderFactor || 1);

        l.vx += (Math.random() - 0.5) * wanderStrength;
        l.vy += (Math.random() - 0.5) * wanderStrength;

        l.vx *= 0.99;
        l.vy *= 0.99;

        const maxSpeed = 2.5;
        l.vx = Math.max(-maxSpeed, Math.min(maxSpeed, l.vx));
        l.vy = Math.max(-maxSpeed, Math.min(maxSpeed, l.vy));

        const midX = (l.cx1 + l.cx2) / 2;
        const midY = (l.cy1 + l.cy2) / 2;
        const margin = 100;

        if (midX < margin) l.vx += 0.2;
        if (midX > 1600 - margin) l.vx -= 0.2;
        if (midY < margin) l.vy += 0.2;
        if (midY > 500 - margin) l.vy -= 0.2;
      } else {
        if (!isMobile) {
          const rect = svg.getBoundingClientRect();
          const scaleX = 1600 / rect.width;
          const scaleY = 500 / rect.height;

          const mouseX = (mouse.x - rect.left) * scaleX;
          const mouseY = (mouse.y - rect.top) * scaleY;

          const mx = (l.cx1 + l.cx2) / 2;
          const my = (l.cy1 + l.cy2) / 2;

          let dx = mx - mouseX;
          let dy = my - mouseY;
          let dist = dx * dx + dy * dy;

          const forceRadius = 120 * 120;

          if (dist < forceRadius) {
            const angle = Math.atan2(dy, dx);
            const push = (120 - Math.sqrt(dist)) * 0.25;

            l.cx1 += Math.cos(angle) * push;
            l.cy1 += Math.sin(angle) * push;
            l.cx2 += Math.cos(angle) * push;
            l.cy2 += Math.sin(angle) * push;
          }
        }

        const ease = Math.pow(assembleSpeed, 1.5);
        l.cx1 += (l.tx1 - l.cx1) * ease;
        l.cy1 += (l.ty1 - l.cy1) * ease;
        l.cx2 += (l.tx2 - l.cx2) * ease;
        l.cy2 += (l.ty2 - l.cy2) * ease;
      }

      l.el.setAttribute("x1", l.cx1);
      l.el.setAttribute("y1", l.cy1);
      l.el.setAttribute("x2", l.cx2);
      l.el.setAttribute("y2", l.cy2);
    });

    requestAnimationFrame(animateLines);
  }

  animateLines();

  function assembleText() {
    lines.forEach(l => {
      l.drifting = false;
      l.vx = 0;
      l.vy = 0;
      l.tx1 = l.x1;
      l.ty1 = l.y1;
      l.tx2 = l.x2;
      l.ty2 = l.y2;
    });

    assembleSpeed = 0.7;
    targetSpeed = 0.06;
  }

  function scatterText() {
    lines.forEach(l => {
      l.cx1 += (Math.random() - 0.5) * 200;
      l.cy1 += (Math.random() - 0.5) * 200;
      l.cx2 += (Math.random() - 0.5) * 200;
      l.cy2 += (Math.random() - 0.5) * 200;

      l.tx1 = Math.random() * 1600;
      l.ty1 = Math.random() * 500;
      l.tx2 = Math.random() * 1600;
      l.ty2 = Math.random() * 500;

      l.vx = (Math.random() - 0.5) * 4;
      l.vy = (Math.random() - 0.5) * 4;
      l.drifting = true;
    });
  }

  let active = false;

  if (isMobile) {
    hero.addEventListener("click", () => {
      active = !active;
      if (active) {
        assembleText();
        skillParticles.forEach(p => p.align());
        svg.classList.add("glow");
      } else {
        scatterText();
        skillParticles.forEach(p => p.scatter());
        svg.classList.remove("glow");
      }
    });
  } else {
    hero.addEventListener("mouseenter", () => {
      assembleText();
      targetSpeed = 0.28;
      assembleSpeed = 0.25;
      skillParticles.forEach(p => p.align());
      svg.classList.add("glow");
    });

    hero.addEventListener("mouseleave", () => {
      scatterText();
      targetSpeed = 0.016;
      skillParticles.forEach(p => p.scatter());
      svg.classList.remove("glow");
    });
  }

  const centerY = 210;  
  drawStickText("CHIGOZIE OZO OFODILE", centerY - 120);
  drawStickText("FULL-STACK DEVELOPER", centerY);
  drawStickText("SCALABLE SYSTEMS AND LOGIC", centerY + 100);

  svg.classList.add("glow");
  skillParticles.forEach(p => p.align());

  setTimeout(() => {
    scatterText();
    skillParticles.forEach(p => p.scatter());
    svg.classList.remove("glow");
    active = false;
  }, 2000);

})();