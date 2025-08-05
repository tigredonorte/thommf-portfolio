import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { StoreProvider } from '@thommf-portfolio/store';

import Menu from './app/Menu';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <StoreProvider>
      <Menu />
    </StoreProvider>
  </StrictMode>
);
