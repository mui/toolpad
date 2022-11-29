import * as path from 'path';
import invariant from 'invariant';
import { test } from '../../playwright/test';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { readJsonFile } from '../../utils/fs';
import { createApplication } from '../../utils/toolpadApi';

test.use({ ignoreConsoleErrors: [/Cannot read properties of null/] });

test('functions basics', async ({ page, baseURL }) => {
  invariant(baseURL, 'playwright must be run with a a baseURL');

  const dom = await readJsonFile(path.resolve(__dirname, './functionDom.json'));
  const app = await createApplication(baseURL, { dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

  await page.locator('text="hello, message: hello world"').waitFor({ state: 'visible' });
  await page.locator('text="throws, error.message: BOOM!"').waitFor({ state: 'visible' });
  await page.locator('text="throws, data undefined"').waitFor({ state: 'visible' });
  await page.locator('text="echo, parameter: bound foo parameter"').waitFor({ state: 'visible' });
  await page.locator('text="echo, secret: Some bar secret"').waitFor({ state: 'visible' });
});
