export const technologyGroups = [
  {
    name: "Frontend",
    technologies: ["HTML", "CSS", "JavaScript", "React"]
  },
  {
    name: "Backend",
    technologies: ["Node.js", "Express.js"]
  },
  {
    name: "Data",
    technologies: ["MongoDB", "SQL"]
  },
  {
    name: "Tools",
    technologies: ["Git", "GitHub", "VS Code"]
  },
  {
    name: "AI & Emerging",
    technologies: [
      "Generative AI",
      "AI-assisted development",
      "Prompt Engineering"
    ]
  }
];

export const skills = technologyGroups.flatMap(({ technologies }) => technologies);

export const projects = [
  {
    title: "Personal Developer Portfolio",
    description:
      "A portfolio to share my projects, skills, and progress as a developer.",
    technologies: ["React", "JavaScript", "CSS", "Express.js", "MongoDB"],
    githubUrl: "https://github.com/vivekk3307-dev/vivek-portfolio"
  },
  {
    title: "Chaurasiya Pooja Samagri",
    technologies: []
  },
  {
    title: "SkillGap",
    technologies: []
  },
  {
    title: "Task Manager",
    description: "A simple application to manage daily tasks.",
    technologies: ["HTML", "CSS", "JavaScript"]
  },
  {
    title: "Study Tracker",
    description: "Track study sessions and learning progress.",
    technologies: ["JavaScript", "Node.js", "Express.js"]
  }
];

export const blogPosts = [
  {
    title: "Learning JavaScript",
    description: "Notes, concepts and lessons from my JavaScript learning journey."
  },
  {
    title: "My Node.js Journey",
    description: "What I'm learning while building backend applications with Node.js."
  },
  {
    title: "Building DevSpace",
    description: "How I'm building my portfolio while learning full-stack development."
  }
];
