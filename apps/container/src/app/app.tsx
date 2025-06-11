import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';

const ProjectListMfe = React.lazy(() => import('project-list-mfe/Module'));

const HeaderMfe = React.lazy(() => import('header-mfe/Module'));

export function App() {
  return (
    <React.Suspense fallback={null}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/project-list-mfe">ProjectListMfe</Link>
        </li>
        <li>
          <Link to="/header-mfe">HeaderMfe</Link>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<NxWelcome title="container" />} />
        <Route path="/project-list-mfe" element={<ProjectListMfe />} />
        <Route path="/header-mfe" element={<HeaderMfe />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
