import * as path from 'path';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { test } from '../../playwright/localTest';
import clickCenter from '../../utils/clickCenter';
import { BoundingBox } from '../../types/BoundingBox';

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

  const input = editorModel.appCanvas.locator('input').first();

  await clickCenter(page, input);

  const inputBoundingBox = await input.boundingBox();

  await page.mouse.move(
    inputBoundingBox!.x + inputBoundingBox!.width - 5,
    inputBoundingBox!.y + inputBoundingBox!.height / 2,
    { steps: 10 },
  );

  await page.mouse.down();

  await page.mouse.move(
    inputBoundingBox!.x + inputBoundingBox!.width / 2,
    inputBoundingBox!.y + inputBoundingBox!.height / 2,
    { steps: 10 },
  );

  await argosScreenshot('resize-grid');
});

test('showing drag-and-drop previews', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPageById('8ixPqyI');

  await editorModel.waitForOverlay();

  const appCanvasBoundingBox = await editorModel.appCanvas.locator('body').boundingBox();

  const screenshotConfig = {
    clip: appCanvasBoundingBox || undefined,
  };

  const getDropPreviewLeftCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox!.x + (1 / 3) * boundingBox!.width,
    boundingBox!.y + boundingBox!.height / 2,
  ];
  const getDropPreviewTopCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox!.x + boundingBox!.width / 2,
    boundingBox!.y + (1 / 3) * boundingBox!.height,
  ];
  const getDropPreviewRightCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox!.x + (2 / 3) * boundingBox!.width,
    boundingBox!.y + (2 / 3) * boundingBox!.height,
  ];
  const getDropPreviewBottomCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox!.x + boundingBox!.width / 2,
    boundingBox!.y + (2 / 3) * boundingBox!.height,
  ];

  const inputBoundingBox = await editorModel.appCanvas.locator('input').boundingBox();

  await editorModel.dragNewComponentToCanvas(
    'Text Field',
    ...getDropPreviewLeftCoordinates(inputBoundingBox!),
    false,
  );
  await argosScreenshot('drop-preview-left', screenshotConfig);

  await page.mouse.move(...getDropPreviewTopCoordinates(inputBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('drop-preview-top', screenshotConfig);

  await page.mouse.move(...getDropPreviewRightCoordinates(inputBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('drop-preview-right', screenshotConfig);

  await page.mouse.move(...getDropPreviewBottomCoordinates(inputBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('drop-preview-bottom', screenshotConfig);

  const containerDropAreaBoundingBox = await editorModel.appCanvas
    .getByText('Drop component here')
    .boundingBox();

  await page.mouse.move(
    containerDropAreaBoundingBox!.x + containerDropAreaBoundingBox!.width / 2,
    containerDropAreaBoundingBox!.y + containerDropAreaBoundingBox!.height / 2,
    {
      steps: 10,
    },
  );
  await argosScreenshot('container-drop-preview-empty', screenshotConfig);

  const containerButtonBoundingBox = await editorModel.appCanvas
    .getByText('contained')
    .boundingBox();

  await page.mouse.move(...getDropPreviewLeftCoordinates(containerButtonBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('container-drop-preview-left', screenshotConfig);

  await page.mouse.move(...getDropPreviewTopCoordinates(containerButtonBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('container-drop-preview-top', screenshotConfig);

  await page.mouse.move(...getDropPreviewRightCoordinates(containerButtonBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('container-drop-preview-right', screenshotConfig);

  await page.mouse.move(...getDropPreviewBottomCoordinates(containerButtonBoundingBox!), {
    steps: 10,
  });
  await argosScreenshot('container-drop-preview-bottom', screenshotConfig);
});
