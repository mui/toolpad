import * as path from 'path';
import * as fs from 'fs/promises';
import { test, expect } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { APP_ID_LOCAL_MARKER } from '../../../packages/toolpad-app/src/constants';

test.skip(!process.env.LOCAL_MODE_TESTS, 'These are local mode tests');

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

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('functions basics', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(APP_ID_LOCAL_MARKER, 'page1');

  await page.locator('text="hello, message: hello world"').waitFor({ state: 'visible' });
  await page.locator('text="throws, error.message: BOOM!"').waitFor({ state: 'visible' });
  await page.locator('text="throws, data undefined"').waitFor({ state: 'visible' });
  await page.locator('text="echo, parameter: bound foo parameter"').waitFor({ state: 'visible' });
  await page.locator('text="echo, secret: Some bar secret"').waitFor({ state: 'visible' });
});

test('function editor reload', async ({ page, localApp }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto(APP_ID_LOCAL_MARKER);

  await expect(editorModel.appCanvas.getByText('edited hello')).toBeVisible();

  const queriesFilePath = path.resolve(localApp.dir, './toolpad/queries.ts');
  const queriesFileContent = await fs.readFile(queriesFilePath, { encoding: 'utf-8' });
  const updatedFileContent = queriesFileContent.replace("'edited hello'", "'edited goodbye!!!'");
  await fs.writeFile(queriesFilePath, updatedFileContent);

  // TODO: make this unnecessary:
  await page.reload();

  await expect(editorModel.appCanvas.getByText('edited goodbye!!!')).toBeVisible();
});
