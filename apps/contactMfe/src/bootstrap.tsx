import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { StoreProvider } from '@thommf-portfolio/store';

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);