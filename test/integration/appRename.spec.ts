import { test, expect, Request, Page } from '@playwright/test';
import generateId from '../utils/generateId';

async function createApp(page: Page, name: string) {
  await page.locator('button:has-text("create new")').click();

  await page.fill('[role="dialog"] label:has-text("name")', name);

  await page.click('[role="dialog"] button:has-text("create")');

  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/editor\/pages\/[^/]+/ });
}

test('app create/rename flow', async ({ page }) => {
  const appName1 = `App ${generateId()}`;
  const appName2 = `App ${generateId()}`;
  const appName3 = `App ${generateId()}`;

  await page.goto('/');
  await createApp(page, appName1);

  await page.goto('/');
  await createApp(page, appName2);

  await page.goto('/');

  const app1RowSelector = `[role="row"] >> has="input[value='${appName1}']"`;
  await page.click(`${app1RowSelector} >> [aria-label="App menu"]`);

  await page.click('[role="menuitem"]:has-text("Rename"):visible');

  await page.keyboard.type(appName2);
  await page.keyboard.press('Enter');

  await page.locator(`text=An app name "${appName2}" already exists`);

  await page.keyboard.type(appName3);

  const app3RowSelector = `[role="row"] >> has="input[value='${appName3}']"`;
  await page.locator(app3RowSelector);
});
