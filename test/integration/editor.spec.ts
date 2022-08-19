import { test, expect } from '@playwright/test';
import createApp from '../utils/createApp';
import generateId from '../utils/generateId';
import { canvasFrame, componentCatalog, pageRoot, pageOverlay } from '../utils/locators';

test('can place new component from catalog', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`);

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const componentCatalogLocator = page.locator(componentCatalog);
  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasPageOverlayLocator = canvasFrameLocator.locator(pageOverlay);
  const canvasInputLocator = canvasFrameLocator.locator('input');

  await canvasPageRootLocator.waitFor();

  await expect(canvasInputLocator).toHaveCount(0);

  await componentCatalogLocator.hover();
  await componentCatalogLocator
    .locator(':has-text("TextField")[draggable]')
    .dragTo(canvasPageOverlayLocator);

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();
});
