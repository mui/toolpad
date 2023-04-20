import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('duplication', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  {
    await editorModel.openHierarchyMenu('pages', 'page1');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await duplicateMenuItem.click();

    await page.waitForURL(/\/_toolpad\/app\/pages\/[^/]+$/);

    const button = editorModel.appCanvas.getByRole('button', { name: 'hello world' });
    await expect(button).toBeVisible();

    await editorModel.openHierarchyMenu('pages', 'page2');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(editorModel.getHierarchyItem('pages', 'page2')).toBeHidden();
  }
});
