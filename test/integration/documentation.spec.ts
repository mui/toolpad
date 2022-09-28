import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadEditor } from '../models/ToolpadEditor';
import { test, expect } from '../playwright/test';

test.use({
  deviceScaleFactor: 2,
});

test.only('documentation happy path', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'Not needed');

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();

  await page.waitForSelector('[aria-label="apps list"]', { timeout: 25000 });

  await page.screenshot({
    path: 'playwright-screenshots/apps-list.png',
    fullPage: true,
  });

  const app = await homeModel.createApplication({ name: 'New application' });

  const editorModel = new ToolpadEditor(page, browserName);

  await editorModel.pageRoot.waitFor();

  await expect(editorModel.appCanvas.locator('[data-test-id="drop-area"]')).toBeVisible();

  await page.screenshot({
    path: 'playwright-screenshots/app.png',
    fullPage: true,
  });

  await page.locator('text=Add query').click();

  const dialog = page.locator('[role="dialog"]');

  await dialog.screenshot({
    path: 'playwright-screenshots/add-query.png',
    animations: 'disabled',
  });
});
