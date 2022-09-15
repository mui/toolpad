import { Locator, Page } from '@playwright/test';

class CreatePageDialog {
  readonly page: Page;

  readonly dialog: Locator;

  readonly nameInput: Locator;

  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[role="dialog"]', {
      hasText: 'Create a new MUI Toolpad Page',
    });
    this.nameInput = this.dialog.locator('label:has-text("name")');
    this.createButton = this.dialog.locator('button:has-text("Create")');
  }
}

class CreateComponentDialog {
  readonly page: Page;

  readonly dialog: Locator;

  readonly nameInput: Locator;

  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[role="dialog"]', {
      hasText: 'Create a new MUI Toolpad Code Component',
    });
    this.nameInput = this.dialog.locator('label:has-text("name")');
    this.createButton = this.dialog.locator('button:has-text("Create")');
  }
}

export class ToolpadEditor {
  readonly page: Page;

  readonly createPageBtn: Locator;

  readonly createPageDialog: CreatePageDialog;

  readonly createComponentBtn: Locator;

  readonly createComponentDialog: CreateComponentDialog;

  constructor(page: Page) {
    this.page = page;

    this.createPageBtn = page.locator('[aria-label="Create page"]');
    this.createPageDialog = new CreatePageDialog(page);

    this.createComponentBtn = page.locator('[aria-label="Create component"]');
    this.createComponentDialog = new CreateComponentDialog(page);
  }

  async goto(appId: string) {
    await this.page.goto(`/_toolpad/app/${appId}`);
  }

  async createPage(name: string) {
    await this.createPageBtn.click();
    await this.createPageDialog.nameInput.fill(name);
    await this.createPageDialog.createButton.click();
  }

  async createComponent(name: string) {
    await this.createComponentBtn.click();
    await this.createComponentDialog.nameInput.fill(name);
    await this.createComponentDialog.createButton.click();
  }
}
