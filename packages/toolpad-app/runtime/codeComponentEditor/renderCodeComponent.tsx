import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HTML_ID_APP_ROOT } from '../../src/constants';
import CodeComponentSandbox from './CodeComponentSandbox';

export default function renderToolpadApp() {
  const container = document.getElementById(HTML_ID_APP_ROOT);
  if (!container) {
    throw new Error(`Can't locate app container #${HTML_ID_APP_ROOT}`);
  }
  const root = createRoot(container);

  root.render(<CodeComponentSandbox />);
}
