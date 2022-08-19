export function toolpadHomeAppRow(appName: string): string {
  return `[role="row"] >> has="input[value='${appName}']"`;
}

export const componentCatalog = 'data-test-id=component-catalog';

export const canvasFrame = 'iframe[data-toolpad-canvas]';

export const pageOverlay = 'data-test-id=page-overlay';
