const canvas = document.getElementById("heroCanvas")
const ctx = canvas.getContext("2d")


window.addEventListener("resize", () => {

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  skillParticles.forEach((p, i) => {
    p.alignX = canvas.width / 2 - (skills.length * 140) / 2 + i * 140
    p.alignY = canvas.height / 2 + 260
  })

})




let tri = document.querySelector("#neonTriangle")

let angle = 0

function rotateTriangle() {

  angle += 0.2

  tri.style.transform = `rotate(${angle}deg)`

  requestAnimationFrame(rotateTriangle)

}

rotateTriangle()



canvas.width = window.innerWidth
canvas.height = window.innerHeight

const planetSprite = new Image()
planetSprite.src = "images/planets.png"   // your sprite sheet

const SPRITE_COLS = 4
const SPRITE_ROWS = 4

const SPRITE_W = 64
const SPRITE_H = 64


class Star {

  constructor() {

    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2

    // parallax speed
    this.speed = 0.1 + Math.random() * 0.3

  }

  update() {

    this.y += this.speed

    if (this.y > canvas.height) {
      this.y = 0
      this.x = Math.random() * canvas.width
    }

  }

  draw() {

    ctx.fillStyle = "white"
    ctx.fillRect(this.x, this.y, this.size, this.size)

  }

}

let stars = []

for (let i = 0; i < 120; i++) {
  stars.push(new Star())
}

class OrbitShape {

  constructor(angle, radius, size) {

    this.angle = angle
    this.radius = radius
    this.size = size

    this.mode = "scatter"

    // orbit center
    this.centerX = canvas.width / 2
    this.centerY = canvas.height / 2 - 80

    // start scattered
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height

    // movement target
    this.tx = this.x
    this.ty = this.y

    // sprite
    this.spriteIndex = Math.floor(Math.random() * 16)
    this.spriteX = this.spriteIndex % SPRITE_COLS
    this.spriteY = Math.floor(this.spriteIndex / SPRITE_COLS)

  }

  update() {

    if (this.mode === "orbit") {

      this.angle -= 0.008

      this.tx = this.centerX + Math.cos(this.angle) * this.radius
      this.ty = this.centerY + Math.sin(this.angle) * this.radius

    }

    this.x += (this.tx - this.x) * 0.06
    this.y += (this.ty - this.y) * 0.06

    if (this.mode === "scatter") {

      if (Math.abs(this.x - this.tx) < 10) {
        this.tx = Math.random() * canvas.width
        this.ty = Math.random() * canvas.height
      }

    }

  }

  draw() {

    ctx.save()

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      planetSprite,
      this.spriteX * SPRITE_W,
      this.spriteY * SPRITE_H,
      SPRITE_W,
      SPRITE_H,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    )

    ctx.restore()

  }

  scatter() {

    this.mode = "scatter"

    this.tx = Math.random() * canvas.width
    this.ty = Math.random() * canvas.height

  }

  orbit() {

    this.mode = "orbit"

  }

}

let orbitShapes = []

for (let i = 0; i < 8; i++) {

  orbitShapes.push(
    new OrbitShape((i / 8) * Math.PI * 2, 300 + Math.random() * 40, 48)
  )

}


let mouse = { x: 0, y: 0 }

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})


const svg = document.getElementById("stickSVG")



