document.addEventListener("DOMContentLoaded", () => {

  const projectsData = [
    {
      title: "Room Listing App",
      description: "A platform for listing and filtering rooms with dynamic search and role-based filtering.",
      tech: ["React", "Node.js", "Express", "MongoDB"]
    },
    {
      title: "Memo Approval System",
      description: "A role-based memo approval system with multi-level workflow and authentication.",
      tech: ["React", "Node.js", "Express"]
    },
      {
    title: "Labor Management Information System",
    description: "A system for managing workforce data, tracking employee records, and handling operational workflows within an organization.",
    tech: ["React", "Node.js", "Express", "MySQL"]
  },

  {
    title: "ERP Management System",
    description: "An enterprise resource planning system for managing business operations, including user roles, data processing, and internal workflows.",
    tech: ["React", "Node.js", "Express"]
  },

  {
    title: "Job Market Application",
    description: "A platform connecting job seekers and employers with features like job listings, filtering, and application tracking.",
    tech: ["React", "Node.js", "Express", "MongoDB"]
  }
  ];

  const container = document.getElementById("projectsContainer");

  if (!container) {
    console.error("projectsContainer not found");
    return;
  }

  container.innerHTML = projectsData.map(project => `
    <div class="project-card">

      <h3>${project.title}</h3>
      <p>${project.description}</p>

      <div class="project-tech">
        ${project.tech.map(t => `<span>${t}</span>`).join("")}
      </div>

    </div>
  `).join("");

});