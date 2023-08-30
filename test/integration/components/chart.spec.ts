import * as path from 'path';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test, expect } from '../../playwright/localTest';

test.use({
  ignoreConsoleErrors: [
    // Intentionally thrown
    /BOOM!/,
  ],
});

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture-chart'),
    cmd: 'dev',
  },
});

test('shows chart data', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('chart');

  const barChartColumn = page.locator('.MuiBarElement-root');
  await expect(barChartColumn).toHaveCount(5);
  await expect(barChartColumn.first()).toHaveCSS('fill', 'rgb(156, 39, 176)');

  const lineChartLine = page.locator('.MuiLineElement-root');
  await expect(lineChartLine).toHaveCount(1);
  await expect(lineChartLine).toHaveCSS('stroke', 'rgb(76, 175, 80)');
});

test('shows chart loading and errors', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('loadingAndError');

  await expect(page.getByText('BOOM!', { exact: true })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toBeVisible();
});
