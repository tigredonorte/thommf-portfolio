export interface IProject {
  title: string;
  description: string;
  tech: string[];
  images: string[];
  url?: string;
  isOnline: boolean;
  industry: string;
}

export interface IExperience {
  company: string;
  url?: string;
  role: string;
  startDate: string;
  endDate: string;
  projects: IProject[];
}

export interface PortfolioState {
  experiences: IExperience[];
  filteredExperiences: IExperience[];
  searchFilters: string[];
  highlightedFilters: string[];
}

export interface FilterCriteria {
  searchTerms?: string[];
  industries?: string[];
  technologies?: string[];
}
