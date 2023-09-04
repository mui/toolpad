import { QueryClient } from '@tanstack/react-query';
import { createRpcApi } from './rpcClient';
import type { ServerDefinition } from './server/rpcServer';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

export default createRpcApi<ServerDefinition>(queryClient, '/api/rpc');
