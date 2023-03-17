import * as path from 'path';
import { test, expect } from '../../playwright/test';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';
import generateId from '../../utils/generateId';
import { readJsonFile } from '../../utils/fs';

test('can place new components from catalog', async ({ page, api }) => {
  const app = await api.mutation.createApp(`App ${generateId()}`);

  const editorModel = new ToolpadEditor(page);

  await editorModel.goto(app.id);

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  await expect(canvasInputLocator).toHaveCount(0);

  const TEXT_FIELD_COMPONENT_DISPLAY_NAME = 'Text field';

  // Drag in a first component

  await editorModel.dragNewComponentToAppCanvas(TEXT_FIELD_COMPONENT_DISPLAY_NAME);

  await expect(canvasInputLocator).toHaveCount(1);
  await expect(canvasInputLocator).toBeVisible();

  // Drag in a second component

  await editorModel.dragNewComponentToAppCanvas(TEXT_FIELD_COMPONENT_DISPLAY_NAME);

  await expect(canvasInputLocator).toHaveCount(2);
});

test('can move elements in page', async ({ page, api }) => {
  const editorModel = new ToolpadEditor(page);
  const TEXT_FIELD_COMPONENT_DISPLAY_NAME = 'Text field';

  const dom = await readJsonFile(path.resolve(__dirname, './domInput.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  await editorModel.goto(app.id);

  await editorModel.pageRoot.waitFor();

  const canvasMoveElementHandleSelector = `:has-text("${TEXT_FIELD_COMPONENT_DISPLAY_NAME}")[draggable]`;

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasMoveElementHandleLocator = editorModel.appCanvas.locator(
    canvasMoveElementHandleSelector,
  );

  const firstTextFieldLocator = canvasInputLocator.first();
  const secondTextFieldLocator = canvasInputLocator.nth(1);

  await firstTextFieldLocator.focus();
  await firstTextFieldLocator.fill('textField1');

  await secondTextFieldLocator.focus();
  await secondTextFieldLocator.fill('textField2');

  await expect(firstTextFieldLocator).toHaveValue('textField1');
  await expect(secondTextFieldLocator).toHaveValue('textField2');

  await expect(canvasMoveElementHandleLocator).not.toBeVisible();

  // Move first element by dragging it to the right side of second element

  await clickCenter(page, firstTextFieldLocator);

  const secondTextFieldBoundingBox = await secondTextFieldLocator.boundingBox();
  expect(secondTextFieldBoundingBox).toBeDefined();

  const moveTargetX = secondTextFieldBoundingBox!.x + secondTextFieldBoundingBox!.width;
  const moveTargetY = secondTextFieldBoundingBox!.y + secondTextFieldBoundingBox!.height / 2;

  await editorModel.dragToAppCanvas(
    canvasMoveElementHandleSelector,
    true,
    moveTargetX,
    moveTargetY,
  );

  await expect(firstTextFieldLocator).toHaveValue('textField2');
  await expect(secondTextFieldLocator).toHaveValue('textField1');
});

test('can delete elements from page', async ({ page, api }) => {
  const editorModel = new ToolpadEditor(page);

  const dom = await readJsonFile(path.resolve(__dirname, './domInput.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  await editorModel.goto(app.id);

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasRemoveElementButtonLocator = editorModel.appCanvas.locator(
    'button[aria-label="Remove"]',
  );

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

test('can create new component', async ({ page, api }) => {
  const app = await api.mutation.createApp(`App ${generateId()}`);

  const editorModel = new ToolpadEditor(page);

  await editorModel.goto(app.id);

  await editorModel.createPage('somePage');
  await editorModel.createComponent('someComponent');
});
