import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import ToolpadApp from '../../src/runtime/ToolpadApp';
import config from '../../src/config';
import { RuntimeState } from '../../src/types';
import loadComponents from '../../src/runtime/loadDomComponents';
import createRuntimeState from '../../src/createRuntimeState';
import * as appDom from '../../src/appDom';

interface ProdPageProps {
  state: RuntimeState;
}

let domPromise: Promise<appDom.AppDom> | undefined;
async function loadDom() {
  if (!domPromise) {
    const { loadDomFromDisk } = await import('../../src/server/localMode');
    domPromise = loadDomFromDisk();
  }
  return domPromise;
}

export const getServerSideProps: GetServerSideProps<ProdPageProps> = async () => {
  if (config.cmd !== 'start') {
    return {
      notFound: true,
    };
  }

  // TODO: iframes should be disallowed by default.
  // if (!allowIframes) {
  //   context.res.setHeader('X-Frame-Options', 'DENY');
  // }

  const state = createRuntimeState({ dom: await loadDom() });

  return {
    props: {
      state: JSON.parse(JSON.stringify(state)),
    },
  };
};

const App: NextPage<ProdPageProps> = (props) => (
  <ToolpadApp {...props} loadComponents={loadComponents} version={0} basename="/prod" />
);
export default App;
