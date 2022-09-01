export function toolpadHomeAppRow(appName: string): string {
  return `[role="row"] >> has="input[value='${appName}']"`;
}

export const componentCatalog = 'data-testid=component-catalog';
export const selectedNodeEditor = 'data-testid=selected-node-editor';

export const canvasFrame = 'iframe[data-toolpad-canvas]';
export const pageRoot = 'data-testid=page-root';
