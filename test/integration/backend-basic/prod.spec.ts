import * as path from 'path';
import { test } from '../../playwright/localTest';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expectBasicPageContent } from './shared';

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
    env: {
      SECRET_BAZ: 'Some baz secret',
    },
  },
});

test('functions basics', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page, { prod: true });
  await runtimeModel.gotoPage('basic');

  await expectBasicPageContent(page);
});
