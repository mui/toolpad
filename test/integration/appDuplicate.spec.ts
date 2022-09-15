import * as path from 'path';
import { test, expect } from '../playwright/test';
import { ToolpadHome } from '../models/ToolpadHome';
import { readJsonFile } from '../utils/fs';
import * as locators from '../utils/locators';

test('duplicate app from home flow', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './duplicateNavigationDom.json'));
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });
  await homeModel.goto();
  const duplicateApp = await homeModel.duplicateApplication(app.name);
  await homeModel.goto();
  await expect(page.locator(locators.toolpadHomeAppRow(`${app.name} (copy)`))).toBeVisible();
  await homeModel.duplicateApplication(app.name);
  await homeModel.goto();
  await expect(page.locator(locators.toolpadHomeAppRow(`${app.name} (copy 2)`))).toBeVisible();

  await page.goto(`/_toolpad/app/${duplicateApp.id}/preview/pages`);
  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/preview\/pages/ });
  await page.locator('button:has-text("Page")').click();
  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/preview\/pages\/[^/]+/ });
  await page.locator('button:has-text("Go to Page 2")').click();
  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/preview\/pages\/[^/]+/ });
  await expect(page.locator('button', { hasText: 'Go to Page 1' })).toBeVisible();
});
