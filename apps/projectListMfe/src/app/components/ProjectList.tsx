import { IProject } from '@thommf-portfolio/config';
import { Project } from './Project';
import './ProjectList.scss';

interface ProjectListProps {
  projects: IProject[];
}

export const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <div className="projects-container">
      {projects.map((project) => (
        <Project key={project.title} project={project} />
      ))}
    </div>
  );
};
