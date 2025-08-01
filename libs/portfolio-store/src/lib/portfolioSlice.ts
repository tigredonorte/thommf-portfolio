import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioState, IExperience, FilterCriteria } from './portfolioTypes';

const initialState: PortfolioState = {
  experiences: [],
  filteredExperiences: [],
  searchFilters: [],
  highlightedFilters: [],
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setExperiences: (state, action: PayloadAction<IExperience[]>) => {
      state.experiences = action.payload;
      state.filteredExperiences = action.payload;
    },
    
    setSearchFilters: (state, action: PayloadAction<string[]>) => {
      state.searchFilters = action.payload;
      state.filteredExperiences = filterExperiences(state.experiences, {
        searchTerms: action.payload,
      });
    },
    
    setHighlightedFilters: (state, action: PayloadAction<string[]>) => {
      state.highlightedFilters = action.payload;
    },
    
    addSearchFilter: (state, action: PayloadAction<string>) => {
      if (!state.searchFilters.includes(action.payload)) {
        state.searchFilters.push(action.payload);
        state.filteredExperiences = filterExperiences(state.experiences, {
          searchTerms: state.searchFilters,
        });
      }
    },
    
    removeSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilters = state.searchFilters.filter(filter => filter !== action.payload);
      state.filteredExperiences = filterExperiences(state.experiences, {
        searchTerms: state.searchFilters,
      });
    },
    
    clearAllFilters: (state) => {
      state.searchFilters = [];
      state.filteredExperiences = state.experiences;
    },
    
    applyFilters: (state, action: PayloadAction<FilterCriteria>) => {
      state.filteredExperiences = filterExperiences(state.experiences, action.payload);
    },
  },
});

function filterExperiences(experiences: IExperience[], criteria: FilterCriteria): IExperience[] {
  if (!criteria.searchTerms || criteria.searchTerms.length === 0) {
    return experiences;
  }

  return experiences.map(experience => {
    const filteredProjects = experience.projects.filter(project => {
      return criteria.searchTerms?.some(term => {
        const termLower = term.toLowerCase();
        return (
          project.title.toLowerCase().includes(termLower) ||
          project.description.toLowerCase().includes(termLower) ||
          project.tech.some(tech => tech.toLowerCase().includes(termLower)) ||
          (project.industry && project.industry.toLowerCase().includes(termLower))
        );
      }) || false;
    });

    return {
      ...experience,
      projects: filteredProjects,
    };
  }).filter(experience => experience.projects.length > 0);
}

export const {
  setExperiences,
  setSearchFilters,
  setHighlightedFilters,
  addSearchFilter,
  removeSearchFilter,
  clearAllFilters,
  applyFilters,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
