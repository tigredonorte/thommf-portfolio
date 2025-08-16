import { generateServiceWorkerTemplate, ServiceWorkerConfig } from '@thommf-portfolio/service-worker';
import { writeFileSync } from 'fs';
import { join } from 'path';

const config: ServiceWorkerConfig = {
  cacheName: 'thommf-portfolio',
  version: 'v1',
  staticAssets: [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/runtime.js'
  ],
  offlinePage: '/offline.html',
  imageCache: true,
  assetCache: true,
  strategies: {
    images: 'cache-first',
    assets: 'cache-first', 
    navigation: 'network-first'
  },
  cacheOptions: {
    images: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
    },
    assets: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
    },
    static: {
      maxEntries: 20,
      maxAgeSeconds: 60 * 60 * 24 // 1 day
    }
  }
};

const serviceWorkerCode = generateServiceWorkerTemplate(config);
const outputPath = join(__dirname, 'sw.js');

writeFileSync(outputPath, serviceWorkerCode, 'utf8');
console.log('Service worker generated successfully at:', outputPath);