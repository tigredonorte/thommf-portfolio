import { CacheStrategy, CacheOptions } from './types';
/// <reference path="./global.d.ts" />

export class CacheManager {
  constructor(private cacheName: string, private options: CacheOptions = {}) {}

  async put(request: Request | string, response: Response): Promise<void> {
    const cache = await caches.open(this.cacheName);
    
    if (this.options.maxEntries) {
      await this.enforceMaxEntries(cache);
    }
    
    await cache.put(request, response);
  }

  async match(request: Request | string): Promise<Response | undefined> {
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

  async delete(request: Request | string): Promise<boolean> {
    const cache = await caches.open(this.cacheName);
    return cache.delete(request);
  }

  async clear(): Promise<void> {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();
    await Promise.all(keys.map((key: Request) => cache.delete(key)));
  }

  async keys(): Promise<readonly Request[]> {
    const cache = await caches.open(this.cacheName);
    return cache.keys();
  }

  private async enforceMaxEntries(cache: any): Promise<void> {
    if (!this.options.maxEntries) return;
    
    const keys = await cache.keys();
    if (keys.length >= this.options.maxEntries) {
      const entriesToDelete = keys.length - this.options.maxEntries + 1;
      const keysToDelete = keys.slice(0, entriesToDelete);
      await Promise.all(keysToDelete.map((key: Request) => cache.delete(key)));
    }
  }

  private isResponseExpired(response: Response): boolean {
    if (!this.options.maxAgeSeconds) return false;
    
    const cachedDate = response.headers.get('sw-cache-timestamp');
    if (!cachedDate) return false;
    
    const cacheTime = parseInt(cachedDate, 10);
    const now = Date.now();
    const maxAge = this.options.maxAgeSeconds * 1000;
    
    return (now - cacheTime) > maxAge;
  }
}

export async function handleWithStrategy(
  request: Request,
  strategy: CacheStrategy,
  cacheManager: CacheManager
): Promise<Response> {
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

async function handleCacheFirst(
  request: Request,
  cacheManager: CacheManager
): Promise<Response> {
  const cachedResponse = await cacheManager.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const responseWithTimestamp = addTimestampToResponse(networkResponse.clone());
    await cacheManager.put(request, responseWithTimestamp);
  }
  
  return networkResponse;
}

async function handleNetworkFirst(
  request: Request,
  cacheManager: CacheManager
): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseWithTimestamp = addTimestampToResponse(networkResponse.clone());
      await cacheManager.put(request, responseWithTimestamp);
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

async function handleCacheOnly(
  request: Request,
  cacheManager: CacheManager
): Promise<Response> {
  const cachedResponse = await cacheManager.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw new Error('No cached response available');
}

async function handleNetworkOnly(request: Request): Promise<Response> {
  return fetch(request);
}

async function handleStaleWhileRevalidate(
  request: Request,
  cacheManager: CacheManager
): Promise<Response> {
  const cachedResponse = await cacheManager.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const responseWithTimestamp = addTimestampToResponse(networkResponse.clone());
      await cacheManager.put(request, responseWithTimestamp);
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors in background update
    return new Response('', { status: 503 });
  });
  
  if (cachedResponse) {
    // Fire and forget background update
    void fetchPromise;
    return cachedResponse;
  }
  
  return fetchPromise;
}

function addTimestampToResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-timestamp', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function createCacheManager(cacheName: string, options?: CacheOptions): CacheManager {
  return new CacheManager(cacheName, options);
}