const stickFont = {
  B: [
    [0, 0, 0, 60],      // spine
    [0, 0, 35, 0],      // top
    [35, 0, 40, 10],
    [40, 10, 40, 25],
    [40, 25, 35, 30],
    [35, 30, 0, 30],    // middle

    [35, 30, 40, 40],
    [40, 40, 40, 55],
    [40, 55, 35, 60],
    [35, 60, 0, 60]     // bottom
  ],
  F: [
    [0, 0, 0, 60],
    [0, 0, 40, 0],
    [0, 30, 30, 30]
  ],

  G: [
    [40, 0, 0, 0],
    [0, 0, 0, 60],
    [0, 60, 40, 60],
    [40, 60, 40, 35],
    [40, 35, 20, 35]
  ],

  H: [
    [0, 0, 0, 60],
    [40, 0, 40, 60],
    [0, 30, 40, 30]
  ],
  A: [
    [0, 60, 20, 0],
    [20, 0, 40, 60],
    [10, 35, 30, 35]
  ],

  C: [
    [40, 0, 0, 0],
    [0, 0, 0, 60],
    [0, 60, 40, 60]
  ],

  D: [
    [0, 0, 0, 60],
    [0, 0, 40, 20],
    [40, 20, 40, 40],
    [40, 40, 0, 60]
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

  H: [
    [0, 0, 0, 60],
    [40, 0, 40, 60],
    [0, 30, 40, 30]
  ],

  I: [
    [20, 0, 20, 60]
  ],

  K: [
    [0, 0, 0, 60],
    [0, 30, 40, 0],
    [0, 30, 40, 60]
  ],

  L: [
    [0, 0, 0, 60],
    [0, 60, 40, 60]
  ],

  O: [
    [0, 0, 40, 0],
    [40, 0, 40, 60],
    [40, 60, 0, 60],
    [0, 60, 0, 0]
  ],

  R: [
    [0, 0, 0, 60],
    [0, 0, 35, 0],
    [35, 0, 35, 30],
    [35, 30, 0, 30],
    [0, 30, 35, 60]
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

  V: [
    [0, 0, 20, 60],
    [20, 60, 40, 0]
  ],

  Z: [
    [0, 0, 40, 0],
    [40, 0, 0, 60],
    [0, 60, 40, 60]
  ],

  M: [
    [0, 60, 0, 0],
    [0, 0, 20, 30],
    [20, 30, 40, 0],
    [40, 0, 40, 60]
  ],

  N: [
    [0, 60, 0, 0],
    [0, 0, 40, 60],
    [40, 60, 40, 0]
  ],

  U: [
    [0, 0, 0, 60],
    [0, 60, 40, 60],
    [40, 60, 40, 0]
  ],

  P: [
    [0, 60, 0, 0],
    [0, 0, 40, 0],
    [40, 0, 40, 30],
    [40, 30, 0, 30]
  ],

  W: [
    [0, 0, 10, 60],
    [10, 60, 20, 30],
    [20, 30, 30, 60],
    [30, 60, 40, 0]
  ],

  Y: [
    [0, 0, 20, 30],
    [40, 0, 20, 30],
    [20, 30, 20, 60]
  ],

}

let stickLines = [];

function drawStickText(text, startY) {



  let letterWidth = 55
  let textWidth = text.length * letterWidth

  let startX = (1600 - textWidth) / 2
  let x = startX

  text.split("").forEach(letter => {

    if (letter === " ") {
      x += 30
      return
    }

    const shape = stickFont[letter]

    if (!shape) {
      x += 50
      return
    }

    shape.forEach(line => {

      const l = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      )

      let x1 = line[0] + x
      let y1 = line[1] + startY
      let x2 = line[2] + x
      let y2 = line[3] + startY

      l.setAttribute("x1", x1)
      l.setAttribute("y1", y1)
      l.setAttribute("x2", x2)
      l.setAttribute("y2", y2)

      svg.appendChild(l)

      stickLines.push({
        line: l,

        // final letter position
        x1, y1, x2, y2,

        // current animated position
        cx1: Math.random() * 1600,
        cy1: Math.random() * 500,
        cx2: Math.random() * 1600,
        cy2: Math.random() * 500,

        // target position
        tx1: Math.random() * 1600,
        ty1: Math.random() * 500,
        tx2: Math.random() * 1600,
        ty2: Math.random() * 500
      })

    })

    x += 60

  })

}

drawStickText("CHIGOZIE OZO OFODILE", 120)
drawStickText("FULL-STACK DEVELOPER", 240)
drawStickText("SYSTEMS BUILT FROM SCRATCH", 340)

// initialize scattered positions
stickLines.forEach(item => {

  item.line.setAttribute("x1", item.cx1)
  item.line.setAttribute("y1", item.cy1)
  item.line.setAttribute("x2", item.cx2)
  item.line.setAttribute("y2", item.cy2)

})



function animateLines() {

  stickLines.forEach(item => {

    // midpoint of line
    let mx = (item.cx1 + item.cx2) / 2
    let my = (item.cy1 + item.cy2) / 2

    let dx = mx - mouse.x
    let dy = my - mouse.y

    let dist = Math.sqrt(dx * dx + dy * dy)

    let forceRadius = 120

    if (dist < forceRadius) {

      let angle = Math.atan2(dy, dx)

      let push = (forceRadius - dist) * 0.25

      item.cx1 += Math.cos(angle) * push
      item.cy1 += Math.sin(angle) * push
      item.cx2 += Math.cos(angle) * push
      item.cy2 += Math.sin(angle) * push

    }

    // normal animation toward target
    item.cx1 += (item.tx1 - item.cx1) * 0.25
    item.cy1 += (item.ty1 - item.cy1) * 0.25
    item.cx2 += (item.tx2 - item.cx2) * 0.25
    item.cy2 += (item.ty2 - item.cy2) * 0.25

    item.line.setAttribute("x1", item.cx1)
    item.line.setAttribute("y1", item.cy1)
    item.line.setAttribute("x2", item.cx2)
    item.line.setAttribute("y2", item.cy2)

  })

  requestAnimationFrame(animateLines)

}

animateLines();


// const canvas = document.getElementById("heroCanvas")
// const ctx = canvas.getContext("2d")

// canvas.width = window.innerWidth
// canvas.height = window.innerHeight

const skills = ["HTML", "CSS", "React", "Node", "JavaScript", "Express"]

let skillParticles = []

class SkillParticle {

  constructor(word, i) {

    this.word = word

    // start position
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height

    this.tx = this.x
    this.ty = this.y

    // orbit defaults
    this.mode = "orbit"

    // this.orbitCenterX = Math.random()*canvas.width
    // this.orbitCenterY = Math.random()*canvas.height

    this.orbitCenterX = canvas.width / 2
    this.orbitCenterY = canvas.height / 2

    this.radius = 40 + Math.random() * 120
    this.angle = Math.random() * Math.PI * 2
    this.speed = 0.01 + Math.random() * 0.02

    // aligned position
    this.alignX = canvas.width / 2 - (skills.length * 140) / 2 + i * 140
    this.alignY = canvas.height / 2 + 260
  }

  update() {

    if (this.mode === "orbit") {

      this.angle += this.speed

      this.tx = this.orbitCenterX + Math.cos(this.angle) * this.radius
      this.ty = this.orbitCenterY + Math.sin(this.angle) * this.radius

    }

    this.x += (this.tx - this.x) * 0.08
    this.y += (this.ty - this.y) * 0.08

  }

  draw() {

    // ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillStyle = "#00f7ff"
    ctx.font = "18px monospace"
    ctx.shadowColor = "#00f7ff"
    ctx.shadowBlur = 10

    ctx.fillText(this.word, this.x, this.y)
    ctx.shadowBlur = 0
  }

  scatter() {

    this.mode = "orbit"

    this.orbitCenterX = Math.random() * canvas.width
    this.orbitCenterY = Math.random() * canvas.height

    this.radius = 40 + Math.random() * 120
    this.angle = Math.random() * Math.PI * 2
    this.speed = 0.01 + Math.random() * 0.02

  }

  align() {

    this.mode = "align"

    this.tx = this.alignX
    this.ty = this.alignY

  }

}

function initSkills() {

  skills.forEach((skill, i) => {
    skillParticles.push(new SkillParticle(skill, i))
  })

}

initSkills()

function animateSkills() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    s.update()
    s.draw()
  })


  // grid background
  drawGrid()

  // draw orbiting squares FIRST (background)
  orbitShapes.forEach(s => {
    s.update()
    s.draw()
  })

  // draw skill words
  skillParticles.forEach(p => {
    p.update()
    p.draw()
  })



  requestAnimationFrame(animateSkills)

}

