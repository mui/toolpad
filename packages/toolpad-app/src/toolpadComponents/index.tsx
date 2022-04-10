import * as React from 'react';
import { capitalize } from 'lodash';
import * as appDom from '../appDom';

import Button from './Button';
import Container from './Container';
import DataGrid from './DataGrid';
import Typography from './Typography';
import TextField from './TextField';
import Select from './Select';
import PageRow from './PageRow';
import { ToolpadComponentDefinition } from './componentDefinition';
import CustomLayout from './CustomLayout';
import Paper from './Paper';
import Stack from './Stack';

// TODO: bring these back to @mui/toolpad repo and make them import @mui/material
const INTERNAL_COMPONENTS = new Map<string, ToolpadComponentDefinition>([
  ['PageRow', PageRow],
  ['Stack', Stack],
  ['Button', Button],
  ['DataGrid', DataGrid],
  ['Container', Container],
  ['TextField', TextField],
  ['Typography', Typography],
  ['Select', Select],
  ['Paper', Paper],
  ['CustomLayout', CustomLayout],
]);

function createCodeComponent(domNode: appDom.CodeComponentNode): ToolpadComponentDefinition {
  return {
    displayName: domNode.name,
    argTypes: domNode.attributes.argTypes.value,
    importedModule: `../components/${domNode.id}.tsx`,
    importedName: capitalize(domNode.name),
    codeComponent: true,
  };
}

export function getToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinition[] {
  const app = appDom.getApp(dom);
  const { codeComponents = [] } = appDom.getChildNodes(dom, app);
  return [
    ...INTERNAL_COMPONENTS.values(),
    ...codeComponents.map((codeComponent) => createCodeComponent(codeComponent)),
  ];
}

export function getToolpadComponent(
  dom: appDom.AppDom,
  componentId: string,
): ToolpadComponentDefinition {
  const component = INTERNAL_COMPONENTS.get(componentId);

  if (component) {
    return component;
  }

  const app = appDom.getApp(dom);
  const { codeComponents = [] } = appDom.getChildNodes(dom, app);
  const nodeId = componentId.split('.')[1];
  const domNode = codeComponents.find((node) => node.id === nodeId);

  if (domNode) {
    return createCodeComponent(domNode);
  }

  throw new Error(`Invariant: Accessing unknown component "${componentId}"`);
}

export function useToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinition[] {
  return React.useMemo(() => getToolpadComponents(dom), [dom]);
}

export function useToolpadComponent(dom: appDom.AppDom, id: string): ToolpadComponentDefinition {
  return React.useMemo(() => getToolpadComponent(dom, id), [dom, id]);
}
