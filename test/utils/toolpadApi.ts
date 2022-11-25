import './fetchPolyfill';
import { createRpcClient } from '../../packages/toolpad-app/src/rpcClient';
import type { ServerDefinition } from '../../packages/toolpad-app/pages/api/rpc';
import generateId from './generateId';
import type { CreateAppOptions } from '../../packages/toolpad-app/src/server/data';

export function getApi(endpoint: string) {
  return createRpcClient<ServerDefinition>(endpoint);
}

interface CreateApplicationParams {
  name?: string;
  appTemplateId?: string;
  dom?: any;
}

export async function createApplication(
  baseUrl: string,
  { name = `App ${generateId()}`, appTemplateId, dom }: CreateApplicationParams = {},
) {
  const api = getApi(new URL('/api/rpc', baseUrl).href);

  const options: CreateAppOptions = {};

  if (appTemplateId) {
    return api.mutation.createApp(name, {
      ...options,
      from: { kind: 'template', id: appTemplateId },
    });
  }

  if (dom) {
    return api.mutation.createApp(name, {
      ...options,
      from: { kind: 'dom', dom },
    });
  }

  return api.mutation.createApp(name, options);
}
