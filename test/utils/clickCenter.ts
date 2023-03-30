import { Page, Locator, expect } from '@playwright/test';

export default async function clickCenter(page: Page, targetLocator: Locator) {
  const targetBoundingBox = await targetLocator.boundingBox();
  await expect(targetBoundingBox).toBeDefined();

  await page.mouse.click(
    targetBoundingBox!.x + targetBoundingBox!.width / 2,
    targetBoundingBox!.y + targetBoundingBox!.height / 2,
  );
}
