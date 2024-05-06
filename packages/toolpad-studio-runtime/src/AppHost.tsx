import * as React from 'react';
import { useNonNullableContext } from '@toolpad/utils/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToolpadPlan } from './appDom';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

export interface AppHost {
  isPreview: boolean;
  isCanvas: boolean;
  plan: ToolpadPlan;
}

export const AppHostContext = React.createContext<AppHost | null>(null);

export interface AppHostProviderProps extends Partial<AppHost> {
  children?: React.ReactNode;
}

export function AppHostProvider({
  isPreview = false,
  isCanvas = false,
  plan = 'free',
  children,
}: AppHostProviderProps) {
  const appHost = React.useMemo(() => ({ isPreview, isCanvas, plan }), [isPreview, isCanvas, plan]);
  return (
    <QueryClientProvider client={queryClient}>
      <AppHostContext.Provider value={appHost}>{children}</AppHostContext.Provider>
    </QueryClientProvider>
  );
}

export function useAppHost() {
  return useNonNullableContext(AppHostContext);
}
