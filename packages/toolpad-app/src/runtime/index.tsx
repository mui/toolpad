import Button from '@mui/material/Button';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ToolpadComponents } from '@mui/toolpad-core';
import { Emitter } from '@mui/toolpad-utils/events';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box } from '@mui/material';
import RuntimeToolpadApp, { ToolpadAppProps } from './ToolpadApp';
import { RuntimeState } from './types';

let componentsStore: ToolpadComponents = {};
const events = new Emitter<{ update: {} }>();

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
  componentsStore = newComponents;
  events.emit('update', {});
}

const subscribe = (cb: () => void) => events.subscribe('update', cb);
const getSnapshot = () => componentsStore;

function useComponents() {
  return React.useSyncExternalStore(subscribe, getSnapshot);
}

export interface RootProps {
  initialState: RuntimeState;
  base: string;
  ToolpadApp: React.ComponentType<ToolpadAppProps>;
}

function Root({ ToolpadApp, initialState, base }: RootProps) {
  const components = useComponents();
  return (
    <React.StrictMode>
      <CacheProvider value={cache}>
        {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
        <Button sx={{ display: 'none' }} />
        <ToolpadApp basename={base} state={initialState} extraComponents={components} />
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
