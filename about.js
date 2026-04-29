// =========================
// TAB + SPRITE LOGIC
// =========================
const tabs = document.querySelectorAll(".about-tabs button");
const tabContents = document.querySelectorAll(".tab");
const sprite = document.getElementById("aboutSprite");

const spritePositions = {
  bio: "0% 0%",
  professional: "100% 0%",
  hobbies: "0% 100%"
};


// =========================
// ABOUT DATA (SINGLE SOURCE)
// =========================
const aboutData = {
  bio: {
    paragraphs: [
      "Hello, I'm Chigozie Ofodile, a software engineer with a Bachelor's degree in Computer Applications from Bharathiar University, India.",
      "I’m focused on building practical, scalable applications and currently looking for an opportunity to contribute, learn, and deliver meaningful results."
    ]
  },

  professional: {
    paragraphs: [
      "I enjoy working with a wide range of technologies to develop practical software solutions, choosing the right stack for each project.",
      "I work with React, Node.js, Express, and vanilla JavaScript, along with languages like Java, Python, C#, C, and C++, to build real-world applications.",
      "My experience includes API integration, dynamic filtering systems, and role-based workflows."
    ],
    stack: ["React", "Node.js", "Express"]
  },

  hobbies: {
    paragraphs: [
      "I enjoy experimenting with UI systems and creating interactive tools and games.",
      "Beyond development, I like exploring ideas through documentaries and deep research, as well as building and playing games.",
      "In my free time, you’ll find me taking long walks on the beach, playing basketball, swimming, or watching movies."
    ]
  }
};


// =========================
// RENDER CONTENT FUNCTION
// =========================
function renderAboutContent() {
  document.querySelectorAll('[data-tab-content]').forEach(tab => {
    const key = tab.dataset.tabContent;
    const container = tab.querySelector('.tab-content-inner');
    const data = aboutData[key];

    let html = data.paragraphs
      .map(p => `<p>${p}</p>`)
      .join('');

    // add stack if exists
    if (data.stack) {
      html += `
        <div class="stack">
          ${data.stack.map(s => `<span>${s}</span>`).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  });
}


// =========================
// TAB CLICK HANDLER
// =========================
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.tab;

    // reset
    tabs.forEach(b => b.classList.remove("active"));
    tabContents.forEach(t => t.classList.remove("active"));

    // activate tab
    btn.classList.add("active");
    document
      .querySelector(`[data-tab-content="${key}"]`)
      .classList.add("active");

    // update sprite
    sprite.style.backgroundPosition = spritePositions[key];

    // animation
    sprite.classList.add("active");
    setTimeout(() => sprite.classList.remove("active"), 300);
  });
});


// =========================
// INIT
// =========================
renderAboutContent();