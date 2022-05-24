import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { asArray } from '../../../src/utils/collections';
import ToolpadApp, { ToolpadAppProps } from '../../../src/runtime/ToolpadApp';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const { loadVersionedDom, findActiveDeployment } = await import('../../../src/server/data');

  const [appId] = asArray(context.query.appId);

  if (!appId) {
    return {
      notFound: true,
    };
  }

  const activeDeployment = await findActiveDeployment(appId);

  if (!activeDeployment) {
    return {
      notFound: true,
    };
  }

  const { version } = activeDeployment;

  const dom = await loadVersionedDom(appId, version);

  return {
    props: {
      appId,
      dom,
      version,
      basename: `/deploy/${appId}`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
