import * as appDom from './appDom';
import { RuntimeState } from './types';

export interface CreateRuntimeDataParams {
  appId: string;
  dom: appDom.AppDom;
}

export default function createRuntimeData({ appId, dom }: CreateRuntimeDataParams): RuntimeState {
  return {
    appId,
    dom: appDom.createRenderTree(dom),
  };
}
