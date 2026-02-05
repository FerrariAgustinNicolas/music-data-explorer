import { test, expect } from '@playwright/test';

test('enter key triggers search', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.goto('/');
  const input = page.getByPlaceholder('Search an artist (e.g., Radiohead)');
  await input.fill('Radiohead');
  await input.press('Enter');
  await expect(page).toHaveURL(/q=Radiohead/);
});

test('input has focus on load', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholder('Search an artist (e.g., Radiohead)');
  await expect(input).toBeFocused();
});
