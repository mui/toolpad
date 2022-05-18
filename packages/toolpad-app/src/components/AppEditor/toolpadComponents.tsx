import * as React from 'react';
import * as appDom from '../../appDom';

import { useAppEditorContext } from './AppEditorContext';
import {
  getToolpadComponent,
  getToolpadComponents,
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../toolpadComponents';

export function useToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinitions {
  const { id: appId, version } = useAppEditorContext();
  return React.useMemo(() => getToolpadComponents(appId, version, dom), [appId, version, dom]);
}

export function useToolpadComponent(
  dom: appDom.AppDom,
  id: string,
): ToolpadComponentDefinition | null {
  const components = useToolpadComponents(dom);
  return React.useMemo(() => getToolpadComponent(components, id), [components, id]);
}
