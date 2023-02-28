import { ToolpadHome } from '../models/ToolpadHome';
import { test, expect, Request } from '../playwright/test';
import generateId from '../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test('basic app creation flow', async ({ page }) => {
  const homeModel = new ToolpadHome(page);

  const appName = `App ${generateId()}`;

  await homeModel.goto();
  const brand = page.locator('data-testid=brand');
  await expect(brand).toHaveText('MUI Toolpad');

  await homeModel.createApplication({ name: appName });
  await homeModel.goto();

  // TODO: basic editor tests

  await page.click('[aria-label="Home"]');

  await homeModel.getAppRow(appName).locator('[aria-label="Application menu"]').click();

  await page.click('[role="menuitem"]:has-text("Delete"):visible');

  let hasNavigated = false;
  const handleRequest = (req: Request) => {
    if (req.isNavigationRequest()) {
      hasNavigated = true;
    }
  };
  page.on('request', handleRequest);

  await page.click(
    `[role="dialog"]:has-text('Are you sure you want to delete application "${appName}"') >> button:has-text("delete")`,
  );

  await homeModel.getAppRow(appName).waitFor({ state: 'detached' });

  page.off('request', handleRequest);

  // https://github.com/mui/mui-toolpad/issues/573
  expect(hasNavigated).toBeFalsy();
});
