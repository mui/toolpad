import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import invariant from 'invariant';
import Toolpad from './Toolpad';
import { APP_URL_WINDOW_PROPERTY } from '../constants';

declare global {
  interface Window {
    [APP_URL_WINDOW_PROPERTY]?: string;
  }
}

const appUrl = window[APP_URL_WINDOW_PROPERTY];

function Main() {
  invariant(appUrl, 'Missing app url');
  return <Toolpad appUrl={appUrl} basename="/_toolpad" />;
}

const container = document.getElementById('root');
invariant(container, 'Missing root element');
const root = ReactDOM.createRoot(container);
root.render(<Main />);
