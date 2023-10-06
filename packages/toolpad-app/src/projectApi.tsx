import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { ApiClient, createRpcApi } from './rpcClient';
import type { ServerDefinition } from './server/rpcServer';
import { useNonNullableContext } from '../../toolpad-utils/dist/react';
import { projectEvents } from './projectEvents';

const ApiContext = React.createContext<ApiClient<ServerDefinition> | null>(null);

export interface ApiProviderProps {
  url: string;
  children: React.ReactNode;
}

export function ApiProvider({ url, children }: ApiProviderProps) {
  const queryClient = useQueryClient();

  const api = React.useMemo(
    () => createRpcApi<ServerDefinition>(queryClient, url),
    [queryClient, url],
  );

  React.useEffect(() => {
    const unsubExternalChange = projectEvents.subscribe('externalChange', () => {
      api.invalidateQueries('loadDom', []);
    });

    const unsubFunctionsChanged = projectEvents.subscribe('functionsChanged', () => {
      api.invalidateQueries('introspect', []);
    });

    return () => {
      unsubExternalChange();
      unsubFunctionsChanged();
    };
  }, [api]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useProjectApi() {
  return useNonNullableContext(ApiContext);
}
