import * as path from 'path';
import { test } from '@playwright/test';
import { ToolpadHome } from '../../models/ToolpadHome';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { readJsonFile } from '../../utils/fs';

test('functions basics', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './functionDom.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

  await page.locator('text="hello, message: hello world"').waitFor({ state: 'visible' });
  await page.locator('text="throws, error.message: BOOM!"').waitFor({ state: 'visible' });
  await page.locator('text="throws, data undefined"').waitFor({ state: 'visible' });
  await page.locator('text="echo, parameter: bound foo parameter"').waitFor({ state: 'visible' });
  await page.locator('text="echo, secret: Some bar secret"').waitFor({ state: 'visible' });
});
