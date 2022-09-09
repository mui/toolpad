import * as path from 'path';
import { ToolpadHome } from '../../models/ToolpadHome';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';

test('components', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'components');

  await page.locator('text="foo button"').waitFor({ state: 'visible' });
  await page.locator('img[alt="foo image"]').waitFor({ state: 'attached' });
  await page.locator('text="foo datagrid column"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo textfield")').waitFor({ state: 'visible' });
  await page.locator('text="foo typography"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo select")').waitFor({ state: 'visible' });
});
