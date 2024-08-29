import * as path from 'path';
import * as url from 'url';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    [
      // Intentionally thrown
      /BOOM!/,
    ],
    { scope: 'test' },
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture-chart'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('shows chart data', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('chart');

  const barChartColumn = page.locator('.MuiBarElement-root');
  await expect(barChartColumn).toHaveCount(5);
  await expect(barChartColumn.first()).toHaveCSS('fill', 'rgb(156, 39, 176)');

  const lineChartLine = page.locator('.MuiLineElement-root');
  await expect(lineChartLine).toHaveCount(1);
  await expect(lineChartLine).toHaveCSS('stroke', 'rgb(76, 175, 80)');
});

test('shows chart loading and errors', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.goToPage('loadingAndError');

  await expect(page.getByText('BOOM!', { exact: true })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toBeVisible();
});
