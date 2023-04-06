import Button from '@mui/material/Button';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ToolpadApp from './index';
import { RuntimeState } from '../types';

export function init(initialState: RuntimeState) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      {/* For some reason this helps with https://github.com/vitejs/vite/issues/12423 */}
      <Button sx={{ display: 'none' }} />
      <ToolpadApp basename="/app" version="development" state={initialState} />
    </React.StrictMode>,
  );
}
