import * as path from 'path';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expect, test } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-navigation'),
    cmd: 'dev',
  },
});

test('navigation action', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('page1');

  const getPageUrlSearch = (): string => new URL(page.url()).search;

  await expect(page.getByText('welcome to page 2')).not.toBeVisible();
  expect(getPageUrlSearch()).toBe('');

  const navigationButton = page.getByRole('button', { name: 'goToPage2' });
  await navigationButton.click();
  await runtimeModel.waitForNavigation();

  await expect(page.getByText('welcome to page 2')).toBeVisible();
  expect(getPageUrlSearch()).toBe('?abc=zyx&def=goToPage2');
});
