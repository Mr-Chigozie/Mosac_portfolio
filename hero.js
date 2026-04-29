(function () {

  const isMobile = window.innerWidth < 768
  // 🔥 STATE
  let mouse = { x: 0, y: 0 }
  let lineIndex = 0
  let letters = []
  let lines = []
  let assembleSpeed = 0.1
  let targetSpeed = 0.1

  const planetSprite = new Image()
  planetSprite.src = "images/planets.png" // adjust path if needed



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
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resizeCanvas()
  window.addEventListener("resize", resizeCanvas);




  // 🔥 STARS
  class Star {
    constructor() {
      this.reset()
    }

    reset() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 2
      this.speed = 0.2 + Math.random() * 0.5
    }

    update() {
      this.y += this.speed
      if (this.y > canvas.height) this.reset()
    }

    draw() {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(this.x, this.y, this.size, this.size)
    }
  }

  const stars = Array.from({ length: isMobile ? 40 : 120 }, () => new Star());


  const SPRITE_COLS = 4
  const SPRITE_ROWS = 4

  const SPRITE_W = 256   // adjust if needed
  const SPRITE_H = 256

class OrbitPlanet {
  constructor(angle, radius, size) {

    this.angle = angle
    this.radius = radius

    // 🔥 controlled depth (visual only)
    this.depth = Math.random()
    this.size = size * (0.8 + this.depth * 0.4)

    this.mode = "scatter"

    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height

    this.vx = 0
    this.vy = 0

    // 🔥 controlled speed (keeps orbit uniform)
    this.speed = 0.01 * (0.85 + this.depth * 0.3)

    // sprite
    this.spriteIndex = Math.floor(Math.random() * 16)
    this.spriteX = this.spriteIndex % SPRITE_COLS
    this.spriteY = Math.floor(this.spriteIndex / SPRITE_COLS)
  }

  update() {

    // 🔥 SIDE ORBIT POSITION
    const offsetX = isMobile ? 0 : 280
    const offsetY = isMobile ? -120 : -40

    this.centerX = canvas.width / 2 + offsetX
    this.centerY = canvas.height / 2 + offsetY

    // 🟢 ORBIT (FIXED — NO LERP)
    if (this.mode === "orbit") {
      this.angle += this.speed

const aspect = canvas.width / canvas.height

this.x = this.centerX + Math.cos(this.angle) * this.radius * aspect
this.y = this.centerY + Math.sin(this.angle) * this.radius
    }

    // 🔴 SCATTER
    else if (this.mode === "scatter") {

      this.x += this.vx
      this.y += this.vy

      if (!isMobile) {
        this.vx += (Math.random() - 0.5) * 0.04
        this.vy += (Math.random() - 0.5) * 0.04
      }

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1

      this.vx *= 0.995
      this.vy *= 0.995
    }
  }

  draw() {

    ctx.save()

    // 🔥 clean circular mask
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    const pad = 1.5

    ctx.drawImage(
      planetSprite,
      this.spriteX * SPRITE_W,
      this.spriteY * SPRITE_H,
      SPRITE_W,
      SPRITE_H,
      this.x - this.size / 2 + pad,
      this.y - this.size / 2 + pad,
      this.size - pad * 2,
      this.size - pad * 2
    )

    ctx.restore()

    // 🔥 soft shading
    ctx.save()

    const gradient = ctx.createRadialGradient(
      this.x, this.y, this.size * 0.2,
      this.x, this.y, this.size / 2
    )

    gradient.addColorStop(0, "rgba(0,0,0,0)")
    gradient.addColorStop(1, "rgba(0,0,0,0.3)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  orbit() {
    this.mode = "orbit"
    this.vx = 0
    this.vy = 0
  }

  scatter() {
    this.mode = "scatter"

    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height

    this.vx = (Math.random() - 0.5) * 4
    this.vy = (Math.random() - 0.5) * 4
  }
}
 const total = isMobile ? 4 : 8

let orbitPlanets = []

for (let i = 0; i < total; i++) {

  const angle = (i / total) * Math.PI * 2

  // 🔥 clean 2-ring layout
  const ring = i % 2 === 0 ? 0 : 1
  const radius = (isMobile ? 140 : 220) + ring * 50

  orbitPlanets.push(
    new OrbitPlanet(
      angle,
      radius,
      (isMobile ? 35 : 60)
    )
  )
}


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

      this.mode = "orbit"

      this.orbitCenterX = canvas.width / 2
      this.orbitCenterY = canvas.height / 2

      this.radius = 60 + Math.random() * 140
      this.angle = Math.random() * Math.PI * 2
      this.speed = 0.01 + Math.random() * 0.02

      this.alignX = canvas.width / 2 - (skills.length * 120) / 2 + i * 120
      this.alignY = canvas.height / 2 + 200

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

      this.tx = this.alignX
      this.ty = this.alignY

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

    stars.forEach(s => {
      s.update()
      s.draw()
    })



    orbitPlanets.forEach(p => {
      p.update()
      p.draw()
    })

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

    // 🔥 smooth speed ramp (IMPORTANT)
    assembleSpeed += (targetSpeed - assembleSpeed) * 0.2

    lines.forEach(l => {

      // 🔴 SCATTER MODE
      if (l.drifting) {

        // 🔥 ease OUT (faster start, slower end)
        const ease = 0.12 + assembleSpeed * 0.5

        l.cx1 += (l.tx1 - l.cx1) * ease
        l.cy1 += (l.ty1 - l.cy1) * ease
        l.cx2 += (l.tx2 - l.cx2) * ease
        l.cy2 += (l.ty2 - l.cy2) * ease

        // drift
        l.cx1 += l.vx
        l.cy1 += l.vy
        l.cx2 += l.vx
        l.cy2 += l.vy

        if (!isMobile) {
          l.vx += (Math.random() - 0.5) * 0.08
          l.vy += (Math.random() - 0.5) * 0.08
        }

        l.vx *= 0.96
        l.vy *= 0.96
      }

      // 🟢 ASSEMBLE MODE
      else {

        let mx = (l.cx1 + l.cx2) / 2
        let my = (l.cy1 + l.cy2) / 2

        if (!isMobile) {

          // 🔥 convert mouse to SVG space
          const rect = svg.getBoundingClientRect()

          const scaleX = 1600 / rect.width
          const scaleY = 500 / rect.height

          const mouseX = (mouse.x - rect.left) * scaleX
          const mouseY = (mouse.y - rect.top) * scaleY

          let mx = (l.cx1 + l.cx2) / 2
          let my = (l.cy1 + l.cy2) / 2

          let dx = mx - mouseX
          let dy = my - mouseY
          let dist = dx * dx + dy * dy

          let forceRadius = 120 * 120

          if (dist < forceRadius) {
            let angle = Math.atan2(dy, dx)
            let push = (120 - Math.sqrt(dist)) * 0.25

            l.cx1 += Math.cos(angle) * push
            l.cy1 += Math.sin(angle) * push
            l.cx2 += Math.cos(angle) * push
            l.cy2 += Math.sin(angle) * push
          }
        }
        // 🔥 ease IN (slower start → snap finish)
        const ease = assembleSpeed

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

  // 🔥 ACTIONS
  // function assembleText() {

  //   letters.forEach(letter => {

  //     setTimeout(() => {

  //       letter.lines.forEach(l => {
  //         l.tx1 = l.x1
  //         l.ty1 = l.y1
  //         l.tx2 = l.x2
  //         l.ty2 = l.y2
  //       })

  //     }, letter.delay)

  //   })

  // }


  function assembleText() {
    lines.forEach(l => {
      l.drifting = false   // 🔥 kill scatter instantly
      l.vx = 0
      l.vy = 0
    })

    letters.forEach(letter => {
      setTimeout(() => {
        letter.lines.forEach(l => {
          l.tx1 = l.x1
          l.ty1 = l.y1
          l.tx2 = l.x2
          l.ty2 = l.y2
        })
      }, letter.delay)
    })
  }


  function scatterText() {
    lines.forEach(l => {

      // ✅ USE SVG SPACE ONLY
      l.tx1 = Math.random() * 1600
      l.ty1 = Math.random() * 500
      l.tx2 = Math.random() * 1600
      l.ty2 = Math.random() * 500

      l.vx = (Math.random() - 0.5) * 5
      l.vy = (Math.random() - 0.5) * 5

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
        orbitPlanets.forEach(p => p.orbit())
        skillParticles.forEach(p => p.align())
        svg.classList.add("glow")
      } else {
        scatterText()
        orbitPlanets.forEach(p => p.scatter())
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
      orbitPlanets.forEach(p => p.orbit())
      skillParticles.forEach(p => p.align())
      svg.classList.add("glow")
    })

    hero.addEventListener("mouseleave", () => {


      scatterText()
      targetSpeed = 0.06
      orbitPlanets.forEach(p => p.scatter())
      skillParticles.forEach(p => p.scatter())
      svg.classList.remove("glow")
    })

  }

  const centerY = 250  // middle of 500 viewBox

  drawStickText("CHIGOZIE OZO OFODILE", centerY - 120)
  drawStickText("FULL-STACK DEVELOPER", centerY)
  drawStickText("SCALABLE SYSTEMS AND LOGIC", centerY + 100)
  scatterText()

  setTimeout(() => {
    assembleText()
    svg.classList.add("glow")
  }, 2000)

})();