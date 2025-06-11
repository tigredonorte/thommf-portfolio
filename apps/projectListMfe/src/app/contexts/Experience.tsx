import { LazyLoadImage } from "react-lazy-load-image-component";
import { Carousel } from "react-responsive-carousel";
import { useExperience } from "./ExperienceContext";


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
          {experience.projects.map((project) => (
            <div key={project.title} className="project-card">
              <div className="project-carousel">
                <Carousel
                  showThumbs={false}
                  showStatus={false}
                  infiniteLoop={true}
                  useKeyboardArrows={true}
                  emulateTouch={true}
                >
                  {project.images.map((image, index) => (
                    <div key={index}>
                      <LazyLoadImage
                        alt={`${project.title} screenshot ${index + 1}`}
                        src={image}
                        effect="blur"
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
              <div className="project-details">
                <h5>{project.title}</h5>
                <p>{project.description}</p>
                <div className="tech-list">
                  {project.tech.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}