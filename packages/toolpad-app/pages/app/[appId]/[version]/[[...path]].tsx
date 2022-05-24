import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import { VersionOrPreview } from '../../../../src/types';

import { asArray } from '../../../../src/utils/collections';
import * as appDom from '../../../../src/appDom';
import ToolpadApp from '../../../../src/runtime/ToolpadApp';
import {
  getToolpadComponents,
  ToolpadComponentDefinitions,
} from '../../../../src/toolpadComponents';

interface ToolpadAppProps {
  appId: string;
  dom: appDom.AppDom;
  version: VersionOrPreview;
  components: ToolpadComponentDefinitions;
  basename: string;
}

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const { loadVersionedDom, parseVersion } = await import('../../../../src/server/data');

  const [appId] = asArray(context.query.appId);
  const version = parseVersion(context.query.version);
  if (!appId || !version) {
    return {
      notFound: true,
    };
  }

  const dom = await loadVersionedDom(appId, version);

  const components = getToolpadComponents(appId, version, dom);

  return {
    props: {
      appId,
      dom,
      version,
      components,
      basename: `/app/${appId}/${version}`,
    },
  };
};

const App: NextPage<ToolpadAppProps> = (props) => <ToolpadApp {...props} />;
export default App;
