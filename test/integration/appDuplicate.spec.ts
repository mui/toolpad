import { test, expect, Page } from '../playwright/test';
import generateId from '../utils/generateId';
import * as locators from '../utils/locators';

async function createApp(page: Page, name: string) {
  await page.locator('button:has-text("create new")').click();

  await page.fill('[role="dialog"] label:has-text("name")', name);

  await page.click('[role="dialog"] button:has-text("create")');

  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/editor\/pages\/[^/]+/ });
}

test('duplicate app from home flow', async ({ page }) => {
  const appName1 = `App ${generateId()}`;

  await page.goto('/');
  await createApp(page, appName1);

  await page.goto('/');

  await page.click(`${locators.toolpadHomeAppRow(appName1)} >> [aria-label="Application menu"]`);

  await page.click('[role="menuitem"]:has-text("Duplicate"):visible');

  await expect(page.locator(locators.toolpadHomeAppRow(`${appName1} (copy)`))).toBeVisible();

  await page.click(`${locators.toolpadHomeAppRow(appName1)} >> [aria-label="Application menu"]`);

  await page.click('[role="menuitem"]:has-text("Duplicate"):visible');

  await expect(page.locator(locators.toolpadHomeAppRow(`${appName1} (copy 2)`))).toBeVisible();
});
