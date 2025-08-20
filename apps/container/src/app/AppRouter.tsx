import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

const ProjectList = React.lazy(() => import('projectListMfe/Module'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/*" element={<ProjectList />} />
    </Routes>
  );
}
