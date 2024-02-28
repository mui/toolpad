import * as path from 'path';
import * as url from 'url';
import { ToolpadEditor } from '../../models/ToolpadEditor';
import { ToolpadRuntime } from '../../models/ToolpadRuntime';
import { expect, test } from '../../playwright/localTest';
import { clickCenter, waitForBoundingBox } from '../../utils/locators';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

test.use({
  projectConfig: {
    template: path.resolve(currentDirectory, './fixture'),
  },
  localAppConfig: {
    cmd: 'dev',
  },
});

test('rendering components in the app runtime', async ({ page, argosScreenshot }) => {
  const runtimeModel = new ToolpadRuntime(page);

  await runtimeModel.goToPage('components');
  await runtimeModel.waitForPageReady();
  await argosScreenshot('components', { fullPage: true });

  await runtimeModel.goToPage('text');
  await runtimeModel.waitForPageReady();
  await argosScreenshot('text', { fullPage: true });
});

test('rendering components in the app editor', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('components');

  await editorModel.waitForOverlay();

  await argosScreenshot('no-selection');

  const image = editorModel.appCanvas.locator('img').first();

  await clickCenter(page, image);
  await argosScreenshot('with-selection');
});

test('building layouts', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('blank');

  await editorModel.waitForOverlay();

  const getNthFullWidthBoundingBox = (
    n: number,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> =>
    editorModel.appCanvas.getByText('fullwidth').nth(n).boundingBox();

  await editorModel.dragNewComponentToCanvas('FullWidth');

  await expect(editorModel.appCanvas.getByTestId('node-hud-tag')).toBeVisible();
  await expect(page.getByLabel('All changes saved!')).toBeVisible();
  await argosScreenshot('building-layout-1');

  const firstFullWidthBoundingBox = await getNthFullWidthBoundingBox(0);

  // Place inside right of first element
  await editorModel.dragNewComponentToCanvas(
    'FullWidth',
    firstFullWidthBoundingBox!.x + (2 / 3) * firstFullWidthBoundingBox!.width,
    firstFullWidthBoundingBox!.y + firstFullWidthBoundingBox!.height / 2,
  );

  await expect(editorModel.appCanvas.getByTestId('node-hud-tag')).toBeVisible();
  await expect(page.getByLabel('All changes saved!')).toBeVisible();
  await argosScreenshot('building-layout-2');

  const secondFullWidthBoundingBox = await getNthFullWidthBoundingBox(1);

  // Place outside right of second element
  await editorModel.dragNewComponentToCanvas(
    'FullWidth',
    secondFullWidthBoundingBox!.x + secondFullWidthBoundingBox!.width + 12,
    secondFullWidthBoundingBox!.y + secondFullWidthBoundingBox!.height / 2,
    true,
    1,
  );

  await expect(editorModel.appCanvas.getByTestId('node-hud-tag')).toBeVisible();
  await expect(page.getByLabel('All changes saved!')).toBeVisible();
  await argosScreenshot('building-layout-3');
});

test('showing grid while resizing elements', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('rows');

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

test('resizing element heights', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('grids');

  await editorModel.waitForOverlay();

  const appCanvasBoundingBox = await editorModel.appCanvas.locator('body').boundingBox();

  const screenshotConfig = {
    clip: appCanvasBoundingBox || undefined,
  };

  const firstGrid = editorModel.appCanvas.getByRole('grid').nth(0);

  await clickCenter(page, firstGrid);
  await argosScreenshot('vertical-resize-before', screenshotConfig);

  const firstGridBoundingBox = await waitForBoundingBox(firstGrid);

  await page.mouse.move(
    firstGridBoundingBox!.x + firstGridBoundingBox!.width / 2,
    firstGridBoundingBox!.y + firstGridBoundingBox!.height - 4,
    { steps: 10 },
  );

  await page.mouse.down();

  await page.mouse.move(
    firstGridBoundingBox!.x + firstGridBoundingBox!.width / 2,
    firstGridBoundingBox!.y + firstGridBoundingBox!.height + 100,
    { steps: 10 },
  );

  await page.mouse.up();

  const thirdGrid = editorModel.appCanvas.getByRole('grid').nth(2);

  await clickCenter(page, thirdGrid);

  const thirdGridBoundingBox = await waitForBoundingBox(thirdGrid);

  await page.mouse.move(
    thirdGridBoundingBox!.x + thirdGridBoundingBox!.width / 2,
    thirdGridBoundingBox!.y + thirdGridBoundingBox!.height - 4,
    { steps: 10 },
  );

  await page.mouse.down();

  await page.mouse.move(
    thirdGridBoundingBox!.x + thirdGridBoundingBox!.width / 2,
    thirdGridBoundingBox!.y + thirdGridBoundingBox!.height + 100,
    { steps: 10 },
  );

  await page.mouse.up();

  await clickCenter(page, firstGrid);
  await argosScreenshot('vertical-resize-after', screenshotConfig);
});

test('showing drag-and-drop previews', async ({ page, argosScreenshot }) => {
  const editorModel = new ToolpadEditor(page);
  await editorModel.goToPage('dragdrop');

  await editorModel.waitForOverlay();

  const appCanvasBoundingBox = await editorModel.appCanvas.locator('body').boundingBox();

  const screenshotConfig = {
    clip: appCanvasBoundingBox || undefined,
  };

  type BoundingBox = Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>;

  const getDropPreviewLeftCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox.x + boundingBox.width / 3,
    boundingBox.y + boundingBox.height / 2,
  ];
  const getDropPreviewTopCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox.x + boundingBox.width / 2,
    boundingBox.y + boundingBox.height / 3,
  ];
  const getDropPreviewRightCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox.x + (2 / 3) * boundingBox.width,
    boundingBox.y + (2 / 3) * boundingBox.height,
  ];
  const getDropPreviewBottomCoordinates = (boundingBox: BoundingBox): [number, number] => [
    boundingBox.x + boundingBox.width / 2,
    boundingBox.y + (2 / 3) * boundingBox.height,
  ];

  // Check all direction previews when dragging over component

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

  // Check top, left and right previews when dragging outside component

  await page.mouse.move(
    inputBoundingBox!.x + inputBoundingBox!.width / 2,
    inputBoundingBox!.y - 12,
    {
      steps: 10,
    },
  );
  await argosScreenshot('drop-preview-outside-top', screenshotConfig);

  await page.mouse.move(
    inputBoundingBox!.x - 12,
    inputBoundingBox!.y + inputBoundingBox!.height / 2,
    {
      steps: 1,
    },
  );
  await argosScreenshot('drop-preview-outside-left', screenshotConfig);

  await page.mouse.move(
    inputBoundingBox!.x + inputBoundingBox!.width + 12,
    inputBoundingBox!.y + inputBoundingBox!.height / 2,
    {
      steps: 1,
    },
  );
  await argosScreenshot('drop-preview-outside-right', screenshotConfig);

  // Check preview when dragging inside empty container

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

  // Check all direction previews when dragging over component inside container

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
