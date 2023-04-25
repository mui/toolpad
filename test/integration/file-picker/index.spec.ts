import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('File Picker component', async ({ page }) => {
  const testFilePath = path.resolve(__dirname, './test.txt');

  const editorModel = new ToolpadEditor(page);
  editorModel.goto();

  await editorModel.waitForOverlay();

  const filePicker = editorModel.pageRoot.locator('label');

  await expect(filePicker).toBeVisible();

  await filePicker.setInputFiles(testFilePath);

  await expect(editorModel.pageRoot.getByText('test.txt')).toBeVisible();
  await expect(editorModel.pageRoot.getByText('Uploaded')).toBeVisible();
});
