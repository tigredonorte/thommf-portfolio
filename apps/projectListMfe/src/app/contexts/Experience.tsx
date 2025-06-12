import { useExperience } from "./ExperienceContext";
import { Project } from "./Project";

export const Experience = () => {
  const experience = useExperience().experience;

  return (
    <div className="company-section">
      <header className="company-header">
        <h3>{experience.company}</h3>
        <h4>{experience.role}</h4>
        {experience.url && (
          <a href={experience.url} target="_blank" rel="noopener noreferrer">
            {experience.url}
          </a>
        )}
      </header>
      <div className="projects-container">
        {experience.projects.map((project) => <Project project={project} key={project.title} />)}
      </div>
    </div>
  );
}