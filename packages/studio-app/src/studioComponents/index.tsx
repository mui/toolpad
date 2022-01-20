import * as studioComponentLib from '@mui/studio-components';
import { ArgTypeDefinitions, DEFINITION_KEY } from '@mui/studio-core';
import * as studioDom from '../studioDom';
import { RenderComponent, RenderContext, ResolvedProps } from '../types';

export type StudioComponentDefinition =
  | {
      id: string;
      displayName: string;
      argTypes: ArgTypeDefinitions;
      module: string;
      importedName: string;
      render?: undefined;
    }
  | {
      id: string;
      displayName: string;
      argTypes: ArgTypeDefinitions;
      render: RenderComponent;
    };

const INTERNAL_COMPONENTS = new Map<string, StudioComponentDefinition>([
  [
    'Button',
    {
      id: 'Button',
      displayName: 'Button',
      module: '@mui/studio-components',
      importedName: 'Button',
      argTypes: (studioComponentLib.Button as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'DataGrid',
    {
      id: 'DataGrid',
      displayName: 'DataGrid',
      module: '@mui/studio-components',
      importedName: 'DataGrid',
      argTypes: (studioComponentLib.DataGrid as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Paper',
    {
      id: 'Paper',
      displayName: 'Paper',
      module: '@mui/studio-components',
      importedName: 'Paper',
      argTypes: (studioComponentLib.Paper as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Stack',
    {
      id: 'Stack',
      displayName: 'Stack',
      module: '@mui/studio-components',
      importedName: 'Stack',
      argTypes: (studioComponentLib.Stack as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'TextField',
    {
      id: 'TextField',
      displayName: 'TextField',
      module: '@mui/studio-components',
      importedName: 'TextField',
      argTypes: (studioComponentLib.TextField as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Typography',
    {
      id: 'Typography',
      displayName: 'Typography',
      module: '@mui/studio-components',
      importedName: 'Typography',
      argTypes: (studioComponentLib.Typography as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'CustomLayout',
    {
      id: 'CustomLayout',
      displayName: 'CustomLayout',
      module: '@mui/studio-components',
      importedName: 'CustomLayout',
      argTypes: (studioComponentLib.CustomLayout as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Select',
    {
      id: 'Select',
      displayName: 'Select',
      module: '@mui/studio-components',
      importedName: 'Select',
      argTypes: (studioComponentLib.Select as any)[DEFINITION_KEY].argTypes,
    },
  ],
]);

function createCodeComponent(
  domNode: studioDom.StudioCodeComponentNode,
): StudioComponentDefinition {
  return {
    id: `codeComponent.${domNode.id}`,
    displayName: domNode.name,
    argTypes: domNode.argTypes,
    render: (ctx: RenderContext, resolvedProps: ResolvedProps) => {
      const localName = `Custom_${domNode.id}`;
      ctx.addImport(`../components/${domNode.id}.tsx`, `default`, localName);
      return `<${localName} ${ctx.renderProps(resolvedProps)} />`;
    },
  };
}

export function getStudioComponents(dom: studioDom.StudioDom): StudioComponentDefinition[] {
  const app = studioDom.getApp(dom);
  const studioCodeComponents = studioDom.getCodeComponents(dom, app);
  return [
    ...INTERNAL_COMPONENTS.values(),
    ...studioCodeComponents.map((studioCodeComponent) => createCodeComponent(studioCodeComponent)),
  ];
}

export function getStudioComponent(
  dom: studioDom.StudioDom,
  componentId: string,
): StudioComponentDefinition {
  const component = INTERNAL_COMPONENTS.get(componentId);

  if (component) {
    return component;
  }

  const app = studioDom.getApp(dom);
  const studioCodeComponents = studioDom.getCodeComponents(dom, app);
  const nodeId = componentId.split('.')[1];
  const domNode = studioCodeComponents.find((node) => node.id === nodeId);

  if (domNode) {
    return createCodeComponent(domNode);
  }

  throw new Error(`Invariant: Accessing unknown component "${componentId}"`);
}
