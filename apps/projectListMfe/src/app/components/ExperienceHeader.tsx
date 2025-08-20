import { IExperience } from '@thommf-portfolio/portfolio-store';
import './ExperienceHeader.scss';

interface ExperienceHeaderProps {
  experience: IExperience;
}

export const ExperienceHeader = ({ experience }: ExperienceHeaderProps) => {
  return (
    <header className="company-header">
      <div className="company-info">
        <h3>{experience.company}</h3>
        <h4>{experience.role} | {experience.startDate} – {experience.endDate || 'Present'}</h4>
        {experience.url && (
          <a href={experience.url} target="_blank" rel="noopener noreferrer">
            {experience.url}
          </a>
        )}
      </div>
    </header>
  );
};
