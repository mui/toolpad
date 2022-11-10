import * as appDom from './appDom';
import { RuntimeData } from './types';

export interface CreateRuntimeDataParams {
  appId: string;
  dom: appDom.AppDom;
}

export default function createRuntimeData({ appId, dom }: CreateRuntimeDataParams): RuntimeData {
  return {
    appId,
    dom: appDom.createRenderTree(dom),
  };
}
