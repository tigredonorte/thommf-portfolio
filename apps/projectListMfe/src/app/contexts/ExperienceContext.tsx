import { createContext, useContext, ReactNode } from 'react';
import { IExperience } from '@thommf-portfolio/portfolio-store';

interface ExperienceContextType {
  experience: IExperience;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export const ExperienceProvider = ({ children, experience }: { children: ReactNode, experience: IExperience }) => {
  return (
    <ExperienceContext.Provider value={{ experience }}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (context === undefined) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
