import { Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';

export class ToolpadRuntime {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await gotoIfNotCurrent(this.page, `/preview`);
  }

  async gotoPage(pageName: string) {
    await gotoIfNotCurrent(this.page, `/preview/pages/${pageName}`);
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(`/preview/pages/${pageId}`);
  }

  async waitForNavigation() {
    await this.page.waitForURL(/\/preview\/pages\/[^/]+$/);
  }
}
