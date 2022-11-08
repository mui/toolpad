import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadHome } from '../../models/ToolpadHome';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';

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

  await editorModel.pageRoot.waitFor();

  const canvasInputLocator = editorModel.appCanvas.locator('input');
  const canvasButtonLocator = editorModel.appCanvas.getByRole('button', { name: 'Button Text' });

  // Initially we should 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  // Add one more text field and button
  await editorModel.dragNewComponentToAppCanvas('Text field');
  await expect(canvasInputLocator).toHaveCount(3);

  await editorModel.dragNewComponentToAppCanvas('Button');

  // await page.pause();

  await expect(canvasButtonLocator).toHaveCount(1);

  // Wait for undo stack to be updated
  await page.waitForTimeout(600);

  const undoButton = page.locator('[data-testid=undo-button]');

  // Undo adding text field
  undoButton.click();

  // Ensure that undo removed extra text field and button
  await expect(canvasInputLocator).toHaveCount(2);
  await expect(canvasButtonLocator).toHaveCount(0);
});
