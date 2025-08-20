import { useEffect, useState } from 'react';
import { useAppSelector } from '@thommf-portfolio/store';
import { 
  selectTotalProjectsCount, 
  selectExperiences,
  selectAllTechnologies 
} from '@thommf-portfolio/portfolio-store';
import { config } from '@thommf-portfolio/config';
import './HeroSection.scss';

export function HeroSection() {
  // Redux selectors for real data
  const totalProjects = useAppSelector(selectTotalProjectsCount);
  const experiences = useAppSelector(selectExperiences);
  const allTechnologies = useAppSelector(selectAllTechnologies);
  
  // Calculate years of experience from experiences data
  const calculateYearsOfExperience = (experiences: any[]) => {
    if (experiences.length === 0) return 0;
    
    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;
    
    const parseWorkDate = (dateStr: string): Date | null => {
      if (!dateStr || dateStr === 'Present') return null;
      
      const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const parts = dateStr.split(' ');
      if (parts.length !== 2) return null;
      
      const [monthStr, yearStr] = parts;
      const month = months[monthStr];
      const year = parseInt(yearStr, 10);
      
      if (month === undefined || isNaN(year)) return null;
      
      return new Date(year, month);
    };
    
    experiences.forEach((exp) => {
      const startDate = parseWorkDate(exp.startDate);
      if (!earliestStart || (startDate && startDate < earliestStart)) {
        earliestStart = startDate;
      }
      
      const endDate = exp.endDate === 'Present' ? new Date() : parseWorkDate(exp.endDate);
      if (!latestEnd || (endDate && endDate > latestEnd)) {
        latestEnd = endDate;
      }
    });
    
    if (!earliestStart || !latestEnd) return 0;
    
    const diffInMs = (latestEnd as Date).getTime() - (earliestStart as Date).getTime();
    const yearsExperience = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.floor(yearsExperience);
  };
  
  const yearsOfExperience = calculateYearsOfExperience(experiences);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({ projects: 0, experience: 0, technologies: 0 });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Use real data from Redux instead of hardcoded values
    const targetStats: { projects: number; experience: number; technologies: number } = { 
      projects: totalProjects || 0, 
      experience: yearsOfExperience || 0, 
      technologies: allTechnologies?.length || 0 
    };
    
    const timeout = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setStats({
          projects: Math.floor(targetStats.projects * progress),
          experience: Math.floor(targetStats.experience * progress),
          technologies: Math.floor(targetStats.technologies * progress)
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [totalProjects, yearsOfExperience, allTechnologies]);

  const roles = ['Software Engineer', 'UI/UX Enthusiast', 'Problem Solver', 'Tech Innovator'];
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <div className={`hero-container ${isLoaded ? 'loaded' : ''}`}>
      <div className="hero-background">
        <div className="particle-field">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }} />
          ))}
        </div>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      <div className="hero-content" style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
      }}>
        <div className="glitch-wrapper">
          <h1 className="hero-title" data-text="Thompson Filgueiras">
            {config.developerName}
          </h1>
        </div>
        
        <div className="role-carousel">
          <span className="role-prefix">I am a</span>
          <div className="role-slider">
            {roles.map((role, index) => (
              <span
                key={role}
                className={`role ${index === currentRole ? 'active' : ''}`}
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-cta">
          <p className="hero-description">Crafting exceptional digital experiences with cutting-edge technologies</p>
        </div>

        <div className="hero-cta">
          <button className="cta-button primary">
            <span className="button-text">Explore My Work</span>
            <div className="button-glow" />
          </button>
          <button className="cta-button secondary">
            <span className="button-text">Download CV</span>
            <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L12 16M12 16L17 11M12 16L7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">{stats.projects}</span>
            <span className="stat-label">Projects Completed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.experience}</span>
            <span className="stat-label">Years Experience</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.technologies}</span>
            <span className="stat-label">Technologies</span>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel" />
        </div>
        <span className="scroll-text">Scroll to explore</span>
      </div>
    </div>
  );
}