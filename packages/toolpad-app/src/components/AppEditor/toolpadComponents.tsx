import * as React from 'react';
import * as appDom from '../../appDom';

import { useAppEditorContext } from './AppEditorContext';
import { getToolpadComponent, getToolpadComponents } from '../../toolpadComponents';
import {
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../toolpadComponents/componentDefinition';

export function useToolpadComponents(dom: appDom.AppDom): ToolpadComponentDefinitions {
  const { id: appId } = useAppEditorContext();
  return React.useMemo(() => getToolpadComponents(appId, dom), [appId, dom]);
}

export function useToolpadComponent(dom: appDom.AppDom, id: string): ToolpadComponentDefinition {
  const components = useToolpadComponents(dom);
  return React.useMemo(() => getToolpadComponent(components, id), [components, id]);
}
