import {
  PageRow,
  Stack,
  Button,
  Image,
  DataGrid,
  Container,
  TextField,
  Typography,
  Select,
  Paper,
  CustomLayout,
} from '@mui/toolpad-components';
import { ArgTypeDefinitions, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as appDom from '../appDom';
import { VersionOrPreview } from '../types';

export interface ToolpadComponentDefinition {
  displayName: string;
  argTypes: ArgTypeDefinitions;
  importedModule: string;
  importedName: string;
  codeComponent?: boolean;
  extraControls?: Partial<Record<string, { type: string }>>;
}

export type ToolpadComponentDefinitions = Record<string, ToolpadComponentDefinition | undefined>;
export interface InstantiatedComponent extends ToolpadComponentDefinition {
  Component: ToolpadComponent<any>;
}
export type InstantiatedComponents = Record<string, InstantiatedComponent | undefined>;

const INTERNAL_COMPONENTS = new Map<string, ToolpadComponentDefinition>([
  [
    'PageRow',
    {
      displayName: 'PageRow',
      importedModule: '@mui/toolpad-components',
      importedName: 'PageRow',
      ...PageRow[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Stack',
    {
      displayName: 'Stack',
      importedModule: '@mui/toolpad-components',
      importedName: 'Stack',
      ...Stack[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Button',
    {
      displayName: 'Button',
      importedModule: '@mui/toolpad-components',
      importedName: 'Button',
      ...Button[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Image',
    {
      displayName: 'Image',
      importedModule: '@mui/toolpad-components',
      importedName: 'Image',
      ...Image[TOOLPAD_COMPONENT],
    },
  ],
  [
    'DataGrid',
    {
      displayName: 'DataGrid',
      importedModule: '@mui/toolpad-components',
      importedName: 'DataGrid',
      ...DataGrid[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Container',
    {
      displayName: 'Container',
      importedModule: '@mui/toolpad-components',
      importedName: 'Container',
      ...Container[TOOLPAD_COMPONENT],
    },
  ],
  [
    'TextField',
    {
      displayName: 'TextField',
      importedModule: '@mui/toolpad-components',
      importedName: 'TextField',
      ...TextField[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Typography',
    {
      displayName: 'Typography',
      importedModule: '@mui/toolpad-components',
      importedName: 'Typography',
      ...Typography[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Select',
    {
      displayName: 'Select',
      importedModule: '@mui/toolpad-components',
      importedName: 'Select',
      ...Select[TOOLPAD_COMPONENT],
    },
  ],
  [
    'Paper',
    {
      displayName: 'Paper',
      importedModule: '@mui/toolpad-components',
      importedName: 'Paper',
      ...Paper[TOOLPAD_COMPONENT],
    },
  ],
  [
    'CustomLayout',
    {
      displayName: 'CustomLayout',
      importedModule: '@mui/toolpad-components',
      importedName: 'CustomLayout',
      ...CustomLayout[TOOLPAD_COMPONENT],
    },
  ],
]);

function createCodeComponent(
  appId: string,
  version: VersionOrPreview,
  domNode: appDom.CodeComponentNode,
): ToolpadComponentDefinition {
  return {
    displayName: domNode.name,
    argTypes: domNode.attributes.argTypes.value,
    importedModule: `/api/components/${encodeURIComponent(appId)}/${encodeURIComponent(
      version,
    )}/${encodeURIComponent(domNode.id)}`,
    importedName: 'default',
    codeComponent: true,
  };
}

export function getToolpadComponents(
  appId: string,
  version: VersionOrPreview,
  dom: appDom.AppDom,
): ToolpadComponentDefinitions {
  const app = appDom.getApp(dom);
  const { codeComponents = [] } = appDom.getChildNodes(dom, app);
  return Object.fromEntries([
    ...INTERNAL_COMPONENTS.entries(),
    ...codeComponents.map((codeComponent) => [
      `codeComponent.${codeComponent.id}`,
      createCodeComponent(appId, version, codeComponent),
    ]),
  ]);
}

export function getToolpadComponent(
  components: ToolpadComponentDefinitions,
  componentId: string,
): ToolpadComponentDefinition {
  const component = components[componentId];

  if (component) {
    return component;
  }

  throw new Error(`Invariant: Accessing unknown component "${componentId}"`);
}
