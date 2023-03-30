import { Page } from '../playwright/test';

export async function gotoIfNotCurrent(
  page: Page,
  expectedPath: string,
  opts?: Parameters<Page['goto']>[1],
) {
  const { pathname } = new URL(page.url());

  if (pathname !== expectedPath) {
    await page.goto(expectedPath, opts);
  }

  await page.waitForURL((url) => url.pathname === expectedPath);
}
