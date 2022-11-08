import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadHome } from '../../models/ToolpadHome';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';

test('duplication', async ({ page, browserName }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });

  const editorModel = new ToolpadEditor(page, browserName);
  await editorModel.goto(app.id);

  {
    await editorModel.openHierarchyMenu('connections', 'connection');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate connection' });
    await Promise.all([duplicateMenuItem.click(), page.waitForNavigation()]);

    const input = page.getByLabel('base url');
    await expect(input).toHaveValue('https://example.com/');

    await editorModel.openHierarchyMenu('connections', 'connection1');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete connection1' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await Promise.all([deleteButton.click(), page.waitForNavigation()]);

    await expect(editorModel.hierarchyItem('connections', 'connection1')).toBeHidden();
  }

  {
    await editorModel.openHierarchyMenu('components', 'myComponent');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate myComponent' });
    await Promise.all([duplicateMenuItem.click(), page.waitForNavigation()]);

    await editorModel.openHierarchyMenu('components', 'myComponent1');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete myComponent1' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await Promise.all([deleteButton.click(), page.waitForNavigation()]);

    await expect(editorModel.hierarchyItem('components', 'myComponent1')).toBeHidden();
  }

  {
    await editorModel.openHierarchyMenu('pages', 'page1');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate page1' });
    await Promise.all([duplicateMenuItem.click(), page.waitForNavigation()]);

    const button = editorModel.appCanvas.getByRole('button', { name: 'hello world' });
    await expect(button).toBeVisible();

    await editorModel.openHierarchyMenu('pages', 'page2');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete page2' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await Promise.all([deleteButton.click(), page.waitForNavigation()]);

    await expect(editorModel.hierarchyItem('pages', 'page2')).toBeHidden();
  }
});
