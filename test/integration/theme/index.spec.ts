import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
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

  await editorModel.themeEditor.getByRole('button', { name: 'Dark' }).click();
  await expect(canvasBodyLocator).toHaveCSS('background-color', 'rgb(18, 18, 18)');

  await editorModel.themeEditor.getByRole('button', { name: 'Light' }).click();
  await expect(canvasBodyLocator).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
