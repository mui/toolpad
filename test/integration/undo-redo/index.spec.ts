import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadHome } from '../../models/ToolpadHome';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import clickCenter from '../../utils/clickCenter';

test('test basic undo and redo', async ({ page, browserName }) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page, browserName);

  const domInput = await readJsonFile(path.resolve(__dirname, './dom.json'));

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  // Initially we should have 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  // Add 3rd text field
  await editorModel.dragNewComponentToAppCanvas('Text field');

  // Ensure that we added 3rd text field
  await expect(canvasInputLocator).toHaveCount(3);

  // Wait for undo stack to be updated
  await page.waitForTimeout(600);

  // Undo adding text field
  await page.keyboard.press('Control+Z');

  // Check that we have only 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  await page.keyboard.press('Control+Shift+Z');

  // Redo should bring back text field
  await expect(canvasInputLocator).toHaveCount(3);
});

test.only('test batching quick actions into single undo entry', async ({ page, browserName }) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page, browserName);

  const domInput = await readJsonFile(path.resolve(__dirname, './dom.json'));

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const input = editorModel.appCanvas.locator('input').first();

  clickCenter(page, input);

  await editorModel.componentEditor.getByLabel('defaultValue').fill('some value');
  await editorModel.componentEditor.getByLabel('label').fill('some label');
  await editorModel.componentEditor.getByLabel('label').blur();

  await expect(input).toHaveValue('some value');
  await expect(editorModel.appCanvas.getByLabel('some label')).toBeVisible();

  // Wait for undo stack to be updated
  await page.waitForTimeout(600);

  // Undo changes
  await page.keyboard.press('Control+Z');

  // Asssert that batched changes were reverted
  await expect(input).toHaveValue('');
  await expect(editorModel.appCanvas.getByLabel('some label')).not.toBeVisible();
});
