import * as appDom from '@toolpad/studio-runtime/appDom';

export const PAGE_ROW_COMPONENT_ID = 'PageRow';
export const PAGE_COLUMN_COMPONENT_ID = 'PageColumn';
export const SPACER_COMPONENT_ID = 'Spacer';
export const STACK_COMPONENT_ID = 'Stack';
export const FORM_COMPONENT_ID = 'Form';

export function getElementNodeComponentId(elementNode: appDom.ElementNode): string {
  return elementNode.attributes.component;
}

export function isPageRow(elementNode: appDom.ElementNode): boolean {
  return getElementNodeComponentId(elementNode) === PAGE_ROW_COMPONENT_ID;
}

export function isPageColumn(elementNode: appDom.ElementNode): boolean {
  return getElementNodeComponentId(elementNode) === PAGE_COLUMN_COMPONENT_ID;
}

export function isPageLayoutComponent(elementNode: appDom.ElementNode): boolean {
  return isPageRow(elementNode) || isPageColumn(elementNode);
}

export function isFormComponent(elementNode: appDom.ElementNode): boolean {
  return getElementNodeComponentId(elementNode) === FORM_COMPONENT_ID;
}
