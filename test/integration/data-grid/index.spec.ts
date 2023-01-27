import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import clickCenter from '../../utils/clickCenter';
import generateId from '../../utils/generateId';

test('Code component cell', async ({ page, browserName, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './codeComponentCell.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page, browserName);
  editorModel.goto(app.id);

  await editorModel.waitForOverlay();

  await expect(editorModel.pageRoot.getByText('value: {"test":"value"}')).toBeVisible();
  await expect(
    editorModel.pageRoot.getByText(
      'row: {"hiddenField":true,"customField":{"test":"value"},"id":0}',
    ),
  ).toBeVisible();
  await expect(editorModel.pageRoot.getByText('field: "customField"')).toBeVisible();
});

test('Column prop updates are not lost on drag interactions', async ({
  page,
  browserName,
  api,
}) => {
  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'template', id: 'default' },
  });

  const editorModel = new ToolpadEditor(page, browserName);
  editorModel.goto(app.id);

  await editorModel.pageRoot.waitFor({ state: 'visible' });

  const canvasGridLocator = editorModel.appCanvas.getByRole('grid');

  // Change the "Avatar" column type from "image" to "string"

  const firstGridLocator = canvasGridLocator.first();
  await clickCenter(page, firstGridLocator);

  await editorModel.componentEditor.locator('button:has-text("columns")').click();

  await editorModel.page.getByRole('button', { name: 'Avatar' }).click();

  await editorModel.page.getByRole('button', { name: 'image' }).click();

  await editorModel.page.getByRole('option', { name: 'string' }).click();

  await clickCenter(page, firstGridLocator);

  // Drag the "Avatar" column to the end of the grid

  const avatarColumn = editorModel.pageRoot.getByText('Avatar', { exact: true });
  const profileColumn = editorModel.pageRoot.getByText('Profile', { exact: true });

  await avatarColumn.dragTo(profileColumn);

  // Expect the "Avatar" column to continue to be of type "string" instead of "image"

  await expect(
    editorModel.pageRoot.getByRole('cell', {
      name: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/793.jpg',
    }),
  ).toBeVisible();
});
