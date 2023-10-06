import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import invariant from 'invariant';
import Toolpad from './Toolpad';

function Main() {
  return <Toolpad basename="/_toolpad" />;
}

const container = document.getElementById('root');
invariant(container, 'Missing root element');
const root = ReactDOM.createRoot(container);
root.render(<Main />);
