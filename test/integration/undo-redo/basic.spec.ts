import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-basic'),
    cmd: 'dev',
  },
});

test('test basic undo and redo', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  // Initially we should have 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  // Add 3rd text field
  await editorModel.dragNewComponentTo('Text Field');

  // Ensure that we added 3rd text field
  await expect(canvasInputLocator).toHaveCount(3);

  // Undo adding text field
  await page.keyboard.press('Control+Z');

  // Check that we have only 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  await page.keyboard.press('Control+Shift+Z');

  // Redo should bring back text field
  await expect(canvasInputLocator).toHaveCount(3);
});

test('test batching text input actions into single undo entry', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.waitForOverlay();

  const input = editorModel.appCanvas.locator('input').first();

  await clickCenter(page, input);

  const defaultValueInput = editorModel.componentEditor.getByLabel('defaultValue', { exact: true });

  await defaultValueInput.click();

  await page.keyboard.type('some value');

  await expect(input).toHaveValue('some value');

  // Wait for undo stack to be updated
  await page.waitForTimeout(500);

  await page.keyboard.type(' hello');

  await defaultValueInput.blur();

  await expect(input).toHaveValue('some value hello');

  // Wait for undo stack to be updated
  await page.waitForTimeout(500);

  // Undo changes
  await page.keyboard.press('Control+Z');

  // Asssert that batched changes were reverted
  await expect(input).toHaveValue('some value');
});
