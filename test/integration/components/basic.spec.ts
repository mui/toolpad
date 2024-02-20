import * as path from 'path';
import * as url from 'url';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test, expect } from '../../playwright/localTest';
import { clickCenter } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

async function waitForComponents(page: Page, frame: Page | FrameLocator = page) {
  const button = frame.locator('text="foo button"');
  await button.waitFor({ state: 'visible' });

  const image = frame.locator('img[alt="foo image"]');
  await image.waitFor({ state: 'attached' });

  const datagrid = frame.locator('text="foo datagrid column"');
  await datagrid.waitFor({ state: 'visible' });

  const customComponent = frame.locator('text="custom component 1"');
  await customComponent.waitFor({ state: 'visible' });

  const textField = frame.locator('label:has-text("foo textfield")');
  await textField.waitFor({ state: 'visible' });

  const text = frame.locator('text="foo typography"');
  await text.waitFor({ state: 'visible' });

  const select = frame.locator('label:has-text("foo select")');
  await select.waitFor({ state: 'visible' });

  const list = frame.locator('text="List Button 3"');
  await list.waitFor({ state: 'visible' });

  const markdown = frame.getByText('markdown text');
  await markdown.waitFor({ state: 'visible' });

  const h2 = frame.getByText("Hello I'm a h2");
  await expect(h2).toBeVisible();
  await expect(h2).toHaveClass(/\bMuiTypography-h2\b/);
}

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-basic'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('rendering components in the app runtime', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('components');

  await waitForComponents(page);
});

test('rendering components in the app editor', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goto();

  await waitForComponents(page, editorModel.appCanvas);
});

test('select component behavior', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('select');

  const optionsSelect = page.getByRole('combobox', { name: /select with options/ });
  await optionsSelect.scrollIntoViewIfNeeded();
  await clickCenter(page, optionsSelect);
  await expect(page.getByRole('option', { name: 'one' })).toBeVisible();
  await expect(page.getByRole('option', { name: '2' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'three' })).toBeVisible();
  await expect(page.getByRole('option', { name: '4' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'undefined' })).toBeVisible();
});
