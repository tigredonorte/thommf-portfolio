import { useAppDispatch, useAppSelector } from '@thommf-portfolio/store';
import { 
  selectFilteredExperiences,
  selectFilterSuggestions,
  selectSearchFilters,
  setSearchFilters,
  clearAllFilters
} from '@thommf-portfolio/portfolio-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import './CreativePortfolio.scss';
import { HeroSection } from './components/HeroSection';
import { ProjectShowcase } from './components/ProjectShowcase';
import { SkillsOrbit } from './components/SkillsOrbit';
import { TimelineView } from './components/TimelineView';
import { InteractiveStats } from './components/InteractiveStats';
import { ContactSection } from './components/ContactSection';

export function CreativePortfolio() {
  const dispatch = useAppDispatch();
  const experiences = useAppSelector(selectFilteredExperiences);
  const filterSuggestions = useAppSelector(selectFilterSuggestions);
  const searchFilters = useAppSelector(selectSearchFilters);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter management functions
  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.trim()) {
      dispatch(setSearchFilters([searchTerm.trim()]));
    } else {
      dispatch(clearAllFilters());
    }
  }, [dispatch]);

  const handleFilterSelect = useCallback((filter: string) => {
    dispatch(setSearchFilters([filter]));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearAllFilters());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(Math.min(progress * 100, 100));
      
      // More accurate section detection based on viewport
      const sections = document.querySelectorAll('[id^="section-"]');
      let currentSectionIndex = 0;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const container = containerRef.current!;
        const containerRect = container.getBoundingClientRect();
        
        // Calculate relative position within container
        const relativeTop = rect.top - containerRect.top;
        
        if (relativeTop <= clientHeight / 2 && relativeTop > -clientHeight / 2) {
          currentSectionIndex = index;
        }
      });
      
      setActiveSection(currentSectionIndex);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Initial call to set correct section
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
    
    return undefined;
  }, []);

  return (
    <div className="creative-portfolio" ref={containerRef}>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      
      <nav className="floating-nav">
        {['Home', 'Projects', 'Skills', 'Timeline', 'Stats', 'Contact'].map((item, index) => (
          <button
            key={item}
            className={`nav-dot ${activeSection === index ? 'active' : ''}`}
            onClick={() => {
              const section = document.getElementById(`section-${index}`);
              section?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={item}
          >
            <span className="tooltip">{item}</span>
          </button>
        ))}
      </nav>

      <section id="section-0" className="portfolio-section hero-section">
        <HeroSection />
      </section>

      <section id="section-1" className="portfolio-section showcase-section">
        <ProjectShowcase 
          experiences={experiences} 
          onSearch={handleSearch}
          onFilterSelect={handleFilterSelect}
          onClearFilters={handleClearFilters}
          searchFilters={searchFilters}
          filterSuggestions={filterSuggestions}
        />
      </section>

      <section id="section-2" className="portfolio-section skills-section">
        <SkillsOrbit 
          experiences={experiences}
          onFilterSelect={handleFilterSelect}
          searchFilters={searchFilters}
        />
      </section>

      <section id="section-3" className="portfolio-section timeline-section">
        <TimelineView 
          experiences={experiences}
          searchFilters={searchFilters}
        />
      </section>

      <section id="section-4" className="portfolio-section stats-section">
        <InteractiveStats 
          experiences={experiences}
          searchFilters={searchFilters}
        />
      </section>

      <section id="section-5" className="portfolio-section contact-section">
        <ContactSection />
      </section>
    </div>
  );
}