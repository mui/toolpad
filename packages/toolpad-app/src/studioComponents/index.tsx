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
import { RenderComponent, StudioComponentDefinition } from './studioComponentDefinition';
import CustomLayout from './CustomLayout';
import Paper from './Paper';
import Stack from './Stack';

// TODO: bring these back to @mui/toolpad repo and make them import @mui/material
const INTERNAL_COMPONENTS = new Map<string, StudioComponentDefinition>([
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

function codeComponentRenderer(moduleName: string, suggestedLocalName: string): RenderComponent {
  return (ctx, node, resolvedProps) => {
    const localName = ctx.addCodeComponentImport(moduleName, suggestedLocalName);
    return `<${localName} ${ctx.renderProps(resolvedProps)} />`;
  };
}

function createCodeComponent(domNode: appDom.CodeComponentNode): StudioComponentDefinition {
  return {
    id: `codeComponent.${domNode.id}`,
    displayName: domNode.name,
    argTypes: domNode.attributes.argTypes.value,
    render: codeComponentRenderer(`../components/${domNode.id}.tsx`, capitalize(domNode.name)),
  };
}

export function getStudioComponents(dom: appDom.AppDom): StudioComponentDefinition[] {
  const app = appDom.getApp(dom);
  const { codeComponents = [] } = appDom.getChildNodes(dom, app);
  return [
    ...INTERNAL_COMPONENTS.values(),
    ...codeComponents.map((studioCodeComponent) => createCodeComponent(studioCodeComponent)),
  ];
}

export function getStudioComponent(
  dom: appDom.AppDom,
  componentId: string,
): StudioComponentDefinition {
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

export function useStudioComponents(dom: appDom.AppDom): StudioComponentDefinition[] {
  return React.useMemo(() => getStudioComponents(dom), [dom]);
}

export function useStudioComponent(dom: appDom.AppDom, id: string): StudioComponentDefinition {
  return React.useMemo(() => getStudioComponent(dom, id), [dom, id]);
}
