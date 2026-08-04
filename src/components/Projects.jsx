import { useReveal } from "../hooks/useReveal.js";

const projects = [
  {
    title: "clef",
    description: "A locally-hosted, military-grade cryptographic password manager built entirely in C++",
    url: "https://github.com/NotAlive24/clef",
    tags: ["Open Source", "Security"],
  },
];

function ProjectCard({ project }) {
  const [ref, isVisible] = useReveal();

  return (
    <a
      ref={ref}
      className={`project-card-custom reveal ${isVisible ? "reveal-visible" : ""}`}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="project-card-header">
        <h3>{project.title}</h3>
        {/* Animated Arrow Icon */}
        <svg 
          width="22" height="22" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </div>
      
      {project.description && <p>{project.description}</p>}
      
      {project.tags && project.tags.length > 0 && (
        <div className="project-tags-custom">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </a>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="projects-section">
      <div className="projects-header">
        <h2>Projects</h2>
        <p>Some of my recent tools and repositories.</p>
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty">
          <p>Projects coming soon.</p>
        </div>
      ) : (
        <div className="projects-grid-custom">
          {projects.map((project) => (
             <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}