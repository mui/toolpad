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

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  // Initially we should have 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  // Add 3rd text field
  await editorModel.dragNewComponentToAppCanvas('Text field');

  // Ensure that we added 3rd text field
  await expect(canvasInputLocator).toHaveCount(3);

  const undoButton = page.locator('[data-testid=undo-button]');

  // Wait for undo stack to be updated
  await page.waitForTimeout(600);

  // Undo adding text field
  undoButton.click();

  // Check that we have only 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  const redoButton = page.locator('[data-testid=redo-button]');

  redoButton.click();

  // Redo should bring back text field
  await expect(canvasInputLocator).toHaveCount(3);
});

test('test batching quick actions into single undo entry', async ({ page, browserName }) => {
  const homeModel = new ToolpadHome(page);
  const editorModel = new ToolpadEditor(page, browserName);

  const domInput = await readJsonFile(path.resolve(__dirname, './dom.json'));

  await homeModel.goto();
  const app = await homeModel.createApplication({ dom: domInput });
  await editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const input = editorModel.appCanvas.locator('input').first();

  clickCenter(page, input);

  await page.getByLabel('defaultValue').fill('some value');
  await page.getByLabel('label').fill('some label');

  await expect(input).toHaveValue('some value');
  await expect(editorModel.appCanvas.getByLabel('some label')).toBeVisible();

  // Wait for undo stack to be updated
  await page.waitForTimeout(600);

  const undoButton = page.locator('[data-testid=undo-button]');
  // Undo changes
  undoButton.click();

  // Asssert that batched changes were reverted
  await expect(input).toHaveValue('');
  await expect(editorModel.appCanvas.getByLabel('some label')).not.toBeVisible();
});
