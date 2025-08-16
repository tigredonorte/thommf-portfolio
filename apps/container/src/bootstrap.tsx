import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from '@thommf-portfolio/store';
import { createServiceWorker } from '@thommf-portfolio/service-worker';

import App from './app/app';

const sw = createServiceWorker('/sw.js', {
  scope: '/'
}, {
  onInstalling: () => console.log('Service Worker: Installing...'),
  onWaiting: () => console.log('Service Worker: New version waiting...'),
  onActive: () => console.log('Service Worker: Active and ready!'),
  onUpdate: () => console.log('Service Worker: Updated!'),
  onError: (error) => console.error('Service Worker error:', error),
  onCacheUpdate: (cacheName, url) => console.log(`Cache updated: ${cacheName} - ${url}`)
});

sw.register().catch(error => {
  console.error('Service Worker registration failed:', error);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>
);
