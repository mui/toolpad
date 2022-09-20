import { test, expect } from '../playwright/test';
import { ToolpadHome } from '../models/ToolpadHome';
import generateId from '../utils/generateId';

test('duplicate app from home flow', async ({ page }) => {
  const appName1 = `App ${generateId()}`;
  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  await homeModel.createApplication({ name: appName1 });
  await homeModel.goto();
  await homeModel.duplicateApplication(appName1);
  await homeModel.goto();
  await expect(homeModel.getAppRow(`${appName1} (copy)`)).toBeVisible();
  await homeModel.duplicateApplication(appName1);
  await homeModel.goto();
  await expect(homeModel.getAppRow(`${appName1} (copy 2)`)).toBeVisible();
});
