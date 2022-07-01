import type { NextPage } from 'next';
import * as React from 'react';
import reactLazyNoSsr from '../src/utils/reactLazyNoSsr';

const Editor = reactLazyNoSsr(() => import('../src/components/JsonEditor'));

const Index: NextPage = () => {
  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <React.Suspense fallback="sus">
        <Editor />
      </React.Suspense>
    </div>
  );
};
export default Index;
