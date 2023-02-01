import * as path from 'path';
import { test, expect } from '../../playwright/test';
import { readJsonFile } from '../../utils/fs';
import generateId from '../../utils/generateId';

test('can render in an iframe', async ({ api, page, baseURL }) => {
  const dom = await readJsonFile(path.resolve(__dirname, './dom.json'));

  const app = await api.mutation.createApp(`App ${generateId()}`, {
    from: { kind: 'dom', dom },
  });

  await api.mutation.deploy(app.id, { description: '' });

  await page.evaluate(
    ([src]) => {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.id = 'my-frame';
      document.body.append(iframe);
    },
    [`${baseURL}/deploy/${app.id}/pages/o57cdlq`],
  );

  const frame = await page.frameLocator('#my-frame');

  await expect(frame.getByText('Hello World!')).toBeVisible();
});
