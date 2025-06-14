import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import Menu from './app/Menu';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Menu />
  </StrictMode>
);
