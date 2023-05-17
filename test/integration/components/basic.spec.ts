import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test, expect } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';

async function runComponentsTests(page: Page, frame: Page | FrameLocator = page) {
  const button = frame.getByText('foo button');
  await expect(button).toBeVisible();

  const image = frame.locator('img[alt="foo image"]');
  await expect(image).toBeAttached();

  const datagrid = frame.getByText('foo datagrid column');
  await expect(datagrid).toBeVisible();

  const customComponent = frame.getByText('custom component 1');
  await expect(customComponent).toBeVisible();

  const textField = frame.locator('label:has-text("foo textfield")');
  await expect(textField).toBeVisible();

  const text = frame.getByText('foo typography');
  await expect(text).toBeVisible();

  const select = frame.locator('label:has-text("foo select")');
  await expect(select).toBeVisible();

  const list = frame.getByText('List Button 3');
  await expect(list).toBeVisible();

  const markdown = frame.getByText('markdown text');
  await expect(markdown).toBeVisible();
}

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-basic'),
    cmd: 'dev',
  },
});

test('rendering components in the app runtime', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('components');

  await runComponentsTests(page);
});

test('rendering components in the app editor', async ({ page }) => {
  const editorModel = new ToolpadEditor(page);
  editorModel.goto();

  await runComponentsTests(page, editorModel.appCanvas);
});

test('select component behavior', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('select');

  const optionsSelect = page.getByRole('button', { name: /select with options/ });
  await optionsSelect.scrollIntoViewIfNeeded();
  await clickCenter(page, optionsSelect);
  await expect(page.getByRole('option', { name: 'one' })).toBeVisible();
  await expect(page.getByRole('option', { name: '2' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'three' })).toBeVisible();
  await expect(page.getByRole('option', { name: '4' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'undefined' })).toBeVisible();
});
