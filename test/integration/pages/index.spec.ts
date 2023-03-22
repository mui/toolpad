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

test('must load page in initial URL without altering URL', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await page.goto(`/_toolpad/app/${APP_ID_LOCAL_MARKER}/pages/g433ywb?abcd=123`);

  await editorModel.pageRoot.waitFor();

  const pageButton2 = editorModel.appCanvas.getByRole('button', {
    name: 'page2Button',
  });
  await expect(pageButton2).toBeVisible();

  await expect(page).toHaveURL(/\/pages\/g433ywb\?abcd=123/);
});
