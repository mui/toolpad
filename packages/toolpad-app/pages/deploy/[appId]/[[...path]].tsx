import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { asArray } from '../../../src/utils/collections';
import ToolpadApp, { ToolpadAppProps } from '../../../src/runtime/ToolpadApp';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const [
    { loadRenderTree, findActiveDeployment, getApp },
    { checkBasicAuth, basicAuthUnauthorized },
  ] = await Promise.all([
    import('../../../src/server/data'),
    import('../../../src/server/basicAuth'),
  ]);

  const [appId] = asArray(context.query.appId);

  if (!appId) {
    return {
      notFound: true,
    };
  }

  const app = await getApp(appId);
  if (!app) {
    return {
      notFound: true,
    };
  }

  if (!app.public) {
    if (!checkBasicAuth(context.req)) {
      basicAuthUnauthorized(context.res);
      // This will never be reached, but let's return this to satisfy the type system
      return { notFound: true };
    }
  }

  const activeDeployment = await findActiveDeployment(appId);

  if (!activeDeployment) {
    return {
      notFound: true,
    };
  }

  const { version } = activeDeployment;

  const dom = await loadRenderTree(appId, version);

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
