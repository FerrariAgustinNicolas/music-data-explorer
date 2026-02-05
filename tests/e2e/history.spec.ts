import { test, expect } from '@playwright/test';

test('back/forward maintains query and mode', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect(page).toHaveURL(/\?q=Radiohead/);

  await page.getByRole('button', { name: 'Albums' }).click();
  await expect(page).toHaveURL(/mode=album/);

  await page.goBack();
  await expect(page).toHaveURL(/mode=artist/);
  await page.goForward();
  await expect(page).toHaveURL(/mode=album/);
});

