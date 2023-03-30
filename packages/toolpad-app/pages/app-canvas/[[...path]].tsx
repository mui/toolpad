import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import AppCanvas, { AppCanvasProps } from '../../src/canvas';

export const getServerSideProps: GetServerSideProps<AppCanvasProps> = async () => {
  return {
    props: {
      basename: `/app-canvas`,
    },
  };
};

const App: NextPage<AppCanvasProps> = (props) => <AppCanvas {...props} />;

export default App;
