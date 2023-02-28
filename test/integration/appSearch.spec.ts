import { ToolpadHome } from '../models/ToolpadHome';
import { test, expect } from '../playwright/test';
import generateId from '../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test('app search flow', async ({ page }) => {
  const appName1 = `App ${generateId()}`;
  const appName2 = `App ${generateId()}`;

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  await homeModel.createApplication({ name: appName1 });
  await homeModel.goto();
  await homeModel.createApplication({ name: appName2 });
  await homeModel.goto();

  await homeModel.searchFor(appName1);

  await expect(homeModel.getAppRow(appName1)).toBeVisible();
  await expect(homeModel.getAppRow(appName2)).toBeHidden();
});
