import { createServiceWorker, generateServiceWorkerTemplate, createCacheManager } from './service-worker';

describe('serviceWorker', () => {
  describe('createServiceWorker', () => {
    it('should create a service worker instance', () => {
      const sw = createServiceWorker();
      expect(sw).toBeDefined();
      expect(typeof sw.register).toBe('function');
      expect(typeof sw.unregister).toBe('function');
      expect(typeof sw.update).toBe('function');
      expect(typeof sw.getCacheStatus).toBe('function');
      expect(typeof sw.clearCache).toBe('function');
      expect(typeof sw.isSupported).toBe('boolean');
    });
  });

  describe('generateServiceWorkerTemplate', () => {
    it('should generate service worker code', () => {
      const config = {
        cacheName: 'test-cache',
        version: 'v1',
        staticAssets: ['/index.html', '/styles.css'],
        offlinePage: '/offline.html'
      };

      const template = generateServiceWorkerTemplate(config);
      expect(template).toContain('test-cache');
      expect(template).toContain('v1');
      expect(template).toContain('/offline.html');
      expect(template).toContain('addEventListener');
    });
  });

  describe('createCacheManager', () => {
    it('should create a cache manager instance', () => {
      const cacheManager = createCacheManager('test-cache');
      expect(cacheManager).toBeDefined();
      expect(typeof cacheManager.put).toBe('function');
      expect(typeof cacheManager.match).toBe('function');
      expect(typeof cacheManager.delete).toBe('function');
      expect(typeof cacheManager.clear).toBe('function');
    });
  });
});
