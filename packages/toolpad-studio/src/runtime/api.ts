import * as React from 'react';
import { queryClient } from '@toolpad/studio-runtime';
// TODO: move this rpc logic to @mui/utils
// eslint-disable-next-line import/no-restricted-paths
import { ApiClient, createRpcApi } from '../rpcClient';

// eslint-disable-next-line import/no-restricted-paths
import type { ServerDefinition } from '../server/runtimeRpcServer';

export function createApi(url: string) {
  return createRpcApi<ServerDefinition>(queryClient, new URL(url, window.location.href));
}

export const RuntimeApiContext = React.createContext<ApiClient<ServerDefinition> | null>(null);
