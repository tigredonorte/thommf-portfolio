/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'thommf-portfolio-v1';
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/runtime.js',
  OFFLINE_PAGE
];

const IMAGE_CACHE = 'thommf-portfolio-images-v1';
const ASSETS_CACHE = 'thommf-portfolio-assets-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== OFFLINE_PAGE));
      }),
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching offline page');
        return fetch(OFFLINE_PAGE).then(response => {
          if (response.ok) {
            return cache.put(OFFLINE_PAGE, response);
          }
        }).catch(() => {
          console.log('Service Worker: Offline page not found, skipping');
        });
      })
    ])
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== ASSETS_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return undefined;
        })
      );
    })
  );
  
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.includes('/assets/images/')) {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.endsWith('.js') || 
             url.pathname.endsWith('.css') || 
             url.pathname.endsWith('.woff') || 
             url.pathname.endsWith('.woff2')) {
    event.respondWith(handleAssetRequest(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleGeneralRequest(request));
  }
});

async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving image from cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('Service Worker: Caching new image:', request.url);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Image request failed:', error);
    return new Response('Image not available', { 
      status: 404,
      statusText: 'Not Found' 
    });
  }
}

async function handleAssetRequest(request) {
  try {
    const cache = await caches.open(ASSETS_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving asset from cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('Service Worker: Caching new asset:', request.url);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Asset request failed:', error);
    throw error;
  }
}

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation request failed, serving offline page', error);
    const cache = await caches.open(CACHE_NAME);
    const offlineResponse = await cache.match(OFFLINE_PAGE);
    return offlineResponse || new Response('Offline', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

async function handleGeneralRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: General request failed:', error);
    throw error;
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
  }
});

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}