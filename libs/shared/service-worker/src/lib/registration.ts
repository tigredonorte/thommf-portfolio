import { 
  ServiceWorkerRegistrationOptions, 
  ServiceWorkerEventHandlers, 
  ServiceWorkerInstance,
  ServiceWorkerMessage,
  CacheStatus 
} from './types';

const CACHE_REQUEST_TIMEOUT_MS = 5000;
export class ServiceWorkerManager implements ServiceWorkerInstance {
  private registration: ServiceWorkerRegistration | null = null;
  private serviceWorkerUrl: string;
  private options: ServiceWorkerRegistrationOptions;
  private handlers: ServiceWorkerEventHandlers;

  constructor(
    serviceWorkerUrl = '/sw.js',
    options: ServiceWorkerRegistrationOptions = {},
    handlers: ServiceWorkerEventHandlers = {}
  ) {
    this.serviceWorkerUrl = serviceWorkerUrl;
    this.options = {
      scope: '/',
      updateViaCache: 'none',
      ...options
    };
    this.handlers = handlers;
  }

  get isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  async register(): Promise<ServiceWorkerRegistration | undefined> {
    if (!this.isSupported) {
      console.warn('Service Workers are not supported in this browser');
      this.handlers.onError?.('Service Workers not supported');
      return undefined;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.serviceWorkerUrl,
        this.options
      );

      this.setupEventListeners();
      
      console.log('Service Worker registered successfully:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.handlers.onError?.(error);
      throw error;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      console.log('Service Worker unregistered successfully');
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      this.handlers.onError?.(error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker is not registered');
    }

    try {
      await this.registration.update();
      console.log('Service Worker update requested');
    } catch (error) {
      console.error('Service Worker update failed:', error);
      this.handlers.onError?.(error);
      throw error;
    }
  }

  async getCacheStatus(): Promise<CacheStatus> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !navigator.serviceWorker.controller) {
        resolve({});
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      const message: ServiceWorkerMessage<void> = {
        type: 'GET_CACHE_STATUS'
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

      setTimeout(() => {
        reject(new Error('Cache status request timeout'));
      }, CACHE_REQUEST_TIMEOUT_MS);
    });
  }

  async clearCache(cacheName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !navigator.serviceWorker.controller) {
        resolve();
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        } else {
          reject(new Error(event.data.error || 'Cache clear failed'));
        }
      };

      const message: ServiceWorkerMessage<{ cacheName?: string }> = {
        type: 'CLEAR_CACHE',
        payload: { cacheName }
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

      setTimeout(() => {
        reject(new Error('Cache clear request timeout'));
      }, CACHE_REQUEST_TIMEOUT_MS);
    });
  }

  private setupEventListeners(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (!newWorker) return;

      this.handlers.onInstalling?.();

      newWorker.addEventListener('statechange', () => {
        switch (newWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              this.handlers.onWaiting?.();
            } else {
              this.handlers.onActive?.();
            }
            break;
          case 'activated':
            this.handlers.onActive?.();
            break;
        }
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.registration) {
        this.handlers.onUpdate?.(this.registration);
      }
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      const message: ServiceWorkerMessage<{ cacheName: string; url: string }> = event.data;
      
      if (message.type === 'CACHE_UPDATE') {
        this.handlers.onCacheUpdate?.(
          message.payload?.cacheName || '',
          message.payload?.url || ''
        );
      }
    });
  }

  skipWaiting(): void {
    if (!navigator.serviceWorker.controller) return;

    const message: ServiceWorkerMessage<void> = {
      type: 'SKIP_WAITING'
    };

    navigator.serviceWorker.controller.postMessage(message);
  }
}

export function createServiceWorker(
  serviceWorkerUrl?: string,
  options?: ServiceWorkerRegistrationOptions,
  handlers?: ServiceWorkerEventHandlers
): ServiceWorkerInstance {
  return new ServiceWorkerManager(serviceWorkerUrl, options, handlers);
}