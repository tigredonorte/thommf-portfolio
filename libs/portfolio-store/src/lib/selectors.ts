import { createSelector } from '@reduxjs/toolkit';
import { IExperience, PortfolioState } from './portfolioTypes';

interface RootState {
  portfolio: PortfolioState;
}

// Basic selectors
export const selectPortfolioState = (state: RootState) => state.portfolio;
export const selectExperiences = (state: RootState) => state.portfolio.experiences;
export const selectFilteredExperiences = (state: RootState) => state.portfolio.filteredExperiences;
export const selectSearchFilters = (state: RootState) => state.portfolio.searchFilters;
export const selectHighlightedFilters = (state: RootState) => state.portfolio.highlightedFilters;

// Memoized selectors
export const selectAllTechnologies = createSelector(
  [selectExperiences],
  (experiences: IExperience[]) => {
    const techSet = new Set<string>();
    experiences.forEach((exp) => {
      exp.projects.forEach((project) => {
        project.tech.forEach((tech: string) => techSet.add(tech));
      });
    });
    return Array.from(techSet).sort();
  }
);

export const selectAllIndustries = createSelector(
  [selectExperiences],
  (experiences: IExperience[]) => {
    const industrySet = new Set<string>();
    experiences.forEach((exp) => {
      exp.projects.forEach((project) => {
        if (project.industry) {
          industrySet.add(project.industry);
        }
      });
    });
    return Array.from(industrySet).sort();
  }
);

export const selectFilterSuggestions = createSelector(
  [selectAllTechnologies, selectAllIndustries],
  (technologies, industries) => {
    return [
      ...technologies.map(tech => ({ text: tech, type: 'technology' as const })),
      ...industries.map(industry => ({ text: industry, type: 'industry' as const }))
    ].sort((a, b) => a.text.localeCompare(b.text));
  }
);

export const selectTotalProjectsCount = createSelector(
  [selectExperiences],
  (experiences: IExperience[]) => {
    return experiences.reduce((total: number, exp) => total + exp.projects.length, 0);
  }
);

export const selectFilteredProjectsCount = createSelector(
  [selectFilteredExperiences],
  (filteredExperiences: IExperience[]) => {
    return filteredExperiences.reduce((total: number, exp) => total + exp.projects.length, 0);
  }
);

export const selectHasActiveFilters = createSelector(
  [selectSearchFilters],
  (searchFilters) => searchFilters.length > 0
);
