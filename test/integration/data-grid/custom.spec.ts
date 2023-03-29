import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-custom'),
    cmd: 'dev',
  },
});

test('Code component cell', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goto();

  await editorModel.waitForOverlay();

  await expect(editorModel.pageRoot.getByText('value: {"test":"value"}')).toBeVisible();
  await expect(
    editorModel.pageRoot.getByText(
      'row: {"hiddenField":true,"customField":{"test":"value"},"id":0}',
    ),
  ).toBeVisible();
  await expect(editorModel.pageRoot.getByText('field: "customField"')).toBeVisible();
});
