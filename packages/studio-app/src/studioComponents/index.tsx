import * as React from 'react';
import * as studioDom from '../studioDom';
import { StudioComponentDefinition } from '../types';
import importedComponentRenderer from './importedComponentRenderer';

import CustomLayout from './CustomLayout';
import Button from './Button';
import DataGrid from './DataGrid';
import Paper from './Paper';
import Stack from './Stack';
import Typography from './Typography';
import TextField from './TextField';
import Select from './Select';

// TODO: bring these back to @mui/studio repo and make them import @mui/material
const INTERNAL_COMPONENTS = new Map<string, StudioComponentDefinition>([
  ['Button', Button],
  ['DataGrid', DataGrid],
  ['Paper', Paper],
  ['Stack', Stack],
  ['TextField', TextField],
  ['Typography', Typography],
  ['CustomLayout', CustomLayout],
  ['Select', Select],
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

export function useStudioComponents(dom: studioDom.StudioDom): StudioComponentDefinition[] {
  return React.useMemo(() => getStudioComponents(dom), [dom]);
}

export function useStudioComponent(
  dom: studioDom.StudioDom,
  id: string,
): StudioComponentDefinition {
  return React.useMemo(() => getStudioComponent(dom, id), [dom, id]);
}
