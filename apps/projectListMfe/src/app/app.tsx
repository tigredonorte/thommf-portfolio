import { config } from '@thommf-portfolio/config';
import { useCallback, useMemo, useState } from 'react';
import './app.scss';
import { Experience } from './components/Experience';
import { Filter, Suggestion, HighlightedFilters } from './components/Filter';
import { ExperienceProvider } from './contexts/ExperienceContext';

const getAllSuggestions = (): Suggestion[] => {
  const allSearchableTerms = new Set<string>();
  config.experience.forEach((exp) => {
    exp.projects.forEach((proj) => {
      proj.tech.forEach((t) => allSearchableTerms.add(t));
      if (proj.industry) {
        allSearchableTerms.add(proj.industry);
      }
    });
  });

  const searchSuggestions: Suggestion[] = Array.from(allSearchableTerms)
    .sort((a, b) => a.localeCompare(b))
    .map(term => ({ text: term, type: 'search' }));

  const linkSuggestions: Suggestion[] = [
    { text: 'GitHub Profile', type: 'link', url: config.socials.github },
    { text: 'LinkedIn Profile', type: 'link', url: config.socials.linkedin },
  ];

  return [...searchSuggestions, ...linkSuggestions];
};

const highlightedTechnologies = [
  'Angular',
  'React',
  'Node.js',
  'MongoDB',
  'Fintech',
];

export function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHighlighted, setHighlightedTechnology] = useState('');
  const allSuggestions = useMemo(() => getAllSuggestions(), []);

  const handleFilterChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleHighlightedFilterSelect = useCallback((term: string) => {
    if (selectedHighlighted === term) {
      setHighlightedTechnology('');
      setSearchTerm('');
      return;
    }

    setHighlightedTechnology(term);
    setSearchTerm(term);
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [selectedHighlighted]);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedFilter = searchTerm.toLowerCase();

    const startsWithMatches: Suggestion[] = [];
    const includesMatches: Suggestion[] = [];

    allSuggestions.forEach(s => {
      const lowercasedText = s.text.toLowerCase();
      if (lowercasedText.startsWith(lowercasedFilter)) {
        startsWithMatches.push(s);
      } else if (lowercasedText.includes(lowercasedFilter)) {
        includesMatches.push(s);
      }
    });

    return [...startsWithMatches, ...includesMatches];
  }, [searchTerm, allSuggestions]);
  
  const filteredExperience = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) return config.experience;

    const isKnownTerm = allSuggestions.some(s => s.type === 'search' && s.text.toLowerCase() === lowercasedFilter);

    return config.experience
      .map((exp) => {
        const filteredProjects = exp.projects.filter((proj) => {
          if (isKnownTerm) {
            const techMatch = proj.tech?.some((t) => t.toLowerCase() === lowercasedFilter);
            const industryMatch = proj.industry?.toLowerCase() === lowercasedFilter;
            return techMatch || industryMatch;
          }
          const textMatch =
            (proj.title && proj.title.toLowerCase().includes(lowercasedFilter)) ||
            (proj.description && proj.description.toLowerCase().includes(lowercasedFilter)) ||
            (proj.industry && proj.industry.toLowerCase().includes(lowercasedFilter)) ||
            (exp.company && exp.company.toLowerCase().includes(lowercasedFilter)) ||
            (proj.tech && proj.tech.some((t) => t && t.toLowerCase().includes(lowercasedFilter)));
          
          return textMatch;
        });
        return { ...exp, projects: filteredProjects };
      })
      .filter((exp) => exp.projects.length > 0);
  }, [searchTerm, allSuggestions]);

  return (
    <div className="wrapper">
      <h2 className="main-title">Career & Projects</h2>

      <Filter
        searchTerm={searchTerm}
        onSearchChange={handleFilterChange}
        suggestions={filteredSuggestions}
      >
        <HighlightedFilters
          technologies={highlightedTechnologies}
          onFilterSelect={handleHighlightedFilterSelect}
          activeFilter={searchTerm}
        />
      </Filter>

      {filteredExperience.length > 0 ? (
        filteredExperience.map((experience) => (
          <ExperienceProvider experience={experience} key={experience.company}>
            <Experience />
          </ExperienceProvider>
        ))
      ) : (
        <div className="no-results">
          <h3>No projects found for "{searchTerm}"</h3>
          <p>Try searching for a different technology or keyword.</p>
        </div>
      )}
    </div>
  );
}

export default App;
