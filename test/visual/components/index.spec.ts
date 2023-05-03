import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('rendering components in the app runtime', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('components');

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test('rendering components in the app editor', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.waitForOverlay();

  await expect(page).toHaveScreenshot('no-selection.png');

  const image = editorModel.appCanvas.locator('img').first();

  await clickCenter(page, image);
  await expect(page).toHaveScreenshot('with-selection.png');
});
