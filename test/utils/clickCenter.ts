import { Page, Locator, expect } from '@playwright/test';

export default async function clickCenter(page: Page, targetLocator: Locator) {
  await expect(targetLocator).toBeVisible();

  const targetBoundingBox = await targetLocator.boundingBox();
  expect(targetBoundingBox).toBeTruthy();

  await page.mouse.click(
    targetBoundingBox!.x + targetBoundingBox!.width / 2,
    targetBoundingBox!.y + targetBoundingBox!.height / 2,
  );
}
