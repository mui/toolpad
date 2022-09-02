import { test, expect } from '@playwright/test';
import { ToolpadHome } from '../models/ToolpadHome';
import generateId from '../utils/generateId';

test('app create/rename flow', async ({ page }) => {
  const homeModel = new ToolpadHome(page);

  const appName1 = `App ${generateId()}`;
  const appName2 = `App ${generateId()}`;
  const appName3 = `App ${generateId()}`;

  await homeModel.goto();
  await homeModel.createApplication({ name: appName1 });

  await homeModel.goto();
  await homeModel.createApplication({ name: appName2 });

  await homeModel.goto();

  await homeModel.getAppRow(appName1).locator('[aria-label="Application menu"]').click();

  await page.click('[role="menuitem"]:has-text("Rename"):visible');

  await page.keyboard.type(appName2);
  await page.keyboard.press('Enter');

  await expect(page.locator(`text=An app named "${appName2}" already exists`)).toBeVisible();

  await page.keyboard.type(appName3);

  await expect(homeModel.getAppRow(appName3)).toBeVisible();
});
