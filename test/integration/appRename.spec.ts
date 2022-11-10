import { ToolpadHome } from '../models/ToolpadHome';
import { test, expect } from '../playwright/test';
import generateId from '../utils/generateId';

test('app create/rename flow', async ({ page }) => {
  const appName1 = `App ${generateId()}`;
  const appName2 = `App ${generateId()}`;
  const appName3 = `App ${generateId()}`;

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  await homeModel.createApplication({ name: appName1 });
  await homeModel.goto();
  await homeModel.createApplication({ name: appName2 });
  await homeModel.goto();

  await homeModel.getAppRow(appName1).locator('[aria-label="Application menu"]').click();

  await page.click('[role="menuitem"]:has-text("Rename"):visible');

  await page.keyboard.type(appName2);

  await expect(page.locator(`text=An app with that name already exists`)).toBeVisible();
  await page.keyboard.press('Escape');

  await homeModel.getAppRow(appName1).locator('[aria-label="Application menu"]').click();
  await page.click('[role="menuitem"]:has-text("Rename"):visible');

  await page.keyboard.type(appName3);
  await page.keyboard.press('Enter');

  await expect(homeModel.getAppRow(appName3)).toBeVisible();
});
