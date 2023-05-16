import * as path from 'path';
import { test, expect } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';

test.use({
  ignoreConsoleErrors: [
    // Chrome:
    /Cannot read properties of null/,
    // firefox:
    /throws\.error is null/,
    // Intentionally thrown
    /BOOM!/,
  ],
});

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'start',
  },
});

test('functions basics', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page, { prod: true });
  await runtimeModel.gotoPage('page1');

  await expect(page.locator('text="hello, message: hello world"')).toBeVisible();
  await expect(page.locator('text="throws, error.message: BOOM!"')).toBeVisible();
  await expect(page.locator('text="throws, data undefined"')).toBeVisible();
  await expect(page.locator('text="echo, parameter: bound foo parameter"')).toBeVisible();
  await expect(page.locator('text="echo, secret: Some bar secret"')).toBeVisible();
});
