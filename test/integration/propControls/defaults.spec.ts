import * as path from 'path';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-defaults'),
    cmd: 'dev',
  },
});

test('changing defaultValue resets controlled value', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.waitForOverlay();

  const firstInput = editorModel.appCanvas.locator('input').nth(0);
  const secondInput = editorModel.appCanvas.locator('input').nth(1);

  await secondInput.focus();

  await page.keyboard.type('Extra');

  await expect(firstInput).toHaveValue('defaultTwoExtra');

  await firstInput.focus();

  await page.keyboard.type('Value');

  await expect(firstInput).toHaveValue('defaultTwoExtraValue');

  clickCenter(page, secondInput);

  await editorModel.componentEditor.getByLabel('defaultValue', { exact: true }).fill('New');

  await expect(firstInput).toHaveValue('New');
  await expect(secondInput).toHaveValue('New');
});
