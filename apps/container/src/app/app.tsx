import { config } from '@thommf-portfolio/config';
import * as React from 'react';
import { AppRouter } from './AppRouter';
import './app.scss';

const Header = React.lazy(() => import('headerMfe/Module'));

export function App() {
  return (
    <React.Suspense fallback={<div className="loader">Loading...</div>}>
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <AppRouter />
        </main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} {config.developerName}. Built with Microfrontends </p>
        </footer>
      </div>
    </React.Suspense>
  );
}

export default App;