import Button from '@mui/material/Button';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ToolpadComponents } from '@mui/toolpad-core';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box } from '@mui/material';
import { errorFrom } from '@mui/toolpad-utils/errors';
import api from './api';
import RuntimeToolpadApp, {
  ToolpadAppProps,
  componentsStore,
  pageComponentsStore,
} from './ToolpadApp';
import { PagesManifest, RuntimeState } from './types';

const cache = createCache({
  key: 'css',
  prepend: true,
});

// See https://github.com/emotion-js/emotion/issues/1105#issuecomment-1058225197
cache.compat = true;

/**
 * This allows us to hot update the components when a file is added/removed
 */
export function setComponents(
  newComponents: ToolpadComponents,
  pageComponents: Record<string, React.ComponentType>,
) {
  componentsStore.setState(newComponents);
  pageComponentsStore.setState(pageComponents);
}

export interface RootProps {
  initialState: RuntimeState;
  base: string;
  ToolpadApp: React.ComponentType<ToolpadAppProps>;
  pagesManifest: PagesManifest;
}

function Root({ ToolpadApp, initialState, base, pagesManifest }: RootProps) {
  return (
    <React.StrictMode>
      <CacheProvider value={cache}>
        {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
        <Button sx={{ display: 'none' }} />
        <ToolpadApp basename={base} state={initialState} pagesManifest={pagesManifest} />
        <Box data-testid="page-ready-marker" sx={{ display: 'none' }} />
      </CacheProvider>
    </React.StrictMode>
  );
}

export interface InitParams {
  initialState: RuntimeState;
  base: string;
  ToolpadApp?: React.ComponentType<ToolpadAppProps>;
  pagesManifest: PagesManifest;
}

export function init({
  ToolpadApp = RuntimeToolpadApp,
  initialState,
  base,
  pagesManifest,
}: InitParams) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Root
      base={base}
      ToolpadApp={ToolpadApp}
      initialState={initialState}
      pagesManifest={pagesManifest}
    />,
  );
}

export { AppLayout } from './AppLayout';

export { DomContextProvider, ComponentsContextProvider, RenderedPage } from './ToolpadApp';

export type { RuntimeState };

export function createRemoteFunction(functionFile: string, functionName: string) {
  return async function remote(...params: any[]) {
    const { data, error } = await api.methods.execFunction(functionFile, functionName, params);
    if (error) {
      throw errorFrom(error);
    }
    return data;
  };
}
