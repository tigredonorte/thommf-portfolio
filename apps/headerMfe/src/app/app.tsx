import './app.scss';
import { config } from '@thommf-portfolio/config';

export function App() {
  // Get the current path from the browser's URL
  const currentPath = window.location.pathname;

  return (
    <header className="header">
      <div className="brand">
        <h1>{config.developerName}</h1>
        <p>{config.developerRole}</p>
      </div>
      <nav>
        {/* Conditionally apply the 'active' class if the path is the root */}
        <a href="/" className={currentPath === '/' ? 'active' : ''}>
          Projects
        </a>
        <a href={config.socials.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={config.socials.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </nav>
    </header>
  );
}

export default App;
