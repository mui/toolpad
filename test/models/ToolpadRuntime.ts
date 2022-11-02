import { Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';

export class ToolpadRuntime {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(appId: string) {
    await gotoIfNotCurrent(this.page, `/app/${appId}/preview/pages`);
  }

  async gotoPage(appId: string, pageName: string) {
    await this.goto(appId);
    await this.page.locator(`a:has-text("${pageName}")`).click();
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(`/app/${appId}/preview/pages/${pageId}`);
  }
}
