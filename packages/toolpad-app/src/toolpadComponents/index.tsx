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
import { ToolpadComponentDefinition, ToolpadComponentDefinitions } from './componentDefinition';
import CustomLayout from './CustomLayout';
import Paper from './Paper';
import Image from './Image';
import Stack from './Stack';
import { useAppEditorContext } from '../components/AppEditor/AppEditorContext';

// TODO: bring these back to @mui/toolpad repo and make them import @mui/material
const INTERNAL_COMPONENTS = new Map<string, ToolpadComponentDefinition>([
  ['PageRow', PageRow],
  ['Stack', Stack],
  ['Button', Button],
  ['Image', Image],
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

export function getToolpadComponents(
  appId: string,
  dom: appDom.AppDom,
): ToolpadComponentDefinitions {
  const app = appDom.getApp(dom);
  const { codeComponents = [] } = appDom.getChildNodes(dom, app);
  return Object.fromEntries([
    ...INTERNAL_COMPONENTS.entries(),
    ...codeComponents.map((codeComponent) => [
      `codeComponent.${codeComponent.id}`,
      createCodeComponent(codeComponent),
    ]),
  ]);
}

export function getToolpadComponent(
  appId: string,
  dom: appDom.AppDom,
  componentId: string,
): ToolpadComponentDefinition {
  const components = getToolpadComponents(appId, dom);
  const component = components[componentId];

  if (component) {
    return component;
  }

  throw new Error(`Invariant: Accessing unknown component "${componentId}"`);
}

export function useToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinitions {
  const { id: appId } = useAppEditorContext();
  return React.useMemo(() => getToolpadComponents(appId, dom), [appId, dom]);
}

export function useToolpadComponent(dom: appDom.AppDom, id: string): ToolpadComponentDefinition {
  const { id: appId } = useAppEditorContext();
  return React.useMemo(() => getToolpadComponent(appId, dom, id), [appId, dom, id]);
}
