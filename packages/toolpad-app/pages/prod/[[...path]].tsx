import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { APP_ID_LOCAL_MARKER } from '../../src/constants';
import ToolpadApp, { ToolpadAppProps } from '../../src/runtime/ToolpadApp';
import config from '../../src/config';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async () => {
  const { loadRuntimeState } = await import('../../src/server/data');

  if (config.cmd !== 'start') {
    return {
      notFound: true,
    };
  }

  const state = await loadRuntimeState(APP_ID_LOCAL_MARKER, 0);

  return {
    props: {
      state,
      version: 0,
      basename: `/prod`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
