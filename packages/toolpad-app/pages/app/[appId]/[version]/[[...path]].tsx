import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { asArray } from '../../../../src/utils/collections';
import ToolpadApp, { ToolpadAppProps } from '../../../../src/runtime/ToolpadApp';
import { createRenderTree } from '../../../../src/appDom';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const { loadDom, parseVersion } = await import('../../../../src/server/data');

  const [appId] = asArray(context.query.appId);
  const version = parseVersion(context.query.version);
  if (!appId || !version) {
    return {
      notFound: true,
    };
  }

  const dom = await loadDom(appId, version);

  return {
    props: {
      appId,
      dom: createRenderTree(dom),
      version,
      basename: `/app/${appId}/${version}`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
