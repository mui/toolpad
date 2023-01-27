import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

async function waitForComponents(page: Page | FrameLocator) {
  await page.locator('text="foo button"').waitFor({ state: 'visible' });
  await page.locator('img[alt="foo image"]').waitFor({ state: 'attached' });
  await page.locator('text="foo datagrid column"').waitFor({ state: 'visible' });
  await page.locator('text="custom component 1"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo textfield")').waitFor({ state: 'visible' });
  await page.locator('text="foo typography"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo select")').waitFor({ state: 'visible' });
  const optionsSelect = page.getByRole('button', { name: /select with options/ });
  await expect(optionsSelect).toBeVisible();
  await optionsSelect.click();
  await expect(page.getByRole('option', { name: 'one' })).toBeVisible();
  await expect(page.getByRole('option', { name: '2' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'three' })).toBeVisible();
  await expect(page.getByRole('option', { name: '4' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'undefined' })).toBeVisible();
}

test('components runtime', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'components');

  await waitForComponents(page);
});

test('components editor', async ({ page, browserName, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const editorModel = new ToolpadEditor(page, browserName);
  editorModel.goto(app.id);

  await waitForComponents(editorModel.appCanvas);
});
