import './HighlightedFilters.scss';

interface HighlightedFiltersProps {
  technologies: string[];
  activeFilter: string | null;
  onFilterSelect: (tech: string) => void;
}

export const HighlightedFilters = ({
  technologies,
  activeFilter,
  onFilterSelect,
}: HighlightedFiltersProps) => {
  return (
    <div className="highlighted-filters-container">
      <div className="filters-list">
        {technologies.map((tech) => (
          <button
            key={tech}
            onClick={() => onFilterSelect(tech)}
            className={activeFilter === tech ? 'active' : ''}
          >
            {tech}
          </button>
        ))}
      </div>
    </div>
  );
};
