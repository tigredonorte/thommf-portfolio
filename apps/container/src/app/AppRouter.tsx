import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

const ProjectList = React.lazy(() => import('projectListMfe/Module'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/health" element={<div>Healthy</div>} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}
