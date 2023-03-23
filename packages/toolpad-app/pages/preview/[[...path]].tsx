import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import ToolpadApp, { ToolpadAppProps } from '../../src/runtime/ToolpadApp';
import config from '../../src/config';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async () => {
  const { loadRuntimeState } = await import('../../src/server/data');

  if (config.cmd !== 'dev') {
    return {
      notFound: true,
    };
  }

  const state = await loadRuntimeState();

  return {
    props: {
      state,
      version: 'preview',
      basename: `/preview`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
