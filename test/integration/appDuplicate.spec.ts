import * as path from 'path';
import { test, expect } from '../playwright/test';
import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadRuntime } from '../models/ToolpadRuntime';
import { readJsonFile } from '../utils/fs';

test('duplicate app from home flow', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './duplicateNavigationDom.json'));

  const homeModel = new ToolpadHome(page);

  await homeModel.goto();

  const app = await homeModel.createApplication({ dom });

  await homeModel.goto();

  const duplicateApp = await homeModel.duplicateApplication(app.name);

  await homeModel.goto();

  await expect(homeModel.getAppRow(`${app.name} (copy)`)).toBeVisible();

  await homeModel.duplicateApplication(app.name);

  await homeModel.goto();

  await expect(homeModel.getAppRow(`${app.name} (copy 2)`)).toBeVisible();

  const runtimeModel = new ToolpadRuntime(page);

  await runtimeModel.gotoPage(duplicateApp.id, 'Page 1');

  await page.locator('button:has-text("Page 2")').click();

  await expect(page.locator('button', { hasText: 'Page 1' })).toBeVisible();
});
