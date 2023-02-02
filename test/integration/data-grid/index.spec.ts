import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test('Code component cell', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './codeComponentCell.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
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
