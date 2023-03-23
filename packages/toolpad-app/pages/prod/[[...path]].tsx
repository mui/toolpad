import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import ToolpadApp, { ToolpadAppProps } from '../../src/runtime/ToolpadApp';
import config from '../../src/config';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async () => {
  const { loadRuntimeState } = await import('../../src/server/data');

  if (config.cmd !== 'start') {
    return {
      notFound: true,
    };
  }

  // TODO: iframes should be disallowed by default.
  // if (!allowIframes) {
  //   context.res.setHeader('X-Frame-Options', 'DENY');
  // }

  const state = await loadRuntimeState();

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
