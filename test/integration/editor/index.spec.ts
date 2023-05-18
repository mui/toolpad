import * as path from 'path';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('can move elements in page', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasMoveElementHandleLocator = editorModel.appCanvas.getByTestId('node-hud-tag');

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

  const secondTextFieldBoundingBox = await secondTextFieldLocator.boundingBox();
  expect(secondTextFieldBoundingBox).toBeDefined();

  const moveTargetX = secondTextFieldBoundingBox!.x + secondTextFieldBoundingBox!.width;
  const moveTargetY = secondTextFieldBoundingBox!.y + secondTextFieldBoundingBox!.height / 2;

  await editorModel.dragToAppCanvas(
    editorModel.appCanvas.getByTestId('node-hud-tag'),
    moveTargetX,
    moveTargetY,
  );

  await expect(firstTextFieldLocator).toHaveAttribute('value', 'textField2');
  await expect(secondTextFieldLocator).toHaveAttribute('value', 'textField1');
});

test('can delete elements from page', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  await expect(canvasInputLocator).toHaveCount(2);

  const canvasRemoveElementButtonLocator = editorModel.appCanvas.getByRole('button', {
    name: 'Remove',
  });

  // Delete element by clicking

  await expect(canvasRemoveElementButtonLocator).not.toBeVisible();

  const firstTextFieldLocator = canvasInputLocator.first();

  await clickCenter(page, firstTextFieldLocator);

  await expect(canvasRemoveElementButtonLocator).toBeVisible();

  await canvasRemoveElementButtonLocator.click();

  await expect(canvasInputLocator).toHaveCount(1);

  // Delete element by pressing key

  await clickCenter(page, firstTextFieldLocator);
  await page.keyboard.press('Backspace');

  await expect(canvasInputLocator).toHaveCount(0);
});

test('code editor auto-complete', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goToPageById('K7SkzhT');

  await editorModel.waitForOverlay();

  const text = editorModel.appCanvas.getByText('text-foo');

  await clickCenter(page, text);

  const bindingButton = editorModel.componentEditor.getByLabel('Bind property "Value"');

  await bindingButton.click();

  const editor = page
    .getByRole('dialog', { name: 'Bind property "Value"' })
    .locator('.monaco-editor');

  await editor.waitFor();

  await page.keyboard.type('textF');
  await expect(page.getByRole('option', { name: 'textField' })).toBeVisible();
});
