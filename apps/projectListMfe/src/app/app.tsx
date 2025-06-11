import './app.scss';
import { portfolioData } from './projects';

export function App() {
  return (
    <div className="wrapper">
      <h2 className="main-title">Career & Projects</h2>
      {portfolioData.map((company) => (
        <section key={company.company} className="company-section">
          <header className="company-header">
            <h3>{company.company}</h3>
            <h4>{company.role}</h4>
            {company.url && (
              <a href={company.url} target="_blank" rel="noopener noreferrer">
                {company.url}
              </a>
            )}
          </header>
          <ul className="project-list">
            {company.projects.map((project, index) => (
              <li key={index}>{project}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default App;