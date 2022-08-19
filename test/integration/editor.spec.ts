import { test, expect } from '@playwright/test';
import createApp from '../utils/createApp';
import generateId from '../utils/generateId';
import { canvasFrame, componentCatalog, pageOverlay } from '../utils/locators';

test('can place new component from catalog', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`);

  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/editor\/pages\/[^/]+/ });

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const componentCatalogLocator = page.locator(componentCatalog);
  const canvasPageOverlayLocator = canvasFrameLocator.locator(pageOverlay);
  const canvasInputLocator = canvasFrameLocator.locator('input');

  await canvasPageOverlayLocator.waitFor();

  await expect(canvasInputLocator).toHaveCount(0);

  await componentCatalogLocator.hover();
  await componentCatalogLocator
    .locator(':has-text("TextField")[draggable]')
    .dragTo(canvasPageOverlayLocator);

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();
});
