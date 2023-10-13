import { Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';

export interface ToolpadRuntimeOptions {
  prod: boolean;
  base: string;
}

export class ToolpadRuntime {
  readonly page: Page;

  readonly options: ToolpadRuntimeOptions;

  constructor(page: Page, options: Partial<ToolpadRuntimeOptions> = {}) {
    this.page = page;
    this.options = {
      prod: false,
      base: '/prod',
      ...options,
    };
  }

  async goto() {
    await gotoIfNotCurrent(this.page, this.options.base);
  }

  async gotoPage(pageName: string) {
    await gotoIfNotCurrent(this.page, `${this.options.base}/pages/${pageName}`);
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(`${this.options.base}/pages/${pageId}`);
  }

  async waitForPageReady() {
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector('[data-testid="page-ready-marker"]', {
      state: 'attached',
    });
  }
}
