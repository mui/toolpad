import { setTimeout } from 'timers/promises';
import { expect, FrameLocator, Locator, Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';

class CreatePageDialog {
  readonly page: Page;

  readonly dialog: Locator;

  readonly nameInput: Locator;

  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[role="dialog"]', {
      hasText: 'Create a new Page',
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
      hasText: 'Create a new Code Component',
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

  readonly componentCatalog: Locator;

  readonly pageEditor: Locator;

  readonly componentEditor: Locator;

  readonly themeEditor: Locator;

  readonly appCanvas: FrameLocator;

  readonly pageRoot: Locator;

  readonly pageOverlay: Locator;

  readonly explorer: Locator;

  readonly confirmationDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createPageBtn = page.locator('[aria-label="Create page"]');
    this.createPageDialog = new CreatePageDialog(page);

    this.componentCatalog = page.getByTestId('component-catalog');

    this.pageEditor = page.getByTestId('page-editor');
    this.componentEditor = page.getByTestId('component-editor');
    this.themeEditor = page.getByTestId('theme-editor');

    this.createComponentBtn = this.componentCatalog.getByRole('button', { name: 'Create' });
    this.createComponentDialog = new CreateComponentDialog(page);

    this.appCanvas = page.frameLocator('[name=data-toolpad-canvas]');
    this.pageRoot = this.appCanvas.getByTestId('page-root');
    this.pageOverlay = this.appCanvas.getByTestId('page-overlay');

    this.explorer = page.getByTestId('hierarchy-explorer');
    this.confirmationDialog = page.getByRole('dialog').filter({ hasText: 'Confirm' });
  }

  async goto() {
    await gotoIfNotCurrent(this.page, `/_toolpad/app`);
  }

  async createPage(name: string) {
    await this.createPageBtn.click();
    await this.createPageDialog.nameInput.fill(name);
    const { href: currentUrl } = new URL(this.page.url());
    await this.createPageDialog.createButton.click();
    await this.page.waitForURL((url) => url.href !== currentUrl);
  }

  async goToPage(name: string) {
    await this.explorer.getByText(name).click();
  }

  async goToPageById(id: string) {
    await gotoIfNotCurrent(this.page, `/_toolpad/app/pages/${id}`);
  }

  async createComponent(name: string) {
    await this.componentCatalog.hover();
    await this.createComponentBtn.click();
    await this.createComponentDialog.nameInput.fill(name);
    await this.createComponentDialog.createButton.click();
  }

  async waitForOverlay() {
    await this.pageOverlay.waitFor({ state: 'visible' });
    // Some tests seem to be flaky around this waitFor and perform better with a short timeout
    // Not sure yet where the race condition is happening
    await setTimeout(100);
  }

  async dragTo(sourceLocator: Locator, moveTargetX: number, moveTargetY: number) {
    const sourceBoundingBox = await sourceLocator.boundingBox();

    await this.page.mouse.move(
      sourceBoundingBox!.x + sourceBoundingBox!.width / 2,
      sourceBoundingBox!.y + sourceBoundingBox!.height / 2,
      { steps: 10 },
    );

    await this.page.mouse.down();

    await this.page.mouse.move(moveTargetX, moveTargetY, { steps: 10 });

    await this.page.mouse.up();
  }

  getComponentCatalogItem(name: string): Locator {
    return this.page.getByTestId('component-catalog').getByRole('button', { name });
  }

  async dragNewComponentToCanvas(
    componentName: string,
    moveTargetX?: number,
    moveTargetY?: number,
  ) {
    const style = await this.page.addStyleTag({ content: `* { transition: none !important; }` });

    await this.componentCatalog.hover();

    const pageRootBoundingBox = await this.pageRoot.boundingBox();
    if (!moveTargetX) {
      moveTargetX = pageRootBoundingBox!.x + pageRootBoundingBox!.width / 2;
    }
    if (!moveTargetY) {
      moveTargetY = pageRootBoundingBox!.y + pageRootBoundingBox!.height / 2;
    }

    const sourceLocator = this.getComponentCatalogItem(componentName);
    await expect(sourceLocator).toBeVisible();

    await this.dragTo(sourceLocator, moveTargetX, moveTargetY);

    await style.evaluate((elm) => elm.parentNode?.removeChild(elm));
  }

  getHierarchyItem(group: string, name: string): Locator {
    return this.explorer
      .getByRole('treeitem')
      .filter({ hasText: group })
      .getByRole('treeitem')
      .filter({ hasText: name });
  }

  async openHierarchyMenu(group: string, name: string) {
    const hierarchyItem = this.getHierarchyItem(group, name);
    const menuButton = hierarchyItem.getByRole('button', { name: 'Open hierarchy menu' });
    await hierarchyItem.hover();
    await menuButton.click();
  }
}
