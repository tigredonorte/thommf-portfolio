/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function */

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
  },
  writable: true,
});

// Mock IntersectionObserver for react-lazy-load-image-component
(global as any).IntersectionObserver = class MockIntersectionObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
(global as any).ResizeObserver = class MockResizeObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};
