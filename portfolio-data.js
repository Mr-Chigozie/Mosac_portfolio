// ======================
// 📦 PORTFOLIO DATA
// Single source of truth for the Projects and Skills sections.
// Tech tags on projects use the same names as skills, so each
// skill can show how many apps use it.
// ======================

const GITHUB_USER = "Mr-Chigozie";

const PROJECTS = [
  {
    title: "9jaListings",
    repo: "real-estate_listings-app",
    type: "fullstack",
    featured: true,
    pitch: "A verified property marketplace for Nigeria. Advertisers are ID-checked, listings drop out of search unless re-confirmed every 14 days, and renters see an itemised total to move in.",
    highlights: [
      "Two-step trust: identity checks plus proof of authority per listing",
      "Inspection booking that reveals the address only once confirmed",
      "Featured listings and agent plans paid through Paystack"
    ],
    tech: ["React", "Vite", "Node.js", "Express", "MySQL", "JWT Auth", "Zod", "Nodemailer", "Paystack"]
  },
  {
    title: "Chess Wars",
    repo: "battlechess",
    type: "game",
    featured: true,
    live: "https://mr-chigozie.github.io/battlechess/",
    pitch: "Full FIDE chess fought by themed armies, with cinematic 3D capture scenes, a story campaign, a computer opponent and refereed online battles.",
    highlights: [
      "Rules engine verified with perft tests, shared by client and server",
      "Online War Room with invite links, live clocks and guest play",
      "Procedural 3D units, terrain, fire effects and synthesized sound"
    ],
    tech: ["Three.js", "JavaScript", "Node.js", "Socket.io", "MySQL", "Blender"]
  },
  {
    title: "AAI ERP",
    repo: "aai_erp",
    type: "fullstack",
    pitch: "An enterprise resource planning system for running internal operations, with role-based access, real-time updates, chart dashboards and Excel import/export.",
    tech: ["React", "Vite", "Tailwind CSS", "Recharts", "Socket.io", "Node.js", "Express", "Knex.js", "MySQL", "JWT Auth", "Excel (xlsx)"]
  },
  {
    title: "Lagos Traffic Survivor 3D",
    repo: "surv_lag",
    type: "game",
    pitch: "Drive a salon car, okada or danfo across four Lagos routes in 3D, delivering passengers on time and upgrading your garage. Online races for up to 6 drivers.",
    tech: ["Three.js", "JavaScript", "Node.js", "WebSockets", "GitHub Actions"]
  },
  {
    title: "Party Finder",
    repo: "partyFinder",
    type: "frontend",
    live: "https://mr-chigozie.github.io/partyFinder/",
    pitch: "A social party finder for Abuja: a personalised Tonight feed, a live vibe map and party stories, with onboarding that scores every event 0–100 for you.",
    tech: ["JavaScript", "HTML", "CSS", "SVG"]
  },
  {
    title: "Flatmate",
    repo: "flatmate",
    type: "fullstack",
    pitch: "A room and flatmate finder: post a room or a room-wanted ad, browse listings, verify your profile and message other users.",
    tech: ["React", "Tailwind CSS", "React Hook Form", "Node.js", "Express", "MySQL", "JWT Auth", "Multer"]
  },
  {
    title: "Sunny View",
    repo: "svg-interact",
    type: "game",
    pitch: "An interactive choose-your-ending story: a suburban apocalypse with 8 endings, drawn and animated in SVG.",
    tech: ["JavaScript", "SVG", "CSS"]
  },
  {
    title: "Switchback",
    repo: "roll-a-dice",
    type: "game",
    pitch: "A dice-rolling climbing game: roll your way up the mountain and reach the summit before your strength runs out.",
    tech: ["JavaScript", "HTML", "CSS"]
  }
];

// Professional work that isn't in a public repo
const WORK_PROJECTS = [
  {
    title: "Memo Approval System",
    pitch: "Role-based memo approval with a multi-level workflow and authentication.",
    tech: ["React", "Node.js", "Express"]
  },
  {
    title: "Labor Management Information System",
    pitch: "Workforce records, employee tracking and operational workflows for an organisation.",
    tech: ["React", "Node.js", "Express", "MySQL"]
  },
  {
    title: "Job Market Application",
    pitch: "Connects job seekers and employers with listings, filtering and application tracking.",
    tech: ["React", "Node.js", "Express", "MongoDB"]
  }
];

const PROJECT_TYPES = {
  fullstack: "Full-stack",
  game: "Game",
  frontend: "Frontend"
};

// Tiers: S = expert, A = advanced, B = proficient
const SKILLS = [
  {
    category: "Frontend",
    icon: "◧",
    skills: [
      { name: "JavaScript", tier: "S" },
      { name: "HTML", tier: "S" },
      { name: "CSS", tier: "A" },
      { name: "React", tier: "A" },
      { name: "Vite", tier: "A" },
      { name: "Tailwind CSS", tier: "A" },
      { name: "React Hook Form", tier: "B" }
    ]
  },
  {
    category: "3D, Games & Graphics",
    icon: "◈",
    skills: [
      { name: "Three.js", tier: "A" },
      { name: "Canvas API", tier: "A" },
      { name: "SVG", tier: "A" },
      { name: "Game loops & physics", tier: "A" },
      { name: "Blender", tier: "B" }
    ]
  },
  {
    category: "Backend & Real-time",
    icon: "⌘",
    skills: [
      { name: "Node.js", tier: "A" },
      { name: "Express", tier: "A" },
      { name: "REST APIs", tier: "A" },
      { name: "Socket.io", tier: "A" },
      { name: "WebSockets", tier: "B" },
      { name: "JWT Auth", tier: "A" },
      { name: "Zod", tier: "B" },
      { name: "Multer", tier: "B" },
      { name: "Nodemailer", tier: "B" }
    ]
  },
  {
    category: "Data & Databases",
    icon: "◫",
    skills: [
      { name: "MySQL", tier: "A" },
      { name: "Knex.js", tier: "B" },
      { name: "MongoDB", tier: "B" },
      { name: "Recharts", tier: "A" },
      { name: "Chart.js", tier: "A" },
      { name: "Excel (xlsx)", tier: "B" }
    ]
  },
  {
    category: "Integrations & Deployment",
    icon: "⇪",
    skills: [
      { name: "Git & GitHub", tier: "A" },
      { name: "GitHub Actions", tier: "B" },
      { name: "GitHub Pages", tier: "A" },
      { name: "Render / Vercel", tier: "B" },
      { name: "Paystack", tier: "B" },
      { name: "Third-party APIs", tier: "A" }
    ]
  },
  {
    category: "Testing & Quality",
    icon: "✓",
    skills: [
      { name: "Debugging", tier: "S" },
      { name: "Unit Testing", tier: "A" },
      { name: "API Testing", tier: "A" },
      { name: "Integration Testing", tier: "B" },
      { name: "Rules / perft testing", tier: "B" },
      { name: "Security hardening", tier: "B" }
    ]
  }
];
