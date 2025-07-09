export default {
  displayName: 'projectListMfe',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: 'test-output/jest/coverage',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(yet-another-react-lightbox|react-lazy-load-image-component|@react-responsive-carousel)/)',
  ],
  moduleNameMapper: {
    '^yet-another-react-lightbox$': '<rootDir>/src/__mocks__/yet-another-react-lightbox.js',
    '^yet-another-react-lightbox/(.*)$': '<rootDir>/src/__mocks__/yet-another-react-lightbox.js',
    '^react-lazy-load-image-component$': '<rootDir>/src/__mocks__/react-lazy-load-image-component.js',
  },
};
