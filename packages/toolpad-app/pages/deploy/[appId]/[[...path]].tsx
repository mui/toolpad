import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { asArray } from '../../../src/utils/collections';
import ToolpadApp, { ToolpadAppProps } from '../../../src/runtime/ToolpadApp';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const [
    { loadRuntimeState, findActiveDeployment, getApp },
    { checkBasicAuth, basicAuthUnauthorized },
  ] = await Promise.all([
    import('../../../src/server/data'),
    import('../../../src/server/basicAuth'),
  ]);

  const [appId] = asArray(context.query.appId);
  const app = appId ? await getApp(appId) : null;

  if (!app || !appId) {
    return {
      notFound: true,
    };
  }

  // TODO: iframes should be disallowed by default.
  // if (!app.allowIframes) {
  //   context.res.setHeader('X-Frame-Options', 'DENY');
  // }

  if (!app.public) {
    if (!checkBasicAuth(context.req)) {
      basicAuthUnauthorized(context.res);
      // basicAuthUnauthorized calls res.end()
      // so the props will never be used, but let's return this to satisfy the type system
      return { props: {} as ToolpadAppProps };
    }
  }

  const activeDeployment = await findActiveDeployment(appId);

  if (!activeDeployment) {
    return {
      notFound: true,
    };
  }

  const { version } = activeDeployment;

  const state = await loadRuntimeState(appId, version);

  return {
    props: {
      state,
      version,
      basename: `/deploy/${appId}`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