animateSkills()

const hero = document.getElementById("hero")



hero.addEventListener("mouseenter", () => {

  // assemble text
  stickLines.forEach(item => {
    item.tx1 = item.x1
    item.ty1 = item.y1
    item.tx2 = item.x2
    item.ty2 = item.y2
  })

  // align skills
  skillParticles.forEach(p => {
    p.align()
  })

  // orbit planets
  orbitShapes.forEach(p => {
    p.orbit()
  })

  // glow effect
  svg.style.filter = "drop-shadow(0 0 20px #00f7ff)"

})


hero.addEventListener("mouseleave", () => {

  // scatter letters
  stickLines.forEach(item => {
    item.tx1 = Math.random() * 1600
    item.ty1 = Math.random() * 500
    item.tx2 = Math.random() * 1600
    item.ty2 = Math.random() * 500
  })

  // scatter skills
  skillParticles.forEach(p => {
    p.scatter()
  })

  // scatter planets
  orbitShapes.forEach(p => {
    p.scatter()
  })

  // remove glow
  svg.style.filter = "none"

})


function drawGrid() {

  ctx.strokeStyle = "rgba(0,255,255,0.05)"

  for (let x = 0; x < canvas.width; x += 40) {

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()

  }

  for (let y = 0; y < canvas.height; y += 40) {

    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()

  }

}

