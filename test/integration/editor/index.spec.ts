import { test, expect, Page, Locator } from '@playwright/test';
import createApp from '../../utils/createApp';
import clickCenter from '../../utils/clickCenter';
import generateId from '../../utils/generateId';
import { canvasFrame, componentCatalog, pageRoot } from '../../utils/locators';
import domInput from './domInput.json';

async function dragCenterToCenter(page: Page, sourceLocator: Locator, targetLocator: Locator) {
  const sourceBoundingBox = await sourceLocator.boundingBox();
  const targetBoundingBox = await targetLocator.boundingBox();

  expect(sourceBoundingBox).toBeDefined();
  expect(targetBoundingBox).toBeDefined();

  await page.mouse.move(
    sourceBoundingBox!.x + sourceBoundingBox!.width / 2,
    sourceBoundingBox!.y + sourceBoundingBox!.height / 2,
    { steps: 5 },
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBoundingBox!.x + targetBoundingBox!.width / 2,
    targetBoundingBox!.y + targetBoundingBox!.height / 2,
    { steps: 5 },
  );
  await page.mouse.up();
}

test('can place new components from catalog', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`);

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const componentCatalogLocator = page.locator(componentCatalog);
  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasInputLocator = canvasFrameLocator.locator('input');

  await canvasPageRootLocator.waitFor();

  await expect(canvasInputLocator).toHaveCount(0);

  // Drag in a first component

  await componentCatalogLocator.hover();

  const textFieldDragSourceLocator = componentCatalogLocator.locator(
    ':has-text("TextField")[draggable]',
  );
  await dragCenterToCenter(page, textFieldDragSourceLocator, canvasPageRootLocator);

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();

  // Drag in a second component

  await componentCatalogLocator.hover();
  await dragCenterToCenter(page, textFieldDragSourceLocator, canvasPageRootLocator);

  await expect(canvasInputLocator).toHaveCount(2);
});

test('can move elements in page', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(domInput));

  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageRootLocator = canvasFrameLocator.locator(pageRoot);
  const canvasInputLocator = canvasFrameLocator.locator('input');
  const canvasMoveElementHandleLocator = canvasFrameLocator.locator(
    ':has-text("TextField")[draggable]',
  );

  await canvasPageRootLocator.waitFor();

  const firstTextFieldLocator = canvasInputLocator.first();
  const secondTextFieldLocator = canvasInputLocator.nth(1);

  await firstTextFieldLocator.focus();
  await firstTextFieldLocator.fill('textField1');

  await secondTextFieldLocator.focus();
  await secondTextFieldLocator.fill('textField2');

  await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField1');
  await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField2');

  await expect(canvasMoveElementHandleLocator).not.toBeVisible();

  // Move first element by dragging it to the right side of second element

  await clickCenter(page, firstTextFieldLocator);

  const canvasMoveElementHandleBoundingBox = await canvasMoveElementHandleLocator.boundingBox();
  const secondTextFieldBoundingBox = await secondTextFieldLocator.boundingBox();

  expect(canvasMoveElementHandleBoundingBox).toBeDefined();
  expect(secondTextFieldBoundingBox).toBeDefined();

  await page.mouse.move(
    canvasMoveElementHandleBoundingBox!.x + canvasMoveElementHandleBoundingBox!.width / 2,
    canvasMoveElementHandleBoundingBox!.y + canvasMoveElementHandleBoundingBox!.height / 2,
    { steps: 5 },
  );
  await page.mouse.down();
  await page.mouse.move(
    secondTextFieldBoundingBox!.x + secondTextFieldBoundingBox!.width,
    secondTextFieldBoundingBox!.y + secondTextFieldBoundingBox!.height / 2,
    { steps: 5 },
  );
  await page.mouse.up();

  await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField2');
  await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField1');
});

test('can delete elements from page', async ({ page }) => {
  const appId = generateId();

  await page.goto('/');
  await createApp(page, `App ${appId}`, JSON.stringify(domInput));

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

  const firstTextFieldLocator = canvasInputLocator.first();

  await clickCenter(page, firstTextFieldLocator);
  await canvasRemoveElementButtonLocator.click();

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  await clickCenter(page, firstTextFieldLocator);
  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);
});
