import { ToolpadHome } from '../models/ToolpadHome';
import { ToolpadRuntime } from '../models/ToolpadRuntime';
import { test } from '../playwright/test';

test('can use app templates', async ({ page }) => {
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  const app = await homeModel.createApplication({ appTemplateId: 'stats' });

  page.waitForNavigation();

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'stats');

  await page.locator('h3:has-text("Statistics")').waitFor({ state: 'visible' });
});
