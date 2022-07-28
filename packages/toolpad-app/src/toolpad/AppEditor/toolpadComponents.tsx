import * as React from 'react';
import * as appDom from '../../appDom';
import {
  getToolpadComponent,
  getToolpadComponents,
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../toolpadComponents';

export function useToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinitions {
  return React.useMemo(() => getToolpadComponents(dom), [dom]);
}

export function useToolpadComponent(
  dom: appDom.AppDom,
  id: string,
): ToolpadComponentDefinition | null {
  const components = useToolpadComponents(dom);
  return React.useMemo(() => getToolpadComponent(components, id), [components, id]);
}
