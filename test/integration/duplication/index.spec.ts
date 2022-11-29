import invariant from 'invariant';
import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import { createApplication } from '../../utils/toolpadApi';

test.use({ ignoreConsoleErrors: [/Cannot read properties of null/] });

test('duplication', async ({ page, browserName, baseURL }) => {
  invariant(baseURL, 'playwright must be run with a a baseURL');

  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await createApplication(baseURL, { dom });

  const editorModel = new ToolpadEditor(page, browserName);
  await editorModel.goto(app.id);

  {
    await editorModel.openHierarchyMenu('connections', 'connection');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await Promise.all([duplicateMenuItem.click(), page.waitForNavigation()]);

    const input = page.getByLabel('base url');
    await expect(input).toHaveValue('https://example.com/');

    await editorModel.openHierarchyMenu('connections', 'connection1');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await Promise.all([deleteButton.click(), page.waitForNavigation()]);

    await expect(editorModel.hierarchyItem('connections', 'connection1')).toBeHidden();
  }

  {
    await editorModel.openHierarchyMenu('components', 'myComponent');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await Promise.all([duplicateMenuItem.click(), page.waitForNavigation()]);

    await editorModel.openHierarchyMenu('components', 'myComponent1');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await Promise.all([deleteButton.click(), page.waitForNavigation()]);

    await expect(editorModel.hierarchyItem('components', 'myComponent1')).toBeHidden();
  }

  {
    await editorModel.openHierarchyMenu('pages', 'page1');
    const duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    await Promise.all([duplicateMenuItem.click(), page.waitForNavigation()]);

    const button = editorModel.appCanvas.getByRole('button', { name: 'hello world' });
    await expect(button).toBeVisible();

    await editorModel.openHierarchyMenu('pages', 'page2');
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    await deleteMenuItem.click();
    const deleteButton = editorModel.confirmationDialog.getByRole('button', { name: 'Delete' });
    await Promise.all([deleteButton.click(), page.waitForNavigation()]);

    await expect(editorModel.hierarchyItem('pages', 'page2')).toBeHidden();
  }
});
