import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test('components', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await editorModel.hierarchyItem('components', 'myCOmponent').click();

  await page.getByTestId('codecomponent editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('export default () => "hello everybody!!!"');

  const output = page
    .frameLocator('[title="Code component sandbox"]')
    .getByText('hello everybody!!!');

  await expect(output).toBeVisible();
});
