import * as path from 'path';
import * as url from 'url';
import { test, expect } from '../../playwright/localTest';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  ignoreConsoleErrors: [
    [/Failed to load resource: the server responded with a status of 404 \(Not Found\)/],
    { scope: 'test' },
  ],
});

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'start',
  },
});

test('can render in an iframe', async ({ page, baseURL }) => {
  await page.goto('https://example.com');
  await page.evaluate(
    ([src]) => {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.id = 'my-frame';
      document.body.replaceChildren(iframe);
    },
    [`${baseURL}/prod/pages/o57cdlq`],
  );

  const frame = await page.frameLocator('#my-frame');

  await expect(frame.getByText('Hello World!')).toBeVisible();
});
