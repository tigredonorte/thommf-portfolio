import { useExperience } from '../../../contexts/ExperienceContext';
import { ExperienceHeader } from './ExperienceHeader';
import { ProjectList } from './ProjectList';
import './Experience.scss';

export const Experience = () => {
  const { experience } = useExperience();

  return (
    <section className="company-section">
      <ExperienceHeader experience={experience} />
      <ProjectList projects={experience.projects} />
    </section>
  );
};
