import { Page, Locator, expect } from '@playwright/test';

export default async function clickCenter(page: Page, targetLocator: Locator) {
  let targetBoundingBox;
  await expect(async () => {
    targetBoundingBox = await targetLocator.boundingBox();
    expect(targetBoundingBox).toBeTruthy();
    expect(targetBoundingBox!.width).toBeGreaterThan(0);
    expect(targetBoundingBox!.height).toBeGreaterThan(0);
  }).toPass();

  await page.mouse.click(
    targetBoundingBox!.x + targetBoundingBox!.width / 2,
    targetBoundingBox!.y + targetBoundingBox!.height / 2,
  );
}
