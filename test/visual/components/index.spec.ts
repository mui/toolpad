import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';

test.use({
  localAppConfig: {
    template: path.resolve(__dirname, './fixture'),
    cmd: 'dev',
  },
});

test('rendering components in the app runtime', async ({ page, argosScreenshot }) => {
  const runtimeModel = new ToolpadRuntime(page);
  await runtimeModel.gotoPage('components');

  await runtimeModel.waitForPageReady();

  await argosScreenshot('components', { fullPage: true });
});

test('rendering components in the app editor', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.waitForOverlay();

  await argosScreenshot('no-selection');

  const image = editorModel.appCanvas.locator('img').first();

  await clickCenter(page, image);
  await argosScreenshot('with-selection');
});

test('showing grid while resizing elements', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goto();

  await editorModel.waitForOverlay();

  const image = editorModel.appCanvas.locator('img').first();

  await clickCenter(page, image);

  const imageBoundingBox = await image.boundingBox();

  await page.mouse.move(
    imageBoundingBox!.x + imageBoundingBox!.width - 5,
    imageBoundingBox!.y + imageBoundingBox!.height / 2,
    { steps: 10 },
  );

  await page.mouse.down();

  await page.mouse.move(
    imageBoundingBox!.x + imageBoundingBox!.width / 2,
    imageBoundingBox!.y + imageBoundingBox!.height / 2,
    { steps: 10 },
  );

  await argosScreenshot('resize-grid');
});
