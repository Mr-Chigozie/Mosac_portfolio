(function () {

  const isMobile = window.innerWidth < 768
  // 🔥 STATE
  let mouse = { x: 0, y: 0 }
  let lineIndex = 0
  let letters = []
  let lines = []
  let assembleSpeed = 0.1
  let targetSpeed = 0.1
  const actions = document.querySelector(".hero-actions")





  const hero = document.getElementById("hero")
  const canvas = document.getElementById("heroCanvas")
  const ctx = canvas.getContext("2d")
  const svg = document.getElementById("stickSVG")

  // 🔥 MOUSE TRACK
  // window.addEventListener("mousemove", (e) => {
  //   mouse.x = e.clientX
  //   mouse.y = e.clientY
  // })

  if (!isMobile) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    })
  }

  // 🔥 CANVAS SETUP
  function resizeCanvas() {
    const rect = hero.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resizeCanvas()
  window.addEventListener("resize", resizeCanvas);





  const SPRITE_COLS = 4
  const SPRITE_ROWS = 4

  const SPRITE_W = 256   // adjust if needed
  const SPRITE_H = 256




  const skills = isMobile
    ? ["React", "Node", "JS"]
    : ["React", "Node", "Express", "MongoDB", "JS", "CSS"]

  class SkillParticle {
    constructor(word, i) {
      this.word = word

      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height

      this.tx = this.x
      this.ty = this.y

      this.mode = "scatter"

      this.orbitCenterX = canvas.width / 2
      this.orbitCenterY = canvas.height / 2

      this.radius = 60 + Math.random() * 140
      this.angle = Math.random() * Math.PI * 2
      this.speed = 0.01 + Math.random() * 0.02

      this.alignX = canvas.width / 2 - (skills.length * 120) / 2 + i * 120
      const rect = actions.getBoundingClientRect()
      const heroRect = hero.getBoundingClientRect()

      // convert DOM → canvas space
      const buttonTop = rect.top - heroRect.top

      this.alignY = buttonTop - 40   // 🔥 40px gap above buttons

      this.vx = 0
      this.vy = 0
    }

    update() {

      // 🟢 ORBIT
      if (this.mode === "orbit") {
        this.angle += this.speed

        this.tx = this.orbitCenterX + Math.cos(this.angle) * this.radius
        this.ty = this.orbitCenterY + Math.sin(this.angle) * this.radius

        this.x += (this.tx - this.x) * 0.08
        this.y += (this.ty - this.y) * 0.08
      }

      // 🔵 ALIGN
      else if (this.mode === "align") {
        this.x += (this.tx - this.x) * 0.1
        this.y += (this.ty - this.y) * 0.1
      }

      // 🔴 SCATTER (cleaned)
      else if (this.mode === "scatter") {

        // movement
        this.x += this.vx
        this.y += this.vy

        // 🔥 randomness ONLY on desktop
        if (!isMobile) {
          this.vx += (Math.random() - 0.5) * 0.05
          this.vy += (Math.random() - 0.5) * 0.05
        }

        // bounce edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // smooth slowdown
        this.vx *= 0.995
        this.vy *= 0.995
      }
    }

    draw() {
      ctx.fillStyle = "#00f7ff"
      ctx.font = "16px JetBrains Mono"
      ctx.shadowColor = "#00f7ff"
      ctx.shadowBlur = 10

      // 🔥 pixel snap (removes micro jitter)
      ctx.fillText(this.word, Math.round(this.x), Math.round(this.y))

      ctx.shadowBlur = 0
    }


    align() {
      this.mode = "align"

      const rect = actions.getBoundingClientRect()
      const heroRect = hero.getBoundingClientRect()

      const buttonTop = rect.top - heroRect.top

      this.tx = this.alignX
      this.ty = buttonTop - (isMobile ? 50 : 70) // 🔥 safe gap

      this.vx = 0
      this.vy = 0
    }

    scatter() {
      this.mode = "scatter"

      // 🔥 scatter anywhere on screen
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height

      // 🔥 strong initial burst
      this.vx = (Math.random() - 0.5) * 5
      this.vy = (Math.random() - 0.5) * 5

      if (!isMobile) {
        this.vx += (Math.random() - 0.5) * 0.05
        this.vy += (Math.random() - 0.5) * 0.05
      }
    }
  }

  let skillParticles = []

  skills.forEach((skill, i) => {
    skillParticles.push(new SkillParticle(skill, i))
  })

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)







    skillParticles.forEach(p => {
      p.update()
      p.draw()
    })
    if (isMobile) {
      setTimeout(animate, 30) // ~30 FPS
    } else {
      requestAnimationFrame(animate)
    }
  }

  animate();



  // 🔥 STICK FONT
  const stickFont = {
    A: [
      [0, 60, 20, 0],
      [20, 0, 40, 60],
      [10, 35, 30, 35]
    ],
    B: [
      [0, 0, 0, 60],
      [0, 0, 35, 0],
      [35, 0, 35, 30],
      [35, 30, 0, 30],
      [35, 30, 35, 60],
      [35, 60, 0, 60]
    ],
    C: [
      [40, 0, 0, 0],
      [0, 0, 0, 60],
      [0, 60, 40, 60]
    ],

    H: [
      [0, 0, 0, 60],
      [40, 0, 40, 60],
      [0, 30, 40, 30]
    ],

    I: [
      [20, 0, 20, 60]
    ],

    O: [
      [0, 0, 40, 0],
      [40, 0, 40, 60],
      [40, 60, 0, 60],
      [0, 60, 0, 0]
    ],

    Z: [
      [0, 0, 40, 0],
      [40, 0, 0, 60],
      [0, 60, 40, 60]
    ],

    E: [
      [40, 0, 0, 0],
      [0, 0, 0, 60],
      [0, 30, 30, 30],
      [0, 60, 40, 60]
    ],

    F: [
      [0, 0, 0, 60],
      [0, 0, 40, 0],
      [0, 30, 30, 30]
    ],

    L: [
      [0, 0, 0, 60],
      [0, 60, 40, 60]
    ],

    S: [
      [40, 0, 0, 0],
      [0, 0, 0, 30],
      [0, 30, 40, 30],
      [40, 30, 40, 60],
      [40, 60, 0, 60]
    ],

    T: [
      [0, 0, 40, 0],
      [20, 0, 20, 60]
    ],

    D: [
      [0, 0, 0, 60],
      [0, 0, 40, 20],
      [40, 20, 40, 40],
      [40, 40, 0, 60]
    ],

    V: [
      [0, 0, 20, 60],
      [20, 60, 40, 0]
    ],

    P: [
      [0, 60, 0, 0],
      [0, 0, 40, 0],
      [40, 0, 40, 30],
      [40, 30, 0, 30]
    ],

    R: [
      [0, 0, 0, 60],
      [0, 0, 35, 0],
      [35, 0, 35, 30],
      [35, 30, 0, 30],
      [0, 30, 35, 60]
    ],

    M: [
      [0, 60, 0, 0],
      [0, 0, 20, 30],
      [20, 30, 40, 0],
      [40, 0, 40, 60]
    ],

    Y: [
      [0, 0, 20, 30],
      [40, 0, 20, 30],
      [20, 30, 20, 60]
    ],
    G: [
      [40, 0, 0, 0],
      [0, 0, 0, 60],
      [0, 60, 40, 60],
      [40, 60, 40, 35],
      [40, 35, 20, 35]
    ],

    U: [
      [0, 0, 0, 60],
      [0, 60, 40, 60],
      [40, 60, 40, 0]
    ],

    N: [
      [0, 60, 0, 0],
      [0, 0, 40, 60],
      [40, 60, 40, 0]
    ],

    K: [
      [0, 0, 0, 60],
      [0, 30, 40, 0],
      [0, 30, 40, 60]
    ],
  }

  // 🔥 DRAW TEXT
  function drawStickText(text, startY) {

    const letterWidth = isMobile ? 45 : 60
    const textWidth = text.length * letterWidth

    let x = (1600 - textWidth) / 2   // 🔥 FIXED coordinate system

    text.split("").forEach((letterChar, letterIndex) => {

      if (letterChar === " ") {
        x += letterWidth * 0.6
        return
      }

      const shape = stickFont[letterChar]
      if (!shape) {
        x += letterWidth
        return
      }

      let letterObj = {
        lines: [],
        delay: letterIndex * 180
      }

      shape.forEach((seg, i) => {

        if (isMobile && i % 2 !== 0) return

        const x1 = seg[0] + x
        const y1 = seg[1] + startY
        const x2 = seg[2] + x
        const y2 = seg[3] + startY

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        )

        svg.appendChild(line)

        const lineObj = {
          el: line,

          x1, y1, x2, y2,

          cx1: Math.random() * 1600,
          cy1: Math.random() * 500,
          cx2: Math.random() * 1600,
          cy2: Math.random() * 500,

          tx1: Math.random() * 1600,
          ty1: Math.random() * 500,
          tx2: Math.random() * 1600,
          ty2: Math.random() * 500,

          vx: 0,
          vy: 0,
          wanderFactor: 0.5 + Math.random(), // 🔥 ADD THIS
          drifting: false
        }

        letterObj.lines.push(lineObj)
        lines.push(lineObj)

      })

      letters.push(letterObj)
      x += letterWidth
    })
  }
  // 🔥 ANIMATE LINES

  function animateLines() {

    // 🔥 ONLY decay speed when assembling
    if (!lines[0]?.drifting) {
      assembleSpeed *= 0.9
      assembleSpeed = Math.max(assembleSpeed, targetSpeed)
    }

    lines.forEach(l => {

      // 🔴 SCATTER MODE (WANDERING SYSTEM)
      // 🔴 SCATTER MODE (WANDERING SYSTEM)
      if (l.drifting) {

        // movement
        l.cx1 += l.vx
        l.cy1 += l.vy
        l.cx2 += l.vx
        l.cy2 += l.vy

        // 🔥 per-line variation
        const base = isMobile ? 0.03 : 0.08
        const wanderStrength = base * (l.wanderFactor || 1)

        l.vx += (Math.random() - 0.5) * wanderStrength
        l.vy += (Math.random() - 0.5) * wanderStrength

        // 🔥 REMOVE center pull ❌
        const midX = (l.cx1 + l.cx2) / 2
        const midY = (l.cy1 + l.cy2) / 2

        // 🔥 soft damping
        l.vx *= 0.99
        l.vy *= 0.99

        // 🔥 clamp speed
        const maxSpeed = 2.5
        l.vx = Math.max(-maxSpeed, Math.min(maxSpeed, l.vx))
        l.vy = Math.max(-maxSpeed, Math.min(maxSpeed, l.vy))

        // 🔥 edge containment (replaces center gravity)
        const margin = 100

        if (midX < margin) l.vx += 0.2
        if (midX > 1600 - margin) l.vx -= 0.2

        if (midY < margin) l.vy += 0.2
        if (midY > 500 - margin) l.vy -= 0.2
      }

      // 🟢 ASSEMBLE MODE
      else {

        if (!isMobile) {

          const rect = svg.getBoundingClientRect()

          const scaleX = 1600 / rect.width
          const scaleY = 500 / rect.height

          const mouseX = (mouse.x - rect.left) * scaleX
          const mouseY = (mouse.y - rect.top) * scaleY

          const mx = (l.cx1 + l.cx2) / 2
          const my = (l.cy1 + l.cy2) / 2

          let dx = mx - mouseX
          let dy = my - mouseY
          let dist = dx * dx + dy * dy

          const forceRadius = 120 * 120

          if (dist < forceRadius) {
            const angle = Math.atan2(dy, dx)
            const push = (120 - Math.sqrt(dist)) * 0.25

            l.cx1 += Math.cos(angle) * push
            l.cy1 += Math.sin(angle) * push
            l.cx2 += Math.cos(angle) * push
            l.cy2 += Math.sin(angle) * push
          }
        }

        // easing
        const ease = Math.pow(assembleSpeed, 1.5)

        l.cx1 += (l.tx1 - l.cx1) * ease
        l.cy1 += (l.ty1 - l.cy1) * ease
        l.cx2 += (l.tx2 - l.cx2) * ease
        l.cy2 += (l.ty2 - l.cy2) * ease
      }

      // apply to SVG
      l.el.setAttribute("x1", l.cx1)
      l.el.setAttribute("y1", l.cy1)
      l.el.setAttribute("x2", l.cx2)
      l.el.setAttribute("y2", l.cy2)

    })

    requestAnimationFrame(animateLines)
  }

  animateLines()




  function assembleText() {
    lines.forEach(l => {
      l.drifting = false
      l.vx = 0
      l.vy = 0

      // 🔥 set targets immediately
      l.tx1 = l.x1
      l.ty1 = l.y1
      l.tx2 = l.x2
      l.ty2 = l.y2
    })

    assembleSpeed = 0.7
    targetSpeed = 0.06
  }

  function scatterText() {
    lines.forEach(l => {

      // 🔥 break instantly from current position
      l.cx1 += (Math.random() - 0.5) * 200
      l.cy1 += (Math.random() - 0.5) * 200
      l.cx2 += (Math.random() - 0.5) * 200
      l.cy2 += (Math.random() - 0.5) * 200

      // 🔥 new random targets
      l.tx1 = Math.random() * 1600
      l.ty1 = Math.random() * 500
      l.tx2 = Math.random() * 1600
      l.ty2 = Math.random() * 500

      // 🔥 strong burst velocity
      l.vx = (Math.random() - 0.5) * 4
      l.vy = (Math.random() - 0.5) * 4

      l.drifting = true
    })
  }

  let active = false

  if (isMobile) {

    // 📱 MOBILE → TAP TO TOGGLE
    hero.addEventListener("click", () => {
      active = !active

      if (active) {
        assembleText()

        skillParticles.forEach(p => p.align())
        svg.classList.add("glow")
      } else {
        scatterText()

        skillParticles.forEach(p => p.scatter())
        svg.classList.remove("glow")
      }
    })

  } else {

    // 🖥 DESKTOP → HOVER
    hero.addEventListener("mouseenter", () => {


      assembleText()
      targetSpeed = 0.28
      assembleSpeed = 0.25

      skillParticles.forEach(p => p.align())
      svg.classList.add("glow")
    })

    hero.addEventListener("mouseleave", () => {


      scatterText()
      targetSpeed = 0.016

      skillParticles.forEach(p => p.scatter())
      svg.classList.remove("glow")
    })

  }

  const centerY = 210  // middle of 500 viewBox

  drawStickText("CHIGOZIE OZO OFODILE", centerY - 120)
  drawStickText("FULL-STACK DEVELOPER", centerY)
  drawStickText("SCALABLE SYSTEMS AND LOGIC", centerY + 100)
  scatterText()

  setTimeout(() => {
    scatterText()
  }, 2000)

})();