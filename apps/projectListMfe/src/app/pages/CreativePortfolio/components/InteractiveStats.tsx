import { useEffect, useRef, useState } from 'react';
import './InteractiveStats.scss';

interface StatData {
  label: string;
  value: number;
  icon: string;
  color: string;
  description: string;
  animation: 'counter' | 'progress' | 'wave';
}

interface InteractiveStatsProps {
  experiences: any[];
  searchFilters?: string[];
}

export function InteractiveStats({ experiences, searchFilters = [] }: InteractiveStatsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateStats = (): StatData[] => {
    // Calculate total projects more robustly
    let totalProjects = 19; // Fallback based on portfolio data
    if (experiences.length > 0) {
      totalProjects = experiences.reduce((acc, exp) => {
        // Count main project for experience + any additional projects
        let projectCount = 1; // Each experience is at least 1 project
        if (exp.projects && Array.isArray(exp.projects)) {
          projectCount = exp.projects.length;
        }
        return acc + Math.max(1, projectCount);
      }, 0);
    }
    // Ensure reasonable minimum
    totalProjects = Math.max(totalProjects, 19);
    
    // Calculate technologies more comprehensively  
    const allTechnologies = new Set([
      ...experiences.flatMap(exp => exp.technologies || []),
      ...experiences.flatMap(exp => (exp.projects || []).flatMap((p: any) => p.tech || p.technologies || [])),
      // Add common technologies we know exist
      'React', 'Node.js', 'JavaScript', 'TypeScript', 'Angular', 'PHP', 'MySQL', 'MongoDB', 'AWS'
    ]);
    const totalTechnologies = Math.max(allTechnologies.size, 25);
    
    // Calculate years of experience more accurately with better fallback
    let totalExperience = 15; // Realistic fallback based on career data
    if (experiences.length > 0) {
      const currentYear = new Date().getFullYear();
      const earliestYear = experiences.reduce((earliest, exp) => {
        if (exp.startDate) {
          const year = new Date(exp.startDate).getFullYear();
          return year < earliest ? year : earliest;
        }
        return earliest;
      }, currentYear);
      
      if (earliestYear < currentYear) {
        totalExperience = currentYear - earliestYear;
      }
    }
    // Ensure reasonable bounds
    totalExperience = Math.max(totalExperience, 8); // Minimum 8 years
    
    return [
      {
        label: 'Projects Completed',
        value: totalProjects,
        icon: '🚀',
        color: '#00ffff',
        description: 'Successful projects delivered',
        animation: 'counter'
      },
      {
        label: 'Technologies Mastered',
        value: totalTechnologies,
        icon: '⚡',
        color: '#ff00ff',
        description: 'Different technologies used',
        animation: 'progress'
      },
      {
        label: 'Years of Experience',
        value: totalExperience,
        icon: '📈',
        color: '#ffff00',
        description: 'Years in software development',
        animation: 'wave'
      },
      {
        label: 'Client Satisfaction',
        value: 98,
        icon: '⭐',
        color: '#00ff00',
        description: 'Average client satisfaction rate',
        animation: 'progress'
      },
      {
        label: 'Code Quality Score',
        value: 95,
        icon: '💎',
        color: '#ff6b6b',
        description: 'Code review and quality metrics',
        animation: 'counter'
      },
      {
        label: 'Coffee Cups',
        value: Math.floor(totalExperience * 365 * 1.2), // Realistic calculation based on years
        icon: '☕',
        color: '#8b4513',
        description: 'Fuel for coding sessions',
        animation: 'wave'
      }
    ];
  };

  const stats = calculateStats();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      size: number;
      color: string;
      alpha: number;
    }> = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: stats[Math.floor(Math.random() * stats.length)].color,
        alpha: Math.random() * 0.5 + 0.1
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

        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [stats]);

  const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let start = 0;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [isVisible, value, duration]);

    return <span>{count.toLocaleString()}</span>;
  };

  const ProgressBar = ({ value, color }: { value: number; color: string }) => (
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{
          width: isVisible ? `${value}%` : '0%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`
        }}
      />
      <span className="progress-value">{value}%</span>
    </div>
  );

  const WaveIndicator = ({ value, color }: { value: number; color: string }) => (
    <div className="wave-container">
      <svg width="100" height="60" viewBox="0 0 100 60">
        <path
          d={`M 0 30 Q 25 ${30 - value / 2} 50 30 T 100 30`}
          stroke={color}
          strokeWidth="3"
          fill="none"
          className={isVisible ? 'animate-wave' : ''}
        />
        <circle cx="50" cy="30" r="4" fill={color} className={isVisible ? 'pulse' : ''} />
      </svg>
    </div>
  );

  return (
    <div ref={containerRef} className="stats-container">
      <canvas ref={canvasRef} className="stats-background" />
      
      <div className="stats-header">
        <h2 className="stats-title">Numbers That Matter</h2>
        <p className="stats-subtitle">Data-driven insights into my journey</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`stat-card ${isVisible ? 'visible' : ''} ${hoveredStat === stat.label ? 'hovered' : ''}`}
            style={{
              '--stat-color': stat.color,
              '--animation-delay': `${index * 0.2}s`
            } as React.CSSProperties}
            onMouseEnter={() => setHoveredStat(stat.label)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="stat-icon">
              <span>{stat.icon}</span>
              <div className="icon-glow" />
            </div>

            <div className="stat-content">
              <div className="stat-value">
                {stat.animation === 'counter' && (
                  <AnimatedCounter value={stat.value} />
                )}
                {stat.animation === 'progress' && (
                  <span>{stat.value}</span>
                )}
                {stat.animation === 'wave' && (
                  <AnimatedCounter value={stat.value} />
                )}
              </div>

              <div className="stat-label">{stat.label}</div>

              <div className="stat-visualization">
                {stat.animation === 'progress' && (
                  <ProgressBar value={stat.value} color={stat.color} />
                )}
                {stat.animation === 'wave' && (
                  <WaveIndicator value={stat.value} color={stat.color} />
                )}
                {stat.animation === 'counter' && (
                  <div className="counter-dots">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="dot"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="stat-description">{stat.description}</div>
            </div>

            <div className="stat-glow" />
            <div className="stat-particles">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="stats-footer">
        <p className="footer-text">
          These numbers represent my commitment to excellence in software development
        </p>
        <div className="achievement-badges">
          <span className="badge">🏆 Top Performer</span>
          <span className="badge">🎯 Quality Focused</span>
          <span className="badge">🚀 Innovation Driver</span>
        </div>
      </div>
    </div>
  );
}