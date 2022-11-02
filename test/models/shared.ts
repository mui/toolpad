import { Page } from '../playwright/test';

export async function gotoIfNotCurrent(page: Page, expectedPath: string) {
  const { pathname } = new URL(page.url());

  if (pathname !== expectedPath) {
    await page.goto(expectedPath);
  }
}
