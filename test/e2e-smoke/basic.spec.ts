import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('/');
  const brand = page.locator('data-test-id=brand');
  await expect(brand).toHaveText('MUI Toolpad');
});
