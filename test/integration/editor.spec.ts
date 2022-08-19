import { test, expect } from '@playwright/test';
import createApp from '../utils/createApp';
import generateId from '../utils/generateId';
import { canvasFrame, componentCatalog, pageRoot, pageOverlay } from '../utils/locators';
import basicDom from '../fixtures/dom/basicDom.json';

test('can place new components from catalog', async ({ page }) => {
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

  await componentCatalogLocator.hover();
  await componentCatalogLocator
    .locator(':has-text("TextField")[draggable]')
    .dragTo(canvasPageOverlayLocator);

  await expect(canvasInputLocator).toHaveCount(2);
});

test.only('can delete elements from page', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(basicDom));

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasPageOverlayLocator = canvasFrameLocator.locator(pageOverlay);
  const canvasInputLocator = canvasFrameLocator.locator('input');
  const canvasRemoveElementButtonLocator = canvasFrameLocator.locator(
    'button[aria-label="Remove element"]',
  );

  await canvasPageRootLocator.waitFor();

  await expect(canvasInputLocator).toHaveCount(2);

  // Delete element by clicking

  await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

  const canvasPageOverlayBoundingBox = await canvasPageOverlayLocator.boundingBox();
  const textInput1BoundingBox = await canvasFrameLocator
    .locator('[data-node-id=fq03rdc]')
    .boundingBox();

  expect(canvasPageOverlayBoundingBox).toBeDefined();
  expect(textInput1BoundingBox).toBeDefined();

  await canvasPageOverlayLocator.click({
    position: {
      x: textInput1BoundingBox!.x - canvasPageOverlayBoundingBox!.x,
      y: textInput1BoundingBox!.y - canvasPageOverlayBoundingBox!.y,
    },
  });

  await canvasRemoveElementButtonLocator.click();

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  const textInput2BoundingBox = await canvasFrameLocator
    .locator('[data-node-id=z523rtd]')
    .boundingBox();

  expect(textInput2BoundingBox).toBeDefined();

  await canvasPageOverlayLocator.click({
    position: {
      x: textInput2BoundingBox!.x - canvasPageOverlayBoundingBox!.x,
      y: textInput2BoundingBox!.y - canvasPageOverlayBoundingBox!.y,
    },
  });

  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);
});
