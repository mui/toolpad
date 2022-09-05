import { test, expect, Page, Locator } from '@playwright/test';
import { ToolpadHome } from '../../models/ToolpadHome';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';
import domInput from './domInput.json';

async function dispatchOverlayDragEvents(
  page: Page,
  editorModel: ToolpadEditor,
  moveTargetX: number,
  moveTargetY: number,
) {
  const canvasFrame = page.frame('data-toolpad-canvas');

  expect(canvasFrame).toBeDefined();

  const pageOverlayBoundingBox = await editorModel.pageOverlay.boundingBox();

  expect(pageOverlayBoundingBox).toBeDefined();

  const eventMousePosition = {
    clientX: moveTargetX - pageOverlayBoundingBox!.x,
    clientY: moveTargetY - pageOverlayBoundingBox!.y,
  };

  const pageOverlaySelector = 'data-testid=page-overlay';

  await canvasFrame!.dispatchEvent(pageOverlaySelector, 'dragover', eventMousePosition);
  await canvasFrame!.dispatchEvent(pageOverlaySelector, 'drop', eventMousePosition);
  await canvasFrame!.dispatchEvent(pageOverlaySelector, 'dragend');
}

async function dragNewComponentToTargetCenter(
  page: Page,
  editorModel: ToolpadEditor,
  browserName: string,
  componentName: string,
  targetLocator: Locator,
) {
  const isFirefox = browserName === 'firefox';

  const sourceLocator = editorModel.componentCatalog.locator(
    `:has-text("${componentName}")[draggable]`,
  );

  await editorModel.componentCatalog.hover();

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

  // Source drag event needs to be dispatched manually in Firefox for tests to work
  if (isFirefox) {
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());

    await page.dispatchEvent(
      `data-testid=component-catalog >> div:has-text("${componentName}")[draggable]`,
      'dragstart',
      { dataTransfer },
    );
  }

  const moveTargetX = targetBoundingBox!.x + targetBoundingBox!.width / 2;
  const moveTargetY = targetBoundingBox!.y + targetBoundingBox!.height / 2;

  await page.mouse.move(moveTargetX, moveTargetY, { steps: 5 });

  // Overlay drag events need to be dispatched manually in Firefox for tests to work
  if (isFirefox) {
    await dispatchOverlayDragEvents(page, editorModel, moveTargetX, moveTargetY);
  }

  await page.mouse.up();
}

test('can place new components from catalog', async ({ page, browserName }) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page);

  await homeModel.goto();
  const app = await homeModel.createApplication({});
  await editorModel.goto(app.id);

  const canvasInputLocator = editorModel.canvasFrame.locator('input');

  await expect(canvasInputLocator).toHaveCount(0);

  // Drag in a first component

  await dragNewComponentToTargetCenter(
    page,
    editorModel,
    browserName,
    'TextField',
    editorModel.pageRoot,
  );

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();

  // Drag in a second component

  await dragNewComponentToTargetCenter(
    page,
    editorModel,
    browserName,
    'TextField',
    editorModel.pageOverlay,
  );

  await expect(canvasInputLocator).toHaveCount(2);
});

test('can move elements in page', async ({ page, browserName }) => {
  const isFirefox = browserName === 'firefox';

  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page);

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  const canvasInputLocator = editorModel.canvasFrame.locator('input');
  const canvasMoveElementHandleLocator = editorModel.canvasFrame.locator(
    ':has-text("TextField")[draggable]',
  );

  await editorModel.pageRoot.waitFor();

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

  const moveTargetX = secondTextFieldBoundingBox!.x + secondTextFieldBoundingBox!.width;
  const moveTargetY = secondTextFieldBoundingBox!.y + secondTextFieldBoundingBox!.height / 2;

  await page.mouse.move(moveTargetX, moveTargetY, { steps: 5 });

  // Overlay drag events need to be dispatched manually in Firefox for tests to work
  if (isFirefox) {
    await dispatchOverlayDragEvents(page, editorModel, moveTargetX, moveTargetY);
  }

  await page.mouse.up();

  await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField2');
  await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField1');
});

test('can delete elements from page', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page);

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  const canvasInputLocator = editorModel.canvasFrame.locator('input');
  const canvasRemoveElementButtonLocator = editorModel.canvasFrame.locator(
    'button[aria-label="Remove element"]',
  );

  await editorModel.pageRoot.waitFor();

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
