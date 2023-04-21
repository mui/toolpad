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
    await this.goto();

    const navLocator = this.page.locator('nav');
    await navLocator.getByRole('button', { name: pageName }).click();
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(`/preview/pages/${pageId}`);
  }

  async waitForNavigation() {
    await this.page.waitForURL(/\/preview\/pages\/[^/]+$/);
  }
}
