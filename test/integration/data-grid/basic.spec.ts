import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect, Locator } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-basic'),
    cmd: 'dev',
  },
});

test('Column prop updates are not lost on drag interactions', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goToPageById('331kqzd');

  await editorModel.waitForOverlay();

  const canvasGridLocator = editorModel.appCanvas.getByRole('grid');

  // Change the "Avatar" column type from "link" to "boolean"

  const firstGridLocator = canvasGridLocator.first();

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

function cellLocator(gridLocator: Locator, rowIndex: number, collIndex: number) {
  return gridLocator
    .locator(`[aria-rowindex="${rowIndex}"]`)
    .locator(`[aria-colindex="${collIndex}"]`);
}

test('Date columns', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goToPageById('h0FFFmL');

  await editorModel.waitForOverlay();

  const canvasGridLocator = editorModel.appCanvas.getByRole('grid');

  await expect(cellLocator(canvasGridLocator, 2, 1)).toHaveText('4/1/2023');
  await expect(cellLocator(canvasGridLocator, 2, 2)).toHaveText('1/1/1970');
  await expect(cellLocator(canvasGridLocator, 2, 3)).toHaveText('Invalid Date');
  await expect(cellLocator(canvasGridLocator, 2, 4)).toHaveText('Invalid Date');
  await expect(cellLocator(canvasGridLocator, 2, 5)).toHaveText('1/1/1970');
});
