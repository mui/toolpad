import Button from '@mui/material/Button';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToolpadComponents } from '@mui/toolpad-core';
import RuntimeToolpadApp, { ToolpadAppProps } from './index';
import { RuntimeState } from '../types';

export interface InitParams {
  components: ToolpadComponents;
  initialState: RuntimeState;
  base: string;
  ToolpadApp?: React.ComponentType<ToolpadAppProps>;
}

export function init({
  ToolpadApp = RuntimeToolpadApp,
  components,
  initialState,
  base,
}: InitParams) {
  const loadComponents = async () => components;
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
      <Button sx={{ display: 'none' }} />
      <ToolpadApp
        basename={base}
        version="development"
        state={initialState}
        loadComponents={loadComponents}
      />
    </React.StrictMode>,
  );
}
