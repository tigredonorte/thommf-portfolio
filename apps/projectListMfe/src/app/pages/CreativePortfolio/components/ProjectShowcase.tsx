import { useState } from 'react';
import './ProjectShowcase.scss';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  color: string;
  link?: string;
  github?: string;
}

interface ProjectShowcaseProps {
  experiences: any[];
  onSearch?: (searchTerm: string) => void;
  onFilterSelect?: (filter: string) => void;
  onClearFilters?: () => void;
  searchFilters?: string[];
  filterSuggestions?: Array<{ text: string; type: string }>;
}

export function ProjectShowcase({ 
  experiences,
  onSearch,
  onFilterSelect,
  onClearFilters,
  searchFilters = [],
  filterSuggestions = []
}: ProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const projects: Project[] = experiences.flatMap((exp, expIndex) => 
    (exp.projects || []).map((proj: any, projIndex: number) => ({
      id: expIndex * 100 + projIndex,
      title: proj.title,
      description: proj.description,
      technologies: proj.tech || [],
      image: proj.images && proj.images.length > 0 
        ? proj.images[0] 
        : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='24' font-family='sans-serif'%3EProject Image%3C/text%3E%3C/svg%3E`,
      color: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6b6b'][projIndex % 5],
      link: proj.url,
      github: proj.github
    }))
  ).slice(0, 6);

  const handleProjectChange = (index: number) => {
    if (index === selectedProject || isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedProject(index);
      setIsAnimating(false);
    }, 300);
  };

  if (projects.length === 0) {
    projects.push(
      {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-stack e-commerce solution with real-time inventory management and AI-powered recommendations",
        technologies: ["React", "Node.js", "MongoDB", "Redis", "Docker"],
        image: "/api/placeholder/800/600",
        color: "#00ffff"
      },
      {
        id: 2,
        title: "FinTech Dashboard",
        description: "Real-time financial analytics dashboard with advanced data visualization and predictive modeling",
        technologies: ["Angular", "Python", "PostgreSQL", "D3.js", "AWS"],
        image: "/api/placeholder/800/600",
        color: "#ff00ff"
      },
      {
        id: 3,
        title: "Social Media Analytics",
        description: "AI-driven social media monitoring and sentiment analysis platform",
        technologies: ["Vue.js", "FastAPI", "ElasticSearch", "TensorFlow"],
        image: "/api/placeholder/800/600",
        color: "#ffff00"
      }
    );
  }

  const currentProject = projects[selectedProject] || projects[0];

  return (
    <div className="showcase-container">
      <div className="showcase-header">
        <h2 className="showcase-title">Featured Projects</h2>
        <p className="showcase-subtitle">Explore my latest work and innovations</p>
        
        {onSearch && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search projects or technologies..."
              className="search-input"
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchFilters.length > 0 && (
              <div className="active-filters">
                {searchFilters.map((filter, index) => (
                  <span key={`${filter}-${index}`} className="filter-tag">
                    {filter}
                    {onClearFilters && (
                      <button onClick={onClearFilters} className="remove-filter">×</button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="showcase-content">
        <div className="project-display">
          <div className={`project-card ${isAnimating ? 'animating' : ''}`}>
            <div className="card-background" style={{ background: `linear-gradient(135deg, ${currentProject.color}, transparent)` }} />
            
            <div className="card-image-container">
              <div className="image-frame">
                <div className="image-glow" style={{ background: currentProject.color }} />
                <img src={currentProject.image} alt={currentProject.title} className="project-image" />
                <div className="image-overlay">
                  <div className="overlay-content">
                    <button className="view-button">View Details</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-content">
              <h3 className="project-title">{currentProject.title}</h3>
              <p className="project-description">{currentProject.description}</p>
              
              <div className="tech-stack">
                {currentProject.technologies.map((tech, index) => (
                  <span
                    key={`${currentProject.id}-${tech}-${index}`}
                    className="tech-badge"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      borderColor: currentProject.color
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="project-actions">
                {currentProject.link && (
                  <a href={currentProject.link} className="action-button live" target="_blank" rel="noopener noreferrer">
                    <span>Live Demo</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                )}
                {currentProject.github && (
                  <a href={currentProject.github} className="action-button github" target="_blank" rel="noopener noreferrer">
                    <span>Source Code</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="project-navigation">
          <div className="nav-timeline">
            {projects.map((project, index) => (
              <button
                key={project.id}
                className={`timeline-item ${index === selectedProject ? 'active' : ''}`}
                onClick={() => handleProjectChange(index)}
                style={{ '--item-color': project.color } as React.CSSProperties}
              >
                <span className="item-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="item-title">{project.title}</span>
                <div className="item-progress" />
              </button>
            ))}
          </div>

          <div className="nav-controls">
            <button
              className="nav-button prev"
              onClick={() => handleProjectChange(Math.max(0, selectedProject - 1))}
              disabled={selectedProject === 0}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="nav-indicator">
              {String(selectedProject + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
            <button
              className="nav-button next"
              onClick={() => handleProjectChange(Math.min(projects.length - 1, selectedProject + 1))}
              disabled={selectedProject === projects.length - 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}