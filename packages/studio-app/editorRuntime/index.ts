import { initialize as initializeDevtoolsBackend } from 'react-devtools-inline/backend';
import { StudioBridge } from '../src/types.js';
import { createStudioBridge } from './studioBridge';

declare global {
  interface Window {
    __STUDIO?: StudioBridge;
  }
}

initializeDevtoolsBackend(window);

const studioRoot = document.getElementById('root');

if (studioRoot) {
  // eslint-disable-next-line no-underscore-dangle
  window.__STUDIO = createStudioBridge(window, studioRoot);
} else {
  console.error(`Can't initialize studio bridge, missing app root`);
}
