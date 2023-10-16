import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  colorScheme: 'dark',
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'start',
  },
});

test('Uses correct theme background with preferred color scheme', async ({ page }) => {
  await page.goto('/prod/pages/m31v9c7');
  await page.getByText('Hello world!').waitFor();
  const body = await page.waitForSelector('body');
  const color = await body.evaluate((el) =>
    window.getComputedStyle(el).getPropertyValue('background-color'),
  );
  expect(color).toBe('rgb(255, 255, 255)');
});
