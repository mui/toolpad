import { asArray } from '@mui/toolpad-core/utils/collections';
import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import AppCanvas, { AppCanvasProps } from '../../src/canvas';

export const getServerSideProps: GetServerSideProps<AppCanvasProps> = async ({ query }) => {
  const [appId] = asArray(query.path);
  return {
    props: {
      basename: `/app-canvas/${appId}`,
    },
  };
};

const App: NextPage<AppCanvasProps> = (props) => <AppCanvas {...props} />;

export default App;
