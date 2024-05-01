import { errorFrom } from '@toolpad/utils/errors';
import { createApi } from './api';

export function createRemoteFunction(functionFile: string, functionName: string) {
  const runtimeApi = createApi(`${process.env.BASE_URL}/api/runtime-rpc`);

  return async function remote(...params: any[]) {
    const { data, error } = await runtimeApi.methods.execFunction(
      functionFile,
      functionName,
      params,
    );
    if (error) {
      throw errorFrom(error);
    }
    return data;
  };
}

export { default as ToolpadApp, RenderedPage, type ToolpadAppProps } from './ToolpadApp';

export { componentsStore } from './globalState';

export { CanvasHooksContext, type CanvasHooks } from './CanvasHooksContext';

export { type RuntimeState } from './types';
