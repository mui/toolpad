import { Page } from '@playwright/test';

export function waitForDataResponse(page: Page, baseURL: string) {
  const apiDataUrlRegex = new RegExp(`^${baseURL}api/data/.*$`);
  return page.waitForResponse(apiDataUrlRegex);
}
