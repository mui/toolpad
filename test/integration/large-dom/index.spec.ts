import * as path from 'path';
import { test } from '../../playwright/test';
import { ToolpadHome } from '../../models/ToolpadHome';
import { readJsonFile } from '../../utils/fs';

test.skip(!!process.env.LOCAL_MODE_TESTS, 'These are hosted mode tests');

test('large dom', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './large.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  await homeModel.createApplication({ dom });
});
