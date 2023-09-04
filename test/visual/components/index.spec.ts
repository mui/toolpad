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

  await runtimeModel.gotoPage('text');
  await runtimeModel.waitForPageReady();
  await argosScreenshot('text', { fullPage: true });
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
  await editorModel.goToPageById('5YDOftB');

  await editorModel.waitForOverlay();

  const firstInput = editorModel.appCanvas.locator('input').first();

  await clickCenter(page, firstInput);

  const firstInputBoundingBox = await firstInput.boundingBox();

  await page.mouse.move(
    firstInputBoundingBox!.x + firstInputBoundingBox!.width - 5,
    firstInputBoundingBox!.y + firstInputBoundingBox!.height / 2,
    { steps: 10 },
  );

  await page.mouse.down();

  await page.mouse.move(
    firstInputBoundingBox!.x + firstInputBoundingBox!.width / 2,
    firstInputBoundingBox!.y + firstInputBoundingBox!.height / 2,
    { steps: 10 },
  );

  await argosScreenshot('resize-grid');
});
