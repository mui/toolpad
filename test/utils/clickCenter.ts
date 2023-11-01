import { Page, Locator } from '@playwright/test';
import waitForBoundingBox from './waitForBoundingBox';

export default async function clickCenter(page: Page, targetLocator: Locator) {
  const targetBoundingBox = await waitForBoundingBox(targetLocator);

  await page.mouse.click(
    targetBoundingBox!.x + targetBoundingBox!.width / 2,
    targetBoundingBox!.y + targetBoundingBox!.height / 2,
  );
}
