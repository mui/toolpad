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

  const barChartColumn = page.locator('path[name="barChart"]');
  await expect(barChartColumn).toHaveCount(6);
  await expect(barChartColumn.first()).toHaveAttribute('fill', '#9c27b0');

  const lineChartLine = page.locator('path[name="lineChart"]');
  await expect(lineChartLine).toHaveCount(1);
  await expect(lineChartLine).toHaveAttribute('stroke', '#4caf50');
});

test('shows chart loading and errors', async ({ page }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('loadingAndError');

  await expect(page.getByText('BOOM!', { exact: true })).toBeVisible();

  await expect(page.getByRole('progressbar')).toBeVisible();
});
