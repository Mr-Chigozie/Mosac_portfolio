document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("paintCanvas");
  const ctx = canvas.getContext("2d");

  
  // 🎛 CONTROLS
  const toolType = document.getElementById("toolType");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const frequency = document.getElementById("frequency");

  // 🧠 STATE
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let hue = 0;

  let currentStamp = null; // 🔥 no default stamp

  // 🔧 RESIZE
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // 🖱 EVENTS
  canvas.addEventListener("mousedown", (e) => {

    // 🔥 STAMP MODE (overrides drawing)
    if (currentStamp) {
      placeStamp(e.offsetX, e.offsetY);
      return;
    }

    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  window.addEventListener("mouseup", stopDrawing);

  function stopDrawing() {
    drawing = false;
    ctx.beginPath();
  }

  // ✍️ DRAW
  function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = brushSize.value;
    ctx.lineJoin = "round";

    if (toolType.value === "pen") {
      ctx.lineCap = "butt";
      ctx.strokeStyle = colorPicker.value;

    } else if (toolType.value === "brush") {
      ctx.lineCap = "round";
      ctx.strokeStyle = colorPicker.value;

    } else if (toolType.value === "rainbow") {
      ctx.lineCap = "round";
      ctx.strokeStyle = `hsl(${hue},100%,50%)`;
      hue += Number(frequency.value);
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  // ⭐ STAMP SYSTEM
function placeStamp(x, y) {
  ctx.fillStyle = colorPicker.value;
  const size = brushSize.value;

  if (currentStamp === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

  } else if (currentStamp === "square") {
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

  } else if (currentStamp === "triangle") {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();

  } else if (currentStamp === "star") {
    drawStar(x, y, size);

  } else if (currentStamp === "bear") {
    drawBear(x, y, size);
  }
  else if (currentStamp === "tree") {
  drawTree(x, y, size);

} else if (currentStamp === "car") {
  drawCar(x, y, size);

} else if (currentStamp === "house") {
  drawHouse(x, y, size);
}
}

function drawTree(x, y, size) {
  ctx.fillStyle = colorPicker.value;

  // trunk
  ctx.fillRect(x - size * 0.2, y, size * 0.4, size);

  // leaves
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawCar(x, y, size) {
  ctx.fillStyle = colorPicker.value;

  // body
  ctx.fillRect(x - size, y, size * 2, size * 0.6);

  // top
  ctx.fillRect(x - size * 0.6, y - size * 0.5, size * 1.2, size * 0.5);

  // wheels
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y + size * 0.6, size * 0.3, 0, Math.PI * 2);
  ctx.arc(x + size * 0.6, y + size * 0.6, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCar(x, y, size) {
  ctx.fillStyle = colorPicker.value;

  // body
  ctx.fillRect(x - size, y, size * 2, size * 0.6);

  // top
  ctx.fillRect(x - size * 0.6, y - size * 0.5, size * 1.2, size * 0.5);

  // wheels
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y + size * 0.6, size * 0.3, 0, Math.PI * 2);
  ctx.arc(x + size * 0.6, y + size * 0.6, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(x, y, size) {
  const s = size;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // base color
  ctx.fillStyle = colorPicker.value;

  // 🧱 HOUSE BASE
  ctx.fillRect(x - s, y, s * 2, s * 1.2);

  // 🏠 ROOF (bigger + cleaner)
  ctx.beginPath();
  ctx.moveTo(x - s * 1.2, y);
  ctx.lineTo(x, y - s * 1.2);
  ctx.lineTo(x + s * 1.2, y);
  ctx.closePath();
  ctx.fill();

  // 🚪 DOOR (contrast)
  ctx.fillStyle = "#222";
  ctx.fillRect(x - s * 0.25, y + s * 0.4, s * 0.5, s * 0.8);

  // 🪟 WINDOWS
  ctx.fillStyle = "#fff";

  ctx.fillRect(x - s * 0.7, y + s * 0.3, s * 0.4, s * 0.4);
  ctx.fillRect(x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4);

  // ✨ WINDOW LINES (detail)
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y + s * 0.3);
  ctx.lineTo(x - s * 0.5, y + s * 0.7);
  ctx.moveTo(x - s * 0.7, y + s * 0.5);
  ctx.lineTo(x - s * 0.3, y + s * 0.5);

  ctx.moveTo(x + s * 0.5, y + s * 0.3);
  ctx.lineTo(x + s * 0.5, y + s * 0.7);
  ctx.moveTo(x + s * 0.3, y + s * 0.5);
  ctx.lineTo(x + s * 0.7, y + s * 0.5);

  ctx.stroke();
}
function drawBear(x, y, size) {
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = 3;

  // head
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.stroke();

  // left ear
  ctx.beginPath();
  ctx.arc(x - size * 0.7, y - size * 0.8, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // right ear
  ctx.beginPath();
  ctx.arc(x + size * 0.7, y - size * 0.8, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // inner ears
  ctx.beginPath();
  ctx.arc(x - size * 0.7, y - size * 0.8, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + size * 0.7, y - size * 0.8, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();
}

  function drawStar(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        x + r * Math.cos((18 + i * 72) * Math.PI / 180),
        y - r * Math.sin((18 + i * 72) * Math.PI / 180)
      );
      ctx.lineTo(
        x + r / 2 * Math.cos((54 + i * 72) * Math.PI / 180),
        y - r / 2 * Math.sin((54 + i * 72) * Math.PI / 180)
      );
    }
    ctx.closePath();
    ctx.fill();
  }

  // 🧹 CLEAR
  document.getElementById("clearBtn").onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 💾 SAVE (SAFE VERSION)
const gallery = document.getElementById("gallery");

document.getElementById("saveBtn").onclick = () => {
  const data = canvas.toDataURL();

  // save to storage
  const saved = JSON.parse(localStorage.getItem("art") || "[]");
  saved.push(data);
  localStorage.setItem("art", JSON.stringify(saved));

  // 🔥 instantly add to UI (no full re-render)
  addToGallery(data);
};

function addToGallery(src) {
  if (!gallery) return;

  const img = document.createElement("img");
  img.src = src;

  // 🔥 CLICK TO LOAD BACK INTO CANVAS
  img.onclick = () => {
    const image = new Image();
    image.src = src;

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  };

  gallery.appendChild(img);
}

  function renderGallery() {
  if (!gallery) return;

  gallery.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("art") || "[]");

  saved.forEach(src => addToGallery(src));
}


  if (gallery) renderGallery();

  // 🎨 STAMP UI
  document.querySelectorAll(".stamp").forEach(el => {
    el.addEventListener("click", () => {

      document.querySelectorAll(".stamp").forEach(s => s.classList.remove("active"));
      el.classList.add("active");

      currentStamp = el.dataset.shape;

      // 🔥 stop drawing when switching to stamp
      drawing = false;
    });
  });

  // 🔥 SWITCH BACK TO DRAW MODE
  toolType.addEventListener("change", () => {
    currentStamp = null;
  });

});

