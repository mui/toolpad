import { NodeId, ToolpadComponent } from '@mui/toolpad-core';
import * as appDom from '../../appDom';

export interface ToolpadComponentDefinition {
  displayName: string;
  builtIn?: string;
  system?: boolean;
  codeComponentId?: NodeId;
  synonyms: string[];
  initialProps?: Record<string, unknown>;
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
  [PAGE_ROW_COMPONENT_ID, { displayName: 'Row', builtIn: 'PageRow', system: true, synonyms: [] }],
  [
    PAGE_COLUMN_COMPONENT_ID,
    { displayName: 'Column', builtIn: 'PageColumn', system: true, synonyms: [] },
  ],
  [STACK_COMPONENT_ID, { displayName: 'Stack', builtIn: 'Stack', system: true, synonyms: [] }],
  [
    'Autocomplete',
    {
      displayName: 'Autocomplete',
      builtIn: 'Autocomplete',
      synonyms: ['combobox', 'select', 'dropdown'],
    },
  ],
  [
    'Button',
    {
      displayName: 'Button',
      builtIn: 'Button',
      synonyms: ['click', 'action'],
    },
  ],
  ['Image', { displayName: 'Image', builtIn: 'Image', synonyms: ['picture'] }],
  ['DataGrid', { displayName: 'Data Grid', builtIn: 'DataGrid', synonyms: ['table'] }],
  [
    'Chart',
    {
      displayName: 'Chart',
      builtIn: 'Chart',
      synonyms: ['graph', 'bar chart', 'pie chart', 'line chart', 'plot'],
    },
  ],
  ['TextField', { displayName: 'Text Field', builtIn: 'TextField', synonyms: ['input', 'field'] }],
  ['DatePicker', { displayName: 'Date Picker', builtIn: 'DatePicker', synonyms: ['time'] }],
  ['FilePicker', { displayName: 'File Picker', builtIn: 'FilePicker', synonyms: [] }],
  ['Text', { displayName: 'Text', builtIn: 'Text', synonyms: ['markdown', 'link', 'output'] }],
  [
    'Markdown',
    {
      displayName: 'Markdown',
      builtIn: 'Text',
      initialProps: {
        mode: 'markdown',
      },
      synonyms: [],
    },
  ],
  [
    'Link',
    {
      displayName: 'Link',
      builtIn: 'Text',
      initialProps: {
        mode: 'link',
      },
      synonyms: [],
    },
  ],
  ['Select', { displayName: 'Select', builtIn: 'Select', synonyms: ['combobox', 'dropdown'] }],
  ['List', { displayName: 'List', builtIn: 'List', synonyms: ['repeat'] }],
  ['Paper', { displayName: 'Paper', builtIn: 'Paper', synonyms: ['surface'] }],
  ['Tabs', { displayName: 'Tabs', builtIn: 'Tabs', synonyms: [] }],
  ['Container', { displayName: 'Container', builtIn: 'Container', synonyms: [] }],
  ['Metric', { displayName: 'Metric', builtIn: 'Metric', synonyms: ['value', 'number', 'output'] }],
  [
    'Checkbox',
    {
      displayName: 'Checkbox',
      initialProps: {
        mode: 'checkbox',
      },
      builtIn: 'Checkbox',
      synonyms: ['switch'],
    },
  ],
  [
    'Switch',
    {
      displayName: 'Switch',
      initialProps: {
        mode: 'switch',
      },
      builtIn: 'Checkbox',
      synonyms: ['switch'],
    },
  ],
  [FORM_COMPONENT_ID, { displayName: 'Form', builtIn: 'Form', synonyms: [] }],
]);

function createCodeComponent(domNode: appDom.CodeComponentNode): ToolpadComponentDefinition {
  return {
    displayName: domNode.name,
    codeComponentId: domNode.id,
    synonyms: [],
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
