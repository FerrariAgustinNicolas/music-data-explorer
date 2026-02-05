import { test, expect } from '@playwright/test';

test('back to search restores query and mode', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          name: 'Radiohead',
          mbid: '1',
          url: 'https://last.fm/music/Radiohead',
          image: null,
          listeners: 1000,
        },
      ]),
    });
  });

  await page.route('**/api/artist/*/overview', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        artist: {
          name: 'Radiohead',
          image: null,
          bioSummary: 'Test bio',
          stats: { listeners: 1000, playcount: 2000 },
        },
        topTags: [],
        topTracks: [],
        similarArtists: [],
        insights: {
          popularitySpread: [],
          tagDistribution: [],
          outliers: { method: 'zscore', threshold: 1.5, items: [], explanation: 'n/a' },
          funFacts: [],
          trend: { type: 'alternative', message: 'ok' },
          durationExtremes: { shortest: null, longest: null },
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await page.getByText('Radiohead').click();
  await page.getByRole('button', { name: 'Back to search' }).click();

  await expect(page).toHaveURL(/\?q=Radiohead/);
  await expect(page.getByPlaceholder('Search an artist (e.g., Radiohead)')).toHaveValue('Radiohead');
});

test('switch artists to albums shows album results', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { name: 'Radiohead', mbid: '1', url: 'x', image: null, listeners: 1000 },
      ]),
    });
  });

  await page.route('**/api/search/album**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          name: 'OK Computer',
          artist: 'Radiohead',
          mbid: '2',
          url: 'x',
          image: null,
          playcount: 5000,
        },
      ]),
    });
  });

  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect(page.getByText('Radiohead')).toBeVisible();

  await page.getByRole('button', { name: 'Albums' }).click();
  await expect(page.getByText('OK Computer')).toBeVisible();
});
