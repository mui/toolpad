import { NodeId, ToolpadComponent } from '@mui/toolpad-core';
import * as appDom from '../../appDom';

export interface ToolpadComponentDefinition {
  displayName: string;
  builtIn?: string;
  system?: boolean;
  codeComponentId?: NodeId;
}

export type ToolpadComponentDefinitions = Record<string, ToolpadComponentDefinition | undefined>;
export interface InstantiatedComponent extends ToolpadComponentDefinition {
  Component: ToolpadComponent<any>;
}
export type InstantiatedComponents = Record<string, InstantiatedComponent | undefined>;

export const PAGE_ROW_COMPONENT_ID = 'PageRow';
export const PAGE_COLUMN_COMPONENT_ID = 'PageColumn';
export const STACK_COMPONENT_ID = 'Stack';
export const FORM_COMPONENT_ID = 'Form';

export const INTERNAL_COMPONENTS = new Map<string, ToolpadComponentDefinition>([
  [PAGE_ROW_COMPONENT_ID, { displayName: 'Row', builtIn: 'PageRow', system: true }],
  [PAGE_COLUMN_COMPONENT_ID, { displayName: 'Column', builtIn: 'PageColumn', system: true }],
  [STACK_COMPONENT_ID, { displayName: 'Stack', builtIn: 'Stack', system: true }],
  [
    'Autocomplete',
    {
      displayName: 'Autocomplete',
      builtIn: 'Autocomplete',
    },
  ],
  [
    'Button',
    {
      displayName: 'Button',
      builtIn: 'Button',
    },
  ],
  ['Image', { displayName: 'Image', builtIn: 'Image' }],
  ['DataGrid', { displayName: 'Data Grid', builtIn: 'DataGrid' }],
  ['Chart', { displayName: 'Chart', builtIn: 'Chart' }],
  ['TextField', { displayName: 'Text Field', builtIn: 'TextField' }],
  ['DatePicker', { displayName: 'Date Picker', builtIn: 'DatePicker' }],
  ['FilePicker', { displayName: 'File Picker', builtIn: 'FilePicker' }],
  ['Text', { displayName: 'Text', builtIn: 'Text' }],
  ['Select', { displayName: 'Select', builtIn: 'Select' }],
  ['List', { displayName: 'List', builtIn: 'List' }],
  ['Paper', { displayName: 'Paper', builtIn: 'Paper' }],
  ['Tabs', { displayName: 'Tabs', builtIn: 'Tabs' }],
  ['Container', { displayName: 'Container', builtIn: 'Container' }],
  ['Metric', { displayName: 'Metric', builtIn: 'Metric' }],
  [FORM_COMPONENT_ID, { displayName: 'Form', builtIn: 'Form' }],
]);

function createCodeComponent(domNode: appDom.CodeComponentNode): ToolpadComponentDefinition {
  return {
    displayName: domNode.name,
    codeComponentId: domNode.id,
  };
}

export function getToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinitions {
  const app = appDom.getApp(dom);
  const { codeComponents = [] } = appDom.getChildNodes(dom, app);
  return Object.fromEntries([
    ...INTERNAL_COMPONENTS.entries(),
    ...codeComponents.map((codeComponent) => [
      `codeComponent.${codeComponent.name}`,
      createCodeComponent(codeComponent),
    ]),
  ]);
}

export function getToolpadComponent(
  components: ToolpadComponentDefinitions,
  componentId: string,
): ToolpadComponentDefinition | null {
  const component = components[componentId];
  return component || null;
}

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
