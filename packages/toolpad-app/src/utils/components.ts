import type * as appDom from "../appDom";


export const PAGE_ROW_COMPONENT_ID = 'PageRow';
export const PAGE_COLUMN_COMPONENT_ID = 'PageColumn';

export const getElementNodeComponentId = (elementNode: appDom.ElementNode): string => elementNode.attributes.component.value