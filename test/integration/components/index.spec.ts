import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadHome } from '../../models/ToolpadHome';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { FrameLocator, Page, test } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';

async function waitForComponents(page: Page | FrameLocator) {
  await page.locator('text="foo button"').waitFor({ state: 'visible' });
  await page.locator('img[alt="foo image"]').waitFor({ state: 'attached' });
  await page.locator('text="foo datagrid column"').waitFor({ state: 'visible' });
  await page.locator('text="custom component 1"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo textfield")').waitFor({ state: 'visible' });
  await page.locator('text="foo typography"').waitFor({ state: 'visible' });
  await page.locator('label:has-text("foo select")').waitFor({ state: 'visible' });
}

test('components', async ({ page, browserName }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './componentsDom.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ dom });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'components');

  await waitForComponents(page);

  const editorModel = new ToolpadEditor(page, browserName);
  editorModel.goto(app.id);

  await waitForComponents(editorModel.appCanvas);
});
