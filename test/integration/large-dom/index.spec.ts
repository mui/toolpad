import * as path from 'path';
import { test } from '../../playwright/test';
import { ToolpadHome } from '../../models/ToolpadHome';
import { readJsonFile } from '../../utils/fs';

test('large dom', async ({ page }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './large.json'));

  const homeModel = new ToolpadHome(page);
  await homeModel.goto();
  await homeModel.createApplication({ dom });
});
