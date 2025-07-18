import { test, expect } from '@playwright/test';

test('Correct Title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Thompson Filgueiras');
  expect(await page.locator('p').innerText()).toContain('Software Engineer');
});
