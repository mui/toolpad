import * as path from 'path';
import * as url from 'url';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';
import { cellLocator } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-basic'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('Column prop updates are not lost on drag interactions', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goToPage('page1');

  await editorModel.waitForOverlay();

  const canvasGridLocator = editorModel.appCanvas.getByRole('grid');

  // Change the "Avatar" column type from "link" to "boolean"

  const firstGridLocator = canvasGridLocator.first();

  // Wait for data to load so that datagrid bounding box is stable
  await expect(editorModel.pageRoot.getByText('Todd Breitenberg')).toBeVisible();

  await clickCenter(page, firstGridLocator);

  await editorModel.componentEditor.locator('button:has-text("columns")').click();

  await editorModel.page.getByRole('button', { name: 'Avatar' }).click();

  await editorModel.page.getByRole('combobox', { name: 'link' }).click();

  await editorModel.page.getByRole('option', { name: 'boolean' }).click();

  await page.keyboard.press('Escape');

  // Drag the "Avatar" column to the end of the grid

  const avatarColumn = editorModel.pageRoot.getByText('Avatar', { exact: true });
  const profileColumn = editorModel.pageRoot.getByText('Profile', { exact: true });

  await avatarColumn.dragTo(profileColumn);

  // Expect the "Avatar" column to continue to be of type "boolean" instead of "link"

  await expect(
    editorModel.pageRoot.getByRole('row', { name: 'Todd Breitenberg' }).getByTestId('CheckIcon'),
  ).toBeVisible();
});

test('Date columns', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goToPage('dateColumns');

  await editorModel.waitForOverlay();

  const canvasGridLocator = editorModel.appCanvas.getByRole('grid');

  await expect(cellLocator(canvasGridLocator, 2, 1)).toHaveText('4/1/2023');
  await expect(cellLocator(canvasGridLocator, 2, 2)).toHaveText('1/1/1970');
  await expect(cellLocator(canvasGridLocator, 2, 3)).toHaveText('Invalid Date');
  await expect(cellLocator(canvasGridLocator, 2, 4)).toHaveText('Invalid Date');
  await expect(cellLocator(canvasGridLocator, 2, 5)).toHaveText('1/1/1970');
  await expect(cellLocator(canvasGridLocator, 2, 6)).toHaveText('1/1/1970');
});
