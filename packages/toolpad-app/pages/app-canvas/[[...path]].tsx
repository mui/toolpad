import type { NextPage } from 'next';
import * as React from 'react';
import AppCanvas from '../../src/canvas';
import loadComponents from '../../src/runtime/loadDomComponents';

const App: NextPage<{}> = (props) => (
  <AppCanvas {...props} loadComponents={loadComponents} basename="/app-canvas" />
);

export default App;
