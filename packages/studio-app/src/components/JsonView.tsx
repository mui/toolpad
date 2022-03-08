import { Box } from '@mui/material';
import * as React from 'react';

// react-json-view uses `document` in the top-level scope, so can't be used in SSR context
const ReactJsonView = React.lazy(() => import('react-json-view'));

export interface JsonViewProps {
  src: unknown;
}

export default function JsonView({ src }: JsonViewProps) {
  return src && typeof src === 'object' ? (
    <React.Suspense fallback={<Box />}>
      <ReactJsonView name={false} src={src} />
    </React.Suspense>
  ) : (
    <pre>{JSON.stringify(src)}</pre>
  );
}