const bgCanvas = document.getElementById("bgCanvas")
const bgCtx = bgCanvas.getContext("2d")

bgCanvas.width = window.innerWidth
bgCanvas.height = window.innerHeight

window.addEventListener("resize", () => {
  bgCanvas.width = window.innerWidth
  bgCanvas.height = window.innerHeight
})

class Bubble {

  constructor() {
    this.reset()
  }

  reset() {

    this.x = Math.random() * bgCanvas.width
    this.y = bgCanvas.height + Math.random() * 200

    this.radius = 4 + Math.random() * 12
    this.speed = 0.3 + Math.random() * 0.8

    this.alpha = 0.08 + Math.random() * 0.15

  }

  update() {

    this.y -= this.speed

    if (this.y < -50) {
      this.reset()
    }

  }

  draw() {

    bgCtx.beginPath()
    bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)

    bgCtx.strokeStyle = `rgba(0,255,255,${this.alpha})`
    bgCtx.lineWidth = 2
    bgCtx.stroke()

  }

}

let bubbles = []

for (let i = 0; i < 80; i++) {
  bubbles.push(new Bubble())
}

function animateBubbles() {

  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height)

  bubbles.forEach(b => {
    b.update()
    b.draw()
  })

  requestAnimationFrame(animateBubbles)

}

animateBubbles()


const tabButtons = document.querySelectorAll(".about-tabs button")
const tabs = document.querySelectorAll(".tab")
const sprite = document.getElementById("aboutSprite")

const spriteMap = {
  bio: "0% 0%",
  professional: "100% 0%",
  hobbies: "0% 100%",
  newton: "100% 100%"
}

tabButtons.forEach(button => {

  button.addEventListener("click", () => {

    const target = button.dataset.tab

    // deactivate buttons
    tabButtons.forEach(btn => btn.classList.remove("active"))

    // deactivate content
    tabs.forEach(tab => tab.classList.remove("active"))

    // activate clicked button
    button.classList.add("active")

    // show tab content
    document.getElementById(target).classList.add("active")

    // change sprite frame
    sprite.style.backgroundPosition = spriteMap[target]

  })

})

const order = ["bio", "professional", "hobbies", "newton"]

let index = 0

setInterval(() => {

  index = (index + 1) % order.length

  sprite.style.backgroundPosition = spriteMap[order[index]]

}, 4800)



const skillHeaders = document.querySelectorAll(".skill-header")

skillHeaders.forEach(header => {

  header.addEventListener("click", () => {

    const content = header.nextElementSibling

    if (content.style.height) {
      content.style.height = null
    } else {
      content.style.height = content.scrollHeight + "px"
    }

  })

})

