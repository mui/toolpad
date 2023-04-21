import * as path from 'path';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-list'),
    cmd: 'dev',
  },
});

test('list component behavior', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('list');

  const firstInput = page.getByLabel('textField0');
  const secondInput = page.getByLabel('textField1');

  await firstInput.type('one');
  await secondInput.type('two');

  await expect(page.locator('p:text("one")')).toBeVisible();
  await expect(page.locator('p:text("two")')).toBeVisible();

  await expect(page.locator('button:text("one")')).toBeVisible();
});
