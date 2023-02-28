import * as path from 'path';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expect, test } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test.use({
  ignoreConsoleErrors: [
    // Chrome
    /Unexpected token '\)'/,
    // Firefox
    /expected property name, got '\)'/,
  ],
});

test('bindings', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'bindings');

  const test1 = page.getByText('-test1-');
  await expect(test1).toBeVisible();
  const color = await test1.evaluate((elm) =>
    window.getComputedStyle(elm).getPropertyValue('color'),
  );
  expect(color).toBe('rgb(25, 118, 210)');
  await expect(page.getByText('-test2-')).toBeVisible();
});
