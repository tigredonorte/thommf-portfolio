declare global {
  // Browser APIs that might not be available in all TypeScript environments
  interface Navigator {
    serviceWorker: ServiceWorkerContainer;
  }

  interface ServiceWorkerContainer extends EventTarget {
    ready: Promise<ServiceWorkerRegistration>;
    controller: ServiceWorker | null;
    register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
    getRegistration(clientURL?: string): Promise<ServiceWorkerRegistration | undefined>;
    getRegistrations(): Promise<ServiceWorkerRegistration[]>;
  }

  interface ServiceWorkerRegistration extends EventTarget {
    installing: ServiceWorker | null;
    waiting: ServiceWorker | null;
    active: ServiceWorker | null;
    scope: string;
    unregister(): Promise<boolean>;
    update(): Promise<void>;
  }

  interface ServiceWorker extends EventTarget {
    scriptURL: string;
    state: ServiceWorkerState;
    postMessage(message: any, transfer?: Transferable[]): void;
  }

  type ServiceWorkerState = 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

  interface RegistrationOptions {
    scope?: string;
    updateViaCache?: 'imports' | 'all' | 'none';
  }

  interface CacheStorage {
    delete(cacheName: string): Promise<boolean>;
    has(cacheName: string): Promise<boolean>;
    keys(): Promise<string[]>;
    match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
    open(cacheName: string): Promise<Cache>;
  }

  interface Cache {
    add(request: RequestInfo): Promise<void>;
    addAll(requests: RequestInfo[]): Promise<void>;
    delete(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean>;
    keys(request?: RequestInfo, options?: CacheQueryOptions): Promise<readonly Request[]>;
    match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
    matchAll(request?: RequestInfo, options?: CacheQueryOptions): Promise<readonly Response[]>;
    put(request: RequestInfo, response: Response): Promise<void>;
  }

  interface CacheQueryOptions {
    ignoreMethod?: boolean;
    ignoreSearch?: boolean;
    ignoreVary?: boolean;
  }

  interface MessagePort extends EventTarget {
    onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null;
    postMessage(message: any, transfer?: Transferable[]): void;
    start(): void;
    close(): void;
  }

  declare var caches: CacheStorage;
  declare var navigator: Navigator;
  declare var MessageChannel: {
    prototype: MessageChannel;
    new(): MessageChannel;
  };
}

export {};