import * as path from 'path';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('can change between light and dark themes', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  await page.getByRole('tab', { name: 'Theme' }).click();

  const canvasBodyLocator = editorModel.appCanvas.locator('body');

  await expect(canvasBodyLocator).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  await editorModel.themeEditor.getByRole('button', { name: 'Add theme' }).click();

  await editorModel.themeEditor.getByRole('button', { name: 'Dark' }).click();
  await expect(canvasBodyLocator).toHaveCSS('background-color', 'rgb(18, 18, 18)');

  await editorModel.themeEditor.getByRole('button', { name: 'Light' }).click();
  await expect(canvasBodyLocator).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
