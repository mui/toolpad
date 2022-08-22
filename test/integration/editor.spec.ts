import { test, expect, Page, Locator } from '@playwright/test';
import createApp from '../utils/createApp';
import generateId from '../utils/generateId';
import { canvasFrame, componentCatalog, pageRoot, pageOverlay } from '../utils/locators';
import twoFieldsDomTemplate from '../domTemplates/twoTextFields.json';

async function selectComponent(page: Page, componentLocator: Locator) {
  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageOverlayLocator = canvasFrameLocator.locator(pageOverlay);
  const canvasPageOverlayBoundingBox = await canvasPageOverlayLocator.boundingBox();

  const componentBoundingBox = await componentLocator.boundingBox();

  expect(canvasPageOverlayBoundingBox).toBeDefined();

  await canvasPageOverlayLocator.click({
    position: {
      x:
        componentBoundingBox!.x + componentBoundingBox!.width / 2 - canvasPageOverlayBoundingBox!.x,
      y:
        componentBoundingBox!.y +
        componentBoundingBox!.height / 2 -
        canvasPageOverlayBoundingBox!.y,
    },
  });
}

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

  // Move element by dragging

  await expect(canvasMoveElementHandleLocator).not.toBeVisible();

  const firstInputLocator = canvasInputLocator.first();
  await selectComponent(page, firstInputLocator);

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
  await selectComponent(page, firstInputLocator);

  await canvasRemoveElementButtonLocator.click();

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  const remainingTextFieldLocator = canvasInputLocator.first();
  await selectComponent(page, remainingTextFieldLocator);

  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);
});
