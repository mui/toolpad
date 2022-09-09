import { Locator, Page } from '@playwright/test';
import generateId from '../utils/generateId';

interface CreateApplicationParams {
  name?: string;
  dom?: any;
}

interface CreateApplicationResult {
  id: string;
  name: string;
}

export class ToolpadHome {
  readonly page: Page;

  readonly createNewbtn: Locator;

  readonly newAppDialog: Locator;

  readonly newAppNameInput: Locator;

  readonly newAppDomInput: Locator;

  readonly newAppDomCreateBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createNewbtn = page.locator('button:has-text("create new")');
    this.newAppDialog = page.locator('[role="dialog"]', {
      hasText: 'Create a new MUI Toolpad App',
    });
    this.newAppNameInput = this.newAppDialog.locator('label:has-text("name")');
    this.newAppDomInput = this.newAppDialog.locator('label:has-text("dom")');
    this.newAppDomCreateBtn = this.newAppDialog.locator('button:has-text("create")');
  }

  async goto() {
    await this.page.goto(`/`);
  }

  async createApplication({
    name = `App ${generateId()}`,
    dom,
  }: CreateApplicationParams): Promise<CreateApplicationResult> {
    await this.createNewbtn.click();

    await this.newAppNameInput.fill(name);

    if (dom) {
      await this.newAppDomInput.fill(JSON.stringify(dom));
    }

    await this.newAppDomCreateBtn.click();

    await this.page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/pages\/[^/]+/ });

    const { pathname } = new URL(this.page.url());
    const idMatch = /^\/_toolpad\/app\/([^/]+)\//.exec(pathname);
    if (!idMatch) {
      throw new Error(`Application id not found in url "${this.page.url()}"`);
    }

    return { id: idMatch[1], name };
  }
}
