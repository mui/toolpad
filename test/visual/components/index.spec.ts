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
  await editorModel.goToPageById('5YDOftB');

  await editorModel.waitForOverlay();

  const firstText = editorModel.appCanvas.getByText('text').first();

  await clickCenter(page, firstText);

  const firstTextBoundingBox = await firstText.boundingBox();

  await page.mouse.move(
    firstTextBoundingBox!.x + firstTextBoundingBox!.width - 5,
    firstTextBoundingBox!.y + firstTextBoundingBox!.height / 2,
    { steps: 10 },
  );

  await page.mouse.down();

  await page.mouse.move(
    firstTextBoundingBox!.x + firstTextBoundingBox!.width / 2,
    firstTextBoundingBox!.y + firstTextBoundingBox!.height / 2,
    { steps: 10 },
  );

  await argosScreenshot('resize-grid');
});
