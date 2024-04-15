import * as path from 'path';
import * as url from 'url';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('duplication', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  {
    await editorModel.openPageExplorerMenu('page1');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await duplicateMenuItem.click();

    await page.waitForURL(/\/prod\/editor\/app\/pages\/[^/]+$/);

    const button = editorModel.appCanvas.getByRole('button', { name: 'hello world' });
    await expect(button).toBeVisible();

    await editorModel.openPageExplorerMenu('page2');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(editorModel.getExplorerItem('page2')).toBeHidden();
  }
});
