import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h2 to contain "Career & Projects"
  expect(await page.locator('h2').innerText()).toContain('Career & Projects');
});

test('should display project list functionality', async ({ page }) => {
  await page.goto('/');

  // Check that the main title is present
  await expect(page.locator('h2')).toHaveText('Career & Projects');

  // Check that there's a search input
  await expect(page.locator('input[type="text"]')).toBeVisible();

  // Check that the search input has the correct placeholder
  await expect(page.locator('input[type="text"]')).toHaveAttribute('placeholder', 'Filter by technology, project, or keyword...');
});

test('should render project content', async ({ page }) => {
  await page.goto('/');

  // Wait for content to load and check if there are any project elements
  // Since this is a micro-frontend, we expect some content to be present
  await expect(page.locator('.wrapper')).toBeVisible();
});
