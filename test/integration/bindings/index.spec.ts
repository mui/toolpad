import * as path from 'path';
import * as url from 'url';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expect, test } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    [
      // Chrome
      /Unexpected token '\)'/,
      // Firefox
      /expected property name, got '\)'/,
    ],
    { scope: 'test' },
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('bindings', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('bindings');

  const test1 = page.getByText('-test1-');
  await expect(test1).toBeVisible();
  const color = await test1.evaluate((elm) =>
    window.getComputedStyle(elm).getPropertyValue('color'),
  );
  expect(color).toBe('rgb(25, 118, 210)');
  await expect(page.getByText('-test2-')).toBeVisible();
});

test('global scope', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('globalScope');

  await expect(page.getByText('|test1 ok|')).toBeVisible();
  await expect(page.getByText('|test2 ok|')).toBeVisible();
  await expect(page.getByText('|test3 ok|')).toBeVisible();
  await expect(page.getByText('|test4 ok|')).toBeVisible();
  await expect(page.getByText('|test5 ok|')).toBeVisible();
  await expect(page.getByText('|test6 ok|')).toBeVisible();
  await expect(page.getByText('|test7 ok|')).toBeVisible();
  await expect(page.getByText('|test8 ok|')).toBeVisible();
});

test('encoding', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('encoding');

  const test1 = page.getByText('Can pass utf-8: "€"');
  await expect(test1).toBeVisible();

  const test2 = page.getByText('Can pass double dollars: "$$"');
  await expect(test2).toBeVisible();
});
