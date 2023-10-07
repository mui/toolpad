import * as path from 'path';
import { readJsonFile } from '../../../packages/toolpad-utils/src/fs';
import { test, expect } from '../../playwright/test';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import generateId from '../../utils/generateId';

test.skip(true, 'Legacy database tests');

const mysqlHost = process.env.MYSQL_HOST;

if (mysqlHost) {
  // eslint-disable-next-line no-console
  console.log(`Running tests with mysql host: ${mysqlHost}`);
}

const MYSQL_SOURCE_HOST = 'localhost';
const MYSQL_TARGET_HOST = mysqlHost || MYSQL_SOURCE_HOST;

test('mysql basics', async ({ page, api }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './mysqlDom.json'), (key, value) => {
    if (typeof value === 'string') {
      return value.replaceAll(MYSQL_SOURCE_HOST, MYSQL_TARGET_HOST);
    }
    return value;
  });

  const app = await api.methods.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage(app.id, 'page');
  await expect(page.locator('text="information_schema"')).toBeVisible();
});
