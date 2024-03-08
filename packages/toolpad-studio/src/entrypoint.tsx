import Button from '@mui/material/Button';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ToolpadComponents } from '@toolpad/studio-runtime';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box } from '@mui/material';
import { RuntimeState } from './runtime/types';
import {
  AppHost,
  AppHostContext,
  ToolpadApp as RuntimeToolpadApp,
  ToolpadAppProps,
  componentsStore,
  pageComponentsStore,
} from './runtime';

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

interface RootProps {
  initialState: RuntimeState;
  base: string;
  ToolpadApp: React.ComponentType<ToolpadAppProps>;
}

const IS_RENDERED_IN_CANVAS =
  typeof window === 'undefined'
    ? false
    : !!(window.frameElement as HTMLIFrameElement)?.dataset?.toolpadCanvas;

const appHost: AppHost = {
  isPreview: IS_PREVIEW,
  isCustomServer: IS_CUSTOM_SERVER,
  isCanvas: IS_RENDERED_IN_CANVAS,
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
