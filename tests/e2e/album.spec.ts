import { test, expect } from '@playwright/test';

test('album page shows tracks and stats', async ({ page }) => {
  await page.route('**/api/album/overview**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        album: { name: 'OK Computer', artist: 'Radiohead', image: null, summary: 'Test', stats: { playcount: 10, listeners: 5 } },
        tags: [],
        tracks: [{ name: 'Airbag', duration: 300, rank: 1 }],
      }),
    });
  });

  await page.goto('/album/Radiohead/OK%20Computer');
  await expect(page.getByText('Album overview')).toBeVisible();
  await expect(page.getByText('1. Airbag')).toBeVisible();
  await expect(page.getByText('Playcount')).toBeVisible();
});
