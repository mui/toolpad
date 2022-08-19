import { test, expect } from '@playwright/test';
import createApp from '../utils/createApp';
import generateId from '../utils/generateId';
import * as locators from '../utils/locators';

test('app create/rename flow', async ({ page }) => {
  const appName1 = `App ${generateId()}`;
  const appName2 = `App ${generateId()}`;
  const appName3 = `App ${generateId()}`;

  await page.goto('/');
  await createApp(page, appName1);

  await page.goto('/');
  await createApp(page, appName2);

  await page.goto('/');

  await page.click(`${locators.toolpadHomeAppRow(appName1)} >> [aria-label="Application menu"]`);

  await page.click('[role="menuitem"]:has-text("Rename"):visible');

  await page.keyboard.type(appName2);
  await page.keyboard.press('Enter');

  await expect(page.locator(`text=An app named "${appName2}" already exists`)).toBeVisible();

  await page.keyboard.type(appName3);

  await expect(page.locator(locators.toolpadHomeAppRow(appName3))).toBeVisible();
});
