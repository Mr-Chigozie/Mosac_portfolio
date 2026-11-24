document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("projectsContainer");
  const filters = document.getElementById("projectFilters");
  const workContainer = document.getElementById("workProjects");
  const stats = document.getElementById("projectStats");

  if (!container) {
    console.error("projectsContainer not found");
    return;
  }

  const repoUrl = (repo) => `https://github.com/${GITHUB_USER}/${repo}`;

  const techTags = (tech) => tech.map(t => `<span>${t}</span>`).join("");

  // ======================
  // 📊 STATS
  // ======================
  if (stats) {
    const liveCount = PROJECTS.filter(p => p.live).length;
    const techCount = new Set(PROJECTS.flatMap(p => p.tech)).size;

    stats.innerHTML = `
      <span><strong>${PROJECTS.length}</strong> apps on GitHub</span>
      <span><strong>${liveCount}</strong> playable live</span>
      <span><strong>${techCount}</strong> technologies</span>
      <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">View GitHub profile ↗</a>
    `;
  }

  // ======================
  // 🗂 PROJECT CARDS
  // ======================
  container.innerHTML = PROJECTS.map(project => `
    <article class="project-card${project.featured ? " featured" : ""}" data-type="${project.type}">

      <div class="project-top">
        <span class="project-type type-${project.type}">${PROJECT_TYPES[project.type]}</span>
        ${project.live
          ? `<span class="project-status live"><span class="pulse-dot"></span>Live</span>`
          : `<span class="project-status">Source</span>`}
      </div>

      <h3>${project.title}</h3>
      <p>${project.pitch}</p>

      ${project.featured && project.highlights ? `
        <ul class="project-highlights">
          ${project.highlights.map(h => `<li>${h}</li>`).join("")}
        </ul>
      ` : ""}

      <div class="project-tech">${techTags(project.tech)}</div>

      <div class="project-links">
        ${project.live ? `<a class="project-link primary" href="${project.live}" target="_blank" rel="noopener">Live demo ↗</a>` : ""}
        <a class="project-link" href="${repoUrl(project.repo)}" target="_blank" rel="noopener">Code ↗</a>
      </div>

    </article>
  `).join("");

  // ======================
  // 🔘 FILTERS
  // ======================
  if (filters) {
    const types = ["all", ...Object.keys(PROJECT_TYPES)];
    const countFor = (type) =>
      type === "all" ? PROJECTS.length : PROJECTS.filter(p => p.type === type).length;

    filters.innerHTML = types.map(type => `
      <button type="button" data-filter="${type}" class="${type === "all" ? "active" : ""}">
        ${type === "all" ? "All" : PROJECT_TYPES[type]}
        <span>${countFor(type)}</span>
      </button>
    `).join("");

    filters.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;

      const type = btn.dataset.filter;
      filters.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));

      // featured cards only span wide in the unfiltered view
      container.classList.toggle("filtered", type !== "all");

      container.querySelectorAll(".project-card").forEach(card => {
        card.hidden = type !== "all" && card.dataset.type !== type;
      });
    });
  }

  // ======================
  // 💼 PRIVATE / WORK PROJECTS
  // ======================
  if (workContainer) {
    workContainer.innerHTML = WORK_PROJECTS.map(project => `
      <div class="work-card">
        <h4>${project.title}</h4>
        <p>${project.pitch}</p>
        <div class="project-tech">${techTags(project.tech)}</div>
      </div>
    `).join("");
  }

});
