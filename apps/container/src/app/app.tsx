import { config } from '@thommf-portfolio/config';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AppRouter } from './AppRouter';
import './app.scss';

const Header = React.lazy(() => import('headerMfe/Module'));

export function App() {
  const location = useLocation();
  const isDarkPage = location.pathname === '/contact';
  
  return (
    <React.Suspense fallback={<div className="loader">Loading...</div>}>
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <AppRouter />
        </main>
        <footer className={`footer ${isDarkPage ? 'footer-dark' : ''}`}>
          <div className='footer-content'>
            <p>© {new Date().getFullYear()} {config.developerName}. Built with Microfrontends </p>
          </div>
        </footer>
      </div>
    </React.Suspense>
  );
}

export default App;