import { Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';
import { APP_ID_LOCAL_MARKER } from '../../packages/toolpad-app/src/constants';

export class ToolpadRuntime {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(appId: string) {
    await gotoIfNotCurrent(
      this.page,
      `${appId === APP_ID_LOCAL_MARKER ? '' : `/app/${appId}`}/preview/pages`,
    );
  }

  async gotoPage(appId: string, pageName: string) {
    await this.goto(appId);
    await this.page.getByRole('link', { name: pageName }).click();
  }

  async gotoPageById(appId: string, pageId: string) {
    await this.page.goto(
      `${appId === APP_ID_LOCAL_MARKER ? '' : `/app/${appId}`}/preview/pages/${pageId}`,
    );
  }
}
