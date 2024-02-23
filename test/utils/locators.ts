import { Page, Locator, expect } from '../playwright/test';

type BoundingBox = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

export async function getCenter(locator: Locator) {
  let targetBoundingBox: BoundingBox | null = null;
  await expect(async () => {
    targetBoundingBox = await locator.boundingBox();
    expect(targetBoundingBox).toBeTruthy();
    expect(targetBoundingBox!.width).toBeGreaterThan(0);
    expect(targetBoundingBox!.height).toBeGreaterThan(0);
  }).toPass();

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
