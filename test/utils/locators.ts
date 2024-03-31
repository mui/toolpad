import { Page, Locator, expect } from '../playwright/test';

type BoundingBox = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

export async function waitForBoundingBox(
  locator: Locator,
): Promise<Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>> {
  let boundingBox: BoundingBox | null = null;
  await expect(async () => {
    boundingBox = await locator.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  }).toPass();

  return boundingBox!;
}

export async function getCenter(locator: Locator) {
  const targetBoundingBox = await waitForBoundingBox(locator);

  return {
    x: targetBoundingBox!.x + targetBoundingBox!.width / 2,
    y: targetBoundingBox!.y + targetBoundingBox!.height / 2,
  };
}

export async function clickCenter(page: Page, targetLocator: Locator) {
  const { x, y } = await getCenter(targetLocator);
  await page.mouse.click(x, y);
}

export function cellLocator(gridLocator: Locator, rowIndex: number, collIndex: number) {
  return gridLocator
    .locator(`[aria-rowindex="${rowIndex}"]`)
    .locator(`[aria-colindex="${collIndex}"]`);
}
