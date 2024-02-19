import { setTimeout } from 'timers/promises';
import { expect, FrameLocator, Locator, Page } from '@playwright/test';
import { gotoIfNotCurrent } from './shared';

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

  readonly queriesExplorer: Locator;

  readonly confirmationDialog: Locator;

  readonly queryEditorPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createPageBtn = page.locator('[aria-label="Create new page"]');

    this.componentCatalog = page.getByTestId('component-catalog');

    this.pageEditor = page.getByTestId('page-editor');
    this.componentEditor = page.getByTestId('component-editor');
    this.themeEditor = page.getByTestId('theme-editor');

    this.createComponentBtn = this.componentCatalog.getByRole('button', { name: 'Create' });
    this.createComponentDialog = new CreateComponentDialog(page);

    this.appCanvas = page.frameLocator('[name=data-toolpad-canvas]');
    this.pageRoot = this.appCanvas.getByTestId('page-root');
    this.pageOverlay = this.appCanvas.getByTestId('page-overlay');

    this.explorer = page.getByTestId('pages-explorer');
    this.queriesExplorer = page.getByTestId('query-explorer');
    this.confirmationDialog = page.getByRole('dialog').filter({ hasText: 'Confirm' });
    this.queryEditorPanel = page.getByRole('tabpanel', { name: 'Query editor', exact: true });
  }

  async goto() {
    await gotoIfNotCurrent(this.page, `/_toolpad/app`);
  }

  async createPage(name: string) {
    await this.createPageBtn.click();
    await this.explorer.locator('input').fill(name);
    const { href: currentUrl } = new URL(this.page.url());
    await this.page.keyboard.press('Enter');
    await this.page.waitForURL((url) => url.href !== currentUrl);
  }

  async goToPage(name: string) {
    await gotoIfNotCurrent(this.page, `/_toolpad/app/pages/${name}`);
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

  async dragTo(sourceLocator: Locator, moveTargetX: number, moveTargetY: number, hasDrop = true) {
    const sourceBoundingBox = await sourceLocator.boundingBox();

    await this.page.mouse.move(
      sourceBoundingBox!.x + sourceBoundingBox!.width / 2,
      sourceBoundingBox!.y + sourceBoundingBox!.height / 2,
      { steps: 10 },
    );

    await this.page.mouse.down();

    await this.page.mouse.move(moveTargetX, moveTargetY, { steps: 10 });

    if (hasDrop) {
      await this.page.mouse.up();
    }
  }

  getComponentCatalogItem(name: string): Locator {
    return this.page.getByTestId('component-catalog').getByRole('button', { name });
  }

  async dragNewComponentToCanvas(
    componentName: string,
    moveTargetX?: number,
    moveTargetY?: number,
    hasDrop = true,
  ) {
    const style = await this.page.addStyleTag({ content: `* { transition: none !important; }` });

    await this.componentCatalog.hover();

    let pageRootBoundingBox;
    await expect(async () => {
      pageRootBoundingBox = await this.pageRoot.boundingBox();
      expect(pageRootBoundingBox).toBeTruthy();
    }).toPass();

    if (!moveTargetX) {
      moveTargetX = pageRootBoundingBox!.x + pageRootBoundingBox!.width / 2;
    }
    if (!moveTargetY) {
      moveTargetY = pageRootBoundingBox!.y + pageRootBoundingBox!.height / 2;
    }

    const sourceLocator = this.getComponentCatalogItem(componentName);
    await expect(sourceLocator).toBeVisible();

    await this.dragTo(sourceLocator, moveTargetX!, moveTargetY!, hasDrop);

    await style.evaluate((elm) => elm.parentNode?.removeChild(elm));
  }

  getExplorerItem(name: string): Locator {
    return this.explorer.getByRole('treeitem').filter({ hasText: name });
  }

  async openPageExplorerMenu(pageName: string) {
    const pageItem = this.getExplorerItem(pageName);
    const menuButton = pageItem.getByRole('button', { name: 'Open page explorer menu' });
    await pageItem.hover();
    await menuButton.click();
  }
}
