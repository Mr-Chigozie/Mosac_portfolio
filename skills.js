const skillsData = [
  {
    category: "Frontend Development",
    skills: [
      { name: "HTML", tier: "S" },
      { name: "CSS", tier: "A" },
      { name: "React", tier: "A" },
      { name: "JavaScript", tier: "S" }
    ]
  },
  {
    category: "Backend Development",
    skills: [
      { name: "Node.js", tier: "A" },
      { name: "Express", tier: "A" }
    ]
  },
  {
    category: "Databases",
    skills: [
      { name: "MongoDB", tier: "B" },
      { name: "MySQL", tier: "A" }
    ]
  },
   {
    category: "Testing & Quality Assurance",
    skills: [
      { name: "Unit Testing", tier: "A" },
      { name: "Integration Testing", tier: "B" },
      { name: "API Testing", tier: "A" },
      { name: "Debugging", tier: "S" }
    ]
  }
];

const container = document.getElementById("skillsContainer");

container.innerHTML = skillsData.map(category => `
  <div class="skill-category">

    <button class="skill-header">
      ${category.category}
      <span class="arrow">▼</span>
    </button>

    <div class="skill-content">
      ${category.skills.map(skill => `
        <div class="skill-row">
          <span>${skill.name}</span>
          <span class="tier tier-${skill.tier.toLowerCase()}">
            ${skill.tier}
          </span>
        </div>
      `).join("")}
    </div>

  </div>
`).join("");

const categories = document.querySelectorAll(".skill-category");

categories.forEach(category => {
  const header = category.querySelector(".skill-header");

  header.addEventListener("click", () => {
    const isOpen = category.classList.contains("active");

    categories.forEach(c => c.classList.remove("active"));

    if (!isOpen) {
      category.classList.add("active");
    }
  });
});