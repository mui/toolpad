import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test, expect } from '../../playwright/test';
import clickCenter from '../../utils/clickCenter';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

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

  const list = await page.locator('text="List Button 3"');
  await list.waitFor({ state: 'visible' });
}

test('rendering components in the app runtime', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'components');

  await waitForComponents(page);
});

test('rendering components in the app editor', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page);
  editorModel.goto(app.id);

  await waitForComponents(page, editorModel.appCanvas);
});

test('select component behavior', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'select');

  const optionsSelect = page.getByRole('button', { name: /select with options/ });
  await optionsSelect.scrollIntoViewIfNeeded();
  await clickCenter(page, optionsSelect);
  await expect(page.getByRole('option', { name: 'one' })).toBeVisible();
  await expect(page.getByRole('option', { name: '2' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'three' })).toBeVisible();
  await expect(page.getByRole('option', { name: '4' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'undefined' })).toBeVisible();
});
