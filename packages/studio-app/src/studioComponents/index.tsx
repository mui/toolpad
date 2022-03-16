import * as React from 'react';
import { capitalize } from 'lodash';
import * as studioDom from '../studioDom';

import CustomLayout from './CustomLayout';
import Button from './Button';
import Container from './Container';
import DataGrid from './DataGrid';
import Paper from './Paper';
import Stack from './Stack';
import Typography from './Typography';
import TextField from './TextField';
import Select from './Select';
import PageRow from './PageRow';
import { RenderComponent, StudioComponentDefinition } from './studioComponentDefinition';

// TODO: bring these back to @mui/studio repo and make them import @mui/material
const INTERNAL_COMPONENTS = new Map<string, StudioComponentDefinition>([
  ['PageRow', PageRow],
  ['Button', Button],
  ['DataGrid', DataGrid],
  ['Paper', Paper],
  ['Container', Container],
  ['Stack', Stack],
  ['TextField', TextField],
  ['Typography', Typography],
  ['CustomLayout', CustomLayout],
  ['Select', Select],
]);

function codeComponentRenderer(moduleName: string, suggestedLocalName: string): RenderComponent {
  return (ctx, node, resolvedProps) => {
    const localName = ctx.addCodeComponentImport(moduleName, suggestedLocalName);
    return `<${localName} ${ctx.renderProps(resolvedProps)} />`;
  };
}

function createCodeComponent(
  domNode: studioDom.StudioCodeComponentNode,
): StudioComponentDefinition {
  return {
    id: `codeComponent.${domNode.id}`,
    displayName: domNode.name,
    argTypes: domNode.attributes.argTypes.value,
    render: codeComponentRenderer(`../components/${domNode.id}.tsx`, capitalize(domNode.name)),
  };
}

export function getStudioComponents(dom: studioDom.StudioDom): StudioComponentDefinition[] {
  const app = studioDom.getApp(dom);
  const { codeComponents = [] } = studioDom.getChildNodes(dom, app);
  return [
    ...INTERNAL_COMPONENTS.values(),
    ...codeComponents.map((studioCodeComponent) => createCodeComponent(studioCodeComponent)),
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
  const { codeComponents = [] } = studioDom.getChildNodes(dom, app);
  const nodeId = componentId.split('.')[1];
  const domNode = codeComponents.find((node) => node.id === nodeId);

  if (domNode) {
    return createCodeComponent(domNode);
  }

  throw new Error(`Invariant: Accessing unknown component "${componentId}"`);
}

export function useStudioComponents(dom: studioDom.StudioDom): StudioComponentDefinition[] {
  return React.useMemo(() => getStudioComponents(dom), [dom]);
}

export function useStudioComponent(
  dom: studioDom.StudioDom,
  id: string,
): StudioComponentDefinition {
  return React.useMemo(() => getStudioComponent(dom, id), [dom, id]);
}
