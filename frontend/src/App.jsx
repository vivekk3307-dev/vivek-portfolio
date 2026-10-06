import { useEffect, useState } from "react";
import ChatWidget from "./components/ChatWidget.jsx";
import { blogPosts, projects, skills } from "./data/portfolio.js";

const navigation = [
  ["home", "Home"],
  ["about", "About"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["blog", "Blog"],
  ["contact", "Contact"]
];

function App() {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
    return () => document.body.classList.remove("light-mode");
  }, [lightMode]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    document.body.classList.add("has-reveal");
    const revealItems = document.querySelectorAll(
      "section, .project-card, .blog-card, .skill-card, footer"
    );
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    revealItems.forEach((item, index) => {
      item.classList.add("reveal");
      item.style.setProperty("--reveal-delay", `${(index % 4) * 75}ms`);
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      document.body.classList.remove("has-reveal");
    };
  }, []);

  return (
    <>
      <nav aria-label="Main navigation">
        <h2>
          Dev<span>Space</span>
        </h2>
        <ul>
          {navigation.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
          <li>
            <button
              id="themeButton"
              type="button"
              onClick={() => setLightMode((current) => !current)}
              aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`}
            >
              {lightMode ? "🌙 Dark" : "☀️ Light"}
            </button>
          </li>
        </ul>
      </nav>

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="availability">
              <span className="status-dot" />
              Open to Internship Opportunities
            </div>
            <p className="hero-greeting">Hello, I'm</p>
            <h1>
              Vivek
              <span>Chaurasiya</span>
            </h1>
            <h2>
              MCA Student <span>•</span> Web Developer <span>•</span> AI
              Enthusiast
            </h2>
            <p className="hero-description">
              I build modern, responsive and user-focused web applications
              using JavaScript, Node.js and Express. I'm also exploring
              Artificial Intelligence and modern technologies to build smarter
              digital experiences.
            </p>
            <div className="hero-buttons">
              <a href="#projects" className="btn primary-btn">
                View My Work <span>↗</span>
              </a>
              <a
                href="/assets/Vivek_Chaurasiya_Resume.pdf"
                className="btn secondary-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Resume <span>↓</span>
              </a>
            </div>
            <div className="tech-stack" aria-label="Technologies">
              {["HTML", "CSS", "JavaScript", "Node.js", "Express", "Git"].map(
                (technology) => (
                  <span key={technology}>{technology}</span>
                )
              )}
            </div>
            <div className="hero-stats">
              <div>
                <strong>03+</strong>
                <small>Projects</small>
              </div>
              <div>
                <strong>MCA</strong>
                <small>Student</small>
              </div>
              <div>
                <strong>∞</strong>
                <small>Learning</small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-tech tech-one">JS</div>
            <div className="floating-tech tech-two">Node</div>
            <div className="floating-tech tech-three">AI</div>
            <div className="image-orbit orbit-one" />
            <div className="image-orbit orbit-two" />
            <div className="image-glow" />
            <div className="profile-container">
              <img src="/assets/profile.jpg" alt="Vivek Chaurasiya" />
            </div>
          </div>
        </section>

        <section id="about">
          <h2>About Me</h2>
          <div className="about-container">
            <p>
              I'm a student and aspiring web developer passionate about
              building useful and modern digital experiences.
            </p>
            <p>
              I'm currently developing my skills in JavaScript, Node.js,
              Express and modern web technologies while exploring AI.
            </p>
          </div>
        </section>

        <section id="skills">
          <h2>My Skills</h2>
          <div className="skills-container">
            {skills.map((skill) => (
              <div className="skill-card" key={skill}>
                {skill}
              </div>
            ))}
          </div>
        </section>

        <section id="projects">
          <h2>My Projects</h2>
          <div className="project-container">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <strong>Built with: {project.technology}</strong>
              </article>
            ))}
          </div>
        </section>

        <section id="blog">
          <h2>Blog &amp; Learning</h2>
          <div className="blog-container">
            {blogPosts.map((post) => (
              <article className="blog-card" key={post.title}>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <a href="#">Read More →</a>
              </article>
            ))}
          </div>
        </section>

        <section id="contact">
          <h2>Let's Connect</h2>
          <div className="contact-container">
            <p>
              I'm always interested in learning, building projects and
              connecting with other developers.
            </p>
            <div className="contact-links">
              <a
                href="https://github.com/vivekk3307-dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/vivek-chaurasiya-069226304"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a href="mailto:Vivekchaurasiya1212@gmail.com">Email</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>
          © 2026 <span>Vivek Chaurasiya</span>. Built with curiosity &amp; code.
        </p>
      </footer>

      <ChatWidget />
    </>
  );
}

export default App;
