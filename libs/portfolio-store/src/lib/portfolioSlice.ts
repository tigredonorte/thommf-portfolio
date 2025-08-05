import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioState, IExperience, FilterCriteria } from './portfolioTypes';
import { portfolioEn } from './lang/en';

export const initialState: PortfolioState = {
  experiences: portfolioEn,
  filteredExperiences: portfolioEn,
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

  const termsLower = criteria.searchTerms.map(t => t.toLowerCase().trim());

  return experiences
    .map(experience => {
      // Check if the search term matches the company or role
      const isExperienceMatch = termsLower.some(term =>
        experience.company.toLowerCase().includes(term) ||
        experience.role.toLowerCase().includes(term)
      );

      // If the company/role matches, return the whole experience with all its projects
      if (isExperienceMatch) {
        return experience;
      }

      // If not, check if any projects match (original behavior)
      const matchingProjects = experience.projects.filter(project => {
        return termsLower.some(term =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.tech.some(tech => tech.toLowerCase().includes(term)) ||
          (project.industry && project.industry.toLowerCase().includes(term))
        );
      });

      // If only projects matched, return the experience with just those projects
      if (matchingProjects.length > 0) {
        return { ...experience, projects: matchingProjects };
      }

      // If no match at all, return null to be filtered out
      return null;
    })
    .filter((experience): experience is IExperience => experience !== null);
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

export const portfolioActions = {
  setExperiences,
  setSearchFilters,
  setHighlightedFilters,
  addSearchFilter,
  removeSearchFilter,
  clearAllFilters,
  applyFilters,
};


export const portfolioReducer = portfolioSlice.reducer;
