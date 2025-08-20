import { useState } from 'react';
import './TimelineView.scss';

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  company: string;
  description: string;
  technologies: string[];
  type: 'work' | 'education' | 'project';
  duration: string;
  location?: string;
}

interface TimelineViewProps {
  experiences: any[];
  searchFilters?: string[];
}

export function TimelineView({ experiences, searchFilters = [] }: TimelineViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'work' | 'education' | 'project'>('all');

  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate) return '1 year';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '1 year';
    }
    
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    
    const totalMonths = Math.max(1, years * 12 + months); // Ensure minimum 1 month
    
    if (totalMonths < 12) {
      return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    } else {
      const yearsDiff = Math.floor(totalMonths / 12);
      const monthsDiff = totalMonths % 12;
      let result = `${yearsDiff} year${yearsDiff !== 1 ? 's' : ''}`;
      if (monthsDiff > 0) {
        result += ` ${monthsDiff} month${monthsDiff !== 1 ? 's' : ''}`;
      }
      return result;
    }
  };

  const extractEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = experiences.map((exp, index) => {
      const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : null;
      const validYear = startYear && !isNaN(startYear) ? startYear : 2020 + index;
      
      return {
        id: `exp-${index}`,
        year: validYear,
        title: exp.title || exp.role || `Position ${index + 1}`,
        company: exp.company || exp.organization || 'Company',
        description: exp.description || exp.summary || 'Professional experience in software development',
        technologies: exp.technologies || exp.projects?.flatMap((p: any) => p.tech || []) || [],
        type: 'work' as const,
        duration: exp.duration || calculateDuration(exp.startDate, exp.endDate),
        location: exp.location
      };
    });

    if (events.length === 0) {
      return [
        {
          id: '1',
          year: 2024,
          title: 'Senior Full Stack Developer',
          company: 'Tech Innovations Inc.',
          description: 'Led development of enterprise applications using React, Node.js, and cloud technologies. Mentored junior developers and implemented best practices.',
          technologies: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript'],
          type: 'work',
          duration: '2 years',
          location: 'Remote'
        },
        {
          id: '2',
          year: 2022,
          title: 'Full Stack Developer',
          company: 'Digital Solutions Ltd.',
          description: 'Developed scalable web applications and RESTful APIs. Collaborated with cross-functional teams to deliver high-quality software.',
          technologies: ['Angular', 'Python', 'PostgreSQL', 'Docker'],
          type: 'work',
          duration: '2 years',
          location: 'New York, NY'
        },
        {
          id: '3',
          year: 2020,
          title: 'Computer Science Degree',
          company: 'University of Technology',
          description: 'Bachelor of Science in Computer Science with focus on software engineering and web technologies.',
          technologies: ['Java', 'C++', 'Database Design', 'Algorithms'],
          type: 'education',
          duration: '4 years',
          location: 'California'
        },
        {
          id: '4',
          year: 2021,
          title: 'E-Commerce Platform',
          company: 'Personal Project',
          description: 'Built a full-stack e-commerce platform with payment integration and real-time inventory management.',
          technologies: ['React', 'Express.js', 'Stripe API', 'Redis'],
          type: 'project',
          duration: '6 months'
        }
      ];
    }

    return events;
  };

  const events = extractEvents();
  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);
  const years = Array.from(new Set(filteredEvents.map(e => e.year))).sort((a, b) => b - a);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return '💼';
      case 'education':
        return '🎓';
      case 'project':
        return '🚀';
      default:
        return '📌';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'work':
        return '#00ffff';
      case 'education':
        return '#ff00ff';
      case 'project':
        return '#ffff00';
      default:
        return '#ffffff';
    }
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2 className="timeline-title">Journey Through Time</h2>
        <p className="timeline-subtitle">Explore my professional evolution</p>
      </div>

      <div className="timeline-filters">
        {(['all', 'work', 'education', 'project'] as const).map(filterType => (
          <button
            key={filterType}
            className={`filter-btn ${filter === filterType ? 'active' : ''}`}
            onClick={() => setFilter(filterType)}
          >
            <span className="filter-icon">{getEventTypeIcon(filterType)}</span>
            <span className="filter-text">
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </span>
          </button>
        ))}
      </div>

      <div className="timeline-content">
        <div className="timeline-spine" />
        
        {years.map((year, yearIndex) => {
          const yearEvents = filteredEvents.filter(e => e.year === year);
          
          return (
            <div key={year} className="timeline-year-group">
              <div className="year-marker">
                <div className="year-dot" />
                <span className="year-label">{year}</span>
              </div>

              <div className="year-events">
                {yearEvents.map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={`timeline-event ${selectedEvent === event.id ? 'selected' : ''} ${event.type}`}
                    style={{
                      '--event-color': getEventTypeColor(event.type),
                      '--animation-delay': `${(yearIndex * yearEvents.length + eventIndex) * 0.1}s`
                    } as React.CSSProperties}
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  >
                    <div className="event-connector" />
                    
                    <div className="event-card">
                      <div className="event-header">
                        <div className="event-type-badge">
                          <span className="event-icon">{getEventTypeIcon(event.type)}</span>
                        </div>
                        <div className="event-meta">
                          <h3 className="event-title">{event.title}</h3>
                          <p className="event-company">{event.company}</p>
                          <div className="event-details">
                            <span className="event-duration">{event.duration}</span>
                            {event.location && (
                              <span className="event-location">📍 {event.location}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`event-content ${selectedEvent === event.id ? 'expanded' : ''}`}>
                        <p className="event-description">{event.description}</p>
                        
                        {event.technologies.length > 0 && (
                          <div className="event-technologies">
                            <h4>Technologies Used:</h4>
                            <div className="tech-list">
                              {event.technologies.map((tech, index) => (
                                <span
                                  key={`${event.id}-${tech}-${index}`}
                                  className="tech-badge"
                                  style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="event-glow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="timeline-stats">
        <div className="stat-card">
          <div className="stat-number">{events.filter(e => e.type === 'work').length}</div>
          <div className="stat-label">Work Experiences</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{events.filter(e => e.type === 'project').length}</div>
          <div className="stat-label">Projects Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{years.length}</div>
          <div className="stat-label">Years of Experience</div>
        </div>
      </div>
    </div>
  );
}