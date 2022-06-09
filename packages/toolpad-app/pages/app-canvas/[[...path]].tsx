import type { NextPage } from 'next';
import * as React from 'react';
import AppCanvas, { AppCanvasProps } from '../../src/runtime/AppCanvas';

const App: NextPage<AppCanvasProps> = () => <AppCanvas basename="/app-canvas" />;
export default App;
