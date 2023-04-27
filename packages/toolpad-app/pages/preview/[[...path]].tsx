import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import ToolpadApp from '../../src/runtime/ToolpadApp';
import config from '../../src/config';
import { RuntimeState } from '../../src/types';
import loadComponents from '../../src/runtime/loadDomComponents';
import createRuntimeState from '../../src/createRuntimeState';

interface PreviewPageProps {
  state: RuntimeState;
}

export const getServerSideProps: GetServerSideProps<PreviewPageProps> = async () => {
  const { loadDomFromDisk } = await import('../../src/server/localMode');

  if (config.cmd !== 'dev') {
    return {
      notFound: true,
    };
  }

  const state = createRuntimeState({ dom: await loadDomFromDisk() });

  return {
    props: {
      state: JSON.parse(JSON.stringify(state)),
    },
  };
};

const App: NextPage<PreviewPageProps> = (props) => (
  <ToolpadApp {...props} loadComponents={loadComponents} basename="/preview" version="preview" />
);
export default App;
