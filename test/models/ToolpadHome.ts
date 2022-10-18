import { Locator, Page } from '@playwright/test';
import generateId from '../utils/generateId';

interface CreateApplicationParams {
  name?: string;
  appTemplateId?: string;
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

  readonly newAppTemplateSelect: Locator;

  readonly newAppDomInput: Locator;

  readonly newAppDomCreateBtn: Locator;

  readonly getAppRow: (appName: string) => Locator;

  constructor(page: Page) {
    this.page = page;

    this.createNewbtn = page.locator('button:has-text("create new")');

    this.newAppDialog = page.locator('[role="dialog"]', {
      hasText: 'Create a new MUI Toolpad App',
    });
    this.newAppNameInput = this.newAppDialog.locator('label:has-text("name")');
    this.newAppTemplateSelect = this.newAppDialog.locator(
      '[aria-haspopup="listbox"]:has-text("blank")',
    );
    this.newAppDomInput = this.newAppDialog.locator('label:has-text("dom")');
    this.newAppDomCreateBtn = this.newAppDialog.locator('button:has-text("create")');

    this.getAppRow = (appName: string): Locator =>
      page.locator(`[role="row"]`, { has: page.locator(`input[value="${appName}"]`) });
  }

  async goto() {
    await this.page.goto(`/`);
  }

  async createApplication({
    name = `App ${generateId()}`,
    appTemplateId,
    dom,
  }: CreateApplicationParams): Promise<CreateApplicationResult> {
    await this.createNewbtn.click();

    await this.newAppNameInput.fill(name);

    if (appTemplateId) {
      await this.newAppTemplateSelect.click();
      await this.page.locator(`[data-value="${appTemplateId}"]`).click();
    }

    if (dom) {
      const isDomInputEnabled = await this.newAppDomInput.isVisible();
      if (!isDomInputEnabled) {
        throw new Error(
          `Toolpad not in integration test mode. Make sure to start Toolpad with environment variable TOOLPAD_ENABLE_CREATE_BY_DOM=1.`,
        );
      }

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

  async duplicateApplication(appName: string) {
    await this.getAppRow(appName).locator('[aria-label="Application menu"]').click();

    await this.page.click('[role="menuitem"]:has-text("Duplicate"):visible');

    // Navigate to the new app
    await this.getAppRow(appName).locator('a:has-text("Edit")').click();
    await this.page.waitForNavigation({ url: /\/_toolpad\/app\/[^/]+\/pages\/[^/]+/ });

    const { pathname } = new URL(this.page.url());
    const idMatch = /^\/_toolpad\/app\/([^/]+)\//.exec(pathname);
    if (!idMatch) {
      throw new Error(`Application id not found in url "${this.page.url()}"`);
    }

    return { id: idMatch[1] };
  }
}
