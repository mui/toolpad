import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { asArray } from '../../../../src/utils/collections';
import ToolpadApp, { ToolpadAppProps } from '../../../../src/runtime/ToolpadApp';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const { loadRuntimeState, parseVersion, getApp } = await import(
    '../../../../src/server/prismaDataApi'
  );

  const [appId] = asArray(context.query.appId);
  const version = parseVersion(context.query.version);
  const app = appId ? await getApp(appId) : null;
  if (!appId || !app || !version) {
    return {
      notFound: true,
    };
  }

  const state = await loadRuntimeState(appId, version);

  return {
    props: {
      state,
      version,
      basename: `/app/${appId}/${version}`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
