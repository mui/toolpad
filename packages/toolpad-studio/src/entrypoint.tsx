import Button from '@mui/material/Button';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { AppHostProvider, ToolpadComponents } from '@toolpad/studio-runtime';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box } from '@mui/material';
import { ToolpadPlan } from '@toolpad/studio-runtime/appDom';
import { RuntimeState } from './runtime/types';
import { ToolpadApp as RuntimeToolpadApp, ToolpadAppProps, componentsStore } from './runtime';

const IS_PREVIEW = process.env.NODE_ENV !== 'production';

const TOOLPAD_PLAN = process.env.TOOLPAD_PLAN as ToolpadPlan;

const cache = createCache({
  key: 'css',
  prepend: true,
});

// See https://github.com/emotion-js/emotion/issues/1105#issuecomment-1058225197
cache.compat = true;

/**
 * This allows us to hot update the components when a file is added/removed
 */
export function setComponents(newComponents: ToolpadComponents) {
  componentsStore.setState(newComponents);
}

interface RootProps {
  initialState: RuntimeState;
  base: string;
  ToolpadApp: React.ComponentType<ToolpadAppProps>;
}

function Root({ ToolpadApp, initialState, base }: RootProps) {
  return (
    <React.StrictMode>
      <CacheProvider value={cache}>
        {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
        <Button sx={{ display: 'none' }} />
        <AppHostProvider isPreview={IS_PREVIEW} plan={TOOLPAD_PLAN}>
          <ToolpadApp basename={base} state={initialState} />
        </AppHostProvider>
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
