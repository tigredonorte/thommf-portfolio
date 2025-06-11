export interface PortfolioConfig {
  developerName: string;
  developerRole: string;
  socials: {
    linkedin: string;
    github: string;
  };
}

export const config: PortfolioConfig = {
  developerName: 'Thompson Filgueiras',
  developerRole: 'Software Engineer',
  socials: {
    linkedin: 'https://linkedin.com/in/thomfilg',
    github: 'https://github.com/tigredonorte',
  },
};