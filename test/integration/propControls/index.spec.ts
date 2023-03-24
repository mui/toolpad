import * as path from 'path';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import clickCenter from '../../utils/clickCenter';

test.describe('basic', () => {
  test.use({
    localAppConfig: {
      template: path.resolve(__dirname, './fixture-basic'),
      cmd: 'dev',
    },
  });

  test('can control component prop values in properties control panel', async ({ page }) => {
    const editorModel = new ToolpadEditor(page);

    await editorModel.goto();

    await editorModel.pageRoot.waitFor();

    const canvasInputLocator = editorModel.appCanvas.locator('input');

    // Verify that initial prop control values are correct

    const firstInputLocator = canvasInputLocator.first();
    await clickCenter(page, firstInputLocator);

    await editorModel.componentEditor
      .locator('h6:has-text("Text field")')
      .waitFor({ state: 'visible' });

    const labelControlInput = editorModel.componentEditor.getByLabel('label', { exact: true });

    const labelControlInputValue = await labelControlInput.inputValue();

    expect(labelControlInputValue).toBe('textField1');

    // Change component prop values directly
    const TEST_VALUE_1 = 'value1';
    const valueControl = editorModel.componentEditor.getByLabel('value', { exact: true });
    expect(await valueControl.inputValue()).not.toBe(TEST_VALUE_1);
    await firstInputLocator.fill(TEST_VALUE_1);
    await expect(valueControl).toHaveValue(TEST_VALUE_1);

    // Change component prop values through controls
    const TEST_VALUE_2 = 'value2';
    const inputByLabel = editorModel.appCanvas.getByLabel(TEST_VALUE_2, { exact: true });
    await expect(inputByLabel).toHaveCount(0);
    await labelControlInput.click();
    await labelControlInput.fill('');
    await labelControlInput.fill(TEST_VALUE_2);

    await inputByLabel.waitFor({ state: 'visible' });
  });
});

test.describe('default values', () => {
  test.use({
    localAppConfig: {
      template: path.resolve(__dirname, './fixture-defaults'),
      cmd: 'dev',
    },
  });

  test('changing defaultValue resets controlled value', async ({ page }) => {
    const editorModel = new ToolpadEditor(page);
    await editorModel.goto();

    await editorModel.pageRoot.waitFor();

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
});
