import * as path from 'path';
import * as url from 'url';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';
import { clickCenter } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-basic'),
  },
  localAppConfig: {
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
  await editorModel.dragNewComponentToCanvas('Text Field');

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
