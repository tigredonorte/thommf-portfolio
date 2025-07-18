import { test, expect } from '@playwright/test';

test('root page renders correctly', async ({ page }) => {
  await page.goto('/');
  
  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Thompson Filgueiras');
  
  // Verify the page is not a 404 or error page
  await expect(page.locator('body')).not.toContainText('404');
  await expect(page.locator('body')).not.toContainText('Page not found');
});

test('displays 404 for invalid routes', async ({ page }) => {
  await page.goto('/asdfasdf');

  await expect(page.locator('body')).toContainText('404');
  
  const response = await page.goto('/asdfasdf');

  // @TODO: use 404 instead of 200
  expect(response?.status()).toBe(200);
});

test('health endpoint returns healthy', async ({ page }) => {
  const response = await page.goto('/health');

  // Expect the health check to return "healthy"
  await expect(page.locator('body')).toContainText('Healthy');
  
  // Verify successful response
  expect(response?.status()).toBe(200);
});
