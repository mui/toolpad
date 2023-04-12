import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import ToolpadApp from '../../src/runtime/ToolpadApp';
import config from '../../src/config';
import { RuntimeState } from '../../src/types';
import loadComponents from '../../src/runtime/loadDomComponents';

interface ProdPageProps {
  state: RuntimeState;
}

export const getServerSideProps: GetServerSideProps<ProdPageProps> = async () => {
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
    },
  };
};

const App: NextPage<ProdPageProps> = (props) => (
  <ToolpadApp {...props} loadComponents={loadComponents} version={0} basename="/prod" />
);
export default App;
