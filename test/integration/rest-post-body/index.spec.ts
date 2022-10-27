import * as path from 'path';
import { test } from '@playwright/test';
import { ToolpadHome } from '../../models/ToolpadHome';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { readJsonFile } from '../../utils/fs';

test('post request with bound body', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './restPostBodyDom.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page1');

  await page.locator('button:has-text("query with string")').click();
  await page.locator('text="string"').waitFor({ state: 'visible' });
  await page.locator('button:has-text("query with object")').click();
  await page.locator('text="object"').waitFor({ state: 'visible' });
});
