import { useState, useEffect, useRef, memo } from 'react';
import './Filter.scss';

export interface Suggestion {
  text: string;
  type: 'search' | 'link';
  url?: string;
}

interface FilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  suggestions: Suggestion[];
  children?: React.ReactNode;
}

export const Filter = memo(({
  searchTerm,
  onSearchChange,
  suggestions,
  children,
}: FilterProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [suggestionRemainder, setSuggestionRemainder] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm && isInputFocused) {
      const firstSearchSuggestion = suggestions.find(s => s.type === 'search');
      if (
        firstSearchSuggestion &&
        firstSearchSuggestion.text.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
        firstSearchSuggestion.text.toLowerCase() !== searchTerm.toLowerCase()
      ) {
        setSuggestionRemainder(firstSearchSuggestion.text.slice(searchTerm.length));
      } else {
        setSuggestionRemainder('');
      }
      
      if (suggestions.length > 0) {
        setShowSuggestions(true);
        setActiveSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      setSuggestionRemainder('');
    }
  }, [searchTerm, suggestions, isInputFocused]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    setSuggestionRemainder('');
    if (suggestion.type === 'link' && suggestion.url) {
      window.open(suggestion.url, '_blank');
    } else {
      onSearchChange(suggestion.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestionRemainder) {
      e.preventDefault();
      onSearchChange(searchTerm + suggestionRemainder);
      return;
    }
    
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1
        );
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };
  
  const renderSuggestionText = (suggestionText: string) => {
    if (!searchTerm) return <span>{suggestionText}</span>;
    const match = suggestionText.slice(0, searchTerm.length);
    const rest = suggestionText.slice(searchTerm.length);
    return (
      <span>
        <strong>{match}</strong>
        {rest}
      </span>
    );
  };
  
  const getIconForSuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === 'link') {
      return (
        <svg className="suggestion-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
      );
    }
    return (
      <svg className="suggestion-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    );
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 150);
  }

  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper" ref={wrapperRef}>
        <svg
          className="search-icon"
          xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <div className="inline-suggestion-display">
          <span className="user-text-twin">{searchTerm}</span>
          <span className="ghost-text">{suggestionRemainder}</span>
        </div>
        
        <input
          type="text"
          placeholder="Filter by technology, project, or keyword..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="search-input"
          autoComplete="off"
        />

        {showSuggestions && searchTerm && suggestions.length > 0 && (
          <ul className="autocomplete-suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.text}
                className={'suggestion-item' + (index === activeSuggestionIndex ? ' active' : '')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                <div className="suggestion-content">
                  {getIconForSuggestion(suggestion)}
                  {renderSuggestionText(suggestion.text)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
    </div>
  );
});

Filter.displayName = 'Filter';
