import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import ToolpadApp from '../../src/runtime/ToolpadApp';
import config from '../../src/config';
import { RuntimeState } from '../../src/types';
import loadComponents from '../../src/runtime/loadDomComponents';

interface PreviewPageProps {
  state: RuntimeState;
}

export const getServerSideProps: GetServerSideProps<PreviewPageProps> = async () => {
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
    },
  };
};

const App: NextPage<PreviewPageProps> = (props) => (
  <ToolpadApp {...props} loadComponents={loadComponents} basename="/preview" version="preview" />
);
export default App;
