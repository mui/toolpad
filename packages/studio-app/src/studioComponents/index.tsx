import * as studioComponentLib from '@mui/studio-components';
import { ArgTypeDefinitions, DEFINITION_KEY } from '@mui/studio-core';
import * as studioDom from '../studioDom';
import { RenderComponent } from '../types';

export interface StudioComponentDefinition {
  id: string;
  displayName: string;
  argTypes: ArgTypeDefinitions;
  render: RenderComponent;
}

function importedComponentRenderer(
  moduleName: string,
  importedName: string,
  suggestedLocalName: string = importedName,
): RenderComponent {
  return (ctx, resolvedProps) => {
    const localName = ctx.addImport(moduleName, importedName, suggestedLocalName);
    return `<${localName} ${ctx.renderProps(resolvedProps)} />`;
  };
}

// TODO: bring these back to @mui/studio repo and make them import @mui/material
const INTERNAL_COMPONENTS = new Map<string, StudioComponentDefinition>([
  [
    'Button',
    {
      id: 'Button',
      displayName: 'Button',
      render: importedComponentRenderer('@mui/studio-components', 'Button'),
      argTypes: (studioComponentLib.Button as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'DataGrid',
    {
      id: 'DataGrid',
      displayName: 'DataGrid',
      render: importedComponentRenderer('@mui/studio-components', 'DataGrid'),
      argTypes: (studioComponentLib.DataGrid as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Paper',
    {
      id: 'Paper',
      displayName: 'Paper',
      render: importedComponentRenderer('@mui/studio-components', 'Paper'),
      argTypes: (studioComponentLib.Paper as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Stack',
    {
      id: 'Stack',
      displayName: 'Stack',
      render: importedComponentRenderer('@mui/studio-components', 'Stack'),
      argTypes: (studioComponentLib.Stack as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'TextField',
    {
      id: 'TextField',
      displayName: 'TextField',
      render: importedComponentRenderer('@mui/studio-components', 'TextField'),
      argTypes: (studioComponentLib.TextField as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Typography',
    {
      id: 'Typography',
      displayName: 'Typography',
      render: importedComponentRenderer('@mui/studio-components', 'Typography'),
      argTypes: (studioComponentLib.Typography as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'CustomLayout',
    {
      id: 'CustomLayout',
      displayName: 'CustomLayout',
      render: importedComponentRenderer('@mui/studio-components', 'CustomLayout'),
      argTypes: (studioComponentLib.CustomLayout as any)[DEFINITION_KEY].argTypes,
    },
  ],
  [
    'Select',
    {
      id: 'Select',
      displayName: 'Select',
      render: importedComponentRenderer('@mui/studio-components', 'Select'),
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
    render: importedComponentRenderer(
      `../components/${domNode.id}.tsx`,
      `default`,
      `Custom_${domNode.id}`,
    ),
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
