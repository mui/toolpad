import * as React from 'react';
import { ToolpadComponent } from '@mui/toolpad-core';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  FORM_COMPONENT_ID,
  PAGE_COLUMN_COMPONENT_ID,
  PAGE_ROW_COMPONENT_ID,
  STACK_COMPONENT_ID,
} from '../../runtime/toolpadComponents';
import { useProject } from '../../project';

export interface ToolpadComponentDefinition {
  displayName: string;
  builtIn?: string;
  system?: boolean;
  synonyms: string[];
  initialProps?: Record<string, unknown>;
}

export type ToolpadComponentDefinitions = Record<string, ToolpadComponentDefinition | undefined>;
export interface InstantiatedComponent extends ToolpadComponentDefinition {
  Component: ToolpadComponent<any>;
}
export type InstantiatedComponents = Record<string, InstantiatedComponent | undefined>;

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
  [
    'TextField',
    { displayName: 'Text Field', builtIn: 'TextField', synonyms: ['input', 'field', 'password'] },
  ],
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
  [
    'Password',
    {
      displayName: 'Password',
      builtIn: 'TextField',
      synonyms: [],
      initialProps: { password: true },
    },
  ],
]);

function useCodeComponents(): ToolpadComponentDefinitions {
  const project = useProject();
  const { data: codeComponents, refetch } = useSuspenseQuery({
    queryKey: ['codeComponents'],
    queryFn: () => project.api.methods.getComponents(),
  });

  React.useEffect(
    () => project.events.subscribe('componentsListChanged', refetch),
    [project.events, refetch],
  );

  return React.useMemo(
    () =>
      Object.fromEntries(
        codeComponents.map((codeComponent) => [
          `codeComponent.${codeComponent.name}`,
          {
            displayName: codeComponent.name,
            synonyms: [],
          },
        ]),
      ),
    [codeComponents],
  );
}

export function useToolpadComponents(): ToolpadComponentDefinitions {
  const codeComponents = useCodeComponents();
  return React.useMemo(
    () => ({ ...Object.fromEntries(INTERNAL_COMPONENTS), ...codeComponents }),
    [codeComponents],
  );
}

export function useToolpadComponent(id: string): ToolpadComponentDefinition | null {
  const components = useToolpadComponents();
  return React.useMemo(() => components[id] || null, [components, id]);
}
