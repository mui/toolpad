import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import invariant from 'invariant';
import Toolpad from './Toolpad';
import { queryClient } from '../api';

function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toolpad basename="/_toolpad" />
    </QueryClientProvider>
  );
}

const container = document.getElementById('root');
invariant(container, 'Missing root element');
const root = ReactDOM.createRoot(container);
root.render(<Main />);
