import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test('duplication', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  {
    await editorModel.openHierarchyMenu('connections', 'connection');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await duplicateMenuItem.click();

    await page.waitForURL(/\/_toolpad\/app\/[^/]+\/connections\/[^/]+$/);

    const input = page.getByLabel('base url');
    await expect(input).toHaveValue('https://example.com/');

    await editorModel.openHierarchyMenu('connections', 'connection1');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(editorModel.hierarchyItem('connections', 'connection1')).toBeHidden();
  }

  {
    await editorModel.openHierarchyMenu('components', 'myComponent');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await duplicateMenuItem.click();

    await page.waitForURL(/\/_toolpad\/app\/[^/]+\/codeComponents\/[^/]+$/);

    await editorModel.openHierarchyMenu('components', 'myComponent1');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(editorModel.hierarchyItem('components', 'myComponent1')).toBeHidden();
  }

  {
    await editorModel.openHierarchyMenu('pages', 'page1');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await duplicateMenuItem.click();

    await page.waitForURL(/\/_toolpad\/app\/[^/]+\/pages\/[^/]+$/);

    const button = editorModel.appCanvas.getByRole('button', { name: 'hello world' });
    await expect(button).toBeVisible();

    await editorModel.openHierarchyMenu('pages', 'page2');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(editorModel.hierarchyItem('pages', 'page2')).toBeHidden();
  }
});
