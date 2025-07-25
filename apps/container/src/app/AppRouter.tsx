import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

const ProjectList = React.lazy(() => import('projectListMfe/Module'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      
      {/* @TODO: Create actually a page for 404 and return proper status */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}
