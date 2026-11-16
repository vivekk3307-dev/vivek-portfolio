import { useEffect, useRef, useState } from "react";
import ChatWidget from "./components/ChatWidget.jsx";
import {
  blogPosts,
  projects,
  technologyGroups
} from "./data/portfolio.js";

const navigation = [
  ["home", "Home"],
  ["about", "About"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["experience", "Experience"],
  ["contact", "Contact"],
  ["blog", "Notes"]
];

const githubRepositoryUrl = "https://github.com/vivekk3307-dev/vivek-portfolio";

const initialContactForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  reason: "",
  message: ""
};

async function submitContactForm(contactDetails) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: contactDetails.fullName,
      email: contactDetails.email,
      phone: contactDetails.phone,
      company: contactDetails.company,
      reason: contactDetails.reason,
      message: contactDetails.message
    })
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an unexpected response. Please try again.");
  }

  if (!response.ok) {
    const errorMessage =
      result.error || "We couldn't send your message. Please try again.";
    throw new Error(
      import.meta.env.DEV && result.details
        ? `${errorMessage} (${result.details})`
        : errorMessage
    );
  }

  return result;
}

function ContactSection() {
  const [formData, setFormData] = useState(initialContactForm);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSubmissionStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionLock.current) {
      return;
    }

    const contactDetails = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value.trim()])
    );

    if (
      !contactDetails.fullName ||
      !contactDetails.email ||
      !contactDetails.reason ||
      !contactDetails.message
    ) {
      setSubmissionStatus({
        type: "error",
        message: "Please complete all required fields."
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.email)) {
      setSubmissionStatus({
        type: "error",
        message: "Please enter a valid email address."
      });
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      await submitContactForm(contactDetails);
      setFormData(initialContactForm);
      setSubmissionStatus({
        type: "success",
        message: "Message sent successfully! I'll get back to you soon."
      });
    } catch (error) {
      setSubmissionStatus({
        type: "error",
        message:
          error instanceof TypeError
            ? "Unable to reach the server. Please check your connection and try again."
            : error.message
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact">
      <p className="section-eyebrow">LET'S BUILD SOMETHING USEFUL</p>
      <h2>Let’s talk.</h2>
      <div className="contact-container">
        <p className="contact-description">
          Have an idea, an opportunity, or a question? Send me a note using the
          form and I’ll get back to you.
        </p>
        <div className="contact-links">
          <a
            href={githubRepositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository <span aria-hidden="true">↗</span>
          </a>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-fields">
            <div className="contact-field">
              <label htmlFor="contact-full-name">Full Name <span>*</span></label>
              <input
                autoComplete="name"
                id="contact-full-name"
                name="fullName"
                onChange={handleFieldChange}
                required
                type="text"
                value={formData.fullName}
              />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-email">Email Address <span>*</span></label>
              <input
                autoComplete="email"
                id="contact-email"
                name="email"
                onChange={handleFieldChange}
                required
                type="email"
                value={formData.email}
              />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-phone">Phone Number <small>(Optional)</small></label>
              <input
                autoComplete="tel"
                id="contact-phone"
                name="phone"
                onChange={handleFieldChange}
                type="tel"
                value={formData.phone}
              />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-company">Company / Organization <small>(Optional)</small></label>
              <input
                autoComplete="organization"
                id="contact-company"
                name="company"
                onChange={handleFieldChange}
                type="text"
                value={formData.company}
              />
            </div>
            <div className="contact-field contact-field-full">
              <label htmlFor="contact-reason">Reason for Contact <span>*</span></label>
              <select
                id="contact-reason"
                name="reason"
                onChange={handleFieldChange}
                required
                value={formData.reason}
              >
                <option disabled value="">Select a reason</option>
                <option value="Job Opportunity">💼 Job Opportunity</option>
                <option value="Freelance / Project">💻 Freelance / Project</option>
                <option value="Internship">🎓 Internship</option>
                <option value="Collaboration">🤝 Collaboration</option>
                <option value="Other">💬 Other</option>
              </select>
            </div>
            <div className="contact-field contact-field-full">
              <label htmlFor="contact-message">Your Message <span>*</span></label>
              <textarea
                id="contact-message"
                name="message"
                onChange={handleFieldChange}
                required
                rows="6"
                value={formData.message}
              />
            </div>
          </div>
          {submissionStatus && (
            <p
              className={`contact-status ${submissionStatus.type}`}
              role={submissionStatus.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {submissionStatus.message}
            </p>
          )}
          <button className="contact-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send Message →"}
          </button>
        </form>
      </div>
    </section>
  );
}

function App() {
  const [lightMode, setLightMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const menuToggleRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
    return () => document.body.classList.remove("light-mode");
  }, [lightMode]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    document.body.classList.add("has-reveal");
    const revealItems = document.querySelectorAll(
      "main > section, .project-card, .blog-card, .technology-card, footer"
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

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const sections = navigation
      .map(([id]) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top
          );

        if (visibleSections[0]) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav className="site-nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a
            className="brand"
            href="#home"
            aria-label="Vivek Chaurasiya, home"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="brand-mark" aria-hidden="true">VC</span>
            <span className="brand-name">
              Vivek <strong>Chaurasiya</strong>
            </span>
          </a>
          <button
            ref={menuToggleRef}
            className="nav-toggle"
            type="button"
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
          <div
            id="primary-navigation"
            className={`nav-content${isMenuOpen ? " is-open" : ""}`}
          >
            <ul className="nav-links">
              {navigation.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={activeSection === id ? "location" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="nav-actions">
              <a
                className="nav-resume"
                href="/assets/Vivek_Chaurasiya_Resume.pdf"
                download
              >
                Resume <span aria-hidden="true">↓</span>
              </a>
              <button
                className="theme-toggle"
                type="button"
                onClick={() => setLightMode((current) => !current)}
                aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`}
              >
                <span aria-hidden="true">{lightMode ? "◐" : "☼"}</span>
                {lightMode ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero-content">
            <p className="hero-kicker">
              <span className="hero-kicker-dot" aria-hidden="true" />
              MCA STUDENT <span aria-hidden="true">/</span> SOFTWARE DEVELOPER
            </p>
            <p className="hero-greeting">Hello, I’m</p>
            <h1 id="hero-title">
              Vivek <span>Chaurasiya</span>
            </h1>
            <p className="hero-role">
              Full Stack Developer <span aria-hidden="true">|</span> AI Enthusiast
            </p>
            <p className="hero-summary">
              I’m an MCA student building useful digital products and exploring
              how AI can make everyday experiences more helpful.
            </p>
            <div className="hero-buttons">
              <a href="#projects" className="btn primary-btn">
                View Projects <span aria-hidden="true">↗</span>
              </a>
              <a
                className="btn secondary-btn"
                href="/assets/Vivek_Chaurasiya_Resume.pdf"
                download
              >
                Download Resume <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-socials" aria-label="Social profiles">
              <a href={githubRepositoryUrl} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Portrait and technology highlights">
            <div className="hero-grid" aria-hidden="true" />
            <div className="hero-visual-label" aria-hidden="true">
              <span>BUILD</span>
              <span>LEARN</span>
              <span>EXPLORE</span>
            </div>
            <div className="profile-container">
              <img
                src="/assets/profile.jpg"
                alt="Portrait of Vivek Chaurasiya"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="hero-orbit orbit-one" aria-hidden="true" />
            <div className="hero-orbit orbit-two" aria-hidden="true" />
            <div className="hero-tech-note">
              <span className="hero-tech-note-dot" aria-hidden="true" />
              REACT <span aria-hidden="true">·</span> AI EXPLORATION
            </div>
          </div>
        </section>

        <section id="about" className="content-section" aria-labelledby="about-title">
          <div className="section-heading">
            <p className="section-kicker">01 / ABOUT</p>
            <h2 id="about-title">A developer in progress.</h2>
          </div>
          <div className="about-container">
            <p className="about-lead">
              My journey into development is driven by curiosity, problem
              solving, and the satisfaction of making useful things work.
            </p>
            <div className="about-copy">
              <p>
                I’m currently pursuing my MCA and building my foundation in
                software development through hands-on web projects.
              </p>
              <p>
                I enjoy working across the frontend and backend, and I’m
                exploring AI and generative AI as tools for creating more
                thoughtful digital products. My goal is to keep growing into a
                skilled, well-rounded software developer.
              </p>
            </div>
          </div>
        </section>

        <section id="skills" className="content-section" aria-labelledby="skills-title">
          <div className="section-heading">
            <p className="section-kicker">02 / TECH STACK</p>
            <h2 id="skills-title">Tools I’m learning and building with.</h2>
          </div>
          <div className="technology-groups">
            {technologyGroups.map((group, index) => (
              <article className="technology-card" key={group.name}>
                <div className="technology-card-heading">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{group.name}</h3>
                </div>
                <ul>
                  {group.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="content-section" aria-labelledby="projects-title">
          <div className="section-heading section-heading-row">
            <div>
              <p className="section-kicker">03 / SELECTED WORK</p>
              <h2 id="projects-title">Projects</h2>
            </div>
            <p className="section-summary">
              Personal builds and experiments from my development journey.
            </p>
          </div>
          <div className="project-container">
            {projects.map((project, index) => (
              <article className="project-card" key={project.title}>
                <div className="project-visual" aria-hidden="true">
                  <span className="project-visual-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="project-visual-mark">
                    {project.title
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")}
                  </span>
                  <span className="project-visual-line" />
                </div>
                <div className="project-card-content">
                  <p className="project-label">PROJECT {String(index + 1).padStart(2, "0")}</p>
                  <h3>{project.title}</h3>
                  {project.description && <p>{project.description}</p>}
                  {project.technologies?.length > 0 && (
                    <ul className="project-technologies" aria-label="Technologies used">
                      {project.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  )}
                  {project.githubUrl || project.liveUrl ? (
                    <div className="project-links">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          GitHub <span aria-hidden="true">↗</span>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          Live demo <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="experience"
          className="content-section"
          aria-labelledby="experience-title"
        >
          <div className="section-heading">
            <p className="section-kicker">04 / EXPERIENCE & EDUCATION</p>
            <h2 id="experience-title">Learning by doing.</h2>
          </div>
          <div className="timeline">
            <article className="timeline-item">
              <p className="timeline-period">
                <span className="timeline-status-dot" />
                Ongoing
              </p>
              <div className="timeline-content">
                <p className="timeline-type">INTERNSHIP</p>
                <h3>Frontend Developer Intern</h3>
                <a
                  href="https://www.alphawizz.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Alphawizz Technologies <span aria-hidden="true">↗</span>
                </a>
                <p>Working on frontend development with React.</p>
                <ul className="timeline-tags">
                  <li>React</li>
                  <li>Frontend</li>
                </ul>
              </div>
            </article>
            <article className="timeline-item">
              <p className="timeline-period">IN PROGRESS</p>
              <div className="timeline-content">
                <p className="timeline-type">EDUCATION</p>
                <h3>Master of Computer Applications</h3>
                <p>
                  Currently pursuing an MCA while developing my software
                  engineering foundations.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section id="blog" className="content-section" aria-labelledby="blog-title">
          <div className="section-heading section-heading-row">
            <div>
              <p className="section-kicker">05 / LEARNING NOTES</p>
              <h2 id="blog-title">Curiosity in progress.</h2>
            </div>
            <p className="section-summary">
              What I’m learning as I build and explore.
            </p>
          </div>
          <div className="blog-container">
            {blogPosts.map((post, index) => (
              <article className="blog-card" key={post.title}>
                <p className="blog-card-index">
                  NOTE {String(index + 1).padStart(2, "0")}
                </p>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
              </article>
            ))}
          </div>
        </section>

        <ContactSection />
      </main>

      <footer>
        <a className="footer-brand" href="#home">Vivek Chaurasiya</a>
        <p>Building a little better every day.</p>
        <a href={githubRepositoryUrl} target="_blank" rel="noopener noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
        <small>© {new Date().getFullYear()} Vivek Chaurasiya</small>
      </footer>

      <ChatWidget />
    </>
  );
}

export default App;
