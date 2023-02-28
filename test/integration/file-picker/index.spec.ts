import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test('File picker component', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));
  const testFilePath = path.resolve(__dirname, './test.txt');

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  await page.pause();

  const editorModel = new ToolpadEditor(page);
  editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  const filePicker = editorModel.pageRoot.locator('label');

  await expect(filePicker).toBeVisible();

  await filePicker.setInputFiles(testFilePath);

  await expect(editorModel.pageRoot.getByText('test.txt')).toBeVisible();
  await expect(editorModel.pageRoot.getByText('Uploaded')).toBeVisible();
});
