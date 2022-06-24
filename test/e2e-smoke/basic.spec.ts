import { test, expect, Request } from '@playwright/test';

test('basic app creation flow', async ({ page }) => {
  const appName = `App ${String(Math.random()).slice(2)}`;

  await page.goto('/');
  const brand = page.locator('data-test-id=brand');
  await expect(brand).toHaveText('MUI Toolpad CE');

  await page.locator('button:has-text("create new")').click();

  await page.fill('[role="dialog"] label:has-text("name")', appName);

  await page.click('[role="dialog"] button:has-text("create")');

  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/editor\/pages\/[^/]+/ });

  // TODO: basic editor tests

  await page.click('[aria-label="Home"]');

  const appCardSelector = `[role="article"]:has-text("${appName}")`;

  await page.click(`${appCardSelector} >> [aria-label="settings"]`);

  await page.click('[role="menuitem"]:has-text("Delete"):visible');

  let hasNavigated = false;
  const handleRequest = (req: Request) => {
    if (req.isNavigationRequest()) {
      hasNavigated = true;
    }
  };
  await page.on('request', handleRequest);

  await page.click(
    `[role="dialog"]:has-text('Are you sure you want to delete application "${appName}"') >> button:has-text("delete")`,
  );

  await page.waitForSelector(appCardSelector, { state: 'detached' });

  await page.off('request', handleRequest);

  expect(hasNavigated).toBeFalsy();
});
