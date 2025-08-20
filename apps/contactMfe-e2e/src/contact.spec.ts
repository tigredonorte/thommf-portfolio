import { test, expect } from '@playwright/test';

test.describe('Contact MFE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display contact page header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("Let's Connect");
    await expect(page.locator('p')).toContainText('Have a project in mind?');
  });

  test('should display contact information cards', async ({ page }) => {
    await expect(page.locator('text=Get in Touch')).toBeVisible();
    await expect(page.locator('text=hello@example.com')).toBeVisible();
    await expect(page.locator('text=+1 (555) 123-4567')).toBeVisible();
    await expect(page.locator('text=San Francisco, CA')).toBeVisible();
  });

  test('should display social media links', async ({ page }) => {
    await expect(page.locator('text=Follow Me')).toBeVisible();
    
    const socialLinks = page.locator('a[href*="github"], a[href*="linkedin"], a[href*="twitter"]');
    await expect(socialLinks).toHaveCount(3);
  });

  test('should have working contact form', async ({ page }) => {
    // Fill out the form
    await page.fill('input[placeholder="Your Name"]', 'John Doe');
    await page.fill('input[placeholder="Your Email"]', 'john@example.com');
    await page.fill('input[placeholder="Subject"]', 'Test Subject');
    await page.fill('textarea[placeholder="Your Message"]', 'This is a test message with more than 10 characters.');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Message sent successfully!')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Subject is required')).toBeVisible();
    await expect(page.locator('text=Message is required')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[placeholder="Your Email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should validate message length', async ({ page }) => {
    await page.fill('textarea[placeholder="Your Message"]', 'Short');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Message must be at least 10 characters')).toBeVisible();
  });

  test('should have hover animations on interactive elements', async ({ page }) => {
    // Test contact info card hover
    const contactCard = page.locator('.infoCard').first();
    await contactCard.hover();
    
    // Test social link hover
    const socialLink = page.locator('.socialLink').first();
    await socialLink.hover();
    
    // Test submit button hover
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.hover();
  });

  test('should be responsive on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and properly arranged
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder="Your Name"]')).toBeVisible();
    await expect(page.locator('.socialLink')).toBeVisible();
  });

  test('should have animated particles in background', async ({ page }) => {
    // Check that particles container exists
    await expect(page.locator('.particlesContainer')).toBeVisible();
    
    // Check that particles are present
    const particles = page.locator('.particle');
    await expect(particles).toHaveCount(20);
  });
});