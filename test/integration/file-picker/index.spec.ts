import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';
import { APP_ID_LOCAL_MARKER } from '../../../packages/toolpad-app/src/constants';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('File picker component', async ({ page }) => {
  const testFilePath = path.resolve(__dirname, './test.txt');

  const editorModel = new ToolpadEditor(page);
  editorModel.goto(APP_ID_LOCAL_MARKER);

  await editorModel.waitForOverlay();

  const filePicker = editorModel.pageRoot.locator('label');

  await expect(filePicker).toBeVisible();

  await filePicker.setInputFiles(testFilePath);

  await expect(editorModel.pageRoot.getByText('test.txt')).toBeVisible();
  await expect(editorModel.pageRoot.getByText('Uploaded')).toBeVisible();
});
