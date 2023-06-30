import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('must load page in initial URL without altering URL', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await page.goto(`/_toolpad/app/pages/g433ywb?abcd=123`);

  await editorModel.waitForOverlay();

  const pageButton2 = editorModel.appCanvas.getByRole('button', {
    name: 'page2Button',
  });
  await expect(pageButton2).toBeVisible();

  await expect(page).toHaveURL(/\/pages\/g433ywb\?abcd=123/);
});

test('must show a message when a non-existing url is accessed', async ({ page }) => {
  await page.goto(`/preview/pages/i-dont-exist-lol`);

  await expect(page.getByText('Not found')).toBeVisible();
});

test('do not find content if you delete page of middle ', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goto();

  const pageMenuItem = editorModel.getHierarchyItem('pages', 'page1');
  await pageMenuItem.hover();
  await pageMenuItem.getByRole('button', { name: 'Open hierarchy menu' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Confirm' })
    .getByRole('button', { name: 'Delete' })
    .click();

  await expect(pageMenuItem).toBeHidden();
  await expect(page.url().includes('undefined')).toBe(false);
});
