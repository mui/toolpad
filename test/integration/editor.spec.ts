import { test, expect } from '@playwright/test';
import createApp from '../utils/createApp';
import selectCanvasComponent from '../utils/selectCanvasComponent';
import generateId from '../utils/generateId';
import { canvasFrame, componentCatalog, pageRoot, pageOverlay } from '../utils/locators';
import twoFieldsDomTemplate from '../domTemplates/twoTextFields.json';

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

  // Drag in a first component

  await componentCatalogLocator.hover();
  await componentCatalogLocator
    .locator(':has-text("TextField")[draggable]')
    .dragTo(canvasPageOverlayLocator);

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();

  // Drag in a second component

  await componentCatalogLocator.hover();
  await componentCatalogLocator
    .locator(':has-text("TextField")[draggable]')
    .dragTo(canvasPageOverlayLocator);

  await expect(canvasInputLocator).toHaveCount(2);
});

test('can move elements in page', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(twoFieldsDomTemplate));

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasPageOverlayLocator = canvasFrameLocator.locator(pageOverlay);
  const canvasInputLocator = canvasFrameLocator.locator('input');
  const canvasMoveElementHandleLocator = canvasFrameLocator.locator(
    ':has-text("TextField")[draggable]',
  );

  await canvasPageRootLocator.waitFor();

  await canvasInputLocator.first().type('textField1');
  await canvasInputLocator.nth(1).type('textField2');

  await expect(canvasInputLocator.first()).toHaveAttribute('value', 'textField1');
  await expect(canvasInputLocator.nth(1)).toHaveAttribute('value', 'textField2');

  // Move element by dragging

  await expect(canvasMoveElementHandleLocator).not.toBeVisible();

  const firstInputLocator = canvasInputLocator.first();
  await selectCanvasComponent(page, firstInputLocator);

  const canvasPageOverlayBoundingBox = await canvasPageOverlayLocator.boundingBox();

  const secondTextFieldLocator = canvasInputLocator.nth(1);
  const secondTextFieldBoundingBox = await secondTextFieldLocator.boundingBox();

  expect(canvasPageOverlayBoundingBox).toBeDefined();
  expect(secondTextFieldBoundingBox).toBeDefined();

  await canvasMoveElementHandleLocator.dragTo(canvasPageOverlayLocator, {
    targetPosition: {
      x:
        secondTextFieldBoundingBox!.x +
        secondTextFieldBoundingBox!.width -
        canvasPageOverlayBoundingBox!.x,
      y:
        secondTextFieldBoundingBox!.y +
        secondTextFieldBoundingBox!.height / 2 -
        canvasPageOverlayBoundingBox!.y,
    },
  });

  await expect(canvasInputLocator.first()).toHaveAttribute('value', 'textField2');
  await expect(canvasInputLocator.nth(1)).toHaveAttribute('value', 'textField1');
});

test('can delete elements from page', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(twoFieldsDomTemplate));

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasInputLocator = canvasFrameLocator.locator('input');
  const canvasRemoveElementButtonLocator = canvasFrameLocator.locator(
    'button[aria-label="Remove element"]',
  );

  await canvasPageRootLocator.waitFor();

  await expect(canvasInputLocator).toHaveCount(2);

  // Delete element by clicking

  await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

  const firstInputLocator = canvasInputLocator.first();
  await selectCanvasComponent(page, firstInputLocator);

  await canvasRemoveElementButtonLocator.click();

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  const remainingTextFieldLocator = canvasInputLocator.first();
  await selectCanvasComponent(page, remainingTextFieldLocator);

  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);
});
