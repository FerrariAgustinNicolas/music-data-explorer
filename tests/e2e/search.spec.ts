import { test, expect } from '@playwright/test';

test('artist search shows results and navigates to detail', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    const url = new URL(route.request().url());
    const q = url.searchParams.get('q');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          name: q ?? 'Radiohead',
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
  await expect(page.getByText('Radiohead')).toBeVisible();
  await page.getByText('Radiohead').click();
  await expect(page.getByText('Artist overview')).toBeVisible();
});

test('album search shows results and opens album detail', async ({ page }) => {
  let albumRequested = false;
  await page.route('**/search/album**', async (route) => {
    albumRequested = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          name: 'OK Computer',
          artist: 'Radiohead',
          mbid: '2',
          url: 'https://last.fm/music/Radiohead/OK+Computer',
          image: null,
          playcount: 5000,
        },
      ]),
    });
  });

  await page.route('**/api/album/overview**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        album: {
          name: 'OK Computer',
          artist: 'Radiohead',
          image: null,
          summary: 'Test album',
          stats: { playcount: 5000, listeners: 2000 },
        },
        tags: [],
        tracks: [],
      }),
    });
  });

  await page.goto('/');
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
  await page.getByRole('button', { name: 'Albums' }).click();
  await page.waitForURL(/mode=album/);
  await expect(page.getByRole('button', { name: 'Albums' })).toHaveClass(/bg-glow/);
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect
    .poll(() => albumRequested, { timeout: 10000 })
    .toBe(true);
  await expect(page.getByText('OK Computer')).toBeVisible();
  await page.getByText('OK Computer').click();
  await expect(page.getByText('Album overview')).toBeVisible();
});
