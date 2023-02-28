import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test('must load page in initial URL without altering URL', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './2pages.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);

  await page.goto(`/_toolpad/app/${app.id}/pages/g433ywb?abcd=123`);

  await editorModel.pageRoot.waitFor();

  const pageButton2 = editorModel.appCanvas.getByRole('button', {
    name: 'page2Button',
  });
  await expect(pageButton2).toBeVisible();

  await expect(page).toHaveURL(/\/pages\/g433ywb\?abcd=123/);
});
