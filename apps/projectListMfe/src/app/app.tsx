import { config } from '@thommf-portfolio/config';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './app.scss';
import { Experience } from './components/Experience';
import { ExperienceProvider } from './contexts/ExperienceContext';

export function App() {
  const experiences = config.experience;
  return (
    <div className="wrapper">
      <h2 className="main-title">Career & Projects</h2>
      {experiences.map((experience) => (
        <ExperienceProvider experience={experience} key={experience.company}>
          <Experience />
        </ExperienceProvider>
      ))}
    </div>
  );
}

export default App;