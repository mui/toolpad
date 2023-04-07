import Button from '@mui/material/Button';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToolpadComponents } from '@mui/toolpad-core';
import ToolpadApp from './index';
import { RuntimeState } from '../types';

export function init(components: ToolpadComponents, initialState: RuntimeState) {
  const loadComponents = async () => components;
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
      <Button sx={{ display: 'none' }} />
      <ToolpadApp
        basename="/app"
        version="development"
        state={initialState}
        loadComponents={loadComponents}
      />
    </React.StrictMode>,
  );
}
