
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
  startDate: string; // New field
  endDate: string; // New field
  projects: IProject[];
}

export interface PortfolioConfig {
  developerName: string;
  developerRole: string;
  socials: {
    linkedin: string;
    github: string;
  };
  experience: IExperience[];
}
