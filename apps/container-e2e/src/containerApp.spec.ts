import { test, expect } from '@playwright/test';

test('Correct Mfe page', async ({ page }) => {
  await page.goto('./');

  await expect(page).toHaveTitle('Container');
});

test('root page renders correctly', async ({ page }) => {
  await page.goto('./');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Thompson Filgueiras');
  
  // Verify the page is not a 404 or error page
  await expect(page.locator('body')).not.toContainText('404');
  await expect(page.locator('body')).not.toContainText('Page not found');
});

test('displays 404 for invalid routes', async ({ page }) => {
  const response = await page.goto('./asdfasdf');

  await expect(page.locator('body')).toContainText('404');

  // @TODO: use 404 instead of 200
  expect(response?.status()).toBe(200);
  expect(await page.locator('main div').innerText()).toContain('404 Not Found');
});
