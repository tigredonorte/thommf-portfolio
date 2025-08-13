import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const { getProjectUrl } = require('../../e2e-utils/getProjectUrl');

const baseURL = getProjectUrl('headerMfe');
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: 3000,
  reporter: process.env.CI ? 'github' : 'html',
  workers: process.env.CI ? 4 : undefined,
  use: {
    baseURL,
    /* Collect trace only on failure in CI */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    ignoreHTTPSErrors: true,
    /* Reduce wait times */
    actionTimeout: 2000,
    navigationTimeout: 5000,
  },
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npx nx run headerMfe:serve-static',
  //   url: baseURL,
  //   reuseExistingServer: true,
  //   cwd: workspaceRoot,
  // },
  projects: process.env.CI ? [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ] : [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

    // Uncomment for mobile browsers support in local development
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
});
