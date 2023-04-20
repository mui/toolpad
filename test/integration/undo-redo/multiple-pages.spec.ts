import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-multiple-pages'),
    cmd: 'dev',
  },
});

test('test undo and redo through different pages', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

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
