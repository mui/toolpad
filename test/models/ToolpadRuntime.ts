import { Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';

export class ToolpadRuntime {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await gotoIfNotCurrent(this.page, `/preview/pages`);
  }

  async gotoPage(pageName: string) {
    await this.goto();
    await this.page.getByRole('button', { name: pageName }).click();
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(`/preview/pages/${pageId}`);
  }
}
