
import {
  clearAllFilters,
  selectFilteredExperiences,
  selectFilterSuggestions,
  setSearchFilters
} from '@thommf-portfolio/portfolio-store';

import { useAppDispatch, useAppSelector } from '@thommf-portfolio/store';
import { useCallback, useMemo, useState } from 'react';
import './app.scss';
import { Experience } from './components/Experience';
import { Filter, HighlightedFilters, Suggestion } from './components/Filter';
import { ExperienceProvider } from './contexts/ExperienceContext';

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
  const dispatch = useAppDispatch();
  
  const filteredExperiences = useAppSelector(selectFilteredExperiences);
  const filterSuggestions = useAppSelector(selectFilterSuggestions);

  const allSuggestions = useMemo(() => {
    return filterSuggestions.map(suggestion => ({
      text: suggestion.text,
      type: 'search' as const
    }));
  }, [filterSuggestions]);

  const handleFilterChange = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (term.trim()) {
      dispatch(setSearchFilters([term.trim()]));

      if (selectedHighlighted && selectedHighlighted !== term.trim()) {
        setHighlightedTechnology('');
      }
    } else {
      console.log('Search term is empty, clearing all filters');
      dispatch(clearAllFilters());
      setHighlightedTechnology('');
    }
  }, [dispatch, selectedHighlighted]);

  const handleHighlightedFilterSelect = useCallback((term: string) => {
    if (selectedHighlighted === term) {
      setHighlightedTechnology('');
      setSearchTerm('');
      dispatch(clearAllFilters());
      return;
    }

    setHighlightedTechnology(term);
    setSearchTerm(term);
    dispatch(setSearchFilters([term]));
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [selectedHighlighted, dispatch]);

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

      {filteredExperiences.length > 0 ? (
        filteredExperiences.map((experience) => (
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
