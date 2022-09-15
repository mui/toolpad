import { ToolpadHome } from '../models/ToolpadHome';
import { test, expect, Request } from '../playwright/test';
import generateId from '../utils/generateId';
import * as locators from '../utils/locators';

test('basic app creation flow', async ({ page }) => {
  const appName = `App ${generateId()}`;

  const homeModel = new ToolpadHome(page);

  await homeModel.goto();
  const brand = page.locator('data-test-id=brand');
  await expect(brand).toHaveText('MUI Toolpad');

  await homeModel.createApplication({ name: appName });
  await homeModel.goto();

  // TODO: basic editor tests

  await page.click('[aria-label="Home"]');

  await page.click(`${locators.toolpadHomeAppRow(appName)} >> [aria-label="Application menu"]`);

  await page.click('[role="menuitem"]:has-text("Delete"):visible');

  let hasNavigated = false;
  const handleRequest = (req: Request) => {
    if (req.isNavigationRequest()) {
      hasNavigated = true;
    }
  };
  await page.on('request', handleRequest);

  await page.click(
    `[role="dialog"]:has-text('Are you sure you want to delete application "${appName}"') >> button:has-text("delete")`,
  );

  await page.waitForSelector(locators.toolpadHomeAppRow(appName), { state: 'detached' });

  await page.off('request', handleRequest);

  // https://github.com/mui/mui-toolpad/issues/573
  expect(hasNavigated).toBeFalsy();
});
