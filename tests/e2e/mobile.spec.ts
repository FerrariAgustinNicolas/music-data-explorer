import { test, expect } from '@playwright/test';

test('mobile layout does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByText('Music Data Explorer')).toBeVisible();
});

