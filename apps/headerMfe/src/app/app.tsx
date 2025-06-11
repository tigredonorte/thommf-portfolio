import './app.scss';
import { config } from '@thommf-portfolio/config';

export function App() {
  return (
    <header className="header">
      <div className="brand">
        <h1>{config.developerName}</h1>
        <p>{config.developerRole}</p>
      </div>
      <nav>
        <a href="/">Projects</a>
        <a href={config.socials.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={config.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </nav>
    </header>
  );
}

export default App;