import { Locator, expect } from '@playwright/test';

export default async function waitForBoundingBox(
  locator: Locator,
): Promise<Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>> {
  let boundingBox;
  await expect(async () => {
    boundingBox = await locator.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  }).toPass();

  return boundingBox!;
}
