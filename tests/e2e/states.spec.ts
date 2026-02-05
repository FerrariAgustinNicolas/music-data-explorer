import { test, expect } from '@playwright/test';

test('empty input shows validation message', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect(page.getByText('Type a name to start searching.')).toBeVisible();
});

test('artist search empty results', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('NoMatch');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect(page.getByText('Search results will show up here.')).toBeVisible();
});

test('artist search error shows error state', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Boom', code: 'ERR' } }) });
  });
  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await expect(page.getByText('Boom')).toBeVisible();
});

test('album search shows empty state', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('search/album')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }
    if (url.includes('search/artist')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }
    await route.continue();
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Albums' }).click();
  await expect(page.getByRole('button', { name: 'Albums' })).toHaveAttribute('aria-pressed', 'true');
  await page.waitForURL(/mode=album/);
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('NoMatch');
  await page.getByRole('button', { name: 'Explore' }).click();
  await page.waitForURL(/q=NoMatch/);
  await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 15000 });
});

test('error state shows retry button on artist page', async ({ page }) => {
  await page.route('**/api/search/artist**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ name: 'Radiohead', mbid: '1', url: 'x', image: null, listeners: 1000 }]),
    });
  });
  await page.route('**/api/artist/*/overview', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Fail', code: 'ERR' } }) });
  });
  await page.goto('/');
  await page.getByPlaceholder('Search an artist (e.g., Radiohead)').fill('Radiohead');
  await page.getByRole('button', { name: 'Explore' }).click();
  await page.getByText('Radiohead').click();
  await expect(page.getByText('Fail')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

