import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import invariant from 'invariant';
import Toolpad from './Toolpad';
// TODO: move to components/HarViewer after migrating away from Next.js
import 'perf-cascade/dist/perf-cascade.css';

function Main() {
  return <Toolpad basename="/_toolpad" />;
}

const container = document.getElementById('root');
invariant(container, 'Missing root element');
const root = ReactDOM.createRoot(container);
root.render(<Main />);
