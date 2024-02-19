import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { clickCenter } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-basic'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('can control component prop values in properties control panel', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const canvasInputLocator = editorModel.appCanvas.locator('input');

  // Verify that initial prop control values are correct

  const firstInputLocator = canvasInputLocator.first();
  await clickCenter(page, firstInputLocator);

  await editorModel.componentEditor.getByText('textField1').waitFor({ state: 'visible' });

  const labelControlInput = editorModel.componentEditor.getByLabel('label', { exact: true });

  const labelControlInputValue = await labelControlInput.inputValue();

  expect(labelControlInputValue).toBe('textField1');

  // Change component prop values directly
  const TEST_VALUE_1 = 'value1';
  const valueControl = editorModel.componentEditor.getByLabel('value', { exact: true });
  expect(await valueControl.inputValue()).not.toBe(TEST_VALUE_1);
  await firstInputLocator.fill(TEST_VALUE_1);
  await expect(valueControl).toHaveValue(TEST_VALUE_1);

  await expect(valueControl).toBeDisabled();

  // Change component prop values through controls
  const TEST_VALUE_2 = 'value2';
  const inputByLabel = editorModel.appCanvas.getByLabel(TEST_VALUE_2, { exact: true });
  await expect(inputByLabel).toHaveCount(0);
  await labelControlInput.click();
  await labelControlInput.fill('');
  await labelControlInput.fill(TEST_VALUE_2);

  await inputByLabel.waitFor({ state: 'visible' });
});

test('can toggle boolean prop that is true by default', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goto();

  await editorModel.waitForOverlay();

  const autocomplete = editorModel.appCanvas.getByLabel('search', { exact: true });

  await clickCenter(page, autocomplete);

  await editorModel.componentEditor.getByText('autocomplete').waitFor({ state: 'visible' });

  const fullWidthControlInput = editorModel.componentEditor.getByLabel('fullWidth', {
    exact: true,
  });

  await expect(fullWidthControlInput).toBeChecked();
  await fullWidthControlInput.click();
  await expect(fullWidthControlInput).not.toBeChecked();
  const labelControlInput = editorModel.componentEditor.getByLabel('label', { exact: true });
  await labelControlInput.click();
  await labelControlInput.fill('');
  await expect(labelControlInput).toHaveValue('');
});
