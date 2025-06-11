import * as React from 'react';
import './app.scss';

const Header = React.lazy(() => import('headerMfe/Module'));
const ProjectList = React.lazy(() => import('projectListMfe/Module'));

export function App() {
  return (
    <React.Suspense fallback={<div className="loader">Loading...</div>}>
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <ProjectList />
        </main>
        <footer className="footer">
          <p>© 2025 Your Name. Built with Microfrontends.</p>
        </footer>
      </div>
    </React.Suspense>
  );
}

export default App;