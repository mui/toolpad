import * as path from 'path';
import * as url from 'url';
import invariant from 'invariant';
import { test, expect } from '../../playwright/localTest';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { clickCenter } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('pro app', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('basic');

  await editorModel.waitForOverlay();

  await argosScreenshot('pro-overview');

  await clickCenter(page, editorModel.appCanvas.getByRole('grid'));

  const columnHeader = editorModel.appCanvas.getByRole('columnheader', { name: 'name column' });
  await columnHeader.hover();
  await columnHeader.getByLabel('Menu').click();

  await expect(editorModel.appCanvas.getByRole('menuitem', { name: 'Aggregation' })).toBeVisible();

  await expect(
    editorModel.appCanvas.getByRole('menuitem', { name: 'Group by name column' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'columns' }).click();
  await page.getByRole('button', { name: 'name column' }).click();

  await expect(page.getByRole('checkbox', { name: 'Groupable' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Aggregable' })).toBeVisible();

  const columnEditorBox = await page.getByLabel('Column editor').boundingBox();
  invariant(columnEditorBox, 'Column editor box not found');

  await argosScreenshot('pro-grid-column', { clip: columnEditorBox });
});
