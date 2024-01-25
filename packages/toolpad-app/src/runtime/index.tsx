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
import { RuntimeState } from './types';
import { AppHostContext } from './AppHostContext';

const IS_PREVIEW = process.env.NODE_ENV !== 'production';
const IS_CUSTOM_SERVER = process.env.TOOLPAD_CUSTOM_SERVER === 'true';

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
}

const appHost = {
  isPreview: IS_PREVIEW,
  isCustomServer: IS_CUSTOM_SERVER,
};

function Root({ ToolpadApp, initialState, base }: RootProps) {
  return (
    <React.StrictMode>
      <CacheProvider value={cache}>
        {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
        <Button sx={{ display: 'none' }} />
        <AppHostContext.Provider value={appHost}>
          <ToolpadApp basename={base} state={initialState} />
        </AppHostContext.Provider>
        <Box data-testid="page-ready-marker" sx={{ display: 'none' }} />
      </CacheProvider>
    </React.StrictMode>
  );
}

export interface InitParams {
  initialState: RuntimeState;
  base: string;
  ToolpadApp?: React.ComponentType<ToolpadAppProps>;
}

export function init({ ToolpadApp = RuntimeToolpadApp, initialState, base }: InitParams) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Root base={base} ToolpadApp={ToolpadApp} initialState={initialState} />,
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
