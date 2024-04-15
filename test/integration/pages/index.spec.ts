import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import { folderExists } from '@toolpad/utils/fs';
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

test('must load page in initial URL without altering URL', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);

  await page.goto(`/_toolpad/app/pages/page2?abcd=123`);

  await editorModel.waitForOverlay();

  const pageButton2 = editorModel.appCanvas.getByRole('button', {
    name: 'page2Button',
  });
  await expect(pageButton2).toBeVisible();

  await expect(page).toHaveURL(/\/pages\/page2\?abcd=123/);
});

test('must show a message when a non-existing url is accessed', async ({ page }) => {
  await page.goto(`/prod/pages/i-dont-exist-lol`);

  await expect(page.getByText('Not found')).toBeVisible();
});

test('can rename page', async ({ page, localApp }) => {
  invariant(
    localApp,
    'test must be configured with `localAppConfig`. Add `test.use({ localAppConfig: ... })`',
  );

  const editorModel = new ToolpadEditor(page);

  await editorModel.goToPage('page2');
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
