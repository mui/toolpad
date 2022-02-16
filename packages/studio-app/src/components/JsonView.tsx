import * as React from 'react';
import dynamic from 'next/dynamic';

// react-json-view uses `document` in the top-level scope, so can't be used in SSR context
const ReactJsonView = dynamic(() => import('react-json-view'), { ssr: false });

export interface JsonViewProps {
  src: unknown;
}

export default function JsonView({ src }: JsonViewProps) {
  return src && typeof src === 'object' ? (
    <ReactJsonView name={false} src={src} />
  ) : (
    <pre>{JSON.stringify(src)}</pre>
  );
}
