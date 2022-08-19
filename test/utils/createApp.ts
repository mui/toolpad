import { Page } from '@playwright/test';

export default async function createApp(page: Page, name: string, dom?: string) {
  await page.locator('button:has-text("create new")').click();

  await page.fill('[role="dialog"] label:has-text("name")', name);

  if (dom) {
    await page.fill('[role="dialog"] label:has-text("dom")', dom);
  }

  await page.click('[role="dialog"] button:has-text("create")');

  await page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/editor\/pages\/[^/]+/ });
}
