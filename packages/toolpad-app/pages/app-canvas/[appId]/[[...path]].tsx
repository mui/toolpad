import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { asArray } from '../../../src/utils/collections';
import AppCanvas, { AppCanvasProps } from '../../../src/runtime/AppCanvas';

export const getServerSideProps: GetServerSideProps<AppCanvasProps> = async (context) => {
  const [appId] = asArray(context.query.appId);

  if (!appId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      appId,
      basename: `/app-canvas/${appId}`,
    },
  };
};

const App: NextPage<AppCanvasProps> = (props) => <AppCanvas {...props} />;
export default App;
