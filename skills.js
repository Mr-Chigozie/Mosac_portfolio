document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("skillsContainer");
  if (!container) return;

  // which public apps use each skill, matched against project tech tags
  const allProjects = [...PROJECTS, ...WORK_PROJECTS];
  const usedIn = (skill) => allProjects.filter(p => p.tech.includes(skill)).map(p => p.title);

  const TIER_LABELS = { S: "Expert", A: "Advanced", B: "Proficient" };

  container.innerHTML = SKILLS.map(category => `
    <div class="skill-category">

      <div class="skill-header">
        <span class="skill-icon" aria-hidden="true">${category.icon}</span>
        <h3>${category.category}</h3>
        <span class="skill-count">${category.skills.length}</span>
      </div>

      <div class="skill-content">
        ${category.skills.map(skill => {
          const apps = usedIn(skill.name);
          return `
            <div class="skill-row"${apps.length ? ` title="Used in: ${apps.join(", ")}"` : ""}>
              <span class="skill-name">${skill.name}</span>
              ${apps.length ? `<span class="skill-usage">${apps.length} app${apps.length > 1 ? "s" : ""}</span>` : ""}
              <span class="tier tier-${skill.tier.toLowerCase()}" title="${TIER_LABELS[skill.tier]}">
                ${skill.tier}
              </span>
            </div>
          `;
        }).join("")}
      </div>

    </div>
  `).join("");

});
