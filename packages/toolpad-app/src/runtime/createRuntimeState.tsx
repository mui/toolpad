import { ToolpadDataProviderIntrospection } from '@mui/toolpad-core/runtime';
import * as appDom from '../appDom';
import { RuntimeState } from '../types';

export interface CreateRuntimeStateParams {
  dom: appDom.AppDom;
  dataProviders: Record<string, ToolpadDataProviderIntrospection>;
}

export default function createRuntimeState({
  dom,
  dataProviders,
}: CreateRuntimeStateParams): RuntimeState {
  return {
    dom: appDom.createRenderTree(dom),
    dataProviders,
  };
}
