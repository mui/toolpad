import invariant from 'invariant';
import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import { createApplication } from '../../utils/toolpadApi';

async function waitForComponents(page: Page | FrameLocator) {
  await page.locator('text="foo button"').waitFor({ state: 'visible' });
  await page.locator('img[alt="foo image"]').waitFor({ state: 'attached' });
  await page.locator('text="foo datagrid column"').waitFor({ state: 'visible' });
  await page.locator('text="custom component 1"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo textfield")').waitFor({ state: 'visible' });
  await page.locator('text="foo typography"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo select")').waitFor({ state: 'visible' });
}

test('components', async ({ page, browserName, baseURL }) => {
  invariant(baseURL, 'playwright must be run with a a baseURL');

  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const app = await createApplication(baseURL, { dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'components');

  await waitForComponents(page);

  const editorModel = new ToolpadEditor(page, browserName);
  editorModel.goto(app.id);

  await waitForComponents(editorModel.appCanvas);
});
