import * as appDom from '@mui/toolpad-studio-core/appDom';
import { RuntimeState } from './types';

export interface CreateRuntimeStateParams {
  dom: appDom.AppDom;
}

export default function createRuntimeState({ dom }: CreateRuntimeStateParams): RuntimeState {
  return {
    dom: appDom.createRenderTree(dom),
  };
}
