import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import clickCenter from '../../utils/clickCenter';
import generateId from '../../utils/generateId';

test('test basic undo and redo', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  // Initially we should have 2 text fields
  await expect(canvasInputLocator).toHaveCount(2);

  // Add 3rd text field
  await editorModel.dragNewComponentToAppCanvas('Text field');

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

test('test batching text input actions into single undo entry', async ({
  page,
  browserName,
  api,
}) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const input = editorModel.appCanvas.locator('input').first();

  clickCenter(page, input);

  await editorModel.componentEditor.getByLabel('defaultValue', { exact: true }).click();

  await page.keyboard.type('some value');

  // Wait for undo stack to be updated
  await page.waitForTimeout(500);

  await page.keyboard.type(' hello');

  await editorModel.componentEditor.getByLabel('defaultValue', { exact: true }).blur();

  await expect(input).toHaveValue('some value hello');

  // Wait for undo stack to be updated
  await page.waitForTimeout(500);

  // Undo changes
  await page.keyboard.press('Control+Z');

  // Asssert that batched changes were reverted
  await expect(input).toHaveValue('some value');
});

test('test undo and redo through different pages', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './2pages.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const pageButton1 = editorModel.appCanvas.getByRole('button', {
    name: 'page1Button',
  });
  await expect(pageButton1).toBeVisible();

  await editorModel.goToPage('page2');

  const pageButton2 = editorModel.appCanvas.getByRole('button', {
    name: 'page2Button',
  });
  await expect(pageButton2).toBeVisible();

  // Undo changes
  await page.keyboard.press('Control+Z');

  await expect(pageButton1).toBeVisible();
});
