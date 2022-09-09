import { Page } from '@playwright/test';

export class ToolpadRuntime {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(appId: string) {
    await this.page.goto(`/app/${appId}/preview/pages`);
  }

  async gotoPage(appId: string, pageName: string) {
    await this.goto(appId);
    await this.page.locator(`button:has-text("${pageName}")`).click();
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(`/app/${appId}/preview/pages/${pageId}`);
  }
}
