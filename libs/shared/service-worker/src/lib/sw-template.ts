import { ServiceWorkerConfig } from './types';

export function generateServiceWorkerTemplate(config: ServiceWorkerConfig): string {
  const {
    cacheName,
    version,
    staticAssets,
    offlinePage,
    imageCache = true,
    assetCache = true,
    strategies = {
      images: 'cache-first',
      assets: 'cache-first',
      navigation: 'network-first'
    },
    cacheOptions = {}
  } = config;

  const imageCacheName = `${cacheName}-images-${version}`;
  const assetCacheName = `${cacheName}-assets-${version}`;
  const staticCacheName = `${cacheName}-static-${version}`;

  return `// Auto-generated Service Worker
// Generated from @thommf-portfolio/service-worker

const STATIC_CACHE = '${staticCacheName}';
const IMAGE_CACHE = '${imageCacheName}';
const ASSET_CACHE = '${assetCacheName}';
const OFFLINE_PAGE = '${offlinePage || '/offline.html'}';

const STATIC_ASSETS = ${JSON.stringify(staticAssets, null, 2)};

const CACHE_STRATEGIES = ${JSON.stringify(strategies, null, 2)};
const CACHE_OPTIONS = ${JSON.stringify(cacheOptions, null, 2)};

class CacheManager {
  constructor(cacheName, options = {}) {
    this.cacheName = cacheName;
    this.options = options;
  }

  async put(request, response) {
    const cache = await caches.open(this.cacheName);
    
    if (this.options.maxEntries) {
      await this.enforceMaxEntries(cache);
    }
    
    const responseWithTimestamp = this.addTimestampToResponse(response);
    await cache.put(request, responseWithTimestamp);
  }

  async match(request) {
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(request);
    
    if (response && this.options.maxAgeSeconds) {
      const isExpired = this.isResponseExpired(response);
      if (isExpired) {
        await cache.delete(request);
        return undefined;
      }
    }
    
    return response;
  }

  async delete(request) {
    const cache = await caches.open(this.cacheName);
    return cache.delete(request);
  }

  async clear() {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();
    await Promise.all(keys.map(key => cache.delete(key)));
  }

  async enforceMaxEntries(cache) {
    if (!this.options.maxEntries) return;
    
    const keys = await cache.keys();
    if (keys.length >= this.options.maxEntries) {
      const entriesToDelete = keys.length - this.options.maxEntries + 1;
      const keysToDelete = keys.slice(0, entriesToDelete);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
  }

  isResponseExpired(response) {
    if (!this.options.maxAgeSeconds) return false;
    
    const cachedDate = response.headers.get('sw-cache-timestamp');
    if (!cachedDate) return false;
    
    const cacheTime = parseInt(cachedDate, 10);
    const now = Date.now();
    const maxAge = this.options.maxAgeSeconds * 1000;
    
    return (now - cacheTime) > maxAge;
  }

  addTimestampToResponse(response) {
    const headers = new Headers(response.headers);
    headers.set('sw-cache-timestamp', Date.now().toString());
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
}

const staticCacheManager = new CacheManager(STATIC_CACHE, CACHE_OPTIONS.static || {});
const imageCacheManager = new CacheManager(IMAGE_CACHE, CACHE_OPTIONS.images || {});
const assetCacheManager = new CacheManager(ASSET_CACHE, CACHE_OPTIONS.assets || {});

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      staticCacheManager.put('/', new Response('')).then(() => 
        Promise.all(STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await staticCacheManager.put(url, response);
            }
          } catch (error) {
            console.warn('Failed to cache static asset:', url, error);
          }
        }))
      )
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
          if (cacheName !== STATIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== ASSET_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
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

  ${imageCache ? `
  if (url.pathname.includes('/assets/images/') || 
      url.pathname.match(/\\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(handleImageRequest(request));
    return;
  }` : ''}

  ${assetCache ? `
  if (url.pathname.match(/\\.(js|css|woff|woff2|ttf|eot)$/i)) {
    event.respondWith(handleAssetRequest(request));
    return;
  }` : ''}

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  event.respondWith(handleGeneralRequest(request));
});

${imageCache ? `
async function handleImageRequest(request) {
  return handleWithStrategy(request, CACHE_STRATEGIES.images || 'cache-first', imageCacheManager);
}` : ''}

${assetCache ? `
async function handleAssetRequest(request) {
  return handleWithStrategy(request, CACHE_STRATEGIES.assets || 'cache-first', assetCacheManager);
}` : ''}

async function handleNavigationRequest(request) {
  return handleWithStrategy(request, CACHE_STRATEGIES.navigation || 'network-first', staticCacheManager)
    .catch(async () => {
      const offlineResponse = await staticCacheManager.match(OFFLINE_PAGE);
      return offlineResponse || new Response('Offline', { 
        status: 503,
        statusText: 'Service Unavailable' 
      });
    });
}

async function handleGeneralRequest(request) {
  return handleWithStrategy(request, 'network-first', staticCacheManager);
}

async function handleWithStrategy(request, strategy, cacheManager) {
  switch (strategy) {
    case 'cache-first':
      return handleCacheFirst(request, cacheManager);
    case 'network-first':
      return handleNetworkFirst(request, cacheManager);
    case 'cache-only':
      return handleCacheOnly(request, cacheManager);
    case 'network-only':
      return handleNetworkOnly(request);
    case 'stale-while-revalidate':
      return handleStaleWhileRevalidate(request, cacheManager);
    default:
      return handleNetworkFirst(request, cacheManager);
  }
}

async function handleCacheFirst(request, cacheManager) {
  const cachedResponse = await cacheManager.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    await cacheManager.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

async function handleNetworkFirst(request, cacheManager) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cacheManager.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cacheManager.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleCacheOnly(request, cacheManager) {
  const cachedResponse = await cacheManager.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw new Error('No cached response available');
}

async function handleNetworkOnly(request) {
  return fetch(request);
}

async function handleStaleWhileRevalidate(request, cacheManager) {
  const cachedResponse = await cacheManager.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cacheManager.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors in background update
  });
  
  if (cachedResponse) {
    void fetchPromise; // Fire and forget
    return cachedResponse;
  }
  
  return fetchPromise;
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

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCache(event.data.payload?.cacheName).then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch(error => {
      event.ports[0].postMessage({ success: false, error: error.message });
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

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}
`;
}