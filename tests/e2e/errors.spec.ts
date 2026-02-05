import { test, expect } from '@playwright/test';

test('rate limit shows error message', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Rate limit exceeded', code: 'RATE_LIMIT' } }) });
  });
  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect(page.getByText('Rate limit exceeded')).toBeVisible();
});

