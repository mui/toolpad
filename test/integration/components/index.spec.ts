import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test, expect } from '../../playwright/test';
import clickCenter from '../../utils/clickCenter';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

async function waitForComponents(page: Page, frame: Page | FrameLocator = page, isEditor = false) {
  await frame.locator('text="foo button"').waitFor({ state: 'visible' });
  await frame.locator('img[alt="foo image"]').waitFor({ state: 'attached' });
  await frame.locator('text="foo datagrid column"').waitFor({ state: 'visible' });
  await frame.locator('text="custom component 1"').waitFor({ state: 'visible' });
  await frame.locator('label:has-text("foo textfield")').waitFor({ state: 'visible' });
  await frame.locator('text="foo typography"').waitFor({ state: 'visible' });
  await frame.locator('label:has-text("foo select")').waitFor({ state: 'visible' });

  const optionsSelect = frame.getByRole('button', { name: /select with options/ });
  await optionsSelect.scrollIntoViewIfNeeded();
  if (isEditor) {
    await clickCenter(page, optionsSelect);
  }
  await clickCenter(page, optionsSelect);
  await expect(frame.getByRole('option', { name: 'one' })).toBeVisible();
  await expect(frame.getByRole('option', { name: '2' })).toBeVisible();
  await expect(frame.getByRole('option', { name: 'three' })).toBeVisible();
  await expect(frame.getByRole('option', { name: '4' })).toBeVisible();
  await expect(frame.getByRole('option', { name: 'undefined' })).toBeVisible();
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

  await waitForComponents(page, editorModel.appCanvas, true);
});
