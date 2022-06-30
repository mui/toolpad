import { NoSsr } from '@mui/material';
import type { NextPage } from 'next';
import * as React from 'react';
import MonacoEditor from '../src/components/MonacoEditor';

const Index: NextPage = () => (
  <div style={{ height: '100vh', position: 'relative' }}>
    <NoSsr>
      <React.Suspense fallback={'sus'}>
        <MonacoEditor />
      </React.Suspense>
    </NoSsr>
  </div>
);
export default Index;
