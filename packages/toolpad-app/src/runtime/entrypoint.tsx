import Button from '@mui/material/Button';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToolpadComponents } from '@mui/toolpad-core';
import Emitter from '@mui/toolpad-core/utils/Emitter';
import RuntimeToolpadApp, { ToolpadAppProps } from './index';
import { RuntimeState } from '../types';

let componentsStore: ToolpadComponents = {};
const events = new Emitter<{ update: {} }>();

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
  const loadComponents = React.useMemo(() => async () => components, [components]);
  return (
    <React.StrictMode>
      {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
      <Button sx={{ display: 'none' }} />
      <ToolpadApp
        basename={base}
        version="development"
        state={initialState}
        loadComponents={loadComponents}
      />
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
