import { initialize as initializeDevtoolsBackend } from 'react-devtools-inline/backend';
import { StudioEditorRuntimeBridge } from '../src/types';
import { createBridge } from './studioEditorRuntimeBridge';

declare global {
  interface Window {
    __STUDIO?: StudioEditorRuntimeBridge;
  }
}

initializeDevtoolsBackend(window);

const studioRoot = document.getElementById('root');

if (studioRoot) {
  // eslint-disable-next-line no-underscore-dangle
  window.__STUDIO = createBridge(window, studioRoot);
} else {
  console.error(`Can't initialize studio bridge, missing app root`);
}
