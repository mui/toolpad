import { Locator } from '../playwright/test';

export function cellLocator(gridLocator: Locator, rowIndex: number, collIndex: number) {
  return gridLocator
    .locator(`[aria-rowindex="${rowIndex}"]`)
    .locator(`[aria-colindex="${collIndex}"]`);
}
