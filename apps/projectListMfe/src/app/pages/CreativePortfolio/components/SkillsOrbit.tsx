import { useEffect, useRef, useState } from 'react';
import './SkillsOrbit.scss';

interface Skill {
  name: string;
  level: number;
  category: string;
  color: string;
}

interface SkillsOrbitProps {
  experiences: any[];
  onFilterSelect?: (filter: string) => void;
  searchFilters?: string[];
}

export function SkillsOrbit({ experiences, onFilterSelect, searchFilters = [] }: SkillsOrbitProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const extractSkills = (): Skill[] => {
    const skillMap = new Map<string, { count: number; category: string }>();
    
    experiences.forEach(exp => {
      // Extract technologies from experience-level
      (exp.technologies || []).forEach((tech: string) => {
        const current = skillMap.get(tech) || { count: 0, category: 'Technologies' };
        skillMap.set(tech, { count: current.count + 1, category: 'Technologies' });
      });

      // Extract technologies from projects
      (exp.projects || []).forEach((project: any) => {
        (project.tech || project.technologies || []).forEach((tech: string) => {
          const current = skillMap.get(tech) || { count: 0, category: 'Technologies' };
          skillMap.set(tech, { count: current.count + 1, category: 'Technologies' });
        });
      });
    });

    const defaultSkills: Skill[] = [
      { name: 'React', level: 95, category: 'Frontend', color: '#61DAFB' },
      { name: 'Angular', level: 90, category: 'Frontend', color: '#DD0031' },
      { name: 'Vue.js', level: 85, category: 'Frontend', color: '#4FC08D' },
      { name: 'Node.js', level: 92, category: 'Backend', color: '#339933' },
      { name: 'Python', level: 88, category: 'Backend', color: '#3776AB' },
      { name: 'TypeScript', level: 94, category: 'Languages', color: '#3178C6' },
      { name: 'MongoDB', level: 86, category: 'Database', color: '#47A248' },
      { name: 'PostgreSQL', level: 84, category: 'Database', color: '#4169E1' },
      { name: 'Docker', level: 89, category: 'DevOps', color: '#2496ED' },
      { name: 'AWS', level: 87, category: 'Cloud', color: '#FF9900' },
      { name: 'GraphQL', level: 83, category: 'API', color: '#E10098' },
      { name: 'Redis', level: 81, category: 'Database', color: '#DC382D' }
    ];

    const skills: Skill[] = Array.from(skillMap.entries()).map(([name, data]) => ({
      name,
      level: Math.min(95, 60 + data.count * 10),
      category: data.category,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    return skills.length > 0 ? skills : defaultSkills;
  };

  const skills = extractSkills();
  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, 0.5)`
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        particles.forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="skills-orbit-container">
      <canvas ref={canvasRef} className="background-canvas" />
      
      <div className="skills-header">
        <h2 className="skills-title">Technical Universe</h2>
        <p className="skills-subtitle">Navigate through my technical expertise</p>
      </div>

      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="orbit-system">
        <div className="central-core">
          <div className="core-glow" />
          <span className="core-text">Skills</span>
        </div>

        {filteredSkills.map((skill, index) => {
          const angle = (index / filteredSkills.length) * Math.PI * 2;
          const radius = 200 + (skill.level / 100) * 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={skill.name}
              className={`skill-planet ${hoveredSkill === skill.name ? 'hovered' : ''}`}
              style={{
                '--x': `${x}px`,
                '--y': `${y}px`,
                '--color': skill.color,
                '--size': `${30 + skill.level / 5}px`,
                '--orbit-radius': `${radius}px`,
                animationDelay: `${index * 0.1}s`
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
              onClick={() => onFilterSelect && onFilterSelect(skill.name)}
            >
              <div className="planet-orbit" />
              <div className="planet-body">
                <span className="planet-name">{skill.name}</span>
                <div className="planet-glow" />
              </div>
              <div className="skill-tooltip">
                <div className="tooltip-content">
                  <h4>{skill.name}</h4>
                  <div className="skill-level">
                    <span>Proficiency</span>
                    <div className="level-bar">
                      <div className="level-fill" style={{ width: `${skill.level}%` }} />
                    </div>
                    <span>{skill.level}%</span>
                  </div>
                  <span className="skill-category">{skill.category}</span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="orbit-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
        </div>
      </div>

      <div className="skills-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'linear-gradient(45deg, #00ffff, #0099cc)' }} />
          <span>Frontend</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'linear-gradient(45deg, #ff00ff, #cc00cc)' }} />
          <span>Backend</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'linear-gradient(45deg, #ffff00, #cccc00)' }} />
          <span>Database</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'linear-gradient(45deg, #00ff00, #00cc00)' }} />
          <span>DevOps</span>
        </div>
      </div>
    </div>
  );
}