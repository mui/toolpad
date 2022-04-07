import { Box } from '@mui/material';
import * as React from 'react';
import { CollapsedFieldProps } from 'react-json-view';

// react-json-view uses `document` in the top-level scope, so can't be used in SSR context
const ReactJsonView = React.lazy(() => import('react-json-view'));

export interface JsonViewProps {
  src: unknown;
}

function shouldCollapse({ name }: CollapsedFieldProps) {
  // Assume the parent is an array when the property name is numerical and only expand first 5 items
  const index = Number(name);
  if (Number.isNaN(index)) {
    return false;
  }
  return index > 5;
}

export default function JsonView({ src }: JsonViewProps) {
  console.log(src);
  return src && typeof src === 'object' ? (
    <React.Suspense fallback={<Box />}>
      <ReactJsonView name={false} src={src} shouldCollapse={shouldCollapse} />
    </React.Suspense>
  ) : (
    <pre>{src === undefined ? 'undefined' : JSON.stringify(src)}</pre>
  );
}
