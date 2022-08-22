import { expect, Page, Locator } from '@playwright/test';
import { canvasFrame, pageOverlay } from './locators';

export default async function selectCanvasComponent(page: Page, componentLocator: Locator) {
  const canvasFrameLocator = page.frameLocator(canvasFrame);

  const canvasPageOverlayLocator = canvasFrameLocator.locator(pageOverlay);
  const canvasPageOverlayBoundingBox = await canvasPageOverlayLocator.boundingBox();

  const componentBoundingBox = await componentLocator.boundingBox();

  expect(canvasPageOverlayBoundingBox).toBeDefined();

  await canvasPageOverlayLocator.click({
    position: {
      x:
        componentBoundingBox!.x + componentBoundingBox!.width / 2 - canvasPageOverlayBoundingBox!.x,
      y:
        componentBoundingBox!.y +
        componentBoundingBox!.height / 2 -
        canvasPageOverlayBoundingBox!.y,
    },
  });
}
