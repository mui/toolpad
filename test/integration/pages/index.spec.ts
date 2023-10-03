import * as path from 'path';
import * as fs from 'fs/promises';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';
import { folderExists } from '../../../packages/toolpad-utils/src/fs';

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

test.only('can rename page', async ({ page, localApp }) => {
  const editorModel = new ToolpadEditor(page);

  await editorModel.goToPageById('g433ywb');
  await editorModel.waitForOverlay();

  const text = editorModel.appCanvas.getByText('foo');

  await expect(text).toBeVisible();

  const oldPageFolder = path.resolve(localApp.dir, './toolpad/pages/page2');
  await expect.poll(async () => folderExists(oldPageFolder)).toBe(true);

  await editorModel.explorer.getByText('page2').dblclick();
  await page.keyboard.type('renamedpage');
  await page.keyboard.press('Enter');

  const newPageFolder = path.resolve(localApp.dir, './toolpad/pages/renamedpage');
  await expect.poll(async () => folderExists(oldPageFolder)).toBe(false);
  await expect.poll(async () => folderExists(newPageFolder)).toBe(true);

  await expect(text).toBeVisible();
  await fs.rename(newPageFolder, oldPageFolder);
});
