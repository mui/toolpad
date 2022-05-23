import { ToolpadComponent } from '@mui/toolpad-core';
import * as appDom from '../appDom';
import { NodeId, VersionOrPreview } from '../types';

export interface ToolpadComponentDefinition {
  displayName: string;
  builtin?: string;
  codeComponentId?: NodeId;
}

export type ToolpadComponentDefinitions = Record<string, ToolpadComponentDefinition | undefined>;
export interface InstantiatedComponent extends ToolpadComponentDefinition {
  Component: ToolpadComponent<any>;
}
export type InstantiatedComponents = Record<string, InstantiatedComponent | undefined>;

const INTERNAL_COMPONENTS = new Map<string, ToolpadComponentDefinition>([
  ['PageRow', { displayName: 'PageRow', builtin: 'PageRow' }],
  ['PageColumn', { displayName: 'Container', builtin: 'PageColumn' }],
  ['Stack', { displayName: 'Stack', builtin: 'Stack' }],
  ['Button', { displayName: 'Button', builtin: 'Button' }],
  ['Image', { displayName: 'Image', builtin: 'Image' }],
  ['DataGrid', { displayName: 'DataGrid', builtin: 'DataGrid' }],
  ['Container', { displayName: 'Container', builtin: 'Container' }],
  ['TextField', { displayName: 'TextField', builtin: 'TextField' }],
  ['Typography', { displayName: 'Typography', builtin: 'Typography' }],
  ['Select', { displayName: 'Select', builtin: 'Select' }],
  ['Paper', { displayName: 'Paper', builtin: 'Paper' }],
  ['CustomLayout', { displayName: 'CustomLayout', builtin: 'CustomLayout' }],
]);

function createCodeComponent(
  appId: string,
  version: VersionOrPreview,
  domNode: appDom.CodeComponentNode,
): ToolpadComponentDefinition {
  return {
    displayName: domNode.name,
    codeComponentId: domNode.id,
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
): ToolpadComponentDefinition | null {
  const component = components[componentId];
  return component || null;
}
