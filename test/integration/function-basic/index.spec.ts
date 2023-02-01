import * as path from 'path';
import { test, expect } from '../../playwright/test';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';
import { ToolpadEditor } from '../../models/ToolpadEditor';

test.use({
  ignoreConsoleErrors: [
    // Chrome:
    /Cannot read properties of null/,
    // firefox:
    /throws\.error is null/,
    // Intentionally thrown
    /BOOM!/,
  ],
});

test('functions basics', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './functionDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

  await page.locator('text="hello, message: hello world"').waitFor({ state: 'visible' });
  await page.locator('text="throws, error.message: BOOM!"').waitFor({ state: 'visible' });
  await page.locator('text="throws, data undefined"').waitFor({ state: 'visible' });
  await page.locator('text="echo, parameter: bound foo parameter"').waitFor({ state: 'visible' });
  await page.locator('text="echo, secret: Some bar secret"').waitFor({ state: 'visible' });
});

test('function editor save shortcut', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './functionDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(app.id);

  await expect(editorModel.appCanvas.getByText('edited hello')).toBeVisible();

  await editorModel.componentEditor.getByRole('button', { name: 'edited' }).click();
  const queryEditor = page.getByRole('dialog', { name: 'edited' });
  const savebutton = queryEditor.getByRole('button', { name: 'save' });
  await expect(savebutton).toBeDisabled();

  await page.getByTestId('function editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('export default () => "edited goodbye!!!"');
  await expect(savebutton).not.toBeDisabled();
  await page.keyboard.press('Control+S');
  await expect(savebutton).toBeDisabled();

  await queryEditor.getByRole('button', { name: 'cancel' }).click();

  await expect(editorModel.appCanvas.getByText('edited goodbye!!!')).toBeVisible();
});
