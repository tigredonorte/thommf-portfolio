export interface ServiceWorkerConfig {
  cacheName: string;
  version: string;
  staticAssets: string[];
  offlinePage?: string;
  imageCache?: boolean;
  assetCache?: boolean;
  strategies?: {
    images?: CacheStrategy;
    assets?: CacheStrategy;
    navigation?: CacheStrategy;
  };
  cacheOptions?: {
    images?: CacheOptions;
    assets?: CacheOptions;
    static?: CacheOptions;
  };
}

export type CacheStrategy = 
  | 'cache-first' 
  | 'network-first' 
  | 'cache-only' 
  | 'network-only' 
  | 'stale-while-revalidate';

export interface CacheOptions {
  maxEntries?: number;
  maxAgeSeconds?: number;
}

export interface ServiceWorkerRegistrationOptions {
  serviceWorkerUrl?: string;
  scope?: string;
  updateViaCache?: 'imports' | 'all' | 'none';
}

export interface CacheStatus {
  [cacheName: string]: number;
}

export interface ServiceWorkerMessage<T> {
  type: string;
  payload?: T;
}

export interface ServiceWorkerEventHandlers {
  onInstalling?: () => void;
  onWaiting?: () => void;
  onActive?: () => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: unknown) => void;
  onCacheUpdate?: (cacheName: string, url: string) => void;
}

export interface ServiceWorkerInstance {
  register: () => Promise<ServiceWorkerRegistration | undefined>;
  unregister: () => Promise<boolean>;
  update: () => Promise<void>;
  getCacheStatus: () => Promise<CacheStatus>;
  clearCache: (cacheName?: string) => Promise<void>;
  isSupported: boolean;
}